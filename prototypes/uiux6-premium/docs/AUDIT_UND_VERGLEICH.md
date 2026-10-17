# Gestalterischer Audit und Entscheidung · 17.10.2026

## Nachweisbarer Ausgangspunkt

HEAD vor Beginn: `5a72d038a78bd10741a1902cb478b1963a94efe2`, ausschließlich Branch `feature/uiux-phase6-visual-directions-20261017`. Phase 6A baut auf dem integrierten UIUX4+5-Stand auf. Seine drei Galerien A Lebensbaum, B Wort & Stille und C Lebensseiten bleiben bytegleich. Alle 173 alten Screenshot-PNGs (plus vorhandenes QA-Überlaufbild) wurden inventarisiert und über acht Kontaktbögen betrachtet. Designsystem, Vergleich, Code-Review, QA, Integrationshinweise und ausführbarer Code wurden gelesen; Kernansichten und Schreibdialog aller drei Richtungen zusätzlich frisch im Browser aufgenommen.

Die alten Designnoten sind subjektive Einschätzungen, keine gemessene Nutzerakzeptanz. Die vorhandenen QA-Artefakte belegen bestimmte technische Prüfungen ihres damaligen Standes; sie beweisen weder gestalterische Überlegenheit noch eine echte Geräteabnahme.

## Was 6A schon trägt

Die vier Hauptziele sind verständlich. Lokale Inhalte und die Trennung von Olivenbaum und Bibelreise passen zum Produkt. B zeigt, dass ein kontrastreicher, ruhiger Leseraum funktioniert. A gibt dem persönlichen Weg eine warme Identität. C experimentiert mit redaktioneller Hierarchie. Diese Erkenntnisse bleiben wertvoll; ein Frameworkwechsel wäre dafür kein Mehrwert.

## Größte Schwächen

1. Große Einleitungen und ähnlich gewichtete Karten konkurrieren mit dem nächsten persönlichen Schritt. Bei 320 Pixeln kostet jeder vorgelagerte Absatz spürbaren Raum.
2. Reader- und Schreibinteraktionen fühlen sich stärker wie Formular-/Webdialoge an als wie persönliche Lese- und Schreibräume. Eine Versaktion soll den Text ergänzen, nicht die gesamte Seite ersetzen.
3. Das Journal signalisiert primär Verwaltung. Die persönlichen Worte und die Zeit zwischen zwei Einträgen kommen gegenüber der Listenstruktur zu kurz.
4. Baum und Schwert sind mehr erklärt als gestalterisch in den Alltag eingebunden. Fotos mit unklarer Herkunft eignen sich noch nicht als verbindliche Markenbasis.
5. Fünf schöne Übersichten reichen nicht, um Löschen, historische Rückblicke, Archiv oder eine sichere Wiederherstellung beurteilen zu können.

## Hauptentwurf: Verbunden

Die neue Identität ist ein persönlicher Lese- und Schreibbegleiter: ein heller, warm-neutraler Grund, dunkle Waldtinte, präzise kleine Bedienung und eine eigenständige Serifenschrift für Bibel und persönliche Worte. Die Form folgt dem Kernweg **Wort → Gedanke → Schritt → eigener Rückblick**. Editorial bedeutet hier Satzspiegel und Gewichtung; keine magazinartige Menge dekorativer Teaser.

Heute zeigt Baum und unmittelbar danach den aktiven Schritt. Bei 320 × 568 bleibt dessen Aktion auf dem ersten Bildschirm sichtbar. Der Reader verwendet fortlaufenden Text mit zurückhaltenden Versziffern, einer kompakten Versleiste und eigenem Konzentrationsmodus. Der Editor verzichtet auf eine große Hero-Überschrift. Im Journal bildet die Zeitachse das persönliche Gedächtnis; Suche erscheint bei Bedarf. Die Wegdetailseite verbindet echte verknüpfte Gedanken und passende Originalrückblicke statt beliebiger Beispielhistorie.

Entdecken nutzt eine hervorgehobene Geschichte, thematische Einstiege und kompakte begrenzte Suchresultate. Weitere Ergebnisse werden bewusst nachgeladen. Quiz ist eine Folge von Fragen, Erklärung und freiwilliger Reflexion; keine Punktesumme. Die Auswahl bleibt nach Rückkehr innerhalb derselben Sitzung erhalten.

## Übernommen, verworfen, bewusst offen

