# Vorbereitung: fertigen NT-Fragenkatalog in OLIVA übernehmen

**Der vorhandene Katalog ist fertig und zur Übernahme beauftragt.** Offen ist
seine technische Einbindung in OLIVA, nicht die Erstellung von 1.300 neuen
Fragen. Dieses Dokument und die [Metadatenprüfung](evidence/nt-preparation/catalog-audit.json)
sind Vorbereitung; sie implementieren weder Katalogadapter noch Quizoberfläche
oder Fortschrittsmigration. Sie ordnen der Übernahme keinen Termin und keine
Versionsnummer zu und verändern nicht die Priorität des laufenden
Reader-Arbeitspakets.

## Quelle und tatsächlich nachgezählter Bestand

Gelesen wurde der unveränderte FaithPath-Snapshot
[`a519ce898fa33907b07d5ac7a585595127556183`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/a519ce898fa33907b07d5ac7a585595127556183)
des Branches `feature/simplified-step-experience-20261104`, jeweils mit
`git show <snapshot>:<pfad>`. Die Referenz-App wurde nicht gestartet oder
verändert. Die bisherigen Bestands-/Planungsdokumente bleiben historische
Nachweise: [Audit](00-faithpath-audit.md), [Paritätsabgleich](16-current-plan-and-parity.md)
und [Reader-Vorbereitung](19-reader-flow-preparation.md). Die frühere Entscheidung
für eigene Pilotfragen erfüllt die inzwischen ausdrücklich gewünschte
Übernahme dieses fertigen NT-Katalogs nicht.

Die unabhängige Prüfung liest `data/stories.json`, selektiert ausschließlich
`kind === "chapter-quiz"`, zählt die tatsächlichen Objekte und vergleicht alle
1.300 Fragen Feld für Feld mit `reports/nt-quiz-final/master.json`. Sie prüft
außerdem die Quellhashes gegen das Importmanifest, die Freigabefelder und alle
Referenzbereiche gegen OLIVAs vorhandene Luther-1912-Versnummern.

| Prüfung am Snapshot | Tatsächliches Ergebnis |
| --- | --- |
| Gesamte gemischte Datei `data/stories.json` | 312 Einheiten mit 1.560 Fragen |
| Davon fertige NT-Kapitelquiz-Einheiten | 260 Einheiten mit 1.300 Fragen |
| Übrige Einheiten derselben Datei | 52 Story-Einheiten mit 260 Fragen; nicht Teil dieses Transfers |
| Vollständigkeit | 27 NT-Bücher, alle 260 kanonischen Kapitel, genau fünf Fragen je Kapitel |
| Stabile Fragen-IDs | `FP-0261` bis `FP-1560`, lückenlos und eindeutig; der Bindestrich gehört zur ID |
| Legacy-Einheits-IDs | Numerisch `10000` bis `10259`, lückenlos und eindeutig |
| Antwortvertrag | 1.300-mal vier unterschiedliche, nicht leere Optionen; ganzzahliger richtiger Index 0–3 |
| Inhaltserhaltung | Alle Fragen, Optionen in Originalreihenfolge, Indizes, Referenzen und Erklärungen stimmen exakt mit dem normalisierten Finalmaster überein |
| Richtige Antwort | Bei allen 1.300 Masterzeilen exakt `correct_answer === options[correct_index]` |
| Referenzen | Alle 1.300 vorhanden und aufgelöst; 1.304 Teilbereiche liegen im jeweiligen Buch/Kapitel und enthalten ausschließlich vorhandene OLIVA-Verse |
| Erklärung und Freigaben | Alle Erklärungen vorhanden; alle Masterzeilen `qa_status = FREIGEGEBEN`, `approval = FREIGEGEBEN`, `import_ready = JA` |

Der SHA-256 der unveränderten `data/stories.json` lautet
`f9fc48a97ecb129eaed0289cf94afa7c747f15afe381fbe6241e67fac5ec04cd`.
Der unveränderte Excel-Master
`reports/nt-quiz-final/FaithPath_Kapitelfragen_NT_FINAL_MASTER_1300.xlsx`
hat SHA-256
`ddb5e9c5832a1aa60e5329621c6a0c92002cd1b879177c5b39027344cce5c199`;
sein maßgebliches Blatt ist `FAITHPATH_IMPORT`. Weitere Quellenhashes,
Buch-/ID-Grenzen, genaue Zählwerte und Prüfgrenzen stehen im JSON-Beleg.
Es wurde keine Vollkopie von Fragen, Optionen oder Erklärungen angelegt.

