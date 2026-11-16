# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: book-search.spec.ts >> die Bibel beginnt mit allen 66 Büchern und grenzt NT und AT ohne persönliche Daten ein
- Location: tests/e2e/book-search.spec.ts:19:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByRole('combobox', { name: 'Bibelbereich', exact: true })
Expected: "Alle"
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByRole('combobox', { name: 'Bibelbereich', exact: true }) with timeout 15000ms
  - waiting for getByRole('combobox', { name: 'Bibelbereich', exact: true })

```

```yaml
- img
- text: OLIVA
- button "Dunklen Modus aktivieren":
  - img
- button "Profil und Einstellungen": Du
- img
- text: Luther 1912 · vollständig offline enthalten
- heading "Worte für dein Leben." [level=1]
- text: 66 Bücher. Viele Stimmen. Eine Einladung zum Entdecken. HIER KANNST DU WEITERLESEN Markus 4 0 Kapitel bewusst als gelesen bestätigt
- button "Weiterlesen":
  - text: Weiterlesen
  - img
- button "Bücher finden"
- button "Bibeltext durchsuchen"
- text: Buch suchen
- textbox "Buch suchen":
  - /placeholder: Zum Beispiel Markus oder Psalmen
- button "Neues Testament"
- button "Altes Testament"
- button "Alle Bücher"
- text: Das Neue Testament erzählt von Jesus und den Anfängen christlicher Gemeinden.
- button "Matthäus, 28 Kapitel":
  - img
  - text: Matthäus 28 Kapitel · 0 gelesen
  - img
- button "Markus, 16 Kapitel":
  - img
  - text: Markus 16 Kapitel · 0 gelesen
  - img
- button "Lukas, 24 Kapitel":
  - img
  - text: Lukas 24 Kapitel · 0 gelesen
  - img
- button "Johannes, 21 Kapitel":
  - img
  - text: Johannes 21 Kapitel · 0 gelesen
  - img
- button "Apostelgeschichte, 28 Kapitel":
  - img
  - text: Apostelgeschichte 28 Kapitel · 0 gelesen
  - img
- button "Römer, 16 Kapitel":
  - img
  - text: Römer 16 Kapitel · 0 gelesen
  - img
- button "1. Korinther, 16 Kapitel":
  - img
  - text: 1. Korinther 16 Kapitel · 0 gelesen
  - img
- button "2. Korinther, 13 Kapitel":
  - img
  - text: 2. Korinther 13 Kapitel · 0 gelesen
  - img
- button "Galater, 6 Kapitel":
  - img
  - text: Galater 6 Kapitel · 0 gelesen
  - img
- button "Epheser, 6 Kapitel":
  - img
  - text: Epheser 6 Kapitel · 0 gelesen
  - img
- button "Philipper, 4 Kapitel":
  - img
  - text: Philipper 4 Kapitel · 0 gelesen
  - img
- button "Kolosser, 4 Kapitel":
  - img
  - text: Kolosser 4 Kapitel · 0 gelesen
  - img
- button "1. Thessalonicher, 5 Kapitel":
  - img
  - text: 1. Thessalonicher 5 Kapitel · 0 gelesen
  - img
- button "2. Thessalonicher, 3 Kapitel":
  - img
  - text: 2. Thessalonicher 3 Kapitel · 0 gelesen
  - img
- button "1. Timotheus, 6 Kapitel":
  - img
  - text: 1. Timotheus 6 Kapitel · 0 gelesen
  - img
- button "2. Timotheus, 4 Kapitel":
  - img
  - text: 2. Timotheus 4 Kapitel · 0 gelesen
  - img
- button "Titus, 3 Kapitel":
  - img
  - text: Titus 3 Kapitel · 0 gelesen
  - img
- button "Philemon, 1 Kapitel":
  - img
  - text: Philemon 1 Kapitel · 0 gelesen
  - img
- button "Hebräer, 13 Kapitel":
  - img
  - text: Hebräer 13 Kapitel · 0 gelesen
  - img
- button "Jakobus, 5 Kapitel":
  - img
  - text: Jakobus 5 Kapitel · 0 gelesen
  - img
- button "1. Petrus, 5 Kapitel":
  - img
  - text: 1. Petrus 5 Kapitel · 0 gelesen
  - img
