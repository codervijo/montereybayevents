// Pop-ups discovery pipeline (v4.B) — scripts/popups/. Pure-function tests:
// nothing here touches the network. The four areas the brief names are
// extraction, deduplication, expiry and publication eligibility; the registry
// and robots.txt checks guard the two promises the pipeline makes about access.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { parseIcs } from "../../scripts/popups/lib/ics.mjs";
import { extractEvents, normaliseEvent } from "../../scripts/popups/lib/jsonld.mjs";
import { parseFeed } from "../../scripts/popups/lib/rss.mjs";
import { parseRobots, isAllowed } from "../../scripts/popups/lib/robots.mjs";
import { classifyStatus } from "../../scripts/popups/lib/http.mjs";
import { classify, cityInText } from "../../scripts/popups/lib/classify.mjs";
import { normaliseTitle, sameTitle, findDuplicate } from "../../scripts/popups/lib/dedupe.mjs";
import { fromIcs, fromJsonLd, fromFeedItem, normaliseWhen, collapseRecurring, buildCandidate, mergeCandidate, utcToPacific } from "../../scripts/popups/lib/candidate.mjs";
import { transition, canTransition, publicationEligibility, shouldExpire, expire, STATUSES } from "../../scripts/popups/lib/lifecycle.mjs";
import { validateExtraction, quoteStatesDate, htmlToText, extractFromText } from "../../scripts/popups/lib/extract-llm.mjs";
import { applyProbe } from "../../scripts/popups/probe.mjs";

const sources = JSON.parse(readFileSync("data/popups/sources.json", "utf8"));
const terms = JSON.parse(readFileSync("data/popups/terms.json", "utf8"));
const SRC = { id: "test-source", url: "https://example.org/events/", feedUrl: "https://example.org/events/feed.ics" };
const NOW = "2026-10-11T12:00:00.000Z";
const TODAY = "2026-10-11";

const ICS = [
  "BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:42",
  "SUMMARY:Pokémon Trading Card Pop-Up",
  "DTSTART;TZID=America/Los_Angeles:20261114T100000",
  "DTEND;TZID=America/Los_Angeles:20261114T160000",
  "LOCATION:Monterey Beach Hotel - 2600 Sand Dunes Drive\\, Monterey CA 93940",
  "DESCRIPTION:Vendors and trades for all ages. https://example.org/calendar.aspx?EID=42",
  "URL:/common/modules/iCalendar/iCalendar.aspx?feed=calendar",
  "BEGIN:VALARM", "DESCRIPTION:reminder", "END:VALARM",
  "END:VEVENT",
  "BEGIN:VEVENT", "UID:43", "SUMMARY:All-day fair", "DTSTART;VALUE=DATE:20261205", "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("extraction — iCalendar", () => {
  const [ev, allDay] = parseIcs(ICS);
  it("reads the feed's own fields and ignores nested alarms", () => {
    expect(ev.summary).toBe("Pokémon Trading Card Pop-Up");
    expect(ev.start).toEqual({ date: "2026-11-14", time: "10:00", tzid: "America/Los_Angeles" });
    expect(ev.description).toContain("Vendors and trades");
  });
  it("keeps a date-only value date-only", () => {
    expect(allDay.start).toEqual({ date: "2026-12-05", time: null });
    expect(fromIcs(allDay, SRC).start).toEqual({ date: "2026-12-05", time: null });
    expect(fromIcs(allDay, SRC).end).toBeNull();
  });
  it("takes the link from the end of DESCRIPTION, not the feed's own URL", () => {
    const raw = fromIcs(ev, SRC);
    expect(raw.url).toBe("https://example.org/calendar.aspx?EID=42");
    expect(raw.description).toBe("Vendors and trades for all ages.");
  });
  it("reads the city from the location line and records where it came from", () => {
    const raw = fromIcs(ev, SRC);
    expect(raw.city).toBe("Monterey");
    expect(raw.provenance.city).toMatch(/LOCATION/);
  });
  it("never fills what the feed did not state", () => {
    const raw = fromIcs(ev, SRC);
    expect(raw.admission).toBeNull();
    expect(raw.organizer).toBeNull();
    expect(raw.image).toBeNull();
  });
});