Der [Original-Abschlussbericht](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/NT_QUIZ_FINAL_IMPORT_REPORT.md)
bescheinigt `NT_QUIZ_FINAL_IMPORT_PASS`, die redaktionelle Nutzerfreigabe des
Masters und die abgeschlossene technische lokale Abnahme. Er dokumentiert
87 bestandene Fachtests, Browser-/Touch-/Updateprüfungen und den vollständigen
Inhaltsvalidator. Das sind historische Nachweise des Originalprojekts; diese
Browserprüfungen wurden hier nicht neu ausgeführt. Der Bericht behauptet
keine neue theologische Fachprüfung, keinen physischen iPhone-/Safari-Test
und keine Production-Veröffentlichung.

**Die unterschiedlichen Katalogmengen sind getrennt zu lesen:**
`data/faithpath-nachlese-story-flow.json` enthält tatsächlich 436 gemeinsame
Geschichten und 2.479 `flow_items`: 2.314 primäre `N-*`-IDs und 165 primäre
`FP-*`-IDs aus dem älteren Storyfragenbereich. Weder deren primäre IDs noch
deren `source_question_ids` überschneiden sich mit den 1.300 NT-Kapitelquiz-IDs.
Die 436 Geschichten sind daher nicht die Einheitenzahl von `stories.json`.
Der Originalcode trennt beide Abläufe ausdrücklich (`src/app.js:722`). Die
frühere pauschale Überlappungsformulierung im Paritätsabgleich ist für diese
konkreten Mengen ungenau; hier werden keine Summen als Transferumfang ausgegeben.

## Datenfeldvertrag und Kapitelzuordnung

Jede NT-Einheit enthält `id`, `kind`, `book`, `chapter`, `from`, `to`, `title`,
`ref`, `desc`, `reflection`, `reflectionStatus`, `verification` und fünf
`questions`. Metadaten und Reflexion sind vorhandener Bestand; historische
`verification`-Werte dürfen die neuere Finalmasterfreigabe weder ersetzen
noch als neue fachliche Prüfung ausgegeben werden.

| FaithPath-Feld | Vorhandene Bedeutung | Vertrag für den künftigen OLIVA-Adapter |
| --- | --- | --- |
| `unit.kind` | Exakt `chapter-quiz` | Ausschließlich diese Einheiten selektieren; keine Story-/Nachlesefragen beimischen |
| `unit.id` | Numerische Legacy-ID, bisheriger Fortschrittsschlüssel | Als Herkunfts-ID unverändert erhalten; separat von der fachlichen Kapitelreferenz führen |
| `unit.book` | Kanonischer Buchcode, z. B. `JHN` | Explizite Zuordnung laut Tabelle; unbekannten Code ablehnen |
| `unit.chapter` | Nullbasiert, z. B. `0` für Kapitel 1 | Genau einmal `+ 1`; OLIVAs `Reference.chapter` ist einsbasiert |
| `unit.from`, `unit.to` | Einsbasierte vorhandene Versgrenzen der Einheit | Unverändert prüfen; keine Umrechnung wie bei `chapter` |
| `unit.ref` | Deutsches Kapitel-Label als Text | Original erhalten; nicht als primären Kapitel-/Fortschrittsschlüssel benutzen |
| `questions[].faithpath_id` | Stabile ID einschließlich Bindestrich | Unverändert als Frage-ID erhalten; weder aus Text noch Listenposition neu erzeugen |
| `questions[].q` | Originalfrage | Unverändert als `prompt` darstellen; keine stillen redaktionellen Korrekturen |
| `questions[].a` | Genau vier Originaloptionen in maßgeblicher Reihenfolge | Als Vierertupel übernehmen, ohne Umordnung oder Kürzung |
| `questions[].c` | Nullbasierter Index der richtigen Option, 0–3 | Als `correctIndex` erhalten; beim Antworten Optionsindex vergleichen |
| `questions[].ref` | Originalreferenz mit deutschem Buchnamen | Unverändert als `referenceText` erhalten; zusätzlich geprüfte numerische `referenceRanges` für Links erzeugen |
| `questions[].x` | Originalerklärung | Unverändert als `explanation` anzeigen, klar vom Bibeltext getrennt |

Die NT-Frageobjekte besitzen exakt diese sechs Felder; `difficulty` oder
zusätzliche UI-IDs sind dort nicht enthalten. Eine neue ID ist für die
inhaltliche Übernahme nicht nötig. Ein Adapter kann eigene Feldnamen nutzen,
muss ihre unveränderte Herkunft und Eins-zu-eins-Zuordnung überprüfbar halten.

