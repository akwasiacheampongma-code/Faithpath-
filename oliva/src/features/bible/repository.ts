import raw from "../../data/bible.json";
import catalog from "../../data/catalog.json";
import { withBookDisplayNames } from "./book-search";
import { findVerseMatches, type SearchHit, type VerseSearchFilter } from "./verse-search";

export type { SearchHit } from "./verse-search";

export type Verse = { n: number; text: string };
export type Reference = {
  book: string;
  chapter: number;
  from?: number;
  to?: number;
};
export const BOOKS = withBookDisplayNames(catalog);
const bible = raw as Record<string, Record<string, Verse[]>>;
export const bookByCode = (code: string) =>
  BOOKS.find((book) => book.code === code);
export function validReference(ref: Reference) {
  const verses = bible[ref.book]?.[String(ref.chapter)];
  return (
    Number.isInteger(ref.chapter) &&
    !!verses &&
    (ref.from === undefined || verses.some((v) => v.n === ref.from)) &&
    (ref.to === undefined || verses.some((v) => v.n === ref.to)) &&
    (ref.from === undefined || ref.to === undefined || ref.from <= ref.to)
  );
}
export function getChapter(book: string, chapter: number) {
  return bible[book]?.[String(chapter)] ?? [];
}
export function getPassage(ref: Reference) {
  return getChapter(ref.book, ref.chapter).filter(
    (v) => (!ref.from || v.n >= ref.from) && (!ref.to || v.n <= ref.to),
  );
}
export function referenceLabel(ref: Reference) {
  return `${bookByCode(ref.book)?.name ?? ref.book} ${ref.chapter}${ref.from ? `,${ref.from}${ref.to && ref.to !== ref.from ? `–${ref.to}` : ""}` : ""}`;
}
export function adjacentChapter(
  book: string,
  chapter: number,
  delta: -1 | 1,
): Reference | null {
  const i = BOOKS.findIndex((b) => b.code === book);
  const current = BOOKS[i];
  if (!current) return null;
  if (chapter + delta >= 1 && chapter + delta <= current.chapters)
    return { book, chapter: chapter + delta };
  const next = BOOKS[i + delta];
  return next
    ? { book: next.code, chapter: delta === 1 ? 1 : next.chapters }
    : null;
}
export function searchBible(query: string, limit = Infinity, filter: VerseSearchFilter = {}): SearchHit[] {
  return findVerseMatches(query, BOOKS, getChapter, limit, filter);
}
