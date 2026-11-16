# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: learning.spec.ts >> Ostergeschichte trennt Illustration und Einordnung vom Bibeltext und zählt nur den Abschnitt
- Location: tests/e2e/learning.spec.ts:56:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=f1e4]:
  - main [ref=f1e11]:
    - generic [ref=f1e14]:
      - generic [ref=f1e15]:
        - generic [ref=f1e16]:
          - button "Zurück" [ref=f1e17] [cursor=pointer]
          - button "Markus 16,1–8⌄" [ref=f1e20] [cursor=pointer]
        - generic [ref=f1e22]:
          - button "Leseeinstellungen" [ref=f1e23] [cursor=pointer]
          - button "Dunklen Modus aktivieren" [ref=f1e27] [cursor=pointer]
      - generic [ref=f1e30]:
        - generic [ref=f1e31]: NEUES TESTAMENT
        - heading "Markus" [level=1] [ref=f1e32]
        - generic [ref=f1e33]: Markus 16,1–8 · Bibeltext
        - button "Zum Abschnittsanfang" [ref=f1e34] [cursor=pointer]
        - generic [ref=f1e38]:
          - button "Einfach lesen" [ref=f1e39] [cursor=pointer]
          - button "Tiefer verstehen" [pressed] [ref=f1e41] [cursor=pointer]
        - button "Lesefokus starten" [ref=f1e43] [cursor=pointer]
      - generic [ref=f1e47]:
        - generic [ref=f1e48]: KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT
        - generic [ref=f1e49]: Das Buch im Überblick
        - generic [ref=f1e50]: Jesus begegnet Menschen und lädt zur Nachfolge ein.
        - generic [ref=f1e51]: Für dieses Kapitel liegt noch keine geprüfte Zusammenfassung vor. Der Bibeltext ist vollständig lesbar.
      - generic [ref=f1e52]:
        - 'img "Künstlerische Interpretation: drei Frauen vor einem geöffneten Felsgrab im Morgenlicht. Felsgrab, Landschaft und Kleidung sind frei gestaltet. Kein nachgewiesener Ort oder historisches Porträt." [ref=f1e54]':
          - generic [ref=f1e60]: Illustration wird geladen
        - generic [ref=f1e63]:
          - generic [ref=f1e64]: Markus 16,1–8 · etwa 4 Min.
          - generic [ref=f1e68]: Ein Morgen voller Fragen.
          - generic [ref=f1e69]: KI-UNTERSTÜTZTER ENTWURF · KEIN BIBELTEXT
          - generic [ref=f1e70]: "Drei Frauen gehen am frühen Morgen zum Grab Jesu. Markus erzählt, dass der große Stein bereits weggewälzt ist. Im Grab hören sie von einem jungen Mann: Jesus ist auferstanden und nicht hier. Sie bekommen einen Auftrag für die Jünger. Der Abschnitt endet mit ihrem Erschrecken und ihrer Furcht. Die unerwartete Botschaft und die offenen Reaktionen stehen nebeneinander."
          - generic [ref=f1e71]: Einordnung zu den Versen 1–8. Sie ist keine Zusammenfassung des gesamten Kapitels und ersetzt den Bibeltext nicht.
          - generic [ref=f1e72]:
            - generic [ref=f1e73]: Auferstehung
            - generic [ref=f1e74]: "Im christlichen Glauben bedeutet das: Jesu Tod hat nicht das letzte Wort; Gott schenkt ihm neues Leben. Die Evangelien erzählen von dieser Hoffnung in unterschiedlichen Osterberichten."
          - generic [ref=f1e75]: KI-Illustration · künstlerische Interpretation, keine historische Aufnahme. Felsgrab, Landschaft und Kleidung sind frei gestaltet. Kein nachgewiesener Ort oder historisches Porträt. Unabhängige Fachfreigabe steht aus.
      - generic [ref=f1e76]:
        - generic [ref=f1e77]: Tippe auf einen Vers, um ihn zu markieren, zu merken oder eine Notiz zu schreiben.
        - button "Versaktionen" [ref=f1e79] [cursor=pointer]
        - generic [ref=f1e84]:
          - paragraph [ref=f1e86]:
            - 'button "Vers 1: Und da der Sabbat vergangen war, kauften Maria Magdalena und Maria, des Jakobus Mutter, und Salome Spezerei, auf daß sie kämen und salbten ihn." [ref=f1e88] [cursor=pointer]': 1 Und da der Sabbat vergangen war, kauften Maria Magdalena und Maria, des Jakobus Mutter, und Salome Spezerei, auf daß sie kämen und salbten ihn.
            - 'button "Vers 2: Und sie kamen zum Grabe am ersten Tag der Woche sehr früh, da die Sonne aufging." [ref=f1e90] [cursor=pointer]': 2 Und sie kamen zum Grabe am ersten Tag der Woche sehr früh, da die Sonne aufging.
            - 'button "Vers 3: Und sie sprachen untereinander: Wer wälzt uns den Stein von des Grabes Tür?" [ref=f1e92] [cursor=pointer]': "3 Und sie sprachen untereinander: Wer wälzt uns den Stein von des Grabes Tür?"
            - 'button "Vers 4: Und sie sahen dahin und wurden gewahr, daß der Stein abgewälzt war; denn er war sehr groß." [ref=f1e94] [cursor=pointer]': 4 Und sie sahen dahin und wurden gewahr, daß der Stein abgewälzt war; denn er war sehr groß.
            - 'button "Vers 5: Und sie gingen hinein in das Grab und sahen einen Jüngling zur rechten Hand sitzen, der hatte ein langes weißes Kleid an; und sie entsetzten sich." [ref=f1e96] [cursor=pointer]': 5 Und sie gingen hinein in das Grab und sahen einen Jüngling zur rechten Hand sitzen, der hatte ein langes weißes Kleid an; und sie entsetzten sich.
          - paragraph [ref=f1e98]:
            - 'button "Vers 6: Er aber sprach zu ihnen: Entsetzt euch nicht! Ihr sucht Jesus von Nazareth, den Gekreuzigten; er ist nicht hier. Siehe da die Stätte, da sie ihn hinlegten!" [ref=f1e100] [cursor=pointer]': "6 Er aber sprach zu ihnen: Entsetzt euch nicht! Ihr sucht Jesus von Nazareth, den Gekreuzigten; er ist nicht hier. Siehe da die Stätte, da sie ihn hinlegten!"
            - 'button "Vers 7: Gehet aber hin und sagt''s seinen Jüngern und Petrus, daß er vor euch hingehen wird nach Galiläa, da werdet ihr ihn sehen, wie er gesagt hat." [ref=f1e102] [cursor=pointer]': 7 Gehet aber hin und sagt's seinen Jüngern und Petrus, daß er vor euch hingehen wird nach Galiläa, da werdet ihr ihn sehen, wie er gesagt hat.
            - 'button "Vers 8: Und sie gingen schnell heraus und flohen von dem Grabe; denn es war sie Zittern und Entsetzen angekommen. Und sie sagten niemand etwas, denn sie fürchteten sich." [ref=f1e104] [cursor=pointer]': 8 Und sie gingen schnell heraus und flohen von dem Grabe; denn es war sie Zittern und Entsetzen angekommen. Und sie sagten niemand etwas, denn sie fürchteten sich.
      - generic [ref=f1e106]:
        - generic [ref=f1e107]: Ein guter Moment zum Innehalten.
        - button "Als gelesen festgehalten" [disabled]
        - button "Das ganze Kapitel lesen" [ref=f1e111] [cursor=pointer]
        - generic [ref=f1e115]: Lesefortschritt ist eine Erinnerung – keine Bewertung deines Glaubens.
      - generic [ref=f1e116]:
        - generic [ref=f1e117]: In Ruhe weiterdenken
        - generic [ref=f1e121]: Was ist dir im Text begegnet?
        - generic [ref=f1e122]: Fünf Fragen zum ganzen Kapitel helfen dir beim Verstehen. Du kannst jederzeit nachlesen oder pausieren.
        - button "Fragen zu Markus 16 entdecken" [ref=f1e123] [cursor=pointer]
      - generic [ref=f1e127]: "Bibeltext: Lutherbibel 1912 · gemeinfrei · Quelle: eBible.org Einordnungen: OLIVA-Entwürfe; theologische Freigabe vor Veröffentlichung offen."
  - generic [ref=f1e128]: Für den Offline-Neustart bereit.
