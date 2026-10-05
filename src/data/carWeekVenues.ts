/**
 * Map pins for /monterey-car-week-map/ and the map image rendered by
 * scripts/gen-maps.mjs.
 *
 * One pin per PLACE, not per event: the Lodge at Pebble Beach hosts the
 * Concours, RetroAuto and Concours Village, and three pins on one lawn would
 * tell a reader nothing. Which events sit at a pin is derived from
 * src/data/venues.ts (the per-event venue already shown on every Car Week
 * /event/ page), so the map cannot disagree with the event pages — add an event
 * there and it lands on the right pin here.
 *
 * COORDINATES are OpenStreetMap features (ODbL), geocoded 2026-10-05 through
 * Nominatim and recorded with the OSM object they came from. Where Nominatim
 * found no match for a public street, the point is the Monterey County Car Week
 * ArcGIS layer's location for the same street (data/research/carweek.geojson,
 * 2022) — used for WHERE only; nothing else in that layer is current.
 *
 * NOT PINNED, deliberately: venues.ts entries that name an area rather than a
 * place ("Monterey Peninsula", "Carmel-by-the-Sea", an undisclosed rally start,
 * the Tour d'Elegance route). A pin would invent a location the organiser has
 * not published. They are listed on the page under "Not on the map".
 */
// ".ts" extensions so scripts/gen-maps.mjs can load this under plain Node.
import { venues } from "./venues.ts";

export type Area =
  | "Downtown Monterey"
  | "Monterey airport & Highway 68"
  | "Seaside"
  | "Pacific Grove"
  | "Pebble Beach"
  | "Carmel"
  | "Carmel Valley"
  | "Laguna Seca";

export type MapVenue = {
  /** Pin number on the map image. Stable: numbered in AREAS order. */
  n: number;
  id: string;
  label: string;
  area: Area;
  lat: number;
  lon: number;
  /** Exact `venue` strings in venues.ts that resolve to this pin. */
  venueNames: string[];
  /** Where the coordinate came from. */
  source: string;
};

export const AREAS: Area[] = [
  "Downtown Monterey",
  "Monterey airport & Highway 68",
  "Laguna Seca",
  "Seaside",
  "Pacific Grove",
  "Pebble Beach",
  "Carmel",
  "Carmel Valley",
];

type Raw = Omit<MapVenue, "n">;

