/**
 * Holiday Lights Map 2026 (v2.T) — typed view over data/holiday-lights-2026.json.
 *
 * The JSON is the source of record: every entry was confirmed for 2026 on the
 * organiser's or host's own page (`source_url`) on `last_verified`, and its
 * coordinates come from OpenStreetMap Nominatim (scripts/geocode-lights.py).
 * Nothing in this module adds facts; it only sorts, groups and dates them.
 *
 * Dates are evaluated at BUILD time (pacificToday), like the rest of the site;
 * the daily rebuild Worker keeps "Ended" badges and the JSON-LD current. The
 * "open tonight" filter is evaluated in the browser, against the same nights.
 */
import raw from "../../data/holiday-lights-2026.json";
import { pacificToday } from "../lib/isPast";

export type LightsCategory = keyof typeof raw.categories;

export type LightsEntry = {
  id: string;
  name: string;
  category: LightsCategory;
  town: string;
  address: string;
  lat: number;
  lng: number;
  geo_precision: "address" | "venue" | "street" | "town";
  dates_text: string;
  nights?: string[];
  range?: { from: string; to: string };
  select_dates?: boolean;
  hours: string | null;
  cost: string | null;
  free: boolean | null;
  kids: string | null;
  parking_tip: string | null;
  source_url: string;
  year_note?: string;
  event_page: string | null;
  last_verified: string;
};

export const LIGHTS_CATEGORIES = raw.categories as Record<LightsCategory, { label: string; color: string }>;
export const lights = raw.entries as LightsEntry[];

/** Towns in map order: Monterey Peninsula, Salinas Valley, Pajaro, then Santa Cruz County north. */
export const LIGHTS_TOWNS = [
  "Monterey", "Pacific Grove", "Carmel", "Carmel Valley", "Seaside", "Marina", "Salinas",
  "Watsonville", "Aptos", "Capitola", "Santa Cruz", "Scotts Valley", "Felton", "Boulder Creek",
] as const;

export const firstNight = (e: LightsEntry) => e.range?.from ?? e.nights![0]!;
export const lastNight = (e: LightsEntry) => e.range?.to ?? e.nights![e.nights!.length - 1]!;

/** True once the entry's last date is behind `today`. */
export const isOver = (e: LightsEntry, today = pacificToday()) => lastNight(e) < today;

/** True when the entry is on on `iso`; `undefined` when the organiser publishes select days we can't list. */
export function isOn(e: LightsEntry, iso: string): boolean | undefined {
  if (e.nights) return e.nights.includes(iso);
  if (!e.range || iso < e.range.from || iso > e.range.to) return false;
  return e.select_dates ? undefined : true;
}

export const lightsHref = (e: LightsEntry) => `/holiday-lights/#${e.id}`;
export const eventPageHref = (e: LightsEntry) => (e.event_page ? `/event/${e.event_page}/` : undefined);
export const directionsHref = (e: LightsEntry) =>
  `https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lng}`;

export function byTown(entries = lights) {
  return LIGHTS_TOWNS.map((town) => ({
    town,
    entries: entries
      .filter((e) => e.town === town)
      .sort((a, b) => firstNight(a).localeCompare(firstNight(b)) || a.name.localeCompare(b.name)),
  })).filter((g) => g.entries.length > 0);
}

/** Google Maps multi-stop directions through the given entries, in order. */
export function routeHref(stops: LightsEntry[]) {
  const pt = (e: LightsEntry) => `${e.lat},${e.lng}`;
  const mid = stops.slice(1, -1).map(pt).join("|");
  return (
    `https://www.google.com/maps/dir/?api=1&travelmode=driving` +
    `&origin=${pt(stops[0]!)}&destination=${pt(stops[stops.length - 1]!)}` +
    (mid ? `&waypoints=${encodeURIComponent(mid)}` : "")
  );
}

export const lightById = (id: string) => {
  const e = lights.find((x) => x.id === id);
  if (!e) throw new Error(`holiday lights: no entry "${id}"`);
  return e;
};
