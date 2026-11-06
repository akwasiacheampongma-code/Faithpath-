import { z } from "zod";
import {
  validReference,
  type Reference,
  getChapter,
} from "../features/bible/repository";
import { pathById } from "../features/paths/catalog";

import { referenceSchema as ref } from "../features/bible/schema";
import { goalSchema, draftSchema } from "../features/personal/schema";
import {
  originSchema,
  receiptSchema,
  MAX_BACKUP_BYTES,
} from "../features/imports/schema";
import { parseFaithpath } from "../features/imports/source";
import { highlightColor } from "../features/bible/highlights";
import { utf8Length } from "../lib/hash";
import { captureSourceSchema } from "../features/personal/capture-schema";
const chapterKey = z.string().refine((value) => {
  const [book, c] = value.split(":");
  return (
    !!book &&
    validReference({ book, chapter: Number(c) }) &&
    value === `${book}:${Number(c)}`
  );
});
const passageKey = z.string().refine((value) => {
  const [book, c, from, to] = value.split(":");
  return (
    !!book &&
    validReference({
      book,
      chapter: Number(c),
      from: Number(from),
      to: Number(to),
    }) &&
    value === `${book}:${Number(c)}:${Number(from)}:${Number(to)}`
  );
});
const verseKey = z.string().refine((value) => {
  const [b, c, v] = value.split(":");
  return (
    !!b &&
    getChapter(b, Number(c)).some((verse) => verse.n === Number(v)) &&
    value === `${b}:${Number(c)}:${Number(v)}`
  );
});
const stepKey = z.string().refine((value) => {
  const [id, n] = value.split(":");
  return (
    !!id && !!pathById(id)?.steps[Number(n)] && value === `${id}:${Number(n)}`
  );
});
const unique = <T>(items: T[]) => new Set(items).size === items.length;
export const noteSchema = z
  .object({
    id: z.string().min(1).max(100),
    text: z.string().trim().min(1).max(10000),
    kind: z.enum(["note", "reflection", "action"]),
    ref: ref.optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    origin: originSchema.optional(),
    goalIds: z
      .array(z.string().min(1).max(100))
      .max(500)
      .refine(unique)
      .optional(),
    captureSource: captureSourceSchema.optional(),
  })
  .strict();
const baseSchema = z
  .object({
    version: z.number().int(),
    revision: z.number().int().nonnegative(),
    name: z.string().max(60),
    onboarded: z.boolean(),
    reading: ref,
    readChapters: z.array(chapterKey).max(1189).refine(unique),
    readPassages: z.array(passageKey).max(5000).refine(unique),
    readSteps: z.array(stepKey).max(27).refine(unique),
    completedSteps: z.array(stepKey).max(27).refine(unique),
    activePath: z
      .string()
      .nullable()
      .refine((v) => v === null || !!pathById(v)),
    bookmarks: z.array(verseKey).max(31102).refine(unique),
    highlights: z.record(verseKey, highlightColor),
    notes: z
      .array(noteSchema)
      .max(5000)
      .refine((items) => unique(items.map((n) => n.id))),
    growthStage: z.number().int().min(0).max(6),
    settings: z
      .object({
        theme: z.enum(["light", "dark", "system"]),
        fontSize: z.number().int().min(18).max(30),
        lineHeight: z.number().min(1.4).max(2.2),
        reducedMotion: z.boolean(),
      })
      .strict(),
  })
  .strict();
const completeStepsValid = (d: {
  completedSteps: string[];
  readSteps: string[];
}) => d.completedSteps.every((key) => d.readSteps.includes(key));
export const legacyDataSchema = baseSchema
  .extend({ version: z.literal(1) })
  .refine(completeStepsValid, "Ungültiger Wegfortschritt");
