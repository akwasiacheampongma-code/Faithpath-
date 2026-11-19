import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { faithpathFixture } from "../fixtures/faithpath-v5";
import { localData, rawData } from "./persistence";

const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });
const field = (page: Page, name: string) => page.getByLabel(name, { exact: true });
const secret = () => randomUUID() + "-🌿";
const gate = (page: Page) => page.getByRole("heading", { name: "OLIVA entsperren", exact: true });

async function choose(page: Page, buttonName: string, name: string, payload: Buffer) {
  const pick = page.waitForEvent("filechooser");
  await button(page, buttonName).click();
  await (await pick).setFiles({ name, buffer: payload, mimeType: "application/octet-stream" });
}

async function setName(page: Page, name: string) {
  await field(page, "Dein Vorname (freiwillig)").fill(name);
  await button(page, "Namen speichern").click();
  await expect.poll(async () => (await localData(page)).name).toBe(name);
}

async function fillNewPassword(page: Page, password: string) {
  await field(page, "Neues Passwort").fill(password);
  await field(page, "Neues Passwort bestätigen").fill(password);
}

async function captureCode(page: Page) {
  const code = await page.getByTestId("oliva-recovery-code").innerText();
  expect(code).toMatch(/^[0-9A-F]{4}(-[0-9A-F]{4}){7}$/);
  return code;
}

async function enable(page: Page, password: string) {
  await button(page, "OLIVA mit Passwort schützen").click();
  await fillNewPassword(page, password);
  await button(page, "Weiter zum Wiederherstellungscode").click();
  const code = await captureCode(page);
  await field(page, "Wiederherstellungscode bestätigen").fill(code);
  await button(page, "Passwortschutz aktivieren").click();
  await expect(button(page, "Jetzt sperren")).toBeVisible();
  await expect(page.getByTestId("oliva-recovery-code")).toHaveCount(0);
  return code;
}

async function unlock(page: Page, password: string) {
  await expect(gate(page)).toBeVisible();
  await field(page, "App-Passwort").fill(password);
  await button(page, "Entsperren").click();
  await expect(page.getByTestId("oliva-unlocked-content")).toBeVisible();
  await expect(gate(page)).toHaveCount(0);
}

test("real encrypted file keeps an original archive offline and only a confirmed preview replaces data", async ({ page, context }) => {
  const password = secret();
  await page.goto("/einstellungen");
  await setName(page, "Synthetisches Langarchiv");
  await page.goto("/importieren");
  const source = JSON.stringify({ ...faithpathFixture(), supplementary: "Ω".repeat(800_000) }, null, 2);
  await choose(page, "FaithPath-Datei auswählen", "synthetic-v5.json", Buffer.from(source));
  await button(page, "Jetzt sichern und Import übernehmen").click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  const original = await localData(page);
  expect(original.imports[0]?.sourceText).toBe(source);
  await page.goto("/einstellungen");
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await button(page, "Sicherung erstellen").click();
  await button(page, "Sicherung mit Passwort schützen").click();
  await field(page, "Passwort für die Sicherung").fill(password);
  await field(page, "Passwort für die Sicherung bestätigen").fill(secret());
  await button(page, "Verschlüsselte Sicherung exportieren").click();
  await expect(page.getByText("Die beiden Passwörter stimmen nicht überein.")).toBeVisible();
  await field(page, "Passwort für die Sicherung bestätigen").fill(password);
  const download = page.waitForEvent("download");
  await button(page, "Verschlüsselte Sicherung exportieren").click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^oliva-sicherung-.*\.oliva$/);
  const bytes = await readFile((await file.path())!);
  await file.delete();
  expect(bytes.subarray(0, 8).toString()).toBe("OLIVAENC");
  expect(bytes.includes(Buffer.from(password))).toBe(false);
  expect(bytes.includes(Buffer.from(original.name))).toBe(false);
  expect(await localData(page)).toEqual(original);
  await setName(page, "Neuer synthetischer Stand");
  const before = await rawData(page);
  await button(page, "Sicherung wiederherstellen").click();
  await choose(page, "OLIVA-Sicherungsdatei auswählen", "renamed.json", bytes);
  await expect(button(page, "Daten durch diese Sicherung ersetzen")).toHaveCount(0);
  await field(page, "Passwort der Sicherungsdatei").fill(secret());
  await button(page, "Sicherung entschlüsseln und prüfen").click();
  await expect(page.getByText(/Passwort stimmt nicht oder die Sicherung ist beschädigt/)).toBeVisible();
  expect(await rawData(page)).toEqual(before);

  const corrupted = Buffer.from(bytes);
  corrupted[corrupted.length - 1] = corrupted[corrupted.length - 1]! ^ 1;
  await choose(page, "OLIVA-Sicherungsdatei auswählen", "damaged.oliva", corrupted);
  await field(page, "Passwort der Sicherungsdatei").fill(password);
  await button(page, "Sicherung entschlüsseln und prüfen").click();
  await expect(page.getByText(/Passwort stimmt nicht oder die Sicherung ist beschädigt/)).toBeVisible();
  expect(await rawData(page)).toEqual(before);

  async function preview() {
    await choose(page, "OLIVA-Sicherungsdatei auswählen", "valid.oliva", bytes);
    await field(page, "Passwort der Sicherungsdatei").fill(password);
    await button(page, "Sicherung entschlüsseln und prüfen").click();
    await expect(button(page, "Daten durch diese Sicherung ersetzen")).toBeVisible();
    expect(await rawData(page)).toEqual(before);
  }
  await preview();
  await button(page, "Abbrechen").click();
  await expect(button(page, "Daten durch diese Sicherung ersetzen")).toHaveCount(0);
  expect(await rawData(page)).toEqual(before);
  await preview();
  await button(page, "Daten durch diese Sicherung ersetzen").click();
  await expect(page.getByText("Die Sicherung wurde wiederhergestellt.")).toBeVisible();
  const restored = await localData(page);
  expect({ ...restored, revision: original.revision }).toEqual(original);
});

