import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import type { Verse } from "../../src/features/bible/repository";
import type { AppData } from "../../src/state/model";
import { localData } from "./persistence";

test.use({ screenshot: "only-on-failure" });
const evidence =
  process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/reader-flow/focus";
// Read the canonical fixture independently of the app's browser renderer.
const bible = JSON.parse(
  readFileSync(new URL("../../src/data/bible.json", import.meta.url), "utf8"),
) as Record<string, Record<string, Verse[]>>;
const visible = (page: Page, id: string) =>
  page.getByTestId(id).filter({ visible: true });
const flow = (page: Page) => visible(page, "reader-flow");
const start = (page: Page) =>
  page.getByRole("button", { name: "Lesefokus starten", exact: true });
const exit = (page: Page) =>
  page.getByRole("button", { name: "Lesefokus beenden", exact: true });
const verse = (page: Page, n: number) => visible(page, `flow-verse-${n}`);

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
async function canonicalText(
  container: Locator,
  book: string,
  chapter: number,
) {
  const canonical = bible[book]![String(chapter)]!;
  expect(
    await container.locator("[data-verse]").evaluateAll((nodes) =>
      nodes.map((node) => ({
        n: Number(node.getAttribute("data-verse")),
        text: node.textContent,
      })),
    ),
  ).toEqual(canonical.map((v) => ({ n: v.n, text: `${v.n} ${v.text}` })));
  expect((await container.locator("p").allTextContents()).join(" ")).toBe(
    canonical.map((v) => `${v.n} ${v.text}`).join(" "),
  );
}
async function bottom(page: Page) {
  const main = page.getByRole("main");
  // RN Web replaces ScrollView's scrollTo with its { y } interface. Use the
  // real final verse's native DOM scrollIntoView, as in the reader-flow tests.
  await flow(page)
    .locator("[data-verse]")
    .last()
    .evaluate((node) => node.scrollIntoView({ block: "start" }));
  await expect
    .poll(() =>
      main.evaluate((node) => ({
        scrolled: node.scrollTop > 0,
        atBottom: node.scrollHeight - node.clientHeight - node.scrollTop < 2,
      })),
    )
    .toEqual({ scrolled: true, atBottom: true });
}
async function reachableExit(page: Page) {
  await expect(exit(page)).toBeInViewport({ ratio: 1 });
  expect(
    await exit(page).evaluate((node) => {
      const r = node.getBoundingClientRect();
      return {
        outsideMain: !node.closest('[role="main"]'),
        hit: node.contains(
          document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2),
        ),
      };
    }),
  ).toEqual({ outsideMain: true, hit: true });
}
async function report(page: Page, name: string, data: object) {
  await mkdir(evidence, { recursive: true });
  await writeFile(
    `${evidence}/${name}.json`,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        source_build_id: await page
          .locator('meta[name="oliva-build"]')
          .getAttribute("content"),
        physicalDeviceTest: false,
        method:
          "Headless Chromium, real DOM scrolling/focus and real IndexedDB; synthetic personal text",
        ...data,
      },
      null,
      2,
    ) + "\n",
  );
}

