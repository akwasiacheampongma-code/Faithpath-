import { beforeEach, describe, it, expect, vi } from "vitest";
const storage = vi.hoisted(() => ({
  readData: vi.fn(),
  writeData: vi.fn(),
  readRecovery: vi.fn(),
}));
vi.mock("../src/services/storage", () => storage);
import { useApp } from "../src/state/store";
import { initialData, type AppData } from "../src/state/model";
import {
  reviewEditDraft,
  reviewHash,
  journalDraft,
} from "../src/features/personal/model";
import { prepareImport } from "../src/features/imports/model";
import { faithpathFixture } from "./fixtures/faithpath-v5";
import { useVolatileDrafts } from "../src/features/personal/volatile-drafts";

const at = "2026-11-06T09:00:00.000Z";
function seeded(): AppData {
  const data = initialData();
  data.goals = [
    {
      id: "g1",
      title: "Zuhören",
      why: "Heute",
      createdAt: at,
      updatedAt: at,
      revision: 2,
      archivedAt: null,
      steps: [],
      reviews: [
        {
          id: "r1",
          text: "Meine eindeutigen damaligen Worte.",
          createdAt: at,
          applied: true,
          source: {
            title: "Historischer Titel",
            why: "Damals",
            steps: [{ id: "s1", text: "Alter Schritt", done: false }],
          },
        },
      ],
    },
    {
      id: "g2",
      title: "Ein anderes Vorhaben",
      why: "",
      createdAt: at,
      updatedAt: at,
      revision: 1,
      archivedAt: null,
      steps: [],
      reviews: [],
    },
  ];
  return data;
}
beforeEach(async () => {
  vi.resetAllMocks();
  useVolatileDrafts.setState({ items: {}, settled: {} });
  storage.writeData.mockResolvedValue(undefined);
  storage.readData.mockResolvedValue(seeded());
  useApp.setState({ busy: false });
  await useApp.getState().hydrate();
});
async function remove() {
  const goal = useApp.getState().data.goals[0]!;
  return useApp
    .getState()
    .deleteGoalReview(
      goal.id,
      "r1",
      goal.revision,
      reviewHash(goal.reviews[0]!),
    );
}

