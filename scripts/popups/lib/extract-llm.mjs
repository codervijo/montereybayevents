/**
 * Text extraction for sources that publish no structured feed (v4.A item 10:
 * Claude API, key supplied as ANTHROPIC_API_KEY).
 *
 * A language model is a probabilistic reader: it will supply a year the page
 * never stated and read "free" off a parking banner. So the model's answer is
 * never trusted directly. Every field must come back with the QUOTE it was read
 * from, and `validateExtraction` keeps a field only if
 *   - the quote really appears in the page text, and
 *   - for a date, the quote itself contains that day, that month and that year.
 * A date whose quote has no year is kept as text for the reviewer and never
 * becomes a start date. Everything else the model says is discarded.
 */
import { cleanText } from "./candidate.mjs";

export const DEFAULT_MODEL = "claude-sonnet-5-5";
const API = "https://api.anthropic.com/v1/messages";

export function htmlToText(html, max = 40000) {
  const body = String(html)
    .replace(/<(script|style|noscript|svg|nav|footer|header)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  return cleanText(body, max) ?? "";
}

const squash = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** Does `quote` itself state the calendar date `iso`? */
export function quoteStatesDate(quote, iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!m) return { day: false, month: false, year: false };
  const q = squash(quote);
  const [y, mo, d] = [m[1], Number(m[2]), Number(m[3])];
  const name = MONTHS[mo - 1];
  const numeric = new RegExp(`(?<!\\d)0?${mo}[/.-]0?${d}(?!\\d)`).test(q);
  return {
    day: numeric || new RegExp(`(?<!\\d)0?${d}(?:st|nd|rd|th)?(?!\\d)`).test(q),
    month: numeric || q.includes(name) || new RegExp(`\\b${name.slice(0, 3)}\\b`).test(q),
    year: q.includes(y),
  };
}

/**
 * @param events  the model's parsed answer: [{ name, nameQuote, date, dateQuote, endDate, endDateQuote, venue, venueQuote, price, priceQuote, url }]
 * @param text    the page text the model was given
 */
export function validateExtraction(events, text) {
  const page = squash(text);
  const quoted = (q) => Boolean(q) && page.includes(squash(q));
  const out = [];
  for (const e of Array.isArray(events) ? events : []) {
    if (!e?.name || !quoted(e.nameQuote) || !squash(e.nameQuote).includes(squash(e.name))) continue;
    const item = { name: String(e.name).trim(), start: null, end: null, dateText: null, venue: null, admission: null, url: null, dropped: [] };

    const date = (iso, quote, field) => {
      if (!iso) return null;
      if (!quoted(quote)) { item.dropped.push(`${field}: quote not on the page`); return null; }
      const s = quoteStatesDate(quote, iso);
      if (s.day && s.month && s.year) return { date: iso, time: null };
      if (s.day && s.month) { item.dateText = String(quote).trim(); item.dropped.push(`${field}: the page states no year`); return null; }
      item.dropped.push(`${field}: quote does not state that date`);
      return null;
    };
    item.start = date(e.date, e.dateQuote, "date");
    item.end = item.start ? date(e.endDate, e.endDateQuote, "endDate") : null;

    if (e.venue) {
      if (quoted(e.venueQuote) && squash(e.venueQuote).includes(squash(e.venue))) item.venue = String(e.venue).trim();
      else item.dropped.push("venue: quote not on the page");
    }
    if (e.price) {
      if (quoted(e.priceQuote)) item.admission = { raw: String(e.priceQuote).trim(), currency: null };
      else item.dropped.push("price: quote not on the page");
    }
    if (typeof e.url === "string" && /^https?:\/\//.test(e.url)) item.url = e.url;
    out.push(item);
  }
  return out;
}

const PROMPT = `You read the text of a web page and list the public events it announces.
Return ONLY a JSON array. Each element:
{"name": string, "nameQuote": string, "date": "YYYY-MM-DD" or null, "dateQuote": string or null,
 "endDate": "YYYY-MM-DD" or null, "endDateQuote": string or null,
 "venue": string or null, "venueQuote": string or null, "price": string or null, "priceQuote": string or null, "url": string or null}
Every *Quote is copied character for character from the page and contains the value it supports.
If the page does not state something, use null. Do not guess a year, a venue or a price. If the page announces no events, return [].`;

export async function extractFromText({ text, apiKey, model = DEFAULT_MODEL, fetchImpl = fetch }) {
  if (!apiKey) return { ok: false, outcome: "needs-credentials", error: "ANTHROPIC_API_KEY is not set", events: [] };
  const res = await fetchImpl(API, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 4096, system: PROMPT, messages: [{ role: "user", content: text }] }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) {
    let cause = "";
    try { cause = (await res.json())?.error?.message ?? ""; } catch { /* body was not JSON */ }
    const outcome = res.status === 401 || res.status === 403 ? "blocked" : res.status === 429 || res.status >= 500 ? "transient" : "error";
    return { ok: false, outcome, error: `Claude API ${res.status}${cause ? `: ${cause}` : ""}`, events: [] };
  }
  const body = await res.json();
  const raw = (body.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
  let parsed;
  try { parsed = JSON.parse(raw.slice(raw.indexOf("["), raw.lastIndexOf("]") + 1)); }
  catch { return { ok: false, outcome: "error", error: "model answer was not a JSON array", events: [] }; }
  return { ok: true, outcome: "ok", events: validateExtraction(parsed, text), usage: body.usage ?? null };
}

export function fromExtraction(item, source) {
  return {
    key: `text:${item.name}|${item.start?.date ?? ""}`,
    name: item.name, description: null,
    start: item.start, end: item.end,
    whenNotes: [...(item.dateText ? [`page says "${item.dateText}" with no year — not recorded as a date`] : []), ...item.dropped.map((d) => `dropped — ${d}`)],
    venue: item.venue, city: null, url: item.url, organizer: null, image: null, admission: item.admission, rrule: null, cancelled: false,
    provenance: {
      name: "page text (quote verified)", ...(item.start ? { start: "page text (quote states day, month and year)" } : {}),
      ...(item.venue ? { venue: "page text (quote verified)" } : {}), ...(item.admission ? { admission: "page text (verbatim quote)" } : {}),
    },
  };
}
