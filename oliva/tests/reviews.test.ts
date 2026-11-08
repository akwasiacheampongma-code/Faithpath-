import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { initialData, grow } from "../src/state/model";
import { PATHS } from "../src/features/paths/catalog";
import {
  goalSchema,
  reviewSchema,
  draftSchema,
  type DraftOf,
  type Review,
} from "../src/features/personal/schema";
import {
  reviewSchema as frozenReviewSchema,
  draftSchema as frozenDraftSchema,
} from "../src/features/personal/schema-v5";
import {
  commitDraft,
  saveDraft,
  goalSnapshot,
  journalDraft,
  reviewHash,
  reviewEditDraft,
  deleteReview,
  undoReviewDeletion,
  type ReviewDeletion,
} from "../src/features/personal/model";

const originalAt = "2026-11-06T09:00:00.000Z",
  editAt = "2026-11-07T10:00:00.000Z",
  undoAt = "2026-11-07T11:00:00.000Z";
function fixture() {
  const data = initialData();
  data.retainedReviewGrowth = { reflections: 4, actions: 2 };
  data.goals.push(
    goalSchema.parse({
      id: "goal-one",
      title: "Heutiger Titel",
      why: "Mein heutiger Anlass.",
      createdAt: originalAt,
      updatedAt: originalAt,
      archivedAt: null,
      revision: 7,
      steps: [
        {
          id: "step-one",
          text: "Ein heutiger Schritt.",
          done: false,
          createdAt: originalAt,
          completedAt: null,
        },
      ],
      reviews: ["a", "b", "c"].map((id, index) => ({
        id: `review-${id}`,
        text: `Meine damaligen Worte ${id}.`,
        createdAt: originalAt,
        applied: index === 1,
        source: {
          title: `Damals ${id}`,
          why: "Mein damaliger Anlass.",
          ref: { book: "MRK", chapter: 4, from: 35, to: 41 },
          steps: [
            { id: "old-step", text: "Der ursprüngliche Schritt.", done: true },
          ],
        },
      })),
    }),
  );
  const journal = journalDraft();
  journal.values.text = "Ein unabhängiger Entwurf.";
  saveDraft(data, journal, null);
  return data;
}
function editing(data = fixture(), text = "Meine überarbeiteten Worte.") {
  const draft = reviewEditDraft(data.goals[0]!, "review-b");
  draft.values.text = text;
  saveDraft(data, draft, null);
  return {
    data,
    draft: data.drafts.find(
      (d) => d.id === draft.id,
    )! as DraftOf<"review-edit">,
  };
}
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));

