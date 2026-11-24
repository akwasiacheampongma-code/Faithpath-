import { mkdir } from "node:fs/promises";
import { devices, expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { fixtureTime, legacyJournalDraft, legacyThought, seedCollectionProfile } from "./collection-fixture";
import { localData, rawData } from "./persistence";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).filter({ visible: true });
const legacyEditor = (page: Page) => page.getByRole("textbox", { name: "Deine Worte", exact: true });
const freeEditor = (page: Page) => page.getByRole("textbox", { name: "Notiztext", exact: true });
const search = (page: Page) => page.getByRole("textbox", { name: "Deine Sammlung durchsuchen", exact: true });
const legacyRow = (page: Page) => page.getByTestId("collection-note-fixture-thought");
const freeRow = (page: Page) => page.getByTestId("collection-notebook-notiz-fixture-free");

const longThought = "Gebet am Morgen\n" +
  "Danke für die Stille am See und für die Worte, die mich durch den kommenden Tag begleiten.\n\n".repeat(96) +
  "Schlusswort der Testnotiz.";
const newText = "Ruhe am See\nHeute möchte ich mir einen Moment nehmen und dem Wind in den Bäumen zuhören.";
const archivedPrayer = { ...legacyThought(longThought), ref: { book: "MRK", chapter: 4, from: 35, to: 41 } };

test("Gedanken, Gebete und freie Notizen erscheinen in einer Liste und bearbeiten getrennte Bestände offline", async ({ page, context }) => {
  const pending = legacyJournalDraft("Ein anderer Journalentwurf bleibt für später.");
  await seedCollectionProfile(page, (data) => {
    data.notes = [archivedPrayer];
    data.drafts = [pending];
    data.bookmarks = ["MRK:4:35"];
    data.highlights = { "MRK:4:36": "olive" };
  });
  await page.goto("/sammlung");
  await expect(button(page, "Notizen")).toHaveCount(0);
  await expect(search(page)).toBeVisible();
  await expect(legacyRow(page)).toHaveAccessibleName("Eintrag öffnen: Gebet am Morgen");
  const before = await rawData(page);
  await legacyRow(page).click();
  await expect(legacyEditor(page)).toHaveValue(longThought);
  expect(await rawData(page)).toEqual(before);
  await expect(button(page, "Markus 4,35–41")).toBeVisible();
  await button(page, "Sammlung").click();
  await expect(search(page)).toBeVisible();
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);

  await button(page, "Neue Notiz").click();
  await expect(freeEditor(page)).toBeFocused();
  await freeEditor(page).fill(newText);
  await expect(page.getByText("Auf diesem Gerät gespeichert", { exact: true })).toBeVisible();
  await button(page, "Sammlung").click();
  await expect(button(page, "Notiz öffnen: Ruhe am See")).toBeVisible();
  await expect(legacyRow(page)).toBeVisible();
  await search(page).fill("Schlusswort");
  await expect(legacyRow(page)).toBeVisible();
  await expect(button(page, "Notiz öffnen: Ruhe am See")).toHaveCount(0);
  await legacyRow(page).click();
  const edited = longThought.replace("Schlusswort der Testnotiz.", "Neu geschriebenes Schlusswort.");
  await legacyEditor(page).fill(edited);
  await expect(page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(legacyEditor(page)).toHaveValue(edited);
  await button(page, "Sammlung").click();
  await expect(legacyRow(page)).toBeVisible();
  const saved = await localData(page);
  expect(saved.notes).toEqual([{ ...archivedPrayer, text: edited, updatedAt: expect.any(String) }]);
  expect(saved.notebook?.[0]?.text).toBe(newText);
  expect(saved.drafts).toEqual([pending]);
  expect(saved.bookmarks).toEqual(["MRK:4:35"]);
  expect(saved.highlights).toEqual({ "MRK:4:36": "olive" });
  await button(page, "Lesezeichen").click();
  await expect(button(page, "Im Kapitel öffnen")).toBeVisible();
  await button(page, "Markierungen").click();
  await expect(button(page, "Im Kapitel öffnen")).toBeVisible();
  await button(page, "Entwürfe").click();
  await button(page, "Entwurf fortsetzen: Deine Journalworte").click();
  await expect(legacyEditor(page)).toHaveValue(pending.values.text);
});

test("die Suche bleibt erhalten, während du den Bereich wechselst", async ({ page }) => {
  await seedCollectionProfile(page, (data) => { data.notes = [archivedPrayer]; });
  await page.goto("/sammlung");
  const before = await rawData(page);
  await search(page).fill("Schlusswort");
  await expect(legacyRow(page)).toBeVisible();
  await button(page, "Lesezeichen").click();
  await expect(search(page)).toHaveValue("Schlusswort");
  await expect(page.getByText("Keine passenden Verse.", { exact: true })).toBeVisible();
  await button(page, "Gedanken").click();
  await expect(search(page)).toHaveValue("Schlusswort");
  await expect(legacyRow(page)).toBeVisible();
  expect(await rawData(page)).toEqual(before);
});

