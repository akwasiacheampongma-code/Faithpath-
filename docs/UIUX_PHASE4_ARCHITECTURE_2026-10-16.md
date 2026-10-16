# UIUX4 – Architektur und Entscheidungen

Basis:`19ce343` (UIUX3@`192675a` plus verbindliche Spezifikation). Bestehender Vanilla-JS/PWA-Stack, keine neue Abhängigkeit, Migration, Inhaltsänderung oder Speicherschlüssel.

## Zuständigkeiten

| Modul | Verantwortung | Datenvertrag |
|---|---|---|
| navigation-model.js | Neun gruppierte Drawer-Ziele und eindeutige aktive Hubs für tiefe Routen | Reine Projektion aus aktuellem Routentext, keine Nutzerdaten |
| navigation-view.js | Sekundäre Mehr-Ansicht und gemeinsame Entdecken-Verweise | Bestehende heading/row/link/button-Helfer; feste Routen |
| menu.js | Vorhandener Drawer-Adapter, Fokusfalle, Escape/Overlay/Scrolllock/Inert | Kein neuer Router, keine Persistenz |
| discover-model.js | Einmaliger öffentlicher Suchindex; Filter, stabile Reihenfolge, Pagination | createDiscoveryIndex(items); selectDiscovery(index,{query,book,kind,limit=20}) |
| discover-view.js | Entdecken-/Legacy-Fragensammlung und begrenzte Ergebnisliste | Bestehende Quell-IDs/Routen; escaped Text/Attribute; persistenter Live-Status |
| onboarding-view.js | Ein neutraler Bildschirm mit zwei unmittelbaren Aktionen | Kein Formular oder Zustand; optionale Erklärung |
| navigation-discovery.css | Eng begrenzte Gestaltung der drei Zielbereiche | Bestehende Theme-Token, keine Änderung der vier Themes |
| app.js | Kleine Adapter an vorhandenem Router, Dialog und UI-State | Alle bisherigen Domain-/Store-Aktionen bleiben maßgeblich |

## Navigation

Zwölf alte Ziele bleiben bestehen, neun davon direkt im Drawer. Orientierung, geführte Wege und alte Fragensammlung sind über Entdecken einen zusätzlichen Schritt entfernt erreichbar. Mehr enthält nur persönliche Nebenziele sowie Einstellungen, Backup und direkte Wiederöffnung der Einführung. Die vollständige Zuordnung und alle Router-Familien stehen in UIUX_PHASE 4_NAVIGATION_MAP_2026-10-16.md.

Die Fokusfalle umfasst echte Drawer-Steuerungen, Hintergrundseiten/Tab-Leiste/Topbar/Skip-Link werden vorübergehend inert. Schließen stellt den vorherigen Zustand wieder her. Linknavigation überlässt dem bestehenden Router den Fokus auf die neue Hauptüberschrift. Bei gleicher Route oder einem Modifier-Klick ohne normale Navigation erhält die bestehende Überschrift Fokus. Der Alt-Klick-Sonderfall wurde eigenständig reproduziert und minimal korrigiert. Die Schließen-Leiste bleibt beim internen Scrollen sichtbar.

## Suche und Pagination

Der Index wird nach erfolgreichem Runtime-Mapping einmal angelegt. Durchsucht werden dieselben öffentlichen Felder wie vorher: Titel, Beschreibung, Bibelreferenz und Reflexionshinweis; normalisiert nach NFC, deutscher Kleinschreibung und einheitlichen Leerzeichen. Der Buchfilter verwendet wie bisher die erste Buchreferenz. Keine Tagebuchanalyse, Rangfolge, Popularitätsbehauptung oder Serverabfrage.

Jede Eingabe filtert den vorbereiteten Index und setzt die sichtbare Grenze auf 20. Weitere Ergebnisse kommen in 20 er-Schritten. Suchfeld/Filter und Live-Statusknoten bleiben erhalten; nur der Ergebnisbereich wird ersetzt. Nach Fortsetzung fokussiert die App den ersten neuen Eintrag. Die Gesamtzahl ist sichtbar, Reset führt zur vollständigen Auswahl zurück. Die Reihenfolge bleibt 436 Geschichten, danach 260 Kapitel-Einheiten gemäß bestehender Quelle.

Filter bleiben ausschließlich in bestehendem transientem ui-State: Rückkehr aus einer Geschichte behält sie, Reload setzt sie zurück. Keine zusätzliche LocalStorage-Präferenz. Die alte Route quizzes bleibt als paginierte Fragensammlung erreichbar und bewahrt ihre bisherigen quiz/ID-Ziele; Entdecken behält story/ID für Kapitel-Einstiege. Alle Inhalte sind über Fortsetzung erreichbar, kein AT-Ersatzbestand entsteht.

Die drei bisherigen realen redaktionellen Einstiege liegen in einer optionalen Aufklappansicht. Das verkürzt den Weg zur Suche; es sind keine individuellen Empfehlungen.

## Onboarding und Bestandsschutz

Eine Erklärung, zwei sofortige Ziele: Orientierung→guidance, Bibel→bible. Die vorhandenen onboard-next/onboard-skip-Aktionen bleiben; Weiter-Slides sind entfallen. Die optionale Erklärung trennt Baum und Schwert ohne Bewertung des Glaubens. Neue App-Nutzung ist keine Klassifikation als neuer Christ.

KEYS.onboard / `faithpath.onboarding.v4` und Legacy-Erkennung bleiben unverändert. Bewusstes Schließen/Escape oder Auswahl hält die Einführung als beendet fest; aus Mehr und Einstellungen kann sie erneut geöffnet werden. Dadurch entstehen beim Reload keine Einführungsschleifen. Kann die optionale Kennung nicht geschrieben werden, blockiert das die Zielnavigation nicht. Persönliche Daten werden nicht verändert. Bei vollständig verweigerter Speicherung bleibt der Reader lesbar; echtes Safari-Verhalten bleibt Geräte-Gate.

Store, Import-/Exportvalidierung, V3 → V5-Migration, Entwurfs-/Journal-Schutz, IDs, Quiz-/Lese-/geführter Fortschritt, Rückblicke, ursprüngliche Baum-/Schwertlogik und Daten sind unverändert. Anders als UIUX3 führt UIUX4 auch keine zusätzlichen optionalen persönlichen Record-Felder ein.

## Entscheidungen und Kosten

- Drawer 12 → 9: klarere Aufgaben und weniger Redundanz; Orientierung/Pläne/Fragensammlung benötigen einen zusätzlichen Hub-Schritt.
- Transiente Filter: keine neue Persistenz oder Migrationslast; Reload verwirft die Auswahl bewusst.
- Redaktioneller Einstieg als Aufklappbereich: Suche wird früher erreichbar; redaktionelle Vorschläge brauchen einen zusätzlichen Tap.
- Abgebrochene Einführung gilt als beendet: schützt vor Schleifen; erneutes Lesen erfolgt bewusst über Mehr/Einstellungen.

Weiterentwicklung entlang dieser Module; kein Rewrite der bestehenden App-Datei erforderlich. Neue Menüziele müssen Navigationsmatrix, Deep-Link-Projektion und Browser-Coverage gemeinsam aktualisieren. Neuer öffentlicher Inhalt bleibt Sache des bestehenden Runtime-/Master-Validierungsprozesses.
