"""Validate the current picture inventory and attach documented generation metadata."""
from collections import Counter
from hashlib import sha256
from pathlib import Path
import argparse
import csv
import json
import re


root = Path(__file__).resolve().parents[1]


def read(name):
    return json.loads((root / name).read_text())


def checksum(path):
    return sha256(path.read_bytes()).hexdigest()


def generation(tool=None, date=None, version=None, record=None, prompt=None, style=None):
    return {"toolRecorded": tool, "modelIdRecorded": None, "dateRecorded": date,
            "promptVersion": version, "generationRecord": record, "promptRecord": prompt,
            "styleVersion": style}


parser = argparse.ArgumentParser()
parser.add_argument("web", type=Path)
parser.add_argument("output", type=Path)
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
old = read("docs/evidence/illustration-review/inventory.json")
source_manifest = "art/manifest.json"
source = read(source_manifest)
tree = read("art/a51/provenance.json")
tree_master = read("art/a51/reference/manifest.json")
sword = read("art/spiritual-sword/runtime.json")
sword_record = sword["sourceGenerationMetadata"]
sword_gen = read(sword_record)
marker = re.search(r'<meta name="oliva-build" content="([^"]+)"', (args.web / "index.html").read_text()).group(1)
assert marker == old["build"], "Use the verified current export or refresh the source inventory"

by_file = {}
for entry in source["assets"]:
    master = entry["master"]
    assert checksum(root / master) == entry["master_sha256"]
    for variant in entry["variants"]:
        filename = variant["file"]
        if not (root / filename).is_file():
            continue
        assert checksum(root / filename) == variant["sha256"]
        by_file[filename] = entry

stage_by_hash = {}
for item in tree_master["stages"]:
    for variant in item["variants"]:
        stage_by_hash[variant["sha256"]] = item["name"]
for group in read("art/a51/native-derivatives.json")["groups"]:
    for variant in [group["full"], *group["layers"]]:
        stage_by_hash[variant["sha256"]] = tree_master["stages"][group["stage"]]["name"]

rows = []
for asset in old["images"]:
    filename = asset["file"]
    assert checksum(root / filename) == asset["sha256"], filename
    for candidate in asset["currentWebFiles"]:
        assert checksum(args.web / candidate) == asset["sha256"], candidate
    places = asset["actualRuntimeReferences"]
    for place in places:
        assert (root / place["source"]).is_file()
        if "line" in place:
            excerpt = (root / place["source"]).read_text().splitlines()[place["line"] - 1]
            assert Path(filename).name in excerpt, (filename, place)
    row = {"file": filename, "runtimeReferences": places, "content": asset["content"],
           "bytes": asset["bytes"], "sha256": asset["sha256"], "webFiles": asset["currentWebFiles"],
           "webPrecached": asset["currentWebPrecached"], "previousNativeExportUse": asset["previousNativeExportUse"],
           "provenance": asset["provenance"], "documentedOrigin": asset["origin"],
           "documentedRights": asset["documentedRightsStatus"], "approval": asset["documentedApproval"],
           "generation": generation()}
    if filename in by_file:
        item = by_file[filename]
        row["category"] = "OLIVA-Erzähl- oder Landschaftsmotiv"
        row["master"] = item["master"]
        row["generation"] = generation(item["generator"], item.get("generated_on"), item.get("prompt_version"),
                                       source_manifest, item.get("prompt_record"), item.get("style_version"))
        row["storyUnitIds"] = [assignment["id"] for assignment in old["storyAssignments"] if assignment["image"] == item["id"]]
    elif filename.startswith("assets/a51/"):
        row["category"] = "A51-Originalvariante oder native Ebene"
        row["stage"] = stage_by_hash[asset["sha256"]]
        row["sourceCommit"] = tree["snapshot_commit"]
        row["generation"] = generation(record="art/a51/provenance.json", prompt="art/a51/reference/prompts.json")
        row["generation"]["classification"] = "Übernommenes KI-Bildmaterial laut Provenienz. Kein Werkzeug oder Modelldatum pro Bild belegt."
    elif filename == sword["activeAsset"]["path"]:
        assert asset["sha256"] == sword["activeAsset"]["sha256"]
        row["category"] = "Einzelnes geistliches Schwert"
        row["master"] = sword["master"]
        prompt_path = str(Path(sword_record).parent / sword_gen["promptFile"])
        assert (root / prompt_path).is_file()
        row["generation"] = generation(sword_gen["generationTool"], sword_gen.get("generatedAt"),
                                       sword_gen.get("promptVersion"), sword_record, prompt_path)
    else:
        row["category"] = "PWA-Appsymbol"
        row["generation"]["classification"] = "Erstellungsweg nicht belegt."
    rows.append(row)

