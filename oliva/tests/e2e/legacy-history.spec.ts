import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { faithpathFixture } from "../fixtures/faithpath-v5";
import type { FaithpathData } from "../../src/features/imports/source";
import { localData } from "./persistence";

async function importOriginal(page: Page, change?: (data: FaithpathData) => void) {
  const input = faithpathFixture(); change?.(input.data as unknown as FaithpathData);
  await page.goto("/importieren");
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "FaithPath-Datei auswählen", exact: true }).click();
  await (await chooser).setFiles({ name: "synthetic-history.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(input, null, 2)) });
  await page.getByRole("button", { name: "Jetzt sichern und Import übernehmen", exact: true }).click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  const data = await localData(page);
  return { input, goal: data.goals[0]!, receipt: data.imports.find((receipt) => receipt.sourceText === JSON.stringify(input, null, 2))! };
}
async function durable(page: Page) {
  return page.evaluate(() => new Promise<unknown>((resolve, reject) => {
    const open = indexedDB.open("oliva-local-v1", 1);
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result, tx = db.transaction("state", "readonly"), store = tx.objectStore("state"),
        keys = store.getAllKeys(), values = store.getAll();
      tx.onerror = () => { db.close(); reject(tx.error); };
      tx.oncomplete = () => { const records = keys.result.map((key, i) => ({ key, value: values.result[i] })); db.close(); resolve(records); };
    };
  }));
}
test("historische Meilensteine und echte Spiegel öffnen genau ihre Originalstelle und bleiben auch offline schreibfrei", async ({ page, context }) => {
  const { input, goal } = await importOriginal(page, (data) => {
    data.reviews = [{ ...data.paths[0]!.reviews[0]!, pathId: "p1" }];
    data.paths[0]!.milestones[0]!.reviewId = "review1";
  });
  const before = JSON.stringify(await durable(page));
  await page.goto("/vorhaben/" + goal.id);
  await expect(page.getByText("Ein kleiner Anfang.", { exact: true })).toBeVisible();
  await expect(page.getByText("Damals hat mich diese Frage bewegt.", { exact: true })).toHaveCount(1);
  await expect(page.getByText("Gleicher Originaldatensatz an 2 Stellen der Quelle · einmal angezeigt.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Originalmeilenstein im Archiv ansehen", exact: true }).click();
  await expect(page.getByTestId("archive-focused-json")).toBeVisible();
  expect(JSON.parse(await page.getByTestId("archive-focused-json").innerText())).toEqual(input.data.paths[0]!.milestones[0]);
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true); await page.reload();
  await expect(page.getByTestId("archive-focused-json")).toBeVisible();
  expect(JSON.parse(await page.getByTestId("archive-focused-json").innerText())).toEqual(input.data.paths[0]!.milestones[0]);
  await page.goBack();
  await page.getByRole("button", { name: "Zugehörigen ursprünglichen Rückblick ansehen", exact: true }).click();
  await expect(page.getByTestId("archive-focused-json")).toBeVisible();
  expect(JSON.parse(await page.getByTestId("archive-focused-json").innerText())).toEqual(input.data.paths[0]!.reviews[0]);
  expect(JSON.stringify(await durable(page))).toBe(before);
});
test("verknüpfte Gedankenrückblicke, abweichende Fassungen und fehlende Daten bleiben erkennbar statt heutige Belege zu erfinden", async ({ page }) => {
  const { goal } = await importOriginal(page, (data) => {
    const review = data.paths[0]!.reviews[0]!;
    review.date = "nicht überliefert"; review.sourceSnapshot = { key: "andere-Quelle", text: "Nicht ausgeben." };
    data.reviews = [{ ...review, text: "Eine abweichende Originalfassung.", pathId: "p1" },
      { ...review, id: "linked", sourceKey: "r:r1", text: "Mein Rückblick zur ausdrücklich verknüpften Reflexion." }];
    data.paths[0]!.milestones[0]!.date = "kein Datum"; data.paths[0]!.milestones[0]!.text = "";
  });
  const before = JSON.stringify(await durable(page));
  await page.goto("/vorhaben/" + goal.id);
  await expect(page.getByText("Eine abweichende Originalfassung.", { exact: true })).toBeVisible();
  await expect(page.getByText("Mein Rückblick zur ausdrücklich verknüpften Reflexion.", { exact: true })).toBeVisible();
  await expect(page.getByText("Mehrere Originalfassungen mit dieser Kennung bleiben getrennt erhalten.", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Der damalige Wortlaut ist nicht gespeichert.", { exact: true })).toBeVisible();
  await expect(page.getByText("Nicht ausgeben.", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/FaithPath-(Rückblick|Meilenstein) · Datum nicht überliefert/)).toHaveCount(4);
  expect(JSON.stringify(await durable(page))).toBe(before);
});
test("historische Karten und genaue Archivstellen bleiben klein, dunkel und per Tastatur zugänglich; ein falscher Quellhash öffnet keinen fremden Datensatz", async ({ page }, testInfo) => {
  const { goal } = await importOriginal(page);
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/vorhaben/" + goal.id);
    if (width === 1440) await page.getByRole("button", { name: "Dunklen Modus aktivieren", exact: true }).click();
    const before = JSON.stringify(await durable(page));
    const button = page.getByRole("button", { name: "Originalmeilenstein im Archiv ansehen", exact: true });
    await button.scrollIntoViewIfNeeded();
    await expect(page.getByText("Ein kleiner Anfang.", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`legacy-history-${width}.png`) });
    await button.focus(); await page.keyboard.press("Enter");
    await expect(page.getByTestId("archive-focused-json")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`legacy-source-${width}.png`) });
    const bad = new URL(page.url()); bad.searchParams.set("source", "0".repeat(64));
    await page.goto(bad.href);
    await expect(page.getByTestId("archive-focused-record")).toContainText("nicht eindeutig verfügbar");
    await expect(page.getByTestId("archive-focused-json")).toHaveCount(0);
    expect(JSON.stringify(await durable(page))).toBe(before);
  }
});

