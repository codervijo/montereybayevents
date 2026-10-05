/**
 * Weekly farmers markets in the City of Monterey — backs /monterey-farmers-market/.
 *
 * SOURCING: every day, time and address below is from the market operator's own
 * site, checked on SOURCES_CHECKED. A market that could not be confirmed there is
 * left out entirely rather than listed from a roundup; see the page's "Sources"
 * line for what was skipped and why.
 *
 * Recurring, not dated. Unlike events.ts and events-2026.ts these rows carry a
 * weekly rule, and "which market is open today" is computed from it at BUILD
 * time — the daily rebuild Worker (workers/daily-rebuild/) keeps that current.
 * See src/lib/isPast.ts for why build time is the only "today" this site has.
 */
import { pacificToday } from "../lib/isPast";

export const SOURCES_CHECKED = "2026-10-03";

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** Hours that apply in a given set of calendar months (1 = January). */
export interface MarketHours {
  months: number[];
  /** 24h `HH:MM`, Pacific. */
  start: string;
  end: string;
}

export interface Source {
  label: string;
  url: string;
}

export type Production = "Organic" | "Conventional" | "Conventional / Organic" | "N/A" | "Farmer" | "Artisan";

/** One stall, exactly as the operator's vendor list prints it. */
export interface Vendor {
  name: string;
  /** Empty when the operator's list gives none. */
  town: string;
  /** "N/A" is the operator's own label — bakers, makers and prepared food. */
  production: Production;
}

export type County = "Monterey" | "Santa Cruz";

export interface FarmersMarket {
  id: string;
  name: string;
  county: County;
  city: string;
  /** Grouping on the county page; areas render in COUNTY_AREAS order. */
  area: string;
  /** Date this row was last checked against the operator's own page. */
  verified: string;
  day: Weekday;
  /** One entry per seasonal block. A month in no block means closed that month. */
  hours: MarketHours[];
  /** True only when the operator says "year round" in its own words. */
  yearRound: boolean;
  /**
   * Hard season bounds, when the operator publishes exact first and last dates
   * ("May 5–October 27"). Outside them the market is closed whatever `hours`
   * says, and the next season counts as unannounced until someone adds it.
   */
  seasonDates?: { from: string; to: string };
  /** Shown instead of a computed season when the operator states none. */
  seasonLabel?: string;
  /**
   * Appended wherever hours are shown, when the operator's own hours are
   * incomplete ("Winter 3–6pm" with no months given). Its presence also drops
   * endTime/endDate from the JSON-LD, since the closing time is not certain.
   */
  hoursCaveat?: string;
  venue: string;
  /** As the operator publishes it — not normalised into a street number it doesn't give. */
  streetAddress: string;
  /** Only when the operator (or venue) publishes it — never looked up elsewhere. */
  postalCode?: string;
  /** Pin for the map link when the address is a stretch of street rather than a point. */
  mapQuery?: string;
  /** Bus route and stop, exactly as the operator publishes them. */
  transit?: string;
  /** Where the stalls actually are, when the operator says. */
  locationNote?: string;
  organizer: { name: string; url: string };
  officialUrl: string;
  /** What the market is like, in the operator's terms. */
  about?: string[];
  /** Published vendor list, when the operator has one. */
  vendors?: Vendor[];
  vendorsUrl?: string;
  /** Replaces the standard caveat under the vendor list when the source needs its own. */
  vendorsNote?: string;
  parking: string[];
  payment: string[];
  seasonal: string[];
  sources: Source[];
}

const OMBA = "https://www.oldmonterey.org/farmers-market-old-monterey-marketplace";
const OMBA_EVENT = "https://www.oldmonterey.org/event/old-monterey-farmers-market";
const OMBA_PARKING =
  "https://www.oldmonterey.org/news/2026/09/temporary-change-parking-meter-payment-options-2026";
const CITY_PARKMOBILE =
  "https://monterey.gov/your_city_hall/departments/public_works/parking/parkmobile_app.php";
const MBCFM = "https://montereybayfarmers.org";
const MBCFM_FRIDAY = `${MBCFM}/markets-hours-2/monterey-farmers-market`;
const MBCFM_SUNDAY = `${MBCFM}/del-monte-farmers-market`;
const MBCFM_SERVICES = `${MBCFM}/about-us/services`;
const MBCFM_FRIDAY_VENDORS = `${MBCFM}/monterey-vendors`;
const MBCFM_SUNDAY_VENDORS = `${MBCFM}/monterey-farmers-rmarket/del-monte-vendors-sunday`;
const MBCFM_SEASON_END = `${MBCFM}/market-news/last-market-days-of-the-season-carmel-del-monte-farmers-markets`;

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MAY_TO_SEP = [5, 6, 7, 8, 9];

const v = (name: string, town: string, production: Production): Vendor => ({ name, town, production });

// Transcribed from MBCFM_FRIDAY_VENDORS on SOURCES_CHECKED, in the operator's order.
const FRIDAY_VENDORS: Vendor[] = [
  v("Amen Bee Products", "San Martin", "N/A"),
  v("Astone’s Protea", "Aptos", "Conventional"),
  v("Bay Area Orchids", "Half Moon Bay", "Conventional"),
  v("Bay Living Culinary", "Watsonville", "N/A"),
  v("Beckmann’s Old World Bakery", "Santa Cruz", "N/A"),
  v("Big Guy Organics", "Hollister", "Organic"),
  v("Belle Farms", "Watsonville", "Conventional"),
  v("Bigoli Fresh Artisan Pasta", "Sand City", "N/A"),
  v("Blue Heron Farms", "Watsonville", "Organic"),
  v("Borba Family Farms", "Aromas", "Organic"),
  v("Brokaw Ranch Company", "Santa Paula", "Conventional"),
  v("Cavanaugh Color Nursery", "Watsonville", "Conventional"),
  v("CE Farm", "Paicines", "Organic"),
  v("Clara’s Eggs Farm", "Watsonville", "Conventional"),
  v("Coastal View Farms", "Salinas", "Conventional"),
  v("Companion Bakeshop", "Santa Cruz", "N/A"),
  v("Cortez Farms", "Santa Maria", "Organic"),
  v("Donna Dirt Farms", "Santa Cruz", "Organic"),
  v("Fernandez Farms", "Hollister", "Conventional"),
  v("Fogline Farm", "Santa Cruz", "Organic"),
  v("Foustman’s Salami", "San Juan Bautista", "N/A"),
  v("Gatanaga Nursery", "Salinas", "Conventional"),
  v("Ichigo Farms", "Salinas", "Conventional"),
  v("Kirk Williams", "Soledad", "Conventional / Organic"),
  v("Kitchen Table Cultures", "Monterey", "Organic"),
  v("K T Farms", "Fresno", "Conventional"),
  v("La Marea of the Sea | Monterey", "Santa Cruz", "N/A"),
  v("Living Swell Kombucha", "Santa Cruz", "N/A"),
  v("Market Farms", "Watsonville", "Conventional"),
  v("MIF Seafood", "Seaside", "N/A"),
  v("Minazzoli Farms", "Stockton", "Conventional"),
  v("Munak Ranch", "Paso Robles", "Conventional"),
  v("Murakami Farms", "Watsonville", "Conventional"),
  v("New Natives | Greensward", "Watsonville", "Organic"),
  v("P & K Farms", "Watsonville", "Organic"),
  v("Pacific Rare Nursery", "Watsonville", "Conventional"),
  v("Phil Foster Ranch (Pinnacle)", "San Juan Bautista", "Organic"),
  v("Prevedelli Farms", "Watsonville", "Organic"),
  v("Pulido Farms", "Hollister", "Conventional"),
  v("Rancho Padre Farms", "Exeter", "Conventional"),
  v("Rocky Oaks Goat Creamery", "Clovis", "N/A"),
  v("Schletewitz Family Farms", "Sanger", "Conventional"),
  v("Schoch Family Farmstead", "Salinas", "N/A"),
  v("Spade & Plow Organics", "San Martin", "Organic"),
  v("Stackhouse Orchards", "Hickman", "Conventional"),
  v("Sumano Mushrooms", "San Juan Bautista", "Organic"),
  v("Sweet Elena’s Bakery", "Sand City", "N/A"),
  v("Wise Goat Organics", "Hollister", "N/A"),
  v("Zena Foods", "Sacramento", "N/A"),
];

// Transcribed from MBCFM_SUNDAY_VENDORS on SOURCES_CHECKED. "Minazolli" is the
// operator's spelling on this list; its Friday list spells it "Minazzoli".
const SUNDAY_VENDORS: Vendor[] = [
  v("Big Guy Organics", "Hollister", "Organic"),
  v("Gatanaga Nursery", "Salinas", "Conventional"),
  v("Minazolli Farms", "Stockton", "Conventional"),
  v("Munak Ranch", "Paso Robles", "Conventional"),
  v("P & K Farm", "Watsonville", "Organic"),
];

