# Tatsächlicher FaithPath-Geschichtenbestand · Besprechungsgrundlage

Stand: 16.11.2026. **Nur statische Prüfung und fachliche Einordnung; keine Geschichtenimplementierung, Appausführung, Tests, Builds oder Bilderzeugung.** Geprüft wurde der erhaltene Snapshot `a519ce898fa33907b07d5ac7a585595127556183`. Alle 390 materialisierten Originaldateien stimmen weiterhin mit dem bestehenden Hashmanifest überein. [Nachgezählte Fakten](catalog-facts.json) · [Dateien, Git-Blobs und SHA-256](provenance.json).

## 1. Was tatsächlich vorhanden ist

| Bestand | Nachgezählter aktueller Wert |
|---|---:|
| Gemeinsame kanonische Einträge | 436 |
| Nachlese-Definitionen / zusätzliche FaithPath-Definition | 435 / 1 |
| AT / NT | 107 / 329 |
| Abgedeckte biblische Bücher | alle 66 |
| Sichtbare Frageelemente im gemeinsamen Ablauf | 2.479 |
| Davon primäre N- / FP-Fragen | 2.314 / 165 |
| Tatsächlicher Fragetyp | 2.479-mal Multiple Choice mit je vier Optionen |
| Separate persönliche Reflexionsaufforderungen | 436, zusätzlich zu den 2.479 Fragen |
| Dahinter erhaltene eindeutige Quellen-IDs | 2.574 = 2.314 N + 260 FP |
| Bestehende Aliaszusammenfassungen im Ablauf | 95 Paare |
| Überschneidung mit den bereits übernommenen 1.300 NT-Kapitelfragen | keine |

Die 436 Einträge sind **kein Vorrat aus 436 fertig ausformulierten Nacherzählungen**. Ein Storyobjekt enthält Titel, Bibelstelle, strukturierte Stellen, Reflexionsimpuls, Herkunft und geordnete Fragenverknüpfungen. Eigene Erzähltexte, Zusammenfassungen, Laufzeiten, Bildzuordnungen, Themen-Tags und Schwierigkeitsstufen sind darin nicht enthalten. Zum Bestand gehören auch Psalmen, Briefe und prophetische Abschnitte. „Geschichten und Abschnitte“ wäre deshalb eine präzisere erklärende Bezeichnung als die Behauptung, alles seien erzählte Ereignisse.

Der Quellablauf folgt `NS-0001` bis `NS-0435`; zuletzt steht zusätzlich `FP-STORY-0391`, **„Petrus erklärt sein Handeln in Jerusalem“**, Apostelgeschichte 11,1–18. Eine neue reine Buchsortierung würde diesen angehängten Sonderfall an seine kanonische Position verschieben; das ist eine bewusste Darstellungsentscheidung, kein neuer Inhalt.

## 2. Fragen sind vorhanden; umfassende Erklärungen sind es nicht

Alle 2.479 Primärfragen besitzen eine Referenzbeschriftung, vier unterschiedliche nicht leere Optionen und einen gültigen richtigen Index. Bei allen 2.314 N-Fragen entspricht die richtige Option außerdem dem separat erhaltenen Originalantwortfeld.

Nur **174** Primärfragen enthalten zusätzlichen Text im Feld `x`: **165 FP-Fragen und neun N-Fragen**. Bei **2.305** gibt es keinen solchen Erklärungstext. Der ursprüngliche Renderer zeigt dann nach einer Antwort lediglich die vorhandene richtige Antwort. Das Vorhandensein von `x` ist keine neue theologische oder didaktische Qualitätsfreigabe.

Deshalb kann OLIVA die bestehenden Fragen und Antworten vollständig übernehmen, ohne 2.479 neue Fragen schreiben zu müssen. Eine gut verständliche ausführliche Erklärung zu jeder Frage wäre dagegen **zusätzliche redaktionelle Arbeit**. Sie darf weder als Original ausgegeben noch still durch automatisch erfundene Texte ersetzt werden.

Das ältere MC-Dokument beschreibt noch 56 zurückgestellte Fälle. Der tatsächlich geprüfte spätere NMC2-Bestand ist weiter: Alle 2.314 N-Fragen besitzen vier Optionen. Der Originalabschlussbericht nennt 58 geänderte N-Datensätze, 208 in dieser Phase modell- und quellenbasiert geprüfte Fragen und 2.106 damals nicht erneut semantisch geprüfte Fragen. Er behauptet keine menschliche Redaktionsabnahme und keine erledigte iPhone-/Safari-/VoiceOver-/Produktionsfreigabe. Die heutige Prüfung ersetzt diese offenen Fach- und Geräteabnahmen nicht.

