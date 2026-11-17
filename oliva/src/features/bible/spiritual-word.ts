import { getPassage } from "./repository";

export const WORD_REFERENCE = { book: "EPH", chapter: 6, from: 17, to: 17 } as const;
export const WORD_CONTEXT = { book: "EPH", chapter: 6, from: 10, to: 18 } as const;
export const WORD_SOURCE_VERSE = getPassage(WORD_REFERENCE)[0]!.text;
const excerpt = "und das Schwert des Geistes, welches ist das Wort Gottes.";
if (!WORD_SOURCE_VERSE.endsWith(excerpt))
  throw new Error("Der Epheser-Auszug stimmt nicht mit dem integrierten Bibeltext überein.");
export const WORD_EXCERPT = `… ${WORD_SOURCE_VERSE.slice(WORD_SOURCE_VERSE.indexOf(excerpt))}`;
export const WORD_OLIVA_CONTEXT =
  "Gottes Wort kann uns Orientierung, Halt und Stärke schenken – im Alltag und in schweren Zeiten.";
