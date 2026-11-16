import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { localData, rawData } from "./persistence";

const bookRows = (page: Page) =>
  page.getByRole("button", { name: /, \d+ Kapitel$/ });
const scope = (page: Page) =>
  page.getByRole("combobox", { name: "Bibelbereich", exact: true });
const search = (page: Page) =>
  page.getByRole("textbox", { name: "Buch suchen", exact: true });

async function savedProfile(page: Page) {
  await page.goto("/einstellungen");
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Ada");
  await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.name).toBe("Ada");
}

test("die Bibel beginnt mit allen 66 Büchern und grenzt NT und AT ohne persönliche Daten ein", async ({ page }) => {
  await page.goto("/bibel");
  await expect(scope(page)).toHaveValue("Alle");
  await expect(scope(page).locator("option")).toHaveText([
    "Gesamte Bibel",
    "Neues Testament (NT)",
    "Altes Testament (AT)",
  ]);
  await expect(bookRows(page)).toHaveCount(66);
  expect(await rawData(page)).toBeUndefined();

  await scope(page).selectOption("NT");
  await expect(bookRows(page)).toHaveCount(27);
  await expect(page.getByRole("button", { name: "Markus, 16 Kapitel", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true })).toHaveCount(0);
  await search(page).fill(" \u00a0\u2009\u202f ");
  await expect(bookRows(page)).toHaveCount(27);

  await scope(page).selectOption("AT");
  await expect(bookRows(page)).toHaveCount(39);
  await expect(page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Markus, 16 Kapitel", exact: true })).toHaveCount(0);
  await scope(page).selectOption("Alle");
  await expect(bookRows(page)).toHaveCount(66);
  expect(await rawData(page)).toBeUndefined();
});

test("Buchnamen vertragen Leertasten, Unicode-Abstände, Großschreibung und Punkte im Zahlpräfix", async ({ page }) => {
  await savedProfile(page);
  const before = await rawData(page);
  await page.goto("/bibel");

  for (const query of ["Markus ", "  MARKUS  ", "M a r k u s", "\u00a0Mar\u2009kus\u202f"]) {
    await search(page).fill(query);
    await expect(bookRows(page)).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Markus, 16 Kapitel", exact: true })).toBeVisible();
  }
  for (const query of ["1 Mose", "1.Mose", "1. Mose", " 1 . M o s e \u00a0", "１．Ｍｏｓｅ"]) {
    await search(page).fill(query);
    await expect(bookRows(page)).toHaveCount(1);
    await expect(page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true })).toBeVisible();
  }
  await search(page).fill("\u00a0 \u2009\u202f");
  await expect(bookRows(page)).toHaveCount(66);
  expect(await rawData(page)).toEqual(before);
});

test("der native Web-Auswahlschalter lässt sich mit der Tastatur bedienen und behält den Fokus", async ({ page }) => {
  await page.goto("/bibel");
  expect(await scope(page).evaluate(node => node.tagName)).toBe("SELECT");
  await scope(page).focus();
  await expect(scope(page)).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(scope(page)).toHaveValue("NT");
  await expect(bookRows(page)).toHaveCount(27);
  await expect(scope(page)).toBeFocused();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(scope(page)).toHaveValue("AT");
  await expect(bookRows(page)).toHaveCount(39);
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(scope(page)).toHaveValue("Alle");
  await expect(bookRows(page)).toHaveCount(66);
  expect(await rawData(page)).toBeUndefined();
});

test("Suche und Bereich erhalten Buchschwert-Kontext und öffnen das gewählte Kapitel", async ({ page }) => {
  await savedProfile(page);
  const before = await rawData(page);
  await page.goto("/bibel");
  await scope(page).selectOption("AT");
  const query = " 1 . M o s e \u00a0";
  await search(page).fill(query);
  await page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true }).click();
  await page.getByRole("button", { name: "Buchschwert ansehen", exact: true }).click();
  await expect(page).toHaveURL(/\/buch\/GEN(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "1. Mose", exact: true })).toBeVisible();
  expect(await rawData(page)).toEqual(before);
  await page.getByRole("button", { name: "Zurück", exact: true }).click();
  await expect(page).toHaveURL(/\/bibel(?:\?|$)/);
  await expect(scope(page)).toHaveValue("AT");
  await expect(search(page)).toHaveValue(query);
  await expect(page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true })).toHaveAttribute("aria-expanded", "true");
  expect(await rawData(page)).toEqual(before);

  await page.getByRole("button", { name: "1. Mose, Kapitel 1", exact: true }).click();
  await expect(page).toHaveURL(/\/lesen\/GEN\?chapter=1(?:&|$)/);
  await expect(page.getByRole("button", { name: /^Vers 1:/ })).toBeVisible();
  await expect.poll(async () => (await localData(page))?.reading).toMatchObject({ book: "GEN", chapter: 1 });
  const after = await localData(page);
  expect(after.readChapters).toEqual(before.data.readChapters);
  expect(after.bookmarks).toEqual(before.data.bookmarks);
  expect(after.notes).toEqual(before.data.notes);
  expect(after.ntStudy).toEqual(before.data.ntStudy);
});

test("die NT-Fragenübersicht nutzt dieselbe Buchsuche und bleibt auf ihre 27 Bücher begrenzt", async ({ page }) => {
  await page.goto("/verstehen");
  const ntRows = page.getByRole("button", { name: /: Kapitel auswählen$/ });
  const ntSearch = page.getByRole("textbox", { name: "NT-Buch suchen", exact: true });
  await expect(ntRows).toHaveCount(27);
  for (const query of [" M a r k u s \u00a0", "MARKUS "]) {
    await ntSearch.fill(query);
    await expect(ntRows).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Markus: Kapitel auswählen", exact: true })).toBeVisible();
  }
  for (const query of ["1 Korinther", "1.Korinther", " 1 . K o r i n t h e r \u2009"]) {
    await ntSearch.fill(query);
    await expect(ntRows).toHaveCount(1);
    await expect(page.getByRole("button", { name: "1. Korinther: Kapitel auswählen", exact: true })).toBeVisible();
  }
  await ntSearch.fill("1 Mose");
  await expect(ntRows).toHaveCount(0);
  await expect(page.getByText(/Zu dieser Suche gibt es kein NT-Buch/)).toBeVisible();
  await ntSearch.fill(" \u00a0\u2009\u202f");
  await expect(ntRows).toHaveCount(27);
  expect(await rawData(page)).toBeUndefined();
});

test("Buchsuche und Dropdown sind bei 320 Pixeln hell und 1440 Pixeln dunkel zugänglich", async ({ page }, testInfo) => {
  for (const [width, theme] of [[320, "light"], [1440, "dark"]] as const) {
    await page.setViewportSize({ width, height: width === 320 ? 760 : 1000 });
    await page.goto("/einstellungen");
    await page.getByRole("button", { name: theme === "light" ? "Hell" : "Dunkel", exact: true }).click();
    await expect.poll(async () => (await localData(page))?.settings.theme).toBe(theme);
    const before = await rawData(page);
    await page.goto("/bibel");
    await expect(scope(page)).toHaveValue("Alle");
    await expect(bookRows(page)).toHaveCount(66);
    await scope(page).focus();
    await expect(scope(page)).toBeFocused();
    expect(await scope(page).evaluate(node => {
      const style = getComputedStyle(node);
      return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`book-search-${width}-${theme}.png`) });
    expect(await rawData(page)).toEqual(before);
  }
});
