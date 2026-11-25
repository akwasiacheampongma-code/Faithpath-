import { z } from "zod";
import { editionReferenceSchema } from "../bible/schema";
import { pathById } from "../paths/catalog";
import { storyById } from "../stories/index";
import type { AppData } from "../../state/model";
import { canonicalJson, sha256 } from "../../lib/hash";

export const NOTE_TEXT_LIMIT = 10000;
export const notebookId = z.string().max(100).regex(/^notiz-[a-zA-Z0-9_-]+$/);
const pathId = z.string().refine((value) => !!pathById(value));
const storyId = z.string().refine((value) => !!storyById(value));
const pathQuestion = z.object({
  kind: z.literal("path-question"), pathId, step: z.number().int().nonnegative(),
}).strict().refine((value) => !!pathById(value.pathId)?.steps[value.step]?.question);

export const notebookLinkSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("bible"), ref: editionReferenceSchema }).strict(),
  z.object({ kind: z.literal("path"), pathId }).strict(),
  z.object({ kind: z.literal("story"), storyId }).strict(),
  z.object({ kind: z.literal("daily-question") }).strict(),
  pathQuestion,
  z.object({ kind: z.literal("story-question"), storyId }).strict(),
]);
export type NotebookLink = z.infer<typeof notebookLinkSchema>;

const fields = z.object({
  text: z.string().max(NOTE_TEXT_LIMIT),
  link: notebookLinkSchema.nullable(),
});
export type NotebookContent = z.infer<typeof fields>;
const note = fields.extend({
  id: notebookId,
  revision: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  pinned: z.boolean(),
  deletedAt: z.iso.datetime().nullable(),
}).strict();
export type NotebookNote = z.infer<typeof note>;
export const notebookSchema = z.array(note).max(5000)
  .refine((notes) => new Set(notes.map((entry) => entry.id)).size === notes.length);

export const pendingNoteSchema = fields.extend({
  targetId: notebookId,
  copyId: notebookId,
  expectedStamp: z.string().regex(/^[0-9a-f]{64}$/).nullable(),
  updatedAt: z.iso.datetime(),
}).strict();
export type PendingNote = z.infer<typeof pendingNoteSchema>;
export type NoteAction = "pin" | "unpin" | "delete" | "restore" | "purge";

export function notebookText(text: string) {
  const [first = "", ...rest] = text.replace(/^\s*\n/, "").split(/\r?\n/);
  return { title: first.trim() || "Unbenannte Notiz", preview: rest.join(" ").trim() };
}

export function noteMatches(content: NotebookContent, other: NotebookContent) {
  return content.text === other.text && JSON.stringify(content.link) === JSON.stringify(other.link);
}

export function notebookStamp(entry: NotebookNote) {
  return sha256(canonicalJson(entry));
}

function saveNotebook(data: AppData, notes: NotebookNote[]) {
  if (data.version !== 13) data.version = 12;
  if (notes.some((note) => note.link?.kind === "bible" && note.link.ref.edition)) {
    data.version = 13;
    data.editionReading ??= {};
  }
  data.notebook = notes;
}

export function applyNotebookEdit(data: AppData, input: PendingNote) {
  const notes = data.notebook ?? [];
  const original = notes.find((entry) => entry.id === input.targetId);
  const conflict = original ? !!original.deletedAt || notebookStamp(original) !== input.expectedStamp : input.expectedStamp !== null;
  const { text, link, updatedAt } = input;
  if (original && !original.deletedAt && noteMatches(original, input))
    return { note: original, copied: false, changed: false };
  const targetId = conflict ? input.copyId : input.targetId;
  const existingCopy = conflict ? notes.find((entry) => entry.id === targetId) : undefined;
  if (existingCopy) {
    if (!existingCopy.deletedAt && noteMatches(existingCopy, input)) return { note: existingCopy, copied: true, changed: false };
    throw new Error("Die Notizkopie wurde bereits geändert. Deine Eingabe bleibt im Editor erhalten.");
  }
  const base = conflict ? undefined : original;
  if (!base && !text.trim() && !link) return { note: null, copied: false, changed: false };
  const next: NotebookNote = {
    id: targetId, revision: (base?.revision ?? 0) + 1,
    text, link, updatedAt, createdAt: base?.createdAt ?? updatedAt,
    pinned: base?.pinned ?? false, deletedAt: null,
  };
  saveNotebook(data, base ? notes.map((item) => item.id === base.id ? next : item) : [...notes, next]);
  return { note: next, copied: conflict, changed: true };
}

export function applyNotebookAction(data: AppData, id: string, expectedStamp: string, action: NoteAction, now: string) {
  const notes = data.notebook ?? [];
  const entry = notes.find((note) => note.id === id);
  if (!entry || notebookStamp(entry) !== expectedStamp)
    throw new Error("Die Notiz hat sich in einem anderen Fenster geändert. Öffne sie erneut.");
  if ((action === "restore" || action === "purge") !== !!entry.deletedAt)
    throw new Error("Der Status der Notiz hat sich geändert.");
  if (action === "purge") saveNotebook(data, notes.filter((note) => note.id !== id));
  else {
    const next = { ...entry, revision: entry.revision + 1 };
    if (action === "pin" || action === "unpin") next.pinned = action === "pin";
    if (action === "delete" || action === "restore") next.deletedAt = action === "delete" ? now : null;
    saveNotebook(data, notes.map((note) => note.id === id ? next : note));
  }
}
