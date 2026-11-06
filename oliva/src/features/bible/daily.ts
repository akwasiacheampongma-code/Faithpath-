import { getPassage, type Reference } from "./repository";
const verses: Reference[] = [
  { book: "JHN", chapter: 14, from: 27, to: 27 },
  { book: "PSA", chapter: 23, from: 1, to: 1 },
  { book: "MRK", chapter: 4, from: 39, to: 39 },
  { book: "EPH", chapter: 2, from: 8, to: 8 },
  { book: "MAT", chapter: 6, from: 11, to: 11 },
];
export function dailyVerse(date = new Date()) {
  const day = Math.floor(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
    ),
    ref = verses[((day % verses.length) + verses.length) % verses.length]!;
  return { ref, text: getPassage(ref)[0]!.text };
}
