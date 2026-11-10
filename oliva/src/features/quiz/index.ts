// Lightweight chapter/ID lookup for state validation; never loads question text.
import source from "../../data/nt-index.json";

export type NtBook = Readonly<{
  code: string;
  name: string;
  chapters: number;
  questions: number;
}>;
export type NtChapterIndex = Readonly<{
  key: string;
  book: string;
  chapter: number;
  legacyUnitId: number;
  title: string;
  questionCount: 5;
}>;
export type NtQuestionLocation = Readonly<{
  book: string;
  chapter: number;
  legacyUnitId: number;
  questionIndex: number;
}>;

export const NT_BOOKS: readonly NtBook[] = Object.freeze(
  source.books.map((book) => Object.freeze({ ...book })),
);
const chapters: readonly NtChapterIndex[] = Object.freeze(
  source.chapters.map((chapter) =>
    Object.freeze({ ...chapter, questionCount: 5 as const }),
  ),
);
const byChapter = new Map(chapters.map((chapter) => [chapter.key, chapter]));

export function ntChapterIndex(
  book: string,
  chapter: number,
): NtChapterIndex | null {
  if (!Number.isInteger(chapter)) return null;
  const value = byChapter.get(`${book}:${chapter}`);
  return value ? { ...value } : null;
}

export function ntQuestionLocation(id: string): NtQuestionLocation | null {
  if (id.length !== 7 || !/^FP-\d{4}$/.test(id)) return null;
  // The importer verifies all 1,300 IDs are contiguous in chapter/question order.
  const position = Number(id.slice(3)) - 261;
  if (position < 0 || position >= chapters.length * 5) return null;
  const chapter = chapters[Math.floor(position / 5)];
  if (!chapter) return null;
  return {
    book: chapter.book,
    chapter: chapter.chapter,
    legacyUnitId: chapter.legacyUnitId,
    questionIndex: position % 5,
  };
}