## 3. Die 95 Aliasse müssen sorgfältig behandelt werden

Die Mengen sind klar zu trennen: 2.574 ursprüngliche Quellen-IDs sind zu 2.479 sichtbaren Ablaufelementen verbunden. Die bestehende Flowdatei bezeichnet 95 Paare als `EXACT_FINAL_WORDING` und zeigt jeweils die primäre Frage nur einmal. Semantische Varianten außerhalb dieser Paare bleiben eigene Elemente.

Ein erneuter Vergleich des **aktuellen** Fragebestands findet jedoch nur noch 91 dieser Paare mit exakt gleicher Frage und richtiger Antwort. Vier N-Fragen wurden redaktionell präzisiert, während die bestehende Aliasbeschriftung erhalten blieb:

| Bestehendes Paar | Aktueller Unterschied |
|---|---|
| `N-0545` / `FP-0010` | Warum die Sterndeuter anders zurückkehren / auf welchem Weg sie zurückkehren |
| `N-0586` / `FP-0051` | Gefahren für irdische Schätze / wo keine Schätze gesammelt werden sollen |
| `N-0589` / `FP-0054` | Was aus den Vögeln zu lernen ist / welchen Vögeln Aufmerksamkeit gilt |
| `N-0596` / `FP-0061` | Beschreibung von Pforte und Weg / welche Pforte gewählt werden soll |

Auch bei den übrigen Paaren ist die Optionenanordnung nicht austauschbar: **Keines der 95 Paare hat dieselbe Optionsliste in derselben Reihenfolge**, nur 26 haben zufällig denselben richtigen Index. Die vier unterschiedlichen heutigen Wortlaute stehen im JSON-Beleg.

Das ist ein begrenzter, konkreter Migrations- und Redaktionspunkt. Der vorhandene sichtbare Ablauf soll nicht eigenmächtig neu zusammengerechnet werden. Original-IDs, Varianten, Mapping und Herkunft müssen erhalten bleiben; keine Antwortindizes zwischen Alias-IDs übertragen. Eine globale neue Dublettenbereinigung allein anhand des Fragetexts wäre ebenfalls falsch: 33 Textgruppen wiederholen sich, aber sämtliche 2.479 Kombinationen aus Frage, richtiger Antwort und Referenz sind verschieden.

## 4. Bibelstellen und unterschiedlich lange Abläufe

Die 436 Einträge enthalten 437 strukturierte Stellen. Alle Endpunkte sind im aktuell gebündelten OLIVA-Luther-1912-Korpus vorhanden. Auch die 2.316 strukturierten Stellen der 2.314 N-Fragen sind dort numerisch gültig. Die 165 FP-Primärfragen besitzen jeweils einen Referenztext, jedoch keine eigenen strukturierten `references`; deren vollständige gesonderte Textauflösung wurde in diesem Audit nicht behauptet. Vor einer Übernahme braucht sie den expliziten Adapter und eine Inhaltsprüfung.

Es gibt keinen buch- oder kapitelübergreifenden Story-Stellenverbund. Genau eine Geschichte enthält zwei **getrennte** Bereiche desselben Kapitels: `NS-0420`, **„Für den Glauben kämpfen“**, Judas 1–4 **und** 17–25. Die Verse 5–16 dürfen daraus nicht zu einem angeblich durchgehend ausgewählten Abschnitt werden. Der alte Story-Lese- und Reflexionslink verwendet nur `references[0]`; dies ist eine nachweisbare Grenze, die ein neuer OLIVA-Adapter bewusst behandeln sollte.

Versnummern allein garantieren zudem keine identische Textsegmentierung zwischen Ausgaben. Der Bestand dokumentiert etwa bei `N-1536` die unterschiedliche Aufteilung von Johannes 10,11–12 zwischen lokalem OTB und lokalem Luther 1912. Der Originalhinweis ist zu erhalten; ein genereller `+1`-Versversatz wäre falsch.

Der Median liegt bei fünf Fragen. 294 Geschichten haben fünf und 102 sechs Elemente. Das Maximum ist **31** bei `NS-0324`, **„Was Gott gereinigt hat“**, Apostelgeschichte 10,1–48. Eine neue Oberfläche sollte deshalb kleine freiwillige Etappen und eine sichtbare Fortsetzung ermöglichen; 31 Fragen als Pflichtblock wären eine neue unnötige Einstiegshürde.

## 5. Ursprüngliche UX und Speichersemanik

Diese Fakten wurden aus dem aktuellen Quellcode gelesen:

