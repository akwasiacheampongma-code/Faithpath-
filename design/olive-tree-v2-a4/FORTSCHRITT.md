# A.4 Fortschritt

Basis: 18e9f1f1f644045fa76240bc12a342412bab99df. Scope: ausschließlich design/olive-tree-v2-a4/.

- Master: eine gemeinsame ImageGen-Retusche der A.2-Lichtkrone; keine isolierten neuen Kronen und keine übrigen sechs Stufen.
- 3 Modelltests, 16 Browser-Prüfgruppen, 24 mobile Layoutfälle, 16 Fälle mit 200 % Text und 8 Galerie-Fälle mit 200 % bestanden.
- Rasterfix: CPU-Plattenzusammensetzung exakt; GPU-Ruhebild zunächst um maximal 5/255 abweichend. Höhere Fragmentpräzision allein änderte das nicht. Ganzzahlig registrierte Netzpunkte beseitigten die Abweichung (0/255).
- Lebenszyklusfix: Eine statische Prüfposition wurde außerhalb des Viewports unnötig auf Ruhe zurückgesetzt. Reproduziert 3720 → 0 ms; korrigiert zu 3720 → 3720 ms. Nur laufende dekorative Bewegung wird beim Verlassen gestoppt.
- 434.148 deckende Innenpixel geprüft; keine neuen Transparenzlöcher in vier Posen. Neun Holz-/Wurzel-Prüfflächen und die Plattenschnittlinie bleiben pixelgleich.
- Echte Browseraufnahme vorhanden; keine physische Geräte-Performance gemessen.
- Nächster Schritt: frische unabhängige Code-/Sichtprüfung, Bericht/PDF/ZIP und endgültige Integritätsprüfung.
- Designfreigabe bleibt beim Auftraggeber. Kein Produktbuild, Merge oder Deployment.
