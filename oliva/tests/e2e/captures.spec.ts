import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type { AppData } from "../../src/state/model";
import { localData as local } from "./persistence";
async function saved(page: Page) {
  await expect(
    page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  ).toBeVisible();
}
test("Hub und Garten bewahren angefangene Worte bei Bereichswechsel und Neustart", async ({
  page,
}) => {
  await page.goto("/");
  const text = "Mein noch unfertiger Dank.\nDie zweite Zeile bleibt.";
  await page
    .getByRole("textbox", {
      name: "Deine freiwillige Tagesreflexion",
      exact: true,
    })
    .fill(text);
  // Switch immediately, before the normal debounce. Focus cleanup must flush.
  await page.getByRole("button", { name: "Mein Garten", exact: true }).click();
  await page
    .getByRole("textbox", {
      name: "Eine freiwillig gelebte Erfahrung",
      exact: true,
    })
    .fill("Ich habe heute zuerst zugehört.");
  await saved(page);
  expect((await local(page)).notes).toEqual([]);
  expect((await local(page)).drafts).toHaveLength(2);
  await page.reload();
  await expect(
    page.getByRole("textbox", {
      name: "Eine freiwillig gelebte Erfahrung",
      exact: true,
    }),
  ).toHaveValue("Ich habe heute zuerst zugehört.");
  await page.getByRole("button", { name: "Heute", exact: true }).click();
  await expect(
    page.getByRole("textbox", {
      name: "Deine freiwillige Tagesreflexion",
      exact: true,
    }),
  ).toHaveValue(text);
  await page.getByRole("button", { name: "Festhalten", exact: true }).click();
  await expect.poll(async () => (await local(page)).notes.length).toBe(1);
  expect((await local(page)).drafts).toHaveLength(1);
  await page.getByRole("button", { name: "Mein Garten", exact: true }).click();
  await page
    .getByRole("button", { name: "Erfahrung festhalten", exact: true })
    .click();
  await expect
    .poll(async () =>
      (await local(page)).notes.some((n) => n.kind === "action"),
    )
    .toBe(true);
  expect((await local(page)).drafts).toHaveLength(0);
});
test("zwei Versentwürfe bleiben beim Wechsel getrennt und werden über die Übersicht fortgesetzt", async ({
  page,
}) => {
  await page.goto("/lesen/MRK?chapter=4");
  await page.getByRole("button", { name: /^Vers 35:/ }).click();
  await page
    .getByRole("textbox", { name: "Notiz zu Vers 35", exact: true })
    .fill("Meine offene Frage zu Vers 35.");
  await page.getByRole("button", { name: /^Vers 36:/ }).click();
  await page
    .getByRole("textbox", { name: "Notiz zu Vers 36", exact: true })
    .fill("Mein Gedanke zu Vers 36.");
  await saved(page);
  await page.goto("/sammlung");
  await page.getByRole("button", { name: "Entwürfe", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Entwurf fortsetzen: Notiz zu Markus 4,35",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Notiz zu Vers 35", exact: true }),
  ).toHaveValue("Meine offene Frage zu Vers 35.");
  const box = await page
    .getByRole("button", { name: /^Vers 35:/ })
    .boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeLessThan(200);
  await page
    .getByRole("button", { name: "Notiz speichern", exact: true })
    .click();
  await expect.poll(async () => (await local(page)).notes.length).toBe(1);
  expect((await local(page)).notes[0]?.ref?.from).toBe(35);
  await page
    .getByRole("button", {
      name: "Diesen Eintrag in der Sammlung bearbeiten",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).toHaveValue("Meine offene Frage zu Vers 35.");
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill("Meine weitergedachten Worte zu Vers 35.");
  await page
    .getByRole("button", { name: "Gedanken speichern", exact: true })
    .click();
  await expect
    .poll(async () => (await local(page)).notes[0]?.text)
    .toBe("Meine weitergedachten Worte zu Vers 35.");
  expect((await local(page)).notes[0]?.ref?.from).toBe(35);
  await page.goto("/lesen/MRK?chapter=4");
  await expect(
    page.getByRole("button", {
      name: "Notizentwurf zu Markus 4,36 fortsetzen",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Notizentwurf zu Markus 4,36 fortsetzen",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Notiz zu Vers 36", exact: true }),
  ).toHaveValue("Mein Gedanke zu Vers 36.");
});
test("Reflexionsentwurf im Lernweg überlebt Neustart und schließt nur auf ausdrücklichen Klick ab", async ({
  page,
}) => {
  await page.goto("/weg/jesus");
  await page
    .getByRole("button", { name: "Abschnitt lesen", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Abschnitt als gelesen bestätigen",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Zurück zum Weg", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine Reflexion (freiwillig)", exact: true })
    .fill("Meine Fragen dürfen offen bleiben.");
  await saved(page);
  expect((await local(page)).completedSteps).toEqual([]);
  expect((await local(page)).notes).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole("textbox", {
      name: "Deine Reflexion (freiwillig)",
      exact: true,
    }),
  ).toHaveValue("Meine Fragen dürfen offen bleiben.");
  await page
    .getByRole("button", {
      name: "Reflexion speichern & Schritt abschließen",
      exact: true,
    })
    .click();
  await expect
    .poll(async () => (await local(page)).completedSteps)
    .toEqual(["jesus:0"]);
  const data = await local(page);
  expect(data.drafts).toEqual([]);
  expect(data.notes[0]?.captureSource?.type).toBe("guided");
  await page.goto("/sammlung");
  await page
    .getByRole("button", {
      name: "Damals gezeigte Einordnung ansehen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("BEWAHRTER ENTWURF · KEIN BIBELTEXT", { exact: true }),
  ).toBeVisible();
});
test("ein Entwurf wird erst nach ausdrücklichem Verwerfen gelöscht und bestätigt dabei keine Erfahrung", async ({
  page,
}) => {
  await page.goto("/garten");
  await page
    .getByRole("textbox", {
      name: "Eine freiwillig gelebte Erfahrung",
      exact: true,
    })
    .fill("Ich möchte das später weiterdenken.");
  await saved(page);
  await page
    .getByRole("button", { name: "Entwurf verwerfen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Entwurf behalten", exact: true })
    .click();
  expect((await local(page)).drafts).toHaveLength(1);
  await page
    .getByRole("button", { name: "Entwurf verwerfen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Entwurf endgültig verwerfen", exact: true })
    .click();
  await expect.poll(async () => (await local(page)).drafts.length).toBe(0);
  expect((await local(page)).notes).toEqual([]);
  await expect(
    page.getByText("Deine Erfahrung wurde lokal in der Sammlung gespeichert.", {
      exact: true,
    }),
  ).not.toBeVisible();
});
test("der Export nach Navigation enthält den noch nicht abgeschlossenen Reflexionsentwurf", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("textbox", {
      name: "Deine freiwillige Tagesreflexion",
      exact: true,
    })
    .fill("Meine letzten Worte vor dem Export.");
  await page
    .getByRole("button", { name: "Profil und Einstellungen", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Sicherung exportieren", exact: true })
    .click();
  const file = await (await download).path(),
    data = JSON.parse(await readFile(file!, "utf8")) as AppData;
  expect(
    data.drafts.find((d) => d.key === "capture:daily")?.values,
  ).toMatchObject({ text: "Meine letzten Worte vor dem Export." });
  expect(data.notes).toEqual([]);
});
test("ein Speicherfehler lässt den Kontextentwurf sichtbar und erzeugt keinen fertigen Eintrag", async ({
  page,
}) => {
  await page.goto("/garten");
  await page.evaluate(() => {
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if (key === "main")
        throw new DOMException("Speicher voll", "QuotaExceededError");
      return put.call(this, value, key);
    };
  });
  await page
    .getByRole("textbox", {
      name: "Eine freiwillig gelebte Erfahrung",
      exact: true,
    })
    .fill("Diese Worte dürfen nicht verloren gehen.");
  await expect(
    page.getByText(/Entwurf konnte nicht gesichert werden/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Erfahrung festhalten", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", {
      name: "Eine freiwillig gelebte Erfahrung",
      exact: true,
    }),
  ).toHaveValue("Diese Worte dürfen nicht verloren gehen.");
  expect((await local(page))?.notes ?? []).toEqual([]);
});
test("ungesicherte Worte überleben einen Bereichswechsel und lassen sich als Sitzungskopie exportieren", async ({
  page,
}) => {
  await page.goto("/garten");
  await page.evaluate(() => {
    (window as any).failWrites = true;
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (value, key) {
      if ((window as any).failWrites && key === "main")
        throw new DOMException("Speicher voll", "QuotaExceededError");
      return put.call(this, value, key);
    };
  });
  const text = "Meine letzten Worte bleiben auch beim Bereichswechsel.";
  await page
    .getByRole("textbox", {
      name: "Eine freiwillig gelebte Erfahrung",
      exact: true,
    })
    .fill(text);
  await expect(
    page.getByText(/Entwurf konnte nicht gesichert werden/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Profil und Einstellungen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Sicherung exportieren", exact: true })
    .click();
  await expect(
    page.getByText(/Einige Entwürfe sind noch nicht dauerhaft gesichert/),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Ungesicherte Entwürfe bewahren",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Nur in dieser Sitzung erhalten", { exact: true }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Ungesicherte Entwürfe exportieren",
      exact: true,
    })
    .click();
  const file = await (await download).path(),
    copy = JSON.parse(await readFile(file!, "utf8"));
  expect(copy.app).toBe("OLIVA-Uncommitted");
  expect(copy.drafts[0].draft.values.text).toBe(text);
  expect(
    await page.evaluate(() => {
      const e = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(e);
      return e.defaultPrevented;
    }),
  ).toBe(true);
  await page
    .getByRole("button", {
      name: "Entwurf fortsetzen: Deine Erfahrung im Garten",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("textbox", {
      name: "Eine freiwillig gelebte Erfahrung",
      exact: true,
    }),
  ).toHaveValue(text);
  await page.evaluate(() => {
    (window as any).failWrites = false;
  });
  await page
    .getByRole("button", { name: "Erfahrung festhalten", exact: true })
    .click();
  await expect.poll(async () => (await local(page)).notes.length).toBe(1);
  expect((await local(page)).notes[0]?.text).toBe(text);
  expect(
    await page.evaluate(() => {
      const e = new Event("beforeunload", { cancelable: true });
      window.dispatchEvent(e);
      return e.defaultPrevented;
    }),
  ).toBe(false);
});
