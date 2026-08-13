export type Access = "free" | "ticketed" | "private";

/**
 * What a reader can be told about the cost of turning up, and on whose word.
 * Every value is a claim we can defend; none of them means "unchecked".
 *
 *  confirmed-free    The organizer's own page says spectators get in free.
 *                    `admissionNote` quotes them.
 *  cost-to-arrive    Admission is free but reaching it is not — paid parking,
 *                    a gate fee. The cost is named where the operator
 *                    publishes it, and pointed at its authority where they
 *                    don't, because prices go stale silently.
 *  public-street     It happens on a public road. There is no gate, no ticket
 *                    on sale anywhere, and nothing that could admit you. This
 *                    is a statement about the venue, not a guess about policy.
 *  not-published     We read the organizer's page and it says nothing about
 *                    admission either way. That absence is the finding, and
 *                    the note says where to ask. It is not a to-do.
 *  not-spectator     Invitation-only or private. It does not belong on /free/
 *                    at all; listing it there would be the real error.
 */
export type Admission =
  | "confirmed-free"
  | "cost-to-arrive"
  | "public-street"
  | "not-published"
  | "not-spectator";

/**
 * UTC offset for the Monterey Peninsula (America/Los_Angeles) during Car Week.
 * August is inside Pacific Daylight Time, so the offset is fixed at -07:00 for
 * every date in `schedule` — no DST boundary falls inside August 7–16.
 * Used to build `startDate` / `endDate` in the Event JSON-LD.
 */
export const PACIFIC_OFFSET = "-07:00";

export type CarEvent = {
  title: string;
  url?: string;
  access: Access;
  accessLabel: string;
  day?: string;
  description?: string;
  /**
   * Local (America/Los_Angeles) clock times, 24h "HH:MM".
   *
   * ONLY set these where the organizer's stated time is actually known — they
   * are published as machine-readable `startDate` / `endDate` in Event JSON-LD
   * and surface as event start times in Google results. An event with no entry
   * here emits a date-only `startDate`, which schema.org accepts (startDate is
   * "Date or DateTime"). Guessing a time here puts a wrong time in front of
   * people deciding when to show up, so leave it unset when unsure.
   */
  startTime?: string;
  endTime?: string;
  /**
   * How we know what this costs to attend — see the `Admission` union.
   *
   * This replaced a boolean `admissionConfirmed`, which forced every listing
   * into "confirmed free" or "[VERIFY]". The second bucket was dishonest in
   * both directions: it lumped "the city will never publish a parking plan,
   * and that IS the answer" together with "nobody has looked yet", and it left
   * a to-do badge on facts that were already as resolved as they will ever be.
   *
   * The rule now: every listing makes a POSITIVE statement we can defend. If a
   * claim can't be supported, we don't dress it in a caveat — we stop making
   * it and say what is true instead. A volatile number (a gate fee, a parking
   * price) belongs at its authority, not cached in our copy where it goes
   * stale silently.
   *
   * Audit of 2026-08-12 found three listings labelled free that are not:
   * Exotics on Broadway ($40 general admission) and the Ferrari Owners Club
   * Concours Carmel (donation tickets from $50) are now ticketed, and Werks
   * Reunion is free to enter but charges $40 to park.
   */
  admission?: Admission;
  /**
   * What is actually known about attending, stated positively — the
   * organizer's own words where they exist, and otherwise what the public
   * record does and does not contain, plus where to get the rest. Never a
   * hedge, never a guess. Rendered under the listing on /free/.
   */
  admissionNote?: string;
};

export type DaySchedule = {
  id: string;
  /** Calendar date as ISO 8601 `YYYY-MM-DD`, America/Los_Angeles. */
  iso: string;
  weekday: string;
  date: string;
  short: string;
  events: CarEvent[];
};

const QUAIL_RALLY = "https://www.peninsula.com/en/signature-events/events/rally";
const REUNION =
  "https://weathertechraceway.com/pages/rolex-monterey-motorsports-reunion";
const ZENVO = "https://zenvoautomotive.com/monterey-2026/#monterey-book";
const BONHAMS = "https://cars.bonhams.com/auction/31959/the-laguna-seca-auction/";
const AUTOMOBILIA = "https://automobiliacollectorsexpo.com/";
const GOODING = "https://www.goodingco.com/auction/pebble-beach-auctions-2026/";
const BROAD_ARROW =
  "https://www.broadarrowauctions.com/events/event/The%20Quail%20Auction%202026";
