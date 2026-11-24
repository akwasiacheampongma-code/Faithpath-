import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { AppData } from "../../src/state/model";
import { faithpathFixture } from "../fixtures/faithpath-v5";
import { localData, rawData } from "./persistence";

const out = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/faith-journey`;
const stages: { index: number; name: string }[] = JSON.parse(readFileSync("src/features/garden/a51/stage-data.json", "utf8")).stages;
const stamp = "2026-10-22T14:00:00.000Z";
const passage = { book: "MRK", chapter: 4, from: 35, to: 41 };
const noteText = "Testnotiz zum Sturm\nEin synthetischer Satz für die Abnahme.";
const noteId = "notiz-synthetische-abnahme";
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).filter({ visible: true });
const heading = (page: Page, name: string) => page.getByRole("heading", { name, exact: true }).filter({ visible: true });
const noteBox = (page: Page) => page.getByRole("textbox", { name: "Notiztext", exact: true }).filter({ visible: true });
const intro = (page: Page) => page.getByTestId("journey-intro");

async function storeProfile(page: Page, data: AppData) {
  // Write a valid legacy inline document. Production hydrates it without converting it.
  await page.evaluate((data) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("state", "readwrite");
      transaction.objectStore("state").put(data, "main");
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    };
  }), data);
}

async function openSettings(page: Page) {
  await page.goto("/einstellungen");
  await expect(heading(page, "So, wie es zu dir passt.")).toBeVisible();
}

function initialData(): AppData {
  return {
    version: 11, revision: 0, name: "", onboarded: false,
    reading: { book: "MRK", chapter: 4 }, readingPosition: null,
    readChapters: [], readPassages: [], readSteps: [], completedSteps: [], activePath: null,
    bookmarks: [], highlights: {}, notes: [], goals: [], drafts: [], imports: [], growthStage: 0,
    storyStudy: { answers: {}, viewed: {}, position: null },
    ntStudy: { answers: {}, completions: {}, legacyCompletions: [], position: null },
    invitations: { enabled: false, snoozed: {}, dismissed: {} },
    retainedReviewGrowth: { reflections: 0, actions: 0 },
    settings: { theme: "light", fontSize: 20, lineHeight: 1.8, reducedMotion: false },
  };
}

function storedNotebook(): AppData {
  return {
    ...initialData(), version: 12, onboarded: false, revision: 3,
    name: "Mara", growthStage: 3,
    reading: passage, readingPosition: { ref: passage, verse: 38, mode: "deep" },
    bookmarks: ["MRK:4:38"], highlights: { "MRK:4:38": "olive" },
    notebook: [{ id: noteId, text: noteText, link: { kind: "bible", ref: passage }, pinned: false,
      revision: 1, createdAt: stamp, updatedAt: stamp, deletedAt: null }],
  };
}

async function screenshot(page: Page, name: string) {
  await mkdir(out, { recursive: true });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/${name}.png` });
}

