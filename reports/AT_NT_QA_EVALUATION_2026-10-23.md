# FaithPath · AT-Prüfung nach NT-Finalmaster-Standard

**Stand:** 23.10.2026  
**Arbeitsbranch:** `content/at-nt-qa-20261023` (Abzweig von `content/at-source-recovery-20261018`)  
**Entscheidung:** **NO-GO für automatischen Import oder Produktivfreigabe.**

## 1. Referenzmaßstab

NT-Referenz: `NT_QUIZ_FINAL_IMPORT_REPORT.md`, insbesondere `FAITHPATH_IMPORT` mit `qa_status=FREIGEGEBEN`, `approval=FREIGEGEBEN`, `import_ready=JA`. Diese Marker dürfen im AT **erst nach** einer tatsächlichen unabhängigen Inhaltsprüfung vergeben werden. Die Quelle `source_qa_status=Gegen LU1912 geprüft` ist kein Ersatz dafür.

## 2. Umfang und heute vorgenommene strukturelle Erstbewertung

- 39 AT-Bücher, 1.289 Einheiten, **7.009 Originalfragen**.
- 929 Kapitel, 4.645 geplante Kapitelquiz-Slots (4.640 Quellfragen-Referenzen + fünf redaktionelle Maleachi-Entwürfe).
- 2.369 Originalfragen bleiben außerhalb dieser Kapitel-Erstauswahl in thematischen Einheiten verfügbar. Die Quellfragen dürfen nicht gelöscht oder stillschweigend umgeschrieben werden.
- Für sämtliche 39 Bücher wurden Antwortindex 0–3 gegen den als A–D bezeichneten richtigen Buchstaben sowie Dopplungen unter den vier Optionen maschinell kontrolliert: **0 dabei gefundene Index-/Buchstabenwidersprüche und 0 vollständig identische Antwortalternativen**.
- **396 Erklärungen haben weniger als 55 Zeichen**; diese Zahl ist ein Hinweis auf Prüfbedarf und kein Beleg für sachliche Fehler.
- Die Original-Verteilung korrekter Antworten ist A=3.066, B=2.702, C=1.103, D=138. Besonders auffällig: Prediger 60/60 A, Psalmen 489/750 A, Sprüche 112/155 A. **Kein blindes Verschieben der Antwortpositionen in den Quelldaten**; etwaige UI-Durchmischung muss deterministisch richtig auf den neuen Index zeigen.
- Inhaltliche/theologische 100%-Prüfung **nicht erfolgt**. Keine automatische Aufwertung nach `FREIGEGEN`.

## 3. NT-Prüfkriterien für jede AT-Frage

1. **Textbeleg**: Verse in LU1912 und OTB lesen; Fragen- und Antwortaussagen sind durch die korrekte Bibelstelle belegt.
2. **Genau eine Lösung**: keine zweite ebenfalls richtige Antwort, keine uneindeutige Auslegung.
3. **Drei plausible Distraktoren**: sachlich falsch, aber nicht lächerlich leicht; ähnlich in Form und Länge.
4. **Präzise Frage**: ohne sprachliche, grammatische oder fachliche Unklarheit.
5. **Erklärung**: korrekt, verständlich, sinnvoll begründet und nicht nur Antwort wiederholt.
6. **Theologische Genauigkeit**: strittige Deutungen nicht als zwingende Tatsachenprüfung; prophetische/poetische Bildsprache sorgfältig.
7. **Kapitelabdeckung**: fünf ausgewählte Fragen decken unterschiedliche zentrale Inhalte ab, keine redundante Stichprobe.
8. **Schwierigkeit**: sinnvoller Mix aus Textwissen und echtem Verständnis.
9. **Formale Integrität**: originale IDs erhalten, exakt vier einzigartige Optionen, richtiger Index und Quellen-Nachweis.
10. **Buch- und Verszählung**: insbesondere Joel und Maleachi Quellzählung vs. App-Kapitel kontrollieren.
11. **Zweitprüfung**: Korrektur, Verse, Optionen und Erklärungen unabhängig gegenlesen, finalen Datensatz erneut prüfen.
12. **Regression**: erst danach AT-Reader, Quiz, PWA-Cache, Offline-Update, IDs und Nutzerdaten prüfen.

