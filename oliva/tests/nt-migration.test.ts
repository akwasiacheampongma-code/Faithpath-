import { describe, expect, it, vi } from "vitest";
import {
  backupByteLength,
  cloneData,
  dataSchema,
  decodeData,
  initialData,
  parseBackup,
  v7DataSchema,
} from "../src/state/model";
import {
  archiveHashes,
  decodeStored,
  documentRevision,
  forStorage,
} from "../src/services/documents";
import { applyImport, prepareImport } from "../src/features/imports/model";
import {
  appendLegacyNtCompletions,
  emptyNtStudy,
  extractLegacyNtCompletions,
  finishNtChapter,
  saveNtAnswer,
} from "../src/features/quiz/model";
import { ntChapter } from "../src/features/quiz/catalog";
import { utf8Length } from "../src/lib/hash";
import { faithpathFixture } from "./fixtures/faithpath-v5";

const at = "2026-11-01T09:00:00.000Z";
const later = "2026-11-07T11:00:00.000Z";

// Synthetic snapshots, never a person's data or a production export.
function previous(version = 7) {
  const data = { ...initialData(), version } as Record<string, unknown>;
  delete data.ntStudy;
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

function importedCurrent() {
  const data = initialData();
  const source = faithpathFixture();
  source.data.quiz = {
    "10000": { done: at },
    "10001": { done: "2026-11-02" },
    future: { done: later },
  } as unknown as typeof source.data.quiz;
  const text = JSON.stringify(source, null, 2);
  applyImport(data, prepareImport(text, data, later));
  return { data, text, quiz: source.data.quiz };
}

function richPrevious() {
  const { data, text } = importedCurrent();
  const { ntStudy: omitted, ...fields } = data;
  return {
    data: v7DataSchema.parse({
      ...fields,
      version: 7,
      revision: 42,
      name: "Ada",
      onboarded: true,
      reading: { book: "JHN", chapter: 6 },
      readingPosition: {
        ref: { book: "JHN", chapter: 6 },
        verse: 35,
        mode: "deep",
      },
      readPassages: ["JHN:6:35:40"],
      growthStage: 4,
      retainedReviewGrowth: { reflections: 8, actions: 3 },
      bookmarks: ["JHN:6:35"],
      highlights: { ...data.highlights, "JHN:6:35": "olive" },
      invitations: {
        enabled: true,
        snoozed: { "goal:later": later },
        dismissed: { "note:old": at },
      },
      drafts: [
        {
          id: "draft-1",
          key: "journal:new",
          type: "journal",
          revision: 3,
          updatedAt: later,
          values: {
            entityId: "unfinished-note",
            targetId: null,
            baseUpdatedAt: null,
            text: "  Noch nicht fertig.\n  ",
            kind: "reflection",
          },
        },
      ],
    }),
    text,
  };
}

function historicalCurrent() {
  const { data, text, quiz } = importedCurrent();
  const receipt = data.imports[0]!;
  const completion = extractLegacyNtCompletions(
    quiz,
    receipt.id,
    receipt.sourceHash,
  ).completions;
  appendLegacyNtCompletions(data.ntStudy, completion);
  return { data, text };
}

describe("Neutrale NT-Migration von AppData V1–V7 nach V8", () => {
  it("liest alle sieben Vorgänger strikt und ergänzt nur die jeweils fehlenden Metadaten im RAM", () => {
    for (let version = 1; version <= 7; version++) {
      const old = previous(version);
      const bytes = JSON.stringify(old);
      const migrated = decodeData(old);
      expect(migrated).toEqual(initialData());
      expect(migrated.version).toBe(8);
      expect(migrated.revision).toBe(0);
      expect(migrated.ntStudy).toEqual(emptyNtStudy());
      expect(JSON.stringify(old)).toBe(bytes);
    }
  });

  it("bewahrt jeden vorhandenen V7-Wert, Entwurfsleerraum und Wachstum ohne Aktivierung archivierter quiz.done-Fakten", () => {
    const { data: old } = richPrevious();
    const bytes = JSON.stringify(old);
    const migrated = decodeData(old);
    expect(migrated).toEqual({ ...old, version: 8, ntStudy: emptyNtStudy() });
    expect(migrated.ntStudy.legacyCompletions).toEqual([]);
    expect(migrated.revision).toBe(42);
    expect(migrated.growthStage).toBe(4);
    expect(migrated.readingPosition).toEqual(old.readingPosition);
    expect(migrated.drafts[0]!.values).toEqual(old.drafts[0]!.values);
    migrated.notes[0]!.text = "Eine spätere Änderung";
    migrated.invitations.enabled = false;
    expect(JSON.stringify(old)).toBe(bytes);
  });

  it("behält V7 strikt und verlangt das vollständige NT-Feld ausdrücklich für aktuelle V8-Daten", () => {
    const old = previous();
    expect(v7DataSchema.safeParse(old).success).toBe(true);
    expect(
      v7DataSchema.safeParse({ ...old, ntStudy: emptyNtStudy() }).success,
    ).toBe(false);
    expect(v7DataSchema.safeParse({ ...old, version: 8 }).success).toBe(false);
    expect(dataSchema.safeParse({ ...old, version: 8 }).success).toBe(false);
    expect(
      dataSchema.safeParse({ ...old, version: 8, ntStudy: emptyNtStudy() })
        .success,
    ).toBe(true);
    expect(() =>
      decodeData({ ...old, version: 7, ntStudy: emptyNtStudy() }),
    ).toThrow();
    expect(() => decodeData({ ...old, version: 9 })).toThrow();
    expect(() => decodeData({ ...old, futureUnknown: true })).toThrow();
  });

  it("liest private V1-Dokumente aller Metadatavorgänger und verändert dabei weder Dokument noch Archivbytes", async () => {
    for (let version = 4; version <= 7; version++) {
      const { data, text } = importedCurrent();
      const old = { ...data, version } as Record<string, unknown>;
      delete old.ntStudy;
      if (version < 7) delete old.invitations;
      if (version < 6) delete old.retainedReviewGrowth;
      if (version < 5) delete old.readingPosition;
      const stored = {
        storageVersion: 1,
        data: {
          ...old,
          imports: data.imports.map(
            ({ sourceText: omitted, ...metadata }) => metadata,
          ),
        },
      };
      const bytes = JSON.stringify(stored);
      const loader = vi.fn(async () => text);
      const migrated = await decodeStored(stored, loader);
      expect(migrated).toEqual(decodeData(old));
      expect(migrated.version).toBe(8);
      expect(migrated.imports[0]!.sourceText).toBe(text);
      expect(migrated.ntStudy).toEqual(emptyNtStudy());
      expect(loader).toHaveBeenCalledExactlyOnceWith(
        data.imports[0]!.sourceHash,
      );
      expect(archiveHashes(stored)).toEqual([data.imports[0]!.sourceHash]);
      expect(documentRevision(stored)).toBe(data.revision);
      expect(JSON.stringify(stored)).toBe(bytes);
    }
  });

  it("exportiert erst den ausdrücklich übergebenen V8-Stand unter unveränderter privater Dokumentversion 1", async () => {
    const { data: old, text } = richPrevious();
    const bytes = JSON.stringify(old);
    const migrated = parseBackup(JSON.stringify(old));
    const stored = forStorage(migrated);
    expect(stored.storageVersion).toBe(1);
    expect(stored.data.version).toBe(8);
    expect(stored.data.ntStudy).toEqual(emptyNtStudy());
    expect(stored.data.imports[0]).not.toHaveProperty("sourceText");
    expect(await decodeStored(stored, async () => text)).toEqual(migrated);
    expect(JSON.stringify(old)).toBe(bytes);
  });
});

describe("V8-Backups mit unabhängigen NT-Antworten und prüfbarer Originalherkunft", () => {
  it("bewahrt fünf Originalsnapshots und einen Abschluss ohne Lesefortschritt/Wachstum im privaten Roundtrip", async () => {
    const data = initialData();
    const chapter = ntChapter("MAT", 1)!;
    expect(chapter).not.toBeNull();
    const { ntStudy: omittedBefore, ...before } = data;
    for (const question of chapter.questions)
      saveNtAnswer(
        data.ntStudy,
        question,
        (question.correctIndex + 1) % 4,
        null,
        at,
      );
    finishNtChapter(data.ntStudy, chapter, null, later);
    const { ntStudy: omittedAfter, ...after } = data;
    expect(after).toEqual(before);
    const stored = forStorage(data);
    const loader = vi.fn(async () => {
      throw new Error("Kein Importarchiv vorhanden");
    });
    const loaded = await decodeStored(stored, loader);
    expect(loaded).toEqual(data);
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
    expect(loader).not.toHaveBeenCalled();
    const copy = cloneData(data);
    const first = Object.values(copy.ntStudy.answers)[0]!;
    first.question.options[0] = "Nur die unabhängige Kopie ändern";
    expect(copy.ntStudy).not.toEqual(data.ntStudy);
    expect(backupByteLength(data)).toBe(
      utf8Length(JSON.stringify(data, null, 2)),
    );
  });

  it("prüft historische done-Fakten am unveränderten Originalarchiv, ohne Antworten oder Position zu erfinden", async () => {
    const { data, text } = historicalCurrent();
    expect(data.ntStudy.legacyCompletions).toHaveLength(1);
    expect(data.ntStudy.answers).toEqual({});
    expect(data.ntStudy.completions).toEqual({});
    expect(data.ntStudy.position).toBeNull();
    expect(dataSchema.safeParse(data).success).toBe(true);
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
    expect(await decodeStored(forStorage(data), async () => text)).toEqual(
      data,
    );
    expect(data.imports[0]!.sourceText).toBe(text);
  });

  it("weist fehlende oder falsche Belege und plausible aber nicht belegte done-Zeitpunkte zurück", () => {
    const { data } = historicalCurrent();
    const missing = cloneData(data);
    missing.imports = [];
    expect(dataSchema.safeParse(missing).success).toBe(false);
    const wrongHash = cloneData(data);
    wrongHash.ntStudy.legacyCompletions[0]!.sourceHash = "0".repeat(64);
    expect(dataSchema.safeParse(wrongHash).success).toBe(false);
    const invented = cloneData(data);
    invented.ntStudy.legacyCompletions[0]!.completedAt = later;
    expect(dataSchema.safeParse(invented).success).toBe(true);
    expect(() => decodeData(invented)).toThrow(/Originalquelle/);
    expect(() => parseBackup(JSON.stringify(invented))).toThrow(
      /keine gültige OLIVA-Sicherung/,
    );
    const nonexistent = cloneData(data);
    const entry = nonexistent.ntStudy.legacyCompletions[0]!;
    entry.sourceUnitId = "10002";
    entry.chapter = 3;
    expect(dataSchema.safeParse(nonexistent).success).toBe(true);
    expect(() => decodeData(nonexistent)).toThrow(/Originalquelle/);
  });
});
