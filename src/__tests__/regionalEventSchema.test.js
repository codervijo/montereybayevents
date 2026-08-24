// src/__tests__/regionalEventSchema.test.js
//
// Validates the Event JSON-LD emitted by the regional /event/<slug>/ pages
// against schema.org/Event, the same way eventSchema.test.js does for the Car
// Week set: only real Event properties, startDate always present and always a
// valid Date or DateTime, location a Place with a PostalAddress.
//
// The load-bearing case is the inverse one — an event with no confirmed date
// must produce NO node at all. Emitting an Event without startDate would be
// invalid markup, and inventing a startDate to satisfy the validator would put a
// date we do not have in front of someone planning a trip.

import { describe, it, expect } from 'vitest';
import {
  regionalEvents,
  regionalEventPages,
  eventsByMonth,
  pacificOffset,
} from '../data/events-2026.ts';
import {
  buildRegionalEventJsonLd,
  buildItemListJsonLd,
  buildPlace,
  isoDateTime,
} from '../lib/regionalEventSchema.ts';

const SITE = 'https://montereybayevents.com';

const ALLOWED_EVENT_PROPS = new Set([
  '@context',
  '@type',
  'name',
  'description',
  'url',
  'startDate',
  'endDate',
  'eventStatus',
  'eventAttendanceMode',
  'location',
  'offers',
]);

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-0[78]:00$/;
const isDateOrDateTime = (v) =>
  typeof v === 'string' && (DATE_ONLY.test(v) || DATE_TIME.test(v));

const nodes = regionalEvents
  .map((e) => ({ event: e, ld: buildRegionalEventJsonLd(e, SITE) }))
  .filter((n) => n.ld);

