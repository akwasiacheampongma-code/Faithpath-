#!/usr/bin/env node
/** Inspect Expo native JavaScript/asset exports without executing the app.
 * Run from the app root, or pass --root. No third-party dependencies.
 * This is not a simulator, image decoder, installation or device test.
 */
import { readFile, readdir, realpath, stat, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { Script } from "node:vm";

const HELP = `Usage: node scripts/check-native-export.mjs [--root APP] [--report FILE] [EXPORT ...]

EXPORT paths are relative to APP (default: current working directory).
With no EXPORT arguments, checks dist-android and dist-ios.
--report writes the complete JSON result; stdout remains a small summary.
This verifies JavaScript syntax, metadata references and local asset bytes only.
`;
const PNG = Buffer.from("89504e470d0a1a0a", "hex");
const HERMES = Buffer.from("c61fbc03c103191f", "hex");
const WEB_MARKERS = [
  "tree-art-window", "tree-canvas", "uniform vec3 u_x0",
  "createTreeScene", "createLeafRenderer",
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const relative = (root, file) => path.relative(root, file).split(path.sep).join("/");
const inside = (root, file) => file !== root && file.startsWith(root + path.sep);
const validHash = (value) => typeof value === "string" && /^[a-f0-9]{64}$/i.test(value);
const checked = (condition, message) => { if (!condition) throw new Error(message); };

function options(args) {
  const result = { root: process.cwd(), report: null, exports: [], help: false };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") result.help = true;
    else if (arg === "--root" || arg === "--report") {
      checked(args[i + 1] && !args[i + 1].startsWith("--"), `Missing value for ${arg}`);
      result[arg === "--root" ? "root" : "report"] = path.resolve(args[++i]);
    } else {
      checked(!arg.startsWith("-"), `Unknown option: ${arg}`);
      result.exports.push(arg);
    }
  }
  result.root = path.resolve(result.root);
  if (!result.exports.length) result.exports = ["dist-android", "dist-ios"];
  result.exports = result.exports.map((folder) => path.resolve(result.root, folder));
  checked(new Set(result.exports).size === result.exports.length, "Duplicate export directory");
  return result;
}

async function files(root, folder = root) {
  const found = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, entry.name);
    checked(!entry.isSymbolicLink(), `Symlink is not a regular exported/source file: ${file}`);
    if (entry.isDirectory()) found.push(...await files(root, file));
    else if (entry.isFile()) found.push(file);
  }
  return found.sort();
}

async function namedFile(root, name, purpose) {
  checked(typeof name === "string" && name.length > 0 && !name.includes("\0") &&
    !name.includes("\\") && !path.posix.isAbsolute(name), `Invalid ${purpose} path: ${String(name)}`);
  checked(!name.split("/").some((part) => part === ".." || part === "."),
    `Nonlocal ${purpose} path: ${name}`);
  const file = path.resolve(root, name);
  checked(inside(root, file), `${purpose} escapes its root: ${name}`);
  let actual;
  try { actual = await realpath(file); }
  catch { throw new Error(`Missing ${purpose}: ${name}`); }
  checked(inside(await realpath(root), actual), `${purpose} symlink escapes its root: ${name}`);
  checked((await stat(actual)).isFile(), `${purpose} is not a file: ${name}`);
  return actual;
}

async function json(file) { return JSON.parse(await readFile(file, "utf8")); }

// Resolve an output target without creating it, including not-yet-existing
// parent directories. A report must never change the inspected export.
async function canonicalTarget(file) {
  const tail = [];
  let parent = file;
  for (;;) {
    try { return path.resolve(await realpath(parent), ...tail); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      const next = path.dirname(parent);
      checked(next !== parent, `Cannot resolve output path: ${file}`);
      tail.unshift(path.basename(parent));
      parent = next;
    }
  }
}

