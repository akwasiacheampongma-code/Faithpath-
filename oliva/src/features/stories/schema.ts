import { z } from "zod";
import { canonicalJson, sha256 } from "../../lib/hash";
import { referenceSchema } from "../bible/schema";
import { getPassage } from "../bible/repository";
import { storyById, storyQuestionLocation } from "./index";
export const storyIdSchema = z.string().refine((id) => !!storyById(id), "Unbekannter Originalabschnitt");
export const storyHashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const text = z.string().min(1).max(10000).refine((s) => !!s.trim());
export const storyReferenceSchema = z.object({
  ...referenceSchema.shape, from: z.number().int().positive(), to: z.number().int().positive(),
}).strict().refine((ref) => ref.from <= ref.to && getPassage(ref).length === ref.to - ref.from + 1, "Ungültiger Abschnitt");
// Bounded content fingerprint cache avoids rehashing every unchanged answer
// while the existing document store validates a new draft revision.
const hashes = new Map<string, string>();
export function storyFingerprint(value: unknown) {
  const canonical = canonicalJson(value);
  const known = hashes.get(canonical);
  if (known) return known;
  const hash = sha256(canonical);
  if (hashes.size >= 6000) hashes.delete(hashes.keys().next().value!);
  hashes.set(canonical, hash);
  return hash;
}
export const storyQuestionSchema = z.object({
  id: z.string().regex(/^(N|FP)-\d{4}$/),
  unitId: storyIdSchema,
  prompt: text, options: z.tuple([text, text, text, text]).refine((v) => new Set(v).size === 4),
  correctIndex: z.number().int().min(0).max(3),
  referenceLabel: text, references: z.array(storyReferenceSchema).min(1).max(10),
  explanation: text.nullable(), sourceQuestionIds: z.array(z.string().regex(/^(N|FP)-\d{4}$/)).min(1).max(2),
  hash: storyHashSchema,
}).strict().refine(({ hash, ...value }) =>
  storyQuestionLocation(value.id)?.unitId === value.unitId &&
  value.sourceQuestionIds[0] === value.id && storyFingerprint(value) === hash,
  "Frage, Originalquelle und Inhaltsfingerabdruck stimmen nicht überein");
export type StoryQuestion = z.infer<typeof storyQuestionSchema>;

export const storyCaptureSchema = z.object({
  type: z.literal("story"), unitId: storyIdSchema, hash: storyHashSchema,
  title: text, question: text,
  references: z.array(storyReferenceSchema).min(1).max(2),
}).strict();
export type StoryCaptureSource = z.infer<typeof storyCaptureSchema>;
