import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { localData, rawData } from "./persistence";

const screenshots = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/romans/screens`;
const romansPng = "**/romans-grace-pilot-*.png";
test.use({ screenshot: "only-on-failure" });

const visible = (page: Page, id: string) => page.getByTestId(id).filter({ visible: true });

async function savedProfile(page: Page) {
  await page.goto("/einstellungen");
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Ada");
  await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.name).toBe("Ada");
}

async function decoded(frame: Locator, book: "JHN" | "ROM") {
  await expect(frame).toHaveAttribute("aria-busy", "false");
  await expect(frame.getByTestId("book-sword-vector")).toHaveCount(0);
  const image = frame.getByTestId("book-sword-image");
  await expect.poll(() => image.evaluate(node => {
    const img = node instanceof HTMLImageElement ? node : node.querySelector("img");
    return !!img && img.complete && img.naturalWidth > 0;
  })).toBe(true);
  const actual = await image.evaluate(node => {
    const img = node instanceof HTMLImageElement ? node : node.querySelector("img");
    return { width: img!.naturalWidth, height: img!.naturalHeight, source: img!.currentSrc };
  });
  expect(actual.source).toContain(book === "ROM" ? "romans-grace-pilot-" : "john-life-pilot-");
  expect(actual.height / actual.width).toBe(1.5);
  return actual;
}

async function artworkReady(page: Page, book: "JHN" | "ROM" = "ROM") {
  return decoded(visible(page, "book-sword-artwork"), book);
}

async function noOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function progress(page: Page, chapters: number) {
  await expect(page.getByText(`${chapters} von 16 Kapiteln gelesen`, { exact: true }).filter({ visible: true })).toBeVisible();
  const bar = page.getByRole("progressbar", { name: "Lesefortschritt in Römer", exact: true });
  await expect(bar).toHaveAttribute("aria-valuemin", "0");
  await expect(bar).toHaveAttribute("aria-valuemax", "100");
  await expect(bar).toHaveAttribute("aria-valuenow", String(Math.round(chapters / 16 * 100)));
}

/** Synthetic history is confined to the test profile; image and navigation
 * assertions below compare the entire durable document without app decoding. */
async function priorHistory(page: Page, book: string, chapters = 0, theme: "light" | "dark" = "light") {
  const raw = structuredClone(await rawData(page));
  expect(raw.storageVersion).toBe(1);
  expect(raw.data.version).toBe(6);
  raw.data.reading = { book, chapter: 1 };
  raw.data.readingPosition = null;
  raw.data.onboarded = true;
  raw.data.readChapters = [...new Set([
    ...raw.data.readChapters.filter((key: string) => !key.startsWith(`${book}:`)),
    ...Array.from({ length: chapters }, (_, i) => `${book}:${i + 1}`),
  ])];
  raw.data.settings.theme = theme;
  raw.data.revision++;
  await page.evaluate(value => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result, transaction = db.transaction("state", "readwrite");
      transaction.objectStore("state").put(value, "main");
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    };
  }), raw);
  return raw;
}

async function pulseFromRealClick(page: Page, confirm = false) {
  const confirmation = page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true });
  if (confirm) await confirmation.waitFor({ state: "attached" });
  const button = confirm ? await confirmation.elementHandle() : null;
  const observer = await page.evaluateHandle(({ button }) => ({
    result: new Promise<{ maximum: number; final: number; frames: number }>(resolve => {
      const start = () => {
        const began = performance.now();
        let maximum = 0, frames = 0;
        const sample = (now: number) => {
          const node = Array.from(document.querySelectorAll('[data-testid="sword-confirmation"]'))
            .find(node => node.getClientRects().length > 0);
          const opacity = node ? Number(getComputedStyle(node).opacity) : 0;
          maximum = Math.max(maximum, opacity); frames++;
          if (now - began >= 1200) resolve({ maximum, final: opacity, frames });
          else requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      };
      if (button) button.addEventListener("click", start, { once: true });
      else start();
    }),
  }), { button });
  try {
    if (confirm) await confirmation.click();
    const result = await observer.evaluate(async observation => observation.result);
    expect(result.frames).toBeGreaterThan(2);
    return result;
  } finally { await observer.dispose(); await button?.dispose(); }
}

test("Römer zeigt die eigene Illustration und öffnet seine drei belegten Quellen ohne Lesefortschritt zu erfinden", async ({ page }) => {
  await savedProfile(page);
  const before = await rawData(page);
  await page.goto("/buch/ROM");
  await expect(page.getByRole("heading", { name: "Römer", exact: true })).toBeVisible();
  await expect(page.getByText("Schwert der Gnade", { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText(/Gnade ist kein Lohn für deine Aktivität/)).toBeVisible();
  await artworkReady(page);
  await progress(page, 0);
  expect(await rawData(page)).toEqual(before);

  const contexts = [
    { label: "Römer 3,23–24 lesen", book: "ROM", chapter: 3, from: 23, to: 24 },
    { label: "Römer 5,1 lesen", book: "ROM", chapter: 5, from: 1, to: 1 },
    { label: "Römer 8,1 lesen", book: "ROM", chapter: 8, from: 1, to: 1 },
    { label: "Epheser 6,17 lesen", book: "EPH", chapter: 6, from: 17, to: 17 },
  ];
  for (const context of contexts) {
    await page.getByRole("button", { name: context.label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/lesen/${context.book}\\?`));
    const url = new URL(page.url());
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      chapter: String(context.chapter), from: String(context.from), to: String(context.to),
    });
    await expect(page.getByRole("button", { name: new RegExp(`^Vers ${context.from}:`) })).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(`^Vers ${context.to + 1}:`) })).toHaveCount(0);
    await expect.poll(async () => (await localData(page))?.reading).toEqual({
      book: context.book, chapter: context.chapter, from: context.from, to: context.to,
    });
    const current = await localData(page);
    expect(current.readChapters).toEqual(before.data.readChapters);
    expect(current.readPassages).toEqual(before.data.readPassages);
    expect(current.growthStage).toBe(before.data.growthStage);
    await page.goto("/buch/ROM");
    await progress(page, 0);
  }
});

