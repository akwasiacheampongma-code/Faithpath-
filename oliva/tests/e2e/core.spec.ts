import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { AppData } from "../../src/state/model";
import { localData as local } from "./persistence";
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}

test("Gast erlebt einen vollständigen Weg; Abschnitte bleiben von Kapiteln getrennt", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Deine erste Geschichte", exact: true })
    .click();
  await expect(page.getByText("Du darfst mit Fragen anfangen.")).toBeVisible();
  await page
    .getByRole("button", { name: "Geschichte lesen", exact: true })
    .click();
  await expect(
    page.getByText("Wenn der Sturm still wird", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Vers 35:/ }).click();
  await page.getByRole("button", { name: "Merken", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Gemerkt", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Oliv markieren", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Notiz zu Vers 35" })
    .fill("Die Freunde sprechen ihre Angst aus.");
  await page
    .getByRole("button", { name: "Notiz speichern", exact: true })
    .click();
  await expect(
    page.getByText("Deine Notiz wurde auf diesem Gerät gespeichert."),
  ).toBeVisible();
  for (let i = 0; i < 3; i++) {
    if (i > 0) {
      await page
        .getByRole("button", { name: "Zum nächsten Schritt", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Abschnitt lesen", exact: true })
        .click();
    }
    await page
      .getByRole("button", {
        name: "Abschnitt als gelesen bestätigen",
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Weiter zum Verstehen", exact: true })
      .click();
    if (i === 0) {
      await page
        .getByRole("textbox", { name: "Deine Reflexion (freiwillig)" })
        .fill("Heute darf ich meine Angst benennen.");
      await page
        .getByRole("button", {
          name: "Reflexion speichern & Schritt abschließen",
          exact: true,
        })
        .click();
    } else
      await page
        .getByRole("button", {
          name: "Ohne Reflexion abschließen",
          exact: true,
        })
        .click();
  }
  await expect(page.getByText("Nimm mit, was dich berührt.")).toBeVisible();
  const state = await local(page);
  expect(state.completedSteps).toHaveLength(3);
  expect(state.readSteps).toHaveLength(3);
  expect(state.readChapters).toEqual([]);
  expect(state.notes).toHaveLength(2);
  expect(state.bookmarks).toContain("MRK:4:35");
  expect(state.highlights["MRK:4:35"]).toBe("olive");
  await page.reload();
  await expect(page.getByText("Nimm mit, was dich berührt.")).toBeVisible();
  expect((await local(page)).completedSteps).toHaveLength(3);
  expect(errors).toEqual([]);
  await noOverflow(page);
});

test("Buchnavigation, Suche, Leserpräferenzen und idempotenter Kapitelabschluss", async ({
  page,
}) => {
  await page.goto("/bibel");
  await page.getByRole("textbox", { name: "Buch suchen" }).fill("Markus");
  await page
    .getByRole("button", { name: "Markus, 16 Kapitel", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Markus, Kapitel 4", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Leseeinstellungen", exact: true })
    .click();
  await page.getByRole("button", { name: "Größer", exact: true }).click();
  await page.getByRole("button", { name: "2,1", exact: true }).click();
  await page
    .getByRole("button", { name: "Dunklen Modus aktivieren", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Kapitel als gelesen bestätigen",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Als gelesen festgehalten", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Als gelesen festgehalten", exact: true }),
  ).toBeDisabled();
  const state = await local(page);
  expect(state.readChapters).toEqual(["MRK:4"]);
  expect(state.settings.fontSize).toBe(22);
  expect(state.settings.lineHeight).toBe(2.1);
  expect(state.settings.theme).toBe("dark");
  await page.goto("/bibel");
  await page
    .getByRole("button", { name: "Bibeltext durchsuchen", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Wörter im Bibeltext suchen" })
    .fill("Friede mit euch");
  await expect(page.getByText(/Treffer/).first()).toBeVisible();
  await page
    .getByRole("button")
    .filter({ hasText: /Friede sei mit euch/ })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Leseeinstellungen", exact: true }),
  ).toBeVisible();
  await noOverflow(page);
});

test("Journal bearbeiten, löschen und rückgängig machen", async ({ page }) => {
  await page.goto("/sammlung");
  await page
    .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill("Ein Anfang darf klein sein.");
  await page
    .getByRole("button", { name: "Gedanken speichern", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).not.toBeVisible();
  await expect(
    page.getByText("Ein Anfang darf klein sein.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Bearbeiten", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill("Ein Anfang darf langsam wachsen.");
  await page
    .getByRole("button", { name: "Gedanken speichern", exact: true })
    .click();
  await expect(
    page.getByText("Ein Anfang darf langsam wachsen.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Löschen", exact: true }).click();
  await page
    .getByRole("button", { name: "Eintrag jetzt löschen", exact: true })
    .click();
  await expect(
    page.getByText("Ein Anfang darf langsam wachsen.", { exact: true }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "Rückgängig machen", exact: true })
    .click();
  await expect
    .poll(async () =>
      (await local(page)).notes.some(
        (note) => note.text === "Ein Anfang darf langsam wachsen.",
      ),
    )
    .toBe(true);
  await page.reload();
  await expect(
    page.getByText("Ein Anfang darf langsam wachsen.", { exact: true }),
  ).toBeVisible();
});

test("Sicherung exportieren, validieren und mit ausdrücklicher Ersetzung wiederherstellen", async ({
  page,
}) => {
  await page.goto("/einstellungen");
  await page
    .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
    .fill("Ada");
  await page
    .getByRole("button", { name: "Namen speichern", exact: true })
    .click();
  await expect.poll(async () => (await local(page)).name).toBe("Ada");
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Sicherung exportieren", exact: true })
    .click();
  const download = await pending;
  expect(download.suggestedFilename()).toContain("oliva-sicherung-");
  const snapshot = await local(page);
  await page
    .getByRole("button", { name: "Sicherung wiederherstellen", exact: true })
    .click();
  const field = page.getByRole("textbox", {
    name: "Inhalt deiner OLIVA-Sicherung",
  });
  await field.fill("{kaputt");
  await page
    .getByRole("button", { name: "Sicherung prüfen", exact: true })
    .click();
  await expect(page.getByText(/keine gültige OLIVA-Sicherung/)).toBeVisible();
  expect((await local(page)).name).toBe("Ada");
  await field.fill(JSON.stringify({ ...snapshot, name: "Miriam" }));
  await page
    .getByRole("button", { name: "Sicherung prüfen", exact: true })
    .click();
  expect((await local(page)).name).toBe("Ada");
  await page
    .getByRole("button", {
      name: "Daten durch diese Sicherung ersetzen",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Die Sicherung wurde wiederhergestellt."),
  ).toBeVisible();
  expect((await local(page)).name).toBe("Miriam");
});

test("Baumvorschau verändert keine Daten; reduzierte Bewegung bleibt gespeichert", async ({
  page,
}) => {
  await page.goto("/garten");
  await expect(page.getByText("Der Samen", { exact: true })).toBeVisible();
  await page
    .getByRole("button", {
      name: "Stadium 7 ansehen: Erste Früchte",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("VORSCHAU · KEIN EIGENER FORTSCHRITT"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Zurück zu deinem Baum", exact: true })
    .click();
  await expect(page.getByText("Der Samen", { exact: true })).toBeVisible();
  await page.goto("/einstellungen");
  await page.getByRole("switch", { name: "Animationen reduzieren" }).click();
  await expect
    .poll(async () => (await local(page)).settings.reducedMotion)
    .toBe(true);
  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Animationen reduzieren" }),
  ).toBeChecked();
});

test("Offline-Neustart öffnet auch einen noch nicht besuchten Reader", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByText("Ein Moment, der bleibt.").waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await expect(
    page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await context.setOffline(true);
  await page.goto("/lesen/REV?chapter=22");
  await expect(
    page.getByText("Offenbarung", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /^Vers 21:/ })).toBeVisible();
  await page
    .getByRole("button", {
      name: "Kapitel als gelesen bestätigen",
      exact: true,
    })
    .click();
  expect((await local(page)).readChapters).toEqual(["REV:22"]);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Als gelesen festgehalten", exact: true }),
  ).toBeDisabled();
  await context.setOffline(false);
});

test("Gleichzeitige Fenster überschreiben keine fremden Änderungen", async ({
  page,
  context,
}) => {
  await page.goto("/einstellungen");
  const second = await context.newPage();
  await second.goto("/einstellungen");
  await second
    .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
    .fill("Zweites Fenster");
  await page
    .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
    .fill("Erstes Fenster");
  await page
    .getByRole("button", { name: "Namen speichern", exact: true })
    .click();
  await expect
    .poll(async () => (await local(page)).name)
    .toBe("Erstes Fenster");
  await second
    .getByRole("button", { name: "Namen speichern", exact: true })
    .click();
  await expect(
    second.getByText(/Ein anderes Fenster hat die Daten geändert/),
  ).toBeVisible();
  expect((await local(page)).name).toBe("Erstes Fenster");
  await expect(
    second.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  ).toHaveValue("Zweites Fenster");
  await second.close();
});

test("Speicherfehler bestätigt keine Notiz und erhält den getippten Text", async ({
  page,
}) => {
  await page.goto("/sammlung");
  await page
    .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine Worte", exact: true })
    .fill("Dieser Text muss erhalten bleiben.");
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException(
        "Simulierter voller Speicher",
        "QuotaExceededError",
      );
    };
  });
  await page
    .getByRole("button", { name: "Gedanken speichern", exact: true })
    .click();
  await expect(page.getByText(/Speichern fehlgeschlagen/)).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).toHaveValue("Dieser Text muss erhalten bleiben.");
  const state = await local(page);
  expect(state?.notes ?? []).toEqual([]);
});

test("Kernansichten reflowen bei 320, 390, 768 und 1440 Pixeln; Axe-Prüfung", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const width of [320, 390, 768, 1440])
    for (const route of [
      "/",
      "/wege",
      "/bibel",
      "/garten",
      "/sammlung",
      "/lesen/MRK?chapter=4",
    ]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await expect(
        page.getByText("Dein Raum wird vorbereitet …"),
      ).not.toBeVisible();
      await page.waitForFunction(() => document.fonts.status === "loaded");
      await noOverflow(page);
    }
  const violations = [];
  for (const theme of ["light", "dark"]) {
    if (theme === "dark") {
      await page.goto("/");
      await page
        .getByRole("button", { name: "Dunklen Modus aktivieren", exact: true })
        .click();
      await expect(
        page.getByRole("button", {
          name: "Hellen Modus aktivieren",
          exact: true,
        }),
      ).toBeVisible();
    }
    for (const route of ["/", "/wege", "/garten", "/lesen/MRK?chapter=4"]) {
      await page.goto(route);
      await page.getByRole("button").first().waitFor();
      if (route === "/") {
        const ratio = await page
          .getByRole("button", { name: "Deine erste Geschichte", exact: true })
          .evaluate((button) => {
            const text = button.querySelector('[dir="auto"]')!;
            const luminance = (value: string) => {
              const channels = value
                .match(/[\d.]+/g)!
                .slice(0, 3)
                .map(Number)
                .map((v) => v / 255)
                .map((v) =>
                  v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
                );
              return (
                channels[0]! * 0.2126 +
                channels[1]! * 0.7152 +
                channels[2]! * 0.0722
              );
            };
            const a = luminance(getComputedStyle(text).color),
              b = luminance(getComputedStyle(button).backgroundColor);
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          });
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      violations.push(
        ...scan.violations.map((v) => ({
          theme,
          route,
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target),
        })),
      );
    }
  }
  expect(violations).toEqual([]);
});