async function source(root, name, expected, format) {
  const file = await namedFile(root, name, "source asset"), bytes = await readFile(file);
  const digest = hash(bytes);
  if (expected !== undefined) {
    checked(validHash(expected), `Invalid declared SHA-256 for ${name}`);
    checked(digest === expected.toLowerCase(), `Source hash mismatch: ${name}`);
  }
  if (format === "png") checked(bytes.subarray(0, 8).equals(PNG), `Invalid PNG signature: ${name}`);
  if (format === "webp") checked(bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP", `Invalid WebP signature: ${name}`);
  return { source: name, sha256: digest, bytes: bytes.length, ...(format ? { format } : {}) };
}

async function expectations(root) {
  const derivatives = await json(await namedFile(root, "art/a51/native-derivatives.json", "manifest"));
  const bible = await json(await namedFile(root, "art/manifest.json", "manifest"));
  const provenance = await json(await namedFile(root, "art/a51/provenance.json", "manifest"));
  const swordRuntime = await json(await namedFile(root, "art/swords/runtime.json", "manifest"));
  checked(Array.isArray(derivatives.groups), "A51 derivative groups missing");
  const a51 = new Map(), stages = new Map();
  for (const group of derivatives.groups) {
    checked(Number.isInteger(group.stage) && group.stage >= 0 && group.stage < 7 &&
      [640, 1024].includes(group.resolution), "Invalid A51 stage/resolution");
    const groupKey = `${group.stage}:${group.resolution}`;
    checked(!stages.has(groupKey), `Duplicate A51 group: ${groupKey}`);
    checked(group.full && Array.isArray(group.layers), `Incomplete A51 group: ${groupKey}`);
    stages.set(groupKey, true);
    for (const item of [group.full, ...group.layers]) {
      checked(!a51.has(item.file), `Duplicate A51 source: ${item.file}`);
      checked(validHash(item.sha256), `Missing/invalid declared A51 SHA-256: ${item.file}`);
      a51.set(item.file, await source(root, item.file, item.sha256, "png"));
    }
  }
  checked(stages.size === 14 && a51.size === 98, `Expected seven A51 stages / 14 groups / 98 PNGs; got ${stages.size} groups / ${a51.size} PNGs`);

  // Every PNG deliberately placed in this delivery directory must be bundled.
  // This also picks up new book pilots without adding another hardcoded book.
  const swords = new Map();
  for (const file of await files(path.join(root, "assets/swords"))) {
    if (file.toLowerCase().endsWith(".png")) {
      const name = relative(root, file);
      swords.set(name, await source(root, name, undefined, "png"));
    }
  }
  checked(swords.size > 0, "No runtime sword PNGs found");
  function validateSwordHashes(value) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach(validateSwordHashes); return; }
    const name = value.path ?? value.file;
    if (typeof name === "string" && name.startsWith("assets/swords/") && name.endsWith(".png")) {
      checked(swords.has(name), `Sword manifest source missing: ${name}`);
      checked(validHash(value.sha256) && swords.get(name).sha256 === value.sha256.toLowerCase(),
        `Sword source hash mismatch: ${name}`);
    }
    Object.values(value).forEach(validateSwordHashes);
  }
  validateSwordHashes(swordRuntime);

  checked(Array.isArray(bible.assets), "Bible art manifest missing assets");
  const david = bible.assets.filter((asset) => asset.id === "david-before-goliath");
  checked(david.length === 1 && david[0].variants?.length === 3, "Expected exactly three David WebP variants");
  const davidAssets = [];
  for (const item of david[0].variants) {
    checked(validHash(item.sha256), `Missing/invalid declared David SHA-256: ${item.file}`);
    davidAssets.push(await source(root, item.file, item.sha256, "webp"));
  }
  checked(new Set(davidAssets.map((item) => item.source)).size === 3, "Duplicate David delivery variant");

  const forbidden = new Map(), prompts = [];
  function forbid(record, category) {
    const existing = forbidden.get(record.sha256);
    if (existing) existing.sources.push(record.source);
    else forbidden.set(record.sha256, { category, sources: [record.source], sha256: record.sha256 });
  }
  for (const asset of bible.assets) {
    checked(validHash(asset.master_sha256), `Missing/invalid Bible master SHA-256: ${asset.id}`);
    forbid(await source(root, asset.master, asset.master_sha256, "png"), "bible-master");
  }
  for (const item of provenance.original_files ?? []) {
    if (/\.(png|webp)$/i.test(item.path)) {
      checked(validHash(item.sha256), `Missing/invalid A51 provenance SHA-256: ${item.path}`);
      forbid(await source(root, item.path, item.sha256), item.path.endsWith(".webp") ? "a51-original-webp" : "a51-master");
    }
  }
  function promptRecords(value, origin) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach((item) => promptRecords(item, origin)); return; }
    if (typeof value.prompt === "string" && value.prompt.trim().length >= 80) {
      const digest = hash(Buffer.from(value.prompt));
      prompts.push({ source: origin, sha256: digest, text: value.prompt });
      forbid({ source: `${origin}#prompt`, sha256: digest }, "prompt-text");
    }
    Object.values(value).forEach((item) => promptRecords(item, origin));
  }
  for (const file of await files(path.join(root, "art"))) {
    const name = relative(root, file);
    if (name.split("/").includes("masters") && /\.png$/i.test(name)) {
      forbid(await source(root, name, undefined, "png"), name.startsWith("art/swords/") ? "sword-master" : "art-master");
    } else if (/\.json$/i.test(name)) {
      // Full internal metadata must not accidentally be delivered as an asset.
      forbid(await source(root, name), "art-provenance-or-metadata");
      promptRecords(await json(file), name);
    } else if (/prompt[^/]*\.txt$/i.test(name)) {
      const text = await readFile(file, "utf8");
      forbid(await source(root, name), "prompt-file");
      if (text.trim().length >= 80) prompts.push({ source: name, sha256: hash(Buffer.from(text)), text });
    }
  }
  checked(prompts.length > 0, "No provenance prompts found to check exclusion");
  return {
    required: { a51: [...a51.values()], swords: [...swords.values()], david: davidAssets },
    forbidden: [...forbidden.values()], prompts,
    stageGroups: [...stages.keys()].sort(),
  };
}

