# Lichtkrone A.4 · Arbeits- und Prüfplan

**Ziel:** Ausschließlich Stufe 7, als zusammenhängende Retusche der A.2-Lichtkrone. A.1/A.2/A.3 und echte App bleiben unverändert. Designfreigabe erst nach der fertigen Vorlage durch den Auftraggeber.

**Entscheidung zur Technik:** Eine gemeinsame Kronenzeichnung wird nicht erneut in unabhängig gemalte Büschel zerlegt. Zwei komplementäre transparente Bildplatten teilen die fertige Zeichnung unterhalb der Krone. Die obere Platte enthält auch tragendes Holz. Dieses Holz bleibt durch explizite bewegungsfreie Zonen statisch. Eine kleine kontinuierliche lokale Verformung bewegt ausschließlich periphere Blatt-/Feinzweigbereiche. Früchte bleiben in derselben Zeichnung wie ihre Stiele. Es wird keine natürliche Einzelblatt-Riggingqualität behauptet.

**Alternativen:** Die A.3-Büschel weiter ergänzen würde das nachgewiesene Collageproblem fortführen. Bewegte ausgeschnittene Kronenhälften würden an den Schnitten neue Retusche und Überlappungsreserven benötigen. Gewählt wird deshalb die zusammenhängende Textur mit sehr kleiner lokaler Bewegung. Sollte diese Bewegung sichtbar künstlich sein, wird sie reduziert oder verworfen; das statische Bild hat Vorrang.

## 1. Künstlerischer Master

- [x] Geprüften Basiscommit und sauberen Worktree feststellen, neuen A.4-Branch anlegen.
- [x] Originale A.1, A.2, A.3 tatsächlich betrachten; A.2-/A.3-Berichte lesen.
- [x] A.2 als einzige künstlerische Referenz an gezielte Bildretusche übergeben. Originale bewahren.
- [x] Ersten A.2/A.3/A.4-Vergleich mit gleicher Canvas, Skalierung und Hintergrund im Browser aufnehmen und ansehen.
- [x] Detailansichten der Hauptgabeln, der rechten Biegung, der Kronenverbindungen und Früchte aufnehmen; gestalterisch bewerten.

## 2. Kontinuierliche Animation

Dateien: `motion-model.js` für Koordinaten, Holzschutzzonen und Phasen; `leaf-renderer.js` für die kontinuierliche Bildabbildung; `motion-player.js` für begrenztes Abspielen und Lebenszyklus; `demo.js` für die isolierten Bedienelemente. Kein Import aus dem Produktcode, kein persönlicher Speicher.

- [x] Vor Implementierung Modelltests für unveränderte Wurzeln/Tragholz, unverzerrte Schnittlinie, identische Anfangs-/Endposition und positive Dreiecksorientierung ausführen.
- [x] Zwei RGBA-Platten aus derselben Masterzeichnung ohne inhaltliche Retusche exportieren; Ruhe-Rekomposition vergleichen.
- [x] Gemeinsames Dreiecksnetz ohne Teilbild-Lücken zeichnen. Shader-Bewegung höchstens wenige Quellpixel; statischer Bildfallback bei fehlender Grafikunterstützung.
- [x] Browserbeweise für Ruhe, Mitte, Maximum, Ende, Reduced Motion und Kontextverlust aufnehmen. Neue Transparenzlöcher in zuvor deckenden Innenflächen messen; Holzpixel vergleichen.
- [x] Abbruch bei verborgenem Dokument, unsichtbarer Ansicht, Reduced Motion und erneutem Reset prüfen. Keine unbegrenzte Animationsschleife.

## 3. Visuelle Übergabe

- [x] A.2/A.3/A.4-Direktvergleich, Detailbilder und echte Videoaufnahme.
- [x] 200-CSS-px-Vorschau sowie 320/390-px-Ansichten in vier Themes; Heute priorisieren. Synthetische Inhalte und erklärte Platzhalteraktionen.
- [x] Große Schrift, Tastatur, Fokus und zugängliche Bedienelemente prüfen. Physische iPhone-/Safari-/VoiceOver-Prüfungen offen lassen.
- [x] Alle vorhandenen Dateien gegen Basiscommit prüfen, abschließende Nachweise bündeln, nachvollziehbaren Git-Commit ausschließlich auf A.4 erstellen.
- [x] Künstlerische Empfehlung getrennt von technischen Ergebnissen dokumentieren. Keine Qualitätsnoten. Kein Produktbuild, Merge oder Deployment. STOP vor übrigen sechs Stufen und Phase B.

## Besondere Fehlerrisiken

1. Statischer Stamm bewegt sich durch interpolierte Nachbarpunkte: Schutzzone mit Reserve größer als eine Netzzelle, Bildvergleich auf Holzflächen.
2. Schnittlinie wird bewegt: alle Auslenkungen deutlich oberhalb der Schnittlinie auf null ausblenden.
3. Sichtbare Bildlöcher / Faltungen: verbundenes Netz, strikt positive Dreiecksflächen, Bildtests in mehreren Phasen.
4. Grafikausfall oder fehlende Ressource: statischer Bildfallback und verständlicher Status, kein verschwundener Baum.
5. Start vor Bildladen oder Reset während Laden: getrennte Bereitschaft und Abspielzustand; erst nach vollständigem Laden aktivieren.

Der Nutzerauftrag ist die verbindliche Spezifikation. Dieser Plan legt technische Details eigenständig fest und verschiebt das vereinbarte Design-Gate nicht nach vorne.
