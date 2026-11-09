import { describe, expect, it } from "vitest";
import {
  BOOKS,
  getChapter,
  getPassage,
  type Verse,
} from "../src/features/bible/repository";
import {
  flowParagraphs,
  flowVerseAtOffset,
  measureFlowLines,
  type FlowTextLine,
} from "../src/features/bible/flow/model";

const ref = { book: "JHN", chapter: 6 };
const verse = (n: number, text = `Worte zu Vers ${n}.`): Verse => ({ n, text });
const lines = (...texts: string[]): FlowTextLine[] =>
  texts.map((text, i) => ({ text, y: i * 24, height: 20 }));

describe("Kanonischer Fließtext ohne zweite Bibelkopie", () => {
  it("bewahrt alle 31.102 Verse, ihre Reihenfolge und sämtliche UTF-16-Textbereiche exakt", () => {
    let count = 0,
      chapters = 0;
    for (const book of BOOKS)
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        const source = getChapter(book.code, chapter),
          before = JSON.stringify(source);
        const paragraphs = flowParagraphs({ book: book.code, chapter }, source);
        expect(
          paragraphs.flatMap((p) =>
            p.verses.map((v) => ({ n: v.n, text: v.text })),
          ),
        ).toEqual(source);
        for (const paragraph of paragraphs) {
          expect(paragraph.verses.length).toBeGreaterThan(0);
          expect(paragraph.verses.length).toBeLessThanOrEqual(5);
          expect(paragraph.text).toBe(
            paragraph.verses.map((v) => `${v.n} ${v.text}`).join(" "),
          );
          for (const range of paragraph.verses) {
            expect(paragraph.text.slice(range.start, range.textStart)).toBe(
              `${range.n} `,
            );
            expect(paragraph.text.slice(range.textStart, range.end)).toBe(
              range.text,
            );
            expect(range.key).toBe(`${book.code}:${chapter}:${range.n}`);
            count++;
          }
        }
        expect(JSON.stringify(source)).toBe(before);
        chapters++;
      }
    expect(chapters).toBe(1189);
    expect(count).toBe(31102);
  });

  it("gruppiert 0/1/5/6 Verse und grenzt dünne oder ausdrücklich beschränkte Abschnitte ohne erfundene Verse ab", () => {
    expect(flowParagraphs(ref, [])).toEqual([]);
    for (const count of [1, 5, 6]) {
      const source = Array.from({ length: count }, (_, n) => verse(n + 1));
      expect(flowParagraphs(ref, source).map((p) => p.verses.length)).toEqual(
        count === 6 ? [5, 1] : [count],
      );
    }
    const partial = { ...ref, from: 35, to: 40 };
    const sparse = flowParagraphs(partial, [
      verse(35),
      verse(36),
      verse(38),
      verse(40),
    ]);
    expect(sparse.map((p) => p.ref)).toEqual([
      { ...ref, from: 35, to: 36 },
      { ...ref, from: 38, to: 38 },
      { ...ref, from: 40, to: 40 },
    ]);
    expect(sparse.map((p) => p.key)).toEqual([
      "JHN:6:35:40:paragraph:35-36",
      "JHN:6:35:40:paragraph:38-38",
      "JHN:6:35:40:paragraph:40-40",
    ]);
    expect(flowParagraphs(partial, [verse(35)])[0]!.key).not.toBe(
      flowParagraphs(ref, [verse(35)])[0]!.key,
    );
    expect(sparse[0]!.verses[0]!.ref).toEqual({ ...ref, from: 35, to: 35 });
    expect(
      flowParagraphs(
        ref,
        Array.from({ length: 6 }, (_, n) => verse(n + 1)),
        3,
      ).map((p) => p.verses.length),
    ).toEqual([3, 3]);
  });

  it("verwirft doppelte, umsortierte oder fremde Verse statt sie still zu reparieren", () => {
    for (const source of [
      [verse(2), verse(1)],
      [verse(1), verse(1)],
      [verse(0)],
      [verse(NaN)],
    ])
      expect(() => flowParagraphs(ref, source)).toThrow();
    expect(() =>
      flowParagraphs({ ...ref, from: 35, to: 40 }, [verse(34)]),
    ).toThrow();
    expect(() =>
      flowParagraphs({ ...ref, from: 35, to: 40 }, [verse(41)]),
    ).toThrow();
    for (const max of [0, 6, 1.5, NaN])
      expect(() => flowParagraphs(ref, [verse(1)], max)).toThrow();
    for (const invalid of [
      { ...ref, chapter: 0 },
      { ...ref, from: 6, to: 5 },
      { ...ref, to: Infinity },
      { ...ref, book: "" },
    ])
      expect(() => flowParagraphs(invalid, [])).toThrow();
  });

  it("leiht der Darstellung keine veränderbaren Quellobjekte oder Referenzen", () => {
    const source = [
      verse(35, "  Eigene Abstände bleiben.\nAuch eine neue Zeile.  "),
      verse(36, "🙂 Ä e\u0301"),
    ];
    const inputRef = { ...ref, from: 35, to: 36 },
      before = JSON.stringify({ inputRef, source });
    const result = flowParagraphs(inputRef, source);
    (result[0]!.verses[0] as any).text = "Nur eine Darstellungsänderung";
    result[0]!.verses[0]!.ref.from = 99;
    result[0]!.ref.to = 99;
    expect(JSON.stringify({ inputRef, source })).toBe(before);
    expect(result[0]!.verses[1]!.ref.from).toBe(36);
    expect(flowParagraphs(inputRef, source)[0]!.verses[0]!.text).toBe(
      source[0]!.text,
    );
  });
});

