import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import canonicalBooks from "../src/data/catalog.json";
import runtime from "../src/data/nt-catalog.json";
import provenance from "../content/faithpath-nt/provenance.json";
import { canonicalJson, sha256 } from "../src/lib/hash";
import { getPassage, validReference, type Reference } from "../src/features/bible/repository";
import { ntChapter, ntQuestion } from "../src/features/quiz/catalog";
import { NT_BOOKS, ntChapterIndex, ntQuestionLocation } from "../src/features/quiz/index";
import {
  ntQuestionHash, ntQuestionSchema, ntQuestionSnapshotSchema,
  ntReferenceSchema, ntSourceQuestionSchema, ntSourceUnitSchema,
  parseNtReferenceText, type NtQuestion, type NtSourceUnit,
} from "../src/features/quiz/schema";

function archive(path: string) {
  return gunzipSync(readFileSync(new URL(`../content/faithpath-nt/source/${path}.gz`, import.meta.url)));
}
const source = JSON.parse(archive("data/stories.json").toString("utf8")) as
  (NtSourceUnit & { kind: string })[];
const units = source.filter((unit) => unit.kind === "chapter-quiz");
type MasterRow = {
  FP_ID: string; book_key: string; book_name: string; chapter: number;
  question_order: number; question: string;
  option_0: string; option_1: string; option_2: string; option_3: string;
  correct_index: number; correct_answer: string; reference: string;
  explanation: string; qa_status: string; approval: string; import_ready: string;
};
const master = JSON.parse(archive("reports/nt-quiz-final/master.json").toString("utf8")) as
  { schema_version: number; sheet: string; rows: MasterRow[] };
const questions = runtime.chapters.flatMap((chapter) => chapter.questions);

function question(): NtQuestion {
  return ntQuestion("FP-0261")!;
}
function snapshot(value = question()) {
  const { hash: _hash, ...fields } = value;
  return fields;
}

