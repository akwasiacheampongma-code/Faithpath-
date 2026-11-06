import { describe, it, expect } from "vitest";
import { TEXT_CHECKS, checkFor } from "../src/features/paths/checks";
import { validReference, getPassage } from "../src/features/bible/repository";
import { PATHS } from "../src/features/paths/catalog";
describe("Freiwillige Textfragen mit belegten Stellen", () => {
  it("deckt jeden der neun Pilotabschnitte ab und hält Antworten sowie Belegverse eindeutig", () => {
    expect(TEXT_CHECKS).toHaveLength(9);
    expect(new Set(TEXT_CHECKS.map((q) => q.id)).size).toBe(9);
    for (const q of TEXT_CHECKS) {
      expect(validReference(q.ref)).toBe(true);
      expect(validReference(q.evidence)).toBe(true);
      expect(q.evidence.book).toBe(q.ref.book);
      expect(q.evidence.chapter).toBe(q.ref.chapter);
      expect(q.evidence.from).toBeGreaterThanOrEqual(q.ref.from!);
      expect(q.evidence.to).toBeLessThanOrEqual(q.ref.to!);
      expect(q.choices.filter((c) => c.id === q.correct)).toHaveLength(1);
      expect(new Set(q.choices.map((c) => c.id)).size).toBe(3);
      expect(getPassage(q.evidence)[0]?.text.length).toBeGreaterThan(10);
    }
    for (const path of PATHS)
      for (const step of path.steps) expect(checkFor(step.ref)).toBeDefined();
  });
});
