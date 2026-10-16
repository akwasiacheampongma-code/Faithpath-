# UIUX4 reproduzieren und prüfen

Codecommit: 3e3ebc8f44686bd903b4065329dcf284e4d1fb91. Der finale QA-HEAD im Lieferbeleg ergänzt ausschließlich Tests und Dokumentation. Keine Produktions-Origin verwenden; Import ersetzt Daten auf der Test-Origin.

## Build

Benötigt: Git, Node >=20, npm; für Browserprüfungen Chromium und die unveränderten gelockten Entwicklungsabhängigkeiten. Im Repository npm ci verwenden. Keine globale neue App-Abhängigkeit erforderlich.

```bash
git archive 3e3ebc8f44686bd903b4065329dcf284e4d1fb91 -o /tmp/faithpath-uiux4-source.tar
mkdir -p /tmp/faithpath-uiux4-source
tar -xf /tmp/faithpath-uiux4-source.tar -C /tmp/faithpath-uiux4-source
cd /tmp/faithpath-uiux4-source
npm ci
FAITHPATH_BUILD_BRANCH=feature/uiux-phase4-navigation-discover-onboarding-20261016 FAITHPATH_OUT=dist-a npm run build
FAITHPATH_BUILD_BRANCH=feature/uiux-phase4-navigation-discover-onboarding-20261016 FAITHPATH_OUT=dist-b npm run build
diff -rq dist-a dist-b
```

Der Branch-Metadatenoverride ist erforderlich, weil git-archive keine .git-Daten enthält. Erwartet: 340 Dateien, Build-ID FP4-20261016-G-STABLE1-UIUX4, Build-Hash e47f25df47195c35bea136093125f5dab9a19937dd557f8606827de56826dea0, Content-Hash 8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309. Alle release-integrity.json-Dateihashes prüfen; Hash des JSON-Mappings und äußeren ZIP-Hash nicht verwechseln.

## Baseline und Browser

Für UIUX3 analog git-archive 192675a6a7f602b7abf70d1df5e27b988066c980 verwenden, FAITHPATH_BUILD_BRANCH=feature/uiux-phase3-personal-journey-tree-20261016 setzen. Erwarteter Baseline-Build-Hash: 5e554bb230055879ccfa457d75d887e1e28eaca7928291875fe41ee801c7f7f1. Baseline nach qa-output/uiux-phase4/baseline, Kandidat nach qa-output/uiux-phase4/build-a kopieren.

Den finalen QA-Branch auschecken, npm ci und npm test ausführen. Bei notwendigen prozessisolationsbedingten Harness-Einschränkungen wurden einzelne RED-Läufe mit node --test --test-isolation=none ausgeführt; der finale vollständige npm-test-Lauf besteht regulär mit 174 Tests.

Baseline und Kandidat in getrennten Terminals auf localhost:4400 und :4404 per HTTP bereitstellen, zum Beispiel mit python3 -m http.server 4404 --bind 127.0.0.1 --directory qa-output/uiux-phase4/build-a. Ausschließlich synthetische Daten verwenden. Die Browserprogramme starten /usr/bin/chromium; auf anderen Plattformen den vorhandenen Executable-Pfad entsprechend anpassen.

```bash
QA_URL=http://127.0.0.1:4404 node tests/phase4-navigation-browser.mjs
QA_URL=http://127.0.0.1:4404 node tests/phase4-discover-browser.mjs
QA_URL=http://127.0.0.1:4404 node tests/phase4-onboarding-browser.mjs
QA_URL=http://127.0.0.1:4404 node tests/phase4-routes-browser.mjs
QA_URL=http://127.0.0.1:4404 node tests/phase4-menu-focus-browser.mjs
QA_URL=http://127.0.0.1:4404 node tests/phase4-stress-browser.mjs
node tests/phase4-discovery-boundary.mjs
node tests/phase4-update.mjs
node tests/phase4-capture.mjs before http://127.0.0.1:4400
node tests/phase4-capture.mjs after http://127.0.0.1:4404
```

Die Update-Suite startet eine eigene lokale Origin auf Port 4405. Sie installiert UIUX3, ersetzt Dateien, wartet auf das neue Service-Worker-Angebot und aktiviert bewusst. Beide Builds müssen zuvor vollständig vorliegen. Kein Netlify-Account und kein Deploy erforderlich.

Die vollständigen älteren Suiten sind in evidence/qa-summary.json mit Originalpfaden und Fallzahlen bezeichnet. reproduce/run-regressions.py dokumentiert die 21 parallelen Grundsuiten und deren Umgebungsvariablen. Weitere finale Läufe: phase3-stress.mjs, phase3-journey-browser.mjs, phase3-short-navigation.mjs, final-product-browser.mjs und die acht neuen Phase-4-Suiten. Dateinamen und Umgebungsvariablen im jeweiligen Skript beachten; manche älteren Suiten schreiben weiterhin unter qa-output/uiux-phase1/2/3. Das ist kein alter Teststand: der Summarizer prüft die Zeitstempel aller Resultate gegen den neuen vollständigen Unit-Lauf.

Die Reproduktionshilfen im ZIP enthalten die tatsächlichen lokalen Arbeitsverzeichnisse. Bei anderer Ablage diese Pfade anpassen. Sie führen keine App-Migration und keinen Deploy aus. summarize.py setzt vollständige neue Resultate, die finalen 104 Paare und den Manifestvergleich voraus.

## Archiv und manuelle Abnahme

SHA-256 aller äußeren Archive gegen FaithPath_UIUX4_Pruefsummen.txt vergleichen. Prüf- und Screenshot-ZIP enthalten jeweils SHA256.json mit Dateihashes; ZIP-CRC allein ersetzt SHA-256 nicht. Zum lokalen Start Build-ZIP in einen leeren Ordner entpacken und per HTTP bereitstellen. file:// unterstützt den PWA-Lebenszyklus nicht.

Physische Geräteabnahme anhand docs/UIUX_PHASE4_IPHONE_GATE_2026-10-16.md. UIUX1–4 bleiben OFFEN, bis reale iPhone/Safari/Home-Screen-PWA/VoiceOver-Ergebnisse vorliegen. Dafür ist eine separat freigegebene, erreichbare HTTPS-Test-Origin nötig; localhost des Rechners ist nicht localhost des iPhones. Keine Produktionsdaten importieren.
