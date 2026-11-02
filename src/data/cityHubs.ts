/**
 * City hubs that exist — one entry per built page, nothing speculative.
 *
 * City hubs were deferred from v1.B until the month hubs showed whether a
 * second cut of the data earned impressions. They did, and Pacific Grove got
 * the first one in v2.Q (2026-11-01) because GSC already showed real PG
 * demand split across several event pages. Add a city here only in the same
 * commit that builds its page; every consumer (event pages, the homepage's
 * town list, /events/) links a city only when it appears here, so an entry
 * without a page would ship a 404 link sitewide.
 */
export const CITY_HUBS: Record<string, string> = {
  "Pacific Grove": "/events/pacific-grove/",
};

export function cityHubHref(city: string | undefined): string | undefined {
  return city ? CITY_HUBS[city] : undefined;
}