describe('regional Event JSON-LD', () => {
  it('builds a node for every dated event and none for the undated ones', () => {
    expect(nodes.length).toBe(regionalEvents.filter((e) => e.start).length);
    expect(nodes.length).toBe(58);
    for (const e of regionalEvents.filter((e) => !e.start)) {
      expect(buildRegionalEventJsonLd(e, SITE), e.name).toBeNull();
    }
  });

  it('emits @context and @type Event', () => {
    for (const { event, ld } of nodes) {
      expect(ld['@context'], event.slug).toBe('https://schema.org');
      expect(ld['@type'], event.slug).toBe('Event');
    }
  });

  it('uses only real schema.org/Event properties', () => {
    for (const { event, ld } of nodes) {
      for (const key of Object.keys(ld)) {
        expect(
          ALLOWED_EVENT_PROPS.has(key),
          `${event.slug}: unexpected property "${key}"`,
        ).toBe(true);
      }
    }
  });

  it('always carries a valid startDate on the right day', () => {
    for (const { event, ld } of nodes) {
      expect(isDateOrDateTime(ld.startDate), `${event.slug}: ${ld.startDate}`).toBe(true);
      // Date-only until v1.Y; a row with organiser-published hours now carries
      // a clock time, so the invariant is the DAY, not the exact string.
      expect(ld.startDate.slice(0, 10), event.slug).toBe(event.start);
    }
  });

  // Was "endDate only for multi-day runs". v1.Y: a single-day event whose
  // organiser publishes a finish time has a real endDate too — same day, later
  // clock. The rule that actually matters is that endDate never precedes
  // startDate, and never appears out of nowhere.
  it('carries endDate for multi-day runs or a sourced finish time, never before startDate', () => {
    for (const { event, ld } of nodes) {
      const expectEnd =
        Boolean(event.end) ||
        (event.timesConfidence === 'official' && Boolean(event.endTime));

      if (expectEnd) {
        expect(isDateOrDateTime(ld.endDate), event.slug).toBe(true);
        expect(ld.endDate > ld.startDate, event.slug).toBe(true);
        expect(ld.endDate.slice(0, 10), event.slug).toBe(event.end ?? event.start);
      } else {
        expect(ld.endDate, event.slug).toBeUndefined();
      }
    }
  });

  // Was "never publishes a price": until v1.L no regional row had sourced
  // admission data, so the guard could be absolute. Now that `admission` can be
  // set from an organiser's own words, the rule it was really protecting is the
  // one asserted here — an Offer appears if and ONLY if someone checked. A row
  // with no admission data still publishes no price at all.
  it('publishes an Offer only where admission is sourced, and never an organizer', () => {
    for (const { event, ld } of nodes) {
      expect(ld.organizer, event.slug).toBeUndefined();

      if (event.admission === undefined) {
        expect(ld.offers, event.slug).toBeUndefined();
        continue;
      }

      expect(ld.offers['@type'], event.slug).toBe('Offer');
      expect(ld.offers.availability, event.slug).toBe('https://schema.org/InStock');
      // Google treats offers.url as required whenever an Offer is published.
      expect(typeof ld.offers.url, event.slug).toBe('string');
      expect(ld.offers.url, event.slug).toMatch(/^https:\/\//);

      if (event.admission === 'free') {
        expect(ld.offers.price, event.slug).toBe('0');
        expect(ld.offers.priceCurrency, event.slug).toBe('USD');
        continue;
      }

      // v1.Y: the only other sourced shape is a ticketed admission carrying its
      // own floor price. Anything else means a member was added to the union
      // without teaching the builder about it.
      expect(event.admission.kind, event.slug).toBe('ticketed');
      expect(typeof event.admission.from, event.slug).toBe('number');
      expect(event.admission.from, event.slug).toBeGreaterThan(0);
      expect(ld.offers.price, event.slug).toBe(String(event.admission.from));
      expect(ld.offers.priceCurrency, event.slug).toBe(event.admission.currency);
    }
  });

  // A price on the page and a price in the markup are one claim, not two.
  it('sources admission from an organiser for every row that publishes an Offer', () => {
    const priced = regionalEvents.filter((e) => e.admission !== undefined);
    for (const e of priced) {
      const ok =
        e.admission === 'free' ||
        (typeof e.admission === 'object' && e.admission.kind === 'ticketed');
      expect(ok, e.slug).toBe(true);
      // A paid price is a claim about someone's money — it needs the organiser
      // page it came from, not just our word for it.
      if (e.admission !== 'free') {
        expect(typeof e.officialWebsite, e.slug).toBe('string');
      }
    }
    expect(priced.length, 'rows with sourced admission').toBeGreaterThan(0);
  });

  // v1.Y: pacificOffset() was wired in from v1.B and emitted nothing for four
  // months because no row had a sourced time. Bonny Doon is the first. The rule
  // it ships under is the one v1.G wrote down: only an organiser-published hour
  // reaches structured data, because a time in a search result arrives stripped
  // of every qualifier the page put around it.
  it('puts a clock time in startDate only where the organiser published it', () => {
    for (const { event, ld } of nodes) {
      const official = event.timesConfidence === 'official';

      if (official && event.startTime) {
        expect(ld.startDate, event.slug).toBe(
          `${event.start}T${event.startTime}:00${pacificOffset(event.start)}`,
        );
      } else {
        // Date-only. No midnight padding, ever.
        expect(ld.startDate, event.slug).toBe(event.start);
      }

      // An unconfirmed row may still carry display hours; they must not leak.
      if (!official) {
        expect(ld.startDate, event.slug).not.toMatch(/T/);
        expect(ld.endDate ?? '', event.slug).not.toMatch(/T/);
      }
    }
  });

  it('locates every event as a Place with a city and CA', () => {
    for (const { event, ld } of nodes) {
      expect(ld.location['@type'], event.slug).toBe('Place');
      expect(typeof ld.location.name, event.slug).toBe('string');
      const address = ld.location.address;
      expect(address['@type'], event.slug).toBe('PostalAddress');
      expect(address.addressRegion, event.slug).toBe('CA');
      expect(address.addressCountry, event.slug).toBe('US');
      if (event.city) expect(address.addressLocality, event.slug).toBe(event.city);
    }
  });

  it('points url at the page that actually renders the node', () => {
    for (const { event, ld } of nodes) {
      if (!regionalEventPages.includes(event)) continue;
      expect(ld.url).toBe(`${SITE}/event/${event.slug}/`);
    }
  });

  it('keeps description inside the length Google will read', () => {
    for (const { event, ld } of nodes) {
      if (ld.description === undefined) continue;
      expect(ld.description.length, event.slug).toBeLessThanOrEqual(300);
    }
  });
});

describe('isoDateTime', () => {
  it('stays date-only while no clock time is known', () => {
    expect(isoDateTime('2026-09-03')).toBe('2026-09-03');
  });

  it('applies PDT before the November 1 change and PST after', () => {
    expect(isoDateTime('2026-10-31', '18:00')).toBe('2026-10-31T18:00:00-07:00');
    expect(isoDateTime('2026-12-05', '18:00')).toBe('2026-12-05T18:00:00-08:00');
  });
});

describe('buildPlace', () => {
  it('falls back from venue to city to the raw CSV location text', () => {
    expect(buildPlace({ venue: 'The Grove', city: 'Santa Cruz', cityText: 'x' }).name).toBe(
      'The Grove',
    );
    expect(buildPlace({ city: 'Big Sur', cityText: 'Big Sur' }).name).toBe('Big Sur');
    expect(buildPlace({ cityText: 'Countywide (…)' }).name).toBe('Countywide (…)');
  });

  it('omits addressLocality rather than inventing one for a countywide event', () => {
    expect(buildPlace({ cityText: 'Countywide (…)' }).address.addressLocality).toBeUndefined();
  });
});

describe('listing ItemList JSON-LD', () => {
  const href = (e) => `/event/${e.slug}/`;

  it('lists every event in order, with absolute URLs', () => {
    const ld = buildItemListJsonLd(regionalEvents, SITE, href, 'All events');
    expect(ld['@type']).toBe('ItemList');
    expect(ld.numberOfItems).toBe(regionalEvents.length);
    expect(ld.itemListElement).toHaveLength(regionalEvents.length);
    ld.itemListElement.forEach((item, i) => {
      expect(item['@type']).toBe('ListItem');
      expect(item.position).toBe(i + 1);
      expect(item.url.startsWith(`${SITE}/`)).toBe(true);
    });
  });

  it('builds a non-empty list for every month hub', () => {
    for (const month of eventsByMonth) {
      const ld = buildItemListJsonLd(month.events, SITE, href, month.label);
      expect(ld.numberOfItems, month.key).toBeGreaterThan(0);
    }
  });
});
