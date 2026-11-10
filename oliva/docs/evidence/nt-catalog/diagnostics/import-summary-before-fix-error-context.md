# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: imports.spec.ts >> Dateiauswahl ist eine reine Vorschau; Abbrechen verändert keine Daten
- Location: tests/e2e/imports.spec.ts:47:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('1 Vorhaben · 2 Gedanken · 2 Versmarkierungen · 1 Kapitel', { exact: true })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText('1 Vorhaben · 2 Gedanken · 2 Versmarkierungen · 1 Kapitel', { exact: true }) with timeout 15000ms
  - waiting for getByText('1 Vorhaben · 2 Gedanken · 2 Versmarkierungen · 1 Kapitel', { exact: true })

```

```yaml
- banner:
  - img
  - text: OLIVA
  - button "Dunklen Modus aktivieren":
    - img
  - button "A · Profil und Einstellungen": A
- main:
  - img
  - text: Deine Worte dürfen mitkommen
  - heading "Von FaithPath zu OLIVA." [level=1]
  - text: Übernimm deine persönliche V5-Sicherung. Alles wird auf diesem Gerät geprüft. Du entscheidest nach der Vorschau. Zuerst in Ruhe ansehen. Deine bisherigen OLIVA-Einträge bleiben bestehen. Vor der bestätigten Übernahme wird der aktuelle Stand lokal gesichert. Die nächste Übernahme ersetzt diese Rückkehrsicherung; externe Exporte bleiben davon unabhängig. FaithPath-Export mit Datenschema 5, auch wenn außen App-Version 4 steht. Maximal 10 MB. Wiederherstellungs- und Entwurfsdateien sind andere Formate.
  - button "FaithPath-Datei auswählen":
    - text: FaithPath-Datei auswählen
    - img
  - button "JSON stattdessen einfügen"
  - alert: Die Vorschau ist bereit. Es wurden noch keine Inhalte übernommen.
  - img
  - text: "Vorschau · noch nichts übernommen Das kommt mit. 1 Vorhaben · 2 Gedanken · 2 Versmarkierungen · 1 Kapitel · 0 historische NT-Fragenabschlüsse Ein historischer NT-Abschluss bedeutet: Die fünf Fragen des Kapitels wurden in FaithPath angesehen. Einzelne Antworten sind nicht überliefert. Diese Abschlüsse bleiben als Herkunftshinweis sichtbar und erzeugen keinen Lese- oder Baumfortschritt. 1 eindeutige Reflexionsspiegel zusammengeführt. 0 Konflikte bleiben unverändert. Alle Originalfelder einschließlich nicht zuordenbarer Inhalte bleiben im einsehbaren Originalarchiv erhalten. OTB-Stellen werden nicht als Lutherbibel ausgegeben. Frühere Rückblicke bleiben historische Quellen; sie erzeugen keine neue Baumstufe und bestätigen keine Anwendung in OLIVA. Vorhaben · Wird ergänzt In Ruhe zuhören Schritte und Archivstatus werden übernommen. Rückblicke, Meilensteine und frühere Quellen bleiben im Archiv. Gedanke · Wird ergänzt Ich darf mit meinen Fragen kommen. Eigene Worte und zuordenbare Vorhaben-Verbindungen werden übernommen. Reflexionsspiegel · Einmaliger Gedanke r1 Explizite Verknüpfung, gleicher Text, Datum, Übersetzung und Bibelbezug: einmaliger Gedanke; beide Originaldatensätze bleiben erhalten. Gedanke · Wird ergänzt Ein Bezug aus OTB bleibt als OTB erkennbar. OTB · Johannes 14,27. Eigene Worte und zuordenbare Vorhaben-Verbindungen werden übernommen. Markierung · Wird ergänzt Luther 1912 · Markus 4,35–36 2 neue Versmarkierungen. 0 abweichende Farben bleiben unverändert. Originalspanne und Verbindungen bleiben im Archiv. Markierung · Im Originalarchiv h2 OTB · Johannes 14,27. Übersetzung oder Farbe wird im Originalarchiv bewahrt. Kapitelstatus · Wird ergänzt Luther 1912 · Markus 4 Aus dem ausdrücklich bestätigten FaithPath-Kapitelstatus. Kein zusätzlicher Baumfortschritt. NT-Verständnisfragen · Im Originalarchiv Nicht eindeutig zuordenbare Quizdaten 1 Einträge ohne bekannten NT-Kapitelabschluss mit vollständigem UTC-Zeitpunkt und 0 zusätzliche Felder bleiben ausschließlich im Originalarchiv. Es werden daraus keine Antworten oder Erfolge abgeleitet. Originalarchiv · Im Originalarchiv Vollständige Sicherung Alle Originalfelder bleiben erhalten, einschließlich Einstellungen, OTB-Bezügen, Quiz, geführten Plänen, Ereignissen, Rückblicken und Meilensteinen. Bestehende Leseposition, Lernwege, Entwürfe und Baumstufe bleiben bestehen."
  - button "Vorschau erneut prüfen":
    - text: Vorschau erneut prüfen
    - img
  - button "Jetzt sichern und Import übernehmen":
    - text: Jetzt sichern und Import übernehmen
    - img
  - button "Vorschau schließen":
    - text: Vorschau schließen
    - img
  - text: Dein Importarchiv Originaldateien enthalten persönliche Texte. Sie sind lokal gespeichert und Teil deiner OLIVA-Sicherung. Hier erscheint nach einer Übernahme die vollständige Originalquelle.
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
- text: Für den Offline-Neustart bereit.
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import { readFile } from "node:fs/promises";
  3   | import AxeBuilder from "@axe-core/playwright";
  4   | import { faithpathFixture } from "../fixtures/faithpath-v5";
  5   | import type { AppData } from "../../src/state/model";
  6   | import { storedData as stored } from "./persistence";
  7   | async function choose(page: Page, text: string) {
  8   |   const chooser = page.waitForEvent("filechooser");
  9   |   await page
  10  |     .getByRole("button", { name: "FaithPath-Datei auswählen", exact: true })
  11  |     .click();
  12  |   await (
  13  |     await chooser
  14  |   ).setFiles({
  15  |     name: "faithpath-v5.json",
  16  |     mimeType: "application/json",
  17  |     buffer: Buffer.from(text),
  18  |   });
  19  | }
  20  | async function preview(
  21  |   page: Page,
  22  |   text = JSON.stringify(faithpathFixture(), null, 2) + "\n",
  23  | ) {
  24  |   await page.goto("/importieren");
  25  |   await choose(page, text);
  26  |   await expect(page.getByText("Das kommt mit.", { exact: true })).toBeVisible();
  27  | }
  28  | async function apply(page: Page) {
  29  |   await page
  30  |     .getByRole("button", {
  31  |       name: "Jetzt sichern und Import übernehmen",
  32  |       exact: true,
  33  |     })
  34  |     .click();
  35  |   await expect(page.getByText(/Import abgeschlossen/)).toBeVisible();
  36  | }
  37  | async function name(page: Page, value: string) {
  38  |   await page.goto("/einstellungen");
  39  |   await page
  40  |     .getByRole("textbox", { name: "Dein Vorname (freiwillig)" })
  41  |     .fill(value);
  42  |   await page
  43  |     .getByRole("button", { name: "Namen speichern", exact: true })
  44  |     .click();
  45  |   await expect.poll(async () => (await stored(page))?.name).toBe(value);
  46  | }
  47  | test("Dateiauswahl ist eine reine Vorschau; Abbrechen verändert keine Daten", async ({
  48  |   page,
  49  | }) => {
  50  |   await name(page, "Ada");
  51  |   const before = await stored(page);
  52  |   await preview(page);
  53  |   expect(await stored(page)).toEqual(before);
  54  |   expect(await stored(page, "before-faithpath-import")).toBeUndefined();
  55  |   await expect(
  56  |     page.getByText("1 Vorhaben · 2 Gedanken · 2 Versmarkierungen · 1 Kapitel", {
  57  |       exact: true,
  58  |     }),
> 59  |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  60  |   await page
  61  |     .getByRole("button", { name: "Vorschau schließen", exact: true })
  62  |     .click();
  63  |   expect(await stored(page)).toEqual(before);
  64  |   await choose(page, '{"app":"FaithPath-Recovery","main":"alt"}');
  65  |   await expect(
  66  |     page.getByText(/Erwartet wird eine FaithPath-Sicherung mit Datenschema 5/),
  67  |   ).toBeVisible();
  68  |   expect(await stored(page)).toEqual(before);
  69  | });
  70  | test("Import, Quellen-Snapshot, Dateiexport und Neustart funktionieren offline", async ({
  71  |   page,
  72  |   context,
  73  | }) => {
  74  |   await name(page, "Ada");
  75  |   const before = await stored(page),
  76  |     text = JSON.stringify(faithpathFixture(), null, 2) + "\n";
  77  |   await preview(page, text);
  78  |   await apply(page);
  79  |   const data = (await stored(page)) as AppData;
  80  |   expect(data.name).toBe("Ada");
  81  |   expect(data.goals).toHaveLength(1);
  82  |   expect(data.notes).toHaveLength(2);
  83  |   expect(data.growthStage).toBe(before.growthStage);
  84  |   expect(data.readChapters).toEqual(["MRK:4"]);
  85  |   expect((await stored(page, "before-faithpath-import")).data).toEqual(before);
  86  |   await page.goto("/vorhaben/" + data.goals[0]!.id);
  87  |   await expect(
  88  |     page.getByText("Der damalige Gedanke.", { exact: true }),
  89  |   ).toBeVisible();
  90  |   await expect(
  91  |     page.getByText("Mein damaliger Titel", { exact: true }),
  92  |   ).toBeVisible();
  93  |   await page
  94  |     .getByRole("button", {
  95  |       name: "Vollständige Originalquelle ansehen",
  96  |       exact: true,
  97  |     })
  98  |     .click();
  99  |   const download = page.waitForEvent("download");
  100 |   await page
  101 |     .getByRole("button", { name: "Originaldatei exportieren", exact: true })
  102 |     .click();
  103 |   const path = await (await download).path();
  104 |   expect(await readFile(path!, "utf8")).toBe(text);
  105 |   await page.evaluate(async () => {
  106 |     await navigator.serviceWorker.ready;
  107 |     if (!navigator.serviceWorker.controller)
  108 |       await new Promise<void>((resolve) =>
  109 |         navigator.serviceWorker.addEventListener(
  110 |           "controllerchange",
  111 |           () => resolve(),
  112 |           { once: true },
  113 |         ),
  114 |       );
  115 |   });
  116 |   await context.setOffline(true);
  117 |   await page.reload();
  118 |   await expect(
  119 |     page.getByText("Was du mitgebracht hast.", { exact: true }),
  120 |   ).toBeVisible();
  121 |   await page.getByRole("button", { name: "Journal", exact: true }).click();
  122 |   await expect(
  123 |     page.getByText("Ich darf mit meinen Fragen kommen.", { exact: true }),
  124 |   ).toBeVisible();
  125 |   expect((await stored(page)).imports[0].sourceText).toBe(text);
  126 |   await context.setOffline(false);
  127 |   await page.goto("/importieren");
  128 |   await choose(page, text);
  129 |   await expect(page.getByText(/bereits übernommen/)).toBeVisible();
  130 |   expect((await stored(page)).notes).toHaveLength(2);
  131 | });
  132 | test("zwei Fenster schützen Änderungen und erlauben eine erneute Vorschau", async ({
  133 |   page,
  134 |   context,
  135 | }) => {
  136 |   await name(page, "Ada");
  137 |   await preview(page);
  138 |   const other = await context.newPage();
  139 |   await name(other, "Aktueller Name");
  140 |   await page
  141 |     .getByRole("button", {
  142 |       name: "Jetzt sichern und Import übernehmen",
  143 |       exact: true,
  144 |     })
  145 |     .click();
  146 |   await expect(
  147 |     page.getByText(/Ein anderes Fenster hat die Daten geändert/),
  148 |   ).toBeVisible();
  149 |   expect((await stored(page)).imports).toHaveLength(0);
  150 |   expect((await stored(page)).name).toBe("Aktueller Name");
  151 |   expect(await stored(page, "before-faithpath-import")).toBeUndefined();
  152 |   await page
  153 |     .getByRole("button", { name: "Vorschau erneut prüfen", exact: true })
  154 |     .click();
  155 |   await apply(page);
  156 |   expect((await stored(page)).name).toBe("Aktueller Name");
  157 |   expect((await stored(page, "before-faithpath-import")).data.name).toBe(
  158 |     "Aktueller Name",
  159 |   );
```