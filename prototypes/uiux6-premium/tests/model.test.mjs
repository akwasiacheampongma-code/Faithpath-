import test from "node:test";
import assert from "node:assert/strict";

await import("../model.js").catch(() => {});
const api = globalThis.PremiumModel || {};
const copy = (value) => structuredClone(value);
function initial(scenario) {
  assert.equal(
    typeof api.initial,
    "function",
    "PremiumModel.initial is implemented",
  );
  return api.initial(scenario);
}

test("personal words are escaped without a DOM or browser globals", () => {
  assert.equal(typeof api.escape, "function");
  assert.equal(
    api.escape("<img src=\"x\"> & 'hello'"),
    "&lt;img src=&quot;x&quot;&gt; &amp; &#39;hello&#39;",
  );
});

test("returning seed keeps October source wording and independently cloned state", () => {
  const state = initial();
  assert.equal(state.scenario, "returning");
  assert.equal(state.stage, 4);
  assert.equal(state.theme, "light");
  const before = state.journal.find((entry) => entry.id === "j-before");
  const now = state.journal.find((entry) => entry.id === "j-now");
  assert.match(before.at, /^2026-10-09T/);
  assert.match(now.at, /^2026-10-16T/);
  assert.deepEqual(state.reviews[0].sourceSnapshot, {
    text: before.text,
    title: before.title,
    at: before.at,
  });
  assert.equal(state.reviews[0].text, now.text);
  state.paths[0].steps[0].done = true;
  assert.equal(initial().paths[0].steps[0].done, false);
});

test("empty, many, long and archived scenarios cover meaningful edge states", () => {
  const empty = initial("empty");
  assert.equal(empty.stage, 1);
  assert.deepEqual(
    [empty.journal, empty.paths, empty.reviews, empty.explored],
    [[], [], [], []],
  );
  assert.equal(initial("many").paths.length, 20);
  assert.equal(initial("many").journal.length, 40);
  assert(initial("long").journal.some((entry) => entry.text.length >= 12000));
  assert.equal(initial("archived").paths[0].archived, true);
  assert.equal(initial("unknown").scenario, "returning");
});

test("a nonempty draft survives reopening with its exact original context", () => {
  const state = initial();
  const ref = { book: "JHN", chapter: 15, from: 4, to: 5, translation: "otb" };
  const origin = {
    kind: "story",
    id: "original-unit-2",
    title: "Der genaue Titel",
  };
  const draft = api.createDraft(state, {
    ref,
    origin,
    pathIds: ["p-listen"],
    sourceId: "j-before",
  });
  draft.text = "Noch nicht fertig.";
  ref.chapter = 3;
  origin.title = "Changed outside";
  const previous = copy(draft);
  assert.equal(
    api.createDraft(state, { ref: null, pathIds: [], sourceId: "j-now" }),
    draft,
  );
  assert.deepEqual(state.draft, previous);
  assert.equal(draft.ref.chapter, 15);
  assert.equal(draft.origin.title, "Der genaue Titel");
  api.discardDraft(state);
  assert.equal(state.draft, null);
});

test("saving validates before mutation, trims words and retains links and origin", () => {
  const state = initial();
  const before = copy(state.journal);
  api.createDraft(state, {
    pathIds: ["p-listen"],
    origin: { kind: "chapter", id: "JHN:15", title: "Johannes 15" },
  });
  assert.equal(api.saveDraft(state, { text: "  " }).ok, false);
  assert.deepEqual(state.journal, before);
  assert(state.draft);
  const result = api.saveDraft(state, {
    text: "  Mein neuer Gedanke.  ",
    title: "  Ein Titel  ",
  });
  assert.equal(result.ok, true);
  assert.equal(result.entry.text, "Mein neuer Gedanke.");
  assert.equal(result.entry.title, "Ein Titel");
  assert.deepEqual(result.entry.origin, {
    kind: "chapter",
    id: "JHN:15",
    title: "Johannes 15",
  });
  assert.deepEqual(result.entry.pathIds, ["p-listen"]);
  assert(
    state.paths[0].links.some((link) => link.journalId === result.entry.id),
  );
  assert.match(result.entry.at, /^2026-10-17T/);
  assert.equal(state.draft, null);
});

