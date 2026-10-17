import test from "node:test";
import assert from "node:assert/strict";
const api = await import("../model.js")
  .then(() => globalThis.FaithPathModel)
  .catch(() => ({}));
test("Unknown variants/routes/themes fall back without accepting arbitrary CSS/HTML", () => {
  assert.equal(typeof api.route, "function");
  assert.deepEqual(api.route("?direction=evil&screen=x&theme=x"), {
    direction: "A",
    screen: "today",
    theme: "light",
    stage: 5,
  });
  assert.equal(api.route("?direction=B&screen=bible").theme, "atmospheric");
});
test("All seven tree examples are explicit independent choices, never earned by a completed step", () => {
  assert.equal(typeof api.initial, "function");
  const s = api.initial();
  const before = s.stage;
  api.completeStep(s);
  assert(s.stepDone);
  assert.equal(s.stage, before);
  assert.equal(s.confirmedDevelopment, false);
});
test("Saving a synthetic note preserves original reference and original records without inventing development", () => {
  assert.equal(typeof api.saveNote, "function");
  const s = api.initial(),
    old = structuredClone(s.journal);
  const n = api.saveNote(s, {
    text: " Mein neuer Gedanke. ",
    ref: { chapter: 15, verse: 5, translation: "otb" },
    path: true,
  });
  assert.equal(n.text, "Mein neuer Gedanke.");
  assert.deepEqual(n.ref, { chapter: 15, verse: 5, translation: "otb" });
  assert.deepEqual(s.journal.slice(1), old);
  assert.equal(s.stage, 5);
  assert.throws(() => api.saveNote(s, { text: "  " }));
});
test("Journal search matches words and actual Bible/path context without changing IDs", () => {
  assert.equal(typeof api.search, "function");
  const s = api.initial();
  const ids = s.journal.map((x) => x.id);
  assert.equal(api.search(s, "JOHANNES 15").length, 2);
  assert.equal(api.search(s, "zzzz").length, 0);
  assert.deepEqual(
    s.journal.map((x) => x.id),
    ids,
  );
});
test("Personal words become escaped text rather than executable markup", () => {
  assert.equal(typeof api.escape, "function");
  assert.equal(
    api.escape('<img src=x onerror="alert(1)">'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
  );
});
