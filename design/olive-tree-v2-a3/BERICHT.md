# FaithPath Olivenbaum V2 · Phase A.3

**Empfehlung: NO-GO für die Übernahme als fertige Premium-Illustration.** Die isolierte technische Studie ist prüfbar. Der geforderte künstlerische Abschluss ist mit dieser Montage noch nicht erreicht. Phase B wurde nicht begonnen.

Studie: `FP-DESIGN-20261031-OLIVE-V2-A3`. Ausgangspunkt: `62c33c6dbe5ecfd93f34def39b19d7f3ff1b11e4`. Arbeitsbranch: `feature/olive-tree-v2-a3-final-art`. Der Liefercommit wird zusätzlich in der Übergabe außerhalb dieses Dokuments angegeben.

## Was tatsächlich bearbeitet wurde

Die A.2-Lichtkrone ist die gestalterische Referenz. Windform, die ursprüngliche Lichtkrone und sämtliche A.2-Dateien bleiben unverändert. Samen und Keimling werden bytegleich übernommen. Es wurden keine sieben neuen Gesamtbäume erzeugt.

Gezielt neu gemalt wurden Holzaufbauten, Kronensektoren und ein Fruchtzweig. Die zuerst ergänzten Feinverzweigungen ergaben zu viel nacktes Holz. Beschneidende Konturen verursachten anschließend getrennte Astanschlüsse. Beide Verfahren wurden verworfen; die Bilder liegen ausdrücklich als verworfene Iterationen bei. Die aktuelle Fassung verwendet ein neu gemaltes tragendes Holzgerüst und drei getrennte Kronenkomponenten.

Ab Stufe 3 werden dieselben registrierten Bauteile verwendet. Jüngere Holzzeichnung und lokaler Kronenumfang unterscheiden die frühen Stufen. Stufen 5–7 teilen exakt dieselbe Holz- und Bodenebene. Früchte liegen in eigenen Dateien. Es gibt eine funktionsfähige begrenzte Bewegungsdemo, keine Integration in die App.

## Künstlerische Prüfung: Ergebnis und Grenzen

**Nicht erfüllt: eine im Ganzen überzeugendere Premium-Markenillustration.** A.2 besitzt die geschlossenere natürliche Gesamtkrone. Die aktuelle A.3-Fassung verbessert die technische Zerlegbarkeit, bezahlt dies aber mit sichtbar getrennten Kronenbüscheln. Der direkte Browservergleich zeigt diesen Rückschritt; er wird nicht mit Testzahlen relativiert.

**Noch unzureichend: Übergang von Holz zur Krone.** Das Holz ist besser kontrollierbar, einzelne Anschlüsse wirken aber gepfropft. Besonders der dünne hohe linke Anschluss und der rechte Ansatz benötigen eine zusammenhängende zeichnerische Retusche. Kleine Bewegungswinkel kaschieren keine anatomischen Schwächen.

**Noch unzureichend: botanisches Alter.** Die jüngere Holzebene ist schlanker und die Höhlung geschlossen. Sie wirkt dennoch zu früh wie ein alter kleiner Baum. Eine überzeugende Entwicklung eines wirklich jungen Stamms zur späteren individuellen Hauptstruktur ist noch nicht vollständig gezeichnet.

**Teilweise verbessert: Blattstruktur.** Die breiteren neuen Kronensektoren enthalten feinere Verzweigungen und mehr Tiefenstaffelung als die ersten Sprig-Montagen. Innerhalb der Sektoren bleiben ähnliche Blattfächer erkennbar. Die untere linke Partie hat ein anderes Verhältnis von Blattgröße zu Zweigdichte. Die Lichtführung der einzeln gemalten Teile ist nicht vollständig einheitlich.

**Teilweise erfüllt: Früchte.** Eigene Fruchtzweige besitzen echte Stiele; sie werden mit ihrem Kronenbereich bewegt. Stufe 6 enthält eine vordere Gruppe, Stufe 7 zwei hintere und drei vordere Gruppen. Die wiederholte Form derselben Gruppe und der für kleine Darstellung vergrößerte Fruchtmaßstab sind sichtbar. Das ist noch keine endgültig natürliche Fruchtzeichnung.

**Teilweise erfüllt: 180 / 200 / 220 CSS-px.** Ohne Früchte, eine Gruppe und fünf Gruppen sowie unterschiedliche Kronenumfänge sind auf den Vergleichstafeln erkennbar. Die Abstufung ist bei 180 px subtil. Dass Nutzer die Stufen zuverlässig ohne Namen erkennen, wurde nicht untersucht. Namen stehen weiterhin dabei; Farbe ist nicht das einzige Merkmal.