test("new note IDs stay unique after deleting a recently created note", () => {
  const state = initial();
  api.createDraft(state);
  const first = api.saveDraft(state, { text: "Erster Gedanke." }).entry;
  api.deleteNote(state, first.id);
  api.createDraft(state);
  const second = api.saveDraft(state, { text: "Zweiter Gedanke." }).entry;
  assert.notEqual(second.id, first.id);
});

test("editing keeps the same note ID and date while preserving historical review truth", () => {
  const state = initial();
  const before = copy(state.journal.find((entry) => entry.id === "j-before"));
  const snapshot = copy(state.reviews[0].sourceSnapshot);
  const count = state.journal.length;
  api.editDraft(state, before.id);
  const result = api.saveDraft(state, {
    text: "Heute formuliere ich es anders.",
    pathIds: [],
  });
  assert.equal(result.ok, true);
  assert.equal(result.entry.id, before.id);
  assert.equal(result.entry.at, before.at);
  assert.match(result.entry.updatedAt, /^2026-10-17T/);
  assert.equal(state.journal.length, count);
  assert.deepEqual(state.reviews[0].sourceSnapshot, snapshot);
  assert(!state.paths[0].links.some((link) => link.journalId === before.id));
});

test("saving a review uses the captured source even after that source is edited", () => {
  const state = initial();
  const old = copy(state.journal.find((entry) => entry.id === "j-before"));
  api.createDraft(state, { sourceId: old.id, pathIds: ["p-listen"] });
  state.journal.find((entry) => entry.id === old.id).text =
    "Später bearbeitet.";
  const result = api.saveDraft(state, { text: "Ich sehe heute mehr Geduld." });
  assert.equal(result.ok, true);
  const review = state.reviews.at(-1);
  assert.deepEqual(review.sourceSnapshot, {
    text: old.text,
    title: old.title,
    at: old.at,
  });
  assert.equal(review.sourceId, old.id);
  assert.equal(review.confirmedDevelopment, false);
  assert.equal(state.paths[0].milestones.length, 0);
  assert.equal(state.stage, 4);
});

test("a story reflection preserves original unit identity without inventing a journal source", () => {
  const state = initial();
  const reviews = state.reviews.length;
  const origin = {
    kind: "story",
    id: "nt-lk-10",
    title: "Der barmherzige Samariter",
  };
  api.createDraft(state, { origin });
  const result = api.saveDraft(state, { text: "Ich möchte genauer hinsehen." });
  assert.deepEqual(result.entry.origin, origin);
  assert.equal(state.reviews.length, reviews);
});

test("deleting removes note connections and reminders but retains historical wording", () => {
  const state = initial();
  state.reminders.push({
    id: "rem-1",
    sourceId: "j-before",
    at: "2026-10-24T08:00:00.000Z",
  });
  const snapshot = copy(state.reviews[0].sourceSnapshot);
  const payload = api.deleteNote(state, "j-before");
  assert(payload);
  assert(!state.journal.some((entry) => entry.id === "j-before"));
  assert(!state.paths[0].links.some((link) => link.journalId === "j-before"));
  assert.equal(state.reminders.length, 0);
  assert.deepEqual(state.reviews[0].sourceSnapshot, snapshot);
  assert.equal(state.reviews[0].sourceMissing, true);
  assert.equal(api.deleteNote(state, "absent"), null);
});

test("undo deletion restores original position and references exactly once", () => {
  const state = initial();
  state.reminders.push({
    id: "rem-1",
    sourceId: "j-before",
    at: "2026-10-24T08:00:00.000Z",
  });
  const before = copy(state);
  const payload = api.deleteNote(state, "j-before");
  assert.equal(api.undoDelete(state, payload), true);
  assert.deepEqual(state, before);
  assert.equal(api.undoDelete(state, payload), false);
  assert.deepEqual(state, before);
});

