import { expect, test, type Page } from "@playwright/test";
import { localData } from "./persistence";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).filter({ visible: true });
const visibleVerse = (page: Page, n: number) => page.getByRole("button", { name: new RegExp(`^Vers ${n}:`) }).filter({ visible: true });

test("das Übersetzungsdropdown bietet alle Ausgaben bei schmalem Bildschirm per Tastatur an", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/bibel");
  const picker = page.getByRole("combobox", { name: "Bibelübersetzung", exact: true });
  await expect(picker.getByRole("option")).toHaveText(["Luther 1912", "Open Translation Bible", "Schlachter 1951"]);
  await expect(picker).toHaveValue("luther");
  await picker.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(picker).toHaveValue("otb");
  await expect(picker).toBeFocused();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(picker).toHaveValue("schlachter1951");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await button(page, "Bibeltext durchsuchen").click();
  await expect(picker).toHaveValue("schlachter1951");
});

for (const [edition, label, url] of [
  ["otb", "Open Translation Bible", "/offen/JHN?chapter=6&verse=35"],
  ["schlachter1951", "Schlachter 1951", "/lesen/JHN?chapter=6&edition=schlachter1951&verse=35"],
] as const) {
  test(`${label} nutzt den ganzen Reader und speichert Daten für ihre eigene Ausgabe`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/lesen/JHN?chapter=6&verse=36");
    await expect.poll(async () => (await localData(page))?.readingPosition?.verse).toBe(36);
    await page.goto(url);
    const verse = visibleVerse(page, 35);
    await expect(verse).toBeInViewport();
    await expect(verse).toHaveAttribute("aria-pressed", "true");
    const selection = page.getByRole("toolbar", { name: "Versauswahl", exact: true });
    await selection.getByRole("button", { name: "Bibeltext kopieren", exact: true }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain(label);
    await selection.getByRole("button", { name: "Markieren", exact: true }).click();
    await selection.getByRole("button", { name: "Oliv markieren", exact: true }).click();
    await selection.getByRole("button", { name: "Mehr", exact: true }).click();
    const actions = page.getByRole("dialog", { name: "Weitere Versaktionen", exact: true });
    await actions.getByRole("button", { name: "Merken", exact: true }).click();
    await expect.poll(async () => (await localData(page)).bookmarks).toContain(`${edition}:JHN:6:35`);
    await actions.getByRole("button", { name: "Schließen", exact: true }).click();
    await selection.getByRole("button", { name: "Notiz", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Deine Notiz", exact: true });
    const note = "Meine Testnotiz zur Ausgabe " + label;
    await dialog.getByRole("textbox", { name: "Notiz zu Vers 35", exact: true }).fill(note);
    await dialog.getByRole("button", { name: "Notiz speichern", exact: true }).click();
    await expect.poll(async () => (await localData(page)).notes.find((entry) => entry.text === note)?.ref)
      .toMatchObject({ book: "JHN", chapter: 6, from: 35, to: 35, edition });
    if (await dialog.isVisible()) await dialog.getByRole("button", { name: "Schließen", exact: true }).click();
    await button(page, "Kapitel als gelesen bestätigen").click();
    await expect.poll(async () => (await localData(page)).readChapters).toContain(`${edition}:JHN:6`);

    await page.goto("/");
    await expect(page.getByTestId("home-reading-entry")).toContainText(label);
    await button(page, "Weiterlesen").click();
    await expect.poll(async () => (await localData(page)).reading.edition).toBe(edition);
    const data = await localData(page);
    expect(data.version).toBe(13);
    expect(data.editionReading?.luther?.position?.verse).toBe(36);
    expect(data.highlights).toEqual({ [`${edition}:JHN:6:35`]: "olive" });

    await page.goto("/sammlung?tab=Lesezeichen");
    await expect(page.getByText("Johannes 6,35 · " + label, { exact: true })).toBeVisible();
    await button(page, "Im Kapitel öffnen").click();
    await expect(visibleVerse(page, 35)).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => (await localData(page)).reading.edition).toBe(edition);

    await page.goto("/bibel?ausgabe=luther");
    await expect(page.getByText("Zuletzt bei Vers 36", { exact: true })).toBeVisible();
    await button(page, "Weiterlesen").click();
    await expect(visibleVerse(page, 36)).toBeInViewport();
    await expect.poll(async () => (await localData(page)).readingPosition?.verse).toBe(36);
    expect((await localData(page)).reading.edition).toBeUndefined();
  });
}

test("Schlachter 1951 ist vor dem ersten Öffnen vollständig offline verfügbar", async ({ page, context }) => {
  await page.goto("/bibel");
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible({ timeout: 60000 });
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("combobox", { name: "Bibelübersetzung", exact: true }).selectOption("schlachter1951");
  await button(page, "Bibeltext durchsuchen").click();
  await page.getByRole("textbox", { name: "Wörter im Bibeltext suchen", exact: true }).fill("Friede");
  await expect(page.getByTestId("bible-search-count")).toHaveText("279 Verse gefunden · Schlachter 1951");
  await page.getByTestId("bible-verse-result").first().click();
  await expect(visibleVerse(page, 15)).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => (await localData(page)).readingPosition?.verse).toBe(15);
  await page.reload();
  await expect(visibleVerse(page, 15)).toBeInViewport();
  await button(page, "Leseeinstellungen").click();
  await button(page, "Zu Open Translation Bible wechseln").click();
  await expect(page).toHaveURL(/\/offen\/GEN\?chapter=15/);
  await expect(page.getByTestId("reader-flow")).toBeVisible();
});