const v2Fields = {
  goals: z
    .array(goalSchema)
    .max(500)
    .refine((items) => unique(items.map((g) => g.id))),
  drafts: z
    .array(draftSchema)
    .max(100)
    .refine(
      (items) =>
        unique(items.map((d) => d.key)) && unique(items.map((d) => d.id)),
    ),
};
export const v2DataSchema = baseSchema
  .extend({ version: z.literal(2), ...v2Fields })
  .refine(completeStepsValid);
export const v3DataSchema = baseSchema
  .extend({
    version: z.literal(3),
    ...v2Fields,
    imports: z
      .array(receiptSchema)
      .max(100)
      .refine((items) => unique(items.map((x) => x.id))),
  })
  .refine(completeStepsValid, "Ungültiger Wegfortschritt")
  .refine(
    (d) =>
      [...d.goals, ...d.notes].every(
        (x) => !x.origin || d.imports.some((r) => r.id === x.origin!.importId),
      ),
    "Importquelle fehlt",
  );
export const dataSchema = z
  .object({ ...v3DataSchema.shape, version: z.literal(4) })
  .strict()
  .refine(completeStepsValid, "Ungültiger Wegfortschritt")
  .refine(
    (d) =>
      [...d.goals, ...d.notes].every(
        (x) => !x.origin || d.imports.some((r) => r.id === x.origin!.importId),
      ),
    "Importquelle fehlt",
  );
