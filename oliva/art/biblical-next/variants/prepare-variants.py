#!/usr/bin/env python3
"""Technical full-frame derivatives only; never modifies the original PNG.

From the project root:
  python art/biblical-next/variants/prepare-variants.py
  python art/biblical-next/variants/prepare-variants.py --check

The encoded bytes are reproducible with the recorded Pillow/libwebp versions.
No application files, runtime manifests or user data are touched.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
from pathlib import Path

import PIL
from PIL import Image, ImageChops, ImageStat, features

ROOT = Path(__file__).resolve().parents[3]
OUTPUT = Path(__file__).resolve().parent
MASTER = ROOT / "art/biblical-next/masters/david-before-goliath.png"
SOURCE_RECORD = ROOT / "art/biblical-next/david-before-goliath.json"
RECORD = OUTPUT / "technical-variants.json"
WIDTHS = (640, 1024, 1280)
QUALITY = 86
METHOD = 6


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def main() -> None:
    args = argparse.ArgumentParser(description=__doc__)
    args.add_argument("--check", action="store_true", help="Verify files without writing anything")
    check = args.parse_args().check
    assert features.check("webp"), "This Pillow build needs WebP support"
    master_bytes = MASTER.read_bytes()
    master_sha = sha(master_bytes)
    source = json.loads(SOURCE_RECORD.read_text())
    assert master_sha == source["master_sha256"], "Preserve the original approved reference PNG"
    original_path = Path(source["generation"]["original_path"])
    if original_path.is_file():
        assert sha(original_path.read_bytes()) == master_sha
    with Image.open(io.BytesIO(master_bytes)) as opened:
        assert opened.format == "PNG" and opened.mode == "RGB"
        opened.load()
        original = opened.copy()
    assert original.size == (1536, 1024)
    variants = []
    for width in WIDTHS:
        height = round(width * original.height / original.width)
        scaled = original.resize((width, height), Image.Resampling.LANCZOS)
        buffer = io.BytesIO()
        scaled.save(buffer, "WEBP", quality=QUALITY, method=METHOD)
        encoded = buffer.getvalue()
        file = OUTPUT / f"david-before-goliath-{width}.webp"
        if check:
            assert file.read_bytes() == encoded, f"Variant bytes differ: {file.name}"
        else:
            file.write_bytes(encoded)
        with Image.open(io.BytesIO(encoded)) as decoded:
            assert decoded.format == "WEBP" and decoded.size == (width, height)
            decoded.load()
            rgb = decoded.convert("RGB")
            stats = ImageStat.Stat(ImageChops.difference(scaled, rgb))
            mse = sum(value * value for value in stats.rms) / 3
            psnr = None if mse == 0 else 10 * math.log10(255 * 255 / mse)
            assert rgb.getbbox() is not None and len(set(rgb.getextrema())) > 1
        variants.append({
            "file": file.relative_to(ROOT).as_posix(),
            "width": width,
            "height": height,
            "bytes": len(encoded),
            "sha256": sha(encoded),
            "format": "WEBP",
            "full_decode_verified": True,
            "quality_measurement_against_uncompressed_resized_rgb": {
                "mean_absolute_error_rgb_0_to_255": [round(value, 5) for value in stats.mean],
                "psnr_db": None if psnr is None else round(psnr, 5),
                "interpretation": "Lossy codec measurement, not an independent visual or subject-matter approval",
            },
        })
    record = {
        "schema_version": 1,
        "id": "david-before-goliath-technical-variants",
        "source_metadata": SOURCE_RECORD.relative_to(ROOT).as_posix(),
        "master": MASTER.relative_to(ROOT).as_posix(),
        "master_sha256": master_sha,
        "master_bytes": len(master_bytes),
        "master_dimensions": {"width": original.width, "height": original.height},
        "generator": {
            "version": "oliva-biblical-webp-v1",
            "script": Path(__file__).resolve().relative_to(ROOT).as_posix(),
            "command": "python art/biblical-next/variants/prepare-variants.py",
            "verification_command": "python art/biblical-next/variants/prepare-variants.py --check",
            "pillow_version": PIL.__version__,
            "libwebp_version": features.version("webp"),
            "format": "WEBP",
            "quality": QUALITY,
            "method": METHOD,
            "resampling": "Image.Resampling.LANCZOS",
            "height_calculation": "round(target_width * 1024 / 1536)",
            "operation": "Full-canvas RGB resize and lossy WebP compression only",
            "crop": False,
            "retouch": False,
            "compositing": False,
            "master_unmodified": True,
            "reproducibility_scope": "Encoded variant bytes with the recorded Pillow and libwebp versions",
        },
        "approval": {
            "master_visual": "Inspected internally by implementing agent and root; original scene retained",
            "technical_variants": "All three formats, sizes, byte lengths, hashes and full decodes verified; repeatable encoding checked separately",
            "variant_visual": "Pending root inspection at intended display sizes",
            "historical": "Artistic interpretation; independent specialist review pending",
            "theological": "Independent specialist review pending",
            "public_release": "not approved",
            "runtime_integration": False,
        },
        "variants": variants,
        "total_variant_bytes": sum(item["bytes"] for item in variants),
        "privacy": "No user data; no network call; no application storage or runtime file modified",
    }
    assert MASTER.read_bytes() == master_bytes, "The PNG master must remain byte-exact"
    if check:
        assert json.loads(RECORD.read_text()) == record, "Technical metadata differs"
    else:
        RECORD.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"check_only": check, "variant_count": len(variants), "total_bytes": record["total_variant_bytes"], "master_sha256": master_sha, "runtime_integration": False}))


if __name__ == "__main__":
    main()