test("Römers 16 Kapitel bleiben in Hell und Dunkel sowie bei kleinen und großen Ansichten eindeutig", async ({ page }) => {
  await mkdir(screenshots, { recursive: true });
  await savedProfile(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of ["light", "dark"] as const) {
    for (const chapters of [0, 1, 8, 16]) {
      const before = await priorHistory(page, "ROM", chapters, theme);
      await page.goto("/buch/ROM");
      await artworkReady(page);
      await progress(page, chapters);
      const rail = visible(page, "book-sword-progress");
      const ticks = await rail.locator("svg path").evaluateAll(paths => {
        const path = paths.find(path => Number(path.getAttribute("stroke-width")) === 0.16);
        return path?.getAttribute("d")?.match(/M/g)?.length;
      });
      expect(ticks).toBe(17); // Two ends and 15 interior boundaries, not John's 21 chapters.
      await noOverflow(page);
      await visible(page, "book-sword-artwork").screenshot({ path: `${screenshots}/romans-synthetic-${chapters}-of-16-${theme}.png` });
      expect(await rawData(page)).toEqual(before);
    }
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
      await artworkReady(page);
      await noOverflow(page);
      await page.screenshot({ path: `${screenshots}/romans-${width}-${theme}.png` });
      const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(scan.violations).toEqual([]);
    }
    await page.setViewportSize({ width: 390, height: 844 });
  }
});