- `src/discover-model.js:2–16`: Suche über öffentliche Titel-/Beschreibungs-/Stellen-/Reflexionsfelder, Buch-/Inhaltsfilter, Quellenreihenfolge, jeweils 20 weitere Einträge. Keine Analyse persönlicher Gedanken.
- `src/app.js:1828–1831`: Geschichtenseite mit **Lesen → Verstehen → Reflektieren**, Bibellink, frei zugänglicher Fragenliste und freiwilliger Reflexion. Keine eigene Illustration für jeden kanonischen Storyeintrag.
- `src/story-flow-view.js:3–43`: Antworten, Vor-/Zurücknavigation, richtige Antwort und vorhandener Zusatztext. Der Renderer hat einen Antwortaufdeckungs-Fallback, der im heutigen vollständig als MC vorliegenden Bestand nicht benötigt wird.
- `src/app.js:1837–1840`: Antworten dieser kanonischen Geschichten sind **vorübergehender UI-Zustand**, kein dauerhaft gespeicherter Geschichtenabschluss oder Punktestand. Fragen können übersprungen werden.
- `src/app.js:1498–1510`: `quiz.done` gehört zum separaten Kapitelübungsablauf und darf nicht als gespeicherter Abschluss aller kanonischen Storyfragen ausgegeben werden.
- `src/app.js:1387–1403` und `:1000–1021`: Ein persönlicher Gedanke wird erst nach ausdrücklichem Speichern als Journal-/Reflexionseintrag mit Story-ID und Bibelbezug angelegt; eine Verknüpfung mit einem persönlichen Weg folgt optional.
- `src/app.js:480–545`: Leseverlauf bzw. „erkundetes Kapitel“ sind getrennte Readerereignisse. Daraus darf bei einer Migration kein erfundener Story-, Antwort- oder Verständnisabschluss entstehen.

Dauerhafte neue Fragenwiederaufnahme oder Antwortprotokolle wären sinnvolle **OLIVA-Vorschläge**, aber keine bereits vorhandene Originalfunktion. Hierfür sollten tatsächliche Fragefassung und gewählte Antwort erhalten werden, ähnlich den bestehenden OLIVA-NT-Herkunftssnapshots. Eine falsche Antwort soll einen freiwilligen Ablauf nicht sperren oder den Glauben bewerten.

## 6. Konkrete Originaleinträge für einen visuellen Auftakt

Die folgende Auswahl ist ein **Vorschlag aus dem tatsächlich vorhandenen Katalog**, keine neue Bildfreigabe oder Umsetzung:

| Original-ID und Titel | Stelle | Begründung / vorhandener Anknüpfungspunkt |
|---|---|---|
| `NS-0001` · Am Anfang | 1. Mose 1,1–31 | Zentrale Eröffnung und Naturbildsprache; vorhandenes Schöpfungsmotiv auf Szenengenauigkeit prüfen. Keine humanoide Gottesdarstellung oder naturwissenschaftliche Rekonstruktionsbehauptung erforderlich. |
| `NS-0006` · Da gedachte Gott an Noah | 1. Mose 8,1–22 | Hoffnung und Neuanfang; vorhandenes OLIVA-Taubenbild illustriert daraus nur 8,6–12. Diese konkrete Szene ehrlich beschriften. |
| `NS-0010` · Abram glaubte dem HERRN | 1. Mose 15,1–6 | Sternenhimmel, Frage und Vertrauen; vorhandener OLIVA-Pilot deckt genau diese Stelle ab. |
| `NS-0025` · Der HERR wird für euch streiten | 2. Mose 14,13–31 | Schlüsselgeschichte der Befreiung, starker landschaftlicher Kontrast; neuer sorgfältig gestalteter Exodus-Pilot wäre sinnvoll. |
| `NS-0052` · Der Streit ist des HERRN | 1. Samuel 17,32–50 | Bekanntes AT-Narrativ; vorhandenes Bild zeigt die Vorbereitung 17,38–45, keine ganze Kampfsequenz. Gewaltästhetik vermeiden. |
| `NS-0203` · Schweig und verstumme | Markus 4,35–41 | Sofort verständlicher kurzer Jesusabschnitt, fünf Fragen; bestehendes Sturm-Motiv bietet einen direkten gestalterischen Einstieg. |
| `NS-0241` · In der Krippe | Lukas 2,1–20 | Wiedererkennung und menschliche Nähe; bestehender OLIVA-Pilot passt genau. Nicht pauschal Matthäus und Lukas zusammenmischen. |
| `NS-0249` · Der barmherzige Samariter | Lukas 10,25–37 | Verbindet Verständnis und freiwillige konkrete Nächstenliebe; neuer emotionaler Bildpilot. Als Gleichnis, nicht als nachgewiesenes Ereignis kennzeichnen. |
| `NS-0255` · Der verlorene Sohn | Lukas 15,11–32 | Gnade und Willkommen passen zur OLIVA-Haltung ohne Leistungsdruck; neuer ausdrucksstarker, zurückhaltender Pilot. |
| `NS-0235` · Sie fürchteten sich | Markus 16,1–8 | Vorhandener Oster-Pilot passt genau. Sein Frauen-/Grabmotiv nicht als identische Matthäus-Szene `NS-0189` ausgeben. |
| `NS-0264` · Der Weg nach Emmaus | Lukas 24,13–35 | Lesen, Verstehen und Begleitung werden in einer Geschichte anschaulich; neuer ruhiger Reise-/Begegnungspilot. |

