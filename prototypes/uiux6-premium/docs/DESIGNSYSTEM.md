# Designsystem · Verbunden

## Prinzipien

Eigene Worte vor Dekoration. Bibeltext vor Werkzeugen. Ein nächster Schritt vor Dashboardfülle. Persönliche Entwicklung wird vom Menschen benannt, nicht von einer Aufgabenanzahl errechnet. Vier dauerhafte Ziele: Heute, Bibel, Mein Weg und Journal; Entdecken gehört zum Bibelbereich und bleibt von Heute erreichbar.

## Semantische Farben

`tokens.css` ist die verbindliche ausführbare Definition. Komponenten verwenden Rollen statt fest eingebauter Farbnamen.

| Rolle | Hell | Atmosphärisch | Papier | Nacht |
|---|---|---|---|---|
| `--canvas` | #f7f7f2 | #142c27 | #f3eddf | #141b23 |
| `--surface` | #fffefa | #1b352f | #fbf5e9 | #1d2731 |
| `--ink` | #20382f | #f0f0e4 | #3d3b2e | #e9edf0 |
| `--muted` | #56635a | #b9c9bd | #645e4f | #b7c1cb |
| `--accent` | #355e49 | #b9d0ab | #596342 | #bfd3d7 |
| `--on-accent` | #fffefa | #142c23 | #fff9ed | #172630 |
| `--danger` | #914c3c | #f2b8a1 | #954b37 | #f0b4a2 |
| `--focus` | #28694b | #d4e8aa | #4b623b | #d0e9ee |

Weitere Rollen: `--faint`, `--line`, `--warm`, `--warm-ink`, Auswahl und vier Markierungsfarben. Feedback enthält Wörter und Symbole, nicht allein Farbe. Axe prüft tatsächlich sichtbare Farbkombinationen einschließlich ausgewähltem Vers, Quizantwort und Restore-Dialog. Nicht jede mögliche Überlagerung ist damit zertifiziert. Original-SVGs werden in dunklen Themes aufgehellt; ihre feinen Linien sind zusätzlich am Gerät zu prüfen.

## Schrift und Satz

**Newsreader** Variable (aufrecht/kursiv): Bibel, Überschriften, persönliche Worte. **DM Sans** Variable: Bedienelemente, Metadaten und erklärende Texte. Beide lokal als unveränderte TTF-Dateien, SIL Open Font License 1.1 mitgeliefert. Keine Google-Fonts-Anfrage zur Laufzeit. System-/Georgia-Fallback bei blockierten Fonts.

Grundschrift 1rem, Zeilenhöhe 1,55; Lesetext standardmäßig 1,25rem/1,78, Desktop etwas größer. H1 typischerweise 2,5rem, H2 1,75rem, Metadaten 0,64–0,8rem. Kleine Metadaten sind eine bewusste visuelle Abwägung und dürfen vergrößert werden. Sehr große Texte umbrechen; zentrale Labels behalten ganze Wörter. Die globale 200-%-Prüfung verändert die Root-Schrift von 16 auf 32px und damit tatsächlich die Textgrößen.

Lesebreite maximal 650px; keine überlange Desktopzeile. Versziffern zurückgesetzt, Wortlaut unverändert. Ein Vers ist eine inline zugängliche Auswahlfläche, keine separate Karte. Die Aktionen erscheinen am unteren Rand oberhalb der Hauptnavigation; Auswahl kann beendet werden. Eine feste Navigation nutzt gemessene tatsächliche Höhe für den Inhaltsabstand. Im Editor bleiben Aktionen kompakt, der persönliche Text erhält die Fläche.

## Raster, Größen, Flächen

Abstände aus 4/8/12/16/24/32/40px; mobile Außenkante 24px, unter 350px 18px; Desktop40px. Radien 8/16/24px. Eine dezente Schattenrolle wird nur für wenige handlungsführende Flächen eingesetzt. Metadaten und Zeitachsen stehen direkt auf der Seite. Responsive Stufen bei350,700 und1050px; ab1050px wird die Hauptnavigation zur linken Leiste. Keine zusätzliche Hauptfunktion.

Stand-alone-Aktionen meist44–48px hoch. Einzelne kontextuelle Inline-Verknüpfungen und Verse sind kleiner; die Studie behauptet dafür keine allgemeine 44px-Abdeckung. Reale Touch- und Screenreader-Tests bleiben Voraussetzung.

## Wiederverwendbare Komponenten

| Baustein | Verantwortung |
|---|---|
| `PremiumUI` | Escaping, eigenes SVG-Iconset, standardisierte Aktionen, Referenzchips, Datum, Typografie und Leerzustände |
| `reader-book`, `verse-dock` | Satzspiegel und transienter Verskontext, getrennt von historischem Lesefortschritt |
| `writing-room` | Titel freiwillig, Text zentral, Referenz/Wegkontext und Draftnavigation |
| `journal-entry`, `timeline-item` | Eigene Worte chronologisch, Metadaten nachgeordnet |
| `step-row`, `path-card` | Nächster Schritt und einfacher Status ohne Baumautomatik |
| `review-pair` | Unveränderter damaliger Snapshot und ausdrücklich geschriebener späterer Text |
| `answer`, `answer-explanation` | Vier Originaloptionen; Auswahl, richtige/falsche Rückmeldung und Erklärung |
| natives `dialog` | Fokus, Escape, Hintergrund inert; destruktive Aktion ausdrücklich bestätigen |
| `backup-preview` | Validierung, verständliche Bestandszahlen, zweite bestätigte Datenkopie |
| `status` | Textuelle Rückmeldung im Dokumentfluss, kein überdeckender Toast |

Eigene Icons haben konsistente22px-Konturen. Icon-only-Aktionen erhalten echte Accessible Names. Keine Fremd-Iconbibliothek, keine neue Laufzeitabhängigkeit.

## Interaktion und Zugänglichkeit

Fokus sichtbar (3px), Skip-Link zum Hauptinhalt, logisch beschriftete Felder, aktuelle Navigation, `aria-pressed` für Auswahl, Live-Regionen für Suchresultate/Status. Native Dialoge nutzen Escape und Rückkehr zum Auslöser. Tastatur kann Verse mit Enter/Space auswählen. Keine Information allein durch Hover. Die Galerie verwendet reale Frames, keine klickbaren Screenshotattrappen.

Subtile Übergänge betreffen Fokus/Farbe, nicht vermeintlichen geistlichen Zuwachs. `prefers-reduced-motion: reduce` entfernt Bewegungen und Smooth Scrolling. Keine Partikel, Belohnungsanimationen oder Streaks. Safe-Area-Abstände verwenden `env(safe-area-inset-*)`; deren tatsächliches Verhalten im installierten iPhone-Fenster ist noch nicht geprüft.

## Rechte und Änderbarkeit

Alle zehn neuen Illustrationen sind direkt erstellte SVG-Geometrie, siehe ARTWORK.md. Die alten Fotografien werden nicht in der neuen Oberfläche verwendet. Die alte Galerie bleibt nur zur unveränderten Referenz im Paket. Für eine öffentliche kommerzielle Verwendung dieser Altbilder muss deren ursprüngliche Rechtekette weiterhin geklärt werden. Neu gebündelte Fonts: Originaldateien von Google Fonts, SIL-OFL-Texte und SHA-Nachweis in `qa/asset-provenance.json`. Dies dokumentiert Herkunft und Lizenzbedingungen, keine pauschale juristische Freigabe.
