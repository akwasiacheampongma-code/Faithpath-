import raw from "../../data/open-bible-de.json";
import type { Verse } from "./repository";
import { findVerseMatches, type SearchHit, type VerseSearchFilter } from "./verse-search";
import { OTB_BOOKS, otbBook } from "./open-bible";

type Chapter = { verses: Verse[]; notes: { after: number; text: string }[] };
const bible = raw as Record<string, Record<string, Chapter>>;

export function otbChapter(book: string, chapter: number) {
  return Number.isInteger(chapter) ? bible[book]?.[String(chapter)] : undefined;
}

export function adjacentOtbChapter(book: string, chapter: number, delta: -1 | 1) {
  const current = otbBook(book);
  if (!current) return null;
  const next = chapter + delta;
  if (next > 0 && next <= current.chapters) return { book, chapter: next };
  const neighbor = OTB_BOOKS[OTB_BOOKS.indexOf(current) + delta];
  return neighbor ? { book: neighbor.code, chapter: delta > 0 ? 1 : neighbor.chapters } : null;
}

export function searchOtb(query: string, limit = Infinity, filter: VerseSearchFilter = {}): SearchHit[] {
  return findVerseMatches(query, OTB_BOOKS, (book, chapter) => otbChapter(book, chapter)?.verses ?? [], limit, filter);
}
