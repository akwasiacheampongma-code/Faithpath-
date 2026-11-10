# AT-Zusatzrunden: isolierte App-Integration, 09.11.2026

> **Nachprüfung 10.11.2026:** Alle relevanten lokalen Tests wurden erneut ausgeführt; neue A/B-Screenshots und vollständige Dateiliste liegen im [GitHub-Übergabebericht](../../reports/at-rounds/rerun-2026-11-10/README.md). Der Feature-Branch-Push ist inzwischen ausdrücklich beauftragt. Die folgende Dokumentation beschreibt den historischen Stand vom 09.11.; ihre damalige Aussage „kein Push“ ist keine Beschreibung des späteren Übergabeschritts. Produktions-/Fachfreigaben bleiben unverändert gesperrt.

**Ergebnis: technische TEST_ONLY-Abnahme bestanden. Integration in einen freigegebenen Produktkandidaten und Produktion: NO-GO.**

`human_approved=false` · `production_import_allowed=false` · `deploy_production=false`

## Tatsächlicher Ausgangspunkt

Repository `akwasiacheampongma-code/Faithpath-`, Branch `feature/at-chapter-quiz-rounds`, Worktree `/workspace/faithpath-quiz-test`.

Die im Auftrag genannte lokale Arbeitskopie war in dieser Umgebung nicht vorhanden. Sie wurde isoliert vom nachgewiesenen `develop/v4`-Commit **f02106e9a15877ec8acb92f444bf62fcbc51c36e** hergestellt. Die Remote-Abfrage bestätigte diesen develop-Stand und Inhaltscommit **7d20a62a3f016ea4218ff9d34c2486992e92cfdf** auf `content/at-nt-qa-20261023`.

Andere lokale/Remote-Feature- und Integrationszweige existieren. Dieser Test überträgt deren spätere Funktionen ausdrücklich nicht auf develop. Die vorgegebene Basis enthält 260 NT-Kapitelquizeinheiten, 1.300 Kapitelquizfragen und insgesamt 1.560 FaithPath-Fragen sowie 2.314 Nachlese-Fragen. Sie enthält nur die vorhandene helle Farbpalette. Sie wird hier weder als jüngster Premium-Appstand noch als geprüfter Produktionsquellstand bezeichnet.

Baseline: `npm run validate`, neun bestehende Testdateien und separater Build erfolgreich. Eine zusätzliche Zählung der unveränderten Originaltestdateien bestätigt **84 Einzeltests**. Vor Validierung fehlt erwartungsgemäß der generierte Referenzindex. `data/reference-index.json` und `data/content-report.json` bleiben unversionierte generierte Dateien; das ist keine Contentänderung.

## Implementierung

- `844e1c1b6269ff20254fe1d7161c1cbd43ea52c6`: Quellabgleich, Fixture, Rundenregeln und erste Tests.
- `787b5ab`: App-Anbindung und Build-Schalter, einschließlich zusätzlicher Sequenzvalidierung. Die anschließende mobile Korrektur steht in **fecd6069363edef8448bc1f10109d5dadbc48190**: Der Testhinweis ist nativ aufklappbar und bei 320/390 Pixeln 71,59 px statt des bisherigen großen Blocks hoch. Neustart und vollständiger Hinweis bleiben per Tastatur erreichbar. Eine globale Details-Regel hatte zunächst zusätzliche Abstände erzeugt; ein eng begrenzter CSS-Reset korrigiert diese Kaskade. Spätere QA-/Dokumentationscommits ändern den Laufzeitcode nicht; exakter ausgelieferter Repository-HEAD steht in `BUILD.txt` und `release-integrity.json` des Build-ZIP.
- Build-ID **FP4-20261109-G-AT-ROUNDS-TEST1**. TEST2 dient ausschließlich dem echten lokalen Updateversuch.

