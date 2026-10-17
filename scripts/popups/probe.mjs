/**
 * Source probe — `make popups-probe` (or `node scripts/popups/probe.mjs [source-id]`).
 *
 * Reads data/popups/sources.json, probes every source and writes the result back.
 *
 * For each candidate source, finds out what it actually serves: iCalendar, an
 * Events Calendar REST endpoint, `Event` JSON-LD, an RSS/Atom feed, plain HTML,
 * or a refusal. The registry records the result of this probe; it never records
 * a discovery method nobody has seen work.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fetchText } from "./lib/http.mjs";
import { parseIcs } from "./lib/ics.mjs";
import { extractEvents } from "./lib/jsonld.mjs";
import { parseFeed } from "./lib/rss.mjs";

const abs = (href, base) => { try { return new URL(href.replace(/&amp;/g, "&"), base).href; } catch { return null; } };

function alternates(html, base, typeRe) {
  const out = [];
  const re = /<link\b[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const t = m[0];
    if (!/rel=["']alternate["']/i.test(t) || !typeRe.test(t)) continue;
    const href = /href=["']([^"']+)["']/i.exec(t)?.[1];
    const u = href && abs(href, base);
    if (u) out.push(u);
  }
  return out;
}

export async function probeSource(src, opts = {}) {
  const page = await fetchText(src.url, { retries: 1, ...opts });
  const result = { id: src.id, url: src.url, page: page.outcome, status: page.status, error: page.error ?? null, methods: [] };
  if (!page.ok) return result;

  const base = page.finalUrl ?? src.url;
  const origin = new URL(base).origin;
  const html = page.text;

  const jsonld = extractEvents(html);
  if (jsonld.length) result.methods.push({ method: "jsonld", url: src.url, count: jsonld.length });

  const tribe = /tribe-events|the-events-calendar/i.test(html);
  const civic = /civicplus|CivicEngage|\/Calendar\.aspx/i.test(html);

  const icsTries = new Set(alternates(html, base, /text\/calendar/i));
  if (tribe) icsTries.add(abs("?ical=1", base.split("?")[0])), icsTries.add(`${origin}/events/?ical=1`);
  if (civic) icsTries.add(`${origin}/common/modules/iCalendar/iCalendar.aspx?catID=14&feed=calendar`);
  for (const u of [...icsTries].filter(Boolean).slice(0, 3)) {
    const r = await fetchText(u, { retries: 0, ...opts });
    const n = r.ok ? parseIcs(r.text).length : 0;
    if (n) { result.methods.push({ method: "ics", url: u, count: n }); break; }
  }

  if (tribe) {
    const u = `${origin}/wp-json/tribe/events/v1/events`;
    const r = await fetchText(u, { retries: 0, accept: "application/json", ...opts });
    try {
      const n = r.ok ? (JSON.parse(r.text).events ?? []).length : 0;
      if (n) result.methods.push({ method: "tribe-rest", url: u, count: n });
    } catch { /* not JSON: the endpoint is closed */ }
  }

  const rssTries = new Set(alternates(html, base, /application\/(rss|atom)\+xml/i));
  if (civic) rssTries.add(`${origin}/RSSFeed.aspx?ModID=58&CID=All-calendar.xml`);
  for (const u of [...rssTries].filter((x) => x && !/comments/i.test(x)).slice(0, 2)) {
    const r = await fetchText(u, { retries: 0, ...opts });
    const n = r.ok ? parseFeed(r.text).length : 0;
    if (n) { result.methods.push({ method: "rss", url: u, count: n }); break; }
  }

  if (!result.methods.length) result.methods.push({ method: "html", url: src.url, count: null });
  return result;
}

/** Richest method first. A feed that states dates beats one that only announces. */
const PREFERENCE = ["ics", "jsonld", "tribe-rest", "rss", "html"];

const ACCESS_NOTE = {
  blocked: "host refuses the job's requests (HTTP 401/403); not worked around",
  disallowed: "excluded by the host's robots.txt; never requested",
  "not-found": "URL returns 404 — the registry entry needs a new URL",
  unreachable: "host does not resolve or connect",
  transient: "timed out or returned a server error when probed",
  error: "unexpected HTTP status when probed",
};

export function applyProbe(source, result, today) {
  const next = { ...source, lastProbed: today };
  if (result.page !== "ok") {
    return { ...next, method: null, feedUrl: null, access: result.page,
      accessNote: `${ACCESS_NOTE[result.page] ?? result.page}${result.status ? ` (HTTP ${result.status})` : ""}`, probe: null };
  }
  const best = [...result.methods].sort((a, b) => PREFERENCE.indexOf(a.method) - PREFERENCE.indexOf(b.method))[0];
  return { ...next, method: best.method, feedUrl: best.url, access: "ok", accessNote: null,
    probe: Object.fromEntries(result.methods.map((m) => [m.method, m.count])) };
}

if (process.argv[1]?.endsWith("probe.mjs")) {
  const path = new URL("../../data/popups/sources.json", import.meta.url);
  const sources = JSON.parse(readFileSync(path, "utf8"));
  const only = process.argv[2];
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  const byId = new Map(sources.map((s) => [s.id, s]));
  const queue = sources.filter((s) => !only || s.id === only);
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const src = queue.shift();
      const r = await probeSource(src);
      const next = applyProbe(src, r, today);
      byId.set(src.id, next);
      const mark = next.access === "ok" ? "✓" : next.access === "transient" ? "↷" : "✗";
      console.log(`${mark} ${src.id.padEnd(28)} ${next.access === "ok" ? `${next.method}  ${JSON.stringify(next.probe)}` : next.accessNote}`);
    }
  }));
  const out = sources.map((s) => byId.get(s.id));
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  const ok = out.filter((s) => s.access === "ok");
  console.log(`\n${ok.length}/${out.length} reachable — ` + PREFERENCE.map((m) => `${m}:${ok.filter((s) => s.method === m).length}`).join(" "));
}
