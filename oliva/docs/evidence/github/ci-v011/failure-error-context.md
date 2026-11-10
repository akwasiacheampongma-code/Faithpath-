# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: david-story.spec.ts >> Geschichten und David-Kontext bleiben auf kleinen und großen Displays in Hell und Dunkel lesbar
- Location: tests/e2e/david-story.spec.ts:101:1

# Error details

```
TypeError: Cannot read properties of null (reading 'width')
```

# Page snapshot

```yaml
- generic [ref=f6e4]:
  - main [ref=f6e11]:
    - generic [ref=f6e14]:
      - generic [ref=f6e15]:
        - generic [ref=f6e16]:
          - button "Zurück" [ref=f6e17] [cursor=pointer]
          - button "1. Samuel 17,38–45⌄" [ref=f6e20] [cursor=pointer]
        - generic [ref=f6e22]:
          - button "Leseeinstellungen" [ref=f6e23] [cursor=pointer]
          - button "Dunklen Modus aktivieren" [ref=f6e27] [cursor=pointer]
      - generic [ref=f6e30]:
        - generic [ref=f6e31]: ALTES TESTAMENT
        - heading "1. Samuel" [level=1] [ref=f6e32]
        - generic [ref=f6e33]: 1. Samuel 17,38–45 · Bibeltext
        - button "Zum Abschnittsanfang" [ref=f6e34] [cursor=pointer]
        - generic [ref=f6e38]:
          - button "Einfach lesen" [ref=f6e39] [cursor=pointer]
          - button "Tiefer verstehen" [pressed] [ref=f6e41] [cursor=pointer]
        - button "Lesefokus starten" [ref=f6e43] [cursor=pointer]
      - generic [ref=f6e47]:
        - generic [ref=f6e48]: KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT
        - generic [ref=f6e49]: Das Buch im Überblick
        - generic [ref=f6e50]: Hören auf Gott und die Verantwortung menschlicher Könige.
        - generic [ref=f6e51]: Für dieses Kapitel liegt noch keine geprüfte Zusammenfassung vor. Der Bibeltext ist vollständig lesbar.
      - generic [ref=f6e52]:
        - 'img "Künstlerische Interpretation: David steht mit Stab und Tasche in einem Tal. In der Ferne sind Goliath und ein Schildträger zu sehen. Gesichter, Kleidung, Größenverhältnisse, Landschaft und Morgenlicht sind frei gestaltet. Das Bild ist keine vermessene historische Rekonstruktion." [ref=f6e54]'
        - generic [ref=f6e57]:
          - generic [ref=f6e58]: 1. Samuel 17,38–45 · etwa 3 Min.
          - generic [ref=f6e62]: Vertrauen vor dem ersten Schritt.
          - generic [ref=f6e63]: KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT
          - generic [ref=f6e64]: Das erste Buch Samuel erzählt hier von einer Begegnung im Krieg. Saul, der König Israels, stattet David mit Helm und Rüstung aus. David legt sie ab, weil er sie nicht gewohnt ist. Er nimmt seinen Stab, fünf Steine und eine Schleuder. Goliath begegnet ihm mit Spott und Drohung. David antwortet, er komme im Namen des Gottes Israels. Der Ausschnitt zeigt Vorbereitung und Vertrauen; vom Ausgang des Kampfes erzählt erst der weitere Text.
          - generic [ref=f6e65]: Einordnung nur zu 1. Samuel 17,38–45. Sie ersetzt den Bibeltext nicht.
          - generic [ref=f6e66]:
            - generic [ref=f6e67]: HERR Zebaoth
            - generic [ref=f6e68]: Eine biblische Bezeichnung für Gott, häufig als „Herr der Heerscharen“ wiedergegeben. In Vers 45 drückt Davids Antwort sein Vertrauen auf den Gott Israels aus.
          - generic [ref=f6e69]: KI-Illustration · künstlerische Interpretation, keine historische Aufnahme. Gesichter, Kleidung, Größenverhältnisse, Landschaft und Morgenlicht sind frei gestaltet. Das Bild ist keine vermessene historische Rekonstruktion. Unabhängige Fachfreigabe steht aus.
      - generic [ref=f6e70]:
        - generic [ref=f6e71]: Tippe auf einen Vers, um ihn zu markieren, zu merken oder eine Notiz zu schreiben.
        - button "Versaktionen" [ref=f6e73] [cursor=pointer]
        - generic [ref=f6e78]:
          - paragraph [ref=f6e80]:
            - 'button "Vers 38: Und Saul sprach zu David: Gehe hin, der HERR sei mit dir! Und Saul zog David seine Kleider an und setzte ihm seinen ehernen Helm auf sein Haupt und legte ihm seinen Panzer an." [ref=f6e82] [cursor=pointer]': "38 Und Saul sprach zu David: Gehe hin, der HERR sei mit dir! Und Saul zog David seine Kleider an und setzte ihm seinen ehernen Helm auf sein Haupt und legte ihm seinen Panzer an."
            - 'button "Vers 39: Und David gürtete sein Schwert über seine Kleider und fing an zu gehen, denn er hatte es nie versucht. Da sprach David zu Saul: Ich kann nicht also gehen, denn ich bin''s nicht gewohnt, und legte es von sich" [ref=f6e84] [cursor=pointer]': "39 Und David gürtete sein Schwert über seine Kleider und fing an zu gehen, denn er hatte es nie versucht. Da sprach David zu Saul: Ich kann nicht also gehen, denn ich bin's nicht gewohnt, und legte es von sich"
            - 'button "Vers 40: und nahm seinen Stab in seine Hand und erwählte fünf glatte Steine aus dem Bach und tat sie in seine Hirtentasche, die er hatte, und in den Sack und nahm die Schleuder in seine Hand und machte sich zu dem Philister." [ref=f6e86] [cursor=pointer]': 40 und nahm seinen Stab in seine Hand und erwählte fünf glatte Steine aus dem Bach und tat sie in seine Hirtentasche, die er hatte, und in den Sack und nahm die Schleuder in seine Hand und machte sich zu dem Philister.
            - 'button "Vers 41: Und der Philister ging auch einher und machte sich zu David und sein Schildträger vor ihm her." [ref=f6e88] [cursor=pointer]': 41 Und der Philister ging auch einher und machte sich zu David und sein Schildträger vor ihm her.
            - 'button "Vers 42: Da nun der Philister sah und schaute David an, verachtete er ihn; denn er war ein Knabe, bräunlich und schön." [ref=f6e90] [cursor=pointer]': 42 Da nun der Philister sah und schaute David an, verachtete er ihn; denn er war ein Knabe, bräunlich und schön.
          - paragraph [ref=f6e92]:
            - 'button "Vers 43: Und der Philister sprach zu David: Bin ich denn ein Hund, daß du mit Stecken zu mir kommst? und fluchte dem David bei seinem Gott" [ref=f6e94] [cursor=pointer]': "43 Und der Philister sprach zu David: Bin ich denn ein Hund, daß du mit Stecken zu mir kommst? und fluchte dem David bei seinem Gott"
            - 'button "Vers 44: und sprach zu David: Komm her zu mir, ich will dein Fleisch geben den Vögeln unter dem Himmel und den Tieren auf dem Felde!" [ref=f6e96] [cursor=pointer]': "44 und sprach zu David: Komm her zu mir, ich will dein Fleisch geben den Vögeln unter dem Himmel und den Tieren auf dem Felde!"
            - 'button "Vers 45: David aber sprach zu dem Philister: Du kommst zu mir mit Schwert, Spieß und Schild; ich aber komme zu dir im Namen des HERRN Zebaoth, des Gottes des Heeres Israels, das du gehöhnt hast." [ref=f6e98] [cursor=pointer]': "45 David aber sprach zu dem Philister: Du kommst zu mir mit Schwert, Spieß und Schild; ich aber komme zu dir im Namen des HERRN Zebaoth, des Gottes des Heeres Israels, das du gehöhnt hast."
      - generic [ref=f6e100]:
        - generic [ref=f6e101]: Ein kleiner Abschnitt. Ein neuer Gedanke.
        - button "Abschnitt als gelesen bestätigen" [ref=f6e102] [cursor=pointer]
        - button "Das ganze Kapitel lesen" [ref=f6e107] [cursor=pointer]
        - generic [ref=f6e111]: Lesefortschritt ist eine Erinnerung – keine Bewertung deines Glaubens.
      - generic [ref=f6e112]: "Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org Einordnungen: OLIVA-Entwürfe; theologische Freigabe vor Veröffentlichung offen."
  - generic [ref=f6e113]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  35  |     readChapters: data.readChapters,
  36  |     readPassages: data.readPassages,
  37  |     readSteps: data.readSteps,
  38  |     completedSteps: data.completedSteps,
  39  |     growthStage: data.growthStage,
  40  |     retainedReviewGrowth: data.retainedReviewGrowth,
  41  |   };
  42  | }
  43  | 
  44  | async function noOverflow(page: Page) {
  45  |   await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  46  | }
  47  | 
  48  | test("fünf Geschichten bewahren den Bestand; David öffnet exakt acht Verse und zählt nur nach ausdrücklicher Bestätigung", async ({ page }) => {
  49  |   await savedProfile(page);
  50  |   const before = await rawData(page);
  51  |   await openLibrary(page);
  52  |   for (const id of stories) await artworkReady(page, id);
  53  |   await expect(page.getByTestId("story-card-david-before-goliath").getByText("Vertrauen vor dem ersten Schritt.", { exact: true })).toBeVisible();
  54  |   await expect(page.getByRole("img", { name: /Künstlerische Interpretation: David steht mit Stab und Tasche/ })).toBeVisible();
  55  |   expect(await rawData(page)).toEqual(before);
  56  | 
  57  |   const progress = learningProgress(await localData(page));
  58  |   await page.getByRole("button", { name: "Davids Vorbereitung lesen", exact: true }).click();
  59  |   // Expo Router completes the transition asynchronously; read the parameters
  60  |   // only once the actual destination has arrived, without forcing navigation.
  61  |   await expect(page).toHaveURL(/\/lesen\/1SA\?/);
  62  |   const url = new URL(page.url());
  63  |   expect(url.pathname).toBe("/lesen/1SA");
  64  |   expect(Object.fromEntries(url.searchParams)).toMatchObject({ chapter: "17", from: "38", to: "45", mode: "deep" });
  65  |   await expect(page.getByRole("button", { name: "Tiefer verstehen", exact: true })).toHaveAttribute("aria-pressed", "true");
  66  |   await artworkReady(page);
  67  |   const context = page.getByTestId(`story-card-${david}`).filter({ visible: true });
  68  |   await expect(context.getByText("KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT", { exact: true })).toBeVisible();
  69  |   await expect(context.getByText("HERR Zebaoth", { exact: true })).toBeVisible();
  70  |   await expect(context.getByText(/vom Ausgang des Kampfes erzählt erst der weitere Text/)).toBeVisible();
  71  |   await expect(context.getByText(/Unabhängige Fachfreigabe steht aus/)).toBeVisible();
  72  |   for (let verse = 38; verse <= 45; verse++) await expect(page.getByRole("button", { name: new RegExp(`^Vers ${verse}:`) })).toBeAttached();
  73  |   await expect(page.getByRole("button", { name: /^Vers (?:37|46):/ })).toHaveCount(0);
  74  |   expect(learningProgress(await localData(page))).toEqual(progress);
  75  |   await page.getByRole("button", { name: "Abschnitt als gelesen bestätigen", exact: true }).click();
  76  |   await expect.poll(async () => (await localData(page)).readPassages).toEqual(["1SA:17:38:45"]);
  77  |   expect((await localData(page)).readChapters).toEqual(progress.readChapters);
  78  |   expect((await localData(page)).completedSteps).toEqual(progress.completedSteps);
  79  | });
  80  | 
  81  | test("das vollständige Offlinepaket öffnet David und alle bisherigen Bilder erstmals offline und nach Neustart", async ({ page, context }) => {
  82  |   await savedProfile(page);
  83  |   const before = await rawData(page);
  84  |   await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  85  |   // No story route or illustration has been opened before disconnecting.
  86  |   await context.setOffline(true);
  87  |   await openLibrary(page);
  88  |   for (const id of stories) await artworkReady(page, id);
  89  |   expect(await rawData(page)).toEqual(before);
  90  |   await page.reload();
  91  |   await page.getByRole("button", { name: "Eine Geschichte entdecken", exact: true }).click();
  92  |   for (const id of stories) await artworkReady(page, id);
  93  |   expect(await rawData(page)).toEqual(before);
  94  |   await page.getByRole("button", { name: "Davids Vorbereitung lesen", exact: true }).click();
  95  |   await artworkReady(page);
  96  |   await expect(page.getByRole("button", { name: /^Vers 38:/ })).toBeAttached();
  97  |   await expect(page.getByRole("button", { name: /^Vers 45:/ })).toBeAttached();
  98  |   expect(learningProgress(await localData(page))).toEqual(learningProgress(before.data));
  99  | });
  100 | 
  101 | test("Geschichten und David-Kontext bleiben auf kleinen und großen Displays in Hell und Dunkel lesbar", async ({ page }) => {
  102 |   await mkdir(screenshots, { recursive: true });
  103 |   await savedProfile(page);
  104 |   await page.emulateMedia({ reducedMotion: "reduce" });
  105 |   for (const [width, theme] of [[320, "light"], [390, "dark"], [1440, "light"]] as const) {
  106 |     await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
  107 |     await page.goto("/einstellungen");
  108 |     const toggle = page.getByRole("button", {
  109 |       name: theme === "dark" ? "Dunklen Modus aktivieren" : "Hellen Modus aktivieren",
  110 |       exact: true,
  111 |     });
  112 |     await expect(page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" })).toHaveValue("Ada");
  113 |     if ((await localData(page)).settings.theme !== theme) await toggle.click();
  114 |     await expect.poll(async () => (await localData(page)).settings.theme).toBe(theme);
  115 |     const before = await rawData(page);
  116 |     await openLibrary(page);
  117 |     for (const id of stories) await artworkReady(page, id);
  118 |     await noOverflow(page);
  119 |     const frame = await page.getByTestId(`story-artwork-${david}`).filter({ visible: true }).boundingBox();
  120 |     expect(frame).not.toBeNull();
  121 |     expect(frame!.width / frame!.height).toBeCloseTo(8 / 5, 2);
  122 |     await page.getByTestId(`story-artwork-${david}`).filter({ visible: true }).screenshot({ path: `${screenshots}/david-artwork-${width}-${theme}.png` });
  123 |     await page.getByTestId(`story-card-${david}`).filter({ visible: true }).scrollIntoViewIfNeeded();
  124 |     await page.screenshot({ path: `${screenshots}/david-library-${width}-${theme}.png` });
  125 |     await page.getByTestId(`story-card-${david}`).filter({ visible: true }).screenshot({ path: `${screenshots}/david-card-${width}-${theme}.png` });
  126 |     if (width === 1440) await page.getByTestId("story-card-easter-dawn").screenshot({ path: `${screenshots}/easter-card-wide-${theme}.png` });
  127 |     expect(await rawData(page)).toEqual(before);
  128 |     const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  129 |     expect(scan.violations).toEqual([]);
  130 |   }
  131 |   await page.setViewportSize({ width: 390, height: 844 });
  132 |   await page.getByRole("button", { name: "Davids Vorbereitung lesen", exact: true }).click();
  133 |   await artworkReady(page);
  134 |   const contextFrame = await page.getByTestId(`story-artwork-${david}`).filter({ visible: true }).boundingBox();
> 135 |   expect(contextFrame!.width / contextFrame!.height).toBeCloseTo(3 / 2, 2);
      |                        ^ TypeError: Cannot read properties of null (reading 'width')
  136 |   await noOverflow(page);
  137 |   await page.getByTestId(`story-card-${david}`).filter({ visible: true }).scrollIntoViewIfNeeded();
  138 |   await page.getByTestId(`story-card-${david}`).filter({ visible: true }).screenshot({ path: `${screenshots}/david-context-390-light.png` });
  139 |   const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  140 |   expect(scan.violations).toEqual([]);
  141 | });
  142 | 
  143 | test.describe("echte Bildfehler ohne Service-Worker", () => {
  144 |   test.use({ serviceWorkers: "block" });
  145 |   test("drei ausgefallene Bildvarianten zeigen einen erreichbaren Wiederholungsbutton und laden danach wirklich", async ({ page }) => {
  146 |     await savedProfile(page);
  147 |     const before = await rawData(page), failed = new Set<string>(), errors: string[] = [];
  148 |     page.on("pageerror", error => errors.push(error.message));
  149 |     await page.route(davidWebp, route => { failed.add(route.request().url()); return route.abort(); });
  150 |     await openLibrary(page);
  151 |     await expect(page.getByTestId(`story-error-${david}`)).toHaveRole("group");
  152 |     await expect(page.getByTestId(`story-error-status-${david}`)).toHaveText("Die Illustration konnte nicht geladen werden.");
  153 |     await expect(page.getByRole("button", { name: "Bild erneut laden", exact: true })).toBeVisible();
  154 |     await expect(page.getByRole("button", { name: "Davids Vorbereitung lesen", exact: true })).toBeEnabled();
  155 |     expect(failed.size).toBe(3);
  156 |     expect(await rawData(page)).toEqual(before);
  157 |     await page.unroute(davidWebp);
  158 |     await page.getByRole("button", { name: "Bild erneut laden", exact: true }).click();
  159 |     await artworkReady(page);
  160 |     expect(await rawData(page)).toEqual(before);
  161 |     expect(errors).toEqual([]);
  162 |   });
  163 | });
  164 | 
```