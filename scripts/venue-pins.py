"""Fill lat/lon/osm for data/event-venues.json from OSM Nominatim (1 req/s).

Run: uv run --no-project python scripts/venue-pins.py
Only venues with no lat. Records the OSM object so the pin can be re-checked.
Bounded to the Monterey Bay viewbox, like scripts/geocode-places.py.
"""
import json, time, urllib.parse, urllib.request

P = "data/event-venues.json"
d = json.load(open(P))
UA = {"User-Agent": "montereybayevents-geocoder/1.0"}
for key, v in d["venues"].items():
    if v.get("lat") is not None:
        continue
    q = urllib.parse.urlencode({"q": v["query"], "format": "jsonv2", "limit": 1, "countrycodes": "us",
                                "viewbox": "-122.5,37.3,-121.3,35.8", "bounded": 1})
    r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://nominatim.openstreetmap.org/search?{q}", headers=UA)))
    time.sleep(1.1)
    if not r:
        print(f"✗ {key}: no result for {v['query']!r}", flush=True)
        continue
    v["lat"], v["lon"] = round(float(r[0]["lat"]), 5), round(float(r[0]["lon"]), 5)
    v["osm"] = f"OSM {r[0]['osm_type']}/{r[0]['osm_id']} ({r[0]['display_name'][:80]})"
    print(f"✓ {key}: {v['lat']},{v['lon']}  ← {v['osm']}", flush=True)
json.dump(d, open(P, "w"), indent=2, ensure_ascii=False)
open(P, "a").write("\n")
