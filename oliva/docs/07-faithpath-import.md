# Iteration 0.3 · Sicherer FaithPath-V5-Import

06.11.2026. Historischer Implementierungsbericht für 0.3. Seit 0.4 gelten Payload V4 und separate lokale Archiv-Blobs; der additive Importvertrag bleibt bestehen. Aktueller Speichervertrag: [Iteration 0.4](08-continuity-and-offline.md). Eigenständige lokale Umsetzung auf Grundlage des belegten Exportvertrags aus dem unveränderten Snapshot `a519ce8`. Keine Übernahme von FaithPath-Quellcode oder redaktionellen Bibelerklärungen. Synthetische Testdaten, kein Export einer echten Person.

## In der App ausprobieren

**Einstellungen → FaithPath-Daten mitnehmen.** JSON-Datei auswählen oder Inhalt einfügen. Die Vorschau zeigt Ergänzungen, schon bekannte Einträge, Konflikte und Archivgrenzen. Auswahl, Prüfung und Abbruch schreiben keine Inhalte. Erst **Jetzt sichern und Import übernehmen** erstellt Rückkehrsicherung und neuen Bestand in einer gemeinsamen Datenbanktransaktion.

Im Importbereich lassen sich Originalquellen öffnen und wieder exportieren. **Rückkehr prüfen** zeigt ausdrücklich, dass auch spätere Änderungen durch den vorherigen Stand ersetzt werden. Die endgültige Rückkehr braucht einen gesonderten Klick; ein Export des aktuellen Stands wird angeboten. Es gibt genau eine lokale Rückkehrsicherung. Der nächste erfolgreiche Import ersetzt sie; eine erfolgreiche Rückkehr verbraucht sie. Bei Datenbankfehlern bleibt sie unverändert. Sie ersetzt keine externe Gerätesicherung.

## Tatsächlicher Quellvertrag

Ein regulärer FaithPath-Export hat außen `app: FaithPath`, **App-Version 4**, `schemaVersion: 5` und innen `data.version: 5`. Der nackte V5-Zustand wird ebenfalls angenommen. Recovery-Dateien und Editorentwürfe sind andere Formate und werden nicht als reguläre Sicherung behandelt. Maßgebliche Bestandsdateien: `src/store.js`, `src/import-validation.js`, `src/backup-model.js`, `src/bible-notes.js`, `src/path-review-context.js`, `DATA_CONTRACTS.md`.

| Original | Aktive Übernahme | Bewahrte Grenzen |
|---|---|---|
| Persönlicher Weg | Vorhaben mit Titel, Anliegen, gültigen Schritten, Archivstatus, erster zuordenbarer Luther-Stelle und Herkunft | Keine Vermischung mit den neun neuen geführten Lernwegen. Zu lange oder widersprüchliche Wege bleiben vollständig im Archiv. |
| Journal / Reflexion | Gedanken und Reflexionen mit Datum, Luther-Referenz und zuordenbaren Vorhaben-Verbindungen aus `pathIds` und `path.links` | Gebets-/Predigt-/Story-Sonderrollen bleiben im Original; sie werden nicht als freiwillige Anwendung ausgegeben. |
| Expliziter Reflexionsspiegel | Ein Gedanke, wenn `reflectionId`, Text, Datum, Änderungsdatum, Referenz einschließlich Übersetzung und entfernte Bibelnotiz-Rolle zusammenpassen | Kein Zusammenführen nur anhand gleicher Prosa. Abweichende Fassungen werden separat geprüft. Beide Rohdatensätze bleiben erhalten. |
| Bibelnoten-Rolle gelöscht | Eigene Worte bleiben erhalten | Die entfernte Reader-Verknüpfung wird nicht wiederhergestellt. |
| Luther-Markierung | Pro Vers, fünf bestehende Farben: Olive, Gold, Sand, Salbei, Terrakotta | Vorhandene abweichende Farben werden nicht überschrieben. Übersetzungs-/Bereichs-/Farbkonflikte bleiben im Archiv. |
| `chapter-explored` | Nur datierte vollständige Luther-1912-Kapitel als bestätigter Altstatus | Das bloße Öffnen eines Kapitels (`reading`) zählt nicht. Importierte Kapitel/Reflexionen erzeugen keine neue Baumstufe. |
| OTB-Referenz | Kennzeichnung als OTB am importierten Gedanken/Vorhaben | Keine Gleichsetzung mit Luther 1912 und kein Transfer von OTB-Markierungen in den Luther-Reader. Fehlende Übersetzungsangabe bedeutet laut altem Vertrag OTB. |
| Frühere Rückblicke / Meilensteine | Historische Anzeige am importierten Vorhaben und vollständiger Originaldatensatz | Keine Erfindung früherer Schrittlisten aus dem heutigen Weg. Ein Quelltext erscheint nur bei passendem Quellschlüssel und gültigem damaligem Snapshot. Keine neue Bestätigung von Anwendung. |
| Einstellungen, Quiz, geführte Pläne, übrige Ereignisse, unbekannte Felder | Einsehbares, unverändertes Originalarchiv | Aktuelle OLIVA-Einstellungen, Leseposition, Entwürfe und Lernwegfortschritte werden nicht ersetzt. |

