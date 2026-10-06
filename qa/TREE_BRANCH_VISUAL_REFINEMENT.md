# FaithPath — Tree Branch Visual Refinement

Status: **TREE_BRANCH_VISUAL_PASS**. Empfehlung: **READY FOR REAL DEVICE TEST**.

Datum: 2026-10-06. Ausgang: `feature/final-experience-v1`, Commit `54cf86fa1924afce68ad008cc149463d343a0a04`, Build `FP4-20261005-G-EXPERIENCE1`.
Arbeitsbranch: `feature/tree-branch-visual-refinement`. Neuer Build: `FP4-20261006-G-BRANCH2`.
Production und main wurden nicht verändert. Ein Non-Production-Draft wird separat dokumentiert; sein Deployment ändert den Production-Zeiger nicht.

## Problem und begrenzte Korrektur

EXPERIENCE1 setzte sämtliche Kurven an derselben Stelle (50, 68) an. Die großen, hellen Zahlenkreise und unabhängig vom Bild verlaufenden Verbindungen wirkten wie ein Diagramm auf einem Foto. Datenverhalten und Bedienung waren korrekt.

Jetzt hat jede der fünf unterstützten Baumstufen eigene feste Astansätze. Die Bézierkurven folgen den sichtbaren Holzverzweigungen in den unveränderten Originalfotos. Eine schmale, zum Kronenende auslaufende SVG-Holzfläche liegt auf einem zurückhaltenden Unterstrich. Die Breite wird ausschließlich geometrisch abgeleitet; sie ist kein Nutzerscore. Das Bildseitenverhältnis wird berücksichtigt. Keine Zufallsgeometrie, keine neue Grafik, keine zusätzliche Bibliothek, keine Animation.

Kleine runde Endmarker wurden mit einer Blattvariante verglichen. Die runde Variante blieb klarer und ruhiger, besonders bei 200 % Text. Sichtbare Größe: ungefähr 24 px bei normalem Text bzw. 36 px bei 200 %. Der transparente, eigenständig fokussierbare Link bleibt **44 × 44 px**. Die Nummer entspricht weiterhin dem benannten Weg in der unveränderten Liste. Keine direkten langen Beschriftungen auf dem Bild.

Ein bereits dokumentierter Rückblick bleibt durch die dezente stärkere Markerbegrenzung erkennbar. Keine neue Zustandslogik, keine zusätzlichen Blätter oder Früchte. Früchte der Originalbilder bleiben unverändert.

## Bildprüfung und feste Anker

Alle fünf Originalbilder wurden vor der Geometrieentscheidung einzeln visuell gelesen: `trees/tree-stage-3.webp` bis `tree-stage-7.webp`. Keimling/Samen erhalten weiterhin keine interaktiven Äste. Kapazitäten bleiben 1 / 3 / 5 / 5 / 5.

Koordinaten in Prozent des vollständigen Bildes, x von links, y von oben. Der Ansatz folgt dem Stamm bzw. einem bestehenden Holzast; „Biegung“ bezeichnet einen Punkt innerhalb der ersten Bézierkurve an ihrer Weiterführung zur Krone. Die Markermitte sitzt am Kronenende. Vollständige Kurven stehen in `src/experience-view.js`; CSS-Endpositionen werden im Browser auf Übereinstimmung unter 1 px geprüft.

| Baumstufe | Slot | Stamm-/Astansatz | Biegung/Weiterführung | Kronenende | Markermitte |
|---|---:|---|---|---|---|
| Junger Baum | 1 | 49.9, 64.5 | 53.1, 60.1 | 59.5, 54.5 | 59.5, 54.5 |
| Wachsender Baum | 1 | 47, 64 | 42.6, 59.9 | 31, 45 | 31, 45 |
| Wachsender Baum | 2 | 49, 53 | 53.0, 45.6 | 65, 30 | 65, 30 |
| Wachsender Baum | 3 | 51, 60 | 58.8, 55.8 | 80, 47 | 80, 47 |
| Starker Baum | 1 | 44, 57 | 38.9, 51.2 | 35, 34 | 35, 34 |
| Starker Baum | 2 | 50, 52 | 59.6, 46.5 | 76, 35 | 76, 35 |
| Starker Baum | 3 | 43, 59 | 33.8, 55.8 | 18, 51 | 18, 51 |
| Starker Baum | 4 | 54, 58 | 62.1, 53.8 | 85, 47 | 85, 47 |
| Starker Baum | 5 | 48, 50 | 51.0, 42.0 | 57, 23 | 57, 23 |
| Erste Früchte | 1 | 44, 60 | 39.2, 53.9 | 30, 38 | 30, 38 |
| Erste Früchte | 2 | 49, 55 | 56.6, 46.9 | 76, 32 | 76, 32 |
| Erste Früchte | 3 | 40, 59 | 31.6, 56.2 | 16, 51 | 16, 51 |
| Erste Früchte | 4 | 55, 57 | 64.5, 53.2 | 89, 49 | 89, 49 |
| Erste Früchte | 5 | 48, 50 | 51.0, 39.2 | 55, 22 | 55, 22 |
| Fruchttragender Baum | 1 | 42, 58 | 36.8, 51.4 | 29, 35 | 29, 35 |
| Fruchttragender Baum | 2 | 51, 50 | 60.0, 41.0 | 80, 27 | 80, 27 |
| Fruchttragender Baum | 3 | 38, 59 | 29.2, 55.8 | 14, 51 | 14, 51 |
| Fruchttragender Baum | 4 | 56, 56 | 66.0, 52.0 | 91, 50 | 91, 50 |
| Fruchttragender Baum | 5 | 47, 48 | 49.6, 36.6 | 55, 15 | 55, 15 |

