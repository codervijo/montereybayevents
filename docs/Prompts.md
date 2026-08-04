# Prompt History — montereybayevents.com

<!-- Append new prompts at the bottom, newest last. Format:

## YYYY-MM-DD [optional title]
> <prompt text or short summary>

The dated H2 (`## YYYY-MM-DD`) is what `portfolio project check` parses
to surface "last AI prompt" per project. Keep entries append-only.
-->

## 2026-08-03 — scaffolded via portfolio new bootstrap

> Created project skeleton. Stack chosen, scaffolding written, git initialized.

## 2026-08-03 — v1.A: Event schema fix, /free/ page, Car Week demoted to a section, footer email capture

> Four changes: (1) fix `Event` JSON-LD on `/event/[slug]/` — add the required
> `startDate` in ISO 8601 with timezone offset, `endDate` where a time is known,
> an `offers` object (price 0 / USD / InStock for free, official URL only for
> ticketed) and `organizer` where known; validate against schema.org/Event.
> (2) Add `/free/` — "Free Monterey Car Week Events 2026", grouped by day with
> date, location and time where known, `ItemList` JSON-LD, linked from the
> homepage hero and the schedule. (3) Restructure so Car Week is a section:
> hub at `/monterey-car-week/`, 301 `/schedule/` → `/monterey-car-week/schedule/`,
> header "Monterey Bay Events" with Events / Car Week / Traffic, homepage becomes
> a regional index with Car Week featured, `/event/` URLs unchanged.
> (4) Footer email capture on every page posting to an `EMAIL_ENDPOINT` constant
> (empty for now), label "Weekly Central Coast events, one email.", no modal.
>
> Deviation worth knowing: times are NOT synthesised. Only one event in the
> dataset has an organizer-stated clock time, so `startDate` is date-only
> elsewhere (schema.org accepts "Date or DateTime"). See `CarEvent.startTime`.

## 2026-08-03 — v1.B: regional event import, /events/ index, month hubs

> Import the 61 Aug–Dec 2026 Central Coast events from
> `data/monterey_santacruz_events_aug_dec_2026.csv` (committed as the source of
> record) into `src/data/events-2026.ts`; drop the `expected_visitor_level`
> column entirely as unsourced judgement. Build `/events/` (all events, sorted by
> date, filterable by county and month), `/events/<month>/` hubs for August
> through December 2026, and `/event/<slug>/` pages matching the Car Week
> template. Same Event JSON-LD rules; three events with no confirmed date ship
> with an empty date, a visible "Date not yet announced" label, and no Event
> node at all. Homepage links to `/events/` and the current + next month hub;
> hubs link prev/next; event pages link back to their month hub.
>
> Two deviations worth knowing. (1) Seven CSV rows are Car Week events that
> already have pages — four collide exactly on slug — so they carry
> `existingSlug`/`hubHref`, appear in the index and hubs, and link to the
> existing page instead of getting a duplicate. 54 new `/event/` pages, not 61;
> no live Car Week URL moved. (2) The CSV has no clock times, so `startDate` is
> date-only; `pacificOffset()` implements the -07:00/-08:00 rule and is wired in
> but emits nothing until a sourced time exists. Times are never synthesised —
> same rule as v1.A.
