/**
 * The review queue's states and the two rules that guard the public site:
 * what may move where, and what may be published.
 *
 *   DISCOVERED    found, but missing a date or a place — a lead, not a listing
 *   NEEDS_REVIEW  has a name, a date and a place; waiting for a human
 *   VERIFIED      a human checked it against authoritative evidence
 *   PUBLISHED     on the site
 *   REJECTED / EXPIRED / CANCELLED   terminal
 *
 * Nothing in the pipeline ever moves a candidate to VERIFIED or PUBLISHED.
 * Those two transitions are made by the operator and nobody else (v4.A).
 */
export const STATUSES = ["DISCOVERED", "NEEDS_REVIEW", "VERIFIED", "PUBLISHED", "REJECTED", "EXPIRED", "CANCELLED"];

const ALLOWED = {
  DISCOVERED: ["NEEDS_REVIEW", "REJECTED", "EXPIRED"],
  NEEDS_REVIEW: ["VERIFIED", "DISCOVERED", "REJECTED", "EXPIRED", "CANCELLED"],
  VERIFIED: ["PUBLISHED", "NEEDS_REVIEW", "REJECTED", "EXPIRED", "CANCELLED"],
  PUBLISHED: ["EXPIRED", "CANCELLED", "NEEDS_REVIEW"],
  REJECTED: ["NEEDS_REVIEW"],
  EXPIRED: [],
  CANCELLED: [],
};

/** Evidence a listing can stand on. An aggregator or a social post is a lead. */
export const AUTHORITATIVE_KINDS = ["organizer", "venue", "official"];

export const canTransition = (from, to) => (ALLOWED[from] ?? []).includes(to);

export function transition(candidate, to, { at, by, note = null }) {
  if (!canTransition(candidate.status, to)) {
    throw new Error(`illegal transition ${candidate.status} → ${to} for ${candidate.id}`);
  }
  if (to === "VERIFIED") {
    const problems = verificationProblems(candidate);
    if (problems.length) throw new Error(`cannot verify ${candidate.id}: ${problems.join("; ")}`);
  }
  if (to === "PUBLISHED") {
    const { eligible, reasons } = publicationEligibility({ ...candidate, status: "VERIFIED" }, at.slice(0, 10));
    if (!eligible) throw new Error(`cannot publish ${candidate.id}: ${reasons.join("; ")}`);
  }
  return {
    ...candidate,
    status: to,
    lastVerifiedAt: to === "VERIFIED" ? at : candidate.lastVerifiedAt,
    statusHistory: [...(candidate.statusHistory ?? []), { status: to, at, by, note }],
  };
}

export const lastDay = (c) => c.end?.date ?? c.start?.date ?? null;

/** What stops a candidate being marked VERIFIED. Empty means nothing does. */
export function verificationProblems(c) {
  const out = [];
  if (!c.name) out.push("no name");
  if (!c.start?.date) out.push("no start date");
  if (!c.venue && !c.city) out.push("no venue or city");
  const authoritative = (c.evidence ?? []).filter((e) => AUTHORITATIVE_KINDS.includes(e.kind) && /^https?:\/\//.test(e.url ?? ""));
  if (!authoritative.length) out.push("no authoritative evidence (organizer, venue or official URL)");
  if (c.duplicateOf) out.push(`duplicate of ${c.duplicateOf}`);
  return out;
}

/**
 * May this candidate appear on the site? Read by the site build (v4.C), so a
 * hand-edited status cannot publish something the rules would have stopped.
 */
export function publicationEligibility(c, today) {
  const reasons = [];
  if (c.status !== "VERIFIED" && c.status !== "PUBLISHED") reasons.push(`status is ${c.status}`);
  reasons.push(...verificationProblems(c));
  if (!c.lastVerifiedAt) reasons.push("never verified");
  const last = lastDay(c);
  if (last && last < today) reasons.push("already over");
  return { eligible: reasons.length === 0, reasons };
}

/** Candidates whose last day has passed. PUBLISHED ones expire too: the page
 *  stays up marked as ended (v4.A item 11), but the listing leaves "upcoming". */
export function shouldExpire(c, today) {
  if (!["DISCOVERED", "NEEDS_REVIEW", "VERIFIED", "PUBLISHED"].includes(c.status)) return false;
  const last = lastDay(c);
  return Boolean(last && last < today);
}

export function expire(c, today, at) {
  if (!shouldExpire(c, today)) return c;
  return { ...transition(c, "EXPIRED", { at, by: "discover", note: `last day ${lastDay(c)} has passed` }), expiredFrom: c.status };
}
