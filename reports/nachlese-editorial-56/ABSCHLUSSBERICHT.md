# FaithPath — Nachlese-Redaktionsintegration

Stand: 16.10.2026. Ergebnis: **BEREIT FÜR ECHTGERÄTETEST**. Technisches Go für die weitere Abnahme; **keine Produktionsfreigabe**, solange das iPhone-/Safari-/PWA-/VoiceOver-Gate offen ist. Kein Netlify-Deploy und keine Änderung an main.

## Geprüfte Grundlage und Ergebnis

- Ausgangsbranch: `content/nachlese-multiple-choice-20261016`, Commit `d3322255e51af3c5eabb39011b0ff78dc05ea88f`.
- Integrationsbranch: `integration/nachlese-editorial-56-20261016`.
- Getesteter Implementierungscommit: `bda4990030c473db8496b424c953aca77587d3ae`. Der abschließende Dokumentationscommit steht im Lieferbeleg des ZIP; Änderungen danach betreffen ausschließlich Berichte und Belege.
- Kandidat: `FP4-20261016-G-STABLE1-NMC2`. Vorgänger für den echten Update-Test: `FP4-20261016-G-STABLE1-NMC1`, Build-Hash `9dc4a8931b7ef1400fd0f6a8a950658e6e121b90797a5a732afe43536dc3bfde`.
- Aktive Quelle: `data/nachlese-questions.json`; Anzeige und Geschichtenzuordnung über `data/faithpath-nachlese-story-flow.json`. Keine erneute Zusammenführung, kein alter Nachlese-Import.

| Bestand / Prüfung | Ergebnis |
|---|---:|
| Nachlese-Wissens- und Verständnisfragen gesamt | 2.314 |
| Bereits vollständig vor dieser Phase | 2.258 |
| In dieser Phase vervollständigt | 56 |
| Danach mit genau vier Optionen und gültigem Lösungsindex | 2.314 |
| Unklare / zurückgehaltene Ergänzungen | 0 |
| Zusätzliche markierte Bestandsfragen | 150, alle unverändert |
| Markierte Optionspaare im Quellpaket | 227, keine 227 verschiedenen Fragen |
| Zusätzlich korrigierte Verszuordnungen | 2 |
| Insgesamt diesmal in beiden Übersetzungen einzeln geprüft | 208 |
| In dieser Phase nicht erneut semantisch geprüfter Bestand | 2.106 |
| Tatsächlich geänderte N-Datensätze | 58 |
| Dokumentierte Feldänderungen | 239 |
| Separate, unveränderte Nachlese-Reflexionen | 435 |
| Reflexionen aller gemeinsamen Geschichten | 436 |

Reflexionsfragen sind kein Teil der 2.314 Wissensfragen und wurden nicht in MC umgewandelt. Im gemeinsamen Ablauf bleiben 2.479 primäre Fragen erhalten: 2.314 N-Fragen und 165 FP-Storyfragen. Die 95 bestehenden FP-Aliasse bleiben dieselben; sie werden nicht als zusätzliche angezeigte Fragen gezählt. Der separate NT-Bestand bleibt bei 1.300 Fragen in 260 Kapiteln und 27 Büchern.

## Quellenprüfung und redaktionelle Entscheidungen

ZIP und Excel wurden vollständig gelesen, per SHA256 gebunden und miteinander verglichen. Alle 56 Vorschläge stimmen in ihren ursprünglichen Fragen, Antworten, N-IDs, Verweisen und Geschichten exakt mit dem Ausgangscommit überein. Die 56 IDs entsprechen genau den bisher zurückgehaltenen Ergänzungen. Alle 227 Markierungen lassen sich auf tatsächlich vorhandene falsche Optionen von genau 150 bestehenden Fragen zurückführen. Excel enthält keine Formeln; 56 Entscheidungszeilen und 227 Markierungszeilen stimmen feldweise mit JSON überein. Die Originalanlagen sind unverändert enthalten.

Das Paket bezeichnet seine Vorschläge als Entwurf, nicht als bereits erfolgte menschliche Freigabe. Die hier erfolgte fachliche Prüfung ist modellgestützt und quellenbasiert: Jede der 208 Fragen hat einen Einzelentscheid mit Begründung sowie für die richtige und alle drei falschen Optionen einen getrennten Beleg aus beiden tatsächlich verfügbaren lokalen Übersetzungen OTB Deutsch und Luther 1912. Insgesamt **1.664 wörtliche Bibelbelege** wurden zusätzlich maschinell gegen die unveränderten Dateien geprüft. Das prüft Zitatintegrität; die Beurteilung von Bedeutung, Eindeutigkeit und Didaktik ist separat in den Einzelentscheidungen dokumentiert. Es wird keine menschliche Redaktionsabnahme oder Prüfung gegen andere Bibelausgaben behauptet.