test("search finds actual Bible and path context and applies linked and Bible filters", () => {
  const state = initial();
  const ids = state.journal.map((entry) => entry.id);
  assert(api.searchJournal(state, "JOHANNES 15", "bible").length >= 2);
  assert(api.searchJournal(state, "In Ruhe zuhören", "linked").length >= 2);
  assert.equal(api.searchJournal(state, "unauffindbar").length, 0);
  assert(api.searchJournal(state, "", "bible").every((entry) => entry.ref));
  assert(
    api
      .searchJournal(state, "", "linked")
      .every((entry) => entry.pathIds.length),
  );
  assert.deepEqual(
    state.journal.map((entry) => entry.id),
    ids,
  );
});

test("steps can be added, edited, completed and archived without automatic development", () => {
  const state = initial();
  const path = state.paths[0];
  const stage = state.stage;
  const added = api.addStep(state, path.id, "  Einen Moment warten.  ");
  assert.equal(added.text, "Einen Moment warten.");
  assert.equal(api.addStep(state, path.id, " "), null);
  assert.equal(api.editStep(state, path.id, added.id, "  Erst atmen.  "), true);
  assert.equal(added.text, "Erst atmen.");
  assert.equal(api.toggleStep(state, path.id, added.id), true);
  assert.equal(added.done, true);
  assert.equal(api.archivePath(state, path.id, true), true);
  assert.equal(path.archived, true);
  assert.equal(api.archivePath(state, path.id, false), true);
  assert.equal(path.archived, false);
  assert.equal(state.stage, stage);
  assert.deepEqual(path.milestones, []);
});

test("only explicit confirmation creates development, retaining the illustrative demo stage", () => {
  const state = initial();
  const result = api.confirmDevelopment(
    state,
    "p-listen",
    "  Ich höre ruhiger zu.  ",
  );
  assert.equal(result.ok, true);
  assert.equal(result.milestone.text, "Ich höre ruhiger zu.");
  assert.equal(state.paths[0].milestones.length, 1);
  assert.equal(state.stage, 4);
  assert.equal(api.confirmDevelopment(state, "p-listen", " ").ok, false);
  assert.equal(api.confirmDevelopment(state, "missing", "Text").ok, false);
  assert.equal(state.paths[0].milestones.length, 1);
});

test("chapter exploration deduplicates reads and never changes the olive tree", () => {
  const state = initial();
  const count = state.explored.length;
  api.exploreChapter(state, { book: "JHN", chapter: 15 });
  assert.equal(state.explored.length, count);
  api.exploreChapter(state, { book: "JHN", chapter: 16 });
  api.exploreChapter(state, { book: "JHN", chapter: 16 });
  assert.equal(state.explored.length, count + 1);
  assert.equal(api.exploreChapter(state, { book: "JHN", chapter: 500 }), false);
  assert.equal(state.stage, 4);
});

test("quiz resumes the current original unit and requires an answer before advancing", () => {
  const state = initial();
  const quiz = api.startQuiz(state, "nt-lk-10");
  assert.equal(api.advanceQuiz(state, 2), false);
  api.answerQuiz(state, 0, 1);
  assert.equal(api.advanceQuiz(state, 2), true);
  assert.equal(quiz.index, 1);
  assert.equal(api.startQuiz(state, "nt-lk-10"), quiz);
  assert.equal(state.quiz.answers[0], 1);
  api.answerQuiz(state, 1, 2);
  api.advanceQuiz(state, 2);
  assert.equal(state.quiz.complete, true);
  assert.equal(api.startQuiz(state, "nt-lk-10"), quiz);
  assert.equal(state.stage, 4);
  assert.equal(state.paths[0].milestones.length, 0);
});

