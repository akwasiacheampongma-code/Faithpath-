# FaithPath – UI/UX Phase 1: „Heute“ und Einstieg

Stand: 16.10.2026. **Auftrag und Abnahmekriterien, noch keine implementierte Änderung und keine Freigabe.**

## Ausgangspunkt (verifiziert)

- Basis: `integration/nachlese-editorial-56-20261016` @ `c2aaa481fe11874c2fff649311e4970c380ab092`.
- Implementierungsbranch: `feature/uiux-phase1-today-20261016`.
- Hier bereits enthalten: STABLE1-Korrekturen, finaler NT-Kapitelquizimport, Nachlese-MC mit 2.314 N-IDs und redaktionelle Bearbeitung der 56 Restfälle.
- `src/app.js` enthält die `home()`-Ansicht. Aktuelle Reihenfolge: Überschrift → Olivenbaum → Orientierung/Bibel → persönlicher Weg → Rückblicke → zuletzt gelesen/Gedanke → Entwurf → Erklärung → Schnellaktionen → Wege → Manifest.
- Aktuell wiederholen sich „Deinen Weg ansehen“, „Meinen Weg öffnen“ und weitere Wege-Links. Der Erstbesuch ohne Verlauf wird als „Neu im Glauben“ angesprochen; das verwechselt neue App-Nutzer mit neuen Christen.
- Vier Themes **existieren bereits** in `src/themes.js`: Hell, Atmosphärisch, Papier, Nacht. Keine neue Theme-/Dark-Mode-Implementierung erfinden.
- Im bisherigen lokalen Layouttest ist der persönliche nächste Schritt bei 390×844 bereits im ersten Viewport, bei 320×568 erst nach Scrollen. Diesen Ist-Stand nicht verschlechtern.

## Produktziel

FaithPath ist **kein Punktespiel**. Kernfluss: Situation oder Bibel → verstehen → reflektieren → eigener Weg → kleiner Schritt → Rückblick → selbst dokumentierte Entwicklung.

Die Heute-Seite beantwortet binnen Sekunden:
1. Was kann ich **jetzt** tun?
2. Wie setze ich **meinen begonnenen Weg** fort?
3. Wo lese ich **meine Bibel** weiter?

Dabei bleiben Olivenbaum und warme, ruhige, hochwertige Gestaltung sichtbar, ohne die eigentlichen Aktionen zu verdrängen.

## UX-Entscheidungen

### A: Keine bisherigen persönlichen Einträge (neuer App-Nutzer)

- Zwei gleich verständliche Pfade: „Ich brauche Orientierung“ und „Direkt zur Bibel“.
- Keine Behauptung, dass jeder App-Neuling neu im Glauben sei.
- Olivenbaum darf die Identität sichtbar machen, muss aber die beiden Einstiege nicht überdecken oder verdrängen.
- Eine freundliche, kurze Erklärung des persönlichen Weges genügt. Keine wiederholten Inhaltsblöcke.
- Maximal eine primäre Handlungsaufforderung pro logisch zusammengehörigem Bereich.

### B: Wiederkehrender Nutzer mit aktivem Weg und offenem Schritt

- **Nächsten konkreten Schritt** und Link zum richtigen Weg priorisieren.
- Zuletzt gelesene Bibelstelle und ungespeicherten Entwurf als klare Fortsetzungswege anbieten.
- Rückblick nur anzeigen, wenn ein tatsächlich offener Rückblick besteht.
- Ohne erfundene Erinnerungen oder Bewertungen; ein abgehakter Schritt ist keine geistliche Entwicklung.
- Olivenbaum komplett und sinnvoll sichtbar, nicht abschaffen und nicht als spirituellen Score umdeuten.

### C: Sonderfälle

- Keine aktiven Wege / nur archivierte Wege; aktiver Weg ohne offenen Schritt.
- Nur Bibelleseverlauf; nur Journal; sehr lange Wegtitel; viele Wege.
- Vorhandener ungespeicherter Entwurf: sichtbare, erreichbare Fortsetzung, keine stillschweigende Löschung.
- Rückkehr mit mehreren Erinnerungen: kein erdrückendes Aufgaben-Dashboard.

## Visuelle Vorgaben

