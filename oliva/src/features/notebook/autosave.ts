import { useApp } from "../../state/store";
import { useAccess } from "../security/access";
import { newId } from "../personal/schema";
import { noteMatches, notebookStamp, type NotebookContent, type NotebookNote } from "./model";
import { putPending, recoverPendingNotes, usePendingNotes } from "./pending";

const pending = (id: string) => usePendingNotes.getState().edits[id];
type SaveResult = { note: NotebookNote | null; copied: boolean; error?: string };
const writes = new Map<string, Promise<SaveResult>>();

async function save(id: string): Promise<SaveResult> {
  let result: SaveResult = { note: null, copied: false };
  while (useAccess.getState().phase === "open") {
    const attempt = pending(id);
    if (!attempt) break;
    try {
      const saved = await useApp.getState().writeNotebookEdit(attempt);
      if (!saved) throw new Error(useApp.getState().error ?? "Die Notiz konnte gerade nicht gespeichert werden.");
      result = { note: saved.note, copied: result.copied || saved.copied };
      const newer = pending(id);
      if (!newer) break;
      if (noteMatches(newer, attempt)) {
        putPending(id, null);
        break;
      }
      if (saved.note) putPending(id, {
        ...newer, targetId: saved.note.id, expectedStamp: notebookStamp(saved.note),
        copyId: saved.copied ? newId("notiz") : newer.copyId,
      });
    } catch (error) {
      return { ...result, error: (error as Error).message };
    }
  }
  return result;
}

export function flushNotebookNote(id: string) {
  const running = writes.get(id);
  if (running) return running;
  const task = save(id).finally(() => { writes.delete(id); });
  writes.set(id, task);
  return task;
}

export function changeNotebookText(id: string, entry: NotebookNote | undefined, content: NotebookContent) {
  const work = pending(id);
  putPending(id, {
    targetId: work?.targetId ?? id,
    copyId: work?.copyId ?? newId("notiz"),
    expectedStamp: work ? work.expectedStamp : entry ? notebookStamp(entry) : null,
    ...content,
    updatedAt: new Date().toISOString(),
  });
  return flushNotebookNote(id);
}

export function resumeNotebookEdits() {
  if (useAccess.getState().phase !== "open") return Promise.resolve([]);
  recoverPendingNotes();
  return Promise.all(Object.keys(usePendingNotes.getState().edits).map(flushNotebookNote));
}
