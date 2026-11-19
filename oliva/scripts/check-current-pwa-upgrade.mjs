import { chromium, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import net from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { faithpathFixture } from "../tests/fixtures/faithpath-v5.ts";
import { localData } from "../tests/e2e/persistence.ts";

const [before, after, output, ...options] = process.argv.slice(2);
const accessCheck = options.includes("--check-password-protection");
const seedNotebook = options.includes("--seed-notebook");
if (!before || !after || !output || options.some((option) => !["--check-password-protection", "--seed-notebook"].includes(option)))
  throw new Error("Usage: node scripts/check-current-pwa-upgrade.mjs <before-dist> <after-dist> <report.json> [--check-password-protection] [--seed-notebook]");
const hash = (value) => createHash("sha256").update(value).digest("hex");
async function packageInfo(directory) {
  const html = await readFile(path.join(directory, "index.html"), "utf8");
  const sw = await readFile(path.join(directory, "sw.js"), "utf8");
  const build = html.match(/name="oliva-build" content="([^"]+)"/)?.[1];
  if (!build || !sw.startsWith(`const ID=${JSON.stringify(build)},URLS=`)) throw new Error("Incompatible build metadata");
  return { build, htmlSha256: hash(html), workerSha256: hash(sw) };
}
const baseline = await packageInfo(before);
const candidate = await packageInfo(after);
expect(candidate.build).not.toBe(baseline.build);
const temporary = await mkdtemp(path.join(tmpdir(), "oliva-stabilization-upgrade-"));
const live = path.join(temporary, "live");
await symlink(path.resolve(before), live);
const port = await new Promise((resolve) => {
  const socket = net.createServer();
  socket.listen(0, "127.0.0.1", () => {
    const { port } = socket.address();
    socket.close(() => resolve(port));
  });
});
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["scripts/serve.mjs", live], { env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
const report = { baseline, candidate, syntheticProfile: true, sameOrigin: true, physicalDeviceTest: false, steps: [], passed: false };
const source = JSON.stringify(faithpathFixture(), null, 2) + "\n";
const describe = (records) => records.map(([key, value]) => ({ key, sha256: hash(JSON.stringify(value)) }));

async function records(page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open("oliva-local-v1", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("state", "readonly");
      const store = tx.objectStore("state");
      const keys = store.getAllKeys();
      const data = store.getAll();
      tx.oncomplete = () => { db.close(); resolve(keys.result.map((key, i) => [key, data.result[i]])); };
      tx.onabort = () => { db.close(); reject(tx.error); };
    };
  }));
}

async function worker(page) {
  return page.evaluate(async () => {
    const controller = navigator.serviceWorker.controller;
    if (!controller) return null;
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); resolve(null); }, 1500);
      channel.port1.onmessage = (message) => { clearTimeout(timer); channel.port1.close(); resolve(message.data); };
      controller.postMessage({ type: "OLIVA_BUILD" }, [channel.port2]);
    });
  });
}

let browser;
let page;
const button = (name) => page.getByRole("button", { name, exact: true }).filter({ visible: true });
async function choose(label, name, text) {
  const pending = page.waitForEvent("filechooser");
  await button(label).click();
  await (await pending).setFiles({ name, mimeType: "application/json", buffer: Buffer.from(text) });
}
async function offlineReady(info) {
  await expect(page.locator('meta[name="oliva-build"]')).toHaveAttribute("content", info.build);
  await expect.poll(() => worker(page), { timeout: 30000 }).toMatchObject({ id: info.build });
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
}

