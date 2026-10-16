# FaithPath – finale NT-Fragenintegration auf STABLE1

Stand: 16. Oktober 2026.

## Ergebnis und Entscheidung

**GO für die abgeschlossene NT-Integration und die weitere Preview-/Geräteabnahme.**
**NO-GO für eine Produktionsfreigabe vor erfolgreichem Hosted- und iPhone-Gate.**

Alle **1.300 freigegebenen NT-Kapitelquizfragen** sind vollständig und feldgetreu
auf STABLE1 übernommen. Keine Frage wurde neu formuliert. IDs, Einheitsreihenfolge,
Buch-/Kapitelzuordnung und Fortschrittsschlüssel bleiben erhalten. Die lokalen
Funktions-, Daten-, Offline- und Updateprüfungen bestehen; zwei unabhängige Builds
sind über sämtliche 321 Dateien bytegleich.

**AT bleibt zurückgestellt.** In den verfügbaren Quellen wurde kein separat
freigegebener AT-Kapitelquiz-Master samt zugehöriger Übergabe-/Prüfarbeitsmappe
gefunden. Die NT-Integration ist davon unabhängig abgeschlossen. Vorhandene
AT-Anteile in Story- und Nachlesebeständen bleiben unverändert und werden nicht
als neu integrierter finaler AT-Kapitelbestand ausgegeben.

Kein Merge nach `main`, keine Netlify-Veröffentlichung, keine Änderung an
Produktionszugriffskontrollen und keine echten Nutzerdaten in den Tests.

## Branches und nachgewiesene Quellen

| Zweck | Branch / Commit |
|---|---|
| Stabile Basis | `fix/production-stabilization-20261015` · `6ce37acf164f3e048b5446f115d918274c789f25` |
| Freigegebene NT-Quelle | `content/nt-quiz-final-1300` · `3a2eb1809a329f96e2764f4aeb8bae3620d32be4` |
| Neuer Arbeitsbranch | `integration/quiz-final-on-stable1` |
| Implementierung und geprüfte Laufzeitdaten | `a8389dfd2bd111c1472d657c8aac055662c03c07` |
| `main`, unverändert | `d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3` |

Ein anschließender Dokumentationscommit ergänzt diesen Bericht und die neuen
Prüfbelege, ohne den Kandidaten zu verändern. Der Branch wurde in einem separaten
Worktree unter `/workspace/Faithpath-quiz-final` aus der stabilen Basis erstellt.
Der bisherige QA-Arbeitsstand blieb im ursprünglichen Checkout erhalten.

Verwendete Excel-Datei:
`reports/nt-quiz-final/FaithPath_Kapitelfragen_NT_FINAL_MASTER_1300.xlsx`.

SHA-256:
`ddb5e9c5832a1aa60e5329621c6a0c92002cd1b879177c5b39027344cce5c199`.

Das Originalworkbook wurde unverändert übernommen. Ausschließlich das Blatt
`FAITHPATH_IMPORT` steuert den Import. Seine 1.300 gespeicherten Zeilenwerte wurden
erneut mit dem archivierten JSON-Master und allen übernommenen Laufzeitfeldern
verglichen: **vollständige Übereinstimmung**. Alle Zeilen tragen
`qa_status=FREIGEGEBEN`, `approval=FREIGEGEBEN`, `import_ready=JA`.

Formeln wurden nicht neu ausgewertet. Das Workbook enthält gespeicherte
Formelergebnisse; fehlende Cachewerte führen zum Importabbruch. Die technische
Prüfung ist keine zusätzliche redaktionelle oder theologische Bearbeitung.

Der ursprüngliche `NT_QUIZ_FINAL_IMPORT_REPORT.md`, das Workbook und dessen
`reports/nt-quiz-final/*` wurden aus dem freigegebenen Quellbranch übernommen.
Dieser Bericht vom 8. Oktober einschließlich seiner alten Testbelege beschreibt
den damaligen Import auf `develop/v4`, **nicht** die aktuelle STABLE1-Abnahme.
Insbesondere gilt seine Aussage zur fehlenden Dunkeldarstellung nicht für
STABLE1. Die vorhandenen vier Themen bleiben erhalten. Neue Nachweise dieser
Integration liegen ausschließlich unter `reports/quiz-final-stable1/`.

