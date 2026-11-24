import { chromium, expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { faithpathFixture } from "../fixtures/faithpath-v5";
import { localData, rawData } from "./persistence";
import { requestPlainBackup } from "./backup-ui";

test.use({ actionTimeout: 10000 });

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true }).filter({ visible: true });
const note = (page: Page) => page.getByRole("textbox", { name: "Notiztext", exact: true });
const rows = (page: Page) => page.getByRole("button", { name: /^Notiz öffnen:/ }).filter({ visible: true });
const field = (page: Page, name: string) => page.getByLabel(name, { exact: true });

async function edit(page: Page, text: string) {
  await note(page).fill(text);
  await expect.poll(async () => (await localData(page))?.notebook?.some((entry) => entry.text === text)).toBe(true);
}

async function newNote(page: Page, text: string) {
  await button(page, "Neue Notiz").click();
  await expect(note(page)).toBeFocused();
  await edit(page, text);
  return page.url();
}

async function chooseFile(page: Page, buttonName: string, name: string, payload: Buffer) {
  const event = page.waitForEvent("filechooser");
  await button(page, buttonName).click();
  await (await event).setFiles({ name, mimeType: "application/octet-stream", buffer: payload });
}

async function downloadFrom(page: Page, trigger: () => Promise<unknown>) {
  const result = page.waitForEvent("download");
  await trigger();
  const file = await result;
  const bytes = await readFile((await file.path())!);
  await file.delete();
  return bytes;
}

test("aus Sammlung sofort schreiben und nach Neustart, schneller Eingabe und Offline-Wechsel weiterlesen", async ({ page, context }) => {
  await page.goto("/sammlung");
  await expect(button(page, "Notizen")).toHaveCount(0);
  await expect(page.getByText("Hier ist Platz für deine Gedanken.", { exact: true })).toBeVisible();
  await button(page, "Neue Notiz").click();
  await expect(note(page)).toBeFocused();
  await button(page, "Sammlung").click();
  expect((await rawData(page))?.data.notebook).toBeUndefined();
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await button(page, "Neue Notiz").click();
  await note(page).pressSequentially("Heute schreibe ich schnell.");
  const final = "Mein erster Eintrag\n\nEine zweite Zeile.\nEine dritte Zeile 🌿";
  await note(page).fill(final);
  await button(page, "Sammlung").click();
  await expect(button(page, "Notiz öffnen: Mein erster Eintrag")).toBeVisible();
  await expect(page).toHaveURL(/\/sammlung$/);
  await page.reload();
  await button(page, "Notiz öffnen: Mein erster Eintrag").click();
  await expect(note(page)).toHaveValue(final);
  await edit(page, final + "\nNoch eine Zeile.");
  expect((await localData(page)).notebook).toHaveLength(1);
});

