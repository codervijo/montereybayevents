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
