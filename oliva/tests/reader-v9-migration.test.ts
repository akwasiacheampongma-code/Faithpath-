import { describe, expect, it, vi } from "vitest";
import {
  dataSchema,
  decodeData,
  initialData,
  legacyDataSchema,
  parseBackup,
  v2DataSchema,
  v3DataSchema,
  v4DataSchema,
  v5DataSchema,
  v6DataSchema,
  v7DataSchema,
  v8DataSchema,
} from "../src/state/model";
import {
  archiveHashes,
  decodeStored,
  documentRevision,
  forStorage,
} from "../src/services/documents";
import {
  captureKey,
  captureSourceSchema,
  captureValuesSchema,
  type CaptureSource,
} from "../src/features/personal/capture-schema-current";
import {
  captureKey as oldCaptureKey,
  captureSourceSchema as oldCaptureSourceSchema,
} from "../src/features/personal/capture-schema";
import { draftSchema as v5DraftSchema } from "../src/features/personal/schema-v5";
import { draftSchema as v6DraftSchema } from "../src/features/personal/schema-v6";
import { draftSchema as v8DraftSchema } from "../src/features/personal/schema-v8";
import { readingPositionSchema as oldReadingPositionSchema } from "../src/features/bible/position";
import {
  readingPositionSchema,
  sameReadingScope,
} from "../src/features/bible/position-current";
import { PATHS } from "../src/features/paths/catalog";
import { applyImport, prepareImport } from "../src/features/imports/model";
import { ntChapter } from "../src/features/quiz/catalog";
import { ntQuestionHash } from "../src/features/quiz/schema";
import {
  answerKey,
  emptyNtStudy,
  finishNtChapter,
  rememberNtPosition,
  saveNtAnswer,
} from "../src/features/quiz/model";
import { faithpathFixture, sourceDate } from "./fixtures/faithpath-v5";

const AT = "2026-11-05T09:00:00.000Z";
const LATER = "2026-11-07T11:00:00.000Z";
const LATEST = "2026-11-08T15:00:00.000Z";
const passageRef = { book: "JHN", chapter: 6, from: 35, to: 36 };
const passageSource: Extract<CaptureSource, { type: "passage" }> = { type: "passage", ref: passageRef };
const verseSource: Extract<CaptureSource, { type: "verse" }> = {
  type: "verse",
  ref: { book: "JHN", chapter: 6, from: 35, to: 35 },
};

const oldSchemas = [
  legacyDataSchema,
  v2DataSchema,
  v3DataSchema,
  v4DataSchema,
  v5DataSchema,
  v6DataSchema,
  v7DataSchema,
  v8DataSchema,
] as const;

// Synthetic documents of the actual historical contracts, never personal data.
function previous(version: number): Record<string, unknown> {
  const data: Record<string, unknown> = { ...initialData(), version };
  delete data.storyStudy;
  if (version < 8) delete data.ntStudy;
  if (version < 7) delete data.invitations;
  if (version < 6) delete data.retainedReviewGrowth;
  if (version < 5) delete data.readingPosition;
  if (version < 3) delete data.imports;
  if (version < 2) {
    delete data.goals;
    delete data.drafts;
  }
  return data;
}

function captureDraft(source: CaptureSource, id = "range-draft") {
  return {
    id,
    key: captureKey(source),
    type: "capture" as const,
    revision: 3,
    updatedAt: LATEST,
    values: {
      entityId: `${id}-note`,
      text: "  Eigene, noch unfertige Worte.\n  ",
      source,
    },
  };
}

function passageNote() {
  return {
    id: "own-range-note",
    text: "Meine eigenen Worte zu beiden Versen.",
    kind: "note" as const,
    ref: { ...passageRef },
    createdAt: AT,
    updatedAt: LATER,
    captureSource: structuredClone(passageSource),
  };
}