try {
  await expect.poll(async () => { try { return (await fetch(origin)).ok; } catch { return false; } }).toBe(true);
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium", args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", acceptDownloads: true });
  page = await context.newPage();
  await page.goto(origin + "/einstellungen");
  await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Prüfprofil");
  await button("Namen speichern").click();
  await expect.poll(async () => (await localData(page))?.name).toBe("Prüfprofil");
  await button("Dunklen Modus aktivieren").click();
  await expect.poll(async () => (await localData(page))?.settings.theme).toBe("dark");
  await page.goto(origin + "/importieren");
  await choose("FaithPath-Datei auswählen", "synthetic-faithpath.json", source);
  await button("Jetzt sichern und Import übernehmen").click();
  await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();

  const nt = JSON.parse(await readFile("src/data/nt-catalog.json", "utf8"));
  const ntQuestion = nt.chapters.find((chapter) => chapter.book === "MAT" && chapter.chapter === 1).questions[0];
  await page.goto(origin + "/verstehen/MAT?chapter=1");
  await page.getByRole("radio", { name: ntQuestion.options[0], exact: true }).filter({ visible: true }).check();
  await button("Antwort prüfen").click();
  await expect(button("Antwort ändern")).toBeVisible();

  const storyIndex = JSON.parse(await readFile("src/data/story-index.json", "utf8"));
  const storyQuestions = JSON.parse(await readFile("src/data/story-questions.json", "utf8"));
  const story = storyIndex.units.find((unit) => unit.id === "NS-0241");
  const storyQuestion = storyQuestions.questions[story.questions[0].id];
  await page.goto(origin + "/geschichte/NS-0241?stage=verstehen");
  await page.getByRole("radio", { name: storyQuestion.options[0], exact: true }).filter({ visible: true }).check();
  await button("Antwort ansehen").click();
  await expect(button("Antwort ändern")).toBeVisible();

  await page.goto(origin + "/geschichte/NS-0073?stage=gedanken");
  await page.getByRole("textbox", { name: "Dein eigener Gedanke · freiwillig" }).fill("Ein synthetischer Psalmgedanke.");
  await button("Gedanken speichern").click();
  await expect.poll(async () => (await localData(page)).notes.some((note) => note.text === "Ein synthetischer Psalmgedanke.")).toBe(true);
  await page.goto(origin + "/sammlung");
  await button("Einen Gedanken festhalten").click();
  await page.getByRole("textbox", { name: "Deine Worte", exact: true }).fill("Der offene synthetische Entwurf.");
  await expect(page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true })).toBeVisible();

  await page.goto(origin + "/lesen/JHN?chapter=6&from=35&to=37");
  await page.getByRole("button", { name: /^Vers 35:/ }).filter({ visible: true }).click();
  await button("Markieren").click();
  await button("Terrakotta markieren").click();
  await button("Mehr").click();
  const dialog = page.getByRole("dialog").filter({ visible: true });
  await dialog.getByRole("button", { name: "Merken", exact: true }).click();
  await dialog.getByRole("button", { name: "Schließen", exact: true }).click();
  await expect.poll(async () => (await localData(page)).bookmarks).toContain("JHN:6:35");
  await page.goto(origin + "/lesen/JHN?chapter=6");
  await button("Kapitel als gelesen bestätigen").click();
  await expect(button("Als gelesen festgehalten")).toBeDisabled();
  if (seedNotebook) {
    await page.goto(origin + "/notizen");
    await button("Neue Notiz").click();
    await page.getByRole("textbox", { name: "Notiztext", exact: true }).fill("Synthetische V12-Notiz vor dem Paketwechsel.");
    await expect(page.getByText("Auf diesem Gerät gespeichert", { exact: true })).toBeVisible();
  }
  await page.goto(origin + "/einstellungen");
  await offlineReady(baseline);
  const data = await localData(page);
  expect(data.highlights["JHN:6:35"]).toBe("terra");
  expect(data.drafts.some((draft) => draft.values.text === "Der offene synthetische Entwurf.")).toBe(true);
  expect(data.readChapters).toContain("JHN:6");
  expect(data.growthStage).toBeGreaterThan(0);
  expect(Object.keys(data.ntStudy.answers)).toHaveLength(1);
  expect(Object.keys(data.storyStudy.answers)).toHaveLength(1);
  expect(data.goals).toHaveLength(1);
  expect(data.settings.theme).toBe("dark");
  expect(data.version).toBe(seedNotebook ? 12 : 11);
  report.profileVersion = data.version;
  expect(data.imports[0].sourceText).toBe(source);
  const original = await records(page);
  expect(original.find(([key]) => String(key).startsWith("archive:"))?.[1]).toBe(source);
  expect(original.some(([key]) => key === "before-faithpath-import")).toBe(true);
  report.steps.push({ step: "Seeded private baseline through the UI", raw: describe(original) });

  const next = path.join(temporary, "next");
  await symlink(path.resolve(after), next);
  await rename(next, live);
  await page.goto(origin + "/einstellungen");
  await offlineReady(candidate);
  expect(await records(page)).toStrictEqual(original);
  report.steps.push({ step: "New service worker active", raw: describe(await records(page)) });

  await page.close();
  await context.setOffline(true);
  page = await context.newPage();
  await page.goto(origin + "/bibel");
  await expect(page.getByRole("button", { name: /, \d+ Kapitel$/ })).toHaveCount(66);
  await page.goto(origin + "/garten");
  await button("Frühere FaithPath-Momente ansehen").click();
  await expect(page.getByTestId("archive-readable-history")).toBeVisible();
  await page.goto(origin + "/verstehen/MAT?chapter=1");
  await expect(page.getByRole("radio", { name: ntQuestion.options[0], exact: true }).filter({ visible: true })).toBeChecked();
  await page.goto(origin + "/geschichte/NS-0241?stage=verstehen");
  await expect(page.getByRole("radio", { name: storyQuestion.options[0], exact: true }).filter({ visible: true })).toBeChecked();
  if (seedNotebook) {
    await page.goto(origin + "/notizen");
    await page.getByRole("button", { name: /Synthetische V12-Notiz vor dem Paketwechsel/ }).click();
    await expect(page.getByRole("textbox", { name: "Notiztext", exact: true })).toHaveValue("Synthetische V12-Notiz vor dem Paketwechsel.");
  }
  expect(await records(page)).toStrictEqual(original);

  await page.goto(origin + "/einstellungen");
  const pending = page.waitForEvent("download");
  await expect(button("Sicherung erstellen").or(button("Sicherung exportieren"))).toBeVisible();
  if (await button("Sicherung erstellen").isVisible()) {
    await button("Sicherung erstellen").click();
    await button("Unverschlüsselte Sicherung").click();
    await button("Unverschlüsselt exportieren").click();
  } else await button("Sicherung exportieren").click();
  const download = await pending;
  const exported = await readFile(await download.path(), "utf8");
  expect(JSON.parse(exported)).toEqual(data);
  await download.delete();
  await button("Sicherung wiederherstellen").click();
  await choose("OLIVA-Sicherungsdatei auswählen", "synthetic-oliva.json", exported);
  await expect(button("Daten durch diese Sicherung ersetzen")).toBeVisible();
  expect(await records(page)).toStrictEqual(original);
  report.steps.push({ step: "Restart, archive, backup and read-only restore preview offline", raw: describe(await records(page)), exportSha256: hash(exported) });
  if (accessCheck) {
    const password = randomUUID();
    await button("Sicherung wiederherstellen").click();
    await button("OLIVA mit Passwort schützen").click();
    await page.getByLabel("Neues Passwort", { exact: true }).fill(password);
    await page.getByLabel("Neues Passwort bestätigen", { exact: true }).fill(password);
    await button("Weiter zum Wiederherstellungscode").click();
    const code = await page.getByTestId("oliva-recovery-code").innerText();
    await page.getByLabel("Wiederherstellungscode bestätigen", { exact: true }).fill(code);
    await button("Passwortschutz aktivieren").click();
    await expect(button("Jetzt sperren")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "OLIVA entsperren", exact: true })).toBeVisible();
    await expect(page.getByTestId("oliva-unlocked-content")).toHaveCount(0);
    await page.getByLabel("App-Passwort", { exact: true }).fill(password);
    await button("Entsperren").click();
    await expect(button("Jetzt sperren")).toBeVisible();
    expect(await records(page)).toStrictEqual(original);
    report.steps.push({ step: "Enable access protection after update, restart offline and unlock", raw: describe(await records(page)) });
  }
  expect(await packageInfo(before)).toEqual(baseline);
  expect(await packageInfo(after)).toEqual(candidate);
  report.passed = true;
} catch (error) {
  report.failure = String(error.stack ?? error);
  process.exitCode = 1;
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await rm(temporary, { recursive: true, force: true });
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ passed: report.passed, steps: report.steps.length, failure: report.failure }));
}
