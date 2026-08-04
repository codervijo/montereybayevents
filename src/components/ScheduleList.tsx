import { useMemo, useState } from "react";
import { EventCard } from "./EventCard";
import { schedule, type Access } from "../data/events";

const filters: { id: Access | "all"; label: string }[] = [
  { id: "all", label: "All events" },
  { id: "free", label: "Free / open" },
  { id: "ticketed", label: "Ticketed" },
  { id: "private", label: "Private" },
];

/** Filterable day-by-day listing. Astro island — the filter is client state. */
export function ScheduleList() {
  const [filter, setFilter] = useState<Access | "all">("all");

  const days = useMemo(
    () =>
      schedule
        .map((d) => ({
          ...d,
          events: filter === "all" ? d.events : d.events.filter((e) => e.access === filter),
        }))
        .filter((d) => d.events.length > 0),
    [filter],
  );

  const shown = days.reduce((n, d) => n + d.events.length, 0);

  return (
    <>
      <div className="sticky top-[57px] z-40 -mx-5 mt-8 border-y border-border/70 bg-background/90 px-5 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`border px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] transition-colors ${
                filter === f.id
                  ? "border-brass bg-brass text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-brass hover:text-brass"
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="self-center pl-2 text-xs text-muted-foreground">
            {shown} showing
          </span>
        </div>
      </div>

      <div className="mt-12 space-y-14">
        {days.map((day) => (
          <section key={day.id} id={day.id} className="scroll-mt-32">
            <div className="flex items-end gap-4 border-b border-border/70 pb-3">
              <h2 className="text-4xl leading-none text-brass sm:text-5xl">{day.date}</h2>
              <span className="pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {day.weekday} · {day.events.length} events
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {day.events.map((e) => (
                <EventCard key={`${day.id}-${e.title}-${e.day ?? ""}`} event={e} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export default ScheduleList;
