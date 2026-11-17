# Genesis · Schwert des Anfangs

Dritter individueller OLIVA-Buchschwert-Pilot. Das Original wurde am 17.11.2026 tatsächlich mit dem OpenAI-Bildwerkzeug und transparentem Hintergrund erzeugt. Kein fremdes Bild als Referenz übergeben. `masters/genesis-beginnings-pilot.png` bleibt unverändert; SHA-256 `7f535d1f586dd2bca9a97009068439ac0eecff48259426bc1f87c5a393cbb458`.

Silber, dezentes Gold und natürliche Materialien verbinden das Bild mit Johannes/Römer. Der Holzgriff und junge Keimling unterscheiden Genesis. Samen und Gartenpflege greifen die tatsächlich geprüften Stellen 1. Mose 1,1 / 1,11–12 / 2,15 auf. Dies ist freie Buchsymbolik; Genesis beschreibt dieses Schwert nicht. Die separate Lesespur zeigt bestätigte Kapitel, keine spirituelle Wertung.

`prompt-v1.txt`, `pilot.json`, `source-and-direction.json` und `master-inspection.json` bewahren Auftrag, Quellen, Prüfumfang und Grenzen. Ein einzelnes abschließendes Datei-LF war nicht Teil des tatsächlichen Toolprompts; beide Hashes sind angegeben. Historische Vorbereitungsfelder wie `runtimeIntegrated: false` beschreiben den Generierungszeitpunkt. Der aktuelle Entwicklungs-Laufzeitstand steht separat in `../genesis-runtime.json`.

Mit `python3 scripts/prepare-variants.py --check` werden die unveränderten 256/512/768-Dateien dekodiert und bytegenau reproduziert. Pillow-Version in `requirements-art.txt`; reines Vollbild-RGBA-Skalieren ohne Beschnitt, Retusche oder Hintergrundänderung. Die Dateien benötigen zusammen 275.820 Byte. Laufzeitkopien unter `assets/swords/` werden durch `npm run content:swords` samt Originalhash und zitierten Quellversen geprüft.

`background-review-1100.png` und `background-review-390.png` sind tatsächliche lokale Chromium-Aufnahmen der ursprünglichen Gestaltungskontrolle mit OLIVA-Farben und Originalfonts. Sie zeigen noch keine App-Integration. Der portable Reproduktionshelfer `node scripts/capture-review.mjs` verwendet einen Server auf Loopback mit einer ausdrücklichen Dateiliste. Er benötigt die Entwicklungsabhängigkeiten des Projekts. App-Aufnahmen und funktionale Prüfergebnisse liegen separat unter `docs/evidence/genesis-sword/`.

Interne visuelle Prüfung durch den implementierenden Agenten ist dokumentiert. Keine unabhängige theologische/historische/rechtliche Freigabe, keine echte Geräte-/Simulatorprüfung und keine öffentliche Produktfreigabe. Der Ausbau ist Teil des freigegebenen Masters; Quellenbackup auf separatem GitHub-Branch ist autorisiert. Keine öffentliche Website-/Storefreigabe und kein Merge nach main.
