# UIUX2 – Architektur und Pflege

## Grenzen der Änderung

Kein Frameworkwechsel, keine neue Laufzeitabhängigkeit, kein neues Speichersystem. UIUX1-Heute-Module, globales `styles.css`, alle Bibel-/Fragen-/Geschichtendaten, IDs/Zuordnungen, Migrationen, Importvalidierung, Journaltransaktionen, Entwurfsschutz, Olivenbaum und Service-Worker-Template bleiben bytegleich zur Basis `3afa15f`.

## Module und Zuständigkeiten

| Modul | Aufgabe | Darf nicht |
|---|---|---|
| `src/reader-view.js` | Reine HTML-Projektion des optionalen Kapitelquizangebots und der Kapitel-Navigation. | Katalog ändern, Fortschritt schreiben, selbst Kapitelnummern umrechnen. |
| `src/story-flow-view.js` | Aktive Frage samt Alias/Position/Vorgänger/Nachfolger aus bestehendem Runtime-Modell ableiten; Optionen, Erklärung und freiwillige Schlussreflexion rendern. | Zweiten Katalog führen, Antworten persistent als Abschluss speichern, Originalfragen verändern. |
| `src/journey-view.js` | Globaler Schwert-Hub, vorhandene Buch-/Kapitelübersicht, Erkundungshinweis und Erklärung. | Erkundungsereignisse erzeugen, zählen oder nachträglich interpretieren. |
| `src/journey-sword.js` | Vorhandene SVG-Geometrie, Quadratwurzel-Einblendung und rein visuelle Griffdetails. | Spirituelle Stärke ableiten oder Fortschritt speichern. |
| `src/reader-stories.css` | Auf betroffene Seiten begrenzte Darstellung; bestehende Theme-Tokens. | Heute/Nav/Olivenbaum global überschreiben, feste Höhen für persönliche Texte verwenden. |
| `src/view-html.js` | Text/Attribute an der HTML-Grenze maskieren. | Ungeprüftes HTML als vertrauenswürdig markieren. |
| `src/app.js` | Bestehender Adapter: Router, Katalogzugriff, bestehende Actions, bestehende Speicher-/Editorfunktionen. | View-Module zu einer zweiten State-Quelle machen. |

`experience-view.js` exportiert die bisherigen Journey-Funktionen aus dem neuen Modul weiter. Dadurch bleiben vorhandene Importstellen und Tests kompatibel. Der komplette Baum-Renderingteil ist bytegleich erhalten.

## Datenfluss

1. `loadRuntimeModel()` prüft und lädt unveränderte statische Inhalte.
2. Reader und Kapitelquiz erhalten die bestehende kanonische Zuordnung aus `chapter-questions.js`. Nur NT-Kapitel mit vorhandener Einheit erhalten das Angebot. Kapitelwechsel bewahrt `origin` und Übersetzung.
3. Geschichten verarbeiten ausschließlich `flow.stories` / `flow_items`. Alias-IDs bleiben erreichbar, primäre Folge-IDs unverändert. Antworten bleiben im bestehenden flüchtigen UI-State. Ein Reload ist kein versprochener dauerhafter Geschichtenquizabschluss.
4. „Gedanken festhalten“ verwendet unverändert `reflect-story` / `reflect-reader` → bestehenden Editor → bestehende Journal-/Reflexions-/Entwurfstransaktion. Keine zweite Speicherlogik.
5. Bei einem bereits beim Öffnen vollständig sichtbaren kurzen Kapitel fordert `initiallyVisibleChapterEnd()` eine ausdrückliche Bestätigung. Dadurch zählt Psalm 117 nicht mehr allein durch Öffnen. `acknowledgeReaderChapter()` verwendet für automatische und bestätigte Erkundungen denselben bestehenden Schreibpfad; bei Speicherfehlern bleibt die Bestätigung verfügbar. Historische Ereignisse und die Zählfunktion bleiben unverändert.
6. `observeChapterEnd()` und `recordExploredChapter()` bleiben die einzige Autorität der Bibelreise. Erst der sichtbare Kapitel-Endmarker führt zum bestehenden Ereignis; Öffnungs- und Quizereignisse zählen nicht. Dieselbe Buch/Kapitel-Kombination wird auch bei Übersetzungswechsel nicht doppelt gezählt. Es wird keine tatsächliche Lesedauer, Aufmerksamkeit oder geistliche Reife gemessen.
7. `journeySummary()` projiziert historische Ereignisse. Das SVG behält `sqrt(erkundete Kapitel / Gesamtkapitel)` und dieselbe Geometrie. Ein exakter Textzähler macht geringe Fortschritte unabhängig von der Füllfarbe erkennbar.
8. Das genaue Epheser-Zitat wird weiterhin aus der lokalen Luther-1912-Bibel geladen. Beide lokalen Versfassungen sind in Tests festgehalten; kein neuer Bibeltextbestand.

