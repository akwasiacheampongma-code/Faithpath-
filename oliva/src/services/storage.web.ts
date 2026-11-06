import {
  decodeData,
  initialData,
  assertStorageBudget,
  type AppData,
} from "../state/model";
import type { RecoveryCopy, WriteOptions } from "../features/imports/schema";
let connection: Promise<IDBDatabase> | null = null;
function open() {
  return (connection ??= new Promise((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("state");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      connection = null;
      reject(new Error("Lokaler Speicher ist nicht verfügbar."));
    };
  }));
}
export async function readData(): Promise<AppData> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("state", "readonly"),
      req = tx.objectStore("state").get("main");
    req.onsuccess = () => {
      try {
        resolve(
          req.result === undefined ? initialData() : decodeData(req.result),
        );
      } catch {
        reject(
          new Error(
            "Die lokalen Daten sind beschädigt. Bitte sichere sie, bevor du den Speicher zurücksetzt.",
          ),
        );
      }
    };
    req.onerror = () => reject(req.error);
  });
}
export async function writeData(
  next: AppData,
  expectedRevision: number,
  options: WriteOptions = {},
): Promise<void> {
  assertStorageBudget(next);
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("state", "readwrite"),
      store = tx.objectStore("state"),
      req = store.get("main");
    let conflict = false;
    req.onsuccess = () => {
      if ((req.result?.revision ?? 0) !== expectedRevision) {
        conflict = true;
        tx.abort();
        return;
      }
      if (options.consumeRecoveryToken) {
        const recovery = store.get("before-faithpath-import");
        recovery.onsuccess = () => {
          if (recovery.result?.token !== options.consumeRecoveryToken) {
            conflict = true;
            tx.abort();
            return;
          }
          store.delete("before-faithpath-import");
          store.put(next, "main");
        };
      } else {
        if (options.createRecovery)
          store.put(
            { ...options.createRecovery, data: req.result ?? initialData() },
            "before-faithpath-import",
          );
        store.put(next, "main");
      }
    };
    tx.oncomplete = () => resolve();
    tx.onabort = () =>
      reject(
        new Error(
          conflict
            ? "Ein anderes Fenster hat die Daten geändert. Lade die App neu; deine Eingabe bleibt hier erhalten."
            : "Speichern fehlgeschlagen. Bitte sichere deinen Text und versuche es erneut.",
        ),
      );
    tx.onerror = () =>
      reject(
        new Error(
          "Speichern fehlgeschlagen. Der Gerätespeicher könnte voll sein.",
        ),
      );
  });
}
export async function readRecovery(): Promise<RecoveryCopy | null> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = db
      .transaction("state", "readonly")
      .objectStore("state")
      .get("before-faithpath-import");
    req.onsuccess = () => {
      try {
        resolve(
          req.result
            ? { ...req.result, data: decodeData(req.result.data) }
            : null,
        );
      } catch {
        reject(
          new Error(
            "Die lokale Rückkehrsicherung konnte nicht gelesen werden.",
          ),
        );
      }
    };
    req.onerror = () =>
      reject(new Error("Die lokale Rückkehrsicherung ist nicht verfügbar."));
  });
}
export async function exportData(data: AppData) {
  return exportText(
    JSON.stringify(data, null, 2),
    `oliva-sicherung-${new Date().toISOString().slice(0, 10)}.json`,
  );
}
export async function exportText(text: string, filename: string) {
  const blob = new Blob([text], {
      type: "application/json",
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
