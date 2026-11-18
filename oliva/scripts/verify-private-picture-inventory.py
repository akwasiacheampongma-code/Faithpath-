"""Reconcile the rights inventory with the already delivered private package."""
from collections import Counter
from hashlib import sha256
from pathlib import Path
import argparse
import csv
import json
import re


root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("site_checkout", type=Path)
parser.add_argument("output", type=Path)
args = parser.parse_args()
dist = args.site_checkout / "dist"
out = args.output
out.mkdir(parents=True, exist_ok=True)
rights = json.loads((root / "docs/evidence/privacy-security-rights/image-rights.json").read_text())
prior = json.loads((root / "docs/evidence/illustration-review/inventory.json").read_text())
host = json.loads((args.site_checkout / "baseline-runtime.json").read_text())
assert rights["build"] == prior["build"] == host["source_build"]
worker = (dist / "sw.js").read_text()
build = re.search(r'name="oliva-build" content="([^"]+)"', (dist / "index.html").read_text()).group(1)
worker_match = re.match(r'const ID=("[^"]+"),URLS=(\[.*?\]),VERSION=', worker)
assert json.loads(worker_match.group(1)) == build
cached = set(json.loads(worker_match.group(2)))
mapping = {entry["original_path"]: entry for entry in host["files"]}

rows = []
for item in rights["assets"]:
    packaged = []
    source = root / item["file"]
    if not item["file"].startswith("assets/node_modules/"):
        assert source.is_file() and sha256(source.read_bytes()).hexdigest() == item["sha256"], item["file"]
    for web in item["webFiles"]:
        entry = mapping[web]
        target = dist / entry["path"]
        assert target.stat().st_size == item["bytes"]
        assert sha256(target.read_bytes()).hexdigest() == item["sha256"] == entry["sha256"]
        assert "/" + entry["path"] in cached, entry["path"]
        packaged.append(entry["path"])
    rows.append({**item, "currentWebFiles": packaged, "privateWorkerPrecache": bool(packaged)})

images = {file for row in rows for file in row["currentWebFiles"]}
runtime_images = {row["path"] for row in host["files"] if Path(row["path"]).suffix in {".png", ".webp", ".svg", ".jpg", ".avif", ".jpeg", ".gif"}}
assert images == runtime_images
summary = {"build": build, "coreBuild": rights["build"], "appVersionBasis": "0.18.0", "references": len(rows),
           "categories": dict(Counter(row["category"] for row in rows)), "verifiedImageFilesInPrivatePackage": len(images),
           "imageBytesInPrivatePackage": sum((dist / file).stat().st_size for file in images), "precacheEntries": len(cached),
           "onlyPrecacheManifestVerifiedAtThisStep": True, "storyAssignments": prior["storyAssignments"],
           "typographicStoryCount": rights["typographicStoryCount"], "unreferencedSourceImages": rights["notReferenced"],
           "newImageGeneration": False, "images": rows, "reviewFilesOutsideScope": True}
(out / "inventory.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")

with (out / "inventory.csv").open("w", newline="", encoding="utf-8-sig") as handle:
    writer = csv.writer(handle, delimiter=";")
    writer.writerow(["Datei", "Gruppe", "Einsatzort", "Inhalt", "Byte", "Paketpfad", "Precache", "Herkunft", "Rechtestatus", "KI-Nachweis", "Qualitätsbezug"])
    for row in rows:
        uses = [p["source"] + (f":{p['line']}" if "line" in p else "") for p in row["runtimeReferences"]]
        gen = row["generation"]
        key = next((entry["id"] for entry in prior["motifs"] if row["file"] in entry["runtimeVariants"]), None)
        quality = key or row.get("stage") or row["category"]
        writer.writerow([row["file"], row["category"], ", ".join(uses), row["content"], row["bytes"], ", ".join(row["currentWebFiles"]),
                         row["privateWorkerPrecache"], row["documentedOrigin"], row["documentedRights"],
                         gen.get("promptRecord") or gen.get("generationRecord") or "Nicht belegt", quality])

print(json.dumps({k: summary[k] for k in ("build", "references", "verifiedImageFilesInPrivatePackage", "imageBytesInPrivatePackage", "precacheEntries")}))
