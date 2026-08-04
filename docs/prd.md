---
project: montereybayevents.com
prd_version: 1
project_version: v0.A
status: planned
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
| **v1.B** | non-Car-Week event data | the homepage "coverage in progress" list becomes real dated listings — needs a sourced dataset per event (date, venue, admission), see note in `src/pages/index.astro` | planned |

## 6. Open questions

- *(append-only log; mark answered with date but never delete)*
