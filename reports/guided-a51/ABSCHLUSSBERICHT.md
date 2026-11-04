# FaithPath V4 – Geführte Schritte und A5.1

Stand: 4. November 2026. **GO zur isolierten QA und menschlichen Abnahme. Keine Produktionsfreigabe.**

Branch: `integration/faithpath-guided-steps-a51-20261104`.
Geprüfter Runtime-Commit: `ea734d5431b1b6069d7302efdc6574fcfeb95191`.
Build: `FP4-20261104-G-GUIDED-A51-QA1`.

## Ausgangslage und gezielte Zusammenführung

| Quelle | Tatsächlicher Stand | Ergebnis |
|---|---|---|
| First Seed | `ef8d96d7126fb79661467feaaa17044874471d4d` | Geeignete geprüfte App-Basis; echtes Onboarding, sechs Szenen, Entwürfe, reale Journal-/Weg-Verknüpfungen und symbolische Pflanzung |
| A5.1 | `0e02d5329a87cdcdfc52694d74c610da2975b357` | Nur Runtime und 21 responsive WebPs übernommen; App-Dateien der Studie waren gegenüber First Seed unverändert |
| NT-Integration | `6f96ec8be376af3b0de03094a5052ae909054658` | Bereits Vorfahr der Basis; 1.300 freigegebene Fragen bleiben unverändert |
| Phase 7 | `7d4441caf5112c04b8b6af7ddec8c4ee49d0c63a` | Bereits Vorfahr der Basis; Speicher-, Backup-, Modul- und Wartungsarbeiten enthalten |
| AT-Quellwiederherstellung | `dcfd5adb447b5adc1f93e3347f57ca386197c22f` | Nur Branchmetadaten gelesen; keine AT-Integration |
| main | `d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3` | Älterer Stand, keine geeignete aktuelle App-Basis; unangetastet |

Die bereits enthaltene App umfasst Heute, beide Bibelübersetzungen, Kapitelquiz, Mein Weg, Journal, bestehende Geschichte und Rückblicke, Entdecken, vier Verbunden-Themes sowie die integrierte bisherige Nachlese. Vorhandene Nachlese-/AT-Bestände wurden nicht verändert; laufende unfreigegebene AT-Arbeit wurde nicht übernommen. Kein pauschaler Branchmerge. Die Abstammung und unveränderten Daten sind in `evidence/integration-audit.json` dokumentiert.

## Gelieferte Funktionen

- Alle 18 Lebensthemen besitzen drei unterschiedliche praktische Anregungen: klein, konkreter Versuch, Reflexion. 17 Kategorien sind abgedeckt; zusätzliche Kategorien wie Gebet, Bibel, Gemeinde und eigener Bereich haben eigene Texte. Für die Lebensthemen gibt es kuratierte Alternativen bei bereits wortgleich verwendeten Vorschlägen.
- Derselbe lokale Katalog und dieselbe Auswahlhilfe dienen First Seed, neuen Wegen und der bestehenden Schrittverwaltung. Keine neue Hauptnavigation, kein zweites Journal und keine Cloud-KI.
- Eine Anregung öffnet bearbeitbaren Text. Übernahme, Anhängen und Verwerfen sind bewusst getrennt. Gefüllte eigene Worte werden erst nach zusätzlicher ausdrücklicher Bestätigung ersetzt. Freies Schreiben bleibt direkt erreichbar. Formulierungsanfänge und „Schritt kleiner machen“ sind freiwillig.
- Auch bearbeitete, noch nicht übernommene Anregungen bleiben im vorhandenen Entwurf über Pause und Wiederöffnung erhalten. Ein Entwurf wird nicht als persönliche Entscheidung ausgegeben. Erst die Gesamtbestätigung speichert den Weg.
- Die sechs bestehenden First-Seed-Szenen und ihre gespeicherten Indizes bleiben erhalten; Auswahl und Bearbeitung stehen gemeinsam im Schrittbereich, danach folgt die Gesamtprüfung. Einführung und direkter Bibelzugang bleiben verfügbar.
- Rückblicke bieten vier aufklappbare Fragen und die fünf gewünschten Positionen. Unsicherheit und Ruhen sind zulässig. Nur ausdrücklich bestätigte Veränderung erzeugt Entwicklung; Schrittabschluss, Lesen, Quiz und Vorschlagsauswahl tun das nicht.
- Die bestehenden Wege zeigen Anlass, damaligen Schritt und letzten tatsächlichen Rückblick zusammen mit dem Zugang zu einem heutigen Gedanken. Die vorhandene Geschichte und Journalverknüpfung bleiben die einzige Historie.
- A5.1 ist in Heute, Mein Weg, Baumdetail und Einstieg über einen Adapter integriert: sieben Motive, örtlicher Dauerwind, kurze Überblendung, responsive Bilder, ruhender Fallback, Reduced Motion, Sichtbarkeitspause, Qualitätsregelung und Ressourcenabbau. Dialoge pausieren den darunterliegenden Baum. Vollständiger Bildausfall bietet eine verständliche Meldung mit erneutem Ladeversuch.