## Bestandsvergleich vor und nach der Integration

Vorher waren **0 von 1.300** Fragen in allen finalen Feldern identisch mit dem
Master. Die entsprechenden alten IDs existierten bereits; es fehlte die finale
Fassung, nicht der technische Fragenplatz. Nachher sind **1.300 von 1.300** exakt
übernommen.

| Bestehendes Feld | Änderungen gegenüber STABLE1 |
|---|---:|
| Frage `q` | 1.300 |
| Antwortarray `a`, Reihenfolge unverändert aus dem Master | 1.300 |
| Richtiger Index `c` | 989 |
| Bibelreferenz `ref` | 1.262 |
| Erklärung `x` | 1.300 |
| Summe der geänderten Feldgruppen | **6.151** |

Die 989 Indexänderungen sind genau die bereits freigegebenen Antwortpositionen
des Masters; es wurden keine neuen inhaltlichen Entscheidungen getroffen.
Jede Frage hat vier eindeutige, nicht leere Optionen, einen ganzzahligen Index
0–3 und `a[c]` entspricht exakt dem freigegebenen `correct_answer`.

Erhalten bleiben:

- FP-0261 bis FP-1560: lückenlos und genau einmal vorhanden.
- 27 NT-Bücher, 260 Kapitel, fünf Fragen je Kapitel in ursprünglicher Reihenfolge.
- Numerische Kapitelquiz-Einheits-IDs **10000 bis 10259**, unverändert.
- 52 Story-Einheiten mit 260 Fragen; deren Objekte sind vollständig unverändert.
- 2.314 Nachlese-Fragen, Story-/Nachlese-Mapping und gemeinsamer Ablauf.
- Speicherformat V5, Journal-/Reflexionsverknüpfungen, lokale Backups, Migrationen,
  Markierungen, Wege und sämtliche STABLE1-Schutzkorrekturen.

Keine zusätzliche Einheit oder Fragen-ID wurde angelegt. Es gibt keine doppelten
FP-IDs und keine doppelte Frage innerhalb eines Kapitels. Freigegebene Ähnlichkeiten
zwischen unterschiedlichen Bibelkapiteln wurden nicht redaktionell verändert.

Die unabhängige Prüfung bestätigt alle Buchnamen, Buchcodes, Kapitel und
Fragenpositionen direkt gegen Excel. Referenzen einschließlich Mehrfachbereichen
und Einkapitelbüchern werden technisch in OTB und Luther 1912 validiert, dabei
aber unverändert als Originaltext gespeichert und angezeigt.

## Gezielte Änderungen, kein Branch-Merge

Es gab keinen pauschalen Merge des Content-Branches. Der vorhandene geprüfte
Importer erzeugt ausschließlich die finalen Fragefelder und NT-Quellenmetadaten.
Die übrigen Änderungen sind:

- Build-/Content-Validierung erhält den unabhängigen Master-Validator und die
  technische Referenzauflösung. Der Build bricht bei Master-Abweichungen ab.
- Historische Materialisierungsnachweise prüfen weiterhin ihren exakt archivierten
  Vorimportstand; zusätzlich wird der aktuelle Bestand gegen den neuen Master
  geprüft. Alte Freigaben werden nicht durch eine breitere Änderungsfreigabe ersetzt.
- Zwei Prüfstatus-Texte in `src/app.js` benennen die tatsächliche NT-Freigabequelle.
  Die übrige Datei bleibt erhalten; insbesondere bleiben Entwurfs-, Import- und
  Wegschutz aus STABLE1 unverändert.