describe("extraction — JSON-LD", () => {
  const html = `<script type="application/ld+json">${JSON.stringify({ "@graph": [
    { "@type": "WebPage", name: "Events" },
    { "@type": "Event", name: "Anime &amp; Cosplay Night Market", startDate: "2026-11-07T00:00:00-08:00", endDate: "2026-11-07T23:59:59-08:00",
      url: "/upcoming-event/anime-night/", description: "&lt;p&gt;Vendors.&lt;/p&gt;",
      location: { "@type": "Place", name: "Abbott Square", address: { streetAddress: "118 Cooper St", addressLocality: "Santa Cruz" } },
      offers: { price: "Free – 30", priceCurrency: "USD class= class=" } },
  ] })}</script><script type="application/ld+json">{ not json</script>`;
  const nodes = extractEvents(html);
  it("finds Event nodes inside @graph and skips a malformed block", () => {
    expect(nodes).toHaveLength(1);
    expect(normaliseEvent(nodes[0]).name).toBe("Anime &amp; Cosplay Night Market");
  });
  it("treats 00:00–23:59 as an all-day placeholder, not a door time", () => {
    const raw = fromJsonLd(nodes[0], SRC);
    expect(raw.start).toEqual({ date: "2026-11-07", time: null });
    expect(raw.end).toBeNull();
    expect(raw.whenNotes.join(" ")).toMatch(/placeholder/);
  });
  it("keeps the price verbatim and drops a malformed currency", () => {
    const raw = fromJsonLd(nodes[0], SRC);
    expect(raw.admission).toEqual({ raw: "Free – 30", currency: null });
  });
  it("decodes entities, strips markup and resolves the link", () => {
    const raw = fromJsonLd(nodes[0], SRC);
    expect(raw.name).toBe("Anime & Cosplay Night Market");
    expect(raw.description).toBe("Vendors.");
    expect(raw.url).toBe("https://example.org/upcoming-event/anime-night/");
    expect(raw.city).toBe("Santa Cruz");
  });
});

describe("extraction — times", () => {
  it("converts a UTC instant to Pacific across the DST boundary", () => {
    expect(utcToPacific("2026-10-31", "17:00")).toEqual({ date: "2026-10-31", time: "10:00" });
    expect(utcToPacific("2026-11-02", "02:30")).toEqual({ date: "2026-11-01", time: "18:30" });
  });
  it("drops a time in a zone it cannot place, and says so", () => {
    const w = normaliseWhen({ date: "2026-11-07", time: "19:00", offset: "-05:00" }, null);
    expect(w.start).toEqual({ date: "2026-11-07", time: null });
    expect(w.notes.join(" ")).toMatch(/not Pacific/);
  });
});

describe("extraction — feed posts", () => {
  const xml = `<rss><channel><item><title><![CDATA[Holiday Market returns]]></title><link>https://example.org/p/1</link><pubDate>Mon, 05 Oct 2026 10:00:00 GMT</pubDate><description>&lt;p&gt;Makers and food trucks.&lt;/p&gt;</description></item></channel></rss>`;
  it("never turns a publication date into an event date", () => {
    const [item] = parseFeed(xml);
    expect(item.title).toBe("Holiday Market returns");
    const raw = fromFeedItem(item, SRC);
    expect(raw.start).toBeNull();
    const c = buildCandidate(raw, SRC, classify(`${raw.name} ${raw.description}`, terms), NOW);
    expect(c.status).toBe("DISCOVERED");
  });
});

