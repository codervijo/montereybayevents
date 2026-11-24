// v2.T — the Holiday Lights Map dataset (data/holiday-lights-2026.json) and its page.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const data = JSON.parse(readFileSync(join(root, 'data', 'holiday-lights-2026.json'), 'utf8'));
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const DAY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

describe('holiday lights data', () => {
  it('has unique ids and every required field', () => {
    const ids = data.entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of data.entries) {
      for (const k of ['id', 'name', 'category', 'town', 'address', 'dates_text', 'source_url', 'last_verified', 'geo_precision'])
        expect(e[k], `${e.id}.${k}`).toBeTruthy();
      expect(data.categories[e.category], `${e.id} category`).toBeDefined();
      expect(e.source_url, e.id).toMatch(/^https:\/\//);
      expect(['address', 'venue', 'street', 'town']).toContain(e.geo_precision);
      for (const k of ['hours', 'cost', 'free', 'kids', 'parking_tip', 'event_page']) expect(k in e, `${e.id}.${k}`).toBe(true);
    }
  });

  it('places every pin inside the Monterey Bay area', () => {
    for (const e of data.entries) {
      expect(e.lat, e.id).toBeGreaterThan(36.4);
      expect(e.lat, e.id).toBeLessThan(37.25);
      expect(e.lng, e.id).toBeGreaterThan(-122.3);
      expect(e.lng, e.id).toBeLessThan(-121.5);
    }
  });

  it('dates every entry: sorted nights or a range, never both', () => {
    for (const e of data.entries) {
      expect(!!e.nights !== !!e.range, e.id).toBe(true);
      const ds = e.nights ?? [e.range.from, e.range.to];
      for (const d of ds) expect(d, e.id).toMatch(ISO);
      expect([...ds].sort(), e.id).toEqual(ds);
    }
  });

  it('names the right weekday for single-night entries', () => {
    for (const e of data.entries.filter((x) => x.nights?.length === 1)) {
      const m = e.dates_text.match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/);
      if (!m) continue;
      expect(new Date(`${e.nights[0]}T12:00:00Z`).getUTCDay(), e.id).toBe(DAY[m[1]]);
    }
  });

  it('links only to event pages that exist', async () => {
    const { regionalEvents } = await import('../data/events-2026.ts');
    for (const e of data.entries.filter((x) => x.event_page))
      expect(regionalEvents.some((r) => r.slug === e.event_page), e.event_page).toBe(true);
  });
});

describe('/holiday-lights/ (built)', () => {
  const page = join(root, 'dist', 'holiday-lights', 'index.html');
  const built = existsSync(page);
  const html = built ? readFileSync(page, 'utf8') : '';

  it.skipIf(!built)('server-renders every spot with its anchor, and carries the structured data', () => {
    expect(html).toMatch(/<h1[\s>]/);
    for (const e of data.entries) expect(html, e.id).toContain(`id="${e.id}"`);
    for (const t of ['"ItemList"', '"FAQPage"', '"BreadcrumbList"', '"Event"']) expect(html).toContain(t);
    expect(html).not.toMatch(/\(\d+\+? Spots\)/);
  });

  it.skipIf(!built)('ships a noindex embed', () => {
    const embed = readFileSync(join(root, 'dist', 'holiday-lights', 'embed', 'index.html'), 'utf8');
    expect(embed).toContain('noindex');
  });
});

describe('guide links', () => {
  it('never end in an arrow (the template adds one)', () => {
    const src = readFileSync(join(root, 'src', 'data', 'events-2026.ts'), 'utf8');
    expect(src).not.toMatch(/label: "[^"]*→",/);
  });
});

// Review fixes, 2026-11-24.
describe.skipIf(!existsSync(join(root, 'dist', 'holiday-lights', 'index.html')))('/holiday-lights/ review fixes (built)', () => {
  const html = readFileSync(join(root, 'dist', 'holiday-lights', 'index.html'), 'utf8');
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  it('publishes no lit-hours figure for Christmas on the Wharf', () => {
    expect(html).not.toContain('9am–10pm');
    expect(html).not.toContain('lit to 10pm');
  });

  it('counts the Boardwalk drone show among the tree lightings', () => {
    const n = data.entries.filter((e) => e.category === 'tree-lighting' || /tree lighting/i.test(e.name)).length;
    expect(text).toContain(`${n} tree lightings between`);
  });

  it('starts the season on the earliest date in the data', () => {
    const first = data.entries.map((e) => e.range?.from ?? e.nights[0]).sort()[0];
    expect(first).toBe('2026-11-21');
    expect(text).toContain('21 November 2026 – 3 January 2027');
  });

  it('describes the Santa Cruz timing as the data has it', () => {
    expect(text).not.toContain('within half an hour');
    expect(text).toContain('between 5pm and 6pm');
  });

  it('calls them routes, not loops', () => {
    expect(text).not.toMatch(/\bloops?\b/i);
  });

  it('marks required suggest fields and has no visible honeypot label', () => {
    expect(html).not.toContain('Leave empty');
    expect((html.match(/aria-required="true"/g) ?? []).length).toBe(2);
    expect(text).toContain('are required');
  });
});

describe('holiday lights towns', () => {
  it('lists every town in the data in LIGHTS_TOWNS order', () => {
    const src = readFileSync(join(root, 'src', 'data', 'holidayLights.ts'), 'utf8');
    for (const t of new Set(data.entries.map((e) => e.town))) expect(src, t).toContain(`"${t}"`);
  });
});

describe.skipIf(!existsSync(join(root, 'dist', 'holiday-lights', 'index.html')))('/holiday-lights/ round 2 (built)', () => {
  const html = readFileSync(join(root, 'dist', 'holiday-lights', 'index.html'), 'utf8');
  it('labels the Boardwalk free entry and files the train under Trains & rides', () => {
    expect(html).toContain('Free entry (rides extra)');
    expect(html).toContain('Trains &amp; rides');
  });
  it('puts the Carmel fire-truck and menorah times on the card', () => {
    expect(html).toContain('Santa arrives by fire truck 3:30pm, menorah lit 4pm');
  });
  it('every Event node has startDate, location and address', () => {
    const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
    const events = ld.filter((j) => j['@type'] === 'Event');
    expect(events.length).toBeGreaterThan(0);
    for (const e of events) {
      expect(e.startDate, e.name).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.location?.address?.streetAddress, e.name).toBeTruthy();
    }
  });
});
