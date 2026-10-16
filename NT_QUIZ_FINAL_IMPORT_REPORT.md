# NT QUIZ FINAL IMPORT REPORT

Stand: 08.10.2026. Ergebnis: **NT_QUIZ_FINAL_IMPORT_PASS**. Technische lokale Abnahme abgeschlossen; keine redaktionellen Änderungen am freigegebenen Fragenbestand.

## 1. Ausgangsbranch und Commit

`develop/v4`, `f02106e9a15877ec8acb92f444bf62fcbc51c36e`. Der anfangs lokal vorhandene Menüfix-Stand `4465dff` war älter als der anschließend gefetchte Remote-Stand. Die aktuelle Branch-Basis enthält bereits die kanonische Kapitelquiz-Integration in Reader und Sammlung (`FP4-20261005-G-CHAPTER1`); sie wurde deshalb gewählt. Netlify hat für die Site keine Git-Build-Settings, der publizierte Stand ist ein manueller Deploy. Der Site-Deploy liefert somit keinen zuverlässig zugeordneten Git-Ausgangspunkt. Die Netlify-Konfiguration im Repository baut mit `npm run build` nach `dist`.

## 2. Arbeitsbranch und Commits

`content/nt-quiz-final-1300`. Keine Änderungen direkt auf `main` oder `develop/v4`.

- `d3c1ced`: reproduzierbarer Import und Validator.
- `b8b17b6`: Finalmaster-Daten und notwendige Integration.
- `272b2ce372566a92992c86a38f201e206651fa67`: Integritäts-, Touch- und Update-Regression.
- Der folgende Berichtscommit ergänzt ausschließlich diesen Bericht und die Prüfbelege; sein Hash ist über `git log -1` ersichtlich.

## 3. Verwendete Excel-Datei

`FaithPath_Kapitelfragen_NT_FINAL_MASTER_1300.xlsx`, unverändert archiviert unter `reports/nt-quiz-final/`.

SHA256: `ddb5e9c5832a1aa60e5329621c6a0c92002cd1b879177c5b39027344cce5c199`.

Die archivierte Datei ist bytegleich mit dem angehängten Master. Ein Teil der Übergabezellen enthält Formeln zu `FRAGEN_MASTER`. Verwendet werden die im freigegebenen Workbook gespeicherten Werte (`data_only=True`), ohne Formeln neu auszuwerten. Fehlende gespeicherte Formelwerte führen zum Importabbruch.

## 4. Tatsächlich verwendetes Tabellenblatt

Ausschließlich `FAITHPATH_IMPORT`. Andere Blätter bleiben im Originalworkbook für die redaktionelle Rückverfolgbarkeit erhalten. Alle Zeilen haben `qa_status = FREIGEGEBEN`, `approval = FREIGEGEBEN`, `import_ready = JA`.

## 5. Ziel-Datenstruktur

`data/stories.json` bleibt die bestehende gemischte Liste aus 312 Einheiten: 52 Story-Einheiten mit 260 Fragen sowie 260 Kapitelquiz-Einheiten mit 1.300 Fragen. Kein vollständiger Ersatz anderer Inhalte. Das bestehende Fragenmodell bleibt `{q, a, c, ref, x, faithpath_id}`.

Numerische Legacy-Einheits-IDs, Book-/Chapter-Zuordnung, Einheitsmetadaten, Reflexionen, Reihenfolge und Fortschrittsschlüssel bleiben erhalten. Die historischen Einheits-Prüfvermerke werden erhalten; die aktuelle Freigabequelle steht in Manifest und NT-Statusdatei.

## 6. Mapping Excel → FaithPath

| Excel | Bestehendes FaithPath-Feld / Verwendung |
|---|---|
| FP_ID | questions[].faithpath_id, bestehender Ort wird geprüft |
| book_key | bestehende unit.book, unverändert geprüft |
| book_name | gegen kanonischen Buchnamen validiert |
| chapter | Excel 1-basiert = bestehende unit.chapter + 1 |
| question_order | bestehender Fragenindex + 1, exakt 1–5 |
| question | questions[].q |
| option_0–3 | questions[].a, unveränderte Reihenfolge |
| correct_index | questions[].c, weiterhin ZERO-BASED 0–3 |
| correct_answer | exakt gegen a[c] geprüft, im normalisierten Master erhalten |
| reference | questions[].ref, unveränderter Originaltext |
| explanation | questions[].x |
| qa_status / approval / import_ready | Validierung, normalisierter Master und Statusmetadaten |

