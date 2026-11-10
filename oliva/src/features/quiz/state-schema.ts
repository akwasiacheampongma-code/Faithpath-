import { z } from "zod";
import { canonicalJson, sha256 } from "../../lib/hash";
import { ntChapterIndex, ntQuestionLocation } from "./index";
import { ntQuestionSchema } from "./schema";

export const MAX_NT_ANSWERS = 26000;
export const MAX_NT_COMPLETIONS = 5200;
export const MAX_NT_LEGACY_COMPLETIONS = 26000;

const hash = z.string().length(64).regex(/^[a-f0-9]{64}$/);
const revision = z.number().int().positive();

/** Exactly the UTC timestamp emitted by Date.toISOString(), including milliseconds. */
export const ntStudyDateSchema = z.string().regex(
  /^(?:\d{4}|[+-]\d{6})-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
).refine((value) => {
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString() === value;
}, "Ein vollständiger, kalendarisch gültiger UTC-Zeitpunkt ist erforderlich");

export const ntPositionSchema = z.object({
  book: z.string(),
  chapter: z.number().int().positive(),
  index: z.number().int().min(0).max(4),
}).strict().refine(
  (position) => ntChapterIndex(position.book, position.chapter) !== null,
  "Unbekanntes NT-Kapitel",
);
export type NtPosition = z.infer<typeof ntPositionSchema>;

export const ntAnswerSchema = z.object({
  question: ntQuestionSchema,
  choice: z.number().int().min(0).max(3),
  createdAt: ntStudyDateSchema,
  updatedAt: ntStudyDateSchema.optional(),
  revision,
}).strict().superRefine((answer, ctx) => {
  if ((answer.revision === 1) !== (answer.updatedAt === undefined)) {
    ctx.addIssue({ code: "custom", path: ["updatedAt"], message: "Nur eine bearbeitete Antwort besitzt einen Bearbeitungszeitpunkt" });
  }
  if (answer.updatedAt && Date.parse(answer.updatedAt) < Date.parse(answer.createdAt)) {
    ctx.addIssue({ code: "custom", path: ["updatedAt"], message: "Die Bearbeitung liegt vor der ersten Antwort" });
  }
});
export type NtAnswer = z.infer<typeof ntAnswerSchema>;

const questionIdentitySchema = z.object({
  id: z.string().length(7).refine((id) => ntQuestionLocation(id) !== null),
  hash,
}).strict();
export type NtQuestionIdentity = z.infer<typeof questionIdentitySchema>;

/** The order is part of the set identity; it is the original five-question order. */
export function ntQuestionSetHash(questionSet: readonly NtQuestionIdentity[]) {
  return sha256(canonicalJson(questionSet));
}

export const ntCompletionSchema = z.object({
  book: z.string(),
  chapter: z.number().int().positive(),
  questionSet: z.array(questionIdentitySchema).length(5),
  completedAt: ntStudyDateSchema,
  revision,
}).strict().superRefine((completion, ctx) => {
  const chapter = ntChapterIndex(completion.book, completion.chapter);
  if (!chapter) {
    ctx.addIssue({ code: "custom", path: ["chapter"], message: "Unbekanntes NT-Kapitel" });
  }
  completion.questionSet.forEach((question, index) => {
    const location = ntQuestionLocation(question.id);
    if (!location || location.book !== completion.book ||
      location.chapter !== completion.chapter || location.questionIndex !== index) {
      ctx.addIssue({ code: "custom", path: ["questionSet", index], message: "Frage, Kapitel und Originalreihenfolge stimmen nicht überein" });
    }
  });
});
export type NtCompletion = z.infer<typeof ntCompletionSchema>;

export const ntLegacyCompletionSchema = z.object({
  importId: z.string().length(68).regex(/^fp5-[a-f0-9]{64}$/),
  sourceHash: hash,
  sourceUnitId: z.string().length(5).regex(/^10[0-2]\d{2}$/),
  book: z.string(),
  chapter: z.number().int().positive(),
  completedAt: ntStudyDateSchema,
}).strict().refine((completion) => {
  const chapter = ntChapterIndex(completion.book, completion.chapter);
  return !!chapter && completion.sourceUnitId === String(chapter.legacyUnitId);
}, "Originaleinheit und NT-Kapitel stimmen nicht überein");
export type NtLegacyCompletion = z.infer<typeof ntLegacyCompletionSchema>;

export const ntStudySchema = z.object({
  answers: z.record(z.string(), ntAnswerSchema).refine(
    (answers) => Object.keys(answers).length <= MAX_NT_ANSWERS,
    "Zu viele bewahrte NT-Antworten",
  ),
  completions: z.record(z.string(), ntCompletionSchema).refine(
    (completions) => Object.keys(completions).length <= MAX_NT_COMPLETIONS,
    "Zu viele bewahrte NT-Abschlüsse",
  ),
  legacyCompletions: z.array(ntLegacyCompletionSchema).max(MAX_NT_LEGACY_COMPLETIONS),
  position: ntPositionSchema.nullable(),
}).strict().superRefine((study, ctx) => {
  for (const [key, answer] of Object.entries(study.answers)) {
    if (key !== `${answer.question.id}:${answer.question.hash}`) {
      ctx.addIssue({ code: "custom", path: ["answers", key], message: "Antwortschlüssel und Fragensnapshot stimmen nicht überein" });
    }
  }
  for (const [key, completion] of Object.entries(study.completions)) {
    if (key !== `${completion.book}:${completion.chapter}:${ntQuestionSetHash(completion.questionSet)}`) {
      ctx.addIssue({ code: "custom", path: ["completions", key], message: "Abschlussschlüssel und Fragensatz stimmen nicht überein" });
    }
    for (const question of completion.questionSet) {
      const answer = study.answers[`${question.id}:${question.hash}`];
      if (!answer || Date.parse(answer.createdAt) > Date.parse(completion.completedAt)) {
        ctx.addIssue({ code: "custom", path: ["completions", key, "questionSet"], message: "Ein Abschluss benötigt fünf zuvor gespeicherte Antworten dieser Fragenfassung" });
      }
    }
  }
  const origins = new Set<string>();
  study.legacyCompletions.forEach((completion, index) => {
    const origin = `${completion.importId}:${completion.sourceUnitId}`;
    if (origins.has(origin)) {
      ctx.addIssue({ code: "custom", path: ["legacyCompletions", index], message: "Dieselbe Originaleinheit ist im Importbeleg mehrfach enthalten" });
    }
    origins.add(origin);
  });
});
export type NtStudy = z.infer<typeof ntStudySchema>;

export function emptyNtStudy(): NtStudy {
  return { answers: {}, completions: {}, legacyCompletions: [], position: null };
}
