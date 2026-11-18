import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const semver = require("semver");
const output = process.argv[2];
if (!output) throw new Error("Usage: node scripts/audit-locked-dependencies.mjs <report.json>");
const raw = await readFile("package-lock.json");
const lock = JSON.parse(raw);
const entries = Object.entries(lock.packages).filter(([location]) => location.includes("node_modules/"));
const names = new Map();
const skipped = [];
for (const [location, record] of entries) {
  const name = record.name ?? location.split("node_modules/").at(-1);
  if (!semver.valid(record.version)) {
    skipped.push({ location, reason: "No exact semver in lockfile" });
    continue;
  }
  if (!names.has(name)) names.set(name, new Set());
  names.get(name).add(record.version);
}

const bulk = "https://registry.npmjs.org/-/npm/v1/security/advisories/bulk";
const response = await fetch(bulk, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(Object.fromEntries([...names.entries()].map(([name, versions]) => [name, [...versions].sort()]))),
  signal: AbortSignal.timeout(30_000),
});
if (!response.ok) throw new Error(`npm registry advisory HTTP ${response.status}`);
const advisories = await response.json();
const findings = [];
for (const [name, records] of Object.entries(advisories)) {
  for (const advisory of records) {
    if (!semver.validRange(advisory.vulnerable_versions)) throw new Error(`Unknown advisory range for ${name}`);
    const affected = entries.filter(([location, pkg]) =>
      (pkg.name ?? location.split("node_modules/").at(-1)) === name &&
      semver.valid(pkg.version) && semver.satisfies(pkg.version, advisory.vulnerable_versions),
    ).map(([location, pkg]) => ({ location, version: pkg.version, devOnly: pkg.dev === true }));
    if (affected.length === 0) continue;
    const latestResponse = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`, { signal: AbortSignal.timeout(20_000) });
    const latest = latestResponse.ok ? (await latestResponse.json()).version : null;
    findings.push({ name, id: advisory.id, url: advisory.url, severity: advisory.severity, title: advisory.title,
      range: advisory.vulnerable_versions, affected, registryLatest: latest,
      registryLatestMatchesAffectedRange: latest ? semver.satisfies(latest, advisory.vulnerable_versions) : null });
  }
}
const report = {
  checkedAt: new Date().toISOString(), lockSha256: createHash("sha256").update(raw).digest("hex"),
  source: bulk, dependenciesChecked: entries.length - skipped.length, uniqueNames: names.size, skipped,
  onlyNamesAndVersionsSent: true, dependenciesChanged: false, findings,
  limitations: ["Direct advisory matches on exact lockfile versions including development packages and optional platform packages.",
    "Counts are direct matches, not npm audit's propagated dependency reports or proof of runtime reachability.",
    "Registry coverage and package metadata as of the query date. OS, platform and native binary components require their own analysis."],
};
await mkdir(path.dirname(output), {recursive:true});
await writeFile(output, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ dependenciesChecked: report.dependenciesChecked, uniqueNames: names.size,
  advisories: findings.map(({name,severity,affected,registryLatest,url}) => ({ name,severity,affected: affected.length,registryLatest,url })) }));
