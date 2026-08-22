// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { regionalEvents } from './src/data/events-2026';

// Hand-set lastmod for non-event pages. Same rule as `updated` on an event
// row: only pages whose content we know changed, dated by hand in the commit
// that changed them. Everything absent from here ships with no lastmod.
const GUIDE_LASTMOD = {
  '/laguna-seca/camping/': '2026-08-21',
};
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://montereybayevents.com',
  // trailingSlash: 'always' — directory format serves /<page>/ and
  // @astrojs/sitemap lists /<page>/, so a page's <link rel="canonical">
  // MUST also end in a slash. A canonical of /<page> (no slash) 308-redirects
  // to /<page>/ — Google then can't settle on a canonical and the page comes
  // back "URL is unknown to Google". Make it explicit so every page's
  // canonical matches its served URL. Enforced by CHECK_161.
  trailingSlash: 'always',
  // Explicit, because trailingSlash: 'always' only makes sense alongside it:
  // 'directory' emits dist/<route>/index.html so every route is served at
  // /<route>/. Switching this to 'file' would serve /<route>.html and every
  // canonical on the site would then point at a 308.
  build: { format: 'directory' },
  integrations: [
    sitemap({
      // Per-URL <lastmod>, and ONLY for pages whose content we know changed —
      // `updated` on a regional event row, set by hand when that row is
      // substantively rewritten. Every other URL ships with no lastmod at all.
      //
      // That asymmetry is the point. A sitemap that stamps every URL with the
      // build time tells Google nothing (and teaches it to ignore the field);
      // a sitemap where six URLs carry a real date and the rest carry none is
      // a usable signal. Deriving from git would be worse than either, because
      // all 54 regional pages come from one data file and would share a date.
      serialize(item) {
        // Guide pages carry their own hand-set date, on the same terms as an
        // event row's `updated`: set it in the commit that changes the page.
        const guide = GUIDE_LASTMOD[new URL(item.url).pathname];
        if (guide) return { ...item, lastmod: `${guide}T00:00:00-07:00` };

        const m = item.url.match(/\/event\/([^/]+)\/$/);
        if (!m) return item;
        const updated = regionalEvents.find((e) => e.slug === m[1])?.updated;
        return updated ? { ...item, lastmod: `${updated}T00:00:00-07:00` } : item;
      },
    }),
    react(),
  ],
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
