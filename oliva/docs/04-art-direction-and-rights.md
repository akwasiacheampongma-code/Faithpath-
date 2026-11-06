# Bildwelt, Pilotprüfung und Inhaltsrechte

## Eigenständige Art Direction · oliva-cinema-v1

Atmosphärische Landschaften und ruhig erzählte Szenen. Natürliches Morgen-/Abendlicht, zurückhaltende Farbigkeit aus Oliv, Salbei, Sand, Creme und warmem Gold. Filmische räumliche Tiefe mit feiner malerischer Textur. Figuren nicht als vermeintlich exakte historische Porträts präsentieren. Keine modernen Objekte, keine Fantasy-Runen, kein visuelles Überwältigen.

Ruhiger gemeinsamer Eindruck ist wichtiger als maximale Detailmenge. Wichtige Motive liegen innerhalb einer sicheren mittleren Zone. Die App rendert Karten- und Heroausschnitte mit `cover`; Quellenlabel und Lesbarkeit werden als Teil des Screens geprüft. Die gespeicherten WebP-Varianten behalten das Originalseitenverhältnis, statt abgeschnittene historische Details als eigene Szene auszugeben.

## Tatsächlich generiertes Pilotset

| ID | Szene / Zuordnung | Tatsächliche Assets | Prüfung |
|---|---|---|---|
| galilee | Freie Landschaftseinstimmung: Olivenbaum, Ufer, Weg und Boot im Morgenlicht | Original 1536 × 1024 PNG; 1280er und 640er WebP | Visuell angesehen; ruhige Bildwirkung und keine offensichtlichen modernen Gegenstände. Keine archäologische Ortsbehauptung. |
| storm | Boot nach dem gestillten Sturm, Markus 4,35–41 | Original 1536 × 1024 PNG; 1280er und 640er WebP | Visuell angesehen; Boot, zurückhaltende Kleidung, ruhiger Moment. Personenanzahl, Bauweise und Landschaft sind Interpretation, nicht verbindlicher Bibelbefund. |
| garden | Garten / erstes Licht, freie Anregung zu Genesis 1 | Original 1536 × 1024 PNG; 1280er und 640er WebP | Visuell angesehen; keine moderne Architektur. Botanische Zusammenstellung und Ort sind frei gestaltet. Genesis 1 und der Garten in Genesis 2 bleiben textlich zu unterscheiden. |

Originaldateien liegen unverändert unter `art/masters/`, Laufzeitvarianten unter `assets/images/`. Die von der Bildgenerierung angelegten Originale unter `/workspace/generated_images/` wurden nicht gelöscht. WebP-Encoding ist technische Größenoptimierung; es wurden keine Figuren ausgetauscht oder Szenen nachträglich zusammengesetzt.

`art/manifest.json` enthält Buch, Kapitel, Szene, Generator, Tagesdatum, Prompt-Version, Style-Version, Master-/Variantenpfade, SHA-256, Dateigrößen sowie getrennte Lizenz-/Prüfzustände. „Visuell geprüft“ ist keine öffentliche historische, theologische oder rechtliche Freigabe.

## Prompt-Spezifikationen

Die drei Bildaufträge verwendeten jeweils folgende gemeinsame Vorgaben: originelle Premium-Editorial-Illustration, keine Schrift/Logos/UI, weite 3:2-Komposition, natürliche Lichtquelle, dezente klassische Maltextur, historische Zurückhaltung, keine modernen Gegenstände, mobile Crop-Zone, explizit künstlerische Interpretation. Prompt-Versionen bezeichnen den in dieser Sitzung ausgeführten Erstauftrag je Motiv, keine später erfundene Iterationsgeschichte.

- `oliva-cinema-v1-galilee-01`: Olivenbaum im linken Vordergrund, Kalksteinweg zum ruhigen See, geschichtete Hügel, kleines historisch angeregtes Fischerboot in der Ferne, Sonnenaufgang rechts, keine nahen Personen.
- `oliva-cinema-v1-storm-01`: Moment nach dem Sturm, kleines galiläisches Holzboot, zurückgenommene Figuren in einfacher antiker Kleidung, eine ruhige stehende Person am Heck, kein Heiligenschein, keine übernatürlichen Spezialeffekte, keine dramatische Kampfästhetik.
- `oliva-cinema-v1-garden-01`: Licht über einer grünen Flusslandschaft mit Vegetation, kleinen Gazellen und fernen Vögeln, keine Menschen, keine moderne Architektur, kein spekulativ behaupteter Eden-Ort.