const RAW: Raw[] = [
  {
    id: "custom-house-plaza",
    label: "Custom House Plaza & the Stanton Center",
    area: "Downtown Monterey",
    lat: 36.60269,
    lon: -121.89343,
    venueNames: ["Custom House Plaza", "Monterey History & Art Association"],
    source: "OSM way/153299640",
  },
  {
    id: "monterey-conference-center",
    label: "Monterey Conference Center",
    area: "Downtown Monterey",
    lat: 36.6014,
    lon: -121.89489,
    venueNames: ["Monterey Conference Center"],
    source: "OSM way/569212582",
  },
  {
    id: "hyatt-regency",
    label: "Hyatt Regency Monterey",
    area: "Monterey airport & Highway 68",
    lat: 36.59175,
    lon: -121.87699,
    venueNames: ["Hyatt Regency Monterey Hotel & Spa"],
    source: "OSM relation/14655782",
  },
  {
    id: "monterey-pines",
    label: "Monterey Pines Golf Course",
    area: "Monterey airport & Highway 68",
    lat: 36.5904,
    lon: -121.86216,
    venueNames: ["Monterey Pines Golf Course"],
    source: "OSM way/27830611",
  },
  {
    id: "monterey-jet-center",
    label: "Monterey Jet Center, Sky Park Drive",
    area: "Monterey airport & Highway 68",
    lat: 36.58783,
    lon: -121.85941,
    venueNames: ["Monterey Jet Center"],
    source: "OSM way/10466546 (Sky Park Drive)",
  },
  {
    id: "pasadera",
    label: "The Club at Pasadera",
    area: "Monterey airport & Highway 68",
    lat: 36.57581,
    lon: -121.77129,
    venueNames: ["The Club at Pasadera"],
    source: "OSM way/701221024",
  },
  {
    id: "laguna-seca",
    label: "WeatherTech Raceway Laguna Seca",
    area: "Laguna Seca",
    lat: 36.58441,
    lon: -121.75339,
    venueNames: ["WeatherTech Raceway Laguna Seca"],
    source: "OSM way/41229940",
  },
  {
    id: "embassy-suites",
    label: "Embassy Suites Monterey Bay",
    area: "Seaside",
    lat: 36.60673,
    lon: -121.85639,
    venueNames: ["Embassy Suites Monterey Bay"],
    source: "OSM way/78116801",
  },
  {
    id: "seaside-city-hall",
    label: "Seaside City Hall lawn",
    area: "Seaside",
    lat: 36.60356,
    lon: -121.85355,
    venueNames: ["Seaside City Hall lawn"],
    source: "OSM way/152954397",
  },
  {
    id: "porsche-monterey",
    label: "Porsche Monterey",
    area: "Seaside",
    lat: 36.61519,
    lon: -121.84483,
    venueNames: ["Porsche Monterey"],
    source: "OSM way/490941892",
  },
  {
    id: "broadway-seaside",
    label: "Broadway Avenue, Seaside",
    area: "Seaside",
    lat: 36.60904,
    lon: -121.838,
    venueNames: ["Broadway Avenue"],
    source: "OSM way/810340262",
  },
  {
    id: "bayonet-black-horse",
    label: "Bayonet & Black Horse Golf Course",
    area: "Seaside",
    lat: 36.63232,
    lon: -121.82267,
    venueNames: ["Bayonet Black Horse Golf Course"],
    source: "OSM way/247046075",
  },
  {
    id: "downtown-pacific-grove",
    label: "Lighthouse Avenue, downtown Pacific Grove",
    area: "Pacific Grove",
    lat: 36.62111,
    lon: -121.9178,
    venueNames: ["Lighthouse Avenue", "Downtown Pacific Grove"],
    source: "Monterey County Car Week layer, Lighthouse & Forest Ave (location only)",
  },
  {
    id: "pacific-grove-golf-links",
    label: "Pacific Grove Golf Links",
    area: "Pacific Grove",
    lat: 36.63084,
    lon: -121.9286,
    venueNames: ["Pacific Grove Golf Links"],
    source: "OSM way/36437304",
  },
  {
    id: "asilomar",
    label: "Asilomar Conference Grounds",
    area: "Pacific Grove",
    lat: 36.61923,
    lon: -121.93739,
    venueNames: ["Asilomar Conference Grounds", "Grand Cypress Meadow, Asilomar"],
    source: "OSM way/238137902",
  },
  {
    id: "spanish-bay",
    label: "The Inn at Spanish Bay",
    area: "Pebble Beach",
    lat: 36.61173,
    lon: -121.94256,
    venueNames: ["The Inn at Spanish Bay"],
    source: "OSM way/635881649",
  },
  {
    id: "equestrian-center",
    label: "Pebble Beach Equestrian Center",
    area: "Pebble Beach",
    lat: 36.57344,
    lon: -121.95645,
    venueNames: ["Pebble Beach Equestrian Center"],
    source: "OSM way/686749924",
  },
  {
    id: "lodge-at-pebble-beach",
    label: "The Lodge at Pebble Beach & Peter Hay",
    area: "Pebble Beach",
    lat: 36.5694,
    lon: -121.95049,
    venueNames: ["The Lodge at Pebble Beach", "Peter Hay Golf Course, Pebble Beach"],
    source: "OSM node/7317027074",
  },
  {
    id: "casa-palmero",
    label: "Casa Palmero",
    area: "Pebble Beach",
    lat: 36.56978,
    lon: -121.94661,
    venueNames: ["Casa Palmero at Pebble Beach"],
    source: "OSM way/259156521",
  },
  {
    id: "ocean-avenue-carmel",
    label: "Ocean Avenue, Carmel-by-the-Sea",
    area: "Carmel",
    lat: 36.5551,
    lon: -121.92222,
    venueNames: ["Ocean Avenue", "Ocean Avenue & Dolores Street"],
    source: "Monterey County Car Week layer, Ocean Ave (location only)",
  },
  {
    id: "crossroads",
    label: "The Crossroads Carmel",
    area: "Carmel",
    lat: 36.53763,
    lon: -121.90889,
    venueNames: ["The Crossroads Carmel"],
    source: "OSM node/5213359316 (in The Crossroads)",
  },
  {
    id: "barnyard",
    label: "The Barnyard Shopping Village",
    area: "Carmel",
    lat: 36.54099,
    lon: -121.90763,
    venueNames: ["The Barnyard Shopping Village"],
    source: "OSM way/488364311",
  },
  {
    id: "quail-lodge",
    label: "Quail Lodge & Golf Club",
    area: "Carmel Valley",
    lat: 36.53239,
    lon: -121.85149,
    venueNames: ["Quail Lodge & Golf Club"],
    source: "OSM way/688262916",
  },
  {
    id: "carmel-valley-historical-society",
    label: "Carmel Valley Historical Society",
    area: "Carmel Valley",
    lat: 36.4815,
    lon: -121.73689,
    venueNames: ["Carmel Valley Historical Society"],
    source: "OSM way/10461116",
  },
];

export const mapVenues: MapVenue[] = AREAS.flatMap((a) => RAW.filter((v) => v.area === a)).map(
  (v, i) => ({ ...v, n: i + 1 }),
);

/**
 * Event titles at a pin, straight from venues.ts. The page resolves these to
 * /event/ pages through eventIndex (see src/lib/carWeekMap.ts); this module
 * stays dependency-light so the map renderer can import it under plain Node.
 */
export function titlesAt(v: MapVenue): string[] {
  return Object.entries(venues)
    .filter(([, venue]) => v.venueNames.includes(venue.venue))
    .map(([title]) => title);
}
