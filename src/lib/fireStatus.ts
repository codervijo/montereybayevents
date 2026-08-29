/**
 * Build-time read of the live fire and road feeds.
 *
 * WHY THIS EXISTS
 *
 * The volatile numbers in `src/data/traffic.ts` are typed by hand, and between
 * 25 and 28 August 2026 they went 46% wrong while the site kept rebuilding
 * cleanly every morning. The daily rebuild Worker only re-evaluates
 * `pacificToday()`; it cannot refresh a figure nobody retyped. Worse, the page
 * asserted Highway 1 was open for three days after a 40-mile stretch closed.
 *
 * So this module reads the two feeds that actually know, at BUILD time, and the
 * existing daily rebuild turns into a data refresh rather than a date refresh.
 *
 * WHAT IT DOES AND DOES NOT REPLACE
 *
 * Acreage, containment and the as-of timestamp come from CAL FIRE and are no
 * longer hand-typed. Everything else on the incident block — evacuation zones,
 * what is closed, the narrative — is not in any feed and is still written by a
 * person. This narrows the error surface; it does not remove it.
 *
 * FAILURE BEHAVIOUR: DEGRADE, NEVER THROW.
 *
 * A build that fails leaves the PREVIOUS deployment serving, which means a
 * fetch error would silently preserve exactly the stale page this module exists
 * to prevent. So every failure path returns nulls and an error string, the page
 * falls back to the hand-checked values, and it says out loud that it is doing
 * so. A visibly stale figure beats an invisible one.
 *
 * Verified 2026-08-28 from inside a real Cloudflare Pages build: both feeds
 * return 200 (479ms and 157ms). Cloudflare's build egress reaches fire.ca.gov
 * even though this operator's own IP gets 403 from it.
 */

const CALFIRE_URL =
  "https://incidents.fire.ca.gov/umbraco/api/IncidentApi/List?inactive=false";
const CALTRANS_SR1_URL = "https://roads.dot.ca.gov/roadscell.php?roadnumber=1";

const TIMEOUT_MS = 15_000;
const COUNTY = "Monterey";

/** Larger than any California wildfire on record, so a unit change reads as absurd. */
const MAX_PLAUSIBLE_ACRES = 2_000_000;

export type LiveIncident = {
  name: string;
  acres: number;
  /** Percent, 0–100. */
  containment: number;
  /** ISO 8601, as published by CAL FIRE. */
  updated: string;
};

export type FireStatus = {
  /** Null when the feed could not be read or returned nothing usable. */
  incidents: LiveIncident[] | null;
  /**
   * True when Caltrans reports a wildfire closure on Highway 1 in Monterey
   * County, false when it reports none, null when the feed could not be read.
   * `null` and `false` are different answers and must not be collapsed.
   */
  roadClosedForWildfire: boolean | null;
  /** Human-readable reasons any of the above is null. Rendered when non-empty. */
  errors: string[];
};

async function getText(url: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "user-agent": "montereybayevents.com build (+https://montereybayevents.com/)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/**
 * Bounds-check one incident. A malformed or implausible record is dropped
 * rather than published — an auto-injected number has no human between it and
 * the reader, so the only guard is refusing to believe nonsense.
 */
function toLiveIncident(raw: unknown): LiveIncident | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;

  if (String(r.County ?? "") !== COUNTY) return null;
  if (r.IsActive !== true) return null;

  const name = String(r.Name ?? "").trim();
  const acres = Number(r.AcresBurned);
  const containment = Number(r.PercentContained);
  const updated = String(r.Updated ?? "");

  if (!name) return null;
  if (!Number.isFinite(acres) || acres <= 0 || acres > MAX_PLAUSIBLE_ACRES) return null;
  if (!Number.isFinite(containment) || containment < 0 || containment > 100) return null;

  const t = Date.parse(updated);
  if (Number.isNaN(t)) return null;
  // A timestamp in the future means we are misreading the field, not that the
  // fire is ahead of us. Allow a day of clock skew, reject beyond it.
  if (t > Date.now() + 24 * 60 * 60 * 1000) return null;

  return { name, acres, containment, updated };
}

async function readCalFire(): Promise<{ incidents: LiveIncident[] | null; error?: string }> {
  try {
    const body = await getText(CALFIRE_URL);
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed)) return { incidents: null, error: "CAL FIRE feed was not a list" };

    const incidents = parsed
      .map(toLiveIncident)
      .filter((i): i is LiveIncident => i !== null)
      .sort((a, b) => b.acres - a.acres);

    if (incidents.length === 0) {
      // Genuinely possible — it means no active Monterey incident. The caller
      // decides what that means; it is not an error.
      return { incidents: [] };
    }
    return { incidents };
  } catch (err) {
    return { incidents: null, error: `CAL FIRE feed unreadable (${(err as Error).message})` };
  }
}

/**
 * Does Caltrans currently report a wildfire closure on Highway 1 in Monterey
 * County? The feed is plain text with hard line wraps, so whitespace is
 * normalised before matching and the window is bounded to keep one entry's
 * "closed" from pairing with a different entry's "wildfire".
 */
async function readCaltrans(): Promise<{ closed: boolean | null; error?: string }> {
  try {
    const body = await getText(CALTRANS_SR1_URL);
    const text = body
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ");
    const closed = /Is closed[^[]{0,400}?\(Monterey Co\)[^[]{0,200}?wildfire/i.test(text);
    return { closed };
  } catch (err) {
    return { closed: null, error: `Caltrans feed unreadable (${(err as Error).message})` };
  }
}

/**
 * Memoised for the whole build. FireAlert renders on the homepage and on every
 * Monterey event page, and without this each one would issue its own request —
 * a hundred-odd calls per build, which is both slow and rude to two public
 * agencies.
 */
let cached: Promise<FireStatus> | null = null;

export function fetchFireStatus(): Promise<FireStatus> {
  if (cached) return cached;
  cached = (async () => {
    const [fire, road] = await Promise.all([readCalFire(), readCaltrans()]);
    const errors = [fire.error, road.error].filter((e): e is string => Boolean(e));
    return {
      incidents: fire.incidents,
      roadClosedForWildfire: road.closed,
      errors,
    };
  })();
  return cached;
}

/** Test seam: drop the memo so a test can exercise more than one scenario. */
export function resetFireStatusCache(): void {
  cached = null;
}

/** "23,343 acres" — thousands separated, no rounding. */
export function formatAcres(acres: number): string {
  return `${Math.round(acres).toLocaleString("en-US")} acres`;
}

/**
 * The CAL FIRE timestamp in the reader's terms, Pacific, e.g.
 * "Friday, 28 August 2026 at 12:24pm". Pacific because every reader of this
 * page is deciding whether to drive somewhere in Pacific time.
 */
export function formatUpdated(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(d)
    .replace(/\s/g, "")
    .toLowerCase();
  return `${date} at ${time}`;
}