describe("extraction — quote-verified page text", () => {
  const page = "Sharp Corners presents the Monterey Bay Card Show. Saturday, November 29, 2025 at the Monterey Conference Center. Admission is $5 at the door. Winter Bash — December 12 at the Elks Lodge.";
  const good = { name: "Monterey Bay Card Show", nameQuote: "the Monterey Bay Card Show", date: "2025-11-29", dateQuote: "Saturday, November 29, 2025", venue: "Monterey Conference Center", venueQuote: "at the Monterey Conference Center", price: "$5", priceQuote: "Admission is $5 at the door" };

  it("keeps fields whose quotes are on the page", () => {
    const [e] = validateExtraction([good], page);
    expect(e.start).toEqual({ date: "2025-11-29", time: null });
    expect(e.venue).toBe("Monterey Conference Center");
    expect(e.admission.raw).toBe("Admission is $5 at the door");
  });
  it("drops an event whose name quote is not on the page", () => {
    expect(validateExtraction([{ ...good, nameQuote: "Salinas Card Expo" }], page)).toHaveLength(0);
  });
  it("refuses a year the page never stated", () => {
    const [e] = validateExtraction([{ name: "Winter Bash", nameQuote: "Winter Bash", date: "2026-12-12", dateQuote: "December 12" }], page);
    expect(e.start).toBeNull();
    expect(e.dateText).toBe("December 12");
    expect(e.dropped.join(" ")).toMatch(/no year/);
  });
  it("refuses a date its own quote does not state", () => {
    const [e] = validateExtraction([{ ...good, date: "2025-11-30" }], page);
    expect(e.start).toBeNull();
  });
  it("refuses an invented venue and an invented price", () => {
    const [e] = validateExtraction([{ ...good, venue: "Embassy Suites", venueQuote: "at Embassy Suites", priceQuote: "Free admission" }], page);
    expect(e.venue).toBeNull();
    expect(e.admission).toBeNull();
  });
  it("checks day, month and year separately", () => {
    expect(quoteStatesDate("Sat 11/29", "2025-11-29")).toEqual({ day: true, month: true, year: false });
    expect(quoteStatesDate("Nov 29, 2025", "2025-11-29")).toEqual({ day: true, month: true, year: true });
  });
  it("strips scripts and navigation before the text is read", () => {
    expect(htmlToText("<nav>Menu</nav><script>var a=1</script><p>Card show &amp; swap</p>")).toBe("Card show & swap");
  });
  it("reports a missing key instead of calling the API", async () => {
    const r = await extractFromText({ text: page, apiKey: null, fetchImpl: () => { throw new Error("must not be called"); } });
    expect(r.outcome).toBe("needs-credentials");
  });
});

describe("relevance and geography", () => {
  it("matches whole terms only", () => {
    expect(classify("Pokémon TCG league night", terms).categories).toContain("collectibles");
    expect(classify("Legoland trip planning", terms).relevant).toBe(false);
    expect(classify("City Council meeting", terms).relevant).toBe(false);
  });
  it("family terms tag an item but do not make it a pop-up", () => {
    const c = classify("Story time for kids", terms);
    expect(c.relevant).toBe(false);
    expect(c.familyTerms).toContain("kids");
  });
  it("takes the last city in an address line", () => {
    expect(cityInText("Monterey Room, 1441 Canyon Del Rey Blvd, Seaside CA")).toBe("Seaside");
    expect(cityInText("Sunset Center, Carmel-by-the-Sea")).toBe("Carmel");
    expect(cityInText("Kaiser Permanente Arena")).toBeNull();
  });
});

describe("deduplication", () => {
  const mbe = [
    { name: "Capitola Art & Wine Festival", start: "2026-09-12", end: "2026-09-13", ref: "events-2026:capitola-art-wine-festival" },
    { name: "Monterey Jazz Festival", start: "2026-09-25", end: "2026-09-27", ref: "events-2026:monterey-jazz-festival" },
  ];
  it("ignores year, ordinal and punctuation noise in a title", () => {
    expect(normaliseTitle("The 42nd Annual Capitola Art & Wine Festival 2026")).toBe("capitola art wine festival");
    expect(sameTitle("69th Monterey Jazz Festival", "Monterey Jazz Festival")).toBe(true);
    expect(sameTitle("Monterey Jazz Festival", "Monterey Card Show")).toBe(false);
  });
  it("finds an event already on the site when the dates overlap", () => {
    expect(findDuplicate({ name: "42nd Annual Capitola Art and Wine Festival", start: "2026-09-13", end: null }, mbe)?.ref).toBe("events-2026:capitola-art-wine-festival");
  });
  it("does not call next year's edition a duplicate", () => {
    expect(findDuplicate({ name: "Capitola Art & Wine Festival", start: "2027-09-11", end: "2027-09-12" }, mbe)).toBeNull();
  });
  it("never matches an undated lead on its name alone", () => {
    expect(findDuplicate({ name: "Monterey Jazz Festival", start: null, end: null }, mbe)).toBeNull();
  });
  it("collapses a repeated title into one recurring candidate", () => {
    const raws = ["2026-11-03", "2026-12-01", "2026-10-06"].map((d, i) => ({ key: `uid:${i}`, name: "Lego® Club!", start: { date: d, time: "15:00" } }));
    const out = collapseRecurring([...raws, { key: "uid:9", name: "One-off Pop-Up", start: { date: "2026-11-08", time: null } }], TODAY);
    expect(out).toHaveLength(2);
    const club = out.find((r) => r.recurrence.kind === "recurring");
    expect(club.start.date).toBe("2026-11-03");
    expect(club.recurrence.occurrences).toBe(3);
    expect(out.find((r) => r.name === "One-off Pop-Up").recurrence.kind).toBe("single");
  });
});

