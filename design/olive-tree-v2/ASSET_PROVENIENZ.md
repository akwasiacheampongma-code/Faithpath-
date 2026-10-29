# Verwendete Referenzen und Assets

Stand: 29.10.2026. Keine externen Stockbilder, CDN-Schriften oder Tracker in der Galerie.

## Tatsächlich angesehene Nutzerreferenzen

Das beigefügte ZIP `FaithPath_Olivenbaum_V2_Bildreferenzen.zip` wurde vollständig entpackt; beide Bilder und die Hinweisdatei wurden gelesen beziehungsweise visuell betrachtet.

| Datei | Größe | SHA-256 |
|---|---|---|
| 01_FaithPath_Baum_Leitbild.png | 1536 × 1024 | 4c25a46c1d78b47befd246e7d5a74ae766f4378cf08040a1893bbff450d17e1b |
| 02_FaithPath_7_Stufen_und_App_Ansichten.png | 1536 × 1024 | b9a18083fd37744aa1b5246860f0982f34eedcbb9818d34a4fd42bee36ab589e |

Die Hinweise bezeichnen sie als KI-Konzeptstudien, nicht als App-Quellstand oder fertige Assets. Übernommen wurden botanische Dichte, warmer Lichteinfall, mediterrane Blattfarbe und charaktervolles Holz. Nicht übernommen wurden abgebildete fiktive Tageszähler, unzutreffende Themes, UI-Texte und eine vermeintliche automatische Wachstumsbelohnung.

## Neu generierte Illustrationen

Erstellt mit dem in dieser Sitzung verfügbaren **ImageGen-Bildwerkzeug**, mit `transparent_background: true`. Keine heruntergeladenen Fremdillustrationen und keine handgezeichnete SVG-Ersatzlösung.

| Stufe | Originalausgabe des Werkzeugs | Referenz |
|---|---|---|
| 7, erster Versuch | exec-19c731cc-da35-4973-9e4a-ee2775f53fbb.png | beide Nutzerstudien + aktueller eigener App-Screenshot |
| 7, verfeinerter Master | exec-7ba66801-c473-4906-af1a-804e3d9183b8.png | erster Versuch; mehr Rand und bereinigte Freistellung angefordert |
| 6 | exec-46f7d1a4-154e-4705-9a82-b5fb504aa92d.png | verfeinerter Master |
| 5 | exec-0e314837-e422-4c32-9854-2d7b220a9277.png | verfeinerter Master |
| 4 | exec-4b56ae96-0566-4c36-9006-add6845fa736.png | verfeinerter Master |
| 3 | exec-3506f632-d03f-4505-8839-7ea394f47d2a.png | Stufen 4 und 7 |
| 2 | exec-4676124f-5919-4232-95a1-5c8e9a6d8f12.png | verfeinerter Master |
| 1 | exec-428fcb06-356e-4c88-956b-b51fba9a9a7e.png | Stufen 2 und 7 |

Die sechs Folgeprompts sind wortgetreu in `prompts.json` enthalten. Für die beiden Masteraufrufe ist hier eine inhaltliche Zusammenfassung dokumentiert, kein nachträglich als wortgetreu ausgegebener Prompt: ausgewachsener asymmetrischer Olivenbaum, S-förmiger verdrehter Stamm, sichtbare Rinde und Wurzelansätze, nach links ausladender Ast, höhere rechte Gabel, silbergrünes Laub, warmes Licht von rechts oben, einzelne Oliven, freistehende transparente RGBA-Illustration ohne Schrift oder Landschaft. Die zweite Ausgabe sollte dieselbe Identität mit mehr Rand und sauberer Freistellung bewahren.

Das Werkzeug lieferte **1254 × 1254 Pixel**, obwohl im ersten Briefing 1536 Pixel gewünscht waren. Die gelieferten Originalgrößen werden nicht als höher aufgelöste Assets ausgegeben. Bilddateien in `assets/masters/` bleiben unveränderte Kopien der Ausgaben. Der verworfene erste Master bleibt im Arbeitsnachweis außerhalb der Hauptauswahl erhalten, nicht als achte Stufe.

Die technische WebP-Aufbereitung beschneidet den Exportbereich anhand Alpha ≥16/255, skaliert gleichförmig und richtet die Bodenunterkante auf einer gemeinsamen Canvas aus. Sie verändert weder Rinde noch Blätter oder Fruchtinhalt. Das ist keine pixelgenaue Registrierung der Astgeometrie. Größen, Quelldigests und Exportdigests stehen in `asset-manifest.json`.

## Schrift und bestehende Vektoren

Newsreader und DM Sans stammen aus dem vorhandenen Projekt, werden lokal ausgeliefert und behalten ihre beigefügten **SIL Open Font License**-Dateien in `assets/licenses/`. Die Navigationssymbole und Vergleichs-SVGs stammen aus dem FaithPath-Code der Baseline. Bei den SVGs wurde lediglich das boolesche HTML-Attribut `data-living-tree` für eigenständiges XML zu `data-living-tree=""` serialisiert; Pfade und Farben wurden nicht verändert.

Keine der früheren Baumfotografien wurde für den neuen Baum übernommen. Deshalb hängt der Entwurf nicht von deren ungeklärter Einzelherkunft ab.

## Rechtliche Einordnung und Grenzen

Die neuen Bilder sind generierte Ausgaben anhand bereitgestellter Referenzen. Es wurden keine Stocklizenzen hinzugekauft oder fremden Markenassets übernommen. Das ist keine juristische Garantie für Ausschließlichkeit oder Schutzfähigkeit von KI-Bildern. Die Berechtigung an den vom Auftraggeber gelieferten Referenzen lässt sich aus dem ZIP allein nicht unabhängig nachweisen; eine gesonderte Rechtebestätigung ist kein in dieser Sitzung erbrachter Nachweis. Die Fontlizenztexte sind konkret mitgeliefert. Eine zusätzliche Behauptung „vollständig rechtsgeprüft“ wäre nicht belegt.
