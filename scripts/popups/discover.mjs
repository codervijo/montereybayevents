/**
 * Pop-ups discovery job — `make popups-discover`.
 *
 *   node --experimental-strip-types scripts/popups/discover.mjs [--dry-run] [--force] [--source <id>]
 *
 * Reads data/popups/sources.json, fetches every reachable source by the method
 * the probe recorded, and writes one JSON file per candidate into
 * data/popups/candidates/. It PROPOSES; it never publishes. No candidate
 * leaves this script as VERIFIED or PUBLISHED — those are the operator's moves.
 *
 * Idempotent: a candidate's id comes from its source and the source's own key,
 * so a second run rewrites the same files. A source already checked today is
 * skipped unless --force.
 *
 * Like gen-og.mjs, this never runs during `astro build`.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchText } from "./lib/http.mjs";
import { parseIcs } from "./lib/ics.mjs";
import { extractEvents } from "./lib/jsonld.mjs";
import { parseFeed } from "./lib/rss.mjs";
import { classify, PRIMARY_CITIES, cityInText } from "./lib/classify.mjs";
import { findDuplicate } from "./lib/dedupe.mjs";
import { expire } from "./lib/lifecycle.mjs";
import { fromIcs, fromJsonLd, fromFeedItem, collapseRecurring, buildCandidate, mergeCandidate } from "./lib/candidate.mjs";
import { extractFromText, fromExtraction, htmlToText } from "./lib/extract-llm.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const DATA = join(ROOT, "data", "popups");
const CAND = join(DATA, "candidates");

const args = process.argv.slice(2);
const DRY = args.includes("--dry-run");
const FORCE = args.includes("--force");
const ONLY = args.includes("--source") ? args[args.indexOf("--source") + 1] : null;

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const writeJson = (p, v) => { if (!DRY) writeFileSync(p, JSON.stringify(v, null, 2) + "\n"); };
const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
const now = new Date().toISOString();

/** Both live datasets as { name, start, end, ref }, for duplicate checks. */
async function loadMbeEvents() {
  const { regionalEvents } = await import("../../src/data/events-2026.ts");
  const { schedule } = await import("../../src/data/events.ts");
  const out = regionalEvents.map((e) => ({ name: e.name, start: e.start ?? null, end: e.end ?? e.start ?? null, ref: `events-2026:${e.slug}` }));
  for (const day of schedule) for (const ev of day.events) out.push({ name: ev.title, start: day.iso, end: day.iso, ref: `car-week:${day.iso}` });
  return out;
}

/** One source → raw items, by the method the probe recorded. */
async function readSource(source, apiKey) {
  const res = await fetchText(source.feedUrl ?? source.url);
  if (!res.ok) return { outcome: res.outcome, error: res.error ?? `HTTP ${res.status}`, raws: [] };
  switch (source.method) {
    case "ics": return { outcome: "ok", raws: parseIcs(res.text).map((e) => fromIcs(e, source)) };
    case "jsonld": return { outcome: "ok", raws: extractEvents(res.text).map((n) => fromJsonLd(n, source)) };
    case "rss": return { outcome: "ok", raws: parseFeed(res.text).map((i) => fromFeedItem(i, source)) };
    case "html": {
      const x = await extractFromText({ text: htmlToText(res.text), apiKey });
      if (!x.ok) return { outcome: x.outcome, error: x.error, raws: [] };
      return { outcome: "ok", raws: x.events.map((e) => ({ ...fromExtraction(e, source), city: cityInText(e.venue) })), usage: x.usage };
    }
    default: return { outcome: "error", error: `no adapter for method "${source.method}"`, raws: [] };
  }
}

const MARK = { ok: "✓", transient: "↷", "needs-credentials": "↷", skipped: "↷" };

