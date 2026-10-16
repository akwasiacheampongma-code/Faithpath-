# Reproduktion und manuelle Geräteabnahme

Node 24.19.0, npm 11.9.0, Python 3.12.14 mit vorhandenen `requirements-nt-import.txt`, Chromium 151.0.7922.173. Keine neuen Abhängigkeiten. Ausschließlich synthetische Daten auf lokalen Test-Origins.

```bash
npm ci --ignore-scripts
npm test
npm run validate:nt-quiz
npm run validate:nachlese-editorial
node scripts/validate-faithpath-materialization.mjs
FAITHPATH_BUILD_BRANCH=feature/uiux-phase1-today-20261016 FAITHPATH_OUT=qa-output/uiux-phase1/build-a npm run build
FAITHPATH_BUILD_BRANCH=feature/uiux-phase1-today-20261016 FAITHPATH_OUT=qa-output/uiux-phase1/build-b npm run build
node reports/nachlese-editorial-56/evidence/verify-build.mjs qa-output/uiux-phase1/build-a qa-output/uiux-phase1/build-b
PORT=4361 node scripts/serve.mjs qa-output/uiux-phase1/build-a
```

Der feste Branchname in der Buildumgebung erhält auch im detached Checkout die identische `BUILD.txt`. Die Ausgaben müssen in allen 324 Dateien bytegleich sein. Der bestehende unabhängige Prüfer kontrolliert sämtliche veröffentlichten Dateihashes und die Content-Dateimap. `release-integrity.json` führt alle anderen 323 Dateien auf; die Integritätsdatei selbst wird zusätzlich durch das ZIP-Prüfsummenverzeichnis gebunden.

Im zweiten Terminal:

```bash
QA_URL=http://127.0.0.1:4361 node tests/today-phase1-browser.mjs
QA_URL=http://127.0.0.1:4361 node tests/today-phase1-zoom.mjs
node tests/today-phase1-capture.mjs after http://127.0.0.1:4361
FAITHPATH_TEST_ROOT=qa-output/uiux-phase1/build-a FAITHPATH_CHROMIUM=/usr/bin/chromium FAITHPATH_PORT=4364 node tests/browser.mjs
QA_URL=http://127.0.0.1:4361 QA_OUT=qa-output/uiux-phase1/stabilization node tests/stabilization-browser.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4361 FAITHPATH_QA_OUT=qa-output/uiux-phase1/chapter node tests/chapter-questions-browser.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4361 node tests/nt-quiz-browser.mjs
QA_URL=http://127.0.0.1:4361 node tests/nachlese-mc-corpus-browser.mjs
QA_URL=http://127.0.0.1:4361 QA_OUT=qa-output/uiux-phase1/mc-fixtures node tests/nachlese-mc-browser.mjs
FAITHPATH_TEST_ROOT=qa-output/uiux-phase1/build-a FAITHPATH_CHROMIUM=/usr/bin/chromium node tests/service-worker.mjs
FAITHPATH_PREVIOUS_ROOT=/absolute/path/to/verified-NMC2-build node tests/today-phase1-update.mjs
```

Für den tatsächlichen NMC2→UIUX1-Test den unveränderten bereits ausgelieferten NMC2-Build verwenden. Erwartete Build-ID: `FP4-20261016-G-STABLE1-NMC2`; Build-Hash: `8414b3115d100d191ec18812e2c6caeb7264e18e91d09684c35c14fbaf3b1ae8`. Das vorhandene NMC2-Build-ZIP kann in einen eigenen Ordner entpackt werden. Nicht mit Kandidatdateien mischen. Der Test installiert den echten Vorgängerworker, ersetzt ausschließlich den Inhalt seiner lokalen Origin auf Port 4362 und aktiviert den Kandidaten über „Jetzt aktualisieren“.

Der historische Worker-Regressionstest benötigt das Git-Objekt `3c5b221ac958775588a62b49fbc9df5e82eed482`; gegebenenfalls vollständige Git-Historie abrufen. Er simuliert einen älteren Entwicklungsstand und prüft unter anderem fehlgeschlagene Installation und Fremdcaches. Er behauptet keine Identität mit dem Produktionsdeployment.

