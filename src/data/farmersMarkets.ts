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
const MBCFM_SEASON_END = `${MBCFM}/market-news/last-market-days-of-the-season-carmel-del-monte-farmers-markets`;

const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MAY_TO_SEP = [5, 6, 7, 8, 9];

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
      { label: "Monterey Bay Certified Farmers Markets — Services (EBT, Big Bucks)", url: MBCFM_SERVICES },
    ],
  },
];

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

export function formatHours(h: MarketHours): string {
  return `${formatClock(h.start)}–${formatClock(h.end)}`;
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
