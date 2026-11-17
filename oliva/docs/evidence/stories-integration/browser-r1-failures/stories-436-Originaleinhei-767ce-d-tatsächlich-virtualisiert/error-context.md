# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stories.spec.ts >> 436 Originaleinheiten sind auffindbar, standardmäßig gesamte Bibel und tatsächlich virtualisiert
- Location: tests/e2e/stories.spec.ts:20:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Bibelbereich', exact: true }).visible()

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e10]:
    - banner [ref=e11]:
      - generic [ref=e12]: OLIVA
      - generic [ref=e19]:
        - button "Dunklen Modus aktivieren" [ref=e20] [cursor=pointer]
        - button "Du · Profil und Einstellungen" [ref=e23] [cursor=pointer]:
          - generic [ref=e24]: Du
    - main [ref=e25]:
      - generic [ref=e27]:
        - generic [ref=e29]:
          - generic [ref=e30]: BIBEL ENTDECKEN
          - heading "Ein Text. Ein neuer Blick." [level=1] [ref=e31]
          - generic [ref=e32]: Geschichten, Gebete und Gedanken der Bibel. Du brauchst kein Vorwissen.
          - generic [ref=e33]:
            - generic [ref=e34]:
              - 'img "Künstlerische Interpretation: Ein kleiner Anfang in Bethlehem. Raum, Gesichter, Kleidung und Anzahl der Hirten sind künstlerische Interpretation; keine Rekonstruktion der Geburt." [ref=e37]'
              - generic [ref=e40]: KI-Illustration · künstlerische Interpretation. Fachfreigabe steht aus.
            - generic [ref=e41]:
              - generic [ref=e42]: EINE BEGEGNUNG ZUM ANFANG
              - generic [ref=e43]: In der Krippe
              - generic [ref=e44]: Lukas 2,1–20
              - generic [ref=e45]: Gott begegnet Menschen mitten im Alltag.
              - button "Geschichte entdecken" [ref=e46] [cursor=pointer]
          - generic [ref=e50]:
            - generic [ref=e52]:
              - generic [ref=e53]: Titel oder Bibelstelle
              - textbox "Titel oder Bibelstelle" [ref=e54]:
                - /placeholder: Was möchtest du entdecken?
            - generic [ref=e56]:
              - generic [ref=e57]: Bibelbereich
              - combobox "Bibelbereich" [ref=e58] [cursor=pointer]:
                - option "Gesamte Bibel" [selected]
                - option "Neues Testament (NT)"
                - option "Altes Testament (AT)"
          - group "Abschnitte filtern" [ref=e59]:
            - button "Alle Abschnitte" [ref=e60] [cursor=pointer]
            - button "Mit Bild" [ref=e62] [cursor=pointer]
            - button "Psalmen & Briefe" [ref=e64] [cursor=pointer]
          - button "Nach Bibelbuch filtern" [ref=e67] [cursor=pointer]
          - generic [ref=e71]:
            - generic [ref=e72]: Durch die Bibel
            - generic [ref=e73]: 436 Abschnitte
        - button "Am Anfang, 1. Mose 1,1–31" [ref=e75] [cursor=pointer]:
          - generic [ref=e76]:
            - generic [ref=e77]: "1"
            - generic [ref=e78]: GEN
          - generic [ref=e79]:
            - generic [ref=e80]: Bibelabschnitt
            - generic [ref=e81]: Am Anfang
            - generic [ref=e82]: 1. Mose 1,1–31 · 5 Fragen
        - button "Der Garten Eden, 1. Mose 2,7–25" [ref=e86] [cursor=pointer]:
          - generic [ref=e87]:
            - generic [ref=e88]: "2"
            - generic [ref=e89]: GEN
          - generic [ref=e90]:
            - generic [ref=e91]: Bibelabschnitt
            - generic [ref=e92]: Der Garten Eden
            - generic [ref=e93]: 1. Mose 2,7–25 · 5 Fragen
        - button "Wo bist du?, 1. Mose 3,1–24" [ref=e97] [cursor=pointer]:
          - generic [ref=e98]:
            - generic [ref=e99]: "3"
            - generic [ref=e100]: GEN
          - generic [ref=e101]:
            - generic [ref=e102]: Bibelabschnitt
            - generic [ref=e103]: Wo bist du?
            - generic [ref=e104]: 1. Mose 3,1–24 · 5 Fragen
        - button "Soll ich meines Bruders Hüter sein?, 1. Mose 4,1–16" [ref=e108] [cursor=pointer]:
          - generic [ref=e109]:
            - generic [ref=e110]: "4"
            - generic [ref=e111]: GEN
          - generic [ref=e112]:
            - generic [ref=e113]: Bibelabschnitt
            - generic [ref=e114]: Soll ich meines Bruders Hüter sein?
            - generic [ref=e115]: 1. Mose 4,1–16 · 5 Fragen
        - button "Noah tat alles, was ihm Gott gebot, 1. Mose 6,5–22" [ref=e119] [cursor=pointer]:
          - generic [ref=e120]:
            - generic [ref=e121]: "6"
            - generic [ref=e122]: GEN
          - generic [ref=e123]:
            - generic [ref=e124]: Bibelabschnitt
            - generic [ref=e125]: Noah tat alles, was ihm Gott gebot
            - generic [ref=e126]: 1. Mose 6,5–22 · 5 Fragen
        - button "Da gedachte Gott an Noah, 1. Mose 8,1–22" [ref=e130] [cursor=pointer]:
          - generic [ref=e133]:
            - generic [ref=e134]: Bibelabschnitt
            - generic [ref=e135]: Da gedachte Gott an Noah
            - generic [ref=e136]: 1. Mose 8,1–22 · 5 Fragen
        - button "Der Bogen in den Wolken, 1. Mose 9,8–17" [ref=e140] [cursor=pointer]:
          - generic [ref=e141]:
            - generic [ref=e142]: "9"
            - generic [ref=e143]: GEN
          - generic [ref=e144]:
            - generic [ref=e145]: Bibelabschnitt
            - generic [ref=e146]: Der Bogen in den Wolken
            - generic [ref=e147]: 1. Mose 9,8–17 · 5 Fragen
        - button "Wohlauf, lasst uns einen Turm bauen, 1. Mose 11,1–9" [ref=e151] [cursor=pointer]:
          - generic [ref=e152]:
            - generic [ref=e153]: "11"
            - generic [ref=e154]: GEN
          - generic [ref=e155]:
            - generic [ref=e156]: Bibelabschnitt
            - generic [ref=e157]: Wohlauf, lasst uns einen Turm bauen
            - generic [ref=e158]: 1. Mose 11,1–9 · 5 Fragen
        - button "Gehe aus deinem Vaterlande, 1. Mose 12,1–9" [ref=e162] [cursor=pointer]:
          - generic [ref=e163]:
            - generic [ref=e164]: "12"
            - generic [ref=e165]: GEN
          - generic [ref=e166]:
            - generic [ref=e167]: Bibelabschnitt
            - generic [ref=e168]: Gehe aus deinem Vaterlande
            - generic [ref=e169]: 1. Mose 12,1–9 · 5 Fragen
        - button "Abram glaubte dem HERRN, 1. Mose 15,1–6" [ref=e173] [cursor=pointer]:
          - generic [ref=e176]:
            - generic [ref=e177]: Bibelabschnitt
            - generic [ref=e178]: Abram glaubte dem HERRN
            - generic [ref=e179]: 1. Mose 15,1–6 · 5 Fragen
        - button "Sollte dem HERRN etwas unmöglich sein?, 1. Mose 18,1–15" [ref=e183] [cursor=pointer]:
          - generic [ref=e184]:
            - generic [ref=e185]: "18"
            - generic [ref=e186]: GEN
          - generic [ref=e187]:
            - generic [ref=e188]: Bibelabschnitt
            - generic [ref=e189]: Sollte dem HERRN etwas unmöglich sein?
            - generic [ref=e190]: 1. Mose 18,1–15 · 5 Fragen
        - button "Gott wird sich ersehen ein Schaf, 1. Mose 22,1–19" [ref=e194] [cursor=pointer]:
          - generic [ref=e195]:
            - generic [ref=e196]: "22"
            - generic [ref=e197]: GEN
          - generic [ref=e198]:
            - generic [ref=e199]: Bibelabschnitt
            - generic [ref=e200]: Gott wird sich ersehen ein Schaf
            - generic [ref=e201]: 1. Mose 22,1–19 · 5 Fragen
        - button "Also verachtete Esau seine Erstgeburt, 1. Mose 25,19–34" [ref=e205] [cursor=pointer]:
          - generic [ref=e206]:
            - generic [ref=e207]: "25"
            - generic [ref=e208]: GEN
          - generic [ref=e209]:
            - generic [ref=e210]: Bibelabschnitt
            - generic [ref=e211]: Also verachtete Esau seine Erstgeburt
            - generic [ref=e212]: 1. Mose 25,19–34 · 5 Fragen
        - generic [ref=e217]:
          - generic [ref=e218]: 436 Originaleinheiten · 2.479 Fragen · 436 freiwillige Reflexionsimpulse. In Bibelreihenfolge, ohne Rangliste.
          - button "Deinen Garten ansehen" [ref=e219] [cursor=pointer]
          - button "Zur Bibelnavigation" [ref=e224] [cursor=pointer]
    - navigation "Hauptnavigation" [ref=e228]:
      - button "Heute" [ref=e229] [cursor=pointer]
      - button "Bibel" [ref=e233] [cursor=pointer]
      - button "Wege" [ref=e237] [cursor=pointer]
      - button "Mein Garten" [ref=e242] [cursor=pointer]
      - button "Sammlung" [ref=e247] [cursor=pointer]
  - generic [ref=e251]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { readFileSync, mkdirSync } from "node:fs";
  4   | import { localData, rawData } from "./persistence";
  5   | const units = JSON.parse(readFileSync("src/data/story-index.json", "utf8")).units;
  6   | const bank = JSON.parse(readFileSync("src/data/story-questions.json", "utf8")).questions;
  7   | const nativity = units.find((u: any) => u.id === "NS-0241")!;
  8   | const psalm = units.find((u: any) => u.id === "NS-0073")!;
  9   | const button = (p: Page, name: string) => p.getByRole("button", { name, exact: true }).filter({ visible: true });
  10  | const radio = (p: Page, name: string) => p.getByRole("radio", { name, exact: true }).filter({ visible: true });
  11  | const question = (p: Page) => p.getByTestId("story-question-heading").filter({ visible: true });
  12  | const thought = (p: Page) => p.getByRole("textbox", { name: "Dein eigener Gedanke · freiwillig", exact: true }).filter({ visible: true });
  13  | const key = (q: any) => q.id + ":" + q.hash;
  14  | async function open(p: Page, id = nativity.id, stage = "lesen", index?: number) {
  15  |   await p.goto(`/geschichte/${id}?stage=${stage}${index === undefined ? "" : "&index=" + index}`);
  16  |   await expect(p.getByRole("heading", { name: units.find((u: any) => u.id === id).title, exact: true }).filter({ visible: true })).toBeVisible();
  17  | }
  18  | function personal(data: any) { const { revision, storyStudy, ...other } = data; return other; }
  19  | 
  20  | test("436 Originaleinheiten sind auffindbar, standardmäßig gesamte Bibel und tatsächlich virtualisiert", async ({ page }) => {
  21  |   await page.goto("/bibel");
  22  |   await button(page, "Geschichten und Abschnitte entdecken").click();
  23  |   await expect(page.getByText("436 Abschnitte", { exact: true })).toBeVisible();
  24  |   const count = await page.locator('[data-testid^="story-row-"]').count();
  25  |   expect(count).toBeGreaterThan(0); expect(count).toBeLessThan(80);
> 26  |   await button(page, "Bibelbereich").click();
      |                                      ^ Error: locator.click: Test timeout of 120000ms exceeded.
  27  |   await expect(radio(page, "Gesamte Bibel")).toBeChecked();
  28  |   await radio(page, "Neues Testament").check();
  29  |   await expect(page.getByText("329 Abschnitte", { exact: true })).toBeVisible();
  30  |   await button(page, "Bibelbereich").click(); await radio(page, "Altes Testament").check();
  31  |   await expect(page.getByText("107 Abschnitte", { exact: true })).toBeVisible();
  32  |   await button(page, "Bibelbereich").click(); await radio(page, "Gesamte Bibel").check();
  33  |   await page.getByRole("textbox", { name: "Titel oder Bibelstelle", exact: true }).fill(psalm.title.split("").join(" "));
  34  |   await expect(page.getByTestId("story-row-" + psalm.id)).toBeVisible();
  35  |   await page.getByRole("textbox", { name: "Titel oder Bibelstelle", exact: true }).fill("");
  36  |   await button(page, "Mit Bild").click(); await expect(page.getByText("6 Abschnitte", { exact: true })).toBeVisible();
  37  |   await button(page, "Alle Abschnitte").click(); await button(page, "Nach Bibelbuch filtern").click();
  38  |   await button(page, "Judas").click(); await expect(page.getByText("1 Abschnitte", { exact: true })).toBeVisible();
  39  |   await expect(page.getByTestId("story-row-NS-0420")).toBeVisible();
  40  |   expect(await rawData(page)).toBeUndefined();
  41  | });
  42  | 
  43  | test("Originalantworten bleiben nach Neustart änderbar, ohne Lesen oder Baumwachstum auszulösen", async ({ page }) => {
  44  |   const q = bank[nativity.questions[0].id], wrong = (q.correctIndex + 1) % 4;
  45  |   await open(page, nativity.id, "verstehen"); await expect(question(page)).toHaveText(q.prompt);
  46  |   await radio(page, q.options[wrong]).check(); expect(await rawData(page)).toBeUndefined();
  47  |   await button(page, "Antwort ansehen").click(); await expect(button(page, "Antwort ändern")).toBeVisible();
  48  |   await expect(page.getByText("Schau noch einmal in den Text.", { exact: true })).toBeVisible();
  49  |   const before = await localData(page), first = before.storyStudy.answers[key(q)]!;
  50  |   expect(first.question).toEqual(q); expect(before.readChapters).toEqual([]); expect(before.growthStage).toBe(0);
  51  |   await page.reload(); await expect(radio(page, q.options[wrong])).toBeChecked();
  52  |   await button(page, "Antwort ändern").click(); await radio(page, q.options[q.correctIndex]).check();
  53  |   await button(page, "Antwort ansehen").click(); await expect(page.getByText("Ja, das steht im Text.", { exact: true })).toBeVisible();
  54  |   const after = await localData(page);
  55  |   expect(after.storyStudy.answers[key(q)]?.createdAt).toBe(first.createdAt);
  56  |   expect(after.storyStudy.answers[key(q)]?.revision).toBe(2);
  57  |   expect(personal(after)).toEqual(personal(before));
  58  |   await button(page, "Die Textstelle ansehen").click();
  59  |   await expect(button(page, "Im Reader nachlesen")).toBeVisible();
  60  |   await button(page, "Im Reader nachlesen").click(); await expect(page.getByTestId("reader-flow")).toBeVisible();
  61  |   await button(page, "Zurück").click(); await expect(question(page)).toHaveText(q.prompt);
  62  | });
  63  | 
  64  | test("auch die längste Einheit führt durch alle 31 Fragen und setzt genau am letzten Schritt fort", async ({ page }) => {
  65  |   const long = units.find((u: any) => u.id === "NS-0324");
  66  |   await open(page, long.id, "verstehen");
  67  |   for (let i = 0; i < 31; i++) {
  68  |     await expect(question(page)).toHaveText(bank[long.questions[i].id].prompt);
  69  |     if (i < 30) await button(page, "Frage überspringen").click();
  70  |   }
  71  |   let data = await localData(page);
  72  |   expect(data.storyStudy.position?.index).toBe(30); expect(data.storyStudy.answers).toEqual({});
  73  |   expect(Object.values(data.storyStudy.viewed)[0]?.seen).toHaveLength(30);
  74  |   await page.goto("/geschichten"); await button(page, "Abschnitt fortsetzen").click();
  75  |   await expect(question(page)).toHaveText(bank[long.questions[30].id].prompt);
  76  |   await button(page, "Zu deinem Gedanken").click(); await expect(thought(page)).toBeVisible();
  77  |   await button(page, "Diesen Moment abschließen").click();
  78  |   await expect(page.getByText("Ein Gedanke darf bleiben.", { exact: true })).toBeVisible();
  79  |   data = await localData(page);
  80  |   expect(Object.values(data.storyStudy.viewed)[0]?.seen).toHaveLength(31);
  81  |   expect(data.storyStudy.answers).toEqual({}); expect(data.notes).toEqual([]); expect(data.growthStage).toBe(0);
  82  | });
  83  | 
  84  | test("Reflexionsentwürfe führen über die Sammlung zur richtigen Einheit und bewahren die Originalquelle", async ({ page }) => {
  85  |   await open(page, psalm.id, "gedanken");
  86  |   const text = "Mein Gedanke zum Psalm.\nEr darf noch unfertig sein.";
  87  |   await thought(page).fill(text);
  88  |   await expect.poll(async () => (await localData(page)).drafts.length).toBe(1);
  89  |   const draft = (await localData(page)).drafts[0]!;
  90  |   await page.goto("/sammlung?tab=Entw%C3%BCrfe");
  91  |   await button(page, "Entwurf fortsetzen: Reflexion: " + psalm.title).click();
  92  |   await expect(thought(page)).toHaveValue(text);
  93  |   await page.reload(); await expect(thought(page)).toHaveValue(text);
  94  |   await button(page, "Gedanken speichern").click();
  95  |   await expect.poll(async () => (await localData(page)).notes.length).toBe(1);
  96  |   const data = await localData(page), note = data.notes[0]!;
  97  |   expect(data.drafts).toEqual([]); expect(note.text).toBe(text); expect(note.kind).toBe("reflection");
  98  |   expect(note.captureSource).toEqual((draft.values as any).source); expect(note.ref).toEqual(psalm.references[0]);
  99  |   expect(data.readChapters).toEqual([]); expect(data.storyStudy.answers).toEqual({});
  100 |   await page.goto("/sammlung"); await expect(page.getByText(psalm.reflection, { exact: true })).toBeVisible();
  101 |   await button(page, "Bearbeiten").click();
  102 |   await page.getByRole("textbox", { name: "Deine Worte", exact: true }).fill("Weitergedacht und bewahrt.");
  103 |   await button(page, "Gedanken speichern").click();
  104 |   await expect.poll(async () => (await localData(page)).notes[0]?.text).toBe("Weitergedacht und bewahrt.");
  105 |   expect((await localData(page)).notes[0]?.captureSource).toEqual(note.captureSource);
  106 | });
  107 | 
  108 | test("Judas öffnet zwei exakte Lesebereiche; ein gefälschter Reflexionslink zeigt niemals den Editor", async ({ page }) => {
  109 |   await open(page, "NS-0420");
  110 |   const parts = page.getByRole("button", { name: /^Teil [12] lesen:/ }).filter({ visible: true });
  111 |   await expect(parts).toHaveCount(2);
  112 |   await parts.nth(0).click(); await expect(page.getByTestId("reader-flow")).toBeVisible();
  113 |   await expect(page).toHaveURL(/from=1/); await expect(page).toHaveURL(/to=4/);
  114 |   await page.reload(); await button(page, "Zurück").click(); await expect(parts).toHaveCount(2);
  115 |   await parts.nth(1).click(); await expect(page).toHaveURL(/from=17/); await expect(page).toHaveURL(/to=25/);
  116 |   await page.goto("/geschichte/NS-0420?stage=gedanken&draft=forged");
  117 |   await expect(page.getByRole("alert").filter({ visible: true }).last()).toBeVisible();
  118 |   await expect(thought(page)).toHaveCount(0);
  119 | });
  120 | 
  121 | test("ein echter Zwei-Fenster-Konflikt bewahrt die lokale Auswahl bis zur ausdrücklichen Übernahme", async ({ page, context }) => {
  122 |   const q = bank[nativity.questions[0].id];
  123 |   await open(page, nativity.id, "verstehen"); const second = await context.newPage();
  124 |   await open(second, nativity.id, "verstehen");
  125 |   await radio(page, q.options[0]).check(); await button(page, "Antwort ansehen").click();
  126 |   await expect(button(page, "Antwort ändern")).toBeVisible();
```