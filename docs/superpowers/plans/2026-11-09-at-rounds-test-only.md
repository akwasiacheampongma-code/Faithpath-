# AT-Zusatzrunden TEST_ONLY Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zwei freiwillige Fünf-Fragen-Runden für 1KI8 und 2KI15 im echten Reader-/Sammlungs-/Quizfluss ausschließlich in einem expliziten Testbuild prüfen.

**Architecture:** Bestehende Quizdarstellung und V5-Store-Transaktionen verwenden. Ein eigener Test-SessionStorage-Namensraum trennt nicht freigegebene Testergebnisse von persönlichen Daten. Ein standardmäßig falscher Build-Schalter verhindert Auslieferung und Laden der Fixture im normalen Build. Kein Einfügen in den kanonischen Inhaltskatalog.

**Tech Stack:** Bestehendes Vanilla-JavaScript, Node-Test-Runner, Playwright/Chromium und axe; keine neuen Abhängigkeiten.

**Spec:** `docs/at-rounds/README_CODEX_SOURCE.md`; unveränderter Vorschlag `tests/fixtures/at-rounds.original-plan.json`.

## Global Constraints

- Basis f02106e9a15877ec8acb92f444bf62fcbc51c36e; Arbeitsbranch feature/at-chapter-quiz-rounds.
- `human_approved=false`, `production_import_allowed=false`, `deploy_production=false`.
- Nur 1KI8 und 2KI15; A/B je fünf Fragen; alle 20 Original-IDs, Texte, Referenzen und Lösungstexte erhalten.
- B freiwillig und erst nach ausdrücklichem Abschluss aller fünf A-Fragen; kein automatischer Start.
- Keine Änderung von Schema V5, Produktivschlüsseln oder kanonischen Bibel-/Fragenbeständen.
- Keine NUM17-ED-Entwürfe verwenden. Keine erfundene Produktions-/Redaktionsfreigabe.
- Keine Veröffentlichung, kein Push/Merge, kein externes Deployment. Builds nur in separaten QA-Verzeichnissen.
- Das vollständige im gelieferten Altprüfer verlangte AT-Importbundle liegt nicht im ZIP. Kein erfundener Ersatz und kein behaupteter Gesamt-Preflight-PASS.

## Review Focus

- Bereits laufender normaler Quizstand darf durch einen Ausflug in die Testrunden nicht verschwinden.
- Gespeicherte Antwortindizes dürfen nach Fixture-/Optionsänderungen nicht anders gedeutet werden.
- Blockierter/voller SessionStorage muss eine verständliche Meldung statt falscher Speicherbestätigung erzeugen.
- Ein manipuliertes B-/Fremdkapitel-Deep-Link darf den A-Abschluss nicht umgehen.
- Neustart von A muss B wieder sperren, aber dessen gespeicherte Antworten nicht ungefragt löschen.

## Task 1: Katalog und transaktionaler Testfortschritt

**Files:** `src/at-rounds.js`, `src/at-rounds-config.js`, `tests/at-rounds.test.mjs`, `tests/fixtures/at-rounds.*.json`.

**Interfaces:** `createAtRoundCatalog(fixture)` prüft die beiden Kapitel, IDs und vier Optionen. `createAtRoundController(catalog, store, fixtureSha)` bietet `session(book,chapter,round)`, `answer(...)`, `advance(...)`, `reset(...)` und `completed(...)`. Die Eingabe-Store-Schnittstelle stammt unverändert aus `createStore`.

- [x] Tests für vollständige Zuordnung, A/B-Gating, Wiederaufnahme, zwei Bücher, Quellrevision, beschädigte Zustände und Speicherfehler schreiben und rot ausführen.
- [x] Kleines Modul mit bestehenden Store-Transaktionen implementieren; Testzustand in `quiz[book:chapter:round]`, ohne neue Inhalts-ID.
- [x] Quelle/Plan/Fixture gegen die 20 kanonischen Quellfragen prüfen; negative Fälle für geänderte Antwortzuordnung.
- [x] Tests und vollständige Baseline-Suite grün ausführen; kleinen Commit erstellen.

## Task 2: Abschaltbarer Build und echter App-Fluss