const candidate = (over = {}) => ({
  ...buildCandidate(fromIcs(parseIcs(ICS)[0], SRC), SRC, classify("Pokémon Trading Card Pop-Up", terms), NOW),
  ...over,
});
const verified = (over = {}) =>
  transition(candidate({ evidence: [{ kind: "organizer", url: "https://organizer.example/show" }], ...over }), "VERIFIED", { at: NOW, by: "operator" });

describe("review queue", () => {
  it("starts a complete candidate at NEEDS_REVIEW and never further", () => {
    const c = candidate();
    expect(c.status).toBe("NEEDS_REVIEW");
    expect(c.lastVerifiedAt).toBeNull();
    expect(c.officialUrl).toBeNull();
    expect(c.description).toBeNull();
  });
  it("is idempotent — a second import of the same source data changes nothing but lastSeenAt", () => {
    const a = candidate();
    const b = mergeCandidate(a, candidate(), "2026-10-12T12:00:00.000Z");
    expect({ ...b, lastSeenAt: a.lastSeenAt }).toEqual(a);
  });
  it("records a source change after review instead of overwriting the reviewed record", () => {
    const v = verified();
    const moved = { ...candidate(), start: { date: "2026-11-21", time: "10:00" } };
    const merged = mergeCandidate(v, moved, NOW);
    expect(merged.start.date).toBe("2026-11-14");
    expect(merged.status).toBe("VERIFIED");
    expect(merged.sourceDrift.fields.start.date).toBe("2026-11-21");
  });
  it("refuses to verify without authoritative evidence", () => {
    expect(() => transition(candidate(), "VERIFIED", { at: NOW, by: "operator" })).toThrow(/authoritative/);
    expect(() => transition(candidate({ evidence: [{ kind: "aggregator", url: "https://listing.example/x" }] }), "VERIFIED", { at: NOW, by: "operator" })).toThrow(/authoritative/);
  });
  it("cannot skip review", () => {
    expect(canTransition("DISCOVERED", "PUBLISHED")).toBe(false);
    expect(canTransition("NEEDS_REVIEW", "PUBLISHED")).toBe(false);
    expect(() => transition(candidate(), "PUBLISHED", { at: NOW, by: "operator" })).toThrow(/illegal/);
  });
  it("uses exactly the seven states of the brief", () => {
    expect(STATUSES).toEqual(["DISCOVERED", "NEEDS_REVIEW", "VERIFIED", "PUBLISHED", "REJECTED", "EXPIRED", "CANCELLED"]);
  });
});

describe("publication eligibility", () => {
  it("allows a verified, upcoming, evidenced candidate", () => {
    expect(publicationEligibility(verified(), TODAY)).toEqual({ eligible: true, reasons: [] });
  });
  it("blocks anything that has not been verified", () => {
    expect(publicationEligibility(candidate(), TODAY).eligible).toBe(false);
  });
  it("blocks a status edited by hand without the evidence behind it", () => {
    const forged = candidate({ status: "PUBLISHED" });
    const r = publicationEligibility(forged, TODAY);
    expect(r.eligible).toBe(false);
    expect(r.reasons.join(" ")).toMatch(/authoritative/);
    expect(r.reasons.join(" ")).toMatch(/never verified/);
  });
  it("blocks a duplicate and an event that is over", () => {
    expect(publicationEligibility({ ...verified(), duplicateOf: "abc" }, TODAY).eligible).toBe(false);
    expect(publicationEligibility(verified(), "2026-11-15").reasons).toContain("already over");
  });
});

