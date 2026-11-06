import type { Page } from "@playwright/test";
import type { AppData } from "../../src/state/model";
// Inspect durable logical data independently of the app decoder. Keep support
// for real legacy inline records; reconstruct only the new storage envelope.
export async function storedData(page: Page, key = "main"): Promise<any> {
  return page.evaluate(
    (key) =>
      new Promise((resolve, reject) => {
        const r = indexedDB.open("oliva-local-v1", 1);
        r.onupgradeneeded = () => r.transaction?.abort();
        r.onerror = () => resolve(undefined);
        r.onsuccess = () => {
          const db = r.result,
            exists = db.objectStoreNames.contains("state");
          if (!exists) {
            db.close();
            resolve(undefined);
            return;
          }
          const tx = db.transaction("state", "readonly"),
            store = tx.objectStore("state"),
            q = store.get(key);
          function expand(raw: any): Promise<any> {
            if (raw?.storageVersion !== 1) return Promise.resolve(raw);
            return Promise.all(
              raw.data.imports.map(
                (meta: any) =>
                  new Promise((resolve, reject) => {
                    const source = store.get("archive:" + meta.sourceHash);
                    source.onsuccess = () =>
                      resolve({ ...meta, sourceText: source.result });
                    source.onerror = () => reject(source.error);
                  }),
              ),
            ).then((imports) => ({ ...raw.data, imports }));
          }
          q.onsuccess = () => {
            const value = q.result;
            if (key === "before-faithpath-import" && value)
              void expand(value.data)
                .then((data) => resolve({ ...value, data }))
                .catch(reject);
            else void expand(value).then(resolve).catch(reject);
          };
          q.onerror = () => reject(q.error);
          tx.oncomplete = () => db.close();
        };
      }),
    key,
  );
}
export async function localData(page: Page): Promise<AppData> {
  return storedData(page);
}
export async function rawData(page: Page, key = "main"): Promise<any> {
  return page.evaluate(
    (key) =>
      new Promise((resolve, reject) => {
        const r = indexedDB.open("oliva-local-v1", 1);
        r.onsuccess = () => {
          const db = r.result,
            tx = db.transaction("state", "readonly"),
            q = tx.objectStore("state").get(key);
          q.onsuccess = () => resolve(q.result);
          q.onerror = () => reject(q.error);
          tx.oncomplete = () => db.close();
        };
      }),
    key,
  );
}
export async function archiveKeys(page: Page): Promise<string[]> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const r = indexedDB.open("oliva-local-v1", 1);
        r.onsuccess = () => {
          const db = r.result,
            tx = db.transaction("state", "readonly"),
            q = tx.objectStore("state").getAllKeys();
          q.onsuccess = () =>
            resolve(
              q.result.filter(
                (k) => typeof k === "string" && k.startsWith("archive:"),
              ) as string[],
            );
          q.onerror = () => reject(q.error);
          tx.oncomplete = () => db.close();
        };
      }),
  );
}
