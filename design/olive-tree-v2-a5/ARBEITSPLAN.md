# Lichtkrone · Sieben Stufen und kontinuierliche Bewegung

Basis: c66edb0ff2fdd7a81c96713e5cd25488790f6636. Die A.4-Masterillustration ist durch den Nutzer freigegeben und bleibt bytegleich. Die Freigabe umfasst die Ableitung der übrigen sechs Stufen und die isolierte Daueranimationsvorschau, keine App-Integration.

## Architekturentscheidung

Eine Weiterentwicklung derselben A.4-WebGL-Netz-/Texturtechnik, keine zweite Runtime-Engine. Gemeinsame Zeichnung pro Stufe; ruhendes Tragholz und Wurzeln; unabhängige räumliche Blattfelder mit nicht gleichlaufenden Windphasen und sanften Impulsen. Die reine alte A.4-Pose dient als Vergleichsprofil innerhalb desselben Renderers.

Nur sichtbare, aktive Szenen im Vordergrund dürfen animieren. Reduced Motion wird dynamisch berücksichtigt. Pausen beenden RAF; Wiederaufnahme mischt vom letzten dargestellten Zustand weich in die neue Windbewegung. Ein Leistungsregler senkt Auflösung und Zielfrequenz, nicht die wahrnehmbare CSS-Auslenkung; bei unzureichender Leistung folgt ein statischer Zustand.

## Umsetzung und Prüfungen

- [x] Saubere A.4-Basis und bestehenden isolierten Worktree prüfen, neuen Branch anlegen.
- [x] Sechs zusammenhängende Altersdarstellungen vom freigegebenen Master ableiten. Frühere Stände schützen; keine erneute Stufe-7-Generierung.
- [x] Zentrale Stufen-/Geometriezuordnung und lokale komprimierte Runtime-Assets erzeugen. Bedeutungen und Schwellen unverändert dokumentieren.
- [x] Vor Verhaltensänderung Tests für fortlaufende Posen nach 8 Sekunden, statisches Tragholz, begrenzte CSS-Auslenkung und Netzkontinuität ausführen.
- [x] Gemeinsamen Renderer weiterentwickeln: stagebezogene Textur, dynamische Begrenzung der aktualisierten Fläche und kontrollierte Qualitätsstufen.
- [x] Lebenszyklus prüfen: automatisch sichtbar, verborgen/unsichtbar/disabled/Reduced Motion ohne Renderloop; weiche Rückkehr; vollständiger Abbau; kein doppelter RAF und keine veralteten Bildlade-Ergebnisse.
- [x] Direkten alten/neuen Bewegungsvergleich und mobile Heute-/Detailvorschau in vier Themes erstellen.
- [x] Reale Labormessungen zu Bildfrequenz, CPU-Zeit, JS-Heap und Pausen erfassen. Schwache Leistung synthetisch testen und ausdrücklich getrennt kennzeichnen.
- [x] Pixel-/Geometrieprüfungen gegen neue innere Löcher und bewegtes Tragholz; Bilder bei 200/300 CSS-px und 320/390 px.
- [x] Browser-/Accessibility-Prüfung, echte Videoaufnahmen, Bericht, PDF und vollständiges Vorschau-ZIP mit Prüfsummen.
- [x] Vorherige Dateien einschließlich freigegebenem A.4-Master bytegleich nachweisen. Kein Produktbuild, Merge oder Deployment. STOP zur App-Integrationsfreigabe.

## Besondere Risiken

Stärkere Bewegung darf feine Blattkanten verändern, aber weder das Tragholz verschieben noch Bildinseln oder Faltungen erzeugen. Dirty-Rectangle-Optimierung wird gegen vollständiges Neuzeichnen verglichen, um Bildreste auszuschließen. Qualitätsanpassung darf Bewegung nicht unsichtbar machen. Pausezeiten gehen nicht in die Leistungsstatistik ein. Asynchrones Bildladen darf eine neuere Stufenauswahl oder einen Komponentenabbau nicht überholen.
