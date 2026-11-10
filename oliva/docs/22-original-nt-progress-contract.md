# Originalvertrag: persönlicher NT-Quizfortschritt

Der fertige NT-Katalog und der persönliche Fortschritt haben unterschiedliche
Verträge. Das aktive FaithPath-Original speichert pro Quiz-Einheit ausschließlich
den Zeitpunkt **„Fragen angesehen“**. Es erzeugt keine dauerhaften Einzelantworten,
Punktzahl oder Wiederaufnahmeposition. Eine vorsichtige Übernahme kann diesen
historischen Status aktiv zugänglich machen; fehlende Antworten bleiben unbekannt.

Geprüfte Quelle ist ausschließlich Snapshot
`a519ce898fa33907b07d5ac7a585595127556183` von
`akwasiacheampongma-code/Faithpath-`. `index.html:44` lädt **`src/app.js`**;
die separate Datei `app.js` mit älterem V4-Vertrag ist nicht der aktive Einstieg.
Die Prüfung verwendete `git show`/`git grep`, synthetische isolierte
Handler-/Store-Prüfungen und Datensatzabgleiche.
[Prüfmetadaten](evidence/nt-catalog/legacy-contract/contract-audit.json) enthalten
Dateihashes, Git-Blob-IDs, 15 erfolgreiche Prüffälle und Prüfgrenzen. Keine
persönliche Sicherung wurde untersucht; keine Browser-/Geräteabnahme wird daraus
abgeleitet. Das Original blieb unverändert.

## Erzeugter Zustand und tatsächlich exportierte Daten

Ein vom Original erzeugter Ausschnitt lautet schematisch:

```json
{"version":5,"quiz":{"10000":{"done":"2024-05-06T12:34:56.789Z"}}}
```

Der Zeitwert ist ein synthetisches Beispiel. `src/store.js:15` erzeugt ihn mit
`new Date().toISOString()` aus der damaligen Geräteuhr.

| Feld / Schlüssel | Exakte Bedeutung im Original | Übernahmegrenze |
| --- | --- | --- |
| `data.quiz` | Persistenter Record, initial `{}` (`src/store.js:18–32`) | Original vollständig erhalten |
| `quiz[unit.id]` | Stringifizierte numerische **Einheiten-ID**, bei NT `10000`–`10259` | Nur exakte bekannte Katalogzuordnung; keine `FP-…`-Frage-ID |
| `.done` | Zeit des letzten vollständigen Durchlaufs; finaler Klick schreibt `done: now()` (`src/app.js:1498–1509`) | Historisch „Fragen angesehen“, keine nachgewiesene richtige Beantwortung |
| `ui.quiz.answer` | Aktuell gewählter nullbasierter Optionsindex (`src/app.js:1491–1495`) | Nur flüchtig, kein exportiertes Antwortfeld |
| `ui.quiz.index` | Aktuelle Frage, initial `0`; beim Weitergehen erhöht und `answer` gelöscht (`src/app.js:1487`, `1500–1503`) | Keine gespeicherte Wiederaufnahme |
| `ui.quiz.story`, `returnRoute`, `navigation` | Laufzeitinhalt und Rücknavigation (`src/app-router.js:64–69`) | Nicht Teil des Backupzustands |
| `questions[].c` | Redaktioneller Index der richtigen Originaloption; Feedback vergleicht `answer === q.c` (`src/app.js:645–649`) | Kein persönlicher Richtig-Zähler |
| `answers`, `selected`, `correct`, `score`, `retries`, `attempts`, `lastIndex`, `mode`, `date` usw. | Kein entsprechender persistenter Schreiber im aktiven NT-Quizpfad | Vorhandene unbekannte Felder archivieren; keine erfundene Interpretation |