Die Kurve wird als schmale Holzfläche aus 16 Abtastungen je Béziersegment abgeleitet und zum Ende hin verjüngt. Zwei SVG-Lagen, abgerundeter Unterstrich, keine leuchtende Kontur. Alle SVG-Flächen sind `aria-hidden` und `pointer-events: none`.

## Auswahl, Daten und geschützte Bereiche

`src/tree-branches.js` ist bytegleich zu EXPERIENCE1. Dieselben persönlich dokumentierten Wege, canonical path IDs, Reihenfolge, Archivbehandlung, Caps und „Weitere Wege“. Keine neue Speicherung der Geometrie.

**Datenmodell: NEIN. Schemaänderung: NEIN. Migration: NEIN. Backupformat: unverändert. Content: unverändert.**

187 geschützte Dateien sind bytegleich zum Ausgangscommit. Dazu gehören Daten, Originalbilder, Baumlogik, Bible Journey, Kapitelabschluss/-quiz, Story Merge, Journal/Notizen/Löschen/Undo, Wegverwaltung, Continuity, Navigation, Theme-Logik, Backup und SW-Vorlage. Weitere Funktionen in `experience-view.js` und sämtliche CSS außerhalb der Astvisualisierung wurden zusätzlich auf identischen Quelltext geprüft.

Content-Hash unverändert: `812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9`.
Bestand: 1.560 FP-Fragen, 260 FP-Storyfragen, 2.314 Nachlese-Fragen, 436 gemeinsame Stories, 2.574 Source IDs, 2.479 Flow Items, 0 unmapped; separat 1.300 Chapter-Fragen, 260 Units, 5 je Unit, 27 NT-Bücher. Bestehender redaktioneller Prüfstatus bleibt unverändert.

Runtime-Zuwachs für JS/CSS: 3998 Bytes unkomprimiert. Keine zusätzlichen Laufzeitbilder, Requests, Abhängigkeiten oder Datenfelder.

## Accessibility und Themes

Hell/Papier verwenden gedämpfte Holz-/Olivtöne, Atmosphärisch/Nacht ruhiges warmes Gold/Oliv. Nur lokale `--branch-*` Variablen innerhalb `.interactive-tree`; keine Änderungen des restlichen Themes.

Alle 56 Branch-Zustände: axe WCAG A/AA ohne Verstöße; ≥44 px Zielgröße; keine überlappenden Ziele; korrekter zugänglicher Name „Weg [Titel], öffnen“; sichtbarer Tastaturfokus; Enter öffnet die exakte canonical Route; eindeutige Nummer-/Listen-Zuordnung; Nutzerdaten nach Öffnen unverändert. Alle vier Themes, Reduced Motion, 320 px / 200 % Text bestanden. Keine horizontale Überbreite, keine abgeschnittenen Markerziffern. Originale Safe-Area-/Bottom-Nav-Regeln unverändert und bestehende Safe-Area-Simulationen bestanden.

## Visuelle Prüfung — EXPERT_VISUAL_REVIEW

Die Bildprüfung ist eine subjektive Expertenbewertung und kein automatischer Beweis für UX.

| Kriterium | Bewertung |
|---|---|
| Zugehörigkeit der Äste zum Baum | BETTER |
| Ruhe und Zurückhaltung der Marker | BETTER |
| Organische Weiterführung der vorhandenen Krone | BETTER |
| Erkennbarkeit der Nummer-/Wegzuordnung | SAME |
| Bedienbarkeit / Barrierefreiheit | SAME |
| Datenverhalten / Wegauswahl | SAME |

Manuell angesehen: 12 vollständige Kontaktbögen (4 Themes × 390/100 %, 320/200 %, 768/100 %), mit 1/3/5/8 dokumentierten Wegen; zusätzlich beide Fruchtstufen je Theme bei 390. Außerdem Originalaufnahmen von Fokus, 320/200, junger Baum und Fruchtbaum sowie die vier verlangten A/B-Vergleiche. Ergebnis: Astverläufe wirken in die vorhandenen Holzverzweigungen integriert; keine gemeinsame Diagramm-Fächerform, keine überlagerten Titel, kein Skill-Tree-Stil. Die Zahlen bleiben erkennbare Navigation und verdrängen die Krone nicht.

