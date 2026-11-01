# FaithPath · Lichtkrone A.4

**Empfehlung: GO für die Designabnahmevorlage von Masterstufe 7.** A.4 stellt die natürliche zusammenhängende Gesamtform der A.2-Lichtkrone wieder her und verbindet sie mit einer zurückhaltenden, kontinuierlichen Blattbewegung. Die verbindliche Designfreigabe bleibt beim Auftraggeber. Die übrigen sechs Stufen und Phase B wurden nicht begonnen.

Studie: `FP-DESIGN-20261031-OLIVE-V2-A4`. Abschlussprüfung: 01.11.2026. Basis: `18e9f1f1f644045fa76240bc12a342412bab99df`. Branch: `feature/olive-tree-v2-a4-master-recovery`. Der exakte Liefercommit steht in der Übergabe und im ZIP unter `DELIVERY.json`.

## Ausgangsbilder tatsächlich geprüft

A.1 zeigt die frühere botanische Gesamtgestaltung. Der Vergleich von A.2 und A.3 bestätigt das wesentliche Problem: Die technisch getrennten A.3-Kronenteile ersetzen eine durchgehende Baumgestalt durch getrennte Büschel und zu große kahle Zwischenräume. Ein weiteres Anfügen ähnlicher Teile hätte dieses Problem fortgesetzt.

Verbindliche künstlerische Quelle war deshalb ausschließlich `design/olive-tree-v2-a2/assets/masters/master-lichtkrone.png`. Eine gemeinsame ImageGen-Retusche bearbeitet den ausgewachsenen Baum als ganze zusammenhängende Zeichnung. Es wurden keine sieben neuen Bäume, keine unabhängig generierten Kronenteile und keine zusätzlichen Fruchtsprites erzeugt. Die originale Werkzeugausgabe ist im gelieferten Master unverändert erhalten. Es wird keine menschliche Handzeichnung behauptet.

Die Vergleichskopien von A.2 und A.3 sind bytegleich mit den Repository-Originalen. Im Direktvergleich verwenden alle drei Bilder die vollständige 1254-Quadrat-Canvas, dieselbe Skalierung und denselben Hintergrund. Sechs Detailtafeln zeigen dieselben echten Bildausschnitte der jeweiligen Dateien.

## Künstlerische Bewertung

| Kriterium | Beobachtung A.4 gegenüber den Referenzen |
|---|---|
| Natürlichkeit | Die Krone liest sich wieder als zusammengewachsener Baum. A.3s voneinander getrennte Büschel sind beseitigt. |
| Zusammenhängende Krone | Innere Zweige und überlappende Laubschichten verbinden linke, mittlere und rechte Krone. Der charakteristische Freiraum unter dem gebogenen rechten Ast bleibt erhalten. |
| Astanatomie | Hoher linker Leitast, tief gebogener rechter Hauptast und nachvollziehbare Verzweigungen bleiben verbunden. Keine neu angefügten, frei schwebenden Kronenteile. Kleine gezeichnete Astnarben/Stummel bestehen weiterhin. |
| Rinde | Stammbewegung, Höhlung, Wurzelansätze und rechter heller Stein erhalten die Lichtkrone-Identität. A.4 ist schärfer und etwas polierter; A.2 hat die weichere matte Holzmodellierung. Nicht jedes Detail ist pauschal besser. |
| Tiefe und Licht | Die gemeinsame Retusche stellt zusammenhängende Schatten- und Laubebenen wieder her. Es gibt keine unterschiedlich beleuchteten separat gemalten Büschel. Der warme Holzton bleibt deutlich sichtbar. |
| Früchte | Größenverhältnis wieder zum gesamten Baum passend. Früchte sitzen an ihren gezeichneten Zweigen. Keine unabhängig schwebenden oder zur Laufzeit kopierten Fruchtgruppen. Ähnliche und teilweise gedrängte Gruppen sind im Detail noch erkennbar. |
| Markenidentität | Die markante asymmetrische Lichtkrone bleibt erkennbar. A.4 ist eine Wiedergewinnung und Verfeinerung dieser Identität, keine neue generische Baumform. |
| Premiumwirkung | Im mobilen Gesamtbild mindestens auf dem zusammenhängenden Niveau von A.2; deutlich überzeugender als A.3s Montage. Die frische unabhängige KI-Sichtprüfung kommt zum gleichen Urteil. Dies ersetzt keine Auftraggeber- oder Nutzerabnahme. |

