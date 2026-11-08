# Buchansichten und nachvollziehbare Lesespuren · lokale Iteration 0.6

Stand: 07.11.2026. Die neue Buchansicht ist für alle 66 Bücher implementiert, im Kernbuild **`oliva-a542b7009551a2a2`** geprüft und seit **12:59:18 UTC privat bereitgestellt**. Sie verbindet Buchbeschreibung, Schwertsymbol, belegte Motivquellen und vorhandenen Kapitelfortschritt. 75 Fachtests bestanden; der vollständige Browserlauf bestand 51/52 Fälle, danach bestanden 11/11 betroffene Fälle nach einer ausschließlichen Testsynchronisierung. Die vereinigten Belege decken alle 52 unterschiedlichen Szenarien ab. **Ein neuer einzelner grüner 52/52-Gesamtlauf wurde nicht ausgeführt.** Bereitstellungsdetails stehen in `RESUME.md`; öffentliche Freigabe und native Geräteabnahme bleiben offen.

## Ausgangspunkt und Nutzererlebnis

Die bestehende App zeigte kompakte Buchschwerter, bot aber keinen zusammenhängenden Ort, um Bildidee, Lesespur und nächsten Abschnitt zu verstehen. `/buch/[book]` ergänzt diesen Ort, ohne einen neuen Fortschrittsmechanismus einzuführen.

Die Ansicht beginnt mit Buchname und einfacher Beschreibung. Danach folgen Schwertname, genauer Kapitelzähler und die große Darstellung. **„Das Bild verstehen“** erklärt die künstlerische Bedeutung. Ein verständlicher Fortschrittsbalken nennt die bestätigten Kapitel; **„[Buchname] lesen“** öffnet einen sinnvollen nächsten Anfang. Alle Kapitel bleiben einzeln erreichbar. Es gibt weder Freischaltsperren noch Glaubensränge oder eine Rangliste.

Johannes besitzt als erster Pilot eine eigenständige große Bildillustration. Die übrigen 65 großen Buchdarstellungen und alle 66 kompakten Symbole verwenden weiterhin die bestehende Vektorfamilie. Details zur Gestaltung und den Bildrechten stehen im [Schwertpilot-Bericht](10-sword-art-pilot.md). Eine Bildfamilie mit 66 parametrischen Identitäten wird nicht als 66 neu generierte Kunstwerke ausgegeben.

## Navigation und Informationsarchitektur

| Einstieg | Verhalten |
| --- | --- |
| Bibelübersicht → Buch aufklappen → **„Buchschwert ansehen“** | Öffnet `/buch/<code>`; Buchsuche und aufgeklappte Auswahl bleiben beim Zurückgehen erhalten |
| Sammlung → **„Buchschwerter“** → Buchkarte | Öffnet dieselbe Buchansicht; Suchfeld filtert bestehende Buchidentitäten |
| Reader nach bestätigtem ganzen Kapitel → **„Buchschwert ansehen“** | Verbindet die tatsächliche Lesung mit der Buchübersicht |
| Buchansicht → **„[Buchname] lesen“** | Öffnet den berechneten Leseanfang; ein noch offenes aktuelles Kapitel bleibt maßgeblich |
| Buchansicht → Kapitelnummer | Öffnet genau dieses Kapitel; der Klick bestätigt keine Lesung |
| Buchansicht → Quellenlink | Öffnet den eindeutig begrenzten Bibelabschnitt; ein Abschnitt zählt nicht als ganzes Kapitel |
| Buchansicht → Zurück | Bestehenden Navigationsverlauf nutzen; bei direktem Einstieg verständlich zur Bibelübersicht zurückführen |
| Unbekannter Buchcode | **„Dieses Buch gibt es hier nicht.“** und **„Zur Bibel“**, keine erfundene Buchidentität |

Für jedes Buch ist Epheser 6,17 als allgemeine Anregung des Schwertsymbols direkt lesbar. Johannes bietet zusätzlich Johannes 1,4, Johannes 4,14 und Johannes 15,1–5 als konkrete Bezüge der Erklärung **„Quelle und Weinstock“** an. Diese Einordnung ist ein redaktionelles, künstlerisches Motiv; sie wird nicht als Teil des Bibeltextes oder als dort beschriebenes Schwert ausgegeben.

