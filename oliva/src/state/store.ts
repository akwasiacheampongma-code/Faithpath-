import { create } from "zustand";
import { readData, writeData, readRecovery } from "../services/storage";
import {
  dataSchema,
  grow,
  initialData,
  assertStorageBudget,
  cloneData,
  type AppData,
} from "./model";
import {
  applyImport,
  prepareImport,
  type ImportPlan,
} from "../features/imports/model";
import type { WriteOptions } from "../features/imports/schema";
import {
  saveDraft as updateDraft,
  commitDraft,
  removeDraft,
  deleteReview,
  undoReviewDeletion,
  type ReviewDeletion,
} from "../features/personal/model";
import {
  newId,
  type Draft,
  type DraftStamp,
} from "../features/personal/schema";
import {
  readingPositionSchema,
  sameReadingScope,
  samePosition,
  type ReadingPosition,
} from "../features/bible/position";
import type { Reference } from "../features/bible/repository";
import {
  useVolatileDrafts,
  acknowledgeDrafts,
} from "../features/personal/volatile-drafts";

export type Store = {
  data: AppData;
  ready: boolean;
  healthy: boolean;
  busy: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  mutate: (fn: (d: AppData) => void) => Promise<boolean>;
  saveEditorDraft: (
    draft: Draft,
    expected: DraftStamp | null,
  ) => Promise<Draft | null>;
  finishEditorDraft: (
    key: string,
    expected: DraftStamp,
    discard?: boolean,
    completeGuided?: boolean,
  ) => Promise<{ result: string } | null>;
  deleteGoalReview: (
    goalId: string,
    reviewId: string,
    expectedGoalRevision: number,
    expectedReviewHash: string,
  ) => Promise<string | null>;
  undoGoalReview: (token: string) => Promise<boolean>;
  forgetReviewUndo: (token: string) => void;
  restore: (d: AppData) => Promise<boolean>;
  clearError: () => void;
  openReading: (reference: Reference) => Promise<boolean>;
  rememberReadingPosition: (
    position: ReadingPosition | null,
    reference: Reference,
  ) => Promise<boolean>;
  waitForWrites: () => Promise<AppData>;
  refresh: () => Promise<AppData | null>;
  importFaithpath: (plan: ImportPlan) => Promise<boolean>;
  rollbackImport: (token: string, expectedRevision: number) => Promise<boolean>;
};
// Background draft writes and explicit actions share one ordered transaction queue.
// The visible action lock still rejects a second tap on the same pending action.
let tail: Promise<void> | null = null;
function enqueue<T>(work: () => Promise<T>): Promise<T> {
  const result = tail ? tail.then(work) : work();
  const settled = result.then(
    () => undefined,
    () => undefined,
  );
  tail = settled;
  void settled.then(() => {
    if (tail === settled) tail = null;
  });
  return result;
}
export const useApp = create<Store>((set, get) => {
  // Deleted text exists only here for one explicit, navigation-scoped undo.
  // Neither the payload nor the token is written to storage or backups.
  let epoch = 0;
  let reviewUndo: {
    token: string;
    epoch: number;
    payload: ReviewDeletion;
  } | null = null;
  function invalidateUndo() {
    epoch++;
    reviewUndo = null;
  }
  async function action<T>(blocked: T, work: () => Promise<T>): Promise<T> {
    if (get().busy || !get().ready || !get().healthy) return blocked;
    set({ busy: true, error: null });
    try {
      return await work();
    } catch (error) {
      set({ error: message(error) });
      return blocked;
    } finally {
      set({ busy: false });
    }
  }
  const persist = (
    fn: (d: AppData) => void,
    options: WriteOptions = {},
    updateGrowth = true,
    guard: (data: AppData) => boolean = () => true,
  ) =>
    enqueue(async () => {
      if (!get().ready || !get().healthy) return false;
      if (!guard(get().data)) return false;
      try {
        const current = get().data,
          next = cloneData(current);
        fn(next);
        if (updateGrowth) grow(next);
        next.revision = current.revision + 1;
        dataSchema.parse(next);
        assertStorageBudget(next);
        await writeData(next, current.revision, options);
        set({ data: next, error: null });
        acknowledgeDrafts(next.drafts);
        return true;
      } catch (error) {
        set({ error: message(error) });
        return false;
      }
    });
  return {
    data: initialData(),
    ready: false,
    healthy: false,
    busy: false,
    error: null,
    hydrate: async () => {
      if (get().busy) return;
      invalidateUndo();
      set({ busy: true });
      try {
        await enqueue(async () => {
          const data = await readData();
          set({ data, ready: true, healthy: true, error: null });
        });
      } catch (error) {
        set({ error: message(error), healthy: false, ready: true });
      } finally {
        set({ busy: false });
      }
    },
    mutate: async (fn) => {
      if (get().busy || !get().ready || !get().healthy) return false;
      set({ busy: true, error: null });
      try {
        return await persist(fn);
      } finally {
        set({ busy: false });
      }
    },
    saveEditorDraft: async (draft, expected) => {
      let saved: Draft | null = null;
      const ok = await persist(
        (d) => {
          updateDraft(d, draft, expected);
          saved = d.drafts.find((x) => x.key === draft.key)!;
        },
        {},
        false,
      );
      return ok ? saved : null;
    },
    finishEditorDraft: (
      key,
      expected,
      discard = false,
      completeGuided = true,
    ) =>
      action<{ result: string } | null>(null, async () => {
        let result = "";
        const ok = await persist(
          (d) => {
            const draft = d.drafts.find((x) => x.key === key);
            if (discard) removeDraft(d, key, expected);
            else {
              result = commitDraft(d, key, expected, new Date().toISOString(), {
                completeGuided,
              });
              // Only a genuinely new reflection/experience or guided completion
              // may update growth. Autosave, edits and discard are metadata.
              if (
                draft &&
                (draft.type === "review" ||
                  (draft.type === "journal" &&
                    !draft.values.targetId &&
                    draft.values.kind !== "note") ||
                  (draft.type === "capture" &&
                    draft.values.source.type !== "verse"))
              )
                grow(d);
            }
          },
          {},
          false,
        );
        return ok ? { result } : null;
      }),
    deleteGoalReview: (goalId, reviewId, revision, hash) =>
      action<string | null>(null, async () => {
        let payload: ReviewDeletion | null = null;
        const atEpoch = epoch;
        const ok = await persist(
          (d) => {
            payload = deleteReview(
              d,
              goalId,
              reviewId,
              revision,
              hash,
              new Date().toISOString(),
            );
          },
          {},
          false,
        );
        if (!ok || !payload || atEpoch !== epoch) return null;
        const token = newId("review-undo");
        reviewUndo = { token, epoch, payload };
        return token;
      }),
    undoGoalReview: (token) =>
      action(false, async () => {
        const ok = await persist(
          (d) => {
            if (
              !reviewUndo ||
              reviewUndo.token !== token ||
              reviewUndo.epoch !== epoch
            )
              throw new Error(
                "Dieses Rückgängigmachen ist nicht mehr verfügbar. Es wurde nichts überschrieben.",
              );
            undoReviewDeletion(d, reviewUndo.payload, new Date().toISOString());
          },
          {},
          false,
        );
        if (ok && reviewUndo?.token === token) reviewUndo = null;
        return ok;
      }),
    forgetReviewUndo: (token) => {
      if (reviewUndo?.token === token) reviewUndo = null;
    },
    restore: (incoming) =>
      action(false, async () => {
        invalidateUndo();
        return persist(
          (d) => {
            const revision = d.revision;
            Object.assign(d, dataSchema.parse(incoming), { revision });
          },
          {},
          false,
        );
      }),
    clearError: () => set({ error: null }),
    openReading: (reference) =>
      persist(
        (d) => {
          d.reading = { ...reference };
          d.readingPosition = null;
        },
        {},
        false,
        (d) => d.revision === 0 || !sameReadingScope(d.reading, reference),
      ),
    rememberReadingPosition: (position, reference) =>
      persist(
        (d) => {
          d.readingPosition = position
            ? readingPositionSchema.parse(position)
            : null;
        },
        {},
        false,
        (d) =>
          sameReadingScope(d.reading, reference) &&
          !samePosition(d.readingPosition, position),
      ),
    waitForWrites: async () => {
      while (tail) await tail;
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
      while (tail) await tail;
      if (!get().ready || !get().healthy)
        throw new Error(
          "Die lokalen Daten konnten nicht sicher gelesen werden. Verwende die Reparatursicherung.",
        );
      if (Object.keys(useVolatileDrafts.getState().items).length)
        throw new Error(
          "Einige Entwürfe sind noch nicht dauerhaft gesichert. Bewahre sie zuerst unter Sammlung → Entwürfe.",
        );
      return get().data;
    },
    refresh: async () => {
      if (get().busy) return null;
      invalidateUndo();
      set({ busy: true });
      try {
        return await enqueue(async () => {
          const data = await readData();
          set({ data, ready: true, healthy: true, error: null });
          return data;
        });
      } catch (error) {
        set({ error: message(error), healthy: false });
        return null;
      } finally {
        set({ busy: false });
      }
    },
    importFaithpath: async (plan) => {
      if (get().busy || !get().ready || !get().healthy) return false;
      invalidateUndo();
      set({ busy: true, error: null });
      try {
        return await persist(
          (d) => {
            if (d.revision !== plan.baseRevision)
              throw new Error(
                "Der lokale Stand hat sich seit der Vorschau verändert. Bitte prüfe die Datei erneut.",
              );
            const checked = prepareImport(
              plan.receipt.sourceText,
              d,
              plan.receipt.importedAt,
            );
            applyImport(d, checked);
          },
          {
            createRecovery: {
              token: plan.receipt.id + ":" + plan.baseRevision,
              createdAt: new Date().toISOString(),
            },
          },
          false,
        );
      } finally {
        set({ busy: false });
      }
    },
    rollbackImport: async (token, expectedRevision) => {
      if (get().busy || !get().ready || !get().healthy) return false;
      invalidateUndo();
      set({ busy: true, error: null });
      try {
        const copy = await readRecovery();
        if (!copy || copy.token !== token)
          throw new Error(
            "Die Rückkehrsicherung wurde verändert. Bitte prüfe sie erneut.",
          );
        return await persist(
          (d) => {
            if (d.revision !== expectedRevision)
              throw new Error(
                "Der lokale Stand hat sich verändert. Bitte prüfe die Rückkehr erneut.",
              );
            const revision = d.revision;
            Object.assign(d, copy.data, { revision });
          },
          { consumeRecoveryToken: token },
          false,
        );
      } catch (error) {
        set({ error: message(error) });
        return false;
      } finally {
        set({ busy: false });
      }
    },
  };
});
function message(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Das hat leider nicht funktioniert. Bitte versuche es erneut.";
}
