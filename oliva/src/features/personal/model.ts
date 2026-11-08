import type { AppData, Note } from "../../state/model";
import { commitCapture } from "./capture-model";
import { captureKey } from "./capture-schema";
import { canonicalJson, sha256 } from "../../lib/hash";
import {
  draftSchema,
  goalSchema,
  reviewSchema,
  type Draft,
  type DraftOf,
  type DraftStamp,
  type Goal,
  type Review,
  newId,
} from "./schema";

function expectStamp(current: Draft | undefined, expected: DraftStamp | null) {
  if (
    expected === null
      ? !!current
      : !current ||
        current.id !== expected.id ||
        current.revision !== expected.revision
  )
    throw new Error(
      "Dieser Entwurf wurde inzwischen verändert. Deine Eingabe bleibt im Editor. Lade den aktuellen Stand, bevor du ihn ersetzt.",
    );
}
export function saveDraft(
  data: AppData,
  next: Draft,
  expected: DraftStamp | null,
) {
  const current = data.drafts.find((d) => d.key === next.key);
  expectStamp(current, expected);
  if (next.type === "capture" && next.key !== captureKey(next.values.source))
    throw new Error("Entwurf und Quelle passen nicht zusammen.");
  const parsed = draftSchema.parse({
    ...next,
    revision: (current?.revision ?? 0) + 1,
  });
  if (current) data.drafts[data.drafts.indexOf(current)] = parsed;
  else data.drafts.push(parsed);
}
export function removeDraft(data: AppData, key: string, expected: DraftStamp) {
  const current = data.drafts.find((d) => d.key === key);
  expectStamp(current, expected);
  data.drafts = data.drafts.filter((d) => d.key !== key);
}
export function goalSnapshot(goal: Goal) {
  return {
    title: goal.title,
    why: goal.why,
    ...(goal.ref ? { ref: { ...goal.ref } } : {}),
    steps: goal.steps.map((s) => ({ id: s.id, text: s.text, done: s.done })),
  };
}
function editableGoal(data: AppData, id: string, revision: number) {
  const goal = data.goals.find((g) => g.id === id);
  if (!goal)
    throw new Error(
      "Dieses Vorhaben ist nicht mehr vorhanden. Dein Entwurf bleibt erhalten.",
    );
  if (goal.archivedAt)
    throw new Error(
      "Dieses Vorhaben ist archiviert. Hole es zuerst zurück. Dein Entwurf bleibt erhalten.",
    );
  if (goal.revision !== revision)
    throw new Error(
      "Das Vorhaben hat sich seit Beginn dieses Entwurfs verändert. Deine Worte bleiben erhalten; prüfe zuerst den aktuellen Stand.",
    );
  return goal;
}
export function commitDraft(
  data: AppData,
  key: string,
  expected: DraftStamp,
  at: string,
  options: { completeGuided?: boolean } = {},
) {
  const draft = data.drafts.find((d) => d.key === key);
  expectStamp(draft, expected);
  if (!draft) throw new Error("Entwurf fehlt.");
  let result = "";
  if (draft.type === "capture") {
    result = commitCapture(data, draft, at, options.completeGuided ?? true);
  } else if (draft.type === "journal") {
    const v = draft.values,
      text = v.text.trim();
    if (!text) throw new Error("Schreibe zuerst einen Gedanken.");
    const existing = v.targetId
      ? data.notes.find((n) => n.id === v.targetId)
      : undefined;
    if (v.targetId && (!existing || existing.updatedAt !== v.baseUpdatedAt))
      throw new Error(
        "Dieser Gedanke wurde inzwischen verändert oder gelöscht. Dein Entwurf bleibt erhalten.",
      );
    if (existing) {
      existing.text = text;
      existing.updatedAt = at;
    } else {
      if (data.notes.some((n) => n.id === v.entityId))
        throw new Error("Dieser Gedanke existiert bereits.");
      data.notes.unshift({
        id: v.entityId,
        text,
        kind: v.kind,
        ...(v.ref ? { ref: v.ref } : {}),
        createdAt: at,
        updatedAt: at,
      });
    }
    result = v.entityId;
  } else if (draft.type === "goal") {
    const v = draft.values;
    if (!v.title.trim())
      throw new Error("Gib deinem Vorhaben einen kurzen Namen.");
    if (v.targetId) {
      const goal = editableGoal(data, v.targetId, v.baseRevision!);
      goal.title = v.title.trim();
      goal.why = v.why;
      goal.ref = v.ref;
      goal.updatedAt = at;
      goal.revision++;
      result = goal.id;
    } else {
      if (data.goals.some((g) => g.id === v.entityId))
        throw new Error("Dieses Vorhaben existiert bereits.");
      const goal = goalSchema.parse({
        id: v.entityId,
        title: v.title.trim(),
        why: v.why,
        ...(v.ref ? { ref: v.ref } : {}),
        createdAt: at,
        updatedAt: at,
        archivedAt: null,
        revision: 1,
        steps: v.initialStep.trim()
          ? [
              {
                id: newId("step"),
                text: v.initialStep.trim(),
                done: false,
                createdAt: at,
                completedAt: null,
              },
            ]
          : [],
        reviews: [],
      });
      data.goals.unshift(goal);
      result = goal.id;
    }
  } else if (draft.type === "step") {
    const v = draft.values,
      goal = editableGoal(data, v.goalId, v.baseRevision),
      text = v.text.trim();
    if (!text) throw new Error("Beschreibe einen kleinen Schritt.");
    if (v.editing) {
      const step = goal.steps.find((s) => s.id === v.stepId);
      if (!step) throw new Error("Dieser Schritt ist nicht mehr vorhanden.");
      step.text = text;
    } else {
      if (goal.steps.some((s) => s.id === v.stepId))
        throw new Error("Dieser Schritt existiert bereits.");
      goal.steps.push({
        id: v.stepId,
        text,
        done: false,
        createdAt: at,
        completedAt: null,
      });
    }
    goal.revision++;
    goal.updatedAt = at;
    result = goal.id;
  } else if (draft.type === "review-edit") {
    const v = draft.values,
      goal = editableGoal(data, v.goalId, v.baseRevision),
      review = goal.reviews.find((r) => r.id === v.reviewId),
      text = v.text.trim();
    if (!text) throw new Error("Schreibe zuerst deinen Rückblick.");
    if (!review || reviewHash(review) !== v.baseReviewHash)
      throw new Error(
        "Dieser Rückblick wurde inzwischen verändert oder gelöscht. Dein Entwurf bleibt erhalten.",
      );
    if (canonicalStoredJson(v.source) !== canonicalStoredJson(review.source))
      throw new Error(
        "Der bewahrte Quellstand passt nicht zu diesem Rückblick. Dein Entwurf bleibt erhalten.",
      );
    if (text !== review.text) {
      const edited = reviewSchema.parse({ ...review, text, updatedAt: at });
      review.text = edited.text;
      review.updatedAt = edited.updatedAt;
      goal.revision++;
      goal.updatedAt = at;
    }
    result = goal.id;
  } else if (draft.type === "review") {
    const v = draft.values,
      goal = editableGoal(data, v.goalId, v.baseRevision);
    if (!v.text.trim()) throw new Error("Schreibe zuerst deinen Rückblick.");
    goal.reviews.unshift({
      id: draft.id,
      text: v.text.trim(),
      applied: v.applied,
      createdAt: at,
      source: JSON.parse(JSON.stringify(v.source)),
    });
    goal.revision++;
    goal.updatedAt = at;
    result = goal.id;
  } else {
    return unsupportedDraft(draft);
  }
  removeDraft(data, key, expected);
  return result;
}
function unsupportedDraft(_draft: never): never {
  throw new Error("Dieser Entwurfstyp wird nicht unterstützt.");
}
export function setStepDone(
  data: AppData,
  id: string,
  stepId: string,
  done: boolean,
  at: string,
) {
  const g = data.goals.find((g) => g.id === id);
  if (!g || g.archivedAt) throw new Error("Öffne zuerst ein aktives Vorhaben.");
  const s = g.steps.find((s) => s.id === stepId);
  if (!s) throw new Error("Dieser Schritt ist nicht vorhanden.");
  if (s.done === done) return;
  s.done = done;
  s.completedAt = done ? at : null;
  g.updatedAt = at;
  g.revision++;
}
export function archiveGoal(
  data: AppData,
  id: string,
  archived: boolean,
  at: string,
) {
  const g = data.goals.find((g) => g.id === id);
  if (!g) throw new Error("Dieses Vorhaben ist nicht vorhanden.");
  if (!!g.archivedAt === archived) return;
  g.archivedAt = archived ? at : null;
  g.updatedAt = at;
  g.revision++;
}
export function journalDraft(note?: Note): DraftOf<"journal"> {
  const at = new Date().toISOString();
  return {
    id: newId("draft"),
    key: "journal",
    revision: 0,
    type: "journal",
    updatedAt: at,
    values: {
      entityId: note?.id ?? newId("note"),
      targetId: note?.id ?? null,
      baseUpdatedAt: note?.updatedAt ?? null,
      text: note?.text ?? "",
      kind: note?.kind ?? "note",
      ...(note?.ref ? { ref: note.ref } : {}),
    },
  };
}

