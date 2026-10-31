# Ebenenvertrag · Lichtkrone A.3

Status: technische Studie; **nicht als endgültige Markenillustration freigegeben**. Autorität für Pfade und Stufen ist `manifest.json`, für den nächsten Export `geometry.js`. Index 0–6 entspricht den bestehenden sieben Stufen. Keine Fortschrittsberechnung ist in der Studie implementiert.

## Dateikonvention und Koordinaten

Alle ausgelieferten Ebenen und Kompositbilder: 1254 × 1254 RGBA. Ursprung links oben; X nach rechts; Y nach unten. PNG-Flächen dürfen bei einer späteren Verwendung nicht einzeln eng beschnitten werden. Gemeinsame Canvas garantiert Registrierung. Unterschiede der ImageGen-Quellgrößen werden über die ausdrücklich angegebenen lokalen Quellanker ausgeglichen.

| Ebene | Datei / Zuordnung | Pivot / Verhalten |
|---|---|---|
| G | `assets/layers/G-ground-contact.png`, alle Stufen 3–7 | Statisch; Kontakt 650/1100; enthält Boden und unterste Wurzelteile ab Y=1100 |
| W | `W-young.png` Stufen 3–4; `W-mature.png` Stufen 5–7 | Statisch, gleicher Raum wie G; kein Animationsschwenk |
| C1 | `stage-N-C1.png`, Stufen 3–7 | 432/363; hohe linke Krone |
| C2 | `stage-N-C2.png`, Stufen 3–7 | 353/528; äußere/untere linke Partie |
| C3 | `stage-N-C3.png`, Stufen 3–7 | 1042/542; rechte Krone |
| F1 | `stage-7-F1.png`, sonst deklarierte Leerebene | Elternteil C1, gleicher Pivot; zwei hintere Fruchtgruppen nur Stufe 7 |
| F2 | `stage-6-F2.png`, `stage-7-F2.png`, vorher Leerebene | Elternteil C3; eine / drei vordere Gruppen |

Die allgemeine Kompositreihenfolge ist G, W, F1, C1, C2, C3, F2. Die Demo führt F1/C1 und C3/F2 jeweils in gemeinsamen Containern; die getrennten Kronensektoren überschneiden sich nur geringfügig. Es liegen keine versteckten vollständigen Ersatzbäume in den Kronenebenen.

Samen und Keimling haben keine vorgetäuschten Kronen-/Fruchtebenen. Die originalen A.2-Nahansichten liegen bytegleich unter `assets/composites/stage-1.png` und `stage-2.png`. Ihre Pflanzung ist in der mobilen Vorschau ein gekennzeichnetes Storyboard, keine neue Speicher- oder Wachstumsfunktion.

## Quellen und Transformation

`geometry.js` ordnet jeder Krone eine neu gemalte Quelle, einen Quellanschluss und einen Zielanschluss zu. Translation, Rotation und einheitlicher lokaler Maßstab setzen die betreffende Zweiggruppe an den Holzanschluss. Die Stufe verändert ausschließlich den Umfang derselben Kronenteile. Kein vollständiges Baumfoto wird pro Alter unabhängig passend skaliert oder elastisch verzerrt.

Das ist ein geometrisch konsistentes Rig, aber noch keine fertige natürliche Wachstumszeichnung. Gleiche Quellteile führen auch zu wiedererkennbaren wiederholten Blättern. Diese Grenze muss bei der endgültigen Zeichnung verbessert werden.

Fruchtstiele werden in den lokalen Koordinaten ihres jeweiligen Kronenastes platziert. Quellanker und Teiltransformation stehen im Manifest. Allein ein nicht transparenter Ankerpixel beweist noch keine perfekte botanische Verbindung; die Sichtprüfung bleibt maßgeblich.

## Animation

C1: +0,28° / −0,12°, sechs Sekunden. C2: −0,40° / +0,16°, 5,5 Sekunden. C3: −0,30° / +0,12°, 7,5 Sekunden. Je zwei Zyklen, keine automatische Dauerbewegung. Licht: höchstens 0,08 Deckkraft. G/W sind ausdrücklich statisch. Kein App-State löst diese Studie aus.

Übergang 6→7: eine Sekunde Kronenüberblendung, identische G/W bleiben bestehen. Keine behauptete Verzweigungsmorphologie. Bei Reduced Motion direkter Zustandswechsel. Reset, Bildfehler und konkurrierende Aufrufe sind im isolierten Controller abgesichert.

## Reproduktion

Im Repository: `PORT=4733 node scripts/serve.mjs design/olive-tree-v2-a3`. Danach `node design/olive-tree-v2-a3/check-export.mjs` und `node design/olive-tree-v2-a3/qa.mjs`. Bestehende lokale Entwicklungsabhängigkeiten reichen; keine neue Laufzeitbibliothek.

Das ZIP kann ohne Node mit `python3 -m http.server 4733 --bind 127.0.0.1` aus seinem entpackten Ordner betrachtet werden. `http://127.0.0.1:4733/index.html` öffnen. Der Befehl veröffentlicht nichts im Internet. Die Demo benötigt keine Internetverbindung zu externen Diensten, aber der lokale Server muss laufen. Ein Service Worker für die Studie ist absichtlich nicht enthalten.

## Grenzen für Phase B

Kein Asset automatisch in `src/`, bestehende Baumverzeichnisse, Cachelisten oder Nutzerdaten übernehmen. Zuerst künstlerische Retusche und Designfreigabe. Danach eigenen Integrationsauftrag mit App-Tests, Datenintegrität, lokaler Assetoptimierung, PWA-Update, echtem iPhone-Gate und unveränderten Schwellen durchführen.
