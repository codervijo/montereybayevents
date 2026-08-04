import { schedule, type Access, type CarEvent } from "./events";
import { venues, type Venue } from "./venues";

export type EventDay = {
  id: string;
  weekday: string;
  date: string;
  short: string;
  label?: string | undefined;
};

export type EventDetail = {
  slug: string;
  title: string;
  url?: string | undefined;
  access: Access;
  accessLabel: string;
  description?: string | undefined;
  venue?: Venue | undefined;
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
      weekday: day.weekday,
      date: day.date,
      short: day.short,
      label: event.day,
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

export function mapUrl(venue: Venue): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${venue.venue}, ${venue.address}`,
  )}`;
}
