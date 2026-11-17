# Ein geistliches Schwert im Bibel-Hub

Der Nutzerauftrag vom 17.11.2026 ersetzt das frühere Konzept mit 66 Buchschwertern. Maßgeblich ist jetzt ein einziges friedliches Symbol für Gottes Wort. Es hat keine Buchauswahl, Kapitelanzeige, Freischaltung oder Belohnungsfunktion. Die frühere Sammlung wird nicht weiterentwickelt.

## Tatsächliche Umsetzung

Die Startseite zeigt das aktuelle Buch mit normalem Lesefortschritt und Lesezugang. Die Sammlung enthält Gedanken, Entwürfe, Lesezeichen und Markierungen. Der Reader bestätigt Lesen weiterhin, zeigt aber weder Buchschwert noch Lichtimpuls. Onboarding und Quellenansicht beschreiben das neue Konzept.

Der Bibel-Hub beginnt mit „Deine Bibel“, einer kompakten Weiterlesen-Karte, Buchsuche und dem bestehenden Dropdown für gesamte Bibel, NT und AT. Die Suche verträgt weiterhin Leerzeichen. Auf großen Displays steht die Schwertkarte neben der Buchliste, auf Smartphones nach den Such-/Bereichskontrollen. Alle 66 Bücher und 1.189 Kapitel bleiben unmittelbar über die ruhige Liste erreichbar. Geschichten, thematische Wege und NT-Fragen bleiben erhalten.

Die bisherigen `/buch/[book]`-Links führen jetzt zu sachlichen Buchübersichten mit Kapitelwahl und normalem Lesefortschritt. Damit funktionieren bestehende Geschichtenlinks und gespeicherte URLs weiter, ohne eine Schwertgalerie zu öffnen. Unbekannte Buchcodes bieten einen verständlichen Rückweg.

## Ein Bild und ein geprüfter Bibelauszug

Verwendet wird das vorhandene Original des OLIVA-Genesis-Piloten mit Holzgriff und jungem Trieb. Dafür wurde kein neues Bild erzeugt. Die Darstellung verwendet genau eine unveränderte 512×768-PNG-Datei mit 81.042 Byte. Der vollständige Bildrahmen bleibt im Verhältnis 2:3 sichtbar. Das Symbol ist statisch; reduzierte Bewegung erfordert keine Ersatzanimation. Ein echter Bildfehler erhält den Text und die Navigation und bietet einen ausdrücklichen Ladeversuch.

Der integrierte Luther-1912-Text von Epheser 6,17 lautet:

> und nehmet den Helm des Heils und das Schwert des Geistes, welches ist das Wort Gottes.

Der angezeigte wörtliche Auszug lautet:

> … und das Schwert des Geistes, welches ist das Wort Gottes.

Die Auslassung ist kenntlich. Die vorgeschlagene Formulierung „Nehmet das Schwert …“ steht nicht zusammenhängend im integrierten Original. Antippen des Zitats öffnet Epheser 6,17 im gemeinsamen Reader. Ein eigener Link öffnet 6,10–18. Der als OLIVA-Einordnung bezeichnete Text lautet: „Gottes Wort kann uns Orientierung, Halt und Stärke schenken – im Alltag und in schweren Zeiten.“ Der folgende Hinweis erklärt den Zusammenhang mit Wahrheit, Frieden und Gebet und macht deutlich, dass sich das Symbol nicht gegen Menschen richtet.

## Bereinigung und Bewahrung

Entfernt sind die aktive Galerie, ihre Sammlungsregisterkarte, Buchschwert-Aktionen, individuelle Titel/Motive im Runtime-Buchkatalog, zehn Module unter `src/features/swords/`, zugehörige Imports, die Lichtgeometrie und Bestätigungsanimation sowie das ungenutzte Schwert-Menüicon. Es gab keine eigene gespeicherte Freischalt- oder Punktewährung; eine entsprechende Datenmigration ist daher nicht erforderlich.

Alle neun früheren Runtime-Bildvarianten liegen bytegenau unter `art/swords/historical-runtime-assets/`. Die 45 bestehenden Kunst-/Provenienzdateien, Originalmaster, Rechteinformationen und historischen Release-Nachweise bleiben erhalten. Das alte Buchmetadatenverzeichnis und der frühere Bildprüfer sind ebenfalls nachvollziehbar archiviert. Aktuelle Provenienz: `art/spiritual-sword/runtime.json`. Die früheren `art/swords/runtime*.json` sind historische Belege und werden von der App nicht mehr eingelesen.

Die Schwert-Rasterdateien sinken vom jüngsten Entwicklungsstand mit 1.038.251 Byte auf 81.042 Byte: **957.209 Byte weniger**. Der tatsächliche neue Webexport enthält keine der acht übrigen Varianten und keine frühere Buchschwert-Oberfläche. Bundle- und Nativeprüfer kontrollieren dies über Originalhashes; ein absichtlich eingeschleustes altes Buchbild wird abgelehnt.

