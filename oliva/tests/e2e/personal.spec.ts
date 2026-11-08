/// <reference types="node" />
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { AppData } from "../../src/state/model";
import { readFile } from "node:fs/promises";
import { localData as local } from "./persistence";
async function saved(page: Page) {
  await expect(
    page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  ).toBeVisible();
}
test("Sicherung nach einem Bereichswechsel enthält den letzten Journalentwurf", async ({
  page,
}) => {
  await page.goto("/sammlung");
  await page
    .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill("Meine letzten Worte vor dem Bereichswechsel.");
  await page
    .getByRole("button", { name: "Profil und Einstellungen", exact: true })
    .click();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Sicherung exportieren", exact: true })
    .click();
  const downloaded = await pending,
    file = await downloaded.path();
  expect(file).not.toBeNull();
  const backup = JSON.parse(await readFile(file!, "utf8")) as AppData;
  expect(backup.drafts.find((d) => d.type === "journal")?.values).toMatchObject(
    { text: "Meine letzten Worte vor dem Bereichswechsel." },
  );
  expect(backup.notes).toEqual([]);
});
test("Journalentwurf überlebt Neustart, Bearbeitung und anschließendes Speichern", async ({
  page,
}) => {
  await page.goto("/sammlung");
  await page
    .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill("Diese Frage darf offen bleiben.\nUnd diese Zeile auch.");
  await saved(page);
  await page.reload();
  await page
    .getByRole("button", { name: "Entwurf fortsetzen", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).toHaveValue("Diese Frage darf offen bleiben.\nUnd diese Zeile auch.");
  await page
    .getByRole("button", { name: "Gedanken speichern", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).not.toBeVisible();
  expect((await local(page)).drafts).toHaveLength(0);
  expect((await local(page)).notes).toHaveLength(1);
  await page.getByRole("button", { name: "Bearbeiten", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill("Meine inzwischen weitergedachten Worte.");
  await saved(page);
  await page.reload();
  await page
    .getByRole("button", { name: "Entwurf fortsetzen", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).toHaveValue("Meine inzwischen weitergedachten Worte.");
  await page
    .getByRole("button", { name: "Gedanken speichern", exact: true })
    .click();
  await expect
    .poll(async () => (await local(page)).notes[0]?.text)
    .toBe("Meine inzwischen weitergedachten Worte.");
  expect((await local(page)).notes).toHaveLength(1);
});
test("Vorhaben, Schritte, Rückblick-Snapshot und Archiv funktionieren zusammen", async ({
  page,
}) => {
  await page.goto("/wege");
  await page
    .getByRole("button", { name: "Deine persönlichen Vorhaben", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ein Vorhaben anlegen", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Name deines Vorhabens" })
    .fill("In Ruhe zuhören");
  await page
    .getByRole("textbox", { name: "Was bewegt dich? (freiwillig)" })
    .fill("Ich möchte im Gespräch Raum lassen.");
  await page
    .getByRole("textbox", { name: "Dein erster kleiner Schritt (freiwillig)" })
    .fill("Vor meiner Antwort drei Sekunden warten.");
  await saved(page);
  await page.reload();
  await page
    .getByRole("button", { name: "Vorhaben-Entwurf fortsetzen", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Name deines Vorhabens" }),
  ).toHaveValue("In Ruhe zuhören");
  await page
    .getByRole("button", { name: "Vorhaben anlegen", exact: true })
    .click();
  await expect(page.getByText("Deine kleinen Schritte")).toBeVisible();
  await page
    .getByRole("button", { name: "Als ausprobiert festhalten", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Ausprobiert · wieder öffnen",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Schritt hinzufügen", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Dein kleiner Schritt", exact: true })
    .fill("Eine offene Frage stellen.");
  await page
    .getByRole("button", { name: "Schritt speichern", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Dein kleiner Schritt", exact: true }),
  ).not.toBeVisible();
  await page
    .getByRole("button", {
      name: "Freiwilligen Rückblick schreiben",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Dein freiwilliger Rückblick" })
    .fill("Heute habe ich zuerst zugehört.");
  await page
    .getByRole("switch", { name: "Erfahrung im Alltag selbst bestätigen" })
    .click();
  await saved(page);
  await page.reload();
  await page
    .getByRole("button", { name: "Diesen Entwurf fortsetzen", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Dein freiwilliger Rückblick" }),
  ).toHaveValue("Heute habe ich zuerst zugehört.");
  await page
    .getByRole("button", { name: "Rückblick festhalten", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Dein freiwilliger Rückblick" }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "Vorhaben bearbeiten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Name deines Vorhabens" })
    .fill("Miteinander im Gespräch bleiben");
  await page
    .getByRole("button", {
      name: "Änderungen am Vorhaben speichern",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Name deines Vorhabens" }),
  ).not.toBeVisible();
  const state = await local(page);
  expect(state.goals[0]?.title).toBe("Miteinander im Gespräch bleiben");
  expect(state.goals[0]?.reviews[0]?.source.title).toBe("In Ruhe zuhören");
  expect(state.goals[0]?.reviews[0]?.source.steps).toHaveLength(2);
  await page
    .getByRole("button", { name: "Vorhaben ins Archiv legen", exact: true })
    .click();
  await expect(page.getByText("Dieses Vorhaben ruht im Archiv.")).toBeVisible();
  await page
    .getByRole("button", { name: "Zurück zu deinen Vorhaben", exact: true })
    .click();
  await page.getByRole("button", { name: "Archiv", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Vorhaben öffnen: Miteinander im Gespräch bleiben",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Vorhaben wieder aufnehmen", exact: true })
    .click();
  expect((await local(page)).goals[0]?.archivedAt).toBeNull();
  expect((await local(page)).goals[0]?.reviews).toHaveLength(1);
});
test("Ungespeicherte Entwurfsworte werden erst nach ausdrücklichem Verwerfen gelöscht", async ({
  page,
}) => {
  await page.goto("/sammlung");
  await page
    .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill("Diesen Text möchte ich bewusst entscheiden.");
  await saved(page);
  await page
    .getByRole("button", { name: "Entwurf verwerfen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Entwurf behalten", exact: true })
    .click();
  await page.reload();
  await page
    .getByRole("button", { name: "Entwurf fortsetzen", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).toHaveValue("Diesen Text möchte ich bewusst entscheiden.");
  await page
    .getByRole("button", { name: "Entwurf verwerfen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Entwurf endgültig verwerfen", exact: true })
    .click();
  await expect.poll(async () => (await local(page)).drafts.length).toBe(0);
  expect((await local(page)).notes).toHaveLength(0);
});
test("Eine installierte V1-Datenbank wird ohne Verlust weitergeführt", async ({
  page,
}) => {
  await page.goto("/einstellungen");
  await page
    .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
    .fill("Ada");
  await page
    .getByRole("button", { name: "Namen speichern", exact: true })
    .click();
  await expect.poll(async () => (await local(page))?.name).toBe("Ada");
  const { goals, drafts, imports, readingPosition, ...rest } = await local(page);
  const old = {
    ...rest,
    version: 1,
    name: "Ada",
    readChapters: ["MRK:4"],
    growthStage: 3,
    notes: [
      {
        id: "legacy-note",
        text: "Meine alten eigenen Worte.",
        kind: "note",
        createdAt: "2026-11-05T12:00:00.000Z",
        updatedAt: "2026-11-05T12:00:00.000Z",
      },
    ],
  };
  await page.evaluate(
    (value) =>
      new Promise<void>((resolve, reject) => {
        const r = indexedDB.open("oliva-local-v1", 1);
        r.onsuccess = () => {
          const tx = r.result.transaction("state", "readwrite");
          tx.objectStore("state").put(value, "main");
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
      }),
    old,
  );
  await page.goto("/sammlung");
  await expect(
    page.getByText("Meine alten eigenen Worte.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
    .click();
  expect((await local(page)).version).toBe(5);
  expect((await local(page)).readChapters).toEqual(["MRK:4"]);
  expect((await local(page)).growthStage).toBe(3);
  expect((await local(page)).notes[0]?.text).toBe("Meine alten eigenen Worte.");
});
test("Bibelbezug wird aus einer Versaktion an ein Vorhaben übergeben", async ({
  page,
}) => {
  await page.goto("/lesen/MRK?chapter=4");
  await page.getByRole("button", { name: /^Vers 35:/ }).click();
  await page
    .getByRole("button", { name: "Mit einem Vorhaben verbinden", exact: true })
    .click();
  await expect(page.getByText("Markus 4,35", { exact: true })).toBeVisible();
  await page
    .getByRole("textbox", { name: "Name deines Vorhabens" })
    .fill("Fragen ehrlich aussprechen");
  await page
    .getByRole("button", { name: "Vorhaben anlegen", exact: true })
    .click();
  await expect(page.getByText("Deine kleinen Schritte")).toBeVisible();
  expect((await local(page)).goals[0]?.ref).toEqual({
    book: "MRK",
    chapter: 4,
    from: 35,
    to: 35,
  });
});
test("Neue Vorhaben- und Entwurfsansichten bleiben auf kleinen Displays zugänglich", async ({
  page,
}) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/vorhaben");
    await page
      .getByRole("button", { name: "Ein Vorhaben anlegen", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Name deines Vorhabens" })
      .fill("Ein ruhiger Anfang");
    await saved(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(scan.violations).toEqual([]);
    await page
      .getByRole("button", { name: "Entwurf verwerfen", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Entwurf endgültig verwerfen", exact: true })
      .click();
    await expect
      .poll(async () =>
        (await local(page)).drafts.some((draft) => draft.key === "goal:new"),
      )
      .toBe(false);
  }
});