Der Reader bietet bei 1KI8 und 2KI15 die fünf Fragen an. Dieselben Kapitel sind über die bestehende Kapitelfragensammlung erreichbar. Die bestehenden Antwortbuttons, Rückmeldungen und Erklärungen werden wiederverwendet. Nach der fünften beantworteten Frage muss „Runde abschließen“ ausdrücklich betätigt werden. Erst danach ist „Freiwillige zweite Runde“ erreichbar. Es erfolgt kein automatischer B-Start.

Routes: `#chapter-quizzes/1KI/8?round=A` und `#chapter-quizzes/2KI/15?round=A`; B analog. Ein vorzeitiger B-Link führt sicher zu A zurück. Reader-Rückwege erhalten Übersetzung und Versbereich. Ungültige Kapitel, weitere Runden und NUM-Entwürfe öffnen keine Fragen.

`at-rounds.js` enthält reine Katalog-/Fortschrittsregeln, `at-rounds-feature.js` den kleinen Lade-/Store-/Rendereradapter. `app.js` bleibt Router und verwendet den vorhandenen Quizrenderer. Es gibt keinen zweiten Produktkatalog, keine synthetischen `unit.id` und keinen Frameworkwechsel.

## Inhalte und Fortschritt

Alle 20 Fragen stimmen bei Fragetext, Erklärung, Referenz und vier Antworttexten mit dem eingefrorenen Inhaltsbranch überein. Bei 16 Fragen ist die Optionsreihenfolge anders; der jeweilige richtige **Antworttext** bleibt identisch. Die Indizes stammen unverändert aus der gelieferten Fixture. Die A-Auswahl bleibt genau erhalten.

| Kapitel | Runde | Original-IDs |
|---|---|---|
| 1KI8 | A | 1270-Q5, 1271-Q5, 1272-Q4, 1274-Q1, 1275-Q2 |
| 1KI8 | B | 1270-Q3, 1271-Q4, **1273-Q3**, 1274-Q4, 1275-Q6 |
| 2KI15 | A | 1351-Q1, 1352-Q1, 1353-Q2, 1354-Q2, 1355-Q4 |
| 2KI15 | B | 1351-Q3, 1352-Q2, 1353-Q3, 1355-Q3, **1356-Q3** |

Pro Runde werden fünf verschiedene redaktionelle Einheiten erreicht, über A+B jeweils sechs. Die tatsächliche Browserreihenfolge aller 20 IDs wird zusätzlich durch `validate-at-rounds-reachability.mjs` geprüft. Das ist ein auf diese Fixture beschränkter technischer Nachweis, keine globale AT-Abdeckungs- oder Redaktionsfreigabe.

Fortschrittsschlüssel: `1KI:8:A`, `1KI:8:B`, `2KI:15:A`, `2KI:15:B`, im vorhandenen V5-Quizcontainer eines **isolierten SessionStorage-Stores**. Alle Zugriffe **des Fixture-Stores** sind mit `faithpath.at.rounds.app-test.v1:` präfigiert. Für diese Testantworten werden weder der persönliche LocalStorage-Key noch der alte Prototyp-Key verwendet. Die normale App verwendet weiterhin ihren bisherigen Store; insbesondere aktualisiert der Reader seine Leseposition und Leseereignisse wie bisher. Geprüft ist, dass Testantworten keine bestehenden Wege, Journalinhalte oder Quizresultate überschreiben. Keine Änderung von V5, Migrationen, bestehenden IDs oder Backupformaten.

Antwort und Cursor werden sofort mit der vorhandenen Store-Transaktion gespeichert. Fixture-SHA und Original-ID-Reihenfolge verhindern eine stille Neudeutung alter Antwortindizes. Kaputte/veraltete Zustände werden angezeigt und erst nach bestätigtem Rundenneustart zurückgesetzt. A-Neustart sperrt B erneut, erhält aber dessen Antworten. Eine laufende normale Quizsession bleibt beim Ausflug zu den Testfragen erhalten.

