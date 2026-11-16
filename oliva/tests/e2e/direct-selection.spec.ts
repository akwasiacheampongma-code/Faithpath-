import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { localData } from "./persistence";

const bible = JSON.parse(readFileSync("src/data/bible.json", "utf8"));
const verse = (page: Page, n: number) =>
  page
    .getByRole("button", { name: new RegExp(`^Vers ${n}:`) })
    .filter({ visible: true });
const bar = (page: Page) =>
  page.getByRole("toolbar", { name: "Versauswahl", exact: true });
const dialog = (page: Page) =>
  page.getByRole("dialog").filter({ visible: true });
const progress = (data: any) => ({
  readChapters: data.readChapters,
  readPassages: data.readPassages,
  readSteps: data.readSteps,
  completedSteps: data.completedSteps,
  growthStage: data.growthStage,
  notes: data.notes,
  drafts: data.drafts,
  ntStudy: data.ntStudy,
});
async function ready(page: Page) {
  await page.goto("/lesen/JHN?chapter=6&from=35&to=37");
  await expect(page.getByTestId("reader-flow")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect
    .poll(async () => (await localData(page))?.readingPosition?.ref)
    .toMatchObject({ book: "JHN", chapter: 6 });
}
function copy(numbers: number[], label: string) {
  return [
    label,
    ...numbers.map(
      (n) => `${n} ${bible.JHN["6"].find((v: any) => v.n === n).text}`,
    ),
    "Lutherbibel 1912",
  ].join("\n");
}

test("direktes Antippen öffnet die kleine Leiste und verändert weder Textlayout noch persönliche Inhalte", async ({
  page,
}) => {
  await ready(page);
  const before = progress(await localData(page));
  await expect(bar(page)).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Mehrere Verse auswählen", exact: true }),
  ).toHaveCount(0);
  const y = await verse(page, 35).evaluate(
    (node) => node.getClientRects()[0]!.top,
  );
  await verse(page, 35).click();
  await expect(bar(page)).toBeVisible();
  await expect(bar(page)).toContainText("Johannes 6,35");
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.getByTestId("verse-actions-35")).toHaveCount(0);
  expect(
    Math.abs(
      (await verse(page, 35).evaluate(
        (node) => node.getClientRects()[0]!.top,
      )) - y,
    ),
  ).toBeLessThan(2);
  await verse(page, 36).click();
  await expect(bar(page)).toContainText("Johannes 6,35–36");
  await expect(verse(page, 35)).toHaveAttribute("aria-pressed", "true");
  await expect(verse(page, 36)).toHaveAttribute("aria-pressed", "true");
  await verse(page, 35).click();
  await expect(verse(page, 35)).toHaveAttribute("aria-pressed", "false");
  await expect(bar(page)).toContainText("Johannes 6,36");
  await bar(page)
    .getByRole("button", { name: "Auswahl aufheben", exact: true })
    .click();
  await expect(bar(page)).toHaveCount(0);
  expect(progress(await localData(page))).toEqual(before);
});

test("auch getrennte Verse lassen sich direkt kopieren, markieren und merken ohne Zwischenverse zu verändern", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await ready(page);
  const before = progress(await localData(page));
  await verse(page, 35).click();
  await verse(page, 37).click();
  await expect(bar(page)).toContainText("Johannes 6,35.37");
  await expect(
    bar(page).getByRole("button", { name: "Notiz", exact: true }),
  ).toBeDisabled();
  await bar(page)
    .getByRole("button", { name: "Bibeltext kopieren", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe(copy([35, 37], "Johannes 6,35.37"));
  await bar(page)
    .getByRole("button", { name: "Markieren", exact: true })
    .click();
  await bar(page)
    .getByRole("button", { name: "Terrakotta markieren", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).highlights)
    .toMatchObject({ "JHN:6:35": "terra", "JHN:6:37": "terra" });
  expect((await localData(page)).highlights["JHN:6:36"]).toBeUndefined();
  await bar(page).getByRole("button", { name: "Mehr", exact: true }).click();
  await expect(dialog(page).getByRole("textbox")).toHaveCount(0);
  await dialog(page)
    .getByRole("button", { name: "Merken", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).bookmarks)
    .toEqual(["JHN:6:35", "JHN:6:37"]);
  await dialog(page)
    .getByRole("button", { name: "Schließen", exact: true })
    .click();
  await verse(page, 36).click();
  await expect(
    bar(page).getByRole("button", { name: "Notiz", exact: true }),
  ).toBeEnabled();
  expect(progress(await localData(page))).toEqual(before);
});

test("Notizen öffnen erst auf Wunsch und bewahren getrennte Vers- und Bereichsentwürfe", async ({
  page,
}) => {
  await ready(page);
  await verse(page, 35).click();
  await verse(page, 36).click();
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await bar(page).getByRole("button", { name: "Notiz", exact: true }).click();
  const range = dialog(page).getByRole("textbox", {
    name: "Deine Notiz zu dieser Auswahl",
    exact: true,
  });
  await expect(range).toBeFocused();
  await range.fill("Ein Gedanke zu genau zwei Versen.");
  await expect
    .poll(async () =>
      (await localData(page)).drafts.some(
        (d) =>
          d.key === "capture:passage:JHN:6:35:36" &&
          d.type === "capture" &&
          d.values.text === "Ein Gedanke zu genau zwei Versen.",
      ),
    )
    .toBe(true);
  await dialog(page)
    .getByRole("button", { name: "Schließen", exact: true })
    .click();
  await verse(page, 36).click();
  await bar(page).getByRole("button", { name: "Notiz", exact: true }).click();
  const single = dialog(page).getByRole("textbox", {
    name: "Notiz zu Vers 35",
    exact: true,
  });
  await single.fill("Ein eigener Gedanke nur zum ersten Vers.");
  await expect
    .poll(
      async () =>
        (await localData(page)).drafts.filter((d) => d.type === "capture")
          .length,
    )
    .toBe(2);
  await dialog(page)
    .getByRole("button", { name: "Schließen", exact: true })
    .click();
  await page.reload();
  expect(
    (await localData(page)).drafts
      .filter((d) => d.type === "capture")
      .map((d) => d.key)
      .sort(),
  ).toEqual(["capture:passage:JHN:6:35:36", "capture:verse:JHN:6:35"].sort());
});

test("die Aktionsleiste bleibt schmal, dunkel und hell per Tastatur und Screenreader bedienbar", async ({
  page,
}, info) => {
  for (const [width, theme] of [
    [320, "light"],
    [390, "dark"],
    [1440, "dark"],
  ] as const) {
    await page.setViewportSize({ width, height: 844 });
    await ready(page);
    const toggle = page.getByRole("button", {
      name:
        theme === "dark"
          ? "Dunklen Modus aktivieren"
          : "Hellen Modus aktivieren",
      exact: true,
    });
    if (await toggle.count()) await toggle.click();
    await verse(page, 35).focus();
    await page.keyboard.press("Enter");
    await expect(bar(page)).toBeVisible();
    await expect(verse(page, 35)).toBeFocused();
    for (const name of [
      "Markieren",
      "Bibeltext kopieren",
      "Notiz",
      "Mehr",
      "Auswahl aufheben",
    ]) {
      const b = bar(page).getByRole("button", { name, exact: true });
      await expect(b).toBeInViewport({ ratio: 1 });
      expect((await b.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: info.outputPath(`direct-selection-${width}-${theme}.png`),
    });
    await page.keyboard.press("Escape");
    await expect(bar(page)).toHaveCount(0);
  }
});
