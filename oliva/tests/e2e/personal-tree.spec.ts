import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync } from "node:fs";
import { localData, rawData } from "./persistence";

const at = "2026-11-17T09:00:00.000Z";
const button = (page: Page, name: string | RegExp) => page.getByRole("button", { name, exact: typeof name === "string" }).filter({ visible: true });
async function readyTree(page: Page, stage: number) {
  const tree = page.getByTestId("olive-tree");
  await tree.scrollIntoViewIfNeeded();
  await expect.poll(() => tree.evaluate((node) => {
    const state = (node as HTMLElement & { olivaTree?: () => { ready: boolean; stage: number } }).olivaTree?.();
    return state?.ready ? state.stage : null;
  })).toBe(stage);
  await expect(tree.locator("img.tree-fallback")).toBeVisible();
}
async function seeded(page: Page) {
  // Obtain the actual initial document from the running application; importing
  // the TS domain graph here would require JSON import attributes in Node.
  await page.goto("/einstellungen");
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Ada");
  await button(page, "Namen speichern").click();
  await expect.poll(async () => (await localData(page))?.name).toBe("Ada");
  const data = await localData(page); data.onboarded = true; data.growthStage = 6; data.settings.reducedMotion = true;
  data.goals = Array.from({ length: 7 }, (_, i) => ({ id: "tree-goal-" + i, title: `Mein Vorhaben ${i + 1}`,
    why: "Ein persönlicher nächster Schritt.", createdAt: at, updatedAt: at, revision: 1,
    archivedAt: i === 6 ? at : null, steps: [{ id: "step-" + i, text: "Zuerst zuhören.", done: false, createdAt: at, completedAt: null }], reviews: [] }));
  data.goals.push({ id: "empty-goal", title: "Ein Vorhaben ohne Aufzeichnungen", why: "", createdAt: at, updatedAt: at,
    revision: 1, archivedAt: null, steps: [], reviews: [] });
  data.notes = [{ id: "shared-tree-note", kind: "reflection", text: "Meine bereits bewahrten Worte zu zwei Vorhaben.",
    createdAt: at, updatedAt: at, goalIds: ["tree-goal-0", "tree-goal-1"] }];
  data.drafts = [{ id: "unrelated-draft", key: "journal", type: "journal", revision: 1, updatedAt: at,
    values: { entityId: "next-note", targetId: null, baseUpdatedAt: null, text: "Meine anderen unfertigen Worte.", kind: "reflection" } }];
  await page.evaluate((data) => new Promise<void>((resolve, reject) => {
    const open = indexedDB.open("oliva-local-v1", 1);
    open.onsuccess = () => { const db = open.result, tx = db.transaction("state", "readwrite");
      tx.objectStore("state").put({ storageVersion: 1, data }, "main");
      tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error); };
    open.onerror = () => reject(open.error);
  }), data);
  await page.goto("/garten", { waitUntil: "domcontentloaded" }); await expect(page.getByTestId("personal-tree-journey")).toBeVisible();
  return rawData(page);
}

test("persönliche Baumzweige öffnen echte Vorhaben; alle Aufzeichnungen und der Baum bleiben unverändert", async ({ page }) => {
  const before = await seeded(page);
  await expect(page.getByTestId(/^tree-goal-link-/)).toHaveCount(5);
  await page.getByTestId("tree-goal-link-tree-goal-0").click();
  await expect(page).toHaveURL(/\/vorhaben\/tree-goal-0/);
  await expect(page.getByText("Mein Vorhaben 1", { exact: true }).filter({ visible: true }).first()).toBeVisible();
  await page.goBack(); await expect(page.getByTestId("personal-tree-journey")).toBeVisible();
  await button(page, "Weitere Vorhaben anzeigen").click();
  await expect(button(page, "Mein Vorhaben 7, ruhendes Vorhaben: zugehöriges Vorhaben öffnen")).toBeVisible();
  await expect(button(page, "Ein Vorhaben ohne Aufzeichnungen")).toBeVisible();
  expect(await rawData(page)).toEqual(before);
});

test.describe("Baumverknüpfungen bei echtem Bildladen ohne Service-Worker", () => {
  test.use({ serviceWorkers: "block" });
  test("persönliche Pins warten auf das tatsächliche Originalbild; die Liste bleibt währenddessen bedienbar", async ({ page }) => {
    let release!: () => void, requests = 0;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    await page.route("**/*stage-7*.webp", async (route) => { requests++; await gate; await route.continue(); });
    try {
      const before = await seeded(page);
      await expect.poll(() => requests).toBeGreaterThan(0);
      await expect(page.getByTestId(/^tree-goal-link-/)).toHaveCount(0);
      await expect(button(page, "Mein Vorhaben 1: zugehöriges Vorhaben öffnen")).toBeVisible();
      expect(await rawData(page)).toEqual(before);
      release(); await readyTree(page, 6);
      await expect(page.getByTestId(/^tree-goal-link-/)).toHaveCount(5);
      expect(await rawData(page)).toEqual(before);
    } finally { release(); }
  });
});

test("ein geteilter Gedanke erscheint einmal und öffnet die lesende Sammlung ohne fremde Entwürfe zu verändern", async ({ page }) => {
  const before = await seeded(page), row = page.getByTestId("tree-moment-note:shared-tree-note");
  await expect(row).toHaveCount(1);
  await row.getByRole("button", { name: "Gedanken in der Sammlung öffnen", exact: true }).click();
  await expect(page).toHaveURL(/view=read/);
  await expect(page.getByTestId("collection-note-shared-tree-note")).toBeVisible();
  await expect(page.getByText("Dein wiederentdeckter Gedanke", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Deine Worte", exact: true })).toHaveCount(0);
  await page.reload(); await expect(page.getByTestId("collection-note-shared-tree-note")).toBeVisible();
  expect(await rawData(page)).toEqual(before);
});

test("Stadienvorschauen zeigen keine eigenen Baumzweige; kleine Ziele und Dunkelansicht bleiben zugänglich", async ({ page, context }) => {
  const before = await seeded(page);
  for (let i = 0; i < 7; i++) {
    await button(page, new RegExp(`^Stadium ${i + 1} ansehen:`)).click();
    await readyTree(page, i);
    await expect(page.getByTestId(/^tree-goal-link-/)).toHaveCount(0);
  }
  await button(page, "Zurück zu deinem Baum").click();
  await readyTree(page, 6);
  await expect(page.getByTestId(/^tree-goal-link-/)).toHaveCount(5);
  expect(await rawData(page)).toEqual(before);
  const evidence = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/personal-tree`;
  mkdirSync(evidence, { recursive: true });
  for (const [width, count] of [[320, 3], [1440, 5]]) {
    await page.setViewportSize({ width: width!, height: 844 });
    await expect(page.getByTestId(/^tree-goal-link-/)).toHaveCount(count!);
    if (width === 1440) await button(page, "Dunklen Modus aktivieren").click();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await readyTree(page, 6);
    await page.screenshot({ path: `${evidence}/garden-${width}.png` });
  }
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  const afterTheme = await rawData(page); await context.setOffline(true);
  await page.reload(); await expect(page.getByTestId("personal-tree-journey")).toBeVisible();
  await expect(page.getByTestId(/^tree-goal-link-/)).toHaveCount(5);
  expect(await rawData(page)).toEqual(afterTheme); await context.setOffline(false);
});
