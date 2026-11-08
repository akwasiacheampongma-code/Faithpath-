import { test, expect, type Page } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { localData, rawData } from "./persistence";
import type { AppData } from "../../src/state/model";

test.use({ screenshot: "only-on-failure" });
const title = "In Ruhe zuhören",
  original = "Heute war Raum für meine offene Frage.";
async function saved(page: Page) {
  await expect(
    page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  ).toBeVisible();
}
async function create(page: Page, applied = false) {
  await page.goto("/vorhaben?start=1");
  await page
    .getByRole("textbox", { name: "Name deines Vorhabens", exact: true })
    .fill(title);
  await page
    .getByRole("textbox", {
      name: "Was bewegt dich? (freiwillig)",
      exact: true,
    })
    .fill("Mein ursprünglicher Anlass.");
  await page
    .getByRole("textbox", {
      name: "Dein erster kleiner Schritt (freiwillig)",
      exact: true,
    })
    .fill("Eine offene Frage stellen.");
  await page
    .getByRole("button", { name: "Vorhaben anlegen", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Freiwilligen Rückblick schreiben",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Dein freiwilliger Rückblick", exact: true })
    .fill(original);
  if (applied)
    await page
      .getByRole("switch", {
        name: "Erfahrung im Alltag selbst bestätigen",
        exact: true,
      })
      .click();
  await page
    .getByRole("button", { name: "Rückblick festhalten", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page))?.goals[0]?.reviews[0]?.text)
    .toBe(original);
  const data = await localData(page),
    goal = data.goals[0]!;
  return {
    goal: structuredClone(goal),
    review: structuredClone(goal.reviews[0]!),
    growth: data.growthStage,
  };
}
function reviewCard(page: Page, id: string) {
  return page.getByTestId(`review-${id}`);
}
async function startEdit(page: Page, id: string, text: string) {
  await reviewCard(page, id)
    .getByRole("button", { name: "Rückblick bearbeiten", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Deine überarbeiteten Worte", exact: true })
    .fill(text);
  await saved(page);
}
async function resume(page: Page) {
  await page
    .getByRole("button", { name: "Diesen Entwurf fortsetzen", exact: true })
    .click();
}
/** Synthetic concurrent-window/older-backup states, derived from real UI records. */
async function externalChange(page: Page, change: (data: AppData) => void) {
  const raw = structuredClone(await rawData(page));
  change(raw.data);
  raw.data.revision++;
  await page.evaluate(
    (value) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("oliva-local-v1", 1);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction("state", "readwrite");
          tx.objectStore("state").put(value, "main");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
        request.onerror = () => reject(request.error);
      }),
    raw,
  );
}