Es werden keine zusätzlichen UI-Felder, IDs oder Schemas erfunden. Markus/Galater/Epheser/Philipper/Kolosser-Antwortpositionen, FP-1124 und Offenbarungsformulierungen sind vollständig byte-/wertgetreu aus dem Master übernommen.

## 7. Veränderte Dateien

- `data/nt-quiz-status.json`
- `data/stories.json`
- `docs/superpowers/plans/2026-10-08-nt-quiz-final-import.md`
- `package.json`
- `reports/nt-quiz-final/FaithPath_Kapitelfragen_NT_FINAL_MASTER_1300.xlsx`
- `reports/nt-quiz-final/diff.json`
- `reports/nt-quiz-final/manifest.json`
- `reports/nt-quiz-final/master.json`
- `reports/nt-quiz-final/pre-import-nt-quiz-status.json`
- `reports/nt-quiz-final/pre-import-stories.json`
- `requirements-nt-import.txt`
- `scripts/build.mjs`
- `scripts/import-nt-quiz.py`
- `scripts/quiz-reference-ranges.mjs`
- `scripts/validate-content.mjs`
- `scripts/validate-faithpath-materialization.mjs`
- `scripts/validate-nt-quiz.mjs`
- `src/app.js`
- `src/version.js`
- `tests/core.test.mjs`
- `tests/nt-quiz-browser.mjs`
- `tests/nt-quiz-import.test.mjs`
- `tests/nt-quiz-invalid-master.py`
- `tests/nt-quiz-update.mjs`

Hinzu kommen `NT_QUIZ_FINAL_IMPORT_REPORT.md`, `reports/nt-quiz-final/acceptance.json` und `reports/nt-quiz-final/evidence/*` im abschließenden Dokumentationscommit. Generierte `dist`-Dateien werden nicht eingecheckt; Netlify baut aus den Quellen.

## 8. Neue Dateien und reproduzierbarer Import

- `scripts/import-nt-quiz.py`: struktureller Excel-Gate, Referenz-/Versprüfung vor jeder Übernahme, Mapping, Sicherung, atomischer Ersatz je Datei, Diff, Manifest, Wiederholungsprüfung.
- `scripts/validate-nt-quiz.mjs`: unabhängige Node-Prüfung des gesamten finalen Bestands, aller Quell-/Artefakthashes, der genauen Feldwerte und vollständiger Erhaltung anderer Inhalte. Obligatorisch im Build; Netlify braucht dafür kein Python.
- `scripts/quiz-reference-ranges.mjs`: nur technische Auflösung von Mehrfach- und Einkapitelreferenzen; kein Umschreiben von Bibelstellen.
- `requirements-nt-import.txt`: `openpyxl==3.1.5` für lokalen Excel-Import/Tests.
- `tests/nt-quiz-import.test.mjs`, `tests/nt-quiz-invalid-master.py`, `tests/nt-quiz-browser.mjs`, `tests/nt-quiz-update.mjs`.
- `reports/nt-quiz-final/master.json`, `manifest.json`, `diff.json`, unverändertes Workbook und Vorimport-Sicherungen.

Reproduktion:

```bash
npm ci
python3 -m pip install -r requirements-nt-import.txt
npm run import:nt-quiz
npm run validate:nt-quiz
npm test
npm run build
```

`npm test` erzeugt benötigte abgeleitete Referenzdaten automatisch über `pretest`. Für reine Netlify-Builds reicht Node; es wird nicht zur Buildzeit Excel neu interpretiert.

Browser-Reproduktion (Chromium/Playwright installiert):

