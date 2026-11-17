# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: topics.spec.ts >> Wechsel von drei zu zwei Schritten bewahrt unterschiedliche Gedanken zur selben Bibelstelle
- Location: tests/e2e/topics.spec.ts:99:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('textbox', { name: 'Deine Reflexion (freiwillig)', exact: true }).visible()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('textbox', { name: 'Deine Reflexion (freiwillig)', exact: true }).visible() with timeout 15000ms
  - waiting for getByRole('textbox', { name: 'Deine Reflexion (freiwillig)', exact: true }).visible()

```

```yaml
- banner:
  - img
  - text: OLIVA
  - button "Dunklen Modus aktivieren":
    - img
  - button "Du · Profil und Einstellungen": Du
- main:
  - button "Zurück zu den Themen":
    - img
  - text: Ein Thema aus deinem Leben
  - img
  - text: 3 Bibelabschnitte · in deinem Tempo
  - heading "Streit & Konflikte" [level=1]
  - text: Wenn es zwischen dir und anderen schwierig ist Du liest ausgewählte Bibeltexte und die ursprünglichen FaithPath-Einordnungen. Deine Gedanken sind freiwillig. Du kannst jederzeit pausieren. EIN KLEINER SCHRITT NACH DEM ANDEREN
  - progressbar "0 von 3 Schritten abgeschlossen"
  - text: 0 von 3 Schritten · ohne Zeitdruck
  - button "1 Jakobus 1,19–20 Lesen · Einordnen · Nachdenken":
    - text: 1 Jakobus 1,19–20 Lesen · Einordnen · Nachdenken
    - img
  - button "2 Römer 12,17–21 Lesen · Einordnen · Nachdenken":
    - text: 2 Römer 12,17–21 Lesen · Einordnen · Nachdenken
    - img
  - button "3 Epheser 4,26–32 Lesen · Einordnen · Nachdenken":
    - text: 3 Epheser 4,26–32 Lesen · Einordnen · Nachdenken
    - img
  - text: SCHRITT 1 · MIT DEM BIBELTEXT BEGINNEN Jakobus 1,19–20 Lies zuerst Jakobus 1,19–20. Bestätige am Ende selbst, dass du den Abschnitt gelesen hast. Danach geht es hier mit der Einordnung weiter.
  - button "Abschnitt lesen":
    - text: Abschnitt lesen
    - img
  - text: Einordnungen und Reflexionsfragen stammen aus der FaithPath-Vorarbeit. Ergänzende OLIVA-Hinweise sind getrennt gekennzeichnet. Eine unabhängige theologische und historische Freigabe vor einer öffentlichen Veröffentlichung steht aus.
- navigation "Hauptnavigation":
  - button "Heute":
    - img
    - text: Heute
  - button "Bibel":
    - img
    - text: Bibel
  - button "Wege":
    - img
    - text: Wege
  - button "Mein Garten":
    - img
    - text: Mein Garten
  - button "Sammlung":
    - img
    - text: Sammlung
