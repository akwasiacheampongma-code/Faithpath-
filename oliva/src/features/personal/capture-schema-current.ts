import { z } from "zod";
import { referenceSchema } from "../bible/schema";
import { getPassage, validReference } from "../bible/repository";
import {
  captureSourceSchema as historicalCaptureSourceSchema,
  captureKey as historicalCaptureKey,
} from "./capture-schema";

// Keep the shipped capture graph unchanged for V1–V8. A range has its own
// source and key; a single verse keeps its original source and key forever.
const passageReferenceSchema = z
  .object({
    ...referenceSchema.shape,
    from: z.number().int().positive(),
    to: z.number().int().positive(),
  })
  .strict()
  .refine(validReference, "Ungültige Bibelstelle")
  .refine(
    (ref) =>
      ref.from < ref.to &&
      getPassage(ref).length === ref.to - ref.from + 1,
    "Eine Bereichsnotiz benötigt mehrere zusammenhängende Verse",
  );

export const captureSourceSchema = z.discriminatedUnion("type", [
  ...historicalCaptureSourceSchema.options,
  z
    .object({ type: z.literal("passage"), ref: passageReferenceSchema })
    .strict(),
]);

export const captureValuesSchema = z
  .object({
    entityId: z.string().min(1).max(100),
    text: z.string().max(10000),
    source: captureSourceSchema,
  })
  .strict();

export type CaptureSource = z.infer<typeof captureSourceSchema>;
export function captureKey(source: CaptureSource) {
  if (source.type === "passage")
    return `capture:passage:${source.ref.book}:${source.ref.chapter}:${source.ref.from}:${source.ref.to}`;
  return historicalCaptureKey(source);
}
