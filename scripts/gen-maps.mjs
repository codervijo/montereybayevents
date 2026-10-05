/**
 * Map and calendar image generator — `make maps`.
 *
 * Renders the primary visuals for /laguna-seca-map/, /monterey-car-week-map/
 * and /monterey-events-calendar/ into public/maps/ as PNG (the downloadable,
 * full-resolution file) plus WebP at three widths (what the pages serve).
 *
 * SAME POSTURE AS scripts/gen-og.mjs, for the same reasons: rendered here and
 * COMMITTED, never during `astro build`. resvg and sharp are native modules and
 * the build also runs on Cloudflare Pages; a failed binary there would fail the
 * deploy, not just the images. `make maps-check` fails when a committed image
 * no longer matches its inputs (the geodata in data/geo/, the event data), so a
 * data edit that changes a map cannot ship with a stale picture.
 *
 * NOTHING HERE IS INVENTED GEOGRAPHY. Every line and polygon is OpenStreetMap
 * (data/geo/*.osm.json, ODbL — credited on every image). Labels name things the
 * raceway, an organiser or OSM names; where a turn number sits on the circuit
 * was checked against the raceway's published facility map and Racing Lines
 * flyer, and drawn on OSM geometry — the raceway's map itself is not traced.
 *
 * Fonts are vendored (scripts/fonts) and system fonts are off: see gen-og.mjs
 * for why a missing font has to be a loud failure rather than blank text.
 */
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const OUT = join(ROOT, "public", "maps");
const FONTS = join(HERE, "fonts");

/** Site tokens, as converted in gen-og.mjs, plus map-only tones derived from them. */
const C = {
  bg: "#100c0a", surface: "#191512", raised: "#221d19", border: "#37322d",
  muted: "#a39e96", brass: "#ddb049", brassSoft: "#eed59b", fg: "#f1eee9",
  road: "#4a433c", roadMajor: "#6b6258", parking: "#2b2622", parkingEdge: "#4a423a",
  camp: "#27301f", campEdge: "#4f6140", water: "#1d3340", sea: "#0c1418", seaEdge: "#24414e",
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fontFiles = readdirSync(FONTS).filter((f) => f.endsWith(".ttf")).map((f) => join(FONTS, f));
if (fontFiles.length === 0) throw new Error("no fonts in scripts/fonts — images would render blank text");

function renderPng(svg, width) {
  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Barlow" },
  }).render().asPng();
}

/** Equirectangular projection, scaled for latitude — fine at a few km. */
function projection({ minLon, maxLon, minLat, maxLat, width, top = 0, left = 0 }) {
  const kx = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
  const s = width / ((maxLon - minLon) * kx);
  const height = Math.round((maxLat - minLat) * s);
  const p = ([lat, lon]) => [left + (lon - minLon) * kx * s, top + (maxLat - lat) * s];
  // metres per pixel, for the scale bar
  const mpp = (111320 * (maxLat - minLat)) / height;
  return { p, height, mpp };
}

const path = (pts, close = false) =>
  "M" + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L") + (close ? " Z" : "");

function centroid(pts) {
  let x = 0, y = 0;
  for (const [a, b] of pts) { x += a; y += b; }
  return [x / pts.length, y / pts.length];
}

/** A text label with a dark halo so it reads over lines and fills. */
function label(x, y, text, { size = 22, fill = C.fg, weight = 600, anchor = "middle", font = "Barlow", spacing = 0, rotate = 0, halo = C.bg } = {}) {
  const t = esc(text);
  const tr = rotate ? ` transform="rotate(${rotate} ${x.toFixed(1)} ${y.toFixed(1)})"` : "";
  const common = `x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="${font}" font-weight="${weight}" font-size="${size}" text-anchor="${anchor}" letter-spacing="${spacing}"${tr}`;
  return `<text ${common} fill="none" stroke="${halo}" stroke-width="${Math.max(4, size / 4)}" stroke-linejoin="round">${t}</text><text ${common} fill="${fill}">${t}</text>`;
}

function multiline(x, y, lines, opts = {}) {
  const lh = (opts.size ?? 22) * 1.18;
  return lines.map((l, i) => label(x, y + i * lh, l, opts)).join("");
}

function scaleBar(x, y, mpp, metres, caption) {
  const w = metres / mpp;
  return `<g>
    <rect x="${x}" y="${y}" width="${w.toFixed(1)}" height="8" fill="${C.fg}"/>
    <rect x="${x}" y="${y}" width="${(w / 2).toFixed(1)}" height="8" fill="${C.bg}" stroke="${C.fg}" stroke-width="2"/>
    ${label(x, y - 10, caption, { size: 18, anchor: "start", fill: C.muted })}
  </g>`;
}

function northArrow(x, y) {
  return `<g>
    <path d="M${x},${y - 34} L${x + 14},${y + 10} L${x},${y} L${x - 14},${y + 10} Z" fill="${C.brass}"/>
    ${label(x, y + 38, "N", { size: 26, font: "Bebas Neue", weight: 400, fill: C.fg })}
  </g>`;
}

