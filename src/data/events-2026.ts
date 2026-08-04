/**
 * Central Coast public events, August–December 2026.
 *
 * SOURCE OF RECORD: `data/monterey_santacruz_events_aug_dec_2026.csv`, committed
 * alongside this file. Every mechanical field below (name, county, city, month,
 * date text, category, official website, reference URLs) is transcribed from
 * that CSV — if the two ever disagree, the CSV wins and this file is wrong.
 *
 * Two deliberate omissions:
 *
 *  - The CSV's `expected_visitor_level` column is NOT carried over. It is
 *    unsourced judgement ("Very High" / "Local") and has no place on the site.
 *  - `description` is written here, not in the CSV, and is derived ONLY from the
 *    CSV's own facts — category, venue, city, county, date. Nothing is copied
 *    from the reference URLs and nothing is inferred beyond those fields. An
 *    event with no factual basis for a sentence gets no description.
 *
 * DATES ARE NEVER SYNTHESISED. Three events had no confirmed date at the time of
 * transcription and ship with `start` unset: they render "Date not yet announced"
 * and emit no Event JSON-LD at all, because schema.org/Event requires startDate
 * and an Event node without one is invalid. See `buildRegionalEventJsonLd`.
 *
 * No clock times exist in this dataset, so `start` / `end` are date-only ISO
 * 8601 — which schema.org accepts ("Date or DateTime"). `pacificOffset` is here
 * for the day a sourced start time arrives; padding a date out to midnight would
 * put a time we do not have in front of someone deciding when to show up.
 */

export type County = "Monterey" | "Santa Cruz";

export type MonthKey = "august" | "september" | "october" | "november" | "december";

export type RegionalEvent = {
  /** URL segment: `/event/<slug>/`. Derived from the name, lowercase-hyphenated. */
  slug: string;
  /** Event name exactly as recorded in the CSV, incl. any parenthetical. */
  name: string;
  county: County;
  /** City / venue text exactly as recorded in the CSV. */
  cityText: string;
  /** City alone, for display and schema.org addressLocality. Unset if countywide. */
  city?: string;
  /** Venue parsed out of `cityText`'s parenthetical, where the CSV gives one. */
  venue?: string;
  /** Month hub(s) this event belongs to. More than one only when it spans them. */
  months: MonthKey[];
  /** Human-readable date text from the CSV; empty when no date is confirmed. */
  dateText: string;
  /** ISO 8601 `YYYY-MM-DD`. Unset when the date is not yet announced. */
  start?: string;
  /** ISO 8601 end date; set only when the run spans more than one day. */
  end?: string;
  category: string;
  officialWebsite?: string;
  referenceUrls: string[];
  description?: string;
  /**
   * Set when this CSV row is the same real-world event as a page that already
   * exists in the Monterey Car Week dataset (`src/data/events.ts`). Those pages
   * are live URLs and must not move, and a second page for the same event would
   * be duplicate content competing with itself — so the row is listed in the
   * index and month hub but links to the existing page instead of getting one.
   */
  existingSlug?: string;
  /** Same idea, but the row is covered by a section hub rather than an event page. */
  hubHref?: string;
};

/** Shown wherever a date would go for the three events with no confirmed date. */
export const DATE_TBA = "Date not yet announced";

export const MONTHS: { key: MonthKey; label: string; iso: string }[] = [
  { key: "august", label: "August 2026", iso: "2026-08" },
  { key: "september", label: "September 2026", iso: "2026-09" },
  { key: "october", label: "October 2026", iso: "2026-10" },
  { key: "november", label: "November 2026", iso: "2026-11" },
  { key: "december", label: "December 2026", iso: "2026-12" },
];

export const COUNTIES: County[] = ["Monterey", "Santa Cruz"];

