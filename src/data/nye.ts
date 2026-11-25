/**
 * New Year's Eve 2026 (v2.U) — typed view over data/nye-2026.json.
 *
 * The JSON is the source of record: every listing was confirmed for 2026 on the
 * organiser's, venue's or city's own page (`source_url`) on `last_verified`.
 * Nothing here adds facts; it only filters, sorts and formats them. Re-check
 * every listing with `scripts/nye-reverify.mjs` (README: 15 and 28 December).
 */
import raw from "../../data/nye-2026.json";

export type NyeRegion = "monterey" | "santa-cruz";
export type NyeTag = "free" | "family" | "21+" | "dinner" | "party" | "concert" | "comedy" | "hike" | "plunge";

export type NyeEntry = {
  id: string;
  name: string;
  region: NyeRegion;
  town: string;
  venue: string;
  /** Full street address, town included. */
  address: string;
  /** "2026-12-31" or "2027-01-01". */
  date: string;
  /** 24h "HH:MM", or null where the organiser has not published one. */
  start: string | null;
  end: string | null;
  /** The times as the organiser states them, in our words. */
  hours_text: string;
  price: string | null;
  free: boolean;
  ages: "all ages" | "16+" | "21+" | null;
  tags: NyeTag[];
  ticket_url: string | null;
  source_url: string;
  last_verified: string;
  note: string;
  /** Slug of an existing /event/<slug>/ page, when the site already has one. */
  event_page?: string;
};

export const nye = (raw.entries as NyeEntry[]).slice().sort(
  (a, b) => a.date.localeCompare(b.date) || (a.start ?? "99").localeCompare(b.start ?? "99") || a.name.localeCompare(b.name),
);

export const NYE_DATE = "2026-12-31";
export const NYD_DATE = "2027-01-01";

export const FILTERS: { tag: NyeTag; label: string }[] = [
  { tag: "free", label: "Free" },
  { tag: "family", label: "Family" },
  { tag: "21+", label: "21+" },
  { tag: "dinner", label: "Dinner" },
  { tag: "party", label: "Party" },
];

export const NYE_PAGES = {
  hub: "/new-years-eve/",
  monterey: "/new-years-eve/monterey/",
  "santa-cruz": "/new-years-eve/santa-cruz/",
} as const;

export const forRegion = (region: NyeRegion) => nye.filter((e) => e.region === region);
export const nyeHref = (e: NyeEntry) => `${NYE_PAGES[e.region]}#${e.id}`;

/** "8pm", "8:30pm", "12am" from "HH:MM". */
export function clock(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  const suffix = h >= 12 && h < 24 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? `:${String(m).padStart(2, "0")}` : ""}${suffix}`;
}

/** ISO date-time in Pacific Standard Time (all dates here are in winter, UTC-8). */
const pst = (date: string, hhmm: string) => `${date}T${hhmm}:00-08:00`;
const nextDay = (date: string) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

export function startIso(e: NyeEntry): string {
  return e.start ? pst(e.date, e.start) : e.date;
}
/** End time; an end earlier than the start (e.g. 1am) is the next morning. */
export function endIso(e: NyeEntry): string | undefined {
  if (!e.end || !e.start) return undefined;
  return pst(e.end < e.start ? nextDay(e.date) : e.date, e.end);
}

export function eventJsonLd(e: NyeEntry, site: string) {
  const url = `${site}${nyeHref(e)}`;
  const [street, ...rest] = e.address.split(",").map((s) => s.trim());
  const zip = rest.join(" ").match(/\b9\d{4}\b/)?.[0];
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": url,
    name: e.name,
    url,
    startDate: startIso(e),
    ...(endIso(e) ? { endDate: endIso(e) } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(e.free ? { isAccessibleForFree: true } : {}),
    ...(e.ages === "21+" ? { typicalAgeRange: "21-" } : {}),
    location: {
      "@type": "Place",
      name: e.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: street,
        addressLocality: e.town,
        addressRegion: "CA",
        ...(zip ? { postalCode: zip } : {}),
        addressCountry: "US",
      },
    },
    ...(e.ticket_url ? { offers: { "@type": "Offer", url: e.ticket_url, ...(e.free ? { price: 0, priceCurrency: "USD" } : {}) } } : {}),
    sameAs: e.source_url,
  };
}