test("konkurrierende Änderung eines älteren Eintrags bewahrt die gespeicherte Fassung und die Eingabe in der Sitzung", async ({ page, context }) => {
  await seedCollectionProfile(page, (data) => { data.notes = [legacyThought("Gemeinsamer Gedanke")]; });
  await page.goto("/sammlung");
  await legacyRow(page).click();
  const other = await context.newPage();
  await other.goto(page.url());
  await expect(legacyEditor(other)).toHaveValue("Gemeinsamer Gedanke");
  await legacyEditor(page).fill("Erste gespeicherte Fassung");
  await button(page, "Sammlung").click();
  await expect(legacyRow(page)).toHaveAccessibleName("Eintrag öffnen: Erste gespeicherte Fassung");
  await legacyEditor(other).fill("Zweite Fassung bleibt als Entwurf");
  await button(other, "Sammlung").click();
  await expect(other.getByText(/Ein anderes Fenster hat die Daten geändert/)).toBeVisible();
  await expect(legacyEditor(other)).toHaveValue("Zweite Fassung bleibt als Entwurf");
  const data = await localData(other);
  expect(data.notes[0]?.text).toBe("Erste gespeicherte Fassung");
  expect(data.drafts).toEqual([]);
  await button(other, "Entwurf behalten und zurück").click();
  await button(other, "Entwürfe").click();
  await expect(button(other, "Ungesicherte Entwürfe exportieren")).toBeVisible();
  await button(other, "Entwurf fortsetzen: Deine Journalworte").click();
  await expect(legacyEditor(other)).toHaveValue("Zweite Fassung bleibt als Entwurf");
});

function visualProfile(data: import("../../src/state/model").AppData) {
  data.onboarded = true;
  data.settings.theme = "light";
  data.notes = [
    archivedPrayer,
    { ...legacyThought("Mein Gedanke zu Markus\nDer Vers über das Vertrauen ist mir im Gedächtnis geblieben."),
      id: "fixture-second", updatedAt: "2026-11-16T12:00:00.000Z", ref: archivedPrayer.ref },
  ];
  data.version = 12;
  data.notebook = [
    { id: "notiz-fixture-free", text: newText, link: null, pinned: true, deletedAt: null, revision: 1,
      createdAt: fixtureTime, updatedAt: fixtureTime },
  ];
}

async function capture(page: Page, name: string) {
  const directory = process.env.OLIVA_EVIDENCE_DIR;
  if (!directory) return;
  await mkdir(directory + "/collection-notebook", { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("main").filter({ visible: true }).evaluate((main) => { main.scrollTop = 0; });
  await page.screenshot({ path: directory + "/collection-notebook/" + name + ".png", animations: "disabled" });
}

async function reflows(page: Page) {
  const main = page.getByRole("main").filter({ visible: true });
  await expect(main).toBeVisible();
  expect(await main.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}

test.describe("mobile Sammlungsansicht", () => {
  const { defaultBrowserType: _engine, ...phone } = devices["iPhone 13"];
  test.use(phone);

  test("kompakte Vorschau und Schreibansicht bei vier Smartphone-Breiten in Hell und Dunkel", async ({ page }) => {
    const baseline = process.env.OLIVA_COLLECTION_BASELINE_URL;
    if (baseline) {
      await seedCollectionProfile(page, visualProfile, baseline);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(baseline + "/sammlung");
      await expect(button(page, "Notizen")).toBeVisible();
      await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
      await capture(page, "before-list-390");
    }

    await seedCollectionProfile(page, visualProfile);
    await page.goto("/sammlung");
    await expect(legacyRow(page)).toBeVisible();
    for (const theme of ["light", "dark"]) {
      if (theme === "dark") {
        await page.goto("/einstellungen");
        await button(page, "Dunklen Modus aktivieren").click();
        await expect.poll(async () => (await localData(page)).settings.theme).toBe("dark");
        await page.goto("/sammlung");
      }
      for (const width of [320, 375, 390, 430]) {
        await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
        await expect(legacyRow(page)).toBeVisible();
        const preview = legacyRow(page).getByText(/^Danke für die Stille/);
        expect(await preview.evaluate((element) => {
          const style = getComputedStyle(element);
          return element.getBoundingClientRect().height <= 2 * parseFloat(style.lineHeight) + 1;
        })).toBe(true);
        expect(await legacyRow(page).getByText("17. Nov. 2026", { exact: true }).count()).toBe(1);
        expect((await button(page, "Neue Notiz").boundingBox())?.width).toBeGreaterThanOrEqual(44);
        await reflows(page);
        if (width === 390) await capture(page, "after-list-390-" + theme);
        await freeRow(page).tap();
        await expect(freeEditor(page)).toHaveValue(newText);
        await reflows(page);
        if (width === 390) await capture(page, "after-editor-390-" + theme);
        await button(page, "Sammlung").tap();
        await expect(legacyRow(page)).toBeVisible();
      }
    }
  });

  test("200 Prozent Schrift, Tastatur und Axe sichern Listen- und Editorbedienung", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await seedCollectionProfile(page, visualProfile);
    await page.goto("/sammlung");
    const amplifyText = async () => {
      await page.getByRole("main").filter({ visible: true }).evaluate((main) => {
        for (const element of main.querySelectorAll<HTMLElement>("textarea, input, [dir], [data-testid=collection-tabs]")) {
          const { fontSize, lineHeight } = getComputedStyle(element);
          element.style.fontSize = parseFloat(fontSize) * 2 + "px";
          if (lineHeight !== "normal") element.style.lineHeight = parseFloat(lineHeight) * 2 + "px";
        }
      });
    };
    await expect(legacyRow(page)).toBeVisible();
    await amplifyText();
    await reflows(page);
    expect((await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await button(page, "Neue Notiz").focus();
    await page.keyboard.press("Enter");
    await expect(freeEditor(page)).toBeFocused();
    await page.keyboard.insertText("Sofort schreiben bei großer Schrift");
    await expect(page.getByText("Auf diesem Gerät gespeichert", { exact: true })).toBeVisible();
    await amplifyText();
    await reflows(page);
    expect((await new AxeBuilder({ page }).include("main").withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await button(page, "Sammlung").focus();
    await page.keyboard.press("Enter");
    await expect(button(page, "Notiz öffnen: Sofort schreiben bei großer Schrift")).toBeVisible();
  });
});