for package_image in old["additionalRuntimeImages"]:
    for filename in package_image["files"]:
        assert checksum(args.web / filename) == package_image["sha256"]
        expected = Path(re.sub(r"\.[a-f0-9]{32}(?=(?:@\d+x)?\.)", "", filename.removeprefix("assets/")))
        candidates = [expected]
        if "@" not in expected.stem:
            candidates.append(expected.with_name(expected.stem + "@1x" + expected.suffix))
        match = next((item for item in candidates if (root / item).is_file() and checksum(root / item) == package_image["sha256"]), None)
        local = str(match or expected)
        package = read("node_modules/expo-router/package.json") if local.startswith("node_modules/expo-router/") else {}
        rows.append({"file": filename, "category": "Technisches Paketbild im Webexport", "bytes": package_image["bytes"],
                     "runtimeReferences": [{"source": "Expo-Router-/Navigationsexport"}], "content": package_image["type"],
                     "sha256": package_image["sha256"], "webFiles": [filename], "webPrecached": package_image["offline"],
                     "previousNativeExportUse": None, "documentedOrigin": local,
                     "matchesInstalledPackageBytes": match is not None,
                     "provenance": "node_modules/expo-router/LICENSE" if package else None,
                     "documentedRights": f"Paket deklariert {package['license']}" if package.get("license") else "Prüfbedürftig",
                     "approval": None, "generation": generation()})

summary = {"build": marker, "imageRows": len(rows), "countsByCategory": dict(Counter(row["category"] for row in rows)),
           "webImagesVerified": sum(len(row["webFiles"]) for row in rows), "storiesWithAssignedArt": old["storyAssignments"],
           "typographicStoryCount": old["typographicStoryCount"], "notReferenced": old["unreferencedSourceImages"],
           "scope": "Projektbilder in App-Code inklusive Plattformvarianten und tatsächlich vorhandene technische Exportbilder.",
           "unknownConvention": "null bedeutet: in den geprüften Nachweisen nicht belegt oder nicht anwendbar. Keine neue Lizenz wird abgeleitet.",
           "unshippedOriginals": "Master, ungenutzte Varianten und historische Schwerter sind getrennt von aktiven Bildern aufbewahrt.", "assets": rows}
assert summary["webImagesVerified"] == old["webImageFileCount"]
(args.output / "image-rights.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n")
with (args.output / "image-rights.csv").open("w", newline="", encoding="utf-8-sig") as file:
    writer = csv.writer(file, delimiter=";")
    writer.writerow(["Datei", "Kategorie", "Einsatz", "Byte", "Webdateien", "Web offline", "Herkunft", "KI-Werkzeug",
                     "Datum", "Promptversion", "Prompt-/Herkunftsnachweis", "Nutzungsrechtsstatus"])
    for row in rows:
        gen = row["generation"]
        uses = ", ".join(p["source"] + (f":{p['line']}" if "line" in p else "") for p in row["runtimeReferences"])
        writer.writerow([row["file"], row["category"], uses, row["bytes"], ", ".join(row["webFiles"]), row["webPrecached"],
                         row["documentedOrigin"], gen["toolRecorded"] or "Nicht belegt", gen["dateRecorded"] or "Nicht belegt",
                         gen["promptVersion"] or "Nicht belegt", gen["promptRecord"] or row["provenance"] or "Nicht belegt",
                         row["documentedRights"]])
print(json.dumps({key: summary[key] for key in ("build", "imageRows", "countsByCategory", "webImagesVerified")}))
