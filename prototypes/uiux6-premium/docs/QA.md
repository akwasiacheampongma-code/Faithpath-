# Qualitätssicherung · Phase 6A.2

## Aussagegrenze

Technische Prüfungen liefen mit installiertem Linux-Chromium und Playwright. Echte Browserbilder sind keine iPhone-/Safari-/VoiceOver-Abnahme. Die Studie ist bewusst kein neuer Produktionsbuild und registriert keinen Service Worker. Daher ist kein reales App-PWA-Update Teil dieses isolierten Designs; das bestehende Service-Worker-System bleibt unverändert. Geladene Offline-Interaktion wird separat von Offline-Kaltstart/Installation unterschieden.

## Selbst ausgeführt

| Bereich | Ergebnis / Nachweis |
|---|---|
| Unveränderte App | 188 bestehende Unit-Tests bestanden, inklusive vorheriger Inhaltsvalidierung; `qa/app-unit.log` |
| Reines Demomodell und Backupadapter | 37 Tests bestanden; `qa/unit-final.log` |
| Originalquellen | 8 unabhängige Quellenchecks bestanden; `qa/sources.json` / `sources.log` |
| Ansichts-/Theme-/Größenmatrix | 190 Prüfungen bestanden; `qa/matrix.json` |
| Durchgehende Abläufe | 5 bestanden; `qa/flows-green.json` |
| Gezielte Fehlerregressionen | 7 bestanden; `qa/regressions-green.json` |
| Vertiefte Produktketten | 11 bestanden; `qa/product.json` |
| Navigation, Suche und Lebenszyklus | 7 bestanden; `qa/navigation.json`; zusätzlich 8 Layout-/Axe-Nachprüfungen nach Suchkorrektur in `qa/discovery-postfix.json` |
| Galerie/Bericht/Vergleich und lokale Öffnung | Aktueller Status ausdrücklich in `qa/artifacts.json`; keine Annahme allein wegen vorhandener Dateien |
| Ursprüngliche Dateien und alte6A-Galerie | Hashvergleich gegen Ausgangscommit; `qa/preservation.json` |
| Unveränderte App zweimal gebaut | Identischer Hash `bd6866522aec7b35854bc7c7871d8ce9afb2f1eb4013fd74496423f63753b882`; explizite ursprüngliche Branchmetadaten, beide Buildlogs |

Die Matrix zählt 88 Ansichten/Theme-Kombinationen (22×4),66 weitere Größenprüfungen (22×320/430/1440),22 Tests mit echter200-%-Textgröße, einen Psalm119-Test für beide Übersetzungen,12 Zustandstests und einen gemeinsamen Fehler-/Netzwerkcheck.390×844 ist die Theme-Referenz,320×568 und430×932 zusätzlich; Desktop1440×900. Die200-%-Prüfung bestätigt die tatsächlich berechnete Grundschrift32px und prüft Überlauf sowie Reduced Motion. Zusätzlicher Editor-Test:320×360 als reduzierte Fläche mit langem Text. **Das ist keine echte Bildschirmtastatur.**

## Produktabdeckung

Reader: beide Originalübersetzungen, alle 176Verse von Psalm119 bytegleich zu Quellen, Kapitelwahl, Übersetzungswechsel, Markierung, Tastaturauswahl, Notiz mit Referenz, Fokusmodus/Escape. Entwürfe bleiben innerhalb der Sitzung einschließlich ihrer ursprünglichen Bibel-/Wegbindung erhalten. Öffnen eines Kapitels erhöht keinen Fortschritt; ausdrückliches Erkunden dedupliziert.

Journal: lange/leere/viele Bestände, Suche einschließlich Nulltreffer und Text mit HTML-Zeichen, Bearbeiten, Löschen/Undo, Erinnerung, echter Dateidownload und Dateiupload mit Roundtrip von IDs/Referenzen/Originalsnapshots. Originalrückblicke bleiben nach Bearbeitung und Löschung nachvollziehbar. Ein neuer Weg erbt weder eine fremde Bibelreferenz noch einen fremden Rückblick.

