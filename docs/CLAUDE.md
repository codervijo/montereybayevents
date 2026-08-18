# CLAUDE.md — montereybayevents.com

Per-project orientation for Claude. Read this first when picking up
work on this site. Index of conventions, deferred decisions, and
non-features that aren't obvious from the code or git history.

## Project

A mobile-first, indexable calendar of public events across Monterey and
Santa Cruz counties — county fairs, festivals, parades, holiday markets
and Monterey Car Week — for locals and visitors deciding what to do this
weekend, usually on a phone and usually within 48 hours. Every listing
carries a date, a city, a free-or-ticketed status where known, and a link
to the organizer.

Stack: Astro + React islands + Tailwind v4, pnpm-only, on the sites/*
workspace shared infra, with `Makefile` forwarding to the central builder.
Deployed to Cloudflare Workers static assets via `wrangler.jsonc` — see
AI_AGENTS.md § Deployment info, which is authoritative for anything that
touches deploys.

Two datasets back the site and they are shaped differently:

  - `src/data/events.ts` — Monterey Car Week 2026, tracked per day with
    per-day admission (`free` / `ticketed` / `private`). Drives
    `/monterey-car-week/`, `/free/`, and 50 `/event/` pages.
  - `src/data/events-2026.ts` — the regional Aug–Dec 2026 calendar,
    transcribed from `data/monterey_santacruz_events_aug_dec_2026.csv`.
    One row per event with county, city, date range and category, no
    admission. Drives `/events/`, the month hubs, and 54 `/event/` pages.

Both feed `/event/<slug>/`; their slugs are disjoint and the route picks a
template per slug. When the CSV and `events-2026.ts` disagree, the CSV
wins — `src/__tests__/events2026.test.js` fails the build on drift.

## Commands

```bash
# Build / dev (forwards to the parent Makefile)
make deps           # install deps via the central builder
make dev            # local dev server
make build          # production build → dist/

# Test (per-stack — adjust as needed)
make test           # if a test suite is wired in

# Deploy
git push            # Cloudflare Pages auto-builds on push to main
```

## Conventions

  - Build path: this project's `Makefile` → `../Makefile` (parent
    workspace) → `~/work/projects/builder/` (central builder).
  - Stack: pnpm-only. No `package-lock.json` / `bun.lockb` / `yarn.lock`.
  - Deploy: Cloudflare Pages via `wrangler.jsonc`. No `_redirects`
    SPA fallback (uses CF's `not_found_handling` instead).
  - **The `docs/prd.md` row ships in the version's own commit.** When you
    commit a `vN.X` change, `git add docs/prd.md` alongside the source —
    the phase-table row plus `project_version` and `last_updated` in the
    frontmatter, all in the same commit. Never as a follow-up docs commit.
    This is a rule because the follow-up kept not happening: v1.E shipped
    and went live with no row at all, v1.D sat for five days still marked
    "not yet deployed", and the frontmatter drifted four phases behind at
    `project_version: v1.C`. Note the frontmatter sits *above* the H1, so
    read from line 1 rather than jumping to the phase table — that is how
    it got missed. Status reads `✅ shipped — built and tested locally,
    not yet deployed` until a deploy is confirmed against the live URL,
    then `✅ shipped — live (deploy confirmed YYYY-MM-DD)`. What the row
    is *for* is the part the diff cannot carry: why a decision went the
    way it did, what was deliberately not done, and any trap left behind.

## Heading hygiene

**Before adding any section, subsection, or heading to a Markdown
file, output the file's current heading outline first:**

```bash
grep -nE '^#+ ' path/to/file.md
```

Then confirm — in the chat — that the planned new heading's:

1. **Depth** (`#`, `##`, `###`, …) is the intended depth, not
   accidentally one level too shallow.
2. **Label** doesn't collide with existing headings — no duplicate
   `## 1. <title>`, no `### N.X` subsection labels that look like
   `vN.X` phase identifiers.

Only after that confirmation, write.

Applies especially to long-lived docs: `docs/prd.md`, `AI_AGENTS.md`,
`docs/architecture.md`, `docs/CLAUDE.md`.

**Why:** structural drift is invisible in any single editing session
— it only becomes obvious in the aggregate, by which time the doc is
hard to fix. The pre-edit outline ritual catches collisions and depth
mistakes at the point of writing, not at quarterly cleanup time.

## Deferred decisions

Things deliberately *not* shipped, with the rationale, so they don't get
re-proposed. Append; don't rewrite.

- **Clock times are never synthesised** (v1.A, reaffirmed v1.B). Only one
  Car Week event has an organizer-stated time, and the regional CSV has
  none at all, so `startDate` is date-only almost everywhere. schema.org
  accepts date-only ("Date or DateTime"). Padding a date out to midnight
  would publish a start time we do not have to someone deciding when to
  show up. `pacificOffset()` in `events-2026.ts` implements the
  PDT-through-Nov-1 / PST-after rule and is wired in — it starts emitting
  the moment a real time is sourced. Don't "fix" the date-only values.

- **No `offers` on regional events** (v1.B). The CSV carries no admission
  data, so those 58 Event nodes publish no price and no availability. An
  Offer with a guessed price is worse than no Offer, and `InStock` on a
  paid event asserts tickets are still on sale, which we can't verify.
  Tracked as v1.C — it needs sourced admission data, not a default.

- **No second page for a CSV row that is already a Car Week event**
  (v1.B). Seven rows overlap; four collide exactly on slug. They carry
  `existingSlug` (or `hubHref` for the umbrella row), appear in `/events/`
  and their month hub, and link to the page that already exists. Two pages
  for one event is duplicate content competing with itself, and the Car
  Week URLs are live and must not move. Reversible: delete the mapping and
  seven more pages generate.

- **`expected_visitor_level` is not imported** (v1.B). The column is
  unsourced judgement ("Very High" / "Local"). It has no place on the
  site and a test asserts it never reaches the data.

- **Listing descriptions are written from the CSV's own fields only**
  (v1.B) — category, venue, city, county, date. Nothing is copied from the
  reference URLs and nothing is inferred beyond those fields. An event with
  no factual basis for a sentence gets no description.

- **`/events/` is not in the header nav** (v1.B). The nav is frozen at
  Events / Car Week / Traffic by a test asserting exactly that structure;
  `/events/` is reached from the homepage hero, the "Start here" cards and
  every month hub instead. Worth revisiting — if the 2026 calendar becomes
  the primary entry point rather than Car Week, the nav is the honest place
  to say so, and that's a deliberate call plus a test edit, not a drive-by.

- **No city or category hubs yet** (v1.B). The dataset supports both cuts,
  but the month hubs are the live experiment — see `docs/growth.md`
  2026-08-03. Whether to slice again by city or by category depends on
  whether the month hubs pick up impressions that `/events/` doesn't.
  Don't build them speculatively.

- **No SPA fallback**, ever. See Conventions above and AI_AGENTS.md —
  `wrangler.jsonc`'s `not_found_handling: "404-page"` is what serves real
  404s, and `public/_redirects` is load-bearing for real 301s.

- **Displayed hours and schema times are two different things** (v1.G).
  The "clock times are never synthesised" rule above is intact and still
  binding — but it governs the *schema*, not the page. `RegionalEvent.times`
  holds per-day door hours for display, tagged by `timesConfidence`:
  `"official"` when the organiser publishes them, `"unconfirmed"` when they
  come from a secondary listing. Only `"official"` hours may ever reach
  `startDate`. An `"unconfirmed"` row shows its hours to the reader
  alongside a plain statement of who has and has not published them, and
  `buildRegionalEventJsonLd` keeps them out of the JSON-LD entirely — a
  structured-data time gets quoted in a search result stripped of every
  qualifier around it, so it has to be the organiser's own. Do not "tidy"
  this by feeding `times` into `isoDateTime`.

- **`[VERIFY]` markers are not used on this site** (v1.D, reaffirmed
  v1.G). The rule is: don't leave it as VERIFY and don't guess either. A
  page does not have to make a claim it can't stand behind — it can make a
  *different, true* claim about the public record instead ("nobody
  publishes a Pacific Grove parking plan" is a finding; "we haven't
  checked" is a to-do leaking onto a live page). The vocabulary for this is
  `confidence` on `/traffic/`, the `Admission` union on `/free/`, and
  `timesConfidence` on regional events. Note that the
  `write-lamill-seo-page` skill prescribes `[VERIFY]` plus `noindex`; where
  it conflicts with this, this wins, because `noindex` on a live earning
  page is a much larger cost than the skill accounts for.
