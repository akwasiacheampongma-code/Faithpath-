/** Independently compare the prototype projection with the active public sources. */
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { SOURCE_FILES, createRuntimeModel } from "../../../src/runtime-model.js";
import { BEGINNER_GUIDES, BOOK_ALIASES, GUIDED_PLANS, LIFE_TOPICS } from "../../../src/content.js";
import { createChapterCatalog } from "../../../src/chapter-questions.js";
import { normBook } from "../../../src/domain.js";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const prototype = fileURLToPath(new URL("../", import.meta.url));
const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const model = createRuntimeModel(SOURCE_FILES.map((file) => readJSON(`data/${file}`)));
const chapterCatalog = createChapterCatalog(model.units, model.books);
const plain = (value) => JSON.parse(JSON.stringify(value));
const publicReferences = [
  ...LIFE_TOPICS.flatMap((topic) => topic.refs),
  ...[...GUIDED_PLANS, ...BEGINNER_GUIDES].flatMap((entry) => entry.days.map(([, book, chapter, from, to]) => ({ book, chapter, from, to }))),
];
const chapterSelection = { JHN: Array.from({ length: 21 }, (_, i) => i + 1), PSA: [1, 23, 119], EPH: [6] };
for (const reference of publicReferences) {
  const code = normBook(reference.book);
  chapterSelection[code] = [...new Set([...(chapterSelection[code] || []), reference.chapter])].sort((a, b) => a - b);
}
const totalChapterArrays = Object.values(chapterSelection).reduce((sum, chapters) => sum + chapters.length, 0) * 2;
const storyIDs = ["NS-0297", "NS-0268", "NS-0271"];
const passed = [];
let loaded;

function content() {
  const file = path.join(prototype, "content.js");
  assert.ok(fs.existsSync(file), "The generated public content fixture must exist");
  if (!loaded) {
    const context = { window: {} };
    vm.runInNewContext(fs.readFileSync(file, "utf8"), context, { filename: file });
    loaded = plain(context.window.PremiumContent);
  }
  return loaded;
}

function sourceTest(name, verify) {
  test(name, () => {
    verify(content());
    passed.push(name);
  });
}

sourceTest("all selected complete chapter arrays match the local Bible sources exactly", (fixture) => {
  assert.deepEqual(Object.keys(fixture.bibles).sort(), ["l1912", "otb"]);
  for (const translation of ["otb", "l1912"]) {
    assert.deepEqual(Object.keys(fixture.bibles[translation]).sort(), Object.keys(chapterSelection).sort());
    for (const [book, chapters] of Object.entries(chapterSelection)) {
      const source = readJSON(`data/bibles/${translation}/${book}.json`);
      assert.deepEqual(Object.keys(fixture.bibles[translation][book]).map(Number), chapters);
      for (const chapter of chapters) {
        assert.deepEqual(fixture.bibles[translation][book][chapter], source.chapters[chapter - 1], `${translation} ${book} ${chapter}`);
      }
    }
    assert.equal(fixture.bibles[translation].PSA[119].length, 176);
    assert.deepEqual(fixture.bibles[translation].PSA[119].map(([number]) => number), Array.from({ length: 176 }, (_, i) => i + 1));
  }
  assert.deepEqual(fixture.books, Object.keys(chapterSelection).map((code) => {
    const { name } = model.books.find((book) => book.code === code);
    return { code, name };
  }));
});

sourceTest("the complete Bible index preserves all 66 source books and 1189 chapters", (fixture) => {
  assert.deepEqual(fixture.bibleIndex, readJSON("data/index.json"));
  assert.equal(fixture.bibleIndex.length, 66);
  assert.equal(new Set(fixture.bibleIndex.map(({ code }) => code)).size, 66);
  assert.equal(fixture.bibleIndex.reduce((sum, { chapters }) => sum + chapters, 0), 1189);
});