const MECUM = "https://www.mecum.com/auctions/monterey-2026/";
const RM = "https://rmsothebys.com/auctions/mo26/";
const RETROAUTO = "https://pebblebeachconcours.net/events/pebble-beach-retroauto/";
const VILLAGE = "https://www.pebblebeachconcours.net/event/concours-village/";
const FORUM = "https://www.pebblebeachconcours.net/event/pebble-beach-classic-car-forum/";
const RACING_TO_DEL_MONTE =
  "https://www.montereyhistory.org/event/racing-to-del-monte-pebble-beach/";
const PRE_REUNION =
  "https://weathertechraceway.com/pages/monterey-pre-reunion-and-corkscrew-hillclimb";

export const schedule: DaySchedule[] = [
  {
    id: "august-7",
    iso: "2026-08-07",
    weekday: "Friday",
    date: "August 7",
    short: "Aug 7",
    events: [
      {
        title: "Monterey Car Week Kick-Off",
        url: "https://www.seemonterey.com/event/monterey-car-week-kickoff/",
        access: "free",
        accessLabel: "Free admission",
        startTime: "17:00",
        endTime: "19:00",
        admission: "not-published",
        admissionNote:
          "Consistently reported as free and open to the public, 5–7 p.m. on the 300 block of Alvarado Street, with Reunion race cars and driver meet-and-greets. seemonterey.com — the destination-marketing site that hosts the official listing — blocks automated reads, so this is not quoted from the organizer.",
        description:
          "A family-friendly opener: classic race cars, driver meet-and-greets, live music, giveaways and an atmosphere thick with anticipation.",
      },
      {
        title: "Racing to Del Monte & Pebble Beach",
        url: RACING_TO_DEL_MONTE,
        access: "free",
        accessLabel: "Exhibit",
        admission: "not-published",
        admissionNote:
          "Monterey History & Art publishes the run — August 7 at noon through August 17 at 4:00 p.m. at the Stanton Center, 5 Custom House Plaza — but states no admission price either way. It is a museum exhibit, so an entry fee is plausible; call ahead if the price matters.",
        day: "Day 1",
        description:
          "An immersive exhibit on the birth of Monterey Bay automotive culture, with rare early racing vehicles, artifacts and memorabilia in partnership with History San Jose.",
      },
    ],
  },
  {
    id: "august-8",
    iso: "2026-08-08",
    weekday: "Saturday",
    date: "August 8",
    short: "Aug 8",
    events: [
      {
        title: "Monterey Pre-Reunion and Corkscrew Hillclimb",
        url: PRE_REUNION,
        access: "ticketed",
        accessLabel: "Ticketed",
        day: "Day 1",
        description:
          "Two days of historic racing at WeatherTech Raceway Laguna Seca, culminating in the Fifth Annual Corkscrew Hillclimb — drivers racing up motorsport's most iconic turn, in reverse.",
      },
      {
        title: "Racing to Del Monte & Pebble Beach",
        url: RACING_TO_DEL_MONTE,
        access: "free",
        accessLabel: "Exhibit",
        admission: "not-published",
        admissionNote:
          "Monterey History & Art publishes the run — August 7 at noon through August 17 at 4:00 p.m. at the Stanton Center, 5 Custom House Plaza — but states no admission price either way. It is a museum exhibit, so an entry fee is plausible; call ahead if the price matters.",
        day: "Day 2",
      },
    ],
  },
  {
    id: "august-9",
    iso: "2026-08-09",
    weekday: "Sunday",
    date: "August 9",
    short: "Aug 9",
    events: [
      {
        title: "Monterey Pre-Reunion and Corkscrew Hillclimb",
        url: PRE_REUNION,
        access: "ticketed",
        accessLabel: "Ticketed",
        day: "Day 2",
      },
      {
        title: "Racing to Del Monte & Pebble Beach",
        url: RACING_TO_DEL_MONTE,
        access: "free",
        accessLabel: "Exhibit",
        admission: "not-published",
        admissionNote:
          "Monterey History & Art publishes the run — August 7 at noon through August 17 at 4:00 p.m. at the Stanton Center, 5 Custom House Plaza — but states no admission price either way. It is a museum exhibit, so an entry fee is plausible; call ahead if the price matters.",
        day: "Day 3",
      },
    ],
  },
  {
    id: "august-10",
    iso: "2026-08-10",
    weekday: "Monday",
    date: "August 10",
    short: "Aug 10",
    events: [
      {
        title: "The Quail Rally",
        url: QUAIL_RALLY,
        access: "private",
        accessLabel: "Invitation only — not a spectator event",
        admission: "not-spectator",
        day: "Day 1",
        admissionNote:
          "Participation is by invitation only — roughly 30 vintage cars — and the organizer publishes no spectator provision, no route and no viewing points. There is nothing to buy a ticket for and nothing that admits you: you either happen to be on the road it takes, or you don't. peninsula.com blocks automated reads.",
        description:
          "A journey through the most breathtaking roads of the Monterey Peninsula, integrated with the week's most prestigious gatherings.",
      },
      {
        title: "Central Coast Poker Rally",
        url: "https://centralcoastpokerrally.com/about-us/",
        access: "free",
        accessLabel: "Paid registration · free showcase",
        admission: "not-published",
        description:
          "Scenic drives, car culture and charitable impact combined into one day of passion, purpose and performance.",
      },
      {
        title: "Automobilia Collectors Expo",
        url: AUTOMOBILIA,
        access: "ticketed",
        accessLabel: "Ticketed",
        day: "Day 1",
        description:
          "A premier gathering for automobilia collectors, enthusiasts, exhibitors and automotive lifestyle brands from around the world.",
      },
      {
        title: "Monterey British Car Event",
        url: "https://www.jags.org/event-details/monterey-british-2026",
        access: "free",
        accessLabel: "Free for spectators, kids and dogs",
        startTime: "10:00",
        admission: "confirmed-free",
        admissionNote:
          "Organizer states “Spectators, kids, and dogs are always free and encouraged.” Show entries are sold out; spectators are not affected.",
        description:
          "Over 80 classic and modern British cars on a lawn framed by the Santa Lucia Mountains. Aston Martins to Triumphs — no polishing required.",
      },
      {
        title: "Porsche Monterey Classic",
        url: "https://www.porschemonterey.com/dealership/porsche-monterey-classic-event.htm",
        access: "free",
        accessLabel: "Free admission",
        startTime: "15:00",
        endTime: "19:00",
        admission: "not-published",
        admissionNote:
          "The dealer's own ticketing listing confirms Monday, August 10, 3:00–7:00 p.m. at 1781 Del Monte Blvd, but registration has since closed and no longer shows a price, so the free-admission claim could not be read back from the organizer. porschemonterey.com blocks automated reads.",
        description:
          "Heritage and Horsepower at 1781 Del Monte Blvd, celebrating the timeless legacy and performance of the Porsche 911.",
      },
      {
        title: "Piazza Motor Nights",
        url: "https://piazzamotornights.com/access",
        access: "ticketed",
        accessLabel: "Ticketed · new for 2026",
        description:
          "Curated automobiles, cocktails, live entertainment and the energy of Car Week under the stars.",
      },
    ],
  },
  {
    id: "august-11",
    iso: "2026-08-11",
    weekday: "Tuesday",
    date: "August 11",
    short: "Aug 11",
    events: [
      {
        title: "The Laguna Seca Auction — Bonhams Preview",
        url: BONHAMS,
        access: "free",
        accessLabel: "Free preview",
        day: "Day 1",
        startTime: "09:00",
        endTime: "18:00",
        admission: "confirmed-free",
        admissionNote:
          "Bonhams states this day is “free and open to the public,” 9am–6pm. Tuesday only — the Wednesday and Thursday previews are ticketed, and Thursday's auction seating is reserved for registered bidders.",
        description:
          "Preview all lots at the Bonhams | Cars auction marquee, at its new home at WeatherTech Raceway Laguna Seca.",
      },
      {
        title: "The Quail Rally",
        url: QUAIL_RALLY,
        access: "private",
        accessLabel: "Invitation only — not a spectator event",
        admission: "not-spectator",
        day: "Day 2",
        admissionNote:
          "Participation is by invitation only — roughly 30 vintage cars — and the organizer publishes no spectator provision, no route and no viewing points. There is nothing to buy a ticket for and nothing that admits you: you either happen to be on the road it takes, or you don't. peninsula.com blocks automated reads.",
      },
      {
        title: "Zenvo House",
        url: ZENVO,
        access: "ticketed",
        accessLabel: "Ticketed · by booking",
        day: "Day 1",
        description:
          "Private visits on the Monterey Peninsula to explore Zenvo's latest hypercars and meet the people who build them.",
      },
      {
        title: "Concours for a Cause",
        url: "https://concoursforacause.com/",
        access: "free",
        accessLabel: "Free for spectators",
        startTime: "10:00",
        endTime: "16:00",
        admission: "confirmed-free",
        admissionNote:
          "Organizer states the event is “free and open to the public.” No ticket.",
        description:
          "Vintage cars, cultural experiences and local artists along Ocean Avenue in Carmel-by-the-Sea, supporting local nonprofits.",
      },
      { title: "Automobilia Collectors Expo", url: AUTOMOBILIA, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
      {
        title: "Night Rider",
        url: "https://www.visitasilomar.com/things-to-do/car-week",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "Asilomar's underground garage becomes a celebration of lowrider culture and Chicano heritage, with a DJ spinning vintage vinyl.",
      },
    ],
  },
  {
    id: "august-12",
    iso: "2026-08-12",
    weekday: "Wednesday",
    date: "August 12",
    short: "Aug 12",
    events: [
      {
        title: "The Quail Rally",
        url: QUAIL_RALLY,
        access: "private",
        accessLabel: "Invitation only — not a spectator event",
        admission: "not-spectator",
        day: "Day 3",
        admissionNote:
          "Participation is by invitation only — roughly 30 vintage cars — and the organizer publishes no spectator provision, no route and no viewing points. There is nothing to buy a ticket for and nothing that admits you: you either happen to be on the road it takes, or you don't. peninsula.com blocks automated reads.",
      },
      {
        title: "Rolex Monterey Motorsports Reunion",
        url: REUNION,
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "A museum revving to life: hundreds of historic, period-correct race cars from nearly every era — raced in anger, not parked on a lawn.",
      },
      { title: "Zenvo House", url: ZENVO, access: "ticketed", accessLabel: "Ticketed · by booking", day: "Day 2" },
      { title: "The Laguna Seca Auction — Bonhams Preview", url: BONHAMS, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
      { title: "Automobilia Collectors Expo", url: AUTOMOBILIA, access: "ticketed", accessLabel: "Ticketed", day: "Day 3" },
      {
        title: "The Quail Auction — Broad Arrow Preview",
        url: BROAD_ARROW,
        access: "ticketed",
        accessLabel: "Preview",
        description:
          "Broad Arrow becomes the Official Auction Partner of The Quail, with the auction moving to the Quail Golf Club in Carmel.",
      },
      {
        title: "Pebble Beach Auctions by Gooding Christie's",
        url: GOODING,
        access: "ticketed",
        accessLabel: "Ticketed",
        day: "Preview Day 1",
        description:
          "The world's foremost collectors, buyers and sellers gather for automobiles of impeccable quality, design and provenance.",
      },
      {
        title: "Astons on the Avenue",
        url: "https://www.astonsontheavenue.com/",
        access: "free",
        accessLabel: "Free for spectators",
        admission: "public-street",
        startTime: "11:00",
        endTime: "16:00",
        admissionNote:
          "The organizer never states admission either way. What their site does show is that the only things they sell are entrant registration and merchandise — hats, posters, stickers, shirts — with no spectator ticket of any kind on the site. That plus a public street on Ocean Avenue is strong circumstantial evidence, and it is still not the organizer saying it, so this stays flagged.",
        description: "52 Aston Martins line Ocean Avenue — the event's biggest turnout yet.",
      },
      {
        title: "The Little Car Show",
        url: "https://www.thelittlecarshow.com/",
        access: "free",
        accessLabel: "Free for spectators",
        admission: "confirmed-free",
        admissionNote:
          "Organizer states the show “is free of charge to all spectators.” 125 vehicles, 25 years and older, 1,800cc or less, on Lighthouse Avenue between Fountain Avenue and 19th Street.",
        // The only event in this dataset with an organizer-stated clock time
        // ("noon to 5 PM", below). Everything else emits a date-only startDate
        // until a real time is sourced — see CarEvent.startTime.
        startTime: "12:00",
        endTime: "17:00",
        description:
          "Mini, micro, electric, steam and arcane vehicles take over Lighthouse Avenue in downtown Pacific Grove, noon to 5 PM.",
      },
      {
        title: "Porsche Pit Stop at Taste Morgan",
        url: "https://mby.pca.org/events/2026-porsche-pit-stop-at-taste-morgan/",
        access: "ticketed",
        accessLabel: "Ticketed",
        description: "The fifth annual Porsche Pit Stop at the Crossroads Center in Carmel.",
      },
      {
        title: "Pebble Beach Motoring Classic",
        url: "https://pebblebeachconcours.net/events/pebble-beach-motoring-classic/",
        access: "free",
        // Watching costs nothing, but Casa Palmero is inside the Del Monte
        // Forest gates and driving in means paying 17-Mile Drive's per-car gate
        // fee. Calling this simply "free" would send someone to a toll gate they
        // were not expecting — same reasoning as Werks Reunion's $40 parking.
        accessLabel: "Free to watch · 17-Mile Drive gate fee to drive in",
        admission: "cost-to-arrive",
        admissionNote:
          "Nobody charges you to watch, but getting there is not free and not simple. Casa Palmero sits inside the Del Monte Forest gates: 17-Mile Drive costs $12.50 per vehicle, reimbursed if you spend $35 or more at a Pebble Beach Resorts restaurant (Pebble Beach Market excluded). The 13th–16th closure has not begun on the 12th, so general traffic can still enter — but parking at the Casa Palmero garage and the 17th Hedgerow is by reservation only on August 10, 11 and 12, on 831-625-8536. The organizer's participant itinerary gives an arrival ETA of 4:30 p.m. and says nothing about public viewing; their page labels that line “Wednesday, August 11”, which cannot be right, since August 11 is a Tuesday. For the same cars with no gate fee and no reservation, the organizer points at Thursday's Tour d'Elegance.",
        description:
          "A nine-day drive from Kirkland, Washington to Casa Palmero at Pebble Beach arrives on the Peninsula.",
      },
      {
        title: "Luau at Asilomar",
        url: "https://www.visitasilomar.com/things-to-do/car-week",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "An evening beneath the cypress trees in Grand Cypress Meadow, and the official kickoff to Woodies in the Woods.",
      },
      {
        title: "Motorlux",
        url: "https://motorlux.com/",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "Michelin-starred chefs, local wines and over one hundred rare airplanes and automobiles — the biggest party on the Peninsula.",
      },
      { title: "Cadillac House", access: "private", accessLabel: "Private event", day: "Day 1" },
    ],
  },
  {
    id: "august-13",
    iso: "2026-08-13",
    weekday: "Thursday",
    date: "August 13",
    short: "Aug 13",
    events: [
      { title: "Rolex Monterey Motorsports Reunion", url: REUNION, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
      {
        title: "Pebble Beach Tour d'Elegance",
        url: "https://www.pebblebeachconcours.net/events/pebble-beach-tour-delegance/",
        access: "free",
        accessLabel: "Free for spectators",
        startTime: "09:30",
        admission: "confirmed-free",
        admissionNote:
          "Organizer states “the public is invited to view the Tour, without fee, at several points.” Cars line up from before 7:00 a.m. and leave promptly at 9:30 a.m. The organizer does not publish the route or the viewing points on this page.",
        description:
          "Elegance in motion: more than 150 Concours entrants prove their roadworthiness along a scenic route on Highway One.",
      },
      {
        // CORRECTED 2026-08-12. Was published as "Free for spectators". The
        // organizer sells donation-based admission from $50 to $1,500, so this
        // is a ticketed event and does not belong on /free/.
        title: "Ferrari Owners Club 4th Annual Concours Carmel",
        url: "https://www.focnorcal.org/events/4th-annual-concours-carmel-2026-august-13-2026",
        access: "ticketed",
        accessLabel: "Ticketed · donation from $50",
        startTime: "07:00",
        endTime: "16:00",
        admissionNote:
          "Donation-based tickets from $50 to $1,500, proceeds to charity, no refunds. Cars are placed 7–9 a.m.",
        description:
          "Five blocks of Ferraris and Italian motorcycles across Ocean Avenue and Dolores Street in Carmel-by-the-Sea.",
      },
      { title: "The Quail Auction — Broad Arrow", url: BROAD_ARROW, access: "ticketed", accessLabel: "Ticketed", day: "Day 1" },
      {
        title: "Mecum Auction",
        url: MECUM,
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "Prewar classics, vintage muscle, luxury exotics, modern supercars and roughly 100 vintage motorcycles from the world's largest collector-car auction company.",
      },
      { title: "Zenvo House", url: ZENVO, access: "ticketed", accessLabel: "Ticketed · by booking", day: "Day 3" },
      { title: "The Laguna Seca Auction — Bonhams Preview & Auction", url: BONHAMS, access: "ticketed", accessLabel: "Ticketed" },
      { title: "Pebble Beach Auctions by Gooding Christie's", url: GOODING, access: "ticketed", accessLabel: "Ticketed", day: "Preview Day 2" },
      {
        title: "Pebble Beach RetroAuto",
        url: RETROAUTO,
        access: "ticketed",
        accessLabel: "Open to the public",
        day: "Day 1",
        description:
          "A curated selection of rare collectibles and memorabilia from the automotive past alongside the latest luxury goods.",
      },
      {
        title: "Legends of the Autobahn",
        url: "https://legendsoftheautobahn.org/",
        access: "free",
        accessLabel: "Free entry · $30–$40 parking",
        startTime: "09:00",
        admission: "cost-to-arrive",
        admissionNote:
          "The organizer's own FAQ answers it directly — “Spectator admission is free, but spectator parking costs …” — so walking in costs nothing and the charge is for the car. Use $30 prepaid / $40 on the day: those are the prices on the organizer's current 2026 pages and the Pacific Grove Chamber listing. The FAQ still quotes $25, but it sits under the site's `xv-faq` path — the fifteenth annual, i.e. last year — so treat its price as stale and its admission answer as current. Show runs 9:00 a.m.–3:00 p.m. at Pacific Grove Golf Links, 77 Asilomar Avenue.",
        description:
          "A premier all-German marque Concours d'Elegance returning for its 16th year to Pacific Grove Golf Links — Audi, BMW and Mercedes-Benz.",
      },
      {
        title: "Concours Village",
        url: VILLAGE,
        access: "free",
        accessLabel: "Free for spectators",
        day: "Day 1",
        startTime: "08:00",
        endTime: "18:00",
        admission: "confirmed-free",
        admissionNote:
          "Organizer states it is “open to the public at no cost.” Thursday 8:00 a.m.–6:00 p.m.; Friday and Saturday 9:00 a.m.–6:00 p.m.; Concours Sunday 8:00 a.m.–6:00 p.m. Across from the Pebble Beach Auctions at Forest Lake Road and Stevenson Drive.",
        description:
          "Over 60,000 sq ft of interactive manufacturer displays, open to the public at no cost.",
      },
      {
        title: "Pebble Beach Classic Car Forum",
        url: FORUM,
        access: "ticketed",
        accessLabel: "Ticketed",
        day: "Day 1",
        description: "Conversations with automotive leaders and legends on the topics facing the collector car world.",
      },
      {
        title: "Woodies in the Woods",
        url: "https://www.visitasilomar.com/things-to-do/car-week",
        access: "free",
        accessLabel: "Free for spectators",
        startTime: "12:00",
        endTime: "17:00",
        admission: "confirmed-free",
        admissionNote:
          "The Santa Cruz Woodies Club, who co-present the show, state for 2026 that “the show is free for spectators as well as woodie owners” with “no registration required”, 12:00–5:00 p.m. in the Grand Cypress Meadow. Asilomar separately offers an optional $45 presale wristband for the food and beer garden — entry to see the cars is not what that buys. Note that Asilomar's own page still shows an undated “Thursday, August 14”, which was the 2025 date; both the club and the Pacific Grove Chamber give Thursday, August 13 for 2026.",
        description:
          "Classic wood-paneled cars, live music, food and drink on the wooded Asilomar grounds.",
      },
      {
        title: "RM Sotheby's Monterey Auction",
        url: RM,
        access: "ticketed",
        accessLabel: "Ticketed",
        day: "Day 1",
        description: "A long-standing Car Week tradition with a history of record-breaking results.",
      },
      { title: "Cadillac House", access: "private", accessLabel: "Private event", day: "Day 2" },
      { title: "House of Aston Martin", access: "private", accessLabel: "Private event", day: "Day 1" },
      { title: "Bugatti", access: "private", accessLabel: "Private event", day: "Day 1" },
    ],
  },
  {
    id: "august-14",
    iso: "2026-08-14",
    weekday: "Friday",
    date: "August 14",
    short: "Aug 14",
    events: [
      {
        title: "Werks Reunion Monterey",
        url: "https://www.werksreunion.com/monterey.cfm",
        access: "free",
        // Admission really is free; the $40 is parking, and burying that would
        // send someone to a "free" event with no cash on them. Organizer states
        // cash only.
        accessLabel: "Free for spectators · $40 parking, cash",
        startTime: "09:00",
        endTime: "15:00",
        admission: "cost-to-arrive",
        admissionNote:
          "Organizer states spectators are “free to attend”. Spectator parking is $40 per car and $20 per motorcycle, cash only; complimentary with an active Military ID. Check-in opens 7:00 a.m.",
        description:
          "Celebrating the 50th anniversary of the 924 and the transaxle Porsches, the feature cars for Werks Reunion 2026.",
      },
      { title: "Rolex Monterey Motorsports Reunion", url: REUNION, access: "ticketed", accessLabel: "Ticketed", day: "Day 3" },
      { title: "The Quail Auction — Broad Arrow", url: BROAD_ARROW, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
      { title: "Mecum Auction", url: MECUM, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
      { title: "Zenvo House", url: ZENVO, access: "ticketed", accessLabel: "Ticketed · by booking", day: "Day 4" },
      { title: "Pebble Beach RetroAuto", url: RETROAUTO, access: "ticketed", accessLabel: "Open to the public", day: "Day 2" },
      {
        title: "The Quail, A Motorsports Gathering",
        url: "https://www.peninsula.com/en/signature-events/events/motorsports",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "In its 23rd year: over a dozen automotive debuts, hundreds of rare vehicles, world-class cuisine and entertainment.",
      },
      { title: "Concours Village", url: VILLAGE, access: "free", accessLabel: "Free for spectators", day: "Day 2", startTime: "09:00", endTime: "18:00", admission: "confirmed-free", admissionNote: "Organizer states it is \u201copen to the public at no cost.\u201d Thursday 8:00 a.m.\u20136:00 p.m.; Friday and Saturday 9:00 a.m.\u20136:00 p.m.; Concours Sunday 8:00 a.m.\u20136:00 p.m. Across from the Pebble Beach Auctions at Forest Lake Road and Stevenson Drive." },
      { title: "RM Sotheby's Monterey Auction", url: RM, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
      {
        title: "Pacific Grove Rotary Concours Auto Rally",
        url: "https://pgrotary.org/annual-pacific-grove-concours-auto-rally/",
        access: "free",
        accessLabel: "Free for spectators",
        startTime: "10:00",
        admission: "confirmed-free",
        admissionNote:
          "Organizer calls it “one of the most popular free-to-spectator events.” Cars stage on Lighthouse Avenue from 10:00 a.m. and depart on the rally at 2:00 p.m., running Ocean View Boulevard and 17-Mile Drive.",
        description:
          "A rally drive along the Pacific Grove and Pebble Beach shoreline for vintage, classic, sports and luxury vehicles.",
      },
      { title: "Pebble Beach Classic Car Forum", url: FORUM, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
      {
        title: "The Paddock",
        url: "https://www.internationalcarweek.com/the-paddock",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "From the intriguingly quirky to the latest in innovation and mobility — a celebration of automotive diversity.",
      },
      { title: "Pebble Beach Auctions by Gooding Christie's", url: GOODING, access: "ticketed", accessLabel: "Ticketed", day: "Auction Day 1" },
      { title: "Cadillac House", access: "private", accessLabel: "Private event", day: "Day 3" },
      { title: "House of Aston Martin", access: "private", accessLabel: "Private event", day: "Day 2" },
      { title: "Bugatti", access: "private", accessLabel: "Private event", day: "Day 2" },
    ],
  },
  {
    id: "august-15",
    iso: "2026-08-15",
    weekday: "Saturday",
    date: "August 15",
    short: "Aug 15",
    events: [
      { title: "Rolex Monterey Motorsports Reunion", url: REUNION, access: "ticketed", accessLabel: "Ticketed", day: "Day 4" },
      {
        title: "Concours d'Lemons",
        url: "https://24hoursoflemons.com/concours-d-lemons/",
        access: "free",
        accessLabel: "Free for spectators",
        startTime: "08:00",
        endTime: "13:30",
        admission: "confirmed-free",
        admissionNote:
          "The organizer's own ticketing listing states “Spectators Free — Hoopties Must Register”: free to watch, registration only if you are bringing a car. 8:00 a.m.–1:30 p.m. at 440 Harcourt Avenue. (24hoursoflemons.com blocks automated reads; this is from their Eventbrite listing for the same event.)",
        description:
          "Hoopties of all description return to the Seaside City Hall lawn to compete for the coveted \u201cWorst of Show\u201d trophy.",
      },
      { title: "Mecum Auction", url: MECUM, access: "ticketed", accessLabel: "Ticketed", day: "Day 3" },
      { title: "Zenvo House", url: ZENVO, access: "ticketed", accessLabel: "Ticketed · by booking", day: "Day 5" },
      { title: "Concours Village", url: VILLAGE, access: "free", accessLabel: "Free for spectators", day: "Day 3", startTime: "09:00", endTime: "18:00", admission: "confirmed-free", admissionNote: "Organizer states it is \u201copen to the public at no cost.\u201d Thursday 8:00 a.m.\u20136:00 p.m.; Friday and Saturday 9:00 a.m.\u20136:00 p.m.; Concours Sunday 8:00 a.m.\u20136:00 p.m. Across from the Pebble Beach Auctions at Forest Lake Road and Stevenson Drive." },
      { title: "Pebble Beach RetroAuto", url: RETROAUTO, access: "ticketed", accessLabel: "Open to the public", day: "Day 3" },
      {
        title: "MBCA 70th Anniversary — Benzes at the Barnyard",
        url: "https://mbca.clubexpress.com/content.aspx?page_id=4002&club_id=860831&item_id=3017796",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "A showcase of every Mercedes-Benz from timeless classics to modern AMG icons, marking the club's 70th anniversary.",
      },
      {
        title: "Concorso Italiano",
        url: "https://www.internationalcarweek.com/concorso-italiano",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "800–1,000 vehicles of Italian origin plus food, music and art on the grounds of the Bayonet Black Horse Golf Course.",
      },
      {
        title: "Serata Campioni",
        url: "https://serataitaliana.com/monterey-car-week-events/",
        access: "ticketed",
        accessLabel: "Ticketed",
        description: "63 vintage and modern Lamborghinis competing for trophy-class titles.",
      },
      { title: "RM Sotheby's Monterey Auction", url: RM, access: "ticketed", accessLabel: "Ticketed", day: "Auction Day 2" },
      {
        // CORRECTED 2026-08-12. This was published as "Free for spectators" and
        // it is not: exoticsonbroadway.com sells $40 general admission (under-12s
        // free with a ticketed adult). Read directly from the organizer's site.
        title: "Exotics on Broadway",
        url: "https://www.exoticsonbroadway.com/",
        access: "ticketed",
        accessLabel: "Ticketed · $40 general admission",
        startTime: "11:00",
        endTime: "16:00",
        admissionNote:
          "$40 general admission; children under 12 enter free with a ticketed adult.",
        description: "Super, hyper and exotic cars — some of the rarest and most exciting machines of our time.",
      },
      { title: "Pebble Beach Auctions by Gooding Christie's", url: GOODING, access: "ticketed", accessLabel: "Ticketed", day: "Auction Day 2" },
      { title: "Pebble Beach Classic Car Forum", url: FORUM, access: "ticketed", accessLabel: "Ticketed", day: "Day 3" },
      {
        title: "Annual Ferrari Event at the Barnyard",
        url: "https://www.bigsurfoodandwine.org/popup-events/28th-annual-ferrari-event-at-the-barnyard",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "Vintage and new Ferraris with an outdoor wine reception in the terraced gardens of The Barnyard, benefiting Big Sur Food & Wine.",
      },
      {
        title: "Monterey Motorsports Festival",
        url: "https://montereymotorsportsfestival.com/",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "Curated car displays, a Supercar Drive-In, gourmet food and two stages of live music close out the week.",
      },
      {
        title: "Serata Italiana",
        url: "https://serataitaliana.com/serata-italiana/",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "An evening of Lamborghini lifestyle at the 36,000 sq ft Spanish colonial Club at Pasadera.",
      },
      { title: "Breakfast Club Rally x MCW", access: "private", accessLabel: "Registration only", description: "Not a spectator event; participation by approved registration only." },
      { title: "Cadillac House", access: "private", accessLabel: "Private event", day: "Day 4" },
      { title: "House of Aston Martin", access: "private", accessLabel: "Private event", day: "Day 3" },
      { title: "Bugatti", access: "private", accessLabel: "Private event", day: "Day 3" },
    ],
  },
  {
    id: "august-16",
    iso: "2026-08-16",
    weekday: "Sunday",
    date: "August 16",
    short: "Aug 16",
    events: [
      {
        title: "Pebble Beach Concours d'Elegance",
        url: "https://www.pebblebeachconcours.net/",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "The 75th Pebble Beach Concours d'Elegance at The Lodge at Pebble Beach — style icons, prototypes and racing greats competing for the top prize in the collector car world.",
      },
      { title: "Concours Village", url: VILLAGE, access: "free", accessLabel: "Free for spectators", day: "Day 4", startTime: "08:00", endTime: "18:00", admission: "confirmed-free", admissionNote: "Organizer states it is \u201copen to the public at no cost.\u201d Thursday 8:00 a.m.\u20136:00 p.m.; Friday and Saturday 9:00 a.m.\u20136:00 p.m.; Concours Sunday 8:00 a.m.\u20136:00 p.m. Across from the Pebble Beach Auctions at Forest Lake Road and Stevenson Drive." },
      { title: "Zenvo House", url: ZENVO, access: "ticketed", accessLabel: "Ticketed · by booking", day: "Day 6" },
      { title: "Pebble Beach RetroAuto", url: RETROAUTO, access: "ticketed", accessLabel: "Open to the public", day: "Day 4" },
      { title: "House of Aston Martin", access: "private", accessLabel: "Private event", day: "Day 4" },
      { title: "Bugatti", access: "private", accessLabel: "Private event", day: "Day 4" },
    ],
  },
];

export const totalEvents = schedule.reduce((n, d) => n + d.events.length, 0);

// countyofmonterey.gov is the current host. The old co.monterey.ca.us address
// still 301s here, but linking through a redirect on every event page is a
// wasted hop — confirmed 2026-08-12 that the old host returns 301 to this URL.
export const ROAD_CLOSURES_URL =
  "https://www.countyofmonterey.gov/government/departments-i-z/public-works-facilities-parks/public-works/road-closures-information";
