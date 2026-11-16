# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: personal.spec.ts >> Bibelbezug wird aus einer Versaktion an ein Vorhaben übergeben
- Location: tests/e2e/personal.spec.ts:296:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Markus 4,35', { exact: true })
Expected: visible
Error: strict mode violation: getByText('Markus 4,35', { exact: true }) resolved to 2 elements:
    1) <div dir="auto" class="css-146c3p1 r-dnmrzs r-1udh08x r-1udbk01 r-3s2u2q r-1iln25a">Markus 4,35</div> aka getByLabel('Versauswahl').getByText('Markus')
    2) <div dir="auto" class="css-146c3p1">Markus 4,35</div> aka getByRole('main').getByText('Markus')

Call log:
  - Expect "toBeVisible" getByText('Markus 4,35', { exact: true }) with timeout 15000ms
  - waiting for getByText('Markus 4,35', { exact: true })
    3 × locator resolved to <div dir="auto" class="css-146c3p1 r-dnmrzs r-1udh08x r-1udbk01 r-3s2u2q r-1iln25a">Markus 4,35</div>
      - unexpected value "hidden"

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
        - generic [ref=e29]: Dein Glaube im Alltag
        - heading "Ein kleiner Versuch ist genug." [level=1] [ref=e34]
        - generic [ref=e35]: Ein persönliches Vorhaben begleitet etwas, das dir im Alltag wichtig ist. Du wählst deine Schritte selbst und kannst später festhalten, was du erlebt hast. Es gibt keine Fristen oder Bewertung.
        - generic [ref=e36]:
          - button "Editor schließen" [ref=e37] [cursor=pointer]
          - button "Zu den geführten Wegen" [ref=e42] [cursor=pointer]
        - generic [ref=e47]:
          - generic [ref=e48]: Dein Vorhaben · dein Tempo
          - generic [ref=e53]: Was möchtest du im Alltag ausprobieren?
          - generic [ref=e54]:
            - generic [ref=e55]: Name deines Vorhabens
            - textbox "Name deines Vorhabens" [ref=e56]:
              - /placeholder: "Zum Beispiel: In Ruhe zuhören"
          - generic [ref=e57]:
            - generic [ref=e58]: Was bewegt dich? (freiwillig)
            - textbox "Was bewegt dich? (freiwillig)" [ref=e59]:
              - /placeholder: Hier ist Platz für dein Anliegen …
          - generic [ref=e60]:
            - generic [ref=e61]: Dein erster kleiner Schritt (freiwillig)
            - textbox "Dein erster kleiner Schritt (freiwillig)" [ref=e62]:
              - /placeholder: Ein kleiner, frei gewählter Versuch reicht.
          - generic [ref=e63]: Du legst dein Tempo selbst fest. Schritte und Rückblicke bewerten weder deinen Glauben noch deinen Wert.
          - generic [ref=e64]:
            - generic [ref=e65]: Markus 4,35
            - button "Bibelbezug aus diesem Entwurf entfernen" [ref=e69] [cursor=pointer]
          - generic [ref=e73]:
            - generic [ref=e74]: Entwurf auf diesem Gerät gesichert.
            - button "Vorhaben anlegen" [disabled]
            - button "Entwurf verwerfen" [ref=e78] [cursor=pointer]
        - generic [ref=e82]:
          - button "Aktive Vorhaben" [pressed] [ref=e83] [cursor=pointer]
          - button "Archiv" [ref=e85] [cursor=pointer]
        - generic [ref=e87]:
          - generic [ref=e88]: Deine Vorhaben durchsuchen
          - textbox "Deine Vorhaben durchsuchen" [ref=e89]:
            - /placeholder: Titel oder Anliegen …
        - generic [ref=e90]: Hier darf dein erstes Vorhaben entstehen. Du brauchst nur einen kurzen Namen; alles Weitere ist freiwillig.
    - navigation "Hauptnavigation" [ref=e95]:
      - button "Heute" [ref=e96] [cursor=pointer]
      - button "Bibel" [ref=e100] [cursor=pointer]
      - button "Wege" [ref=e104] [cursor=pointer]
      - button "Mein Garten" [ref=e109] [cursor=pointer]
      - button "Sammlung" [ref=e114] [cursor=pointer]
  - generic [ref=e118]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  208 |   await page
  209 |     .getByRole("textbox", { name: "Deine Worte", exact: true })
  210 |     .fill("Diesen Text möchte ich bewusst entscheiden.");
  211 |   await saved(page);
  212 |   await page
  213 |     .getByRole("button", { name: "Entwurf verwerfen", exact: true })
  214 |     .click();
  215 |   await page
  216 |     .getByRole("button", { name: "Entwurf behalten", exact: true })
  217 |     .click();
  218 |   await page.reload();
  219 |   await page
  220 |     .getByRole("button", { name: "Entwurf fortsetzen", exact: true })
  221 |     .click();
  222 |   await expect(
  223 |     page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  224 |   ).toHaveValue("Diesen Text möchte ich bewusst entscheiden.");
  225 |   await page
  226 |     .getByRole("button", { name: "Entwurf verwerfen", exact: true })
  227 |     .click();
  228 |   await page
  229 |     .getByRole("button", { name: "Entwurf endgültig verwerfen", exact: true })
  230 |     .click();
  231 |   await expect.poll(async () => (await local(page)).drafts.length).toBe(0);
  232 |   expect((await local(page)).notes).toHaveLength(0);
  233 | });
  234 | test("Eine installierte V1-Datenbank wird ohne Verlust weitergeführt", async ({
  235 |   page,
  236 | }) => {
  237 |   await page.goto("/einstellungen");
  238 |   await page
  239 |     .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
  240 |     .fill("Ada");
  241 |   await page
  242 |     .getByRole("button", { name: "Namen speichern", exact: true })
  243 |     .click();
  244 |   await expect.poll(async () => (await local(page))?.name).toBe("Ada");
  245 |   const {
  246 |     goals,
  247 |     drafts,
  248 |     imports,
  249 |     readingPosition,
  250 |     retainedReviewGrowth,
  251 |     invitations,
  252 |     ntStudy,
  253 |     ...rest
  254 |   } = await local(page);
  255 |   const old = {
  256 |     ...rest,
  257 |     version: 1,
  258 |     name: "Ada",
  259 |     readChapters: ["MRK:4"],
  260 |     growthStage: 3,
  261 |     notes: [
  262 |       {
  263 |         id: "legacy-note",
  264 |         text: "Meine alten eigenen Worte.",
  265 |         kind: "note",
  266 |         createdAt: "2026-11-05T12:00:00.000Z",
  267 |         updatedAt: "2026-11-05T12:00:00.000Z",
  268 |       },
  269 |     ],
  270 |   };
  271 |   await page.evaluate(
  272 |     (value) =>
  273 |       new Promise<void>((resolve, reject) => {
  274 |         const r = indexedDB.open("oliva-local-v1", 1);
  275 |         r.onsuccess = () => {
  276 |           const tx = r.result.transaction("state", "readwrite");
  277 |           tx.objectStore("state").put(value, "main");
  278 |           tx.oncomplete = () => resolve();
  279 |           tx.onerror = () => reject(tx.error);
  280 |         };
  281 |       }),
  282 |     old,
  283 |   );
  284 |   await page.goto("/sammlung");
  285 |   await expect(
  286 |     page.getByText("Meine alten eigenen Worte.", { exact: true }),
  287 |   ).toBeVisible();
  288 |   await page
  289 |     .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
  290 |     .click();
  291 |   expect((await local(page)).version).toBe(9);
  292 |   expect((await local(page)).readChapters).toEqual(["MRK:4"]);
  293 |   expect((await local(page)).growthStage).toBe(3);
  294 |   expect((await local(page)).notes[0]?.text).toBe("Meine alten eigenen Worte.");
  295 | });
  296 | test("Bibelbezug wird aus einer Versaktion an ein Vorhaben übergeben", async ({
  297 |   page,
  298 | }) => {
  299 |   await page.goto("/lesen/MRK?chapter=4");
  300 |   await page.getByRole("button", { name: /^Vers 35:/ }).click();
  301 |   await page
  302 |     .getByRole("toolbar", { name: "Versauswahl", exact: true })
  303 |     .getByRole("button", { name: "Mehr", exact: true })
  304 |     .click();
  305 |   await page
  306 |     .getByRole("button", { name: "Mit einem Vorhaben verbinden", exact: true })
  307 |     .click();
> 308 |   await expect(page.getByText("Markus 4,35", { exact: true })).toBeVisible();
      |                                                                ^ Error: expect(locator).toBeVisible() failed
  309 |   await page
  310 |     .getByRole("textbox", { name: "Name deines Vorhabens" })
  311 |     .fill("Fragen ehrlich aussprechen");
  312 |   await page
  313 |     .getByRole("button", { name: "Vorhaben anlegen", exact: true })
  314 |     .click();
  315 |   await expect(page.getByText("Deine kleinen Schritte")).toBeVisible();
  316 |   expect((await local(page)).goals[0]?.ref).toEqual({
  317 |     book: "MRK",
  318 |     chapter: 4,
  319 |     from: 35,
  320 |     to: 35,
  321 |   });
  322 | });
  323 | test("Neue Vorhaben- und Entwurfsansichten bleiben auf kleinen Displays zugänglich", async ({
  324 |   page,
  325 | }) => {
  326 |   for (const width of [320, 390, 1440]) {
  327 |     await page.setViewportSize({ width, height: 900 });
  328 |     await page.goto("/vorhaben");
  329 |     await page
  330 |       .getByRole("button", { name: "Ein Vorhaben anlegen", exact: true })
  331 |       .click();
  332 |     await page
  333 |       .getByRole("textbox", { name: "Name deines Vorhabens" })
  334 |       .fill("Ein ruhiger Anfang");
  335 |     await saved(page);
  336 |     expect(
  337 |       await page.evaluate(
  338 |         () => document.documentElement.scrollWidth <= innerWidth,
  339 |       ),
  340 |     ).toBe(true);
  341 |     const scan = await new AxeBuilder({ page })
  342 |       .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  343 |       .analyze();
  344 |     expect(scan.violations).toEqual([]);
  345 |     await page
  346 |       .getByRole("button", { name: "Entwurf verwerfen", exact: true })
  347 |       .click();
  348 |     await page
  349 |       .getByRole("button", { name: "Entwurf endgültig verwerfen", exact: true })
  350 |       .click();
  351 |     await expect
  352 |       .poll(async () =>
  353 |         (await local(page)).drafts.some((draft) => draft.key === "goal:new"),
  354 |       )
  355 |       .toBe(false);
  356 |   }
  357 | });
  358 | 
```