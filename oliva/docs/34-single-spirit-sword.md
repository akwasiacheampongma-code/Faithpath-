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

Der konkrete Kandidat heißt 0.18.0. Typecheck, 343 Fachtests, alle sieben Inhaltsprüfungen, Produktionsaudit ohne Funde und Produktions-Webbuild sind bestanden. Android-/iOS-JavaScript-/Assetexports samt vollständigen NT-/Geschichten-/Themenkatalogvergleichen bestehen statisch. Die 14 absichtlichen Native-Artefaktfehlerprüfungen bestehen an einer temporären Kopie; die echten Exporte bleiben unverändert.

Ein erster Browser-Testlader brach wegen eines JSON-Imports ohne Node-Importattribut ab. Die Testdaten werden jetzt ausdrücklich über das Dateisystem gelesen. Anschließend bestanden 13 von 14 gezielten Fällen; bei 320 Pixeln lag die Suche zu weit unten. Der echte Kopfbereich wurde verkürzt, die Weiterlesen-Karte kompakter angeordnet und die Bildbeschreibung auf genau einen Screenreader-Knoten begrenzt. Der unverändert strenge 320/1440-Hell/Dunkel-/Axe-Fall besteht danach. Frühe Berichte bleiben erhalten.

Die vollständige Browser-Regression, der reale 0.17→0.18-PWA-Wechsel und die private Lieferabnahme werden erst nach tatsächlicher Ausführung bestätigt. Aktuelle Ergebnisse: `evidence/single-spirit-sword/`. Vor dieser Abnahme liefert die private Vorschau weiterhin 0.17. Keine gehostete Browser-QA, Simulator-, physische Geräte-, VoiceOver-/TalkBack-, Energie- oder signierte Installationsprüfung behauptet.

Der Feature-Branch ist `feature/oliva-single-spirit-sword-20261117`. Kein Merge nach GitHub-main, keine Änderung an Original-FaithPath, kein Retagging historischer Releases und keine öffentliche Website-/Storefreigabe. Die übrigen Master-Aufgaben bleiben aktiv; der Ausbau einer 66er-Schwertsammlung ist ausdrücklich abgelöst.
