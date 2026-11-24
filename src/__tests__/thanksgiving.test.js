// /thanksgiving/ fixes (2026-11-24) and the /sitemap.xml redirect.
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..', '..');

describe('/sitemap.xml', () => {
  it('301s to the sitemap index Astro emits', () => {
    const r = readFileSync(join(root, 'public', '_redirects'), 'utf8');
    expect(r).toMatch(/^\/sitemap\.xml \/sitemap-index\.xml 301$/m);
  });
});

const page = join(root, 'dist', 'thanksgiving', 'index.html');
const built = existsSync(page);
const html = built ? readFileSync(page, 'utf8') : '';
const section = (id) => {
  const i = html.indexOf(`id="${id}"`);
  const j = html.indexOf('</section>', i);
  return html.slice(i, j);
};

describe.skipIf(!built)('/thanksgiving/ (built output)', () => {
  it('lists the ongoing events once, in "All weekend", and not under any day', () => {
    const all = section('all-weekend');
    expect(all).toContain('All weekend');
    for (const slug of ['ice-skating-by-the-bay', 'santa-cruz-beach-boardwalk-winter-wonderland', 'sparkys-holiday-lights', 'winter-wonderfest-monterey', 'downtown-santa-cruz-makers-market-holiday-pop-up']) {
      expect(all, slug).toContain(`/event/${slug}/`);
      for (const d of ['2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29'])
        expect(section(d), `${slug} on ${d}`).not.toContain(`/event/${slug}/`);
    }
  });

  it('has no "· Sunday" suffix on the Sunday heading', () => {
    expect(html).not.toMatch(/Sunday 29 November\s*(<[^>]+>\s*)*·\s*Sunday/);
  });

  it('keeps Capitola Mall out of the Monterey FAQ', () => {
    const ld = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));
    const faq = ld.find((j) => j['@type'] === 'FAQPage');
    const monterey = faq.mainEntity.find((q) => q.name.includes('Thanksgiving in Monterey'));
    expect(monterey.acceptedAnswer.text).not.toContain('Capitola');
  });

  it('links the holiday lights map from the intro and the tree lightings section', () => {
    expect((html.match(/href="\/holiday-lights\/"/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it('does not list Sparky\'s under Thanksgiving Day things to do', () => {
    const i = html.indexOf('Things to do on Thanksgiving Day');
    expect(html.slice(i, html.indexOf('</section>', i))).not.toContain('sparkys-holiday-lights');
  });
});

describe.skipIf(!built)('/thanksgiving/ round 2 (built output)', () => {
  it('labels Sunday like the other days', () => {
    expect(html).toMatch(/Sunday 29 November\s*(<[^>]+>\s*)*·\s*Holiday Parade of Lights/);
  });

  it('keeps the rink and the Boardwalk out of "Things to do on Thanksgiving Day"', () => {
    const i = html.indexOf('Things to do on Thanksgiving Day');
    const day = html.slice(i, html.indexOf('</section>', i));
    expect(day).not.toContain('/event/ice-skating-by-the-bay/');
    expect(day).not.toContain('/event/santa-cruz-beach-boardwalk-winter-wonderland/');
    expect(section('all-weekend')).toContain('Opens for the season on Thanksgiving Day, 12pm–8pm');
  });
});

const evDir = join(root, 'dist', 'event');
describe.skipIf(!existsSync(evDir))('holiday event pages link the lights map', () => {
  it('every Holiday-category listing links /holiday-lights/', () => {
    const src = readFileSync(join(root, 'src', 'data', 'events-2026.ts'), 'utf8');
    const slugs = src.split('\n    slug: "').slice(1)
      .filter((p) => /category: "Holiday/.test(p.split('\n  },')[0]))
      .map((p) => p.split('"')[0]);
    expect(slugs.length).toBeGreaterThan(10);
    for (const s of slugs) {
      const f = join(evDir, s, 'index.html');
      if (!existsSync(f)) continue; // past/undated rows may not build a page
      expect(readFileSync(f, 'utf8'), s).toContain('href="/holiday-lights/"');
    }
  });
});
