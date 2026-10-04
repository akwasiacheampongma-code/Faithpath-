# FaithPath Final Product Fix – Fehlerbericht

Stand: FP4-20261004-G-PRODUCT1

Ausgangsbuild: FP4-20261003-G-PREMIUM-ICON2
Production: https://zesty-rolypoly-d11fff.netlify.app

Lokales Gate: PASS. Live-Gate: PASS. Finale Abnahme: FAITHPATH_PRODUCT_BASELINE_PASS.

Alle Fälle wurden zuerst reproduziert. Keine spekulativen Produktänderungen. Keine offenen P0/P1; keine offenen bestätigten P2 im Prüfbereich. Reale iPhone-/Safari-/VoiceOver-Abnahme bleibt ein getrenntes Device Gate.

## FPF-14 · P2 · Öffentliches QA-Portal / lokaler Fund

ID: FPF-14

Priorität: P2

Bereich: Öffentliches QA-Portal / lokaler Fund

Reproduktion: Neue Berichtsseiten mit vorbereitetem Service Worker öffnen.

Ist: Der Browser fragte ohne explizites Icon eine fehlende favicon.ico-Datei an; eine Console-404 entstand.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Die neuen statischen QA-Seiten enthielten keinen Icon-Link.

Fix: Bestehendes App Icon 2 ausdrücklich im QA-Head referenzieren. Keine App- oder SW-Änderung.

Lokaler Test: PASS – Native ZIP/PDF-Downloads, SHA256, reale HTML/JSON/PNG und Rückkehr zur Offline-App geprüft; vollständige Wiederholung mit null Console/Load/Page Errors.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-01 · P1 · Entdecken / Geschichten

ID: FPF-01

Priorität: P1

Bereich: Entdecken / Geschichten

Reproduktion: Geschichtenfilter und Suche auf Production öffnen.

Ist: Gemeinsamer Katalog und alte FaithPath-Liste liefen parallel.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: ui.stories blieb die alte Bibliothek; der Merge wurde separat gerendert.

Fix: Ein sichtbarer Katalog aus dem geprüften Flow; Kapitelübungen bleiben separat. Alte Story-Routen öffnen ihre exakt zugeordnete Geschichte.

Lokaler Test: PASS – 436 kanonische Storylinks, 260 separate Kapitelübungen; vollständige ID-Coverage und alte Route story/1 geprüft.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-02 · P1 · Gemischter Frageflow

ID: FPF-02

Priorität: P1

Bereich: Gemischter Frageflow

Reproduktion: NS-0113 und N-/FP-Fragen öffnen.

Ist: Einzelne Fragen hatten keinen Zähler für den gesamten Ablauf und keine durchgehende Navigation.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Die bestehende Quellfragen-Ansicht kannte nur die einzelne ID.

Fix: Position und vorherige/nächste Frage ausschließlich aus den bestehenden flow_items ableiten.

Lokaler Test: PASS – Reine Nachlese NS-0001, gemischt NS-0113 (6 Items), FaithPath-only FP-STORY-0391 (5 Items): jedes Item und kompletter Zähler geprüft.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-03 · P1 · FaithPath-Quellfrage

ID: FPF-03

Priorität: P1

Bereich: FaithPath-Quellfrage

Reproduktion: Bei einer FP-Frage eine falsche Antwort auswählen.

Ist: Die richtige Antwort wurde im bisherigen Quellrenderer nicht zusätzlich markiert.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Die alte Klassenzuweisung markierte nur die ausgewählte Option.

Fix: Die vorhandene richtige Option kennzeichnen, vorhandene Erklärung anzeigen, Auswahl nach Antwort deaktivieren. Keine Antwortdaten ändern.

Lokaler Test: PASS – MCQ, richtige Antwort, Erklärung und Fokus geprüft; Nachlese bleibt Antwort zum Aufdecken.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-04 · P1 · Journal Referenzsuche

ID: FPF-04

Priorität: P1

Bereich: Journal Referenzsuche

