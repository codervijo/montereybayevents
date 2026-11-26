/**
 * Venue location maps (v2.Z, = v2.Y): which event page shows which map.
 *
 * Regional events: data/event-venues.json lists each fixed venue and its
 * events. Car Week events: their venue name resolves to a pin in
 * carWeekVenues.ts. A map exists only where scripts/gen-maps.mjs rendered one
 * (src/data/mapImages.json), so a venue without OSM data simply gets no map.
 */
import table from "../../data/event-venues.json";
import dims from "./mapImages.json";
import { mapVenues } from "./carWeekVenues";
import type { Visual, VisualKey } from "./visuals";

type Row = { name: string; osm?: string; events: string[] };
const venues = (table as { venues: Record<string, Row> }).venues;

const has = (key: string) => `venue-${key}` in dims;

function visual(key: string, name: string): Visual {
  return {
    key: `venue-${key}` as VisualKey,
    title: `${name}: location map`,
    alt: `Street map centred on ${name}, with a pin on the venue, the surrounding streets labelled from OpenStreetMap, a scale bar and north arrow.`,
    caption: `Where ${name} is. Map data © OpenStreetMap contributors (ODbL); check the organiser's page for entrances and parking.`,
  };
}

const bySlug = new Map<string, Visual>();
for (const [key, v] of Object.entries(venues)) if (has(key)) for (const s of v.events) bySlug.set(s, visual(key, v.name));

export const regionalVenueMap = (slug: string) => bySlug.get(slug);

export function carWeekVenueMap(venueName?: string) {
  if (!venueName) return undefined;
  const pin = mapVenues.find((v) => v.venueNames.includes(venueName));
  return pin && has(pin.id) ? visual(pin.id, pin.label) : undefined;
}
