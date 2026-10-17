# Phase 6B – Integration erst nach Designauswahl

## Empfehlung für die technische Entscheidung

Vanilla JavaScript beibehalten. Die vorhandene App besitzt bereits getrennte View-/Modellmodule, geprüfte Speichertransaktionen und einen funktionierenden Offline-Bestand. Der gestalterische Gewinn benötigt weder React noch eine Datenmigration. Die isolierte Galerie verwendet absichtlich klassische Scripts: ohne Buildsystem, Modul-CORS oder CDN. Das ist eine Entscheidung für einen leicht öffnenden Vergleich, keine Empfehlung, globale Demozustände in die echte App zu übernehmen.

Prototypstruktur: `model.js` enthält pure Demooperationen und Eingangsvalidierung; `components.js` wiederverwendbare SVGs/Links/Baumdarstellung; `app.js` die fünf Renderfunktionen und Demoereignisse; `app.css` semantische Tokens, gemeinsame Komponenten und drei eigenständige Kompositionen; `sword.js` eine isolierte Präsentationskopie des vorhandenen Renderers. `scripture.js` und `catalog.js` sind getrennte öffentliche Inhaltsprojektionen, niemals persönliche Daten. `gallery.js` besitzt nur Vergleichssteuerung und iframe-Wechsel. Keine Produktionsimporte oder Speicherzugriffe zur Laufzeit.

## Geschützter Funktionsvertrag

| Bestehender Bereich | Visueller Integrationsort | Unveränderbarer Vertrag |
|---|---|---|
| Heute / Orientierung / letzte Lektüre | `today-view.js`, Navigation | Personalisierung aus bestehendem Modell, keine erfundenen Empfehlungen |
| Reader / Übersetzungen / Kapitel / Deep Links | Reader-View, bestehender Router | Beide vollständigen Übersetzungen, Verssegmentierung, alle Bücher und Kapitel |
| Markierungen / Farben / Notizen | Reader-Werkzeuge / Markierungsübersicht | Vorhandene IDs, Referenzen, Entwurfsschutz und Transaktionen |
| Geschichten / Nachlese / NT-Quiz / Sammlung | Story-Views / Discover | 436 aktive Geschichten, 2.314 N-Fragen und 1.300 Kapitelquizfragen, bestehende IDs und richtige Antworten |
| Themen / geführte Wege / Suchfilter | Entdecken, sekundäre Navigation | Vollständiger Index, alle Ziele und Back-/Deep-Link-Verhalten |
| Wege / Schritte / Archiv / Wiederherstellen | Pfad-Views | Beziehungen, Bearbeiten/Löschen, keine automatische Entwicklung aus Schrittabschluss |
| Olivenbaum / sieben Stufen / Zweige | Wegübersicht und persönliche Chronik | Vorhandene Ableitung ausschließlich aus ausdrücklich bestätigten Entwicklungen |
| Bibelreise / Schwert | Reader und Bibelreise | Keine Zählung beim Öffnen, keine Doppelzählung, historische Ereignisse unverändert |
| Journal / Rückblicke / Damals-heute | Journal-/Rückblick-Views | Original-IDs und historische Snapshots, keine erfundene Bewertung |
| Freiwillige Erinnerungen | Bestehende Einstellungen / Eintragsaktionen | Opt-in, verständliches Abschalten, kein Streakdruck |
| Export / Import / Backupprüfung | Bestehende Datensicherungsansichten | Validatoren, Vorschau, Zwei-Schritt-Bestätigung, atomare Wiederherstellung |
| Vier Themes / Textgröße / Accessibility | Semantische Tokens / gemeinsame Controls | Alle Themes, Zoom und Screenreader; keine versteckten Funktionen |
| Offline / Installation / Aktualisierung | Bestehender Service Worker / Build | Vollständiger Precache, kontrollierter Updatepfad, keine Datenmigration |

Die Demo ist ausdrücklich keine vollständige Ersatzimplementierung dieses Vertrags. Beispielsweise werden nur vier Kapitel und eine vollständige Fragenstrecke interaktiv gezeigt. Die echte App behält sämtliche Funktionen. In 6B ist eine vollständige Routeninventur anhand des dann aktuellen HEAD Pflicht; diese Tabelle ersetzt keine ausführbare Routenprüfung.

## Getrennte Arbeitspakete und realistischer Aufwand

Schätzung für **eine** ausgewählte Richtung, einen erfahrenen Frontend-Entwickler, mit punktueller Design-/QA-Unterstützung. Kein Frameworkwechsel, kein neuer Inhalt. Unsicherheit durch echte Geräte und bestehende Selektorabhängigkeiten.

