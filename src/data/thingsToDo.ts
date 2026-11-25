/**
 * "Things to Do" town hubs (v7.B) — typed view over data/things-to-do/<town>.json.
 *
 * Each JSON is the source of record: every item's facts come from its own
 * official page (`official_url`), checked on `last_verified`; coordinates are
 * OSM Nominatim (scripts/geocode-places.py). Nothing here adds facts.
 *
 * "Happening this week" is computed at BUILD time from the events, lights and
 * NYE data (pacificToday), and the daily rebuild keeps it current.
 */
import monterey from "../../data/things-to-do/monterey.json";
import { pacificToday } from "../lib/isPast";
import { regionalEvents, eventHref } from "./events-2026";
import { lights, isOn, lightsHref } from "./holidayLights";
import { nye, nyeHref, clock } from "./nye";

export type SectionKey =
  | "top-sights" | "beaches-coast" | "outdoors-hikes" | "kids-families" | "free"
  | "food-drink" | "rainy-day" | "nightlife" | "day-trips";

export const SECTIONS: Record<SectionKey, { label: string; color: string }> = {
  "top-sights": { label: "Top sights", color: "#ddb049" },
  "beaches-coast": { label: "Beaches & coast", color: "#0e7490" },
  "outdoors-hikes": { label: "Outdoors & hikes", color: "#15803d" },
  "kids-families": { label: "Kids & families", color: "#c2410c" },
  free: { label: "Free things", color: "#a16207" },
  "food-drink": { label: "Food & drink areas", color: "#be185d" },
  "rainy-day": { label: "Rainy day", color: "#4f46e5" },
  nightlife: { label: "Nightlife", color: "#7c3aed" },
  "day-trips": { label: "Nearby day trips", color: "#64748b" },
};

export type TtdItem = {
  id: string;
  name: string;
  section: SectionKey;
  town: string;
  address: string;
  lat: number;
  lng: number;
  cost: string | null;
  free: boolean | null;
  hours: string | null;
  best_time: string | null;
  description: string;
  official_url: string;
  check_before_you_go: boolean;
  kids: boolean | null;
  rainy_day: boolean;
  notes?: string | null;
  /** Our own page for this item, when the site has one. */
  site_link?: { href: string; label: string };
  last_verified: string;
};

export type TownHub = {
  slug: string;
  town: string;
  items: TtdItem[];
  skipped: { name: string; reason: string }[];
};

const load = (slug: string, town: string, raw: unknown): TownHub => {
  const r = raw as { items: TtdItem[]; skipped?: { name: string; reason: string }[] };
  return { slug, town, items: r.items, skipped: r.skipped ?? [] };
};

export const HUBS: Record<string, TownHub> = {
  monterey: load("monterey", "Monterey", monterey),
};

export const hubHref = (slug: string) => `/things-to-do/${slug}/`;
export const itemAnchor = (i: TtdItem) => `#${i.id}`;
export const directionsHref = (i: TtdItem) => `https://www.google.com/maps/dir/?api=1&destination=${i.lat},${i.lng}`;

export function bySection(items: TtdItem[]) {
  return (Object.keys(SECTIONS) as SectionKey[])
    .map((key) => ({ key, ...SECTIONS[key], items: items.filter((i) => i.section === key) }))
    .filter((s) => s.items.length > 0);
}

/** ISO dates for today and the next six days (Pacific). */
export function weekDates(today = pacificToday()): string[] {
  const out: string[] = [];
  const d = new Date(`${today}T12:00:00Z`);
  for (let k = 0; k < 7; k++) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export type WeekItem = { name: string; href: string; when: string; sortKey: string };

/** What's on in `town` over the next seven days, from the events, lights and NYE data. */
export function happeningThisWeek(town: string, today = pacificToday()): WeekItem[] {
  const days = weekDates(today);
  const first = days[0]!, last = days[6]!;
  const out: WeekItem[] = [];
  const fmt = (iso: string) =>
    new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

  for (const e of regionalEvents) {
    if (e.city !== town || !e.start) continue;
    const end = e.end ?? e.start;
    if (end < first || e.start > last) continue;
    const ongoing = e.start < first;
    out.push({
      name: e.name,
      href: eventHref(e),
      when: ongoing ? `On now, to ${fmt(end)}` : e.end && e.end !== e.start ? `${fmt(e.start)} – ${fmt(end)}` : fmt(e.start),
      sortKey: ongoing ? `0${first}` : `1${e.start}`,
    });
  }
  const seen = new Set(out.map((o) => o.name));
  for (const l of lights) {
    if (l.town !== town || l.event_page || seen.has(l.name)) continue;
    const on = days.filter((d) => isOn(l, d) !== false);
    if (!on.length) continue;
    out.push({ name: l.name, href: lightsHref(l), when: on.length === 7 ? "Every night this week" : on.map(fmt).join(", "), sortKey: `1${on[0]}` });
  }
  for (const n of nye) {
    if (n.town !== town || !days.includes(n.date) || n.event_page) continue;
    out.push({ name: n.name, href: nyeHref(n), when: `${fmt(n.date)}${n.start ? `, ${clock(n.start)}` : ""}`, sortKey: `1${n.date}${n.start ?? ""}` });
  }
  return out.sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.name.localeCompare(b.name));
}

/** The next dated events in `town` after this week, for when the week is quiet. */
export function comingUp(town: string, n = 4, today = pacificToday()) {
  const after = weekDates(today)[6]!;
  return regionalEvents
    .filter((e) => e.city === town && e.start && e.start > after)
    .sort((a, b) => a.start!.localeCompare(b.start!))
    .slice(0, n);
}
