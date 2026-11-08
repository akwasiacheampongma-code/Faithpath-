"""Reproduce transparent technical PNG delivery variants from the immutable master.

Full-canvas RGBA Lanczos resize only. No cropping, painting, masking, background
removal, recolouring or creative editing. Normal run writes variants+manifest;
--check re-encodes in memory and verifies the existing files without rewriting.
"""
from argparse import ArgumentParser
from io import BytesIO
import hashlib
import json
from pathlib import Path

import PIL
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_MASTER_SHA = "3a4b4c77c322972310198e94971c0bec81dd09d0dea8ef3038fdac8a6fe49839"
WIDTHS = (256, 512, 768)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def resolved(name):
    target = (ROOT / name).resolve()
    if not target.is_relative_to(ROOT):
        raise ValueError("Path escapes the pilot preparation directory")
    return target


def prepare(check=False):
    pilot = json.loads((ROOT / "pilot.json").read_text(encoding="utf-8"))
    assert pilot["id"] == "romans-grace-pilot" and pilot["book"] == "ROM"
    master_path = resolved(pilot["master"])
    before = master_path.read_bytes()
    assert sha(before) == pilot["master_sha256"] == EXPECTED_MASTER_SHA
    variants = []
    with Image.open(master_path) as master:
        assert master.format == "PNG" and master.mode == "RGBA"
        assert master.size == (1024, 1536)
        master.load()
        assert master.getchannel("A").getextrema()[0] == 0
        options = {"format": "PNG", "optimize": True}
        if master.info.get("icc_profile"):
            options["icc_profile"] = master.info["icc_profile"]
        for width in WIDTHS:
            height = width * 3 // 2
            image = master.resize((width, height), Image.Resampling.LANCZOS)
            encoded = BytesIO()
            image.save(encoded, **options)
            data = encoded.getvalue()
            path = resolved(f"variants/{pilot['id']}-{width}.png")
            if check:
                assert path.read_bytes() == data, f"Non-reproducible output: {path}"
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(data)
            with Image.open(path) as decoded:
                decoded.load()
                assert decoded.format == "PNG" and decoded.mode == "RGBA"
                assert decoded.size == (width, height)
                assert decoded.tobytes() == image.tobytes()
                alpha = decoded.getchannel("A")
                histogram = alpha.histogram()
                assert histogram[0] > 0 and sum(histogram[1:]) > 0
                variants.append({
                    "width": width,
                    "height": height,
                    "file": path.relative_to(ROOT).as_posix(),
                    "bytes": len(data),
                    "sha256": sha(data),
                    "alphaExtrema": list(alpha.getextrema()),
                    "transparentPixels": histogram[0],
                    "visiblePixels": sum(histogram[1:]),
                    "decodedPixelBufferExact": True,
                })
    assert master_path.read_bytes() == before, "Master was changed"
    manifest = {
        "schemaVersion": 1,
        "id": pilot["id"],
        "book": pilot["book"],
        "master": pilot["master"],
        "masterSHA": EXPECTED_MASTER_SHA,
        "masterWidth": 1024,
        "masterHeight": 1536,
        "license_status": pilot["license_status"],
        "status": {
            "runtimeIntegration": False,
            "scope": "Technical 0.9 preparation only; no app, PWA cache or progress changes",
            "publicRelease": "not approved",
            "specialistApproval": "pending",
        },
        "derivation": {
            "generator": "scripts/prepare-variants.py",
            "version": 1,
            "operation": "Full-canvas RGBA resize only; original2:3aspect retained",
            "resampler": "Pillow.Image.Resampling.LANCZOS",
            "pillowVersion": PIL.__version__,
            "masterUnmodified": True,
            "crop": False,
            "retouch": False,
            "backgroundRemoval": False,
            "pixelVerification": "Every actual PNG decoded to the exact resized RGBA buffer",
        },
        "variants": variants,
        "totalVariantBytes": sum(v["bytes"] for v in variants),
    }
    target = ROOT / "technical-variants.json"
    if check:
        assert json.loads(target.read_text(encoding="utf-8")) == manifest
    else:
        target.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "checkOnly": check,
        "id": pilot["id"],
        "allThreeDecodedWithAlpha": True,
        "reproducibleByteExact": check,
        "masterUnmodified": True,
        "totalVariantBytes": manifest["totalVariantBytes"],
        "variants": variants,
        "runtimeIntegration": False,
        "publicRelease": "not approved",
    }))


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--check", action="store_true")
    prepare(parser.parse_args().check)
