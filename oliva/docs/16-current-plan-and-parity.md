# Aktueller Plan und FaithPath-Parität

Planungsabgleich vom 08.11.2026, fortgeschrieben am 10.11.2026. Dieser Abgleich beantwortet die Planungsfrage und hält die tatsächliche Entwicklung fest. Der damalige 0.9-Umfang und die Prioritäten des Master-Prompts bleiben nachvollziehbar. Für weitere offene Aufgaben werden keine Versionsnummern oder Termine festgelegt.

## Festgelegter Umfang von 0.9

- Römer erhält das bereits tatsächlich generierte **Schwert der Gnade** mit drei transparenten PNG-Varianten und nachvollziehbaren Motivquellen.
- Eine gemeinsame Bildregistrierung unterstützt Johannes und Römer. Die Lesespur verwendet die tatsächlichen **21 beziehungsweise 16 Kapitel**; alle 66 kompakten Vektorschwerter bleiben erhalten.
- Die Startseite zeigt für Johannes und Römer die großen Buchbilder und bietet für alle 66 Bücher einen direkten Zugang zur Buchschwertansicht. Der vorhandene Lesezugang bleibt erhalten.
- Bilder, Fehler-/Retryzustände, Offline-Nutzung, reduzierte Bewegung, kleine/große Displays und unveränderte persönliche Daten müssen am integrierten Stand geprüft werden.
- Eine portable Prüfung nativer Exportdateien wird vorbereitet. Ein Asset-/JavaScriptnachweis ist keine Geräte-, Decoder- oder Simulatorprüfung.

Die Integration von 0.9 ist inzwischen tatsächlich abgenommen: 120/120 Fachtests, ein vollständiger 76/76-Browserlauf und 16/16 gezielte Buchbildfälle bestanden. Native JS-/Assetexporte und echter 0.8→0.9-Updateversuch erfolgreich. 0.9 ist seit 08.11.2026 um 19:49:19 UTC eigentümerprivat bereitgestellt. Quelle und Prüfgrenzen: [0.9-Buchbildbericht](17-book-gallery-v09.md). Diese Fortschreibung ändert keine der nachfolgend ausdrücklich offenen Paritätslücken.

## Bestätigte Paritätslücken

Verglichen wird der unveränderte FaithPath-Snapshot [`a519ce898fa33907b07d5ac7a585595127556183`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/a519ce898fa33907b07d5ac7a585595127556183). Die Aussage „im Bestand implementiert“ ist kein neu durchgeführter physischer Gerätetest der alten Anwendung.

| Vorhandener FaithPath-Bestand | Tatsächlicher OLIVA-Stand |
| --- | --- |
| Zusammenhängender Fließtext mit auswählbaren Versen, Markierungen und optionalem Lesefokus | Seit 0.11 Fließtext mit auswählbaren Einzelversen und temporärem Lesefokus; alte Blockansicht bleibt wählbar. Mehrversauswahl und eigene Kopieraktion sowie echte native Geräteabnahme fehlen weiter. |
| Vollständiger NT-Katalog: **1.300 Fragen, 260 Kapitel, 27 Bücher, genau fünf Fragen pro Kapitel**, vier Antwortoptionen, korrekter Index, Referenz, Erklärung und stabile `faithpath_id` | Seit 0.12 vollständig aktiv und privat bereitgestellt. V8 trennt neue Antworten und belegte historische Abschlüsse; vorhandene Archive werden nur ausdrücklich aktiviert. 225 Fachtests, ein vollständiger 108/108-Browserlauf, beide nativen statischen Katalogprüfungen und der reale Updateversuch bestehen. Die neun thematischen Pilotfragen bleiben eigenständig. |
| Gemeinsamer Katalog mit **436 Geschichten und 2.479 Frageelementen**, mit dokumentierten Ausnahmen | Fünf neue illustrierte Erzählpiloten; kein vollständiger Katalogtransfer. Die aktiven Story-Flow-Fragen sind vom NT-Kapitelkatalog getrennt: Die erneute ID-Prüfung findet keine Überschneidung. Die frühere Überlappungsannahme war unzutreffend; genaue Dateihashes und Mengengrenzen stehen in der NT-Vorbereitung. |
| 18 Lebensthemen mit vorhandener Redaktion | Neun eigene geführte Wege; kein vollständiger Inhaltsabgleich. |
| Belegte persönliche Wege, Gedanken, Rückblicke und Meilensteine sind Baumästen zugeordnet | Die A51-Darstellung mit sieben Stadien ist integriert; die persönliche Astzuordnung fehlt. |
| Erinnerungen mit Zurückstellen, Wiederaufnahme und Verwerfen | Seit 0.10 als freiwillige **In-App-Einladungen** integriert; lokale Kontrollen, 21/35 Tage und 14 Tage zurückstellen. Markierungen ohne Datierung und automatische Übernahme alter Unterdrückungsentscheidungen fehlen. Keine Push-, E-Mail- oder Hintergrundbenachrichtigungen. |
| Umfangreiche persönliche Zeitlinie und Vorher-/Nachher-Kontexte | Vorhaben, Archiv, geschützte Rückblicke und Snapshots sind vorhanden; vollständige Historienparität fehlt. |
| Vier Themes und zwei Übersetzungen | OLIVA bietet Hell/Dunkel und Luther 1912. |