export const montereyCityMarkets: FarmersMarket[] = [
  {
    id: "old-monterey",
    name: "Old Monterey Marketplace & Farmers Market",
    county: "Monterey",
    city: "Monterey",
    area: "Monterey Peninsula",
    verified: "2026-10-03",
    day: "Tuesday",
    hours: [
      { months: [10, 11, 12, 1, 2, 3, 4], start: "16:00", end: "19:00" },
      { months: MAY_TO_SEP, start: "16:00", end: "20:00" },
    ],
    yearRound: true,
    venue: "Alvarado Street, downtown Monterey",
    streetAddress: "Alvarado Street, between Del Monte Avenue and Pearl Street",
    postalCode: "93940",
    mapQuery: "Alvarado Street & Franklin Street, Monterey, CA 93940",
    locationNote: "The market fills three and a half city blocks of Alvarado Street.",
    organizer: { name: "Old Monterey Business Association", url: "https://www.oldmonterey.org/" },
    officialUrl: OMBA,
    about: [
      "A street market as much as a farmers market. Running since 1991, it mixes certified and certified-organic produce — growers come from Salinas and Watsonville and from as far as Fresno and Sacramento — with arts and crafts, handmade jewelry, clothing, flowers and international food stalls: Indian, Japanese, Korean, Mexican, Mediterranean and barbecue, plus pastries and breads in what the association calls Baker’s Alley.",
      "It is also Monterey’s weekly social event. The association says that in summer it is the largest gathering of people in Monterey County, at more than 10,000 locals and visitors, with live music, SPCA dog adoptions and voter registration on some weeks, and costumed carolers in December.",
      "The event listing gives admission as free.",
    ],
    parking: [
      "Bicycle parking is provided along Alvarado Street — the association asks that you do not ride through the market itself.",
      "The association publishes no car-parking guidance for the market. Downtown parking is the City's: its lots and on-street meters take the ParkMobile app.",
      "From 1 October 2026 credit cards cannot be used at City parking meters, because the City's meter vendor stopped operating. Coins and ParkMobile still work. The City calls this temporary.",
    ],
    payment: [
      "The association does not publish whether stalls take cards or EBT/CalFresh. Bring cash and ask at the stall.",
    ],
    seasonal: [
      "Runs every Tuesday, year round, rain or shine.",
      "October through April it closes at 7pm; May through September it runs an hour later, to 8pm.",
    ],
    sources: [
      { label: "Old Monterey Business Association — The Farmers Market at Old Monterey Marketplace", url: OMBA },
      { label: "Old Monterey Business Association — market event listing", url: OMBA_EVENT },
      { label: "Old Monterey Business Association — parking meter payment change", url: OMBA_PARKING },
      { label: "City of Monterey — Pay by Phone with ParkMobile", url: CITY_PARKMOBILE },
    ],
  },
  {
    id: "monterey-friday",
    name: "Monterey Farmers Market (Friday)",
    county: "Monterey",
    city: "Monterey",
    area: "Monterey Peninsula",
    verified: "2026-10-03",
    day: "Friday",
    hours: [{ months: ALL_MONTHS, start: "08:00", end: "12:00" }],
    yearRound: true,
    venue: "Del Monte Shopping Center",
    streetAddress: "1410 Del Monte Center",
    postalCode: "93940",
    organizer: { name: "Monterey Bay Certified Farmers Markets", url: MBCFM },
    officialUrl: MBCFM_FRIDAY,
    about: [
      "The serious shopping market. The operator describes it as a bustling, fast-paced market of about fifty farmers and vendors, most certified organic or farming sustainably.",
      "What is sold, per the operator: pasture-raised meat and poultry, sustainable fish and oysters, handmade cheese, local olive oil, fresh pasta and sauces, juices, breads and pastries, honey, mushrooms, eggs, flowers, potted plants, seedlings and herbs, alongside California-grown fruit, vegetables and nuts.",
    ],
    vendors: FRIDAY_VENDORS,
    vendorsUrl: MBCFM_FRIDAY_VENDORS,
    parking: ["Free parking at the shopping center."],
    payment: [
      "EBT / CalFresh: the operator's site gives two different windows — 9–11am at a booth near the food vendors on its homepage, 8–11am at the Gatanaga Nursery booth on its services page. Come between 9 and 11 and you are covered by both; either way, EBT stops an hour before the market closes.",
      "Credit cards: buy Farmers Market Big Bucks with a card at the Information Booth. Every vendor takes them like cash.",
    ],
    seasonal: [
      "Open every Friday, year round, rain or shine.",
      "Knife and garden-tool sharpening runs 8–11:30am every Friday.",
    ],
    sources: [
      { label: "Monterey Bay Certified Farmers Markets — Monterey Farmers Market", url: MBCFM_FRIDAY },
      { label: "Monterey Bay Certified Farmers Markets — Services (EBT, Big Bucks)", url: MBCFM_SERVICES },
      { label: "Monterey Bay Certified Farmers Markets — homepage (EBT hours)", url: `${MBCFM}/` },
      { label: "Monterey Bay Certified Farmers Markets — Friday vendor list", url: MBCFM_FRIDAY_VENDORS },
    ],
  },
  {
    id: "del-monte-sunday",
    name: "Del Monte Farmers Market (Sunday)",
    county: "Monterey",
    city: "Monterey",
    area: "Monterey Peninsula",
    verified: "2026-10-03",
    day: "Sunday",
    hours: [{ months: MAY_TO_SEP, start: "08:00", end: "12:00" }],
    yearRound: false,
    venue: "Del Monte Shopping Center",
    streetAddress: "1410 Del Monte Center",
    postalCode: "93940",
    locationNote: "In the back parking area behind California Pizza Kitchen, just off Highway 1 and Munras Avenue.",
    organizer: { name: "Monterey Bay Certified Farmers Markets", url: MBCFM },
    officialUrl: MBCFM_SUNDAY,
    about: [
      "A small, relaxed early-morning market. The operator singles out cut flowers from Gatanaga Nursery, organic strawberries from P&K Farms, seasonal produce from Munak Ranch and Minazzoli Farms, and ready-to-eat food from Bay Living Culinary.",
      "Its published vendor list is five names long, so come for a few specific stalls rather than a big shop — the Friday market at the same address is the full-size one.",
    ],
    vendors: SUNDAY_VENDORS,
    vendorsUrl: MBCFM_SUNDAY_VENDORS,
    parking: ["Free parking at the shopping center."],
    payment: [
      "The operator's services page lists EBT/CalFresh and card-bought Big Bucks at its Friday Monterey market and Saturday Aptos market. It does not list them for this Sunday market.",
    ],
    seasonal: [
      "Seasonal: Sundays from May through the end of September, rain or shine.",
      "The 2026 season's final market was Sunday 27 September. The operator says it will be back next spring and has not published a 2027 opening date.",
    ],
    sources: [
      { label: "Monterey Bay Certified Farmers Markets — Del Monte Farmers Market", url: MBCFM_SUNDAY },
      { label: "Monterey Bay Certified Farmers Markets — last market days of the season", url: MBCFM_SEASON_END },
      { label: "Monterey Bay Certified Farmers Markets — Sunday vendor list", url: MBCFM_SUNDAY_VENDORS },
      { label: "Monterey Bay Certified Farmers Markets — Services (EBT, Big Bucks)", url: MBCFM_SERVICES },
    ],
  },
];

// ---------------------------------------------------------------------------
// The rest of Monterey County. Everyone's Harvest runs most of these; the
// others are run by a city, a park district, a chamber foundation, an
// historical society and MBCFM. Each checked on its operator's own page.

const EH = "https://www.everyonesharvest.org/farmers-markets";
const EH_ORG = { name: "Everyone's Harvest", url: "https://www.everyonesharvest.org/" };
const EH_BENEFITS = "Accepts EBT / CalFresh, WIC and Senior Farmers' Market Nutrition Program benefits.";
const EH_MATCH =
  "Market Match: every $1 of EBT is matched with $1 for fresh produce, up to $30 a day. Ask at the Information Booth.";
const MBCFM_CARMEL = `${MBCFM}/carmel-farmers-market`;

// Transcribed 2026-10-04 from MBCFM's Carmel vendor list, in its order.
const BARNYARD_VENDORS: Vendor[] = [
  v("Blue Heron", "Watsonville", "Organic"),
  v("Coastal Paradise Nursery", "Salinas", "Conventional"),
  v("Cortez Farms", "Santa Maria", "Conventional"),
  v("Gatanaga Nursery", "Salinas", "Conventional"),
  v("Kashiwase Farms", "Sanger", "Organic"),
  v("Kirk Williams", "Soledad", "Conventional"),
  v("Minazzoli Farms", "Stockton", "Conventional"),
  v("Munak Ranch", "Paso Robles", "Conventional"),
  v("P & K Farms", "Watsonville", "Organic"),
  v("Phil Foster Ranch (Pinnacle)", "San Juan Bautista", "Organic"),
  v("Sweet Elena’s Bakery", "Sand City", "N/A"),
  v("Triple Delight Blueberries", "Caruthers", "Conventional"),
];