`question.ref` enthält **deutsche Buchnamen, keine Buchcodes**. Die technische
Auflösung muss den längsten passenden kanonischen Buchnamen erkennen,
anschließend Kapitel und Versbereiche prüfen und dieselben Codes wie
`unit.book` ergeben. Es gibt drei Referenzen mit Semikolon, eine mit Punkt
zwischen Versgruppen und 20 Referenzen zu Einkapitelbüchern ohne gesonderte
Kapitelnummer. Bei Letzteren ist Kapitel 1 nur aufgrund des kanonisch
einzigen Kapitels zulässig. Nicht zusammenhängende Stellen bleiben mehrere
Bereiche; sie werden nicht zu einem erweiterten Bereich einschließlich der
Zwischenverse zusammengezogen. `scripts/quiz-reference-ranges.mjs` im
Snapshot belegt den bisherigen technischen Vertrag. Der bestehende
OLIVA-Vertrag [Reference](../src/features/bible/repository.ts) trägt jeweils
einen Bereich; ein Fragenadapter braucht deshalb eine Liste solcher Bereiche
und zeigt für jede Teilstelle einen passenden Zugang zum Text.

Die folgende Zuordnung wurde direkt mit [OLIVAs Kanon](../src/data/catalog.json)
verglichen. Alle 27 Codes und Kapitelzahlen stimmen überein. Hier ist keine
Aliasheuristik oder Übersetzung von `mar`/`joh`/`jak` notwendig.

| FaithPath → OLIVA | Buch | Kapitel | Fragen | Legacy-Einheiten |
| --- | --- | ---: | ---: | --- |
| `MAT → MAT` | Matthäus | 28 | 140 | 10000–10027 |
| `MRK → MRK` | Markus | 16 | 80 | 10028–10043 |
| `LUK → LUK` | Lukas | 24 | 120 | 10044–10067 |
| `JHN → JHN` | Johannes | 21 | 105 | 10068–10088 |
| `ACT → ACT` | Apostelgeschichte | 28 | 140 | 10089–10116 |
| `ROM → ROM` | Römer | 16 | 80 | 10117–10132 |
| `1CO → 1CO` | 1. Korinther | 16 | 80 | 10133–10148 |
| `2CO → 2CO` | 2. Korinther | 13 | 65 | 10149–10161 |
| `GAL → GAL` | Galater | 6 | 30 | 10162–10167 |
| `EPH → EPH` | Epheser | 6 | 30 | 10168–10173 |
| `PHP → PHP` | Philipper | 4 | 20 | 10174–10177 |
| `COL → COL` | Kolosser | 4 | 20 | 10178–10181 |
| `1TH → 1TH` | 1. Thessalonicher | 5 | 25 | 10182–10186 |
| `2TH → 2TH` | 2. Thessalonicher | 3 | 15 | 10187–10189 |
| `1TI → 1TI` | 1. Timotheus | 6 | 30 | 10190–10195 |
| `2TI → 2TI` | 2. Timotheus | 4 | 20 | 10196–10199 |
| `TIT → TIT` | Titus | 3 | 15 | 10200–10202 |
| `PHM → PHM` | Philemon | 1 | 5 | 10203 |
| `HEB → HEB` | Hebräer | 13 | 65 | 10204–10216 |
| `JAS → JAS` | Jakobus | 5 | 25 | 10217–10221 |
| `1PE → 1PE` | 1. Petrus | 5 | 25 | 10222–10226 |
| `2PE → 2PE` | 2. Petrus | 3 | 15 | 10227–10229 |
| `1JN → 1JN` | 1. Johannes | 5 | 25 | 10230–10234 |
| `2JN → 2JN` | 2. Johannes | 1 | 5 | 10235 |
| `3JN → 3JN` | 3. Johannes | 1 | 5 | 10236 |
| `JUD → JUD` | Judas | 1 | 5 | 10237 |
| `REV → REV` | Offenbarung | 22 | 110 | 10238–10259 |

## Tatsächlicher OLIVA-Stand und Originalarchiv

[checks.ts](../src/features/paths/checks.ts) enthält neun eigene Pilotfragen
mit drei Optionen und Choice-IDs `a/b/c`. [TextCheck](../src/features/paths/TextCheck.tsx)
hält die aktuelle Antwort nur im React-Zustand und dreht die Pilotoptionen
deterministisch. Dieser Pilot ist kein bereits vorhandener Vieroptionen-Adapter
oder dauerhafter Kapitelquizfortschritt für den fertigen NT-Katalog.