Status pro Frage: `OFFEN`, `IN_PRUEFUNG`, `KORREKTUR`, `BLOCKIERT`, `VERIFIZIERT`. Freigabe/Import nur bei nachweislich abgeschlossener Zweitprüfung und **0 offenen Blockern**. Kapitel werden gesondert auf Auswahl/Abdeckung geprüft.

## 4. Konkrete redaktionelle Auffälligkeiten (keine Vers-Vollabnahme)

- `824-Q1` (1 Mose 1,1): Antwortalternativen wie „Den Garten Eden“ und „Nur das Licht“ sind offensichtlich unplausibel. **Überarbeiten – Distraktoren**.
- `824-Q2` (1 Mose 1,3): Antwort durch die Frage fast vorgegeben; **Überarbeiten – Trivialität/Distraktoren**.
- `824-Q5` (1 Mose 1,28): richtige Option ist viel länger und umfassender als die übrigen; **Überarbeiten – Längenhinweis**.
- `AT-2112-Q5` und fünf redaktionelle Maleachi-Entwürfe: gesonderte Prüfung und Zuordnung zur App-Maleachi-Zählung erforderlich.

Alle anderen Fragen bleiben ungeachtet älterer Airtable-Vermerke für die hier definierte unabhängige Zweitprüfung **OFFEN**.

## 5. Workflow und unveränderliche Schutzregeln

1. Originalfragen aus `content/at-source-recovery/books/*.json` **nur lesen**, Auswahl aus `chapter-candidate-map.json` lesen. Alle 7.009 Fragen in ein QA-Ledger übernehmen.
2. Für jede Frage Originaltext/-optionen/-Index/-Ref/-Erklärung und Einzelbewertung/Schweregrad/Korrektur/Zweitprüfer speichern. Nicht nur den Kapitel-Quiz-Vorschlag bewerten.
3. Redaktionell erst die Frage selbst prüfen, dann die 929 Kapitel-Fünferauswahlen kuratieren; bei Bedarf aus vorhandenen sechs Fragen andere Kandidaten wählen, ohne Quell-IDs zu vernichten.
4. Die fünf Maleachi-Entwürfe gesondert erstellen und gegen beide Bibeln prüfen. Quelle-/App-Verszählung bei Joel/Maleachi offenlegen.
5. Freigegebene Fragen als versionierten Master ausgeben (inklusive Diff/Historie/Quelle/Hashes). Freigabe auf tatsächliche Endwerte beziehen; neue Korrekturen erzwingen Rückprüfung.
6. Erst nach 100%-Freigabe und technischer Regression einen **separaten**, reproduzierbaren AT-Import entwickeln. **Keine** automatische Änderung an `main`, `develop/v4`, Netlify oder am aktuellen AT-Quellarchiv.

## 6. Stand nach diesem Schritt

**Abgeschlossen:** NT-Prüfstandard auf AT übertragen, strukturierte Bucherstauswertung aller 39 Bücher, klare redaktionelle Auffälligkeiten und Freigaberegeln erfasst.

**Nicht abgeschlossen:** 7.009 einzelne Bibeltextabgleiche, Auswahl-Qualität für 929 Kapitel, Zweitprüfung, fünf Maleachi-Ergänzungen, Import und Geräte-/Offline-Tests.

**Freigabe:** `NO-GO`; keine Beschönigung durch maschinell bestandene Strukturtests.

## Quellen

- `NT_QUIZ_FINAL_IMPORT_REPORT.md` (NT-Import- und Strukturstandard)
- `reports/AT_SOURCE_RECOVERY_20261018.md` (AT-Daten und offene Prüfungen)
- `content/at-source-recovery/chapter-candidate-map.json` (ausdrücklich nicht redaktionell freigegebene Auswahl)
- `content/at-source-recovery/books/*.json` (kanonische Originalfragen)