function richV8() {
  const data = initialData();
  const source = faithpathFixture();
  source.data.quiz = {
    "10000": { done: sourceDate },
    "10001": { done: "2026-11-01" },
    unrecognised: { done: sourceDate },
  } as unknown as typeof source.data.quiz;
  const sourceText = JSON.stringify(source, null, 2) + "\n";
  applyImport(data, prepareImport(sourceText, data, LATER));

  const chapter = ntChapter("MRK", 4)!;
  for (const question of chapter.questions)
    saveNtAnswer(data.ntStudy, question, (question.correctIndex + 1) % 4, null, AT);
  finishNtChapter(data.ntStudy, chapter, null, LATER);
  const revised = structuredClone(chapter);
  const revisedQuestion = revised.questions[0]!;
  revisedQuestion.prompt += " (bewahrte zweite Fragenfassung)";
  revisedQuestion.hash = ntQuestionHash(revisedQuestion);
  saveNtAnswer(data.ntStudy, revisedQuestion, revisedQuestion.correctIndex, null, LATEST);
  finishNtChapter(data.ntStudy, revised, null, LATEST);
  rememberNtPosition(data.ntStudy, "REV", 22, 3);

  const path = PATHS[0]!;
  const step = path.steps[0]!;
  const guided = {
    type: "guided" as const,
    pathId: path.id,
    step: 0,
    snapshot: {
      title: step.title,
      question: step.question,
      explanation: step.explanation,
      ref: { ...step.ref },
    },
  };
  const { storyStudy: omittedStory, ...v8Fields } = data;
  const old = v8DataSchema.parse({
    ...v8Fields,
    version: 8,
    revision: 42,
    name: "Ada",
    onboarded: true,
    reading: { book: "MRK", chapter: 4, from: 35, to: 41 },
    readingPosition: {
      ref: { book: "MRK", chapter: 4, from: 35, to: 41 },
      verse: 38,
      mode: "deep",
    },
    readPassages: ["JHN:6:35:40"],
    readSteps: [`${path.id}:0`],
    completedSteps: [`${path.id}:0`],
    activePath: path.id,
    bookmarks: ["JHN:6:35"],
    highlights: { ...data.highlights, "JHN:6:35": "olive" },
    growthStage: 4,
    retainedReviewGrowth: { reflections: 8, actions: 3 },
    invitations: {
      enabled: true,
      snoozed: { "goal:later": LATEST },
      dismissed: { "note:old": AT },
    },
    notes: [
      ...data.notes,
      {
        id: "old-verse-note",
        text: "Ein schon vorhandener Versgedanke.",
        kind: "note",
        ref: verseSource.ref,
        createdAt: AT,
        updatedAt: LATER,
        captureSource: verseSource,
      },
    ],
    drafts: [captureDraft(verseSource, "old-verse"), captureDraft(guided, "old-guided")],
  });
  return { old, sourceText, chapter, revised };
}