Der ursprüngliche Fließtext ist in `src/verbunden/reader-flow.js` implementiert und gruppiert jeweils fünf inline dargestellte Verse zu Absätzen; `reader.css` und `app.js` binden ihn ein. Der bis 0.10 verwendete OLIVA-Blockreader bleibt seit 0.11 als Alternative erhalten; eine gemeinsame Absatzprojektion mit Plattformrenderern ist nun integriert.

Der NT-Bestand ist durch `data/stories.json` und `NT_QUIZ_FINAL_IMPORT_REPORT.md` im Snapshot belegt. Der Originalbericht bezeichnet den freigegebenen Master als maßgeblich und dokumentiert vollständigen Import sowie technische Abnahme. **Der Bestand ist kein unfertiger Fragenentwurf. Seine technische Übernahme ist seit 0.12 implementiert, lokal abgenommen und eigentümerprivat bereitgestellt.** Der aktuelle Importumfang ist in [FaithPath-V5-Import](07-faithpath-import.md) beschrieben.

Für OTB liegt im selben Snapshot `data/bibles/OTB-LICENSE.txt` vor: **Open Translation Bible – Deutsch**, Quelle `OpenTranslationBible/open-bible`, **CC BY-SA 4.0**, mit getrennt gehaltenem Bibeltext und Anwendungscode. Ihre fehlende OLIVA-Einbindung wird deshalb nicht pauschal als unbekannte oder unbrauchbare Lizenz dargestellt. Bei einer Einbindung sind die zugehörigen Lizenzpflichten umzusetzen.

## Planungsstand von Fließtext und NT-Katalog

Für die vollständige Übernahme des ursprünglichen Fließtextmodus und des NT-Katalogs war in der bisherigen Roadmap **weder eine verbindliche Version noch ein Termin oder konkret abgegrenztes Arbeitspaket** festgelegt. Die frühe Matrix wählte stattdessen „eigene kuratierte Fragen“, P1. Das erfüllt die vollständige Fragenparität nicht.

Zum Zeitpunkt dieses Planungsabgleichs waren beide Punkte ausdrückliche Planungslücken gegenüber der angestrebten FaithPath-Parität. Sie gehörten nicht zum festgelegten 0.9-Umfang und wurden durch die Planungsfrage keiner erfundenen Folgeversion zugeordnet. Die später tatsächlich umgesetzten Reader- und NT-Arbeitspakete sind unten mit ihren eigenen Verträgen und Prüfungen dokumentiert; der fertige NT-Inhalt wurde dafür nicht neu erfunden.

## Weitere Arbeit ohne Releasezuordnung

Im bestehenden Backlog stehen weitere Buchbilder, freiwillige Erinnerungen, zusätzliche Kapitelredaktion, der restliche Paritätsabgleich, Anfänger-Usability und unabhängige Inhaltsprüfung. Es gibt dafür keinen vollständig durchgeplanten Releasekalender. Die Planungsfrage ordnet diese Aufgaben nicht neu.

Supabase-Schema und Berechtigungsentwürfe sind Vorbereitung, kein aktiver Auth-/Syncbetrieb. Der optionale KI-Begleiter ist konzipiert und benötigt einen realen serverseitigen Dienst mit belegten Quellen, transparenter Unsicherheit und Abschaltung. Audio ist nicht angeschlossen. Anbieter, Cloudregion, Audioquelle, zusätzliche Übersetzungen und konkrete Betriebs-/Vertriebsentscheidungen sind noch offen.

## Was die Gesamt-Definition-of-Done noch verlangt

1. Priorisierte Bestandsparität tatsächlich implementieren und gegen den vorhandenen Umfang abnehmen.
2. Bildwelt und Buchillustrationen im geforderten Umfang ausbauen; historische/theologische und rechtliche Prüfung sauber trennen.
3. Den Einstieg mit echten Menschen ohne Bibelwissen prüfen; automatisierte Tests ersetzen diese Beobachtung nicht.
4. Echte iOS-/Android-Geräte einschließlich SQLite, Tastatur, großer Schrift, VoiceOver/TalkBack, Offline-Lifecycle, Speicher und Energie abnehmen.
5. Ausstehende Cloud-/KI-Funktionen mit realen Diensten, kontrollierten Berechtigungen, Datenschutz und nachweislichen Quellenverträgen umsetzen; Audio benötigt zusätzlich geklärte Quellenrechte.
6. Reproduzierbare native Installationspakete, Signing, Betriebs-/Update-/Rollbackverfahren und die konkrete Veröffentlichung abnehmen.

