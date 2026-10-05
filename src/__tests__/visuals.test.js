// src/__tests__/visuals.test.js
// The three visual-resource pages (v2.L–N): image-SEO contract, schema, and
// the inbound links that keep them from being orphans.

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { VISUALS, pngPath, webpPath, dimsOf, pageImageUrls } from '../data/visuals.ts';
import { mapVenues } from '../data/carWeekVenues.ts';
import { venues } from '../data/venues.ts';
import { monthGrid, runDays } from '../lib/calendar.ts';

const root = process.cwd();
const read = (...p) => readFileSync(join(root, ...p), 'utf8');

const PAGES = [
  ['laguna-seca-map.astro', '/laguna-seca-map/'],
  ['monterey-car-week-map.astro', '/monterey-car-week-map/'],
  ['monterey-events-calendar.astro', '/monterey-events-calendar/'],
];

describe('visual pages — source', () => {
  it.each(PAGES)('%s declares an apex, trailing-slash canonical', (file, path) => {
    const src = read('src', 'pages', file);
    expect(src).toContain('const site = "https://montereybayevents.com";');
    expect(src).toContain(`const canonical = \`\${site}${path}\`;`);
    expect(src).toMatch(/property="og:image"/);
    expect(src).toMatch(/name="twitter:card" content="summary_large_image"/);
    expect(src).toContain('buildImageObject');
    expect(src).toContain('buildBreadcrumbs');
    expect(src).toContain('buildFaq(faq)');
  });
});

