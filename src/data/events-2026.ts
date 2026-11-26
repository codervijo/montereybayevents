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
 * The CSV carries no clock times, so `start` / `end` are date-only ISO 8601 —
 * which schema.org accepts ("Date or DateTime"). Padding a date out to midnight
 * would put a time we do not have in front of someone deciding when to show up.
 *
 * Where door hours have since been sourced from outside the CSV they live in
 * `times`, tagged with `timesConfidence`. Hours the organiser has not published
 * are shown to the reader alongside a plain statement of who has and has not
 * published them, and are kept out of the Event JSON-LD — structured data is
 * quoted without its qualifiers, so only an organiser-published time earns it.
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
  /**
   * Street address of the venue. Set only where a real published address has
   * been sourced — never derived from the venue name. Feeds schema.org
   * PostalAddress.streetAddress.
   */
  streetAddress?: string;
  /** ZIP, on the same terms as `streetAddress`. */
  postalCode?: string;
  /**
   * Door hours, one entry per day of the run. Absent for every row transcribed
   * from the CSV, which carries no clock times.
   */
  times?: { day: string; hours: string }[];
  /**
   * Where `times` came from, in the same vocabulary `/traffic/` uses for its
   * closures: `official` when the organiser publishes the hours themselves,
   * `unconfirmed` when they are recorded from a secondary listing and the
   * organiser has not published or confirmed them.
   *
   * `unconfirmed` hours are shown to the reader — with the page saying plainly
   * who has and has not published them — but are kept out of the Event JSON-LD.
   * A time in structured data can surface in a search result stripped of every
   * qualifier around it, so only an organiser-published time earns that.
   */
  timesConfidence?: "official" | "unconfirmed";
  /**
   * 24-hour `HH:MM`, Pacific. The machine-readable counterpart to `times`,
   * which is display copy and deliberately not parsed — reading a clock time
   * back out of "2:00pm – 7:00pm" is the kind of string handling that fails
   * silently on the one row someone typed differently.
   *
   * These are the ONLY route by which a clock time reaches `startDate` /
   * `endDate`, and `buildRegionalEventJsonLd` ignores them unless
   * `timesConfidence` is `"official"`. A structured-data time gets quoted in a
   * search result stripped of every qualifier around it, so it has to be the
   * organiser's own.
   */
  startTime?: string;
  endTime?: string;
  /**
   * 24-hour `HH:MM`, Pacific — when doors open. Same terms as `startTime`:
   * emitted as schema.org `doorTime` only when `timesConfidence` is
   * `"official"`.
   */
  doorTime?: string;
  /**
   * schema.org subtype for the Event node. Absent means plain `Event`, which
   * is every row until v2.P. One member because one row needed it; add more
   * only when a row's organiser material clearly puts it in that type.
   */
  schemaType?: "MusicEvent";
  /**
   * The organiser's ticketing page, where it differs from `officialWebsite`.
   * Becomes `offers.url` and a visible "Buy tickets" link. Only meaningful
   * alongside a ticketed `admission`.
   */
  ticketsUrl?: string;
  /**
   * Who puts the event on, and who performs. Set only from the organiser's
   * own material — never inferred from a listing — and emitted as schema.org
   * `organizer` / `performer`. Absent on every row before v2.P.
   */
  organizer?: { type: "PerformingGroup" | "Organization"; name: string; url?: string };
  performer?: { type: "PerformingGroup" | "Person"; name: string; url?: string }[];
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
   * Overrides the default `<title>` (`${name} — ${month.label}`). Set only where
   * the default is wrong for a specific page — the default carries the year, and
   * a title that names a year goes stale in the SERP the moment the year turns
   * while the H1 and dateline can carry it safely.
   */
  seoTitle?: string;
  /** Overrides the H1. The H1 serves the reader; the title serves the SERP. */
  headline?: string;
  /**
   * Overrides the meta description. The default reuses `description`, which is
   * written from CSV facts and says what an event IS; a researched page can say
   * what the reader GETS instead, which is what earns the click.
   */
  metaDescription?: string;
  /**
   * Long-form body for a page we have actually researched, rather than the
   * one-line `description` every CSV row gets. Present on the handful of
   * listings where an organiser publishes enough to write something useful;
   * absent everywhere else, and absent is the honest default — a padded page
   * is worse than a short one.
   */
  intro?: string;
  sections?: { heading: string; body: string[] }[];
  /**
   * v2.Z. When the event normally happens, in one sentence, set ONLY where the
   * organiser says it recurs ("annual", "Nth annual", "every October"). Once
   * the 2026 run is over the page reads as an annual-event page: this line,
   * then `nextEdition` or a plain "not announced".
   */
  recurrence?: string;
  /** v2.Z. The next edition's dates, only as the organiser announces them. */
  nextEdition?: { start: string; end?: string; source: string };
  /**
   * Admission, and the first field in this dataset that unblocks v1.C.
   *
   * Set ONLY where the ORGANISER states it in their own words. The CSV carries
   * no admission column, so every row is undefined until someone checks — and
   * undefined stays undefined rather than defaulting to anything. A guessed
   * price is worse than no price, and "free" asserted wrongly about a ticketed
   * event is worse still.
   *
   * The union grows one checked organiser at a time; do not add a member
   * speculatively. When set, the page shows a visible admission badge AND the
   * Event JSON-LD carries a matching Offer — never one without the other.
   *
   * `"free"` was the only member until v1.Y, when Bonny Doon became the first
   * row whose organiser publishes real ticket prices. Paid admission carries
   * its own price rather than a bare label, because a ticketed Offer with no
   * price says nothing that the absence of an Offer did not already say.
   *
   * `from` is the LOWEST price at which a person can get through the gate, in
   * whole currency units. It is deliberately a floor, not a range: Google reads
   * `price` as the amount payable, and the cheapest real ticket is the only
   * figure that stays true no matter which tier someone buys. Tiers above it
   * belong in the visible page copy, where they can be explained.
   */
  admission?: "free" | { kind: "ticketed"; from: number; currency: "USD" };

  /**
   * ISO date this row's CONTENT was last substantively changed — set by hand,
   * on the same commit that changes it, and only for real content changes.
   *
   * Feeds `<lastmod>` in the sitemap. Deliberately not derived from git: every
   * row lives in this one file, so a git-derived date would tell Google all 54
   * regional pages changed whenever any one of them did, which is the exact
   * unreliable-lastmod pattern Google learns to ignore. A page with no
   * `updated` simply gets no lastmod, which is honest and still leaves the
   * pages that DID change carrying a real signal.
   */
  updated?: string;

  /**
   * A link to one of our own guide pages, rendered as a real anchor rather
   * than smuggled into `sections` prose — those render as plain text, so a
   * markdown link in them ships literal brackets to the reader.
   */
  guideLink?: { href: string; label: string; blurb: string };

  /** Rendered visibly AND emitted as FAQPage JSON-LD. Never one without the other. */
  faq?: { q: string; a: string }[];

  /**
   * Suppresses the "Where this listing comes from" block on this page alone.
   * Set where the sources have been superseded by directly-sourced facts and
   * listing the original reference would misdescribe where the page's content
   * actually came from.
   */
  hideSources?: boolean;
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
    venue: "Ocean Avenue, Carmel-by-the-Sea",
    metaDescription: "Carmel's own Car Week days on Ocean Avenue: what ran 11–16 August 2026, the free Larson Field shuttle, and the $40 Concours shuttle from Carmel Plaza.",
    intro: "Carmel Car Week is the town's share of the wider Monterey Car Week fortnight: a run of street car shows on Ocean Avenue in Carmel-by-the-Sea, followed by shuttles out to the Pebble Beach events. In 2026 it ran from Tuesday 11 to Sunday 16 August. The three Carmel days were Concours for a Cause on the Tuesday, Astons on the Avenue on the Wednesday and the Ferrari Owners Club's fourth annual Concours Carmel on the Thursday, each closing several blocks of Ocean Avenue to display cars. Visit Carmel, which publishes the Car Week page, has not yet posted 2027 dates.",
    sections: [
      {
        heading: "The three Ocean Avenue days in 2026",
        body: [
          "Concours for a Cause opened the week on Tuesday 11 August, 10am to 4pm, on Ocean Avenue between Junipero and Lincoln Streets. It was free and open to the public, and visitors voted for their favourite cars with wooden tokens, with the event supporting local non-profits.",
          "Astons on the Avenue followed on Wednesday 12 August, 11am to 4pm, on Ocean Avenue between Monte Verde and Lincoln Streets, in aid of the Multiple Myeloma Research Foundation. Visit Carmel says the previous year's event raised more than $43,000.",
          "On Thursday 13 August the Ferrari Owners Club of Northern California held its fourth annual Concours Carmel from 9am to 4pm, spread over five blocks around Ocean Avenue and Dolores Street. It was free, and alongside Ferraris it took in Maseratis and Italian motorcycles, with live entertainment, owner interviews and awards.",
        ],
      },
      {
        heading: "Parking and the shuttles",
        body: [
          "For the three Ocean Avenue days, Visit Carmel pointed drivers to free parking at Larson Field, next to Carmel Mission on Rio Road, with a free shuttle looping to and from Carmel Plaza every 10 to 15 minutes between 8am and 9pm.",
          "For the Pebble Beach Concours d'Elegance on Sunday 16 August, the Carmel Chamber of Commerce ran a separate shuttle from Carmel Plaza to Pebble Beach between 8am and 6pm, every 20 to 30 minutes. It cost $40 a person for unlimited rides that day, with children under 12 free and no refunds; passes were sold online, at the Carmel Visitor Center in Carmel Plaza and at the shuttle stop on the day.",
        ],
      },
      {
        heading: "How it fits around Pebble Beach",
        body: [
          "The second half of the week belongs to Pebble Beach rather than Carmel itself. Visit Carmel's page lists the Tour d'Elegance on Thursday 13 August, Concours Village and the RetroAuto automobilia market from 13 to 15 or 16 August, the ticketed Classic Car Forum, and the ticketed Pebble Beach Concours d'Elegance at The Lodge at Pebble Beach on Sunday 16 August. The Carmel shows are the free, walk-up part of the week; the Pebble Beach Concours is not.",
        ],
      },
    ],
    faq: [
      {
        q: "When was Carmel Car Week in 2026?",
        a: "Tuesday 11 to Sunday 16 August 2026, inside the wider Monterey Car Week that ran 7 to 16 August.",
      },
      {
        q: "Were the Carmel car shows free?",
        a: "Concours for a Cause and the Ferrari Concours Carmel were listed as free. Visit Carmel gave no admission price for Astons on the Avenue, which was a charity fundraiser.",
      },
      {
        q: "Where do you park for the Ocean Avenue shows?",
        a: "In 2026 Visit Carmel listed free parking at Larson Field by Carmel Mission on Rio Road, with a free shuttle to Carmel Plaza from 8am to 9pm on the Tuesday to Thursday.",
      },
      {
        q: "Have the 2027 dates been announced?",
        a: "Not on Visit Carmel's Car Week page yet.",
      },
    ],
    updated: "2026-11-26",
    hideSources: true,
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
    updated: "2026-08-18",
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
    officialWebsite: "https://westendcelebration.com/",
    venue: "West End district, Sand City",
    admission: "free",
    seoTitle: "West End Celebration 2026 \u2014 Dates, Parking & Free Shuttle",
    metaDescription:
      "Free, 22\u201323 August 2026 in Sand City. Six blocks closed to cars, three stages. Where to park, the free MST shuttle, and why listings show the wrong dates.",
    headline: "Sand City West End Celebration 2026",
    hideSources: true,
    intro:
      "The West End Celebration runs Saturday 22 and Sunday 23 August 2026 in Sand City, and it is free \u2014 the organisers state plainly that \u201cthere is no admission fee for the West End Celebration.\u201d Six blocks of the West End district close to cars for the weekend, along Ortiz Avenue and Redwood Avenue between Contra Costa Street and Holly Street. Expect three stages of live music, open galleries and more than 150 artists, vendors and local nonprofits. Opening times for 2026 have not been published yet.",
    sections: [
      {
        heading: "Check the year before you trust a date",
        body: [
          "This is the thing most likely to send you on the wrong weekend. A lot of what is still circulating online \u2014 event aggregators, festival directories, cached listing pages \u2014 carries the 2025 dates of 23 and 24 August. The 2026 event is Saturday 22 and Sunday 23 August, one day earlier in the week, and that is what the organisers publish on their own site.",
          "The same trap applies to the shuttle. The most findable page describing an MST free bus for this festival, complete with route number, pickup points and a timetable, is an announcement from 2010. Its details are sixteen years old. Do not plan around them.",
        ],
      },
      {
        heading: "What it actually is",
        body: [
          "Sand City is the smallest city on the Monterey Peninsula, and for one weekend its industrial West End is given over to pedestrians. Streets that normally carry cars become the venue: galleries open their doors, artists set up on the sidewalk, and three stages carry local and regional musicians continuously through the day.",
          "The organisers put the count at more than 150 vendors, artists and local nonprofits, alongside food vendors and bars serving beer and wine. It has run for over twenty years and is produced by By The Glass Design. The character is closer to a neighbourhood block party that happens to have three stages than to a ticketed music festival \u2014 which is why it stays free.",
        ],
      },
      {
        heading: "Parking, the shuttle and the bike valet",
        body: [
          "Parking is the part people underestimate. The organisers say parking is available in designated areas around Sand City but that spaces fill quickly, and they actively encourage arriving another way. Six blocks of the street grid are closed, so the parking that does exist is further from the festival than a map suggests.",
          "MST runs a free shuttle for the weekend. The organisers confirm the service for 2026 \u2014 free, serving various points around Sand City \u2014 but no 2026 route, pickup list or timetable has been published anywhere we can find. If you are relying on it, check mst.org or ask the organisers directly before the weekend rather than turning up expecting the 2010 schedule.",
          "If you can ride there, do. A complimentary bike valet is provided by Greed Pedal Couriers, which sidesteps the parking problem entirely and is the single best piece of logistics advice for this event.",
        ],
      },
      {
        heading: "What it costs once you are inside",
        body: [
          "Admission is free and there is no ticket to buy. Money is spent inside: food vendors, and bars serving beer and wine. Open containers are permitted on the celebration footprint only \u2014 so a drink bought inside can travel between stages, but it cannot leave the closed streets, and outside alcohol is not allowed in.",
          "Bring both cash and cards. The organisers recommend carrying both, and they do not publish an ATM location.",
        ],
      },
      {
        heading: "Rules that catch people out",
        body: [
          "Dogs are welcome, with a caveat the organisers put well: be sure your dog can handle large crowds and loud music. Three stages in six closed blocks is a lot of sound in a small footprint.",
          "Left at home: outside alcohol and coolers, large bags and backpacks, drones, and unauthorised recording equipment. Worth bringing: comfortable shoes, sunscreen, a hat and a reusable water bottle \u2014 the West End is flat, exposed and short on shade.",
        ],
      },
      {
        heading: "What has not been published",
        body: [
          "Opening and closing times for 2026. The organisers\u2019 own FAQ says only that \u201cevent opening times will be announced soon,\u201d so this page carries no hours rather than repeating last year\u2019s. When they are announced, they land here.",
          "The 2026 shuttle route and timetable, the music lineup and stage times, and any ATM or accessibility provision. None of these are published by the organisers at the time of writing, and none of them are guessed here.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the West End Celebration in 2026?",
        a: "Saturday 22 and Sunday 23 August 2026. Note that many listings still show the 2025 dates of 23 and 24 August \u2014 the 2026 event is a day earlier.",
      },
      {
        q: "Is the West End Celebration free?",
        a: "Yes. The organisers state that there is no admission fee. Food, drink and anything you buy from vendors are not.",
      },
      {
        q: "Where exactly is it held?",
        a: "In Sand City\u2019s West End district, along Ortiz Avenue and Redwood Avenue between Contra Costa Street and Holly Street. Six blocks are closed to traffic for the weekend.",
      },
      {
        q: "What time does it start?",
        a: "Not yet announced. The organisers\u2019 FAQ says opening times will be published closer to the event, so no start time is listed here \u2014 last year\u2019s hours are not a safe guide.",
      },
      {
        q: "Where do I park, and is there a shuttle?",
        a: "Parking is in designated areas around Sand City and fills quickly. MST provides a free shuttle for the weekend, but no 2026 route or timetable has been published \u2014 check mst.org before you travel. There is also a free bike valet from Greed Pedal Couriers.",
      },
      {
        q: "Can I bring my dog?",
        a: "Yes, friendly dogs are welcome. The organisers ask that you make sure your dog can handle large crowds and loud music, which is a fair warning for three stages in six closed blocks.",
      },
    ],
  },
  {
    slug: "california-turkish-arts-culture-festival",
    updated: "2026-08-18",
    name: "California Turkish Arts & Culture Festival",
    county: "Monterey",
    cityText: "Monterey (Custom House Plaza)",
    city: "Monterey",
    venue: "Custom House Plaza",
    streetAddress: "20 Custom House Plaza",
    postalCode: "93940",
    months: ["august"],
    dateText: "August 29-30, 2026",
    start: "2026-08-29",
    end: "2026-08-30",
    times: [
      { day: "Saturday, August 29", hours: "11:00 a.m. – 7:00 p.m." },
      { day: "Sunday, August 30", hours: "11:00 a.m. – 7:00 p.m." },
    ],
    timesConfidence: "official",
    category: "Cultural Festival",
    referenceUrls: ["https://whatsupmonterey.com/events"],
    description:
      "A two-day Turkish arts and culture festival at Custom House Plaza in Monterey.",
    intro:
      "The Turkish festival at Custom House Plaza returns for its 26th year on Saturday 29 and Sunday 30 August 2026, at Custom House Plaza on the Monterey waterfront, and admission is free. It is presented by the Turkish American Association of California, a 501(c)(3) nonprofit founded in 1975. Expect Whirling Dervishes, folk and belly dancing, live Turkish music, artisan booths and a full Turkish menu. The organisers publish hours of 11:00 a.m. to 7:00 p.m. on both days — though several listings disagree about Sunday, which is worth knowing before you plan a late afternoon.",
    sections: [
      {
        heading: "Two things to check before you go",
        body: [
          "The first is the name, because this festival is listed under at least three of them. The organisers themselves use Monterey Turkish Arts & Culture Festival. Local listings variously use Monterey Turkish Arts and Cultural Festival and California Turkish Arts & Culture Festival. All three are the same event, on the same plaza, on the same weekend — so if a search turns up what looks like two festivals, it is one.",
          "The second matters more on the day. The Turkish American Association of California publishes hours of 11:00 a.m. to 7:00 p.m. on both Saturday and Sunday. Several secondary listings, including local ones, show Sunday closing an hour earlier at 6:00 p.m. We publish the organiser's hours because they are the organiser's — but if you are arriving late on Sunday specifically to see something, treat 6:00 p.m. as the safe assumption rather than 7:00.",
        ],
      },
      {
        heading: "What actually happens there",
        body: [
          "The signature act is the Whirling Dervishes, performing the sema — the Mevlevi turning ceremony — with teaching demonstrations alongside it, so you get an explanation rather than only a spectacle. Sources differ on whether they appear both days or Saturday only.",
          "Around that runs continuous live music and dance: Turkish folk dances including the Horon, Dirmil and Silifke, belly dancing, and in 2026 the Group Taksim Big Band. Past years have included a mini Turkish wedding dance taught to the audience, which is the sort of thing that makes this feel like a community event rather than a performance watched from behind a rope.",
          "The artisan side is the quieter half and easy to miss. Booths demonstrate traditional crafts including ebru, the art of water marbling, and Turkish carpet weaving — both slow, hands-on, and far more interesting up close than any stage act at fifty metres.",
        ],
      },
      {
        heading: "The food is why many people come",
        body: [
          "The kitchen runs to a real menu rather than festival snacks: Adana kebap and doner kebap, borek, gözleme cooked to order, simit, and baklava with kaymak. Turkish coffee and tea are served throughout.",
          "This is one of the few places on the Peninsula to eat this food, which is why the queues at the food booths tend to be longer than the queues for anything else. If eating is the priority, arrive nearer opening than closing.",
        ],
      },
      {
        heading: "Where it is, and bringing children",
        body: [
          "Custom House Plaza sits inside Monterey State Historic Park at 20 Custom House Plaza, immediately beside Old Fisherman's Wharf. It is the plaza in front of the Custom House itself: flat, paved, walkable from downtown Monterey and directly on the waterfront.",
          "Children's activities are a real part of the programme rather than a corner with crayons — puppet making, face painting, colouring, games, and folk dancing children are pulled into rather than shown. Admission is free for everyone, so a short visit costs nothing but parking.",
        ],
      },
      {
        heading: "What has not been published",
        body: [
          "A stage schedule. There is no published running order for either day, so which act is on when is not something this page can tell you — and that includes the Dervish performances.",
          "Any parking guidance from the organisers. Custom House Plaza has no parking of its own, and while downtown Monterey's garages and waterfront lots are the usual answer, the organisers publish nothing official about them and neither will we.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the Monterey Turkish festival in 2026?",
        a: "Saturday 29 and Sunday 30 August 2026 — its 26th year. The organisers publish 11:00 a.m. to 7:00 p.m. on both days, though several listings show Sunday closing at 6:00 p.m.",
      },
      {
        q: "Is it free?",
        a: "Yes. Admission is free on both days, for all ages. Food, drink and anything bought from the artisan booths are not.",
      },
      {
        q: "Why do I see it under different names?",
        a: "It is listed as the Monterey Turkish Arts & Culture Festival, the Monterey Turkish Arts and Cultural Festival, and the California Turkish Arts & Culture Festival. Same event, same plaza. The organisers use the first.",
      },
      {
        q: "Will the Whirling Dervishes perform on both days?",
        a: "Sources disagree. Some say both Saturday and Sunday; the organisers' own page lists Saturday. No running order has been published, so if this is why you are going, Saturday is the safer choice.",
      },
      {
        q: "Where exactly is Custom House Plaza?",
        a: "20 Custom House Plaza, Monterey CA 93940, inside Monterey State Historic Park and directly beside Old Fisherman's Wharf. Flat, paved and walkable from downtown Monterey.",
      },
      {
        q: "Who runs it?",
        a: "The Turkish American Association of California, also known as CalTurks — a California 501(c)(3) nonprofit founded in 1975. This is their 26th year running the Monterey festival.",
      },
    ],
    officialWebsite: "https://www.turkfestca.org/",
    seoTitle: "Turkish Festival Monterey 2026 — Dates, Hours & What’s On",
    metaDescription:
      "Free, 29–30 August 2026 at Custom House Plaza. Whirling Dervishes, Turkish food, hours — and why some listings show a different name and a shorter Sunday.",
    headline: "California Turkish Arts & Culture Festival 2026",
    hideSources: true,
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
    streetAddress: "2004 Fairground Road",
    postalCode: "93940",
    updated: "2026-08-21",
    times: [
      { day: "Thursday 3 – Sunday 6 September", hours: "11:00 a.m. – 11:00 p.m." },
      { day: "Monday 7 September", hours: "10:00 a.m. – 11:00 p.m." },
    ],
    timesConfidence: "unconfirmed",
    officialWebsite: "https://montereycountyfair.com/monterey-county-fair/",
    metaDescription:
      "3–7 September 2026. Advance adult admission $16.95, three free-entry days, $25 parking off-site — and the arena tickets fair admission does not cover.",
    intro:
      "The Monterey County Fair runs Thursday 3 to Monday 7 September 2026 at the Monterey County Fair & Event Center, 2004 Fairground Road. Advance adult admission is $16.95, and there are three separate days when a whole category gets in free. Five nights of headline concerts are included with admission — but the rodeo and arena events are not, which is the single thing most likely to catch you out.",
    sections: [
      {
        heading: "Check the day of the week, not just the date",
        body: [
          "Several listings circulating for this fair pair the right dates with the wrong weekdays — \"Friday, September 3\" turns up repeatedly, and 3 September 2026 is a Thursday. The same listings put Left of Centre on the Payton Stage on the opening night. The organisers have Eli Young Band on Payton that night; Left of Centre plays the Turf Stage, twice a night, Thursday through Sunday.",
          "The fair itself runs Thursday 3 through Monday 7 September, five days ending on Labor Day. If a listing shows you a weekday, check it against the date before you plan around it.",
        ],
      },
      {
        heading: "What admission costs, and the three days it costs nothing",
        body: [
          "Advance prices are $16.95 for adults 13–61, $13.56 for seniors 62 and over, and $9.04 for children 6–12. Children 5 and under are free every day. Prices rise once the fair opens on 3 September, so buying ahead is worth real money rather than a token discount.",
          "Three days carry a full free-entry category. Thursday 3 September is Seniors Day — anyone 62 or better is admitted free all day. Friday 4 September is Military and Veterans Day, with all military, veterans and their dependents free all day. Monday 7 September is Kids Day, with everyone 12 and under free all day.",
          "There is also a military pre-sale at $12 for adults and $6 for children 6–12, valid with military ID and including dependents. It runs through 28 August, so it closes before the fair does.",
        ],
      },
      {
        heading: "The tickets that fair admission does NOT cover",
        body: [
          "This is where money goes unexpectedly. Arena events are separately ticketed, from $5.65 to $20.34, and fair admission is not included in them. Carnival rides are separate too: an unlimited single-day wristband is $35 in pre-sale, or $55 with front-of-line access.",
          "The Flying U Rodeo is a mixed case worth reading carefully. General admission is free with fair entry on Friday, Saturday and Sunday, and box seats are $17. But the Sunday performance is separately ticketed at $14 for adults and $7 for children 6–12, with under-5s free. Mutton Bustin\u2019 for ages 4 to 7 costs $10 to enter, and runs Friday 6 p.m., Saturday 6 p.m., and twice on Sunday at 2 p.m. and 6 p.m.",
          "Two add-ons exist if you plan to eat and play: a Family Meal Deal at $55 that the fair values at $111, and a Game Pass at $55 for $100 of credits.",
        ],
      },
      {
        heading: "Parking is off-site and limited",
        body: [
          "Parking is at Monterey Pines Golf Course at $25 per vehicle — not at the fairgrounds themselves. The organisers describe parking as extremely limited and actively encourage carpooling, taxis, public transport or the shuttle service instead.",
          "That matters more than it sounds for a fair that runs to 11 p.m. Arriving late on a Saturday with a car and no plan is the version of this day that goes badly.",
        ],
      },
      {
        heading: "The concerts are free with admission",
        body: [
          "Five headline nights on the Payton Stage, all at 7:30 p.m. and all included with fair admission: Eli Young Band on Thursday 3rd, Devotional \u2014 The Depeche Mode Experience featuring Freddie Morales on Friday 4th, Journey Revisited on Saturday 5th, Amigo Bronco The Tribute on Sunday 6th, and Twist On Taylor on Monday 7th.",
          "The Turf Stage at the Buckaroos and Brews Saloon runs Left of Centre twice nightly, at 6 p.m. and 9 p.m., Thursday through Sunday. The Island Stage rotates daily with Salsa Steel Drums from 1 p.m. and Jimmy Becker from 5 p.m.",
          "Around them run the acts that make a county fair a county fair: Master Hypnotist Tina Marie, Frank Thurston\u2019s family comedy magic, The Wilder Show, the stilt-walking Slim & Curly, Brad\u2019s World Reptiles, the K9 Kings Flying Dog Show, and All Creatures Barnyard Races \u2014 pigs, goats, sheep, ducks, turkeys, chickens and geese. Twenty-plus regional community performers fill the rest.",
        ],
      },
      {
        heading: "What has not been published",
        body: [
          "Confirmed gate hours. The hours shown above \u2014 11:00 a.m. to 11:00 p.m. Thursday to Sunday and 10:00 a.m. to 11:00 p.m. on Monday \u2014 come from a secondary listing rather than from the fair\u2019s own site, so they are not carried in this page\u2019s structured data. They fit the Thursday-to-Monday run exactly, which is a point in their favour, but the fair has not published them itself. Call (831) 372-5863 if the opening time decides your day.",
          "Set times for the community stages, and the exhibit and livestock judging schedule.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the Monterey County Fair in 2026?",
        a: "Thursday 3 to Monday 7 September 2026, five days ending on Labor Day, at 2004 Fairground Road, Monterey. Note that 3 September is a Thursday \u2014 several listings pair these dates with the wrong weekdays.",
      },
      {
        q: "How much is admission?",
        a: "In advance, $16.95 for adults 13\u201361, $13.56 for seniors 62 and over, and $9.04 for children 6\u201312. Children 5 and under are free every day. Prices go up once the fair opens on 3 September.",
      },
      {
        q: "Are there free days?",
        a: "Three. Thursday 3 September is Seniors Day (62+ free all day), Friday 4 September is Military and Veterans Day (military, veterans and dependents free all day), and Monday 7 September is Kids Day (12 and under free all day).",
      },
      {
        q: "Are the concerts included with admission?",
        a: "Yes. All five Payton Stage headliners at 7:30 p.m. are free with fair admission, as are the Turf Stage and Island Stage acts. Carnival rides and arena events are not.",
      },
      {
        q: "What is not included in fair admission?",
        a: "Arena events, which are separately ticketed from $5.65 to $20.34. Carnival rides, at $35 for an unlimited single-day wristband or $55 with front-of-line access. And the Sunday rodeo performance, which is $14 for adults and $7 for children 6\u201312 even though Friday and Saturday rodeo is free with fair entry.",
      },
      {
        q: "Where do I park?",
        a: "At Monterey Pines Golf Course, $25 per vehicle \u2014 not at the fairgrounds. The organisers call parking extremely limited and recommend carpooling, taxis, public transport or the shuttle.",
      },
      {
        q: "What time does the fair open?",
        a: "Not published by the fair itself. A secondary listing gives 11:00 a.m. to 11:00 p.m. Thursday to Sunday and 10:00 a.m. to 11:00 p.m. on Monday, which fits the run, but this page does not treat it as confirmed. The fair\u2019s number is (831) 372-5863.",
      },
    ],
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
    dateText: "September 11-13, 2026",
    start: "2026-09-11",
    end: "2026-09-13",
    category: "Cultural Festival",
    updated: "2026-08-21",
    streetAddress: "20 Custom House Plaza",
    postalCode: "93940",
    times: [
      { day: "Friday 11 September", hours: "3:00 p.m. – 9:00 p.m." },
      { day: "Saturday 12 September", hours: "10:00 a.m. – 9:00 p.m." },
      { day: "Sunday 13 September", hours: "10:00 a.m. – 6:00 p.m." },
    ],
    timesConfidence: "unconfirmed",
    officialWebsite: "https://festaitaliamonterey.org/",
    metaDescription:
      "11–13 September 2026 at Custom House Plaza — a week later than several listings say. Monterey's Santa Rosalia Fisherman's Festival, 93rd year, free to attend.",
    intro:
      "Festa Italia — Monterey's Santa Rosalia Fisherman's Festival — runs Friday 11 to Sunday 13 September 2026 at Custom House Plaza, in its 93rd year. It celebrates the city's Sicilian heritage and honours its fishermen, past and present, and it is free to attend. Note the dates carefully: several published listings, including this page until 21 August, had it a week earlier.",
    sections: [
      {
        heading: "The date is wrong in a lot of places, including here until recently",
        body: [
          "This festival is 11–13 September 2026. A number of listings circulating — among them See Monterey's compiled 2026 annual-events PDF, which is where this site originally took the date — show 4–6 September, a full week early. At least one other shows 6–8 September.",
          "All three are Friday-to-Sunday runs, so checking the weekday against the date does not catch this one; only going to the organiser does. Old Fisherman's Wharf, KAZU, Old Monterey and What's Up Monterey all give 11–13 September, and the Festa Italia Foundation runs it on the second weekend. If you arrive on the 4th you will find an empty plaza.",
        ],
      },
      {
        heading: "What it actually commemorates",
        body: [
          "Santa Rosalia is the patron saint of Palermo, and the festival came to Monterey with the Sicilian families who built its fishing industry. It is a heritage festival with a working-community spine rather than a generic food fair: the point is the fishermen, living and dead, and the families who have been landing fish here for a century.",
          "It is run by the Festa Italia Foundation, a 501(c)(3) non-profit, and takes place at 20 Custom House Plaza inside Monterey State Historic Park, immediately beside Old Fisherman's Wharf — which is not a coincidence of venue.",
        ],
      },
      {
        heading: "Music and what happens across the three days",
        body: [
          "The 2026 bill includes Pasquale Esposito, Mike Marotta and the Italian Allstars, and the Anthony Lane Band, with two acts new for 2026: The Musica of Jimmy Rossi and Luca DePaolis, and the Lost and Found Band. The Money Band plays Saturday only.",
          "Around the music: a bocce tournament, a calamari cooking demonstration, Tarantella dance lessons on the Sunday, raffles, and Italian food with beer and wine. It is a plaza festival, flat and walkable, on the waterfront.",
        ],
      },
      {
        heading: "What has not been confirmed",
        body: [
          "The hours above — Friday 3 to 9 p.m., Saturday 10 a.m. to 9 p.m., Sunday 10 a.m. to 6 p.m. — come from Old Fisherman's Wharf rather than from the Festa Italia Foundation directly, whose own site does not render for us. They are consistent across the listings that carry them, but they are not the organiser's own words, so they are kept out of this page's structured data.",
          "Admission is reported as free by every listing we can reach, and has been free historically, but for the same reason it is not published here as a confirmed price and this page emits no Offer.",
          "Whether the Santa Rosalia procession and the blessing of the fishing fleet run in 2026, and at what time. These are traditional elements of this festival, but no 2026 schedule for them has been published where we can see it — so this page does not promise them.",
        ],
      },
    ],
    faq: [
      {
        q: "When is Festa Italia in Monterey in 2026?",
        a: "Friday 11 to Sunday 13 September 2026 at Custom House Plaza. Several listings — including See Monterey's annual PDF — show 4–6 September, which is a week early.",
      },
      {
        q: "Why do I see two different dates?",
        a: "Compiled listing sources carry 4–6 September and at least one shows 6–8. Old Fisherman's Wharf, KAZU, Old Monterey and What's Up Monterey all give 11–13 September for the 93rd annual festival. Go with the second weekend.",
      },
      {
        q: "Is it free?",
        a: "Every listing we can reach says yes, and it has been free historically. The organiser's own site does not render for us, so this page reports that rather than confirming it — and publishes no price in its structured data.",
      },
      {
        q: "What is Santa Rosalia's connection to Monterey?",
        a: "Santa Rosalia is the patron saint of Palermo. The festival arrived with the Sicilian families who built Monterey's fishing industry, and it honours the city's fishermen past and present. That is why it is held on the plaza next to Old Fisherman's Wharf.",
      },
      {
        q: "Who plays in 2026?",
        a: "Pasquale Esposito, Mike Marotta and the Italian Allstars, and the Anthony Lane Band, plus two acts new for 2026 — The Musica of Jimmy Rossi and Luca DePaolis, and the Lost and Found Band. The Money Band plays Saturday only.",
      },
      {
        q: "What else is on besides music?",
        a: "A bocce tournament, a calamari cooking demonstration, Tarantella dance lessons on Sunday, raffles, and Italian food with beer and wine.",
      },
    ],
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
    updated: "2026-08-21",
    times: [
      { day: "Friday 4 September", hours: "On track 9:00 a.m. – 5:30 p.m." },
      { day: "Saturday 5 September", hours: "On track 9:00 a.m. – 4:33 p.m." },
      { day: "Sunday 6 September", hours: "On track from 9:38 a.m.; race green flag 12:05 p.m." },
    ],
    timesConfidence: "official",
    officialWebsite: "https://weathertechraceway.com/",
    guideLink: {
      href: "/laguna-seca/camping/",
      label: "Camping at Laguna Seca",
      blurb:
        "All ten camping areas, which gate serves them, the 40-foot RV limit and the six-adult cap — plus the camping and parking prices the raceway does not publish anywhere.",
    },
    metaDescription:
      "4–6 September 2026, the INDYCAR season finale at Laguna Seca. Full on-track schedule, what general admission includes — and a child-ticket rule two official pages disagree on.",
    intro:
      "The INDYCAR Grand Prix of Monterey runs Friday 4 to Sunday 6 September 2026 at WeatherTech Raceway Laguna Seca, and it is the finale of both the NTT INDYCAR Series and INDY NXT seasons — the 2026 champion is crowned here. The green flag drops at 12:05 p.m. on Sunday. General admission includes paddock access and the hillsides, which at this circuit means the Corkscrew.",
    sections: [
      {
        heading: "The child-ticket rule: two official pages disagree",
        body: [
          "Check this before you buy. The raceway's own ticket-information page states that “children 15 and under are free with a paid adult”, and INDYCAR's announcement of this race said the same — under-15s admitted free with an adult ticket holder. But the event's own page at the raceway says “children regardless of age must have a separate ticket”.",
          "Those cannot both be true as written. It may be that the stricter line applies only to premium seating — the ticket-information page does carve out Premier Pit Row Suites, where children pay full price with a Youth Legends Club rate for ages 5 to 15. But that is an inference, not something either page states, so it is not published here as the answer. If you are bringing children, confirm with the box office rather than assuming the more generous rule applies.",
        ],
      },
      {
        heading: "The full on-track schedule",
        body: [
          "Friday 4 September opens with Porsche Sprint Challenge practice at 9:00 a.m., a Historic INDYCAR Exhibition at 10:00, the first NTT INDYCAR Series practice from 2:00 to 3:20 p.m., and Porsche qualifying from 4:45 to 5:30 p.m.",
          "Saturday 5 September is the busiest day: Porsche Sprint Challenge race one at 9:00 a.m., INDYCAR practice two from 10:05 to 11:25, INDYCAR qualifying from 1:35 to 2:55 p.m., and INDY NXT race one from 3:38 to 4:33 p.m. If you are coming for a single day and want the most track action, this is it.",
          "Sunday 6 September has INDY NXT race two from 9:38 to 10:28 a.m., then the main event — green flag at 12:05 p.m., running to about 2:10 p.m. Sunday is the shorter day on track but it is the one that decides the championship.",
        ],
      },
      {
        heading: "What general admission actually gets you",
        body: [
          "More than at most circuits. General admission includes paddock access — the “cold garage” area where race teams set up their trailers and displays. It does not include hot pit access, which is the distinction people get wrong.",
          "Seating is first-come, first-served: uncovered grandstands near Turn 4 and Turn 11, or the hillsides. The hillside at Turn 2 and above the Corkscrew at Turn 8 is why people rate Laguna Seca as a spectating circuit — the Corkscrew's drop is something television does not convey, and standing there costs nothing extra.",
          "Bring blankets, umbrellas and folding chairs for the hillsides. Small ice chests are permitted. No glass.",
        ],
      },
      {
        heading: "Parking and camping",
        body: [
          "General parking is the Purple 10 area, entered from South Boundary Road. Preferred parking in the Green Lakebed area can be bought. Note that there is no overnight parking in either the general or preferred areas — leaving a vehicle overnight requires a camping pass.",
          "General camping is first-come, first-served near Turns 9 to 11, and tent camping runs 3–7 September, so you can arrive the day before. No picnic tables, barbecues or fire pits are provided; you may bring your own barbecue and a self-contained fire pit, but fires cannot be in the ground. Every camper needs an admission ticket as well as the camping pass.",
          "Premium trackside camping and the new-for-2026 Turn 3 VIP Club — overlooking the Andretti Hairpin, Turn 3 and Turn 4, with chef-prepared breakfast and lunch buffets on Saturday and Sunday — are sold separately. The Champions Club is already sold out for 2026.",
        ],
      },
      {
        heading: "What has not been published",
        body: [
          "Ticket prices. The raceway sells through an external platform and lists no prices on the pages describing this event, so none appear here. Buy through the official site rather than a resale listing.",
          "Gate opening times for this weekend specifically. The venue says gates “typically” open at 7 a.m. and close between 10 p.m. and midnight depending on the event, which is a general statement about the circuit rather than a published time for these three days. The on-track times above are the organiser's own and are firm.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the INDYCAR race at Laguna Seca in 2026?",
        a: "Friday 4 to Sunday 6 September 2026. The Grand Prix itself takes the green flag at 12:05 p.m. on Sunday 6 September.",
      },
      {
        q: "Is this the INDYCAR season finale?",
        a: "Yes. It closes both the NTT INDYCAR Series and INDY NXT by Firestone seasons, and the 2026 champion is crowned here.",
      },
      {
        q: "Are children free?",
        a: "The two official pages disagree. The raceway's ticket-information page and INDYCAR's own announcement both say children 15 and under are free with a paid adult; the event page at the raceway says children of any age need a separate ticket. Confirm with the box office before you travel rather than assuming the more generous rule.",
      },
      {
        q: "Does general admission include the paddock?",
        a: "Yes. General admission includes paddock access — the cold garage area where teams set up. It does not include hot pit access.",
      },
      {
        q: "Where can I sit or stand on a general admission ticket?",
        a: "Uncovered grandstands near Turn 4 and Turn 11, first-come first-served, or the hillsides at Turn 2 and above the Corkscrew at Turn 8. Blankets, umbrellas, folding chairs and a small ice chest are all allowed; glass is not.",
      },
      {
        q: "Can I camp at the track?",
        a: "Yes. General camping is first-come, first-served near Turns 9–11, with tent camping available 3–7 September. No barbecues or fire pits are provided, though you may bring your own barbecue and a self-contained fire pit; fires cannot be in the ground. Every camper needs an admission ticket too, and overnight parking is not allowed in the general or preferred lots without a camping pass.",
      },
      {
        q: "How much are tickets?",
        a: "Not published on the raceway's event pages — they sell through an external platform, so no price is listed here. The Champions Club is sold out for 2026; the Turn 3 VIP Club is new this year.",
      },
    ],
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
    cityText: "Castroville",
    city: "Castroville",
    months: ["september"],
    dateText: "September 5, 2026",
    start: "2026-09-05",
    category: "Food / Agricultural Festival",
    referenceUrls: [
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://www.seemonterey.com/events/annual-events/",
    ],
    description:
      "The Castroville Artichoke Festival returns to Castroville on 5 September 2026, revived by the Castroville Coalition after the original festival closed in 2025.",
    updated: "2026-08-21",
    metaDescription:
      "Yes, it is happening — 5 September 2026, back in Castroville. But the 65-year festival closed in 2025; this is a smaller revival by a different organisation.",
    intro:
      "The Castroville Artichoke Festival returns on Saturday 5 September 2026, back in Castroville itself for the first time since 2014. It needs one piece of context that most listings leave out: the festival that ran for 65 years shut down permanently in May 2025, and this is a revival by a different organisation — the Castroville Coalition — deliberately starting smaller, with around 50 vendors expected.",
    sections: [
      {
        heading: "What happened to the festival, and what this one is",
        body: [
          "The original Artichoke Festival closed for good on 9 May 2025 after 65 years. Its board cited money: \u201cthe financial realities we now face are insurmountable\u201d. Executive director Linda Scherer said at the time that \u201cthe memories we\u2019ve made, the people we\u2019ve touched and the good we\u2019ve done together will live on far beyond this decision\u201d. That organisation is gone.",
          "What returns on 5 September 2026 is a revival led by the Castroville Coalition, supported by the North County Recreation and Park District. It is deliberately smaller \u2014 organisers have talked about roughly 50 vendors, against a festival that drew about 20,000 people in 2011. Going in expecting the old event at full scale is the way to be disappointed by a good thing.",
        ],
      },
      {
        heading: "It is back in Castroville, which is the point",
        body: [
          "The festival began in Castroville in 1959 and stayed there until 2014, when it outgrew the town and moved to the Monterey County Fair and Event Center. Its final editions were further away still \u2014 the last one ran in June 2025 at the Sheriff\u2019s Posse Grounds in Salinas.",
          "Coming home matters here in a way it would not for a generic food festival. Castroville calls itself the Artichoke Center of the World, and the festival grew out of the town\u2019s earlier May Days Parade. A revival held anywhere else would be a food event with an artichoke theme; held in Castroville it is the town\u2019s own festival again.",
          "Organisers have noted that timing depends partly on Merritt Street construction, Castroville\u2019s main street \u2014 so the exact footprint within the town is worth checking close to the day.",
        ],
      },
      {
        heading: "Marilyn Monroe, and the queens",
        body: [
          "The best-known fact about this festival predates it. In 1948 Marilyn Monroe \u2014 then still Norma Jeane \u2014 was named Castroville\u2019s first Honorary Artichoke Queen, eleven years before the festival itself began.",
          "The festival crowned its own royalty from 1961, when Sally DeSante Hebert became the first Festival Queen; the first Artichoke King, Andrew O\u2019Desky, followed in 1974. In 2006 the crown went to William Hung. Whether the revived festival continues the tradition has not been announced.",
        ],
      },
      {
        heading: "There is a second, larger festival planned for later in 2026",
        body: [
          "The September event is the first of two. Organisers have said a larger festival is expected somewhere between October and November 2026, with the September one serving as the smaller return.",
          "No date, venue or detail has been published for that second event, so it does not appear as a listing on this site. When a date is announced it will get its own page.",
        ],
      },
      {
        heading: "What has not been published",
        body: [
          "Hours, admission price, and the specific venue or street footprint within Castroville. None of these have been published anywhere we can find, and this page does not estimate them.",
          "The original festival\u2019s website, artichokefestival.org, still shows the June 2025 dates at the Salinas Posse Grounds and belongs to the organisation that closed \u2014 it is not the source for this event. Follow the Castroville Coalition for 2026 details.",
        ],
      },
    ],
    faq: [
      {
        q: "Is the Castroville Artichoke Festival happening in 2026?",
        a: "Yes \u2014 Saturday 5 September 2026, in Castroville. But it is a revival by the Castroville Coalition, not the original festival, which closed permanently in May 2025 after 65 years.",
      },
      {
        q: "Didn\u2019t the Artichoke Festival close down?",
        a: "It did. The original organisation shut down on 9 May 2025, citing insurmountable financial realities after 65 years. The Castroville Coalition, with the North County Recreation and Park District, is bringing it back as a new, smaller event.",
      },
      {
        q: "Where is it held now?",
        a: "Back in Castroville, for the first time since 2014 \u2014 the festival had moved to the Monterey County Fair and Event Center that year, and its final edition in June 2025 was at the Sheriff\u2019s Posse Grounds in Salinas. The exact venue within Castroville has not been published, and timing depends partly on Merritt Street construction.",
      },
      {
        q: "How big will it be?",
        a: "Smaller than the festival people remember. Organisers have talked about roughly 50 vendors; the old festival drew around 20,000 visitors in 2011. A second, larger festival is expected between October and November 2026.",
      },
      {
        q: "Was Marilyn Monroe really the Artichoke Queen?",
        a: "Yes. In 1948 she was named Castroville\u2019s first Honorary Artichoke Queen \u2014 eleven years before the festival itself started in 1959.",
      },
      {
        q: "How much does it cost and what time does it start?",
        a: "Not published. No admission price, hours or specific venue have been announced for the 2026 return, and this page does not estimate them.",
      },
    ],
  },
  {
    slug: "monterey-bay-greek-festival",
    updated: "2026-08-19",
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
    metaDescription:
      "The 2026 date is not announced, but the organisers hold it every Labor Day weekend, Saturday to Monday, at Custom House Plaza in Monterey.",
    intro:
      "The Monterey Bay Greek Festival has no announced 2026 date, and this page will not guess one. What the organisers do publish is the pattern: Saint John the Baptist Greek Orthodox Church of Monterey County holds it every Labor Day weekend, Saturday to Monday, at Custom House Plaza beside Old Fisherman\u2019s Wharf. If you are planning around it, that is the weekend to keep free.",
    sections: [
      {
        heading: "What \u201cevery Labor Day weekend\u201d means for 2026",
        body: [
          "Labor Day 2026 falls on Monday 7 September. So if the festival runs to its usual pattern, it would land on 5\u20137 September \u2014 but that is arithmetic on a recurring rule, not a date anyone has announced, and it is not what this page publishes. The date field above stays empty and this listing carries no event date in its structured data until the organisers announce one.",
          "That distinction matters more than it sounds. A date computed from a pattern looks identical to a confirmed one once it has been copied into a few calendars, and by then nobody can tell which it was. Treat 5\u20137 September as the weekend to hold, and confirm before you book anything around it.",
        ],
      },
      {
        heading: "What it is",
        body: [
          "It is the parish\u2019s largest fundraiser of the year rather than a commercial festival, which shapes the whole character of it: the food is cooked by parishioners to recipes and techniques carried over from Greece, not brought in by caterers. Expect Greek cuisine, wine and pastries, live Greek music and dancing, on the waterfront plaza at Custom House.",
          "Custom House Plaza sits inside Monterey State Historic Park, flat and paved, immediately beside Old Fisherman\u2019s Wharf and walkable from downtown Monterey. It is the same plaza the Turkish festival uses in August.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the Monterey Bay Greek Festival in 2026?",
        a: "Not yet announced. The organisers hold it every Labor Day weekend, Saturday to Monday. Labor Day 2026 is Monday 7 September, so that weekend is the one to keep free \u2014 but no 2026 date has been published and this page does not estimate one.",
      },
      {
        q: "Who runs it?",
        a: "Saint John the Baptist Greek Orthodox Church of Monterey County. The festival is the parish\u2019s largest fundraising event of the year.",
      },
      {
        q: "Where is it held?",
        a: "Custom House Plaza in Monterey, inside Monterey State Historic Park and directly beside Old Fisherman\u2019s Wharf.",
      },
    ],
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
    officialWebsite: "https://weathertechraceway.com/pages/gridlife-laguna",
    referenceUrls: [
      "https://www.weathertechracing.com/2026-full-schedule",
      "https://weathertechraceway.com/pages/tickets",
    ],
    description:
      "A three-day combined motorsports and music festival at WeatherTech Raceway Laguna Seca.",
    metaDescription: "GRIDLIFE Laguna at Laguna Seca: track racing, Corkscrew drifting and live music. What ran 18–20 September 2026 and what we know about 2027.",
    intro: "GRIDLIFE Laguna is a three-day motorsport and music festival at WeatherTech Raceway Laguna Seca, outside Monterey, that mixes amateur and club racing on track with live music, camping and car displays off it. The 2026 edition ran from Friday 18 to Sunday 20 September and closed the raceway's 2026 season. It was the season finale for the GRIDLIFE Touring Cup and the NOS Energy TrackBattle Time Attack, with drifting demonstrations alongside. The raceway's own news page described the 2025 festival as the third held at the track. No 2027 date has been posted by the raceway or by GRIDLIFE.",
    sections: [
      {
        heading: "What happens on and off the track",
        body: [
          "The raceway lists two championship finales for 2026: the GRIDLIFE Touring Cup, a touring-car series, and the NOS Energy TrackBattle Time Attack, where drivers run against the clock rather than each other. Drifting demonstrations ran alongside.",
          "Off the track the festival is built to keep people at the circuit after the cars stop: live music, an open-air arcade, concours displays, food vendors and camping inside the venue. For the 2025 edition the raceway's news page described drifting through the Corkscrew and evening sets on the main stage; it has not published an equivalent line-up for 2026.",
        ],
      },
      {
        heading: "Camping and getting in",
        body: [
          "Camping is part of the festival rather than an add-on elsewhere, with campgrounds marked on the raceway's facility map. The raceway publishes no camping prices, gate times or ticket prices for GRIDLIFE on its own page; tickets were sold through GRIDLIFE, and GRIDLIFE's 2026 Laguna pages have since been taken down.",
          "The raceway's map shows the parking lots, but it warns that facility locations and access routes vary by event, so the layout for one weekend is not a guide to the next.",
        ],
      },
    ],
    faq: [
      {
        q: "When was GRIDLIFE Laguna in 2026?",
        a: "Friday 18 to Sunday 20 September 2026 at WeatherTech Raceway Laguna Seca, as the final event of the raceway's 2026 season.",
      },
      {
        q: "What racing is there?",
        a: "In 2026, season finales for the GRIDLIFE Touring Cup and the NOS Energy TrackBattle Time Attack, plus drifting demonstrations.",
      },
      {
        q: "Can you camp?",
        a: "Yes. Camping inside the venue is part of the festival, but the raceway does not publish the prices on its own page.",
      },
      {
        q: "Are the 2027 dates out?",
        a: "Not yet. GRIDLIFE Laguna is not on the raceway's published 2027 schedule so far.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "GRIDLIFE",
      url: "https://www.grid.life/",
    },
    updated: "2026-11-26",
    hideSources: true,
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
    officialWebsite: "https://www.pureinsurancechampionship.com/",
    referenceUrls: [
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://www.seemonterey.com/events/annual-events/",
    ],
    description:
      "A PGA TOUR Champions tournament played over three days at Pebble Beach.",
    venue: "Pebble Beach Golf Links and Spyglass Hill Golf Course",
    metaDescription: "PGA Tour Champions pros and First Tee juniors at Pebble Beach. Next edition 24–26 September 2027; no ticket needed and parking is free.",
    intro: "The PURE Insurance Championship is a PGA Tour Champions event played over Pebble Beach Golf Links and Spyglass Hill, in which 80 tour professionals are paired with First Tee juniors. The 2026 edition ran from 18 to 20 September. The organiser has announced the next edition for 24 to 26 September 2027, which it describes as the tournament's 24th year at Pebble Beach. Spectators can walk the course without a ticket, and parking inside Pebble Beach is free.",
    sections: [
      {
        heading: "How the tournament works",
        body: [
          "This is a pro-junior event rather than a straight professional tournament. Eighty PGA Tour Champions players each play with a First Tee junior, and the first rounds are split across Pebble Beach Golf Links and Spyglass Hill.",
          "The final round is played at Pebble Beach alone. For 2026 the organiser listed a cut to the low 50 professionals and ties, the low 24 pro-junior teams (12 boys, 12 girls) and the low 10 amateur teams, with an awards ceremony at the 18th green and a 6pm scheduled finish. The Golf Channel carried 3pm to 6pm Pacific on each of the three tournament days.",
        ],
      },
      {
        heading: "Watching, parking and cost",
        body: [
          "The organiser says spectators can walk Pebble Beach Golf Links alongside the players with no ticket required.",
          "Spectator parking is free at the Special Events Field, also called Lot 10, inside Pebble Beach and signed \"Spectator Parking\", with a shuttle to the course. It runs Friday to Sunday and includes accessible parking. The organiser's Policies and Prohibited Items page sets out what can be brought on to the course.",
        ],
      },
      {
        heading: "Who runs it",
        body: [
          "The Monterey Peninsula Foundation, which also stages the AT&T Pebble Beach Pro-Am, puts on the tournament, and the organiser says its proceeds support hundreds of non-profits across the Central Coast. First Tee, the youth golf and life-skills programme, supplies the junior players.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the PURE Insurance Championship in 2027?",
        a: "24 to 26 September 2027 at Pebble Beach, according to the organiser.",
      },
      {
        q: "Do you need a ticket?",
        a: "No. The organiser says spectators can walk Pebble Beach Golf Links with no ticket required.",
      },
      {
        q: "Where do spectators park?",
        a: "Free at the Special Events Field (Lot 10) inside Pebble Beach, with a shuttle to the course, Friday to Sunday.",
      },
      {
        q: "Which courses are used?",
        a: "Pebble Beach Golf Links and Spyglass Hill Golf Course, with the final round at Pebble Beach.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Monterey Peninsula Foundation",
      url: "https://www.pureinsurancechampionship.com/",
    },
    recurrence: "The organiser says the tournament has been played at Pebble Beach since 2004.",
    nextEdition: {
      start: "2027-09-24",
      end: "2027-09-26",
      source: "https://www.pureinsurancechampionship.com/",
    },
    updated: "2026-11-26",
    hideSources: true,
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
    officialWebsite: "https://ci.carmel.ca.us/events",
    metaDescription: "Carmel's 63rd Great Sandcastle Contest was 19 September 2026, theme 'Carmel at 110'. Who won the Golden Shovel and how the contest runs.",
    intro: "The Great Sandcastle Contest is the City of Carmel-by-the-Sea's annual sand-building competition on Carmel Beach, open to anyone who turns up with a team and a theme. The 63rd contest was held on Saturday 19 September 2026 under the theme \"It Never Gets Old: Carmel at 110\", marking the city's 110th year. The top award, the Golden Shovel, went to \"Sunset Performing Dragon Center\". The city has not yet announced the 2027 date or theme; for 2026 it posted both in late August.",
    sections: [
      {
        heading: "How the day runs",
        body: [
          "The contest is a single morning on the beach. In the city's announcement for the 2024 contest, building started at 7am and judging at 11am, and entry was free and open to all. Earlier city listings put the building area on Carmel Beach between 10th and 12th Avenues, with the registration table on the sand at 11th. The city has not published the 2026 timings separately, so treat those as how it has run rather than a fixed schedule.",
        ],
      },
      {
        heading: "The 2026 winners",
        body: [
          "The city published the 2026 results under the theme \"It Never Gets Old: Carmel at 110\". The Golden Shovel went to \"Sunset Performing Dragon Center\" by Patrick, Ryn and Anna. The Sour Grapes award went to \"Birthday Paw-ty\" by Matt Maksim, Best Theme to \"Scenic Drive\", Best Kids to \"Turtle Town\" by Team Turtle, Best Traditional to \"Solo Mio\" by Dereck Farreh, and Best Bribe to \"Happy B-day Carmel\" by Whitson Engineers.",
        ],
      },
      {
        heading: "Finding out about 2027",
        body: [
          "The city posts the date and theme on its events page in late summer; for 2026 it appeared in a list of the year's events with the theme already attached. Questions go to the city's Community Activities office on 831-620-2020.",
        ],
      },
    ],
    faq: [
      {
        q: "When was the 2026 Great Sandcastle Contest?",
        a: "Saturday 19 September 2026 on Carmel Beach. It was the 63rd contest.",
      },
      {
        q: "What was the 2026 theme?",
        a: "\"It Never Gets Old: Carmel at 110\", for the city's 110th year.",
      },
      {
        q: "Does it cost anything to enter?",
        a: "The city described the 2024 contest as free and open to all to participate. It has not published separate entry terms for 2026.",
      },
      {
        q: "When is the 2027 contest?",
        a: "Not announced yet. For 2026 the city published the date and theme in late August.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "City of Carmel-by-the-Sea",
      url: "https://ci.carmel.ca.us/",
    },
    recurrence: "An annual contest run by the City of Carmel-by-the-Sea on Carmel Beach; 2026 was the 63rd.",
    updated: "2026-11-26",
    hideSources: true,
  },
  {
    slug: "monterey-jazz-festival",
    updated: "2026-09-11",
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
    streetAddress: "2000 Fairground Road",
    postalCode: "93940",
    officialWebsite: "https://montereyjazz.org/",
    metaDescription:
      "25–27 September 2026 at the Fairgrounds. Ticket tiers and what each actually gets you, the sold-out parking, and the gate times still unannounced.",
    intro:
      "The 69th Monterey Jazz Festival runs Friday 25 to Sunday 27 September 2026 across the 20 oak-studded acres of the Monterey County Fair & Event Center, 2000 Fairground Road. Thirty hours of music on six stages, around seventy food and craft vendors, and a 2026 bill led by a first-ever Herbie Hancock and Ron Carter duo. Gates open at 3pm Friday and 11am at the weekend, and music runs to a 9pm last set all three days. It is ticketed, and which ticket you buy changes the festival you get — that is the part worth understanding before you spend $215.",
    // Section order is deliberate and load-bearing: these nine map to the
    // logistics queries this page is built to win, and collapsing or reordering
    // them undoes that. "Who is playing" is appended AFTER them rather than
    // interleaved, so the nine stay in their specified sequence.
    //
    // SOURCING: filled 2026-09-11 from montereyjazz.org directly — the FAQ,
    // Attendee Info, Festival Map, Schedule and the 10 April 2026 package-ticket
    // press release. That is why `hideSources` is set: the CSV reference URLs
    // this row was imported with no longer describe where the content came from.
    // Where the festival publishes nothing, the page says so and names what is
    // missing, rather than carrying a marker or a guess.
    sections: [
      {
        heading: "Dates, times, gates",
        body: [
          "The 69th Monterey Jazz Festival runs Friday 25, Saturday 26 and Sunday 27 September 2026 at the Monterey County Fair & Event Center, 2000 Fairground Road, Monterey CA 93940.",
          "Gates open at 3pm on Friday and at 11am on Saturday and Sunday. Music runs late all three days: the last sets start at 9pm on each of Friday, Saturday and Sunday.",
          "First music is at 3:30pm Friday, midday Saturday and 11:15am Sunday — so on Saturday and Sunday the gates open an hour or so before anything starts, and on Friday only half an hour before.",
        ],
      },
      {
        heading: "Seating chart and stages",
        body: [
          "Six stages carry the festival, and they divide into two zones that your ticket decides between. The Arena holds the Jimmy Lyons Stage, a 5,400-seat outdoor venue at the east end of the fairgrounds, and it is where the headline acts play. The Grounds hold the other five: the Ray Drummond West End Stage, the Pacific Jazz Café, the Tim Jackson Garden Stage, the Courtyard Stage and the Monterey Room.",
          "Arena seating is assigned, not general admission — your ticket names a seat. It sells in three grades: arena Lawn, arena sectional, and side bleacher, in ascending price order.",
          "The festival does not publish a numbered Arena seating chart. It names the three grades and prices them, but nothing on its site maps which sections fall into which grade, so if a particular sightline matters, the seat map in the Etix checkout is the only place that shows it before you buy.",
        ],
      },
      {
        heading: "Parking at the Fairgrounds",
        body: [
          "Fairgrounds parking is sold out for 2026. That is the festival's own statement, not an inference from demand, and it changes how everyone else on this page gets there.",
          "A limited number of ADA parking spaces are on Fairground Road, first-come first-served. ADA seating is arranged through ticketing or on 831-308-4653, and hearing devices are free at Patron Services against a deposit of valid ID.",
          "There is no published rideshare or private-car drop-off point. If you are being dropped off, the festival does not say where — which, with on-site parking gone, is the one logistical gap left in its own guidance.",
        ],
      },
      {
        heading: "Getting there and shuttles",
        body: [
          "With Fairgrounds parking sold out, the park-and-ride at Monterey Peninsula College is the festival's answer for anyone driving. Monterey-Salinas Transit runs shuttles between the MPC lots and the festival roughly every 15 minutes during festival hours.",
          "MPC parking passes are sold online only up to 24 September. From Friday 25 to Sunday 27 September you buy them on site instead, at the MPC Lot A shuttle tent at the intersection of Via Lavandera and the Lot A bus stop.",
          "If you bought a pass in advance, take it to that same shuttle tent and exchange it for a hand stamp — the stamp, not the pass, is what boards the shuttle. Worth knowing before you queue at the wrong place.",
          "The festival does not publish a price for the MPC parking pass, or a separate fare for the shuttle. It publishes a shuttle map and timetable but no first and last run in plain text, so if you are planning around the last shuttle out after a 9pm set, check that map on the day.",
        ],
      },
      {
        heading: "Wristband and ticket pickup",
        body: [
          "Tickets are electronic. Three-day packages were released on 4 September; single-day tickets release 21 days before the date on them. Either can be printed at home or carried on a phone.",
          "The box office is at 2000 Fairground Road and opens before the festival does: 10am to 5pm on Wednesday 23 and Thursday 24 September, 10am to 9pm on Friday 25 and Saturday 26, and 10am to 8pm on Sunday 27.",
          "Re-entry works on a wristband. Your ticket admits you once; the wristband is what lets you back in. Lose the wristband and you buy another ticket — worth knowing before you take it off at the end of a long afternoon.",
        ],
      },
      {
        heading: "Grounds map",
        body: [
          "The festival publishes a 2026 grounds map — the MJF69 Fairgrounds Map, as an image and a PDF, both linked from its Festival Map page. It is the authority on where the six stages, the gates, food, merchandise and Patron Services sit.",
          "This page does not reproduce the layout in words. The map is redrawn each year and the gate arrangement has changed between editions, so describing it from a previous year's version is exactly the error that makes a map page worth less than the map.",
        ],
      },
      {
        heading: "Ticket prices and what each pass includes",
        body: [
          "Single-day tickets come in three tiers, and the gap between them is not just seat quality. Arena is $110 on Friday and $215 on Saturday or Sunday, and buys an assigned seat for the Jimmy Lyons Stage plus access to everything on the Grounds stages that day. Arena Lawn is $75 Friday and $135 Saturday or Sunday. Grounds is $65 Friday and $90 Saturday or Sunday.",
          "Full-weekend packages are the other way in. A Grounds package is $230 and covers around 60 performances across the four Grounds stages. Arena packages begin at $325 for lawn seating and $465 and up for sectional and side-bleacher seats, and include a reserved seat at each of the 13 Jimmy Lyons Stage shows as well as the Grounds stages.",
          "The distinction that catches people: a Grounds ticket does not get you into the Arena. The headline acts on the Jimmy Lyons Stage — the Hancock and Carter duo, the Jazz at Lincoln Center Orchestra — are Arena shows. If those are why you are coming, Grounds is the wrong ticket at any price. If you are happy to graze five other stages all day, it is much the better value.",
          "Premier Club is an add-on rather than a ticket — $395 for the weekend, on top of an Arena or Grounds purchase, for a furnished area with Arena simulcasts, private restrooms and patio seating. It is sold out for 2026.",
          "Children are handled differently by zone. In the Arena everyone needs a ticket, infants included. On the Grounds, under-2s are free and ages 2 to 12 need a youth ticket.",
          "One note on prices quoted elsewhere: a $98–$500 range circulates on third-party event calendars and matches none of the festival's own published tiers, which run from $65 for a Friday Grounds ticket to $465 and up for a full-weekend Arena seat. Buy from the festival or its ticketing partner and check the figure there.",
        ],
      },
      {
        heading: "Hotels near the Fairgrounds",
        body: [
          "The festival publishes no room block, group rate or booking deadline for 2026. It features hotel partners — the Monterey Marriott on the waterfront and the Courtyard Sand City Monterey, which opened in January 2026 — and points at See Monterey and Hipcamp for campgrounds, RV parks and glamping across the county. None of those carries a festival rate.",
          "That absence is worth knowing rather than working around: there is no discount code to hunt for, and late September is peak season on the Peninsula, so the usual advice about booking early applies with no festival-specific lever to pull.",
        ],
      },
      {
        heading: "Food, vendors, what to bring",
        body: [
          "Around seventy food and craft vendors trade across the grounds over the three days.",
          "The site is cashless for everything the festival runs — tickets, parking and food vendors all take cards only. The bars are cashless too. The exceptions are the arts and crafts vendors and program sales, which do take cash, and there are ATMs inside the Fairgrounds if you need them.",
          "What you cannot bring in is the part that costs people at the gate. No outside food, coolers, glass bottles, or containerized or alcoholic beverages. No lawn, beach or folding chairs — a real constraint at a festival where people expect to sit on grass all afternoon. No detachable-lens cameras, flash equipment or recording devices. No pets, and no strollers in the Arena or the indoor venues.",
          "Two things you can bring, and they are the ones people get wrong in the cautious direction: one sealed plastic bottle of water per person is allowed, and picnic blankets are fine. Chairs are out, blankets are in.",
        ],
      },
      {
        heading: "Who is playing in 2026",
        body: [
          "The 2026 bill is led by Herbie Hancock and Ron Carter in what the festival bills as their first-ever duo performance — two musicians whose partnership goes back to Miles Davis's second great quintet, playing as a pair for the first time.",
          "Also announced: the Jazz at Lincoln Center Orchestra with Wynton Marsalis and special guest Cécile McLorin Salvant, Meshell Ndegeocello, the Charles Lloyd Quartet, and the Ravi Coltrane Quartet.",
          "The full stage-by-stage running order is published. Friday opens at 3:30pm with the USAF Commanders Jazz Ensemble and closes with the Ron Carter Foursight Quartet at 9pm; Saturday runs from a midday DownBeat Blindfold Test through the Ravi Coltrane Quartet at 3:45pm to Isaiah Collier at 8:45pm; Sunday opens with gospel at 11:15am and has the Charles Lloyd Quartet at 6pm. Set times for all six stages are on the festival's schedule page.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the Monterey Jazz Festival in 2026?",
        a: "Friday 25 to Sunday 27 September 2026 — the 69th edition — at the Monterey County Fair & Event Center, 2000 Fairground Road, Monterey.",
      },
      {
        q: "How much are tickets?",
        a: "Single-day Arena is $110 Friday, $215 Saturday or Sunday. Arena Lawn is $75 Friday, $135 Saturday or Sunday. Grounds is $65 Friday, $90 Saturday or Sunday. Full-weekend packages are $230 for Grounds, from $325 for Arena lawn and from $465 for Arena sectional and side bleacher. The $395 Premier Club add-on is sold out for 2026.",
      },
      {
        q: "Does a Grounds ticket get me into the Arena?",
        a: "No. Grounds admits you to the four Grounds stages only. The Jimmy Lyons Stage headliners in the Arena need an Arena or Arena Lawn ticket, and that is the most common mistake people make with this festival.",
      },
      {
        q: "Where do I park?",
        a: "Fairgrounds parking is sold out for 2026. Park at Monterey Peninsula College instead and take the MST shuttle, which runs about every 15 minutes. MPC passes are sold online only until 24 September, then on site at the Lot A shuttle tent; an advance pass is exchanged there for a hand stamp, and the stamp is what boards the shuttle. Limited ADA parking on Fairground Road is first-come, first-served.",
      },
      {
        q: "What time do gates open?",
        a: "3pm on Friday, and 11am on Saturday and Sunday. First music is 3:30pm Friday, midday Saturday and 11:15am Sunday, and the last sets start at 9pm all three days.",
      },
      {
        q: "Can I bring a chair?",
        a: "No. Lawn, beach and folding chairs are all prohibited, as are outside food, coolers, glass, detachable-lens cameras and recording devices.",
      },
    ],
    // Set on the v1.G / v1.Y precedent: this page is now written from
    // montereyjazz.org directly, so listing the CSV's import-time references
    // would misdescribe where its content came from. referenceUrls itself is
    // left untouched — events2026.test.js asserts it matches the CSV exactly.
    hideSources: true,
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
    updated: "2026-08-21",
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
    times: [
      { day: "Saturday, September 26", hours: "Gates 9:00 a.m.; flying from about 11:30 a.m." },
      { day: "Sunday, September 27", hours: "Gates 9:00 a.m.; flying from about 11:30 a.m." },
    ],
    timesConfidence: "official",
    officialWebsite: "https://www.salinasairshow.com/",
    metaDescription:
      "26–27 September 2026 at Salinas Municipal Airport. Thunderbirds headline. Gates 9am, flying from 11:30, $30 parking — and a bag policy that turns people away.",
    intro:
      "The California International Airshow Salinas runs Saturday 26 and Sunday 27 September 2026 at Salinas Municipal Airport, with the USAF Thunderbirds headlining. Gates open at 9:00 a.m. both days and flying starts at roughly 11:30 a.m. Parking is $30. The thing most likely to spoil your morning is not the schedule but the bag policy — it is an airport, the rules are federal, and they are stricter than most people expect.",
    sections: [
      {
        heading: "The bag and cooler rules are the ones that catch people",
        body: [
          "No coolers of any kind. Not small ones, not soft ones — the organisers are explicit that this is dictated by FAA and Homeland Security requirements rather than by the airshow, so there is no arguing it at the gate.",
          "A clear bag policy applies: one clear bag no larger than 12x6x12 inches, plus one small clutch or purse no larger than 4.5x8.5 inches, plus one-gallon freezer bags. Specifically prohibited are backpacks, binocular cases, oversized totes, standard purses and mesh bags. A standard purse being on the banned list is the detail that surprises people most.",
          "Diaper bags, medically necessary items and cameras with cases are allowed as exceptions, but all of them are still subject to search. Pets are not allowed, and the organisers add a warning worth repeating: do not leave them in your vehicle, on an airfield apron in late September.",
        ],
      },
      {
        heading: "Getting there and parking",
        body: [
          "Parking is $30, on airport property close to the admission gates, entered from Skyway Boulevard and Airport Boulevard. Because the parking is on the field itself rather than off-site, the walk in is short — this is not an event where you park a mile away.",
          "Accessible parking is in a designated area close to the admission gate. It requires a handicapped plate or tag, and the organisers ask that you notify staff on arrival rather than simply following the general traffic flow.",
        ],
      },
      {
        heading: "Who is flying in 2026",
        body: [
          "The USAF Thunderbirds headline. Also announced: Mark Peterson in an A-37 Dragonfly, Goulian Aerosports, Jason Somes in a MiG-17, and Greg Colyer in a T-33 Shooting Star — a bill weighted toward Cold War-era jets alongside the modern demonstration team.",
          "The organisers note that performers are subject to change, which for airshows is more than boilerplate: military demonstration teams get pulled for operational reasons and weather closes acts on the day.",
        ],
      },
      {
        heading: "It is a fundraiser, not a commercial airshow",
        body: [
          "The airshow has run since 1981 and states that it has raised over nine million dollars for Central Coast charities. That is the point of it rather than a side effect, and it shapes the atmosphere — this is a long-standing community institution that happens to involve fast jets.",
        ],
      },
      {
        heading: "What has not been published",
        body: [
          "Ticket prices. The organisers sell through an external platform rather than listing prices on their own site, so no price appears here. Buy through the official site's ticket link rather than a resale listing.",
          "A gate closing time and a full flying schedule. Gates open at 9:00 a.m. and flying begins around 11:30 a.m.; when each act performs, and when the day ends, are not published in advance.",
        ],
      },
    ],
    faq: [
      {
        q: "What time is the airshow in Salinas?",
        a: "Gates open at 9:00 a.m. on both Saturday and Sunday, and flying starts at approximately 11:30 a.m. The organisers do not publish a closing time or a full flying schedule in advance.",
      },
      {
        q: "Is there an air show in Salinas?",
        a: "Yes — the California International Airshow Salinas, held annually at Salinas Municipal Airport since 1981. The 2026 edition runs Saturday 26 and Sunday 27 September.",
      },
      {
        q: "Will the Blue Angels be at the Salinas airshow?",
        a: "Not in 2026. The organisers have announced the USAF Thunderbirds as the 2026 headline act. Some third-party listings still show the Blue Angels for these dates — those are wrong for this year. Both teams have flown at Salinas over the show's history, but the 2026 bill is the Thunderbirds.",
      },
      {
        q: "Are any airshows cancelled in 2026?",
        a: "Not this one. The California International Airshow Salinas is scheduled for 26 and 27 September 2026 and the organisers are selling tickets. What does change at airshows is the flying: the organisers state that performers are subject to change, because military demonstration teams can be withdrawn for operational reasons and weather closes individual acts on the day. That is a different thing from the show being cancelled, and it is the far more likely outcome. We can only speak for Salinas — we do not track other airshows.",
      },
      {
        q: "Can I bring a cooler?",
        a: "No — no coolers of any kind. The organisers state this is required by the FAA and Homeland Security rather than being their own rule, so it is not negotiable at the gate.",
      },
      {
        q: "What bag can I bring?",
        a: "One clear bag no bigger than 12x6x12 inches, plus a small clutch no bigger than 4.5x8.5 inches, plus one-gallon freezer bags. Backpacks, binocular cases, oversized totes, standard purses and mesh bags are all prohibited.",
      },
      {
        q: "How much is parking?",
        a: "$30, on airport property close to the admission gates, entered from Skyway Boulevard and Airport Boulevard. Accessible parking sits near the gate and needs a handicapped plate or tag.",
      },
      {
        q: "Who is performing?",
        a: "The USAF Thunderbirds headline, with Mark Peterson in an A-37 Dragonfly, Goulian Aerosports, Jason Somes in a MiG-17 and Greg Colyer in a T-33 Shooting Star. Performers are subject to change.",
      },
      {
        q: "How much are tickets?",
        a: "Not published on the organisers' own site — tickets are sold through an external platform, so no price is listed here. Use the official ticket link rather than a resale site.",
      },
    ],
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
    venue: "Golden Bough Playhouse (Founders Theatre)",
    streetAddress: "851 Monte Verde St.",
    postalCode: "93921",
    officialWebsite: "https://ciffest.com/",
    metaDescription: "Carmel International Film Festival at the Golden Bough Playhouse: 2026 ran 1–4 October; 2027 passes are $150 a day or $500 for all four days.",
    intro: "The Carmel International Film Festival is a four-day festival of independent features, shorts, documentaries and industry panels centred on the Founders Theatre at the Golden Bough Playhouse, 851 Monte Verde Street, Carmel-by-the-Sea. The 2026 festival ran from Thursday 1 to Sunday 4 October, with early pass pick-up and a filmmaker kick-off party the evening before. The organiser traces the festival back to 1929 and is already selling passes for 2027, which its site gives as 30 September to 3 October.",
    sections: [
      {
        heading: "What the festival is like",
        body: [
          "Screenings run through the day in the Founders Theatre, many followed by a short Q&A, with panels held at nearby venues. The 2026 programme opened at 9am on the Thursday with remarks from writer-director Edward Burns, followed by a documentary on Steinbeck, Ed Ricketts and the restored Western Flyer. A panel on financing independent film that day was held at the Cypress Inn, limited to 40 seats.",
          "Frank Darabont, director of The Shawshank Redemption and creator of The Walking Dead, was the organiser's headline guest for 2026.",
        ],
      },
      {
        heading: "Passes and pick-up",
        body: [
          "The festival sells all-access passes rather than single-screening tickets. For 2027 the organiser lists a one-day pass at $150, covering every film and event on a single day, and a four-day pass at $500 for the whole festival. It was also advertising an early-bird discount code at the time of writing.",
          "Passes are collected at the theatre, either at the early pick-up the day before the festival opens or at any point during it. In 2026 the early pick-up ran from 2pm to 5pm on Wednesday 30 September in the Golden Bough's main lobby.",
        ],
      },
      {
        heading: "The 1929 connection",
        body: [
          "The organiser describes Carmel's festival as started in 1929 by Mildred Taylor, with the Carmel artist James Blanding Sloan credited on the original poster, and is building towards a centennial in 2029. The present festival is run by Lawrence Roeck and Annette Andersen.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the Carmel International Film Festival in 2027?",
        a: "The organiser's site gives 30 September to 3 October for the 2027 festival, with passes already on sale.",
      },
      {
        q: "How much is a pass?",
        a: "For 2027, $150 for a one-day all-access pass or $500 for all four days.",
      },
      {
        q: "Where are the screenings?",
        a: "Mainly in the Founders Theatre at the Golden Bough Playhouse, 851 Monte Verde St., Carmel-by-the-Sea, with some panels at nearby venues such as the Cypress Inn.",
      },
      {
        q: "When did the 2026 festival run?",
        a: "Thursday 1 to Sunday 4 October 2026, with early pass pick-up and a kick-off party on Wednesday 30 September.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Carmel International Film Festival",
      url: "https://ciffest.com/",
    },
    updated: "2026-11-26",
    hideSources: true,
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
    officialWebsite: "https://weathertechraceway.com/pages/laguna-seca-speedtour-trans-am",
    referenceUrls: ["https://www.weathertechracing.com/2026-full-schedule"],
    description:
      "A three-day Trans-Am SpeedTour race meeting at WeatherTech Raceway Laguna Seca.",
    metaDescription: "Trans Am at Laguna Seca: the October 2026 Western Championship doubleheader, and the 2027 Racing America weekend moving to 6–8 May.",
    intro: "The Trans Am weekend at WeatherTech Raceway Laguna Seca brings the Trans Am Series, with its Mustangs, Camaros and Challengers, to the Monterey circuit for a race meeting the raceway sells as Mission Foods Racing America at Laguna Seca. In 2026 it ran from Friday 2 to Sunday 4 October as a Trans Am Western Championship doubleheader, the second of three Western rounds. For 2027 the raceway has moved the weekend to the spring: 6 to 8 May, with Trans Am and SVRA historic racing heading the bill.",
    sections: [
      {
        heading: "What races",
        body: [
          "Trans Am is an American production-based road-racing series that the raceway says debuted in 1966. Its fields include an 850-plus horsepower top class, where Mustangs, Camaros and Challengers race against Audi and Mercedes-AMG machinery, alongside production-based classes.",
          "The 2026 Laguna Seca round was a doubleheader in Trans Am's Western Championship, between Sonoma in April and the Circuit of the Americas in November. For the 2027 weekend the raceway adds SVRA vintage racing and a full grid of historic Trans Am cars.",
        ],
      },
      {
        heading: "Getting there and around the circuit",
        body: [
          "The raceway lists numbered parking lots 1 to 10 plus general parking near Turn 11, and the paddock sits inside the circuit near Turns 10 and 11. Camping is available in several areas, including General, Terrace, Turn 9, Turn 5 Right, A Camp and B Camp.",
          "The raceway says lot locations can change from one event to the next and asks visitors who need accessible parking or step-free routes to confirm arrangements with it before the weekend. It does not publish ticket prices on the event page; tickets are sold through its ticketing page.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the Trans Am weekend at Laguna Seca in 2027?",
        a: "6 to 8 May 2027, sold by the raceway as Mission Foods Racing America at Laguna Seca, with Trans Am and SVRA.",
      },
      {
        q: "When was it in 2026?",
        a: "Friday 2 to Sunday 4 October 2026, as a Trans Am Western Championship doubleheader.",
      },
      {
        q: "Can you camp at the circuit?",
        a: "Yes. The raceway lists several campgrounds, including General, Terrace and Turn 9, but no prices on the event page.",
      },
    ],
    updated: "2026-11-26",
    hideSources: true,
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
    venue: "Downtown Pacific Grove (Lighthouse Avenue)",
    officialWebsite: "https://www.cityofpacificgrove.gov/our_city/departments/recreation/special_events.php",
    metaDescription: "Pacific Grove's school Butterfly Parade on Lighthouse Avenue: 2026 was Saturday 3 October, part of Butterfly Days weekend. 2027 not yet set.",
    intro: "The Butterfly Parade is Pacific Grove's school-district parade through downtown, on Lighthouse Avenue, held on the Saturday of the town's Butterfly Days weekend in early October. In 2026 it took place on Saturday 3 October, with the City of Pacific Grove's events calendar listing a 10am start and the Pacific Grove Unified School District as organiser. The same weekend brought the Heritage Society's Butterfly Days events at Chautauqua Hall and a Sunset Celebration at Point Pinos Lighthouse. A 2027 date has not been published.",
    sections: [
      {
        heading: "The 2026 parade and the weekend around it",
        body: [
          "The city's 2026–27 special events calendar lists the Butterfly Parade on Saturday 3 October 2026 at 10am on Lighthouse Avenue downtown, organised by the Pacific Grove Unified School District. The city's previous calendar listed it on Saturday 4 October 2025, also at 10am, also on Lighthouse Avenue.",
          "It sits inside a wider weekend. The Pacific Grove Heritage Society ran Butterfly Days on 3 and 4 October 2026 around Chautauqua Hall, 16th Street and Central Avenue, with a free lecture, downtown architecture walks and a birdhouse silent auction, plus a croquet tournament in Caledonia Park. The Heritage Society's Sunset Celebration at Point Pinos Lighthouse followed at 5pm on the Saturday.",
        ],
      },
      {
        heading: "What we could not confirm",
        body: [
          "The school district does not publish a parade page of its own that we could find, so this page does not give a route, a bazaar location or bazaar hours for 2026. The 10am time is the city's calendar entry for the event permit, not a timetable from the organiser, and the 2027 date will appear in the city's next special events calendar.",
        ],
      },
    ],
    faq: [
      {
        q: "When was the Pacific Grove Butterfly Parade in 2026?",
        a: "Saturday 3 October 2026. The city's events calendar listed a 10am start on Lighthouse Avenue downtown.",
      },
      {
        q: "Who organises it?",
        a: "The Pacific Grove Unified School District, according to the city's special events calendar.",
      },
      {
        q: "What else happens that weekend?",
        a: "The Heritage Society's Butterfly Days at Chautauqua Hall on the Saturday and Sunday, a croquet tournament in Caledonia Park, and the Sunset Celebration at Point Pinos Lighthouse on the Saturday evening.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Pacific Grove Unified School District",
      url: "https://www.pgusd.org/",
    },
    updated: "2026-11-26",
    hideSources: true,
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
    officialWebsite: "https://pacificgroveheritage.org/",
    metaDescription: "The Heritage Society's Sunset Celebration at Point Pinos Lighthouse on Butterfly Days Saturday: 3 October 2026 at 5pm. 2027 not yet set.",
    intro: "The Sunset Celebration is the Pacific Grove Heritage Society's evening event at Point Pinos Lighthouse on the Saturday of Butterfly Days weekend. In 2026 it was held on Saturday 3 October, with the City of Pacific Grove's events calendar listing a 5pm start at the lighthouse, after the morning Butterfly Parade and the Heritage Society's daytime programme at Chautauqua Hall. Point Pinos, lit since 1855, is the oldest continuously operating lighthouse on the West Coast according to the city. No 2027 date has been published.",
    sections: [
      {
        heading: "Where it fits in Butterfly Days",
        body: [
          "Butterfly Days is the Heritage Society's weekend in early October. In 2026 it ran on 3 and 4 October, with a free lecture, walks led by Heritage Society members through nine downtown architectural styles starting from Chautauqua Hall at 16th Street and Central Avenue, and a silent auction of handmade birdhouses. The Sunset Celebration moved the Saturday out to the lighthouse for the evening.",
          "The city's special events calendars list the Sunset Celebration on the Butterfly Days Saturday in both 2025 (4 October) and 2026 (3 October), at 5pm both times.",
        ],
      },
      {
        heading: "The lighthouse",
        body: [
          "Point Pinos sits on the northern tip of the Monterey Peninsula and has shown a light since 1 February 1855; the city, which owns it, says it is the oldest continuously operating lighthouse on the West Coast. The lighthouse's own site asks visitors to bring no drones or pets and to walk bicycles to a four-space rack.",
          "Neither the Heritage Society nor the lighthouse publishes a page for the Sunset Celebration itself, so we cannot give a ticket price or programme for it.",
        ],
      },
    ],
    faq: [
      {
        q: "When was the Sunset Celebration in 2026?",
        a: "Saturday 3 October 2026 at Point Pinos Lighthouse, listed by the city at 5pm.",
      },
      {
        q: "Who runs it?",
        a: "The Pacific Grove Heritage Society, which also runs Butterfly Days at Chautauqua Hall.",
      },
      {
        q: "Can I bring my dog?",
        a: "The lighthouse asks visitors not to bring pets.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Pacific Grove Heritage Society",
      url: "https://pacificgroveheritage.org/",
    },
    updated: "2026-11-26",
    hideSources: true,
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
    metaDescription: "Poodle Day in Carmel: the 3 October 2026 parade, beach play and evening parties for NorCal Poodle Rescue, and why 2027 moves to Cathedral City.",
    intro: "Poodle Day is an annual day out for poodles, poodle mixes and their owners, raising money for NorCal Poodle Rescue. The 2026 edition was held in Carmel-by-the-Sea on Saturday 3 October, with a parade, off-leash play on Carmel Beach in the afternoon and ticketed cocktail parties over the Friday and Saturday evenings. The organiser says the next Poodle Day will be held in Cathedral City, in the Coachella Valley, rather than Carmel, and it has not yet given a 2027 date.",
    sections: [
      {
        heading: "How the 2026 day ran",
        body: [
          "The day centred on a parade for poodles, poodle mixes and their people, followed by off-leash beach play on Carmel Beach in the afternoon. Parade registration came first: the organiser required it before anyone could buy a ticket for the evening events.",
          "The evening parties were small and sold in advance. On Friday 2 October there was a $45 pizza night at Allegro Pizza in the Barnyard and $75 gatherings at the De Tierra and Wrath tasting rooms and at Mad Dog & Englishmen. On the Saturday the options were the Cypress Inn ($85, 4pm to 6pm), VIN By the SEA ($82, 4pm to 6pm) and Mad Dog & Englishmen ($82, 6pm to 8pm). Each had a ticket cap and a per-booking limit, with waiting lists for sold-out events.",
        ],
      },
      {
        heading: "Dogs on the beach",
        body: [
          "The organiser asked owners to keep dogs away from live or recently dead marine animals on the beach because of a leptospirosis outbreak among sea lions on the California coast including Monterey Bay, to stop them drinking from stagnant puddles, and to check with a vet about the leptospirosis vaccine.",
          "Expect a sandy dog afterwards. The organiser points to outdoor showers at most Carmel hotels and a self-serve dog wash at Pet Food Express in the Crossroads.",
        ],
      },
      {
        heading: "Where the money goes, and the move",
        body: [
          "Proceeds go to NorCal Poodle Rescue, which the organiser says has been rehoming poodles and poodle mixes in Northern California and Southern Oregon since 1985. The Crossroads Carmel shopping centre was the event's sponsor in 2026.",
          "The organiser's parade page says next year's event will be in Cathedral City, California, and shows a Poodle Day 2027 poster, but no date. Anyone hoping for another Carmel Poodle Day should watch the organiser's newsletter rather than assume an October repeat.",
        ],
      },
    ],
    faq: [
      {
        q: "When was Poodle Day in 2026?",
        a: "Saturday 3 October 2026 in Carmel-by-the-Sea, with evening parties on Friday 2 and Saturday 3 October.",
      },
      {
        q: "Is Poodle Day coming back to Carmel in 2027?",
        a: "The organiser says the next event will be held in Cathedral City, California. It has not given a date.",
      },
      {
        q: "Who does Poodle Day raise money for?",
        a: "NorCal Poodle Rescue, which helps poodles and poodle mixes in Northern California and Southern Oregon.",
      },
      {
        q: "Can poodle mixes take part?",
        a: "Yes. The parade and beach play are for poodles, poodle mixes and their owners.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Poodle Day",
      url: "https://poodleday.com/",
    },
    recurrence: "An annual gathering for poodles, poodle mixes and their owners; held in Carmel through 2026, with the organiser moving it to Cathedral City in 2027.",
    updated: "2026-11-26",
    hideSources: true,
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
    officialWebsite: "https://www.carmelcalifornia.com/event/meet-the-makers/",
    referenceUrls: [
      "https://www.carmelcalifornia.com/annual-events-in-carmel-by-the-sea/",
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
    ],
    description:
      "The 7th annual art and wine walk in Carmel-by-the-Sea, centred on Devendorf Park.",
    metaDescription: "Meet the Makers in Carmel: artist-owned galleries plus Monterey County wine, 4–7pm. 2026 was 10 October; the 8th is Saturday 9 October 2027, $50.",
    intro: "Meet the Makers is an evening tour of Carmel-by-the-Sea's artist-owned galleries with Monterey County wine and local food poured along the way, starting from Devendorf Park. The 7th edition was held on Saturday 10 October 2026. Visit Carmel, which runs it with the Carmel Art Walk, has set the 8th for Saturday 9 October 2027 from 4pm to 7pm, at $50 a person, and says it will have a similar line-up to 2026.",
    sections: [
      {
        heading: "How the walk works",
        body: [
          "You start in Devendorf Park and make your own way through downtown, looking for blue lanterns outside the participating galleries. At each stop the draw is the artist being there in person, with a Monterey County winery pouring and, at some stops, a local food maker.",
          "For 2027 the ticket is $50 a person and covers the gallery visits, the wine tastings and the food tastings.",
        ],
      },
      {
        heading: "Who took part in 2026",
        body: [
          "The 2026 walk took in 19 galleries, including the Carmel Art Association, Aaron Chang Gallery, Jennifer Perlmutter Gallery and Patricia Qualls Gallery, and 17 wineries, among them Albatross Ridge, De Tierra Vineyards, I. Brand & Family, Scheid Family Vineyards and Silvestri Vineyards.",
          "Six food makers joined in, including Lula's Chocolate, The Nut Hut and Flaherty's Seafood Grill & Oyster Bar, with live music from Julie Capili, Anne Sibley, Pete Sibley and Justin Noseworthy, and musicians from the Monterey Symphony.",
        ],
      },
    ],
    faq: [
      {
        q: "When is Meet the Makers in 2027?",
        a: "Saturday 9 October 2027, 4pm to 7pm, starting in Devendorf Park.",
      },
      {
        q: "How much is a ticket?",
        a: "$50 a person for 2027, covering the gallery tour, wine tastings and food tastings.",
      },
      {
        q: "How do I find the participating galleries?",
        a: "Look for the blue lanterns outside them.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Visit Carmel",
      url: "https://www.carmelcalifornia.com/",
    },
    recurrence: "An annual October evening; 2026 was the 7th and the 8th is set for Saturday 9 October 2027.",
    nextEdition: {
      start: "2027-10-09",
      source: "https://www.carmelcalifornia.com/event/meet-the-makers/",
    },
    updated: "2026-11-26",
    hideSources: true,
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
    metaDescription: "Big Sur Food & Wine: three days of tastings, hikes and dinners along the Big Sur coast. What ran 5–7 November 2026, the 21+ rule and the shuttles.",
    intro: "The Big Sur Food & Wine Festival is a three-day run of separately ticketed tastings, hikes and dinners held at venues along the Big Sur coast, raising money for local non-profits. The 2026 festival ran from Thursday 5 to Saturday 7 November, opening with a party at Alila Ventana Big Sur and ending with the Grand Party at the Henry Miller Memorial Library. Every event is 21 and over, and some require the festival shuttle. The organiser has not yet announced 2027 dates.",
    sections: [
      {
        heading: "The 2026 programme",
        body: [
          "Thursday 5 November opened with the Magical Mystery Tour from 10am to 3pm and the Opening Night at Alila Ventana Big Sur from 6pm to 9pm.",
          "Friday 6 November had a panel tasting in The Loft at Alila Ventana (10am to 1pm), Hiking with Stemware (10:30am to 3:30pm), the Wine Walkabout in the Sierra Mar chef's garden at Post Ranch Inn (noon to 3pm), an izakaya dinner at the Big Sur Roadhouse that sold out, and the Annual Sommelier Dinner at The Village Big Sur.",
          "Saturday 7 November brought Bubbles & Brushes in the Redwoods at Big Sur Lodge (10am to 1pm), the Live Auction for Big Sur at The Village (11am to 2pm), and the Grand Party at the Henry Miller Memorial Library from 6:30pm to 9:30pm.",
        ],
      },
      {
        heading: "Shuttles, age rule and what to bring",
        body: [
          "For the Grand Party the shuttle was mandatory: the organiser says there is no parking at or near the Henry Miller Library, and guests rode either the shuttle from Carmel or the free roaming shuttle in the Big Sur valley. Shuttle tickets were sold separately, as they were for the Sommelier Dinner.",
          "All events are 21 and over, and the organiser says no pets or children. Many events are outdoors and off-trail, so footwear matters, and refillable water bottles are allowed. Tickets can be transferred up to 48 hours before an event, and the organiser refunds in full if it cancels for weather or any other reason.",
        ],
      },
      {
        heading: "Where the money goes",
        body: [
          "The festival is a project of the Big Sur Food & Wine Foundation, a volunteer-run 501(c)(3), and proceeds go to Big Sur non-profits working in health, safety, education and the arts. The organiser says the 2025 festival raised $165,000, with grants to groups including the Big Sur Health Center and Big Sur Fire, and that its cumulative grants have passed $1 million.",
        ],
      },
    ],
    faq: [
      {
        q: "When was the Big Sur Food & Wine Festival in 2026?",
        a: "Thursday 5 to Saturday 7 November 2026.",
      },
      {
        q: "Can I bring children?",
        a: "No. The organiser says every event is 21 and over, with no children or pets.",
      },
      {
        q: "Can I drive to the Grand Party?",
        a: "No. There is no parking at or near the Henry Miller Memorial Library, so the shuttle is mandatory.",
      },
      {
        q: "Are the 2027 dates out?",
        a: "Not yet on the organiser's site.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Big Sur Food & Wine Foundation",
      url: "https://www.bigsurfoodandwine.org/",
    },
    updated: "2026-11-26",
    hideSources: true,
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
    venue: "Downtown Monterey (start on Del Monte Avenue)",
    officialWebsite: "https://www.montereybayhalfmarathon.org/",
    metaDescription: "Monterey Bay Half Marathon: Cannery Row and the Pacific Grove shore. 2026 ran 8 November; next race Sunday 14 November 2027, registration opens May.",
    intro: "The Monterey Bay Half Marathon is an out-and-back road half marathon from downtown Monterey along Cannery Row to the Pacific Grove shoreline, run each November by the Big Sur Marathon Foundation. The 2026 race was on Sunday 8 November, with the Pacific Grove Lighthouse 5K and By-the-Bay 3K the day before. The next half marathon is on Sunday 14 November 2027, starting at 7am on Del Monte Avenue; the organiser says registration opens in May 2027.",
    sections: [
      {
        heading: "The course and the cut-off",
        body: [
          "The race starts on Del Monte Avenue in downtown Monterey, runs out along Cannery Row and beside the Pacific Grove shoreline, and returns to finish at Custom House Plaza in Monterey State Historic Park, where the finish village has the awards ceremony and a free beer for finishers. The course is USATF-certified and close to flat, with about 106 feet of climb in total.",
          "There is a 3.5-hour limit, about 16 minutes a mile, counted from the last start wave. Runners who fall behind may be turned around early or sent onto a shorter route, and only those inside 3:30 get a medal, an official time and the post-race food. Entry is capped at 9,000 and runners must be 12 or older.",
        ],
      },
      {
        heading: "Race-day parking",
        body: [
          "The organiser's options for the Sunday are the downtown East and West garages on Franklin Street between Washington and Alvarado (arrive by 5:30am; free until 11am), or free all-day parking at Monterey Peninsula College or Del Monte Center with shuttles to the start every 10 minutes from 5am to 6:15am. Return shuttles leave Figueroa Street at the Recreation Trail from 8:30am to noon.",
          "Private drop-offs go to Pacific Street between Jefferson and Madison, outside City Hall, a five-minute walk from the start, and there is free bike valet near the finish from 5:30am to 11:30am.",
        ],
      },
      {
        heading: "Watching the race",
        body: [
          "The organiser suggests picking one or two spots because road closures make it slow to move between them: Window on the Bay and Lake El Estero for the start, Cannery Row for miles 3 and 12, Lighthouse Avenue in downtown Pacific Grove at mile 4, Lovers Point at miles 4.4 and 10.8, and Custom House Plaza for the finish.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the Monterey Bay Half Marathon in 2027?",
        a: "Sunday 14 November 2027, starting at 7am on Del Monte Avenue. The Pacific Grove Lighthouse 5K is on Saturday 13 November.",
      },
      {
        q: "What is the time limit?",
        a: "3.5 hours, about 16 minutes per mile, from the final start wave.",
      },
      {
        q: "When does registration open?",
        a: "The organiser says registration for 2027 opens in May 2027.",
      },
      {
        q: "Where do runners park?",
        a: "Downtown garages on Franklin Street if you arrive by 5:30am, or free parking with shuttles at Monterey Peninsula College or Del Monte Center.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Big Sur Marathon Foundation",
      url: "https://www.montereybayhalfmarathon.org/",
    },
    recurrence: "Held each November by the Big Sur Marathon Foundation, with the half marathon on the Sunday of race weekend.",
    nextEdition: {
      start: "2027-11-14",
      source: "https://www.montereybayhalfmarathon.org/races/half-marathon/",
    },
    updated: "2026-11-26",
    hideSources: true,
  },
  {
    // v2.P — added 2026-11-01 from the organiser's email; content audited
    // against the choir's own two pages in v2.R. Every fact on this page is
    // stated on one of:
    //   ORG = https://www.ariamonterey.org/dbpage.php?dbase=events&id=348597&pg=view
    //         (3:00pm start, 915 Sunset Dr, the timed programme 3:00–4:05pm)
    //   TS  = https://ariamonterey.ticketspice.com/aria-where-mercy-dwells
    //         (prices, booking fees, "the Butterfly Church", performers,
    //         repertoire with composers)
    // except "early Baroque" for Monteverdi, which is the operator's.
    // The email's 2:30pm door time is on neither page, so it is not used.
    // Conflicts between the two: TS gives "915 Sunset Ave" (ORG: Dr) —
    // operator ruled 2026-11-02 that the choir's own page wins, so Drive;
    // TS lists a seventh Act I piece the ORG timed programme does not —
    // recorded, not resolved, so no endDate is emitted.
    slug: "aria-womens-choir-where-mercy-dwells",
    name: "Aria Women's Choir: Where Mercy Dwells",
    county: "Monterey",
    cityText: "Pacific Grove (First United Methodist Church of Pacific Grove)",
    city: "Pacific Grove",
    venue: "First United Methodist Church of Pacific Grove",
    streetAddress: "915 Sunset Drive",
    postalCode: "93950",
    months: ["november"],
    dateText: "November 14, 2026",
    start: "2026-11-14",
    times: [
      { day: "Saturday 14 November", hours: "3:00pm; timed programme ends 4:05pm" },
    ],
    timesConfidence: "official",
    startTime: "15:00",
    category: "Music / Choral",
    schemaType: "MusicEvent",
    officialWebsite: "https://www.ariamonterey.org/dbpage.php?dbase=events&id=348597&pg=view",
    ticketsUrl: "https://ariamonterey.ticketspice.com/aria-where-mercy-dwells",
    admission: { kind: "ticketed", from: 10, currency: "USD" },
    organizer: {
      type: "PerformingGroup",
      name: "Aria Women's Choir",
      url: "https://www.ariamonterey.org/",
    },
    performer: [
      { type: "PerformingGroup", name: "Aria Women's Choir", url: "https://www.ariamonterey.org/" },
    ],
    updated: "2026-11-01",
    hideSources: true,
    referenceUrls: ["https://ariamonterey.ticketspice.com/aria-where-mercy-dwells"],
    description:
      "Aria Women's Choir opens its 15th Anniversary Season with Where Mercy Dwells: Sacred Songs for Women's Voices, at the Butterfly Church in Pacific Grove.",
    metaDescription:
      "Aria Women's Choir sacred concert, Sat Nov 14, 3pm, Butterfly Church, Pacific Grove. Tickets $10–$25, program and details.",
    intro:
      "Aria Women's Choir sings Where Mercy Dwells: Sacred Songs for Women's Voices at 3:00pm on Saturday 14 November 2026 at First United Methodist Church of Pacific Grove — the Butterfly Church — at 915 Sunset Drive. It opens the choir's 15th Anniversary Season. The choir's timed programme runs 65 minutes with a 15-minute intermission and finishes at 4:05pm. Dr. Seán Boulware, who founded the choir in 2012, conducts, with Jon-Mark Hurley as collaborative pianist. Tickets are $25, $20 or $10 plus a booking fee, sold through the choir's TicketSpice page.",
    sections: [
      {
        heading: "Tickets and booking fees",
        body: [
          "TicketSpice sells three tickets, all labelled general admission. Adult admission is $25 plus a $3.97 fee, $28.97 in total. The senior, veteran and military ticket — for seniors 65 and over, and veterans and active military and their families, and labelled presale — is $20 plus a $3.79 fee, $23.79. The student and youth ticket, for students with ID or anyone under 18, is $10 plus a $3.44 fee, $13.44.",
          "Checkout asks for each attendee's name, and offers an optional donation to the choir on top of the ticket price.",
        ],
      },
      {
        heading: "The running order",
        body: [
          "The choir's event page publishes a timed programme. The first half runs from 3:00pm to 3:25pm: O Virtus Sapientiæ, Salve Regina, Cantate Domino, I Will Be a Child of Peace, And Can It Be, and Song of Miriam. A 15-minute intermission follows, from 3:25pm to 3:40pm. The second half runs from 3:40pm to 4:05pm: Mangisondele Nkosi Yam, We Are Held, I Will Lift My Eyes, I Choose Love, When the Spirit Says Sing, and Elijah Rock. The programme's stated duration is 65 minutes, with a finish time of 4:05pm.",
          "The repertoire list on the ticketing page does not quite match it: it has a seventh piece in the first half, Great Is Thy Faithfulness, with Jon-Mark Hurley as vocal soloist, which the timed programme does not include.",
          "The choir offers a digital concert programme, DiCoPro, to explore on your phone before you arrive, and asks that phones are kept silent and screens dim during the performance.",
        ],
      },
      {
        heading: "Who wrote the music",
        body: [
          "The choir describes the concert as a journey through centuries of sacred tradition, from the ancient mystical voice of Hildegard von Bingen and the timeless music of Palestrina and the early Baroque Monteverdi to contemporary works. The ticketing page credits each piece.",
          "First half: O virtus Sapientiae by Hildegard von Bingen, arranged by Alice Parker; Salve Regina by Palestrina, arranged by Sprague; Cantate Domino by Claudio Monteverdi, arranged by Gallina; I Will Be a Child of Peace by Elaine Hagenberg; And Can It Be? by Dan Forrest; Great Is Thy Faithfulness by William M. Runyan and Thomas O. Chisholm, arranged by Jon-Mark Hurley; and Song of Miriam by Elaine Hagenberg.",
          "Second half: Mangisondele Nkosi Yam, arranged by Michael Barrett; We Are Held by Susan LaBarr; I Will Lift My Eyes by Mark Hayes; I Choose Love by Mark A. Miller; When the Spirit Says Sing, arranged by Rollo Dilworth; and Elijah Rock!, arranged by Stacey V. Gibbs.",
          "In the choir's words it is music of peace and praise, struggle and hope, compassion and courage, asking where mercy dwells — perhaps in forgiveness, in courage, in justice, or in the quiet assurance that we are not alone.",
        ],
      },
      {
        heading: "The performers",
        body: [
          "Aria Women's Choir was founded in 2012 by its conductor, Dr. Seán Boulware, and brings together singers from California's Central Coast. Its repertoire spans sacred masterworks, contemporary choral music, jazz and musical theatre, and it made its Carnegie Hall debut in 2016.",
          "Boulware also directs Monterey Peninsula Voices and the California Central Coast Chorale. Jon-Mark Hurley, the choir's collaborative pianist, holds the same role with Monterey Peninsula Voices.",
        ],
      },
    ],
    faq: [
      {
        q: "What time does Where Mercy Dwells start?",
        a: "3:00pm on Saturday 14 November 2026. The choir's timed programme runs 65 minutes, including a 15-minute intermission, and finishes at 4:05pm.",
      },
      {
        q: "How much are tickets?",
        a: "$25 for adults, $20 for seniors 65 and over, veterans and active military and their families, and $10 for students with ID and anyone under 18. TicketSpice adds a booking fee, so they cost $28.97, $23.79 and $13.44. All three are general admission.",
      },
      {
        q: "Where is the concert?",
        a: "First United Methodist Church of Pacific Grove — the Butterfly Church — at 915 Sunset Drive, Pacific Grove, CA 93950.",
      },
      {
        q: "Who conducts the choir?",
        a: "Dr. Seán Boulware, who founded Aria Women's Choir in 2012. Jon-Mark Hurley is the collaborative pianist.",
      },
      {
        q: "What music is on the programme?",
        a: "Sacred music for women's voices, from Hildegard von Bingen, Palestrina and Monteverdi to contemporary pieces by Elaine Hagenberg, Dan Forrest, Susan LaBarr, Mark Hayes and Mark A. Miller, with arrangements by Rollo Dilworth and Stacey V. Gibbs.",
      },
    ],
  },
  {
    slug: "christmas-in-the-adobes",
    updated: "2026-11-26",
    name: "Christmas in the Adobes",
    county: "Monterey",
    cityText: "Monterey (historic downtown adobes)",
    city: "Monterey",
    venue: "Historic adobes of Old Monterey",
    months: ["december"],
    dateText: "December 11-12, 2026",
    start: "2026-12-11",
    end: "2026-12-12",
    times: [
      {
        day: "Friday 11 December",
        hours: "5:00pm – 9:00pm",
      },
      {
        day: "Saturday 12 December",
        hours: "5:00pm – 9:00pm",
      },
    ],
    timesConfidence: "official",
    category: "Holiday / Heritage",
    officialWebsite: "https://www.mshpa.org/christmasintheadobes",
    referenceUrls: [
      "https://whatsupmonterey.com/events/holiday-events/christmas-in-the-adobes/209",
      "https://www.seemonterey.com/event/christmas-in-the-adobes/",
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
    ],
    description:
      "A one-evening holiday heritage event through Monterey's historic downtown adobes.",
    guideLink: {
      href: "/holiday-lights/",
      label: "Holiday lights map 2026",
      blurb: "Every tree lighting, lighted boat parade and drive-through display around Monterey Bay on one map, with dates, prices and directions.",
    },
    metaDescription: "Christmas in the Adobes 2026: Fri 11 & Sat 12 December, 5–9pm, Old Monterey. $30 a night, $45 both nights, under-18s free. Where to collect wristbands.",
    intro: "Christmas in the Adobes is two evenings of luminaria-lit open houses in the historic adobes of Old Monterey, run by the Monterey State Historic Park Association. The 42nd annual event is on Friday 11 and Saturday 12 December 2026, from 5pm to 9pm both nights. Tickets are $30 for one night or $45 for both, and anyone 17 or under gets in free. You do not show a ticket at each adobe: everyone collects a wristband and map at one of three will-call points first, which open at 4pm. It goes ahead rain or shine.",
    sections: [
      {
        heading: "Tickets, and the wristband step",
        body: [
          "An adult single-night ticket is $30 and the two-night Gold Pass is $45. Youth 17 and under are free. Military and MSHPA member discounts are not sold online; buy those in person at the Custom House Store. No refunds are given.",
          "Online tickets are not accepted at the adobes themselves, whether printed or on your phone. Exchange them for a wristband and map at will-call, which opens at 4pm each night at the Stanton Center in Custom House Plaza, at Casa Gutierrez, 590 Calle Principal, or at Stevenson House, 530 Houston Street. Choosing the will-call nearest where you park saves a walk back.",
        ],
      },
      {
        heading: "What the evening is",
        body: [
          "The adobes are lit with luminarias and dressed for the season, with music and refreshments, and with displays on early Monterey's holiday traditions and history. The organiser has said a 2026 route map is still to come, so the exact list of open buildings is not yet published.",
          "The event is outdoors between buildings and runs whatever the weather, so dress for a December evening on foot.",
        ],
      },
      {
        heading: "Friday's separate reception",
        body: [
          "On Friday 11 December only, the organiser holds a reception from 4pm to 7pm in the Memory Garden, 20 Custom House Plaza. It costs $65 a person, includes seasonal bites, wine from Joyce Winery and admission, and has limited space. It is not included in a Christmas in the Adobes ticket.",
        ],
      },
    ],
    faq: [
      {
        q: "When is Christmas in the Adobes 2026?",
        a: "Friday 11 and Saturday 12 December 2026, 5pm to 9pm both nights.",
      },
      {
        q: "How much are tickets?",
        a: "$30 for one night or $45 for the two-night Gold Pass. Youth 17 and under are free.",
      },
      {
        q: "Can I show my e-ticket at the adobes?",
        a: "No. Collect a wristband and map at will-call first: the Stanton Center, Casa Gutierrez or Stevenson House, from 4pm.",
      },
      {
        q: "Is it cancelled if it rains?",
        a: "No. The organiser says it runs rain or shine.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Monterey State Historic Park Association",
      url: "https://www.mshpa.org/",
    },
    startTime: "17:00",
    endTime: "21:00",
    admission: {
      kind: "ticketed",
      from: 30,
      currency: "USD",
    },
    recurrence: "An annual December event; 2026 is the 42nd.",
    hideSources: true,
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
    officialWebsite: "https://www.firstnightmonterey.org/",
    referenceUrls: [
      "https://www.seemonterey.com/wp-content/uploads/2026-Annual-Events-Monterey-County-CA.pdf",
      "https://www.seemonterey.com/events/annual-events/",
    ],
    description:
      "Monterey's New Year's Eve arts festival, held across downtown on December 31.",
    guideLink: {
      href: "/new-years-eve/monterey/",
      label: "New Year's Eve 2026 in Monterey",
      blurb: "First Night and everything else on the Peninsula that night: hotel parties, concerts, getting home, and what's open on New Year's Day.",
    },
    metaDescription: "First Night Monterey, 31 December 2026, 3pm–midnight downtown. Buttons $30 adult, $15 youth (early bird to 14 Dec), under-6s free; free shuttle.",
    intro: "First Night Monterey is the town's New Year's Eve arts festival: nine hours of music, dance, fire shows and family activities across indoor and outdoor venues in historic downtown Monterey, from 3pm to midnight on Thursday 31 December 2026. Entry is by a button rather than a ticket. Early-bird buttons are $30 for adults and $15 for ages 6 to 15 until 14 December, and children 5 and under are free. The organiser badges this edition First Night Monterey 2027, with the theme \"Color the Night!\", and says most venues and the midnight countdown are indoors.",
    sections: [
      {
        heading: "Buttons: prices and where to get them",
        body: [
          "Adult buttons (16 and over) are $30 early bird, $32 in advance to 30 December and $35 on the night. Youth buttons (6 to 15) are $15, $18 and $20 on the same pattern. Children 5 and under are free. Buttons are non-refundable.",
          "Online sales close on 28 December, and online orders are not posted: collect them at will-call in the Monterey Conference Center lobby on 30 December from 10am to 3pm or on 31 December from 9am to 7pm. From December buttons are also sold at Monterey County Safeway stores, Andronico's and the Grove Market in Pacific Grove.",
        ],
      },
      {
        heading: "The shape of the night",
        body: [
          "The festival opens at 3pm. Kids' Night Out runs from the opening until the Twilight Procession at 5:30pm, so families with young children can do the first part and the procession and still be home early. After that the evening is performances across the downtown venues, plus hands-on art stations and food and drink booths.",
          "The countdown finale starts at 11:15pm and is held indoors. The organiser says about 85% of the sites are indoors and the festival goes ahead rain or shine.",
        ],
      },
      {
        heading: "Parking and the free shuttle",
        body: [
          "The festival area is closed to cars and there is no valet. The organiser's advice is to park at Del Monte Center, near the lower level by Macy's, and take the free shuttle from the MST stop there, which runs every 15 minutes from 3:15pm to the downtown transit centre at Alvarado and Pearl. The last bus back to Del Monte Center leaves at 12:30am.",
          "Anyone wearing a button rides any operating MST line free from 3pm, on a Saturday timetable. There are no other late-night routes this year, so plan the trip home before you go. Bike racks are along Alvarado Street and near the Del Monte Center shuttle stop, but bikes must be walked within the festival and are not allowed in venues.",
        ],
      },
    ],
    faq: [
      {
        q: "What time does First Night Monterey start and finish?",
        a: "3pm to midnight on Thursday 31 December 2026, with the Twilight Procession at 5:30pm and the countdown finale from 11:15pm.",
      },
      {
        q: "How much is a button?",
        a: "$30 for adults and $15 for ages 6 to 15 until the early-bird deadline on 14 December, rising to $35 and $20 on the night. Children 5 and under are free.",
      },
      {
        q: "Where should I park?",
        a: "At Del Monte Center, then take the free shuttle downtown, which runs every 15 minutes from 3:15pm. The last return bus leaves at 12:30am.",
      },
      {
        q: "What happens if it rains?",
        a: "It goes ahead. About 85% of the venues are indoors, including the midnight countdown.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "First Night Monterey",
      url: "https://www.firstnightmonterey.org/",
    },
    times: [
      {
        day: "Thursday 31 December",
        hours: "3:00pm – midnight",
      },
    ],
    timesConfidence: "official",
    startTime: "15:00",
    admission: {
      kind: "ticketed",
      from: 15,
      currency: "USD",
    },
    recurrence: "Held every New Year's Eve in downtown Monterey; the organiser says it has run for more than 30 years.",
    updated: "2026-11-26",
    hideSources: true,
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
    officialWebsite: "https://cabrillomusic.org/",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.kalw.org/2026-04-08/santa-cruzs-cabrillo-festival-of-contemporary-music-announces-its-64th-season-we-the-dreamers",
      "https://en.wikipedia.org/wiki/Cabrillo_Festival_of_Contemporary_Music",
    ],
    description:
      "The 64th season of the Cabrillo Festival of Contemporary Music, running two weeks at the Santa Cruz Civic Auditorium.",
    streetAddress: "307 Church Street",
    postalCode: "95060",
    metaDescription: "Santa Cruz's two-week summer festival of new orchestral music. 2027 runs 1–15 August; what the 2026 season held, ticket prices and what was free.",
    intro: "The Cabrillo Festival of Contemporary Music is a two-week summer festival of new orchestral music at the Santa Cruz Civic Auditorium, 307 Church Street. The organiser describes it as an annual event and as the longest-running American festival devoted solely to new music for orchestra. Its 64th season, \"We the Dreamers\", ran from 26 July to 9 August 2026 with four orchestra concerts led by music director Cristian Măcelaru, alongside free open rehearsals, a family concert and a youth ensemble concert. The next festival is already dated: 1 to 15 August 2027.",
    sections: [
      {
        heading: "What the festival is",
        body: [
          "Almost everything played here is recent work, and much of it is being heard in the United States or on the West Coast for the first time. The organiser says it has presented hundreds of world, US and West Coast premieres and commissioned more than 50 works in the past fifteen years.",
          "Its own history page traces the festival to concerts at the Sticky Wicket coffeehouse in Aptos in the early 1960s; the first festival opened on 21 August 1963, and it moved to the Civic Auditorium in downtown Santa Cruz in 1991. Cristian Măcelaru is music director and Marin Alsop music director laureate; 2026 was Măcelaru's tenth summer with the orchestra, and the organiser says the full celebration of that anniversary is planned for 2027.",
        ],
      },
      {
        heading: "How the 2026 season ran",
        body: [
          "Open rehearsals began on the evening of Sunday 26 July and ran on most days up to 7 August. The Conductors/Composers Workshop's In the Works concert followed on Tuesday 28 July. The four main concerts were On Freedom on Friday 31 July at 8pm (with Philip Glass's Symphony No. 15, \"Lincoln\", and a free picnic and fanfare from 6:30pm), Defiant Dreams on Saturday 1 August at 7pm, Control on Saturday 8 August at 7pm, and the Hope as Our Banner finale on Sunday 9 August at 7pm.",
          "The free family concert was on Sunday 2 August at 1pm, Meet the Composers on 1 August at 1:30pm, and the youth ensemble played on 8 August at 3:30pm. The season was framed around the 250th anniversary of the Declaration of Independence, and KALW 91.7 FM scheduled broadcasts of the four main concerts on Sundays from 30 August to 20 September.",
        ],
      },
      {
        heading: "Tickets, and what costs nothing",
        body: [
          "On the organiser's 2026 order form, single tickets for each orchestra concert were $41, $80 or $96, with $26 tickets for anyone 35 or under. Subscriptions for all four concerts were $320 or $380 depending on seating tier.",
          "A good share of the festival is free: the open rehearsals, the In the Works concert, the family concert, Meet the Composers and the youth ensemble concert. The Civic box office at 307 Church Street sells tickets by phone on 831-420-5260 ext. 5, Tuesday to Friday from noon to 4pm and during festival events.",
        ],
      },
      {
        heading: "Getting to the Civic",
        body: [
          "The Civic Auditorium is downtown at the corner of Center and Church Streets, opposite City Hall. The organiser points to several city-owned car parks within walking distance and advises leaving plenty of time before a concert.",
          "By bus, the organiser suggests the 17 from San Jose Diridon to Soquel Avenue and Front Street, about an eight-minute walk away. From Monterey it is the 20 to Salinas, the 28 to Watsonville and then the 1 or 2 into Santa Cruz. Anyone with access needs is asked to call the box office ahead of time.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the 2027 Cabrillo Festival?",
        a: "The organiser has announced 1 to 15 August 2027, at the Santa Cruz Civic Auditorium. Concert dates within that run have not yet been published.",
      },
      {
        q: "How much were tickets in 2026?",
        a: "Single tickets for the orchestra concerts were $41, $80 or $96, and $26 for anyone aged 35 or under. Full-season subscriptions were $320 or $380.",
      },
      {
        q: "Is any of it free?",
        a: "Yes. Open rehearsals, the In the Works concert, the family concert, Meet the Composers and the youth ensemble concert were all free in 2026.",
      },
      {
        q: "Where is it held?",
        a: "At the Santa Cruz Civic Auditorium, 307 Church Street, on the corner of Center and Church Streets in downtown Santa Cruz.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Cabrillo Festival of Contemporary Music",
      url: "https://cabrillomusic.org/",
    },
    recurrence: "An annual two-week festival of new orchestral music held each summer at the Santa Cruz Civic Auditorium.",
    nextEdition: {
      start: "2027-08-01",
      end: "2027-08-15",
      source: "https://cabrillomusic.org/",
    },
    updated: "2026-11-26",
    hideSources: true,
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
    venue: "Historic downtown Watsonville",
    officialWebsite: "https://watsonville.gov/1117/Watsonville-Strawberry-Festival",
    metaDescription: "Watsonville's free downtown strawberry festival: what the 2026 weekend held, its hours, the Friday kick-off, and how it began after Loma Prieta.",
    intro: "The Watsonville Strawberry Festival is a free, family weekend in historic downtown Watsonville run by the city's Parks & Community Services department. In 2026 it ran on Saturday 1 August from 11am to 8pm and Sunday 2 August from 11am to 7pm, after a Friday-evening kick-off with carnival rides in City Plaza Park. Expect live entertainment, carnival rides, children's activities, local artisans and a lot of strawberry-themed food. The city has not yet announced dates for 2027.",
    sections: [
      {
        heading: "What happens",
        body: [
          "The city describes live entertainment, carnival rides, kids' activities and booths from local artisans and vendors, with food built around the fruit: strawberry pizza, tacos, churros, popcorn and shortcake among them. Beer is also sold.",
          "The kick-off on Friday 31 July 2026 ran from 5pm to 9pm at City Plaza Park, at Main Street and Peck Street, with live entertainment and carnival rides only, ahead of the full festival opening on Saturday.",
        ],
      },
      {
        heading: "Why Watsonville holds it",
        body: [
          "The city traces the festival to the Watsonville Strawberry Dessert Festival, founded in 1994 to help the downtown recover from the Loma Prieta earthquake. Its stated aims are to give the downtown a safe, family event, to recognise strawberries as the Pajaro Valley's largest and most valuable crop, and to let local non-profits raise money and awareness.",
          "After the 2026 festival the city ran an attendee survey in English and Spanish, with a prize raffle for those who completed it, to shape next year's event.",
        ],
      },
    ],
    faq: [
      {
        q: "Is the Watsonville Strawberry Festival free?",
        a: "Yes. The city describes it as a free, family-friendly festival.",
      },
      {
        q: "What were the 2026 hours?",
        a: "Saturday 1 August 11am–8pm and Sunday 2 August 11am–7pm, with a kick-off at City Plaza Park on Friday 31 July from 5pm to 9pm.",
      },
      {
        q: "When is the 2027 festival?",
        a: "The City of Watsonville has not announced 2027 dates yet.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "City of Watsonville Parks & Community Services",
      url: "https://watsonville.gov/1117/Watsonville-Strawberry-Festival",
    },
    times: [
      {
        day: "Saturday 1 August",
        hours: "11:00am – 8:00pm",
      },
      {
        day: "Sunday 2 August",
        hours: "11:00am – 7:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "11:00",
    endTime: "19:00",
    updated: "2026-11-26",
    hideSources: true,
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
    streetAddress: "361 Kings Village Road",
    postalCode: "95066",
    officialWebsite: "https://www.scottsvalley.gov/CivicAlerts.aspx?AID=342",
    metaDescription: "How Scotts Valley marked 60 years as a city: the 2 August 2026 birthday bash at Skypark and the week of events around it.",
    intro: "Scotts Valley's 60th anniversary celebration was a one-off birthday party at Skypark, 361 Kings Village Road, on Sunday 2 August 2026, the exact date the city was incorporated in 1966. It opened at 10:30am with residents telling stories about the town's past, followed by a group birthday song and cake, a set by Vintage Point, a roller rink on the basketball court and a restored stagecoach. The party anchored a week of city events running into the following weekend.",
    sections: [
      {
        heading: "Why 2 August",
        body: [
          "The city recounts that residents voted to incorporate on 14 April 1964, without a city property tax, and that the result was fought in court for two years before it stood. Scotts Valley formally became a city on 2 August 1966, which made the 2026 party a true 60th birthday.",
        ],
      },
      {
        heading: "What happened at Skypark",
        body: [
          "The day began with a Share Your Story programme in which residents gave three-to-five-minute recollections of growing up in Scotts Valley and of landmarks such as Skypark Airport, The Barn and Santa's Village; the city's recap says 14 people spoke. Council members then led the birthday song and served cake.",
          "Around that were interactive history booths, inflatables, 1960s-themed craft tables, vintage Volkswagens and food trucks, roller skating in the style of the old rink, and a restored 1860s Wells Fargo stagecoach. Vintage Point played as the birthday band, and the city asked people to bring chairs or blankets.",
        ],
      },
      {
        heading: "The rest of the week",
        body: [
          "The city spread the celebration over the following days: Coffee with the Legends at the Senior Center on the Monday, with former mayors, council members and staff; National Night Out hosted by the police at MacDorsa Park on the Tuesday; guided walks at Glenwood Preserve and Lodato Park on the Wednesday; and a shop-local receipt draw from Friday to Sunday.",
        ],
      },
    ],
    faq: [
      {
        q: "Is the Scotts Valley 60th celebration happening again?",
        a: "No. It marked the city's 60th birthday on 2 August 2026 and was a one-off.",
      },
      {
        q: "Where is Skypark?",
        a: "361 Kings Village Road, Scotts Valley.",
      },
      {
        q: "When was Scotts Valley incorporated?",
        a: "On 2 August 1966, after residents voted to incorporate in April 1964 and a two-year court challenge.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "City of Scotts Valley",
      url: "https://www.scottsvalley.gov/",
    },
    times: [
      {
        day: "Sunday 2 August",
        hours: "From 10:30am",
      },
    ],
    timesConfidence: "official",
    startTime: "10:30",
    updated: "2026-11-26",
    hideSources: true,
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
    streetAddress: "307 Church Street",
    postalCode: "95060",
    metaDescription: "The Cabrillo Festival's free Sunday-afternoon orchestra concert for families at the Santa Cruz Civic. What the 2026 programme held; 2027 date not yet set.",
    intro: "The Cabrillo Festival's Free Family Concert is a no-charge Sunday-afternoon orchestra concert at the Santa Cruz Civic Auditorium, 307 Church Street, given during the festival's two-week summer season. In 2026 it took place at 1pm on Sunday 2 August, conducted by Octavio Más-Arocas, with a tour of the orchestra and students from El Sistema Santa Cruz/Pajaro Valley playing alongside the professional musicians. The organiser has set the 2027 festival for 1 to 15 August but has not yet given the family concert's date.",
    sections: [
      {
        heading: "What the 2026 concert included",
        body: [
          "The programme paired two short orchestral pieces chosen with younger listeners in mind: Paul Dooley's The Conductor's Spellbook and Gala Flagello's Bravado. Octavio Más-Arocas conducted.",
          "Between the music, the orchestra gave a \"Tour of the Orchestra\" introducing its sections, and honour students from El Sistema Santa Cruz/Pajaro Valley performed side by side with festival musicians.",
        ],
      },
      {
        heading: "Cost and how it is paid for",
        body: [
          "Entry is free. The organiser's 2026 order form listed the family concert at no charge next to the paid orchestra concerts, and invited buyers to add $10 to their order to help fund the festival's free education programmes, which include this concert, the open rehearsals and Meet the Composers.",
        ],
      },
      {
        heading: "Where it is",
        body: [
          "The Civic Auditorium is in downtown Santa Cruz at the corner of Center and Church Streets, opposite City Hall, with city-owned car parks within walking distance. The festival box office there answers on 831-420-5260 ext. 5, Tuesday to Friday from noon to 4pm.",
        ],
      },
    ],
    faq: [
      {
        q: "Is the Cabrillo Festival family concert really free?",
        a: "Yes. The organiser lists it as free, and it was free in 2026.",
      },
      {
        q: "When is the 2027 family concert?",
        a: "Not announced yet. The 2027 festival runs 1 to 15 August; in 2026 the family concert was on Sunday 2 August at 1pm.",
      },
      {
        q: "Where is it held?",
        a: "At the Santa Cruz Civic Auditorium, 307 Church Street, Santa Cruz.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Cabrillo Festival of Contemporary Music",
      url: "https://cabrillomusic.org/",
    },
    times: [
      {
        day: "Sunday 2 August",
        hours: "1:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "13:00",
    recurrence: "A free family concert held during the Cabrillo Festival each summer, which the organiser describes as one of the festival's continuing free traditions.",
    updated: "2026-11-26",
    hideSources: true,
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
    streetAddress: "307 Church Street",
    postalCode: "95060",
    metaDescription: "The closing concert of the 2026 Cabrillo Festival, Hope as Our Banner: the programme, ticket prices, and when the 2027 festival runs.",
    intro: "Hope as Our Banner was the grand finale of the 2026 Cabrillo Festival of Contemporary Music, played at 7pm on Sunday 9 August at the Santa Cruz Civic Auditorium, 307 Church Street. The programme was made up of four West Coast or US premieres, including Lisa Bielawa's Pulse with violinist Tessa Lark, and closed with poet Rita Dove reading her own work honouring Martin Luther King Jr. alongside Barber's Adagio for Strings. The festival returns from 1 to 15 August 2027; the date of next year's finale has not been announced.",
    sections: [
      {
        heading: "The 2026 programme",
        body: [
          "Eunike Tanzil's Ascending Creatures (West Coast premiere), Lisa Bielawa's Pulse with soloist Tessa Lark (West Coast premiere), Elena Kats-Chernin's Rainbow Promise (US premiere) and Sean Shepherd's Wanderlust (West Coast premiere).",
          "The organiser billed the final item as a post-season reflection: Rita Dove performing original poetry honouring Martin Luther King Jr. with Samuel Barber's Adagio for Strings, the first West Coast performance of the poetry. Cake and bubbly followed the concert.",
        ],
      },
      {
        heading: "Tickets",
        body: [
          "On the organiser's 2026 order form, seats for each orchestra concert, the finale included, were $41, $80 or $96, with $26 tickets for anyone aged 35 or under. The finale was also part of the four-concert subscription.",
          "Anyone who missed it could hear it later: KALW 91.7 FM scheduled a broadcast of Hope as Our Banner for 6pm on Sunday 20 September.",
        ],
      },
      {
        heading: "Next year",
        body: [
          "The organiser has announced 1 to 15 August 2027 for its next festival at the Civic Auditorium, which will also mark music director Cristian Măcelaru's tenth anniversary with the orchestra. Individual concert dates, including the finale, have not been published yet.",
        ],
      },
    ],
    faq: [
      {
        q: "What was played at the 2026 Cabrillo Festival finale?",
        a: "Works by Eunike Tanzil, Lisa Bielawa, Elena Kats-Chernin and Sean Shepherd, followed by Rita Dove's poetry honouring Martin Luther King Jr. with Barber's Adagio for Strings.",
      },
      {
        q: "How much were tickets?",
        a: "$41, $80 or $96, and $26 for anyone aged 35 or under.",
      },
      {
        q: "When is the 2027 finale?",
        a: "Not announced. The 2027 festival runs 1 to 15 August at the Santa Cruz Civic Auditorium.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Cabrillo Festival of Contemporary Music",
      url: "https://cabrillomusic.org/",
    },
    times: [
      {
        day: "Sunday 9 August",
        hours: "7:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "19:00",
    updated: "2026-11-26",
    hideSources: true,
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
    venue: "HWY 17 Studios",
    streetAddress: "831 Almar Ave",
    officialWebsite: "https://www.collectivesocialclub.com/",
    metaDescription: "All-Star Fest at HWY 17 Studios, Santa Cruz: a free food, drink and makers day on 5 September 2026. What it was, parking and the dog rule.",
    intro: "All-Star Fest was a free, all-ages food, drink and makers market at HWY 17 Studios, 831 Almar Ave, Santa Cruz, on Saturday 5 September 2026 from 11am to 5pm. Collective Santa Cruz and the food account Double Meat Please put it on, filling a 20,000 sq ft indoor-and-outdoor space with restaurants, breweries, coffee roasters, artists and makers they had picked from Santa Cruz and further afield. No ticket was needed. The hosts have not announced another edition.",
    sections: [
      {
        heading: "What it was",
        body: [
          "The idea, in the hosts' words, was a \"best of the best\" roster: the local businesses they had come across that they thought everyone should know about, gathered in one place for a day. Food and drink vendors were invited to apply alongside artists and makers selling prints, ceramics, vintage, jewellery, clothing and homewares, and there was music and interactive activities through the day.",
          "Collective Santa Cruz runs community events and a directory of local pop-ups and businesses; Double Meat Please is a food-focused social media account covering local restaurants, chefs and pop-ups.",
        ],
      },
      {
        heading: "Getting in, parking and dogs",
        body: [
          "Entry was free and open to all ages, with no ticket. The hosts said there would be street parking in the surrounding neighbourhood and asked visitors to be considerate of nearby businesses and residents.",
          "Only service animals were allowed; the hosts asked people to leave other dogs at home.",
        ],
      },
    ],
    faq: [
      {
        q: "Did you need a ticket for All-Star Fest?",
        a: "No. Admission was free and the event was open to all ages.",
      },
      {
        q: "Where was it held?",
        a: "At HWY 17 Studios, 831 Almar Ave, Santa Cruz.",
      },
      {
        q: "Could I bring my dog?",
        a: "No. The hosts allowed service animals only.",
      },
      {
        q: "Will there be another one?",
        a: "Nothing has been announced. The hosts post news on Instagram as @CollectiveSantaCruz and @DoubleMeatPlease.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Collective Santa Cruz",
      url: "https://www.collectivesocialclub.com/",
    },
    times: [
      {
        day: "Saturday 5 September",
        hours: "11:00am – 5:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "11:00",
    endTime: "17:00",
    updated: "2026-11-26",
    hideSources: true,
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
    metaDescription: "Capitola Art & Wine Festival returns 11–12 September 2027. Free entry, $20 tasting glass, Capitola Mall shuttle, no pets: how the weekend works.",
    intro: "The Capitola Art & Wine Festival is a free weekend of fine art, local wine, food and live music in Capitola's seaside village, organised each September by the Capitola-Soquel Chamber of Commerce. The 2026 festival ran on Saturday 12 September from 10am to 6pm and Sunday 13 September from 10am to 5pm. The organiser has already announced the next one: Saturday 11 and Sunday 12 September 2027, with the same hours. Entry costs nothing; wine tasting needs a festival glass and tokens.",
    sections: [
      {
        heading: "Entry and wine tasting",
        body: [
          "Walking in and looking at the art is free. To taste, you buy a festival glass, $20 in 2026 and again for 2027, plus tasting tokens at the Glass & Token booths around the festival. Tasting is 21 and over and ID is required. The organiser does not publish the token price.",
          "The festival is a fundraiser for the Chamber, a 501(c)(6) non-profit, and for the local schools and community groups that staff it. The organiser says it draws more than 30,000 people.",
        ],
      },
      {
        heading: "Parking, shuttle and bikes",
        body: [
          "The organiser directs drivers to the guest parking area at Capitola Mall on 41st Avenue, where a free shuttle runs to the festival entrance about every 20 minutes. In 2026 it ran from 9:30am to 8pm on Saturday and 9:30am to 6pm on Sunday, and the organiser says it is wheelchair accessible.",
          "Cyclists can use the free bike valet run by Harbor High Leadership in the David Lyng Real Estate car park at Capitola Avenue and Stockton Avenue in the village.",
        ],
      },
      {
        heading: "Pets and the 2026 poster",
        body: [
          "Pets are not allowed: the organiser asks people to leave them at home because of the crowds on foot.",
          "Each year has a featured poster artist. For 2026 it was Jacque Price, a Santa Cruz painter with a studio gallery in Soquel, whose poster was titled Birdfolk on Capitola Beach.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the 2027 Capitola Art & Wine Festival?",
        a: "Saturday 11 September 2027, 10am–6pm, and Sunday 12 September 2027, 10am–5pm.",
      },
      {
        q: "Is it free?",
        a: "Entry is free. Wine tasting needs a $20 festival glass plus tokens, and you must be 21 or over with ID.",
      },
      {
        q: "Where should I park?",
        a: "At the guest parking area at Capitola Mall on 41st Avenue, then take the free shuttle to the festival entrance.",
      },
      {
        q: "Can I bring my dog?",
        a: "No. The organiser asks visitors to leave pets at home.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Capitola-Soquel Chamber of Commerce",
      url: "https://capitolaartandwine.com/",
    },
    times: [
      {
        day: "Saturday 12 September",
        hours: "10:00am – 6:00pm",
      },
      {
        day: "Sunday 13 September",
        hours: "10:00am – 5:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "10:00",
    endTime: "17:00",
    recurrence: "An annual September weekend festival of art, wine, food and music in Capitola, hosted by the Capitola-Soquel Chamber of Commerce.",
    nextEdition: {
      start: "2027-09-11",
      end: "2027-09-12",
      source: "https://capitolaartandwine.com/",
    },
    updated: "2026-11-26",
    hideSources: true,
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
    officialWebsite: "https://www.santacruzcountyfair.com/",
    referenceUrls: [
      "https://www.santacruzcountyfair.com/news-releases/2026-santa-cruz-county-fair-theme-revealed",
      "https://www.santacruz.org/upcoming-event/santa-cruz-county-fair-2/",
      "https://www.bayareakidfun.com/bay-area-county-fairs/",
    ],
    description:
      "Santa Cruz County's annual fair, five days at the fairgrounds in Watsonville under the theme “Apple Pies and Starry Skies”.",
    streetAddress: "2601 East Lake Ave",
    postalCode: "95076",
    metaDescription: "Santa Cruz County Fair in Watsonville: what the 2026 \"Apple Pies and Starry Skies\" fair held, from livestock to drones, and how to get there.",
    intro: "The Santa Cruz County Fair is a five-day agricultural fair at the Santa Cruz County Fairgrounds, 2601 East Lake Ave, on Highway 152 just east of Watsonville. The 2026 fair ran from Wednesday 16 to Sunday 20 September under the theme \"Apple Pies and Starry Skies!\", with nightly concerts, a new 300-drone show, monster trucks, exhibit halls and the Junior Livestock Auction. Opening-day entry was $2.50 to mark the country's 250th birthday. Dates for 2027 have not been announced.",
    sections: [
      {
        heading: "What the 2026 fair held",
        body: [
          "Concerts on the Friday, Saturday and Sunday nights featured Andy Vargas, the Watsonville-born lead singer of Santana; James Durbin, the American Idol alumnus from Santa Cruz; and Los Mismos. A new 300-drone show ran on the same three nights, and the Monster X Tour monster trucks played the Wednesday and Thursday evenings on a separate ticket.",
          "During the day there were shows including Twinkle Time, hypnotist Michael Mezmer, POWERHOUSE!!! Percussive Dance and magician Frank Thurston, plus carnival rides and pig races. Exhibit halls covered baked goods, flowers, photography, quilts, LEGO, handspinning and weaving, poetry, fine art and farm produce.",
        ],
      },
      {
        heading: "Livestock and the auction",
        body: [
          "The fair's centre of gravity is still agriculture. Local young people showed hogs, steers, goats, lambs, poultry and rabbits, and the Junior Livestock Auction on the Saturday morning raised a record $785,323.50, according to the organiser.",
          "The organiser says more than 53,000 people were on the grounds over the five days, with over 10,800 on opening day, and that paid admissions were up 11% on the previous year.",
        ],
      },
      {
        heading: "Getting there",
        body: [
          "The fairgrounds sit on Highway 152 (East Lake Avenue) just east of Watsonville. The organiser publishes an alternate-routes map and suggests the back roads, Casserly and Carlton among them, can be quicker than the highway even if they are not shorter.",
          "Presale tickets for the fair and the monster trucks are sold through the organiser's ticket site, and it publishes a list of allowed and prohibited items and a code of conduct before you go.",
        ],
      },
      {
        heading: "A long history",
        body: [
          "The organiser's history page dates the first Santa Cruz County fair to 1885 or 1887, depending on the historian, when it opened in a skating rink near the plaza in Watsonville. The fair has been held on its current site along what was Hecker Pass Road, now East Lake Avenue, since 1941.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the 2027 Santa Cruz County Fair?",
        a: "The organiser has not announced 2027 dates yet. The 2026 fair ran Wednesday 16 to Sunday 20 September.",
      },
      {
        q: "Where is the fair held?",
        a: "At the Santa Cruz County Fairgrounds, 2601 East Lake Ave, Watsonville, on Highway 152 just east of town.",
      },
      {
        q: "How much was admission?",
        a: "Opening day in 2026 was $2.50, cash only at the gate. The organiser's 2026 releases do not list the regular daily prices.",
      },
      {
        q: "Were the monster trucks included in admission?",
        a: "No. The Monster X Tour on the Wednesday and Thursday nights needed a separate ticket.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Santa Cruz County Fair",
      url: "https://www.santacruzcountyfair.com/",
    },
    recurrence: "A yearly five-day county fair at the Santa Cruz County Fairgrounds outside Watsonville, which the organiser traces back to the 1880s and which has been on its East Lake Avenue site since 1941.",
    updated: "2026-11-26",
    hideSources: true,
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
    officialWebsite: "https://www.santacruzca.gov/City-News-Press-Releases/New-page-16",
    metaDescription: "The Aloha Outrigger Races off the Santa Cruz Wharf: how team entry works, what the 2026 races cost, the hula schedule, and free spectating.",
    intro: "The Aloha Outrigger Races are an annual day of outrigger canoe racing on Monterey Bay at the Santa Cruz Wharf, hosted by the City of Santa Cruz Parks & Recreation Department with the Pu Pu 'O Hawaii Outrigger Club. The 34th edition took place on Saturday 19 September 2026. Teams of four paddle with experienced outrigger crews, so no experience is needed, and watching from the wharf is free. Hula performances run through the day. The 2027 date has not been announced.",
    sections: [
      {
        heading: "How the racing works",
        body: [
          "Each team of four races alongside experienced outrigger paddlers from the club, which is why the city pitches the event at all levels, first-timers included. Alongside the race awards there is an Aloha Spirit Award for the team that shows the most teamwork, sportsmanship and enthusiasm; in 2026 it came with a $100 gift card for the Jack O'Neill Restaurant & Lounge donated by the Dream Inn.",
          "Teams are encouraged to dress up in themed costumes and decorate their canoes.",
        ],
      },
      {
        heading: "Entering a team in 2026",
        body: [
          "Team entry was $120 at the early-bird rate until 16 August and $150 after that until registration closed on 4 September. The fee covered four event T-shirts and offers from businesses on the wharf. Registration ran through the city's Parks & Recreation booking system (activity #419602) or by phone on 831-420-5727.",
        ],
      },
      {
        heading: "For spectators",
        body: [
          "Watching is free, and the city encourages people to come in Hawaiian dress. In 2026 Kūhai Hālau O Mehanakealohakalaua'eikapoli Pā ʻŌlapa Kahiko danced hula from 11:30am to noon, and Te Hau Nui School of Hula and Tahitian Dance performed from 1:30pm to 2pm.",
        ],
      },
    ],
    faq: [
      {
        q: "Do I need outrigger experience to race?",
        a: "No. Teams of four paddle with experienced outrigger paddlers, and the city says the races are open to all levels, including first-timers.",
      },
      {
        q: "How much did it cost to enter a team in 2026?",
        a: "$120 per team before 16 August, then $150 until 4 September, including four T-shirts.",
      },
      {
        q: "Is it free to watch?",
        a: "Yes. Spectator admission is free.",
      },
      {
        q: "When are the 2027 races?",
        a: "The city has not announced a 2027 date yet.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "City of Santa Cruz Parks & Recreation",
      url: "https://www.santacruzca.gov/",
    },
    recurrence: "An annual day of outrigger canoe racing at the Santa Cruz Wharf; 2026 was the 34th.",
    updated: "2026-11-26",
    hideSources: true,
  },
  {
    slug: "bonny-doon-art-wine-and-beer-festival",
    name: "Bonny Doon Art, Wine and Beer Festival",
    county: "Santa Cruz",
    cityText: "Bonny Doon (Santa Cruz)",
    city: "Bonny Doon",
    venue: "Crest Ranch",
    streetAddress: "12200 Empire Grade",
    postalCode: "95060",
    months: ["september"],
    dateText: "September 19, 2026",
    start: "2026-09-19",
    times: [{ day: "Saturday 19 September", hours: "2:00pm – 7:00pm" }],
    timesConfidence: "official",
    startTime: "14:00",
    endTime: "19:00",
    category: "Art / Wine / Beer Festival",
    officialWebsite: "https://www.bonnydoonartandwinefestival.com/",
    admission: { kind: "ticketed", from: 35, currency: "USD" },
    updated: "2026-08-22",
    hideSources: true,
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/bonny-doon-art-wine-and-beer-festival/",
    ],
    description:
      "A one-day art, wine and beer festival in Bonny Doon, in the hills above Santa Cruz.",
    metaDescription:
      "Saturday 19 September 2026, 2–7pm at Crest Ranch. Tickets $35–$150 and cheaper online than at the door, 21-and-over. What each tier includes.",
    intro:
      "The Bonny Doon Art, Wine and Beer Festival runs from 2pm to 7pm on Saturday 19 September 2026 at Crest Ranch, 12200 Empire Grade, in the hills above Santa Cruz. It is a ticketed, 21-and-over fundraiser for the arts and academics programmes at Bonny Doon School, with unlimited wine, beer and cider tastings on the two higher tiers, live music in two sets, a makers marketplace, food vendors and a silent auction. Tickets are $35, $65 or $150 depending on what you want to drink, and the organiser says every price goes up at the door — so this is an event to buy for in advance.",
    sections: [
      {
        heading: "What the three tickets actually get you",
        body: [
          "The organiser sells three tiers, and the difference between them is almost entirely about alcohol rather than access. General Admission is $65 and covers entry, festival glassware, unlimited wine, beer and cider tastings, live music, the marketplace, the makers space and the food vendors, where food is bought separately.",
          "VIP is $150. On top of everything in General Admission it adds a reserved seating area, wine pour service, a swag bag and hors d'oeuvres prepared by local chef Jessica Yarr.",
          "The Non-Alcoholic ticket is $35 and is the cheapest way through the gate. It covers entry, live music, the marketplace and the food vendors, and the organiser is explicit that it is strictly non-alcoholic: guests holding one have no access to alcoholic drinks for the duration of the event. That makes it a real option for a designated driver on a road where you would not want to guess, rather than a token cheap tier.",
          "All three prices are the online prices. The organiser states plainly that prices go up at the door and asks people to buy ahead, so the figures here are a floor rather than a guarantee of what you would pay on the day.",
        ],
      },
      {
        heading: "The running order",
        body: [
          "The organiser publishes a schedule for the day, which is unusual enough among the events on this site to be worth reproducing in full. Gates open at 2:00pm. The first music set runs 3:15pm to 5:00pm and the second 5:30pm to 7:00pm. The silent auction closes at 6:00pm. Alcohol service ends at 6:30pm, half an hour before the festival itself ends at 7:00pm.",
          "Two of those times are the ones worth planning around. If you are coming for the auction you need to be settled well before 6:00pm, because a silent auction closing is a hard stop rather than a wind-down. And if the tastings are why you bought a ticket, 6:30pm is when they stop — arriving at six means half an hour of drinking and an hour of festival.",
        ],
      },
      {
        heading: "Getting there, and the 21-and-over rule",
        body: [
          "Crest Ranch is at 12200 Empire Grade, up in the hills north-west of Santa Cruz rather than in the city. Empire Grade is a narrow, winding two-lane road and the venue is a working ranch, so allow more time than a map estimate suggests and expect no street lighting on the way back down after 7pm.",
          "The organiser says parking is available on site and encourages carpooling. That combination — unlimited tastings, a rural road, and an event that ends after dark in September — is the reason the $35 non-alcoholic ticket exists, and it is a sensible way to bring a group without anyone driving Empire Grade after a tasting session.",
          "Admission is 21 and over. The organiser states this without qualification, so this is not an event to bring children to, even to the non-alcoholic tier.",
        ],
      },
      {
        heading: "Where the money goes",
        body: [
          "This is a school fundraiser rather than a commercial festival. It is hosted by the Bonny Doon Community School Foundation, a registered 501(c)(3) non-profit, and the organiser states that ticket purchases and the silent auction support Bonny Doon School's arts and academics programmes.",
          "That shows up in how the event is put together. Alongside the tastings there is a bike sweepstakes and a silent auction, and the sponsor tiers are named for local trees — Oak, Madrone and Manzanita. Applications for food vendors, wineries, breweries, non-alcoholic sponsors and performing musicians were still open when this page was written.",
        ],
      },
      {
        heading: "One thing we could not confirm",
        body: [
          "The organiser publishes a Participating Wineries, Breweries and Cideries page, but as of 22 August 2026 it carries no list — the page exists and is empty. So we cannot tell you who is pouring. If that is what decides whether the ticket is worth $65 to you, check that page closer to the date rather than assuming the line-up matches a previous year.",
          "Worth knowing about the name, too: the organiser now calls this the Bonny Doon Art, Wine and Brew Festival. This page keeps the older \"and Beer\" wording because that is how the event is recorded across the Santa Cruz County listings most people arrive from, but the festival, the venue and the beneficiary are the same event.",
        ],
      },
    ],
    faq: [
      {
        q: "What time does the Bonny Doon Art, Wine and Beer Festival start?",
        a: "Gates open at 2:00pm on Saturday 19 September 2026 and the festival ends at 7:00pm. Alcohol service stops at 6:30pm and the silent auction closes at 6:00pm.",
      },
      {
        q: "How much are tickets?",
        a: "$65 general admission, $150 VIP, and $35 for a non-alcoholic ticket. Those are the online prices; the organiser says prices go up at the door.",
      },
      {
        q: "Is it free to get in?",
        a: "No. Every tier is ticketed and the cheapest way through the gate is the $35 non-alcoholic ticket, which includes no alcoholic drinks at all.",
      },
      {
        q: "Can I bring children?",
        a: "No. The organiser states the event is 21 and over, and that applies to the non-alcoholic ticket as well.",
      },
      {
        q: "Where is it held, and is there parking?",
        a: "Crest Ranch, 12200 Empire Grade, Santa Cruz, up in the hills north-west of the city. The organiser says parking is available on site and encourages carpooling.",
      },
      {
        q: "Who does the festival raise money for?",
        a: "Bonny Doon School's arts and academics programmes. The festival is hosted by the Bonny Doon Community School Foundation, a 501(c)(3) non-profit.",
      },
    ],
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
    metaDescription: "Capitola Beach Festival: a free weekend of sand sculpture, a lighted boat parade on Soquel Creek, rowboat races and more. What the 2026 schedule held.",
    intro: "The Capitola Beach Festival is a free, family weekend of contests on Capitola Beach, the Esplanade and Soquel Creek. The 2026 festival, themed \"Toy Takeover\", ran on Saturday 26 and Sunday 27 September, with a sand sculpture contest, a lighted nautical parade on the creek followed by the festival's first drone show, then a fishing derby, paddleboard races, horseshoes, chalk art and rowboat races on the Sunday. Almost everything is free to enter or watch. Dates for 2027 have not been announced.",
    sections: [
      {
        heading: "Saturday",
        body: [
          "The day opened with the Little Wharf 3-miler, a paid fun run from the East Cliff Shopping Center into Capitola run by the Wharf to Wharf race committee. The sand sculpture contest ran from 10am to 2pm on the beach with awards at 2:30pm, the cornhole tournament started at 11am on the Esplanade, and children's art and a village scavenger hunt ran from midday in Esplanade Park, with music by The Beach Cowboys there from 4pm to 6pm.",
          "At dusk, around 7pm, lighted barges paraded down Soquel Creek from the trestle to the lagoon. There is no access to the trestle during the parade. In 2026 a drone show over the beach and creek followed straight after.",
        ],
      },
      {
        heading: "Sunday",
        body: [
          "The fishing derby ran from 7am to 11am from the end of Capitola Wharf, open to all ages with your own rod. Paddleboard racing and a swim around the wharf took up the morning from 9am, ukuleles played in Esplanade Park from 10am, the doubles horseshoes tournament started on the sand at 10am, and chalk art on the seawall ran from 11am to 2pm.",
          "The weekend finished with the rowboat races on Soquel Creek from 1pm: timed two-person heats between the bridge and the trestle in age groups from under-12 to over-31. Boats and oars are supplied, and sign-up is at the Stockton Bridge path from noon.",
        ],
      },
      {
        heading: "Entering the contests",
        body: [
          "Only two events charge: the Little Wharf fun run and the paddleboard races, where in 2026 the 2-mile paddle was $20 for juniors and $45 for adults, and the wharf swim was free. Building a parade barge needs pre-registration and a refundable $100 fee, and each float can nominate a charity to receive $1,000, $750 or $500 if it places.",
          "Some events have age rules: cornhole competitors must be 16 or over, and the horseshoes tournament is closed to children under 10. Under-18s in the parade, rowboat races and horseshoes need a parent's signature on the waiver.",
        ],
      },
    ],
    faq: [
      {
        q: "Is the Capitola Beach Festival free?",
        a: "Yes, apart from the Little Wharf fun run and the paddleboard races, which charge entry fees. Everything else is free to enter and watch.",
      },
      {
        q: "What time is the lighted boat parade?",
        a: "Around 7pm on the Saturday, at dusk, on Soquel Creek between the trestle and the lagoon.",
      },
      {
        q: "When is the 2027 festival?",
        a: "The organiser has not announced 2027 dates yet.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Capitola Beach Festival",
      url: "https://capitolabeachfestival.com/",
    },
    updated: "2026-11-26",
    hideSources: true,
  },
  {
    slug: "open-studios-art-tour",
    name: "Open Studios Art Tour (41st Annual)",
    county: "Santa Cruz",
    cityText:
      "Countywide (Santa Cruz, Watsonville, Felton, Scotts Valley, Bonny Doon, Aptos)",
    months: ["october"],
    dateText: "October 3-18, 2026",
    category: "Art Tour",
    officialWebsite: "https://santacruzopenstudios.com",
    referenceUrls: [
      "https://scal.org/open-studios-2026",
      "https://www.santacruz.org/blog/your-guide-to-open-studios/",
      "https://pajaronian.com/open-studios-art-tour-begin-saturday/",
    ],
    description:
      "The 41st annual countywide artist studio tour, spanning Santa Cruz, Watsonville, Felton, Scotts Valley, Bonny Doon and Aptos. The 2026 dates have not been announced.",
    metaDescription: "Santa Cruz County's free, self-guided October studio tour: how the three weekends split the county, the 11am–5pm hours, and where to get the guide.",
    intro: "Open Studios is a free, self-guided tour of artists' studios, homes and workspaces across Santa Cruz County, presented by Arts Council Santa Cruz County over the first three weekends of October. The 2026 tour was its 41st year and ran 3–4, 10–11 and 17–18 October, 11am to 5pm each day, with more than 340 artists taking part. Visitors plan a route from the printed Artist Guide, the digital guide or the Open Studios app, follow the green signs to each door, and can buy work directly from the artist. 2027 dates have not been announced.",
    sections: [
      {
        heading: "How the three weekends divide the county",
        body: [
          "The tour is split by geography rather than run all at once. The first weekend covers South County, which the Arts Council defines as everything south of the Yacht Harbor, from Live Oak down to Watsonville. The second covers North County: Santa Cruz, Scotts Valley, the San Lorenzo Valley and the north coast.",
          "The third weekend is the All County weekend, when a selection of artists from both halves open again. They are marked with an All County symbol in the listings, so if you can only go on one weekend, that is the one where both ends of the county are on the map, but not every artist is.",
        ],
      },
      {
        heading: "Planning a route",
        body: [
          "The printed Artist Guide is handed out at Good Times locations, at the preview exhibit galleries and at public libraries around the county while copies last. The same listings are in an online artist directory and in the Open Studios Santa Cruz app for iOS and Android, which the Arts Council says goes live in September.",
          "The directory flags which studios are accessible, which artists are giving demonstrations, which speak Spanish and who is new to the tour. That is worth checking before you set off, because a studio is often someone's home or garden and access varies from door to door.",
        ],
      },
      {
        heading: "Preview exhibits before the tour",
        body: [
          "Three galleries hang a sample of tour artists' work in the weeks around the tour, which is a way to choose whose studio to visit. In 2026 Pajaro Valley Arts in Watsonville showed South County artists, the Santa Cruz Art League on Broadway showed North Coast and Santa Cruz Mountains artists, and M.K. Contemporary Art Gallery on Front Street showed artists from across the county.",
        ],
      },
    ],
    faq: [
      {
        q: "Does Open Studios cost anything?",
        a: "No. The Arts Council describes it as a free, self-guided tour. You pay only for any art you choose to buy from the artists.",
      },
      {
        q: "When is Open Studios held?",
        a: "Over the first three weekends of October. In 2026 that was 3–4 October (South County), 10–11 October (North County) and 17–18 October (All County), 11am to 5pm each day. 2027 dates have not been announced.",
      },
      {
        q: "Where do I get the Artist Guide?",
        a: "Printed copies are available at Good Times locations, the preview exhibit galleries and county public libraries while supplies last. There is also an online directory and an app called Open Studios Santa Cruz.",
      },
      {
        q: "How many artists take part?",
        a: "The Arts Council says more than 340 artists took part in 2026.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Arts Council Santa Cruz County",
      url: "https://artscouncilsc.org/",
    },
    times: [
      {
        day: "Saturday 3 – Sunday 4 October (South County)",
        hours: "11:00am – 5:00pm",
      },
      {
        day: "Saturday 10 – Sunday 11 October (North County)",
        hours: "11:00am – 5:00pm",
      },
      {
        day: "Saturday 17 – Sunday 18 October (All County)",
        hours: "11:00am – 5:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "11:00",
    endTime: "17:00",
    recurrence: "Held over the first three weekends of October each year, according to Arts Council Santa Cruz County.",
    updated: "2026-11-26",
    hideSources: true,
    start: "2026-10-03",
    end: "2026-10-18",
  },
  {
    slug: "downtown-santa-cruz-harvest-festival",
    name: "Downtown Santa Cruz Harvest Festival",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Downtown)",
    city: "Santa Cruz",
    venue: "Lot 16 and Church Street, behind the Downtown Library",
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
    officialWebsite: "https://downtownsantacruz.com/do/harvest-festival-1",
    metaDescription: "Downtown Santa Cruz's free autumn street fair behind the library: farm animals, a mechanical bull, wreath-making, local food and live music.",
    intro: "The Downtown Santa Cruz Harvest Festival is a free autumn afternoon fair on Lot 16 and Church Street, behind the Downtown Library. The 2026 edition ran from noon to 4pm on Saturday 3 October, produced by the Downtown Association of Santa Cruz with the Santa Cruz Community Farmers' Markets. It mixes a farmers and makers market with fairground-style games, a farm animal meet-and-greet, food stalls, local beer and live music. The organiser describes it as returning to downtown, but has not announced a 2027 date.",
    sections: [
      {
        heading: "What was on in 2026",
        body: [
          "The games side leaned towards families: a mechanical bull, glitter tattoos, face painting, cornhole, foosball and a wreath-making station, plus farm animals to meet. The market side, in the city's description, was a farmers and makers market with fresh produce and handmade goods.",
          "Food came from local vendors including La Casa de Churros, Hummus Heaven, Empanadas La Linda and Melrose Cafe, with beer from two local breweries. Rhythm Wranglers and Cayuga Jazz played.",
        ],
      },
      {
        heading: "Where it is held",
        body: [
          "The festival takes over Lot 16 and the adjoining stretch of Church Street, directly behind the Downtown Library in central Santa Cruz. The City of Santa Cruz lists it as a free community event.",
        ],
      },
    ],
    faq: [
      {
        q: "Is the Harvest Festival free?",
        a: "Yes. The City of Santa Cruz lists it as free. Food, drink and market goods are paid for separately.",
      },
      {
        q: "When was the 2026 Harvest Festival?",
        a: "Saturday 3 October 2026, noon to 4pm. A 2027 date has not been announced.",
      },
      {
        q: "Where exactly is it?",
        a: "Lot 16 and Church Street, behind the Downtown Library in downtown Santa Cruz.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Downtown Association of Santa Cruz",
      url: "https://downtownsantacruz.com/",
    },
    times: [
      {
        day: "Saturday 3 October",
        hours: "12:00pm – 4:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "12:00",
    endTime: "16:00",
    updated: "2026-11-26",
    hideSources: true,
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
    streetAddress: "526 Broadway",
    postalCode: "95060",
    metaDescription: "The Santa Cruz Art League's Open Studios preview show: North Coast and mountain artists, Thursday–Sunday 11am–5pm through the October tour.",
    intro: "The Santa Cruz Art League hangs a preview exhibit for the Open Studios Art Tour each October at its gallery at 526 Broadway, Santa Cruz. The 2026 show, titled \"Far Out\", ran from Friday 2 October to Sunday 18 October and gathered work by tour artists from the North Coast and the Santa Cruz Mountains, all of it for sale. It was open 11am to 5pm, Thursday to Sunday, and opened with a First Friday reception from 5pm to 8pm on 2 October. The idea is to see a sample of artists' work in one room before deciding whose studio to drive to.",
    sections: [
      {
        heading: "What the show covers",
        body: [
          "Each of the Open Studios preview galleries takes a slice of the county. The Art League's share in 2026 was the North Coast and the Santa Cruz Mountains, which are the studios that take longest to reach on the tour itself, so a look here first can save a wasted drive up a mountain road.",
          "Every piece in the exhibit is for sale. The other two preview shows in 2026 were at Pajaro Valley Arts in Watsonville, for South County artists, and M.K. Contemporary Art Gallery on Front Street in Santa Cruz, for artists from across the county.",
        ],
      },
      {
        heading: "Opening hours and the reception",
        body: [
          "The gallery opened the exhibit with a First Friday reception and party on 2 October from 5pm to 8pm. After that it kept its usual exhibition hours of 11am to 5pm, Thursday to Sunday, until the show closed at 5pm on Sunday 18 October, the final day of the tour.",
        ],
      },
    ],
    faq: [
      {
        q: "Where is the Santa Cruz Art League?",
        a: "526 Broadway, Santa Cruz, CA 95060.",
      },
      {
        q: "When was the 2026 preview exhibit open?",
        a: "Friday 2 October to Sunday 18 October 2026, Thursday to Sunday from 11am to 5pm, with an opening reception on 2 October from 5pm to 8pm.",
      },
      {
        q: "Is the art for sale?",
        a: "Yes. The Art League says all work in the exhibit is for sale.",
      },
      {
        q: "Does it cost anything to get in?",
        a: "The Art League does not state an entry price for this exhibit. The Open Studios tour it previews is free.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Santa Cruz Art League",
      url: "https://scal.org/",
    },
    times: [
      {
        day: "Thursday – Sunday, 2–18 October",
        hours: "11:00am – 5:00pm",
      },
      {
        day: "Friday 2 October (opening reception)",
        hours: "5:00pm – 8:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "11:00",
    endTime: "17:00",
    recurrence: "Shown each October alongside the annual Open Studios Art Tour, which runs over the first three weekends of the month.",
    updated: "2026-11-26",
    hideSources: true,
  },
  {
    slug: "santa-cruz-film-festival-2026",
    name: "Santa Cruz Film Festival 2026",
    county: "Santa Cruz",
    cityText: "Santa Cruz (various theaters)",
    city: "Santa Cruz",
    venue: "Del Mar, Colligan Theater, Santa Cruz Cinema, The Rio and The 418 Project",
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
    officialWebsite: "https://www.santacruzfilmfestivals.org/",
    metaDescription: "Santa Cruz's annual five-day independent film festival: the 2026 dates, the five screening venues, and what else the festival runs.",
    intro: "The Santa Cruz Film Festival is an annual five-day festival of independent film held in October across several Santa Cruz screens. The 26th edition ran from Wednesday 14 to Sunday 18 October 2026 at the Del Mar, Colligan Theater, Santa Cruz Cinema, the Rio and the 418 Project, with a programme running from short and experimental work to documentaries and narrative features. The organiser says it has screened more than 2,000 independent films since 2000. 2027 dates have not been announced.",
    sections: [
      {
        heading: "What the festival shows",
        body: [
          "The programme is independent cinema in every length and form: shorts and experimental pieces alongside documentaries and narrative features. Screenings are spread across five Santa Cruz venues rather than one festival hub, so it pays to check which venue each session is in before you set out.",
          "Tickets for 2026 were sold through the festival's online ticketing; the organiser's site does not publish prices on the main page.",
        ],
      },
      {
        heading: "Beyond the screenings",
        body: [
          "The festival runs events around the films as well as during them. In 2026 these included a screenwriters' workshop, festival parties and an artist and official poster reveal on 28 September at M.K. Contemporary Art Gallery on Front Street. Its Filmmaker Mixers continue through the year, with the next one due in January 2027.",
        ],
      },
    ],
    faq: [
      {
        q: "When was the 2026 Santa Cruz Film Festival?",
        a: "Wednesday 14 to Sunday 18 October 2026. It was the festival's 26th year. 2027 dates have not been announced.",
      },
      {
        q: "Where are films shown?",
        a: "In 2026 the organiser listed the Del Mar, Colligan Theater, Santa Cruz Cinema, the Rio and the 418 Project.",
      },
      {
        q: "How long has the festival been running?",
        a: "Since 2000, according to the organiser, which says it has screened more than 2,000 independent films in that time.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Santa Cruz Film Festival",
      url: "https://www.santacruzfilmfestivals.org/",
    },
    recurrence: "An annual five-day festival in October, according to the organiser.",
    updated: "2026-11-26",
    hideSources: true,
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
    streetAddress: "301 Center Street",
    postalCode: "95060",
    officialWebsite: "https://www.santacruzca.gov/Government/City-Departments/Parks-Recreation/Community-Spaces/London-Nelson-Community-Center/Events/2026-Mask-Making-Festival",
    metaDescription: "Santa Cruz's free annual Halloween mask-making afternoon at London Nelson Community Center, with a youth theatre show and a Thriller dance.",
    intro: "The Halloween Mask Making Festival is a free annual afternoon for families at the London Nelson Community Center, 301 Center Street, Santa Cruz, run by City of Santa Cruz Parks & Recreation. The 2026 edition was on Saturday 17 October from noon to 4:30pm. Children make their own masks, and the afternoon is broken up by a Thriller the World Santa Cruz dance performance and repeated showings of a Halloween play by the city's Youth Theatre. 2027 details have not been announced.",
    sections: [
      {
        heading: "What happens",
        body: [
          "Mask making is the centre of it: drop in during the afternoon and make one. Around that, the city programmed a performance by Thriller the World Santa Cruz and a Halloween production by the Santa Cruz Parks and Recreation Youth Theatre.",
          "The 2026 play was The King in Yellow, adapted from a play based on Robert W. Chambers' book. The city listed showings at 12:30pm, 2pm and 3:30pm, plus a 7pm performance after the festival itself closed.",
        ],
      },
      {
        heading: "Where and how much",
        body: [
          "The festival is held indoors at the London Nelson Community Center at 301 Center Street in downtown Santa Cruz. The city lists it as free.",
        ],
      },
    ],
    faq: [
      {
        q: "Is the Mask Making Festival free?",
        a: "Yes. The City of Santa Cruz lists it as a free event.",
      },
      {
        q: "When was it held in 2026?",
        a: "Saturday 17 October 2026, noon to 4:30pm. 2027 details have not been announced.",
      },
      {
        q: "Where is it?",
        a: "London Nelson Community Center, 301 Center Street, Santa Cruz, CA 95060.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "City of Santa Cruz Parks & Recreation",
      url: "https://www.santacruzca.gov/Government/City-Departments/Parks-Recreation",
    },
    times: [
      {
        day: "Saturday 17 October",
        hours: "12:00pm – 4:30pm",
      },
    ],
    timesConfidence: "official",
    startTime: "12:00",
    endTime: "16:30",
    recurrence: "An annual Halloween event at the London Nelson Community Center, according to City of Santa Cruz Parks & Recreation.",
    updated: "2026-11-26",
    hideSources: true,
  },
  {
    slug: "santa-cruz-comedy-festival",
    name: "Santa Cruz Comedy Festival",
    county: "Santa Cruz",
    cityText: "Santa Cruz",
    city: "Santa Cruz",
    months: ["october"],
    dateText: "October 12-17, 2026",
    start: "2026-10-12",
    category: "Comedy Festival",
    referenceUrls: ["https://allevents.in/santa-cruz/festivals"],
    description: "A one-day comedy festival at 939 Pacific Avenue in Santa Cruz.",
    officialWebsite: "https://santacruzcomedyfestival.com/",
    metaDescription: "The Santa Cruz Comedy Festival's 13th year: free weeknight shows, then a Saturday takeover of downtown venues from Kuumbwa to the Blue Lagoon.",
    intro: "The Santa Cruz Comedy Festival is a week of stand-up spread across bars, breweries and theatres in and around downtown Santa Cruz. Its 13th edition ran from Monday 12 to Saturday 17 October 2026: free shows on the weeknights, then a Saturday the organiser called the Downtown Takeover, with ticketed shows at the Kuumbwa, Woodhouse Blending and Brewing, the Alley Oop and the Blue Lagoon, free sets around town and a late-night party at 11th Hour Coffee. 2027 dates have not been announced.",
    sections: [
      {
        heading: "The free weeknight shows",
        body: [
          "The first five days were free shows, one or two a night. In 2026 they were at the Secret Garden of Abbott Square (7pm) and Rosie McCann's (9pm) on Monday 12 October, the Blue Lagoon on Tuesday (7:45pm), Santa Cruz Mountain Brewery on Wednesday (8pm) and Gilman Brewing on Thursday (7pm).",
        ],
      },
      {
        heading: "Saturday's Downtown Takeover",
        body: [
          "Most of the festival happened on Saturday 17 October. The headline ticketed show was the All Star Headliner Comedy Show at the Kuumbwa, with 13 headliners, which sold out. A three-hour All Star Comedy Show with 21 comics ran at Woodhouse Blending and Brewing from 6:30pm to 9pm, and there were further ticketed shows at the Alley Oop and the Blue Lagoon, plus a somatic movement workshop with Toni Nagy.",
          "Free sets ran the same evening at Streetlight Records (5:30pm), Get Faded Barbershop and Abbott Square (both 7pm) and Pleasure Pizza (7:30pm). The night ended with a 9pm festival party at 11th Hour Coffee. A limited festival pass, capped at 20, was also sold.",
        ],
      },
    ],
    faq: [
      {
        q: "When was the 2026 Santa Cruz Comedy Festival?",
        a: "Monday 12 to Saturday 17 October 2026, its 13th year. Most shows were on Saturday 17 October. 2027 dates have not been announced.",
      },
      {
        q: "Are there free shows?",
        a: "Yes. In 2026 there were free shows every weeknight from Monday to Thursday and several free sets on the Saturday evening.",
      },
      {
        q: "Where are the shows?",
        a: "At venues around downtown Santa Cruz, including the Kuumbwa, Woodhouse Blending and Brewing, the Alley Oop, the Blue Lagoon, Abbott Square and 11th Hour Coffee.",
      },
    ],
    updated: "2026-11-26",
    hideSources: true,
    end: "2026-10-17",
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
    dateText: "October 24, 2026",
    start: "2026-10-24",
    category: "Halloween / Family",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/holiday/",
      "https://www.santacruz.org/upcoming-event/santa-cruz-harbor-trick-or-treat/",
    ],
    description:
      "Halloween trick-or-treating at Santa Cruz Harbor, billed as Haunted Harbor.",
    streetAddress: "135 5th Avenue",
    postalCode: "95062",
    officialWebsite: "https://www.santacruzharbor.org/haunted-harbor",
    metaDescription: "Haunted Harbor, the Santa Cruz Port District's Halloween trick-or-treat around harbour businesses, reached by a free inner-harbour water taxi.",
    intro: "Haunted Harbor is the Santa Cruz Port District's Halloween trick-or-treat, with children in costume going round participating businesses at Santa Cruz Harbor. In 2026 it ran from 3pm to 6pm on Saturday 24 October, a week before Halloween itself. The Port District dresses up its free inner-harbour water taxi for the day, and visitors can park in the North Harbor and ride it between stops. The Port District says the event returns year to year but has not announced a 2027 date.",
    sections: [
      {
        heading: "How it works",
        body: [
          "Trick-or-treating happens at participating harbour businesses rather than at a single venue, so the afternoon is spent moving around the harbour. The Port District encourages costumes and promises candy and Halloween activities along the way.",
        ],
      },
      {
        heading: "Parking and the water taxi",
        body: [
          "The harbour's free inner-harbour water taxi gets a Halloween makeover for the day and runs with pickup and drop-off points around the harbour; in 2026 the Port District gave its hours as 11am to 6pm. Visitor parking for water taxi passengers is in the North Harbor near X Dock.",
          "The Port District's office address is 135 5th Avenue, Santa Cruz, CA 95062.",
        ],
      },
    ],
    faq: [
      {
        q: "When was Haunted Harbor in 2026?",
        a: "Saturday 24 October 2026, 3pm to 6pm. It was held the Saturday before Halloween, not on 31 October. A 2027 date has not been announced.",
      },
      {
        q: "Where do I park?",
        a: "The Port District points water taxi passengers to visitor parking in the North Harbor near X Dock.",
      },
      {
        q: "Is the water taxi free?",
        a: "Yes. The Port District describes it as a free inner-harbour water taxi.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Santa Cruz Port District",
      url: "https://www.santacruzharbor.org/",
    },
    times: [
      {
        day: "Saturday 24 October",
        hours: "3:00pm – 6:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "15:00",
    endTime: "18:00",
    updated: "2026-11-26",
    hideSources: true,
  },
  {
    slug: "vampire-ball-at-chaminade-resort-spa",
    name: "Vampire Ball at Chaminade Resort & Spa",
    county: "Santa Cruz",
    cityText: "Santa Cruz (Chaminade Resort and Spa)",
    city: "Santa Cruz",
    venue: "Chaminade Resort & Spa",
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
    streetAddress: "One Chaminade Lane",
    postalCode: "95065",
    officialWebsite: "https://www.chaminade.com/things-to-do-santa-cruz/vampire-ball",
    metaDescription: "Chaminade's 21+ Vampire Ball: Halloween night 2026, 8:30pm–12:30am, $75 plus tax with a cocktail and bites, costume contest and fire dancers.",
    intro: "The Vampire Ball is a 21-and-over Halloween party at Chaminade Resort & Spa, One Chaminade Lane, in the hills above Santa Cruz. The resort describes it as annual, and called the 2025 party its third. In 2026 it fell on Halloween itself, Saturday 31 October, from 8:30pm to 12:30am. Tickets were $75 plus tax, covering a signature cocktail and light bites, with a vampire DJ, fortune tellers, fire dancers and a costume contest. 2027 details have not been announced.",
    sections: [
      {
        heading: "What the ticket covers",
        body: [
          "A ticket was $75 per person plus tax in 2026 and included one signature cocktail and light bites. Beyond that there is a cash bar and a heavy bites station.",
          "The resort also sold an overnight package that bundles a Vampire Ball ticket with a room, with extra tickets addable at checkout.",
        ],
      },
      {
        heading: "The party itself",
        body: [
          "Entertainment is a vampire DJ and dancing, fortune tellers, fire dancers and a photo booth with souvenir photos. The costume contest has two categories: most creative solo costume and best couple or pair.",
          "Formal attire or costumes are welcome but not required. Entry is strictly 21 and over.",
        ],
      },
      {
        heading: "Dates move from year to year",
        body: [
          "This is not always on Halloween night. The resort held the 2025 ball on Friday 24 October from 8pm to 11:30pm; the 2026 party moved to Saturday 31 October and ran later, to 12:30am.",
        ],
      },
    ],
    faq: [
      {
        q: "How much were Vampire Ball tickets?",
        a: "$75 per person plus tax in 2026, including one signature cocktail and light bites.",
      },
      {
        q: "Is there an age limit?",
        a: "Yes. Chaminade states it is a 21-and-over event.",
      },
      {
        q: "Do I have to wear a costume?",
        a: "No. The resort says formal attire or costumes are welcome but not required, though there is a costume contest.",
      },
      {
        q: "Where is Chaminade?",
        a: "One Chaminade Lane, Santa Cruz, CA 95065.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Chaminade Resort & Spa",
      url: "https://www.chaminade.com/",
    },
    times: [
      {
        day: "Saturday 31 October",
        hours: "8:30pm – 12:30am",
      },
    ],
    timesConfidence: "official",
    startTime: "20:30",
    recurrence: "An annual Halloween-season party at Chaminade; the resort billed its 2025 edition as the third annual Vampire Ball.",
    updated: "2026-11-26",
    hideSources: true,
  },
  {
    slug: "watsonville-dia-de-muertos-festival",
    name: "Watsonville Dia de Muertos Festival",
    county: "Santa Cruz",
    cityText: "Watsonville (Watsonville City Plaza)",
    city: "Watsonville",
    venue: "City Plaza Park, Main Street and Peck Street",
    months: ["november"],
    dateText: "November 1, 2026",
    start: "2026-11-01",
    category: "Cultural Festival",
    officialWebsite: "https://www.watsonville.gov/Calendar.aspx?EID=5440",
    referenceUrls: [
      "https://www.santacruz.org/upcoming-events/category/festival/",
      "https://www.santacruz.org/upcoming-event/watsonville-plaza-dia-de-los-muertos/",
      "https://festivalguidesandreviews.com/california-festivals/",
    ],
    description:
      "A one-day Día de Muertos cultural festival at Watsonville City Plaza.",
    metaDescription: "Watsonville's annual Día de Muertos festival in City Plaza, run by the Watsonville Film Festival: ofrendas, performances, films, crafts and food.",
    intro: "The Watsonville Día de Muertos Festival is an annual evening celebration in City Plaza Park, at Main and Peck Streets in downtown Watsonville, put on by the Watsonville Film Festival with community partners. It honours ancestors and loved ones who have died, with ofrendas (altars), performances, hands-on activities, film screenings and food, and is aimed at families. The City of Watsonville listed the 2024 festival, its seventh, on Friday 1 November from 4pm to 9pm. Neither the organiser nor the city has published details of the 2026 edition or a 2027 date.",
    sections: [
      {
        heading: "What happens",
        body: [
          "The festival is built around the plaza's ofrendas, the altars families build to remember the dead. Around them run performances, hands-on activities, food and film screenings, the last fitting for an event organised by a film festival.",
          "The Watsonville Film Festival is a non-profit arts organisation based in Watsonville. Its own Día de Muertos page also hosts films, music and craft tutorials made for the celebration, including skeleton masks, paper flowers and candle decoration.",
        ],
      },
      {
        heading: "Where it is held",
        body: [
          "City Plaza Park sits at Main Street and Peck Street in the centre of downtown Watsonville. In the edition the city listed, the festival ran from late afternoon into the evening, 4pm to 9pm.",
        ],
      },
    ],
    faq: [
      {
        q: "Who organises the Watsonville Día de Muertos Festival?",
        a: "The Watsonville Film Festival, a non-profit arts organisation, with community partners.",
      },
      {
        q: "Where is it held?",
        a: "City Plaza Park, at Main Street and Peck Street in downtown Watsonville.",
      },
      {
        q: "When is the 2027 festival?",
        a: "Not announced. The organiser and the City of Watsonville have not published a date.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Watsonville Film Festival",
      url: "https://watsonvillefilmfest.org/",
    },
    recurrence: "An annual Día de Muertos festival in Watsonville's City Plaza, run by the Watsonville Film Festival; the City of Watsonville listed the 2024 edition as the seventh.",
    updated: "2026-11-26",
    hideSources: true,
  },
  {
    slug: "santa-cruz-sea-glass-and-ocean-art-festival",
    name: "Santa Cruz Sea Glass and Ocean Art Festival (18th Annual)",
    county: "Santa Cruz",
    cityText: "Santa Cruz (The Grove)",
    city: "Santa Cruz",
    venue: "The Grove event center, Santa Cruz Beach Boardwalk",
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
    streetAddress: "400 Beach Street",
    officialWebsite: "https://sites.google.com/view/santacruzseaglass-oceanartfest/home",
    metaDescription: "Santa Cruz's sea glass and ocean art market at the Boardwalk's Grove: $5 at the door, kids free, 60+ makers. Next edition 13–14 November 2027.",
    intro: "The Santa Cruz Sea Glass and Ocean Art Festival is a two-day market of sea glass jewellery and ocean-themed art held upstairs at the Grove event center on the Santa Cruz Beach Boardwalk, 400 Beach Street. The 18th edition ran on Saturday 7 and Sunday 8 November 2026, 10am to 5pm, with more than 60 makers, live music, collector talks and a favourite-find contest. Entry is $5 at the door and children get in free. The organiser has announced the 19th festival for 13–14 November 2027.",
    sections: [
      {
        heading: "Admission, and the ticket scam warning",
        body: [
          "Entry is $5 per person and children are free. Tickets are sold only at the door; there are no online sales, and the organiser warns that social media posts offering early tickets are fraudulent.",
          "Each $5 ticket doubles as an entry into a gift-basket draw of sea-themed pieces donated by the artists, with four baskets given away each day. Part of every entry fee goes to ocean conservation and whale entanglement work through the Monterey Bay Sanctuary; the organiser says it has given more than $12,000 since the festival began in 2009.",
        ],
      },
      {
        heading: "What was on in 2026",
        body: [
          "Alongside the stalls, the Grove Ballroom's main stage had live music both days, from Cement Ship on Saturday and Dos Bros on Sunday. Each day had a midday talk by a collector: Sage Harmon on iconic beach finds on Saturday, and artist and sea glass historian Jo Fry on Sunday.",
          "Sunday afternoon brought the Favorite Find Contest, where up to six local beachcombers showed a piece of ocean-worn glass or other found object on stage. New for 2026 was a silent auction of three large fused-glass panels donated by artist Dana Boyko, with bids starting at $100 and proceeds going to the Monterey Bay Sanctuary Fund.",
        ],
      },
      {
        heading: "Getting there and parking",
        body: [
          "Look for the Sea Glass Festival sign on the marquee at Entrance B of the Boardwalk. The festival is on the second floor, and there is a lift at the pedestrian entrance, so it is wheelchair accessible.",
          "In 2026 the organiser said Boardwalk parking across Beach Street was $15 over the festival weekend, with RVs allowed in the River Street lot at double the fee and no overnight parking. Dogs are not allowed on the Boardwalk, other than service animals.",
        ],
      },
    ],
    faq: [
      {
        q: "How much does it cost to get in?",
        a: "$5 per person at the door, and children are free. There are no online tickets; the organiser says online ticket offers on social media are fake.",
      },
      {
        q: "When is the next Sea Glass and Ocean Art Festival?",
        a: "13–14 November 2027, 10am to 5pm, at the Grove on the Santa Cruz Beach Boardwalk. It will be the 19th festival.",
      },
      {
        q: "Is it wheelchair accessible?",
        a: "Yes. The event is on the second floor of the Grove, and there is a lift at Entrance B.",
      },
      {
        q: "Can I bring my dog?",
        a: "No. Dogs are not allowed on the Boardwalk, except service animals.",
      },
    ],
    times: [
      {
        day: "Saturday 7 November",
        hours: "10:00am – 5:00pm",
      },
      {
        day: "Sunday 8 November",
        hours: "10:00am – 5:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "10:00",
    endTime: "17:00",
    recurrence: "A recurring festival the organiser dates back to 2009; it numbers each edition, and the 2027 festival will be the 19th.",
    nextEdition: {
      start: "2027-11-13",
      end: "2027-11-14",
      source: "https://sites.google.com/view/santacruzseaglass-oceanartfest/home",
    },
    updated: "2026-11-26",
    hideSources: true,
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
      "The Boardwalk's free holiday season, on select days from Thursday 26 November 2026 to Sunday 3 January 2027.",
    // v2.S, 2026-11-24 — from the Boardwalk's own press release:
    // https://news.beachboardwalk.com/winter-wonderland-celebrates-the-holiday-season-starting-thursday-november-26/
    // Daily hours are on beachboardwalk.com/winter-wonderland/, which blocks
    // automated reads, so none are given here.
    admission: "free",
    updated: "2026-11-24",
    intro:
      "Winter Wonderland is the Santa Cruz Beach Boardwalk's free-admission holiday season, on select days from Thursday 26 November 2026 to Sunday 3 January 2027. The Boardwalk lists a new tunnel of lights, holiday décor, free nightly light shows, photos with Santa, seasonal treats, fire pits and Boardwalk rides, which cost $2 each after 5:00pm. On Saturday 28 November there is a holiday drone show — the Boardwalk calls it Santa Cruz County's only one — with a tree lighting ceremony, the Santa Cruz High School Jazz Band and free holiday cookies.",
    sections: [
      {
        heading: "Which days it is open",
        body: [
          "The Boardwalk says operating days and hours vary through the season and publishes them, with ticket prices, on its Winter Wonderland page. Check the date you plan to go before setting out. Advance purchase is not required for most Winter Wonderland events and activities.",
        ],
      },
    ],
    guideLink: {
      href: "/holiday-lights/",
      label: "Holiday lights map 2026",
      blurb: "Every tree lighting, lighted boat parade and drive-through display around Monterey Bay on one map, with dates, prices and directions.",
    },
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
    streetAddress: "307 Church Street",
    postalCode: "95060",
    officialWebsite: "https://atasteofirelandshow.com/show/a-celtic-christmas/2026-christmas-tour/santa-cruz/",
    metaDescription: "Wednesday 2 December 2026, 7:30pm at the Santa Cruz Civic Auditorium. Irish dance, fiddle and carols; tickets $48.81–$119.89.",
    intro: "A Celtic Christmas, the holiday show from the touring Irish dance company A Taste of Ireland, plays one night in Santa Cruz: Wednesday 2 December 2026 at 7:30pm, at the Santa Cruz Civic Auditorium, 307 Church Street. It is a seated, ticketed stage show rather than a community event, mixing Irish step dance, live fiddle and guitar, singing and storytelling with Christmas carols. The company lists ticket prices from $48.81 to $119.89, sold through the venue's box office site, santacruztickets.com. Santa Cruz is one stop on the company's 2026 Christmas tour.",
    sections: [
      {
        heading: "What the show is",
        body: [
          "The production pairs a troupe of Irish dancers with a small live band. The company says its dancers include former world Irish dance champions and performers who have worked in Lord of the Dance and Riverdance, and it bills the show as coming from New York's Off-Broadway and London's West End.",
          "The running order moves between traditional tunes and ballads, folk mash-ups, an a cappella tap battle and familiar Christmas carols, tied together with storytelling and staged against a Celtic landscape. The published cast lists dancers, two vocalists, two fiddlers and two guitarists; the company notes that the instruments can change from one performance to the next.",
        ],
      },
      {
        heading: "Tickets and timing",
        body: [
          "The show starts at 7:30pm. The company has not published a door time or a running time for the Santa Cruz date, so plan to arrive before curtain rather than at it.",
          "Prices on the company's Santa Cruz page run from $48.81 to $119.89, and tickets are sold through santacruztickets.com rather than by the company directly. No age rules are published for this performance.",
        ],
      },
    ],
    faq: [
      {
        q: "When is A Celtic Christmas in Santa Cruz?",
        a: "Wednesday 2 December 2026 at 7:30pm, at the Santa Cruz Civic Auditorium, 307 Church Street.",
      },
      {
        q: "How much are tickets?",
        a: "The company lists prices from $48.81 to $119.89, sold through santacruztickets.com.",
      },
      {
        q: "Is it the same as the Taste of Ireland show that came to Santa Cruz before?",
        a: "No. A Celtic Christmas is the company's Christmas production, built around carols and holiday storytelling alongside the Irish dance and music.",
      },
    ],
    organizer: {
      type: "PerformingGroup",
      name: "A Taste of Ireland",
      url: "https://atasteofirelandshow.com/",
    },
    times: [
      {
        day: "Wednesday 2 December",
        hours: "7:30pm",
      },
    ],
    timesConfidence: "official",
    startTime: "19:30",
    updated: "2026-11-26",
    hideSources: true,
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
    venue: "Downtown Boulder Creek",
    postalCode: "95006",
    officialWebsite: "https://www.bcba.net/events-1/first-friday-boulder-creek-ugly-sweater-2026-12-04-17-00",
    metaDescription: "Friday 4 December 2026, 5–8pm in downtown Boulder Creek: the year's last First Friday market, themed around an ugly sweater contest.",
    intro: "The Downtown Boulder Creek Market and Ugly Sweater Contest is the December edition of First Friday Boulder Creek, held from 5pm to 8pm on Friday 4 December 2026 in the town's historic downtown. First Friday is a monthly evening market run by the Boulder Creek Business Association with a volunteer committee, where local shops stay open and specialty vendors set up along the downtown core. December's edition is the last of the 2026 season and carries an ugly sweater theme, so wearing your worst knitwear is the point.",
    sections: [
      {
        heading: "What happens",
        body: [
          "First Friday brings local shops and specialty vendors together in historic Boulder Creek for an evening of browsing; the organisers describe it as a way to support local people and businesses. The December date is billed as the ugly sweater edition.",
          "The organisers have not published contest rules, judging times or prizes for 2026, so treat the sweater contest as a theme to dress for and check with them if you are entering seriously.",
        ],
      },
      {
        heading: "Season and families",
        body: [
          "First Friday runs monthly from April to December, and this is the final one of 2026. The organisers say the Kid's Zone behind the Sheriff station runs only from April to October, so there is no Kid's Zone at the November or December events.",
          "Vendors apply through a monthly form on the First Friday Boulder Creek site, which has a separate December application.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the Boulder Creek ugly sweater First Friday?",
        a: "Friday 4 December 2026, from 5pm to 8pm in downtown Boulder Creek.",
      },
      {
        q: "Is there a kids' area?",
        a: "Not in December. The organisers say the Kid's Zone runs only at the April to October events.",
      },
      {
        q: "Who runs it?",
        a: "The Boulder Creek Business Association, with the First Friday Boulder Creek committee and volunteers.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Boulder Creek Business Association (First Friday Boulder Creek)",
      url: "https://www.bcba.net/",
    },
    times: [
      {
        day: "Friday 4 December",
        hours: "5:00pm – 8:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "17:00",
    endTime: "20:00",
    recurrence: "First Friday Boulder Creek runs on the first Friday of every month from April to December, 5pm to 8pm.",
    updated: "2026-11-26",
    hideSources: true,
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
    guideLink: {
      href: "/holiday-lights/",
      label: "Holiday lights map 2026",
      blurb: "Every tree lighting, lighted boat parade and drive-through display around Monterey Bay on one map, with dates, prices and directions.",
    },
    officialWebsite: "https://www.santacruzharbor.org/lighted-boat-parade",
    metaDescription: "Saturday 5 December 2026 from 5:30pm, rain or shine: the 39th Lighted Boat Parade at Santa Cruz Harbor. Viewing and parking notes.",
    intro: "The Santa Cruz Yacht Club's 39th annual Lighted Boat Parade sets off at 5:30pm on Saturday 5 December 2026 at Santa Cruz Harbor, and goes ahead rain or shine. Decorated power boats and sailboats, around 50 of them according to the harbour, cruise through the harbour after dark while people watch from the shore. The harbour describes it as a family event, with hot drinks and snacks on sale at spots around the south harbour. The Yacht Club sponsors and runs the parade; the Santa Cruz Port District hosts it.",
    sections: [
      {
        heading: "Watching from the shore",
        body: [
          "This is a landside event for most people. For the 2025 parade the City of Santa Cruz said spectators could watch from several points around the harbour but that dock access was limited to slip renters and their guests; it has not reposted that guidance for 2026, but there is no sign it has changed.",
          "The harbour says hot drinks and snacks are available at various locations in the south harbour, which is the side to head for if you want something warm while you wait. Charter boats are also available for anyone who wants to be on the water.",
        ],
      },
      {
        heading: "Parking and weather",
        body: [
          "The city warned last year that parking around the harbour is very limited and asked people to carpool or use other transport. Expect the same on a Saturday evening in December.",
          "The parade runs rain or shine, so dress for a damp, cold evening by the water rather than checking for a postponement.",
        ],
      },
    ],
    faq: [
      {
        q: "What time does the Santa Cruz lighted boat parade start?",
        a: "5:30pm on Saturday 5 December 2026. The organisers have not published an end time.",
      },
      {
        q: "Is it cancelled if it rains?",
        a: "No. The harbour lists it as rain or shine.",
      },
      {
        q: "Where is the best place to watch?",
        a: "From the shore around the harbour. Dock access has been limited to slip renters and their guests, and hot drinks and snacks are sold in the south harbour.",
      },
      {
        q: "Is there parking?",
        a: "Very little. The city has asked people to carpool or use other transport.",
      },
    ],
    organizer: {
      type: "Organization",
      name: "Santa Cruz Yacht Club",
      url: "https://scyc.org/",
    },
    times: [
      {
        day: "Saturday 5 December",
        hours: "from 5:30pm",
      },
    ],
    timesConfidence: "official",
    startTime: "17:30",
    recurrence: "An annual parade; 2026 is the Santa Cruz Yacht Club's 39th.",
    updated: "2026-11-26",
    hideSources: true,
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
    dateText: "December 5, 2026",
    category: "Holiday / Parade",
    officialWebsite: "https://downtownsantacruz.com/do/holiday-parade-2",
    referenceUrls: [
      "https://downtownsantacruz.com/events/downtown-holiday-parade",
      "https://downtownsantacruz.com/events/holidays",
    ],
    description:
      "Santa Cruz's holiday parade along Pacific Avenue downtown. The 2026 date has not been announced.",
    metaDescription: "Saturday 5 December 2026, 10am–noon on Pacific Avenue from Laurel to Water Street. Route, what to expect, and how to watch online.",
    intro: "The Downtown Santa Cruz Holiday Parade marches down Pacific Avenue from 10am to noon on Saturday 5 December 2026, rain or shine. It is the city's official start to the holiday season and a showcase for Santa Cruz County schools, youth groups and local nonprofits, which make up most of the entries. The 2026 route runs the length of downtown, from the corner of Laurel Street and Pacific Avenue to Pacific and Water Street. The Downtown Association says the parade draws about 1,200 participants and more than 3,000 spectators each year.",
    sections: [
      {
        heading: "Route and timing",
        body: [
          "The parade steps off at 10am at Laurel Street and Pacific Avenue and heads north along Pacific to Water Street, finishing around noon. Any spot along Pacific Avenue downtown puts you on the route.",
          "It goes ahead rain or shine. That route is longer than the one the city published for 2025, which started at Spruce Street, so if you watched from the far southern end last year, check the 2026 start point.",
        ],
      },
      {
        heading: "Who is in it",
        body: [
          "The parade is built around local schools, youth organisations and nonprofits rather than commercial floats. Entry registration for 2026 has closed.",
          "Sponsors for 2026 include The Penny Ice Creamery, Sandbar Solar, Santa Cruz Shakespeare, Woodstock's Pizza and Pacific Valley Bank.",
        ],
      },
      {
        heading: "Watching from home",
        body: [
          "If you cannot make it downtown, the parade is streamed live on Facebook and a recording is broadcast afterwards on Santa Cruz Community Television.",
        ],
      },
    ],
    faq: [
      {
        q: "When is the Santa Cruz holiday parade in 2026?",
        a: "Saturday 5 December 2026, from 10am to noon, rain or shine.",
      },
      {
        q: "What is the parade route?",
        a: "Along Pacific Avenue from Laurel Street to Water Street in downtown Santa Cruz.",
      },
      {
        q: "Can I still enter the parade?",
        a: "No. Registration for 2026 has closed.",
      },
      {
        q: "Can I watch it online?",
        a: "Yes. It is streamed live on Facebook and later shown on Santa Cruz Community Television.",
      },
    ],
    times: [
      {
        day: "Saturday 5 December",
        hours: "10:00am – 12:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "10:00",
    endTime: "12:00",
    recurrence: "An annual parade down Pacific Avenue on a Saturday morning in early December.",
    updated: "2026-11-26",
    hideSources: true,
    start: "2026-12-05",
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
  },  // ── v2.S — Thanksgiving weekend 2026, added 2026-11-24. Every fact below is
  // from the source URL in the row's own comment, fetched that day; notes in
  // data/research/v2s-thanksgiving-sources-2026-11-24.md (untracked).
  {
    // Active.com event page, which the club's own site links to for
    // registration. cvaclife.com/turkey-trot/ blocks automated fetches.
    slug: "cvac-turkey-trot-2026",
    name: "CVAC Turkey Trot 2026",
    county: "Monterey",
    cityText: "Carmel Valley (South Bank Trail)",
    city: "Carmel Valley",
    venue: "South Bank Trail",
    streetAddress: "27050 Rancho San Carlos",
    postalCode: "93923",
    months: ["november"],
    dateText: "November 26, 2026",
    start: "2026-11-26",
    times: [{ day: "Thanksgiving, Thursday 26 November", hours: "Coffee from 8:00am; family games 8:15am; 5K starts 9:00am" }],
    timesConfidence: "official",
    startTime: "09:00",
    category: "Running / Sports",
    officialWebsite: "https://www.active.com/carmel-ca/running/distance-running-races/cvac-turkey-trot-2026",
    ticketsUrl: "https://endurancecui.active.com/event-reg/select-race?e=97557421&regnow=awe-regnow",
    organizer: { type: "Organization", name: "Carmel Valley Athletic Club", url: "https://cvaclife.com/" },
    referenceUrls: ["https://cvaclife.com/turkey-trot/"],
    updated: "2026-11-24",
    description:
      "Carmel Valley Athletic Club's Thanksgiving morning 5K run and walk on the South Bank Trail, for the Food Bank for Monterey County.",
    metaDescription:
      "CVAC Turkey Trot, Thanksgiving Thu Nov 26, 5K at 9am on Carmel Valley's South Bank Trail. Kids 10 and under free; proceeds to the food bank.",
    intro:
      "The Carmel Valley Athletic Club's Turkey Trot is a 5K run and walk on Thanksgiving morning, Thursday 26 November 2026, starting at 9:00am from the South Bank Trail entrance at 27050 Rancho San Carlos, Carmel. It is a non-competitive fun run and is untimed. Coffee and hot chocolate are out from 8:00am and family games, including a three-legged race, start at 8:15am. The club says all proceeds go to the Food Bank for Monterey County, and the race goes ahead even with rain.",
    sections: [
      {
        heading: "Registration and prices",
        body: [
          "Registration is through Active. Children 10 and under run free without a shirt, or for $10 with one. Ages 11 to 17 are $45 and adults $50. Same-day registration is open until 9:00am. The club issues no refunds, and registrations could be transferred until 19 November.",
          "Shirts are collected from the CVAC front desk at 27300 Rancho San Carlos Rd., on Tuesday 24 and Wednesday 25 November, 10:00am to 7:00pm — a different address from the start.",
        ],
      },
    ],
    guideLink: {
      href: "/thanksgiving/",
      label: "Thanksgiving weekend 2026",
      blurb: "Turkey trots, tree lightings and what's open, Thursday to Sunday.",
    },
    faq: [
      {
        q: "What time does the CVAC Turkey Trot start?",
        a: "The 5K starts at 9:00am on Thanksgiving, Thursday 26 November 2026. Coffee and hot chocolate are available from 8:00am and family games start at 8:15am.",
      },
      {
        q: "How much does it cost?",
        a: "Free for children 10 and under without a shirt, $10 with a shirt; $45 for ages 11 to 17; $50 for adults.",
      },
      {
        q: "Is the race timed?",
        a: "No. The club describes it as a non-competitive fun run and lists it as untimed.",
      },
    ],
  },
  {
    // RunSignup pages published by Fleet Feet Aptos.
    slug: "run-for-pie-2026",
    name: "Run For Pie 2026",
    county: "Santa Cruz",
    cityText: "Soquel",
    city: "Soquel",
    streetAddress: "401 Soquel San Jose Rd",
    postalCode: "95073",
    months: ["november"],
    dateText: "November 26, 2026",
    start: "2026-11-26",
    times: [
      { day: "Thanksgiving, Thursday 26 November", hours: "Kids ½ mile 8:35am; 5K 9:05am; Pie Mile 10:15am" },
    ],
    timesConfidence: "official",
    startTime: "08:35",
    category: "Running / Sports",
    officialWebsite: "https://runsignup.com/Race/Info/CA/Soquel/RUNFORPIE2021",
    ticketsUrl: "https://runsignup.com/Race/Register/?raceId=116368",
    // Cheapest entry: the kids' half mile, $9.48 including a $1.48 fee.
    admission: { kind: "ticketed", from: 8, currency: "USD" },
    organizer: { type: "Organization", name: "Fleet Feet Aptos" },
    referenceUrls: ["https://runsignup.com/Race/Events/CA/Soquel/RUNFORPIE2021"],
    updated: "2026-11-24",
    description:
      "Fleet Feet Aptos's 13th annual Thanksgiving Day race in Soquel: a kids' half mile, a 5K and the Pie Mile, for Second Harvest Food Bank.",
    metaDescription:
      "Run For Pie, Thanksgiving Thu Nov 26 in Soquel: kids' ½ mile 8:35am, 5K 9:05am, Pie Mile 10:15am. Prices, packet pickup and what the Pie Mile is.",
    intro:
      "Run For Pie is Fleet Feet Aptos's 13th annual Thanksgiving Day race, on Thursday 26 November 2026 at 401 Soquel San Jose Rd, Soquel. There are three races: a kids' half mile at 8:35am, a 5K at 9:05am and the Pie Mile at 10:15am — a one-mile race on the track in which runners eat one piece of pie per lap, four laps and four pieces, or split it as a relay of four. The race benefits Second Harvest Food Bank and the Soquel High School track team; all proceeds from the kids' race go to Second Harvest.",
    sections: [
      {
        heading: "Prices",
        body: [
          "RunSignup currently shows the 5K at $59.30 including a $4.30 fee, the kids' half mile at $9.48 including a $1.48 fee, and the Pie Mile or relay at $13.72 including a $1.72 fee. The race's information page also says the 5K price displayed is \"$45 + processing fee\", which does not match the $55 base price in the current tier — check at checkout. A t-shirt can be added for $5. The organisers say they have capped registrations.",
          "5K registration closes at 1:00pm on 26 November; Pie Mile registration closes at 11:59pm on 25 November.",
        ],
      },
      {
        heading: "Packet pickup",
        body: [
          "At Fleet Feet Aptos, 7960 Soquel Drive, suite i, Aptos: Tuesday 24 November, 3:00pm to 7:00pm, and Wednesday 25 November, 10:00am to 5:00pm. On race morning, at Soquel High School, 7:30am to 8:20am.",
        ],
      },
    ],
    guideLink: {
      href: "/thanksgiving/",
      label: "Thanksgiving weekend 2026",
      blurb: "Turkey trots, tree lightings and what's open, Thursday to Sunday.",
    },
    faq: [
      {
        q: "What is the Pie Mile?",
        a: "A one-mile race on the track at 10:15am in which runners eat one piece of pie per lap — four laps, four pieces — or run it as a relay of four.",
      },
      {
        q: "What time does Run For Pie start?",
        a: "The kids' half mile starts at 8:35am, the 5K at 9:05am and the Pie Mile at 10:15am, on Thanksgiving, Thursday 26 November 2026.",
      },
      {
        q: "Who does it benefit?",
        a: "Second Harvest Food Bank and the Soquel High School track team. All proceeds from the kids' half mile go to Second Harvest.",
      },
    ],
  },
  {
    // https://iceskatingbythebay.com/ — the rink's own site.
    slug: "ice-skating-by-the-bay",
    name: "Ice Skating by the Bay",
    county: "Monterey",
    cityText: "Monterey (Custom House Plaza)",
    city: "Monterey",
    venue: "Custom House Plaza",
    months: ["november", "december"],
    dateText: "November 26, 2026 - January 3, 2027",
    start: "2026-11-26",
    end: "2027-01-03",
    times: [
      { day: "Monday to Saturday", hours: "11am–10pm" },
      { day: "Sundays and holidays, including Thanksgiving", hours: "12pm–8pm" },
    ],
    timesConfidence: "official",
    category: "Holiday / Ice Rink",
    officialWebsite: "https://iceskatingbythebay.com/",
    admission: { kind: "ticketed", from: 18, currency: "USD" },
    referenceUrls: [],
    updated: "2026-11-24",
    description:
      "Monterey's seasonal outdoor ice rink in Custom House Plaza, open from Thanksgiving to 3 January.",
    metaDescription:
      "Ice Skating by the Bay in Monterey: open Nov 26 2026 to Jan 3 2027 at Custom House Plaza, including Thanksgiving. Hours, prices and parking.",
    intro:
      "Ice Skating by the Bay is Monterey's outdoor holiday rink in Custom House Plaza, behind the Portola Hotel & Spa. The 2026 season runs from Thursday 26 November 2026 to Sunday 3 January 2027. It is open Monday to Saturday from 11am to 10pm, and on Sundays and holidays — Thanksgiving, Christmas Eve, Christmas Day, New Year's Eve and New Year's Day included — from 12pm to 8pm. The rink notes exceptions to the weekday hours on some dates.",
    sections: [
      {
        heading: "Prices and parking",
        body: [
          "Skating is $20 for adults and $18 for children 12 and under, who must be with an adult. Skate rental is $5. A season pass is $225.",
          "The rink points drivers to the Waterfront parking lot, $1.75 an hour or $12 a day.",
        ],
      },
    ],
    guideLink: {
      href: "/holiday-lights/",
      label: "Holiday lights map 2026",
      blurb: "Every tree lighting, lighted boat parade and drive-through display around Monterey Bay on one map, with dates, prices and directions.",
    },
    faq: [
      {
        q: "Is the Monterey ice rink open on Thanksgiving?",
        a: "Yes. The rink lists Thanksgiving among the holidays it opens, from 12pm to 8pm.",
      },
      {
        q: "How much is ice skating in Monterey?",
        a: "$20 for adults, $18 for children 12 and under, plus $5 for skate rental.",
      },
      {
        q: "When does the rink close for the season?",
        a: "The 2026 season ends on Sunday 3 January 2027.",
      },
    ],
  },
  {
    // https://canneryrow.com/experience/32nd_tree_lighting/ — Cannery Row's
    // own site. The "700 Cannery Row" address in secondary listings is not on
    // it, so no street address is given.
    slug: "cannery-row-holiday-tree-lighting",
    name: "Cannery Row Holiday Tree Lighting (32nd Annual)",
    county: "Monterey",
    cityText: "Monterey (Steinbeck Plaza)",
    city: "Monterey",
    venue: "Steinbeck Plaza",
    months: ["november"],
    dateText: "November 27, 2026",
    start: "2026-11-27",
    times: [
      {
        day: "Friday 27 November",
        hours: "2:00pm–9:00pm; tree lit about 5:45–6:00pm",
      },
    ],
    timesConfidence: "official",
    startTime: "14:00",
    endTime: "21:00",
    category: "Holiday / Tree Lighting",
    officialWebsite: "https://canneryrow.com/experience/32nd_tree_lighting/",
    admission: "free",
    referenceUrls: [],
    updated: "2026-11-24",
    headline: "Cannery Row Holiday Tree Lighting 2026",
    description:
      "Cannery Row's 32nd annual tree lighting in Steinbeck Plaza, the day after Thanksgiving, with Santa's arrival and his toy factory.",
    metaDescription:
      "Cannery Row tree lighting, Fri Nov 27: free, 2–9pm, tree lit about 6pm in Steinbeck Plaza. Schedule, Santa's Toy Factory and parking.",
    intro:
      "Cannery Row lights its holiday tree for the 32nd year on Friday 27 November 2026, the day after Thanksgiving, in Steinbeck Plaza at the corner of Cannery Row and Prescott Avenue. It is free and open to all. The afternoon starts at 2:00pm, Santa arrives on the balcony over the plaza, and the countdown to lighting the tree comes at about 6:00pm.",
    sections: [
      {
        heading: "The schedule",
        body: [
          "2:00pm to 5:00pm, family entertainment, with holiday music and balloon artists. 3:30pm to 5:30pm, carolers from I Cantori di Carmel. 5:45pm to 6:00pm, the tree lighting in Steinbeck Plaza. 6:00pm to 9:00pm, Santa in his toy factory — bring a camera for a free photo.",
        ],
      },
      {
        heading: "Santa's Toy Factory",
        body: [
          "The toy factory is on the second floor of the 685 Cannery Row building, the one with the clock tower. Visits and photos are free. After the lighting it is also open on Saturdays and Sundays from 28 November to 20 December, noon to 3:00pm.",
        ],
      },
      {
        heading: "Parking",
        body: [
          "Cannery Row points drivers to the Cannery Row parking garage at Foam and Wave Streets.",
        ],
      },
    ],
    guideLink: {
      href: "/thanksgiving/",
      label: "Thanksgiving weekend 2026",
      blurb: "Turkey trots, tree lightings and what's open, Thursday to Sunday.",
    },
    faq: [
      {
        q: "When is the Cannery Row tree lighting?",
        a: "Friday 27 November 2026, the day after Thanksgiving. The tree is lit between 5:45pm and 6:00pm in Steinbeck Plaza; the event runs from 2:00pm to 9:00pm.",
      },
      {
        q: "Is the Cannery Row tree lighting free?",
        a: "Yes. Cannery Row says it is free and open to all, and visits and photos with Santa are free too.",
      },
      {
        q: "Where do I park?",
        a: "Cannery Row recommends its parking garage at Foam and Wave Streets.",
      },
    ],
  },
  {
    // City of Pacific Grove calendar, event 1692 (read from the calendar's
    // own data feed). The City gives "Jewell Park" with no street address;
    // the "Grand & Forest" location in secondary listings is not the City's.
    // The City does not state a cost, so none is shown.
    slug: "pacific-grove-holiday-tree-lighting",
    name: "Pacific Grove Holiday Tree Lighting",
    county: "Monterey",
    cityText: "Pacific Grove (Jewell Park)",
    city: "Pacific Grove",
    venue: "Jewell Park",
    months: ["november"],
    dateText: "November 30, 2026",
    start: "2026-11-30",
    times: [{ day: "Monday 30 November", hours: "4:30pm–7:30pm; tree lit 6:00pm" }],
    timesConfidence: "official",
    startTime: "16:30",
    endTime: "19:30",
    category: "Holiday / Tree Lighting",
    officialWebsite: "https://www.cityofpacificgrove.org/calendar.php",
    organizer: { type: "Organization", name: "City of Pacific Grove", url: "https://www.cityofpacificgrove.org/" },
    referenceUrls: [],
    updated: "2026-11-24",
    description:
      "The City of Pacific Grove lights its tree in Jewell Park on the Monday after Thanksgiving, after the weekly farmers market.",
    metaDescription:
      "Pacific Grove tree lighting, Mon Nov 30, 4:30–7:30pm at Jewell Park; tree lit at 6pm. The City's schedule, from the 3pm farmers market on.",
    intro:
      "The City of Pacific Grove lights its holiday tree on Monday 30 November 2026 in Jewell Park. The City's calendar lists the event from 4:30pm to 7:30pm: holiday entertainment from 4:30pm, the tree lighting at 6:00pm, and then, in the City's words, a special visitor from the North Pole. The Monday farmers market runs beforehand, from 3:00pm.",
    sections: [
      {
        heading: "Where it is",
        body: [
          "The City lists the location as Jewell Park, Pacific Grove, and gives no street address. Some listings place the event at Grand and Forest Avenues; the City's own calendar says Jewell Park, and this page follows the City.",
        ],
      },
    ],
    guideLink: {
      href: "/events/pacific-grove/",
      label: "Events in Pacific Grove",
      blurb: "Everything we list in town, with the Monday farmers market.",
    },
    faq: [
      {
        q: "When is the Pacific Grove tree lighting?",
        a: "Monday 30 November 2026. The City lists it from 4:30pm to 7:30pm, with the tree lit at 6:00pm.",
      },
      {
        q: "Where is the Pacific Grove tree lighting?",
        a: "Jewell Park, according to the City of Pacific Grove's calendar.",
      },
      {
        q: "Is it free?",
        a: "The City's listing does not mention a cost.",
      },
    ],
  },
  {
    // Date: City of Carmel-by-the-Sea events list ("Friday, December 4 –
    // Annual Holiday Celebration"); the City's detail page returns 403.
    // Times and programme: Visit Carmel, which credits the City. Because the
    // times are not on the City's own readable page they are marked
    // unconfirmed and kept out of the JSON-LD.
    slug: "carmel-holidays-in-the-park-tree-menorah-lighting",
    name: "Carmel Holidays in the Park: Tree & Menorah Lighting",
    county: "Monterey",
    cityText: "Carmel-by-the-Sea (Devendorf Park)",
    city: "Carmel-by-the-Sea",
    venue: "Devendorf Park",
    months: ["december"],
    dateText: "December 4, 2026",
    start: "2026-12-04",
    times: [
      {
        day: "Friday 4 December",
        hours: "3:00pm–7:00pm; Santa by fire truck 3:30pm, menorah 4:00pm, tree lit about 5:30pm; Carmel Plaza open house 5:00pm–7:00pm",
      },
    ],
    timesConfidence: "unconfirmed",
    category: "Holiday / Tree Lighting",
    officialWebsite: "https://ci.carmel.ca.us/events",
    organizer: { type: "Organization", name: "City of Carmel-by-the-Sea", url: "https://ci.carmel.ca.us/" },
    referenceUrls: [
      "https://carmelcalifornia.com/event/holiday-tree-and-menorah-lighting-ceremony/",
      "https://carmelplaza.com/happening/annual-holiday-open-house/",
    ],
    updated: "2026-11-24",
    description:
      "Carmel-by-the-Sea's annual holiday celebration in Devendorf Park: Santa by fire truck, a menorah lighting and the tree lighting.",
    metaDescription:
      "Carmel tree lighting, Fri Dec 4, Devendorf Park: Santa by fire truck 3:30pm, menorah 4pm, tree lit about 5:30pm, then Carmel Plaza's open house.",
    intro:
      "Carmel-by-the-Sea holds its annual holiday celebration on Friday 4 December 2026 in Devendorf Park, on Ocean Avenue between Junipero and Mission. The City lists the date. Visit Carmel's listing gives the programme, from 3:00pm to 7:00pm: Santa Claus arrives by fire truck at 3:30pm with the Del Monte Brass, the menorah is lit from 4:00pm to 4:30pm with gelt, dreidel spinning and singing, and the tree lighting ceremony follows, with the tree lit at 5:30pm or soon after. Carmel Plaza's own page lists its annual holiday open house in the Plaza courtyard from 5:00pm to 7:00pm, after the tree lighting, with live holiday music, treats from Plaza tenants, Santa and an elf.",
    sections: [
      {
        heading: "Where the details come from",
        body: [
          "The City of Carmel-by-the-Sea's 2026 events list gives Friday 4 December for its Annual Holiday Celebration, but its detail page could not be read when this page was written. The times and programme above are from Visit Carmel, which credits the event to the City. Visit Carmel says the event is open to the public.",
        ],
      },
    ],
    guideLink: {
      href: "/holiday-lights/",
      label: "Holiday lights map 2026",
      blurb: "Every tree lighting, lighted boat parade and drive-through display around Monterey Bay on one map, with dates, prices and directions.",
    },
    faq: [
      {
        q: "When is the Carmel tree lighting?",
        a: "Friday 4 December 2026 in Devendorf Park. Visit Carmel's listing has the tree lit at 5:30pm or soon after, within an event running 3:00pm to 7:00pm.",
      },
      {
        q: "Is there a menorah lighting in Carmel?",
        a: "Yes, at the same event: 4:00pm to 4:30pm, with gelt, dreidel spinning and singing.",
      },
      {
        q: "How does Santa arrive?",
        a: "By fire truck, at about 3:30pm, with the Del Monte Brass playing.",
      },
    ],
  },
  {
    // https://carmelplaza.com/happening/black-friday-happenings-2/ — Carmel
    // Plaza's own post, dated 9 November 2026. No cost stated.
    slug: "carmel-plaza-black-friday-happenings",
    name: "Carmel Plaza Black Friday Happenings",
    county: "Monterey",
    cityText: "Carmel-by-the-Sea (Carmel Plaza)",
    city: "Carmel-by-the-Sea",
    venue: "Carmel Plaza",
    streetAddress: "Ocean Avenue & Mission Street",
    months: ["november"],
    dateText: "November 27, 2026",
    start: "2026-11-27",
    times: [{ day: "Friday 27 November", hours: "Santa and live music noon–2pm" }],
    timesConfidence: "official",
    startTime: "12:00",
    endTime: "14:00",
    category: "Holiday / Shopping",
    officialWebsite: "https://carmelplaza.com/happening/black-friday-happenings-2/",
    organizer: { type: "Organization", name: "Carmel Plaza", url: "https://carmelplaza.com/" },
    referenceUrls: [],
    updated: "2026-11-24",
    description:
      "Black Friday at Carmel Plaza: Santa and live music in the courtyard from noon to 2pm, and store promotions all weekend.",
    metaDescription:
      "Carmel Plaza on Black Friday, Nov 27: Santa and live music in the courtyard noon–2pm, KMBY live with giveaways, store deals all weekend.",
    intro:
      "Carmel Plaza, at Ocean Avenue and Mission Street in Carmel-by-the-Sea, marks Black Friday, 27 November 2026, with Santa in the courtyard and live music from noon to 2:00pm. KMBY broadcasts live from the courtyard, with a prize wheel at its booth and Carmel Plaza giveaways. Participating shops run their own promotions through Black Friday weekend.",
    guideLink: {
      href: "/thanksgiving/",
      label: "Thanksgiving weekend 2026",
      blurb: "Turkey trots, tree lightings and shopping, Thursday to Sunday.",
    },
  },
  {
    // https://downtownsantacruz.com/do/downtown-santa-cruz-makers-market-holiday-pop-up-1
    // — the Downtown Association of Santa Cruz's listing.
    slug: "downtown-santa-cruz-makers-market-holiday-pop-up",
    name: "Downtown Santa Cruz Makers Market Holiday Pop-up",
    county: "Santa Cruz",
    cityText: "Santa Cruz (1407 Pacific Ave)",
    city: "Santa Cruz",
    venue: "Former Palace Arts space",
    streetAddress: "1407 Pacific Ave",
    months: ["november", "december"],
    dateText: "November 27, 2026 - December 20, 2026",
    start: "2026-11-27",
    end: "2026-12-20",
    times: [
      { day: "Fridays and Saturdays", hours: "11am–7pm" },
      { day: "Sundays", hours: "11am–5pm" },
    ],
    timesConfidence: "official",
    category: "Holiday / Market",
    officialWebsite: "https://downtownsantacruz.com/do/downtown-santa-cruz-makers-market-holiday-pop-up-1",
    referenceUrls: [],
    updated: "2026-11-24",
    description:
      "A weekend holiday pop-up of 25+ local makers and artists on Pacific Avenue, Friday to Sunday from Thanksgiving weekend to 20 December.",
    metaDescription:
      "Santa Cruz Makers Market holiday pop-up at 1407 Pacific Ave: Fri–Sun from Nov 27 to Dec 20, 25+ local makers. Weekends and hours.",
    intro:
      "The Makers Market holiday pop-up fills the old Palace Arts space at 1407 Pacific Ave in downtown Santa Cruz on four weekends: 27–29 November, 4–6 December, 11–13 December and 18–20 December 2026. It opens 11am to 7pm on Fridays and Saturdays and 11am to 5pm on Sundays, with 25 or more local makers and artists each weekend. Leashed, friendly dogs are welcome.",
    guideLink: {
      href: "/thanksgiving/",
      label: "Thanksgiving weekend 2026",
      blurb: "Turkey trots, tree lightings and shopping, Thursday to Sunday.",
    },
  },
  {
    // https://capitolavillage.com/event/surfin-santa-visits-capitola-2026/ —
    // Capitola Village's site (Capitola Chamber of Commerce). The site blocks
    // direct downloads; read through a fetch tool on 2026-11-24.
    slug: "surfin-santa-visits-capitola-2026",
    name: "Surfin' Santa Visits Capitola 2026",
    county: "Santa Cruz",
    cityText: "Capitola (Capitola Beach)",
    city: "Capitola",
    venue: "Capitola Beach",
    postalCode: "95010",
    months: ["november"],
    dateText: "November 28, 2026",
    start: "2026-11-28",
    times: [{ day: "Saturday 28 November", hours: "12:00pm–3:00pm; Santa arrives by kayak at noon" }],
    timesConfidence: "official",
    startTime: "12:00",
    endTime: "15:00",
    category: "Holiday / Shopping",
    officialWebsite: "https://capitolavillage.com/event/surfin-santa-visits-capitola-2026/",
    organizer: { type: "Organization", name: "Capitola Chamber of Commerce" },
    referenceUrls: [],
    updated: "2026-11-24",
    description:
      "Santa arrives at Capitola Beach by kayak at noon on Small Business Saturday, the village's annual holiday visit.",
    metaDescription:
      "Surfin' Santa in Capitola, Sat Nov 28: Santa paddles in to Capitola Beach at noon, 12–3pm, on Small Business Saturday. Free 3-hour village parking.",
    intro:
      "Santa paddles in to Capitola Beach by kayak at noon on Saturday 28 November 2026 for his annual visit to Capitola Village, and stays until 3:00pm. The Capitola Chamber of Commerce ties the day to Small Business Saturday. In heavy rain the event is cancelled.",
    sections: [
      {
        heading: "Parking",
        body: [
          "Parking in Capitola Village is free for three hours from Thanksgiving Day through Christmas Day, according to the organiser.",
        ],
      },
    ],
    guideLink: {
      href: "/thanksgiving/",
      label: "Thanksgiving weekend 2026",
      blurb: "Turkey trots, tree lightings and shopping, Thursday to Sunday.",
    },
  },
  {
    // https://www.salinas.gov/Events/Tree-For-Peace — City of Salinas.
    slug: "salinas-tree-for-peace-lighting-ceremony",
    name: "Salinas Tree For Peace Lighting Ceremony",
    county: "Monterey",
    cityText: "Salinas (1 Main St)",
    city: "Salinas",
    venue: "One Main Street",
    streetAddress: "1 Main St",
    postalCode: "93901",
    months: ["november"],
    dateText: "November 28, 2026",
    start: "2026-11-28",
    times: [{ day: "Saturday 28 November", hours: "6:00pm–6:30pm; tree lit 6:30pm" }],
    timesConfidence: "official",
    startTime: "18:00",
    endTime: "18:30",
    category: "Holiday / Tree Lighting",
    officialWebsite: "https://www.salinas.gov/Events/Tree-For-Peace",
    admission: "free",
    organizer: { type: "Organization", name: "City of Salinas", url: "https://www.salinas.gov/" },
    referenceUrls: [],
    updated: "2026-11-24",
    description:
      "The City of Salinas lights its Tree For Peace at One Main Street on Small Business Saturday, with Santa and Salinas Fire.",
    metaDescription:
      "Salinas Tree For Peace lighting, Sat Nov 28 at 1 Main St: free, 6–6:30pm, tree lit at 6:30 with Santa and Salinas Fire. Free garage parking.",
    intro:
      "The City of Salinas holds its annual Tree For Peace lighting ceremony on Saturday 28 November 2026 at One Main Street, downtown. The ceremony runs from 6:00pm to 6:30pm, and the tree is lit at 6:30pm with Santa and Salinas Fire. It is free. The City says parking is free all day in the Monterey Street Parking Garage that Saturday.",
    guideLink: {
      href: "/thanksgiving/",
      label: "Thanksgiving weekend 2026",
      blurb: "Turkey trots, tree lightings and shopping, Thursday to Sunday.",
    },
  },
  {
    // https://salinasholidayparadeoflights.org/ — the parade's own site.
    slug: "salinas-holiday-parade-of-lights",
    name: "Salinas Holiday Parade of Lights",
    county: "Monterey",
    cityText: "Salinas (Main Street)",
    city: "Salinas",
    venue: "Main Street",
    months: ["november"],
    dateText: "November 29, 2026",
    start: "2026-11-29",
    times: [{ day: "Sunday 29 November", hours: "6:00pm–8:00pm" }],
    timesConfidence: "official",
    startTime: "18:00",
    endTime: "20:00",
    category: "Holiday / Parade",
    officialWebsite: "https://salinasholidayparadeoflights.org/",
    admission: "free",
    referenceUrls: [],
    updated: "2026-11-24",
    description:
      "A lighted holiday parade up Main Street in Salinas on the Sunday of Thanksgiving weekend, free to watch.",
    metaDescription:
      "Salinas Holiday Parade of Lights, Sun Nov 29, 6–8pm: free, from Acacia & S. Main St up Main Street toward downtown.",
    intro:
      "The Salinas Holiday Parade of Lights runs on Sunday 29 November 2026 from 6:00pm to 8:00pm. It starts at Acacia Street and South Main Street and travels up Main Street toward downtown. The organisers say it is free for all ages to attend.",
    guideLink: {
      href: "/thanksgiving/",
      label: "Thanksgiving weekend 2026",
      blurb: "Turkey trots, tree lightings and shopping, Thursday to Sunday.",
    },
  },
  {
    // Date range for 2026: https://aghistoryproject.org/holiday-lights/
    // (co-organiser, "select dates, November 27 thru December 24, 2026").
    // Night-by-night schedule: sparkysholidaylights.com; prices:
    // fairgrounds-foundation.org/holiday-lights/. Neither prints a year beside
    // its dates, but both match 2026 weekdays (bonus nights "Monday December
    // 21 thru Thursday December 24th"). Recorded as organiser-published.
    slug: "sparkys-holiday-lights",
    name: "Sparky's Holiday Lights",
    county: "Santa Cruz",
    cityText: "Watsonville (Santa Cruz County Fairgrounds)",
    city: "Watsonville",
    venue: "Santa Cruz County Fairgrounds",
    streetAddress: "2601 E Lake Ave",
    postalCode: "95076",
    months: ["november", "december"],
    dateText: "November 27, 2026 - December 24, 2026",
    start: "2026-11-27",
    end: "2026-12-24",
    times: [
      { day: "Drive-through: 27, 28, 29 November; 6, 11, 12, 13, 18–24 December", hours: "5:30pm–9:00pm" },
      { day: "Walk-through Krampus night: Thursday 3 December", hours: "5:00pm–9:30pm" },
      { day: "Walk-through with the Heritage Holiday Fair: 4 and 5 December", hours: "5:00pm–9:00pm" },
    ],
    timesConfidence: "official",
    category: "Holiday / Lights",
    officialWebsite: "https://aghistoryproject.org/holiday-lights/",
    admission: { kind: "ticketed", from: 20, currency: "USD" },
    referenceUrls: ["https://sparkysholidaylights.com/", "https://fairgrounds-foundation.org/holiday-lights/"],
    updated: "2026-11-24",
    description:
      "A drive-through holiday lights display at the Santa Cruz County Fairgrounds in Watsonville, on select nights from 27 November to Christmas Eve.",
    metaDescription:
      "Sparky's Holiday Lights at the Santa Cruz County Fairgrounds, Watsonville: drive-through nights Nov 27–Dec 24, 5:30–9pm, $20 a car online.",
    intro:
      "Sparky's Holiday Lights is a drive-through lights display at the Santa Cruz County Fairgrounds, 2601 E Lake Ave, Watsonville, on select nights from Friday 27 November to Thursday 24 December 2026. Drive-through nights are 27, 28 and 29 November and 6, 11, 12, 13 and 18 to 24 December, 5:30pm to 9:00pm. On three nights it opens on foot instead: a Krampus walk-through on 3 December, 5:00pm to 9:30pm, and the Heritage Holiday Fair on 4 and 5 December, 5:00pm to 9:00pm, which needs a fair ticket. Proceeds go to the Fairgrounds Foundation and the Agricultural History Project.",
    sections: [
      {
        heading: "Prices",
        body: [
          "$20 a vehicle bought online, $25 at the gate. RVs and buses are $40 online.",
        ],
      },
    ],
    guideLink: {
      href: "/holiday-lights/",
      label: "Holiday lights map 2026",
      blurb: "Every tree lighting, lighted boat parade and drive-through display around Monterey Bay on one map, with dates, prices and directions.",
    },
  },
  {
    // https://winterwonderfestmonterey.com/tickets/ — the organiser's own
    // 2026 page; parking from its FAQ page on the same site.
    slug: "winter-wonderfest-monterey",
    name: "Winter Wonderfest Monterey",
    county: "Monterey",
    cityText: "Monterey (Monterey County Fairgrounds)",
    city: "Monterey",
    venue: "Monterey County Fairgrounds",
    streetAddress: "2004 Fairground Rd",
    postalCode: "93940",
    months: ["november", "december"],
    dateText: "November 21, 2026 - December 27, 2026",
    start: "2026-11-21",
    end: "2026-12-27",
    times: [
      {
        day: "21–22 and 27–29 November; 3–6, 10–13, 16–23 and 26–27 December",
        hours: "5pm–9pm",
      },
    ],
    timesConfidence: "official",
    category: "Holiday / Lights",
    officialWebsite: "https://winterwonderfestmonterey.com/tickets/",
    admission: { kind: "ticketed", from: 11, currency: "USD" },
    referenceUrls: ["https://winterwonderfestmonterey.com/faqs/"],
    updated: "2026-11-24",
    description:
      "A walk-through holiday light festival at the Monterey County Fairgrounds, on weekends and select weekdays to 27 December.",
    metaDescription:
      "Winter Wonderfest Monterey: walk-through holiday lights at the Fairgrounds, Nov 21–Dec 27, 5–9pm. Dates, ticket prices and free parking.",
    intro:
      "Winter Wonderfest is a walk-through holiday light festival at the Monterey County Fairgrounds, 2004 Fairground Rd, entered through Gate 5. The 2026 season runs from 21 November to 27 December on all weekends and some weekdays — 21–22 and 27–29 November, then 3–6, 10–13, 16–23 and 26–27 December — from 5pm to 9pm each night. The organisers list new light installations for 2026, and it runs rain or shine with no refunds.",
    sections: [
      {
        heading: "Tickets and parking",
        body: [
          "Advance general admission is $27.50 for ages 13 and up and $11 for children 6 to 12; children 5 and under are free. A season pass is $80.",
          "Parking is free along Fairgrounds Road and in the Carnival Lot, according to the organisers' FAQ.",
        ],
      },
    ],
    guideLink: {
      href: "/holiday-lights/",
      label: "Holiday lights map 2026",
      blurb: "Every tree lighting, lighted boat parade and drive-through display around Monterey Bay on one map, with dates, prices and directions.",
    },
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
