# Reproduzieren und zurücksetzen

Anwendungscode eingefroren auf `f89eccf923ae186ad132b779a99b829e0cf9e155`, ausschließlich Phase-6B-Branch. Spätere QA-/Dokumentationscommits ändern den ausgelieferten Anwendungscode nicht. Der äußere Lieferbeleg nennt beide Commits getrennt. Der Build enthält 366 Dateien und `index.html` direkt in der Wurzel.

Voraussetzungen: Node 20 oder neuer, Python3/openpyxl für die bereits vorhandenen Excelvalidatoren. Für Browserprüfungen `npm ci` aus dem unveränderten Lockfile und Chromium; keine zusätzliche Runtime-Abhängigkeit.

```sh
npm ci
npm test
npm run validate:nt-quiz
npm run validate:nachlese-editorial
FAITHPATH_OUT=qa-output/uiux6b/rebuild-a \
FAITHPATH_BUILD_BRANCH=feature/uiux-phase6b-verbunden-20261017 \
FAITHPATH_BUILD_COMMIT=f89eccf923ae186ad132b779a99b829e0cf9e155 npm run build
FAITHPATH_OUT=qa-output/uiux6b/rebuild-b \
FAITHPATH_BUILD_BRANCH=feature/uiux-phase6b-verbunden-20261017 \
FAITHPATH_BUILD_COMMIT=f89eccf923ae186ad132b779a99b829e0cf9e155 npm run build
node scripts/verify-preview-build.mjs qa-output/uiux6b/rebuild-a qa-output/uiux6b/rebuild-b
```

Für den exakten Nachweis zuerst den genannten Anwendungscode als `git archive` in ein leeres Verzeichnis extrahieren. Dort sind Branch und Commit explizit zu setzen, weil `.git` fehlt. Der Build braucht selbst kein `node_modules`; die Browserprüfungen brauchen die vorhandenen Entwicklungsabhängigkeiten. Nicht versehentlich das historische, getrackte `dist/` als aktuellen Kandidaten verwenden. `FAITHPATH_OUT` schützt es.

Erwartete SHA-256-Werte:

- `build_hash` des Dateihashverzeichnisses: `911c3f4a66eccc6d07f1e2f34f35256fd09f228b606af77f522ac5973e7a5852`.
- Unveränderter Inhaltsbestand: `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309`.
- ZIP-Hash: separat in `SHA256SUMS.txt`; kein Ersatz für den Buildmanifest-Hash. `build_hash` ist SHA-256 von `JSON.stringify(manifest.files)`. Dieses Verzeichnis enthält die Einzelhashes der Nutzdateien außer dem Manifest selbst. Der ZIP-Hash prüft das gesamte Archiv.

Für die kombinierte Regression zwei isolierte lokale HTTP-Origins derselben Ausgabe auf4506/4507 bereitstellen, z.B. `PORT=4506 node scripts/serve.mjs qa-output/uiux6b/release-final`. Die alte verifizierte UIUX45-Baseline auf4450 erhalten. `QA_URL=http://127.0.0.1:4506 FAITHPATH_TEST_ROOT=qa-output/uiux6b/release-final QA_DEST=qa-output/uiux6b/final-regression QA_CONCURRENCY=3 python3 tests/uiux6b/run-regression.py` startet die bisherigen41 Testprogramme. `QA_CASES` erlaubt gezielte Wiederholung; die Ausgänge binden Laufzeit, Quelle und Buildhash. `tests/uiux6b/visual-matrix.mjs`, `contrast.mjs`, `reader-smoke.mjs`, `backup-lifecycle.mjs` und `focus.mjs` sowie `fullscreen.mjs` ergänzen die neue Darstellung. Bei den letzten drei `QA_URL=http://127.0.0.1:4506` und eigene `QA_OUT` setzen. `preservation.py` liest nur Repositorydateien.

Axe-Auditkontexte erlauben die vom Werkzeug selbst injizierten Diagnosestyles. Die unveränderte Produktions-CSP wird separat mit der uninstrumentierten Routenmatrix geprüft. Das ist kein Aufweichen der ausgelieferten Header. Testpflege betrifft neue Überschriften, die Baumklasse, kontinuierlichen Verssatz und die neue SVG-Darstellung; Inhalts-, Daten-, Fortschritts- und Transaktionsassertionen bleiben erhalten.

