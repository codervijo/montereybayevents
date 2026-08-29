# Incident log — montereybayevents.com

> **What this file is for:** a dated record of every refresh to a live-incident
> data block on this site — today that means `timberFire` in
> `src/data/traffic.ts`, rendered by `src/components/FireAlert.astro`.
>
> These refreshes are **maintenance, not phases.** They do not take a `vN.X`
> phase letter and they do not get a row in `docs/prd.md`'s phase table. See
> `docs/CLAUDE.md` § Conventions for why.

## How to use this

**Append a dated entry every time you change a live-incident block.** One `###`
heading per refresh, newest first, under the `##` heading for that incident.

Each entry records four things, because these are the four that go wrong:

1. **The figures, with the timestamp they were read at** — not the timestamp of
   the news story that reported them.
2. **What direction they moved.** A number without its direction reads as
   reassuring when it is not; containment falling matters more than its value.
3. **What was WRONG on the site before this refresh.** This is the important
   one. A stale emergency banner is the failure mode this whole block exists to
   prevent, so the log should make it obvious how long each error was live.
4. **What could not be confirmed**, and what was published instead.

Never rewrite an older entry. If a figure published here turns out to have been
wrong, add a new entry saying so.

### Where the figures come from

**Acreage, containment and the as-of stamp are no longer typed by hand.**
`src/lib/fireStatus.ts` reads them from CAL FIRE at BUILD time, and the daily
rebuild Worker refreshes them every morning — so the cron finally does something
about stale *data*, not just stale dates. It also reads Caltrans and renders a
correction strip when the feed contradicts the page's own `roadClaim`, which is
the check that would have caught 25–28 August.

Two things that means for this log:

- **Do not re-type acreage or containment into `src/data/traffic.ts`.** Those
  three fields are now fallback-only, used when the feed cannot be read, and the
  page states out loud when it has fallen back to them. Keep them hand-checked
  but expect them to be unseen.
- **Everything else is still yours.** Evacuation zones, closures, the narrative
  and the judgement about whether the banner belongs up at all are in no feed.
  The automation narrowed the error surface; it did not remove it.

Verified from inside a real Cloudflare Pages build on 2026-08-28: both feeds
return 200 in under half a second, and CF's build egress reaches `fire.ca.gov`
even though this operator's own IP gets 403 from it.

The manual commands below still matter for the narrative, and for checking what
the build will see.

`fire.ca.gov`, `readymontereycounty.org` and most news outlets return 403 to a
scraper. The JSON behind CAL FIRE's incident map does not:

```bash
curl -s "https://incidents.fire.ca.gov/umbraco/api/IncidentApi/List?inactive=false" \
  | python3 -c "import json,sys; [print(i) for i in json.load(sys.stdin) if 'timber' in (i.get('Name') or '').lower()]"
```

It carries `AcresBurned`, `PercentContained`, `IsActive` and an `Updated`
timestamp, and it is routinely **ahead of every news article** about the same
incident. Cross-check the narrative — closures, evacuation zones, what is open —
against BigSurKate, which republishes the USFS/CAL FIRE morning and evening
updates in full and is reachable.

Two things that have bitten this log already:

- **Weekday/date pairs.** Cross-check with `date -d` before writing one. See
  `docs/CLAUDE.md` § Conventions.
- **Old stories that read as breaking news.** The SF Chronicle's "firefighters
  retreat as thunderstorms bring lightning" piece still ranks near the top and
  is from 12 August, when the fire was 3,800 acres at 5% containment.

---

## 2026 Big Sur fires — Timber and Plaskett

**Timber Fire** started Saturday 8 August 2026 on Los Padres National Forest
land, Big Sur, Monterey County.

**Plaskett Fire** started Wednesday 26 August 2026 near Los Burros Road, about
two miles east of Plaskett Creek Campground — roughly 40 miles south of Timber.

Both causes under investigation. Both still active. Renamed from "2026 Timber
Fire" on 28 August, when the second fire made a single-incident heading wrong.

### 2026-08-28 — a second fire, and Highway 1 closes again. THE SITE WAS WRONG IN THE DANGEROUS DIRECTION

- **Read at:** Friday 28 August 2026, 12:24pm PDT, CAL FIRE incident API.
  Closure from Caltrans' conditions service at 12:42pm; evacuation zones and
  business closures from BigSurKate and KQED.
- **Figures:** Timber **23,343 acres, 21% contained**. Plaskett **2,774 acres,
  0% contained**, up about a thousand acres overnight.
- **Direction:** Timber grew 46% in three days (15,998 → 23,343) while
  containment **fell** from 26% to 21% — a longer perimeter, not undone work.
  Plaskett did not exist three days ago.