test("nach komplettem Chromium-Neustart bleibt die zuletzt geschriebene Fassung offline lesbar", async ({ baseURL }) => {
  const profile = await mkdtemp(path.join(tmpdir(), "oliva-notes-browser-restart-"));
  const launch = () => chromium.launchPersistentContext(profile, {
    executablePath: process.env.CHROMIUM_PATH ?? (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: ["--no-sandbox"],
    baseURL,
  });
  let browser = await launch();
  try {
    const page = browser.pages()[0]!;
    await page.goto("/notizen");
    const text = "Meine zuletzt geschriebene Notiz\nSie bleibt über den Browser-Neustart erhalten.";
    await newNote(page, "Mein erster Stand");
    await edit(page, text);
    await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
    await browser.close();
    browser = await launch();
    await browser.setOffline(true);
    const again = browser.pages()[0]!;
    await again.goto("/notizen");
    await button(again, "Notiz öffnen: Meine zuletzt geschriebene Notiz").click();
    await expect(note(again)).toHaveValue(text);
  } finally {
    await browser.close();
    await rm(profile, { recursive: true, force: true });
  }
});

test("Suche, Datum, Anheften und bestätigtes Löschen mit Wiederherstellung", async ({ page }) => {
  await page.goto("/notizen");
  await newNote(page, "Ein erster Titel\nWorte, die Orientierung geben.");
  await button(page, "Sammlung").click();
  await newNote(page, "Ein zweiter Titel\nEin anderer Eintrag.");
  await button(page, "Sammlung").click();
  await expect(rows(page).first()).toHaveAccessibleName("Notiz öffnen: Ein zweiter Titel");
  await field(page, "Deine Sammlung durchsuchen").fill("ORIENTIERUNG");
  await expect(rows(page)).toHaveCount(1);
  await button(page, "Notiz öffnen: Ein erster Titel").click();
  await button(page, "Optionen").click();
  await button(page, "Notiz anheften").click();
  await button(page, "Sammlung").click();
  await field(page, "Deine Sammlung durchsuchen").fill("");
  await expect(page.getByRole("heading", { name: "Angeheftet" })).toBeVisible();
  await expect(rows(page).first()).toHaveAccessibleName("Notiz öffnen: Ein erster Titel");
  await button(page, "Notiz öffnen: Ein erster Titel").click();
  await button(page, "Optionen").click();
  await button(page, "Anheftung lösen").click();
  await button(page, "Optionen").click();
  await button(page, "Notiz löschen").click();
  await button(page, "Abbrechen").click();
  expect((await localData(page)).notebook?.every((entry) => entry.deletedAt === null)).toBe(true);
  await button(page, "Notiz löschen").click();
  await button(page, "Löschen bestätigen").click();
  await expect(button(page, "Notiz öffnen: Ein erster Titel")).toHaveCount(0);
  await button(page, "Zuletzt gelöscht").click();
  await expect(page.getByText("Ein erster Titel", { exact: true })).toBeVisible();
  await button(page, "Wiederherstellen").click();
  await expect(page.getByText("Hier ist gerade nichts gelöscht.", { exact: true })).toBeVisible();
  await button(page, "Sammlung").click();
  await expect(rows(page)).toHaveCount(2);
});

test("Bibelstelle, Wege, Geschichten und Reflexionsfragen verbinden und aus dem Reader wiederfinden", async ({ page }) => {
  await page.goto("/notizen");
  await newNote(page, "Worte aus dem Reader\nEine Erinnerung.");
  async function picker() {
    await button(page, "Optionen").click();
    await page.getByRole("button", { name: /^Verknüpfung (hinzufügen|ändern)$/ }).click();
  }
  await picker();
  await button(page, "Weg").click();
  await field(page, "Weg suchen").fill("beten");
  await button(page, "Wie kann ich beten?").click();
  await expect(button(page, "Wie kann ich beten? →")).toBeVisible();
  await picker();
  await button(page, "Geschichte").click();
  await field(page, "Geschichte suchen").fill("Zachäus");
  await page.getByRole("button", { name: /Zachäus.*·/ }).first().click();
  await expect(page.getByRole("button", { name: /Zachäus.*→/ })).toBeVisible();
  await picker();
  await button(page, "Reflexionsfrage").click();
  await button(page, "Wofür möchtest du heute einen Moment dankbar sein? · Tagesreflexion").click();
  await expect(button(page, "Wofür möchtest du heute einen Moment dankbar sein? →")).toBeVisible();
  await picker();
  await page.getByRole("button", { name: / ändern$/, exact: false }).filter({ visible: true }).last().click();
  await field(page, "Bibelbuch suchen").fill("j o h a n n e s");
  await button(page, "Johannes").click();
  await field(page, "Kapitel").fill("3");
  await field(page, "Vers oder Versbereich (freiwillig)").fill("16–18");
  await button(page, "Bibelstelle verknüpfen").click();
  await expect.poll(async () => (await localData(page)).notebook?.[0]?.link).toEqual(
    { kind: "bible", ref: { book: "JHN", chapter: 3, from: 16, to: 18 } },
  );
  await button(page, "Johannes 3,16–18 →").click();
  await expect(page).toHaveURL(/lesen\/JHN\?.*chapter=3/);
  await button(page, "Notizen zu diesem Kapitel").click();
  await button(page, "Notiz öffnen: Worte aus dem Reader").click();
  await expect(note(page)).toHaveValue("Worte aus dem Reader\nEine Erinnerung.");
});

test("behält eine konkurrierende Notizfassung als Kopie und schreibt unabhängige Notizen zusammen", async ({ page, context }) => {
  await page.goto("/notizen");
  const address = await newNote(page, "Gemeinsamer Text");
  const other = await context.newPage();
  await other.goto(address);
  await expect(note(other)).toHaveValue("Gemeinsamer Text");
  await edit(page, "Fassung im ersten Fenster");
  await edit(other, "Fassung im zweiten Fenster");
  await expect(other.getByText(/als eigene Notiz gespeichert/)).toBeVisible();
  let current = (await localData(other)).notebook;
  expect(current?.map((item) => item.text)).toEqual(["Fassung im ersten Fenster", "Fassung im zweiten Fenster"]);
  const third = await context.newPage();
  await third.goto("/notizen");
  await other.goto("/notizen");
  await newNote(third, "Zusätzliches drittes Fenster");
  await newNote(other, "Eine unabhängige vierte Notiz");
  current = (await localData(other)).notebook;
  expect(current?.map((item) => item.text)).toEqual([
    "Fassung im ersten Fenster", "Fassung im zweiten Fenster", "Zusätzliches drittes Fenster", "Eine unabhängige vierte Notiz",
  ]);
});

test("übersteht blockierte lokale Speicherung mit Zwischenstand und Wiederherstellung nach Browser-Neuladen", async ({ page }) => {
  await page.goto("/notizen");
  await newNote(page, "Bereits dauerhaft hinterlegt");
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      if (this.name === "state" && args[1] === "main") throw new DOMException("Synthetischer Speicherfehler", "QuotaExceededError");
      return original.apply(this, args);
    };
  });
  const unsaved = "Schon im Editor\nGerade erst geschriebene Worte bleiben erhalten.";
  await note(page).fill(unsaved);
  await expect(page.getByText("Deine Worte warten noch auf das Speichern.")).toBeVisible();
  expect((await localData(page)).notebook?.[0]?.text).toBe("Bereits dauerhaft hinterlegt");
  page.once("dialog", (dialog) => void dialog.accept());
  await page.reload();
  await expect(note(page)).toHaveValue(unsaved);
  await expect.poll(async () => (await localData(page)).notebook?.[0]?.text).toBe(unsaved);
});

