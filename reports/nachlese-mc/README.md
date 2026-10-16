# Nachlese: additive Multiple-Choice-Ergänzung

Ausgangsstand: `6f96ec8be376af3b0de03094a5052ae909054658`, Branch
`integration/quiz-final-on-stable1`. Keine erneute Zusammenführung, kein Import
eines historischen Nachlese-Bestands.

## Tatsächlich angezeigter Bestand

`src/app.js` zeigt in `mergedStory()` ausschließlich die `primary_question_id`
der `flow_items` aus `data/faithpath-nachlese-story-flow.json` an. `sourceQuestion()`
liest die referenzierte Frage aus `data/nachlese-questions.json` oder
`data/stories.json`. Die Laufzeit-Zuordnungen prüft `src/runtime-model.js`.

Die vollständige Bestandsaufnahme **vor** Ergänzungen steht in
`active-inventory.json`: 436 Geschichten, 2.479 angezeigte Fragen,
165 bereits vollständige FaithPath-MC-Fragen, 2.314 aktive Nachlese-Fragen ohne
Optionen. 95 weitere FaithPath-IDs sind deduplizierte Aliase und erscheinen nicht
zusätzlich. Sämtliche 2.314 N-IDs sind aktive Primärfragen. Die 436 gesonderten
Reflexionsaufforderungen gehören nicht zum Wissensfragenbestand (435 Nachlese,
eine zusätzliche FaithPath-Geschichte).

## Nachweise und Entscheidungen

- `baseline-active-questions.json`: unveränderte, hashgesicherte Momentaufnahme der
  **bereits integrierten** aktiven Quelldatei. Nur historischer Prüfnachweis;
  keine zusätzliche Laufzeitquelle und kein erneuter Import.
- `authored.jsonl`: erste Antwortentwürfe mit Belegen. Enthält auch verworfene
  Vorschläge; **nicht** zur direkten Übernahme verwenden.
- `reviews.jsonl`: gesonderte, modellgestützte Einzelprüfung; jeder Eintrag bindet
  den geprüften Entwurf über dessen kanonischen SHA-256. `REPLACE` enthält die
  maßgebliche Fassung der Antwortoptionen; es ersetzt niemals die bestehende
  Frage. Die Prüfung ist keine menschliche Redaktionsfreigabe.
- `master.json`: daraus abgeleitete wirksame Entscheidungen. Nur `ready` wird
  als optionale Felder `a` und `c` an die bestehende Frage angefügt. `manual`
  bleibt im Laufzeitbestand unverändert und behält die bisherige Antwortanzeige.
- `question-review.csv`: alle 2.314 aktiven N-Fragen mit Originalfrage, -antwort,
  Referenz, Entscheidung und gegebenenfalls vier Optionen; UTF-8 mit BOM.
- `manual-decisions.json`: vollständige Liste der offenen Einzelfälle mit Grund.
- `manifest.json`: genaue Abschlusszahlen und SHA-256 für Daten, Prüfarbeitsstand
  und geschützte Dateien.

Maschinelle Prüfungen belegen vier verschiedene nichtleere Optionen, gültigen
Index, die exakte bisherige richtige Antwort, vollständige Belegzuordnung und
wörtliche Zitatübereinstimmung mit den vorhandenen Offline-Bibeln. Ob ein
Distraktor inhaltlich plausibel und falsch ist, wird durch die gesonderte
Einzelprüfung bewertet; ein erfolgreicher Validator ersetzt dieses Urteil nicht.
Zusätzliche Prüfrunden behandeln sinngleiche Distraktoren und Quellunklarheiten.

## Unveränderte Grundlagen

Fragen, N-IDs, richtige Antworten, Referenzen, Reihenfolge, Quellprovenienz,
Geschichten und Reflexionen bleiben erhalten. Die gesamte bestehende
Geschichtenzuordnung, die 1.300 NT-Kapitelquizfragen sowie `src/store.js`, dessen
Migrationen und Fortschrittsschlüssel sind geschützt. Historische
Zusammenführungsnachweise prüfen ihren unveränderten Vorzustand; der zusätzliche
Validator belegt separat die ausschließlich additive aktuelle Änderung.

Die neue MC-Oberfläche verwendet den bestehenden FaithPath-Antwortmechanismus.
Wie bisher werden Antworten auf einzelne Geschichtenfragen nur während der
Sitzung angezeigt. Es wird kein neues persistentes Fortschrittsformat eingeführt.

## Wiederholbare Prüfungen

```sh
npm ci --ignore-scripts
npm test
npm run validate:nachlese-mc
npm run validate:nt-quiz
node scripts/validate-faithpath-materialization.mjs
FAITHPATH_OUT=qa-output/nachlese-mc/build-a npm run build
FAITHPATH_OUT=qa-output/nachlese-mc/build-b npm run build
PORT=4333 node scripts/serve.mjs qa-output/nachlese-mc/build-a
```

Gegen diesen lokalen Server in einem weiteren Terminal:

```sh
QA_URL=http://127.0.0.1:4333 npm run test:nachlese-mc:browser
QA_URL=http://127.0.0.1:4333 npm run test:nachlese-mc:fixtures
```

Der echte lokale Service-Worker-Updateversuch benötigt zusätzlich ein separat
gebautes Artefakt des Ausgangscommits (Branch-Metadatum
`integration/quiz-final-on-stable1`). Der Test verlangt dessen bekannten Build-Hash
`9cf11e6834d2cfbd065c3cdfb78f213f2e76dc302a2daaae707f0267ba8d3a38`:

```sh
FAITHPATH_PREVIOUS_ROOT=/pfad/zum/ntfinal-build npm run test:nachlese-mc:update
```

Die Browserprüfungen verwenden Chromium und synthetische persönliche Daten.
Ein lokaler echter Service Worker ersetzt keinen Test auf einem realen iPhone,
in Safari oder einer installierten iPhone-PWA. Diese Geräteprüfungen bleiben offen.
Es erfolgt keine Veröffentlichung auf Netlify oder Änderung an Produktion/main.
