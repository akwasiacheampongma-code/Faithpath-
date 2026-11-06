import { create } from "zustand";
import { readData, writeData, readRecovery } from "../services/storage";
import {
  dataSchema,
  grow,
  initialData,
  assertStorageBudget,
  type AppData,
} from "./model";
import {
  applyImport,
  prepareImport,
  type ImportPlan,
} from "../features/imports/model";
import type { WriteOptions } from "../features/imports/schema";
import { saveDraft as updateDraft } from "../features/personal/model";
import type { Draft, DraftStamp } from "../features/personal/schema";

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
  restore: (d: AppData) => Promise<boolean>;
  clearError: () => void;
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
  const persist = (
    fn: (d: AppData) => void,
    options: WriteOptions = {},
    updateGrowth = true,
  ) =>
    enqueue(async () => {
      if (!get().ready || !get().healthy) return false;
      try {
        const current = get().data,
          next = JSON.parse(JSON.stringify(current)) as AppData;
        fn(next);
        if (updateGrowth) grow(next);
        next.revision = current.revision + 1;
        dataSchema.parse(next);
        assertStorageBudget(next);
        await writeData(next, current.revision, options);
        set({ data: next, error: null });
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
      try {
        set({
          data: await readData(),
          ready: true,
          healthy: true,
          error: null,
        });
      } catch (error) {
        set({ error: message(error), healthy: false, ready: true });
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
      const ok = await persist((d) => {
        updateDraft(d, draft, expected);
        saved = d.drafts.find((x) => x.key === draft.key)!;
      });
      return ok ? saved : null;
    },
    restore: async (incoming) =>
      get().mutate((d) => {
        const revision = d.revision;
        Object.assign(d, dataSchema.parse(incoming), { revision });
      }),
    clearError: () => set({ error: null }),
    waitForWrites: async () => {
      while (tail) await tail;
      return get().data;
    },
    refresh: async () => {
      if (get().busy) return null;
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
