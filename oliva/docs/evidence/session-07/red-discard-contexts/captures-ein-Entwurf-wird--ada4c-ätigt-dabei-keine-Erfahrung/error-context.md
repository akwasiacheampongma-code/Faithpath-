# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: captures.spec.ts >> ein Entwurf wird erst nach ausdrücklichem Verwerfen gelöscht und bestätigt dabei keine Erfahrung
- Location: tests/e2e/captures.spec.ts:197:1

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  getByText('Deine Erfahrung wurde lokal in der Sammlung gespeichert.', { exact: true })
Expected: not visible
Received: visible
Timeout:  15000ms

Call log:
  - Expect "not toBeVisible" getByText('Deine Erfahrung wurde lokal in der Sammlung gespeichert.', { exact: true }) with timeout 15000ms
  - waiting for getByText('Deine Erfahrung wurde lokal in der Sammlung gespeichert.', { exact: true })
    33 × locator resolved to <div dir="auto" role="alert" class="css-146c3p1">Deine Erfahrung wurde lokal in der Sammlung gespe…</div>
       - unexpected value "visible"

```

```yaml
- alert: Deine Erfahrung wurde lokal in der Sammlung gespeichert.
```

# Test source

```ts
  127 |   expect((await local(page)).notes[0]?.ref?.from).toBe(35);
  128 |   await page.goto("/lesen/MRK?chapter=4");
  129 |   await expect(
  130 |     page.getByRole("button", {
  131 |       name: "Notizentwurf zu Markus 4,36 fortsetzen",
  132 |       exact: true,
  133 |     }),
  134 |   ).toBeVisible();
  135 |   await page
  136 |     .getByRole("button", {
  137 |       name: "Notizentwurf zu Markus 4,36 fortsetzen",
  138 |       exact: true,
  139 |     })
  140 |     .click();
  141 |   await expect(
  142 |     page.getByRole("textbox", { name: "Notiz zu Vers 36", exact: true }),
  143 |   ).toHaveValue("Mein Gedanke zu Vers 36.");
  144 | });
  145 | test("Reflexionsentwurf im Lernweg überlebt Neustart und schließt nur auf ausdrücklichen Klick ab", async ({
  146 |   page,
  147 | }) => {
  148 |   await page.goto("/weg/jesus");
  149 |   await page
  150 |     .getByRole("button", { name: "Abschnitt lesen", exact: true })
  151 |     .click();
  152 |   await page
  153 |     .getByRole("button", {
  154 |       name: "Abschnitt als gelesen bestätigen",
  155 |       exact: true,
  156 |     })
  157 |     .click();
  158 |   await page
  159 |     .getByRole("button", { name: "Zurück zum Weg", exact: true })
  160 |     .click();
  161 |   await page
  162 |     .getByRole("textbox", { name: "Deine Reflexion (freiwillig)", exact: true })
  163 |     .fill("Meine Fragen dürfen offen bleiben.");
  164 |   await saved(page);
  165 |   expect((await local(page)).completedSteps).toEqual([]);
  166 |   expect((await local(page)).notes).toEqual([]);
  167 |   await page.reload();
  168 |   await expect(
  169 |     page.getByRole("textbox", {
  170 |       name: "Deine Reflexion (freiwillig)",
  171 |       exact: true,
  172 |     }),
  173 |   ).toHaveValue("Meine Fragen dürfen offen bleiben.");
  174 |   await page
  175 |     .getByRole("button", {
  176 |       name: "Reflexion speichern & Schritt abschließen",
  177 |       exact: true,
  178 |     })
  179 |     .click();
  180 |   await expect
  181 |     .poll(async () => (await local(page)).completedSteps)
  182 |     .toEqual(["jesus:0"]);
  183 |   const data = await local(page);
  184 |   expect(data.drafts).toEqual([]);
  185 |   expect(data.notes[0]?.captureSource?.type).toBe("guided");
  186 |   await page.goto("/sammlung");
  187 |   await page
  188 |     .getByRole("button", {
  189 |       name: "Damals gezeigte Einordnung ansehen",
  190 |       exact: true,
  191 |     })
  192 |     .click();
  193 |   await expect(
  194 |     page.getByText("BEWAHRTER ENTWURF · KEIN BIBELTEXT", { exact: true }),
  195 |   ).toBeVisible();
  196 | });
  197 | test("ein Entwurf wird erst nach ausdrücklichem Verwerfen gelöscht und bestätigt dabei keine Erfahrung", async ({
  198 |   page,
  199 | }) => {
  200 |   await page.goto("/garten");
  201 |   await page
  202 |     .getByRole("textbox", {
  203 |       name: "Eine freiwillig gelebte Erfahrung",
  204 |       exact: true,
  205 |     })
  206 |     .fill("Ich möchte das später weiterdenken.");
  207 |   await saved(page);
  208 |   await page
  209 |     .getByRole("button", { name: "Entwurf verwerfen", exact: true })
  210 |     .click();
  211 |   await page
  212 |     .getByRole("button", { name: "Entwurf behalten", exact: true })
  213 |     .click();
  214 |   expect((await local(page)).drafts).toHaveLength(1);
  215 |   await page
  216 |     .getByRole("button", { name: "Entwurf verwerfen", exact: true })
  217 |     .click();
  218 |   await page
  219 |     .getByRole("button", { name: "Entwurf endgültig verwerfen", exact: true })
  220 |     .click();
  221 |   await expect.poll(async () => (await local(page)).drafts.length).toBe(0);
  222 |   expect((await local(page)).notes).toEqual([]);
  223 |   await expect(
  224 |     page.getByText("Deine Erfahrung wurde lokal in der Sammlung gespeichert.", {
  225 |       exact: true,
  226 |     }),
> 227 |   ).not.toBeVisible();
      |         ^ Error: expect(locator).not.toBeVisible() failed
  228 | });
  229 | test("der Export nach Navigation enthält den noch nicht abgeschlossenen Reflexionsentwurf", async ({
  230 |   page,
  231 | }) => {
  232 |   await page.goto("/");
  233 |   await page
  234 |     .getByRole("textbox", {
  235 |       name: "Deine freiwillige Tagesreflexion",
  236 |       exact: true,
  237 |     })
  238 |     .fill("Meine letzten Worte vor dem Export.");
  239 |   await page
  240 |     .getByRole("button", { name: /Profil und Einstellungen$/, exact: true })
  241 |     .click();
  242 |   const download = page.waitForEvent("download");
  243 |   await page
  244 |     .getByRole("button", { name: "Sicherung exportieren", exact: true })
  245 |     .click();
  246 |   const file = await (await download).path(),
  247 |     data = JSON.parse(await readFile(file!, "utf8")) as AppData;
  248 |   expect(
  249 |     data.drafts.find((d) => d.key === "capture:daily")?.values,
  250 |   ).toMatchObject({ text: "Meine letzten Worte vor dem Export." });
  251 |   expect(data.notes).toEqual([]);
  252 | });
  253 | test("ein Speicherfehler lässt den Kontextentwurf sichtbar und erzeugt keinen fertigen Eintrag", async ({
  254 |   page,
  255 | }) => {
  256 |   await page.goto("/garten");
  257 |   await page.evaluate(() => {
  258 |     const put = IDBObjectStore.prototype.put;
  259 |     IDBObjectStore.prototype.put = function (value, key) {
  260 |       if (key === "main")
  261 |         throw new DOMException("Speicher voll", "QuotaExceededError");
  262 |       return put.call(this, value, key);
  263 |     };
  264 |   });
  265 |   await page
  266 |     .getByRole("textbox", {
  267 |       name: "Eine freiwillig gelebte Erfahrung",
  268 |       exact: true,
  269 |     })
  270 |     .fill("Diese Worte dürfen nicht verloren gehen.");
  271 |   await expect(
  272 |     page.getByText(/Entwurf konnte nicht gesichert werden/),
  273 |   ).toBeVisible();
  274 |   await page
  275 |     .getByRole("button", { name: "Erfahrung festhalten", exact: true })
  276 |     .click();
  277 |   await expect(
  278 |     page.getByRole("textbox", {
  279 |       name: "Eine freiwillig gelebte Erfahrung",
  280 |       exact: true,
  281 |     }),
  282 |   ).toHaveValue("Diese Worte dürfen nicht verloren gehen.");
  283 |   expect((await local(page))?.notes ?? []).toEqual([]);
  284 | });
  285 | test("ungesicherte Worte überleben einen Bereichswechsel und lassen sich als Sitzungskopie exportieren", async ({
  286 |   page,
  287 | }) => {
  288 |   await page.goto("/garten");
  289 |   await page.evaluate(() => {
  290 |     (window as any).failWrites = true;
  291 |     const put = IDBObjectStore.prototype.put;
  292 |     IDBObjectStore.prototype.put = function (value, key) {
  293 |       if ((window as any).failWrites && key === "main")
  294 |         throw new DOMException("Speicher voll", "QuotaExceededError");
  295 |       return put.call(this, value, key);
  296 |     };
  297 |   });
  298 |   const text = "Meine letzten Worte bleiben auch beim Bereichswechsel.";
  299 |   await page
  300 |     .getByRole("textbox", {
  301 |       name: "Eine freiwillig gelebte Erfahrung",
  302 |       exact: true,
  303 |     })
  304 |     .fill(text);
  305 |   await expect(
  306 |     page.getByText(/Entwurf konnte nicht gesichert werden/),
  307 |   ).toBeVisible();
  308 |   await page
  309 |     .getByRole("button", { name: /Profil und Einstellungen$/, exact: true })
  310 |     .click();
  311 |   await page
  312 |     .getByRole("button", { name: "Sicherung exportieren", exact: true })
  313 |     .click();
  314 |   await expect(
  315 |     page.getByText(/Einige Entwürfe sind noch nicht dauerhaft gesichert/),
  316 |   ).toBeVisible();
  317 |   await page
  318 |     .getByRole("button", {
  319 |       name: "Ungesicherte Entwürfe bewahren",
  320 |       exact: true,
  321 |     })
  322 |     .click();
  323 |   await expect(
  324 |     page.getByText("Nur in dieser Sitzung erhalten", { exact: true }),
  325 |   ).toBeVisible();
  326 |   const download = page.waitForEvent("download");
  327 |   await page
```