describe("AppData V9: neutrale Migration und eingefrorene V1–V8-Verträge", () => {
  it("migriert jeden historischen Vertrag nur im RAM und ergänzt ausschließlich fehlende Vorgängerfelder", () => {
    oldSchemas.forEach((schema, index) => {
      const version = index + 1;
      const old = previous(version);
      expect(schema.safeParse(old).success, `V${version}`).toBe(true);
      const bytes = JSON.stringify(old);
      const migrated = decodeData(old);
      expect(migrated).toEqual(initialData());
      expect(migrated.version).toBe(11);
      expect(migrated.revision).toBe(0);
      expect(migrated.ntStudy).toEqual(emptyNtStudy());
      expect(JSON.stringify(old)).toBe(bytes);
    });
  });

  it("bewahrt den reichen V8-Stand einschließlich zweier NT-Fragenfassungen und aller Originalquellen exakt", () => {
    const { old, sourceText, chapter, revised } = richV8();
    const bytes = JSON.stringify(old);
    const migrated = decodeData(old);
    expect(migrated).toEqual({ ...old, version: 11, storyStudy: initialData().storyStudy });
    expect(migrated.revision).toBe(42);
    expect(migrated.imports[0]!.sourceText).toBe(sourceText);
    expect(migrated.ntStudy.answers[answerKey(chapter.questions[0]!)]!.question).toEqual(chapter.questions[0]);
    expect(migrated.ntStudy.answers[answerKey(revised.questions[0]!)]!.question).toEqual(revised.questions[0]);
    expect(Object.keys(migrated.ntStudy.answers)).toHaveLength(6);
    expect(Object.keys(migrated.ntStudy.completions)).toHaveLength(2);
    expect(migrated.ntStudy.legacyCompletions).toHaveLength(1);
    expect(migrated.ntStudy.position).toEqual({ book: "REV", chapter: 22, index: 3 });
    expect(migrated.drafts).toEqual(old.drafts);
    expect(migrated.notes).toEqual(old.notes);
    expect(migrated.invitations).toEqual(old.invitations);
    expect(migrated.readingPosition).toEqual(old.readingPosition);
    expect(migrated.growthStage).toBe(4);
    migrated.notes[0]!.text = "Unabhängige Kopie";
    const copiedDraft = migrated.drafts[0]!;
    if (copiedDraft.type !== "capture") throw new Error("Fixture benötigt Capture");
    copiedDraft.values.text = "Nur die neue RAM-Kopie";
    migrated.ntStudy.answers[answerKey(chapter.questions[0]!)]!.question.options[0] = "Spätere RAM-Änderung";
    migrated.invitations.enabled = false;
    expect(JSON.stringify(old)).toBe(bytes);
  });

  it("liest den expliziten privaten V8-Metadatenzweig unter storageVersion 1 und lädt identische Archivbytes", async () => {
    const { old, sourceText } = richV8();
    const stored = {
      storageVersion: 1,
      data: {
        ...old,
        imports: old.imports.map(({ sourceText: omitted, ...metadata }) => metadata),
      },
    };
    const bytes = JSON.stringify(stored);
    const loader = vi.fn(async () => sourceText);
    expect(archiveHashes(stored)).toEqual([old.imports[0]!.sourceHash]);
    expect(documentRevision(stored)).toBe(42);
    const loaded = await decodeStored(stored, loader);
    expect(loaded).toEqual({ ...old, version: 11, storyStudy: initialData().storyStudy });
    expect(loader).toHaveBeenCalledExactlyOnceWith(old.imports[0]!.sourceHash);
    expect(loaded.imports[0]!.sourceText).toBe(sourceText);
    expect(JSON.stringify(stored)).toBe(bytes);
    const currentStored = forStorage(loaded);
    expect(currentStored.storageVersion).toBe(1);
    expect(currentStored.data.version).toBe(11);
    expect(currentStored.data.imports[0]).not.toHaveProperty("sourceText");
    expect(await decodeStored(currentStored, async () => sourceText)).toEqual(loaded);
    expect(parseBackup(JSON.stringify(loaded))).toEqual(loaded);
  });

  it("behält beide historischen Reader-Modi ohne eine künstliche neue Position", () => {
    for (const mode of ["read", "deep"] as const) {
      const { old } = richV8();
      old.readingPosition!.mode = mode;
      expect(decodeData(old).readingPosition).toEqual(old.readingPosition);
    }
  });

  it("lehnt Bereichsquellen in sämtlichen alten Notiz- und Entwurfsgraphen ab", () => {
    oldSchemas.forEach((schema, index) => {
      const version = index + 1;
      const old = previous(version);
      expect(schema.safeParse({ ...old, notes: [passageNote()] }).success, `V${version} note`).toBe(false);
      expect(() => decodeData({ ...old, notes: [passageNote()] })).toThrow();
      if (version >= 2) {
        expect(schema.safeParse({ ...old, drafts: [captureDraft(passageSource)] }).success, `V${version} draft`).toBe(false);
        expect(() => decodeData({ ...old, drafts: [captureDraft(passageSource)] })).toThrow();
      }
    });
    expect(oldCaptureSourceSchema.safeParse(passageSource).success).toBe(false);
    for (const schema of [v5DraftSchema, v6DraftSchema, v8DraftSchema]) {
      expect(schema.safeParse(captureDraft(verseSource)).success).toBe(true);
      expect(schema.safeParse(captureDraft(passageSource)).success).toBe(false);
    }
  });

  it("validiert V8 im gesamten verschachtelten Graphen statt nur am Versionsfeld", () => {
    const { old } = richV8();
    const unknownSource = structuredClone(old);
    const capture = unknownSource.drafts[0]!;
    if (capture.type !== "capture") throw new Error("Fixture benötigt Capture");
    Object.assign(capture.values.source, { generatedText: "unzulässiger Zusatz" });
    expect(v8DataSchema.safeParse(unknownSource).success).toBe(false);
    const unknownAnswer = structuredClone(old);
    Object.assign(Object.values(unknownAnswer.ntStudy.answers)[0]!.question, { unknownSnapshotField: true });
    expect(v8DataSchema.safeParse(unknownAnswer).success).toBe(false);
    const unknownInvitation = structuredClone(old);
    Object.assign(unknownInvitation.invitations, { lastOpenedAt: LATEST });
    expect(v8DataSchema.safeParse(unknownInvitation).success).toBe(false);
  });

  it("verweigert V8-Metadaten mit neuen verschachtelten Quellen vor jedem Archivzugriff", async () => {
    const { old } = richV8();
    for (const changed of [
      { ...old, notes: [passageNote()] },
      { ...old, drafts: [captureDraft(passageSource)] },
    ]) {
      const stored = {
        storageVersion: 1,
        data: {
          ...changed,
          imports: old.imports.map(({ sourceText: omitted, ...metadata }) => metadata),
        },
      };
      const loader = vi.fn(async () => old.imports[0]!.sourceText);
      expect(() => archiveHashes(stored)).toThrow();
      await expect(decodeStored(stored, loader)).rejects.toThrow();
      expect(loader).not.toHaveBeenCalled();
    }
  });

  it("prüft historische NT-Fakten weiterhin gegen die ursprünglichen Archivbytes", async () => {
    const { old } = richV8();
    const invented = structuredClone(old);
    invented.ntStudy.legacyCompletions[0]!.completedAt = LATEST;
    expect(v8DataSchema.safeParse(invented).success).toBe(true);
    expect(() => decodeData(invented)).toThrow(/Originalquelle/);
    expect(() => parseBackup(JSON.stringify(invented))).toThrow(/keine gültige OLIVA-Sicherung/);
    const missing = structuredClone(old);
    missing.imports = [];
    expect(v8DataSchema.safeParse(missing).success).toBe(false);
    const mismatched = structuredClone(old);
    mismatched.ntStudy.legacyCompletions[0]!.sourceHash = "0".repeat(64);
    expect(v8DataSchema.safeParse(mismatched).success).toBe(false);
    const stored = forStorage(decodeData(old));
    await expect(decodeStored(stored, async () => "{}")).rejects.toThrow();
  });
});

