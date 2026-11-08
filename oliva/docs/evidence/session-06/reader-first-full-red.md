# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: captures.spec.ts >> zwei Versentwürfe bleiben beim Wechsel getrennt und werden über die Übersicht fortgesetzt
- Location: tests/e2e/captures.spec.ts:60:1

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 200
Received:   6379
```

# Page snapshot

```yaml
- generic [ref=f1e4]:
  - generic [ref=f1e14]:
    - generic [ref=f1e15]:
      - generic [ref=f1e16]:
        - button "Zurück" [ref=f1e17] [cursor=pointer]
        - button "Markus 4⌄" [ref=f1e20] [cursor=pointer]
      - generic [ref=f1e22]:
        - button "Leseeinstellungen" [ref=f1e23] [cursor=pointer]
        - button "Dunklen Modus aktivieren" [ref=f1e27] [cursor=pointer]
    - generic [ref=f1e30]:
      - generic [ref=f1e31]: NEUES TESTAMENT
      - heading "Markus" [level=1] [ref=f1e32]
      - generic [ref=f1e33]: Markus 4 · Bibeltext
      - button "Zum Kapitelanfang" [ref=f1e34] [cursor=pointer]
      - generic [ref=f1e38]:
        - button "Einfach lesen" [pressed] [ref=f1e39] [cursor=pointer]
        - button "Tiefer verstehen" [ref=f1e41] [cursor=pointer]
    - generic [ref=f1e43]:
      - generic [ref=f1e44]: Tippe auf einen Vers, um ihn zu markieren, zu merken oder eine Notiz zu schreiben.
      - button "Notizentwurf zu Markus 4,35 fortsetzen" [ref=f1e45] [cursor=pointer]
      - button "Notizentwurf zu Markus 4,36 fortsetzen" [ref=f1e50] [cursor=pointer]
      - 'button "Vers 1: Und er fing abermals an, zu lehren am Meer. Und es versammelte sich viel Volks zu ihm, also daß er mußte in ein Schiff treten und auf dem Wasser sitzen; und alles Volk stand auf dem Lande am Meer." [ref=f1e56] [cursor=pointer]':
        - generic [ref=f1e57]:
          - generic [ref=f1e58]: "1"
          - text: Und er fing abermals an, zu lehren am Meer. Und es versammelte sich viel Volks zu ihm, also daß er mußte in ein Schiff treten und auf dem Wasser sitzen; und alles Volk stand auf dem Lande am Meer.
      - 'button "Vers 2: Und er predigte ihnen lange durch Gleichnisse; und in seiner Predigt sprach er zu ihnen:" [ref=f1e60] [cursor=pointer]':
        - generic [ref=f1e61]:
          - generic [ref=f1e62]: "2"
          - text: "Und er predigte ihnen lange durch Gleichnisse; und in seiner Predigt sprach er zu ihnen:"
      - 'button "Vers 3: Höret zu! Siehe, es ging ein Sämann aus, zu säen." [ref=f1e64] [cursor=pointer]':
        - generic [ref=f1e65]:
          - generic [ref=f1e66]: "3"
          - text: Höret zu! Siehe, es ging ein Sämann aus, zu säen.
      - 'button "Vers 4: Und es begab sich, indem er säte, fiel etliches an den Weg; da kamen die Vögel unter dem Himmel und fraßen''s auf." [ref=f1e68] [cursor=pointer]':
        - generic [ref=f1e69]:
          - generic [ref=f1e70]: "4"
          - text: Und es begab sich, indem er säte, fiel etliches an den Weg; da kamen die Vögel unter dem Himmel und fraßen's auf.
      - 'button "Vers 5: Etliches fiel in das Steinige, wo es nicht viel Erde hatte; und ging bald auf, darum daß es nicht tiefe Erde hatte." [ref=f1e72] [cursor=pointer]':
        - generic [ref=f1e73]:
          - generic [ref=f1e74]: "5"
          - text: Etliches fiel in das Steinige, wo es nicht viel Erde hatte; und ging bald auf, darum daß es nicht tiefe Erde hatte.
      - 'button "Vers 6: Da nun die Sonne aufging, verwelkte es, und dieweil es nicht Wurzel hatte verdorrte es." [ref=f1e76] [cursor=pointer]':
        - generic [ref=f1e77]:
          - generic [ref=f1e78]: "6"
          - text: Da nun die Sonne aufging, verwelkte es, und dieweil es nicht Wurzel hatte verdorrte es.
      - 'button "Vers 7: Und etliches fiel unter die Dornen; und die Dornen wuchsen empor und erstickten''s, und es brachte keine Frucht." [ref=f1e80] [cursor=pointer]':
        - generic [ref=f1e81]:
          - generic [ref=f1e82]: "7"
          - text: Und etliches fiel unter die Dornen; und die Dornen wuchsen empor und erstickten's, und es brachte keine Frucht.
      - 'button "Vers 8: Und etliches fiel auf ein gutes Land und brachte Frucht, die da zunahm und wuchs; etliches trug dreißigfältig und etliches sechzigfältig und etliches hundertfältig." [ref=f1e84] [cursor=pointer]':
        - generic [ref=f1e85]:
          - generic [ref=f1e86]: "8"
          - text: Und etliches fiel auf ein gutes Land und brachte Frucht, die da zunahm und wuchs; etliches trug dreißigfältig und etliches sechzigfältig und etliches hundertfältig.
      - 'button "Vers 9: Und er sprach zu ihnen: Wer Ohren hat, zu hören, der höre!" [ref=f1e88] [cursor=pointer]':
        - generic [ref=f1e89]:
          - generic [ref=f1e90]: "9"
          - text: "Und er sprach zu ihnen: Wer Ohren hat, zu hören, der höre!"
      - 'button "Vers 10: Und da er allein war, fragten ihn um dies Gleichnis, die um ihn waren, mitsamt den Zwölfen." [ref=f1e92] [cursor=pointer]':
        - generic [ref=f1e93]:
          - generic [ref=f1e94]: "10"
          - text: Und da er allein war, fragten ihn um dies Gleichnis, die um ihn waren, mitsamt den Zwölfen.
      - 'button "Vers 11: Und er sprach zu ihnen: Euch ist''s gegeben, das Geheimnis des Reiches Gottes zu wissen; denen aber draußen widerfährt es alles nur durch Gleichnisse," [ref=f1e96] [cursor=pointer]':
        - generic [ref=f1e97]:
          - generic [ref=f1e98]: "11"
          - text: "Und er sprach zu ihnen: Euch ist's gegeben, das Geheimnis des Reiches Gottes zu wissen; denen aber draußen widerfährt es alles nur durch Gleichnisse,"
      - 'button "Vers 12: auf daß sie es mit sehenden Augen sehen, und doch nicht erkennen, und mit hörenden Ohren hören, und doch nicht verstehen, auf daß sie sich nicht dermaleinst bekehren und ihre Sünden ihnen vergeben werden." [ref=f1e100] [cursor=pointer]':
        - generic [ref=f1e101]:
          - generic [ref=f1e102]: "12"
          - text: auf daß sie es mit sehenden Augen sehen, und doch nicht erkennen, und mit hörenden Ohren hören, und doch nicht verstehen, auf daß sie sich nicht dermaleinst bekehren und ihre Sünden ihnen vergeben werden.
      - 'button "Vers 13: Und er sprach zu ihnen: Verstehet ihr dies Gleichnis nicht, wie wollt ihr denn die andern alle verstehen?" [ref=f1e104] [cursor=pointer]':
        - generic [ref=f1e105]:
          - generic [ref=f1e106]: "13"
          - text: "Und er sprach zu ihnen: Verstehet ihr dies Gleichnis nicht, wie wollt ihr denn die andern alle verstehen?"
      - 'button "Vers 14: Der Sämann sät das Wort." [ref=f1e108] [cursor=pointer]':
        - generic [ref=f1e109]:
          - generic [ref=f1e110]: "14"
          - text: Der Sämann sät das Wort.
      - 'button "Vers 15: Diese sind''s aber, die an dem Wege sind: Wo das Wort gesät wird und sie es gehört haben, so kommt alsbald der Satan und nimmt weg das Wort, das in ihr Herz gesät war." [ref=f1e112] [cursor=pointer]':
        - generic [ref=f1e113]:
          - generic [ref=f1e114]: "15"
          - text: "Diese sind's aber, die an dem Wege sind: Wo das Wort gesät wird und sie es gehört haben, so kommt alsbald der Satan und nimmt weg das Wort, das in ihr Herz gesät war."
      - 'button "Vers 16: Also auch die sind''s, bei welchen aufs Steinige gesät ist: wenn sie das Wort gehört haben, nehmen sie es alsbald mit Freuden auf," [ref=f1e116] [cursor=pointer]':
        - generic [ref=f1e117]:
          - generic [ref=f1e118]: "16"
          - text: "Also auch die sind's, bei welchen aufs Steinige gesät ist: wenn sie das Wort gehört haben, nehmen sie es alsbald mit Freuden auf,"
      - 'button "Vers 17: und haben keine Wurzel in sich, sondern sind wetterwendisch; wenn sich Trübsal oder Verfolgung um des Wortes willen erhebt, so ärgern sie sich alsbald." [ref=f1e120] [cursor=pointer]':
        - generic [ref=f1e121]:
          - generic [ref=f1e122]: "17"
          - text: und haben keine Wurzel in sich, sondern sind wetterwendisch; wenn sich Trübsal oder Verfolgung um des Wortes willen erhebt, so ärgern sie sich alsbald.
      - 'button "Vers 18: Und diese sind''s, bei welchen unter die Dornen gesät ist: die das Wort hören," [ref=f1e124] [cursor=pointer]':
        - generic [ref=f1e125]:
          - generic [ref=f1e126]: "18"
          - text: "Und diese sind's, bei welchen unter die Dornen gesät ist: die das Wort hören,"
      - 'button "Vers 19: und die Sorgen dieser Welt und der betrügerische Reichtum und viele andere Lüste gehen hinein und ersticken das Wort, und es bleibt ohne Frucht." [ref=f1e128] [cursor=pointer]':
        - generic [ref=f1e129]:
          - generic [ref=f1e130]: "19"
          - text: und die Sorgen dieser Welt und der betrügerische Reichtum und viele andere Lüste gehen hinein und ersticken das Wort, und es bleibt ohne Frucht.
      - 'button "Vers 20: Und diese sind''s, bei welchen auf ein gutes Land gesät ist: die das Wort hören und nehmen''s an und bringen Frucht, etliche dreißigfältig und etliche sechzigfältig und etliche hundertfältig." [ref=f1e132] [cursor=pointer]':
        - generic [ref=f1e133]:
          - generic [ref=f1e134]: "20"
          - text: "Und diese sind's, bei welchen auf ein gutes Land gesät ist: die das Wort hören und nehmen's an und bringen Frucht, etliche dreißigfältig und etliche sechzigfältig und etliche hundertfältig."
      - 'button "Vers 21: Und er sprach zu ihnen: Zündet man auch ein Licht an, daß man es unter einen Scheffel oder unter einen Tisch setze? Mitnichten, sondern daß man''s auf einen Leuchter setze." [ref=f1e136] [cursor=pointer]':
        - generic [ref=f1e137]:
          - generic [ref=f1e138]: "21"
          - text: "Und er sprach zu ihnen: Zündet man auch ein Licht an, daß man es unter einen Scheffel oder unter einen Tisch setze? Mitnichten, sondern daß man's auf einen Leuchter setze."
      - 'button "Vers 22: Denn es ist nichts verborgen, das es nicht offenbar werde, und ist nichts Heimliches, das nicht hervorkomme." [ref=f1e140] [cursor=pointer]':
        - generic [ref=f1e141]:
          - generic [ref=f1e142]: "22"
          - text: Denn es ist nichts verborgen, das es nicht offenbar werde, und ist nichts Heimliches, das nicht hervorkomme.
      - 'button "Vers 23: Wer Ohren hat, zu hören, der höre!" [ref=f1e144] [cursor=pointer]':
        - generic [ref=f1e145]:
          - generic [ref=f1e146]: "23"
          - text: Wer Ohren hat, zu hören, der höre!
      - 'button "Vers 24: Und er sprach zu ihnen: Sehet zu, was ihr höret! Mit welcherlei Maß ihr messet, wird man euch wieder messen, und man wird noch zugeben euch, die ihr dies hört." [ref=f1e148] [cursor=pointer]':
        - generic [ref=f1e149]:
          - generic [ref=f1e150]: "24"
          - text: "Und er sprach zu ihnen: Sehet zu, was ihr höret! Mit welcherlei Maß ihr messet, wird man euch wieder messen, und man wird noch zugeben euch, die ihr dies hört."
      - 'button "Vers 25: Denn wer da hat, dem wird gegeben; und wer nicht hat, von dem wird man nehmen, auch was er hat." [ref=f1e152] [cursor=pointer]':
        - generic [ref=f1e153]:
          - generic [ref=f1e154]: "25"
          - text: Denn wer da hat, dem wird gegeben; und wer nicht hat, von dem wird man nehmen, auch was er hat.
      - 'button "Vers 26: Und er sprach: Das Reich Gottes hat sich also, als wenn ein Mensch Samen aufs Land wirft" [ref=f1e156] [cursor=pointer]':
        - generic [ref=f1e157]:
          - generic [ref=f1e158]: "26"
          - text: "Und er sprach: Das Reich Gottes hat sich also, als wenn ein Mensch Samen aufs Land wirft"
      - 'button "Vers 27: und schläft und steht auf Nacht und Tag; und der Same geht auf und wächst, daß er''s nicht weiß." [ref=f1e160] [cursor=pointer]':
        - generic [ref=f1e161]:
          - generic [ref=f1e162]: "27"
          - text: und schläft und steht auf Nacht und Tag; und der Same geht auf und wächst, daß er's nicht weiß.
      - 'button "Vers 28: Denn die Erde bringt von selbst zum ersten das Gras, darnach die Ähren, darnach den vollen Weizen in den Ähren." [ref=f1e164] [cursor=pointer]':
        - generic [ref=f1e165]:
          - generic [ref=f1e166]: "28"
          - text: Denn die Erde bringt von selbst zum ersten das Gras, darnach die Ähren, darnach den vollen Weizen in den Ähren.
      - 'button "Vers 29: Wenn sie aber die Frucht gebracht hat, so schickt er bald die Sichel hin; denn die Ernte ist da." [ref=f1e168] [cursor=pointer]':
        - generic [ref=f1e169]:
          - generic [ref=f1e170]: "29"
          - text: Wenn sie aber die Frucht gebracht hat, so schickt er bald die Sichel hin; denn die Ernte ist da.
      - 'button "Vers 30: Und er sprach: Wem wollen wir das Reich Gottes vergleichen, und durch welch Gleichnis wollen wir es vorbilden?" [ref=f1e172] [cursor=pointer]':
        - generic [ref=f1e173]:
          - generic [ref=f1e174]: "30"
          - text: "Und er sprach: Wem wollen wir das Reich Gottes vergleichen, und durch welch Gleichnis wollen wir es vorbilden?"
      - 'button "Vers 31: Gleichwie ein Senfkorn, wenn das gesät wird aufs Land, so ist''s das kleinste unter allen Samen auf Erden;" [ref=f1e176] [cursor=pointer]':
        - generic [ref=f1e177]:
          - generic [ref=f1e178]: "31"
          - text: Gleichwie ein Senfkorn, wenn das gesät wird aufs Land, so ist's das kleinste unter allen Samen auf Erden;
      - 'button "Vers 32: und wenn es gesät ist, so nimmt es zu und wird größer denn alle Kohlkräuter und gewinnt große Zweige, also daß die Vögel unter dem Himmel unter seinem Schatten wohnen können." [ref=f1e180] [cursor=pointer]':
        - generic [ref=f1e181]:
          - generic [ref=f1e182]: "32"
          - text: und wenn es gesät ist, so nimmt es zu und wird größer denn alle Kohlkräuter und gewinnt große Zweige, also daß die Vögel unter dem Himmel unter seinem Schatten wohnen können.
      - 'button "Vers 33: Und durch viele solche Gleichnisse sagte er ihnen das Wort, nach dem sie es hören konnten." [ref=f1e184] [cursor=pointer]':
        - generic [ref=f1e185]:
          - generic [ref=f1e186]: "33"
          - text: Und durch viele solche Gleichnisse sagte er ihnen das Wort, nach dem sie es hören konnten.
      - 'button "Vers 34: Und ohne Gleichnis redete er nichts zu ihnen; aber insonderheit legte er''s seinen Jüngern alles aus." [ref=f1e188] [cursor=pointer]':
        - generic [ref=f1e189]:
          - generic [ref=f1e190]: "34"
          - text: Und ohne Gleichnis redete er nichts zu ihnen; aber insonderheit legte er's seinen Jüngern alles aus.
      - generic [ref=f1e191]:
        - 'button "Vers 35: Und an demselben Tage des Abends sprach er zu ihnen: Laßt uns hinüberfahren." [pressed] [ref=f1e192] [cursor=pointer]':
          - generic [ref=f1e193]:
            - generic [ref=f1e194]: "35"
            - text: "Und an demselben Tage des Abends sprach er zu ihnen: Laßt uns hinüberfahren."
        - generic [ref=f1e195]:
          - generic [ref=f1e196]: DEIN MOMENT MIT VERS 35
          - generic [ref=f1e197]:
            - button "Merken" [ref=f1e198] [cursor=pointer]
            - button "Oliv markieren" [ref=f1e202] [cursor=pointer]
            - button "Gold markieren" [ref=f1e204] [cursor=pointer]
          - button "Mit einem Vorhaben verbinden" [ref=f1e206] [cursor=pointer]
          - generic [ref=f1e211]:
            - generic [ref=f1e212]: Dein angefangener Entwurf ist wieder da.
            - generic [ref=f1e213]: "Dein Bibelbezug: Markus 4,35 · Luther 1912"
            - generic [ref=f1e214]:
              - generic [ref=f1e215]: Notiz zu Vers 35
              - textbox "Notiz zu Vers 35" [ref=f1e216]:
                - /placeholder: Was möchtest du festhalten?
                - text: Meine offene Frage zu Vers 35.
            - generic [ref=f1e217]:
              - generic [ref=f1e218]: Entwurf auf diesem Gerät gesichert.
              - button "Notiz speichern" [ref=f1e219] [cursor=pointer]
              - button "Entwurf verwerfen" [ref=f1e223] [cursor=pointer]
      - 'button "Vers 36: Und sie ließen das Volk gehen und nahmen ihn, wie er im Schiff war; und es waren mehr Schiffe bei ihm." [ref=f1e228] [cursor=pointer]':
        - generic [ref=f1e229]:
          - generic [ref=f1e230]: "36"
          - text: Und sie ließen das Volk gehen und nahmen ihn, wie er im Schiff war; und es waren mehr Schiffe bei ihm.
      - 'button "Vers 37: Und es erhob sich ein großer Windwirbel und warf Wellen in das Schiff, also daß das Schiff voll ward." [ref=f1e232] [cursor=pointer]':
        - generic [ref=f1e233]:
          - generic [ref=f1e234]: "37"
          - text: Und es erhob sich ein großer Windwirbel und warf Wellen in das Schiff, also daß das Schiff voll ward.
      - 'button "Vers 38: Und er war hinten auf dem Schiff und schlief auf einem Kissen. Und sie weckten ihn auf und sprachen zu ihm: Meister, fragst du nichts darnach, daß wir verderben?" [ref=f1e236] [cursor=pointer]':
        - generic [ref=f1e237]:
          - generic [ref=f1e238]: "38"
          - text: "Und er war hinten auf dem Schiff und schlief auf einem Kissen. Und sie weckten ihn auf und sprachen zu ihm: Meister, fragst du nichts darnach, daß wir verderben?"
      - 'button "Vers 39: Und er stand auf und bedrohte den Wind und sprach zu dem Meer: Schweig und verstumme! Und der Wind legte sich, und es ward eine große Stille." [ref=f1e240] [cursor=pointer]':
        - generic [ref=f1e241]:
          - generic [ref=f1e242]: "39"
          - text: "Und er stand auf und bedrohte den Wind und sprach zu dem Meer: Schweig und verstumme! Und der Wind legte sich, und es ward eine große Stille."
      - 'button "Vers 40: Und er sprach zu ihnen: Wie seid ihr so furchtsam? Wie, daß ihr keinen Glauben habt?" [ref=f1e244] [cursor=pointer]':
        - generic [ref=f1e245]:
          - generic [ref=f1e246]: "40"
          - text: "Und er sprach zu ihnen: Wie seid ihr so furchtsam? Wie, daß ihr keinen Glauben habt?"
      - 'button "Vers 41: Und sie fürchteten sich sehr und sprachen untereinander: Wer ist der? denn Wind und Meer sind ihm gehorsam." [ref=f1e248] [cursor=pointer]':
        - generic [ref=f1e249]:
          - generic [ref=f1e250]: "41"
          - text: "Und sie fürchteten sich sehr und sprachen untereinander: Wer ist der? denn Wind und Meer sind ihm gehorsam."
    - generic [ref=f1e252]:
      - generic [ref=f1e253]: Du bist am Ende dieses Kapitels.
      - button "Kapitel als gelesen bestätigen" [ref=f1e254] [cursor=pointer]
      - generic [ref=f1e259]:
        - button "Vorheriges Kapitel" [ref=f1e260] [cursor=pointer]
        - button "Nächstes Kapitel" [ref=f1e264] [cursor=pointer]
      - generic [ref=f1e268]: Lesefortschritt ist eine Erinnerung – keine Bewertung deines Glaubens.
    - generic [ref=f1e269]:
      - generic [ref=f1e270]: Gemeinsam weiterdenken
      - generic [ref=f1e271]: Dieser Abschnitt begegnet dir auch im geführten Weg „Wer ist Jesus?“.
      - button "Passenden Weg ansehen" [ref=f1e272] [cursor=pointer]
    - generic [ref=f1e276]: "Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org"
  - generic [ref=f1e277]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import { readFile } from "node:fs/promises";
  3   | import type { AppData } from "../../src/state/model";
  4   | import { localData as local } from "./persistence";
  5   | async function saved(page: Page) {
  6   |   await expect(
  7   |     page.getByText("Entwurf auf diesem Gerät gesichert.", { exact: true }),
  8   |   ).toBeVisible();
  9   | }
  10  | test("Hub und Garten bewahren angefangene Worte bei Bereichswechsel und Neustart", async ({
  11  |   page,
  12  | }) => {
  13  |   await page.goto("/");
  14  |   const text = "Mein noch unfertiger Dank.\nDie zweite Zeile bleibt.";
  15  |   await page
  16  |     .getByRole("textbox", {
  17  |       name: "Deine freiwillige Tagesreflexion",
  18  |       exact: true,
  19  |     })
  20  |     .fill(text);
  21  |   // Switch immediately, before the normal debounce. Focus cleanup must flush.
  22  |   await page.getByRole("button", { name: "Mein Garten", exact: true }).click();
  23  |   await page
  24  |     .getByRole("textbox", {
  25  |       name: "Eine freiwillig gelebte Erfahrung",
  26  |       exact: true,
  27  |     })
  28  |     .fill("Ich habe heute zuerst zugehört.");
  29  |   await saved(page);
  30  |   expect((await local(page)).notes).toEqual([]);
  31  |   expect((await local(page)).drafts).toHaveLength(2);
  32  |   await page.reload();
  33  |   await expect(
  34  |     page.getByRole("textbox", {
  35  |       name: "Eine freiwillig gelebte Erfahrung",
  36  |       exact: true,
  37  |     }),
  38  |   ).toHaveValue("Ich habe heute zuerst zugehört.");
  39  |   await page.getByRole("button", { name: "Heute", exact: true }).click();
  40  |   await expect(
  41  |     page.getByRole("textbox", {
  42  |       name: "Deine freiwillige Tagesreflexion",
  43  |       exact: true,
  44  |     }),
  45  |   ).toHaveValue(text);
  46  |   await page.getByRole("button", { name: "Festhalten", exact: true }).click();
  47  |   await expect.poll(async () => (await local(page)).notes.length).toBe(1);
  48  |   expect((await local(page)).drafts).toHaveLength(1);
  49  |   await page.getByRole("button", { name: "Mein Garten", exact: true }).click();
  50  |   await page
  51  |     .getByRole("button", { name: "Erfahrung festhalten", exact: true })
  52  |     .click();
  53  |   await expect
  54  |     .poll(async () =>
  55  |       (await local(page)).notes.some((n) => n.kind === "action"),
  56  |     )
  57  |     .toBe(true);
  58  |   expect((await local(page)).drafts).toHaveLength(0);
  59  | });
  60  | test("zwei Versentwürfe bleiben beim Wechsel getrennt und werden über die Übersicht fortgesetzt", async ({
  61  |   page,
  62  | }) => {
  63  |   await page.goto("/lesen/MRK?chapter=4");
  64  |   await page.getByRole("button", { name: /^Vers 35:/ }).click();
  65  |   await page
  66  |     .getByRole("textbox", { name: "Notiz zu Vers 35", exact: true })
  67  |     .fill("Meine offene Frage zu Vers 35.");
  68  |   await page.getByRole("button", { name: /^Vers 36:/ }).click();
  69  |   await page
  70  |     .getByRole("textbox", { name: "Notiz zu Vers 36", exact: true })
  71  |     .fill("Mein Gedanke zu Vers 36.");
  72  |   await saved(page);
  73  |   await page.goto("/sammlung");
  74  |   await page.getByRole("button", { name: "Entwürfe", exact: true }).click();
  75  |   await page
  76  |     .getByRole("button", {
  77  |       name: "Entwurf fortsetzen: Notiz zu Markus 4,35",
  78  |       exact: true,
  79  |     })
  80  |     .click();
  81  |   await expect(
  82  |     page.getByRole("textbox", { name: "Notiz zu Vers 35", exact: true }),
  83  |   ).toHaveValue("Meine offene Frage zu Vers 35.");
  84  |   const box = await page
  85  |     .getByRole("button", { name: /^Vers 35:/ })
  86  |     .boundingBox();
  87  |   expect(box).not.toBeNull();
  88  |   expect(box!.y).toBeGreaterThanOrEqual(0);
> 89  |   expect(box!.y).toBeLessThan(200);
      |                  ^ Error: expect(received).toBeLessThan(expected)
  90  |   await page
  91  |     .getByRole("button", { name: "Notiz speichern", exact: true })
  92  |     .click();
  93  |   await expect.poll(async () => (await local(page)).notes.length).toBe(1);
  94  |   expect((await local(page)).notes[0]?.ref?.from).toBe(35);
  95  |   await page
  96  |     .getByRole("button", {
  97  |       name: "Diesen Eintrag in der Sammlung bearbeiten",
  98  |       exact: true,
  99  |     })
  100 |     .click();
  101 |   await expect(
  102 |     page.getByRole("textbox", { name: "Deine Worte", exact: true }),
  103 |   ).toHaveValue("Meine offene Frage zu Vers 35.");
  104 |   await page
  105 |     .getByRole("textbox", { name: "Deine Worte", exact: true })
  106 |     .fill("Meine weitergedachten Worte zu Vers 35.");
  107 |   await page
  108 |     .getByRole("button", { name: "Gedanken speichern", exact: true })
  109 |     .click();
  110 |   await expect
  111 |     .poll(async () => (await local(page)).notes[0]?.text)
  112 |     .toBe("Meine weitergedachten Worte zu Vers 35.");
  113 |   expect((await local(page)).notes[0]?.ref?.from).toBe(35);
  114 |   await page.goto("/lesen/MRK?chapter=4");
  115 |   await expect(
  116 |     page.getByRole("button", {
  117 |       name: "Notizentwurf zu Markus 4,36 fortsetzen",
  118 |       exact: true,
  119 |     }),
  120 |   ).toBeVisible();
  121 |   await page
  122 |     .getByRole("button", {
  123 |       name: "Notizentwurf zu Markus 4,36 fortsetzen",
  124 |       exact: true,
  125 |     })
  126 |     .click();
  127 |   await expect(
  128 |     page.getByRole("textbox", { name: "Notiz zu Vers 36", exact: true }),
  129 |   ).toHaveValue("Mein Gedanke zu Vers 36.");
  130 | });
  131 | test("Reflexionsentwurf im Lernweg überlebt Neustart und schließt nur auf ausdrücklichen Klick ab", async ({
  132 |   page,
  133 | }) => {
  134 |   await page.goto("/weg/jesus");
  135 |   await page
  136 |     .getByRole("button", { name: "Abschnitt lesen", exact: true })
  137 |     .click();
  138 |   await page
  139 |     .getByRole("button", {
  140 |       name: "Abschnitt als gelesen bestätigen",
  141 |       exact: true,
  142 |     })
  143 |     .click();
  144 |   await page
  145 |     .getByRole("button", { name: "Zurück zum Weg", exact: true })
  146 |     .click();
  147 |   await page
  148 |     .getByRole("textbox", { name: "Deine Reflexion (freiwillig)", exact: true })
  149 |     .fill("Meine Fragen dürfen offen bleiben.");
  150 |   await saved(page);
  151 |   expect((await local(page)).completedSteps).toEqual([]);
  152 |   expect((await local(page)).notes).toEqual([]);
  153 |   await page.reload();
  154 |   await expect(
  155 |     page.getByRole("textbox", {
  156 |       name: "Deine Reflexion (freiwillig)",
  157 |       exact: true,
  158 |     }),
  159 |   ).toHaveValue("Meine Fragen dürfen offen bleiben.");
  160 |   await page
  161 |     .getByRole("button", {
  162 |       name: "Reflexion speichern & Schritt abschließen",
  163 |       exact: true,
  164 |     })
  165 |     .click();
  166 |   await expect
  167 |     .poll(async () => (await local(page)).completedSteps)
  168 |     .toEqual(["jesus:0"]);
  169 |   const data = await local(page);
  170 |   expect(data.drafts).toEqual([]);
  171 |   expect(data.notes[0]?.captureSource?.type).toBe("guided");
  172 |   await page.goto("/sammlung");
  173 |   await page
  174 |     .getByRole("button", {
  175 |       name: "Damals gezeigte Einordnung ansehen",
  176 |       exact: true,
  177 |     })
  178 |     .click();
  179 |   await expect(
  180 |     page.getByText("BEWAHRTER ENTWURF · KEIN BIBELTEXT", { exact: true }),
  181 |   ).toBeVisible();
  182 | });
  183 | test("ein Entwurf wird erst nach ausdrücklichem Verwerfen gelöscht und bestätigt dabei keine Erfahrung", async ({
  184 |   page,
  185 | }) => {
  186 |   await page.goto("/garten");
  187 |   await page
  188 |     .getByRole("textbox", {
  189 |       name: "Eine freiwillig gelebte Erfahrung",
```