import raw from "../../data/open-bible-de.json";
import type { SearchHit, Verse } from "./repository";
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

export function searchOtb(query: string, limit = 60): SearchHit[] {
  const terms = query.toLocaleLowerCase("de").trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const result: SearchHit[] = [];
  for (const book of OTB_BOOKS)
    for (const [chapter, content] of Object.entries(bible[book.code] ?? {}))
      for (const verse of content.verses) {
        const text = verse.text.toLocaleLowerCase("de");
        if (!terms.every((term) => text.includes(term))) continue;
        result.push({ book: book.code, chapter: Number(chapter), verse: verse.n, text: verse.text });
        if (result.length >= limit) return result;
      }
  return result;
}
