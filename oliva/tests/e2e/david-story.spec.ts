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

async function artworkRatio(page: Page, ratio: number) {
  await expect.poll(async () => {
    const frame = await page.getByTestId(`story-artwork-${david}`).filter({ visible: true }).boundingBox({ timeout: 1000 }).catch(() => null);
    return frame && Number.isFinite(frame.width) && Number.isFinite(frame.height) && frame.width > 0 && frame.height > 0
      ? frame.width / frame.height
      : Number.NaN;
  }, { message: `David artwork has a finite positive frame with aspect ratio ${ratio}` }).toBeCloseTo(ratio, 2);
}

async function davidContextReady(page: Page) {
  await expect(page).toHaveURL(url => url.pathname === "/lesen/1SA"
    && url.searchParams.get("chapter") === "17"
    && url.searchParams.get("from") === "38"
    && url.searchParams.get("to") === "45"
    && url.searchParams.get("mode") === "deep");
  await expect(page.getByRole("button", { name: "Tiefer verstehen", exact: true })).toHaveAttribute("aria-pressed", "true");
  await artworkReady(page);
  await expect.poll(() => page.getByTestId(`story-image-${david}`).filter({ visible: true }).evaluate(async node => {
    const image = node instanceof HTMLImageElement ? node : node.querySelector("img");
    if (!image || !image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) return false;
    try {
      await image.decode();
      return true;
    } catch {
      return false;
    }
  })).toBe(true);
  await artworkRatio(page, 3 / 2);
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
    await artworkRatio(page, 8 / 5);
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
  // Library and Reader share artwork IDs. Wait for the actual deep Reader and
  // decoded artwork, then poll geometry across the asynchronous route handoff.
  await davidContextReady(page);
  await noOverflow(page);
  await page.getByTestId(`story-card-${david}`).filter({ visible: true }).scrollIntoViewIfNeeded();
  await page.getByTestId(`story-card-${david}`).filter({ visible: true }).screenshot({ path: `${screenshots}/david-context-390-light.png` });
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations).toEqual([]);
});

test.describe("Reader-Übergang bei echter Netzwerklatenz", () => {
  test.use({ serviceWorkers: "block" });
  test("Davids Kontext wartet auf das echte Reader-Modul und einen positiven 3:2-Rahmen", async ({ page }, testInfo) => {
    await savedProfile(page);
    await openLibrary(page);
    await artworkReady(page);
    await artworkRatio(page, 8 / 5);
    const before = {
      url: page.url(),
      frame: await page.getByTestId(`story-artwork-${david}`).filter({ visible: true }).boundingBox(),
    };
    const lifecycle = ["library-ready"];
    let releaseReader = () => {};
    const readerGate = new Promise<void>(resolve => { releaseReader = resolve; });
    let readerChunk = "";
    let readerStatus = 0;
    // Match both dynamic book chunks, then identify the real Reader by its
    // response. Hold and release the original response without changing bytes.
    await page.route(url => /\/\[book\]-[a-f0-9]+\.js$/.test(decodeURIComponent(url.pathname)), async route => {
      const response = await route.fetch();
      const body = await response.text();
      if (body.includes("Tiefer verstehen") && body.includes("Abschnitt als gelesen")) {
        readerChunk = route.request().url();
        readerStatus = response.status();
        lifecycle.push("reader-response-held");
        await readerGate;
        lifecycle.push("reader-response-released");
      }
      await route.fulfill({ response });
    });
    try {
      await page.getByRole("button", { name: "Davids Vorbereitung lesen", exact: true }).click();
      await expect.poll(() => readerChunk, { message: "The actual Reader JavaScript response is held" }).not.toBe("");
      expect(readerStatus).toBe(200);
      // Expo Router can update the URL before the Reader module arrives.
      await expect(page).toHaveURL(/\/lesen\/1SA\?/);
      await expect(page.getByRole("button", { name: "Tiefer verstehen", exact: true })).toHaveCount(0);
      const whileHeld = {
        url: page.url(),
        // Observe retained outgoing artwork without requiring a particular
        // router implementation to keep it mounted or visible.
        artwork: await page.getByTestId(`story-artwork-${david}`).evaluateAll(nodes => nodes.map(node => {
          const frame = node.getBoundingClientRect();
          const image = node.querySelector("img");
          return {
            busy: node.getAttribute("aria-busy"),
            frame: { width: frame.width, height: frame.height },
            imageDecoded: !!image && image.complete && image.naturalWidth > 0,
          };
        })),
      };
      let contextResolved = false;
      const contextReady = davidContextReady(page).then(() => {
        contextResolved = true;
        lifecycle.push("context-ready");
      });
      await testInfo.attach("reader-response-held", { body: await page.screenshot(), contentType: "image/png" });
      await expect(page.getByRole("button", { name: "Tiefer verstehen", exact: true })).toHaveCount(0);
      expect(contextResolved).toBe(false);
      lifecycle.push("context-still-pending");
      releaseReader();
      await contextReady;
      expect(contextResolved).toBe(true);
      expect(lifecycle).toEqual(["library-ready", "reader-response-held", "context-still-pending", "reader-response-released", "context-ready"]);
      const after = {
        url: page.url(),
        deepPressed: await page.getByRole("button", { name: "Tiefer verstehen", exact: true }).getAttribute("aria-pressed"),
        frame: await page.getByTestId(`story-artwork-${david}`).filter({ visible: true }).boundingBox(),
      };
      await testInfo.attach("reader-network-gate", {
        body: JSON.stringify({ readerChunk, readerStatus, lifecycle, before, whileHeld, after }, null, 2),
        contentType: "application/json",
      });
      await testInfo.attach("reader-context-ready", {
        body: await page.getByTestId(`story-card-${david}`).filter({ visible: true }).screenshot(),
        contentType: "image/png",
      });
    } finally {
      releaseReader();
    }
  });
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
