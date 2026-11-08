import { describe, it, expect } from "vitest";
import { initialData, decodeData } from "../src/state/model";
import { forStorage, decodeStored } from "../src/services/documents";
import {
  readingPositionSchema,
  sameReadingScope,
  verseAtOffset,
} from "../src/features/bible/position";
describe("Lesefortsetzung ohne Fortschrittsbestätigung", () => {
  it("migriert tatsächliche V4-Backups und private V1-Dokumente ohne Wortverlust", async () => {
    const { readingPosition, retainedReviewGrowth, ...fields } = initialData();
    const old = { ...fields, version: 4 as const, name: "Ada", revision: 9 };
    const before = JSON.stringify(old);
    expect(decodeData(old)).toEqual({
      ...old,
      version: 6,
      retainedReviewGrowth: { reflections: 0, actions: 0 },
      readingPosition: null,
    });
    expect(
      await decodeStored({ storageVersion: 1, data: old }, async () => {
        throw Error("Kein Archiv");
      }),
    ).toEqual({
      ...old,
      version: 6,
      retainedReviewGrowth: { reflections: 0, actions: 0 },
      readingPosition: null,
    });
    expect(JSON.stringify(old)).toBe(before);
  });
  it("validiert den Anker gegen den exakten Textabschnitt und das aktuelle Kapitel", () => {
    const data = initialData();
    data.reading = { book: "MRK", chapter: 4, from: 35, to: 41 };
    data.readingPosition = { ref: data.reading, verse: 38, mode: "deep" };
    expect(decodeData(data)).toEqual(data);
    expect(() =>
      readingPositionSchema.parse({ ...data.readingPosition, verse: 20 }),
    ).toThrow();
    expect(() =>
      decodeData({ ...data, reading: { book: "JHN", chapter: 1 } }),
    ).toThrow();
    expect(sameReadingScope(data.reading, { book: "MRK", chapter: 4 })).toBe(
      false,
    );
    expect(forStorage(data).data.readingPosition).toEqual(data.readingPosition);
  });
  it("ordnet unterschiedliche Zeilenhöhen dem Vers zu und lässt Einleitungen unberührt", () => {
    const small = [
      { verse: 35, y: 400, height: 40 },
      { verse: 36, y: 445, height: 60 },
      { verse: 37, y: 510, height: 50 },
    ];
    const large = [
      { verse: 35, y: 600, height: 80 },
      { verse: 36, y: 685, height: 100 },
      { verse: 37, y: 790, height: 90 },
    ];
    expect(verseAtOffset(small, 0)).toBeNull();
    expect(verseAtOffset(small, 460)).toBe(36);
    expect(verseAtOffset(large, 700)).toBe(36);
    expect(verseAtOffset(small, 900)).toBe(37);
    expect(verseAtOffset(small, NaN)).toBeNull();
  });
});
