import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, readFileSync } from "node:fs";
import { localData, rawData } from "./persistence";

const topics = JSON.parse(readFileSync("src/data/life-topics.json", "utf8")).topics as any[];
const topic = (id: string) => topics.find((t) => t.sourceId === id)!;
const button = (page: Page, name: string | RegExp) => page.getByRole("button", { name, exact: typeof name === "string" }).filter({ visible: true });
const thought = (page: Page) => page.getByRole("textbox", { name: "Deine Reflexion (freiwillig)", exact: true }).filter({ visible: true });
async function open(page: Page, id: string, step = 0) {
  await page.goto(`/weg/faithpath-topic-${id}?step=${step}`);
  await expect(button(page, "Abschnitt lesen")).toBeVisible();
}
async function read(page: Page) {
  await button(page, "Abschnitt lesen").click();
  await expect(page.getByTestId("reader-flow")).toBeVisible();
  await button(page, "Abschnitt als gelesen bestätigen").click();
  await button(page, "Weiter zum Verstehen").click();
  await expect(thought(page)).toBeVisible();
}

test("alle 18 Originalthemen bleiben von den neun Wegen getrennt; reines Entdecken speichert keinen Fortschritt", async ({ page }) => {
  await page.goto("/wege");
  await button(page, "Themen").click();
  await expect(page.getByText("18 Themen", { exact: true })).toBeVisible();
  for (const t of topics) await expect(button(page, `${t.title}, ${t.steps.length} Bibelabschnitte`)).toHaveCount(1);
  await page.getByRole("textbox", { name: "Ein Thema finden", exact: true }).fill(" über forde rung ");
  await expect(page.getByText("1 Thema", { exact: true })).toBeVisible();
  await button(page, "Überforderung & Ruhe, 3 Bibelabschnitte").click();
  await expect(button(page, "Abschnitt lesen")).toBeVisible();
  await expect(button(page, "Ein freiwilliges Gebet")).toHaveCount(0);
  expect(await rawData(page)).toBeUndefined();
  await button(page, "Zurück zu den Themen").click();
  await button(page, "Zu den Wegen").click();
  await expect(button(page, /Ich bin neu im Glauben/)).toBeVisible();
  expect(await rawData(page)).toBeUndefined();
});

test("ein vollständiges Thema mit zwei Schritten bestätigt nur echte Leseaktionen und lässt Reflexion freiwillig", async ({ page }) => {
  await open(page, "wut");
  for (let i = 0; i < 2; i++) {
    await read(page);
    await expect(page.getByText(topic("wut").steps[i].explanation, { exact: true })).toBeVisible();
    await expect(button(page, "Ein freiwilliges Gebet")).toHaveCount(0);
    await button(page, "Ohne Reflexion abschließen").click();
    await expect.poll(async () => (await localData(page)).completedSteps.length).toBe(i + 1);
    if (i === 0) await button(page, "Zum nächsten Schritt").click();
  }
  await expect(page.getByText("Ein Thema ist entdeckt", { exact: true })).toBeVisible();
  const data = await localData(page);
  expect(data.version).toBe(11); expect(data.readChapters).toEqual([]);
  expect(data.readSteps).toEqual(["faithpath-topic-wut:0", "faithpath-topic-wut:1"]);
  expect(data.completedSteps).toEqual(data.readSteps); expect(data.notes).toEqual([]);
  // Guided reading uses its own exact step key and never double-counts the range.
  expect(data.readPassages).toEqual([]);
  expect(data.storyStudy.answers).toEqual({});
  await page.goto("/"); await expect(button(page, "Dein Thema fortsetzen")).toBeVisible();
  await button(page, "Dein Thema fortsetzen").click();
  await expect(page.getByText("Ein Thema ist entdeckt", { exact: true })).toBeVisible();
});