sourceTest("every original theme and guided reference resolves to its exact local reading", (fixture) => {
  const expectedAliases = Object.fromEntries([
    ...Object.keys(BOOK_ALIASES),
    ...model.books.map(({ code }) => code.toLowerCase()),
    ...publicReferences.map(({ book }) => book),
  ].map((alias) => [alias, normBook(alias)]));
  assert.deepEqual(fixture.bookAliases, expectedAliases);
  for (const [alias, canonical] of Object.entries(BOOK_ALIASES)) assert.equal(fixture.bookAliases[alias], canonical);
  for (const reference of publicReferences) {
    const book = fixture.bookAliases[reference.book];
    assert.equal(book, normBook(reference.book));
    for (const translation of ["otb", "l1912"]) {
      const verses = fixture.bibles[translation]?.[book]?.[reference.chapter];
      assert.ok(verses, `${translation} ${reference.book} ${reference.chapter}`);
      const source = readJSON(`data/bibles/${translation}/${book}.json`).chapters[reference.chapter - 1];
      assert.deepEqual(verses, source);
      const numbers = new Set(verses.map(([number]) => number));
      for (let number = reference.from; number <= reference.to; number++) {
        assert.ok(numbers.has(number), `${translation} ${book} ${reference.chapter},${number}`);
      }
    }
  }
});

sourceTest("the complete catalogue has the 436 active stories and 260 chapter quizzes", (fixture) => {
  const stories = model.flow.stories.map((source) => ({
    id: source.story_id, kind: "story", title: source.title, ref: source.ref,
    book: normBook(source.references[0].book), chapter: source.references[0].chapter,
    questions: source.flow_items.length,
  }));
  const chapters = model.units.filter((unit) => unit.kind === "chapter-quiz").map((source) => ({
    id: `${normBook(source.book)}:${source.chapter + 1}`, kind: "chapter", title: source.title, ref: source.ref,
    book: normBook(source.book), chapter: source.chapter + 1, questions: source.questions.length,
  }));
  assert.equal(stories.length, 436);
  assert.equal(chapters.length, 260);
  assert.equal(fixture.catalog.length, 696);
  assert.deepEqual(fixture.catalog, [...stories, ...chapters]);
  assert.equal(new Set(fixture.catalog.map(({ kind, id }) => `${kind}:${id}`)).size, 696);
  assert.ok(fixture.catalog.every(({ book, chapter, questions }) => /^[A-Z0-9]{3}$/.test(book) && Number.isInteger(chapter) && chapter > 0 && questions > 0));
});

sourceTest("sample units preserve entire source objects and the active merged-question order", (fixture) => {
  assert.deepEqual(Object.keys(fixture.units), [...storyIDs.map((id) => `story:${id}`), "chapter:JHN:15"]);
  for (const id of storyIDs) {
    const original = model.stories.get(id);
    const unit = fixture.units[`story:${id}`];
    const questions = original.flow_items.map(({ primary_question_id }) => model.fp.get(primary_question_id)?.question || model.n.get(primary_question_id));
    assert.deepEqual(unit, {
      id, kind: "story", title: original.title, ref: original.ref, reflection: original.reflection,
      book: normBook(original.references[0].book), chapter: original.references[0].chapter,
      questions, source: original,
      mappingLinks: model.flow.mapping_links.filter((link) => link.Story_ID === id),
    });
  }
  const original = chapterCatalog.byChapter.get("JHN:15");
  assert.equal(original.chapter, 14, "Original chapter indexing remains untouched");
  assert.deepEqual(fixture.units["chapter:JHN:15"], {
    id: "JHN:15", kind: "chapter", title: original.title, ref: original.ref, reflection: original.reflection,
    book: "JHN", chapter: 15, questions: original.questions, source: original,
  });
  assert.equal(fixture.units["chapter:JHN:15"].questions.length, 5);
});

