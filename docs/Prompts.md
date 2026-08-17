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

## 2026-08-14 — v1.E: Timber Fire incident banner + Tour d'Elegance route correction

> The Timber Fire started in Big Sur on 9 August and closed Highway 1 mid-Car-Week.
> Asked to research current status, find event impacts, add a warning to /traffic/
> and link the fire status from the pages.
>
> **TAKEDOWN REQUIRED.** Set `timberFire.active = false` in `src/data/traffic.ts`
> when the incident closes and the banner disappears everywhere. A stale emergency
> notice is worse than none — it discredits every other fact on the page. This is
> the only thing on this site with a deliberate expiry.
>
> Findings worth keeping. (1) The Pebble Beach Tour d'Elegance was **rerouted** on
> 11–12 August because of the fire — it stayed inside Pebble Beach and Monterey
> instead of running the coast to Big Sur, confirmed on the Concours' own updates
> page. Our description still said "along a scenic route on Highway One", which
> stopped being true; corrected with the actual route and the chairman's quote.
> (2) The Concours itself on Sunday 16 August was NOT cancelled, and the banner
> says so, because that is the question most readers arrive with. (3) A Cars and
> Coffee at Asilomar was cancelled — not in our dataset, so no change. (4) Big Sur
> venues (Henry Miller Library, Fernwood) cancelled events indefinitely; Esalen
> closed to 23 August; all four Big Sur state parks closed.
>
> Two deliberate design calls. The banner is **not a live feed** and says so:
> acreage and containment carry an explicit "as of" and link to CAL FIRE, because
> a cached acreage read as current could tell someone a fire is smaller than it
> is. And it renders on Car Week pages plus **Monterey County** regional events
> only — a wildfire banner on a December Santa Cruz holiday parade is noise, and
> noise is how readers learn to ignore the banner on the page where it matters.
> 73 of 104 event pages carry it.
>
> fire.ca.gov and readymontereycounty.org both block automated reads, so figures
> come from CBS, Lookout, KQED and BigSurKate quoting CAL FIRE, not from CAL FIRE
> directly. Every one of them links back to the incident page.

## 2026-08-17 — v1.F: Timber Fire banner refreshed to day-10 figures

> Asked to check the fire status and take the banner down. Checked first, and
> the takedown was wrong: on day 10 the Timber Fire was **5,153 acres and 17%
> contained** — about 1,100 acres *larger* than when the banner was written —
> with Highway 1 still shut between MM 45.1 and MM 37 and all five evacuation
> orders and five warnings still in force. The defect was **staleness, not
> expiry**, which is the distinction the maintenance comment in `traffic.ts`
> already draws: set `active: false` "the moment it stops being current." It
> hadn't. Car Week ending changed *who* was reading, not whether the road was
> shut. Surfaced that, offered refresh / take down / refresh-and-narrow, and the
> operator chose refresh.
>
> Sourcing was the same problem v1.E hit, in both directions. fire.ca.gov still
> 403s automated reads. The Big Sur Chamber page is stale the *other* way —
> last updated 10 August, still saying "Highway One is currently open" six days
> after the closure — which is a good argument for never treating a page's
> presence as evidence of its currency. Figures came from BigSurKate's day-10
> morning update and Local News Matters, both quoting CAL FIRE.
>
> Corrected the start date to Saturday 8 August: CAL FIRE's own incident path
> (`/incidents/2026/8/8/`), Local News Matters and BigSurKate's day-count all
> agree. "Sunday, 9 August" was internally consistent — Aug 9 *is* a Sunday —
> and still a day late, which is the kind of error that survives review.
>
> `eventImpact` was entirely expired; all four entries were Car Week. Replaced
> with what is true now, including the one listing in our own dataset the fire
> actually reaches: Big Sur Food & Wine (5–7 November) has paused ticket sales,
> quoted in the organisers' own words, dates unchanged.
>
> **Next thing to go stale:** the Carmel Valley Library evacuation point is
> published only through 17 August with no extension announced. The end date is
> stated explicitly plus the county line, so a reader tomorrow sees a window
> that has visibly closed rather than a false claim.

## 2026-08-17 — v1.G: Turkish festival factual fixes, Place schema, neutral OG card

> Eight fixes to `/event/california-turkish-arts-culture-festival/`: two-day run,
> venue + full address, per-day hours, `Place` schema, neutral OG image, delete
> the provenance block, keep the slug, drop the year from `<title>`.
>
> The load-bearing discovery was that **most of the asks lived in
> `RegionalEventPage.astro`**, which renders all 54 regional event pages — so
> "delete the provenance block" and "no year in the title" were site-wide
> changes wearing a single-page costume. Asked before writing; operator scoped
> both to this page. Implemented as named optional fields on `RegionalEvent`
> (`seoTitle`, `headline`, `hideSources`) rather than a slug hardcoded into a
> shared component, then verified the blast radius: 53 other pages still carry
> their year-in-title and their provenance block.
>
> **`[VERIFY]` was asked for and deliberately not used.** v1.D removed it from
> this site on the operator's own constraint — "don't leave it as VERIFY and
> also don't guess" — and the `write-lamill-seo-page` skill says an unresolved
> `[VERIFY]` ships `noindex` and leaves the sitemap, which would have taken a
> live page out of the index over unconfirmed door hours. Offered the options;
> operator chose the v1.D confidence vocabulary. So the hours carry
> `timesConfidence: "unconfirmed"` and the page states a fact about the public
> record instead of a note about our diligence: the organiser has not published
> door hours on its own page, these come from a secondary listing, and they are
> therefore kept out of the structured data while the dates are not. Visible to
> the reader, absent from the JSON-LD. Flip to `"official"` when TAAC confirms
> and the note rewrites itself.
>
> Two things worth keeping. `streetAddress` / `postalCode` emit **only** where a
> real sourced address exists and are never derived from a venue name — a maps
> result will happily route someone to a guess. And the OG card is the one
> change that is not page-scoped: it is a single constant, so all 54 regional
> pages now serve `og-default.jpg` instead of a Concours photograph that
> misdescribed every non-Car-Week listing it was attached to. The card is drawn
> from the site's own oklch tokens converted to sRGB — the conversion reproduces
> the two values `favicon.svg` already documents, which is how it was checked —
> and reuses the favicon's calendar mark. `public/og-default.svg` is the source;
> re-render the jpg if it changes. Set in DejaVu Sans Condensed because Bebas
> Neue is not installed locally.
