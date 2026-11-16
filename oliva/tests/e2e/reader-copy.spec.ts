import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import type { AppData } from "../../src/state/model";
import type { Verse } from "../../src/features/bible/repository";
import { localData } from "./persistence";

test.use({
  screenshot: "only-on-failure",
  permissions: ["clipboard-read", "clipboard-write"],
});

const evidence =
  `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/reader-copy`;
// Independent licensed fixture: do not import the app's formatter or its Metro
// JSON loader into the Node test process.
const bible = JSON.parse(
  readFileSync(new URL("../../src/data/bible.json", import.meta.url), "utf8"),
) as Record<string, Record<string, Verse[]>>;
const literalVerses = [
  {
    n: 35,
    text: "Jesus aber sprach zu ihnen: Ich bin das Brot des Lebens. Wer zu mir kommt, den wird nicht hungern; und wer an mich glaubt, den wird nimmermehr dürsten.",
  },
  {
    n: 36,
    text: "Aber ich habe es euch gesagt, daß ihr mich gesehen habt, und glaubet doch nicht.",
  },
  {
    n: 37,
    text: "Alles, was mir mein Vater gibt, das kommt zu mir; und wer zu mir kommt, den werde ich nicht hinausstoßen.",
  },
] satisfies Verse[];
const singleCopy = [
  "Johannes 6,35",
  `35 ${literalVerses[0]!.text}`,
  "Lutherbibel 1912",
].join("\n");
const rangeCopy = {
  36: [
    "Johannes 6,35–36",
    `35 ${literalVerses[0]!.text}`,
    `36 ${literalVerses[1]!.text}`,
    "Lutherbibel 1912",
  ].join("\n"),
  37: [
    "Johannes 6,35–37",
    `35 ${literalVerses[0]!.text}`,
    `36 ${literalVerses[1]!.text}`,
    `37 ${literalVerses[2]!.text}`,
    "Lutherbibel 1912",
  ].join("\n"),
};
const visible = (page: Page, id: string) =>
  page.getByTestId(id).filter({ visible: true });
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true }).filter({ visible: true });
const flow = (page: Page) => visible(page, "reader-flow");
const verse = (page: Page, n: number) => visible(page, `flow-verse-${n}`);
const tools = (page: Page) =>
  page
    .getByRole("dialog", { name: "Auswahl verwenden", exact: true })
    .filter({ visible: true });

function allDurableFieldsExceptPosition(data: AppData) {
  // The existing position writer increments the envelope's global revision.
  // Every actual content, progress, setting, import, and source field remains.
  const { readingPosition: _position, revision: _revision, ...rest } = data;
  return rest;
}
async function ready(page: Page) {
  await expect(flow(page)).toHaveAttribute("data-renderer", "web-inline");
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect
    .poll(async () => (await localData(page))?.reading)
    .toEqual({ book: "JHN", chapter: 6 });
  expect(bible.JHN!["6"]!.filter((v) => v.n >= 35 && v.n <= 37)).toEqual(
    literalVerses,
  );
}
async function assertNoDurableContentChange(
  page: Page,
  before: ReturnType<typeof allDurableFieldsExceptPosition>,
) {
  expect(allDurableFieldsExceptPosition(await localData(page))).toEqual(before);
}
async function readClipboard(page: Page) {
  return page.evaluate(() => navigator.clipboard.readText());
}
async function seedClipboard(page: Page, text: string) {
  await page.evaluate((text) => navigator.clipboard.writeText(text), text);
  expect(await readClipboard(page)).toBe(text);
}
async function copyAndRead(page: Page, container: Locator, expected: string) {
  await container
    .getByRole("button", { name: "Bibeltext kopieren", exact: true })
    .click();
  await expect
    .poll(() => readClipboard(page))
    .toBe(expected);
  await expect(
    page.getByText("Bibeltext kopiert.", { exact: true }).filter({ visible: true }),
  ).toBeVisible();
  const actual = await readClipboard(page);
  expect(actual).not.toContain("\r");
  return actual;
}
async function openRange(page: Page) {
  await button(page, "Mehrere Verse auswählen").click();
  await verse(page, 36).click();
  await verse(page, 35).click();
  await expect(verse(page, 35)).toHaveAttribute("aria-pressed", "true");
  await expect(verse(page, 36)).toHaveAttribute("aria-pressed", "true");
  await expect(verse(page, 37)).toHaveAttribute("aria-pressed", "false");
  await button(page, "Auswahl verwenden").click();
  await expect(tools(page)).toBeVisible();
}
async function report(page: Page, name: string, result: object) {
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
          "Headless Chromium; real navigator.clipboard and real IndexedDB, with forced API rejection only in the fallback case",
        ...result,
      },
      null,
      2,
    ) + "\n",
  );
  await page.screenshot({ path: `${evidence}/${name}.png` });
}

