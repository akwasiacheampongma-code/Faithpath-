# FaithPath – aktive Geschichtenfragen als Multiple Choice

Stand: 16.10.2026 · Keine Produktionsveröffentlichung

## Ergebnis

Auf dem stabilisierten Entwicklungsstand wurden ausschließlich vorhandene,
tatsächlich angezeigte Nachlese-Wissens- und Verständnisfragen bearbeitet.
**2.258 Fragen besitzen jetzt vier antippbare Antwortoptionen. 56 bleiben mit
Einzelbegründung zur manuellen Entscheidung zurückgestellt.** Alle 2.314 aktiven
N-Fragen wurden geprüft. Es erfolgte keine erneute Zusammenführung und kein Import
alter Nachlese-Datensätze.

| Geforderte Bestandszahl | Ergebnis |
| --- | ---: |
| Aktive Nachlese-Wissens-/Verständnisfragen insgesamt | 2.314 |
| Ausgenommene, separat gespeicherte Nachlese-Reflexionsfragen | 435 |
| Reflexionsfragen innerhalb der 2.314 N-Fragedatensätze | 0 |
| Bereits vollständige Nachlese-MC-Fragen am Ausgangsstand | 0 |
| Ergänzte Nachlese-MC-Fragen | 2.258 |
| Unklare bzw. für vier Optionen ungeeignete Originalfragen zur Entscheidung | 56 |

Für den **gesamten angezeigten Geschichtenablauf** gilt: 436 Geschichten,
2.479 Fragen = 2.314 N-Fragen + 165 bereits vollständige FaithPath-MC-Fragen.
95 weitere FaithPath-Fragen sind bestehende deduplizierte Aliase und werden nicht
zusätzlich angezeigt. Nach der Ergänzung sind 2.423 angezeigte Geschichtenfragen
als MC verfügbar; 56 behalten die bisherige Antwortaufdeckung. Die 436 aktiven
Reflexionsaufforderungen, davon 435 Nachlese und eine FaithPath, bleiben unverändert.

## Branch und tatsächlich geprüfter Stand

- Repository: `akwasiacheampongma-code/Faithpath-`
- Neuer Branch: `content/nachlese-multiple-choice-20261016`
- Basis: `integration/quiz-final-on-stable1`, Commit
  `6f96ec8be376af3b0de03094a5052ae909054658`
- Geprüfter Implementierungscommit:
  `e90b41d91bfd7eb113b104898316590ae1c2243a`
- Neue Build-ID: `FP4-20261016-G-STABLE1-NMC1`
- Der nachfolgende Abschlusscommit ergänzt ausschließlich Dokumentation und
  Commitzuordnung der Testnachweise. Sein vollständiger HEAD steht im
  Auslieferungsprotokoll des ZIP. Der veröffentlichbare App-Inhalt ist identisch.
  Der Abschlusscommit trägt `[skip netlify]`, um auch einen etwaigen automatischen
  Netlify-Build durch die Git-Anbindung zu überspringen.
- `main` und der Produktionsstand wurden nicht verändert. Kein Merge, kein
  Netlify-Deploy, keine Migration persönlicher Daten. Es gibt keine neue
  öffentliche Preview-URL dieses Kandidaten.

Die Basis enthält die STABLE1-Korrekturen und den freigegebenen NT-Finalbestand.
Es wurden keine anderen Branches pauschal übernommen.

## Aktive Datenquelle und Geschichtenzuordnung

Der Nachweis folgt dem tatsächlich ausgeführten Rendering:

1. `discoveryItems()` verwendet den vorhandenen gemeinsamen Geschichtenablauf.
2. `mergedStory()` zeigt die `primary_question_id` jedes `flow_items` aus
   `data/faithpath-nachlese-story-flow.json` an.
3. `sourceQuestion()` löst diese ID über das Laufzeitmodell in
   `data/nachlese-questions.json` beziehungsweise `data/stories.json` auf.

Alle 2.314 N-IDs sind eindeutige Primärfragen im aktiven Ablauf. Ihre
`source_story_id` stimmt jeweils mit der bestehenden Geschichte überein. Die
95 ausgeblendeten Doppelzuordnungen betreffen FaithPath-Aliase, keine zusätzlichen
Nachlese-Fragen. Kapitelquizfragen gehören weiterhin zu ihrem eigenen Bestand.

Die vollständige Liste aller 2.479 aktiven Primärfragen, zugehöriger Geschichten,
Alias-IDs und des bisherigen MC-Status steht in
[`active-inventory.json`](../reports/nachlese-mc/active-inventory.json).
Die Quelldatei des bereits integrierten Nachlese-Bestands vor Ergänzung ist als
`baseline-active-questions.json` gesichert; sie ist ausschließlich ein Prüfnachweis.

