# Iteration 0.4 · Eigene Worte und Offline-Fortsetzung

06.11.2026. Diese Iteration erweitert den lokalen Kern. Sie ist keine öffentliche Produktfreigabe. Der vorherige GitHub-Quellcheckpoint ist `f90fcfb8176b5f793c4c51b7360fdc1e67112e13` (0.3).

Historischer Bericht für 0.4. Aktuell ist 0.7 privat bereitgestellt, mit AppData V6 bei unverändertem Dokument V1/SQLite V3/IndexedDB V1. Versfortsetzung ist seit 0.5, textliche Rückblickbearbeitung mit bestätigtem Löschen und sitzungsgebundenem Undo seit 0.7 integriert; aktueller Vertrag und 0.6→0.7-Offlinebeleg stehen in [Iteration 0.7](12-review-editing.md) und [Qualität und Abnahme](05-validation.md). Die Versions- und Offenstandsangaben unten gehören zu 0.4.

## Teilziele und Abnahme

| Teilziel                          | Implementierung                                                                                                  | Überprüfbare Abnahme                                                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Kleine Eingaben bewahren          | Gemeinsamer Capture-Editor für Tagesreflexion, Gartenerfahrung, Versnotiz und geführten Schritt                  | Bereich wechseln und neu starten: Wortlaut und Quelle bleiben erhalten; Tippen erzeugt keinen fertigen Eintrag oder Lernabschluss                            |
| Fortsetzung auffindbar machen     | Sammlung → Entwürfe; Links zum jeweiligen Editor, Weg-Schritt oder einzelnen Vers                                | Zwei offene Versnotizen bleiben getrennt; ein Link öffnet den richtigen Vers und dessen Worte                                                                |
| Kontext erhalten                  | Tagesfrage und geführte Frage/Einordnung als unveränderter Snapshot                                              | Bei veränderter redaktioneller Quelle lässt sich die Reflexion bewahren, ohne den geänderten Schritt als erledigt auszugeben                                 |
| Speicherfehler ehrlich behandeln  | Sitzungsweiter RAM-Puffer, Besitzerkennung, gemeinsame Abschlusskennung und separater Export ungesicherter Worte | Nach fehlgeschlagenem Commit und Bereichswechsel bleiben Worte erreichbar; erfolgreiche Speicherung entfernt den Puffer und erzeugt keinen doppelten Eintrag |
| Große Importarchive entkoppeln    | Inhaltsadressierte unveränderliche Quell-Blobs; kleiner Hauptstand; transaktionale Referenzen und Bereinigung    | Nach großem synthetischem Import schreibt ein kleiner Entwurf keinen Quell-Blob erneut; Import-/Blobfehler rollen vollständig zurück                         |
| Beschädigten Bestand bewahren     | Reparaturbildschirm vor normalen App-Routen; unveränderter Rohdatenexport und erneuter Leseversuch               | Beschädigte Daten erzeugen keinen leeren Ersatzstand und bleiben im heruntergeladenen Reparaturpaket erhalten                                                |
| Verstehen praktisch begleiten     | Neun selbst verfasste freiwillige Textfragen mit Originalversen als Beleg                                        | Auswahl zeigt freundliche Rückmeldung und verändert keine Fortschrittsdaten; Web-Radiogruppe ist zugänglich                                                  |
| Bildgeschichten auffindbar machen | Vier neue Erzählpiloten im optionalen Geschichtenbereich und im vertieften Reader                                | Illustration, Einordnung und Bibeltext bleiben unterscheidbar; Abschnittsabschluss markiert nicht das gesamte Kapitel                                        |
| Offline-Update absichern          | Vollständiger Cache, genauer Build-Abgleich, vorheriger Asset-Cache und sichtbare Bereitschaft                   | Tatsächlicher 0.3-Webexport → 0.4 → Netz aus → Neustart mit bewahrten Einträgen, Vorhaben, Entwurf und Originalquelle                                        |

## Entwurfsvertrag

`capture-schema.ts` unterscheidet vier Quellen. Ein Tagesentwurf bewahrt Datum und damalige Frage. Versentwürfe sind nach Buch, Kapitel und Vers getrennt. Ein geführter Entwurf bewahrt Weg-ID, Schrittnummer, Titel, Frage, Einordnung und Bibelbezug. Diese Metadaten sind kein zusätzlicher Bibeltext.