## Nur lesende Projektion vorhandener Daten

`src/features/swords/model.ts` trennt die Berechnung von der Oberfläche:

- `swordIdentity(code)` verwendet den vorhandenen Bibelkatalog. Ein unbekannter Code ergibt `null`. Nur Johannes erhält aktuell den ergänzten illustrierten Motivvertrag und drei validierte Quellreferenzen.
- `bookJourney(data, code)` liest ausschließlich `readChapters` und die vorhandene Leserposition. Es schreibt keine Daten und löst keine App-Aktion aus.
- `normalizeSwordProgress(value)` begrenzt den Darstellungswert auf 0 bis 1. Nicht endliche oder negative Werte werden nicht als Fortschritt ausgegeben.

Gezählt werden **eindeutige, gültige und ausdrücklich bestätigte Kapitel des gewählten Buches**. Doppelte IDs, Kapitel außerhalb des Buchumfangs und Einträge anderer Bücher erhöhen den Zähler nicht. Versaktionen und bestätigte kurze Passagen gehören nicht zu dieser Kapitelprojektion. Der Prozentsatz ergibt sich aus der Kapitelzahl geteilt durch den tatsächlichen Buchumfang; der zusätzlich sichtbare Zähler bewahrt den genauen Wert.

Die Empfehlung des nächsten Kapitels beginnt bei der gültigen aktuellen Position desselben Buches. Ein noch nicht bestätigtes aktuelles Kapitel bleibt erhalten. Ist es bereits bestätigt, wird das nächste ungelesene Kapitel in Buchreihenfolge vorgeschlagen, bei Bedarf nach dem Buchende zurück zum Anfang. Ist alles bestätigt, bleibt die gültige aktuelle Position als erneuter Leseanfang erhalten. Ein Buchbesuch oder eine Empfehlung markiert nichts als gelesen.

Das Nutzdatenformat bleibt V5. Es gibt keine neue Fortschrittsdatenbank, kein neues Benutzerkonto, keinen Sync und keine von Bildladeereignissen ausgelösten Lernpunkte. Die etablierte Speicherung und der ausdrücklich betätigte Reader-Abschluss bleiben maßgeblich. Persönliche Daten und der A51-Baum werden von der Buchansicht nicht verändert.

## Lichtspur und tatsächliche Bestätigung

Die dauerhafte Lichtspur zeigt vorhandene Kapitelbestätigungen. Der neue kurze Impuls ist davon getrennt: Erst nachdem der ausdrücklich ausgelöste Reader-Schreibvorgang erfolgreich war, setzt die Oberfläche eine an die aktuelle Buch-/Kapitel-/Abschnittskennung gebundene Bestätigung. Das kompakte Schwert wird nur nach einem ganzen bestätigten Kapitel eingeblendet. Ein Abschnitt erzeugt diesen Kapitelabschluss nicht.

`SwordPulse` reagiert auf die neue Bestätigung, läuft insgesamt 720 ms und kehrt zu unsichtbarer Zusatzbeleuchtung zurück. Es gibt keine Dauerschleife. Buchwechsel, Import, Bilddekodierung oder ein bereits früher bestätigtes Kapitel dürfen den Impuls nicht erneut als aktuelle Leistung inszenieren. App- und Systemvorgabe für reduzierte Bewegung sowie ein Wechsel in den Hintergrund verhindern beziehungsweise stoppen ihn. Bei reduzierter Bewegung bleibt die statische Lesespur verfügbar.

Die Bildansicht selbst kann Fortschritt anzeigen, ihn aber nicht bestätigen. Dadurch bleiben Lesen, technische Speicherung und symbolische Rückmeldung nachvollziehbar getrennt. Weder die Höhe der Lesespur noch die Zahl gelesener Kapitel bewertet den Glauben oder den Wert eines Menschen.

## Darstellung und Barrierefreiheit

Die Oberfläche verwendet OLIVAs vorhandene Farb-, Typografie- und Komponentenbasis. Der Titel und der Kapitelzähler stehen vor der Illustration; die Detailansicht passt sich zwischen einer Spalte und größerem Zweispaltenlayout an. Der PNG-Pilot behält sein vollständiges 2:3-Format. Die Kapitelwahl bietet explizit benannte Schaltflächen; eine unbekannte Route erhält eine klare Rückkehraktion.

