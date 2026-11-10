#!/usr/bin/env node
// Static Metro JSON-module verification. Never imports or executes bundle code.
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { deepStrictEqual } from "node:assert";

const ROOT = "/workspace/faithpath-next";
const require = createRequire(path.join(ROOT, "package.json"));
const acorn = require("acorn");
const sha = (data) => createHash("sha256").update(data).digest("hex");
const fail = (code, detail = {}) => {
  const error = new Error(code);
  error.code = code;
  error.detail = detail;
  throw error;
};
const need = (test, code, detail = {}) => { if (!test) fail(code, detail); };
const keyName = (node) => node?.type === "Identifier" ? node.name :
  node?.type === "Literal" && ["string", "number"].includes(typeof node.value) ? String(node.value) : null;

function jsonLiteral(node) {
  if (node?.type === "Literal" && !node.regex && node.bigint === undefined &&
      (node.value === null || typeof node.value === "string" || typeof node.value === "boolean" ||
       typeof node.value === "number" && Number.isFinite(node.value))) return node.value;
  if (node?.type === "UnaryExpression" && node.operator === "-" &&
      node.argument?.type === "Literal" && typeof node.argument.value === "number" &&
      Number.isFinite(node.argument.value)) return -node.argument.value;
  if (node?.type === "ArrayExpression") return node.elements.map((item) => jsonLiteral(item));
  if (node?.type === "ObjectExpression") {
    const value = {};
    for (const item of node.properties) {
      need(item.type === "Property" && item.kind === "init" && !item.computed && !item.method && !item.shorthand,
        "UNSUPPORTED_JSON_PROPERTY");
      const key = keyName(item.key);
      need(key !== null && !Object.hasOwn(value, key), "UNSUPPORTED_OR_DUPLICATE_JSON_KEY");
      Object.defineProperty(value, key, { value: jsonLiteral(item.value), enumerable: true, configurable: true, writable: true });
    }
    return value;
  }
  fail("UNSUPPORTED_JSON_LITERAL");
}

function moduleLiteral(call) {
  const factory = call.arguments[0];
  if (!factory || factory.type !== "FunctionExpression" || factory.body.type !== "BlockStatement" ||
      factory.params[4]?.type !== "Identifier") return null;
  const moduleName = factory.params[4].name;
  const statements = factory.body.body.filter((statement) => statement.type !== "EmptyStatement" &&
    !(statement.type === "ExpressionStatement" && typeof statement.directive === "string"));
  if (statements.length !== 1) return null;
  const expression = statements[0]?.type === "ExpressionStatement" ? statements[0].expression : null;
  if (expression?.type !== "AssignmentExpression" || expression.operator !== "=" ||
      expression.left.type !== "MemberExpression" || expression.left.object.type !== "Identifier" ||
      expression.left.object.name !== moduleName || keyName(expression.left.property) !== "exports") return null;
  // Only the exact .exports or ["exports"] forms are accepted.
  if (expression.left.computed && expression.left.property.type !== "Literal") return null;
  if (expression.right.type !== "ObjectExpression" ||
      !expression.right.properties.some((property) => property.type === "Property" && keyName(property.key) === "chapters")) return null;
  const value = jsonLiteral(expression.right);
  if (!Array.isArray(value.chapters) || !value.chapters.some((chapter) => Array.isArray(chapter?.questions))) return null;
  need(call.arguments[2]?.type === "ArrayExpression" && call.arguments[2].elements.length === 0,
    "CATALOG_JSON_MODULE_HAS_DEPENDENCIES");
  const idNode = call.arguments[1];
  need(idNode?.type === "Literal" && ["number", "string"].includes(typeof idNode.value), "UNSUPPORTED_MODULE_ID");
  return { value, moduleId: idNode.value, start: call.start, end: call.end,
    namedSource: call.arguments[3]?.type === "Literal" && typeof call.arguments[3].value === "string" &&
      /(?:^|\/)src\/data\/nt-catalog\.json$/.test(call.arguments[3].value) ? "src/data/nt-catalog.json" : null };
}

function counts(value) {
  need(value && Array.isArray(value.chapters), "INVALID_CATALOG_STRUCTURE");
  const questions = value.chapters.flatMap((chapter) => {
    need(Array.isArray(chapter.questions), "INVALID_CHAPTER_QUESTIONS");
    return chapter.questions;
  });
  return { books: new Set(value.chapters.map((chapter) => chapter.book)).size,
    chapters: value.chapters.length, questions: questions.length,
    questions_per_chapter: value.chapters.every((chapter) => chapter.questions.length === 5) ? 5 : null,
    unique_question_ids: new Set(questions.map((question) => question.id)).size,
    reference_ranges: questions.reduce((sum, question) => sum + (Array.isArray(question.referenceRanges) ? question.referenceRanges.length : 0), 0) };
}

