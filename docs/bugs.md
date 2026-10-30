# bugs.md — montereybayevents.com

Bug journal. The operator reports; Claude writes and maintains the entries. One H3 per bug with
a stable `BUG-NNN` ID (next ID = highest + 1). When a bug is fixed, move it to `## Fixed bugs`
and add a `**Fixed in**` line with the commit SHA and phase. Never delete an entry.

Fields: **Repro** · **Expected** · **Actual** · **Where** · **Severity**
(`blocker` / `major` / `minor` / `cosmetic`) · **Notes**.

## Open bugs

### BUG-001 · 2026-10-29 — Car Week venue source comment points at an uncommitted file

- **Repro:** `grep -n "data/research" src/data/carWeekVenues.ts`.
- **Expected:** the source is cited by name with no repo path: "Monterey County Car Week
  ArcGIS layer (2022)".
- **Actual:** the comment cites `data/research/carweek.geojson`. That file exists only as an
  untracked local file. The operator decided on 2026-10-05 not to commit `data/research/`, so
  the path doesn't resolve in the repo or in a fresh clone.
- **Where:** `src/data/carWeekVenues.ts:15`.
- **Severity:** major. The operator marked it high priority.
- **Notes:** carried over as open item 3 from the v2.L–N session (commit `8a25852`).
  It's a comment-only fix with no build or map impact.

## Fixed bugs