test("Rückblicktext wird geändert, historischer Stand bleibt; Löschen und Rückgängig bewahren den Baum", async ({
  page,
}) => {
  const seed = await create(page, true),
    text = "Meine inzwischen weitergedachten Worte.";
  await startEdit(page, seed.review.id, text);
  await expect(
    page.getByRole("switch", {
      name: "Erfahrung im Alltag selbst bestätigen",
      exact: true,
    }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Rückblickänderung speichern", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).goals[0]!.reviews[0]!.text)
    .toBe(text);
  const edited = (await localData(page)).goals[0]!.reviews[0]!;
  expect(edited.id).toBe(seed.review.id);
  expect(edited.createdAt).toBe(seed.review.createdAt);
  expect(edited.source).toEqual(seed.review.source);
  expect(edited.applied).toBe(true);
  expect(edited.updatedAt).toBeTruthy();
  expect((await localData(page)).growthStage).toBe(seed.growth);
  await reviewCard(page, edited.id)
    .getByRole("button", { name: "Rückblick löschen", exact: true })
    .click();
  await expect(
    page.getByText(/Rückblick und sein bewahrter damaliger Vorhabenstand/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Rückblick jetzt löschen", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).goals[0]!.reviews.length)
    .toBe(0);
  expect((await localData(page)).growthStage).toBe(seed.growth);
  expect(JSON.stringify(await rawData(page))).not.toContain(text);
  await page
    .getByRole("button", { name: "Rückblick wiederherstellen", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).goals[0]!.reviews.length)
    .toBe(1);
  expect((await localData(page)).goals[0]!.reviews[0]).toEqual(edited);
  expect((await localData(page)).growthStage).toBe(seed.growth);
});

test("Bearbeitungsentwurf erreicht die Sammlung und überlebt Offline-Neustart ohne neuen Rückblick", async ({
  page,
  context,
}) => {
  const seed = await create(page),
    text = "Meine noch nicht abgeschlossene Überarbeitung.";
  await startEdit(page, seed.review.id, text);
  await expect(
    reviewCard(page, seed.review.id).getByRole("button", {
      name: "Rückblick löschen",
      exact: true,
    }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Sammlung", exact: true }).click();
  await page.getByRole("button", { name: "Entwürfe", exact: true }).click();
  await page
    .getByRole("button", {
      name: `Entwurf fortsetzen: Rückblickbearbeitung: ${title}`,
      exact: true,
    })
    .click();
  await resume(page);
  await expect(
    page.getByRole("textbox", {
      name: "Deine überarbeiteten Worte",
      exact: true,
    }),
  ).toHaveValue(text);
  await expect(
    page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await resume(page);
  await expect(
    page.getByRole("textbox", {
      name: "Deine überarbeiteten Worte",
      exact: true,
    }),
  ).toHaveValue(text);
  expect((await localData(page)).goals[0]!.reviews).toEqual([seed.review]);
  await page
    .getByRole("button", { name: "Rückblickänderung speichern", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).goals[0]!.reviews[0]!.text)
    .toBe(text);
  expect((await localData(page)).goals[0]!.reviews).toHaveLength(1);
  expect((await localData(page)).growthStage).toBe(seed.growth);
});

test("nur unveränderte Rückblicke werden wieder verbunden; echte Konflikte bewahren beide Wortlaute", async ({
  page,
}) => {
  const seed = await create(page),
    first = "Meine behutsame Ergänzung.";
  await startEdit(page, seed.review.id, first);
  await externalChange(page, (d) => {
    d.goals[0]!.why = "Inzwischen anderer Anlass.";
    d.goals[0]!.revision++;
    d.goals[0]!.updatedAt = new Date().toISOString();
  });
  await page.reload();
  await resume(page);
  await page
    .getByRole("button", {
      name: "Entwurf mit aktuellem Stand verbinden",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Rückblickänderung speichern", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).goals[0]!.reviews[0]!.text)
    .toBe(first);
  expect((await localData(page)).goals[0]!.reviews[0]!.source).toEqual(
    seed.review.source,
  );
  const own = "Meine Worte bleiben mein Entwurf.",
    other = "Ein inzwischen gespeicherter anderer Wortlaut.";
  await startEdit(page, seed.review.id, own);
  await externalChange(page, (d) => {
    const goal = d.goals[0]!;
    goal.reviews[0]!.text = other;
    goal.reviews[0]!.updatedAt = new Date().toISOString();
    goal.revision++;
    goal.updatedAt = new Date().toISOString();
  });
  await page.reload();
  await resume(page);
  await expect(
    page.getByText("Der Rückblick wurde inzwischen verändert.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(other, { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("textbox", {
      name: "Deine überarbeiteten Worte",
      exact: true,
    }),
  ).toHaveValue(own);
  await expect(
    page.getByRole("button", {
      name: "Rückblickänderung speichern",
      exact: true,
    }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", {
      name: "Entwurf mit aktuellem Stand verbinden",
      exact: true,
    }),
  ).toHaveCount(0);
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Bearbeitungsentwurf exportieren",
      exact: true,
    })
    .click();
  const path = await (await download).path();
  expect(path).not.toBeNull();
  expect(JSON.parse(await readFile(path!, "utf8")).draft.values.text).toBe(own);
  expect((await localData(page)).goals[0]!.reviews[0]!.text).toBe(other);
});

test("Löschen braucht Bestätigung, verwirft Undo beim Verlassen und exportiert keinen gelöschten Rückblick", async ({
  page,
}) => {
  const seed = await create(page);
  await reviewCard(page, seed.review.id)
    .getByRole("button", { name: "Rückblick löschen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Rückblick behalten", exact: true })
    .click();
  expect((await localData(page)).goals[0]!.reviews).toEqual([seed.review]);
  await reviewCard(page, seed.review.id)
    .getByRole("button", { name: "Rückblick löschen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Rückblick jetzt löschen", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Rückblick wiederherstellen",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Profil und Einstellungen$/, exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Sicherung exportieren", exact: true })
    .click();
  const path = await (await download).path(),
    backup = JSON.parse(await readFile(path!, "utf8"));
  expect(backup.goals[0].reviews).toEqual([]);
  expect(JSON.stringify(backup)).not.toContain(seed.review.text);
  await page.goto(`/vorhaben/${seed.goal.id}`);
  await expect(
    page.getByRole("button", {
      name: "Rückblick wiederherstellen",
      exact: true,
    }),
  ).toHaveCount(0);
  expect((await localData(page)).goals[0]!.reviews).toEqual([]);
  expect((await localData(page)).growthStage).toBe(seed.growth);
});

test("archivierte und fehlende Ziele lassen eigene Entwurfsworte lesbar, exportierbar und verwerfbar", async ({
  page,
}) => {
  const seed = await create(page),
    text = "Diese offenen Worte sollen bleiben.";
  await startEdit(page, seed.review.id, text);
  await externalChange(page, (d) => {
    d.goals[0]!.archivedAt = new Date().toISOString();
    d.goals[0]!.revision++;
  });
  await page.reload();
  await resume(page);
  await expect(
    page.getByRole("textbox", {
      name: "Deine überarbeiteten Worte",
      exact: true,
    }),
  ).toHaveValue(text);
  await expect(
    page.getByRole("button", {
      name: "Rückblickänderung speichern",
      exact: true,
    }),
  ).toBeDisabled();
  await externalChange(page, (d) => {
    d.goals = [];
  });
  await page.reload();
  await expect(
    page.getByRole("textbox", {
      name: "Deine überarbeiteten Worte",
      exact: true,
    }),
  ).toHaveValue(text);
  await expect(
    page.getByText(/Der zugehörige Rückblick ist nicht mehr vorhanden/),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Bearbeitungsentwurf exportieren",
      exact: true,
    })
    .click();
  const path = await (await download).path();
  expect(JSON.parse(await readFile(path!, "utf8")).draft.values.text).toBe(
    text,
  );
  await page
    .getByRole("button", { name: "Entwurf verwerfen", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Entwurf endgültig verwerfen", exact: true })
    .click();
  await expect.poll(async () => (await localData(page)).drafts.length).toBe(0);
  expect((await localData(page)).goals).toEqual([]);
  expect((await localData(page)).growthStage).toBe(seed.growth);
});

test("Rückblickeditor bleibt auf kleinen und großen Displays sowie in Hell und Dunkel lesbar", async ({
  page,
}) => {
  const seed = await create(page),
    text =
      "Meine neue Frage darf auch auf einem kleinen Bildschirm Platz haben.";
  await startEdit(page, seed.review.id, text);
  const output = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/screens`;
  await mkdir(output, { recursive: true });
  for (const [width, theme, name] of [
    [320, "light", "review-edit-mobile-light"],
    [390, "dark", "review-edit-mobile-dark"],
    [1440, "light", "review-edit-desktop"],
  ] as const) {
    await page.setViewportSize({ width, height: 844 });
    const toggle = page.getByRole("button", {
      name:
        theme === "dark"
          ? "Dunklen Modus aktivieren"
          : "Hellen Modus aktivieren",
      exact: true,
    });
    if (await toggle.count()) await toggle.click();
    await expect
      .poll(async () => (await localData(page)).settings.theme)
      .toBe(theme);
    await expect(
      page.getByRole("textbox", {
        name: "Deine überarbeiteten Worte",
        exact: true,
      }),
    ).toHaveValue(text);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
  }
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
  await page
    .getByRole("button", { name: "Rückblickänderung speichern", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).goals[0]!.reviews[0]!.text)
    .toBe(text);
  await page.setViewportSize({ width: 390, height: 844 });
  await reviewCard(page, seed.review.id)
    .getByRole("button", { name: "Rückblick löschen", exact: true })
    .click();
  await page.screenshot({
    path: `${output}/review-delete-mobile.png`,
    fullPage: true,
  });
  expect((await localData(page)).growthStage).toBe(seed.growth);
});

test("ein während des Verlassens abgeschlossener Löschvorgang lässt kein Undo zurück", async ({
  page,
}) => {
  const seed = await create(page);
  await reviewCard(page, seed.review.id)
    .getByRole("button", { name: "Rückblick löschen", exact: true })
    .click();
  await page.evaluate(() => {
    const prototype = IDBTransaction.prototype;
    const property = Object.getOwnPropertyDescriptor(prototype, "oncomplete")!;
    let armed = true;
    Object.defineProperty(prototype, "oncomplete", {
      configurable: true,
      get: property.get,
      set(handler) {
        if (armed && this.mode === "readwrite") {
          armed = false;
          property.set!.call(this, (event: Event) => {
            (window as any).__finishReviewDelete = () => {
              Object.defineProperty(prototype, "oncomplete", property);
              handler.call(this, event);
            };
          });
        } else property.set!.call(this, handler);
      },
    });
  });
  await page
    .getByRole("button", { name: "Rückblick jetzt löschen", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => typeof (window as any).__finishReviewDelete),
    )
    .toBe("function");
  await page
    .getByRole("button", { name: /Profil und Einstellungen$/, exact: true })
    .click();
  await expect(page).toHaveURL(/\/einstellungen$/);
  await page.evaluate(() => (window as any).__finishReviewDelete());
  await expect
    .poll(async () => (await localData(page)).goals[0]!.reviews.length)
    .toBe(0);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Rückblick wiederherstellen",
      exact: true,
    }),
  ).toHaveCount(0);
  expect((await localData(page)).growthStage).toBe(seed.growth);
});