test("der Garten erschließt erhaltene Originalvorhaben ohne heutiges Vorhaben und stellt beim Offline-Neustart nichts wieder her", async ({ page, context }) => {
  await importOriginal(page, (data) => { data.paths[0]!.title = "Ein bewahrtes früheres Vorhaben ".repeat(40); });
  expect((await localData(page)).goals).toEqual([]);
  const before = JSON.stringify(await durable(page));
  await page.goto("/garten");
  await page.getByRole("button", { name: "Frühere FaithPath-Momente ansehen", exact: true }).click();
  await expect(page.getByTestId("archive-readable-history")).toBeVisible();
  await page.getByRole("textbox", { name: "Frühere Vorhaben durchsuchen", exact: true }).fill("  BEWAHRTES   ");
  await page.getByRole("button", { name: /^Ein bewahrtes früheres Vorhaben/ }).click();
  await expect(page.getByText("Ein kleiner Anfang.", { exact: true })).toBeVisible();
  await expect(page.getByText("Damals hat mich diese Frage bewegt.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Andere frühere Momente wählen", exact: true })).toBeVisible();
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true); await page.reload();
  await expect(page.getByText("Ein kleiner Anfang.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Originalmeilenstein im Archiv ansehen", exact: true }).click();
  await expect(page.getByTestId("archive-focused-json")).toContainText("Ein kleiner Anfang.");
  await page.goBack(); await expect(page.getByText("Ein kleiner Anfang.", { exact: true })).toBeVisible();
  expect((await localData(page)).goals).toEqual([]);
  expect(JSON.stringify(await durable(page))).toBe(before);
});

test("mehrere Originaldateien behalten ihre eigenen Fassungen und unzugeordnete Rückblicke bleiben ohne geratenen Weg", async ({ page }) => {
  const first = await importOriginal(page, (data) => {
    data.reviews = [{ ...data.paths[0]!.reviews[0]!, id: "unassigned", sourceKey: "journal:j2", text: "Meine Worte aus der ersten Datei." }];
  });
  const second = await importOriginal(page, (data) => {
    data.reviews = [{ ...data.paths[0]!.reviews[0]!, id: "unassigned", sourceKey: "journal:j2", text: "Meine Worte aus der zweiten Datei." }];
  });
  expect(first.receipt.id).not.toBe(second.receipt.id);
  expect((await localData(page)).imports).toHaveLength(2);
  const before = JSON.stringify(await durable(page));
  await page.goto("/garten");
  await expect(page.getByTestId("garden-original-history").getByRole("button", { name: /^Originalquelle / })).toHaveCount(2);
  for (const [receipt, text, other] of [[first.receipt, "Meine Worte aus der ersten Datei.", "Meine Worte aus der zweiten Datei."],
    [second.receipt, "Meine Worte aus der zweiten Datei.", "Meine Worte aus der ersten Datei."]] as const) {
    await page.goto("/importarchiv/" + receipt.id + "?view=history");
    await page.getByRole("button", { name: "Rückblicke ohne eindeutigen Weg", exact: true }).click();
    await expect(page.getByText(text, { exact: true })).toBeVisible();
    await expect(page.getByText(other, { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Originalrückblick im Archiv ansehen", exact: true }).click();
    await expect(page.getByTestId("archive-focused-json")).toContainText(text);
    expect(JSON.stringify(await durable(page))).toBe(before);
  }
});

test("die vollständige Originalhistorie bleibt mobil und dunkel zugänglich und verwirft eine unbekannte Vorhabenauswahl", async ({ page }, testInfo) => {
  const { receipt } = await importOriginal(page, (data) => {
    data.reviews = [{ ...data.paths[0]!.reviews[0]!, id: "unassigned", sourceKey: "unbekannte-Quelle", text: "Ein erhaltener Moment ohne Weg.", confirmedDevelopment: true }];
  });
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/importarchiv/" + receipt.id + "?view=history");
    if (width === 1440) await page.getByRole("button", { name: "Dunklen Modus aktivieren", exact: true }).click();
    const before = JSON.stringify(await durable(page));
    const choose = page.getByRole("button", { name: "Rückblicke ohne eindeutigen Weg", exact: true });
    await choose.focus(); await page.keyboard.press("Enter");
    await expect(page.getByText("Ein erhaltener Moment ohne Weg.", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`original-history-${width}.png`) });
    await page.goto("/importarchiv/" + receipt.id + "?view=history&historyTab=path&historyPath=fehlt");
    await expect(page.getByText("Dieses frühere Vorhaben ist in der Originalquelle nicht verfügbar.", { exact: true })).toBeVisible();
    await expect(page.getByText("Ein kleiner Anfang.", { exact: true })).toHaveCount(0);
    expect(JSON.stringify(await durable(page))).toBe(before);
  }
});
