// src/__tests__/eventSchema.test.js
//
// Validates the Event JSON-LD emitted by /event/<slug>/ against schema.org/Event
// for every event in the dataset: property names must exist on Event, values
// must match the expected type ("Date or DateTime" for startDate/endDate, Offer
// for offers, Organization for organizer, Place for location), and the required
// startDate must always be present.
//
// Also freezes the /event/ slug list — these URLs are public and must not move.

import { describe, it, expect } from 'vitest';
import { allEventDetails, isFreeThroughout } from '../data/eventIndex.ts';
import { schedule, PACIFIC_OFFSET } from '../data/events.ts';
import {
  buildEventJsonLd,
  buildOffer,
  isoDateTime,
  postalAddress,
  formatTime,
} from '../lib/eventSchema.ts';

const SITE = 'https://montereybayevents.com';

// Properties this codebase is allowed to emit on an Event node. Every one is a
// real schema.org/Event property (or @-keyword); a typo'd or invented property
// name is silently ignored by consumers, so it is caught here instead.
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
  'organizer',
]);

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}-07:00$/;

const isDateOrDateTime = (v) =>
  typeof v === 'string' && (DATE_ONLY.test(v) || DATE_TIME.test(v));

/** Same instant, comparable across date-only and date-time forms. */
const asDate = (v) => new Date(DATE_ONLY.test(v) ? `${v}T00:00:00-07:00` : v);

const nodes = allEventDetails.map((e) => ({
  slug: e.slug,
  detail: e,
  ld: buildEventJsonLd(e, SITE),
}));

describe('Event JSON-LD — dataset coverage', () => {
  it('builds a node for every event, and there are events to build', () => {
    expect(nodes.length).toBeGreaterThan(40);
  });

  it('emits @context and @type Event', () => {
    for (const { slug, ld } of nodes) {
      expect(ld['@context'], slug).toBe('https://schema.org');
      expect(ld['@type'], slug).toBe('Event');
    }
  });

  it('uses only real schema.org/Event properties', () => {
    for (const { slug, ld } of nodes) {
      for (const key of Object.keys(ld)) {
        expect(ALLOWED_EVENT_PROPS.has(key), `${slug}: unexpected property "${key}"`).toBe(
          true,
        );
      }
    }
  });
});

describe('Event JSON-LD — startDate / endDate', () => {
  it('always has startDate (the property whose absence this fixes)', () => {
    for (const { slug, ld } of nodes) {
      expect(ld.startDate, `${slug} has no startDate`).toBeDefined();
      expect(isDateOrDateTime(ld.startDate), `${slug}: ${ld.startDate}`).toBe(true);
    }
  });

  it('startDate matches the ISO date of the first scheduled day', () => {
    for (const { slug, detail, ld } of nodes) {
      expect(ld.startDate, slug).toBe(
        isoDateTime(detail.days[0].iso, detail.days[0].startTime),
      );
    }
  });

  it('carries the -07:00 Pacific offset whenever a clock time is known', () => {
    const timed = nodes.filter(({ detail }) => detail.days.some((d) => d.startTime));
    expect(timed.length, 'expected at least one event with a known time').toBeGreaterThan(
      0,
    );
    for (const { slug, ld } of timed) {
      expect(ld.startDate, slug).toContain(PACIFIC_OFFSET);
      expect(DATE_TIME.test(ld.startDate), slug).toBe(true);
    }
  });

  it('emits a date-only startDate when no time is known — never a guessed hour', () => {
    for (const { slug, detail, ld } of nodes) {
      if (!detail.days[0].startTime) {
        expect(DATE_ONLY.test(ld.startDate), `${slug}: ${ld.startDate}`).toBe(true);
      }
    }
  });

  it('endDate, when present, is valid and not before startDate', () => {
    for (const { slug, ld } of nodes) {
      if (ld.endDate === undefined) continue;
      expect(isDateOrDateTime(ld.endDate), `${slug}: ${ld.endDate}`).toBe(true);
      expect(asDate(ld.endDate).getTime(), slug).toBeGreaterThanOrEqual(
        asDate(ld.startDate).getTime(),
      );
    }
  });

  it('has endDate for multi-day runs and for known finish times', () => {
    for (const { slug, detail, ld } of nodes) {
      const multiDay = detail.days.length > 1;
      const knownEnd = Boolean(detail.days[detail.days.length - 1].endTime);
      if (multiDay || knownEnd) {
        expect(ld.endDate, `${slug} should have endDate`).toBeDefined();
      } else {
        expect(ld.endDate, `${slug} should omit endDate`).toBeUndefined();
      }
    }
  });

  it('every scheduled date is a real 2026 date whose weekday matches the label', () => {
    const weekdays = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    for (const day of schedule) {
      expect(DATE_ONLY.test(day.iso), day.id).toBe(true);
      const d = new Date(`${day.iso}T12:00:00-07:00`);
      expect(Number.isNaN(d.getTime()), day.id).toBe(false);
      // Read the weekday back in the event's own timezone, not the runner's.
      const actual = d.toLocaleDateString('en-US', {
        weekday: 'long',
        timeZone: 'America/Los_Angeles',
      });
      expect(actual, `${day.iso} (${day.id})`).toBe(day.weekday);
      expect(weekdays).toContain(day.weekday);
    }
  });
});