describe("Atomare Rückblickaktionen und sitzungsgebundenes Undo", () => {
  it("lässt Hydrierung keine laufende Löschung oder ihren Undo-Token überholen", async () => {
    let release!: () => void;
    storage.writeData.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const deletion = remove();
    const reads = storage.readData.mock.calls.length;
    await useApp.getState().hydrate();
    expect(storage.readData).toHaveBeenCalledTimes(reads);
    release();
    const token = await deletion;
    expect(token).toBeTruthy();
    expect(await useApp.getState().undoGoalReview(token!)).toBe(true);
  });
  it("ordnet Hydrierung nach wartendem Autosave ein und blockiert Aktionen während des Lesens", async () => {
    let releaseWrite!: () => void, releaseRead!: (data: AppData) => void;
    storage.writeData.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          releaseWrite = resolve;
        }),
    );
    const draft = journalDraft();
    draft.values.text = "Meine wartenden Worte.";
    const saving = useApp.getState().saveEditorDraft(draft, null);
    storage.readData.mockImplementationOnce(
      () =>
        new Promise<AppData>((resolve) => {
          releaseRead = resolve;
        }),
    );
    const hydrating = useApp.getState().hydrate();
    expect(
      await useApp.getState().mutate((d) => {
        d.name = "Darf nicht überholen";
      }),
    ).toBe(false);
    releaseWrite();
    await saving;
    await vi.waitFor(() => expect(releaseRead).toBeTypeOf("function"));
    const saved = structuredClone(useApp.getState().data);
    releaseRead(saved);
    await hydrating;
    expect(useApp.getState().data.drafts[0]!.values).toMatchObject({
      text: draft.values.text,
    });
    expect(useApp.getState().data.name).toBe("");
    expect(useApp.getState().busy).toBe(false);
  });
  it("lässt Autosave, Verwerfen und Textbearbeitung ohne Wachstum; eine neue Reflexion bleibt eine explizite Aktion", async () => {
    useApp.getState().data.readChapters = ["MRK:4"];
    const draft = journalDraft();
    draft.values.kind = "reflection";
    draft.values.text = "Noch ein Entwurf.";
    const saved = await useApp.getState().saveEditorDraft(draft, null);
    expect(useApp.getState().data.growthStage).toBe(0);
    expect(
      await useApp.getState().finishEditorDraft(saved!.key, saved!, true),
    ).not.toBeNull();
    expect(useApp.getState().data.growthStage).toBe(0);
    const goal = useApp.getState().data.goals[0]!,
      before = structuredClone(goal.reviews[0]!);
    const edit = reviewEditDraft(goal, "r1");
    edit.values.text = "Meine korrigierten Worte.";
    const stored = await useApp.getState().saveEditorDraft(edit, null);
    expect(
      await useApp.getState().finishEditorDraft(stored!.key, stored!),
    ).toEqual({ result: "g1" });
    const after = useApp.getState().data.goals[0]!.reviews[0]!;
    expect(after).toMatchObject({
      id: before.id,
      createdAt: before.createdAt,
      applied: before.applied,
      source: before.source,
      text: edit.values.text,
    });
    expect(useApp.getState().data.growthStage).toBe(0);
    const fresh = journalDraft();
    fresh.values.kind = "reflection";
    fresh.values.text = "Jetzt bewusst festgehalten.";
    const final = await useApp.getState().saveEditorDraft(fresh, null);
    await useApp.getState().finishEditorDraft(final!.key, final!);
    expect(useApp.getState().data.growthStage).toBe(1);
  });
  it("bewahrt Editworte und Original bei einem endgültigen Schreibfehler", async () => {
    const draft = reviewEditDraft(useApp.getState().data.goals[0]!, "r1");
    draft.values.text = "Ungesicherte Korrektur.";
    const saved = await useApp.getState().saveEditorDraft(draft, null),
      before = useApp.getState().data;
    storage.writeData.mockRejectedValueOnce(new Error("Speicher voll"));
    expect(
      await useApp.getState().finishEditorDraft(saved!.key, saved!),
    ).toBeNull();
    expect(useApp.getState().data).toBe(before);
    expect(useApp.getState().data.drafts[0]!.values).toEqual(draft.values);
    expect(useApp.getState().error).toBe("Speicher voll");
  });
  it("bestätigt Delete und Undo erst nach erfolgreichem Schreiben und verbraucht das Undo einmal", async () => {
    const before = useApp.getState().data,
      original = structuredClone(before.goals[0]!.reviews[0]!);
    storage.writeData.mockRejectedValueOnce(new Error("Schreibfehler"));
    expect(await remove()).toBeNull();
    expect(useApp.getState().data).toBe(before);
    const token = await remove();
    expect(token).toBeTruthy();
    const deleted = useApp.getState().data;
    expect(JSON.stringify(deleted)).not.toContain(original.text);
    expect(deleted.retainedReviewGrowth).toEqual({
      reflections: 1,
      actions: 1,
    });
    expect(deleted.growthStage).toBe(0);
    storage.writeData.mockRejectedValueOnce(new Error("Noch voll"));
    expect(await useApp.getState().undoGoalReview(token!)).toBe(false);
    expect(useApp.getState().data).toBe(deleted);
    expect(await useApp.getState().undoGoalReview(token!)).toBe(true);
    expect(useApp.getState().data.goals[0]!.reviews).toEqual([original]);
    expect(useApp.getState().data.retainedReviewGrowth).toEqual({
      reflections: 0,
      actions: 0,
    });
    expect(useApp.getState().data.growthStage).toBe(0);
    expect(await useApp.getState().undoGoalReview(token!)).toBe(false);
  });
  it("holt nur den entfernten Rückblick zurück und erhält inzwischen geänderte andere Bereiche", async () => {
    const original = structuredClone(
        useApp.getState().data.goals[0]!.reviews[0]!,
      ),
      token = await remove();
    await useApp.getState().mutate((d) => {
      d.name = "Später";
      d.goals[1]!.title = "Später verändert";
      d.goals[1]!.revision++;
      d.bookmarks.push("MRK:4:35");
    });
    expect(await useApp.getState().undoGoalReview(token!)).toBe(true);
    const after = useApp.getState().data;
    expect(after.name).toBe("Später");
    expect(after.goals[1]!.title).toBe("Später verändert");
    expect(after.bookmarks).toEqual(["MRK:4:35"]);
    expect(after.goals[0]!.reviews).toEqual([original]);
  });
  it("überschreibt kein inzwischen geändertes Ziel und vergisst ausdrücklich geschlossene Undo-Angebote", async () => {
    const token = await remove();
    await useApp.getState().mutate((d) => {
      d.goals[0]!.title = "Neu";
      d.goals[0]!.revision++;
    });
    const before = useApp.getState().data;
    expect(await useApp.getState().undoGoalReview(token!)).toBe(false);
    expect(useApp.getState().data).toBe(before);
    useApp.getState().forgetReviewUndo(token!);
    expect(await useApp.getState().undoGoalReview(token!)).toBe(false);
  });
  it.each(["restore", "refresh", "hydrate", "import", "rollback"])(
    "entwertet Undo bei %s auch dann, wenn das Ziel selbst gleich geblieben ist",
    async (transition) => {
      const token = await remove(),
        deleted = structuredClone(useApp.getState().data),
        store = useApp.getState();
      storage.readData.mockResolvedValue(deleted);
      if (transition === "restore")
        expect(await store.restore(deleted)).toBe(true);
      else if (transition === "refresh")
        expect(await store.refresh()).not.toBeNull();
      else if (transition === "hydrate") await store.hydrate();
      else if (transition === "import")
        expect(
          await store.importFaithpath(
            prepareImport(JSON.stringify(faithpathFixture()), deleted),
          ),
        ).toBe(true);
      else {
        storage.readRecovery.mockResolvedValue({
          token: "recovery",
          data: deleted,
          createdAt: at,
        });
        expect(await store.rollbackImport("recovery", deleted.revision)).toBe(
          true,
        );
      }
      const current = useApp.getState().data;
      expect(current.goals.find((g) => g.id === "g1")!.revision).toBe(
        deleted.goals[0]!.revision,
      );
      expect(await store.undoGoalReview(token!)).toBe(false);
      expect(useApp.getState().data).toBe(current);
    },
  );
});
