import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, expect } from "@playwright/test";
import { faithpathFixture } from "../../../tests/fixtures/faithpath-v5.ts";
import { localData, rawData } from "../../../tests/e2e/persistence.ts";

const origin = process.env.OLIVA_AUDIT_ORIGIN ?? "http://localhost:4183";
const out = "docs/evidence/kiss-faith-journey";
const sizes = [[320, 568], [375, 812], [390, 844], [430, 932]];
const date = new Date("2026-11-19T14:00:00Z");
const now = new Date("2026-10-22T14:00:00Z");
const exampleText = "Ein stiller Moment\n\nHeute ist mir das Wort von der Stille geblieben.";
const ref = { book: "MRK", chapter: 4, from: 35, to: 41 };
const bibleQuery = "?book=MRK&chapter=4&from=35&to=41";
const source = JSON.stringify(faithpathFixture(), null, 2);
const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: ["--no-sandbox"],
});
const report = { browser: browser.version(), syntheticProfiles: true, deviceTest: false, app: {}, geometry: [], tasks: [], screens: [] };
const button = (page, name) => page.getByRole("button", { name, exact: true }).filter({ visible: true });
const label = (page, name) => page.getByLabel(name, { exact: true });
const go = (page, route) => page.goto(origin + route);
const header = (page, name) => page.getByRole("heading", { name, exact: true }).filter({ visible: true });
const noteBox = (page) => page.getByRole("textbox", { name: "Notiztext", exact: true });
const visible = (selector) => selector.filter({ visible: true });

async function pageAt(clock = date) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true,
    reducedMotion: "reduce", timezoneId: "UTC", colorScheme: "light",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  await page.clock.setFixedTime(clock);
  return { page, context };
}

async function shoot(page, name, subject) {
  if (subject) await subject.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.screenshot({ path: `${out}/${name}.png` });
  report.screens.push({ file: `${name}.png`, viewport: page.viewportSize(), location: new URL(page.url()).pathname });
}

async function geometry(page) {
  const view = page.viewportSize();
  const action = await page.getByTestId("home-primary-action").boundingBox();
  const tree = await visible(page.getByTestId("olive-tree")).first().boundingBox();
  const nav = await page.getByRole("navigation", { name: "Hauptnavigation", exact: true }).boundingBox();
  assert.ok(view && action && tree && nav);
  return {
    ...view, actionTop: Math.round(action.y), actionBottom: Math.round(action.y + action.height),
    treeTop: Math.round(tree.y), treeHeight: Math.round(tree.height), contentBottom: Math.round(nav.y),
    minScrollForTreeStart: Math.max(0, Math.round(tree.y - nav.y)),
  };
}

