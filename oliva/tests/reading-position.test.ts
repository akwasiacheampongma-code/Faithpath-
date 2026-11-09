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
    const { readingPosition, retainedReviewGrowth, invitations, ...fields } =
      initialData();
    const old = { ...fields, version: 4 as const, name: "Ada", revision: 9 };
    const before = JSON.stringify(old);
    expect(decodeData(old)).toEqual({
      ...old,
      version: 7,
      invitations: { enabled: false, snoozed: {}, dismissed: {} },
      retainedReviewGrowth: { reflections: 0, actions: 0 },
      readingPosition: null,
    });
    expect(
      await decodeStored({ storageVersion: 1, data: old }, async () => {
        throw Error("Kein Archiv");
      }),
    ).toEqual({
      ...old,
      version: 7,
      invitations: { enabled: false, snoozed: {}, dismissed: {} },
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
  it("ordnet eine gemeinsam belegte Inlinezeile ihrem ersten kanonischen Vers zu", () => {
    const fragments = [
      { verse: 8, y: 100, height: 28 },
      { verse: 7, y: 100, height: 28 },
      { verse: 9, y: 100, height: 28 },
      { verse: 10, y: 130, height: 28 },
    ];
    expect(verseAtOffset(fragments, 99)).toBeNull();
    expect(verseAtOffset(fragments, 100)).toBe(7);
    expect(verseAtOffset(fragments, 129)).toBe(7);
    expect(verseAtOffset(fragments, 130)).toBe(10);
    expect(verseAtOffset([...fragments].reverse(), 115)).toBe(7);
  });
  it("berücksichtigt Fortsetzungsfragmente langer Verse und kleine reale Baselineabweichungen", () => {
    const fragments = [
      { verse: 10, y: 100, height: 28 },
      { verse: 10, y: 130, height: 28 },
      { verse: 11, y: 130.2, height: 28 },
      { verse: 11, y: 160, height: 28 },
      { verse: 12, y: 160.35, height: 28 },
      { verse: 13, y: 190, height: 28 },
    ];
    const bytes = JSON.stringify(fragments);
    expect(verseAtOffset(fragments, 130.5)).toBe(10);
    expect(verseAtOffset(fragments, 161)).toBe(11);
    expect(verseAtOffset(fragments, 190)).toBe(13);
    expect(JSON.stringify(fragments)).toBe(bytes);
  });
  it("ignoriert nicht messbare Fragmente statt daraus einen falschen Anker zu speichern", () => {
    const fragments = [
      { verse: 1, y: 100, height: 24 },
      { verse: 2, y: 110, height: 0 },
      { verse: 3, y: 120, height: -1 },
      { verse: 4, y: 130, height: Infinity },
      { verse: 5, y: NaN, height: 24 },
      { verse: 6, y: Infinity, height: 24 },
      { verse: 0, y: 140, height: 24 },
      { verse: 1.5, y: 150, height: 24 },
    ];
    expect(verseAtOffset(fragments, 200)).toBe(1);
    expect(verseAtOffset(fragments.slice(1), 200)).toBeNull();
    expect(verseAtOffset(fragments, Infinity)).toBeNull();
    expect(verseAtOffset([], 200)).toBeNull();
  });
});