Wege: Schritte hinzufügen/bearbeiten/abschließen, Archiv und Wiederaufnahme ohne Verknüpfungsverlust. Sieben Originalstufennamen und sieben eigene Illustrationen in einer ausdrücklich isolierten Designvorschau; das Umschalten verändert keine Entwicklung. Schritte ändern die Baumstufe nicht. Die echten Produktionsschwellen und bestehenden Zweigmodelle wurden nicht nachimplementiert oder geändert.

Quiz: Originaloptionen, richtige/falsche Antwort, Erklärung, Wiedereinstieg und freiwillige Reflexion am Beispiel des fünfteiligen finalen Johannes15-Quiz. Die Quellenprüfung vergleicht alle 31 mitgelieferten Fragen vollständig. Das ist keine neue redaktionelle Abnahme aller 2.314 Nachlese-/1.300 NT-Fragen.

Backup: Nur das explizite synthetische Demoformat. Ungültige Formate, Referenzen, nicht lesbare Readerzustände und unpassende Quizpositionen werden vor Mutation abgewiesen. Bestätigung bindet eine eigene geprüfte Kopie. Neue Datei, Navigation und veralteter Dateiabschluss invalidieren alte Bestätigungen. Die bestehenden produktiven Formate werden nicht ersetzt.

## Barrierefreiheit

Axe-WCAG2A/AA,2.1AA und2.2AA wurde auf allen88 Themeansichten und aktiven Quiz-/Vers-/Restorezuständen ausgeführt. Keine automatisch erkannten Regelverletzungen im abschließenden Lauf. **`incomplete` bedeutet manuell zu prüfen, nicht bestanden**; vollständige Listen stehen in den einzelnen `qa/axe-*.json`. Darunter Kontraste bei komplexen Hintergründen/Überlagerungen. Icons/Buttons haben Accessible Names; Tastatur-/Dialog-/Fokusrückkehr sind zusätzlich getestet. Native Dialoge können beim Tabumlauf den Browser-/Bodyfokus durchlaufen; die Prüfung stellt sicher, dass kein Hintergrundbedienelement fokussiert wird.

Nicht behauptet: flächendeckende44px für Inline-Verse/Referenzen, Zertifizierung, tatsächlicher VoiceOver-Lesefluss, Hardwaretastatur oder iOS-Safe-Area-/Keyboardverhalten. Siehe IPHONE_ABNAHME.md.

## Gefundene Fehler und interne Verbesserungen

| Befund | Korrektur / Beleg |
|---|---|
| Formularhilfsbutton konnte implizit speichern | Standard `type=button`, nur ausdrückliche Speicheraktion ist Submit; Browser-RED/GREEN |
| Vers-/Snapshotkontext bei Öffnen eines noch leeren Drafts verloren | Controller erzeugt keinen zweiten Draft; Referenz und Originalworte erhalten |
| Spät eintreffende Datei konnte Restorevorschau austauschen | Requestgeneration, Navigation invalidiert, bestätigte Kopie gebunden |
| Syntaktisch gültiger, im gebündelten Reader/Quiz aber unlesbarer Backupzustand | Modelltypprüfung plus UI-Capabilityadapter vor Wiederherstellung |
| Neuer Weg zeigte fremden Rückblick/Standardbibelstelle | Ausschließlich tatsächliche Verknüpfungen rendern |
| Neuer Gedanke aus Rückblick nahm bearbeitete Liveworte | Tatsächlich angezeigten Originalsnapshot übergeben |
| Status-Toast verdeckte Folgeaktion | Rückmeldung im Dokumentfluss statt überlagernd |
| SVG-Bilder beim ursprünglichen Server defekt | Eigener studienspezifischer MIME-korrekter Server; keine Änderung am Appserver |
| Gedämpfte Schrift auf warmen Flächen zu schwach | Semantische Hell-/Papier-Mutedfarben dunkler; Axe erneut |
| Texte/Themeoptionen bei 200% zu breit | Flexible Größen/Umbruch, ganze Navigationswörter und dynamisch reservierte Leistenhöhe |
| Bibelverknüpfung mit Versnummer wurde als Versauswahl behandelt | Eventdelegation auf tatsächliche `.verse`-Elemente begrenzt; Themen-, Guide- und Journalreferenz mit Back erneut browsergetestet |
| Allgemeine Suche ließ Themen/geführte Wege trotz Feldbeschriftung aus | Gemeinsamer Suchbestand aus696 Katalogeinträgen plus 18 Themen und 7 geführten Wegen, Filter bleiben getrennt |
| Falsche provisorische Stufennamen | Exakte sieben Namen aus `src/content.js` übernommen und browsergetestet |

