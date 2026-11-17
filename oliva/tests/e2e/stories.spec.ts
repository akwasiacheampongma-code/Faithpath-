import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, mkdirSync } from "node:fs";
import { localData, rawData } from "./persistence";
const units = JSON.parse(readFileSync("src/data/story-index.json", "utf8")).units;
const bank = JSON.parse(readFileSync("src/data/story-questions.json", "utf8")).questions;
const nativity = units.find((u: any) => u.id === "NS-0241")!;
const psalm = units.find((u: any) => u.id === "NS-0073")!;
const button = (p: Page, name: string) => p.getByRole("button", { name, exact: true }).filter({ visible: true });
const radio = (p: Page, name: string) => p.getByRole("radio", { name, exact: true }).filter({ visible: true });
const question = (p: Page) => p.getByTestId("story-question-heading").filter({ visible: true });
const thought = (p: Page) => p.getByRole("textbox", { name: "Dein eigener Gedanke · freiwillig", exact: true }).filter({ visible: true });
const key = (q: any) => q.id + ":" + q.hash;
async function open(p: Page, id = nativity.id, stage = "lesen", index?: number) {
  await p.goto(`/geschichte/${id}?stage=${stage}${index === undefined ? "" : "&index=" + index}`);
  await expect(p.getByRole("heading", { name: units.find((u: any) => u.id === id).title, exact: true }).filter({ visible: true })).toBeVisible();
}
function personal(data: any) { const { revision, storyStudy, ...other } = data; return other; }

test("436 Originaleinheiten sind auffindbar, standardmäßig gesamte Bibel und tatsächlich virtualisiert", async ({ page }) => {
  await page.goto("/bibel");
  await button(page, "Geschichten und Abschnitte entdecken").click();
  await expect(page.getByText("436 Abschnitte", { exact: true })).toBeVisible();
  const count = await page.locator('[data-testid^="story-row-"]').count();
  expect(count).toBeGreaterThan(0); expect(count).toBeLessThan(80);
  const scope = page.getByRole("combobox", { name: "Bibelbereich", exact: true });
  await expect(scope).toHaveValue("Alle");
  await scope.selectOption("NT");
  await expect(page.getByText("329 Abschnitte", { exact: true })).toBeVisible();
  await scope.selectOption("AT");
  await expect(page.getByText("107 Abschnitte", { exact: true })).toBeVisible();
  await scope.selectOption("Alle");
  await page.getByRole("textbox", { name: "Titel oder Bibelstelle", exact: true }).fill(psalm.title.split("").join(" "));
  await expect(page.getByTestId("story-row-" + psalm.id)).toBeVisible();
  await page.getByRole("textbox", { name: "Titel oder Bibelstelle", exact: true }).fill("");
  await button(page, "Mit Bild").click(); await expect(page.getByText("6 Abschnitte", { exact: true })).toBeVisible();
  await button(page, "Alle Abschnitte").click(); await button(page, "Nach Bibelbuch filtern").click();
  await button(page, "Judas").click(); await expect(page.getByText("1 Abschnitt", { exact: true })).toBeVisible();
  await expect(page.getByTestId("story-row-NS-0420")).toBeVisible();
  expect(await rawData(page)).toBeUndefined();
});

test("Originalantworten bleiben nach Neustart änderbar, ohne Lesen oder Baumwachstum auszulösen", async ({ page }) => {
  const q = bank[nativity.questions[0].id], wrong = (q.correctIndex + 1) % 4;
  await open(page, nativity.id, "verstehen"); await expect(question(page)).toHaveText(q.prompt);
  await radio(page, q.options[wrong]).check(); expect(await rawData(page)).toBeUndefined();
  await button(page, "Antwort ansehen").click(); await expect(button(page, "Antwort ändern")).toBeVisible();
  await expect(page.getByText("Schau noch einmal in den Text.", { exact: true })).toBeVisible();
  const before = await localData(page), first = before.storyStudy.answers[key(q)]!;
  expect(first.question).toEqual(q); expect(before.readChapters).toEqual([]); expect(before.growthStage).toBe(0);
  await page.reload(); await expect(radio(page, q.options[wrong])).toBeChecked();
  await button(page, "Antwort ändern").click(); await radio(page, q.options[q.correctIndex]).check();
  await button(page, "Antwort ansehen").click(); await expect(page.getByText("Ja, das steht im Text.", { exact: true })).toBeVisible();
  const after = await localData(page);
  expect(after.storyStudy.answers[key(q)]?.createdAt).toBe(first.createdAt);
  expect(after.storyStudy.answers[key(q)]?.revision).toBe(2);
  expect(personal(after)).toEqual(personal(before));
  await button(page, "Die Textstelle ansehen").click();
  await expect(button(page, "Im Reader nachlesen")).toBeVisible();
  await button(page, "Im Reader nachlesen").click(); await expect(page.getByTestId("reader-flow")).toBeVisible();
  await button(page, "Zurück").click(); await expect(question(page)).toHaveText(q.prompt);
});

