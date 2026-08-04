---
project: montereybayevents.com
prd_version: 1
project_version: v1.B
status: built, not deployed
owner: Vijo
last_updated: 2026-08-03
---

# montereybayevents.com — PRD

## 1. Problem

<1-2 sentence problem statement — fill in: what user-facing problem
does this site solve? Who has it? Why does it matter?>

## 2. Users

<who uses this — target user, what they care about, rough audience size>

## 3. Goals & non-goals

**Goals:**
- <fill in>

**Non-goals:**
- <fill in>

## 4. Versions

Two-level versioning convention (canonical: `sites/portfolio/AI_AGENTS.md`):

- `vN` = major capability tier; SemVer-MAJOR semantics.
- `vN.X` = phase letter within a tier; internal slicing.

| Version | Theme | Acceptance |
|---|---|---|
| v0 | scaffold | local builds, CF wrangler.jsonc + public/_headers in place, repo initialized |
| v1 | regional calendar with Car Week as its first covered section | a visitor can answer "what's free, when, and where" for Monterey Car Week 2026 from indexable pages; every `/event/` page emits valid `Event` schema; the homepage is a Monterey/Santa Cruz index, not a Car Week overview |

## 5. Phases

| Phase | Theme | Features | Status |
|---|---|---|---|
| **v0.A** | scaffolded | `portfolio new bootstrap` ran; standard files written; git initialized | ✅ |
| **v0.B** | Astro port | TanStack Start → Astro; 50 `/event/` pages, schedule, traffic (see `src/lib/server-todo.md` for what was dropped) | ✅ |
| **v1.A** | section split + free-intent page + valid Event schema | `Event` JSON-LD fixed on all 50 `/event/` pages (`startDate`, `endDate`, `offers`, `organizer`, `PostalAddress`); new `/free/` page with `ItemList`; Car Week hub moved to `/monterey-car-week/` with a 301 from `/schedule/`; homepage rebuilt as a regional index; footer email capture site-wide | built, not deployed |
| **v1.B** | non-Car-Week event data | 61 Aug–Dec 2026 Central Coast events imported from `data/monterey_santacruz_events_aug_dec_2026.csv` into `src/data/events-2026.ts`; `/events/` index (county + month filters); `/events/<month>/` hubs for August–December; 54 new `/event/` pages with `Event` JSON-LD; homepage "coverage in progress" replaced with real dated listings | built, not deployed |
| **v1.B.1** | admission data for the regional set | the CSV carries no free-or-ticketed status, so regional listings show category and date but no admission badge and emit no `offers` — the site's free-intent angle currently only covers Car Week | planned |

## 6. Open questions

- *(append-only log; mark answered with date but never delete)*
- **2026-08-03 — how should a CSV row that is already a Car Week event page be
  handled?** Seven of the 61 rows are Car Week events, and four of them derive a
  slug that collides exactly with a live `/event/` page. Shipped answer: the row
  carries `existingSlug` (or `hubHref`), is listed in `/events/` and its month hub,
  and links to the page that already exists rather than getting a second one — so
  no live URL moves and no two pages compete for the same event. 54 of the 61 rows
  get a new page. Reversible: drop the mapping and 7 more pages generate.
- **2026-08-03 — no start times anywhere in the regional dataset.** The CSV has no
  clock times, so `startDate` is date-only (valid per schema.org "Date or
  DateTime"). `pacificOffset()` implements the PDT-through-Nov-1 / PST-after rule
  and is wired in, but emits nothing until a sourced time exists. Padding a date
  to midnight would publish a start time we do not have.
