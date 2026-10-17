# MOBILE2 – physische iPhone-Abnahme: OFFEN

Dies ist die ausstehende Geräteprüfung. Chromium-PNGs, ein iPhone-User-Agent und TinyFish bei Desktopbreite sind kein Safari-/iPhone-/VoiceOver-Nachweis. Auch die Gerätegates der Phasen 1–5 und des ursprünglichen 6B-Kandidaten bleiben offen.

## Vorbereitung

Nur eine ausdrücklich freigegebene isolierte QA-Origin verwenden. Das mitgelieferte Build-ZIP wurde nicht veröffentlicht. Vorhandene persönliche Daten auf dem eigenen Gerät zuerst über die bestehende Exportfunktion sichern; automatisierte Tests verwenden ausschließlich neue synthetische Browserprofile.

Notieren: iPhone-Modell, iOS-Version, Safari-Version, angezeigte Build-ID, Seitenzoom unter `aA`/Seiteneinstellungen, iOS-Textgröße und aktivierte Bedienungshilfen. Die Pixelabmessungen eines Bildschirmfotos beweisen keine CSS-Viewportbreite. Einstellungen zunächst dokumentieren, nicht zur Kaschierung des Fehlers zurücksetzen.

Erwartete neue Build-ID: **FP4-20261017-G-STABLE1-UIUX6B-MOBILE2**. Zunächst mit 100% Safari-Seitenzoom testen, anschließend 150% und 200%, soweit Safari diese Werte anbietet. Zusätzlich den ursprünglich fehlerhaften persönlichen Zoomzustand testen. Die automatisierte QA vergrößert den CSS-Roottext; dies ist nicht dasselbe Verfahren.

In der installierten PWA stehen Safari-Seitenregler möglicherweise nicht zur Verfügung. Dort die tatsächlich verfügbare Systemvergrößerung verwenden und deren Methode dokumentieren; fehlende Regler nicht als bestandenen 200%-Test ausgeben. Beim Fokus auf Suche/Formularfelder außerdem beobachten, ob Safari seinen Zoom verändert und ob er nach dem Schließen wieder korrekt ist.

## Prüfschritte

| Nr. | Zustand / Handlung | Abnahmebedingung | Status |
|---|---|---|---|
| 1 | Safari, Nacht, leeres Journal, normale und ursprüngliche Text-/Zoomgröße | FaithPath bleibt ein Wort; Icon ohne unerwartete schwarze Trägerfläche; Menü erreichbar; eine klare Schreibaktion; keine wiederholte große Einladung | OFFEN |
| 2 | Heute, Bibel, Mein Weg, Journal, Mehr; alle vier Themes | Keine ungewollten Überlappungen; lesbare Navigation; keine verborgenen Aktionen oder horizontaler Seitenüberlauf | OFFEN |
| 3 | 150/200% Seitenzoom und größere iOS-Schrift | Texte vollständig erreichbar; vertikales Scrollen erlaubt; Navigation/Labels verständlich | OFFEN |
| 4 | Journal schreiben, sehr langen Text tippen, Tastatur öffnen/schließen | Sichtbare letzte Zeile und sichere Speichern-/Schließen-Aktionen; kein unbeabsichtigter Fokusverlust | OFFEN |
| 5 | Journal-Entwurf schließen, App unterbrechen, später fortsetzen | Eigener Entwurf korrekt wieder da; kein Datenverlust | OFFEN |
| 6 | Psalmen119 in OTB und Luther1912; Psalmen117; Buch-/Kapitelwechsel, Aa | Bibeltext erscheint früh; beide Übersetzungen vollständig; große Schrift gut scrollbar; Aa-Popup passt; Fokusmodus lässt sich verlassen | OFFEN |
| 7 | Verse markieren, farbig hervorheben, Notiz und Weg verknüpfen | Richtige Verse/Referenzen und persönliche Einträge; Auswahl verdeckt keine notwendige Aktion | OFFEN |
| 8 | Lange Kapitelquiz- und Nachlesefrage; richtig/falsch; Erklärung; freiwillige Reflexion | Vier Antworten vollständig erreichbar; gespeicherter Status bleibt; keine spirituelle Bewertung | OFFEN |
| 9 | Bibelreise, Schwert, Baum, mehrere/archivierte Wege und Details | Korrekte Zählung/Originalstufen; Symbole vollständig; klare Verknüpfungen | OFFEN |
| 10 | Rückblick und „Damals und heute“ | Historisch richtiges Original; aktueller Gedanke getrennt; keine erfundene Entwicklung | OFFEN |
| 11 | Entdecken „Vergebung“, Filter, leere Suche, Geschichte | Korrekte Ergebnisse/Verknüpfungen; Rückweg und Leerzustand verständlich | OFFEN |
| 12 | Mehr, Einstellungen, Backup prüfen, Export und kontrollierte Wiederherstellung mit synthetischer Datei | Originaldaten erst nach bewusster Bestätigung verändern; korrekte Prüfung, Schließen und Fehlermeldungen | OFFEN |
| 13 | Querformat, Browserleisten ein-/ausblenden; Safe Areas; bei langer Seite nach unten | Keine verdeckten Texte; letzte Aktionen über der Navigation erreichbar; kein überflüssiger Sicherheitsrand vor zentralen Aktionen | OFFEN |
| 14 | Zum Home-Bildschirm hinzufügen, eigenständig starten, unterbrechen, wieder öffnen | Installation, Safe Areas, Tastatur und Wiederaufnahme funktionieren auch außerhalb Safari | OFFEN |
| 15 | Vollständige Offline-Vorbereitung abwarten, Flugmodus, Reader/Quiz/Journal neu öffnen | Beide Bibeln und lokale Fonts verfügbar; Einträge und Entwürfe korrekt | OFFEN |
| 16 | Alter 6B-Build→MOBILE2 auf derselben isolierten Origin, ausstehender Entwurf vorhanden | Update ausdrücklich aktivierbar; Originaleinträge, Fortschritte, Theme und Entwurf bleiben; danach offline erneut öffnen | OFFEN |
| 17 | VoiceOver: Hauptnavigation, Aa, Verse, Editor, Antworten, Backup-Dialog | Sinnvolle Namen/Reihenfolge; sichtbarer Fokus, keine Falle; Rückmeldung korrekt; dekorative Symbole nicht vorgelesen | OFFEN |
| 18 | Bewegung reduzieren aktivieren | Keine notwendige Information nur durch Animation; normale Bedienung unverändert | OFFEN |

Pro Fehler festhalten: Build-ID, Gerät/Einstellungen, Route, Schritte, Erwartung, beobachtetes Ergebnis, Screenshot oder kurzes Video. Keine privaten Journaltexte in öffentliche Fehlerberichte kopieren.

**Gate:** Alle erforderlichen Punkte müssen auf einem realen Gerät nachvollziehbar bestanden sein. Der vorliegende Bericht ersetzt dieses Gate nicht und erteilt keine Produktionsfreigabe.
