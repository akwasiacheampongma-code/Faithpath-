import { BOOKS, bookByCode, type Reference } from "../bible/repository";

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
  if (book.code === "JHN") {
    return {
      book,
      title: book.sword,
      motif: "Quelle und Weinstock",
      explanation:
        "Johannes erzählt von Jesus als Leben und als Quelle lebendigen Wassers. Das Bild vom Weinstock beschreibt Verbundenheit. Der zarte Trieb am Buchschwert nimmt dieses Bild auf – als künstlerisches Symbol für Leben und Verstehen.",
      references: [
        {
          label: "Johannes 1,4 lesen",
          ref: { book: "JHN", chapter: 1, from: 4, to: 4 },
        },
        {
          label: "Johannes 4,14 lesen",
          ref: { book: "JHN", chapter: 4, from: 14, to: 14 },
        },
        {
          label: "Johannes 15,1–5 lesen",
          ref: { book: "JHN", chapter: 15, from: 1, to: 5 },
        },
      ],
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