## Umfang der Änderungen und Schutz bestehender Inhalte

Bei den 2.258 geeigneten N-Fragen wurden ausschließlich `a` mit vier Optionen und
`c` mit einem nullbasierten Lösungsindex ergänzt. Die richtige Option entspricht
**zeichengetreu** der bereits vorhandenen `answer`. Frage, N-ID, Originalantwort,
Referenz, strukturierte Bibelzuordnung, Geschichte, Reihenfolge und Provenienz
bleiben bei sämtlichen 2.314 Datensätzen unverändert. Auch die 56 zurückgestellten
Datensätze besitzen keinerlei inhaltliche Änderung.

Die Oberfläche verwendet die vorhandenen FaithPath-Antwortbuttons einschließlich
Falsch-/Richtig-Rückmeldung und Fokusführung. Bei Nachlese bleibt die bisherige
Originalantwort auch der Rückmeldungstext. Bestehende FaithPath-Erklärungen bleiben
erhalten. Zurückgestellte Fragen bieten weiterhin „Antwort ansehen“ an.

**Bytegleich zur Basis** bleiben unter anderem:

- der komplette gemeinsame Geschichtenablauf und die 435 Nachlese-Geschichten;
- `data/stories.json` einschließlich aller 1.300 finalen NT-Kapitelquizfragen;
- alle Offline-Bibeltexte und der vorhandene Inhaltsindex;
- Speicher-, Importvalidierungs-, Entwurfs-, Journal- und Fortschrittsmodule;
- Stylesheet und Dependency-Lockdatei.

Das bestehende Inhaltsformat mit Schemaversion 1 bleibt bestehen; die MC-Felder
sind optional. Das Nutzerdatenschema wurde nicht geändert. Antworten auf einzelne
Geschichtenfragen werden wie bisher nur während der Sitzung angezeigt. Es wurden
keine neuen persistenten Fortschrittsschlüssel, Punkte oder Glaubensbewertungen
eingeführt.

## Vollständige Qualitätskontrolle

Jede aktive N-Frage erhielt einen Antwortentwurf beziehungsweise eine begründete
Zurückstellung und eine gesonderte modellgestützte Einzelprüfung. Zusätzliche
Prüfrunden behandelten sinngleiche falsche Optionen, Negationsfragen und
mehrdeutige Antworten. Die Belege verwenden die bereits vorhandenen Offline-Bibeln
und gegebenenfalls deren unmittelbaren Kontext oder dokumentierte Parallelstellen.
Die Originalreferenzen der Fragen werden dadurch nicht verändert.

Der Validator prüft für jeden übernommenen Satz vier nichtleere, auch nach
Normalisierung verschiedene Optionen, genau einen gültigen Lösungsindex,
unveränderte Originalantwort sowie einen Richtig- und drei Falschbelege. Alle
9.032 hinterlegten Belegzuordnungen enthalten überprüfte wörtliche Bibelzitate.
Die gesonderte Einzelprüfung beurteilt die inhaltliche Falschheit und Plausibilität;
der technische Zitatvergleich allein kann das nicht beweisen.

Dies ist **keine menschliche Redaktionsfreigabe** der neuen Antwortoptionen.
Modellgestützte Inhaltsentscheidungen können trotz Gegenprüfung fehlerhaft sein.
Die Freigabe des bestehenden NT-Masters wird davon nicht berührt.

Nachvollziehbare Dateien unter `reports/nachlese-mc/`:

- `question-review.csv`: sämtliche aktiven N-Fragen mit Optionen, Status und Grund;
- `manual-decisions.json`: vollständige Liste der 56 offenen Entscheidungen;
- `authored.jsonl`: ursprüngliche Entwürfe, einschließlich verworfener Vorschläge;
- `reviews.jsonl`: Einzelprüfungen, gebunden an den SHA-256 des jeweiligen Entwurfs;
- `master.json`: maßgebliche Ergebnisse; nur `ready` wurde übernommen;
- `manifest.json`: Abschlusszahlen und SHA-256-Nachweise;
- `test-results.json` und `qa/`: konsolidierte und einzelne Testergebnisse.

`REPLACE` im Prüfprotokoll bezeichnet ausschließlich einen verworfenen
**Antwortentwurf**, niemals das Ersetzen einer bestehenden Frage. Die Entwicklung
hat keine vorhandenen Geschichten erneut zusammengeführt.

## Tests am gebauten Kandidaten