Vor einer Figurenserie sind ein separates Figurenblatt und fachliche Beratung erforderlich. Das Pilotset belegt keine über zwölf Szenen hinweg getestete Figurenkontinuität.

## Skalierungsplan nach Qualitätsgate

| Weitere Szene | Bibelgrundlage | Vor der Generierung prüfen |
|---|---|---|
| Noah und Arche | Genesis 6–9 | Flutdarstellung sensibel; Bauform/Umgebung als Interpretation |
| Abraham und Verheißung | Genesis 12 / 15 | Kleidung, Landschaft, sichtbare Sterne als Erzählmotiv |
| Mose und Auszug | Exodus 12–14 | Datierungs-/Ausrüstungsunsicherheit; keine moderne Ägypten-Klischeekopie |
| David und Goliath | 1. Samuel 17 | Keine Gewaltverherrlichung; Begegnung statt blutiger Moment |
| Psalmen | z. B. Psalm 23 | Poetik als solche kennzeichnen, keine behauptete historische Szene |
| Propheten | z. B. Jesaja 40 | Poetische Vision nicht als dokumentiertes Ereignis darstellen |
| Geburt Jesu | Lukas 2 / Matthäus 1–2 | Unterschiedliche Berichte nicht stillschweigend zu einer Momentaufnahme vermischen |
| Gleichnisse Jesu | z. B. Lukas 15 | Erzählerische Bildwelt vom Leben Jesu unterscheiden |
| Kreuzigung und Auferstehung | Passion/Osterberichte | Respektvolle, altersangemessene Bildwahl; unterschiedliche Berichte beachten |
| Paulus und Reisen | Apostelgeschichte / Briefe | Orte und Reiseabschnitte quellengetreu zuordnen |
| Offenbarung | z. B. Offenbarung 21–22 | Apokalyptische Symbolik erklären, keine Zukunftsfotografie behaupten |

Nicht alle Szenen sind bereits generiert. Das angeforderte Gate „erst Pilotset prüfen, dann skalieren“ wird eingehalten: fachliche/historische Freigabe vor einer großen Kapitelproduktion. Eine Implementierungsagent-Prüfung ersetzt keine unabhängige Fachredaktion.

## Rechteinventar

- **Bibel:** [eBible.org · Luther 1912 Copyright](https://ebible.org/deu1912/copyright.htm) und [Downloadübersicht](https://ebible.org/details.php?id=deu1912) weisen die Ausgabe als Public Domain aus. Original-USFM-ZIP ist enthalten; Dateihashes im Importbericht. Wörter bleiben unverändert, technische Wort-/Strong-Metadaten werden entfernt. Keine Übernahme der modernen Luther 2017 oder anderer geschützter Übersetzungen.
- **Neue Erklärungstexte / Gebete:** für dieses Projekt mit KI-Unterstützung erstellt; deutlich getrennt vom Bibelwort. Keine unabhängige theologische Freigabe behauptet. Zentrale Nachweise stehen unmittelbar in den Referenzen der Wege.
- **Bildgenerierung:** drei eigene Aufträge mit dem verfügbaren OpenAI-Bildwerkzeug. Providerbedingungen und beabsichtigte Veröffentlichung sind vor öffentlichem Vertrieb zu prüfen; keine pauschale Rechtegarantie für beliebige Länder und Nutzungsarten.
- **Fonts:** DM Sans und Cormorant Garamond aus dem offiziellen [Google-Fonts-Repository](https://github.com/google/fonts). Jeweilige SIL-OFL-Datei liegt bei. Keine Netzwerk-Fontabfrage zur Laufzeit.
- **Icons / Baum / Schwerter:** neuer Vektorcode dieses Projekts. Keine fremden Icons oder FaithPath-Grafiken kopiert.
- **Original-FaithPath:** keine deklarierte Repository-Lizenz vorgefunden. Deshalb nur Funktionsanalyse, keine Quellcode-, Bild- oder Quizübernahme.
- **Audio:** keine Audiodateien enthalten, kein Audio-Button vorgetäuscht. Sprecher-, Aufnahme- und Übersetzungsrechte müssen vor Implementierung geklärt werden.

Die lokale Entwicklung kann mit dieser dokumentierten Grundlage geprüft werden. Eine internationale kommerzielle Veröffentlichung braucht eine abschließende Rechte- und Inhaltsprüfung für die konkret geplante Distribution.
