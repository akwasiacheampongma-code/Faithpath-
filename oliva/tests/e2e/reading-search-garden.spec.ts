import { expect, test, type Page } from "@playwright/test";
import { rawData } from "./persistence";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).filter({ visible: true });
const searchBox = (page: Page) => page.getByRole("textbox", { name: "Wörter im Bibeltext suchen", exact: true }).filter({ visible: true });
const results = (page: Page) => page.getByTestId("bible-verse-result").filter({ visible: true });
const count = (page: Page) => page.getByTestId("bible-search-count").filter({ visible: true });

async function search(page: Page, query: string) {
  await page.goto("/bibel");
  await button(page, "Bibeltext durchsuchen").click();
  await searchBox(page).fill(query);
}

test("Friede zeigt die echte Gesamtzahl und macht auch den letzten Vers erreichbar", async ({ page }) => {
  await search(page, "Friede");
  await expect(count(page)).toHaveText("267 Verse gefunden · Luther 1912");
  await expect(results(page)).toHaveCount(30);
  await expect(results(page).first().getByTestId("bible-search-highlight")).toHaveText("Friede");
  for (const n of [60, 90, 120, 150, 180, 210, 240, 267]) {
    await button(page, "Weitere Verse anzeigen").click();
    await expect(results(page)).toHaveCount(n);
  }
  await expect(button(page, "Weitere Verse anzeigen")).toHaveCount(0);
  await expect(results(page).last()).toHaveAccessibleName(/^Offenbarung 6,4\./);
});

test("Buch und Testament begrenzen die Suche, Rückkehr erhält Suche und Listenposition", async ({ page }) => {
  await search(page, "Friede");
  await expect(count(page)).toHaveText("267 Verse gefunden · Luther 1912");
  const scope = page.getByRole("combobox", { name: "Bibelbereich", exact: true }).filter({ visible: true });
  await scope.selectOption("NT");
  await expect(results(page).first()).toHaveAccessibleName(/^Matthäus /);
  await scope.selectOption("AT");
  await expect(results(page).first()).toHaveAccessibleName(/^1\. Mose /);
  await scope.selectOption({ label: "Psalmen" });
  await expect(count(page)).toHaveText("18 Verse gefunden · Luther 1912");
  const hit = results(page).nth(11);
  const label = await hit.getAttribute("aria-label");
  const [, chapter, verse] = /^Psalmen (\d+),(\d+)\./.exec(label ?? "")!;
  await hit.scrollIntoViewIfNeeded();
  const main = page.getByRole("main").filter({ visible: true });
  await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(400);
  const beforeY = await main.evaluate((element) => element.scrollTop);
  await hit.click();
  await expect(page).toHaveURL(new RegExp(`/lesen/PSA\\?chapter=${chapter}(?:&|$)`));
  const exactVerse = page.getByRole("button", { name: new RegExp(`^Vers ${verse}:`) }).filter({ visible: true });
  await expect(exactVerse).toBeInViewport();
  await button(page, "Zurück").click();
  await expect(searchBox(page)).toHaveValue("Friede");
  await expect(scope).toHaveValue("book:PSA");
  await expect(count(page)).toHaveText("18 Verse gefunden · Luther 1912");
  await expect.poll(async () => Math.abs(await main.evaluate((element) => element.scrollTop) - beforeY)).toBeLessThan(6);
  await expect(hit).toBeInViewport();
  await searchBox(page).fill("zzzzxq");
  await expect(count(page)).toHaveText("0 Verse gefunden · Luther 1912");
  await expect(page.getByText("Keine passenden Verse gefunden.", { exact: true })).toBeVisible();
});

test("OTB sucht offline in ihrer eigenen Ausgabe und kehrt zur geladenen Ansicht zurück", async ({ page, context }) => {
  await page.goto("/bibel");
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible({ timeout: 60000 });
  await context.setOffline(true);
  await page.reload();
  await button(page, "Open Translation Bible").click();
  await button(page, "Bibeltext durchsuchen").click();
  await searchBox(page).fill("Friede");
  await expect(count(page)).toHaveText("383 Verse gefunden · Open Translation Bible");
  await button(page, "Weitere Verse anzeigen").click();
  await expect(results(page)).toHaveCount(60);
  const hit = results(page).nth(31);
  await hit.scrollIntoViewIfNeeded();
  await hit.click();
  await expect(page).toHaveURL(/\/offen\/[A-Z0-9]+\?chapter=\d+&verse=\d+/);
  const verse = new URL(page.url()).searchParams.get("verse");
  await expect(page.getByRole("button", { name: new RegExp(`^Vers ${verse}:`) }).filter({ visible: true })).toBeInViewport();
  await page.goBack();
  await expect(searchBox(page)).toHaveValue("Friede");
  await expect(results(page)).toHaveCount(60);
  await expect(hit).toBeInViewport();
});

test("Garten erklärt das Wachstum, speichert den Abschluss und lässt die sieben Bilder schreibfrei ansehen", async ({ page, context }) => {
  await page.goto("/garten");
  await expect(page.getByTestId("garden-intro")).toBeVisible();
  await expect(page.getByTestId("garden-growth-explanation")).toContainText("als gelesen markierst");
  const before = await rawData(page);
  await button(page, "Zum Baum").click();
  await expect(page.getByTestId("garden-intro")).toHaveCount(0);
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible({ timeout: 60000 });
  await context.setOffline(true);
  await page.reload();
  await expect(button(page, "Wie wächst mein Baum?")).toBeVisible();
  await expect(page.getByTestId("garden-intro")).toHaveCount(0);
  await button(page, "Wie wächst mein Baum?").click();
  await expect(page.getByTestId("garden-growth-explanation")).toContainText("Wegschritte abschließt");
  await button(page, "Alle sieben Baumstadien ansehen").click();
  const gallery = page.getByRole("group", { name: "Baumstadien", exact: true });
  await expect(gallery.getByRole("button")).toHaveCount(7);
  await gallery.getByRole("button", { name: /^Baumstadium 7 ansehen:/ }).click();
  await expect(page.getByText("VORSCHAU · KEIN EIGENER FORTSCHRITT", { exact: true })).toBeVisible();
  await button(page, "Zurück zu deinem Baum").click();
  await expect(page.getByText("DEIN BAUM HEUTE", { exact: true })).toBeVisible();
  expect(await rawData(page)).toEqual(before);
});
