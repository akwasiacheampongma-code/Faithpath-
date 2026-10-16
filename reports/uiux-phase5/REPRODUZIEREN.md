# UIUX5 reproduzieren

Anwendungscode e33c139ca46090cdeb74d82b91e20797f0273071. Der finale Dokumentations-/QA-HEAD steht im Lieferbeleg; dessen Build-Eingaben müssen bytegleich bleiben. Voraussetzung Git, Node >=20, npm; Browsertests verwenden gelocktes Playwright/axe und Chromium unter /usr/bin/chromium. Auf anderer Plattform Browserpfad entsprechend anpassen. Keine Produktions-Origin verwenden.

## Bytegleicher Build

```bash
git archive e33c139ca46090cdeb74d82b91e20797f0273071 -o /tmp/faithpath-uiux5-source.tar
mkdir -p /tmp/faithpath-uiux5-source
tar -xf /tmp/faithpath-uiux5-source.tar -C /tmp/faithpath-uiux5-source
cd /tmp/faithpath-uiux5-source
npm ci --cache /tmp/faithpath-uiux5-npm-cache
FAITHPATH_BUILD_BRANCH=feature/uiux-phase5-journal-reviews-backup-20261016 FAITHPATH_OUT=dist-a npm run build
FAITHPATH_BUILD_BRANCH=feature/uiux-phase5-journal-reviews-backup-20261016 FAITHPATH_OUT=dist-b npm run build
diff -rq dist-a dist-b
```

git-archive enthält kein .git, deshalb Branch-Metadaten explizit setzen. Erwartet 342 Dateien, ID FP4-20261016-G-STABLE1-UIUX5, Build-Hash cf155e3ef0fabb40928991822edab7649a61d99f3fe94a319c7290e83e323e84 und unveränderter Content-Hash 8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309. Alle 341 Nutzdateihashes in release-integrity.json prüfen; Manifest ist Datei 342. Äußerer ZIP-Hash ist ein separater Wert.

## Baseline und lokale Server

UIUX3 analog aus git-archive 192675a6a7f602b7abf70d1df5e27b988066c980 erzeugen, mit FAITHPATH_BUILD_BRANCH=feature/uiux-phase3-personal-journey-tree-20261016. Erwartet 334 Dateien/Hash 5e554bb230055879ccfa457d75d887e1e28eaca7928291875fe41ee801c7f7f1. Baseline nach qa-output/uiux-phase5/baseline, Kandidat nach qa-output/uiux-phase5/build-a kopieren.

Im finalen QA-Branch npm ci und npm test ausführen; regulärer vollständiger Unit-Lauf: 180 PASS. Die gezielten ursprünglichen RED-Läufe verwendeten node --test --test-isolation=none. Baseline auf 4410, Kandidat auf 4420 und denselben Kandidaten als zweite isolierte Restore-Origin auf 4421 per HTTP bereitstellen. Beispiel in getrenntem Terminal:

```bash
python3 -m http.server 4420 --bind 127.0.0.1 --directory qa-output/uiux-phase5/build-a
```

## Neue Prüfungen

```bash
QA_URL=http://127.0.0.1:4420 QA_OUT=qa-output/uiux-phase5/journal-final node tests/phase5-journal-browser.mjs
QA_URL=http://127.0.0.1:4420 QA_OUT=qa-output/uiux-phase5/reviews-final node tests/phase5-reviews-browser.mjs
QA_URL=http://127.0.0.1:4420 QA_OUT=qa-output/uiux-phase5/reminders-final node tests/phase5-reminders-browser.mjs
QA_URL=http://127.0.0.1:4420 QA_RESTORE_URL=http://127.0.0.1:4421 QA_OUT=qa-output/uiux-phase5/backup-final node tests/phase5-backup-browser.mjs
QA_URL=http://127.0.0.1:4420 QA_OUT=qa-output/uiux-phase5/backup-races-final node tests/phase5-backup-races-browser.mjs
QA_URL=http://127.0.0.1:4420 node tests/phase5-stress-browser.mjs
FAITHPATH_CANDIDATE_ROOT=qa-output/uiux-phase5/build-a node tests/phase5-update.mjs
node tests/phase5-capture.mjs before http://127.0.0.1:4410
node tests/phase5-capture.mjs after http://127.0.0.1:4420
node tests/phase5-export-fixtures.mjs
```

Der echte Worker-Update-Test verwendet eine eigene Origin auf Port 4416. Er installiert UIUX3 und ersetzt danach die Dateien durch UIUX5, wartet auf Updateangebot und bewusste Aktivierung. Keine zwei Preview-URLs als Update verwenden. Die Backup-Suite überträgt eine echte heruntergeladene Datei zusätzlich auf Origin B/4421, A bleibt unverändert.

Die 26 älteren vollständigen Browser-Regressionssuiten werden in reproduce/run-regressions.py mit Originalskript und nötigen Umgebungsvariablen bezeichnet. Dazu kommen sieben neue Suiten. Manche ältere Skripte schreiben unter qa-output/uiux-phase1/2/3 oder premium-final; das sind aktuelle ausgeführte Resultate im Phase-5-Worktree, keine übernommenen alten Reports. evidence/qa-summary.json enthält alle genauen Dateipfade/Fallzahlen/Hashes. summarize.py prüft Aktualität gegen den vollständigen letzten Unit-Lauf und verwirft Fehlerlisten oder nicht bestandene Fälle.

Die enthaltenen Reproduktionshilfen nennen die tatsächlichen lokalen Worktree-/Scratch-Pfade. Bei anderer Ablage Pfade anpassen. Keine privaten Daten werden benötigt. Reguläre Inhaltsprüfungen: npm run validate:nt-quiz und npm run validate:nachlese-editorial; historische Ausgaben erwähnen frühere Redaktion, nicht neue Inhaltsänderungen von UIUX5.

## Archive und echte Abnahme

Äußere SHA-256 gegen FaithPath_UIUX5_Pruefsummen.txt vergleichen. Prüf- und Screenshot-ZIP enthalten SHA256.json; CRC und eindeutige Namen sind zusätzlich geprüft. Build in leeren Ordner entpacken und per HTTP/isolierter HTTPS-Origin starten, nicht per file://. Es wurde nichts veröffentlicht.

19 synthetische V3/V5-Importfixtures unter fixtures/ sind vorab mit derselben Importvalidierung geprüft. Import ersetzt den lokalen Teststand. fixtures-validation.json ist der Prüfbeleg, keine importierbare Backupdatei. Echte iPhone-Anleitung unter docs/UIUX_PHASE5_IPHONE_GATE_2026-10-16.md. Für das Gerät eine separat freigegebene erreichbare HTTPS-Test-Origin verwenden; localhost des iPhones ist nicht der Entwicklungsrechner.

GO für isolierte Geräteabnahme, NO-GO für Produktion. UIUX4 ist hier nicht integriert; spätere Zusammenführung nach docs/UIUX5_MERGE_MANIFEST.md separat freigeben und beide Phasen auf dem tatsächlichen Integrationscommit vollständig neu prüfen. Physische UIUX1–5-Gates bleiben OFFEN.

Die komplette funktionale Regression wurde auf adb673e ausgeführt. Die finale Änderung betrifft ausschließlich zwei Backup-Dialog-CSS-Regeln; sämtliches JavaScript und alle anderen Build-Eingaben sind bytegleich. style-delta.json bindet dies und bezeichnet die auf dem finalen CSS-Build wiederholten betroffenen Suiten. Nicht jede unbetroffene UIUX1–3-Suite wurde wegen dieser beiden CSS-Regeln erneut durchlaufen.
