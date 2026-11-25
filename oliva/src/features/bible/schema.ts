import { z } from "zod";
import { ALTERNATE_EDITIONS } from "./editions";
import { validReference } from "./repository";

const referenceFields = {
  book: z.string(),
  chapter: z.number().int().positive(),
  from: z.number().int().positive().optional(),
  to: z.number().int().positive().optional(),
};

export const referenceSchema = z.object(referenceFields).strict()
  .refine(validReference, "Ungültige Bibelstelle");

export const editionReferenceSchema = z.object({
  ...referenceFields,
  edition: z.enum(ALTERNATE_EDITIONS).optional(),
}).strict().refine(validReference, "Ungültige Bibelstelle");
