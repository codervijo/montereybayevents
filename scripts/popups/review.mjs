/**
 * Review queue helper — `make popups-queue`, or:
 *
 *   node scripts/popups/review.mjs list [STATUS]
 *   node scripts/popups/review.mjs evidence <id> <organizer|venue|official|aggregator|social> <url>
 *   node scripts/popups/review.mjs set <id> <STATUS> [note]
 *
 * A candidate file can be edited by hand; this exists so a status change goes
 * through the same rules the site build applies (lib/lifecycle.mjs) and is
 * refused here rather than silently ignored there.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { transition, STATUSES } from "./lib/lifecycle.mjs";

const CAND = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "data", "popups", "candidates");
const load = () => readdirSync(CAND).filter((f) => f.endsWith(".json")).map((f) => ({ file: f, c: JSON.parse(readFileSync(join(CAND, f), "utf8")) }));
const find = (id) => {
  const hit = load().find((x) => x.c.id === id || x.file.startsWith(id));
  if (!hit) { console.error(`✗ no candidate "${id}"`); process.exit(1); }
  return hit;
};
const save = ({ file, c }) => writeFileSync(join(CAND, file), JSON.stringify(c, null, 2) + "\n");

/**
 * A source's reliability is the share of its reviewed candidates the operator
 * verified. It stays null until five have been reviewed — below that the
 * figure would be noise presented as a score.
 */
export const MIN_REVIEWED = 5;
function scoreSources(c, to) {
  const path = join(CAND, "..", "sources.json");
  const sources = JSON.parse(readFileSync(path, "utf8"));
  for (const id of new Set(c.sourceUrls.map((s) => s.sourceId))) {
    const s = sources.find((x) => x.id === id);
    if (!s) continue;
    s.reviewed[to === "VERIFIED" ? "verified" : "rejected"]++;
    const n = s.reviewed.verified + s.reviewed.rejected;
    s.reliability = n >= MIN_REVIEWED ? Number((s.reviewed.verified / n).toFixed(2)) : null;
  }
  writeFileSync(path, JSON.stringify(sources, null, 2) + "\n");
}

const [cmd, a, b, ...rest] = process.argv.slice(2);
const now = new Date().toISOString();

if (cmd === "list" || !cmd) {
  const rows = load().filter((x) => !a || x.c.status === a.toUpperCase()).sort((x, y) => (x.c.start?.date ?? "9999").localeCompare(y.c.start?.date ?? "9999"));
  for (const { c } of rows) {
    console.log(`${c.id}  ${c.status.padEnd(12)} ${(c.start?.date ?? "undated").padEnd(10)} ${(c.city ?? "—").padEnd(13)} ${c.recurrence.kind === "recurring" ? "↻ " : "  "}${c.name}  [${c.categories.join(", ")}]`);
  }
  console.log(`\n${rows.length} candidate(s)`);
} else if (cmd === "evidence") {
  const hit = find(a);
  const url = rest[0];
  if (!/^https?:\/\//.test(url ?? "")) { console.error("✗ evidence needs a URL"); process.exit(1); }
  hit.c.evidence.push({ kind: b, url, addedAt: now });
  save(hit);
  console.log(`✓ ${hit.c.id} evidence added (${b})`);
} else if (cmd === "set") {
  const hit = find(a);
  const to = (b ?? "").toUpperCase();
  if (!STATUSES.includes(to)) { console.error(`✗ status must be one of ${STATUSES.join(", ")}`); process.exit(1); }
  try { hit.c = transition(hit.c, to, { at: now, by: "operator", note: rest.join(" ") || null }); }
  catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
  save(hit);
  if (to === "VERIFIED" || to === "REJECTED") scoreSources(hit.c, to);
  console.log(`✓ ${hit.c.id} → ${to}`);
} else {
  console.error("usage: review.mjs list [STATUS] | evidence <id> <kind> <url> | set <id> <STATUS> [note]");
  process.exit(1);
}