## Prüfungen und echte Ergebnisse

| Prüfung | Ergebnis / Beleg |
|---|---|
| Vollständige automatisierte App-Regression einschließlich neuer Tests | **257 bestanden, 0 Fehler, 0 übersprungen**; `evidence/regression.log` |
| Freigegebene NT-Fragen | **1.300 / 260 Kapitel / 27 Bücher**, Quellenvalidator bestanden; `evidence/nt-quiz.log` |
| Reale NT-Browserabläufe | **24 Prüfgruppen bestanden**, keine Seitenfehler; einschließlich 18 Kapitelstichproben, Pflicht-IDs, Offline und großer Schrift; `evidence/nt-browser.json` |
| Schema und geschützte Verträge | Schema V5, sieben bestehende Schlüssel und 174 geschützte Dateien bestanden; `evidence/contracts.log` |
| Inhalte und Kerndatenlogik | Bytegleich zur Basis: `data/`, `content.js`, `domain.js`, `store.js`, Journaltransaktionen, Draft-CAS und Stufenbedeutungen; `evidence/integration-audit.json` |
| Build und reproduzierbarer Export | Zwei Builds **bytegleich**, 281 Dateien, 132 kanonische Bibeldateien; `evidence/build-integrity.log` |
| Modulgraph / Lint | Kein Importzyklus oder fehlendes Modul; 0 Lintfehler, 5 bestehende unveränderte Warnungen |
| Neue persönliche Abläufe | Vorschlag → Änderung → bewusste Übernahme → Speicherung/Wiederöffnung; vorhandene erledigte Schritte erhalten; nicht bestätigter und bestätigter Rückblick getrennt; `evidence/browser/results.json` |
| First Seed mit Vorschlag | Bearbeitete unbestätigte Anregung über Pause fortgesetzt; eigener finaler Text gespeichert; keine Entwicklung erzeugt; Browserbericht |
| Freie Eingabe / kompletter First-Seed-Weg | **7 End-to-End-Prüfgruppen bestanden**, einschließlich beider Übersetzungen, idempotenter Speicherung, Wiederöffnung, echtem Backup-Download und zweistufiger Wiederherstellung; `evidence/first-seed/results.json` |
| Mobile Matrix | **40 Editorfälle plus 160 Routenkontrollen**, 320/375/390/430/1280 Pixel, vier Themes, normal/200-%-Schrift; kein horizontaler Überlauf; Browserbericht (dessen Gesamtzähler 200 Fälle umfasst) |
| Alle Baumstufen | Sieben Domainzustände im tatsächlichen App-Build gerendert; Bildvarianten per Hash geprüft |
| Lebenszyklus | Tatsächliche Offscreen-Intersection und Dialog stoppen RAF und Frames; Wiederaufnahme, endliche Überblendung und Abbau bestanden; `evidence/lifecycle.json` |
| Reduced Motion / Bildfehler | Live-Umschaltung, Pause/Fortsetzen und Ausfall aller Bildvarianten geprüft; Browserbericht |
| Zugänglichkeit automatisiert | **16 Axe-Scans**, vier Themes × Editor/Rückblick/Baum/Einstieg, keine automatisch gemeldeten A/AA-Verstöße; `evidence/accessibility.json` |
| Speicherfehler | **4 Fehlergruppen bestanden**: Quota/Navigationsschutz/Export, beschädigte und fremde Entwürfe, ungültige Eingabe, fehlender und verspäteter Bibeltext; `evidence/faults/results.json` |
| Offline und echtes Update | **4 Updategruppen bestanden**: alte vollständige Version; abgelehntes unvollständiges Update; ausdrückliche Aktivierung; neue Offline-Version mit unveränderten Speicherschlüsseln und fremdem Cache; `evidence/update/results.json` |
| Tatsächliches Offline-Laden | Vollständiger First-Seed-Weg bei geschlossenem lokalem TCP-Listener, nicht nur simuliertem Offline-Schalter; `evidence/first-seed/results.json` |