Der aktuelle [V5-Quellparser](../src/features/imports/source.ts) akzeptiert
`quiz` lediglich als optionalen Record unbekannter Werte.
[Importmodell](../src/features/imports/model.ts) und
[Importbeleg](../src/features/imports/schema.ts) bewahren die vollständige
unveränderte Eingabedatei in `receipt.sourceText`. `applyImport` übernimmt
Vorhaben, Gedanken, Markierungen, ausdrücklich bestätigte Kapitelstatus und
den Beleg; es überträgt keinen Quizfortschritt.

Im [Importarchiv](../app/importarchiv/%5Bid%5D.tsx) ist `quiz` unter
„Weitere Originalfelder“ als generisches JSON einsehbar und über die
Originaldatei exportierbar. Es gibt dafür keine eigene aktive Quizoberfläche,
keinen laufenden Kapitelquizstatus und keine Antwortwiederaufnahme. Die
Aussage „nur archiviert“ bedeutet somit erhaltene, zugängliche Originaldaten,
keine bereits implementierte Quizmigration. Der redaktionelle Fragenkatalog
und persönliche V5-Sicherungen sind außerdem verschiedene Quellen; ein
Nutzerbackup ersetzt nicht den Katalogtransfer.

## Konkretes künftiges Adapter-, Prüf- und Fortschrittskonzept

### Katalog und Oberfläche

Ein separates reines Modul `features/quiz` soll den genau identifizierten
Finalmasterbestand als unveränderlichen lokalen Katalog anbinden. Eine
nachvollziehbare Übernahme liest den angegebenen Snapshot, überprüft dessen
Hash, selektiert die 260 Kapitelquiz-Einheiten und erzeugt eine eindeutig
belegte lokale Laufzeitdatei mit Herkunftsmanifest. Sie erstellt keine neuen
Fragen und wertet Excel-Formeln nicht neu aus. Text, Reihenfolge, IDs und
richtige Antwort bleiben am freigegebenen Bestand ausgerichtet.

Der Adapter soll `byChapter[book:chapter]`, `byQuestion[faithpath_id]` und
`byLegacyUnitId[id]` bereitstellen. Jede Kapitelansicht führt die fünf
Originalfragen in Originalreihenfolge durch, bietet vier unveränderte
Antwortoptionen, verständliches Feedback, Referenzen und Erklärung sowie
einen freiwilligen nächsten Schritt. Eine Antwort mischt die Optionen nicht
neu und verändert den Katalog nicht. Aktuelle Frage, gewählte Antwort und
Feedbackzustand sind eindeutig voneinander getrennt.

Zugänge sollen aus dem vollständigen Readerkapitel und aus einer eigenen
Buch-/Kapitelübersicht möglich sein. Ein aus einem Teilabschnitt geöffnetes
Kapitelquiz wird als Quiz zum **ganzen Kapitel** benannt. Rückkehrziel,
Lesemodus, Abschnitt und kanonische Leseposition bleiben erhalten. Die
Oberfläche darf weder das Öffnen eines Quiz noch dessen Antworten als
gelesenes Kapitel oder persönliche Entwicklung speichern. Bestehende
Pilotfragen bleiben getrennt, bis ihre tatsächliche Ablösung bewusst
festgelegt und geprüft ist.

### Validierung vor Aufnahme und bei Änderungen

Ein eigener Validator soll die hier nachgezählten Invarianten verbindlich
prüfen: exakte Quellenhashes, 27 Bücher/260 Kapitel/1.300 Fragen, pro Kapitel
fünf eindeutige Fragen, vollständige Kapitelbereiche, exakte IDs, eindeutige
Legacy-Zuordnung, vier Optionen, gültiger Index und inhaltliche
Feldgleichheit mit dem freigegebenen Master. Buchcode und nullbasierter
Quellkapitelwert dürfen nicht aus dem Referenztext geraten werden.
Jeder Referenzbereich muss vollständig in der tatsächlich verwendeten
OLIVA-Bibel vorhanden sein. Ein unbekannter Code, fehlender Vers, falscher
Index, fehlende Erklärung oder Hashkonflikt bricht die Übernahme vor dem
Schreiben ab. Ähnliche Fragen in parallelen Evangelien sind keine automatisch
zu entfernenden Dubletten.

