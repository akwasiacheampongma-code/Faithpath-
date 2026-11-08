import { z } from "zod";
import { referenceSchema } from "./schema";
import { getPassage, type Reference } from "./repository";

export const readingPositionSchema = z
  .object({
    ref: referenceSchema,
    verse: z.number().int().positive(),
    mode: z.enum(["read", "deep"]),
  })
  .strict()
  .refine(
    (p) => getPassage(p.ref).some((v) => v.n === p.verse),
    "Leseposition liegt außerhalb des Textabschnitts",
  );
export type ReadingPosition = z.infer<typeof readingPositionSchema>;
export const readingScope = (ref: Reference) =>
  `${ref.book}:${ref.chapter}:${ref.from ?? ""}:${ref.to ?? ""}`;
export function sameReadingScope(a: Reference, b: Reference) {
  return readingScope(a) === readingScope(b);
}
export function samePosition(
  a: ReadingPosition | null,
  b: ReadingPosition | null,
) {
  return (
    a === b ||
    (!!a &&
      !!b &&
      sameReadingScope(a.ref, b.ref) &&
      a.verse === b.verse &&
      a.mode === b.mode)
  );
}
export type VerseFrame = { verse: number; y: number; height: number };
// Introductory material does not move the last text anchor. Coordinates are
// transient layout measurements; only the canonical verse is stored.
export function verseAtOffset(
  frames: VerseFrame[],
  offset: number,
): number | null {
  const ordered = frames
    .filter((f) => f.height > 0 && Number.isFinite(f.y))
    .sort((a, b) => a.y - b.y);
  if (!Number.isFinite(offset) || !ordered.length || offset < ordered[0]!.y)
    return null;
  return ordered.findLast((f) => f.y <= offset)?.verse ?? null;
}
