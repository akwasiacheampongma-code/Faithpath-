import { describe, it, expect } from "vitest";
import {
  initialData,
  decodeData,
  parseBackup,
  grow,
  dataSchema,
} from "../src/state/model";
import {
  saveDraft,
  commitDraft,
  removeDraft,
  journalDraft,
  goalSnapshot,
  setStepDone,
  archiveGoal,
} from "../src/features/personal/model";
import type { DraftOf } from "../src/features/personal/schema";
const at = "2026-11-06T04:00:00.000Z";
function makeGoal() {
  const data = initialData(),
    draft: DraftOf<"goal"> = {
      id: "draft-goal",
      key: "goal:new",
      type: "goal",
      revision: 0,
      updatedAt: at,
      values: {
        entityId: "goal-1",
        targetId: null,
        baseRevision: null,
        title: "In Ruhe zuhören",
        why: "Ich möchte meinem Gegenüber Raum geben.",
        initialStep: "Vor meiner Antwort drei Sekunden warten.",
      },
    };
  saveDraft(data, draft, null);
  commitDraft(data, draft.key, data.drafts[0]!, at);
  return data;
}
describe("Verlustfreie Payload-Migration", () => {
  it("übernimmt V1-Daten mit Notizen, Fortschritt und Einstellungen ohne Veränderung der Quelle", () => {
    const current = initialData();
    const { goals, drafts, imports, readingPosition, ...rest } = current;
    const old = {
      ...rest,
      version: 1,
      name: "Ada",
      readChapters: ["MRK:4"],
      growthStage: 4,
      notes: [
        {
          id: "note-1",
          text: "Meine eigenen Worte.",
          kind: "reflection",
          createdAt: at,
          updatedAt: at,
        },
      ],
      highlights: { "MRK:4:35": "gold" },
    };
    const bytes = JSON.stringify(old),
      migrated = decodeData(old);
    expect(migrated).toEqual({
      ...old,
      version: 5,
      readingPosition: null,
      goals: [],
      drafts: [],
      imports: [],
    });
    expect(JSON.stringify(old)).toBe(bytes);
    expect(parseBackup(bytes)).toEqual(migrated);
  });
  it("weist beschädigte alte Daten und unbekannte Versionen zurück", () => {
    const { goals, drafts, imports, readingPosition, ...rest } = initialData();
    expect(() =>
      decodeData({ ...rest, version: 1, readChapters: ["GEN:99"] }),
    ).toThrow();
    expect(() => decodeData({ ...rest, version: 999 })).toThrow();
  });
  it("bewahrt Entwurfsworte einschließlich Leerzeichen und Zeilenumbrüchen im Backup", () => {
    const data = initialData(),
      draft = journalDraft();
    draft.values.text = "  Ein offener Satz …\nmit einer neuen Zeile.  ";
    saveDraft(data, draft, null);
    expect(parseBackup(JSON.stringify(data)).drafts).toEqual(data.drafts);
  });
});
describe("Entwürfe und persönliche Vorhaben", () => {
  it("ersetzt einen inzwischen veränderten oder neu angelegten Entwurf nicht", () => {
    const data = initialData(),
      first = journalDraft();
    saveDraft(data, first, null);
    const saved = data.drafts[0]!;
    const next = {
      ...saved,
      values: { ...first.values, text: "Neue Worte." },
    } as DraftOf<"journal">;
    saveDraft(data, next, saved);
    const before = JSON.stringify(data);
    expect(() => saveDraft(data, next, saved)).toThrow();
    expect(JSON.stringify(data)).toBe(before);
    expect(() =>
      removeDraft(data, "journal", { id: "anderer-entwurf", revision: 2 }),
    ).toThrow();
  });
  it("legt einen Gedanken und das Entfernen seines Entwurfs in derselben Zustandsänderung ab", () => {
    const data = initialData(),
      draft = journalDraft();
    draft.values.text = "Ein Gedanke, der bleiben darf.";
    saveDraft(data, draft, null);
    commitDraft(data, "journal", data.drafts[0]!, at);
    expect(data.notes).toHaveLength(1);
    expect(data.notes[0]?.text).toBe(draft.values.text);
    expect(data.drafts).toEqual([]);
    expect(() =>
      commitDraft(data, "journal", { id: draft.id, revision: 1 }, at),
    ).toThrow();
  });
  it("überschreibt eine inzwischen bearbeitete oder gelöschte Quellnotiz nicht", () => {
    const data = initialData();
    data.notes.push({
      id: "n",
      text: "Original",
      kind: "note",
      createdAt: at,
      updatedAt: at,
    });
    const draft = journalDraft(data.notes[0]);
    draft.values.text = "Mein Entwurf";
    saveDraft(data, draft, null);
    data.notes[0]!.updatedAt = "2026-11-06T05:00:00.000Z";
    expect(() => commitDraft(data, "journal", data.drafts[0]!, at)).toThrow();
    expect(data.notes[0]?.text).toBe("Original");
    expect(data.drafts).toHaveLength(1);
    data.notes = [];
    expect(() => commitDraft(data, "journal", data.drafts[0]!, at)).toThrow();
    expect(data.notes).toEqual([]);
  });
  it("bestätigt Alltagsschritte idempotent, ohne einen geistlichen Rang zu vergeben", () => {
    const data = makeGoal(),
      g = data.goals[0]!,
      step = g.steps[0]!;
    setStepDone(data, g.id, step.id, true, at);
    const revision = g.revision;
    setStepDone(data, g.id, step.id, true, at);
    expect(g.revision).toBe(revision);
    grow(data);
    expect(data.growthStage).toBe(0);
    setStepDone(data, g.id, step.id, false, at);
    expect(step.completedAt).toBeNull();
    expect(dataSchema.safeParse(data).success).toBe(true);
  });
  it("bewahrt den Quellstand eines Rückblicks nach späteren Änderungen und Archivierung", () => {
    const data = makeGoal(),
      g = data.goals[0]!,
      snapshot = goalSnapshot(g);
    const draft: DraftOf<"review"> = {
      id: "review-1",
      key: "review:goal-1",
      revision: 0,
      type: "review",
      updatedAt: at,
      values: {
        goalId: g.id,
        baseRevision: g.revision,
        text: "Ich habe heute zugehört.",
        applied: true,
        source: snapshot,
      },
    };
    saveDraft(data, draft, null);
    commitDraft(data, draft.key, data.drafts[0]!, at);
    g.title = "Ein neuer Titel";
    g.steps[0]!.text = "Ein anderer Schritt";
    archiveGoal(data, g.id, true, at);
    expect(g.reviews[0]?.source.title).toBe("In Ruhe zuhören");
    expect(g.reviews[0]?.source.steps[0]?.text).toBe(
      "Vor meiner Antwort drei Sekunden warten.",
    );
    archiveGoal(data, g.id, false, at);
    expect(g.reviews).toHaveLength(1);
    expect(g.steps).toHaveLength(1);
  });
  it("bewahrt einen veralteten Vorhaben-Entwurf statt fremde Änderungen zu ersetzen", () => {
    const data = makeGoal(),
      g = data.goals[0]!;
    const draft: DraftOf<"step"> = {
      id: "step-draft",
      key: "step:goal-1",
      revision: 0,
      type: "step",
      updatedAt: at,
      values: {
        goalId: g.id,
        stepId: "s2",
        editing: false,
        baseRevision: g.revision,
        text: "Meine neuen Worte",
      },
    };
    saveDraft(data, draft, null);
    g.revision++;
    expect(() => commitDraft(data, draft.key, data.drafts[0]!, at)).toThrow();
    expect(data.drafts[0]?.values).toEqual(draft.values);
    expect(g.steps).toHaveLength(1);
  });
});
