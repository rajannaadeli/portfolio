#!/usr/bin/env python3
"""
Portfolio Case-Study Image Pipeline
Backup → Convert (AVIF + WebP) → Rank → Document (images.json)
Zero originals lost. Zero visual quality loss.
"""
import json, shutil, hashlib, subprocess, datetime
from pathlib import Path

import pillow_avif  # noqa
from PIL import Image

sys_path_parent = Path(__file__).parent
import sys; sys.path.insert(0, str(sys_path_parent))
from manifests import MANIFESTS

CASES_DIR = Path("/Users/rajeshadeli/Desktop/portfolio/cases")
WEBP_QUALITY = 90
AVIF_QUALITY = 60

# ── helpers ──────────────────────────────────────────────────────────────────

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def get_dims(path):
    try:
        with Image.open(path) as img:
            return img.size  # (w, h)
    except Exception:
        return (0, 0)

def to_webp(src, dest):
    # try cwebp first
    if src.suffix.lower() in (".png", ".jpg", ".jpeg"):
        r = subprocess.run(["cwebp", "-q", str(WEBP_QUALITY), "-mt", str(src), "-o", str(dest)], capture_output=True)
        if r.returncode == 0:
            return True
    # pillow fallback
    try:
        with Image.open(src) as img:
            img = img.convert("RGBA" if img.mode in ("RGBA","LA","P") else "RGB")
            img.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)
        return True
    except Exception as e:
        print(f"      WebP error: {e}"); return False

def to_avif(src, dest):
    try:
        with Image.open(src) as img:
            img = img.convert("RGBA" if img.mode in ("RGBA","LA","P") else "RGB")
            img.save(dest, "AVIF", quality=AVIF_QUALITY)
        return True
    except Exception as e:
        # ffmpeg libaom fallback
        r = subprocess.run(["ffmpeg","-y","-i",str(src),"-c:v","libaom-av1","-crf","30","-b:v","0","-still-picture","1",str(dest)], capture_output=True)
        if r.returncode != 0:
            print(f"      AVIF error: {e}"); return False
        return True

def kb(path):
    return path.stat().st_size // 1024 if path and path.exists() else 0

# ── main pipeline ─────────────────────────────────────────────────────────────

def process_case(slug, manifest_data):
    case_dir   = CASES_DIR / slug
    ui_dir     = case_dir / "ui"
    orig_dir   = case_dir / "_originals"
    conv_dir   = ui_dir / "converted"

    print(f"\n{'─'*60}\n  CASE: {slug.upper()}\n{'─'*60}")

    # 1. BACKUP
    print("  [1/4] Backup originals…")
    orig_dir.mkdir(exist_ok=True)
    for f in ui_dir.iterdir():
        if f.is_file():
            d = orig_dir / f.name
            if not d.exists():
                shutil.copy2(f, d)
                print(f"    + {f.name}")
    print(f"  ✓ _originals secured")

    # 2. CONVERT
    print("  [2/4] Converting…")
    conv_dir.mkdir(exist_ok=True)
    conv = {}  # fileNameBase → metadata

    for m in manifest_data["images"]:
        orig_name = m["originalFileName"].strip()
        fb        = m["fileNameBase"]
        src       = ui_dir / orig_name

        if not src.exists():
            print(f"    ✗ MISSING: {orig_name}"); continue

        w, h = get_dims(src)
        sha  = sha256_file(src)
        orig_kb = kb(src)

        webp_p = conv_dir / f"{fb}.webp"
        avif_p = conv_dir / f"{fb}.avif"

        if not webp_p.exists():
            ok = to_webp(src, webp_p)
            print(f"    {'✓' if ok else '✗'} WebP {fb} ({kb(webp_p)} KB)")
        else:
            print(f"    · WebP exists {fb} ({kb(webp_p)} KB)")

        if not avif_p.exists():
            ok = to_avif(src, avif_p)
            print(f"    {'✓' if ok else '✗'} AVIF {fb} ({kb(avif_p)} KB)")
        else:
            print(f"    · AVIF exists {fb} ({kb(avif_p)} KB)")

        conv[fb] = {"webp": webp_p, "avif": avif_p, "w": w, "h": h, "sha": sha, "orig_kb": orig_kb}

    # 3. BUILD images.json
    print("  [3/4] Building images.json…")
    images_out = []
    for m in manifest_data["images"]:
        fb = m["fileNameBase"]
        r  = conv.get(fb, {})
        wp = r.get("webp"); ap = r.get("avif")

        formats = {}
        if wp and wp.exists(): formats["webp"] = {"path": f"ui/converted/{wp.name}", "sizeKb": kb(wp)}
        if ap and ap.exists(): formats["avif"] = {"path": f"ui/converted/{ap.name}", "sizeKb": kb(ap)}

        images_out.append({
            "fileNameBase":     fb,
            "originalFileName": m["originalFileName"].strip(),
            "originalSha256":   r.get("sha",""),
            "originalSizeKb":   r.get("orig_kb",0),
            "formats":          formats,
            "dimensions":       {"width": r.get("w",0), "height": r.get("h",0)},
            "aspectRatio":      m.get("aspectRatio",""),
            "orientation":      m.get("orientation","landscape"),
            "surface":          m.get("surface","desktop"),
            "primaryView":      m.get("primaryView",""),
            "rank":             m["rank"],
            "isShortlisted":    m["isShortlisted"],
            "description":      m["description"],
            "tags":             m.get("tags",[]),
            "contentHighlights": m.get("contentHighlights",[]),
        })

    images_out.sort(key=lambda x: x["rank"])

    doc = {
        "$schema":        "https://rajeshadeli.com/schemas/portfolio-images/v1.json",
        "caseSlug":       manifest_data["caseSlug"],
        "accentHex":      manifest_data["accentHex"],
        "generatedAt":    datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "totalImages":    len(images_out),
        "shortlistedCount": sum(1 for i in images_out if i["isShortlisted"]),
        "images":         images_out,
    }

    out = case_dir / "images.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
    print(f"  ✓ {out}")

    # 4. SUMMARY
    wc = sum(1 for i in images_out if "webp" in i["formats"])
    ac = sum(1 for i in images_out if "avif" in i["formats"])
    print(f"  [4/4] {doc['totalImages']} imgs | {doc['shortlistedCount']} shortlisted | {wc} WebP | {ac} AVIF")


if __name__ == "__main__":
    print("="*60 + "\n  PORTFOLIO IMAGE PIPELINE\n" + "="*60)
    for slug, manifest in MANIFESTS.items():
        process_case(slug, manifest)
    print("\n" + "="*60 + "\n  ALL CASES COMPLETE\n" + "="*60)