Von den 56 eingereichten Vorschlägen wurden **11 übernommen und 45 verbessert**. Verglichen mit dem installierten Vorgänger wurden alle 56 zugehörigen Frage-/Antwortformulierungen präzisiert und vier Antwortoptionen ergänzt. Bestehende Erklärungen wurden nicht entfernt. Sieben Ergänzungen erhalten eine sachliche Erläuterung; zwei weitere Erklärungen betreffen die Segmentierung. Die vollständigen alten und neuen Werte stehen in `change-list.json`, die lesbare Prüfung in `EINZELPRUEFUNG.md`, der gesamte Bestand in `all-2314-review.csv`.

Wichtige belegte Korrekturen:

- **N-0388 / Psalm 121,4:** Der Hüter Israels schläft und schlummert gerade nicht. Frage und Lösung beziehen sich jetzt eindeutig auf die ausdrücklich verneinten Tätigkeiten.
- **N-0514 / Habakuk 2,4:** Die erste Vershälfte unterscheidet sich zwischen Luther („keine Ruhe“) und OTB („nicht aufrichtig“). Die Frage prüft die gemeinsame eindeutige Aussage über das Leben aus Glauben.
- **N-0596 / Matthäus 7:** Der schmale Weg zum Leben steht erst in Vers 14. Der Referenzbereich wurde von 7,13 auf **7,13–14** erweitert; ohne diesen Vers wäre die neue Lösung nicht vollständig belegt.
- **N-1524 / Johannes 8,40:** Die Tötungsabsicht betrifft Jesu Gesprächspartner. „Das hat Abraham nicht getan“ darf nicht in eine Abraham zugeschriebene Tötungsabsicht verkehrt werden.
- **N-1798 / Apostelgeschichte 17,28:** Gefragt wird ausdrücklich nach dem als Dichterzitat eingeführten Satz „Wir sind seines Geschlechts“. Der vorhergehende Satz wird nicht damit verwechselt.
- **N-2218 / 1. Johannes 3,17:** Die Frage nennt die drei Bedingungen vorhandene Mittel, wahrgenommene Not und verschlossenes Herz; bloßer Besitz allein wird nicht als Vorwurf dargestellt.
- **N-2240 / Offenbarung 1,1:** Frage und Antwort unterscheiden Zielgruppe, Empfänger der Offenbarung und Übermittlungsweg: gezeigt werden soll sie den Knechten; Jesus, Engel und Johannes haben andere Rollen.

Falsche Optionen sind jeweils im ausdrücklich eingegrenzten Fragekontext falsch. Eine wahre Aussage an anderer Bibelstelle kann deshalb als falsche Antwort auf die Frage nach einem bestimmten Vers vorkommen; sie wird nicht als grundsätzlich falsche biblische Aussage dargestellt. Unbelegte erfundene Folgeereignisse wurden aus Vorschlägen entfernt.

### Johannes 10: lokale Segmentierung, keine Umnummerierung

| Aussage | OTB lokal | Luther 1912 lokal | Neuer gemeinsamer Verweis |
|---|---|---|---|
| N-1535: Leben in Fülle / volle Genüge | 10,10 | 10,11 | Johannes 10,10–11 |
| N-1536: guter Hirte gibt sein Leben | 10,11 | 10,12 | Johannes 10,11–12 |

Im lokalen Luther-Datensatz enthält Vers 12 auch den anschließenden Mietlingssatz, der in OTB Vers 12 folgt. N-1536 wurde als unmittelbar benachbarter Fall derselben nachgewiesenen Ursache mitgeprüft. Beide Fragen behalten ihre bisherigen Formulierungen, richtigen Antworten, Optionen und Lösungsindizes. Lediglich Text-/Strukturverweis und erklärender Segmentierungshinweis wurden angepasst. **Keine Bibeldatei und keine Versnummer wurde geändert.** Damit bleiben vorhandene Versmarkierungen an ihren ursprünglichen lokalen Versschlüsseln.

### Die 150 markierten Bestandsfragen

Alle wurden einzeln in beiden lokalen Übersetzungen geprüft. Die Markierungen beruhen auf Ähnlichkeiten zwischen richtigen und falschen Optionen und sind allein kein Fehlerbeweis. Es wurde kein nachweislicher Inhaltsfehler festgestellt; deshalb **150 KEEP, 0 CORRECT**, keine kosmetische Umformulierung.

