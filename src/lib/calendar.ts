/**
 * Month-grid calendar over src/data/events-2026.ts.
 *
 * Shared by /monterey-events-calendar/ (the HTML grid) and
 * scripts/gen-maps.mjs (the printable PNG of each month), so the picture and
 * the page cannot disagree about what is on which day.
 *
 * Date arithmetic is done on ISO date strings in UTC, never on local time: the
 * dataset's dates are Pacific calendar dates, and a Date built in a UTC build
 * container from "2026-10-03" must not slide to the 2nd.
 *
 * Runs longer than LONG_RUN_DAYS are not painted onto every day — the
 * Boardwalk's Halloween season would otherwise fill a month of cells and bury
 * the one-day events that are the reason anyone opens a calendar. They are
 * listed once, under the grid, with their own date range.
 */
import { MONTHS, regionalEvents, type MonthKey, type RegionalEvent } from "../data/events-2026.ts";

export { MONTHS };

export const LONG_RUN_DAYS = 7;

export type CalendarCell = {
  /** ISO date of the cell. */
  iso: string;
  day: number;
  inMonth: boolean;
  events: RegionalEvent[];
};

export type MonthGrid = {
  key: MonthKey;
  label: string;
  /** Sunday-first weeks, padded with neighbouring-month cells. */
  weeks: CalendarCell[][];
  /** Dated events longer than LONG_RUN_DAYS that touch this month. */
  longRuns: RegionalEvent[];
  /** Listed in this month with no announced date. */
  undated: RegionalEvent[];
  /** Every dated event in this month, in date order — the grid's text twin. */
  dated: RegionalEvent[];
};

const DAY = 86_400_000;
const toUtc = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const toIso = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Inclusive length of an event in days; a row with no `end` is one day. */
export function runDays(e: RegionalEvent): number {
  if (!e.start) return 0;
  return Math.round((toUtc(e.end ?? e.start) - toUtc(e.start)) / DAY) + 1;
}

export const isLongRun = (e: RegionalEvent) => runDays(e) > LONG_RUN_DAYS;

/** True when the event is on during `iso` (inclusive of both ends). */
export function onDay(e: RegionalEvent, iso: string): boolean {
  if (!e.start) return false;
  return e.start <= iso && iso <= (e.end ?? e.start);
}

export function monthGrid(key: MonthKey): MonthGrid {
  const m = MONTHS.find((x) => x.key === key);
  if (!m) throw new Error(`Unknown month "${key}"`);
  const first = toUtc(`${m.iso}-01`);
  const y = +m.iso.slice(0, 4), mo = +m.iso.slice(5, 7);
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const last = first + (daysInMonth - 1) * DAY;
  const lastIso = toIso(last);
  const firstIso = toIso(first);

  const inMonth = regionalEvents.filter((e) => e.months.includes(key));
  const dated = inMonth
    .filter((e) => e.start && e.start <= lastIso && (e.end ?? e.start) >= firstIso)
    .sort((a, b) => a.start!.localeCompare(b.start!) || a.name.localeCompare(b.name));
  const short = dated.filter((e) => !isLongRun(e));

  const start = first - new Date(first).getUTCDay() * DAY;
  const end = last + (6 - new Date(last).getUTCDay()) * DAY;
  const weeks: CalendarCell[][] = [];
  for (let t = start; t <= end; t += 7 * DAY) {
    const week: CalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = toIso(t + d * DAY);
      const within = iso >= firstIso && iso <= lastIso;
      week.push({
        iso,
        day: +iso.slice(8, 10),
        inMonth: within,
        events: within ? short.filter((e) => onDay(e, iso)) : [],
      });
    }
    weeks.push(week);
  }

  return {
    key,
    label: m.label,
    weeks,
    longRuns: dated.filter(isLongRun),
    undated: inMonth.filter((e) => !e.start),
    dated,
  };
}

export const monthGrids = MONTHS.map((m) => monthGrid(m.key));

/**
 * Display name for a cramped calendar cell: drops a trailing parenthetical
 * (venue or organiser qualifiers like "(Santa Cruz Art League)") and clips.
 * The full name is always one click away and in the list under the grid.
 */
export function shortName(e: RegionalEvent, max = 40): string {
  const base = e.name.replace(/\s*\([^)]*\)\s*$/, "").trim() || e.name;
  return base.length > max ? base.slice(0, max - 1).trimEnd() + "…" : base;
}