Für den Adapter sind gezielte Prüfungen der ersten/letzten Frage, aller
Buchgrenzen, null-/einsbasierter Kapitelwerte, aller vier richtigen Indizes,
Mehrfachstellen und Einkapitelreferenzen nötig. Browserprüfungen sollen
Reader → Quiz → Rückkehr, Übersicht → Buch → Kapitel, richtige/falsche
Antworten, alle fünf Fragen, Abschluss, erneutes Öffnen und Offline-Reload
abnehmen. Lange Originaltexte brauchen kleine Displays, große Schrift,
Hell/Dunkel, Tastatur, sichtbaren Fokus, Screenreaderfeedback und reduzierte
Bewegung. Native Exporte allein ersetzen keine Prüfung von VoiceOver,
TalkBack und echten iOS-/Android-Geräten.

### Eigenständiger Quizfortschritt und vorsichtige Legacy-Übernahme

Der Originalcode speichert einen Zeitstempel unter
`quiz[legacyUnitId].done` nach dem fünften Fragenabschluss
(`src/app.js:1507`). Das bedeutet „Fragen angesehen“, keine belegte Punktzahl,
keine gespeicherten fünf Einzelantworten und keinen automatisch bestätigten
Leseabschluss. Dieser historische Sinn bleibt bei einer Migration erhalten.

Ein neues OLIVA-Schema soll Quizstatus separat von `readChapters`,
Wegabschlüssen und Baumstufe führen. Als fachlicher Schlüssel eignet sich
`book:chapter`; hinzu kommen die unveränderte `legacyUnitId`, die
Quellen-/Katalogkennung und bei echtem Abschluss ein Zeitstempel. Eine
Wiederaufnahme kann den gültigen Fragenindex und Antworten als Zuordnung
`faithpath_id → originalOptionIndex` speichern. Der Validator muss nachweisen,
dass jede Antwort zur aktuellen Fünfergruppe gehört und der Index 0–3 ist.
Ein Abschluss entsteht erst durch die ausdrücklich gewählte Abschlussaktion;
Neuladen, Quellenupdate und Kataloganzeige bestätigen nichts. Schreibfehler
werden nicht als gespeichert angezeigt, wiederholter Abschluss erzeugt
keine doppelten Ereignisse.

Eine spätere V5-Fortschrittsmigration braucht eine eigene prüfbare Vorschau
und einen eigenen Datenvertrag. Sie darf nur bekannte numerische
Einheitsschlüssel mit belegtem gültigem `done` übernehmen. Die Tabelle oben
liefert die genaue Zuordnung: `legacyUnitId = Buchbereichsanfang +
(einsbasiertesKapitel - 1)`; zusätzlich ist jede resultierende Zuordnung mit
dem Katalog zu prüfen. Die 52 Story-Einheiten und unbekannte Schlüssel dürfen
nicht als NT-Kapitelstatus behandelt werden. Importierte Zeitstempel erhalten
Herkunft und Bedeutung „im Original angesehen“, ohne erfundene Antwortwerte,
aktuellem Abschlussdatum oder persönlichem Wachstum.

Originalarchiv, Importbeleg und Rückkehrsicherung bleiben unverändert
erhalten. Bereits vorhandener OLIVA-Quizstatus wird bei Überschneidungen
nicht stillschweigend ersetzt; die Vorschau benennt Konflikte und die
Übernahme ist idempotent. Tests müssen gültige/unbekannte Einheits-IDs,
ungültige Daten, Konflikte, Wiederholung, Abbruch und atomaren
Speicherfehler abdecken. Die bestehende App-Datenmigration, Export-/Restore-
und Speicherbudgetprüfung sind bei Einführung dieses Schemas anzupassen;
ein `quiz`-Record unbekannter Werte reicht dafür nicht.

## Auftrag, Herkunft und Grenzen der Freigabe

Die Übernahme des bereits fertigen Katalogs ist durch den aktuellen
Benutzerauftrag gewollt. Der maßgebliche Originalbericht und sein
Finalmaster belegen die vorhandene Inhaltsfreigabe und technische
Originalabnahme. Diese Fakten sind ausreichend, um die konkrete Integration
vorzubereiten, und werden nicht zu einem angeblich unfertigen Fragenbestand
umgedeutet.

Eine allgemeine Lizenz für sämtliche FaithPath-Inhalte, eine Erstreckung von
OLIVAs MIT-Lizenz auf den Fragenkatalog, eine unabhängige öffentliche
theologische Fachfreigabe oder uneingeschränkte Rechte Dritter werden daraus
nicht abgeleitet. Herkunft, Nutzerfreigabe und verbleibender Prüfungsumfang
sind bei der tatsächlichen Übernahme und etwaiger Weitergabe getrennt
auszuweisen. Hier wurde nur Dokumentation mit Metadaten angelegt; weder
FaithPath noch `main`, App-Quellen, Server oder Cloud wurden verändert.
