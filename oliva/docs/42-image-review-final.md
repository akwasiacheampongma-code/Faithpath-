# OLIVA · Abschluss der visuellen Bildprüfung

Geprüft am 18. November 2026. Grundlage ist das lokal bereitgestellte Paket `oliva-507a582d5a9cc3a6` der aktuellen privaten Vorschau auf Basis von 0.18.0. Der Abgleich folgt auf den UX-Stand und den Datenschutz-, Sicherheits- und Rechteaudit. Alle Aufnahmen zeigen die App in Chromium mit synthetischen Daten. [Paketstand](evidence/image-review-final/baseline.json) · [Datenschutz-, Sicherheits- und Rechteaudit](41-privacy-security-rights-audit.md) · [Private Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site/)

## Inventar der tatsächlich verwendeten Bilder

Sechs der 436 FaithPath-Originaleinheiten haben ein zugeordnetes Bild. Die übrigen 430 verwenden typografische Karten. Im Paket liegen 64 Laufzeitbilder mit zusammen 7.441.037 Byte, einschließlich mehrerer Auflösungen pro Motiv. Die 162 Inventarzeilen erfassen zusätzlich native Dateien und technische Grafiken. Die Liste enthält Quell- und Paketpfad, Einsatzstelle, Zuordnung, Dateigröße, Herkunft, dokumentierte KI-Angaben, Nutzungsrahmen und den Bezug zur Qualitätsbewertung. `garden-1280.webp` ist als unreferenzierte Quelldatei erfasst. [Inventar als CSV](evidence/image-review-final/inventory.csv) · [Inventar mit Nachweisen und SHA-256](evidence/image-review-final/inventory.json)

| Gruppe | Inventarzeilen | Webdateien | Byte im Webpaket | Nachweisbarer Stand |
|---|---:|---:|---:|---|
| Erzählungen und Landschaften | 20 | 20 | 2.515.458 | Projektbezogene Generierung, Prompt und Werkzeug je nach Nachweis. Öffentliche Nutzungsfreigabe offen. |
| Olivenbaum A51 einschließlich nativer Ebenen | 119 | 21 | 4.795.470 | Originale, Hashes und Prompts belegt. Übernahme in OLIVA durch den Auftrag erlaubt. Eigenständige öffentliche Weiterverteilung und genaue Modellangaben pro Bild offen. |
| Geistliches Schwert | 1 | 1 | 81.042 | Vorhandenes Original für die private Vorschau nachgewiesen. Öffentliche Nutzungsfreigabe offen. |
| PWA-Appsymbole | 4 | 4 | 28.806 | Einsatz und Dateien belegt. Erstellungsweg und öffentliche Markenfreigabe offen. |
| Technische Expo-Router-Bilder | 18 | 18 | 20.261 | Abgleich mit Paketdateien. Das Paket deklariert MIT. |

