import { z } from "zod";
import { validReference } from "./repository";
export const referenceSchema = z
  .object({
    book: z.string(),
    chapter: z.number().int().positive(),
    from: z.number().int().positive().optional(),
    to: z.number().int().positive().optional(),
  })
  .strict()
  .refine(validReference, "Ungültige Bibelstelle");
