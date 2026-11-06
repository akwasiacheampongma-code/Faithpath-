import { z } from "zod";
import { referenceSchema } from "../bible/schema";
export const captureSourceSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("daily"),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      question: z.string().min(1).max(1000),
    })
    .strict(),
  z
    .object({
      type: z.literal("experience"),
      question: z.string().min(1).max(1000),
    })
    .strict(),
  z
    .object({
      type: z.literal("verse"),
      ref: referenceSchema.refine(
        (r) => r.from !== undefined && r.from === r.to,
        "Ein Notizentwurf gehört zu genau einem Vers",
      ),
    })
    .strict(),
  z
    .object({
      type: z.literal("guided"),
      pathId: z.string().min(1).max(100),
      step: z.number().int().min(0).max(100),
      snapshot: z
        .object({
          title: z.string().min(1).max(200),
          question: z.string().min(1).max(1000),
          explanation: z.string().min(1).max(10000),
          ref: referenceSchema,
        })
        .strict(),
    })
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
  switch (source.type) {
    case "daily":
      return "capture:daily";
    case "experience":
      return "capture:experience";
    case "verse":
      return `capture:verse:${source.ref.book}:${source.ref.chapter}:${source.ref.from}`;
    case "guided":
      return `capture:guided:${source.pathId}:${source.step}`;
  }
}
