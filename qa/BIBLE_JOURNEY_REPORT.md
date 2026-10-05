# FaithPath — Final Experience

Ausgangsbuild: **FP4-20261005-G-CHAPTER1**. Zu Beginn live und gegen `develop/v4` geprüft.
Ausgangs-HEAD: `f02106e9a15877ec8acb92f444bf62fcbc51c36e`.
Neuer Build: **FP4-20261005-G-EXPERIENCE1**.
Branch: `feature/final-experience-v1` (isolierter Worktree vom verifizierten HEAD).
Production bleibt https://zesty-rolypoly-d11fff.netlify.app — dort wurde dieser Kandidat **nicht** veröffentlicht. Kein main-/develop-Merge, kein Release-Tag.

## Tatsächliche Abschlussregel

Nach dem letzten Vers liegt ein nicht-interaktiver 1-px-Sentinel im Reader. Ein IntersectionObserver mit Scroll-/Resize-/Visibility-Abgleich prüft, ob dieser vollständig im sichtbaren Contentbereich zwischen Topbar und Bottom Navigation liegt. Dokument muss sichtbar, Reader-Render-Token aktuell und Element verbunden sein. Offener Dialog, Menü oder aktive Versauswahl blockieren die Erfassung. Bei Desktop-Navigation wird eine seitliche Nav nicht als untere Abdeckung behandelt.

Nur dieses erreichte Kapitelende schreibt genau einmal `kind: "chapter-explored"`, Zeitstempel und normalisierten kanonischen Buchcode/1-basiertes Kapitel in das vorhandene `events`-Array. Der logische Schlüssel ist `book:chapter`, unabhängig von Übersetzung. Observer wird nach Erfassung oder neuem Render sauber entfernt. Fehler beim Speichern zeigen eine echte Fehlermeldung; kein ungespeicherter Abschluss wird bestätigt.

Frühere `reading`-Events, `reading`-Pointer und Quizstände erzeugen **keine** Erkundungsdaten. Rückwirkender Import unsicherer Lesegeschichte findet nicht statt. Ungültige/importierte doppelte Events werden in read-only Selektoren ignoriert/dedupliziert, ohne alte Nutzerdaten still zu löschen.

## Darstellung und Zählung

Bibel → „Deine Bibelreise“ → Buch. Kein neuer Haupttab. Hub zeigt echte eindeutige Kapitel, Bücher mit mindestens einem erkundeten Kapitel und Bücher mit allen kanonischen Kapiteln. 66 Bücher, 1.189 Kapitel aus bestehender Metadatenquelle. Buchansicht zeigt Kapitel, Textzustand/✓ und explizite aria-labels. „Zuletzt geöffnet“ bleibt getrennt von „erkundet“. „Hier weiter“ nutzt den echten Reading-Pointer bzw. im Buch das nächste noch nicht erkundete Kapitel.

Nach dem letzten Vers: ruhige Erkundungsbestätigung → bestehende CHAPTER1-Fragen → bestehende Kapitel-Navigation. Keine Quizpflicht, Punkte, Prozent-Glaubensanzeige oder Streaks. Ein kleines dekoratives Schwert-SVG markiert Schrift/Bibelreise, keine Waffenstufe oder Belohnung.

## Nachweise

| Szenario | Ergebnis |
|---|---|
| Öffnen, vor Ende verlassen | PASS — kein Abschluss |
| Quiz ohne vollständiges Kapitel-Ende | PASS — Quizstatus, kein Lesestatus |
| Ende erreichen / wiederholen / Übersetzung wechseln / Reload | PASS — einmaliges Kapitel |
| „Später“ bei optionalem Quiz | PASS — Erkundung bleibt, keine neue Aufgabe |
| Alle Kapitel eines Ein-Kapitel-Buchs | PASS — vollständig erkundet |
| Offline in allen vier Themes | PASS — gespeichert und nach Reload vorhanden |
| CHAPTER1→EXPERIENCE1 | PASS — keine aus alten Öffnungen erfundenen Kapitel |
| Speicherablehnung | PASS — ursprüngliche Daten bleiben, Bestätigung bleibt verborgen |
| Backup/Import | PASS — optionale Events erhalten, altes Format bleibt |

Umsetzung: `src/bible-journey.js`, `src/experience-view.js`, Reader-Hook in `src/app.js`. CHAPTER1-Unit-/Question-Logik unverändert. Details der Regression im [Regressionsbericht](FINAL_EXPERIENCE_REGRESSION.md).

## Grenzen und nächstes Gate

Die Tests verwenden Desktop-Chromium, emulierte Viewports und 200 % Root-Schrift, keine physischen Mobilgeräte. Safe Areas 47/34 px sind CSS-Simulationen. Echtes iPhone/Safari, VoiceOver, iOS-Tastatur, Dynamic Island und OS-Level-PWA-Neustart sind noch nicht real geprüft. Ein erneuter Browserkontext und Reload prüfen Persistenz, nicht einen echten Betriebssystem-Neustart.

„Erkundet“ belegt das erreichte, unverdeckte Kapitelende. Es belegt weder Aufmerksamkeit noch Verständnis. Historische Kapitelöffnungen werden nicht rückwirkend zu gelesenen Kapiteln erklärt. Lokal gespeicherte Daten bleiben den Grenzen von Browser-/Gerätespeicher unterworfen; ein Theme schafft keine Synchronisation oder zusätzliche Sicherung.

Das alte Atmospheric-Paket/PDF war im verfügbaren Bestand nicht vorhanden. Das Theme verwendet die vorgegebene Wald-/Creme-/Gold-Richtung, keine erfundenen alten Binärassets. Vorhandene Systemfont-Stacks und Originalbilder bleiben bestehen.

Die technische Integration ändert keinen redaktionellen/theologischen Freigabestatus. Bestehende Content-Validation-Warnungen zu alten Ganzkapitel-Sentinels bleiben unverändert; sie sind kein neuer Feature-Regressionsfund.

Empfehlung: bereit für das abschließende reale Device-Gate. Keine weiteren großen Produkt-/Designsysteme; jetzt reale Nutzer beobachten und Wiederaufnahme/Retention validieren.