Ein leerer Capture-Editor legt keinen leeren Entwurf an. Eingaben werden verzögert gesichert; Bereichswechsel und ausdrückliche Aktionen verwenden dieselbe serielle Commit-Warteschlange. `saveDraft` prüft Identität und Revision. Ein Abschluss speichert Inhalt und entfernt den zugehörigen Entwurf in einer Mutation. Ein geführter Abschluss prüft außerdem den zuvor bestätigten Leseabschnitt und den aktuellen Quell-Snapshot. Das Tippen einer Erfahrung bestätigt keine Anwendung im Alltag.

Die Sitzung hält noch nicht dauerhaft gespeicherte Worte zusätzlich im RAM. Eine Besitzerkennung schützt gegen spätes Schreiben eines alten Editors. Eine gemeinsame Abschlusskennung verhindert, dass im Expo-Navigationsstapel noch montierte Editoren einen abgeschlossenen Entwurf wiederherstellen. Der Browser warnt beim Schließen, solange Worte ungesichert sind. Der normale OLIVA-Export meldet diesen Zustand, statt einen vollständigen Export vorzutäuschen; die Entwurfsübersicht bietet ein gesondertes `OLIVA-Uncommitted`-Paket.

**Grenze:** Ein RAM-Puffer überlebt keinen Prozessabbruch, Geräteverlust oder Browserneustart. Wenn die Datenbank nicht schreiben kann, können Worte erst nach erfolgreicher Wiederholung, Export oder manuellem Kopieren einen Neustart überstehen. Der native Dateifreigabedialog bestätigt nicht, dass eine externe Datei wirklich abgelegt wurde.

## Unabhängige Versionsnummern

| Ebene                               | Aktuell             | Migration                                                                                                             |
| ----------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| App                                 | 0.4.0               | Paket-/Expo-Konfiguration                                                                                             |
| Öffentliches OLIVA-Backup / AppData | 4                   | Validierte V1-, V2- und V3-Daten werden ohne Löschen bisheriger Einträge nach V4 überführt                            |
| Privates Speicherdokument           | `storageVersion: 1` | Inline-Nutzdaten älterer Apps bleiben lesbar; beim nächsten erfolgreichen Schreiben entsteht die kompakte Darstellung |
| Physische SQLite-Datenbank          | 3                   | V1 Hauptstand → V2 Rückkehrsicherung → V3 Archiv-Tabelle und Archivbezüge der Sicherung                               |
| Physische IndexedDB                 | 1                   | Zusätzliche Schlüssel im bestehenden Store; kein Versionssprung erforderlich                                          |

AppData und externe Sicherungen enthalten weiterhin die exakten Quelltexte. Das private Speicherdokument lässt `sourceText` weg und lädt ihn über den SHA-256-Schlüssel. Fehlende, beschädigte oder widersprüchliche Quellen werden abgelehnt. Ein privates Dokument ist kein austauschbares OLIVA-Backup.

SQLite speichert Quellen in `local_archives(hash, source_text)`. IndexedDB verwendet `archive:<sha256>`. Schreiben, Revisionsvergleich, Rückkehrsicherung und Entfernen unreferenzierter Quellen erfolgen in derselben Transaktion. Die Bereinigung behält Quellen, die entweder der Hauptstand oder die verfügbare Rückkehrsicherung benötigt. Ein kleiner `recovery-index` vermeidet das erneute Lesen des großen Sicherungsdokuments bei jedem Entwurfs-Commit. Die native Verbindung kann nach einem Initialisierungsfehler neu aufgebaut werden.

Die Mutationskopie und die Größenberechnung sparen unveränderliche Quelltexte aus. Die exakte Pretty-JSON-UTF-8-Größe eines vollständigen Backups bleibt einschließlich dieser Texte begrenzt: 64 MiB insgesamt, einzelne FaithPath-Quelle höchstens 10 MiB. Das verbessert den Schreibpfad, beweist aber keine Start-/Speicherlatenz auf schwachen Geräten. Erstes Laden, inhaltliche Quellenprüfung und vollständiger Export verarbeiten weiterhin große Texte im Speicher.

## Rohdatenrettung

Bei fehlgeschlagener Hydrierung erscheinen keine normalen Eingabeseiten. Der Webexport `OLIVA-Recovery` liest sämtliche Schlüssel des Stores ohne fachliche Dekodierung. Nativ wird eine kohärente SQLite-Dateikopie über eine eigene Verbindung ohne Migrationsversuch serialisiert und zur Freigabe angeboten. Beide Exporte enthalten private Daten und sind für technische Reparatur an einer Kopie gedacht. Sie werden nicht automatisch als normale OLIVA-Sicherung eingelesen. Die native Dateikopie und Dateifreigabe benötigen einen echten Expo-Gerätetest.

