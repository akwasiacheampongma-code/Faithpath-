# UIUX5 – Architektur und Datenvertrag

Bestehender Vanilla-JS/PWA-Stack, keine neue Abhängigkeit, kein Speicherschlüssel, keine Migration. Basis UIUX3, nicht UIUX4. Alle automatisierten Daten synthetisch.

## Projektionen und Adapter

journal-model.selectJournal(data,{query,filter,limit,books}) verwendet journalMatches und die vorhandenen Datumsregeln. Original-ID/Date/Typ/Subtyp bleiben erhalten; ungültiges Legacy-Datum erscheint als unbekannt. Alle vorhandenen Wege werden aufgelöst, inklusive archivierter; nicht vorhandene Zuordnungen werden nicht erfunden. Journal-Spiegel werden nicht zusätzlich als Reflexionen aufgelistet. 40 Einträge pro Fortsetzung. Keine neue Volltext-Infrastruktur oder persistente Filter.

journal-view erzeugt escaped HTML mit echten Links; ungültige Bibelreferenzen werden vor Reader-Link-Erzeugung geprüft. app.js hält den vorhandenen Such-/Filter-/Limit-Zustand, gibt den Fokus beim Weiterladen zum ersten neuen Eintrag und stellt bei Rückkehr den angeklickten Eintrag/Scroll-Kontext wieder her. Schreiben/Bearbeiten/Verknüpfen/Löschen/Undo bleiben auf den vorhandenen Transaktionen und Record-Deltas.

reviews-model verwendet allReviews und reviewSourceContext. reviews-view stellt genaue Originale/Snapshots samt Datum und späterem Rückblick getrennt dar. Fehlende, mehrdeutige oder nachträglich geänderte Quellen erzeugen keine historischen Ersatztexte. Vollständige Historie ist in 40er-Schritten erreichbar. Kein neues Rückblick-Bearbeiten/Löschen, weil Beweis-/Meilensteinreferenzen geschützt bleiben.

reminders-view fragt die unveränderte gaps-Domainfunktion ab. Tatsächliche Einladungen verwenden ausschließlich gaps(data,now). Für die Erklärung bereits unterdrückter Quellen wird dieselbe Funktion ohne Suppression zu einem fernen Abfragezeitpunkt verwendet; nur Quellen mit bereits vergangener Originalaktivität werden dargestellt. Dies plant oder persistiert nichts. Archiv-, Spiegel- und Quellen-Ausschlüsse bleiben damit beim selben Selector. Wieder zulassen entfernt ausschließlich die vorhandenen Sperrwerte des konkreten Schlüssels. Kein Push, Mail, Timer oder Hintergrunddienst.

## Backup-Vertrag

backup-model.inspectBackupFile(file,{store,validateRefs}) prüft vor dem Lesen die bestehende Grenze 20 × 1024 × 1024 Bytes. Derselbe store.prepareImport- und vollständige Referenzpfad gilt für Prüfen und Import. Die Zusammenfassung enthält nur Bestandszahlen; sie addiert Spiegel nicht als unabhängige Gedanken. Keine privaten Texte in externe Dienste oder Testlogs.

createRestoreSession bindet Kandidat, aktuellen Main-Rohtext und Entwurf-Rohtext ausschließlich im Arbeitsspeicher. Vor Vorschau wird der bestehende Frischecheck des Stores verwendet. Bestandsvergleich und endgültige Bestätigung sind getrennte Schritte. Ein vorhandener Entwurf bleibt unverändert; er kann zum vorigen Stand gehören, was die UI erklärt und vorab separat sichern lässt.

Dateiauswahl besitzt eine Generation. Ein neuer Prüf-/Wiederherstellungsfluss, Abbruch oder Navigation entzieht älteren Dateilesevorgängen den Besitz. Beim Warten auf die vorhandene faithpath-journal-write-Sperre muss die konkrete bestätigte Session auch innerhalb der Sperre weiterhin die aktive Session und der Dialog offen sein. Abbruch, Escape, neue Vorschau und Seitenwechsel verhindern dadurch verspätete Änderungen. Doppelte Bestätigungen werden durch deaktivierten Auslöser und den abgeschlossenen Sessionstatus abgefangen.

Die Speicherung bleibt store.restore: validieren, bisherigen Stand unter KEYS.restore sichern, Main atomar schreiben, erst danach In-Memory-State übernehmen. Zwei belegte Korrekturen: backup() lehnt einen veralteten Tab ab; bei fehlgeschlagenem Main-Write wird die frühere Sicherheitskopie soweit vom Browser erlaubt zurückgesetzt. Ein Browserabsturz zwischen mehreren localStorage-Operationen ist keine vollständige Datenbanktransaktion. Die vorhandene externe Sicherung und Geräteprüfung bleiben wichtig; eine neue Recovery-Migration wurde nicht eingeführt.

Der lokal gespeicherte Rückkehrstand ist keine externe Sicherung und wird beim nächsten Import wieder ersetzt. Datei-Download ist nur angefordert, nicht als dauerhaft geschrieben bestätigt. Aktuelle Daten und Backup sind unverschlüsselt; keine automatische geräteübergreifende Synchronisation.

## Enge Validatoranpassung

Zwei historische Nachlese-Prüfer pinnen zusätzlich Laufzeitdateien aus STABLE1. Die notwendigen Store-Fixes verletzen diese alte Bytebindung. protected-runtime.mjs akzeptiert ausschließlich den bekannten ursprünglichen Store-Digest oder den exakt geprüften UIUX5-Digest. Andere Dateien/Hashes erhalten keine Ausnahme. Historische Manifeste und sämtliche Inhaltsdaten bleiben bytegleich; der Inhalts-Hash bleibt unverändert. Eine künftige Änderung an store.js braucht eine neue explizite Prüfung dieser engen Ausnahme.

## Wartung

Keine Änderung an domain.js, continuity.js, path-review-context.js, drafts.js, journal-storage.js, journal-management.js oder Baum-/Schwertmodulen. Keine automatische Entwicklung aus Schrittabschluss oder Rückblickstatus ohne ausdrückliche Bestätigung. Vier Themes bleiben bestehende Token; neue Gestaltung in journal-reviews-backup.css, für Offline im Build versioniert.

Bekannte kleine Einschränkung: Nach Wechsel eines Journalfilters kann der eingeklappte Summary-Text noch „Filter“ bzw. den vorherigen Typ zeigen. Ergebnisfilter und aktive Schaltfläche sind korrekt; Such-/Filter-Reset bleibt erreichbar. Der unabhängige Review stuft dies als P3 ein, separat dokumentiert für eine spätere gezielte Korrektur. Keine Inhalts- oder Datenintegritätsauswirkung.

Spätere Integration nur nach UIUX5_MERGE_MANIFEST.md auf eigenem, separat freigegebenem Branch.

Die Backup-Dialogüberschrift scrollt gezielt natürlich mit, damit sie bei 320 Pixeln und 200 % Text keine Bestätigungsaktion verdeckt. Beide Stufen haben weiterhin eine eigene Abbrechen-/Schließenaktion. Nur zwei spezifische CSS-Regeln wurden nach der funktionalen JS-Vollregression ergänzt; sämtliche JS-Bytes und übrigen Build-Eingaben bleiben identisch, dokumentiert in style-delta.json. Alle davon betroffenen Abläufe sind auf dem finalen CSS-Build erneut geprüft.
