// Static native-module inspection only; no exported app code is evaluated.
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { deepStrictEqual, strictEqual, ok } from "node:assert";

const ROOT = "/workspace/oliva-book-search";
const require = createRequire(path.join(ROOT, "package.json"));
const acorn = require("acorn");
const sha = raw => createHash("sha256").update(raw).digest("hex");
function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  if (typeof node.type === "string") visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(item => walk(item, visit));
    else if (value && typeof value === "object") walk(value, visit);
  }
}
function nodes(tree, test) {
  const found = [];
  walk(tree, node => { if (test(node)) found.push(node); });
  return found;
}
function propertyName(member) {
  return !member?.computed && member?.property?.type === "Identifier" ? member.property.name : null;
}
function methodCall(tree, method, value) {
  return nodes(tree, node => node.type === "CallExpression" &&
    node.callee?.type === "MemberExpression" && propertyName(node.callee) === method &&
    node.arguments.length === 1 && node.arguments[0]?.type === "Literal" && node.arguments[0].value === value).length;
}
function literal(node) {
  if (node?.type === "Literal" && !node.regex) return node.value;
  if (node?.type === "ArrayExpression") return node.elements.map(literal);
  if (node?.type === "ObjectExpression") return Object.fromEntries(node.properties.map(item => {
    ok(item.type === "Property" && !item.computed && !item.method && !item.shorthand);
    const key = item.key.type === "Identifier" ? item.key.name : item.key.value;
    return [key, literal(item.value)];
  }));
  throw new Error("Non-literal scope data");
}

const expected = [
  { value: "Alle", label: "Gesamte Bibel" },
  { value: "NT", label: "Neues Testament (NT)" },
  { value: "AT", label: "Altes Testament (AT)" },
];
const results = [];
for (const platform of ["android", "ios"]) {
  const directory = path.join(ROOT, "dist-" + platform);
  const metadata = JSON.parse(await fs.readFile(path.join(directory, "metadata.json"), "utf8"));
  const bundlePath = metadata.fileMetadata[platform].bundle;
  const raw = await fs.readFile(path.join(directory, bundlePath));
  const code = raw.toString("utf8");
  const tree = acorn.parse(code, { ecmaVersion: "latest", sourceType: "script" });
  const modules = tree.body.flatMap(statement => {
    const call = statement.type === "ExpressionStatement" ? statement.expression : null;
    return call?.type === "CallExpression" && call.callee?.type === "Identifier" && call.callee.name === "__d" &&
      call.arguments[0]?.type === "FunctionExpression" ? [call] : [];
  });
  const hasLiteral = (module, value) => nodes(module.arguments[0], node => node.type === "Literal" && node.value === value).length > 0;
  const selector = modules.filter(module => hasLiteral(module, "Bibelbereich schließen"));
  strictEqual(selector.length, 1, "Exactly one native scope selector module");
  const selectorCode = code.slice(selector[0].start, selector[0].end);
  ok(hasLiteral(selector[0], "radiogroup") && hasLiteral(selector[0], "radio"), "Native radio selection semantics");
  ok(hasLiteral(selector[0], "none") && nodes(selector[0].arguments[0], node =>
    node.type === "Property" && node.key?.type === "Identifier" && node.key.name === "onRequestClose").length,
    "Static modal and native back handling");
  strictEqual(nodes(selector[0].arguments[0], node => node.type === "Literal" && node.value === "select").length, 0,
    "No HTML select element inside native selector module");
  const domain = modules.filter(module => nodes(module.arguments[0], node =>
    node.type === "FunctionDeclaration" && node.id?.name === "normalizeBookSearch").length);
  strictEqual(domain.length, 1, "Exactly one shared book search module");
  const normalize = nodes(domain[0].arguments[0], node => node.type === "FunctionDeclaration" && node.id?.name === "normalizeBookSearch")[0];
  strictEqual(methodCall(normalize, "normalize", "NFKC"), 1);
  strictEqual(methodCall(normalize, "toLocaleLowerCase", "de"), 1);
  const regexes = nodes(normalize, node => node.type === "Literal" && node.regex);
  strictEqual(regexes.length, 1);
  strictEqual(regexes[0].regex.pattern, "[\\s\\p{White_Space}.]");
  strictEqual(regexes[0].regex.flags, "gu");
  const scopeData = nodes(domain[0].arguments[0], node => node.type === "VariableDeclarator" && node.id?.name === "BIBLE_SCOPES");
  strictEqual(scopeData.length, 1);
  deepStrictEqual(literal(scopeData[0].init), expected);
  const bibleModule = modules.filter(module => hasLiteral(module, "Worte für dein Leben."));
  strictEqual(bibleModule.length, 1);
  const defaultState = nodes(bibleModule[0].arguments[0], node => {
    if (node.type !== "CallExpression" || node.arguments.length !== 1 ||
        node.arguments[0]?.type !== "Literal" || node.arguments[0].value !== "Alle") return false;
    const callee = node.callee.type === "SequenceExpression" ? node.callee.expressions.at(-1) : node.callee;
    return callee?.type === "MemberExpression" && propertyName(callee) === "useState";
  });
  strictEqual(defaultState.length, 1, "Bible starts with all books");
  results.push({ platform, bundle: bundlePath, bundleSha256: sha(raw),
    selectorModule: { moduleId: selector[0].arguments[1].value, sha256: sha(selectorCode),
      nativeRadioAndModal: true, htmlSelectAbsent: true },
    normalizedSearchAndAllScopeLiteralVerified: true, defaultAllStateVerified: true });
}
const report = { status: "PASS", checkedAt: new Date().toISOString(), parser: `acorn@${acorn.version}`,
  appCodeExecuted: false, scope: "Static inspection of native Metro modules; no native runtime or accessibility behavior test.", results };
await fs.writeFile(path.join(ROOT, "docs/evidence/book-search/native/native-book-scope-check.json"), JSON.stringify(report, null, 2) + "\n");
process.stdout.write(JSON.stringify({ status: report.status, platforms: results.map(item => item.platform), appCodeExecuted: false }) + "\n");