async function guest() {
  const { page, context } = await pageAt();
  try {
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await go(page, "/");
      await expect(page.getByTestId("home-primary-action")).toHaveText("Deine erste Geschichte");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      report.geometry.push(await geometry(page));
      await shoot(page, `before-today-new-${width}`);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await go(page, "/");
    report.app.build = await page.locator('meta[name="oliva-build"]').getAttribute("content");
    const first = await page.getByTestId("home-primary-action").innerText();
    await page.getByTestId("home-primary-action").click();
    await expect(header(page, "Du darfst mit Fragen anfangen.")).toBeVisible();
    const reading = button(page, "Geschichte lesen");
    const next = await reading.boundingBox();
    const nav = await page.getByRole("navigation", { name: "Hauptnavigation" }).boundingBox();
    report.tasks.push({ name: "Erststart", firstRoute: "/", firstAction: first, nextRoute: new URL(page.url()).pathname,
      startCtaTop: Math.round(next?.y ?? -1), contentBottom: Math.round(nav?.y ?? -1), tapsToReader: 2, automaticPopup: false });
    await shoot(page, "before-start-390");
    await shoot(page, "before-start-action-390", reading);
    await reading.click();
    await expect(page).toHaveURL(/\/lesen\/MRK\?.*from=35/);
    await expect(page.getByTestId("reader-flow")).toBeVisible();
    await expect.poll(async () => (await localData(page))?.activePath).toBe("jesus");
    assert.equal((await localData(page)).onboarded, true);
    await shoot(page, "before-reader-390");
    await button(page, "Tiefer verstehen").click();
    const prompt = page.getByText("Ein Gedanke für dich", { exact: true });
    await expect(prompt).toBeVisible();
    await shoot(page, "before-reader-reflection-390", prompt);
    report.tasks.push({
      name: "Vom Bibelabschnitt zum Nachdenken", reference: ref,
      currentReaderPath: "Tiefer verstehen → Ein Gedanke für dich",
      hasDirectWriteActionInThatCard: await prompt.locator("..").getByRole("button").count() > 0,
      currentChapterNotebookPath: "Leseeinstellungen → Notizen zu diesem Kapitel → Neue Notiz",
    });

    await go(page, "/bibel");
    await expect(header(page, "Deine Bibel.")).toBeVisible();
    await shoot(page, "before-bible-390");
    await go(page, "/wege");
    await expect(button(page, "Wer ist Jesus?, 15 Minuten, 0 von 3 Schritten")).toBeVisible();
    await shoot(page, "before-paths-390");
    await go(page, "/geschichte/NS-0203?stage=gedanken");
    await expect(header(page, "Schweig und verstumme")).toBeVisible();
    await shoot(page, "before-story-reflection-390", page.getByText("Was bleibt bei dir?", { exact: true }));
  } finally {
    await context.close();
  }
}

async function prepareReturning(page) {
  await go(page, "/importieren");
  const selection = page.waitForEvent("filechooser");
  await button(page, "FaithPath-Datei auswählen").click();
  await (await selection).setFiles({ name: "faithpath-synthetisch.json", mimeType: "application/json", buffer: Buffer.from(source) });
  await button(page, "Jetzt sichern und Import übernehmen").click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  await go(page, "/notizen" + bibleQuery);
  await button(page, "Neue Notiz").click();
  await noteBox(page).fill(exampleText);
  await expect(page.getByText("Auf diesem Gerät gespeichert", { exact: true })).toBeVisible();
  await page.evaluate((reference) => new Promise((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("state", "readwrite");
      const store = tx.objectStore("state");
      const query = store.get("main");
      query.onsuccess = () => {
        const record = query.result;
        if (!record?.data?.notebook?.length) { tx.abort(); return; }
        Object.assign(record.data, {
          name: "Mara", onboarded: true, growthStage: 3,
          reading: reference, readingPosition: { ref: reference, verse: 38, mode: "read" },
          bookmarks: [...new Set([...record.data.bookmarks, "MRK:4:38"])],
        });
        store.put(record, "main");
      };
      tx.onabort = () => { db.close(); reject(new Error("Das synthetische Profil konnte nicht vorbereitet werden.")); };
      tx.oncomplete = () => { db.close(); resolve(); };
    };
  }), ref);
  const offlineReady = page.getByText("Für den Offline-Neustart bereit.", { exact: true });
  await expect(offlineReady).toBeVisible();
}

async function currentRecords(page) {
  const current = await localData(page);
  assert.equal(current.version, 12);
  assert.equal(current.imports[0]?.sourceText, source);
  return {
    profile: digest(await rawData(page)),
    recovery: digest(await rawData(page, "before-faithpath-import")),
    recoveryIndex: digest(await rawData(page, "recovery-index")),
    archive: digest(current.imports[0].sourceText),
  };
}