test("synthetic backup roundtrip is detached and replaces only selected demo state", () => {
  const state = initial();
  state.theme = "night";
  state.reader.highlights["otb:JHN:15:5"] = "sage";
  api.createDraft(state, {
    origin: { kind: "story", id: "nt-lk-10", title: "Originaltitel" },
  });
  api.saveDraft(state, { text: "Gespeichert." });
  api.startQuiz(state, "nt-lk-10");
  api.answerQuiz(state, 0, 1);
  api.createDraft(state);
  state.draft.text = "Noch ungespeichert.";
  const envelope = api.makeBackup(state);
  assert.equal(envelope.schema, "faithpath-premium-demo");
  assert.equal(envelope.version, 1);
  assert(!("draft" in envelope.data));
  envelope.data.journal[0].text = "Detached copy";
  assert.notEqual(state.journal[0].text, "Detached copy");
  const validated = api.validateBackup(JSON.stringify(api.makeBackup(state)));
  assert.equal(validated.ok, true, validated.error);
  const target = initial("empty");
  target.notice = "Before";
  target.unrelatedUi = { keep: true };
  assert.equal(api.restoreBackup(target, validated).ok, true);
  assert.deepEqual(target.journal, state.journal);
  assert.deepEqual(target.quiz, state.quiz);
  assert.deepEqual(target.reader, state.reader);
  assert.equal(target.theme, "night");
  assert.equal(target.draft, null);
  assert.deepEqual(target.unrelatedUi, { keep: true });
  validated.data.journal[0].text = "Changed after restoring";
  assert.notEqual(target.journal[0].text, "Changed after restoring");
});

test("every seed scenario exports a valid own-schema backup", () => {
  for (const scenario of ["returning", "empty", "many", "long", "archived"]) {
    const result = api.validateBackup(
      JSON.stringify(api.makeBackup(initial(scenario))),
    );
    assert.equal(result.ok, true, `${scenario}: ${result.error}`);
  }
});

test("deleted source backups preserve snapshots and report missing source truthfully", () => {
  const state = initial();
  api.deleteNote(state, "j-before");
  const result = api.validateBackup(JSON.stringify(api.makeBackup(state)));
  assert.equal(result.ok, true, result.error);
  assert.equal(result.data.reviews[0].sourceMissing, true);
});

test("backup validation rejects malformed, production, incomplete and unsupported envelopes", () => {
  initial();
  for (const input of [
    "not JSON",
    "null",
    "[]",
    JSON.stringify({ journal: [], paths: [] }),
    JSON.stringify({ schema: "faithpath-premium-demo", version: 1, data: {} }),
  ]) {
    assert.equal(api.validateBackup(input).ok, false, input);
  }
  const envelope = api.makeBackup(initial());
  envelope.version = 2;
  assert.equal(api.validateBackup(JSON.stringify(envelope)).ok, false);
});

test("backup validation rejects duplicate IDs, invalid refs, missing relations and oversized words", () => {
  const mutate = (change) => {
    const envelope = api.makeBackup(initial());
    change(envelope.data);
    assert.equal(api.validateBackup(JSON.stringify(envelope)).ok, false);
  };
  mutate((data) => data.journal.push(copy(data.journal[0])));
  mutate((data) => {
    data.paths[0].steps[0].id = data.journal[0].id;
  });
  mutate((data) => {
    data.journal[0].ref.chapter = 500;
  });
  mutate((data) => {
    data.journal[0].pathIds = ["missing-path"];
  });
  mutate((data) => {
    data.paths[0].links.push({ journalId: "missing-note" });
  });
  mutate((data) => {
    data.reviews[0].sourceId = "missing-note";
  });
  mutate((data) => {
    data.journal[0].text = "x".repeat(16001);
  });
  mutate((data) => {
    data.explored.push(copy(data.explored[0]));
  });
  mutate((data) => {
    data.reader.selected = [5, 5];
  });
  mutate((data) => {
    data.journal[0].origin = { kind: "invented", id: "unit", title: "Title" };
  });
});