Screenshots:
- Vorher: `qa-output/tree-branch-visual-refinement/before/` (112 PNGs).
- Nachher: `qa-output/tree-branch-visual-refinement/after/` (168 PNGs: Seite, Baum-Ausschnitt, Fokus).
- A/B: `qa-output/tree-branch-visual-refinement/comparison/` (4 Seitenpaare und 4 Baum-Ausschnittpaare).
- Sichtprüfung: `qa-output/tree-branch-visual-refinement/review/` (12 Kontaktbögen).

Pflichtvergleiche: `light-390-100-3`, `atmospheric-390-100-3`, `light-390-100-5`, `light-320-200-5`. Jeweils identische Daten, Baumstufe, Viewport und Scroll-Ausgangspunkt. Für isolierte Baum-Ausschnitte wurde die fixierte Bottom Navigation nur während der Aufnahme verborgen; die unveränderten vollständigen Seitenscreenshots dokumentieren das tatsächliche Layout.

## Tests und Nachweise

- Node: **87/87 PASS**, Content-Validierung und Build PASS.
- 14 bestehende Browser-Regressionssuites: **173 Szenariogruppen PASS** (Core, Continuity, Notizen, Journal, UI, Safe Area, Menü, Edge, axe, Premium-System, Icon, QA-Downloads/-Links, Product Baseline).
- Branch-Visual/-Interaction-Matrix: **56/56 PASS**, einschließlich aller fünf Astbilder, Endpunktabgleich, Datenunveränderlichkeit und 8-Wege-Fallback.
- Final Experience: **18/18 PASS**, einschließlich Journey-Fakten, Theme-Persistenz, Backup/Import und Offline in allen vier Themes.
- Chapter Questions: **17/17 PASS**, einschließlich Counts, Status-Sync, Origin und Offline.
- Tatsächliches SW-Update **EXPERIENCE1 → BRANCH2: 4/4 PASS**. Pro Theme alter Build vorbereitet, neuer Build angeboten/aktiviert; persönlicher Store und Entwurf byteidentisch, bestehende Journal-/Notizrollen/Highlights/Wege/Schritte/Rückblicke/Quizstände/Bibelreise/Thema erhalten. Offline-Reload und neue Kapitelaufnahme anschließend korrekt.
- Heute Light: **3/3 pixelgleich** (390/100 %, 320/100 %, 320/200 %).
- Gesamt: **271 Browser-Szenariogruppen PASS**. Console / Load / Page Errors: **0 / 0 / 0**.
- Scope-/Hash-Nachweis: `qa-output/tree-branch-visual-refinement/protected-scope.json`.
- Gesamtnachweis: `qa-output/tree-branch-visual-refinement/final-gate.json`.

Die 173 allgemeinen Regressionen liefen gegen den fertigen visuellen Kandidaten vor der Build-ID-Finalisierung; die 98 folgenden Branch-/Feature-/Chapter-/Update-/Pixelgruppen liefen gegen BRANCH2. Runtime-Quellen des visuellen Kandidaten und BRANCH2 unterscheiden sich nur durch die anschließend vergebene Build-ID; keine weitere funktionale oder visuelle Änderung.

## Genau geänderte Dateien

- `src/experience-view.js`: stufenspezifische Astgeometrie, schmale Holzflächen, kleinere Marker innerhalb vorhandener Links.
- `styles.css`: ausschließlich scoped Ast-/Markerfarben, Linien, Marker und feste Endpositionen.
- `src/version.js`: neue Build-ID nach bestandener visueller Abnahme.
- `tests/tree-branch-visual-browser.mjs`: reproduzierbare Matrix, Screenshots, Accessibility und exakte Navigation.
- `tests/tree-branch-visual.test.mjs`: unveränderte Caps/Zuordnung, sichere IDs/Titel, keine Datenmutation.
- `tests/tree-branch-visual-update.mjs`: tatsächliches EXPERIENCE1-Upgrade, Daten-/Entwurfserhalt und Offline in vier Themes.
- `qa/TREE_BRANCH_VISUAL_REFINEMENT.md`: dieser Bericht.

## Grenzen und Freigabeempfehlung

Keine offenen P0/P1/P2-Regressionsfunde im untersuchten Scope. Die SVG-Äste bleiben eine symbolische, feste Überlagerung unveränderter Fotos; sie simulieren kein individuelles botanisches Wachstum. Bei 200 % werden Zahlen erwartungsgemäß größer; die transparente Touchfläche und Wegliste bleiben bedienbar.

Prüfung mit Chromium/Linux. Echtes iPhone, Safari, VoiceOver und echte iOS-Tastatur wurden nicht geprüft. Safe Areas wurden simuliert. Ein möglicher Non-Production-Preview-Host ist aus dieser Umgebung nicht für Browser-Live-QA freigeschaltet; deshalb keine solche Live-PASS-Behauptung. Der Draft kann stattdessen über die Netlify-Dateihashes verifiziert werden. Production bleibt unangetastet.

Empfehlung: **READY FOR REAL DEVICE TEST**. Keine weitere allgemeine Produkt-/Designänderung; auf realen Geräten Ast-Touchflächen, Nummer-/Listen-Verständnis und Fotoeinbindung beurteilen.
