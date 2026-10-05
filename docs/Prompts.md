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

---

*Entries from v1.H onward were reconstructed from git history on 2026-09-13,
because this log lapsed after v1.G. They are a record of what shipped and why,
taken from the commit messages — not a record of what was asked. Nothing below
this line is a verbatim prompt.*

## 2026-08-18 — v1.H: Timber Fire banner, expired evacuation line replaced with the real shelter

> The evacuation-point line went stale on the live site overnight, exactly where
> v1.F predicted. It advertised the Carmel Valley Library Temporary Evacuation
> Point as open "Friday 14 August through Monday 17 August" — a window that
> closed yesterday — on 73 event pages plus `/traffic/`. Replaced with the
> facility open the whole time and never carried: the overnight shelter at
> Carmel Middle School, 4380 Carmel Valley Road, open since Monday 10 August
> (KAZU, already in the incident's sources). The library TEP's lapsed window is
> stated as a fact rather than left as a dead date; the county information line
> stays.
>
> `asOf` now distinguishes "we have not looked" from "nobody has published".
> Re-checked today: no source has a reading newer than Monday's 5,153 acres /
> 17%, so the figures are unchanged and the field says why, rather than
> restamping yesterday's numbers with today's date. BigSurKate 403s today though
> it answered yesterday; CAL FIRE still 403s; KAZU is showing Saturday's figures.
>
> Sources disagree on the closure's southern limit — BigSurKate says mile marker
> 37, KAZU and others say MM 31 at the Julia Pfeiffer Burns vista point. We were
> publishing MM 37 as `official` when the record is not that clean. The closure
> text now names both, drops the single-number claim from its opening sentence,
> and sends readers to QuickMap for the live boundary. Highway 1 row in
> `closures[]` extended to 18 August. The fire is not out and no evacuation zone
> has been lifted, so `active` stays true.

## 2026-08-18 — v1.I: West End Celebration, a researched page instead of a stub

> `/event/sand-city-west-end-celebration/` was 598 words of template around a
> one-line description. Now 1,733, sourced from the organiser rather than padded.
>
> The page exists because the SERP is wrong in two specific ways, so that is its
> opening section rather than a footnote. Aggregators still carry the 2025 dates,
> 23–24 August; the 2026 event is 22–23 August, a day earlier, per the
> organiser's own site. And the most findable page describing MST's free shuttle
> for this festival — route, pickup points, timetable — is an announcement from
> 2010, sixteen years old. The organiser confirms a free shuttle runs in 2026 but
> publishes no route or timetable, so the page says exactly that and sends people
> to mst.org.
>
> Six sections and six FAQ entries: what it actually is (six blocks closed to
> cars, three stages, 150+ vendors, 20+ years, By The Glass Design), parking,
> shuttle, the free bike valet, what it costs inside, and the rules that catch
> people out. "What has not been published" is a deliberate section — opening
> times, the 2026 shuttle route, the lineup, ATMs and accessibility are genuinely
> unpublished, and the organiser's FAQ says only that times "will be announced
> soon", so the page carries NO hours rather than repeating last year's. Same
> posture as v1.D and v1.G.
>
> The mechanism is reusable rather than one-off: `intro`, `sections` and `faq` on
> `RegionalEvent`, absent by default, because absent is the honest default and a
> padded page is worse than a short one; a `metaDescription` override, since the
> CSV-derived `description` says what an event IS while a researched page can say
> what the reader GETS; and `buildFaqJsonLd` emitting FAQPage from the SAME array
> the template renders, so visible text and markup cannot drift. `hideSources` is
> set here — the reference URLs record where the LISTING came from at import and
> would now misdescribe where the content came from.
>
> `officialWebsite` added and synced to the CSV; the drift test caught the TS/CSV
> mismatch and failed the build exactly as designed.
>
> NOT added: an `offers` node. The organiser states plainly there is no admission
> fee — the first sourced admission data on any regional listing, and exactly
> what v1.C is blocked on — but putting `offers` on one of 54 listings is a v1.C
> precedent decision, not a drive-by.

## 2026-08-18 — v1.J: Christmas in the Adobes was a day short; first organiser-confirmed hours

> Checked three date conflicts against the organisers rather than against each
> other. One of them was ours. Christmas in the Adobes ran here as a single
> evening, 11 December; the Monterey State Historic Park Association publishes
> "December 11 & 12", two evenings, 5:00–9:00 PM. Corrected in both the dataset
> and the CSV, so the page now carries `endDate` as well as `startDate`.
>
> The hours are the first `timesConfidence: "official"` on the site. Every prior
> set was "unconfirmed" — from a listing rather than from whoever runs the event.
> The times stay display-only and out of the Event JSON-LD regardless; that is
> the v1.G rule and it does not relax just because the source is good.
>
> The other two conflicts resolved in the site's favour, so nothing changed.
> Monterey Bay Half Marathon is 8 November, 7:00 AM; race weekend spans 7–8
> November because of the Pacific Grove Lighthouse 5K and the expo, which is what
> the other source was describing. Noted for the day we publish a start time: the
> organiser writes "7:00 AM PDT", but Pacific daylight time ends 1 November 2026,
> so race day is PST — `pacificOffset()` already returns -08:00 after 1 November
> and would quietly be right. And the festival's own name is Monterey Bay Greek
> Festival, per Saint John the Baptist Greek Orthodox Church who run it.
>
> NOT applied: the Greek festival's date. The organiser says it runs "every Labor
> Day weekend, Saturday to Monday", and Labor Day 2026 is 7 September, which
> would make it 5–7 September. That is an inference from a recurring rule, not a
> published 2026 date, and dates are never synthesised. It stays undated.

## 2026-08-18 — v1.K: Turkish festival researched, hours confirmed at the organiser

> 745 words to 1,619, researched at the Turkish American Association of
> California rather than at the listing the row was imported from.
>
> The hours are the real win. v1.G shipped Sunday 11–6 as `unconfirmed`, from a
> secondary listing. TAAC publishes 11:00 a.m. to 7:00 p.m. on BOTH days, so
> `timesConfidence` is now "official" and the Sunday figure changes. Several
> local listings still show Sunday closing at 6; rather than pick a winner
> silently, the page publishes the organiser's hours and tells anyone arriving
> late on Sunday to treat 6:00 p.m. as the safe assumption. That is the useful
> shape of a source conflict: state whose number it is, and say which way to be
> wrong. `officialWebsite` found and added — turkfestca.org. The row had none,
> which is why v1.G had no organiser to check against in the first place.
>
> Content is from the organiser: 26th year, a 501(c)(3) founded in 1975, the
> Whirling Dervishes performing the sema with teaching demonstrations,
> Horon/Dirmil/Silifke folk dances, Group Taksim Big Band, ebru water marbling
> and carpet weaving, the menu, and the children's programme. Six FAQ entries
> with FAQPage markup built from the same array the template renders. "What has
> not been published" covers the missing stage schedule and the absence of any
> organiser parking guidance.
>
> The name is deliberately NOT corrected. The organisers call this the Monterey
> Turkish Arts & Culture Festival; ours came from a third-party listing and is
> wrong. Fixing it broke the slug test — name and slug would disagree — and the
> operator chose slug stability over name accuracy, since the page is live. So
> the page keeps its name and instead explains all three circulating names, which
> has the side benefit of catching searchers using any of them. If the slug is
> ever moved, the name should move with it.

## 2026-08-18 — v1.L: first sourced admission data, offers on a regional event

> Unblocks the half of v1.C pending since 7 August. `admission` on
> `RegionalEvent`, set ONLY where the organiser states it in their own words.
> West End Celebration is the first and only: their FAQ says "there is no
> admission fee for the West End Celebration." The union has exactly one member,
> `"free"`, because that is the only value anyone has checked — it grows one
> organiser at a time, never speculatively.
>
> `buildRegionalOffer` mirrors `eventSchema.ts`'s `buildOffer` so both datasets
> publish the same shape: price 0 / USD / InStock, with `offers.url` always
> present because Google treats it as required whenever an Offer exists. The page
> shows a visible "Free admission" badge — a price on the page and a price in the
> markup are one claim, not two.
>
> The guard moved rather than went away. `regionalEventSchema.test.js` asserted
> `ld.offers` is always undefined, which was correct while no row had admission
> data and would now be a rule against ever having any. It asserts instead that
> an Offer appears if and only if `admission` is set, plus the full shape of the
> one that exists. Scope check on the build: 53 of 54 regional rows publish no
> price at all; the four other regional slugs carrying offers are Car Week pages
> reached via `existingSlug`, which have had them since v1.A. `docs/CLAUDE.md`'s
> "No offers on regional events" deferred decision is amended rather than
> rewritten, per that section's append-only rule.

## 2026-08-19 — v1.M: Greek festival, publish the recurring rule, still publish no date

> One of the three rows with no announced date. It rendered "Date not yet
> announced" and nothing else — honest but useless to someone trying to plan. It
> now carries what the organisers do publish: Saint John the Baptist Greek
> Orthodox Church of Monterey County holds it every Labor Day weekend, Saturday
> to Monday, at Custom House Plaza. 590 to 1,036 words.
>
> The data deliberately did not move. `dateText` stays empty, the page still
> shows "Date not yet announced", and it still emits no Event JSON-LD, because
> there is no start date to put in one. Everything added is prose about a
> published pattern, not a date.
>
> The arithmetic is on the page, labelled as arithmetic. Labor Day 2026 is Monday
> 7 September, so the pattern computes to 5–7 September — and the page says that
> in the same sentence as saying it is a computation on a recurring rule rather
> than an announced date. The reason is stated too: a computed date becomes
> indistinguishable from a confirmed one the moment it has been copied into a few
> calendars. Reader advice is hold the weekend, confirm before booking. This is
> the `derived` posture from `/traffic/` applied to an event page.
>
> NOT set: admission. Several secondary sources say the festival is free, and it
> probably is, but the organiser's own site 403s and `admission` is documented as
> settable only from the organiser's own words.

## 2026-08-20 — v1.N: Timber Fire, evacuation orders corrected, closure now shrinking

> The banner had gone materially wrong rather than merely stale. It listed five
> zones under evacuation order when two remained: MRY-F023, F025 and F026 were
> downgraded to warnings on Tuesday 18 August, and F027-A with them. Publishing
> an order that has been lifted over-states the restriction across 73 pages —
> the same trust failure the block's own comment warns about, pointing the
> opposite way from the usual one. Orders are now MRY-F027 and MRY-F028-A;
> warnings grew from five zones to eight.
>
> Figures to 5,526 acres / 24% contained as of Wednesday 19 August, from 5,153 /
> 17% on Monday. The containment field names the previous number so a reader sees
> the direction of travel rather than a bare percentage.
>
> The closure is shrinking: its northern limit moved half a mile south to MM
> 44.5, below Post Ranch Inn and Alila Ventana, on the 18th, and crews have been
> clearing debris from firing operations along Highway 1 specifically in order to
> reopen it. Still no reopening date, so the advice does not change yet, but "no
> timeline at all" is no longer true. The mile-marker disagreement recorded in
> v1.H is resolved — sources now agree on MM 37 at the south end — so that caveat
> is removed rather than left implying a doubt that no longer exists.
>
> Worth knowing for next time: the Big Sur Chamber page, which sat at 10 August
> telling readers "Highway One is currently open" through nine days of closure,
> has updated and matches everyone else. It is usable again. bigsurkate.blog is
> still 403ing. No newer figures than Wednesday exist; `asOf` says so rather than
> implying we did not look. `active` stays true.

## 2026-08-21 — v1.O: Jazz Festival and Salinas Airshow researched from their organisers

> The two biggest September listings, both previously a date and a line. Jazz
> 1,673 words, Airshow 1,517, sourced from montereyjazz.org and salinasairshow.com
> rather than from the listings they were imported from. Titles, H1s and slugs
> untouched — both pages are live and indexed, so no `seoTitle` or `headline` was
> set, only body content, `metaDescription`, times and structured data. That is
> now the standing rule for any live page rather than a judgement call per page.
>
> The Jazz page exists to prevent one specific expensive mistake. Arena is $110
> Friday and $215 Saturday or Sunday; Arena Lawn $75 / $135; Grounds $65 / $90 —
> quoted from the organisers' own press release, because prices are exactly the
> figure not to take second-hand. A Grounds ticket does NOT admit to the Arena,
> and the headliners people are buying for — the first-ever Hancock and Carter
> duo, the Jazz at Lincoln Center Orchestra — are Arena shows. Someone can spend
> $90 and not get in to the thing they came for. Fairgrounds parking is already
> sold out for 2026.
>
> The Airshow page leads on the bag policy rather than the flying, because that
> is what actually goes wrong: no coolers of any kind, one clear bag 12x6x12,
> standard purses prohibited. The organisers are explicit that this is an FAA and
> Homeland Security requirement rather than their own rule, which is worth
> stating because it means there is no arguing it at the gate.
>
> Second `timesConfidence: "official"` on the site — the airshow publishes gate
> times (9:00 a.m., flying from ~11:30). Jazz gets no times at all: its own FAQ
> still says gate and box-office times will be announced "in early spring 2026",
> a sentence that has outlived the spring it refers to. The page says that rather
> than repeating last year's hours.
>
> NOT done: admission. Both events are ticketed and the union has only "free".
> Publishing real prices as an Offer or AggregateOffer is a schema design
> decision — what to do about tiered pricing, whether `lowPrice`/`highPrice` is
> honest for a festival where tiers admit to different areas — and not something
> to settle in passing. The prices are in the prose, where a reader deciding
> between tiers actually needs them.

## 2026-08-21 — v1.P: past-event pages stop talking about the future

> 58 of 104 event pages had already happened and were still telling readers to
> "check the official page before you travel". All 54 regional pages said
> "Monterey Car Week runs August 7–16" in the present tense, five days after it
> ended.
>
> `src/lib/isPast.ts` is the whole mechanism: `end ?? start` compared date-only
> in America/Los_Angeles. The timezone matters — a build running after 5pm
> Pacific is already tomorrow in UTC and would age every page a day early. An
> event is past only once its LAST day is behind us, so a multi-day run reads as
> current throughout rather than flipping on its opening day, and an event
> happening today is never past. Undated events are never past; there is no date
> to have passed.
>
> Both templates branch their When-section copy, and the regional footer promo
> carries both tenses — past readers get pointed at the Car Week section and at
> the Highway 1 closure still in force, rather than at a free-events list where
> everything has happened.
>
> The helper is BUILD-time, not view-time, and says so in its own docstring at
> length. That is fine for switching tense: if a rebuild lags, a page reads
> slightly stale rather than making a false claim. It is explicitly not
> sufficient for hiding or filtering listings, where a frozen "today" would
> silently show the wrong set while looking maintained. Anything that filters
> needs a scheduled rebuild first.
>
> Verified across the build: 58 past pages, 0 carrying forward-looking copy; 46
> upcoming or undated pages keep theirs; 54 regional pages moved from "runs" to
> "ran". Also adds v1.Q to the phase table as PLANNED — the date-aware listings
> work, with the scheduled-rebuild blocker and two sub-problems (`/free/` renders
> empty under a hide rule; `currentAndNextMonth` must roll forward when the
> current month is wholly past) written down rather than carried in conversation.

## 2026-08-21 — v1.R: airshow FAQ answers the actual People-Also-Ask box

> An Ahrefs SERP overview for "salinas airshow" (16 Aug 2026, volume 500) put a
> People also ask block at position 2 — above everything except the organiser.
> Its four questions are now answered in the page's FAQ, which renders visibly
> and feeds FAQPage markup from the same array.
>
> The valuable one is the Blue Angels question. The organisers announce the USAF
> Thunderbirds for 2026, and several third-party listings still show the Blue
> Angels for these exact dates — which is almost certainly why the question is in
> the PAA box at all. The page says plainly that it is the Thunderbirds this year
> and that listings saying otherwise are wrong for 2026, without claiming a
> strict alternating pattern between the two teams, which is not sourced. "Are
> any airshows cancelled in 2026?" is answered narrowly, about Salinas only.
> Dropped the now-redundant "When is the Salinas airshow in 2026?" rather than
> leaving two questions covering the same ground. Nine questions, nine Question
> nodes, 1,499 to 1,797 words.
>
> Worth recording what the SERP data changes about our read of this page. The
> incumbents are thin and weakly linked: the organiser ranks first on DR 36 with
> 421 words, EventSprout on 274, salinas.gov on 571 words with ZERO backlinks,
> See Monterey on 990 with two. The high-DR results are profile pages pulling
> almost nothing — Instagram at DR 100 takes 38 visits, Yelp at DR 94 takes 3.
> This SERP is held by entity match and age rather than by content depth, which
> is a much better position than the "new site, forget it" read, and it means the
> page needs time and crawl signals rather than more words.
>
> Same-day follow-up, v1.R.1: three of the four PAA questions went in word for
> word and the fourth did not. "Are any airshows cancelled in 2026?" had been
> narrowed to "Is the 2026 Salinas airshow cancelled?" — honest, but it threw
> away the match and made the v1.R row's claim that all four were answered
> verbatim untrue. Restored to the exact PAA wording, answered honestly within
> scope: not this one; what actually changes at airshows is the flying, because
> performers are subject to change and weather closes individual acts; and an
> explicit statement that we only speak for Salinas. A broad question can be
> answered narrowly as long as the narrowing is stated rather than hidden.

## 2026-08-21 — v1.S: per-URL `<lastmod>` in the sitemap

> The sitemap had no `lastmod` on any of its 115 URLs, so nothing signalled that
> six pages were substantively rewritten this week. `updated` on `RegionalEvent`,
> set by hand on the same commit that changes a row, feeds `<lastmod>` through
> @astrojs/sitemap's `serialize`. Six URLs now carry a real date; the other 109
> carry none.
>
> The asymmetry is the design, not an omission. A sitemap that stamps every URL
> with the build time tells Google nothing and trains it to ignore the field.
> Deriving from git would be worse: all 54 regional rows live in one data file,
> so every regional page would claim to change whenever any single row did. Six
> honest dates are worth more than 115 synthetic ones, and a page with no
> `lastmod` is not making a false claim.
>
> Correction, recorded because it was got wrong out loud first: IndexNow does NOT
> reach Google. It feeds Bing, Yandex, Naver, Seznam and Yep. And portfolio's
> `gsc recrawl` is read-only by design — Google's Indexing API restricts
> submissions to JobPosting and BroadcastEvent content, and using it for general
> web pages violates ToS and is silently ignored. So for the Google indexing
> question the levers are this `lastmod`, GSC's manual Request Indexing, internal
> links and time. IndexNow is still worth firing, but for Bing and friends.

## 2026-08-21 — v1.U: the four remaining high-value September pages researched

> Four sub-phases, in order. Titles, H1s and slugs untouched throughout — all
> four pages are live and indexed.
>
> **v1.U.1 — Monterey County Fair.** 588 to 2,020 words from
> montereycountyfair.com. The page leads on a date error, because researching it
> turned one up: several listings pair "Friday, September 3" with these dates,
> and 3 September 2026 is a Thursday. The same listings put Left of Centre on the
> Payton Stage on opening night; the organisers have Eli Young Band there, with
> Left of Centre on the Turf Stage twice nightly. Prior-year data served as
> current — the same trap as the 2010 shuttle timetable on the West End page.
> Second lead: what fair admission does NOT cover — arena events separately
> ticketed at $5.65–$20.34, carnival wristbands $35 or $55, Sunday rodeo $14
> adult even though Friday and Saturday rodeo is free with entry. Also advance
> prices ($16.95 / $13.56 / $9.04, under-5 free), three full free-entry days,
> the military pre-sale closing 28 August, off-site $25 parking at Monterey Pines
> Golf Course with the organisers' own "extremely limited" warning, and all five
> Payton Stage headliners. Gate hours are `unconfirmed` — the fair does not
> publish them. `docs/CLAUDE.md` gains the weekday cross-check as a convention:
> run `date -d <iso> +%A` before trusting or writing any day-plus-date pair. It
> had by then caught three separate things — this fair's prior-year listings, the
> Timber Fire start date in v1.F, and the Greek festival's Labor Day arithmetic
> in v1.M.
>
> **v1.U.2 — INDYCAR Grand Prix.** 592 to 1,902 words from
> weathertechraceway.com. Leads on a conflict rather than a date: the raceway's
> ticket-information page says "children 15 and under are free with a paid adult"
> and INDYCAR's own announcement says the same, while the event's page at the
> raceway says "children regardless of age must have a separate ticket". Both are
> official and cannot both be true as written. The likely reading is that the
> strict line covers premium seating only, but neither page says that, so the
> page states the conflict and says confirm with the box office rather than
> publishing the inference. Full on-track schedule for all three days, green flag
> 12:05 p.m. Sunday — third `timesConfidence: "official"` on the site. Plus what
> general admission includes (paddock, not hot pit), hillside viewing at Turn 2
> and above the Corkscrew, the no-overnight-parking-without-a-camping-pass rule,
> tent camping 3–7 September, the new Turn 3 VIP Club, and the Champions Club
> already sold out. Process note: the first attempt wrote the entire INDYCAR body
> onto `monterey-pre-reunion-corkscrew-hillclimb`, because the edit was anchored
> on `officialWebsite: "https://weathertechraceway.com/"` — a value four Laguna
> Seca rows share — and replaced the first match. The CSV drift test caught it,
> which is exactly what that test is for. Anchor on the slug, never on a field
> value that repeats across rows.
>
> **v1.U.3 — Festa Italia, and its date was a week wrong.** 575 to 1,614 words.
> This site had Festa Italia as 4–6 September; it is 11–13 September. A visitor
> following our page would have arrived at an empty plaza a week early. Corrected
> in `events-2026.ts`, in the CSV, and on the 2026 poster. Four independent
> sources give 11–13; our 4–6 came from See Monterey's compiled 2026
> annual-events PDF. The weekday cross-check added in v1.U.1 did NOT catch this,
> and it is worth understanding why: 4–6 and 11–13 September are both
> Friday-to-Sunday, so the day names are internally consistent with either. The
> rule catches prior-year data, where the weekday drifts; it cannot catch a
> week-shifted date within the same year. Only going to the organiser catches
> that. The PDF is now recorded as a known-bad source for dates — a discovery
> source for WHICH events exist, never authority for WHEN. Hours are
> `unconfirmed`, from Old Fisherman's Wharf rather than the Festa Italia
> Foundation, whose own site does not render for fetching. Admission is reported
> free everywhere but is not set, for the same reason.
>
> **v1.U.4 — Castroville Artichoke, and its venue was wrong.** This page said the
> festival is "held at the Monterey County Fairgrounds". It is not: it returns to
> Castroville itself on 5 September 2026, for the first time since 2014. City,
> venue, CSV row and Event schema all corrected, so the Place node no longer
> sends people to a fairground in another town. The date was right; the venue was
> not, because the listing described the festival as it was in its final years.
> The story the page needed is bigger than a venue fix: the Artichoke Festival
> that ran for 65 years closed permanently on 9 May 2025 — its board said "the
> financial realities we now face are insurmountable" — and what returns in
> September is a revival by the Castroville Coalition with the North County
> Recreation and Park District, deliberately smaller at around 50 vendors against
> a festival that drew roughly 20,000 people in 2011. Also carried: the 1959
> founding out of the town's May Days Parade, Castroville as the self-declared
> Artichoke Center of the World, the 2014 move this return reverses, and Marilyn
> Monroe named the first Honorary Artichoke Queen in 1948, eleven years before
> the festival existed. A second, larger festival is expected October–November
> 2026 with no date or venue published, so it gets no listing and the page says
> it is coming. Note for anyone following the old trail: artichokefestival.org
> still shows June 2025 dates at the Salinas Posse Grounds and belongs to the
> organisation that closed.
>
> Two of v1.U's four pages carried a factual error a reader would have acted on.
> A same-day follow-up then checked the three remaining PDF-sourced rows — PURE
> Insurance Championship (18–20 September, spectators need no ticket), Meet the
> Makers (Saturday 10 October, 4–7pm, Devendorf Park) and First Night Monterey
> (Thursday 31 December, its 34th year) — and all three are correct on date,
> city, venue and name. So the PDF's failure mode is not random noise: it
> describes events as they WERE, which makes it wrong whenever something moves or
> changes length, and date-only verification would have missed the Artichoke
> error entirely. All four rows now carry an `officialWebsite`, which is the
> actual remedy; 29 of 61 rows still have none.

## 2026-08-21 — v1.T: homepage stops leading with a finished Car Week

> Car Week ended 16 August. Five days later the homepage still opened with a
> "Featured event" block for it: a photograph, a five-day schedule grid, three
> CTAs, and two of the four "Plan the week" cards. Eleven mentions above the
> actual listings. One of those cards pointed at `/free/`, where every listing is
> a Car Week event and nothing is upcoming. This had earlier been described as
> "not really a featured-event position" — that was wrong; the markup literally
> reads `<p class="eyebrow">Featured event</p>`, and the recommendation that
> flagged it had it right.
>
> Now: Car Week mentions 11 to 5, `hero-carweek.jpg` off the page, and the
> featured slot shows the next four things actually happening, pulled from the
> dataset and sorted by start date. "Peninsula traffic peaks in August" is
> retitled "Check the road before you go" and rewritten around the Highway 1
> closure still in force. Past events are filtered out of the month listings —
> seven event links on the homepage, none past, where previously the first four
> listings a visitor saw were 1–2 August, 2 August, 6 August and 9 August.
>
> Everything is gated on `carWeekIsPast` and both tenses are kept, so this
> reverses itself for Car Week 2027 instead of needing a rewrite. That is also
> why the Car Week block is preserved rather than deleted.
>
> The `/free/` guard moved rather than went away. `seo.test.js` asserted that
> `/free/` is linked prominently from the homepage hero — correct in v1.A, when
> Car Week was ahead and `/free/` was the free-intent page. It now points at a
> page with nothing upcoming, and a primary CTA to a dead page is worse than
> none. The test now asserts what that rule was protecting: `/free/` stays
> reachable, stays prominent on the Car Week hub and schedule where its content
> lives, and appears in the homepage hero only behind the `carWeekIsPast` branch.
>
> Note this makes the homepage genuinely rebuild-dependent: the filtering is
> build-time, so a stale build now shows a stale set rather than merely stale
> copy. That strengthens the case for v1.Q's scheduled rebuild.

## 2026-08-21 — v1.V: Timber Fire, day-13 figures, closure retreating a second time

> Over 6,000 acres and 29% contained as of Thursday 20 August evening, from 5,526
> / 24% on Wednesday. The closure has moved south twice now: MM 45.1, then 44.5
> on the 18th, then 42.6 by the 20th — half a mile below Deetjen's Big Sur Inn.
> The copy names the whole sequence rather than just the current marker, because
> the direction of travel is the useful fact. Southern limit unchanged at MM 37.
> MRY-F027-A added to the warning list; we had eight zones where sources count
> nine, so the page was under-stating how much of the coast is still under some
> restriction. Orders unchanged at MRY-F027 and MRY-F028-A.
>
> `active` stays true, and it was worth saying why: 29% contained means 71% of
> the perimeter has no control line around it, the fire GREW on the last reading,
> Highway 1 is still shut, and two zones remain under evacuation order — people
> cannot go home. Containment climbing 17 to 24 to 29 is a fire being won. That
> is not a fire that is out, and the banner comes down when the incident closes,
> not when the trend looks good.
>
> Source note for next time: the SF Chronicle's "firefighters retreat as
> thunderstorms bring lightning" story still ranks prominently and reads as
> breaking news. It is from 12 August, with the fire at 3,800 acres and 5%
> containment. Same trap as the 2010 MST shuttle timetable and the prior-year
> fair listings, at news scale. CAL FIRE and Lookout both 403 now; BigSurKate has
> been unreachable since the 18th.
>
> Process note: the first attempt at this edit sliced from the DATA block's
> `roadClosure` to `evacuationOrders`, but the Incident TYPE declares
> `evacuationOrders` earlier in the file, so the end index preceded the start,
> the slice was empty, and Python inserted the replacement at position 0 —
> prepending it above the imports and breaking the build. Same class of error as
> v1.U.2's wrong-row edit: scope the edit to the object you mean first, then
> replace within that span.

## 2026-08-21 — v1.W: /laguna-seca/camping/, the site's first guide page

> A guide, not a listing: where to sleep for a race weekend, aimed at the INDYCAR
> finale on 4–6 September. 1,464 words, every fact from weathertechraceway.com
> and linked inline where it is used. Covers all ten camping areas by tier —
> Premier (Chaparral, Can-Am, Corkscrew View, Lower Terrace E-5, Turn 5 Right
> T5R), Reserved (Grand Prix, Corkscrew Upper View, Upper Terrace E-6, Terrace
> E-7) and General outside Turns 9–11 — with the 40-foot RV limit, the six-adult
> cap, the 2–5 p.m. check-in window, and the rule that catches people: every
> camper needs an event admission ticket as well as a camping pass.
>
> Access is quoted rather than paraphrased, because it is the expensive mistake:
> "When entering the park during any of our Major 2026 Season events, you must
> come in through the South Boundary Rd. entrance to the park." Map apps send
> people to the Highway 68 entrance.
>
> "What nobody publishes" is the substance of the page, same pattern as
> `/traffic/`: no camping rates at any tier, no General Parking price at all
> while Preferred and season passes are sold, no quiet hours, no generator rules,
> no sell-out date for the INDYCAR weekend, and no off-site alternatives. Each
> says who to ask instead. The General Parking asymmetry is stated as a finding
> and readers are told to budget for a charge rather than assume free.
>
> Correction to the brief: Watkins Gate being Saturday-only is not on the
> raceway's current pages. It appears in older Laguna Seca material, and the
> current ticket information names only South Boundary Road for 2026 major
> events. The page reports that as an open question rather than asserting a gate
> policy that could not be sourced — asserting it would have needed a `[VERIFY]`
> and cost the page its index status for a fact we do not have.
>
> No structured data at all. This describes a facility and a set of policies, not
> a scheduled occurrence, so Event markup would be a misuse of the vocabulary.
> Zero `[VERIFY]` markers, so it ships indexed: everything asserted is sourced,
> everything unknown is stated as an absence, and a confirmed absence is a fact
> rather than an unverified claim.
>
> Wiring: inbound from `/traffic/` (placed exactly where that page already names
> the Laguna Seca parking-price gap), from the September and October month hubs
> (conditional on the month having an UPCOMING Laguna Seca event, so August's
> finished Car Week dates do not trigger it), and from the INDYCAR event page;
> outbound to the INDYCAR page and `/traffic/`. Two small mechanisms:
> `guideLink` on `RegionalEvent` renders a real anchor — the first attempt put a
> markdown link inside a `sections` body, which renders as plain text and would
> have shipped literal brackets — and `GUIDE_LASTMOD` in `astro.config.mjs` lets
> non-event pages carry a real sitemap `lastmod` on the same hand-set terms as an
> event row's `updated`.

## 2026-08-22 — v1.X: Timber Fire, Highway 1 reopens and the fire gets bigger

> Two facts moved in opposite directions on Saturday 22 August, and that is the
> whole story. Caltrans reopened a ten-mile stretch of Highway 1 at 1 p.m. The
> banner's old headline — "if your plans involve driving south of Carmel, they
> need to change" — was therefore actively wrong advice for about five hours
> before this shipped, which is the worst failure mode this block has. Meanwhile
> the fire grew to 8,665 acres and containment FELL to 25%, from 6,055 acres and
> 29% on Thursday. It crossed the Big Sur River and is running east into the
> Ventana Wilderness, away from structures, which is exactly why the coastal side
> could be handed back while the headline number got worse. v1.V narrated 17 →
> 24 → 29 as a fire being won; that direction reversed and the copy no longer
> implies otherwise.
>
> Figures now come straight from CAL FIRE's incident API
> (`incidents.fire.ca.gov/umbraco/api/IncidentApi/List`), timestamped 6:29 p.m.
> This is the fix for the problem v1.V recorded as "CAL FIRE and Lookout now
> 403": those pages block a scraper, but the JSON behind them is open, and at the
> time of writing it was ahead of every news article about the same incident.
>
> Evacuation orders were wrong in both directions. MRY-F027-B and MRY-F028-A came
> down to warnings, MRY-F028 split into A/B/C/D, and MRY-F029 was upgraded.
> Orders are now MRY-F028-C and MRY-F029, neither of which we were listing.
> MRY-F028-D has no published status and the copy says so rather than guessing.
>
> The reopening is deliberately NOT reported as a full through route. Caltrans'
> own conditions service listed no Timber Fire closure anywhere on Highway 1 in
> Monterey County at 6:42 p.m., but the Henry Miller Memorial Library, reopening
> the same day, still tells visitors it is reachable only from the north until at
> least midday on 24 August. The sources conflict, so the page states both and
> sends the reader to QuickMap. Worth recording why the obvious corroboration
> does not work: mile markers run north-up here, so Nepenthe, Deetjen's and the
> Library all sit north of the closed segment, and their reopening says nothing
> about through-travel.
>
> Four stale closures corrected: Nepenthe and the Phoenix Shop reopened on the
> 22nd, the Henry Miller Library is back to 11–5, Esalen's "closed through 23
> August" became an open-ended closure with no announced date, and the Carmel
> Middle School shelter closed on 19 August where we had it open since the 10th.
> Also fixes the homepage's own "Highway 1 through Big Sur is closed" sentence,
> which lives in `index.astro` rather than in the incident data and so survived
> every previous refresh of this block. Adds BigSurKate to the sources as the
> only outlet publishing twice daily.
>
> Verified rather than assumed: the 8 August start date is right — day-15
> arithmetic and the CAL FIRE record agree, despite Lookout reporting the 9th.
> `active` stays true. 117 pages built, 240/240 tests green.

## 2026-08-24 — v1.Z (planned): log the meta-keywords cleanup rather than lose it

> Every one of the 104 event pages emits `<meta name="keywords">`, from
> `RegionalEventPage.astro:80` and `event/[slug].astro:94`. Nobody consumes the
> tag: Google confirmed in 2009 that it is not used in web ranking, and Bing has
> said its presence reads as a spam signal, on the reasoning that only sites
> still following obsolete SEO advice populate it.
>
> It was never a decision anyone made about this site. It arrived with the
> TanStack-Start to Astro port and was then copied into the regional template in
> v1.B, which is how one page's boilerplate became 104. The cost of leaving it is
> not lost rankings — it is that the tag broadcasts our target terms to anyone
> reading source, drifts out of sync with page content forever because nothing
> reads it, and reads as 2005-era SEO on a site whose entire pitch is being the
> accurate, well-built one.
>
> Removal is zero-risk: nothing consumes it, so nothing can break. Filed as
> PLANNED rather than done because it touches every live event page and that is a
> site-wide call, not a drive-by during a single-page rewrite. Found 2026-08-22
> while writing the Bonny Doon page against the `write-lamill-seo-page` skill,
> which names meta-keywords as a templated-page marker to audit for.

## 2026-08-24 — v1.Y: Bonny Doon rewritten from the organiser, and the first paid Offer

> 212 words to 1,172, every fact from bonnydoonartandwinefestival.com rather than
> the santacruz.org listing this row was imported from. `hideSources` is set, per
> the v1.G precedent.
>
> Three things the old page got wrong or never had. The venue was never recorded
> at all: it is Crest Ranch, 12200 Empire Grade, up in the hills north-west of
> Santa Cruz rather than in Bonny Doon village, and the organiser publishes that
> address on their own contact page — which is what clears the v1.G bar for
> emitting `streetAddress` and `postalCode`, sourced rather than derived from a
> venue name. It is 21-and-over, and the page gave no hint of that, which is the
> single most decision-changing fact on it. And the organiser now calls it the
> Art, Wine & Brew Festival — the slug, H1 and title are deliberately unmoved,
> since `lamill project seo` shows this URL submitted_indexed and crawled within
> a day, so the body explains the naming instead, which picks up the "brew" query
> without moving anything.
>
> First sourced paid admission. `admission` grows from `"free"` to `"free" | {
> kind: "ticketed"; from; currency }` and `buildRegionalOffer` emits a real
> Offer. `from` is 35, not 65: the non-alcoholic ticket is the cheapest that
> actually gets a person through the gate, and Google reads price as the amount
> payable, so the floor is the only figure that cannot mislead. Tiers above it
> are explained in visible copy where they can carry their conditions.
>
> `pacificOffset()` finally emits. Wired in since v1.B and silent for four months
> because no regional row had a sourced time; Bonny Doon is the first.
> `startDate` is now `2026-09-19T14:00:00-07:00`, gated behind `timesConfidence
> === "official"` by a new `officialTime()` helper, so an unconfirmed hour still
> cannot reach structured data. The times are carried in explicit
> `startTime`/`endTime` fields rather than parsed back out of the display string
> "2:00pm – 7:00pm" — that kind of parsing fails silently on the one row somebody
> types differently.
>
> Two existing tests encoded "endDate only for multi-day runs". A single-day
> event whose organiser publishes a 7pm finish has a real `endDate`, so both were
> updated to assert the rule that actually matters — `endDate` never precedes
> `startDate` and never appears out of nowhere — and a guard was added that
> unconfirmed hours stay out of the Event node.
>
> One honest gap left visible: the organiser's participating wineries, breweries
> and cideries page exists and is empty, so the page says so and says to check
> nearer the date. Also fills this row's `official_website` in the CSV source of
> record. 241 tests pass.

## 2026-09-11 — v2.F: Monterey Jazz Festival logistics depth, Jazz Bash page, feature pin

> MJF69 was 14 days out and the homepage did not link to it at all: it ranked 9th
> in "Next on the Central Coast", outside that module's `slice(0, 4)`.
>
> Enriched `/event/monterey-jazz-festival/` in place rather than building a
> second page. The brief asked for a fresh `/monterey-jazz-festival`, but that
> slug was already live, indexed and carrying the v1.U enrichment — a second page
> would be duplicate content competing with itself two weeks before the event,
> which is the call already recorded for the seven overlapping Car Week rows in
> v1.B. Nine logistics sections in a fixed order; "Who is playing" kept and moved
> after them.
>
> Added `/jazz-bash-monterey/` as a standalone page, not a data row —
> `events2026.test.js` asserts exactly 61 rows all present in the CSV, so a 62nd
> fails the build. Pinned MJF into the existing module rather than adding a
> component: a full-width lead card on the homepage and a callout on
> `/events/september/` only, both self-retiring on two independent conditions
> (`FEATURED_UNTIL` passing, or the event going past), so no cleanup commit is
> owed. Not done: the `/events/monterey/` city hub the brief also asked for —
> rejected in v1.B, reaffirmed 2026-08-21, since Google has not re-crawled any
> `/event/` page since 4 August.
>
> The first commit shipped on a branch with 15 open `[VERIFY]` blocks and an
> explicit DO NOT PUSH. `[VERIFY]` is otherwise banned here (v1.D, reaffirmed
> v1.G); permitted this once because the gate moved to the push rather than to
> the robots meta, so no marker reached the live site.
>
> All 11 MJF blocks were then resolved against the festival's own FAQ, Attendee
> Info, Festival Map, Schedule and the 10 April package-ticket press release. Two
> of them correct claims that were wrong on the live site: gate times ARE now
> published — 3pm Friday, 11am Saturday and Sunday, last sets 9pm all three days,
> where the live FAQ still answered "Not announced" quoting an "early spring
> 2026" promise the festival has since kept; and the street number is 2000
> Fairground Road, not 2004, confirmed by the festival's own box-office address.
> Newly sourced: box office hours for all five days, electronic ticket release
> dates, MPC park-and-ride mechanics (online until 24 Sept, then Lot A shuttle
> tent; advance pass exchanged for a hand stamp, and the stamp boards the
> shuttle), MST shuttle ~every 15 min, full-weekend package prices ($230 Grounds,
> from $325 Arena lawn, from $465 sectional/side bleacher, $395 Premier Club
> add-on sold out), Arena as 5,400 assigned seats at the east end, one sealed
> water bottle and picnic blankets permitted, a cashless site with ATMs and cash
> only at crafts vendors and program sales, and set times. Three genuine absences
> stated as findings: no numbered Arena seating chart, no rideshare or drop-off
> point, and no room block, group rate or festival hotel rate for 2026. The
> $98–$500 range on third-party calendars matches none of the festival's own
> tiers, which run $65 to $465+, and the discrepancy is named on the page.
> `hideSources` set on the v1.G / v1.Y precedent.
>
> The Jazz Bash page's four blocks were then resolved from
> jazzbashmonterey.com. Dates confirmed 5–7 March 2027 from the organiser's
> homepage, matching the Fri–Sun weekday check, so `EVENT_DATES` is set and the
> Event JSON-LD renders — the brief's "March 6–8" was the 2026 edition, and 6
> March 2027 is a Saturday, which would make it Sat–Mon rather than the Fri–Sun
> this festival runs. JSON-LD location is the Portola Hotel & Spa, 2 Portola
> Plaza, the only venue the organiser publishes an address for; the Conference
> Center is named in the copy but gets no address, because inventing one would
> put a guess into map results. Found a room block the brief did not anticipate:
> $252 single/double at the Portola, held until Tuesday 2 February 2027, booked
> by phone quoting "Dixieland Jazz Bash Monterey 2027" — the festival's older
> name, which is not what its website is called and is the kind of detail that
> silently costs someone the rate. Three absences stated as findings: 2027 badge
> prices, garage rates and validation, and the 2027 band schedule.
>
> Builds clean, 256/256 tests pass, zero markers left in `src/`.

## 2026-09-11 — v2.G: per-page Open Graph cards

> Every non-Car-Week page served `og-carweek.jpg`: a Car Week photograph on the
> homepage, the `/events/` index and all five month hubs, misdescribing the page
> in every share and every Slack unfurl.
>
> 61 cards are generated by `scripts/gen-og.mjs` from `src/data/events-2026.ts`,
> so a card's name and dates come from the same source of record as the page it
> belongs to — one per regional event with its own page, one per month hub, one
> for `/events/`, one neutral card for the homepage. Car Week keeps its
> photograph on `/monterey-car-week/*`, `/free/` and the 50 Car Week event pages,
> where it is accurate.
>
> Rendered by a script and COMMITTED rather than generated during `astro build`.
> @resvg/resvg-js is a native module and that build also runs on Cloudflare Pages
> — if its prebuilt binary ever failed to install there, the whole DEPLOY would
> fail rather than just the images. It lives in devDependencies, never runs on
> CF, and adds nothing to the production build. The cost of that choice is drift,
> so `make og-check` fails when a committed card no longer matches the data; run
> `make og` in any commit that changes a name or a date.
>
> Fonts are vendored into `scripts/fonts/` and this is not optional. The sites1
> container has no system fonts at all — `fc-list` returns nothing — and resvg
> does not error on a missing family: it renders the text as nothing and returns
> a perfectly valid PNG. A silently blank card is exactly the kind of failure
> that reaches production unnoticed. `loadSystemFonts` is false and the two OFL
> faces ship with the repo, which also makes the render byte-identical anywhere.
>
> Size, measured rather than estimated: 2.34 MB for 61 cards, 39 KB average. An
> earlier estimate of 790 KB given in the same session was wrong — it was
> measured against the textless `og-default.svg`, and antialiased text roughly
> triples the PNG. Cards are 1200x630, so the `og:image:width` and
> `og:image:height` declarations moved from 1920x1088 to match.
>
> Not done: real event photography. Neither dataset has an image field, so "the
> event's own image if one exists" has no data behind it today. Sourcing ~104
> licensed photos is a content project, not a template change.

## 2026-09-11 — v2.H: reframe /monterey-car-week/ to 2027 without disturbing what ranks

> The site's highest-value URL, entirely 2026-framed in the present tense a month
> after the event ended. Incremental, not a rebuild: URL, canonical and all 91
> listings unchanged and in place, 222 insertions against 12 deletions, and every
> one of those deletions an intentional replacement — title, description, hero
> dateline, H1 year, stat labels, the JSON-LD line. The new 2027 sections sit
> above the marquee cards; the day grid, free-events block and traffic block are
> untouched.
>
> The title carries BOTH years. "Monterey Car Week" stays leading and in order
> because that is the ranking phrase, and 2026 is kept because this URL still
> earns impressions on it — dropping that token to make room for 2027 would trade
> a ranking we hold for one we do not yet have.
>
> Baseline recorded before any change, from GSC over 28 days, so the rollback
> trigger has something real to measure against: "monterey car week" 26.9 / 173
> impressions, "monterey car week 2026 schedule" 14.7 / 15, "monterey car week
> 2026 dates" 18.4 / 22, "monterey car week 2026" 30.9 / 23, "jaguar monterey car
> week" 26.2 / 48 — all on `/monterey-car-week/`. Two premises in the brief did
> not survive checking, recorded so they are not re-litigated: position on
> "monterey car week 2026" is 30.9, not 16 — the ~16 belongs to "monterey car
> week 2026 schedule", also on this URL — and the page carried no "kept for
> reference" framing anywhere. The diagnosis was right regardless.
>
> The first commit shipped with 7 open `[VERIFY]` blocks and DO NOT PUSH. All
> seven were then resolved from pebblebeachconcours.net. Seven 2027 dates are
> confirmed and published, every one from the Concours' own event calendar with
> each weekday cross-checked against its date: Motoring Classic 2–11 Aug,
> Auctions 11–14, Tour d'Elegance 12, Concours Village 12–15, Classic Car Forum
> 12–14, RetroAuto 12–15, and the 76th Concours on Sunday 15 August. The 2027
> classes are named too — the Delage GP centennial, Prewar Open-Front Town Cars,
> Delahayes, and forty years of the F40.
>
> `WEEK_2027` stays null, deliberately, and that is the main judgement call.
> Seven dates being known is not the same as the week having a published span:
> Pebble Beach lists its events individually and states no opening or closing
> day, and the events outside their programme have announced nothing. A window
> covering only the Pebble Beach cluster would understate Car Week; one derived
> from 2026 would be invented. So the hero leads on Concours Sunday, which is
> published, the page says plainly that no overall window exists, and no 2027
> Event node is emitted — schema.org requires a `startDate` and an inferred one
> is worse than none. The 2026 Event JSON-LD is untouched; the 2027 node is added
> beside it as an array once the window is sourced.
>
> Third-party calendars are already quoting a Quail 2027 date. It is not
> published by The Peninsula, so it is not on this page — the See Monterey PDF
> precedent recorded in `docs/CLAUDE.md` is exactly this failure, twice.
>
> Tickets: "Tickets to the 2027 Pebble Beach Concours d'Elegance will become
> available in late 2026", seven admission types listed, no prices against any of
> them. Lodging: no room block, group rate or package exists for 2027 from
> anyone, which is the useful answer rather than a missing one. 2026 outcomes are
> carried inline as specified rather than given a section: 218 cars, 185 from 30
> US states and 33 from 14 other countries; Best of Show a 1935 Duesenberg SSJ
> Special Speedster shown by Harry Yeaggy; over $4.3m raised, past $50.1m
> cumulative; Gooding Christie's over $159m at 94% sell-through; a 1964 Shelby
> Cobra Daytona Coupe at nearly $43m, the most valuable American car ever sold at
> auction. Total attendance is not published by anyone and the page says so.
>
> 260/260 tests pass.

## 2026-10-03 — v2.I: /monterey-farmers-market/, the site's first recurring-schedule page

> Built one page for "monterey farmers market" (500/mo): a build-time "open
> today" line, Mon–Sun table, a section per market, FAQ + FAQPage, one Event per
> market with `eventSchedule`. Three City of Monterey markets, each from its
> operator's own site: Old Monterey on Alvarado (Tue, 4–7pm Oct–Apr / 4–8pm
> May–Sep), Monterey Farmers Market at Del Monte Center (Fri 8am–noon, year round)
> and the Del Monte Sunday market (May–Sep, ended 27 Sep). Secondary listings
> still put the Friday market at MPC 10am–2pm; it moved to Del Monte in 2020.
> Build output diffed against a pre-change baseline — every other page differed
> by the new footer link alone.
>
> Shipped without the `write-lamill-seo-page` skill; the operator asked whether
> it had been used and whether the page was thick. The audit afterwards found no
> worked examples, thin substance and a truncated meta description, and doubled
> the page (vendor lists, visit cases incl. the Oct–Apr weekend failure case).
> Recorded as a memory: load the skill for every new page, even with a full brief.
>
> The IndexNow ping went to 63 URLs, not the one asked for — the ledger-gated
> deploy step pings every sitemap URL the ledger has not seen. Harmless, but not
> what was asked; later pings named their URLs explicitly.

