import { test, expect, type Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { faithpathFixture, sourceDate } from "../fixtures/faithpath-v5";
import { localData, rawData } from "./persistence";

const importedAt = "2026-11-08T10:00:00.000Z";
function sourceText() {
  const source = faithpathFixture();
  Object.assign(source.data, {
    paths: [],
    journal: [],
    reflections: [],
    highlights: [],
    events: [],
    reviews: [],
    quiz: {
      "10000": { done: sourceDate },
      "10028": { done: "2026-11-02T10:00:00.000Z" },
      "10001": { done: "2026-11-01" },
      unknown: { done: sourceDate, preserved: "Keine Antwort erfinden." },
    },
  });
  return JSON.stringify(source, null, 2) + "\n";
}

async function seedHistoricalArchive(page: Page) {
  const text = sourceText();
  // Construct the historical V7 contract independently of the app decoder.
  const original = JSON.parse(text);
  delete original.exported;
  const canonical = (value: any): string => {
    if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
    if (value && typeof value === "object")
      return (
        "{" +
        Object.keys(value)
          .sort()
          .map((key) => JSON.stringify(key) + ":" + canonical(value[key]))
          .join(",") +
        "}"
      );
    return JSON.stringify(value);
  };
  const hash = (value: string) =>
    createHash("sha256").update(value).digest("hex");
  const fingerprint = hash(canonical(original));
  const receipt = {
    id: "fp5-" + fingerprint,
    fingerprint,
    sourceHash: hash(text),
    importedAt,
    sourceExported: JSON.parse(text).exported,
    counts: {
      paths: 0,
      notes: 0,
      highlights: 0,
      chapters: 0,
      mirrors: 0,
      conflicts: 0,
    },
    entities: {},
    addedChapters: [],
  };
  const old = {
    storageVersion: 1,
    data: {
      version: 7,
      revision: 12,
      name: "Ada",
      onboarded: true,
      reading: { book: "MRK", chapter: 4 },
      readingPosition: null,
      readChapters: [],
      readPassages: [],
      readSteps: [],
      completedSteps: [],
      activePath: null,
      bookmarks: [],
      highlights: {},
      notes: [],
      growthStage: 3,
      goals: [],
      drafts: [],
      imports: [receipt],
      retainedReviewGrowth: { reflections: 0, actions: 0 },
      invitations: { enabled: false, snoozed: {}, dismissed: {} },
      settings: {
        theme: "light",
        fontSize: 20,
        lineHeight: 1.8,
        reducedMotion: false,
      },
    },
  };
  const empty = structuredClone(old);
  Object.assign(empty.data, {
    revision: 0,
    name: "",
    onboarded: false,
    growthStage: 0,
    imports: [],
  });
  const recovery = {
    token: "historical-before-import",
    createdAt: importedAt,
    data: empty,
  };
  await page.goto("/einstellungen");
  await expect(
    page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toBeVisible();
  await page.evaluate(
    ({ old, recovery, sourceHash, text }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("oliva-local-v1", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("state", "readwrite");
          const store = tx.objectStore("state");
          store.clear();
          store.put(old, "main");
          store.put(recovery, "before-faithpath-import");
          store.put(text, "archive:" + sourceHash);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = tx.onabort = () => {
            db.close();
            reject(tx.error);
          };
        };
      }),
    { old, recovery, sourceHash: receipt.sourceHash, text },
  );
  return { text, old, recovery, receipt };
}

test("NT-Importvorschau liest nur und übernimmt belegte Abschlüsse ohne Antworten oder Baumfortschritt", async ({
  page,
}) => {
  await page.goto("/importieren");
  await expect(
    page.getByRole("button", {
      name: "FaithPath-Datei auswählen",
      exact: true,
    }),
  ).toBeVisible();
  const before = await rawData(page);
  const text = sourceText();
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "FaithPath-Datei auswählen", exact: true })
    .click();
  await (
    await chooser
  ).setFiles({
    name: "synthetic-faithpath-nt.json",
    mimeType: "application/json",
    buffer: Buffer.from(text),
  });
  await expect(page.getByText("Das kommt mit.", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/2 historische NT-Fragenabschlüsse/),
  ).toBeVisible();
  await expect(
    page.getByText(/Ein historischer NT-Abschluss bedeutet/),
  ).toBeVisible();
  expect(await rawData(page)).toEqual(before);
  await page
    .getByRole("button", {
      name: "Jetzt sichern und Import übernehmen",
      exact: true,
    })
    .click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  const data = await localData(page);
  expect(data.ntStudy.legacyCompletions).toHaveLength(2);
  expect(data.ntStudy.answers).toEqual({});
  expect(data.ntStudy.completions).toEqual({});
  expect(data.ntStudy.position).toBeNull();
  expect(data.readChapters).toEqual([]);
  expect(data.readPassages).toEqual([]);
  expect(data.readSteps).toEqual([]);
  expect(data.completedSteps).toEqual([]);
  expect(data.growthStage).toBe(0);
  expect(data.imports[0]!.sourceText).toBe(text);
  await page.reload();
  expect(await localData(page)).toEqual(data);
});