Es werden keine erfundenen Qualitätsnoten vergeben. Meine Freigabeempfehlung bezieht sich auf die vorliegende Master-Designentscheidung, nicht auf eine veröffentlichbare neue Appversion.

## Sichtbare Grenzen

Die Darstellung bleibt eine stilisierte botanische Illustration. Bei großer Vergrößerung sind fächerartig ähnliche Blattstellungen und einige gedrängte Olivengruppen erkennbar. Die Rinde ist stellenweise stärker poliert als in A.2. Kleine Astnarben beziehungsweise Stummel sind nicht überall zu weiterlaufenden Feinzweigen ausgearbeitet. Für eine endgültige großformatige Markenzeichnung wären genau diese Stellen die sinnvolle gezielte Nachretusche: Blattstellungen in den rechten und inneren Fächern variieren, Fruchtgruppen dort vereinzeln und die kleinen rechten Astnarben mit den Rindenübergängen abgleichen. Diese Restpunkte werden nicht durch grüne Tests für erledigt erklärt.

Die 1254-px-Rasterdatei ist für die hier gezeigten mobilen Größen geeignet, aber keine beliebig vergrößerbare Vektor- oder Druckvorlage. Die nächste Serie darf erst nach der Designentscheidung von dieser Form abgeleitet werden.

## Technische Konsolidierung

Die künstlerische Zeichnung wird nicht wieder in bewegte Inseln zerschnitten. Zwei komplementäre transparente PNG-Platten bilden genau denselben Master:

- B: Erde, Wurzeln und unterer Stamm ab Quellzeile 900, vollständig statisch.
- K: die gesamte zusammenhängende Krone einschließlich Früchten und oberem Tragholz, oberhalb Zeile 900. Registrierte bewegungsfreie Zonen schützen das Tragholz. Periphere Blatt-/Feinzweigbereiche erhalten nur kleine lokale Auslenkungen.

Diese Aufteilung ist absichtlich ehrlich: Es gibt keine vorgetäuschte komplett separate Holzzeichnung oder sieben Produktionslayer. Früchte bleiben in der Textur ihrer Zweige. Die Bewegung verwendet ein zusammenhängendes Netz mit gemeinsam genutzten Kanten. Es entstehen keine Lücken zwischen unabhängig verschobenen Teilbildern.

Das Originalbild wird zur statischen Montage weder passend gestreckt noch stufenweise skaliert. Die kleine lokale Bewegung ist eine Animation der fertigen Zeichnung, kein Verfahren zum Kaschieren unpassender Bildteile. Das gemessene Maximum im 40-ms-Prüfraster beträgt etwa 3,12 Quellpixel; bei 200 CSS-px entspricht dies etwa einem halben CSS-Pixel.

Die Demo startet nur auf Wunsch, läuft einmal acht Sekunden und endet in Ruhe. Bildaktualisierung ist auf höchstens 30 pro Sekunde begrenzt; im Leerlauf läuft keine Animationsschleife. Die Zeichnungsauflösung folgt der sichtbaren Größe bis zur Quellauflösung, bei höchstens zweifachem Gerätepixelfaktor. Dies sind technische Begrenzungen, keine behauptete Smartphone-FPS-Messung.

Reduced Motion, unsichtbare laufende Animation und verborgenes Dokument stoppen die Bewegung. Statische manuell gewählte Prüfpositionen bleiben beim Scrollen erhalten. Bei fehlendem WebGL, fehlender bewegter Bildplatte oder Grafik-Kontextverlust bleibt die vollständige statische Masterillustration sichtbar. Die Lichtmodulation ist auf 1,2 % begrenzt und betrifft nur die Blattbewegungsbereiche; sie erzeugt kein Leuchten.