Fehlende/ungültige Anlagedaten werden in der Vorschau genannt. Ein aktiv übernommener Eintrag verwendet dann das Importdatum; bei Schritten gilt das Anlagedatum des Vorhabens. Ein früher archivierter Weg bekommt als technische `archivedAt` den Importzeitpunkt, ohne einen unbekannten historischen Archivzeitpunkt zu behaupten. Ein als erledigt markierter Schritt ohne belegbares Abschlussdatum passt nicht in das aktive Vorhabenmodell; dann bleibt der vollständige Weg im Archiv.

## Identität, Konflikte und Unveränderlichkeit

Lokales SHA-256 wird gegen die Standardbibliothek geprüft. Kanonische Objekt-Schlüssel und das ignorierte äußere Exportdatum erkennen identische erneut exportierte Sicherungen. Die exakte eingelesene UTF-8-JSON-Zeichenfolge erhält zusätzlich einen eigenen Hash und wird beim Export unverändert verwendet. Das ist eine Integritätsprüfung, keine digitale Signatur und kein Echtheitsbeweis.

Native Ziel-IDs hängen von Art und alter Datensatz-ID ab, nicht von Datei oder Importzeit. Herkunft enthält Original-ID, Quellenfingerabdruck und belegte Spiegel-Aliasse. Bereits übernommene Inhalte werden bei veränderter Quelle nicht überschrieben. Lokale Bearbeitungen und Löschungen bleiben erhalten; gespeicherte Quellenschlüssel verhindern ein unbemerktes Wiederanlegen gelöschter bekannter Einträge aus späteren Exporten. Die neue Originalfassung bleibt im neuen Archiv. Ein bereits identischer Dateiinhalt legt auch kein weiteres Archiv an.

Die Vorschau ist an die aktuelle OLIVA-Revision gebunden. Entwurfsänderungen oder Änderungen in einem zweiten Fenster erfordern erneute Prüfung. Der finale Datenbankschreibvorgang prüft die Revision nochmals. Speicher- oder Konfliktfehler veröffentlichen keinen neuen Zustand und lassen die Eingabe erhalten. Vor der Vorschau wird der aktuelle Datenbankstand lesend geladen. Beschädigte Daten blockieren neue Schreibzugriffe.

## Migration und Speicherung

