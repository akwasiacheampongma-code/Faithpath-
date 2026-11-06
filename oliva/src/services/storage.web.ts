import { initialData, assertStorageBudget, type AppData } from "../state/model";
import type { RecoveryCopy, WriteOptions } from "../features/imports/schema";
import {
  ARCHIVE_PREFIX,
  forStorage,
  decodeStored,
  documentRevision,
  archiveHashes,
  checkedHashes,
} from "./documents";
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
function decode(value: unknown, store: IDBObjectStore) {
  return decodeStored(
    value,
    (hash) =>
      new Promise((resolve, reject) => {
        const q = store.get(ARCHIVE_PREFIX + hash);
        q.onsuccess = () =>
          typeof q.result === "string"
            ? resolve(q.result)
            : reject(new Error("Eine archivierte Originalquelle fehlt."));
        q.onerror = () =>
          reject(new Error("Eine Originalquelle konnte nicht gelesen werden."));
      }),
  );
}
export async function readData(): Promise<AppData> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("state", "readonly"),
      store = tx.objectStore("state"),
      q = store.get("main");
    q.onsuccess = () => {
      if (q.result === undefined) resolve(initialData());
      else
        void decode(q.result, store)
          .then(resolve)
          .catch(() =>
            reject(
              new Error(
                "Die lokalen Daten sind beschädigt. Bitte sichere sie, bevor du den Speicher zurücksetzt.",
              ),
            ),
          );
    };
    q.onerror = () =>
      reject(new Error("Die lokalen Daten konnten nicht gelesen werden."));
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
      main = store.get("main"),
      index = store.get("recovery-index");
    let conflict = false;
    function abort() {
      tx.abort();
    }
    function prepare(copy?: { token: string; data: unknown }) {
      try {
        if (documentRevision(main.result) !== expectedRevision) {
          conflict = true;
          abort();
          return;
        }
        if (
          options.consumeRecoveryToken &&
          copy?.token !== options.consumeRecoveryToken
        ) {
          conflict = true;
          abort();
          return;
        }
        const previous = index.result as
          { token: string | null; hashes: unknown } | undefined;
        let token = previous?.token ?? copy?.token ?? null,
          protectedHashes = previous
            ? checkedHashes(previous.hashes)
            : archiveHashes(copy?.data);
        if (options.consumeRecoveryToken) {
          token = null;
          protectedHashes = [];
        } else if (options.createRecovery) {
          token = options.createRecovery.token;
          protectedHashes = archiveHashes(main.result);
        }
        const keys = store.getAllKeys();
        keys.onsuccess = () => {
          try {
            const existing = new Set(keys.result),
              keep = new Set(
                [
                  ...protectedHashes,
                  ...next.imports.map((r) => r.sourceHash),
                ].map((h) => ARCHIVE_PREFIX + h),
              );
            for (const receipt of next.imports) {
              const key = ARCHIVE_PREFIX + receipt.sourceHash;
              if (!existing.has(key)) store.put(receipt.sourceText, key);
            }
            if (options.consumeRecoveryToken)
              store.delete("before-faithpath-import");
            else if (options.createRecovery)
              store.put(
                {
                  ...options.createRecovery,
                  data: main.result ?? initialData(),
                },
                "before-faithpath-import",
              );
            store.put({ token, hashes: protectedHashes }, "recovery-index");
            for (const key of existing)
              if (
                typeof key === "string" &&
                key.startsWith(ARCHIVE_PREFIX) &&
                !keep.has(key)
              )
                store.delete(key);
            store.put(forStorage(next), "main");
          } catch {
            abort();
          }
        };
      } catch {
        abort();
      }
    }
    index.onsuccess = () => {
      if (index.result === undefined || options.consumeRecoveryToken) {
        const copy = store.get("before-faithpath-import");
        copy.onsuccess = () => prepare(copy.result);
      } else prepare();
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
    const store = db.transaction("state", "readonly").objectStore("state"),
      q = store.get("before-faithpath-import");
    q.onsuccess = () => {
      if (!q.result) {
        resolve(null);
        return;
      }
      const copy = q.result;
      void decode(copy.data, store)
        .then((data) =>
          resolve({ token: copy.token, createdAt: copy.createdAt, data }),
        )
        .catch(() =>
          reject(
            new Error(
              "Die lokale Rückkehrsicherung konnte nicht gelesen werden.",
            ),
          ),
        );
    };
    q.onerror = () =>
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
  const blob = new Blob([text], { type: "application/json" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportRawData() {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open("oliva-local-v1");
    r.onupgradeneeded = (e) => {
      if (e.oldVersion === 0) r.transaction?.abort();
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () =>
      reject(
        new Error("Der vorhandene Speicher konnte nicht gesichert werden."),
      );
  });
  const records = await new Promise<
    { store: string; key: IDBValidKey; value: unknown }[]
  >((resolve, reject) => {
    const items: { store: string; key: IDBValidKey; value: unknown }[] = [],
      names = Array.from(db.objectStoreNames),
      tx = db.transaction(names, "readonly");
    for (const name of names) {
      const q = tx.objectStore(name).openCursor();
      q.onsuccess = () => {
        const cursor = q.result;
        if (cursor) {
          items.push({ store: name, key: cursor.key, value: cursor.value });
          cursor.continue();
        }
      };
    }
    tx.oncomplete = () => {
      db.close();
      resolve(items);
    };
    tx.onerror = () =>
      reject(new Error("Die Reparatursicherung konnte nicht gelesen werden."));
  });
  return exportText(
    JSON.stringify(
      {
        app: "OLIVA-Recovery",
        formatVersion: 1,
        exportedAt: new Date().toISOString(),
        database: "oliva-local-v1",
        version: db.version,
        records,
      },
      null,
      2,
    ),
    `oliva-reparatursicherung-${Date.now()}.json`,
  );
}
