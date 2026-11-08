#!/usr/bin/env node
/** Deliberate corruption checks, always against a temporary COPY. */
import { mkdtemp, cp, readFile, writeFile, rm, mkdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i < 0 ? fallback : args[i + 1];
};
const root = path.resolve(flag("--root", process.cwd()));
const output = path.resolve(flag("--out", "native-checker-evidence"));
const checker = fileURLToPath(new URL("check-native-export.mjs", import.meta.url));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const ensure = (value, message) => { if (!value) throw new Error(message); };
await mkdir(output, { recursive: true });
const temporary = await mkdtemp(path.join(tmpdir(), "oliva-native-checker-"));
const fixture = path.join(temporary, "copied-android");
const originalMetadata = await readFile(path.join(root, "dist-android/metadata.json"));
const metadata = JSON.parse(originalMetadata);
const entry = metadata.fileMetadata.android;
const originalBundle = await readFile(path.join(root, "dist-android", entry.bundle));
const originalAsset = entry.assets[0].path;
const originalAssetBytes = await readFile(path.join(root, "dist-android", originalAsset));
const results = [];
const sourceNames = ["metadata.json", entry.bundle, ...new Set(entry.assets.map((asset) => asset.path))].sort();
const sourceHashes = new Map();
for (const name of sourceNames) sourceHashes.set(name, sha(await readFile(path.join(root, "dist-android", name))));
let completed;

function run(name, directory, expectedError, extra = []) {
  const report = path.join(output, `${name}.json`);
  const args = [checker, "--root", root, "--report", report, directory, ...extra];
  const actual = spawnSync(process.execPath, args, { encoding: "utf8" });
  let summary;
  try { summary = JSON.parse(actual.stdout.trim()); }
  catch { throw new Error(`${name} did not emit JSON: ${actual.stderr || actual.stdout}`); }
  const rejected = expectedError !== null;
  ensure(actual.status === (rejected ? 1 : 0), `${name}: unexpected exit ${actual.status}: ${actual.stdout}`);
  ensure(summary.ok === !rejected, `${name}: incorrect outcome`);
  if (rejected) ensure(expectedError.test(summary.error), `${name}: wrong failure: ${summary.error}`);
  results.push({ name, expected: rejected ? "reject" : "accept", exitCode: actual.status, summary });
}