- Premium-Anmutung durch konsistente Typografie, Weißraum, ruhige Kontraste, Kartenhierarchie und nachvollziehbare Interaktionen, **nicht** durch neue Animationen oder Dekoration.
- Bestehenden Olivenbaum und die Theme-Varianten beibehalten; Stufengrafiken und Stufenlogik unverändert.
- Ausreichende Touchflächen, erkennbare Links und klare Fokuszustände.
- Keine zusätzliche Navigationsebene, keine neue Gamification, kein Schwert als Belohnung, kein verpflichtender KI-Chat.
- Optional Logik/Markup der Heute-Seite in kleines Modul auslagern, **nur bei nachgewiesener Testabdeckung**; keine Gesamtsanierung von `app.js`.
- Bei ehrlicher Verbesserung vorhandene Texte kürzen und redundante Links zusammenlegen; Datenmodell, Routingziele und Semantik der Aktionen beibehalten.

## Ablauf für Sol / Codex

1. Baseline-Commit und den neuen Branch prüfen. **Kein direktes Arbeiten auf `main` oder Prod.**
2. Ist-Zustand mit echten Browser-Screenshots und DOM-/Layoutmessungen dokumentieren: 320×568, 390×844, 430×932, Hell und Nacht; neuer vs. wiederkehrender Nutzer.
3. Kurze Vorher/Nachher-Entscheidungsmatrix erstellen; nur klar verbessernde Änderungen realisieren.
4. „Heute“ und höchstens die unmittelbar betroffene Navigation in kleinen, testbaren Commits überarbeiten.
5. Keine Inhaltsdaten, N-/FP-IDs, Bibeldateien, Fortschritts-/Speicherschlüssel, Schemata oder Service-Worker-Updateverhalten ändern.
6. Vorher-/Nachher-Screenshots mit echten Zuständen liefern; kein neues UX-PASS aus bloßen CSS-Assertions ableiten.
7. Node-, Browser-, Kapitel-, NT-, Nachlese-, Import-, Entwurfs-, Offline- und Update-Regressionen ausführen. Scheitert ein Gate, Behebung oder expliziter NO-GO.
8. Isoliertes Preview-Build erzeugen; **nicht automatisch veröffentlichen**. Dateihashes, Commit und Testprotokoll dokumentieren.

## Mindestabnahme (blockierend)

- 390×844: bei aktivem Weg mit offenem Schritt ist dessen primäre Fortsetzungsaktion innerhalb des ersten Viewports klar sichtbar, ebenso ein vollständig erkennbarer Olivenbaum. Kein Scroll-Zwang für beide Einstiegswege bei einem neuen Nutzer.
- 320×568: kein horizontaler Overflow, kein abgeschnittener Baum, Navigation/Primäraktion erreichbar; ein sinnvoller Scrollweg ist zulässig, ohne überdeckte Bedienelemente.
- Texte und Buttons funktionieren mit längeren Inhalten und 200 % Textvergrößerung, Zoom, Safe-Area-Simulation und Reduced Motion.
- Alle vier bestehenden Themes bleiben lesbar. Keine Unsichtbarkeit von Fokusring, Optionen, Warnungen oder Links.
- Screenshots und Nutzungsflüsse für Leerzustand, Rückkehrer, Entwurf, offenen Rückblick, nur archivierten Weg.
- Prüfe Fokus- und Tastaturfluss, semantische Überschriften, sinnvolle Screenreader-Benennungen; echtes iPhone/VoiceOver weiterhin eigenständiges Freigabegate.
- Unveränderter persönlicher Datenstand bei Reload, Backup/Restore, Offline und PWA-Update.
- Alle vorhandenen Story-, Kapitelquiz- und Nachlese-Fragen technisch erreichbar und unverändert.
- Kein Commit/Deploy nach `main`/Produktions-Netlify.

## Nachfolgende Arbeit, ausdrücklich NICHT Teil dieses ersten Changes

Bibelreader-Feinschliff, Story→MC→Reflexion-Übergänge, Journal-Filter, Informationsarchitektur des Bereichs „Mehr“, langfristige Architektur und Design-System kommen **erst nach dem abgegrenzten Heute-Review**.

## Abschlusslieferung

Ein überprüfbarer Branch mit Commits, Vorher/Nachher-Bildern, kurzer Änderungsbegründung, Testlogs, Barrierefreiheitsbefunden, verbleibenden Risiken und klarem GO/NO-GO **für isolierte Preview**, nicht für öffentliche Produktion.
