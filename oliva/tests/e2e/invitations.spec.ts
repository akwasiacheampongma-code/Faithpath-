import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import type { AppData } from "../../src/state/model";
import { localData, rawData } from "./persistence";

test.use({ screenshot: "only-on-failure" });
const now = Date.parse("2026-11-08T12:00:00.000Z"),
  day = 86400000;
const ago = (days: number) => new Date(now - days * day).toISOString();
const goalTitle = "Wieder Raum zum Zuhören";
const noteText =
  "Meine frühere Frage darf bleiben. Auch nach einer Pause kann ich in Ruhe weiterdenken.";
const visible = (page: Page, id: string) =>
  page.getByTestId(id).filter({ visible: true });
const setting = (page: Page) =>
  page.getByRole("switch", {
    name: "Einladungen in der App erlauben",
    exact: true,
  });
const goalCard = (page: Page) => visible(page, "invitation-goal:g1");
const noteCard = (page: Page) => visible(page, "invitation-note:n1");

/** Synthetic local history, independent of the app decoder. No real user data. */
function fixture(): AppData {
  return {
    version: 7,
    revision: 8,
    name: "Ada",
    onboarded: true,
    reading: { book: "MRK", chapter: 4 },
    readingPosition: null,
    readChapters: ["MRK:4"],
    readPassages: ["MRK:4:35:41"],
    readSteps: [],
    completedSteps: [],
    activePath: null,
    bookmarks: ["MRK:4:35"],
    highlights: { "MRK:4:36": "gold" },
    growthStage: 4,
    retainedReviewGrowth: { reflections: 2, actions: 1 },
    settings: {
      theme: "light",
      fontSize: 20,
      lineHeight: 1.8,
      reducedMotion: false,
    },
    imports: [],
    drafts: [],
    invitations: { enabled: false, snoozed: {}, dismissed: {} },
    goals: [
      {
        id: "g1",
        title: goalTitle,
        why: "Ein Mensch braucht Zeit für seine eigenen Worte.",
        createdAt: ago(21),
        updatedAt: new Date(now).toISOString(),
        archivedAt: null,
        revision: 2,
        ref: { book: "JHN", chapter: 6 },
        steps: [
          {
            id: "s1",
            text: "Eine Frage stellen und ausreden lassen.",
            done: false,
            createdAt: ago(21),
            completedAt: null,
          },
        ],
        reviews: [
          {
            id: "r1",
            text: "Meine damaligen Worte.",
            createdAt: ago(21),
            updatedAt: new Date(now).toISOString(),
            applied: true,
            source: {
              title: "Mein damaliges Anliegen",
              why: "Damals zuhören",
              steps: [],
            },
          },
        ],
      },
    ],
    notes: [
      {
        id: "n1",
        text: noteText,
        kind: "reflection",
        createdAt: ago(35),
        updatedAt: ago(35),
      },
    ],
  };
}
async function putMain(page: Page, value: unknown) {
  await page.evaluate(
    (value) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("oliva-local-v1", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction("state", "readwrite");
          tx.objectStore("state").put(value, "main");
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onabort = tx.onerror = () => {
            db.close();
            reject(tx.error);
          };
        };
      }),
    value,
  );
}
async function ready(page: Page) {
  await expect(
    page.getByRole("heading", { name: "Was dir wichtig bleibt.", exact: true }),
  ).toBeVisible();
}
async function seed(
  page: Page,
  options: {
    legacy?: boolean;
    enabled?: boolean;
    at?: number;
    change?: (data: AppData) => void;
  } = {},
) {
  // Date is fixed while native timers continue to run, including real SW/IDB work.
  await page.clock.setFixedTime(new Date(options.at ?? now));
  await page.goto("/einstellungen");
  await expect(setting(page)).not.toBeChecked();
  const data = fixture();
  data.invitations.enabled = options.enabled ?? false;
  options.change?.(data);
  const { invitations, ...old } = data;
  const raw = {
    storageVersion: 1,
    data: options.legacy ? { ...old, version: 6 } : data,
  };
  await putMain(page, raw);
  await page.goto("/einladungen");
  await ready(page);
  return { data, raw };
}
function personalFields(data: any) {
  const { invitations, revision, version, ...personal } = data;
  return personal;
}
async function unchangedExperience(page: Page, before: AppData) {
  const data = await localData(page);
  for (const key of [
    "notes",
    "goals",
    "reading",
    "readingPosition",
    "readChapters",
    "readPassages",
    "readSteps",
    "completedSteps",
    "growthStage",
    "retainedReviewGrowth",
    "bookmarks",
    "highlights",
  ] as const)
    expect(data[key], key).toEqual(before[key]);
}

