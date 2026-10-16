# FaithPath – UI/UX Phase 3: Mein Weg, persönliche Geschichte und Olivenbaum

Stand: 16.10.2026. **Implementierungsauftrag mit Abnahmekriterien, noch keine UIUX3-Implementierung oder Preview-Freigabe.**

## 0. Branch, Quelle, Release-Grenze

- Repository: `akwasiacheampongma-code/Faithpath-`.
- Arbeite ausschließlich auf `feature/uiux-phase3-personal-journey-tree-20261016`, ausgezweigt von `feature/uiux-phase2-reader-stories-20261016` @ `f500bce97e0eb4cb72908b29ca060b86e631d507`.
- Bestandsbasis: UIUX1 (Heute), UIUX2 (Reader/Geschichten/Schwert) mit unveränderten 2.314 Nachlese-MC-Fragen, 1.300 NT-Kapitelquizfragen, Bibeln OTB/Luther 1912 und persönlichem Datenstand.
- **Release-Gate unverändert:** Physische iPhone/Safari/Home-Screen-PWA/VoiceOver-Tests von UIUX1 und UIUX2 sind noch nicht bestätigt. Darüber hinaus ist aus der getrennten Codeprüfung der Kurzkapitel-Erkennung ein Verdacht wegen der Vermischung von `getBoundingClientRect()` und `scrollY` offen: vor Phase-3-Abnahme mit echter reproduzierbarer Navigation aus gescrollter Ansicht prüfen, bei Bedarf als separaten minimalen Fix mit Regression dokumentieren. Keine Produktionsfreigabe, kein Main-Merge, kein automatischer Netlify-Deploy.
- Phase 3 darf isoliert gebaut und in Chromium geprüft werden, trotz offenem Geräte-Gate. Sie darf keinen früheren Freigabestatus nachträglich behaupten.

## 1. Bereits vorhanden – NICHT neu bauen

- `src/app.js`: `paths()`, `path(pid)`, `tree()`, `history()`, `reviews()`, Weg- und Schritt-Editoren; Archivieren, Reaktivieren, sicheres Löschen mit Rückgängig, Schritte bearbeiten/auswählen/abhaken, Journal-/Bibelstellen zuordnen, Rückblick-Editor und Reminder-Logik.
- `src/domain.js`: `timeline()`, `gaps()`, `developmentCount()`, `treeLevel()`, `attach()`, nachvollziehbare Kategorien und ursprüngliche Daten-IDs.
- `src/tree-branches.js`: `pathEvidence()`, `treeBranches()` mit echten Weg-Zuordnungen; nicht jedem Zweig eine erfundene Bedeutung geben.
- `src/experience-view.js`: `treeBranchView()`, `pathFacts()`, echte sieben lokale Olivenbaum-Bilder, Zweiggeometrien mit echten Verknüpfungen.
- `src/continuity.js`: `pathContext()`, `reviewPairs()`, `allReviews()` für verifizierbare Kontinuität statt interpretierter Entwicklung.
- `src/today-model.js`: die bereits priorisierte Fortsetzung auf Heute. Heute bei UIUX3 nicht groß umbauen.
- Die Baumstufen entsprechen **ausdrücklich bestätigter dokumentierter Entwicklung**: 0, 1, 2, 3–4, 5–6, 7–9, 10+. Weder Schrittabschluss noch Quiz noch Kapitel-Lesung erzeugen automatisch eine Stufe.

## 2. Produktziel: Ein Weg ist eine Geschichte, keine Aufgabenliste

Kernfluss: „Was beschäftigt mich?“ → Text/Situation → Gedanke → **eigener kleiner Schritt** → freiwilliger Rückblick → explizit selbst festgehaltene Entwicklung → nachvollziehbare Geschichte. Nicht jeder Schritt muss „erfolgreich“ sein.

Ein Mensch soll auf `Mein Weg` innerhalb von Sekunden erkennen:
- Welcher Weg beschäftigt mich gerade?
- Was wollte ich konkret ausprobieren?
- Welche Gedanken/Bibelstellen gehören dazu?
- Wie sah mein früherer Stand aus und was habe ich selbst später darüber geschrieben?
- Wie kann ich einen Weg pausieren, fortsetzen, bearbeiten oder sicher löschen?

