# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stories.spec.ts >> Reflexionsentwürfe führen über die Sammlung zur richtigen Einheit und bewahren die Originalquelle
- Location: tests/e2e/stories.spec.ts:84:1

# Error details

```
TypeError: Cannot read properties of undefined (reading 'drafts')
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
      - generic [ref=e28]:
        - button "Zurück" [ref=e30] [cursor=pointer]
        - generic [ref=e34]: PSALMEN · GEBET & POESIE
        - heading "Der HERR ist mein Hirte" [level=1] [ref=e35]
        - generic [ref=e36]: Psalmen 23,1–6 · 5 Originalfragen
        - navigation "Schritte dieses Abschnitts" [ref=e37]:
          - button "01 Lesen" [ref=e38] [cursor=pointer]
          - button "02 Verstehen" [ref=e40] [cursor=pointer]
          - button "03 Gedanken" [ref=e42] [cursor=pointer]
        - generic [ref=e44]:
          - generic [ref=e45]: Ein Moment für dich
          - generic [ref=e50]: Was bleibt bei dir?
          - generic [ref=e51]: Ob ich schon wanderte im finstern Tal, fürchte ich kein Unglück. Welches Tal gehst du — und merkst du den Stab?
          - generic [ref=e52]: Original-Reflexionsimpuls · FaithPath/Nachlese. Deine Antwort ist freiwillig.
          - generic [ref=e53]:
            - generic [ref=e54]:
              - generic [ref=e55]: Dein eigener Gedanke · freiwillig
              - textbox "Dein eigener Gedanke · freiwillig" [active] [ref=e56]:
                - /placeholder: Was möchtest du mitnehmen?
                - text: Mein Gedanke zum Psalm. Er darf noch unfertig sein.
            - generic [ref=e57]:
              - generic [ref=e58]: Entwurf wird gesichert …
              - button "Gedanken speichern" [ref=e59] [cursor=pointer]
              - button "Entwurf verwerfen" [ref=e63] [cursor=pointer]
          - button "Diesen Moment abschließen" [ref=e67] [cursor=pointer]
        - generic [ref=e71]:
          - generic [ref=e72]: Originaleinheit NS-0073 · Nachlese. Fragen und Reflexionsimpuls werden unverändert bewahrt. Nicht jede Frage besitzt einen zusätzlichen Erklärungstext.
          - button "Geschichten und Abschnitte" [ref=e73] [cursor=pointer]
    - navigation "Hauptnavigation" [ref=e77]:
      - button "Heute" [ref=e78] [cursor=pointer]
      - button "Bibel" [ref=e82] [cursor=pointer]
      - button "Wege" [ref=e86] [cursor=pointer]
      - button "Mein Garten" [ref=e91] [cursor=pointer]
      - button "Sammlung" [ref=e96] [cursor=pointer]
  - generic [ref=e100]: Offline-Paket wird vorbereitet …
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
  26  |   await button(page, "Bibelbereich").click();
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
> 88  |   await expect.poll(async () => (await localData(page)).drafts.length).toBe(1);
      |                                                         ^ TypeError: Cannot read properties of undefined (reading 'drafts')
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
  127 |   const bytes = await rawData(page);
  128 |   await radio(second, q.options[2]).check(); await button(second, "Antwort ansehen").click();
  129 |   await expect(button(second, "Aktuellen Stand laden")).toBeVisible();
  130 |   await expect(radio(second, q.options[2])).toBeChecked(); expect(await rawData(second)).toEqual(bytes);
  131 |   await button(second, "Aktuellen Stand laden").click();
  132 |   await expect(button(second, "Gespeicherten Stand übernehmen")).toBeVisible();
  133 |   await expect(radio(second, q.options[2])).toBeChecked();
  134 |   await button(second, "Gespeicherten Stand übernehmen").click();
  135 |   await expect(radio(second, q.options[0])).toBeChecked(); expect(await rawData(second)).toEqual(bytes);
  136 |   await second.close();
  137 | });
  138 | 
  139 | test("ein noch nie geöffneter Abschnitt und die Originalfragen funktionieren beim Offline-Neustart", async ({ page, context }) => {
  140 |   await page.goto("/geschichten"); await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  141 |   await context.setOffline(true);
  142 |   await page.goto("/geschichte/NS-0435?stage=verstehen");
  143 |   const unit = units.find((u: any) => u.id === "NS-0435"), q = bank[unit.questions[0].id];
  144 |   await expect(question(page)).toHaveText(q.prompt); await radio(page, q.options[0]).check();
  145 |   await button(page, "Antwort ansehen").click(); await expect(button(page, "Antwort ändern")).toBeVisible();
  146 |   const bytes = await rawData(page); await page.reload(); await expect(radio(page, q.options[0])).toBeChecked();
  147 |   expect(await rawData(page)).toEqual(bytes); await context.setOffline(false);
  148 | });
  149 | 
  150 | test("bestätigte Ansichten bleiben auf kleinen Displays, in Dunkelansicht und per Tastatur barrierearm", async ({ page }) => {
  151 |   const screenshots = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/stories/screens`;
  152 |   mkdirSync(screenshots, { recursive: true });
  153 |   for (const [width, theme] of [[320, "light"], [390, "dark"], [1440, "dark"]] as const) {
  154 |     await page.setViewportSize({ width, height: 844 });
  155 |     await page.goto("/geschichten");
  156 |     const toggle = button(page, theme === "dark" ? "Dunklen Modus aktivieren" : "Hellen Modus aktivieren");
  157 |     if (await toggle.count()) await toggle.click();
  158 |     await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  159 |     for (const [name, route] of [["library", "/geschichten"], ["illustrated", "/geschichte/NS-0241"], ["psalm", "/geschichte/NS-0073"], ["questions", "/geschichte/NS-0324?stage=verstehen&index=30"]]) {
  160 |       await page.goto(route!); await page.evaluate(() => document.fonts.ready.then(() => undefined));
  161 |       await expect(page.getByRole("heading", { level: 1 }).filter({ visible: true })).toBeVisible();
  162 |       if (name === "psalm") { await expect(page.getByTestId("story-typographic-hero")).toBeVisible(); }
  163 |       if (name === "questions") await expect(question(page)).toBeVisible();
  164 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  165 |       expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  166 |       await page.screenshot({ path: `${screenshots}/${name}-${width}-${theme}.png` });
  167 |     }
  168 |   }
  169 | });
  170 | 
```