| Prüfung | Selbst ausgeführtes Ergebnis |
| --- | --- |
| Node-Tests einschließlich bestehender Stabilisierung | 119 bestanden, 0 Fehler, 0 übersprungen |
| Kernfunktionen im Browser | 12 bestanden |
| Stabilisierung: Journal, Reflexion, Entwürfe, Wege, Import | 12 bestanden |
| Kapitelquiz: Reader, Sammlung, Tastatur, Offline | 17 bestanden |
| NT-Finalbestand im Browser | 24 bestanden; 90 unterschiedliche Fragen |
| Tatsächlicher Nachlese-Bestand im Browser | 36 bestanden; 16 verschiedene MC-Fragen jeweils bei zwei Größen |
| Isolierte MC-/Export-/Import-Fixtures | 6 bestanden |
| Bestehende Service-Worker-Regressionen | 3 bestanden, einschließlich fehlgeschlagenem Update und Fallback |
| Echtes lokales Update NTFINAL1 → NMC1 | 1 vollständiges Szenario mit 5 erfolgreichen Prüfphasen |
| Vollständige Bestands-, Feld- und Zuordnungsvalidierung | bestanden |
| NT-Excel-Mastervergleich und historischer Zusammenführungsnachweis | bestanden |
| Zwei unabhängige Builds | 321 Dateien; vollständig bytegleich |

Insgesamt bestehen 110 Browserszenarien aus sieben Suites; das zusätzliche reale
Update ist ein durchgängiges Szenario mit fünf Prüfabschnitten, nicht fünf
unabhängige Geräteprüfungen.

Die tatsächliche MC-Oberfläche wurde bei **320 × 568, Nacht** und
**390 × 844, Hell** mit aktivem Service Worker geprüft: richtige und falsche
Antworten, exakte Optionen, unveränderte Rückmeldung, deaktivierte Buttons nach
Auswahl, Tastaturbedienung, Fokus, mindestens 44 Pixel hohe Touch-Ziele und kein
horizontaler Überlauf. Stichproben umfassen AT, NT, lange Antworten und bestehende
Doppelzuordnungen. Weitere bestehende Suites prüfen auch 375/430 Pixel und
Textvergrößerung. Automatische axe-Prüfungen ersetzen keinen Screenreader-Test.

Beim echten Update wurde NTFINAL1 auf derselben **lokalen** Origin installiert,
dann der Kandidat bereitgestellt und ein vollständiger Dokument-Reload ausgeführt.
Erst „Jetzt aktualisieren“ aktivierte den wartenden Worker. Sämtliche N-Datensätze
und NT-Fragen wurden anschließend auch offline exakt verglichen. Vorhandener
synthetischer Speicher, Versionsmigration, Entwurf, Journalverknüpfung,
Markierung sowie 260 Kapitel-Fortschrittsschlüssel und ein Story-Schlüssel blieben
erhalten. Der Entwurf ließ sich offline fortsetzen und speichern.

Zwei Fehler im neuen Testaufbau wurden korrigiert: Inline-Injektion des axe-Skripts
wurde zu Recht von der CSP verhindert; die Prüfung verwendet nun DevTools-Ausführung.
Eine reine Hash-Navigation löste keinen Dokument-Updatecheck aus; der Updateversuch
prüft nun ausdrücklich einen tatsächlichen Reload. Anwendung und CSP mussten dafür
nicht geändert werden. Beide korrigierten Prüfungen bestehen.

Umgebung: Linux, Node 24.19.0, npm 11.9.0, Chromium 151, Playwright 1.62.1,
axe-core 4.13.0. Ausschließlich synthetische persönliche Daten. Kein reales iPhone,
kein Safari, kein VoiceOver und kein neuer Netlify-Deploy wurden getestet.

## Reproduzierbarer Build

```text
Build-ID:     FP4-20261016-G-STABLE1-NMC1
Content-Hash: 9af4bc150dbc5fe0b0afa77a0de8f16751a91838605c083bfacae519256f616e
Build-Hash:   9dc4a8931b7ef1400fd0f6a8a950658e6e121b90797a5a732afe43536dc3bfde
N-Daten-SHA:  f752614dea5cab6c787d3834f3651eb77126cd9c819a998ea4373bc5301d6e37
```

Zwei getrennte Ausgabeverzeichnisse wurden gebaut und Datei für Datei verglichen.
Zusätzlich wurden alle tatsächlichen Dateihashes gegen `release-integrity.json`
und alle Inhaltsdateien gegen `candidate-integrity.json` unabhängig nachgerechnet.
`qa/reproducible-build.json` enthält den Nachweis. Branch-Metadaten sind Bestandteil
des Builds; zur exakten Reproduktion ist dieser Branchname zu verwenden.

```sh
npm ci --ignore-scripts
npm test
npm run validate:nachlese-mc
npm run validate:nt-quiz
node scripts/validate-faithpath-materialization.mjs
FAITHPATH_BUILD_BRANCH=content/nachlese-multiple-choice-20261016 FAITHPATH_OUT=qa-output/nachlese-mc/build-a npm run build
FAITHPATH_BUILD_BRANCH=content/nachlese-multiple-choice-20261016 FAITHPATH_OUT=qa-output/nachlese-mc/build-b npm run build
diff -qr qa-output/nachlese-mc/build-a qa-output/nachlese-mc/build-b
```