test("V6 bleibt beim Öffnen unverändert und ausgeschaltet; erst freiwilliges Opt-in schreibt V7 und erschließt die Startseiteneinladung", async ({
  page,
}) => {
  const { raw } = await seed(page, { legacy: true });
  await expect(setting(page)).not.toBeChecked();
  await expect(visible(page, "due-invitations")).toHaveCount(0);
  expect(await rawData(page)).toEqual(raw);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Ein Moment, der bleibt.", exact: true }),
  ).toBeVisible();
  await expect(visible(page, "home-invitation")).toHaveCount(0);
  expect(await rawData(page)).toEqual(raw);
  await page.goto("/einstellungen");
  await expect(setting(page)).not.toBeChecked();
  expect(await rawData(page)).toEqual(raw);
  await setting(page).click();
  await expect
    .poll(async () => (await localData(page)).invitations.enabled)
    .toBe(true);
  const written = await localData(page);
  expect(written.version).toBe(7);
  expect(written.revision).toBe(raw.data.revision + 1);
  expect(personalFields(written)).toEqual(personalFields(raw.data));
  await page.goto("/");
  await expect(visible(page, "home-invitation")).toBeVisible();
  const beforeNavigation = await rawData(page);
  await visible(page, "home-invitation")
    .getByRole("button", { name: "In Ruhe ansehen", exact: true })
    .click();
  await ready(page);
  await expect(goalCard(page)).toBeVisible();
  await expect(noteCard(page)).toBeVisible();
  expect(await rawData(page)).toEqual(beforeNavigation);
});

test("die tatsächliche Oberfläche beachtet exakt 21 und 35 Tage, neue Belege und archivierte Vorhaben ohne Schreibzugriff", async ({
  page,
}) => {
  const { raw } = await seed(page, {
    enabled: true,
    at: now - 1,
    change: (data) => {
      const recent = structuredClone(data.goals[0]!);
      recent.id = "g-recent";
      recent.createdAt = new Date(now - 21 * day + 1).toISOString();
      const archived = structuredClone(data.goals[0]!);
      archived.id = "g-archive";
      archived.archivedAt = ago(1);
      const linked = structuredClone(data.goals[0]!);
      linked.id = "g-linked";
      data.goals.push(recent, archived, linked);
      data.notes.push(
        {
          id: "n-recent",
          text: "Noch frisch",
          kind: "note",
          createdAt: new Date(now - 35 * day + 1).toISOString(),
          updatedAt: new Date(now - 35 * day + 1).toISOString(),
        },
        {
          id: "n-linked",
          text: "Ein neuer verknüpfter Gedanke",
          kind: "note",
          createdAt: ago(1),
          updatedAt: ago(1),
          goalIds: ["g-linked"],
        },
      );
    },
  });
  await expect(
    page.getByText("Gerade ist Raum für Neues.", { exact: true }),
  ).toBeVisible();
  expect(await rawData(page)).toEqual(raw);
  await page.clock.setFixedTime(new Date(now));
  await page.reload();
  await ready(page);
  await expect(
    visible(page, "due-invitations").locator('[data-testid^="invitation-"]'),
  ).toHaveCount(2);
  await expect(goalCard(page)).toBeVisible();
  await expect(noteCard(page)).toBeVisible();
  for (const key of [
    "goal:g-recent",
    "goal:g-archive",
    "goal:g-linked",
    "note:n-recent",
    "note:n-linked",
  ])
    await expect(visible(page, `invitation-${key}`)).toHaveCount(0);
  // The fresh title/review correction dates do not count as a new experience.
  expect(await rawData(page)).toEqual(raw);
});