Es werden keine Qualitätsnoten vergeben. Für die nächste Illustration empfehle ich eine zusammenhängende manuelle botanische Retusche der A.2-Komposition auf dem registrierten Gerüst, statt weitere unabhängige Bildgenerationen zu einer vermeintlich fertigen Krone zu montieren. Die A.3-Dateien können dabei als technisches Muster dienen, sollen A.2 aber gestalterisch noch nicht ersetzen.

## Geometrie und Ebenen

Die gemeinsame Canvas ist 1254 × 1254 Pixel. Registriert sind Wurzelkontakt, spätere Höhlung, linke Gabel, rechter Ellenbogen und die drei Kronenanschlüsse. Die endgültigen Bildanschlüsse wurden an den tatsächlich gemalten Dateien gemessen, nicht als exakt erfüllte Prompt-Koordinaten vorausgesetzt.

- Wurzelkontakt: 650 / 1100; die Trennlinie gehört zur Bodenebene G.
- Höhlungsregion / junge geschlossene Narbe: 670 / 855.
- Linke Hauptgabel: 532 / 658; rechter Ellenbogen: 815 / 795.
- C1: 432 / 363; C2: 353 / 528; C3: 1042 / 542.

Die Zielpunkte sind in allen Stufen 3–7 fest. Das beweist die gemeinsame Registrierung der Komponenten, nicht identische Rindenkonturen oder eine botanisch perfekte Altersentwicklung. Die ursprüngliche A.2-Krone wird nicht als pixelgleich erhalten behauptet. Sie ist im A.3-Arbeitsmaster sichtbar verändert.

Alle sechs benachbarten Stufen werden auf derselben Canvas mit je 50 % Deckkraft überlagert. Samen und Keimling sind bewusst übernommene Nahansichten, keine maßstäbliche Jungbaumregistrierung. Die Überlagerung ist eine halbtransparente Ebenenansicht, kein mathematisches RGB-Mittelbild.

Für Stufen 3–7 existiert eine vollständige Zuordnung von G, W, C1, C2, C3, F1 und F2. In fruchtlosen Stufen ist eine entsprechend deklarierte transparente Datei zugeordnet. Sie ist kein fehlender Inhalt. Aus den dekodierten Ebenen entsteht pixelgenau der veröffentlichte A.3-Arbeitsmaster in Ruheposition. Kein Vergleich gegen eine angeblich bereits freigegebene Illustration wird behauptet.

## Bewegungsdemo

`demo.html` zeigt drei kleine, unterschiedlich lange Kronenbewegungen. Stamm und Wurzelkontakt bleiben unverändert. Früchte werden in denselben Elterncontainern wie ihre Zweige geführt. Maskiertes Licht erreicht höchstens 8 % Deckkraft. Die Animation startet ausschließlich per Schaltfläche und endet nach zwei Zyklen, spätestens nach 16 Sekunden. Reduced Motion, Verlassen des sichtbaren Bereichs und ein verborgenes Dokument stoppen sie.

Der Übergang 6 → 7 ist eine einsekündige Überblendung nur der Kronen- und Fruchtebenen. Holz und Boden werden nicht doppelt eingeblendet oder bewegt. Es handelt sich ausdrücklich nicht um das Herauswachsen jedes Blattes. Ein überzeugender Morph würde identische feinere Astnetze und neue, von Hand definierte Wachstumszeichnungen benötigen; diese liegen nicht vor.

Die Demo schützt Unterbrechung und erneutes Tippen. Ein nachgewiesener Reset-Wettlauf während des Bilddekodierens wurde korrigiert: Vorher erschien trotz Reset wieder Stufe 7, danach bleibt Stufe 6. Fehlende Eingangsbilder lassen die vorherige Stufe bestehen. Die Videoaufnahme ist ein tatsächlicher Chromium-Mitschnitt mit gespeicherten Aufnahmezeitpunkten; sie ist kein Smartphone-FPS-Test.

## Ausgeführte Prüfungen