- **THE WORST STALENESS THIS LOG HAS RECORDED.** For three days the live site
  told readers *"Highway 1 through Big Sur is open again"* while a 40-mile
  stretch was shut. Every previous entry here recorded the site understating a
  fire, which is bad. This one recorded the site sending people toward a closed
  road and an active fire, which is the direction that can actually hurt
  somebody. Acreage was also published as 12,616 against an actual 23,343 —
  understated by 46%.

- **Why it went wrong, and it was not the cron.** The daily rebuild Worker ran
  correctly every morning; a rebuild only re-evaluates `pacificToday()`, and
  cannot refresh figures hand-written into `src/data/traffic.ts`. **The cron
  fixes stale dates. It does nothing for stale data.** A refresh written on
  25 August was also left uncommitted for three days, so even the work that had
  been done was not live. Both failures are human, and both are invisible from
  the outside — nothing on the site or in CI goes red when the numbers rot.

- **Highway 1: closed from Gorda (MM 10.2) to Captain Cooper Elementary
  (MM 50.1)** — about 40 miles, the whole coast rather than a segment, versus
  MM 37–42.6 in the first closure. Shut on 27 August, no reopening estimate,
  shelter-in-place near parts of it. The road has now changed state three times
  in three weeks: closed 11–22 August, open 22–27, closed again from the 27th.
- **Evacuations:** Plaskett carries an order on `MRY-F036` and warnings on
  `MRY-F035` and `MRY-F037`. Timber's zones are unchanged from 25 August.
- **Businesses re-closed.** Nepenthe reopened 20 August and shut again on the
  27th, at least through Sunday 30 — twice in one month. The Henry Miller
  Memorial Library reopened 22 August and closed again from the 27th until
  further notice, posting *"Again, we implore you: Do not come to Big Sur."*
  All four Big Sur state parks are shut again, and Limekiln's notice names both
  fires.
- **Red Flag Warning** for Friday morning 28 August: isolated thunderstorms with
  lightning and winds to 50mph, which the NWS warns may start new fires.

- **Structural limit now being felt.** `Incident` in `src/data/traffic.ts` and
  `FireAlert.astro` model exactly ONE incident. Two fires are currently squeezed
  into one record — the name reads "Timber Fire and Plaskett Fire", `size` and
  `containment` carry two figures each, and Plaskett's zones are tagged inline
  in the shared arrays. It is honest but it is a workaround. If a third fire
  starts, or these two diverge further, the type needs to become a list.

- **Lessons.** (1) A daily rebuild is not a daily *check* — automating the build
  made the staleness less visible, not less likely. (2) Uncommitted emergency
  copy is worth nothing; ship it the day it is written. (3) The failure mode
  finally arrived in the direction the block's own header warns about, and it
  arrived while the automation was working perfectly.

### 2026-08-25 — 15,998 acres, and the coastal evacuation warnings come back

- **Read at:** Tuesday 25 August 2026, 10:37am PDT, CAL FIRE incident API.
  Narrative from the USFS Day 18 morning update; evacuation zones from the Day
  17 evening update, because Day 18 published none and deferred to the county.
- **Figures:** 15,998 acres, 26% contained. Personnel 1,417. California
  Interagency Incident Management Team 3 assumed command.
- **Direction:** up about 3,380 acres overnight with containment moving one
  point. Over three days the fire has grown by more than half — 8,665 → 12,616
  → 15,998 — while containment went 25 → 25 → 26. That is a perimeter growing
  faster than crews can line it, and the flat percentage reads as stability
  when it is the opposite.
- **The story changed direction.** Yesterday's entry recorded the fire moving
  inland *away* from Big Sur. Overnight it crossed the Ventana Creek drainage
  and began climbing toward **Manuel Peak, above Big Sur village**. It is also
  working north-east along the Pine Ridge Trail toward the Big Sur River and
  backing south-west toward Pick Creek. So it is being pushed several ways at
  once, and one of them is back at the coast.
- **Was wrong on the site for ~1 day:** acreage published as 12,616,
  understating by 3,382 (21%). Worse, the copy asserted the fire was "no longer
  on the coast" and that the coastal zones "have been released" — both true when
  written on Monday, both false by Monday evening.
- **Evacuation zones reversed within a day.** The whole MRY-F02x coastal series
  was released Monday; by Monday evening MRY-F021-B through MRY-F028-D were back
  under **warning**, and **MRY-F029 was back under an evacuation order** having
  been dropped entirely the day before. Orders otherwise stay inland. The page
  now says this explicitly — if you were told your zone was clear on Monday,
  check again — because a released-then-reissued zone is the case where a
  resident is most likely to act on a stale reading.
