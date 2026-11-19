import { create } from "zustand";
import { notebookId, pendingNoteSchema, type PendingNote } from "./model";

const key = "oliva-notebook-pending-v1";
type PendingEdits = Record<string, PendingNote>;
export const usePendingNotes = create<{ edits: PendingEdits }>(() => ({ edits: {} }));
let recovered = false;

// Recovery is called by the authenticated profile. This small checkpoint survives a
// web reload while the ordinary IndexedDB transaction is in progress.
export function recoverPendingNotes() {
  if (recovered) return;
  recovered = true;
  try {
    if (typeof sessionStorage === "undefined") return;
    const raw = sessionStorage.getItem(key);
    if (!raw || raw.length > 1_000_000) return;
    const entries: unknown = JSON.parse(raw);
    if (!Array.isArray(entries)) return;
    const valid = new Map<string, PendingNote>();
    for (const item of entries.slice(0, 100)) {
      const parsed = pendingNoteSchema.safeParse(item?.[1]);
      if (parsed.success && notebookId.safeParse(item?.[0]).success)
        valid.set(item[0], parsed.data);
    }
    if (valid.size) usePendingNotes.setState({ edits: { ...Object.fromEntries(valid), ...usePendingNotes.getState().edits } });
  } catch { /* The editor can still retain changes in memory when session storage fails. */ }
}

export function putPending(keyForEditor: string, edit: PendingNote | null) {
  const edits = { ...usePendingNotes.getState().edits };
  if (edit) edits[keyForEditor] = edit;
  else delete edits[keyForEditor];
  usePendingNotes.setState({ edits });
  try {
    if (typeof sessionStorage === "undefined") return;
    if (Object.keys(edits).length) sessionStorage.setItem(key, JSON.stringify(Object.entries(edits)));
    else sessionStorage.removeItem(key);
  } catch { /* Pending work remains visible to the in-app and browser exit guards. */ }
}

export function hasPendingNotes() {
  return Object.keys(usePendingNotes.getState().edits).length > 0;
}
