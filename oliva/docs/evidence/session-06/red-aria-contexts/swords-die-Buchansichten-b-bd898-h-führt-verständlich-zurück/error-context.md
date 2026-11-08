# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: swords.spec.ts >> die Buchansichten bleiben offline erreichbar und ein unbekanntes Buch führt verständlich zurück
- Location: tests/e2e/swords.spec.ts:166:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByTestId('book-sword-artwork')
Expected: "false"
Received: ""
Timeout:  15000ms

Call log:
  - Expect "toHaveAttribute" getByTestId('book-sword-artwork') with timeout 15000ms
  - waiting for getByTestId('book-sword-artwork')
    28 × locator resolved to <div role="img" class="css-g5y9jx" data-testid="book-sword-artwork" aria-label="Schwert des Lebens · 0 Prozent gelesen">…</div>
       - unexpected value "null"

```

```yaml
- img "Schwert des Lebens · 0 Prozent gelesen"
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { mkdir } from "node:fs/promises";
  4   | import { localData, rawData } from "./persistence";
  5   | 
  6   | const screenshots = "docs/evidence/session-06/screens";
  7   | const pilotPng = "**/john-life-pilot-*.png";
  8   | 
  9   | async function savedProfile(page: Page) {
  10  |   await page.goto("/einstellungen");
  11  |   await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Ada");
  12  |   await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  13  |   await expect.poll(async () => (await localData(page))?.name).toBe("Ada");
  14  | }
  15  | 
  16  | async function artworkReady(page: Page) {
  17  |   const artwork = page.getByTestId("book-sword-artwork");
> 18  |   await expect(artwork).toHaveAttribute("aria-busy", "false");
      |                         ^ Error: expect(locator).toHaveAttribute(expected) failed
  19  |   await expect(page.getByTestId("book-sword-vector")).toHaveCount(0);
  20  |   await expect.poll(() => page.getByTestId("book-sword-image").evaluate(node => {
  21  |     const image = node instanceof HTMLImageElement ? node : node.querySelector("img");
  22  |     return !!image && image.complete && image.naturalWidth > 0;
  23  |   })).toBe(true);
  24  | }
  25  | 
  26  | async function noOverflow(page: Page) {
  27  |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  28  | }
  29  | 
  30  | /** Observe real compositor output from the actual click, without product sleeps. */
  31  | async function samplePulse(page: Page, confirm = false) {
  32  |   await page.getByTestId("sword-confirmation").waitFor({ state: "attached" });
  33  |   const confirmation = page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true });
  34  |   const button = confirm ? await confirmation.elementHandle() : null;
  35  |   const observer = await page.evaluateHandle(({ button }) => ({
  36  |     result: new Promise<{ maximum: number; final: number; frames: number }>(resolve => {
  37  |       const start = () => {
  38  |         const began = performance.now();
  39  |         let maximum = 0, frames = 0;
  40  |         const sample = (now: number) => {
  41  |           const node = document.querySelector('[data-testid="sword-confirmation"]');
  42  |           const opacity = node ? Number(getComputedStyle(node).opacity) : 0;
  43  |           maximum = Math.max(maximum, opacity); frames++;
  44  |           if (now - began >= 1200) resolve({ maximum, final: opacity, frames });
  45  |           else requestAnimationFrame(sample);
  46  |         };
  47  |         requestAnimationFrame(sample);
  48  |       };
  49  |       if (button) button.addEventListener("click", start, { once: true });
  50  |       else start();
  51  |     }),
  52  |   }), { button });
  53  |   try {
  54  |     if (confirm) await confirmation.click();
  55  |     const result = await observer.evaluate(async value => value.result);
  56  |     expect(result.frames).toBeGreaterThan(2);
  57  |     return result;
  58  |   } finally { await observer.dispose(); await button?.dispose(); }
  59  | }
  60  | 
  61  | async function progress(page: Page, chapters: number) {
  62  |   await expect(page.getByText(`${chapters} von 21 Kapiteln gelesen`, { exact: true })).toBeVisible();
  63  |   const bar = page.getByRole("progressbar", { name: "Lesefortschritt in Johannes", exact: true });
  64  |   await expect(bar).toHaveAttribute("aria-valuemin", "0");
  65  |   await expect(bar).toHaveAttribute("aria-valuemax", "100");
  66  |   await expect(bar).toHaveAttribute("aria-valuenow", String(Math.round(chapters / 21 * 100)));
  67  | }
  68  | 
  69  | /** Synthetic prior history for visual boundary states; never counted as real reading. */
  70  | async function historyFixture(page: Page, chapters: number, theme: "light" | "dark") {
  71  |   const raw = structuredClone(await rawData(page));
  72  |   expect(raw.storageVersion).toBe(1);
  73  |   expect(raw.data.version).toBe(5);
  74  |   raw.data.readChapters = [...new Set([
  75  |     ...raw.data.readChapters.filter((key: string) => !key.startsWith("JHN:")),
  76  |     "GEN:1", "MRK:4", ...Array.from({ length: chapters }, (_, i) => `JHN:${i + 1}`),
  77  |   ])];
  78  |   raw.data.settings.theme = theme;
  79  |   raw.data.revision++;
  80  |   await page.evaluate(value => new Promise<void>((resolve, reject) => {
  81  |     const request = indexedDB.open("oliva-local-v1", 1);
  82  |     request.onerror = () => reject(request.error);
  83  |     request.onsuccess = () => {
  84  |       const db = request.result, tx = db.transaction("state", "readwrite");
  85  |       tx.objectStore("state").put(value, "main");
  86  |       tx.oncomplete = () => { db.close(); resolve(); };
  87  |       tx.onerror = () => { db.close(); reject(tx.error); };
  88  |     };
  89  |   }), raw);
  90  |   return raw;
  91  | }
  92  | 
  93  | test("das Buchschwert öffnet aus der Bibel, zeigt Johannes groß und verändert keine Lesespuren", async ({ page }) => {
  94  |   await savedProfile(page);
  95  |   const before = await rawData(page);
  96  |   await page.goto("/bibel");
  97  |   await page.getByRole("textbox", { name: "Buch suchen", exact: true }).fill("Johannes");
  98  |   await page.getByRole("button", { name: "Johannes, 21 Kapitel", exact: true }).click();
  99  |   await page.getByRole("button", { name: "Buchschwert ansehen", exact: true }).click();
  100 |   await expect(page).toHaveURL(/\/buch\/JHN(?:\?|$)/);
  101 |   await expect(page.getByRole("heading", { name: "Johannes", exact: true })).toBeVisible();
  102 |   await expect(page.getByText("Schwert des Lebens", { exact: true })).toBeVisible();
  103 |   await progress(page, 0);
  104 |   await artworkReady(page);
  105 |   const frame = await page.getByTestId("book-sword-artwork").boundingBox();
  106 |   expect(frame?.width ?? 0).toBeGreaterThanOrEqual(220);
  107 |   expect(frame?.height ?? 0).toBeGreaterThanOrEqual(330);
  108 |   await expect(page.getByRole("button", { name: "Johannes lesen", exact: true })).toBeVisible();
  109 |   expect(await rawData(page)).toEqual(before);
  110 |   await noOverflow(page);
  111 | });
  112 | 
  113 | test("eine echte Kapitelbestätigung und die drei Quellenlinks bleiben voneinander getrennt", async ({ page }) => {
  114 |   await page.goto("/buch/JHN");
  115 |   await page.getByRole("button", { name: "Johannes lesen", exact: true }).click();
  116 |   await expect(page.getByRole("button", { name: /^Vers 1:/ })).toBeVisible();
  117 |   await page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true }).click();
  118 |   await expect.poll(async () => (await localData(page))?.readChapters).toEqual(["JHN:1"]);
```