try {
  await cp(path.join(root, "dist-android"), fixture, { recursive: true });
  run("copied-valid", fixture, null);

  await rm(path.join(fixture, originalAsset));
  run("missing-metadata-asset", fixture, /Missing android metadata reference/);
  await writeFile(path.join(fixture, originalAsset), originalAssetBytes);

  // Corrupt one required A51 asset independently of the unrelated first asset.
  const valid = JSON.parse(await readFile(path.join(output, "copied-valid.json"), "utf8"));
  const required = valid.exports[0].required.a51[0].exportedPaths[0];
  const requiredBytes = await readFile(path.join(fixture, required));
  await writeFile(path.join(fixture, required), Buffer.from("corrupt copied asset\n"));
  run("changed-required-asset", fixture, /required a51 asset missing or changed/);
  await writeFile(path.join(fixture, required), requiredBytes);

  const masterPath = path.join(fixture, "assets/accidental-master");
  await cp(path.join(root, "art/swords/masters/john-life-pilot.png"), masterPath);
  run("unreferenced-master-leak", fixture, /Forbidden sword-master/);
  await rm(masterPath);

  const promptPath = path.join(fixture, "assets/internal-prompt.txt");
  const prompt = JSON.parse(await readFile(path.join(root, "art/swords/pilot.json"), "utf8")).prompt;
  // The added newline changes the hash: the text scan must still detect it.
  await writeFile(promptPath, prompt + "\n");
  run("unreferenced-prompt-leak", fixture, /Provenance prompt embedded/);
  await rm(promptPath);

  const webPath = path.join(fixture, "assets/accidental-web-renderer.js");
  await writeFile(webPath, "export const marker = 'createTreeScene';\n");
  run("unreferenced-webgl-leak", fixture, /A51 web renderer marker/);
  await rm(webPath);

  await writeFile(path.join(fixture, entry.bundle), Buffer.from("c61fbc03c103191f0000000000000000", "hex"));
  run("hermes-bytecode", fixture, /Unexpected Hermes bytecode/);
  await writeFile(path.join(fixture, entry.bundle), originalBundle);

  await writeFile(path.join(fixture, entry.bundle), "(() => {\n");
  run("invalid-javascript", fixture, /Unexpected end of input/);
  await writeFile(path.join(fixture, entry.bundle), originalBundle);

  const unsafe = structuredClone(metadata);
  unsafe.fileMetadata.android.assets[0].path = "../outside.png";
  await writeFile(path.join(temporary, "outside.png"), originalAssetBytes);
  await writeFile(path.join(fixture, "metadata.json"), JSON.stringify(unsafe));
  run("metadata-traversal", fixture, /Nonlocal android metadata reference/);
  await writeFile(path.join(fixture, "metadata.json"), originalMetadata);

  const wrongFormat = structuredClone(metadata);
  wrongFormat.fileMetadata.android.assets.find((asset) => asset.path === required).ext = "webp";
  await writeFile(path.join(fixture, "metadata.json"), JSON.stringify(wrongFormat));
  run("required-metadata-format", fixture, /required asset has wrong metadata format/);
  await writeFile(path.join(fixture, "metadata.json"), originalMetadata);

  const rootCopy = path.join(temporary, "manifest-copy");
  for (const name of ["app.json", "art/manifest.json", "art/a51/provenance.json", "art/a51/native-derivatives.json", "art/swords/runtime.json"]) {
    await mkdir(path.dirname(path.join(rootCopy, name)), { recursive: true });
    await cp(path.join(root, name), path.join(rootCopy, name));
  }
  const incomplete = JSON.parse(await readFile(path.join(rootCopy, "art/a51/native-derivatives.json"), "utf8"));
  delete incomplete.groups[0].full.sha256;
  await writeFile(path.join(rootCopy, "art/a51/native-derivatives.json"), JSON.stringify(incomplete));
  const missingHash = spawnSync(process.execPath, [checker, "--root", rootCopy, fixture], { encoding: "utf8" });
  const missingHashSummary = JSON.parse(missingHash.stdout.trim());
  ensure(missingHash.status === 1 && /Missing\/invalid declared A51 SHA-256/.test(missingHashSummary.error), "Missing declared manifest hash was not rejected");
  results.push({ name: "missing-declared-manifest-hash", expected: "reject", exitCode: missingHash.status, summary: missingHashSummary });

  const mutationTarget = path.join(fixture, "report-that-must-not-be-written.json");
  const reportAttempt = spawnSync(process.execPath, [checker, "--root", root, "--report", mutationTarget, fixture], { encoding: "utf8" });
  const rejectedReport = JSON.parse(reportAttempt.stdout.trim());
  ensure(reportAttempt.status === 1 && /Report must be outside/.test(rejectedReport.error), "Report-in-export was not rejected");
  ensure(await stat(mutationTarget).then(() => false, (e) => e.code === "ENOENT"), "Rejected report mutated export");
  results.push({ name: "report-output-cannot-mutate-export", expected: "reject-without-writing", exitCode: reportAttempt.status, summary: rejectedReport });

  run("restored-valid-copy", fixture, null);
  const inputsUnchanged = {
    metadata: sha(await readFile(path.join(root, "dist-android/metadata.json"))) === sha(originalMetadata),
    bundle: sha(await readFile(path.join(root, "dist-android", entry.bundle))) === sha(originalBundle),
    firstAsset: sha(await readFile(path.join(root, "dist-android", originalAsset))) === sha(originalAssetBytes),
    requiredA51Asset: sha(await readFile(path.join(root, "dist-android", required))) === sha(requiredBytes),
  };
  let verifiedInputs = 0;
  for (const [name, expected] of sourceHashes) {
    ensure(sha(await readFile(path.join(root, "dist-android", name))) === expected, `Actual source export changed: ${name}`);
    verifiedInputs++;
  }
  ensure(Object.values(inputsUnchanged).every(Boolean), "Actual source export changed");
  completed = { checkedAt: new Date().toISOString(), allPassed: true, cases: results.length,
    temporaryCopy: fixture, actualExportInputsUnchanged: inputsUnchanged, allOriginalMetadataInputsVerifiedUnchanged: verifiedInputs,
    simulatorTest: false, deviceTest: false, results };
} finally {
  await rm(temporary, { recursive: true, force: true });
}
completed.temporaryCopyRemovedAfterChecks = true;
await writeFile(path.join(output, "corruption-checks.json"), JSON.stringify(completed, null, 2) + "\n");
process.stdout.write(JSON.stringify({ allPassed: true, cases: results.length, actualExportInputsUnchanged: true,
  allOriginalMetadataInputsVerifiedUnchanged: completed.allOriginalMetadataInputsVerifiedUnchanged }) + "\n");
