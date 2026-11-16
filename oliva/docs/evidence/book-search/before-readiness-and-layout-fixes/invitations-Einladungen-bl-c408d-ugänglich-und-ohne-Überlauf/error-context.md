# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: invitations.spec.ts >> Einladungen bleiben bei 320 Pixeln in Hell und Dunkel sowie auf großem Display zugänglich und ohne Überlauf
- Location: tests/e2e/invitations.spec.ts:412:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.scrollIntoViewIfNeeded: Test timeout of 120000ms exceeded.
Call log:
  - attempting scroll into view action
    - waiting for element to be stable

```

# Page snapshot

```yaml
- generic [ref=f1e4]:
  - generic [ref=f1e10]:
    - banner [ref=f1e11]:
      - generic [ref=f1e12]: OLIVA
      - generic [ref=f1e19]:
        - button "Dunklen Modus aktivieren" [ref=f1e20] [cursor=pointer]
        - button "A · Profil und Einstellungen" [ref=f1e23] [cursor=pointer]:
          - generic [ref=f1e24]: A
    - main [ref=f1e25]:
      - generic [ref=f1e28]:
        - button "Zurück" [ref=f1e30] [cursor=pointer]
        - generic [ref=f1e34]: In deinem eigenen Rhythmus
        - heading "Was dir wichtig bleibt." [level=1] [ref=f1e39]
        - generic [ref=f1e40]: Manche Gedanken dürfen eine Weile ruhen. Hier kannst du ihnen wiederbegegnen – ohne etwas nachholen zu müssen.
        - generic [ref=f1e41]:
          - generic [ref=f1e42]:
            - generic [ref=f1e43]:
              - generic [ref=f1e44]: Gedanken wiederbegegnen.
              - generic [ref=f1e45]: Freiwillige Einladungen in OLIVA
            - switch "Einladungen in der App erlauben" [checked] [ref=f1e49] [cursor=pointer]
          - generic [ref=f1e50]: Wenn du möchtest, begegnen dir ältere Vorhaben und Gedanken wieder, während du OLIVA nutzt. Du kannst sie für 14 Tage zurückstellen oder ausblenden.
          - generic [ref=f1e51]: Du erhältst keine Push-Nachrichten oder E-Mails. Eine Pause sagt nichts über deinen Glauben aus. Deine gespeicherten Entscheidungen bleiben beim Ausschalten erhalten.
        - generic [ref=f1e52]:
          - heading "Raum zum Wiederentdecken" [level=1] [ref=f1e53]
          - generic [ref=f1e54]:
            - generic [ref=f1e55]: Dein Vorhaben
            - heading "Wieder Raum zum Zuhören" [level=1] [ref=f1e60]
            - generic [ref=f1e61]: "Du wolltest ausprobieren: „Eine Frage stellen und ausreden lassen.“"
            - generic [ref=f1e62]: Johannes 6
            - generic [ref=f1e63]: Zuletzt festgehalten am 18. Oktober 2026
            - button "Zum Vorhaben" [ref=f1e64] [cursor=pointer]
            - generic [ref=f1e68]:
              - button "Für 14 Tage zurückstellen" [ref=f1e69] [cursor=pointer]
              - button "Einladung ausblenden" [ref=f1e74] [cursor=pointer]
          - generic [ref=f1e78]:
            - generic [ref=f1e79]: Dein Gedanke
            - heading "Ein Gedanke zum Weiterdenken" [level=1] [ref=f1e84]
            - generic [ref=f1e85]: Meine frühere Frage darf bleiben. Auch nach einer Pause kann ich in Ruhe weiterdenken.
            - generic [ref=f1e86]: Zuletzt festgehalten am 4. Oktober 2026
            - button "Gedanken öffnen" [ref=f1e87] [cursor=pointer]
            - generic [ref=f1e91]:
              - button "Für 14 Tage zurückstellen" [ref=f1e92] [cursor=pointer]
              - button "Einladung ausblenden" [ref=f1e97] [cursor=pointer]
        - generic [ref=f1e101]:
          - generic [ref=f1e102]: Ein wenig Abstand. Kein Maßstab.
          - generic [ref=f1e103]: Der Zeitraum beginnt bei deinem letzten gespeicherten Schritt, Rückblick oder verknüpften Gedanken. Eine reine Textkorrektur am Vorhaben oder Rückblick zählt nicht als neue Erfahrung. Archivierte Vorhaben erscheinen hier nicht.
          - generic [ref=f1e104]: Öffnen, Zurückstellen und Ausblenden verändern weder deinen Olivenbaum noch deinen Lesefortschritt. Markierungen ohne gespeichertes Datum erhalten keine erfundene Erinnerung.
    - navigation "Hauptnavigation" [ref=f1e105]:
      - button "Heute" [ref=f1e106] [cursor=pointer]
      - button "Bibel" [ref=f1e110] [cursor=pointer]
      - button "Wege" [ref=f1e114] [cursor=pointer]
      - button "Mein Garten" [ref=f1e119] [cursor=pointer]
      - button "Sammlung" [ref=f1e124] [cursor=pointer]
  - generic [ref=f1e128]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  346 | });
  347 | 
  348 | test("Quellenlinks zeigen das richtige Vorhaben und den Gedanken schreibfrei, auch wenn bereits ein anderer Entwurf besteht", async ({
  349 |   page,
  350 | }) => {
  351 |   const draftText = "Meine unvollendeten anderen Worte.";
  352 |   const { data, raw } = await seed(page, {
  353 |     enabled: true,
  354 |     change: (data) => {
  355 |       data.drafts = [
  356 |         {
  357 |           id: "existing-draft",
  358 |           key: "journal",
  359 |           type: "journal",
  360 |           revision: 2,
  361 |           updatedAt: new Date(now).toISOString(),
  362 |           values: {
  363 |             entityId: "new-thought",
  364 |             targetId: null,
  365 |             baseUpdatedAt: null,
  366 |             text: draftText,
  367 |             kind: "note",
  368 |           },
  369 |         },
  370 |       ];
  371 |     },
  372 |   });
  373 |   await goalCard(page)
  374 |     .getByRole("button", { name: "Zum Vorhaben", exact: true })
  375 |     .click();
  376 |   await expect(page).toHaveURL(/\/vorhaben\/g1(?:\?|$)/);
  377 |   await expect(
  378 |     page.getByRole("heading", { name: goalTitle, exact: true }),
  379 |   ).toBeVisible();
  380 |   expect(await rawData(page)).toEqual(raw);
  381 |   await page.goBack();
  382 |   await ready(page);
  383 |   await noteCard(page)
  384 |     .getByRole("button", { name: "Gedanken öffnen", exact: true })
  385 |     .click();
  386 |   await expect(page).toHaveURL(/\/sammlung\?note=n1&view=read/);
  387 |   const thought = visible(page, "collection-note-n1");
  388 |   await expect(
  389 |     thought.getByText("Dein wiederentdeckter Gedanke", { exact: true }),
  390 |   ).toBeVisible();
  391 |   await expect(thought.getByText(noteText, { exact: true })).toBeVisible();
  392 |   await expect(
  393 |     page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  394 |   ).toHaveCount(0);
  395 |   expect(await rawData(page)).toEqual(raw);
  396 |   await thought
  397 |     .getByRole("button", { name: "Bearbeiten", exact: true })
  398 |     .click();
  399 |   await expect(
  400 |     page.getByText(
  401 |       "Du hast einen anderen Entwurf. Setze ihn fort oder verwirf ihn im Editor ausdrücklich, bevor du einen anderen Gedanken bearbeitest.",
  402 |       { exact: true },
  403 |     ),
  404 |   ).toBeVisible();
  405 |   await expect(
  406 |     page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  407 |   ).toHaveValue(draftText);
  408 |   expect((await localData(page)).drafts).toEqual(data.drafts);
  409 |   await unchangedExperience(page, data);
  410 | });
  411 | 
  412 | test("Einladungen bleiben bei 320 Pixeln in Hell und Dunkel sowie auf großem Display zugänglich und ohne Überlauf", async ({
  413 |   page,
  414 | }) => {
  415 |   await page.emulateMedia({ reducedMotion: "reduce" });
  416 |   const { data } = await seed(page, {
  417 |     enabled: true,
  418 |     change: (data) => {
  419 |       data.settings.reducedMotion = true;
  420 |     },
  421 |   });
  422 |   const screens = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/invitations/screens`;
  423 |   await mkdir(screens, { recursive: true });
  424 |   for (const [width, theme] of [
  425 |     [320, "light"],
  426 |     [320, "dark"],
  427 |     [1440, "light"],
  428 |   ] as const) {
  429 |     await page.setViewportSize({ width, height: 844 });
  430 |     const toggle = page.getByRole("button", {
  431 |       name:
  432 |         theme === "dark"
  433 |           ? "Dunklen Modus aktivieren"
  434 |           : "Hellen Modus aktivieren",
  435 |       exact: true,
  436 |     });
  437 |     if (await toggle.count()) await toggle.click();
  438 |     await expect
  439 |       .poll(async () => (await localData(page)).settings.theme)
  440 |       .toBe(theme);
  441 |     await expect(goalCard(page)).toBeVisible();
  442 |     const action = goalCard(page).getByRole("button", {
  443 |       name: "Für 14 Tage zurückstellen",
  444 |       exact: true,
  445 |     });
> 446 |     await action.scrollIntoViewIfNeeded();
      |                  ^ Error: locator.scrollIntoViewIfNeeded: Test timeout of 120000ms exceeded.
  447 |     const bounds = await action.boundingBox();
  448 |     expect(bounds!.height).toBeGreaterThanOrEqual(44);
  449 |     expect(bounds!.x).toBeGreaterThanOrEqual(0);
  450 |     expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
  451 |     await expect
  452 |       .poll(() =>
  453 |         page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  454 |       )
  455 |       .toBe(true);
  456 |     expect(
  457 |       await page.evaluate(
  458 |         () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  459 |       ),
  460 |     ).toBe(true);
  461 |     await page.screenshot({
  462 |       path: `${screens}/invitations-${width}-${theme}.png`,
  463 |       fullPage: true,
  464 |     });
  465 |     const axe = await new AxeBuilder({ page }).analyze();
  466 |     expect(axe.violations).toEqual([]);
  467 |   }
  468 |   expect((await localData(page)).settings.reducedMotion).toBe(true);
  469 |   await unchangedExperience(page, data);
  470 | });
  471 | 
  472 | test("ein echter konkurrierender IndexedDB-Stand wird beim Ausblenden aus einer alten Ansicht nicht überschrieben", async ({
  473 |   page,
  474 | }) => {
  475 |   const { raw } = await seed(page, { enabled: true });
  476 |   const changed = structuredClone(raw);
  477 |   changed.data.goals[0]!.title = "In einem anderen Fenster weitergedacht";
  478 |   changed.data.goals[0]!.revision++;
  479 |   changed.data.revision++;
  480 |   await putMain(page, changed);
  481 |   await goalCard(page)
  482 |     .getByRole("button", { name: "Einladung ausblenden", exact: true })
  483 |     .click();
  484 |   await expect(
  485 |     page.getByText(
  486 |       "Ein anderes Fenster hat die Daten geändert. Lade die App neu; deine Eingabe bleibt hier erhalten.",
  487 |       { exact: true },
  488 |     ),
  489 |   ).toBeVisible();
  490 |   expect(await rawData(page)).toEqual(changed);
  491 |   await expect(
  492 |     goalCard(page).getByRole("button", {
  493 |       name: "Einladung ausblenden",
  494 |       exact: true,
  495 |     }),
  496 |   ).toBeEnabled();
  497 |   await page.reload();
  498 |   await ready(page);
  499 |   await expect(
  500 |     goalCard(page).getByRole("heading", {
  501 |       name: changed.data.goals[0]!.title,
  502 |       exact: true,
  503 |     }),
  504 |   ).toBeVisible();
  505 |   expect(await rawData(page)).toEqual(changed);
  506 | });
  507 | 
```