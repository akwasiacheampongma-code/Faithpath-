# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: romans-sword.spec.ts >> Römer auf einem hochauflösenden Browserdisplay >> die große Ansicht dekodiert 768 Pixel und die Startseite ihre passende kleinere Variante
- Location: tests/e2e/romans-sword.spec.ts:338:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByTestId('home-current-book').visible().getByTestId('book-sword-artwork')
Expected: "false"
Received: "true"
Timeout:  15000ms

Call log:
  - Expect "toHaveAttribute" getByTestId('home-current-book').visible().getByTestId('book-sword-artwork') with timeout 15000ms
  - waiting for getByTestId('home-current-book').visible().getByTestId('book-sword-artwork')
    - locator resolved to <div role="img" aria-busy="true" class="css-g5y9jx" data-testid="book-sword-artwork" aria-label="Schwert der Gnade · 6 Prozent gelesen">…</div>
    - unexpected value "true"

```

```yaml
- img "Schwert der Gnade · 6 Prozent gelesen"
```

# Test source

```ts
  1   | import { test, expect, type Locator, type Page } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { mkdir } from "node:fs/promises";
  4   | import { localData, rawData } from "./persistence";
  5   | 
  6   | const screenshots = `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/romans/screens`;
  7   | const romansPng = "**/romans-grace-pilot-*.png";
  8   | test.use({ screenshot: "only-on-failure" });
  9   | 
  10  | const visible = (page: Page, id: string) => page.getByTestId(id).filter({ visible: true });
  11  | 
  12  | async function savedProfile(page: Page) {
  13  |   await page.goto("/einstellungen");
  14  |   await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Ada");
  15  |   await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  16  |   await expect.poll(async () => (await localData(page))?.name).toBe("Ada");
  17  | }
  18  | 
  19  | async function decoded(frame: Locator, book: "JHN" | "ROM") {
> 20  |   await expect(frame).toHaveAttribute("aria-busy", "false");
      |                       ^ Error: expect(locator).toHaveAttribute(expected) failed
  21  |   await expect(frame.getByTestId("book-sword-vector")).toHaveCount(0);
  22  |   const image = frame.getByTestId("book-sword-image");
  23  |   await expect.poll(() => image.evaluate(node => {
  24  |     const img = node instanceof HTMLImageElement ? node : node.querySelector("img");
  25  |     return !!img && img.complete && img.naturalWidth > 0;
  26  |   })).toBe(true);
  27  |   const actual = await image.evaluate(node => {
  28  |     const img = node instanceof HTMLImageElement ? node : node.querySelector("img");
  29  |     return { width: img!.naturalWidth, height: img!.naturalHeight, source: img!.currentSrc };
  30  |   });
  31  |   expect(actual.source).toContain(book === "ROM" ? "romans-grace-pilot-" : "john-life-pilot-");
  32  |   expect(actual.height / actual.width).toBe(1.5);
  33  |   return actual;
  34  | }
  35  | 
  36  | async function artworkReady(page: Page, book: "JHN" | "ROM" = "ROM") {
  37  |   return decoded(visible(page, "book-sword-artwork"), book);
  38  | }
  39  | 
  40  | async function noOverflow(page: Page) {
  41  |   await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  42  | }
  43  | 
  44  | async function progress(page: Page, chapters: number) {
  45  |   await expect(page.getByText(`${chapters} von 16 Kapiteln gelesen`, { exact: true }).filter({ visible: true })).toBeVisible();
  46  |   const bar = page.getByRole("progressbar", { name: "Lesefortschritt in Römer", exact: true });
  47  |   await expect(bar).toHaveAttribute("aria-valuemin", "0");
  48  |   await expect(bar).toHaveAttribute("aria-valuemax", "100");
  49  |   await expect(bar).toHaveAttribute("aria-valuenow", String(Math.round(chapters / 16 * 100)));
  50  | }
  51  | 
  52  | /** Synthetic history is confined to the test profile; image and navigation
  53  |  * assertions below compare the entire durable document without app decoding. */
  54  | async function priorHistory(page: Page, book: string, chapters = 0, theme: "light" | "dark" = "light") {
  55  |   const raw = structuredClone(await rawData(page));
  56  |   expect(raw.storageVersion).toBe(1);
  57  |   expect(raw.data.version).toBe(9);
  58  |   raw.data.reading = { book, chapter: 1 };
  59  |   raw.data.readingPosition = null;
  60  |   raw.data.onboarded = true;
  61  |   raw.data.readChapters = [...new Set([
  62  |     ...raw.data.readChapters.filter((key: string) => !key.startsWith(`${book}:`)),
  63  |     ...Array.from({ length: chapters }, (_, i) => `${book}:${i + 1}`),
  64  |   ])];
  65  |   raw.data.settings.theme = theme;
  66  |   raw.data.revision++;
  67  |   await page.evaluate(value => new Promise<void>((resolve, reject) => {
  68  |     const request = indexedDB.open("oliva-local-v1", 1);
  69  |     request.onerror = () => reject(request.error);
  70  |     request.onsuccess = () => {
  71  |       const db = request.result, transaction = db.transaction("state", "readwrite");
  72  |       transaction.objectStore("state").put(value, "main");
  73  |       transaction.oncomplete = () => { db.close(); resolve(); };
  74  |       transaction.onerror = () => { db.close(); reject(transaction.error); };
  75  |     };
  76  |   }), raw);
  77  |   return raw;
  78  | }
  79  | 
  80  | async function pulseFromRealClick(page: Page, confirm = false) {
  81  |   const confirmation = page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true });
  82  |   if (confirm) await confirmation.waitFor({ state: "attached" });
  83  |   const button = confirm ? await confirmation.elementHandle() : null;
  84  |   const observer = await page.evaluateHandle(({ button }) => ({
  85  |     result: new Promise<{ maximum: number; final: number; frames: number }>(resolve => {
  86  |       const start = () => {
  87  |         const began = performance.now();
  88  |         let maximum = 0, frames = 0;
  89  |         const sample = (now: number) => {
  90  |           const node = Array.from(document.querySelectorAll('[data-testid="sword-confirmation"]'))
  91  |             .find(node => node.getClientRects().length > 0);
  92  |           const opacity = node ? Number(getComputedStyle(node).opacity) : 0;
  93  |           maximum = Math.max(maximum, opacity); frames++;
  94  |           if (now - began >= 1200) resolve({ maximum, final: opacity, frames });
  95  |           else requestAnimationFrame(sample);
  96  |         };
  97  |         requestAnimationFrame(sample);
  98  |       };
  99  |       if (button) button.addEventListener("click", start, { once: true });
  100 |       else start();
  101 |     }),
  102 |   }), { button });
  103 |   try {
  104 |     if (confirm) await confirmation.click();
  105 |     const result = await observer.evaluate(async observation => observation.result);
  106 |     expect(result.frames).toBeGreaterThan(2);
  107 |     return result;
  108 |   } finally { await observer.dispose(); await button?.dispose(); }
  109 | }
  110 | 
  111 | test("Römer zeigt die eigene Illustration und öffnet seine drei belegten Quellen ohne Lesefortschritt zu erfinden", async ({ page }) => {
  112 |   await savedProfile(page);
  113 |   const before = await rawData(page);
  114 |   await page.goto("/buch/ROM");
  115 |   await expect(page.getByRole("heading", { name: "Römer", exact: true })).toBeVisible();
  116 |   await expect(page.getByText("Schwert der Gnade", { exact: true }).filter({ visible: true })).toBeVisible();
  117 |   await expect(page.getByText(/Gnade ist kein Lohn für deine Aktivität/)).toBeVisible();
  118 |   await artworkReady(page);
  119 |   await progress(page, 0);
  120 |   expect(await rawData(page)).toEqual(before);
```