```bash
PORT=4251 npm run serve
# In einem zweiten Terminal:
npm run test:nt-quiz:browser
node tests/chapter-questions-browser.mjs
npm run test:nt-quiz:update
FAITHPATH_CHROMIUM=/usr/bin/chromium node tests/browser.mjs
FAITHPATH_CHROMIUM=/usr/bin/chromium node tests/service-worker.mjs
```

Der Import bricht bei fremden nachträglichen Änderungen am bereits importierten Datenstand ab. `--check` ist read-only und bestätigt die vollständige Reproduzierbarkeit.

## 9. Anzahl importierter Fragen

**1.300 / 1.300**. 6.151 geänderte Fragefelder sind mit altem/neuem Wert und JSON-Locator in `diff.json` dokumentiert. Bestehende 260 Storyfragen bleiben unverändert; der FaithPath-Quellpool enthält weiterhin insgesamt 1.560 Fragen.

## 10. Bücher

**27 / 27 vollständig**. Keine AT-Inhalte verändert.

| Buch | Kapitel | Fragen | Status |
|---|---:|---:|---|
| Matthäus | 28 | 140 | PASS |
| Markus | 16 | 80 | PASS |
| Lukas | 24 | 120 | PASS |
| Johannes | 21 | 105 | PASS |
| Apostelgeschichte | 28 | 140 | PASS |
| Römer | 16 | 80 | PASS |
| 1. Korinther | 16 | 80 | PASS |
| 2. Korinther | 13 | 65 | PASS |
| Galater | 6 | 30 | PASS |
| Epheser | 6 | 30 | PASS |
| Philipper | 4 | 20 | PASS |
| Kolosser | 4 | 20 | PASS |
| 1. Thessalonicher | 5 | 25 | PASS |
| 2. Thessalonicher | 3 | 15 | PASS |
| 1. Timotheus | 6 | 30 | PASS |
| 2. Timotheus | 4 | 20 | PASS |
| Titus | 3 | 15 | PASS |
| Philemon | 1 | 5 | PASS |
| Hebräer | 13 | 65 | PASS |
| Jakobus | 5 | 25 | PASS |
| 1. Petrus | 5 | 25 | PASS |
| 2. Petrus | 3 | 15 | PASS |
| 1. Johannes | 5 | 25 | PASS |
| 2. Johannes | 1 | 5 | PASS |
| 3. Johannes | 1 | 5 | PASS |
| Judas | 1 | 5 | PASS |
| Offenbarung | 22 | 110 | PASS |

## 11. Kapitel

**260 / 260**, jeweils exakt fünf eindeutige Fragen und die Reihenfolge 1,2,3,4,5. Keine Dublette innerhalb desselben Kapitels. Ähnliche Fragen in parallelen Evangelien werden nicht automatisch verworfen.

## 12. ID-Bereich

**FP-0261 bis FP-1560**, lückenlos, genau 1.300 eindeutige IDs. Keine Änderung an IDs außerhalb dieses Bereichs; keine Änderung an Story-/Nachlese-Mappings.

## 13. Validatoren

Alle PASS:

- Excel-Struktur, alle QA-/Importflags, vier eindeutige Optionen, genau eine über den gültigen Index bestimmte richtige Antwort.
- Python-Wiederholungsprüfung der erzeugten Dateien.
- Node-Gesamtintegrität einschließlich unveränderter Texte, Sonderzeichen, Referenzen und Erklärungen; keine Unicode-/HTML-/Excel-Artefakte.
- Alle angegebenen Einzelverse/Teilbereiche in OTB und Luther 1912 vorhanden; Buch und Kapitel entsprechen dem Masterdatensatz.
- Runtime-Schema: 1.560 FP-Fragen, 2.314 Nachlese-Fragen, 1.300 Kapitelquizfragen, 436 gemeinsame Geschichten.
- Historische Materialisierung: originale Migrations-/Reviewbelege gegen die exakt archivierte Vorimport-Version geprüft; aktueller Bestand zusätzlich unabhängig gegen den neuen Master geprüft. Keine Lockerung alter Freigaben.
- Hashprüfung aller gesperrten Nachlese-/Mapping-/Runtime-/Store-/Style-Dateien ohne Abweichung.

