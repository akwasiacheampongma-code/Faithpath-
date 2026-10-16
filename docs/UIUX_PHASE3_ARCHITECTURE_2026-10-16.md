# UIUX3 – Architektur und Übergabe

Basis: `574687a` (UIUX2-Anwendung unverändert, verbindliche Phase-3-Spezifikation hinzugefügt). Vanilla-JS-PWA, keine neue Abhängigkeit.

## Verantwortlichkeiten

- `paths-model.js`: schreibfreie Projektionen. Übersicht übernimmt die bestehende Today-Auswahl; andere Wege bleiben in Speicherreihenfolge. Details verwenden `pathContext`, `pathEvidence`, `timeline`, `allReviews`, `gaps`. Legacy-Spiegel nach gleicher Text-/Datum-Regel wie Domain unterdrücken; keine Datenbereinigung durchführen. Bibelstellen über `sameRef` deduplizieren. Historie in 40 er-Schritten aufbauen; Originalrouten bleiben erhalten.
- `paths-view.js`: escaped HTML aus explizitem Modell und bestehenden App-Helfern. Eine Kartenverknüpfung pro Weg, ein aktueller Schritt, aufklappbare Gründe/ältere Schritte, echte Originalgedanken und paginierte Geschichte. Keine Schreibaktionen.
- `tree-view.js`: die bestehenden `treeLevel`, `developmentCount`, `treeBranches` konsumieren. Originale `treeBranchView` inklusive sieben Grafiken und Zweiggeometrie unverändert. Liste dokumentierter Quellen; textlicher Zugang zu Wegen ohne Zweigbeleg. Keine neue Zählung, kein simuliertes Wachstum.
- `path-review-context.js`: exakten Bezug eines Rückblicks projizieren. Neue Weg-Rückblicke erhalten optional `sourceSnapshot` auf dem bestehenden Rückblickdatensatz: `{key,title,text,at,stepId}`. Das Formular beziehungsweise die fällige Einladung hält diesen Bezug fest; Entwürfe nehmen ihn über bestehende `args` mit. Später bearbeitete Schritte ersetzen den gespeicherten Wortlaut nicht. Alte Rückblicke ohne Wortlaut bekommen einen ehrlichen Hinweis. Eindeutige Markierungen erhalten nur einen Original-Link, keinen erfundenen historischen Text.
- `app.js`: bestehende Datenaktionen/Formulare bleiben zuständig. Kleine Adapter anstelle der früher eingebetteten Ansicht. Eingaben/Transaktionen, Konflikt- und Quota-Schutz bleiben bestehen. Schrittaktionen setzen den Tastaturfokus nach Rendern sinnvoll zurück. `?step=ID` öffnet bei vorhandener ID den exakten Schritt, gegebenenfalls in früheren Schritten; kein Ersatz durch aktuellen Schritt.
- `personal-journey.css`: Regeln an `.paths-page`, `.path-page`, `.tree-page` gebunden. Bestehende Theme-Token, Safe Areas, Kontraste und Fokuskonventionen weiterverwenden. Kleine Baumstufen ohne Marker dürfen kleiner sein; sonst Platz für vorhandene 44 px-Marker erhalten.

## Datenvertrag und Grenzen

V5, Speicherschlüssel, Store-Normalisierung, Importvalidierung und Migrationen bleiben unverändert. Es gibt eine **additive optionale Metadatenergänzung für neu angelegte Rückblicke**, keinen völlig unveränderten neuen Record-Aufbau: `sourceSnapshot` nur bei Wegbezug; `sourceAt` als ursprünglicher Einladungstimestamp bei anderen Quellen. Ältere Datensätze werden nicht nachträglich verändert. Export/Import bewahrt diese bestehenden offenen Record-Felder. Roundtrip, Entwurfswiederaufnahme, parallele Bearbeitung und Speicherfehler sind ausdrücklich geprüft.

Journal-/Reflexionstexte werden nicht als historische Kopie dupliziert. Ihre bisherigen Änderungs-/Löschregeln gelten weiter. Wurde eine Quelle seit der Einladung bearbeitet, wird der heutige Text nicht als damaliges Original ausgegeben. Ein Weg-Snapshot bleibt als bewusst festgehaltener Rückblickbezug erhalten; die Löschbestätigung weist bereits darauf hin, dass Rückblicke und dokumentierte Entwicklung in der Geschichte bleiben. Fehlende/mehrdeutige IDs werden nicht rekonstruiert. Persönlicher HTML-Text wird escaped, Routen-IDs werden kodiert, importierte Routen nicht übernommen.

Schrittabschluss, Quiz und Kapitelereignisse beeinflussen die Baumstufe nicht. Nur vorhandene ausdrückliche Entwicklungsbestätigungen zählen. `domain.js`, `tree-branches.js`, `continuity.js`, `store.js`, Journal-/Entwurfsschutz, beide Bibeln und alle Fragen sind bytegleich zur Basis.

## Separater Reader-Fix

Bei 1440×1000 lag die untere vermeintliche Lesegrenze an der Oberkante der seitlichen Navigation. Psalm 117 wurde deshalb fälschlich als nicht vollständig sichtbar eingeordnet und anschließend vom Kapitelende-Observer direkt beim Öffnen gezählt. `chapterOpeningBottom` übernimmt die vorhandene geometrische Footer-Erkennung: Nur eine breite, am unteren Viewportrand liegende Navigation begrenzt den Lesebereich. Sonst gilt die Viewporthöhe. Kein spekulativer Umbau von `scrollY`, keine Änderung historischer Ereignisse oder Zählregeln.

## Weiterentwicklung

Neue Ansichtslogik zuerst als reinen Selektor testen, danach echte UI-Aktionen prüfen. Keine zweite Speicherautorität aufbauen. Die verbleibende große App-Datei schrittweise entlang konkreter Nutzeraufgaben entlasten; ein globaler Rewrite ist nicht erforderlich. Journal-/Erinnerungsneugestaltung bleibt außerhalb UIUX3.
