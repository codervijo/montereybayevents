// "Things to Do" town hubs (v7.B): data rules and built output.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const dataDir = join(root, 'data', 'things-to-do');
const towns = readdirSync(dataDir).filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
const SECTIONS = new Set(['top-sights', 'beaches-coast', 'outdoors-hikes', 'kids-families', 'free', 'food-drink', 'rainy-day', 'nightlife', 'day-trips']);

describe('data/things-to-do/*.json', () => {
  for (const t of towns) {
    const d = JSON.parse(readFileSync(join(dataDir, `${t}.json`), 'utf8'));
    it(`${t}: every item is sourced, dated, placed and unique`, () => {
      const ids = new Set();
      for (const i of d.items) {
        expect(ids.has(i.id), i.id).toBe(false);
        ids.add(i.id);
        expect(SECTIONS.has(i.section), `${i.id} section`).toBe(true);
        expect(i.official_url, i.id).toMatch(/^https:\/\//);
        expect(i.last_verified, i.id).toMatch(/^20\d\d-\d\d-\d\d$/);
        expect(i.description.length, i.id).toBeGreaterThan(20);
        expect(i.address, i.id).toBeTruthy();
        // Inside the Monterey Bay / Big Sur box.
        expect(i.lat, i.id).toBeGreaterThan(35.8);
        expect(i.lat, i.id).toBeLessThan(37.3);
        expect(i.lng, i.id).toBeGreaterThan(-122.4);
        expect(i.lng, i.id).toBeLessThan(-121.3);
        if (i.free === true) expect(i.cost ?? 'Free', i.id).toMatch(/free/i);
      }
    });
  }
});

const dist = join(root, 'dist', 'things-to-do');
const built = existsSync(join(dist, 'index.html'));
const ld = (h) => [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));

describe.skipIf(!built)('/things-to-do/ (built output)', () => {
  for (const t of towns) {
    it(`${t}: JSON-LD, sections, map, this-week block and FAQ`, () => {
      const h = readFileSync(join(dist, t, 'index.html'), 'utf8');
      const nodes = ld(h);
      const list = nodes.find((n) => n['@type'] === 'ItemList');
      const d = JSON.parse(readFileSync(join(dataDir, `${t}.json`), 'utf8'));
      expect(list.numberOfItems).toBe(d.items.length);
      for (const el of list.itemListElement) {
        expect(el.item['@type']).toBe('TouristAttraction');
        expect(el.item.geo.latitude).toBeTypeOf('number');
      }
      expect(nodes.map((n) => n['@type'])).toEqual(expect.arrayContaining(['BreadcrumbList', 'FAQPage']));
      const faq = nodes.find((n) => n['@type'] === 'FAQPage').mainEntity.map((q) => q.name.toLowerCase());
      for (const k of ['free', 'kids', 'rainy', 'how many days', 'best time']) expect(faq.some((q) => q.includes(k)), k).toBe(true);
      expect(h).toContain('id="this-week"');
      expect(h).toContain('class="places-map-wrap"');
      expect(h).toContain('Quick picks');
      expect((h.match(/<h1/g) ?? []).length).toBe(1);
      for (const i of d.items) expect(h, i.id).toContain(`id="${i.id}"`);
    });
  }

  it('no two built pages share a <title> or an <h1>', () => {
    const files = [];
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) walk(join(dir, e.name));
        else if (e.name === 'index.html') files.push(join(dir, e.name));
      }
    };
    walk(join(root, 'dist'));
    const seenT = new Map(), seenH = new Map();
    const dupT = [], dupH = [];
    for (const f of files) {
      const h = readFileSync(f, 'utf8');
      if (/name="robots" content="noindex/.test(h)) continue;
      const t = h.match(/<title>(.*?)<\/title>/s)?.[1]?.trim();
      const h1 = h.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (t) { if (seenT.has(t)) dupT.push(`${t} (${seenT.get(t)} & ${f})`); else seenT.set(t, f); }
      if (h1) { if (seenH.has(h1)) dupH.push(`${h1} (${seenH.get(h1)} & ${f})`); else seenH.set(h1, f); }
    }
    expect(dupT).toEqual([]);
    expect(dupH).toEqual([]);
  });
});