test("setup blocks direct navigation and main storage before unlock with real offline reload", async ({ page, context }) => {
  const password = secret();
  await page.goto("/einstellungen");
  await setName(page, "Person vor der Sperre");
  const before = await rawData(page);
  await button(page, "OLIVA mit Passwort schützen").click();
  await fillNewPassword(page, password);
  await button(page, "Weiter zum Wiederherstellungscode").click();
  const code = await captureCode(page);
  await field(page, "Wiederherstellungscode bestätigen").fill("FALSCH");
  await button(page, "Passwortschutz aktivieren").click();
  await expect(page.getByText("Bestätige den angezeigten Wiederherstellungscode.")).toBeVisible();
  await field(page, "Wiederherstellungscode bestätigen").fill(code);
  await button(page, "Passwortschutz aktivieren").click();
  await expect(button(page, "Jetzt sperren")).toBeVisible();
  expect(await rawData(page)).toEqual(before);
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  const direct = await context.newPage();
  await direct.addInitScript(() => {
    const names: string[] = [];
    Object.defineProperty(window, "olivaTestDatabaseNames", { value: names });
    const open = indexedDB.open.bind(indexedDB);
    indexedDB.open = (name, version) => { names.push(name); return open(name, version); };
  });
  await direct.goto("/sammlung?tab=Entwürfe");
  await expect(gate(direct)).toBeVisible();
  await expect(direct.getByTestId("oliva-unlocked-content")).toHaveCount(0);
  await expect(direct.getByRole("navigation")).toHaveCount(0);
  expect(await direct.evaluate(() => Reflect.get(window, "olivaTestDatabaseNames"))).toEqual(["oliva-access-v1"]);
  await field(direct, "App-Passwort").fill(secret());
  await button(direct, "Entsperren").click();
  await expect(direct.getByText("Das App-Passwort stimmt nicht.")).toBeVisible();
  await expect(direct.getByTestId("oliva-unlocked-content")).toHaveCount(0);
  await unlock(direct, password);
  await expect(direct).toHaveURL(/sammlung/);
  await expect(direct.getByRole("heading", { name: "Deine Sammlung.", exact: true })).toBeVisible();
  expect(await rawData(direct)).toEqual(before);
  await direct.reload();
  await expect(gate(direct)).toBeVisible();
  await expect(direct.getByTestId("oliva-unlocked-content")).toHaveCount(0);
});

test("activation and explicit lock revoke other browser windows; unlock belongs to one window", async ({ page, context }) => {
  const password = secret();
  await page.goto("/einstellungen");
  const other = await context.newPage();
  await other.goto("/sammlung");
  await expect(other.getByTestId("oliva-unlocked-content")).toBeVisible();
  await enable(page, password);
  await expect(gate(other)).toBeVisible();
  await unlock(other, password);
  await button(page, "Jetzt sperren").click();
  await expect(gate(page)).toBeVisible();
  await expect(gate(other)).toBeVisible();
  await unlock(page, password);
  await expect(gate(other)).toBeVisible();
});