export const regionalEvents: RegionalEvent[] = [
  // ── Monterey County ──────────────────────────────────────────────────────
  {
    slug: "monterey-car-week",
    name: "Monterey Car Week (umbrella event)",
    county: "Monterey",
    cityText: "Countywide (Monterey, Carmel, Pebble Beach, Seaside, Salinas)",
    months: ["august"],
    dateText: "August 7-16, 2026",
    start: "2026-08-07",
    end: "2026-08-16",
    category: "Automotive / Motorsports",
    referenceUrls: [
      "https://www.seemonterey.com/events/monterey-car-week/",
      "https://whatsupmonterey.com/events",
      "https://www.montereyhotel.com/local-events",
    ],
    description:
      "Ten days of automotive and motorsports events spread across Monterey, Carmel, Pebble Beach, Seaside and Salinas.",
    hubHref: "/monterey-car-week/",
  },
  {
    slug: "monterey-pre-reunion-corkscrew-hillclimb",
    name: "Monterey Pre-Reunion & Corkscrew Hillclimb",
    county: "Monterey",
    cityText: "Salinas (WeatherTech Raceway Laguna Seca)",
    city: "Salinas",
    venue: "WeatherTech Raceway Laguna Seca",
    months: ["august"],
    dateText: "August 8-9, 2026",
    start: "2026-08-08",
    end: "2026-08-09",
    category: "Motorsports",
    officialWebsite: "https://weathertechraceway.com/",
    referenceUrls: [
      "https://www.weathertechracing.com/2026-full-schedule",
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://whatsupmonterey.com/events",
    ],
    description:
      "Two days of motorsports at WeatherTech Raceway Laguna Seca in Salinas, the weekend before the Reunion race meeting.",
    existingSlug: "monterey-pre-reunion-and-corkscrew-hillclimb",
  },
  {
    slug: "automobilia-collectors-expo",
    name: "Automobilia Collectors Expo (incl. ACE Auction & ACE Forum)",
    county: "Monterey",
    cityText: "Seaside / Monterey (Embassy Suites Monterey Bay)",
    city: "Seaside",
    venue: "Embassy Suites Monterey Bay",
    months: ["august"],
    dateText: "August 10-12, 2026",
    start: "2026-08-10",
    end: "2026-08-12",
    category: "Automotive / Expo",
    referenceUrls: ["https://whatsupmonterey.com/events"],
    description:
      "A three-day automotive collectibles expo, with an auction and forum, at the Embassy Suites Monterey Bay in Seaside.",
    existingSlug: "automobilia-collectors-expo",
  },
  {
    slug: "carmel-car-week",
    name: "Carmel Car Week",
    county: "Monterey",
    cityText: "Carmel-by-the-Sea",
    city: "Carmel-by-the-Sea",
    months: ["august"],
    dateText: "August 11-16, 2026",
    start: "2026-08-11",
    end: "2026-08-16",
    category: "Automotive / Community",
    officialWebsite: "https://www.carmelcalifornia.com/carmel-car-week/",
    referenceUrls: [
      "https://www.carmelcalifornia.com/annual-events-in-carmel-by-the-sea/",
      "https://whatsupmonterey.com/events",
    ],
    description:
      "Carmel-by-the-Sea's own six-day run of automotive and community events inside the wider Car Week fortnight.",
  },
  {
    slug: "motorlux",
    name: "Motorlux",
    county: "Monterey",
    cityText: "Monterey (Monterey Jet Center, Sky Park Dr)",
    city: "Monterey",
    venue: "Monterey Jet Center",
    months: ["august"],
    dateText: "August 12, 2026",
    start: "2026-08-12",
    category: "Automotive / Aviation Gala",
    referenceUrls: [
      "https://allevents.in/monterey/august",
      "https://whatsupmonterey.com/events",
    ],
    description:
      "A one-night automotive and aviation gala at the Monterey Jet Center on Sky Park Drive.",
    existingSlug: "motorlux",
  },
  {
    slug: "rm-sothebys-monterey-classic-car-auction",
    name: "RM Sotheby's Monterey Classic Car Auction (public previews)",
    county: "Monterey",
    cityText: "Monterey (Monterey Conference Center)",
    city: "Monterey",
    venue: "Monterey Conference Center",
    months: ["august"],
    dateText: "August 12-15, 2026",
    start: "2026-08-12",
    end: "2026-08-15",
    category: "Automotive / Auction",
    referenceUrls: [
      "https://www.oldmonterey.org/events",
      "https://whatsupmonterey.com/events",
    ],
    description:
      "Four days of collector-car auction sessions, with public previews, at the Monterey Conference Center.",
    existingSlug: "rm-sothebys-monterey-auction",
  },
  {
    slug: "rolex-monterey-motorsports-reunion",
    name: "Rolex Monterey Motorsports Reunion",
    county: "Monterey",
    cityText: "Salinas / Monterey (WeatherTech Raceway Laguna Seca)",
    city: "Salinas",
    venue: "WeatherTech Raceway Laguna Seca",
    months: ["august"],
    dateText: "August 12-15, 2026",
    start: "2026-08-12",
    end: "2026-08-15",
    category: "Motorsports / Historic Racing",
    officialWebsite: "https://weathertechraceway.com/",
    referenceUrls: [
      "https://www.weathertechracing.com/2026-full-schedule",
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://www.montereyhotel.com/local-events",
    ],
    description:
      "Four days of historic racing at WeatherTech Raceway Laguna Seca, the motorsports centrepiece of Car Week.",
    existingSlug: "rolex-monterey-motorsports-reunion",
  },
  {
    slug: "pebble-beach-concours-delegance",
    name: "Pebble Beach Concours d'Elegance",
    county: "Monterey",
    cityText: "Pebble Beach",
    city: "Pebble Beach",
    months: ["august"],
    dateText: "August 16, 2026",
    start: "2026-08-16",
    category: "Automotive / Concours",
    referenceUrls: [
      "https://www.carmelcalifornia.com/annual-events-in-carmel-by-the-sea/",
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://whatsupmonterey.com/events",
    ],
    description:
      "The concours that closes Monterey Car Week, held at Pebble Beach on the Sunday.",
    existingSlug: "pebble-beach-concours-delegance",
  },
  {
    slug: "sand-city-west-end-celebration",
    name: "Sand City West End Celebration",
    county: "Monterey",
    cityText: "Sand City",
    city: "Sand City",
    months: ["august"],
    dateText: "August 22-23, 2026",
    start: "2026-08-22",
    end: "2026-08-23",
    category: "Arts / Music / Community Festival",
    referenceUrls: [
      "https://www.montereyhotel.com/local-events",
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
    ],
    description:
      "A two-day arts, music and community festival in Sand City on the last full weekend of August.",
  },
  {
    slug: "california-turkish-arts-culture-festival",
    name: "California Turkish Arts & Culture Festival",
    county: "Monterey",
    cityText: "Monterey",
    city: "Monterey",
    months: ["august"],
    dateText: "August 29, 2026",
    start: "2026-08-29",
    category: "Cultural Festival",
    referenceUrls: ["https://whatsupmonterey.com/events"],
    description: "A one-day Turkish arts and culture festival in Monterey.",
  },
  {
    slug: "monterey-county-fair",
    name: "Monterey County Fair",
    county: "Monterey",
    cityText: "Monterey (Monterey County Fair & Event Center)",
    city: "Monterey",
    venue: "Monterey County Fair & Event Center",
    months: ["september"],
    dateText: "September 3-7, 2026",
    start: "2026-09-03",
    end: "2026-09-07",
    category: "County Fair",
    officialWebsite: "https://montereycountyfair.com/monterey-county-fair/",
    referenceUrls: [
      "https://www.seemonterey.com/event/monterey-county-fair/",
      "https://www.montereyhotel.com/local-events",
      "https://festivalnet.com/1481/Monterey-California/State-Fairs/Monterey-County-Fair",
    ],
    description:
      "Monterey County's annual fair, running five days over Labor Day weekend at the Monterey County Fair & Event Center.",
  },
  {
    slug: "festa-italia-monterey",
    name: "Festa Italia Monterey (93rd Annual)",
    county: "Monterey",
    cityText: "Monterey (Custom House Plaza)",
    city: "Monterey",
    venue: "Custom House Plaza",
    months: ["september"],
    dateText: "September 4-6, 2026",
    start: "2026-09-04",
    end: "2026-09-06",
    category: "Cultural Festival",
    referenceUrls: [
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://whatsupmonterey.com/events",
    ],
    description:
      "The 93rd edition of Monterey's Italian cultural festival, held over three days at Custom House Plaza.",
  },
  {
    slug: "indycar-grand-prix-of-monterey",
    name: "INDYCAR Grand Prix of Monterey (NTT INDYCAR Series season finale)",
    county: "Monterey",
    cityText: "Salinas (WeatherTech Raceway Laguna Seca)",
    city: "Salinas",
    venue: "WeatherTech Raceway Laguna Seca",
    months: ["september"],
    dateText: "September 4-6, 2026",
    start: "2026-09-04",
    end: "2026-09-06",
    category: "Motorsports",
    officialWebsite: "https://weathertechraceway.com/",
    referenceUrls: [
      "https://www.weathertechracing.com/2026-full-schedule",
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
    ],
    description:
      "The NTT INDYCAR Series season finale, run over three days at WeatherTech Raceway Laguna Seca in Salinas.",
  },
  {
    slug: "castroville-artichoke-festival",
    name: "Castroville Artichoke Festival",
    county: "Monterey",
    cityText: "Monterey (Monterey County Fairgrounds)",
    city: "Monterey",
    venue: "Monterey County Fairgrounds",
    months: ["september"],
    dateText: "September 5, 2026",
    start: "2026-09-05",
    category: "Food / Agricultural Festival",
    referenceUrls: [
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://www.seemonterey.com/events/annual-events/",
    ],
    description:
      "A one-day food and agricultural festival built around the artichoke, held at the Monterey County Fairgrounds.",
  },
  {
    slug: "monterey-bay-greek-festival",
    name: "Monterey Bay Greek Festival",
    county: "Monterey",
    cityText: "Monterey (Custom House Plaza)",
    city: "Monterey",
    venue: "Custom House Plaza",
    months: ["september"],
    dateText: "",
    category: "Cultural / Food Festival",
    officialWebsite: "https://montereybaygreekfestival.wordpress.com/",
    referenceUrls: [
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
    ],
    description:
      "A Greek cultural and food festival at Custom House Plaza in Monterey. The 2026 date has not been announced.",
  },
  {
    slug: "gridlife-laguna-festival",
    name: "GRIDLIFE Laguna Festival",
    county: "Monterey",
    cityText: "Salinas (WeatherTech Raceway Laguna Seca)",
    city: "Salinas",
    venue: "WeatherTech Raceway Laguna Seca",
    months: ["september"],
    dateText: "September 18-20, 2026",
    start: "2026-09-18",
    end: "2026-09-20",
    category: "Motorsports / Music Festival",
    officialWebsite: "https://weathertechraceway.com/",
    referenceUrls: [
      "https://www.weathertechracing.com/2026-full-schedule",
      "https://weathertechraceway.com/pages/tickets",
    ],
    description:
      "A three-day combined motorsports and music festival at WeatherTech Raceway Laguna Seca.",
  },
  {
    slug: "pure-insurance-championship-at-pebble-beach",
    name: "PURE Insurance Championship at Pebble Beach (PGA TOUR Champions)",
    county: "Monterey",
    cityText: "Pebble Beach",
    city: "Pebble Beach",
    months: ["september"],
    dateText: "September 18-20, 2026",
    start: "2026-09-18",
    end: "2026-09-20",
    category: "Golf / Sports",
    referenceUrls: [
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://www.seemonterey.com/events/annual-events/",
    ],
    description:
      "A PGA TOUR Champions tournament played over three days at Pebble Beach.",
  },
  {
    slug: "the-great-sandcastle-contest",
    name: "The Great Sandcastle Contest (63rd Annual)",
    county: "Monterey",
    cityText: "Carmel-by-the-Sea (Carmel Beach)",
    city: "Carmel-by-the-Sea",
    venue: "Carmel Beach",
    months: ["september"],
    dateText: "September 19, 2026",
    start: "2026-09-19",
    category: "Community / Arts",
    referenceUrls: [
      "https://www.carmelcalifornia.com/annual-events-in-carmel-by-the-sea/",
      "https://whatsupmonterey.com/events",
    ],
    description:
      "The 63rd running of Carmel's one-day sandcastle-building contest, held on Carmel Beach.",
  },
  {
    slug: "monterey-jazz-festival",
    name: "Monterey Jazz Festival (MJF69)",
    county: "Monterey",
    cityText: "Monterey (Monterey County Fairgrounds)",
    city: "Monterey",
    venue: "Monterey County Fairgrounds",
    months: ["september"],
    dateText: "September 25-27, 2026",
    start: "2026-09-25",
    end: "2026-09-27",
    category: "Music Festival",
    officialWebsite: "https://montereyjazz.org/",
    referenceUrls: [
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://www.montereyhotel.com/local-events",
      "https://en.wikipedia.org/wiki/Monterey_Jazz_Festival",
    ],
    description:
      "The 69th Monterey Jazz Festival, three days of music at the Monterey County Fairgrounds.",
  },
  {
    slug: "california-international-airshow-salinas",
    name: "California International Airshow Salinas (45th Annual)",
    county: "Monterey",
    cityText: "Salinas (Salinas Municipal Airport)",
    city: "Salinas",
    venue: "Salinas Municipal Airport",
    months: ["september"],
    dateText: "September 26-27, 2026",
    start: "2026-09-26",
    end: "2026-09-27",
    category: "Airshow / Sports",
    officialWebsite: "https://www.salinasairshow.com/",
    referenceUrls: [
      "https://www.salinas.gov/Events/Salinas-Airshow-Event",
      "https://www.seemonterey.com/event/california-international-airshow-salinas/",
      "https://www.eventsprout.com/event/cias-2026",
    ],
    description:
      "The 45th California International Airshow, flown over two days at Salinas Municipal Airport.",
  },
  {
    slug: "carmel-international-film-festival",
    name: "Carmel International Film Festival",
    county: "Monterey",
    cityText: "Carmel-by-the-Sea",
    city: "Carmel-by-the-Sea",
    months: ["october"],
    dateText: "October 1-4, 2026",
    start: "2026-10-01",
    end: "2026-10-04",
    category: "Film Festival",
    referenceUrls: [
      "https://www.carmelcalifornia.com/annual-events-in-carmel-by-the-sea/",
      "https://business.pacificgrove.org/events",
    ],
    description: "A four-day film festival in Carmel-by-the-Sea.",
  },
  {
    slug: "laguna-seca-speedtour",
    name: "Laguna Seca SpeedTour (Trans-Am)",
    county: "Monterey",
    cityText: "Salinas (WeatherTech Raceway Laguna Seca)",
    city: "Salinas",
    venue: "WeatherTech Raceway Laguna Seca",
    months: ["october"],
    dateText: "October 2-4, 2026",
    start: "2026-10-02",
    end: "2026-10-04",
    category: "Motorsports",
    officialWebsite: "https://weathertechraceway.com/",
    referenceUrls: ["https://www.weathertechracing.com/2026-full-schedule"],
    description:
      "A three-day Trans-Am SpeedTour race meeting at WeatherTech Raceway Laguna Seca.",
  },
  {
    slug: "pacific-grove-butterfly-parade-bazaar",
    name: "Pacific Grove Butterfly Parade & Bazaar",
    county: "Monterey",
    cityText: "Pacific Grove",
    city: "Pacific Grove",
    months: ["october"],
    dateText: "October 3, 2026",
    start: "2026-10-03",
    category: "Parade / Community",
    referenceUrls: [
      "https://business.pacificgrove.org/events",
      "https://www.oldmontereyinn.com/october-event-in-monterey-magic-of-fall-by-the-coast/",
    ],
    description:
      "Pacific Grove's annual butterfly parade and community bazaar, held on a single Saturday in early October.",
  },
  {
    slug: "butterfly-days-sunset-celebration-at-point-pinos-lighthouse",
    name: "Butterfly Days Sunset Celebration at Point Pinos Lighthouse",
    county: "Monterey",
    cityText: "Pacific Grove (Point Pinos Lighthouse)",
    city: "Pacific Grove",
    venue: "Point Pinos Lighthouse",
    months: ["october"],
    dateText: "October 3, 2026",
    start: "2026-10-03",
    category: "Community / Heritage",
    referenceUrls: ["https://business.pacificgrove.org/events"],
    description:
      "A one-evening community and heritage event at Point Pinos Lighthouse, on the same day as the Butterfly Parade.",
  },
  {
    slug: "poodle-day",
    name: "Poodle Day",
    county: "Monterey",
    cityText: "Carmel-by-the-Sea / Carmel (The Crossroads & Carmel Beach)",
    city: "Carmel-by-the-Sea",
    venue: "The Crossroads & Carmel Beach",
    months: ["october"],
    dateText: "October 3, 2026",
    start: "2026-10-03",
    category: "Community / Pet Event",
    officialWebsite: "https://poodleday.com/",
    referenceUrls: [
      "https://whatsupmonterey.com/events/community-events/poodle-day/2477",
      "https://www.bringfido.com/event/17410/",
    ],
    description:
      "A one-day community pet event held at The Crossroads and on Carmel Beach.",
  },
  {
    slug: "meet-the-makers-art-wine-walk",
    name: "Meet the Makers Art & Wine Walk (7th Annual)",
    county: "Monterey",
    cityText: "Carmel-by-the-Sea (Devendorf Park)",
    city: "Carmel-by-the-Sea",
    venue: "Devendorf Park",
    months: ["october"],
    dateText: "October 10, 2026",
    start: "2026-10-10",
    category: "Art / Wine Walk",
    referenceUrls: [
      "https://www.carmelcalifornia.com/annual-events-in-carmel-by-the-sea/",
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
    ],
    description:
      "The 7th annual art and wine walk in Carmel-by-the-Sea, centred on Devendorf Park.",
  },
  {
    slug: "big-sur-food-wine-festival",
    name: "Big Sur Food & Wine Festival",
    county: "Monterey",
    cityText: "Big Sur",
    city: "Big Sur",
    months: ["november"],
    dateText: "November 5-7, 2026",
    start: "2026-11-05",
    end: "2026-11-07",
    category: "Food & Wine Festival",
    officialWebsite: "https://www.bigsurfoodandwine.org/festival",
    referenceUrls: [
      "https://www.seemonterey.com/event/big-sur-food-wine/",
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
    ],
    description: "A three-day food and wine festival held in Big Sur.",
  },
  {
    slug: "monterey-bay-half-marathon",
    name: "Monterey Bay Half Marathon",
    county: "Monterey",
    cityText: "Monterey / Pacific Grove",
    city: "Monterey",
    months: ["november"],
    dateText: "November 8, 2026",
    start: "2026-11-08",
    category: "Running / Sports",
    referenceUrls: [
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://www.seemonterey.com/events/annual-events/",
    ],
    description:
      "A half marathon run on a single November Sunday through Monterey and Pacific Grove.",
  },
  {
    slug: "christmas-in-the-adobes",
    name: "Christmas in the Adobes",
    county: "Monterey",
    cityText: "Monterey (historic downtown adobes)",
    city: "Monterey",
    venue: "Historic downtown adobes",
    months: ["december"],
    dateText: "December 11, 2026",
    start: "2026-12-11",
    category: "Holiday / Heritage",
    officialWebsite: "https://www.mshpa.org/christmasintheadobes",
    referenceUrls: [
      "https://whatsupmonterey.com/events/holiday-events/christmas-in-the-adobes/209",
      "https://www.seemonterey.com/event/christmas-in-the-adobes/",
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
    ],
    description:
      "A one-evening holiday heritage event through Monterey's historic downtown adobes.",
  },
  {
    slug: "first-night-monterey",
    name: "First Night Monterey",
    county: "Monterey",
    cityText: "Monterey (Downtown)",
    city: "Monterey",
    venue: "Downtown Monterey",
    months: ["december"],
    dateText: "December 31, 2026",
    start: "2026-12-31",
    category: "New Year's Eve / Arts Festival",
    referenceUrls: [
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://www.seemonterey.com/events/annual-events/",
    ],
    description:
      "Monterey's New Year's Eve arts festival, held across downtown on December 31.",
  },

  // ── Santa Cruz County ────────────────────────────────────────────────────
  {
    slug: "cabrillo-festival-of-contemporary-music",
    name: "Cabrillo Festival of Contemporary Music (64th Season: 'We the Dreamers')",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Santa Cruz Civic Auditorium)",
    city: "Santa Cruz",
    venue: "Santa Cruz Civic Auditorium",
    months: ["august"],
    dateText: "July 26 - August 9, 2026",
    start: "2026-07-26",
    end: "2026-08-09",
    category: "Music Festival",
    officialWebsite: "https://cabrillomusic.org/2026-season/",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.kalw.org/2026-04-08/santa-cruzs-cabrillo-festival-of-contemporary-music-announces-its-64th-season-we-the-dreamers",
      "https://en.wikipedia.org/wiki/Cabrillo_Festival_of_Contemporary_Music",
    ],
    description:
      "The 64th season of the Cabrillo Festival of Contemporary Music, running two weeks at the Santa Cruz Civic Auditorium.",
  },
  {
    slug: "annual-watsonville-strawberry-festival",
    name: "Annual Watsonville Strawberry Festival",
    county: "Santa Cruz",
    cityText: "Watsonville",
    city: "Watsonville",
    months: ["august"],
    dateText: "August 1-2, 2026",
    start: "2026-08-01",
    end: "2026-08-02",
    category: "Food / Agricultural Festival",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/watsonville-strawberry-festival/",
    ],
    description:
      "Watsonville's two-day food and agricultural festival built around the strawberry harvest.",
  },
  {
    slug: "scotts-valley-60th-anniversary-celebration-at-skypark",
    name: "Scotts Valley 60th Anniversary Celebration at Skypark",
    county: "Santa Cruz",
    cityText: "Scotts Valley (Skypark)",
    city: "Scotts Valley",
    venue: "Skypark",
    months: ["august"],
    dateText: "August 2, 2026",
    start: "2026-08-02",
    category: "Community Festival",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/skypark-scotts-valley-60th-celebration/",
    ],
    description:
      "A one-day community festival at Skypark marking Scotts Valley's 60th anniversary.",
  },
  {
    slug: "santa-cruz-jug-band-festival",
    name: "Santa Cruz Jug Band Festival (2nd Annual)",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Abbott Square Market)",
    city: "Santa Cruz",
    venue: "Abbott Square Market",
    months: ["august"],
    dateText: "August 6, 2026",
    start: "2026-08-06",
    category: "Music Festival",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://allevents.in/santa-cruz/festivals",
    ],
    description:
      "The second annual jug band festival, a single day of music at Abbott Square Market.",
  },
  {
    slug: "church-street-fair",
    name: "Church Street Fair",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Church St., in front of Civic Auditorium)",
    city: "Santa Cruz",
    venue: "Church Street, in front of the Civic Auditorium",
    months: ["august"],
    dateText: "August 8-9, 2026",
    start: "2026-08-08",
    end: "2026-08-09",
    category: "Street Fair / Arts",
    officialWebsite: "http://www.churchstreetfair.org",
    referenceUrls: [
      "https://www.santacruz.com/guides/santa-cruz-festivals-fairs",
      "https://en.wikipedia.org/wiki/Cabrillo_Festival_of_Contemporary_Music",
    ],
    description:
      "A two-day arts street fair on Church Street, in front of the Santa Cruz Civic Auditorium.",
  },
  {
    slug: "cabrillo-festival-free-family-orchestral-concert",
    name: "Cabrillo Festival Free Family Orchestral Concert",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Santa Cruz Civic Auditorium)",
    city: "Santa Cruz",
    venue: "Santa Cruz Civic Auditorium",
    months: ["august"],
    dateText: "August 2, 2026",
    start: "2026-08-02",
    category: "Music / Family",
    officialWebsite: "https://cabrillomusic.org/2026-season/",
    referenceUrls: ["https://www.santacruz.org/upcoming-events/category/festival/"],
    description:
      "The Cabrillo Festival's free family orchestral concert at the Santa Cruz Civic Auditorium.",
  },
  {
    slug: "cabrillo-festival-grand-finale",
    name: "Cabrillo Festival Grand Finale ('Hope as Our Banner')",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Santa Cruz Civic Auditorium)",
    city: "Santa Cruz",
    venue: "Santa Cruz Civic Auditorium",
    months: ["august"],
    dateText: "August 9, 2026",
    start: "2026-08-09",
    category: "Music Festival",
    officialWebsite: "https://cabrillomusic.org/2026-season/",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://cabrillomusic.org/cabrillo-festival-of-contemporary-music-announces-2026-season-we-the-dreamers/",
    ],
    description:
      "The closing concert of the 2026 Cabrillo Festival, at the Santa Cruz Civic Auditorium.",
  },
  {
    slug: "hwy-17-studios-all-star-food-fest",
    name: "Hwy 17 Studios All-Star Food Fest",
    county: "Santa Cruz",
    cityText: "Santa Cruz",
    city: "Santa Cruz",
    months: ["september"],
    dateText: "September 5, 2026",
    start: "2026-09-05",
    category: "Food Festival",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/hwy-17-studios-all-star-food-fest/",
    ],
    description: "A one-day food festival in Santa Cruz.",
  },
  {
    slug: "capitola-art-wine-festival",
    name: "Capitola Art & Wine Festival (43rd Annual)",
    county: "Santa Cruz",
    cityText: "Capitola (Capitola Village)",
    city: "Capitola",
    venue: "Capitola Village",
    months: ["september"],
    dateText: "September 12-13, 2026",
    start: "2026-09-12",
    end: "2026-09-13",
    category: "Art / Wine Festival",
    officialWebsite: "https://capitolaartandwine.com/",
    referenceUrls: [
      "https://www.capitolachamber.com/art-and-wine-festival/",
      "https://tpgonlinedaily.com/official-santa-cruz-county-summer-festivals-program-2026/",
      "https://festivalnet.com/9163/Capitola-California/Wine-Beer-Events/Capitola-Art-Wine-Festival",
    ],
    description:
      "The 43rd Capitola Art & Wine Festival, two days through Capitola Village.",
  },
  {
    slug: "santa-cruz-county-fair",
    name: "Santa Cruz County Fair ('Apple Pies and Starry Skies')",
    county: "Santa Cruz",
    cityText: "Watsonville (Santa Cruz County Fairgrounds)",
    city: "Watsonville",
    venue: "Santa Cruz County Fairgrounds",
    months: ["september"],
    dateText: "September 16-20, 2026",
    start: "2026-09-16",
    end: "2026-09-20",
    category: "County Fair",
    officialWebsite: "https://santacruzcountyfair.com/",
    referenceUrls: [
      "https://www.santacruzcountyfair.com/news-releases/2026-santa-cruz-county-fair-theme-revealed",
      "https://www.santacruz.org/upcoming-event/santa-cruz-county-fair-2/",
      "https://www.bayareakidfun.com/bay-area-county-fairs/",
    ],
    description:
      "Santa Cruz County's annual fair, five days at the fairgrounds in Watsonville under the theme “Apple Pies and Starry Skies”.",
  },
  {
    slug: "aloha-outrigger-races",
    name: "Aloha Outrigger Races (34th Annual)",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Santa Cruz Wharf)",
    city: "Santa Cruz",
    venue: "Santa Cruz Wharf",
    months: ["september"],
    dateText: "September 19, 2026",
    start: "2026-09-19",
    category: "Sports / Cultural",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/santa-cruz-wharf-annual-aloha-outrigger-races/",
    ],
    description:
      "The 34th annual outrigger canoe races, run for a day off the Santa Cruz Wharf.",
  },
  {
    slug: "bonny-doon-art-wine-and-beer-festival",
    name: "Bonny Doon Art, Wine and Beer Festival",
    county: "Santa Cruz",
    cityText: "Bonny Doon (Santa Cruz)",
    city: "Bonny Doon",
    months: ["september"],
    dateText: "September 19, 2026",
    start: "2026-09-19",
    category: "Art / Wine / Beer Festival",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/bonny-doon-art-wine-and-beer-festival/",
    ],
    description:
      "A one-day art, wine and beer festival in Bonny Doon, in the hills above Santa Cruz.",
  },
  {
    slug: "capitola-beach-festival",
    name: "Capitola Beach Festival ('Toy Takeover')",
    county: "Santa Cruz",
    cityText: "Capitola (Capitola Village & Beach)",
    city: "Capitola",
    venue: "Capitola Village & Beach",
    months: ["september"],
    dateText: "September 26-27, 2026",
    start: "2026-09-26",
    end: "2026-09-27",
    category: "Community / Beach Festival",
    officialWebsite: "https://capitolabeachfestival.com/",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://master.capitolachamber.com/events/details/capitola-beach-festival-4025",
      "https://www.cityofcapitola.org/community/page/capitola-beach-festival-capitola-village",
    ],
    description:
      "A two-day community beach festival across Capitola Village and beach, themed “Toy Takeover” for 2026.",
  },
  {
    slug: "open-studios-art-tour",
    name: "Open Studios Art Tour (41st Annual)",
    county: "Santa Cruz",
    cityText:
      "Countywide (Santa Cruz, Watsonville, Felton, Scotts Valley, Bonny Doon, Aptos)",
    months: ["october"],
    dateText: "",
    category: "Art Tour",
    officialWebsite: "https://santacruzopenstudios.com",
    referenceUrls: [
      "https://scal.org/open-studios-2026",
      "https://www.santacruz.org/blog/your-guide-to-open-studios/",
      "https://pajaronian.com/open-studios-art-tour-begin-saturday/",
    ],
    description:
      "The 41st annual countywide artist studio tour, spanning Santa Cruz, Watsonville, Felton, Scotts Valley, Bonny Doon and Aptos. The 2026 dates have not been announced.",
  },
  {
    slug: "downtown-santa-cruz-harvest-festival",
    name: "Downtown Santa Cruz Harvest Festival",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Downtown)",
    city: "Santa Cruz",
    venue: "Downtown Santa Cruz",
    months: ["october"],
    dateText: "October 3, 2026",
    start: "2026-10-03",
    category: "Seasonal / Community Festival",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/downtown-santa-cruz-harvest-festival/",
    ],
    description:
      "A one-day seasonal community festival in downtown Santa Cruz.",
  },
  {
    slug: "open-studios-satellite-preview-exhibit",
    name: "Open Studios Satellite Preview Exhibit (Santa Cruz Art League)",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Santa Cruz Art League)",
    city: "Santa Cruz",
    venue: "Santa Cruz Art League",
    months: ["october"],
    dateText: "October 2-18, 2026",
    start: "2026-10-02",
    end: "2026-10-18",
    category: "Art Exhibition",
    officialWebsite: "https://scal.org/open-studios-satellite-2026",
    referenceUrls: ["https://scal.org/upcoming-exhibitions/"],
    description:
      "A two-and-a-half-week preview exhibition of Open Studios artists at the Santa Cruz Art League.",
  },
  {
    slug: "santa-cruz-film-festival-2026",
    name: "Santa Cruz Film Festival 2026",
    county: "Santa Cruz",
    cityText: "Santa Cruz (various theaters)",
    city: "Santa Cruz",
    venue: "Various Santa Cruz theaters",
    months: ["october"],
    dateText: "October 14-18, 2026",
    start: "2026-10-14",
    end: "2026-10-18",
    category: "Film Festival",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/various-sc-theaters-santa-cruz-film-festival-2026/",
    ],
    description:
      "Five days of screenings across several Santa Cruz theaters.",
  },
  {
    slug: "downtown-santa-cruz-halloween-mask-making-festival",
    name: "Downtown Santa Cruz Halloween Mask Making Festival",
    county: "Santa Cruz",
    cityText: "Santa Cruz (London Nelson Community Center)",
    city: "Santa Cruz",
    venue: "London Nelson Community Center",
    months: ["october"],
    dateText: "October 17, 2026",
    start: "2026-10-17",
    category: "Halloween / Family",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/downtown-santa-cruz-halloween-mask-making-festival/",
    ],
    description:
      "A one-day Halloween mask-making event for families at the London Nelson Community Center.",
  },
  {
    slug: "santa-cruz-comedy-festival",
    name: "Santa Cruz Comedy Festival",
    county: "Santa Cruz",
    cityText: "Santa Cruz (939 Pacific Ave)",
    city: "Santa Cruz",
    venue: "939 Pacific Ave",
    months: ["october"],
    dateText: "October 17, 2026",
    start: "2026-10-17",
    category: "Comedy Festival",
    referenceUrls: ["https://allevents.in/santa-cruz/festivals"],
    description: "A one-day comedy festival at 939 Pacific Avenue in Santa Cruz.",
  },
  {
    slug: "santa-cruz-beach-boardwalk-halloween",
    name: "Santa Cruz Beach Boardwalk Halloween",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Santa Cruz Beach Boardwalk)",
    city: "Santa Cruz",
    venue: "Santa Cruz Beach Boardwalk",
    months: ["october"],
    dateText: "October 31, 2026",
    start: "2026-10-31",
    category: "Halloween / Family",
    officialWebsite: "https://beachboardwalk.com/",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/sc-beach-boardwalk-halloween/",
    ],
    description:
      "Halloween day at the Santa Cruz Beach Boardwalk, a family event on October 31.",
  },
  {
    slug: "santa-cruz-harbor-trick-or-treat",
    name: "Santa Cruz Harbor Trick-Or-Treat (Haunted Harbor)",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Santa Cruz Harbor)",
    city: "Santa Cruz",
    venue: "Santa Cruz Harbor",
    months: ["october"],
    dateText: "October 31, 2026",
    start: "2026-10-31",
    category: "Halloween / Family",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/santa-cruz-harbor-trick-or-treat/",
    ],
    description:
      "Halloween trick-or-treating at Santa Cruz Harbor, billed as Haunted Harbor.",
  },
  {
    slug: "vampire-ball-at-chaminade-resort-spa",
    name: "Vampire Ball at Chaminade Resort & Spa",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Chaminade Resort and Spa)",
    city: "Santa Cruz",
    venue: "Chaminade Resort and Spa",
    months: ["october"],
    dateText: "October 31, 2026",
    start: "2026-10-31",
    category: "Halloween / Nightlife (21+)",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/chaminade-resort-and-spa-vampire-ball/",
    ],
    description:
      "A 21-and-over Halloween night event at the Chaminade Resort and Spa in Santa Cruz.",
  },
  {
    slug: "watsonville-dia-de-muertos-festival",
    name: "Watsonville Dia de Muertos Festival",
    county: "Santa Cruz",
    cityText: "Watsonville (Watsonville City Plaza)",
    city: "Watsonville",
    venue: "Watsonville City Plaza",
    months: ["november"],
    dateText: "November 1, 2026",
    start: "2026-11-01",
    category: "Cultural Festival",
    officialWebsite: "https://watsonville.gov/",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/watsonville-plaza-dia-de-los-muertos/",
      "https://festivalguidesandreviews.com/california-festivals/",
    ],
    description:
      "A one-day Día de Muertos cultural festival at Watsonville City Plaza.",
  },
  {
    slug: "santa-cruz-sea-glass-and-ocean-art-festival",
    name: "Santa Cruz Sea Glass and Ocean Art Festival (18th Annual)",
    county: "Santa Cruz",
    cityText: "Santa Cruz (The Grove)",
    city: "Santa Cruz",
    venue: "The Grove",
    months: ["november"],
    dateText: "November 7-8, 2026",
    start: "2026-11-07",
    end: "2026-11-08",
    category: "Art Festival",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/sea-glass-ocean-art-festival/",
      "https://allevents.in/santa-cruz/festivals",
    ],
    description:
      "The 18th annual sea glass and ocean art festival, two days at The Grove in Santa Cruz.",
  },
  {
    slug: "santa-cruz-beach-boardwalk-winter-wonderland",
    name: "Santa Cruz Beach Boardwalk Winter Wonderland",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Santa Cruz Beach Boardwalk)",
    city: "Santa Cruz",
    venue: "Santa Cruz Beach Boardwalk",
    months: ["november", "december"],
    dateText: "November 26, 2026 - January 3, 2027",
    start: "2026-11-26",
    end: "2027-01-03",
    category: "Holiday / Family",
    officialWebsite: "https://beachboardwalk.com/",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/santa-cruz-beach-boardwalk-winter-wonderland/",
    ],
    description:
      "The Boardwalk's holiday season, running from Thanksgiving through the first days of January.",
  },
  {
    slug: "a-taste-of-ireland-a-celtic-christmas",
    name: "A Taste of Ireland: A Celtic Christmas",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Santa Cruz Civic Auditorium)",
    city: "Santa Cruz",
    venue: "Santa Cruz Civic Auditorium",
    months: ["december"],
    dateText: "December 2, 2026",
    start: "2026-12-02",
    category: "Holiday / Performance",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/santa-cruz-civic-center-a-taste-of-ireland/",
    ],
    description:
      "A one-night holiday performance at the Santa Cruz Civic Auditorium.",
  },
  {
    slug: "downtown-boulder-creek-market-ugly-sweater-contest",
    name: "Downtown Boulder Creek Market & Ugly Sweater Contest",
    county: "Santa Cruz",
    cityText: "Boulder Creek",
    city: "Boulder Creek",
    months: ["december"],
    dateText: "December 4, 2026",
    start: "2026-12-04",
    category: "Holiday / Market",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/downtown-boulder-creek-ugly-sweater-contest/",
    ],
    description:
      "A one-day holiday market and ugly sweater contest in downtown Boulder Creek.",
  },
  {
    slug: "santa-cruz-harbor-lighted-boat-parade",
    name: "Santa Cruz Harbor Lighted Boat Parade",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Santa Cruz Harbor)",
    city: "Santa Cruz",
    venue: "Santa Cruz Harbor",
    months: ["december"],
    dateText: "December 5, 2026",
    start: "2026-12-05",
    category: "Holiday / Parade",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/santa-cruz-harbor-lighted-boat-parade/",
    ],
    description:
      "A one-evening parade of lit boats through Santa Cruz Harbor.",
  },
  {
    slug: "hallcrest-vineyards-holiday-market",
    name: "Hallcrest Vineyards Holiday Market",
    county: "Santa Cruz",
    cityText: "Felton (Hallcrest Vineyards)",
    city: "Felton",
    venue: "Hallcrest Vineyards",
    months: ["december"],
    dateText: "December 6, 2026",
    start: "2026-12-06",
    category: "Holiday / Market",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/hallcrest-vineyards-holiday-market/",
    ],
    description: "A one-day holiday market at Hallcrest Vineyards in Felton.",
  },
  {
    slug: "downtown-santa-cruz-holiday-parade",
    name: "Downtown Santa Cruz Holiday Parade",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Pacific Avenue, Downtown)",
    city: "Santa Cruz",
    venue: "Pacific Avenue, Downtown Santa Cruz",
    months: ["december"],
    dateText: "",
    category: "Holiday / Parade",
    officialWebsite:
      "https://www.santacruzca.gov/Government/City-Departments/Parks-Recreation/Santa-Cruz-Holiday-Parade",
    referenceUrls: [
      "https://downtownsantacruz.com/events/downtown-holiday-parade",
      "https://downtownsantacruz.com/events/holidays",
    ],
    description:
      "Santa Cruz's holiday parade along Pacific Avenue downtown. The 2026 date has not been announced.",
  },
  {
    slug: "hotel-paradox-holiday-market",
    name: "Hotel Paradox Holiday Market",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Hotel Paradox)",
    city: "Santa Cruz",
    venue: "Hotel Paradox",
    months: ["december"],
    dateText: "December 20, 2026",
    start: "2026-12-20",
    category: "Holiday / Market",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/hotel-paradox-holiday-market/",
    ],
    description: "A one-day holiday market at the Hotel Paradox in Santa Cruz.",
  },
];

