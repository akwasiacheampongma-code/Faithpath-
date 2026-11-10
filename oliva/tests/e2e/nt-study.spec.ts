import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { readFileSync } from "node:fs";
import type { NtChapter } from "../../src/features/quiz/catalog";
import { localData, rawData } from "./persistence";

// Playwright executes this file in Node, independently of Metro's JSON loader.
const source = JSON.parse(readFileSync(new URL("../../src/data/nt-catalog.json", import.meta.url), "utf8")) as { chapters: NtChapter[] };
const ntChapter = (book: string, number: number) => source.chapters.find((item) => item.book === book && item.chapter === number)!;
const answerKey = (question: NtChapter["questions"][number]) => `${question.id}:${question.hash}`;
const chapter = ntChapter("MRK", 4);
const screenshots = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/nt/screens`;
const visible = (page: Page, id: string) =>
  page.getByTestId(id).filter({ visible: true });
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true }).filter({ visible: true });
const radio = (page: Page, option: string) =>
  page
    .getByRole("radio", { name: option, exact: true })
    .filter({ visible: true });
async function ready(page: Page, index = 0) {
  await expect(visible(page, "nt-question-heading")).toHaveText(
    chapter.questions[index]!.prompt,
  );
}
function otherFields(data: Record<string, unknown>) {
  const { ntStudy, revision, ...other } = data;
  return other;
}

test("NT discovery covers all 27 books and opens original questions without creating personal records", async ({
  page,
}) => {
  await page.goto("/bibel");
  await button(page, "Fragen zum Neuen Testament").click();
  await expect(
    page.getByRole("heading", {
      name: "Lesen. Fragen. Verstehen.",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /: Kapitel auswählen$/ }),
  ).toHaveCount(27);
  await expect(
    page.getByRole("button", {
      name: "Genesis: Kapitel auswählen",
      exact: true,
    }),
  ).toHaveCount(0);
  expect(await rawData(page)).toBeUndefined();
  await button(page, "Mit Markus 4 beginnen").click();
  await ready(page);
  await expect(page.getByRole("radio").filter({ visible: true })).toHaveCount(
    4,
  );
  for (const option of chapter.questions[0]!.options)
    await expect(radio(page, option)).toBeVisible();
  expect(await rawData(page)).toBeUndefined();
  await radio(page, chapter.questions[0]!.options[2]!).check();
  expect(await rawData(page)).toBeUndefined();
  await expect(button(page, "Antwort prüfen")).toBeEnabled();
});

test("an incorrect answer saves the exact source, survives reload and can be changed without altering its original date", async ({
  page,
}) => {
  await page.goto("/verstehen/MRK?chapter=4");
  await ready(page);
  const q = chapter.questions[0]!,
    wrong = (q.correctIndex + 1) % 4;
  await radio(page, q.options[wrong]!).check();
  await button(page, "Antwort prüfen").click();
  await expect(button(page, "Antwort ändern")).toBeVisible();
  await expect(
    page.getByText("Schauen wir noch einmal in den Text.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(q.explanation, { exact: true })).toBeVisible();
  await expect(
    page.getByText("Redaktionelle FaithPath-Erklärung · kein Bibelzitat", {
      exact: true,
    }),
  ).toBeVisible();
  const before = await localData(page),
    first = before.ntStudy.answers[answerKey(q)]!;
  expect(first.question).toEqual(q);
  expect(first.choice).toBe(wrong);
  expect(first.revision).toBe(1);
  expect(before.readChapters).toEqual([]);
  expect(before.growthStage).toBe(0);
  await page.reload();
  await ready(page);
  await expect(radio(page, q.options[wrong]!)).toBeChecked();
  await button(page, "Antwort ändern").click();
  await radio(page, q.options[q.correctIndex]!).check();
  await button(page, "Antwort prüfen").click();
  await expect(
    page.getByText("Das passt zum Text.", { exact: true }),
  ).toBeVisible();
  const after = await localData(page),
    changed = after.ntStudy.answers[answerKey(q)]!;
  expect(changed.createdAt).toBe(first.createdAt);
  expect(changed.revision).toBe(2);
  expect(changed.updatedAt).toBeDefined();
  expect(changed.question).toEqual(first.question);
  expect(otherFields(after)).toEqual(otherFields(before));
});

test("all five viewed questions may finish with wrong answers, and resume the exact last question without reading or growth", async ({
  page,
}) => {
  await page.goto("/verstehen/MRK?chapter=4");
  await ready(page);
  for (let index = 0; index < 5; index++) {
    const q = chapter.questions[index]!;
    await ready(page, index);
    await radio(page, q.options[(q.correctIndex + 1) % 4]!).check();
    await button(page, "Antwort prüfen").click();
    await expect(button(page, "Antwort ändern")).toBeVisible();
    if (index < 4) await button(page, "Nächste Frage").click();
  }
  const before = await localData(page);
  expect(before.ntStudy.completions).toEqual({});
  await button(page, "Fragen abschließen").click();
  await expect(
    page.getByText("Alle fünf Fragen angesehen.", { exact: true }),
  ).toBeVisible();
  const after = await localData(page);
  expect(Object.values(after.ntStudy.completions)).toMatchObject([{ book: "MRK", chapter: 4, revision: 1 }]);
  expect(Object.keys(after.ntStudy.answers)).toHaveLength(5);
  expect(otherFields(after)).toEqual(otherFields(before));
  expect(after.readChapters).toEqual([]);
  expect(after.growthStage).toBe(0);
  const bytes = await rawData(page);
  await page.reload();
  await ready(page, 4);
  await expect(
    page.getByText("Alle fünf Fragen angesehen.", { exact: true }),
  ).toBeVisible();
  expect(await rawData(page)).toEqual(bytes);
});

test("skipping questions remembers position but cannot create a completion", async ({
  page,
}) => {
  await page.goto("/verstehen/MRK?chapter=4");
  await ready(page);
  for (let index = 0; index < 4; index++)
    await button(page, "Nächste Frage").click();
  await ready(page, 4);
  await expect(button(page, "Fragen abschließen")).toBeDisabled();
  const before = await localData(page);
  expect(before.ntStudy.position).toEqual({
    book: "MRK",
    chapter: 4,
    index: 4,
  });
  expect(before.ntStudy.answers).toEqual({});
  expect(before.ntStudy.completions).toEqual({});
  expect(before.growthStage).toBe(0);
  await page.reload();
  await ready(page, 4);
  await button(page, "Vorige Frage").click();
  await ready(page, 3);
  await expect(visible(page, "nt-question-heading")).toBeFocused();
});

test("a real second-tab conflict keeps the local choice until the saved answer is deliberately accepted", async ({ page, context }) => {
  await page.goto("/verstehen/MRK?chapter=4");
  await ready(page);
  const second = await context.newPage();
  await second.goto("/verstehen/MRK?chapter=4");
  await ready(second);
  const q = chapter.questions[0]!;
  await radio(page, q.options[0]!).check();
  await button(page, "Antwort prüfen").click();
  await expect(button(page, "Antwort ändern")).toBeVisible();
  const before = await rawData(page);
  await radio(second, q.options[2]!).check();
  await button(second, "Antwort prüfen").click();
  await expect(button(second, "Aktuellen Stand neu laden")).toBeVisible();
  await expect(radio(second, q.options[2]!)).toBeChecked();
  await expect(button(second, "Antwort ändern")).toHaveCount(0);
  expect(await rawData(second)).toEqual(before);
  await button(second, "Aktuellen Stand neu laden").click();
  await expect(button(second, "Gespeicherten Stand übernehmen")).toBeVisible();
  await expect(radio(second, q.options[2]!)).toBeChecked();
  expect(await rawData(second)).toEqual(before);
  await button(second, "Gespeicherten Stand übernehmen").click();
  await expect(radio(second, q.options[0]!)).toBeChecked();
  await expect(button(second, "Antwort ändern")).toBeVisible();
  expect(await rawData(second)).toEqual(before);
  await second.close();
});

test("a new NT chapter and the entire question bank work on first offline visit and after restart", async ({
  page,
  context,
}) => {
  await page.goto("/verstehen");
  await expect(
    page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await button(page, "Offenbarung: Kapitel auswählen").click();
  await button(page, "Offenbarung 22 entdecken").click();
  const last = ntChapter("REV", 22)!,
    q = last.questions[0]!;
  await expect(visible(page, "nt-question-heading")).toHaveText(q.prompt);
  await radio(page, q.options[0]!).check();
  await button(page, "Antwort prüfen").click();
  await expect(button(page, "Antwort ändern")).toBeVisible();
  const before = await rawData(page);
  await page.reload();
  await expect(visible(page, "nt-question-heading")).toHaveText(q.prompt);
  await expect(radio(page, q.options[0]!)).toBeChecked();
  expect(await rawData(page)).toEqual(before);
  await context.setOffline(false);
});

test("keyboard answers, small-screen light mode, large-screen dark mode and invalid routes stay accessible", async ({
  page,
}) => {
  await mkdir(screenshots, { recursive: true });
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/verstehen/MRK?chapter=4");
  await ready(page);
  const first = radio(page, chapter.questions[0]!.options[0]!);
  await first.focus();
  await page.keyboard.press("Space");
  await expect(first).toBeChecked();
  await page.keyboard.press("ArrowDown");
  await expect(radio(page, chapter.questions[0]!.options[1]!)).toBeChecked();
  expect(await rawData(page)).toBeUndefined();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `${screenshots}/question-light-320.png`,
    fullPage: true,
  });
  await page.goto("/einstellungen");
  await button(page, "Dunkel").click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/verstehen/MRK?chapter=4");
  await ready(page);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `${screenshots}/question-dark-1440.png`,
    fullPage: true,
  });
  await page.goto("/verstehen/GEN?chapter=1");
  await expect(
    page.getByRole("heading", {
      name: "Dieses NT-Kapitel ist nicht vorhanden.",
      exact: true,
    }),
  ).toBeVisible();
  await button(page, "Zur Fragenübersicht").click();
  await expect(
    page.getByRole("heading", {
      name: "Lesen. Fragen. Verstehen.",
      exact: true,
    }),
  ).toBeVisible();
});
