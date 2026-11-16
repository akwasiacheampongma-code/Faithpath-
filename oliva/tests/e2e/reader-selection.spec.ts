import {
  selectionBar,
  noteDialog,
  openNote,
  closeNote,
  markSelection,
  bookmarkSelection,
} from "./selection-ui";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import type { AppData } from "../../src/state/model";
import type { Verse } from "../../src/features/bible/repository";
import { localData } from "./persistence";

test.use({ screenshot: "only-on-failure" });
const evidence = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/reader-selection`;
// Read the licensed fixture independently of the renderer and selection model.
const bible = JSON.parse(
  readFileSync(new URL("../../src/data/bible.json", import.meta.url), "utf8"),
) as Record<string, Record<string, Verse[]>>;
const fullChapter = bible.JHN!["6"]!;
const partialRef = { book: "JHN", chapter: 6, from: 35, to: 37 };
const visible = (page: Page, id: string) =>
  page.getByTestId(id).filter({ visible: true });
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true }).filter({ visible: true });
const verse = (page: Page, n: number) =>
  page
    .getByRole("button", { name: new RegExp(`^Vers ${n}:`) })
    .filter({ visible: true });
const tools = (page: Page) =>
  page
    .getByRole("dialog", { name: "Deine Notiz", exact: true })
    .filter({ visible: true });
const noteField = (page: Page) =>
  tools(page).getByRole("textbox", {
    name: "Deine Notiz zu dieser Auswahl",
    exact: true,
  });

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
function durableContent(data: AppData) {
  // A genuine scroll may update its anchor and global storage revision.
  const { readingPosition: _position, revision: _revision, ...rest } = data;
  return rest;
}
function rangeDraft(data: AppData, to: number) {
  const found = data.drafts.find(
    (draft) => draft.key === `capture:passage:JHN:6:35:${to}`,
  );
  if (!found || found.type !== "capture")
    throw new Error(`Missing durable JHN 6,35–${to} capture draft`);
  return found;
}
async function ready(page: Page) {
  await expect(visible(page, "reader-flow")).toHaveAttribute(
    "data-renderer",
    "web-inline",
  );
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect
    .poll(async () => (await localData(page))?.reading)
    .toMatchObject({ book: "JHN", chapter: 6 });
}
async function exactWholeChapter(page: Page) {
  expect(fullChapter).toHaveLength(71);
  const actual = await visible(page, "reader-flow")
    .locator("[data-verse]")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        n: Number(node.getAttribute("data-verse")),
        text: node.textContent,
      })),
    );
  expect(actual).toEqual(
    fullChapter.map((entry) => ({
      n: entry.n,
      text: `${entry.n} ${entry.text}`,
    })),
  );
}
async function selected(page: Page, numbers: number[]) {
  const expected = [...numbers].sort((a, b) => a - b);
  // Test IDs remain inspectable while the real modal hides background roles.
  const actual = await visible(page, "reader-flow")
    .locator('[data-verse][aria-pressed="true"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => Number(node.getAttribute("data-verse"))),
    );
  expect(actual).toEqual(expected);
}
async function openTools(page: Page) {
  await button(page, "Notiz").click();
  await expect(tools(page)).toBeVisible();
}
async function closeTools(page: Page) {
  await tools(page)
    .getByRole("button", { name: "Schließen", exact: true })
    .click();
  await expect(tools(page)).toHaveCount(0);
}
async function anchor(page: Page, expected: number) {
  await expect
    .poll(async () => (await localData(page))?.readingPosition?.verse)
    .toBe(expected);
}
async function anchorVisible(page: Page, n: number) {
  // Observe restored DOM fragments; never scroll to imitate restoration.
  await expect
    .poll(() =>
      verse(page, n).evaluate((node) => {
        const first = Array.from(node.getClientRects()).find(
          (rect) => rect.width > 0 && rect.height > 0,
        );
        return !!first && first.top >= 0 && first.top < 160;
      }),
    )
    .toBe(true);
}
async function report(page: Page, name: string, details: object) {
  await mkdir(evidence, { recursive: true });
  await writeFile(
    `${evidence}/${name}.json`,
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        source_build_id: await page
          .locator('meta[name="oliva-build"]')
          .getAttribute("content"),
        method: "Headless Chromium, real DOM, keyboard and IndexedDB",
        physicalDeviceTest: false,
        ...details,
      },
      null,
      2,
    ) + "\n",
  );
  await page.screenshot({ path: `${evidence}/${name}.png` });
}

test("ein Teilabschnitt zeigt alle 71 kanonischen Verse, bestätigt aber erst nach ausdrücklichem Scopewechsel das ganze Kapitel", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6&from=35&to=37");
  await ready(page);
  const before = progress(await localData(page));
  await exactWholeChapter(page);
  for (const n of [35, 36, 37])
    await expect(verse(page, n)).toHaveAccessibleName(/ · im Fokus$/);
  for (const n of [1, 34, 38, 71])
    await expect(verse(page, n)).not.toHaveAccessibleName(/ · im Fokus$/);
  await expect(button(page, "Kapitel als gelesen bestätigen")).toHaveCount(0);
  expect(progress(await localData(page))).toEqual(before);

  await button(page, "Zum Abschnittsanfang").click();
  await expect(verse(page, 35)).toBeFocused();
  await anchor(page, 35);

  await button(page, "Abschnitt als gelesen bestätigen").click();
  await expect
    .poll(async () => (await localData(page)).readPassages)
    .toEqual([...before.readPassages, "JHN:6:35:37"]);
  const partial = await localData(page);
  expect(partial.readChapters).toEqual(before.readChapters);
  expect(partial.readSteps).toEqual(before.readSteps);
  expect(partial.completedSteps).toEqual(before.completedSteps);

  await button(page, "Ganzes Kapitel als Lesebereich öffnen").click();
  await expect
    .poll(() => new URL(page.url()).searchParams.has("from"))
    .toBe(false);
  expect(new URL(page.url()).searchParams.has("to")).toBe(false);
  await exactWholeChapter(page);
  await expect(verse(page, 35)).not.toHaveAccessibleName(/ · im Fokus$/);
  expect((await localData(page)).readChapters).toEqual(before.readChapters);
  await button(page, "Kapitel als gelesen bestätigen").click();
  await expect
    .poll(async () => (await localData(page)).readChapters)
    .toEqual([...before.readChapters, "JHN:6"]);
  expect((await localData(page)).readPassages).toEqual(partial.readPassages);
  await report(page, "whole-context-explicit-completion-scope", {
    exactDisplayedVerses: 71,
    originalFocus: partialRef,
    partialOnlyReadPassage: partial.readPassages,
    afterExplicitChapterConfirmation: (await localData(page)).readChapters,
    noAutomaticChapterCompletion: true,
  });
});

test("eine additive Lücke bleibt sichtbar und schreibt nichts; erst 35–37 erhalten gemeinsam Farbe, Merken und eine exakt zugeordnete Notiz", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6");
  await ready(page);
  const initial = await localData(page),
    before = durableContent(initial),
    beforeProgress = progress(initial);
  await verse(page, 35).click();
  await verse(page, 37).click();
  await selected(page, [35, 37]);
  await expect(verse(page, 36)).toHaveAttribute("aria-pressed", "false");
  await expect(
    selectionBar(page).getByRole("button", { name: "Notiz", exact: true }),
  ).toBeDisabled();
  await expect(
    selectionBar(page).getByRole("button", {
      name: "Bibeltext kopieren",
      exact: true,
    }),
  ).toBeEnabled();
  await expect(noteField(page)).toHaveCount(0);
  expect(durableContent(await localData(page))).toEqual(before);

  await verse(page, 36).click();
  await selected(page, [35, 36, 37]);
  await markSelection(page, "Terrakotta");
  const expectedHighlights = {
    ...initial.highlights,
    "JHN:6:35": "terra",
    "JHN:6:36": "terra",
    "JHN:6:37": "terra",
  };
  await expect
    .poll(async () => (await localData(page)).highlights)
    .toEqual(expectedHighlights);
  await bookmarkSelection(page);
  await expect
    .poll(async () => [...(await localData(page)).bookmarks].sort())
    .toEqual(
      [
        ...new Set([...initial.bookmarks, "JHN:6:35", "JHN:6:36", "JHN:6:37"]),
      ].sort(),
    );
  const text = "Diese Worte gehören genau zu Johannes 6,35–37.";
  await openTools(page);
  await noteField(page).fill(text);
  await tools(page)
    .getByRole("button", { name: "Notiz speichern", exact: true })
    .click();
  await expect
    .poll(async () =>
      (await localData(page)).notes.find((note) => note.text === text),
    )
    .toMatchObject({
      kind: "note",
      ref: partialRef,
      captureSource: { type: "passage", ref: partialRef },
    });
  const after = await localData(page),
    created = after.notes.find((note) => note.text === text)!;
  expect(created.origin).toBeUndefined();
  expect(after.notes.filter((note) => note.text !== text)).toEqual(
    initial.notes,
  );
  expect(progress(after)).toEqual(beforeProgress);
  expect(after.highlights).toEqual(expectedHighlights);
  await selected(page, [35, 36, 37]);
  await closeTools(page);
  await expect(verse(page, 36)).toBeFocused();
  await report(page, "gap-guard-exact-range-actions", {
    gapSelection: [35, 37],
    noAutomaticGapFill: true,
    gapDidNotWriteContent: true,
    exactMarkedAndBookmarkedVerses: [35, 36, 37],
    savedNote: created,
    unchangedProgress: beforeProgress,
    focusReturnedToLastAddedVerse: 36,
  });
});

test("35–36 und 35–37 bewahren getrennte Entwürfe; die Sammlung stellt den tatsächlichen Entwurf und anschließend den gespeicherten vollständigen Bereich wieder her", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6");
  await ready(page);
  const beforeProgress = progress(await localData(page)),
    firstText = "Mein erster Entwurf gehört zu 35 bis 36.",
    secondText = "Mein anderer Entwurf gehört zu 35 bis 37.";
  await verse(page, 35).click();
  await verse(page, 36).click();
  await openTools(page);
  await noteField(page).fill(firstText);
  await expect
    .poll(async () =>
      (await localData(page)).drafts.find(
        (d) => d.key === "capture:passage:JHN:6:35:36",
      ),
    )
    .toMatchObject({ values: { text: firstText } });
  const first = rangeDraft(await localData(page), 36);
  await closeTools(page);
  await verse(page, 37).click();
  await openTools(page);
  await expect(noteField(page)).toHaveValue("");
  await noteField(page).fill(secondText);
  await expect
    .poll(async () =>
      (await localData(page)).drafts.find(
        (d) => d.key === "capture:passage:JHN:6:35:37",
      ),
    )
    .toMatchObject({ values: { text: secondText } });
  const second = rangeDraft(await localData(page), 37);
  expect(second.id).not.toBe(first.id);
  expect(rangeDraft(await localData(page), 36)).toEqual(first);
  expect((await localData(page)).notes).toEqual([]);
  await closeTools(page);

  // A real draft ID cannot be rebound by a stale or edited route's end verse.
  await page.goto(
    `/lesen/JHN?chapter=6&from=35&to=37&draft=${encodeURIComponent(first.id)}`,
  );
  await ready(page);
  await expect(
    page.getByText(
      "Entwurf und Bibelabschnitt passen nicht zusammen. Öffne den Entwurf erneut über die Sammlung.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(tools(page)).toHaveCount(0);
  expect(rangeDraft(await localData(page), 36)).toEqual(first);
  expect(rangeDraft(await localData(page), 37)).toEqual(second);

  // A real new document load proves durable recovery, not retained component state.
  await page.goto("/sammlung?tab=Entw%C3%BCrfe");
  await button(page, "Entwurf fortsetzen: Notiz zu Johannes 6,35–36").click();
  await ready(page);
  await expect(tools(page)).toBeVisible();
  await expect(noteField(page)).toHaveValue(firstText);
  await selected(page, [35, 36]);
  expect(new URL(page.url()).searchParams.get("from")).toBe("35");
  expect(new URL(page.url()).searchParams.get("to")).toBe("36");
  expect(rangeDraft(await localData(page), 37)).toEqual(second);
  await tools(page)
    .getByRole("button", { name: "Notiz speichern", exact: true })
    .click();
  await expect
    .poll(async () =>
      (await localData(page)).notes.find((note) => note.text === firstText),
    )
    .toMatchObject({
      kind: "note",
      ref: { book: "JHN", chapter: 6, from: 35, to: 36 },
      captureSource: {
        type: "passage",
        ref: { book: "JHN", chapter: 6, from: 35, to: 36 },
      },
    });
  expect(
    (await localData(page)).drafts.some((draft) => draft.id === first.id),
  ).toBe(false);
  expect(rangeDraft(await localData(page), 37)).toEqual(second);
  await closeTools(page);
  await page.goto("/sammlung");
  await button(page, "Johannes 6,35–36").click();
  await ready(page);
  await selected(page, [35, 36]);
  await expect(tools(page)).toHaveCount(0);
  expect(new URL(page.url()).searchParams.get("from")).toBe("35");
  expect(new URL(page.url()).searchParams.get("to")).toBe("36");
  const after = await localData(page);
  expect(after.notes).toHaveLength(1);
  expect(rangeDraft(after, 37)).toEqual(second);
  expect(progress(after)).toEqual(beforeProgress);
  await report(page, "range-drafts-and-collection-recovery", {
    firstDraftId: first.id,
    secondDraftId: second.id,
    independentKeys: [first.key, second.key],
    mismatchedDraftRouteRejectedWithoutRebinding: true,
    firstSavedWithFullReference: after.notes[0],
    secondDraftUnchanged: true,
    savedRangeReopenedAsSelection: [35, 36],
    unchangedProgress: beforeProgress,
  });
});

test("ein echter Verslink außerhalb des Teilabschnitts bleibt nach Reflow und Neustart Vers 60, ohne den logischen Lesebereich zu erweitern", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6&from=35&to=37&verse=60");
  await ready(page);
  await anchor(page, 60);
  await anchorVisible(page, 60);
  await page.keyboard.press("Escape");
  await anchor(page, 60);
  const beforeProgress = progress(await localData(page));
  await expect
    .poll(() => new URL(page.url()).searchParams.has("verse"))
    .toBe(false);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await anchorVisible(page, 60);
  await anchor(page, 60);
  await page.reload();
  await ready(page);
  await anchorVisible(page, 60);
  await anchor(page, 60);
  await page.setViewportSize({ width: 320, height: 844 });
  await anchorVisible(page, 60);
  await anchor(page, 60);
  expect((await localData(page)).readingPosition?.ref).toEqual(partialRef);
  await expect(button(page, "Abschnitt als gelesen bestätigen")).toBeEnabled();
  await expect(button(page, "Kapitel als gelesen bestätigen")).toHaveCount(0);
  expect(progress(await localData(page))).toEqual(beforeProgress);
  await report(page, "outside-focus-anchor-reflow-reload", {
    initialSource: "Explicit canonical verse=60 link; consumed before reload",
    restoredVerse: 60,
    unchangedLogicalReference: partialRef,
    testedWidths: [390, 1440, 320],
    unchangedProgress: beforeProgress,
  });
});

for (const representation of ["Fließtext", "Einzelverse"] as const) {
  test(`${representation}: Enter und Leertaste schalten additive Auswahl; Escape gibt den Fokus zum zuletzt hinzugefügten Vers 36 zurück`, async ({
    page,
  }) => {
    await page.goto("/lesen/JHN?chapter=6");
    await ready(page);
    if (representation === "Einzelverse") {
      await button(page, "Leseeinstellungen").click();
      await button(page, "Einzelverse").click();
      await button(page, "Leseeinstellungen schließen").click();
      await expect(visible(page, "reader-single-verses")).toBeVisible();
    }
    const before = durableContent(await localData(page));
    await expect(selectionBar(page)).toHaveCount(0);
    for (const [n, key] of [
      [35, "Enter"],
      [37, "Space"],
      [36, "Enter"],
    ] as const) {
      await verse(page, n).focus();
      await verse(page, n).press(key);
      await expect(verse(page, n)).toHaveAttribute("aria-pressed", "true");
    }
    await openTools(page);
    await page.keyboard.press("Escape");
    await expect(tools(page)).toHaveCount(0);
    await expect(verse(page, 36)).toBeFocused();
    for (const n of [35, 36, 37])
      await expect(verse(page, n)).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(selectionBar(page)).toHaveCount(0);
    await expect(verse(page, 36)).toBeFocused();
    for (const n of [35, 36, 37])
      await expect(verse(page, n)).toHaveAttribute("aria-pressed", "false");
    expect(durableContent(await localData(page))).toEqual(before);
    await report(
      page,
      `keyboard-${representation === "Fließtext" ? "flow" : "legacy"}`,
      {
        representation,
        explicitKeys: ["35:Enter", "37:Space", "36:Enter", "Escape", "Escape"],
        focusReturnedToLastAddedVerse: 36,
        selectionClearedExplicitly: true,
        unchangedDurableContent: true,
      },
    );
  });
}

for (const kind of ["verse", "passage"] as const) {
  test(`${kind === "verse" ? "Einzelvers" : "Bereich"}: ein echter Speicherfehler bewahrt den ungesicherten Entwurf über Sammlung und die genaue Wiederaufnahme`, async ({
    page,
  }) => {
    await page.goto("/lesen/JHN?chapter=6");
    await ready(page);
    const beforeProgress = progress(await localData(page));
    const expectedRef = {
      book: "JHN",
      chapter: 6,
      from: 35,
      to: kind === "verse" ? 35 : 37,
    };
    const key =
      kind === "verse"
        ? "capture:verse:JHN:6:35"
        : "capture:passage:JHN:6:35:37";
    const text =
      kind === "verse"
        ? "Meine ungesicherten Worte zu genau Vers 35."
        : "Meine ungesicherten Worte zum vollständigen Bereich 35 bis 37.";
    if (kind === "passage") {
      for (const n of [35, 36, 37]) await verse(page, n).click();
      await openTools(page);
    } else {
      await verse(page, 35).click();
      await openNote(page);
    }
    const field =
      kind === "passage"
        ? noteField(page)
        : page
            .getByRole("textbox", { name: "Notiz zu Vers 35", exact: true })
            .filter({ visible: true });
    await expect(field).toBeVisible();
    await page.evaluate(() => {
      const testWindow = window as Window & { failReaderWrites?: boolean };
      testWindow.failReaderWrites = true;
      const put = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (value, recordKey) {
        if (testWindow.failReaderWrites && recordKey === "main")
          throw new DOMException(
            "Echter Test-Schreibfehler",
            "QuotaExceededError",
          );
        return put.call(this, value, recordKey);
      };
    });
    await field.fill(text);
    await expect(
      page
        .getByText(/Entwurf konnte nicht gesichert werden/)
        .filter({ visible: true }),
    ).toBeVisible();
    expect((await localData(page)).drafts.some((d) => d.key === key)).toBe(
      false,
    );
    expect((await localData(page)).notes).toEqual([]);
    if (kind === "passage") await closeTools(page);
    else await closeNote(page);
    // These are actual client-side navigation controls. A document reload would
    // intentionally lose session-only memory and cannot test held recovery.
    await button(page, "Zurück").click();
    await expect(page).toHaveURL(/\/bibel(?:\?|$)/);
    await button(page, "Sammlung").click();
    await button(page, "Entwürfe").click();
    await expect(
      page.getByText("Nur in dieser Sitzung erhalten", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(text, { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    const download = page.waitForEvent("download");
    await button(page, "Ungesicherte Entwürfe exportieren").click();
    const exportedPath = await (await download).path();
    const exported = JSON.parse(readFileSync(exportedPath!, "utf8"));
    const held = exported.drafts.find(
      (entry: { draft: { key: string } }) => entry.draft.key === key,
    );
    expect(held).toMatchObject({
      reason: "error",
      draft: {
        revision: 0,
        values: { text, source: { type: kind, ref: expectedRef } },
      },
    });
    const sourceId = held.draft.id as string;
    await button(
      page,
      `Entwurf fortsetzen: Notiz zu Johannes 6,${kind === "verse" ? "35" : "35–37"}`,
    ).click();
    await ready(page);
    if (kind === "passage") {
      await expect(tools(page)).toBeVisible();
      await selected(page, [35, 36, 37]);
    }
    const resumed =
      kind === "passage"
        ? noteField(page)
        : page
            .getByRole("textbox", { name: "Notiz zu Vers 35", exact: true })
            .filter({ visible: true });
    await expect(resumed).toHaveValue(text);
    await expect(
      page.getByText(/Dieser Bibelentwurf ist nicht mehr vorhanden/),
    ).toHaveCount(0);
    expect((await localData(page)).drafts.some((d) => d.key === key)).toBe(
      false,
    );
    expect((await localData(page)).notes).toEqual([]);
    await page.evaluate(() => {
      (window as Window & { failReaderWrites?: boolean }).failReaderWrites =
        false;
    });
    await button(page, "Notiz speichern").click();
    await expect
      .poll(async () =>
        (await localData(page)).notes.find((note) => note.text === text),
      )
      .toMatchObject({
        id: held.draft.values.entityId,
        kind: "note",
        ref: expectedRef,
        captureSource: { type: kind, ref: expectedRef },
      });
    expect((await localData(page)).drafts.some((d) => d.id === sourceId)).toBe(
      false,
    );
    expect((await localData(page)).notes).toHaveLength(1);
    expect(progress(await localData(page))).toEqual(beforeProgress);
    await report(page, `held-${kind}-draft-source-recovery`, {
      sameSessionMemoryRecoveredThroughActualCollectionLink: true,
      originalDraftId: sourceId,
      exactKey: key,
      exactSource: expectedRef,
      exportPreservedOriginalWords: true,
      noDurableDraftOrNoteBeforeRecovery: true,
      oneExplicitlySavedNote: true,
      unchangedProgress: beforeProgress,
    });
  });
}

test("eine abgelehnte Versentwurf-URL öffnet vor oder nach der Quellenprüfung keinen fremden Editor", async ({
  page,
}) => {
  await page.goto("/lesen/JHN?chapter=6&verse=35");
  await ready(page);
  const words =
    "Dieser Entwurf bleibt ausschließlich Johannes 6,35 zugeordnet.";
  await openNote(page);
  await page
    .getByRole("textbox", { name: "Notiz zu Vers 35", exact: true })
    .filter({ visible: true })
    .fill(words);
  await expect
    .poll(async () =>
      (await localData(page)).drafts.find(
        (d) => d.key === "capture:verse:JHN:6:35",
      ),
    )
    .toMatchObject({ values: { text: words } });
  const original = (await localData(page)).drafts.find(
    (d) => d.key === "capture:verse:JHN:6:35",
  )!;
  const beforeProgress = progress(await localData(page));
  // Read-only observation includes nodes added and removed before a later
  // assertion, so even a transient pre-authorization editor mount is visible.
  await page.addInitScript(() => {
    const labels: string[] = [];
    (
      window as Window & { readerMountedNoteLabels?: string[] }
    ).readerMountedNoteLabels = labels;
    const record = (element: Element) => {
      const selector =
        'textarea[aria-label^="Notiz zu Vers"],input[aria-label^="Notiz zu Vers"]';
      if (element.matches(selector))
        labels.push(element.getAttribute("aria-label")!);
      element
        .querySelectorAll(selector)
        .forEach((node) => labels.push(node.getAttribute("aria-label")!));
    };
    new MutationObserver((records) => {
      for (const mutation of records) {
        if (
          mutation.type === "attributes" &&
          mutation.target instanceof Element
        )
          record(mutation.target);
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) record(node);
        });
      }
    }).observe(document, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-label"],
    });
  });
  await page.goto(
    `/lesen/MRK?chapter=4&verse=35&draft=${encodeURIComponent(original.id)}`,
  );
  await expect(
    page.getByText(
      "Entwurf und Bibelabschnitt passen nicht zusammen. Öffne den Entwurf erneut über die Sammlung.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page
      .getByRole("textbox", { name: "Notiz zu Vers 35", exact: true })
      .filter({ visible: true }),
  ).toHaveCount(0);
  await expect(tools(page)).toHaveCount(0);
  const editorLabelsBeforeExplicitSelection = await page.evaluate(
    () =>
      (window as Window & { readerMountedNoteLabels?: string[] })
        .readerMountedNoteLabels,
  );
  expect(editorLabelsBeforeExplicitSelection).toEqual([]);
  expect((await localData(page)).drafts).toEqual([original]);
  expect((await localData(page)).notes).toEqual([]);
  expect(progress(await localData(page))).toEqual(beforeProgress);
  // Reading remains usable after the rejected route. Only a fresh explicit
  // verse choice opens a new editor for the actual visible canonical source.
  await verse(page, 36).click();
  await expect(
    page
      .getByRole("textbox", { name: "Notiz zu Vers 36", exact: true })
      .filter({ visible: true }),
  ).toHaveCount(0);
  await openNote(page);
  await expect(
    page
      .getByRole("textbox", { name: "Notiz zu Vers 36", exact: true })
      .filter({ visible: true }),
  ).toHaveValue("");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { readerMountedNoteLabels?: string[] })
            .readerMountedNoteLabels,
      ),
    )
    .toContain("Notiz zu Vers 36");
  expect((await localData(page)).drafts).toEqual([original]);
  await report(page, "rejected-verse-draft-route-keeps-editors-closed", {
    rejectedDraftId: original.id,
    originalSourceUnchanged: true,
    editedRoute: "MRK 4,35",
    explicitNewSelection: "MRK 4,36",
    noExtraDraftOrNote: true,
    readOnlyDomObserverSawNoEditorBeforeExplicitChoice:
      editorLabelsBeforeExplicitSelection,
  });
});
