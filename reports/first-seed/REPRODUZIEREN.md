# Den geprüften Kandidaten reproduzieren

Alle Befehle im Repository ausführen. Keine produktive Origin verwenden. Die
Tests erstellen ausschließlich synthetische Browserprofile und lokale Dateien.
Es gibt keinen Deploy- oder Merge-Schritt.

## Festgehaltene Quelle

- Branch: `feature/ux-first-seed-living-tree-20261019`
- Appcommit: `22ac39e993983d2ce154dfb02d584b2da7b2d192`
- Build: `FP4-20261019-G-STABLE1-FIRSTSEED1`
- Build-Hash: `aabb3d500f9530620389d4ed78c590480dcc24d22bb8a1c118a1012e3bdf0bb5`
- Content-Hash: `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309`
- Node 24.19.0, Python 3.12, Playwright 1.62.1; System-Chromium 151.0.7922.173.

Die Branchspitze enthält später zusätzlich Dokumentation und Belege. Um exakt
das geprüfte ZIP zu bauen, müssen Commit- und Branchmetadaten feststehen. Ein
Build am späteren Dokumentations-HEAD ohne diese Metadaten hat absichtlich einen
anderen Gesamt-Hash. Das Content-Hashformat und die Dateiliste stehen im
`release-integrity.json` des App-ZIPs.

```bash
npm ci
python3 -m pip install -r requirements-nt-import.txt
npm run validate:nt-quiz
npm run validate:nachlese-editorial
npm test
npm run lint -- --max-warnings 5
npm run check:contracts
npm run check:modules
FAITHPATH_BUILD_COMMIT=22ac39e993983d2ce154dfb02d584b2da7b2d192 FAITHPATH_BUILD_BRANCH=feature/ux-first-seed-living-tree-20261019 FAITHPATH_OUT=qa-output/rebuild-a npm run build
FAITHPATH_BUILD_COMMIT=22ac39e993983d2ce154dfb02d584b2da7b2d192 FAITHPATH_BUILD_BRANCH=feature/ux-first-seed-living-tree-20261019 FAITHPATH_OUT=qa-output/rebuild-b npm run build
diff -rq qa-output/rebuild-a qa-output/rebuild-b
```

Die beiden letzten Buildbefehle sind am geprüften Appquellstand auszuführen
beziehungsweise nach Nachweis, dass spätere Commits keine Runtime-Dateien
geändert haben. Der Manifestbeleg prüft jede ausgelieferte Datei, nicht nur
Build-ID und Dateianzahl. Das Paket-Skript prüft dieselben Bytes noch einmal
nach der ZIP-Erstellung.

## Browserprüfungen

Playwright-Engines und ihre Systemabhängigkeiten installieren. Bei Verwendung
des Playwright-Chromiums `FAITHPATH_CHROMIUM` auf dessen ausführbare Datei
setzen; lokal wurde `/usr/bin/chromium` verwendet. Video benötigt Playwrights
ffmpeg. Das ist ein Entwicklungswerkzeug, keine App-Abhängigkeit.

```bash
npx playwright install --with-deps chromium firefox webkit
QA_SELF_HOST=qa-output/rebuild-a QA_OUT=qa-output/check/flow node tests/first-seed/flow.mjs
QA_ENGINE=firefox QA_SELF_HOST=qa-output/rebuild-a QA_OUT=qa-output/check/firefox node tests/first-seed/flow.mjs
QA_ENGINE=webkit QA_SELF_HOST=qa-output/rebuild-a QA_OUT=qa-output/check/webkit node tests/first-seed/flow.mjs
```

`QA_SELF_HOST` ist wesentlich: Der Test schließt den tatsächlichen TCP-Listener
und prüft Cache/Worker ohne erreichbaren Server. Linux-WebKit scheiterte bei
Playwrights `setOffline` auf Basis **und** Kandidat; dies wird nicht als
bestandener Emulationstest dargestellt. Der echte Serverausfall funktionierte.

Für die weiteren Programme in zwei getrennten Terminals Server starten:

```bash
PORT=4600 node scripts/serve.mjs qa-output/rebuild-a
PORT=4601 node scripts/serve.mjs qa-output/rebuild-a
```

Dann:

```bash
QA_URL=http://127.0.0.1:4600 QA_OUT=qa-output/check/faults node tests/first-seed/faults.mjs
QA_URL=http://127.0.0.1:4600 QA_OUT=qa-output/check/motion node tests/first-seed/motion-browser.mjs
QA_URL=http://127.0.0.1:4600 QA_OUT=qa-output/check/platform node tests/phase7/platform-browser.mjs
QA_URL=http://127.0.0.1:4600 QA_OUT=qa-output/check/contrast node tests/first-seed/contrast.mjs
QA_URL=http://127.0.0.1:4600 QA_OUT=qa-output/check/intro node tests/first-seed/onboarding-matrix.mjs
QA_URL=http://127.0.0.1:4600 QA_OUT=qa-output/check/visual node tests/first-seed/visual.mjs
FAITHPATH_TEST_ROOT=qa-output/rebuild-a QA_URL=http://127.0.0.1:4600 QA_RESTORE_URL=http://127.0.0.1:4601 QA_DEST=qa-output/check/regression QA_CONCURRENCY=5 python3 tests/uiux6b/run-regression.py
```

Die 41 Bestandsprogramme sowie die beiden großen Bildmatrizen können je nach
Rechner erheblich länger dauern als Unit-Tests. Nicht während laufender Tests
das ausgelieferte Verzeichnis verändern. Für einen Fehlerlauf das ursprüngliche
Protokoll erhalten; nur bei geklärter Ursache die betroffene Prüfung wiederholen.

`update.mjs` und `capture-art.mjs` setzen den unveränderten MAINT1-Build unter
`qa-output/phase7/gate/build-a` voraus. Letzteres und `performance.mjs` benötigen
außerdem den Basisserver auf Port 4580. Der dokumentierte Basis-Build-Hash ist
`600683f69c4ecb0350a3d3e8bae2e51a1136169c5d6847f5b3422970f2211441`.
Den Kontrollbuild nicht mit wechselnden Branchmetadaten neu erzeugen und als
identisch ausgeben. Der CI-Kontrollversuch beschreibt seine abweichenden,
explizit angegebenen Metadaten in den vollständigen Logs.

## Nachweise lesen

`Nachweise/` im QA-ZIP enthält vollständige Units, Validatoren, Lint,
Modulgraph, Datenverträge, CI-Logs, Performancewerte, Einzel-Ergebnisse und die
41 Exitcodes. `Bericht/screenshots/` enthält die neue Bildmatrix und die
zugeordneten Vorher-Nachher-Bilder. Historische Regressionsbilder werden nicht
doppelt in das Archiv aufgenommen. `Vergleich.html` und das WebM funktionieren
lokal ohne externe Schriften, Tracker oder Cloud-Dienste.

Menschenverständnis, physische Geräte, Safari-Zoom, VoiceOver und Akkumessung
sind separate offene Gates. Die leeren Teilnehmerbögen sind keine Testergebnisse.
