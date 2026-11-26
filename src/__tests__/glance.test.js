// v2.Z "at a glance" cards: one committed PNG per event page, shown on the page,
// listed in the sitemap, with alt text built from the same rows as the image.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { allGlances, glanceAlt, glanceKey } from '../data/glance.ts';

const root = join(import.meta.dirname, '..', '..');
const dist = join(root, 'dist', 'event');
const built = existsSync(dist);

describe('glance cards (data)', () => {
  const gs = allGlances();
  it('one card per event page, each committed to public/og/', () => {
    expect(new Set(gs.map((g) => g.slug)).size).toBe(gs.length);
    for (const g of gs) expect(existsSync(join(root, 'public', 'og', `${glanceKey(g.slug)}.png`)), g.slug).toBe(true);
  });
  it('never invents a value: empty fields say so in words', () => {
    for (const g of gs) for (const r of g.rows) expect(r.value.trim(), `${g.slug} ${r.label}`).not.toBe('');
  });
});

describe.skipIf(!built)('glance cards (built pages)', () => {
  const slugs = readdirSync(dist).filter((s) => existsSync(join(dist, s, 'index.html')));
  const bySlug = new Map(allGlances().map((g) => [g.slug, g]));
  it('every event page shows its card with alt text matching the image rows', () => {
    for (const s of slugs) {
      const h = readFileSync(join(dist, s, 'index.html'), 'utf8');
      const g = bySlug.get(s);
      expect(g, s).toBeTruthy();
      expect(h, s).toContain(`src="/og/glance-${s}.png"`);
      const m = h.match(new RegExp(`<img src="/og/glance-${s}\\.png"[^>]*alt="([^"]*)"`));
      const unesc = (x) => x.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      expect(m && unesc(m[1]), s).toBe(glanceAlt(g));
    }
  });
  it('lists every card in the sitemap', () => {
    const sm = readFileSync(join(root, 'dist', 'sitemap-0.xml'), 'utf8');
    for (const s of slugs) expect(sm, s).toContain(`/og/glance-${s}.png`);
  });
});