Die seit 08.11. ausdrücklich beauftragte öffentliche GitHub-Quellensicherung ist von der eigentümerprivaten Web-Vorschau getrennt. FaithPath, `main` und historische Versionstags bleiben unverändert. Ein geprüfter Zwischenrelease erklärt den gesamten Master-Prompt nicht für abgeschlossen.

## Fortschreibung nach der 0.9-Abnahme

Der vorhandene Backlogpunkt freiwillige In-App-Einladungen ist nun im tatsächlichen 0.10-Kandidaten implementiert. 154 Fachtests und sechs gezielte Browserfälle sowie beide nativen JS-/Assetexporte und der echte 0.9→0.10-Updateversuch bestehen. Auch ein einzelner vollständiger 82/82-Browserlauf, der echte PWA-Wechsel und die eigentümerprivate Bereitstellung sind inzwischen erfolgreich; Quelle und HTTP-/Zugriffsbelege stehen im Einladungsbericht. [Vertrag](18-in-app-invitations.md). Das ist eine durchgeführte Iteration, kein nachträglich erfundener Releasekalender. Fließtext und fertiger NT-Katalog bleiben als aktive Funktionen weiterhin offen.

## Fortschreibung im Reader-Arbeitspaket 0.11

Der tatsächliche Kandidat 0.11 enthält Fließtextabsätze, Einzelversalternative, gemeinsame Versaktionen, einen temporären Lesefokus und überarbeitete Fragmentmessung. 168 Fachtests, sieben gezielte Fließtextfälle, drei Fokusfälle und vier Reader-Fortsetzungsfälle sind erfolgreich; auch der vollständige 92/92-Lauf, der echte PWA-Wechsel und die eigentümerprivate Bereitstellung sind inzwischen erfolgreich. Native JS-/Assetexports sind erfolgreich, echte Geräte-/Screenreaderprüfung steht aus. Die Mehrversauswahl und die ursprüngliche eigene Kopieraktion fehlen weiter; diese Iteration behauptet keine vollständige Readerparität. Der persönliche Fortschrittsvertrag bleibt V7.

Die nächste Bestandsvorbereitung hat den fertigen NT-Katalog tatsächlich Feld für Feld geprüft: [NT-Vorbereitung](20-nt-catalog-preparation.md). Die stabilen IDs lauten mit Bindestrich `FP-0261` bis `FP-1560`. Die 436 Stories/2.479 Story-Flow-Frageelemente sind ein anderer aktiver Pool und überschneiden sich nicht mit den 1.300 NT-Kapitelfragen. Die damalige Vorbereitung allein implementierte noch keine Quizoberfläche oder Fortschrittsmigration. Die spätere Umsetzung ist im folgenden Abschnitt getrennt dokumentiert.

## Tatsächlich abgenommenes NT-Arbeitspaket 0.12

Der vollständige Original-NT-Katalog ist mit plattformgerechter Oberfläche, versionierten Antwortsnapshots, neutraler V8-Migration und belegter historischer Übernahme integriert. Fragen wurden nicht neu erzeugt. **225/225 Fachtests und ein einzelner vollständiger 108/108-Browserlauf bestehen**, ohne Skip, Flaky oder Wiederholung. Beide nativen Exporte enthalten alle 1.300 Fragen statisch feldgleich; der reale 0.11→0.12-Workerwechsel ist erfolgreich.

Seit **10.11.2026, 03:51:05 UTC** eigentümerprivat bereitgestellt. Der frühere 107/108-Lauf bleibt als Diagnose erhalten; eine veraltete exakte Import-Testerwartung wurde ohne Produktänderung korrigiert. Auch die historischen roten 0.11-CI-Läufe bleiben unverändert. [NT-Vertrag und tatsächliche Belege](23-nt-study-and-progress.md).

Der eigenständige 0.12-Quellcheckpoint mit Tag, ZIP und SHA-256 sowie die beauftragte GitHub-Sicherung folgen nach diesem Dokumentcheckpoint. Deren noch nicht bestätigte Kennungen werden nicht vorweggenommen; die tatsächliche neue Remote-CI wird separat geprüft. Danach die verbleibende Readerparität anhand der [Quellvorbereitung](evidence/reader-parity-preparation/reader-parity-preparation.md) umsetzen. Die übrigen Bestandslücken und die Gesamt-Definition-of-Done bleiben offen; neue Versionen oder Termine werden nicht festgelegt.
