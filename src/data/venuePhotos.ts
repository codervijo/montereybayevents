/**
 * Landmark venue photos (v2.Z): public-domain / CC0 only, no people, each with
 * its source and licence recorded in data/venue-photos.json and rendered by
 * scripts/venue-photos.py. An event shows its venue's photo when the venue
 * (data/event-venues.json) has one.
 */
import table from "../../data/event-venues.json";
import photos from "../../data/venue-photos.json";
import dims from "./venuePhotoDims.json";

export type VenuePhoto = {
  key: string;
  venue: string;
  source: string;
  origin: string;
  author: string;
  date: string;
  licence: string;
  licenceNote: string;
  licenceUrl: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

const venues = (table as { venues: Record<string, { name: string; events: string[] }> }).venues;
const rows = (photos as { photos: Record<string, Omit<VenuePhoto, "key" | "venue" | "width" | "height">> }).photos;
const size = dims as Record<string, { width: number; height: number }>;

const bySlug = new Map<string, VenuePhoto>();
for (const [key, p] of Object.entries(rows)) {
  const v = venues[key];
  if (!v || !size[key]) continue;
  const photo = { ...p, key, venue: v.name, ...size[key] };
  for (const s of v.events) bySlug.set(s, photo);
}

export const venuePhoto = (slug: string) => bySlug.get(slug);
export const photoJpg = (key: string) => `/photos/venues/${key}.jpg`;
export const photoWebp = (key: string, w: 800 | 1200) => `/photos/venues/${key}-${w}.webp`;