export const montereyCountyOtherMarkets: FarmersMarket[] = [
  {
    id: "pacific-grove",
    name: "Pacific Grove Certified Farmers' Market",
    county: "Monterey",
    city: "Pacific Grove",
    area: "Monterey Peninsula",
    verified: "2026-10-03",
    day: "Monday",
    hours: [{ months: ALL_MONTHS, start: "15:00", end: "19:00" }],
    hoursCaveat: "6pm in winter",
    yearRound: true,
    venue: "Central Avenue & Grand Avenue",
    streetAddress: "Central Avenue & Grand Avenue",
    mapQuery: "Central Ave & Grand Ave, Pacific Grove, CA",
    organizer: EH_ORG,
    officialUrl: `${EH}/pacific-grove-certified-farmers-market/`,
    parking: [],
    payment: [],
    seasonal: [
      "Every Monday, year round, rain or shine, including holiday weekends.",
      "Winter hours are 3–6pm, but the operator does not say which months count as winter. Plan on a 6pm close from late autumn until spring and check the operator's page.",
    ],
    transit: "MST routes 1 and 2 via Asilomar from Monterey Transit Plaza; get off at Fountain and Lighthouse.",
    about: [
      "Everyone's Harvest has run Pacific Grove's market since 2008. Monday sellers in its directory include certified-organic Inzana Ranch and La Milpa, Lake Family Forest with mushrooms, microgreens and seedlings from Carmel Valley, Clara's Egg Farm, and food from Ad Astra Bread Co., Ely's Pupusas and Zum Zum Tea.",
    ],
    sources: [{ label: "Everyone's Harvest — Pacific Grove market", url: `${EH}/pacific-grove-certified-farmers-market/` }],
  },
  {
    id: "seaside",
    name: "Seaside Certified Farmers Market",
    county: "Monterey",
    city: "Seaside",
    area: "Monterey Peninsula",
    verified: "2026-10-03",
    day: "Thursday",
    hours: [{ months: ALL_MONTHS, start: "15:00", end: "19:00" }],
    yearRound: false,
    seasonLabel: "No season stated",
    venue: "Laguna Grande Regional Park",
    streetAddress: "1259 Canyon Del Rey Boulevard",
    postalCode: "93955",
    organizer: EH_ORG,
    officialUrl: `${EH}/seaside-certified-farmers-market/`,
    parking: ["Free parking next to the market, or across the street in the City Hall lot."],
    payment: [
      "Market Match is bigger here than at the operator's other markets: a City of Seaside grant raises it to $1.50 for every $1 of EBT, up to a $45 match a day. One older notice on the same page gives a different figure, so confirm at the Information Booth.",
    ],
    seasonal: [
      "Every Thursday. The operator's page gives no season; it was running, with live music, on 1 October 2026.",
    ],
    transit: "MST routes 20, A and B; get off at Del Monte or at Fremont.",
    about: [
      "The operator's newest market, opened in 2023 at Laguna Grande Regional Park and sponsored by the City of Seaside, which also pays for its bigger Market Match. Thursday sellers in the operator's directory include Gallardo Organic Farm, Jose's Flowers, Luna Dorada Organic Farm, Rodriguez Bros. Ranch and Stackhouse Brothers Orchards, with food from Ely's Pupusas and Mr. Falafel. Live music on some Thursdays.",
    ],
    sources: [{ label: "Everyone's Harvest — Seaside market", url: `${EH}/seaside-certified-farmers-market/` }],
  },
  {
    id: "marina",
    name: "Marina Certified Farmers' Market",
    county: "Monterey",
    city: "Marina",
    area: "Monterey Peninsula",
    verified: "2026-10-03",
    day: "Sunday",
    hours: [{ months: ALL_MONTHS, start: "10:00", end: "14:00" }],
    yearRound: true,
    venue: "Marina Village Shopping Center",
    streetAddress: "215 Reservation Road",
    locationNote: "At the corner of Vista Del Camino and Reservation Road.",
    organizer: EH_ORG,
    officialUrl: `${EH}/marina-certified-farmers-market/`,
    parking: [],
    payment: [],
    seasonal: ["Every Sunday, year round, rain or shine."],
    transit: "MST routes 18 and 20 via Marina Transit Exchange; get off at Marina Village Shopping Center.",
    about: [
      "The operator's first market, opened in 2003, and the largest roster in its directory. It is the one to visit for Asian vegetables: F.T. Fresh Produce grows more than 100 varieties, from squash, beans and tomatoes to Asian vegetables, guava and dates, and Moua's Produce is there every Sunday.",
    ],
    sources: [{ label: "Everyone's Harvest — Marina market", url: `${EH}/marina-certified-farmers-market/` }],
  },
  {
    id: "carmel-by-the-sea",
    name: "Carmel-by-the-Sea Farmers' Market",
    county: "Monterey",
    city: "Carmel-by-the-Sea",
    area: "Carmel",
    verified: "2026-10-03",
    day: "Thursday",
    hours: [{ months: ALL_MONTHS, start: "10:00", end: "14:00" }],
    yearRound: false,
    seasonLabel: "No season stated",
    venue: "Sixth Avenue, downtown Carmel",
    streetAddress: "Sixth Avenue between Junipero Street and Mission Street",
    mapQuery: "Sixth Ave & Mission St, Carmel-by-the-Sea, CA",
    organizer: { name: "Good Roots, Inc., listed by the City of Carmel-by-the-Sea", url: "https://ci.carmel.ca.us/farmers-market" },
    officialUrl: "https://ci.carmel.ca.us/farmers-market",
    parking: [],
    payment: ["Neither the City nor Good Roots publishes EBT or card arrangements for this market."],
    seasonal: [
      "Every Thursday. The City's page gives no season, but its 2026 events calendar lists the market's Third Thursday events on 17 September and 15 October.",
    ],
    about: [
      "The City lists certified organic produce, eggs, plants, cut flowers and specialty foods such as olive oil, hummus, pizza and bread. Sustainable Carmel is often on site to answer composting and recycling questions.",
      "Dogs are not allowed inside the market area — the City cites a Health Department requirement.",
    ],
    sources: [
      { label: "City of Carmel-by-the-Sea — Farmers' Market", url: "https://ci.carmel.ca.us/farmers-market" },
      { label: "City of Carmel-by-the-Sea — events calendar", url: "https://ci.carmel.ca.us/events" },
    ],
  },
  {
    id: "carmel-barnyard",
    name: "Carmel Farmers Market at The Barnyard",
    county: "Monterey",
    city: "Carmel",
    area: "Carmel",
    verified: "2026-10-03",
    day: "Tuesday",
    hours: [{ months: MAY_TO_SEP, start: "09:00", end: "13:00" }],
    yearRound: false,
    venue: "The Barnyard Shopping Village",
    streetAddress: "3690 The Barnyard",
    postalCode: "93923",
    locationNote: "Off Highway 1 at Carmel Valley Road.",
    organizer: { name: "Monterey Bay Certified Farmers Markets", url: MBCFM },
    officialUrl: MBCFM_CARMEL,
    parking: ["Free parking at the shopping village."],
    payment: ["The operator's services page lists EBT and card-bought Big Bucks only at its Friday Monterey and Saturday Aptos markets, not here."],
    seasonal: [
      "Seasonal: Tuesdays from May through September, rain or shine.",
      "The 2026 season's final market was Tuesday 29 September. The operator says it will be back next spring and has not published a 2027 opening date.",
    ],
    about: [
      "Intimate in scale, in the operator's words: a curated selection of California-grown produce, fresh-baked goods, cut flowers and potted plants, set among The Barnyard's brick-lined courtyards, garden paths and patios.",
    ],
    vendors: BARNYARD_VENDORS,
    vendorsUrl: `${MBCFM}/carmel-farmers-market/carmel-vendors`,
    sources: [
      { label: "MBCFM — Carmel Farmers Market", url: MBCFM_CARMEL },
      { label: "MBCFM — last market days of the season", url: MBCFM_SEASON_END },
    ],
  },
  {
    id: "oldtown-salinas",
    name: "Salinas Farmers Market (Oldtown)",
    county: "Monterey",
    city: "Salinas",
    area: "Salinas",
    verified: "2026-10-03",
    day: "Saturday",
    hours: [{ months: ALL_MONTHS, start: "09:00", end: "14:00" }],
    yearRound: false,
    seasonLabel: "Every Saturday, rain or shine",
    venue: "300 block of Main Street, Oldtown Salinas",
    streetAddress: "300 block of Main Street",
    mapQuery: "300 Main St, Salinas, CA",
    organizer: { name: "Salinas Valley Chamber of Commerce Foundation", url: "https://www.salinasfarmersmarket.com/" },
    officialUrl: "https://www.salinasfarmersmarket.com/oldtown-salinas-market",
    parking: [],
    payment: ["The operator publishes no EBT or Market Match arrangement for this market."],
    seasonal: [
      "Every Saturday, rain or shine. The operator does not use the words \"year round\", so this page does not either.",
      "New operator since July 2026: the Salinas Valley Chamber of Commerce Foundation took over the market from the Oldtown Salinas Foundation.",
    ],
    about: [
      "Running since January 2000; it outgrew its first site on West Gabilan Street. Salinas Valley farmers with certified organic produce, plus handmade soaps, cut flowers, crafts and hot and cold food, with tables and chairs and a local musician.",
      "The operator says it draws thousands every Saturday, and lists 29 of what it calls 80-plus artisans on its VIP Vendors page. It has a Spanish-language page, and the market manager takes calls and texts on (831) 287-9852.",
    ],
    sources: [
      { label: "Salinas Farmers Market — Oldtown market", url: "https://www.salinasfarmersmarket.com/oldtown-salinas-market" },
      { label: "Salinas Farmers Market — about (July 2026 ownership change)", url: "https://www.salinasfarmersmarket.com/about" },
    ],
  },
  {
    id: "alisal",
    name: "Alisal Certified Farmers' Market",
    county: "Monterey",
    city: "Salinas",
    area: "Salinas",
    verified: "2026-10-03",
    day: "Tuesday",
    hours: [{ months: [6, 7, 8, 9, 10], start: "11:00", end: "16:00" }],
    yearRound: false,
    seasonDates: { from: "2026-06-02", to: "2026-10-20" },
    venue: "Next to the WIC nutrition center, East Salinas",
    streetAddress: "632 E Alisal Street",
    postalCode: "93905",
    organizer: EH_ORG,
    officialUrl: `${EH}/alisal-certified-farmers-market/`,
    parking: ["Free parking next to the market."],
    payment: [],
    seasonal: [
      "Summer season: Tuesdays, 2 June to 20 October 2026, 11am–4pm.",
      "A winter season runs from 28 October 2026 into June 2027, but the operator has not published its day or hours yet — and 28 October is a Wednesday, so the day may change. This page lists only the summer schedule until it does.",
    ],
    transit: "MST routes 41 and 42 via Salinas Transit Center; get off at East Alisal and Wood.",
    about: [
      "Opened in 2010 beside the WIC nutrition center in East Salinas. It is small — the operator's directory lists five Tuesday sellers: Avalos Farm, J & J Ramos Farm, Ledesma Farm, Antojitos Mexicanos and Chava's Corn — and it runs cooking demonstrations.",
    ],
    sources: [{ label: "Everyone's Harvest — Alisal market", url: `${EH}/alisal-certified-farmers-market/` }],
  },
  {
    id: "natividad",
    name: "Natividad Certified Farmers' Market",
    county: "Monterey",
    city: "Salinas",
    area: "Salinas",
    verified: "2026-10-03",
    day: "Wednesday",
    hours: [{ months: ALL_MONTHS, start: "10:00", end: "14:30" }],
    yearRound: true,
    venue: "Natividad Medical Center, outside Building 200 (Outpatient Services)",
    streetAddress: "1441 Constitution Boulevard",
    postalCode: "93906",
    organizer: EH_ORG,
    officialUrl: `${EH}/natividad-certified-farmers-market/`,
    parking: ["Free parking in the Natividad Medical Center lot."],
    payment: [],
    seasonal: ["Every Wednesday, year round."],
    transit: "MST routes 41 and 46 via Salinas Transit Center; get off at Medical Center Drive and Hospital.",
    about: [
      "Hosted and funded by Natividad Medical Center since 2010. It is part of the operator's Fresh Rx program, in which doctors prescribe produce to young patients at risk of going without, redeemable for $35 of produce a week. Wednesday sellers include Gallardo Organic Farm, Golden Flowers, Rodriguez Bros. Ranch and Stackhouse Brothers Orchards.",
    ],
    sources: [{ label: "Everyone's Harvest — Natividad market", url: `${EH}/natividad-certified-farmers-market/` }],
  },
  {
    id: "salinas-valley-health",
    name: "Salinas Valley Health Certified Farmers' Market",
    county: "Monterey",
    city: "Salinas",
    area: "Salinas",
    verified: "2026-10-03",
    day: "Friday",
    hours: [{ months: [5, 6, 7, 8, 9, 10, 11], start: "11:30", end: "16:30" }],
    yearRound: false,
    seasonDates: { from: "2026-05-08", to: "2026-11-06" },
    venue: "Salinas Valley Memorial Hospital",
    streetAddress: "450 E Romie Lane",
    postalCode: "93901",
    organizer: EH_ORG,
    officialUrl: `${EH}/salinas-valley-health-certified-farmers-market/`,
    parking: ["Free parking next to the market."],
    payment: [],
    seasonal: [
      "Seasonal: Fridays from 8 May to 6 November 2026. The last market of the season is Friday 6 November.",
    ],
    transit: "MST route 43 via Salinas Transit Center; get off at East Romie Lane and Los Palos.",
    about: [
      "Opened in 2013 at Salinas Valley Memorial Hospital and funded by Salinas Valley Health, whose doctors prescribe produce through the same Fresh Rx program. Friday sellers include Golden Flowers, Ledesma Farm, Rodriguez Bros. Ranch, Stackhouse Brothers Orchards, Blazin' Bayou Barbecue, Coastal Kettlecorn and Tacos Don Beto.",
    ],
    sources: [{ label: "Everyone's Harvest — Salinas Valley Health market", url: `${EH}/salinas-valley-health-certified-farmers-market/` }],
  },
  {
    id: "castroville",
    name: "North County Farmers' Market (Castroville)",
    county: "Monterey",
    city: "Castroville",
    area: "North County",
    verified: "2026-10-03",
    day: "Thursday",
    hours: [{ months: ALL_MONTHS, start: "14:00", end: "19:00" }],
    yearRound: false,
    seasonLabel: "No season stated",
    venue: "North County Rec Center",
    streetAddress: "11261 Crane Street",
    postalCode: "95012",
    organizer: { name: "North County Recreation and Park District", url: "https://www.ncrpd.org/" },
    officialUrl: "https://www.ncrpd.org/2026-10-01-north-county-farmers-market",
    parking: [],
    payment: ["Accepts EBT, with a $15 Market Match program."],
    seasonal: ["Every Thursday. The district gives no season; its listing shows the market running on 1 October 2026."],
    about: [
      "Pitched by the district as a family outing: fresh organic fruit and vegetables and food from local vendors, with cooking demonstrations, a bounce house and a kids' arts and crafts table.",
    ],
    sources: [
      { label: "North County Recreation and Park District — farmers market", url: "https://www.ncrpd.org/2026-10-01-north-county-farmers-market" },
    ],
  },
  {
    id: "soledad",
    name: "Soledad Certified Farmers' Market",
    county: "Monterey",
    city: "Soledad",
    area: "Salinas Valley",
    verified: "2026-10-03",
    day: "Thursday",
    hours: [{ months: [4, 5, 6, 7, 8, 9], start: "16:00", end: "20:00" }],
    yearRound: false,
    venue: "Soledad Street, in front of the museum",
    streetAddress: "137 Soledad Street",
    postalCode: "93960",
    organizer: { name: "Soledad Historical Society", url: "https://www.soledadhistory.org/" },
    officialUrl: "https://www.soledadhistory.org/",
    parking: [],
    payment: ["The Historical Society publishes no EBT or card arrangement."],
    seasonal: [
      "Seasonal: Thursdays, April through September, 4–8pm. The 2026 season is over.",
      "The Historical Society has announced the 2027 season for April through September, Thursdays 4–8pm, without a first date.",
    ],
    about: [
      "Sponsored by the Soledad Historical Society, which calls it its major fundraiser — booth fees support the Society. It is held in front of the Society's museum in the old International Harvester building, which opens during market hours.",
    ],
    sources: [
      { label: "Soledad Historical Society", url: "https://www.soledadhistory.org/" },
      { label: "Soledad Historical Society — future events", url: "https://www.soledadhistory.org/future-events" },
    ],
  },
];