Bei den Geschichten und Landschaften sind Werkzeug, Datum und Promptversion dort aufgeführt, wo sie belegt sind. Übernommene FaithPath-Texte haben einen eigenen Nutzungsrahmen. Der für die typografischen Karten verwendete Luther-1912-Bibeltext stammt aus der bei eBible.org als gemeinfrei ausgewiesenen Fassung. [Bildmanifest](../art/manifest.json) · [A51-Provenienz](../art/a51/provenance.json) · [Schwert-Provenienz](../art/spiritual-sword/runtime.json) · [Rechte des Geschichtenkatalogs](../content/faithpath-stories/RIGHTS.md) · [Luther 1912](https://ebible.org/deu1912/copyright.htm)

## Qualität der vorhandenen Motive

Alle sechs illustrierten Einheiten wurden als Detailseite und als 64 × 76 CSS-Pixel großes Listenbild bei 320 px in Hell und bei 390 px in Dunkel geöffnet. Die 16 Detailaufnahmen enthalten zusätzlich Psalm 23 und Römer 1,1–17. Das warme, natürliche Licht und die gedämpften Farben verbinden die Illustrationen. Die Erkennbarkeit hängt besonders vom Zuschnitt für die Liste ab. [Sechs Detailbilder und Originalausschnitte im direkten Vergleich](evidence/image-review-final/story-detail-and-thumbnail-320-light.png) · [Messwerte und Einzelbilder](evidence/image-review-final/visual-and-offline.json)

| Bild und Zuordnung | Byte aller Varianten | Visuelle Prüfung |
|---|---:|---|
| Galiläa in Heute und Wege, atmosphärische Landschaft | 335.510 | Uferlinie und Morgenlicht bilden eine ruhige Fläche. Die Beschriftung als künstlerische Interpretation ordnet sie ein. |
| Gartenlandschaft in Wege, freie Deutung zu 1. Mose 1 | 86.314 | Die zurückhaltende Landschaft trägt das Wegthema. Für einzelne Verse fehlt ein konkretes erzählerisches Motiv. |
| `NS-0006` Noah, 1. Mose 8,1–22 | 355.356 | Die Taube aus 8,6–12 lenkt den Blick im großen Bild. Der jetzige Listenausschnitt verliert sie, sodass vor allem die Holzkonstruktion bleibt. |
| `NS-0010` Abram, 1. Mose 15,1–6 | 343.142 | Im Detail trägt der Sternenhimmel die Bildidee. Die stehende Figur hält den engen Zuschnitt, die Sterne verlieren an Lesbarkeit. |
| `NS-0052` David im Tal, 1. Samuel 17,32–50 | 448.938 | Die Blickrichtung bleibt verständlich. Die entfernten Figuren sind in der Liste klein. Die App nennt 17,38–45, der Prompt 17,40–47 und einen Landschaftsbezug zu 17,3. Der genaue Bezug braucht eine redaktionelle Klärung. |
| `NS-0203` Das Boot nach dem Sturm, Markus 4,35–41 | 172.794 | Boot und Lichtöffnung sind auch im Listenbild gut auffindbar. Die dargestellte Ruhe passt zum Ende der Szene. |
| `NS-0235` Die Frauen am offenen Grab, Markus 16,1–8 | 391.508 | Der Eingang und die Richtung der Figuren funktionieren im Detail. Der enge Zuschnitt drängt einen Teil der Gruppe an den Rand. |
| `NS-0241` Die Krippe, Lukas 2,1–20 | 381.896 | Die Gesichter und die Krippe bleiben im Ausschnitt zusammen. Die kompakte Komposition funktioniert auch in der Liste. |

Psalm 23 und Römer 1 zeigen, wie gut ein klar gesetztes Bibelzitat als eigener Einstieg wirken kann. Die größte Reibung liegt unterhalb des Zitats. Auf 320 × 568 px beginnt „Im Bibeltext lesen“ bei den bebilderten Einheiten bei 743 bis 790 px, bei Psalm 23 bei 904 px und im Römerbrief bei 1.118 px. Alle acht Fälle erfordern Scrollen. Für eine spätere Überarbeitung wären ein früherer Reader-Einstieg und gezielte Ausschnitte aus vorhandenem Material wirksame kleine Schritte. [Psalm 23](evidence/image-review-final/screens/NS-0073-320-light.png) · [Römer 1](evidence/image-review-final/screens/NS-0349-320-light.png) · [Bildnachweise](privacy-security-rights/image-credits-draft.md)

## Vorgeschlagenes Pilotset

Die vier Einheiten wurden im Originalkatalog geprüft. Sie verwenden aktuell typografische Karten. Empfehlung ist eine erste Freigabe für den barmherzigen Samariter. Seine Szene testet eine verständliche menschliche Geste sowohl im großen Bild als auch in der kleinen Liste. Die drei weiteren Motive sind Vorschläge für eine spätere Auswahl. [FaithPath-Katalog](../src/data/story-index.json) · [Originalprovenienz](../content/faithpath-stories/provenance.json)

| Originaleinheit | Bildausschnitt | Erwarteter Mehrwert |
|---|---|---|
| `NS-0249` Der barmherzige Samariter, Lukas 10,25–37 | Begegnung am Weg in Vers 33–35. Die Hilfe zeigt sich in Haltung und Händen. | Macht die Hinwendung sichtbar und gibt dem Gleichnis einen auch im kleinen Ausschnitt erkennbaren Mittelpunkt. |
| `NS-0264` Der Weg nach Emmaus, Lukas 24,13–35 | Zwei Reisende und ihr Begleiter auf dem Weg in Vers 13–16. | Macht Gehen und Gespräch sichtbar. Das spätere Erkennen bleibt der Lektüre vorbehalten. |
| `NS-0001` Am Anfang, 1. Mose 1,1–31 | Licht über Wasser in Vers 1–5. | Gibt einem abstrakten Anfang einen Bildanker. Der Untertitel benennt die künstlerische Deutung und den engen Versbezug. |
| `NS-0025` Der HERR wird für euch streiten, 2. Mose 14,13–31 | Menschen auf dem Weg durch das Wasser in Vers 21–22. | Die räumliche Komposition erleichtert das Verständnis. Im Mittelpunkt stehen Aufbruch und Weg. |

Die Bildsprache nimmt Sand, Creme, Oliv, natürliches Licht und matte Texturen aus der vorhandenen Serie auf. Die Hauptgeste bleibt in einem 3:2-Detailbild und in einem ausdrücklich dafür geprüften 64 × 76-px-Listenausschnitt erkennbar. Für die erste Illustration sind als überprüfbare Richtwerte etwa 90 KB bei 640 px und 180 KB bei 1.024 px vorgesehen. Vor einer Übernahme werden Versbezug, Alt-Text, kleine Ausschnitte in Hell und Dunkel, Quellen, KI-Herkunft und Nutzungsrahmen geprüft. Die Bildproduktion setzt die ausdrückliche Freigabe voraus.

Für die übrigen Einheiten bleibt Typografie der Regelfall. Vorhandene Bilder eignen sich für den belegten Textausschnitt und als gekennzeichnete atmosphärische Landschaften. Projektintern verwendbare Bestandsbilder und belastbar geklärte Rechte sind die Grundlage für jede weitere Nutzung.

## Mobiler Vergleich der Hauptansichten

48 Kombinationen aus sechs Ansichten, vier Viewports und zwei in OLIVA verifizierten Farbschemata bestanden. Die Prüfung lief bei 320 × 568, 375 × 812, 390 × 844 und 430 × 932 px mit zweifacher Pixeldichte und reduzierter Bewegung. Sie bestätigte die Hauptaktion beziehungsweise den Kerninhalt jeder Ansicht, die Hauptnavigation auf fünf Seiten, den geladenen A51-Baum in Stadium 4, die Bilddekodierung und die Breite ohne Horizontalüberlauf. Es gab keine JavaScript-Seitenfehler. Die 24 Aufnahmen zeigen die Ansichten bei 320 und 390 px. [320 px hell](evidence/image-review-final/mobile-320-light.png) · [320 px dunkel](evidence/image-review-final/mobile-320-dark.png) · [Vollständige Browser-Matrix](evidence/image-review-final/mobile-consistency.json)

| Ansicht | Sichtbefund auf 320 × 568 px | Aufnahmen bei 390 px |
|---|---|---|
| Heute | Die Hauptaktion im Lesebild ist vollständig sichtbar. Der Tagesimpuls beginnt darunter. | [Hell](evidence/image-review-final/mobile/heute-390-light.png) · [Dunkel](evidence/image-review-final/mobile/heute-390-dark.png) |
| Bibel | Weiterlesen, Buchsuche und Bereichsfilter sind sichtbar. Die erste Buchzeile benötigt auf der kurzen 320-px-Ansicht etwas Scrollen. | [Hell](evidence/image-review-final/mobile/bibel-390-light.png) · [Dunkel](evidence/image-review-final/mobile/bibel-390-dark.png) |
| Wege | Der erste Weg ist am unteren Rand sichtbar. Die Erklärung beansprucht hier vier Zeilen. | [Hell](evidence/image-review-final/mobile/wege-390-light.png) · [Dunkel](evidence/image-review-final/mobile/wege-390-dark.png) |
| Garten | Der Baum zieht in beiden Themen den Blick auf sich. Sichtprüfung mit dem vorhandenen Stadium 4. | [Hell](evidence/image-review-final/mobile/garten-390-light.png) · [Dunkel](evidence/image-review-final/mobile/garten-390-dark.png) |
| Sammlung | Die vier Register bleiben lesbar und passen in zwei Reihen. Persönliche Einträge beginnen unter Suche und Aktion. | [Hell](evidence/image-review-final/mobile/sammlung-390-light.png) · [Dunkel](evidence/image-review-final/mobile/sammlung-390-dark.png) |
| Reader | Der Bibeltext beginnt im ersten sichtbaren Bereich. Die klare Titeltypografie verbindet ihn mit den Hauptansichten. | [Hell](evidence/image-review-final/mobile/reader-390-light.png) · [Dunkel](evidence/image-review-final/mobile/reader-390-dark.png) |

## Ladezeiten und Offline-Nachweis

Je eine kalte Probe lief im lokalen Chromium bei 390 px und doppelter Pixeldichte mit deaktiviertem HTTP-Cache und blockiertem Service Worker. Die Drosselung betrug 1,6 Mbit/s Download, 0,75 Mbit/s Upload und 150 ms zusätzliche Latenz. „Bereit“ umfasst den sichtbaren Titel, geladene Schriften und gegebenenfalls das dekodierte Bild. Die Werte stammen aus dem Labor. [Rohmessungen](evidence/image-review-final/visual-and-offline.json) · [Laufprotokoll](evidence/image-review-final/visual.log)

| Probe | Seite bereit | Bildanfrage | Bild-Bytes | JavaScript-Transfer |
|---|---:|---:|---:|---:|
| Noah | 22,26 s | 0,79 s | 126.202 | 2.357.989 Byte |
| David | 22,35 s | 0,93 s | 154.442 | 2.357.989 Byte |
| Psalm 23 | 21,09 s | entfällt | entfällt | 2.357.989 Byte |

In allen drei Proben lag bereits `DOMContentLoaded` bei rund 12,4 bis 12,5 Sekunden. Das Bild ist damit im gemessenen Aufbau ein kleinerer Anteil. Eine größere Bildserie würde zusätzlich das Offline-Paket vergrößern, weil die App alle enthaltenen Bilddateien beim Vorbereiten des Offlinemodus lädt.

Nach der Vorbereitung lagen alle 64 Laufzeitbilder im tatsächlichen `CacheStorage`. In einer neuen Seite im selben Profil öffneten sich offline alle acht zuvor unbesuchten Geschichten- und Textbeispiele sowie die sechs Hauptansichten. Die Detailansichten waren nach 1,17 bis 1,34 Sekunden prüfbar. Die sechs illustrierten Fälle übertrugen dabei jeweils 0 Bildbytes über die Netzwerkverbindung. [Offline-Protokoll](evidence/image-review-final/visual-and-offline.json)

## Ausstehende Prüfung auf echten Geräten

- **Kleines iPhone, Safari und installierte PWA.** Vorschau- und Detailzuschnitt, große Systemschrift, VoiceOver, Fokusrückkehr in den Reader und Start nach vollständigem Schließen prüfen.
- **Kleines Android-Gerät, Chrome und installierte PWA.** Dasselbe bei TalkBack und vergrößerter Schrift prüfen, ergänzend die Android-Zurückfunktion und den Offline-Start aus dem Launcher.
- **Beide Plattformen.** Erststart über ein echtes langsames Mobilnetz, Cache-Aufbau und Offline-Start nach längerem Hintergrundzustand oder Speicherbereinigung messen. Eine PWA-Aktualisierung mit vorhandenem Lesestand, Lesezeichen, Markierung und Gedanken prüfen.
- **Native Builds auf beiden Plattformen.** Bilddekodierung bei hoher Pixeldichte, sieben A51-Stadien mit und ohne reduzierte Bewegung, Bildfehler, Speicherbedarf und Frame-Stabilität kontrollieren.

Die erneute Abnahme ist eine Browserprüfung des vorhandenen Pakets. Authentifizierter Hostingpfad, öffentliche Rechte und der im vorherigen Audit belegte offene Abhängigkeitsbefund haben weiterhin eigene Prüfnachweise und Freigabeschritte. Prüfhelfer, Inventar und Bericht liegen im lokalen OLIVA-Branch. [Sicherheits- und Rechtebefunde](41-privacy-security-rights-audit.md)

## Prüfungen reproduzieren

Aus dem OLIVA-Checkout mit den vorhandenen Abhängigkeiten. Der erste Pfad verweist auf das geprüfte private Site-Quellpaket. `CHROMIUM_PATH` kann bei Bedarf auf die vorhandene Chromium-Installation zeigen.

```bash
oliva_site=/workspace/sites/oliva-v04-preview
oliva_review=$(mktemp -d)
cp docs/evidence/image-review-final/baseline.json "$oliva_review/"
python3 scripts/verify-private-picture-inventory.py "$oliva_site" "$oliva_review"
node scripts/review-oliva-art.mjs "$oliva_site/dist" "$oliva_review"
node scripts/review-oliva-mobile-consistency.mjs "$oliva_site/dist" "$oliva_review"
```
