# AI Agent Context — montereybayevents.com

## Summary

*one paragraph: what this site is, what it does*

montereybayevents.com is a fast, mobile-first calendar of public events across Monterey County and Santa Cruz County — Car Week, county fairs, festivals, parades, holiday markets, and the free community events that get buried on official sites. Every listing carries a verified date, location, free-or-ticketed status, and a link to the organizer. The site exists because the region's event information is scattered across chamber calendars, city PDFs, and map widgets that don't render for search engines, leaving simple questions like "what's free during Car Week" and "when does the Butterfly Parade start" without a good answer anywhere.

## Audience

*one sentence: who this is for (broad demographic)*

Locals and visitors on the Central Coast deciding what to do this weekend, usually on a phone, usually within 48 hours of the event.

## ICP

*the specific ideal customer — demographics, pain points, what they use today. More detail than Audience: Audience is the broad demo ("homeowners with EV chargers"), ICP is the specific targetable subset ("Tesla owners in CA who installed in last 90d, paid $2k+")*

A Monterey Peninsula or Santa Cruz resident, or a Bay Area visitor down for a few days, who knows something is happening but not what, when, or whether it costs money. They search things like "monterey car week free events," "what's happening in santa cruz this weekend," or "capitola beach festival 2026 dates." They bounce off official tourism sites that bury the schedule behind marketing copy, and off county map apps that never load. A meaningful share are Spanish-speaking Monterey County residents — Salinas, Seaside, Watsonville — who are underserved entirely, since almost no local event coverage is published in Spanish.

## Goals

*1-2 sentences: primary business / product goal*

Become the fastest, most accurate answer for date, price, and location questions about Central Coast events, and own the free-event and schedule queries that larger tourism sites ignore. Build a newsletter list of Central Coast residents that isn't dependent on search or social algorithms.

## Tech stack

