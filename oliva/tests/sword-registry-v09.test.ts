import { describe, expect, it } from "vitest";
import { BOOKS, getPassage, validReference } from "../src/features/bible/repository";
import { initialData } from "../src/state/model";
import { bookJourney, swordIdentity } from "../src/features/swords/model";
import { swordIllustration } from "../src/features/swords/illustrations";

describe("Buchbilder mit getrennten Quellen und Lesespuren", () => {
  it("keeps all 66 book identities and resolves actual Romans source verses", () => {
    const data = initialData(), before = JSON.stringify(data);
    for (const book of BOOKS) {
      expect(bookJourney(data, book.code)!.identity.title).toBe(book.sword);
    }
    const illustrated = BOOKS.filter(book => swordIdentity(book.code)!.illustrated);
    expect(illustrated.map(book => book.code).sort()).toEqual(["JHN", "ROM"]);
    const romans = swordIdentity("ROM")!;
    expect(romans.book.chapters).toBe(16);
    expect(romans.references.map(source => source.ref)).toEqual([
      { book: "ROM", chapter: 3, from: 23, to: 24 },
      { book: "ROM", chapter: 5, from: 1, to: 1 },
      { book: "ROM", chapter: 8, from: 1, to: 1 },
    ]);
    for (const source of romans.references) expect(validReference(source.ref)).toBe(true);
    expect(getPassage(romans.references[0]!.ref)).toHaveLength(2);
    expect(getPassage(romans.references[0]!.ref)[1]!.text).toContain("ohne Verdienst");
    expect(getPassage(romans.references[1]!.ref)[0]!.text).toContain("Frieden mit Gott");
    expect(JSON.stringify(data)).toBe(before);
  });

  it("reads Romans' unique confirmed chapters without counting foreign or invalid chapters", () => {
    const data = initialData();
    data.readChapters = ["ROM:1", "ROM:1", "ROM:17", "JHN:1"];
    data.reading = { book: "ROM", chapter: 1 };
    const before = JSON.stringify(data);
    expect(bookJourney(data, "ROM")).toMatchObject({
      readCount: 1, readChapters: [1], progress: 1 / 16, nextChapter: 2,
    });
    expect(JSON.stringify(data)).toBe(before);
  });

  it("keeps metadata queries safe for unknown books and protects registered references from caller mutation", () => {
    for (const code of ["XXX", "__proto__", "constructor", ""]) {
      expect(swordIllustration(code)).toBeNull();
      expect(swordIdentity(code)).toBeNull();
    }
    const first = swordIdentity("JHN")!;
    first.references[0]!.ref.chapter = 99;
    expect(swordIdentity("JHN")!.references[0]!.ref.chapter).toBe(1);
    expect(swordIdentity("JHN")!.motif).toBe("Quelle und Weinstock");
  });
});
