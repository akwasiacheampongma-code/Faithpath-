import type { Note } from "../../state/model";
import { referenceLabel } from "../bible/repository";
import { linkDetails } from "../notebook/links";
import type { NotebookNote, PendingNote } from "../notebook/model";
import type { Draft } from "./schema";

export const collectionSections = ["Gedanken", "Entwürfe", "Lesezeichen", "Markierungen"] as const;
export type CollectionSection = (typeof collectionSections)[number];

export function normalizeCollectionText(text: string) {
  return text.normalize("NFKC").toLocaleLowerCase("de").replace(/\s+/g, " ").trim();
}

function legacyNoteContext(note: Note) {
  const source = note.captureSource;
  if (note.ref) return referenceLabel(note.ref);
  if (source?.type === "story") return source.title;
  if (source?.type === "guided") return source.snapshot.title;
  return note.origin?.referenceLabel;
}

type CollectionRow = {
  id: string;
  type: "legacy" | "notebook";
  text: string;
  updatedAt: string;
  pinned: boolean;
  context?: string;
  pending?: boolean;
};

/** A display list only. Storage IDs continue to belong to their original model. */
export function collectionRows(
  notes: readonly Note[],
  notebook: readonly NotebookNote[],
  edits: Record<string, PendingNote>,
  drafts: readonly Draft[],
  held: readonly { draft: Draft; pending: boolean }[],
  query: string,
) {
  const active = notebook.filter((note) => !note.deletedAt);
  const activeIds = new Set(active.map(({ id }) => id));
  const needle = normalizeCollectionText(query);
  const legacyEdits = new Map<string, { text: string; updatedAt: string; pending: boolean }>();
  for (const { draft, pending } of [...drafts.map((draft) => ({ draft, pending: false })), ...held]) {
    if (draft.type === "journal" && draft.values.targetId) {
      legacyEdits.set(draft.values.targetId, { text: draft.values.text, updatedAt: draft.updatedAt, pending });
    }
  }
  function notebookRow(id: string, entry: NotebookNote | PendingNote, pinned: boolean, pending: boolean): CollectionRow {
    return { id, type: "notebook", text: entry.text, updatedAt: entry.updatedAt, pinned, pending,
      context: entry.link ? linkDetails(entry.link).label : undefined };
  }
  const rows: CollectionRow[] = [
    ...notes.map((note): CollectionRow => {
      const edit = legacyEdits.get(note.id);
      return { id: note.id, type: "legacy", text: edit?.text.trim() ? edit.text : note.text,
        updatedAt: edit?.updatedAt ?? note.updatedAt, pending: edit?.pending, pinned: false, context: legacyNoteContext(note) };
    }),
    ...active.map((note) => notebookRow(note.id, edits[note.id] ?? note, note.pinned, !!edits[note.id])),
    ...Object.entries(edits).filter(([id, edit]) => !activeIds.has(id) && !activeIds.has(edit.targetId))
      .map(([id, edit]) => notebookRow(id, edit, false, true)),
  ];
  return rows
    .filter((row) => !needle || normalizeCollectionText(`${row.text} ${row.context ?? ""}`).includes(needle))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
}