/** Title band shared by every image, so the set reads as one system. */
function frame(W, H, { kicker, title, credit }) {
  return {
    head: `<rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect x="0" y="0" width="${W}" height="9" fill="${C.brass}"/>
  <text x="60" y="70" font-family="Barlow" font-weight="600" font-size="24" letter-spacing="4.8" fill="${C.brass}">${esc(kicker.toUpperCase())}</text>
  <text x="60" y="140" font-family="Bebas Neue" font-size="78" fill="${C.fg}">${esc(title)}</text>`,
    foot: `<rect x="0" y="${H - 64}" width="${W}" height="64" fill="${C.surface}"/>
  <rect x="0" y="${H - 64}" width="${W}" height="2" fill="${C.border}"/>
  <text x="60" y="${H - 24}" font-family="Barlow" font-weight="400" font-size="20" fill="${C.muted}">${esc(credit)}</text>
  <text x="${W - 60}" y="${H - 24}" text-anchor="end" font-family="Barlow" font-weight="600" font-size="22" letter-spacing="2" fill="${C.brassSoft}">montereybayevents.com</text>`,
  };
}

// ---------------------------------------------------------------------------
// Laguna Seca
// ---------------------------------------------------------------------------

const laguna = JSON.parse(readFileSync(join(ROOT, "data", "geo", "laguna-seca.osm.json"), "utf8"));
const LOOP = laguna.circuit; // race order; first point == last point
const byOsm = (id) => laguna.features.find((f) => f.osm === id);

/**
 * Turn positions as indices into LOOP (race order). Checked against the
 * raceway's facility map and Racing Lines flyer: T2 is the Andretti Hairpin,
 * 8/8A the Corkscrew, T9 Rainey Curve, T11 the slowest corner. `side` puts the
 * marker outside the circuit (+1 left of travel, -1 right).
 */
const TURNS = [
  { t: "1", i: 147, side: -1 },
  { t: "2", i: 163, side: -1 },
  { t: "3", i: 190, side: -1 },
  { t: "4", i: 202, side: -1 },
  { t: "5", i: 22, side: -1 },
  { t: "6", i: 46, side: -1 },
  { t: "7", i: 68, side: -1 },
  { t: "8", i: 76, side: -1 },
  { t: "8A", i: 83, side: 1 },
  { t: "9", i: 100, side: -1 },
  { t: "10", i: 115, side: -1 },
  { t: "11", i: 132, side: -1 },
];

/**
 * Bridges over the circuit: the OSM ways tagged bridge=yes that cross it, at
 * the loop index where they cross, matched by position to the five bridges the
 * raceway names on its facility map.
 */
const BRIDGES = [
  { i: 143, name: "Mission Foods start/finish bridge", short: "Start/finish bridge" },
  { i: 196, name: "Tire Rack foot bridge", short: "Tire Rack bridge" },
  { i: 9, name: "Montage foot bridge", short: "Montage bridge" },
  { i: 37, name: "Vehicle bridge", short: "Vehicle bridge" },
  { i: 89, name: "Corkscrew foot bridge", short: "Corkscrew bridge" },
];

function normalAt(pts, i, n = 2) {
  const a = pts[(i - n + pts.length - 1) % (pts.length - 1)];
  const b = pts[(i + n) % (pts.length - 1)];
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  // screen coords: left of travel is (dy, -dx)
  return { tx: dx / L, ty: dy / L, nx: dy / L, ny: -dx / L };
}

/**
 * `crop` is the phone version: same layers and labels, tighter extent around
 * the circuit, campgrounds and parking, so text stays legible at 800px. Served
 * through <picture> art direction; the full map stays the canonical <img>.
 */
