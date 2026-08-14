/**
 * Traffic, closure, parking and transit data for /traffic/.
 *
 * SOURCING CONTRACT — read before editing.
 *
 Every fact carries a `confidence` — see the type below. The page states only
 * what it can defend, and it never wears a "we haven't checked this yet" badge:
 * a to-do marker on a live page is an admission that a claim went out before it
 * was stood up, and the remedy is to drop the claim, not to caption it.
 *
 * Three traps this file exists to prevent:
 *
 *  1. Prior-year closure tables read as current. The widely-syndicated
 *     Car Week closure table circulating online is dated 2023; its August
 *     11–20 dates are 2023 dates, not 2026 ones. Do not import them.
 *  2. Inferred closures presented as notices. A street concours on Ocean
 *     Avenue implies a closure, but "implies" is not "the city published
 *     one." Those rows are `derived`, with `basis` naming the inference.
 *  3. Volatile numbers cached where they go stale. A gate fee or a parking
 *     price belongs next to a link to whoever sets it. Publish the figure only
 *     with its source, so a reader can see how old our reading is.
 *
 * A closure time or a parking price with no official source is never written
 * here at all — an empty field beats a confident guess when someone is
 * deciding what time to leave the house.
 */

/**
 * How a fact on this page is known. There is deliberately no "unverified"
 * state: a to-do marker on a live page means we published a claim we had not
 * stood up, and the remedy is to stop making the claim rather than to caption
 * it. Each value below is a defensible statement about the public record.
 *
 *  official     The agency or operator publishes it; `source` links to them.
 *  unpublished  We checked, and nobody publishes it. That absence IS the fact —
 *               there is no shuttle to find, no parking plan to look up — and
 *               `basis` says where to ask for what is genuinely unobtainable.
 *  derived      We assert only the sourced part (an event's published time and
 *               place) and name the inference on top of it out loud, rather
 *               than dressing an inference up as a notice.
 */
export type Confidence = "official" | "unpublished" | "derived";

export type Source = { label: string; url: string };

/** Named external sources, so one URL change updates every fact citing it. */
export const SOURCES = {
  carmel: {
    label: "City of Carmel-by-the-Sea — Car Week 2026",
    url: "https://ci.carmel.ca.us/post/car-week-2026",
  },
  pebbleBeach: {
    label: "Pebble Beach Concours — Directions, Parking & Event Maps",
    url: "https://www.pebblebeachconcours.net/plan-your-visit/directions-parking-event-maps/",
  },
  pebbleBeachDrive: {
    label: "Pebble Beach Resorts — 17-Mile Drive",
    url: "https://www.pebblebeach.com/17-mile-drive/",
  },
  pebbleBeachFaq: {
    label: "Pebble Beach Concours — FAQs",
    url: "https://www.pebblebeachconcours.net/plan-your-visit/faqs/",
  },
  lagunaSeca: {
    label: "WeatherTech Raceway Laguna Seca — Event Map & Directions",
    url: "https://www.weathertechraceway.com/map-directions/",
  },
  lagunaSecaTickets: {
    label: "WeatherTech Raceway Laguna Seca — Ticket Information",
    url: "https://weathertechraceway.com/pages/ticket-information",
  },
  reunion: {
    label: "WeatherTech Raceway — Rolex Monterey Motorsports Reunion",
    url: "https://weathertechraceway.com/pages/rolex-monterey-motorsports-reunion",
  },
  pgChamber: {
    label: "Pacific Grove Chamber — Car Week Events 2026",
    url: "https://www.pacificgrove.org/pacific-grove-car-week-events-2026/",
  },
  asilomar: {
    label: "Asilomar State Beach — California State Parks",
    url: "https://www.parks.ca.gov/asilomar",
  },
  mst: {
    label: "Monterey-Salinas Transit — Monterey Trolley",
    url: "https://mst.org/routes/monterey-trolley/",
  },
  countyClosures: {
    label: "County of Monterey — Road Closures",
    url: "https://www.countyofmonterey.gov/government/departments-i-z/public-works-facilities-parks/public-works/road-closures-information",
  },
  quickmap: {
    label: "Caltrans QuickMap",
    url: "https://quickmap.dot.ca.gov/",
  },
  calFireTimber: {
    label: "CAL FIRE — Timber Fire incident page",
    url: "https://www.fire.ca.gov/incidents/2026/8/8/timber-fire",
  },
  readyMonterey: {
    label: "County of Monterey — Timber Fire emergency info",
    url: "https://www.readymontereycounty.org/emergency/incident-archive/2026-timber-fire",
  },
  concoursUpdates: {
    label: "Pebble Beach Concours — Official Updates",
    url: "https://www.pebblebeachconcours.net/updates/",
  },
} as const satisfies Record<string, Source>;

