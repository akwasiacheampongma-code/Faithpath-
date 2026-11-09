# Lokaler TEST_ONLY-Prüfstand

Node >=20; Python 3 für den optionalen Paketserver. Vorhandene Dev-Abhängigkeiten Playwright/axe verwenden; keine neuen Runtime-Abhängigkeiten. Chromium ist in dieser Umgebung unter `/usr/bin/chromium` installiert.

```sh
npm ci
npm run validate
npm test
npm run validate:at-rounds:test
npm run build:at-rounds:test
FAITHPATH_OUT=qa-output/at-rounds-off npm run build
FAITHPATH_OUT=qa-output/at-rounds-test2 FAITHPATH_AT_TEST_BUILD_ID=FP4-20261109-G-AT-ROUNDS-TEST2 npm run build:at-rounds:test
node tests/at-rounds-build.mjs qa-output/at-rounds-test test
node tests/at-rounds-build.mjs qa-output/at-rounds-off off
FAITHPATH_CHROMIUM=/usr/bin/chromium npm run test:at-rounds:browser
npm run validate:at-rounds:reachability
FAITHPATH_CHROMIUM=/usr/bin/chromium npm run test:at-rounds:acceptance
FAITHPATH_CHROMIUM=/usr/bin/chromium npm run test:at-rounds:update
PORT=4174 node scripts/serve.mjs qa-output/at-rounds-test
```

Voraussetzungen: Browser ausführbar, Loopback-Netzwerk und Kindprozesse erlaubt. Im verwalteten Sandbox-Testlauf wurde `spawnSync git EPERM` beobachtet. Derselbe Build war mit erlaubten lokalen Kindprozessen erfolgreich; kein Fehler wurde durch Entfernen der Git-Metadaten kaschiert.

Einstiege:

- `http://127.0.0.1:4174/#read/1KI/8/l1912`
- `http://127.0.0.1:4174/#chapter-quizzes/2KI/15?round=A`

`npm run build` verwendet standardmäßig das bestehende `dist`; bei QA deshalb immer ein separates `FAITHPATH_OUT` setzen. Der Wrapper `build:at-rounds:test` verwendet standardmäßig `qa-output/at-rounds-test`. Niemals als produktiven Release interpretieren.

Fixture-Ergebnisse leben nur im aktuellen Tab, nicht in Produktivbackups. Gezielter Reset erfolgt in der Oberfläche mit Bestätigung. Keine persönlichen LocalStorage-Daten löschen, um einen Test neu zu starten; stattdessen eine frische isolierte Browser-Session verwenden.

Reproduzierbarkeit: zweimal mit identischem Commit, generiertem Referenzindex und Umgebungsparametern in verschiedene QA-Verzeichnisse bauen. Alle Pfad-/SHA-Paare und `release-integrity.json` vergleichen; ein anderer TEST-Buildname erzeugt beabsichtigt andere Dateihashes.

Der ursprüngliche Gesamt-Preflight benötigt das fehlende vollständige AT-Importbundle. Die neuen Tests ersetzen weder diesen Prüfer noch die Redaktionsfreigabe.
