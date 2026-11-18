# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core.spec.ts >> Offline-Neustart öffnet auch einen noch nicht besuchten Reader
- Location: tests/e2e/core.spec.ts:284:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Offenbarung', { exact: true }).first()
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Offenbarung', { exact: true }).first() with timeout 15000ms
  - waiting for getByText('Offenbarung', { exact: true }).first()

```

```yaml
- main:
  - button "Zurück":
    - img
  - button "Buchauswahl"
  - button "Leseeinstellungen":
    - img
  - button "Dunklen Modus aktivieren":
    - img
  - heading "Offenbarung 22" [level=1]
  - text: Luther 1912
  - button "Einfach lesen" [pressed]
  - button "Tiefer verstehen"
  - button "Zu Vers springen"
  - button "Lesefokus starten"
  - button "Zum Kapitelanfang"
  - text: Verse antippen, um sie zu markieren, zu kopieren oder eine Notiz zu schreiben.
  - paragraph:
    - 'button "Vers 1: Und er zeigte mir einen lautern Strom des lebendigen Wassers, klar wie ein Kristall; der ging aus von dem Stuhl Gottes und des Lammes."': Und er zeigte mir einen lautern Strom des lebendigen Wassers, klar wie ein Kristall; der ging aus von dem Stuhl Gottes und des Lammes.
    - 'button "Vers 2: Mitten auf ihrer Gasse auf beiden Seiten des Stroms stand Holz des Lebens, das trug zwölfmal Früchte und brachte seine Früchte alle Monate; und die Blätter des Holzes dienten zu der Gesundheit der Heiden."': Mitten auf ihrer Gasse auf beiden Seiten des Stroms stand Holz des Lebens, das trug zwölfmal Früchte und brachte seine Früchte alle Monate; und die Blätter des Holzes dienten zu der Gesundheit der Heiden.
    - 'button "Vers 3: Und es wird kein Verbanntes mehr sein. Und der Stuhl Gottes und des Lammes wird darin sein; und seine Knechte werden ihm dienen"': Und es wird kein Verbanntes mehr sein. Und der Stuhl Gottes und des Lammes wird darin sein; und seine Knechte werden ihm dienen
    - 'button "Vers 4: und sehen sein Angesicht; und sein Name wird an ihren Stirnen sein."': und sehen sein Angesicht; und sein Name wird an ihren Stirnen sein.
    - 'button "Vers 5: Und wird keine Nacht da sein, und sie werden nicht bedürfen einer Leuchte oder des Lichts der Sonne; denn Gott der HERR wird sie erleuchten, und sie werden regieren von Ewigkeit zu Ewigkeit."': Und wird keine Nacht da sein, und sie werden nicht bedürfen einer Leuchte oder des Lichts der Sonne; denn Gott der HERR wird sie erleuchten, und sie werden regieren von Ewigkeit zu Ewigkeit.
  - paragraph:
    - 'button "Vers 6: Und er sprach zu mir: Diese Worte sind gewiß und wahrhaftig; und der HERR, der Gott der Geister der Propheten, hat seinen Engel gesandt, zu zeigen seinen Knechten, was bald geschehen muß."': "Und er sprach zu mir: Diese Worte sind gewiß und wahrhaftig; und der HERR, der Gott der Geister der Propheten, hat seinen Engel gesandt, zu zeigen seinen Knechten, was bald geschehen muß."
    - 'button "Vers 7: Siehe, ich komme bald. Selig ist, der da hält die Worte der Weissagung in diesem Buch."': Siehe, ich komme bald. Selig ist, der da hält die Worte der Weissagung in diesem Buch.
    - 'button "Vers 8: Und ich bin Johannes, der solches gehört hat. Und da ich''s gehört und gesehen, fiel ich nieder, anzubeten zu den Füßen des Engels, der mir solches zeigte."': Und ich bin Johannes, der solches gehört hat. Und da ich's gehört und gesehen, fiel ich nieder, anzubeten zu den Füßen des Engels, der mir solches zeigte.
    - 'button "Vers 9: Und er spricht zu mir: Siehe zu, tu es nicht! denn ich bin dein Mitknecht und deiner Brüder, der Propheten, und derer, die da halten die Worte dieses Buchs. Bete Gott an!"': "Und er spricht zu mir: Siehe zu, tu es nicht! denn ich bin dein Mitknecht und deiner Brüder, der Propheten, und derer, die da halten die Worte dieses Buchs. Bete Gott an!"
    - 'button "Vers 10: Und er spricht zu mir: Versiegle nicht die Worte der Weissagung in diesem Buch; denn die Zeit ist nahe!"': "Und er spricht zu mir: Versiegle nicht die Worte der Weissagung in diesem Buch; denn die Zeit ist nahe!"
  - paragraph:
    - 'button "Vers 11: Wer böse ist, der sei fernerhin böse, und wer unrein ist, der sei fernerhin unrein; aber wer fromm ist, der sei fernerhin fromm, und wer heilig ist, der sei fernerhin heilig."': Wer böse ist, der sei fernerhin böse, und wer unrein ist, der sei fernerhin unrein; aber wer fromm ist, der sei fernerhin fromm, und wer heilig ist, der sei fernerhin heilig.
    - 'button "Vers 12: Siehe, ich komme bald und mein Lohn mit mir, zu geben einem jeglichen, wie seine Werke sein werden."': Siehe, ich komme bald und mein Lohn mit mir, zu geben einem jeglichen, wie seine Werke sein werden.
    - 'button "Vers 13: Ich bin das A und das O, der Anfang und das Ende, der Erste und der Letzte."': Ich bin das A und das O, der Anfang und das Ende, der Erste und der Letzte.
    - 'button "Vers 14: Selig sind, die seine Gebote halten, auf daß sie Macht haben an dem Holz des Lebens und zu den Toren eingehen in die Stadt."': Selig sind, die seine Gebote halten, auf daß sie Macht haben an dem Holz des Lebens und zu den Toren eingehen in die Stadt.
    - 'button "Vers 15: Denn draußen sind die Hunde und die Zauberer und die Hurer und die Totschläger und die Abgöttischen und alle, die liebhaben und tun die Lüge."': Denn draußen sind die Hunde und die Zauberer und die Hurer und die Totschläger und die Abgöttischen und alle, die liebhaben und tun die Lüge.
  - paragraph:
    - 'button "Vers 16: Ich, Jesus, habe gesandt meinen Engel, solches zu bezeugen an die Gemeinden. Ich bin die Wurzel des Geschlechts David, der helle Morgenstern."': Ich, Jesus, habe gesandt meinen Engel, solches zu bezeugen an die Gemeinden. Ich bin die Wurzel des Geschlechts David, der helle Morgenstern.
    - 'button "Vers 17: Und der Geist und die Braut sprechen: Komm! Und wer es hört, der spreche: Komm! Und wen dürstet, der komme; und wer da will, der nehme das Wasser des Lebens umsonst."': "Und der Geist und die Braut sprechen: Komm! Und wer es hört, der spreche: Komm! Und wen dürstet, der komme; und wer da will, der nehme das Wasser des Lebens umsonst."
    - 'button "Vers 18: Ich bezeuge allen, die da hören die Worte der Weissagung in diesem Buch: So jemand dazusetzt, so wird Gott zusetzen auf ihn die Plagen, die in diesem Buch geschrieben stehen."': "Ich bezeuge allen, die da hören die Worte der Weissagung in diesem Buch: So jemand dazusetzt, so wird Gott zusetzen auf ihn die Plagen, die in diesem Buch geschrieben stehen."
    - 'button "Vers 19: Und so jemand davontut von den Worten des Buchs dieser Weissagung, so wird Gott abtun sein Teil von Holz des Lebens und von der heiligen Stadt, davon in diesem Buch geschrieben ist."': Und so jemand davontut von den Worten des Buchs dieser Weissagung, so wird Gott abtun sein Teil von Holz des Lebens und von der heiligen Stadt, davon in diesem Buch geschrieben ist.
    - 'button "Vers 20: Es spricht, der solches bezeugt: Ja, ich komme bald. Amen, ja komm, HERR Jesu!"': "Es spricht, der solches bezeugt: Ja, ich komme bald. Amen, ja komm, HERR Jesu!"
  - paragraph:
    - 'button "Vers 21: Die Gnade unsers HERRN Jesu Christi sei mit euch allen! Amen."': Die Gnade unsers HERRN Jesu Christi sei mit euch allen! Amen.
  - text: Kapitel wechseln
  - button "Vorheriges Kapitel":
    - text: Vorheriges Kapitel
    - img
  - button "Nächstes Kapitel" [disabled]:
    - text: Nächstes Kapitel
    - img
  - button "Kapitel als gelesen bestätigen":
    - text: Kapitel als gelesen bestätigen
    - img
  - text: Lesefortschritt ist eine Erinnerung – keine Bewertung deines Glaubens.
  - img
  - text: In Ruhe weiterdenken Was ist dir im Text begegnet? Fünf Fragen zum ganzen Kapitel helfen dir beim Verstehen. Du kannst jederzeit nachlesen oder pausieren.
  - button "Fragen zu Offenbarung 22 entdecken":
    - text: Fragen zu Offenbarung 22 entdecken
    - img
  - text: "Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org"
