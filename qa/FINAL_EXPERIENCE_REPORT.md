# FaithPath — Final Experience

Ausgangsbuild: **FP4-20261005-G-CHAPTER1**. Zu Beginn live und gegen `develop/v4` geprüft.
Ausgangs-HEAD: `f02106e9a15877ec8acb92f444bf62fcbc51c36e`.
Neuer Build: **FP4-20261005-G-EXPERIENCE1**.
Branch: `feature/final-experience-v1` (isolierter Worktree vom verifizierten HEAD).
Production bleibt https://zesty-rolypoly-d11fff.netlify.app — dort wurde dieser Kandidat **nicht** veröffentlicht. Kein main-/develop-Merge, kein Release-Tag.

## Ergebnis

**FINAL_EXPERIENCE_PASS** — lokales Feature-/Regressionsgate und EXPERT_VISUAL_REVIEW bestanden. Dies ist ein Release-Candidate-Kandidat für reale Geräteprüfung, keine behauptete Store-/iOS-Freigabe.

Bibelreise, Weg-Äste und Darstellung haben getrennte Bedeutungen. Kapitelenden verändern keine Baumstufe. Themes verändern nur die Darstellung. Äste öffnen reale persönliche Weg-IDs mit dokumentiertem Inhalt.

## Architektur und Schutz

Vier kleine Module ergänzen den bestehenden Vanilla-JS-Renderer: `bible-journey.js` (Fakten/Observer), `tree-branches.js` (read-only Weg-Auswahl), `themes.js` (Theme-Präferenz/Anwendung), `experience-view.js` (escaped UI). Keine zweite App, Contentquelle, Datenbank oder PWA-Identität.

Store-Schema bleibt v5, Backup-Envelope v4/schemaVersion 5. Neue Kapitelenden nutzen vorhandene `events`, die optionale Präferenz nutzt `settings.theme`. Keine Migration und keine neuen Top-Level-Datenstrukturen. Bestehende Transaktionen, Storage-Konfliktschutz und Import-/Exportlogik bleiben unverändert. Das ist zusätzliche optionale Information im bestehenden Schema, keine Behauptung, dass überhaupt keine neuen Daten gespeichert werden.

Unverändert: Today/Variant B Compact, `treeLevel()`, sieben Baumassets, Menü/Bottom Navigation, Inhalte/IDs/Mappings, Journal-/Bibelnotiz-Löschsemantik, Undo, Continuity-Regeln, Service-Worker-Quelllogik und Manifest. Die generierte Build-Assetliste enthält die vier neuen legitimen JS-Module. `BUILD.txt` nennt nun den tatsächlichen Arbeitsbranch statt eines fest eingebauten `develop/v4`.

## Messbare Abnahme

- 85 Node-Tests: PASS.
- 774 Browser-/Szenario-Gruppen: PASS (keine Gleichsetzung mit 774 einzelnen Assertions).
- Vier Themes × 128 UI-/axe-Gruppen: PASS.
- 704 Theme-Matrix-Screenshots + 104 zusätzliche Branch-/Safe-Area-Screenshots; weitere Feature-, Vorher/Nachher- und Regressionsbilder.
- 4 echte CHAPTER1→EXPERIENCE1-Service-Worker-Upgrades: ursprünglicher persönlicher Store und Entwurf byte-identisch, kein erfundener historischer Lesefortschritt.
- Console / Load / Page Errors: 0 unerwartete Fehler in protokollierten Szenarien. Gezielte Fault-Injection-Szenarien sind gesondert beschrieben.
- Content-Hash unverändert: `812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9`.
- Kandidaten-Runtime-Hash: `10c66473816241391ee75d7f483d4d4290211dceb4e1bf817b4745c5d47a1c65`.
- JavaScript/CSS: +25,323 Bytes unkomprimiert, +7,949 Bytes gzip (pro Datei). Keine neuen Fonts, schweren Bilder oder Netzwerkdienste.

## Behobene Funde im neuen Kandidaten