describe("expiry", () => {
  it("expires the day after the last day, not on it", () => {
    expect(shouldExpire(candidate(), "2026-11-14")).toBe(false);
    expect(shouldExpire(candidate(), "2026-11-15")).toBe(true);
  });
  it("uses the end date of a multi-day event", () => {
    const c = candidate({ end: { date: "2026-11-16", time: null } });
    expect(shouldExpire(c, "2026-11-16")).toBe(false);
    expect(shouldExpire(c, "2026-11-17")).toBe(true);
  });
  it("records what a candidate expired from, and leaves terminal states alone", () => {
    const e = expire(verified(), "2026-11-15", NOW);
    expect(e.status).toBe("EXPIRED");
    expect(e.expiredFrom).toBe("VERIFIED");
    const rejected = transition(candidate(), "REJECTED", { at: NOW, by: "operator" });
    expect(expire(rejected, "2026-11-15", NOW)).toBe(rejected);
  });
  it("never expires an undated lead by date", () => {
    expect(shouldExpire(candidate({ start: null, end: null }), "2030-01-01")).toBe(false);
  });
});

describe("access", () => {
  const robots = parseRobots("User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\nDisallow: /*?*=*\n\nUser-agent: badbot\nDisallow: /");
  it("honours robots.txt, including wildcards and the longest match", () => {
    expect(isAllowed(robots, "https://x.org/events/")).toBe(true);
    expect(isAllowed(robots, "https://x.org/events/?ical=1")).toBe(false);
    expect(isAllowed(robots, "https://x.org/wp-admin/admin-ajax.php")).toBe(true);
    expect(isAllowed(parseRobots("User-agent: *\nDisallow: /"), "https://x.org/r/santacruz/")).toBe(false);
    expect(isAllowed([], "https://x.org/anything")).toBe(true);
  });
  it("classifies a refusal as blocked, never as something to retry around", () => {
    expect(classifyStatus(403)).toBe("blocked");
    expect(classifyStatus(429)).toBe("transient");
    expect(classifyStatus(404)).toBe("not-found");
  });
  it("records an unreachable source instead of a method nobody saw work", () => {
    const s = applyProbe({ id: "x", method: "ics" }, { page: "blocked", status: 403, methods: [] }, TODAY);
    expect(s.method).toBeNull();
    expect(s.access).toBe("blocked");
    expect(s.accessNote).toMatch(/403/);
  });
});

describe("source registry", () => {
  it("has the fields the brief asks for on every source", () => {
    for (const s of sources) {
      expect(s.id, "id").toMatch(/^[a-z0-9-]+$/);
      expect(s.name).toBeTruthy();
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.coverage.length).toBeGreaterThan(0);
      expect(s).toHaveProperty("method");
      expect(s).toHaveProperty("lastChecked");
      expect(s).toHaveProperty("reliability");
      expect(s.lastProbed, `${s.id} was never probed`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(new Set(sources.map((s) => s.id)).size).toBe(sources.length);
  });
  it("monitors at least 30 reachable sources", () => {
    expect(sources.filter((s) => s.access === "ok" && s.enabled !== false).length).toBeGreaterThanOrEqual(30);
  });
  it("gives every unreachable or disabled source a stated reason", () => {
    for (const s of sources.filter((x) => x.access !== "ok" || x.enabled === false)) {
      expect(s.accessNote, s.id).toBeTruthy();
    }
  });
  it("carries no reliability score that nothing has measured", () => {
    for (const s of sources) {
      const reviewed = s.reviewed.verified + s.reviewed.rejected;
      if (reviewed === 0) expect(s.reliability, s.id).toBeNull();
    }
  });
});