Im Master wurden **keine Datenfehler** festgestellt.

## 14. Build

`npm ci` und `npm run build`: PASS. Build `FP4-20261008-G-NTFINAL1`, 314 Artefakte. Auch der separate Preview-Build unter `qa-output/nt-quiz-final/preview-build` besteht.

Content-Hash: `5f7516623d451e3edefe16f1b61ce4f0f100aa9d419519b2ce75d0d13184686c`.
Build-Hash: `0d495156102f9317100e12d550601cea5141a265933264f423234fee516a4fd5`.

Keine neuen Build-Warnings durch den Import. Die zwölf bestehenden Ganzkapitel-Sentinel-Hinweise der alten Story-Einheiten bleiben unverändert dokumentiert.

## 15. Tests

`npm test`: **87 PASS, 0 FAIL**. Neue Import-Tests: 3/3 PASS, einschließlich 16 fehlerhafter Strukturvarianten, vier ungültiger Referenzvarianten, acht ungültiger Dateiimporte ohne Datenübernahme und Schutz fremder nachträglicher Änderungen.

Der unabhängige Review fand zwei Fehlerfälle im Importer: Referenzen mussten vor dem Schreiben vollständig geprüft werden; fehlende Formel-Caches mussten sauber als Validierungsfehler behandelt werden. Beide sind behoben und unabhängig erneut mit 3/3 bestandenen Tests geprüft. Keine verbleibenden Review-Blocker.

## 16. App-Smoke-Test

PASS: 12 bestehende App-Flows, 17 Kapitelquiz-Integrationsprüfungen und 24 gezielte NT-Browserprüfungen. 90 unterschiedliche finale Fragen wurden im echten Browser mit exakter Anzeige, allen vier Optionen, richtigen und falschen Antworten, Feedback, Referenz, Erklärung und Kapitelabschluss geprüft. Zusätzlich sind alle 1.300 Fragen automatisiert vollständig validiert.

Geforderte Bücher: Matthäus, Markus, Johannes, Römer, 1. Korinther, Galater, Epheser, 1. Thessalonicher, Hebräer, Jakobus, 1. Johannes und Offenbarung: PASS. Alle 27 Buchsammlungen und ihre Kapitel-/Einheitszuordnungen wurden geprüft.

Pflicht-IDs FP-0261, FP-0401, FP-1071, FP-1124, FP-1171, FP-1281, FP-1451, FP-1560: PASS.

Reader → Kapitelquiz, Sammlung → Buch → Kapitel → Quiz, fünf Fragen, Kapitelabschluss, Zurücknavigation, Reload und erneutes Öffnen: PASS. Bestehende App verwendet Kapitelabschluss-Zeitstempel, keine neu eingeführte Punktzahl. Fortschritt bleibt am bisherigen numerischen Einheits-ID-Schlüssel; vorhandene Metadaten bleiben erhalten.

Kernregression: Weg speichern, Journal speichern/suchen, Bibel markieren, Übersetzung wechseln, Backup Export/Import, Geführte Wege, Rückblicke, Deep Links und Offline-Nutzung: PASS. Keine Console Errors, Page Errors oder unhandled promise rejections im gezielten NT-Test.

## 17. Mobiler Test

PASS mit Chromium und echten Playwright-Tap-Events, `hasTouch=true`, `isMobile=true`, aktiver Service Worker, u. a. 390×844. Lange Originalfragen/-optionen/-erklärungen zusätzlich bei 320×568, 430×932 und 390×844 mit 200 % Schriftgröße. Kein horizontaler Seiten-/Antwort-Overflow; mindestens 44 px Antwort-Touchhöhe. Scrollen, Umbruch, sichtbare Antworten, Erklärungen und Buttons bleiben funktionsfähig.

Fokus nach Feedback, Tastaturbedienung und Reduced Motion bestehen. Axe-Prüfungen der getesteten Ansichten ohne Verstöße in den geprüften Regelsätzen; keine WCAG-Zertifizierung behauptet. Die App besitzt keine gesonderte Dark-Mode-Funktion; die vorhandene Darstellung und Styles bleiben unverändert. Stichproben-Screenshots unter `reports/nt-quiz-final/evidence/`.

