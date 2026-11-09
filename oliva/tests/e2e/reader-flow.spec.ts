import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import type { Reference, Verse } from "../../src/features/bible/repository";
import type { AppData } from "../../src/state/model";
import { localData } from "./persistence";

test.use({ screenshot: "only-on-failure" });
const evidence = process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/reader-flow";
// Read the licensed canonical fixture independently of the app's renderer and
// repository module (Node's JSON loader differs from Metro's browser loader).
const bible = JSON.parse(
  readFileSync(new URL("../../src/data/bible.json", import.meta.url), "utf8"),
) as Record<string, Record<string, Verse[]>>;
const getChapter = (book: string, chapter: number) =>
  bible[book]![String(chapter)]!;
const getPassage = (ref: Reference) =>
  getChapter(ref.book, ref.chapter).filter(
    (v) =>
      (ref.from === undefined || v.n >= ref.from) &&
      (ref.to === undefined || v.n <= ref.to),
  );
const visible = (page: Page, id: string) =>
  page.getByTestId(id).filter({ visible: true });
const flow = (page: Page) => visible(page, "reader-flow");
const verse = (page: Page, n: number) =>
  page.getByRole("button", { name: new RegExp(`^Vers ${n}:`) });

function progress(data: AppData) {
  return {
    readChapters: data.readChapters,
    readPassages: data.readPassages,
    readSteps: data.readSteps,
    completedSteps: data.completedSteps,
    growthStage: data.growthStage,
    retainedReviewGrowth: data.retainedReviewGrowth,
  };
}
async function ready(page: Page, book: string, chapter: number) {
  await expect(flow(page)).toHaveAttribute("data-renderer", "web-inline");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect
    .poll(async () => (await localData(page))?.reading)
    .toMatchObject({ book, chapter });
}
async function anchor(page: Page, n: number) {
  await expect
    .poll(async () => (await localData(page))?.readingPosition?.verse)
    .toBe(n);
}
async function atVerse(page: Page, n: number) {
  // Observe the real first text fragment; never scroll to imitate restoration.
  await expect
    .poll(async () =>
      verse(page, n).evaluate((node) => {
        const rect = Array.from(node.getClientRects()).find(
          (rect) => rect.width > 0 && rect.height > 0,
        );
        return !!rect && rect.top >= 0 && rect.top < 160;
      }),
    )
    .toBe(true);
}
async function exactText(container: Locator, canonical: Verse[]) {
  const actual = await container.locator("[data-verse]").evaluateAll((nodes) =>
    nodes.map((node) => ({
      n: Number(node.getAttribute("data-verse")),
      text: node.textContent,
    })),
  );
  expect(actual).toEqual(
    canonical.map((v) => ({ n: v.n, text: `${v.n} ${v.text}` })),
  );
  expect((await container.locator("p").allTextContents()).join(" ")).toBe(
    canonical.map((v) => `${v.n} ${v.text}`).join(" "),
  );
}
async function closeSettings(page: Page) {
  await page
    .getByRole("button", { name: "Leseeinstellungen schließen", exact: true })
    .click();
}
async function unchangedProgress(
  page: Page,
  before: ReturnType<typeof progress>,
) {
  expect(progress(await localData(page))).toEqual(before);
}
async function noOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page
        .getByRole("main")
        .evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    )
    .toBe(true);
  await expect
    .poll(() =>
      flow(page).evaluate((node) => node.scrollWidth <= node.clientWidth + 1),
    )
    .toBe(true);
}

