/**
 * "At a glance" cards (v2.Z): one image per event page, drawn by
 * scripts/gen-og.mjs from these rows and shown on the page by GlanceFigure.astro.
 *
 * Both read THIS module, so the picture and the page cannot disagree. Every
 * value is a field we already publish on the page; nothing is added here.
 *
 * Deliberately date-independent: no "finished" / "on now" state. The cards are
 * rendered and committed (see gen-og.mjs), while past/future is decided at
 * build time, so a card that knew today's date would go stale overnight.
 */
import { regionalEventPages, DATE_TBA, type RegionalEvent } from "./events-2026.ts";
import { allEventDetails, type EventDetail } from "./eventIndex.ts";

export type GlanceRow = { label: string; value: string };
export type Glance = { slug: string; name: string; kicker: string; rows: GlanceRow[] };

const clock = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) return t;
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
};

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

function regionalHours(e: RegionalEvent): string {
  if (!e.times?.length) return "Not published";
  const all = new Set(e.times.map((t) => t.hours));
  if (all.size === 1) return e.times.length === 1 ? e.times[0]!.hours : `${e.times[0]!.hours}, each day`;
  return "Vary by day (listed on the page)";
}

function regionalCost(e: RegionalEvent): string {
  if (e.admission === "free") return "Free";
  if (typeof e.admission === "object") return `Tickets from $${e.admission.from}`;
  return "See the organiser";
}

export function regionalGlance(e: RegionalEvent): Glance {
  const where = [e.venue, e.city ?? `${e.county} County`].filter(Boolean).join(", ");
  const rows: GlanceRow[] = [
    { label: "When", value: e.dateText || DATE_TBA },
    { label: "Hours", value: regionalHours(e) },
    { label: "Where", value: where },
    { label: "Cost", value: regionalCost(e) },
  ];
  if (e.nextEdition) {
    const n = e.nextEdition;
    rows.push({ label: "Next", value: n.end && n.end !== n.start ? `${longDate(n.start)} – ${longDate(n.end)}` : longDate(n.start) });
  }
  return { slug: e.slug, name: e.name, kicker: `${e.county} County · ${e.category}`, rows };
}

export function carWeekGlance(e: EventDetail): Glance {
  const d0 = e.days[0]!;
  const sameHours = e.days.every((d) => d.startTime === d0.startTime && d.endTime === d0.endTime);
  const hours = d0.startTime
    ? `${clock(d0.startTime)}${d0.endTime ? ` – ${clock(d0.endTime)}` : ""}${sameHours ? "" : " (first day)"}`
    : "Not published";
  return {
    slug: e.slug,
    name: e.title,
    kicker: "Monterey Car Week 2026",
    rows: [
      { label: "When", value: `${e.days.map((d) => d.short).join(", ")}, 2026` },
      { label: "Hours", value: hours },
      { label: "Where", value: e.venue?.venue ?? "Not published" },
      { label: "Cost", value: e.accessLabel },
    ],
  };
}

export const glanceKey = (slug: string) => `glance-${slug}`;
export const glancePath = (slug: string) => `/og/${glanceKey(slug)}.png`;
export const GLANCE_W = 1200;
/** Fixed header (kicker + up to two title lines), one 92px band per row, footer. */
export const glanceHeight = (g: Glance) => 300 + g.rows.length * 92 + 70;

/** One sentence of alt text: the card's rows, in order. */
export const glanceAlt = (g: Glance) =>
  `At a glance: ${g.name}. ${g.rows.map((r) => `${r.label}: ${r.value}`).join(". ")}.`;

export function allGlances(): Glance[] {
  return [...allEventDetails.map(carWeekGlance), ...regionalEventPages.map(regionalGlance)];
}
