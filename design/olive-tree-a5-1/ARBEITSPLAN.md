# FaithPath A5.1 – ein gemeinsames Gesamtpaket

> Ausführung direkt in diesem Worktree nach dem ausdrücklich vollständigen Nutzerauftrag; eine gemeinsame Endabnahme, keine weiteren Designphasen. Workflow: executing-plans, TDD und abschließender unabhängiger Review.

**Ziel:** Sieben unterscheidbare Lebensphasen derselben Lichtkrone, botanischer Olivenkern, sichtbar stärkerer Dauerwind und saubere Stufenwechsel als isolierte, nachweisbar geprüfte Vorschau.

**Basis:** f3f19e118ceb0e54dda71f164f8da9a1578fff42, Branch feature/olive-tree-continuous-seven-stages-20261101. Arbeitsbranch feature/olive-tree-a5-1-final-living-tree.

**Architektur:** Eine Weiterentwicklung des vorhandenen WebGL-Renderers mit zusammenhängendem Netz, geschützten Holzachsen, sechs überlappenden lokalen Bewegungsfeldern und einer vollständigen Textur je sichtbarer Stufe. Ein unabhängiger kurzer Überblendungskoordinator verwendet nur eine statische Momentaufnahme, keinen zweiten Baum-Renderloop. Reine Daten, Geometrie, Wind, Renderer, Laden, Lebenszyklus, Leistungsregler und Galerie bleiben getrennt.

**Technik:** Vanilla-JavaScript/ES-Module, WebGL, native Browser-Animation für die kurze Überblendung, lokale WebP/PNG, vorhandenes Node-/Playwright-/Axe-Testwerkzeug. Keine Runtime-Abhängigkeit und kein Frameworkwechsel.

## Geschützte Verträge

- Alle bisherigen Dateien einschließlich A5 bleiben bytegleich; neue Arbeit ausschließlich unter design/olive-tree-a5-1/.
- Stufe 7 bleibt der bytegleiche freigegebene A4-Master. Bedeutungen und Schwellen 0, 1, 2, 3–4, 5–6, 7–9, ab10 ausdrücklich bestätigte Entwicklungen bleiben unverändert.
- Keine Änderung an echter App, Schema V5, Nutzerdaten, Bibel, Quiz, Backup oder Wachstumsauslösern. Kein Produktbuild, Merge oder Deployment.
- Keine Vermutung als behobener Renderfehler, keine Testzahlerhöhung durch leere Tests, keine behauptete echte Geräteabnahme.

## Besondere Reviewfälle

- Schneller Stufenwechsel während eines noch ladenden Bildes oder laufender Überblendung: letztes Ziel gewinnt; keine abgebauten Szenen starten nachträglich.
- Screenshot und echte Compositor-Darstellung können sich von Canvas-readPixels unterscheiden: DOM-Aufnahmen gegen vollständige Referenz prüfen.
- Größere Auslenkung kann Netzfaltungen oder abgeschnittene Randblätter verursachen: Gradienten, feste Holzflächen und Bewegungssaum bei 200px prüfen.
- Kontextverlust/Bildfehler mitten im Stufenwechsel: vollständiger Fallback, keine verlorene alte Zeichnung oder unsichtbare neue.
- Reduced Motion, Hintergrund oder Unsichtbarkeit während der Überblendung: abbrechen, vollständigen Zustand darstellen, keine RAF-/Animationsreste.

## Arbeitsschritte

1. [x] Saubere Basis, neuen Branch, alte Nachweise und Baseline prüfen. Bericht246 gegen echte245 nachweisen. Rechteck in gespeicherten Bildern bestätigen; frische A5-Aufnahmen separat prüfen.
2. [x] Sechs Illustrationen anhand des freigegebenen Masters überarbeiten. Stufe5 niedriger/breiter, Stufe6 zusätzliche Leittriebe und klare Silhouette, Stufe7 unverändert. Bei200px visuell vergleichen.
3. [x] Zentrale Geometrie-/Bildzuordnung und responsive Runtimegrößen erzeugen. Versionierte unveränderliche Dateinamen atomar veröffentlichen; nur sichtbare Variante laden. PNG-Quellen und Prüfmedien gehören nicht zur Runtime-Allowlist.
4. [x] Vor Umsetzung Windtests rot ausführen: äußere5–7px, innere2–4px, geschütztes Holz, anhaltend10/30/120s, positive Dreiecksflächen. Wind und Renderer weiterentwickeln; größere Bewegung nicht durch Qualitätsabsenkung zurückregeln.
5. [x] Überblendung mit klarer cancel/dispose-Schnittstelle implementieren. Lebenszyklus und Ressourcenfreigabe mit echten Bildfehlern/Kontextverlust und schnellen Wechseln prüfen.
6. [x] Zusammenhängende Galerie, vier Kontexte, alleThemes und320/375/390/430 sowieDesktop/200%-Text prüfen. Frische Bilder aufnehmen und visuell ansehen.
7. [x] Echter120s-Lauf mit protokollierten10/30/120s-Prüfpunkten, CPU-/Heap-/Framewerten; mindestens30s echter A5/A5.1-Vergleich als Browseraufnahme. Angaben zu übermittelten Frames von Präsentationsrate und Geräteenergie trennen.
8. [x] Bestehende App-Tests und neue Modell-/Browser-/A11y-/Fehlerprüfungen ausführen. Alle alten Dateihashes und Masterhash verifizieren. Gesamtreview und gezielte Korrekturen.
9. [x] Ein gemeinsamer Bericht, Galerie, sieben Bilder, Runtimepaket, Videos, Screenshots, Maschinenresultate und ZIP-Prüfsummen. STOP zur einen gemeinsamen Designabnahme.

## Fortschritt und Entscheidungen

- Nutzerauftrag ersetzt zusätzliche Zwischenabnahmen; Bildrichtung A4 ist bereits ausgewählt. Keine Frage zu Einzelstilen/Farben nötig.
- Frische A5-Kontexte sind ohne Rechteck. Anfangs nicht reproduziert. Anschließend mit Start view=family&paused=1 und Wechsel zurück zur Vorschau exakt reproduziert: Framebuffer2x2 bleibt bei pausierter Sichtbarmachung bestehen. Cause und Originalvergleich in evidence/diagnosis/rectangle-cause.json.
- A5-Bericht nennt246, Originalprotokolle und Baseline245/245. Neue Berichte werden aus tatsächlichen Protokollwerten erzeugt.