test("Zurückstellen, Ausblenden und Wiederzulassen überleben Offline-Neustart; Ausschalten bewahrt Entscheidungen und Quellen", async ({
  page,
  context,
}) => {
  const { data } = await seed(page, { enabled: true });
  await goalCard(page)
    .getByRole("button", { name: "Für 14 Tage zurückstellen", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).invitations.snoozed["goal:g1"])
    .toBe("2026-11-22T12:00:00.000Z");
  await noteCard(page)
    .getByRole("button", { name: "Einladung ausblenden", exact: true })
    .click();
  await expect
    .poll(async () => (await localData(page)).invitations.dismissed["note:n1"])
    .toBe("2026-11-08T12:00:00.000Z");
  await setting(page).click();
  await expect
    .poll(async () => (await localData(page)).invitations.enabled)
    .toBe(false);
  const beforeReload = await rawData(page);
  await expect(
    page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await ready(page);
  await expect(setting(page)).not.toBeChecked();
  await expect(visible(page, "due-invitations")).toHaveCount(0);
  await expect(goalCard(page).getByText(/Zurückgestellt bis/)).toBeVisible();
  await expect(
    noteCard(page).getByText("Von dir ausgeblendet", { exact: true }),
  ).toBeVisible();
  expect(await rawData(page)).toEqual(beforeReload);
  await noteCard(page)
    .getByRole("button", { name: "Wieder zulassen", exact: true })
    .click();
  await expect(
    page.getByText(
      "Wieder zugelassen. Einladungen bleiben insgesamt ausgeschaltet.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect
    .poll(async () => (await localData(page)).invitations.dismissed)
    .toEqual({});
  await expect(setting(page)).not.toBeChecked();
  await setting(page).click();
  await expect(
    noteCard(page).getByRole("button", {
      name: "Einladung ausblenden",
      exact: true,
    }),
  ).toBeVisible();
  await goalCard(page)
    .getByRole("button", { name: "Wieder zulassen", exact: true })
    .click();
  await expect(
    goalCard(page).getByRole("button", {
      name: "Für 14 Tage zurückstellen",
      exact: true,
    }),
  ).toBeVisible();
  expect((await localData(page)).invitations).toEqual({
    enabled: true,
    snoozed: {},
    dismissed: {},
  });
  await unchangedExperience(page, data);
  expect(personalFields(await localData(page))).toEqual(personalFields(data));
});

test("Quellenlinks zeigen das richtige Vorhaben und den Gedanken schreibfrei, auch wenn bereits ein anderer Entwurf besteht", async ({
  page,
}) => {
  const draftText = "Meine unvollendeten anderen Worte.";
  const { data, raw } = await seed(page, {
    enabled: true,
    change: (data) => {
      data.drafts = [
        {
          id: "existing-draft",
          key: "journal",
          type: "journal",
          revision: 2,
          updatedAt: new Date(now).toISOString(),
          values: {
            entityId: "new-thought",
            targetId: null,
            baseUpdatedAt: null,
            text: draftText,
            kind: "note",
          },
        },
      ];
    },
  });
  await goalCard(page)
    .getByRole("button", { name: "Zum Vorhaben", exact: true })
    .click();
  await expect(page).toHaveURL(/\/vorhaben\/g1(?:\?|$)/);
  await expect(
    page.getByRole("heading", { name: goalTitle, exact: true }),
  ).toBeVisible();
  expect(await rawData(page)).toEqual(raw);
  await page.goBack();
  await ready(page);
  await noteCard(page)
    .getByRole("button", { name: "Gedanken öffnen", exact: true })
    .click();
  await expect(page).toHaveURL(/\/sammlung\?note=n1&view=read/);
  const thought = visible(page, "collection-note-n1");
  await expect(
    thought.getByText("Dein wiederentdeckter Gedanke", { exact: true }),
  ).toBeVisible();
  await expect(thought.getByText(noteText, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).toHaveCount(0);
  expect(await rawData(page)).toEqual(raw);
  await thought
    .getByRole("button", { name: "Bearbeiten", exact: true })
    .click();
  await expect(
    page.getByText(
      "Du hast einen anderen Entwurf. Setze ihn fort oder verwirf ihn im Editor ausdrücklich, bevor du einen anderen Gedanken bearbeitest.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  ).toHaveValue(draftText);
  expect((await localData(page)).drafts).toEqual(data.drafts);
  await unchangedExperience(page, data);
});

test("Einladungen bleiben bei 320 Pixeln in Hell und Dunkel sowie auf großem Display zugänglich und ohne Überlauf", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { data } = await seed(page, {
    enabled: true,
    change: (data) => {
      data.settings.reducedMotion = true;
    },
  });
  const screens = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/invitations/screens`;
  await mkdir(screens, { recursive: true });
  for (const [width, theme] of [
    [320, "light"],
    [320, "dark"],
    [1440, "light"],
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
    await expect(goalCard(page)).toBeVisible();
    const action = goalCard(page).getByRole("button", {
      name: "Für 14 Tage zurückstellen",
      exact: true,
    });
    await action.scrollIntoViewIfNeeded();
    const bounds = await action.boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `${screens}/invitations-${width}-${theme}.png`,
      fullPage: true,
    });
    const axe = await new AxeBuilder({ page }).analyze();
    expect(axe.violations).toEqual([]);
  }
  expect((await localData(page)).settings.reducedMotion).toBe(true);
  await unchangedExperience(page, data);
});

test("ein echter konkurrierender IndexedDB-Stand wird beim Ausblenden aus einer alten Ansicht nicht überschrieben", async ({
  page,
}) => {
  const { raw } = await seed(page, { enabled: true });
  const changed = structuredClone(raw);
  changed.data.goals[0]!.title = "In einem anderen Fenster weitergedacht";
  changed.data.goals[0]!.revision++;
  changed.data.revision++;
  await putMain(page, changed);
  await goalCard(page)
    .getByRole("button", { name: "Einladung ausblenden", exact: true })
    .click();
  await expect(
    page.getByText(
      "Ein anderes Fenster hat die Daten geändert. Lade die App neu; deine Eingabe bleibt hier erhalten.",
      { exact: true },
    ),
  ).toBeVisible();
  expect(await rawData(page)).toEqual(changed);
  await expect(
    goalCard(page).getByRole("button", {
      name: "Einladung ausblenden",
      exact: true,
    }),
  ).toBeEnabled();
  await page.reload();
  await ready(page);
  await expect(
    goalCard(page).getByRole("heading", {
      name: changed.data.goals[0]!.title,
      exact: true,
    }),
  ).toBeVisible();
  expect(await rawData(page)).toEqual(changed);
});