function lagunaFacilityMap({ crop = false } = {}) {
  const W = crop ? 1200 : 2000, TOP = 170, FOOT = 64;
  const ext = crop
    ? { minLon: -121.7676, maxLon: -121.7446, minLat: 36.5772, maxLat: 36.5948 }
    : { minLon: -121.7675, maxLon: -121.7365, minLat: 36.5662, maxLat: 36.5952 };
  const { p, height, mpp } = projection({ ...ext, width: W, top: TOP });
  const H = TOP + height + FOOT;
  const P = (c) => p(c);
  const fr = frame(W, H, {
    kicker: "WeatherTech Raceway Laguna Seca",
    title: crop ? "Laguna Seca map — the circuit" : "Laguna Seca map — turns, gates, parking & camping",
    credit: crop
      ? "Map data © OpenStreetMap contributors (ODbL). Not the official raceway map."
      : "Map data © OpenStreetMap contributors (ODbL). Independent map — not the raceway's official facility map.",
  });
  const L = [];
  L.push(fr.head);
  L.push(`<clipPath id="mapclip"><rect x="0" y="${TOP}" width="${W}" height="${height}"/></clipPath>`);
  L.push(`<g clip-path="url(#mapclip)"><rect x="0" y="${TOP}" width="${W}" height="${height}" fill="${C.surface}"/>`);

  const feats = laguna.features;
  const poly = (f, fill, stroke, sw = 2) =>
    `<path d="${path(f.coords.map(P), true)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

  for (const f of feats.filter((f) => f.kind === "water")) L.push(poly(f, C.water, "none"));
  for (const f of feats.filter((f) => f.kind === "camping")) L.push(poly(f, C.camp, C.campEdge));
  for (const f of feats.filter((f) => f.kind === "parking")) {
    const general = f.osm === "way/60116214";
    L.push(poly(f, general ? "#3a3020" : C.parking, general ? C.brass : C.parkingEdge, general ? 3 : 2));
  }
  // roads, minor first
  const roadW = { trunk: 12, secondary: 8, unclassified: 6, residential: 4, service: 4, track: 3 };
  const roads = feats.filter((f) => f.kind === "road").sort((a, b) => (roadW[a.highway] ?? 3) - (roadW[b.highway] ?? 3));
  for (const f of roads) {
    const w = roadW[f.highway] ?? 3;
    const col = f.highway === "trunk" ? C.roadMajor : C.road;
    const dash = f.highway === "track" ? ` stroke-dasharray="10 8"` : "";
    L.push(`<path d="${path(f.coords.map(P))}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`);
  }
  for (const f of feats.filter((f) => f.kind === "path")) {
    L.push(`<path d="${path(f.coords.map(P))}" fill="none" stroke="${C.border}" stroke-width="2" stroke-dasharray="3 6"/>`);
  }
  for (const f of feats.filter((f) => f.kind === "grandstand")) L.push(poly(f, C.brassSoft, C.bg, 1));

  // pit lane, then circuit
  const pit = byOsm("way/109859349");
  if (pit) L.push(`<path d="${path(pit.coords.map(P))}" fill="none" stroke="#7d6c46" stroke-width="5" stroke-linecap="round"/>`);
  const loop = LOOP.map(P);
  L.push(`<path d="${path(loop, true)}" fill="none" stroke="#000" stroke-width="24" stroke-linejoin="round"/>`);
  L.push(`<path d="${path(loop, true)}" fill="none" stroke="${C.brass}" stroke-width="15" stroke-linejoin="round"/>`);

  // bridges
  for (const b of BRIDGES) {
    const [x, y] = loop[b.i];
    const { nx, ny } = normalAt(loop, b.i);
    const a = Math.atan2(ny, nx) * (180 / Math.PI);
    L.push(`<rect x="${(x - 24).toFixed(1)}" y="${(y - 5).toFixed(1)}" width="48" height="10" fill="${C.fg}" stroke="${C.bg}" stroke-width="2" transform="rotate(${a.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`);
  }
  // start/finish chequer across the track at the bridge
  {
    const i = 143, [x, y] = loop[i];
    const { nx, ny } = normalAt(loop, i);
    const a = Math.atan2(ny, nx) * (180 / Math.PI);
    L.push(`<g transform="rotate(${a.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}) translate(${(x - 12).toFixed(1)} ${(y + 8).toFixed(1)})">
      ${[0, 1, 2, 3].map((k) => `<rect x="${k * 6}" y="0" width="6" height="6" fill="${k % 2 ? C.fg : "#000"}"/><rect x="${k * 6}" y="6" width="6" height="6" fill="${k % 2 ? "#000" : C.fg}"/>`).join("")}
    </g>`);
  }
  // turn markers
  for (const t of TURNS) {
    const [x, y] = loop[t.i];
    const { nx, ny } = normalAt(loop, t.i, 3);
    const d = 46 * t.side;
    const cx = x + nx * d, cy = y + ny * d;
    L.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="24" fill="${C.bg}" stroke="${C.brass}" stroke-width="4"/>`);
    L.push(`<text x="${cx.toFixed(1)}" y="${(cy + 11).toFixed(1)}" text-anchor="middle" font-family="Bebas Neue" font-size="${t.t.length > 1 ? 28 : 32}" fill="${C.brass}">${t.t}</text>`);
  }
  L.push(`</g>`);

  // ---- labels (positions from features, offsets tuned by eye) ----
  const at = (osm) => centroid(byOsm(osm).coords.map(P));
  const ll = (lat, lon) => P([lat, lon]);
  const lab = [];
  const named = (osm, lines, o = {}) => {
    const [x, y] = at(osm);
    lab.push(multiline(x + (o.dx ?? 0), y + (o.dy ?? 0), lines, { size: o.size ?? 22, fill: o.fill ?? C.fg, ...o }));
  };
  // corners
  const onLoop = (i, dx, dy, lines, o = {}) => {
    const [x, y] = loop[i];
    lab.push(multiline(x + dx, y + dy, lines, { size: 24, fill: C.brassSoft, ...o }));
  };
  onLoop(163, -40, 92, ["ANDRETTI HAIRPIN"], { anchor: "start" });
  onLoop(79, 72, -6, ["THE CORKSCREW", "Turns 8 & 8A"], { anchor: "start" });
  onLoop(100, 60, -50, ["RAINEY CURVE"], { anchor: "start" });
  onLoop(60, 70, 0, ["RAHAL", "STRAIGHT"], { anchor: "start" });

  // bridges
  const bl = { 143: [34, 18, "start"], 196: [30, -16, "start"], 9: [44, 28, "start"], 37: [0, 56, "middle"], 89: [52, 8, "start"] };
  for (const b of BRIDGES) {
    const [x, y] = loop[b.i];
    const [dx, dy, anchor] = bl[b.i];
    lab.push(label(x + dx, y + dy, b.short, { size: 19, fill: C.fg, weight: 400, anchor }));
  }

  named("way/639889267", ["PADDOCK"], { size: 28, dy: -36, fill: C.fg });
  named("way/60116195", ["LAKEBED", "Preferred parking", "(Green Lakebed)"], { size: 20, dy: 46, dx: -6, fill: "#9cc3d6" });
  named("way/60116214", ["GENERAL PARKING", "Purple 10 · no overnight"], { size: 24, fill: C.brass, dy: -64, dx: -30 });
  named("way/220990675", ["GENERAL", "CAMPING"], { size: 22, fill: "#a9c48d" });
  named("way/220990673", ["CORKSCREW", "CAMPING"], { size: 20, fill: "#a9c48d", dx: 70, dy: -24 });
  named("way/220990679", ["TERRACE", "CAMPING"], { size: 20, fill: "#a9c48d", dx: 100, dy: 22 });
  named("way/220990670", ["“A” CAMP", "Grand Prix"], { size: 21, fill: "#a9c48d", dx: 40, dy: 40 });
  named("way/220990671", ["“B” CAMP", "Chaparral"], { size: 21, fill: "#a9c48d", dx: -70, dy: 10 });
  // Fox Hill: the raceway's Event Camping Guide marks it "(motorcycle events only)".
  named("way/220990674", ["FOX HILL", "motorcycle events"], { size: 18, fill: "#a9c48d", dy: 50 });

  // Grandstands: the raceway's ticket page puts its uncovered grandstands
  // "near Turn 4 and Turn 11". Label each OSM grandstand cluster by whichever
  // of those two turns it is nearest.
  {
    const stands = feats.filter((f) => f.kind === "grandstand").map((f) => centroid(f.coords.map(P)));
    const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    const t4 = loop[202], t11 = loop[132];
    const near4 = stands.filter((c) => d(c, t4) < d(c, t11));
    const near11 = stands.filter((c) => d(c, t11) <= d(c, t4));
    if (near4.length) { const [x, y] = centroid(near4); lab.push(label(x + 22, y + 6, "Grandstand · T4", { size: 19, fill: C.brassSoft, anchor: "start" })); }
    if (near11.length) { const [x, y] = centroid(near11); lab.push(label(x - 22, y + 6, "Grandstands · T11", { size: 19, fill: C.brassSoft, anchor: "end" })); }
  }

  // will call + entrances
  {
    const wc = byOsm("node/13018506248");
    const [x, y] = P(wc.coords[0]);
    lab.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="${C.brass}" stroke="${C.bg}" stroke-width="3"/>`);
    lab.push(multiline(x, y + 40, ["WILL CALL", "event-day entrance", "S Boundary Rd"], { size: 21, fill: C.brass }));
  }
  {
    // Highway 68 entrance: where A Road and B Road meet CA 68 in OSM. The
    // raceway's camping rules put camper check-in "at the bottom of A-Road off
    // of HWY 68 (main entrance)".
    const [x, y] = ll(36.5705, -121.7619);
    lab.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="${C.brass}" stroke="${C.bg}" stroke-width="3"/>`);
    lab.push(multiline(x + 22, y - 40, ["HWY 68 ENTRANCE", "camper check-in, A Road"], { size: 21, fill: C.brass, anchor: "start" }));
  }
  {
    const [x, y] = ll(36.5745, -121.7445);
    lab.push(label(x, y - 22, "CA 68 · toward Salinas", { size: 20, fill: C.muted, rotate: -14 }));
    const [x2, y2] = ll(36.5683, -121.7665);
    lab.push(label(x2, y2 - 22, "CA 68 · toward Monterey", { size: 20, fill: C.muted, anchor: "start", rotate: 6 }));
  }
  {
    const [x, y] = ll(36.5874, -121.7655);
    lab.push(label(x, y, "SOUTH BOUNDARY RD", { size: 18, fill: C.muted, rotate: -8 }));
    const [x3, y3] = ll(36.5742, -121.7592);
    lab.push(label(x3, y3, "“A” ROAD", { size: 17, fill: C.muted, rotate: -40 }));
  }
  if (crop) {
    // CA 68 and its entrance fall outside the crop: say where they are instead.
    lab.push(label(W / 2, TOP + height - 24, "Hwy 68 entrance and camper check-in: south, via A Road (see full map)", { size: 22, fill: C.brass }));
  }
  L.push(`<g clip-path="url(#mapclip)">${lab.join("\n")}</g>`);

  // legend (full map only — the crop has no room, and the page carries it)
  if (!crop) {
    const x = W - 520, y = TOP + 30;
    L.push(`<rect x="${x}" y="${y}" width="480" height="300" fill="${C.bg}" fill-opacity="0.92" stroke="${C.border}" stroke-width="2"/>`);
    const row = (i, sw, text) =>
      `<g transform="translate(${x + 24} ${y + 40 + i * 42})">${sw}${label(64, 8, text, { size: 20, anchor: "start", weight: 400 })}</g>`;
    L.push(row(0, `<rect x="0" y="-4" width="44" height="12" fill="${C.brass}" stroke="#000" stroke-width="3"/>`, "Circuit, 2.238 mi — turns numbered in race order"));
    L.push(row(1, `<circle cx="22" cy="2" r="14" fill="${C.bg}" stroke="${C.brass}" stroke-width="3"/>`, "Turn number"));
    L.push(row(2, `<rect x="10" y="-4" width="24" height="10" fill="${C.fg}"/>`, "Bridge over the track"));
    L.push(row(3, `<rect x="0" y="-8" width="44" height="20" fill="${C.camp}" stroke="${C.campEdge}" stroke-width="2"/>`, "Camping area"));
    L.push(row(4, `<rect x="0" y="-8" width="44" height="20" fill="${C.parking}" stroke="${C.parkingEdge}" stroke-width="2"/>`, "Parking"));
    L.push(row(5, `<rect x="0" y="-8" width="44" height="20" fill="${C.brassSoft}"/>`, "Grandstand"));
    L.push(row(6, `<path d="M0,2 L44,2" stroke="${C.road}" stroke-width="6"/>`, "Road (dashed: dirt track)"));
  }
  L.push(northArrow(90, TOP + 70));
  L.push(scaleBar(60, TOP + height - 50, mpp, 402.336, "¼ mile"));
  L.push(fr.foot);
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${L.join("\n")}</svg>`, W, H };
}

function lagunaTrackMap() {
  // Circuit only, large: the "where is Turn 6" diagram.
  const W = 1600, TOP = 170, FOOT = 64;
  const lats = LOOP.map((c) => c[0]), lons = LOOP.map((c) => c[1]);
  const padLat = 0.0018, padLon = 0.0024;
  const { p, height, mpp } = projection({
    minLon: Math.min(...lons) - padLon, maxLon: Math.max(...lons) + padLon * 2.2,
    minLat: Math.min(...lats) - padLat, maxLat: Math.max(...lats) + padLat, width: W, top: TOP,
  });
  const H = TOP + height + FOOT;
  const fr = frame(W, H, {
    kicker: "WeatherTech Raceway Laguna Seca · 2.238 miles",
    title: "Laguna Seca track map — all 11 turns",
    credit: "Circuit geometry © OpenStreetMap contributors (ODbL). Turn facts: WeatherTech Raceway Laguna Seca.",
  });
  const loop = LOOP.map(p);
  const L = [fr.head];
  const pit = byOsm("way/109859349");
  if (pit) L.push(`<path d="${path(pit.coords.map(p))}" fill="none" stroke="#7d6c46" stroke-width="6" stroke-linecap="round"/>`);
  L.push(`<path d="${path(loop, true)}" fill="none" stroke="#000" stroke-width="34" stroke-linejoin="round"/>`);
  L.push(`<path d="${path(loop, true)}" fill="none" stroke="${C.brass}" stroke-width="22" stroke-linejoin="round"/>`);
  // direction arrows along straights
  for (const i of [30, 62, 120, 148, 180]) {
    const [x, y] = loop[i];
    const { tx, ty } = normalAt(loop, i);
    const a = Math.atan2(ty, tx) * (180 / Math.PI);
    L.push(`<path d="M-12,-9 L10,0 L-12,9 Z" fill="${C.bg}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})"/>`);
  }
  for (const b of BRIDGES) {
    const [x, y] = loop[b.i];
    const { nx, ny } = normalAt(loop, b.i);
    const a = Math.atan2(ny, nx) * (180 / Math.PI);
    L.push(`<rect x="${(x - 30).toFixed(1)}" y="${(y - 6).toFixed(1)}" width="60" height="12" fill="${C.fg}" stroke="${C.bg}" stroke-width="2" transform="rotate(${a.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`);
  }
  for (const t of TURNS) {
    const [x, y] = loop[t.i];
    const { nx, ny } = normalAt(loop, t.i, 3);
    const d = 62 * t.side;
    const cx = x + nx * d, cy = y + ny * d;
    L.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="32" fill="${C.bg}" stroke="${C.brass}" stroke-width="5"/>`);
    L.push(`<text x="${cx.toFixed(1)}" y="${(cy + 15).toFixed(1)}" text-anchor="middle" font-family="Bebas Neue" font-size="${t.t.length > 1 ? 36 : 42}" fill="${C.brass}">${t.t}</text>`);
  }
  const on = (i, dx, dy, lines, o = {}) => {
    const [x, y] = loop[i];
    L.push(multiline(x + dx, y + dy, lines, { size: 30, fill: C.fg, ...o }));
  };
  on(163, -30, 120, ["ANDRETTI HAIRPIN"], { anchor: "start", fill: C.brassSoft });
  on(79, 90, -20, ["THE CORKSCREW · 8 & 8A", "drops 59 ft in 450 ft of track"], { anchor: "start", fill: C.brassSoft, size: 28 });
  on(100, 70, -24, ["RAINEY CURVE"], { anchor: "start", fill: C.brassSoft });
  on(58, 92, 10, ["RAHAL STRAIGHT"], { anchor: "start", fill: C.brassSoft });
  on(143, -66, -10, ["START / FINISH"], { anchor: "end", fill: C.fg, size: 26 });
  on(150, -60, 40, ["PIT LANE"], { anchor: "end", fill: "#b9a67a", size: 22 });
  on(132, 60, 30, ["slowest corner"], { anchor: "start", fill: C.muted, size: 22 });
  // spectator notes from the raceway's ticket page
  {
    const x = W - 600, y = TOP + 10;
    L.push(`<rect x="${x}" y="${y}" width="560" height="220" fill="${C.surface}" stroke="${C.border}" stroke-width="2"/>`);
    L.push(multiline(x + 24, y + 44, [
      "Where general admission can watch",
      "· Grandstands at Turn 4 and Turn 11",
      "· Hillside at Turn 2 (Andretti Hairpin)",
      "· Hillside at Turn 8 (the Corkscrew)",
      "Arrows show the direction of racing.",
    ], { size: 24, anchor: "start", weight: 400, fill: C.fg }));
  }
  L.push(northArrow(90, TOP + 70));
  L.push(scaleBar(60, TOP + height - 50, mpp, 402.336, "¼ mile"));
  L.push(fr.foot);
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${L.join("\n")}</svg>`, W, H };
}