- **BESTANDEN:** `npm test`, 245 Tests, keine Fehler im abschließenden Lauf. Ein erster Lauf scheiterte an `spawnSync python3 EPERM` der Ausführungsumgebung, obwohl der Python-Validator PASS ausgab. Die Wiederholung mit freigegebener Prozess-/Netzwerkumgebung bestand. Beide Nachweise sind enthalten.
- **BESTANDEN:** 15 isolierte Browser-Prüfgruppen; Details und konkrete Messwerte in `evidence/qa.json`.
- **BESTANDEN:** 32 Layoutfälle: vier Themes × 320/390 px × Heute/Mein Weg/Baumdetail/erster Weg. Keine horizontalen Überläufe; Bilder geladen; kein Schreiben in lokalen oder Sitzungsspeicher.
- **BESTANDEN:** 16 Textgrößenfälle mit 200 % Root-Schrift in Baumdetail und Stufenübersicht, alle vier Themes bei 320/390 px. Dies ist eine CSS-Schriftvergrößerung, kein echter iOS-Dynamic-Type-Test.
- **BESTANDEN:** Acht zusätzliche Galerie-Fälle bei 200 % Root-Schrift, 320/390 px und vier Themes, ohne horizontalen Überlauf. Ein zuvor nachgewiesener starrer Galerie-Header wurde auf sinnvollen Zeilenumbruch umgestellt.
- **BESTANDEN:** Tastaturbedienung der Übersicht, sieben erreichbare Stufen und Dialogschließen per Escape; acht Axe-Prüfungen von Detail und Demo in vier Themes ohne gemeldete WCAG-A/AA-Verstöße. Keine vollständige menschliche Screenreader-Abnahme.
- **BESTANDEN:** Bilder bei exakt 180, 200 und 220 CSS-px; richtige Ebenengrößen; deckungsgleiche Ruhe-Rekomposition; statischer Stamm; an Eltern gebundene Früchte; Begrenzung der Bewegung; Reduced Motion; Update des isolierten Bildzustands und Behandlung eines synthetischen Ladefehlers.
- **BESTANDEN:** Zwei Exporte aus fest gespeicherten Quellen, 31 Ausgabedateien bytegleich per SHA-256. Das ist reproduzierbare Ebenenmontage, keine reproduzierbare KI-Bildgeneration und kein Produktionsbuild.
- **BESTANDEN:** Alle 4.335 zuvor versionierten Dateien sind bytegleich zum Ausgangscommit. Darin enthalten: echte App, A.1/A.2, Windform, Schema V5, Daten, Fortschrittsregeln und Backupcode.
- **OFFEN / UMGEBUNG BLOCKIERT:** Direkter `file://`-Aufruf ist im verwalteten Chromium durch die Administratorrichtlinie gesperrt. Die Galerie wurde zuverlässig über den lokalen HTTP-Server geprüft. Für die Übergabe ist dieser Weg dokumentiert.
- **OFFEN:** echte iPhone-, Safari-, VoiceOver-, Touch- und Geräte-Performance-Prüfung. 60 FPS, geringe CPU-Last auf schwachen Geräten und Akkuverbrauch wurden nicht gemessen.
- **NICHT AUSGEFÜHRT:** Produktbuild, Produkt-PWA-Update, Deployment und vollständige neue App-End-to-End-Abnahme. Die echte App ist unverändert, Phase B ist ausdrücklich nicht erlaubt.

## Mobile Einordnung

Die vier Vorschauen enthalten ausschließlich synthetische Texte. Sie sind Layoutstudien mit erklärten Platzhalteraktionen, kein zweites FaithPath mit Ersatzspeicherung. Die große Detailansicht und die Stufenübersicht zeigen das vollständige Bild. Auf Heute bei 320 px ist die Baumfläche zugunsten des nächsten Schritts kleiner. Das Ziel eines zugleich dominanten Baums und aller zentralen Aktionen im ersten Bildschirm ist damit noch nicht abschließend gelöst. Die Bibel bleibt als erklärte Vorschauaktion erreichbar, nicht als nachgebauter Reader.

## Schutz und Quellen

Es wurden ausschließlich neue Dateien unter `design/olive-tree-v2-a3/` erstellt. Keine echte Nutzerdatei wird gelesen. Die Demo verwendet weder Store noch App-Router, keine Cloud, keine Tracker, keine Service-Worker-Registrierung und keine neue Bibliothek. Alle benötigten Bilder und Schriften liegen lokal vor.

Tatsächlich genutzte Referenzen sind die vorhandenen A.2-PNGs und die in dieser Phase erzeugten Teilzeichnungen. Eingesetzt wurde ImageGen für gezieltes Neumalen. Canvas dient ausschließlich registrierter Montage, Freistellung und Export. Die Quellbilder und Prompts werden zur Nachvollziehbarkeit mitgeliefert. Nicht verwendete Generationen sind keine fertigen Ebenen. Newsreader und DM Sans samt vorhandenen OFL-Lizenzdateien werden unverändert lokal übernommen. Es werden keine neu recherchierten Stockbilder oder fremden Illustrationen beansprucht.

## Entscheidungsvorlage

**Technisches Muster: nutzbar zur Prüfung und weiteren Illustration. Künstlerisches Final: nicht erreicht. Integration: NO-GO.** Vor Phase B müssen Krone, Astanschlüsse, botanische Altersstufen und Fruchtmaßstab zusammenhängend retuschiert und vom Auftraggeber visuell freigegeben werden. Die Ergebnisse wurden weder veröffentlicht noch gemergt. Auf die Designentscheidung wird gewartet.
