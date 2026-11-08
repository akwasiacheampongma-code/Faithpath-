import { describe, it, expect } from "vitest";
import { SCENES, sceneFor } from "../src/features/bible/scenes";
import { validReference, getPassage } from "../src/features/bible/repository";
describe("Szenen mit ausdrücklichem Textbereich", () => {
  it("verweist auf fünf vorhandene Abschnitte und ordnet spätere Verse keinem fremden Abschnitt zu", () => {
    expect(SCENES).toHaveLength(5);
    expect(new Set(SCENES.map((s) => s.id)).size).toBe(5);
    for (const scene of SCENES) {
      expect(validReference(scene.ref)).toBe(true);
      expect(getPassage(scene.ref).length).toBeGreaterThan(0);
      expect(sceneFor(scene.ref)?.id).toBe(scene.id);
      expect(scene.interpretation.length).toBeGreaterThan(40);
    }
    expect(
      sceneFor({ book: "MRK", chapter: 16, from: 9, to: 20 }),
    ).toBeUndefined();
    expect(sceneFor({ book: "GEN", chapter: 15 })?.id).toBe("abraham");
  });
  it("ordnet Davids Vorbereitung dem genauen Ausschnitt zu und deutet spätere Verse nicht um", () => {
    const scene = SCENES.find((s) => s.id === "david-before-goliath")!;
    expect(scene.ref).toEqual({ book: "1SA", chapter: 17, from: 38, to: 45 });
    expect(getPassage(scene.ref).map((v) => v.n)).toEqual([
      38, 39, 40, 41, 42, 43, 44, 45,
    ]);
    expect(getPassage(scene.ref).find((v) => v.n === 40)?.text).toContain(
      "fünf glatte Steine",
    );
    expect(sceneFor({ book: "1SA", chapter: 17, from: 45, to: 45 })?.id).toBe(
      scene.id,
    );
    expect(
      sceneFor({ book: "1SA", chapter: 17, from: 46, to: 58 }),
    ).toBeUndefined();
  });
});
