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
   * Admission, and the first field in this dataset that unblocks v1.C.
   *
   * Set ONLY where the ORGANISER states it in their own words. The CSV carries
   * no admission column, so every row is undefined until someone checks — and
   * undefined stays undefined rather than defaulting to anything. A guessed
   * price is worse than no price, and "free" asserted wrongly about a ticketed
   * event is worse still.
   *
   * `"free"` is the only member today because it is the only one sourced. The
   * union grows one checked organiser at a time; do not add a member
   * speculatively. When set, the page shows a visible admission badge AND the
   * Event JSON-LD carries a matching Offer — never one without the other.
   */
  admission?: "free";

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
    updated: "2026-08-21",
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
      "The 69th Monterey Jazz Festival runs Friday 25 to Sunday 27 September 2026 across the 20 oak-studded acres of the Monterey County Fair & Event Center, 2000 Fairground Road. Thirty hours of music on six stages, around seventy food and craft vendors, and a 2026 bill led by a first-ever Herbie Hancock and Ron Carter duo. It is ticketed, and which ticket you buy changes the festival you get — that is the part worth understanding before you spend $215.",
    sections: [
      {
        heading: "The ticket tiers, and what each one actually gets you",
        body: [
          "There are three single-day tiers, and the gap between them is not just seat quality. Arena tickets are $110 on Friday and $215 on Saturday or Sunday, and they buy a reserved seat for the Jimmy Lyons Stage in the Arena plus access to everything on the four Grounds stages that day. Arena Lawn is $75 Friday and $135 Saturday or Sunday. Grounds tickets are $65 Friday and $90 Saturday or Sunday.",
          "The distinction that catches people: a Grounds ticket does not get you into the Arena. The headline acts on the Jimmy Lyons Stage — the Hancock and Carter duo, the Jazz at Lincoln Center Orchestra — are Arena shows. If those are why you are coming, Grounds is the wrong ticket at any price. If you are happy to graze five other stages all day, it is much the better value.",
          "Three-day packages exist alongside the single-day tiers. Premier Club add-on access is sold out for 2026. Prices here are the organisers' own published figures for single-day tickets; check montereyjazz.org before buying, because tiers sell out at different rates.",
        ],
      },
      {
        heading: "Who is playing in 2026",
        body: [
          "The 2026 bill is led by Herbie Hancock and Ron Carter in what the festival bills as their first-ever duo performance — two musicians whose partnership goes back to Miles Davis's second great quintet, playing as a pair for the first time.",
          "Also announced: the Jazz at Lincoln Center Orchestra with Wynton Marsalis and special guest Cécile McLorin Salvant, Meshell Ndegeocello, the Charles Lloyd Quartet, and the Ravi Coltrane Quartet.",
          "Six stages carry it: the Jimmy Lyons Stage in the Arena, and on the Grounds the West End Stage, Pacific Jazz Café, Tim Jackson Garden Stage, Courtyard Stage and the Monterey Room.",
        ],
      },
      {
        heading: "Parking is the problem to solve first",
        body: [
          "Fairgrounds parking is sold out for 2026. Monterey Peninsula College parking is expected to be available to buy, with a shuttle. The organisers' own advice if you do not hold parking is to use Uber or Lyft rather than to drive and hope.",
          "Limited ADA parking is on Fairground Road, first-come first-served. ADA seating is arranged through ticketing or on 831-308-4653, and hearing devices are free at Patron Services against a deposit of valid ID.",
        ],
      },
      {
        heading: "Rules that will cost you at the gate",
        body: [
          "No outside food, coolers, glass bottles or beverages in containers. No lawn, beach or folding chairs — a real constraint at a festival where people expect to sit on grass all afternoon. No detachable-lens cameras, flash equipment or recording devices. No pets, and no strollers inside the arenas.",
          "Re-entry works on a wristband: your ticket admits you once, and the wristband is what lets you back in. Lose the wristband and you buy another ticket. Worth knowing before you take it off.",
          "Children are handled differently by area. In the Arena everyone needs a ticket, infants included. On the Grounds, under-2s are free and ages 2 to 12 need a youth ticket.",
        ],
      },
      {
        heading: "What has not been published",
        body: [
          "Gate and box-office times. The festival's own FAQ still says these \"will be announced in early spring 2026\" — a sentence that has outlived the spring it refers to, and is the reason this page carries no opening time. Shuttle schedules are in the same position.",
          "Set times and the stage-by-stage running order. Knowing who is on the bill is not the same as knowing when, and for a six-stage festival that is the difference between planning a day and wandering one.",
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
        a: "Single-day Arena is $110 Friday, $215 Saturday or Sunday. Arena Lawn is $75 Friday, $135 Saturday or Sunday. Grounds is $65 Friday, $90 Saturday or Sunday. Three-day packages are also sold; Premier Club is sold out.",
      },
      {
        q: "Does a Grounds ticket get me into the Arena?",
        a: "No. Grounds admits you to the four Grounds stages only. The Jimmy Lyons Stage headliners in the Arena need an Arena or Arena Lawn ticket, and that is the most common mistake people make with this festival.",
      },
      {
        q: "Where do I park?",
        a: "Fairgrounds parking is sold out for 2026. Monterey Peninsula College parking with a shuttle is expected to be available; otherwise the organisers recommend Uber or Lyft. Limited ADA parking on Fairground Road is first-come, first-served.",
      },
      {
        q: "What time do gates open?",
        a: "Not announced. The organisers' FAQ still says gate and box-office times will be published in early spring 2026, so no opening time is listed here rather than repeating a previous year's.",
      },
      {
        q: "Can I bring a chair?",
        a: "No. Lawn, beach and folding chairs are all prohibited, as are outside food, coolers, glass, detachable-lens cameras and recording devices.",
      },
    ],
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
    updated: "2026-08-18",
    name: "Christmas in the Adobes",
    county: "Monterey",
    cityText: "Monterey (historic downtown adobes)",
    city: "Monterey",
    venue: "Historic downtown adobes",
    months: ["december"],
    dateText: "December 11-12, 2026",
    start: "2026-12-11",
    end: "2026-12-12",
    times: [
      { day: "Friday, December 11", hours: "5:00 - 9:00 p.m." },
      { day: "Saturday, December 12", hours: "5:00 - 9:00 p.m." },
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
