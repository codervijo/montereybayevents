/**
 * Builds the schema.org/Event JSON-LD for /event/<slug>/ pages.
 *
 * Kept out of the .astro page so it can be unit-tested against every event in
 * the dataset — see src/__tests__/eventSchema.test.js.
 *
 * Property types follow https://schema.org/Event:
 *   startDate / endDate  Date or DateTime   (date-only is valid)
 *   location             Place
 *   offers               Offer
 *   organizer            Organization
 *   eventStatus          EventStatusType
 *   eventAttendanceMode  EventAttendanceModeEnumeration
 */
import { PACIFIC_OFFSET } from "../data/events";
import { isFreeThroughout, type EventDetail } from "../data/eventIndex";
import type { Venue } from "../data/venues";

export type JsonLd = Record<string, unknown>;

/**
 * `YYYY-MM-DD` when no clock time is known, `YYYY-MM-DDTHH:MM:SS-07:00` when it
 * is. Both are valid ISO 8601 and both satisfy schema.org's "Date or DateTime".
 * A time is never synthesised — see CarEvent.startTime for why.
 */
export function isoDateTime(iso: string, time?: string | undefined): string {
  return time ? `${iso}T${time}:00${PACIFIC_OFFSET}` : iso;
}

/** `America/Los_Angeles` "HH:MM" → "12:00 PM", for on-page display. */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) {
    return time;
  }
  const suffix = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

const ADDRESS_RE = /^(?:(?<street>.+), )?(?<city>[^,]+), (?<region>[A-Z]{2}) (?<zip>\d{5})$/;

/**
 * Splits "1021 Monterey Salinas Hwy, Salinas, CA 93908" into a PostalAddress.
 * Every address in venues.ts matches `[street, ]city, ST zip`; anything that
 * does not is passed through as plain text, which Place.address also accepts.
 */
export function postalAddress(address: string): JsonLd | string {
  const m = ADDRESS_RE.exec(address.trim());
  if (!m?.groups) return address;
  const { street, city, region, zip } = m.groups;
  return {
    "@type": "PostalAddress",
    ...(street ? { streetAddress: street } : {}),
    addressLocality: city,
    addressRegion: region,
    postalCode: zip,
    addressCountry: "US",
  };
}

function place(venue: Venue): JsonLd {
  return {
    "@type": "Place",
    name: venue.venue,
    address: postalAddress(venue.address),
  };
}

/**
 * Offer for the event, or null when there is nothing on offer to the public.
 *
 *  - free throughout    price "0" + InStock, per the site's free-event contract
 *  - ticketed / mixed   `url` only. No price (we do not hold ticket prices) and
 *                       no `availability` — claiming InStock for a paid event
 *                       would assert tickets are still on sale, which we cannot
 *                       verify and which goes stale silently.
 *  - private            no Offer at all; not offered to the public.
 *
 * `url` is always present: Google treats offers.url as required whenever an
 * Offer is published, so it falls back to our own event page when the organizer
 * URL is unknown.
 */
export function buildOffer(event: EventDetail, canonical: string): JsonLd | null {
  if (event.access === "private") return null;
  const url = event.url ?? canonical;

  if (isFreeThroughout(event)) {
    return {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url,
    };
  }
  return { "@type": "Offer", url };
}

export function buildEventJsonLd(event: EventDetail, site: string): JsonLd {
  const canonical = `${site}/event/${event.slug}/`;
  const first = event.days[0];
  const last = event.days[event.days.length - 1];
  if (!first || !last) {
    throw new Error(`Event "${event.slug}" has no days; cannot build Event schema.`);
  }

  const startDate = isoDateTime(first.iso, first.startTime);
  // endDate is emitted when it says something startDate does not: a known
  // finish time, or a run that spans more than one day. A single-day event with
  // no known times has no meaningful endDate, so the property is omitted rather
  // than padded out.
  const endDate =
    last.endTime || last.iso !== first.iso
      ? isoDateTime(last.iso, last.endTime)
      : undefined;

  const offers = buildOffer(event, canonical);
  const description =
    event.description ??
    `${event.title} during Monterey Car Week 2026 — ${event.days
      .map((d) => d.short)
      .join(", ")}. ${event.accessLabel}${
      event.venue ? ` at ${event.venue.venue}.` : "."
    }`;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: description.slice(0, 300),
    url: canonical,
    startDate,
    ...(endDate ? { endDate } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.venue ? { location: place(event.venue) } : {}),
    ...(offers ? { offers } : {}),
    ...(event.organizer
      ? {
          organizer: {
            "@type": "Organization",
            name: event.organizer.name,
            url: event.organizer.url,
          },
        }
      : {}),
  };
}
