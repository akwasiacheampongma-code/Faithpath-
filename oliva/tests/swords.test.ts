import { describe, expect, it } from "vitest";
import { BOOKS, validReference } from "../src/features/bible/repository";
import { initialData } from "../src/state/model";
import {
  bookJourney,
  normalizeSwordProgress,
  swordIdentity,
} from "../src/features/swords/model";

describe("Buchidentitäten und echte Lesespuren", () => {
  it("öffnet alle 66 vorhandenen Buchidentitäten ohne Nutzdaten zu verändern", () => {
    const data = initialData(),
      before = JSON.stringify(data);
    for (const book of BOOKS) {
      const model = bookJourney(data, book.code)!;
      expect(model.identity.title).toBe(book.sword);
      expect(model.identity.book.chapters).toBe(book.chapters);
      expect(model.readCount).toBe(0);
      expect(model.nextChapter).toBe(
        book.code === data.reading.book ? data.reading.chapter : 1,
      );
    }
    expect(new Set(BOOKS.map((b) => swordIdentity(b.code)!.title)).size).toBe(
      66,
    );
    expect(JSON.stringify(data)).toBe(before);
    expect(bookJourney(data, "XXX")).toBeNull();
  });
  it("verankert Johannes' Quelle und Weinstock in existierenden Bibelstellen", () => {
    const identity = swordIdentity("JHN")!;
    expect(identity.book.motif).toBe("Quelle");
    expect(identity.motif).toBe("Quelle und Weinstock");
    expect(identity.references).toHaveLength(3);
    expect(identity.references.every((r) => validReference(r.ref))).toBe(true);
    expect(identity.illustrated).toBe(true);
    expect(
      BOOKS.filter((b) => swordIdentity(b.code)!.illustrated),
    ).toHaveLength(1);
  });
  it("zählt nur eindeutige bestätigte Kapitel dieses Buches und schlägt ein ungelesenes Kapitel vor", () => {
    const data = initialData();
    data.readChapters = ["JHN:1", "JHN:1", "JHN:22", "MRK:1", "JHN:2"];
    data.reading = { book: "JHN", chapter: 2 };
    expect(bookJourney(data, "JHN")).toMatchObject({
      readCount: 2,
      readChapters: [1, 2],
      progress: 2 / 21,
      nextChapter: 3,
    });
    data.reading = { book: "JHN", chapter: 12 };
    expect(bookJourney(data, "JHN")!.nextChapter).toBe(12);
    data.readChapters = Array.from({ length: 21 }, (_, i) => `JHN:${i + 1}`);
    expect(bookJourney(data, "JHN")).toMatchObject({
      readCount: 21,
      progress: 1,
      nextChapter: 12,
    });
    expect([NaN, Infinity, -Infinity, -1].map(normalizeSwordProgress)).toEqual([
      0, 0, 0, 0,
    ]);
    expect(normalizeSwordProgress(2)).toBe(1);
  });
});
