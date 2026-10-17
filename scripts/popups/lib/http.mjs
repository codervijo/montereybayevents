/**
 * Polite fetch for the pop-ups discovery job: one identifying User-Agent, a
 * minimum gap between requests to the same host, a timeout, and retries on
 * transient failures only.
 *
 * Failures are classified rather than thrown, because "this source is blocked"
 * is a finding the registry records, not an exception:
 *   blocked      401 / 403 — the host refuses us. Not retried, never worked around.
 *   not-found    404 / 410 — the URL moved. Operator fixes the registry.
 *   transient    429 / 5xx / timeout / reset — retried, then reported.
 *   unreachable  DNS or TLS failure.
 *   disallowed   the host's robots.txt excludes this URL. Never requested.
 */
import { parseRobots, isAllowed } from "./robots.mjs";
export const USER_AGENT =
  "montereybayevents-popups/1.0 (+https://montereybayevents.com/; event discovery, daily)";

const lastHit = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function classifyStatus(status) {
  if (status >= 200 && status < 300) return "ok";
  if (status === 401 || status === 403) return "blocked";
  if (status === 404 || status === 410) return "not-found";
  if (status === 429 || status >= 500) return "transient";
  return "error";
}

const robotsCache = new Map();

/** robots.txt for an origin. A missing file (4xx) allows everything; one we
 *  cannot read (5xx, timeout, DNS) allows nothing, so an outage is never
 *  mistaken for permission. */
async function robotsFor(origin, opts) {
  if (!robotsCache.has(origin)) {
    robotsCache.set(origin, (async () => {
      const r = await fetchText(`${origin}/robots.txt`, { ...opts, respectRobots: false, retries: 0 });
      if (r.ok) return parseRobots(r.text);
      if (r.status >= 400 && r.status < 500) return [];
      return null;
    })());
  }
  return robotsCache.get(origin);
}

export async function fetchText(url, opts = {}) {
  const { timeoutMs = 20000, retries = 2, minGapMs = 1500, accept = "*/*", fetchImpl = fetch, respectRobots = true } = opts;
  const host = new URL(url).host;
  if (respectRobots) {
    const groups = await robotsFor(new URL(url).origin, opts);
    if (groups === null) return { ok: false, url, outcome: "transient", status: 0, text: "", error: "robots.txt unreadable" };
    if (!isAllowed(groups, url)) return { ok: false, url, outcome: "disallowed", status: 0, text: "", error: "excluded by robots.txt" };
  }
  let last = { ok: false, url, outcome: "unreachable", status: 0, error: "not attempted" };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const wait = (lastHit.get(host) ?? 0) + minGapMs - Date.now();
    if (wait > 0) await sleep(wait);
    lastHit.set(host, Date.now());

    try {
      const res = await fetchImpl(url, {
        headers: { "user-agent": USER_AGENT, accept },
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs),
      });
      const outcome = classifyStatus(res.status);
      const text = outcome === "ok" ? await res.text() : "";
      last = {
        ok: outcome === "ok", url, finalUrl: res.url || url, outcome, status: res.status,
        contentType: res.headers.get("content-type") ?? "", text,
      };
      if (outcome !== "transient") return last;
    } catch (e) {
      const timedOut = e?.name === "TimeoutError" || e?.name === "AbortError";
      last = {
        ok: false, url, status: 0, text: "",
        outcome: timedOut ? "transient" : "unreachable",
        error: timedOut ? `timeout after ${timeoutMs}ms` : String(e?.cause?.code ?? e?.message ?? e),
      };
      if (!timedOut && attempt > 0) return last;
    }
    if (attempt < retries) await sleep(2000 * (attempt + 1));
  }
  return last;
}
