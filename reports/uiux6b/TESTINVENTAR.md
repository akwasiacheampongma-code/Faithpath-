# Testinventar und genaue Reichweite

Der ursprüngliche Branch enthält137 Dateien unter `tests/`, davon36 `.test.mjs`-Dateien. `npm test` lädt alle ursprünglichen Unit-/Integrationstestdateien sowie die zwei neuen reinen Helpertests; insgesamt191 einzelne Tests. Die gemeinsame Browsermatrix umfasst41 ausdrücklich benannte aktuelle Programme. Zusätzlich wird der redaktionelle Nachlese-Browsertreiber ausgeführt. Neue6B-Prüfungen, Kontrast, Zustandsmatrix und echte lokale HTTPS-Aktualisierung stehen separat.

**Es wird nicht behauptet, jede historische `.mjs`-Datei erneut erfolgreich ausgeführt zu haben.** Das Repository enthält viele Standvergleiche, Aufnahmeskripte und auf ältere Build-IDs oder Ports festgelegte Treiber. Beispielsweise erwartet `final-links-browser.mjs` ausdrücklich FINAL2 und einen früheren QA-Berichtpfad; `phase4-discovery-boundary.mjs` vergleicht zwei alte Origins; das alte Iconskript fordert das damalige Headerbild. Diese unverändert auszuführen wäre kein sinnvoller Nachweis der ausgewählten neuen Markenoberfläche. Frühere Updateprogramme verlangen jeweils andere exakt gehashte Ausgangsbuilds. Der aktuelle UIUX45→6B-Übergang hat deshalb seinen eigenen tatsächlichen Updatebeleg.

Die folgende vollständige Dateiliste trennt ausgeführte Testprogramme, indirekt benutzte Prüfungen, Fixtures und nicht direkt wiederholte historische Treiber. „Nicht direkt wiederholt“ ist kein PASS und keine Aussage einer100%-Pfadabdeckung. Die aktuelle konkrete Laufzeitmatrix und Byte-/Inhaltsnachweise sind maßgeblich; physische Geräteprüfungen bleiben OFFEN.

| Einordnung | Dateien |
|---|---:|
| CURRENT_BROWSER | 41 |
| EDITORIAL_BROWSER | 1 |
| FIXTURE | 10 |
| HISTORICAL_PRESERVATION | 2 |
| HISTORICAL_QA_LINKS | 5 |
| HISTORICAL_UPDATE | 15 |
| HISTORICAL_VISUAL | 16 |
| INDIRECT | 1 |
| OTHER_LEGACY_NOT_RUN | 10 |
| UNIT | 36 |

