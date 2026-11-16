import { describe, expect, it } from "vitest";
import {
  BOOKS,
  getChapter,
  getPassage,
  referenceLabel,
  type Reference,
} from "../src/features/bible/repository";
import {
  displayReference,
  formatBibleCopy,
  SELECTION_GAP_MESSAGE,
  SelectionError,
  selectionReference,
  toggleVerseSelection,
} from "../src/features/bible/selection";

const chapter = { book: "JHN", chapter: 6 };
const focus = { ...chapter, from: 35, to: 36 };

describe("Additive ephemere Readerauswahl", () => {
  it("schaltet genau einen Vers um und liefert sortierte neue Arrays ohne Eingabemutation", () => {
    const input = Object.freeze([36]);
    const forward = toggleVerseSelection(focus, [35], 36);
    const reverse = toggleVerseSelection(focus, input, 35);
    expect(forward).toEqual([35, 36]);
    expect(reverse).toEqual(forward);
    expect(input).toEqual([36]);
    expect(toggleVerseSelection(focus, reverse, 35)).toEqual([36]);
    expect(toggleVerseSelection(focus, [36], 36)).toEqual([]);
    expect(selectionReference(focus, reverse)).toEqual(focus);
    expect(selectionReference(focus, [36, 35])).toEqual(focus);
  });

  it("prüft das ganze Kapitel und erlaubt Kontextverse vor und hinter dem Fokus", () => {
    const logical = Object.freeze({
      book: "1SA",
      chapter: 17,
      from: 38,
      to: 45,
    });
    expect(displayReference(logical)).toEqual({ book: "1SA", chapter: 17 });
    expect(toggleVerseSelection(logical, [], 37)).toEqual([37]);
    expect(toggleVerseSelection(logical, [], 46)).toEqual([46]);
    expect(selectionReference(logical, [46, 45])).toEqual({
      book: "1SA",
      chapter: 17,
      from: 45,
      to: 46,
    });
    expect(logical).toEqual({ book: "1SA", chapter: 17, from: 38, to: 45 });
  });

  it("bewahrt Lücken sichtbar und verweigert die Bereichsreferenz ohne Zwischenverse einzufügen", () => {
    const selected = Object.freeze(toggleVerseSelection(focus, [35], 37));
    expect(selected).toEqual([35, 37]);
    try {
      selectionReference(focus, selected);
      throw new Error("Eine lückenhafte Auswahl darf keine Referenz ergeben.");
    } catch (error) {
      expect(error).toBeInstanceOf(SelectionError);
      expect(error).toMatchObject({
        code: "non-contiguous",
        message: SELECTION_GAP_MESSAGE,
      });
      expect((error as Error).message).toBe(
        "Bitte wähle zusammenhängende Verse aus.",
      );
    }
    expect(selected).toEqual([35, 37]);
    expect(
      selectionReference(focus, toggleVerseSelection(focus, selected, 36)),
    ).toEqual({ ...chapter, from: 35, to: 37 });
  });

  it("erhält den logischen Scope bei leerer Auswahl und teilt keine Referenzobjekte", () => {
    const empty = Object.freeze([]) as readonly number[];
    const result = selectionReference(focus, empty);
    expect(result).toEqual(focus);
    expect(result).not.toBe(focus);
    result.from = 1;
    expect(focus.from).toBe(35);
    const full = selectionReference(chapter, []);
    expect(full).toEqual(chapter);
    expect(full).not.toBe(chapter);
  });

  it("verwirft unbekannte, doppelte und kapitelübergreifende Versnummern atomar", () => {
    for (const selected of [
      [35, 35],
      [35, 0],
      [35, 72],
      [35, -1],
      [35, 1.5],
      [35, NaN],
      [35, Infinity],
    ]) {
      const frozen = Object.freeze(selected);
      expect(() => selectionReference(focus, frozen)).toThrow(SelectionError);
      expect(() => toggleVerseSelection(focus, frozen, 36)).toThrow(
        SelectionError,
      );
      expect(frozen).toEqual(selected);
    }
    // 48 exists in the following chapter, but is not a verse of John 5.
    expect(getChapter("JHN", 5).some((v) => v.n === 47)).toBe(true);
    expect(getChapter("JHN", 6).some((v) => v.n === 48)).toBe(true);
    expect(() =>
      toggleVerseSelection({ book: "JHN", chapter: 5 }, [35], 48),
    ).toThrow(SelectionError);
    const before = Object.freeze([35]);
    for (const verse of [0, -1, 72, 1.5, NaN, Infinity])
      expect(() => toggleVerseSelection(focus, before, verse)).toThrow(
        SelectionError,
      );
    expect(before).toEqual([35]);
  });

  it("lehnt unbekannte Bücher, Kapitel und fehlerhafte Fokusgrenzen vor jeder Aktion ab", () => {
    const invalid: Reference[] = [
      { book: "missing", chapter: 1 },
      { book: "__proto__", chapter: 1 },
      { ...chapter, chapter: 0 },
      { ...chapter, chapter: 7.5 },
      { ...chapter, chapter: Infinity },
      { ...chapter, from: 0 },
      { ...chapter, from: 72 },
      { ...chapter, from: 36, to: 35 },
      { ...chapter, to: NaN },
      { ...chapter, to: 72 },
    ];
    for (const reference of invalid) {
      expect(() => displayReference(reference)).toThrow(SelectionError);
      expect(() => selectionReference(reference, [])).toThrow(SelectionError);
      expect(() => toggleVerseSelection(reference, [], 35)).toThrow(
        SelectionError,
      );
      expect(() => formatBibleCopy(reference)).toThrow(SelectionError);
    }
  });

  it("sortiert Psalm 119 numerisch und bleibt auch an den Kapitelgrenzen exakt", () => {
    const psalm = { book: "PSA", chapter: 119, from: 9, to: 16 };
    const reverse = Object.freeze(
      Array.from({ length: 176 }, (_, i) => 176 - i),
    );
    expect(selectionReference(psalm, reverse)).toEqual({
      book: "PSA",
      chapter: 119,
      from: 1,
      to: 176,
    });
    expect(toggleVerseSelection(psalm, [10, 9], 11)).toEqual([9, 10, 11]);
    expect(selectionReference(psalm, [176])).toEqual({
      book: "PSA",
      chapter: 119,
      from: 176,
      to: 176,
    });
    expect(() => toggleVerseSelection(psalm, [176], 177)).toThrow(
      SelectionError,
    );
    expect(() =>
      selectionReference({ book: "PSA", chapter: 118 }, [176]),
    ).toThrow(SelectionError);
    expect(reverse[0]).toBe(176);
  });
});

