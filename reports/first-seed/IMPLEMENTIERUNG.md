# FaithPath – Dein erster Samen und lebendiger Olivenbaum

Stand: 2026-10-19. CONDITIONAL GO – ausschließlich für die nächste menschliche Nutzer- und Geräteabnahme.

FaithPath erklärt seinen Sinn jetzt anhand eines tatsächlich gespeicherten persönlichen
Anfangs. Anliegen, vorhandener Bibeltext, eigene Worte beziehungsweise Gebet und
nächster Schritt führen in einen echten Weg. Das Pflanzen macht diesen Anfang
sichtbar. Es verändert keine Glaubensbewertung und keine bestehende Baumregel.

## A. Implementierung und geprüfter Stand

- Repository: akwasiacheampongma-code/Faithpath-.
- Neuer Branch: feature/ux-first-seed-living-tree-20261019.
- Geprüfter Appcommit: 22ac39e993983d2ce154dfb02d584b2da7b2d192.
- Ausgangs-HEAD: 7d4441caf5112c04b8b6af7ddec8c4ee49d0c63a; Runtimebasis war der abgeschlossene Phase7-Stand MAINT1.
- Build: FP4-20261019-G-STABLE1-FIRSTSEED1.
- Build-Hash: aabb3d500f9530620389d4ed78c590480dcc24d22bb8a1c118a1012e3bdf0bb5.
- Content-Hash: 8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309.
- 243 Dateien, 132 unveränderte Offline-Bibeldateien, 239 Service-Worker-Assets.

Zwei unabhängige Builds sind dateiweise einschließlich Manifest byte-identisch.
Das Build-ZIP enthält die statische App an seiner Wurzel und wird beim Verpacken
nochmals gegen jede Dateiprüfsumme kontrolliert. Spätere QA-/Dokumentationscommits
ändern den geprüften Runtime-Stand nicht; die endgültige Branchspitze steht im
Gitprotokoll. Der Buildbeleg nennt ausdrücklich den Appcommit.

### Der neue Ablauf

1. Optionaler Einstieg:FaithPath erklären und anhand eines Beispiels einen Weg verstehen.
2. Vorhandenes Anliegen wählen oder eigene Worte verwenden. Ein Themenwechsel ersetzt keine eigene Formulierung.
3. Vorhandenen Bibelgedanken samt ursprünglicher Einordnung und Textquelle lesen; beide lokalen Übersetzungen sind wählbar. Bei langem Abschnitt zuerst zwei Verse, der Rest aufklappbar.
4. Gedanken oder Gebet festhalten. Keine richtige oder falsche persönliche Antwort.
5. Einen konkreten kleinen Schritt formulieren.
6. Den persönlichen Weg prüfen und speichern; anschließend das Pflanzen und Keimen ansehen.

Einführung, Orientierung und direkte Bibel bleiben freiwillige Einstiege. Mehr →
Einführung ansehen führt später erneut dorthin. Pause, normale Navigation,
App-Neustart und „Festhalten“ setzen den eigenen Entwurf fort. Ein fremder Entwurf
wird nicht ersetzt. Beim Speichern sind Eingaben kurz gesperrt; Erfolg zeigt nur
tatsächlich gespeicherte Worte. Speichermangel erhält den Entwurf, bietet eine
Dateisicherung und ausdrücklich bestätigtes Verwerfen mit Eigentumsprüfung.

### Wege, Heute und Baum

„Mein Weg“ erklärt anhand eines konkreten Beispiels, was hineingehört. Wegdetails
verbinden Gedanken, Gebete, Bibelstellen, Schritte und spätere Rückblicke über die
vorhandenen Funktionen. Heute zeigt die größere Illustration, den aktuellen
Schritt und weiterhin einen schnellen Bibelzugang. Bei 320px mit Entwurfsstreifen
wurden überdeckte Teile des Bibelbuttons durch weniger Headerpadding korrigiert.

Alle sieben Bilder wurden als originale lokale Vektorgrafiken gestaltet. Bestehende
Stufennamen, sieben Schwellen und Zählregeln bleiben erhalten. Historische Bilder
bleiben als geschützte Assets erhalten. Es werden keine externen Bilder oder
Schriften geladen. Vorhandene Newsreader-/DM-Sans-Dateien und ihre OFL-Lizenzen
bleiben erhalten; die neue Grafik verwendet keine fremde Bildquelle.