async function main() {
  const sources = readJson(join(DATA, "sources.json"));
  const terms = readJson(join(DATA, "terms.json"));
  const mbe = await loadMbeEvents();
  const apiKey = process.env.ANTHROPIC_API_KEY ?? null;
  mkdirSync(CAND, { recursive: true });

  const queue = new Map();
  for (const f of existsSync(CAND) ? readdirSync(CAND).filter((x) => x.endsWith(".json")) : []) {
    const c = readJson(join(CAND, f));
    queue.set(c.id, { file: f, candidate: c });
  }

  const run = { startedAt: now, today, dryRun: DRY, sources: [], totals: { fetched: 0, items: 0, irrelevant: 0, past: 0, outOfArea: 0, duplicateOfMbe: 0, mergedAcrossSources: 0, created: 0, refreshed: 0, expired: 0 } };
  const primary = Object.keys(PRIMARY_CITIES);

  for (const source of sources) {
    if (ONLY && source.id !== ONLY) continue;
    const row = { id: source.id, method: source.method, outcome: null, error: null, items: 0, created: 0, refreshed: 0 };
    run.sources.push(row);

    if (source.enabled === false) { row.outcome = "disabled"; row.error = source.accessNote; }
    else if (source.access !== "ok") { row.outcome = source.access; row.error = source.accessNote; }
    else if (!FORCE && source.lastChecked === today && source.lastOutcome === "ok") { row.outcome = "skipped"; row.error = "already checked today"; }
    if (row.outcome) { console.log(`${MARK[row.outcome] ?? "✗"} ${source.id.padEnd(28)} ${row.outcome} — ${row.error}`); continue; }

    let read;
    try { read = await readSource(source, apiKey); }
    catch (e) { read = { outcome: "error", error: String(e?.message ?? e), raws: [] }; }
    row.outcome = read.outcome; row.error = read.error ?? null;
    source.lastChecked = today; source.lastOutcome = read.outcome;
    if (read.outcome !== "ok") { console.log(`${MARK[read.outcome] ?? "✗"} ${source.id.padEnd(28)} ${read.outcome} — ${read.error}`); continue; }

    run.totals.fetched++;
    row.items = read.raws.length; run.totals.items += read.raws.length;

    for (const raw of collapseRecurring(read.raws.filter((r) => r.name), today)) {
      const cls = classify(`${raw.name} ${raw.description ?? ""}`, terms);
      if (!cls.relevant) { run.totals.irrelevant++; continue; }
      const last = raw.end?.date ?? raw.start?.date;
      if (last && last < today) { run.totals.past++; continue; }
      if (raw.statedLocality && !raw.city) { run.totals.outOfArea++; continue; }
      if (raw.city && !primary.includes(raw.city)) { run.totals.outOfArea++; continue; }

      const item = { name: raw.name, start: raw.start?.date ?? null, end: raw.end?.date ?? null };
      if (findDuplicate(item, mbe)) { run.totals.duplicateOfMbe++; continue; }

      const fresh = buildCandidate(raw, source, cls, now);
      const own = queue.get(fresh.id);
      if (own) {
        own.candidate = mergeCandidate(own.candidate, fresh, now);
        row.refreshed++; run.totals.refreshed++;
        continue;
      }
      // Same event already queued from another source: add this source to it.
      const others = [...queue.values()].map((q) => ({ name: q.candidate.name, start: q.candidate.start?.date ?? null, end: q.candidate.end?.date ?? null, ref: q.candidate.id }));
      const twin = findDuplicate(item, others);
      if (twin) {
        const q = queue.get(twin.ref);
        q.candidate = { ...q.candidate, lastSeenAt: now, sourceUrls: [...q.candidate.sourceUrls, ...fresh.sourceUrls.filter((s) => !q.candidate.sourceUrls.some((x) => x.sourceId === s.sourceId && x.url === s.url))] };
        run.totals.mergedAcrossSources++;
        continue;
      }
      queue.set(fresh.id, { file: `${fresh.slug}-${fresh.id}.json`, candidate: fresh });
      row.created++; run.totals.created++;
    }
    console.log(`✓ ${source.id.padEnd(28)} ${source.method}: ${row.items} items → ${row.created} new, ${row.refreshed} refreshed`);
  }

  for (const q of queue.values()) {
    const next = expire(q.candidate, today, now);
    if (next !== q.candidate) { q.candidate = next; run.totals.expired++; }
    writeJson(join(CAND, q.file), q.candidate);
  }

  writeJson(join(DATA, "sources.json"), sources);
  run.finishedAt = new Date().toISOString();
  run.queue = Object.fromEntries(["DISCOVERED", "NEEDS_REVIEW", "VERIFIED", "PUBLISHED", "REJECTED", "EXPIRED", "CANCELLED"].map((s) => [s, [...queue.values()].filter((q) => q.candidate.status === s).length]));
  run.failures = run.sources.filter((s) => !["ok", "skipped", "disabled"].includes(s.outcome)).map(({ id, outcome, error }) => ({ id, outcome, error }));
  writeJson(join(DATA, "last-run.json"), run);

  const t = run.totals;
  console.log(`\n${t.fetched} sources read, ${t.items} items → ${t.created} new candidates, ${t.refreshed} refreshed, ${t.expired} expired${DRY ? "  (dry run: nothing written)" : ""}`);
  console.log(`  filtered: ${t.irrelevant} not a pop-up term match, ${t.past} already over, ${t.outOfArea} outside the ten cities, ${t.duplicateOfMbe} already on the site, ${t.mergedAcrossSources} merged across sources`);
  console.log(`  queue: ${Object.entries(run.queue).filter(([, n]) => n).map(([s, n]) => `${s} ${n}`).join(", ") || "empty"}`);
  const needKey = run.failures.filter((f) => f.outcome === "needs-credentials").length;
  if (needKey) console.log(`  ↷ ${needKey} HTML-only sources not read: ANTHROPIC_API_KEY is not set`);
  // Exit non-zero only when a source that should work did not — a blocked or
  // keyless source is a known state, not a failed run.
  const broken = run.failures.filter((f) => ["error", "not-found", "unreachable"].includes(f.outcome) && sources.find((s) => s.id === f.id)?.access === "ok");
  if (broken.length) { console.log(`  ✗ ${broken.length} source(s) failed: ${broken.map((b) => b.id).join(", ")}`); process.exitCode = 1; }
}

await main();
