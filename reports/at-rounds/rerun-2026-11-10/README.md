# AT-Zusatzrunden: erneute Abnahme vor GitHub-Push

**10.11.2026 · Technische TEST_ONLY-Prüfung bestanden. Produktion bleibt NO-GO.**

`human_approved=false` · `production_import_allowed=false` · `deploy_production=false`

Branch: [`feature/at-chapter-quiz-rounds`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/feature/at-chapter-quiz-rounds).

Die Veröffentlichung dieses Feature-Branches wurde ausdrücklich beauftragt. Sie ist keine fachliche Freigabe, kein Merge und keine Erlaubnis für ein Netlify-Produktionsdeployment. Der erfolgreiche Push und der endgültige Remote-SHA werden erst im abschließenden Übergabemanifest bestätigt.

## Geprüfter Stand und Änderungen dieser Nachprüfung

- App-Ausgangspunkt dieser Wiederholung: **2a8482a13679c91b0448143f139ab2200fe0126a**.
- Unveränderte technische Basis des gesamten Features: **f02106e9a15877ec8acb92f444bf62fcbc51c36e**, develop/v4.
- Unveränderter Inhaltsquellstand: **7d20a62a3f016ea4218ff9d34c2486992e92cfdf**, content/at-nt-qa-20261023.
- Build-ID bleibt **FP4-20261109-G-AT-ROUNDS-TEST1**, weil keine Appänderung vorgenommen wurde. TEST2 wird ausschließlich für das lokale SW-Update verwendet.
- Nur der Browserprüfer wurde erweitert: Aufnahmen beider Runden in beiden Büchern bei 320×568 und 390×844; zusätzliche Aufnahmen der Fragen 1273-Q3 und 1356-Q3; maschinenlesbare Zuordnung zu Frage, Referenz, Route und geprüftem Build.
- Keine fehlschlagende fachliche Testassertion und kein neuer reproduzierbarer Appfehler im ausgeführten Umfang. Deshalb keine zusätzlichen Änderungen am Anwendungscode.

Die aufbewahrten ersten Wiederholungsbuilds tragen `dirty:true`: ausschließlich die Erweiterung des Browserprüfers war zu diesem Zeitpunkt noch nicht committed. `src/`, CSS, Buildlogik und kanonische Daten entsprechen dem genannten Appcommit. Der abschließende saubere QA-Commit wird erneut gebaut und geprüft; dessen Metadaten stehen im Übergabemanifest. Unterschiedliche Commit-/Dirty-Angaben verändern BUILD.txt und release-integrity.json, nicht die Runtime-Dateien.

## Tatsächlich erneut ausgeführte Prüfungen

| Prüfung | Ergebnis | Nachweis |
|---|---|---|
| `npm run validate` | PASS | [validate.log](logs/validate.log) |
| `npm run validate:at-rounds:test` | PASS, 20/20 Fragen; 16 Optionspermutationen bei unverändertem richtigem Antworttext | [source-audit.log](logs/source-audit.log) |
| `npm test` | **99/99 Einzeltests**, 12 Testdateien, 0 Fehler | [unit.log](logs/unit.log) |
| TEST_ONLY-Build, zweimal | PASS, alle **318 Dateien** identisch, einschließlich release-integrity.json | [Reproduzierbarkeit](reproducible-build.json), [Build-Prüfung](logs/build-verification.log) |
| Normaler Kontrollbuild und TEST2 | PASS; Fixture nur in ausdrücklich aktiviertem Testbuild | [build-off.log](logs/build-off.log), [build-test2.log](logs/build-test2.log) |
| Reader/Sammlung → A → freiwillige B, beide Bücher | PASS, 20 eindeutig angezeigte Originalfragen | [Browserprotokoll](browser-results.json) |
| Erreichbarkeitsvalidator | PASS, 1KI8 und 2KI15 je **6/6** redaktionelle Einheiten | [reachability.json](reachability.json) |
| Neue Browser-Abnahme | PASS, **9 Gruppen** | [acceptance-results.json](acceptance-results.json) |
| Bestehende Browser-Suite, Feature ausgeschaltet | PASS, **12 Gruppen** | [legacy-off-results.json](legacy-off-results.json) |
| Bestehende Browser-Suite, Feature eingeschaltet | PASS, **12 Gruppen** | [legacy-on-results.json](legacy-on-results.json) |
| Echte lokale SW-Wechsel off→TEST1→TEST2 | PASS, **5 Gruppen**, V4→V5, Entwurf/Testfortschritt, beide Bibeln offline erhalten | [offline-update-results.json](offline-update-results.json) |
| Vorhandener SW-Regressionstest | PASS, **3 Gruppen**, wartendes Update, Entwurf und Rückfall nach fehlender Ressource | [legacy-sw-results.json](legacy-sw-results.json) |
| Mobile Vorher/Nachher und native Aufklapphilfe | PASS, **14 neue Viewport-Aufnahmen**, 320/390 und 200 % Schrift | [visual-captures.json](visual/visual-captures.json), [visual.log](logs/visual.log) |
| axe und Tastatur | PASS im geprüften Quizbereich, 6 Kombinationen aus 320/390/1280 und 100/200 % Text; keine gemeldeten Verstöße | [acceptance-results.json](acceptance-results.json), sechs axe-JSONs |
| Syntax und Whitespace | PASS | `node --check tests/at-rounds-browser.mjs`, `git diff --check` |

