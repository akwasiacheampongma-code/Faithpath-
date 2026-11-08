import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { localData, rawData } from "./persistence";

const david = "david-before-goliath";
const stories = ["noah", "abraham", david, "nativity", "easter-dawn"];
const screenshots = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/stories/screens`;
const davidWebp = "**/david-before-goliath-*.webp";
test.use({ screenshot: "only-on-failure" });

async function savedProfile(page: Page) {
  await page.goto("/einstellungen");
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Ada");
  await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.name).toBe("Ada");
}

async function openLibrary(page: Page) {
  await page.goto("/bibel");
  await page.getByRole("button", { name: "Eine Geschichte entdecken", exact: true }).click();
}

async function artworkReady(page: Page, id = david) {
  await expect(page.getByTestId(`story-artwork-${id}`).filter({ visible: true })).toHaveAttribute("aria-busy", "false");
  await expect(page.getByTestId(`story-error-${id}`)).toHaveCount(0);
  await expect.poll(() => page.getByTestId(`story-image-${id}`).filter({ visible: true }).evaluate(node => {
    const image = node instanceof HTMLImageElement ? node : node.querySelector("img");
    return !!image && image.complete && image.naturalWidth > 0;
  })).toBe(true);
}

function learningProgress(data: Awaited<ReturnType<typeof localData>>) {
  return {
    readChapters: data.readChapters,
    readPassages: data.readPassages,
    readSteps: data.readSteps,
    completedSteps: data.completedSteps,
    growthStage: data.growthStage,
    retainedReviewGrowth: data.retainedReviewGrowth,
  };
}

async function noOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test("fünf Geschichten bewahren den Bestand; David öffnet exakt acht Verse und zählt nur nach ausdrücklicher Bestätigung", async ({ page }) => {
  await savedProfile(page);
  const before = await rawData(page);
  await openLibrary(page);
  for (const id of stories) await artworkReady(page, id);
  await expect(page.getByTestId("story-card-david-before-goliath").getByText("Vertrauen vor dem ersten Schritt.", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: /Künstlerische Interpretation: David steht mit Stab und Tasche/ })).toBeVisible();
  expect(await rawData(page)).toEqual(before);

  const progress = learningProgress(await localData(page));
  await page.getByRole("button", { name: "Davids Vorbereitung lesen", exact: true }).click();
  // Expo Router completes the transition asynchronously; read the parameters
  // only once the actual destination has arrived, without forcing navigation.
  await expect(page).toHaveURL(/\/lesen\/1SA\?/);
  const url = new URL(page.url());
  expect(url.pathname).toBe("/lesen/1SA");
  expect(Object.fromEntries(url.searchParams)).toMatchObject({ chapter: "17", from: "38", to: "45", mode: "deep" });
  await expect(page.getByRole("button", { name: "Tiefer verstehen", exact: true })).toHaveAttribute("aria-pressed", "true");
  await artworkReady(page);
  const context = page.getByTestId(`story-card-${david}`).filter({ visible: true });
  await expect(context.getByText("KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT", { exact: true })).toBeVisible();
  await expect(context.getByText("HERR Zebaoth", { exact: true })).toBeVisible();
  await expect(context.getByText(/vom Ausgang des Kampfes erzählt erst der weitere Text/)).toBeVisible();
  await expect(context.getByText(/Unabhängige Fachfreigabe steht aus/)).toBeVisible();
  for (let verse = 38; verse <= 45; verse++) await expect(page.getByRole("button", { name: new RegExp(`^Vers ${verse}:`) })).toBeAttached();
  await expect(page.getByRole("button", { name: /^Vers (?:37|46):/ })).toHaveCount(0);
  expect(learningProgress(await localData(page))).toEqual(progress);
  await page.getByRole("button", { name: "Abschnitt als gelesen bestätigen", exact: true }).click();
  await expect.poll(async () => (await localData(page)).readPassages).toEqual(["1SA:17:38:45"]);
  expect((await localData(page)).readChapters).toEqual(progress.readChapters);
  expect((await localData(page)).completedSteps).toEqual(progress.completedSteps);
});

test("das vollständige Offlinepaket öffnet David und alle bisherigen Bilder erstmals offline und nach Neustart", async ({ page, context }) => {
  await savedProfile(page);
  const before = await rawData(page);
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  // No story route or illustration has been opened before disconnecting.
  await context.setOffline(true);
  await openLibrary(page);
  for (const id of stories) await artworkReady(page, id);
  expect(await rawData(page)).toEqual(before);
  await page.reload();
  await page.getByRole("button", { name: "Eine Geschichte entdecken", exact: true }).click();
  for (const id of stories) await artworkReady(page, id);
  expect(await rawData(page)).toEqual(before);
  await page.getByRole("button", { name: "Davids Vorbereitung lesen", exact: true }).click();
  await artworkReady(page);
  await expect(page.getByRole("button", { name: /^Vers 38:/ })).toBeAttached();
  await expect(page.getByRole("button", { name: /^Vers 45:/ })).toBeAttached();
  expect(learningProgress(await localData(page))).toEqual(learningProgress(before.data));
});

test("Geschichten und David-Kontext bleiben auf kleinen und großen Displays in Hell und Dunkel lesbar", async ({ page }) => {
  await mkdir(screenshots, { recursive: true });
  await savedProfile(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, theme] of [[320, "light"], [390, "dark"], [1440, "light"]] as const) {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
    await page.goto("/einstellungen");
    const toggle = page.getByRole("button", {
      name: theme === "dark" ? "Dunklen Modus aktivieren" : "Hellen Modus aktivieren",
      exact: true,
    });
    await expect(page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" })).toHaveValue("Ada");
    if ((await localData(page)).settings.theme !== theme) await toggle.click();
    await expect.poll(async () => (await localData(page)).settings.theme).toBe(theme);
    const before = await rawData(page);
    await openLibrary(page);
    for (const id of stories) await artworkReady(page, id);
    await noOverflow(page);
    const frame = await page.getByTestId(`story-artwork-${david}`).filter({ visible: true }).boundingBox();
    expect(frame).not.toBeNull();
    expect(frame!.width / frame!.height).toBeCloseTo(8 / 5, 2);
    await page.getByTestId(`story-artwork-${david}`).filter({ visible: true }).screenshot({ path: `${screenshots}/david-artwork-${width}-${theme}.png` });
    await page.getByTestId(`story-card-${david}`).filter({ visible: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${screenshots}/david-library-${width}-${theme}.png` });
    await page.getByTestId(`story-card-${david}`).filter({ visible: true }).screenshot({ path: `${screenshots}/david-card-${width}-${theme}.png` });
    if (width === 1440) await page.getByTestId("story-card-easter-dawn").screenshot({ path: `${screenshots}/easter-card-wide-${theme}.png` });
    expect(await rawData(page)).toEqual(before);
    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(scan.violations).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Davids Vorbereitung lesen", exact: true }).click();
  await artworkReady(page);
  const contextFrame = await page.getByTestId(`story-artwork-${david}`).filter({ visible: true }).boundingBox();
  expect(contextFrame!.width / contextFrame!.height).toBeCloseTo(3 / 2, 2);
  await noOverflow(page);
  await page.getByTestId(`story-card-${david}`).filter({ visible: true }).scrollIntoViewIfNeeded();
  await page.getByTestId(`story-card-${david}`).filter({ visible: true }).screenshot({ path: `${screenshots}/david-context-390-light.png` });
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations).toEqual([]);
});

test.describe("echte Bildfehler ohne Service-Worker", () => {
  test.use({ serviceWorkers: "block" });
  test("drei ausgefallene Bildvarianten zeigen einen erreichbaren Wiederholungsbutton und laden danach wirklich", async ({ page }) => {
    await savedProfile(page);
    const before = await rawData(page), failed = new Set<string>(), errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route(davidWebp, route => { failed.add(route.request().url()); return route.abort(); });
    await openLibrary(page);
    await expect(page.getByTestId(`story-error-${david}`)).toHaveRole("group");
    await expect(page.getByTestId(`story-error-status-${david}`)).toHaveText("Die Illustration konnte nicht geladen werden.");
    await expect(page.getByRole("button", { name: "Bild erneut laden", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Davids Vorbereitung lesen", exact: true })).toBeEnabled();
    expect(failed.size).toBe(3);
    expect(await rawData(page)).toEqual(before);
    await page.unroute(davidWebp);
    await page.getByRole("button", { name: "Bild erneut laden", exact: true }).click();
    await artworkReady(page);
    expect(await rawData(page)).toEqual(before);
    expect(errors).toEqual([]);
  });
});