/* ------------------------------------------------------------------ *
 * Active incident
 *
 * A wildfire is the one thing on this site that changes faster than the site
 * does. So this block deliberately does NOT try to be a live feed: it carries
 * the facts that stay useful for hours (what road is shut, which zones are
 * evacuated, what is closed) and sends every volatile number to CAL FIRE with
 * an explicit "as of". A cached acreage read as current is worse than none —
 * someone could believe a fire is smaller than it is.
 *
 * REMOVE THIS BLOCK once the incident closes, and set `active: false` the
 * moment it stops being current. A stale emergency banner destroys trust in
 * every other thing the page says.
 * ------------------------------------------------------------------ */

export type Incident = {
  active: boolean;
  name: string;
  where: string;
  /** One line: what a reader needs to do differently because of this. */
  headline: string;
  /** Timestamp for the volatile figures below, in the reader's terms. */
  asOf: string;
  size: string;
  containment: string;
  started: string;
  roadClosure: string;
  evacuationOrders: string[];
  evacuationWarnings: string[];
  closures: string[];
  eventImpact: string[];
  detour: string;
  evacuationPoint: string;
  sources: Source[];
};

export const timberFire: Incident = {
  active: true,
  name: "Timber Fire",
  where: "Big Sur, Los Padres National Forest, Monterey County",
  headline:
    "Highway 1 is closed through Big Sur and the whole Big Sur coast is under evacuation orders or warnings. If your plans involve driving south of Carmel, they need to change.",
  asOf: "Thursday, 13 August 2026 — CAL FIRE's most recent figures at the time of writing",
  size: "Over 4,000 acres",
  containment: "7% contained",
  started: "Sunday, 9 August, on Los Padres National Forest land; cause under investigation",
  roadClosure:
    "Highway 1 is closed between mile marker 45.1, near the Big Sur Bakery at the north end, and mile marker 37 at Julia Pfeiffer Burns State Park at the south end. Still closed as of Friday morning, 14 August.",
  evacuationOrders: ["MRY-F023", "MRY-F025", "MRY-F026", "MRY-F027", "MRY-F028-A"],
  evacuationWarnings: [
    "MRY-F021-B",
    "MRY-F022",
    "MRY-F024",
    "MRY-F028-B",
    "MRY-F029",
  ],
  closures: [
    "All four Big Sur state parks are closed: Andrew Molera, Julia Pfeiffer Burns, Pfeiffer Big Sur and Point Sur.",
    "Nepenthe and the Henry Miller Memorial Library are closed. The Esalen Institute is closed until 23 August.",
    "Henry Miller Library and Fernwood Resort have cancelled concerts and cultural events indefinitely.",
    "Hotels including Deetjen's Big Sur Inn, Post Ranch Inn and Alila Ventana have been evacuated.",
  ],
  eventImpact: [
    "The Pebble Beach Tour d'Elegance ran on Thursday 13 August with a route changed because of this fire — it stayed inside Pebble Beach and Monterey rather than running down to Big Sur.",
    "A Cars and Coffee gathering at Asilomar was cancelled, with emergency resources committed to the fire.",
    "The Pebble Beach Concours d'Elegance on Sunday 16 August has not been cancelled or moved; the Concours' own updates page carries no change for the 14th, 15th or 16th.",
    "Smoke has reached the Monterey Peninsula. The Monterey Bay Air Resources District had not reported dangerous levels as of midday Wednesday, but air quality is worth checking on the day if you are sensitive to smoke.",
  ],
  detour:
    "See Monterey is advising Car Week visitors to approach on Highway 101 north instead of Highway 1 from the south.",
  evacuationPoint:
    "The Temporary Evacuation Point is Carmel Valley Library, 65 W. Carmel Valley Road, open Friday 14 August through Monday 17 August, 10:00 a.m. to 5:00 p.m.",
  sources: [
    SOURCES.calFireTimber,
    SOURCES.readyMonterey,
    SOURCES.quickmap,
    SOURCES.concoursUpdates,
  ],
};