test("ein einzelner Vers wird per echtem Browser-Clipboard unverändert mit LF und Übersetzungsname kopiert", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6");
  await ready(page);
  const before = allDurableFieldsExceptPosition(await localData(page));
  await seedClipboard(page, "OLIVA Clipboard: Einzelvers vorher");
  await verse(page, 35).focus();
  await verse(page, 35).press("Enter");
  const panel = visible(page, "verse-actions-35");
  await expect(panel).toBeVisible();
  const actual = await copyAndRead(page, panel, singleCopy);
  await expect(verse(page, 35)).toHaveAttribute("aria-pressed", "true");
  await expect(panel).toBeVisible();
  await assertNoDurableContentChange(page, before);
  await report(page, "single-verse-real-clipboard", {
    expected: singleCopy,
    actual,
    unchangedPersonalAndProgressData: true,
    selectionRetained: [35],
  });
});

test("additive Auswahl kopiert genau 35–36 und danach 35–37 ohne UI-Einordnung oder persönliche Daten", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6");
  await ready(page);
  const before = allDurableFieldsExceptPosition(await localData(page));
  await seedClipboard(page, "OLIVA Clipboard: Bereich vorher");
  await openRange(page);
  const first = await copyAndRead(page, tools(page), rangeCopy[36]);
  await tools(page)
    .getByRole("button", { name: "Auswahlwerkzeuge schließen", exact: true })
    .click();
  await verse(page, 37).click();
  await button(page, "Auswahl verwenden").click();
  const second = await copyAndRead(page, tools(page), rangeCopy[37]);
  for (const n of [35, 36, 37])
    await expect(verse(page, n)).toHaveAttribute("aria-pressed", "true");
  await expect(verse(page, 34)).toHaveAttribute("aria-pressed", "false");
  await expect(verse(page, 38)).toHaveAttribute("aria-pressed", "false");
  await assertNoDurableContentChange(page, before);
  await report(page, "ranges-real-clipboard", {
    exactCopies: [
      { expected: rangeCopy[36], actual: first },
      { expected: rangeCopy[37], actual: second },
    ],
    unchangedPersonalAndProgressData: true,
    selectionRetained: [35, 36, 37],
  });
});

test("eine abgelehnte Clipboard-API zeigt denselben schreibgeschützten Text ohne falsche Erfolgsmeldung", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6");
  await ready(page);
  const before = allDurableFieldsExceptPosition(await localData(page));
  const sentinel = "OLIVA Clipboard: Ablehnung bewahrt diesen Inhalt";
  await seedClipboard(page, sentinel);
  await openRange(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator.clipboard, "writeText", {
      configurable: true,
      value: async () => {
        throw new DOMException("Absichtlich abgelehnt", "NotAllowedError");
      },
    });
  });
  await tools(page)
    .getByRole("button", { name: "Bibeltext kopieren", exact: true })
    .click();
  const fallback = page
    .getByRole("textbox", {
      name: "Bibeltext zum manuellen Kopieren",
      exact: true,
    })
    .filter({ visible: true });
  await expect(fallback).toHaveValue(rangeCopy[36]);
  await expect(fallback).not.toBeEditable();
  await expect(fallback).toHaveJSProperty("readOnly", true);
  await expect(
    page.getByText("Bibeltext kopiert.", { exact: true }).filter({ visible: true }),
  ).toHaveCount(0);
  expect(await readClipboard(page)).toBe(sentinel);
  for (const n of [35, 36])
    await expect(verse(page, n)).toHaveAttribute("aria-pressed", "true");
  await assertNoDurableContentChange(page, before);
  await report(page, "clipboard-rejection-manual-fallback", {
    expected: rangeCopy[36],
    fallback: await fallback.inputValue(),
    readOnly: true,
    successClaimAbsent: true,
    clipboardSentinelRetained: true,
    unchangedPersonalAndProgressData: true,
    selectionRetained: [35, 36],
  });
});