test("Lesefokus hält auf 320 Pixeln in Hell und Dunkel den kanonischen Text und einen erreichbaren Ausstieg ohne Leseabschluss", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/lesen/MRK?chapter=4&mode=deep");
  await ready(page, "MRK", 4);
  const before = progress(await localData(page));
  await expect(
    page.getByText("Was du zum Abschnitt wissen solltest", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Kapitel als gelesen bestätigen",
      exact: true,
    }),
  ).toBeVisible();
  const observations: object[] = [];
  await mkdir(`${evidence}/screens`, { recursive: true });
  for (const theme of ["light", "dark"] as const) {
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
    await start(page).click();
    await reachableExit(page);
    const toolbarBeforeScroll = await exit(page).boundingBox();
    await canonicalText(flow(page), "MRK", 4);
    for (const label of [
      "Lesefokus starten",
      "Leseeinstellungen",
      "Versaktionen",
      "Einfach lesen",
      "Tiefer verstehen",
      "Kapitel als gelesen bestätigen",
      "Vorheriges Kapitel",
      "Nächstes Kapitel",
    ]) {
      await expect(
        page.getByRole("button", { name: label, exact: true }),
      ).toHaveCount(0);
    }
    await expect(
      page.getByText("Was du zum Abschnitt wissen solltest", { exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText("KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT", {
        exact: true,
      }),
    ).toHaveCount(0);
    await expect(
      page.getByText("Ein Gedanke für dich", { exact: true }),
    ).toHaveCount(0);
    await bottom(page);
    await reachableExit(page);
    const toolbarAfterScroll = await exit(page).boundingBox();
    expect(toolbarAfterScroll).toEqual(toolbarBeforeScroll);
    expect(
      await page.getByRole("main").evaluate((node) => ({
        documentFits: document.documentElement.scrollWidth <= innerWidth + 1,
        mainFits: node.scrollWidth <= node.clientWidth + 1,
      })),
    ).toEqual({ documentFits: true, mainFits: true });
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(axe.violations).toEqual([]);
    await page.screenshot({
      path: `${evidence}/screens/focus-320-${theme}-bottom.png`,
    });
    observations.push({
      theme,
      toolbarBeforeScroll,
      toolbarAfterScroll,
      scroll: await page.getByRole("main").evaluate((node) => ({
        top: node.scrollTop,
        height: node.scrollHeight,
        viewport: node.clientHeight,
      })),
      axeViolations: axe.violations,
      exitMethod: theme === "light" ? "toolbar click" : "Escape",
    });
    if (theme === "light") await exit(page).click();
    else await page.keyboard.press("Escape");
    await expect(exit(page)).toHaveCount(0);
    await expect(start(page)).toBeFocused();
    await expect(
      page.getByRole("button", { name: "Tiefer verstehen", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", {
        name: "Kapitel als gelesen bestätigen",
        exact: true,
      }),
    ).toBeVisible();
    expect(progress(await localData(page))).toEqual(before);
  }
  await start(page).press("Enter");
  await expect(exit(page)).toBeVisible();
  await page.reload();
  await ready(page, "MRK", 4);
  await expect(exit(page)).toHaveCount(0);
  await expect(start(page)).toBeVisible();
  expect(progress(await localData(page))).toEqual(before);
  await report(page, "focus-toolbar-and-accessibility", {
    viewport: { width: 320, height: 844 },
    observations,
    focusPersistedAcrossReload: false,
    progressBefore: before,
    progressAfter: progress(await localData(page)),
  });
});

