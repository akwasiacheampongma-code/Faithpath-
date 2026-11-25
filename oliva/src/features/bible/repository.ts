import raw from "../../data/bible.json";
import numbers from "../../data/edition-verse-index.json";
import catalog from "../../data/catalog.json";
import { BIBLE_EDITIONS, alternateEdition, type AlternateEdition, type BibleEdition } from "./editions";
import { withBookDisplayNames } from "./book-search";
import { findVerseMatches, type SearchHit, type VerseSearchFilter } from "./verse-search";

export type { SearchHit } from "./verse-search";

export type Verse = { n: number; text: string };
export type Reference = {
  book: string;
  chapter: number;
  edition?: AlternateEdition;
  from?: number;
  to?: number;
};
export const BOOKS = withBookDisplayNames(catalog);
type Corpus = Record<string, Record<string, Verse[]>>;
type AlternateText = {
  chapter: (book: string, chapter: number) => Verse[];
  notes?: (book: string, chapter: number) => readonly { after: number; text: string }[];
};
const bible = raw as Corpus;
const editionNumbers = numbers as Record<AlternateEdition, Record<string, (number | number[])[]>>;
const loaded: Partial<Record<AlternateEdition, AlternateText>> = {};
const pending: Partial<Record<AlternateEdition, Promise<void>>> = {};

export function isEditionLoaded(edition: BibleEdition) {
  return edition === "luther" || !!loaded[edition];
}

export function loadEdition(edition: BibleEdition): Promise<void> {
  if (edition === "luther" || loaded[edition]) return Promise.resolve();
  return pending[edition] ??= (edition === "otb"
    ? import("./open-bible-content").then(({ otbChapter }) => {
      loaded.otb = {
        chapter: (book, chapter) => otbChapter(book, chapter)?.verses ?? [],
        notes: (book, chapter) => otbChapter(book, chapter)?.notes ?? [],
      };
    })
    : import("../../data/schlachter-1951.json").then(({ default: content }) => {
      const corpus = content as Corpus;
      loaded.schlachter1951 = { chapter: (book, chapter) => corpus[book]?.[String(chapter)] ?? [] };
    })).finally(() => { delete pending[edition]; });
}

export const bookByCode = (code: string) => BOOKS.find((book) => book.code === code);

function chapterIndex(ref: Reference) {
  return ref.edition ? editionNumbers[ref.edition]?.[ref.book]?.[ref.chapter - 1] : undefined;
}

export function hasBibleVerse(ref: Reference, verse: number) {
  if (!Number.isInteger(verse) || verse < 1) return false;
  if (!ref.edition) return getChapter(ref.book, ref.chapter).some((entry) => entry.n === verse);
  const index = chapterIndex(ref);
  return typeof index === "number" ? verse <= index : !!index?.includes(verse);
}

export function getVerseNumbers(ref: Reference): number[] {
  const index = chapterIndex(ref);
  const values = ref.edition
    ? typeof index === "number" ? Array.from({ length: index }, (_, i) => i + 1) : index ?? []
    : getChapter(ref.book, ref.chapter).map((verse) => verse.n);
  return values.filter((number) => (ref.from === undefined || number >= ref.from) && (ref.to === undefined || number <= ref.to));
}

export function validReference(ref: Reference) {
  return (
    Number.isInteger(ref.chapter) && ref.chapter > 0 &&
    (ref.edition ? chapterIndex(ref) !== undefined : !!bible[ref.book]?.[String(ref.chapter)]) &&
    (ref.from === undefined || hasBibleVerse(ref, ref.from)) &&
    (ref.to === undefined || hasBibleVerse(ref, ref.to)) &&
    (ref.from === undefined || ref.to === undefined || ref.from <= ref.to)
  );
}

export function getChapter(book: string, chapter: number, edition?: BibleEdition) {
  if (!edition || edition === "luther") return bible[book]?.[String(chapter)] ?? [];
  return loaded[edition]?.chapter(book, chapter) ?? [];
}

export function chapterTextNotes(ref: Reference) {
  return ref.edition ? loaded[ref.edition]?.notes?.(ref.book, ref.chapter) ?? [] : [];
}

export function getPassage(ref: Reference) {
  return getChapter(ref.book, ref.chapter, ref.edition).filter(
    (v) => (!ref.from || v.n >= ref.from) && (!ref.to || v.n <= ref.to),
  );
}

export function referenceLabel(ref: Reference) {
  return `${bookByCode(ref.book)?.name ?? ref.book} ${ref.chapter}${ref.from ? `,${ref.from}${ref.to && ref.to !== ref.from ? `–${ref.to}` : ""}` : ""}`;
}

export function editionReferenceLabel(ref: Reference) {
  const title = referenceLabel(ref);
  return ref.edition ? `${title} · ${BIBLE_EDITIONS[ref.edition].name}` : title;
}

export function adjacentChapter(book: string, chapter: number, delta: -1 | 1, edition?: BibleEdition): Reference | null {
  const books = BOOKS;
  const i = books.findIndex((entry) => entry.code === book);
  const current = books[i];
  if (!current) return null;
  const translation = alternateEdition(edition);
  const origin = translation ? { edition: translation } : {};
  if (chapter + delta >= 1 && chapter + delta <= current.chapters)
    return { book, chapter: chapter + delta, ...origin };
  const next = books[i + delta];
  return next ? { book: next.code, chapter: delta === 1 ? 1 : next.chapters, ...origin } : null;
}

export function searchBible(query: string, limit = Infinity, filter: VerseSearchFilter = {}, edition: BibleEdition = "luther"): SearchHit[] {
  return findVerseMatches(query, BOOKS, (book, chapter) => getChapter(book, chapter, edition), limit, filter);
}
