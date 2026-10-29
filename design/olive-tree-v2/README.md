# FaithPath Olivenbaum V2 – Design-Gate A

Studie **FP-DESIGN-20261029-OLIVE-V2-A**, zu GitHub Issue #2.

1. ZIP vollständig entpacken.
2. **index.html** öffnen. Alternativ die visuelle Entscheidungsvorlage **DESIGN_ENTSCHEIDUNG.pdf** oder den vollständigen **BERICHT.html** lesen. Alle Bilder, Schriften und Skripte liegen lokal bei.
3. Für einen lokalen HTTP-Server optional `python -m http.server 4731` in diesem Ordner ausführen; dann `http://localhost:4731` öffnen.
4. `sheet.html` zeigt alle sieben Stufen nebeneinander. `preview.html` ist die isolierte mobile Layoutstudie.

Die Oberfläche ist **keine neue App-Version**. Es werden keine Wege erstellt, keine persönlichen Daten gelesen oder geschrieben und keine Service Worker installiert. Die echte FaithPath-App im Repository bleibt unverändert. Bibel- und Journalaktionen erklären deshalb transparent ihren Entwurfsstatus.

## Dateien

- `assets/masters/`: sieben originale generierte RGBA-PNGs.
- `assets/web/`: lokale WebP-Exporte in 512 und 1024 Pixeln.
- `assets/previous/`: bestehende SVG-Geometrie aus `src/olive-tree.js`, nur für gültiges eigenständiges SVG serialisiert.
- `evidence/baseline/`: echte Screenshots der unveränderten App mit synthetischen Daten.
- `evidence/screenshots/`: echte neue Chromium-Screenshots der Designstudie.
- `evidence/qa-results.json`: ausführbare Galerieprüfungen und Grenzen.
- `BERICHT.md`, `ANIMATION_UND_INTEGRATION.md`, `ASSET_PROVENIENZ.md`: Bewertung, technischer Plan und Herkunft.
- `asset-manifest.json`: zentrale Zuordnung der sieben Darstellungen mit Größen und SHA-256.
- `SHA256SUMS.txt`: Integritätsliste; im Liefer-ZIP zusätzlich `DELIVERY.json` mit dem Designcommit.

## Reproduzieren

Aus dem Repository: `npm ci --cache /tmp/faithpath-olive-v2-npm-cache`.

Illustrationsexporte: `python design/olive-tree-v2/export-assets.py` (Pillow; erzeugt nur Größen, Canvas-Ausrichtung und WebP-Kodierung, keine neue Bildgestaltung).

Galerie ausliefern: `PORT=4731 node scripts/serve.mjs design/olive-tree-v2`.

Galerie prüfen: `node design/olive-tree-v2/qa.mjs`. Zusätzliche Verträge: `node design/olive-tree-v2/qa-contracts.mjs`. Statische Prüfung der Studienskripte: `node design/olive-tree-v2/lint.mjs`. Erwartet Chromium unter `/usr/bin/chromium` oder `CHROMIUM_PATH`. Die verwendeten Bibliotheksversionen stehen in `evidence/toolchain.json`. Andere Encoder-Versionen können andere WebP-Bytes ergeben; die Original-PNGs und gelieferten Hashes bleiben maßgeblich. KI-Bilder lassen sich nicht durch denselben Prompt bytegleich neu generieren.

**Hier endet Phase A. Phase B benötigt die ausdrückliche Designfreigabe des Auftraggebers.**
