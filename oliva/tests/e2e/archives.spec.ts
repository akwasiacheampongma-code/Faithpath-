import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { faithpathFixture } from "../fixtures/faithpath-v5";
import { localData, rawData, archiveKeys, storedData } from "./persistence";
async function name(page: Page, value: string) {
  await page.goto("/einstellungen");
  await page
    .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
    .fill(value);
  await page
    .getByRole("button", { name: "Namen speichern", exact: true })
    .click();
  await expect.poll(async () => (await localData(page))?.name).toBe(value);
}
async function importFile(page: Page, text: string) {
  await page.goto("/importieren");
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "FaithPath-Datei auswählen", exact: true })
    .click();
  await (
    await chooser
  ).setFiles({
    name: "faithpath-v5.json",
    mimeType: "application/json",
    buffer: Buffer.from(text),
  });
  await expect(page.getByText("Das kommt mit.", { exact: true })).toBeVisible();
  await page
    .getByRole("button", {
      name: "Jetzt sichern und Import übernehmen",
      exact: true,
    })
    .click();
}
async function restore(page: Page, value: unknown) {
  await page.goto("/einstellungen");
  await page
    .getByRole("button", { name: "Sicherung wiederherstellen", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Inhalt deiner OLIVA-Sicherung" })
    .fill(JSON.stringify(value));
  await page
    .getByRole("button", { name: "Sicherung prüfen", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Daten durch diese Sicherung ersetzen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Die Sicherung wurde wiederhergestellt.", { exact: true }),
  ).toBeVisible();
}
test("ein großer Originalblob wird bei Entwurfsänderungen nicht erneut geschrieben", async ({
  page,
}) => {
  await name(page, "Ada");
  const fixture = faithpathFixture();
  (fixture as any).largeOriginal = "WEB-ORIGINAL " + "x".repeat(120000);
  const text = JSON.stringify(fixture);
  await importFile(page, text);
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  const raw = await rawData(page);
  expect(raw.storageVersion).toBe(1);
  expect(JSON.stringify(raw)).not.toContain("WEB-ORIGINAL");
  expect(JSON.stringify(raw).length).toBeLessThan(20000);
  expect(await archiveKeys(page)).toHaveLength(1);
  await page.goto("/garten");
  await page.evaluate(() => {
    (window as any).archiveWrites = 0;
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (typeof key === "string" && key.startsWith("archive:"))
        (window as any).archiveWrites++;
      return put.call(this, value, key);
    };
  });
  await page
    .getByRole("textbox", {
      name: "Eine freiwillig gelebte Erfahrung",
      exact: true,
    })
    .fill("Eine kleine neue Eingabe.");
  await expect(
    page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => (window as any).archiveWrites)).toBe(0);
  await page.reload();
  expect((await localData(page)).imports[0]?.sourceText).toBe(text);
  expect((await localData(page)).drafts).toHaveLength(1);
});
test("verwaiste Blobs werden entfernt und Quellen der Rückkehrsicherung bleiben erhalten", async ({
  page,
}) => {
  await name(page, "Vorher");
  const blank = await localData(page),
    fixture = faithpathFixture();
  await importFile(page, JSON.stringify(fixture));
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  const first = await localData(page);
  fixture.data.paths[0]!.title = "Ein späterer alter Titel";
  await importFile(page, JSON.stringify(fixture));
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  expect(await archiveKeys(page)).toHaveLength(2);
  await restore(page, blank);
  expect((await localData(page)).imports).toHaveLength(0);
  expect(await archiveKeys(page)).toHaveLength(1);
  expect(
    (await storedData(page, "before-faithpath-import")).data.imports[0]
      .sourceText,
  ).toBe(first.imports[0]!.sourceText);
  await page.goto("/importieren");
  await page
    .getByRole("button", { name: "Rückkehr prüfen", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Stand vor dem Import jetzt wiederherstellen",
      exact: true,
    })
    .click();
  await expect.poll(async () => (await localData(page)).imports.length).toBe(1);
  expect(await archiveKeys(page)).toHaveLength(1);
  await restore(page, blank);
  expect(await archiveKeys(page)).toHaveLength(0);
});
test("Fehler beim ersten Blobschreiben behalten Bestand und Sicherung unverändert", async ({
  page,
}) => {
  await name(page, "Ada");
  const before = await localData(page);
  await page.addInitScript(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (typeof key === "string" && key.startsWith("archive:"))
        throw new DOMException("Speicher voll", "QuotaExceededError");
      return put.call(this, value, key);
    };
  });
  await importFile(page, JSON.stringify(faithpathFixture()));
  await expect(page.getByText(/Speichern fehlgeschlagen/)).toBeVisible();
  expect(await localData(page)).toEqual(before);
  expect(await archiveKeys(page)).toEqual([]);
  expect(await rawData(page, "before-faithpath-import")).toBeUndefined();
});
test("beschädigte Daten sperren Schreibaktionen und lassen sich unverändert zur Reparatur sichern", async ({
  page,
}) => {
  await name(page, "Ada");
  const original = await rawData(page),
    broken = structuredClone(original);
  broken.data.notes = [
    {
      id: "broken-note",
      text: "Meine vorhandenen Worte dürfen nicht überschrieben werden.",
    },
  ];
  await page.evaluate(
    (value) =>
      new Promise<void>((resolve, reject) => {
        const r = indexedDB.open("oliva-local-v1", 1);
        r.onsuccess = () => {
          const tx = r.result.transaction("state", "readwrite");
          tx.objectStore("state").put(value, "main");
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
      }),
    broken,
  );
  await page.reload();
  await expect(
    page.getByText("Dein Speicher braucht Aufmerksamkeit.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Namen speichern", exact: true }),
  ).not.toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Unveränderten Speicher sichern",
      exact: true,
    })
    .click();
  const file = await (await download).path(),
    recovery = JSON.parse(await readFile(file!, "utf8"));
  expect(recovery.app).toBe("OLIVA-Recovery");
  expect(recovery.records.find((r: any) => r.key === "main").value).toEqual(
    broken,
  );
  expect(await rawData(page)).toEqual(broken);
  await page
    .getByRole("button", { name: "Lokalen Speicher erneut lesen", exact: true })
    .click();
  await expect(
    page.getByText("Dein Speicher braucht Aufmerksamkeit.", { exact: true }),
  ).toBeVisible();
  expect(await rawData(page)).toEqual(broken);
  await page.evaluate(
    (value) =>
      new Promise<void>((resolve) => {
        const r = indexedDB.open("oliva-local-v1", 1);
        r.onsuccess = () => {
          const tx = r.result.transaction("state", "readwrite");
          tx.objectStore("state").put(value, "main");
          tx.oncomplete = () => resolve();
        };
      }),
    original,
  );
  await page
    .getByRole("button", { name: "Lokalen Speicher erneut lesen", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toHaveValue("Ada");
});