test("echte Inlineabsätze erhalten jeden Johannesvers und umbrechen über Versgrenzen statt in Einzelblöcken", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/lesen/JHN?chapter=6");
  await ready(page, "JHN", 6);
  const before = progress(await localData(page)),
    canonical = getChapter("JHN", 6);
  await exactText(flow(page), canonical);
  const paragraphs = flow(page).locator('[data-testid^="flow-paragraph-"]');
  await expect(paragraphs).toHaveCount(Math.ceil(canonical.length / 5));
  for (const paragraph of await paragraphs.all()) {
    expect(await paragraph.locator("p").count()).toBe(1);
    const count = await paragraph.locator("[data-verse]").count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(5);
    expect(
      await paragraph
        .locator('[role="button"]')
        .first()
        .evaluate((node) => ({
          tag: node.tagName,
          display: getComputedStyle(node).display,
        })),
    ).toEqual({ tag: "SPAN", display: "inline" });
  }
  const sharedLines = await flow(page)
    .locator("[data-verse]")
    .evaluateAll((nodes) => {
      const rects = nodes.flatMap((node) =>
        Array.from(node.getClientRects())
          .filter((rect) => rect.width > 0 && rect.height > 0)
          .map((rect) => ({
            verse: Number(node.getAttribute("data-verse")),
            top: rect.top,
            paragraph: node
              .closest("p")
              ?.parentElement?.getAttribute("data-testid"),
          })),
      );
      return rects.flatMap((left, i) =>
        rects
          .slice(i + 1)
          .filter(
            (right) =>
              right.paragraph === left.paragraph &&
              right.verse !== left.verse &&
              Math.abs(left.top - right.top) <= 0.5,
          )
          .map((right) => ({
            first: left.verse,
            next: right.verse,
            top: left.top,
          })),
      );
    });
  expect(sharedLines.length).toBeGreaterThan(0);
  expect(
    await verse(page, 35).evaluate((node) => node.getClientRects().length),
  ).toBeGreaterThan(1);
  await unchangedProgress(page, before);
});

test("eine tatsächlich geteilte Psalmzeile speichert nach Scrollen ihren ersten sichtbaren Vers 119 und erfindet keinen Verssprung zu 120", async ({
  page,
}) => {
  await page.goto("/lesen/PSA?chapter=119");
  await ready(page, "PSA", 119);
  const before = progress(await localData(page));
  const rectangles = async () =>
    flow(page)
      .locator('[data-verse="119"], [data-verse="120"]')
      .evaluateAll((nodes) =>
        nodes.map((node) => ({
          verse: Number(node.getAttribute("data-verse")),
          rectangles: Array.from(node.getClientRects())
            .filter((rect) => rect.width > 0 && rect.height > 0)
            .map((rect) => ({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            })),
        })),
      );
  const initial = await rectangles(),
    prior = initial.find((v) => v.verse === 119)!,
    next = initial.find((v) => v.verse === 120)!;
  expect(prior.rectangles.length).toBeGreaterThan(0);
  expect(next.rectangles.length).toBeGreaterThan(0);
  expect(
    Math.abs(prior.rectangles.at(-1)!.top - next.rectangles[0]!.top),
  ).toBeLessThanOrEqual(0.5);
  // This is a real scroll, not the public verse-jump action and not a mocked
  // layout event. The continuing text of 119 shares 120's first actual line.
  await verse(page, 120).evaluate((node) =>
    node.scrollIntoView({ block: "start" }),
  );
  try {
    await atVerse(page, 120);
    await anchor(page, 119);
    await unchangedProgress(page, before);
  } finally {
    await mkdir(evidence, { recursive: true });
    await writeFile(
      `${evidence}/flow-shared-line-119-120.json`,
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          source_build_id: await page
            .locator('meta[name="oliva-build"]')
            .getAttribute("content"),
          source:
            "Actual DOM getClientRects, real scrollIntoView; no layout mocking or explicit verse query",
          initial,
          afterScroll: await rectangles(),
          readingPosition: (await localData(page)).readingPosition,
          progressBefore: before,
          progressAfter: progress(await localData(page)),
          physicalDeviceTest: false,
        },
        null,
        2,
      ) + "\n",
    );
    await page.screenshot({ path: `${evidence}/flow-shared-line-119-120.png` });
  }
});

test("ein ausdrücklicher Verslink bleibt nach breitem Reflow, größerer Schrift, Zeilenabstand und Neustart genau Johannes 6,35", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6&verse=35");
  await ready(page, "JHN", 6);
  await anchor(page, 35);
  await atVerse(page, 35);
  const before = progress(await localData(page));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await atVerse(page, 35);
  await anchor(page, 35);
  await page
    .getByRole("button", { name: "Leseeinstellungen", exact: true })
    .click();
  await page.getByRole("button", { name: "Größer", exact: true }).click();
  await page.getByRole("button", { name: "2,1", exact: true }).click();
  await closeSettings(page);
  await atVerse(page, 35);
  await anchor(page, 35);
  await page.reload();
  await ready(page, "JHN", 6);
  await atVerse(page, 35);
  await anchor(page, 35);
  await page.setViewportSize({ width: 320, height: 844 });
  await atVerse(page, 35);
  await anchor(page, 35);
  expect((await localData(page)).readingPosition?.ref).toEqual({
    book: "JHN",
    chapter: 6,
  });
  await unchangedProgress(page, before);
});