Für die **ersten neuen** Illustrationen wären Samariter, verlorener Sohn, Exodus und Emmaus meine stärkste Ergänzung zu den vorhandenen Bildern. Das wäre eine kleine qualitativ geprüfte Gruppe statt einer ungeprüften Bestellung von 436 Bildern. Mit fünf bis sieben sachlich passenden vorhandenen Motiven kann bereits ein überzeugender Auftakt entstehen. Wiederverwendung darf denselben Moment in Karte, Hero und Quellenansicht meinen; ein allgemeines Buch-/Landschaftsmotiv darf nicht als exakte andere Begebenheit ausgegeben werden.

## 7. Gemessener Textumfang und Aufwandstreiber

| Tatsächlich gemessene unveränderte Datei | Rohbytes | Gzipbytes |
|---|---:|---:|
| `faithpath-nachlese-story-flow.json` | 705.226 | 64.500 |
| `nachlese-stories.json` | 277.350 | 48.834 |
| `nachlese-questions.json` | 3.795.630 | 368.100 |
| `stories.json` einschließlich des getrennten NT-Pools | 1.036.959 | 228.988 |

Die 52 älteren Story-Einheiten ohne NT ergeben in einer kompakten, nur im Audit-Arbeitsspeicher serialisierten Fassung 93.480 Rohbytes / 25.333 Gzipbytes. Eine gleichfalls nur im Arbeitsspeicher gemessene gemeinsame Fassung aus den 436 Storyobjekten und sämtlichen 2.574 Quellenfragen **einschließlich ihrer Herkunft** ergibt 3.177.489 Rohbytes / 410.336 Gzipbytes. Diese Fassung wurde nicht als Runtime-Datei implementiert oder gespeichert.

Das sind Messwerte des Materials, **keine zugesicherte App-, RAM-, Download- oder Bundlegröße**. JSON-Objekte, Metro-/Hermes-Ausgabe, Indizes, Datenmigrationen und Cachetechnik haben eigenen Aufwand. Dennoch ist die Textmenge überschaubar; hunderte hochwertige Bilder würden Größe und Downloads wesentlich stärker prägen.

Die schwierige Arbeit ist die korrekte Quelle-/Alias-/Vers-/Antwortbindung, der eigenständige Anfängerablauf, die sichere Trennung von Lernen und persönlichen Gedanken sowie die Redaktion. Dazu kommen unabhängige Fach-/Rechteprüfung, wiederaufnehmbare lokale Entwürfe, Geräteprüfung und gegebenenfalls kontrollierte Bildpakete. Es gibt hier keine belastbare Termin- oder Versionszusage.

Für eine spätere Architektur wären ein schlanker vollständiger Suchindex, nach Bedarf geladene Buch-/Geschichteninhalte und vollständig offline verfügbare Texte/Fragen sinnvoll. Bilder sollten getrennte, versionierte Ressourcen mit statischem Ersatz und wählbarem Offlineumfang sein. Keinesfalls 436 große Bilder in den ersten Start oder dieselbe technische Pflicht-Precache-Stufe wie Kerntext und persönliche Daten zwingen.

## 8. Grenzen der Quellen-/Rechteaussage

Die Word-/Excel-Herkunft, technische Verifikation und vorhandenen Redaktionsentscheidungen sind belegt. Sie sind keine automatische neue Urheber-/Vertriebsfreigabe aller Frage-, Reflexions- oder Bildinhalte. Auch die vorhandene separate CC-BY-SA-4.0-Angabe für OTB erteilt nicht pauschal dieselbe Lizenz an den Manuskripten oder der App. OLIVA verwendet aktuell seinen dokumentierten Luther-1912-Korpus. Für eine spätere öffentliche App sind genaue Inhaltsrechte, Quellenvermerke, eigenständige redaktionelle Prüfung und Bildrechte weiter zu klären. Für diese Besprechung wurde nichts veröffentlicht oder generiert.