Pflanzen und Keimen sind ein Bild für den Anfang. Der gespeicherte Baum verändert
sich ausschließlich nach den bisherigen ausdrücklich bestätigten Entwicklungen:
0,1,2,3–4,5–6,7–9 und ab10. Bibellesen, Quiz und erledigte Aufgaben zählen nicht.
Der Baum misst weder Gottes Nähe noch Glaubensstärke oder menschlichen Wert.
Das bestehende Schwert bleibt das Symbol der Bibelreise.

### Architektur für menschliche Entwickler

| Modul | Verantwortung |
|---|---|
| src/first-seed/model.js | Reine Auswahl-/Validierungslogik, stabile IDs und normale V5-Datensätze; keine Speicherzugriffe. |
| src/first-seed/controller.js | Eigener Entwurf, Schreibqueue, Aktionssperre, Fokus und Abbruch später Bibelantworten. |
| src/first-seed/view.js | Escaptes HTML und Erklärungen; Beispiele werden nicht als persönliche Daten gespeichert. |
| src/olive-tree.js | Gemeinsame originale SVG-Darstellung; liest die Stufe und zählt nichts. |
| src/living-motion.js | Sichtbarkeit, Reduced Motion und Aufräumen; keine Produktions-Timer oder rAF-Schleifen. |
| src/verbunden/seed.css | Begrenzte Verbunden-Ergänzungen für Einführung, Baum und persönliche Hilfen. |
| src/app.js / app-router.js | Vorhandene Router-/Eventadapter verdrahten das neue Modul. |

Store, journalTransaction und exakte Draft-Eigentümerschaft bleiben die
Speicherautoritäten. Keine neue Migration, kein neues Speichersystem, keine
Runtime-Abhängigkeit und kein Frameworkwechsel. Die vollständige Dateiliste
liegt in DATEIAENDERUNGEN.txt; Architektur-, Entwicklungs-, Daten- und
Release-Dokumentation wurde ergänzt.

## B. UX-Ergebnis und noch erforderliche Menschenprüfung

| Testerproblem | Umsetzung |
|---|---|
| Sinn wird ohne Gründererklärung nicht verstanden | Konkreter geführter Anfang statt bloßer abstrakter Produktbeschreibung. |
| Unklar, was in einen Weg gehört | Beispiel, gewähltes Anliegen, eigener Gedanke/Gebet, Bibeltext, Schritt und abschließende gemeinsame Vorschau. |
| Nutzer fühlen sich nicht abgeholt | Freiwilliger persönlicher Einstieg und gleichwertiger direkter Bibelzugang; keine Annahme über Glaubenserfahrung. |
| Gewünschte zusammenhängende Geschichte | Die Einführung schreibt echte verknüpfte Wege/Journal-/Reflexionsdatensätze und führt in den gespeicherten Weg. |
| Baum zu klein beziehungsweise zu wenig lebendig | Größere Originalgrafiken, sieben unterschiedliche Darstellungen, dezentes Licht und Blattbewegung, Pflanzsequenz. |
| Wunsch nach Effekten | Kurze funktionale Übergänge und freiwilliges Replay; Lesen bleibt ruhig. |

Keine echten Personen wurden durch Codex getestet. UX-01 bis UX-06 bleiben OFFEN.
Die Ziele 8/10 für Kernverständnis, selbstständigen ersten Weg und Baumverständnis
sowie durchschnittlich 4/5 für visuelle Qualität und Angemessenheit sind künftige
Abnahmekriterien. Zehn anonyme Teilnehmerbögen mit 60 offenen Aufgaben, XLSX/CSV,
Moderationsskript und Auswertung liegen bei. Unter Testdaten/ liegen sieben
echte App-Exporte rein synthetischer Baumprofile, über die vorhandene
Wiederherstellung in zuvor leeren Datenständen im Browser validiert. Sie erleichtern das physische Gate;
sie dürfen ausschließlich ein isoliertes Testprofil ersetzen. Es wurden keine
Resultate echter Menschen erfunden.

Ein wichtiges Prüfthema bleibt, ob Menschen das symbolische Keimen und die
bestehende bestätigungsgebundene Baumstufe klar unterscheiden. Der Wortlaut
macht dies deutlich; die tatsächliche Wirkung muss UX-04 prüfen.

## C. Tatsächliche technische Testmatrix

