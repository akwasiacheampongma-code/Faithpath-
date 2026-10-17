# FaithPath – Drei mögliche Zukünfte

**Designstudie Phase 6A. Keine Produktionsversion.**

1. ZIP vollständig in einen eigenen Ordner entpacken.
2. `index.html` im Desktop-Browser öffnen. Alle Dateien müssen zusammenbleiben.
3. Eine der drei Richtungen wählen oder „Alle drei vergleichen“ aktivieren. Ansichten, Breite und vier Themes lassen sich umschalten.
4. „Ohne Rahmen öffnen“ zeigt eine Richtung unmittelbar im eigenen Browserfenster.
5. `comparison.html` zeigt die echten Vorher-/Nachher-Browseraufnahmen. Weitere PNGs liegen in `screenshots/`.

Kein Installationsschritt, keine Anmeldung, keine externen Fonts und kein CDN. Die Dateien verwenden klassische lokale Scripts, relative Assets und keine Laufzeit-Fetches. **Das direkte `file://`-Öffnen wurde im verwalteten Prüf-Browser administrativ blockiert und bleibt als manueller Prüfschritt offen.** Die tatsächlichen Browserprüfungen liefen über einen lokalen statischen Server. Falls dein Browser lokale Scripts blockiert, im entpackten Ordner `python3 -m http.server 8080 --bind 127.0.0.1` starten und `http://127.0.0.1:8080` öffnen. Nicht mit dem FaithPath-Produktionsordner vermischen.

## Tatsächlich bedienbar

- Fünf Ansichten je Richtung, vier Hauptbereiche, Entdecken als sekundärer Bibelbereich.
- Eigener nächster Schritt, Schritt als getan/offen festhalten, historische Gedanken betrachten.
- Vier originale Johannes-Kapitel (1, 3, 15, 16), OTB Deutsch und Luther 1912; Auswahl, Markierung, Notiz und zugehöriger Journaleintrag.
- Suchen im Journal, neue synthetische Gedanken festhalten; ungespeicherten Entwurf samt ursprünglicher Bibelreferenz wieder aufnehmen.
- Suche in 696 originalen aktiven Inhaltseinheiten, Filter, begrenzte Ergebnisanzeige. Eine vollständig bedienbare Beispielgeschichte: „Der rechte Weinstock“, NS-0297, mit sechs unveränderten N-Fragen und freiwilliger Reflexion.
- Sieben originale Baumgrafiken sowie fünf synthetische Schwertzustände zum direkten Vergleich. Dies sind ausdrücklich **Demowähler**, keine Produktionsregeln oder manuell einstellbaren Glaubenslevel.
- Alle vier Darstellungsthemes je Richtung, Tastaturdialoge, Reduced Motion.

**Alle persönlichen Einträge sind synthetisch.** Demoeingaben bleiben im Arbeitsspeicher der geöffneten Ansicht. Neuladen oder Wechseln der Galerieinstanz setzt sie zurück. Nichts wird in localStorage, in der bestehenden App oder in einer Cloud gespeichert. Die Galerie besitzt keinen Service Worker und ist keine installierbare Ersatz-PWA. Ein bereits geladener Prototyp lässt sich offline weiter bedienen; ein vollständiger PWA-Neustart wird hier nicht behauptet.

Vollständige Bibel, sämtliche Fragen, Backup/Wiederherstellung, Archive, Erinnerungen und andere bestehende Funktionen verbleiben unverändert in der eigentlichen App. Der Prototyp zeigt ausgewählte Interaktionen; unimplementierte Originalfunktionen werden nicht durch täuschend echte Schaltflächen ersetzt.

## Dokumentation

- `docs/AUDIT.md`: selbst betrachtete Ausgangsoberfläche und Grenzen.
- `docs/DESIGNSYSTEM.md`: drei Designsprachen, Tokens, Typografie und Quellenrechte.
- `docs/VERGLEICH_UND_EMPFEHLUNG.md`: kritischer Vergleich und klare Empfehlung.
- `docs/INTEGRATION_6B.md`: Funktionsvertrag, Architektur, Konfliktmatrix und 20–28 PT Aufwand.
- `docs/QA_BERICHT.md`: echte Ergebnisse, korrigierte Prototypfehler und offene Gerätegates.
- `docs/IPHONE_ABNAHME.md`: manuelle Tests.
- `BUILD.json`, `MANIFEST.json`, `SHA256SUMS.txt`: Herkunft und Datei-Prüfsummen.

## Reproduzieren für Entwickler

Im vollständigen Repository: `npm ci`, Galerie mit `PORT=4482 node scripts/serve.mjs prototypes/uiux6` bereitstellen, dann `node prototypes/uiux6/tests/model.test.mjs`, `node prototypes/uiux6/tests/sources.mjs`, `node prototypes/uiux6/tests/browser.mjs`, `node prototypes/uiux6/tests/accessibility.mjs`. Playwright erwartet `/usr/bin/chromium`; bei anderer Installation den Pfad anpassen. Browser-Tests benötigen den lokalen Server. `tests/sources.mjs` benötigt die Originalquellen im Repository; der reine ZIP-Inhalt enthält absichtlich keine zweite vollständige App. `tests/model.test.mjs` lässt sich auch im reinen Paket ausführen.

Katalogprojektion reproduzieren: `node prototypes/uiux6/tests/generate-fixtures.mjs`. Sie liest das vorhandene aktive Runtime-Modell und schreibt ausschließlich `catalog.js` in dieser Galerie, keine Originaldatei.

Phase 6A endet mit dieser Lieferung. Keine Veröffentlichung, kein Merge und keine vollständige App-Neugestaltung ohne Auswahl und gesonderte Freigabe für 6B.