describe('Event JSON-LD — offers', () => {
  it('free-throughout events offer price 0 USD, InStock, with a url', () => {
    const free = nodes.filter(({ detail }) => isFreeThroughout(detail));
    expect(free.length).toBeGreaterThan(0);
    for (const { slug, ld } of free) {
      expect(ld.offers, slug).toMatchObject({
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      });
      expect(typeof ld.offers.url, slug).toBe('string');
      expect(ld.offers.url, slug).toMatch(/^https:\/\//);
    }
  });

  it('ticketed events carry offers.url and never a price', () => {
    const ticketed = nodes.filter(
      ({ detail }) => detail.access !== 'private' && !isFreeThroughout(detail),
    );
    expect(ticketed.length).toBeGreaterThan(0);
    for (const { slug, ld } of ticketed) {
      expect(ld.offers['@type'], slug).toBe('Offer');
      expect(ld.offers.url, slug).toMatch(/^https:\/\//);
      expect(ld.offers.price, slug).toBeUndefined();
      // No availability claim either: we cannot verify tickets are still on sale.
      expect(ld.offers.availability, slug).toBeUndefined();
    }
  });

  it('private events publish no Offer at all', () => {
    const priv = nodes.filter(({ detail }) => detail.access === 'private');
    expect(priv.length).toBeGreaterThan(0);
    for (const { slug, ld } of priv) {
      expect(ld.offers, slug).toBeUndefined();
    }
  });

  it('does not claim price 0 for an event that is free on one day and ticketed on another', () => {
    // The Bonhams preview is a free walk-through on Aug 11 and ticketed on Aug 12.
    const mixed = allEventDetails.filter(
      (e) => e.days.some((d) => d.access === 'free') && !isFreeThroughout(e),
    );
    expect(mixed.length, 'expected at least one mixed-admission event').toBeGreaterThan(0);
    for (const e of mixed) {
      const offer = buildOffer(e, `${SITE}/event/${e.slug}/`);
      expect(offer.price, e.slug).toBeUndefined();
    }
  });
});

describe('Event JSON-LD — organizer and location', () => {
  it('organizer, where present, is an Organization with a name and an https url', () => {
    const withOrganizer = nodes.filter(({ ld }) => ld.organizer);
    expect(withOrganizer.length).toBeGreaterThan(10);
    for (const { slug, ld } of withOrganizer) {
      expect(ld.organizer['@type'], slug).toBe('Organization');
      expect(typeof ld.organizer.name, slug).toBe('string');
      expect(ld.organizer.name.length, slug).toBeGreaterThan(1);
      expect(ld.organizer.url, slug).toMatch(/^https:\/\//);
    }
  });

  it('location, where present, is a Place with a name and an address', () => {
    for (const { slug, detail, ld } of nodes) {
      if (!detail.venue) {
        expect(ld.location, slug).toBeUndefined();
        continue;
      }
      expect(ld.location['@type'], slug).toBe('Place');
      expect(ld.location.name, slug).toBe(detail.venue.venue);
      const addr = ld.location.address;
      if (typeof addr === 'string') {
        expect(addr.length, slug).toBeGreaterThan(0);
      } else {
        expect(addr['@type'], slug).toBe('PostalAddress');
        expect(addr.addressRegion, slug).toBe('CA');
        expect(addr.postalCode, slug).toMatch(/^\d{5}$/);
        expect(addr.addressCountry, slug).toBe('US');
      }
    }
  });

  it('parses every venue address in the dataset into a PostalAddress', () => {
    for (const { slug, detail } of nodes) {
      if (!detail.venue) continue;
      const parsed = postalAddress(detail.venue.address);
      expect(typeof parsed, `${slug}: ${detail.venue.address} fell back to text`).toBe(
        'object',
      );
    }
  });

  it('falls back to plain text for an address it cannot parse', () => {
    expect(postalAddress('somewhere on the peninsula')).toBe(
      'somewhere on the peninsula',
    );
  });
});

describe('Event JSON-LD — required-field smoke', () => {
  it('has name, description and a canonical url ending in a slash', () => {
    for (const { slug, ld } of nodes) {
      expect(typeof ld.name, slug).toBe('string');
      expect(ld.name.length, slug).toBeGreaterThan(0);
      expect(typeof ld.description, slug).toBe('string');
      expect(ld.description.length, slug).toBeGreaterThan(0);
      expect(ld.url, slug).toBe(`${SITE}/event/${slug}/`);
    }
  });

  it('serialises to JSON without cycles or undefined leaves', () => {
    for (const { slug, ld } of nodes) {
      const round = JSON.parse(JSON.stringify(ld));
      expect(round.startDate, slug).toBe(ld.startDate);
      expect(JSON.stringify(round), slug).not.toContain('undefined');
    }
  });
});

describe('/event/ slug stability', () => {
  // Frozen list. /event/<slug>/ URLs are public; changing one is a redirect
  // event, not a refactor. If this fails, restore the slug — do not edit the
  // list unless you are intentionally moving a URL and adding a redirect.
  const FROZEN = [
    'monterey-car-week-kick-off',
    'racing-to-del-monte-pebble-beach',
    'monterey-pre-reunion-and-corkscrew-hillclimb',
    'the-quail-rally',
    'central-coast-poker-rally',
    'automobilia-collectors-expo',
    'monterey-british-car-event',
    'porsche-monterey-classic',
    'piazza-motor-nights',
    'the-laguna-seca-auction-bonhams-preview',
    'zenvo-house',
    'concours-for-a-cause',
    'night-rider',
    'rolex-monterey-motorsports-reunion',
    'the-quail-auction-broad-arrow-preview',
    'pebble-beach-auctions-by-gooding-christies',
    'astons-on-the-avenue',
    'the-little-car-show',
    'porsche-pit-stop-at-taste-morgan',
    'pebble-beach-motoring-classic',
    'luau-at-asilomar',
    'motorlux',
    'cadillac-house',
    'pebble-beach-tour-delegance',
    'ferrari-owners-club-4th-annual-concours-carmel',
    'the-quail-auction-broad-arrow',
    'mecum-auction',
    'the-laguna-seca-auction-bonhams-preview-auction',
    'pebble-beach-retroauto',
    'legends-of-the-autobahn',
    'concours-village',
    'pebble-beach-classic-car-forum',
    'woodies-in-the-woods',
    'rm-sothebys-monterey-auction',
    'house-of-aston-martin',
    'bugatti',
    'werks-reunion-monterey',
    'the-quail-a-motorsports-gathering',
    'pacific-grove-rotary-concours-auto-rally',
    'the-paddock',
    'concours-dlemons',
    'mbca-70th-anniversary-benzes-at-the-barnyard',
    'concorso-italiano',
    'serata-campioni',
    'exotics-on-broadway',
    'annual-ferrari-event-at-the-barnyard',
    'monterey-motorsports-festival',
    'serata-italiana',
    'breakfast-club-rally-x-mcw',
    'pebble-beach-concours-delegance',
  ];

  it('emits exactly the frozen slug set, in order', () => {
    expect(allEventDetails.map((e) => e.slug)).toEqual(FROZEN);
  });
});

describe('helpers', () => {
  it('isoDateTime appends the Pacific offset only when given a time', () => {
    expect(isoDateTime('2026-08-12')).toBe('2026-08-12');
    expect(isoDateTime('2026-08-12', '12:00')).toBe('2026-08-12T12:00:00-07:00');
  });

  it('formatTime renders a 12-hour clock', () => {
    expect(formatTime('12:00')).toBe('12:00 PM');
    expect(formatTime('17:00')).toBe('5:00 PM');
    expect(formatTime('09:30')).toBe('9:30 AM');
    expect(formatTime('00:15')).toBe('12:15 AM');
  });
});
