import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { filterStories, readerURL, feedback, validateSample } from "./model.mjs";
const catalog = JSON.parse(await fs.readFile(new URL("./sample-data.json", import.meta.url), "utf8"));

test("the preview states its seven samples separately from the complete approved target", () => {
  assert.equal(validateSample(catalog), catalog);
  assert.deepEqual(catalog.targetCatalog, { units: 436, questions: 2479, reflections: 436 });
  assert.deepEqual(catalog.sample, { units: 7, questions: 36, reflections: 7 });
  assert.throws(() => validateSample({ ...catalog, targetCatalog: { ...catalog.targetCatalog, questions: 36 } }));
});
test("library search tolerates spaces and keeps the whole Bible as default", () => {
  for (const search of ["Lukas ", " L u k a s ", "Ｌｕｋａｓ", "Lukas\u00a0"])
    assert.deepEqual(filterStories(catalog.stories, search).map((s) => s.id), ["NS-0241"]);
  assert.equal(filterStories(catalog.stories, " \u2009 ").length, 7);
  assert.equal(filterStories(catalog.stories, "", "NT").length, 3);
  assert.equal(filterStories(catalog.stories, "", "AT").length, 4);
  assert.deepEqual(filterStories(catalog.stories, "", "Alle", "Psalmen").map((s) => s.id), ["NS-0073"]);
  assert.equal(filterStories(catalog.stories, "nichts passt").length, 0);
});
test("all original choices retain their order, correct index and verbatim evidence", () => {
  const original = JSON.stringify(catalog);
  for (const story of catalog.stories)
    for (const q of story.questions)
      for (let i = 0; i < 4; i++) {
        const result = feedback(q, i);
        assert.equal(result.correct, i === q.correctIndex);
        assert.equal(result.answer, q.options[q.correctIndex]);
        assert.equal(result.evidence, q.evidence);
      }
  assert.equal(JSON.stringify(catalog), original);
  assert.throws(() => feedback(catalog.stories[0].questions[0], 4));
  assert.throws(() => feedback(catalog.stories[0].questions[0], 0.5));
});
test("reader links use the existing shared reader with exact original bounds", () => {
  const story = catalog.stories.find((s) => s.id === "NS-0241");
  const url = new URL(readerURL(story.references[0]));
  assert.equal(url.origin, "https://oliva-v04-private-preview.purplebean128.chatgpt.site");
  assert.equal(url.pathname, "/lesen/LUK");
  assert.deepEqual(Object.fromEntries(url.searchParams), { chapter: "2", from: "1", to: "20" });
  assert.throws(() => readerURL({ book: "../../start", chapter: 2 }));
  assert.throws(() => readerURL({ book: "LUK", chapter: 2, from: 20, to: 1 }));
});
test("the Psalm has no individual image or image placeholder", () => {
  const psalm = catalog.stories.find((s) => s.id === "NS-0073");
  assert.equal(psalm.image, null);
  assert.equal(psalm.title, "Der HERR ist mein Hirte");
  assert.equal(psalm.verses.length, 6);
  assert.equal(psalm.questions.length, 5);
  assert.ok(psalm.reflection.startsWith("Ob ich schon wanderte im finstern Tal"));
});
