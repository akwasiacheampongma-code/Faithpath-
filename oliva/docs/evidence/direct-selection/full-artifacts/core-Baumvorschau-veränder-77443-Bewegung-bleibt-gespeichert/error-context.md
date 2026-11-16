# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: core.spec.ts >> Baumvorschau verändert keine Daten; reduzierte Bewegung bleibt gespeichert
- Location: tests/e2e/core.spec.ts:255:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('img', { name: /^Samen –/ })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('img', { name: /^Samen –/ }) with timeout 15000ms
  - waiting for getByRole('img', { name: /^Samen –/ })

```

```yaml
- banner:
  - img
  - text: OLIVA
  - button "Dunklen Modus aktivieren":
    - img
  - button "Du · Profil und Einstellungen": Du
- main:
  - img
  - text: Dein persönlicher Garten
  - heading "Wachsen braucht Zeit." [level=1]
  - text: Dein Olivenbaum erinnert an gelesene Worte, neue Erkenntnisse und freiwillig festgehaltene Erfahrungen. Er misst weder deinen Glauben noch Gottes Liebe. DEIN BAUM HEUTE
  - img "Samen – Bild deiner persönlichen Lerngeschichte. Keine Glaubensbewertung."
  - text: Samen Dein Anfang ist wertvoll, auch wenn noch nichts sichtbar ist.
  - 'button "Stadium 1 ansehen: Samen" [pressed]'
  - 'button "Stadium 2 ansehen: Keimling"'
  - 'button "Stadium 3 ansehen: Junger Olivenbaum"'
  - 'button "Stadium 4 ansehen: Wachsender Olivenbaum"'
  - 'button "Stadium 5 ansehen: Starker Olivenbaum"'
  - 'button "Stadium 6 ansehen: Erste Früchte"'
  - 'button "Stadium 7 ansehen: Fruchttragender Olivenbaum"'
  - text: Du kannst die sieben Bilder ansehen, ohne deinen Fortschritt zu verändern.
  - button "Alle sieben Lebensbilder ansehen":
    - text: Alle sieben Lebensbilder ansehen
    - img
  - text: Was die Bilder bedeuten Samen Ein Anfang ist schon wertvoll. Wurzeln Ein Fundament zum Weiterdenken. Stamm Beständigkeit in deinem Tempo. Zweige Neue Zusammenhänge entdecken. Blätter Mit den Texten vertrauter werden. Früchte Freiwillig gelebte Werte.
  - img
  - text: Du musst nichts verdienen. Dein Baum verliert in einer Pause keine Blätter. Es gibt keine Rangliste und keine verlorene Serie. Gottes Liebe ist kein Aktivitätsbonus. Was möchtest du im Alltag ausprobieren? Deine persönlichen Vorhaben verbinden kleine, selbst gewählte Schritte mit freiwilligen Rückblicken. Sie dürfen sich verändern und auch eine Pause machen.
  - button "Deine persönlichen Vorhaben":
    - text: Deine persönlichen Vorhaben
    - img
  - text: Ein kleiner Moment im Alltag Hast du etwas bewusst ausprobiert – zugehört, geholfen oder Frieden gesucht? Wenn du möchtest, halte deine Erfahrung fest. Die App entscheidet nicht, ob sie „gut genug“ war. Eine freiwillig gelebte Erfahrung
  - textbox "Eine freiwillig gelebte Erfahrung":
    - /placeholder: Was hast du erlebt?
  - text: Deine Worte werden beim Schreiben als Entwurf lokal gesichert. Erst „Erfahrung festhalten“ legt einen Eintrag in deiner Sammlung an.
  - button "Einen neuen Gedanken entdecken":
    - text: Einen neuen Gedanken entdecken
    - img
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
- text: Offline-Paket wird vorbereitet …
```

# Test source

```ts
  159 |   await page.goto("/sammlung");
  160 |   await page
  161 |     .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
  162 |     .click();
  163 |   await page
  164 |     .getByRole("textbox", { name: "Deine Worte", exact: true })
  165 |     .fill("Ein Anfang darf klein sein.");
  166 |   await page
  167 |     .getByRole("button", { name: "Gedanken speichern", exact: true })
  168 |     .click();
  169 |   await expect(
  170 |     page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  171 |   ).not.toBeVisible();
  172 |   await expect(
  173 |     page.getByText("Ein Anfang darf klein sein.", { exact: true }),
  174 |   ).toBeVisible();
  175 |   await page.getByRole("button", { name: "Bearbeiten", exact: true }).click();
  176 |   await page
  177 |     .getByRole("textbox", { name: "Deine Worte", exact: true })
  178 |     .fill("Ein Anfang darf langsam wachsen.");
  179 |   await page
  180 |     .getByRole("button", { name: "Gedanken speichern", exact: true })
  181 |     .click();
  182 |   await expect(
  183 |     page.getByText("Ein Anfang darf langsam wachsen.", { exact: true }),
  184 |   ).toBeVisible();
  185 |   await page.getByRole("button", { name: "Löschen", exact: true }).click();
  186 |   await page
  187 |     .getByRole("button", { name: "Eintrag jetzt löschen", exact: true })
  188 |     .click();
  189 |   await expect(
  190 |     page.getByText("Ein Anfang darf langsam wachsen.", { exact: true }),
  191 |   ).not.toBeVisible();
  192 |   await page
  193 |     .getByRole("button", { name: "Rückgängig machen", exact: true })
  194 |     .click();
  195 |   await expect
  196 |     .poll(async () =>
  197 |       (await local(page)).notes.some(
  198 |         (note) => note.text === "Ein Anfang darf langsam wachsen.",
  199 |       ),
  200 |     )
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
> 259 |   await expect(page.getByRole("img", { name: /^Samen –/ })).toBeVisible();
      |                                                             ^ Error: expect(locator).toBeVisible() failed
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
  289 |   await page.getByText("Ein Moment, der bleibt.").waitFor();
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
  301 |   ).toBeVisible();
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
```