Der erste Browser-Rotlauf zeigte einen realen Webvertragfehler: React Native Web 0.21 übernahm die verwendeten nativen `accessibilityValue`-/`accessibilityState`-Objekte nicht in die benötigten Webattribute. Daraufhin wurden für Web explizite `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-busy`, `aria-pressed`, `aria-expanded` und `aria-current` an den jeweils relevanten Komponenten ergänzt. Die vorhandenen nativen Angaben bleiben bestehen. Tests wurden nicht dadurch abgeschwächt, dass Zustände ignoriert oder aus Texten erraten werden.

Das Buchbild hat einen verständlichen zugänglichen Namen mit Schwertidentität und gerundetem Lesefortschritt. Ladezustand, genauer Kapitelzähler und Balkenwert sind getrennt auslesbar; dekorative Bild- und Lichtteile werden nicht zusätzlich vorgelesen. Dies ist keine vollständige Screenreader- oder WCAG-Freigabe. Native VoiceOver-/TalkBack- und Safari-Prüfungen bleiben offen.

## Abnahmekriterien und belegter Zwischenstand

| Kriterium | Vorhandener Nachweis | Noch offen |
| --- | --- | --- |
| Alle 66 Katalogbücher besitzen eine gültige Identität; unbekannter Code wird abgewiesen | Drei neue Modelltests prüfen Katalog, Quellen und Kapitelprojektion; insgesamt 75 Fachtests bestanden | Keine Behauptung von 66 einzeln besuchten Browserseiten |
| Öffnen, Bildladen, Vorschau und Quellenlinks verändern keine Lesespuren | Rohspeicher vor/nach Navigation im fokussierten und vollständigen Browserlauf verglichen; beim Offlineupdate alle Zustandsdatensätze unverändert | Keine Behauptung eines nativen Gerätetests |
| Kapitelfortschritt zählt nur gültige eindeutige ganze Kapitel | Unit-Test mit Dubletten, fremdem Buch und ungültigem Kapitel; Browserstände 0/1/11/21 | Weitere native Laufzeitprüfung |
| Johannes ist groß, die übrige Vektorfamilie bleibt erreichbar | Lokaler Pilot plus repräsentative Buchrouten GEN, PSA und REV im Browser geprüft | Unabhängige Designfreigabe und weitere Einzelillustrationen |
| Reale Kapitelbestätigung und drei Johannesquellen bleiben getrennt | Explizite gespeicherte Bestätigung und genaue Abschnittsreferenzen im Browser geprüft | Kein eigener Geräte-/Store-Nachweis |
| Webzustände sind maschinenlesbar | Nach ARIA-Korrektur sieben fokussierte Fälle ohne Fehler/Überspringen/flaky; Axe-Scan im geprüften Buchzustand ohne gemeldete Verstöße | Keine manuelle Screenreader-/WCAG-Gesamtabnahme |
| Offline, verständliche Fehlroute und Rückkehr funktionieren | Tatsächlicher Offline-Neustart und repräsentative andere Buchseiten im fokussierten Lauf | Kein neuer gehosteter oder physischer PWA-Test |
| Ein endlicher Lichtimpuls entsteht nur aus aktueller gespeicherter Bestätigung | Frameweise Abtastung der realen 720-ms-Rückmeldung; App-/System-Reduced-Motion im Browser geprüft | Native Bewegung/Leistung/Energie nicht getestet |
| Drei PNG-Fehler, Retry und verspätete Antworten bleiben beherrschbar | Vektor bleibt sichtbar; alle drei Kandidaten scheitern gezielt; Retry und Buchwechsel werden geprüft | Native Decoder-/Speicherfehler noch offen |
| Finale Layoutpolitur und Appregression | Nach Layoutkorrektur 51/52 im vollständigen Lauf; 11/11 betroffene Capture-/Readerfälle nach Testsynchronisierung bestanden | Kein neuer einzelner grüner Gesamtlauf nach der Testsynchronisierung |
| Native Plattformauflösung und Assets | Beide Debugexports mit je 98 A51- und drei Johannes-PNGs bytegenau; Webrenderer und Master-/Promptmaterial ausgeschlossen | Keine Installation, native Bild-/Animations-, Screenreader- oder Leistungsprüfung |
| Echter 0.5→0.6-Offlinewechsel | Alle Zustandsdatensätze unverändert; neue Buchroute und PNG offline, sieben A51-Stadien und alter exklusiver JS-Chunk verfügbar | Lokaler Kern mit synthetischen Daten, kein Handy-/Hostingnachweis |