Vorher-Bilder: den Branch-Start `00387e1a4d87227b76adc4cf9bf8c7efd5ea6be1` in einem separaten Checkout bauen, dessen Ausgabe auf Port 4360 starten und aus dem Implementierungscheckout `node tests/today-phase1-capture.mjs before http://127.0.0.1:4360` ausführen. So werden dieselben neuen synthetischen Fixtures gegen die unveränderte alte App verwendet. `tests/today-phase1-fixtures.mjs` und feste Erinnerungszeit machen Daten und Zustände nachvollziehbar.

## Echtes iPhone / Safari / installierte PWA — OFFEN

Es wurde keine Netlify-Preview veröffentlicht. Die folgenden Schritte benötigen eine anschließend gesondert bereitgestellte isolierte HTTPS-Test-Origin. Keine Produktionsseite und keine echten Journaldaten dafür verwenden.

1. Modell, iOS-Version, Browser, Datum, Build-ID und Prüfer notieren. Kandidat muss `FP4-20261016-G-STABLE1-UIUX1` anzeigen. Bei noch aktivem NMC2 den angebotenen Versionswechsel bewusst ausführen; keinen lokalen Datenspeicher löschen.
2. Frisch: Heute öffnen; „Ich brauche Orientierung“ und „Direkt zur Bibel“ ohne Scrollen erreichen. Orientierung bis zum vorhandenen Anfängerleitfaden und direkter Bibel-Einstieg funktionieren. Eine neue App-Nutzung darf nicht als Glaubensstatus ausgegeben werden.
3. Rückkehr: synthetischen aktiven Weg mit offenem Schritt anlegen. Bei 390 × 844 müssen primäre Fortsetzungsaktion und vollständiger Olivenbaum im ersten Bildschirm erkennbar sein. Bei 320 × 568 sind natürliche Scrollwege zulässig; kein horizontaler Überlauf und keine dauerhaft verdeckte Aktion.
4. Einen ungespeicherten Gedanken hinterlassen, zurückkehren und direkt über den Hinweis fortsetzen. Texte, Wege-Verbindung und bestehender Entwurf bleiben erhalten. Tastatur öffnen/schließen und App-Wechsel testen.
5. Nur archivierten Weg, aktiven Weg ohne offenen Schritt, nur Leseverlauf, nur Journal, viele Wege und fälligen Rückblick prüfen. „Wege und Archiv öffnen“ öffnet die bestehende Übersicht; „Archiv“ zeigt dort die vorhandenen ruhenden Wege. Kein archivierter Weg wird stillschweigend aktiviert.
6. Alle vier Themes, große Schrift, echtes Pinch-Zoom, reduzierte Bewegung, Safe Areas, Orientierungwechsel und vollständiges Scrollen prüfen. Auch lange Titel und Schritte müssen vollständig lesbar und ihre Aktionen erreichbar bleiben.
7. VoiceOver: über Überschriften und Landmarks navigieren; nächsten Schritt, Entwurf, Bibelfortsetzung, letzten Gedanken, Rückblick und Schnellaktionen bedienen. Vorlesereihenfolge muss zur sichtbaren Reihenfolge passen. Fokus und Benennungen separat abnehmen.
8. Safari offline vorbereiten und vollständig schließen; Flugmodus, Neustart, beide Bibeln, Story-/Kapitelquiz und Nachlese prüfen. Danach dieselbe Prüfung als über Safari installierte Home-Screen-PWA mit Safe Areas und Tastatur wiederholen.
9. Auf derselben isolierten Test-Origin NMC2 installieren, synthetisches Journal, Weg, Markierung, Fortschritt und Entwurf anlegen. Origin auf UIUX1 umstellen, ausdrücklichen Update-Schritt prüfen. Danach persönliche Daten, Entwurf, Offline-Start und neues Heute-Layout vergleichen. Safari und installierte PWA getrennt protokollieren.
10. Synthetisches Backup exportieren und über iOS Dateien wiederherstellen. Eine ungültige Datei muss gespeicherte Daten und Entwurf unangetastet lassen. Langzeitwiederaufnahme und Betriebssystem-Speicherdruck bleiben zusätzlich zu beobachten.

Für jeden Punkt PASS / FAIL / OFFEN mit Beleg erfassen. Datenverlust, falsches Wegziel, nicht bedienbare Primäraktion, nicht ladender Offline-Start oder unvollständig aktivierter Build sind Blocker. Bis zum erfolgreichen Geräte-Gate gibt es **keine Produktionsfreigabe**.