test("auto lock uses the selected inactivity length and resets it with real input", async ({ page }) => {
  await page.clock.install();
  const password = secret();
  await page.goto("/einstellungen");
  await enable(page, password);
  await button(page, "1 Minute").click();
  await expect(button(page, "1 Minute")).toHaveAttribute("aria-pressed", "true");
  await page.clock.fastForward(50_000);
  await field(page, "Dein Vorname (freiwillig)").fill("Noch aktiv");
  await page.clock.fastForward(50_000);
  await expect(page.getByTestId("oliva-unlocked-content")).toBeVisible();
  await page.clock.fastForward(11_000);
  await expect(gate(page)).toBeVisible();
  await unlock(page, password);
});

test("password changes require the old password; a saved recovery code rotates without losing data", async ({ page }) => {
  const original = secret(), replacement = secret(), recovered = secret();
  await page.goto("/einstellungen");
  await setName(page, "Unveränderter Prüfstand");
  const before = await rawData(page);
  const code = await enable(page, original);
  await button(page, "App-Passwort ändern").click();
  await field(page, "Bisheriges App-Passwort").fill(secret());
  await fillNewPassword(page, replacement);
  await button(page, "App-Passwort speichern").click();
  await expect(page.getByText("Das bisherige App-Passwort stimmt nicht.")).toBeVisible();
  await field(page, "Bisheriges App-Passwort").fill(original);
  await button(page, "App-Passwort speichern").click();
  await expect(page.getByText("Das neue App-Passwort ist gespeichert.")).toBeVisible();
  await button(page, "Jetzt sperren").click();
  await unlock(page, replacement);
  await button(page, "Jetzt sperren").click();
  await button(page, "App-Passwort vergessen").click();
  await field(page, "Wiederherstellungscode").fill("FALSCH");
  await fillNewPassword(page, recovered);
  await button(page, "Weiter zum Wiederherstellungscode").click();
  await expect(page.getByText("Der Wiederherstellungscode stimmt nicht.")).toBeVisible();
  await field(page, "Wiederherstellungscode").fill(code);
  await button(page, "Weiter zum Wiederherstellungscode").click();
  const newCode = await captureCode(page);
  expect(newCode).not.toBe(code);
  await field(page, "Wiederherstellungscode bestätigen").fill(newCode);
  await button(page, "Neues App-Passwort speichern").click();
  await expect(button(page, "Jetzt sperren")).toBeVisible();
  expect(await rawData(page)).toEqual(before);
  await button(page, "Jetzt sperren").click();
  await button(page, "App-Passwort vergessen").click();
  await field(page, "Wiederherstellungscode").fill(code);
  await fillNewPassword(page, original);
  await button(page, "Weiter zum Wiederherstellungscode").click();
  await expect(page.getByText("Der Wiederherstellungscode stimmt nicht.")).toBeVisible();
  await button(page, "Abbrechen").click();
  await unlock(page, recovered);
  await button(page, "App-Passwortschutz ausschalten").click();
  await field(page, "Bisheriges App-Passwort").fill(recovered);
  await button(page, "Ausschalten bestätigen").click();
  await expect(button(page, "OLIVA mit Passwort schützen")).toBeVisible();
  await page.reload();
  await expect(button(page, "OLIVA mit Passwort schützen")).toBeVisible();
  expect(await rawData(page)).toEqual(before);
});

test("small screen, large text and keyboard keep the unlock view accessible", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/einstellungen");
  const password = secret();
  await enable(page, password);
  await button(page, "Jetzt sperren").click();
  await expect(gate(page)).toBeVisible();
  const main = page.getByRole("main");
  await main.evaluate((element) => {
    for (const node of element.querySelectorAll<HTMLElement>("input, [dir]")) {
      const computed = getComputedStyle(node);
      node.style.fontSize = (parseFloat(computed.fontSize) * 2) + "px";
      if (computed.lineHeight !== "normal") node.style.lineHeight = (parseFloat(computed.lineHeight) * 2) + "px";
    }
  });
  expect(await main.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  expect((await new AxeBuilder({ page }).include('[data-testid="oliva-access-gate"]').withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await field(page, "App-Passwort").focus();
  await expect(field(page, "App-Passwort")).toBeFocused();
  await expect(field(page, "App-Passwort")).toHaveAttribute("type", "password");
  await page.keyboard.insertText(password);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("oliva-unlocked-content")).toBeVisible();
});