AppData V11, privates Dokument 1, SQLite 3 und IndexedDB 1 bleiben unverändert. Es gibt keine neue Abhängigkeit oder Migration. Nutzdaten, bestehende Quellenarchive, Reflexionen, Antworten und Lesefortschritte werden nicht für das Symbol umgeschrieben.

## Prüfstand und Liefergrenzen

Die tatsächlich ausgelieferte Version heißt 0.18.0. Typecheck, 343 Fachtests, alle sieben Inhaltsprüfungen, Produktionsaudit ohne Funde und Produktions-Webbuild sind bestanden. Android-/iOS-JavaScript-/Assetexports samt vollständigen NT-/Geschichten-/Themenkatalogvergleichen bestehen statisch. Die 14 absichtlichen Native-Artefaktfehlerprüfungen bestehen an einer temporären Kopie; die echten Exporte bleiben unverändert.

Ein erster Browser-Testlader brach wegen eines JSON-Imports ohne Node-Importattribut ab. Die Testdaten werden jetzt ausdrücklich über das Dateisystem gelesen. Anschließend bestanden 13 von 14 gezielten Fällen; bei 320 Pixeln lag die Suche zu weit unten. Der echte Kopfbereich wurde verkürzt, die Weiterlesen-Karte kompakter angeordnet und die Bildbeschreibung auf genau einen Screenreader-Knoten begrenzt. Der unverändert strenge 320/1440-Hell/Dunkel-/Axe-Fall besteht danach. Frühe Berichte bleiben erhalten.

Der finale volle 146/146-Browserlauf, der tatsächliche lokale Wechsel vom privaten 0.17-Host zum 0.18-PWA-Kandidaten und die private HTTP-Abnahme sind bestanden. Alle vier Rohdatensätze mit synthetisch über die ausgelieferte alte UI angelegten persönlichen Inhalten bleiben durchgehend exakt, einschließlich Historie, sieben A51-Stadien, Studienantworten und Export/Restorevorschau ohne Anwendung. Der erste volle 145/146-Lauf und sein rotes CI-Gegenstück bleiben erhalten: Der Test las die URL vor dem asynchronen Wechsel. Er wartet jetzt auf den Reader und prüft danach dieselben strengen Ziele und Datenbedingungen. Der vollständige finale Lauf hat keine Retries, Skips oder Flaky-Ergebnisse. Aktuelle Ergebnisse: `evidence/single-spirit-sword/`. Die private Vorschau liefert jetzt 0.18. Keine gehostete Browser-QA, Simulator-, physische Geräte-, VoiceOver-/TalkBack-, Energie- oder signierte Installationsprüfung behauptet.

Der Feature-Branch ist `feature/oliva-single-spirit-sword-20261117`. Kein Merge nach GitHub-main, keine Änderung an Original-FaithPath, kein Retagging historischer Releases und keine öffentliche Website-/Storefreigabe. Die übrigen Master-Aufgaben bleiben aktiv; der Ausbau einer 66er-Schwertsammlung ist ausdrücklich abgelöst.

## Tatsächliche private Lieferung und Versionssicherung

## OLIVA 0.18.0 · ein geistliches Schwert

**OLIVA 0.18.0 ist seit 17.11.2026, 16:52:21 UTC eigentümerprivat bereitgestellt.** [Bibel-Hub öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/bibel). Die bisherige Vorschau-Adresse bleibt bestehen. [Schwertkarte auf dem Smartphone](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/spiritual-word/word-320-light.png) · [Hub auf dem Smartphone](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/spiritual-word/hub-top-320-light.png); tatsächliche lokale Chromium-Aufnahmen mit synthetischen Prüfdaten.

Die 66er-Schwertsammlung ist auf ausdrücklichen Nutzerauftrag entfernt. Galerie, Sammlungsregisterkarte, Buchschwertaktionen, Lichtspuren, Bestätigungsanimationen und zehn Schwertmodule entfallen. Alle 66 Bibelbücher und 1.189 Kapitel bleiben direkt über die ruhige Buchliste erreichbar, standardmäßig gesamte Bibel mit NT-/AT-Dropdown und leerzeichentoleranter Suche. Alte Buchlinks öffnen sachliche Buchübersichten. Normaler Lesefortschritt, Reader, Geschichten, Fragen, Gedanken, Entwürfe und persönlicher Garten bleiben erhalten.