`update-https.mjs` installiert nacheinander die exakte UIUX45-Baseline und den Kandidaten ausschließlich auf derselben lokalen HTTPS-Origin4459. `serve-https.mjs` braucht ein selbst signiertes Zertifikat in `/workspace/scratch/uiux6b/qa-{key,cert}.pem`. Das Test-Chromium akzeptiert dieses Zertifikat ausdrücklich. Der alte Build muss unter `/workspace/scratch/uiux6b/baseline` liegen oder `FAITHPATH_PREVIOUS_ROOT` gesetzt werden. Es erfolgt kein Netlify-Aufruf. Für andere Arbeitsplätze die lokalen Pfade passend setzen; diese Testinfrastruktur ist keine Bereitstellungsanleitung für Produktion.

Nach einer späteren Auslieferung dürfen Inhalte nicht unter derselben Build-ID ausgetauscht werden. Weitere Änderungen brauchen eine neue eindeutige ID und erneute Integritäts-/Updateprüfung. Die hier wiederholten internen Prüfungen wurden nicht veröffentlicht.

## Rollback

Es wurde weder veröffentlicht noch in einen Produktionsbranch zusammengeführt. Der aktuelle Produktionsstand bleibt deshalb bereits unverändert verfügbar. Der alte verifizierte UIUX45-Quellstand `0ec849255fe3f06d80da77ab89d5b66f92f47560` und sein ursprünglicher Buildhash `bd6866522aec7b35854bc7c7871d8ce9afb2f1eb4013fd74496423f63753b882` sind die funktionale Referenz.

Nach einer später gesondert freigegebenen Testveröffentlichung bei Problemen die isolierte QA-Origin auf ihr vorheriges geprüftes vollständiges ZIP zurücksetzen. Vorher synthetische Einträge/Entwürfe exportieren. Service Worker wartet auch beim Rollback auf Aktualisierung; Cache und lokalen Speicher nicht blind löschen. Keine Rückmigration ist erforderlich, da6B kein Schema und keine IDs verändert. Die vorherige Releasecache bleibt wie bisher für offene Tabs erhalten. Neue persönliche Eingaben nicht durch einen alten Backupimport ersetzen. Ein echter Datenfehler stoppt die weitere Freigabe und erfordert Diagnose des Originalformats.

Die ausgeführte Umgebung ist in `evidence/QA_ENVIRONMENT.json` mit Node-, Python-, Chromium-, Playwright- und Axe-Version dokumentiert. Reale Geräteergebnisse werden separat in `GERAETE_GATE.csv` erfasst und beginnen ausnahmslos mit OFFEN.

## Update-Prüfung vorbereiten

Der exakte alte Build wird aus `0ec849255fe3f06d80da77ab89d5b66f92f47560` in einem separaten leeren Archivverzeichnis gebaut. Dabei `FAITHPATH_BUILD_BRANCH=integration/uiux4-uiux5-20261017` und `FAITHPATH_OUT=/workspace/scratch/uiux6b/baseline` setzen. Der alte Builder benötigt keine Gitdaten, wenn die Branchvariable explizit gesetzt ist. Vor dem Updatetest den erwarteten alten Buildhash `bd6866522aec7b35854bc7c7871d8ce9afb2f1eb4013fd74496423f63753b882` prüfen. Das bestehende Repository-`dist/` nicht überschreiben.

Die Linux-Referenzumgebung benötigt ein selbst signiertes, ausschließlich lokales Testzertifikat:

```sh
mkdir -p /workspace/scratch/uiux6b
openssl req -x509 -newkey rsa:2048 -nodes -days 2 \
  -keyout /workspace/scratch/uiux6b/qa-key.pem \
  -out /workspace/scratch/uiux6b/qa-cert.pem \
  -subj /CN=localhost \
  -addext subjectAltName=IP:127.0.0.1,DNS:localhost
FAITHPATH_PREVIOUS_ROOT=/workspace/scratch/uiux6b/baseline \
FAITHPATH_CANDIDATE_ROOT=qa-output/uiux6b/release-final \
node tests/uiux6b/update-https.mjs
```

Diese Zertifikate gehören nicht ins Deploy-ZIP oder Repository. Der Test akzeptiert sie nur in seinem synthetischen Chromiumprofil. Der Server bindet an Loopback4459; es ist keine Veröffentlichung. Auf anderen Entwicklungsrechnern Testpfade und Chromiumort anpassen. Dies ist kein Nachweis einer installierten iPhone-PWA.
