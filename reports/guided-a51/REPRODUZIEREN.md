# QA-Version starten und Nachweise wiederholen

Runtime-Commit: `ea734d5431b1b6069d7302efdc6574fcfeb95191`. Spätere Übergabecommits ergänzen ausschließlich Tests, Berichte und Nachweise. Die Runtime bleibt identisch.

## Fertiges QA-Paket

ZIP entpacken. `python3 start-qa.py` startet die enthaltene vollständige App auf **http://127.0.0.1:4739/**. Der Server bindet ausschließlich Loopback. Es gibt kein Deployment und keine Verbindung zu bestehenden QA-Seiten. Ein aktueller Browser ist erforderlich. Nicht durch direkte Dateiöffnung starten; ES-Module und Service Worker benötigen den lokalen HTTP-Ursprung.

Für Nutzertests ein neues Browserprofil verwenden und synthetische Anliegen eingeben. Unter Mehr → Einstellungen die vollständige Offlinebereitschaft abwarten. Danach den lokalen Server beenden und die App neu laden; die vorbereiteten Inhalte und beide Bibelübersetzungen bleiben im Browsercache verfügbar. Bei einem neuen Paket dieselbe lokale Adresse verwenden, vollständigen Download abwarten und die neue Version bewusst aktivieren. Keine persönlichen Daten als Testvorlage weitergeben.

## Aus dem Repository bauen

```sh
npm ci
npm test
npm run lint
npm run check:contracts
npm run check:modules
npm run validate:nt-quiz
npm run build
node scripts/check-build.mjs dist
```

Das Projekt verwendet Node 24.19.0 im Testlauf, Python 3 sowie die Entwicklungsabhängigkeiten aus dem Lockfile. Die vorhandenen Python-Importvalidatoren benötigen `requirements-nt-import.txt`. Es wird kein Import durchgeführt; nur `--check`.

```sh
node tests/guided-a51-browser.mjs
node tests/guided-a51-a11y.mjs
QA_SELF_HOST=dist QA_OUT=qa-output/guided-first-seed node tests/first-seed/flow.mjs
```

Die neuen Browserprüfungen nutzen `/usr/bin/chromium` und eigene flüchtige Loopbackserver. Axe läuft in einem gesonderten Diagnosekontext. Die Hauptabläufe behalten die CSP. Der Skripttext und die tatsächlichen Ergebnisse stehen gemeinsam im Branch.

Für die bestehenden Fehler- und Quizprüfungen einen lokalen Server starten:

```sh
PORT=4174 node scripts/serve.mjs dist
```

In einer zweiten Shell:

```sh
QA_URL=http://127.0.0.1:4174 QA_OUT=qa-output/guided-faults node tests/first-seed/faults.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4174 node tests/nt-quiz-browser.mjs
```

## Alt-zu-Neu-Update

Die alte First-Seed-Basis in einem separaten Checkout von `ef8d96d7126fb79661467feaaa17044874471d4d` bauen. Unverändert lassen. Dann:

```sh
FAITHPATH_CHROMIUM=/usr/bin/chromium FAITHPATH_PREVIOUS_ROOT=/absoluter/pfad/alter-build FAITHPATH_CANDIDATE_ROOT=/absoluter/pfad/neuer-build node tests/guided-a51-update.mjs
FAITHPATH_CANDIDATE_ROOT=/absoluter/pfad/neuer-build node tests/guided-a51-lifecycle.mjs
FAITHPATH_CANDIDATE_ROOT=/absoluter/pfad/neuer-build node tests/guided-a51-capture.mjs
```

Die Pfade explizit setzen; die lokalen Standardpfade im Übergabelauf sind keine Voraussetzung auf einem anderen Rechner. Der Updatetest verwendet einen eigenen Ursprung und ausschließlich synthetische Zustände; er verändert keine vorhandene QA-Installation.

## Sichtprüfung

`QA_INDEX.html` verlinkt Bericht und die 20 zentralen Screenshots. `NUTZERTEST.md` enthält den noch ausstehenden Zehn-Personen-Test. Geräte- und Human-Gates sind nicht durch die grünen automatischen Ergebnisse erfüllt.
