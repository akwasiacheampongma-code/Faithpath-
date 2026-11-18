import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { faithpathFixture } from "../fixtures/faithpath-v5";
import { localData, rawData } from "./persistence";

const widths = [320, 375, 390, 430];
const sectionNames = ["Gedanken", "Entwürfe", "Lesezeichen", "Markierungen"];
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const evidence = process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest";

async function durableRecords(page: Page) {
  return page.evaluate(() => new Promise<unknown>((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction("state"), store = tx.objectStore("state");
      const keys = store.getAllKeys(), entries = store.getAll();
      tx.oncomplete = () => { db.close(); resolve(keys.result.map((key, i) => [key, entries.result[i]])); };
      tx.onerror = () => reject(tx.error);
    };
  }));
}

async function seed(page: Page) {
  await page.goto("/importieren");
  const chooser = page.waitForEvent("filechooser");
  await button(page, "FaithPath-Datei auswählen").click();
  await (await chooser).setFiles({ name: "synthetic-quiet-history.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(faithpathFixture())) });
  await button(page, "Jetzt sichern und Import übernehmen").click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  const record = await rawData(page);
  record.data.bookmarks = ["PSA:23:1"];
  record.data.highlights = { "MRK:4:35": "olive" };
  record.data.drafts = [{
    id: "quiet-sample-draft", key: "journal", revision: 0, updatedAt: "2026-11-17T10:00:00Z", type: "journal",
    values: { entityId: "quiet-sample-note", targetId: null, baseUpdatedAt: null, text: "Dieser Entwurf bleibt erhalten.", kind: "note" },
  }];
  record.data.settings.reducedMotion = true;
  record.data.revision++;
  await page.evaluate(record => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onsuccess = () => {
      const db = request.result, tx = db.transaction("state", "readwrite");
      tx.objectStore("state").put(record, "main");
      tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  }), record);
}

test("Sammlungsbereiche bleiben einzeilig und Garten, Sammlung und Reader ohne horizontalen Überlauf bedienbar", async ({ page }) => {
  test.setTimeout(180000);
  const observations = [];
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    await page.goto("/sammlung");
    if (theme === "dark") {
      await button(page, "Dunklen Modus aktivieren").click();
      await expect(button(page, "Hellen Modus aktivieren")).toBeVisible();
      await expect.poll(async () => (await localData(page)).settings.theme).toBe("dark");
    }
    for (const width of widths) for (const name of ["garten", "sammlung", "reader"] as const) {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
      await page.goto(name === "reader" ? "/lesen/PHP?chapter=4&mode=read" : `/${name}`);
      const main = page.getByRole("main");
      await expect(main).toBeVisible();
      await expect(button(page, theme === "dark" ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      if (name === "garten") {
        const target = button(page, "Stadium 1 ansehen: Samen");
        await expect(target).toBeVisible();
        expect((await target.boundingBox())?.width).toBeGreaterThanOrEqual(44);
      }
      if (name === "sammlung") {
        const group = page.getByRole("group", { name: "Bereiche deiner Sammlung" });
        await expect(group.getByRole("button")).toHaveCount(4);
        const columns = await group.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length);
        expect(columns).toBe(2);
        for (const label of sectionNames) expect(await singleLine(button(page, label))).toBe(true);
      }
      if (name === "reader") await expect(page.getByTestId("reader-flow")).toBeVisible();
      expect(await main.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const runAxe = width === 320 || width === 390;
      const violations = runAxe ? (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations : null;
      if (runAxe) expect(violations).toEqual([]);
      observations.push({ theme, width, area: name, noHorizontalOverflow: true, axeViolations: violations });
    }
  }
  await mkdir(evidence, { recursive: true });
  await writeFile(`${evidence}/a11y.json`, JSON.stringify({ browser: "Chromium", physicalDevice: false, observations }, null, 2) + "\n");
});

async function singleLine(locator: ReturnType<Page["getByRole"]>) {
  return locator.evaluate(el => {
    const content = document.createRange(); content.selectNodeContents(el);
    return content.getClientRects().length === 1 && el.scrollWidth <= el.clientWidth + 1;
  });
}

test("bei doppelter Schrift zeigen die vier Sammlungsfelder volle Namen und lassen sich per Tastatur wechseln", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/sammlung");
  const group = page.getByRole("group", { name: "Bereiche deiner Sammlung" });
  await group.evaluate(el => { el.style.fontSize = "28px"; });
  await page.evaluate(() => document.fonts.ready);
  expect(await group.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").length)).toBe(1);
  await button(page, "Gedanken").focus();
  for (const label of sectionNames) {
    const target = button(page, label);
    await expect(target).toBeFocused();
    expect(await singleLine(target)).toBe(true);
    await page.keyboard.press("Enter");
    await expect(target).toHaveAttribute("aria-pressed", "true");
    if (label !== "Markierungen") await page.keyboard.press("Tab");
  }
});

test("Archiv, alle Sammlungsbereiche und sieben Baumvorschauen bewahren jeden gespeicherten Datensatz", async ({ page, context }) => {
  await seed(page);
  const before = await durableRecords(page);
  await page.goto("/garten");
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  const tree = page.getByTestId("olive-tree");
  for (let i = 0; i < 7; i++) {
    await page.getByRole("button", { name: new RegExp(`^Stadium ${i + 1} ansehen:`) }).click();
    await expect.poll(() => tree.evaluate(el => (el as HTMLElement & { olivaTree?: () => {stage:number} }).olivaTree?.().stage)).toBe(i);
  }
  await button(page, "Zurück zu deinem Baum").click();
  await button(page, "Frühere FaithPath-Momente ansehen").click();
  await expect(page.getByTestId("archive-readable-history")).toBeVisible();
  await button(page, "In Ruhe zuhören").click();
  await expect(page.getByText("Damals hat mich diese Frage bewegt.", { exact: true })).toBeVisible();
  await page.goto("/sammlung");
  await expect(page.getByText("Ich darf mit meinen Fragen kommen.", { exact: true })).toBeVisible();
  for (const name of sectionNames) {
    await button(page, name).click();
    if (name === "Lesezeichen" || name === "Markierungen") await expect(button(page, "Im Kapitel öffnen")).toBeVisible();
  }
  await page.goto("/sammlung?tab=Entw%C3%BCrfe");
  await expect(button(page, "Entwürfe")).toHaveAttribute("aria-pressed", "true");
  expect(await durableRecords(page)).toEqual(before);
});

test("Kapitelwechsel an der Buchgrenze lässt Lesebestätigung, Markierungen und persönliche Texte unberührt", async ({ page }) => {
  await seed(page);
  const before = await localData(page);
  await page.goto("/lesen/MRK?chapter=16&mode=read");
  await expect(page.getByRole("heading", { name: "Markus 16", exact: true })).toBeVisible();
  const next = button(page, "Nächstes Kapitel");
  await next.focus(); await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/lesen\/LUK\?chapter=1(?:&|$)/);
  await expect(page.getByRole("heading", { name: "Lukas 1", exact: true })).toBeVisible();
  await expect.poll(async () => (await localData(page)).reading.book).toBe("LUK");
  const after = await localData(page);
  for (const field of ["notes", "drafts", "goals", "imports", "bookmarks", "highlights", "readChapters", "readPassages", "growthStage"] as const) expect(after[field], field).toEqual(before[field]);
  await button(page, "Vorheriges Kapitel").click();
  await expect(page).toHaveURL(/\/lesen\/MRK\?chapter=16(?:&|$)/);
});
