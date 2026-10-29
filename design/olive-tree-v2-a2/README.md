# FaithPath Olivenbaum V2 – Phase A.2

**Visuelle Entscheidungsvorlage. Keine Phase-B-Integration.**

Die bisherigen Dateien unter `design/olive-tree-v2/` bleiben unverändert. Diese neue Studie liegt separat unter `design/olive-tree-v2-a2/` auf dem bestehenden Designbranch.

## Ansehen

- `DESIGNENTSCHEIDUNG.pdf`: visuelle Kurzfassung mit beiden Mastern, Größenproben und Überlagerungen.
- `index.html`: interaktive Galerie mit Themewechsel, Größenprobe und isolierten App-Vorschauen.
- `boards.html?board=masters`: zwei neue Master im direkten Vergleich.
- `boards.html?board=stages`: sieben Stufen der Arbeitsrichtung Lichtkrone.
- `boards.html?board=overlays`: halbtransparente Überlagerungen 3/7, 4/7, 5/7, 6/7.
- `boards.html?board=small&size=200`: Stufen 5–7 bei exakt 200 × 200 CSS-Pixeln, alternativ 180 oder 220.
- `boards.html?board=evolution`: vollständiger Vergleich mit A.1.

ZIP vollständig entpacken. Lokaler Start: `python -m http.server 4732` im entpackten Ordner; dann `http://localhost:4732` öffnen. Alle Assets und Schriften liegen lokal bei. Der Datei-Doppelklick ist in der verwalteten Testumgebung durch deren Browserrichtlinie gesperrt und wurde nicht als bestanden ausgegeben. Für das iPhone ist die PDF die einfachste bildliche Vorschau; eine echte Geräteabnahme ersetzt sie nicht.

## Dateien und Wiederholbarkeit

`asset-manifest.json` ordnet Stufen und Quellen zu. Stufe 7 verwendet denselben Originalmaster wie Lichtkrone, ohne eine zweite PNG-Kopie. `prompts.json` dokumentiert alle neun Bildgenerierungsaufrufe. Die verworfene erste Stufe 5 liegt separat in `evidence/iterations/`.

Aus dem Repository:

```
python design/olive-tree-v2-a2/export-assets.py
PORT=4732 node scripts/serve.mjs design/olive-tree-v2-a2
node design/olive-tree-v2-a2/qa.mjs
```

Der Export benötigt Pillow; die PDF-Erstellung ReportLab. Verwendete Versionen stehen im Nachweis. Die Originale sind 1254 Pixel groß. Wiederholte Bildgenerierung ist nicht bytegleich reproduzierbar; Originaldigests und gelieferte Dateien sind maßgeblich. Der technische Export verändert keine Astgeometrie: volle Source-Canvas, identische 92-%-Skalierung plus 4 % Rand für alle Stufen.

Die Galerie liest oder schreibt keine persönlichen Appdaten. Themen, Stufen und synthetische Layoutzustände werden nur innerhalb der Designansichten gewechselt. Bestehende Wachstumsregeln, Schema V5, Wege, Journal, Bibel und Fragen bleiben unberührt.

**Die Empfehlung Lichtkrone ist eine Art-Direction-Arbeitswahl. Die Entscheidung des Auftraggebers steht aus.**