Browser- und Update-Befehle sowie der benötigte Ausgangsbuild stehen in
[`reports/nachlese-mc/README.md`](../reports/nachlese-mc/README.md).

## Offene Inhaltsentscheidungen und Risiken

Die 56 Zurückstellungen sind **nicht pauschal 56 nachgewiesene Inhaltsfehler**.
Sie umfassen binäre oder zu offene Frageformen und konkrete Quellprobleme.
Beispiele:

- `N-0149`: Ja-/Nein-Frage; drei eigenständige falsche Optionen lassen sich unter
  unverändertem Wortlaut nicht sinnvoll gewinnen.
- `N-0388`: Der Originalantwort zu Psalm 121,4 fehlt die Verneinung. Sie wurde
  ausdrücklich nicht als richtige MC-Option übernommen oder eigenmächtig repariert.
- `N-1524`: Frage und Antwort kehren den Abrahamvergleich gegeneinander um.
- `N-2240`: Offenbarung 1,1 unterscheidet Empfänger und Zielgruppe; die Zuordnung
  der Originalantwort erfordert eine redaktionelle Entscheidung.

Die bisherige Antwortaufdeckung dieser Fälle bleibt erhalten; das ist **keine
Bestätigung ihrer inhaltlichen Richtigkeit**. Vor einer vollständigen
Inhaltsfreigabe müssen nachgewiesene Fehler entschieden werden. Die vollständige
Liste ist maßgeblich, nicht nur diese Beispiele. Keinen Fall durch ungeprüfte alte
Fragen ersetzen; keine N-ID ändern. Persönliche Reflexionsfragen bleiben auch bei
späteren Entscheidungen unberührt.

## Geräte-Gate und Empfehlung

**GO zur gezielten fachlichen und Geräteabnahme des isolierten Branches.**
Die technische Integration und die ausgeführten lokalen Prüfungen bestehen.
**NO-GO für die Aussage „Nachlese vollständig als MC freigegeben“ und für eine
Produktionsfreigabe:** 56 Entscheidungen, menschliche Inhaltsabnahme und das
bereits geforderte iPhone-Geräte-Gate sind noch offen.

Nach separat genehmigter Bereitstellung auf einer isolierten HTTPS-Test-Origin mit
ausschließlich synthetischen persönlichen Daten:

1. **iPhone Safari – OFFEN:** Modell, iOS/Safari-Version und Ausrichtung protokollieren.
   N-0001 über die Geschichte öffnen, jede Antwort in frischer Sitzung antippen,
   Rückmeldung und Navigation prüfen. Auch N-0324 mit langer Antwort, N-2314 und
   einen dokumentierten offenen Fall prüfen. Alle Optionen müssen scrollbar
   erreichbar sein; Safe Areas und feste Navigation dürfen keine Bedienung sperren.
2. **Tastatur und Reflexion – OFFEN:** Originalreflexion öffnen, synthetischen
   Gedanken eingeben, unterbrechen und fortsetzen. Mit eingeblendeter Tastatur
   speichern; zugeordneten Weg, Journal und Export kontrollieren.
3. **Installierte iPhone-PWA – OFFEN:** Zum Home-Bildschirm hinzufügen, vollständige
   Offline-Bereitschaft abwarten, Flugmodus, App beenden und erneut öffnen.
   Nachlese-MC, beide Bibelübersetzungen, Kapitelquiz und Journal prüfen.
4. **Reales Geräteupdate – OFFEN:** Auf genau derselben isolierten Test-Origin
   NTFINAL1 installieren und synthetische Daten sichern. Kandidaten bereitstellen,
   wiederkehren bzw. neu laden, Updateangebot und bewusste Aktivierung prüfen.
   Build-ID, Antworten, alte Fortschritte, Entwurf und Offline-Neustart vergleichen.
5. **VoiceOver – OFFEN:** Reihenfolge, Frage, vier benannte Buttons, deaktivierter
   Zustand, richtige Antwort, Rückmeldung und „Nächste Frage“ prüfen; keine
   doppelte oder verlorene Fokusposition. Auch größere Systemschrift testen.

Für jeden Schritt Ergebnis, Gerät, Datum und gegebenenfalls Screenshot festhalten.
Ein Netlify- oder Produktions-Go folgt daraus nicht automatisch. Empfohlen sind
die Entscheidung der dokumentierten Restfälle und die echte Geräteabnahme;
keine weitere Zusammenführung, kein Redesign und kein Frameworkwechsel.
