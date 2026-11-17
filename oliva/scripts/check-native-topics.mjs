#!/usr/bin/env node
// Inspect Metro's literal JSON module; never execute or import a native bundle.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "acorn";
import { deepStrictEqual, strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { originalLifeTopics } from "./import-life-topics.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
const propertyName = (n) => n?.type === "Identifier" ? n.name : n?.type === "Literal" ? n.value : null;
const args = process.argv.slice(2), folders = [];
let reportFile;
while (args.length) {
  const arg = args.shift();
  if (arg === "--report") { assert(!reportFile && args.length); reportFile = path.resolve(args.shift()); }
  else { assert(!arg.startsWith("--")); folders.push(path.resolve(arg)); }
}
assert(folders.length, "Provide at least one native export directory");
const sourceBytes = await readFile(path.join(root, "src/data/life-topics.json"));
const source = JSON.parse(sourceBytes);
assert.equal(source.topics.length, 18); assert.equal(source.topics.flatMap((t) => t.steps).length, 45);
const exports = [];
for (const folder of folders) {
  const metadata = JSON.parse(await readFile(path.join(folder, "metadata.json"), "utf8"));
  for (const [platform, data] of Object.entries(metadata.fileMetadata)) {
    if (!["android", "ios"].includes(platform)) continue;
    const file = path.resolve(folder, data.bundle);
    assert(file.startsWith(folder + path.sep) && file.endsWith(".js"), "Only local JavaScript exports are supported");
    const bytes = await readFile(file), code = bytes.toString("utf8");
    const tree = parse(code, { ecmaVersion: "latest", sourceType: "script" });
    const matches = [];
    for (const statement of tree.body) {
      const call = statement.type === "ExpressionStatement" ? statement.expression : null;
      if (call?.type !== "CallExpression" || call.callee.name !== "__d") continue;
      const factory = call.arguments[0];
      if (factory?.type !== "FunctionExpression" || factory.params[4]?.type !== "Identifier") continue;
      const body = factory.body.body.filter((s) => s.type !== "EmptyStatement" && !s.directive);
      if (body.length !== 1 || body[0].type !== "ExpressionStatement") continue;
      const assignment = body[0].expression;
      if (assignment.type !== "AssignmentExpression" || assignment.operator !== "=" || assignment.left.type !== "MemberExpression" ||
          assignment.left.object.name !== factory.params[4].name || propertyName(assignment.left.property) !== "exports" ||
          assignment.right.type !== "ObjectExpression") continue;
      if (!assignment.right.properties.some((p) => propertyName(p.key) === "topics")) continue;
      assert(call.arguments[2]?.type === "ArrayExpression" && call.arguments[2].elements.length === 0, "Literal catalog must have no bundle dependencies");
      const literal = originalLifeTopics("export const LIFE_TOPICS=" + code.slice(assignment.right.start, assignment.right.end) + ";");
      deepStrictEqual(literal, source);
      matches.push({ moduleId: call.arguments[1]?.value, completeCatalogEqual: true });
    }
    assert.equal(matches.length, 1, "Expected exactly one complete original topic catalog module");
    exports.push({ platform, bundle: data.bundle, bundleSha256: sha(bytes), matches });
  }
}
assert(exports.length > 0, "No Android/iOS bundle found");
const report = { status: "PASS", source: "src/data/life-topics.json", sourceSha256: sha(sourceBytes),
  topics: 18, references: 45, contexts: 45, reflectionPrompts: 45, exports,
  kind: "Static original JSON catalog equality in native JS/asset exports; no native execution, simulator or device test." };
if (reportFile) { await mkdir(path.dirname(reportFile), { recursive: true }); await writeFile(reportFile, JSON.stringify(report, null, 2) + "\n"); }
console.log(JSON.stringify(report, null, 2));
