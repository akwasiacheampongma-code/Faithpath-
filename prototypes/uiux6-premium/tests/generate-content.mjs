/** Deterministic build-time projection. Reads public sources; writes only content.js. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SOURCE_FILES, createRuntimeModel } from "../../../src/runtime-model.js";
import { BEGINNER_GUIDES, BOOK_ALIASES, GUIDED_PLANS, LIFE_TOPICS } from "../../../src/content.js";
import { normBook } from "../../../src/domain.js";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const output = fileURLToPath(new URL("../content.js", import.meta.url));
const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const model = createRuntimeModel(SOURCE_FILES.map((file) => readJSON(`data/${file}`)));
const chapterSelection = {
  JHN: Array.from({ length: 21 }, (_, i) => i + 1),
  PSA: [1, 23, 119],
  EPH: [6],
};
const publicReferences = [
  ...LIFE_TOPICS.flatMap((topic) => topic.refs),
  ...[...GUIDED_PLANS, ...BEGINNER_GUIDES].flatMap((entry) => entry.days.map(([, book, chapter, from, to]) => ({ book, chapter, from, to }))),
];
for (const reference of publicReferences) {
  const code = normBook(reference.book);
  chapterSelection[code] = [...new Set([...(chapterSelection[code] || []), reference.chapter])].sort((a, b) => a - b);
}
const sourceFiles = [
  "src/runtime-model.js", "src/content.js", "src/domain.js",
  ...SOURCE_FILES.map((file) => `data/${file}`),
  ...["otb", "l1912"].flatMap((translation) => Object.keys(chapterSelection).map((book) => `data/bibles/${translation}/${book}.json`)),
];
const questionFor = (id) => model.fp.get(id)?.question || model.n.get(id);
const stories = model.flow.stories.map((source) => ({
  id: source.story_id,
  kind: "story",
  title: source.title,
  ref: source.ref,
  book: normBook(source.references[0].book),
  chapter: source.references[0].chapter,
  questions: source.flow_items.length,
}));
const chapters = model.units.filter((unit) => unit.kind === "chapter-quiz").map((source) => ({
  id: `${normBook(source.book)}:${source.chapter + 1}`,
  kind: "chapter",
  title: source.title,
  ref: source.ref,
  book: normBook(source.book),
  chapter: source.chapter + 1,
  questions: source.questions.length,
}));
const units = {};
for (const id of ["NS-0297", "NS-0268", "NS-0271"]) {
  const source = model.stories.get(id);
  units[`story:${id}`] = {
    id,
    kind: "story",
    title: source.title,
    ref: source.ref,
    reflection: source.reflection,
    book: normBook(source.references[0].book),
    chapter: source.references[0].chapter,
    questions: source.flow_items.map(({ primary_question_id }) => questionFor(primary_question_id)),
    source,
    mappingLinks: model.flow.mapping_links.filter((link) => link.Story_ID === id),
  };
}
const chapterSource = model.units.find((unit) => unit.kind === "chapter-quiz" && normBook(unit.book) === "JHN" && unit.chapter + 1 === 15);
units["chapter:JHN:15"] = {
  id: "JHN:15",
  kind: "chapter",
  title: chapterSource.title,
  ref: chapterSource.ref,
  reflection: chapterSource.reflection,
  book: normBook(chapterSource.book),
  chapter: chapterSource.chapter + 1,
  questions: chapterSource.questions,
  source: chapterSource,
};
const content = {
  bibles: Object.fromEntries(["otb", "l1912"].map((translation) => [translation,
    Object.fromEntries(Object.entries(chapterSelection).map(([book, chapters]) => {
      const source = readJSON(`data/bibles/${translation}/${book}.json`);
      return [book, Object.fromEntries(chapters.map((chapter) => [chapter, source.chapters[chapter - 1]]))];
    })),
  ])),
  books: Object.keys(chapterSelection).map((code) => ({ code, name: model.books.find((book) => book.code === code).name })),
  bibleIndex: model.books,
  bookAliases: Object.fromEntries([
    ...Object.keys(BOOK_ALIASES),
    ...model.books.map(({ code }) => code.toLowerCase()),
    ...publicReferences.map(({ book }) => book),
  ].map((alias) => [alias, normBook(alias)])),
  catalog: [...stories, ...chapters],
  units,
  guided: [
    ...GUIDED_PLANS.map((source) => ({ kind: "plan", ...source })),
    ...BEGINNER_GUIDES.map((source) => ({ kind: "guide", ...source })),
  ],
  themes: LIFE_TOPICS,
  provenance: {
    sourceBaseCommit: "5a72d038a78bd10741a1902cb478b1963a94efe2",
    generator: "prototypes/uiux6-premium/tests/generate-content.mjs",
    sourceSha256: Object.fromEntries(sourceFiles.map((file) => [file, crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file))).digest("hex")])),
  },
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output,
  "// Generated exact public-source projection at FaithPath@5a72d038a78bd10741a1902cb478b1963a94efe2.\n" +
  "// Regenerate with tests/generate-content.mjs; see docs/CONTENT_PROVENANCE.md and assets/licenses.\n" +
  "window.PremiumContent = " + JSON.stringify(content, null, 2) + ";\n",
);
console.log(`Generated ${path.relative(root, output)}: ${content.catalog.length} public catalogue entries; ${Object.keys(units).length} exact sample units.`);