```

# Test source

```ts
  19  |     })
  20  |     .click();
  21  |   await expect(
  22  |     page.getByText("Schau noch einmal in den Text.", { exact: true }),
  23  |   ).toBeVisible();
  24  |   await page
  25  |     .getByRole("radio", {
  26  |       name: "Sie wecken Jesus und sprechen ihre Not an.",
  27  |       exact: true,
  28  |     })
  29  |     .click();
  30  |   await expect(
  31  |     page.getByText("Das passt zu diesem Abschnitt.", { exact: true }),
  32  |   ).toBeVisible();
  33  |   await page.keyboard.press("ArrowDown");
  34  |   await expect(
  35  |     page.getByRole("radio", {
  36  |       name: "Sie verlassen gemeinsam das Boot.",
  37  |       exact: true,
  38  |     }),
  39  |   ).toBeChecked();
  40  |   await page.keyboard.press("ArrowUp");
  41  |   await expect(
  42  |     page.getByRole("radio", {
  43  |       name: "Sie wecken Jesus und sprechen ihre Not an.",
  44  |       exact: true,
  45  |     }),
  46  |   ).toBeChecked();
  47  |   await expect(
  48  |     page.getByText(/BIBELTEXT · LUTHER 1912 · Markus 4,38/),
  49  |   ).toBeVisible();
  50  |   expect(await localData(page)).toEqual(before);
  51  |   const result = await new AxeBuilder({ page })
  52  |     .withTags(["wcag2a", "wcag2aa"])
  53  |     .analyze();
  54  |   expect(result.violations).toEqual([]);
  55  | });
  56  | test("Ostergeschichte trennt Illustration und Einordnung vom Bibeltext und zählt nur den Abschnitt", async ({
  57  |   page,
  58  |   context,
  59  | }) => {
  60  |   await page.goto("/bibel");
  61  |   await page
  62  |     .getByRole("button", { name: "Eine Geschichte entdecken", exact: true })
  63  |     .click();
  64  |   await page
  65  |     .getByRole("button", { name: "Die Ostergeschichte entdecken", exact: true })
  66  |     .click();
  67  |   await expect(page).toHaveURL(/chapter=16/);
  68  |   await expect(
  69  |     page.getByText(
  70  |       "Einordnung zu den Versen 1–8. Sie ist keine Zusammenfassung des gesamten Kapitels und ersetzt den Bibeltext nicht.",
  71  |       { exact: true },
  72  |     ),
  73  |   ).toBeVisible();
  74  |   await expect(
  75  |     page
  76  |       .getByRole("img", { name: /Künstlerische Interpretation: drei Frauen/ })
  77  |       .last(),
  78  |   ).toBeVisible();
  79  |   const frame = await page
  80  |     .getByRole("img", { name: /Künstlerische Interpretation: drei Frauen/ })
  81  |     .last()
  82  |     .boundingBox();
  83  |   expect(frame).not.toBeNull();
  84  |   expect(frame!.width / frame!.height).toBeCloseTo(1.5, 2);
  85  |   await page
  86  |     .getByRole("button", {
  87  |       name: "Abschnitt als gelesen bestätigen",
  88  |       exact: true,
  89  |     })
  90  |     .click();
  91  |   await expect
  92  |     .poll(async () => (await localData(page)).readPassages)
  93  |     .toEqual(["MRK:16:1:8"]);
  94  |   expect((await localData(page)).readChapters).toEqual([]);
  95  |   await page.evaluate(async () => {
  96  |     await navigator.serviceWorker.ready;
  97  |     if (!navigator.serviceWorker.controller)
  98  |       await new Promise<void>((resolve) =>
  99  |         navigator.serviceWorker.addEventListener(
  100 |           "controllerchange",
  101 |           () => resolve(),
  102 |           { once: true },
  103 |         ),
  104 |       );
  105 |   });
  106 |   await context.setOffline(true);
  107 |   await page.reload();
  108 |   await expect(page.getByText(/Einordnung zu den Versen 1–8/)).toBeVisible();
  109 |   expect(
  110 |     await page.evaluate(() => {
  111 |       const images = Array.from(document.images).filter((img) =>
  112 |         img.src.includes("easter-dawn"),
  113 |       );
  114 |       return (
  115 |         images.length > 0 &&
  116 |         images.every((img) => img.complete && img.naturalWidth > 0)
  117 |       );
  118 |     }),
> 119 |   ).toBe(true);
      |     ^ Error: expect(received).toBe(expected) // Object.is equality
  120 | });
  121 | 
```