# Vorbereitung: ursprünglichen Fließtext in OLIVA übernehmen

Stand: 08.11.2026. **Bestands- und Machbarkeitsprüfung, noch keine Implementierung.**
Dieses Dokument ändert weder die App noch den laufenden 0.10-Kandidaten. Es
ordnet der Übernahme keine Versionsnummer und keinen Termin zu. Die
Fließtextparität des ursprünglichen Master-Prompts bleibt offen. Eine
Vorbereitung oder eine bestandene Regression des bisherigen Readers ist kein
Nachweis für einen neuen Fließtextreader.

## Tatsächlicher FaithPath-Bestand

Gelesen wurde ausschließlich der unveränderte Snapshot
[`a519ce898fa33907b07d5ac7a585595127556183`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/a519ce898fa33907b07d5ac7a585595127556183)
des Quellbranches `feature/simplified-step-experience-20261104`. Die folgenden
Aussagen belegen vorhandenen Code; eine neue Ausführung oder Geräteprüfung
der Original-App wurde für diese Vorbereitung nicht durchgeführt.

| Vorhandene Funktion | Konkreter Quellbeleg |
| --- | --- |
| Je bis zu fünf Verse bilden einen zusammenhängenden Absatz; zwischen den Versen steht ein Leerzeichen. Versnummern, Texte und Kontext kommen vom bestehenden Reader. Die Fünfergruppen sind Darstellung, keine behauptete literarische Gliederung der Übersetzung. | [`src/verbunden/reader-flow.js:3`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/verbunden/reader-flow.js#L3) |
| Verse stehen inline statt als einzelne Karten oder Zeilenblöcke; kleine hochgestellte Nummern, mehrzeilige Markierung, sichtbarer Tastaturfokus, Auswahlzustand und Fokusabschnitt sind vorgesehen. | [`src/verbunden/reader.css:97`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/verbunden/reader.css#L97) |
| Jeder Vers ist ein fokussierbarer `span` mit Buttonrolle, vollständigem Verslabel und `aria-pressed`. Enter/Leertaste lösen die Auswahl aus. | [`src/app.js:289`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/app.js#L289), [`interaction.js:36`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/verbunden/interaction.js#L36) |
| Die Auswahl kann mehrere Verse enthalten. Aktionen verlangen zusammenhängende Verse; die Aktionsleiste bietet Markieren, Notiz, Verbindung mit einem persönlichen Weg, Kopieren und Auswahl aufheben. | [`src/app.js:567`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/app.js#L567), [`src/app.js:1334`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/app.js#L1334) |
| Persönlicher Kontext zu einer markierten Stelle kann außerhalb des eigentlichen Versspans als `aside` erscheinen; die Absatzhülle ist deshalb ein `div`, kein ungültig mit Blockelementen verschachteltes `p`. | [`src/app.js:321`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/app.js#L321), Kommentar in `reader-flow.js:1` |
| Ein Aa-Menü bietet kleinere/größere Schrift und Lesefokus. Der Faktor wird vorübergehend zwischen 0,9 und 1,6 geändert. Fokus blendet weitere Bedienelemente aus, bietet einen sichtbaren Ausstieg und stellt den Tastaturfokus zurück; Escape beendet ihn. Diese zusätzliche Darstellungslogik schreibt keine persönlichen Daten. | [`reader-flow.js:14`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/verbunden/reader-flow.js#L14), [`interaction.js:1`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/verbunden/interaction.js#L1), `reader.css:236` und abschließende Regeln ab `:463` |
| Buch-, Kapitel- und Übersetzungswahl bleiben Teil des Readers. Auch bei `from`/`to` wird das ganze Kapitel gerendert; der Bezug wird hervorgehoben und ist über „Zum Abschnitt“ erreichbar. | [`src/app.js:458`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/app.js#L458), [`src/app.js:505`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/app.js#L505) |

Der Originalreader enthält außerdem Kapitelendenerkennung und eine gesonderte
Bestätigung für schon anfangs sichtbare kurze Kapitel. Ein Darstellungswechsel
darf dort nicht als Lesen gelten (`src/app.js:527`). **OLIVAs bewusst
ausdrückliche Lesebestätigung bleibt bei der Übernahme maßgeblich**; ein
Layoutobserver aus FaithPath wird nicht als neue Fortschrittsquelle übernommen.

## Aktueller OLIVA-Stand und abzugrenzende Lücken

Der [OLIVA-Reader](../app/lesen/%5Bbook%5D.tsx) rendert bei `verses.map` weiterhin
für jeden Vers einen eigenen `View` mit `Pressable` und `T`. „Einfach lesen“
und „Tiefer verstehen“ verändern die Zusatzinformationen, nicht diesen
Blockaufbau. `Shell reader` blendet bereits die allgemeine Navigation und
Kopfzeile aus; ein zusätzlicher Aa-Lesefokus nach Originalverhalten ist noch
nicht als eigene Funktion vorhanden.

Vorhandene Verträge dürfen nicht verloren gehen:

- Gültige Buch-/Kapitel-/Abschnittslinks und ausdrücklich übergebene Verslinks,
  Zurück-Verhalten, vorheriges/nächstes Kapitel und der Wegbezug.
- Auswahl genau eines Verses mit Merken, Oliv-/Goldmarkierung, Entfernen der
  Markierung, Verbindung mit einem Vorhaben, versgebundenem Notizentwurf und
  Zugriff auf bereits gespeicherte Gedanken. Alle fünf bestehenden/importierten
  Farbwerte werden über [highlights.ts](../src/features/bible/highlights.ts)
  dargestellt; der Reader bietet aktuell zwei direkte Farbaktionen.
- Schriftpräferenz 18–30 und Zeilenfaktor 1,4–2,2 im Datenmodell; die Oberfläche
  bietet 1,5/1,8/2,1. Der aktuelle Bibeltext rendert `fontSize + 3` in Cormorant.
  Diese Umrechnung darf bei einem Rendererwechsel nicht unbemerkt verändert
  werden. Systemschriftvergrößerung muss zusätzlich funktionieren.
- [Kanonische Leseposition](../src/features/bible/position.ts) aus Referenz,
  Versnummer und Modus; keine gespeicherten Pixelkoordinaten. Der bestehende
  [Positionshook](../src/features/bible/useReaderPosition.ts) misst einzelne
  Versblöcke, schützt einen Wiederherstellungsanker während Reflow und speichert
  verzögert. Abschnitt und vollständiges Kapitel besitzen getrennte Scopes.
- Getrennte Einordnung/Bilder im Tiefenmodus und ausdrückliche Bestätigung
  eines Kapitels, Abschnitts oder Wegschritts. Scrollen, Auswählen, Schrift- und
  Layoutänderungen sind keine neue Lese- oder Wachstumserfahrung.

OLIVA zeigt bei `from`/`to` gegenwärtig nur `getPassage(ref)` und bietet „Das
ganze Kapitel lesen“ separat an. Der David-Pilot prüft beispielsweise exakt
1. Samuel 17,38–45 und schließt Verse 37/46 aus. Ein bloßer Darstellungswechsel
darf diese Abgrenzung weder verdeckt erweitern noch einen Teilabschnitt als
ganzes Kapitel bestätigen.

**Zusätzliche Originalparität bleibt sichtbar:** Mehrversauswahl und eigene
Kopieraktion fehlen derzeit. Das vorhandene `CaptureSource`-Schema für
Versnotizentwürfe verlangt ausdrücklich `from === to`
([capture-schema.ts](../src/features/personal/capture-schema.ts)). Ein neuer
Fließtext allein übernimmt deshalb noch nicht sämtliche ursprünglichen
Auswahl-/Notizfunktionen.

## Vorgesehene technische Umsetzung zur Prüfung

Dies ist ein konkreter Implementierungsvorschlag mit überprüfbaren Gates,
kein bereits gelieferter Renderer.

### Gemeinsamer Absatz- und Auswahlvertrag

Eine kleine reine Funktion in einem eigenen `features/bible/flow`-Modul soll
die bestehenden kanonischen Verse unverändert zu Gruppen von bis zu fünf Versen
ordnen. Gruppen und Versschlüssel werden aus Referenz/Scope und echten
Versnummern erzeugt, niemals aus Listenpositionen allein. Die Ausgabe enthält
zusätzlich die exakten Zeichenbereiche des dargestellten Texts einschließlich
der bewusst eingefügten Nummern und Zwischenräume. Sie dient beiden Renderern
als gemeinsame Quelle; keine zweite Bibelkopie und keine Textänderung zum
Erreichen eines gewünschten Umbruchs.

Die Fünfergruppen sind zunächst nur eine nachvollziehbare Übertragung des
Originals. Echte literarische Absatzdaten sind im aktuellen flachen
Versrepository nicht vorhanden und dürfen nicht behauptet werden. Für
Teilabschnitte werden ausschließlich die vorhandenen Abschnittsverse gruppiert,
solange keine ausdrücklich dokumentierte Änderung des Abschnittsvertrags
umgesetzt ist.

Versaktionen werden aus der großen Readerseite in eine gemeinsame Komponente
mit unveränderten Referenzen, vorhandenen Storeaktionen und den bestehenden
Entwurfsstempeln gelöst. Die Aktionsfläche steht als Geschwisterelement nach
dem betroffenen Absatz oder als zugängliches Panel; `Card`, Eingabefeld und
andere `View`-Komponenten werden nicht in einen nativen Textbaum geschachtelt.
Der Bibeltext bleibt vor und nach dem Öffnen der Werkzeuge vollständig lesbar.

### Zwei Darstellungen mit einer Fachlogik

| Plattform | Prüfansatz | Noch zu beweisen |
| --- | --- | --- |
| Web | Eigener `.web.tsx`-Renderer mit echten Absatz-/Inlineelementen. Jeder Vers bleibt einzeln adressierbar; Zustände für Auswahl, Markierung und Merkzeichen sind getrennt. Kontext/Notizeditor steht außerhalb des Absatzs. | Umbruch über Versgrenzen, Tastatur Enter/Leertaste, sichtbarer Fokus, Auswahl ohne störenden Kartenumbruch, korrekte mehrzeilige Markierung und DOM-Textreihenfolge. |
| Android/iOS | `.native.tsx`-Renderer: ein äußerer `Text` pro Absatz, innere `Text`-Spans pro Vers mit dessen `onPress`, Stil und Referenz. RN 0.88 enthält dafür VirtualText/Pressability; daraus folgt noch keine bestandene Geräteabnahme. | Tatsächliche Trefferzuordnung, Systemtextauswahl versus Tap, innere Textzugänglichkeit und präzise Versmessung auf beiden Plattformen. Verschachtelte Textspans sind keine normalen messbaren `View`-Blöcke. |

Kein HTML-WebView wird als vermeintlich plattformgerechte Abkürzung eingeführt.
Neue Abhängigkeiten sind für die Absatzdarstellung zunächst nicht nötig. Eine
eigene native Kopieraktion bräuchte eine gesondert geprüfte Clipboardanbindung;
die Betriebssystemtextauswahl und ein expliziter App-Button sind nicht dieselbe
bereits vorhandene Funktion.

### Versgenaue Position und Reflow sind das technische Hauptgate

Die heutige Funktion `verseAtOffset` wählt den letzten Versblock oberhalb des
Offsets. Bei Inlineversen können mehrere Verse dieselbe Anfangszeile besitzen;
diese Regel würde fälschlich den letzten Vers dieser Zeile bevorzugen.
Außerdem kann ein einzelner Inlinevers mehrere Zeilen und Rechtecke umfassen.
Die alten Blockkoordinaten dürfen deshalb nicht unverändert weiterverwendet
oder durch geschätzte Zeichenbreiten ersetzt werden.

Geplant ist eine schmale plattformspezifische Messschnittstelle, die reale
Textfragmente einer kanonischen Versnummer zuordnet:

- **Web:** nach abgeschlossenem Font-/Layoutwechsel tatsächliche
  `getClientRects()` der Versspans oder zugehöriger Ranges relativ zum
  Scrollviewport messen; mehrere Fragmente erhalten und in visueller
  Zeilenreihenfolge auflösen. Ein nur umfassendes Bounding-Rectangle beweist
  keine korrekte Zuordnung gemeinsam belegter Zeilen.
- **Nativ:** am äußeren Text `onTextLayout` und die beim Rendern erzeugten
  Zeichenbereiche in einem kleinen Prototyp gegen die tatsächlichen
  Plattformereignisse prüfen. Zeilentexte, Zwischenräume, Umbrüche, Ligaturen,
  Umlaute und Systemskalierung dürfen nicht stillschweigend vorausgesetzt
  werden. Falls daraus keine exakten Versfragmente gewonnen werden können,
  muss vor einer plattformweiten Freigabe eine belastbare alternative Messung
  gewählt werden. „Absatzanfang“ darf nicht als versgenaue Fortsetzung verkauft
  werden; für die betroffene Plattform bleibt dann der bestehende geprüfte
  Reader erhalten.

Die Wahl des beim Scrollen gespeicherten Verses muss für eine von mehreren
Versen belegte Zeile deterministisch sein und darf ohne tatsächlichen
Leseversatz nicht zum letzten Inlinevers derselben Zeile springen. Ein
ausdrücklicher Verslink bleibt bis zu einer bewussten neuen Scrollbewegung
maßgeblich, auch wenn sein Zeilenanfang mit einem früheren Vers zusammenfällt.
Gespeichert wird weiterhin die kanonische Versnummer, kein Fragmentindex.

Jede neue Messung benötigt einen Scope-/Layout-Generationstempel. Nach
Kapitelwechsel, Schließen des Notizeditors, Breitenänderung, Fontladung,
Systemschriftänderung oder Lesefokuswechsel darf keine verspätete Messung
einen neueren Anker überschreiben. Während eines bewussten Reflows wird der
letzte Vers eingefroren, mit neuen echten Koordinaten ohne Animation
wiederhergestellt und erst anschließend wieder für Nutzerscroll freigegeben.
Scrollcontainer und Absatzbreite bleiben Teil von OLIVAs vorhandenen Tokens.

### Zugänglichkeit und ruhiger Lesefokus

Ein Absatz soll sich als zusammenhängender Text lesen lassen. Die App muss
zugleich jedem Vers einen erreichbaren Aktionsweg bieten. Zu prüfen ist deshalb
neben direkten Inline-Taps ein expliziter, mindestens 44 × 44 großer Zugang
„Versaktionen“ mit kanonischer Verswahl. Er ist ein gleichwertiger Zugang für
Tastatur und Screenreader und soll keine 44-Pixel-Kästchen zwischen die Wörter
erzwingen. Eine theoretische `accessibilityLabel`-Prop an inneren nativen
Textspans ersetzt keine VoiceOver-/TalkBack-Prüfung.

Auswahlzustand, Merkzeichen und Markierungsfarbe werden zugänglich benannt;
Farbe allein trägt keine Information. Beim Öffnen von Aktionen wird der Fokus
gezielt geführt und beim Schließen zum ursprünglichen Zugang zurückgestellt.
Web-Escape und natives Zurück müssen zuerst den offenen Kontext beziehungsweise
Lesefokus schließen, ohne unbeabsichtigt den Reader zu verlassen. Editorentwürfe
bleiben bei diesem Wechsel geschützt. Rein visuelle Versnummern dürfen weder
doppelt noch ohne Bezug zum Vers vorgelesen werden.

OLIVAs vorhandene Schrift-/Zeilenpräferenzen, Light/Dark und reduzierte Bewegung
bleiben maßgeblich. Ein zusätzlicher Lesefokus kann wie im Original zunächst
vorübergehender UI-Zustand sein; er darf nicht stillschweigend das gespeicherte
`read`/`deep`-Feld umdeuten. Eine spätere gespeicherte Layoutpräferenz verlangt
einen ausdrücklichen, rückwärtskompatiblen Datenvertrag.

## Konkrete Abnahme vor einer Übernahme

| Bereich | Überprüfbares Kriterium |
| --- | --- |
| Absatzmodell und Texttreue | Kapitel mit 1, 5, 6 und vielen Versen; kein Vers fehlt, erscheint doppelt oder ändert seinen Wortlaut. Bei passender Breite stehen mindestens zwei aufeinanderfolgende Verse nachweislich auf derselben Textzeile. Screenshots und reale Textrechtecke müssen das belegen, nicht lediglich ein Komponentenname. |
| Bestehende Versaktionen | JHN 6,35 auswählen, merken, beide angebotenen Farben setzen/entfernen und Notiz speichern; sämtliche bestehenden/importierten Farbwerte in Hell/Dunkel erhalten. Gespeicherter Schlüssel bleibt `JHN:6:35`, die Quelle bleibt exakt dieser Vers. |
| Entwürfe und Quelle | Bestehende Fälle aus `captures.spec.ts`: getrennte Entwürfe zu MRK 4,35 und 4,36, Neustart, Fortsetzen aus Sammlung, echter Speicherfehler und unveränderte eingegebene Worte. Vorhandene Gedanken müssen aus dem neuen Panel korrekt zur Sammlung führen. |
| Präzise Fortsetzung | Bestehende Fälle aus `reading-position.spec.ts` weiter bestehen lassen: JHN 6,35 nach Bereichswechsel und Offline-Neustart; Psalm 119,120 nach Wechsel auf 1.440 Pixel und Schrift/Abstand; expliziter Abschnittslink MRK 4,38 beziehungsweise 4,40; Kapitelwechsel verwirft den fremden Anker. Kein Testscroll darf den eigentlichen Restore ersetzen. |
| Inline-spezifischer Anker | Zwei Verse beginnen in derselben Zeile, ein anderer überspannt mehrere Zeilen. Expliziter Link, langsames/schnelles Scrollen, Reflow und Neustart wählen nachvollziehbar den richtigen kanonischen Vers. Ein verspätetes Ergebnis aus dem vorherigen Kapitel bleibt wirkungslos. |
| Abschnitt und Fortschritt | David bleibt exakt 1. Samuel 17,38–45; MRK 4,35–41 bleibt ein Abschnitt. „Das ganze Kapitel lesen“ wechselt den Scope bewusst. Kein Scroll-, Fokus-, Auswahl-, Font- oder Messereignis verändert `readChapters`, `readPassages`, Wegabschluss oder Wachstum. Nur die vorhandene ausdrückliche Bestätigung darf das tun. |
| Darstellung | 320/390/768/1.440 CSS-Pixel, beide Themes, lange Wörter und Verse, kleinste/größte Schrift, alle angebotenen Zeilenabstände, Webzoom und native Systemskalierung. Kein abgeschnittener Text, horizontaler Lesescroll oder durch Werkzeugleisten verdecktes Versende. |
| Tastatur und Screenreader | Vollständiger Text in sinnvoller Reihenfolge; Aktionen ohne Maus erreichbar; eindeutig benannte Quelle/Zustände; sichtbarer Fokus und sichere Rückkehr. Axe und Chromium prüfen nur einen Teil; VoiceOver/TalkBack müssen separat auf tatsächlichem Simulator/Gerät geprüft und entsprechend benannt werden. |
| Offline und Daten | Vollständiger Cache, erste Offlineöffnung des Readers, Wiederherstellung nach Reload und echter Vorgänger→Kandidat-Workerwechsel. Bibliothek, Notizen, Entwürfe, Importarchive, Rückkehrsicherung und Lesedaten bleiben erhalten. Ein reiner Renderertausch benötigt keine neue Persistenzform; keine IDs oder Textdaten aus Pixeln neu erzeugen. |
| Native Grenzen | JS-/Assetexport und Syntaxprüfung getrennt von echten Layout-/Text-, Eingabe-, Speicher- und Gerätetests ausweisen. Ohne native Laufprüfung keine Behauptung präziser Inlineanker oder funktionierender nativer Screenreaderführung. |

Bestehende Browserfälle, die bisher einen Versbutton über dessen Rechteck
finden, dürfen an die neue echte Inlinegeometrie angepasst werden. Ihre
inhaltlichen Grenzen, tatsächliche Persistenz und sichtbare Restoreposition
bleiben bestehen; die Prüfungen werden nicht durch bloße An-/Abwesenheit neuer
Test-IDs ersetzt. Quellen- und Fortschrittsprüfungen aus `core`, `personal`,
`swords`, `romans-sword`, `learning` und `david-story` bleiben Teil der
Regression.

## Vor einer vollständigen Originalparität zu entscheiden

1. **Native Messung:** Der kleine tatsächliche Laufversuch entscheidet, welcher
   Adapter präzise Inlineanker ermöglicht. Die Codeinspektion allein genügt
   dafür nicht.
2. **Mehrversaktionen:** Zusammenhängende Auswahl, Markierung, Kopieren und
   Bereichsnotizen erhalten einen eigenen konkreten Vertrag. Bestehende
   Einvers-Notizentwürfe und eingefrorene Altschemata dürfen dabei nicht durch
   Änderungen an gemeinsam importierten Unterschemata versehentlich erweitert
   werden. Erst ein abgegrenzter Modell-/Migrationsplan macht diesen zusätzlichen
   Teil umsetzbar; ein reiner Absatzrenderer wird nicht als vollständige
   Originalparität bezeichnet.
3. **Vollkapitel im Abschnittskontext:** Das Original und OLIVA unterscheiden
   sich absichtlich im bisher getesteten Anzeigeumfang. Der Vorschlag bewahrt
   zunächst OLIVAs exakte Abschnittslinks. Eine spätere zusätzlich angezeigte
   Kapitelumgebung muss sichtbar vom bestätigbaren Abschnitt getrennt sein und
   eigens abgenommen werden.

Als nächstes fachlich sinnvolles Arbeitspaket ergibt sich ein isolierter
Absatz-/Messprototyp mit realer Webdarstellung und nativer Machbarkeitsprüfung,
danach erst die Integration mit den vorhandenen Versaktionen und der gesamten
Positionsregression. Dies ist eine vorbereitete Arbeitsreihenfolge, keine
Freigabe eines ungeprüften Builds und keine Änderung des laufenden Releases.
FaithPath, `main`, bestehende Versionsstände und die private Vorschau bleiben
durch dieses Dokument unverändert.