export const montereyCountyMarkets: FarmersMarket[] = [...montereyCityMarkets, ...montereyCountyOtherMarkets];

export const montereySkipped: { name: string; reason: string }[] = [
  {
    name: "Monterey Peninsula College (Fridays)",
    reason: "Not a separate market: the operator moved the Friday market from MPC to Del Monte Shopping Center in March 2020.",
  },
  {
    name: "Paseo Night Market (Fridays, Alvarado Mall)",
    reason:
      "Listed by the Old Monterey Business Association as a Good Roots Events market, but its day, hours and season could not be confirmed with Good Roots Events itself.",
  },
  {
    name: "Carmel Valley (Sundays, Mid Valley Shopping Center)",
    reason: "Its operator's website no longer resolves, so nothing could be confirmed from the operator.",
  },
  {
    name: "Salinas City Center market (Saturdays, Main Street)",
    reason:
      "A second state certificate on the same block as the Oldtown market; no operator page confirms it as a separate market.",
  },
  {
    name: "CSUMB (Seaside)",
    reason: "A spring-only campus market whose operator page could not be retrieved; out of season now either way.",
  },
  {
    name: "Greenfield and King City",
    reason: "No operator or city page found, and neither is on the state's July 2026 list of certified farmers markets.",
  },
];

// ---------------------------------------------------------------------------
// Santa Cruz County. Five markets run by Santa Cruz Community Farmers' Markets
// (SCCFM) and one by MBCFM, each checked on its operator's own page. SCCFM
// publishes no postal codes, so none are given — see `postalCode`.

const SCCFM = "https://santacruzfarmersmarket.org";
const SCCFM_HOME = `${SCCFM}/`;
const SCCFM_ORG = { name: "Santa Cruz Community Farmers' Markets", url: SCCFM_HOME };
const SCCFM_MARKET_MATCH =
  "Market Match: EBT is matched dollar for dollar in Market Match tokens for fruit and vegetables, up to $15 per visit.";
const SCCFM_EBT = "EBT / CalFresh: redeemed at the information booth with the market manager.";
const MBCFM_APTOS = `${MBCFM}/aptos-farmers-market`;
const MBCFM_APTOS_LOCATION = `${MBCFM}/aptos-farmers-market/aptos-location`;