Die NT-Validatorausgabe `changed_fields: 6151` beschreibt den bereits vorhandenen historischen Import gegenüber dessen ursprünglicher Quelle, **keine Änderung durch diese Integration**. Der Validator lief ausschließlich mit `--check`; die Integrationsprüfung bestätigt unveränderte Inhaltsdateien.

Der Build-Hash lautet `5c9fba76d40565e4be2a7b99470f2639a1bd2949c85ccb037367057f7e5cc799`, der unveränderte Content-Hash `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309`. Das QA-Paket enthält die vollständige Offline-App einschließlich der optimierten Baumbilder, aber keine Bildquellen oder Studienvideos im App-Cache.

## Screenshots und Prüfgrenzen

Die Übergabe enthält reale Screenshots der vier Themes für Einstieg/Schritt-Hilfe, bestehenden Weg, Rückblick und reifen Baum unter `screenshots/`. Zusätzliche Zustands- und 200-%-Bilder liegen unter `evidence/browser/`, der vollständige persönliche Ablauf unter `evidence/first-seed/`.

Einige schnelle isolierte Layoutfälle blockieren absichtlich Service Worker; auf ihren Rohscreenshots erscheint daher die ehrliche Offline-Vorbereitungswarnung. Diese Bilder belegen Layout und Textschutz, nicht Offlinebereitschaft. Die gesonderten Übergabe-Screenshots verwenden die regulär installierte vollständige App. Axe verwendet nur für seine Diagnose einen CSP-Bypass; die funktionalen Hauptabläufe behalten die tatsächliche CSP. Es werden ausschließlich synthetische Profile und Texte verwendet.

Testfehler durch falsche Testannahmen wurden korrigiert: geschlossene Dialoge bleiben im DOM (auf „hidden“ statt Entfernung warten); Reduced Motion wird asynchron zugestellt; nach „Pause“ muss die erfolgte Navigation abgewartet werden; beim Update muss der tatsächliche Controllerwechsel vor weiterer Navigation abgewartet werden. Die Produktion wurde dafür nicht verändert. Der alte SVG-spezifische Bildtest wurde durch die Prüfung der tatsächlich integrierten A5.1-Assets ersetzt.

## Offene Risiken und Freigabe

- **Menschliche Abnahme offen.** `NUTZERTEST.md` enthält Aufgaben und Bogen für zehn Personen. Ziel: mindestens 8/10 verstehen den Kern und beginnen selbstständig einen Weg, visuelle Bewertung im Mittel mindestens 4/5. Es wurden keine Teilnehmer oder Ergebnisse erfunden.
- **Echte iPhone-/Safari-/installierte PWA-/VoiceOver-/Temperatur-/Akkunachweise offen.** Die vorliegende Integration wurde mit Linux/Chromium geprüft. Desktop-Emulation und Axe ersetzen diese Nachweise nicht. Firefox/WebKit wurden für diese Integration nicht als bestanden ausgegeben.
- Lokale unverschlüsselte Speicherung und die Notwendigkeit eigener Exportdateien bleiben bestehen; keine Cloud-Sicherung oder automatische Synchronisierung.
- Die Bilder bilden eine illustrierte Familie, kein identisches 3D-Skelett. Es gibt örtliche zweidimensionale Windverformung und Überblendung, keine simulierte Wachstumsphysik. Die Ruhe und Ablenkung müssen reale Nutzer bewerten.
- „Kleiner machen“ ist kuratiert und themenbezogen, keine individuelle Deutung des eingegebenen Textes. Benutzte frei umformulierte Schritte werden nur bei exakter Textgleichheit als bereits benutzter Vorschlag erkannt; es gibt bewusst keine semantische Textanalyse.

**Empfehlung: GO für diese isolierte QA-Übergabe und den vorbereiteten Nutzertest; NO-GO für Merge/Produktion bis zur ausdrücklichen nachfolgenden Entscheidung und den erforderlichen realen Nachweisen.** Es erfolgten kein Merge nach main, kein Deployment und kein Überschreiben einer bestehenden QA- oder Produktionsseite. Der Integrationsbranch enthält Quellcode, Tests und Nachweise; die selbstständig startbare QA-Version wird separat geliefert.