Sprache menschlich, warm, hoffnungsvoll, theologisch zurückhaltend. Keine Punkte, Streaks, Ranglisten, automatischen geistlichen Bewertungen, KI-Deutung über persönliche Texte oder Push-Nachrichten ohne bewusste Zustimmung. Auch Stillstand, Zweifel und schwierige Zeiten sind legitimer Teil der Geschichte.

## 3. Arbeitspaket A – „Mein Weg“-Übersicht

1. Vorher echte Browser-Aufnahmen + DOM-/Nutzungsfluss bei 320×568, 390×844, 430×932 erstellen: leer, ein aktiver Weg, mehrere aktive, viele, ausschließlich archivierte, lange Titel, aktive+archivierte.
2. Klare Orientierung: aktiver Weg mit offenem Schritt sinnvoll priorisieren; bei mehreren Wegen nachvollziehbare, stabile Auswahl (nicht per stiller Änderung von `today-model.js` eine andere Person/Geschichte wählen).
3. Karte pro Weg: Titel/Kategorie oder persönlicher Kontext, **ein konkreter nächster Schritt sofern vorhanden**, und ein verständliches „Weg öffnen“. Keine irreführende Fortschrittsquote. Archiv getrennt und zugänglich.
4. Leerer Zustand: ein unkomplizierter, freiwilliger Beginn. Keine lange Anleitung und keine Behauptung, ein Weg sei Pflicht. „Einen Weg beginnen“ in allen passenden Zuständen erreichbar.
5. Kein neuer globaler Navigationspunkt; vorhandene Routen `paths`, `path/:id`, `tree`, `history` bleiben.

## 4. Arbeitspaket B – Einzelner persönlicher Weg

1. Echte `path(pid)`-Daten in vier nachvollziehbaren Bereichen darstellen, ggf. mit sinnvollen Sektionen:
   - **Warum dieser Weg?** Titel, Kategorie, Anlass, Datum (nur tatsächlich vorhanden).
   - **Mein nächster Schritt:** erster offener Schritt, Bearbeiten und bewusstes Abhaken. Wenn kein Schritt offen, Einladung zum Hinzufügen, nie erfundene Aufgabe.
   - **Was mich begleitet:** letzte echte Gedanken/Bibelstellen und Verbindungen; weitere Einträge erreichbar ohne endlose Karten.
   - **Mein Rückblick / Geschichte:** Zeitlinie echter Momente mit direkt anklickbarem Original, explizit dokumentierten Veränderungen und Möglichkeit freiwillig zurückzublicken.
2. `timeline(s(),pid)`, `pathContext()`, `pathEvidence()` verwenden. Journal/Reflexions-Dubletten nicht mehrfach anzeigen, IDs/Quellen respektieren, keine automatisch generierten Vorher/Nachher-Urteile.
3. Historische Schritte, auch wieder geöffnete oder unvollendete, korrekt anzeigen. Abhaken = „ausprobiert/abgeschlossen“ gemäß bestehender Domain, **nicht automatisch geistliches Wachstum**.
4. Die vorhandenen Aktionen/Funktionen nutzen (Weg bearbeiten, Weg löschen, archivieren/fortsetzen, Gedanken festhalten, Schritt hinzufügen, Rückblick), nicht mit neuen konkurrierenden Speicher-/Eventhandlern ersetzen.
5. Timeline bei großen Datenmengen begrenzen/paginieren mit echter Fortsetzung, korrekten Datumsangaben und screenreaderfreundlichem DOM.

## 5. Arbeitspaket C – Olivenbaum als persönliches Symbol

