import { z } from "zod";
import { editionReferenceSchema } from "../bible/schema";
import { getPassage, getVerseNumbers, validReference } from "../bible/repository";
import { passageKeyOf, verseKeyOf } from "../bible/reference-key";
import { storyCaptureSchema } from "../stories/schema";
import {
  captureSourceSchema as historicalCaptureSourceSchema,
  captureKey as historicalCaptureKey,
} from "./capture-schema";

// Keep the shipped capture graph unchanged for V1–V8. A range has its own
// source and key; a single verse keeps its original source and key forever.
const passageReferenceSchema = z
  .object({
    ...editionReferenceSchema.shape,
    from: z.number().int().positive(),
    to: z.number().int().positive(),
  })
  .strict()
  .refine(validReference, "Ungültige Bibelstelle")
  .refine(
    (ref) =>
      ref.from < ref.to &&
      (ref.edition ? getVerseNumbers(ref) : getPassage(ref)).length === ref.to - ref.from + 1,
    "Eine Bereichsnotiz benötigt mehrere zusammenhängende Verse",
  );

const [dailyCapture, experienceCapture, , guidedCapture] = historicalCaptureSourceSchema.options;

export const captureSourceSchema = z.discriminatedUnion("type", [
  dailyCapture,
  experienceCapture,
  z.object({
    type: z.literal("verse"),
    ref: editionReferenceSchema.refine(
      (ref) => ref.from !== undefined && ref.from === ref.to, "Ein Notizentwurf gehört zu genau einem Vers",
    ),
  }).strict(),
  guidedCapture,
  z
    .object({ type: z.literal("passage"), ref: passageReferenceSchema })
    .strict(),
  storyCaptureSchema,
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
  if (source.type === "story") return "capture:story:" + source.unitId + ":" + source.hash;
  if (source.type === "passage")
    return "capture:passage:" + passageKeyOf(source.ref, source.ref.from, source.ref.to);
  if (source.type === "verse") return "capture:verse:" + verseKeyOf(source.ref, source.ref.from!);
  return historicalCaptureKey(source);
}