/* ------------------------------------------------------------------ *
 * Road closures and access restrictions
 * ------------------------------------------------------------------ */

export type Closure = {
  road: string;
  /** Cross streets or limits, where an official source states them. */
  segment?: string;
  city: string;
  /** Dates affected, ISO `YYYY-MM-DD`, America/Los_Angeles. */
  dates: string[];
  /** Human-readable date range for display. */
  when: string;
  /** Published hours, or undefined when no source states them. */
  hours?: string;
  reason: string;
  confidence: Confidence;
  source?: Source;
  /** For `derived`/`unpublished`: what is actually sourced, and what is not. */
  basis?: string;
};

export const closures: Closure[] = [
  {
    road: "Highway 1 — Big Sur",
    segment: "mile marker 45.1 (Big Sur Bakery) to mile marker 37 (Julia Pfeiffer Burns State Park)",
    city: "Big Sur",
    dates: [
      "2026-08-11",
      "2026-08-12",
      "2026-08-13",
      "2026-08-14",
      "2026-08-15",
      "2026-08-16",
    ],
    when: "Closed since Tuesday, August 11 — still closed Friday morning, August 14",
    reason:
      "Closed for public and firefighter safety because of the Timber Fire. This is an active incident with no announced reopening, so treat the southern approach to the Peninsula as unavailable and come in on Highway 101 instead. See the full detail and live links at the top of this page.",
    confidence: "official",
    source: SOURCES.readyMonterey,
  },
  {
    road: "17-Mile Drive",
    city: "Pebble Beach",
    dates: ["2026-08-13", "2026-08-14", "2026-08-15", "2026-08-16"],
    when: "Thursday, August 13 – Sunday, August 16",
    reason:
      "Closed to traffic not related to the Concours d'Elegance. Residents and club members holding standard passes keep access, and hotels, shops and restaurants inside the gates stay open to the public.",
    confidence: "official",
    source: SOURCES.pebbleBeach,
  },
  {
    road: "Stillwater Cove coastal access",
    city: "Pebble Beach",
    dates: ["2026-08-13", "2026-08-14", "2026-08-15", "2026-08-16"],
    when: "Thursday, August 13 – Sunday, August 16",
    reason:
      "Public coastal access at Stillwater Cove is closed for the Concours, and equipment drop-off at the Beach Club parking lot is unavailable with it. The wider programme of changes runs August 10–17. If you were planning to reach the shore through Pebble Beach rather than to attend an event, this is the closure that affects you.",
    confidence: "official",
    source: SOURCES.pebbleBeachDrive,
  },
  {
    road: "Ocean Avenue",
    segment: "through the central business district",
    city: "Carmel-by-the-Sea",
    dates: ["2026-08-11", "2026-08-12", "2026-08-13"],
    when: "Tuesday, August 11 – Thursday, August 13",
    reason:
      "Closed to public parking during the scheduled street showcases. The city runs its free Larsen Field shuttle on exactly these three days, which is the clearest published signal of when downtown is hardest to drive.",
    confidence: "derived",
    basis:
      "The city's Car Week page publishes the shuttle dates and the parking guidance but does not publish a street-closure table. Segment limits and hours are not stated anywhere official.",
    source: SOURCES.carmel,
  },
  {
    road: "Lighthouse Avenue",
    segment: "downtown Pacific Grove",
    city: "Pacific Grove",
    dates: ["2026-08-12"],
    when: "Wednesday, August 12",
    reason:
      "The Little Car Show occupies downtown Lighthouse Avenue from noon. A rolling closure is the practical effect.",
    confidence: "derived",
    basis:
      "Derived from the Pacific Grove Chamber's published event time and location. Neither the city nor the chamber publishes closure blocks or hours for 2026.",
    source: SOURCES.pgChamber,
  },
  {
    road: "Lighthouse Avenue",
    segment: "downtown Pacific Grove",
    city: "Pacific Grove",
    dates: ["2026-08-14"],
    when: "Friday, August 14",
    reason:
      "Pacific Grove Rotary Concours Auto Rally stages downtown, with registration from 10:00 a.m. and the rally rolling out at 2:00 p.m.",
    confidence: "derived",
    basis:
      "Times are the chamber's published event times, not a closure notice. No official closure segment or hours are published for 2026.",
    source: SOURCES.pgChamber,
  },
  {
    road: "Valley Greens Drive",
    city: "Carmel Valley",
    dates: ["2026-08-14"],
    when: "Friday, August 14",
    reason:
      "The Quail, A Motorsports Gathering runs at Quail Lodge and the approach road carries all of its traffic on a single day.",
    confidence: "derived",
    basis:
      "Derived from this site's event schedule. No official 2026 closure notice found for this road.",
  },
];