- text: Für den Offline-Neustart bereit.
```

# Test source

```ts
  201 |     .toBe(true);
  202 |   await page.reload();
  203 |   await expect(
  204 |     page.getByText("Ein Anfang darf langsam wachsen.", { exact: true }),
  205 |   ).toBeVisible();
  206 | });
  207 | 
  208 | test("Sicherung exportieren, validieren und mit ausdrücklicher Ersetzung wiederherstellen", async ({
  209 |   page,
  210 | }) => {
  211 |   await page.goto("/einstellungen");
  212 |   await page
  213 |     .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
  214 |     .fill("Ada");
  215 |   await page
  216 |     .getByRole("button", { name: "Namen speichern", exact: true })
  217 |     .click();
  218 |   await expect.poll(async () => (await local(page)).name).toBe("Ada");
  219 |   const pending = page.waitForEvent("download");
  220 |   await page
  221 |     .getByRole("button", { name: "Sicherung exportieren", exact: true })
  222 |     .click();
  223 |   const download = await pending;
  224 |   expect(download.suggestedFilename()).toContain("oliva-sicherung-");
  225 |   const snapshot = await local(page);
  226 |   await page
  227 |     .getByRole("button", { name: "Sicherung wiederherstellen", exact: true })
  228 |     .click();
  229 |   const field = page.getByRole("textbox", {
  230 |     name: "Inhalt deiner OLIVA-Sicherung",
  231 |   });
  232 |   await field.fill("{kaputt");
  233 |   await page
  234 |     .getByRole("button", { name: "Sicherung prüfen", exact: true })
  235 |     .click();
  236 |   await expect(page.getByText(/keine gültige OLIVA-Sicherung/)).toBeVisible();
  237 |   expect((await local(page)).name).toBe("Ada");
  238 |   await field.fill(JSON.stringify({ ...snapshot, name: "Miriam" }));
  239 |   await page
  240 |     .getByRole("button", { name: "Sicherung prüfen", exact: true })
  241 |     .click();
  242 |   expect((await local(page)).name).toBe("Ada");
  243 |   await page
  244 |     .getByRole("button", {
  245 |       name: "Daten durch diese Sicherung ersetzen",
  246 |       exact: true,
  247 |     })
  248 |     .click();
  249 |   await expect(
  250 |     page.getByText("Die Sicherung wurde wiederhergestellt."),
  251 |   ).toBeVisible();
  252 |   expect((await local(page)).name).toBe("Miriam");
  253 | });
  254 | 
  255 | test("Baumvorschau verändert keine Daten; reduzierte Bewegung bleibt gespeichert", async ({
  256 |   page,
  257 | }) => {
  258 |   await page.goto("/garten");
  259 |   await expect(page.getByRole("img", { name: /^Samen –/ })).toBeVisible();
  260 |   await page
  261 |     .getByRole("button", {
  262 |       name: "Stadium 7 ansehen: Fruchttragender Olivenbaum",
  263 |       exact: true,
  264 |     })
  265 |     .click();
  266 |   await expect(
  267 |     page.getByText("VORSCHAU · KEIN EIGENER FORTSCHRITT"),
  268 |   ).toBeVisible();
  269 |   await page
  270 |     .getByRole("button", { name: "Zurück zu deinem Baum", exact: true })
  271 |     .click();
  272 |   await expect(page.getByRole("img", { name: /^Samen –/ })).toBeVisible();
  273 |   await page.goto("/einstellungen");
  274 |   await page.getByRole("switch", { name: "Animationen reduzieren" }).click();
  275 |   await expect
  276 |     .poll(async () => (await local(page)).settings.reducedMotion)
  277 |     .toBe(true);
  278 |   await page.reload();
  279 |   await expect(
  280 |     page.getByRole("switch", { name: "Animationen reduzieren" }),
  281 |   ).toBeChecked();
  282 | });
  283 | 
  284 | test("Offline-Neustart öffnet auch einen noch nicht besuchten Reader", async ({
  285 |   page,
  286 |   context,
  287 | }) => {
  288 |   await page.goto("/");
  289 |   await page.getByTestId("home-greeting").waitFor();
  290 |   await page.evaluate(() => navigator.serviceWorker.ready);
  291 |   await expect
  292 |     .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
  293 |     .toBe(true);
  294 |   await expect(
  295 |     page.getByText("Für den Offline-Neustart bereit.", { exact: true }),
  296 |   ).toBeVisible({ timeout: 30000 });
  297 |   await context.setOffline(true);
  298 |   await page.goto("/lesen/REV?chapter=22");
  299 |   await expect(
  300 |     page.getByText("Offenbarung", { exact: true }).first(),
> 301 |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  302 |   await expect(page.getByRole("button", { name: /^Vers 21:/ })).toBeVisible();
  303 |   await page
  304 |     .getByRole("button", {
  305 |       name: "Kapitel als gelesen bestätigen",
  306 |       exact: true,
  307 |     })
  308 |     .click();
  309 |   expect((await local(page)).readChapters).toEqual(["REV:22"]);
  310 |   await page.reload();
  311 |   await expect(
  312 |     page.getByRole("button", { name: "Als gelesen festgehalten", exact: true }),
  313 |   ).toBeDisabled();
  314 |   await context.setOffline(false);
  315 | });
  316 | 
  317 | test("Gleichzeitige Fenster überschreiben keine fremden Änderungen", async ({
  318 |   page,
  319 |   context,
  320 | }) => {
  321 |   await page.goto("/einstellungen");
  322 |   const second = await context.newPage();
  323 |   await second.goto("/einstellungen");
  324 |   await second
  325 |     .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
  326 |     .fill("Zweites Fenster");
  327 |   await page
  328 |     .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
  329 |     .fill("Erstes Fenster");
  330 |   await page
  331 |     .getByRole("button", { name: "Namen speichern", exact: true })
  332 |     .click();
  333 |   await expect
  334 |     .poll(async () => (await local(page)).name)
  335 |     .toBe("Erstes Fenster");
  336 |   await second
  337 |     .getByRole("button", { name: "Namen speichern", exact: true })
  338 |     .click();
  339 |   await expect(
  340 |     second.getByText(/Ein anderes Fenster hat die Daten geändert/),
  341 |   ).toBeVisible();
  342 |   expect((await local(page)).name).toBe("Erstes Fenster");
  343 |   await expect(
  344 |     second.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }),
  345 |   ).toHaveValue("Zweites Fenster");
  346 |   await second.close();
  347 | });
  348 | 
  349 | test("Speicherfehler bestätigt keine Notiz und erhält den getippten Text", async ({
  350 |   page,
  351 | }) => {
  352 |   await page.goto("/sammlung");
  353 |   await page
  354 |     .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
  355 |     .click();
  356 |   await page
  357 |     .getByRole("textbox", { name: "Deine Worte", exact: true })
  358 |     .fill("Dieser Text muss erhalten bleiben.");
  359 |   await page.evaluate(() => {
  360 |     IDBObjectStore.prototype.put = function () {
  361 |       throw new DOMException(
  362 |         "Simulierter voller Speicher",
  363 |         "QuotaExceededError",
  364 |       );
  365 |     };
  366 |   });
  367 |   await page
  368 |     .getByRole("button", { name: "Gedanken speichern", exact: true })
  369 |     .click();
  370 |   await expect(page.getByText(/Speichern fehlgeschlagen/)).toBeVisible();
  371 |   await expect(
  372 |     page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  373 |   ).toHaveValue("Dieser Text muss erhalten bleiben.");
  374 |   const state = await local(page);
  375 |   expect(state?.notes ?? []).toEqual([]);
  376 | });
  377 | 
  378 | test("Kernansichten reflowen bei 320, 390, 768 und 1440 Pixeln; Axe-Prüfung", async ({
  379 |   page,
  380 | }) => {
  381 |   test.setTimeout(120000);
  382 |   for (const width of [320, 390, 768, 1440])
  383 |     for (const route of [
  384 |       "/",
  385 |       "/wege",
  386 |       "/bibel",
  387 |       "/garten",
  388 |       "/sammlung",
  389 |       "/lesen/MRK?chapter=4",
  390 |     ]) {
  391 |       await page.setViewportSize({ width, height: 900 });
  392 |       await page.goto(route);
  393 |       await expect(
  394 |         page.getByText("Dein Raum wird vorbereitet …"),
  395 |       ).not.toBeVisible();
  396 |       await page.waitForFunction(() => document.fonts.status === "loaded");
  397 |       await noOverflow(page);
  398 |     }
  399 |   const violations = [];
  400 |   for (const theme of ["light", "dark"]) {
  401 |     if (theme === "dark") {
```