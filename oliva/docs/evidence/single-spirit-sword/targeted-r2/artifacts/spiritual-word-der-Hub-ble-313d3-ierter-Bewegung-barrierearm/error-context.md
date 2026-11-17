# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: spiritual-word.spec.ts >> der Hub bleibt bei320/1440Pixeln in Hell/Dunkel mit reduzierter Bewegung barrierearm
- Location: tests/e2e/spiritual-word.spec.ts:133:1

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 568
Received:   590
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
      - generic [ref=f1e27]:
        - generic [ref=f1e28]: Luther 1912 · vollständig offline enthalten
        - heading "Worte für dein Leben." [level=1] [ref=f1e32]
        - generic [ref=f1e33]: 66 Bücher. Viele Stimmen. Eine Einladung zum Entdecken.
        - generic [ref=f1e34]:
          - generic [ref=f1e35]: HIER KANNST DU WEITERLESEN
          - generic [ref=f1e36]:
            - generic [ref=f1e37]:
              - generic [ref=f1e38]: Markus 4
              - generic [ref=f1e39]: 1 Kapitel bewusst als gelesen bestätigt
            - button "Weiterlesen" [ref=f1e40] [cursor=pointer]
        - generic [ref=f1e44]:
          - button "Bücher finden" [pressed] [ref=f1e45] [cursor=pointer]
          - button "Bibeltext durchsuchen" [ref=f1e47] [cursor=pointer]
        - generic [ref=f1e49]:
          - generic [ref=f1e50]: Buch suchen
          - textbox "Buch suchen" [ref=f1e51]:
            - /placeholder: Zum Beispiel Markus oder Psalmen
        - generic [ref=f1e53]:
          - generic [ref=f1e54]: Bibelbereich
          - combobox "Bibelbereich" [ref=f1e55] [cursor=pointer]:
            - option "Gesamte Bibel" [selected]
            - option "Neues Testament (NT)"
            - option "Altes Testament (AT)"
        - generic [ref=f1e56]: Die Bibel ist eine Sammlung verschiedener Bücher – von Erzählungen bis zu Briefen.
        - generic [ref=f1e57]:
          - generic [ref=f1e59]:
            - generic [ref=f1e60]: GOTTES WORT TRÄGT
            - generic [ref=f1e61]:
              - img "Ein friedliches Schwert als Symbol für Gottes Wort" [ref=f1e63]:
                - img "Ein friedliches Schwert als Symbol für Gottes Wort" [ref=f1e65]
              - button "Epheser 6,17 lesen" [ref=f1e66] [cursor=pointer]:
                - generic [ref=f1e67]: … und das Schwert des Geistes, welches ist das Wort Gottes.
                - generic [ref=f1e68]: Epheser 6,17 ↗
                - generic [ref=f1e69]: Lutherbibel 1912 · wörtlicher Auszug
            - generic [ref=f1e70]:
              - generic [ref=f1e71]: OLIVA-EINORDNUNG
              - generic [ref=f1e72]: Gottes Wort kann uns Orientierung, Halt und Stärke schenken – im Alltag und in schweren Zeiten.
              - generic [ref=f1e73]: Der Zusammenhang spricht von Wahrheit, Frieden und Gebet. Das Symbol richtet sich nicht gegen Menschen.
            - button "Epheser 6,10–18 lesen" [ref=f1e74] [cursor=pointer]
          - generic [ref=f1e78]:
            - button "1. Mose, 50 Kapitel" [ref=f1e80] [cursor=pointer]:
              - generic [ref=f1e84]:
                - generic [ref=f1e85]: 1. Mose
                - generic [ref=f1e86]: 50 Kapitel · 0 gelesen
            - button "2. Mose, 40 Kapitel" [ref=f1e90] [cursor=pointer]:
              - generic [ref=f1e94]:
                - generic [ref=f1e95]: 2. Mose
                - generic [ref=f1e96]: 40 Kapitel · 0 gelesen
            - button "3. Mose, 27 Kapitel" [ref=f1e100] [cursor=pointer]:
              - generic [ref=f1e104]:
                - generic [ref=f1e105]: 3. Mose
                - generic [ref=f1e106]: 27 Kapitel · 0 gelesen
            - button "4. Mose, 36 Kapitel" [ref=f1e110] [cursor=pointer]:
              - generic [ref=f1e114]:
                - generic [ref=f1e115]: 4. Mose
                - generic [ref=f1e116]: 36 Kapitel · 0 gelesen
            - button "5. Mose, 34 Kapitel" [ref=f1e120] [cursor=pointer]:
              - generic [ref=f1e124]:
                - generic [ref=f1e125]: 5. Mose
                - generic [ref=f1e126]: 34 Kapitel · 0 gelesen
            - button "Josua, 24 Kapitel" [ref=f1e130] [cursor=pointer]:
              - generic [ref=f1e134]:
                - generic [ref=f1e135]: Josua
                - generic [ref=f1e136]: 24 Kapitel · 0 gelesen
            - button "Richter, 21 Kapitel" [ref=f1e140] [cursor=pointer]:
              - generic [ref=f1e144]:
                - generic [ref=f1e145]: Richter
                - generic [ref=f1e146]: 21 Kapitel · 0 gelesen
            - button "Rut, 4 Kapitel" [ref=f1e150] [cursor=pointer]:
              - generic [ref=f1e154]:
                - generic [ref=f1e155]: Rut
                - generic [ref=f1e156]: 4 Kapitel · 0 gelesen
            - button "1. Samuel, 31 Kapitel" [ref=f1e160] [cursor=pointer]:
              - generic [ref=f1e164]:
                - generic [ref=f1e165]: 1. Samuel
                - generic [ref=f1e166]: 31 Kapitel · 0 gelesen
            - button "2. Samuel, 24 Kapitel" [ref=f1e170] [cursor=pointer]:
              - generic [ref=f1e174]:
                - generic [ref=f1e175]: 2. Samuel
                - generic [ref=f1e176]: 24 Kapitel · 0 gelesen
            - button "1. Könige, 22 Kapitel" [ref=f1e180] [cursor=pointer]:
              - generic [ref=f1e184]:
                - generic [ref=f1e185]: 1. Könige
                - generic [ref=f1e186]: 22 Kapitel · 0 gelesen
            - button "2. Könige, 25 Kapitel" [ref=f1e190] [cursor=pointer]:
              - generic [ref=f1e194]:
                - generic [ref=f1e195]: 2. Könige
                - generic [ref=f1e196]: 25 Kapitel · 0 gelesen
            - button "1. Chronik, 29 Kapitel" [ref=f1e200] [cursor=pointer]:
              - generic [ref=f1e204]:
                - generic [ref=f1e205]: 1. Chronik
                - generic [ref=f1e206]: 29 Kapitel · 0 gelesen
            - button "2. Chronik, 36 Kapitel" [ref=f1e210] [cursor=pointer]:
              - generic [ref=f1e214]:
                - generic [ref=f1e215]: 2. Chronik
                - generic [ref=f1e216]: 36 Kapitel · 0 gelesen
            - button "Esra, 10 Kapitel" [ref=f1e220] [cursor=pointer]:
              - generic [ref=f1e224]:
                - generic [ref=f1e225]: Esra
                - generic [ref=f1e226]: 10 Kapitel · 0 gelesen
            - button "Nehemia, 13 Kapitel" [ref=f1e230] [cursor=pointer]:
              - generic [ref=f1e234]:
                - generic [ref=f1e235]: Nehemia
                - generic [ref=f1e236]: 13 Kapitel · 0 gelesen
            - button "Ester, 10 Kapitel" [ref=f1e240] [cursor=pointer]:
              - generic [ref=f1e244]:
                - generic [ref=f1e245]: Ester
                - generic [ref=f1e246]: 10 Kapitel · 0 gelesen
            - button "Hiob, 42 Kapitel" [ref=f1e250] [cursor=pointer]:
              - generic [ref=f1e254]:
                - generic [ref=f1e255]: Hiob
                - generic [ref=f1e256]: 42 Kapitel · 0 gelesen
            - button "Psalmen, 150 Kapitel" [ref=f1e260] [cursor=pointer]:
              - generic [ref=f1e264]:
                - generic [ref=f1e265]: Psalmen
                - generic [ref=f1e266]: 150 Kapitel · 0 gelesen
            - button "Sprüche, 31 Kapitel" [ref=f1e270] [cursor=pointer]:
              - generic [ref=f1e274]:
                - generic [ref=f1e275]: Sprüche
                - generic [ref=f1e276]: 31 Kapitel · 0 gelesen
            - button "Prediger, 12 Kapitel" [ref=f1e280] [cursor=pointer]:
              - generic [ref=f1e284]:
                - generic [ref=f1e285]: Prediger
                - generic [ref=f1e286]: 12 Kapitel · 0 gelesen
            - button "Hohelied, 8 Kapitel" [ref=f1e290] [cursor=pointer]:
              - generic [ref=f1e294]:
                - generic [ref=f1e295]: Hohelied
                - generic [ref=f1e296]: 8 Kapitel · 0 gelesen
            - button "Jesaja, 66 Kapitel" [ref=f1e300] [cursor=pointer]:
              - generic [ref=f1e304]:
                - generic [ref=f1e305]: Jesaja
                - generic [ref=f1e306]: 66 Kapitel · 0 gelesen
            - button "Jeremia, 52 Kapitel" [ref=f1e310] [cursor=pointer]:
              - generic [ref=f1e314]:
                - generic [ref=f1e315]: Jeremia
                - generic [ref=f1e316]: 52 Kapitel · 0 gelesen
            - button "Klagelieder, 5 Kapitel" [ref=f1e320] [cursor=pointer]:
              - generic [ref=f1e324]:
                - generic [ref=f1e325]: Klagelieder
                - generic [ref=f1e326]: 5 Kapitel · 0 gelesen
            - button "Hesekiel, 48 Kapitel" [ref=f1e330] [cursor=pointer]:
              - generic [ref=f1e334]:
                - generic [ref=f1e335]: Hesekiel
                - generic [ref=f1e336]: 48 Kapitel · 0 gelesen
            - button "Daniel, 12 Kapitel" [ref=f1e340] [cursor=pointer]:
              - generic [ref=f1e344]:
                - generic [ref=f1e345]: Daniel
                - generic [ref=f1e346]: 12 Kapitel · 0 gelesen
            - button "Hosea, 14 Kapitel" [ref=f1e350] [cursor=pointer]:
              - generic [ref=f1e354]:
                - generic [ref=f1e355]: Hosea
                - generic [ref=f1e356]: 14 Kapitel · 0 gelesen
            - button "Joel, 3 Kapitel" [ref=f1e360] [cursor=pointer]:
              - generic [ref=f1e364]:
                - generic [ref=f1e365]: Joel
                - generic [ref=f1e366]: 3 Kapitel · 0 gelesen
            - button "Amos, 9 Kapitel" [ref=f1e370] [cursor=pointer]:
              - generic [ref=f1e374]:
                - generic [ref=f1e375]: Amos
                - generic [ref=f1e376]: 9 Kapitel · 0 gelesen
            - button "Obadja, 1 Kapitel" [ref=f1e380] [cursor=pointer]:
              - generic [ref=f1e384]:
                - generic [ref=f1e385]: Obadja
                - generic [ref=f1e386]: 1 Kapitel · 0 gelesen
            - button "Jona, 4 Kapitel" [ref=f1e390] [cursor=pointer]:
              - generic [ref=f1e394]:
                - generic [ref=f1e395]: Jona
                - generic [ref=f1e396]: 4 Kapitel · 0 gelesen
            - button "Micha, 7 Kapitel" [ref=f1e400] [cursor=pointer]:
              - generic [ref=f1e404]:
                - generic [ref=f1e405]: Micha
                - generic [ref=f1e406]: 7 Kapitel · 0 gelesen
            - button "Nahum, 3 Kapitel" [ref=f1e410] [cursor=pointer]:
              - generic [ref=f1e414]:
                - generic [ref=f1e415]: Nahum
                - generic [ref=f1e416]: 3 Kapitel · 0 gelesen
            - button "Habakuk, 3 Kapitel" [ref=f1e420] [cursor=pointer]:
              - generic [ref=f1e424]:
                - generic [ref=f1e425]: Habakuk
                - generic [ref=f1e426]: 3 Kapitel · 0 gelesen
            - button "Zefanja, 3 Kapitel" [ref=f1e430] [cursor=pointer]:
              - generic [ref=f1e434]:
                - generic [ref=f1e435]: Zefanja
                - generic [ref=f1e436]: 3 Kapitel · 0 gelesen
            - button "Haggai, 2 Kapitel" [ref=f1e440] [cursor=pointer]:
              - generic [ref=f1e444]:
                - generic [ref=f1e445]: Haggai
                - generic [ref=f1e446]: 2 Kapitel · 0 gelesen
            - button "Sacharja, 14 Kapitel" [ref=f1e450] [cursor=pointer]:
              - generic [ref=f1e454]:
                - generic [ref=f1e455]: Sacharja
                - generic [ref=f1e456]: 14 Kapitel · 0 gelesen
            - button "Maleachi, 4 Kapitel" [ref=f1e460] [cursor=pointer]:
              - generic [ref=f1e464]:
                - generic [ref=f1e465]: Maleachi
                - generic [ref=f1e466]: 4 Kapitel · 0 gelesen
            - button "Matthäus, 28 Kapitel" [ref=f1e470] [cursor=pointer]:
              - generic [ref=f1e474]:
                - generic [ref=f1e475]: Matthäus
                - generic [ref=f1e476]: 28 Kapitel · 0 gelesen
            - button "Markus, 16 Kapitel" [ref=f1e480] [cursor=pointer]:
              - generic [ref=f1e484]:
                - generic [ref=f1e485]: Markus
                - generic [ref=f1e486]: 16 Kapitel · 0 gelesen
            - button "Lukas, 24 Kapitel" [ref=f1e490] [cursor=pointer]:
              - generic [ref=f1e494]:
                - generic [ref=f1e495]: Lukas
                - generic [ref=f1e496]: 24 Kapitel · 0 gelesen
            - button "Johannes, 21 Kapitel" [ref=f1e500] [cursor=pointer]:
              - generic [ref=f1e504]:
                - generic [ref=f1e505]: Johannes
                - generic [ref=f1e506]: 21 Kapitel · 1 gelesen
            - button "Apostelgeschichte, 28 Kapitel" [ref=f1e510] [cursor=pointer]:
              - generic [ref=f1e514]:
                - generic [ref=f1e515]: Apostelgeschichte
                - generic [ref=f1e516]: 28 Kapitel · 0 gelesen
            - button "Römer, 16 Kapitel" [ref=f1e520] [cursor=pointer]:
              - generic [ref=f1e524]:
                - generic [ref=f1e525]: Römer
                - generic [ref=f1e526]: 16 Kapitel · 0 gelesen
            - button "1. Korinther, 16 Kapitel" [ref=f1e530] [cursor=pointer]:
              - generic [ref=f1e534]:
                - generic [ref=f1e535]: 1. Korinther
                - generic [ref=f1e536]: 16 Kapitel · 0 gelesen
            - button "2. Korinther, 13 Kapitel" [ref=f1e540] [cursor=pointer]:
              - generic [ref=f1e544]:
                - generic [ref=f1e545]: 2. Korinther
                - generic [ref=f1e546]: 13 Kapitel · 0 gelesen
            - button "Galater, 6 Kapitel" [ref=f1e550] [cursor=pointer]:
              - generic [ref=f1e554]:
                - generic [ref=f1e555]: Galater
                - generic [ref=f1e556]: 6 Kapitel · 0 gelesen
            - button "Epheser, 6 Kapitel" [ref=f1e560] [cursor=pointer]:
              - generic [ref=f1e564]:
                - generic [ref=f1e565]: Epheser
                - generic [ref=f1e566]: 6 Kapitel · 0 gelesen
            - button "Philipper, 4 Kapitel" [ref=f1e570] [cursor=pointer]:
              - generic [ref=f1e574]:
                - generic [ref=f1e575]: Philipper
                - generic [ref=f1e576]: 4 Kapitel · 0 gelesen
            - button "Kolosser, 4 Kapitel" [ref=f1e580] [cursor=pointer]:
              - generic [ref=f1e584]:
                - generic [ref=f1e585]: Kolosser
                - generic [ref=f1e586]: 4 Kapitel · 0 gelesen
            - button "1. Thessalonicher, 5 Kapitel" [ref=f1e590] [cursor=pointer]:
              - generic [ref=f1e594]:
                - generic [ref=f1e595]: 1. Thessalonicher
                - generic [ref=f1e596]: 5 Kapitel · 0 gelesen
            - button "2. Thessalonicher, 3 Kapitel" [ref=f1e600] [cursor=pointer]:
              - generic [ref=f1e604]:
                - generic [ref=f1e605]: 2. Thessalonicher
                - generic [ref=f1e606]: 3 Kapitel · 0 gelesen
            - button "1. Timotheus, 6 Kapitel" [ref=f1e610] [cursor=pointer]:
              - generic [ref=f1e614]:
                - generic [ref=f1e615]: 1. Timotheus
                - generic [ref=f1e616]: 6 Kapitel · 0 gelesen
            - button "2. Timotheus, 4 Kapitel" [ref=f1e620] [cursor=pointer]:
              - generic [ref=f1e624]:
                - generic [ref=f1e625]: 2. Timotheus
                - generic [ref=f1e626]: 4 Kapitel · 0 gelesen
            - button "Titus, 3 Kapitel" [ref=f1e630] [cursor=pointer]:
              - generic [ref=f1e634]:
                - generic [ref=f1e635]: Titus
                - generic [ref=f1e636]: 3 Kapitel · 0 gelesen
            - button "Philemon, 1 Kapitel" [ref=f1e640] [cursor=pointer]:
              - generic [ref=f1e644]:
                - generic [ref=f1e645]: Philemon
                - generic [ref=f1e646]: 1 Kapitel · 0 gelesen
            - button "Hebräer, 13 Kapitel" [ref=f1e650] [cursor=pointer]:
              - generic [ref=f1e654]:
                - generic [ref=f1e655]: Hebräer
                - generic [ref=f1e656]: 13 Kapitel · 0 gelesen
            - button "Jakobus, 5 Kapitel" [ref=f1e660] [cursor=pointer]:
              - generic [ref=f1e664]:
                - generic [ref=f1e665]: Jakobus
                - generic [ref=f1e666]: 5 Kapitel · 0 gelesen
            - button "1. Petrus, 5 Kapitel" [ref=f1e670] [cursor=pointer]:
              - generic [ref=f1e674]:
                - generic [ref=f1e675]: 1. Petrus
                - generic [ref=f1e676]: 5 Kapitel · 0 gelesen
            - button "2. Petrus, 3 Kapitel" [ref=f1e680] [cursor=pointer]:
              - generic [ref=f1e684]:
                - generic [ref=f1e685]: 2. Petrus
                - generic [ref=f1e686]: 3 Kapitel · 0 gelesen
            - button "1. Johannes, 5 Kapitel" [ref=f1e690] [cursor=pointer]:
              - generic [ref=f1e694]:
                - generic [ref=f1e695]: 1. Johannes
                - generic [ref=f1e696]: 5 Kapitel · 0 gelesen
            - button "2. Johannes, 1 Kapitel" [ref=f1e700] [cursor=pointer]:
              - generic [ref=f1e704]:
                - generic [ref=f1e705]: 2. Johannes
                - generic [ref=f1e706]: 1 Kapitel · 0 gelesen
            - button "3. Johannes, 1 Kapitel" [ref=f1e710] [cursor=pointer]:
              - generic [ref=f1e714]:
                - generic [ref=f1e715]: 3. Johannes
                - generic [ref=f1e716]: 1 Kapitel · 0 gelesen
            - button "Judas, 1 Kapitel" [ref=f1e720] [cursor=pointer]:
              - generic [ref=f1e724]:
                - generic [ref=f1e725]: Judas
                - generic [ref=f1e726]: 1 Kapitel · 0 gelesen
            - button "Offenbarung, 22 Kapitel" [ref=f1e730] [cursor=pointer]:
              - generic [ref=f1e734]:
                - generic [ref=f1e735]: Offenbarung
                - generic [ref=f1e736]: 22 Kapitel · 0 gelesen
        - generic [ref=f1e739]:
          - generic [ref=f1e740]:
            - button "Geschichten und Abschnitte entdecken" [ref=f1e741] [cursor=pointer]
            - generic [ref=f1e745]: 436 Originaleinheiten · lesen, verstehen und eigene Gedanken festhalten.
          - generic [ref=f1e746]:
            - button "Eine Geschichte entdecken" [ref=f1e747] [cursor=pointer]
            - button "Fragen zum Neuen Testament" [ref=f1e751] [cursor=pointer]
    - navigation "Hauptnavigation" [ref=f1e755]:
      - button "Heute" [ref=f1e756] [cursor=pointer]
      - button "Bibel" [ref=f1e760] [cursor=pointer]
      - button "Wege" [ref=f1e764] [cursor=pointer]
      - button "Mein Garten" [ref=f1e769] [cursor=pointer]
      - button "Sammlung" [ref=f1e774] [cursor=pointer]
  - generic [ref=f1e778]: Für den Offline-Neustart bereit.
