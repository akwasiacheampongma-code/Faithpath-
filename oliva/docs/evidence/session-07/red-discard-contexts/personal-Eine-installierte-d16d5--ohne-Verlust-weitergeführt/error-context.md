# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: personal.spec.ts >> Eine installierte V1-Datenbank wird ohne Verlust weitergeführt
- Location: tests/e2e/personal.spec.ts:234:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Meine alten eigenen Worte.', { exact: true })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('Meine alten eigenen Worte.', { exact: true }) with timeout 15000ms
  - waiting for getByText('Meine alten eigenen Worte.', { exact: true })

```

```yaml
- img
- text: Deine Worte bewahren
- heading "Dein Speicher braucht Aufmerksamkeit." [level=1]
- text: Die vorhandenen Daten konnten nicht sicher gelesen werden. Sie wurden nicht durch einen leeren Stand ersetzt. Sichere zuerst, was da ist. Die Reparatursicherung enthält den gespeicherten Bestand einschließlich persönlicher Texte und möglicher beschädigter Einträge. Sie dient der Wiederherstellung mit technischer Hilfe und ist keine normale OLIVA-Sicherung. Die Übergabe an den Dateidialog bestätigt noch keine gespeicherte externe Datei.
- button "Unveränderten Speicher sichern":
  - text: Unveränderten Speicher sichern
  - img
- button "Lokalen Speicher erneut lesen":
  - text: Lokalen Speicher erneut lesen
  - img
