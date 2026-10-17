/**
 * Minimal iCalendar reader — VEVENTs only, and only the properties the
 * candidate schema uses. Written here rather than pulled in as a dependency
 * because the pipeline must add nothing to the site's install (v4.A item 2).
 *
 * Dates are returned as the feed wrote them, never converted:
 *   DTSTART;VALUE=DATE:20261114            → { date: "2026-11-14", time: null }
 *   DTSTART;TZID=America/Los_Angeles:...T100000 → { date, time: "10:00", tzid }
 *   DTSTART:20261114T180000Z               → { date, time: "18:00", utc: true }
 * A UTC value keeps `utc: true` so nothing downstream mistakes it for a local
 * clock time — converting it is the caller's decision, with the zone in hand.
 */
const unfold = (text) => text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n[ \t]/g, "");

const unescapeText = (v) =>
  v.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\;/g, ";").replace(/\\\\/g, "\\");

export function parseIcsDate(value, params = {}) {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(value.trim());
  if (!m) return null;
  const date = `${m[1]}-${m[2]}-${m[3]}`;
  if (!m[4]) return { date, time: null };
  const out = { date, time: `${m[4]}:${m[5]}` };
  if (m[7]) out.utc = true;
  if (params.TZID) out.tzid = params.TZID;
  return out;
}

function parseLine(line) {
  const colon = (() => {
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') inQuote = !inQuote;
      else if (line[i] === ":" && !inQuote) return i;
    }
    return -1;
  })();
  if (colon < 0) return null;
  const [name, ...rawParams] = line.slice(0, colon).split(";");
  const params = {};
  for (const p of rawParams) {
    const eq = p.indexOf("=");
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).replace(/^"|"$/g, "");
  }
  return { name: name.toUpperCase(), params, value: line.slice(colon + 1) };
}

export function parseIcs(text) {
  const events = [];
  let cur = null;
  let nested = 0;
  for (const line of unfold(text).split("\n")) {
    if (line === "BEGIN:VEVENT") { cur = {}; nested = 0; continue; }
    if (!cur) continue;
    if (line.startsWith("BEGIN:")) { nested++; continue; }   // VALARM etc.
    if (line === "END:VEVENT") { events.push(cur); cur = null; continue; }
    if (line.startsWith("END:")) { nested--; continue; }
    if (nested > 0) continue;
    const p = parseLine(line);
    if (!p) continue;
    switch (p.name) {
      case "SUMMARY": cur.summary = unescapeText(p.value).trim(); break;
      case "DESCRIPTION": cur.description = unescapeText(p.value).trim(); break;
      case "LOCATION": cur.location = unescapeText(p.value).trim(); break;
      case "URL": cur.url = p.value.trim(); break;
      case "UID": cur.uid = p.value.trim(); break;
      case "RRULE": cur.rrule = p.value.trim(); break;
      case "ORGANIZER": cur.organizer = p.params.CN ?? null; break;
      case "CATEGORIES": cur.categories = unescapeText(p.value).split(",").map((s) => s.trim()).filter(Boolean); break;
      case "DTSTART": cur.start = parseIcsDate(p.value, p.params); break;
      case "DTEND": cur.end = parseIcsDate(p.value, p.params); break;
      case "STATUS": cur.status = p.value.trim().toUpperCase(); break;
    }
  }
  return events;
}
