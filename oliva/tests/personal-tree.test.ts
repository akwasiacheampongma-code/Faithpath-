import { describe, expect, it } from "vitest";
import type { Goal } from "../src/features/personal/schema";
import type { Note } from "../src/state/model";
import { personalTreeHistory, personalTreeLinks } from "../src/features/garden/personal-history";
import { a51Stage, treeLayout } from "../src/features/garden/a51/stages";

const at = "2026-11-17T08:00:00.000Z", later = "2026-11-18T09:00:00.000Z";
const goal = (id: string, patch: Partial<Goal> = {}): Goal => ({ id, title: "Vorhaben " + id, why: "In meinem Alltag.",
  createdAt: at, updatedAt: at, archivedAt: null, revision: 1, steps: [], reviews: [], ...patch });
const note = (id: string, patch: Partial<Note> = {}): Note => ({ id, text: "Meine Worte " + id,
  kind: "reflection", createdAt: at, updatedAt: at, ...patch });
const step = (id: string, done = false) => ({ id, text: "Heute bewusst zuhören.", done, createdAt: at, completedAt: done ? later : null });
const origin = { importId: "fp5-" + "a".repeat(64), kind: "path" as const, sourceId: "original-path",
  sourceKeys: ["fp5-path-" + "b".repeat(64)], entityHash: "c".repeat(64) };