## Darstellung und Zugänglichkeit

Der Bibeltext nutzt eine ruhige Serifen-Typografie, zurückhaltende Versnummern und bestehende Auswahl-/Markierungszustände. Vier Themes beziehen Farben weiterhin aus den vorhandenen Tokens. Das NT-Angebot steht hinter dem Text und bleibt optional. Richtige/falsche Antworten werden zusätzlich durch Text markiert; Feedback erhält den Tastaturfokus. Der explizite Link `merged-story/ID?reflection=1` fokussiert die bereits bestehende Reflexion statt den Anfang der Fragenliste. Lange Texte bleiben scrollbar.

Ein Schwert zeigt die gesamte Reise. Auf kleinen Displays steht die genaue Kapitelzahl darüber; die SVG wird proportional verkleinert. Bei vergrößerter Schrift dürfen Inhalte scrollen. Buchseiten behalten die vorhandene Kapitelübersicht ohne zusätzliche Schwerter. Detaillierte geistliche Erklärung im vorhandenen Dialog statt bei jedem Kapitelabschluss.

## Reproduzieren und prüfen

Node ≥20, Python 3 und die bisherigen Redaktionsvalidatoren verwenden. `npm ci --ignore-scripts`; `npm test`; `FAITHPATH_OUT=qa-output/uiux-phase2/build-a npm run build`. Keine neuen Pakete installieren. Der Branchname ist Bestandteil von `BUILD.txt`; für einen Build aus einem Git-Archiv muss `FAITHPATH_BUILD_BRANCH=feature/uiux-phase2-reader-stories-20261016` gesetzt sein.

Die Tests `reader-phase2.test.mjs`, `story-phase2.test.mjs`, `sword-phase2.test.mjs` sind in `npm test` enthalten. `phase2-browser.mjs` prüft Reader/Geschichten/Schwert in allen Themes und beiden Kernbreiten; `PHASE=A` oder `B` grenzt historische Abschnittsprüfungen ein. `phase2-stress.mjs` ergänzt 200%-Text, synthetische Safe Areas und ein verkürztes Editorfenster. `phase2-capture.mjs` und `phase2-reflection-capture.mjs` erzeugen echte Screenshots mit gemeinsamen synthetischen Fixtures. Keine echten Nutzerdaten einsetzen.

`phase2-update.mjs` benötigt den exakten UIUX1-Build mit geprüftem Build-Hash im Ordner `qa-output/uiux-phase2/previous-build` (oder `FAITHPATH_PREVIOUS_ROOT`). Auf derselben lokalen Test-Origin wird UIUX1 durch UIUX2 ersetzt, der Nutzer aktiviert das wartende Update, danach werden Offline-Funktionen und Datenidentität geprüft. Keine Übertragung auf Netlify.

## Bewusst verbleibende Grenzen

`app.js` bleibt groß; diese Phase extrahiert nur unmittelbar betroffene, rein darstellende Zuständigkeiten. Eine spätere schrittweise Modulpflege sollte mit unveränderten Schnittstellen und denselben Regressionstests erfolgen. Ein Rewrite ist nicht begründet. Automatisierte Chromium-Tests belegen kein reales iOS-, Safari-, PWA-, VoiceOver- oder Bildschirmtastaturverhalten. Das separate Geräte-Gate ist verbindlich.
