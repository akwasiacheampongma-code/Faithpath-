import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { faithpathFixture } from "../fixtures/faithpath-v5";
import type { AppData } from "../../src/state/model";
import { storedData as stored } from "./persistence";
async function choose(page: Page, text: string) {
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
}
async function preview(
  page: Page,
  text = JSON.stringify(faithpathFixture(), null, 2) + "\n",
) {
  await page.goto("/importieren");
  await choose(page, text);
  await expect(page.getByText("Das kommt mit.", { exact: true })).toBeVisible();
}
async function apply(page: Page) {
  await page
    .getByRole("button", {
      name: "Jetzt sichern und Import übernehmen",
      exact: true,
    })
    .click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
}
async function name(page: Page, value: string) {
  await page.goto("/einstellungen");
  await page
    .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
    .fill(value);
  await page
    .getByRole("button", { name: "Namen speichern", exact: true })
    .click();
  await expect.poll(async () => (await stored(page))?.name).toBe(value);
}
test("Dateiauswahl ist eine reine Vorschau; Abbrechen verändert keine Daten", async ({
  page,
}) => {
  await name(page, "Ada");
  const before = await stored(page);
  await preview(page);
  expect(await stored(page)).toEqual(before);
  expect(await stored(page, "before-faithpath-import")).toBeUndefined();
  await expect(
    page.getByText("1 Vorhaben · 2 Gedanken · 2 Versmarkierungen · 1 Kapitel · 0 historische NT-Fragenabschlüsse", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Vorschau schließen", exact: true })
    .click();
  expect(await stored(page)).toEqual(before);
  await choose(page, '{"app":"FaithPath-Recovery","main":"alt"}');
  await expect(
    page.getByText(/Erwartet wird eine FaithPath-Sicherung mit Datenschema 5/),
  ).toBeVisible();
  expect(await stored(page)).toEqual(before);
});
test("Import, Quellen-Snapshot, Dateiexport und Neustart funktionieren offline", async ({
  page,
  context,
}) => {
  await name(page, "Ada");
  const before = await stored(page),
    text = JSON.stringify(faithpathFixture(), null, 2) + "\n";
  await preview(page, text);
  await apply(page);
  const data = (await stored(page)) as AppData;
  expect(data.name).toBe("Ada");
  expect(data.goals).toHaveLength(1);
  expect(data.notes).toHaveLength(2);
  expect(data.growthStage).toBe(before.growthStage);
  expect(data.readChapters).toEqual(["MRK:4"]);
  expect((await stored(page, "before-faithpath-import")).data).toEqual(before);
  await page.goto("/vorhaben/" + data.goals[0]!.id);
  await expect(
    page.getByText("Der damalige Gedanke.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Mein damaliger Titel", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Vollständige Originalquelle ansehen",
      exact: true,
    })
    .click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Originaldatei exportieren", exact: true })
    .click();
  const path = await (await download).path();
  expect(await readFile(path!, "utf8")).toBe(text);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener(
          "controllerchange",
          () => resolve(),
          { once: true },
        ),
      );
  });
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByText("Was du mitgebracht hast.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Journal", exact: true }).click();
  await expect(
    page.getByText("Ich darf mit meinen Fragen kommen.", { exact: true }),
  ).toBeVisible();
  expect((await stored(page)).imports[0].sourceText).toBe(text);
  await context.setOffline(false);
  await page.goto("/importieren");
  await choose(page, text);
  await expect(page.getByText(/bereits übernommen/)).toBeVisible();
  expect((await stored(page)).notes).toHaveLength(2);
});
test("zwei Fenster schützen Änderungen und erlauben eine erneute Vorschau", async ({
  page,
  context,
}) => {
  await name(page, "Ada");
  await preview(page);
  const other = await context.newPage();
  await name(other, "Aktueller Name");
  await page
    .getByRole("button", {
      name: "Jetzt sichern und Import übernehmen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText(/Ein anderes Fenster hat die Daten geändert/),
  ).toBeVisible();
  expect((await stored(page)).imports).toHaveLength(0);
  expect((await stored(page)).name).toBe("Aktueller Name");
  expect(await stored(page, "before-faithpath-import")).toBeUndefined();
  await page
    .getByRole("button", { name: "Vorschau erneut prüfen", exact: true })
    .click();
  await apply(page);
  expect((await stored(page)).name).toBe("Aktueller Name");
  expect((await stored(page, "before-faithpath-import")).data.name).toBe(
    "Aktueller Name",
  );
  await other.close();
});
test("Schreibfehler lassen Bestand und vorherige Rückkehrsicherung atomar erhalten", async ({
  page,
}) => {
  await name(page, "Ada");
  await preview(page);
  await apply(page);
  const before = await stored(page),
    recovery = await stored(page, "before-faithpath-import");
  const changed = faithpathFixture();
  changed.data.paths[0]!.title = "Eine andere alte Fassung";
  await preview(page, JSON.stringify(changed));
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (key === "main")
        throw new DOMException(
          "Simulierter Speicherfehler",
          "QuotaExceededError",
        );
      return put.call(this, value, key);
    };
  });
  await page
    .getByRole("button", {
      name: "Jetzt sichern und Import übernehmen",
      exact: true,
    })
    .click();
  await expect(page.getByText(/Speichern fehlgeschlagen/)).toBeVisible();
  expect(await stored(page)).toEqual(before);
  expect(await stored(page, "before-faithpath-import")).toEqual(recovery);
  await expect(page.getByText("Das kommt mit.", { exact: true })).toBeVisible();
});
test("Rückkehr zeigt Folgen ausdrücklich und stellt den echten vorherigen Stand wieder her", async ({
  page,
}) => {
  await name(page, "Vor dem Import");
  const before = await stored(page);
  await preview(page);
  await apply(page);
  await name(page, "Nach dem Import");
  await page.goto("/importieren");
  await page
    .getByRole("button", { name: "Rückkehr prüfen", exact: true })
    .click();
  await expect(
    page.getByText(
      "Alle Änderungen seit diesem Sicherungsstand werden ersetzt.",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Stand vor dem Import jetzt wiederherstellen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Der Stand vor dem Import wurde wiederhergestellt.", {
      exact: true,
    }),
  ).toBeVisible();
  const data = await stored(page);
  expect({ ...data, revision: before.revision }).toEqual(before);
  expect(await stored(page, "before-faithpath-import")).toBeUndefined();
  await page.reload();
  expect((await stored(page)).name).toBe("Vor dem Import");
});
test("Importansichten sind mobil, dunkel und per Tastatur zugänglich", async ({
  page,
}) => {
  await name(page, "Ada");
  await page.getByRole("button", { name: "Dunkel", exact: true }).click();
  await preview(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 2,
  );
  expect(overflow).toBe(false);
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await apply(page);
  await page
    .getByRole("button", { name: "Originalarchiv öffnen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Originaldatensatz ansehen", exact: true })
    .first()
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 2,
    ),
  ).toBe(false);
  const archive = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(archive.violations).toEqual([]);
});
