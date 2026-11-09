import type { Reference, Verse } from "../repository";
import type { VerseFrame } from "../position";

/** UTF-16 offsets use the exact strings passed to the platform text renderer.
 * `start` includes the small verse number; `textStart` begins the Bible text.
 * The separating space after a verse is outside that verse's range. */
export type FlowVerse = Readonly<
  Verse & {
    key: string;
    ref: Reference;
    start: number;
    textStart: number;
    end: number;
  }
>;
export type FlowParagraph = Readonly<{
  key: string;
  scope: string;
  ref: Reference;
  text: string;
  verses: readonly FlowVerse[];
}>;
export type FlowTextLine = Readonly<{
  text: string;
  y: number;
  height: number;
}>;
export type FlowVerseFragment = Readonly<
  VerseFrame & {
    /** Exact character range intersecting this real platform line. */
    start: number;
    end: number;
    line: number;
  }
>;
export type FlowMeasuredLine = Readonly<
  FlowTextLine & {
    start: number;
    end: number;
  }
>;
export type FlowLineMeasurement = Readonly<{
  lines: readonly FlowMeasuredLine[];
  fragments: readonly FlowVerseFragment[];
  frames: readonly VerseFrame[];
}>;

const positiveInteger = (value: number) => Number.isInteger(value) && value > 0;
const sourceScope = (ref: Reference) =>
  `${ref.book}:${ref.chapter}:${ref.from ?? ""}:${ref.to ?? ""}`;

/** Five-verse groups reproduce a presentational rule, not literary paragraphs.
 * No source text, source array, progress field or position is changed. Gaps in
 * an explicitly supplied passage end a group rather than inventing its text. */
export function flowParagraphs(
  reference: Reference,
  verses: readonly Verse[],
  maxVerses = 5,
): FlowParagraph[] {
  if (
    !reference.book ||
    !positiveInteger(reference.chapter) ||
    (reference.from !== undefined && !positiveInteger(reference.from)) ||
    (reference.to !== undefined && !positiveInteger(reference.to)) ||
    (reference.from !== undefined &&
      reference.to !== undefined &&
      reference.from > reference.to) ||
    !Number.isInteger(maxVerses) ||
    maxVerses < 1 ||
    maxVerses > 5
  )
    throw new Error("Ungültiger Fließtextabschnitt.");
  let previous = 0;
  for (const verse of verses) {
    if (
      !positiveInteger(verse.n) ||
      verse.n <= previous ||
      typeof verse.text !== "string" ||
      (reference.from !== undefined && verse.n < reference.from) ||
      (reference.to !== undefined && verse.n > reference.to)
    )
      throw new Error("Verse und Fließtextabschnitt passen nicht zusammen.");
    previous = verse.n;
  }
  const groups: Verse[][] = [];
  for (const verse of verses) {
    let group = groups[groups.length - 1];
    if (
      !group ||
      group.length >= maxVerses ||
      group[group.length - 1]!.n + 1 !== verse.n
    ) {
      group = [];
      groups.push(group);
    }
    group.push(verse);
  }
  const scope = sourceScope(reference);
  return groups.map((group) => {
    let text = "";
    const ranges: FlowVerse[] = group.map((verse) => {
      if (text) text += " ";
      const start = text.length;
      const prefix = `${verse.n} `;
      text += prefix + verse.text;
      return {
        n: verse.n,
        text: verse.text,
        key: `${reference.book}:${reference.chapter}:${verse.n}`,
        ref: {
          book: reference.book,
          chapter: reference.chapter,
          from: verse.n,
          to: verse.n,
        },
        start,
        textStart: start + prefix.length,
        end: text.length,
      };
    });
    const from = group[0]!.n,
      to = group[group.length - 1]!.n;
    return {
      key: `${scope}:paragraph:${from}-${to}`,
      scope,
      ref: { book: reference.book, chapter: reference.chapter, from, to },
      text,
      verses: ranges,
    };
  });
}

const wrapWhitespace = (character: string | undefined) =>
  character !== undefined && /[ \t\r\n]/.test(character);
