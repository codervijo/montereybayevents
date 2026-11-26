"""Fetch OpenStreetMap geometry around each event venue for the venue maps (v2.Z / v2.Y).

Run: uv run --no-project python scripts/fetch-venue-geo.py [carweek-venues.json]
Reads data/event-venues.json (+ optional Car Week pin list: [{id,lat,lon}]) and
writes data/geo/venues/<key>.json for every venue that has none yet.
Data © OpenStreetMap contributors, ODbL; credited on every rendered map.
Kept small: only what the maps draw (roads, water, coast, parks, beaches,
runways, buildings for small radii), coordinates rounded to 5 dp.
"""
import json, math, os, sys, time, urllib.parse, urllib.request

OUT = "data/geo/venues"
UA = {"User-Agent": "montereybayevents-maps/1.0"}
API = "https://overpass-api.de/api/interpreter"

def bbox(lat, lon, r):
    dlat = r / 111_000 * 0.75
    dlon = r / (111_000 * math.cos(math.radians(lat)))
    return lat - dlat, lon - dlon, lat + dlat, lon + dlon

def kind(t):
    if "highway" in t:
        h = t["highway"]
        if h in ("motorway", "trunk", "primary", "motorway_link", "trunk_link", "primary_link"): return "road1"
        if h in ("secondary", "tertiary", "secondary_link", "tertiary_link", "raceway"): return "road2"
        if h in ("residential", "unclassified", "living_street", "service", "pedestrian", "road"): return "road3"
        if h in ("footway", "path", "cycleway", "steps", "track", "bridleway"): return "path"
        return None
    if t.get("natural") == "coastline": return "coast"
    if t.get("natural") == "water" or "water" in t or t.get("waterway") in ("riverbank",): return "water"
    if t.get("waterway") in ("river", "stream", "canal"): return "stream"
    if t.get("natural") in ("beach", "sand"): return "beach"
    if t.get("leisure") in ("park", "golf_course", "pitch", "garden", "nature_reserve", "playground") or t.get("landuse") in ("grass", "recreation_ground", "meadow", "forest") or t.get("natural") == "wood": return "green"
    if t.get("aeroway") in ("runway", "taxiway"): return "runway"
    if t.get("railway") in ("rail", "light_rail", "narrow_gauge"): return "rail"
    if t.get("man_made") == "pier": return "pier"
    if "building" in t: return "building"
    return None

def fetch(key, lat, lon, r):
    s, w, n, e = bbox(lat, lon, r)
    b = f"{s:.5f},{w:.5f},{n:.5f},{e:.5f}"
    bld = f'way["building"]({b});' if r <= 700 else ""
    q = f"""[out:json][timeout:90];(
      way["highway"]({b}); way["natural"~"coastline|water|beach|sand|wood"]({b}); relation["natural"="water"]({b});
      way["waterway"]({b}); way["water"]({b}); way["leisure"~"park|golf_course|pitch|garden|nature_reserve|playground"]({b});
      way["landuse"~"grass|recreation_ground|meadow|forest"]({b}); way["aeroway"~"runway|taxiway"]({b});
      way["railway"~"rail|light_rail|narrow_gauge"]({b}); way["man_made"="pier"]({b}); {bld}
    );out geom;"""
    for attempt in range(4):
        try:
            req = urllib.request.Request(API, data=urllib.parse.urlencode({"data": q}).encode(), headers=UA)
            raw = json.load(urllib.request.urlopen(req, timeout=120))
            break
        except Exception as ex:
            print(f"↷ {key}: {ex} (retry {attempt + 1})", flush=True); time.sleep(10 * (attempt + 1))
    else:
        print(f"✗ {key}: Overpass failed", flush=True); return
    feats = []
    for el in raw["elements"]:
        t = el.get("tags", {}); k = kind(t)
        if not k: continue
        geoms = [el["geometry"]] if "geometry" in el else [m["geometry"] for m in el.get("members", []) if "geometry" in m]
        for g in geoms:
            pts = [[round(p["lat"], 5), round(p["lon"], 5)] for p in g]
            if len(pts) < 2: continue
            f = {"k": k, "g": pts}
            if t.get("name") and k.startswith("road"): f["n"] = t["name"]
            feats.append(f)
    json.dump({"key": key, "center": [lat, lon], "radius": r, "bbox": [s, w, n, e],
               "credit": "© OpenStreetMap contributors, ODbL", "fetched": time.strftime("%Y-%m-%d"),
               "features": feats}, open(f"{OUT}/{key}.json", "w"), separators=(",", ":"))
    print(f"✓ {key}: {len(feats)} features, {os.path.getsize(f'{OUT}/{key}.json')//1024} KB", flush=True)

os.makedirs(OUT, exist_ok=True)
todo = {k: (v["lat"], v["lon"], v.get("radius", 500)) for k, v in json.load(open("data/event-venues.json"))["venues"].items()}
if len(sys.argv) > 1:
    for v in json.load(open(sys.argv[1])):
        todo.setdefault(v["id"], (v["lat"], v["lon"], 1600 if v["id"] == "laguna-seca" else 550))
for key, (lat, lon, r) in todo.items():
    if os.path.exists(f"{OUT}/{key}.json"): continue
    fetch(key, lat, lon, r); time.sleep(3)
