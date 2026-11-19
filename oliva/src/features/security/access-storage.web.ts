import { decodeAccessRecord, type AccessRecord } from "./access-record";

const storeName = "protection";
const key = "current";
const unavailable = () => new Error("Der lokale Passwortschutz konnte nicht geprüft oder gespeichert werden.");
let connection: Promise<IDBDatabase> | null = null;

function open() {
  return (connection ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("oliva-access-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName);
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => { db.close(); connection = null; };
      resolve(db);
    };
    request.onerror = request.onblocked = () => reject(unavailable());
  }).catch((error) => { connection = null; throw error; }));
}

export async function readAccessRecord(): Promise<AccessRecord | null> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const read = tx.objectStore(storeName).get(key);
    tx.oncomplete = () => {
      try { resolve(decodeAccessRecord(read.result)); }
      catch { reject(unavailable()); }
    };
    tx.onabort = tx.onerror = () => reject(unavailable());
  });
}

export async function writeAccessRecord(expectedId: string | null, next: AccessRecord | null): Promise<boolean> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const read = store.get(key);
    let written = false;
    read.onsuccess = () => {
      try {
        const current = decodeAccessRecord(read.result);
        if ((current?.id ?? null) !== expectedId) return;
        if (next) store.put(next, key);
        else store.delete(key);
        written = true;
      } catch {
        tx.abort();
      }
    };
    tx.oncomplete = () => resolve(written);
    tx.onabort = tx.onerror = () => reject(unavailable());
  });
}
