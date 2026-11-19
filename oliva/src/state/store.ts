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
  draftSchema,
  type Draft,
  type DraftStamp,
} from "../features/personal/schema";
import {
  readingPositionSchema,
  sameReadingScope,
  samePosition,
  type ReadingPosition,
} from "../features/bible/position-current";
import { getPassage, type Reference } from "../features/bible/repository";
import { referenceSchema } from "../features/bible/schema";
import { selectedBibleVerses } from "../features/bible/selection";
import {
  highlightColor,
  type HighlightColor,
} from "../features/bible/highlights";
import {
  useVolatileDrafts,
  acknowledgeDrafts,
} from "../features/personal/volatile-drafts";
import {
  changeInvitationControl,
  type Invitation,
} from "../features/invitations/model";
import {
  saveNtAnswer,
  finishNtChapter,
  rememberNtPosition,
  chapterSetHash,
  extractLegacyNtCompletions,
  appendLegacyNtCompletions,
} from "../features/quiz/model";
import {
  ntPositionSchema,
  type NtPosition,
} from "../features/quiz/state-schema";
import { parseFaithpath } from "../features/imports/source";
import { storyById } from "../features/stories/index";
import { saveStoryAnswer, rememberStoryPosition, viewStoryQuestion } from "../features/stories/model";
import { storyPositionSchema, type StoryPosition } from "../features/stories/state-schema";
import { applyNotebookEdit, applyNotebookAction, pendingNoteSchema, type NoteAction, type PendingNote, type NotebookNote } from "../features/notebook/model";
import { hasPendingNotes } from "../features/notebook/pending";
import { LocalRevisionConflict } from "../services/storage-conflict";

// A stamp may be supplied as a complete saved draft. Extract its two contract
// fields and validate a detached snapshot before an earlier queued write yields.
const draftStampSchema = draftSchema.options[0]
  .pick({ id: true, revision: true })
  .strict();
function snapshotDraftStamp(expected: DraftStamp) {
  return draftStampSchema.parse({
    id: expected?.id,
    revision: expected?.revision,
  });
}