// Transcribed 2026-10-04. Aptos: from MBCFM's Aptos vendor list, in its order.
// SCCFM markets: from SCCFM's vendor directory, which labels each vendor only
// Farmer or Artisan and tags the markets it attends.
const APTOS_VENDORS: Vendor[] = [
  v("Amen Bee Products", "San Martin", "N/A"),
  v("Astone’s Protea", "Aptos", "Conventional"),
  v("Bay Living Culinary", "Watsonville", "N/A"),
  v("Bay Area Orchids", "Half Moon Bay", "Conventional"),
  v("Beckmann’s Bakery", "Santa Cruz", "N/A"),
  v("Belle Farms", "Watsonville", "Conventional"),
  v("Bigoli Fresh Artisan Pasta", "Sand City", "N/A"),
  v("Blossom’s Farm", "Aromas", "Organic"),
  v("Blue Heron Farms", "Watsonville", "Organic"),
  v("Borba Family Farms", "Aromas", "Organic"),
  v("Brokaw Ranch Company", "Santa Paula", "Conventional"),
  v("Cabrillo College Horticulture", "Aptos", "Organic"),
  v("Cavanaugh Color", "Watsonville", "Conventional"),
  v("C E Farm", "Paicines", "Organic"),
  v("Clara’s Eggs Farm", "Watsonville", "Conventional"),
  v("Coastal Paradise Nursery", "Castroville", "Conventional"),
  v("Companion Bakeshop", "Aptos", "N/A"),
  v("Cortez Farms", "Santa Maria", "Conventional/Organic"),
  v("Donna Dirt Farms", "Santa Cruz", "Organic"),
  v("Fernandez Farms", "Hollister", "Conventional"),
  v("Fiji Wild Coffee", "Santa Cruz", "N/A"),
  v("Fogline Farm", "Soquel", "Organic"),
  v("Foustman’s Salami", "San Juan Bautista", "N/A"),
  v("Gatanaga Nursery, Inc.", "Salinas", "Conventional"),
  v("H & H Fresh Fish Company", "Santa Cruz", "N/A"),
  v("Hidden Fortress Coffee", "Watsonville", "N/A"),
  v("Hakouya Miso", "Aptos", "N/A"),
  v("Ichigo Farms", "Salinas", "Conventional"),
  v("Kashiwase Farms", "Sanger", "Organic"),
  v("Kirk Williams", "Soledad", "Conventional / Organic"),
  v("Kitchen Table Cultures", "Monterey", "N/A"),
  v("K T Farms", "Fresno", "Conventional"),
  v("La Marea of the Sea", "Corralitos", "N/A"),
  v("Lily’s Roasted Corn", "Watsonville", "N/A"),
  v("Living Swell Kombucha", "Santa Cruz", "N/A"),
  v("Market Farms", "Salinas", "Conventional"),
  v("MIF Seafood", "Seaside", "N/A"),
  v("Minazzoli Farms", "Stockton", "Conventional"),
  v("Molino Creek", "Davenport", "Organic"),
  v("Munak Ranch", "Paso Robles", "Conventional"),
  v("Murakami Farms", "Watsonville", "Conventional"),
  v("New Natives | Greensward", "Aptos", "Organic"),
  v("Northridge Farms", "Hollister", "Conventional"),
  v("P & K Farms", "Watsonville", "Organic"),
  v("Pacific Rare Plant Nursery", "Aptos", "Conventional"),
  v("Phil Foster Ranch (Pinnacle)", "Hollister", "Organic"),
  v("Prevedelli Farms", "Watsonville", "Organic"),
  v("Pulido Farms", "Hollister", "Conventional"),
  v("Rancho Padre Farms", "Exeter", "Conventional"),
  v("Rocky Oaks Goat Creamery", "Clovis", "N/A"),
  v("Rodoni Farms", "Santa Cruz", "Conventional"),
  v("Santa Rosa Flowers", "Watsonville", "Conventional"),
  v("Schletewitz Family Farms", "Sanger", "Conventional"),
  v("Schoch Family Farmstead", "Salinas", "N/A"),
  v("Spade & Plow Organics", "San Martin", "Organic"),
  v("Stackhouse Orchards", "Hickman", "Conventional"),
  v("Sumano Mushrooms", "San Juan Bautista", "Organic"),
  v("Sweet Elena’s Bakery", "Sand City", "N/A"),
  v("Triple Delight Blueberries", "Caruthers", "Conventional/Organic"),
  v("Trellis and Vine", "Santa Cruz", "N/A"),
  v("Wise Goat Organics", "Hollister", "N/A"),
  v("Zen Natural Foods", "Fresno", "N/A"),
  v("Zena Foods", "Sacramento", "N/A"),
];
const SCCFM_DIRECTORY = `${SCCFM}/vendors/`;
const SCCFM_DIRECTORY_NOTE =
  "From the operator's vendor directory, which is undated and does not include every stall its own market pages name.";
const DOWNTOWN_VENDORS: Vendor[] = [
  v("Apricot King Orchards", "Hollister", "Farmer"),
  v("Blossoms Farm", "Aromas and Moss Landing", "Farmer"),
  v("Blue Heron Farms", "Watsonville", "Farmer"),
  v("Brokaw Nursery", "Watsonville", "Farmer"),
  v("Casalegno Family Farm", "Soquel", "Farmer"),
  v("Cavanaugh Color", "Watsonville", "Farmer"),
  v("Companion Bakers", "Santa Cruz", "Artisan"),
  v("Delicious Crepes", "San Jose", "Artisan"),
  v("Dirty Girl Produce", "Santa Cruz", "Farmer"),
  v("Dos Hermanos Pupuseria", "Santa Cruz", "Artisan"),
  v("Flowers at the Sea", "Moss Landing", "Farmer"),
  v("Flying Disc Ranch", "Thermal", "Farmer"),
  v("Fogline Farm", "Santa Cruz", "Farmer"),
  v("Four Sisters Farm", "Aromas", "Farmer"),
  v("Garden Variety Cheese", "Royal Oaks", "Farmer"),
  v("Groundswell Farm", "Santa Cruz", "Farmer"),
  v("H & H Fresh Fish Co., Inc.", "", "Artisan"),
  v("Hakouya", "Santa Cruz", "Artisan"),
  v("Hidden Fortress Coffee Roasting", "Royal Oaks", "Artisan"),
  v("Il Biscotto", "Monterey", "Artisan"),
  v("India Gourmet", "", "Artisan"),
  v("JCG Farm", "Watsonville", "Farmer"),
  v("Kashiwase Farms", "Winton", "Farmer"),
  v("Ken’s Top Notch", "Reedly", "Farmer"),
  v("La Vie Pure Food Collective", "", "Artisan"),
  v("Live Earth Farm", "Watsonville", "Farmer"),
  v("Molino Creek Farm", "Davenport", "Farmer"),
  v("NahNa", "Boulder Creek", "Artisan"),
  v("New Natives", "Freedom", "Farmer"),
  v("Pacific Rare Plants", "Watsonville", "Farmer"),
  v("Penny Ice Creamery", "Sant Cruz", "Artisan"),
  v("Pinnacle Farm", "San Juan Bautista", "Farmer"),
  v("Rodoni Farms", "Santa Cruz", "Farmer"),
  v("RoliRoti Gourmet Rotisserie", "", "Artisan"),
  v("Santa Cruz Permaculture", "Santa Cruz", "Farmer"),
  v("Stackhouse Brothers Orchards", "Hickman", "Farmer"),
  v("Sumano’s Organic Mushrooms", "San Juan Bautista", "Farmer"),
  v("Switch Bakery", "Monterey", "Artisan"),
  v("Tía Beré", "Watsonville", "Artisan"),
  v("Triple Delight Blueberries", "Caruthers", "Farmer"),
  v("Twin Girls Farm", "", "Farmer"),
  v("Wild Stone Bakery", "Boulder Creek", "Artisan"),
];
const WESTSIDE_VENDORS: Vendor[] = [
  v("Apricot King Orchards", "Hollister", "Farmer"),
  v("Billy Bob Orchard", "Watsonville", "Farmer"),
  v("Blossoms Farm", "Aromas and Moss Landing", "Farmer"),
  v("Blue House Farm", "Pescadero", "Farmer"),
  v("Companion Bakers", "Santa Cruz", "Artisan"),
  v("Dos Hermanos Pupuseria", "Santa Cruz", "Artisan"),
  v("Epicenter", "La Selva", "Farmer"),
  v("Flowers at the Sea", "Moss Landing", "Farmer"),
  v("Flying Disc Ranch", "Thermal", "Farmer"),
  v("Fogline Farm", "Santa Cruz", "Farmer"),
  v("H & H Fresh Fish Co., Inc.", "", "Artisan"),
  v("Hakouya", "Santa Cruz", "Artisan"),
  v("Herman Ranches", "Madera", "Farmer"),
  v("Il Biscotto", "Monterey", "Artisan"),
  v("JCG Farm", "Watsonville", "Farmer"),
  v("Kashiwase Farms", "Winton", "Farmer"),
  v("Ken’s Top Notch", "Reedly", "Farmer"),
  v("La Vie Pure Food Collective", "", "Artisan"),
  v("Live Earth Farm", "Watsonville", "Farmer"),
  v("New Natives", "Freedom", "Farmer"),
  v("Pleasure Point Bakery", "Santa Cruz", "Artisan"),
  v("Rodoni Farms", "Santa Cruz", "Farmer"),
  v("Santa Cruz Balsalmics", "Capitola", "Artisan"),
  v("Santa Cruz Permaculture", "Santa Cruz", "Farmer"),
  v("Sumano’s Organic Mushrooms", "San Juan Bautista", "Farmer"),
  v("Switch Bakery", "Monterey", "Artisan"),
  v("Tía Beré", "Watsonville", "Artisan"),
  v("Triple Delight Blueberries", "Caruthers", "Farmer"),
  v("Twin Girls Farm", "", "Farmer"),
];
const LIVE_OAK_VENDORS: Vendor[] = [
  v("Beckmann’s Old World Bakery", "Santa Cruz", "Artisan"),
  v("Billy Bob Orchard", "Watsonville", "Farmer"),
  v("Blossoms Farm", "Aromas and Moss Landing", "Farmer"),
  v("Brokaw Nursery", "Watsonville", "Farmer"),
  v("Cavanaugh Color", "Watsonville", "Farmer"),
  v("Companion Bakers", "Santa Cruz", "Artisan"),
  v("Delicious Crepes", "San Jose", "Artisan"),
  v("Dirty Girl Produce", "Santa Cruz", "Farmer"),
  v("Dos Hermanos Pupuseria", "Santa Cruz", "Artisan"),
  v("Flowers at the Sea", "Moss Landing", "Farmer"),
  v("Fogline Farm", "Santa Cruz", "Farmer"),
  v("H & H Fresh Fish Co., Inc.", "", "Artisan"),
  v("Hakouya", "Santa Cruz", "Artisan"),
  v("Herman Ranches", "Madera", "Farmer"),
  v("Hidden Fortress Coffee Roasting", "Royal Oaks", "Artisan"),
  v("Il Biscotto", "Monterey", "Artisan"),
  v("JCG Farm", "Watsonville", "Farmer"),
  v("Kashiwase Farms", "Winton", "Farmer"),
  v("Ken’s Top Notch", "Reedly", "Farmer"),
  v("La Vie Pure Food Collective", "", "Artisan"),
  v("New Natives", "Freedom", "Farmer"),
  v("Pleasure Point Bakery", "Santa Cruz", "Artisan"),
  v("Rodoni Farms", "Santa Cruz", "Farmer"),
  v("Rooster Ridge Farm", "Aptos", "Farmer"),
  v("Santa Cruz Balsalmics", "Capitola", "Artisan"),
  v("Sea to Sky Farm", "Santa Cruz", "Farmer"),
  v("Serendipity Farms", "Aromas", "Farmer"),
  v("Stackhouse Brothers Orchards", "Hickman", "Farmer"),
  v("Sumano’s Organic Mushrooms", "San Juan Bautista", "Farmer"),
  v("Tía Beré", "Watsonville", "Artisan"),
  v("Tory Farm", "Dinuba", "Farmer"),
];
const SCOTTS_VALLEY_VENDORS: Vendor[] = [
  v("Beckmann’s Old World Bakery", "Santa Cruz", "Artisan"),
  v("Billy Bob Orchard", "Watsonville", "Farmer"),
  v("Casalegno Family Farm", "Soquel", "Farmer"),
  v("Companion Bakers", "Santa Cruz", "Artisan"),
  v("Dos Hermanos Pupuseria", "Santa Cruz", "Artisan"),
  v("Groundswell Farm", "Santa Cruz", "Farmer"),
  v("H & H Fresh Fish Co., Inc.", "", "Artisan"),
  v("Herman Ranches", "Madera", "Farmer"),
  v("Hidden Fortress Coffee Roasting", "Royal Oaks", "Artisan"),
  v("Il Biscotto", "Monterey", "Artisan"),
  v("JCG Farm", "Watsonville", "Farmer"),
  v("Ken’s Top Notch", "Reedly", "Farmer"),
  v("La Vie Pure Food Collective", "", "Artisan"),
  v("Laurel Canyon Farm", "Soquel", "Farmer"),
  v("Live Earth Farm", "Watsonville", "Farmer"),
  v("Rodoni Farms", "Santa Cruz", "Farmer"),
  v("Stackhouse Brothers Orchards", "Hickman", "Farmer"),
  v("Triple Delight Blueberries", "Caruthers", "Farmer"),
  v("Twins Kitchen", "Santa Cruz", "Artisan"),
];
const FELTON_VENDORS: Vendor[] = [
  v("Apricot King Orchards", "Hollister", "Farmer"),
  v("Beckmann’s Old World Bakery", "Santa Cruz", "Artisan"),
  v("Casalegno Family Farm", "Soquel", "Farmer"),
  v("Companion Bakers", "Santa Cruz", "Artisan"),
  v("Delicious Crepes", "San Jose", "Artisan"),
  v("Dos Hermanos Pupuseria", "Santa Cruz", "Artisan"),
  v("H & H Fresh Fish Co., Inc.", "", "Artisan"),
  v("Il Biscotto", "Monterey", "Artisan"),
  v("India Gourmet", "", "Artisan"),
  v("Kashiwase Farms", "Winton", "Farmer"),
  v("La Vie Pure Food Collective", "", "Artisan"),
  v("Live Earth Farm", "Watsonville", "Farmer"),
  v("Pacific Rare Plants", "Watsonville", "Farmer"),
  v("Penny Ice Creamery", "Sant Cruz", "Artisan"),
  v("Rodoni Farms", "Santa Cruz", "Farmer"),
  v("RoliRoti Gourmet Rotisserie", "", "Artisan"),
  v("Schletewitz Family Farm", "Sanger", "Farmer"),
  v("Stackhouse Brothers Orchards", "Hickman", "Farmer"),
  v("Triple Delight Blueberries", "Caruthers", "Farmer"),
  v("Twins Kitchen", "Santa Cruz", "Artisan"),
];

