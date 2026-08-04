// src/__tests__/events2026.test.js
//
// Ties src/data/events-2026.ts back to its source of record,
// data/monterey_santacruz_events_aug_dec_2026.csv: every row must be present,
// every transcribed field must match, and the parsed ISO dates must agree with
// the CSV's own date text. A silent transcription slip here would put a wrong
// date or venue in front of someone planning a trip, so it is checked rather
// than trusted.
//
// Also asserts the two data rules this dataset ships under:
//   - the CSV's expected_visitor_level column never reaches the site
//   - the three events with no confirmed date carry no date at all

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  regionalEvents,
  regionalEventPages,
  MONTHS,
  eventsInMonth,
  adjacentMonths,
  currentAndNextMonth,
  pacificOffset,
  eventHref,
  monthTitle,
  DATE_TBA,
} from '../data/events-2026.ts';

const CSV = join(
  process.cwd(),
  'data',
  'monterey_santacruz_events_aug_dec_2026.csv',
);

/** Minimal RFC-4180 reader — the CSV quotes fields containing commas. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ''));
}

const raw = parseCsv(readFileSync(CSV, 'utf8'));
const header = raw[0];
const csvRows = raw
  .slice(1)
  .map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));

const byName = new Map(regionalEvents.map((e) => [e.name, e]));

const MONTH_NUM = {
  January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
  July: '07', August: '08', September: '09', October: '10', November: '11',
  December: '12',
};

/** Independent re-parse of the CSV date text, to check the committed ISO dates. */
function expectedRange(text) {
  const t = text.trim();
  if (!t) return {};
  const iso = (mon, d, y) => `${y}-${MONTH_NUM[mon]}-${String(Number(d)).padStart(2, '0')}`;
  let m;
  if ((m = /^(\w+) (\d{1,2}), (\d{4})\s*-\s*(\w+) (\d{1,2}), (\d{4})$/.exec(t)))
    return { start: iso(m[1], m[2], m[3]), end: iso(m[4], m[5], m[6]) };
  if ((m = /^(\w+) (\d{1,2})\s*-\s*(\w+) (\d{1,2}), (\d{4})$/.exec(t)))
    return { start: iso(m[1], m[2], m[5]), end: iso(m[3], m[4], m[5]) };
  if ((m = /^(\w+) (\d{1,2})\s*-\s*(\d{1,2}), (\d{4})$/.exec(t)))
    return { start: iso(m[1], m[2], m[4]), end: iso(m[1], m[3], m[4]) };
  if ((m = /^(\w+) (\d{1,2}), (\d{4})$/.exec(t))) return { start: iso(m[1], m[2], m[3]) };
  throw new Error(`test cannot parse date text: "${t}"`);
}