// ---------------------------------------------------------------------------
// Car Week venue map
// ---------------------------------------------------------------------------

const pen = JSON.parse(readFileSync(join(ROOT, "data", "geo", "monterey-peninsula.osm.json"), "utf8"));
const { mapVenues, titlesAt } = await import("../src/data/carWeekVenues.ts");

/** Spread overlapping pins apart, tethered to their true point. Deterministic. */
function relax(points, minDist, iters = 400) {
  const pos = points.map((p) => [...p]);
  for (let k = 0; k < iters; k++) {
    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[j][0] - pos[i][0], dy = pos[j][1] - pos[i][1];
        const d = Math.hypot(dx, dy) || 0.01;
        if (d < minDist) {
          const push = (minDist - d) / 2;
          const ux = dx / d || 1, uy = dy / d;
          pos[i][0] -= ux * push; pos[i][1] -= uy * push;
          pos[j][0] += ux * push; pos[j][1] += uy * push;
        }
      }
      // spring back toward the true point
      pos[i][0] += (points[i][0] - pos[i][0]) * 0.02;
      pos[i][1] += (points[i][1] - pos[i][1]) * 0.02;
    }
  }
  return pos;
}

/**
 * The map is 2000px wide; the venue key is a sidebar beside it, not an
 * overlay, because every corner of this map has a pin or a coastline in it.
 * `mobile` drops the sidebar (the page's HTML list is the key on a phone) and
 * the Carmel Valley Village corner, so pins stay legible at 800px.
 */