function splitsSurrogate(text: string, offset: number) {
  if (offset <= 0 || offset >= text.length) return false;
  const before = text.charCodeAt(offset - 1),
    after = text.charCodeAt(offset);
  return (
    before >= 0xd800 && before <= 0xdbff && after >= 0xdc00 && after <= 0xdfff
  );
}

/** Map actual native onTextLayout line text back to the exact rendered string.
 * Only known source wrapping whitespace may be omitted at line boundaries.
 * This does not normalize punctuation, ligatures, NBSP or arbitrary whitespace,
 * guess text widths, or seek past a missing word to a later repeated phrase.
 * Unusable/incomplete metrics return null for the entire paragraph so callers
 * can retain their existing measured reader instead of storing a guessed verse.
 * Passing this pure check is not a native layout/device verification. */
export function measureFlowLines(
  paragraph: FlowParagraph,
  measuredLines: readonly FlowTextLine[],
): FlowLineMeasurement | null {
  if (!measuredLines.length || !paragraph.verses.length) return null;
  const lines: FlowMeasuredLine[] = [],
    fragments: FlowVerseFragment[] = [];
  let cursor = 0,
    previousBottom = -Infinity;
  for (let index = 0; index < measuredLines.length; index++) {
    const line = measuredLines[index]!;
    if (
      typeof line.text !== "string" ||
      !line.text.length ||
      !Number.isFinite(line.y) ||
      line.y < 0 ||
      !Number.isFinite(line.height) ||
      line.height <= 0 ||
      !Number.isFinite(line.y + line.height) ||
      line.y < previousBottom - 0.01
    )
      return null;
    let start = cursor;
    while (
      !paragraph.text.startsWith(line.text, start) &&
      wrapWhitespace(paragraph.text[start])
    )
      start++;
    if (!paragraph.text.startsWith(line.text, start)) return null;
    const end = start + line.text.length;
    if (
      splitsSurrogate(paragraph.text, start) ||
      splitsSurrogate(paragraph.text, end)
    )
      return null;
    lines.push({ text: line.text, y: line.y, height: line.height, start, end });
    for (const verse of paragraph.verses) {
      const fragmentStart = Math.max(start, verse.start),
        fragmentEnd = Math.min(end, verse.end);
      if (fragmentStart < fragmentEnd)
        fragments.push({
          verse: verse.n,
          y: line.y,
          height: line.height,
          start: fragmentStart,
          end: fragmentEnd,
          line: index,
        });
    }
    cursor = end;
    previousBottom = line.y + line.height;
  }
  // A missing final word is never accepted as a truncated, yet usable, event.
  while (wrapWhitespace(paragraph.text[cursor])) cursor++;
  if (cursor !== paragraph.text.length) return null;
  const frames: VerseFrame[] = [];
  for (const verse of paragraph.verses) {
    const parts = fragments.filter((fragment) => fragment.verse === verse.n);
    if (!parts.length) return null;
    const y = parts[0]!.y,
      bottom = Math.max(...parts.map((part) => part.y + part.height));
    frames.push({ verse: verse.n, y, height: bottom - y });
  }
  return { lines, fragments, frames };
}

/** At a shared inline line, preserve its first visible canonical verse rather
 * than selecting the last verse that happens to begin on the same line.
 * Call with measured per-line fragments, not one bounding box per whole verse. */
export function flowVerseAtOffset(
  fragments: readonly Pick<FlowVerseFragment, "verse" | "y" | "height">[],
  offset: number,
): number | null {
  if (!Number.isFinite(offset)) return null;
  let top = -Infinity,
    verse: number | null = null;
  for (const fragment of fragments) {
    if (
      !positiveInteger(fragment.verse) ||
      !Number.isFinite(fragment.y) ||
      !Number.isFinite(fragment.height) ||
      fragment.height <= 0 ||
      fragment.y > offset
    )
      continue;
    if (fragment.y > top) {
      top = fragment.y;
      verse = fragment.verse;
    } else if (fragment.y === top && (verse === null || fragment.verse < verse))
      verse = fragment.verse;
  }
  return verse;
}