## 18. Cache-/PWA-Test

PASS. Cache-Version über bestehenden BUILD-Mechanismus erhöht; Service-Worker-Algorithmus unverändert.

Tatsächlicher Vorimport-Build `FP4-20261005-G-CHAPTER1` → `FP4-20261008-G-NTFINAL1` an derselben Origin: alte Version bleibt kohärent, bis das sichtbare Update aktiviert wird; danach zeigt FP-0261 den neuen Mastertext. Sämtliche aus dem aktiven Cache geladenen Daten entsprechen exakt dem finalen `stories.json`. Persönlicher Datenstand bleibt bytegleich, Entwurf bleibt erhalten, vorhandener Kapitel-Fortschritt bleibt sichtbar. Offenbarung 22 mit FP-1560 funktioniert nach Offline-Reload.

Bestehende PWA-Suite zusätzlich 3/3 PASS: Migration, wartendes Update/Entwurf, fehlerhaftes Update mit Rückfall auf vollständigen Cache.

## 19. Offene Fehler

Keine offenen technischen Importfehler. Keine fehlenden Fragen, Kapitel, Bücher, Referenzen oder Erklärungen. Kein zusätzlicher UI-Bugfix oder Umbau erforderlich.

## 20. Risiken und Grenzen

Der Browsernachweis erfolgt lokal am tatsächlich gebauten Bundle mit echten Touch-Events in Chromium; kein physisches iPhone und kein Safari-Gerätetest. Ein gehosteter Netlify-Live-Test dieses neuen Importstands wurde nicht ausgeführt. Es wurde keine neue theologische/redaktionelle Prüfung durchgeführt; die Nutzerfreigabe des Masters ist maßgeblich. Formeln werden nicht neu berechnet; eine künftig redaktionell geänderte Excel-Datei muss ihre gespeicherten Werte aktualisieren und erneut alle Gates bestehen.

Der vorhandene Updateprozess aktiviert neue Daten nach dem vorgesehenen Update-Tap; er erzwingt keine Unterbrechung offener persönlicher Eingaben.

## 21. Netlify Preview

**Technisch bereit: JA.** `netlify.toml` baut den validierten Quellstand mit Node nach `dist`; keine Python-Abhängigkeit im Netlify-Build, keine fehlenden Module. Separater lokaler Preview-Build besteht. Kein neuer Netlify-Deploy wurde für diesen Import ausgelöst.

## 22. Production

**Technisch geeignet: JA**, alle geforderten lokalen Acceptance-Checks bestehen. Keine Production-Veröffentlichung, kein Merge nach `main`, kein Release-Tag. Gehostete Preview-/Geräte-Abnahme kann vor der tatsächlichen Veröffentlichung zusätzlich erfolgen; sie ist nicht als bereits durchgeführt ausgewiesen.

## Finaler Acceptance Check

| PASS | Anforderung | Ergebnis |
|---:|---|---|
| 1 | 1.300 / 1.300 Fragen vorhanden | PASS |
| 2 | FP-0261 bis FP-1560 lückenlos | PASS |
| 3 | 260 / 260 Kapitel | PASS |
| 4 | 27 / 27 NT-Bücher | PASS |
| 5 | Exakt 5 Fragen je Kapitel | PASS |
| 6 | Alle correctIndex gültig und unverändert aus Master | PASS |
| 7 | Alle richtigen Antworten stimmen mit correctIndex überein | PASS |
| 8 | Alle Referenzen vorhanden und Verse validiert | PASS |
| 9 | Alle Erklärungen vorhanden | PASS |
| 10 | Build erfolgreich | PASS |
| 11 | Quizflow funktionsfähig | PASS |
| 12 | FaithPath-Kernfunktionen erhalten | PASS |
| 13 | Keine Console-/Runtime-Fehler durch Import | PASS |
| 14 | Preview technisch deploybar | PASS |

Maschinenlesbare Gesamtprüfung: `reports/nt-quiz-final/acceptance.json`. Einzelne Rohbelege: `reports/nt-quiz-final/evidence/`.
