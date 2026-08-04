import type { CarEvent } from "../data/events";
import { eventSlug } from "../data/eventIndex";
import { venues } from "../data/venues";

const accessStyles: Record<CarEvent["access"], string> = {
  free: "border-brass/50 text-brass",
  ticketed: "border-border text-muted-foreground",
  private: "border-border/60 text-muted-foreground/70",
};

export function EventCard({ event }: { event: CarEvent }) {
  const venue = venues[event.title];

  return (
    <a
      href={`/event/${eventSlug(event.title)}/`}
      className="group flex flex-col gap-2 border-l-2 border-border/80 bg-surface/60 px-5 py-4 transition-all hover:border-brass hover:bg-surface-raised"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-xl leading-tight text-foreground transition-colors group-hover:text-brass">
          {event.title}
        </h3>
        {event.day && (
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {event.day}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          className={`w-fit border px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.16em] ${accessStyles[event.access]}`}
        >
          {event.accessLabel}
        </span>
        {venue && (
          <span className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
            {venue.venue}
          </span>
        )}
      </div>
      {event.description && (
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {event.description}
        </p>
      )}
    </a>
  );
}

export default EventCard;
