---
project: montereybayevents.com
prd_version: 1
project_version: v1.B
status: built, not deployed
owner: Vijo
last_updated: 2026-08-07
---

# montereybayevents.com — PRD

## 1. Problem

Event information for Monterey and Santa Cruz counties is scattered across
chamber calendars, city PDFs and map widgets that don't render for search
engines, so simple logistics questions — what's free during Car Week, when the
Butterfly Parade starts, what dates the county fair runs — have no good answer
anywhere. Someone deciding what to do this weekend has to reconstruct the
answer from three or four sources, on a phone, usually within 48 hours of the
event.

The gap is structural, not a matter of effort: destination-marketing sites
optimise for inspiration rather than logistics, and government calendars publish
as client-rendered apps with no indexable HTML. That leaves date, price and
location queries unserved by the sites that should own them.

## 2. Users

**Primary:** Monterey Peninsula and Santa Cruz residents, plus Bay Area visitors
down for a few days, who know something is happening but not what, when, or
whether it costs money. They search things like "monterey car week free events",
"what's happening in santa cruz this weekend", or "capitola beach festival 2026
dates". They bounce off tourism sites that bury the schedule behind marketing
copy and off county map apps that never load. What they want from a page is the
date, the city, whether it's free, and a link to the organizer — in that order,
above the fold, on a phone.

**Underserved segment:** Spanish-speaking Monterey County residents in Salinas,
Seaside and Watsonville. Almost no local event coverage is published in Spanish.
Nothing has been built for them yet — see § 6.

**Audience size:** no sourced figure. Search-volume and difficulty data recorded
in `docs/growth.md` (2026-08-03) is directional only — the head term "monterey
car week" is defended at KD 44 while the long-tail logistics queries return no
difficulty score at all. A real number comes from GSC after the first indexed
month; until then this section stays without one rather than carrying an
estimate dressed as data.

## 3. Goals & non-goals

**Goals:**
- Be the fastest, most accurate answer for date, price and location questions
  about Central Coast events — the queries larger tourism sites ignore.
- Own free-event and exact-schedule intent, one page per intent rather than one
  filter per intent (`/free/`, the month hubs).
- Cover the region year-round, not just the August Car Week spike, so the site
  accrues authority in the eleven months nobody searches for Car Week.
- Build a newsletter list of Central Coast residents that survives both search
  and social algorithm changes.
- Ship year-qualified pages built to be reused annually rather than replaced —
  prior-year event pages retain search volume long after the event.

**Non-goals:**
- **Not a ticketing or booking platform.** We link to the organizer and hold no
  ticket prices; the site never sits between a reader and a purchase.
- **Not an everything-aggregator.** Coverage is bounded by what can be sourced.
  No listing ships with an estimated date — an event with no announced date is
  published saying so, or not at all.
- **Not a client-rendered app.** Prerendered multi-page HTML with no client-side
  router; interactivity is islands over server-rendered content. Being crawlable
  is the entire competitive advantage over the incumbents.
- **Not Car-Week-only.** v1.A demoted Car Week from "the site" to a section
  deliberately, and the homepage is a regional index. Don't re-centre it.
