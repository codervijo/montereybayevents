/**
 * Registry of the primary visuals rendered by scripts/gen-maps.mjs.
 *
 * One entry per image, read by three consumers so they cannot drift apart:
 *   - src/components/MapFigure.astro  (the <figure>/<picture> markup)
 *   - src/lib/imageSchema.ts          (ImageObject JSON-LD)
 *   - astro.config.mjs                (<image:image> entries in the sitemap)
 *
 * Dimensions come from src/data/mapImages.json, which the generator writes —
 * width/height attributes are never typed by hand.
 */
import dims from "./mapImages.json";

export const SITE = "https://montereybayevents.com";

export type VisualKey = keyof typeof dims;

export type Visual = {
  key: VisualKey;
  /** Short title — ImageObject `name`. */
  title: string;
  /** What the image shows, for someone who cannot see it. */
  alt: string;
  /** The visible caption under the figure; also ImageObject `caption`. */
  caption: string;
};

export const VISUALS: Record<string, Visual> = {
  lagunaFacility: {
    key: "laguna-seca-map-turns-parking-camping",
    title: "Laguna Seca map: turns, gates, parking and camping",
    alt: "Map of WeatherTech Raceway Laguna Seca with north at the top: the circuit with Turns 1 to 11 numbered, the Andretti Hairpin, the Corkscrew and Rainey Curve, five bridges over the track, the paddock and lakebed, General Parking (Purple 10) to the west, campgrounds around the circuit, Will Call on South Boundary Road and the Highway 68 entrance to the south.",
    caption: "WeatherTech Raceway Laguna Seca, north up. Turns are numbered in race order; white bars are the five bridges over the track. Drawn from OpenStreetMap data.",
  },
  lagunaMobile: {
    key: "laguna-seca-map-circuit-mobile",
    title: "Laguna Seca map (circuit close-up)",
    alt: "Close-up map of the Laguna Seca circuit with turn numbers, bridges, paddock, lakebed, grandstands, General Parking and the campgrounds nearest the track.",
    caption: "Circuit close-up for phones. The full map adds Highway 68 and the camper entrance.",
  },
  lagunaTrack: {
    key: "laguna-seca-track-map-turn-numbers",
    title: "Laguna Seca track map with turn numbers",
    alt: "Diagram of the 2.238-mile Laguna Seca circuit with all eleven turns numbered plus 8A, arrows showing the direction of racing, the start/finish line, pit lane, and the four places general admission can watch from.",
    caption: "The circuit on its own: eleven turns plus 8A, direction of racing, start/finish and pit lane.",
  },
  carWeek: {
    key: "monterey-car-week-map-venues",
    title: "Monterey Car Week map: every venue",
    alt: "Map of the Monterey Peninsula and Carmel Valley with 24 numbered pins for Monterey Car Week venues — from Pacific Grove and Pebble Beach in the west, through downtown Monterey and Seaside, to WeatherTech Raceway Laguna Seca on Highway 68 and Quail Lodge in Carmel Valley — with a numbered venue key.",
    caption: "Every Car Week venue we list, numbered by area. Pins sit on the venue the organiser publishes; events with no fixed venue are listed below the map instead.",
  },
  carWeekMobile: {
    key: "monterey-car-week-map-venues-mobile",
    title: "Monterey Car Week map (phone view)",
    alt: "Map of the Monterey Peninsula with numbered pins for Monterey Car Week venues from Pacific Grove and Pebble Beach to Laguna Seca and Quail Lodge.",
    caption: "Phone view: the venue key is the list below the map.",
  },
};

/** One printable poster per month in the dataset. */
export const monthPosterKey = (month: string) => `monterey-events-calendar-${month}-2026` as VisualKey;

export function monthPoster(month: string, label: string): Visual {
  return {
    key: monthPosterKey(month),
    title: `Monterey events calendar — ${label}`,
    alt: `Printable month calendar for ${label}: Monterey County and Santa Cruz County events written on the days they happen, with longer runs and undated events listed underneath.`,
    caption: `${label} as a printable calendar. Monterey County events in white, Santa Cruz County in blue.`,
  };
}

export const dimsOf = (key: VisualKey) => dims[key];
export const pngPath = (key: VisualKey) => `/maps/${key}.png`;
export const webpPath = (key: VisualKey, w: number) => `/maps/${key}-${w}.webp`;
export const srcset = (key: VisualKey) =>
  dims[key].widths.map((w) => `${webpPath(key, w)} ${w}w`).join(", ");
/** The <img src>: the middle WebP, the size most viewports actually get. */
export function defaultSrc(key: VisualKey) {
  const ws = dims[key].widths;
  return webpPath(key, ws[Math.min(1, ws.length - 1)]!);
}

/** Absolute image URLs per page, for the image sitemap. */
export function pageImageUrls(): Record<string, string[]> {
  const months = ["august", "september", "october", "november", "december"];
  return {
    "/laguna-seca-map/": [VISUALS.lagunaFacility!.key, VISUALS.lagunaTrack!.key].map((k) => `${SITE}${pngPath(k)}`),
    "/monterey-car-week-map/": [`${SITE}${pngPath(VISUALS.carWeek!.key)}`],
    "/monterey-events-calendar/": months.map((m) => `${SITE}${pngPath(monthPosterKey(m))}`),
  };
}