Dokumentierte Unterschiede bleiben sichtbar: N-1411 enthält den in Luther vorhandenen, in OTB ausgelassenen Honigseim; OTB bestätigt dieses Detail nicht positiv. N-1467 verwendet die siebte Stunde gegenüber OTBs 13 Uhr. Bei N-1726 ist Apostelgeschichte 8,37 in OTB eingeklammert. N-2207 bezieht sich auf den Dieb in der Nacht; die entsprechende Nacht-Ergänzung fehlt in OTB 2. Petrus 3,10, ist aber im Paralleltext 1. Thessalonicher 5,2 vorhanden. Diese Unterschiede wurden nicht stillschweigend harmonisiert oder als vier nachgewiesene Fehler ausgegeben.

## Technische Änderungen und Bestandsschutz

Die Integration ändert den Datenbestand nur gemäß den 208 quellengebundenen Einzelentscheidungen. Der Validator rekonstruiert daraus den erwarteten Gesamtbestand und vergleicht ihn vollständig mit der veröffentlichten Datei. Änderungen an anderen Fragen, IDs, Reihenfolge, Provenienz oder Geschichtenbezügen werden abgewiesen, auch wenn jemand nur den veröffentlichten Datenhash aktualisiert. Alle 2.314 Datensätze erhalten erneut die Strukturprüfung: vier nichtleere unterschiedliche Optionen, Index 0–3, genau eine indexierte richtige Antwort und identischer Antworttext.

Die 239 Feldänderungen verteilen sich auf je 56 Änderungen an `q`, `answer`, `a`, `c`, neun Ergänzungen von `x` sowie je drei Änderungen an `ref` und `references`. Vollständiger Schutz für Geschichten, gemeinsamen Ablauf, Bibeltexte, Store, Migrationen, Importvalidierung, Entwurfslogik, Kapitelquiz und bestehende Prüfarbelege. N-IDs, `source_story_id`, Aliaszuordnungen und Fortschrittsschlüssel bleiben erhalten. Es gibt weder neue Datenmigration noch Änderung des Speicherschemas.

Die bisherigen Zusammenführungs- und MC-Prüfungen prüfen weiterhin ihre originalen historischen Snapshots. Die neue Prüfung kontrolliert zusätzlich den gesamten aktuellen Bestand und alle erlaubten Abweichungen. Die alten Prüfberichte wurden nicht auf neue Inhalte umgeschrieben. Die gemeinsamen reinen Belegprüffunktionen wurden in ein kleines Skriptmodul ausgelagert, um doppelte Validierungslogik zu vermeiden; die bisherige API bleibt kompatibel. Der Build ruft das neue Gate automatisch über den bestehenden Nachlese-Validator auf.

In der App wurden ausschließlich Build-ID und die nun sonst unzutreffende Aussage „Fragen bleiben unverändert“ im Prüfstatus aktualisiert. Keine neuen Produktfunktionen, kein Redesign, kein Frameworkwechsel und keine zusätzlichen Abhängigkeiten.

## Ausgeführte QA

Die folgenden Angaben beziehen sich auf den finalen Build mit den unten angegebenen Hashes; Rohdaten und Screenshots liegen im ZIP. Alle personenbezogenen Testdaten sind synthetisch.

| Prüfung | Ergebnis |
|---|---:|
| Node-Tests einschließlich vorhandener Stabilisierung und sieben neuer Regressionstests | 126 PASS, 0 FAIL, 0 übersprungen |
| Kernabläufe im Browser | 12 PASS |
| Import-/Entwurfs-/Weg-Stabilisierung im Browser | 12 PASS |
| Reader-/Kapitelquiz-Integration | 17 PASS |
| NT-Finalmaster im Browser, 90 tatsächlich beantwortete Fragen | 24 PASS |
| Echter Nachlese-Bestand auf 320/390 Pixeln | 36 PASS |
| Synthetische Auswahl-/Fehler-/Fallback-Fixtures | 6 PASS |
| Alle 58 geänderten Datensätze auf 390 Pixeln, acht kritische/lang ausgeführte Fälle auf 320 Pixeln | 70 PASS, 66 Frage-/Viewport-Kombinationen |
| Vorhandene Service-Worker-Regression | 3 PASS |
| Tatsächlicher NMC1→NMC2-Workerwechsel auf derselben lokalen Origin | 6 PASS |
| **Browser-/Worker-Prüfpunkte insgesamt** | **186 PASS** |

Die semantischen 208 Einzelprüfungen, 1.664 Zitatprüfungen und 2.314 Strukturprüfungen sind keine zusätzlichen Browser-Testfälle. Browser-Fallback-Fixtures sind ausdrücklich synthetisch; der finale reale Bestand enthält keine offenen MC-Fälle. Beim geänderten realen Bestand wurde jede neue Frage mit richtiger und falscher Auswahl, Erklärung, Fokus, Tastaturbedienung und Erhalt des gespeicherten Zustands geprüft. Geschichten-Einstieg, unveränderte markierte Fragen, Reflexionen und Export/Import sind ebenfalls enthalten. Kein ungeprüfter Anspruch einer Vollinteraktion mit allen 2.314 Fragen.

