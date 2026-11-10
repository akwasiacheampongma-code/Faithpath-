import { describe, expect, it } from "vitest";
import { initialData, parseBackup, grow } from "../src/state/model";
import {
  applyImport,
  archiveData,
  prepareImport,
} from "../src/features/imports/model";
import { ntChapterIndex, NT_BOOKS } from "../src/features/quiz/index";
import { ntChapter } from "../src/features/quiz/catalog";
import { finishNtChapter, saveNtAnswer } from "../src/features/quiz/model";
import { faithpathFixture, sourceDate } from "./fixtures/faithpath-v5";

const at = "2026-11-09T14:00:00.000Z";
function quizSource(quiz: Record<string, unknown>) {
  const source = faithpathFixture();
  Object.assign(source.data, {
    paths: [],
    journal: [],
    reflections: [],
    highlights: [],
    events: [],
    reviews: [],
    quiz,
  });
  return source;
}

describe("Belegte historische NT-Kapitelabschlüsse im FaithPath-Import", () => {
  it("ordnet alle 260 Originaleinheiten exakt zu, ohne Antworten oder Fortschritte zu erfinden", () => {
    const quiz = Object.fromEntries(
      NT_BOOKS.flatMap((book) =>
        Array.from({ length: book.chapters }, (_, i) => [
          String(ntChapterIndex(book.code, i + 1)!.legacyUnitId),
          { done: sourceDate },
        ]),
      ),
    );
    const text = JSON.stringify(quizSource(quiz), null, 2) + "\n";
    const current = initialData();
    current.growthStage = 4;
    current.reading = { book: "JHN", chapter: 7 };
    const before = JSON.stringify(current);
    const plan = prepareImport(text, current, at);
    expect(JSON.stringify(current)).toBe(before);
    expect(plan.ntCompletions).toHaveLength(260);
    expect(plan.ntCompletions[0]).toMatchObject({
      sourceUnitId: "10000",
      book: "MAT",
      chapter: 1,
    });
    expect(plan.ntCompletions.at(-1)).toMatchObject({
      sourceUnitId: "10259",
      book: "REV",
      chapter: 22,
    });
    expect(plan.ntIgnored).toEqual({
      unknownUnitKeys: 0,
      invalidEntries: 0,
      invalidDone: 0,
      extraFields: 0,
    });
    expect(plan.receipt.counts).toEqual({
      paths: 0,
      notes: 0,
      highlights: 0,
      chapters: 0,
      mirrors: 0,
      conflicts: 0,
    });
    expect(
      plan.rows.filter(
        (row) => row.kind === "NT-Verständnisfragen" && row.status === "add",
      ),
    ).toHaveLength(260);
    applyImport(current, plan);
    grow(current);
    expect(current.ntStudy.legacyCompletions).toHaveLength(260);
    expect(current.ntStudy.answers).toEqual({});
    expect(current.ntStudy.completions).toEqual({});
    expect(current.ntStudy.position).toBeNull();
    expect(current.reading).toEqual({ book: "JHN", chapter: 7 });
    expect(current.readChapters).toEqual([]);
    expect(current.readPassages).toEqual([]);
    expect(current.readSteps).toEqual([]);
    expect(current.completedSteps).toEqual([]);
    expect(current.growthStage).toBe(4);
    expect(current.imports[0]!.sourceText).toBe(text);
    expect(parseBackup(JSON.stringify(current))).toEqual(current);
  });

  it("aktiviert ausschließlich bekannte exakte IDs und echte vollständige UTC-Zeitpunkte", () => {
    const quiz = {
      "10000": { done: sourceDate },
      "10001": { done: "2026-11-01" },
      "10002": { done: "2026-11-01T11:00:00.000+01:00" },
      "10003": { done: "2026-02-30T10:00:00.000Z" },
      "10004": sourceDate,
      "10005": null,
      "10006": {},
      "10007": { done: sourceDate, answer: 3 },
      "9999": { done: sourceDate },
      "010000": { done: sourceDate },
      "10000\n": { done: sourceDate },
      "10260": { done: sourceDate },
    };
    const source = quizSource(quiz);
    const plan = prepareImport(JSON.stringify(source), initialData(), at);
    expect(
      plan.ntCompletions.map((completion) => completion.sourceUnitId),
    ).toEqual(["10000", "10007"]);
    expect(plan.ntIgnored).toEqual({
      unknownUnitKeys: 4,
      invalidEntries: 2,
      invalidDone: 4,
      extraFields: 1,
    });
    expect(
      plan.rows.some(
        (row) =>
          row.status === "archive" && row.kind === "NT-Verständnisfragen",
      ),
    ).toBe(true);
    expect(archiveData(plan.receipt).quiz).toEqual(quiz);
    expect(
      plan.ntCompletions.every(
        (completion) =>
          Object.keys(completion).sort().join(",") ===
          "book,chapter,completedAt,importId,sourceHash,sourceUnitId",
      ),
    ).toBe(true);
  });

  it("bewahrt vorherige und später erneut datierte Originalabschlüsse als getrennte Quellen", () => {
    const source = quizSource({ "10028": { done: sourceDate } });
    const current = initialData();
    const first = prepareImport(JSON.stringify(source), current, at);
    applyImport(current, first);
    const original = structuredClone(current.ntStudy.legacyCompletions[0]);
    const duplicate = prepareImport(
      JSON.stringify(source, null, 3),
      current,
      at,
    );
    expect(duplicate.alreadyImported).toBe(true);
    const beforeDuplicate = JSON.stringify(current);
    expect(() => applyImport(current, duplicate)).toThrow(/bereits/);
    expect(JSON.stringify(current)).toBe(beforeDuplicate);
    (source.data.quiz as Record<string, unknown>)["10028"] = {
      done: "2026-11-08T09:00:00.000Z",
    };
    const later = prepareImport(JSON.stringify(source), current, at);
    applyImport(current, later);
    expect(current.ntStudy.legacyCompletions).toHaveLength(2);
    expect(current.ntStudy.legacyCompletions[0]).toEqual(original);
    expect(current.ntStudy.legacyCompletions[1]).toMatchObject({
      book: "MRK",
      chapter: 1,
      completedAt: "2026-11-08T09:00:00.000Z",
    });
    expect(current.ntStudy.legacyCompletions[1]!.importId).not.toBe(
      original!.importId,
    );
    expect(current.imports).toHaveLength(2);
  });

  it("bewahrt aktive Antworten, Kapitelabschluss und Rückkehrposition neben den historischen Fakten", () => {
    const current = initialData();
    const chapter = ntChapter("MRK", 4)!;
    for (const question of chapter.questions) {
      saveNtAnswer(current.ntStudy, question, 0, null, sourceDate);
    }
    finishNtChapter(current.ntStudy, chapter, null, sourceDate);
    const previous = structuredClone(current.ntStudy);
    const plan = prepareImport(
      JSON.stringify(
        quizSource({
          [String(chapter.legacyUnitId)]: { done: "2026-11-02T10:00:00.000Z" },
        }),
      ),
      current,
      at,
    );
    applyImport(current, plan);
    expect({ ...current.ntStudy, legacyCompletions: [] }).toEqual(previous);
    expect(current.ntStudy.legacyCompletions).toHaveLength(1);
    expect(current.ntStudy.legacyCompletions[0]).toMatchObject({
      book: "MRK",
      chapter: 4,
    });
    expect(parseBackup(JSON.stringify(current))).toEqual(current);
  });

  it("blockiert manipulierte NT-Vorschauen vor jeder Teiländerung", () => {
    for (const change of [
      (plan: ReturnType<typeof prepareImport>) => {
        plan.ntCompletions[0]!.completedAt = at;
      },
      (plan: ReturnType<typeof prepareImport>) => {
        plan.ntCompletions[0]!.chapter = 2;
      },
      (plan: ReturnType<typeof prepareImport>) => {
        plan.ntCompletions.length = 0;
      },
      (plan: ReturnType<typeof prepareImport>) => {
        plan.ntIgnored.invalidDone = 5;
      },
      (plan: ReturnType<typeof prepareImport>) => {
        plan.receipt.sourceHash = "0".repeat(64);
      },
      (plan: ReturnType<typeof prepareImport>) => {
        plan.receipt.sourceText += " ";
      },
    ]) {
      const source = faithpathFixture();
      Object.assign(source.data, { quiz: { "10000": { done: sourceDate } } });
      const current = initialData();
      const plan = prepareImport(JSON.stringify(source), current, at);
      change(plan);
      const before = JSON.stringify(current);
      expect(() => applyImport(current, plan)).toThrow(/NT-Importvorschau/);
      expect(JSON.stringify(current)).toBe(before);
    }
  });

  it("bewahrt einen fehlenden oder leeren Quizbereich ohne erfundene Fehler oder Abschlüsse", () => {
    for (const missing of [true, false]) {
      const source = quizSource({});
      if (missing) delete (source.data as { quiz?: unknown }).quiz;
      const current = initialData();
      const plan = prepareImport(JSON.stringify(source), current, at);
      expect(plan.ntCompletions).toEqual([]);
      expect(plan.ntIgnored).toEqual({
        unknownUnitKeys: 0,
        invalidEntries: 0,
        invalidDone: 0,
        extraFields: 0,
      });
      applyImport(current, plan);
      expect(current.ntStudy.legacyCompletions).toEqual([]);
      expect(archiveData(current.imports[0]!).quiz).toEqual(
        missing ? undefined : {},
      );
    }
  });
});