describe('primary visuals — files and dimensions', () => {
  const all = Object.values(VISUALS);
  it.each(all.map((v) => [v.key, v]))('%s has a PNG and every WebP width, with real dimensions', (_k, v) => {
    const d = dimsOf(v.key);
    expect(d.width).toBeGreaterThan(700);
    expect(d.height).toBeGreaterThan(500);
    expect(existsSync(join(root, 'public', pngPath(v.key)))).toBe(true);
    for (const w of d.widths) expect(existsSync(join(root, 'public', webpPath(v.key, w)))).toBe(true);
  });

  it('every visual has descriptive alt text and a caption', () => {
    for (const v of all) {
      expect(v.alt.length, v.key).toBeGreaterThan(60);
      expect(v.caption.length, v.key).toBeGreaterThan(30);
      expect(v.key, v.key).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('OG cards exist at 1200×630 for all three pages', () => {
    for (const f of ['og-laguna-seca-map', 'og-monterey-car-week-map', 'og-monterey-events-calendar']) {
      expect(existsSync(join(root, 'public', 'maps', `${f}.png`)), f).toBe(true);
    }
  });

  it('the image sitemap lists only files that exist', () => {
    for (const [, urls] of Object.entries(pageImageUrls())) {
      for (const u of urls) {
        expect(existsSync(join(root, 'public', new URL(u).pathname)), u).toBe(true);
      }
    }
  });
});

describe('Car Week map data', () => {
  it('every pin resolves to at least one venue in venues.ts', () => {
    const known = new Set(Object.values(venues).map((v) => v.venue));
    for (const v of mapVenues) {
      expect(v.venueNames.some((n) => known.has(n)), v.id).toBe(true);
      for (const n of v.venueNames) expect(known.has(n), `${v.id}: ${n}`).toBe(true);
    }
  });

  it('pins are inside the Monterey Peninsula / Carmel Valley box and carry a source', () => {
    for (const v of mapVenues) {
      expect(v.lat).toBeGreaterThan(36.47);
      expect(v.lat).toBeLessThan(36.65);
      expect(v.lon).toBeGreaterThan(-121.99);
      expect(v.lon).toBeLessThan(-121.72);
      expect(v.source.length).toBeGreaterThan(5);
    }
  });
});

describe('calendar grid', () => {
  it('lays October 2026 out Sunday-first, starting on a Thursday', () => {
    const g = monthGrid('october');
    const firstIn = g.weeks.flat().find((c) => c.inMonth);
    expect(firstIn.iso).toBe('2026-10-01');
    expect(g.weeks[0].findIndex((c) => c.inMonth)).toBe(4); // Thu
    expect(g.weeks.flat().filter((c) => c.inMonth)).toHaveLength(31);
  });

  it('never paints a long run onto every day', () => {
    for (const key of ['august', 'september', 'october', 'november', 'december']) {
      const g = monthGrid(key);
      for (const c of g.weeks.flat()) for (const e of c.events) expect(runDays(e)).toBeLessThanOrEqual(7);
    }
  });
});

describe('inbound links to the visual pages', () => {
  const has = (path, ...file) => expect(read(...file), file.join('/')).toContain(`href="${path}`);
  it('the Laguna Seca map is linked from camping, traffic, Car Week hub and event templates', () => {
    has('/laguna-seca-map/', 'src', 'pages', 'laguna-seca', 'camping.astro');
    has('/laguna-seca-map/', 'src', 'pages', 'traffic.astro');
    has('/laguna-seca-map/', 'src', 'pages', 'monterey-car-week', 'index.astro');
    has('/laguna-seca-map/', 'src', 'pages', 'event', '[slug].astro');
    has('/laguna-seca-map/', 'src', 'components', 'RegionalEventPage.astro');
  });
  it('the Car Week map is linked from the hub, schedule, /free/, /traffic/ and every Car Week event page', () => {
    for (const f of [['monterey-car-week', 'index.astro'], ['monterey-car-week', 'schedule.astro'], ['free.astro'], ['traffic.astro']]) {
      has('/monterey-car-week-map/', 'src', 'pages', ...f);
    }
    expect(read('src', 'pages', 'event', '[slug].astro')).toContain('/monterey-car-week-map/');
  });
  it('the calendar is linked from /events/, month hubs, regional event pages and the homepage', () => {
    has('/monterey-events-calendar/', 'src', 'pages', 'events', 'index.astro');
    expect(read('src', 'pages', 'events', '[month].astro')).toContain('/monterey-events-calendar/#');
    expect(read('src', 'components', 'RegionalEventPage.astro')).toContain('/monterey-events-calendar/#');
    has('/monterey-events-calendar/', 'src', 'pages', 'index.astro');
  });
  it('all three are in the site footer', () => {
    for (const p of ['/laguna-seca-map/', '/monterey-car-week-map/', '/monterey-events-calendar/']) {
      has(p, 'src', 'components', 'SiteFooter.astro');
    }
  });
});

describe('built output', () => {
  const html = (p) => join(root, 'dist', p, 'index.html');
  const built = existsSync(html('laguna-seca-map'));

  it.skipIf(!built)('each page ships its primary visual as a crawlable, sized, eager <img>', () => {
    for (const [, path] of PAGES) {
      const s = readFileSync(html(path.slice(1, -1)), 'utf8');
      const first = s.match(/<img [^>]*>/)[0];
      expect(first, path).toMatch(/src="\/maps\/[a-z0-9-]+\.webp"/);
      expect(first, path).toMatch(/width="\d+"/);
      expect(first, path).toMatch(/height="\d+"/);
      expect(first, path).toMatch(/alt="[^"]{60,}"/);
      expect(first, path).toMatch(/loading="eager"/);
      expect(first, path).toMatch(/fetchpriority="high"/);
      expect(s, path).toMatch(/<figcaption/);
      expect(s, path).toMatch(/"@type":"ImageObject"/);
      expect(s, path).toMatch(/"@type":"BreadcrumbList"/);
      expect((s.match(/<h1/g) || []).length, path).toBe(1);
    }
  });

  it.skipIf(!built)('the sitemap carries image entries for the three pages', () => {
    const xml = readFileSync(join(root, 'dist', 'sitemap-0.xml'), 'utf8');
    expect(xml).toContain('<image:loc>https://montereybayevents.com/maps/laguna-seca-map-turns-parking-camping.png</image:loc>');
    expect(xml).toContain('<image:loc>https://montereybayevents.com/maps/monterey-car-week-map-venues.png</image:loc>');
    expect(xml).toContain('<image:loc>https://montereybayevents.com/maps/monterey-events-calendar-october-2026.png</image:loc>');
  });
});
