import { z } from "zod";
import { ntStudyDateSchema as date } from "../quiz/state-schema";
import { storyById, storyQuestionLocation } from "./index";
import { storyFingerprint, storyHashSchema, storyIdSchema, storyQuestionSchema } from "./schema";
export const storyStageSchema = z.enum(["lesen", "verstehen", "gedanken", "abschluss"]);
export type StoryStage = z.infer<typeof storyStageSchema>;
export const storyPositionSchema = z.object({
  unitId: storyIdSchema, index: z.number().int().min(0).max(30),
  stage: storyStageSchema, setHash: storyHashSchema,
}).strict().refine((p) => p.index < storyById(p.unitId)!.questions.length, "Ungültige Fragenposition");
export type StoryPosition = z.infer<typeof storyPositionSchema>;
export const storyAnswerSchema = z.object({
  question: storyQuestionSchema, choice: z.number().int().min(0).max(3),
  createdAt: date, updatedAt: date.optional(), revision: z.number().int().positive(),
}).strict().refine((a) => (a.revision === 1) === (a.updatedAt === undefined) &&
  (!a.updatedAt || Date.parse(a.updatedAt) >= Date.parse(a.createdAt)), "Ungültiger Antwortverlauf");
export type StoryAnswer = z.infer<typeof storyAnswerSchema>;
const identity = z.object({ id: z.string().regex(/^(N|FP)-\d{4}$/), hash: storyHashSchema }).strict();
const viewedSchema = z.object({
  unitId: storyIdSchema, setHash: storyHashSchema,
  questionSet: z.array(identity).min(1).max(31), seen: z.array(z.string()).max(31),
}).strict().refine((v) =>
  v.setHash === storyFingerprint(v.questionSet) && new Set(v.seen).size === v.seen.length &&
  v.seen.every((id) => v.questionSet.some((q) => q.id === id)) &&
  new Set(v.questionSet.map((q) => q.id)).size === v.questionSet.length &&
  v.questionSet.every((q) => storyQuestionLocation(q.id)?.unitId === v.unitId),
  "Fragensatz und angesehene Fragen passen nicht zusammen");
export const storyStudySchema = z.object({
  answers: z.record(z.string(), storyAnswerSchema).refine((v) => Object.keys(v).length <= 10000),
  viewed: z.record(z.string(), viewedSchema).refine((v) => Object.keys(v).length <= 2000),
  position: storyPositionSchema.nullable(),
}).strict().superRefine((s, ctx) => {
  for (const [key, value] of Object.entries(s.answers))
    if (key !== value.question.id + ":" + value.question.hash)
      ctx.addIssue({ code: "custom", path: ["answers", key], message: "Ungültiger Antwortschlüssel" });
  for (const [key, value] of Object.entries(s.viewed))
    if (key !== value.unitId + ":" + value.setHash)
      ctx.addIssue({ code: "custom", path: ["viewed", key], message: "Ungültiger Fragensatzschlüssel" });
});
export type StoryStudy = z.infer<typeof storyStudySchema>;
export const emptyStoryStudy = (): StoryStudy => ({ answers: {}, viewed: {}, position: null });