| ID | Priorität | Fund | Korrektur / Nachweis |
|---|---|---|---|
| FE-01 | P1 | 5 Marker bei 320/200 hatten durch geerbte Zeilenhöhe kollidierende Ziele | Marker line-height 1, Schriftgröße unverändert; 1/3/5/8-Fixtures in allen Themes ≥44 px und getrennt |
| FE-02 | P1 | Theme-Picker bei 390/200 lief horizontal über | Intrinsisches auto-fit-Grid wechselt bei großer Schrift auf eine Spalte; vier Theme-Matrizen PASS |
| FE-03 | P1 | Baum-Chronologie bei 320/200 lief 2 px über | Nur dort Datum/Inhalt untereinander; keine Schriftverkleinerung oder versteckter Overflow |
| FE-04 | P1 | Gleiche ID in Journal/Reflections konnte im neuen Branch-Selector einen falschen Review-Bezug herstellen | Namensräume getrennt; RED→GREEN-Test prüft Kollision und explizite Spiegelreferenz |
| FE-05 | P2 | Intrinsische Bildhöhe für jungen Baum leicht ungenau | Metadaten auf tatsächliche 784×1168 korrigiert; Originalasset unverändert |

Ein anfänglicher Focus-Test benutzte Pointer-Modus; korrigiert auf tatsächliche Tastaturbedienung vor Focus-Visible-Prüfung. Zwei alte Testprogramme brauchten den installierten `/usr/bin/chromium` sowie freie lokale Ports; ihre Assertions wurden nicht abgeschwächt. Der generische SW-Test wurde als lokale QA-Kopie ausschließlich für Importpfad/Port angepasst. Kein daraus abgeleiteter Produktfix.

Offene neue P0/P1/P2-Regressionsfunde: **0**.

## Visuelle Bewertung — EXPERT_VISUAL_REVIEW

Subjektive Expertensichtung ausgewählter Original-Screenshots und Contact Sheets, zusätzlich zu Geometrie/axe. Keine automatisierte Messung als Beweis für gefühlte Qualität.

| Aspekt | Ergebnis | Begründung |
|---|---|---|
| Persönliche Kontinuität | BETTER | Factual reading history und eigene Wege sind wieder auffindbar |
| Markenwirkung | BETTER | Wald/Papier/Nacht behalten Typografie, Wordmark, Originalbaum und dieselben Komponenten |
| Lesbarkeit | SAME | Bestehende Reader-Hierarchie erhalten; dunkle markierte Verse bewusst mit dunkler Schrift auf ursprünglichen Highlightfarben |
| Kognitive Belastung | SAME | Ruhiger Bibel-Link, kompakte Fakten, maximal fünf nummerierte Marker und zugehörige Liste |
| Light / Heute | SAME | Pixelidentischer CHAPTER1-Vergleich auf 390/100, 320/100, 320/200 |
| Accessibility | SAME | axe, Keyboard, sichtbarer Fokus, 200 %, Touch- und Safe-Area-Simulation bestanden |

## Dateien und Artefakte

- `scripts/build.mjs`
- `src/app.js`
- `src/version.js`
- `src/bible-journey.js`
- `src/tree-branches.js`
- `src/themes.js`
- `src/experience-view.js`
- `styles.css`
- `tests/final-experience.test.mjs`
- `tests/final-experience-fixture.mjs`
- `tests/final-experience-browser.mjs`
- `tests/final-experience-visual.mjs`
- `tests/final-experience-extra-visual.mjs`
- `tests/final-experience-light-comparison.mjs`
- `tests/final-experience-update.mjs`
- `docs/superpowers/specs/2026-10-05-final-experience-design.md`
- `docs/superpowers/plans/2026-10-05-final-experience.md`
- `qa/FINAL_EXPERIENCE_REPORT.md`
- `qa/BIBLE_JOURNEY_REPORT.md`
- `qa/TREE_BRANCHES_REPORT.md`
- `qa/THEME_SYSTEM_REPORT.md`
- `qa/FINAL_EXPERIENCE_REGRESSION.md`

Generierte `dist`, abgeleitete Content-Reports und `qa-output` sind Build-/QA-Artefakte, kein Restore alter Quellen und keine mitgelieferten Nutzer-Fixtures. Der Commit enthält gezielt nur Source, Tests, Plan und diese Berichte.

