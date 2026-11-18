"""Convert the full, licensed TTFs to Web assets without subsetting or renaming."""

import hashlib
import json
from pathlib import Path

import brotli
import fontTools
from fontTools.ttLib import TTFont


def load(path):
    return TTFont(path, recalcBBoxes=False, recalcTimestamp=False)


def names(font):
    return sorted((entry.nameID, entry.platformID, entry.platEncID, entry.langID,
                   entry.toUnicode()) for entry in font["name"].names)


def fingerprint(path):
    return {"file": path.name, "bytes": path.stat().st_size,
            "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}


directory = Path(__file__).resolve().parents[1] / "assets" / "fonts"
converted = []
for name in ("CormorantGaramond", "DMSans"):
    source = directory / (name + ".ttf")
    target = directory / (name + ".woff2")
    with load(source) as original:
        original.flavor = "woff2"
        original.save(target)
        with load(target) as web:
            assert web.getBestCmap() == original.getBestCmap()
            assert web.getGlyphOrder() == original.getGlyphOrder()
            assert web["hmtx"].metrics == original["hmtx"].metrics
            assert names(web) == names(original)
            for tag in ("fvar", "avar", "STAT", "GSUB", "GPOS", "GDEF"):
                if tag in original:
                    assert web.getTableData(tag) == original.getTableData(tag), tag
            converted.append({"source": fingerprint(source), "web": fingerprint(target),
                              "mappedCodepoints": len(web.getBestCmap()),
                              "glyphs": len(web.getGlyphOrder()), "verified": True})

print(json.dumps({"fontTools": fontTools.__version__, "brotli": brotli.__version__,
                  "retainedAllGlyphs": True, "files": converted}, indent=2))
