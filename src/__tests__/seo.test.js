// src/__tests__/seo.test.js
// Technical-SEO regression check for Astro. Reads page sources, strips
// frontmatter where only the markup matters, and asserts the SEO baseline plus
// the site-structure invariants (apex canonicals, trailing slashes, the
// /schedule/ → /monterey-car-week/schedule/ 301, footer email capture).

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (...p) => readFileSync(join(root, ...p), 'utf8');
const body = (src) => src.replace(/^---[\s\S]*?---\n/, '');

const index = read('src', 'pages', 'index.astro');
const indexHtml = body(index);
const free = read('src', 'pages', 'free.astro');
const eventsIndex = read('src', 'pages', 'events', 'index.astro');
const monthHub = read('src', 'pages', 'events', '[month].astro');
const eventPage = read('src', 'pages', 'event', '[slug].astro');
const regionalPage = read('src', 'components', 'RegionalEventPage.astro');
const hub = read('src', 'pages', 'monterey-car-week', 'index.astro');
const hubSchedule = read('src', 'pages', 'monterey-car-week', 'schedule.astro');
const header = read('src', 'components', 'SiteHeader.tsx');
const footer = read('src', 'components', 'SiteFooter.astro');
const config = read('astro.config.mjs');
const redirects = read('public', '_redirects');

describe('SEO baseline (src/pages/index.astro)', () => {
  it('has a <title>', () => {
    expect(indexHtml).toMatch(/<title>/);
  });

  it('has <meta name="description">', () => {
    expect(indexHtml).toMatch(/<meta\s+name="description"/);
  });

  it('has <link rel="canonical">', () => {
    expect(indexHtml).toMatch(/<link\s+rel="canonical"/);
  });

  it('has Open Graph tags', () => {
    expect(indexHtml).toMatch(/property="og:title"/);
    expect(indexHtml).toMatch(/property="og:url"/);
  });

  it('has Twitter card meta', () => {
    expect(indexHtml).toMatch(/name="twitter:card"/);
  });

  it('has favicon link', () => {
    expect(indexHtml).toMatch(/<link\s+rel="icon"[^>]*href="\/favicon\.svg"/);
  });

  it('has JSON-LD Organization + WebSite', () => {
    expect(indexHtml).toMatch(/application\/ld\+json/);
    expect(indexHtml).toMatch(/"@type":\s*"Organization"/);
    expect(indexHtml).toMatch(/"@type":\s*"WebSite"/);
  });
});

