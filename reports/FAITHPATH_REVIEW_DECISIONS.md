# Abschluss der vier Mapping-Prüffälle

Basis: develop/v4, Commit dc1e6782ef142de528c4c1b023ce96a70fc6753f. Nur vier Storyzuordnungen und ihre Prüfmetadaten geändert; kein neuer Commit, Push, Deploy oder Main-Merge.

| FP-ID | Entscheidung | Ergebnis |
|---|---|---|
| FP-0120 | KEEP_AS_EXCEPTION | Heilungsergebnis und Zuspruch/Reaktion sind unterschiedliche Fragen. Eigenständige FP-Frage in NS-0274; kein bestätigtes Match zu N-1466. |
| FP-0147 | APPROVE | Beide Fragen/Antworten zum guten Hirten sind sinngleich. Die Aussage steht im lokalen OTB-Datensatz unter Johannes 10,11 und im lokalen Luther-1912-Datensatz unter 10,12. N-1536 ist belegt; beide Quellreferenzen bleiben unverändert. |
| FP-0151 | KEEP_AS_EXCEPTION | Name und Herkunft sind unterschiedliche Fragen. Die finale N-1544-Antwort betrifft Bethanien, nicht den Namen. Eigenständige FP-Frage in NS-0288; kein bestätigtes N-Fragenmatch. |
| FP-0239 | KEEP_AS_EXCEPTION | Grund und Verlauf/Folgen der Bestrafung sind unterschiedliche Fragen. Eigenständige FP-Frage in NS-0326; kein bestätigtes Match zu N-1761. |

Die Original-Mapping-IDs und SINNGLEICH-Klassifikationen bleiben als Quellnachweis in den Entscheidungen erhalten. Der effektive Merge klassifiziert drei Fälle ausdrücklich als FAITHPATH_ONLY. Die historischen PDF-Aggregate wurden nicht umgeschrieben. Alle vier zusätzlichen Flow-Items bleiben separat; keine neue Deduplizierung.

Keine Änderungen an Fragen, Antworten, correct_index, Referenzen oder IDs. Byte-Hashes der FP-/N-Quellpools und kanonischen Storydefinitionen sind unverändert. Der Validator prüft zusätzlich, dass der übrige Storyfluss exakt dem Ausgangsstand entspricht.

Validator: PASS. FP: 1.560/1.560 eindeutig; N: 2.314/2.314 eindeutig; Kapitelquiz: 1.300; Storys: 436; verifizierte FP-Storyzuordnungen: 260; REVIEW_REQUIRED: 0; content_conflicts: 0; qa_evidence_gaps: 0; unmaterialized_corrections: 0. Effektive Klassen: 92 EXAKT, 75 SINNGLEICH, 89 FAITHPATH_ONLY im Storybereich, 4 historische KONFLIKT-Fälle bereits aufgelöst. Alle 146 HIGH- und 28 MEDIUM-Zuordnungen sind verarbeitet.

Status für die Daten und vier Entscheidungen: READY_FOR_RELEASE_GATE. Release: NOT_AUTHORIZED. Readerintegration und neuer versionierter Build aus dem vorherigen Preflight sind weiterhin ausstehende Arbeiten am Release-Gate und wurden in diesem ausdrücklich beschränkten Lauf nicht bearbeitet.

Alle geforderten Entscheidungsfelder, konkrete DOCX-Absätze, XLSX-Zeilen, PDF-Seiten, Bibeltexte und SHA-256-Nachweise stehen in `faithpath-review-decisions.json`.
