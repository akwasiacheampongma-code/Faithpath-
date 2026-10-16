# Neue Nachweise: finale NT-Fragen auf STABLE1

Diese Belege wurden am 16. Oktober 2026 neu erzeugt. Sie gehören zum
Implementierungscommit `a8389dfd2bd111c1472d657c8aac055662c03c07`.
Die historischen Belege des Quellimports unter `../nt-quiz-final/` sind davon
getrennt und werden nicht als neue STABLE1-Prüfung ausgegeben.

- `acceptance.json`: maschinenlesbare Gesamtentscheidung samt Grenzen.
- `source-comparison.json`: alle Excel-Zellen, Laufzeitfelder, Buch-/Kapitelorte
  und Freigabeflags; keine redaktionelle Neubewertung.
- `at-source-search.json`: verfügbare Arbeitsmappen, Transferarchive und fehlende AT-Quelle.
- `integration-verification.json`: 191 geschützte Dateien, unveränderte
  ID-/Einheitsprojektion, exakte Fortschrittsschlüssel und 321 bytegleiche Artefakte.
- `candidate-integrity.json`, `release-integrity.json`: Referenz-Prüfsummen.
- `evidence/`: neue lokale Testprotokolle. `import-red.log` ist der absichtlich
  fehlschlagende Ausgangstest vor Integration der Importhilfen, kein offener Fehler.
- `screenshots/`: neue Browseraufnahmen der finalen Fragen.

Alle Browserdaten sind synthetisch. Kernsuite: localhost4318; gezielte
Stabilisierungs-/Kapitel-/NT-Suiten: localhost4317; echter STABLE1-Update-Test:
localhost4320. Worker-Suite: localhost4175. POLISH1-Regression: localhost4288.
Das sind lokale Chromium-Tests, keine Netlify- oder iPhone-Nachweise.

## Wiederholung der Browserprüfungen

Zunächst den Build wie im Integrationsbericht nach `qa-output/quiz-final/build-a`
erzeugen, Playwright/Chromium bereitstellen und in einem eigenen Terminal starten:

```sh
PORT=4317 node scripts/serve.mjs qa-output/quiz-final/build-a
```

Dann im Repository:

```sh
QA_URL=http://127.0.0.1:4317 node tests/stabilization-browser.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4317 node tests/chapter-questions-browser.mjs
FAITHPATH_QA_URL=http://127.0.0.1:4317 node tests/nt-quiz-browser.mjs
FAITHPATH_TEST_ROOT=qa-output/quiz-final/build-a FAITHPATH_PORT=4318 \
FAITHPATH_CHROMIUM=/usr/bin/chromium node tests/browser.mjs
FAITHPATH_TEST_ROOT=qa-output/quiz-final/build-a \
FAITHPATH_CHROMIUM=/usr/bin/chromium node tests/service-worker.mjs
```

Browserpfad gegebenenfalls anpassen. Die bestehende Worker-Suite benötigt ihren
historischen Git-Ausgangscommit `3c5b221ac958775588a62b49fbc9df5e82eed482`.

## Exaktes STABLE1-Ausgangsartefakt und Update

Der Basiscommit muss lokal als Git-Objekt verfügbar sein; bei einem flachen
Checkout zuerst den stabilen Branch fetchen. Das Archiv enthält die tatsächlichen
STABLE1-Quellen und benötigt zum Bauen keine installierten Node-Abhängigkeiten.

```sh
quiz_task_root="$(pwd)"
mkdir -p qa-output/quiz-final/stable1-source
git archive 6ce37acf164f3e048b5446f115d918274c789f25 | \
  tar -x -C qa-output/quiz-final/stable1-source
(
  cd qa-output/quiz-final/stable1-source
  FAITHPATH_OUT="$quiz_task_root/qa-output/quiz-final/stable1-build" \
  FAITHPATH_BUILD_BRANCH=fix/production-stabilization-20261015 \
  node scripts/build.mjs
)
node tests/quiz-final-update.mjs
```

Der Test prüft den bekannten STABLE1-Build-Hash vor dem Update und startet beide
Versionen auf derselben lokalen Origin. Er prüft alle 260 bisherigen Kapitelkeys,
den Storyabschluss, Entwurf, Migration und alle finalen Fragen ohne Netzwerk.

Die zusätzliche POLISH1-Regression benötigt das separat reproduzierte
POLISH1-Artefakt aus dem Sicherungsbranch. Verzeichnisse explizit über
`FAITHPATH_PREVIOUS_ROOT` und `FAITHPATH_CANDIDATE_ROOT` an
`tests/stabilization-update.mjs` übergeben. Keine historischen Dateien erfinden.

Ein späterer Hosted-/Gerätetest muss die neue Build-ID und die Hashes dieses
Berichts verwenden. Kein hier enthaltenes Kommando veröffentlicht auf Netlify.
