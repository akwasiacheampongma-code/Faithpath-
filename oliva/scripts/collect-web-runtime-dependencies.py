"""Trace the emitted web modules to installed packages and their declared licenses."""

from hashlib import sha256
import json
from pathlib import Path
import sys


def sources(source_map):
    yield from source_map.get("sources", [])
    for section in source_map.get("sections", []):
        yield from sources(section["map"])


def package_location(source):
    parts = source.strip("/").split("/")
    index = len(parts) - 1 - parts[::-1].index("node_modules")
    width = 2 if parts[index + 1].startswith("@") else 1
    return "/".join(parts[:index + 1 + width])


def package_summary(location, count, lock):
    directory = Path(location)
    manifest = json.loads((directory / "package.json").read_text())
    assert manifest["version"] == lock[location]["version"], location
    notice_files = sorted(p.name for p in directory.iterdir() if p.is_file()
                          and p.name.upper().startswith(("COPYING", "LICENSE", "NOTICE")))
    return {"name": manifest["name"], "version": manifest["version"], "location": location,
            "declaredLicense": manifest.get("license"), "sourceModules": count, "noticeFilesInPackage": notice_files}


mapped, production, output = map(Path, sys.argv[1:])
maps = sorted(mapped.glob("_expo/static/js/web/*.js.map"))
assert maps, "No Metro source maps"
compiled = set(production.glob("_expo/static/js/web/*.js"))
all_sources = set()
chunks = []
for file in maps:
    mapped_bundle = file.with_suffix("")
    relative = mapped_bundle.relative_to(mapped)
    js = production / relative
    content = js.read_bytes()
    source_without_footer = mapped_bundle.read_bytes().split(b"\n//# sourceMappingURL=", 1)[0].rstrip()
    assert source_without_footer == content.rstrip(), str(relative)
    source_files = set(sources(json.loads(file.read_text())))
    all_sources.update(source_files)
    compiled.remove(js)
    chunks.append({"path": relative.as_posix(), "sha256": sha256(content).hexdigest(), "sourceModules": len(source_files)})
assert not compiled, f"Unmapped production chunks: {compiled}"
locations = {}
for source_file in all_sources:
    if source_file.startswith("/node_modules/"):
        location = package_location(source_file)
        locations[location] = locations.get(location, 0) + 1
lock = json.loads(Path("package-lock.json").read_text())["packages"]
packages = [package_summary(location, count, lock) for location, count in sorted(locations.items())]
report = {"emittedJavaScriptComparedWithoutSourceMapFooters": True, "chunks": chunks,
          "totalUniqueSources": len(all_sources), "packages": packages,
          "picomatchModules": sorted(s for s in all_sources if "/picomatch/" in s),
          "scope": "Production Web Expo JavaScript (excludes backend, package tooling, native binaries and non-JS assets)"}
output.write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({"compiledChunks": len(chunks), "uniqueSourceFiles": len(all_sources),
                  "resolvedPackages": len(packages), "picomatchModules": len(report["picomatchModules"])}))