describe("Exakte Zeichenbereiche tatsächlicher Textzeilen", () => {
  it("ordnet wiederholte Worte, umgebrochene Verse und gemeinsam belegte Zeilen ohne findLast-Sprung zu", () => {
    const paragraph = flowParagraphs(ref, [
      verse(1, "Anfang Anfang 🙂"),
      verse(2, "Anfang Anfang."),
      verse(3, "Ende"),
    ])[0]!;
    const measured = measureFlowLines(
      paragraph,
      lines("1 Anfang", "Anfang 🙂 2 Anfang", "Anfang. 3 Ende"),
    )!;
    expect(measured).not.toBeNull();
    expect(measured.frames).toEqual([
      { verse: 1, y: 0, height: 44 },
      { verse: 2, y: 24, height: 44 },
      { verse: 3, y: 48, height: 20 },
    ]);
    expect(measured.fragments.map((f) => [f.line, f.verse])).toEqual([
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 3],
    ]);
    for (const line of measured.lines)
      expect(paragraph.text.slice(line.start, line.end)).toBe(line.text);
    expect(flowVerseAtOffset(measured.fragments, -1)).toBeNull();
    expect(flowVerseAtOffset(measured.fragments, 0)).toBe(1);
    expect(flowVerseAtOffset(measured.fragments, 24)).toBe(1);
    expect(flowVerseAtOffset(measured.fragments, 48)).toBe(2);
    expect(flowVerseAtOffset(measured.fragments, 1000)).toBe(2);
  });

  it("akzeptiert nur tatsächlich vorhandene ausgelassene ASCII-Umbruchabstände, Tabs und neue Zeilen", () => {
    const paragraph = flowParagraphs(ref, [
      verse(1, "Alpha\tBeta\nGamma "),
      verse(2, "Zwei\r\nZeilen"),
    ])[0]!;
    const before = JSON.stringify(paragraph);
    const trimmed = measureFlowLines(
      paragraph,
      lines("1 Alpha", "Beta", "Gamma", "2 Zwei", "Zeilen"),
    );
    expect(trimmed?.frames).toEqual([
      { verse: 1, y: 0, height: 68 },
      { verse: 2, y: 72, height: 44 },
    ]);
    expect(
      measureFlowLines(
        paragraph,
        lines("1 Alpha\tBeta\n", "Gamma  2 Zwei\r\n", "Zeilen"),
      ),
    ).not.toBeNull();
    expect(JSON.stringify(paragraph)).toBe(before);
  });

  it("bewahrt UTF-16 einschließlich Surrogatpaaren und lehnt eine Grenze mitten im Paar ab", () => {
    const paragraph = flowParagraphs(ref, [
      verse(35, "🙂 e\u0301 Ä"),
      verse(36, "Weiter"),
    ])[0]!;
    const emoji = paragraph.text.indexOf("🙂");
    expect(paragraph.verses[0]!.end - paragraph.verses[0]!.textStart).toBe(
      "🙂 e\u0301 Ä".length,
    );
    const intact = measureFlowLines(
      paragraph,
      lines(paragraph.text.slice(0, emoji), paragraph.text.slice(emoji)),
    );
    expect(intact?.lines[1]!.start).toBe(emoji);
    expect(
      measureFlowLines(
        paragraph,
        lines(
          paragraph.text.slice(0, emoji + 1),
          paragraph.text.slice(emoji + 1),
        ),
      ),
    ).toBeNull();
    expect(intact?.fragments.find((f) => f.verse === 36)!.start).toBe(
      paragraph.verses[1]!.start,
    );
  });

  it("gibt bei fehlendem Text, fremden Zeichen oder unvollständigen Ereignissen keinerlei Teilmessung zurück", () => {
    const paragraph = flowParagraphs(ref, [
      verse(1, "Erstes Wort."),
      verse(2, "Zweites Wort."),
    ])[0]!;
    const invalid = [
      [],
      lines("1 Erstes"),
      lines("1 Wort. 2 Zweites Wort."),
      lines("1 Erstes Wort.", "2 Anderes Wort."),
      lines(" " + paragraph.text),
      lines(paragraph.text + " "),
      lines(paragraph.text + "\n"),
      lines("1 Erstes Wort.", "2 Zweites Wort.", "2 Zweites Wort."),
      lines("1 Erstes Wort.", "", "2 Zweites Wort."),
    ];
    const bytes = JSON.stringify(paragraph);
    for (const event of invalid)
      expect(measureFlowLines(paragraph, event)).toBeNull();
    const nbsp = flowParagraphs(ref, [verse(1, "Alpha\u00a0Beta")])[0]!;
    expect(measureFlowLines(nbsp, lines("1 Alpha", "Beta"))).toBeNull();
    const ligature = flowParagraphs(ref, [verse(1, "Schifffahrt")])[0]!;
    expect(measureFlowLines(ligature, lines("1 Schiﬀfahrt"))).toBeNull();
    expect(JSON.stringify(paragraph)).toBe(bytes);
  });

  it("lehnt nicht endliche, unsortierte, leere und überlappende Zeilenmetriken ab", () => {
    const paragraph = flowParagraphs(ref, [
      verse(1, "Alpha"),
      verse(2, "Beta"),
    ])[0]!;
    for (const event of [
      [{ text: paragraph.text, y: NaN, height: 20 }],
      [{ text: paragraph.text, y: Infinity, height: 20 }],
      [{ text: paragraph.text, y: -1, height: 20 }],
      [{ text: paragraph.text, y: 0, height: 0 }],
      [{ text: paragraph.text, y: 0, height: Infinity }],
      [{ text: paragraph.text, y: 0, height: NaN }],
      [{ text: paragraph.text, y: Number.MAX_VALUE, height: Number.MAX_VALUE }],
      [
        { text: "1 Alpha", y: 24, height: 20 },
        { text: "2 Beta", y: 0, height: 20 },
      ],
      [
        { text: "1 Alpha", y: 0, height: 20 },
        { text: "2 Beta", y: 19, height: 20 },
      ],
      [
        { text: "1 Alpha", y: 0, height: 20 },
        { text: "2 Beta", y: 0, height: 20 },
      ],
    ])
      expect(measureFlowLines(paragraph, event)).toBeNull();
  });

  it("liefert für den langen Psalm 119 alle 176 Verse mit vollständigen, unabhängigen Messungen", () => {
    const reference = { book: "PSA", chapter: 119 },
      source = getPassage(reference),
      before = JSON.stringify(source);
    const paragraphs = flowParagraphs(reference, source);
    expect(paragraphs).toHaveLength(36);
    let measuredVerses = 0;
    for (const paragraph of paragraphs) {
      // Synthetic complete line events exercise the pure mapper; no native
      // font/device behavior is inferred from these deterministic strings.
      const pieces = Array.from(
        { length: Math.ceil(paragraph.text.length / 51) },
        (_, i) => paragraph.text.slice(i * 51, (i + 1) * 51),
      );
      const measurement = measureFlowLines(paragraph, lines(...pieces))!;
      expect(measurement).not.toBeNull();
      expect(measurement.frames.map((frame) => frame.verse)).toEqual(
        paragraph.verses.map((v) => v.n),
      );
      expect(flowVerseAtOffset(measurement.fragments, 0)).toBe(
        paragraph.verses[0]!.n,
      );
      measuredVerses += measurement.frames.length;
    }
    expect(measuredVerses).toBe(176);
    expect(JSON.stringify(source)).toBe(before);
  });
});

describe("Sichtbarer Inlineanker", () => {
  it("wählt unabhängig von Eingabereihenfolge den ersten sichtbaren Vers derselben Zeile", () => {
    const fragments = [
      { verse: 40, y: 100, height: 20 },
      { verse: 35, y: 0, height: 20 },
      { verse: 36, y: 20, height: 20 },
      { verse: 35, y: 20, height: 20 },
      { verse: 38, y: 100, height: 20 },
      { verse: 39, y: 100, height: 20 },
    ];
    expect(flowVerseAtOffset(fragments, 20)).toBe(35);
    expect(flowVerseAtOffset([...fragments].reverse(), 100)).toBe(38);
    expect(flowVerseAtOffset(fragments, 19.999)).toBe(35);
    expect(flowVerseAtOffset(fragments, 99.999)).toBe(35);
    expect(flowVerseAtOffset(fragments, NaN)).toBeNull();
    expect(flowVerseAtOffset(fragments, Infinity)).toBeNull();
    expect(flowVerseAtOffset([], 1)).toBeNull();
    expect(
      flowVerseAtOffset(
        [
          { verse: 1, y: 0, height: 0 },
          { verse: 2, y: NaN, height: 20 },
        ],
        10,
      ),
    ).toBeNull();
  });
});