```

# Test source

```ts
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
  123 |     expect(url.pathname).toBe("/lesen/EPH");
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
> 150 |       expect(search!.y).toBeLessThan(width === 320 ? 568 : 1000);
      |                         ^ Error: expect(received).toBeLessThan(expected)
  151 |       await visible(page, "spiritual-word-card").screenshot({ path: `${screens}/word-${width}-${color}.png` });
  152 |       await page.screenshot({ path: `${screens}/hub-${width}-${color}.png` });
  153 |       expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  154 |       expect(await records(page)).toEqual(before);
  155 |     }
  156 |   }
  157 | });
  158 | 
  159 | test("das einzelne Symbol und alle Bücher bleiben beim Offline-Neustart ohne Schreibvorgang verfügbar", async ({ page, context }) => {
  160 |   await profile(page);
  161 |   const before = await records(page);
  162 |   await page.goto("/bibel");
  163 |   await ready(page);
  164 |   await expect(page.getByText("Für den Offline-Neustart bereit.", { exact: true })).toBeVisible();
  165 |   await context.setOffline(true);
  166 |   await page.reload();
  167 |   await ready(page);
  168 |   await expect(page.getByRole("button", { name: /, \d+ Kapitel$/ })).toHaveCount(66);
  169 |   await noBookSwords(page);
  170 |   expect(await records(page)).toEqual(before);
  171 | });
  172 | 
  173 | test("Startseite und Sammlung bleiben frei von Schwertern; bestätigtes Lesen behält seinen normalen Fortschritt", async ({ page }) => {
  174 |   await profile(page);
  175 |   await page.goto("/");
  176 |   const card = visible(page, "home-current-book");
  177 |   await expect(card.getByRole("button", { name: "Kapitelübersicht öffnen", exact: true })).toBeVisible();
  178 |   await expect(card.getByRole("progressbar")).toHaveCount(1);
  179 |   await noBookSwords(page);
  180 |   await page.goto("/sammlung");
  181 |   await expect(page.getByRole("button", { name: "Buchschwerter", exact: true })).toHaveCount(0);
  182 |   await noBookSwords(page);
  183 |   await page.goto("/lesen/MRK?chapter=4");
  184 |   await page.getByRole("button", { name: "Kapitel als gelesen bestätigen", exact: true }).click();
  185 |   await expect.poll(async () => (await localData(page))?.readChapters).toEqual(["MRK:4"]);
  186 |   await noBookSwords(page);
  187 |   await page.goto("/buch/MRK");
  188 |   await expect(page.getByText("1 von 16 Kapiteln gelesen", { exact: true })).toBeVisible();
  189 |   await expect(page.getByRole("button", { name: "Markus, Kapitel 4, gelesen", exact: true })).toBeEnabled();
  190 | });
  191 | 
  192 | test.describe("einzelnes Bild bei echtem Ladefehler", () => {
  193 |   test.use({ serviceWorkers: "block" });
  194 |   test("Vers und Navigation bleiben bedienbar; bewusster Retry dekodiert das Original", async ({ page }) => {
  195 |     await profile(page);
  196 |     const before = await records(page), requested = new Set<string>();
  197 |     await page.route(imagePattern, route => { requested.add(route.request().url()); return route.abort(); });
  198 |     await page.goto("/bibel");
  199 |     await expect(page.getByText("Bild gerade nicht verfügbar.", { exact: true })).toBeVisible();
  200 |     expect(requested.size).toBe(1);
  201 |     await expect(page.getByRole("button", { name: "Epheser 6,17 lesen", exact: true })).toBeEnabled();
  202 |     await expect(page.getByRole("button", { name: "Markus, 16 Kapitel", exact: true })).toBeEnabled();
  203 |     await page.unroute(imagePattern);
  204 |     await page.getByRole("button", { name: "Bild laden", exact: true }).click();
  205 |     await ready(page);
  206 |     expect(await records(page)).toEqual(before);
  207 |   });
  208 | });
  209 | 
  210 | test.describe("hochauflösende Browserdarstellung", () => {
  211 |   test.use({ deviceScaleFactor: 3 });
  212 |   test("die eine512erDatei reicht für den vollständigen80x120Bildrahmen", async ({ page }) => {
  213 |     await profile(page);
  214 |     const before = await records(page);
  215 |     await page.goto("/bibel");
  216 |     const art = await ready(page), box = await art.boundingBox();
  217 |     expect(box!.width * 3).toBeLessThanOrEqual(512);
  218 |     expect(box!.height * 3).toBeLessThanOrEqual(768);
  219 |     expect(await records(page)).toEqual(before);
  220 |   });
  221 | });
  222 | 
```