# TREEFINAL – physische Geräteabnahme: OFFEN

Diese Anleitung ist kein bestandener Test. Erforderlich sind echtes iPhone/Safari, eine installierte iPhone-PWA und VoiceOver. Frühere offene MOBILE2-/Phasen-Gerätegates bleiben bestehen.

## Vorbereitung

Nur nach ausdrücklicher Freigabe eine isolierte HTTPS-QA-Origin verwenden. Das gelieferte ZIP wurde nicht veröffentlicht. Keine persönlichen Produktivdaten für diesen Test importieren. Eigene Bestandsdaten vor einem freiwilligen Gerätetest über die bestehende Exportfunktion separat sichern.

Erwarteter Build: `FP4-20261018-G-STABLE1-UIUX6D-TREEFINAL`; Appquellcommit `ce89422411ec3382c62ba7683167cf1b6db4a457`.

Notieren: Gerät, iOS-Version, Browser, installierte PWA oder Safari, angezeigte Build-ID, Safari-Seitenzoom, iOS-Textgröße, Bedienungshilfen und Theme. Vergrößerung nicht zurücksetzen, um einen Fehler zu verstecken. Screenshot-Rasterpixel beweisen keine CSS-Viewportbreite.

## Prüfliste

| Schritt | Erwartung | Status |
|---|---|---|
| Mein Weg → Olivenbaum, leerer synthetischer Zustand | Samen und persönliche Bedeutung vor der Grafik; kein Druck und keine Glaubenswertung | OFFEN |
| Alle sieben bestehenden Darstellungen mit synthetischen Fixtures | Richtige Namen, Bedeutungen und Originalbilder; keine Level-/Punktebeschriftung | OFFEN |
| Nacht, Hell, Papier, Atmosphärisch | Lesbarer Text, klare aktuelle Darstellung, sichtbare Bedienelemente | OFFEN |
| 320×568 und 390×844 CSS-Viewport beziehungsweise passende reale Geräte | Kein horizontaler Verlust; normale Bedeutung gut erreichbar; vertikales Scrollen erlaubt | OFFEN |
| Normale und 200% Schrift/Zoom; persönliche ursprüngliche Einstellungen | Ganze Texte erreichbar; keine verdeckten letzten Zeilen. Bei Bedarf gültige Trennung „Frucht-tragender“, vollständige Wörter, keine kleinere Überschrift; berechnete Absatzabstände prüfen | OFFEN |
| „Alle sieben Stufen und ihre Bedeutung“ auf-/zuklappen | Vollständige sieben Texte; genau eine aktuelle Darstellung; keine Datenänderung | OFFEN |
| „Warum genau sieben?“ auf-/zuklappen | Gestaltungsentscheidung und passende Bibelkontexte verständlich; keine vorgeschriebene Glaubensleiter | OFFEN |
| VoiceOver: Überschrift, aktueller Text, Grafik, beide Summaries, Liste | Sinnvolle Reihenfolge und vollständige Aussprache von „Fruchttragender Olivenbaum“; Zustand offen/geschlossen; sieben Einträge erreichbar; aktuelle Darstellung erkennbar | OFFEN |
| Externe Tastatur: Tab, Enter, Leertaste, Rückweg | Sichtbarer Fokus, verständliche Toggle-Zustände, keine Fokusfalle | OFFEN |
| Nummerierten Zweig und ursprünglichen Moment öffnen | Tatsächlicher Weg/Originaleintrag; Archivierung und Rückblicke korrekt | OFFEN |
| Seite unterbrechen, erneut öffnen, Theme wechseln | Derselbe persönliche Stand; Entwurf, Markierungen und Einträge erhalten | OFFEN |
| Offline-Vorbereitung abwarten, Flugmodus, Baum neu laden | Grafik, sieben Texte, Kontexte und Fonts offline vollständig | OFFEN |
| TREEGUIDE2→TREEFINAL auf derselben isolierten Origin | Bewusste Updateaktivierung; Hauptdaten, Entwurf, Sicherung und Fortschritte erhalten; danach offline prüfen | OFFEN |
| Safari-Browserleisten, Safe Areas, Querformat, installierte PWA | Letzte Inhalte und Aktionen erreichbar; keine unerwarteten Sicherheitsabstände/Überlappungen | OFFEN |
| Bestehenden Entwurf mit Bildschirmtastatur öffnen/schließen | Kein Verlust, Speichern und Schließen erreichbar; keine unerwartete Zoomfalle | OFFEN |
| Bewegung reduzieren | Alle Inhalte ohne Animation verständlich und bedienbar | OFFEN |

Die installierte PWA hat möglicherweise keine Safari-Seitenzoomregler. Tatsächlich verfügbare Systemvergrößerung und Methode dokumentieren; fehlende Regler nicht als bestandenen 200%-Test ausgeben. Das automatisierte Verdoppeln der CSS-Rootschrift ist eine andere Prüfung.

Pro Befund: Build-ID, Gerät/Einstellungen, Route, Handlung, Erwartung, Ergebnis und Aufnahme festhalten. Keine echten privaten Texte in öffentliche Berichte übernehmen.

**Gate:** Erst nach nachvollziehbarer physischer Abnahme über einen Release entscheiden. Keine Produktionsfreigabe durch diesen Bericht.
