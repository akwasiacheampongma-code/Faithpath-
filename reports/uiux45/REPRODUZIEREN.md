# Gemeinsamen Preview reproduzieren

Ausschließlich Branch integration/uiux4-uiux5-20261017. Anwendungscode 9706f1e, exakter Auslieferungs-/QA-Commit im Lieferbeleg. Node>=20, Python3 mit bereits benötigtem openpyxl für die Excelprüfungen; npm ci aus dem vorhandenen Lockfile. Keine neue Runtime-Abhängigkeit.

```sh
npm ci
npm test
npm run validate:nt-quiz
npm run validate:nachlese-editorial
node scripts/validate-nachlese-editorial.mjs
FAITHPATH_OUT=qa-output/uiux45/final-a npm run build
FAITHPATH_OUT=qa-output/uiux45/final-b npm run build
node scripts/verify-preview-build.mjs qa-output/uiux45/final-a qa-output/uiux45/final-b
```

Frisches Git-Archiv des Anwendungscode-Commits in ein leeres Verzeichnis entpacken, dort dieselbe Build-Anweisung mit `FAITHPATH_BUILD_BRANCH=integration/uiux4-uiux5-20261017` ausführen. Dieser Metadatenoverride ist nötig, weil ein Archiv kein .git-Verzeichnis hat. Vollständige Ausgabe gegen final-a vergleichen. Erwartet: 348 Dateien einschließlich release-integrity.json; Build-ID FP4-20261017-G-STABLE1-UIUX45-CANDIDATE, Build-Hash bd6866522aec7b35854bc7c7871d8ce9afb2f1eb4013fd74496423f63753b882, Content-Hash 8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309.

Für Regression zwei lokale Origins mit derselben final-a-Ausgabe auf4453/4454 bereitstellen (PORT=4453 bzw4454 node scripts/serve.mjs qa-output/uiux45/final-a). Chromium unter /usr/bin/chromium oder Testskripte passend zur eigenen Umgebung konfigurieren. `python3 scripts/qa-uiux45.py` startet die vollständige gemeinsame Testsammlung; QA_CASES erlaubt ausgewählte Wiederholungen, QA_CONCURRENCY begrenzt Parallelität. `logs/*-exit.json` bindet jeden tatsächlichen Lauf an Zeit und Rückgabewert. Keine echten persönlichen Daten einsetzen.

Update: exakte Baseline b06f90e vorher auf diesem Integrationsbranch mit ursprünglicher UIUX4-ID bauen und unter qa-output/uiux45/baseline erhalten. Für frisches Archiv ebenfalls Branchmetadatenoverride setzen. tests/uiux45-update.mjs pinnt deren tatsächlichen Hash; `node tests/uiux45-update.mjs` veröffentlicht nacheinander nur auf lokaler4456-Origin und prüft V3→V5, bestehende Daten/Entwurf, bewusste Aktivierung und Offlinefunktionen. Eine andere Origin wäre kein Update. Der Test führt keinen Netlify-Deploy aus.

Echte Aufnahmen: `node tests/phase4-capture.mjs before http://127.0.0.1:4450` und after mit4453, entsprechend phase5-capture.mjs. Baseline auf4450 muss vor Implementierungsänderungen erhalten bleiben. 104 Navigations- und144 persönliche Szenen je Stand, vier Größen und Hell/Nacht; zusätzliche Testskripte prüfen alle vier Themes. Original-PNGs unverändert mit Messwerten im separaten Screenshot-ZIP.

Das Deploy-ZIP enthält index.html in der Wurzel und vollständig beide Offlinebibeln, Header/Redirects, PWA/Icons/Serviceworker und versionierte Releases. SHA256SUMS im QA-/Screenshot-ZIP prüft jeweilige Nutzdateien. Der separate äußere ZIP-SHA ist kein Build-Hash. Kein hier dokumentierter Befehl erteilt eine Produktionsfreigabe.