- Neue Build-ID; unveränderter Service-Worker-Algorithmus und Cachemechanismus.
- Import-/Regressionstests, reproduzierbare Quellen, Nachweise und Dokumentation.
  Das bestehende Worker-Testskript akzeptiert nun wie die Kernsuite einen
  separaten Kandidatenordner, statt alte eingecheckte `dist`-Dateien zu testen.

**191 geschützte Dateien** wurden gegen STABLE1 byteweise verglichen:
keine Abweichung. Dazu gehören Speicherlogik, Importvalidierung, Entwurfsmodul,
Journaltransaktionen, Domainlogik, Nachlese-/Mappingdaten, Bibeln, Styles, Bilder,
Darstellungsmodule, Paket-Lockdatei und Netlify-Konfiguration.

Die angepassten Daten-JSON-Dateien sind ausschließlich `stories.json`,
`nt-quiz-status.json` und der abgeleitete `content-report.json`.
`data/reference-index.json` bleibt bytegleich. Es gibt keinen Frameworkwechsel,
keine neue Runtime-Abhängigkeit und keine Nutzerdatenmigration. `openpyxl==3.1.5`
ist nur für den bereits freigegebenen lokalen Import und seine Tests erforderlich;
der Build selbst bleibt Node-basiert.

## Fortschritt, Export/Import und Update

Die Quizabschlüsse liegen weiterhin unter denselben numerischen Einheits-IDs
im bestehenden `quiz`-Objekt. Die Anwendung persistiert dabei Abschlussstatus
und Metadaten; es wurde kein neues Fortschrittsformat eingeführt.

Der neue Update-Test baut STABLE1 aus dem tatsächlichen Basiscommit und bestätigt
dessen bekannten Build-Hash. Auf **derselben lokalen Origin** wird dieser echte
Build zuerst mit allen 260 Kapitelabschlüssen, einem Storyabschluss, zusätzlichen
Metadaten, Markierung, Weg, Journal, Entwurf und älterer Schema-V3-Ausgangslage
gestartet. STABLE1 migriert diese Ausgangsdaten zunächst regulär auf V5.

Danach wird der neue Kandidat bereitgestellt. Bis zur ausdrücklichen Aktivierung
bleibt der bisherige Datenstand erhalten. Nach „Jetzt aktualisieren“ sind
Hauptspeicher, Entwurf und Migrationssicherung **bytegleich** zum Snapshot vor dem
Wechsel. Sämtliche 1.300 finalen Fragen werden anschließend auch bei abgeschaltetem
Netzwerk vollständig mit dem freigegebenen Datenbestand verglichen.

Offline funktionieren Reload, Wiederaufnahme und Speicherung des alten Entwurfs
sowie das vollständige letzte Offenbarungskapitel. Alle bisherigen Fortschritts-
schlüssel und Zusatzmetadaten bleiben erhalten. Beim erneuten Abschließen darf
der Abschlusszeitpunkt dieses einen Quiz aktualisiert werden; andere Metadaten
werden dadurch nicht verworfen. Vorhandene Abschlüsse müssen nicht neu gespielt werden.

Die Browserprüfungen decken zusätzlich den normalen Backup-Export, die Import-
vorschau, Wiederherstellung, Fortschritt nach Reload und die Ablehnung beschädigter
Importdateien ohne Daten-/Entwurfsänderung ab.

## Neu ausgeführte Qualitätssicherung

Alle folgenden PASS-Ergebnisse wurden für diesen Kandidaten erneut ausgeführt.
Browser: Chromium unter Linux mit Playwright; ausschließlich synthetische Daten.