async function returning() {
  const { page, context } = await pageAt(now);
  try {
    await prepareReturning(page);
    await page.clock.setFixedTime(date);
    await go(page, "/");
    await expect(page.getByTestId("home-primary-action")).toHaveText("In der Bibel weiterlesen");
    const before = await currentRecords(page);
    const current = await localData(page);
    report.tasks.push({ name: "Rückkehr nach 28 simulierten Tagen", version: current.version, growthStage: current.growthStage,
      greeting: await page.getByTestId("home-greeting").innerText(), bookmark: current.bookmarks.includes("MRK:4:38"),
      readerAnchor: current.readingPosition?.verse, displayedIntroAutomatically: false });
    await shoot(page, "before-today-returning-390");
    const garden = button(page, "Deinen Garten ansehen");
    await shoot(page, "before-today-tree-390", garden);
    await garden.click();
    await expect(header(page, "Mein Garten.")).toBeVisible();
    await shoot(page, "before-garden-390");
    await button(page, "Frühere FaithPath-Momente ansehen").click();
    const history = page.getByTestId("archive-readable-history");
    await expect(history).toBeVisible();
    await shoot(page, "before-garden-history-390", history);
    report.tasks.push({ name: "Baum und frühere Erfahrungen", path: "Heute → Deinen Garten ansehen → Frühere FaithPath-Momente ansehen" });

    await page.getByRole("navigation", { name: "Hauptnavigation" }).getByRole("button", { name: "Sammlung", exact: true }).click();
    await expect(header(page, "Deine Sammlung.")).toBeVisible();
    await shoot(page, "before-collection-390");
    await button(page, "Notizen").click();
    await expect(header(page, "Notizen")).toBeVisible();
    await shoot(page, "before-notebook-390");
    await button(page, "Notiz öffnen: Ein stiller Moment").click();
    await expect(noteBox(page)).toHaveValue(exampleText);
    await expect(button(page, "Markus 4,35–41 →")).toBeVisible();
    await shoot(page, "before-notebook-editor-390");
    const notePath = new URL(page.url()).pathname;
    const after = await currentRecords(page);
    assert.deepEqual(after, before);
    report.tasks.push({ name: "Früheren Gedanken wiederfinden", path: "Sammlung → Notizen → Eintrag öffnen", sourceLink: ref,
      readOnlyRecords: { exact: true, before, after } });

    await go(page, "/einstellungen");
    await button(page, "Sicherung erstellen").click();
    await expect(button(page, "Sicherung mit Passwort schützen")).toBeVisible();
    await shoot(page, "before-backup-390", button(page, "Sicherung mit Passwort schützen"));
    const password = randomUUID();
    await button(page, "OLIVA mit Passwort schützen").click();
    await label(page, "Neues Passwort").fill(password);
    await label(page, "Neues Passwort bestätigen").fill(password);
    await button(page, "Weiter zum Wiederherstellungscode").click();
    await label(page, "Wiederherstellungscode bestätigen").fill(await page.getByTestId("oliva-recovery-code").innerText());
    await button(page, "Passwortschutz aktivieren").click();
    await expect(button(page, "Jetzt sperren")).toBeVisible();
    await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
    await context.setOffline(true);
    await go(page, notePath);
    await expect(header(page, "OLIVA entsperren")).toBeVisible();
    await expect(noteBox(page)).toHaveCount(0);
    await expect(page.getByText(exampleText, { exact: true })).toHaveCount(0);
    await shoot(page, "before-locked-direct-link-390");
    await label(page, "App-Passwort").fill(password);
    await button(page, "Entsperren").click();
    await expect(noteBox(page)).toHaveValue(exampleText);
    assert.equal(new URL(page.url()).pathname, notePath);
    assert.deepEqual(await currentRecords(page), before);
    report.tasks.push({ name: "Geschützter Direktlink offline", target: "Notizeditor", privateBeforeUnlock: false,
      targetAfterUnlock: true, unchangedDataRecords: 4 });
  } finally {
    await context.close();
  }
}

try {
  await guest();
  await returning();
  report.passed = true;
} finally {
  await browser.close();
  await writeFile(`${out}/baseline.json`, JSON.stringify(report, null, 2) + "\n");
}
