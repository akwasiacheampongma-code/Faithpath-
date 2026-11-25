import type { Reference } from "./repository";

export const ALTERNATE_EDITIONS = ["otb", "schlachter1951"] as const;
export type AlternateEdition = (typeof ALTERNATE_EDITIONS)[number];
export type BibleEdition = "luther" | AlternateEdition;

export const BIBLE_EDITIONS = {
  luther: {
    name: "Luther 1912",
    credit: "Lutherbibel 1912",
    licence: null,
    source: "https://ebible.org/bible/details.php?id=deu1912",
  },
  otb: {
    name: "Open Translation Bible",
    credit: "Open Translation Bible (OTB), Deutsch · © OpenBible · CC BY-SA 4.0",
    licence: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://github.com/OpenTranslationBible/open-bible/tree/31d411ac1c2d277242a3bd85697f354eaa11526b/lang/de-DE",
  },
  schlachter1951: {
    name: "Schlachter 1951",
    credit: "Schlachter 1951 · Franz Eugen Schlachter · © 1951 Genfer Bibelgesellschaft · Quelle eBible.org · CC BY 4.0",
    licence: "https://creativecommons.org/licenses/by/4.0/",
    source: "https://ebible.org/deu1951/copyright.htm",
  },
} as const;

export function alternateEdition(value: unknown): AlternateEdition | undefined {
  return ALTERNATE_EDITIONS.find((item) => item === value);
}

export function bibleEdition(value: unknown): BibleEdition {
  return alternateEdition(value) ?? "luther";
}

export function readerRoute<T extends Record<string, string | number | undefined> = Record<never, never>>(
  { book, chapter, from, to, edition }: Reference,
  extra?: T,
) {
  return {
    pathname: edition === "otb" ? "/offen/[book]" as const : "/lesen/[book]" as const,
    params: {
      book, chapter,
      ...(from === undefined ? {} : { from }),
      ...(to === undefined ? {} : { to }),
      ...(edition === "schlachter1951" ? { edition } : {}),
      ...extra,
    },
  };
}

export function editionChapterRoute(edition: BibleEdition, { book, chapter }: Reference) {
  // Different editions can number verses differently. Switch by chapter only.
  return readerRoute({ book, chapter, edition: alternateEdition(edition) });
}

export function editionCitation(edition?: AlternateEdition): string[] {
  const source = BIBLE_EDITIONS[bibleEdition(edition)];
  return source.licence ? [source.credit, source.source, source.licence] : [source.credit];
}
