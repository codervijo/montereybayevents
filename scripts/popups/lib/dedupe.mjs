/**
 * Duplicate detection against the two live MBE datasets and against the queue
 * itself. Two records are the same event when their names agree once the
 * noise is removed AND their dates overlap. Name alone is not enough: an
 * annual event's next edition is a new listing, not a duplicate of the last.
 */
const STOP = new Set(["the", "a", "an", "of", "and", "at", "in", "on", "for", "to", "with", "annual", "presents"]);

export function normaliseTitle(title) {
  return String(title ?? "")
    .normalize("NFD").replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/\b\d+(st|nd|rd|th)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ").filter((w) => w && !STOP.has(w)).join(" ");
}

export function titleSimilarity(a, b) {
  const ta = new Set(normaliseTitle(a).split(" ").filter(Boolean));
  const tb = new Set(normaliseTitle(b).split(" ").filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  const shared = [...ta].filter((w) => tb.has(w)).length;
  return shared / (ta.size + tb.size - shared);
}

export function sameTitle(a, b) {
  const na = normaliseTitle(a), nb = normaliseTitle(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const shared = na.split(" ").filter((w) => nb.split(" ").includes(w)).length;
  return shared >= 2 && titleSimilarity(a, b) >= 0.75;
}

/** Inclusive overlap of two ISO date ranges. A missing end means a one-day range. */
export function datesOverlap(aStart, aEnd, bStart, bEnd) {
  if (!aStart || !bStart) return false;
  return aStart <= (bEnd ?? bStart) && bStart <= (aEnd ?? aStart);
}

/**
 * @param item      { name, start, end }  — ISO dates or null
 * @param existing  [{ name, start, end, ref }]
 * @returns the matching existing record, or null
 */
export function findDuplicate(item, existing) {
  for (const e of existing) {
    if (!sameTitle(item.name, e.name)) continue;
    if (datesOverlap(item.start, item.end, e.start, e.end)) return e;
  }
  return null;
}
