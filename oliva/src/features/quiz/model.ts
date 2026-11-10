import { canonicalJson, sha256 } from "../../lib/hash";
import type { NtChapter } from "./catalog";
import { NT_BOOKS, ntChapterIndex, ntQuestionLocation } from "./index";
import { ntQuestionSchema, type NtQuestion } from "./schema";
import {
  MAX_NT_ANSWERS,
  MAX_NT_COMPLETIONS,
  ntAnswerSchema,
  ntCompletionSchema,
  ntLegacyCompletionSchema,
  ntPositionSchema,
  ntQuestionSetHash,
  ntStudyDateSchema,
  ntStudySchema,
  type NtAnswer,
  type NtCompletion,
  type NtLegacyCompletion,
  type NtStudy,
} from "./state-schema";

export { emptyNtStudy } from "./state-schema";

export function answerKey(question: Pick<NtQuestion, "id" | "hash">) {
  return `${question.id}:${question.hash}`;
}

export function answerStamp(answer: NtAnswer | null): string | null {
  return answer === null ? null : sha256(canonicalJson(ntAnswerSchema.parse(answer)));
}

export function completionStamp(completion: NtCompletion | null): string | null {
  return completion === null ? null : sha256(canonicalJson(ntCompletionSchema.parse(completion)));
}

function checkedChapter(chapter: NtChapter) {
  const location = ntChapterIndex(chapter.book, chapter.chapter);
  if (!location || chapter.key !== location.key ||
    chapter.legacyUnitId !== location.legacyUnitId ||
    !Array.isArray(chapter.questions) || chapter.questions.length !== 5) {
    throw new Error("Der NT-Fragensatz gehört nicht zu einem bekannten Kapitel.");
  }
  const questions = chapter.questions.map((question, index) => {
    const parsed = ntQuestionSchema.parse(question);
    const questionLocation = ntQuestionLocation(parsed.id)!;
    if (questionLocation.book !== location.book ||
      questionLocation.chapter !== location.chapter ||
      questionLocation.questionIndex !== index) {
      throw new Error("Die fünf NT-Fragen müssen in ihrer Originalreihenfolge vorliegen.");
    }
    return parsed;
  });
  return { ...location, questions };
}

export function chapterSetHash(chapter: NtChapter) {
  return ntQuestionSetHash(checkedChapter(chapter).questions.map(({ id, hash }) => ({ id, hash })));
}

export function completionKey(chapter: NtChapter) {
  return `${chapter.book}:${chapter.chapter}:${chapterSetHash(chapter)}`;
}

function expectStamp(actual: string | null, expected: string | null) {
  if (actual !== expected) {
    throw new Error("Dieser NT-Lernstand wurde inzwischen verändert. Öffne den aktuellen Stand erneut.");
  }
}

function ensureNotBefore(at: string, previous: string) {
  if (Date.parse(at) < Date.parse(previous)) {
    throw new Error("Der neue Zeitpunkt darf nicht vor dem bewahrten Lernstand liegen.");
  }
}

/** Mutates only after complete validation. The caller persists with its own atomic guard. */
export function saveNtAnswer(
  study: NtStudy,
  question: NtQuestion,
  choice: number,
  expectedStamp: string | null,
  at: string,
): boolean {
  const next = ntStudySchema.parse(study);
  const snapshot = ntQuestionSchema.parse(question);
  ntStudyDateSchema.parse(at);
  const key = answerKey(snapshot);
  const current = next.answers[key] ?? null;
  expectStamp(answerStamp(current), expectedStamp);
  // Validate even a no-op request; an invalid option must never count as success.
  ntAnswerSchema.shape.choice.parse(choice);
  if (current?.choice === choice) return false;
  if (current) ensureNotBefore(at, current.updatedAt ?? current.createdAt);
  else if (Object.keys(next.answers).length >= MAX_NT_ANSWERS) {
    throw new Error("Der Speicher für bewahrte NT-Antworten ist voll.");
  }
  const location = ntQuestionLocation(snapshot.id)!;
  const answer = ntAnswerSchema.parse({
    question: snapshot,
    choice,
    createdAt: current?.createdAt ?? at,
    ...(current ? { updatedAt: at } : {}),
    revision: (current?.revision ?? 0) + 1,
  });
  study.answers = { ...next.answers, [key]: answer };
  study.position = { book: location.book, chapter: location.chapter, index: location.questionIndex };
  return true;
}

/** A completion records five viewed questions; correctness is not a condition. */
export function finishNtChapter(
  study: NtStudy,
  chapter: NtChapter,
  expectedCompletionStamp: string | null,
  at: string,
): boolean {
  const next = ntStudySchema.parse(study);
  const checked = checkedChapter(chapter);
  ntStudyDateSchema.parse(at);
  const questionSet = checked.questions.map(({ id, hash }) => ({ id, hash }));
  const key = `${checked.key}:${ntQuestionSetHash(questionSet)}`;
  const current = next.completions[key] ?? null;
  expectStamp(completionStamp(current), expectedCompletionStamp);
  for (const question of checked.questions) {
    const answer = next.answers[answerKey(question)];
    if (!answer) throw new Error("Sieh zuerst alle fünf Fragen dieser Kapitelversion an.");
    ensureNotBefore(at, answer.updatedAt ?? answer.createdAt);
  }
  if (current) {
    ensureNotBefore(at, current.completedAt);
    if (current.completedAt === at) return false;
  } else if (Object.keys(next.completions).length >= MAX_NT_COMPLETIONS) {
    throw new Error("Der Speicher für bewahrte NT-Abschlüsse ist voll.");
  }
  const completion = ntCompletionSchema.parse({
    book: checked.book,
    chapter: checked.chapter,
    questionSet,
    completedAt: at,
    revision: (current?.revision ?? 0) + 1,
  });
  study.completions = { ...next.completions, [key]: completion };
  study.position = { book: checked.book, chapter: checked.chapter, index: 4 };
  return true;
}