**Files:** `src/app.js`, `src/at-rounds-feature.js`, `scripts/build.mjs`, `scripts/build-at-rounds-test.mjs`, `scripts/validate-at-rounds-test.mjs`, `package.json`, `styles.css`.

**Interfaces:** Build-Schalter `FAITHPATH_AT_ROUNDS_TEST_ONLY=1` erzeugt einen eindeutig benannten TEST-Build und übernimmt ausschließlich die geprüfte Fixture. `loadAtRoundFeature(base, sessionStorage, fixtureSha)` nutzt denselben Store in einem isolierten Session-Namensraum. Routes erweitern `chapter-quizzes/BOOK/CHAPTER?round=A|B`; Original-NT-Routen bleiben unverändert.

- [ ] Browserprüfung zuerst gegen die unveränderte App ausführen: AT-Einstieg ist nicht vorhanden.
- [ ] Reader-/Sammlungseinstieg, gemeinsamen Quizrenderer, freiwilliges B-Angebot und sichere Rückwege anbinden.
- [ ] Aktive normale Quizsession beim Wechsel in die Testansicht erhalten; Antworten und Cursor sofort transaktional sichern.
- [ ] Auf Feature-off keine Fixture ausliefern oder laden; deaktivierte und manipulierte Deep Links prüfen.
- [ ] Verständliche Fehlermeldungen und bestätigten, ausschließlich rundenbezogenen Neustart prüfen.
- [ ] Unit-/Browserprüfungen grün ausführen; kleinen Commit erstellen.

## Task 3: Nachweise, Offline und Freigabegrenzen

**Files:** `tests/at-rounds-browser.mjs`, `reports/at-rounds/*`, `docs/at-rounds/IMPLEMENTATION_REPORT.md`.

**Interfaces:** QA nutzt nur synthetische Daten und lokale Server. Zwei gebaute TEST-Fassungen werden auf derselben isolierten Origin für den Service-Worker-Wechsel geprüft. Der normale Build und die Baseline dienen als Kontrollen.

- [ ] Alle vier Runden im tatsächlichen App-Fluss vollständig beantworten; 20 besuchte IDs und jeweils sechs redaktionelle Einheiten belegen.
- [ ] Mobile 320/390 und Desktop, vier Themes, große Schrift, Tastatur und axe prüfen; echte Screenshots aufnehmen.
- [ ] Unterbrechung/Reload, Back/Forward, Reader-Rückkehr, Neustart, Hauptquiz-Schutz und Speicherfehler prüfen.
- [ ] Offline-Wiederaufnahme und SW-Update mit gespeicherten synthetischen Daten testen.
- [ ] Alle Tests, zwei gleiche Builds, Content-/Dateihashes und unveränderte Datenverträge prüfen.
- [ ] Unabhängiges Abschlussreview; reproduzierbare Blocker gezielt korrigieren.
- [ ] Technische Nachweise und weiterhin offene fachliche/Geräte-/Produktionsgates getrennt dokumentieren. TEST_ONLY-ZIP und Bericht liefern.

## Ledger

- Baseline: neues Worktree am angegebenen Ort hergestellt, da der gemeldete lokale Branch hier nicht vorhanden war. GitHub-develop/v4 entspricht f02106e.
- Baseline `npm run validate`, `npm test` (9 Testdateien) und separater `npm run build` erfolgreich. Zwei generierte Daten-Dateien bleiben unversioniert.
- Unabhängiger Abgleich: 20/20 Fragen, 16 Optionsumstellungen, richtige Antworttexte und beide kritischen IDs stimmen mit Inhaltscommit 7d20a62a3f016ea4218ff9d34c2486992e92cfdf überein.
- Entscheidung: Testantworten nutzen vorhandenes V5-Quizschema im isolierten Session-Namensraum. Produktivbackups enthalten absichtlich keine unfreigegebenen Fixture-Ergebnisse.
- Entscheidung: A-Neustart löscht nur A. B wird gesperrt und erst nach erneutem A-Abschluss wieder erreichbar; B-Antworten bleiben erhalten.

- Task 1 abgeschlossen: zehn fachliche Runden-/Quelltests und vollständiges `npm test` (zehn Testdateien) bestanden; RED/GREEN-Protokolle im isolierten QA-Verzeichnis.