| Prüfung | Ergebnis |
|---|---|
| Saubere STABLE1-Basis, `npm test` | 108/108 laut Node-Runner |
| Gesamtsuite nach Integration | **111/111**, 0 Fehler |
| Excel → JSON → Laufzeitfelder, alle 1.300 Fragen | PASS |
| Importerneutprüfung, Referenzen und Quellhashes | PASS |
| Ungültige Mastervarianten und Schutz fremder Änderungen | PASS; 16 Struktur-, 4 Referenzfälle, 8 fehlschlagende Dateiimporte ohne Datenübernahme |
| Runtime-Schema | PASS: 1.560 FP-, 2.314 Nachlese-, 1.300 Kapitelquizfragen, 436 gemeinsame Geschichten |
| Historische Materialisierung plus aktueller Finalmaster | PASS |
| Zentrale Nutzerabläufe | **12/12** |
| Bestehende Stabilisierung-Browserregression | **12/12** |
| Reader/Sammlung/Kapitelquiz | **17/17** |
| Gezielte finale NT-Browserprüfungen | **24/24**, 90 verschiedene Fragen |
| STABLE1 → neuer Kandidat | **4/4 Kontrollpunkte** |
| Bestehender POLISH1 → Kandidat-Stabilisierungstest | **3/3 Kontrollpunkte** |
| Bestehende Worker-Migration, wartendes Update, defektes Update/Fallback | **3/3** |
| Zwei vollständige Builds, 321 Dateien bytegleich | PASS |

Die NT-Browserprüfungen vergleichen Originalfrage, vier Optionen, richtige und
falsche Auswahl, Feedback, Referenz, Erklärung und Kapitelabschluss. Enthalten
sind die Pflicht-IDs FP-0261, FP-0401, FP-1071, FP-1124, FP-1171, FP-1281,
FP-1451 und FP-1560 sowie die verlangten zwölf Buchstichproben. Alle 27
Buchsammlungen und ihre Kapitel-/Einheitszuordnungen werden zusätzlich geprüft.

Reader-Einstieg, Sammlungs-Einstieg, Zurücknavigation, direkte und historische
Routen, Export/Import, Fortschritt nach Reload, Offline-Reader und Offline-Quiz
bestehen. Die lange Originalfassung wurde bei 320×568, 430×932 und 390×844 mit
200 % Schriftgröße geprüft; die Kapitel-Suite ergänzt 390×844 bei normaler Größe,
weitere Viewports und 200 %-Text. Antwort-Touchhöhe mindestens 44 CSS-Pixel,
kein horizontaler Seiten-/Antwortüberlauf in den geprüften Fällen.

Tastatur, Fokus nach Feedback, Reduced Motion und ausgewählte axe-Prüfungen
bestehen. Die ausgewerteten Läufe melden keine unbehandelten JS-Fehler;
der gezielte NT-Lauf außerdem keine Console Errors, unhandled Rejections oder
HTTP-Fehler. Kein umfassender WCAG- oder VoiceOver-Nachweis wird daraus abgeleitet.

## Reproduzierbarer Kandidatenbuild

Build-ID: **`FP4-20261016-G-STABLE1-NTFINAL1`**.

Content-Hash:
`5f7516623d451e3edefe16f1b61ce4f0f100aa9d419519b2ce75d0d13184686c`.

Build-Hash:
`9cf11e6834d2cfbd065c3cdfb78f213f2e76dc302a2daaae707f0267ba8d3a38`.

Der Content-Hash entspricht exakt dem freigegebenen NT-Content-Branch. Der
Build-Hash unterscheidet sich erwartbar: STABLE1-Funktionen und neue Release-ID
bilden die Laufzeitbasis. Beide unabhängigen Builds erzeugen dieselben **321
Artefaktdateien**. Das Release-Manifest hasht 320 Dateien und wird selbst als
321. Datei separat mit den übrigen Artefakten auf Bytegleichheit geprüft.

```sh
npm ci
python3 -m pip install -r requirements-nt-import.txt
npm run validate:nt-quiz
npm test
FAITHPATH_OUT=qa-output/quiz-final/build-a \
FAITHPATH_BUILD_BRANCH=integration/quiz-final-on-stable1 npm run build
FAITHPATH_OUT=qa-output/quiz-final/build-b \
FAITHPATH_BUILD_BRANCH=integration/quiz-final-on-stable1 npm run build
```

