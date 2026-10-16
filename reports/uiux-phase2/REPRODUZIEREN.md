# UIUX2 reproduzieren

## Quellen und Build

Anwendungscode: `0eb06e91cf6b0f153061de265997771a96e2c646`, Arbeitsbranch `feature/uiux-phase2-reader-stories-20261016`. Der QA-Commit ergänzt nur Dokumentation, Nachweise und Screenshot-Skripte. Node ≥20 und die vorhandene Python-3-Umgebung/Redaktionsvalidatoren verwenden. Keine neuen Abhängigkeiten.

```bash
npm ci --ignore-scripts
npm test
npm run validate:nt-quiz
npm run validate:nachlese-editorial
FAITHPATH_OUT=qa-output/uiux-phase2/build-a npm run build
FAITHPATH_OUT=qa-output/uiux-phase2/build-b npm run build
node reports/nachlese-editorial-56/evidence/verify-build.mjs qa-output/uiux-phase2/build-a qa-output/uiux-phase2/build-b
```

Bei einem separaten Git-Archiv/Different-Branch zusätzlich `FAITHPATH_BUILD_BRANCH=feature/uiux-phase2-reader-stories-20261016` setzen, damit `BUILD.txt` identisch ist. Kein Buildzeitstempel oder Zufallswert fließt in das Ergebnis ein.

Erwartet: `FP4-20261016-G-STABLE1-UIUX2`, 329 Dateien; Build-Hash `14d83ffa52866b333b011dbce413e4432f3b8ba75a4d33e6c2ee5ae1b427a4f6`; Content-Hash `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309`. Das ZIP direkt in einen separaten Ordner entpacken; seine äußere SHA-256 zusätzlich anhand der mitgelieferten Datei prüfen.

## Lokal im echten Browser

```bash
PORT=4383 node scripts/serve.mjs qa-output/uiux-phase2/build-a
```

In einem zweiten Terminal mit installiertem Chromium unter `/usr/bin/chromium`:

```bash
QA_URL=http://127.0.0.1:4383 node tests/phase2-browser.mjs
QA_URL=http://127.0.0.1:4383 node tests/phase2-stress.mjs
QA_URL=http://127.0.0.1:4383 node tests/phase2-short-chapter-browser.mjs
QA_URL=http://127.0.0.1:4383 QA_OUT=qa-output/uiux-phase2/stabilization node tests/stabilization-browser.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4383 FAITHPATH_QA_OUT=qa-output/uiux-phase2/chapter-browser node tests/chapter-questions-browser.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4383 node tests/nt-quiz-browser.mjs
QA_URL=http://127.0.0.1:4383 node tests/nachlese-mc-corpus-browser.mjs
QA_URL=http://127.0.0.1:4383 QA_OUT=qa-output/uiux-phase2/mc-fixtures node tests/nachlese-mc-browser.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4383 FAITHPATH_QA_OUT=qa-output/uiux-phase2/experience node tests/final-experience-browser.mjs
QA_URL=http://127.0.0.1:4383 node tests/today-phase1-browser.mjs
QA_URL=http://127.0.0.1:4383 node tests/today-phase1-zoom.mjs
FAITHPATH_TEST_ROOT=qa-output/uiux-phase2/build-a FAITHPATH_CHROMIUM=/usr/bin/chromium FAITHPATH_PORT=4386 node tests/browser.mjs
FAITHPATH_TEST_ROOT=qa-output/uiux-phase2/build-a FAITHPATH_CHROMIUM=/usr/bin/chromium node tests/service-worker.mjs
```

Jedes Skript muss mit Exitcode 0 enden; JSON-Ausgaben liegen unter `qa-output/`. Ausschließlich synthetische Fixtures; niemals echte lokale Browserdaten verwenden. Die historischen Skripte `final-product-browser.mjs` erwarten teilweise den längst abgelösten Nachlese-Aufdeckmodus und sind kein passender MC-Abnahmetest. Der tatsächliche aktuelle MC-Bestand wird durch Korpus-/Fixture-/Phase2-Suites geprüft.

## Exaktes UIUX1-Update

Den ursprünglich ausgelieferten UIUX1-Build (auch im separat früher gelieferten UIUX1-ZIP vorhanden) nach `qa-output/uiux-phase2/previous-build` entpacken. Alternativ die Basis `3afa15ffc13a9a106e2449c3b6fe616eebf8f069` separat aus einem Git-Archiv bauen, mit `FAITHPATH_BUILD_BRANCH=feature/uiux-phase1-today-20261016`. Die Spezifikationsdatei ist der einzige Unterschied gegenüber dem früheren UIUX1-Anwendungscode und wird nicht veröffentlicht.

Erwarteter alter Build-Hash: `7f7ec73b955f7a8ca603ec78937a898633784d9cd229b9192ea4845bd88d3b0b`. Das Update-Skript lehnt eine abweichende Basis ab.

```bash
FAITHPATH_PREVIOUS_ROOT=qa-output/uiux-phase2/previous-build FAITHPATH_CANDIDATE_ROOT=qa-output/uiux-phase2/build-a node tests/phase2-update.mjs
```

Es startet einen eigenen lokalen Server auf Port 4384 und ersetzt auf derselben isolierten Origin die Dateien; der Worker wird zuletzt atomisch ausgetauscht. Wartendes Update, bewusste Aktivierung und vollständige Datenidentität werden geprüft, dann Offline-Neustart und Funktionen. Persönlicher Inhalt ausschließlich synthetisch. Kein Netlify-Zugriff.

## Screenshots

Den alten UIUX1-Build zusätzlich auf Port 4380 starten. Derselbe Fixturegenerator verwendet feste synthetische Daten/Zeit, unveränderte aktive Fragen und 0/1/5/300/1189 Erkundungen.

```bash
node tests/phase2-capture.mjs before http://127.0.0.1:4380
node tests/phase2-capture.mjs after http://127.0.0.1:4383
node tests/phase2-reflection-capture.mjs
node tests/phase2-short-capture.mjs
```

Die normale Serie umfasst 72 Viewport-Aufnahmen und 30 Vollseitenaufnahmen je Phase. `Vergleich.html` im Prüf-ZIP ist selbständig und braucht keine externen Bildquellen. Die Kontaktbögen sind ausschließlich Raster echter Screenshots. Der Kurzkapitel-Vergleich zeigt einen erwarteten Fehler in UIUX1 und dessen Korrektur; `short-red.log` ist ausdrücklich ein Vorher-Nachweis, kein offener Fehler des Kandidaten.

## Physische Freigabe

Die ausführliche Geräteanleitung liegt unter `docs/UIUX_PHASE2_IPHONE_GATE_2026-10-16.md`. iPhone Safari, installierte iPhone-PWA, VoiceOver, echtes Tastaturverhalten und reales Geräteupdate bleiben OFFEN, einschließlich UIUX1. Keine automatische Veröffentlichung und keine Produktionsfreigabe aus Chromium-Ergebnissen ableiten.
