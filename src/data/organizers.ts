/**
 * Event organizer lookup, keyed by event title — feeds `organizer` in the
 * Event JSON-LD on /event/<slug>/ pages.
 *
 * INTENTIONALLY PARTIAL. An entry exists only where the organizing body is
 * unambiguous from information already in this repo: the event title names it
 * ("Mecum Auction", "MBCA 70th Anniversary…"), the official URL's own domain is
 * the organizer's brand (mecum.com, motorlux.com), or `venues.ts` names the
 * host institution. `url` is the organizer's site root, not the deep event URL.
 *
 * Events with an ambiguous organizer are deliberately ABSENT rather than
 * guessed — `organizer` is simply omitted from their schema, which is valid
 * (it is an optional property). Do not invent a name to fill a gap here; look
 * it up on the organizer's site and cite it, or leave it out.
 *
 * Absent on purpose, for the record: "The Quail Rally" and "The Quail, A
 * Motorsports Gathering" (peninsula.com hosts them, but whether to credit The
 * Peninsula, Quail Lodge or the Gathering itself is not determinable from what
 * we have) and "Monterey British Car Event" (jags.org — club name unconfirmed).
 * Private events carry no organizer because they publish no official page.
 */
export type Organizer = { name: string; url: string };

const PEBBLE_BEACH_CONCOURS: Organizer = {
  name: "Pebble Beach Concours d'Elegance",
  url: "https://www.pebblebeachconcours.net/",
};
const LAGUNA_SECA: Organizer = {
  name: "WeatherTech Raceway Laguna Seca",
  url: "https://weathertechraceway.com/",
};
const ASILOMAR: Organizer = {
  name: "Asilomar Conference Grounds",
  url: "https://www.visitasilomar.com/",
};
const BONHAMS: Organizer = { name: "Bonhams | Cars", url: "https://cars.bonhams.com/" };
const BROAD_ARROW: Organizer = {
  name: "Broad Arrow Auctions",
  url: "https://www.broadarrowauctions.com/",
};
const SERATA: Organizer = { name: "Serata Italiana", url: "https://serataitaliana.com/" };
const INTL_CAR_WEEK: Organizer = {
  name: "International Car Week",
  url: "https://www.internationalcarweek.com/",
};

export const organizers: Record<string, Organizer> = {
  // Named by the event title itself
  "Mecum Auction": { name: "Mecum Auctions", url: "https://www.mecum.com/" },
  "RM Sotheby's Monterey Auction": {
    name: "RM Sotheby's",
    url: "https://rmsothebys.com/",
  },
  "Pebble Beach Auctions by Gooding Christie's": {
    name: "Gooding Christie's",
    url: "https://www.goodingco.com/",
  },
  "The Quail Auction — Broad Arrow": BROAD_ARROW,
  "The Quail Auction — Broad Arrow Preview": BROAD_ARROW,
  "The Laguna Seca Auction — Bonhams Preview": BONHAMS,
  "The Laguna Seca Auction — Bonhams Preview & Auction": BONHAMS,
  "MBCA 70th Anniversary — Benzes at the Barnyard": {
    name: "Mercedes-Benz Club of America",
    url: "https://mbca.clubexpress.com/",
  },
  "Ferrari Owners Club 4th Annual Concours Carmel": {
    name: "Ferrari Owners Club — Northern California",
    url: "https://www.focnorcal.org/",
  },
  "Pacific Grove Rotary Concours Auto Rally": {
    name: "Rotary Club of Pacific Grove",
    url: "https://pgrotary.org/",
  },
  "Porsche Pit Stop at Taste Morgan": {
    name: "Porsche Club of America — Monterey Bay Region",
    url: "https://mby.pca.org/",
  },
  "Annual Ferrari Event at the Barnyard": {
    name: "Big Sur Food & Wine",
    url: "https://www.bigsurfoodandwine.org/",
  },

  // Organizer's own domain is the brand
  Motorlux: { name: "Motorlux", url: "https://motorlux.com/" },
  "Concours d'Lemons": { name: "24 Hours of Lemons", url: "https://24hoursoflemons.com/" },
  "Legends of the Autobahn": {
    name: "Legends of the Autobahn",
    url: "https://legendsoftheautobahn.org/",
  },
  "Concours for a Cause": {
    name: "Concours for a Cause",
    url: "https://concoursforacause.com/",
  },
  "Astons on the Avenue": {
    name: "Astons on the Avenue",
    url: "https://www.astonsontheavenue.com/",
  },
  "The Little Car Show": {
    name: "The Little Car Show",
    url: "https://www.thelittlecarshow.com/",
  },
  "Exotics on Broadway": {
    name: "Exotics on Broadway",
    url: "https://www.exoticsonbroadway.com/",
  },
  "Central Coast Poker Rally": {
    name: "Central Coast Poker Rally",
    url: "https://centralcoastpokerrally.com/",
  },
  "Automobilia Collectors Expo": {
    name: "Automobilia Collectors Expo",
    url: "https://automobiliacollectorsexpo.com/",
  },
  "Monterey Motorsports Festival": {
    name: "Monterey Motorsports Festival",
    url: "https://montereymotorsportsfestival.com/",
  },
  "Piazza Motor Nights": {
    name: "Piazza Motor Nights",
    url: "https://piazzamotornights.com/",
  },
  "Werks Reunion Monterey": {
    name: "Werks Reunion",
    url: "https://www.werksreunion.com/",
  },
  "Zenvo House": { name: "Zenvo Automotive", url: "https://zenvoautomotive.com/" },
  "Porsche Monterey Classic": {
    name: "Porsche Monterey",
    url: "https://www.porschemonterey.com/",
  },
  "Monterey Car Week Kick-Off": {
    name: "See Monterey",
    url: "https://www.seemonterey.com/",
  },
  "Serata Campioni": SERATA,
  "Serata Italiana": SERATA,
  "Concorso Italiano": INTL_CAR_WEEK,
  "The Paddock": INTL_CAR_WEEK,

  // Host institution named in venues.ts / the official URL's domain
  "Racing to Del Monte & Pebble Beach": {
    name: "Monterey History & Art Association",
    url: "https://www.montereyhistory.org/",
  },
  "Monterey Pre-Reunion and Corkscrew Hillclimb": LAGUNA_SECA,
  "Rolex Monterey Motorsports Reunion": LAGUNA_SECA,
  "Night Rider": ASILOMAR,
  "Luau at Asilomar": ASILOMAR,
  "Woodies in the Woods": ASILOMAR,
  "Pebble Beach Concours d'Elegance": PEBBLE_BEACH_CONCOURS,
  "Pebble Beach RetroAuto": PEBBLE_BEACH_CONCOURS,
  "Pebble Beach Tour d'Elegance": PEBBLE_BEACH_CONCOURS,
  "Pebble Beach Motoring Classic": PEBBLE_BEACH_CONCOURS,
  "Pebble Beach Classic Car Forum": PEBBLE_BEACH_CONCOURS,
  "Concours Village": PEBBLE_BEACH_CONCOURS,
};
