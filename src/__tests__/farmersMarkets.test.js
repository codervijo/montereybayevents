// src/__tests__/farmersMarkets.test.js
//
// The weekly rules behind /monterey-farmers-market/: which market runs on a
// given date, the "open today" sentence, and the Event JSON-LD built from them.
// Dates are checked against real 2026 weekdays (`date -d`), per docs/CLAUDE.md.

import { describe, it, expect } from 'vitest';
import {
  montereyCityMarkets as farmersMarkets,
  montereyCountyMarkets,
  santaCruzCountyMarkets,
  sessionsOn,
  nextSessionAfter,
  openTodayLine,
  buildMarketJsonLd,
  weekdayOf,
  formatClock,
  formatHours,
  monthSpan,
  pacificOffsetOn,
} from '../data/farmersMarkets.ts';

const byId = Object.fromEntries(farmersMarkets.map((m) => [m.id, m]));

describe('weekly rules', () => {
  it('knows its weekdays', () => {
    expect(weekdayOf('2026-10-03')).toBe('Saturday');
    expect(weekdayOf('2026-10-06')).toBe('Tuesday');
    expect(weekdayOf('2026-09-27')).toBe('Sunday');
  });

  it('Old Monterey closes at 7pm in October and 8pm in September', () => {
    const [oct] = sessionsOn('2026-10-06');
    expect(oct.market.id).toBe('old-monterey');
    expect(oct.hours.end).toBe('19:00');
    const [sep] = sessionsOn('2026-09-29');
    expect(sep.hours.end).toBe('20:00');
  });

  it('the Sunday market ran on its published final day and not the week after', () => {
    expect(sessionsOn('2026-09-27').map((s) => s.market.id)).toEqual(['del-monte-sunday']);
    expect(sessionsOn('2026-10-04')).toEqual([]);
  });

  it('the Friday market runs year round', () => {
    for (const d of ['2026-10-09', '2027-01-08', '2027-07-02']) {
      expect(sessionsOn(d).map((s) => s.market.id)).toEqual(['monterey-friday']);
    }
  });

  it('no market on Monday, Wednesday, Thursday or Saturday', () => {
    for (const d of ['2026-10-05', '2026-10-07', '2026-10-08', '2026-10-03']) {
      expect(sessionsOn(d)).toEqual([]);
    }
  });

  it('never projects an out-of-season market into an unannounced date', () => {
    // From any October day, the next session is at most a week out and is never Sunday.
    const n = nextSessionAfter('2026-10-03');
    expect(n.date).toBe('2026-10-06');
    expect(n.market.id).toBe('old-monterey');
  });
});

describe('open-today line', () => {
  it('says closed, and names the next market, on a Saturday', () => {
    expect(openTodayLine('2026-10-03')).toBe(
      'No farmers market in Monterey today, Saturday 3 October. Next: Tuesday 6 October, Old Monterey Marketplace & Farmers Market, 4–7pm at Alvarado Street, downtown Monterey.',
    );
  });

  it('says open on a Friday', () => {
    expect(openTodayLine('2026-10-09')).toBe(
      'Open today, Friday 9 October: Monterey Farmers Market (Friday), 8am–noon at Del Monte Shopping Center.',
    );
  });
});