| Idee | Entscheidung und Begründung |
|---|---|
| A zwingend mit B kombinieren | Verworfen als Vorgabe. Die gemeinsame Richtung ist aus den Produktabläufen entstanden. |
| Drei gleichwertige neue Varianten | Verworfen. Eine konsistente, vertiefte Richtung verbessert mehr Bereiche als drei weitere Startseiten. Alte Varianten bleiben direkt vergleichbar. |
| Warmes Oliv und hochwertige Lesetypografie | Übernommen, aber mit neuen Tokens und tatsächlich lokal gebündelten Schriften. |
| Große Baumfotografie überall | Verworfen. Eigene botanische SVGs halten die Identität, benötigen wenig Platz und haben dokumentierte Herkunft. |
| Riesiges Schwert als Hauptfortschritt | Nicht empfohlen. Das kompakte Buch-Schwert-Siegel zeigt den Lesezusammenhang klarer und lässt Zahlen/Weiterlesen Raum. Die vertikale Alternative bleibt interaktiv vergleichbar. |
| Baumzuwachs durch Aufgaben | Ausgeschlossen. Abschluss und ausdrücklich bestätigte Entwicklung bleiben getrennte Dinge. |
| Dekoration beim Schreiben | Verworfen. Datum, eigene Worte und Kontext genügen. |
| Vollständiges Framework für Galerie | Verworfen. Klassische lokale Skripte sind für diese isolierte Studie einfacher zu öffnen, prüfen und übernehmen. |
| Animation von Baumzuwachs | Zurückgestellt. Erst klären, ob echte Nutzer die sieben Bilder und ihre Bedeutung verstehen; keine Fortschrittsinszenierung erfinden. |

## Kritische Bewertung (subjektive Experteneinschätzung, keine Nutzerstudie)

| Kriterium / 10 | 6A A | 6A B | 6A C | Verbunden | Begründung für den neuen Stand |
|---|---:|---:|---:|---:|---|
| Eigenständigkeit | 6 | 6 | 6 | 8 | Botanische Zeichnung, Satzbild und persönliche Zeitachse ergeben eine erkennbare Sprache. |
| Premium-Wirkung | 6 | 7 | 6 | 8 | Weniger konkurrierende Flächen, eigenständige Typografie, konsistente Details. |
| Bedienung/Orientierung | 7 | 7 | 6 | 8 | Mehrere komplette Abläufe; bekannte vier Hauptziele. |
| Bibellesbarkeit | 7 | 8 | 7 | 8 | Fortlaufender Text und Fokus; Touchselektion und VoiceOver müssen am Gerät noch überzeugen. |
| Baum/Schwert | 6 | 6 | 6 | 7 | Eigene zusammengehörige Vektoren; groß dargestellte frühe Baumstadien wirken bewusst zart und können zu leicht übersehen werden. |
| Persönliche Kontinuität | 6 | 6 | 6 | 8 | Original und späterer Gedanke sind sichtbar verbunden, nicht automatisch bewertet. |
| Technische Übernehmbarkeit | 8 | 8 | 8 | 8 | Kleine Vanilla-Module; Demo-Controller ist kein fertiger Produktionsrouter. |
| Barrierefreiheit/Wartbarkeit | 7 | 7 | 7 | 7 | Breite automatische Prüfungen; echte Screenreader, Kontrastverhalten der Vektoren und große Schrift brauchen menschliche Geräteabnahme. |

Die Zahlen vergleichen den sichtbaren und prüfbaren Umfang, keine kommerzielle Erfolgswahrscheinlichkeit. Der Qualitätssprung ist besonders an Reader, Editor, Journalzeitachse und historischen Wegdetails überprüfbar. Der Entwurf ist noch kein getestetes Markenprodukt mit Nutzerforschung.

## Verbleibende gestalterische Grenzen

Sehr große Schrift erzeugt lange Frageüberschriften und mehr Scrollen; Inhalte werden dafür nicht verkleinert oder abgeschnitten. Die mobile Navigation darf auf zwei Zeilen wachsen und reserviert ihre tatsächliche Höhe. Ein großes Baumdetail braucht bewusst Platz; kleine Frühstadien sind optisch subtil. Die Texte der Übersicht sind ruhig, für manche erfahrene Leser aber möglicherweise noch zu erklärend. Fünf bis acht moderierte Aufgaben mit neuen und erfahrenen Christen sind vor einer endgültigen Integration sinnvoll. Eine dekorative Bildwelt für hunderte Geschichten wurde bewusst nicht erfunden.

## Empfehlung

**Verbunden als gemeinsame Richtung zur menschlichen Designentscheidung vorlegen.** Buch-Schwert-Siegel als Standard, vertikales Schwert als Vergleich; die sieben neuen Baumzeichnungen als nachverfolgbar erzeugte Alternative. Keine automatische Integration. Die nächste Phase soll vorhandene geprüfte Speicher- und Inhaltsfunktionen mit dieser Darstellung verbinden, statt das Demonstrationsmodell in die App zu kopieren.
