import { alternateEdition } from "./editions";
import type { Reference } from "./repository";

export function chapterKeyOf(ref: Reference): string {
  return `${ref.edition ? ref.edition + ":" : ""}${ref.book}:${ref.chapter}`;
}

export function verseKeyOf(ref: Reference, verse: number): string {
  return `${chapterKeyOf(ref)}:${verse}`;
}

export function passageKeyOf(ref: Reference, from: number, to: number): string {
  return `${chapterKeyOf(ref)}:${from}:${to}`;
}

export function splitBibleKey(key: string) {
  const [first, ...rest] = key.split(":");
  const edition = alternateEdition(first);
  const [book, chapter, from, to] = edition ? rest : [first, ...rest];
  return { ref: { book: book ?? "", chapter: Number(chapter), ...(edition ? { edition } : {}) }, from: Number(from), to: Number(to) };
}

export function sameBibleChapter(a: Reference, b: Reference) {
  return a.book === b.book && a.chapter === b.chapter && a.edition === b.edition;
}