async function checkExport(folder, expected) {
  const exportRoot = path.resolve(folder);
  const metadataBytes = await fs.readFile(path.join(exportRoot, "metadata.json"));
  const metadata = JSON.parse(metadataBytes.toString("utf8"));
  need(metadata.bundler === "metro" && metadata.fileMetadata && typeof metadata.fileMetadata === "object", "UNSUPPORTED_EXPORT_METADATA");
  const platforms = Object.entries(metadata.fileMetadata).filter(([platform]) => ["android", "ios"].includes(platform));
  need(platforms.length > 0, "NO_NATIVE_PLATFORM_IN_METADATA");
  const results = [];
  for (const [platform, data] of platforms) {
    need(typeof data.bundle === "string" && data.bundle.endsWith(".js"), "EXPORT_REQUIRES_JAVASCRIPT_BUNDLE", { platform });
    const bundlePath = path.resolve(exportRoot, data.bundle);
    const relative = path.relative(exportRoot, bundlePath);
    need(relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative), "BUNDLE_OUTSIDE_EXPORT_ROOT");
    const bytes = await fs.readFile(bundlePath);
    const source = bytes.toString("utf8");
    let ast;
    try { ast = acorn.parse(source, { ecmaVersion: "latest", sourceType: "script" }); }
    catch { fail("JAVASCRIPT_PARSE_FAILED", { platform }); }
    const modules = ast.body.filter((statement) => statement.type === "ExpressionStatement" &&
      statement.expression.type === "CallExpression" && statement.expression.callee.type === "Identifier" &&
      statement.expression.callee.name === "__d").map((statement) => statement.expression);
    const candidates = modules.map(moduleLiteral).filter(Boolean);
    need(candidates.length === 1, "EXPECTED_ONE_NT_CATALOG_JSON_MODULE", { platform, candidates: candidates.length });
    const catalog = candidates[0];
    try { deepStrictEqual(catalog.value, expected); }
    catch { fail("CATALOG_CONTENT_MISMATCH", { platform, module_id: catalog.moduleId }); }
    const actualCounts = counts(catalog.value);
    results.push({ platform, bundle: data.bundle, bundle_bytes: bytes.length, bundle_sha256: sha(bytes),
      metro_modules_scanned: modules.length, module_id: catalog.moduleId,
      source_name_in_bundle: catalog.namedSource,
      identification: catalog.namedSource ? "module-source-name-and-complete-deep-equality" : "json-module-literal-shape-and-complete-deep-equality",
      literal_module_sha256: sha(source.slice(catalog.start, catalog.end)),
      literal_json_sha256: sha(JSON.stringify(catalog.value)), full_deep_equality: true,
      matched: actualCounts });
  }
  return { export_directory: exportRoot, metadata_sha256: sha(metadataBytes), platforms: results };
}

let reportPath;
let report;
try {
  const args = process.argv.slice(2);
  const folders = [];
  while (args.length) {
    const arg = args.shift();
    if (arg === "--report") {
      need(!reportPath && args.length > 0, "INVALID_REPORT_ARGUMENT");
      reportPath = path.resolve(args.shift());
    } else { need(!arg.startsWith("--"), "UNKNOWN_ARGUMENT"); folders.push(arg); }
  }
  need(folders.length > 0, "USAGE_EXPECTED_EXPORT_DIRECTORIES");
  const expectedBytes = await fs.readFile(path.join(ROOT, "src/data/nt-catalog.json"));
  const expected = JSON.parse(expectedBytes.toString("utf8"));
  const expectedCounts = counts(expected);
  need(expectedCounts.books === 27 && expectedCounts.chapters === 260 && expectedCounts.questions === 1300 &&
    expectedCounts.questions_per_chapter === 5 && expectedCounts.unique_question_ids === 1300 && expectedCounts.reference_ranges === 1304,
    "SOURCE_CATALOG_COUNTS_UNEXPECTED");
  const packageData = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
  const exports = [];
  for (const folder of folders) exports.push(await checkExport(folder, expected));
  report = { status: "PASS", checker: "static-metro-nt-catalog-v012", parser: `acorn@${acorn.version}`,
    bundle_code_executed: false,
    source: { path: "src/data/nt-catalog.json", package_version: packageData.version,
      bytes: expectedBytes.length, sha256: sha(expectedBytes), json_sha256: sha(JSON.stringify(expected)), counts: expectedCounts },
    comparison: "Complete deepStrictEqual of all chapter/question fields, original strings, options and reference arrays in order; no code evaluation.",
    exports };
} catch (error) {
  report = { status: "FAIL", checker: "static-metro-nt-catalog-v012", bundle_code_executed: false,
    code: error.code ?? "CHECKER_IO_OR_METADATA_ERROR", ...(error.detail ?? {}) };
  process.exitCode = 1;
}
const output = JSON.stringify(report, null, 2) + "\n";
if (reportPath) {
  try { await fs.mkdir(path.dirname(reportPath), { recursive: true }); await fs.writeFile(reportPath, output); }
  catch { process.stderr.write('Failed to write metadata report.\n'); process.exitCode = 1; }
}
process.stdout.write(output);