| Prüfung | Ergebnis | Nachweis und Grenze |
|---|---|---|
| Unit/Integration | BESTANDEN | 245 Node-Tests; vollständiges Protokoll unit.log |
| Historische UIUX1–5-Regression | BESTANDEN | 41 Browserprogramme; accepted-exits.json, Original-exits.json und dokumentierte Notiz-Wiederholung |
| Geführter Nutzerweg | BESTANDEN | 7 Prüfabschnitte plus tatsächliche Wiederherstellung in leerem unabhängigem Browserprofil; beide Übersetzungen, Gebet, Back/Reload, Offline-Neustart |
| Fehlerfälle | BESTANDEN | 4 Browserfehler-Szenarien plus Unitfälle zu Quota, Konflikt und Commit-Rennen |
| Animation | BESTANDEN | 2 echte Browserprüfungen, verzögerter Commit, Replay, Reduced Motion und konstante Grafikgröße |
| PWA-Update | BESTANDEN | 4 Prüfabschnitte MAINT1 → fehlgeschlagene Installation → neuer Kandidat; unveränderte Speicherbytes |
| Plattformfehler | BESTANDEN | Bibelantwort beschädigt und Workerzugriff verweigert; sichtbare Fehler und Wiederholung |
| Responsive Baum/Heute/Wege | BESTANDEN | 240 Ansichten; fünf Größen, vier Themes,100/200% Text;16 axe-Audits |
| Alle Einführungsschritte | BESTANDEN | 144 Zustände; drei Mobilgrößen, vier Themes,100/200%;24 axe-Audits |
| Kontraste im neuen Modul | BESTANDEN | 28 berechnete Farbpaare einschließlich Formfeldränder; keine vollständige WCAG-Zertifizierung |
| Chromium/Firefox/WebKit | BESTANDEN | Tatsächlich ausgeführte GitHub-Actions-Jobs; TCP-Verbindung zum Testserver getrennt |
| Lint | BESTANDEN | 0 Fehler, höchstens5 bestehende Warnungen; keine TypeScript-Konfiguration vorhanden |
| Datenverträge | BESTANDEN | 174 geschützte Quellen, SchemaV5/sieben Schlüssel sowie sieben im echten Browser exportierte und wiederhergestellte Testprofile |
| ES-Modulgraph | BESTANDEN | Auflösbare Runtime-Imports; keine neuen Frameworks oder Runtime-Abhängigkeiten |
| Performancevergleich | BESTANDEN | Gemessener Headless-Vergleich; reale Smartphone-FPS/Akku weiterhin offen |
| Reproduzierbarer Build | BESTANDEN | Zwei vollständige byte-identische Builds einschließlich Dateimanifest; reproducibility.json |
| Contentquellen | BESTANDEN | NT-Excel/JSON und installierter Nachlese-Master geprüft; keine neuen redaktionellen Änderungen |

| Weitere Kategorie | Ergebnis | Nachweis |
|---|---|---|
| UX-01 bis UX-06, zehn echte Personen | OFFEN | UX_TESTPLAN.md und 60 nicht ausgefüllte Teilnehmeraufgaben |
| Physisches iPhone/Safari/VoiceOver | OFFEN | IPHONE_ABNAHME.md; Linux-WebKit ist kein echtes Gerät |
| Datenschutz des neuen Ablaufs | BESTANDEN | Keine externen Requests und keine persönlichen Konsolenlogs in flow/results.json; nur synthetische Daten |

Eine zusätzliche Chromium-Prüfung importiert den tatsächlichen Export des neuen
Anfangs in ein leeres unabhängiges Profil, startet das Journal neu und exportiert
dieselben Datensätze erneut. Ein wirkungsloser Import könnte diese Prüfung nicht
bestehen. Die erweiterte Prüfung ist lokal belegt, nicht als zusätzliche Firefox-/
WebKit-Ausführung ausgegeben.

Die neuen Funktionsnachweise decken FT-01 bis FT-07 ab:Start/Back/Pause/Resume,
Mehrfachtippen, Gedanken und Gebete, gültige Bibelreferenzen, reale Wiederherstellung,
Quota, fremde und defekte Entwürfe, verzögerte Speicherung, späte Bibelantworten,
alle Stufen und unveränderte Zählung. Die Bestandsregression prüft Reader, Quiz,
Geschichten, Wege, Journal, Rückblicke, Archive, Undo, Backups und alte Migrationen.