/**
 * America/Los_Angeles UTC offset for a date in this dataset. PDT runs through
 * Sunday November 1, 2026, when clocks go back; PST applies from November 2.
 *
 * Only meaningful once a sourced clock time exists — a date-only ISO 8601 value
 * carries no offset, and nothing in this dataset has a published start time yet.
 */
export function pacificOffset(iso: string): "-07:00" | "-08:00" {
  return iso <= "2026-11-01" ? "-07:00" : "-08:00";
}

/** Where this event's page lives — its own, an existing Car Week page, or a hub. */
export function eventHref(event: RegionalEvent): string {
  if (event.hubHref) return event.hubHref;
  return `/event/${event.existingSlug ?? event.slug}/`;
}

/** True when this row gets its own generated /event/ page. */
export function hasOwnPage(event: RegionalEvent): boolean {
  return !event.existingSlug && !event.hubHref;
}

/** Rows that need a page built for them — everything else already has a URL. */
export const regionalEventPages = regionalEvents.filter(hasOwnPage);

export const monthMeta = (key: MonthKey) => {
  const m = MONTHS.find((x) => x.key === key);
  if (!m) throw new Error(`Unknown month key "${key}"`);
  return m;
};

export const monthTitle = (key: MonthKey) =>
  `Central Coast Events in ${monthMeta(key).label} — Monterey and Santa Cruz`;