describe('events-2026 ↔ CSV source of record', () => {
  it('reads 61 rows from the CSV', () => {
    expect(csvRows.length).toBe(61);
  });

  it('carries every CSV row, and no extras', () => {
    expect(regionalEvents.length).toBe(csvRows.length);
    for (const row of csvRows) {
      expect(byName.has(row.event_name), `missing: ${row.event_name}`).toBe(true);
    }
  });

  it('has a unique slug per event', () => {
    const slugs = regionalEvents.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('uses lowercase-hyphenated slugs derived from the event name', () => {
    for (const e of regionalEvents) {
      expect(e.slug, e.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      // Derived from the name: the first word of the name survives into the slug.
      const firstWord = e.name
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .split(/\s+/)[0];
      expect(e.slug, e.name).toContain(firstWord);
    }
  });

  it.each(csvRows.map((r) => [r.event_name, r]))(
    'transcribes %s faithfully',
    (_name, row) => {
      const e = byName.get(row.event_name);
      expect(e.county).toBe(row.county);
      expect(e.cityText).toBe(row.city);
      expect(e.category).toBe(row.category);
      expect(e.dateText).toBe(row.date_or_date_range);
      expect(e.officialWebsite ?? '').toBe(row.official_website);
      expect(e.referenceUrls).toEqual(
        [row.reference_site_1, row.reference_site_2, row.reference_site_3].filter(Boolean),
      );
      expect(e.months).toEqual(
        row.month.split('-').map((m) => m.trim().toLowerCase()),
      );
    },
  );

  it.each(csvRows.map((r) => [r.event_name, r]))(
    'derives ISO dates for %s that match its date text',
    (_name, row) => {
      const e = byName.get(row.event_name);
      const { start, end } = expectedRange(row.date_or_date_range);
      expect(e.start).toBe(start);
      // `end` is only carried when the run actually spans more than one day.
      expect(e.end).toBe(end && end !== start ? end : undefined);
    },
  );

  it('parses the city out of the CSV city column, or leaves it unset countywide', () => {
    for (const e of regionalEvents) {
      if (e.cityText.startsWith('Countywide')) {
        expect(e.city, e.name).toBeUndefined();
      } else {
        expect(e.city, e.name).toBeTruthy();
        expect(e.cityText.startsWith(e.city), e.name).toBe(true);
      }
    }
  });
});

describe('data rules', () => {
  it('never carries the CSV expected_visitor_level judgement', () => {
    // Comments are stripped first: the file's header names the column in order
    // to record that it is deliberately dropped, which is the opposite of a leak.
    const src = readFileSync(join(process.cwd(), 'src', 'data', 'events-2026.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(src).not.toMatch(/expected_visitor_level|visitorLevel/);
    // The column's own vocabulary must not appear as data either.
    for (const e of regionalEvents) {
      expect(JSON.stringify(e)).not.toMatch(/"Very High"|"Moderate"|"Local"/);
    }
  });

  it('ships exactly the three undated events with no date at all', () => {
    const undated = regionalEvents.filter((e) => !e.start);
    expect(undated.map((e) => e.name).sort()).toEqual([
      'Downtown Santa Cruz Holiday Parade',
      'Monterey Bay Greek Festival',
      'Open Studios Art Tour (41st Annual)',
    ]);
    for (const e of undated) {
      expect(e.dateText, e.name).toBe('');
      expect(e.end, e.name).toBeUndefined();
    }
    // Matches the CSV: those rows and only those have an empty date column.
    expect(csvRows.filter((r) => !r.date_or_date_range).length).toBe(3);
  });

  it('has a date label to render in place of a date', () => {
    expect(DATE_TBA).toBe('Date not yet announced');
  });

  it('every event has a description or none at all — never a placeholder', () => {
    for (const e of regionalEvents) {
      if (e.description !== undefined) {
        expect(e.description.length, e.name).toBeGreaterThan(20);
        expect(e.description, e.name).not.toMatch(/TODO|TBD|FILL|placeholder|lorem/i);
      }
    }
  });
});

describe('routing', () => {
  it('does not reuse an existing Car Week slug for a new page', async () => {
    const { allEventDetails } = await import('../data/eventIndex.ts');
    const carWeek = new Set(allEventDetails.map((e) => e.slug));
    for (const e of regionalEventPages) {
      expect(carWeek.has(e.slug), `${e.slug} collides with a Car Week page`).toBe(false);
    }
  });

  it('points rows that duplicate a Car Week event at the page that already exists', async () => {
    const { allEventDetails } = await import('../data/eventIndex.ts');
    const carWeek = new Set(allEventDetails.map((e) => e.slug));
    const mapped = regionalEvents.filter((e) => e.existingSlug);
    expect(mapped.length).toBeGreaterThan(0);
    for (const e of mapped) {
      expect(carWeek.has(e.existingSlug), `${e.existingSlug} is not a Car Week page`).toBe(
        true,
      );
      expect(eventHref(e)).toBe(`/event/${e.existingSlug}/`);
    }
  });

  it('gives every event a link target', () => {
    for (const e of regionalEvents) {
      expect(eventHref(e), e.name).toMatch(/^\/[a-z0-9/-]+\/$/);
    }
  });
});

describe('month hubs', () => {
  it('covers August through December 2026', () => {
    expect(MONTHS.map((m) => m.key)).toEqual([
      'august',
      'september',
      'october',
      'november',
      'december',
    ]);
  });

  it('titles each hub in the agreed format', () => {
    expect(monthTitle('october')).toBe(
      'Central Coast Events in October 2026 — Monterey and Santa Cruz',
    );
  });

  it('places every event in at least one hub', () => {
    const placed = new Set(MONTHS.flatMap((m) => eventsInMonth(m.key).map((e) => e.slug)));
    expect(placed.size).toBe(regionalEvents.length);
  });

  it('sorts each hub by date, undated last', () => {
    for (const m of MONTHS) {
      const events = eventsInMonth(m.key);
      const dated = events.filter((e) => e.start);
      const undated = events.filter((e) => !e.start);
      expect(events.slice(events.length - undated.length)).toEqual(undated);
      const keys = dated.map((e) => (e.start > `${m.iso}-01` ? e.start : `${m.iso}-01`));
      expect(keys).toEqual([...keys].sort());
    }
  });

  it('lists a run that spans two months under both', () => {
    const spans = regionalEvents.filter((e) => e.months.length > 1);
    expect(spans.map((e) => e.slug)).toEqual(['santa-cruz-beach-boardwalk-winter-wonderland']);
    expect(eventsInMonth('november')).toContain(spans[0]);
    expect(eventsInMonth('december')).toContain(spans[0]);
  });

  it('links hubs to their neighbours, with no wrap-around at the ends', () => {
    expect(adjacentMonths('august').prev).toBeUndefined();
    expect(adjacentMonths('august').next.key).toBe('september');
    expect(adjacentMonths('october').prev.key).toBe('september');
    expect(adjacentMonths('october').next.key).toBe('november');
    expect(adjacentMonths('december').next).toBeUndefined();
  });
});

describe('build-time month resolution', () => {
  it('picks the build month when it is in range', () => {
    const { current, next } = currentAndNextMonth(new Date('2026-10-15T12:00:00-07:00'));
    expect(current.key).toBe('october');
    expect(next.key).toBe('november');
  });

  it('clamps a build before the range to the first month', () => {
    expect(currentAndNextMonth(new Date('2026-02-01T12:00:00-08:00')).current.key).toBe(
      'august',
    );
  });

  it('clamps a build after the range to the last month, which has no next', () => {
    const { current, next } = currentAndNextMonth(new Date('2027-03-01T12:00:00-08:00'));
    expect(current.key).toBe('december');
    expect(next).toBeUndefined();
  });
});

describe('pacific offset', () => {
  it('is PDT through November 1 and PST after', () => {
    expect(pacificOffset('2026-08-07')).toBe('-07:00');
    expect(pacificOffset('2026-11-01')).toBe('-07:00');
    expect(pacificOffset('2026-11-02')).toBe('-08:00');
    expect(pacificOffset('2026-12-31')).toBe('-08:00');
  });
});
