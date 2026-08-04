// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
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
  integrations: [sitemap(), react()],
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