test("Tastaturauswahl, Merken und Inline-Markierung bewahren einen offenen Versnotizentwurf über Neustart ohne Leseabschluss", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6");
  await ready(page, "JHN", 6);
  const before = progress(await localData(page));
  const target = visible(page, "flow-verse-35");
  await target.focus();
  await target.press("Enter");
  await expect(target).toHaveAttribute("aria-pressed", "true");
  const panel = visible(page, "verse-actions-35");
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Merken", exact: true }).click();
  await expect
    .poll(async () => (await localData(page)).bookmarks)
    .toContain("JHN:6:35");
  await panel
    .getByRole("button", { name: "Oliv markieren", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).highlights["JHN:6:35"])
    .toBe("olive");
  await panel
    .getByRole("button", { name: "Versaktionen schließen", exact: true })
    .click();
  await expect(target).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(() =>
      target.evaluate((node) => getComputedStyle(node).backgroundColor),
    )
    .toBe("rgb(231, 236, 220)");
  await target.press(" ");
  await expect(target).toHaveAttribute("aria-pressed", "true");
  await panel
    .getByRole("button", { name: "Gold markieren", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).highlights["JHN:6:35"])
    .toBe("gold");
  await expect(target).toHaveAttribute("aria-label", /gemerkt.*markiert/);
  // A selected verse uses the selection wash, which does not prove that its
  // persisted mark is painted. Inspect the real gold fill after deselection.
  await panel
    .getByRole("button", { name: "Versaktionen schließen", exact: true })
    .click();
  await expect(target).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(() =>
      target.evaluate((node) => getComputedStyle(node).backgroundColor),
    )
    .toBe("rgb(244, 232, 204)");
  await target.press("Enter");
  const text =
    "  Mein offener Gedanke aus dem Fließtext.\nDie zweite Zeile bleibt.  ";
  await panel
    .getByRole("textbox", { name: "Notiz zu Vers 35", exact: true })
    .fill(text);
  await expect
    .poll(async () => {
      const draft = (await localData(page)).drafts.find(
        (d) =>
          d.type === "capture" &&
          d.values.source.type === "verse" &&
          d.values.source.ref.from === 35,
      );
      return draft?.type === "capture" ? draft.values.text : undefined;
    })
    .toBe(text);
  await page.goto("/bibel");
  await page.reload();
  await page.goto("/lesen/JHN?chapter=6");
  await ready(page, "JHN", 6);
  await page
    .getByRole("button", {
      name: "Notizentwurf zu Johannes 6,35 fortsetzen",
      exact: true,
    })
    .click();
  await expect(
    visible(page, "verse-actions-35").getByRole("textbox", {
      name: "Notiz zu Vers 35",
      exact: true,
    }),
  ).toHaveValue(text);
  const data = await localData(page),
    draft = data.drafts.find(
      (d) =>
        d.type === "capture" &&
        d.values.source.type === "verse" &&
        d.values.source.ref.from === 35,
    );
  expect(draft?.values).toMatchObject({
    text,
    source: {
      type: "verse",
      ref: { book: "JHN", chapter: 6, from: 35, to: 35 },
    },
  });
  expect(data.notes).toEqual([]);
  expect(data.bookmarks).toEqual(["JHN:6:35"]);
  expect(data.highlights["JHN:6:35"]).toBe("gold");
  await unchangedProgress(page, before);
});

test("Fließtext und Einzelverse behalten beim Umschalten denselben Versanker und denselben Notizquelltext", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6&verse=35");
  await ready(page, "JHN", 6);
  await anchor(page, 35);
  const before = progress(await localData(page)),
    settings = (await localData(page)).settings;
  const text =
    "Dieser Versentwurf gehört auch nach dem Darstellungswechsel zu Johannes 6,35.";
  await visible(page, "verse-actions-35")
    .getByRole("textbox", { name: "Notiz zu Vers 35", exact: true })
    .fill(text);
  await expect(
    page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  ).toBeVisible();
  for (const representation of ["Einzelverse", "Fließtext"] as const) {
    await page
      .getByRole("button", { name: "Leseeinstellungen", exact: true })
      .click();
    await page
      .getByRole("button", { name: representation, exact: true })
      .click();
    await closeSettings(page);
    if (representation === "Einzelverse") {
      await expect(visible(page, "reader-single-verses")).toBeVisible();
      await expect(flow(page)).toHaveCount(0);
    } else {
      await expect(flow(page)).toHaveAttribute("data-renderer", "web-inline");
      await exactText(flow(page), getChapter("JHN", 6));
    }
    await atVerse(page, 35);
    await anchor(page, 35);
    await expect(
      visible(page, "verse-actions-35").getByRole("textbox", {
        name: "Notiz zu Vers 35",
        exact: true,
      }),
    ).toHaveValue(text);
  }
  const data = await localData(page);
  expect(data.settings).toEqual(settings);
  expect(data.drafts).toHaveLength(1);
  expect(data.drafts[0]!.values).toMatchObject({
    source: {
      type: "verse",
      ref: { book: "JHN", chapter: 6, from: 35, to: 35 },
    },
    text,
  });
  await unchangedProgress(page, before);
});

