# A.4 · Ebenen und Animation für Entwickler

**Scope:** ausschließlich die isolierte Designstudie für Masterstufe 7. Kein Import aus `src/`, kein Store, keine Fortschrittsberechnung, keine Migration und keine App-Integration.

## Eine Zeichnung, zwei Platten

| Datei | Tatsächlicher Inhalt | Bewegung |
|---|---|---|
| `assets/masters/lichtkrone-a4.png` | Unveränderte vollständige Ausgabe der gemeinsamen A.2-Retusche, 1254 × 1254 RGBA | Künstlerische Referenz und statischer Ausfallfallback |
| `assets/layers/B-roots-and-lower-trunk.png` | Originalpixel ab Y=900: unterer Stamm, Wurzeln und Boden; restliche Canvas transparent | Immer statisch |
| `assets/layers/K-continuous-crown-and-upper-wood.png` | Originalpixel vor Y=900: gesamte zusammenhängende Krone, Früchte und oberes Holz | Nur periphere Blatt-/Feinzweigzonen bewegen sich; Tragholz-Schutzzonen bleiben statisch |

Die obere Platte ist ausdrücklich keine reine Blattebene. Das obere Tragholz wird nicht herausgeschnitten und anschließend mangelhaft ersetzt. Es bleibt innerhalb derselben Zeichnung und wird durch Nullgewichte von Bewegung ausgenommen. Die Früchte sind keine unabhängig transformierten oder wiederholt gesetzten Sprites.

Beide Platten behalten die vollständige 1254er-Canvas. Ursprung links oben, X nach rechts, Y nach unten. Nicht einzeln beschneiden oder unterschiedlich skalieren. Ihre sichtbare Ruhe-Zusammensetzung ist exakt zum Master. `export-plates.py` trennt lediglich Originalpixel ohne Retusche, Verformung oder Farbkorrektur.

## Module und Schnittstellen

| Modul | Verantwortung |
|---|---|
| `motion-model.js` | Quellkoordinaten, Holzschutzzonen, lokale Bewegungsgewichte, zeitliche Pose und gemeinsames Netz |
| `leaf-renderer.js` | Eine RGBA-Textur auf einem verbundenen WebGL-Netz; keine getrennt versetzten Kronengruppen |
| `motion-player.js` | Manueller Start, endlicher Ablauf, Reduced Motion, Sichtbarkeit, Stoppen und statische Prüfpositionen |
| `demo.js` | Bedienelemente, Theme, Anzeige, Bereitschaft und statischer Fallback der isolierten Demo |
| `preview.js` / `preview.css` | Ausschließlich synthetische mobile Kompositionsbeispiele; keine echte Datenfunktion |
| `gallery.js` | Identische Vergleichsbilder, echte Ausschnitte und Verlinkung der Nachweise |

`createLeafRenderer(canvas, source, {onLost})` lädt die gemeinsame obere Platte und liefert `draw(milliseconds)`, `resize(pixels)` und `dispose()`. Fehlendes WebGL beziehungsweise unzureichende Shaderpräzision wird als nicht verfügbare Bewegung behandelt. Die vollständige Masterillustration bleibt dann statisch erhalten.

`createMotionPlayer(root, renderer, onStatus)` liefert `play()`, `stop()`, `show(milliseconds)` und `dispose()`. `show()` ist eine statische Inspektionsposition und erzeugt keine laufende Schleife. Reduced Motion begrenzt sie auf Ruhe. Beim Scrollen wird nur laufende dekorative Bewegung gestoppt; eine statische Inspektionsposition darf erhalten bleiben.

`window.A4_DEMO` ist ausschließlich ein offen dokumentierter Prüfzugang dieser Studie. Er gehört nicht ungeprüft in den Produktcode. Bei einer späteren Einbettung muss deren Teardown `player.dispose()`, `renderer.dispose()` und `ResizeObserver.disconnect()` aufrufen. Die Demoseite stoppt bei `pagehide`, ohne die Rückkehr aus dem Browser-Back-Forward-Cache zu zerstören.

## Bewegungsregeln