test("kompletter unverschlüsselter und verschlüsselter Sicherungsweg mit alten FaithPath-Daten und App-Sperre", async ({ page, context }) => {
  await page.goto("/importieren");
  const source = JSON.stringify(faithpathFixture(), null, 2);
  await chooseFile(page, "FaithPath-Datei auswählen", "synthetic-v5.json", Buffer.from(source));
  await button(page, "Jetzt sichern und Import übernehmen").click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  await page.goto("/einstellungen");
  const legacy = await downloadFrom(page, () => requestPlainBackup(page));
  expect(JSON.parse(legacy.toString()).version).toBe(11);
  await page.goto("/notizen");
  const address = await newNote(page, "Vollständiger Export\nPersönlicher, synthetischer Notiztext.");
  const saved = await localData(page);
  expect(saved.imports[0]?.sourceText).toBe(source);
  expect(saved.notes.length).toBeGreaterThan(0);
  expect(saved.version).toBe(12);
  await page.goto("/einstellungen");
  const plain = await downloadFrom(page, () => requestPlainBackup(page));
  expect(JSON.parse(plain.toString())).toEqual(saved);
  const password = randomUUID();
  const secured = await downloadFrom(page, async () => {
    await button(page, "Sicherung erstellen").click();
    await button(page, "Sicherung mit Passwort schützen").click();
    await field(page, "Passwort für die Sicherung").fill(password);
    await field(page, "Passwort für die Sicherung bestätigen").fill(password);
    await button(page, "Verschlüsselte Sicherung exportieren").click();
  });
  expect(secured.subarray(0, 8).toString()).toBe("OLIVAENC");
  await button(page, "Sicherung wiederherstellen").click();
  await chooseFile(page, "OLIVA-Sicherungsdatei auswählen", "older.json", legacy);
  await button(page, "Daten durch diese Sicherung ersetzen").click();
  await expect.poll(async () => (await localData(page)).version).toBe(11);
  await chooseFile(page, "OLIVA-Sicherungsdatei auswählen", "protected.oliva", secured);
  await field(page, "Passwort der Sicherungsdatei").fill(password);
  await button(page, "Sicherung entschlüsseln und prüfen").click();
  await expect(page.getByText(/Dazu kommt 1 Notiz/)).toBeVisible();
  await button(page, "Daten durch diese Sicherung ersetzen").click();
  await expect.poll(async () => (await localData(page)).notebook).toEqual(saved.notebook);
  expect(await localData(page)).toEqual({ ...saved, revision: (await localData(page)).revision });
  const accessPassword = randomUUID();
  await button(page, "OLIVA mit Passwort schützen").click();
  await field(page, "Neues Passwort").fill(accessPassword);
  await field(page, "Neues Passwort bestätigen").fill(accessPassword);
  await button(page, "Weiter zum Wiederherstellungscode").click();
  await field(page, "Wiederherstellungscode bestätigen").fill(await page.getByTestId("oliva-recovery-code").innerText());
  await button(page, "Passwortschutz aktivieren").click();
  await expect(button(page, "Jetzt sperren")).toBeVisible();
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.goto(address);
  await expect(page.getByRole("heading", { name: "OLIVA entsperren" })).toBeVisible();
  await expect(note(page)).toHaveCount(0);
  await field(page, "App-Passwort").fill(accessPassword);
  await button(page, "Entsperren").click();
  await expect(note(page)).toHaveValue(saved.notebook?.[0]?.text ?? "");
});

