# FaithPath – AT-Recovery und Integrationsvorprüfung

**Stand:** 18.10.2026  
**Branch:** `content/at-source-recovery-20261018`  
**Basis:** Phase7 `7d4441caf5112c04b8b6af7ddec8c4ee49d0c63a`  
**Entscheidung:** **GO zur isolierten redaktionellen Zweitprüfung und Integrationsentwicklung. NO-GO zum direkten Produktivimport.**

## Tatsächlich durchgeführt

1. Originale Airtable-Tabellen **Einheiten** und **Fragen** live gelesen. Die AT-Einheitsnummern **824 bis 2112** sind vollständig.
2. **39 Bücher, 1.289 Einheiten und 7.009 echte Originalfragen** in 39 einzelne, per Git-Blob-SHA nachvollziehbare JSON-Dateien archiviert. Keine Originalantwort, Bibelreferenz, Erklärung, Schwierigkeit, Quell-ID oder Reflexion in Airtable geändert.
3. Strukturell geprüft: 7.009 eindeutige Frage-IDs, null fehlende Pflichtfelder für Fragen/Antworten/Referenzen/Erklärungen, null doppelte Antwortoptionen innerhalb einer Frage, null verwaiste Fragen. **725 Einheiten haben fünf, 564 sechs Fragen.**
4. Jede Quellfrage einem App-Kapitel zugeordnet und den besonderen Joel-/Maleachi-Nummerierungen gesonderte Transformationsregeln zugewiesen. **13 Frage-Referenzen** benötigen eine solche explizite Umrechnung.
5. Festgestellt: **927 der 929 App-Kapitel** besitzen nach der Quellzuordnung mindestens fünf vorhandene Fragen. Maleachi 3 hat nur **4**, Maleachi 4 nur **1**. Für diese Lücken **fünf gesondert markierte redaktionelle Entwürfe** erstellt.
6. Einen **vorläufigen** 929-Kapitel-Quizplan mit **4.645 Fünfer-Plätzen** bereitgestellt: 4.640 Referenzen auf Originalfragen und fünf neue QA-offene Entwürfe. Die **2.369 übrigen ursprünglichen Fragen** bleiben für die 1.289 thematischen Einheiten erhalten; keine Löschung und keine neue Original-ID.

## Qualitätsrisiken

### P1 – Inhaltliche Abnahme und Querverweise
- Der frühere Airtable-Status `Gegen LU1912 geprüft` ist nicht mit einer frischen unabhängigen Vers-für-Vers-Zweitprüfung gleichzusetzen.
- Original-Joel **3,1–5** steckt in App-Joel **2,28–32**; Original-Joel **4,1–21** in App-Joel **3,1–21**.
- Original-Maleachi **3,19–24** steckt in App-Maleachi **4,1–6**. Alle Originalreferenzen bleiben im Recovery-Master unverändert; der Reader muss beide Nummerierungen erklären können.
- Maleachi-Entwürfe müssen redaktionell und anhand beider offline Bibeln freigegeben werden.
- Die automatische Erstwahl „die ersten fünf pro Kapitel“ ist **nicht** die endgültige inhaltliche Auswahl. Prüfen: Verständlichkeit, Textnähe, nichttriviale Distraktoren, Schwierigkeitsmischung, Dopplungen und Kapitelabdeckung.

### P2 – Quiz-Qualität
| Richtige Antwort | Anzahl | Anteil |
| --- | ---: | ---: |
| A | 3.066 | 43,7 % |
| B | 2.702 | 38,5 % |
| C | 1.103 | 15,7 % |
| D | 138 | 2,0 % |

Antwortoptionen und richtige Indexwerte in den Quelldateien **nicht** automatisch umschreiben. Stattdessen bei der Anzeige reproduzierbar permutieren und die korrekte Lösung nach dem Permutieren exakt wiederfinden; mit Tests für ID-Stabilität und Fortschritt.

### P2 – Datenmodell und Offline-Update
- Kapitelquiz verweisen auf **kanonische Frage-IDs**, nicht auf duplizierte Textobjekte; thematische Einheiten bleiben vollständig erhalten.
- Fortschrittsstände der bestehenden NT-Quiz-Einheiten, der persönlichen Wege und des Journals erhalten. Altes Schema V5, Speicherkeys, Offline-Export/Import und Service-Worker-Updateregeln bleiben intakt.
- Vor einem Merge: beide Bibeln, aktuelle Reader- und Story-Routen, Quizsammlung, Offline-Reload, Update mit Bestandsdaten sowie komplette Paket- und Inhaltsprüfsummen in isolierter QA testen.
- Weder Netlify noch `main` oder die Phase7-Branch-Spitze werden durch die Recovery verändert.

## Exakte Abnahmetrennung

**Technische Quellrückgewinnung:** vollständig, nach Datenbank- und Quell-Snapshotzählung.  
**Automatische Kapitelzuordnung:** als **Vorschlag** mit 929 × 5 vorhanden.  
**Vollständige inhaltliche und theologische Zweitfreigabe:** **OFFEN**.  
**AT in Phase7-App eingebaut:** **NEIN**.  
**Geräte-/Offline-Abnahme einer AT-Integration:** **OFFEN**.

Der Integritätstest kann mit `node scripts/audit-at-source.mjs` wiederholt werden. Besteht er, belegt das die Dokument-/Code-Vertragslage, aber nicht theologisches Verständnis oder UX-Abnahme.
