// Inspect actual unminified native Metro factories with Acorn. Never evaluates exported code.
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { strictEqual, ok } from "node:assert";

const ROOT = "/workspace/faithpath-next";
const OUT = path.join(ROOT, "docs/evidence/reader-parity/native/native-reader-check.json");
const require = createRequire(path.join(ROOT, "package.json"));
const acorn = require("acorn");
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  if (typeof node.type === "string") visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach(item => walk(item, visit));
    else if (value && typeof value === "object") walk(value, visit);
  }
}
function nodes(tree, predicate) {
  const found = [];
  walk(tree, node => { if (predicate(node)) found.push(node); });
  return found;
}
const key = node => node?.type === "Identifier" ? node.name : node?.type === "Literal" ? node.value : null;
const memberName = node => node?.type === "MemberExpression" && !node.computed ? key(node.property) : null;
const callee = call => call?.callee?.type === "SequenceExpression" ? call.callee.expressions.at(-1) : call?.callee;
const callNamed = (node, name) => node?.type === "CallExpression" && (memberName(callee(node)) === name || callee(node)?.type === "Identifier" && callee(node).name === name);
const hasLiteral = (tree, value) => nodes(tree, node => node.type === "Literal" && node.value === value).length > 0;
const functionNamed = (tree, name) => nodes(tree, node => ["FunctionExpression", "FunctionDeclaration"].includes(node.type) && node.id?.name === name).length > 0;
function unique(modules, predicate, label) {
  const found = modules.filter(predicate);
  strictEqual(found.length, 1, `Exactly one ${label} Metro module`);
  return found[0];
}
function schemaVersion(module, name, expected) {
  const declaration = nodes(module.arguments[0], node => node.type === "VariableDeclarator" && node.id?.type === "Identifier" && node.id.name === name);
  strictEqual(declaration.length, 1, `Bundled declaration ${name}`);
  const versions = nodes(declaration[0].init, node => node.type === "Property" && !node.computed && key(node.key) === "version" &&
    callNamed(node.value, "literal") && node.value.arguments.length === 1).map(node => node.value.arguments[0].value);
  strictEqual(versions.length, 1, `Exactly one literal version in ${name} initializer`);
  strictEqual(versions[0], expected, `${name} literal version`);
}
const results = [];
for (const platform of ["android", "ios"]) {
  const directory = path.join(ROOT, `dist-${platform}`);
  const metadata = JSON.parse(await fs.readFile(path.join(directory, "metadata.json"), "utf8"));
  const bundle = metadata.fileMetadata[platform].bundle;
  const raw = await fs.readFile(path.join(directory, bundle));
  const source = raw.toString("utf8");
  const ast = acorn.parse(source, { ecmaVersion: "latest", sourceType: "script" });
  const modules = ast.body.flatMap(statement => {
    const call = statement.type === "ExpressionStatement" ? statement.expression : null;
    return call?.type === "CallExpression" && call.callee?.type === "Identifier" && call.callee.name === "__d" &&
      call.arguments[0]?.type === "FunctionExpression" ? [call] : [];
  });
  ok(modules.length > 0, "Actual native Metro factories parsed");
  const identity = module => ({ moduleId: module.arguments[1].value, sha256: hash(source.slice(module.start, module.end)) });

  const clipboard = unique(modules, module => functionNamed(module.arguments[0], "writeText") && hasLiteral(module.arguments[0], "Der Text konnte nicht in die Zwischenablage kopiert werden."), "native clipboard adapter");
  const clipboardCalls = nodes(clipboard.arguments[0], node => callNamed(node, "setStringAsync"));
  strictEqual(clipboardCalls.length, 1, "Native adapter awaits one actual Expo setStringAsync call");
  ok(nodes(clipboard.arguments[0], node => node.type === "AwaitExpression" && callNamed(node.argument, "setStringAsync")).length === 1,
    "Native write result is awaited");
  ok(nodes(clipboard.arguments[0], node => node.type === "BinaryExpression" && node.operator === "!==" && node.right.type === "Literal" && node.right.value === true).length === 1,
    "Native adapter requires the actual true result");
  ok(!hasLiteral(clipboard.arguments[0], "Die Zwischenablage ist hier nicht verfügbar."), "Browser-only adapter error is absent from native adapter module");
  const bridge = unique(modules, module => hasLiteral(module.arguments[0], "onClipboardChanged") && nodes(module.arguments[0], node =>
    callNamed(node, "requireNativeModule") && node.arguments[0]?.type === "Literal" && node.arguments[0].value === "ExpoClipboard").length,
    "ExpoClipboard native bridge");

  const tools = unique(modules, module => functionNamed(module.arguments[0], "SelectionTools") && hasLiteral(module.arguments[0], "Auswahlwerkzeuge schließen"), "selection tools");
  ok(hasLiteral(tools.arguments[0], "dialog") && hasLiteral(tools.arguments[0], "none"), "Bundled selection dialog and no animation option");
  for (const property of ["onRequestClose", "onDismiss", "accessibilityViewIsModal"])
    ok(nodes(tools.arguments[0], node => node.type === "Property" && key(node.key) === property).length > 0, `Selection tools bundles ${property}`);
  ok(nodes(tools.arguments[0], node => callNamed(node, "setPassageHighlight")).length > 0, "Selection highlight store action bundled");
  ok(nodes(tools.arguments[0], node => callNamed(node, "setPassageBookmarked")).length > 0, "Selection bookmark store action bundled");

  const flow = unique(modules, module => functionNamed(module.arguments[0], "FlowText") && nodes(module.arguments[0], node => node.type === "Property" && key(node.key) === "onTextLayout").length,
    "native FlowText adapter");
  for (const property of ["selectedVerses", "focusRange", "onTextLayout"])
    ok(nodes(flow.arguments[0], node => node.type === "Property" && key(node.key) === property).length > 0, `Native FlowText bundles ${property}`);
  ok(!hasLiteral(flow.arguments[0], "span"), "DOM span rendering absent from native FlowText factory");

  const reader = unique(modules, module => functionNamed(module.arguments[0], "Reader") && hasLiteral(module.arguments[0], "Mehrere Verse auswählen"), "Reader route");
  const verseVariables = nodes(reader.arguments[0], node => node.type === "VariableDeclarator" && node.id.type === "Identifier" && node.id.name === "verses");
  strictEqual(verseVariables.length, 1, "Reader declares its canonical verse list once");
  const initializer = verseVariables[0].init;
  ok(initializer.type === "ConditionalExpression" && callNamed(initializer.consequent, "getChapter"),
    "Reader canonical verse list is the containing chapter, rather than the focused passage");
  strictEqual(initializer.consequent.arguments.length, 2, "Containing chapter lookup receives book/chapter only");
  ok(nodes(reader.arguments[0], node => callNamed(node, "displayReference")).length > 0, "Full-chapter flow reference construction bundled");
  ok(nodes(reader.arguments[0], node => node.type === "Property" && key(node.key) === "focusRange").length > 0,
    "Separate passage focus-range props bundled");

  const state = unique(modules, module => nodes(module.arguments[0], node => node.type === "VariableDeclarator" && node.id.type === "Identifier" && node.id.name === "v8DataSchema").length,
    "state schema");
  schemaVersion(state, "v8DataSchema", 8);
  schemaVersion(state, "dataSchema", 9);

  results.push({ platform, bundle, bundleSha256: hash(raw), parsedMetroFactories: modules.length,
    nativeClipboardAdapter: { ...identity(clipboard), awaitedExpoSetStringAsync: true, actualTrueResultRequired: true },
    expoNativeBridge: identity(bridge),
    selectionTools: { ...identity(tools), staticModalDismissAndBackPropsPresent: true, rangeStoreActionsPresent: true },
    nativeFlowText: { ...identity(flow), selectedVersesAndSeparateFocusRange: true, nativeTextLayoutProp: true, domSpanAbsent: true },
    readerRoute: { ...identity(reader), containingChapterLookup: true, fullChapterReferenceAndSeparateFocusRange: true },
    stateSchema: { ...identity(state), frozenV8Literal: 8, currentV9Literal: 9 } });
}
const report = { status: "PASS", checkedAt: new Date().toISOString(), appVersion: "0.13.0", parser: `acorn@${acorn.version}`,
  appCodeExecuted: false, scope: "Static AST inspection of actual native Metro factories and imports. Does not prove native rendering, clipboard operation, accessibility behavior, database migration or device/simulator behavior.", results };
await fs.writeFile(OUT, JSON.stringify(report, null, 2) + "\n", { flag: "wx" });
process.stdout.write(JSON.stringify({ status: report.status, platforms: results.map(item => item.platform), appCodeExecuted: false }) + "\n");
