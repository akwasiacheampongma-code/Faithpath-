# Physische Abnahme – vollständig OFFEN

Diese Liste enthält keine bereits bestandenen Gerätetests. Die Chromium-Aufnahmen ersetzen kein iPhone Safari oder VoiceOver.

Voraussetzung: Isolierte lokale/ausdrücklich freigegebene Vorschau, keine bestehende QA-Site überschreiben. Keine echten persönlichen Daten eingeben. Gerät, iOS-/Safari-Version, Zoom, Textgröße, Stromsparmodus, Temperatur und Testdauer protokollieren.

1. Galerie auf dem iPhone bei normaler Schrift öffnen. Alle sieben Motive und vier Themes ansehen. 320- und 390-Pixel-Kompositionen zusätzlich anhand der gelieferten Bilder vergleichen; tatsächliche CSS-Breite dokumentieren.
2. Baum bei ungefähr 200 und 280 CSS-Pixeln eine Minute beobachten. Ist die Bewegung ohne genaues Suchen sichtbar? Bleiben Stamm und Wurzeln ruhig? Wirken Früchte angebunden? Gibt es Löcher, Flimmern, Bildreste oder wiederkehrendes starres Wackeln?
3. Vergleich starten. Links endet die Bewegung nach acht Sekunden, rechts läuft sie weiter. Während des laufenden Vergleichs erneut starten und die acht Sekunden neu zählen.
4. Unter den Baum scrollen und mindestens zehn Sekunden warten. Zurückkehren: weich wieder einsetzende Bewegung. Zwischen Heute, Mein Weg, Detail und erstem Weg wechseln. Keine liegen gebliebenen Szenen.
5. Safari in den Hintergrund legen, Bildschirm sperren und nach einer Minute zurückkehren. Verhalten und Safari-Web-Inspector-Zähler prüfen: kein Hintergrund-RAF, kein Sprung beim Fortsetzen. Eine bloß ruhig wirkende Grafik beweist noch keinen gestoppten Loop.
6. „Bewegung reduzieren“ in iOS während geöffneter Vorschau aktivieren. Unveränderte ruhende Illustration, keine weitere Bewegung. Wieder deaktivieren: weicher Wiederbeginn. Danach manuelles Pausieren/Fortsetzen testen.
7. 200 % Text und Safari-Seitenzoom getrennt prüfen. Keine abgeschnittenen Wörter, versteckten Aktionen oder horizontalen Überläufe. Bibelzugang bleibt vor dem großen Motiv erreichbar. Mit Display-Safe-Areas und Browserleisten prüfen.
8. VoiceOver: Stufenname, Theme-/Bereichsauswahl, Pausieren/Fortsetzen, Bedeutung auf-/zuklappen, Fokusreihenfolge und sichtbare Zustände. Die kontinuierliche Grafik darf nicht fortlaufend angesagt werden.
9. Mindestens zehn Minuten sichtbar laufen lassen. Bei schwachem Gerät beziehungsweise Stromsparmodus Bildfrequenz, Wärme und Akku beobachten; tatsächliche Messung dokumentieren. Absenken der Qualität darf die sichtbare CSS-Auslenkung nicht verkleinern. Speicherwarnung und Grafik-Kontextverlust nach Möglichkeit im Web Inspector testen.
10. Offline: Entpacktes Paket über einen lokalen HTTP-Server ohne Internet laden. Alle Ressourcen sind lokal. Ein späteres installiertes FaithPath-PWA-Update ist erst nach App-Integration prüfbar und hier ausdrücklich nicht abgenommen.

Pro Fall: Bestanden / Fehler / Offen, Beobachtung, Bildschirmaufnahme, Diagnosezähler, Gerätedaten. Bei Fehlern vor Integration korrigieren; keine automatische Produktionsfreigabe.