test("ein gerade getippter Versnotizentwurf überlebt das Unmount beim Fokusstart und bleibt mit derselben Quelle fortsetzbar", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6&verse=35");
  await ready(page, "JHN", 6);
  const before = progress(await localData(page));
  const text =
    "  Mein synthetischer Versgedanke.\nDie zweite Zeile bleibt erhalten.  ";
  const panel = visible(page, "verse-actions-35");
  await panel
    .getByRole("textbox", { name: "Notiz zu Vers 35", exact: true })
    .fill(text);
  // Enter immediately after typing, without waiting for the draft debounce.
  // This exercises the real editor's unmount flush through the public control.
  await start(page).press("Enter");
  await expect(exit(page)).toBeVisible();
  await expect(visible(page, "verse-actions-35")).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Notizentwurf zu Johannes 6,35 fortsetzen",
      exact: true,
    }),
  ).toHaveCount(0);
  const draft = async () => {
    const found = (await localData(page)).drafts.find(
      (d) =>
        d.type === "capture" &&
        d.values.source.type === "verse" &&
        d.values.source.ref.book === "JHN" &&
        d.values.source.ref.chapter === 6 &&
        d.values.source.ref.from === 35,
    );
    return found?.type === "capture" ? found : undefined;
  };
  await expect.poll(async () => (await draft())?.values.text).toBe(text);
  const savedDraft = await draft();
  expect(savedDraft?.values).toMatchObject({
    text,
    source: {
      type: "verse",
      ref: { book: "JHN", chapter: 6, from: 35, to: 35 },
    },
  });
  await page.keyboard.press("Escape");
  await expect(start(page)).toBeFocused();
  await page
    .getByRole("button", {
      name: "Notizentwurf zu Johannes 6,35 fortsetzen",
      exact: true,
    })
    .click();
  await expect(
    panel.getByRole("textbox", { name: "Notiz zu Vers 35", exact: true }),
  ).toHaveValue(text);
  await expect(
    panel.getByText("Dein Bibelbezug: Johannes 6,35 · Luther 1912", {
      exact: true,
    }),
  ).toBeVisible();
  expect((await draft())?.id).toBe(savedDraft?.id);
  await start(page).press("Enter");
  await expect(exit(page)).toBeVisible();
  await page.reload();
  await ready(page, "JHN", 6);
  await expect(exit(page)).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Notizentwurf zu Johannes 6,35 fortsetzen",
      exact: true,
    })
    .click();
  await expect(
    panel.getByRole("textbox", { name: "Notiz zu Vers 35", exact: true }),
  ).toHaveValue(text);
  const data = await localData(page);
  expect(data.drafts).toHaveLength(1);
  expect(data.notes).toEqual([]);
  expect(progress(data)).toEqual(before);
  await report(page, "focus-draft-unmount", {
    draft: await draft(),
    notes: data.notes,
    progressBefore: before,
    progressAfter: progress(data),
    resumedAfterFocusExitAndReload: true,
  });
});

test("Escape schließt Einstellungen und Verswahl vor Versaktionen und gibt den Tastaturfokus vor einer Navigation zurück", async ({
  page,
}) => {
  await page.goto("/bibel");
  await page.goto("/lesen/MRK?chapter=4&from=35&to=41&verse=38&mode=deep");
  await ready(page, "MRK", 4);
  await expect
    .poll(() => new URL(page.url()).searchParams.has("verse"))
    .toBe(false);
  const readerUrl = page.url(),
    before = progress(await localData(page)),
    target = verse(page, 38),
    panel = visible(page, "verse-actions-38"),
    settings = page.getByRole("button", {
      name: "Leseeinstellungen",
      exact: true,
    }),
    picker = page.getByRole("button", { name: "Versaktionen", exact: true });
  await expect(panel).toBeVisible();
  await settings.click();
  await expect(
    page.getByRole("button", {
      name: "Leseeinstellungen schließen",
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", {
      name: "Leseeinstellungen schließen",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(settings).toBeFocused();
  await expect(panel).toBeVisible();
  expect(page.url()).toBe(readerUrl);
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(target).toBeFocused();
  await expect(target).toHaveAttribute("aria-pressed", "false");
  expect(page.url()).toBe(readerUrl);
  await target.press("Enter");
  await expect(panel).toBeVisible();
  await picker.click();
  await expect(
    page.getByText("Welchen Vers möchtest du auswählen?", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByText("Welchen Vers möchtest du auswählen?", { exact: true }),
  ).toHaveCount(0);
  await expect(picker).toBeFocused();
  await expect(panel).toBeVisible();
  expect(page.url()).toBe(readerUrl);
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(target).toBeFocused();
  await page.keyboard.press("Escape");
  expect(page.url()).toBe(readerUrl);
  expect(progress(await localData(page))).toEqual(before);
  await report(page, "escape-dismiss-priority", {
    routeRetainedDuringDismissal: readerUrl,
    focusReturns: ["Leseeinstellungen", "Vers 38", "Versaktionen", "Vers 38"],
    progressBefore: before,
    progressAfter: progress(await localData(page)),
  });
  await page.getByRole("button", { name: "Zurück", exact: true }).click();
  await expect(page).toHaveURL(/\/bibel$/);
});