test("ältere Bibelnotizen bleiben verlinkt und die FaithPath-Rückkehr bewahrt das eigenständige Notizbuch", async ({ page }) => {
  await page.goto("/lesen/JHN?chapter=6");
  await page.getByRole("button", { name: /^Vers 35:/ }).filter({ visible: true }).click();
  await page.getByRole("toolbar", { name: "Versauswahl", exact: true }).getByRole("button", { name: "Notiz", exact: true }).click();
  const old = "Vorhandene Notiz am einzelnen Vers";
  await field(page, "Notiz zu Vers 35").fill(old);
  await button(page, "Notiz speichern").click();
  await expect.poll(async () => (await localData(page)).notes.some((entry) => entry.text === old)).toBe(true);
  const original = (await localData(page)).notes.find((entry) => entry.text === old)!;
  await page.getByRole("dialog").filter({ visible: true }).getByRole("button", { name: "Schließen", exact: true }).click();
  await button(page, "Notizen zu diesem Kapitel").click();
  await expect(page.getByRole("heading", { name: "Aus der Sammlung" })).toBeVisible();
  await button(page, "Notiz öffnen: " + old).click();
  await expect(page).toHaveURL(/sammlung\?.*view=read/);
  await expect(page.getByTestId(`collection-note-${original.id}`).getByText(old, { exact: true })).toBeVisible();

  await page.goto("/importieren");
  await chooseFile(page, "FaithPath-Datei auswählen", "synthetic-v5.json", Buffer.from(JSON.stringify(faithpathFixture())));
  await button(page, "Jetzt sichern und Import übernehmen").click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  await page.goto("/notizen");
  await newNote(page, "Notiz nach dem FaithPath-Import");
  const saved = (await localData(page)).notebook;
  await page.goto("/importieren");
  await button(page, "Rückkehr prüfen").click();
  await expect(page.getByText(/Deine Notizen bleiben erhalten/)).toBeVisible();
  await button(page, "Stand vor dem Import jetzt wiederherstellen").click();
  await expect(page.getByText("Der Stand vor dem Import wurde wiederhergestellt.", { exact: true })).toBeVisible();
  const restored = await localData(page);
  expect(restored.notes.some((entry) => entry.text === old)).toBe(true);
  expect(restored.notebook).toEqual(saved);
  expect(restored.imports).toEqual([]);
});

test("kleiner Bildschirm und Bedienung per Tastatur mit Axe in Hell und Dunkel", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/einstellungen");
  await button(page, "Dunklen Modus aktivieren").click();
  await expect.poll(async () => (await localData(page)).settings.theme).toBe("dark");
  for (const dark of [true, false]) {
    if (!dark) {
      await page.goto("/einstellungen");
      await button(page, "Hellen Modus aktivieren").click();
      await expect.poll(async () => (await localData(page)).settings.theme).toBe("light");
    }
    await page.goto("/notizen");
    await button(page, "Neue Notiz").focus();
    await page.keyboard.press("Enter");
    await expect(note(page)).toBeFocused();
    await page.keyboard.insertText(dark ? "Probe im Dunkelmodus" : "Probe im Hellmodus");
    await expect(page.getByText("Auf diesem Gerät gespeichert")).toBeVisible();
    await page.getByRole("main").evaluate((element) => {
      for (const text of element.querySelectorAll<HTMLElement>("textarea, [dir]")) {
        text.style.fontSize = (2 * parseFloat(getComputedStyle(text).fontSize)) + "px";
      }
    });
    expect(await page.getByRole("main").evaluate((main) => main.scrollWidth <= main.clientWidth + 1)).toBe(true);
    expect((await new AxeBuilder({ page }).include('main').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  }
});
