# FaithPath UI1: persönliches Glaubensjournal

Basis: `FP4-20261001-G-MENU1`. Kandidat: `FP4-20261001-G-UI1`.

## Gestaltung

Warme Cremeflächen, tiefes Olivgrün, warmes Dunkelgrau und zurückhaltendes Gold. Bestehende Systemschriften und Serifenschriften bleiben lokal verfügbar; keine externen Fonts oder neue Bildwelt.

Farbtokens in `styles.css`: `--page-background`, `--surface`, `--elevated-surface`, `--primary`, `--primary-soft`, `--accent-gold`, `--text-primary`, `--text-secondary`, `--border`, `--success`, `--warning`, `--danger`. Bestehende Variablennamen bleiben als Aliase erhalten.

Typografierollen: Display, H1, H2, Section, Body, Bible, Meta, Caption, Button. Abstände: 4, 8, 12, 16, 24, 32, 48 px. Radien: 8, 12, 16 px. Schatten nur dezent auf ausgewählten persönlichen Flächen.

Eine Hauptaktion je Aktionsgruppe, unterstützende Aktionen mit hellem Hintergrund, Nebenaktionen als Text. Touchflächen bleiben mindestens 44 px hoch. Fokusindikatoren und Reduced Motion bleiben erhalten.

Karten dienen persönlichen Wegen, nächsten Schritten, Gedanken und Rückblicken. Kataloge bleiben überwiegend einfache Textlisten. Das vorhandene Olivenblatt verbindet Marke, Leerzustände und Wege. Die Olivenbaumansicht mit ihrer bestehenden Erklärung selbst dokumentierter Entwicklung bleibt erhalten; das dekorative Baumbild im Startseitenkopf entfällt.

## UX-Änderungen

- Heute unterscheidet vorhandene persönliche Daten vom Erststart. Der aktuelle Weg mit offenem Schritt erscheint vor der allgemeinen Erklärung. Zuletzt gelesene Stelle, letzter Gedanke und bestehende Rückblickangebote folgen. Alle Ziele verwenden vorhandene Routen.
- Das leere Journal bietet „Ersten Gedanken festhalten“ ohne Suchfeld oder Filter. Bei vorhandenen Einträgen bleiben Suche und Filter auch ohne Treffer sichtbar.
- Der Reader ergänzt oberhalb des Bibeltexts eine kompakte Aktion „Gedanken festhalten“. Sie verwendet dieselbe Aktion wie der erhaltene Einstieg am Kapitelende. Keine neue Sticky-Oberfläche.
- Wegübersicht, Schrittfläche und Einstellungen erhalten das gemeinsame visuelle System. Menüänderungen beschränken sich auf Farben und Schriftgewicht.

## Unveränderte Grenzen

Keine Änderungen an Datenmodell, Fragen, Antworten, IDs, Referenzen, Mappings, Speichern, Backup, Menümechanik, Routing, Versauswahl, Markierungen, Wegzuordnung, Quizlogik, Fortschritt, Rückblicklogik oder Offline-/Update-Mechanik. Die neue Build-Kennung wird über das bestehende unveränderte Build-Verfahren verarbeitet.

## Prüfung

`node tests/ui-premium-preservation.mjs` vergleicht geschützte Dateien und App-Logik mit dem MENU1-Commit. `tests/ui-premium.mjs` prüft Zustände, Reader-Aktion, 320/390/768/1440 px und Textvergrößerung und erstellt Screenshots. Die bestehenden Browser- und Menütests sichern die vorhandenen Funktionen.

Echte Safari-/iPhone-, VoiceOver- und Live-Update-Prüfungen bleiben separate QA. Ein lokaler Chromium-Offline-Test ist keine vollständige Live-PWA-Abnahme.