1. **Alle sieben vorhandenen Grafiken erhalten**, keine neue Baumgeneration oder generische Ersatzgrafik. Premium-Darstellung mit vollständigem Motiv, ruhiger Typografie, gutem Kontrast, zugänglicher Bedeutung.
2. Stufen und Schwellenwerte **unverändert**. `treeLevel()`/\`developmentCount()` nur bei nachgewiesenem fachlichem Fehler ändern, sonst nie.
3. Deutlich erklären: Olivenbaum visualisiert dokumentierte persönliche Wegentwicklung, **keine Glaubensstärke**. Der Schwert-Hub visualisiert Bibellesen; Symbole nicht vermischen.
4. Die nummerierten Zweig-Marker öffnen ausschließlich **real vorhandene, nachweislich zugeordnete Wege**. Bei frühen Baumstufen ohne Zweig-Plätze dürfen persönliche Wege keinesfalls verschwinden: textbasierte Liste/Zugriff anbieten, keine unsichtbaren Links, keine willkürlich simulierten Zweige.
5. Archivierte Wege bleiben zugänglich; eine Archivierung löscht kein Wachstum. Bei endgültigem Löschen den **bereits dokumentierten Stand gemäß existierender Domainlogik** korrekt erhalten oder bereinigen; Diff, Endzustand und Undo ausdrücklich testen.
6. Baum nicht immer größer machen: Informationshierarchie und Originalgrafik priorisieren, große und kleine Ansichten prüfen. Keine stufenabhängigen spirituellen „Belohnungs“-Animationen; Reduced Motion erhalten.
7. `tree()` und Baumzweige mit belastbaren Quellereignissen verbinden: „Wodurch ist diese Stufe entstanden?“ nur belegte Ereignisse, Datum und ursprünglicher Text, ohne automatische moralische Einordnung.
8. Die symbolische Wirkung des Baums darf gestärkt werden, ohne 66 Schwerter, zusätzliche Badges oder eine zweite Fortschrittsökonomie einzuführen.

## 6. Arbeitspaket D – Rückblicke innerhalb eines Weges

- Verbessere **nur** die Kontextverknüpfung und die visuelle Darstellung, die unmittelbar zum persönlichen Weg gehören. Die große Journal-/Erinnerungs-Neugestaltung bleibt in Phase 5.
- `gaps()`-Einladungen nur bei echter Fälligkeit und mit richtigem Original-Schritt/Original-Gedanken. Spezialfall historischer QA2-Fehler: der Rückblick muss sich auf den **richtigen** Schritt beziehen, nicht einen später geänderten/anderen.
- Freiwillige Auswahl: Gedanke / verändert / weiterhin unterwegs / unverändert / jetzt nicht. Keine erzwungene Bestätigung, keine neue Reminder-Pflicht.
- Baumwachstum nur wenn Nutzer **selbst ausdrücklich** einen passenden Entwicklungsnachweis bestätigt; andere Rückblicke erhalten und zeigen, ohne die Stufe zu erhöhen.
- Gespeicherte Rückblicke müssen ihre Quelle und ihren historischen Wortlaut aus der bestehenden Datenstruktur nachvollziehbar darstellen; bei fehlenden/nicht mehr vorhandenen Quellen ehrlicher Fallback.
- Keine falsch bestätigten Entwicklungen aufgrund des bloßen Editierens einer früheren Notiz.

## 7. Architektur, Design und Datenschutz

- Vorhandenen modularen Vanilla-JS-PWA-Stack verwenden. Keine neue Framework- oder Cloud-Pflicht. Wo sinnvoll `paths-model.js` / `paths-view.js` oder `tree-view.js` als **reine** (schreibfreie) Darstellung mit explizitem App-Adapter schaffen. `app.js` nur inkrementell entlasten.
- Reale Datenaktionen verbleiben in existierenden Store-/Domain-Actions; keine duplizierten Eventhandler, keine neuen Speicherschlüssel, keine neue Migration, kein Schema-Bruch.
- HTML aus persönlichem Freitext immer escapen; IDs sicher kodieren; lange Texte, Zeilenumbrüche, Sonderzeichen und ungültige historische Verknüpfungen berücksichtigen.
- Stil auf `.paths-page`, `.path-page`, `.tree-page` begrenzen. Vier vorhandene Themes; klare Fokuszustände, min. 44px Touchflächen, 200% Schrift, Safe Areas, kleine Bildschirme, Keyboard und Screenreader.
- Kein Eingriff in Bibeldaten, Fragen, N-/FP-IDs, Reader-/Schwertvisualisierung, Phase-1-Heute-Layout, globales Theme-System, Service-Worker-Protokoll, Datenschutzregeln.
- Sämtliche Änderungen begründen. Umfang klein halten. Ziel: ein hochwertigeres, emotional verständlicheres Produkt, **nicht mehr Features**.

## 8. TDD und Abnahmetests (blockierend)

