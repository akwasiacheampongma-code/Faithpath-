# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: personal.spec.ts >> Bibelbezug wird aus einer Versaktion an ein Vorhaben übergeben
- Location: tests/e2e/personal.spec.ts:296:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Mit einem Vorhaben verbinden', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e10]:
    - main [ref=e11]:
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]:
            - button "Zurück" [ref=e17] [cursor=pointer]
            - button "Markus 4⌄" [ref=e20] [cursor=pointer]
          - generic [ref=e22]:
            - button "Leseeinstellungen" [ref=e23] [cursor=pointer]
            - button "Dunklen Modus aktivieren" [ref=e27] [cursor=pointer]
        - generic [ref=e30]:
          - generic [ref=e31]: NEUES TESTAMENT
          - heading "Markus" [level=1] [ref=e32]
          - generic [ref=e33]: Markus 4 · Bibeltext
          - button "Zum Kapitelanfang" [ref=e34] [cursor=pointer]
          - generic [ref=e38]:
            - button "Einfach lesen" [pressed] [ref=e39] [cursor=pointer]
            - button "Tiefer verstehen" [ref=e41] [cursor=pointer]
          - button "Lesefokus starten" [ref=e43] [cursor=pointer]
        - generic [ref=e47]:
          - generic [ref=e48]: Tippe Verse an. Unten kannst du sie markieren, kopieren oder eine Notiz schreiben. Erneutes Antippen hebt die Auswahl auf.
          - button "Zu Vers springen" [ref=e50] [cursor=pointer]
          - generic [ref=e55]:
            - paragraph [ref=e57]:
              - 'button "Vers 1: Und er fing abermals an, zu lehren am Meer. Und es versammelte sich viel Volks zu ihm, also daß er mußte in ein Schiff treten und auf dem Wasser sitzen; und alles Volk stand auf dem Lande am Meer." [ref=e59] [cursor=pointer]': 1 Und er fing abermals an, zu lehren am Meer. Und es versammelte sich viel Volks zu ihm, also daß er mußte in ein Schiff treten und auf dem Wasser sitzen; und alles Volk stand auf dem Lande am Meer.
              - 'button "Vers 2: Und er predigte ihnen lange durch Gleichnisse; und in seiner Predigt sprach er zu ihnen:" [ref=e61] [cursor=pointer]': "2 Und er predigte ihnen lange durch Gleichnisse; und in seiner Predigt sprach er zu ihnen:"
              - 'button "Vers 3: Höret zu! Siehe, es ging ein Sämann aus, zu säen." [ref=e63] [cursor=pointer]': 3 Höret zu! Siehe, es ging ein Sämann aus, zu säen.
              - 'button "Vers 4: Und es begab sich, indem er säte, fiel etliches an den Weg; da kamen die Vögel unter dem Himmel und fraßen''s auf." [ref=e65] [cursor=pointer]': 4 Und es begab sich, indem er säte, fiel etliches an den Weg; da kamen die Vögel unter dem Himmel und fraßen's auf.
              - 'button "Vers 5: Etliches fiel in das Steinige, wo es nicht viel Erde hatte; und ging bald auf, darum daß es nicht tiefe Erde hatte." [ref=e67] [cursor=pointer]': 5 Etliches fiel in das Steinige, wo es nicht viel Erde hatte; und ging bald auf, darum daß es nicht tiefe Erde hatte.
            - paragraph [ref=e69]:
              - 'button "Vers 6: Da nun die Sonne aufging, verwelkte es, und dieweil es nicht Wurzel hatte verdorrte es." [ref=e71] [cursor=pointer]': 6 Da nun die Sonne aufging, verwelkte es, und dieweil es nicht Wurzel hatte verdorrte es.
              - 'button "Vers 7: Und etliches fiel unter die Dornen; und die Dornen wuchsen empor und erstickten''s, und es brachte keine Frucht." [ref=e73] [cursor=pointer]': 7 Und etliches fiel unter die Dornen; und die Dornen wuchsen empor und erstickten's, und es brachte keine Frucht.
              - 'button "Vers 8: Und etliches fiel auf ein gutes Land und brachte Frucht, die da zunahm und wuchs; etliches trug dreißigfältig und etliches sechzigfältig und etliches hundertfältig." [ref=e75] [cursor=pointer]': 8 Und etliches fiel auf ein gutes Land und brachte Frucht, die da zunahm und wuchs; etliches trug dreißigfältig und etliches sechzigfältig und etliches hundertfältig.
              - 'button "Vers 9: Und er sprach zu ihnen: Wer Ohren hat, zu hören, der höre!" [ref=e77] [cursor=pointer]': "9 Und er sprach zu ihnen: Wer Ohren hat, zu hören, der höre!"
              - 'button "Vers 10: Und da er allein war, fragten ihn um dies Gleichnis, die um ihn waren, mitsamt den Zwölfen." [ref=e79] [cursor=pointer]': 10 Und da er allein war, fragten ihn um dies Gleichnis, die um ihn waren, mitsamt den Zwölfen.
            - paragraph [ref=e81]:
              - 'button "Vers 11: Und er sprach zu ihnen: Euch ist''s gegeben, das Geheimnis des Reiches Gottes zu wissen; denen aber draußen widerfährt es alles nur durch Gleichnisse," [ref=e83] [cursor=pointer]': "11 Und er sprach zu ihnen: Euch ist's gegeben, das Geheimnis des Reiches Gottes zu wissen; denen aber draußen widerfährt es alles nur durch Gleichnisse,"
              - 'button "Vers 12: auf daß sie es mit sehenden Augen sehen, und doch nicht erkennen, und mit hörenden Ohren hören, und doch nicht verstehen, auf daß sie sich nicht dermaleinst bekehren und ihre Sünden ihnen vergeben werden." [ref=e85] [cursor=pointer]': 12 auf daß sie es mit sehenden Augen sehen, und doch nicht erkennen, und mit hörenden Ohren hören, und doch nicht verstehen, auf daß sie sich nicht dermaleinst bekehren und ihre Sünden ihnen vergeben werden.
              - 'button "Vers 13: Und er sprach zu ihnen: Verstehet ihr dies Gleichnis nicht, wie wollt ihr denn die andern alle verstehen?" [ref=e87] [cursor=pointer]': "13 Und er sprach zu ihnen: Verstehet ihr dies Gleichnis nicht, wie wollt ihr denn die andern alle verstehen?"
              - 'button "Vers 14: Der Sämann sät das Wort." [ref=e89] [cursor=pointer]': 14 Der Sämann sät das Wort.
              - 'button "Vers 15: Diese sind''s aber, die an dem Wege sind: Wo das Wort gesät wird und sie es gehört haben, so kommt alsbald der Satan und nimmt weg das Wort, das in ihr Herz gesät war." [ref=e91] [cursor=pointer]': "15 Diese sind's aber, die an dem Wege sind: Wo das Wort gesät wird und sie es gehört haben, so kommt alsbald der Satan und nimmt weg das Wort, das in ihr Herz gesät war."
            - paragraph [ref=e93]:
              - 'button "Vers 16: Also auch die sind''s, bei welchen aufs Steinige gesät ist: wenn sie das Wort gehört haben, nehmen sie es alsbald mit Freuden auf," [ref=e95] [cursor=pointer]': "16 Also auch die sind's, bei welchen aufs Steinige gesät ist: wenn sie das Wort gehört haben, nehmen sie es alsbald mit Freuden auf,"
              - 'button "Vers 17: und haben keine Wurzel in sich, sondern sind wetterwendisch; wenn sich Trübsal oder Verfolgung um des Wortes willen erhebt, so ärgern sie sich alsbald." [ref=e97] [cursor=pointer]': 17 und haben keine Wurzel in sich, sondern sind wetterwendisch; wenn sich Trübsal oder Verfolgung um des Wortes willen erhebt, so ärgern sie sich alsbald.
              - 'button "Vers 18: Und diese sind''s, bei welchen unter die Dornen gesät ist: die das Wort hören," [ref=e99] [cursor=pointer]': "18 Und diese sind's, bei welchen unter die Dornen gesät ist: die das Wort hören,"
              - 'button "Vers 19: und die Sorgen dieser Welt und der betrügerische Reichtum und viele andere Lüste gehen hinein und ersticken das Wort, und es bleibt ohne Frucht." [ref=e101] [cursor=pointer]': 19 und die Sorgen dieser Welt und der betrügerische Reichtum und viele andere Lüste gehen hinein und ersticken das Wort, und es bleibt ohne Frucht.
              - 'button "Vers 20: Und diese sind''s, bei welchen auf ein gutes Land gesät ist: die das Wort hören und nehmen''s an und bringen Frucht, etliche dreißigfältig und etliche sechzigfältig und etliche hundertfältig." [ref=e103] [cursor=pointer]': "20 Und diese sind's, bei welchen auf ein gutes Land gesät ist: die das Wort hören und nehmen's an und bringen Frucht, etliche dreißigfältig und etliche sechzigfältig und etliche hundertfältig."
            - paragraph [ref=e105]:
              - 'button "Vers 21: Und er sprach zu ihnen: Zündet man auch ein Licht an, daß man es unter einen Scheffel oder unter einen Tisch setze? Mitnichten, sondern daß man''s auf einen Leuchter setze." [ref=e107] [cursor=pointer]': "21 Und er sprach zu ihnen: Zündet man auch ein Licht an, daß man es unter einen Scheffel oder unter einen Tisch setze? Mitnichten, sondern daß man's auf einen Leuchter setze."
              - 'button "Vers 22: Denn es ist nichts verborgen, das es nicht offenbar werde, und ist nichts Heimliches, das nicht hervorkomme." [ref=e109] [cursor=pointer]': 22 Denn es ist nichts verborgen, das es nicht offenbar werde, und ist nichts Heimliches, das nicht hervorkomme.
              - 'button "Vers 23: Wer Ohren hat, zu hören, der höre!" [ref=e111] [cursor=pointer]': 23 Wer Ohren hat, zu hören, der höre!
              - 'button "Vers 24: Und er sprach zu ihnen: Sehet zu, was ihr höret! Mit welcherlei Maß ihr messet, wird man euch wieder messen, und man wird noch zugeben euch, die ihr dies hört." [ref=e113] [cursor=pointer]': "24 Und er sprach zu ihnen: Sehet zu, was ihr höret! Mit welcherlei Maß ihr messet, wird man euch wieder messen, und man wird noch zugeben euch, die ihr dies hört."
              - 'button "Vers 25: Denn wer da hat, dem wird gegeben; und wer nicht hat, von dem wird man nehmen, auch was er hat." [ref=e115] [cursor=pointer]': 25 Denn wer da hat, dem wird gegeben; und wer nicht hat, von dem wird man nehmen, auch was er hat.
            - paragraph [ref=e117]:
              - 'button "Vers 26: Und er sprach: Das Reich Gottes hat sich also, als wenn ein Mensch Samen aufs Land wirft" [ref=e119] [cursor=pointer]': "26 Und er sprach: Das Reich Gottes hat sich also, als wenn ein Mensch Samen aufs Land wirft"
              - 'button "Vers 27: und schläft und steht auf Nacht und Tag; und der Same geht auf und wächst, daß er''s nicht weiß." [ref=e121] [cursor=pointer]': 27 und schläft und steht auf Nacht und Tag; und der Same geht auf und wächst, daß er's nicht weiß.
              - 'button "Vers 28: Denn die Erde bringt von selbst zum ersten das Gras, darnach die Ähren, darnach den vollen Weizen in den Ähren." [ref=e123] [cursor=pointer]': 28 Denn die Erde bringt von selbst zum ersten das Gras, darnach die Ähren, darnach den vollen Weizen in den Ähren.
              - 'button "Vers 29: Wenn sie aber die Frucht gebracht hat, so schickt er bald die Sichel hin; denn die Ernte ist da." [ref=e125] [cursor=pointer]': 29 Wenn sie aber die Frucht gebracht hat, so schickt er bald die Sichel hin; denn die Ernte ist da.
              - 'button "Vers 30: Und er sprach: Wem wollen wir das Reich Gottes vergleichen, und durch welch Gleichnis wollen wir es vorbilden?" [ref=e127] [cursor=pointer]': "30 Und er sprach: Wem wollen wir das Reich Gottes vergleichen, und durch welch Gleichnis wollen wir es vorbilden?"
            - paragraph [ref=e129]:
              - 'button "Vers 31: Gleichwie ein Senfkorn, wenn das gesät wird aufs Land, so ist''s das kleinste unter allen Samen auf Erden;" [ref=e131] [cursor=pointer]': 31 Gleichwie ein Senfkorn, wenn das gesät wird aufs Land, so ist's das kleinste unter allen Samen auf Erden;
              - 'button "Vers 32: und wenn es gesät ist, so nimmt es zu und wird größer denn alle Kohlkräuter und gewinnt große Zweige, also daß die Vögel unter dem Himmel unter seinem Schatten wohnen können." [ref=e133] [cursor=pointer]': 32 und wenn es gesät ist, so nimmt es zu und wird größer denn alle Kohlkräuter und gewinnt große Zweige, also daß die Vögel unter dem Himmel unter seinem Schatten wohnen können.
              - 'button "Vers 33: Und durch viele solche Gleichnisse sagte er ihnen das Wort, nach dem sie es hören konnten." [ref=e135] [cursor=pointer]': 33 Und durch viele solche Gleichnisse sagte er ihnen das Wort, nach dem sie es hören konnten.
              - 'button "Vers 34: Und ohne Gleichnis redete er nichts zu ihnen; aber insonderheit legte er''s seinen Jüngern alles aus." [ref=e137] [cursor=pointer]': 34 Und ohne Gleichnis redete er nichts zu ihnen; aber insonderheit legte er's seinen Jüngern alles aus.
              - 'button "Vers 35: Und an demselben Tage des Abends sprach er zu ihnen: Laßt uns hinüberfahren." [active] [pressed] [ref=e139] [cursor=pointer]': "35 Und an demselben Tage des Abends sprach er zu ihnen: Laßt uns hinüberfahren."
            - paragraph [ref=e141]:
              - 'button "Vers 36: Und sie ließen das Volk gehen und nahmen ihn, wie er im Schiff war; und es waren mehr Schiffe bei ihm." [ref=e143] [cursor=pointer]': 36 Und sie ließen das Volk gehen und nahmen ihn, wie er im Schiff war; und es waren mehr Schiffe bei ihm.
              - 'button "Vers 37: Und es erhob sich ein großer Windwirbel und warf Wellen in das Schiff, also daß das Schiff voll ward." [ref=e145] [cursor=pointer]': 37 Und es erhob sich ein großer Windwirbel und warf Wellen in das Schiff, also daß das Schiff voll ward.
              - 'button "Vers 38: Und er war hinten auf dem Schiff und schlief auf einem Kissen. Und sie weckten ihn auf und sprachen zu ihm: Meister, fragst du nichts darnach, daß wir verderben?" [ref=e147] [cursor=pointer]': "38 Und er war hinten auf dem Schiff und schlief auf einem Kissen. Und sie weckten ihn auf und sprachen zu ihm: Meister, fragst du nichts darnach, daß wir verderben?"
              - 'button "Vers 39: Und er stand auf und bedrohte den Wind und sprach zu dem Meer: Schweig und verstumme! Und der Wind legte sich, und es ward eine große Stille." [ref=e149] [cursor=pointer]': "39 Und er stand auf und bedrohte den Wind und sprach zu dem Meer: Schweig und verstumme! Und der Wind legte sich, und es ward eine große Stille."
              - 'button "Vers 40: Und er sprach zu ihnen: Wie seid ihr so furchtsam? Wie, daß ihr keinen Glauben habt?" [ref=e151] [cursor=pointer]': "40 Und er sprach zu ihnen: Wie seid ihr so furchtsam? Wie, daß ihr keinen Glauben habt?"
            - paragraph [ref=e153]:
              - 'button "Vers 41: Und sie fürchteten sich sehr und sprachen untereinander: Wer ist der? denn Wind und Meer sind ihm gehorsam." [ref=e155] [cursor=pointer]': "41 Und sie fürchteten sich sehr und sprachen untereinander: Wer ist der? denn Wind und Meer sind ihm gehorsam."
        - generic [ref=e157]:
          - generic [ref=e158]: Du bist am Ende dieses Kapitels.
          - button "Kapitel als gelesen bestätigen" [ref=e159] [cursor=pointer]
          - generic [ref=e164]:
            - button "Vorheriges Kapitel" [ref=e165] [cursor=pointer]
            - button "Nächstes Kapitel" [ref=e169] [cursor=pointer]
          - generic [ref=e173]: Lesefortschritt ist eine Erinnerung – keine Bewertung deines Glaubens.
        - generic [ref=e174]:
          - generic [ref=e175]: In Ruhe weiterdenken
          - generic [ref=e179]: Was ist dir im Text begegnet?
          - generic [ref=e180]: Fünf Fragen zum ganzen Kapitel helfen dir beim Verstehen. Du kannst jederzeit nachlesen oder pausieren.
          - button "Fragen zu Markus 4 entdecken" [ref=e181] [cursor=pointer]
        - generic [ref=e185]:
          - generic [ref=e186]: Gemeinsam weiterdenken
          - generic [ref=e187]: Dieser Abschnitt begegnet dir auch im geführten Weg „Wer ist Jesus?“.
          - button "Passenden Weg ansehen" [ref=e188] [cursor=pointer]
        - generic [ref=e192]: "Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org"
    - toolbar "Versauswahl" [ref=e193]:
      - generic [ref=e194]:
        - generic [ref=e195]: Markus 4,35
        - button "Auswahl aufheben" [ref=e197] [cursor=pointer]
      - generic [ref=e200]:
        - button "Markieren" [ref=e201] [cursor=pointer]
        - button "Bibeltext kopieren" [ref=e208] [cursor=pointer]:
          - generic [ref=e212]: Kopieren
        - button "Notiz" [ref=e213] [cursor=pointer]
        - button "Mehr" [ref=e217] [cursor=pointer]
  - generic [ref=e223]: Für den Offline-Neustart bereit.
