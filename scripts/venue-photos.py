"""Render the v2.Z landmark venue photos from data/venue-photos.json.

Run: uv run --no-project --with pillow python scripts/venue-photos.py
Downloads each file from Wikimedia Commons (public domain / CC0 only, licence
re-checked against the API on every run), applies the recorded crop, and writes
public/photos/venues/<key>-{800,1200}.webp + <key>.jpg (1600w), plus
src/data/venuePhotoDims.json. Existing outputs are kept unless --force.
"""
import io, json, sys, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "photos" / "venues"
UA = {"User-Agent": "venue-photo-licence-check/1.0 (static site build script)"}
FREE = ("Public domain", "CC0")

def get(url):
    for i in range(5):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read()
        except Exception as e:  # 429s from Commons are common
            print(f"↷ {e} (retry {i + 1})", flush=True); time.sleep(10 * (i + 1))
    raise SystemExit(f"✗ could not fetch {url}")

def main():
    force = "--force" in sys.argv
    photos = json.loads((ROOT / "data" / "venue-photos.json").read_text())["photos"]
    OUT.mkdir(parents=True, exist_ok=True)
    dims = {}
    for key, p in photos.items():
        jpg = OUT / f"{key}.jpg"
        if jpg.exists() and not force:
            im = Image.open(jpg); dims[key] = {"width": im.width, "height": im.height}
            print(f"✓ {key}: exists", flush=True); continue
        q = urllib.parse.urlencode(dict(action="query", titles=p["commons"], prop="imageinfo",
                                        iiprop="url|extmetadata", iiurlwidth=3840, format="json"))
        ii = next(iter(json.loads(get(f"https://commons.wikimedia.org/w/api.php?{q}"))["query"]["pages"].values()))["imageinfo"][0]
        lic = ii["extmetadata"].get("LicenseShortName", {}).get("value", "")
        if not lic.startswith(FREE):
            raise SystemExit(f"✗ {key}: licence is now {lic!r}; not public domain/CC0")
        time.sleep(5)
        im = Image.open(io.BytesIO(get(ii["thumburl"]))).convert("RGB")
        if p.get("crop"):
            l, t, r, b = p["crop"]; W, H = im.size
            im = im.crop((int(W * l), int(H * t), int(W * r), int(H * b)))
        big = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
        big.save(jpg, quality=84, optimize=True, progressive=True)
        for w in (800, 1200):
            im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(OUT / f"{key}-{w}.webp", quality=80, method=6)
        dims[key] = {"width": big.width, "height": big.height}
        print(f"✓ {key}: {lic}, {big.width}×{big.height}", flush=True)
        time.sleep(5)
    (ROOT / "src" / "data" / "venuePhotoDims.json").write_text(json.dumps(dims, indent=1) + "\n")
    print(f"✓ wrote {len(dims)} photos + src/data/venuePhotoDims.json")

main()