| Paket | Aufwand | Abnahme |
|---|---:|---|
| 1. Gewählte Richtung präzisieren, Tokens, Inventar, Rechte der Altassets klären | 2–3 Personentage | Farbsystem und Typografie für vier Themes, keine fehlende Funktion |
| 2. Gemeinsame Navigation und Heute | 3–4 PT | Nächster Schritt erreichbar, Tree sichtbar, alle bisherigen Ziele/Deep Links |
| 3. Reader, Verstehen und Entdecken | 4–6 PT | Vollständige Bücher/Übersetzungen, Vers-/Notizaktionen, Quizstatus und Suchpaginierung |
| 4. Wege, Baum, historische Verknüpfungen | 4–5 PT | Alle sieben Zustände, Archive, echte Quellen, unveränderte Fortschrittsregeln |
| 5. Journal, Rückblicke, freiwillige Erinnerungen und Backupoberfläche | 3–4 PT | Schreibfokus, sichere Entwürfe, Zwei-Schritt-Import und Referenzerhalt |
| 6. Gemeinsame visuelle QA, Accessibility, Offline-/Update- und Geräteabnahme | 4–6 PT | Phasen-1–5-Regressionen, alle Themes, reale iPhone/Safari/VoiceOver-Prüfung |
| **Gesamt** | **20–28 PT** | **Etwa 4–6 Entwicklungswochen; Gerätefeedback kann zusätzliche Zeit benötigen** |

Diese Schätzung umfasst kein neues Backend, keinen Fragenumbau und keine neue Grafikproduktion. Ein kleinerer Pilot aus Heute, Navigation und Reader ist nach etwa 8–12 PT beurteilbar, aber noch kein fertig integriertes Release.

## Branch- und Konfliktstrategie

Nach Auswahl neuer, ausdrücklich freigegebener Integrationsbranch vom dann verifizierten integrierten App-HEAD. Kein pauschaler Merge der gesamten Galerie in den App-Router. Tokens und Komponenten pro Paket gezielt übertragen, getrennte Commits, nach jedem Paket passende Regressionen. Galerie als Referenz erhalten.

| Dateibereich | Konfliktrisiko bei späterer Parallelentwicklung | Vorgehen |
|---|---|---|
| `styles.css`, Theme-/Navigations-CSS | Hoch: mehrere Phasen ändern Hierarchie/Abstände | Tokens zuerst, globale Selektoren klein halten, vier Themes vergleichen |
| `src/app.js` / Ereignisdelegation / Router | Hoch | Datenaktionen und bestehende Deep Links erhalten; Renderänderungen nicht mit Storeänderungen mischen |
| Reader-, Story-, Discover-Views | Mittel | Originaldaten und IDs unangetastet, Navigation zu konkreten Referenzen testen |
| Journal-/Review-/Backup-Views | Hoch | UIUX45-Transaktionsgrenzen und Snapshotverknüpfungen golden testen |
| Store / Migration / Fragen-/Bibeldaten | Kein geplanter Eingriff | Jede unerwartete Änderung stoppt das Paket zur Klärung |
| Service Worker / Cache-Manifest / Build | Mittel | Versionswechsel nur im Integrationskandidaten; alte-origin → neue-origin auf derselben isolierten QA-Origin prüfen |

Kein Merge auf main und kein Deploy ohne gesonderte Freigabe. Ein Browser-Emulator ersetzt kein physisches Gerät.

## Bekannter Altbefund – gesondert behandeln

Das UIUX45-Code-Review beschreibt einen kleinen Backup-Lifecycle-Fehler: Ein verzögertes `File.text()` kann beim Wegnavigieren und Zurückkehren auf denselben Hash eine alte Backup-Vorschau wieder öffnen. Kein belegter Bypass der zweiten Bestätigung, kein belegtes Überschreiben persönlicher Daten. In Phase 6A **nicht geändert**. Vor einem späteren Release separat reproduzieren und per Dialog-/Ansichtsinstanz entwerten; eigene Regression. Nicht als Bestandteil des Redesigns verstecken.

## Freigabegates

1. Menschliche Auswahl einer Richtung, inklusive verworfener Teile.
2. Rechtekette bestehender Baumgrafiken und Font-/Textattribution für den kommerziellen Einsatz prüfen.
3. Paketweise technische Regression inklusive alter Bestandsdaten, Import/Export, Offline und PWA-Update.
4. Echte iPhone-Safari-, installierte-PWA- und VoiceOver-Abnahme; offene Gates der Phasen 1–5 bleiben offen.
5. Erst danach gesonderte Produktionsentscheidung. Phase 6A erteilt keine Produktionsfreigabe.
