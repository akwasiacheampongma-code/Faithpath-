/** Extract only static literal data, never execute the inherited JavaScript. */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { parse } from "acorn";

function literal(node) {
  if (node?.type === "Literal" && !node.regex && !node.bigint &&
    (node.value === null || ["string", "number", "boolean"].includes(typeof node.value))) return node.value;
  if (node?.type === "ArrayExpression") return node.elements.map(literal);
  if (node?.type === "ObjectExpression") {
    const result = {};
    for (const p of node.properties) {
      if (p.type !== "Property" || p.computed || p.method || p.shorthand || p.kind !== "init")
        throw new Error("Only original literal properties are accepted");
      const name = p.key.type === "Identifier" ? p.key.name : p.key.value;
      if (typeof name !== "string" || Object.hasOwn(result, name) || ["__proto__", "constructor", "prototype"].includes(name))
        throw new Error("Unsupported or duplicate literal key");
      Object.defineProperty(result, name, { value: literal(p.value), enumerable: true });
    }
    return result;
  }
  throw new Error("Unsupported nonliteral original content: " + node?.type);
}
export function originalLifeTopics(source) {
  const tree = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  const declarations = tree.body.filter((n) => n.type === "ExportNamedDeclaration" && n.declaration?.type === "VariableDeclaration")
    .flatMap((n) => n.declaration.declarations).filter((n) => n.id.type === "Identifier" && n.id.name === "LIFE_TOPICS");
  if (declarations.length !== 1) throw new Error("Expected exactly one original LIFE_TOPICS export");
  return literal(declarations[0].init);
}
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const aliases = { MAR: "MRK", JOH: "JHN", JAK: "JAS" };
export function normalizeLifeTopics(original, corpus, snapshot, sourceHash) {
  if (!Array.isArray(original) || original.length !== 18 || new Set(original.map((t) => t.id)).size !== 18)
    throw new Error("Expected all 18 distinct original life topics");
  let count = 0;
  const topics = original.map((topic) => {
    if (!/^[a-z]+$/.test(topic.id) || !topic.title?.trim() || !topic.sub?.trim() || !topic.category?.trim() ||
      !Array.isArray(topic.refs) || topic.refs.length < 2 || topic.refs.length > 3) throw new Error("Invalid original topic");
    const steps = topic.refs.map((item) => {
      count++;
      const sourceBook = item.book.toUpperCase(), book = aliases[sourceBook] ?? sourceBook;
      const ref = { book, chapter: item.chapter, from: item.from, to: item.to };
      const verses = corpus[book]?.[String(item.chapter)]?.filter((v) => v.n >= item.from && v.n <= item.to) ?? [];
      if (![ref.chapter, ref.from, ref.to].every(Number.isInteger) || ref.from < 1 || ref.to < ref.from ||
        verses.length !== ref.to - ref.from + 1 || !item.context?.trim() || !item.question?.trim() || !item.label?.trim())
        throw new Error("Invalid original canonical range or text: " + topic.id + "/" + item.label);
      return { title: item.label, referenceLabel: item.label, sourceBook: item.book, ref,
        explanation: item.context, question: item.question };
    });
    return { id: "faithpath-topic-" + topic.id, sourceId: topic.id, title: topic.title,
      subtitle: topic.sub, sourceIcon: topic.icon, category: topic.category, steps };
  });
  if (count !== 45) throw new Error("Expected all 45 original references, contexts and reflection prompts");
  return { sourceCommit: snapshot, sourceFileSha256: sourceHash, topics };
}
export async function main(check = false) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const sourceRoot = path.join(root, "content/faithpath-topics");
  const provenance = JSON.parse(await readFile(path.join(sourceRoot, "provenance.json"), "utf8"));
  const raw = gunzipSync(await readFile(path.join(sourceRoot, provenance.archive)));
  if (raw.length !== provenance.bytes || hash(raw) !== provenance.sha256) throw new Error("Original content source bytes changed");
  const corpus = JSON.parse(await readFile(path.join(root, "src/data/bible.json"), "utf8"));
  const generated = normalizeLifeTopics(originalLifeTopics(raw.toString("utf8")), corpus, provenance.snapshot, provenance.sha256);
  const output = Buffer.from(JSON.stringify(generated, null, 2) + "\n");
  const file = path.join(root, "src/data/life-topics.json");
  if (check) { if (!(await readFile(file)).equals(output)) throw new Error("Generated original topic catalog differs"); }
  else await writeFile(file, output);
  const report = { topics: generated.topics.length, references: 45, contexts: 45, reflectionPrompts: 45,
    originalCategories: new Set(generated.topics.map((t) => t.category)).size,
    sourceHash: hash(raw), catalogHash: hash(output), originalExecuted: false,
    originalStringsPreserved: true, canonicalBoundsChecked: true,
    estimatedOriginalDurations: false, originalPrayersAdded: false };
  if (!check) await writeFile(path.join(sourceRoot, "import-report.json"), JSON.stringify(report, null, 2) + "\n");
  process.stdout.write(JSON.stringify({ checked: check, ...report }) + "\n");
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  await main(process.argv.includes("--check"));
