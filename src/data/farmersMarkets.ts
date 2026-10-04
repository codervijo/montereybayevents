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

export type Production = "Organic" | "Conventional" | "Conventional / Organic" | "N/A";

/** One stall, exactly as the operator's vendor list prints it. */
export interface Vendor {
  name: string;
  town: string;
  /** "N/A" is the operator's own label — bakers, makers and prepared food. */
  production: Production;
}

export interface FarmersMarket {
  id: string;
  name: string;
  day: Weekday;
  /** One entry per seasonal block. A month in no block means closed that month. */
  hours: MarketHours[];
  /** True only when the operator says "year round" in its own words. */
  yearRound: boolean;
  venue: string;
  /** As the operator publishes it — not normalised into a street number it doesn't give. */
  streetAddress: string;
  postalCode: string;
  /** Where the stalls actually are, when the operator says. */
  locationNote?: string;
  organizer: { name: string; url: string };
  officialUrl: string;
  /** What the market is like, in the operator's terms. */
  about: string[];
  /** Published vendor list, when the operator has one. */
  vendors?: Vendor[];
  vendorsUrl?: string;
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

export const farmersMarkets: FarmersMarket[] = [
  {
    id: "old-monterey",
    name: "Old Monterey Marketplace & Farmers Market",
    day: "Tuesday",
    hours: [
      { months: [10, 11, 12, 1, 2, 3, 4], start: "16:00", end: "19:00" },
      { months: MAY_TO_SEP, start: "16:00", end: "20:00" },
    ],
    yearRound: true,
    venue: "Alvarado Street, downtown Monterey",
    streetAddress: "Alvarado Street, between Del Monte Avenue and Pearl Street",
    postalCode: "93940",
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
      "EBT / CalFresh: processed 8–11am at the Gatanaga Nursery booth — an hour before the market closes, not up to closing.",
      "Credit cards: buy Farmers Market Big Bucks with a card at the Information Booth. Every vendor takes them like cash.",
    ],
    seasonal: [
      "Open every Friday, year round, rain or shine.",
      "Knife and garden-tool sharpening runs 8–11:30am every Friday.",
    ],
    sources: [
      { label: "Monterey Bay Certified Farmers Markets — Monterey Farmers Market", url: MBCFM_FRIDAY },
      { label: "Monterey Bay Certified Farmers Markets — Services (EBT, Big Bucks)", url: MBCFM_SERVICES },
      { label: "Monterey Bay Certified Farmers Markets — Friday vendor list", url: MBCFM_FRIDAY_VENDORS },
    ],
  },
  {
    id: "del-monte-sunday",
    name: "Del Monte Farmers Market (Sunday)",
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

/** Checked and deliberately left off the page. */
export const skippedMarkets: { name: string; reason: string }[] = [
  {
    name: "Paseo Night Market (Fridays, Alvarado Mall)",
    reason:
      "Listed by the Old Monterey Business Association as a Good Roots Events market, but its day, hours and season could not be confirmed with Good Roots Events itself.",
  },
];

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
  const month = Number(iso.slice(5, 7));
  return market.hours.find((h) => h.months.includes(month)) ?? null;
}

export interface Session {
  market: FarmersMarket;
  date: string;
  hours: MarketHours;
}

export function sessionsOn(iso: string, markets = farmersMarkets): Session[] {
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
export function nextSessionAfter(iso: string, markets = farmersMarkets): Session | null {
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

export function inSeason(market: FarmersMarket, iso: string): boolean {
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
  return `${m.streetAddress}, Monterey, CA ${m.postalCode}`;
}

export function mapUrl(m: FarmersMarket): string {
  const q = m.streetAddress.startsWith("Alvarado")
    ? `Alvarado Street & Franklin Street, Monterey, CA ${m.postalCode}`
    : `${m.venue}, ${fullAddress(m)}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** The "open today" sentence, for `today` (defaults to the build's Pacific date). */
export function openTodayLine(today: string = pacificToday()): string {
  const now = sessionsOn(today);
  const day = formatDay(today);
  if (now.length) {
    return `Open today, ${day}: ${now
      .map((s) => `${s.market.name}, ${formatHours(s.hours)} at ${s.market.venue}`)
      .join("; ")}.`;
  }
  const next = nextSessionAfter(today);
  const nextText = next
    ? ` Next: ${formatDay(next.date)}, ${next.market.name}, ${formatHours(next.hours)} at ${next.market.venue}.`
    : "";
  return `No farmers market in Monterey today, ${day}.${nextText}`;
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
      endTime: `${h.end}:00`,
      scheduleTimezone: "America/Los_Angeles",
    })),
    location: {
      "@type": "Place",
      name: m.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: m.streetAddress,
        addressLocality: "Monterey",
        addressRegion: "CA",
        postalCode: m.postalCode,
        addressCountry: "US",
      },
    },
    organizer: { "@type": "Organization", name: m.organizer.name, url: m.organizer.url },
    url: m.officialUrl,
  };
  if (next) {
    const off = pacificOffsetOn(next.date);
    node.startDate = `${next.date}T${next.hours.start}:00${off}`;
    node.endDate = `${next.date}T${next.hours.end}:00${off}`;
  }
  return node;
}