- text: Für den Offline-Neustart bereit.
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { mkdirSync, readFileSync } from "node:fs";
  4   | import { localData, rawData } from "./persistence";
  5   | 
  6   | const topics = JSON.parse(readFileSync("src/data/life-topics.json", "utf8")).topics as any[];
  7   | const topic = (id: string) => topics.find((t) => t.sourceId === id)!;
  8   | const button = (page: Page, name: string | RegExp) => page.getByRole("button", { name, exact: typeof name === "string" }).filter({ visible: true });
  9   | const thought = (page: Page) => page.getByRole("textbox", { name: "Deine Reflexion (freiwillig)", exact: true }).filter({ visible: true });
  10  | async function open(page: Page, id: string, step = 0) {
  11  |   await page.goto(`/weg/faithpath-topic-${id}?step=${step}`);
  12  |   await expect(button(page, "Abschnitt lesen")).toBeVisible();
  13  | }
  14  | async function read(page: Page) {
  15  |   await button(page, "Abschnitt lesen").click();
  16  |   await expect(page.getByTestId("reader-flow")).toBeVisible();
  17  |   await button(page, "Abschnitt als gelesen bestätigen").click();
  18  |   await button(page, "Weiter zum Verstehen").click();
> 19  |   await expect(thought(page)).toBeVisible();
      |                               ^ Error: expect(locator).toBeVisible() failed
  20  | }
  21  | 
  22  | test("alle 18 Originalthemen bleiben von den neun Wegen getrennt; reines Entdecken speichert keinen Fortschritt", async ({ page }) => {
  23  |   await page.goto("/wege");
  24  |   await button(page, "18 Lebensthemen entdecken").click();
  25  |   await expect(page.getByText("18 Themen", { exact: true })).toBeVisible();
  26  |   for (const t of topics) await expect(button(page, `${t.title}, ${t.steps.length} Bibelabschnitte`)).toHaveCount(1);
  27  |   await page.getByRole("textbox", { name: "Ein Thema finden", exact: true }).fill(" über forde rung ");
  28  |   await expect(page.getByText("1 Thema", { exact: true })).toBeVisible();
  29  |   await button(page, "Überforderung & Ruhe, 3 Bibelabschnitte").click();
  30  |   await expect(button(page, "Abschnitt lesen")).toBeVisible();
  31  |   await expect(button(page, "Ein freiwilliges Gebet")).toHaveCount(0);
  32  |   expect(await rawData(page)).toBeUndefined();
  33  |   await button(page, "Zurück zu den Themen").click();
  34  |   await button(page, "Zu den Wegen").click();
  35  |   await expect(button(page, /Ich bin neu im Glauben/)).toBeVisible();
  36  |   expect(await rawData(page)).toBeUndefined();
  37  | });
  38  | 
  39  | test("ein vollständiges Thema mit zwei Schritten bestätigt nur echte Leseaktionen und lässt Reflexion freiwillig", async ({ page }) => {
  40  |   await open(page, "wut");
  41  |   for (let i = 0; i < 2; i++) {
  42  |     await read(page);
  43  |     await expect(page.getByText(topic("wut").steps[i].explanation, { exact: true })).toBeVisible();
  44  |     await expect(button(page, "Ein freiwilliges Gebet")).toHaveCount(0);
  45  |     await button(page, "Ohne Reflexion abschließen").click();
  46  |     await expect.poll(async () => (await localData(page)).completedSteps.length).toBe(i + 1);
  47  |     if (i === 0) await button(page, "Zum nächsten Schritt").click();
  48  |   }
  49  |   await expect(page.getByText("Ein Thema ist entdeckt", { exact: true })).toBeVisible();
  50  |   const data = await localData(page);
  51  |   expect(data.version).toBe(11); expect(data.readChapters).toEqual([]);
  52  |   expect(data.readSteps).toEqual(["faithpath-topic-wut:0", "faithpath-topic-wut:1"]);
  53  |   expect(data.completedSteps).toEqual(data.readSteps); expect(data.notes).toEqual([]);
  54  |   expect(data.readPassages).toEqual(["JAS:1:19:20", "EPH:4:26:27"]);
  55  |   expect(data.storyStudy.answers).toEqual({});
  56  |   await page.goto("/"); await expect(button(page, "Dein Thema fortsetzen")).toBeVisible();
  57  |   await button(page, "Dein Thema fortsetzen").click();
  58  |   await expect(page.getByText("Ein Thema ist entdeckt", { exact: true })).toBeVisible();
  59  | });
  60  | 
  61  | test("originaler Arbeitskontext und getrennte OLIVA-Einordnung bleiben im Entwurf und in der Sammlung erhalten", async ({ page }) => {
  62  |   await open(page, "arbeit");
  63  |   await button(page, "Abschnitt lesen").click();
  64  |   await expect(page.getByTestId("reader-flow")).toBeVisible();
  65  |   await expect(page).toHaveURL(/from=22/); await expect(page).toHaveURL(/to=24/);
  66  |   await button(page, "Tiefer verstehen").click();
  67  |   await expect(page.getByText("ORIGINALE FAITHPATH-EINORDNUNG · KEIN BIBELTEXT", { exact: true })).toBeVisible();
  68  |   await expect(page.getByText(/Diese Worte stehen in einer antiken Haustafel/)).toBeVisible();
  69  |   await expect(button(page, "Eine kleine Frage zum Text")).toHaveCount(0);
  70  |   await button(page, "Abschnitt als gelesen bestätigen").click();
  71  |   await button(page, "Weiter zum Verstehen").click();
  72  |   const text = "Meine Arbeit und die Würde anderer.\nEin noch unfertiger Gedanke.";
  73  |   await thought(page).fill(text);
  74  |   await expect.poll(async () => (await localData(page)).drafts.length).toBe(1);
  75  |   const draft = (await localData(page)).drafts[0]!;
  76  |   const source = (draft.values as any).source;
  77  |   expect(source.snapshot.title).toBe("Arbeit & Berufung · Kolosser 3,22–24");
  78  |   expect(source.snapshot.explanation).toContain(topic("arbeit").steps[0].explanation);
  79  |   expect(source.snapshot.explanation).toContain("Ergänzender OLIVA-Hinweis:");
  80  |   expect(source.snapshot.explanation).toContain("versklavte Menschen");
  81  |   expect((await localData(page)).completedSteps).toEqual([]);
  82  |   await page.goto("/sammlung?tab=Entw%C3%BCrfe");
  83  |   await button(page, /Entwurf fortsetzen:.*Arbeit & Berufung/).click();
  84  |   await expect(thought(page)).toHaveValue(text);
  85  |   await page.reload(); await expect(thought(page)).toHaveValue(text);
  86  |   await button(page, "Reflexion speichern & Schritt abschließen").click();
  87  |   await expect.poll(async () => (await localData(page)).notes.length).toBe(1);
  88  |   const note = (await localData(page)).notes[0]!;
  89  |   expect(note.captureSource).toEqual(source); expect(note.text).toBe(text);
  90  |   expect((await localData(page)).completedSteps).toEqual(["faithpath-topic-arbeit:0"]);
  91  |   await page.goto("/sammlung");
  92  |   await button(page, "Bearbeiten").click();
  93  |   await page.getByRole("textbox", { name: "Deine Worte", exact: true }).fill("Weitergedacht, ohne die Herkunft zu verändern.");
  94  |   await button(page, "Gedanken speichern").click();
  95  |   await expect.poll(async () => (await localData(page)).notes[0]?.text).toBe("Weitergedacht, ohne die Herkunft zu verändern.");
  96  |   expect((await localData(page)).notes[0]?.captureSource).toEqual(source);
  97  | });
  98  | 
  99  | test("Wechsel von drei zu zwei Schritten bewahrt unterschiedliche Gedanken zur selben Bibelstelle", async ({ page }) => {
  100 |   await open(page, "streit", 2);
  101 |   await read(page); await thought(page).fill("Mein dritter Konfliktschritt.");
  102 |   await button(page, "Zurück zu den Themen").click();
  103 |   await button(page, "Wut, 2 Bibelabschnitte").click();
  104 |   await read(page); await thought(page).fill("Meine Wut beim Zuhören.");
  105 |   await button(page, "Zurück zu den Themen").click();
  106 |   await button(page, "Streit & Konflikte, 3 Bibelabschnitte").click();
  107 |   await read(page); await thought(page).fill("Mein erster Konfliktschritt beim Zuhören.");
  108 |   await expect.poll(async () => (await localData(page)).drafts.length).toBe(3);
  109 |   const drafts = (await localData(page)).drafts;
  110 |   const a = drafts.find((d) => d.key === "capture:guided:faithpath-topic-streit:0")!,
  111 |     b = drafts.find((d) => d.key === "capture:guided:faithpath-topic-wut:0")!;
  112 |   expect((a.values as any).source.snapshot.ref).toEqual((b.values as any).source.snapshot.ref);
  113 |   expect((a.values as any).source.snapshot.title).not.toBe((b.values as any).source.snapshot.title);
  114 |   await page.goto("/sammlung?tab=Entw%C3%BCrfe");
  115 |   await button(page, /Entwurf fortsetzen:.*Wut/).click();
  116 |   await expect(thought(page)).toHaveValue("Meine Wut beim Zuhören.");
  117 |   expect((await localData(page)).completedSteps).toEqual([]);
  118 | });
  119 | 
```