Vor der letzten Grafikkorrektur scheiterten der erste Notizlauf und die
unveränderte Wiederholung am 15-Sekunden-
Budget für natives Befüllen mit 31.200 Zeichen. Ein isolierter Vergleich im selben
parallel belasteten Zwei-Kern-Container reproduzierte dies auch auf unverändertem
MAINT1. Mit 60 Sekunden waren beide Texte vollständig identisch übernommen:
29,9 Sekunden auf der Basis, 33,8 Sekunden auf dem Kandidaten. Dies belegt keine
Ursache im Redesign und keine realistische Smartphone-Latenz. Nur für Eingaben
über 10.000 Zeichen und das zugehörige Speichern erhält der Browserhelfer nun
ein begrenztes 60-Sekunden-Budget;
Payload und sämtliche Speicher-/Lösch-/Quota-Assertions bleiben unverändert. Der
vollständige Notiztest wurde damit erneut bestanden. Originalfehler, Vergleich
und Wiederholungen sind unter diagnostics-source7 getrennt erhalten. Der finale
Gesamtlauf verwendet dieselbe begrenzte Zeitregel; sämtliche übrigen Notiz-
und Datenlogikdateien sind gegenüber dem dort geprüften Kandidaten identisch. Lange
Texte bleiben ein expliziter Performancepunkt der echten Geräteabnahme.

Es gibt keine TypeScript-Konfiguration; es wurde keine TypeScript-Prüfung erfunden.
Die fünf bestehenden Lintwarnungen bleiben dokumentiert, neue Lintfehler sind
nicht akzeptiert. Testzahlen sind Ausführungsnachweise, kein Beleg für 100 Prozent
Codeabdeckung oder ein fehlerfreies Produkt.

### Browser und Offline

System-Chromium 151.0.7922.173 auf Debian 13, Node 24.19.0. Lokale Firefox-/WebKit-
Downloads wurden mit 403 blockiert. Beide Engines wurden deshalb tatsächlich in
GitHub Actions auf Ubuntu24.04 ausgeführt: Chrome for Testing151.0.7922.34,
Firefox153.0 und WebKit26.5 laut Installationsprotokollen. Der finale Lauf ist
im CI-Beleg verlinkt.

Playwrights context.setOffline scheiterte in Linux-WebKit sowohl auf unverändertem
MAINT1 als auch auf dem Kandidaten, obwohl Worker und Cache vorhanden waren.
Dies wird nicht als bestandener Emulationstest ausgegeben. Im Kontrollversuch
mit tatsächlich geschlossenem TCP-Listener funktionierten beide Versionen aus
dem Cache. Der vollständige neue Ablauf einschließlich Offline-Neustart wurde
mit diesem realen Serverausfall in Chromium, Firefox und WebKit bestanden.
Das beweist keine physische iPhone-/Safari-/VoiceOver-Abnahme.

In einem WebKit-Lauf vor der abschließenden Lichthof-Korrektur waren alle sieben
Funktionsabschnitte erfolgreich,
aber die Engine meldete zusätzlich ‚ResizeObserver loop completed with undelivered
notifications‘. Dieser Lauf wurde korrekt als fehlgeschlagen archiviert, nicht
herausgefiltert. Der unveränderte Wiederholungslauf ist im historischen CI-Beleg unter diagnostics-source7 getrennt
ausgewiesen. Die finale CI-Quelle ist davon gesondert ausgewiesen. Eine sporadische Größenbeobachtungsmeldung bleibt ein Beobachtungspunkt
für die Geräteabnahme; aus diesem Einzelbefund wird keine bestätigte Ursache behauptet.

Axe-Kontexte dürfen nur für deren Diagnosestile CSP umgehen. Die getrennten
Flow-, Core- und Routentests verwenden die wirkliche ausgelieferte CSP. 16 neue
Baum-/Übersichtsaudits und 24 Szenenaudits ersetzen keine manuelle WCAG-Prüfung;
unvollständige Axe-Prüfpunkte bleiben in den Rohdaten. Die bisherigen manuellen
Kontrast-/Gerätegates sind damit nicht rückwirkend freigegeben.

### Datenintegrität und Datenschutz

SchemaV5, sieben LocalStorage-Schlüssel, Store, Drafts, Transaktionen, Import-
Validierung, Domain und historische Regeln bleiben unverändert. Der zusätzliche
Draft-Discriminator first-seed nutzt den bestehenden Umschlag. Es wird nur der
exakte eigene Entwurf abgeschlossen oder ausdrücklich verworfen. Eine
Wiederherstellungsdatei eines Entwurfs ist keine normale importierbare App-Sicherung.

