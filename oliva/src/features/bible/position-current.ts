import { z } from "zod";
import { referenceSchema } from "./schema";
import { getChapter } from "./repository";

// The logical section remains part of the persisted scope. The visible text
// is its whole chapter, so the last canonical anchor can lie outside the focus.
export const readingPositionSchema = z
  .object({
    ref: referenceSchema,
    verse: z.number().int().positive(),
    mode: z.enum(["read", "deep"]),
  })
  .strict()
  .refine(
    (position) =>
      getChapter(position.ref.book, position.ref.chapter).some(
        (verse) => verse.n === position.verse,
      ),
    "Leseposition liegt außerhalb des Kapitels",
  );

export type ReadingPosition = z.infer<typeof readingPositionSchema>;
export {
  readingScope,
  sameReadingScope,
  samePosition,
  verseAtOffset,
  type VerseFrame,
} from "./position";
