# FaithPath — Final Experience

Ausgangsbuild: **FP4-20261005-G-CHAPTER1**. Zu Beginn live und gegen `develop/v4` geprüft.
Ausgangs-HEAD: `f02106e9a15877ec8acb92f444bf62fcbc51c36e`.
Neuer Build: **FP4-20261005-G-EXPERIENCE1**.
Branch: `feature/final-experience-v1` (isolierter Worktree vom verifizierten HEAD).
Production bleibt https://zesty-rolypoly-d11fff.netlify.app — dort wurde dieser Kandidat **nicht** veröffentlicht. Kein main-/develop-Merge, kein Release-Tag.

## Bedeutung und Datenquelle

Ein Ast verweist auf genau eine existierende persönliche `path.id`. Sichtbar werden nur Wege mit nichtleerem eigenem Schritt, Meilenstein, Rückblick oder eindeutig verknüpftem Journal-/Reflexionstext. Verknüpfungen über bestehende `pathIds`, `links.journalId`/`reflectionId`, `sourceKey` und explizite Spiegelreferenzen; keine Themen-/Textähnlichkeit. Spiegel von Journal und Reflection zählen einmal. Kollisionen gleicher IDs in unterschiedlichen Collections erzeugen keine falschen Beziehungen.

Weg öffnen, Titel/Kategorie, Lesereignis, Quiz oder geführten Weg starten allein erzeugen keinen bedeutsamen Ast. Keine neue Branch-Datenbank und keine spirituelle Kennzahl. Bestehendes `treeLevel()` und alle sieben Originalbilder sind byte-identisch zum Ausgangs-HEAD.

## Exakte Auswahlregel

1. Nicht archivierte vor archivierten dokumentierten Wegen.
2. Neuester vorhandener Dokumentationszeitpunkt absteigend (updatedAt/date/completedAt/createdAt gemäß vorhandenem Datensatz).
3. Startdatum absteigend.
4. Kanonische Weg-ID lexikalisch als stabiler Tie-Break.

Fehlender/ungültiger Zeitstempel erzeugt keinen erfundenen Zeitpunkt. Die Auswahl ist read-only. Samen/Keimling 0 direkte Marker; Junger Baum 1; Wachsender Baum 3; Starker Baum/Erste Früchte/Fruchttragender Baum maximal 5. Verbleibende dokumentierte Wege unter „Weitere Wege“; gewöhnliche Wegnavigation behält auch undokumentierte Wege.

## SVG und Bedienung

Originalbilder wurden vor Geometrieplanung visuell betrachtet. Der junge Baum ist schmal; deshalb genau ein sicherer zentraler Slot. Spätere Bilder tragen breitere Kronen. Normalisierte, feste Slot-Koordinaten (Prozent der vollständigen Bildfläche):

| Bildstufe | Slots |
|---|---|
| Junger Baum | (50,55) |
| Wachsender Baum | (30,46), (67,39), (70,58) |
| Starker Baum und spätere | (29,33), (68,32), (22,49), (75,47), (48,23) |

Dekorative SVG-Kurven verbinden Stammzone (50,68) mit diesen Slots. HTML-Anker liegen darüber; feste nummerierte Marker statt kollidierender Titel. Jeder Anker hat echte Route, kanonische ID, Name „Weg [Titel], öffnen“, ≥44×44 px und sichtbaren Tastaturfokus. Die passende benannte Liste unter dem Bild ist vollständig bedienbar. Kein neues gerastertes Baumasset, keine Zufallsgeometrie.

Bei dokumentiertem Rückblick ist die Verbindung geringfügig kräftiger; Listenstatus benennt tatsächlich festgehaltenen Rückblick/Meilenstein. Keine automatisch erzeugten Früchte oder Behauptung über Verbesserung. Im geöffneten Weg stehen tatsächliche Gedanken-/Schritt-/Rückblickzahlen neben der vorhandenen Chronologie.

## Abnahme

Deterministische QA-Fixtures (nicht in User-/Content-Build ausgeliefert): 1 dokumentierter Weg auf Stufe 3, 3 auf Stufe 4, 5 auf Stufe 5, 8 mit maximal 5 Markern + 3 weiteren Wegen. Alle vier Themes bei 390/100 und 320/200: PASS. Eindeutige Pfadnavigation per Tastatur, kein Marker-Overlap, keine horizontale Überbreite, Originalbaum ohne CSS-Cropping, Safe-Area-Simulation: PASS.

Zähl-/Auswahllogik: `src/tree-branches.js`; Rendering: `src/experience-view.js`. Geometrie bleibt ein begrenzter visueller Überblick. Viele/lange Wege gehören in die Liste; nicht sämtliche Titel werden auf die Krone geschrieben.

## Grenzen und nächstes Gate

Die Tests verwenden Desktop-Chromium, emulierte Viewports und 200 % Root-Schrift, keine physischen Mobilgeräte. Safe Areas 47/34 px sind CSS-Simulationen. Echtes iPhone/Safari, VoiceOver, iOS-Tastatur, Dynamic Island und OS-Level-PWA-Neustart sind noch nicht real geprüft. Ein erneuter Browserkontext und Reload prüfen Persistenz, nicht einen echten Betriebssystem-Neustart.

„Erkundet“ belegt das erreichte, unverdeckte Kapitelende. Es belegt weder Aufmerksamkeit noch Verständnis. Historische Kapitelöffnungen werden nicht rückwirkend zu gelesenen Kapiteln erklärt. Lokal gespeicherte Daten bleiben den Grenzen von Browser-/Gerätespeicher unterworfen; ein Theme schafft keine Synchronisation oder zusätzliche Sicherung.

Das alte Atmospheric-Paket/PDF war im verfügbaren Bestand nicht vorhanden. Das Theme verwendet die vorgegebene Wald-/Creme-/Gold-Richtung, keine erfundenen alten Binärassets. Vorhandene Systemfont-Stacks und Originalbilder bleiben bestehen.

Die technische Integration ändert keinen redaktionellen/theologischen Freigabestatus. Bestehende Content-Validation-Warnungen zu alten Ganzkapitel-Sentinels bleiben unverändert; sie sind kein neuer Feature-Regressionsfund.

Empfehlung: bereit für das abschließende reale Device-Gate. Keine weiteren großen Produkt-/Designsysteme; jetzt reale Nutzer beobachten und Wiederaufnahme/Retention validieren.