describe('formatting', () => {
  it('formats clock times and month spans', () => {
    expect(formatClock('16:00')).toBe('4pm');
    expect(formatClock('12:00')).toBe('noon');
    expect(formatClock('08:30')).toBe('8:30am');
    expect(formatHours({ start: '16:00', end: '19:00' })).toBe('4–7pm');
    expect(formatHours({ start: '08:00', end: '12:00' })).toBe('8am–noon');
    expect(formatHours({ start: '10:30', end: '14:00' })).toBe('10:30am–2pm');
    expect(monthSpan([10, 11, 12, 1, 2, 3, 4])).toBe('Oct–Apr');
    expect(monthSpan([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBe('year round');
  });

  it('uses real DST rules for the offset', () => {
    expect(pacificOffsetOn('2026-10-06')).toBe('-07:00');
    expect(pacificOffsetOn('2026-11-03')).toBe('-08:00');
  });
});

describe('Event JSON-LD', () => {
  it('carries one Schedule per seasonal block, with a full address and the official url', () => {
    const node = buildMarketJsonLd(byId['old-monterey'], '2026-10-03');
    expect(node['@type']).toBe('Event');
    expect(node.eventSchedule).toHaveLength(2);
    expect(node.eventSchedule[0]).toMatchObject({
      '@type': 'Schedule',
      byDay: 'https://schema.org/Tuesday',
      startTime: '16:00:00',
      endTime: '19:00:00',
      repeatFrequency: 'P1W',
      scheduleTimezone: 'America/Los_Angeles',
    });
    expect(node.location.address).toMatchObject({
      addressLocality: 'Monterey',
      addressRegion: 'CA',
      postalCode: '93940',
    });
    expect(node.url).toBe(byId['old-monterey'].officialUrl);
    expect(node.startDate).toBe('2026-10-06T16:00:00-07:00');
  });

  it('omits startDate for an out-of-season market rather than inventing one', () => {
    const node = buildMarketJsonLd(byId['del-monte-sunday'], '2026-10-03');
    expect(node.startDate).toBeUndefined();
    expect(node.eventSchedule[0].byMonth).toEqual([5, 6, 7, 8, 9]);
  });

  it('vendor lists are the operator\'s, with a source link', () => {
    expect(byId['monterey-friday'].vendors.length).toBe(49);
    expect(byId['del-monte-sunday'].vendors.length).toBe(5);
    for (const m of farmersMarkets) {
      if (m.vendors) expect(m.vendorsUrl, m.id).toMatch(/^https:\/\/montereybayfarmers\.org\//);
    }
  });

  it('every market cites at least one official source', () => {
    for (const m of farmersMarkets) {
      expect(m.sources.length, m.id).toBeGreaterThan(0);
      expect(m.officialUrl).toMatch(/^https:\/\//);
    }
  });
});

describe('two counties', () => {
  const all = [...montereyCountyMarkets, ...santaCruzCountyMarkets];
  const id = Object.fromEntries(all.map((m) => [m.id, m]));

  it('ids are unique and every row is dated, cited and in its county', () => {
    expect(new Set(all.map((m) => m.id)).size).toBe(all.length);
    for (const m of montereyCountyMarkets) expect(m.county, m.id).toBe('Monterey');
    for (const m of santaCruzCountyMarkets) expect(m.county, m.id).toBe('Santa Cruz');
    for (const m of all) {
      expect(m.verified, m.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(m.sources.length, m.id).toBeGreaterThan(0);
    }
  });

  it('honours published season dates exactly', () => {
    // Felton: Tuesdays 5 May – 27 October 2026.
    expect(sessionsOn('2026-10-27', [id.felton]).length).toBe(1);
    expect(sessionsOn('2026-10-20', [id.felton]).length).toBe(1);
    expect(sessionsOn('2026-11-03', [id.felton]).length).toBe(0);
    // Alisal summer season ends Tuesday 20 October; winter schedule unpublished.
    expect(sessionsOn('2026-10-20', [id.alisal]).length).toBe(1);
    expect(sessionsOn('2026-10-27', [id.alisal]).length).toBe(0);
    // Scotts Valley: last market Saturday 21 November.
    expect(sessionsOn('2026-11-21', [id['scotts-valley']]).length).toBe(1);
    expect(sessionsOn('2026-11-28', [id['scotts-valley']]).length).toBe(0);
  });

  it('open-today line spans the county and names the city when it differs', () => {
    expect(openTodayLine('2026-10-03', montereyCountyMarkets, 'Monterey County')).toBe(
      'Open today, Saturday 3 October: Salinas Farmers Market (Oldtown), 9am–2pm at 300 block of Main Street, Oldtown Salinas, Salinas.',
    );
    const sc = openTodayLine('2026-10-03', santaCruzCountyMarkets, 'Santa Cruz County');
    expect(sc).toContain('Westside Santa Cruz Farmers\' Market, 9am–1pm');
    expect(sc).toContain('Aptos Farmers Market at Cabrillo College, 8am–noon at Cabrillo College, Aptos');
    expect(sc).toContain('Scotts Valley');
  });

  it('a caveated closing time stays out of the JSON-LD', () => {
    const node = buildMarketJsonLd(id['pacific-grove'], '2026-10-03');
    expect(node.eventSchedule[0].endTime).toBeUndefined();
    expect(node.endDate).toBeUndefined();
    expect(node.startDate).toBe('2026-10-05T15:00:00-07:00');
    expect(node.location.address.addressLocality).toBe('Pacific Grove');
    expect(node.location.address.postalCode).toBeUndefined();
  });
});