export const santaCruzCountyMarkets: FarmersMarket[] = [
  {
    id: "downtown-santa-cruz",
    name: "Downtown Santa Cruz Farmers' Market",
    county: "Santa Cruz",
    city: "Santa Cruz",
    area: "Santa Cruz",
    verified: "2026-10-03",
    day: "Wednesday",
    hours: [{ months: ALL_MONTHS, start: "12:30", end: "17:00" }],
    yearRound: true,
    venue: "Cedar Street & Church Street, downtown",
    streetAddress: "Cedar Street & Church Street",
    mapQuery: "Cedar St & Church St, Santa Cruz, CA",
    locationNote:
      "On Cedar Street from Walnut Avenue to Church Street, around the corner onto Church toward the library, plus the small parking lot there.",
    organizer: SCCFM_ORG,
    officialUrl: `${SCCFM}/markets/downtown-santa-cruz/`,
    parking: [],
    payment: ["You can enrol in CalFresh at the Downtown market on any Wednesday."],
    about: [
      "The operator's largest and oldest market, running since 1990 one block off Pacific Avenue. Many of its farms, the operator says, were and remain pillars of the organic and ecological farming movement.",
      "By the operator's account it also has the county's widest spread of cultural food: naan and curry, Argentinian empanadas, Eritrean dishes, Salvadoran pupusas, traditional Italian cookies, Oaxacan dishes and long-ferment breads and pastries.",
      "Two things only this market has: a free bike valet, and a Veggie Valet at the information booth that holds your bags while you fetch the car or keep shopping. There is no scheduled music downtown — buskers only.",
    ],
    vendors: DOWNTOWN_VENDORS,
    vendorsUrl: SCCFM_DIRECTORY,
    vendorsNote: SCCFM_DIRECTORY_NOTE,
    seasonal: [
      "Every Wednesday, year round, rain or shine.",
      "The market moved to Cedar and Church on 4 June 2025. The operator calls it home until a permanent market is built, which it expects to break ground in 2027 or 2028.",
    ],
    sources: [{ label: "SCCFM — Downtown Santa Cruz market", url: `${SCCFM}/markets/downtown-santa-cruz/` }],
  },
  {
    id: "westside-santa-cruz",
    name: "Westside Santa Cruz Farmers' Market",
    county: "Santa Cruz",
    city: "Santa Cruz",
    area: "Santa Cruz",
    verified: "2026-10-03",
    day: "Saturday",
    hours: [{ months: ALL_MONTHS, start: "09:00", end: "13:00" }],
    yearRound: true,
    venue: "Highway 1 & Western Drive",
    streetAddress: "Mission Street Extension & Western Drive",
    mapQuery: "Mission St Ext & Western Dr, Santa Cruz, CA",
    organizer: SCCFM_ORG,
    officialUrl: `${SCCFM}/markets/westside/`,
    parking: ["The operator describes \"an abundance of free parking\"."],
    payment: [],
    seasonal: ["Every Saturday, year round, rain or shine. Live music from 10am."],
    about: [
      "A community hub for nearly 20 years, serving the west end of Santa Cruz, Bonny Doon, the North Coast and UC Santa Cruz. Produce, artisan food, body products, garden starts, sustainable seafood, pasture-raised meat, flowers and eggs, plus cook-to-order meals and a full espresso bar run by Foolhardy Coffee.",
      "The operator pitches it as the start of a day out at Natural Bridges, Wilder Ranch or further up the coast. Four times a year a Gift Fair adds 10 to 12 local makers; the next date it lists is 12 December.",
    ],
    vendors: WESTSIDE_VENDORS,
    vendorsUrl: SCCFM_DIRECTORY,
    vendorsNote: SCCFM_DIRECTORY_NOTE,
    sources: [{ label: "SCCFM — Westside market", url: `${SCCFM}/markets/westside/` }],
  },
  {
    id: "live-oak",
    name: "Live Oak/Eastside Farmers' Market",
    county: "Santa Cruz",
    city: "Santa Cruz",
    area: "Live Oak",
    verified: "2026-10-03",
    day: "Sunday",
    hours: [{ months: ALL_MONTHS, start: "09:00", end: "13:00" }],
    yearRound: true,
    venue: "15th Avenue & East Cliff Drive, Live Oak",
    streetAddress: "15th Avenue & East Cliff Drive",
    mapQuery: "15th Ave & East Cliff Dr, Santa Cruz, CA",
    organizer: SCCFM_ORG,
    officialUrl: `${SCCFM}/markets/live-oakeastside/`,
    parking: [],
    payment: [],
    seasonal: [
      "Every Sunday, year round, rain or shine. Live music from 10am.",
      "Día de la Familia on the third Sunday of each month: Live Oak School District families and staff get a $10 produce-token gift, with a market hunt and face painting.",
    ],
    about: [
      "Started in 2000 and, in the operator's words, loved and depended on by Live Oak, Pleasure Point and Capitola — busy with families, cyclists and beachgoers. Tree-ripened fruit, greens, bread, nuts and legumes, sustainable seafood, pasture-raised organic meat and flowers.",
      "It is the county's Sunday brunch market: Michoacán dishes, focaccia breakfast sandwiches from Melrose, crepes and pupusas, with coffee from Watsonville's Hidden Fortress.",
    ],
    vendors: LIVE_OAK_VENDORS,
    vendorsUrl: SCCFM_DIRECTORY,
    vendorsNote: SCCFM_DIRECTORY_NOTE,
    sources: [{ label: "SCCFM — Live Oak/Eastside market", url: `${SCCFM}/markets/live-oakeastside/` }],
  },
  {
    id: "aptos-cabrillo",
    name: "Aptos Farmers Market at Cabrillo College",
    county: "Santa Cruz",
    city: "Aptos",
    area: "Aptos",
    verified: "2026-10-03",
    day: "Saturday",
    hours: [{ months: ALL_MONTHS, start: "08:00", end: "12:00" }],
    yearRound: true,
    venue: "Cabrillo College",
    streetAddress: "6500 Soquel Drive",
    postalCode: "95003",
    organizer: { name: "Monterey Bay Certified Farmers Markets", url: MBCFM },
    officialUrl: MBCFM_APTOS,
    parking: ["Free parking at the college."],
    payment: [
      "EBT / CalFresh: processed on the market's second level — 9–11am according to the operator's homepage, 8–11am according to its services page. Come between 9 and 11 to be covered by both.",
      "Credit cards: buy Farmers Market Big Bucks at the Information Booth. Every vendor takes them like cash.",
    ],
    seasonal: [
      "Every Saturday, year round, rain or shine.",
      "Knife and garden-tool sharpening runs 8–11:30am every Saturday.",
    ],
    about: [
      "The operator says it has nearly 90 vendors: produce, flowers and specialty foods from small regional farms and makers, many certified organic or sustainable — eggs, cheese, seafood, olive oil, baked goods, fermented foods, mushrooms, plants and cut flowers.",
      "By the operator's account it was voted America's Favorite Farmers Market in California three years running, 2011 to 2013, and was named Best Farmers Market in Good Times' 2025 Best of Santa Cruz County.",
    ],
    vendors: APTOS_VENDORS,
    vendorsUrl: `${MBCFM}/aptos-farmers-market/aptos-vendors`,
    sources: [
      { label: "MBCFM — Aptos Farmers Market", url: MBCFM_APTOS },
      { label: "MBCFM — Aptos vendor list", url: `${MBCFM}/aptos-farmers-market/aptos-vendors` },
      { label: "MBCFM — Aptos location", url: MBCFM_APTOS_LOCATION },
      { label: "MBCFM — Services (EBT, Big Bucks)", url: MBCFM_SERVICES },
      { label: "MBCFM — homepage (EBT hours)", url: `${MBCFM}/` },
    ],
  },
  {
    id: "scotts-valley",
    name: "Scotts Valley Farmers' Market",
    county: "Santa Cruz",
    city: "Scotts Valley",
    area: "Scotts Valley",
    verified: "2026-10-03",
    day: "Saturday",
    hours: [{ months: [5, 6, 7, 8, 9, 10, 11], start: "08:00", end: "12:00" }],
    yearRound: false,
    seasonDates: { from: "2026-05-02", to: "2026-11-21" },
    venue: "Graham Plaza",
    streetAddress: "219 Mount Hermon Road",
    organizer: SCCFM_ORG,
    officialUrl: `${SCCFM}/markets/scotts-valley/`,
    parking: [],
    payment: [],
    seasonal: [
      "Seasonal: Saturdays from 2 May to 21 November 2026. The last market of the season is Saturday 21 November.",
      "New location since 27 June 2026: the market moved to Graham Plaza ahead of renovation work at its old site, the Boys and Girls Club.",
    ],
    about: [
      "Started in 2009 with the City of Scotts Valley. Organic vegetables, fruit, herbs, pasture-raised eggs, flowers, meat, bread, seafood, pastries, an espresso bar and ready-to-eat food, with a local band every week.",
    ],
    vendors: SCOTTS_VALLEY_VENDORS,
    vendorsUrl: SCCFM_DIRECTORY,
    vendorsNote: SCCFM_DIRECTORY_NOTE,
    sources: [{ label: "SCCFM — Scotts Valley market", url: `${SCCFM}/markets/scotts-valley/` }],
  },
  {
    id: "felton",
    name: "Felton Farmers' Market",
    county: "Santa Cruz",
    city: "Felton",
    area: "San Lorenzo Valley",
    verified: "2026-10-03",
    day: "Tuesday",
    hours: [{ months: [5, 6, 7, 8, 9, 10], start: "13:30", end: "17:30" }],
    yearRound: false,
    seasonDates: { from: "2026-05-05", to: "2026-10-27" },
    venue: "Downtown Felton, on Highway 9",
    streetAddress: "120 Russell Avenue",
    organizer: SCCFM_ORG,
    officialUrl: `${SCCFM}/markets/felton/`,
    parking: [],
    payment: [],
    seasonal: [
      "Seasonal: Tuesdays from 5 May to 27 October 2026. The last market of the season is Tuesday 27 October.",
      "The operator cancels the Felton market when it reaches 95°F or the National Weather Service issues a Heat Advisory or Excessive Heat Warning. Check before you go on a hot day.",
    ],
    about: [
      "Running since 1987, the second-longest-running market in the county; SCCFM took it over in 2009. A family market for the San Lorenzo Valley, with a local band each week.",
      "Farms the operator names include Casalegno, a centennial family farm (heritage garlic, beans, summer squash, heirloom tomatoes, early pears), Triple Delight for blueberries in late spring, Rodoni, Live Earth, Kashiwase and Stackhouse. Food includes H&H Fresh Fish, RoliRoti rotisserie chicken, Penny Ice Creamery, Beckmann's and Companion bakeries, Pakistani food from Roti and blue and yellow corn tortillas from Mexy.",
    ],
    vendors: FELTON_VENDORS,
    vendorsUrl: SCCFM_DIRECTORY,
    vendorsNote: SCCFM_DIRECTORY_NOTE,
    sources: [{ label: "SCCFM — Felton market", url: `${SCCFM}/markets/felton/` }],
  },
];

