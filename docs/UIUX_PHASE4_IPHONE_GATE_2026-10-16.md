# Physische iPhone-Abnahme UIUX1–4 – OFFEN

Kein echter iPhone-/Safari-/Home-Screen-PWA-/VoiceOver-Test ist bestätigt. Das gilt weiterhin für UIUX1, UIUX2 und UIUX3 sowie den neuen UIUX4-Kandidaten. Chromium, axe, simulierte Insets und verkürzte Viewports ersetzen diese Freigabe nicht.

## Vorbereitung

Nur eine getrennte, ausdrücklich freigegebene HTTPS-Test-Origin verwenden. Es wurde keine Preview veröffentlicht. Build-ZIP enthält index.html direkt in der Wurzel. Nicht auf Produktion hochladen und nicht per file:// öffnen. Ein iPhone kann nicht auf localhost des Entwicklungsrechners zugreifen; eine erreichbare Test-Origin ist nötig.

Notieren: Datum/Tester/iPhone-Modell/iOS-Version/Safari bzw. installierte PWA/Origin/Build-ID/release-integrity.json-Hash. Ausschließlich synthetische Testdaten verwenden. Vor jedem Import exportieren: Import ersetzt den lokalen Stand auf dieser Test-Origin. Browser und installierte PWA getrennt testen; sie können unterschiedliche Datenbestände haben.

## A – Navigation, Fokus und Darstellung – OFFEN

1. Heute/Bibel/Mein Weg/Journal: alle vier Tabs sichtbar und bedienbar, auch bei kleinem iPhone, Querformat, großen Texteinstellungen und Safari-Leisten. Keine fünfte Tab-Leiste.
2. Drawer öffnen, alle Gruppen bis unten scrollen. Schließen bleibt erreichbar; Hintergrund darf nicht fokussierbar sein. Escape mit Hardwaretastatur, Overlay, Schließen, gleiches Ziel und tiefer Seitenwechsel prüfen. Fokus kehrt zur richtigen Stelle bzw. neuen Hauptüberschrift zurück. Mit Tab/Shift-Tab durchlaufen; kein Fokus hinter Bottom Nav.
3. Alle zwölf bisherigen Ziele anhand der Navigationsmatrix öffnen. Orientierung, geführte Wege und Fragensammlung über Entdecken; Markierungen direkt bzw. Bibel; Rückblicke/Geschichte; Einstellungen, Daten & Backup und Einführung über Mehr. Alte Direktadresse quizzes muss funktionieren.
4. Tief starten: Reader mit Versbereich/Origin, Story/Frage, einzelner Weg/konkreter Schritt, Originalgedanke und Rückblick. Richtiger Menübereich aktiv, Zurück führt zum passenden Kontext, Reload verliert keine Daten.
5. Hell/Atmosphärisch/Papier/Nacht; mindestens 200%-Text; echte Safe Areas, Browserleisten, reduzierte Bewegung, echte Bildschirmtastatur. Menü/Filter/Schließen/Speichern nicht abgeschnitten oder überdeckt. Touchziele mindestens 44 px.

## B – Entdecken – OFFEN

1. Leere persönliche Daten und gefüllte synthetische Geschichte. Standard zeigt 20 Ergebnisse mit korrekter Gesamtzahl 696. Bis zum Ende weiterladen:436 Geschichten+ 260 NT-Kapitel-Einheiten, keine Dopplungen oder fehlenden Ziele.
2. Geschichte/Kapitel/Buchfilter, Groß-/Kleinschreibung und Umlaute, lange/kurze Suchwörter, schnelle Eingaben, null Treffer, Reset. Filterwechsel setzt die Grenze zurück; geladene Ergebnisse bleiben erreichbar. Suchfeldfokus und angesagter Live-Status verständlich.
3. Geschichte öffnen und Browser-Zurück: Auswahl bleibt im laufenden App-Kontext erhalten. Reload setzt sie zurück; das ist gewollt und keine gespeicherte Präferenz.
4. Drei redaktionelle Einstiege öffnen: echte Geschichten. Keine erfundene Beliebtheit/Personalisierung. Themen und geführte Wege eigenständig auffindbar.
5. Gefilterte Story→Bibeltext→Frage→richtige/falsche Antwort→Erklärung→freiwillige Reflexion→bestehenden Weg verbinden/neuen Weg beginnen. IDs und Fortschritte erhalten.
6. NT-Kapitelübung mit fünf vorhandenen Fragen, zurück zum Reader. AT ohne finalen Fragenbestand zeigt keine Phantomfragen. Alte quizzes- und quiz/ID-URLs prüfen.

## C – Ersteinstieg – OFFEN