Reproduktion: Alten Eintrag mit ref={book:JHN,chapter:3,from:1} ohne label nach Johannes 3,1 suchen.

Ist: Sichtbare gültige Referenz wurde nicht gefunden.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Suche verwendete ausschließlich ref.label.

Fix: Buchname, Code und vorhandene Aliasnamen aus strukturierten Daten ableiten; Normalisierung von Leerzeichen und Gedankenstrichen; numerische Grenzen schützen.

Lokaler Test: PASS – Johannes 3,1 / Joh 3,1 / JHN 3,1 / Groß-Klein / Bereiche / gespeichertes Label / kein Ref / Reload / Offline / 105 Einträge geprüft. Vers 1 matcht nicht Vers 10.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-05 · P1 · Erstnutzer / Orientierung

ID: FPF-05

Priorität: P1

Bereich: Erstnutzer / Orientierung

Reproduktion: Onboarding bis Orientierung, dann Anfängerangebot suchen.

Ist: Anfängerangebote standen unter allgemeinen Wegen. Der erste Today-Fix allein erreichte den Onboarding-Zielscreen nicht.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Allgemeine Wege waren zuerst sortiert; Orientierung hatte keinen frühen Anfängerlink.

Fix: Bestehendes guide/start auf Today und Orientierung früh erreichbar machen. Anfängerangebote für Nutzer ohne Verlauf zuerst; Returning-Priorität erhalten.

Lokaler Test: PASS – Onboarding → bestehender Anfängerweg → Bibel → erster gespeicherter Gedanke PASS; Returning-Nutzer ohne dominanten Anfängerblock PASS.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-06 · P1 · Journal 320 / 200%

ID: FPF-06

Priorität: P1

Bereich: Journal 320 / 200%

Reproduktion: 320×568 mit 200% Root-Schrift und vorhandenem Journal.

Ist: Festhalten konnte am letzten Zeichen zerbrechen.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Überschrift und Plus-Aktion konkurrierten um die schmale Zeile.

Fix: Flex-Reflow; Plus-Aktion darf umfließen; natürliche Wortgrenzen, keine kleinere Schrift, keine feste Höhe.

Lokaler Test: PASS – Range-Geometrie für das komplette Wort Festhalten und Screenshot geprüft; kein horizontaler Overflow.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-07 · P1 · Mein Weg

ID: FPF-07

Priorität: P1

Bereich: Mein Weg

Reproduktion: Weg mit zwei offenen Schritten öffnen.

Ist: Mehrere Schritte standen gleichwertig im hervorgehobenen nächsten-Schritt-Bereich.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Alle offenen Schritte wurden in derselben Surface gerendert.

Fix: Nur den bestehenden ersten offenen Schritt dominant rendern. Weitere Schritte sichtbar, unverändert geordnet, mit allen bisherigen Aktionen darunter.

Lokaler Test: PASS – Genau eine .current-path-step; weitere offene Schritte sichtbar; Prioritätswechsel, Erledigen, Bearbeiten und Verwaltung regressionsgeprüft.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-08 · P2 · Journal Dichte

ID: FPF-08

Priorität: P2

Bereich: Journal Dichte

Reproduktion: Journal bei 390×844 mit persönlichen Einträgen öffnen.

Ist: Erster Eintrag begann bei y=451,17 px.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Unnötiger Abstand in Header, Werkzeugzeile und erstem Monatsblock.

Fix: Nur oberen Leerraum reduzieren; Lesetext, Monatsgruppen, Divider und Metadaten erhalten.

Lokaler Test: PASS – Erster Eintrag y=408,78 px: 42,39 px früher bei gleicher sichtbarer Testdatenstruktur.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-09 · P2 · Reader Dichte

ID: FPF-09

Priorität: P2

Bereich: Reader Dichte

Reproduktion: Johannes 3 bei 390×844 öffnen.

Ist: Erster Vers begann bei y=460,39 px.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Zusätzliche vertikale Abstände bei Zurück-Link, Auswahl, Überschrift und Reflexionseinstieg.

