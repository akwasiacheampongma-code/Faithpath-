import { describe, it, expect } from "vitest";
import {
  BOOKS,
  adjacentChapter,
  getChapter,
  getPassage,
  searchBible,
  validReference,
} from "../src/features/bible/repository";
import { PATHS } from "../src/features/paths/catalog";
import {
  initialData,
  markRead,
  finishStep,
  grow,
  parseBackup,
  dataSchema,
} from "../src/state/model";
import { dailyVerse } from "../src/features/bible/daily";

describe("Bibelkorpus und Navigation", () => {
  it("enthält den vollständigen Kanon und eindeutige, nicht leere Verse", () => {
    expect(BOOKS).toHaveLength(66);
    expect(BOOKS.reduce((n, b) => n + b.chapters, 0)).toBe(1189);
    let count = 0;
    for (const book of BOOKS)
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        const verses = getChapter(book.code, chapter);
        expect(verses.length).toBeGreaterThan(0);
        expect(new Set(verses.map((v) => v.n)).size).toBe(verses.length);
        expect(
          verses.every((v) => v.text.length > 0 && !/\\w|strong=/.test(v.text)),
        ).toBe(true);
        count += verses.length;
      }
    expect(count).toBe(31102);
  });
  it("wechselt an Buchgrenzen korrekt und endet an Kanongrenzen", () => {
    expect(adjacentChapter("GEN", 50, 1)).toEqual({ book: "EXO", chapter: 1 });
    expect(adjacentChapter("MAT", 1, -1)).toEqual({ book: "MAL", chapter: 4 });
    expect(adjacentChapter("GEN", 1, -1)).toBeNull();
    expect(adjacentChapter("REV", 22, 1)).toBeNull();
  });
  it("lehnt erfundene Kapitel und Versbereiche ab", () => {
    for (const ref of [
      { book: "GEN", chapter: 0 },
      { book: "MRK", chapter: 17 },
      { book: "fake", chapter: 1 },
      { book: "MRK", chapter: 4, from: 0 },
      { book: "MRK", chapter: 4, from: 40, to: 35 },
      { book: "MRK", chapter: 4, to: 900 },
    ])
      expect(validReference(ref)).toBe(false);
  });
  it("findet einen echten Vers und bewahrt dessen Quelle", () => {
    const hits = searchBible("Friede mit euch", 60);
    expect(hits.length).toBeGreaterThan(0);
    for (const hit of hits)
      expect(
        getChapter(hit.book, hit.chapter).find((v) => v.n === hit.verse)?.text,
      ).toBe(hit.text);
    expect(searchBible("   ")).toEqual([]);
  });
  it("verwendet für Tagesverse ausschließlich echte, unveränderte Texte", () => {
    const morning = dailyVerse(new Date(2026, 10, 5, 6)),
      evening = dailyVerse(new Date(2026, 10, 5, 23));
    expect(morning).toEqual(evening);
    expect(morning.text).toBe(getPassage(morning.ref)[0]?.text);
    expect(dailyVerse(new Date(2026, 10, 6)).ref).not.toEqual(morning.ref);
  });
});
describe("Lernfortschritt und Datensicherheit", () => {
  it("zählt wiederholte Kapitelbestätigung genau einmal", () => {
    const data = initialData();
    markRead(data, { book: "MRK", chapter: 4 });
    markRead(data, { book: "MRK", chapter: 4 });
    expect(data.readChapters).toEqual(["MRK:4"]);
  });
  it("zählt einen kurzen Abschnitt niemals als ganzes Kapitel", () => {
    const data = initialData();
    markRead(data, { book: "MRK", chapter: 4, from: 35, to: 41 }, "jesus:0");
    expect(data.readChapters).toEqual([]);
    expect(data.readSteps).toEqual(["jesus:0"]);
    expect(() => finishStep(data, "jesus:1")).toThrow();
    finishStep(data, "jesus:0");
    finishStep(data, "jesus:0");
    expect(data.completedSteps).toEqual(["jesus:0"]);
  });
  it("weist manipulierte Weg-/Textverknüpfungen zurück", () => {
    expect(() =>
      markRead(initialData(), { book: "GEN", chapter: 1 }, "jesus:0"),
    ).toThrow();
    expect(() =>
      markRead(
        initialData(),
        { book: "MRK", chapter: 4, from: 35, to: 41 },
        "nicht-vorhanden:0",
      ),
    ).toThrow();
  });
  it("merkt frei gelesene Abschnitte getrennt vom Kapitel", () => {
    const data = initialData();
    const ref = { book: "JHN", chapter: 14, from: 27, to: 27 };
    markRead(data, ref);
    markRead(data, ref);
    expect(data.readPassages).toEqual(["JHN:14:27:27"]);
    expect(data.readChapters).toEqual([]);
  });
  it("besitzt neun vollständige Wege mit gültigen Bibelstellen", () => {
    expect(PATHS).toHaveLength(9);
    for (const p of PATHS) {
      expect(p.steps).toHaveLength(3);
      for (const s of p.steps) {
        expect(validReference(s.ref)).toBe(true);
        expect(s.explanation.length).toBeGreaterThan(100);
      }
    }
  });
  it("lässt einen erreichten Baum in Pausen oder nach Löschen einer Notiz nicht zurückfallen", () => {
    const data = initialData();
    data.growthStage = 5;
    grow(data);
    expect(data.growthStage).toBe(5);
    expect(initialData().growthStage).toBe(0);
  });
  it("erreicht Früchte erst mit freiwillig bestätigter Anwendung", () => {
    const data = initialData();
    data.readSteps = PATHS.flatMap((p) =>
      p.steps.map((_, i) => `${p.id}:${i}`),
    ).slice(0, 14);
    data.completedSteps = data.readSteps.slice(0, 7);
    data.notes = Array.from({ length: 3 }, (_, i) => ({
      id: String(i),
      text: "Eine persönliche Reflexion",
      kind: "reflection" as const,
      createdAt: "2026-11-05T12:00:00.000Z",
      updatedAt: "2026-11-05T12:00:00.000Z",
    }));
    grow(data);
    expect(data.growthStage).toBe(5);
    data.notes.push({ ...data.notes[0]!, id: "application", kind: "action" });
    grow(data);
    expect(data.growthStage).toBe(6);
  });
  it("prüft Sicherungen vollständig vor jeder Ersetzung", () => {
    const data = initialData();
    expect(parseBackup(JSON.stringify(data))).toEqual(data);
    for (const text of [
      "{",
      "{}",
      JSON.stringify({ ...data, readChapters: ["MRK:99"] }),
      JSON.stringify({ ...data, readChapters: ["MRK:1", "MRK:1"] }),
      JSON.stringify({ ...data, completedSteps: ["jesus:0"] }),
      JSON.stringify({ ...data, version: 999 }),
      JSON.stringify({ ...data, unexpected: "x" }),
      " ".repeat(2_000_001),
    ])
      expect(() => parseBackup(text)).toThrow();
  });
  it("hält für jedes Buch eine individuelle Themenidentität bereit", () => {
    expect(new Set(BOOKS.map((b) => b.sword)).size).toBe(66);
    expect(new Set(BOOKS.map((b) => b.index)).size).toBe(66);
  });
});
