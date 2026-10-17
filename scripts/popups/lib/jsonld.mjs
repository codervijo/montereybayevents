/**
 * Pulls schema.org Event nodes out of a page's JSON-LD. Reads what the page
 * publishes and nothing else: no microdata, no guessing from visible text.
 */
const EVENT_TYPES = new Set([
  "Event", "BusinessEvent", "ChildrensEvent", "ComedyEvent", "DanceEvent", "EducationEvent",
  "ExhibitionEvent", "Festival", "FoodEvent", "LiteraryEvent", "MusicEvent", "SaleEvent",
  "ScreeningEvent", "SocialEvent", "SportsEvent", "TheaterEvent", "VisualArtsEvent",
]);

const isEvent = (node) => {
  const t = node?.["@type"];
  return Array.isArray(t) ? t.some((x) => EVENT_TYPES.has(x)) : EVENT_TYPES.has(t);
};

function walk(node, out) {
  if (Array.isArray(node)) { for (const n of node) walk(n, out); return; }
  if (!node || typeof node !== "object") return;
  if (isEvent(node)) out.push(node);
  if (node["@graph"]) walk(node["@graph"], out);
  if (node.itemListElement) walk(node.itemListElement, out);
  if (node.item && typeof node.item === "object") walk(node.item, out);
  if (node.mainEntity) walk(node.mainEntity, out);
}

export function extractJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script[^>]+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try { blocks.push(JSON.parse(m[1].trim())); } catch { /* malformed block: skip, never repair */ }
  }
  return blocks;
}

export function extractEvents(html) {
  const out = [];
  for (const b of extractJsonLdBlocks(html)) walk(b, out);
  return out;
}

const text = (v) => (typeof v === "string" ? v.trim() || null : null);
const first = (v) => (Array.isArray(v) ? v[0] : v);

/** "2026-11-14T10:00:00-08:00" → { date, time, offset }; "2026-11-14" → { date, time: null }. */
export function splitIsoDate(v) {
  const m = /^(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.exec(String(v ?? "").trim());
  if (!m) return null;
  const out = { date: m[1], time: m[2] ?? null };
  if (m[3] === "Z") out.utc = true;
  else if (m[3]) out.offset = m[3];
  return out;
}

/** Flatten one Event node to the fields the candidate schema reads. */
export function normaliseEvent(node) {
  const loc = first(node.location);
  const addr = loc && typeof loc === "object" ? loc.address : null;
  const offer = first(node.offers);
  const org = first(node.organizer);
  const image = first(node.image);
  return {
    name: text(node.name),
    description: text(node.description),
    start: splitIsoDate(node.startDate),
    end: splitIsoDate(node.endDate),
    venue: typeof loc === "string" ? text(loc) : text(loc?.name),
    street: typeof addr === "string" ? text(addr) : text(addr?.streetAddress),
    city: typeof addr === "object" ? text(addr?.addressLocality) : null,
    url: text(node.url),
    organizer: typeof org === "string" ? text(org) : text(org?.name),
    image: typeof image === "string" ? text(image) : text(image?.url),
    price: offer && typeof offer === "object" && offer.price !== undefined && offer.price !== ""
      ? { price: String(offer.price), currency: text(offer.priceCurrency) }
      : null,
    eventStatus: text(node.eventStatus),
  };
}