Die 75 Fachtests und **7/7 gezielten Buchschwert-Browserfälle** sind unter [unit-results.json](evidence/session-06/unit-results.json) und [swords-e2e.json](evidence/session-06/swords-e2e.json) erhalten. Dieselben sieben Buchschwertfälle bestanden später im [vollständigen 52-Fälle-Lauf](evidence/session-06/e2e-first-full.json), der insgesamt **51/52** bestand. Der frühere [ARIA-Rotlauf](evidence/session-06/swords-e2e-red-aria.json) enthält vier fehlgeschlagene und drei übersprungene Fälle und bleibt als Fehlernachweis bestehen. Im späteren grünen fokussierten Lauf wurde nichts übersprungen oder als flaky bewertet.

Der einzige Fehler des vollständigen Laufs betraf eine zu frühe einmalige Positionsmessung beim Fortsetzen eines Versentwurfs. Der unveränderte Build stellte den Vers selbstständig wieder her: zunächst `y=6379`, anschließend `y=24`, ohne Scrollaktion des Tests. Die Prüfung wartet nun innerhalb des bestehenden Zeitlimits auf ein reales, nicht leeres Rechteck mit unveränderter Grenze `0 ≤ y < 200`. Nur Testsynchronisierung und Diagnose wurden ergänzt, kein Produktcode verändert. Danach bestanden **11/11** Capture-/Readerfälle ohne Fehler, Überspringen oder Flaky-Ergebnis. Die [Messung](evidence/session-06/reader-anchor-synchronization.json), [Nachtests](evidence/session-06/reader-regression.json) und [Zusammenfassung](evidence/session-06/validation-summary.json) sind erhalten. Die vereinigten erfolgreichen Szenarien ergeben exakt 52; dies ist kein neuer einzelner grüner Gesamtlauf.

Die gespeicherten Screens in `docs/evidence/session-06/screens/` stammen aus dem vollständigen Lauf nach der Layoutkorrektur, am 07.11. gegen 12:31 UTC. Schwertname und Kapitelzähler stehen vor dem Bild. Es handelt sich um Browseraufnahmen mit synthetischen Zuständen und nicht um echte Handyfotos. Native Export- und Updatebelege: [native-builds.json](evidence/session-06/native-builds.json), [offline-upgrade.json](evidence/session-06/offline-upgrade.json). Die nativen Bundles enthalten keinen Hermes-Bytecode und keine signierten APK/AAB/IPA; weder Simulatoren noch Geräte wurden verwendet.

## Versionsgrenze und weitere Arbeit

Diese Iteration liegt im lokalen Branch `feature/oliva-v06-book-identities-20261107`. Der sichere 0.5-A51-Checkpoint bleibt erhalten: Commit `8266d8dfa8b080603248e232787cc8853eacbf7a`, Tag `oliva-v0.5-a51-private`, Quell-ZIP mit 95.615.317 Byte und SHA-256 `efc998f8ad74d5c22165bb05ef11d2f099d804916ceea3d37b3ee3db1e67e045`. Der bestehende private Link wird ohne tatsächliche Aktualisierung nicht als 0.6 ausgegeben. FaithPath und `main` werden nicht verändert; öffentliche Veröffentlichung ist nicht freigegeben.

Die lokale 0.6-Abnahme ist mit den genannten Grenzen dokumentiert. Eine autorisierte private Aktualisierung wird getrennt anhand ihres tatsächlichen Deployments nachgewiesen. Weitere Buchillustrationen, Quellenredaktion, Anfänger-Usability und native Geräteabnahme bleiben Teil des ursprünglichen Master-Prompts. Dieser Schritt verbessert die vorhandene Bibelreise; er schließt die Gesamtentwicklung nicht ab.
