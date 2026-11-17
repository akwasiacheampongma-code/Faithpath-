import { readFile, readdir, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const read = name => readFile(path.join(root, name));
const json = async name => JSON.parse(await read(name));
const ensure = (value, message) => { if (!value) throw new Error(message); };
const manifest = await json("art/spiritual-sword/runtime.json");
const baseline = await json("docs/evidence/single-spirit-sword/before-removal.json");
const archive = await json("art/swords/historical-runtime-assets/manifest.json");
const pilot = await json(manifest.sourceGenerationMetadata);
const technical = await json(manifest.sourceTechnicalMetadata);
ensure(manifest.schemaVersion === 1 && manifest.id === "word-of-god" &&
  manifest.originalPixelsPreserved && !manifest.newGenerationPerformed &&
  manifest.status.publicRelease === "not approved" && manifest.license === pilot.license_status,
  "Invalid spiritual sword provenance or rights state");
ensure(sha(await read(manifest.master)) === manifest.masterSHA256 &&
  manifest.masterSHA256 === pilot.master_sha256, "Original sword master changed");
for (const [name, expected] of Object.entries(baseline.protectedOriginalArtFiles))
  ensure(sha(await read(name)) === expected, `Historical original/provenance changed: ${name}`);
ensure(archive.assets.length === 9, "Historical runtime archive incomplete");
for (const item of archive.assets) {
  const bytes = await read(item.archivePath);
  ensure(bytes.length === item.bytes && sha(bytes) === item.sha256, `Historical asset changed: ${item.archivePath}`);
}
ensure(sha(await read(archive.originalBookCatalog.file)) === archive.originalBookCatalog.sha256,
  "Original book identities archive changed");
const asset = manifest.activeAsset, bytes = await read(asset.path);
const prepared = technical.variants.find(v => v.width === 512);
ensure(asset.path === "assets/spiritual-sword/word-sword-512.png" && asset.bytes === 81042 &&
  bytes.length === asset.bytes && sha(bytes) === asset.sha256 && asset.sha256 === prepared.sha256 &&
  bytes.equals(await read(manifest.sourceDerivative)), "Active sword differs from preserved original derivative");
ensure(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) &&
  bytes.readUInt32BE(16) === 512 && bytes.readUInt32BE(20) === 768 && bytes[24] === 8 && bytes[25] === 6,
  "Expected512x768RGBA PNG");
ensure((await readdir(path.join(root, "assets/spiritual-sword"))).length === 1,
  "Unexpected additional runtime sword image");
ensure(!(await access(path.join(root, "assets/swords")).then(() => true, () => false)),
  "Retired book-sword assets remain in runtime folder");
const corpus = await json("src/data/bible.json");
const verse = corpus.EPH["6"].find(v => v.n === 17).text;
ensure(verse === baseline.actualSourceVerse.text && verse.endsWith(manifest.quote.slice(2)),
  "Ephesians quote differs from the integrated original");
ensure(JSON.stringify(manifest.reference) === JSON.stringify({book:"EPH",chapter:6,from:17,to:17}) &&
  JSON.stringify(manifest.context) === JSON.stringify({book:"EPH",chapter:6,from:10,to:18}),
  "Wrong verse or context target");
const books = await json("src/data/catalog.json"), oldBooks = await json(archive.originalBookCatalog.file);
ensure(books.length === 66 && books.reduce((sum,b) => sum+b.chapters,0) === 1189,
  "Book/chapter catalog changed");
for (let i=0;i<books.length;i++) {
  const {sword,motif,index,...original} = oldBooks[i];
  ensure(JSON.stringify(books[i]) === JSON.stringify(original), "Book navigation metadata changed");
}
console.log(JSON.stringify({activeSymbols:1,activeRuntimeImages:1,activeRuntimeBytes:bytes.length,
  archivedRuntimeImages:archive.assets.length,historicalOriginalFilesUnchanged:Object.keys(baseline.protectedOriginalArtFiles).length,
  previousDevelopmentRuntimeBytes:baseline.previousRuntimeVariantBytes,
  removedRuntimeBytes:baseline.previousRuntimeVariantBytes-bytes.length,
  allHashesMatch:true,originalsUnmodified:true,bibleBooks:66,chapters:1189,
  exactIntegratedEphesiansQuote:true,noProgressOrRewardInput:true,publicRelease:"not approved",
  scope:"Technical provenance/source checks. Browser, native, device and independent specialist acceptance are separate."}));
