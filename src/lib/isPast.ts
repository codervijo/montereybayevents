/**
 * Has an event finished?
 *
 * IMPORTANT — this is evaluated at BUILD time, not at view time. The site is
 * prerendered static on Cloudflare Workers, so `today` is frozen at whatever
 * date the last deploy ran. A page built on 21 August still believes it is 21
 * August in October unless something rebuilds it.
 *
 * That is acceptable for the narrow job this does — switching a page's copy
 * from forward-looking to past — because getting it wrong reads as slightly
 * stale rather than as a false claim about an event. It is NOT sufficient for
 * hiding or filtering listings, where a frozen "today" would silently show the
 * wrong set while looking maintained. Anything that filters needs a scheduled
 * rebuild first; see the v1.P row in docs/prd.md.
 *
 * Comparison is date-only in America/Los_Angeles: an event is past only once
 * its LAST day is behind us, so a multi-day run reads as current throughout,
 * and an event happening today is never "past".
 */

/** `YYYY-MM-DD` for a Date, in America/Los_Angeles rather than UTC or the
 *  build machine's zone — a build running after 5pm Pacific is already
 *  "tomorrow" in UTC and would age every page a day early. */
export function pacificToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * True when `end ?? start` is strictly before today in Pacific time.
 * Undated events are never past — there is no date to have passed.
 */
export function isPastDate(
  start: string | undefined,
  end: string | undefined,
  today: string = pacificToday(),
): boolean {
  const last = end ?? start;
  if (!last) return false;
  return last < today;
}
