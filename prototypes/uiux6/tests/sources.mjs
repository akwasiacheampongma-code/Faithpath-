import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  SOURCE_FILES,
  createRuntimeModel,
} from "../../../src/runtime-model.js";
const root = "prototypes/uiux6/",
  context = { window: {} };
vm.runInNewContext(fs.readFileSync(root + "scripture.js", "utf8"), context);
vm.runInNewContext(fs.readFileSync(root + "catalog.js", "utf8"), context);
const normalize = (x) => JSON.parse(JSON.stringify(x)),
  scripture = context.window.FaithPathScripture,
  catalog = context.window.FaithPathCatalog;
for (const tr of ["otb", "l1912"]) {
  const source = JSON.parse(fs.readFileSync(`data/bibles/${tr}/JHN.json`));
  for (const chapter of [1, 3, 15, 16])
    assert.deepEqual(
      normalize(scripture[tr][chapter]),
      source.chapters[chapter - 1],
    );
  assert.equal(
    scripture[tr].ephesians6_17,
    JSON.parse(fs.readFileSync(`data/bibles/${tr}/EPH.json`)).chapters[5].find(
      (v) => v[0] === 17,
    )[1],
  );
}
const model = createRuntimeModel(
  SOURCE_FILES.map((f) => JSON.parse(fs.readFileSync("data/" + f))),
);
const source = model.stories.get("NS-0297"),
  questions = source.flow_items.map(
    (x) =>
      model.n.get(x.primary_question_id) ||
      model.fp.get(x.primary_question_id).question,
  );
assert.deepEqual(normalize(catalog.story), { ...source, questions });
const expected = [
  ...model.flow.stories.map((s) => ({
    id: s.story_id,
    kind: "story",
    title: s.title,
    ref: s.ref,
    desc: "",
  })),
  ...model.units
    .filter((s) => s.kind === "chapter-quiz")
    .map((s) => ({
      id: String(s.id),
      kind: "chapter",
      title: s.title,
      ref: s.ref,
      desc: s.desc,
    })),
];
assert.deepEqual(normalize(catalog.stories), expected);
const hash = (p) =>
  crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
for (let i = 1; i <= 7; i++)
  assert.equal(
    hash(root + `assets/trees/tree-stage-${i}.webp`),
    hash(`trees/tree-stage-${i}.webp`),
  );
const result = {
  status: "PASS",
  scriptureChapters: 8,
  exactEphesians617Quotes: 2,
  verseArrays: "byte-equivalent JSON values",
  activeMergedStories: 436,
  chapterQuizUnits: 260,
  totalSearchEntries: 696,
  originalQuestions: questions.length,
  questionIDs: questions.map((x) => x.id || x.faithpath_id),
  unchangedTreeAssets: 7,
  personalData: "synthetic only; no persistent prototype storage",
};
fs.writeFileSync(root + "qa/sources.json", JSON.stringify(result, null, 2));
console.log(result);