function carWeekMap({ mobile = false } = {}) {
  const MW = mobile ? 1400 : 2000, SIDE = mobile ? 0 : 640, W = MW + SIDE, TOP = 170, FOOT = 64;
  const { p, height, mpp } = projection({
    ...(mobile
      ? { minLon: -121.982, maxLon: -121.735, minLat: 36.515, maxLat: 36.645 }
      : { minLon: -121.985, maxLon: -121.715, minLat: 36.468, maxLat: 36.648 }),
    width: MW, top: TOP,
  });
  const H = TOP + height + FOOT;
  const fr = frame(W, H, {
    kicker: "Monterey Car Week · venue map",
    title: mobile ? "Monterey Car Week map" : "Monterey Car Week map — where every event happens",
    credit: mobile
      ? "Map data © OpenStreetMap contributors (ODbL). Pin 24 (Carmel Valley) is off this view."
      : "Map data © OpenStreetMap contributors (ODbL). Pins: venues as published by each event's organiser.",
  });
  const L = [fr.head];
  L.push(`<clipPath id="cw"><rect x="0" y="${TOP}" width="${MW}" height="${height}"/></clipPath><g clip-path="url(#cw)">`);
  L.push(`<rect x="0" y="${TOP}" width="${MW}" height="${height}" fill="${C.sea}"/>`);
  // Land: the mainland coastline runs north→south with land on its LEFT (OSM
  // convention), i.e. to the east — close it round the east side of the frame.
  const coast = pen.coast.map(p);
  const first = coast[0], last = coast[coast.length - 1];
  const land = [...coast, [last[0], H + 4000], [W + 4000, H + 4000], [W + 4000, first[1] - 4000], [first[0], first[1] - 4000]];
  L.push(`<path d="${path(land, true)}" fill="${C.surface}" stroke="${C.seaEdge}" stroke-width="3"/>`);
  for (const isl of pen.islands) L.push(`<path d="${path(isl.map(p), true)}" fill="${C.surface}" stroke="${C.seaEdge}" stroke-width="1"/>`);
  const major = (r) => /\bCA (1|68|218)\b/.test(r.ref);
  for (const r of pen.roads.filter((r) => !major(r))) {
    L.push(`<path d="${path(r.coords.map(p))}" fill="none" stroke="${C.road}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  for (const r of pen.roads.filter(major)) {
    L.push(`<path d="${path(r.coords.map(p))}" fill="none" stroke="${C.roadMajor}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  // water + place labels
  const ll = (lat, lon) => p([lat, lon]);
  const water = [
    [36.635, -121.865, "MONTEREY BAY", "middle"], [36.538, -121.953, "CARMEL BAY", "middle"], [36.60, -121.978, "PACIFIC OCEAN", "start"],
  ];
  for (const [la, lo, t, anchor] of water) { const [x, y] = ll(la, lo); L.push(label(x, y, t, { size: 30, fill: "#4f7486", font: "Bebas Neue", weight: 400, spacing: 6, halo: C.sea, anchor })); }
  // Place names sit at their OSM place node; nudged where a pin lands on top.
  const nudge = { Monterey: [-70, -48], "Carmel Valley": [0, -54], "Monterey Regional Airport": [40, 58], "Carmel-by-the-Sea": [-10, -46] };
  for (const pl of pen.places) {
    const [x, y] = ll(pl.lat, pl.lon);
    const air = pl.kind === "airport";
    const [dx, dy] = nudge[pl.name] ?? [0, -26];
    L.push(label(x + dx, y + dy, pl.name.toUpperCase(), { size: air ? 18 : 24, fill: air ? C.muted : "#cfc8bd", spacing: 2, halo: C.surface }));
  }
  // road shields
  const shield = (lat, lon, t) => { const [x, y] = ll(lat, lon); return `<rect x="${x - 30}" y="${y - 17}" width="60" height="30" rx="4" fill="${C.raised}" stroke="${C.roadMajor}" stroke-width="2"/>${label(x, y + 6, t, { size: 18, fill: C.fg, halo: C.raised })}`; };
  L.push(shield(36.573, -121.9155, "CA 1"), shield(36.5935, -121.8585, "CA 68"), shield(36.6045, -121.8335, "CA 218"), shield(36.5785, -121.795, "CA 68"));
  // pins
  const truePts = mapVenues.map((v) => p([v.lat, v.lon]));
  const pinPts = relax(truePts, mobile ? 40 : 46);
  mapVenues.forEach((v, i) => {
    const [tx, ty] = truePts[i], [x, y] = pinPts[i];
    if (Math.hypot(x - tx, y - ty) > 6) L.push(`<path d="M${tx.toFixed(1)},${ty.toFixed(1)} L${x.toFixed(1)},${y.toFixed(1)}" stroke="${C.brassSoft}" stroke-width="2"/>`);
    L.push(`<circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="4" fill="${C.brassSoft}"/>`);
    L.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="21" fill="${C.brass}" stroke="${C.bg}" stroke-width="3"/>`);
    L.push(`<text x="${x.toFixed(1)}" y="${(y + 10).toFixed(1)}" text-anchor="middle" font-family="Bebas Neue" font-size="${v.n > 9 ? 27 : 30}" fill="${C.bg}">${v.n}</text>`);
  });
  L.push(`</g>`);
  // venue key, as a sidebar
  if (!mobile) {
    const x = MW, y = TOP, rows = mapVenues.length;
    const rh = Math.min(40, Math.floor((height - 110) / rows));
    L.push(`<rect x="${x}" y="${y}" width="${SIDE}" height="${height}" fill="${C.bg}"/>`);
    L.push(`<rect x="${x}" y="${y}" width="2" height="${height}" fill="${C.border}"/>`);
    L.push(label(x + 36, y + 56, "VENUES", { size: 32, anchor: "start", font: "Bebas Neue", weight: 400, fill: C.brass, spacing: 3 }));
    mapVenues.forEach((v, i) => {
      const cy = y + 104 + i * rh;
      const n = titlesAt(v).length;
      L.push(`<circle cx="${x + 52}" cy="${cy - 8}" r="16" fill="${C.brass}"/>`);
      L.push(`<text x="${x + 52}" y="${cy}" text-anchor="middle" font-family="Bebas Neue" font-size="22" fill="${C.bg}">${v.n}</text>`);
      L.push(`<text x="${x + 80}" y="${cy}" font-family="Barlow" font-size="22" fill="${C.fg}">${esc(v.label)}<tspan fill="${C.muted}"> · ${n}</tspan></text>`);
    });
  }
  L.push(northArrow(MW - 80, TOP + 70));
  L.push(scaleBar(MW - 420, TOP + height - 50, mpp, 3218.69, "2 miles"));
  L.push(fr.foot);
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${L.join("\n")}</svg>`, W, H };
}

// ---------------------------------------------------------------------------
// Events calendar — one printable month grid per month in the dataset
// ---------------------------------------------------------------------------

const cal = await import("../src/lib/calendar.ts");

function monthPoster(m) {
  const W = 1600, TOP = 170, FOOT = 64;
  const grid = cal.monthGrid(m.key);
  const cols = 7, cw = (W - 80) / cols, hh = 44;
  const weeks = grid.weeks.length;
  const ch = 168;
  const gridTop = TOP + 30;
  const longRuns = grid.longRuns;
  const extra = 70 + Math.max(1, longRuns.length) * 32 + (grid.undated.length ? 50 + grid.undated.length * 30 : 0);
  const H = gridTop + hh + weeks * ch + extra + FOOT + 20;
  const fr = frame(W, H, {
    kicker: "Monterey & Santa Cruz counties",
    title: `Monterey events calendar — ${m.label}`,
    credit: "Dates as published by each organiser. Details and links: montereybayevents.com/monterey-events-calendar/",
  });
  const L = [fr.head];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  days.forEach((d, i) => L.push(label(40 + i * cw + cw / 2, gridTop + 30, d.toUpperCase(), { size: 20, fill: C.brass, spacing: 3 })));
  grid.weeks.forEach((wk, r) => {
    wk.forEach((cell, c) => {
      const x = 40 + c * cw, y = gridTop + hh + r * ch;
      L.push(`<rect x="${x + 2}" y="${y + 2}" width="${cw - 4}" height="${ch - 4}" fill="${cell.inMonth ? C.surface : C.bg}" stroke="${C.border}" stroke-width="1"/>`);
      if (!cell.inMonth) return;
      L.push(`<text x="${x + 14}" y="${y + 34}" font-family="Bebas Neue" font-size="30" fill="${cell.events.length ? C.brass : C.muted}">${cell.day}</text>`);
      const shown = cell.events.slice(0, 4);
      shown.forEach((e, k) => {
        const name = cal.shortName(e, 24);
        L.push(`<text x="${x + 14}" y="${y + 64 + k * 25}" font-family="Barlow" font-weight="${e.county === "Santa Cruz" ? 400 : 600}" font-size="17" fill="${e.county === "Santa Cruz" ? "#9cc3d6" : C.fg}">${esc(name)}</text>`);
      });
      if (cell.events.length > 4) L.push(`<text x="${x + 14}" y="${y + 64 + 4 * 25}" font-family="Barlow" font-size="16" fill="${C.muted}">+${cell.events.length - 4} more</text>`);
    });
  });
  let y = gridTop + hh + weeks * ch + 50;
  L.push(`<text x="40" y="${y}" font-family="Barlow" font-size="19" fill="${C.fg}" font-weight="600">Monterey County</text><text x="210" y="${y}" font-family="Barlow" font-size="19" fill="#9cc3d6">Santa Cruz County</text>`);
  if (longRuns.length) {
    y += 40;
    L.push(`<text x="40" y="${y}" font-family="Barlow" font-weight="600" font-size="20" fill="${C.brass}">RUNNING FOR MORE THAN A WEEK</text>`);
    for (const e of longRuns) { y += 32; L.push(`<text x="40" y="${y}" font-family="Barlow" font-size="19" fill="${C.fg}">${esc(e.name)} <tspan fill="${C.muted}">· ${esc(e.dateText)} · ${esc(e.city ?? e.cityText)}</tspan></text>`); }
  }
  if (grid.undated.length) {
    y += 46;
    L.push(`<text x="40" y="${y}" font-family="Barlow" font-weight="600" font-size="20" fill="${C.brass}">DATE NOT YET ANNOUNCED</text>`);
    for (const e of grid.undated) { y += 30; L.push(`<text x="40" y="${y}" font-family="Barlow" font-size="19" fill="${C.fg}">${esc(e.name)} <tspan fill="${C.muted}">· ${esc(e.city ?? e.cityText)}</tspan></text>`); }
  }
  L.push(fr.foot);
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${L.join("\n")}</svg>`, W, H };
}

function calendarOg() {
  const W = 1200, H = 630;
  const months = cal.monthGrids;
  const total = new Set(months.flatMap((g) => g.dated.map((e) => e.slug))).size;
  const cells = months.map((g, i) => {
    const x = 80 + i * 212;
    return `<rect x="${x}" y="300" width="196" height="150" fill="${C.surface}" stroke="${C.border}" stroke-width="2"/>
      <text x="${x + 18}" y="350" font-family="Bebas Neue" font-size="40" fill="${C.brass}">${esc(g.label.split(" ")[0].slice(0, 3).toUpperCase())}</text>
      <text x="${x + 18}" y="420" font-family="Bebas Neue" font-size="64" fill="${C.fg}">${g.dated.length}</text>
      <text x="${x + 96}" y="420" font-family="Barlow" font-size="20" fill="${C.muted}">events</text>`;
  }).join("");
  return { W, H, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${C.bg}"/><rect x="0" y="0" width="${W}" height="9" fill="${C.brass}"/>
  <text x="80" y="110" font-family="Barlow" font-weight="600" font-size="26" letter-spacing="5.2" fill="${C.brass}">MONTEREY &amp; SANTA CRUZ COUNTIES</text>
  <text x="80" y="230" font-family="Bebas Neue" font-size="112" fill="${C.fg}">Monterey events calendar</text>
  ${cells}
  <text x="80" y="556" font-family="Barlow" font-size="30" fill="${C.muted}">${total} dated events · August–December 2026</text>
  <text x="${W - 80}" y="556" text-anchor="end" font-family="Barlow" font-weight="600" font-size="26" letter-spacing="2.4" fill="${C.brassSoft}">montereybayevents.com</text>
</svg>` };
}

// ---------------------------------------------------------------------------
// Open Graph cards: 1200x630 crops of the primary visual
// ---------------------------------------------------------------------------

async function ogFromPng(png) {
  return sharp(png).resize(1200, 630, { fit: "cover", position: "centre" }).png({ compressionLevel: 9 }).toBuffer();
}

// ---------------------------------------------------------------------------
// targets + write
// ---------------------------------------------------------------------------

/** `widths` are the WebP sizes each page's srcset uses; the PNG is full-size. */
const targets = [
  { name: "laguna-seca-map-turns-parking-camping", make: lagunaFacilityMap, widths: [800, 1400, 2000], og: "og-laguna-seca-map" },
  { name: "laguna-seca-map-circuit-mobile", make: () => lagunaFacilityMap({ crop: true }), widths: [800, 1200] },
  { name: "laguna-seca-track-map-turn-numbers", make: lagunaTrackMap, widths: [800, 1600] },
  { name: "monterey-car-week-map-venues", make: () => carWeekMap(), widths: [800, 1400, 2000], og: "og-monterey-car-week-map" },
  { name: "monterey-car-week-map-venues-mobile", make: () => carWeekMap({ mobile: true }), widths: [800, 1400] },
  ...cal.MONTHS.map((m, i) => ({
    name: `monterey-events-calendar-${m.key}-2026`,
    make: () => monthPoster(m),
    widths: [800, 1600],
  })),
  { name: "og-monterey-events-calendar", make: calendarOg, widths: [] },
];

const check = process.argv.includes("--check");
mkdirSync(OUT, { recursive: true });

const stale = [];
const manifest = {};
for (const t of targets) {
  const { svg, W, H } = t.make();
  const png = renderPng(svg, W);
  const pngPath = join(OUT, `${t.name}.png`);
  manifest[t.name] = { width: W, height: H, widths: t.widths };
  if (check) {
    if (!existsSync(pngPath) || !readFileSync(pngPath).equals(png)) stale.push(`${t.name}.png`);
    for (const w of t.widths) if (!existsSync(join(OUT, `${t.name}-${w}.webp`))) stale.push(`${t.name}-${w}.webp`);
    continue;
  }
  writeFileSync(pngPath, png);
  console.log(`✓ ${t.name}.png  ${W}×${H}  ${(png.length / 1024).toFixed(0)} KB`);
  for (const w of t.widths) {
    const webp = await sharp(png).resize({ width: w }).webp({ quality: 82, effort: 5 }).toBuffer();
    writeFileSync(join(OUT, `${t.name}-${w}.webp`), webp);
    console.log(`  ✓ ${t.name}-${w}.webp  ${(webp.length / 1024).toFixed(0)} KB`);
  }
  if (t.og) {
    const og = await ogFromPng(png);
    writeFileSync(join(OUT, `${t.og}.png`), og);
    console.log(`  ✓ ${t.og}.png  1200×630`);
  }
}

// Dimensions for the pages' width/height attributes — derived, never typed.
const manifestPath = join(ROOT, "src", "data", "mapImages.json");
const manifestJson = JSON.stringify(manifest, null, 2) + "\n";
if (check) {
  if (!existsSync(manifestPath) || readFileSync(manifestPath, "utf8") !== manifestJson) stale.push("src/data/mapImages.json");
  if (stale.length) {
    console.error(`✗ ${stale.length} map image(s) stale or missing — run \`make maps\`:`);
    for (const s of stale) console.error(`    ${s}`);
    process.exit(1);
  }
  console.log(`✓ ${targets.length} map images current`);
} else {
  writeFileSync(manifestPath, manifestJson);
  console.log(`✓ wrote ${targets.length} images + src/data/mapImages.json`);
}
