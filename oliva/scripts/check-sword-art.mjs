import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const widths = [256, 512, 768];
const seenBooks = new Set(), seenIds = new Set(), seenPaths = new Set();
const hashPattern = /^[a-f0-9]{64}$/;

async function readProjectFile(name) {
  if (typeof name !== "string" || !name || path.isAbsolute(name))
    throw new Error("Expected a relative project asset path");
  const resolved = path.resolve(root, name);
  if (!resolved.startsWith(root + path.sep)) throw new Error("Asset path outside project");
  return readFile(resolved);
}
const readJSON = async name => JSON.parse(await readProjectFile(name));
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
function pngDimensions(bytes, name) {
  if (bytes.length < 45 || !bytes.subarray(0, 8).equals(signature) ||
      bytes.readUInt32BE(8) !== 13 || bytes.subarray(12, 16).toString() !== "IHDR" ||
      bytes[24] !== 8 || bytes[25] !== 6 || bytes[26] !== 0 || bytes[27] !== 0 ||
      bytes[28] !== 0 || bytes.subarray(-8, -4).toString() !== "IEND") {
    throw new Error(`Expected a complete non-interlaced 8-bit RGBA PNG: ${name}`);
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

const index = await readJSON("art/swords/runtime-index.json");
requireValue(index.schemaVersion === 1 && index.hashAlgorithm === "sha256" &&
  Array.isArray(index.illustrations) && index.illustrations.length > 0,
  "Invalid sword runtime index");
const results = [];
for (const entry of index.illustrations) {
  requireValue(entry.id && entry.book && !seenIds.has(entry.id) && !seenBooks.has(entry.book) &&
    hashPattern.test(entry.expectedMasterSHA ?? "") && typeof entry.sourceRoot === "string",
    "Duplicate or incomplete sword index entry");
  seenIds.add(entry.id); seenBooks.add(entry.book);
  const manifest = await readJSON(entry.manifest);
  const pilot = await readJSON(entry.sourceMetadata);
  const sourceMaster = path.posix.join(entry.sourceRoot, pilot.master ?? "");
  requireValue(manifest.schemaVersion === 1 && manifest.id === entry.id && manifest.book === entry.book &&
    manifest.id === pilot.id && manifest.book === pilot.book && manifest.hashAlgorithm === "sha256" &&
    manifest.master === sourceMaster && manifest.masterSHA === entry.expectedMasterSHA &&
    manifest.masterSHA === pilot.master_sha256 && manifest.sourceMetadata === entry.sourceMetadata &&
    manifest.license === pilot.license_status && !!manifest.license && !!manifest.status?.internalRuntime &&
    manifest.status?.publicRelease === pilot.approval?.public_release &&
    manifest.status.publicRelease === "not approved" && manifest.derivation?.masterUnmodified === true &&
    manifest.derivation?.crop === false && manifest.derivation?.retouch === false &&
    manifest.derivation?.version === 1 && typeof manifest.derivation?.generator === "string" &&
    Array.isArray(manifest.variants) && manifest.variants.length === widths.length,
    `Incomplete, unexpected or misleading sword metadata: ${entry.id}`);
  await readProjectFile(manifest.derivation.generator);

  const master = await readProjectFile(manifest.master);
  const masterSize = pngDimensions(master, manifest.master);
  requireValue(hash(master) === entry.expectedMasterSHA && masterSize.width === 1024 &&
    masterSize.height === 1536 && manifest.masterWidth === masterSize.width &&
    manifest.masterHeight === masterSize.height, `Sword master hash/dimensions changed: ${entry.id}`);

  let sourceVariants;
  if (manifest.sourceVariantsMetadata) {
    sourceVariants = await readJSON(manifest.sourceVariantsMetadata);
    requireValue(sourceVariants.id === manifest.id && sourceVariants.book === manifest.book &&
      sourceVariants.master === pilot.master && sourceVariants.masterSHA === manifest.masterSHA &&
      sourceVariants.variants?.length === widths.length &&
      sourceVariants.derivation?.masterUnmodified === true &&
      sourceVariants.derivation?.crop === false && sourceVariants.derivation?.retouch === false,
      `Technical preparation metadata differs: ${entry.id}`);
  }

  let totalBytes = 0;
  for (const [variantIndex, variant] of manifest.variants.entries()) {
    const width = widths[variantIndex], height = width * 3 / 2;
    requireValue(variant.width === width && variant.height === height &&
      variant.path === `assets/swords/${manifest.id}-${width}.png` && !seenPaths.has(variant.path) &&
      hashPattern.test(variant.sha256 ?? "") && Number.isInteger(variant.bytes) && variant.bytes > 0,
      `Unexpected, duplicate or reordered sword variant: ${entry.id}`);
    seenPaths.add(variant.path);
    const bytes = await readProjectFile(variant.path), size = pngDimensions(bytes, variant.path);
    requireValue(size.width === width && size.height === height && bytes.length === variant.bytes &&
      hash(bytes) === variant.sha256, `Sword variant mismatch: ${variant.path}`);
    if (sourceVariants) {
      const prepared = sourceVariants.variants[variantIndex];
      requireValue(prepared.width === width && prepared.height === height && prepared.bytes === bytes.length &&
        prepared.sha256 === variant.sha256 && prepared.decodedPixelBufferExact === true,
        `Runtime variant differs from prepared derivative: ${variant.path}`);
      const preparedBytes = await readProjectFile(path.posix.join(entry.sourceRoot, prepared.file));
      requireValue(bytes.equals(preparedBytes), `Runtime/source derivative bytes differ: ${variant.path}`);
    }
    totalBytes += bytes.length;
  }

  // Where the generation record quotes verses, check the actual unchanged
  // corpus as well as its digest. A symbol description never becomes Bible text.
  let exactSourceVerses = 0;
  if (pilot.bible_source) {
    const corpusBytes = await readProjectFile(pilot.bible_source.source_file);
    requireValue(hashPattern.test(pilot.bible_source.sha256 ?? "") &&
      hash(corpusBytes) === pilot.bible_source.sha256, `Bible source hash mismatch: ${entry.id}`);
    const corpus = JSON.parse(corpusBytes);
    requireValue(Array.isArray(pilot.references) && pilot.references.length > 0,
      `Missing quoted Bible references: ${entry.id}`);
    const refs = pilot.references.map(reference => {
      requireValue(Array.isArray(reference.verses) && reference.verses.length > 0,
        `Empty quoted passage: ${entry.id}`);
      const verses = reference.verses;
      for (const [verseIndex, verse] of verses.entries()) {
        const actual = corpus[reference.book]?.[String(reference.chapter)]?.find(v => v.n === verse.n);
        requireValue(Number.isInteger(verse.n) && verse.n > 0 && actual?.text === verse.text &&
          (verseIndex === 0 || verse.n === verses[verseIndex - 1].n + 1),
          `Quoted source verse differs: ${reference.book} ${reference.chapter}:${verse.n}`);
        exactSourceVerses++;
      }
      return { book: reference.book, chapter: reference.chapter, from: verses[0].n, to: verses.at(-1).n };
    });
    requireValue(JSON.stringify(refs) === JSON.stringify(manifest.references),
      `Runtime Bible reference boundaries differ: ${entry.id}`);
  }
  results.push({ id: manifest.id, book: manifest.book, masters: 1, variants: manifest.variants.length,
    widths, totalVariantBytes: totalBytes, exactSourceVerses, masterSHA: manifest.masterSHA,
    sourceDerivativeBytesMatch: sourceVariants ? true : "Original John derivatives checked by their preserved hashes",
    publicRelease: manifest.status.publicRelease });
}
console.log(JSON.stringify({
  masters: results.length,
  variants: results.reduce((sum, result) => sum + result.variants, 0),
  totalVariantBytes: results.reduce((sum, result) => sum + result.totalVariantBytes, 0),
  books: results,
  allHashesMatch: true, allDimensionsMatch: true, allPngsRGBA: true, mastersUnmodified: true,
  publicRelease: "not approved",
  scope: "Technical PNG/header/hash/provenance and quoted-source checks only; no runtime, device, new decoder, visual, theological or public-release approval.",
}));
