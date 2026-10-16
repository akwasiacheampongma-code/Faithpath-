# UIUX3 reproduzieren

Node≥20, Python 3 und Chromium nötig; vorhandene gesperrte Dev-Abhängigkeiten mit `npm ci` installieren. Keine zusätzliche Laufzeitabhängigkeit. Testbefehle benötigen lokale Netzwerk-/Browserberechtigung der Ausführungsumgebung.

## Build / Inhalt

`npm test` führt Inhaltsvalidator und alle Unit-Tests aus. Danach `npm run validate:nt-quiz` und `npm run validate:nachlese-editorial`. Die redaktionellen Validatoren berichten auch historische Änderungen gegenüber ihren älteren redaktionellen Basen; das sind **keine** neuen Inhaltsänderungen von UIUX3. `preservation.json` vergleicht direkt mit UIUX2 und belegt unveränderte Dateien.

Zwei getrennte Ausgaben:

```
FAITHPATH_OUT=qa-output/uiux-phase3/build-a npm run build
FAITHPATH_OUT=qa-output/uiux-phase3/build-b npm run build
node reports/nachlese-editorial-56/evidence/verify-build.mjs qa-output/uiux-phase3/build-a qa-output/uiux-phase3/build-b
```

Dritte Ausgabe aus einem frischen `git archive` des im Bericht bezeichneten Implementierungscommits, ohne Arbeitskopie/`node_modules`: im Archivverzeichnis `FAITHPATH_BUILD_BRANCH=feature/uiux-phase3-personal-journey-tree-20261016 FAITHPATH_OUT=/absoluter/ausgabepfad node scripts/build.mjs`. Mit demselben Validator gegen BuildA vergleichen. Das explizite Branch-Metadatum ist notwendig, da ein Git-Archiv kein `.git` enthält. Build-Hash stammt aus der sortierten Dateihashmap; die äußere ZIP-SHA ist davon verschieden.

## Browser

Fertigen Build lokal auf Port 4395 bereitstellen: `node scripts/serve.mjs qa-output/uiux-phase3/build-a` mit `PORT=4395`. `tests/phase3-{overview,detail,tree,review}-browser.mjs`, `phase3-journey-browser.mjs`, `phase3-stress.mjs` und `phase3-short-navigation.mjs` mit `QA_URL=http://127.0.0.1:4395` ausführen. `QA_OUT` trennt Ausgaben der vier Abschnittstests beziehungsweise des Kurzkapiteltests. Für die Kontinuitätssuite zusätzlich `FAITHPATH_CONTINUITY_BASELINE_URL=http://127.0.0.1:4390` setzen. Ihre zwei alten Today-Layoutannahmen scheiterten bereits an UIUX2; der finale Test vergleicht direkt mit dessen tatsächlicher Geometrie/Reihenfolge. Der Historientest prüft Dubletten innerhalb der Zeitlinie und übt Legacy-Spiegel ohne reflectionId aus; der zusätzliche Original-Link im Rückblick-Kontext ist beabsichtigt. Die vollständigen bestehenden Suiten und ihre Umgebungsvariablen stehen im beigelegten `reproduce/run-regressions.py`; Ergebnisdateien/Summen unter `evidence/qa-summary.json`.

Alte Stabilisierungssuite: Die Übersicht heißt nun „Einen Weg beginnen“. Der Test verwendet die unveränderte `new-path`-Aktion, alle bisherigen Entwurfs-/Konfliktassertionen bleiben. Neue Browserprüfungen verwenden die tatsächliche Hauptmenü-Navigation und `storyId`, das bestehende Speicherschema. Entwicklungsprotokolle mit RED/fehlgeschlagenen Testselektoren sind getrennt von finalen grünen Ergebnisdateien zu lesen.

## Vorher / Nachher

UIUX2-Originalquelle `f500bce97e0eb4cb72908b29ca060b86e631d507` aus Git archivieren und mit `FAITHPATH_BUILD_BRANCH=feature/uiux-phase2-reader-stories-20261016` bauen. Erwarteter Build-Hash `14d83ffa52866b333b011dbce413e4432f3b8ba75a4d33e6c2ee5ae1b427a4f6`. Dieser exakte Ausgangsbuild wurde hier reproduziert. Lokaler Port 4390 für den Ausgangsbuild,4395 für Kandidat.

`node tests/phase3-capture.mjs before http://127.0.0.1:4390` und entsprechend `after ...4395`. Die Fixture setzt synthetische Daten und feste Zeit; pro Phase 120 Viewportaufnahmen plus 36 Langseiten. Zusätzlich `node tests/phase3-archive-capture.mjs` für sechs tatsächliche Archivansichten pro Phase ausführen (Viewport und Langseite). Insgesamt 336 PNG, Vergleichsdatei enthält 126 Paare ohne externe Ressourcen. Für Kontaktbögen `reproduce/comparison.py` und `render-contact.mjs` verwenden, Pfade bei anderer Arbeitsumgebung anpassen.

## Echtes lokales PWA-Update

`tests/phase3-update.mjs` erwartet den exakt gehashten UIUX2-Build unter `qa-output/uiux-phase3/baseline` und UIUX3 unter `.../build-a`; alternativ `FAITHPATH_PREVIOUS_ROOT` und `FAITHPATH_CANDIDATE_ROOT` setzen. Test erzeugt selbst eine isolierte Origin auf 4396, installiert UIUX2-Service-Worker, kopiert UIUX3 (Worker zuletzt atomar), lädt das Dokument neu und aktiviert erst über das echte Updateangebot. Persönliche V5-Daten inklusive bereits ausgeführter V3-Migration,260 Quizschlüssel,Storyfortschritt,alteEreignisse,Markierungen und Entwurf werden verglichen. Danach Offline-Kaltreload, beide Bibeln, neue Ansichten/CSS, Kapitelquiz und Nachlese prüfen. Es ist ein echter Chromium-Service-Worker-Wechsel auf gleicher Origin, keine Versionssimulation und kein physischer iPhone-Test.

Die physische Gate-Anleitung steht unter `docs/UIUX_PHASE3_IPHONE_GATE_2026-10-16.md`. Es wurde keine Test-/Produktionsseite veröffentlicht.

## Lieferdateien

Der App-Build ist ein eigenes ZIP. Das kompakte Prüf-ZIP enthält sämtliche finalen Ergebnisdateien, Rohlogs, Bericht, Quellenpatch und die Vergleichsdatei mit126eingebetteten Vorher-/Nachher-Paaren. Alle336Original-PNGs inklusive Langseiten liegen im separaten `FaithPath_UIUX3_Originalscreenshots_2026-10-16.zip`, mit internem SHA256-Manifest. Äußere Prüfsummen aller Lieferdateien stehen in `FaithPath_UIUX3_Pruefsummen.txt`; der Lieferbeleg bindet beide Archive an denselben geprüften Build.