Fix: Nur diese Abstände reduzieren; Auswahl, Schrift, Kontexte, 44px-Touchflächen und Palette erhalten.

Lokaler Test: PASS – Erster Vers y=412,39 px: 48 px früher. 320/390/768/1440, 200%, Reader-Regression PASS.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-10 · P2 · Meine Geschichte / Damals → Heute

ID: FPF-10

Priorität: P2

Bereich: Meine Geschichte / Damals → Heute

Reproduktion: Explizit mit Weg und Bibel verknüpften Gedanken und Rückblick öffnen.

Ist: Die Beziehungen waren in der Timeline teilweise nur als unauffälliger Wegtext erkennbar.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Timeline-Rendering stellte gespeicherte Beziehungen nicht als nutzbare Kontextlinks dar.

Fix: Gültige vorhandene Weg-/Bibelbeziehungen als kompakte Links; Ursprungskontext im bestehenden Paar. Keine neuen Paare oder Inferenz.

Lokaler Test: PASS – Exakte Links, gelöschte/archivierte Wege und bestehende Continuity-Negativfälle geprüft. Keine Phantompaare.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-11 · P2 · Daten & Backup

ID: FPF-11

Priorität: P2

Bereich: Daten & Backup

Reproduktion: Als Vielschreiber die Datensicherung öffnen.

Ist: Lokale Speicherung und Wiederherstellung waren nicht ausdrücklich von automatischer Synchronisation abgegrenzt.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Produkttext blieb allgemein.

Fix: Gerätelokalität, manuellen Export, fehlende automatische Gerätesynchronisation und Ersetzen des angezeigten Stands beim Import klar beschreiben.

Lokaler Test: PASS – Text und tatsächlicher Export/Import inklusive Notizrollen, Journal-Löschung und Verknüpfungen geprüft.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-12 · P1 · Inhalts-/Prüfstatus

ID: FPF-12

Priorität: P1

Bereich: Inhalts-/Prüfstatus

Reproduktion: Production Inhaltsstatus mit dem vorhandenen Prüfkatalog vergleichen.

Ist: Live zeigte 1300 Kapitelquiz-Fragen als noch ungeprüft.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: UI verwendete historische statische Prüfvermerke statt des inzwischen vorhandenen finalen Freigabenachweises.

Fix: Anzeige mit der dokumentierten Freigabe synchronisieren und deren Umfang benennen. Keine neue theologische Prüfung behaupten.

Lokaler Test: PASS – Original-PDF-SHA stimmt mit source_documents überein. Alle 1560 Einzelzeilen BESTANDEN / JA / 0. Prüfstandard S.54. Chapter Quiz Editorial Status VERIFIED.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT

## FPF-13 · P2 · FP-Quellfrage / lokaler Integrationsfund

ID: FPF-13

Priorität: P2

Bereich: FP-Quellfrage / lokaler Integrationsfund

Reproduktion: Neuen Flow per Tastatur beantworten und Antwortschrift mit bestehenden MCQ-Controls vergleichen.

Ist: Ein erster Implementierungsstand nutzte versehentlich den Meta-Stil für Antworttext; Fokus führte nicht gezielt zur Rückmeldung.

Soll: Der korrigierte Zustand ohne Änderung persönlicher Daten oder fachlicher Inhalte.

Ursache: Ein einzelnes span traf den bestehenden ersten-Span-Selektor für Antwortbuchstaben.

Fix: Bestehendes MCQ-Muster mit Buchstabe + Antwort verwenden; Fokus zur vorhandenen Erklärung setzen.

Lokaler Test: PASS – Vorher 14px Antwort zu 16px Control; nachher gleiche Leseskala. Enter-Antwort und erreichbare Folgeaktion geprüft. Nie als fehlerhafter Stand veröffentlicht.

Live Test: PASS – Live-Produktflow, betroffene Seite und ergänzende Regression im veröffentlichten identischen Runtime-Build geprüft.

Status: BEHOBEN UND LIVE VERIFIZIERT
