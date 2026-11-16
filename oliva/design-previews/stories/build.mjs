import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { validateSample } from "./model.mjs";
const source = path.dirname(fileURLToPath(import.meta.url));
const app = path.resolve(source, "../..");
const target = path.resolve(process.argv[2] ?? "/workspace/sites/oliva-stories-design-preview");
const dist = path.join(target, "dist");
const sha = (raw) => createHash("sha256").update(raw).digest("hex");
const hosting = JSON.parse(await fs.readFile(path.join(target, ".openai/hosting.json"), "utf8"));
if (hosting.project_id !== "appgprj_6afb5c762278819193ed8d9fd2a322c7" || hosting.static.directory !== "dist")
  throw new Error("Use the separately created owner-private design Site.");
try { await fs.access(dist); throw new Error("Preserve the earlier dist before rebuilding."); }
catch (error) { if (error.code !== "ENOENT") throw error; }
await fs.mkdir(path.join(dist, "assets"), { recursive: true });
await fs.mkdir(path.join(target, "source"), { recursive: true });
await fs.mkdir(path.join(target, "scripts"), { recursive: true });
const catalog = validateSample(JSON.parse(await fs.readFile(path.join(source, "sample-data.json"), "utf8")));
const entries = [];
async function copy(from, name, original) {
  const raw = await fs.readFile(from);
  await fs.writeFile(path.join(dist, name), raw);
  entries.push({ path: name, source: original ?? path.relative(app, from), bytes: raw.length, sha256: sha(raw), unchangedSourceBytes: true });
}
for (const name of ["index.html", "app.mjs", "model.mjs", "styles.css", "sample-data.json"])
  await copy(path.join(source, name), name);
for (const name of ["DMSans.ttf", "CormorantGaramond.ttf"])
  await copy(path.join(app, "assets/fonts", name), "assets/" + name);
for (const image of new Set(catalog.stories.map((s) => s.image).filter(Boolean))) {
  await copy(path.join(app, "assets/images", image + "-640.webp"), "assets/" + image + "-640.webp");
  let large = path.join(app, "assets/images", image + "-1024.webp");
  try { await fs.access(large); } catch { large = path.join(app, "assets/images", image + "-1280.webp"); }
  await copy(large, "assets/" + image + "-large.webp");
}
const themeText = await fs.readFile(path.join(app, "src/design-system/theme.ts"), "utf8");
const palette = {};
for (const theme of ["light", "dark"]) {
  const fields = themeText.match(new RegExp(theme + ": \\{([\\s\\S]*?)\\n  \\}"))?.[1];
  if (!fields) throw new Error("Current OLIVA palette unavailable.");
  palette[theme] = Object.fromEntries([...fields.matchAll(/(\w+): "(#[a-fA-F0-9]+)"/g)].map((m) => [m[1], m[2]]));
  if (Object.keys(palette[theme]).length !== 12) throw new Error("Unexpected token set.");
}
const tokens = Object.entries(palette).map(([theme, colors]) =>
  (theme === "light" ? ":root" : ':root[data-theme="dark"]') + "{" +
  Object.entries(colors).map(([name, value]) => "--" + name + ":" + value).join(";") +
  ";color-scheme:" + theme + "}").join("\n") + "\n";
await fs.writeFile(path.join(dist, "tokens.css"), tokens);
entries.push({ path: "tokens.css", source: "src/design-system/theme.ts", sourceSha256: sha(themeText), bytes: Buffer.byteLength(tokens), sha256: sha(tokens), generatedFromCurrentPalette: true });
await fs.writeFile(path.join(dist, "robots.txt"), "User-agent: *\nDisallow: /\n");
await fs.writeFile(path.join(dist, "_headers"),
  "/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Cache-Control: private, no-cache\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'; form-action 'none'\n");
const record = {
  kind: "Owner-private isolated OLIVA design study, not a complete stories integration",
  project_id: hosting.project_id, createdAt: new Date().toISOString(),
  sourceApplicationVersion: JSON.parse(await fs.readFile(path.join(app, "package.json"), "utf8")).version,
  sourceApplicationCore: (await fs.readFile(path.join(app, "dist/index.html"), "utf8")).match(/name="oliva-build" content="([^"]+)"/)?.[1],
  sourceApplicationRuntimeDigest: JSON.parse(await fs.readFile(path.join(app, "docs/evidence/direct-selection/runtime-inputs.json"), "utf8")).runtimeSourceDigest,
  sourceOriginalCommit: catalog.sourceCommit,
  targetCatalog: catalog.targetCatalog, actualSample: catalog.sample,
  views: ["#bibliothek", "#geschichte/NS-0241/lesen", "#geschichte/NS-0073/lesen"],
  existingImagesOnly: true, generatedNewImages: false,
  applicationPersonalStorageUsed: false, noCollectionOrTreeWrites: true,
  persistence: "Preview tab JavaScript memory only; no local/session storage, IndexedDB, cookies, backend or automatic completion",
  browserQa: "Not performed for this managed Site: supported cua_repl.js unavailable. Node DOM checks are separate unit checks, not a browser/screenreader/device test.",
  files: entries,
};
await fs.writeFile(path.join(dist, "preview-manifest.json"), JSON.stringify(record, null, 2) + "\n");
for (const name of ["index.html", "app.mjs", "model.mjs", "styles.css", "sample-data.json", "provenance.json", "build.mjs", "check-preview.mjs"])
  await fs.copyFile(path.join(source, name), path.join(target, "source", name));
await fs.copyFile(path.join(source, "check-preview.mjs"), path.join(target, "scripts/check-preview.mjs"));
await fs.writeFile(path.join(target, ".gitignore"), ".env*\nnode_modules/\n");
await fs.writeFile(path.join(target, "README.md"),
  "# OLIVA · Geschichten-Gestaltungsstudie\n\nEigentümerprivate Vorschau mit unveränderter OLIVA-Palette, Originalschriften und vorhandenen Bildern. Sieben echte Originaleinheiten, 36 Fragen und sieben Reflexionsimpulse zeigen den vorgeschlagenen Ablauf. Keine neue Bildgenerierung, kein vollständiger Katalogimport und keine Verbindung zum persönlichen App-Zustand.\n\nDrei Hauptansichten: Bibliothek, In der Krippe (Lukas 2,1–20), Psalm 23 (ohne individuelles Bild). Der echte gemeinsame OLIVA-Reader öffnet sich als vorhandene App in einem neuen Tab. Vorschauantworten/-gedanken bleiben nur im Arbeitsspeicher dieser Seite. Vollintegration wartet auf die ausdrückliche Gestaltungsfreigabe.\n\nKeine gehostete Browser-/Geräteprüfung: CUA fehlt. Statische Paket-/Quellenkontrolle, Node DOM-Einheitstests und private HTTP-Prüfung werden getrennt dokumentiert.\n");
execFileSync(process.execPath, ["scripts/check-preview.mjs"], { cwd: target, stdio: "inherit" });
