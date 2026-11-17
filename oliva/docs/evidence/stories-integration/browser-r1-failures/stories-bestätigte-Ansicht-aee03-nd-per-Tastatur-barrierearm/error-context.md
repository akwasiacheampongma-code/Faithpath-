# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: stories.spec.ts >> bestätigte Ansichten bleiben auf kleinen Displays, in Dunkelansicht und per Tastatur barrierearm
- Location: tests/e2e/stories.spec.ts:150:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { level: 1 }).visible()
Expected: visible
Error: strict mode violation: getByRole('heading', { level: 1 }).visible() resolved to 2 elements:
    1) <h1 dir="auto" aria-level="1" role="heading" class="css-146c3p1">Was Gott gereinigt hat</h1> aka getByRole('heading', { name: 'Was Gott gereinigt hat' })
    2) <h1 dir="auto" role="heading" class="css-146c3p1" data-testid="story-question-heading">Welche Reihenfolge fällt in diesem Abschnitt beso…</h1> aka getByTestId('story-question-heading')

Call log:
  - Expect "toBeVisible" getByRole('heading', { level: 1 }).visible() with timeout 15000ms
  - waiting for getByRole('heading', { level: 1 }).visible()

```

# Page snapshot

```yaml
- generic [ref=f4e4]:
  - generic [ref=f4e10]:
    - banner [ref=f4e11]:
      - generic [ref=f4e12]: OLIVA
      - generic [ref=f4e19]:
        - button "Dunklen Modus aktivieren" [ref=f4e20] [cursor=pointer]
        - button "Du · Profil und Einstellungen" [ref=f4e23] [cursor=pointer]:
          - generic [ref=f4e24]: Du
    - main [ref=f4e25]:
      - generic [ref=f4e28]:
        - button "Zurück" [ref=f4e30] [cursor=pointer]
        - generic [ref=f4e34]: EINEN ABSCHNITT ENTDECKEN
        - heading "Was Gott gereinigt hat" [level=1] [ref=f4e35]
        - generic [ref=f4e36]: Apostelgeschichte 10,1–48 · 31 Originalfragen
        - navigation "Schritte dieses Abschnitts" [ref=f4e37]:
          - button "01 Lesen" [ref=f4e38] [cursor=pointer]
          - button "02 Verstehen" [ref=f4e40] [cursor=pointer]
          - button "03 Gedanken" [ref=f4e42] [cursor=pointer]
        - generic [ref=f4e44]:
          - generic [ref=f4e45]:
            - generic [ref=f4e46]: FRAGE 31 VON 31
            - generic [ref=f4e47]: 0 angesehen
          - generic [ref=f4e48]:
            - heading "Welche Reihenfolge fällt in diesem Abschnitt besonders auf?" [level=1] [ref=f4e49]
            - group "Antwort auswählen" [ref=f4e50]:
              - generic [ref=f4e51] [cursor=pointer]:
                - radio "Der Heilige Geist kommt vor der Wassertaufe" [ref=f4e52]
                - generic [ref=f4e53]: Der Heilige Geist kommt vor der Wassertaufe
              - generic [ref=f4e54] [cursor=pointer]:
                - radio "Die Wassertaufe geschieht vor Petrus' Predigt" [ref=f4e55]
                - generic [ref=f4e56]: Die Wassertaufe geschieht vor Petrus' Predigt
              - generic [ref=f4e57] [cursor=pointer]:
                - radio "Kornelius tauft Petrus" [ref=f4e58]
                - generic [ref=f4e59]: Kornelius tauft Petrus
              - generic [ref=f4e60] [cursor=pointer]:
                - radio "Die Taufe findet vor der Versammlung statt" [ref=f4e61]
                - generic [ref=f4e62]: Die Taufe findet vor der Versammlung statt
            - button "Antwort ansehen" [disabled]
          - generic [ref=f4e66]:
            - button "Zurück" [ref=f4e67] [cursor=pointer]
            - button "Zu deinem Gedanken" [ref=f4e71] [cursor=pointer]
          - generic [ref=f4e75]: Du darfst nachlesen, Antworten ändern oder Fragen überspringen. Fragen allein verändern weder deinen Lesefortschritt noch deinen Olivenbaum.
        - generic [ref=f4e76]:
          - generic [ref=f4e77]: Originaleinheit NS-0324 · Nachlese. Fragen und Reflexionsimpuls werden unverändert bewahrt. Nicht jede Frage besitzt einen zusätzlichen Erklärungstext.
          - button "Geschichten und Abschnitte" [ref=f4e78] [cursor=pointer]
    - navigation "Hauptnavigation" [ref=f4e82]:
      - button "Heute" [ref=f4e83] [cursor=pointer]
      - button "Bibel" [ref=f4e87] [cursor=pointer]
      - button "Wege" [ref=f4e91] [cursor=pointer]
      - button "Mein Garten" [ref=f4e96] [cursor=pointer]
      - button "Sammlung" [ref=f4e101] [cursor=pointer]
  - generic [ref=f4e105]: Für den Offline-Neustart bereit.
```

# Test source

```ts
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
  100 |   await page.goto("/sammlung"); await expect(page.getByText("Original-Reflexionsimpuls: " + psalm.reflection, { exact: true })).toBeVisible();
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
> 161 |       await expect(page.getByRole("heading", { level: 1 }).filter({ visible: true })).toBeVisible();
      |                                                                                       ^ Error: expect(locator).toBeVisible() failed
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