test("originaler Arbeitskontext und getrennte OLIVA-Einordnung bleiben im Entwurf und in der Sammlung erhalten", async ({ page }) => {
  await open(page, "arbeit");
  await button(page, "Abschnitt lesen").click();
  await expect(page.getByTestId("reader-flow")).toBeVisible();
  await expect(page).toHaveURL(/from=22/); await expect(page).toHaveURL(/to=24/);
  await button(page, "Tiefer verstehen").click();
  await expect(page.getByText("ORIGINALE FAITHPATH-EINORDNUNG · KEIN BIBELTEXT", { exact: true })).toBeVisible();
  await expect(page.getByText(/Diese Worte stehen in einer antiken Haustafel/)).toBeVisible();
  await expect(button(page, "Eine kleine Frage zum Text")).toHaveCount(0);
  await button(page, "Abschnitt als gelesen bestätigen").click();
  await button(page, "Weiter zum Verstehen").click();
  const text = "Meine Arbeit und die Würde anderer.\nEin noch unfertiger Gedanke.";
  await thought(page).fill(text);
  await expect.poll(async () => (await localData(page)).drafts.length).toBe(1);
  const draft = (await localData(page)).drafts[0]!;
  const source = (draft.values as any).source;
  expect(source.snapshot.title).toBe("Arbeit & Berufung · Kolosser 3,22–24");
  expect(source.snapshot.explanation).toContain(topic("arbeit").steps[0].explanation);
  expect(source.snapshot.explanation).toContain("Ergänzender OLIVA-Hinweis:");
  expect(source.snapshot.explanation).toContain("versklavte Menschen");
  expect((await localData(page)).completedSteps).toEqual([]);
  await page.goto("/sammlung?tab=Entw%C3%BCrfe");
  await button(page, /Entwurf fortsetzen:.*Arbeit & Berufung/).click();
  await expect(thought(page)).toHaveValue(text);
  await page.reload(); await expect(thought(page)).toHaveValue(text);
  await button(page, "Reflexion speichern & Schritt abschließen").click();
  await expect.poll(async () => (await localData(page)).notes.length).toBe(1);
  const note = (await localData(page)).notes[0]!;
  expect(note.captureSource).toEqual(source); expect(note.text).toBe(text);
  expect((await localData(page)).completedSteps).toEqual(["faithpath-topic-arbeit:0"]);
  await page.goto("/sammlung");
  await page.getByTestId(`collection-note-${note.id}`).click();
  await page.getByRole("textbox", { name: "Deine Worte", exact: true }).fill("Weitergedacht, ohne die Herkunft zu verändern.");
  await button(page, "Sammlung").click();
  await expect.poll(async () => (await localData(page)).notes[0]?.text).toBe("Weitergedacht, ohne die Herkunft zu verändern.");
  expect((await localData(page)).notes[0]?.captureSource).toEqual(source);
});

test("Wechsel von drei zu zwei Schritten bewahrt unterschiedliche Gedanken zur selben Bibelstelle", async ({ page }) => {
  await open(page, "streit", 2);
  await read(page); await thought(page).fill("Mein dritter Konfliktschritt.");
  await button(page, "Zurück zu den Themen").click();
  await button(page, "Wut, 2 Bibelabschnitte").click();
  await read(page); await thought(page).fill("Meine Wut beim Zuhören.");
  await button(page, "Zurück zu den Themen").click();
  await button(page, "Streit & Konflikte, 3 Bibelabschnitte").click();
  await read(page); await thought(page).fill("Mein erster Konfliktschritt beim Zuhören.");
  await expect.poll(async () => (await localData(page)).drafts.length).toBe(3);
  const drafts = (await localData(page)).drafts;
  const a = drafts.find((d) => d.key === "capture:guided:faithpath-topic-streit:0")!,
    b = drafts.find((d) => d.key === "capture:guided:faithpath-topic-wut:0")!;
  expect((a.values as any).source.snapshot.ref).toEqual((b.values as any).source.snapshot.ref);
  expect((a.values as any).source.snapshot.title).not.toBe((b.values as any).source.snapshot.title);
  await page.goto("/sammlung?tab=Entw%C3%BCrfe");
  await button(page, /Entwurf fortsetzen:.*Wut/).click();
  await expect(thought(page)).toHaveValue("Meine Wut beim Zuhören.");
  expect((await localData(page)).completedSteps).toEqual([]);
});

test("ein zuvor ungeöffnetes Thema funktioniert samt Reader und Wiederaufnahme vollständig offline", async ({ page, context }) => {
  await page.goto("/themen");
  await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await open(page, "geduld", 1); await read(page);
  await thought(page).fill("Wachsen braucht Zeit.");
  await expect.poll(async () => (await localData(page)).drafts.length).toBe(1);
  const before = await rawData(page);
  await page.reload(); await expect(thought(page)).toHaveValue("Wachsen braucht Zeit.");
  expect(await rawData(page)).toEqual(before);
  await context.setOffline(false);
});

test("Themenbibliothek und Leseschritt bleiben bei 320, 390 und 1440 Pixeln sowie in Dunkelansicht zugänglich", async ({ page }) => {
  const evidence = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/topics/screens`;
  mkdirSync(evidence, { recursive: true });
  for (const [width, theme] of [[320, "light"], [390, "dark"], [1440, "dark"]] as const) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/themen");
    await expect(page.getByText("18 Themen", { exact: true })).toBeVisible();
    const toggle = button(page, theme === "dark" ? "Dunklen Modus aktivieren" : "Hellen Modus aktivieren");
    if (await toggle.count()) await toggle.click();
    await expect(button(page, theme === "dark" ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren")).toBeVisible();
    for (const [name, route] of [["library", "/themen"], ["topic", "/weg/faithpath-topic-trauer"]]) {
      await page.goto(route!); await page.evaluate(() => document.fonts.ready.then(() => undefined));
      await expect(button(page, theme === "dark" ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren")).toBeVisible();
      if (name === "topic") {
        const readButton = button(page, "Abschnitt lesen");
        await readButton.focus(); await expect(readButton).toBeFocused();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      await page.screenshot({ path: `${evidence}/${name}-${width}-${theme}.png` });
    }
  }
});