Nach jeder Auswahl werden die vier Optionen gesperrt. Auch eine falsche Antwort
erlaubt „Nächste Frage“ und schließlich „Kapitel abschließen“; eine richtige
Antwort ist keine Abschlussbedingung (`src/app.js:649`, `1491–1507`). Die
Abschlussansicht sagt ausdrücklich, dass die fünf Fragen **angesehen** wurden
(`src/app.js:563–565`; ebenso Sammlung `:557` und `src/reader-view.js:6`).
Nach Verlassen oder Neuladen beginnt das erneute Öffnen bei Frage 1
(`src/app-router.js:65–66`). Ein erneuter
Abschluss überschreibt `done`; das Original speichert weder Anzahl noch Verlauf
der Versuche. Der Spread in `src/app.js:1507` erhält unbekannte bestehende
Eigenschaften. Daraus folgt keine fachliche Bedeutung dieser Eigenschaften.

`src/store.js:210–220` exportiert tatsächlich diesen Umschlag:

```text
app: "FaithPath"
version: 4
schemaVersion: 5
exported: neuer Exportzeitpunkt
data: vollständige JSON-Kopie des persistenten Zustands, data.version = 5
guidedPlans: zusätzliche Kopie von data.guidedPlans
```

`version: 4` außen widerspricht somit nicht dem Datenschema 5. `exported` ist
kein Quizabschlussdatum. `ui` und damit gewählte Antwort, Index und Navigation
gehören nicht zum exportierten Zustand. `migrate` erhält unbekannte Felder
(`src/store.js:110–121`), und `backup()` klont den gesamten Zustand. Ein V5-Backup
kann deshalb mehr enthalten als der Originalquizpfad selbst erzeugt hat.

Besonders relevant: Die ursprüngliche Importgrenze prüft bei `quiz` nur, dass
jeder Wert ein Objekt und `done`, sofern nicht null, ein String ist
(`src/import-validation.js:41–43`). Sie prüft dort weder Katalogmitgliedschaft
noch Datumssyntax. Auch unbekannte oder nichtnumerische Schlüssel und ungültige
Datumsstrings können erhalten bleiben. **Ein erfolgreich geparstes V5-Backup
belegt daher noch keinen aktiv übernehmbaren Quizstatus.**

## Kapitelstatus und persönliche Entwicklung bleiben getrennt

Der finale Quizschreiber verändert ausschließlich `data.quiz[x.id]`.
`change()` delegiert an `store.transact` ohne zusätzliche Kapitel- oder
Wachstumsberechnung (`src/app.js:184–188`; `src/store.js:186–208`).

| Fachlicher Zustand | Tatsächliche Originalquelle |
| --- | --- |
| Bibelkapitel erkundet | Separates `chapter-explored`-Ereignis durch `acknowledgeReaderChapter()` → `recordExploredChapter()` (`src/app.js:535–543`; `src/bible-journey.js:13–18`) |
| Bibelreise / Kapitelzahl | Ausschließlich gültige `chapter-explored`-Ereignisse, zusätzlich Leseposition (`src/bible-journey.js:3–11`) |
| Leseposition / Öffnungshistorie | Readeröffnung setzt `reading` und gegebenenfalls `reading`-Ereignis (`src/app.js:480–498`) |
| Baumstufe | Weg-Meilensteine plus eigenständige Rückblicke mit `confirmedDevelopment` ohne `pathId` (`src/domain.js:313–333`) |

Quizabschluss ruft keinen dieser anderen Schreibpfade auf. Der Baumtext benennt
die Trennung ausdrücklich (`src/tree-view.js:34`). Eine Quizmigration darf
deshalb kein gelesenes/erkundetes Kapitel, Leseereignis, Meilenstein oder
persönliches Wachstum hinzufügen.

## Konservativer additiver Übernahmevertrag

Die Katalogprüfung bestätigt 260 eindeutige NT-Einheiten `10000`–`10259`, je fünf
Fragen, mit Frage-IDs `FP-0261`–`FP-1560`. Die 52 übrigen Story-Einheiten sind eine
separate Menge. Zuordnung erfolgt durch den geprüften Katalog:
`String(unit.id) → unit.book + ":" + (unit.chapter + 1)`;
beispielsweise `10000 → MAT:1`, `10259 → REV:22`. Ein bloßer numerischer Bereich
ersetzt den Lookup nicht. Die vollständige Buchzuordnung steht in
[Dokument 20](20-nt-catalog-preparation.md).