**Bewusste Grenze:** Schließen des Tabs beendet den Session-Teststand. Er ist absichtlich kein Bestandteil persönlicher Exporte und keine freigegebene Produktionspersistenz. Reload/Offline-Reload innerhalb desselben Tabs werden unterstützt. Eine spätere dauerhafte AT-Integration benötigt einen gesonderten Auftrag und Freigabe.

## Ausgeführte Prüfungen

| Prüfung | Ergebnis | Nachweis im QA-Paket |
|---|---|---|
| Contentvalidierung / Quellenabgleich | PASS, 20/20, 16 Permutationen | `final-validate.log`, `final-source-audit.log`, `source-comparison.json` |
| Node-Suite | PASS, **99 Einzeltests in 12 Dateien**; davon 84 bestehend, 15 neu | `final-unit.log`, `baseline-unit-count-confirmed.log` |
| TDD / negative Fälle | Beobachtete RED/GREEN-Läufe | `*-red*.log`, `*-green*.log` |
| Alle vier Runden im echten App-Fluss | PASS, 20 eindeutige angezeigte Original-IDs | `browser/browser-results.json`, `reachability-results.json` |
| Neue Abnahmegruppen | PASS, neun Gruppen | `acceptance/acceptance-results.json` |
| Vorhandene Browser-Suite | PASS, zwölf Gruppen sowohl ausgeschaltet als auch eingeschaltet | `legacy-browser*-results.json` |
| Reader-Rückkehr, Back/Forward, Cursor/Antwort nach Reload | PASS | `acceptance/acceptance-results.json` |
| A/B-Gate, bestätigter Neustart, andere Runde bleibt erhalten | PASS | Unit- und Browserprotokolle |
| Volles/blockiertes SessionStorage, fehlende Fixture, kaputter Fortschritt | PASS, keine falsche Speicherbestätigung | Unit- und Browserprotokolle |
| Persönliche Daten / bestehender Quizstand | PASS im synthetischen Prüfstand | Browserassertionen und bestehende Backup-Suite |
| 320×568, 390×844, 1280×900; 100/200 % Schrift | PASS für die geprüften Fragen, kein horizontaler Überlauf | sechs `axe-*.json`, echte PNGs |
| Tastatur und axe im neuen Quizbereich | PASS; keine gemeldeten Verstöße oder unvollständigen axe-Prüfungen in den sechs Kombinationen | `acceptance/axe-*.json` |
| Reales SW-Update baseline→TEST1→TEST2 auf gleicher lokaler Origin | PASS, Daten/Entwurf/Testfortschritt erhalten | `update/offline-update-results.json` |
| V4→V5 mit Originalsicherung, beide Bibeln offline | PASS | `update/offline-update-results.json` |
| Vorhandener SW-Test: wartendes Update, offener Entwurf, defektes Update/Fallback | PASS, drei Gruppen | `legacy-service-worker-results.json` |
| Zwei gleiche Builds / sämtliche ausgelieferten Dateihashes | gesonderter maschinenlesbarer Nachweis | `reproducible-build.json`, `FINAL_MANIFEST.json` |
| Unabhängiges Code-Review | Keine Critical/Important/Minor-Befunde im isolierten Scope | `INDEPENDENT_REVIEW.md` |
| Physisches iPhone, Safari, installierte PWA, VoiceOver | **OFFEN** | `IPHONE_TEST.md` |
| Vier Themes | **NICHT PRÜFBAR auf dieser Basis** | Nur ein Farbsystem implementiert |
| Eigenständige inhaltlich-theologische Redaktion | **OFFEN** | Keine Textänderung oder Freigabe vorgenommen |

Chromium/Linux ist keine physische Safari-/iPhone-Abnahme. Axe beweist keine vollständige Barrierefreiheit. Screenshots zeigen echte Browseransichten mit synthetischen Daten. Die Galerie verwendet primär Viewport-Aufnahmen: Ganzseiten-Screenshots können fixierte Navigation und außerhalb des Viewports liegende Sprunglinks an irreführenden Dokumentpositionen abbilden. Frühe Funktionsprüfungen blockierten Service Worker gezielt und zeigten deshalb die vorhandene Offline-Fehlermeldung; die finalen visuellen Aufnahmen verwenden echte Service Worker.

