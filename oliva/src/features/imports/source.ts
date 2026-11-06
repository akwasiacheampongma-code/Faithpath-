import { z } from "zod";
import { canonicalJson, sha256, utf8Length } from "../../lib/hash";
import { MAX_SOURCE_BYTES } from "./schema";
const identifier = z.union([
  z
    .string()
    .min(1)
    .max(1000)
    .refine((s) => !!s.trim()),
  z.number().finite(),
]);
const item = z.object({ id: identifier }).passthrough();
const reference = z
  .object({
    book: z.string().min(1).max(100),
    chapter: z.union([z.number(), z.string()]),
    from: z.union([z.number(), z.string()]).nullish(),
    to: z.union([z.number(), z.string()]).nullish(),
    translation: z.enum(["otb", "l1912"]).optional(),
  })
  .passthrough();
const linked = item.extend({
  pathIds: z.array(z.string().min(1).max(1000)).optional(),
  ref: reference.nullish(),
  date: z.string().optional(),
  updatedAt: z.string().optional(),
});
const thought = linked.extend({
  text: z.string().max(100000),
  reflectionId: identifier.nullish(),
  bibleNoteDeletedAt: z.string().optional(),
  type: z.string().optional(),
  subtype: z.string().optional(),
  label: z.string().optional(),
});
const step = item.extend({
  text: z.string().max(100000),
  done: z.boolean().optional(),
  createdAt: z.string().optional(),
  completedAt: z.string().nullish(),
});
const review = linked.extend({
  text: z.string().max(100000),
  sourceKey: z.string().optional(),
  pathId: identifier.optional(),
  confirmedDevelopment: z.boolean().optional(),
  sourceSnapshot: z.unknown().optional(),
});
const link = item.extend({
  journalId: identifier.optional(),
  entryId: identifier.optional(),
  reflectionId: identifier.optional(),
  ref: reference.nullish(),
});
const path = item.extend({
  title: z.string().min(1).max(100000),
  why: z.string().max(100000).optional(),
  category: z.string().optional(),
  started: z.string().optional(),
  archived: z.boolean().optional(),
  steps: z.array(step).max(10000).default([]),
  links: z.array(link).max(20000).default([]),
  reviews: z.array(review).max(10000).default([]),
  milestones: z
    .array(item.extend({ text: z.string().max(100000) }))
    .max(10000)
    .default([]),
});
const root = z
  .object({
    version: z.literal(5),
    translation: z.enum(["otb", "l1912"]).optional(),
    paths: z.array(path).max(10000),
    journal: z.array(thought).max(20000),
    highlights: z
      .array(
        item.extend({
          book: z.string(),
          chapter: z.union([z.string(), z.number()]),
          from: z.union([z.number(), z.string()]).nullish(),
          to: z.union([z.number(), z.string()]).nullish(),
          translation: z.enum(["otb", "l1912"]).optional(),
          color: z.string().optional(),
        }),
      )
      .max(40000),
    reflections: z.array(thought).max(20000).default([]),
    reviews: z.array(review).max(20000).default([]),
    events: z
      .array(
        item.extend({
          kind: z.string(),
          ref: reference.nullish(),
          at: z.string().optional(),
        }),
      )
      .max(50000)
      .default([]),
    reading: reference.nullish(),
    quiz: z.record(z.string(), z.unknown()).optional(),
    guidedPlans: z.record(z.string(), z.unknown()).optional(),
    settings: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();
export type FaithpathData = z.infer<typeof root>;
export type FaithpathThought = FaithpathData["journal"][number];
export function iso(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2}))?$/.test(
      value,
    ) ||
    !Number.isFinite(Date.parse(value))
  )
    return null;
  const day = value.slice(0, 10),
    utcDay = new Date(day + "T12:00:00Z").toISOString().slice(0, 10);
  if (day !== utcDay) return null;
  return new Date(value).toISOString();
}
function scan(value: unknown) {
  const queue = [{ v: value, depth: 0 }];
  let nodes = 0;
  while (queue.length) {
    const { v, depth } = queue.pop()!;
    if (++nodes > 200000 || depth > 40)
      throw new Error(
        "Die Sicherung ist zu komplex oder zu tief verschachtelt.",
      );
    if (v && typeof v === "object")
      for (const [k, item] of Object.entries(v)) {
        if (["__proto__", "constructor", "prototype"].includes(k))
          throw new Error("Die Sicherung enthält unzulässige Objektschlüssel.");
        queue.push({ v: item, depth: depth + 1 });
      }
  }
}
function unique(items: { id: string | number }[], label: string) {
  if (new Set(items.map((x) => String(x.id))).size !== items.length)
    throw new Error(
      `Doppelte IDs in ${label}. Die Datei muss zuerst in FaithPath geprüft werden.`,
    );
}
export function parseFaithpath(text: string) {
  if (!text.trim() || utf8Length(text) > MAX_SOURCE_BYTES)
    throw new Error("Bitte wähle eine FaithPath-JSON-Sicherung bis 10 MB.");
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    throw new Error("Die Datei enthält kein gültiges JSON.");
  }
  scan(input);
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Dies ist keine FaithPath-V5-Sicherung.");
  const envelope = input as Record<string, unknown>;
  let raw: unknown = input;
  const wrapped = "app" in envelope || "schemaVersion" in envelope;
  if (wrapped) {
    if (
      envelope.app !== "FaithPath" ||
      envelope.schemaVersion !== 5 ||
      !("data" in envelope)
    )
      throw new Error(
        "Erwartet wird eine FaithPath-Sicherung mit Datenschema 5.",
      );
    raw = envelope.data;
  }
  let data: FaithpathData;
  try {
    data = root.parse(raw);
  } catch {
    throw new Error(
      "Die V5-Sicherung enthält fehlende, ungültige oder zu große Datensätze. Der aktuelle OLIVA-Stand bleibt unverändert.",
    );
  }
  for (const key of [
    "paths",
    "journal",
    "reflections",
    "highlights",
    "reviews",
    "events",
  ] as const)
    unique(data[key], key);
  const paths = new Set(data.paths.map((x) => String(x.id))),
    journal = new Set(data.journal.map((x) => String(x.id))),
    reflections = new Set(data.reflections.map((x) => String(x.id)));
  for (const n of [...data.journal, ...data.reflections, ...data.highlights]) {
    if (
      n.pathIds !== undefined &&
      (!Array.isArray(n.pathIds) ||
        n.pathIds.some((p: unknown) => typeof p !== "string" || !p))
    )
      throw new Error("Ungültige Wegzuordnung.");
    for (const pid of (n.pathIds ?? []) as string[])
      if (!paths.has(pid))
        throw new Error("Eine Wegzuordnung verweist auf einen fehlenden Weg.");
  }
  for (const j of data.journal)
    if (j.reflectionId != null && !reflections.has(String(j.reflectionId)))
      throw new Error(
        "Ein Journaleintrag verweist auf eine fehlende Reflexion.",
      );
  for (const p of data.paths) {
    for (const k of ["steps", "links", "reviews", "milestones"] as const)
      unique(p[k], `Weg ${String(p.id)} / ${k}`);
    for (const l of p.links) {
      if (
        (l.journalId != null && !journal.has(String(l.journalId))) ||
        (l.entryId != null && !journal.has(String(l.entryId))) ||
        (l.reflectionId != null && !reflections.has(String(l.reflectionId)))
      )
        throw new Error(
          "Eine Wegverbindung verweist auf einen fehlenden Eintrag.",
        );
    }
  }
  const identity = { ...envelope };
  if (wrapped) delete identity.exported;
  return {
    data,
    fingerprint: sha256(canonicalJson(identity)),
    sourceHash: sha256(text),
    exported: typeof envelope.exported === "string" ? envelope.exported : null,
  };
}
