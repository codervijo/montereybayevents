# montereybayevents.com

<placeholder>

## New Year's Eve listings: re-verify on 15 and 28 December 2026

Hotels and venues post New Year's Eve details late, so every listing in
`data/nye-2026.json` (shown on `/new-years-eve/`, `/new-years-eve/monterey/`
and `/new-years-eve/santa-cruz/`) gets re-checked twice:

- **Tue 15 December 2026**
- **Mon 28 December 2026**

```sh
pnpm nye:reverify          # node scripts/nye-reverify.mjs; add listing ids to check only those
```

`✓` the page answers and still mentions the date. `↷` blocked by bot
protection or the date isn't in the raw HTML: open it in a browser. `✗` the
page is gone: re-source the listing or cut it. Then edit the JSON by hand,
bump `last_verified`, look for newly announced events (same sourcing rule:
an official or organiser page that says 2026), rebuild, push and ping IndexNow.
