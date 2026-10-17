# data/popups — the pop-ups review queue (v4)

Nothing in this directory is on the site. The pipeline proposes; the operator
publishes.

| File | What it is |
|---|---|
| `sources.json` | The source registry. `method`, `feedUrl`, `access` and `probe` are written by `make popups-probe` and record what the source served on `lastProbed`. `reliability` is null until five of a source's candidates have been reviewed. |
| `terms.json` | The relevance terms. Edit it to widen or narrow what reaches the queue. |
| `candidates/*.json` | One file per candidate. `provenance` names the feed field each value was read from; a field the source did not state is null. |
| `last-run.json` | The last discovery run: per-source outcome, counts, failures. Overwritten each run. |

## Commands (inside the sites1 container)

```bash
make popups-probe      # re-probe every source, rewrite sources.json
make popups-discover   # read sources into candidates/ — publishes nothing
make popups-queue      # list the queue

node scripts/popups/review.mjs evidence <id> organizer <url>
node scripts/popups/review.mjs set <id> VERIFIED
node scripts/popups/review.mjs set <id> REJECTED "weekly library programme"
```

`discover` takes `--dry-run`, `--force` (re-read sources already checked today)
and `--source <id>`.

## Rules the code enforces

- A URL is fetched only if the host's `robots.txt` allows it. A 401/403 is
  recorded as `blocked` and never worked around.
- `VERIFIED` needs a name, a start date, a venue or city, and at least one
  evidence URL of kind `organizer`, `venue` or `official`. An aggregator
  listing or a social post is a lead, not evidence.
- No script moves a candidate to `VERIFIED` or `PUBLISHED`.
- Once a candidate is reviewed, a change at the source is written to
  `sourceDrift` and not applied.
- HTML-only sources are read by the Claude API and need `ANTHROPIC_API_KEY`.
  Without it they are skipped and reported, not guessed at.