- **Not editorialised beyond what the facts support.** Roughly 30% short
  editorial is in scope (parking, closures, what's worth attending); inventing
  colour to fill a listing is not.

## 4. Versions

Two-level versioning convention (canonical: `sites/portfolio/AI_AGENTS.md`):

- `vN` = major capability tier; SemVer-MAJOR semantics.
- `vN.X` = phase letter within a tier; internal slicing.

| Version | Theme | Acceptance |
|---|---|---|
| v0 | scaffold | local builds, CF wrangler.jsonc + public/_headers in place, repo initialized |
| v1 | regional calendar with Car Week as its first covered section | a visitor can answer "what's free, when, and where" for Monterey Car Week 2026 from indexable pages; every `/event/` page emits valid `Event` schema; the homepage is a Monterey/Santa Cruz index, not a Car Week overview |
| v2 | assisted ingestion — flyer images and venue feeds become proposed listings | an operator turns a flyer image or a venue feed into a published listing without retyping it; every proposal is approved by a human before it enters `data/*.csv`, and no field reaches the site that the pipeline inferred rather than read |

## 5. Phases

| Phase | Theme | Features | Status |
|---|---|---|---|
| **v0.A** | scaffolded | `portfolio new bootstrap` ran; standard files written; git initialized | ✅ |
| **v0.B** | Astro port | TanStack Start → Astro; 50 `/event/` pages, schedule, traffic (see `src/lib/server-todo.md` for what was dropped) | ✅ |
| **v1.A** | section split + free-intent page + valid Event schema | `Event` JSON-LD fixed on all 50 `/event/` pages (`startDate`, `endDate`, `offers`, `organizer`, `PostalAddress`); new `/free/` page with `ItemList`; Car Week hub moved to `/monterey-car-week/` with a 301 from `/schedule/`; homepage rebuilt as a regional index; footer email capture site-wide | built, not deployed |
| **v1.B** | non-Car-Week event data | 61 Aug–Dec 2026 Central Coast events imported from `data/monterey_santacruz_events_aug_dec_2026.csv` into `src/data/events-2026.ts`; `/events/` index (county + month filters); `/events/<month>/` hubs for August–December; 54 new `/event/` pages with `Event` JSON-LD; homepage "coverage in progress" replaced with real dated listings | built, not deployed |
| **v1.C** *(renumbered 2026-08-07; was v1.B.1)* | follow-up polish after v1.B shipped | (1) **own brand favicon** — replaced Lovable's generic blue `M` with a brass-on-warm-dark calendar mark drawn from `src/styles/global.css` tokens; `public/favicon.svg` rewritten, `public/favicon.ico` rebuilt as a 16/32/48 multi-resolution icon. (2) **admission data for the regional set** — the CSV carries no free-or-ticketed status, so regional listings show category and date but no admission badge and emit no `offers`; the site's free-intent angle currently covers only Car Week | in progress — favicon done, admission data pending |
| **v2.A** | kickoff / decisions lock | no build. Supply audit of 8–10 real Central Coast organiser accounts (are event details in the *image* or the caption? consistent hashtags? complete date+venue+admission? does the venue already publish ICS/RSS?); Meta App Review go/no-go; whether the pipeline lives here or in `portfolio`; what the operator review surface is | planned |
| **v2.B** | extraction from manual input | operator drops flyer images in a folder → vision extraction to a strict JSON schema with per-field provenance and confidence → dedupe (perceptual hash + normalised-title match against both datasets) → proposals queue → operator approves rows into `data/*.csv` → regenerate `src/data/*.ts`. No network acquisition at all | planned |
| **v2.C** | permissionless pull adapters | ICS / RSS / embedded JSON-LD `Event` pulled from venue and chamber sites into the same dedupe → propose → approve path. Highest supply-to-effort ratio and no ToS exposure | planned |
| **v2.D** | Instagram hashtag adapter | Graph API Hashtag Search as one adapter among several. Gated on Meta app review + business verification, and on v2.A's audit showing the supply is actually there. No scraping under any circumstance | planned — conditional on v2.A |
| **v2.E** | submissions inbox | organisers email flyers to a submissions address; same extraction pipeline on the back end. Inverts acquisition from pull to push and doubles as organiser outreach | planned |

## 6. Open questions

- *(append-only log; mark answered with date but never delete)*
- **Spanish-language coverage — scope and shape?** AI_AGENTS.md names
  Spanish-speaking Monterey County residents (Salinas, Seaside, Watsonville) as a
  materially underserved part of the ICP, and `docs/growth.md` names a
  Spanish-language WhatsApp channel as year-one distribution. Nothing has been
  built: no translated pages, no `hreflang`, no second locale in the Astro
  config. Open because the answer changes the URL structure (`/es/` vs a
  separate host vs translated slugs), which is expensive to reverse once
  indexed. Not started, and shouldn't be until it's decided.
- **2026-08-03 — how should a CSV row that is already a Car Week event page be
  handled?** Seven of the 61 rows are Car Week events, and four of them derive a
  slug that collides exactly with a live `/event/` page. Shipped answer: the row
  carries `existingSlug` (or `hubHref`), is listed in `/events/` and its month hub,
  and links to the page that already exists rather than getting a second one — so
  no live URL moves and no two pages compete for the same event. 54 of the 61 rows
  get a new page. Reversible: drop the mapping and 7 more pages generate.
- **2026-08-07 — v2: is there actually supply on social, or is this an ICS
  problem wearing a computer-vision costume?** The extraction half of v2 is
  solved technology; acquisition is the whole risk. Instagram's only public
  read primitive is Graph API Hashtag Search, behind Meta App Review and
  business verification (verify current scopes and rate limits against Meta's
  docs before committing — the constraints recorded here are recollection, not
  a citation). Facebook's public Events endpoints are withdrawn. The open
  platforms (Bluesky, Mastodon) are trivially readable and almost certainly
  carry no Central Coast event flyers. Meanwhile the venue and chamber sites
  the PRD calls broken may already expose ICS feeds. v2.A's audit answers this
  before anything is built; if venues publish feeds, v2.C is the project and
  v2.D is a distraction.
- **2026-08-07 — where does the ingestion pipeline live?** Several sibling
  sites plausibly want the same "images → proposed rows" tool. Building it here
  is faster; building it in `portfolio` is reusable. Expensive to unwind after
  the fact, so it is a v2.A decision, not a v2.B discovery.
- **2026-08-07 — does v2 auto-publish? No, and that is load-bearing.** A vision
  model reading a flyer is a probabilistic source: it will misread 8/15 for
  8/16, supply a year the poster never stated, and read "Free!" off a banner
  that meant free parking. § 3's "no listing ships with an estimated date" and
  the three deferred decisions in `docs/CLAUDE.md` all rest on every published
  fact being sourced. So the pipeline is a proposal generator, not a publisher —
  it writes to `data/*.csv` only through operator approval, and the existing
  CSV-vs-`events-2026.ts` drift test stays as a free correctness check on the
  whole ingest. A variant of v2 that removes the human contradicts the site's
  reason for existing.
- **2026-08-03 — no start times anywhere in the regional dataset.** The CSV has no
  clock times, so `startDate` is date-only (valid per schema.org "Date or
  DateTime"). `pacificOffset()` implements the PDT-through-Nov-1 / PST-after rule
  and is wired in, but emits nothing until a sourced time exists. Padding a date
  to midnight would publish a start time we do not have.