export const santaCruzSkipped: { name: string; reason: string }[] = [
  {
    name: "Watsonville Farmers' Market (City Plaza, Fridays)",
    reason:
      "No operator site (the market's website is a placeholder and it links only to Instagram), and the City of Watsonville's own pages disagree on the hours — 2–7pm on one, 2–9pm on another.",
  },
  {
    name: "El Mercado Popular (Santa Cruz County Fairgrounds, Sundays)",
    reason:
      "Listed only by the Fairgrounds as the venue; the operator has no site of its own and does not describe it as a certified farmers market.",
  },
  {
    name: "Capitola",
    reason: "No operator or City of Capitola page shows a farmers market running in 2026.",
  },
];

// ---------------------------------------------------------------------------
// Operators. Rules that hold across all of one operator's markets — EBT,
// Market Match, holiday closures — are written once here and rendered once per
// page, instead of being repeated under every market. A market's own `payment`
// carries only what differs from its operator's rule.

export interface OperatorNote {
  name: string;
  url: string;
  notes: string[];
  sources: Source[];
}

/** Keyed by `organizer.url`. Operators with a single market need no entry. */
export const OPERATOR_NOTES: Record<string, OperatorNote> = {
  [EH_ORG.url]: {
    name: EH_ORG.name,
    url: EH_ORG.url,
    notes: [
      "A nonprofit founded in 2002 that runs six markets in Monterey County. It says more than half its farmers are certified organic and come from within 100 miles.",
      `${EH_BENEFITS} SunBucks are accepted too.`,
      `${EH_MATCH} Seaside's match is larger — see that market.`,
      "Fresh Rx: at the Natividad and Salinas Valley Health markets, patients whose doctors prescribe produce redeem it for $35 of fruit and vegetables a week.",
      "Only service animals are allowed. The operator asks that pets be walked around the outside of the market, on the sidewalk.",
      "Its Pacific Grove, Marina, Alisal and Natividad pages say they close for about two weeks around Christmas and New Year's Day; the open-today line at the top of this page does not know those dates.",
    ],
    sources: [{ label: "Everyone's Harvest", url: EH_ORG.url }],
  },
  [SCCFM_ORG.url]: {
    name: SCCFM_ORG.name,
    url: SCCFM_ORG.url,
    notes: [
      "A nonprofit that came together in autumn 1990, after the Loma Prieta earthquake, and now runs five certified markets representing more than 100 family farms, food makers and artisans.",
      SCCFM_EBT,
      SCCFM_MARKET_MATCH,
      "WIC and Senior Nutrition coupons are taken by eligible farms at all its markets from May to December. EBT tokens are worth $1 each and no change is given.",
      "Certified means certified by the state to sell at a certified farmers market — the operator stresses that it does not mean certified organic.",
      "The operator publishes no pet policy.",
    ],
    sources: [{ label: "Santa Cruz Community Farmers' Markets", url: SCCFM_ORG.url }],
  },
  [MBCFM]: {
    name: "Monterey Bay Certified Farmers Markets",
    url: MBCFM,
    notes: [
      "EBT / CalFresh and card-bought Big Bucks are offered only at its Friday Monterey market and its Saturday Aptos market, and only until 11am. Its homepage and its services page disagree on the start, 9am against 8am, so come between 9 and 11.",
      "Big Bucks are bought with a credit card at the Information Booth and every vendor takes them like cash.",
      "Founded in 1976, it requires its farmers to sell only what they grow themselves.",
      "Animals are not allowed except service animals, which the operator attributes to the California Health and Safety Code.",
    ],
    sources: [
      { label: "MBCFM — Services (EBT, Big Bucks)", url: MBCFM_SERVICES },
      { label: "MBCFM — homepage (EBT hours)", url: `${MBCFM}/` },
    ],
  },
};

