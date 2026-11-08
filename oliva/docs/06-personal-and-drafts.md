# Iteration 0.2 · Persönliche Vorhaben und gesicherte Entwürfe

06.11.2026. Die eigenständige OLIVA-App wird erweitert; FaithPath-Dateien und das ursprüngliche OLIVA-0.1-ZIP bleiben unverändert.

Historischer Bericht für 0.2. Die inzwischen privat bereitgestellten Verträge zur Rückblickbearbeitung, Löschung, V6-Migration und sitzungsgebundenem Undo stehen in [Iteration 0.7](12-review-editing.md).

## Produktverhalten

„Geführte Wege“ bleiben kurze Lernreisen mit Bibelabschnitten und Einordnungen. „Persönliche Vorhaben“ begleiten ein frei gewähltes Anliegen im Alltag. Sie sind über Wege und Garten erreichbar, ohne ein weiteres Hauptnavigationsziel einzuführen.

Ein Vorhaben benötigt nur einen Namen. Anliegen, erster Schritt und späterer Rückblick sind freiwillig. Aus einer Versaktion lässt sich die konkrete Bibelstelle übernehmen. Weitere Schritte können ergänzt und bearbeitet werden. Ein Häkchen bestätigt lediglich, dass die Person den Schritt ausprobiert hat. Daraus folgt keine behauptete innere Entwicklung und kein Glaubensrang.

Archivieren erhält sämtliche Schritte und Rückblicke. Wiederaufnehmen ist jederzeit möglich. Ein Rückblick speichert den Titel, das Anliegen, den Bibelbezug und die Schritte samt damaligem Status beim Beginn seines Entwurfs. Spätere Änderungen am Vorhaben schreiben diesen Snapshot nicht um. Eine freiwillige Alltagserfahrung muss ausdrücklich selbst bestätigt werden; die App analysiert dafür keine persönlichen Texte.

## Welche Entwürfe jetzt dauerhaft sind

- Anlegen und Bearbeiten eines Gedankens im Journal der Sammlung.
- Anlegen und Bearbeiten eines persönlichen Vorhabens.
- Hinzufügen und Bearbeiten eines eigenen Schritts.
- Schreiben eines freiwilligen Rückblicks.

Noch nicht auf dieses System umgestellt sind die kleinen Eingabefelder für Tagesreflexion im Hub, Erfahrung im Garten, Versnotiz im Reader und Reflexion innerhalb eines geführten Lernwegs. Deren ausdrücklich gespeicherte Einträge bleiben wie bisher dauerhaft; eine allgemeine Draft-Garantie für alle Editorfelder wird nicht behauptet.

## Speichern und Wiederherstellen

Jeder Entwurf besitzt eine stabile ID, einen Editor-Schlüssel, eine Revision und einen Zeitstempel. Eingaben einschließlich ihrer Leerzeichen und Zeilenumbrüche werden nach 300 ms Ruhe gesichert. Beim Bereichswechsel, Unmount und Wechsel der App in den Hintergrund wird zusätzlich sofort gesichert. Ein sichtbarer Status unterscheidet „wird gesichert“, „gesichert“ und „nicht gesichert“.

Ein Browser-Neuladen mit noch nicht gesicherten Änderungen erhält einen `beforeunload`-Schutz, soweit der Browser ihn unterstützt. Ein unerwartetes Beenden durch das Betriebssystem kann letzte, noch als ungesichert angezeigte Zeichen verlieren. Die erfolgreiche lokale Speicherbestätigung ist die verlässliche Grenze; keine App kann einen noch nicht abgeschlossenen asynchronen Datenbankcommit durch bloße UI-Texte garantieren.

„Editor schließen“ behält den Entwurf. Verwerfen ist eine gesonderte Aktion mit ausdrücklicher Bestätigung. Endgültiges Speichern und Entfernen des zugehörigen Entwurfs erfolgen in derselben Zustands-/Datenbanktransaktion. Scheitert diese, bleibt der bereits gespeicherte Entwurf erhalten.

## Datenvertrag und Migration

Das Nutzdatenformat steigt von Version 1 auf **Version 2**. Die physischen Speicherorte bleiben erhalten: IndexedDB `oliva-local-v1`, Store `state`, Eintrag `main`; auf nativen Plattformen die bestehende SQLite-Datei und Tabelle. Es wird keine neue leere Datenbank als Ersatz geöffnet.