test("der Fließtext bleibt bei großer Schrift auf 320 Pixeln in Hell und Dunkel sowie auf großem Display lesbar und zugänglich", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lesen/MRK?chapter=4&from=35&to=41&verse=38");
  await ready(page, "MRK", 4);
  await anchor(page, 38);
  const before = progress(await localData(page));
  await page
    .getByRole("button", { name: "Leseeinstellungen", exact: true })
    .click();
  for (let i = 0; i < 5; i++) {
    const fontSize = (await localData(page)).settings.fontSize;
    await page.getByRole("button", { name: "Größer", exact: true }).click();
    await expect
      .poll(async () => (await localData(page)).settings.fontSize)
      .toBe(fontSize + 2);
  }
  await page.getByRole("button", { name: "2,1", exact: true }).click();
  await closeSettings(page);
  await mkdir(`${evidence}/screens`, { recursive: true });
  for (const [width, theme] of [
    [320, "light"],
    [320, "dark"],
    [1440, "light"],
  ] as const) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    const themeButton = page.getByRole("button", {
      name:
        theme === "dark"
          ? "Dunklen Modus aktivieren"
          : "Hellen Modus aktivieren",
      exact: true,
    });
    if (await themeButton.count()) await themeButton.click();
    await expect
      .poll(async () => (await localData(page)).settings.theme)
      .toBe(theme);
    await exactText(
      flow(page),
      getPassage({ book: "MRK", chapter: 4, from: 35, to: 41 }),
    );
    await noOverflow(page);
    await visible(page, "flow-paragraph-35")
      .locator("p")
      .evaluate((node) => node.scrollIntoView({ block: "start" }));
    await page.screenshot({
      path: `${evidence}/screens/flow-${width}-${theme}-font30.png`,
    });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  expect((await localData(page)).settings.fontSize).toBe(30);
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  await unchangedProgress(page, before);
});

test("die erste Offlineöffnung und der Neustart zeigen exakt Davids acht Abschnittsverse und bestätigen ausschließlich diesen Abschnitt", async ({
  page,
  context,
}) => {
  await page.goto("/bibel");
  await expect(
    page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.goto("/lesen/1SA?chapter=17&from=38&to=45&mode=deep");
  await ready(page, "1SA", 17);
  const canonical = getPassage({ book: "1SA", chapter: 17, from: 38, to: 45 });
  expect(canonical).toHaveLength(8);
  await exactText(flow(page), canonical);
  await expect(flow(page).locator("[data-verse]")).toHaveCount(8);
  await expect(verse(page, 37)).toHaveCount(0);
  await expect(verse(page, 46)).toHaveCount(0);
  const before = progress(await localData(page));
  await page.reload();
  await ready(page, "1SA", 17);
  await exactText(flow(page), canonical);
  await unchangedProgress(page, before);
  await page
    .getByRole("button", {
      name: "Abschnitt als gelesen bestätigen",
      exact: true,
    })
    .click();
  await expect
    .poll(async () => (await localData(page)).readPassages)
    .toEqual(["1SA:17:38:45"]);
  expect((await localData(page)).readChapters).toEqual([]);
  await page
    .getByRole("button", { name: "Das ganze Kapitel lesen", exact: true })
    .click();
  await ready(page, "1SA", 17);
  await expect
    .poll(async () => (await localData(page)).reading)
    .toEqual({ book: "1SA", chapter: 17 });
  await exactText(flow(page), getChapter("1SA", 17));
  await expect(verse(page, 37)).toHaveCount(1);
  await expect(verse(page, 46)).toHaveCount(1);
  expect((await localData(page)).readChapters).toEqual([]);
  expect((await localData(page)).readPassages).toEqual(["1SA:17:38:45"]);
});