/* ------------------------------------------------------------------ *
 * Highway conditions
 * ------------------------------------------------------------------ */

export type Highway = {
  name: string;
  role: string;
  guidance: string;
  confidence: Confidence;
  source?: Source;
  basis?: string;
};

export const highways: Highway[] = [
  {
    name: "Highway 1",
    role: "The peninsula's spine — Monterey to Carmel, and the only direct approach to the Highway 68 junction.",
    guidance:
      "Every Pebble Beach and Carmel event loads onto Highway 1. South of Carmel it is currently CLOSED through Big Sur for the Timber Fire, so it is not a through route to or from the south at all this week — See Monterey is directing visitors onto Highway 101 north instead. North of Carmel it is open and carrying the whole week's traffic. Caltrans QuickMap has live cameras and incidents for the corridor; check it before you leave rather than after you are already in it.",
    confidence: "official",
    source: SOURCES.quickmap,
  },
  {
    name: "Highway 68",
    role: "Monterey–Salinas Highway, the direct road to Laguna Seca.",
    guidance:
      "Laguna Seca tells spectators to avoid its main Highway 68 entrance entirely and to enter through South Boundary Road or Watkins Gate instead. Treat Highway 68 as the road you cross, not the road you arrive on.",
    confidence: "official",
    source: SOURCES.lagunaSeca,
  },
  {
    name: "Highway 218 (Canyon Del Rey)",
    role: "The connector from Highway 1 to the Laguna Seca back gates.",
    guidance:
      "From Highway 1 in either direction, exit onto Highway 218 and travel east about two miles, turn left on General Jim Moore Boulevard, then right on South Boundary Road and follow the signs in.",
    confidence: "official",
    source: SOURCES.lagunaSeca,
  },
  {
    name: "Highway 101",
    role: "The inland approach, via Salinas.",
    guidance:
      "Take the Monterey-Peninsula / Sanborn Road exit, head west on Sanborn to South Main Street / Highway 68, turn left, take the Reservation Road exit, turn right, and follow race traffic signs to Watkins Gate. Watkins Gate is open on Saturday only.",
    confidence: "official",
    source: SOURCES.lagunaSeca,
  },
];

/* ------------------------------------------------------------------ *
 * Parking by venue
 * ------------------------------------------------------------------ */

export type Lot = {
  name: string;
  /** Published cost, or undefined when no source states one. */
  cost?: string;
  note?: string;
  confidence: Confidence;
  source?: Source;
  basis?: string;
};

export type ParkingVenue = {
  id: string;
  venue: string;
  city: string;
  /** Link to the relevant hub or event page on this site, when one exists. */
  href?: string;
  approach?: string;
  approachConfidence?: Confidence;
  lots: Lot[];
  shuttle?: string;
  shuttleConfidence?: Confidence;
  shuttleSource?: Source;
};