async function inspect(folder, expected) {
  const root = await realpath(folder), metadataFile = await namedFile(root, "metadata.json", "export metadata");
  const metadataBytes = await readFile(metadataFile), metadata = JSON.parse(metadataBytes.toString("utf8"));
  checked(metadata.bundler === "metro" && metadata.fileMetadata && typeof metadata.fileMetadata === "object", "Expected Expo Metro fileMetadata");
  const platforms = Object.keys(metadata.fileMetadata);
  checked(platforms.length > 0 && platforms.every((name) => ["android", "ios"].includes(name)),
    `Expected native-only metadata in ${folder}; found ${platforms.join(", ")}`);
  const allFiles = await files(root), byHash = new Map(), contents = new Map();
  let bytes = 0;
  for (const file of allFiles) {
    const data = await readFile(file), name = relative(root, file), digest = hash(data);
    checked(!data.subarray(0, 8).equals(HERMES) && !name.toLowerCase().endsWith(".hbc"), `Unexpected Hermes bytecode: ${name}`);
    bytes += data.length;
    const names = byHash.get(digest) ?? []; names.push(name); byHash.set(digest, names);
    contents.set(name, data);
    const blocked = expected.forbidden.find((item) => item.sha256 === digest);
    checked(!blocked, `Forbidden ${blocked?.category} delivered as ${name} (source: ${blocked?.sources.join(", ")})`);
    let text;
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(data); }
    catch { continue; } // Binary assets are covered by signatures/hashes.
    for (const marker of WEB_MARKERS) checked(!text.includes(marker), `A51 web renderer marker in ${name}: ${marker}`);
    for (const prompt of expected.prompts) {
      const escaped = JSON.stringify(prompt.text).slice(1, -1);
      checked(!text.includes(prompt.text) && !text.includes(escaped), `Provenance prompt embedded in ${name} (source: ${prompt.source})`);
    }
  }
  const reports = [];
  for (const platform of platforms) {
    const entry = metadata.fileMetadata[platform];
    checked(entry && typeof entry.bundle === "string" && Array.isArray(entry.assets) && entry.assets.length > 0,
      `Incomplete ${platform} metadata`);
    const references = [entry.bundle, ...entry.assets.map((asset) => asset.path)];
    for (const name of references) await namedFile(root, name, `${platform} metadata reference`);
    checked(entry.bundle.endsWith(".js"), `${platform} bundle must be JavaScript, not bytecode: ${entry.bundle}`);
    let code;
    try { code = new TextDecoder("utf-8", { fatal: true }).decode(contents.get(entry.bundle)); }
    catch { throw new Error(`Bundle is not UTF-8 JavaScript: ${entry.bundle}`); }
    new Script(code, { filename: entry.bundle }); // Parses only; never executes.
    const assetReferences = new Set(entry.assets.map((asset) => asset.path));
    const extensions = new Map();
    for (const asset of entry.assets) {
      checked(typeof asset.ext === "string" && asset.ext.length > 0, `Missing ${platform} asset extension: ${asset.path}`);
      checked(!extensions.has(asset.path) || extensions.get(asset.path) === asset.ext, `Conflicting ${platform} asset extensions: ${asset.path}`);
      extensions.set(asset.path, asset.ext);
    }
    const required = {};
    for (const [group, sources] of Object.entries(expected.required)) {
      required[group] = sources.map((item) => {
        const exportedPaths = (byHash.get(item.sha256) ?? []).filter((name) => assetReferences.has(name));
        checked(exportedPaths.length > 0, `${platform} required ${group} asset missing or changed: ${item.source}`);
        checked(exportedPaths.some((name) => extensions.get(name) === item.format),
          `${platform} required asset has wrong metadata format: ${item.source}`);
        return { ...item, exportedPaths };
      });
    }
    reports.push({
      platform, directory: folder, metadataSha256: hash(metadataBytes),
      bundle: entry.bundle, bundleSha256: hash(contents.get(entry.bundle)), bundleBytes: contents.get(entry.bundle).length,
      javascriptSyntaxValid: true, hermesBytecode: false, metadataReferencesVerified: references.length,
      uniqueMetadataAssets: assetReferences.size, exportFileCount: allFiles.length, exportBytes: bytes,
      required, forbiddenHashesChecked: expected.forbidden.length, fullPromptsChecked: expected.prompts.length,
      a51WebRendererMarkersAbsent: WEB_MARKERS,
    });
  }
  return reports;
}

