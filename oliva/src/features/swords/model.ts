import { BOOKS, bookByCode, type Reference } from "../bible/repository";

import { swordIllustration } from "./illustrations";

type Book = (typeof BOOKS)[number];
export type SwordIdentity = {
  book: Book;
  title: string;
  motif: string;
  explanation: string;
  references: { label: string; ref: Reference }[];
  illustrated: boolean;
};

export function normalizeSwordProgress(progress: number): number {
  return Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
}

/** Editorial symbols, never a claim that a biblical book describes this sword. */
export function swordIdentity(code: string): SwordIdentity | null {
  const book = bookByCode(code);
  if (!book) return null;
  const illustration = swordIllustration(book.code);
  if (illustration) {
    return {
      book,
      title: book.sword,
      motif: illustration.motif,
      explanation: illustration.explanation,
      references: illustration.references.map((reference) => ({
        label: reference.label,
        ref: { ...reference.ref },
      })),
      illustrated: true,
    };
  }
  return {
    book,
    title: book.sword,
    motif: book.motif,
    explanation: book.description,
    references: [],
    illustrated: false,
  };
}

export function bookJourney(
  data: { readChapters: readonly string[]; reading: Reference },
  code: string,
) {
  const identity = swordIdentity(code);
  if (!identity) return null;
  const { book } = identity,
    confirmed = new Set(data.readChapters);
  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);
  const readChapters = chapters.filter((n) => confirmed.has(`${code}:${n}`));
  const current =
    data.reading.book === code &&
    Number.isInteger(data.reading.chapter) &&
    data.reading.chapter > 0 &&
    data.reading.chapter <= book.chapters
      ? data.reading.chapter
      : 1;
  // Preserve a genuinely unfinished chapter. After confirmation, suggest the
  // next unread chapter in book order; never confirm a chapter by visiting here.
  const ordered = [
    ...chapters.slice(current - 1),
    ...chapters.slice(0, current - 1),
  ];
  const nextChapter =
    ordered.find((n) => !confirmed.has(`${code}:${n}`)) ?? current;
  return {
    identity,
    readChapters,
    readCount: readChapters.length,
    progress: normalizeSwordProgress(readChapters.length / book.chapters),
    nextChapter,
  };
}
