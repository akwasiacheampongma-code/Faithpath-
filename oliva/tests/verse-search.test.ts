import { describe, expect, it } from "vitest";
import { BOOKS, searchBible } from "../src/features/bible/repository";
import { searchOtb } from "../src/features/bible/open-bible-content";
import { verseHighlightPattern, verseSearchParts } from "../src/features/bible/verse-search";

describe("Volltextsuche", () => {
  it("berechnet sämtliche Luther-1912-Treffer aus dem Versbestand in kanonischer Reihenfolge", () => {
    const results = searchBible("  FRIEDE  ");
    expect(results).toHaveLength(267);
    expect(results[0]).toMatchObject({ book: "GEN", chapter: 15, verse: 15 });
    expect(results.at(-1)).toMatchObject({ book: "REV", chapter: 6, verse: 4 });
    expect(searchBible("Friede", 30)).toEqual(results.slice(0, 30));
  });

  it("grenzt die Suche auf Testamente und einzelne Bücher ein, getrennt nach Ausgabe", () => {
    const old = searchBible("Friede", Infinity, { testament: "AT" });
    const next = searchBible("Friede", Infinity, { testament: "NT" });
    expect(old.concat(next)).toEqual(searchBible("Friede"));
    expect(next.every((hit) => BOOKS.find((book) => book.code === hit.book)?.testament === "NT")).toBe(true);
    expect(searchBible("Friede", Infinity, { book: "PSA" })).toHaveLength(18);
    expect(searchOtb("Friede")).toHaveLength(383);
    expect(searchOtb("Friede", Infinity, { book: "PSA" })).toHaveLength(25);
    expect(searchOtb("Friede", Infinity, { book: "PSA", testament: "NT" })).toEqual([]);
    expect(searchBible("zzzzxq")).toEqual([]);
  });

  it("hebt Suchtext wortgetreu und ohne RegExp-Sonderzeichen als Operatoren hervor", () => {
    const original = "Friede, in Frieden. [Ja]";
    expect(verseSearchParts(original, verseHighlightPattern("FRIEDE [Ja]"))).toEqual([
      { text: "Friede", highlighted: true },
      { text: ", in ", highlighted: false },
      { text: "Friede", highlighted: true },
      { text: "n. ", highlighted: false },
      { text: "[Ja]", highlighted: true },
    ]);
    expect(verseSearchParts(original, verseHighlightPattern("kein Treffer"))).toEqual([{ text: original, highlighted: false }]);
  });
});