export const parking: ParkingVenue[] = [
  {
    id: "pebble-beach",
    venue: "Pebble Beach",
    city: "Pebble Beach",
    href: "/event/pebble-beach-concours-delegance/",
    approach:
      "17-Mile Drive is closed to non-Concours traffic from Thursday through Sunday, so there is no drive-up-and-park option. Follow signage and traffic officials to the lot that matches your ticket.",
    approachConfidence: "official",
    lots: [
      {
        name: "General admission parking",
        note: "Assigned by ticket type. Trailing shuttles run from the lots to the Concours Village drop-off. The official page does not name the lots or publish their capacity.",
        confidence: "official",
        source: SOURCES.pebbleBeach,
      },
      {
        name: "ADA parking — Lot 9, off Portola Road",
        note: "Thursday, August 13 through Saturday, August 15, for vehicles with a state-issued placard. Complimentary shuttle to the show field.",
        confidence: "official",
        source: SOURCES.pebbleBeach,
      },
      {
        name: "ADA parking — 17-Mile Drive at Bird Rock",
        note: "Sunday, August 16 only, for vehicles with a state-issued placard. Complimentary shuttle to the show field.",
        confidence: "official",
        source: SOURCES.pebbleBeach,
      },
      {
        name: "17-Mile Drive gate fee — August 7–12, before the closure",
        cost: "$12.50 per vehicle",
        note: "Pebble Beach charges this to enter the Del Monte Forest gates on a normal day, and it applies to Car Week events held inside the gates before the Concours closure begins on the 13th. The fee is reimbursed if you spend $35 or more at a Pebble Beach Resorts restaurant — Pebble Beach Market excluded.",
        confidence: "official",
        source: SOURCES.pebbleBeachDrive,
      },
      {
        name: "Concours ticket holders do not pay the gate fee",
        note: "A Concours ticket already covers it: “Tickets include entrance into Pebble Beach, parking, and shuttle services to the show field.” The show field opens to credentialed spectators at 5:30 a.m.",
        confidence: "official",
        source: SOURCES.pebbleBeachFaq,
      },
      {
        name: "Casa Palmero garage & 17th Hedgerow — RESERVATION ONLY",
        note: "On August 10, 11 and 12, parking at the 17th Hedgerow and the Casa Palmero garage is by reservation only, on 831-625-8536. This is the garage beside where the Motoring Classic arrives on the 12th, so turning up to watch without a reservation means no parking there. On August 17 the 17th Hedgerow closes and Casa Palmero stays reservation-only.",
        confidence: "official",
        source: SOURCES.pebbleBeachDrive,
      },
      {
        name: "Rideshare drop-off — Concours Village",
        note: "At Forest Lake Road and Stevenson Drive, across from the Pebble Beach Auctions. Rideshare is encouraged on Concours Sunday specifically to cut parking demand.",
        confidence: "official",
        source: SOURCES.pebbleBeach,
      },
    ],
    shuttle:
      "Shuttle passes are sold online in advance and in person at the Carmel Visitor Center inside Carmel Plaza, at Ocean Avenue and Mission Street. The pass price is not published on the official directions page.",
    shuttleConfidence: "official",
    shuttleSource: SOURCES.pebbleBeach,
  },
  {
    id: "laguna-seca",
    venue: "WeatherTech Raceway Laguna Seca",
    city: "Salinas",
    href: "/event/rolex-monterey-motorsports-reunion/",
    approach:
      "Do not use the main Highway 68 entrance. All vehicles enter through South Boundary Road or Watkins Gate, and Watkins Gate is open on Saturday only.",
    approachConfidence: "official",
    lots: [
      {
        name: "General Parking — Purple 10 area",
        note: "Reached via the South Boundary Road entrance. No overnight parking is permitted in the General or Preferred Parking areas.",
        confidence: "official",
        source: SOURCES.lagunaSecaTickets,
      },
      {
        name: "What General Parking costs",
        confidence: "unpublished",
        basis:
          "The raceway publishes where General Parking is and how to reach it, but no price for it — while separately selling Preferred Parking and season parking passes, and stating that vehicle parking must be purchased online in advance for the 2026 season. Whether a General Parking vehicle pays, and how much, is not resolved on any of their pages. Budget for a charge rather than assuming free.",
        source: SOURCES.lagunaSecaTickets,
      },
      {
        name: "Preferred Parking — Green Lakebed area",
        note: "Sold as a pass, including as an add-on to a season pass. Prices are not published on the raceway's information pages.",
        confidence: "official",
        source: SOURCES.lagunaSecaTickets,
      },
      {
        name: "Gate hours",
        note: "Thursday through Saturday 7:00 a.m. – 5:00 p.m.; Sunday 7:00 a.m. – 12:00 p.m.",
        confidence: "official",
        source: SOURCES.lagunaSeca,
      },
    ],
  },
  {
    id: "ocean-avenue",
    venue: "Ocean Avenue",
    city: "Carmel-by-the-Sea",
    href: "/event/concours-for-a-cause/",
    approach:
      "The city asks visitors to enter and leave town on Carpenter Street and Rio Road rather than through the centre. Ocean Avenue itself closes to public parking during the street showcases.",
    approachConfidence: "official",
    lots: [
      {
        name: "Larsen Field, Rio Road — free",
        cost: "Free",
        note: "Next to the Carmel Mission, and the park-and-ride the city actually wants you to use.",
        confidence: "official",
        source: SOURCES.carmel,
      },
      {
        name: "Carmel Plaza Parking Garage",
        note: "On Mission Street just north of 7th Avenue. Paid; the city does not publish the rate.",
        confidence: "official",
        source: SOURCES.carmel,
      },
      {
        name: "Vista Lobos lot — 3rd & Torres",
        note: "Public lot, limited capacity.",
        confidence: "official",
        source: SOURCES.carmel,
      },
      {
        name: "Junipero centre-median spaces",
        note: "Curb spaces in the median between 3rd and 5th Avenues.",
        confidence: "official",
        source: SOURCES.carmel,
      },
      {
        name: "Sunset Center North Lot",
        note: "On 8th between Mission and San Carlos. Restricted on some days of Car Week — the city does not publish which.",
        confidence: "official",
        source: SOURCES.carmel,
      },
    ],
    shuttle:
      "Free shuttle between Larsen Field and Carmel Plaza on Tuesday, August 11, Wednesday, August 12 and Thursday, August 13, from 8:00 a.m. to 9:00 p.m., every 10 to 15 minutes. One shuttle in the rotation has a wheelchair lift.",
    shuttleConfidence: "official",
    shuttleSource: SOURCES.carmel,
  },
  {
    id: "lighthouse-avenue",
    venue: "Lighthouse Avenue",
    city: "Pacific Grove",
    href: "/event/the-little-car-show/",
    approach:
      "Downtown Pacific Grove has the least parking of any Car Week host town, and neither the city nor the chamber publishes a Car Week parking plan or a shuttle.",
    approachConfidence: "unpublished",
    lots: [
      {
        name: "Street parking, downtown Pacific Grove",
        note: "First-come. No official capacity, price or time-limit information is published for Car Week.",
        confidence: "unpublished",
        basis:
          "Absence of a published plan is itself the finding — the chamber's Car Week page lists events and their times but no parking or shuttle detail.",
        source: SOURCES.pgChamber,
      },
      {
        name: "Pacific Grove Golf Links — Legends of the Autobahn",
        cost: "$30 prepaid / $40 on the day",
        note: "Spectator entry to the show itself is free; this is the parking charge, on Thursday, August 13.",
        confidence: "official",
        source: SOURCES.pgChamber,
      },
    ],
  },
  {
    id: "asilomar",
    venue: "Asilomar",
    city: "Pacific Grove",
    href: "/event/woodies-in-the-woods/",
    approach:
      "Asilomar sits at the end of Sunset Drive, past the downtown congestion rather than through it.",
    approachConfidence: "unpublished",
    lots: [
      {
        name: "Asilomar Conference Grounds — on-site parking",
        cost: "Free",
        note: "There is no park entrance fee and no day-use fee for beach access.",
        confidence: "official",
        source: SOURCES.asilomar,
      },
      {
        name: "Sunset Drive street parking",
        cost: "Free",
        note: "Fills early on weekends even outside Car Week.",
        confidence: "official",
        source: SOURCES.asilomar,
      },
      {
        name: "During ticketed Car Week events on the grounds",
        note: "Whether normal free parking still applies when a private event has the meadow is not published.",
        confidence: "unpublished",
        basis:
          "State Parks publishes the standing fee position; neither it nor the event organisers publish an exception for Car Week event days.",
        source: SOURCES.asilomar,
      },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Transit
 * ------------------------------------------------------------------ */

export type Transit = {
  name: string;
  detail: string;
  confidence: Confidence;
  source?: Source;
  basis?: string;
  cta?: { label: string; href: string };
};

export const transit: Transit[] = [
  {
    name: "MST Trolley — free, downtown Monterey",
    detail:
      "Free to ride, serving downtown Monterey, Fisherman's Wharf, Cannery Row and the Monterey Bay Aquarium. It departs the downtown parking garages at Tyler Street and Del Monte Avenue every 10 to 15 minutes, and it runs daily through the summer season rather than as a Car Week special.",
    confidence: "official",
    source: SOURCES.mst,
    cta: { label: "MST Trolley route & schedule", href: SOURCES.mst.url },
  },
  {
    name: "MST Trolley — daily hours",
    detail:
      "Published as 10:00 a.m. to 6:00 p.m. daily, running from late May through early September. Confirm the current day's hours before relying on the last run: mst.org blocked an automated read of the page, so these hours come from MST's own listing rather than a direct fetch of it.",
    confidence: "unpublished",
    basis: "MST's site returned 403 to a direct read; hours are from MST's published route listing and were not re-confirmed on the page itself.",
    source: SOURCES.mst,
  },
  {
    name: "Carmel free shuttle — Larsen Field to Carmel Plaza",
    detail:
      "Tuesday, August 11 through Thursday, August 13, 8:00 a.m. to 9:00 p.m., every 10 to 15 minutes, with one wheelchair-lift-equipped shuttle in the rotation. Free parking at the Larsen Field end.",
    confidence: "official",
    source: SOURCES.carmel,
    cta: { label: "City of Carmel — Car Week 2026", href: SOURCES.carmel.url },
  },
  {
    name: "Pebble Beach shuttles",
    detail:
      "Trailing shuttles run from the general-admission lots to the Concours Village drop-off, and complimentary shuttles serve the ADA lots. Passes are sold online or at the Carmel Visitor Center in Carmel Plaza.",
    confidence: "official",
    source: SOURCES.pebbleBeach,
    cta: {
      label: "Pebble Beach directions & parking",
      href: SOURCES.pebbleBeach.url,
    },
  },
  {
    name: "Public safety text alerts",
    detail:
      "Text CARWEEK to 65513 for public safety messages through the week — incidents, closures and emergency notices.",
    confidence: "official",
    source: SOURCES.countyClosures,
  },
];

/* ------------------------------------------------------------------ *
 * Arrival timing
 *
 * These are advisory, and the honest basis for each is named. Where a
 * published gate or start time exists the advice is anchored to it; where it
 * does not, the row says so rather than inventing a clock time.
 * ------------------------------------------------------------------ */

export type ArrivalTip = {
  where: string;
  advice: string;
  confidence: Confidence;
  basis: string;
  source?: Source;
};

export const arrivalTips: ArrivalTip[] = [
  {
    where: "Laguna Seca",
    advice:
      "Gates open at 7:00 a.m. Thursday through Saturday and close at 5:00 p.m.; Sunday runs 7:00 a.m. to noon. Arriving in the first hour is the difference between the back gates flowing and the back gates queueing.",
    confidence: "official",
    basis: "Gate hours are published by the raceway. The queueing observation is judgement, not a published figure.",
    source: SOURCES.lagunaSeca,
  },
  {
    where: "Carmel-by-the-Sea",
    advice:
      "The city's own shuttle runs 8:00 a.m. to 9:00 p.m. on the three showcase days. Park at Larsen Field and ride in — the closer you try to park to Ocean Avenue on those days, the longer the walk usually ends up being.",
    confidence: "official",
    basis: "Shuttle hours are published by the city. The parking observation is judgement.",
    source: SOURCES.carmel,
  },
  {
    where: "Pebble Beach on Concours Sunday",
    advice:
      "17-Mile Drive is closed to unrelated traffic and rideshare is actively encouraged. If you are driving, your arrival window is set by your ticket's assigned lot, not by the show field's schedule.",
    confidence: "official",
    basis: "Closure and rideshare guidance are published by the Concours. No gate time is published on the directions page.",
    source: SOURCES.pebbleBeach,
  },
  {
    where: "Pacific Grove",
    advice:
      "The Little Car Show starts at noon on Wednesday and Legends of the Autobahn at 9:00 a.m. on Thursday. Downtown parking is the constraint, so arrive well before the published start rather than at it.",
    confidence: "official",
    basis: "Start times are published by the Pacific Grove Chamber. The parking constraint is judgement, and no official parking plan exists to check it against.",
    source: SOURCES.pgChamber,
  },
  {
    where: "Highway 1, any day",
    advice:
      "Check Caltrans QuickMap immediately before leaving. Conditions on the corridor change faster than any published schedule can describe.",
    confidence: "official",
    basis: "QuickMap is Caltrans' live camera and incident feed.",
    source: SOURCES.quickmap,
  },
];

/**
 * How many facts on this page are the operator's or the agency's own words.
 * The page leads with this rather than a count of caveats.
 */
const countBy = (c: Confidence) =>
  closures.filter((x) => x.confidence === c).length +
  highways.filter((x) => x.confidence === c).length +
  transit.filter((x) => x.confidence === c).length +
  arrivalTips.filter((x) => x.confidence === c).length +
  parking.reduce(
    (n, v) =>
      n +
      v.lots.filter((l) => l.confidence === c).length +
      (v.approachConfidence === c ? 1 : 0),
    0,
  );

export const officialCount = countBy("official");
/** Facts nobody publishes — the absence is the answer, not a pending task. */
export const unpublishedCount = countBy("unpublished");
/** Statements built on a sourced event time, with the inference named. */
export const derivedCount = countBy("derived");