Kein Lint-/TypeScript-Script ist auf der Basis eingerichtet; deshalb kein erfundener Lint-/Typprüfungs-PASS. Die bearbeiteten JavaScript-Dateien werden zusätzlich syntaktisch geprüft. Keine Aussage zu Temperatur, Akku oder echter Geräteperformance.

## Reproduzierbarer Build und Schutz

Ohne Schalter bleibt die Funktion aus. Ein normaler Kontrollbuild enthält die Fixture weder als Datei noch im SW-Precache und lädt sie auch nicht. Ein URL-Parameter kann den Schalter nicht aktivieren. Der Testbuilder validiert die Quelldaten vor dem Kopieren und schreibt nur in sein separates Ausgabeziel.

Kanonischer Content-Hash, identisch mit der Baseline:

`812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9`

Fixture-SHA256:

`08ce19855640b47b0419345fb58b29ddca466f1708b1b7bf021bad6691598285`

`candidate-integrity.json` beschreibt ausschließlich den kanonischen Datenbestand. Die zusätzliche Testfixture ist über ihren eigenen SHA und sämtliche Dateihashes in `release-integrity.json` abgesichert. Build-Hash und ZIP-SHA sind verschiedene Werte; beide stehen in der abschließenden Manifestdatei.

`git diff` gegen f02106e bestätigt: kein versionierter Unterschied unter `data/`, an `store.js`, `domain.js`, `runtime-model.js`, `chapter-questions.js` oder am SW-Template. Getracktes `dist`, main, andere Worktrees und bestehende Deployments wurden nicht geändert. Kein Push, Merge oder Deployment.

## Offene Freigabeblocker

Die sechs ursprünglichen Gesamtblocker werden **nicht** kosmetisch aufgelöst:

1. 1KI8: App-Erreichbarkeit/6/6 jetzt für die isolierte Fixture belegt; globale AT-Integration und deren Freigabe bleiben offen.
2. 2KI15: entsprechend nur der Fixture-Nachweis erbracht.
3. NUM17-ED01: unabhängige fachliche Freigabe offen, nicht im Runtime-Testbestand.
4. NUM17-ED02: ebenso gesperrt.
5. Unabhängige Redaktion des gesamten AT-Quellbestands offen.
6. Produktionsimport ausdrücklich nicht erlaubt.

Das vollständige vom gelieferten Altprüfer verlangte **`FaithPath_AT_Importpaket_mit_DEU_TEST_ONLY_2026-11-08.json`** fehlt im Anhang. Der Gesamt-Preflight ist deshalb hier nicht ausführbar. Er wurde weder ersetzt noch auf PASS geändert. Der gelieferte Vorschlag mit historischem `implementation_status: NOT_IMPLEMENTED` bleibt unverändert archiviert; die neue Implementierung wird nur in diesem getrennten Bericht und in den neuen technischen Nachweisen beschrieben.

## Entscheidung und nächster Schritt

**Geeignet für lokale TEST_ONLY-Prüfung. NO-GO für Integration in einen freigegebenen Release-/Produktionszweig und für Produktion.**

Vor einer Weiterführung: menschliche Fachprüfung, iPhone-/Safari-/VoiceOver-Abnahme, vollständiges kanonisches AT-Importbundle und bewusste Auswahl des tatsächlichen Ziel-Appstands. Danach separat planen, wie geprüfte AT-Inhalte und dauerhafter Fortschritt in diesen Zielstand gelangen. Keine pauschalen Branch-Merges.

Rollback dieses Versuchs: Testtab/Test-Origin schließen und Testbuild verwerfen; der unveränderte Ausgangscommit bleibt erhalten. Persönliche Daten oder produktive Backups müssen hierfür nicht migriert werden.