describe('canonicals — apex host, trailing slash (CHECK_161)', () => {
  const pages = [
    ['index.astro', index, '`${site}/`'],
    ['free.astro', free, '`${site}/free/`'],
    ['monterey-car-week/index.astro', hub, '`${site}/monterey-car-week/`'],
    ['monterey-car-week/schedule.astro', hubSchedule, '`${site}/monterey-car-week/schedule/`'],
  ];

  it.each(pages)('%s declares the expected canonical', (_name, src, expected) => {
    expect(src).toContain(`const canonical = ${expected};`);
    expect(src).toContain("const site = 'https://montereybayevents.com';".replace(/'/g, '"'));
  });

  it('every page under src/pages declares a canonical', () => {
    const pageFiles = [];
    const walk = (dir) => {
      for (const entry of readdirSync(join(root, ...dir), { withFileTypes: true })) {
        if (entry.isDirectory()) walk([...dir, entry.name]);
        else if (entry.name.endsWith('.astro')) pageFiles.push([...dir, entry.name]);
      }
    };
    walk(['src', 'pages']);
    expect(pageFiles.length).toBeGreaterThan(4);
    for (const p of pageFiles) {
      // 404 is noindex by design and needs no canonical.
      if (p[p.length - 1] === '404.astro') continue;
      expect(read(...p), p.join('/')).toMatch(/rel="canonical"/);
    }
  });

  it('no canonical or site constant uses the www host', () => {
    for (const [name, src] of [
      ['index', index],
      ['free', free],
      ['hub', hub],
      ['hubSchedule', hubSchedule],
    ]) {
      expect(src, name).not.toContain('www.montereybayevents.com');
    }
  });
});

describe('/free/ page', () => {
  it('is titled "Free Monterey Car Week Events 2026"', () => {
    expect(free).toContain("const title = 'Free Monterey Car Week Events 2026';".replace(/'/g, '"'));
    expect(body(free)).toMatch(/Free Monterey[\s\S]{0,60}Car Week[\s\S]{0,40}Events 2026/);
  });

  it('emits an ItemList JSON-LD block', () => {
    expect(free).toMatch(/"@type":\s*"ItemList"/);
    expect(free).toMatch(/itemListElement/);
    expect(free).toMatch(/"@type":\s*"ListItem"/);
    expect(body(free)).toMatch(/application\/ld\+json/);
  });

  it('lists events grouped by day, each linking to its /event/ page', () => {
    expect(free).toContain('freeEventsByDay');
    expect(body(free)).toContain('href={e.href}');
  });

  it('renders the admission label, venue and time for each listing', () => {
    expect(body(free)).toContain('e.accessLabel');
    expect(body(free)).toContain('e.venue.venue');
    expect(body(free)).toContain('formatTime(e.startTime)');
  });

  // Was: "/free/ is linked prominently from the homepage hero". That was right
  // in v1.A, when Car Week was ahead and /free/ was the site's free-intent
  // page. Every listing on /free/ is a Car Week event, so from 17 August 2026
  // it points at a page where nothing is upcoming — and a primary homepage CTA
  // to a dead page is worse than no CTA. The rule the old test was protecting
  // is asserted here instead: /free/ stays reachable and stays prominent on the
  // Car Week pages, where its content actually lives, but the homepage hero
  // offers it only while Car Week is still ahead.
  //
  // When v1.C gives the regional set admission data, /free/ gains year-round
  // content and this can go back to being unconditional.
  it('offers /free/ in the homepage hero only while Car Week is ahead', () => {
    const hero = indexHtml.slice(0, indexHtml.indexOf('Featured slot'));
    // Still referenced from the hero — but behind the carWeekIsPast branch.
    expect(hero).toContain('"/free/"');
    expect(hero).toContain('carWeekIsPast');
    // Never an unconditional primary CTA in the hero any more.
    expect(hero).not.toContain('href="/free/"');
  });

  it('stays prominently linked from the Car Week hub and schedule', () => {
    expect(hubSchedule).toContain('href="/free/"');
    expect(hub).toContain('href="/free/"');
  });
});

describe('site structure — Car Week is a section', () => {
  it('the Car Week hub lives at /monterey-car-week/', () => {
    expect(hub).toContain('/monterey-car-week/');
    expect(hub).toMatch(/"@type":\s*"Event"|'@type': 'Event'|"@type": "Event"/);
  });

  it('301s the old /schedule/ URL to the new one', () => {
    expect(redirects).toMatch(
      /^\/schedule\/\s+\/monterey-car-week\/schedule\/\s+301$/m,
    );
    expect(redirects).toMatch(/^\/schedule\s+\/monterey-car-week\/schedule\/\s+301$/m);
  });

  it('no page still links to the retired /schedule/ path', () => {
    const sources = [];
    const walk = (dir) => {
      for (const entry of readdirSync(join(root, ...dir), { withFileTypes: true })) {
        if (entry.name === '__tests__') continue;
        if (entry.isDirectory()) walk([...dir, entry.name]);
        else if (/\.(astro|tsx?|jsx?)$/.test(entry.name)) sources.push([...dir, entry.name]);
      }
    };
    walk(['src']);
    for (const p of sources) {
      const src = read(...p);
      // Matches href="/schedule/..." but not "/monterey-car-week/schedule/".
      expect(src, p.join('/')).not.toMatch(/["'`]\/schedule\//);
    }
  });

  it('keeps the /event/ URL shape unchanged', () => {
    expect(read('src', 'components', 'EventCard.tsx')).toContain(
      '`/event/${eventSlug(event.title)}/`',
    );
  });

  it('has no src/pages/schedule.astro left behind', () => {
    expect(readdirSync(join(root, 'src', 'pages'))).not.toContain('schedule.astro');
  });
});

describe('/events/ index and the month hubs', () => {
  it('declares apex canonicals with a trailing slash', () => {
    expect(eventsIndex).toContain('const canonical = `${site}/events/`;');
    expect(monthHub).toContain('const canonical = `${site}${monthHref(monthKey)}`;');
    // …and monthHref is the single place the hub URL shape is defined.
    expect(read('src', 'data', 'events-2026.ts')).toContain(
      'export const monthHref = (key: MonthKey) => `/events/${key}/`;',
    );
    for (const [name, src] of [['events index', eventsIndex], ['month hub', monthHub]]) {
      expect(src, name).toContain('const site = "https://montereybayevents.com";');
      expect(src, name).not.toContain('www.montereybayevents.com');
    }
  });

  it('builds a hub for each of August–December 2026', () => {
    expect(monthHub).toContain('getStaticPaths');
    expect(monthHub).toContain('MONTHS.map');
  });

  it('titles hubs "Central Coast Events in <Month> <Year> — Monterey and Santa Cruz"', () => {
    expect(read('src', 'data', 'events-2026.ts')).toContain(
      '`Central Coast Events in ${monthMeta(key).label} — Monterey and Santa Cruz`',
    );
  });

  it('shows date, city, county, category and the official link on each hub row', () => {
    const html = body(monthHub);
    expect(html).toContain('dateLabel(e)');
    expect(html).toContain('e.city');
    expect(html).toContain('{e.county} County');
    expect(html).toContain('{e.category}');
    expect(html).toContain('e.officialWebsite');
  });

  it('links each hub to the previous and next month', () => {
    const html = body(monthHub);
    expect(html).toMatch(/rel="prev"/);
    expect(html).toMatch(/rel="next"/);
    expect(html).toContain('monthHref(prev.key)');
    expect(html).toContain('monthHref(next.key)');
  });

  it('emits an ItemList on both the index and the hubs', () => {
    for (const [name, src] of [['events index', eventsIndex], ['month hub', monthHub]]) {
      expect(src, name).toContain('buildItemListJsonLd');
      expect(body(src), name).toMatch(/application\/ld\+json/);
    }
    expect(read('src', 'lib', 'regionalEventSchema.ts')).toMatch(/"@type":\s*"ItemList"/);
  });

  it('renders the listing server-side, with the filters as an island on top', () => {
    // The island is Astro-rendered at build, so every listing is in the HTML
    // whether or not the filter JS runs.
    expect(body(eventsIndex)).toContain('<EventsList client:load />');
    const list = read('src', 'components', 'EventsList.tsx');
    expect(list).toContain('eventsInMonth');
    expect(list).toMatch(/setCounty|county === /);
  });
});

describe('internal linking into the 2026 calendar', () => {
  it('links the homepage to /events/ and to the current and next month hub', () => {
    expect(indexHtml).toContain('href="/events/"');
    expect(index).toContain('currentAndNextMonth(new Date())');
    expect(indexHtml).toContain('href={m.href}');
  });

  it('no longer ships the dateless "coverage in progress" placeholder list', () => {
    expect(index).not.toContain('upcomingCoverage');
    expect(indexHtml).not.toContain('Coverage in progress');
  });

  it('links every regional event page back to its month hub', () => {
    expect(regionalPage).toContain('href={monthHref(month.key)}');
    expect(body(regionalPage)).toContain('Central Coast events in {month.label}');
  });

  it('routes both datasets through /event/[slug]/ without moving a Car Week URL', () => {
    expect(eventPage).toContain('allEventDetails.map');
    expect(eventPage).toContain('regionalEventPages.map');
    expect(read('src', 'data', 'events-2026.ts')).toContain('existingSlug');
  });

  it('labels an unannounced date instead of leaving it blank or guessing', () => {
    expect(read('src', 'data', 'events-2026.ts')).toContain(
      'export const DATE_TBA = "Date not yet announced";',
    );
    expect(body(regionalPage)).toContain('{dateLabel}');
    expect(body(monthHub)).toContain('dateLabel(e)');
  });
});

describe('sitemap (built output)', () => {
  const sitemap = join(root, 'dist', 'sitemap-0.xml');
  const built = existsSync(sitemap);
  const xml = built ? readFileSync(sitemap, 'utf8') : '';

  // `pnpm test` alone does not build; `make test` runs build first, and so does CI.
  it.skipIf(!built)('lists /events/ and every month hub', () => {
    for (const path of [
      '/events/',
      '/events/august/',
      '/events/september/',
      '/events/october/',
      '/events/november/',
      '/events/december/',
    ]) {
      expect(xml, path).toContain(`<loc>https://montereybayevents.com${path}</loc>`);
    }
  });

  it.skipIf(!built)('lists every generated event page, apex host, trailing slash', async () => {
    const { allEventDetails } = await import('../data/eventIndex.ts');
    const { regionalEventPages } = await import('../data/events-2026.ts');
    for (const slug of [
      ...allEventDetails.map((e) => e.slug),
      ...regionalEventPages.map((e) => e.slug),
    ]) {
      expect(xml, slug).toContain(
        `<loc>https://montereybayevents.com/event/${slug}/</loc>`,
      );
    }
    expect(xml).not.toContain('www.montereybayevents.com');
  });
});

describe('site header', () => {
  it('is branded "Monterey Bay Events"', () => {
    expect(header).toContain('Monterey Bay Events');
    expect(header).not.toContain('Monterey Car Week 2026<');
  });

  it('has exactly the Events / Car Week / Traffic nav', () => {
    const labels = [...header.matchAll(/label:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(labels).toEqual(['Events', 'Car Week', 'Traffic']);
    const hrefs = [...header.matchAll(/to:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(['/', '/monterey-car-week/', '/traffic/']);
  });

  it('navigates with plain anchors — no client-side router', () => {
    expect(header).not.toMatch(/from ['"](react-router|@tanstack\/react-router)/);
    expect(header).toContain('<a');
  });
});

describe('footer email capture', () => {
  it('renders an inline form on every page — no modal, no popup', () => {
    expect(footer).toMatch(/<form[^>]*data-newsletter/);
    expect(footer).toMatch(/type="email"/);
    // No modal/popup machinery: match markup and APIs, not the prose comment
    // in the footer that says this is deliberately neither of those things.
    expect(footer).not.toMatch(/<dialog|role="dialog"|showModal\(|aria-modal/i);
    expect(footer).not.toMatch(/\bfixed inset-0\b/);
    // The footer is rendered by BaseLayout, which every page uses.
    expect(read('src', 'layouts', 'BaseLayout.astro')).toContain('<SiteFooter />');
  });

  it('uses the EMAIL_ENDPOINT constant, which is empty pending a real endpoint', () => {
    expect(footer).toContain('EMAIL_ENDPOINT');
    const newsletter = read('src', 'lib', 'newsletter.ts');
    expect(newsletter).toMatch(/export const EMAIL_ENDPOINT = ["']{2};/);
    expect(newsletter).toMatch(/TODO\(operator\)/);
  });

  it('carries the agreed label', () => {
    expect(read('src', 'lib', 'newsletter.ts')).toContain(
      'Weekly Central Coast events, one email.',
    );
    expect(footer).toContain('EMAIL_PITCH');
  });

  it('posts rather than navigating, and blocks submit while the endpoint is empty', () => {
    expect(footer).toContain('method="post"');
    expect(footer).toMatch(/if \(!endpoint\)[\s\S]{0,200}preventDefault/);
  });
});

describe('cloudflare asset handling', () => {
  // Strip // comments so the jsonc parses; no string literal in this file
  // contains a "//" sequence other than in a URL, which is not present here.
  const wrangler = JSON.parse(
    read('wrangler.jsonc')
      .split('\n')
      .filter((l) => !l.trim().startsWith('//'))
      .join('\n'),
  );

  it('returns a real 404 for unmatched paths, not a 200 SPA fallback', () => {
    expect(wrangler.assets.not_found_handling).toBe('404-page');
  });

  it('has a 404 page for that setting to serve', () => {
    expect(readdirSync(join(root, 'src', 'pages'))).toContain('404.astro');
    expect(read('src', 'pages', '404.astro')).toMatch(
      /name="robots"[^>]*content="noindex/,
    );
  });

  it('serves assets from dist', () => {
    expect(wrangler.assets.directory).toBe('./dist');
  });
});

describe('astro config', () => {
  it('serves directory-format URLs with an always-trailing slash', () => {
    expect(config).toMatch(/trailingSlash:\s*'always'/);
    expect(config).toMatch(/build:\s*\{\s*format:\s*'directory'\s*\}/);
  });

  it('is a static build (prerendered HTML, no request-time server)', () => {
    expect(config).toMatch(/output:\s*'static'/);
  });

  it('declares the apex as the site host', () => {
    expect(config).toMatch(/site:\s*'https:\/\/montereybayevents\.com'/);
  });
});
