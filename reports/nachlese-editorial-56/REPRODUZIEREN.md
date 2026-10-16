# Reproduktion

Node 24.19.0, npm 11.9.0, Python 3.12.14 mit `openpyxl` aus `requirements-nt-import.txt`, Chromium 151.0.7922.173. Keine zusätzlichen Laufzeitabhängigkeiten. Alle Befehle im Repository auf dem im Abschlussbericht genannten Implementierungscommit ausführen.

```bash
npm ci --ignore-scripts
python3 -m pip install -r requirements-nt-import.txt
npm run validate:nachlese-editorial
npm run validate:nt-quiz
node scripts/validate-faithpath-materialization.mjs
npm test
FAITHPATH_BUILD_BRANCH=integration/nachlese-editorial-56-20261016 FAITHPATH_OUT=qa-output/nachlese-editorial/build-a npm run build
FAITHPATH_BUILD_BRANCH=integration/nachlese-editorial-56-20261016 FAITHPATH_OUT=qa-output/nachlese-editorial/build-b npm run build
diff -qr qa-output/nachlese-editorial/build-a qa-output/nachlese-editorial/build-b
PORT=4343 node scripts/serve.mjs qa-output/nachlese-editorial/build-a
```

Der explizite Branchname erhält die identische `BUILD.txt` auch bei einem detached Checkout. Beide Verzeichnisse müssen bytegleich sein. Das ZIP enthält den eigenständigen Prüfer `evidence/verify-build.mjs`: `node evidence/verify-build.mjs BUILD_A BUILD_B` aus dem Repository prüft alle 321 veröffentlichten Dateien und die Quellinhaltshashes. `release-integrity.json` beschreibt die 320 anderen Dateien; die Metadatendatei selbst wird durch den ZIP-Prüfsummenindex erfasst. Build- und Content-Hash sind die SHA256-Werte der im Buildskript dokumentierten JSON-Dateimaps, keine Git-Commit-IDs.

In einem zweiten Terminal, während der Server läuft:

```bash
FAITHPATH_TEST_ROOT=qa-output/nachlese-editorial/build-a FAITHPATH_CHROMIUM=/usr/bin/chromium FAITHPATH_PORT=4346 node tests/browser.mjs
QA_URL=http://127.0.0.1:4343 QA_OUT=qa-output/nachlese-editorial/stabilization node tests/stabilization-browser.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4343 FAITHPATH_QA_OUT=qa-output/nachlese-editorial/chapter node tests/chapter-questions-browser.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4343 node tests/nt-quiz-browser.mjs
QA_URL=http://127.0.0.1:4343 node tests/nachlese-mc-corpus-browser.mjs
QA_URL=http://127.0.0.1:4343 QA_OUT=qa-output/nachlese-editorial/fixtures node tests/nachlese-mc-browser.mjs
QA_URL=http://127.0.0.1:4343 node tests/nachlese-editorial-browser.mjs
FAITHPATH_TEST_ROOT=qa-output/nachlese-editorial/build-a FAITHPATH_CHROMIUM=/usr/bin/chromium node tests/service-worker.mjs
FAITHPATH_PREVIOUS_ROOT=/absolute/path/to/verified-NMC1-build node tests/nachlese-editorial-update.mjs
```

Chromium und gegebenenfalls den Browserpfad bereitstellen. Die Suites verwenden getrennte Browserprofile mit synthetischen Daten. Der alte Service-Worker-Test benötigt das historische Git-Objekt `3c5b221ac958775588a62b49fbc9df5e82eed482`; gegebenenfalls den Repository-Verlauf vollständig abrufen. Er vergleicht einen alten Entwicklungsbuild, nicht das aktuelle Produktionsdeployment.

Für den tatsächlichen NMC1→NMC2-Test ist der vollständige unveränderte NMC1-Build erforderlich. Sein Build-Hash muss `9dc4a8931b7ef1400fd0f6a8a950658e6e121b90797a5a732afe43536dc3bfde` sein. Das ZIP enthält diesen Vorgänger unter `previous-build/`; keine Dateien zwischen Kandidat und Vorgänger mischen. Der Test prüft dessen Hash vor dem Start, installiert den echten Vorgängerworker, ersetzt den Serverinhalt auf derselben lokalen Origin (Port 4344), aktiviert den Kandidaten ausdrücklich und prüft anschließend Offline-Betrieb und Datenbestand. Es ist keine Netlify-Veröffentlichung nötig.

Die alten Zusammenführungs- und MC-Berichte bleiben historische Nachweise für ihren jeweiligen Bestand. Der Validator prüft sie gegen ihre unveränderten Quellsnapshots und prüft anschließend die ausdrücklich dokumentierten 239 Feldänderungen am neuen Gesamtbestand. Es wird kein alter Bericht auf die neue Fassung umgeschrieben und keine neue Geschichten-Zusammenführung durchgeführt.