describe("Unveränderter freigegebener FaithPath-NT-Katalog", () => {
  it("belegt alle eingefrorenen Originalbytes mit SHA-256 und Gzip-Zeitstempel null", () => {
    expect(provenance.source_snapshot).toBe("a519ce898fa33907b07d5ac7a585595127556183");
    expect(provenance.files).toHaveLength(7);
    for (const entry of provenance.files) {
      const compressed = readFileSync(new URL(`../content/faithpath-nt/${entry.archive}`, import.meta.url));
      const original = gunzipSync(compressed);
      expect(compressed.readUInt32LE(4)).toBe(0);
      expect(compressed.length).toBe(entry.archive_bytes);
      expect(createHash("sha256").update(compressed).digest("hex")).toBe(entry.archive_sha256);
      expect(original.length).toBe(entry.bytes);
      expect(createHash("sha256").update(original).digest("hex")).toBe(entry.sha256);
    }
    expect(provenance.files.find((file) => file.source_path === "data/stories.json")?.sha256)
      .toBe("f9fc48a97ecb129eaed0289cf94afa7c747f15afe381fbe6241e67fac5ec04cd");
  });

  it("übernimmt ausschließlich 260 NT-Kapitel mit je fünf Fragen und lückenlosen Original-IDs", () => {
    expect(source).toHaveLength(312);
    expect(source.reduce((sum, unit) => sum + unit.questions.length, 0)).toBe(1560);
    expect(units).toHaveLength(260);
    expect(runtime.chapters).toHaveLength(260);
    expect(questions).toHaveLength(1300);
    expect(new Set(questions.map((q) => q.id)).size).toBe(1300);
    expect(questions.map((q) => q.id)).toEqual(
      Array.from({ length: 1300 }, (_, i) => `FP-${String(i + 261).padStart(4, "0")}`),
    );
    expect(units.map((unit) => unit.id)).toEqual(Array.from({ length: 260 }, (_, i) => 10000 + i));
    expect(NT_BOOKS).toEqual(canonicalBooks.filter((book) => book.testament === "NT")
      .map(({ code, name, chapters }) => ({ code, name, chapters, questions: chapters * 5 })));
    expect(NT_BOOKS).toHaveLength(27);
    for (const book of NT_BOOKS) {
      const chapters = runtime.chapters.filter((chapter) => chapter.book === book.code);
      expect(chapters.map((chapter) => chapter.chapter))
        .toEqual(Array.from({ length: book.chapters }, (_, i) => i + 1));
      expect(chapters.flatMap((chapter) => chapter.questions)).toHaveLength(book.questions);
    }
    units.forEach((unit, i) => {
      expect(ntSourceUnitSchema.safeParse(unit).success).toBe(true);
      const chapter = runtime.chapters[i]!;
      expect(chapter).toMatchObject({
        key: `${unit.book}:${unit.chapter + 1}`, book: unit.book,
        chapter: unit.chapter + 1, legacyUnitId: unit.id,
        title: unit.title, referenceText: unit.ref,
        description: unit.desc, reflection: unit.reflection,
      });
      expect(chapter.questions).toHaveLength(5);
      expect(ntChapterIndex(unit.book, unit.chapter + 1)).toEqual({
        key: chapter.key, book: chapter.book, chapter: chapter.chapter,
        legacyUnitId: unit.id, title: unit.title, questionCount: 5,
      });
    });
  });

  it("bewahrt alle 1300 Fragenfelder und die Optionen wort- und reihenfolgegleich zu Quelle und Finalmaster", () => {
    expect(master.schema_version).toBe(1);
    expect(master.sheet).toBe("FAITHPATH_IMPORT");
    expect(master.rows).toHaveLength(1300);
    let position = 0;
    for (const unit of units) {
      unit.questions.forEach((original, questionIndex) => {
        const current = questions[position]!;
        const row = master.rows[position++]!;
        expect(ntSourceQuestionSchema.safeParse(original).success).toBe(true);
        expect(ntQuestionSchema.safeParse(current).success).toBe(true);
        expect(ntQuestionSnapshotSchema.safeParse(snapshot(current as NtQuestion)).success).toBe(true);
        expect({
          faithpath_id: current.id, q: current.prompt, a: current.options,
          c: current.correctIndex, ref: current.referenceText, x: current.explanation,
        }).toEqual(original);
        expect({
          id: current.id, prompt: current.prompt, options: current.options,
          correctIndex: current.correctIndex, referenceText: current.referenceText,
          explanation: current.explanation,
        }).toEqual({
          id: row.FP_ID, prompt: row.question,
          options: [row.option_0, row.option_1, row.option_2, row.option_3],
          correctIndex: row.correct_index, referenceText: row.reference,
          explanation: row.explanation,
        });
        expect(row.book_key).toBe(unit.book);
        expect(row.book_name).toBe(NT_BOOKS.find((book) => book.code === unit.book)!.name);
        expect(row.chapter).toBe(unit.chapter + 1);
        expect(row.question_order).toBe(questionIndex + 1);
        expect(row.correct_answer).toBe(current.options[current.correctIndex]);
        expect([row.qa_status, row.approval, row.import_ready]).toEqual(["FREIGEGEBEN", "FREIGEGEBEN", "JA"]);
        expect(ntQuestionLocation(current.id)).toEqual({
          book: unit.book, chapter: unit.chapter + 1, legacyUnitId: unit.id, questionIndex,
        });
      });
    }
    expect(position).toBe(1300);
  });

  it("prüft die Python-Hashes aller 1300 Snapshots gegen die App und Node SHA-256", () => {
    for (const stored of questions) {
      const fields = snapshot(stored as NtQuestion);
      const canonical = canonicalJson(fields);
      const independent = createHash("sha256").update(canonical, "utf8").digest("hex");
      expect(stored.hash).toBe(independent);
      expect(sha256(canonical)).toBe(independent);
      expect(ntQuestionHash(stored as NtQuestion)).toBe(independent);
    }
  });

  it("vergleicht 1304 Bereiche mit dem eingefrorenen Original-JS-Parser und vorhandenen Bibelversen", async () => {
    const parserUrl = "data:text/javascript;base64," + archive("scripts/quiz-reference-ranges.mjs").toString("base64");
    const { parseQuizReferences } = await import(/* @vite-ignore */ parserUrl) as {
      parseQuizReferences: (value: string, books: typeof canonicalBooks) => Reference[];
    };
    let ranges = 0, multiple = 0, singleChapterWithoutNumber = 0;
    for (const stored of questions) {
      const originalRanges = parseQuizReferences(stored.referenceText, canonicalBooks);
      expect(stored.referenceRanges).toEqual(originalRanges);
      expect(parseNtReferenceText(stored.referenceText)).toEqual(originalRanges);
      ranges += originalRanges.length;
      if (originalRanges.length > 1) multiple++;
      if (!stored.referenceText.includes(",")) {
        singleChapterWithoutNumber++;
        expect(NT_BOOKS.find((book) => book.code === stored.book)?.chapters).toBe(1);
      }
      for (const ref of originalRanges) {
        expect(ref.book).toBe(stored.book);
        expect(ref.chapter).toBe(stored.chapter);
        expect(validReference(ref)).toBe(true);
        expect(getPassage(ref).map((verse) => verse.n)).toEqual(
          Array.from({ length: ref.to! - ref.from! + 1 }, (_, i) => ref.from! + i),
        );
      }
    }
    expect({ ranges, multiple, singleChapterWithoutNumber })
      .toEqual({ ranges: 1304, multiple: 4, singleChapterWithoutNumber: 20 });
  });

  it("liefert defensive Kopien für Kapitel, Fragen, Optionen, Referenzen und kleine Indexeinträge", () => {
    const original = question();
    const current = question();
    current.options[0] = "Geänderte Option";
    current.referenceRanges[0]!.from = 1;
    current.prompt = "Geänderte Frage";
    expect(question()).toEqual(original);
    const chapter = ntChapter("MAT", 1)!;
    chapter.title = "Geändert";
    chapter.questions[0]!.options[0] = "Geändert";
    chapter.questions.pop();
    expect(ntChapter("MAT", 1)?.questions).toHaveLength(5);
    expect(ntChapter("MAT", 1)?.questions[0]).toEqual(original);
    const index = ntChapterIndex("MAT", 1)!;
    (index as { title: string }).title = "Geändert";
    expect(ntChapterIndex("MAT", 1)?.title).toBe(units[0]!.title);
    expect(Object.isFrozen(NT_BOOKS)).toBe(true);
    expect(NT_BOOKS.every(Object.isFrozen)).toBe(true);
  });

  it("weist unbekannte IDs/Kapitel ab und hält das Fortschrittsmodul frei von der Vollbank", () => {
    for (const id of ["FP0261", "FP-0260", "FP-1561", "FP-02610", "N-0261", "__proto__", "UnknownId", "FP-0261\n", "FP-0261\r\n"])
      expect(ntQuestionLocation(id)).toBeNull();
    for (const [book, chapter] of [["MAT", 0], ["MAT", 29], ["MAT", 1.5], ["XXX", 1]] as const) {
      expect(ntChapterIndex(book, chapter)).toBeNull();
      expect(ntChapter(book, chapter)).toBeNull();
    }
    expect(ntQuestion("FP-0001")).toBeNull();
    const module = readFileSync(new URL("../src/features/quiz/index.ts", import.meta.url), "utf8");
    expect([...module.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]))
      .toEqual(["../../data/nt-index.json"]);
  });

  it("verwirft zusätzliche Felder, fehlerhafte Optionen/Indizes, Referenzen, Zuordnungen und Hashes", () => {
    const valid = question();
    const invalid = [
      { ...valid, extra: true },
      { ...valid, options: valid.options.slice(0, 3) },
      { ...valid, options: [...valid.options, "Fünfte Option"] },
      { ...valid, options: ["", ...valid.options.slice(1)] },
      { ...valid, options: ["   ", ...valid.options.slice(1)] },
      { ...valid, options: [valid.options[0], valid.options[0], ...valid.options.slice(2)] },
      ...[-1, 4, 0.5].map((correctIndex) => ({ ...valid, correctIndex })),
      { ...valid, chapter: 2 },
      { ...valid, book: "GEN" },
      { ...valid, legacyUnitId: 10001 },
      { ...valid, referenceRanges: [] },
      { ...valid, referenceRanges: [{ ...valid.referenceRanges[0], from: 999, to: 999 }] },
      { ...valid, referenceRanges: [{ ...valid.referenceRanges[0], from: 20, to: 17 }] },
      { ...valid, referenceText: "Unbekannt 1,1" },
      { ...valid, referenceText: "Matthäus 1,1" },
      { ...valid, hash: "0".repeat(64) },
    ];
    for (const value of invalid) expect(ntQuestionSchema.safeParse(value).success).toBe(false);
    expect(ntQuestionSnapshotSchema.safeParse(valid).success).toBe(false);
    expect(ntReferenceSchema.safeParse({ book: "MAT", chapter: 1, from: 17, to: 17, extra: true }).success).toBe(false);
    expect(ntSourceQuestionSchema.safeParse({ ...units[0]!.questions[0], difficulty: "easy" }).success).toBe(false);
    expect(ntSourceUnitSchema.safeParse({ ...units[0], chapter: 1 }).success).toBe(false);
    expect(ntSourceUnitSchema.safeParse({ ...units[0], questions: [...units[0]!.questions].reverse() }).success).toBe(false);
    expect(ntSourceUnitSchema.safeParse({ ...units[0], kind: "story" }).success).toBe(false);
    expect(ntSourceUnitSchema.safeParse({ ...units[0], extra: true }).success).toBe(false);
    for (const id of ["FP-0261\n", "FP-0261\r\n", "UnknownId"]) {
      const invalidIdSnapshot = { ...snapshot(), id };
      expect(ntQuestionSnapshotSchema.safeParse(invalidIdSnapshot).success).toBe(false);
      expect(ntQuestionSchema.safeParse({ ...invalidIdSnapshot, hash: ntQuestionHash(invalidIdSnapshot) }).success).toBe(false);
      expect(ntSourceQuestionSchema.safeParse({ ...units[0]!.questions[0], faithpath_id: id }).success).toBe(false);
      expect(ntQuestion(id)).toBeNull();
    }
    const boundaryText = " " + "a".repeat(9998) + " ";
    const boundary = {
      ...snapshot(), prompt: boundaryText, explanation: boundaryText,
      options: [boundaryText, ...valid.options.slice(1)] as NtQuestion["options"],
    };
    const preserved = ntQuestionSnapshotSchema.parse(boundary);
    expect(preserved.prompt).toBe(boundaryText);
    expect(preserved.explanation).toBe(boundaryText);
    expect(preserved.options[0]).toBe(boundaryText);
    expect(ntQuestionSchema.safeParse({ ...boundary, hash: ntQuestionHash(boundary) }).success).toBe(true);
    const sourceBoundary = ntSourceQuestionSchema.parse({
      ...units[0]!.questions[0], q: boundaryText, x: boundaryText,
      a: [boundaryText, ...valid.options.slice(1)],
    });
    expect([sourceBoundary.q, sourceBoundary.x, sourceBoundary.a[0]])
      .toEqual([boundaryText, boundaryText, boundaryText]);
    const oversized = "a".repeat(10001);
    for (const field of ["prompt", "explanation", "referenceText"] as const) {
      const result = ntQuestionSnapshotSchema.safeParse({ ...snapshot(), [field]: oversized });
      expect(result.success).toBe(false);
      expect(result.error?.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ code: "too_big", maximum: 10000, path: [field] }),
      ]));
    }
    const oversizedOption = ntQuestionSnapshotSchema.safeParse({
      ...snapshot(), options: [oversized, ...valid.options.slice(1)],
    });
    expect(oversizedOption.error?.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "too_big", maximum: 10000, path: ["options", 0] }),
    ]));
    for (const field of ["q", "x", "ref"] as const) {
      const result = ntSourceQuestionSchema.safeParse({ ...units[0]!.questions[0], [field]: oversized });
      expect(result.error?.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ code: "too_big", maximum: 10000, path: [field] }),
      ]));
    }
    const oversizedSourceOption = ntSourceQuestionSchema.safeParse({
      ...units[0]!.questions[0], a: [oversized, ...valid.options.slice(1)],
    });
    expect(oversizedSourceOption.error?.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "too_big", maximum: 10000, path: ["a", 0] }),
    ]));
    for (const field of ["title", "ref", "desc", "reflection"] as const) {
      const result = ntSourceUnitSchema.safeParse({ ...units[0], [field]: oversized });
      expect(result.error?.issues).toEqual(expect.arrayContaining([
        expect.objectContaining({ code: "too_big", maximum: 10000, path: [field] }),
      ]));
    }
    // Answer-time snapshots remain valid independently of subsequent catalog text revisions.
    const historical = { ...snapshot(), prompt: "Ein aufbewahrter älterer Wortlaut" };
    expect(ntQuestionSnapshotSchema.safeParse(historical).success).toBe(true);
    expect(ntQuestionSchema.safeParse({ ...historical, hash: ntQuestionHash(historical) }).success).toBe(true);
  });
});