Astro project under the sites/* workspace. Build path goes
through the parent `sites/Makefile` (Docker-orchestrated) which delegates
per-stack work to the central builder at `~/work/projects/builder/`.

## Project structure

- `src/` — application source
- `public/` — static assets copied to `dist/` at build (favicons, OG images, `_headers`)
- `data/` — committed source-of-record datasets. `monterey_santacruz_events_aug_dec_2026.csv`
  backs `src/data/events-2026.ts`; when the two disagree the CSV wins, and
  `src/__tests__/events2026.test.js` fails the build if they drift.
- `docs/` — PRD, Prompts log
- `Makefile` — thin forwarder to `../Makefile`
- `wrangler.jsonc` — Cloudflare deploy config
- `scripts/` *(if present)* — ingester or build-time helpers

## Building info

All dev work runs inside the parent `sites1` docker container. The host doesn't
need Node/pnpm installed; the container does. The parent `Makefile`
(`../Makefile` from this dir) is the canonical entry point.

### Why docker

- Pinned Node + pnpm versions match Cloudflare's build env.
- Avoids polluting the host with per-project node_modules.
- Same image serves every sibling project under sites/.

### Common Makefile targets

This project's local `Makefile` forwards every target to `../Makefile` with
`proj=montereybayevents.com`, so these all work either from this dir or from `sites/`:

| Command | What it does |
|---|---|
| `make buildsh` *(from `sites/`)* | Drop into a bash shell inside the docker container at `/usr/src/app` (= `sites/` mounted in). |
| `make run` *(from here)* / `make run proj=montereybayevents.com` *(from `sites/`)* | `pnpm install` then start dev server (auto-detected). |
| `make check-vite proj=montereybayevents.com` | Start the dev server, skipping install. |
| `make test proj=montereybayevents.com` | `pnpm install` + `pnpm build` + `pnpm test`. **Hard-fails outside docker** — `make buildsh` first, or `docker exec`. |
| `make deps` | Install pnpm globally (image bootstrap). |
| `make clean` *(from `sites/`)* | Remove root `package.json`, lockfile, node_modules. Don't run inside a project dir. |

### Running Make targets from a Claude Code session

The Bash tool runs on the host as `vijo`, not inside docker. To execute a
target inside the container, find the running container and `docker exec` in:

```bash
docker ps                                               # find the sites1 container name
docker exec -w /usr/src/app <name> make test proj=montereybayevents.com
```

## Deployment info

- **Platform:** Cloudflare Workers (Static Assets) — *not* Vercel.
- **Config:** `wrangler.jsonc` at the repo root — points `assets.directory` at `./dist` and uses `not_found_handling: "404-page"`, which serves `dist/404.html` with a real 404 status. **Do not set this back to `"single-page-application"`** — this site is prerendered multi-page HTML with no client-side router, and the SPA setting returned `dist/index.html` with a 200 for every unmatched path (soft 404s, and `src/pages/404.astro` never rendered).
- **Headers:** `public/_headers` — cache (`/assets/*` immutable, HTML no-cache) + security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`). Vite copies `public/` into `dist/` at build, so the file ships with the assets.
- **Build:** `pnpm build` → `dist/`. Wrangler picks up `dist/` via `wrangler.jsonc`.
- **Deploy:** `wrangler deploy` (locally) or via Cloudflare's Git integration on push.
  Initial GitHub repo + CF Pages project setup is automated by the portfolio CLI:
  `cd ../portfolio && make run ARGS="deploy montereybayevents.com"` runs `gh repo create` and
  POSTs to the CF Pages API with `build_command="pnpm run build"` set explicitly
  (avoids the bun-detection trap kwizicle.com hit). Idempotent; safe to re-run.
- **Vite version:** must be ≥ 6.0.0 — Wrangler's Vite integration rejects Vite 5.
- **Env vars:** set `VITE_*` vars (e.g. `VITE_GA_ID`) in the Cloudflare Workers project's environment-variable settings — they're inlined at build time.
- **Live URL:** https://montereybayevents.com/  *(update once first deploy succeeds)*
- **Canonical host:** the **apex** (`https://montereybayevents.com/`) is the ONLY canonical host fleet-wide — `www` and `http` must 308→apex, and there is no `www`-canonical option. Set Astro's `site: "https://montereybayevents.com"` (apex, never `www`) so every `<link rel="canonical">` and the generated sitemap `<loc>` URLs use the apex. Enforced by CHECK_150 (redirect) + CHECK_158 (canonical tags) + CHECK_159 (sitemap) + CHECK_160 (GSC-registered sitemap).
- **Legacy:** if a `vercel.json` or `.vercelignore` is present from a Lovable export, it's inert on Cloudflare and safe to delete.

## Content strategy

*what content this site needs — page types, initial topics, format mix (long-form vs reference vs tool)*

Three page types. Event pages: one per event, server-rendered, JSON-LD Event schema, verified date, venue, free/ticketed badge, and official link. Hub pages: per-event-cluster (Monterey Car Week 2026), per-month (October 2026), per-city (Capitola, Salinas, Pacific Grove), and per-intent (free events, family events). Practical guides: parking, road closures, transit, and what's actually worth attending — the operational questions official calendars skip. Year-qualified pages are built to be reused annually rather than replaced, since prior-year event pages retain search volume long after the event. Format mix is roughly 70% structured listings, 30% short editorial. Every fact carries a source; unverified claims are held back rather than guessed.

### Post-deploy checklist (do these once after the first successful deploy)

- [ ] Verify in **Google Search Console** at https://search.google.com/search-console — add as `sc-domain:montereybayevents.com` property; verify via DNS TXT record. Until this is done, no SEO traffic data is observable for this site (and the workspace-wide `30 commercial sites with traffic` goal can't credit it).
- [ ] Submit the sitemap (`https://montereybayevents.com/sitemap-index.xml` — the apex host; `@astrojs/sitemap` emits `-index`, not `/sitemap.xml`) inside GSC. *(The deploy pipeline auto-submits the robots.txt-declared sitemap; this is the manual fallback.)*
- [ ] Update the **Live URL** above with the actual deploy URL.
- [ ] Run `make run ARGS="cleanup"` from `sites/portfolio/` so `data/portfolio.json` reflects the new project's state (and `project status montereybayevents.com` resolves cleanly).

## How to run

```bash
# from this dir, after `make buildsh` from sites/:
make deps      # → pnpm install via the central builder
make run       # → dev server
make build     # → dist/
make test      # → pnpm install + build + test (must be inside container)
```

## How this project is checked

This project is enforced against shared sites/* conventions by
`portfolio project check montereybayevents.com` (run from `sites/portfolio/`).
Conformance is driven by the universal check catalog (CHECK_*) —
e.g. CHECK_020 (own-git-repo), CHECK_002 (has-ai-agents-md),
CHECK_007 (has-docs-prompts), CHECK_008 (has-docs-growth — `docs/growth.md`
exists — the per-project growth-experiment log; see Growth log section
below), CHECK_001 (has-readme), CHECK_009 (has-gitignore), CHECK_035
(vite-version-ok), CHECK_003 / CHECK_004 (AI_AGENTS.md `## Building info` +
`## Deployment info` headings). See the full catalog with
`portfolio check catalog`. The bootstrap output satisfies all of these on
day zero — keep it that way.

If `project check` flags a regression, fix it. v6.C's `portfolio project fix`
will eventually auto-fix; until then, hand-edit.

## Growth log — per-project experiment tracker

`docs/growth.md` is this project's append-only log of growth experiments
(content, SEO, marketing, structural changes). Each entry is a dated H2
with a measurable hypothesis + KPI + observation window (default 28d).
Read **the full workflow inside `docs/growth.md`** — it's self-sustaining
so you don't have to remember the lifecycle from outside the file.

Update it whenever you do something growth-relevant on this site. The
data source is GSC (`portfolio gsc sync` from the portfolio dir); this
file narrates *why*.

## Strategy reminder — ship fast, let the market decide

This sites/* workspace is shipping commercial sites toward a
**30-site SEO-traffic goal**. The convention is **build & ship fast,
then let GSC data drive what to invest more in.** Don't over-polish
before launch. Get a minimum-viable version live, indexed, then
iterate on whichever sites actually attract traffic.

Translation for this project: prefer shipping over perfection. The
SEO baseline files (`public/robots.txt`, `public/sitemap.xml`),
deploy config, and dev tooling (`vitest`) are pre-scaffolded so you
can ship today.

## Versioning

This project follows the sites/* **canonical versioning convention** (defined
in `sites/portfolio/AI_AGENTS.md`):

- **`vN`** — major capability tier. Each is a coherent shipped capability and
  may break compat with the previous tier. SemVer-MAJOR semantics.
- **`vN.X`** — phase letter within a tier (A / B / C / …). Internal slicing of
  build work; signals "order/scope can shift." Each phase still ships
  independently.

**Two levels only. Never a third.** When follow-up work emerges inside an
existing tier, push subsequent phase letters down to make room rather than
appending a numeric sub-phase. The renumbered row in `docs/prd.md` carries a
lineage marker so the history survives; this file never carries one.

**`vN.A` is always the planning / decisions-lock phase.** Every tier opens
with its `.A` reserved for kickoff — locking design decisions, scope, schema
shape and any ADR — *before* implementation. Build work starts at `.B`. If a
tier's first instinct is code, its planning still gets its own `.A` row above
it.

Two-layer notation separates **external version** (what consumers see) from
**internal phasing** (how the team slices work). Letters signal *un-promised* —
nobody mistakes `v1.B` for a SemVer minor release.

**Always use this numbering when planning or shipping work on this project.**
Specifically:

- Every entry in `docs/prd.md`'s phases table uses `vN.X`.
- Every commit message that ships a phase mentions its version (e.g.
  `v1.B — auth flow`).
- Every entry in `docs/Prompts.md` references the version of the work it
  describes when relevant.

Don't introduce a parallel scheme (no `0.1.0` / `Sprint 3` / etc.). When in
doubt, the canonical statement is `sites/portfolio/AI_AGENTS.md`.

Track this project's progress in `docs/prd.md` against this taxonomy.

**Grandfathered:** `v0.A` (bootstrap) and `v1.A` (Event schema fix, `/free/`,
Car Week as a section) both carry build work, predating the
`.A`-is-planning rule above. They are *not* renumbered — shipped commit
subjects reference those identifiers and rewriting them would break the trail
between `docs/Prompts.md`, `docs/growth.md` and git history. The rule applies
from `v2` forward, where `v2.A` is a decisions-lock phase with no build work.

## Conventions

- Stack: astro
- **Package manager: pnpm only.** No `bun.lockb`, no `package-lock.json`, no `yarn.lock` — they cause CF Pages to pick the wrong manager and break the build. The `pnpm-lock.yaml` is the only lockfile that should ever be committed.
- Build path: this project's `Makefile` → `../Makefile` → `~/work/projects/builder/`
- Cloudflare deploy constraints: Vite ≥ 6, frozen-lockfile install, no `_redirects` SPA fallback (unmatched paths are handled by `wrangler.jsonc`'s `not_found_handling: "404-page"` instead — see Deployment info).
- **`public/_redirects` exists and is load-bearing — don't delete it.** The
  constraint above is scoped to *SPA fallback rules*, not to the file: Workers
  static assets supports `_redirects`, and it is where real 301s live. It
  currently holds `/schedule/` → `/monterey-car-week/schedule/` from the v1.A
  restructure. Astro's own `redirects` config can't replace it — under
  `output: 'static'` that emits a meta-refresh HTML page, which is a 200.
- **Versioning**: two-level `vN` / `vN.X` — see Versioning section above and `sites/portfolio/AI_AGENTS.md` for the canonical statement.

## Out of scope / don't touch

- *(leave blank — fill in when something is)*