export type Store = {
  data: AppData;
  ready: boolean;
  healthy: boolean;
  freshProfile: boolean;
  busy: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  finishIntro: () => Promise<boolean>;
  suspend: () => Promise<void>;
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
  restore: (d: AppData, expectedRevision?: number) => Promise<boolean>;
  writeNotebookEdit: (input: PendingNote) => Promise<{ note: NotebookNote | null; copied: boolean } | null>;
  changeNotebookNote: (id: string, stamp: string, action: NoteAction) => Promise<boolean>;
  clearError: () => void;
  setInvitationsEnabled: (
    enabled: boolean,
    expected: boolean,
  ) => Promise<boolean>;
  chooseInvitation: (
    invitation: Pick<Invitation, "key" | "stamp">,
    action: "snooze" | "dismiss" | "resume",
  ) => Promise<boolean>;
  openReading: (reference: Reference) => Promise<boolean>;
  rememberReadingPosition: (
    position: ReadingPosition | null,
    reference: Reference,
  ) => Promise<boolean>;
  saveNtResponse: (
    questionId: string,
    displayedHash: string,
    choice: number,
    expectedStamp: string | null,
  ) => Promise<boolean>;
  saveStoryResponse: (unitId: string, questionId: string, displayedHash: string, choice: number, expectedStamp: string | null) => Promise<boolean>;
  rememberStoryStep: (position: StoryPosition, viewedIndex?: number) => Promise<boolean>;
  completeNtStudy: (
    book: string,
    chapter: number,
    displayedSetHash: string,
    expectedStamp: string | null,
  ) => Promise<boolean>;
  rememberNtStudyPosition: (position: NtPosition) => Promise<boolean>;
  setPassageHighlight: (
    reference: Reference,
    color: HighlightColor | null,
  ) => Promise<boolean>;
  setPassageBookmarked: (
    reference: Reference,
    bookmarked: boolean,
  ) => Promise<boolean>;
  setSelectionHighlight: (
    reference: Reference,
    selected: readonly number[],
    color: HighlightColor | null,
  ) => Promise<boolean>;
  setSelectionBookmarked: (
    reference: Reference,
    selected: readonly number[],
    bookmarked: boolean,
  ) => Promise<boolean>;
  activateArchivedNtProgress: (
    importId: string,
    sourceHash: string,
    expectedRevision: number,
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
    fn: (d: AppData) => void | boolean,
    options: WriteOptions = {},
    updateGrowth = true,
    guard: (data: AppData) => boolean = () => true,
    retryConflicts = false,
  ) =>
    enqueue(async () => {
      if (!get().ready || !get().healthy) return false;
      if (!guard(get().data)) return false;
      try {
        let current = get().data;
        for (let attempt = 0; ; attempt++) {
          const next = cloneData(current);
          if (fn(next) === false) return true;
          if (updateGrowth) grow(next);
          next.revision = current.revision + 1;
          dataSchema.parse(next);
          assertStorageBudget(next);
          try {
            await writeData(next, current.revision, options);
          } catch (error) {
            if (!retryConflicts || attempt >= 2 || !(error instanceof LocalRevisionConflict)) throw error;
            current = await readData();
            // Queued writes observe the very latest model even when this edit is rejected.
            set({ data: current });
            continue;
          }
          set({ data: next, error: null });
          acknowledgeDrafts(next.drafts);
          return true;
        }
      } catch (error) {
        set({ error: message(error) });
        return false;
      }
    });
  return {
    data: initialData(),
    ready: false,
    healthy: false,
    freshProfile: false,
    busy: false,
    error: null,
    suspend: () => {
      invalidateUndo();
      return enqueue(async () => {
        set({ data: initialData(), ready: false, healthy: false, freshProfile: false, error: null });
      });
    },
    hydrate: async () => {
      if (get().busy) return;
      invalidateUndo();
      set({ busy: true });
      try {
        await enqueue(async () => {
          let freshProfile = false;
          const data = await readData((exists) => { freshProfile = !exists; });
          set({ data, ready: true, healthy: true, freshProfile, error: null });
        });
      } catch (error) {
        set({ error: message(error), healthy: false, freshProfile: false, ready: true });
      } finally {
        set({ busy: false });
      }
    },
    finishIntro: () => action(false, async () => {
      if (!get().freshProfile) return true;
      const saved = await persist((data) => {
        if (data.onboarded || data.revision !== 0) return false;
        data.onboarded = true;
      }, {}, false, undefined, true);
      if (saved) set({ freshProfile: false });
      return saved;
    }),
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
      try {
        const requested = draftSchema.parse(draft);
        const expectedStamp =
          expected === null ? null : snapshotDraftStamp(expected);
        let saved: Draft | null = null;
        const ok = await persist(
          (d) => {
            updateDraft(d, requested, expectedStamp);
            saved = d.drafts.find((x) => x.key === requested.key)!;
          },
          {},
          false,
        );
        return ok ? saved : null;
      } catch (error) {
        set({ error: message(error) });
        return null;
      }
    },
    finishEditorDraft: (
      key,
      expected,
      discard = false,
      completeGuided = true,
    ) =>
      action<{ result: string } | null>(null, async () => {
        const expectedStamp = snapshotDraftStamp(expected);
        let result = "";
        const ok = await persist(
          (d) => {
            const draft = d.drafts.find((x) => x.key === key);
            if (discard) removeDraft(d, key, expectedStamp);
            else {
              result = commitDraft(
                d,
                key,
                expectedStamp,
                new Date().toISOString(),
                {
                  completeGuided,
                },
              );
              // Only a genuinely new reflection/experience or guided completion
              // may update growth. Autosave, edits and discard are metadata.
              if (
                draft &&
                (draft.type === "review" ||
                  (draft.type === "journal" &&
                    !draft.values.targetId &&
                    draft.values.kind !== "note") ||
                  (draft.type === "capture" &&
                    draft.values.source.type !== "verse" &&
                    draft.values.source.type !== "passage"))
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
    restore: (incoming, expectedRevision) =>
      action(false, async () => {
        invalidateUndo();
        return persist(
          (d) => {
            const revision = d.revision;
            if (expectedRevision !== undefined && revision !== expectedRevision)
              throw new Error("Der lokale Stand hat sich verändert. Prüfe die Sicherung bitte erneut.");
            if (hasPendingNotes()) throw new Error("Sichere zuerst deine offenen Notizen.");
            if (incoming.version === 11) delete d.notebook;
            Object.assign(d, dataSchema.parse(incoming), { revision });
          },
          {},
          false,
        );
      }),
    writeNotebookEdit: async (input) => {
      const edit = pendingNoteSchema.parse(input);
      let saved: ReturnType<typeof applyNotebookEdit> | null = null;
      const success = await persist((data) => {
        saved = applyNotebookEdit(data, edit);
        return saved.changed;
      }, {}, false, undefined, true);
      return success ? saved : null;
    },
    changeNotebookNote: (id, stamp, action) =>
      persist((data) => applyNotebookAction(data, id, stamp, action, new Date().toISOString()), {}, false, undefined, true),
    clearError: () => set({ error: null }),
    setInvitationsEnabled: (enabled, expected) =>
      action(false, async () => {
        if (get().data.invitations.enabled === enabled) return true;
        return persist(
          (d) => {
            if (d.invitations.enabled !== expected)
              throw new Error(
                "Deine Einstellung hat sich inzwischen verändert. Prüfe sie bitte erneut.",
              );
            d.invitations.enabled = enabled;
          },
          {},
          false,
        );
      }),
    chooseInvitation: (invitation, choice) =>
      action(false, () =>
        persist(
          (d) => {
            d.invitations = changeInvitationControl(
              d,
              d.invitations,
              invitation,
              choice,
            );
          },
          {},
          false,
        ),
      ),
    openReading: async (reference) => {
      try {
        const requested = referenceSchema.parse(reference);
        return await persist(
          (d) => {
            d.reading = requested;
            d.readingPosition = null;
          },
          {},
          false,
          (d) => d.revision === 0 || !sameReadingScope(d.reading, requested),
        );
      } catch (error) {
        set({ error: message(error) });
        return false;
      }
    },
    rememberReadingPosition: async (position, reference) => {
      try {
        const requestedReference = referenceSchema.parse(reference);
        const requestedPosition =
          position === null ? null : readingPositionSchema.parse(position);
        return await persist(
          (d) => {
            d.readingPosition = requestedPosition;
          },
          {},
          false,
          (d) =>
            sameReadingScope(d.reading, requestedReference) &&
            !samePosition(d.readingPosition, requestedPosition),
        );
      } catch (error) {
        set({ error: message(error) });
        return false;
      }
    },
    setPassageHighlight: (reference, color) =>
      action(false, () => {
        const requested = referenceSchema.parse(reference);
        const requestedColor =
          color === null ? null : highlightColor.parse(color);
        const keys = getPassage(requested).map(
          (verse) => `${requested.book}:${requested.chapter}:${verse.n}`,
        );
        return persist(
          (d) => {
            let changed = false;
            for (const key of keys) {
              if (requestedColor === null) {
                if (d.highlights[key] !== undefined) {
                  delete d.highlights[key];
                  changed = true;
                }
              } else if (d.highlights[key] !== requestedColor) {
                d.highlights[key] = requestedColor;
                changed = true;
              }
            }
            return changed;
          },
          {},
          false,
        );
      }),
    setPassageBookmarked: (reference, bookmarked) =>
      action(false, () => {
        const requested = referenceSchema.parse(reference);
        if (typeof bookmarked !== "boolean")
          throw new Error("Ungültige Merken-Auswahl.");
        const keys = getPassage(requested).map(
          (verse) => `${requested.book}:${requested.chapter}:${verse.n}`,
        );
        return persist(
          (d) => {
            const before = new Set(d.bookmarks),
              next = new Set(before);
            for (const key of keys) {
              if (bookmarked) next.add(key);
              else next.delete(key);
            }
            if (
              next.size === before.size &&
              [...next].every((key) => before.has(key))
            )
              return false;
            d.bookmarks = [...next];
            return true;
          },
          {},
          false,
        );
      }),
    setSelectionHighlight: (reference, selected, color) =>
      action(false, () => {
        const requested = referenceSchema.parse(reference);
        const requestedColor =
          color === null ? null : highlightColor.parse(color);
        const keys = selectedBibleVerses(requested, selected).map(
          (verse) => `${requested.book}:${requested.chapter}:${verse.n}`,
        );
        return persist(
          (d) => {
            let changed = false;
            for (const key of keys) {
              if (requestedColor === null) {
                if (d.highlights[key] !== undefined) {
                  delete d.highlights[key];
                  changed = true;
                }
              } else if (d.highlights[key] !== requestedColor) {
                d.highlights[key] = requestedColor;
                changed = true;
              }
            }
            return changed;
          },
          {},
          false,
        );
      }),
    setSelectionBookmarked: (reference, selected, bookmarked) =>
      action(false, () => {
        const requested = referenceSchema.parse(reference);
        if (typeof bookmarked !== "boolean")
          throw new Error("Ungültige Merken-Auswahl.");
        const keys = selectedBibleVerses(requested, selected).map(
          (verse) => `${requested.book}:${requested.chapter}:${verse.n}`,
        );
        return persist(
          (d) => {
            const before = new Set(d.bookmarks),
              next = new Set(before);
            for (const key of keys) {
              if (bookmarked) next.add(key);
              else next.delete(key);
            }
            if (
              next.size === before.size &&
              [...next].every((key) => before.has(key))
            )
              return false;
            d.bookmarks = [...next];
            return true;
          },
          {},
          false,
        );
      }),
    saveStoryResponse: (unitId, questionId, displayedHash, choice, expectedStamp) =>
      action(false, async () => {
        const { storyQuestion } = await import("../features/stories/catalog");
        const unit = storyById(unitId), question = storyQuestion(questionId);
        if (!unit || !question || question.unitId !== unitId || question.hash !== displayedHash)
          throw new Error("Die Originalfragenfassung ist nicht mehr aktuell. Deine bisherigen Antworten bleiben erhalten.");
        return persist((data) => saveStoryAnswer(data.storyStudy, unit, question, choice, expectedStamp, new Date().toISOString()), {}, false);
      }),
    rememberStoryStep: (position, viewedIndex) => {
      const requested = { ...position };
      return action(false, () => {
        const next = storyPositionSchema.parse(requested);
        const unit = storyById(next.unitId)!;
        if (next.setHash !== unit.questionSetHash)
          throw new Error("Dieser Fragensatz ist nicht mehr aktuell.");
        return persist((data) => {
          const viewed = viewedIndex === undefined ? false : viewStoryQuestion(data.storyStudy, unit, viewedIndex);
          return rememberStoryPosition(data.storyStudy, next) || viewed;
        }, {}, false);
      });
    },
    saveNtResponse: (questionId, displayedHash, choice, expectedStamp) =>
      action(false, async () => {
        // Load the large source bank only for a deliberate study action.
        const { ntQuestion } = await import("../features/quiz/catalog");
        const question = ntQuestion(questionId);
        if (!question || question.hash !== displayedHash)
          throw new Error(
            "Diese Fragenfassung ist nicht mehr aktuell. Öffne die Fragen erneut; dein bisheriger Stand bleibt erhalten.",
          );
        return persist(
          (d) =>
            saveNtAnswer(
              d.ntStudy,
              question,
              choice,
              expectedStamp,
              new Date().toISOString(),
            ),
          {},
          false,
        );
      }),
    completeNtStudy: (book, chapter, displayedSetHash, expectedStamp) =>
      action(false, async () => {
        const { ntChapter } = await import("../features/quiz/catalog");
        const source = ntChapter(book, chapter);
        if (!source || chapterSetHash(source) !== displayedSetHash)
          throw new Error(
            "Dieser Fragensatz ist nicht mehr aktuell. Öffne das Kapitel erneut; dein bisheriger Stand bleibt erhalten.",
          );
        return persist(
          (d) =>
            finishNtChapter(
              d.ntStudy,
              source,
              expectedStamp,
              new Date().toISOString(),
            ),
          {},
          false,
        );
      }),
    rememberNtStudyPosition: (position) =>
      action(false, () => {
        // Capture caller-owned input before an earlier queued write can yield.
        const requested = ntPositionSchema.parse(position);
        return persist(
          (d) =>
            rememberNtPosition(
              d.ntStudy,
              requested.book,
              requested.chapter,
              requested.index,
            ),
          {},
          false,
        );
      }),
    activateArchivedNtProgress: (importId, sourceHash, expectedRevision) =>
      action(false, () =>
        persist(
          (d) => {
            if (d.revision !== expectedRevision)
              throw new Error(
                "Dein Datenstand hat sich verändert. Prüfe die Archivvorschau bitte erneut.",
              );
            const receipt = d.imports.find(
              (item) => item.id === importId && item.sourceHash === sourceHash,
            );
            if (!receipt)
              throw new Error(
                "Dieses Originalarchiv ist nicht mehr vorhanden.",
              );
            const source = parseFaithpath(receipt.sourceText);
            if (
              source.sourceHash !== sourceHash ||
              source.fingerprint !== receipt.fingerprint
            )
              throw new Error(
                "Die archivierte Quelle stimmt nicht mit ihrem Beleg überein.",
              );
            const { completions } = extractLegacyNtCompletions(
              source.data.quiz,
              receipt.id,
              receipt.sourceHash,
            );
            return appendLegacyNtCompletions(d.ntStudy, completions);
          },
          {},
          false,
        ),
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
      if (hasPendingNotes())
        throw new Error("Einige Notizen warten noch auf das Speichern. Öffne sie zuerst unter Sammlung → Notizen.");
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
            const notebook = d.notebook;
            Object.assign(d, copy.data, { revision });
            // FaithPath recovery belongs to the source import. Notebook entries are
            // independent of that source and may have been written since the import.
            if (notebook) {
              d.version = 12;
              d.notebook = notebook;
            }
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