Alle Browserläufe: **Chromium 151 unter Linux**, Node **24.19.0**, ausschließlich synthetische persönliche Daten. Keine echten iPhone-, Safari- oder VoiceOver-Ergebnisse. Auf dieser vorgegebenen Basis ist nur ein Farbsystem implementiert; eine Vier-Theme-Abnahme kann hier nicht behauptet werden. Kein Lint-/TypeScript-Script vorhanden, deshalb kein entsprechender PASS.

Die neun neuen Abnahmegruppen prüfen insbesondere B-Deep-Link-Sperre, ausdrücklichen A-Abschluss, richtige/falsche Optionen und Erklärung, bestätigten Rundenreset, erhaltene B-Antworten, Reader-Rückweg samt Übersetzung/Versbereich, Reload und Back/Forward, erhaltene laufende normale Quizsession, vollen/blockierten SessionStorage, veraltete Fixture-Revision, fehlende Testdaten und sicheren Feature-off-Betrieb.

## Neue Screenshots von A und B

[Vergleichsgalerie öffnen](index.html). Die vollständige Quellen-/Routen-Zuordnung steht unter `captures` in [browser-results.json](browser-results.json).

| Kapitel | Runde A, 390 px | Runde B, 390 px |
|---|---|---|
| 1. Könige 8 | [1270-Q5](screenshots/1KI-A-1270-Q5-390-question.png) | [1270-Q3](screenshots/1KI-B-1270-Q3-390-question.png) |
| 2. Könige 15 | [1351-Q1](screenshots/2KI-A-1351-Q1-390-question.png) | [1351-Q3](screenshots/2KI-B-1351-Q3-390-question.png) |

Zusätzlich: [1273-Q3](screenshots/1KI-B-1273-Q3-390-question.png) und [1356-Q3](screenshots/2KI-B-1356-Q3-390-question.png) tatsächlich in B erreicht. Zu jeder der sechs dokumentierten Fragen liegen getrennte Frage-/Antwort-Viewport-Aufnahmen bei 320 und 390 Pixeln vor. Dies sind keine Mockups und keine physischen iPhone-Aufnahmen.

## Daten- und Inhaltsintegrität

Kanonischer Content-Hash unverändert:

`812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9`

Fixture-SHA256 unverändert:

`08ce19855640b47b0419345fb58b29ddca466f1708b1b7bf021bad6691598285`

Kein versionierter Unterschied gegenüber f02106e unter `data/`, am V5-Store, an domain.js, runtime-model.js, chapter-questions.js oder am SW-Template. Der vorhandene Reader schreibt seine Leseposition/Ereignisse weiterhin wie bisher; Fixture-Antworten überschreiben keine persönlichen Wege, Journaleinträge oder normalen Quizresultate.

Die beiden vorhandenen generierten Dateien `data/reference-index.json` und `data/content-report.json` bleiben unversioniert und werden nicht gepusht. Getracktes `dist` bleibt unverändert.

## Vollständige Dateiliste und GitHub-Übergabe

[CHANGED_FILES.txt](CHANGED_FILES.txt) enthält jede tatsächlich hinzugefügte/geänderte Datei dieses Feature-Branches gegenüber f02106e, einschließlich der Nachprüfungsdateien selbst. Die ursprüngliche Implementierung betrifft vor allem `src/app.js`, die drei `src/at-rounds*.js`-Module, `styles.css`, Build-/Quellvalidatoren und die dazugehörigen Tests/Fixtures. Im aktuellen Nachprüfungsschritt werden ausschließlich Browserprüfer und QA-Dokumentation/Medien geändert.

Der Push ist ausdrücklich auf `HEAD:refs/heads/feature/at-chapter-quiz-rounds` begrenzt, ohne Force, Tags, Merge oder PR. Sämtliche neuen Commits tragen `[skip ci] [skip netlify]`. Der vorhandene GitHub-Workflow reagiert nur auf `workflow_dispatch`; er wird nicht ausgelöst. main und develop/v4 werden vor/nach dem Push separat gelesen. Ein lokaler Test-PASS ist kein behaupteter GitHub-CI-Lauf.

## Offene Fehler und Freigabeblocker

**Keine neuen technischen Fehler in der tatsächlich ausgeführten Testmatrix.** Das bedeutet keine generelle Fehlerfreiheit der App und keine Produktionsfreigabe.

1. 1KI8: 6/6 und beide Runden jetzt erneut ausschließlich für die isolierte Fixture belegt. Vollständige freigegebene AT-Integration offen.
2. 2KI15: dieselbe Abgrenzung; technische Fixture-Abnahme ersetzt keinen kanonischen Produktionsimport.
3. NUM17-ED01: unabhängige fachliche Freigabe offen; nicht in die Test-Runtime übernommen.
4. NUM17-ED02: ebenfalls gesperrt.
5. Unabhängige Redaktion des gesamten AT-Quellbestands offen.
6. Produktionsimport ausdrücklich nicht erlaubt.

Das vollständige `FaithPath_AT_Importpaket_mit_DEU_TEST_ONLY_2026-11-08.json` fehlt weiterhin. Der ursprüngliche Gesamt-Preflight ist deshalb **nicht ausführbar** und wird nicht auf PASS gesetzt. Der neue Erreichbarkeitsvalidator gilt ausschließlich für die vorliegenden 20 Testfragen.

Zusätzliche offene Gates: echtes iPhone/Safari, installierte PWA und VoiceOver; spätere Auswahl/Integration des tatsächlichen aktuellen Premium-Appstands. Die Fixture-Persistenz ist bewusst tabgebunden und kein Bestandteil persönlicher Backups. Ein Schließen des Tabs beendet diesen Teststand.

**Entscheidung: technische TEST_ONLY-QA bestanden; Produktion und Integration in einen freigegebenen Releasezweig weiterhin NO-GO.**
