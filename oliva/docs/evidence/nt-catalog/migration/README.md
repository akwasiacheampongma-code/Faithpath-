# AppData-V8: unabhängiger NT-Lernstand

Geprüft am 09.11.2026; synthetische Datensätze, keine Personenexporte.

`src/state/model.ts` erhält AppData V8 mit dem erforderlichen Feld `ntStudy`.
Der bisherige V7-Schemakörper ist als `v7DataSchema` erhalten; ein direkter
Bytevergleich mit dem unveränderlichen 0.11-Quellcommit
`d419ae7c0fa84ce49d600a0c2db7e9a0f2630279` bestätigt den identischen Körper
(abgesehen vom Exportnamen). Auch die V1–V6-Definitionen sind byteidentisch.
Die Prüfsummen stehen in `contract-check.json`.

V1–V7 werden beim Lesen im RAM nach V8 übertragen. Für V7 kommen ausschließlich
Version 8 und ein leerer NT-Lernstand hinzu. Revision, Lesefortschritte,
Leseposition, Archivquelle, Entwürfe, Einladungen und Wachstum bleiben erhalten.
Archivierte `quiz.done`-Einträge werden durch eine Migration nicht aktiviert.
Ein V7-Dokument mit zusätzlichem `ntStudy` wird abgelehnt; auch V8 akzeptiert
kein fehlendes NT-Feld oder unbekannte Zusatzfelder.

Das private Dokument behält `storageVersion: 1`; der Metadatenleser unterstützt
weiterhin V4–V7 und ergänzt V8. SQLite- und IndexedDB-Versionen werden durch diese
Migration nicht geändert. Die Lese-/Dekodierfunktionen schreiben keine Daten.
Erst der aufrufende Speichervorgang kann den ausdrücklich übergebenen V8-Stand
persistieren.

Jeder historische NT-Abschluss muss auf einen vorhandenen Importbeleg mit
passendem `importId` und `sourceHash` zeigen. Beim vollständigen Dekodieren wird
im ohnehin nötigen Archivprüfpass zusätzlich das ursprüngliche
`quiz[bekannte Originaleinheit].done` verifiziert. Plausible, aber nicht belegte
Zeitpunkte werden abgelehnt. Ein Legacy-Fakt erzeugt weder Antworten noch eine
aktive Fragenposition. Die vollständige Fragenbank wird hierzu nicht importiert.

## Tatsächliche Prüfungen

`npm exec -- vitest run tests/nt-migration.test.ts --reporter=json --outputFile=docs/evidence/nt-catalog/migration/unit-results.json`

**8/8 bestanden**, keine übersprungenen Tests. Rohbericht: `unit-results.json`.
Geprüft wurden alle sieben Vorgänger, private V1-Metadokumente der Versionen
4–7, ein ausführlicher V7-Datensatz mit unverändertem Archiv und unfertigem
Entwurf, strikte Versionsgrenzen, V8-Roundtrips mit fünf Originalantworten und
Abschluss sowie falsche/fehlende historische Herkunft.

Der parallel ausgeführte gemeinsame Typecheck meldete zwei Integrationsfehler
in anderen Testdateien (V7-Fixture und Quiz-Fixturecast), keine Fehler in den
Migrationdateien. Diese Beobachtung ist **kein grüner Gesamt-Typecheck**;
`typecheck-before-fixture-update.json` hält den damaligen Stand fest. Die
übergreifende Integration muss nach den Fixturekorrekturen erneut prüfen.

Diese gezielte Abnahme enthält keinen neuen Browser-, Build-, Simulator- oder
Gerätenachweis und keine Bereitstellung. Sie ersetzt keine Prüfung des echten
PWA-Updates und der unveränderten privaten Rohdatensätze.