| Ursprüngliche Datei | Einordnung | Nachweis/Grenze |
|---|---|---|
| `tests/app-icon-browser.mjs` | OTHER_LEGACY_NOT_RUN | Nicht erneut direkt ausgeführter älterer Treiber; keine PASS-Behauptung. Aktuelle Funktionsnachweise ausschließlich aus expliziter Matrix |
| `tests/app-icon-update-browser.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/backup-phase5.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/chapter-questions-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/chapter-questions-downloads-browser.mjs` | HISTORICAL_QA_LINKS | Frühere QA-/Downloadpfade und Berichtsausgaben; nicht erneut als aktuelles Produktgate ausgeführt. Aktuelle ZIPs und Galerie separat geprüft |
| `tests/chapter-questions-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/chapter-questions.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/continuity-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/core-depth-accessibility.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/core-depth-before.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/core-depth-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/core-depth-fixture.mjs` | FIXTURE | Eingabedaten/Hilfsmodul, kein eigener Browser-Treiber |
| `tests/core-experience.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/core.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/discover-phase4.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/draft-protection.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/editor-path-regression.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/final-experience-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/final-experience-extra-visual.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/final-experience-fixture.mjs` | FIXTURE | Eingabedaten/Hilfsmodul, kein eigener Browser-Treiber |
| `tests/final-experience-light-comparison.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/final-experience-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/final-experience-visual.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/final-experience.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/final-links-browser.mjs` | HISTORICAL_QA_LINKS | Frühere QA-/Downloadpfade und Berichtsausgaben; nicht erneut als aktuelles Produktgate ausgeführt. Aktuelle ZIPs und Galerie separat geprüft |
| `tests/final-note-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/final-note.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/final-product-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/final-product.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/final-safe-browser.mjs` | OTHER_LEGACY_NOT_RUN | Nicht erneut direkt ausgeführter älterer Treiber; keine PASS-Behauptung. Aktuelle Funktionsnachweise ausschließlich aus expliziter Matrix |
| `tests/final-ui-browser.mjs` | OTHER_LEGACY_NOT_RUN | Nicht erneut direkt ausgeführter älterer Treiber; keine PASS-Behauptung. Aktuelle Funktionsnachweise ausschließlich aus expliziter Matrix |
| `tests/final-update-browser.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/fixtures/baseline-e.json` | FIXTURE | Eingabedaten/Hilfsmodul, kein eigener Browser-Treiber |
| `tests/fixtures/content-allowlist.json` | FIXTURE | Eingabedaten/Hilfsmodul, kein eigener Browser-Treiber |
| `tests/fixtures/content-master.json` | FIXTURE | Eingabedaten/Hilfsmodul, kein eigener Browser-Treiber |
| `tests/import-safety.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/journal-phase5.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/menu-qa.py` | OTHER_LEGACY_NOT_RUN | Nicht erneut direkt ausgeführter älterer Treiber; keine PASS-Behauptung. Aktuelle Funktionsnachweise ausschließlich aus expliziter Matrix |
| `tests/nachlese-editorial-browser.mjs` | EDITORIAL_BROWSER | evidence/extended-regression und nachlese-editorial-results.json |
| `tests/nachlese-editorial-corpus.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/nachlese-editorial-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/nachlese-editorial.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/nachlese-mc-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/nachlese-mc-corpus-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/nachlese-mc-corpus.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/nachlese-mc-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/nachlese-mc-validation.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/nachlese-mc.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/navigation-phase4.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/nt-quiz-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/nt-quiz-import.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/nt-quiz-invalid-master.py` | INDIRECT | tests/nt-quiz-import.test.mjs ruft diese Negativprüfung auf |
| `tests/onboarding-phase4.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/path-detail-phase3.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/path-review-phase3.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/paths-phase3.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/personal-continuity.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/phase2-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase2-capture.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/phase2-fixtures.mjs` | FIXTURE | Eingabedaten/Hilfsmodul, kein eigener Browser-Treiber |
| `tests/phase2-reflection-capture.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/phase2-short-capture.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/phase2-short-chapter-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase2-stress.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase2-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/phase3-archive-capture.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/phase3-capture.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/phase3-detail-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase3-fixtures.mjs` | FIXTURE | Eingabedaten/Hilfsmodul, kein eigener Browser-Treiber |
| `tests/phase3-journey-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase3-overview-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase3-review-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase3-short-navigation.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase3-stress.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase3-tree-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase3-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/phase4-capture.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/phase4-discover-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase4-discovery-boundary.mjs` | OTHER_LEGACY_NOT_RUN | Nicht erneut direkt ausgeführter älterer Treiber; keine PASS-Behauptung. Aktuelle Funktionsnachweise ausschließlich aus expliziter Matrix |
| `tests/phase4-menu-focus-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase4-navigation-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase4-onboarding-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase4-routes-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase4-stress-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase4-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/phase5-backup-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase5-backup-dialogs-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase5-backup-races-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase5-capture.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/phase5-export-fixtures.mjs` | FIXTURE | Eingabedaten/Hilfsmodul, kein eigener Browser-Treiber |
| `tests/phase5-fixtures.mjs` | FIXTURE | Eingabedaten/Hilfsmodul, kein eigener Browser-Treiber |
| `tests/phase5-journal-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase5-reminders-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase5-reviews-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/phase5-stress-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/premium-downloads-browser.mjs` | HISTORICAL_QA_LINKS | Frühere QA-/Downloadpfade und Berichtsausgaben; nicht erneut als aktuelles Produktgate ausgeführt. Aktuelle ZIPs und Galerie separat geprüft |
| `tests/premium-journal-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/premium-journal-storage.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/premium-journal.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/premium-links-browser.mjs` | HISTORICAL_QA_LINKS | Frühere QA-/Downloadpfade und Berichtsausgaben; nicht erneut als aktuelles Produktgate ausgeführt. Aktuelle ZIPs und Galerie separat geprüft |
| `tests/premium-preservation.mjs` | HISTORICAL_PRESERVATION | Alter Stand-/Variantenvergleich nicht wörtlich ausgeführt; aktueller Byte-/Routen-/Actionvergleich liegt separat vor |
| `tests/premium-system-browser.mjs` | OTHER_LEGACY_NOT_RUN | Nicht erneut direkt ausgeführter älterer Treiber; keine PASS-Behauptung. Aktuelle Funktionsnachweise ausschließlich aus expliziter Matrix |
| `tests/premium-update-browser.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/premium-visual.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/product-downloads-browser.mjs` | HISTORICAL_QA_LINKS | Frühere QA-/Downloadpfade und Berichtsausgaben; nicht erneut als aktuelles Produktgate ausgeführt. Aktuelle ZIPs und Galerie separat geprüft |
| `tests/quiz-final-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/reader-phase2.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/release-smoke.mjs` | OTHER_LEGACY_NOT_RUN | Nicht erneut direkt ausgeführter älterer Treiber; keine PASS-Behauptung. Aktuelle Funktionsnachweise ausschließlich aus expliziter Matrix |
| `tests/reminders-phase5.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/retest-edge-browser.mjs` | OTHER_LEGACY_NOT_RUN | Nicht erneut direkt ausgeführter älterer Treiber; keine PASS-Behauptung. Aktuelle Funktionsnachweise ausschließlich aus expliziter Matrix |
| `tests/retest-menu-browser.mjs` | OTHER_LEGACY_NOT_RUN | Nicht erneut direkt ausgeführter älterer Treiber; keine PASS-Behauptung. Aktuelle Funktionsnachweise ausschließlich aus expliziter Matrix |
| `tests/retest-regressions.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/reviews-phase5.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/service-worker.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/short-opening-phase3.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/stabilization-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/stabilization-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/story-phase2.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/sword-phase2.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/today-olive-variant-b-compact.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/today-olive-variant-b.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/today-page.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/today-phase1-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/today-phase1-capture.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/today-phase1-fixtures.mjs` | FIXTURE | Eingabedaten/Hilfsmodul, kein eigener Browser-Treiber |
| `tests/today-phase1-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/today-phase1-zoom.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/today-variant-b-preservation.mjs` | HISTORICAL_VISUAL | Frühere Bild-/Variantenaufnahme; neue432 Aufnahmen und erhaltene Vorher-Referenz ersetzen keine Behauptung eines PASS dieses alten Skripts |
| `tests/tree-branch-visual-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/tree-branch-visual-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
| `tests/tree-branch-visual.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/tree-phase3.test.mjs` | UNIT | npm test; alle36 ursprünglichen Testdateien werden erneut geladen |
| `tests/ui-premium-preservation.mjs` | HISTORICAL_PRESERVATION | Alter Stand-/Variantenvergleich nicht wörtlich ausgeführt; aktueller Byte-/Routen-/Actionvergleich liegt separat vor |
| `tests/ui-premium.mjs` | OTHER_LEGACY_NOT_RUN | Nicht erneut direkt ausgeführter älterer Treiber; keine PASS-Behauptung. Aktuelle Funktionsnachweise ausschließlich aus expliziter Matrix |
| `tests/uiux45-integration-browser.mjs` | CURRENT_BROWSER | QA_MATRIX.md; tatsächlicher Einzellauf auf dem Kandidaten |
| `tests/uiux45-update.mjs` | HISTORICAL_UPDATE | Nicht wörtlich wiederholt: versionsgebundene frühere Ausgangs-Builds; aktueller Übergang UIUX45→6B separat über echtes lokales HTTPS geprüft |
