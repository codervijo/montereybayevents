import { useMemo, useState } from "react";
import {
  COUNTIES,
  DATE_TBA,
  MONTHS,
  eventHref,
  eventsInMonth,
  monthHref,
  type County,
  type MonthKey,
} from "../data/events-2026";

type CountyFilter = County | "all";
type MonthFilter = MonthKey | "all";

/**
 * The /events/ listing, filterable by county and by month.
 *
 * An Astro island (client:load) because the filters are client state — but the
 * unfiltered list is what Astro renders to static HTML at build, so every one of
 * the 61 events is in the served markup whether or not the JS ever runs. The
 * month hubs at /events/<month>/ are the crawlable, linkable version of the
 * month filter; this is the on-page convenience.
 */
export function EventsList() {
  const [county, setCounty] = useState<CountyFilter>("all");
  const [month, setMonth] = useState<MonthFilter>("all");

  const groups = useMemo(
    () =>
      MONTHS.filter((m) => month === "all" || m.key === month)
        .map((m) => ({
          ...m,
          events: eventsInMonth(m.key).filter(
            (e) => county === "all" || e.county === county,
          ),
        }))
        .filter((g) => g.events.length > 0),
    [county, month],
  );

  // Counted by slug, not by row: a run that spans two months is listed under
  // both hubs but is still one event, and "62 showing" out of 61 reads as a bug.
  const shown = new Set(groups.flatMap((g) => g.events.map((e) => e.slug))).size;

  const chip = (active: boolean) =>
    `border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] transition-colors ${
      active
        ? "border-brass bg-brass text-primary-foreground"
        : "border-border text-muted-foreground hover:border-brass hover:text-brass"
    }`;

  return (
    <>
      <div className="sticky top-[57px] z-40 -mx-5 mt-8 border-y border-border/70 bg-background/90 px-5 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="pr-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            County
          </span>
          <button type="button" onClick={() => setCounty("all")} className={chip(county === "all")}>
            Both
          </button>
          {COUNTIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCounty(c)}
              className={chip(county === c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="pr-1 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Month
          </span>
          <button type="button" onClick={() => setMonth("all")} className={chip(month === "all")}>
            All
          </button>
          {MONTHS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMonth(m.key)}
              className={chip(month === m.key)}
            >
              {m.label.replace(" 2026", "")}
            </button>
          ))}
          <span className="self-center pl-2 text-xs text-muted-foreground">
            {shown} showing
          </span>
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {groups.map((group) => (
          <section key={group.key} id={group.key} className="scroll-mt-32">
            <div className="flex flex-wrap items-end gap-x-4 gap-y-1 border-b border-border/70 pb-3">
              <h2 className="text-4xl leading-none text-brass sm:text-5xl">
                <a href={monthHref(group.key)} className="hover:underline">
                  {group.label}
                </a>
              </h2>
              <span className="pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {group.events.length} {group.events.length === 1 ? "event" : "events"}
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {group.events.map((e) => (
                <a
                  key={e.slug}
                  href={eventHref(e)}
                  className="group flex flex-col gap-2 border-l-2 border-border/80 bg-surface/60 px-5 py-4 transition-all hover:border-brass hover:bg-surface-raised"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-xl leading-tight text-foreground transition-colors group-hover:text-brass">
                      {e.name}
                    </h3>
                    <span
                      className={`text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${
                        e.start ? "text-brass" : "text-muted-foreground"
                      }`}
                    >
                      {e.dateText || DATE_TBA}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                    <span>{e.city ?? "Countywide"}</span>
                    <span aria-hidden="true">·</span>
                    <span>{e.county} County</span>
                    <span aria-hidden="true">·</span>
                    <span>{e.category}</span>
                  </div>
                  {e.description && (
                    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {e.description}
                    </p>
                  )}
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export default EventsList;
