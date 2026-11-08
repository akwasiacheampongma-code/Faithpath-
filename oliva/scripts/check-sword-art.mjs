import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const expectedMasterSHA = "67aef437a0cd7239b10339143f96993ff7bd2bacbd938f017e0801bc6c2a4c33";
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
async function readProjectFile(name) {
  const resolved = path.resolve(root, name);
  if (!resolved.startsWith(root + path.sep)) throw new Error("Asset path outside project");
  return readFile(resolved);
}
function hash(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
function pngDimensions(bytes, name) {
  if (bytes.length < 45 || !bytes.subarray(0, 8).equals(signature) ||
      bytes.readUInt32BE(8) !== 13 || bytes.subarray(12, 16).toString() !== "IHDR" ||
      bytes[24] !== 8 || bytes[25] !== 6 || bytes[26] !== 0 || bytes[27] !== 0 ||
      bytes[28] !== 0 || bytes.subarray(-8, -4).toString() !== "IEND") {
    throw new Error(`Expected a complete non-interlaced 8-bit RGBA PNG: ${name}`);
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const manifest = JSON.parse(await readProjectFile("art/swords/runtime.json"));
const pilot = JSON.parse(await readProjectFile("art/swords/pilot.json"));
if (manifest.schemaVersion !== 1 || manifest.id !== "john-life-pilot" || manifest.book !== "JHN" ||
    manifest.id !== pilot.id || manifest.book !== pilot.book || manifest.hashAlgorithm !== "sha256" ||
    manifest.master !== pilot.master || manifest.masterSHA !== expectedMasterSHA ||
    manifest.masterSHA !== pilot.master_sha256 || manifest.sourceMetadata !== "art/swords/pilot.json" ||
    manifest.license !== pilot.license_status || !manifest.license ||
    !manifest.status?.internalRuntime || manifest.status?.publicRelease !== pilot.approval.public_release ||
    manifest.status.publicRelease !== "not approved" || !manifest.derivation?.masterUnmodified ||
    manifest.derivation?.crop !== false || manifest.derivation?.retouch !== false ||
    manifest.derivation?.generator !== "scripts/prepare-sword-pilot.py" || manifest.derivation?.version !== 1 ||
    !Array.isArray(manifest.variants) || manifest.variants.length !== 3) {
  throw new Error("Incomplete, unexpected or misleading sword pilot metadata");
}

const master = await readProjectFile(manifest.master);
const masterSize = pngDimensions(master, manifest.master);
if (hash(master) !== expectedMasterSHA || masterSize.width !== 1024 || masterSize.height !== 1536 ||
    manifest.masterWidth !== masterSize.width || manifest.masterHeight !== masterSize.height) {
  throw new Error("Sword master hash/dimensions changed");
}
const widths = [256, 512, 768], seen = new Set();
let totalBytes = 0;
for (const [index, variant] of manifest.variants.entries()) {
  const width = widths[index], height = width * 3 / 2;
  if (variant.width !== width || variant.height !== height ||
      variant.path !== `assets/swords/john-life-pilot-${width}.png` || seen.has(variant.path)) {
    throw new Error("Unexpected, duplicate or reordered sword variant");
  }
  seen.add(variant.path);
  const bytes = await readProjectFile(variant.path), size = pngDimensions(bytes, variant.path);
  if (size.width !== width || size.height !== height || bytes.length !== variant.bytes ||
      hash(bytes) !== variant.sha256) throw new Error(`Sword variant mismatch: ${variant.path}`);
  totalBytes += bytes.length;
}
console.log(JSON.stringify({
  pilot: manifest.id,
  book: manifest.book,
  masters: 1,
  variants: manifest.variants.length,
  widths,
  totalVariantBytes: totalBytes,
  allHashesMatch: true,
  allDimensionsMatch: true,
  allPngsRGBA: true,
  masterUnmodified: true,
  publicRelease: manifest.status.publicRelease,
  scope: "Technical PNG/provenance checks only; no runtime, device, visual, theological or public-release approval.",
}));