`npm run import:nt-quiz` reproduziert bei Bedarf die Daten aus dem unveränderten
Workbook. `--check` schreibt nichts. Die Bytegleichheit beider Builds und die
vollständigen Prüfsummen stehen in den neuen Belegen.

## Fehlende Quellen und verbleibende Risiken

| Bereich | Stand / Konsequenz |
|---|---|
| NT-Freigabedaten | Vollständig vorhanden, keine fehlende Frage oder Quelle |
| Finaler AT-Kapitelquiz-Master | Nicht gefunden; keine AT-Ergänzung vorgenommen |
| Zugehörige finale AT-Prüf-/Übergabearbeitsmappe mit Kapitel-/ID-Zuordnung | Nicht gefunden; separat nachzuliefern |
| Nachlese-Arbeitsmappen | Vorhanden und erhalten; keine Ersatzquelle für einen AT-Kapitelimport |
| Gehostete Preview, Netlify-CDN/HTTPS-Update | **OFFEN**, in dieser Phase ausdrücklich nicht veröffentlicht |
| Physisches iPhone Safari / installierte PWA | **OFFEN**, vorhandenes Geräte-Gate bleibt verbindlich |
| Reale iOS-Tastatur, Safe Areas, VoiceOver, Rückkehr nach Tagen | **OFFEN**, durch lokale Chromium-Prüfungen nicht ersetzt |

Die AT-Suche umfasst die veröffentlichten Git-Branchstände, verfügbare
Git-Historie mit Arbeitsmappen, die Transfer-ZIPs auf `main`, vorhandene
Repository-Arbeitsmappen und zugängliche Workspace-Dateien. Die drei vorhandenen
Nachlese-/Mapping-Arbeitsmappen und ihre Blätter sind inventarisiert. Auch der
historische FP-0001–1560-Prüfkatalog ist kein neuer AT-Kapitelquiz-Master. Es wird
nicht behauptet, dass außerhalb dieser verfügbaren Quellen kein AT-Master existiert.

Es gibt **keinen nachgewiesenen offenen technischen Integrationsblocker** in
den ausgeführten Szenarien. Die offenen Geräte-/Hosting-Gates sind keine PASS-
Ergebnisse. Deshalb lautet der Status **bereit für Preview- und Echtgeräteprüfung**,
nicht produktiv freigegeben. Der frühere Geräteplan für STABLE1 kann als Vorlage
dienen, muss für diesen Kandidaten aber Ausgangsbuild, Zielbuild und Hashes aus
diesem Bericht verwenden.

## Belege und nächste Schritte

Neue Belege: `reports/quiz-final-stable1/`. Dort liegen Quellvergleich,
AT-Suchinventar, Hash-/ID-/Dateischutzprüfung, Builds, frische Testprotokolle und
ausgewählte Screenshots. Historische Belege unter `reports/nt-quiz-final/` werden
ausdrücklich getrennt aufbewahrt.

Das Berichtspaket enthält zusätzlich das lokal erzeugte
`FaithPath_STABLE1_NTFINAL1_QA_2026-10-16.zip`. Alle 321 Dateien darin wurden
nach dem Packen erneut byteweise mit dem geprüften Build verglichen. Größe und
ZIP-SHA-256 stehen in `reports/quiz-final-stable1/candidate-package.json`.
Das Bereitstellen dieser Datei ist kein Netlify-Deploy und keine Produktionsfreigabe.

Nächster sinnvoller Schritt ist die isolierte Preview-/Geräteabnahme dieses
Commits: zunächst STABLE1 auf einer festen Test-Origin installieren, dann diesen
Kandidaten vorwärts bereitstellen, Remote-Hashes prüfen und denselben Update-
und Datenvergleich auf Safari sowie der installierten iPhone-PWA durchführen.
Dieser Bericht autorisiert und startet keinen solchen Deploy. Fragen, Design
und neue Funktionen müssen dafür nicht erneut bearbeitet werden.