- Baseline vor Änderungen sichern: Commit/Build, Screenshots, Funktionen, synthetische Fixtures. Erst fehlschlagende Tests für nachweisbare UX-/Funktionslücken, dann Implementierung.
- Mindestens diese Datenzustände: 0 Wege, 1 Weg, 5/30 Wege, langer Titel und lange Gründe, nur archivierte Wege, gelöschter Weg mit/ohne Wiederherstellung, 0/1/3/10 explizite Entwicklungsmomente, alle sieben Baumstufen, mehrere Schritte, Schritte komplett, laufender Entwurf, viele Journal-Einträge, mehrere Rückblicke, fehlende Legacy-Quelle, mehrfach verknüpfte Gedanken.
- **Domain-Invarianten:** Step done ≠ milestone; alle Baumstufen stabil; archiviert ≠ gelöscht; keine Dubletten; tatsächliche Zeitlinie; bisherige Archiv-/Lösch-/Undo- und Import/Export-Semantik identisch; alle alten IDs und Verweise bleiben gültig.
- Reale Chromium-Browser-Tests für komplette Nutzerreise: von `Heute`/Reader/Story-Reflexion → Weg anlegen/verbinden → Schritt → Rückblick → explizite Entwicklung → Baumstufe, inklusive Reload, Deep Link, Offline, Export/Import und PWA-Update UIUX2→UIUX3 auf gleicher lokalen Origin.
- Responsive Vergleich: 320×568, 390×844, 430×932; Hell/Nacht plus Atmosphärisch/Papier; 200%-Text, Safe Area, Touch, Tastatur, axe/WCAG-Stichprobe, Fokus und VoiceOver-Labels.
- Echte Vorher-/Nachher-Screenshots für Wegübersicht, einzelne Wegdetails, Baumzustand 0/2/6, Archiv, Rückblick/Entwicklung und Nachtmodus. Berichte nicht durch synthetische Screenshots ersetzen; synthetische **Testdaten in echten Browser-Screenshots** sind korrekt.
- Fachliche Regressionen gegen `gaps()`, `pathContext()`, `timeline()`, `treeBranches()`, `treeLevel()`, `developmentCount()`, `detachPath()`, gesamte bisherigen UIUX1/UIUX2 QA, NT/Nachlese-Korpus, Service Worker, beide Offline-Bibeln.
- Neben bestehenden Checks offene Kurzkapitel-Frage aus Phase 2 kontrollieren. Reproduzierbare Fehler vor finalem gemeinsamen Release fixen oder ausdrücklich NO-GO für Gerätefreigabe setzen.
- Tests, die nicht ausgeführt wurden, als OFFEN markieren; keine unechte 100%-Abnahme. iOS Safari/Home-Screen-PWA/VoiceOver bleiben OFFEN bis physisch getestet.

## 9. Durchführung und Lieferung

1. Lesender UX-/Architektur-/Datenfluss-Audit; echte Ausgangsscreenshots; Priorität und kleiner Diffplan.
2. A: Wegübersicht, Tests und Commit.
3. B: Einzelner Weg und reale Timeline, Tests und Commit.
4. C: Baum/Verbindungen, Tests und Commit.
5. D: korrekte Weg-Rückblicke, Tests und Commit.
6. Vollständige funktionale, visuelle, Inhalts-, Datenschutz-, Offline- und Update-Regression.
7. Reproduzierbaren isolierten `FP4-20261016-G-STABLE1-UIUX3`-Kandidaten bauen, exakte Build-ID nur verwenden, wenn im Build wirklich so hinterlegt. Build-Hash, Content-Hash, Commit-SHAs dokumentieren und zweite unabhängige Build-Ausgabe vergleichen.
8. Liefern: fertige Commits im Branch, technische Entscheidungen für menschliche Entwickler, Vorher/Nachher-Screenshots, QA-Logs/Hashes, eigenständige Netlify-kompatible Build-ZIP, separate Review-ZIP und echte iPhone-Testanleitung. **Kein automatischer Deploy/Prod-Merge.**

GO ausschließlich für isolierte Browser-/Geräteabnahme bei grünen Gates; Produktionsfreigabe erst nach abgeschlossenem physischem Geräte-Gate für UIUX1, UIUX2 und UIUX3. Keine Ausweitung auf Phase 4/5/6, bevor dieser Kernfluss belastbar ist.
