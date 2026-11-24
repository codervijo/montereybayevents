"""Fill lat/lng in data/holiday-lights-2026.json from OSM Nominatim (1 req/s).
Run: uv run --no-project python scripts/geocode-lights.py  (only entries with no lat)."""
import json, time, urllib.parse, urllib.request, sys
P = "data/holiday-lights-2026.json"
d = json.load(open(P))
UA = {"User-Agent": "montereybayevents-geocoder/1.0"}
for e in d["entries"]:
    if e.get("lat") is not None:
        continue
    q = urllib.parse.urlencode({"q": e["geocode_query"], "format": "jsonv2", "limit": 1, "countrycodes": "us", "viewbox": "-122.3,37.2,-121.5,36.4", "bounded": 1})
    r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://nominatim.openstreetmap.org/search?{q}", headers=UA)))
    time.sleep(1.1)
    if not r:
        print(f"✗ {e['id']}: no result for {e['geocode_query']!r}", flush=True); continue
    e["lat"], e["lng"] = round(float(r[0]["lat"]), 5), round(float(r[0]["lon"]), 5)
    e.setdefault("geo_precision", "venue")
    e["last_verified"] = "2026-11-24"
    print(f"✓ {e['id']}: {e['lat']},{e['lng']}  ← {r[0]['display_name'][:90]}", flush=True)
json.dump(d, open(P, "w"), indent=2, ensure_ascii=False); open(P, "a").write("\n")
