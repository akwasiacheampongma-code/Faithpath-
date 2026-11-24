import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { rawData, localData } from "./persistence";

const out = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/bible-paths-overview`;
const books = (page: Page) => page.getByRole("button", { name: /, \d+ Kapitel$/ });
const paths = (page: Page) => page.getByRole("button", { name: /Minuten, \d+ von \d+ Schritten$/ });
const pathIds = ["jesus", "anfang", "bibel", "beten", "gnade", "hoffnung", "vergebung", "frieden", "geschichte"];
// Compare navigation against actual accessible names captured from the original build.
const originalPathNames: string[] = JSON.parse(readFileSync(new URL("../../docs/evidence/bible-paths-focus/before.json", import.meta.url), "utf8")).scenes.find((s: any) => s.area === "wege" && s.profile === "returning" && s.theme === "light" && s.width === 390).paths;

async function profile(page: Page, theme: "light" | "dark" = "light") {
  await page.goto("/einstellungen");
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Mara");
  const save = page.getByRole("button", { name: "Namen speichern", exact: true });
  if (await save.isEnabled()) await save.click();
  await expect.poll(async () => (await localData(page))?.name).toBe("Mara");
  const record = structuredClone(await rawData(page)), d = record.data;
  d.settings.theme = theme; d.settings.reducedMotion = true; d.onboarded = true;
  d.reading = { book: "MRK", chapter: 4, from: 35, to: 41 };
  d.readingPosition = { ref: { ...d.reading }, verse: 38, mode: "read" };
  d.readChapters = ["MRK:1", "PSA:23"]; d.bookmarks = ["PSA:23:1"]; d.highlights = { "PSA:23:1": "olive" };
  d.readSteps = ["jesus:0"]; d.completedSteps = ["jesus:0"]; d.activePath = "jesus"; d.revision++;
  await page.evaluate(record => new Promise<void>((resolve, reject) => {
    const r = indexedDB.open("oliva-local-v1", 1);
    r.onsuccess = () => { const db = r.result, tx = db.transaction("state", "readwrite"); tx.objectStore("state").put(record, "main"); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error); };
    r.onerror = () => reject(r.error);
  }), record);
}

async function doubleText(page: Page) {
  await page.evaluate(() => {
    const nodes = [...document.querySelectorAll<HTMLElement>('[role="main"] div,[role="main"] p,[role="main"] h1,[role="main"] span,[role="main"] input,[role="main"] select')];
    const sizes = nodes.map(e => { const s = getComputedStyle(e); return { e, font: parseFloat(s.fontSize), line: parseFloat(s.lineHeight) }; });
    for (const { e, font, line } of sizes) { if (font) e.style.fontSize = font * 2 + "px"; if (line) e.style.lineHeight = line * 2 + "px"; }
  });
}

test("Bibel und Wege sind in vier mobilen Breiten und beiden Farbschemata lesbar und semantisch zugänglich", async ({ page }) => {
  test.setTimeout(240000); await mkdir(out, { recursive: true }); const results = [];
  for (const theme of ["light", "dark"] as const) {
    await profile(page, theme); const before = await rawData(page);
    for (const width of [320, 375, 390, 430]) for (const area of ["bibel", "wege"]) {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
      await page.goto("/" + area); await page.evaluate(() => document.fonts.ready);
      await expect(area === "bibel" ? books(page) : paths(page)).toHaveCount(area === "bibel" ? 66 : 9);
      const main = page.getByRole("main"), m = (await main.boundingBox())!;
      expect(await main.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (area === "bibel") {
        const search = (await page.getByRole("textbox", { name: "Buch suchen", exact: true }).boundingBox())!;
        const filter = (await page.getByRole("combobox", { name: "Bibelbereich", exact: true }).boundingBox())!;
        expect(search.y + search.height).toBeLessThanOrEqual(m.y + m.height);
        expect(filter.y + filter.height).toBeLessThanOrEqual(m.y + m.height);
        const list = (await page.getByTestId("bible-book-list").boundingBox())!, sword = (await page.getByTestId("spiritual-word-card").boundingBox())!;
        expect(sword.y).toBeGreaterThanOrEqual(list.y + list.height);
        expect((await books(page).first().boundingBox())!.height).toBeLessThanOrEqual(72);
      } else {
        expect((await paths(page).first().boundingBox())!.y).toBeLessThan(m.y + m.height);
        expect((await paths(page).first().boundingBox())!.height).toBeLessThan(240);
      }
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(axe.violations).toEqual([]); expect(await rawData(page)).toEqual(before);
      results.push({ area, theme, width, axeViolations: axe.violations, rawRecordExact: true });
    }
  }
  await writeFile(out + "/accessibility.json", JSON.stringify({ localChromiumOnly: true, realDeviceTest: false, results }, null, 2) + "\n");
});

test("200 Prozent Text lässt lange Buchnamen, Kapitel und alle Wegefilter ohne horizontales Scrollen erreichbar", async ({ page }) => {
  test.setTimeout(180000); const results = []; await mkdir(out, { recursive: true });
  for (const theme of ["light", "dark"] as const) {
    await profile(page, theme); const before = await rawData(page);
    for (const width of [320, 375, 390, 430]) for (const area of ["bibel", "wege"]) {
      await page.setViewportSize({ width, height: 844 }); await page.goto("/" + area);
      if (area === "bibel") {
        await page.getByRole("textbox", { name: "Buch suchen", exact: true }).fill("Psalmen");
        await page.getByRole("button", { name: "Psalmen, 150 Kapitel", exact: true }).click();
      } else await page.getByRole("combobox", { name: "Wege filtern", exact: true }).selectOption("Für deine Lebenssituation");
      await doubleText(page);
      const main = page.getByRole("main"); expect(await main.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
      if (area === "bibel") {
        const last = page.getByRole("button", { name: "Psalmen, Kapitel 150", exact: true }); await expect(last).toBeEnabled();
        expect((await last.boundingBox())!.width).toBeGreaterThanOrEqual(44);
        const filter = page.getByRole("combobox", { name: "Bibelbereich", exact: true });
        for (const value of ["NT", "AT", "Alle"]) {
          await filter.selectOption(value);
          const visibleValue = page.getByTestId("bible-scope-value");
          expect(await visibleValue.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
          expect(await main.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
        }
      } else {
        await expect(paths(page)).toHaveCount(2);
        const value = page.locator('span[aria-hidden="true"]').filter({ hasText: /^Für deine Lebenssituation$/ });
        expect(await value.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
        const filter = page.getByRole("combobox", { name: "Wege filtern", exact: true });
        await filter.focus(); await page.keyboard.press("Home"); await page.keyboard.press("Enter");
        await expect(filter).toHaveValue("Alle Wege"); await expect(filter).toBeFocused(); await expect(paths(page)).toHaveCount(9);
      }
      expect(await rawData(page)).toEqual(before); results.push({ area, theme, width, textPercent: 200, rawRecordExact: true });
    }
  }
  await writeFile(out + "/text200.json", JSON.stringify({ method: "CSS text enlargement; not OS font scaling", results }, null, 2) + "\n");
});

test("die Tastatur öffnet nach der Buchzeile unmittelbar die Kapitel und den bestehenden Reader", async ({ page }) => {
  await profile(page); await page.goto("/bibel"); const before = await localData(page);
  await page.getByRole("textbox", { name: "Buch suchen", exact: true }).fill(" M a r k u s ");
  const book = page.getByRole("button", { name: "Markus, 16 Kapitel", exact: true });
  await book.focus(); await page.keyboard.press("Enter"); await expect(book).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab"); await expect(page.getByRole("button", { name: "Markus, Kapitel 1, gelesen", exact: true })).toBeFocused();
  await page.keyboard.press("Tab"); await expect(page.getByRole("button", { name: "Markus, Kapitel 2", exact: true })).toBeFocused();
  await page.keyboard.press("Enter"); await expect(page).toHaveURL(/\/lesen\/MRK\?chapter=2(?:&|$)/);
  const after = await localData(page);
  for (const key of ["notes", "drafts", "bookmarks", "highlights", "readChapters", "readSteps", "completedSteps", "growthStage", "imports"] as const) expect(after[key], key).toEqual(before[key]);
});

test("der Wegefilter behält alle Kategorien und der Tastatureinstieg erreicht jeden der neun Originalwege", async ({ page }) => {
  await profile(page); await page.goto("/wege"); const before = await rawData(page);
  const filter = page.getByRole("combobox", { name: "Wege filtern", exact: true });
  expect(await filter.evaluate(e => e.tagName)).toBe("SELECT");
  const categories = ["Alle Wege", "Für deinen Anfang", "Bibel verstehen", "Glaube im Alltag", "Für deine Lebenssituation"];
  await expect(filter.locator("option")).toHaveText(categories);
  await filter.focus();
  for (const [i, category] of categories.slice(1).entries()) {
    await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter"); await expect(filter).toHaveValue(category); await expect(filter).toBeFocused();
    await expect(paths(page)).toHaveCount([2, 3, 2, 2][i]!);
  }
  expect(await rawData(page)).toEqual(before);
  for (const [i, id] of pathIds.entries()) {
    await page.goto("/wege"); const row = page.getByTestId("path-list-item-" + id);
    const originalName = originalPathNames[i]!;
    await expect(row).toHaveAccessibleName(originalName);
    await row.focus(); await page.keyboard.press("Enter"); await expect(page).toHaveURL(new RegExp("/weg/" + id + "(?:\\?|$)"));
    await expect(page.getByRole("heading", { name: originalName.split(", 15 Minuten")[0]!, exact: true })).toBeVisible(); expect(await rawData(page)).toEqual(before);
  }
  await page.goto("/wege"); await page.getByRole("button", { name: "Themen", exact: true }).click(); await expect(page).toHaveURL(/\/wege\?bereich=themen$/);
  await page.goto("/wege"); await page.getByRole("button", { name: "Deine persönlichen Vorhaben", exact: true }).click(); await expect(page).toHaveURL(/\/vorhaben$/);
  expect(await rawData(page)).toEqual(before);
});

test("beide Übersichten bleiben offline nach Neustart mit unveränderten persönlichen Daten nutzbar", async ({ page, context }) => {
  await profile(page); await page.goto("/bibel"); await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await page.goto("/wege"); const before = await rawData(page); await context.setOffline(true);
  await page.reload(); await expect(paths(page)).toHaveCount(9); expect(await rawData(page)).toEqual(before);
  await page.goto("/bibel"); await expect(books(page)).toHaveCount(66); await expect(page.getByRole("button", { name: "Epheser 6,17 lesen", exact: true })).toBeEnabled();
  expect(await rawData(page)).toEqual(before);
});