test("invalid restore is transactional and cannot be smuggled through a forged validation result", () => {
  const state = initial();
  const before = copy(state);
  assert.equal(
    api.restoreBackup(state, { ok: true, data: { journal: [] } }).ok,
    false,
  );
  assert.deepEqual(state, before);
  const envelope = api.makeBackup(state);
  envelope.data.paths[0].archived = "false";
  assert.equal(api.restoreBackup(state, envelope).ok, false);
  assert.deepEqual(state, before);
});

test("a title alone is recoverable draft content when reopening another context", () => {
  const state = initial();
  const draft = api.createDraft(state, { sourceId: "j-before" });
  draft.title = "Eine offene Überschrift";
  assert.equal(api.createDraft(state, { sourceId: "j-now" }), draft);
  assert.equal(state.draft.sourceId, "j-before");
});

test("a punctuation-led thought still gets a valid title and roundtrips", () => {
  const state = initial();
  api.createDraft(state);
  const result = api.saveDraft(state, { text: "… Vielleicht später. " });
  assert.equal(result.ok, true);
  api.createDraft(state);
  const punctuation = api.saveDraft(state, { text: ". Noch keine Worte." });
  assert.equal(punctuation.ok, true);
  assert(punctuation.entry.title.trim());
  const validation = api.validateBackup(JSON.stringify(api.makeBackup(state)));
  assert.equal(validation.ok, true, validation.error);
});

test("undo reconnects reviews written while their captured source was deleted", () => {
  const state = initial();
  api.createDraft(state, { sourceId: "j-before" });
  state.draft.text = "Ein neuer Blick auf damals.";
  const undo = api.deleteNote(state, "j-before");
  assert.equal(api.saveDraft(state).ok, true);
  assert.equal(state.reviews.at(-1).sourceMissing, true);
  api.undoDelete(state, undo);
  assert.notEqual(state.reviews.at(-1).sourceMissing, true);
  const validation = api.validateBackup(JSON.stringify(api.makeBackup(state)));
  assert.equal(validation.ok, true, validation.error);
});

test("unknown reader translations fail validation and cannot alter state on restore", () => {
  const state = initial();
  const before = copy(state);
  const envelope = api.makeBackup(state);
  envelope.data.reader.translation = "bogus";
  assert.equal(api.validateBackup(JSON.stringify(envelope)).ok, false);
  assert.equal(api.restoreBackup(state, envelope).ok, false);
  assert.deepEqual(state, before);
});

test("unsupported journal and highlight translations are rejected by the same allowlist", () => {
  for (const value of ["bogus", "OTB", "luther", "", null]) {
    const envelope = api.makeBackup(initial());
    envelope.data.journal[0].ref.translation = value;
    assert.equal(
      api.validateBackup(JSON.stringify(envelope)).ok,
      false,
      String(value),
    );
  }
  const highlighted = api.makeBackup(initial());
  highlighted.data.reader.highlights["bogus:JHN:15:5"] = "sage";
  assert.equal(api.validateBackup(JSON.stringify(highlighted)).ok, false);
});

test("draft references with an unknown translation cannot be saved or lose their words", () => {
  const state = initial();
  const journal = copy(state.journal);
  const draft = api.createDraft(state, {
    ref: { book: "JHN", chapter: 15, from: 5, to: 5, translation: "bogus" },
  });
  draft.text = "Mein noch ungespeicherter Gedanke.";
  assert.equal(api.saveDraft(state).ok, false);
  assert.equal(state.draft, draft);
  assert.equal(state.draft.text, "Mein noch ungespeicherter Gedanke.");
  assert.deepEqual(state.journal, journal);
});

test("both bundled translations remain accepted with general canonical book references", () => {
  for (const translation of ["otb", "l1912"]) {
    const state = initial();
    state.reader.translation = translation;
    state.reader.book = "GEN";
    state.reader.chapter = 1;
    state.reader.highlights[translation + ":GEN:1:1"] = "gold";
    api.createDraft(state, {
      ref: { book: "GEN", chapter: 1, from: 1, to: 2, translation },
    });
    assert.equal(api.saveDraft(state, { text: "Ein Anfang." }).ok, true);
    const result = api.validateBackup(JSON.stringify(api.makeBackup(state)));
    assert.equal(result.ok, true, result.error);
  }
});

