import { describe, expect, it } from "vitest";
import { homeReading } from "../src/features/journey/home-reading";
import { initialData } from "../src/state/model";

describe("the reading landscape on Heute", () => {
  it("uses Galilee and the real first passage for a new profile", () => {
    expect(homeReading(initialData())).toEqual({
      resume: false,
      reference: { book: "MRK", chapter: 4, from: 35, to: 41 },
      testament: "NT",
      position: null,
    });
  });

  it.each([
    ["PSA", 23, "AT"],
    ["JHN", 3, "NT"],
  ] as const)("follows the testament of the saved chapter %s %s", (book, chapter, testament) => {
    const profile = initialData();
    profile.reading = { book, chapter };
    expect(homeReading(profile)).toMatchObject({
      resume: true,
      reference: { book, chapter },
      testament,
    });
  });

  it("keeps the saved verse when it belongs to the displayed reading scope", () => {
    const profile = initialData();
    profile.reading = { book: "RUT", chapter: 1 };
    profile.readingPosition = {
      ref: profile.reading,
      verse: 14,
      mode: "read",
    };
    expect(homeReading(profile).position?.verse).toBe(14);
    profile.reading = { book: "MRK", chapter: 4 };
    expect(homeReading(profile)).toMatchObject({ testament: "NT", position: null });
  });
});