1.300 NT-Fragen,2.314 Nachlese-Fragen, Geschichten, beide Bibeltexte und ihre IDs
wurden in diesem Featurebranch nicht redaktionell verändert. Historische Angaben
wie changed_fields6151 oder changed_questions58 in Validatorlogs beziehen sich
auf bereits integrierte Masterfassungen, nicht auf neue Änderungen dieses Auftrags.
Die geschützten Quellen und der unveränderte
Content-Hash belegen das. Alte synthetische Einträge, Fortschritte, Markierungen,
Archive und Wiederherstellungskopien bleiben in den Upgrade- und Importtests erhalten.

Die neuen Flows übertrugen keine persönlichen Texte an externe Dienste und
schrieben keine Testgedanken in die Browserkonsole. Alle automatisierten Daten
waren synthetisch und in isolierten Browserprofilen. Die Speicherung bleibt wie
zuvor lokal und unverschlüsselt; ein gelöschtes Browserprofil ist kein Backup.
Es gibt keine neue Cloud-Synchronisation oder zusätzliche Berechtigung.

## D. Visuelle Nachweise und Performance

Vergleich.html zeigt echte Browserbilder:Einführung, Anliegen, Bibelgedanke,
Gebet, Schritt, Vorschau, Pflanzen, echter Weg sowie alle sieben Baumstufen und
vier Themes. Vorher/Nachher verwendet dieselben synthetischen Wegdaten auf der
unveränderten MAINT1-Basis und dem neuen Build. Isolierte Baum-Crops blenden die
Navigation nur zur Bildaufnahme aus; vollständige UI-Ansichten werden separat
geprüft. Die App blendet keine Texte zur Kaschierung von Layoutfehlern aus.

Die Sichtprüfung fand und korrigierte reale Fehler:ungültige SVG-Blattverweise,
überlaufende Grafik, überlappende Zweig-Touchflächen und Grafik-Paint, der das
Menü abfing. Tests prüfen nun auch aufgelöste SVG-Verweise und echte Blatt-Bounds.
Bei 390×844 ist die Startaktion oberhalb der Navigation sichtbar. Große Schrift
wird nicht durch winzige Schrift oder pauschales Abschneiden passend gemacht.

| Build | Sichtbar ms | rAF Median / P95 ms | Leerlauf-Task ms/2s | JS-Heap Bytes | DOM-Knoten | Paket Bytes |
|---|---:|---:|---:|---:|---:|---:|
| before | 744.1 | 16.7 / 16.7 | 0.313 | 11200576 | 261 | 20522718 |
| after | 688.0 | 16.7 / 16.7 | 0.313 | 11394948 | 903 | 20574788 |

Bedingungen und Rohwerte stehen unter Nachweise/performance. Headless-rAF ist
keine Smartphone-FPS- oder Akku-Messung. Der Vergleich ist lokal und hat eine
begrenzte Stichprobe; CPU-Last durch parallele Tests ist gesondert vermerkt.
Animationen sind endlich:Blätter höchstens 10 s, Licht höchstens 14 s, Pflanzen rund 2,5 s.
Offscreen/Hintergrund pausiert; Reduced Motion entfernt die Effekte. Danach gibt
es keine dauerhafte Animationsschleife. Ursprüngliche Baum-Assets bleiben aus
Kompatibilitätsgründen im Offlinepaket; neue schwere Bilddateien kamen nicht hinzu.

## E. Behobene Fehler, Grenzen und Rollback

| Priorität | Nachgewiesener Fehler | Abhilfe |
|---|---|---|
| P1 | Text während finaler Speicherung schien gespeichert, war aber nicht im Datensatz. | Eingaben vor dem ersten await sperren; verzögerter echter Commit als Regression. |
| P2 | Abgelehnte Schreibqueue blockierte einen neuen Anfang nach bewusstem Verwerfen. | Neue Sitzung erhält eine erfüllte Queue; Fremdentwürfe bleiben geschützt. |
| P2 | Festhalten/compose konnte den neuen Drafttyp nicht fortsetzen. | Weiterleitung zur tatsächlichen Samen-Route. |
| P2 | Verspäteter Abschluss konnte eine andere Ansicht überschreiben. | Navigation während laufender Aktion serialisieren; späte Bibelantworten abbrechen. |
| P2 | SVG-Blätter und mobile Grafik-/Touch-Geometrie fehlerhaft. | Referenzgraph, echte Bildprüfung, feste zugehörige Zweigkoordinaten und dekorative Pointerbegrenzung. |
| P2 | Neue Feldränder nur1,36–1,62:1 Kontrast. | Bestehender semantischer Feldrand:5,94–8,30:1 in den vier Themes. |
| P2 | Lichthof der Samen-/Keimling-Nahansicht wurde rechteckig abgeschnitten. | Pro Stufe passende Geometrie mit vollständig transparentem Rand; alle Viewports einschließlich Animationsdrift geprüft. |
| P2 | Übersetzungswechsel verlor Tastaturfokus nach async Rendern. | Fokusidentität über beide Renderdurchläufe erhalten; Unit- und Drei-Engine-Regression. |

