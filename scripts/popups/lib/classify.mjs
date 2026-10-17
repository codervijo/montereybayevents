/**
 * Relevance and geography. Both READ what the source wrote: a category is a
 * term found in the item's own text, and a city is a place name found in its
 * own location line. Neither is ever filled in from the source's coverage.
 */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const termRe = (t) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(t)}(?![\\p{L}\\p{N}])`, "iu");

export function classify(text, terms) {
  const hay = String(text ?? "");
  const categories = [];
  const matched = [];
  for (const [cat, list] of Object.entries(terms.categories)) {
    const hits = list.filter((t) => termRe(t).test(hay));
    if (hits.length) { categories.push(cat); matched.push(...hits); }
  }
  const family = terms.family.filter((t) => termRe(t).test(hay));
  return { relevant: categories.length > 0, categories, matched: [...new Set(matched)], familyTerms: family };
}

/** The ten primary cities of the brief, with the spellings sources use. */
export const PRIMARY_CITIES = {
  "Monterey": ["Monterey"],
  "Pacific Grove": ["Pacific Grove"],
  "Carmel": ["Carmel-by-the-Sea", "Carmel by the Sea", "Carmel"],
  "Seaside": ["Seaside"],
  "Marina": ["Marina"],
  "Salinas": ["Salinas"],
  "Watsonville": ["Watsonville"],
  "Santa Cruz": ["Santa Cruz"],
  "Capitola": ["Capitola"],
  "Aptos": ["Aptos"],
};

export function canonicalCity(name) {
  const n = String(name ?? "").trim().toLowerCase();
  for (const [city, spellings] of Object.entries(PRIMARY_CITIES)) {
    if (spellings.some((s) => s.toLowerCase() === n)) return city;
  }
  return null;
}

/**
 * Finds a primary city written in a free-text location line. Returns the LAST
 * one, because an address ends with its city ("Monterey Beach Hotel, 2600 Sand
 * Dunes Drive, Monterey") and a venue name that happens to contain another
 * city's name comes first.
 */
export function cityInText(location) {
  const hay = String(location ?? "");
  let best = null;
  for (const [city, spellings] of Object.entries(PRIMARY_CITIES)) {
    for (const s of spellings) {
      const re = new RegExp(`(?<![\\p{L}])${escapeRe(s)}(?![\\p{L}])`, "giu");
      let m;
      while ((m = re.exec(hay))) if (!best || m.index > best.index) best = { city, index: m.index };
    }
  }
  return best?.city ?? null;
}
