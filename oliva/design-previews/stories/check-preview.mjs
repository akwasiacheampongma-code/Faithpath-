import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const root = path.resolve(process.argv[2] ?? "dist");
const record = JSON.parse(await fs.readFile(path.join(root, "preview-manifest.json"), "utf8"));
for (const f of record.files) {
  const raw = await fs.readFile(path.join(root, f.path));
  assert.equal(raw.length, f.bytes, f.path);
  assert.equal(createHash("sha256").update(raw).digest("hex"), f.sha256, f.path);
}
const html = await fs.readFile(path.join(root, "index.html"), "utf8");
assert.match(html, /<html lang="de">/);
assert.match(html, /noindex,nofollow/);
assert.match(html, /viewport-fit=cover/);
const source = await fs.readFile(path.join(root, "app.mjs"), "utf8");
for (const forbidden of ["localStorage", "sessionStorage", "indexedDB", "registerServiceWorker", "useApp.getState", "document.cookie", "innerHTML"])
  assert.ok(!source.includes(forbidden), "Preview must not use " + forbidden);
assert.match(source, /memories = new Map/);
const catalog = JSON.parse(await fs.readFile(path.join(root, "sample-data.json"), "utf8"));
assert.equal(catalog.stories.length, 7);
assert.equal(catalog.stories.reduce((sum, story) => sum + story.questions.length, 0), 36);
assert.deepEqual(catalog.targetCatalog, { units: 436, questions: 2479, reflections: 436 });
assert.equal(catalog.stories.find((s) => s.id === "NS-0073").image, null);
assert.equal(catalog.stories.find((s) => s.id === "NS-0241").image, "nativity");
for (const story of catalog.stories) {
  assert.ok(story.reflection.length > 0);
  if (story.image) {
    await fs.access(path.join(root, "assets/" + story.image + "-640.webp"));
    await fs.access(path.join(root, "assets/" + story.image + "-large.webp"));
  }
}
const result = { passed: true, checkedAt: new Date().toISOString(), views: 3, sampleUnits: 7, sampleQuestions: 36, sampleReflections: 7, filesHashed: record.files.length, existingImagesOnly: true, personalApplicationDataWritten: false, scope: "Static package and source checks; no browser, screenreader or device execution." };
await fs.writeFile(path.join(path.dirname(root), "preview-validation.json"), JSON.stringify(result, null, 2) + "\n");
process.stdout.write(JSON.stringify(result) + "\n");