- button "2. Petrus, 3 Kapitel":
  - img
  - text: 2. Petrus 3 Kapitel · 0 gelesen
  - img
- button "1. Johannes, 5 Kapitel":
  - img
  - text: 1. Johannes 5 Kapitel · 0 gelesen
  - img
- button "2. Johannes, 1 Kapitel":
  - img
  - text: 2. Johannes 1 Kapitel · 0 gelesen
  - img
- button "3. Johannes, 1 Kapitel":
  - img
  - text: 3. Johannes 1 Kapitel · 0 gelesen
  - img
- button "Judas, 1 Kapitel":
  - img
  - text: Judas 1 Kapitel · 0 gelesen
  - img
- button "Offenbarung, 22 Kapitel":
  - img
  - text: Offenbarung 22 Kapitel · 0 gelesen
  - img
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
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { localData, rawData } from "./persistence";
  4   | 
  5   | const bookRows = (page: Page) =>
  6   |   page.getByRole("button", { name: /, \d+ Kapitel$/ });
  7   | const scope = (page: Page) =>
  8   |   page.getByRole("combobox", { name: "Bibelbereich", exact: true });
  9   | const search = (page: Page) =>
  10  |   page.getByRole("textbox", { name: "Buch suchen", exact: true });
  11  | 
  12  | async function savedProfile(page: Page) {
  13  |   await page.goto("/einstellungen");
  14  |   await page.getByRole("textbox", { name: "Dein Vorname (freiwillig)" }).fill("Ada");
  15  |   await page.getByRole("button", { name: "Namen speichern", exact: true }).click();
  16  |   await expect.poll(async () => (await localData(page))?.name).toBe("Ada");
  17  | }
  18  | 
  19  | test("die Bibel beginnt mit allen 66 Büchern und grenzt NT und AT ohne persönliche Daten ein", async ({ page }) => {
  20  |   await page.goto("/bibel");
> 21  |   await expect(scope(page)).toHaveValue("Alle");
      |                             ^ Error: expect(locator).toHaveValue(expected) failed
  22  |   await expect(scope(page).locator("option")).toHaveText([
  23  |     "Gesamte Bibel",
  24  |     "Neues Testament (NT)",
  25  |     "Altes Testament (AT)",
  26  |   ]);
  27  |   await expect(bookRows(page)).toHaveCount(66);
  28  |   expect(await rawData(page)).toBeUndefined();
  29  | 
  30  |   await scope(page).selectOption("NT");
  31  |   await expect(bookRows(page)).toHaveCount(27);
  32  |   await expect(page.getByRole("button", { name: "Markus, 16 Kapitel", exact: true })).toBeVisible();
  33  |   await expect(page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true })).toHaveCount(0);
  34  |   await search(page).fill(" \u00a0\u2009\u202f ");
  35  |   await expect(bookRows(page)).toHaveCount(27);
  36  | 
  37  |   await scope(page).selectOption("AT");
  38  |   await expect(bookRows(page)).toHaveCount(39);
  39  |   await expect(page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true })).toBeVisible();
  40  |   await expect(page.getByRole("button", { name: "Markus, 16 Kapitel", exact: true })).toHaveCount(0);
  41  |   await scope(page).selectOption("Alle");
  42  |   await expect(bookRows(page)).toHaveCount(66);
  43  |   expect(await rawData(page)).toBeUndefined();
  44  | });
  45  | 
  46  | test("Buchnamen vertragen Leertasten, Unicode-Abstände, Großschreibung und Punkte im Zahlpräfix", async ({ page }) => {
  47  |   await savedProfile(page);
  48  |   const before = await rawData(page);
  49  |   await page.goto("/bibel");
  50  | 
  51  |   for (const query of ["Markus ", "  MARKUS  ", "M a r k u s", "\u00a0Mar\u2009kus\u202f"]) {
  52  |     await search(page).fill(query);
  53  |     await expect(bookRows(page)).toHaveCount(1);
  54  |     await expect(page.getByRole("button", { name: "Markus, 16 Kapitel", exact: true })).toBeVisible();
  55  |   }
  56  |   for (const query of ["1 Mose", "1.Mose", "1. Mose", " 1 . M o s e \u00a0", "１．Ｍｏｓｅ"]) {
  57  |     await search(page).fill(query);
  58  |     await expect(bookRows(page)).toHaveCount(1);
  59  |     await expect(page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true })).toBeVisible();
  60  |   }
  61  |   await search(page).fill("\u00a0 \u2009\u202f");
  62  |   await expect(bookRows(page)).toHaveCount(66);
  63  |   expect(await rawData(page)).toEqual(before);
  64  | });
  65  | 
  66  | test("der native Web-Auswahlschalter lässt sich mit der Tastatur bedienen und behält den Fokus", async ({ page }) => {
  67  |   await page.goto("/bibel");
  68  |   expect(await scope(page).evaluate(node => node.tagName)).toBe("SELECT");
  69  |   await scope(page).focus();
  70  |   await expect(scope(page)).toBeFocused();
  71  |   await page.keyboard.press("ArrowDown");
  72  |   await page.keyboard.press("Enter");
  73  |   await expect(scope(page)).toHaveValue("NT");
  74  |   await expect(bookRows(page)).toHaveCount(27);
  75  |   await expect(scope(page)).toBeFocused();
  76  |   await page.keyboard.press("End");
  77  |   await page.keyboard.press("Enter");
  78  |   await expect(scope(page)).toHaveValue("AT");
  79  |   await expect(bookRows(page)).toHaveCount(39);
  80  |   await page.keyboard.press("Home");
  81  |   await page.keyboard.press("Enter");
  82  |   await expect(scope(page)).toHaveValue("Alle");
  83  |   await expect(bookRows(page)).toHaveCount(66);
  84  |   expect(await rawData(page)).toBeUndefined();
  85  | });
  86  | 
  87  | test("Suche und Bereich erhalten Buchschwert-Kontext und öffnen das gewählte Kapitel", async ({ page }) => {
  88  |   await savedProfile(page);
  89  |   const before = await rawData(page);
  90  |   await page.goto("/bibel");
  91  |   await scope(page).selectOption("AT");
  92  |   const query = " 1 . M o s e \u00a0";
  93  |   await search(page).fill(query);
  94  |   await page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true }).click();
  95  |   await page.getByRole("button", { name: "Buchschwert ansehen", exact: true }).click();
  96  |   await expect(page).toHaveURL(/\/buch\/GEN(?:\?|$)/);
  97  |   await expect(page.getByRole("heading", { name: "1. Mose", exact: true })).toBeVisible();
  98  |   expect(await rawData(page)).toEqual(before);
  99  |   await page.getByRole("button", { name: "Zurück", exact: true }).click();
  100 |   await expect(page).toHaveURL(/\/bibel(?:\?|$)/);
  101 |   await expect(scope(page)).toHaveValue("AT");
  102 |   await expect(search(page)).toHaveValue(query);
  103 |   await expect(page.getByRole("button", { name: "1. Mose, 50 Kapitel", exact: true })).toHaveAttribute("aria-expanded", "true");
  104 |   expect(await rawData(page)).toEqual(before);
  105 | 
  106 |   await page.getByRole("button", { name: "1. Mose, Kapitel 1", exact: true }).click();
  107 |   await expect(page).toHaveURL(/\/lesen\/GEN\?chapter=1(?:&|$)/);
  108 |   await expect(page.getByRole("button", { name: /^Vers 1:/ })).toBeVisible();
  109 |   await expect.poll(async () => (await localData(page))?.reading).toMatchObject({ book: "GEN", chapter: 1 });
  110 |   const after = await localData(page);
  111 |   expect(after.readChapters).toEqual(before.data.readChapters);
  112 |   expect(after.bookmarks).toEqual(before.data.bookmarks);
  113 |   expect(after.notes).toEqual(before.data.notes);
  114 |   expect(after.ntStudy).toEqual(before.data.ntStudy);
  115 | });
  116 | 
  117 | test("die NT-Fragenübersicht nutzt dieselbe Buchsuche und bleibt auf ihre 27 Bücher begrenzt", async ({ page }) => {
  118 |   await page.goto("/verstehen");
  119 |   const ntRows = page.getByRole("button", { name: /: Kapitel auswählen$/ });
  120 |   const ntSearch = page.getByRole("textbox", { name: "NT-Buch suchen", exact: true });
  121 |   await expect(ntRows).toHaveCount(27);
```