## Nachweis gegen neue Bildlöcher

Die tatsächlichen Browserbilder der Ruhe-, Mittel-, Maximal- und Endpose liegen unter `evidence/poses/`. Zusätzlich gibt es mobile Bilder aller vier Posen bei 320/390 px, die 200-CSS-px-Prüfung und Reduced Motion.

Im geprüften Chromium-/SwiftShader-Renderer ergibt die Ruheposition **0 Farb- und 0 Alphaabweichung** gegenüber dem sichtbaren Original-RGBA. In 434.148 deckenden Innenpixeln mit sieben Quellpixeln Randreserve entstehen in den vier Posen keine neuen Transparenzlöcher. Neun ausgewiesene Holz-/Wurzel-Prüfflächen und der Bereich der Plattenschnittlinie bleiben pixelgleich. Gemeinsame Netzkanten und positive Dreiecksorientierung werden außerdem im Modell geprüft.

Die Randreserve trennt neue innere Bildlöcher von den natürlichen Zwischenräumen und bewegten Blattkonturen. Diese Messung beweist weder botanische Perfektion noch vollständige Gelenkartikulation jedes einzelnen Feinzweigs. Die großen Ansichten und Astanschlüsse wurden zusätzlich sichtbar geprüft.

Eine erste Rasterprüfung hatte maximal 5/255 Abweichung gezeigt. Die CPU-Zusammensetzung der PNGs war exakt; höhere Fragmentpräzision allein löste den Befund nicht. Die Ursache waren nicht ganzzahlig registrierte Netzpunkte im Rasterizer. Ganzzahlige Quellkoordinaten beseitigten die Abweichung. Dieser Verlauf ist in `evidence/raster-fix.json` dokumentiert.

## Mobile Wirkung

Alle vier bestehenden Themes werden mit denselben unverfälschten Baumfarben gezeigt. Heute, Mein Weg und Baumdetail verwenden ausschließlich synthetische Texte und erklärte Vorschauaktionen. Es wird kein zweiter App-Store und kein Ersatz-Datenmodell aufgebaut.

Bei 320 × 568 ist die Baumabbildung auf Heute 220 CSS-px hoch. Der nächste Schritt endet im geprüften Layout bei Y=497,28; die feste Navigation beginnt bei Y=502,69. Damit bleibt die vollständige Aktion knapp, aber sichtbar über der Navigation. Bei 390 × 844 ist der Baum 300 CSS-px hoch und es bleibt deutlich mehr Raum. Der Bibelzugang bleibt in der Navigation direkt erreichbar; der zusätzliche Schnellzugang darf auf dem kleinsten Bildschirm unterhalb der ersten Ansicht stehen.

Bei 200 % Schrift bleibt alles scrollbar erreichbar, ohne die Texte künstlich zu verkleinern oder horizontalen Überlauf zu verstecken. Es wird nicht behauptet, dass alle Inhalte dann in einen Bildschirm passen.

## Tatsächlich ausgeführte Prüfungen

