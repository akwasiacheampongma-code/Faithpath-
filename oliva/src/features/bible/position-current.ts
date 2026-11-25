import { z } from "zod";
import { editionReferenceSchema, referenceSchema } from "./schema";
import { hasBibleVerse } from "./repository";

const positionFields = {
  verse: z.number().int().positive(),
  mode: z.enum(["read", "deep"]),
};

// The saved scope can be a short reading with an anchor in its whole chapter.
export const lutherReadingPositionSchema = z.object({ ref: referenceSchema, ...positionFields })
  .strict().refine((position) => hasBibleVerse(position.ref, position.verse), "Leseposition liegt außerhalb des Kapitels");

export const readingPositionSchema = z.object({ ref: editionReferenceSchema, ...positionFields })
  .strict().refine((position) => hasBibleVerse(position.ref, position.verse), "Leseposition liegt außerhalb des Kapitels");

export type ReadingPosition = z.infer<typeof readingPositionSchema>;
export {
  readingScope,
  sameReadingScope,
  samePosition,
  verseAtOffset,
  type VerseFrame,
} from "./position";
