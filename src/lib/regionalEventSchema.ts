/**
 * Builds the schema.org/Event JSON-LD for the regional (non-Car-Week) event
 * pages generated from src/data/events-2026.ts.
 *
 * Separate from src/lib/eventSchema.ts because the two datasets carry different
 * facts: Car Week listings know their admission and organizer and are tracked
 * per day, while these rows know a county, a city, a venue and a date range and
 * nothing about price. The output shape is the same, and both are validated
 * against schema.org/Event in the test suite.
 *
 * Two properties the Car Week builder emits are deliberately absent here:
 *
 *   offers      — this dataset records no admission price, and an Offer with no
 *                 price says nothing while an Offer with a guessed one is worse.
 *   organizer   — no organizer names are recorded, only websites.
 *
 * Returns null when the event has no confirmed start date. schema.org requires
 * startDate, so an Event node without one is invalid — the three undated events
 * get a page with no Event markup at all rather than a broken node or a guessed
 * date. See src/data/events-2026.ts.
 */
import {
  pacificOffset,
  type RegionalEvent,
} from "../data/events-2026";

export type JsonLd = Record<string, unknown>;

/**
 * `YYYY-MM-DD` while no clock time is known, `YYYY-MM-DDTHH:MM:SS±HH:MM` once
 * one is. Both are valid ISO 8601 and both satisfy schema.org's "Date or
 * DateTime". Nothing in this dataset has a published time yet; a time is never
 * synthesised, because padding a date to midnight publishes a start time we do
 * not have.
 */
export function isoDateTime(iso: string, time?: string): string {
  return time ? `${iso}T${time}:00${pacificOffset(iso)}` : iso;
}

/**
 * The single gate between a row's clock times and its structured data.
 *
 * Returns a time ONLY when the organiser published the hours themselves. An
 * `"unconfirmed"` row still shows its hours to the reader — with the page
 * saying who has and has not published them — but they stay out of the Event
 * node, because a time in a search result arrives stripped of that caveat.
 * Rows with no `timesConfidence` at all are treated as unconfirmed.
 */
function officialTime(
  event: RegionalEvent,
  field: "startTime" | "endTime",
): string | undefined {
  return event.timesConfidence === "official" ? event[field] : undefined;
}

/**
 * The Place node: venue name where one is known, city + CA either way.
 *
 * `streetAddress` and `postalCode` are emitted only for the rows that carry a
 * real sourced address. They are never derived from the venue name — a Place
 * whose address is a guess is worse than a Place with only a locality, because
 * a maps result will happily send someone to the guess.
 */
export function buildPlace(event: RegionalEvent): JsonLd {
  return {
    "@type": "Place",
    name: event.venue ?? event.city ?? event.cityText,
    address: {
      "@type": "PostalAddress",
      ...(event.streetAddress ? { streetAddress: event.streetAddress } : {}),
      ...(event.city ? { addressLocality: event.city } : {}),
      addressRegion: "CA",
      ...(event.postalCode ? { postalCode: event.postalCode } : {}),
      addressCountry: "US",
    },
  };
}


/**
 * The Offer node, mirroring src/lib/eventSchema.ts's buildOffer so both
 * datasets publish the same shape.
 *
 * Returns null unless `admission` is set, which it only is where the organiser
 * states it — so the rows still carrying no admission data publish no Offer
 * at all rather than an empty or guessed one. `url` is always present: Google
 * treats offers.url as required whenever an Offer is published, so it falls
 * back to our own page when no organiser URL is recorded.
 *
 * Two shapes, one node. `"free"` publishes price 0; a ticketed admission
 * publishes its `from` floor — the cheapest ticket that actually gets someone
 * through the gate. Emitting the floor rather than a range is deliberate:
 * `price` is read as the amount payable, so the only figure that cannot
 * mislead is the smallest one a reader could really pay.
 */
export function buildRegionalOffer(
  event: RegionalEvent,
  canonical: string,
): JsonLd | null {
  const { admission } = event;
  if (admission === undefined) return null;

  const price = admission === "free" ? "0" : String(admission.from);
  const priceCurrency = admission === "free" ? "USD" : admission.currency;

  return {
    "@type": "Offer",
    price,
    priceCurrency,
    availability: "https://schema.org/InStock",
    url: event.officialWebsite ?? canonical,
  };
}

export function buildRegionalEventJsonLd(
  event: RegionalEvent,
  site: string,
): JsonLd | null {
  if (!event.start) return null;
  const canonical = `${site}/event/${event.slug}/`;
  const offer = buildRegionalOffer(event, canonical);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    ...(event.description ? { description: event.description.slice(0, 300) } : {}),
    url: `${site}/event/${event.slug}/`,
    startDate: isoDateTime(event.start, officialTime(event, "startTime")),
    ...(event.end || officialTime(event, "endTime")
      ? {
          endDate: isoDateTime(
            event.end ?? event.start,
            officialTime(event, "endTime"),
          ),
        }
      : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: buildPlace(event),
    ...(offer ? { offers: offer } : {}),
  };
}

/**
 * ItemList JSON-LD for a listing page (/events/ and each month hub). Listing the
 * items as ListItem → url, rather than as inlined Event nodes, keeps each event's
 * canonical markup on its own page — same pattern as /free/.
 */
export function buildItemListJsonLd(
  events: RegionalEvent[],
  site: string,
  href: (e: RegionalEvent) => string,
  name: string,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: events.length,
    itemListElement: events.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: e.name,
      url: `${site}${href(e)}`,
    })),
  };
}

/**
 * FAQPage JSON-LD, emitted only when the page renders the same questions
 * visibly. Google's guidance and plain honesty agree here: marking up an
 * answer a reader cannot see on the page is the definition of misleading
 * structured data, so this is driven off the very array the template renders
 * and there is no second source of truth to drift from.
 */
export function buildFaqJsonLd(event: RegionalEvent): JsonLd | null {
  if (!event.faq?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: event.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