Unabhängiges Review einschließlich abschließender Delta-Prüfung ist in REVIEW.md
festgehalten. Am geprüften Stand bleiben daraus keine bestätigten offenen Fehler.

OFFEN bleiben echte Nutzerverständlichkeit, subjektive visuelle Qualität,
physisches iPhone Safari, installierte PWA, VoiceOver, echte Bildschirmtastatur,
Safari-Zoom/Dynamic Type und Smartphone-Akkumessung. Simulierte Safe Areas,
Chromium-Skalierung und Linux-WebKit zählen dafür nicht als bestanden.

Rollback:vor einem manuellen Versionswechsel eine vollständige Sicherung und
einen offenen Samen-Entwurf separat sichern oder abschließen. Alte Apps können
diesen neuen Editor nicht bearbeiten; normale V5-Wege und Einträge bleiben
kompatibel. Den unveränderten MAINT1-Build auf ausschließlich einer isolierten
QA-Origin wiederherstellen und den Worker bewusst aktivieren. Keine Speicher-
oder Cache-Löschung als vermeintliche Reparatur. Produktion braucht separate Freigabe.

## F. Freigabeempfehlung

CONDITIONAL GO – ausschließlich für die nächste menschliche Nutzer- und Geräteabnahme.

Vor einem produktiven GO müssen mindestens die definierten Zehn-Personen-Ziele,
das physische Geräte-Gate und die verbleibenden manuellen Accessibility-Punkte
mit echten Belegen geschlossen sein. Empfohlen ist jetzt der gezielte Nutzertest
mit diesem Kandidaten, bevor weitere Funktionen oder eine Veröffentlichung folgen.
Es wurde keine Produktionsseite oder bestehende QA-Site verändert, nichts in
main zusammengeführt und kein automatischer Deploy ausgeführt.

## Anhang:vollständige Bestandsregression

| Programm | Ergebnis | Laufzeit |
|---|---|---:|
| core | BESTANDEN | 81.0s |
| stabilization | BESTANDEN | 47.5s |
| chapter | BESTANDEN | 118.4s |
| nt | BESTANDEN | 218.0s |
| nachlese | BESTANDEN | 81.1s |
| mc-fixtures | BESTANDEN | 18.2s |
| worker | BESTANDEN | 20.7s |
| today | BESTANDEN | 452.6s |
| today-zoom | BESTANDEN | 6.0s |
| phase2 | BESTANDEN | 128.4s |
| phase2-stress | BESTANDEN | 37.8s |
| phase2-short | BESTANDEN | 45.5s |
| experience | BESTANDEN | 83.4s |
| core-depth | BESTANDEN | 143.7s |
| core-axe | BESTANDEN | 21.4s |
| continuity | BESTANDEN | 117.6s |
| branches | BESTANDEN | 397.2s |
| overview | BESTANDEN | 149.8s |
| detail | BESTANDEN | 109.0s |
| tree | BESTANDEN | 177.6s |
| reviews-original | BESTANDEN | 243.4s |
| phase3-stress | BESTANDEN | 70.3s |
| journey | BESTANDEN | 22.2s |
| short-navigation | BESTANDEN | 147.8s |
| premium-journal | BESTANDEN | 49.1s |
| final-notes | BESTANDEN | 62.9s |
| product | BESTANDEN | 108.1s |
| navigation | BESTANDEN | 228.5s |
| discover | BESTANDEN | 192.3s |
| onboarding | BESTANDEN | 400.3s |
| routes | BESTANDEN | 184.2s |
| menu-focus | BESTANDEN | 18.0s |
| phase4-stress | BESTANDEN | 72.1s |
| journal | BESTANDEN | 273.6s |
| reviews | BESTANDEN | 314.2s |
| reminders | BESTANDEN | 70.3s |
| backup | BESTANDEN | 152.4s |
| backup-races | BESTANDEN | 18.1s |
| backup-dialogs | BESTANDEN | 61.7s |
| phase5-stress | BESTANDEN | 54.0s |
| integration | BESTANDEN | 47.6s |
