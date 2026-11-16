# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: reader-focus.spec.ts >> Lesefokus hält auf 320 Pixeln in Hell und Dunkel den kanonischen Text und einen erreichbaren Ausstieg ohne Leseabschluss
- Location: tests/e2e/reader-focus.spec.ts:112:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Object {
-   "atBottom": true,
+   "atBottom": false,
    "scrolled": true,
  }

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e10]:
    - generic [ref=e12]:
      - generic [ref=e13]: Markus 4
      - button "Lesefokus beenden" [ref=e14] [cursor=pointer]
    - main [ref=e18]:
      - generic [ref=e21]:
        - generic [ref=e23]:
          - paragraph [ref=e25]:
            - 'button "Vers 1: Und er fing abermals an, zu lehren am Meer. Und es versammelte sich viel Volks zu ihm, also daß er mußte in ein Schiff treten und auf dem Wasser sitzen; und alles Volk stand auf dem Lande am Meer." [ref=e27] [cursor=pointer]': 1 Und er fing abermals an, zu lehren am Meer. Und es versammelte sich viel Volks zu ihm, also daß er mußte in ein Schiff treten und auf dem Wasser sitzen; und alles Volk stand auf dem Lande am Meer.
            - 'button "Vers 2: Und er predigte ihnen lange durch Gleichnisse; und in seiner Predigt sprach er zu ihnen:" [ref=e29] [cursor=pointer]': "2 Und er predigte ihnen lange durch Gleichnisse; und in seiner Predigt sprach er zu ihnen:"
            - 'button "Vers 3: Höret zu! Siehe, es ging ein Sämann aus, zu säen." [ref=e31] [cursor=pointer]': 3 Höret zu! Siehe, es ging ein Sämann aus, zu säen.
            - 'button "Vers 4: Und es begab sich, indem er säte, fiel etliches an den Weg; da kamen die Vögel unter dem Himmel und fraßen''s auf." [ref=e33] [cursor=pointer]': 4 Und es begab sich, indem er säte, fiel etliches an den Weg; da kamen die Vögel unter dem Himmel und fraßen's auf.
            - 'button "Vers 5: Etliches fiel in das Steinige, wo es nicht viel Erde hatte; und ging bald auf, darum daß es nicht tiefe Erde hatte." [ref=e35] [cursor=pointer]': 5 Etliches fiel in das Steinige, wo es nicht viel Erde hatte; und ging bald auf, darum daß es nicht tiefe Erde hatte.
          - paragraph [ref=e37]:
            - 'button "Vers 6: Da nun die Sonne aufging, verwelkte es, und dieweil es nicht Wurzel hatte verdorrte es." [ref=e39] [cursor=pointer]': 6 Da nun die Sonne aufging, verwelkte es, und dieweil es nicht Wurzel hatte verdorrte es.
            - 'button "Vers 7: Und etliches fiel unter die Dornen; und die Dornen wuchsen empor und erstickten''s, und es brachte keine Frucht." [ref=e41] [cursor=pointer]': 7 Und etliches fiel unter die Dornen; und die Dornen wuchsen empor und erstickten's, und es brachte keine Frucht.
            - 'button "Vers 8: Und etliches fiel auf ein gutes Land und brachte Frucht, die da zunahm und wuchs; etliches trug dreißigfältig und etliches sechzigfältig und etliches hundertfältig." [ref=e43] [cursor=pointer]': 8 Und etliches fiel auf ein gutes Land und brachte Frucht, die da zunahm und wuchs; etliches trug dreißigfältig und etliches sechzigfältig und etliches hundertfältig.
            - 'button "Vers 9: Und er sprach zu ihnen: Wer Ohren hat, zu hören, der höre!" [ref=e45] [cursor=pointer]': "9 Und er sprach zu ihnen: Wer Ohren hat, zu hören, der höre!"
            - 'button "Vers 10: Und da er allein war, fragten ihn um dies Gleichnis, die um ihn waren, mitsamt den Zwölfen." [ref=e47] [cursor=pointer]': 10 Und da er allein war, fragten ihn um dies Gleichnis, die um ihn waren, mitsamt den Zwölfen.
          - paragraph [ref=e49]:
            - 'button "Vers 11: Und er sprach zu ihnen: Euch ist''s gegeben, das Geheimnis des Reiches Gottes zu wissen; denen aber draußen widerfährt es alles nur durch Gleichnisse," [ref=e51] [cursor=pointer]': "11 Und er sprach zu ihnen: Euch ist's gegeben, das Geheimnis des Reiches Gottes zu wissen; denen aber draußen widerfährt es alles nur durch Gleichnisse,"
            - 'button "Vers 12: auf daß sie es mit sehenden Augen sehen, und doch nicht erkennen, und mit hörenden Ohren hören, und doch nicht verstehen, auf daß sie sich nicht dermaleinst bekehren und ihre Sünden ihnen vergeben werden." [ref=e53] [cursor=pointer]': 12 auf daß sie es mit sehenden Augen sehen, und doch nicht erkennen, und mit hörenden Ohren hören, und doch nicht verstehen, auf daß sie sich nicht dermaleinst bekehren und ihre Sünden ihnen vergeben werden.
            - 'button "Vers 13: Und er sprach zu ihnen: Verstehet ihr dies Gleichnis nicht, wie wollt ihr denn die andern alle verstehen?" [ref=e55] [cursor=pointer]': "13 Und er sprach zu ihnen: Verstehet ihr dies Gleichnis nicht, wie wollt ihr denn die andern alle verstehen?"
            - 'button "Vers 14: Der Sämann sät das Wort." [ref=e57] [cursor=pointer]': 14 Der Sämann sät das Wort.
            - 'button "Vers 15: Diese sind''s aber, die an dem Wege sind: Wo das Wort gesät wird und sie es gehört haben, so kommt alsbald der Satan und nimmt weg das Wort, das in ihr Herz gesät war." [ref=e59] [cursor=pointer]': "15 Diese sind's aber, die an dem Wege sind: Wo das Wort gesät wird und sie es gehört haben, so kommt alsbald der Satan und nimmt weg das Wort, das in ihr Herz gesät war."
          - paragraph [ref=e61]:
            - 'button "Vers 16: Also auch die sind''s, bei welchen aufs Steinige gesät ist: wenn sie das Wort gehört haben, nehmen sie es alsbald mit Freuden auf," [ref=e63] [cursor=pointer]': "16 Also auch die sind's, bei welchen aufs Steinige gesät ist: wenn sie das Wort gehört haben, nehmen sie es alsbald mit Freuden auf,"
            - 'button "Vers 17: und haben keine Wurzel in sich, sondern sind wetterwendisch; wenn sich Trübsal oder Verfolgung um des Wortes willen erhebt, so ärgern sie sich alsbald." [ref=e65] [cursor=pointer]': 17 und haben keine Wurzel in sich, sondern sind wetterwendisch; wenn sich Trübsal oder Verfolgung um des Wortes willen erhebt, so ärgern sie sich alsbald.
            - 'button "Vers 18: Und diese sind''s, bei welchen unter die Dornen gesät ist: die das Wort hören," [ref=e67] [cursor=pointer]': "18 Und diese sind's, bei welchen unter die Dornen gesät ist: die das Wort hören,"
            - 'button "Vers 19: und die Sorgen dieser Welt und der betrügerische Reichtum und viele andere Lüste gehen hinein und ersticken das Wort, und es bleibt ohne Frucht." [ref=e69] [cursor=pointer]': 19 und die Sorgen dieser Welt und der betrügerische Reichtum und viele andere Lüste gehen hinein und ersticken das Wort, und es bleibt ohne Frucht.
            - 'button "Vers 20: Und diese sind''s, bei welchen auf ein gutes Land gesät ist: die das Wort hören und nehmen''s an und bringen Frucht, etliche dreißigfältig und etliche sechzigfältig und etliche hundertfältig." [ref=e71] [cursor=pointer]': "20 Und diese sind's, bei welchen auf ein gutes Land gesät ist: die das Wort hören und nehmen's an und bringen Frucht, etliche dreißigfältig und etliche sechzigfältig und etliche hundertfältig."
          - paragraph [ref=e73]:
            - 'button "Vers 21: Und er sprach zu ihnen: Zündet man auch ein Licht an, daß man es unter einen Scheffel oder unter einen Tisch setze? Mitnichten, sondern daß man''s auf einen Leuchter setze." [ref=e75] [cursor=pointer]': "21 Und er sprach zu ihnen: Zündet man auch ein Licht an, daß man es unter einen Scheffel oder unter einen Tisch setze? Mitnichten, sondern daß man's auf einen Leuchter setze."
            - 'button "Vers 22: Denn es ist nichts verborgen, das es nicht offenbar werde, und ist nichts Heimliches, das nicht hervorkomme." [ref=e77] [cursor=pointer]': 22 Denn es ist nichts verborgen, das es nicht offenbar werde, und ist nichts Heimliches, das nicht hervorkomme.
            - 'button "Vers 23: Wer Ohren hat, zu hören, der höre!" [ref=e79] [cursor=pointer]': 23 Wer Ohren hat, zu hören, der höre!
            - 'button "Vers 24: Und er sprach zu ihnen: Sehet zu, was ihr höret! Mit welcherlei Maß ihr messet, wird man euch wieder messen, und man wird noch zugeben euch, die ihr dies hört." [ref=e81] [cursor=pointer]': "24 Und er sprach zu ihnen: Sehet zu, was ihr höret! Mit welcherlei Maß ihr messet, wird man euch wieder messen, und man wird noch zugeben euch, die ihr dies hört."
            - 'button "Vers 25: Denn wer da hat, dem wird gegeben; und wer nicht hat, von dem wird man nehmen, auch was er hat." [ref=e83] [cursor=pointer]': 25 Denn wer da hat, dem wird gegeben; und wer nicht hat, von dem wird man nehmen, auch was er hat.
          - paragraph [ref=e85]:
            - 'button "Vers 26: Und er sprach: Das Reich Gottes hat sich also, als wenn ein Mensch Samen aufs Land wirft" [ref=e87] [cursor=pointer]': "26 Und er sprach: Das Reich Gottes hat sich also, als wenn ein Mensch Samen aufs Land wirft"
            - 'button "Vers 27: und schläft und steht auf Nacht und Tag; und der Same geht auf und wächst, daß er''s nicht weiß." [ref=e89] [cursor=pointer]': 27 und schläft und steht auf Nacht und Tag; und der Same geht auf und wächst, daß er's nicht weiß.
            - 'button "Vers 28: Denn die Erde bringt von selbst zum ersten das Gras, darnach die Ähren, darnach den vollen Weizen in den Ähren." [ref=e91] [cursor=pointer]': 28 Denn die Erde bringt von selbst zum ersten das Gras, darnach die Ähren, darnach den vollen Weizen in den Ähren.
            - 'button "Vers 29: Wenn sie aber die Frucht gebracht hat, so schickt er bald die Sichel hin; denn die Ernte ist da." [ref=e93] [cursor=pointer]': 29 Wenn sie aber die Frucht gebracht hat, so schickt er bald die Sichel hin; denn die Ernte ist da.
            - 'button "Vers 30: Und er sprach: Wem wollen wir das Reich Gottes vergleichen, und durch welch Gleichnis wollen wir es vorbilden?" [ref=e95] [cursor=pointer]': "30 Und er sprach: Wem wollen wir das Reich Gottes vergleichen, und durch welch Gleichnis wollen wir es vorbilden?"
          - paragraph [ref=e97]:
            - 'button "Vers 31: Gleichwie ein Senfkorn, wenn das gesät wird aufs Land, so ist''s das kleinste unter allen Samen auf Erden;" [ref=e99] [cursor=pointer]': 31 Gleichwie ein Senfkorn, wenn das gesät wird aufs Land, so ist's das kleinste unter allen Samen auf Erden;
            - 'button "Vers 32: und wenn es gesät ist, so nimmt es zu und wird größer denn alle Kohlkräuter und gewinnt große Zweige, also daß die Vögel unter dem Himmel unter seinem Schatten wohnen können." [ref=e101] [cursor=pointer]': 32 und wenn es gesät ist, so nimmt es zu und wird größer denn alle Kohlkräuter und gewinnt große Zweige, also daß die Vögel unter dem Himmel unter seinem Schatten wohnen können.
            - 'button "Vers 33: Und durch viele solche Gleichnisse sagte er ihnen das Wort, nach dem sie es hören konnten." [ref=e103] [cursor=pointer]': 33 Und durch viele solche Gleichnisse sagte er ihnen das Wort, nach dem sie es hören konnten.
            - 'button "Vers 34: Und ohne Gleichnis redete er nichts zu ihnen; aber insonderheit legte er''s seinen Jüngern alles aus." [ref=e105] [cursor=pointer]': 34 Und ohne Gleichnis redete er nichts zu ihnen; aber insonderheit legte er's seinen Jüngern alles aus.
            - 'button "Vers 35: Und an demselben Tage des Abends sprach er zu ihnen: Laßt uns hinüberfahren." [ref=e107] [cursor=pointer]': "35 Und an demselben Tage des Abends sprach er zu ihnen: Laßt uns hinüberfahren."
          - paragraph [ref=e109]:
            - 'button "Vers 36: Und sie ließen das Volk gehen und nahmen ihn, wie er im Schiff war; und es waren mehr Schiffe bei ihm." [ref=e111] [cursor=pointer]': 36 Und sie ließen das Volk gehen und nahmen ihn, wie er im Schiff war; und es waren mehr Schiffe bei ihm.
            - 'button "Vers 37: Und es erhob sich ein großer Windwirbel und warf Wellen in das Schiff, also daß das Schiff voll ward." [ref=e113] [cursor=pointer]': 37 Und es erhob sich ein großer Windwirbel und warf Wellen in das Schiff, also daß das Schiff voll ward.
            - 'button "Vers 38: Und er war hinten auf dem Schiff und schlief auf einem Kissen. Und sie weckten ihn auf und sprachen zu ihm: Meister, fragst du nichts darnach, daß wir verderben?" [ref=e115] [cursor=pointer]': "38 Und er war hinten auf dem Schiff und schlief auf einem Kissen. Und sie weckten ihn auf und sprachen zu ihm: Meister, fragst du nichts darnach, daß wir verderben?"
            - 'button "Vers 39: Und er stand auf und bedrohte den Wind und sprach zu dem Meer: Schweig und verstumme! Und der Wind legte sich, und es ward eine große Stille." [ref=e117] [cursor=pointer]': "39 Und er stand auf und bedrohte den Wind und sprach zu dem Meer: Schweig und verstumme! Und der Wind legte sich, und es ward eine große Stille."
            - 'button "Vers 40: Und er sprach zu ihnen: Wie seid ihr so furchtsam? Wie, daß ihr keinen Glauben habt?" [ref=e119] [cursor=pointer]': "40 Und er sprach zu ihnen: Wie seid ihr so furchtsam? Wie, daß ihr keinen Glauben habt?"
          - paragraph [ref=e121]:
            - 'button "Vers 41: Und sie fürchteten sich sehr und sprachen untereinander: Wer ist der? denn Wind und Meer sind ihm gehorsam." [ref=e123] [cursor=pointer]': "41 Und sie fürchteten sich sehr und sprachen untereinander: Wer ist der? denn Wind und Meer sind ihm gehorsam."
        - generic [ref=e124]: "Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org"
  - generic [ref=e125]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  1   | import { test, expect, type Page, type Locator } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { readFileSync } from "node:fs";
  4   | import { mkdir, writeFile } from "node:fs/promises";
  5   | import type { Verse } from "../../src/features/bible/repository";
  6   | import type { AppData } from "../../src/state/model";
  7   | import { localData } from "./persistence";
  8   | 
  9   | test.use({ screenshot: "only-on-failure" });
  10  | const evidence =
  11  |   `${process.env.OLIVA_EVIDENCE_DIR ?? "docs/evidence/latest"}/reader-focus`;
  12  | // Read the canonical fixture independently of the app's browser renderer.
  13  | const bible = JSON.parse(
  14  |   readFileSync(new URL("../../src/data/bible.json", import.meta.url), "utf8"),
  15  | ) as Record<string, Record<string, Verse[]>>;
  16  | const visible = (page: Page, id: string) =>
  17  |   page.getByTestId(id).filter({ visible: true });
  18  | const flow = (page: Page) => visible(page, "reader-flow");
  19  | const start = (page: Page) =>
  20  |   page.getByRole("button", { name: "Lesefokus starten", exact: true });
  21  | const exit = (page: Page) =>
  22  |   page.getByRole("button", { name: "Lesefokus beenden", exact: true });
  23  | const verse = (page: Page, n: number) => visible(page, `flow-verse-${n}`);
  24  | 
  25  | function progress(data: AppData) {
  26  |   return {
  27  |     readChapters: data.readChapters,
  28  |     readPassages: data.readPassages,
  29  |     readSteps: data.readSteps,
  30  |     completedSteps: data.completedSteps,
  31  |     growthStage: data.growthStage,
  32  |     retainedReviewGrowth: data.retainedReviewGrowth,
  33  |   };
  34  | }
  35  | async function ready(page: Page, book: string, chapter: number) {
  36  |   await expect(flow(page)).toHaveAttribute("data-renderer", "web-inline");
  37  |   await page.evaluate(() => document.fonts.ready.then(() => undefined));
  38  |   await expect
  39  |     .poll(async () => (await localData(page))?.reading)
  40  |     .toMatchObject({ book, chapter });
  41  | }
  42  | async function canonicalText(
  43  |   container: Locator,
  44  |   book: string,
  45  |   chapter: number,
  46  | ) {
  47  |   const canonical = bible[book]![String(chapter)]!;
  48  |   expect(
  49  |     await container.locator("[data-verse]").evaluateAll((nodes) =>
  50  |       nodes.map((node) => ({
  51  |         n: Number(node.getAttribute("data-verse")),
  52  |         text: node.textContent,
  53  |       })),
  54  |     ),
  55  |   ).toEqual(canonical.map((v) => ({ n: v.n, text: `${v.n} ${v.text}` })));
  56  |   expect((await container.locator("p").allTextContents()).join(" ")).toBe(
  57  |     canonical.map((v) => `${v.n} ${v.text}`).join(" "),
  58  |   );
  59  | }
  60  | async function bottom(page: Page) {
  61  |   const main = page.getByRole("main");
  62  |   // RN Web replaces ScrollView's scrollTo with its { y } interface. Use the
  63  |   // real final verse's native DOM scrollIntoView, as in the reader-flow tests.
  64  |   await flow(page)
  65  |     .locator("[data-verse]")
  66  |     .last()
  67  |     .evaluate((node) => node.scrollIntoView({ block: "start" }));
  68  |   await expect
  69  |     .poll(() =>
  70  |       main.evaluate((node) => ({
  71  |         scrolled: node.scrollTop > 0,
  72  |         atBottom: node.scrollHeight - node.clientHeight - node.scrollTop < 2,
  73  |       })),
  74  |     )
> 75  |     .toEqual({ scrolled: true, atBottom: true });
      |      ^ Error: expect(received).toEqual(expected) // deep equality
  76  | }
  77  | async function reachableExit(page: Page) {
  78  |   await expect(exit(page)).toBeInViewport({ ratio: 1 });
  79  |   expect(
  80  |     await exit(page).evaluate((node) => {
  81  |       const r = node.getBoundingClientRect();
  82  |       return {
  83  |         outsideMain: !node.closest('[role="main"]'),
  84  |         hit: node.contains(
  85  |           document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2),
  86  |         ),
  87  |       };
  88  |     }),
  89  |   ).toEqual({ outsideMain: true, hit: true });
  90  | }
  91  | async function report(page: Page, name: string, data: object) {
  92  |   await mkdir(evidence, { recursive: true });
  93  |   await writeFile(
  94  |     `${evidence}/${name}.json`,
  95  |     JSON.stringify(
  96  |       {
  97  |         checkedAt: new Date().toISOString(),
  98  |         source_build_id: await page
  99  |           .locator('meta[name="oliva-build"]')
  100 |           .getAttribute("content"),
  101 |         physicalDeviceTest: false,
  102 |         method:
  103 |           "Headless Chromium, real DOM scrolling/focus and real IndexedDB; synthetic personal text",
  104 |         ...data,
  105 |       },
  106 |       null,
  107 |       2,
  108 |     ) + "\n",
  109 |   );
  110 | }
  111 | 
  112 | test("Lesefokus hält auf 320 Pixeln in Hell und Dunkel den kanonischen Text und einen erreichbaren Ausstieg ohne Leseabschluss", async ({
  113 |   page,
  114 | }) => {
  115 |   await page.setViewportSize({ width: 320, height: 844 });
  116 |   await page.emulateMedia({ reducedMotion: "reduce" });
  117 |   await page.goto("/lesen/MRK?chapter=4&mode=deep");
  118 |   await ready(page, "MRK", 4);
  119 |   const before = progress(await localData(page));
  120 |   await expect(
  121 |     page.getByText("Was du zum Abschnitt wissen solltest", { exact: true }),
  122 |   ).toBeVisible();
  123 |   await expect(
  124 |     page.getByRole("button", {
  125 |       name: "Kapitel als gelesen bestätigen",
  126 |       exact: true,
  127 |     }),
  128 |   ).toBeVisible();
  129 |   const observations: object[] = [];
  130 |   await mkdir(`${evidence}/screens`, { recursive: true });
  131 |   for (const theme of ["light", "dark"] as const) {
  132 |     const themeButton = page.getByRole("button", {
  133 |       name:
  134 |         theme === "dark"
  135 |           ? "Dunklen Modus aktivieren"
  136 |           : "Hellen Modus aktivieren",
  137 |       exact: true,
  138 |     });
  139 |     if (await themeButton.count()) await themeButton.click();
  140 |     await expect
  141 |       .poll(async () => (await localData(page)).settings.theme)
  142 |       .toBe(theme);
  143 |     await start(page).click();
  144 |     await reachableExit(page);
  145 |     const toolbarBeforeScroll = await exit(page).boundingBox();
  146 |     await canonicalText(flow(page), "MRK", 4);
  147 |     for (const label of [
  148 |       "Lesefokus starten",
  149 |       "Leseeinstellungen",
  150 |       "Versaktionen",
  151 |       "Einfach lesen",
  152 |       "Tiefer verstehen",
  153 |       "Kapitel als gelesen bestätigen",
  154 |       "Vorheriges Kapitel",
  155 |       "Nächstes Kapitel",
  156 |     ]) {
  157 |       await expect(
  158 |         page.getByRole("button", { name: label, exact: true }),
  159 |       ).toHaveCount(0);
  160 |     }
  161 |     await expect(
  162 |       page.getByText("Was du zum Abschnitt wissen solltest", { exact: true }),
  163 |     ).toHaveCount(0);
  164 |     await expect(
  165 |       page.getByText("KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT", {
  166 |         exact: true,
  167 |       }),
  168 |     ).toHaveCount(0);
  169 |     await expect(
  170 |       page.getByText("Ein Gedanke für dich", { exact: true }),
  171 |     ).toHaveCount(0);
  172 |     await bottom(page);
  173 |     await reachableExit(page);
  174 |     const toolbarAfterScroll = await exit(page).boundingBox();
  175 |     expect(toolbarAfterScroll).toEqual(toolbarBeforeScroll);
```