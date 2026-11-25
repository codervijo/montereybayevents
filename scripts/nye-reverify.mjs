#!/usr/bin/env node
// Re-check every NYE 2026 listing (v2.U). Run on 15 Dec and 28 Dec 2026:
//   node scripts/nye-reverify.mjs            # all listings
//   node scripts/nye-reverify.mjs <id> ...   # just these
//
// For each listing it fetches source_url (and ticket_url when different) and
// reports the HTTP status and whether the page still mentions the date. It
// changes nothing: a ✗ or ↷ means open the page, re-read it, and edit
// data/nye-2026.json by hand (times, price, sold out, cancelled), then bump
// last_verified. Sites behind bot protection answer 403 to scripts; those
// print ↷ and need a look in a browser.
import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync(new URL("../data/nye-2026.json", import.meta.url), "utf8"));
const only = process.argv.slice(2);
const entries = data.entries.filter((e) => !only.length || only.includes(e.id));
const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const DATE_RE = /2026|2027|dec(ember)?\.?\s*31|new year/i;

async function probe(url) {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(20000) });
    const text = r.ok ? await r.text() : "";
    return { status: r.status, dated: DATE_RE.test(text) };
  } catch (err) {
    return { status: 0, error: String(err.cause?.code ?? err.name) };
  }
}

let bad = 0, soft = 0;
for (const e of entries) {
  const urls = [...new Set([e.source_url, e.ticket_url].filter(Boolean))];
  for (const url of urls) {
    const r = await probe(url);
    let mark = "✓", why = `${r.status}`;
    if (r.status === 403 || r.status === 429 || r.status === 0) { mark = "↷"; soft++; why = r.error ?? `${r.status} (bot-blocked or transient: check in a browser)`; }
    else if (r.status >= 400) { mark = "✗"; bad++; why = `${r.status}: page gone, re-source or cut the listing`; }
    else if (!r.dated) { mark = "↷"; soft++; why = `${r.status}, but no 2026/NYE text in the HTML (may be JS-rendered)`; }
    console.log(`${mark} ${e.id.padEnd(44)} ${why}  ${url}`);
  }
}
console.log(`\n${entries.length} listings · ${bad} ✗ · ${soft} ↷ · last_verified range ${[...new Set(entries.map((e) => e.last_verified))].sort().join(", ")}`);
process.exit(bad ? 1 : 0);
