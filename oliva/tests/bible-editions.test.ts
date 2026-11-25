import { describe, expect, it } from "vitest";
import { BIBLE_EDITIONS, readerRoute } from "../src/features/bible/editions";
import { BOOKS, getChapter, getVerseNumbers, loadEdition, searchBible, validReference, type Reference } from "../src/features/bible/repository";
import { passageKeyOf, splitBibleKey, verseKeyOf } from "../src/features/bible/reference-key";
import { sameReadingScope } from "../src/features/bible/position";
import { formatSelectedBibleCopy } from "../src/features/bible/selection";
import { captureKey } from "../src/features/personal/capture-schema-current";
import { applyNotebookEdit } from "../src/features/notebook/model";
import { bibleNoteParams, initialNotebookLink, linkDetails } from "../src/features/notebook/links";
import { captureSourceForReference } from "../src/features/personal/capture-model";
import { initialData, markRead, parseBackup, prepareEditionProfile, savedEditionReading } from "../src/state/model";

describe("Drei unabhängige Bibelausgaben", () => {
  it.each([["otb", 31103], ["schlachter1951", 31101]] as const)(
    "%s enthält alle Kapitel und prüft die jeweiligen Versnummern", async (edition, count) => {
      await loadEdition(edition);
      let verses = 0;
      for (const book of BOOKS) for (let chapter = 1; chapter <= book.chapters; chapter++) {
        const actual = getChapter(book.code, chapter, edition).map((verse) => verse.n);
        expect(actual).not.toHaveLength(0);
        expect(getVerseNumbers({ book: book.code, chapter, edition })).toEqual(actual);
        verses += actual.length;
      }
      expect(verses).toBe(count);
      const verse = searchBible("Friede", Infinity, { book: "PSA" }, edition)[0]!;
      expect(verse.text.toLowerCase()).toContain("friede");
      expect(formatSelectedBibleCopy({ book: verse.book, chapter: verse.chapter, edition }, [verse.verse]))
        .toContain(BIBLE_EDITIONS[edition].credit);
    },
    20_000,
  );

  it("bewahrt die ausgelassene Versnummer aus der Schlachter-Quelle", () => {
    expect(validReference({ book: "MAT", chapter: 21, from: 44 })).toBe(true);
    expect(validReference({ book: "MAT", chapter: 21, from: 44, edition: "schlachter1951" })).toBe(false);
  });

  it("hält persönliche Bezüge und Verszählung pro Ausgabe getrennt", () => {
    const luther = { book: "MRK", chapter: 4, from: 35, to: 36 };
    const reference: Reference = { ...luther, edition: "otb" };
    expect(sameReadingScope(luther, reference)).toBe(false);
    expect(captureKey(captureSourceForReference(luther))).toBe("capture:passage:MRK:4:35:36");
    expect(captureKey(captureSourceForReference(reference))).toBe("capture:passage:otb:MRK:4:35:36");
    expect(verseKeyOf(reference, 35)).toBe("otb:MRK:4:35");
    expect(splitBibleKey(passageKeyOf(reference, 35, 36))).toEqual({
      ref: { book: "MRK", chapter: 4, edition: "otb" }, from: 35, to: 36,
    });
    expect(readerRoute(reference).pathname).toBe("/offen/[book]");
  });

  it("erhält alte Sicherungen und nimmt eindeutige Ausgabedaten in das neue Format auf", () => {
    const original = initialData();
    original.bookmarks = ["MRK:4:35"];
    original.highlights["MRK:4:35"] = "olive";
    expect(parseBackup(JSON.stringify(original))).toEqual(original);
    const profile = structuredClone(original);
    const reference = { book: "MRK", chapter: 4, edition: "schlachter1951" } as const;
    profile.reading = reference;
    profile.readingPosition = { ref: reference, verse: 37, mode: "read" };
    profile.editionReading = { luther: { ref: original.reading, position: null } };
    markRead(profile, reference);
    profile.bookmarks.push(verseKeyOf(reference, 35));
    expect(() => parseBackup(JSON.stringify(profile))).toThrow();
    prepareEditionProfile(profile);
    expect(profile.version).toBe(13);
    expect(profile.bookmarks).toEqual(["MRK:4:35", "schlachter1951:MRK:4:35"]);
    expect(profile.readChapters).toEqual(["schlachter1951:MRK:4"]);
    expect(savedEditionReading(profile, "luther")?.ref).toEqual(original.reading);
    expect(parseBackup(JSON.stringify(profile))).toEqual(profile);
  });

  it("verknüpft eine freie Notiz mit der exakten Ausgabe und speichert sie im Backup", () => {
    const data = initialData();
    const ref = { book: "MRK", chapter: 4, from: 37, edition: "otb" } as const;
    const link = initialNotebookLink({ ...bibleNoteParams(ref), id: "notiz-otb", neu: "1" });
    expect(link).toEqual({ kind: "bible", ref });
    const saved = applyNotebookEdit(data, {
      targetId: "notiz-otb", copyId: "notiz-kopie", expectedStamp: null,
      updatedAt: "2026-11-25T00:00:00.000Z", text: "Ein Gedanke zur OTB.", link,
    });
    expect(saved.changed).toBe(true);
    expect(data.version).toBe(13);
    expect(linkDetails(link!).href).toEqual({
      pathname: "/offen/[book]", params: { book: "MRK", chapter: 4, from: 37 },
    });
    expect(parseBackup(JSON.stringify(data)).notebook?.[0]?.link).toEqual(link);
  });

});
