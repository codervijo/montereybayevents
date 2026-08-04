# Growth Log — montereybayevents.com

> **What this file is for:** an honest, append-only log of growth experiments
> on this site — what was tried, what was measured, what happened. The data
> source is GSC; this file narrates *why*. Future-you (or future-Claude)
> reads this when deciding what to try next, both on this site and on
> related sister sites.

## How to use this (workflow — re-read this when you forget)

**Add an entry whenever you do something growth-relevant.** That includes:
shipping new content, structural SEO changes (sitemap, schema, redirects,
internal linking), tech changes that affect crawl/indexing, marketing
pushes, backlink campaigns. *Not* every code commit — just things you'd
want to point at when GSC numbers move (or fail to).

**Each entry is a hypothesis you can be wrong about.** Commit to a
measurable KPI and an observation window before acting — otherwise "did
this work?" is just a feeling.

### Lifecycle of one entry

1. **Day of action** — append a new dated H2 with `Status: active`, the
   hypothesis, the KPI you'll watch, current baseline numbers, what you
   did, and the date to review (default: today + 28 days, matching GSC's
   reporting window).
2. **Review day** — pull current GSC numbers, compute delta vs baseline.
   Fill in **Result** and **Learning**. Set **Status** to `shipped` (worked,
   keep going), `failed` (didn't pay off, abandon), or extend the review
   another window if results are ambiguous.
3. **Never rewrite older entries.** Wrong hypotheses are the most valuable
   data — they tell you what NOT to repeat on the next site. Append, don't
   edit.

### Where to get the numbers

```bash
cd ~/work/projects/sites/portfolio && make run ARGS="gsc sync"
```

Then read the row for `montereybayevents.com`. Or pull from
https://search.google.com/search-console directly.

### Format

```
## YYYY-MM-DD — <one-line hypothesis or action>
- **Status:** active | testing | shipped | failed | abandoned
- **Hypothesis:** <what you're betting will work — only on initial / new-bet entries>
- **KPI:** <what GSC metric / query / page>
- **Baseline:** <numbers at start>
- **Action:** <what was done; 1-2 lines>
- **Result:** <numbers after window; "TBD — review YYYY-MM-DD" until then>
- **Learning:** <why it worked / didn't; what to try next; "TBD" until reviewed>
```

---

## 2026-08-03 — Regional event search is dominated by destination marketing…
- **Status:** active
- **Hypothesis:** Regional event search is dominated by destination marketing organizations optimizing for inspiration, not logistics — and by government calendars published as client-rendered map apps with no indexable HTML. That leaves a wide gap on long-tail, low-competition, high-intent queries: free event lists, exact dates, start times, parking, and road closures. Keyword data confirms it: the head term "monterey car week" is defended at KD 44, but "monterey car week free events," "monterey car week 2026 dates," and "when does monterey car week start" return no difficulty score at all, meaning thin backlink profiles in the top ten. The plan is to win those queries first with genuinely better structured pages, use Car Week as the annual traffic spike that seeds an Instagram audience and newsletter list, and convert that attention into year-round coverage of the 60+ other public events across both counties. Distribution is social-first in year one — Instagram and a Spanish-language WhatsApp channel, since search authority takes months — with the newsletter as the owned asset that survives both algorithm changes and the eleven months a year when nobody is searching for Car Week.
- **KPI:** any GSC traffic — clicks, impressions, indexed-page count
- **Baseline:** 0 clicks / 0 impressions (just deployed)
- **Action:** project scaffolded via `portfolio new bootstrap`; first deploy pending. After deploy: verify in GSC as `sc-domain:montereybayevents.com` and submit the sitemap.
- **Result:** TBD — review 2026-08-31
- **Learning:** TBD

## 2026-08-03 — Own the free/logistics long tail with a dedicated page, and make Car Week a section instead of the site
- **Status:** active
- **Hypothesis:** The zero-difficulty queries named in the entry above ("monterey car week free events" and friends) need a page that answers them literally, not a filter state inside a schedule. A dedicated `/free/` page — every free-for-spectators listing grouped by day, with venue, admission label and a published time where one exists — is the closest possible match to that query, and there is no head-term competition defending it. Two structural bets ride along with it: (1) valid `Event` JSON-LD on all 50 `/event/` pages should make them eligible for event rich results, which previously could not fire at all because the required `startDate` was missing; (2) demoting Car Week from "the site" to `/monterey-car-week/` means the homepage can accumulate authority as a year-round Monterey/Santa Cruz calendar rather than a page that is stale for eleven months. The newsletter form in the footer starts collecting the owned-audience asset from day one.
- **KPI:** impressions and clicks on `/free/` for free/date/time-intent queries; event rich-result eligibility for `/event/*` in GSC's Enhancements → Events report; indexed-page count for `/`, `/monterey-car-week/`, `/free/`
- **Baseline:** 0 clicks / 0 impressions / 0 indexed pages — not yet deployed
- **Action:** Added `/free/` ("Free Monterey Car Week Events 2026", 27 day-listings across all ten days, `ItemList` schema, linked from the homepage hero, the Car Week hub and the schedule page). Fixed `Event` JSON-LD on every `/event/` page: `startDate` (+ `endDate` for multi-day runs and known finish times), `offers`, `organizer`, `PostalAddress` location. Moved the Car Week hub to `/monterey-car-week/`, the schedule to `/monterey-car-week/schedule/` with a 301 from `/schedule/`, and rebuilt the homepage as a regional index with Car Week featured. All 50 `/event/` URLs unchanged. Footer email capture added site-wide.
- **Result:** TBD — review 2026-08-31
- **Learning:** TBD — the specific thing to check is whether `/free/` outperforms the schedule page on free-intent queries. If it does, the same "one page per intent, not one filter per intent" pattern is worth repeating for parking, road closures and family-friendly events, and on sister sites.
