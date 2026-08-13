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

## 2026-08-12 — v1.D: Car Week logistics pages, admission audit, Event location fix

> Time-critical work with Car Week already running (Aug 7–16, four days left).
> Five asks: (1) verify the http→https split, (2) fix the missing `location` on
> `/event/breakfast-club-rally-x-mcw/` and audit every Event block for thin
> locations, (3) expand `/traffic/` with closures by day, Hwy 1/68 conditions,
> parking by venue, shuttles and arrival times, (4) expand `/free/` into the
> definitive free list with per-entry confirmation it is actually free, and
> (5) cross-link `/traffic/` and `/free/` contextually from every event page and
> both Car Week hubs. Anything not confirmable from an official source to be
> marked `[VERIFY]`; no invented closure times or parking prices. Titles on other
> event pages explicitly not to be touched.
>
> Four deviations worth knowing.
>
> (1) The http→https redirect was already correct — a single 301, no chain. The
> 188 impressions on the http URL are legacy index entries, not a live defect, so
> nothing was changed there.
>
> (2) The audit turned up factual errors rather than just thin ones. Three
> listings were labelled free and are not: Exotics on Broadway sells $40 general
> admission and the Ferrari Owners Club Concours Carmel sells donation tickets
> from $50 — both reclassified as ticketed and removed from `/free/`, with a
> short section on that page explaining why they are absent — while Werks Reunion
> is free to enter but charges $40 cash to park. Two events also carried the
> wrong venue: Werks Reunion and Monterey British Car Event were both at Corral de
> Tierra Country Club in Salinas, and are actually at Monterey Pines Golf Course
> and the Carmel Valley Historical Society respectively.
>
> (3) The `location` fix could not follow the brief literally. The organizer of
> the Breakfast Club Rally deliberately withholds the address — "meet at an
> undisclosed Carmel location", no spectators — so a `streetAddress` and
> `postalCode` do not exist to publish. The Place carries the city that IS
> published and nothing more. `postalAddress()` now treats the ZIP as optional so
> a city-only address still yields a structured `PostalAddress` rather than a
> plain-text fallback, and a new test fails the build if any Event node loses
> `location`. The old test asserted the opposite — that `location` is undefined
> when no venue matches — which is how the defect shipped.
>
> (4) The remaining 52 thin locations are regional (non-Car-Week) events whose CSV
> carries no street address, plus 9 Car Week entries that are genuinely area-type
> — rally routes, roving showcases, private venues — where no single street
> address exists. Neither set was filled in, because doing so means sourcing ~52
> real addresses and the alternative is inventing them.
>
> (5) Follow-up in the same session replaced the `[VERIFY]` badge entirely. The
> operator's constraint was "don't leave it as VERIFY and also don't guess" —
> which is only contradictory if the page insists on making the claim. It does
> not have to. `admissionConfirmed: boolean` became an `Admission` union
> (`confirmed-free` / `cost-to-arrive` / `public-street` / `not-published` /
> `not-spectator`) and `/traffic/`'s two-state confidence became three
> (`official` / `derived` / `unpublished`), so every line is a defensible
> statement about the public record rather than a note about our own diligence.
> "Nobody publishes a Pacific Grove parking plan" is a finding; "we haven't
> checked" was a to-do leaking onto a live page. The Quail Rally left `/free/`
> altogether as `private` — invitation-only, no public provision — which is why
> the listing count fell from 25 to 22.
>
> (6) A screenshot of pebblebeach.com/17-mile-drive/ resolved what no automated
> read could: the gate fee is $12.50 per vehicle, reimbursed on a $35+ spend at
> a Pebble Beach Resorts restaurant (Market excluded); Concours tickets already
> include entry, parking and shuttles; and — not previously known to us — the
> Casa Palmero garage and 17th Hedgerow are RESERVATION ONLY on August 10–12 on
> 831-625-8536, which is exactly where and when the Motoring Classic arrives.
> Stillwater Cove coastal access is closed August 13–16, a closure the page had
> been missing entirely.
