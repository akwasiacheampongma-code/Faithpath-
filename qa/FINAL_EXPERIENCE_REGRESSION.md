# FaithPath — Final Experience

Ausgangsbuild: **FP4-20261005-G-CHAPTER1**. Zu Beginn live und gegen `develop/v4` geprüft.
Ausgangs-HEAD: `f02106e9a15877ec8acb92f444bf62fcbc51c36e`.
Neuer Build: **FP4-20261005-G-EXPERIENCE1**.
Branch: `feature/final-experience-v1` (isolierter Worktree vom verifizierten HEAD).
Production bleibt https://zesty-rolypoly-d11fff.netlify.app — dort wurde dieser Kandidat **nicht** veröffentlicht. Kein main-/develop-Merge, kein Release-Tag.

## Finales lokales Gate

85 Node-Tests PASS; Content Validation mit 0 Fehlern PASS; Build PASS. Geschützter Content-Hash identisch zur tatsächlichen Production-Baseline. 31 besonders geschützte Source-/Asset-Dateien zusätzlich bytegleich gegen Ausgangs-HEAD geprüft.

Alle folgenden Browser-/Szenario-Gruppen bestanden. Eine Gruppe kann viele Assertions, Routen oder Testzustände enthalten; Counts sind keine Nutzerstudie.

| Suite / Ergebnisdatei unter qa-output/final-experience | Gruppen | Status |
|---|---:|---|
| regression/app-icon-browser/results.json | 5 | PASS |
| regression/continuity-browser/results.json | 24 | PASS |
| regression/core-depth-accessibility/results.json | 15 | PASS |
| regression/core-depth-browser/results.json | 15 | PASS |
| regression/final-note-browser/results.json | 11 | PASS |
| regression/final-product-browser/results.json | 19 | PASS |
| regression/final-safe-browser/results.json | 5 | PASS |
| regression/final-ui-browser/results.json | 13 | PASS |
| regression/premium-downloads-browser/results.json | 10 | PASS |
| regression/premium-journal-browser/results.json | 12 | PASS |
| regression/premium-links-browser/results.json | 2 | PASS |
| regression/premium-system-browser/results.json | 20 | PASS |
| regression/retest-edge-browser/results.json | 9 | PASS |
| regression/retest-menu-browser/results.json | 13 | PASS |
| features/results.json | 18 | PASS |
| chapter-regression/results.json | 17 | PASS |
| update-results.json | 4 | PASS |
| light-comparison/results.json | 3 | PASS |
| extra-visual/results.json | 32 | PASS |
| browser-results.json | 12 | PASS |
| service-worker-results.json | 3 | PASS |
| visual/atmospheric/results.json | 128 | PASS |
| visual/light/results.json | 128 | PASS |
| visual/night/results.json | 128 | PASS |
| visual/paper/results.json | 128 | PASS |

Summe: **774 Gruppen**, 0 offene neue P0/P1/P2-Regressionsfunde. Console/Load/Page Error-Listen der protokollierten normalen Szenarien leer. Gezielte beschädigte Dateien, verweigerter Speicher, abgewiesenes Update und blockierte-SW-Testkontexte sind erwartete Fault-Injection-Szenarien; ihre Fehlerzustände werden geprüft, nicht als erfolgreiche Netzwerkanfragen bezeichnet.

## Inhalt und Systemtrennung

| Kennzahl | Ist / erwartet | Status |
|---|---:|---|
| FaithPath-Fragen | 1560 | PASS |
| FaithPath Story-Quellen | 260 | PASS |
| Nachlese-Fragen | 2314 | PASS |
| Merged Stories | 436 | PASS |
| Source IDs | 2574 | PASS |
| Flow Items | 2479 | PASS |
| Unmapped | 0 | PASS |
| Chapter Questions | 1300 | PASS |
| Chapter Units | 260 | PASS |
| Fragen je Kapitel | 5 | PASS |
| NT-Bücher | 27 | PASS |

Inhalte/IDs/Antworten/Erklärungen/Referenzen und bestehender Prüfstatus unverändert. Reiner Nachlese-, gemischter und FaithPath-only-Flow bleiben die bestehenden kanonischen Systeme. Chapter Questions bleiben getrennt.

## Wesentliche Nachweise