- OLIVA-Nutzdatenformat **3** ergänzt Importquellen, Herkunft und Vorhaben-Verbindungen. Validierte V1- und V2-Daten werden verlustfrei migriert; kein Originalobjekt wird dabei verändert.
- Native SQLite-Struktur **2** ergänzt `local_recovery` zu `local_state`. WAL und exklusive Transaktionen bleiben. Die Sicherung kopiert den tatsächlichen vorherigen DB-Payload innerhalb derselben Transaktion wie der Import.
- Web-IndexedDB bleibt physisch Version **1**. Der bereits vorhandene Object Store `state` bekommt zusätzlich den Schlüssel `before-faithpath-import`. Sicherung und Hauptstand werden gemeinsam geschrieben.
- Eine Rückkehr prüft sichtbare Revision und Sicherungstoken. Wiederherstellung und Verbrauch der Sicherung geschehen gemeinsam. Keine Bestätigung vor dauerhaftem Commit.
- Quellenprüfung: maximal **10 MiB UTF-8**, 200.000 JSON-Knoten, 40 Ebenen, begrenzte Datensammlungen und Texte. Unsichere Objektschlüssel, doppelte IDs und tote aktive Verbindungen werden abgewiesen. Der alte Import konnte bis 20 MiB annehmen; größere Dateien sind hier noch nicht unterstützt.
- OLIVA-Sicherung und schreibbarer Gesamtbestand: maximal **64 MiB**, einschließlich eingerückter JSON-Darstellung und aller Quellarchive. So bleiben exportierte Daten mit derselben Version wieder einlesbar. Große Dateien werden synchron geprüft; Streaming/Worker und Messungen auf schwachen Geräten sind offen.
- Nativ verwenden Import/Export Expo DocumentPicker, FileSystem und Sharing. Die Quelle bleibt erhalten; nur die ausgewählte Cache-Kopie wird aufgeräumt. Die OS-Dateifreigabe bestätigt keine tatsächlich angelegte externe Datei. Auf echten Geräten steht diese Prüfung aus.
- Kein Netzwerktransfer persönlicher Daten, keine Cloudmigration, keine zusätzliche Verschlüsselung und kein Telemetrie-/Fehlerlog persönlicher Texte.

Historischer Kompromiss in 0.3 (in 0.4 durch separate Archiv-Blobs ersetzt): Die unveränderten Quellen lagen im lokalen Gesamtpayload. Auch ein kleiner Entwurfs-Commit kopiert und serialisiert diesen Bestand; große Archive können deshalb die Eingabe-/Speicherlatenz erhöhen. Vor breitem Einsatz mit großen Sicherungen sind separate unveränderliche Archiv-Blobs, inkrementelle Schreibvorgänge und Messungen auf schwachen Geräten erforderlich. Der Größenrahmen ist eine Sicherheitsgrenze, kein nachgewiesenes Leistungsversprechen.

## Abnahmekriterien und Nachweise

`tests/imports.test.ts` prüft Fingerabdruck, reine Vorschau, Originalerhalt, Spiegel/Divergenz, OTB-Grenze, entfernte Rollen, Referenzaliasse, Idempotenz, spätere Quellkonflikte, Löschschutz, Limits und beschädigte Quellen. `tests/store.test.ts` prüft Erfolg erst nach Persistenz, alte Vorschau sowie Sicherungs-/Rückkehrschreiboptionen. `tests/native-storage.test.ts` führt den tatsächlichen nativen Storage-Adapter gegen Nodes echte SQLite-Engine aus und prüft physische V1→V2-Migration, Nutzdaten V2→V3, Revision, Token und Rollback bei einem Fehler nach dem Sicherungsschreibvorgang. Das ist kein Expo-Gerätetest.

Sechs neue Browser-Szenarien prüfen echten Dateidialog, Abbruch, Import, historischen Snapshot, unveränderten Originaldownload, Offline-Neustart, wiederholten Import, zwei Fenster, IndexedDB-Quota-Ausnahme, Rückkehr nach späteren Änderungen, Reflow und Axe in Dunkel. Der erste Gesamtlauf bestand 21/22 Szenarien: Eine noch laufende Testversion erwartete beim zweiten identischen Import fälschlich eine neue Vorschau. Die App zeigte korrekt „bereits übernommen“. Der Test wurde auf diese Idempotenz korrigiert; der abschließende Bericht ist maßgeblich.

Aktuelle maschinelle Ergebnisse: `docs/evidence/unit-results.json`, `docs/evidence/e2e-results.json`, `docs/evidence/builds.json`. Neue Screens: `docs/evidence/import-screens/`. Offene Abnahmen: echte iOS-/Android-Dateiauswahl und Freigabe, Expo-SQLite-Laufzeit, Prozessabbruch/Low-Disk am Gerät, VoiceOver/TalkBack und zusätzlicher anonymisierter echter FaithPath-Export. Ohne diese Prüfung wird keine allgemeine Geräte- oder Releasefreigabe behauptet.