describe("Eingefrorener V5-Vertrag für persönliche Rückblicke", () => {
  it("bewahrt das exakte Schema des 0.6-Quellcheckpoints und lehnt V6-Erweiterungen ab", () => {
    const bytes = readFileSync(
      new URL("../src/features/personal/schema-v5.ts", import.meta.url),
    );
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(
      "8d06b7927a97da24988f88ac72a42483169b390ed124f7f6b3043db9f252063e",
    );
    const data = fixture(),
      review = data.goals[0]!.reviews[1]!;
    expect(frozenReviewSchema.safeParse(review).success).toBe(true);
    expect(
      frozenReviewSchema.safeParse({ ...review, updatedAt: editAt }).success,
    ).toBe(false);
    expect(
      reviewSchema.safeParse({ ...review, updatedAt: editAt }).success,
    ).toBe(true);
    const draft = reviewEditDraft(data.goals[0]!, review.id);
    expect(frozenDraftSchema.safeParse(draft).success).toBe(false);
    expect(draftSchema.safeParse(draft).success).toBe(true);
  });
});
describe("Quellengebundene Textkorrektur", () => {
  it("hasht das vollständige Review kanonisch, unabhängig von Schlüsselreihenfolge", () => {
    const review = fixture().goals[0]!.reviews[1]!,
      reordered = Object.fromEntries(
        Object.entries(review).reverse(),
      ) as Review;
    expect(reviewHash(reordered)).toBe(reviewHash(review));
    expect(reviewHash({ ...review, updatedAt: undefined })).toBe(
      reviewHash(review),
    );
    for (const changed of [
      { ...review, id: "another" },
      { ...review, text: "Andere Worte." },
      { ...review, applied: false },
      { ...review, createdAt: editAt },
      { ...review, updatedAt: editAt },
      { ...review, source: { ...review.source, title: "Andere Quelle" } },
    ])
      expect(reviewHash(changed)).not.toBe(reviewHash(review));
  });
  it("ändert ausschließlich den Text und Bearbeitungsmetadaten, nicht die damalige Erfahrung oder Quelle", () => {
    const { data, draft } = editing(),
      goal = data.goals[0]!,
      before = copy(goal.reviews[1]!),
      unrelated = copy(data.drafts.filter((d) => d.id !== draft.id));
    const sourceBefore = copy(draft.values.source),
      growth = data.growthStage,
      credits = copy(data.retainedReviewGrowth);
    expect(sourceBefore.title).toBe("Damals b");
    expect(sourceBefore.title).not.toBe(goal.title);
    expect(commitDraft(data, draft.key, draft, editAt)).toBe(goal.id);
    expect(goal.reviews).toHaveLength(3);
    expect(goal.reviews[1]).toEqual({
      ...before,
      text: "Meine überarbeiteten Worte.",
      updatedAt: editAt,
    });
    expect(goal.revision).toBe(8);
    expect(goal.updatedAt).toBe(editAt);
    expect(data.drafts).toEqual(unrelated);
    expect(data.growthStage).toBe(growth);
    expect(data.retainedReviewGrowth).toEqual(credits);
    expect(data.readChapters).toEqual([]);
    expect(data.completedSteps).toEqual([]);
  });
  it("erzeugt bei unverändertem Text keinen Bearbeitungszeitpunkt oder neue Vorhabenrevision", () => {
    const data = fixture(),
      goal = data.goals[0]!,
      before = copy(goal),
      { draft } = editing(data, "  Meine damaligen Worte b.  ");
    commitDraft(data, draft.key, draft, editAt);
    expect(goal).toEqual(before);
    expect(data.drafts.some((d) => d.id === draft.id)).toBe(false);
  });
  it.each([
    [
      "Vorhabenrevision",
      (data: ReturnType<typeof fixture>, _draft: DraftOf<"review-edit">) => {
        data.goals[0]!.revision++;
      },
    ],
    [
      "Archivierung",
      (data: ReturnType<typeof fixture>, _draft: DraftOf<"review-edit">) => {
        data.goals[0]!.archivedAt = editAt;
      },
    ],
    [
      "gelöschtes Ziel",
      (data: ReturnType<typeof fixture>, _draft: DraftOf<"review-edit">) => {
        data.goals[0]!.reviews.splice(1, 1);
      },
    ],
    [
      "andere Anwendung",
      (data: ReturnType<typeof fixture>, _draft: DraftOf<"review-edit">) => {
        data.goals[0]!.reviews[1]!.applied = false;
      },
    ],
    [
      "andere Quelle",
      (data: ReturnType<typeof fixture>, _draft: DraftOf<"review-edit">) => {
        data.goals[0]!.reviews[1]!.source.title = "Fremder Stand";
      },
    ],
    [
      "anderer Bearbeitungsstand",
      (data: ReturnType<typeof fixture>, _draft: DraftOf<"review-edit">) => {
        data.goals[0]!.reviews[1]!.updatedAt = editAt;
      },
    ],
    [
      "verfälschte Entwurfsquelle",
      (_data: ReturnType<typeof fixture>, draft: DraftOf<"review-edit">) => {
        draft.values.source.title = "Kein historischer Stand";
      },
    ],
    [
      "leerer Text",
      (_data: ReturnType<typeof fixture>, draft: DraftOf<"review-edit">) => {
        draft.values.text = "  \n ";
      },
    ],
  ] as const)(
    "bewahrt bei Konflikt %s sämtliche Entwurfsworte",
    (_label, change) => {
      const { data, draft } = editing();
      change(data, draft);
      const before = JSON.stringify(data);
      expect(() => commitDraft(data, draft.key, draft, editAt)).toThrow();
      expect(JSON.stringify(data)).toBe(before);
      expect(data.drafts.find((d) => d.id === draft.id)?.values).toEqual(
        draft.values,
      );
    },
  );
  it("legt neue Rückblicke weiterhin ohne erfundenes updatedAt an", () => {
    const data = fixture(),
      goal = data.goals[0]!;
    const draft: DraftOf<"review"> = {
      id: "new-review",
      key: `review:${goal.id}`,
      type: "review",
      revision: 0,
      updatedAt: editAt,
      values: {
        goalId: goal.id,
        baseRevision: goal.revision,
        text: "Ein wirklich neuer Rückblick.",
        applied: false,
        source: goalSnapshot(goal),
      },
    };
    saveDraft(data, draft, null);
    commitDraft(
      data,
      draft.key,
      data.drafts.find((d) => d.id === draft.id)!,
      editAt,
    );
    expect(goal.reviews[0]?.id).toBe(draft.id);
    expect(goal.reviews[0]?.createdAt).toBe(editAt);
    expect(Object.hasOwn(goal.reviews[0]!, "updatedAt")).toBe(false);
  });
});
describe("Löschen mit wachstumsneutraler Sitzungsrückkehr", () => {
  it.each([false, true])(
    "stellt bei applied=%s das vollständige Original an derselben Position wieder her",
    (applied) => {
      const data = fixture(),
        goal = data.goals[0]!,
        target = goal.reviews[1]!;
      target.applied = applied;
      target.updatedAt = editAt;
      const original = copy(goal.reviews),
        drafts = copy(data.drafts),
        credits = copy(data.retainedReviewGrowth),
        growth = data.growthStage;
      const payload = deleteReview(
        data,
        goal.id,
        target.id,
        goal.revision,
        reviewHash(target),
        editAt,
      );
      expect(goal.reviews.map((r) => r.id)).toEqual(["review-a", "review-c"]);
      expect(payload.review).toEqual(original[1]);
      expect(payload.review).not.toBe(target);
      expect(payload.review.source).not.toBe(target.source);
      expect(payload.expectedGoalRevisionAfterDeletion).toBe(8);
      expect(goal.revision).toBe(8);
      expect(data.retainedReviewGrowth).toEqual({
        reflections: credits.reflections + 1,
        actions: credits.actions + Number(applied),
      });
      expect(data.growthStage).toBe(growth);
      expect(data.drafts).toEqual(drafts);
      undoReviewDeletion(data, payload, undoAt);
      expect(goal.reviews).toEqual(original);
      expect(goal.revision).toBe(9);
      expect(goal.updatedAt).toBe(undoAt);
      expect(data.retainedReviewGrowth).toEqual(credits);
      expect(data.growthStage).toBe(growth);
      expect(data.drafts).toEqual(drafts);
    },
  );
  it("bewahrt auch die spätere Wachstumsvoraussetzung ohne gelöschten persönlichen Text", () => {
    const data = fixture(),
      goal = data.goals[0]!;
    data.retainedReviewGrowth = { reflections: 0, actions: 0 };
    data.readChapters = Array.from({ length: 14 }, (_, i) => `MRK:${i + 1}`);
    data.completedSteps = PATHS.flatMap((path) =>
      path.steps.map((_, i) => `${path.id}:${i}`),
    ).slice(0, 7);
    data.readSteps = [...data.completedSteps];
    const control = copy(data);
    grow(control);
    expect(control.growthStage).toBe(6);
    const target = goal.reviews[1]!,
      text = target.text;
    deleteReview(
      data,
      goal.id,
      target.id,
      goal.revision,
      reviewHash(target),
      editAt,
    );
    expect(data.growthStage).toBe(0);
    expect(JSON.stringify(data)).not.toContain(text);
    grow(data);
    expect(data.growthStage).toBe(control.growthStage);
  });
  it("löscht bei einem Zielentwurf oder falschem Hash nichts", () => {
    const { data } = editing(),
      goal = data.goals[0]!,
      target = goal.reviews[1]!,
      before = JSON.stringify(data);
    expect(() =>
      deleteReview(
        data,
        goal.id,
        target.id,
        goal.revision,
        reviewHash(target),
        editAt,
      ),
    ).toThrow(/Entwurf/);
    expect(JSON.stringify(data)).toBe(before);
    expect(() =>
      deleteReview(
        data,
        goal.id,
        target.id,
        goal.revision,
        "0".repeat(64),
        editAt,
      ),
    ).toThrow();
    expect(JSON.stringify(data)).toBe(before);
  });
  it.each([
    [
      "Vorhaben inzwischen verändert",
      (data: ReturnType<typeof fixture>, _payload: ReviewDeletion) => {
        data.goals[0]!.revision++;
      },
    ],
    [
      "Vorhaben archiviert",
      (data: ReturnType<typeof fixture>, _payload: ReviewDeletion) => {
        data.goals[0]!.archivedAt = editAt;
      },
    ],
    [
      "Vorhaben fehlt",
      (data: ReturnType<typeof fixture>, _payload: ReviewDeletion) => {
        data.goals = [];
      },
    ],
    [
      "ID bereits vorhanden",
      (data: ReturnType<typeof fixture>, payload: ReviewDeletion) => {
        data.goals[0]!.reviews.push(copy(payload.review));
      },
    ],
    [
      "Quelle manipuliert",
      (_data: ReturnType<typeof fixture>, payload: ReviewDeletion) => {
        payload.review.source.title = "Geändert";
      },
    ],
    [
      "Position ungültig",
      (_data: ReturnType<typeof fixture>, payload: ReviewDeletion) => {
        payload.index = -1;
      },
    ],
    [
      "Beitrag fehlt",
      (data: ReturnType<typeof fixture>, _payload: ReviewDeletion) => {
        data.retainedReviewGrowth = { reflections: 0, actions: 0 };
      },
    ],
    [
      "Beitrag passt nicht",
      (_data: ReturnType<typeof fixture>, payload: ReviewDeletion) => {
        payload.growthCredit.actions = 0;
      },
    ],
  ] as const)(
    "verweigert Undo bei %s ohne andere Inhalte zu ersetzen",
    (_label, change) => {
      const data = fixture(),
        goal = data.goals[0]!,
        target = goal.reviews[1]!;
      const payload = deleteReview(
        data,
        goal.id,
        target.id,
        goal.revision,
        reviewHash(target),
        editAt,
      );
      change(data, payload);
      const before = JSON.stringify(data);
      expect(() => undoReviewDeletion(data, payload, undoAt)).toThrow();
      expect(JSON.stringify(data)).toBe(before);
    },
  );
  it("kann dieselbe Löschung nicht doppelt ausführen oder doppelt zurücknehmen", () => {
    const data = fixture(),
      goal = data.goals[0]!,
      target = goal.reviews[1]!,
      hash = reviewHash(target),
      revision = goal.revision;
    const payload = deleteReview(
        data,
        goal.id,
        target.id,
        revision,
        hash,
        editAt,
      ),
      deleted = JSON.stringify(data);
    expect(() =>
      deleteReview(data, goal.id, target.id, revision, hash, editAt),
    ).toThrow();
    expect(JSON.stringify(data)).toBe(deleted);
    undoReviewDeletion(data, payload, undoAt);
    const restored = JSON.stringify(data);
    expect(() => undoReviewDeletion(data, payload, undoAt)).toThrow();
    expect(JSON.stringify(data)).toBe(restored);
  });
});
