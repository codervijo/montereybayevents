/** Venue + address lookup keyed by event title. Used for map links on detail pages. */
export type Venue = { venue: string; address: string };

export const venues: Record<string, Venue> = {
  "Monterey Car Week Kick-Off": {
    venue: "Custom House Plaza",
    address: "Custom House Plaza, Monterey, CA 93940",
  },
  "Racing to Del Monte & Pebble Beach": {
    venue: "Monterey History & Art Association",
    address: "5 Custom House Plaza, Monterey, CA 93940",
  },
  "Monterey Pre-Reunion and Corkscrew Hillclimb": {
    venue: "WeatherTech Raceway Laguna Seca",
    address: "1021 Monterey Salinas Hwy, Salinas, CA 93908",
  },
  "The Quail Rally": {
    venue: "Monterey Peninsula roads",
    address: "Carmel-by-the-Sea, CA 93923",
  },
  "Central Coast Poker Rally": {
    venue: "Monterey Peninsula",
    address: "Monterey, CA 93940",
  },
  "Automobilia Collectors Expo": {
    venue: "Embassy Suites Monterey Bay",
    address: "1441 Canyon Del Rey Blvd, Seaside, CA 93955",
  },
  "Monterey British Car Event": {
    venue: "Corral de Tierra Country Club",
    address: "81 Corral De Tierra Rd, Salinas, CA 93908",
  },
  "Porsche Monterey Classic": {
    venue: "Porsche Monterey",
    address: "1781 Del Monte Blvd, Seaside, CA 93955",
  },
  "Piazza Motor Nights": {
    venue: "Monterey Peninsula",
    address: "Monterey, CA 93940",
  },
  "The Laguna Seca Auction — Bonhams Preview": {
    venue: "WeatherTech Raceway Laguna Seca",
    address: "1021 Monterey Salinas Hwy, Salinas, CA 93908",
  },
  "The Laguna Seca Auction — Bonhams Preview & Auction": {
    venue: "WeatherTech Raceway Laguna Seca",
    address: "1021 Monterey Salinas Hwy, Salinas, CA 93908",
  },
  "Zenvo House": { venue: "Monterey Peninsula", address: "Carmel-by-the-Sea, CA 93923" },
  "Concours for a Cause": {
    venue: "Ocean Avenue",
    address: "Ocean Ave, Carmel-by-the-Sea, CA 93921",
  },
  "Night Rider": {
    venue: "Asilomar Conference Grounds",
    address: "800 Asilomar Ave, Pacific Grove, CA 93950",
  },
  "Rolex Monterey Motorsports Reunion": {
    venue: "WeatherTech Raceway Laguna Seca",
    address: "1021 Monterey Salinas Hwy, Salinas, CA 93908",
  },
  "The Quail Auction — Broad Arrow Preview": {
    venue: "Quail Lodge & Golf Club",
    address: "8000 Valley Greens Dr, Carmel-by-the-Sea, CA 93923",
  },
  "The Quail Auction — Broad Arrow": {
    venue: "Quail Lodge & Golf Club",
    address: "8000 Valley Greens Dr, Carmel-by-the-Sea, CA 93923",
  },
  "Pebble Beach Auctions by Gooding Christie's": {
    venue: "Pebble Beach Equestrian Center",
    address: "Portola Rd & Stevenson Dr, Pebble Beach, CA 93953",
  },
  "Astons on the Avenue": {
    venue: "Ocean Avenue",
    address: "Ocean Ave, Carmel-by-the-Sea, CA 93921",
  },
  "The Little Car Show": {
    venue: "Lighthouse Avenue",
    address: "Lighthouse Ave, Pacific Grove, CA 93950",
  },
  "Porsche Pit Stop at Taste Morgan": {
    venue: "The Crossroads Carmel",
    address: "204 Crossroads Blvd, Carmel-by-the-Sea, CA 93923",
  },
  "Pebble Beach Motoring Classic": {
    venue: "Casa Palmero at Pebble Beach",
    address: "1518 Cypress Dr, Pebble Beach, CA 93953",
  },
  "Luau at Asilomar": {
    venue: "Grand Cypress Meadow, Asilomar",
    address: "800 Asilomar Ave, Pacific Grove, CA 93950",
  },
  Motorlux: {
    venue: "Monterey Jet Center",
    address: "300 Sky Park Dr, Monterey, CA 93940",
  },
  "Cadillac House": { venue: "Monterey Peninsula", address: "Carmel-by-the-Sea, CA 93923" },
  "Pebble Beach Tour d'Elegance": {
    venue: "17-Mile Drive & Highway One",
    address: "Pebble Beach, CA 93953",
  },
  "Ferrari Owners Club 4th Annual Concours Carmel": {
    venue: "Ocean Avenue & Dolores Street",
    address: "Ocean Ave & Dolores St, Carmel-by-the-Sea, CA 93921",
  },
  "Mecum Auction": {
    venue: "Hyatt Regency Monterey Hotel & Spa",
    address: "1 Old Golf Course Rd, Monterey, CA 93940",
  },
  "Pebble Beach RetroAuto": {
    venue: "The Lodge at Pebble Beach",
    address: "1700 17 Mile Dr, Pebble Beach, CA 93953",
  },
  "Legends of the Autobahn": {
    venue: "Pacific Grove Golf Links",
    address: "77 Asilomar Blvd, Pacific Grove, CA 93950",
  },
  "Concours Village": {
    venue: "Peter Hay Golf Course, Pebble Beach",
    address: "1700 17 Mile Dr, Pebble Beach, CA 93953",
  },
  "Pebble Beach Classic Car Forum": {
    venue: "The Inn at Spanish Bay",
    address: "2700 17 Mile Dr, Pebble Beach, CA 93953",
  },
  "Woodies in the Woods": {
    venue: "Asilomar Conference Grounds",
    address: "800 Asilomar Ave, Pacific Grove, CA 93950",
  },
  "RM Sotheby's Monterey Auction": {
    venue: "Monterey Conference Center",
    address: "1 Portola Plaza, Monterey, CA 93940",
  },
  "House of Aston Martin": {
    venue: "Carmel-by-the-Sea",
    address: "Carmel-by-the-Sea, CA 93921",
  },
  Bugatti: { venue: "Carmel-by-the-Sea", address: "Carmel-by-the-Sea, CA 93921" },
  "Werks Reunion Monterey": {
    venue: "Corral de Tierra Country Club",
    address: "81 Corral De Tierra Rd, Salinas, CA 93908",
  },
  "The Quail, A Motorsports Gathering": {
    venue: "Quail Lodge & Golf Club",
    address: "8000 Valley Greens Dr, Carmel-by-the-Sea, CA 93923",
  },
  "Pacific Grove Rotary Concours Auto Rally": {
    venue: "Downtown Pacific Grove",
    address: "Lighthouse Ave, Pacific Grove, CA 93950",
  },
  "The Paddock": {
    venue: "Bayonet Black Horse Golf Course",
    address: "1 McClure Way, Seaside, CA 93955",
  },
  "Concours d'Lemons": {
    venue: "Seaside City Hall lawn",
    address: "440 Harcourt Ave, Seaside, CA 93955",
  },
  "MBCA 70th Anniversary — Benzes at the Barnyard": {
    venue: "The Barnyard Shopping Village",
    address: "3618 The Barnyard, Carmel-by-the-Sea, CA 93923",
  },
  "Concorso Italiano": {
    venue: "Bayonet Black Horse Golf Course",
    address: "1 McClure Way, Seaside, CA 93955",
  },
  "Serata Campioni": {
    venue: "The Club at Pasadera",
    address: "100 Pasadera Dr, Monterey, CA 93940",
  },
  "Exotics on Broadway": {
    venue: "Broadway Avenue",
    address: "Broadway Ave, Seaside, CA 93955",
  },
  "Annual Ferrari Event at the Barnyard": {
    venue: "The Barnyard Shopping Village",
    address: "3618 The Barnyard, Carmel-by-the-Sea, CA 93923",
  },
  "Monterey Motorsports Festival": {
    venue: "Monterey Peninsula",
    address: "Monterey, CA 93940",
  },
  "Serata Italiana": {
    venue: "The Club at Pasadera",
    address: "100 Pasadera Dr, Monterey, CA 93940",
  },
  "Pebble Beach Concours d'Elegance": {
    venue: "The Lodge at Pebble Beach",
    address: "1700 17 Mile Dr, Pebble Beach, CA 93953",
  },
};