test("der echte Erststart zeigt drei Schritte, Tastaturfokus und den direkten Einstieg", async ({ page }) => {
  await page.goto("/");
  await expect(heading(page, "Gottes Wort entdecken")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Hauptnavigation", exact: true })).toHaveCount(0);
  expect(await rawData(page)).toBeUndefined();
  await page.keyboard.press("Tab");
  await expect(button(page, "Überspringen")).toBeFocused();
  await screenshot(page, "after-intro-1-390");
  await page.keyboard.press("Tab");
  await expect(button(page, "Weiter")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(heading(page, "Deine Gedanken festhalten")).toBeFocused();
  await screenshot(page, "after-intro-2-390");
  await button(page, "Weiter").click();
  await expect(heading(page, "Deinen Weg wachsen sehen")).toBeVisible();
  await expect(page.getByText(/Auf „Heute“ kannst du mit einem kurzen Bibelabschnitt beginnen/)).toBeVisible();
  await screenshot(page, "after-intro-3-390");
  await button(page, "Zurück").click();
  await expect(heading(page, "Deine Gedanken festhalten")).toBeVisible();
  await button(page, "Weiter").click();
  await button(page, "OLIVA entdecken").click();
  await expect(button(page, "Jetzt Bibel lesen")).toBeVisible();
  expect(await localData(page)).toEqual({ ...initialData(), onboarded: true, revision: 1 });
  await page.reload();
  await expect(button(page, "Jetzt Bibel lesen")).toBeVisible();
  await expect(intro(page)).toHaveCount(0);
});

test("du kannst die Einführung ohne Eingabe überspringen und sofort lesen", async ({ page }) => {
  await page.goto("/");
  await button(page, "Überspringen").click();
  await expect(button(page, "Jetzt Bibel lesen")).toBeVisible();
  await expect(intro(page)).toHaveCount(0);
  await button(page, "Jetzt Bibel lesen").click();
  await expect(page).toHaveURL(/\/lesen\/MRK/);
});

test("gespeicherte V11- und V12-Profile sehen die Einführung nur auf Wunsch", async ({ page }) => {
  for (const data of [initialData(), storedNotebook()]) {
    await openSettings(page);
    await storeProfile(page, data);
    const before = await rawData(page);
    await page.goto("/");
    await expect(heading(page, "Lass deinen Glaubensweg wachsen.")).toBeVisible();
    await expect(intro(page)).toHaveCount(0);
    expect(await rawData(page)).toEqual(before);
    await openSettings(page);
    await button(page, "Einführung noch einmal ansehen").click();
    await expect(heading(page, "Gottes Wort entdecken")).toBeVisible();
    await button(page, "Überspringen").click();
    await expect(heading(page, "Lass deinen Glaubensweg wachsen.")).toBeVisible();
    expect(await rawData(page)).toEqual(before);
    await page.reload();
    await expect(intro(page)).toHaveCount(0);
  }
});

test("Lesen, Reflexion, Notiz, Wiederfinden und Rückkehr funktionieren gemeinsam offline", async ({ page, context }) => {
  await page.goto("/");
  await button(page, "Überspringen").click();
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible({ timeout: 45000 });
  const before = await localData(page);
  await context.setOffline(true);
  await page.reload();
  await button(page, "Jetzt Bibel lesen").click();
  const readerUrl = page.url();
  expect(Object.fromEntries(new URL(readerUrl).searchParams)).toMatchObject({ chapter: "4", from: "35", to: "41" });
  await expect(page.getByTestId("reader-flow")).toBeVisible();
  await button(page, "Darüber nachdenken").click();
  await expect(heading(page, "Ein Gedanke für dich")).toBeFocused();
  await expect(page.getByText("Was bewegt dich an der Frage: „Kümmert es dich nicht?“", { exact: true })).toBeVisible();
  await button(page, "Weiterlesen").click();
  await expect(button(page, "Darüber nachdenken")).toBeFocused();
  await expect(page).toHaveURL(readerUrl);
  await button(page, "Darüber nachdenken").click();
  const write = button(page, "Gedanken festhalten");
  await write.scrollIntoViewIfNeeded();
  await screenshot(page, "after-reflection-390");
  await write.click();
  await expect(noteBox(page)).toBeFocused();
  await expect(button(page, "Markus 4,35–41 →")).toBeInViewport();
  await noteBox(page).fill(noteText);
  await expect(page.getByText("Auf diesem Gerät gespeichert", { exact: true })).toBeVisible();
  await screenshot(page, "after-linked-note-390");
  expect(decodeURIComponent(page.url())).not.toContain("Testnotiz zum Sturm");
  await button(page, "Markus 4,35–41 →").click();
  await expect(page).toHaveURL(readerUrl);
  await expect(page.getByTestId("reader-reflection")).toBeVisible();
  const after = await localData(page);
  expect(after.version).toBe(12);
  expect(after.notebook).toHaveLength(1);
  expect(after.notebook?.[0]).toMatchObject({ text: noteText, link: { kind: "bible", ref: passage } });
  for (const key of ["notes", "drafts", "growthStage", "readChapters", "readPassages", "readSteps", "completedSteps", "activePath"] as const)
    expect(after[key], key).toEqual(before[key]);
  await page.goto("/sammlung");
  await page.getByRole("button", { name: /Testnotiz zum Sturm/ }).click();
  await expect(noteBox(page)).toHaveValue(noteText);
  await button(page, "Markus 4,35–41 →").click();
  await expect(page).toHaveURL(readerUrl);
  await expect(page.getByTestId("reader-flow")).toBeVisible();
});

test("Weg- und Geschichtenfragen bleiben getrennt von verknüpften Notizen", async ({ page }) => {
  await page.goto("/geschichte/NS-0203?stage=gedanken");
  await expect(page.getByRole("textbox", { name: "Dein eigener Gedanke · freiwillig" })).toBeVisible();
  await button(page, "Gedanken festhalten").click();
  await expect(noteBox(page)).toBeFocused();
  await noteBox(page).fill("Synthetische Notiz zur Originalfrage.");
  await expect(page.getByText("Auf diesem Gerät gespeichert", { exact: true })).toBeVisible();
  await button(page, "Reflexion").click();
  await expect(page).toHaveURL(/\/geschichte\/NS-0203\?stage=gedanken/);
  await page.goto("/weg/jesus?step=0");
  await button(page, "Abschnitt lesen").click();
  await button(page, "Abschnitt als gelesen bestätigen").click();
  await button(page, "Weiter zum Verstehen").click();
  const before = await localData(page);
  await button(page, "Gedanken festhalten").click();
  await expect(noteBox(page)).toBeFocused();
  await noteBox(page).fill("Synthetische Notiz zur Wegfrage.");
  await expect(page.getByText("Auf diesem Gerät gespeichert", { exact: true })).toBeVisible();
  const after = await localData(page);
  expect(after.notebook?.map((note) => note.link)).toEqual([
    { kind: "story-question", storyId: "NS-0203" }, { kind: "path-question", pathId: "jesus", step: 0 },
  ]);
  for (const key of ["notes", "drafts", "storyStudy", "completedSteps", "growthStage"] as const)
    expect(after[key], key).toEqual(before[key]);
});

test("Heute zeigt das tatsächliche Baumstadium und führt zur bestehenden FaithPath-Historie", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-11-19T14:00:00.000Z"));
  await page.goto("/importieren");
  const choosing = page.waitForEvent("filechooser");
  await button(page, "FaithPath-Datei auswählen").click();
  const archive = JSON.stringify(faithpathFixture(), null, 2);
  await (await choosing).setFiles({ name: "synthetischer-verlauf.json", mimeType: "application/json", buffer: Buffer.from(archive) });
  await button(page, "Jetzt sichern und Import übernehmen").click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  const current = await localData(page), returning = storedNotebook();
  const data = { ...current, version: 12 as const, name: returning.name, growthStage: returning.growthStage,
    reading: returning.reading, readingPosition: returning.readingPosition, notebook: returning.notebook };
  await storeProfile(page, data);
  const before = await rawData(page);
  await page.goto("/");
  await expect(page.getByTestId("home-greeting")).toHaveText("Schön, dass du wieder da bist, Mara.");
  await expect(page.getByRole("img", { name: "Dein Olivenbaum · Wachsender Olivenbaum", exact: true })).toBeInViewport();
  await screenshot(page, "after-today-returning-390");
  await button(page, "Meinen Garten ansehen").click();
  await expect(page).toHaveURL(/\/garten$/);
  await expect(page.getByRole("img", { name: /^Wachsender Olivenbaum –/ })).toBeVisible();
  await button(page, "Frühere FaithPath-Momente ansehen").click();
  await expect(page.getByTestId("archive-readable-history")).toBeVisible();
  expect((await localData(page)).imports[0]?.sourceText).toBe(archive);
  expect(await rawData(page)).toEqual(before);
});

test("ein geschützter Offline-Direktlink öffnet nach der Sperre den ursprünglichen Editor", async ({ page, context }) => {
  await openSettings(page);
  await storeProfile(page, storedNotebook());
  await page.reload();
  const before = await rawData(page);
  const password = randomUUID();
  await button(page, "OLIVA mit Passwort schützen").click();
  await page.getByLabel("Neues Passwort", { exact: true }).fill(password);
  await page.getByLabel("Neues Passwort bestätigen", { exact: true }).fill(password);
  await button(page, "Weiter zum Wiederherstellungscode").click();
  await page.getByLabel("Wiederherstellungscode bestätigen", { exact: true })
    .fill(await page.getByTestId("oliva-recovery-code").innerText());
  await button(page, "Passwortschutz aktivieren").click();
  await expect(button(page, "Jetzt sperren")).toBeVisible();
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible({ timeout: 45000 });
  await context.setOffline(true);
  await page.goto(`/notizen/${noteId}`);
  await expect(heading(page, "OLIVA entsperren")).toBeVisible();
  await expect(noteBox(page)).toHaveCount(0);
  await expect(intro(page)).toHaveCount(0);
  await page.getByLabel("App-Passwort", { exact: true }).fill(password);
  await button(page, "Entsperren").click();
  await expect(noteBox(page)).toHaveValue(noteText);
  await expect(page).toHaveURL(new RegExp(`/notizen/${noteId}$`));
  expect(await rawData(page)).toEqual(before);
});

test("Heute hält Leseaktion und vorhandenes Baumbild auf vier Breiten in Hell und Dunkel sichtbar", async ({ page }) => {
  test.setTimeout(180000);
  const evidence = [];
  await page.clock.setFixedTime(new Date("2026-11-19T14:00:00.000Z"));
  for (const theme of ["light", "dark"] as const) {
    await openSettings(page);
    const profile = initialData();
    profile.settings.theme = theme;
    await storeProfile(page, profile);
    for (const [width, height] of [[320, 568], [375, 812], [390, 844], [430, 932]] as const) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      const action = button(page, "Jetzt Bibel lesen");
      const tree = page.getByTestId("home-personal-tree");
      await expect(action).toBeInViewport({ ratio: 1 });
      await expect(tree).toBeInViewport({ ratio: 0.8 });
      await expect.poll(() => tree.locator("img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      await screenshot(page, `after-today-${theme}-${width}`);
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect(axe.violations).toEqual([]);
      await page.evaluate(() => {
        for (const element of document.querySelectorAll<HTMLElement>('[dir="auto"]')) {
          const { fontSize, lineHeight } = getComputedStyle(element);
          element.style.fontSize = `${parseFloat(fontSize) * 2}px`;
          if (Number.isFinite(parseFloat(lineHeight))) element.style.lineHeight = `${parseFloat(lineHeight) * 2}px`;
        }
      });
      expect(await page.getByRole("main").evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await expect(action).toBeEnabled();
      await action.focus();
      await expect(action).toBeFocused();
      evidence.push({ theme, width, height, readingAction: true, personalTree: true, doubledText: true, axeViolations: 0 });
    }
  }
  await writeFile(`${out}/layouts.json`, JSON.stringify({ physicalDeviceTest: false, evidence }, null, 2) + "\n");
});

test("alle sieben A51-Stufen verwenden ihr jeweiliges Original auch auf Heute", async ({ page }) => {
  await openSettings(page);
  for (const { index: stage, name } of stages) {
    await storeProfile(page, { ...initialData(), growthStage: stage });
    await page.goto("/");
    const tree = page.getByRole("img", { name: `Dein Olivenbaum · ${name}`, exact: true });
    await expect(tree).toBeInViewport();
    await expect.poll(() => tree.locator("img").evaluate((img: HTMLImageElement, prefix) =>
      [img.naturalWidth > 0, img.src.includes(prefix)], `stage-${stage + 1}-`)).toEqual([true, true]);
    expect((await localData(page)).growthStage).toBe(stage);
  }
});