sourceTest("every sample question keeps its N/FP ID, four options, answer index, explanation and provenance", (fixture) => {
  const questions = Object.values(fixture.units).flatMap((unit) => unit.questions);
  const ids = questions.map((question) => question.id || question.faithpath_id);
  assert.equal(questions.length, 31);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.some((id) => id.startsWith("N-")));
  assert.ok(ids.some((id) => id.startsWith("FP-")));
  for (const question of questions) {
    const id = question.id || question.faithpath_id;
    assert.match(id, /^(N|FP)-\d{4}$/);
    assert.deepEqual(question, model.n.get(id) || model.fp.get(id)?.question, id);
    assert.equal(question.a.length, 4, id);
    assert.equal(new Set(question.a).size, 4, id);
    assert.ok(question.a.every((answer) => typeof answer === "string" && answer.trim()), id);
    assert.ok(Number.isInteger(question.c) && question.c >= 0 && question.c <= 3, id);
    assert.ok(question.q && question.ref && (question.x || question.answer), id);
    if (question.id) assert.equal(question.a[question.c], question.answer, id);
  }
});

sourceTest("guided entries and all life topics retain the existing public editorial copy", (fixture) => {
  assert.deepEqual(fixture.guided, [
    ...GUIDED_PLANS.map((source) => ({ kind: "plan", ...source })),
    ...BEGINNER_GUIDES.map((source) => ({ kind: "guide", ...source })),
  ]);
  assert.deepEqual(fixture.themes, LIFE_TOPICS);
  assert.equal(new Set(fixture.guided.map(({ kind, id }) => `${kind}:${id}`)).size, fixture.guided.length);
  assert.equal(new Set(fixture.themes.map(({ id }) => id)).size, fixture.themes.length);
  assert.equal(fixture.guided.length, 7);
  assert.equal(fixture.themes.length, 18);
});

sourceTest("provenance identifies the base commit and hashes every public input", (fixture) => {
  assert.equal(fixture.provenance.sourceBaseCommit, "5a72d038a78bd10741a1902cb478b1963a94efe2");
  assert.equal(fixture.provenance.generator, "prototypes/uiux6-premium/tests/generate-content.mjs");
  const expectedInputs = [
    "src/runtime-model.js", "src/content.js", "src/domain.js",
    ...SOURCE_FILES.map((file) => `data/${file}`),
    ...["otb", "l1912"].flatMap((translation) => Object.keys(chapterSelection).map((book) => `data/bibles/${translation}/${book}.json`)),
  ];
  assert.deepEqual(Object.keys(fixture.provenance.sourceSha256), expectedInputs);
  for (const [file, digest] of Object.entries(fixture.provenance.sourceSha256)) {
    assert.equal(digest, crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex"), file);
  }
});

after(() => {
  if (passed.length !== 8) return;
  const fixture = content();
  const report = {
    status: "PASS", sourceBaseCommit: fixture.provenance.sourceBaseCommit,
    assertions: passed, sourceFiles: Object.keys(fixture.provenance.sourceSha256).length,
    completeBibleChapterArrays: totalChapterArrays, availableReaderBooks: fixture.books.length,
    bibleIndexBooks: fixture.bibleIndex.length,
    bibleIndexChapters: fixture.bibleIndex.reduce((sum, { chapters }) => sum + chapters, 0),
    coveredEditorialReferences: publicReferences.length, bookAliases: Object.keys(fixture.bookAliases).length,
    psalm119VersesPerTranslation: 176,
    activeMergedStories: 436, chapterQuizUnits: 260, totalSearchEntries: 696,
    sampleUnits: Object.keys(fixture.units),
    originalQuestions: Object.values(fixture.units).reduce((sum, unit) => sum + unit.questions.length, 0),
    questionIDs: Object.values(fixture.units).flatMap((unit) => unit.questions.map((question) => question.id || question.faithpath_id)),
    existingGuidedEntries: fixture.guided.length, existingLifeTopics: fixture.themes.length,
    sourceSha256: fixture.provenance.sourceSha256,
    storage: "Static public sources only; no user data or production-state imports",
  };
  fs.mkdirSync(path.join(prototype, "qa"), { recursive: true });
  fs.writeFileSync(path.join(prototype, "qa/sources.json"), JSON.stringify(report, null, 2) + "\n");
});
