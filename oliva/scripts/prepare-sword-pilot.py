"""Resize the immutable Johannes sword pilot for native and web display.

Run from any directory with Python 3 and Pillow. No network, image generation,
cropping, masking, retouching, recolouring or background compositing is involved.
"""
import hashlib
import json
from pathlib import Path

import PIL
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PILOT_PATH = ROOT / "art/swords/pilot.json"
EXPECTED_MASTER_SHA = "67aef437a0cd7239b10339143f96993ff7bd2bacbd938f017e0801bc6c2a4c33"
WIDTHS = (256, 512, 768)


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def project_path(name):
    path = (ROOT / name).resolve()
    if not path.is_relative_to(ROOT):
        raise ValueError("Asset path outside the project")
    return path


def prepare():
    pilot = json.loads(PILOT_PATH.read_text(encoding="utf-8"))
    if pilot["id"] != "john-life-pilot" or pilot["book"] != "JHN":
        raise ValueError("Unexpected pilot identity")
    master_path = project_path(pilot["master"])
    before_sha = sha256(master_path)
    if before_sha != EXPECTED_MASTER_SHA or before_sha != pilot["master_sha256"]:
        raise ValueError("Original sword master changed")

    destination = ROOT / "assets/swords"
    destination.mkdir(parents=True, exist_ok=True)
    variants = []
    with Image.open(master_path) as master:
        if master.format != "PNG" or master.mode != "RGBA" or master.size != (1024, 1536):
            raise ValueError("Expected the original 1024 x 1536 RGBA PNG")
        master.load()
        save_options = {"format": "PNG", "optimize": True}
        if master.info.get("icc_profile"):
            save_options["icc_profile"] = master.info["icc_profile"]
        for width in WIDTHS:
            height = width * 3 // 2
            variant_path = destination / f"{pilot['id']}-{width}.png"
            resized = master.resize((width, height), Image.Resampling.LANCZOS)
            resized.save(variant_path, **save_options)
            with Image.open(variant_path) as decoded:
                if decoded.mode != "RGBA" or decoded.size != (width, height):
                    raise ValueError("Unexpected output format or dimensions")
                # Verify the actually written/decoded pixels, not just the header.
                if decoded.tobytes() != resized.tobytes():
                    raise ValueError("Lossless PNG encoding changed resized pixels")
            variants.append({
                "width": width,
                "height": height,
                "path": variant_path.relative_to(ROOT).as_posix(),
                "sha256": sha256(variant_path),
                "bytes": variant_path.stat().st_size,
            })

    if sha256(master_path) != before_sha:
        raise ValueError("Original master changed during generation")
    manifest = {
        "schemaVersion": 1,
        "id": pilot["id"],
        "book": pilot["book"],
        "master": pilot["master"],
        "masterSHA": before_sha,
        "masterWidth": 1024,
        "masterHeight": 1536,
        "hashAlgorithm": "sha256",
        "license": pilot["license_status"],
        "status": {
            "internalRuntime": "Authorized by the project instruction for OLIVA 0.6; runtime and visual acceptance remain separate checks.",
            "publicRelease": pilot["approval"]["public_release"],
        },
        "sourceMetadata": "art/swords/pilot.json",
        "derivation": {
            "generator": "scripts/prepare-sword-pilot.py",
            "version": 1,
            "operation": "Full-canvas RGBA resize only; original 2:3 aspect ratio retained.",
            "resampler": "Pillow Image.Resampling.LANCZOS",
            "pillowVersion": PIL.__version__,
            "masterUnmodified": True,
            "crop": False,
            "retouch": False,
            "encodedPixelCheck": "Each output was decoded and compared byte-for-byte with its resized RGBA pixel buffer.",
        },
        "variants": variants,
    }
    target = ROOT / "art/swords/runtime.json"
    target.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "pilot": manifest["id"],
        "masterUnmodified": True,
        "variants": variants,
        "totalVariantBytes": sum(v["bytes"] for v in variants),
        "publicRelease": manifest["status"]["publicRelease"],
    }))


if __name__ == "__main__":
    prepare()
