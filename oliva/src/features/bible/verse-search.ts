import type { BibleScope } from "./book-search";
import type { Reference, Verse } from "./repository";

export type SearchHit = Reference & { verse: number; text: string };
export type VerseSearchFilter = { testament?: BibleScope; book?: string };

function searchTerms(query: string) {
  return [...new Set(query.toLocaleLowerCase("de").trim().split(/\s+/).filter(Boolean))];
}

export function findVerseMatches(
  query: string,
  books: readonly { code: string; chapters: number; testament: string }[],
  readChapter: (book: string, chapter: number) => readonly Verse[],
  limit: number,
  filter: VerseSearchFilter,
): SearchHit[] {
  const terms = searchTerms(query);
  if (!terms.length || limit <= 0) return [];
  const result: SearchHit[] = [];
  for (const book of books) {
    if (filter.book && book.code !== filter.book) continue;
    if (filter.testament && filter.testament !== "Alle" && book.testament !== filter.testament) continue;
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      for (const verse of readChapter(book.code, chapter)) {
        const lower = verse.text.toLocaleLowerCase("de");
        if (!terms.every((term) => lower.includes(term))) continue;
        result.push({ book: book.code, chapter, verse: verse.n, text: verse.text });
        if (result.length >= limit) return result;
      }
    }
  }
  return result;
}

export function verseHighlightPattern(query: string): RegExp | null {
  const terms = searchTerms(query).sort((a, b) => b.length - a.length);
  return terms.length ? new RegExp(terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "giu") : null;
}

export function verseSearchParts(text: string, pattern: RegExp | null) {
  if (!pattern) return [{ text, highlighted: false }];
  const parts: { text: string; highlighted: boolean }[] = [];
  let start = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > start) parts.push({ text: text.slice(start, match.index), highlighted: false });
    parts.push({ text: match[0], highlighted: true });
    start = match.index + match[0].length;
  }
  if (start < text.length) parts.push({ text: text.slice(start), highlighted: false });
  return parts;
}
