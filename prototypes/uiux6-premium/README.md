# FaithPath · Verbunden · Phase 6A.2

**Isolierte Premium-Designstudie. Keine neue Version der eigentlichen App.**

ZIP vollständig entpacken und `index.html` im obersten Paketordner öffnen. Dort führt „Premium-Galerie“ zu dieser Studie. Die unveränderte 6A-Galerie liegt als Geschwisterordner daneben. Keine Installation, Anmeldung oder Internetverbindung erforderlich. Die neuen Ansichten verwenden klassische lokale Skripte statt Fetch/ES-Module.

Alternativ vom Repository aus:

```sh
PORT=4492 node prototypes/uiux6-premium/tests/serve.mjs
```

Dann `http://localhost:4492/` öffnen. Dieser Server liefert SVG und Fonts mit korrekten MIME-Typen und bindet die alte Referenz unter `/uiux6/` ein. Keine Service-Worker-Registrierung. Keine Veröffentlichung.

## Ausprobieren

1. Reader: Vers antippen → Farbe → Notiz → Text schreiben → zurück → Journal → Entwurf weiterführen. Die Bibelreferenz bleibt erhalten.
2. Geschichte: „Der rechte Weinstock“ → Bibeltext → Fragen → falsche/richtige Antwort → später fortsetzen → freiwilliger Gedanke.
3. Weg: Schritt bearbeiten/abschließen → Gedanken öffnen → Originalrückblick → späteren Gedanken ergänzen. Ein erledigter Schritt ändert die Baumstufe nicht.
4. Journal: Eintrag bearbeiten, löschen und rückgängig machen; freiwillige Erinnerung setzen/entfernen.
5. Sicherung: ausschließlich Demo-JSON exportieren → Datei prüfen → Vorschau → zweite ausdrückliche Bestätigung. Keine echten FaithPath-Backups verwenden.

Alle persönlichen Beispieldaten sind synthetisch und leben nur im Arbeitsspeicher des geöffneten Frames. **Neuladen oder eine neue Galerieauswahl setzt sie zurück.** Export ist optional; es werden keine bestehenden App-Schlüssel gelesen oder beschrieben.

## Umfang und ehrliche Grenzen

22 Ansichten, vier Themes, sieben eigene Baumzeichnungen und zwei Schwertvarianten. 70 vollständige Originalkapitel pro Übersetzung einschließlich Psalm 119; alle Referenzen der mitgelieferten Themen und geführten Wege sind lesbar. 696 originale Katalogeinträge; drei Geschichten und ein Kapitelquiz mit zusammen 31 unveränderten Fragen vollständig interaktiv. Weitere Katalogdetails sind ausdrücklich Entwurf. Die bestehenden vollständigen Bibeln, 2.314 Nachlese-Fragen und 1.300 NT-Fragen bleiben im App-Quellbestand unverändert.

Keine echte PWA, keine dauerhaften persönlichen Daten, keine Systembenachrichtigungen. Geladene Ansichten funktionieren offline; ein installierter PWA-Neustart oder Update wird damit nicht nachgewiesen. Echte iPhone-/Safari-/VoiceOver-Abnahme ist OFFEN, ebenso die aus Phasen 1–5.

## Dateien und Nachweise

- `index.html`: interaktive Galerie mit alter Referenz.
- `comparison.html`: echter PNG-Vergleich, keine Renderings als Benutzeroberfläche.
- `report.html`: lesbarer Abschluss mit Links zu Dokumentation und QA.
- `docs/`: Audit, Designsystem, 6B-Plan, Quellen/Rechte, Geräteanleitung.
- `qa/`: maschinenlesbare Ergebnisse, erste Fehlbefunde und abgeschlossene Prüfungen.
- `screenshots/`: tatsächliche Chromium-Aufnahmen mit synthetischen Daten.
- `BUILD.json`: Studien-ID, Codecommit und deterministischer Dateihash.

Tests benötigen die vorhandenen Repository-Entwicklungsabhängigkeiten und Chromium. Reproduktion siehe `docs/QA.md`. Phase 6B bleibt gesondert freigabepflichtig.
