import { z } from "zod";
import catalog from "../../data/catalog.json";
import { canonicalJson, sha256 } from "../../lib/hash";
import { getPassage, validReference } from "../bible/repository";
import { ntQuestionLocation } from "./index";

const ntBooks = catalog.filter((book) => book.testament === "NT");
const ntBook = z.string().refine(
  (code) => ntBooks.some((book) => book.code === code),
  "Unbekanntes NT-Buch",
);
const text = z.string().min(1).max(10000).refine((value) => value.trim().length > 0);
const questionId = z.string().length(7).regex(/^FP-\d{4}$/).refine((id) => {
  const number = Number(id.slice(3));
  return number >= 261 && number <= 1560;
});
const options = z.tuple([text, text, text, text]).refine(
  (values) => new Set(values).size === 4,
  "Vier unterschiedliche Antwortoptionen erforderlich",
);
const correctIndex = z.number().int().min(0).max(3);
const legacyUnitId = z.number().int().min(10000).max(10259);

export const ntReferenceSchema = z.object({
  book: ntBook,
  chapter: z.number().int().positive(),
  from: z.number().int().positive(),
  to: z.number().int().positive(),
}).strict().refine(
  (ref) => validReference(ref) && ref.from <= ref.to &&
    getPassage(ref).length === ref.to - ref.from + 1,
  "Der Referenzbereich muss vollständig vorhandene Verse enthalten",
);

type NtReferenceRange = z.infer<typeof ntReferenceSchema>;

/** Original German labels follow the frozen FaithPath reference parser contract. */
export function parseNtReferenceText(value: string): NtReferenceRange[] | null {
  const book = [...ntBooks].sort((a, b) => b.name.length - a.name.length)
    .find((candidate) => value.startsWith(candidate.name + " "));
  if (!book) return null;
  let part = value.slice(book.name.length + 1);
  let chapter: number;
  if (part.includes(",")) {
    const match = /^(\d+),(.+)$/.exec(part);
    if (!match) return null;
    chapter = Number(match[1]);
    part = match[2]!;
  } else if (book.chapters === 1) {
    chapter = 1;
  } else return null;
  const ranges: NtReferenceRange[] = [];
  for (const segment of part.split(/[;.]/)) {
    const match = /^(\d+)(?:[–-](\d+))?$/.exec(segment.trim());
    if (!match) return null;
    const range = {
      book: book.code,
      chapter,
      from: Number(match[1]),
      to: Number(match[2] ?? match[1]),
    };
    if (!ntReferenceSchema.safeParse(range).success) return null;
    ranges.push(range);
  }
  return ranges.length >= 1 && ranges.length <= 2 ? ranges : null;
}

const snapshotObject = z.object({
  id: questionId,
  book: ntBook,
  chapter: z.number().int().positive(),
  legacyUnitId,
  prompt: text,
  options,
  correctIndex,
  referenceText: text,
  referenceRanges: z.array(ntReferenceSchema).min(1).max(2),
  explanation: text,
}).strict();

type SnapshotFields = z.infer<typeof snapshotObject>;

function checkSnapshot(snapshot: SnapshotFields, ctx: z.RefinementCtx) {
  const location = ntQuestionLocation(snapshot.id);
  if (!location || location.book !== snapshot.book ||
    location.chapter !== snapshot.chapter ||
    location.legacyUnitId !== snapshot.legacyUnitId) {
    ctx.addIssue({ code: "custom", path: ["id"], message: "Frage und Kapitelzuordnung stimmen nicht überein" });
  }
  const parsed = parseNtReferenceText(snapshot.referenceText);
  if (!parsed || canonicalJson(parsed) !== canonicalJson(snapshot.referenceRanges) ||
    snapshot.referenceRanges.some((ref) => ref.book !== snapshot.book || ref.chapter !== snapshot.chapter)) {
    ctx.addIssue({ code: "custom", path: ["referenceRanges"], message: "Originalreferenz und Kapitelbereiche stimmen nicht überein" });
  }
}

/** The complete immutable answer-time content; no current-bank comparison is required. */
export const ntQuestionSnapshotSchema = snapshotObject.superRefine(checkSnapshot);
export type NtQuestionSnapshot = z.infer<typeof ntQuestionSnapshotSchema>;

/** Hash exactly the primary snapshot fields, even when passed a question with a hash. */
export function ntQuestionHash(snapshot: NtQuestionSnapshot): string {
  const { id, book, chapter, legacyUnitId, prompt, options, correctIndex,
    referenceText, referenceRanges, explanation } = snapshot;
  return sha256(canonicalJson({ id, book, chapter, legacyUnitId, prompt, options,
    correctIndex, referenceText, referenceRanges, explanation }));
}

export const ntQuestionSchema = snapshotObject.extend({
  hash: z.string().regex(/^[a-f0-9]{64}$/),
}).strict().superRefine((question, ctx) => {
  checkSnapshot(question, ctx);
  if (question.hash !== ntQuestionHash(question)) {
    ctx.addIssue({ code: "custom", path: ["hash"], message: "Fragenhash stimmt nicht mit dem Snapshot überein" });
  }
});
export type NtQuestion = z.infer<typeof ntQuestionSchema>;

export const ntSourceQuestionSchema = z.object({
  faithpath_id: questionId,
  q: text,
  a: options,
  c: correctIndex,
  ref: text.refine((value) => parseNtReferenceText(value) !== null),
  x: text,
}).strict();
export type NtSourceQuestion = z.infer<typeof ntSourceQuestionSchema>;

export const ntSourceUnitSchema = z.object({
  id: legacyUnitId,
  kind: z.literal("chapter-quiz"),
  book: ntBook,
  chapter: z.number().int().nonnegative(),
  from: z.number().int().positive(),
  to: z.number().int().positive(),
  title: text,
  ref: text,
  desc: text,
  reflection: text,
  reflectionStatus: z.literal("chapter-context-reviewed"),
  verification: z.literal("source-extractive-luther1912"),
  questions: z.array(ntSourceQuestionSchema).length(5),
}).strict().superRefine((unit, ctx) => {
  const chapter = unit.chapter + 1;
  const range = ntReferenceSchema.safeParse({ book: unit.book, chapter, from: unit.from, to: unit.to });
  if (!range.success) {
    ctx.addIssue({ code: "custom", path: ["chapter"], message: "Ungültiger Kapitelbereich" });
  }
  if (new Set(unit.questions.map((question) => question.q)).size !== 5) {
    ctx.addIssue({ code: "custom", path: ["questions"], message: "Fünf unterschiedliche Fragen erforderlich" });
  }
  unit.questions.forEach((question, questionIndex) => {
    const location = ntQuestionLocation(question.faithpath_id);
    const references = parseNtReferenceText(question.ref);
    if (!location || location.book !== unit.book || location.chapter !== chapter ||
      location.legacyUnitId !== unit.id || location.questionIndex !== questionIndex ||
      !references || references.some((ref) => ref.book !== unit.book || ref.chapter !== chapter)) {
      ctx.addIssue({ code: "custom", path: ["questions", questionIndex], message: "Frage und Quelleinheit stimmen nicht überein" });
    }
  });
});
export type NtSourceUnit = z.infer<typeof ntSourceUnitSchema>;
