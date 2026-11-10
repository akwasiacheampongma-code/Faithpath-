import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { NtChapter } from "../../src/features/quiz/catalog";
import { localData } from "./persistence";

const source = JSON.parse(
  readFileSync(
    new URL("../../src/data/nt-catalog.json", import.meta.url),
    "utf8",
  ),
) as { chapters: NtChapter[] };
const chapter = source.chapters.find(
  (item) => item.book === "MRK" && item.chapter === 4,
)!;
const key = (question: NtChapter["questions"][number]) =>
  `${question.id}:${question.hash}`;
const button = (page: Page, name: string) =>
  page.getByRole("button", { name, exact: true }).filter({ visible: true });
const radio = (page: Page, option: string) =>
  page
    .getByRole("radio", { name: option, exact: true })
    .filter({ visible: true });
const ready = (page: Page, index = 0) =>
  expect(
    page.getByTestId("nt-question-heading").filter({ visible: true }),
  ).toHaveText(chapter.questions[index]!.prompt);

// Hold only the delivery of the real transaction's successful completion event.
// IndexedDB still commits normally; no answer/state is fabricated by this gate.
async function holdNextCommitAcknowledgement(page: Page) {
  await page.evaluate(() => {
    const target = window as typeof window & {
      __ntCommitGate?: { held: boolean; release: (() => void) | null };
    };
    const prototype = IDBTransaction.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "oncomplete");
    if (!descriptor?.get || !descriptor.set)
      throw new Error(
        "The browser exposes no transaction completion descriptor",
      );
    const gate = { held: false, release: null as (() => void) | null };
    target.__ntCommitGate = gate;
    let armed = true;
    Object.defineProperty(prototype, "oncomplete", {
      configurable: true,
      get: descriptor.get,
      set(this: IDBTransaction, handler: ((event: Event) => void) | null) {
        if (armed && this.mode === "readwrite" && handler) {
          armed = false;
          descriptor.set!.call(this, (event: Event) => {
            gate.held = true;
            gate.release = () => {
              Object.defineProperty(prototype, "oncomplete", descriptor);
              gate.release = null;
              handler.call(this, event);
            };
          });
        } else descriptor.set!.call(this, handler);
      },
    });
  });
}
async function waitHeld(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as typeof window & { __ntCommitGate?: { held: boolean } })
            .__ntCommitGate?.held,
      ),
    )
    .toBe(true);
}
async function releaseCommit(page: Page) {
  await page.evaluate(() => {
    const gate = (
      window as typeof window & {
        __ntCommitGate?: { release: (() => void) | null };
      }
    ).__ntCommitGate;
    if (!gate?.release)
      throw new Error("No actual transaction acknowledgement is held");
    gate.release();
  });
}
async function visitReaderDuringPendingCommit(page: Page) {
  await button(page, "Das ganze Kapitel lesen").click();
  await expect(page).toHaveURL(/\/lesen\/MRK/);
  await expect(button(page, "Leseeinstellungen")).toBeVisible();
  await releaseCommit(page);
}

test("an own confirmed answer reconciles after leaving while its real commit acknowledgement is pending", async ({
  page,
}) => {
  const question = chapter.questions[0]!;
  await page.goto("/verstehen/MRK?chapter=4");
  await ready(page);
  await radio(page, question.options[0]!).check();
  await holdNextCommitAcknowledgement(page);
  await button(page, "Antwort prüfen").click();
  await waitHeld(page);
  await expect(button(page, "Antwort prüfen")).toBeDisabled();
  await expect(button(page, "Antwort ändern")).toHaveCount(0);
  await visitReaderDuringPendingCommit(page);
  await expect
    .poll(
      async () =>
        (await localData(page))?.ntStudy.answers[key(question)]?.revision,
    )
    .toBe(1);
  const committed = (await localData(page)).ntStudy.answers[key(question)]!;
  await page.goBack();
  await ready(page);
  await expect(button(page, "Antwort ändern")).toBeVisible();
  await expect(button(page, "Antwort prüfen")).toHaveCount(0);
  await expect(radio(page, question.options[0]!)).toBeChecked();
  expect((await localData(page)).ntStudy.answers[key(question)]).toEqual(
    committed,
  );
  // A real follow-up edit must use the confirmed stamp, rather than failing CAS
  // against the component's own initial null stamp.
  await button(page, "Antwort ändern").click();
  await radio(page, question.options[1]!).check();
  await button(page, "Antwort prüfen").click();
  await expect(button(page, "Antwort ändern")).toBeVisible();
  const next = (await localData(page)).ntStudy.answers[key(question)]!;
  expect(next.revision).toBe(2);
  expect(next.createdAt).toBe(committed.createdAt);
  expect(next.choice).toBe(1);
  expect(next.question).toEqual(committed.question);
  expect((await localData(page)).readChapters).toEqual([]);
  expect((await localData(page)).growthStage).toBe(0);
});

test("an own confirmed question move restores the visible question after a pending-commit detour", async ({
  page,
}) => {
  await page.goto("/verstehen/MRK?chapter=4");
  await ready(page);
  await holdNextCommitAcknowledgement(page);
  await button(page, "Nächste Frage").click();
  await waitHeld(page);
  await ready(page, 0);
  await visitReaderDuringPendingCommit(page);
  await expect
    .poll(async () => (await localData(page))?.ntStudy.position?.index)
    .toBe(1);
  await page.goBack();
  await ready(page, 1);
  expect((await localData(page)).ntStudy.position).toEqual({
    book: "MRK",
    chapter: 4,
    index: 1,
  });
  const question = chapter.questions[1]!;
  await radio(page, question.options[0]!).check();
  await button(page, "Antwort prüfen").click();
  await expect(button(page, "Antwort ändern")).toBeVisible();
  const data = await localData(page);
  expect(Object.keys(data.ntStudy.answers)).toEqual([key(question)]);
  expect(data.ntStudy.answers[key(question)]!.question).toEqual(question);
  expect(data.readChapters).toEqual([]);
  expect(data.growthStage).toBe(0);
});

test("a completion acknowledged away from the study view is shown on return without another completion write", async ({
  page,
}) => {
  await page.goto("/verstehen/MRK?chapter=4");
  for (let index = 0; index < 5; index++) {
    await ready(page, index);
    await radio(page, chapter.questions[index]!.options[0]!).check();
    await button(page, "Antwort prüfen").click();
    await expect(button(page, "Antwort ändern")).toBeVisible();
    if (index < 4) await button(page, "Nächste Frage").click();
  }
  await holdNextCommitAcknowledgement(page);
  await button(page, "Fragen abschließen").click();
  await waitHeld(page);
  await visitReaderDuringPendingCommit(page);
  await expect
    .poll(
      async () =>
        Object.keys((await localData(page))?.ntStudy.completions ?? {}).length,
    )
    .toBe(1);
  const completed = (await localData(page)).ntStudy.completions;
  await page.goBack();
  await ready(page, 4);
  await expect(
    page
      .getByText("Alle fünf Fragen angesehen.", { exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
  expect((await localData(page)).ntStudy.completions).toEqual(completed);
  expect(Object.values(completed)[0]!.revision).toBe(1);
  expect((await localData(page)).readChapters).toEqual([]);
  expect((await localData(page)).growthStage).toBe(0);
});
