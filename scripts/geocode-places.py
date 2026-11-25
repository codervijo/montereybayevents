"""Fill lat/lng in a places JSON ({"items": [...]}) from OSM Nominatim (1 req/s).

Run: uv run --no-project python scripts/geocode-places.py data/things-to-do/monterey.json
Only items with no lat. Query = item["geocode_query"] if set, else its address.
Bounded to the Monterey Bay viewbox, like scripts/geocode-lights.py.
"""
import json, sys, time, urllib.parse, urllib.request

P = sys.argv[1]
d = json.load(open(P))
UA = {"User-Agent": "montereybayevents-geocoder/1.0"}
for e in d["items"]:
    if e.get("lat") is not None:
        continue
    query = e.get("geocode_query") or e["address"]
    q = urllib.parse.urlencode({"q": query, "format": "jsonv2", "limit": 1, "countrycodes": "us",
                                "viewbox": "-122.3,37.2,-121.3,35.8", "bounded": 1})
    r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://nominatim.openstreetmap.org/search?{q}", headers=UA)))
    time.sleep(1.1)
    if not r:
        print(f"✗ {e['id']}: no result for {query!r}", flush=True)
        continue
    e["lat"], e["lng"] = round(float(r[0]["lat"]), 5), round(float(r[0]["lon"]), 5)
    print(f"✓ {e['id']}: {e['lat']},{e['lng']}  ← {r[0]['display_name'][:90]}", flush=True)
json.dump(d, open(P, "w"), indent=2, ensure_ascii=False)
open(P, "a").write("\n")