Genau ein vorhandenes Original mit Holzgriff und jungem Trieb erscheint statisch im Bibel-Hub. Kein Sammeln, Freischalten, Kapitelindikator oder Lohn. Der wörtliche Auszug „… und das Schwert des Geistes, welches ist das Wort Gottes.“ öffnet Epheser 6,17; der Zusammenhang 6,10–18 ist zugänglich. OLIVA-Einordnung und Bibelwort sind getrennt. Die Karte erklärt ausdrücklich, dass sich das Symbol nicht gegen Menschen richtet.

Eine unveränderte 81.042-Byte-Datei ersetzt 1.038.251 Byte Schwertvarianten im jüngsten Entwicklungsstand. Neun frühere Varianten und 45 Kunst-/Provenienzdateien sind bytegenau bewahrt. AppData V11 / Dokument 1 / SQLite 3 / IndexedDB 1 bleiben unverändert; keine neue Abhängigkeit oder Datenmigration.

**343/343 Fachtests und der finale vollständige 146/146-Browserlauf bestanden**, ohne Retries, Skips oder Flaky-Ergebnisse. Typecheck, sieben Inhaltsprüfungen, Produktionsaudit ohne Funde, Webbuild, beide statischen nativen Exporte mit vollständigen Inhaltsvergleichen und 14 absichtliche Native-Artefaktfehlerprüfungen bestehen. Der echte lokale Wechsel von der bisherigen privaten 0.17-Hostfassung zum 0.18-PWA-Kandidaten bewahrt alle vier V11-Rohdatensätze durchgehend exakt. Frühere rote Berichte und ihre konkreten Korrekturen bleiben erhalten. Keine native Geräte-/Simulatorprüfung behauptet.

Die unabhängige [GitHub-CI 44124684188](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/44124684188) bestätigt denselben korrigierten Quellstand mit 343/146 und allen 31 Kriterien. Code gesichert unter [Tag `oliva-v0.18.0`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.18.0/oliva), Feature-Branch `feature/oliva-single-spirit-sword-20261117`, GitHub-Commit `84527ef0b7e3c970b3c7e33bd758cd2fd28d06a0`, eigenem Quellcommit `bc2c199921ba0a20e4d9436248db8f46d256e3ff` und eigenem Tag `oliva-v0.18.0-single-spirit-sword-private`. Alle 32 Versionsrefs, geschützten Bestandsbranches und 47 Nicht-OLIVA-Root-Einträge bleiben bestätigt unverändert. Die abschließenden Nachweise werden separat auf `docs/oliva-v018-delivery-20261117` gesichert, ohne Retagging oder erneutes Website-Deployment.

Privat geprüft: 40 App-Routen, 106 App-Dateien (105 bytegenau plus HTML-Marker) und 53 Review-Dateien. Alle 40 App-Routen sowie zusätzlich Schwertbild, Reviewbild und Worker anonym401; Eigentümerpolitik Revision 1 exakt unverändert. Kern `oliva-6e2b52bb8e634041`, privater Host `oliva-5d647075614ace83`, CI-Build `oliva-dd2018980e9ea631` sind getrennte Exporte. 344 Runtimeinputs, SHA-256 `29b2c6c4292c38e943108a4afd5de003e150d9ed47cf9f4269a53b565e46f0ab`. Keine gehostete Browser-QA mangels unterstütztem CUA-Werkzeug.

Weitere Master-Arbeit bleibt offen: Bibelbildserie, unabhängige Inhalts-/Rechteabnahmen, echte Einsteiger-/Geräte-/Hilfstechnologietests, signierte native Pakete und konkrete Cloud-/KI-/Audioentscheidungen. Die abgeschaffte Buchschwertsammlung wird nicht wieder eingeführt. **Die Gesamt-Definition-of-Done ist nicht abgeschlossen.** Keine öffentliche Website-/Storefreigabe, kein GitHub-main-Merge und keine Änderung an Original-FaithPath.

## Genau entfernte Moduldateien

`src/features/swords/`: `BookLightTrack.tsx`, `BookSwordArtwork.tsx`, `JohnLightTrack.tsx`, `SwordArt.tsx`, `SwordPulse.tsx`, `VectorSwordDrawing.tsx`, `illustrations.ts`, `layout.ts`, `model.ts`, `pilot-assets.ts`. Frühere aktive PNGs aus `assets/swords/` sind ausschließlich in das bytegenaue Kunstarchiv überführt. Das vorhandene Bild und alle Herkunftsdateien sind erhalten. Alte Schwertfachtests und drei Browser-Spezifikationen sind durch gezielte Quellen-/Katalog-/Ein-Symbol-Prüfungen ersetzt; die übrigen Funktionen werden weiterhin vollständig geprüft.


## Nutzerwunsch nach dem Abschluss

Nach Abschluss und Sicherung dieser Umstellung wird die Entwicklung auf ausdrücklichen Nutzerwunsch pausiert. Der übrige Master bleibt offen; keine automatische Weiterarbeit bis zu einem erneuten Fortsetzen.
