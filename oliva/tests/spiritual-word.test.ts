import { describe, expect, it } from "vitest";
import { BOOKS, getChapter, validReference } from "../src/features/bible/repository";
import { WORD_SOURCE_VERSE, WORD_EXCERPT, WORD_REFERENCE, WORD_CONTEXT, WORD_OLIVA_CONTEXT } from "../src/features/bible/spiritual-word";
import { initialData } from "../src/state/model";

describe("ein geistliches Symbol und unveränderte Bibel", () => {
  it("zitiert eine wörtliche zusammenhängende Stelle der integrierten Lutherbibel1912", () => {
    expect(WORD_SOURCE_VERSE).toBe("und nehmet den Helm des Heils und das Schwert des Geistes, welches ist das Wort Gottes.");
    expect(WORD_EXCERPT).toBe("… und das Schwert des Geistes, welches ist das Wort Gottes.");
    expect(WORD_SOURCE_VERSE.endsWith(WORD_EXCERPT.slice(2))).toBe(true);
    expect(WORD_SOURCE_VERSE).not.toContain("Nehmet das Schwert");
    expect(validReference(WORD_REFERENCE)).toBe(true);
    expect(validReference(WORD_CONTEXT)).toBe(true);
    expect(getChapter("EPH", 6).find(v => v.n === 12)!.text).toContain("nicht mit Fleisch und Blut");
    expect(WORD_OLIVA_CONTEXT).toBe("Gottes Wort kann uns Orientierung, Halt und Stärke schenken – im Alltag und in schweren Zeiten.");
  });
  it("behält sämtliche1189Kapitel der66Bücher ohne Schwertidentitäten erreichbar", () => {
    const data = initialData(), before = JSON.stringify(data);
    for (const book of BOOKS) {
      expect(book).not.toHaveProperty("sword");
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        expect(validReference({ book: book.code, chapter })).toBe(true);
        expect(getChapter(book.code, chapter).length).toBeGreaterThan(0);
      }
    }
    expect(JSON.stringify(data)).toBe(before);
    expect(data.version).toBe(11);
  });
});
