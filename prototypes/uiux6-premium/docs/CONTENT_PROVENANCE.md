# Herkunft der öffentlichen Inhalte

Die statische Datei `content.js` ist eine deterministische Projektion der bereits vorhandenen öffentlichen FaithPath-Inhalte am Ausgangsstand `5a72d038a78bd10741a1902cb478b1963a94efe2`. Sie enthält keine persönlichen Notizen, Nutzerprofile, gespeicherten Wege oder importierten Nutzerdaten. Die Originaldateien werden ausschließlich gelesen.

## Bibeltexte

Für `otb` und `l1912` werden die vollständigen Original-Versarrays aus `data/bibles/{Übersetzung}/{Buch}.json` unverändert übernommen:

- Johannes (`JHN`), Kapitel 1–21.
- Psalmen (`PSA`), Psalm 1, 23 und 119; Psalm 119 enthält in jeder Übersetzung alle 176 Verse.
- Epheser (`EPH`), Kapitel 6, einschließlich Epheser 6,17.
- Zusätzlich jedes vollständige Kapitel, auf das ein bestehendes `LIFE_TOPICS.refs`-Objekt oder ein Abschnitt in `GUIDED_PLANS.days` beziehungsweise `BEGINNER_GUIDES.days` verweist. Die Auswahl wird bei jeder Generierung aus den Originalreferenzen berechnet und pro Buch dedupliziert.

Die Kopie erhält sowohl die originale Versnummer als auch den vollständigen Wortlaut. Es gibt keine ergänzten Verse, Platzhalter, Zusammenfassungen oder stilistischen Überarbeitungen. Die rechtlichen Hinweise zu OTB und Luther 1912 stehen unter `assets/licenses/`.

`books` benennt sämtliche tatsächlich im lokalen Lesebestand enthaltenen Bücher mit ihrem Originalnamen aus `data/index.json`. `bibleIndex` übernimmt daneben dieses vollständige Originalarray aller 66 Bücher mit den ursprünglichen Kapitel- und Versanzahlen. Seine insgesamt 1189 Kapitel dienen zur Validierung eindeutig referenzierter synthetischer Reise-Beispiele; der Index erweitert den enthaltenen Lesebestand nicht.

Die unterschiedlichen ursprünglichen Buchkürzel werden mit dem vorhandenen `normBook` aus `src/domain.js` aufgelöst. `bookAliases` enthält alle Einträge aus dem vorhandenen `BOOK_ALIASES`, die Schreibweisen der ursprünglichen Themen- und Wege-Referenzen sowie die kleingeschriebenen kanonischen Buchkürzel. Die Originalreferenzen selbst bleiben unverändert.

## Aktiver Katalog und Fragen

Der Generator lädt genau die sieben in `src/runtime-model.js` exportierten `SOURCE_FILES` aus `data/` und prüft sie mit `createRuntimeModel`. Der Katalog bildet die **436 aktiven zusammengeführten Geschichten** aus `faithpath-nachlese-story-flow.json` und **260 Kapitelquiz-Einheiten** aus `stories.json` ab: insgesamt **696 eindeutige Einträge**. Ältere, nicht zusammengeführte Geschichten werden nicht als zusätzliche Einträge gezählt.

Ein Katalogeintrag enthält `id`, `kind`, `title`, `ref`, `book`, `chapter` und die ursprüngliche Fragenanzahl in `questions`. Geschichten behalten ihre kanonische Story-ID. Ein Kapitelquiz erhält eine Referenz-ID wie `JHN:15`; sein unveränderter numerischer Originalschlüssel bleibt in der zugehörigen Beispieleeinheit unter `source.id` erhalten.

Die vier vollständig mitgelieferten Beispieleeinheiten sind:

| Schlüssel | Originalinhalt | Fragen |
| --- | --- | ---: |
| `story:NS-0297` | Der rechte Weinstock, Johannes 15,1–13 | 6 |
| `story:NS-0268` | Komm und sieh es, Johannes 1,35–51 | 10 |
| `story:NS-0271` | Von neuem geboren, Johannes 3,1–21 | 10 |
| `chapter:JHN:15` | Johannes 15 – Kapitelquiz, Originaleinheit 10082 | 5 |

Geschichten übernehmen die Fragen in der Reihenfolge der aktiven `flow_items`. `primary_question_id` wird gegen die vorhandenen `fp`- beziehungsweise `n`-Register aufgelöst. Kein Fragetext, Antworttext, Option, Antwortindex `c`, Verweis `ref`, Erklärung `x`, Feld `answer`, N-/FP-Schlüssel oder Provenienzfeld wird umgeschrieben. Dokumentierte Quellvarianten bleiben als eigenständige Originalfragen erhalten. Die vollständige ursprüngliche Einheit steht unter `source`; Geschichten enthalten außerdem die unveränderten zugehörigen `mappingLinks`.

Die Oberfläche verwendet Kapitelnummern ab 1. Die Original-Kapitelquizdatei zählt das Feld `chapter` ab 0. Deshalb besitzt `units['chapter:JHN:15'].chapter` den Wert `15`, während das unverändert mitgelieferte `source.chapter` den Originalwert `14` behält. Diese Zuordnung entspricht `src/chapter-questions.js` und ändert keine Originaldaten.

## Vorhandene geführte Wege und Lebensthemen

`guided` kopiert die vier vorhandenen `GUIDED_PLANS` und drei `BEGINNER_GUIDES` aus `src/content.js`. Ergänzt wird ausschließlich `kind: 'plan'` oder `kind: 'guide'`, um ihre Herkunft unterscheidbar zu machen. Titel, Beschreibung und die ursprünglichen `days`-Arrays bleiben unverändert. `themes` enthält alle 18 bestehenden `LIFE_TOPICS` einschließlich Beschreibungen, Bibelverweisen, Kontexten und Reflexionsfragen. Für den Prototyp wurde keine zusätzliche Bibelauslegung verfasst.

## Reproduzierbare Prüfung

Vom Repositoryverzeichnis aus:

```sh
node prototypes/uiux6-premium/tests/generate-content.mjs
node prototypes/uiux6-premium/tests/sources.test.mjs
```

Die unabhängige Quellenprüfung berechnet die erforderliche Kapitelauswahl erneut aus den Originalreferenzen und vergleicht jedes enthaltene Kapitelarray mit seiner Originaldatei. Zusätzlich prüft sie die Lesbarkeit aller ursprünglichen Themen- und Wege-Verweise, die Buchalias-Zuordnung, den vollständigen 66-Bücher-Index, Psalm 119, den vollständigen Katalog, alle 31 Beispielsfragen, die Originaleinheiten, die Zuordnungen sowie die vorhandenen geführten Wege und Lebensthemen. Die aktuellen Anzahlen und SHA-256-Werte aller tatsächlich verwendeten öffentlichen Eingabedateien stehen unter `PremiumContent.provenance.sourceSha256` und im Ergebnis `qa/sources.json`. `qa/sources.log` dokumentiert den Prüflauf.
