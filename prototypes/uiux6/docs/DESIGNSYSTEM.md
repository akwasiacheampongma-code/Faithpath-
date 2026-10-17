# Drei Designsprachen, ein geschützter Produktkern

## A · Lebensbaum

**Idee:** Ein persönlicher Begleiter statt eines Funktions-Dashboards. Ein bildhafter Einstieg führt unmittelbar zum eigenen Weg. Der Bogen des Fotomotivs greift Wachstum und Schutz auf, ohne Fortschritt als Belohnung darzustellen.

- Grundflächen `#f5f2e9` / `#fffdf8`, Schrift `#263b2d`, Aktion `#35513a`, ruhige goldbraune Sekundärfarbe `#816132`.
- DejaVu Serif für Überschriften und Bibeltext, Open Sans für Navigation und Werkzeuge. Titel 2,4 rem, Zwischenüberschriften 1,5 rem, Lesetext 1,09 rem bei 1,85 Zeilenhöhe. Auf kleinen Geräten bleibt die Textgröße lesbar; Abstände und Bildhöhe werden kleiner.
- Geschwungenes Bildfenster, eine hervorgehobene Handlung, anschließend flache Lese- und Gedankenzeilen. Die eigene Geschichte darf visuell berühren; der Schreibbereich bleibt sachlich.
- Risiko: Die Fotos können zu sehr wie eine Meditations-App wirken. Das Kreuz wird nicht als dekoratives Markenetikett eingesetzt; die christliche Identität entsteht durch Bibeltext, sprachliche Begleitung und den persönlichen Weg.

## B · Wort & Stille

**Idee:** Ein ruhiger Arbeits- und Leseraum. Was jetzt sinnvoll ist, steht zuerst. Der Baum begleitet seitlich, statt die Handlung nach unten zu verdrängen.

- Atmosphärischer Grundton `#11251e` / `#1a3026`, Schrift `#f3eee0`, Aktion `#d6c393` auf dunkler Fläche. Hell ist ein eigenständiger heller Arbeitsraum, kein invertierter Screenshot.
- Open Sans Semibold für präzise Überschriften, DejaVu Serif für den Bibeltext und persönliche Gedanken. Titel 2,25 rem, Reader 1,13 rem / 1,9. Linien und wenige Flächen statt eines Kartenstapels.
- Handlung vor Bild, kompakte Baumdarstellung im Weg, schmale ruhige Metadaten. Der dunkle Standard ist eine gestalterische Empfehlung, kein Zwang.
- Risiko: Weniger Wärme und sichtbare Geschichte auf den ersten Blick. Für Orientierung Suchende muss die Sprache bewusst zugewandt bleiben.

## C · Lebensseiten

**Idee:** Die persönliche Glaubensgeschichte als lebendige Ausgabe. Typografie, Bildausschnitt und deutliche Trennlinien gliedern den Inhalt; keine bloße Umfärbung von A.

- Helles neutrales Papier `#f6f1e9`, Schrift `#272d32`, Aktion `#384d65`, Fläche `#eee5d8`.
- Open Sans ExtraBold für Überschriften, DejaVu Serif für Lesen und längere persönliche Texte. Titel 2,85 rem, echte Kapitelzahl als typografischer Anker. Keine dekorativen Levelzahlen.
- Asymmetrisches Titelmotiv, kantige Aktionen, typografische Journalzeilen, nebeneinanderstehende historische Momente; auf 320 Pixeln und bei großer Schrift untereinander.
- Risiko: Die starke Typografie kann persönliche Stille übertönen. Keine große Schrift auf Kosten der Schreibfläche. Kein Magazin mit ständig wechselnden Titeln oder künstlich erzeugten persönlichen Deutungen.

## Gemeinsame technische Tokens und Komponenten

`app.css`: semantische Variablen `--bg`, `--surface`, `--ink`, `--muted`, `--accent`, `--on-accent`, `--line`, `--soft`, `--gold`, `--highlight`, `--selected`, `--display`, `--body`, `--radius`, `--gutter`, `--title`. Richtungsattribute und Themeattribute sind unabhängig. Vier vorhandene Themeidentitäten: Hell, Atmosphärisch, Papier, Nacht. Alle 12 Kombinationen werden als reale Ansichten gerendert.

Raster: 4/8-Pixel-Familie, mobile Außenränder 18–26 px, breite Lesefläche maximal 760 px mit innerem Satzspiegel. Aktionen mindestens 44 px hoch, primär 48 px. Vier konstante Hauptziele; Entdecken gehört zum Bibelbereich. Safe-Area-Unterkante, Dialoge mit dynamischer maximaler Bildschirmhöhe, Textumbruch und sichtbarer Tastaturfokus. Texte bleiben echte Texte, nicht in Bilder eingebrannt.

Navigation und Werkzeuge sind eigene einfache Linien-SVGs. Originale sieben Baumassets bleiben unverändert; die Wegeansicht zeigt sie vollständig mit `object-fit:contain`. Der beschnittene Einstieg ist ein bewusstes Titelmotiv und ersetzt keine Baumstufe. Der Stufenwähler ist ausdrücklich **Demonstration**, kein vom Nutzer frei einstellbarer Produktionsfortschritt. Ein erledigter Schritt verändert weder Baumstufe noch bestätigte Entwicklung.

Native Dialoge ermöglichen Escape, Fokusbegrenzung und Fokus-Rückkehr. Bewegungen sind auf kurze Farbwechsel und ein zurückhaltendes Dialogeinblenden begrenzt. Unter `prefers-reduced-motion:reduce` entsteht keine Animation. Keine automatische Wiedergabe oder dekorative Dauerschleife.

## Herkunft und Nutzungsrechte

- Unveränderte **DejaVu Serif**-TTFs, Bitstream-Vera/DejaVu-Lizenz mit vollständigem Hinweis in `assets/licenses/DEJAVU-LICENSE.txt`. Lokale Dateinamen sind Aliasse; keine Veränderung der Fontdaten.
- Unveränderte **Open Sans**-TTFs aus der vorhandenen Systeminstallation, Apache 2.0. Hinweise und vollständige Lizenz liegen in `OPEN-SANS-NOTICE.txt` und `APACHE-2.0.txt`.
- **OTB Deutsch**: exakte lokale Versarrays, CC BY-SA 4.0, vollständiger Quellhinweis mit Attribution in `OTB-LICENSE.txt`. Bibeldaten bleiben separat, damit ihre Herkunft und Lizenz nachvollziehbar bleiben. **Luther 1912**: gemeinfrei, Herkunft in `LUTHER1912-NOTICE.txt`.
- Baumfotografien: die bereits im Repository gelieferten sieben Dateien, bytegleich wiederverwendet. Die kommerzielle Rechtekette dieser Altassets wurde nicht unabhängig nachgewiesen; vor einer kommerziellen Veröffentlichung klären. Es werden keine fremden Stockbilder oder externen Fontdienste ergänzt.
- Neue Icons und Layouts entstehen im Prototypcode. Keine Bild-KI als Ersatz für eine bedienbare Oberfläche.
