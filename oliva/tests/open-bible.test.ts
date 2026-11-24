import { describe, expect, it } from "vitest";
import source from "../content/open-bible-de/import.json";
import { OTB_BOOKS } from "../src/features/bible/open-bible";
import { adjacentOtbChapter, otbChapter, searchOtb } from "../src/features/bible/open-bible-content";
import { getChapter } from "../src/features/bible/repository";

describe("Open Translation Bible · Deutsch", () => {
  it("enthält das vollständige Werk mit gültiger Kapitel- und Versnummerierung", () => {
    const chapters = OTB_BOOKS.flatMap((book) =>
      Array.from({ length: book.chapters }, (_, index) => otbChapter(book.code, index + 1)),
    );
    expect(OTB_BOOKS).toHaveLength(66);
    expect(chapters).toHaveLength(1189);
    expect(chapters.every((chapter) => chapter?.verses.length &&
      chapter.verses.every((verse, index) => verse.text.trim() && verse.n > (chapter.verses[index - 1]?.n ?? 0)))).toBe(true);
    expect(chapters.reduce((count, chapter) => count + (chapter?.verses.length ?? 0), 0)).toBe(source.verses);
    expect(chapters.reduce((count, chapter) => count + (chapter?.notes.length ?? 0), 0)).toBe(141);
  });

  it("bewahrt die Grenzen jeder Ausgabe und den sicheren Buchwechsel", () => {
    expect(otbChapter("JOL", 4)).toBeUndefined();
    expect(getChapter("JOL", 4)).toHaveLength(0);
    expect(otbChapter("MAL", 4)?.verses.length).toBeGreaterThan(0);
    expect(getChapter("MAL", 4).length).toBeGreaterThan(0);
    expect(otbChapter("3JN", 1)?.verses.at(-1)?.n).toBe(15);
    expect(getChapter("3JN", 1).at(-1)?.n).toBe(14);
    expect(adjacentOtbChapter("MAL", 3, 1)).toEqual({ book: "MAL", chapter: 4 });
    expect(adjacentOtbChapter("MAL", 4, 1)).toEqual({ book: "MAT", chapter: 1 });
  });

  it("sucht im OTB-Wortlaut mit Quellenvers und getrennter Textanmerkung", () => {
    expect(searchOtb("wieder begann jesus am see", 60)).toContainEqual(
      { book: "MRK", chapter: 4, verse: 1, text: otbChapter("MRK", 4)!.verses[0]!.text },
    );
    expect(searchOtb(" ", 5)).toEqual([]);
    expect(otbChapter("JHN", 8)?.notes.some((note) => note.text.includes("Manuskripte"))).toBe(true);
  });
});