test("auch die längste Einheit führt durch alle 31 Fragen und setzt genau am letzten Schritt fort", async ({ page }) => {
  const long = units.find((u: any) => u.id === "NS-0324");
  await open(page, long.id, "verstehen");
  for (let i = 0; i < 31; i++) {
    await expect(question(page)).toHaveText(bank[long.questions[i].id].prompt);
    if (i < 30) await button(page, "Frage überspringen").click();
  }
  let data = await localData(page);
  expect(data.storyStudy.position?.index).toBe(30); expect(data.storyStudy.answers).toEqual({});
  expect(Object.values(data.storyStudy.viewed)[0]?.seen).toHaveLength(30);
  await page.goto("/geschichten"); await button(page, "Abschnitt fortsetzen").click();
  await expect(question(page)).toHaveText(bank[long.questions[30].id].prompt);
  await button(page, "Zu deinem Gedanken").click(); await expect(thought(page)).toBeVisible();
  await button(page, "Diesen Moment abschließen").click();
  await expect(page.getByText("Ein Gedanke darf bleiben.", { exact: true })).toBeVisible();
  data = await localData(page);
  expect(Object.values(data.storyStudy.viewed)[0]?.seen).toHaveLength(31);
  expect(data.storyStudy.answers).toEqual({}); expect(data.notes).toEqual([]); expect(data.growthStage).toBe(0);
});

test("Reflexionsentwürfe führen über die Sammlung zur richtigen Einheit und bewahren die Originalquelle", async ({ page }) => {
  await open(page, psalm.id, "gedanken");
  const text = "Mein Gedanke zum Psalm.\nEr darf noch unfertig sein.";
  await thought(page).fill(text);
  await expect.poll(async () => (await localData(page))?.drafts.length).toBe(1);
  const draft = (await localData(page)).drafts[0]!;
  await page.goto("/sammlung?tab=Entw%C3%BCrfe");
  await button(page, "Entwurf fortsetzen: Reflexion: " + psalm.title).click();
  await expect(thought(page)).toHaveValue(text);
  await page.reload(); await expect(thought(page)).toHaveValue(text);
  await button(page, "Gedanken speichern").click();
  await expect.poll(async () => (await localData(page)).notes.length).toBe(1);
  const data = await localData(page), note = data.notes[0]!;
  expect(data.drafts).toEqual([]); expect(note.text).toBe(text); expect(note.kind).toBe("reflection");
  expect(note.captureSource).toEqual((draft.values as any).source); expect(note.ref).toEqual(psalm.references[0]);
  expect(data.readChapters).toEqual([]); expect(data.storyStudy.answers).toEqual({});
  await page.goto("/sammlung"); await expect(page.getByText("Original-Reflexionsimpuls: " + psalm.reflection, { exact: true })).toBeVisible();
  await button(page, "Bearbeiten").click();
  await page.getByRole("textbox", { name: "Deine Worte", exact: true }).fill("Weitergedacht und bewahrt.");
  await button(page, "Gedanken speichern").click();
  await expect.poll(async () => (await localData(page)).notes[0]?.text).toBe("Weitergedacht und bewahrt.");
  expect((await localData(page)).notes[0]?.captureSource).toEqual(note.captureSource);
});