export function decodeData(input: unknown): AppData {
  if (
    input &&
    typeof input === "object" &&
    "version" in input &&
    input.version === 1
  ) {
    const old = legacyDataSchema.parse(input);
    return dataSchema.parse({
      ...old,
      version: 4,
      goals: [],
      drafts: [],
      imports: [],
    });
  }
  if (
    input &&
    typeof input === "object" &&
    "version" in input &&
    input.version === 2
  ) {
    return dataSchema.parse({
      ...v2DataSchema.parse(input),
      version: 4,
      imports: [],
    });
  }
  const data =
    input &&
    typeof input === "object" &&
    "version" in input &&
    input.version === 3
      ? dataSchema.parse({ ...v3DataSchema.parse(input), version: 4 })
      : dataSchema.parse(input);
  for (const receipt of data.imports) {
    const parsed = parseFaithpath(receipt.sourceText);
    if (
      parsed.sourceHash !== receipt.sourceHash ||
      parsed.fingerprint !== receipt.fingerprint
    )
      throw new Error("Eine archivierte Importquelle ist beschädigt.");
  }
  return data;
}
export type AppData = z.infer<typeof dataSchema>;
export type Note = z.infer<typeof noteSchema>;
export const initialData = (): AppData => ({
  version: 4,
  imports: [],
  goals: [],
  drafts: [],
  revision: 0,
  name: "",
  onboarded: false,
  reading: { book: "MRK", chapter: 4 },
  readChapters: [],
  readPassages: [],
  readSteps: [],
  completedSteps: [],
  activePath: null,
  bookmarks: [],
  highlights: {},
  notes: [],
  growthStage: 0,
  settings: {
    theme: "light",
    fontSize: 20,
    lineHeight: 1.8,
    reducedMotion: false,
  },
});
export function chapterId(ref: Reference) {
  return `${ref.book}:${ref.chapter}`;
}
export function markRead(data: AppData, ref: Reference, step?: string) {
  if (!validReference(ref))
    throw new Error("Diese Bibelstelle ist nicht vorhanden.");
  if (step) {
    const [id, n] = step.split(":"),
      target = pathById(id ?? "")?.steps[Number(n)]?.ref;
    if (
      !target ||
      ["book", "chapter", "from", "to"].some(
        (k) => target[k as keyof Reference] !== ref[k as keyof Reference],
      )
    )
      throw new Error("Abschnitt und Wegschritt passen nicht zusammen.");
    if (!data.readSteps.includes(step)) data.readSteps.push(step);
  } else if (ref.from || ref.to) {
    const verses = getChapter(ref.book, ref.chapter),
      key = `${ref.book}:${ref.chapter}:${ref.from ?? verses[0]!.n}:${ref.to ?? verses[verses.length - 1]!.n}`;
    if (!data.readPassages.includes(key)) data.readPassages.push(key);
  } else if (!data.readChapters.includes(chapterId(ref)))
    data.readChapters.push(chapterId(ref));
}
export function finishStep(data: AppData, key: string) {
  if (!data.readSteps.includes(key))
    throw new Error("Lies zuerst den kurzen Bibelabschnitt.");
  if (!data.completedSteps.includes(key)) data.completedSteps.push(key);
}
export function grow(data: AppData) {
  const reads =
      data.readChapters.filter(
        (k) => !data.imports.some((i) => i.addedChapters.includes(k)),
      ).length +
      data.readSteps.length +
      data.readPassages.length,
    understood = data.completedSteps.length;
  const reviews = data.goals.flatMap((g) => g.reviews);
  const reflections =
      data.notes.filter((n) => n.kind === "reflection" && !n.origin).length +
      reviews.length,
    actions =
      data.notes.filter((n) => n.kind === "action" && !n.origin).length +
      reviews.filter((r) => r.applied).length;
  let next = reads > 0 ? 1 : 0;
  if (reads >= 2 && understood >= 1) next = 2;
  if (reads >= 4 && understood >= 2) next = 3;
  if (reads >= 7 && understood >= 3 && reflections >= 1) next = 4;
  if (reads >= 10 && understood >= 5 && reflections >= 2) next = 5;
  if (reads >= 14 && understood >= 7 && reflections >= 3 && actions >= 1)
    next = 6;
  data.growthStage = Math.max(data.growthStage, next);
}
export function parseBackup(text: string): AppData {
  if (utf8Length(text) > MAX_BACKUP_BYTES)
    throw new Error("Die Sicherung ist zu groß (maximal 64 MB).");
  try {
    return decodeData(JSON.parse(text));
  } catch {
    throw new Error(
      "Diese Datei ist keine gültige OLIVA-Sicherung. Deine bisherigen Daten bleiben erhalten.",
    );
  }
}
export function assertStorageBudget(data: AppData) {
  if (backupByteLength(data) > MAX_BACKUP_BYTES)
    throw new Error(
      "Der Datenstand überschreitet die Sicherungsgrenze von 64 MB. Exportiere zuerst deine bisherigen Daten. Es wurde nichts gespeichert.",
    );
}
// Source strings are immutable. Clone mutable metadata without repeatedly
// encoding and parsing the complete imported JSON files during text entry.
function skeleton(data: AppData) {
  return {
    ...data,
    imports: data.imports.map((r) => ({ ...r, sourceText: "" })),
  };
}
export function cloneData(data: AppData): AppData {
  const next = JSON.parse(JSON.stringify(skeleton(data))) as AppData;
  for (let i = 0; i < next.imports.length; i++)
    next.imports[i]!.sourceText = data.imports[i]!.sourceText;
  return next;
}
const sourceSizes = new Map<string, { text: string; bytes: number }>();
export function backupByteLength(data: AppData) {
  let total = utf8Length(JSON.stringify(skeleton(data), null, 2));
  const active = new Set<string>();
  for (const receipt of data.imports) {
    active.add(receipt.sourceHash);
    let item = sourceSizes.get(receipt.sourceHash);
    if (!item || item.text !== receipt.sourceText) {
      item = {
        text: receipt.sourceText,
        bytes: utf8Length(JSON.stringify(receipt.sourceText)) - 2,
      };
      sourceSizes.set(receipt.sourceHash, item);
    }
    total += item.bytes;
  }
  for (const key of sourceSizes.keys())
    if (!active.has(key)) sourceSizes.delete(key);
  return total;
}
export function countBookRead(data: AppData, code: string) {
  return data.readChapters.filter((key) => key.startsWith(code + ":")).length;
}
