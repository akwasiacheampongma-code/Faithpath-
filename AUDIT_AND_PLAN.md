# Phase 1 Audit + Phase 2 Product Plan

## Audit
Architecture: statische Vanilla-JS-PWA ohne Build-Tool. Hauptlogik in `app.js`, Styling in `styles.css`, Inhalte in `data/`, zwei lokale Bibelsets, sieben Tree-Assets. Das ist für Offline-first und geringe Betriebskosten sinnvoll, erhöht aber das Risiko einer zu großen monolithischen `app.js`.

Storage: `faithpath.v1.rebuild` (Hauptdaten), `faithpath.guidedPlans.v1` (Planfortschritt), bisher `faithpath.onboarding.v3`. V4 behält die ersten beiden unverändert und migriert das Hauptobjekt additive auf Schema-Version 4.

Gefundene Risiken: uneinheitliche Buchcodes (`joh`, `mar`, `jak` vs. lokale `JHN`, `MRK`, `JAS`); Service Worker war im Ausgangs-`index.html` nicht registriert; alte UI war stark kartenbasiert; Rückblick basierte fast nur auf Weg-Alter statt auf mehreren Datenspuren; persönliche Historie war auf Event-Logs reduziert; Backup-Import akzeptierte praktisch jedes JSON; einige Navigationsaufrufe nutzten `path` statt `paths`; geführte Wege referenzierten `openPassage`, obwohl diese Funktion im Ausgangsbuild nicht definiert war.

Content: echte App-Datei enthält 312 NT-Einheiten / 1.560 Fragen. 260 Kapitelquiz-Einheiten sind text-extraktiv erzeugt und nicht als vollständig manuell redaktionell geprüft zu behandeln. Airtable besitzt ein deutlich größeres redaktionelles FaithPath-System mit 864 Einheiten und Prüfstatus-Feldern; es wurde bewusst nicht als Runtime-Abhängigkeit eingebaut und nichts wurde überschrieben.

GitHub: Repository `akwasiacheampongma-code/Faithpath-` ist erreichbar. V4 liegt auf `develop/v4`; der Upload auf den Branch wurde über einen GitHub-Actions-Workflow erfolgreich ausgeführt.

## Priorisierter Plan
MUSS: Kernloop sichtbar machen; Erinnerungslücken; echte Glaubensgeschichte; Buchcode-/Referenzfehler; Datenmigration; Backup-Sicherheit; Service Worker/Netlify; mobile Informationsarchitektur.

SOLLTE: situationsbezogene Orientierung vervollständigen; Journal/Mein Weg/Entdecken visuell und strukturell vereinheitlichen; Onboarding reduzieren; Accessibility-Grundlagen.

SPÄTER: echte Ast-zu-Weg-Visualisierung; Cloud-Sync; vollständige redaktionelle Überarbeitung der 1.300 extraktiven Kapitelquizfragen; Git-basierter Continuous Deploy; optionaler Airtable→JSON-Release-Export.