describe("V9-Bereichsnotizen und Kapitelkontext besitzen ausdrückliche aktuelle Verträge", () => {
  it("verlangt zwei explizite kanonische Grenzen und belässt Einzelversquellen und Schlüssel unverändert", () => {
    expect(captureSourceSchema.parse(passageSource)).toEqual(passageSource);
    expect(captureKey(passageSource)).toBe("capture:passage:JHN:6:35:36");
    expect(captureKey(verseSource)).toBe("capture:verse:JHN:6:35");
    expect(captureKey(verseSource)).toBe(oldCaptureKey(verseSource));
    expect(captureSourceSchema.parse(verseSource)).toEqual(oldCaptureSourceSchema.parse(verseSource));
    for (const ref of [
      { book: "JHN", chapter: 6 },
      { book: "JHN", chapter: 6, from: 35 },
      { book: "JHN", chapter: 6, to: 36 },
      { book: "JHN", chapter: 6, from: 35, to: 35 },
      { book: "JHN", chapter: 6, from: 36, to: 35 },
      { book: "JHN", chapter: 6, from: 35, to: 999 },
      { book: "JHN", chapter: 6, from: 35.5, to: 36 },
      { book: "jhn", chapter: 6, from: 35, to: 36 },
    ]) expect(captureSourceSchema.safeParse({ type: "passage", ref }).success).toBe(false);
    expect(captureSourceSchema.safeParse({ type: "verse", ref: passageRef }).success).toBe(false);
    expect(captureSourceSchema.safeParse({ ...passageSource, generatedText: "Kein KI-Text in der Quelle" }).success).toBe(false);
    expect(captureSourceSchema.safeParse({ ...passageSource, ref: { ...passageRef, translation: "other" } }).success).toBe(false);
    expect(captureValuesSchema.safeParse({ entityId: "draft-note", text: "Eigene Worte", source: passageSource }).success).toBe(true);
  });

  it("bewahrt Vers 35, Bereich 35–36 und Bereich 35–37 als drei unabhängige Entwürfe im V9-Roundtrip", async () => {
    const data = initialData();
    const longerSource: CaptureSource = { type: "passage", ref: { ...passageRef, to: 37 } };
    data.drafts = [
      captureDraft(verseSource, "single"),
      captureDraft(passageSource, "two-verses"),
      captureDraft(longerSource, "three-verses"),
    ];
    data.notes = [passageNote()];
    expect(new Set(data.drafts.map((draft) => draft.key)).size).toBe(3);
    expect(dataSchema.parse(data)).toEqual(data);
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
    expect(await decodeStored(forStorage(data), async () => { throw new Error("Kein Importarchiv"); })).toEqual(data);
  });

  it("speichert Bereichsquellen ausschließlich als eigene Notiz mit exakt derselben Referenz", () => {
    const data = initialData();
    data.notes = [passageNote()];
    expect(dataSchema.safeParse(data).success).toBe(true);
    for (const kind of ["reflection", "action"])
      expect(dataSchema.safeParse({ ...data, notes: [{ ...passageNote(), kind }] }).success).toBe(false);
    expect(dataSchema.safeParse({ ...data, notes: [{ ...passageNote(), ref: { ...passageRef, to: 37 } }] }).success).toBe(false);
    const { ref: omitted, ...noReference } = passageNote();
    expect(dataSchema.safeParse({ ...data, notes: [noReference] }).success).toBe(false);
    const { old } = richV8();
    const origin = old.notes.find((note) => note.origin)!.origin;
    expect(dataSchema.safeParse({ ...data, imports: old.imports, notes: [{ ...passageNote(), origin }] }).success).toBe(false);
  });

  it("erlaubt Kontextanker im selben Kapitel und erhält den logischen Teilabschnitt", () => {
    const logical = { book: "MRK", chapter: 4, from: 35, to: 41 };
    const position = { ref: logical, verse: 20, mode: "deep" as const };
    expect(readingPositionSchema.parse(position)).toEqual(position);
    expect(oldReadingPositionSchema.safeParse(position).success).toBe(false);
    for (const version of [5, 6, 7, 8]) {
      const old = { ...previous(version), reading: logical, readingPosition: position };
      expect(oldSchemas[version - 1]!.safeParse(old).success, `V${version}`).toBe(false);
      expect(() => decodeData(old)).toThrow();
    }
    const data = { ...initialData(), reading: logical, readingPosition: position };
    expect(decodeData(data)).toEqual(data);
    expect(sameReadingScope(position.ref, logical)).toBe(true);
    expect(sameReadingScope(position.ref, { book: "MRK", chapter: 4 })).toBe(false);
    expect(dataSchema.safeParse({ ...data, reading: { ...logical, from: 34 } }).success).toBe(false);
    for (const verse of [0, 42, 999, 20.5])
      expect(readingPositionSchema.safeParse({ ...position, verse }).success).toBe(false);
    expect(readingPositionSchema.safeParse({ ...position, ref: { ...logical, chapter: 999 } }).success).toBe(false);
    expect(readingPositionSchema.safeParse({ ...position, pixelOffset: 123 }).success).toBe(false);
  });

  it("erhält Kontextanker und Fortschrittsneutralität durch Sicherung und private Speicherung", async () => {
    const { old, sourceText } = richV8();
    const data = decodeData(old);
    const before = structuredClone(data);
    data.readingPosition = { ref: { ...data.reading }, verse: 20, mode: "read" };
    const loaded = await decodeStored(forStorage(data), async () => sourceText);
    expect(loaded).toEqual(data);
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
    const { readingPosition: omittedBefore, ...withoutBeforePosition } = before;
    const { readingPosition: omittedAfter, ...withoutAfterPosition } = loaded;
    expect(withoutAfterPosition).toEqual(withoutBeforePosition);
    expect(loaded.readingPosition!.ref).toEqual({ book: "MRK", chapter: 4, from: 35, to: 41 });
  });
});