Screenshots: `qa-output/final-experience/visual/{light,atmospheric,paper,night}/`, `extra-visual/`, `features/`, `light-comparison/`. Maschineller Gate-Nachweis: `final-gate.json`; vollständige alte/neue Runtime- und Content-Hashes: `integrity-proof.json`. Downloadpakete/Galerie liegen in `qa-output/final-experience/downloads/`.

Details: [Bibelreise](BIBLE_JOURNEY_REPORT.md), [Weg-Äste](TREE_BRANCHES_REPORT.md), [Themes](THEME_SYSTEM_REPORT.md), [Regression](FINAL_EXPERIENCE_REGRESSION.md).

Rollback-/Vergleichspunkt ist der unveränderte CHAPTER1-HEAD `f02106e9a15877ec8acb92f444bf62fcbc51c36e`. Da Production nicht verändert wurde, ist dort kein Rollback erforderlich.

## Grenzen und nächstes Gate

Die Tests verwenden Desktop-Chromium, emulierte Viewports und 200 % Root-Schrift, keine physischen Mobilgeräte. Safe Areas 47/34 px sind CSS-Simulationen. Echtes iPhone/Safari, VoiceOver, iOS-Tastatur, Dynamic Island und OS-Level-PWA-Neustart sind noch nicht real geprüft. Ein erneuter Browserkontext und Reload prüfen Persistenz, nicht einen echten Betriebssystem-Neustart.

„Erkundet“ belegt das erreichte, unverdeckte Kapitelende. Es belegt weder Aufmerksamkeit noch Verständnis. Historische Kapitelöffnungen werden nicht rückwirkend zu gelesenen Kapiteln erklärt. Lokal gespeicherte Daten bleiben den Grenzen von Browser-/Gerätespeicher unterworfen; ein Theme schafft keine Synchronisation oder zusätzliche Sicherung.

Das alte Atmospheric-Paket/PDF war im verfügbaren Bestand nicht vorhanden. Das Theme verwendet die vorgegebene Wald-/Creme-/Gold-Richtung, keine erfundenen alten Binärassets. Vorhandene Systemfont-Stacks und Originalbilder bleiben bestehen.

Die technische Integration ändert keinen redaktionellen/theologischen Freigabestatus. Bestehende Content-Validation-Warnungen zu alten Ganzkapitel-Sentinels bleiben unverändert; sie sind kein neuer Feature-Regressionsfund.

Empfehlung: bereit für das abschließende reale Device-Gate. Keine weiteren großen Produkt-/Designsysteme; jetzt reale Nutzer beobachten und Wiederaufnahme/Retention validieren.

## Non-Production-Preview

https://6ac41a7098537c221d1426f5--zesty-rolypoly-d11fff.netlify.app

Draft-Deploy `6ac41a7098537c221d1426f5`: 667 Dateien per SHA1 gegen das vollständige Upload-Artefakt verifiziert, Runtime-Hash bleibt identisch zum getesteten Kandidaten. Production-Deploy `6ac3759f57df52580fb0b4e1` ist vor/nach Upload unverändert. Kein Restore-/Production-Endpunkt aufgerufen.

Der neue Preview-Hostname ist nicht in der Netzwerkfreigabe dieser Arbeitsumgebung. HTTP-Tunnelversuch wird mit 403 abgewiesen; auch der Web-Reader konnte ihn hier nicht öffnen. Deshalb keine Behauptung eines bestandenen Preview-Live-Browser-Tests. Der API-Status ist ready und das Artefakt vollständig; reales Device-/Preview-Live-Gate folgt. Die öffentlich hochgeladenen QA-Dateien sind der lokale Gate-Snapshot vor diesem Deployment-Metadaten-Nachtrag.

Screenshotpakete sind in zwei Teile je Theme aufgeteilt (jeweils unter 7 MiB); das Übersichts-ZIP ist unter 6 MiB. Ein erster großer ZIP-Upload wurde infrastrukturseitig abgewiesen; der vollständige kleinere Draft ist verifiziert.
