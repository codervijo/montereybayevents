/**
 * Open Graph card generator — `make og`.
 *
 * WHY THIS IS A SCRIPT AND NOT A BUILD STEP
 *
 * Cards are rendered here and COMMITTED to public/og/. They are deliberately
 * not generated during `astro build`, because that build also runs on
 * Cloudflare Pages, and @resvg/resvg-js is a native module: if its prebuilt
 * binary ever failed to install on CF's builder, the whole DEPLOY would fail
 * rather than just the images. Keeping the renderer in devDependencies and the
 * output in git means Cloudflare installs nothing new and builds no slower.
 *
 * The cost of that choice is drift: a card is a snapshot of an event's name and
 * dates, so re-run `make og` in any commit that changes either. `make og-check`
 * fails if the committed cards are stale, so CI or a pre-push hook can catch it.
 *
 * FONTS ARE VENDORED, AND THAT IS NOT OPTIONAL. The sites1 container has no
 * system fonts at all (`fc-list` returns nothing). resvg does not error on a
 * missing family — it renders the text as nothing and returns a valid PNG. A
 * silent blank card is exactly the failure that reaches production unnoticed,
 * so fonts are loaded explicitly from scripts/fonts and loadSystemFonts is
 * false, which also makes the output byte-identical on any machine.
 *
 * 1200x630 is the Open Graph standard size. The previous cards were 1920x1088;
 * the page templates' og:image:width / og:image:height were updated to match.
 */
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OUT = join(ROOT, "public", "og");
const FONTS = join(HERE, "fonts");

const W = 1200, H = 630;

// Site tokens, converted from oklch exactly as public/og-default.svg documents.
const C = {
  bg: "#100c0a", surface: "#191512", border: "#37322d",
  muted: "#a39e96", brass: "#ddb049", brassSoft: "#eed59b", fg: "#f1eee9",
};

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** Greedy wrap by character budget. Bebas is narrow, so the budget is generous. */
function wrap(text, maxChars, maxLines) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxChars && cur) { lines.push(cur); cur = w; } else { cur = next; }
    if (lines.length === maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = lines[maxLines - 1].replace(/[,\s]+$/, "") + "…";
  }
  return lines;
}

/**
 * The shared card. `kicker` is the small brass line, `title` the headline,
 * `meta` the muted line under it. Every card is the same furniture so the set
 * reads as one system in a feed.
 */
function card({ kicker, title, meta }) {
  const titleLines = wrap(title, 26, 3);
  const n = titleLines.length;
  const titleSize = n >= 3 ? 96 : n === 2 ? 112 : 124;
  // Anchored from the TOP per line-count, not centred on a midpoint: centring
  // grows the block upward, and at three lines that ran the headline into the
  // kicker. These three baselines keep a ~45px gap under the kicker and ~60px
  // above the footer band at every size.
  const titleTop = n >= 3 ? 232 : n === 2 ? 268 : 320;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect x="0" y="0" width="${W}" height="9" fill="${C.brass}"/>
  <rect x="0" y="470" width="${W}" height="160" fill="${C.surface}"/>
  <rect x="0" y="470" width="${W}" height="2" fill="${C.border}"/>
  <text x="80" y="118" font-family="Barlow" font-weight="600" font-size="26"
        letter-spacing="5.2" fill="${C.brass}">${esc(kicker.toUpperCase())}</text>
  ${titleLines.map((l, i) =>
    `<text x="80" y="${titleTop + i * titleSize * 0.92}" font-family="Bebas Neue" font-size="${titleSize}" fill="${C.fg}">${esc(l)}</text>`
  ).join("\n  ")}
  ${meta ? `<text x="80" y="556" font-family="Barlow" font-weight="400" font-size="34" fill="${C.muted}">${esc(meta)}</text>` : ""}
  <text x="${W - 80}" y="556" text-anchor="end" font-family="Barlow" font-weight="600" font-size="26"
        letter-spacing="2.4" fill="${C.brassSoft}">montereybayevents.com</text>
</svg>`;
}

const fontFiles = readdirSync(FONTS).filter((f) => f.endsWith(".ttf")).map((f) => join(FONTS, f));
if (fontFiles.length === 0) throw new Error("no fonts in scripts/fonts — cards would render blank");

function render(svg) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: W },
    // loadSystemFonts:false makes output identical everywhere AND turns a
    // missing vendored font into a visible failure rather than blank text.
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Barlow" },
  }).render().asPng();
}

// ---- what gets a card -------------------------------------------------------

const { regionalEvents, MONTHS } = await import("../src/data/events-2026.ts");

const targets = [];

targets.push({
  name: "home",
  svg: card({ kicker: "Monterey & Santa Cruz counties", title: "Monterey Bay Events", meta: "Fairs, festivals, parades and free things to do" }),
});

targets.push({
  name: "events",
  svg: card({ kicker: "The 2026 calendar", title: "Central Coast Events", meta: `${regionalEvents.length} listings, August to December 2026` }),
});

for (const m of MONTHS) {
  const inMonth = regionalEvents.filter((e) => e.months.includes(m.key));
  targets.push({
    name: `month-${m.key}`,
    svg: card({
      kicker: "What's on",
      title: m.label,
      meta: `${inMonth.length} events across Monterey & Santa Cruz counties`,
    }),
  });
}

// Rows carrying existingSlug / hubHref have no /event/ page of their own —
// they link to a Car Week page or a hub — so they get no card.
for (const e of regionalEvents.filter((e) => !e.existingSlug && !e.hubHref)) {
  targets.push({
    name: `event-${e.slug}`,
    svg: card({
      kicker: e.county === "Santa Cruz" ? "Santa Cruz County" : "Monterey County",
      title: e.name.replace(/\s*\([^)]*\)\s*$/, "").trim() || e.name,
      // dateText is the CSV's own wording; undated rows get the city instead of
      // an invented date.
      meta: e.dateText ? `${e.dateText}${e.city ? ` · ${e.city}` : ""}` : (e.city ?? e.cityText),
    }),
  });
}

// ---- write ------------------------------------------------------------------

const check = process.argv.includes("--check");
if (!check) { rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true }); }

let written = 0, stale = [];
for (const t of targets) {
  const path = join(OUT, `${t.name}.png`);
  const png = render(t.svg);
  if (check) {
    if (!existsSync(path) || !readFileSync(path).equals(png)) stale.push(`${t.name}.png`);
  } else {
    writeFileSync(path, png);
    written++;
  }
}

if (check) {
  if (stale.length) {
    console.error(`✗ ${stale.length} OG card(s) stale or missing — run \`make og\`:`);
    for (const s of stale.slice(0, 10)) console.error(`    ${s}`);
    if (stale.length > 10) console.error(`    …and ${stale.length - 10} more`);
    process.exit(1);
  }
  console.log(`✓ ${targets.length} OG cards current`);
} else {
  console.log(`✓ wrote ${written} OG cards to public/og/`);
}