1. Die vollständige Eingabedatei im bestehenden Importbeleg unverändert erhalten.
   Die aktive Quizübernahme ist eine zusätzliche, getrennt ausgewiesene Auswahl.
2. Nur exakte bekannte NT-Einheitsschlüssel mit Objektwert und belegtem `done`
   berücksichtigen. `FP-0261`, `010000`, Story-IDs und unbekannte Schlüssel nicht
   zu Kapitelstatus umdeuten. Fehlendes, leeres, boolesches oder ungültiges `done`
   bleibt archiviert.
3. Eine vollständige, kalendarisch gültige Zeitangabe verlangen. Der sicherste
   nachgewiesene Originalfall ist das kanonische UTC-Format von `toISOString()`
   einschließlich Millisekunden; das Datum muss nach Parse/Roundtrip identisch
   bleiben. Ein reines Tagesdatum erhält keine erfundene Mitternacht. Andere
   Formate bleiben ohne ausdrücklich belegten Vertrag im Archiv.
4. Ausschließlich den historischen Status „im Original angesehen“ samt
   Originalzeitpunkt, Einheiten-/Kapitelzuordnung und Verweis auf Importbeleg und
   Katalogherkunft übernehmen. Importzeit und Exportzeit ersetzen `done` nicht.
   Antworten, richtige Antworten, Punktzahl, Versuchszahl und aktuelle Frage
   bleiben unbekannt. Insbesondere weder aus `done` noch aus einem fremden
   Richtig-Zähler fünf Antworten rekonstruieren.
5. Bei vorhandenem OLIVA-Quizstatus additive Herkunft vermerken oder den Konflikt
   explizit archivieren; laufende Antworten und neuere Abschlüsse nicht still
   überschreiben. Gleiche Sicherung/Einheit wiederholt auszuwerten erzeugt keine
   doppelten Status. Auch früher nur archivierte Belege bleiben als mögliche
   Quelle derselben vorsichtigen Auswahl nutzbar.
6. Vorschau unterscheidet übernehmbare historische Sichtungen, vorhandene Status,
   Konflikte und archivierte Restfelder. Bestätigung und atomare Speicherung
   übernehmen nur die freigegebene Menge; Originaldatei und übrige Daten bleiben
   erhalten. Keine Kapitel-, Lese- oder Baumwirkung aus Quizdaten ableiten.

Erforderliche Implementierungsprüfungen betreffen bekannte/unbekannte Schlüssel,
falsche Datumswerte einschließlich kalendarischem Überlauf, erhaltene unbekannte
Felder, vorhandene aktive Antworten, Wiederholung, frühere Archivbelege, Abbruch
und Schreibfehler. Die isolierten Quellprüfungen hier ersetzen diese OLIVA-Tests
nicht. Dieses Dokument ändert weder App, Schema noch Importverhalten.

## Quellenidentität

Vollständige Metadaten aller 17 gelesenen Quellen stehen im
[Audit](evidence/nt-catalog/legacy-contract/contract-audit.json).

| Snapshotdatei | SHA-256 |
| --- | --- |
| `src/app.js` | `56e494f2e84c18d74e970578217467feecc5670443c558a905af537f0be17771` |
| `src/store.js` | `6ab0de7812b78a25f50f05f55963a19a5991843e56889e73e7fb67dc6c4b76db` |
| `src/domain.js` | `ee05fe3c7809f7f1d3d5bf717d1b5a698fe6067a8a417a07516a7cc3da419644` |
| `data/stories.json` | `f9fc48a97ecb129eaed0289cf94afa7c747f15afe381fbe6241e67fac5ec04cd` |