test("ein V7-Originalarchiv aktiviert NT-Fakten erst ausdrücklich und bewahrt Quelle und Rückkehrsicherung bytegenau", async ({
  page,
}) => {
  const { text, old, recovery, receipt } = await seedHistoricalArchive(page);
  await page.goto("/importarchiv/" + receipt.id);
  await expect(
    page.getByText("Dein früherer Kapitelabschluss.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /2 eindeutig belegte Abschlüsse.*0 bereits sichtbar.*2 noch übernehmbar/,
    ),
  ).toBeVisible();
  await expect(page.getByText(/Originaleinheit 10000/)).toBeVisible();
  expect(await rawData(page)).toEqual(old);
  expect(await rawData(page, "before-faithpath-import")).toEqual(recovery);
  expect(await rawData(page, "archive:" + receipt.sourceHash)).toBe(text);
  await page.evaluate(() => {
    (window as any).ntArchiveWrites = 0;
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (typeof key === "string" && key.startsWith("archive:"))
        (window as any).ntArchiveWrites++;
      return original.call(this, value, key);
    };
  });
  await page
    .getByRole("button", {
      name: "NT-Abschlüsse aus diesem Archiv übernehmen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText(/Die belegten NT-Abschlüsse sind jetzt/),
  ).toBeVisible();
  await expect(
    page.getByText(
      /2 eindeutig belegte Abschlüsse.*2 bereits sichtbar.*0 noch übernehmbar/,
    ),
  ).toBeVisible();
  const current = await localData(page);
  expect(current.version).toBe(8);
  expect(current.revision).toBe(13);
  expect(current.ntStudy.legacyCompletions).toHaveLength(2);
  expect(current.ntStudy.answers).toEqual({});
  expect(current.ntStudy.completions).toEqual({});
  expect(current.ntStudy.position).toBeNull();
  const raw = await rawData(page);
  const { version: oldVersion, revision: oldRevision, ...oldFields } = old.data;
  const {
    version: newVersion,
    revision: newRevision,
    ntStudy,
    ...newFields
  } = raw.data;
  expect(newFields).toEqual(oldFields);
  expect(await page.evaluate(() => (window as any).ntArchiveWrites)).toBe(0);
  expect(await rawData(page, "before-faithpath-import")).toEqual(recovery);
  expect(await rawData(page, "archive:" + receipt.sourceHash)).toBe(text);
  await page.reload();
  await expect(
    page.getByText(
      /2 eindeutig belegte Abschlüsse.*2 bereits sichtbar.*0 noch übernehmbar/,
    ),
  ).toBeVisible();
  expect(await localData(page)).toEqual(current);
  expect(await rawData(page, "before-faithpath-import")).toEqual(recovery);
  expect(await rawData(page, "archive:" + receipt.sourceHash)).toBe(text);
});

test("ein fremder Fenstercommit blockiert die NT-Aktivierung und die Archivvorschau lässt sich sicher neu prüfen", async ({
  page,
  context,
}) => {
  const { receipt, text, recovery } = await seedHistoricalArchive(page);
  await page.goto("/importarchiv/" + receipt.id);
  await expect(
    page.getByRole("button", {
      name: "NT-Abschlüsse aus diesem Archiv übernehmen",
      exact: true,
    }),
  ).toBeVisible();
  const other = await context.newPage();
  await other.goto("/einstellungen");
  await other
    .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
    .fill("Lina");
  await other
    .getByRole("button", { name: "Namen speichern", exact: true })
    .click();
  await expect.poll(async () => (await localData(other)).name).toBe("Lina");
  const changed = await rawData(page);
  expect(changed.data.revision).toBe(13);
  expect(changed.data.ntStudy.legacyCompletions).toEqual([]);
  await page
    .getByRole("button", {
      name: "NT-Abschlüsse aus diesem Archiv übernehmen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText(/Ein anderes Fenster hat die Daten geändert/).first(),
  ).toBeVisible();
  expect(await rawData(page)).toEqual(changed);
  expect(await rawData(page, "before-faithpath-import")).toEqual(recovery);
  expect(await rawData(page, "archive:" + receipt.sourceHash)).toBe(text);
  await page
    .getByRole("button", {
      name: "NT-Archivvorschau erneut prüfen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText(/Vorschau mit dem aktuellen lokalen Stand geprüft/),
  ).toBeVisible();
  expect(await rawData(page)).toEqual(changed);
  await page
    .getByRole("button", {
      name: "NT-Abschlüsse aus diesem Archiv übernehmen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText(/Die belegten NT-Abschlüsse sind jetzt/),
  ).toBeVisible();
  const current = await localData(page);
  expect(current.name).toBe("Lina");
  expect(current.revision).toBe(14);
  expect(current.ntStudy.legacyCompletions).toHaveLength(2);
  expect(current.ntStudy.answers).toEqual({});
  expect(current.readChapters).toEqual([]);
  expect(current.growthStage).toBe(3);
  expect(await rawData(page, "before-faithpath-import")).toEqual(recovery);
  expect(await rawData(page, "archive:" + receipt.sourceHash)).toBe(text);
  await other.close();
});
