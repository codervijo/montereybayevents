export type Access = "free" | "ticketed" | "private";

export type CarEvent = {
  title: string;
  url?: string;
  access: Access;
  accessLabel: string;
  day?: string;
  description?: string;
};

export type DaySchedule = {
  id: string;
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
    weekday: "Friday",
    date: "August 7",
    short: "Aug 7",
    events: [
      {
        title: "Monterey Car Week Kick-Off",
        url: "https://www.seemonterey.com/event/monterey-car-week-kickoff/",
        access: "free",
        accessLabel: "Free admission",
        description:
          "A family-friendly opener: classic race cars, driver meet-and-greets, live music, giveaways and an atmosphere thick with anticipation.",
      },
      {
        title: "Racing to Del Monte & Pebble Beach",
        url: RACING_TO_DEL_MONTE,
        access: "free",
        accessLabel: "Exhibit",
        day: "Day 1",
        description:
          "An immersive exhibit on the birth of Monterey Bay automotive culture, with rare early racing vehicles, artifacts and memorabilia in partnership with History San Jose.",
      },
    ],
  },
  {
    id: "august-8",
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
        day: "Day 2",
      },
    ],
  },
  {
    id: "august-9",
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
        day: "Day 3",
      },
    ],
  },
  {
    id: "august-10",
    weekday: "Monday",
    date: "August 10",
    short: "Aug 10",
    events: [
      {
        title: "The Quail Rally",
        url: QUAIL_RALLY,
        access: "free",
        accessLabel: "Free for spectators",
        day: "Day 1",
        description:
          "A journey through the most breathtaking roads of the Monterey Peninsula, integrated with the week's most prestigious gatherings.",
      },
      {
        title: "Central Coast Poker Rally",
        url: "https://centralcoastpokerrally.com/about-us/",
        access: "free",
        accessLabel: "Paid registration · free showcase",
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
        description:
          "Over 80 classic and modern British cars on a lawn framed by the Santa Lucia Mountains. Aston Martins to Triumphs — no polishing required.",
      },
      {
        title: "Porsche Monterey Classic",
        url: "https://www.porschemonterey.com/dealership/porsche-monterey-classic-event.htm",
        access: "free",
        accessLabel: "Free admission",
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
        description:
          "Preview all lots at the Bonhams | Cars auction marquee, at its new home at WeatherTech Raceway Laguna Seca.",
      },
      { title: "The Quail Rally", url: QUAIL_RALLY, access: "free", accessLabel: "Free for spectators", day: "Day 2" },
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
    weekday: "Wednesday",
    date: "August 12",
    short: "Aug 12",
    events: [
      { title: "The Quail Rally", url: QUAIL_RALLY, access: "free", accessLabel: "Free for spectators", day: "Day 3" },
      {
        title: "Rolex Monterey Motorsports Reunion",
        url: REUNION,
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "A museum revving to life: hundreds of historic, period-correct race cars from nearly every era — raced in anger, not parked on a lawn.",
      },
      { title: "Zenvo House", url: ZENVO, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
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
        description: "52 Aston Martins line Ocean Avenue — the event's biggest turnout yet.",
      },
      {
        title: "The Little Car Show",
        url: "https://www.thelittlecarshow.com/",
        access: "free",
        accessLabel: "Free for spectators",
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
        accessLabel: "Free for spectators",
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
      { title: "Cadillac House", access: "private", accessLabel: "Invitation only", day: "Day 1" },
    ],
  },
  {
    id: "august-13",
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
        description:
          "Elegance in motion: more than 150 Concours entrants prove their roadworthiness along a scenic route on Highway One.",
      },
      {
        title: "Ferrari Owners Club 4th Annual Concours Carmel",
        url: "https://www.focnorcal.org/events/4th-annual-concours-carmel-2026-august-13-2026",
        access: "free",
        accessLabel: "Free for spectators",
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
      { title: "Zenvo House", url: ZENVO, access: "ticketed", accessLabel: "Ticketed", day: "Day 3" },
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
        accessLabel: "Paid spectator parking",
        description:
          "A premier all-German marque Concours d'Elegance returning for its 16th year to Pacific Grove Golf Links — Audi, BMW and Mercedes-Benz.",
      },
      {
        title: "Concours Village",
        url: VILLAGE,
        access: "free",
        accessLabel: "Free for spectators",
        day: "Day 1",
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
        accessLabel: "Free for spectators · free parking",
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
      { title: "House of Aston Martin", access: "private", accessLabel: "Invitation only", day: "Day 1" },
      { title: "Bugatti", access: "private", accessLabel: "Invitation only", day: "Day 1" },
    ],
  },
  {
    id: "august-14",
    weekday: "Friday",
    date: "August 14",
    short: "Aug 14",
    events: [
      {
        title: "Werks Reunion Monterey",
        url: "https://www.werksreunion.com/monterey.cfm",
        access: "free",
        accessLabel: "Free for spectators",
        description:
          "Celebrating the 50th anniversary of the 924 and the transaxle Porsches, the feature cars for Werks Reunion 2026.",
      },
      { title: "Rolex Monterey Motorsports Reunion", url: REUNION, access: "ticketed", accessLabel: "Ticketed", day: "Day 3" },
      { title: "The Quail Auction — Broad Arrow", url: BROAD_ARROW, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
      { title: "Mecum Auction", url: MECUM, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
      { title: "Zenvo House", url: ZENVO, access: "ticketed", accessLabel: "Ticketed", day: "Day 4" },
      { title: "Pebble Beach RetroAuto", url: RETROAUTO, access: "ticketed", accessLabel: "Open to the public", day: "Day 2" },
      {
        title: "The Quail, A Motorsports Gathering",
        url: "https://www.peninsula.com/en/signature-events/events/motorsports",
        access: "ticketed",
        accessLabel: "Ticketed",
        description:
          "In its 23rd year: over a dozen automotive debuts, hundreds of rare vehicles, world-class cuisine and entertainment.",
      },
      { title: "Concours Village", url: VILLAGE, access: "free", accessLabel: "Free for spectators", day: "Day 2" },
      { title: "RM Sotheby's Monterey Auction", url: RM, access: "ticketed", accessLabel: "Ticketed", day: "Day 2" },
      {
        title: "Pacific Grove Rotary Concours Auto Rally",
        url: "https://pgrotary.org/annual-pacific-grove-concours-auto-rally/",
        access: "free",
        accessLabel: "Free for spectators",
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
        description:
          "Hoopties of all description return to the Seaside City Hall lawn to compete for the coveted \u201cWorst of Show\u201d trophy.",
      },
      { title: "Mecum Auction", url: MECUM, access: "ticketed", accessLabel: "Ticketed", day: "Day 3" },
      { title: "Zenvo House", url: ZENVO, access: "ticketed", accessLabel: "Ticketed", day: "Day 5" },
      { title: "Concours Village", url: VILLAGE, access: "free", accessLabel: "Free for spectators", day: "Day 3" },
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
        title: "Exotics on Broadway",
        url: "https://www.exoticsonbroadway.com/",
        access: "free",
        accessLabel: "Free for spectators",
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
      { title: "Concours Village", url: VILLAGE, access: "free", accessLabel: "Free for spectators", day: "Day 4" },
      { title: "Zenvo House", url: ZENVO, access: "ticketed", accessLabel: "Ticketed", day: "Day 6" },
      { title: "Pebble Beach RetroAuto", url: RETROAUTO, access: "ticketed", accessLabel: "Open to the public", day: "Day 4" },
      { title: "House of Aston Martin", access: "private", accessLabel: "Private event", day: "Day 4" },
      { title: "Bugatti", access: "private", accessLabel: "Private event", day: "Day 4" },
    ],
  },
];

export const totalEvents = schedule.reduce((n, d) => n + d.events.length, 0);

export const ROAD_CLOSURES_URL =
  "https://www.co.monterey.ca.us/government/departments-i-z/public-works-facilities-parks/public-works/road-closures-information";