test("die Startseite bewahrt Lesen und Daten und öffnet illustrierte sowie bisherige Buchschwerter", async ({ page }) => {
  await mkdir(screenshots, { recursive: true });
  await savedProfile(page);
  for (const book of ["ROM", "JHN", "GEN", "REV"] as const) {
    const before = await priorHistory(page, book);
    await page.goto("/");
    const card = visible(page, "home-current-book");
    await expect(card).toBeVisible();
    if (book === "ROM" || book === "JHN") {
      const artwork = card.getByTestId("book-sword-artwork");
      await decoded(artwork, book);
      const frame = await artwork.boundingBox();
      expect(frame?.width).toBe(100);
      expect(frame?.height).toBe(150);
    } else {
      await expect(card.getByTestId("sword-art")).toBeVisible();
      await expect(card.getByTestId("book-sword-image")).toHaveCount(0);
    }
    await expect(card.getByRole("button", { name: / lesen$/, exact: false })).toBeEnabled();
    await noOverflow(page);
    expect(await rawData(page)).toEqual(before);
    await card.screenshot({ path: `${screenshots}/home-${book}-390-light.png` });
    await card.getByRole("button", { name: "Dein Buchschwert entdecken", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/buch/${book}(?:\\?|$)`));
    if (book === "ROM" || book === "JHN") await artworkReady(page, book);
    else await expect(visible(page, "book-sword-vector")).toBeVisible();
    expect(await rawData(page)).toEqual(before);
    await page.getByRole("button", { name: "Zurück", exact: true }).click();
    await expect(visible(page, "home-current-book")).toBeVisible();
    expect(await rawData(page)).toEqual(before);
  }
});

test("nur ausdrücklich bestätigtes Römerlesen erzeugt Kapitellicht und einen endlichen Impuls", async ({ page }) => {
  await savedProfile(page);
  const before = await localData(page);
  await page.goto("/lesen/ROM?chapter=1");
  await page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true }).waitFor({ state: "attached" });
  expect((await pulseFromRealClick(page)).maximum).toBe(0);
  const confirmed = await pulseFromRealClick(page, true);
  expect(confirmed.maximum).toBeGreaterThan(0.05);
  expect(confirmed.final).toBeCloseTo(0, 5);
  await expect.poll(async () => (await localData(page)).readChapters).toEqual(["ROM:1"]);
  expect((await localData(page)).readPassages).toEqual(before.readPassages);
  expect((await localData(page)).completedSteps).toEqual(before.completedSteps);
  await page.goto("/buch/ROM");
  await progress(page, 1);
  await artworkReady(page);
  const afterConfirmation = await rawData(page);
  expect((await pulseFromRealClick(page)).maximum).toBe(0);
  expect(await rawData(page)).toEqual(afterConfirmation);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lesen/ROM?chapter=2");
  const reduced = await pulseFromRealClick(page, true);
  expect(reduced.maximum).toBe(0);
  await expect.poll(async () => (await localData(page)).readChapters).toEqual(["ROM:1", "ROM:2"]);
  await expect(visible(page, "sword-art")).toBeVisible();
});

test("Römer und Johannes öffnen beim ersten Offlinebesuch und nach Neustart mit unveränderten Daten", async ({ page, context }) => {
  await savedProfile(page);
  const before = await priorHistory(page, "ROM", 8);
  await page.reload();
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  for (const book of ["ROM", "JHN"] as const) {
    await page.goto(`/buch/${book}`);
    await artworkReady(page, book);
    expect(await rawData(page)).toEqual(before);
    await page.reload();
    await artworkReady(page, book);
    expect(await rawData(page)).toEqual(before);
  }
  await page.goto("/");
  await decoded(visible(page, "home-current-book").getByTestId("book-sword-artwork"), "ROM");
  expect(await rawData(page)).toEqual(before);
});

test.describe("echte Römer-Bildfehler ohne Service-Worker", () => {
  test.use({ serviceWorkers: "block" });

  test("drei fehlgeschlagene Varianten erhalten das Römer-Symbol; ein Wiederholungsversuch dekodiert das echte Bild", async ({ page }) => {
    await savedProfile(page);
    const before = await rawData(page), requests = new Set<string>(), errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.route(romansPng, route => { requests.add(route.request().url()); return route.abort(); });
    await page.goto("/buch/ROM");
    await expect(page.getByText("Die Bildansicht ist gerade nicht verfügbar. Dein Buchsymbol bleibt sichtbar.", { exact: true })).toBeVisible();
    await expect(visible(page, "book-sword-vector")).toBeVisible();
    expect(requests.size).toBe(3);
    expect(await rawData(page)).toEqual(before);
    await page.unroute(romansPng);
    await page.getByRole("button", { name: "Bild erneut laden", exact: true }).click();
    await artworkReady(page);
    expect(await rawData(page)).toEqual(before);
    expect(errors).toEqual([]);
  });

  test("der schmale Startseiten-Fallback bleibt bei 320 Pixeln lesbar und der echte Retry erhält alle Daten", async ({ page }) => {
    await mkdir(screenshots, { recursive: true });
    await savedProfile(page);
    const before = await priorHistory(page, "ROM", 8, "dark"), failed = new Set<string>();
    await page.setViewportSize({ width: 320, height: 568 });
    await page.route(romansPng, route => { failed.add(route.request().url()); return route.abort(); });
    await page.goto("/");
    const card = visible(page, "home-current-book");
    await expect(card.getByText("Bild nicht verfügbar.", { exact: true })).toBeVisible();
    await expect(card.getByTestId("book-sword-vector")).toBeVisible();
    expect(failed.size).toBe(3);
    const retry = card.getByRole("button", { name: "Erneut laden", exact: true });
    await expect(retry).toBeVisible();
    expect((await retry.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(card.getByRole("button", { name: "Dein Buchschwert entdecken", exact: true })).toBeEnabled();
    await noOverflow(page);
    await card.screenshot({ path: `${screenshots}/home-ROM-image-error-320-dark.png` });
    expect(await rawData(page)).toEqual(before);
    await page.unroute(romansPng);
    await retry.click();
    await decoded(card.getByTestId("book-sword-artwork"), "ROM");
    expect(await rawData(page)).toEqual(before);
    const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(scan.violations).toEqual([]);
  });

  test("eine verspätete Römerantwort übernimmt nach Buchwechsel kein Bild und keinen Fortschritt", async ({ page }) => {
    await savedProfile(page);
    const before = await rawData(page), errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route(romansPng, async route => { await gate; await route.continue().catch(() => {}); });
    try {
      const requested = page.waitForRequest(romansPng);
      await page.goto("/buch/ROM", { waitUntil: "domcontentloaded" });
      await requested;
      await expect(visible(page, "book-sword-artwork")).toHaveAttribute("aria-busy", "true");
      await expect(visible(page, "book-sword-vector")).toBeVisible();
      await page.getByRole("button", { name: "Bibel", exact: true }).click();
      await page.getByRole("textbox", { name: "Buch suchen", exact: true }).fill("Johannes");
      await page.getByRole("button", { name: "Johannes, 21 Kapitel", exact: true }).click();
      await page.getByRole("button", { name: "Buchschwert ansehen", exact: true }).click();
      await expect(page).toHaveURL(/\/buch\/JHN(?:\?|$)/);
      await artworkReady(page, "JHN");
      release();
      await artworkReady(page, "JHN");
      expect(await rawData(page)).toEqual(before);
      expect(errors).toEqual([]);
    } finally { release(); }
  });
});

test.describe("Römer auf einem hochauflösenden Browserdisplay", () => {
  test.use({ deviceScaleFactor: 3 });
  test("die große Ansicht dekodiert 768 Pixel und die Startseite ihre passende kleinere Variante", async ({ page }) => {
    await savedProfile(page);
    const before = await priorHistory(page, "ROM", 1);
    await page.goto("/buch/ROM");
    expect((await artworkReady(page)).width).toBe(768);
    expect(await rawData(page)).toEqual(before);
    await page.goto("/");
    const image = await decoded(visible(page, "home-current-book").getByTestId("book-sword-artwork"), "ROM");
    expect(image.width).toBe(512);
    expect(await rawData(page)).toEqual(before);
  });
});
