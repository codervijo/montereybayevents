# Server code dropped during the TanStack Start → Astro port

Astro is configured `output: 'static'` (see `astro.config.mjs`), so there is no
request-time server. The following files from `genai/` had no target in the
static model and were **not** ported. Each is listed with what it did and what
would have to happen if the behaviour is ever needed here.

`genai/` is no longer checked out here — it was the port source, not a build
input. The paths below resolve against `git@github.com:codervijo/mccarweek-redux.git`
at commit `e2ede3d`; re-clone it locally if you need to consult a file.

- `TODO:` **`genai/src/server.ts`** — TanStack Start's request handler
  (`createStartHandler` / fetch entry). Astro's static build has no equivalent.
  If server rendering is ever required, add an adapter (`@astrojs/cloudflare`,
  matching the repo's `wrangler.jsonc`) and switch `output` to `'server'`.
- `TODO:` **`genai/src/start.ts`** — TanStack Start client/server bootstrap.
  Replaced by Astro's own entry plumbing; nothing to port.
- `TODO:` **`genai/src/router.tsx`** and **`genai/src/routeTree.gen.ts`** —
  TanStack Router config and generated route tree. Replaced by Astro's
  file-based routing under `src/pages/`.
- `TODO:` **`genai/src/lib/lovable-error-reporting.ts`**,
  **`genai/src/lib/error-capture.ts`**, **`genai/src/lib/error-page.ts`** —
  Lovable-preview error reporting wired into the TanStack root error boundary
  (`postMessage` to the Lovable editor iframe). Preview-harness-only; no
  operator-visible behaviour on the live site, so not ported. The root route's
  `errorComponent` UI it backed is likewise gone — a static build has no
  render-time error boundary. The `notFoundComponent` copy *was* preserved, as
  `src/pages/404.astro`.

## Not ported (non-server), for the record

- `genai/src/components/ui/**` — the full shadcn/ui component library (50
  files) ships with the Lovable scaffold but **nothing in the app imports it**:
  the only components actually used are `SiteHeader`, `SiteFooter` and
  `EventCard`. Porting it verbatim would have added ~30 Radix packages to
  `package.json` for dead code. Copy individual files from `genai/` (plus
  `genai/src/lib/utils.ts` and its `clsx` / `tailwind-merge` / `cva` deps) if a
  future page needs one.
- `genai/src/hooks/use-mobile.tsx` — only consumed by `ui/sidebar.tsx`, which
  is not ported.
- `genai/public/sitemap.xml` — a static, hand-written sitemap. The scaffold
  generates one at build time via `@astrojs/sitemap`, which is authoritative;
  copying the stale file would shadow it.
- `genai/public/robots.txt` — the scaffold already has its own.
