/**
 * Page-side joins for /monterey-car-week-map/: map pins → Car Week /event/
 * pages. Kept out of src/data/carWeekVenues.ts because eventIndex's
 * extensionless imports cannot be loaded by the plain-Node map renderer.
 */
import { allEventDetails, type EventDetail } from "../data/eventIndex";
import { mapVenues, type MapVenue } from "../data/carWeekVenues";

/** Car Week events at a pin, in schedule order. */
export function eventsAt(v: MapVenue): EventDetail[] {
  return allEventDetails.filter((e) => e.venue && v.venueNames.includes(e.venue.venue));
}

/** Car Week events whose venue names an area rather than a place — listed, never pinned. */
export const unpinnedEvents: EventDetail[] = allEventDetails.filter(
  (e) => !mapVenues.some((v) => e.venue && v.venueNames.includes(e.venue.venue)),
);