- **Weather is the thing to watch:** upper 80s to low 90s, single-figure
  humidity, south-west winds elevating fire-weather concern **through Thursday
  27 August**, with poor overnight humidity recovery.
- **Unchanged:** Highway 1 open since 22 August, still absent from the
  incident's closure list, and no Timber Fire restriction in Caltrans'
  conditions service at 11:21am. Crews worked above the highway overnight with
  no flare-ups — the page now frames the road as open but not settled. All four
  Big Sur state parks still closed, re-verified on their own parks.ca.gov pages.
- **Lesson for this log:** "released" is not a terminal state. Yesterday's entry
  reported zone releases as though they were progress. Record them as the
  current reading, not as a direction of travel.

### 2026-08-24 — 12,616 acres, the fire moves inland and Highway 1 comes off the closure list

- **Read at:** Monday 24 August 2026, 10:27am PDT, CAL FIRE incident API.
  Corroborated by the USFS Day 17 morning update, released 6:58am.
- **Figures:** 12,616 acres, 25% contained. Structures threatened 661, up from
  503. Personnel 1,368.
- **Direction:** up roughly 3,950 acres in two days — almost half again — with
  containment **static at 25%**. The northern and eastern fronts merged and
  pushed into the Ventana Wilderness; the fire reached partway up Island
  Mountain and is expected to run upcanyon through the Lion Creek drainage
  toward Ventana Double Cone and the upper Carmel River basin. Coastal side is
  in mop-up. So the growth is inland and northward, away from Big Sur.
- **Was wrong on the site for ~2 days:** acreage published as 8,665 (understated
  by 3,951); evacuation orders published as `MRY-F028-C` and `MRY-F029`, both of
  which had been released; and a hedge saying a through route to San Simeon was
  "not confirmed" when Highway 1 had in fact been off the incident's own closure
  list since Day 16.
- **Resolved:** Highway 1 is open, stated plainly. Two independent confirmations
  — Highway 1 absent from the incident CLOSURES section on Days 16 and 17, and
  no Timber Fire restriction on Highway 1 in Monterey County in Caltrans'
  statewide conditions service at 12:44pm.
- **Evacuation zones replaced wholesale.** The coastal `F02x` series was
  released; orders are now inland: `MRY-D082`, `D089`, `D090`, `D091`,
  `F015-C`, `F028-B`, `F031-A`. `F028-B` went *up* from warning to order while
  its neighbours came down.
- **Still closed, and now the main reason the banner stays up:** all four Big
  Sur state parks — Andrew Molera, Julia Pfeiffer Burns, Pfeiffer Big Sur and
  Point Sur. Verified on each park's own `parks.ca.gov` page, no reopening date.
  The road being open does not mean the parks along it are, and that is the
  distinction most likely to spoil someone's day out.
- **Watch next:** if the fire keeps running toward the upper Carmel River basin,
  the affected geography stops being Big Sur and becomes Carmel Valley, which is
  a different set of listings on this site than the banner currently discusses.

### 2026-08-22 — Highway 1 reopens on the same day the fire gets bigger

Shipped as phase `v1.X` — the last incident refresh to take a phase letter,
before this log existed.

- **Read at:** Saturday 22 August 2026, 6:29pm PDT, CAL FIRE incident API.
- **Figures:** 8,665 acres, 25% contained.
- **Direction:** up ~2,600 acres from Thursday, with containment **falling** from
  29%. The fire crossed the Big Sur River heading east into the Ventana
  Wilderness, away from structures — which is why the coastal side could be
  handed back while the headline number worsened.
- **Was wrong on the site for ~5 hours:** the banner headline read "Highway 1 is
  closed through Big Sur … if your plans involve driving south of Carmel, they
  need to change" after Caltrans reopened a ten-mile stretch at 1pm.
- **Also corrected:** evacuation orders (`MRY-F027-B` and `MRY-F028-A` had come
  down to warnings; `MRY-F028` split into A/B/C/D; `MRY-F029` was upgraded);
  Nepenthe reopened; Henry Miller Library back to 11–5; Esalen's "closed through
  23 August" was an end date nobody was publishing any more; and the Carmel
  Middle School shelter had closed on 19 August while the site said it had been
  open since the 10th.
- **Could not confirm, and said so:** whether the reopening restored a full
  through route. Caltrans listed no closure, but the Henry Miller Library —
  reopening that day — told visitors it was reachable only from the north until
  at least midday on 24 August. The page stated both and sent readers to
  QuickMap rather than picking one. Resolved two days later; see the entry above.
- **Trap recorded:** mile markers run north-up here, so Nepenthe, Deetjen's and
  the Library all sit *north* of the closed segment. Their reopening says
  nothing about through-travel, and reading it as corroboration is a mistake
  that was made and caught during this refresh.