test("Judas öffnet zwei exakte Lesebereiche; ein gefälschter Reflexionslink zeigt niemals den Editor", async ({ page }) => {
  await open(page, "NS-0420");
  const parts = page.getByRole("button", { name: /^Teil [12] lesen:/ }).filter({ visible: true });
  await expect(parts).toHaveCount(2);
  await parts.nth(0).click(); await expect(page.getByTestId("reader-flow")).toBeVisible();
  await expect(page).toHaveURL(/from=1/); await expect(page).toHaveURL(/to=4/);
  await page.reload(); await button(page, "Zurück").click(); await expect(parts).toHaveCount(2);
  await parts.nth(1).click(); await expect(page).toHaveURL(/from=17/); await expect(page).toHaveURL(/to=25/);
  await page.goto("/geschichte/NS-0420?stage=gedanken&draft=forged");
  await expect(page.getByRole("alert").filter({ visible: true }).last()).toBeVisible();
  await expect(thought(page)).toHaveCount(0);
});

test("ein echter Zwei-Fenster-Konflikt bewahrt die lokale Auswahl bis zur ausdrücklichen Übernahme", async ({ page, context }) => {
  const q = bank[nativity.questions[0].id];
  await open(page, nativity.id, "verstehen"); const second = await context.newPage();
  await open(second, nativity.id, "verstehen");
  await radio(page, q.options[0]).check(); await button(page, "Antwort ansehen").click();
  await expect(button(page, "Antwort ändern")).toBeVisible();
  const bytes = await rawData(page);
  await radio(second, q.options[2]).check(); await button(second, "Antwort ansehen").click();
  await expect(button(second, "Aktuellen Stand laden")).toBeVisible();
  await expect(radio(second, q.options[2])).toBeChecked(); expect(await rawData(second)).toEqual(bytes);
  await button(second, "Aktuellen Stand laden").click();
  await expect(button(second, "Gespeicherten Stand übernehmen")).toBeVisible();
  await expect(radio(second, q.options[2])).toBeChecked();
  await button(second, "Gespeicherten Stand übernehmen").click();
  await expect(radio(second, q.options[0])).toBeChecked(); expect(await rawData(second)).toEqual(bytes);
  await second.close();
});

test("ein noch nie geöffneter Abschnitt und die Originalfragen funktionieren beim Offline-Neustart", async ({ page, context }) => {
  await page.goto("/geschichten"); await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  await context.setOffline(true);
  await page.goto("/geschichte/NS-0435?stage=verstehen");
  const unit = units.find((u: any) => u.id === "NS-0435"), q = bank[unit.questions[0].id];
  await expect(question(page)).toHaveText(q.prompt); await radio(page, q.options[0]).check();
  await button(page, "Antwort ansehen").click(); await expect(button(page, "Antwort ändern")).toBeVisible();
  const bytes = await rawData(page); await page.reload(); await expect(radio(page, q.options[0])).toBeChecked();
  expect(await rawData(page)).toEqual(bytes); await context.setOffline(false);
});

test("bestätigte Ansichten bleiben auf kleinen Displays, in Dunkelansicht und per Tastatur barrierearm", async ({ page }) => {
  const screenshots = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/stories/screens`;
  mkdirSync(screenshots, { recursive: true });
  for (const [width, theme] of [[320, "light"], [390, "dark"], [1440, "dark"]] as const) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/geschichten");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const toggle = button(page, theme === "dark" ? "Dunklen Modus aktivieren" : "Hellen Modus aktivieren");
    if (await toggle.count()) {
      await toggle.click();
      await expect.poll(async () => (await localData(page))?.settings.theme).toBe(theme);
    }
    const actualThemeButton = theme === "dark" ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren";
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const [name, route] of [["library", "/geschichten"], ["illustrated", "/geschichte/NS-0241"], ["psalm", "/geschichte/NS-0073"], ["questions", "/geschichte/NS-0324?stage=verstehen&index=30"]]) {
      await page.goto(route!); await page.evaluate(() => document.fonts.ready.then(() => undefined));
      await expect(button(page, actualThemeButton)).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 }).filter({ visible: true })).toBeVisible();
      if (name === "psalm") { await expect(page.getByTestId("story-typographic-hero")).toBeVisible(); }
      if (name === "questions") {
        await expect(question(page)).toBeVisible();
        const option = page.getByRole("radio").filter({ visible: true }).first();
        await option.focus(); await page.keyboard.press("Space"); await expect(option).toBeChecked();
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
      await page.screenshot({ path: `${screenshots}/${name}-${width}-${theme}.png` });
    }
  }
});