`decodeData()` prüft alte V1-Daten zunächst mit dem strikten alten Vertrag. Danach ergänzt es `goals: []`, `drafts: []` und `version: 2`. Persönliche Texte, Fortschritt, Lesezeichen, Markierungen, Einstellungen, IDs und lokale Revision bleiben erhalten. Unbekannte oder beschädigte Versionen werden nicht stillschweigend zurückgesetzt. Der erste erfolgreiche neue Commit speichert das V2-Payload im bestehenden Datenbankeintrag.

V1-OLIVA-Sicherungen bleiben importierbar. Neue V2-Sicherungen enthalten auch Vorhaben und gesicherte Entwürfe. Der Export wartet auf bereits angestoßene Schreibvorgänge. Die Restore-Vorschau nennt zusätzlich die enthaltenen Vorhaben und Entwürfe; die Ersetzung bleibt ausdrücklich zu bestätigen. Ein alter V1-App-Build kann V2-Sicherungen nicht lesen. FaithPath-V5-Sicherungen sind ein anderes Format und weiterhin nicht automatisch importierbar.

## Schutz vor Überschreiben

Hintergrundsicherung und explizite Aktionen verwenden dieselbe geordnete Commit-Warteschlange. Der sichtbare Aktionslock verhindert weiterhin Doppeltippen. Die Datenbank vergleicht unverändert die globale Revision, bevor sie einen Commit akzeptiert.

Zusätzlich muss ein Entwurf sowohl seine stabile ID als auch seine erwartete Revision treffen. Ein inzwischen ersetzter Entwurf darf nicht durch einen alten Editor zurückgeschrieben werden. Notizbearbeitung prüft den ursprünglichen Änderungszeitpunkt; Vorhabenbearbeitung prüft eine eigene Entitätsrevision. Ein gelöschter oder veränderter Ursprung wird nicht automatisch überschrieben.

Pro Vorhaben zeigt die Oberfläche jeweils einen offenen Entwurf. Andere Änderungen wie Schrittbestätigung oder Archivieren warten, bis dieser abgeschlossen oder bewusst verworfen ist. Nach einer tatsächlichen zwischenzeitlichen Änderung kann ein alter Vorhabenentwurf ausdrücklich mit dem aktuellen Stand verbunden werden. Die Wörter bleiben dabei erhalten; endgültig gespeichert wird erst nach Prüfung im Editor. Der ursprüngliche Quell-Snapshot eines Rückblicks bleibt auch dann unverändert.

## Akzeptanz und Prüfung

Die fachlichen Tests prüfen verlustfreie V1-Migration, alte und neue Sicherungen, unveränderte Entwurfsworte, veraltete Entwurfsstempel, atomaren Abschluss, gelöschte/geänderte Notizquellen, idempotente Schritte, unveränderte Rückblick-Snapshots und Archivierung. Store-Tests prüfen Reihenfolge und Fehlerfälle beim Zusammenspiel von Autosave und ausdrücklich gespeicherter Aktion.

Browserprüfungen führen reale Neustarts, Journalbearbeitung, Anlegen eines Vorhabens, Schritte, Rückblick, spätere Titeländerung, Archiv/Wiederaufnahme, ausdrückliches Verwerfen, eine bereits existierende V1-Datenbank, Bibelbezug aus einer Versaktion und Export nach einem Bereichswechsel aus. Die neue Editoransicht wird bei 320, 390 und 1.440 CSS-Pixeln mit Axe geprüft. Maßgebliche Ergebnisse stehen in `docs/evidence/unit-results.json` und `docs/evidence/e2e-results.json`; keine physische Geräteabnahme wird daraus abgeleitet.

## Weitere Grenzen

Cloud-Sync, Authentifizierung, KI-Begleiter und ein FaithPath-V5-Import sind weiterhin offen. Ein vollständiger Release-übergreifender Service-Worker-Updateversuch und native Crash-/SQLite-Tests stehen aus. Rückblicke werden in dieser Version als abgeschlossene persönliche Aufzeichnungen bewahrt; eine nachträgliche Rückblickbearbeitung/-löschung und ein vollständiges persönliches Historienmodell sind weitere Arbeit. Die Daten liegen weiterhin lokal und ohne zusätzliche App-Verschlüsselung.