function summary(report) {
  return {
    ok: report.ok, appVersion: report.appVersion, completeNativePair: report.completeNativePair,
    platforms: report.exports.map((item) => ({
      platform: item.platform, metadataReferences: item.metadataReferencesVerified,
      a51Pngs: item.required.a51.length, swordPngs: item.required.swords.length,
      davidWebps: item.required.david.length, javascriptSyntaxValid: true, hermesBytecode: false,
    })),
    scope: report.scope, ...(report.error ? { error: report.error } : {}),
  };
}

let args;
let canWriteReport = false;
const report = {
  schemaVersion: 1, checkedAt: new Date().toISOString(), ok: false,
  completeNativePair: false,
  scope: "Static JavaScript syntax, Expo metadata and byte-exact source/asset checks only.",
  simulatorTest: false, physicalDeviceTest: false, nativeImageDecoderTest: false,
  installationTest: false, performanceTest: false, energyTest: false,
  exportFlags: "Expected --no-minify --no-bytecode; command flags must be verified separately from an export log.",
  exclusionsScope: "Known complete source-file SHA-256 values, known full prompt strings, and named A51 web markers; not a proof that every possible transformed snippet is absent.",
  exports: [],
};
try {
  args = options(process.argv.slice(2));
  if (args.help) { process.stdout.write(HELP); process.exit(0); }
  if (args.report) {
    const output = await canonicalTarget(args.report);
    for (const folder of args.exports) {
      const exported = await canonicalTarget(folder);
      checked(output !== exported && !inside(exported, output), "Report must be outside every inspected export directory");
    }
    canWriteReport = true;
  }
  report.root = await realpath(args.root);
  const app = await json(await namedFile(report.root, "app.json", "app configuration"));
  report.appVersion = app.expo?.version;
  checked(typeof report.appVersion === "string", "App version missing");
  const expected = await expectations(report.root);
  for (const folder of args.exports) report.exports.push(...await inspect(folder, expected));
  const platforms = report.exports.map((item) => item.platform);
  checked(new Set(platforms).size === platforms.length, "The same platform was supplied more than once");
  report.completeNativePair = platforms.includes("android") && platforms.includes("ios");
  report.a51StageGroups = expected.stageGroups;
  report.ok = true;
} catch (error) {
  report.error = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
}
if (canWriteReport) {
  await mkdir(path.dirname(args.report), { recursive: true });
  await writeFile(args.report, JSON.stringify(report, null, 2) + "\n");
}
process.stdout.write(JSON.stringify(summary(report)) + "\n");
