// v2.Z landmark venue photos: public domain / CC0 only, every one with its
// source, author and licence recorded, rendered, credited on the page, and in
// the sitemap.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');
const { photos } = JSON.parse(readFileSync(join(root, 'data', 'venue-photos.json'), 'utf8'));
const { venues } = JSON.parse(readFileSync(join(root, 'data', 'event-venues.json'), 'utf8'));
const built = existsSync(join(root, 'dist', 'event'));

describe('venue photos (data)', () => {
  it('only public domain or CC0, with source, author, date and licence URL', () => {
    for (const [k, p] of Object.entries(photos)) {
      expect(['Public domain', 'CC0 1.0'], k).toContain(p.licence);
      for (const f of ['source', 'author', 'date', 'licenceUrl', 'alt', 'caption']) expect(p[f], `${k} ${f}`).toBeTruthy();
      expect(p.source, k).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    }
  });
  it('each photo belongs to a pinned venue and is rendered', () => {
    for (const k of Object.keys(photos)) {
      expect(venues[k], k).toBeTruthy();
      for (const f of [`${k}.jpg`, `${k}-800.webp`, `${k}-1200.webp`]) expect(existsSync(join(root, 'public', 'photos', 'venues', f)), f).toBe(true);
    }
  });
});

describe.skipIf(!built)('venue photos (built pages)', () => {
  const sm = built ? readFileSync(join(root, 'dist', 'sitemap-0.xml'), 'utf8') : '';
  it('shows the photo with author and licence on each event at the venue, and lists it in the sitemap', () => {
    for (const [k, p] of Object.entries(photos)) for (const s of venues[k].events) {
      const h = readFileSync(join(root, 'dist', 'event', s, 'index.html'), 'utf8');
      expect(h, s).toContain(`/photos/venues/${k}.jpg`);
      expect(h, s).toContain(p.author);
      expect(h, s).toContain(p.licenceUrl);
      expect(sm, s).toContain(`/photos/venues/${k}.jpg`);
    }
  });
});
