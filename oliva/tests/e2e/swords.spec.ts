import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { localData, rawData } from "./persistence";

const screenshots = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/swords/screens`;
const pilotPng = "**/john-life-pilot-*.png";
test.use({ screenshot: "only-on-failure" });

async function savedProfile(page: Page) {
  await page.goto("/einstellungen");
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Ada");
  await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.name).toBe("Ada");
}

async function artworkReady(page: Page) {
  const artwork = page.getByTestId("book-sword-artwork");
  await expect(artwork).toHaveAttribute("aria-busy", "false");
  await expect(page.getByTestId("book-sword-vector")).toHaveCount(0);
  await expect.poll(() => page.getByTestId("book-sword-image").evaluate(node => {
    const image = node instanceof HTMLImageElement ? node : node.querySelector("img");
    return !!image && image.complete && image.naturalWidth > 0;
  })).toBe(true);
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

/** Observe real compositor output from the actual click, without product sleeps. */
async function samplePulse(page: Page, confirm = false) {
  const confirmation = page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true });
  // The Reader deliberately mounts its compact sword only after a completed
  // chapter. An absent idle overlay is zero opacity, not a missing app feature.
  if (confirm) await confirmation.waitFor({ state: "attached" });
  const button = confirm ? await confirmation.elementHandle() : null;
  const observer = await page.evaluateHandle(({ button }) => ({
    result: new Promise<{ maximum: number; final: number; frames: number }>(resolve => {
      const start = () => {
        const began = performance.now();
        let maximum = 0, frames = 0;
        const sample = (now: number) => {
          const node = document.querySelector('[data-testid="sword-confirmation"]');
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
    const result = await observer.evaluate(async value => value.result);
    expect(result.frames).toBeGreaterThan(2);
    return result;
  } finally { await observer.dispose(); await button?.dispose(); }
}

async function progress(page: Page, chapters: number) {
  await expect(page.getByText(`${chapters} von 21 Kapiteln gelesen`, { exact: true })).toBeVisible();
  const bar = page.getByRole("progressbar", { name: "Lesefortschritt in Johannes", exact: true });
  await expect(bar).toHaveAttribute("aria-valuemin", "0");
  await expect(bar).toHaveAttribute("aria-valuemax", "100");
  await expect(bar).toHaveAttribute("aria-valuenow", String(Math.round(chapters / 21 * 100)));
}

/** Synthetic prior history for visual boundary states; never counted as real reading. */
async function historyFixture(page: Page, chapters: number, theme: "light" | "dark") {
  const raw = structuredClone(await rawData(page));
  expect(raw.storageVersion).toBe(1);
  expect(raw.data.version).toBe(6);
  raw.data.readChapters = [...new Set([
    ...raw.data.readChapters.filter((key: string) => !key.startsWith("JHN:")),
    "GEN:1", "MRK:4", ...Array.from({ length: chapters }, (_, i) => `JHN:${i + 1}`),
  ])];
  raw.data.settings.theme = theme;
  raw.data.revision++;
  await page.evaluate(value => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction("state", "readwrite");
      tx.objectStore("state").put(value, "main");
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
  }), raw);
  return raw;
}

test("das Buchschwert öffnet aus Bibel und Sammlung, zeigt Johannes groß und verändert keine Lesespuren", async ({ page }) => {
  await savedProfile(page);
  const before = await rawData(page);
  await page.goto("/bibel");
  await page.getByRole("textbox", { name: "Buch suchen", exact: true }).fill("Johannes");
  await page.getByRole("button", { name: "Johannes, 21 Kapitel", exact: true }).click();
  await page.getByRole("button", { name: "Buchschwert ansehen", exact: true }).click();
  await expect(page).toHaveURL(/\/buch\/JHN(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "Johannes", exact: true })).toBeVisible();
  await expect(page.getByText("Schwert des Lebens", { exact: true })).toBeVisible();
  await progress(page, 0);
  await artworkReady(page);
  const frame = await page.getByTestId("book-sword-artwork").boundingBox();
  expect(frame?.width ?? 0).toBeGreaterThanOrEqual(220);
  expect(frame?.height ?? 0).toBeGreaterThanOrEqual(330);
  await expect(page.getByRole("button", { name: "Johannes lesen", exact: true })).toBeVisible();
  expect(await rawData(page)).toEqual(before);
  await noOverflow(page);
  await page.getByRole("button", { name: "Zurück", exact: true }).click();
  await expect(page).toHaveURL(/\/bibel(?:\?|$)/);
  await expect(page.getByRole("textbox", { name: "Buch suchen", exact: true })).toHaveValue("Johannes");
  await expect(page.getByRole("button", { name: "Johannes, 21 Kapitel", exact: true })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("button", { name: "Johannes, Kapitel 1", exact: true })).toBeVisible();
  expect(await rawData(page)).toEqual(before);
  await page.goto("/sammlung");
  await page.getByRole("button", { name: "Buchschwerter", exact: true }).click();
  await page.getByRole("textbox", { name: "Buch suchen", exact: true }).fill("Johannes");
  await page.getByRole("button", { name: "Johannes: Schwert des Lebens", exact: true }).click();
  await expect(page).toHaveURL(/\/buch\/JHN(?:\?|$)/);
  await progress(page, 0);
  await artworkReady(page);
  expect(await rawData(page)).toEqual(before);
});

test("eine echte Kapitelbestätigung und die drei Quellenlinks bleiben voneinander getrennt", async ({ page }) => {
  await page.goto("/buch/JHN");
  await page.getByRole("button", { name: "Johannes lesen", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Vers 1:/ })).toBeVisible();
  await page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.readChapters).toEqual(["JHN:1"]);
  await page.goto("/buch/JHN");
  await progress(page, 1);
  const contexts = [
    { label: "Johannes 1,4 lesen", chapter: 1, from: 4, to: 4 },
    { label: "Johannes 4,14 lesen", chapter: 4, from: 14, to: 14 },
    { label: "Johannes 15,1–5 lesen", chapter: 15, from: 1, to: 5 },
  ];
  for (const context of contexts) {
    await page.getByRole("button", { name: context.label, exact: true }).click();
    await expect(page.getByRole("button", { name: new RegExp(`^Vers ${context.from}:`) })).toBeVisible();
    await expect(page.getByRole("button", { name: new RegExp(`^Vers ${context.to + 1}:`) })).toHaveCount(0);
    await expect.poll(async () => (await localData(page))?.reading).toEqual({
      book: "JHN", chapter: context.chapter, from: context.from, to: context.to,
    });
    expect((await localData(page)).readChapters).toEqual(["JHN:1"]);
    await page.goto("/buch/JHN");
    await progress(page, 1);
  }
});

test("synthetische 0-, 1-, 11- und 21-Kapitel-Stände zeigen korrekten Fortschritt in Hell und Dunkel", async ({ page }) => {
  await mkdir(screenshots, { recursive: true });
  await savedProfile(page);
  for (const theme of ["light", "dark"] as const) {
    for (const count of [0, 1, 11, 21]) {
      const before = await historyFixture(page, count, theme);
      await page.goto("/buch/JHN");
      await progress(page, count);
      await artworkReady(page);
      await noOverflow(page);
      expect(await rawData(page)).toEqual(before);
      await page.screenshot({ path: `${screenshots}/john-${count}-of-21-${theme}-390.png` });
      await page.getByTestId("book-sword-artwork").screenshot({ path: `${screenshots}/john-art-${count}-${theme}.png` });
    }
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
      await progress(page, 21);
      await artworkReady(page);
      await noOverflow(page);
      await page.screenshot({ path: `${screenshots}/john-21-of-21-${theme}-${width}.png` });
    }
    await page.setViewportSize({ width: 390, height: 844 });
  }
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(scan.violations).toEqual([]);
});

test("die Buchansichten bleiben offline erreichbar und ein unbekanntes Buch führt verständlich zurück", async ({ page, context }) => {
  await savedProfile(page);
  const before = await rawData(page);
  await page.goto("/buch/JHN");
  await artworkReady(page);
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await artworkReady(page);
  for (const book of [
    { code: "GEN", name: "1. Mose", title: "Schwert des Anfangs" },
    { code: "PSA", name: "Psalmen", title: "Schwert des Lobpreises" },
    { code: "REV", name: "Offenbarung", title: "Schwert der Vollendung" },
  ]) {
    await page.goto(`/buch/${book.code}`);
    await expect(page.getByRole("heading", { name: book.name, exact: true })).toBeVisible();
    await expect(page.getByText(book.title, { exact: true })).toBeVisible();
    await expect(page.getByTestId("book-sword-vector")).toBeVisible();
    expect(await rawData(page)).toEqual(before);
    await noOverflow(page);
  }
  await page.goto("/buch/UNKNOWN");
  await expect(page.getByText("Dieses Buch gibt es hier nicht.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Zur Bibel", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Buch suchen", exact: true })).toBeVisible();
  expect(await rawData(page)).toEqual(before);
});

test("nur eine echte Lesebestätigung löst den endlichen Lichtimpuls aus; beide Bewegungspräferenzen werden beachtet", async ({ page }) => {
  await page.goto("/lesen/JHN?chapter=1");
  await page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true }).waitFor({ state: "attached" });
  const idle = await samplePulse(page);
  expect(idle.maximum).toBe(0);
  const confirmation = await samplePulse(page, true);
  expect(confirmation.maximum).toBeGreaterThan(0.05);
  expect(confirmation.final).toBeCloseTo(0, 5);
  await expect.poll(async () => (await localData(page))?.readChapters).toEqual(["JHN:1"]);

  await page.getByRole("button", { name: "Nächstes Kapitel", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.reading.chapter).toBe(2);
  const nextChapter = await samplePulse(page);
  expect(nextChapter.maximum).toBe(0);
  expect((await localData(page)).readChapters).toEqual(["JHN:1"]);

  await page.goto("/einstellungen");
  await page.getByRole("switch", { name: "Animationen reduzieren", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.settings.reducedMotion).toBe(true);
  await page.goto("/lesen/JHN?chapter=2");
  const appReduced = await samplePulse(page, true);
  expect(appReduced.maximum).toBe(0);
  await expect(page.getByTestId("sword-art")).toBeVisible();
  expect(new Set((await localData(page)).readChapters)).toEqual(new Set(["JHN:1", "JHN:2"]));

  await page.goto("/einstellungen");
  await page.getByRole("switch", { name: "Animationen reduzieren", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.settings.reducedMotion).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lesen/JHN?chapter=3");
  const systemReduced = await samplePulse(page, true);
  expect(systemReduced.maximum).toBe(0);
  await expect(page.getByTestId("sword-art")).toBeVisible();
  expect(new Set((await localData(page)).readChapters)).toEqual(new Set(["JHN:1", "JHN:2", "JHN:3"]));
});

test.describe("Bildfehler und verzögerte Antwort ohne Service-Worker", () => {
  test.use({ serviceWorkers: "block" });
  test("drei fehlgeschlagene PNG-Varianten lassen das Buchsymbol bestehen; erneutes Laden gelingt", async ({ page }) => {
    await savedProfile(page);
    const before = await rawData(page), failed = new Set<string>();
    await page.route(pilotPng, route => { failed.add(route.request().url()); return route.abort(); });
    await page.goto("/buch/JHN");
    await expect(page.getByText("Die Bildansicht ist gerade nicht verfügbar. Dein Buchsymbol bleibt sichtbar.", { exact: true })).toBeVisible();
    await expect(page.getByTestId("book-sword-vector")).toBeVisible();
    expect(failed.size).toBe(3);
    expect(await rawData(page)).toEqual(before);
    await page.unroute(pilotPng);
    await page.getByRole("button", { name: "Bild erneut laden", exact: true }).click();
    await artworkReady(page);
    await expect(page.getByText("Die Bildansicht ist gerade nicht verfügbar. Dein Buchsymbol bleibt sichtbar.", { exact: true })).toHaveCount(0);
    expect(await rawData(page)).toEqual(before);
  });

  test("ein Buchwechsel während des Ladens übernimmt kein verspätetes Johannes-Bild", async ({ page }) => {
    await savedProfile(page);
    const before = await rawData(page), errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    await page.route(pilotPng, async route => { await gate; await route.continue().catch(() => {}); });
    try {
      const requested = page.waitForRequest(pilotPng);
      await page.goto("/buch/JHN", { waitUntil: "domcontentloaded" });
      await requested;
      await expect(page.getByTestId("book-sword-artwork")).toHaveAttribute("aria-busy", "true");
      await expect(page.getByTestId("book-sword-vector")).toBeVisible();
      await page.getByRole("button", { name: "Bibel", exact: true }).click();
      await page.getByRole("button", { name: "Alle Bücher", exact: true }).click();
      await page.getByRole("textbox", { name: "Buch suchen", exact: true }).fill("1. Mose");
      await page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true }).click();
      await page.getByRole("button", { name: "Buchschwert ansehen", exact: true }).click();
      await expect(page.getByRole("heading", { name: "1. Mose", exact: true })).toBeVisible();
      release();
      await expect(page.getByTestId("book-sword-vector")).toBeVisible();
      await expect(page.getByTestId("book-sword-image")).toHaveCount(0);
      await expect(page.getByText("Schwert des Anfangs", { exact: true })).toBeVisible();
      expect(await rawData(page)).toEqual(before);
      expect(errors).toEqual([]);
    } finally { release(); }
  });
});