1. Frische Test-Origin: beide Aktionen „Ich brauche Orientierung“/„Direkt zur Bibel“ vor optionalen Erläuterungen sichtbar (insbesondere 390 × 844). Kein Formular, Login, Glaubenslabel oder verpflichtender Slide.
2. Orientierung→guidance, Bibel→bible; Dialog schließt, Hauptüberschrift wird fokussiert/angesagt. Optional „Mein persönlicher Weg“ öffnen: Baum=selbst dokumentierte persönliche Geschichte, Schwert=Bibelreise; keine geistliche Bewertung.
3. X/Escape/Abbruch/Browser-Zurück/Reload: keine Einführungsschleifen. Aus Mehr und Einstellungen freiwillig wieder öffnen. Bestandsnutzer und Nutzer nur mit Lesestand erhalten keine automatische Wiederholung einer bereits beendeten Einführung.
4. Auswahl mit verweigerter optionaler Speicherung darf Bibelzugang nicht blockieren. Safari-Privatmodus und lokale Speicherfehler mit synthetischen Daten prüfen; niemals echte Daten zum Stresstest verwenden.

## D – Bestand, Offline und echtes Update – OFFEN

1. UIUX1: Heute, Olivenbaum und echter nächster Schritt; Entwürfe wieder aufnehmen. UIUX2: Reader beide Bibeln, Kapitelwechsel, Markierungen/Farben/Notizen/Journal-/Weglinks, freiwillige Kapitelübungen, Geschichten/Erklärungen/Reflexion, Schwert/Epheser 6. Kurzkapitel aus tief gescrollter Ansicht öffnen: Öffnen allein zählt nicht, bewusste Erkundung nur einmal.
2. UIUX3: leere/aktive/archivierte/lange/viele Wege, Schritte hinzufügen/bearbeiten/auswählen/abhaken/wieder öffnen, richtige Originalgedanken und Rückblicke. Schrittabschluss allein verändert den Baum nicht. Nur ausdrückliche Entwicklungsbestätigung zählt; alle sieben Stufen, echte Zweige, frühe Stufen textlich erreichbar.
3. Archivieren/fortsetzen, Löschen/Abbrechen/Rückgängig, Schutz vor Überschreiben neuerer Änderungen; Journal-/Markierungs-/Quizdaten bleiben erhalten. Rückblick verweist auf damaligen Schritt, nicht einen später anderen. Ehrlicher Fallback bei fehlendem Original.
4. Export/Import und beschädigter Import; IDs, persönliche Texte, Links, Rückblicke, Quiz-/geführter-/Lese-Fortschritt sowie Entwurf bewahren. V3 → V5 nur anhand synthetischer Alt-Fixuren prüfen.
5. UIUX3 auf derselben isolierten HTTPS-Origin vollständig offline vorbereiten, zum Home-Bildschirm hinzufügen, synthetische Daten und offenen Entwurf anlegen/exportieren. Dann UIUX4 auf genau dieselbe Origin bereitstellen; zwei verschiedene Preview-Adressen sind kein Update-Test.
6. Geöffnete PWA und echter Dokument-Reload: Updateangebot abwarten, vor bewusster Aktivierung Datenstand gleich. „Jetzt aktualisieren“, Build-ID `FP4-20261016-G-STABLE1-UIUX4` und Hash prüfen. Persönliche Daten/Entwurf vor/nach vergleichen.
7. Flugmodus, PWA vollständig schließen und kalt öffnen. Beide Bibeln, alle zentralen Routen, neuer Drawer/Mehr/Suche/Filter/Pagination/Onboarding-Reopen, Fragen und Baum/Schwert funktionieren. Gedanken offline speichern, neu öffnen, exportieren. Appwechsel/Sperren/Tastatur und längere Unterbrechung prüfen.
8. VoiceOver: benannte Navigation/Dialoge, aktiver Bereich, Fokuswechsel, Filter, Live-Zahl, nächste Ergebnisse, Originalquellen, Formfehler und Speicherstatus. Reflexion wird nie als richtig/falsch bewertet. Hardwaretastatur und Bewegung reduzieren separat prüfen.

## Gate-Protokoll

Pro Fall: Umgebung/Build/Schritte/Erwartet/Beobachtet/PASS–FAIL–OFFEN/Screenshot oder Video/Fehlerpriorität. Datenverlust, nicht erreichbare Kernfunktion, falscher Originalbezug oder unbewusstes Baumwachstum blockieren Freigabe. Lokale iOS-Daten können durch Speicherbereinigung verloren gehen; Backups bleiben erforderlich. Produktions-GO erst nach dokumentiert erfolgreicher physischer UIUX1–4-Abnahme. Bis dahin NO-GO für Produktion.
