# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: spiritual-word.spec.ts >> der quellentreue Vers und sein friedlicher Zusammenhang öffnen den gemeinsamen Reader
- Location: tests/e2e/spiritual-word.spec.ts:107:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "/lesen/EPH"
Received: "/bibel"
```

# Page snapshot

```yaml
- generic [ref=f2e1]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  23  | async function records(page: Page) {
  24  |   return page.evaluate(() => new Promise((resolve, reject) => {
  25  |     const request = indexedDB.open("oliva-local-v1", 1);
  26  |     request.onerror = () => reject(request.error);
  27  |     request.onsuccess = () => {
  28  |       const db = request.result, tx = db.transaction("state", "readonly"), store = tx.objectStore("state");
  29  |       const keys = store.getAllKeys(), values = store.getAll();
  30  |       tx.oncomplete = () => { db.close(); resolve(keys.result.map((key, i) => [key, values.result[i]])); };
  31  |       tx.onerror = () => { db.close(); reject(tx.error); };
  32  |     };
  33  |   }));
  34  | }
  35  | 
  36  | async function ready(page: Page) {
  37  |   const image = visible(page, "spiritual-sword-image");
  38  |   await expect(image).toBeVisible();
  39  |   await expect.poll(() => image.evaluate(node => {
  40  |     const im = node instanceof HTMLImageElement ? node : node.querySelector("img");
  41  |     return !!im && im.complete && im.naturalWidth === 512 && im.naturalHeight === 768;
  42  |   })).toBe(true);
  43  |   return image;
  44  | }
  45  | 
  46  | async function noBookSwords(page: Page) {
  47  |   await expect(page.getByText(retired).filter({ visible: true })).toHaveCount(0);
  48  |   await expect(page.locator('[data-testid^="book-sword"], [data-testid="sword-art"], [data-testid="sword-confirmation"]')).toHaveCount(0);
  49  | }
  50  | 
  51  | async function theme(page: Page, value: "light" | "dark") {
  52  |   const raw = structuredClone(await rawData(page));
  53  |   expect(raw.data.version).toBe(11);
  54  |   raw.data.onboarded = true;
  55  |   raw.data.settings.theme = value;
  56  |   raw.data.readChapters = ["JHN:1"];
  57  |   raw.data.revision++;
  58  |   await page.evaluate(value => new Promise<void>((resolve, reject) => {
  59  |     const request = indexedDB.open("oliva-local-v1", 1);
  60  |     request.onsuccess = () => {
  61  |       const db = request.result, tx = db.transaction("state", "readwrite");
  62  |       tx.objectStore("state").put(value, "main");
  63  |       tx.oncomplete = () => { db.close(); resolve(); };
  64  |       tx.onerror = () => { db.close(); reject(tx.error); };
  65  |     };
  66  |     request.onerror = () => reject(request.error);
  67  |   }), raw);
  68  | }
  69  | 
  70  | test("der Bibelhub öffnet alle66Bücher und1189Kapitel ohne Buchschwert-Auswahl oder Datenänderung", async ({ page }) => {
  71  |   await profile(page);
  72  |   const before = await records(page);
  73  |   await page.goto("/bibel");
  74  |   await ready(page);
  75  |   await expect(page.getByRole("combobox", { name: "Bibelbereich", exact: true })).toHaveValue("Alle");
  76  |   await expect(page.getByRole("button", { name: /, \d+ Kapitel$/ })).toHaveCount(66);
  77  |   await noBookSwords(page);
  78  |   for (const book of BOOKS) {
  79  |     const row = page.getByRole("button", { name: `${book.name}, ${book.chapters} Kapitel`, exact: true });
  80  |     await row.click();
  81  |     await expect(page.getByRole("button", { name: new RegExp(`^${escape(book.name)}, Kapitel \\d+(, gelesen)?$`) })).toHaveCount(book.chapters);
  82  |     await expect(page.getByRole("button", { name: `${book.name}, Kapitel ${book.chapters}`, exact: true })).toBeEnabled();
  83  |     await row.click();
  84  |   }
  85  |   expect(await records(page)).toEqual(before);
  86  | });
  87  | 
  88  | test("alle66altenBuch-Links öffnen ruhige Buchübersichten und keine Schwertseiten", async ({ page }) => {
  89  |   test.setTimeout(240000);
  90  |   await profile(page);
  91  |   const before = await records(page);
  92  |   for (const book of BOOKS) {
  93  |     await page.goto(`/buch/${book.code}`);
  94  |     await expect(page.getByRole("heading", { name: book.name, exact: true })).toBeVisible();
  95  |     await expect(visible(page, "book-overview")).toBeVisible();
  96  |     await expect(page.getByRole("button", { name: `${book.name}, Kapitel ${book.chapters}`, exact: true })).toBeEnabled();
  97  |     await noBookSwords(page);
  98  |     await expect(page.getByTestId("spiritual-sword-image")).toHaveCount(0);
  99  |   }
  100 |   expect(await records(page)).toEqual(before);
  101 |   await page.goto("/buch/UNKNOWN");
  102 |   await expect(page.getByText("Dieses Buch gibt es hier nicht.", { exact: true })).toBeVisible();
  103 |   await page.getByRole("button", { name: "Zur Bibel", exact: true }).click();
  104 |   await ready(page);
  105 | });
  106 | 
  107 | test("der quellentreue Vers und sein friedlicher Zusammenhang öffnen den gemeinsamen Reader", async ({ page }) => {
  108 |   await profile(page);
  109 |   const before = await localData(page);
  110 |   for (const ref of [
  111 |     { label: "Epheser 6,17 lesen", from: 17, to: 17 },
  112 |     { label: "Epheser 6,10–18 lesen", from: 10, to: 18 },
  113 |   ]) {
  114 |     await page.goto("/bibel");
  115 |     const card = visible(page, "spiritual-word-card");
  116 |     await expect(card.getByText("… und das Schwert des Geistes, welches ist das Wort Gottes.", { exact: true })).toBeVisible();
  117 |     await expect(card.getByText("OLIVA-EINORDNUNG", { exact: true })).toBeVisible();
  118 |     await expect(card.getByText("Gottes Wort kann uns Orientierung, Halt und Stärke schenken – im Alltag und in schweren Zeiten.", { exact: true })).toBeVisible();
  119 |     await expect(card.getByText(/richtet sich nicht gegen Menschen/)).toBeVisible();
  120 |     await expect(card.getByRole("progressbar")).toHaveCount(0);
  121 |     await card.getByRole("button", { name: ref.label, exact: true }).click();
  122 |     const url = new URL(page.url());
> 123 |     expect(url.pathname).toBe("/lesen/EPH");
      |                          ^ Error: expect(received).toBe(expected) // Object.is equality
  124 |     expect(Object.fromEntries(url.searchParams)).toMatchObject({ chapter: "6", from: String(ref.from), to: String(ref.to) });
  125 |     await expect(page.getByRole("button", { name: new RegExp(`^Vers ${ref.from}:`) })).toHaveAccessibleName(/· im Fokus$/);
  126 |     await expect.poll(async () => (await localData(page))?.reading.book).toBe("EPH");
  127 |     const after = await localData(page);
  128 |     for (const key of ["readChapters", "readPassages", "notes", "bookmarks", "highlights", "growthStage"] as const)
  129 |       expect(after[key]).toEqual(before[key]);
  130 |   }
  131 | });
  132 | 
  133 | test("der Hub bleibt bei320/1440Pixeln in Hell/Dunkel mit reduzierter Bewegung barrierearm", async ({ page }) => {
  134 |   await mkdir(screens, { recursive: true });
  135 |   await profile(page);
  136 |   await page.emulateMedia({ reducedMotion: "reduce" });
  137 |   for (const color of ["light", "dark"] as const) {
  138 |     await theme(page, color);
  139 |     const before = await records(page);
  140 |     for (const width of [320, 1440]) {
  141 |       await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
  142 |       await page.goto("/bibel");
  143 |       const art = await ready(page);
  144 |       const box = await art.boundingBox();
  145 |       expect(box!.height / box!.width).toBe(1.5);
  146 |       expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  147 |       const search = await page.getByRole("textbox", { name: "Buch suchen", exact: true }).boundingBox();
  148 |       const card = await visible(page, "spiritual-word-card").boundingBox();
  149 |       expect(search!.y).toBeLessThan(card!.y);
  150 |       expect(search!.y).toBeLessThan(width === 320 ? 568 : 1000);
  151 |       await expect(page.getByRole("img", { name: "Ein friedliches Schwert als Symbol für Gottes Wort", exact: true })).toHaveCount(1);
  152 |       await page.screenshot({ path: `${screens}/hub-top-${width}-${color}.png` });
  153 |       await visible(page, "spiritual-word-card").screenshot({ path: `${screens}/word-${width}-${color}.png` });
  154 |       await page.screenshot({ path: `${screens}/hub-${width}-${color}.png` });
  155 |       expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  156 |       expect(await records(page)).toEqual(before);
  157 |     }
  158 |   }
  159 | });
  160 | 
  161 | test("das einzelne Symbol und alle Bücher bleiben beim Offline-Neustart ohne Schreibvorgang verfügbar", async ({ page, context }) => {
  162 |   await profile(page);
  163 |   const before = await records(page);
  164 |   await page.goto("/bibel");
  165 |   await ready(page);
  166 |   await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  167 |   await context.setOffline(true);
  168 |   await page.reload();
  169 |   await ready(page);
  170 |   await expect(page.getByRole("button", { name: /, \d+ Kapitel$/ })).toHaveCount(66);
  171 |   await noBookSwords(page);
  172 |   expect(await records(page)).toEqual(before);
  173 | });
  174 | 
  175 | test("Startseite und Sammlung bleiben frei von Schwertern; bestätigtes Lesen behält seinen normalen Fortschritt", async ({ page }) => {
  176 |   await profile(page);
  177 |   await page.goto("/");
  178 |   const card = visible(page, "home-current-book");
  179 |   await expect(card.getByRole("button", { name: "Kapitelübersicht öffnen", exact: true })).toBeVisible();
  180 |   await expect(card.getByRole("progressbar")).toHaveCount(1);
  181 |   await noBookSwords(page);
  182 |   await page.goto("/sammlung");
  183 |   await expect(page.getByRole("button", { name: "Buchschwerter", exact: true })).toHaveCount(0);
  184 |   await noBookSwords(page);
  185 |   await page.goto("/lesen/MRK?chapter=4");
  186 |   await page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true }).click();
  187 |   await expect.poll(async () => (await localData(page))?.readChapters).toEqual(["MRK:4"]);
  188 |   await noBookSwords(page);
  189 |   await page.goto("/buch/MRK");
  190 |   await expect(page.getByText("1 von 16 Kapiteln gelesen", { exact: true })).toBeVisible();
  191 |   await expect(page.getByRole("button", { name: "Markus, Kapitel 4, gelesen", exact: true })).toBeEnabled();
  192 | });
  193 | 
  194 | test.describe("einzelnes Bild bei echtem Ladefehler", () => {
  195 |   test.use({ serviceWorkers: "block" });
  196 |   test("Vers und Navigation bleiben bedienbar; bewusster Retry dekodiert das Original", async ({ page }) => {
  197 |     await profile(page);
  198 |     const before = await records(page), requested = new Set<string>();
  199 |     await page.route(imagePattern, route => { requested.add(route.request().url()); return route.abort(); });
  200 |     await page.goto("/bibel");
  201 |     await expect(page.getByText("Bild gerade nicht verfügbar.", { exact: true })).toBeVisible();
  202 |     expect(requested.size).toBe(1);
  203 |     await expect(page.getByRole("button", { name: "Epheser 6,17 lesen", exact: true })).toBeEnabled();
  204 |     await expect(page.getByRole("button", { name: "Markus, 16 Kapitel", exact: true })).toBeEnabled();
  205 |     await page.unroute(imagePattern);
  206 |     await page.getByRole("button", { name: "Bild laden", exact: true }).click();
  207 |     await ready(page);
  208 |     expect(await records(page)).toEqual(before);
  209 |   });
  210 | });
  211 | 
  212 | test.describe("hochauflösende Browserdarstellung", () => {
  213 |   test.use({ deviceScaleFactor: 3 });
  214 |   test("die eine512erDatei reicht für den vollständigen80x120Bildrahmen", async ({ page }) => {
  215 |     await profile(page);
  216 |     const before = await records(page);
  217 |     await page.goto("/bibel");
  218 |     const art = await ready(page), box = await art.boundingBox();
  219 |     expect(box!.width * 3).toBeLessThanOrEqual(512);
  220 |     expect(box!.height * 3).toBeLessThanOrEqual(768);
  221 |     expect(await records(page)).toEqual(before);
  222 |   });
  223 | });
```