export function currentNtAnswer(study: NtStudy, question: NtQuestion): NtAnswer | null {
  const snapshot = ntQuestionSchema.parse(question);
  const key = answerKey(snapshot), stored = study.answers[key];
  if (!stored) return null;
  const answer = ntAnswerSchema.parse(stored);
  if (answerKey(answer.question) !== key) {
    throw new Error("Antwortschlüssel und Fragensnapshot stimmen nicht überein.");
  }
  return answer;
}

export function chapterStudyProgress(study: NtStudy, chapter: NtChapter) {
  const checked = checkedChapter(chapter);
  const key = `${checked.key}:${ntQuestionSetHash(checked.questions.map(({ id, hash }) => ({ id, hash })))}`;
  // A chapter list calls this selector repeatedly. Validate and clone only this
  // chapter's current projection; the persistence boundary validates the whole study.
  const answers = Object.fromEntries(checked.questions.flatMap((question) => {
    const key = answerKey(question), answer = study.answers[key];
    return answer ? [[key, answer]] : [];
  }));
  const next = ntStudySchema.parse({
    answers,
    completions: study.completions[key] ? { [key]: study.completions[key] } : {},
    legacyCompletions: study.legacyCompletions.filter(
      (completion) => completion.book === checked.book && completion.chapter === checked.chapter,
    ),
    position: null,
  });
  return {
    answered: Object.keys(next.answers).length,
    completion: next.completions[key] ?? null,
    legacyCompletions: next.legacyCompletions,
  };
}

export function rememberNtPosition(study: NtStudy, book: string, chapter: number, index: number): boolean {
  const position = ntPositionSchema.parse({ book, chapter, index });
  if (study.position?.book === book && study.position.chapter === chapter && study.position.index === index) {
    return false;
  }
  study.position = position;
  return true;
}

const legacyUnits = new Map<string, { book: string; chapter: number }>();
for (const book of NT_BOOKS) {
  for (let chapter = 1; chapter <= book.chapters; chapter++) {
    const location = ntChapterIndex(book.code, chapter)!;
    legacyUnits.set(String(location.legacyUnitId), { book: location.book, chapter });
  }
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export type LegacyNtExtraction = {
  completions: NtLegacyCompletion[];
  ignored: { unknownUnitKeys: number; invalidEntries: number; invalidDone: number; extraFields: number };
};

/** Reads only the original quiz[exact unit ID].done contract. Raw data stays archived unchanged. */
export function extractLegacyNtCompletions(quiz: unknown, importId: string, sourceHash: string): LegacyNtExtraction {
  // Validate provenance even when the input contains no transferable completions.
  ntLegacyCompletionSchema.shape.importId.parse(importId);
  ntLegacyCompletionSchema.shape.sourceHash.parse(sourceHash);
  const result: LegacyNtExtraction = {
    completions: [],
    ignored: { unknownUnitKeys: 0, invalidEntries: 0, invalidDone: 0, extraFields: 0 },
  };
  if (!object(quiz)) {
    result.ignored.invalidEntries = 1;
    return result;
  }
  for (const [sourceUnitId, value] of Object.entries(quiz)) {
    const location = legacyUnits.get(sourceUnitId);
    if (!location) {
      result.ignored.unknownUnitKeys++;
      continue;
    }
    if (!object(value)) {
      result.ignored.invalidEntries++;
      continue;
    }
    result.ignored.extraFields += Object.keys(value).filter((key) => key !== "done").length;
    if (!Object.hasOwn(value, "done") || !ntStudyDateSchema.safeParse(value.done).success) {
      result.ignored.invalidDone++;
      continue;
    }
    result.completions.push(ntLegacyCompletionSchema.parse({
      importId, sourceHash, sourceUnitId, ...location, completedAt: value.done,
    }));
  }
  return result;
}

/** Adds provenance without replacing active answers or completions; all conflicts fail atomically. */
export function appendLegacyNtCompletions(study: NtStudy, entries: readonly NtLegacyCompletion[]): boolean {
  const next = ntStudySchema.parse(study);
  const byOrigin = new Map(next.legacyCompletions.map((completion) => [
    `${completion.importId}:${completion.sourceUnitId}`, completion,
  ]));
  let changed = false;
  for (const entry of entries) {
    const completion = ntLegacyCompletionSchema.parse(entry);
    const key = `${completion.importId}:${completion.sourceUnitId}`;
    const current = byOrigin.get(key);
    if (current) {
      if (canonicalJson(current) !== canonicalJson(completion)) {
        throw new Error("Der historische NT-Status widerspricht derselben Einheit im Importbeleg.");
      }
      continue;
    }
    next.legacyCompletions.push(completion);
    byOrigin.set(key, completion);
    changed = true;
  }
  if (!changed) return false;
  const validated = ntStudySchema.parse(next);
  study.legacyCompletions = validated.legacyCompletions;
  return true;
}