```

# Test source

```ts
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
  245 |   const {
  246 |     goals,
  247 |     drafts,
  248 |     imports,
  249 |     readingPosition,
  250 |     retainedReviewGrowth,
  251 |     invitations,
  252 |     ntStudy,
  253 |     ...rest
  254 |   } = await local(page);
  255 |   const old = {
  256 |     ...rest,
  257 |     version: 1,
  258 |     name: "Ada",
  259 |     readChapters: ["MRK:4"],
  260 |     growthStage: 3,
  261 |     notes: [
  262 |       {
  263 |         id: "legacy-note",
  264 |         text: "Meine alten eigenen Worte.",
  265 |         kind: "note",
  266 |         createdAt: "2026-11-05T12:00:00.000Z",
  267 |         updatedAt: "2026-11-05T12:00:00.000Z",
  268 |       },
  269 |     ],
  270 |   };
  271 |   await page.evaluate(
  272 |     (value) =>
  273 |       new Promise<void>((resolve, reject) => {
  274 |         const r = indexedDB.open("oliva-local-v1", 1);
  275 |         r.onsuccess = () => {
  276 |           const tx = r.result.transaction("state", "readwrite");
  277 |           tx.objectStore("state").put(value, "main");
  278 |           tx.oncomplete = () => resolve();
  279 |           tx.onerror = () => reject(tx.error);
  280 |         };
  281 |       }),
  282 |     old,
  283 |   );
  284 |   await page.goto("/sammlung");
  285 |   await expect(
  286 |     page.getByText("Meine alten eigenen Worte.", { exact: true }),
  287 |   ).toBeVisible();
  288 |   await page
  289 |     .getByRole("button", { name: "Einen Gedanken festhalten", exact: true })
  290 |     .click();
  291 |   expect((await local(page)).version).toBe(9);
  292 |   expect((await local(page)).readChapters).toEqual(["MRK:4"]);
  293 |   expect((await local(page)).growthStage).toBe(3);
  294 |   expect((await local(page)).notes[0]?.text).toBe("Meine alten eigenen Worte.");
  295 | });
  296 | test("Bibelbezug wird aus einer Versaktion an ein Vorhaben übergeben", async ({
  297 |   page,
  298 | }) => {
  299 |   await page.goto("/lesen/MRK?chapter=4");
  300 |   await page.getByRole("button", { name: /^Vers 35:/ }).click();
  301 |   await page
  302 |     .getByRole("button", { name: "Mit einem Vorhaben verbinden", exact: true })
> 303 |     .click();
      |      ^ Error: locator.click: Test timeout of 120000ms exceeded.
  304 |   await expect(page.getByText("Markus 4,35", { exact: true })).toBeVisible();
  305 |   await page
  306 |     .getByRole("textbox", { name: "Name deines Vorhabens" })
  307 |     .fill("Fragen ehrlich aussprechen");
  308 |   await page
  309 |     .getByRole("button", { name: "Vorhaben anlegen", exact: true })
  310 |     .click();
  311 |   await expect(page.getByText("Deine kleinen Schritte")).toBeVisible();
  312 |   expect((await local(page)).goals[0]?.ref).toEqual({
  313 |     book: "MRK",
  314 |     chapter: 4,
  315 |     from: 35,
  316 |     to: 35,
  317 |   });
  318 | });
  319 | test("Neue Vorhaben- und Entwurfsansichten bleiben auf kleinen Displays zugänglich", async ({
  320 |   page,
  321 | }) => {
  322 |   for (const width of [320, 390, 1440]) {
  323 |     await page.setViewportSize({ width, height: 900 });
  324 |     await page.goto("/vorhaben");
  325 |     await page
  326 |       .getByRole("button", { name: "Ein Vorhaben anlegen", exact: true })
  327 |       .click();
  328 |     await page
  329 |       .getByRole("textbox", { name: "Name deines Vorhabens" })
  330 |       .fill("Ein ruhiger Anfang");
  331 |     await saved(page);
  332 |     expect(
  333 |       await page.evaluate(
  334 |         () => document.documentElement.scrollWidth <= innerWidth,
  335 |       ),
  336 |     ).toBe(true);
  337 |     const scan = await new AxeBuilder({ page })
  338 |       .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
  339 |       .analyze();
  340 |     expect(scan.violations).toEqual([]);
  341 |     await page
  342 |       .getByRole("button", { name: "Entwurf verwerfen", exact: true })
  343 |       .click();
  344 |     await page
  345 |       .getByRole("button", { name: "Entwurf endgültig verwerfen", exact: true })
  346 |       .click();
  347 |     await expect
  348 |       .poll(async () =>
  349 |         (await local(page)).drafts.some((draft) => draft.key === "goal:new"),
  350 |       )
  351 |       .toBe(false);
  352 |   }
  353 | });
  354 | 
```