function freeze<T>(value: T): T {
  if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

describe("Personal A51 branch and history projection", () => {
  it("never writes data or turns anonymous retained growth into invented memories", () => {
    const data = { goals: [goal("empty")], notes: [] as Note[], growthStage: 6,
      retainedReviewGrowth: { count: 12, applied: 7 }, completedSteps: ["jesus:0"], readChapters: ["JHN:1"] };
    const bytes = JSON.stringify(data); freeze(data);
    const model = personalTreeHistory(data);
    expect(model.timeline).toEqual([]); expect(model.branches).toEqual([]); expect(model.visible).toEqual([]);
    expect(model.unplaced.map((g) => g.goalId)).toEqual(["empty"]);
    expect(JSON.stringify(data)).toBe(bytes); expect(data.growthStage).toBe(6);
  });

  it("shows a shared thought once in the history and under both real associated goals, preserving orphaned thoughts", () => {
    const a = goal("a"), b = goal("b");
    const shared = note("shared", { goalIds: [a.id, b.id, "deleted-goal"] });
    const orphan = note("orphan", { goalIds: ["deleted-goal"] });
    const data = freeze({ goals: [a, b], notes: [shared, orphan], growthStage: 4 });
    const model = personalTreeHistory(data);
    expect(model.timeline).toHaveLength(2);
    expect(model.timeline.find((m) => m.key === "note:shared")?.goalIds).toEqual(["a", "b"]);
    expect(model.timeline.find((m) => m.key === "note:orphan")?.goalIds).toEqual([]);
    expect(model.branches.map((g) => g.moments.map((m) => m.key))).toEqual([["note:shared"], ["note:shared"]]);
    expect(model.timeline.find((m) => m.key === "note:orphan")?.target).toEqual({ type: "note", id: "orphan" });
    expect(shared.goalIds).toEqual(["a", "b", "deleted-goal"]);
  });

  it("keeps active branches before archived ones, uses actual recorded changes and breaks ties deterministically", () => {
    const archived = goal("archived", { archivedAt: later, steps: [step("a", true)] });
    const first = goal("b", { steps: [step("b")] }), second = goal("a", { steps: [step("a")] });
    const data = { goals: [archived, first, second], notes: [note("fresh", { goalIds: ["b"], updatedAt: later })], growthStage: 3 };
    const ordered = personalTreeHistory(data).branches.map((g) => g.goalId);
    expect(ordered).toEqual(["b", "a", "archived"]);
    expect(personalTreeHistory({ ...data, goals: [...data.goals].reverse() }).branches.map((g) => g.goalId)).toEqual(ordered);
    expect(personalTreeHistory({ ...data, notes: [] }).branches.map((g) => g.goalId)).toEqual(["a", "b", "archived"]);
  });

  it("preserves the original review title and exact text after a goal was renamed; unfinished steps remain unfinished", () => {
    const review = { id: "review", text: "Mein damaliger Blick.\nMit offenen Fragen.", applied: false,
      createdAt: at, updatedAt: later, source: { title: "Der damalige Titel", why: "Meine damalige Absicht", steps: [] } };
    const data = freeze({ goals: [goal("goal", { title: "Mein heutiger Titel", steps: [step("pending")], reviews: [review] })], notes: [], growthStage: 2 });
    const model = personalTreeHistory(data), moment = model.timeline.find((m) => m.kind === "review")!;
    expect(model.branches[0]?.title).toBe("Mein heutiger Titel");
    expect(moment.title).toBe("Der damalige Titel"); expect(moment.text).toBe(review.text);
    expect(moment.date).toBe(at); expect(moment.updatedAt).toBe(later); expect(moment.applied).toBe(false);
    expect(model.timeline.find((m) => m.kind === "step")?.completed).toBe(false);
    expect(review.source).toEqual({ title: "Der damalige Titel", why: "Meine damalige Absicht", steps: [] });
  });

  it("does not present an import fallback timestamp as a known original date or a newly lived event", () => {
    const imported = goal("imported", { origin, steps: [step("old", true)] });
    const thought = note("old", { origin: { ...origin, kind: "journal" }, goalIds: [imported.id] });
    const data = freeze({ goals: [imported], notes: [thought], growthStage: 5 });
    const model = personalTreeHistory(data);
    expect(model.branches[0]?.imported).toBe(true); expect(model.branches[0]?.latest).toBeNull();
    expect(model.timeline).toHaveLength(2);
    for (const moment of model.timeline) { expect(moment.date).toBeNull(); expect(moment.updatedAt).toBeNull(); }
    expect(model.timeline.find((m) => m.kind === "thought")?.imported).toBe(true);
    const importedGoalStep = model.timeline.find((m) => m.kind === "step")!;
    // A goal's origin does not prove that each later-added step was imported.
    expect(importedGoalStep.imported).toBe(false); expect(importedGoalStep.dateContext).toBe("imported-goal");
    expect(importedGoalStep.completed).toBe(true);
    expect(imported.steps[0]?.createdAt).toBe(at); expect(thought.createdAt).toBe(at);
  });

  it("exposes every documented branch at all seven stages, limiting only the visual link positions", () => {
    const goals = Array.from({ length: 7 }, (_, i) => goal(String(i), { steps: [step(String(i))] }));
    for (const [stage, count] of [0, 0, 1, 3, 5, 5, 5].entries()) {
      const data = freeze({ goals, notes: [], growthStage: stage }), model = personalTreeHistory(data);
      expect(model.branches).toHaveLength(7); expect(model.visible).toHaveLength(count);
      expect(model.other).toHaveLength(7 - count); expect(model.timeline).toHaveLength(7);
      expect(new Set([...model.visible.map((x) => x.branch.goalId), ...model.other.map((x) => x.goalId)]).size).toBe(7);
      for (const { slot } of model.visible) expect(slot.x >= 0 && slot.x <= 100 && slot.y >= 0 && slot.y <= 100).toBe(true);
      expect(data.growthStage).toBe(stage);
    }
  });
  it("keeps every 44px tree target separate and falls back to the list for enlarged text or very small artwork", () => {
    const goals = Array.from({ length: 7 }, (_, i) => goal(String(i), { steps: [step(String(i))] }));
    for (let stage = 0; stage < 7; stage++) for (const size of [220, 230, 300, 380]) {
      const model = personalTreeHistory({ goals, notes: [], growthStage: stage });
      const height = Math.max(120, treeLayout(a51Stage(stage), size).height);
      const links = personalTreeLinks(model, size, 1, height);
      expect(links.length).toBeLessThanOrEqual(size < 300 ? 3 : 5);
      for (let i = 0; i < links.length; i++) for (let j = i + 1; j < links.length; j++) {
        const a = links[i]!.slot, b = links[j]!.slot;
        expect(Math.abs(a.x - b.x) / 100 * size >= 44 || Math.abs(a.y - b.y) / 100 * height >= 44).toBe(true);
      }
      expect(personalTreeLinks(model, size, 1.6)).toEqual([]);
      expect(personalTreeLinks(model, 190, 1)).toEqual([]);
      expect(model.branches).toHaveLength(7);
    }
  });
});
