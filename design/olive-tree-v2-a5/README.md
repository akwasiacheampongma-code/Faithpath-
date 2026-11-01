# FaithPath · Lichtkrone · Sieben lebendige Stufen

Isolierte Design- und Technikvorschau `FP-DESIGN-20261101-OLIVE-LIVING-SEVEN`.

**Keine App-Integration.** Die A.4-Masterillustration ist freigegeben. Die sechs abgeleiteten Bilder und die neue Dauerbewegung werden hier zur Freigabe vorgelegt. Alle angezeigten persönlichen Inhalte sind synthetisch; es wird nichts gespeichert.

## Schnell ansehen

- `START_HIER.html` ist die statische Einstiegsseite mit Bildern, Videos und Prüfbericht. Direkte Dateiöffnung ist vorgesehen, wurde hier aber durch die verwaltete Browserrichtlinie blockiert. Verifiziert ist der lokale HTTP-Aufruf.
- `evidence/VERGLEICH_BEWEGUNG.mp4`: echte Browseraufnahme des alten und neuen Bewegungsprofils.
- `evidence/MOBIL_LEBENDIG.mp4`: echte mobile Browseraufnahme.
- `DESIGNABNAHME.pdf`: Übersicht und technische Grenzen.
- Die **interaktive WebGL-Galerie** benötigt wegen ES-Modulen und sicheren Bildtexturen einen lokalen HTTP-Server. Im entpackten Ordner:

```sh
python3 -m http.server 4735 --bind 127.0.0.1
```

Danach `http://127.0.0.1:4735/` öffnen. Keine Anmeldung, keine externen Fonts/Bilder, keine Internetverbindung erforderlich. Die Sicherheitsbeschränkungen von `file://` nicht abschalten. Im Repository liegt die Galerie unter `design/olive-tree-v2-a5/`.

## Bedienung

Vier Themes, sieben Stufen und die Bereiche Heute, Mein Weg, Baumdetail und erster persönlicher Weg sind auswählbar. Bereichszugänge wie „Bibel“ zeigen ausdrücklich eine Vorschauinformation und öffnen keine zweite App. „Pausieren“ hält die Szene an; „Fortsetzen“ setzt sie weich fort. „Qualität neu prüfen“ startet den Leistungsregler erneut. Ein Grafikverlust verlangt ein Neuladen; die vollständige ruhende Illustration bleibt sichtbar.

Der Vergleich links verwendet das unveränderte A.4-Bewegungsmodell als **Profil desselben Renderers**. Er endet nach acht Sekunden. Rechts läuft der neue Wind weiter. Beide pausieren außerhalb der sichtbaren Ansicht.

## Reproduzieren

Aus dem Repository mit seinen vorhandenen Entwicklungsabhängigkeiten:

```sh
node --test design/olive-tree-v2-a5/motion.test.mjs
python3 design/olive-tree-v2-a5/qa-assets.py
python3 design/olive-tree-v2-a5/qa-repro.py
node design/olive-tree-v2-a5/qa-browser.mjs
node design/olive-tree-v2-a5/measure-geometry.mjs
node design/olive-tree-v2-a5/measure-performance.mjs
node design/olive-tree-v2-a5/record-motion.mjs
```

Der Server muss für Browserprüfungen auf Port 4735 laufen. `OLIVE_A5_ORIGIN` kann eine andere lokale Adresse angeben. Die Browser-Skripte verwenden `/usr/bin/chromium`, die Aufnahme `/usr/bin/ffmpeg`. Pillow wird für den verlustfreien Bildexport benötigt. Versionen stehen in den Nachweisen. Keine dieser Abhängigkeiten wird zur Laufzeit der Galerie nachgeladen.

Den Performance-Lauf allein ausführen, ohne gleichzeitige Videoaufnahme oder weitere Browserprüfungen. Das Vorschau-ZIP enthält alle Laufzeitdateien, Bilder, Fonts, Videos, Berichte und Prüfskripte. Für die automatisierte Wiederholung wird die Entwicklungsumgebung des Repositories benötigt; `node_modules` ist nicht Teil des ZIPs.

## Freigabegrenze

Nach der Designentscheidung erst gesondert in FaithPath integrieren. Schema V5, Wachstumsschwellen, persönliche Daten, Bibel, Quiz, App-Router und Service Worker wurden nicht verändert. Dieses Paket ist **kein FaithPath-Produktionsbuild und kein PWA-Update**. Echte iPhone-, Safari-, VoiceOver-, GPU- und Akkutests sind offen.
