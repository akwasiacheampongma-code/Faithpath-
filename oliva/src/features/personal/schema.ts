import { z } from "zod";
import { referenceSchema } from "../bible/schema";
import { originSchema } from "../imports/schema";
import { captureValuesSchema } from "./capture-schema";

const id = z.string().min(1).max(100),
  date = z.string().datetime();
const stepSchema = z
  .object({
    id,
    text: z.string().trim().min(1).max(1000),
    done: z.boolean(),
    createdAt: date,
    completedAt: date.nullable(),
  })
  .strict()
  .refine(
    (s) => s.done === !!s.completedAt,
    "Schrittstatus und Abschlussdatum widersprechen sich",
  );
export const snapshotSchema = z
  .object({
    title: z.string().trim().min(1).max(120),
    why: z.string().max(3000),
    ref: referenceSchema.optional(),
    steps: z
      .array(
        z
          .object({ id, text: z.string().min(1).max(1000), done: z.boolean() })
          .strict(),
      )
      .max(100),
  })
  .strict();
export const reviewSchema = z
  .object({
    id,
    text: z.string().trim().min(1).max(10000),
    createdAt: date,
    updatedAt: date.optional(),
    applied: z.boolean(),
    source: snapshotSchema,
  })
  .strict();
export const goalSchema = z
  .object({
    id,
    title: z.string().trim().min(1).max(120),
    why: z.string().max(3000),
    ref: referenceSchema.optional(),
    createdAt: date,
    updatedAt: date,
    archivedAt: date.nullable(),
    revision: z.number().int().positive(),
    steps: z.array(stepSchema).max(100),
    reviews: z.array(reviewSchema).max(500),
    origin: originSchema.optional(),
  })
  .strict()
  .refine(
    (g) =>
      new Set(g.steps.map((s) => s.id)).size === g.steps.length &&
      new Set(g.reviews.map((r) => r.id)).size === g.reviews.length,
    "Doppelte Einträge im Vorhaben",
  );

export const journalValues = z
  .object({
    entityId: id,
    targetId: id.nullable(),
    baseUpdatedAt: date.nullable(),
    text: z.string().max(10000),
    kind: z.enum(["note", "reflection", "action"]),
    ref: referenceSchema.optional(),
  })
  .strict();
export const goalValues = z
  .object({
    entityId: id,
    targetId: id.nullable(),
    baseRevision: z.number().int().positive().nullable(),
    title: z.string().max(120),
    why: z.string().max(3000),
    initialStep: z.string().max(1000),
    ref: referenceSchema.optional(),
  })
  .strict();
export const stepValues = z
  .object({
    goalId: id,
    stepId: id,
    editing: z.boolean(),
    baseRevision: z.number().int().positive(),
    text: z.string().max(1000),
  })
  .strict();
export const reviewValues = z
  .object({
    goalId: id,
    baseRevision: z.number().int().positive(),
    text: z.string().max(10000),
    applied: z.boolean(),
    source: snapshotSchema,
  })
  .strict();
export const reviewEditValues = z
  .object({
    goalId: id,
    reviewId: id,
    baseRevision: z.number().int().positive(),
    baseReviewHash: z.string().regex(/^[a-f0-9]{64}$/),
    text: z.string().max(10000),
    source: snapshotSchema,
  })
  .strict();
const envelope = {
  id,
  key: z.string().min(1).max(160),
  revision: z.number().int().nonnegative(),
  updatedAt: date,
};
export const draftSchema = z.discriminatedUnion("type", [
  z
    .object({ ...envelope, type: z.literal("journal"), values: journalValues })
    .strict(),
  z
    .object({ ...envelope, type: z.literal("goal"), values: goalValues })
    .strict(),
  z
    .object({ ...envelope, type: z.literal("step"), values: stepValues })
    .strict(),
  z
    .object({ ...envelope, type: z.literal("review"), values: reviewValues })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("review-edit"),
      values: reviewEditValues,
    })
    .strict(),
  z
    .object({
      ...envelope,
      type: z.literal("capture"),
      values: captureValuesSchema,
    })
    .strict(),
]);
export type Goal = z.infer<typeof goalSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Draft = z.infer<typeof draftSchema>;
export type DraftOf<T extends Draft["type"]> = Extract<Draft, { type: T }>;
export type DraftStamp = Pick<Draft, "id" | "revision">;
export const newId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