Zusätzlich bestanden: Excel/JSON-Abgleich, vollständige ID-/Buch-/Kapitel-/Referenzprüfung, NT-Masterprüfung, historische Materialisierungsprüfung und vollständiger Vergleich der vom Browser geladenen Nachlese-Datei mit der Quelle. Viewports 320 × 568 und 390 × 844 wurden für die neuen Inhalte geprüft, 375 × 667 und 430 × 932 zusätzlich in den bestehenden Stabilisierungssuites; helle/dunkle Darstellung, lange Texte, Touchziele, Fokus, Zoom und reduzierte Bewegung sind automatisiert abgedeckt. Screenshots wurden zusätzlich visuell kontrolliert. Das ist kein Ersatz für Safari oder VoiceOver.

Der echte Update-Test verwendet einen vorher vollständig installierten NMC1-Worker mit 260 Kapitel-Fortschrittsschlüsseln, Storyfortschritt, einer V3→V5-Migration, Journal-/Wegbezug, Bibelmarkierung und offenem Entwurf. Der Serverinhalt wird auf derselben Test-Origin ersetzt; NMC2 wird erst nach Nutzeraktion aktiviert. Speicherung bleibt bei Aktivierung und Offline-Reload bytegleich. Nach absichtlichen Reader-Aktionen werden nur die erwarteten Änderungen von Leseposition und Aktivitätsereignissen zugelassen; Journal, Wege, Fortschritte, alte Ereignisse, Markierungen, Entwurf und Migrationsdaten bleiben erhalten. Der Entwurf lässt sich anschließend offline fortsetzen und speichern, Kapitelquiz bis Offenbarung funktioniert ebenfalls offline.

## Reproduzierbarer Build

Zwei unabhängige Ausgabeordner ergeben **321 bytegleiche Dateien**. Jede Datei wurde zusätzlich gegen die Release-Integrität geprüft, außerdem der Content-Hash gegen die unveränderten Quell-Dateihashes. `REPRODUZIEREN.md` enthält Befehle und Voraussetzungen.

- Build-ID: `FP4-20261016-G-STABLE1-NMC2`
- Build-Hash: `8414b3115d100d191ec18812e2c6caeb7264e18e91d09684c35c14fbaf3b1ae8`
- Content-Hash: `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309`
- SHA256 Nachlese-Datei: `fee7b3b4c549baf9e4cdd90efeece573933e37ebaa7d551860708ffae4e8efd0`

Git-Commit, Build-Hash und Content-Hash sind verschiedene Nachweise. Der ZIP-Lieferbeleg nennt zusätzlich den abschließenden Branch-HEAD; der ZIP-Prüfsummenindex schützt Bericht, Kandidat und vollständig mitgelieferten NMC1-Vorgänger.

## Verbleibende Risiken und Go/No-Go

**Keine reproduzierbaren technischen P0-/P1-Blocker in den ausgeführten Tests.** Die redaktionellen Fehler der 56 Ergänzungen und die beiden unvollständigen Übersetzungsverweise sind behoben. Die 150 Heuristiktreffer wurden nicht als Fehler aufgebläht.

Offen sind echter iPhone-Safari-Betrieb, installierte iPhone-PWA, reales iOS-Update auf einer isolierten HTTPS-Origin, VoiceOver, Betriebssystem-Speicherdruck und Entzug lokaler Webdaten. Diese Punkte sind **OFFEN, nicht bestanden**. Es wurde weder eine öffentliche Preview noch eine neue Netlify-Veröffentlichung erstellt. Deshalb gibt es keinen neuen Preview-Link; localhost ist keine freigegebene Testseite. Die schrittweise Geräteanleitung steht in `GERAETEABNAHME.md`.

Die 2.106 unveränderten Bestandsfragen wurden in dieser Phase nicht erneut vollständig redaktionell geprüft; ihr bisheriger Nachweis und ihre Bytekontinuität bleiben erhalten. Modellgestützte Fachprüfung und automatisierte Zitatvalidierung ersetzen keine separat beauftragte menschliche theologische Schlussabnahme. Die vier dokumentierten Übersetzungsvarianten verdienen bei einer solchen Abnahme einen gezielten Blick, sind aber keine belegten technischen Blocker.

**Empfehlung: gezielte Geräteabnahme dieses Kandidaten.** Kein grundlegender Umbau und keine neue Inhaltszusammenführung. Nach bestandenem Geräte-Gate kann über eine gesonderte Produktionsfreigabe entschieden werden. Main und die bisherige Produktion bleiben unverändert.