Erste echte Befunde bleiben als `matrix-pass1.json`, `regressions-red.json` und fokussierte Modell-RED-Logs erhalten. `runner-setup-failure.json` und `product-runner-initial.json` enthalten auch Testaufbaufehler (Stringtimeout, mehrdeutige Selektoren, nicht abgewartetes Frame); sie sind ausdrücklich keine zusätzlichen Produktfehler. Auch `navigation-red.json` enthält neben der echten Suchlücke ein zunächst nicht abgewarteter Retry-Zustand; dies ist ein Testaufbaufehler. Der Back-Navigationsbefund war dagegen ein echter Verslink-Handlerfehler. Die abschließenden Dateien überschreiben nicht die dokumentierten ersten Befunde.

## Visuelle Prüfung

Vorher: Alle173 alten Screenshot-PNGs plus ein vorhandenes QA-Bild über Kontaktbögen geprüft,18 zentrale Browseraufnahmen neu erstellt. Nachher:22 kanonische Ansichten jeweils als Viewport-/Ganzseitenbild, vier Themes der Kernansichten, zusätzliche Größen-,200%-,Leer-/Lang-/Archiv-/Baum-/Schwert-/Interaktionsbilder. Kernansichten wurden tatsächlich betrachtet, nicht nur generiert. Die zweite Prüfung korrigierte schwache Komposition, Überläufe, falsche Assets und überdeckende Rückmeldungen. `comparison.html` zeigt echte Vorher-/Nachherbilder; keine KI-Bilder ersetzen die Oberfläche.

## Reproduktion

Vom Repositoryverzeichnis, Node≥20 und vorhandene Entwicklungsabhängigkeiten (`npm ci`), Chromium unter`/usr/bin/chromium`:

```sh
PORT=4492 node prototypes/uiux6-premium/tests/serve.mjs
```

In einem weiteren Terminal:

```sh
node --test --test-isolation=none prototypes/uiux6-premium/tests/model.test.mjs prototypes/uiux6-premium/tests/backup-adapter.test.mjs
node prototypes/uiux6-premium/tests/generate-content.mjs
node prototypes/uiux6-premium/tests/sources.test.mjs
node prototypes/uiux6-premium/tests/regressions.mjs
node prototypes/uiux6-premium/tests/flows.mjs
node prototypes/uiux6-premium/tests/product.mjs
node prototypes/uiux6-premium/tests/navigation.mjs
node prototypes/uiux6-premium/tests/matrix.mjs
node prototypes/uiux6-premium/tests/capture.mjs
node prototypes/uiux6-premium/tests/artifacts.mjs
```

Studie ohne Buildtool öffnen; keine neuen Abhängigkeiten installieren. Quellenprojektion ist deterministisch. Paketprüfung und SHA-256 siehe BUILD.json und externe Lieferquittung. Der Hash der alten Galerie und aller ursprünglichen getrackten Dateien bleibt gleich.

## Entscheidung

GO für Designreview. Keine nachgewiesenen offenen Blocker in den geprüften synthetischen Abläufen. NO-GO für Produktionsfreigabe oder automatische Phase6B. Offen: echte Geräte, Nutzertests, vollständige Appanbindung und später deren PWA-/Datensicherheitsregression. Der bekannte UIUX45-Backup-Lifecycle-P3 bleibt dokumentiert und im Original unverändert.
