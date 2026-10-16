import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { createStore, migrate, KEYS, empty } from "../src/store.js";
import {
  gaps,
  timeline,
  treeLevel,
  developmentCount,
  validRef,
  attach,
} from "../src/domain.js";
import { validateFinalNtQuiz } from "../scripts/validate-nt-quiz.mjs";
import { auditContent } from "../scripts/validate-content.mjs";
const stamp = "2026-08-01T12:00:00.000Z",
  later = "2026-09-16T12:00:00.000Z";
const memory = (data = {}) => {
  const values = new Map(Object.entries(data));
  return {
    values,
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
  };
};
const legacy = () => ({
  version: 3,
  translation: "l1912",
  paths: [
    {
      id: "p1",
      title: "Geduld",
      started: stamp,
      lastReview: stamp,
      steps: [{ text: "Zuerst zuhören", done: true }],
      milestones: [{ text: "Bewusst ruhig geblieben", date: stamp }],
      reviews: [{ text: "Ich lerne noch", date: stamp }],
      links: [
        {
          id: "l1",
          kind: "verse",
          ref: { book: "rom", chapter: 12, from: 12, to: 12 },
          date: stamp,
          label: "Römer 12,12",
        },
      ],
      customField: "keep",
    },
  ],
  journal: [
    {
      id: "j1",
      text: "Ein sehr langer Gedanke. ".repeat(3000),
      type: "Journal",
      date: stamp,
    },
  ],
  highlights: [
    { id: "h1", book: "JHN", chapter: 1, from: 1, to: 999, at: stamp },
  ],
  reflections: [],
  events: [],
  quiz: { 1: { done: stamp } },
  unknownFeature: { keep: true },
});
test("Migration erhält lange Texte, unbekannte Felder, IDs und alle Sammlungen", () => {
  const old = legacy(),
    next = migrate(old, { sorge7: { 0: true, 3: true } });
  assert.equal(next.journal[0].text, old.journal[0].text);
  assert.deepEqual(next.unknownFeature, old.unknownFeature);
  assert.equal(next.paths[0].customField, "keep");
  assert.deepEqual(next.guidedPlans, { sorge7: { 0: true, 3: true } });
  assert.equal(next.paths[0].id, "p1");
  for (const k of ["paths", "journal", "highlights"])
    assert.equal(next[k].length, old[k].length);
  assert.equal(next.paths[0].milestones.length, 1);
  assert.ok(next.paths[0].steps[0].id);
});
test("Vor Migration wird der exakte Originaltext gesichert; wiederholter Start verändert IDs nicht", () => {
  const raw = JSON.stringify(legacy()),
    st = memory({ [KEYS.main]: raw, [KEYS.plans]: '{"sorge7":{"0":true}}' });
  const one = createStore(st);
  assert.equal(JSON.parse(st.getItem(KEYS.migration)).raw, raw);
  const two = createStore(st);
  assert.deepEqual(two.state, one.state);
});
test("Beschädigtes JSON und zukünftiges Schema werden niemals durch leere Daten ersetzt", () => {
  for (const raw of [
    "{not-json",
    JSON.stringify({ version: 900, paths: [], journal: [], highlights: [] }),
  ]) {
    const st = memory({ [KEYS.main]: raw });
    const x = createStore(st);
    assert.ok(x.error);
    assert.equal(st.getItem(KEYS.main), raw);
    assert.throws(() => x.transact((d) => (d.journal = [])));
    assert.equal(st.getItem(KEYS.main), raw);
  }
});
test("Speicherfehler lässt alten Zustand und Original unverändert", () => {
  const st = memory(),
    x = createStore(st);
  st.setItem = () => {
    throw new Error("quota");
  };
  assert.throws(
    () =>
      x.transact((d) =>
        d.journal.push({ id: "new", text: "keep me", date: stamp }),
      ),
    /Nicht gespeichert/,
  );
  assert.equal(x.state.journal.length, 0);
  assert.equal(st.getItem(KEYS.main), null);
});
test("Migration ohne Platz für Sicherung schreibt nichts ins Original", () => {
  const raw = JSON.stringify(legacy()),
    st = memory({ [KEYS.main]: raw });
  st.setItem = () => {
    throw new Error("quota");
  };
  const x = createStore(st);
  assert.ok(x.error);
  assert.equal(st.getItem(KEYS.main), raw);
});
test("Konkurrierender Tab wird erkannt statt überschrieben", () => {
  const st = memory(),
    one = createStore(st),
    two = createStore(st);
  one.transact((d) => (d.translation = "l1912"));
  assert.throws(
    () => two.transact((d) => (d.translation = "otb")),
    /anderen Tab/,
  );
  assert.equal(JSON.parse(st.getItem(KEYS.main)).translation, "l1912");
});
test("Backup-Rundreise erhält alle Daten und Planfortschritt", () => {
  const a = createStore(
      memory({
        [KEYS.main]: JSON.stringify(legacy()),
        [KEYS.plans]: '{"sorge7":{"0":true}}',
      }),
    ),
    exported = a.backup(),
    b = createStore(memory());
  b.restore(b.prepareImport(exported));
  assert.deepEqual(a.state, b.state);
});
test("Ungültige Importdaten, Duplikate und Prototype-Keys verändern keinen Datenstand", () => {
  const st = memory(),
    x = createStore(st);
  for (const bad of [
    {},
    [],
    { app: "Other", data: empty() },
    {
      ...empty(),
      journal: [
        { id: "1", text: "a" },
        { id: "1", text: "b" },
      ],
    },
    JSON.parse('{"paths":[],"journal":[],"highlights":[],"__proto__":{}}'),
  ])
    assert.throws(() => x.prepareImport(bad));
  assert.equal(st.getItem(KEYS.main), null);
});
test("Vor Import wird ein wiederherstellbarer vorheriger Stand gesichert", () => {
  const st = memory(),
    x = createStore(st);
  x.transact((d) =>
    d.journal.push({ id: "a", text: "Mein Text", date: stamp }),
  );
  const raw = st.getItem(KEYS.main);
  x.restore(empty());
  assert.equal(JSON.parse(st.getItem(KEYS.restore)).raw, raw);
  assert.equal(x.state.journal.length, 0);
});
test("Angehakte Schritte verändern den Olivenbaum nicht; Archiv löscht keine Entwicklung", () => {
  const x = migrate(legacy());
  assert.equal(treeLevel(x), 1);
  x.paths[0].steps[0].done = false;
  assert.equal(treeLevel(x), 1);
  x.paths[0].archived = true;
  assert.equal(developmentCount(x), 1);
});
test("Nur explizit bestätigte globale Entwicklungen zählen", () => {
  const x = empty();
  x.reviews = [{ id: "r", confirmedDevelopment: false }];
  assert.equal(treeLevel(x), 0);
  x.reviews[0].confirmedDevelopment = true;
  assert.equal(treeLevel(x), 1);
});
test("Frische Aktivitäten ergeben keine Erinnerung; alte Notizen schon", () => {
  const x = empty();
  x.journal = [
    { id: "old", text: "Damals", date: stamp },
    { id: "new", text: "Heute", date: later },
  ];
  assert.deepEqual(
    gaps(x, Date.parse(later)).map((x) => x.key),
    ["journal:old"],
  );
});
test("Snooze, Abschluss und ungültige Datumswerte werden respektiert", () => {
  const x = empty();
  x.journal = [
    { id: "j", text: "Gedanke", date: stamp },
    { id: "broken", text: "Altes Datum", date: "invalid" },
  ];
  x.reminderSnoozes["journal:j"] = "2026-09-30T00:00:00Z";
  assert.equal(gaps(x, Date.parse(later)).length, 0);
  delete x.reminderSnoozes["journal:j"];
  x.dismissedGaps["journal:j"] = later;
  assert.equal(gaps(x, Date.parse(later)).length, 0);
});
test("Neue Wegreflexion verschiebt abgeleitete Erinnerung statt alte Aktivität zu behaupten", () => {
  const x = migrate(legacy());
  x.highlights = [];
  x.journal = [{ id: "recent", text: "Heute", date: later, pathIds: ["p1"] }];
  assert.equal(gaps(x, Date.parse(later)).length, 0);
});
test("Verknüpfte Markierungen erzeugen keine doppelte Erinnerung", () => {
  const x = migrate(legacy());
  x.journal = [];
  x.highlights = [
    {
      id: "h",
      book: "ROM",
      chapter: 12,
      from: 12,
      to: 12,
      at: stamp,
      translation: "otb",
    },
  ];
  assert.deepEqual(
    gaps(x, Date.parse(later)).map((x) => x.type),
    ["path"],
  );
});
test("Reflexion und Journal werden nur bei exakt sicherer Legacy-Verbindung zusammengeführt", () => {
  const x = empty();
  x.version = 4;
  x.journal = [{ id: "j", text: "gleich", date: stamp }];
  x.reflections = [{ id: "r", text: "gleich", date: stamp }];
  const next = migrate(x);
  assert.equal(next.journal[0].reflectionId, "r");
  assert.equal(timeline(next).length, 1);
});
test("Wegverbindung bewahrt Bibel, Journal und Reflexion in einer Chronologie", () => {
  const x = migrate(legacy());
  x.reflections = [{ id: "r", text: "Reflexion", date: stamp }];
  x.journal = [
    {
      id: "j",
      text: "Reflexion",
      date: stamp,
      reflectionId: "r",
      ref: { book: "ROM", chapter: 12, from: 12, to: 12 },
    },
  ];
  attach(x, "p1", "j");
  attach(x, "p1", "j");
  assert.deepEqual(x.journal[0].pathIds, ["p1"]);
  assert.deepEqual(x.reflections[0].pathIds, ["p1"]);
  assert.equal(x.paths[0].links.filter((l) => l.journalId === "j").length, 1);
  assert.ok(timeline(x, "p1").some((x) => x.route === "entry/j"));
});
test("Rückblick und zugehöriger Meilenstein erscheinen nicht doppelt", () => {
  const x = migrate(legacy());
  x.paths[0].reviews = [{ id: "r", text: "Entwicklung", date: stamp }];
  x.paths[0].milestones = [
    { id: "m", reviewId: "r", text: "Entwicklung", date: stamp },
  ];
  assert.equal(
    timeline(x, "p1").filter((x) => x.kind === "Entwicklung festgehalten")
      .length,
    1,
  );
});
test("Alle tatsächlichen Inhalte, Codes und Referenzen in beiden Übersetzungen validieren", () => {
  const { report, index } = auditContent();
  assert.deepEqual(report.errors, []);
  assert.equal(report.questions, 1560);
  assert.equal(report.stories, 312);
  assert.equal(report.uniqueReflections, 312);
  assert.equal(report.situationPlanReferences, 84);
  assert.equal(
    validRef({ book: "joh", chapter: 1, from: 1, to: 999 }, index).to,
    51,
  );
  for (const ref of [
    { book: "BAD", chapter: 1 },
    { book: "JHN", chapter: 22 },
    { book: "JHN", chapter: 1, from: 9999 },
    { book: "JHN", chapter: 1, from: 5, to: 4 },
  ])
    assert.throws(() => validRef(ref, index));
});
test("Nur belegte Migrationen verändern Inhalte; IDs, Quiz, Bibel und Baumassets bleiben erhalten", () => {
  const baseline = JSON.parse(fs.readFileSync("tests/fixtures/content-master.json"));
  const allowed = JSON.parse(fs.readFileSync("tests/fixtures/content-allowlist.json"));
  assert.equal(validateFinalNtQuiz().content_preserved, true);
  // The original migration remains proven against its exact archived result.
  const fresh = JSON.parse(fs.readFileSync("reports/nt-quiz-final/pre-import-stories.json"));
  const seen = new Set();
  function walk(old, current, locator) {
    if (JSON.stringify(old) === JSON.stringify(current)) return;
    if (Array.isArray(old) && Array.isArray(current)) {
      assert.equal(old.length,current.length,locator);
      old.forEach((v,i)=>walk(v,current[i],`${locator}[${i}]`)); return;
    }
    if (old && current && typeof old === "object" && typeof current === "object") {
      for(const k of new Set([...Object.keys(old),...Object.keys(current)])) walk(old[k],current[k],`${locator}.${k}`); return;
    }
    const proof = allowed.find(c=>c.JSON_Locator===locator);
    assert.ok(proof,`Unbelegte Änderung: ${locator}`);
    assert.deepEqual(old ?? null,proof.old_value,locator);
    assert.deepEqual(current,proof.new_value,locator);
    seen.add(locator);
  }
  walk(baseline,fresh,"$");
  assert.equal(seen.size,allowed.length);
  assert.equal(new Set(fresh.flatMap(s=>s.questions.map(q=>q.faithpath_id))).size,1560);
  assert.equal(fresh.filter(s=>s.kind==="chapter-quiz").flatMap(s=>s.questions).length,1300);
  const old = JSON.parse(fs.readFileSync("tests/fixtures/baseline-e.json"));
  const hash = b=>crypto.createHash("sha256").update(b).digest("hex");
  for(const [file,expected] of Object.entries(old.files)) assert.equal(hash(fs.readFileSync(file)),expected,file);
});

test("Erledigter Schritt und letzter Legacy-Rückblick verschieben eine veraltete Erinnerung", () => {
  for (const field of ["completedAt", "lastReview"]) {
    const x = migrate(legacy());
    x.journal = [];
    x.highlights = [];
    x.reminderSnoozes["path:p1"] = "2026-08-22T12:00:00Z";
    if (field === "completedAt") x.paths[0].steps[0].completedAt = later;
    else x.paths[0].lastReview = later;
    assert.equal(gaps(x, Date.parse(later)).length, 0);
  }
});
test("Frisch bearbeiteter Gedanke wird nicht sofort als vergessen angezeigt", () => {
  const x = empty();
  x.journal = [
    { id: "j", text: "Heute erweitert", date: stamp, updatedAt: later },
  ];
  assert.equal(gaps(x, Date.parse(later)).length, 0);
});
