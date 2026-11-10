// FaithPath content rights: ../../../content/faithpath-nt/RIGHTS.md.
import raw from "../../data/nt-catalog.json";
import type { NtQuestion } from "./schema";

export type { NtQuestion, NtQuestionSnapshot } from "./schema";
export type NtChapter = {
  key: string;
  book: string;
  chapter: number;
  legacyUnitId: number;
  title: string;
  referenceText: string;
  description: string;
  reflection: string;
  questions: NtQuestion[];
};

const chapters = raw.chapters as NtChapter[];
const byChapter = new Map(chapters.map((chapter) => [chapter.key, chapter]));
const byQuestion = new Map(
  chapters.flatMap((chapter) => chapter.questions.map((q) => [q.id, q] as const)),
);

function copyQuestion(question: NtQuestion): NtQuestion {
  return {
    ...question,
    options: [...question.options],
    referenceRanges: question.referenceRanges.map((reference) => ({ ...reference })),
  };
}

export function ntChapter(book: string, chapter: number): NtChapter | null {
  if (!Number.isInteger(chapter)) return null;
  const value = byChapter.get(`${book}:${chapter}`);
  return value
    ? { ...value, questions: value.questions.map(copyQuestion) }
    : null;
}

export function ntQuestion(id: string): NtQuestion | null {
  const value = byQuestion.get(id);
  return value ? copyQuestion(value) : null;
}
