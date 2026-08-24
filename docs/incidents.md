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

## 2026 Timber Fire

Started Saturday 8 August 2026 on Los Padres National Forest land, Big Sur,
Monterey County. Cause under investigation. Still active.

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
