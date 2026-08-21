---
project: montereybayevents.com
prd_version: 1
project_version: v1.T
status: deployed and serving; GSC verified and sitemap submitted
owner: Vijo
last_updated: 2026-08-21
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
| v3 | analytics — the live site's behaviour is observable | every page reports to GA4; sessions, entry pages and outbound organizer-link clicks are queryable, so the `docs/growth.md` experiments can be reviewed against behaviour and not only GSC impressions |

## 5. Phases

| Phase | Theme | Features | Status |
|---|---|---|---|
| **v0.A** | scaffolded | `portfolio new bootstrap` ran; standard files written; git initialized | ✅ |
| **v0.B** | Astro port | TanStack Start → Astro; 50 `/event/` pages, schedule, traffic (see `src/lib/server-todo.md` for what was dropped) | ✅ |
| **v1.A** | section split + free-intent page + valid Event schema | `Event` JSON-LD fixed on all 50 `/event/` pages (`startDate`, `endDate`, `offers`, `organizer`, `PostalAddress`); new `/free/` page with `ItemList`; Car Week hub moved to `/monterey-car-week/` with a 301 from `/schedule/`; homepage rebuilt as a regional index; footer email capture site-wide | ✅ shipped — live |
| **v1.B** | non-Car-Week event data | 61 Aug–Dec 2026 Central Coast events imported from `data/monterey_santacruz_events_aug_dec_2026.csv` into `src/data/events-2026.ts`; `/events/` index (county + month filters); `/events/<month>/` hubs for August–December; 54 new `/event/` pages with `Event` JSON-LD; homepage "coverage in progress" replaced with real dated listings | ✅ shipped — live |
| **v1.C** *(renumbered 2026-08-07; was v1.B.1)* | follow-up polish after v1.B shipped | (1) **own brand favicon** — replaced Lovable's generic blue `M` with a brass-on-warm-dark calendar mark drawn from `src/styles/global.css` tokens; `public/favicon.svg` rewritten, `public/favicon.ico` rebuilt as a 16/32/48 multi-resolution icon. (2) **admission data for the regional set** — the CSV carries no free-or-ticketed status, so regional listings show category and date but no admission badge and emit no `offers`; the site's free-intent angle currently covers only Car Week | in progress — favicon done, admission data pending |
| **v1.D** | Car Week logistics depth + admission audit | (1) **`/traffic/` rebuilt** from `src/data/traffic.ts` — closures by day, Highway 1/68/218/101 routing, parking for Pebble Beach, Laguna Seca, Ocean Ave, Lighthouse Ave and Asilomar, shuttles, arrival times; every fact carries `confidence: "official" \| "derived" \| "unpublished"` plus a source link — 36 official, 4 inferred from published event times, 6 confirmed as published by nobody. (2) **`/free/` rebuilt** with per-listing times, location, what-you'll-see and an explicit confirmed/unconfirmed split. (3) **Admission audit against organizer pages** removed 2 listings that are not free and corrected a third; 2 wrong venues fixed; 14 organizer-published clock times sourced, the first real `startDate` times in the dataset. (4) **`location` never optional again** — breakfast-club fix + build-failing guard. (5) `/traffic/` + `/free/` contextually linked from all 104 event pages and both Car Week hubs | ✅ shipped — live *(deploy confirmed 2026-08-17; this row read "not yet deployed" until then)*. No `[VERIFY]` markers: every claim is a positive statement about the public record, and where a price is genuinely unpublished the page says so and links whoever sets it |
| **v1.E** | Timber Fire incident banner + Tour d'Elegance route correction | (1) **`Incident` block + `FireAlert.astro`** — `variant="full"` on `/traffic/`, `variant="compact"` elsewhere; road closure, evacuation order/warning zones, closures, evacuation point, detour, each volatile figure carrying an explicit "as of" and a CAL FIRE link. Deliberately not a live feed. (2) Renders on Car Week pages plus **Monterey County** regional events only — 73 of 104 event pages; a wildfire banner on a December Santa Cruz parade is noise, and noise is how readers learn to ignore the banner where it matters. (3) **Tour d'Elegance description corrected** — the 11–12 August reroute meant "along a scenic route on Highway One" had stopped being true | ✅ shipped — live |
| **v1.F** | Timber Fire banner refreshed to day-10 figures | Staleness, not expiry: on day 10 the fire was **5,153 acres / 17% contained**, up from the 4,000-acre / 7% reading carried since 13 August, with Highway 1 still shut MM 45.1–37 and all five evacuation orders and five warnings still in force — so `active` stays true. (1) Figures, `asOf`, `roadClosure` refreshed; **start date corrected to Saturday 8 August** (CAL FIRE's own incident path, Local News Matters and the day-count all agree; "Sunday, 9 August" was a day late). (2) `eventImpact` was **entirely expired** — all four entries were Car Week, which concluded on the 16th — replaced with what is true now, including the one dataset listing the fire touches: Big Sur Food & Wine (5–7 Nov) has paused ticket sales, quoted in the organisers' own words. (3) Car Week framing degeneralised: `detour` no longer addresses Car Week visitors, panel heading is now "Effect on listed events", and the Highway 1 row in `closures[]` had `dates` ending 2026-08-16 and would have gone stale — it now states that the closure outlasts the listed dates and points at QuickMap | ✅ shipped — live (deploy confirmed 2026-08-17) |
| **v1.G** | Turkish festival factual fixes + Place schema + neutral OG card | (1) `/event/california-turkish-arts-culture-festival/` was **one day, no venue, no address, no hours** — now 29–30 August at Custom House Plaza, 20 Custom House Plaza, Monterey CA 93940, doors 11–7 Sat and 11–6 Sun. Slug unchanged. (2) **`Event.location` is a real `Place`** with a full `PostalAddress`; `streetAddress` / `postalCode` emit only where a sourced address exists, never derived from a venue name. (3) **Hours use the v1.D vocabulary, not `[VERIFY]`** — `timesConfidence: "unconfirmed"`, visible to the reader with a plain statement that the organiser has not published them, and deliberately kept out of the JSON-LD while the dates are not. (4) Title drops the year, H1 and dateline keep it; scoped via named optional fields (`seoTitle`, `headline`, `hideSources`) rather than a slug hardcoded into the shared component — the other 53 regional pages are unchanged. (5) **`public/og-default.jpg`** — a neutral brand card drawn from the site's own oklch tokens, replacing the Car Week photograph on all 54 regional event pages (`/events/`, the month hubs and the five genuine Car Week pages still use `og-carweek.jpg`) | ✅ shipped — live (deploy confirmed 2026-08-17) |
| **v1.H** | Timber Fire banner: expired evacuation line replaced with the real shelter | The evacuation-point line went stale overnight on the live site, exactly where v1.F predicted it would — it advertised the Carmel Valley Library Temporary Evacuation Point as open "14–17 August" on 73 event pages plus `/traffic/`, a window that had closed. (1) **Replaced with the facility that was open the whole time and that we never carried** — the overnight shelter at Carmel Middle School, 4380 Carmel Valley Road, open since 10 August (KAZU, already in the incident's sources); the library TEP's lapsed window is now stated as a fact rather than left as a dead date. (2) **`asOf` distinguishes "we have not looked" from "nobody has published"** — no source carries a reading newer than Monday's 5,153 acres / 17%, so the figures are unchanged and the field says why, rather than restamping yesterday's numbers with today's date. BigSurKate 403s today though it answered yesterday; CAL FIRE still 403s; KAZU shows Saturday's figures. (3) **Mile-marker disagreement surfaced** — BigSurKate says MM 37, KAZU and others MM 31 at the Julia Pfeiffer Burns vista point; we had been publishing MM 37 as `official` when the record is not that clean, so the text names both and sends readers to QuickMap for the live boundary. (4) Highway 1 row in `closures[]` extended to 18 August. The fire is not out and no zone has been lifted, so `active` stays true | ✅ shipped — live (deploy confirmed 2026-08-18) |
| **v1.I** | West End Celebration: a researched page instead of a stub | `/event/sand-city-west-end-celebration/` went from 598 words of template around a one-line description to 1,733 sourced from the organiser. It exists because the SERP is wrong two specific ways, which is its opening section rather than a footnote: aggregators still carry the **2025 dates (23–24 August)** when 2026 is **22–23 August**, and the most findable page describing MST's free shuttle — route, pickups, timetable — is an announcement **from 2010**. The organiser confirms a free shuttle for 2026 but publishes no route, so the page says that and points at mst.org. (1) Six sections and six FAQ entries covering what it is (six blocks closed to cars, three stages, 150+ vendors, 20+ years, By The Glass Design), parking / shuttle / free bike valet, cost inside, and the rules that catch people out. (2) **"What has not been published" is a deliberate section** — opening times, 2026 shuttle route, lineup, ATMs and accessibility are genuinely unpublished, and the organiser's FAQ says only that times "will be announced soon", so the page carries no hours rather than repeating last year's. (3) **Reusable mechanism, not a one-off** — `intro` / `sections` / `faq` / `metaDescription` on `RegionalEvent`, absent by default; `buildFaqJsonLd` emits `FAQPage` from the same array the template renders so visible text and markup cannot drift; `hideSources` because the reference URLs record where the *listing* came from at import, not where the content came from. (4) `officialWebsite` added and synced to the CSV — the drift test caught the mismatch and failed the build as designed. **Not** added: an `offers` node, though the organiser states there is no admission fee — that is the first sourced admission data on any regional listing and belongs to the v1.C decision | ✅ shipped — built and tested locally, not yet deployed |
| **v1.J** | Christmas in the Adobes date fix + first organiser-confirmed hours | Checked the four date conflicts the 2026 poster surfaced against the **organisers** rather than against each other. Three resolved in the site's favour; one was ours. (1) **Christmas in the Adobes ran here as a single evening, 11 December** — the Monterey State Historic Park Association publishes "December 11 & 12", two evenings, 5:00–9:00 PM. Corrected in the dataset and the CSV; the page now emits `endDate` as well as `startDate`. (2) **First `timesConfidence: "official"` on the site** — every prior set was `unconfirmed`, sourced from a listing rather than from whoever runs the event, so this is the first page that says "hours as published by the organiser" and means it. Times stay display-only and out of the Event JSON-LD regardless; the v1.G rule does not relax just because the source is good. (3) **Monterey Bay Half Marathon confirmed as 8 November** — race weekend spans 7–8 November because of the Pacific Grove Lighthouse 5K and expo, which is what the conflicting source described. Noted for the day a start time is published: the organiser writes "7:00 AM PDT" but Pacific daylight time ends 1 November 2026, so race day is PST — `pacificOffset()` already returns `-08:00` and would quietly be right. (4) **Monterey Bay Greek Festival** name confirmed, per Saint John the Baptist Greek Orthodox Church who run it. Its date stays **unset**: the organiser says it runs "every Labor Day weekend, Saturday to Monday", which would compute to 5–7 September 2026, but that is an inference from a recurring rule rather than a published date and `events-2026.ts` opens with DATES ARE NEVER SYNTHESISED | ✅ shipped — live (deploy confirmed 2026-08-18) |
| **v1.K** | Turkish festival page thickened, hours confirmed at the organiser | `/event/california-turkish-arts-culture-festival/` went from 745 words to 1,619, researched at the Turkish American Association of California (CalTurks) rather than at the listing it was imported from. (1) **Hours are now `official`** — TAAC publishes 11:00 a.m.–7:00 p.m. **both** days, so v1.G's `unconfirmed` Sunday 11–6 (which came from a secondary listing) is replaced. Several local listings still show Sunday closing at 6, so the page publishes the organiser's hours *and* tells anyone arriving late on Sunday to treat 6:00 p.m. as the safe assumption. (2) **`officialWebsite` found and added** — turkfestca.org; the row previously had none. Synced to the CSV. (3) Content: 26th year, presented by a 501(c)(3) founded 1975; Whirling Dervishes and the sema, Horon/Dirmil/Silifke folk dances, Group Taksim Big Band, ebru water-marbling and carpet-weaving demonstrations, the full Turkish menu, and children's activities. Six FAQ entries with `FAQPage` markup built from the same array the template renders. (4) **Name left as-is by operator decision.** The organisers call it the *Monterey* Turkish Arts & Culture Festival; our name came from a third-party listing. Correcting it broke the slug test (name/slug mismatch) and the choice was slug-stability over name-accuracy, so `name` stays and the page instead *explains* all three circulating names — which also catches searchers using any of them. **Revisit if the slug is ever changed:** the URL, the name and the organiser would then all agree | ✅ shipped — built and tested locally, not yet deployed |
| **v1.L** | first sourced admission data — `offers` on a regional event | Unblocks the half of **v1.C** that had been pending since 2026-08-07. (1) **`admission` on `RegionalEvent`**, set only where the organiser states it in their own words. West End Celebration is the first and only: their FAQ says "there is no admission fee." The union has exactly one member, `"free"`, because that is the only value anyone has checked. (2) **`buildRegionalOffer`** mirrors `eventSchema.ts`'s `buildOffer` so both datasets publish the same shape — price 0 / USD / InStock, with `offers.url` always present because Google treats it as required. (3) **Visible free badge**, because a price on the page and a price in the markup are one claim and not two. (4) **The guard moved rather than went away** — the schema test asserted "never publishes a price", which was right while no row had data; it now asserts an Offer appears *if and only if* `admission` is set, which is the rule that test was really protecting. 53 of 54 regional rows still publish no price at all. Remaining v1.C work is the other 53, one checked organiser at a time | ✅ shipped — built and tested locally, not yet deployed |
| **v1.M** | Greek festival: publish the recurring rule, still publish no date | `/event/monterey-bay-greek-festival/` is one of the three rows with no announced date, so it rendered "Date not yet announced" and nothing else. It now carries what the organisers *do* publish: Saint John the Baptist Greek Orthodox Church of Monterey County holds it **every Labor Day weekend, Saturday to Monday**, at Custom House Plaza. 590 → 1,036 words. (1) **The data did not move.** `dateText` stays empty, the page still shows "Date not yet announced", and it still emits **no `Event` JSON-LD** — there is no start date to put in one. (2) **The arithmetic is labelled as arithmetic.** Labor Day 2026 is Monday 7 September, so the pattern computes to 5–7 September; the page says so *and* says that is a computation on a recurring rule rather than an announced date, because a computed date becomes indistinguishable from a confirmed one once it has been copied into a few calendars. Reader advice is "hold the weekend, confirm before booking". (3) `FAQPage` markup on three visible questions; no `Event` node. **Not** set: `admission`. Several sources say free, but the organiser's own site 403s and `admission` is documented as settable only from the organiser's own words — so no `Offer` and no free badge | ✅ shipped — built and tested locally, not yet deployed |
| **v1.N** | Timber Fire banner: evacuation orders corrected, closure shrinking | The banner had gone materially wrong rather than merely stale. It listed **five** zones under evacuation order when only **two** remained: MRY-F023, F025 and F026 were downgraded to warnings on Tuesday 18 August, and F027-A with them. Publishing an order that has been lifted over-states the restriction on 73 pages — the same trust failure the block's own comment warns about, pointing the other way. (1) Orders now `MRY-F027, MRY-F028-A`; warnings grown from five zones to eight. (2) Figures to **5,526 acres / 24% contained** as of Wednesday 19 August, up from 5,153 / 17% — the containment field names the previous figure so the direction of travel is visible. (3) **The closure is shrinking, not holding** — the northern limit moved half a mile south to mile marker 44.5 (below Post Ranch Inn and Alila Ventana) on the 18th, and crews are clearing debris from firing operations along Highway 1 specifically to reopen it. Still no reopening date. (4) The mile-marker disagreement noted in v1.H is **resolved and the caveat removed** — sources now agree on MM 37 at the south end. (5) `closures[]` row extended to 20 August with its `segment` and `when` corrected. Also worth recording: the Big Sur Chamber page, stuck since 10 August saying "Highway One is currently open" nine days into a closure, is live again and now matches. `active` stays true | ✅ shipped — built and tested locally, not yet deployed |
| **v1.O** | Jazz Festival and Salinas Airshow researched from their organisers | The two biggest September listings, both thin. Jazz 1,673 words, Airshow 1,517 — everything sourced from montereyjazz.org and salinasairshow.com. (1) **Titles, H1s and slugs untouched.** Both pages are live and indexed, so no `seoTitle` or `headline` was set; only body, `metaDescription`, `times` and structured data changed. This is now the standing rule for any live page. (2) **Jazz ticket tiers, with the trap named** — Arena $110 Fri / $215 Sat–Sun, Arena Lawn $75 / $135, Grounds $65 / $90, quoted from the organisers' own press release rather than a listing. A Grounds ticket does **not** admit to the Arena, where the Hancock–Carter duo and the JLCO play; that is the mistake the page exists to prevent. Fairgrounds parking is sold out for 2026. (3) **Airshow bag policy leads**, because it is federal rather than the organisers' preference: no coolers of any kind, one clear bag 12x6x12, and standard purses banned — the detail that surprises people. Gates 9:00 a.m., flying from ~11:30, parking $30. (4) **Second `timesConfidence: "official"`** — the airshow publishes its own gate times. Jazz gets none: its FAQ still says gate times will be announced "in early spring 2026", a sentence that has outlived the spring it refers to, so the page says so rather than guessing. **Not** done: `admission`. Both are ticketed and the union has only `"free"`; publishing real prices as an `Offer`/`AggregateOffer` is a schema design decision, not a drive-by. Prices appear in prose, where they are most useful | ✅ shipped — built and tested locally, not yet deployed |
| **v1.P** | past-event pages stop talking about the future | 58 of 104 event pages had already happened and still told readers to "check the official page before you travel", and all 54 regional pages said "Monterey Car Week **runs** August 7–16" in the present tense five days after it ended. (1) **`src/lib/isPast.ts`** — one helper, `end ?? start` compared date-only in `America/Los_Angeles` (a build running after 5pm Pacific is already tomorrow in UTC and would age every page a day early). An event is past only once its **last** day is behind us, so multi-day runs read as current throughout and an event happening today is never past. Undated events are never past. (2) Both templates branch their When-section copy and the regional footer promo carries both tenses. (3) **Build-time, not view-time, and the helper says so in its own docstring.** Good enough for switching tense — being wrong reads as stale rather than as a false claim — but explicitly *not* sufficient for filtering listings, where a frozen "today" would show the wrong set while looking maintained. Verified: 58 past pages, 0 carrying forward-looking copy; 46 upcoming/undated keep theirs | ✅ shipped — built and tested locally, not yet deployed |
| **v1.Q** | date-aware listings — hide, mark, or roll forward | **Planned, and gated on a scheduled rebuild.** Today a visitor lands on a homepage whose first four listings are all in the past, `/events/august/` shows 11 of 13 past events as though upcoming, and `/free/` is *entirely* past because every listing on it is Car Week. Intended shape, one `isPast()` with three different consumers: **homepage hides** past events (it is a decision surface — nobody arrives at "what's on" wanting to know what they missed); **month hubs show them marked `Past`** and sorted below upcoming ones (the hub's job is "everything in August", and the annual-reuse strategy depends on those pages keeping their value); **event pages keep everything and only change tense** — done in v1.P — because that is where the search value lives. **Blocker:** the site is prerendered static, so "today" freezes at deploy time. Filtering on a frozen date is worse than not filtering, because it looks maintained while showing the wrong set. Needs a **scheduled daily rebuild** (cron → push → CF build) first, which would also bound how stale the fire banner's `asOf` can get. Two sub-problems to solve with it: `/free/` would render empty under a hide rule and needs its own handling until v1.C gives the regional set admission data; and `currentAndNextMonth` must roll forward when the current month is wholly past, or September vanishes from the homepage the day October starts | planned |
| **v1.R** | airshow FAQ answers the actual People-Also-Ask box | An Ahrefs SERP overview for "salinas airshow" (16 Aug 2026, volume 500) showed a **People also ask** block sitting at position 2 — above every result except the organiser. Its four questions are now answered verbatim in the page's FAQ, which renders visibly and feeds `FAQPage` markup from the same array. (1) *What time is the airshow in Salinas?* — gates 9:00 a.m., flying ~11:30, no published close. (2) *Is there an air show in Salinas?* — annual since 1981, 45th edition, 26–27 September. (3) *Will the Blue Angels be at the Salinas airshow?* — **no**; the organisers announce the USAF Thunderbirds for 2026 and several third-party listings still show Blue Angels for these exact dates, which is the confusion driving the question into the PAA box in the first place. (4) *Are any airshows cancelled in 2026?* — kept verbatim, answered honestly within scope: not this one, plus the distinction that matters (performers get withdrawn and weather closes acts; that is not the show being cancelled), and an explicit "we only speak for Salinas". Redundant "When is the Salinas airshow in 2026?" removed rather than left as filler; 9 questions, 9 `Question` nodes. 1,499 → 1,797 words. **What the SERP data actually shows:** the incumbents are thin and weakly linked — the organiser ranks #1 on **DR 36 with 421 words**, then EventSprout (274 words), salinas.gov (571 words, **0 backlinks**), See Monterey (990 words, **2 backlinks**). The high-DR entries are profile pages: Instagram DR 100 pulls 38 visits, Yelp DR 94 pulls 3. This SERP is defended by entity match and age, **not** by content depth, which makes it winnable over time rather than hopeless | ✅ shipped — built and tested locally, not yet deployed |
| **v1.S** | per-URL `<lastmod>` in the sitemap | The sitemap carried **no `lastmod` at all** on any of its 115 URLs, so nothing told Google that six pages had been substantively rewritten this week. (1) **`updated` on `RegionalEvent`**, set by hand on the commit that changes a row, feeding `<lastmod>` via `@astrojs/sitemap`'s `serialize`. Six URLs now carry a real date; the other 109 carry none. (2) **That asymmetry is deliberate.** Stamping every URL with the build time tells Google nothing and teaches it to ignore the field; deriving from git would be worse still, because all 54 regional rows live in one data file and would share whatever date it last changed. Six honest dates beat 115 synthetic ones. **Correction recorded:** IndexNow was previously described here and in conversation as a way to get Google to re-crawl. It is not — IndexNow feeds Bing, Yandex, Naver, Seznam and Yep; **Google does not participate**. And `portfolio`'s `gsc recrawl` is read-only by design: Google's Indexing API restricts submission to JobPosting and BroadcastEvent, and using it for general pages violates ToS. For Google the levers are this `lastmod`, GSC's manual Request Indexing, internal links and time | ✅ shipped — built and tested locally, not yet deployed |
| **v1.T** | homepage: retire Car Week prominence | **Planned — immediate, and NOT blocked on v1.Q's scheduled rebuild.** Car Week ended 16 August; nothing about this needs a date computation, only a decision. (1) **2 of the 4 "Plan the week" cards are Car Week** ("Full Car Week schedule", "Free Car Week events"), sitting *above* "On now and next" where the real listings are. 11 Car Week mentions on the page, plus a "Peninsula traffic peaks in August" section that has stopped being true. (2) **One of those cards points at `/free/`, which is 100% past events** — every listing on it is Car Week. The most-crawled page on the site is spending prime position linking to a dead page. (3) **Separately, the selection in the homepage's 10 direct `/event/` links is wrong** — several have already happened (Watsonville Strawberry 1–2 Aug, Cabrillo Festival 26 Jul–9 Aug). The *count* is fine; the picking is not. Full fix is v1.Q, but the worst offenders can be dropped now. **Do this for readers, not for crawling.** GSC evidence (2026-08-21) is that homepage-linked event pages and unlinked ones were both last crawled 4 August — being linked from a daily-crawled homepage has not triggered a single recrawl in 17 days. Reshuffling homepage links is a quality fix, and expecting it to move indexing would be reading the evidence backwards | ✅ shipped — built and tested locally, not yet deployed. Car Week mentions 11 → 5; `hero-carweek.jpg` no longer leads the page; the "Featured event" slot now shows the next four things actually happening; past events filtered from the month listings (7 homepage event links, none past); the "Peninsula traffic peaks in August" section retitled and rewritten around the Highway 1 closure. **Both tenses are kept**, gated on `carWeekIsPast`, so this reverses automatically for Car Week 2027 rather than needing a rewrite |
| **v1.U** | enrich the four remaining high-value September pages *(complete)* | **Planned — the immediate queue, in order.** Two of the six "strongest pages" are already done (Salinas Airshow 1,797 words, Monterey Jazz 1,673). These four are still date + venue + a paragraph: **(1) Monterey County Fair** — 588 words, 3–7 Sept, first because it is soonest and a county fair publishes genuinely rich detail (gate hours, tickets, concert lineup, parking, livestock/exhibit schedule). **(2) INDYCAR Grand Prix of Monterey** — 592 words, 4–6 Sept at Laguna Seca, ticket tiers, camping, paddock access. **(3) Festa Italia Monterey** — 575 words, 4–6 Sept, Custom House Plaza. **(4) Castroville Artichoke Festival** — 5 Sept. Same method as v1.I/v1.K/v1.O: research the organiser, lead on whatever the SERP gets wrong, state plainly what is unpublished, FAQ built from the same array as the `FAQPage` markup, and **no `seoTitle`/`headline`/slug changes** since all four are live and indexed. Then **v1.T** (homepage Car Week retirement) | ✅ shipped — built and tested locally, not yet deployed. County Fair 588 → 2,020, INDYCAR 592 → 1,902, Festa Italia 575 → 1,614 (**date corrected by a week**), Artichoke → 1,614 (**venue corrected: Castroville, not the Monterey Fairgrounds**). Two of the four carried a factual error that a reader would have acted on |
| **v2.A** | kickoff / decisions lock | no build. Supply audit of 8–10 real Central Coast organiser accounts (are event details in the *image* or the caption? consistent hashtags? complete date+venue+admission? does the venue already publish ICS/RSS?); Meta App Review go/no-go; whether the pipeline lives here or in `portfolio`; what the operator review surface is | planned |
| **v2.B** | extraction from manual input | operator drops flyer images in a folder → vision extraction to a strict JSON schema with per-field provenance and confidence → dedupe (perceptual hash + normalised-title match against both datasets) → proposals queue → operator approves rows into `data/*.csv` → regenerate `src/data/*.ts`. No network acquisition at all | planned |
| **v2.C** | permissionless pull adapters | ICS / RSS / embedded JSON-LD `Event` pulled from venue and chamber sites into the same dedupe → propose → approve path. Highest supply-to-effort ratio and no ToS exposure | planned |
| **v2.D** | Instagram hashtag adapter | Graph API Hashtag Search as one adapter among several. Gated on Meta app review + business verification, and on v2.A's audit showing the supply is actually there. No scraping under any circumstance | planned — conditional on v2.A |
| **v2.E** | submissions inbox | organisers email flyers to a submissions address; same extraction pipeline on the back end. Inverts acquisition from pull to push and doubles as organiser outreach | planned |
| **v3.A** | kickoff / decisions lock | no build. GA4 chosen 2026-08-09 over self-hosted Umami. Remaining to lock: create the GA4 property and get its measurement ID; whether consent/cookie banner is in scope for an EU-reachable site; which events are custom (outbound organizer-link clicks, month-hub filter use) versus default pageviews | planned |
| **v3.B** | instrument the site | GA4 tag on every page via `BaseLayout.astro` (the head is per-page today, so the tag goes in the shared layout, not 11 copies). Measurement ID injected as `VITE_GA_ID` from the Cloudflare Workers env — already the documented pattern in AI_AGENTS.md § Deployment info — so it is not committed. Clears `CHECK_080` | planned |
| **v3.C** | outbound + intent events | custom GA4 events for organizer-link clicks off `/event/` pages and for `/free/` and month-hub entry, so `docs/growth.md`'s "does `/free/` outperform the schedule page" question is answerable from behaviour rather than inference | planned |

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
- **2026-08-08 — v2.A supply audit, partially answered.** Probed the 19 unique
  `official_website` values in the committed CSV, then 12 candidate aggregator
  hosts. Two clean classes emerged:
  - **Single-festival organiser sites: 0/19** expose iCalendar, an events REST
    API, or `Event` JSON-LD. (7/19 serve a generic WordPress `/feed/`, which is
    a blog feed, not events.) A site for one annual festival has no calendar to
    publish, so this is structural, not neglect. These are the *only* sites the
    CSV records, which is why the gap wasn't visible before.
  - **Aggregator hosts: machine-readable and good.** `santacruz.org` (Visit
    Santa Cruz County, The Events Calendar) serves `/events/?ical=1` →
    **30 VEVENTs**; `watsonville.gov` (CivicPlus) serves its iCalendar module →
    **163 VEVENTs**; `ci.seaside.ca.us` (CivicPlus) serves 1. Both CivicPlus
    hosts also serve RSS (20 and 25 items). `seemonterey.com` runs Simpleview
    but the two guessed REST paths 404'd — unknown, not disproven.
  - **Field coverage on the two live feeds is 6/6 on every event** — `SUMMARY`,
    `DTSTART`, `DTEND`, `LOCATION`, `DESCRIPTION`, `URL`, with `DTSTART`
    carrying `TZID=America/Los_Angeles` and a real clock time.
  - **Consequence for the deferred no-synthesised-times rule:** these feeds
    are a *sourced* time supply. `pacificOffset()` is already wired in and
    emitting nothing; an ICS adapter is the first thing that could legitimately
    make it emit. That is a stronger argument for feeds-first than anything in
    the original v2 sketch.
  - **Content is not uniformly on-target.** `santacruz.org` is (Boardwalk
    Fiesta en la Playa, Ironman 70.3, Antiques Faire, Shakespeare in the Park);
    Watsonville's 163 are largely library and municipal programming (storytimes,
    RPG nights), which needs a relevance filter before anything is proposed.
    Worth noting separately: a visible share of Watsonville's programming is
    explicitly bilingual, which is live evidence for the Spanish-language
    question above rather than a guess about that audience.
  - **Still unanswered:** whether organisers put event details in the *image*
    or the caption on Instagram, and whether hashtags are consistent enough for
    Hashtag Search. The CSV records an Instagram handle for only 2 of 61 events
    and a TikTok for 0, so it carries no sample to audit — that half needs
    hand-checking against live accounts before v2.D can be judged.
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