- alert: Die lokalen Daten sind beschädigt. Bitte sichere sie, bevor du den Speicher zurücksetzt.
- text: Bis der Bestand wieder lesbar ist, werden keine neuen Einträge gespeichert. Eine Reparatur sollte immer an einer Kopie erfolgen. Für den Offline-Neustart bereit.
```

# Test source

```ts
  178 |   expect(state.goals[0]?.title).toBe("Miteinander im Gespräch bleiben");
  179 |   expect(state.goals[0]?.reviews[0]?.source.title).toBe("In Ruhe zuhören");
  180 |   expect(state.goals[0]?.reviews[0]?.source.steps).toHaveLength(2);
  181 |   await page
  182 |     .getByRole("button", { name: "Vorhaben ins Archiv legen", exact: true })
  183 |     .click();
  184 |   await expect(page.getByText("Dieses Vorhaben ruht im Archiv.")).toBeVisible();
  185 |   await page
  186 |     .getByRole("button", { name: "Zurück zu deinen Vorhaben", exact: true })
  187 |     .click();
  188 |   await page.getByRole("button", { name: "Archiv", exact: true }).click();
  189 |   await page
  190 |     .getByRole("button", {
  191 |       name: "Vorhaben öffnen: Miteinander im Gespräch bleiben",
  192 |       exact: true,
  193 |     })
  194 |     .click();
  195 |   await page
  196 |     .getByRole("button", { name: "Vorhaben wieder aufnehmen", exact: true })
  197 |     .click();
  198 |   expect((await local(page)).goals[0]?.archivedAt).toBeNull();
  199 |   expect((await local(page)).goals[0]?.reviews).toHaveLength(1);
  200 | });
  201 | test("Ungespeicherte Entwurfsworte werden erst nach ausdrücklichem Verwerfen gelöscht", async ({
  202 |   page,
  203 | }) => {
  204 |   await page.goto("/sammlung");
  205 |   await page
  206 |     .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
  207 |     .click();
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
  245 |   const { goals, drafts, imports, readingPosition, ...rest } = await local(page);
  246 |   const old = {
  247 |     ...rest,
  248 |     version: 1,
  249 |     name: "Ada",
  250 |     readChapters: ["MRK:4"],
  251 |     growthStage: 3,
  252 |     notes: [
  253 |       {
  254 |         id: "legacy-note",
  255 |         text: "Meine alten eigenen Worte.",
  256 |         kind: "note",
  257 |         createdAt: "2026-11-05T12:00:00.000Z",
  258 |         updatedAt: "2026-11-05T12:00:00.000Z",
  259 |       },
  260 |     ],
  261 |   };
  262 |   await page.evaluate(
  263 |     (value) =>
  264 |       new Promise<void>((resolve, reject) => {
  265 |         const r = indexedDB.open("oliva-local-v1", 1);
  266 |         r.onsuccess = () => {
  267 |           const tx = r.result.transaction("state", "readwrite");
  268 |           tx.objectStore("state").put(value, "main");
  269 |           tx.oncomplete = () => resolve();
  270 |           tx.onerror = () => reject(tx.error);
  271 |         };
  272 |       }),
  273 |     old,
  274 |   );
  275 |   await page.goto("/sammlung");
  276 |   await expect(
  277 |     page.getByText("Meine alten eigenen Worte.", { exact: true }),
> 278 |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  279 |   await page
  280 |     .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
  281 |     .click();
  282 |   expect((await local(page)).version).toBe(6);
  283 |   expect((await local(page)).readChapters).toEqual(["MRK:4"]);
  284 |   expect((await local(page)).growthStage).toBe(3);
  285 |   expect((await local(page)).notes[0]?.text).toBe("Meine alten eigenen Worte.");
  286 | });
  287 | test("Bibelbezug wird aus einer Versaktion an ein Vorhaben übergeben", async ({
  288 |   page,
  289 | }) => {
  290 |   await page.goto("/lesen/MRK?chapter=4");
  291 |   await page.getByRole("button", { name: /^Vers 35:/ }).click();
  292 |   await page
  293 |     .getByRole("button", { name: "Mit einem Vorhaben verbinden", exact: true })
  294 |     .click();
  295 |   await expect(page.getByText("Markus 4,35", { exact: true })).toBeVisible();
  296 |   await page
  297 |     .getByRole("textbox", { name: "Name deines Vorhabens" })
  298 |     .fill("Fragen ehrlich aussprechen");
  299 |   await page
  300 |     .getByRole("button", { name: "Vorhaben anlegen", exact: true })
  301 |     .click();
  302 |   await expect(page.getByText("Deine kleinen Schritte")).toBeVisible();
  303 |   expect((await local(page)).goals[0]?.ref).toEqual({
  304 |     book: "MRK",
  305 |     chapter: 4,
  306 |     from: 35,
  307 |     to: 35,
  308 |   });
  309 | });
  310 | test("Neue Vorhaben- und Entwurfsansichten bleiben auf kleinen Displays zugänglich", async ({
  311 |   page,
  312 | }) => {
  313 |   for (const width of [320, 390, 1440]) {
  314 |     await page.setViewportSize({ width, height: 900 });
  315 |     await page.goto("/vorhaben");
  316 |     await page
  317 |       .getByRole("button", { name: "Ein Vorhaben anlegen", exact: true })
  318 |       .click();
  319 |     await page
  320 |       .getByRole("textbox", { name: "Name deines Vorhabens" })
  321 |       .fill("Ein ruhiger Anfang");
  322 |     await saved(page);
  323 |     expect(
  324 |       await page.evaluate(
  325 |         () => document.documentElement.scrollWidth <= innerWidth,
  326 |       ),
  327 |     ).toBe(true);
  328 |     const scan = await new AxeBuilder({ page })
  329 |       .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  330 |       .analyze();
  331 |     expect(scan.violations).toEqual([]);
  332 |     await page
  333 |       .getByRole("button", { name: "Entwurf verwerfen", exact: true })
  334 |       .click();
  335 |     await page
  336 |       .getByRole("button", { name: "Entwurf endgültig verwerfen", exact: true })
  337 |       .click();
  338 |     await expect
  339 |       .poll(async () =>
  340 |         (await local(page)).drafts.some((draft) => draft.key === "goal:new"),
  341 |       )
  342 |       .toBe(false);
  343 |   }
  344 | });
  345 | 
```