- Quelle 1254 × 1254; Plattenschnitt bei Y=900. Bewegungen werden bereits vor Y=810 vollständig ausgeblendet.
- 72 × 72 Netzzellen; gemeinsam genutzte Knoten und Kanten. Stützpunkte sind auf ganze Quellpixel registriert, um Rasterabweichungen in Ruhe zu verhindern.
- Drei weich überblendete räumliche Bewegungsfelder; sie sind keine ausgeschnittenen Bildbüschel. Gepufferte Schutzzonen entlang der tragenden Holzachsen setzen deren Gewichte auf null.
- Ein manuell gestarteter Durchlauf von acht Sekunden. Weiche Hüllkurve beginnt und endet exakt in Ruhe. Höchstens 30 Renderaktualisierungen pro Sekunde, keine Leerlauf-RAF-Schleife.
- Gemessenes Maximum bei 3.720 ms im 40-ms-Raster: etwa 3,12 Quellpixel. Die Bilddeformation ist klein, kontinuierlich und dient keiner statischen Anpassung unpassender Teile.
- Ruhige Blattlicht-Modulation, höchstens 1,2 %. Keine Glanzeffekte oder wackelnder Gesamtbaum.
- Sichtbare Canvas-Auflösung abhängig von CSS-Größe, maximal Quellauflösung und Gerätepixelfaktor zwei.
- Statischer Bildfallback bei Kontextverlust oder fehlender bewegter Quelle. Kein verschwundener Baum.

Das ist keine Gelenkstruktur für einzeln gemalte Blätter. Feinzweige und ihre Früchte bewegen sich als lokal kontinuierlicher Teil der gemeinsamen Textur. Für eine spätere größere Bewegung wäre zusätzliche Zeichnung nötig; die jetzigen Amplituden dürfen nicht ohne erneute Bild-/Bewegungsprüfung erhöht werden.

## Verifikation und Grenzen

`qa-structure.mjs` zeichnet die tatsächliche Demo in nativer Auflösung in vier Posen. Es vergleicht Ruhe-RGBA, neun markierte Holz-/Wurzelflächen, die Schnittlinie und 434.148 zuvor deckende Innenpixel mit Randreserve. Die Prüfdatei und `structure.json` enthalten exakte Koordinaten und Grenzwerte. Der Nachweis ersetzt keine künstlerische Prüfung aller Blattkonturen.

`qa-browser.mjs` prüft zusätzlich endliche Laufzeit, Leerlauf, Reduced Motion, Scrollen, Kontextverlust, fehlende Quelle, Tastatur, Layout und Axe. Der synthetisch eingespeiste Hintergrundzustand ist kein echter iPhone-Hintergrundtest. Die Testumgebung nutzt Chromium mit SwiftShader; echte Smartphone-GPU, Safari und VoiceOver bleiben offen.

## Lokal ansehen

ZIP vollständig entpacken, Terminal im A.4-Ordner öffnen:

`python3 -m http.server 4734 --bind 127.0.0.1`

Dann `http://127.0.0.1:4734/index.html` oder `demo.html` öffnen. Die Adresse ist nur lokal auf dem eigenen Rechner erreichbar. ES-Module erfordern HTTP; Doppelklick auf die Datei ist kein zugesagter Betriebsweg. Alle Schrift- und Bildressourcen liegen lokal, keine Internetdienste nötig.

## Im Repository reproduzieren

Mit vorhandenen Node-Entwicklungsabhängigkeiten: `PORT=4734 node scripts/serve.mjs design/olive-tree-v2-a4` starten. Danach die drei Prüfungen getrennt ausführen:

- `node --test design/olive-tree-v2-a4/motion-model.test.mjs`
- `node design/olive-tree-v2-a4/qa-structure.mjs`
- `node design/olive-tree-v2-a4/qa-browser.mjs`

Der Browserpfad der mitgelieferten QA-Skripte ist `/usr/bin/chromium`; auf einem anderen Rechner bei Bedarf auf den installierten Chromium anpassen. Playwright und Axe sind bestehende Dev-Abhängigkeiten des Repositories. Nur der technische PNG-Export benötigt Python/Pillow; die PDF-Erzeugung zusätzlich ReportLab. Keine neue Laufzeitabhängigkeit der App wurde eingeführt.

Der technische Export `python3 design/olive-tree-v2-a4/export-plates.py` reproduziert Platten aus dem festen Master. `generate-motion-guide.mjs` erzeugt die analytische Bewegungsübersicht und den gemessenen Maximalzeitpunkt nach Modelländerungen. Die Bildgenerierung selbst wird nicht als deterministisch behauptet. Niemals `npm run build` für diesen Designauftrag erforderlich.

## Vor einer späteren Integration

Erst ausdrückliche Designentscheidung über Stufe 7. Danach getrennte Ausarbeitung der sechs übrigen Stufen mit eigener geometrischer und visueller Prüfung. Erst anschließend eigener Integrationsauftrag, App-Regressions- und Datenvertragsprüfungen, lokale Assetoptimierung sowie reale Geräteabnahme. Dieses Dokument autorisiert weder Phase B noch eine neue Datenstruktur.