/** Match the canonical persisted JSON representation, including every review
 * field and historical source. Optional undefined values are omitted by JSON. */
function canonicalStoredJson(value: unknown) {
  return canonicalJson(JSON.parse(JSON.stringify(value)));
}
export function reviewHash(review: Review): string {
  return sha256(canonicalStoredJson(review));
}
export function reviewEditDraft(
  goal: Goal,
  reviewId: string,
): DraftOf<"review-edit"> {
  if (goal.archivedAt)
    throw new Error("Dieses Vorhaben ist archiviert. Hole es zuerst zurück.");
  const review = goal.reviews.find((r) => r.id === reviewId);
  if (!review) throw new Error("Dieser Rückblick ist nicht mehr vorhanden.");
  return {
    id: newId("draft"),
    key: `review-edit:${goal.id}`,
    revision: 0,
    type: "review-edit",
    updatedAt: new Date().toISOString(),
    values: {
      goalId: goal.id,
      reviewId: review.id,
      baseRevision: goal.revision,
      baseReviewHash: reviewHash(review),
      text: review.text,
      source: JSON.parse(JSON.stringify(review.source)),
    },
  };
}

/** Only retained in the session by the store. Never part of AppData/backups. */
export type ReviewDeletion = {
  goalId: string;
  review: Review;
  index: number;
  expectedGoalRevisionAfterDeletion: number;
  expectedReviewHash: string;
  growthCredit: { reflections: 1; actions: 0 | 1 };
};
export function deleteReview(
  data: AppData,
  goalId: string,
  reviewId: string,
  expectedGoalRevision: number,
  expectedHash: string,
  at: string,
): ReviewDeletion {
  const goal = editableGoal(data, goalId, expectedGoalRevision),
    index = goal.reviews.findIndex((r) => r.id === reviewId),
    review = goal.reviews[index];
  if (!review || reviewHash(review) !== expectedHash)
    throw new Error(
      "Dieser Rückblick wurde inzwischen verändert oder gelöscht. Bitte prüfe den aktuellen Stand.",
    );
  if (
    data.drafts.some(
      (d) =>
        d.type === "review-edit" &&
        d.values.goalId === goalId &&
        d.values.reviewId === reviewId,
    )
  )
    throw new Error(
      "Zu diesem Rückblick ist noch ein Entwurf vorhanden. Schließe ihn zuerst ab oder verwirf ihn ausdrücklich.",
    );
  reviewSchema.shape.createdAt.parse(at);
  const growthCredit = {
    reflections: 1 as const,
    actions: review.applied ? (1 as const) : (0 as const),
  };
  const retained = {
    reflections:
      data.retainedReviewGrowth.reflections + growthCredit.reflections,
    actions: data.retainedReviewGrowth.actions + growthCredit.actions,
  };
  if (
    !Number.isSafeInteger(retained.reflections) ||
    !Number.isSafeInteger(retained.actions) ||
    retained.actions > retained.reflections
  )
    throw new Error(
      "Der bewahrte Entwicklungsstand ist ungültig. Es wurde nichts gelöscht.",
    );
  const payload: ReviewDeletion = {
    goalId,
    review: JSON.parse(JSON.stringify(review)),
    index,
    expectedGoalRevisionAfterDeletion: goal.revision + 1,
    expectedReviewHash: expectedHash,
    growthCredit,
  };
  goal.reviews.splice(index, 1);
  goal.revision++;
  goal.updatedAt = at;
  data.retainedReviewGrowth = retained;
  return payload;
}
export function undoReviewDeletion(
  data: AppData,
  payload: ReviewDeletion,
  at: string,
): void {
  const goal = editableGoal(
      data,
      payload.goalId,
      payload.expectedGoalRevisionAfterDeletion,
    ),
    review = reviewSchema.parse(payload.review);
  if (
    reviewHash(review) !== payload.expectedReviewHash ||
    goal.reviews.some((r) => r.id === review.id)
  )
    throw new Error(
      "Der Rückblick kann nicht unverändert zurückgeholt werden. Bitte prüfe den aktuellen Stand.",
    );
  if (
    !Number.isInteger(payload.index) ||
    payload.index < 0 ||
    payload.index > goal.reviews.length ||
    goal.reviews.length >= 500
  )
    throw new Error(
      "Die ursprüngliche Position des Rückblicks ist nicht mehr verfügbar.",
    );
  const actions = review.applied ? 1 : 0;
  if (
    payload.growthCredit.reflections !== 1 ||
    payload.growthCredit.actions !== actions ||
    data.retainedReviewGrowth.reflections < 1 ||
    data.retainedReviewGrowth.actions < actions
  )
    throw new Error(
      "Der bewahrte Entwicklungsstand passt nicht zu dieser Rückkehr.",
    );
  reviewSchema.shape.createdAt.parse(at);
  const retained = {
    reflections: data.retainedReviewGrowth.reflections - 1,
    actions: data.retainedReviewGrowth.actions - actions,
  };
  if (retained.actions > retained.reflections)
    throw new Error(
      "Der bewahrte Entwicklungsstand passt nicht zu dieser Rückkehr.",
    );
  goal.reviews.splice(payload.index, 0, JSON.parse(JSON.stringify(review)));
  goal.revision++;
  goal.updatedAt = at;
  data.retainedReviewGrowth = retained;
}