/**
 * What MBCFM said was arriving on market tables in its end-of-season post
 * (late September 2026). Dated, because it is a reading, not a rule.
 */
export const FALL_PRODUCE = {
  asOf: "late September 2026",
  items: [
    "apples", "pears", "persimmons", "pomegranates", "Brussels sprouts",
    "winter squash", "pumpkins", "eggplants", "nuts", "dried fruit",
  ],
  source: { label: "Monterey Bay Certified Farmers Markets — last market days of the season", url: MBCFM_SEASON_END },
};

/** The same operator's other year-round market — outside Monterey, in Aptos (Santa Cruz County). */
export const NEARBY_YEAR_ROUND = {
  name: "Aptos Farmers Market at Cabrillo College",
  day: "Saturday" as Weekday,
  hours: "8am–noon",
  url: `${MBCFM}/aptos-farmers-market`,
  source: { label: "Monterey Bay Certified Farmers Markets — last market days of the season", url: MBCFM_SEASON_END },
};

/** MBCFM's pet rule, printed on its market pages. OMBA publishes none. */
export const PET_RULE = {
  text: "Per California Health and Safety Code, animals are prohibited at certified farmers markets except for service animals.",
  source: { label: "Monterey Bay Certified Farmers Markets — Del Monte Farmers Market", url: MBCFM_SUNDAY },
};

// ---------------------------------------------------------------------------
// Date helpers. All dates are `YYYY-MM-DD` strings in America/Los_Angeles.

/** Weekday of a `YYYY-MM-DD`. Noon UTC keeps it clear of any DST edge. */
export function weekdayOf(iso: string): Weekday {
  const js = new Date(`${iso}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  return WEEKDAYS[(js + 6) % 7];
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The hours that apply to `market` on `iso`, or null if it does not run that day. */
export function sessionOn(market: FarmersMarket, iso: string): MarketHours | null {
  if (weekdayOf(iso) !== market.day) return null;
  if (!withinSeasonDates(market, iso)) return null;
  const month = Number(iso.slice(5, 7));
  return market.hours.find((h) => h.months.includes(month)) ?? null;
}

export interface Session {
  market: FarmersMarket;
  date: string;
  hours: MarketHours;
}

export function sessionsOn(iso: string, markets: FarmersMarket[] = montereyCityMarkets): Session[] {
  return markets.flatMap((market) => {
    const hours = sessionOn(market, iso);
    return hours ? [{ market, date: iso, hours }] : [];
  });
}

/**
 * The next session strictly after `iso`, looking no more than two weeks ahead.
 * The cap is deliberate: past it, the only market that would be found is an
 * out-of-season one, and its reopening date is not published — projecting the
 * weekly rule into next May would print a date nobody has announced.
 */
export function nextSessionAfter(iso: string, markets: FarmersMarket[] = montereyCityMarkets): Session | null {
  for (let i = 1; i <= 14; i++) {
    const s = sessionsOn(addDays(iso, i), markets);
    if (s.length) return s[0];
  }
  return null;
}

/** Next session of one market on or after `iso`, within two weeks — same cap as above. */
export function nextSessionOf(market: FarmersMarket, iso: string): Session | null {
  for (let i = 0; i <= 14; i++) {
    const date = addDays(iso, i);
    const hours = sessionOn(market, date);
    if (hours) return { market, date, hours };
  }
  return null;
}

function withinSeasonDates(market: FarmersMarket, iso: string): boolean {
  const b = market.seasonDates;
  return !b || (iso >= b.from && iso <= b.to);
}

export function inSeason(market: FarmersMarket, iso: string): boolean {
  if (!withinSeasonDates(market, iso)) return false;
  const month = Number(iso.slice(5, 7));
  return market.hours.some((h) => h.months.includes(month));
}

// ---------------------------------------------------------------------------
// Formatting.

/** "16:00" → "4pm", "08:30" → "8:30am", "12:00" → "noon". */
export function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (h === 12 && m === 0) return "noon";
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, "0")}${suffix}` : `${h12}${suffix}`;
}

/** "4–7pm", "8am–noon", "10:30am–2pm" — the suffix is written once when both ends share it. */
export function formatHours(h: MarketHours): string {
  const a = formatClock(h.start);
  const b = formatClock(h.end);
  const sameSuffix = /[ap]m$/.test(a) && a.slice(-2) === b.slice(-2);
  return `${sameSuffix ? a.slice(0, -2) : a}–${b}`;
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** [10,11,12,1,2,3,4] → "Oct–Apr". Assumes a contiguous (possibly wrapping) run. */
/** Hours for display, with the operator's caveat when its hours are incomplete. */
export function marketHoursText(m: FarmersMarket, h: MarketHours): string {
  return m.hoursCaveat ? `${formatHours(h)} (${m.hoursCaveat})` : formatHours(h);
}

export function monthSpan(months: number[]): string {
  if (months.length === 12) return "year round";
  return `${MONTH_ABBR[months[0] - 1]}–${MONTH_ABBR[months[months.length - 1] - 1]}`;
}

/** "Saturday 3 October" */
export function formatDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  const month = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  return `${weekdayOf(iso)} ${d.getUTCDate()} ${month}`;
}

export function fullAddress(m: FarmersMarket): string {
  return `${m.streetAddress}, ${m.city}, CA${m.postalCode ? ` ${m.postalCode}` : ""}`;
}

/** Map pin query. `mapQuery` overrides when the published address is a range, not a point. */
export function mapUrl(m: FarmersMarket): string {
  const q = m.mapQuery ?? `${m.venue}, ${fullAddress(m)}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** The "open today" sentence for `markets`, naming them as being "in {place}". */
export function openTodayLine(
  today: string = pacificToday(),
  markets: FarmersMarket[] = montereyCityMarkets,
  place = "Monterey",
): string {
  const now = sessionsOn(today, markets);
  const day = formatDay(today);
  if (now.length) {
    return `Open today, ${day}: ${now
      .map((s) => `${s.market.name}, ${marketHoursText(s.market, s.hours)} at ${s.market.venue}${s.market.city === place ? "" : `, ${s.market.city}`}`)
      .join("; ")}.`;
  }
  const next = nextSessionAfter(today, markets);
  const nextText = next
    ? ` Next: ${formatDay(next.date)}, ${next.market.name}, ${marketHoursText(next.market, next.hours)} at ${next.market.venue}${next.market.city === place ? "" : `, ${next.market.city}`}.`
    : "";
  return `No farmers market in ${place} today, ${day}.${nextText}`;
}

// ---------------------------------------------------------------------------
// JSON-LD.

/** UTC offset in effect in Monterey on `iso` — real DST rules, not a fixed year. */
export function pacificOffsetOn(iso: string): string {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date(`${iso}T12:00:00Z`))
    .find((p) => p.type === "timeZoneName")?.value;
  return name?.replace("GMT", "") || "-08:00";
}

type JsonLd = Record<string, unknown>;

/**
 * One Event per market. The recurrence is carried by `eventSchedule` — one
 * Schedule per seasonal block, so Old Monterey's two closing times are both
 * stated. `startDate`/`endDate` are the next session computed from that same
 * published rule, and are omitted when the market is out of season, because its
 * reopening date has not been announced.
 */
export function buildMarketJsonLd(m: FarmersMarket, today: string = pacificToday()): JsonLd {
  const next = nextSessionOf(m, today);
  const node: JsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: m.name,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    eventSchedule: m.hours.map((h) => ({
      "@type": "Schedule",
      repeatFrequency: "P1W",
      byDay: `https://schema.org/${m.day}`,
      ...(h.months.length < 12 ? { byMonth: h.months } : {}),
      startTime: `${h.start}:00`,
      ...(m.hoursCaveat ? {} : { endTime: `${h.end}:00` }),
      scheduleTimezone: "America/Los_Angeles",
    })),
    location: {
      "@type": "Place",
      name: m.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: m.streetAddress,
        addressLocality: m.city,
        addressRegion: "CA",
        ...(m.postalCode ? { postalCode: m.postalCode } : {}),
        addressCountry: "US",
      },
    },
    organizer: { "@type": "Organization", name: m.organizer.name, url: m.organizer.url },
    url: m.officialUrl,
  };
  if (next) {
    const off = pacificOffsetOn(next.date);
    node.startDate = `${next.date}T${next.hours.start}:00${off}`;
    if (!m.hoursCaveat) node.endDate = `${next.date}T${next.hours.end}:00${off}`;
  }
  return node;
}