test("live quiz answers accept exactly four option indices or the explicit skipped marker", () => {
  const state = initial();
  api.startQuiz(state, "nt-lk-10");
  for (const choice of [0, 1, 2, 3, "skipped"]) {
    assert.equal(api.answerQuiz(state, 0, choice), true);
    assert.equal(state.quiz.answers[0], choice);
  }
  for (const choice of [
    -1,
    4,
    99,
    1.5,
    "B",
    "0",
    "",
    "SKIPPED",
    null,
    true,
    {},
  ]) {
    assert.equal(
      api.answerQuiz(state, 0, choice),
      false,
      JSON.stringify(choice),
    );
    assert.equal(state.quiz.answers[0], "skipped");
  }
});

test("backup quiz answers enforce the same four option indices and skipped marker", () => {
  for (const answer of [
    0,
    1,
    2,
    3,
    "skipped",
    -1,
    4,
    99,
    1.5,
    "B",
    "0",
    "",
    "SKIPPED",
    null,
    true,
    {},
  ]) {
    const envelope = api.makeBackup(initial());
    envelope.data.quiz = {
      unitId: "nt-lk-10",
      index: 0,
      answers: { 0: answer },
      complete: false,
    };
    const valid = [0, 1, 2, 3, "skipped"].includes(answer);
    assert.equal(
      api.validateBackup(JSON.stringify(envelope)).ok,
      valid,
      JSON.stringify(answer),
    );
  }
});

test("a newly captured edited source uses the date of those edited words", () => {
  const state = initial();
  const original = copy(state.journal.find((entry) => entry.id === "j-before"));
  api.editDraft(state, original.id);
  const edited = api.saveDraft(state, {
    text: "So denke ich nach meiner Bearbeitung.",
    title: "Neue Worte",
  }).entry;
  const draft = api.createDraft(state, { sourceId: original.id });
  assert.deepEqual(draft.sourceSnapshot, {
    text: edited.text,
    title: edited.title,
    at: edited.updatedAt,
  });
  assert.notEqual(draft.sourceSnapshot.at, original.at);
});

test("an explicit historical snapshot wins over edited live source words and is cloned", () => {
  const state = initial();
  const historical = copy(state.reviews[0].sourceSnapshot);
  api.editDraft(state, "j-before");
  api.saveDraft(state, { text: "Heute anders bearbeitet.", title: "Heute" });
  const supplied = copy(historical);
  const draft = api.createDraft(state, {
    sourceId: "j-before",
    sourceSnapshot: supplied,
  });
  assert.deepEqual(draft.sourceSnapshot, historical);
  supplied.text = "Outside mutation";
  assert.deepEqual(draft.sourceSnapshot, historical);
  assert.equal(
    api.saveDraft(state, {
      text: "Mein Rückblick auf genau diese damaligen Worte.",
    }).ok,
    true,
  );
  assert.deepEqual(state.reviews.at(-1).sourceSnapshot, historical);
});

test("a supplied historical snapshot remains saveable after its source was deleted", () => {
  const state = initial();
  const historical = copy(state.reviews[0].sourceSnapshot);
  api.deleteNote(state, "j-before");
  api.createDraft(state, { sourceId: "j-before", sourceSnapshot: historical });
  const result = api.saveDraft(state, {
    text: "Diese Worte von damals bleiben mein Ausgangspunkt.",
  });
  assert.equal(result.ok, true, result.error);
  assert.equal(state.reviews.at(-1).sourceMissing, true);
  assert.deepEqual(state.reviews.at(-1).sourceSnapshot, historical);
  const validated = api.validateBackup(JSON.stringify(api.makeBackup(state)));
  assert.equal(validated.ok, true, validated.error);
});
