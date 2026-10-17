/**
 * Turns what an adapter read into a queue candidate.
 *
 * THE RULE THIS FILE EXISTS TO KEEP: every field on a candidate was read from
 * the source, and `provenance` says where. A field the source did not state is
 * null. Nothing is defaulted, padded or derived from a neighbouring field —
 * not a city from the source's coverage, not an end time from a start time,
 * not "free" from the absence of a price.
 */
import { createHash } from "node:crypto";
import { cityInText, canonicalCity } from "./classify.mjs";
import { normaliseTitle } from "./dedupe.mjs";
import { normaliseEvent } from "./jsonld.mjs";

const hash = (s) => createHash("sha1").update(s).digest("hex");

export const slugify = (s) =>
  String(s).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };
const decodeOnce = (s) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);

/** Source text → plain text. Decoded twice because feeds double-encode. */
export function cleanText(v, max = 600) {
  if (typeof v !== "string") return null;
  const t = decodeOnce(decodeOnce(v)).replace(/\\n/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return null;
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

const PT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

/** A UTC instant as a Pacific wall-clock date and time. Arithmetic, not inference. */
export function utcToPacific(date, time) {
  const parts = Object.fromEntries(PT.formatToParts(new Date(`${date}T${time}:00Z`)).map((p) => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

/**
 * Normalises a start/end pair to Pacific wall-clock values.
 *
 * Feeds mark an all-day event as 00:00–23:59 (or 00:00–00:00). That is a
 * placeholder, not a door time, so both times are dropped. An offset other
 * than Pacific's is not converted — the time is dropped and the note says why.
 */
export function normaliseWhen(start, end) {
  const notes = [];
  const one = (w) => {
    if (!w?.date) return null;
    if (!w.time) return { date: w.date, time: null };
    if (w.utc) { notes.push("time converted from UTC to Pacific"); return utcToPacific(w.date, w.time); }
    if (w.tzid && w.tzid !== "America/Los_Angeles") { notes.push(`time dropped: feed zone is ${w.tzid}`); return { date: w.date, time: null }; }
    if (w.offset && !/^-0[78]:?00$/.test(w.offset)) { notes.push(`time dropped: offset ${w.offset} is not Pacific`); return { date: w.date, time: null }; }
    return { date: w.date, time: w.time };
  };
  let s = one(start), e = one(end);
  const placeholder = s?.time === "00:00" && (!e || e.time === "23:59" || e.time === "00:00" || e.time === null);
  if (placeholder) {
    notes.push("all-day in the feed: 00:00 is a placeholder, no time recorded");
    s = { date: s.date, time: null };
    if (e) e = { date: e.date, time: null };
  }
  if (e && s && e.date === s.date && e.time === s.time) e = null;
  return { start: s, end: e, notes };
}

const absUrl = (href, base) => {
  if (!href) return null;
  try { const u = new URL(href, base); return /^https?:$/.test(u.protocol) ? u.href : null; } catch { return null; }
};

export function fromIcs(ev, source) {
  // CivicPlus writes the event page at the end of DESCRIPTION and a useless
  // relative path into URL, so a URL closing the description is the link.
  const tail = /(?:^|\s)(https?:\/\/\S+)\s*$/.exec(ev.description ?? "");
  const body = tail ? ev.description.slice(0, tail.index).trim() : ev.description;
  const url = tail ? tail[1] : absUrl(ev.url, source.feedUrl);
  const { start, end, notes } = normaliseWhen(ev.start, ev.end);
  const city = cityInText(ev.location);
  return {
    key: ev.uid ? `uid:${ev.uid}` : `url:${url ?? ev.summary}`,
    name: cleanText(ev.summary, 200),
    description: cleanText(body),
    start, end, whenNotes: notes,
    venue: cleanText(ev.location, 200), city,
    url: url && !/iCalendar\.aspx/i.test(url) ? url : null,
    organizer: cleanText(ev.organizer, 120),
    image: null, admission: null,
    rrule: ev.rrule ?? null,
    cancelled: ev.status === "CANCELLED",
    provenance: {
      name: "ics:SUMMARY", start: "ics:DTSTART", ...(end ? { end: "ics:DTEND" } : {}),
      ...(ev.location ? { venue: "ics:LOCATION" } : {}),
      ...(city ? { city: "city name found in ics:LOCATION" } : {}),
    },
  };
}

export function fromJsonLd(node, source) {
  const n = normaliseEvent(node);
  const { start, end, notes } = normaliseWhen(n.start, n.end);
  const city = canonicalCity(n.city) ?? cityInText(n.street) ?? null;
  const url = absUrl(n.url, source.feedUrl);
  return {
    key: `url:${url ?? n.name}`,
    name: cleanText(n.name, 200),
    description: cleanText(n.description),
    start, end, whenNotes: notes,
    venue: cleanText(n.venue, 200), city,
    // A locality the source states but that is outside the ten primary cities
    // is kept so the geography filter can see it.
    statedLocality: cleanText(n.city, 80),
    url,
    organizer: cleanText(n.organizer, 120),
    image: absUrl(n.image, source.feedUrl),
    admission: n.price ? { raw: cleanText(n.price.price, 60), currency: /^[A-Z]{3}$/.test(n.price.currency ?? "") ? n.price.currency : null } : null,
    rrule: null,
    cancelled: /EventCancelled/i.test(n.eventStatus ?? ""),
    provenance: {
      name: "jsonld:name", ...(start ? { start: "jsonld:startDate" } : {}), ...(end ? { end: "jsonld:endDate" } : {}),
      ...(n.venue ? { venue: "jsonld:location.name" } : {}),
      ...(city ? { city: canonicalCity(n.city) ? "jsonld:location.address.addressLocality" : "city name found in jsonld:streetAddress" } : {}),
      ...(n.price ? { admission: "jsonld:offers.price (verbatim)" } : {}),
    },
  };
}

/** A feed post is an announcement. Its publication date is NOT an event date. */
export function fromFeedItem(item, source) {
  const url = absUrl(item.link, source.feedUrl);
  return {
    key: `url:${url ?? item.guid ?? item.title}`,
    name: cleanText(item.title, 200),
    description: cleanText(item.text),
    start: null, end: null, whenNotes: ["feed post: no event date in a structured field"],
    venue: null, city: null, url, organizer: null, image: null, admission: null, rrule: null, cancelled: false,
    provenance: { name: "rss:title" },
  };
}

/**
 * Collapses a source's repeats. The same title on two or more dates (or with
 * an RRULE) becomes one candidate carrying the next occurrence, the dates the
 * feed lists and the count — flagged so the reviewer can tell a monthly club
 * from a one-off pop-up without opening the same event twice.
 */
export function collapseRecurring(raws, today) {
  const groups = new Map();
  for (const r of raws) {
    const k = normaliseTitle(r.name) || r.key;
    (groups.get(k) ?? groups.set(k, []).get(k)).push(r);
  }
  const out = [];
  for (const [k, group] of groups) {
    const dates = new Set(group.map((r) => r.start?.date).filter(Boolean));
    const rrule = group.find((r) => r.rrule);
    if (dates.size >= 2 || rrule) {
      const upcoming = group.filter((r) => r.start?.date && r.start.date >= today).sort((a, b) => a.start.date.localeCompare(b.start.date));
      const pick = upcoming[0] ?? group[0];
      out.push({ ...pick, key: `recurring:${k}`,
        recurrence: { kind: "recurring", occurrences: dates.size, dates: [...dates].sort().slice(0, 12),
          basis: rrule ? "feed carries a repeat rule" : `same title on ${dates.size} dates in the feed` } });
    } else {
      for (const r of group) out.push({ ...r, recurrence: { kind: "single", occurrences: 1, basis: "one date in the feed" } });
    }
  }
  return out;
}

const CORE = ["name", "start", "venue", "city", "url"];

/** Completeness of the five core fields. It measures how much the source
 *  stated, not how likely the event is to be real — the reviewer decides that. */
export function completeness(raw) {
  const have = CORE.filter((f) => (f === "start" ? raw.start?.date : raw[f]));
  return { score: have.length / CORE.length, basis: `${have.length} of ${CORE.length} core fields read from the source (${have.join(", ") || "none"})` };
}

export const candidateId = (sourceId, key) => hash(`${sourceId}|${key}`).slice(0, 10);

export function buildCandidate(raw, source, cls, now) {
  const id = candidateId(source.id, raw.key);
  const ready = Boolean(raw.name && raw.start?.date && (raw.venue || raw.city));
  const status = ready ? "NEEDS_REVIEW" : "DISCOVERED";
  return {
    schema: 1,
    id,
    slug: slugify(raw.name ?? id),
    status,
    name: raw.name,
    categories: cls.categories,
    matchedTerms: cls.matched,
    familyTerms: cls.familyTerms,
    description: null,
    sourceDescription: raw.description,
    venue: raw.venue,
    city: raw.city,
    start: raw.start,
    end: raw.end,
    whenNotes: raw.whenNotes ?? [],
    admission: raw.admission,
    organizer: raw.organizer,
    officialUrl: null,
    sourceUrls: [{ sourceId: source.id, url: raw.url ?? source.url }],
    image: raw.image ? { url: raw.image, rights: "unknown — not cleared for use" } : null,
    recurrence: raw.recurrence ?? { kind: "single", occurrences: 1, basis: "one date in the feed" },
    cancelledAtSource: raw.cancelled ?? false,
    provenance: raw.provenance,
    confidence: completeness(raw),
    discoveredAt: now,
    lastSeenAt: now,
    lastVerifiedAt: null,
    duplicateOf: null,
    evidence: [],
    reviewNotes: "",
    statusHistory: [{ status, at: now, by: "discover", note: ready ? null : "missing a date or a place" }],
  };
}

/** Source-owned fields, refreshed on a re-run while a candidate is unreviewed. */
export const SOURCE_FIELDS = ["name", "sourceDescription", "venue", "city", "start", "end", "whenNotes", "admission", "organizer", "image", "recurrence", "cancelledAtSource", "provenance", "confidence", "categories", "matchedTerms", "familyTerms"];

/**
 * Re-import of a candidate that is already in the queue. Idempotent: the same
 * source data produces the same file. Review work is never overwritten — once
 * a human has acted, a change at the source is recorded as `sourceDrift` for
 * them to look at instead of being applied.
 */
export function mergeCandidate(existing, fresh, now) {
  const stable = (v) => JSON.stringify(v ?? null);
  const changed = ["name", "venue", "city", "start", "end"].filter((f) => stable(existing[f]) !== stable(fresh[f]));
  const sourceUrls = [...existing.sourceUrls];
  for (const s of fresh.sourceUrls) if (!sourceUrls.some((x) => x.sourceId === s.sourceId && x.url === s.url)) sourceUrls.push(s);

  if (existing.status === "DISCOVERED" || existing.status === "NEEDS_REVIEW") {
    const next = { ...existing, sourceUrls, lastSeenAt: now };
    for (const f of SOURCE_FIELDS) next[f] = fresh[f];
    if (existing.status !== fresh.status && fresh.status === "NEEDS_REVIEW") {
      next.status = "NEEDS_REVIEW";
      next.statusHistory = [...existing.statusHistory, { status: "NEEDS_REVIEW", at: now, by: "discover", note: "source now states a date and a place" }];
    }
    return next;
  }
  const next = { ...existing, sourceUrls, lastSeenAt: now };
  if (changed.length) next.sourceDrift = { at: now, fields: Object.fromEntries(changed.map((f) => [f, fresh[f] ?? null])) };
  return next;
}
