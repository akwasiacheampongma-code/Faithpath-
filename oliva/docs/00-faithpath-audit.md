# Phase 0 · FaithPath verstehen

Erhoben am 05.11.2026. Die Bestandsanwendung bleibt unverändert. Das neue Projekt liegt ausschließlich unter `faithpath-next/`. Es wird kein fremder Programmcode und kein FaithPath-Artwork übernommen.

## Identität und neuester Stand

- Über den verbundenen GitHub-Zugang gefunden: [akwasiacheampongma-code/Faithpath-](https://github.com/akwasiacheampongma-code/Faithpath-).
- Alle 33 verfügbaren Remote-Branch-Spitzen lokal abgerufen und nach **Commit-Zeit** sortiert. Neuester verfügbarer Branch: `feature/simplified-step-experience-20261104`.
- Analysierter Snapshot: **a519ce898fa33907b07d5ac7a585595127556183**, 04.11.2026, 21:22:43 UTC. Dies ist der neueste Commit-Zeitpunkt unter den abgerufenen Branch-Spitzen, keine Behauptung über den produktiv veröffentlichten Stand.
- Vorherige Integrationsbasis: `501f24909ed984c2edf5a8b05e5ffb8d0dc5b990`, 04.11.2026. Default-Branch `main` ist älter und enthält die Anwendung unter `develop/`; er ist deshalb keine geeignete aktuelle Laufzeitbasis.
- Separate, partiell ausgecheckte Referenz: `/workspace/faithpath-reference`. Die Analyse liest diese Kopie. Die unabhängige neue App wird inzwischen auf einem separaten GitHub-Branch unter `oliva/` gesichert; kein Merge oder Deploy. Ein zusätzlicher OLIVA-Root-Workflow wird neu angelegt; bestehende FaithPath-Dateien bleiben unverändert.
- Kein Root-/Unterordner-`AGENTS.md` im analysierten Git-Baum gefunden.

## Belegklassen

**C** = Implementierung gelesen, **D** = Bestandsdokumentation gelesen, **V** = mitgeliefertes Screenshot-Artefakt visuell geprüft. Historische Testberichte sind Nachweise des Vorgängerprojekts; deren Tests wurden hier nicht als eigene Prüfung ausgegeben. Die Bestandsanwendung wurde im Rahmen dieser Analyse nicht vollständig auf echten Geräten getestet.

## Architektur und Nutzerabläufe

FaithPath V4 ist eine statische Vanilla-JavaScript-PWA mit ES-Modulen, Hash-Routing und ohne Runtime-Framework, Backend, Konto oder Telemetrie. `src/app.js` orchestriert viele Aktionen; Router, Feature-Projektionen, Store und Journal-Transaktionen sind teilweise getrennt. Das V5-Datenmodell liegt lokal und unverschlüsselt in LocalStorage. Draft-/Journal-Schreibzugriffe verwenden Web Locks, Wiederherstellungsdaten und Prüfungen gegen veraltete Speicherstände. Es gibt keinen automatischen Gerätesync.

Der zentrale Kreislauf lautet Situation/Bibel → Verstehen → Reflexion → persönlicher Weg → kleiner Alltagsschritt → Rückblick → ausdrücklich selbst bestätigte Entwicklung. Vier Hauptbereiche: Heute, Bibel, Mein Weg, Journal. Entdecken, Markierungen, Geschichte, Rückblicke und Einstellungen sind ergänzende Ziele.

Der **persönliche Weg** verbindet eigenes Anliegen, Gedanken/Gebet, Bibelstelle und einen freiwilligen Versuch im Alltag. **Geführte Wege** und Anfänger-Guides sind zusätzlich vorhanden. Die jüngste Änderung vereinfacht Vorschläge auf drei direkte Auswahlen und ein gemeinsames Textfeld mit Schutz eigener Formulierungen. Diese zwei Bedeutungen von „Weg“ müssen in der Neukonzeption klar unterscheidbar werden.

## Vollständige Funktionsmatrix der ermittelten Funktionsfamilien

P0 = lokaler Kern der ersten Umsetzung; P1 = weiterer Ausbau; P2 = nach Rechte-, Betriebs- oder Inhaltsfreigabe. „Geplant“ ist keine Fertigmeldung. Der tatsächliche Lieferstand steht in `delivery-status.md`.

| Bestehende Funktion · Beleg | Zweck / Nutzermehrwert | Übernahme | Verbesserung | Prio | Technische Abhängigkeiten | Überprüfbares Abnahmekriterium |
|---|---|---|---|---|---|---|
| Heute mit nächstem Schritt · C `today-model.js` | Orientierung statt leerem Start | Ja | Ein klarer Leseeinstieg, sekundäre Funktionen progressiv zeigen | P0 | Fortschritt, Resume-Referenz | Nach Neustart öffnet „Weiterlesen“ den zuletzt gewählten Text |
| 18 Lebensthemen · C `content.js` | Persönliches Anliegen mit Bibel verbinden | Konzept | Anfängerfreundliche Themen und klare Lernziele | P1 | Redaktioneller Katalog | Jedes Thema hat Einführung, Quelle und nächste Aktion |
| Geführte Pläne und Anfänger-Guides · C `content.js`, `app.js` | Begleiteter Einstieg | Ja, eigene Inhalte | Begriff „Weg“ sofort erklären; kurze, freiwillige Schritte | P0 | Wegkatalog, Bibelreferenzen | Weg starten, lesen, verstehen, reflektieren, fortsetzen |
| First-Seed-Assistent · C `first-seed/*` | Anliegen, Gedanke, Schritt und Weg anlegen | Konzept | Erst echte Geschichte lesen, dann weitere Möglichkeiten | P0/P1 | Onboarding, Lesemodus; persönliche Vorhaben P1 | Gast startet ohne Registrierung in unter 3 Aktionen |
| Drei Schrittvorschläge / ein Editor · C `step-help.js`, `step-selection.js` | Kleine umsetzbare Vorhaben erleichtern | Konzept | Freiwillige Anwendung separat von Lernfortschritt | P1 | Vorhabenmodell, Drafts | Eigener Text wird ohne ausdrückliche Zustimmung nie ersetzt |
| 66 Bücher, 1.189 Kapitel, zwei Übersetzungen · C Loader, D Inhaltsstatus | Vollständige Bibel offline lesen | Eine Übersetzung zunächst | Luther 1912 frisch aus belegter gemeinfreier Quelle importieren | P0 | Originalquelle, Parser, lokales Bundle | 66 Bücher / 1.189 Kapitel, kein fehlender oder doppelter Versschlüssel |
| Buch-/Kapitelwahl und Normalisierung · C `bible-loader.js`, `domain.js` | Schnell zum richtigen Text | Ja | Suchbare Buchwahl, direkte Kapitelwahl | P0 | Kanonkatalog | Genesis 1 und Offenbarung 22 über Navigation erreichbar |
| Schriftgröße, Fokusmodus · C Reader-Views, D Inventar | Ruhiges und lesbares Lesen | Ja | Zusätzlich Zeilenabstand, zwei klar benannte Lesemodi | P0 | Designtokens, Preferences | Einstellungen bleiben nach Neustart erhalten |
| Zuletzt gelesen / Kapitelverlauf · C `bible-journey.js` | Wieder einsteigen | Ja | Leseposition und bestätigten Abschluss unterscheiden | P0 | Kapitelreferenzen | Öffnen allein erhöht abgeschlossene Kapitel nicht |
| Markierungen · C `bible-notes.js`, D Inventar | Text wiederfinden | Ja | Klar beschriftete Versaktionen | P0 | Vers-IDs, lokale Speicherung | Markierung nach Neuladen sichtbar und entfernbar |
| Bibelnotizen · C `bible-notes.js` | Persönliches Verstehen festhalten | Ja | Notiz und Bibeltext visuell streng trennen | P0 | Lokale Notizdaten | Notiz erstellen, bearbeiten, löschen, im Kontext öffnen |
| Verknüpfung Text ↔ persönlicher Weg · C `paths-model.js` | Lebensbezug bewahren | Ja, stufenweise | Erst Text ↔ geführter Lernweg; eigene Vorhaben später | P0/P1 | Referenzmodell | Passender Lernweg aus Reader öffnet richtige Einführung |
| Entdecken: Suche, Filter, Pagination · C `discover-model.js` | Große Kataloge zugänglich machen | Ja | Bibel-Volltextsuche plus überschaubare Themenwahl | P0 | Suchindex | Suchtreffer führt zur korrekten Stelle, leere Ergebnisse verständlich |
| Geschichten und Nachlese · C `story-flow-view.js`, D Inhaltsstatus | Geschichte zusammenhängend verstehen | Konzept | Eigene Pilotgeschichten mit Kontext und Interpretationstrennung | P0/P1 | Redaktion und Bildprüfung | Eine vollständige Pilotgeschichte ist ohne Vorwissen nutzbar |
| Verständnisfragen / 1.300 NT-Fragen · C `chapter-questions.js`, D Status | Gelesenes überprüfen | Eigene kuratierte Fragen | Kein ungeprüfter Massenimport; freundlich, ohne Bewertung des Glaubens | P1 | Fragenredaktion, Quellenprüfung | Jede Antwort hat überprüfbare Textgrundlage und Erklärung |
| Kapitel als erkundet bestätigen · C `bible-journey.js` | Lesefortschritt | Ja | Bewusste Bestätigung, idempotent | P0 | Persistenz, eindeutige Kapitel-IDs | Doppeltippen zählt ein Kapitel höchstens einmal |
| **Ein gemeinsames** Buch-/Schwert-Siegel · C `journey-sword.js` | Lesen symbolisch sichtbar machen | Konzept | **Neu:** 66 individuelle Buchidentitäten mit eigenen Vektoren | P0 | 66 Metadatensätze, Kapitelstatus | Jedes Buch besitzt eigene Identität und reale Kapitelanzeige |
| Sieben Olivenbaumstadien · C `olive-a51/stage-data.js` | Dokumentierte persönliche Entwicklung symbolisieren | A51 ab 0.5 auf ausdrücklichen Zusatzauftrag | Originale 7 PNG-Master und 21 WebPs, React-/native Adapter, OLIVA-Datenlogik und Motion-Präferenz | P0 | Lernereignisse, freiwillige Anwendung | Kein Verwelken, keine Streak, kein Rang oder Glaubensscore |
| Astzuordnung zu persönlichen Wegen · C `tree-branches.js` | Dokumentierte Geschichte sichtbar machen | Später | Textlich nachvollziehbare Zuordnung statt dekorativem Anspruch | P1 | Persönliche Vorhaben + Evidenz | Jede sichtbare Zuordnung lässt sich zu einem gespeicherten Eintrag öffnen |
| Weg anlegen/bearbeiten/archivieren · C `paths-model.js`, `paths-view.js` | Eigenen Prozess begleiten | Ja, später | Eindeutig als „Mein Vorhaben“ benennen | P1 | CRUD, Verknüpfungen | Archivierte Daten bleiben erreichbar; kein Löschen durch Abschluss |
| Schritte, Rückblicke, bestätigte Entwicklung · C `tree-branches.js`, `continuity.js` | Nachdenken über echte Veränderung | Konzept | Freiwillige Anwendung mit eigener Bestätigung | P1 | Historie, Originalbezüge | App behauptet keine Entwicklung aus bloßer Aktivität |
| Journal mit Suche/Filtern · C `journal-*` | Gedanken, Gebete, Reflexionen | Ja | Ein klarer lokaler Erinnerungsort | P0 | Notizen, Suche | Gespeicherte Inhalte lassen sich wiederfinden und bearbeiten |
| Journal-Löschung mit Undo · C `journal-management.js` | Fehlbedienung abfangen | Ja, in Ausbau | Expliziter Schutz plus Wiederherstellung | P1 | Tombstones / Undo-Puffer | Rückgängig stellt Originalbezüge wieder her |
| Dauerhafte Entwürfe und Schreibkonfliktschutz · C `drafts.js`, D Architektur | Eigene Worte erhalten | Ja, stufenweise | Persist-before-publish, Schema-Prüfung, Konfliktmeldung | P0/P1 | Storage-Adapter, Revisionen | Fehlgeschlagener Schreibvorgang wird nicht als gespeichert angezeigt |
| Vorher-/Nachher-Rückblicke · C `path-review-context.js` | Eigene Geschichte respektieren | Später | Unveränderte Quell-Snapshots | P1 | Historienmodell | Rückblick referenziert den tatsächlichen ursprünglichen Eintrag |
| Vier Themes · C `themes.js` | Individuelle Leseatmosphäre | Hell/Dunkel zuerst | Konsequente Tokens statt gestapelter CSS-Overrides | P0 | Themeprovider | Alle Kernansichten in Hell/Dunkel lesbar |
| Freiwillige Erinnerungen · C `reminders-view.js` | Selbst gewählte Routine | Später | Keine Schuldtexte oder Verlustwarnungen | P1 | OS-Berechtigungen | Ohne Einwilligung keine Benachrichtigung |
| JSON-Export / Prüfen / Restore · C `backup-*`, `import-validation.js` | Datenhoheit und Geräteverlust | Ja | Separates neues Format, klare Bestätigung vor Ersetzung | P0 | Zod, Exportadapter | Valider Roundtrip; kaputte Datei verändert keinen Bestand |
| V5- und Legacy-Migration · C `store.js` | Alte FaithPath-Daten schützen | V5 mit ausdrücklicher Bestätigung | Seit 0.3 additive Vorschau, Originalarchiv und atomare Rückkehrsicherung; Quellen niemals überschreiben | P1 | Belegter V5-Vertrag → OLIVA-Format 4 (seit 0.4), lokale DB-Transaktion | Vorschau schreibt nichts; Wiederholung erzeugt keine Dubletten; Fehler erhalten Bestand und Sicherung. Ältere Nicht-V5-Formate bleiben offen. |
| PWA Offline-/Update-Lifecycle · C `pwa-controller.js`, D Architektur | Lesen ohne Verbindung, sichere Updates | Ziel übernehmen | Native Offline-Bundles; Web-Vorschau mit eigenem Cache | P0/P1 | Expo-Build / Service Worker | Installierter Kern ohne Netz lesbar; Web gesondert geprüft |
| Lizenz-/Inhaltsstatusseiten · C Navigation, D Notices | Rechte und Qualität verstehen | Ja | In-App-Quellen mit getrenntem Bibel-/Erklärung-/Bildstatus | P0 | Provenienzdateien | Rechteangabe aus Einstellungen erreichbar |
| Hash-Deep-Links, Fokus, Tastatur · C `app-router.js`, `navigation-model.js` | Direkte Ziele und zugängliche Bedienung | Ziel übernehmen | Expo Router, eindeutiges Zurück-Verhalten | P0 | Router, Semantik | Detail-Zurück führt zum vorherigen Bereich, keine Sackgasse |

## Fehlende Funktionen / Risiken im Bestand

- Kein belegter KI-Begleiter, keine generative KI-Laufzeit, kein Cloud-Sync, kein Login und kein Supabase. Diese Punkte dürfen nicht als vorhandene Funktionen erscheinen.
- Keine 66 individuellen Schwerter im gelesenen Stand. Das vorhandene Siegel projiziert den Gesamtlesefortschritt.
- Kapitelzusammenfassungen, Worterklärungen, Audio und eine vollständige KI-Bildwelt sind nicht als durchgängige Bestandsfunktion belegt.
- `src/app.js` bleibt laut Architektur der größte Wartungsbereich; zahlreiche geschichtete Styles sind technische Schulden. Neues Projekt wird modular und tokenbasiert entwickelt.
- Personenbezogene Texte sind im Bestand unverschlüsselt lokal. Browserlöschung oder Geräteverlust kann Daten vernichten. Der neue Kern macht lokale Speicherung und Export ausdrücklich sichtbar.
- Physische iPhone-/Safari-/VoiceOver-Tests und Anfänger-Nutzertests sind laut jüngstem Bericht offen. Historische Chromium- und Axe-Berichte ersetzen diese Abnahmen nicht.
- Ältere Root-Dokumente sind teils überholt: `KNOWN_ISSUES.md` spricht noch von statischen Baumstufen, während A5.1 eine neuere Asset-/Motion-Schicht enthält; `CONTENT_STATUS.md` trägt Septemberdatum. Quelle und Zeitpunkt werden deshalb getrennt geführt.
- Die Repository-Lizenz ist nicht deklariert. Ursprünglich erfolgte kein Quellcode-/Bildtransfer. Der ausdrückliche Zusatzauftrag vom 06.11.2026 autorisiert die Übernahme der eigenen A51-Vorarbeit; diese dokumentierte Ausnahme betrifft ausschließlich Baumgrafik und Renderer, siehe [A51-Bericht](09-a51-integration.md). Eine öffentliche Rechtefreigabe wird daraus nicht abgeleitet. Bibeltext stammt weiterhin unabhängig aus belegter gemeinfreier Quelle.

## Visuelle Bestandsprüfung

Zwei vorhandene Aufnahme-Artefakte wurden tatsächlich angesehen: `reports/first-seed/screenshots/art/today-light-390-after.png` (älterer First-Seed-Stand) und `reports/simplified-steps/evidence/browser/seed-390-night-selected.png` (jüngster Schritt-Stand). Sie sind keine neu ausgeführte Bestands-App-Sitzung.

Der Heute-Screen zeigt eine ruhige Creme-/Grünpalette, Serifentitel, ein kleines Baumkunstwerk, eine dominante persönliche nächste Aktion und vier beschriftete Navigationsziele. Die Schrittansicht zeigt drei verständlich benannte Vorschläge, einen hervorgehobenen Zustand, ein einziges großes Textfeld und sekundär eingeklappte Hilfen. Das ist bereits eine substanzielle, konsistente Produktgestaltung; „generisches oder fehlendes Design“ wäre keine faire Bestandsbeschreibung.

Für das neue Produkt werden deshalb die Aufgabenstruktur und Begriffserklärung verbessert und eine eigene Bild-/Komponentenwelt geschaffen. Aus zwei Bildern wird keine vollständige visuelle Zertifizierung aller bestehenden Routen abgeleitet.

## Offene Punkte für endgültige Parität

1. Produktiv veröffentlichte URL und verbindliche Release-Basis: neuester Branch ist nicht automatisch Produktion.
2. Reale Nutzer-/Gerätedaten und bekannte Fehler außerhalb der eingecheckten Berichte.
3. Eigentums-/Nutzungsfreigaben für vorhandene redaktionelle Inhalte, Quiz-Master und Bilder. Bis dahin ausschließlich neue Inhalte.
4. Vollständige physische Geräte- und Hilfstechnologieabnahme; tatsächliche Verständlichkeit mit Einsteigern.
5. Welche P1-Bestandsfunktionen im ersten Release zwingend paritätisch sein müssen. Bis dahin priorisiert der lokale Kern Lesen → Verstehen → Reflexion.

## Quellen im unveränderten Snapshot

`README.md`, `ARCHITECTURE.md`, `CONTENT_STATUS.md`, `KNOWN_ISSUES.md`, `reports/phase7/FUNCTION_INVENTORY.md`, `reports/simplified-steps/BERICHT.md`, `reports/guided-a51/ARCHITEKTUR.md`; Implementierungen unter `src/` wie oben referenziert. Verbindlicher Snapshot-Link: https://github.com/akwasiacheampongma-code/Faithpath-/tree/a519ce898fa33907b07d5ac7a585595127556183

## Umsetzungsabgleich 0.4

Die Matrix oben beschreibt den analysierten Bestand und die Übernahmeentscheidung. Der neue Lieferstand ergänzt nun dauerhafte Entwürfe für Hub, Garten, einzelne Verse und geführte Schritte, eine Entwurfsübersicht, gezielte Versnavigation, neun eigene freiwillige Textfragen, vier weitere illustrierte Erzählpiloten und einen tatsächlichen Offline-Update-Test. Der große Quelltext wird bei kleinen Speicheränderungen nicht erneut geschrieben. Keine Bestands-Quizfragen oder vorhandenen Illustrationen wurden übernommen. Vollständige Erinnerungs-/Historienparität und reale Geräteabnahme bleiben offen; maßgeblich ist `delivery-status.md`.