export const monthHref = (key: MonthKey) => `/events/${key}/`;

/**
 * Events in a month, earliest first. Undated events sort last — they are real
 * listings, they just cannot be placed on the calendar yet.
 *
 * A run that starts before the month (the Boardwalk's Winter Wonderland opens in
 * November and runs through December) sorts from the month's first day, not from
 * its own start, so it lands with the other events actually happening then.
 */
export function eventsInMonth(key: MonthKey): RegionalEvent[] {
  const first = `${monthMeta(key).iso}-01`;
  const sortKey = (e: RegionalEvent) =>
    !e.start ? "9999" : e.start > first ? e.start : first;
  return regionalEvents
    .filter((e) => e.months.includes(key))
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)) || a.name.localeCompare(b.name));
}

export const eventsByMonth = MONTHS.map((m) => ({
  ...m,
  events: eventsInMonth(m.key),
}));

/** Previous / next month hub, for the prev-next links on each hub page. */
export function adjacentMonths(key: MonthKey) {
  const i = MONTHS.findIndex((m) => m.key === key);
  return { prev: MONTHS[i - 1], next: MONTHS[i + 1] };
}

/** The month hub an event page links back to — its first, for a two-month run. */
export function primaryMonth(event: RegionalEvent): MonthKey {
  const first = event.months[0];
  if (!first) throw new Error(`Event "${event.slug}" has no month`);
  return first;
}

/**
 * The month hub to feature on the homepage, plus the one after it. Resolved at
 * build time from the build date and clamped to the months this dataset covers,
 * so a build outside August–December 2026 still links somewhere real rather than
 * to a 404.
 */
export function currentAndNextMonth(now: Date): {
  current: (typeof MONTHS)[number];
  next?: (typeof MONTHS)[number];
} {
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  let i = MONTHS.findIndex((m) => m.iso === stamp);
  if (i === -1) i = stamp < MONTHS[0]!.iso ? 0 : MONTHS.length - 1;
  const current = MONTHS[i]!;
  return { current, next: MONTHS[i + 1] };
}

export const totalRegionalEvents = regionalEvents.length;
export const totalUndated = regionalEvents.filter((e) => !e.start).length;
