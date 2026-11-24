import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { localData, rawData } from "./persistence";

const screens = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/spiritual-word/screens`;
const BOOKS: { code: string; name: string; chapters: number }[] = JSON.parse(
  readFileSync(new URL("../../src/data/catalog.json", import.meta.url), "utf8"),
);
const imagePattern = "**/word-sword-512*.png";
const retired = /Buchschwert|Schwert des Anfangs|Schwert des Lebens|Schwert der Gnade/;
const visible = (page: Page, id: string) => page.getByTestId(id).filter({ visible: true });
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function profile(page: Page) {
  await page.goto("/einstellungen");
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Ada");
  await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.name).toBe("Ada");
}

async function records(page: Page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction("state", "readonly"), store = tx.objectStore("state");
      const keys = store.getAllKeys(), values = store.getAll();
      tx.oncomplete = () => { db.close(); resolve(keys.result.map((key, i) => [key, values.result[i]])); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
  }));
}

async function ready(page: Page) {
  const image = visible(page, "spiritual-sword-image");
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(node => {
    const im = node instanceof HTMLImageElement ? node : node.querySelector("img");
    return !!im && im.complete && im.naturalWidth === 512 && im.naturalHeight === 768;
  })).toBe(true);
  return image;
}

async function noBookSwords(page: Page) {
  await expect(page.getByText(retired).filter({ visible: true })).toHaveCount(0);
  await expect(page.locator('[data-testid^="book-sword"], [data-testid="sword-art"], [data-testid="sword-confirmation"]')).toHaveCount(0);
}

async function theme(page: Page, value: "light" | "dark") {
  const raw = structuredClone(await rawData(page));
  expect(raw.data.version).toBe(11);
  raw.data.onboarded = true;
  raw.data.settings.theme = value;
  raw.data.readChapters = ["JHN:1"];
  raw.data.revision++;
  await page.evaluate(value => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction("state", "readwrite");
      tx.objectStore("state").put(value, "main");
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
    request.onerror = () => reject(request.error);
  }), raw);
}

test("der Bibelhub öffnet alle66Bücher und1189Kapitel ohne Buchschwert-Auswahl oder Datenänderung", async ({ page }) => {
  await profile(page);
  const before = await records(page);
  await page.goto("/bibel");
  await ready(page);
  await expect(page.getByRole("combobox", { name: "Bibelbereich", exact: true })).toHaveValue("Alle");
  await expect(page.getByRole("button", { name: /, \d+ Kapitel$/ })).toHaveCount(66);
  await noBookSwords(page);
  for (const book of BOOKS) {
    const row = page.getByRole("button", { name: `${book.name}, ${book.chapters} Kapitel`, exact: true });
    await row.click();
    await expect(page.getByRole("button", { name: new RegExp(`^${escape(book.name)}, Kapitel \\d+(, gelesen)?$`) })).toHaveCount(book.chapters);
    await expect(page.getByRole("button", { name: `${book.name}, Kapitel ${book.chapters}`, exact: true })).toBeEnabled();
    await row.click();
  }
  expect(await records(page)).toEqual(before);
});

test("alle66altenBuch-Links öffnen ruhige Buchübersichten und keine Schwertseiten", async ({ page }) => {
  test.setTimeout(240000);
  await profile(page);
  const before = await records(page);
  for (const book of BOOKS) {
    await page.goto(`/buch/${book.code}`);
    await expect(page.getByRole("heading", { name: book.name, exact: true })).toBeVisible();
    await expect(visible(page, "book-overview")).toBeVisible();
    await expect(page.getByRole("button", { name: `${book.name}, Kapitel ${book.chapters}`, exact: true })).toBeEnabled();
    await noBookSwords(page);
    await expect(page.getByTestId("spiritual-sword-image")).toHaveCount(0);
  }
  expect(await records(page)).toEqual(before);
  await page.goto("/buch/UNKNOWN");
  await expect(page.getByText("Dieses Buch gibt es hier nicht.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Zur Bibel", exact: true }).click();
  await ready(page);
});

test("der quellentreue Vers und sein friedlicher Zusammenhang öffnen den gemeinsamen Reader", async ({ page }) => {
  await profile(page);
  const before = await localData(page);
  for (const ref of [
    { label: "Epheser 6,17 lesen", from: 17, to: 17 },
    { label: "Epheser 6,10–18 lesen", from: 10, to: 18 },
  ]) {
    await page.goto("/bibel");
    const card = visible(page, "spiritual-word-card");
    await expect(card.getByText("… und das Schwert des Geistes, welches ist das Wort Gottes.", { exact: true })).toBeVisible();
    await expect(card.getByText("OLIVA-EINORDNUNG", { exact: true })).toBeVisible();
    await expect(card.getByText("Gottes Wort kann uns Orientierung, Halt und Stärke schenken – im Alltag und in schweren Zeiten.", { exact: true })).toBeVisible();
    await expect(card.getByText(/richtet sich nicht gegen Menschen/)).toBeVisible();
    await expect(card.getByRole("progressbar")).toHaveCount(0);
    await card.getByRole("button", { name: ref.label, exact: true }).click();
    await expect(page).toHaveURL(/\/lesen\/EPH\?/);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/lesen/EPH");
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ chapter: "6", from: String(ref.from), to: String(ref.to) });
    await expect(page.getByRole("button", { name: new RegExp(`^Vers ${ref.from}:`) })).toHaveAccessibleName(/· im Fokus$/);
    await expect.poll(async () => (await localData(page))?.reading.book).toBe("EPH");
    const after = await localData(page);
    for (const key of ["readChapters", "readPassages", "notes", "bookmarks", "highlights", "growthStage"] as const)
      expect(after[key]).toEqual(before[key]);
  }
});

test("der Hub bleibt bei320/1440Pixeln in Hell/Dunkel mit reduzierter Bewegung barrierearm", async ({ page }) => {
  await mkdir(screens, { recursive: true });
  await profile(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const color of ["light", "dark"] as const) {
    await theme(page, color);
    const before = await records(page);
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
      await page.goto("/bibel");
      const art = await ready(page);
      const box = await art.boundingBox();
      expect(box!.height / box!.width).toBe(1.5);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const search = await page.getByRole("textbox", { name: "Buch suchen", exact: true }).boundingBox();
      const card = await visible(page, "spiritual-word-card").boundingBox();
      expect(search!.y).toBeLessThan(card!.y);
      expect(search!.y).toBeLessThan(width === 320 ? 568 : 1000);
      await expect(page.getByRole("img", { name: "Ein friedliches Schwert als Symbol für Gottes Wort", exact: true })).toHaveCount(1);
      await page.screenshot({ path: `${screens}/hub-top-${width}-${color}.png` });
      await visible(page, "spiritual-word-card").screenshot({ path: `${screens}/word-${width}-${color}.png` });
      await page.screenshot({ path: `${screens}/hub-${width}-${color}.png` });
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      expect(await records(page)).toEqual(before);
    }
  }
});

test("das einzelne Symbol und alle Bücher bleiben beim Offline-Neustart ohne Schreibvorgang verfügbar", async ({ page, context }) => {
  await profile(page);
  const before = await records(page);
  await page.goto("/bibel");
  await ready(page);
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await ready(page);
  await expect(page.getByRole("button", { name: /, \d+ Kapitel$/ })).toHaveCount(66);
  await noBookSwords(page);
  expect(await records(page)).toEqual(before);
});

test("Startseite und Sammlung bleiben frei von Schwertern; bestätigtes Lesen behält seinen normalen Fortschritt", async ({ page }) => {
  await profile(page);
  await page.goto("/");
  const card = visible(page, "home-current-book");
  await expect(card.getByRole("button", { name: "Kapitelübersicht öffnen", exact: true })).toBeVisible();
  await expect(card.getByRole("progressbar")).toHaveCount(1);
  await expect(card.getByRole("button")).toHaveCount(1);
  await noBookSwords(page);
  await page.goto("/sammlung");
  await expect(page.getByRole("button", { name: "Buchschwerter", exact: true })).toHaveCount(0);
  await noBookSwords(page);
  await page.goto("/lesen/MRK?chapter=4");
  await page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true }).click();
  await expect.poll(async () => (await localData(page))?.readChapters).toEqual(["MRK:4"]);
  await noBookSwords(page);
  await page.goto("/buch/MRK");
  await expect(page.getByText("1 von 16 Kapiteln gelesen", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Markus, Kapitel 4, gelesen", exact: true })).toBeEnabled();
});

test.describe("einzelnes Bild bei echtem Ladefehler", () => {
  test.use({ serviceWorkers: "block" });
  test("Vers und Navigation bleiben bedienbar; bewusster Retry dekodiert das Original", async ({ page }) => {
    await profile(page);
    const before = await records(page), requested = new Set<string>();
    await page.route(imagePattern, route => { requested.add(route.request().url()); return route.abort(); });
    await page.goto("/bibel");
    await expect(page.getByText("Bild gerade nicht verfügbar.", { exact: true })).toBeVisible();
    expect(requested.size).toBe(1);
    await expect(page.getByRole("button", { name: "Epheser 6,17 lesen", exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: "Markus, 16 Kapitel", exact: true })).toBeEnabled();
    await page.unroute(imagePattern);
    await page.getByRole("button", { name: "Bild laden", exact: true }).click();
    await ready(page);
    expect(await records(page)).toEqual(before);
  });
});

test.describe("hochauflösende Browserdarstellung", () => {
  test.use({ deviceScaleFactor: 3 });
  test("die eine512erDatei reicht für den vollständigen80x120Bildrahmen", async ({ page }) => {
    await profile(page);
    const before = await records(page);
    await page.goto("/bibel");
    const art = await ready(page), box = await art.boundingBox();
    expect(box!.width * 3).toBeLessThanOrEqual(512);
    expect(box!.height * 3).toBeLessThanOrEqual(768);
    expect(await records(page)).toEqual(before);
  });
});
