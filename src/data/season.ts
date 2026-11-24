/**
 * Car Week season — the window in which Car Week notices render.
 *
 * Month-day, inclusive, applied to whatever year it is, so nothing here needs
 * editing when the year turns. Change the range here and every gated notice
 * moves with it.
 *
 * Gated (v2.R): every "Text CARWEEK" mention — site footer, the /traffic/
 * live-sources card and transit entry, the sentence in the Car Week hub's
 * "Before you drive" block — and the Car Week paragraph at the foot of every
 * regional event page. Navigation links, listings and the Car Week pages themselves
 * are not notices and are not gated.
 *
 * Evaluated at BUILD time, like src/lib/isPast.ts. The daily rebuild Worker
 * (workers/daily-rebuild/) is what turns the notices on each 1 July and off
 * each 1 September; without it they would stay frozen at the last push.
 */
import { pacificToday } from "../lib/isPast";

export const CAR_WEEK_SEASON = { from: "07-01", to: "08-31" } as const;

/** True when `today` (YYYY-MM-DD, Pacific) falls inside the season, any year. */
export function inCarWeekSeason(today: string = pacificToday()): boolean {
  const md = today.slice(5);
  return md >= CAR_WEEK_SEASON.from && md <= CAR_WEEK_SEASON.to;
}

/**
 * Holiday season (v2.S) — the window in which the header nav shows "Holidays"
 * in place of "Car Week". Car Week stays reachable from the footer all year.
 *
 * Month-day, inclusive, and it WRAPS the year: Nov 1 → Jan 4. Same build-time
 * evaluation and daily-rebuild dependency as the Car Week season above.
 */
export const HOLIDAY_SEASON = { from: "11-01", to: "01-04" } as const;

export function inHolidaySeason(today: string = pacificToday()): boolean {
  const md = today.slice(5);
  return md >= HOLIDAY_SEASON.from || md <= HOLIDAY_SEASON.to;
}

/**
 * Thanksgiving weekend 2026 — the dates /thanksgiving/ covers. The homepage
 * banner shows until the last day; after it the "Holidays" nav item points at
 * the December hub instead, because the Thanksgiving page is then a record.
 */
export const THANKSGIVING_2026 = { from: "2026-11-26", to: "2026-11-29", href: "/thanksgiving/" } as const;

export function thanksgivingIsCurrent(today: string = pacificToday()): boolean {
  return today <= THANKSGIVING_2026.to;
}

/** The header's seasonal nav item, or undefined out of season. */
export function holidayNavItem(today: string = pacificToday()): { to: string; label: string } | undefined {
  if (!inHolidaySeason(today)) return undefined;
  return { to: thanksgivingIsCurrent(today) ? THANKSGIVING_2026.href : "/events/december/", label: "Holidays" };
}