describe("Unveränderter Bibeltext zum ausdrücklichen Kopieren", () => {
  it("liefert den belegten Aufbau mit En-Dash, Umlauten, daß und ausschließlich ausgewählten Versen", () => {
    const reference = selectionReference(focus, [36, 35]);
    expect(formatBibleCopy(reference)).toBe(
      "Johannes 6,35–36\n" +
        "35 Jesus aber sprach zu ihnen: Ich bin das Brot des Lebens. Wer zu mir kommt, den wird nicht hungern; und wer an mich glaubt, den wird nimmermehr dürsten.\n" +
        "36 Aber ich habe es euch gesagt, daß ihr mich gesehen habt, und glaubet doch nicht.\n" +
        "Lutherbibel 1912",
    );
    const single = formatBibleCopy(selectionReference(focus, [37]));
    expect(single.split("\n")).toEqual([
      "Johannes 6,37",
      `37 ${getChapter("JHN", 6).find((v) => v.n === 37)!.text}`,
      "Lutherbibel 1912",
    ]);
    expect(single.match(/Lutherbibel 1912/g)).toHaveLength(1);
  });

  it("benennt Vollkapitel und einseitige Grenzen passend zu den wirklich kopierten Versen", () => {
    const full = formatBibleCopy(chapter).split("\n");
    expect(full[0]).toBe("Johannes 6");
    expect(full).toHaveLength(getChapter("JHN", 6).length + 2);
    const from = formatBibleCopy({ ...chapter, from: 70 }).split("\n");
    expect(from[0]).toBe("Johannes 6,70–71");
    expect(from.slice(1, -1)).toEqual(
      getPassage({ ...chapter, from: 70 }).map((v) => `${v.n} ${v.text}`),
    );
    const to = formatBibleCopy({ ...chapter, to: 2 }).split("\n");
    expect(to[0]).toBe("Johannes 6,1–2");
    expect(to.slice(1, -1)).toEqual(
      getPassage({ ...chapter, to: 2 }).map((v) => `${v.n} ${v.text}`),
    );
  });

  it("bewahrt alle kanonischen UTF-16-Zeichen und LF-Grenzen der 31.102 Repoverse", () => {
    let count = 0;
    for (const book of BOOKS)
      for (
        let chapterNumber = 1;
        chapterNumber <= book.chapters;
        chapterNumber++
      ) {
        const reference = { book: book.code, chapter: chapterNumber };
        const source = getPassage(reference);
        const before = JSON.stringify(source);
        const body = source.map((v) => `${v.n} ${v.text}`).join("\n");
        const expected = `${referenceLabel(reference)}\n${body}\nLutherbibel 1912`;
        const copied = formatBibleCopy(reference);
        expect(copied).toBe(expected);
        expect(copied.length).toBe(expected.length);
        expect(JSON.stringify(source)).toBe(before);
        count += source.length;
      }
    expect(count).toBe(31102);
  });

  it("kopiert den langen Psalm vollständig sowie Randbereiche ohne Kapitelmischung", () => {
    const psalm = { book: "PSA", chapter: 119 };
    const complete = formatBibleCopy(
      selectionReference(
        psalm,
        Array.from({ length: 176 }, (_, i) => i + 1),
      ),
    );
    expect(complete.split("\n")).toHaveLength(178);
    expect(complete.startsWith("Psalmen 119,1–176\n1 ")).toBe(true);
    const tail = { ...psalm, from: 175, to: 176 };
    expect(formatBibleCopy(tail).split("\n").slice(1, -1)).toEqual(
      getPassage(tail).map((v) => `${v.n} ${v.text}`),
    );
  });
});

import {
  formatSelectedBibleCopy,
  selectedBibleLabel,
  selectedBibleVerses,
} from "../src/features/bible/selection";
describe("Explicit disjoint copy selection", () => {
  it("copies only selected verses and labels both contiguous groups without filling gaps", () => {
    const ref = { book: "JHN", chapter: 6 };
    const selection = Object.freeze([38, 35, 36]);
    expect(selectedBibleLabel(ref, selection)).toBe("Johannes 6,35–36.38");
    const expected = getChapter("JHN", 6).filter((v) =>
      [35, 36, 38].includes(v.n),
    );
    expect(selectedBibleVerses(ref, selection)).toEqual(expected);
    expect(formatSelectedBibleCopy(ref, selection)).toBe(
      [
        "Johannes 6,35–36.38",
        ...expected.map((v) => `${v.n} ${v.text}`),
        "Lutherbibel 1912",
      ].join("\n"),
    );
    for (const invalid of [[], [0], [72], [35, 35]])
      expect(() => formatSelectedBibleCopy(ref, invalid)).toThrow(
        SelectionError,
      );
  });
});