- Baseline der unveränderten App: `npm test`, 245 Tests bestanden. Der Inhalt der bestehenden App bleibt seit diesem Lauf bytegleich.
- Neues Bewegungsmodell: drei Tests bestanden, einschließlich statischer Holz-/Wurzelpunkte, begrenzter Bewegung und ungefalteter gemeinsam verbundener Netzgeometrie.
- Isolierte Browserprüfung: 17 Prüfgruppen bestanden. Darin 24 mobile Layoutfälle, 16 Textvergrößerungsfälle und acht zusätzliche Galerie-Fälle bei 200 %.
- Zwölf Axe-Prüfungen: Heute, Baumdetail und Demo in vier Themes, ohne gemeldete WCAG-A/AA-Verstöße im ausgeführten Umfang. Das ist keine vollständige menschliche Barrierefreiheitsabnahme.
- Tastatur: Dialog öffnen/schließen, Fokus zurückgeben und Baumdetail öffnen geprüft.
- Ausfälle: echter WebGL-Kontextverlust im Browser sowie synthetisch fehlendes WebGL und fehlende obere Bildplatte geprüft. Statischer vollständiger Master bleibt erhalten.
- Lebenszyklus: kein zusätzlicher Renderframe im gemessenen 600-ms-Leerlauf; Ende nach begrenztem Ablauf; keine doppelten Animationsschleifen; Stoppen durch IntersectionObserver und simuliertes `document.hidden` geprüft. Das Hintergrundereignis ist ausdrücklich keine physische iOS-Prüfung.
- Statische Prüfposition bei Unsichtbarkeit und synchronisierte Zeitanzeige nach Start/Stop/Reset durch reproduzierte Regressionen abgesichert.
- Zwei technische Plattenexporte mit identischen SHA-256-Dateihashes. Keine Behauptung einer reproduzierbaren Bildgenerierung; kein Produktionsbuild.
- Alle 4.514 vorher versionierten Dateien sind bytegleich zu A.3. Vergleichskopien von A.2/A.3 bytegleich mit den Originalen.

Die echte Browseraufnahme ist ein zeitlich protokollierter Chromium-Mitschnitt. Der Aufnahmefarbpegel ist korrekt gekennzeichnet und gegen die Papier-Hintergrundfarbe geprüft; das Video ist verlustbehaftet, die PNGs bleiben für die Farb- und Detailabnahme maßgeblich. Aufnahmebildrate und Software-Renderer sind kein Nachweis für 60 FPS, Akkubelastung oder schwache Smartphones.

## Unabhängige Prüfung und offene Gates

Ein frischer KI-Review-Kontext hat die Originaldateien, Vergleichs-/Detailtafeln und mobilen Ansichten tatsächlich betrachtet sowie den Code geprüft. Keine wichtigen Blocker festgestellt; die künstlerischen Restpunkte sind oben aufgeführt. Ein zusätzlich gefundener falscher Zeitanzeigenstand wurde reproduziert und behoben. Der eigene Browserstart des Reviewers war durch dessen Sandbox eingeschränkt; die Browserläufe der Hauptausführung sind davon getrennt dokumentiert. Der volle Review steht in `evidence/independent-review.md`.

**OFFEN:** echte iPhone-, Safari-, VoiceOver-, Touch-, Dynamic-Type- und Geräte-Performance-Prüfung. Keine menschliche Nutzerstudie durchgeführt. Der lokale Viewer benötigt HTTP, da ES-Module verwendet werden. Einfacher Doppelklick auf `index.html` wird nicht als unterstützter Betriebsweg zugesagt.

## Unveränderte Schutzverträge und Stopp

Die echte App, main, A.1/A.2/A.3, Windform, die übrigen sechs Stufen, die sieben Bedeutungstexte, Schema V5, IDs, Wachstumsschwellen, persönliche Daten, Backups, Bibel- und Quizdaten sind unverändert. Keine neue Migration, kein Produktbuild, kein Merge und kein Deployment. Alle neuen Dateien liegen unter `design/olive-tree-v2-a4/`.

Es gibt keine Anbindung an persönliche Speicherung, externe Analyse, Cloud oder Tracker. Die vorhandenen lokalen Newsreader-/DM-Sans-Fonts und OFL-Dateien wurden unverändert übernommen. Tatsächliche Bildquelle war die bestehende A.2-Lichtkrone; keine neuen Stockbilder oder separat fremdbezogenen Illustrationen.

**STOP an der Master-Designentscheidung.** Erst nach ausdrücklicher Freigabe darf die Arbeit an den restlichen sechs Stufen beginnen. Eine Integration in die echte FaithPath-App ist weiterhin nicht freigegeben.