- Core / Journal-Suche / physische Journal-Löschung / Bibelnotizrollen-Löschung / Undo / Referenzbereinigung / Wegverwaltung / Rückblicke / Continuity / Menü / Escape / Fokus / Backup: PASS in bestehenden Suites.
- CHAPTER1 Reader-Ende, alle 27 Buchcounts, Boundary-Mappings, fünf Fragen, Origin-Routing, Collection-/Reader-Status, Offline-Rücksprung: 17 Gruppen PASS.
- Neue Journey: Öffnen ≠ Erkundung, Quiz ≠ Erkundung, exakt einmal, Übersetzungs-Deduplizierung, vollständiges Buch, Offline, Backup, Speicherablehnung: PASS.
- Neue Branches: echte IDs/eindeutige Namensräume, Spiegel-Deduplizierung, 1/3/5/8-Fixtures, Caps/Listeners/Fokus/Touch: PASS.
- Neue Themes: vier live auswählbar, settings-only Änderungen, Reload/Offline/Upgrade: PASS.
- Tatsächlicher CHAPTER1-SW→neuer Build: vier Themes, Store/Entwurf byte-identisch, alle ursprünglichen Journal-/Notizrollen-/Highlight-/Weg-/Schritt-/Rückblick-/Quiz-/Story-/Lesestand-/Settings-Daten erhalten. Kein rückwirkender Lesestatus; neues Offline-Ende bleibt nach Reload erhalten.
- Generischer SW-Test: historische Migration, expliziter Updatewechsel mit Entwurf, unvollständiges Update abweisen und vollständigen alten Build offline behalten: 3 Gruppen PASS. Lokal nur Importpfad und freien Port an Environment angepasst.
- 320/390/768/1440, 320/390 @200 % Root-Text, Reduced Motion, Keyboard, axe und CSS-Safe-Areas 47/34: PASS innerhalb der dokumentierten Simulation.

## Visuelle Sichtung

EXPERT_VISUAL_REVIEW: zwölf Contact Sheets (Kernseiten, Coverage, 1/3/5/8-Branches für jeweils vier Themes) und gezielte Originalbilder betrachtet. Reader, Highlight-/Notiz-/Löschdialoge, alte und neue Inhalte, Tablet/Desktop sowie 200-%-Zustände geprüft. Sichtbarer Fehler hätte das Gate überstimmt. Reflow-/Target-Funde wurden vor Gate repariert; keine unaufgelöste neue visuelle Regression entdeckt.

704 Theme-Matrix-PNGs + 104 zusätzliche Branch-/Safe-Area-PNGs, separate Feature-/Vergleichs-/Regression-Screens. Alle Ergebnisdateien, Logs und Integritätsbelege im QA-Artefakt; keine QA-Fixtures im ausgelieferten Nutzerbestand.

Runtime-Hash: `10c66473816241391ee75d7f483d4d4290211dceb4e1bf817b4745c5d47a1c65`. Content-Hash: `812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9`.

Production wurde zu Beginn gelesen/verifiziert, aber dieser Kandidat nicht deployed. Daher keine fälschlich behauptete Live-QA eines unveröffentlichten neuen Builds.

## Grenzen und nächstes Gate

Die Tests verwenden Desktop-Chromium, emulierte Viewports und 200 % Root-Schrift, keine physischen Mobilgeräte. Safe Areas 47/34 px sind CSS-Simulationen. Echtes iPhone/Safari, VoiceOver, iOS-Tastatur, Dynamic Island und OS-Level-PWA-Neustart sind noch nicht real geprüft. Ein erneuter Browserkontext und Reload prüfen Persistenz, nicht einen echten Betriebssystem-Neustart.

„Erkundet“ belegt das erreichte, unverdeckte Kapitelende. Es belegt weder Aufmerksamkeit noch Verständnis. Historische Kapitelöffnungen werden nicht rückwirkend zu gelesenen Kapiteln erklärt. Lokal gespeicherte Daten bleiben den Grenzen von Browser-/Gerätespeicher unterworfen; ein Theme schafft keine Synchronisation oder zusätzliche Sicherung.

Das alte Atmospheric-Paket/PDF war im verfügbaren Bestand nicht vorhanden. Das Theme verwendet die vorgegebene Wald-/Creme-/Gold-Richtung, keine erfundenen alten Binärassets. Vorhandene Systemfont-Stacks und Originalbilder bleiben bestehen.

Die technische Integration ändert keinen redaktionellen/theologischen Freigabestatus. Bestehende Content-Validation-Warnungen zu alten Ganzkapitel-Sentinels bleiben unverändert; sie sind kein neuer Feature-Regressionsfund.

Empfehlung: bereit für das abschließende reale Device-Gate. Keine weiteren großen Produkt-/Designsysteme; jetzt reale Nutzer beobachten und Wiederaufnahme/Retention validieren.

## Preview-Nachweis

Draft-Artefakt vollständig über Netlify-API verifiziert; Production-Pointer unverändert. Neues Preview-HTTP/Browser-Gate bleibt wegen der dokumentierten Host-Freigabe offen, ohne es als App-Regression oder Live-PASS auszugeben. Details im [Hauptbericht](FINAL_EXPERIENCE_REPORT.md).