## 2026-10-03 — v2.J: /monterey-farmers-market/ widened to Monterey County

> Brief asked for two county pages; widening the live page was a scope change,
> so the operator chose the slots (v2.J + v2.K) and the retitle: title to
> "Monterey County Farmers Markets: Schedule by Day (2026)" while the page was
> hours old and unindexed, H1 and URL kept. 14 markets verified on operator pages
> by a research agent per county; 6 skipped with reasons shown on-page.
>
> The model grew `seasonDates` (exact first/last day), `seasonLabel` (operator
> states no season — never rendered as "year round") and `hoursCaveat` (Pacific
> Grove's undefined winter months; drops `endTime` from JSON-LD). A shared
> `FarmersMarketPage.astro` serves both counties; the canonical stays in each page
> file because seo.test.js and CHECK_161 read page source. The shared template
> renamed the stylesheet chunk (byte-identical CSS), so every page's HTML differs
> by one href — reported rather than reverted.
>
> Correction to v2.I found during research: MBCFM publishes two Friday EBT
> windows (9–11am on its homepage, 8–11am on its services page). Both are now
> stated, with "come between 9 and 11".

## 2026-10-03 — v2.K: /santa-cruz-farmers-market/

> Six markets: SCCFM's Downtown, Westside, Live Oak, Scotts Valley and Felton,
> plus MBCFM's Aptos. SCCFM's home page calls Felton and Scotts Valley
> year-round; their market pages give exact seasons and won. Skipped Watsonville
> (no operator site, City pages disagree on hours), El Mercado Popular (venue
> listing only) and Capitola (nothing running).

## 2026-10-04 — v2.J + v2.K: audit and thicken both farmers-market pages

> Operator asked whether the pages were thick; honest answer was Monterey partly,
> Santa Cruz no, and the skill audit had not been run. Audit found the same EBT
> sentence 5–6× per page and Parking/Paying/Season headings up to 14×. Payment
> rules now written once per operator; per-market facts as one list;
> operator-sourced "what it's like" for the 17 markets that lacked it; vendor
> lists for Carmel Barnyard, Aptos and the SCCFM markets (directory flagged as
> undated); MST routes for the six Everyone's Harvest markets; a Santa Cruz
> "where other listings go wrong" block (Downtown is 12:30–5pm, not 1–5pm). The
> Downtown $20 Market Match line was removed because the operator's own pages
> disagree on when it ended. Monterey ~4,100 → ~4,900 words, Santa Cruz ~1,800 →
> ~3,700. No other build output changed.

## 2026-10-05 — v2.L–N: Laguna Seca map, Car Week map, Monterey events calendar

> Operator brief: an image-SEO sprint for three queries, with original
> visuals, not thin landing pages. Not in the PRD, so placed first: operator
> chose v2.L/M/N, flat URLs as briefed, and a separate calendar page over
> upgrading /events/. Mid-build: "make those pages more thick, useful and
> internally linked."
>
> No geography invented: OSM extracts committed under data/geo/ (ODbL); the
> raceway's own facility map used only to check turn numbers and bridge names,
> never traced. OSM lap 2.237 mi vs published 2.238. Own copy fact-checked
> before build — dropped an unsourced "heaviest braking zone", a wrong "Turn 2
> is closest to parking" (map distances say Turn 11), a wrong "German shows in
> Seaside", and a Laguna→Quail route that ignored Laureles Grade.

