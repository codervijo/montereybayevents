import { schedule, type Access, type CarEvent } from "./events";
import { venues, type Venue } from "./venues";
import { organizers, type Organizer } from "./organizers";

export type EventDay = {
  id: string;
  /** ISO 8601 `YYYY-MM-DD`, America/Los_Angeles. */
  iso: string;
  weekday: string;
  date: string;
  short: string;
  label?: string | undefined;
  /**
   * Admission for THIS day. A few events change admission across their run —
   * the Bonhams preview is a free walk-through on its first day and ticketed on
   * its second — so admission is tracked per day, not just per event.
   */
  access: Access;
  accessLabel: string;
  startTime?: string | undefined;
  endTime?: string | undefined;
};

export type EventDetail = {
  slug: string;
  title: string;
  url?: string | undefined;
  /** Admission on the event's first day; drives the badge shown in the UI. */
  access: Access;
  accessLabel: string;
  description?: string | undefined;
  venue?: Venue | undefined;
  organizer?: Organizer | undefined;
  days: EventDay[];
};

export function eventSlug(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u2018\u2019']/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

const map = new Map<string, EventDetail>();

for (const day of schedule) {
  for (const event of day.events as CarEvent[]) {
    const slug = eventSlug(event.title);
    const existing = map.get(slug);
    const dayEntry: EventDay = {
      id: day.id,
      iso: day.iso,
      weekday: day.weekday,
      date: day.date,
      short: day.short,
      label: event.day,
      access: event.access,
      accessLabel: event.accessLabel,
      startTime: event.startTime,
      endTime: event.endTime,
    };

    if (existing) {
      existing.days.push(dayEntry);
      existing.url ??= event.url;
      existing.description ??= event.description;
    } else {
      map.set(slug, {
        slug,
        title: event.title,
        url: event.url,
        access: event.access,
        accessLabel: event.accessLabel,
        description: event.description,
        venue: venues[event.title],
        organizer: organizers[event.title],
        days: [dayEntry],
      });
    }
  }
}

export const eventDetails = map;
export const allEventDetails = [...map.values()];

export function getEventDetail(slug: string): EventDetail | undefined {
  return map.get(slug);
}

/**
 * True only when admission is free on EVERY day the event runs. Used to decide
 * whether a `price: "0"` Offer may be published — a free-then-ticketed event
 * must not claim zero price for its whole run.
 */
export function isFreeThroughout(event: EventDetail): boolean {
  return event.days.every((d) => d.access === "free");
}

export function mapUrl(venue: Venue): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.venue}, ${venue.address}`,
  )}`;
}

export type FreeListing = {
  slug: string;
  title: string;
  href: string;
  accessLabel: string;
  label?: string | undefined;
  venue?: Venue | undefined;
  startTime?: string | undefined;
  endTime?: string | undefined;
};

export type FreeDay = {
  id: string;
  iso: string;
  weekday: string;
  date: string;
  short: string;
  events: FreeListing[];
};

/**
 * Every day-entry whose admission is free for spectators, grouped by day and in
 * schedule order. Filtered on the per-day `access` field, so an event that is
 * free on one day and ticketed on another is listed only under the free day.
 *
 * Note that `accessLabel` is carried through verbatim and should always be
 * rendered: several entries are free to attend with a cost attached elsewhere
 * ("Paid spectator parking", "Paid registration · free showcase"), and dropping
 * the label would overstate what is actually free.
 */
export function freeEventsByDay(): FreeDay[] {
  return schedule
    .map((day) => ({
      id: day.id,
      iso: day.iso,
      weekday: day.weekday,
      date: day.date,
      short: day.short,
      events: day.events
        .filter((e) => e.access === "free")
        .map((e): FreeListing => {
          const slug = eventSlug(e.title);
          return {
            slug,
            title: e.title,
            href: `/event/${slug}/`,
            accessLabel: e.accessLabel,
            label: e.day,
            venue: venues[e.title],
            startTime: e.startTime,
            endTime: e.endTime,
          };
        }),
    }))
    .filter((day) => day.events.length > 0);
}

export const totalFreeListings = freeEventsByDay().reduce(
  (n, d) => n + d.events.length,
  0,
);