## Textfragen und Erzählpiloten

Neun neue Textfragen beziehen sich auf die vorhandenen neun Pilotabschnitte. Sie kopieren keine Quizredaktion aus FaithPath. Es gibt keine Punkte, Glaubensränge oder Pflichtantwort. Die Begründung zeigt den tatsächlichen gemeinfreien Vers aus dem Korpus. Im Web verwenden Auswahlfragen native HTML-Radiobuttons; nativ passende Rollen und Auswahlzustände. Eine unabhängige theologische Freigabe bleibt offen.

Das Bildset wächst von drei auf sieben Master. Neue Motive: Noah (Genesis 8,6–12), Abraham (Genesis 15,1–6), Geburt Jesu (Lukas 2,1–20) und Ostermorgen (Markus 16,1–8). Die Geburt vermischt nicht unbemerkt Lukas mit den Sterndeutern des Matthäus. Der Ostermorgen beansprucht weder einen nachgewiesenen Ort noch historische Porträts. Bildkarten und Erklärungen bleiben als Interpretation bzw. KI-unterstützter Entwurf erkennbar.

Alle Originale wurden angesehen; technische WebP-Varianten und Provenienz sind vorhanden. Diese vier Ergänzungen sind ein erweitertes Pilotset, keine große Kapitelproduktion oder unabhängige Fachfreigabe. Siehe [Bildkonzept und Rechte](04-art-direction-and-rights.md) und `art/manifest.json`.

## Offline-Update und CI

Der Build-Hash umfasst Assets, HTML-Basis, App-Version und Service-Worker-Verhalten. Das HTML erhält dieselbe ID wie der fertige Worker. Die App kann einen wartenden Worker nach geprüftem Build-/Versionsabgleich ausdrücklich aktivieren. Erst ein passender aktiver Worker zeigt „Für den Offline-Neustart bereit.“ Installation ist nur erfolgreich, wenn sämtliche Pflichtdateien geladen sind. Ein früherer Cache bleibt für noch offene alte Clients erhalten; weitere alte OLIVA-Caches werden entfernt. Eingaben werden nicht durch einen erzwungenen Reload unterbrochen.

`scripts/offline-upgrade.mjs <v0.3-dist> [current-dist]` führt auf einer isolierten lokalen Herkunft einen echten Versionswechsel aus. Der Kontrollbuild stammt aus dem gesicherten 0.3-Quellarchiv, verwendet dessen ursprünglichen Worker und schreibt zunächst Nutzdaten V3. Der Bericht `docs/evidence/offline-upgrade.json` protokolliert das Ergebnis. Die Kontrolle ist kein künstlich als 0.3 umbenannter 0.4-Build.

Die gemeinsame Composite Action unter `.github/actions/quality/` prüft Korpus, Bildhashes, Typen, Fachlogik, Webbuild und Browserabläufe. Im bestehenden Repository wird dafür ausschließlich `.github/workflows/oliva-quality.yml` neu hinzugefügt; bestehende FaithPath-Workflows bleiben unverändert. Der Workflow verwendet ausschließlich Leserechte für Repository-Inhalte, fest gepinnte Actions und enthält kein Deployment. Der tatsächliche vollständige GitHub-Lauf 42240609694 besteht mit 64 Fach-/Persistenztests und 35 Browserfällen; Nachweis in `docs/evidence/ci-run.json`.

## Noch offen

Native Geräte-/Hilfstechnologieprüfung, anonymisierter echter V5-Export, weitere eigenständige Kapitelredaktion, unabhängige Inhalts-/Bildprüfung und Anfänger-Nutzertest bleiben erforderlich. Neun Fragen sind kein Fragenkatalog für alle Kapitel. Sieben Bildpiloten decken nicht alle angefragten Erzählwelten ab. Exakte fortlaufende Scrollpositionen, freiwillige Erinnerungen und vollständige Rückblickbearbeitung sind weitere Produktarbeit. Auth, Cloud-Sync, Audio und Live-KI sind nicht angeschlossen. Vorbereitete Cloudmigrationen bilden die neuen lokalen Felder noch nicht vollständig ab.
