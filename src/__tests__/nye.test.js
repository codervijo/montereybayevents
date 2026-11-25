// New Year's Eve 2026 (v2.U): data rules and built output.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const data = JSON.parse(readFileSync(join(root, 'data', 'nye-2026.json'), 'utf8'));
const TAGS = new Set(['free', 'family', '21+', 'dinner', 'party', 'concert', 'comedy', 'hike', 'plunge']);

describe('data/nye-2026.json', () => {
  it('the weekdays the pages print are right', () => {
    const wd = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    expect(wd('2026-12-31')).toBe('Thursday');
    expect(wd('2027-01-01')).toBe('Friday');
  });

  it('every entry is sourced, dated, addressed and in range', () => {
    const ids = new Set();
    for (const e of data.entries) {
      expect(ids.has(e.id), e.id).toBe(false);
      ids.add(e.id);
      expect(e.source_url, e.id).toMatch(/^https:\/\//);
      expect(e.last_verified, e.id).toMatch(/^2026-\d\d-\d\d$/);
      expect(['2026-12-31', '2027-01-01'], e.id).toContain(e.date);
      expect(e.address, e.id).toMatch(/, CA 9\d{4}$/);
      expect(['monterey', 'santa-cruz'], e.id).toContain(e.region);
      for (const t of e.tags) expect(TAGS.has(t), `${e.id} tag ${t}`).toBe(true);
      if (e.start) expect(e.start, e.id).toMatch(/^\d\d:\d\d$/);
      if (e.ages === '21+') expect(e.tags, e.id).toContain('21+');
      expect(e.free === true, e.id).toBe(e.tags.includes('free'));
    }
  });
});

const dist = join(root, 'dist');
const pages = ['new-years-eve', 'new-years-eve/monterey', 'new-years-eve/santa-cruz'];
const built = pages.every((p) => existsSync(join(dist, p, 'index.html')));
const html = (p) => readFileSync(join(dist, p, 'index.html'), 'utf8');
const ld = (h) => [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));

describe.skipIf(!built)('NYE pages (built output)', () => {
  it('JSON-LD parses; every Event has a startDate and a street address', () => {
    for (const p of pages) {
      const nodes = ld(html(p));
      const types = nodes.map((n) => n['@type']);
      expect(types, p).toContain('ItemList');
      expect(types, p).toContain('BreadcrumbList');
      expect(types, p).toContain('FAQPage');
      const events = nodes.filter((n) => n['@type'] === 'Event');
      expect(events.length, p).toBeGreaterThan(0);
      for (const e of events) {
        expect(e.startDate, e.name).toMatch(/^202[67]-\d\d-\d\d/);
        expect(e.location.address.streetAddress, e.name).toBeTruthy();
        expect(e.location.address.addressLocality, e.name).toBeTruthy();
      }
    }
  });

  it('town pages carry the required FAQ questions, filters and the All night block', () => {
    for (const [p, town] of [['new-years-eve/monterey', 'Monterey'], ['new-years-eve/santa-cruz', 'Santa Cruz']]) {
      const h = html(p);
      const faq = ld(h).find((n) => n['@type'] === 'FAQPage').mainEntity.map((q) => q.name);
      expect(faq).toContain(`What is there to do in ${town} on New Year's Eve?`);
      expect(faq).toContain(`Are there fireworks in ${town} on New Year's Eve?`);
      expect(faq.some((q) => /free/i.test(q))).toBe(true);
      expect(faq.some((q) => /kid/i.test(q))).toBe(true);
      expect(faq.some((q) => /New Year's Day/.test(q))).toBe(true);
      expect(h).toContain('id="all-night"');
      expect(h).toContain('Quick picks');
      expect(h).toContain('href="/holiday-lights/"');
      for (const f of ['All', 'Party']) expect(h).toMatch(new RegExp(`data-filter[^>]*>${f}<`));
    }
  });

  it('listings are in start-time order', () => {
    for (const p of pages.slice(1)) {
      const ids = [...html(p).split('id="new-years-day"')[0].matchAll(/<article[^>]* id="([^"]+)" data-tags/g)].map((m) => m[1]);
      const starts = ids.map((id) => data.entries.find((e) => e.id === id)?.start ?? '99');
      expect(starts, p).toEqual([...starts].sort());
    }
  });

  it('is linked from the homepage, December, lights map, Thanksgiving, PG and First Night', () => {
    expect(html('events/december')).toContain('href="/new-years-eve/"');
    expect(html('holiday-lights')).toContain('href="/new-years-eve/"');
    expect(html('thanksgiving')).toContain('href="/new-years-eve/"');
    expect(html('events/pacific-grove')).toContain('href="/new-years-eve/monterey/"');
    expect(html('event/first-night-monterey')).toContain('href="/new-years-eve/monterey/"');
    expect(readFileSync(join(root, 'src', 'pages', 'index.astro'), 'utf8')).toContain('NYE_2026.href');
  });

  it('is in the sitemap', () => {
    const sm = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
    for (const p of pages) expect(sm).toContain(`https://montereybayevents.com/${p}/</loc>`);
  });
});
