// v2.Z venue location maps: every pinned venue has its pin's provenance and
// ODbL-credited OSM data, every rendered map is shown on its event pages, and
// every shown map is in the sitemap.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const { venues } = JSON.parse(readFileSync(join(root, 'data', 'event-venues.json'), 'utf8'));
const dist = join(root, 'dist', 'event');
const built = existsSync(dist);

describe('venue maps (data)', () => {
  it('every venue records where its pin came from', () => {
    for (const [k, v] of Object.entries(venues)) {
      expect(v.osm, k).toBeTruthy();
      expect(Number.isFinite(v.lat) && Number.isFinite(v.lon), k).toBe(true);
    }
  });
  it('every venue has OSM data credited under ODbL, and a rendered map', () => {
    for (const k of Object.keys(venues)) {
      const g = JSON.parse(readFileSync(join(root, 'data', 'geo', 'venues', `${k}.json`), 'utf8'));
      expect(g.credit, k).toMatch(/OpenStreetMap contributors, ODbL/);
      expect(g.features.length, k).toBeGreaterThan(0);
      expect(existsSync(join(root, 'public', 'maps', `venue-${k}.png`)), k).toBe(true);
    }
  });
  it('an event is pinned to at most one venue', () => {
    const all = Object.values(venues).flatMap((v) => v.events);
    expect(new Set(all).size).toBe(all.length);
  });
});

describe.skipIf(!built)('venue maps (built pages)', () => {
  const sm = built ? readFileSync(join(root, 'dist', 'sitemap-0.xml'), 'utf8') : '';
  it('each regional venue map is on its event pages, credited, and in the sitemap', () => {
    for (const [k, v] of Object.entries(venues)) for (const s of v.events) {
      const h = readFileSync(join(dist, s, 'index.html'), 'utf8');
      expect(h, s).toContain(`/maps/venue-${k}.png`);
      expect(h, s).toContain('OpenStreetMap contributors');
      expect(sm, s).toContain(`/maps/venue-${k}.png`);
    }
  });
  it('every page that shows a venue map lists it in the sitemap', () => {
    for (const s of readdirSync(dist)) {
      const f = join(dist, s, 'index.html');
      if (!existsSync(f)) continue;
      const m = readFileSync(f, 'utf8').match(/id="venue-map"[\s\S]*?href="(\/maps\/venue-[a-z0-9-]+\.png)"/);
      if (m) expect(sm, s).toContain(m[1]);
    }
  });
});
