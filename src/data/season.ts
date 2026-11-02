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
