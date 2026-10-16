# UIUX2 – iPhone Safari und installierte PWA: manuelles Freigabegate

**Status: OFFEN.** Weder UIUX1 noch UIUX2 wurden in dieser Umsetzung auf einem echten iPhone mit Safari, installierter PWA oder VoiceOver abgenommen. Chromium-Tests, simulierte Safe Areas und verkürzte Viewports ersetzen diese Abnahme nicht. Keine Produktionsfreigabe vor bestandenem Gate.

## Vorbereitung

1. Ausschließlich eine isolierte HTTPS-Test-Origin verwenden. Keine Produktion überschreiben. Dieser Auftrag veröffentlicht nichts auf Netlify; der gelieferte ZIP ist ein vollständiges statisches Deploy-Paket.
2. Testperson, Datum, iPhone-Modell, iOS-/Safari-Version, verfügbare Speicherkapazität, Bildschirmgröße, Textgröße und Installation dokumentieren. Alle folgenden Testfälle separat in Safari und der vom Homescreen gestarteten PWA protokollieren.
3. Ausschließlich synthetische Daten verwenden. Bestehende private Nutzerdaten zuerst separat exportieren und die Test-Origin nicht mit der produktiven App verwechseln. Die Build-ID in Einstellungen prüfen: `FP4-20261016-G-STABLE1-UIUX2`.
4. Online warten, bis Einstellungen „Beide Bibeln und die App sind für dieses Gerät offline bereit.“ meldet. OTB Deutsch und Luther 1912 einmal öffnen. Ausgangszustand exportieren.

## Abnahmematrix

Jede Zeile für **Safari** und **installierte PWA** als OFFEN / PASS / FAIL dokumentieren; bei FAIL Schritte, erwartetes/tatsächliches Ergebnis, Build-ID und Screenshot festhalten.

| Fall | Aktion und erwartetes Ergebnis | Safari | PWA |
|---|---|---|---|
| UIUX1 Heute | Neu und wiederkehrend starten. Olivenbaum vollständig; persönlicher nächster Schritt klar; Entwurf fortsetzen, Weg, Journal und Rückblick erreichbar. | OFFEN | OFFEN |
| Reader | Johannes 3 öffnen, lesen, vor/zurück, Buch und Kapitel wählen. Beide Übersetzungen lesbar; keine horizontalen Überläufe oder verdeckten Bedienelemente. | OFFEN | OFFEN |
| Kontext | Aus einer Geschichte zum Text wechseln, Kapitel/Übersetzung wechseln, zurückkehren. Geschichtenkontext und passende Stelle prüfen. | OFFEN | OFFEN |
| Verse | Ein/zwei benachbarte Verse auswählen, Auswahl aufheben; vier Farben markieren; kopieren; Notiz und Verbindung zu einem synthetischen Weg anlegen. Erneut öffnen und exportieren. | OFFEN | OFFEN |
| Kapitelende | Langes Kapitel nur öffnen/sofort verlassen: keine Erkundung. Tatsächlich bis Ende lesen: einmal „Kapitel erkundet“. Psalm 117 auf großem Viewport: Öffnen zählt nicht; erst „Kapitel als erkundet festhalten“ zählt. Erneut lesen/Übersetzung wechseln: keine doppelte Zählung. | OFFEN | OFFEN |
| Freiwilliges Quiz | Johannes 3: fünf bestehende Fragen, richtige/falsche Antwort, Erklärung, überspringen, nächstes Kapitel, Gedanke festhalten. Genesis 1: keine erfundenen Kapitelquizfragen. | OFFEN | OFFEN |
| Geschichten | NS-0001 und eine gemischte Geschichte (NS-0113) entdecken, zugehörigen Text lesen, Fragen einzeln und rückwärts öffnen. Vier Optionen, genau eine richtige Kennzeichnung; Erklärungen, letzte Frage → freiwillige Reflexion. | OFFEN | OFFEN |
| Reflexion/Tastatur | Originalfrage unverändert. Text mit Bildschirmtastatur, Auswahl, Umlauten und Emoji eingeben; Formular bis Speichern scrollen. Weg auswählen, speichern, Eintrag öffnen/bearbeiten. Abbrechen/Appwechsel/Neustart: Entwurf fortsetzen statt verlieren. | OFFEN | OFFEN |
| Schwert | Nach Kapitelende „Dein Schwert ansehen“ öffnen. Ein zentrales Schwert vollständig, genaue Anzahl sichtbar. 0/1/5/300/1189 synthetische Kapitel per geprüften Testbackups prüfen; Buchübersicht ohne zusätzliche Schwerter. | OFFEN | OFFEN |
| Biblische Erklärung | „Warum ein Schwert?“ vollständig lesen und schließen. Glaubensbewertung ausgeschlossen, geistlicher Zusammenhang/keine Gewalt gegen Menschen, Unterschied zum Olivenbaum. Epheser 6,17 in Luther 1912 öffnen und zum Hub zurück. | OFFEN | OFFEN |
| Themes/Zoom | Hell, Atmosphärisch, Papier, Nacht; große iOS-Schrift/Zoom, Hoch-/Querformat. Text, Auswahl, richtige/falsche Antwort und Schwert erkennbar. | OFFEN | OFFEN |
| Safe Areas | Notch/Dynamic Island, Statusleiste, Homescreen-Indikator; kleine Viewports 320×568 soweit echtes Gerät verfügbar, alternativ als zusätzlich OFFEN markieren. Keine Überdeckung durch Navigation oder Tastatur. | OFFEN | OFFEN |
| Offline | Nach Vorbereitung Flugmodus: Kaltstart, beide Bibeln, Geschichten/MC, Reflexion, Journal, Wege, Schwert, Export. Danach wieder online; alles erhalten. | OFFEN | OFFEN |
| Wiederaufnahme | App schließen, Gerät sperren, später zurückkehren. Lesestelle, Einträge, Markierungen, Weg und Entwurf vorhanden; keine falschen Erfolgsmeldungen. | OFFEN | OFFEN |
| Export/Import | Synthetischen Stand exportieren, prüfen, wieder importieren. Wege/Journal/Reflexionen/Markierungen/Quiz/Journey identisch. Ungültigen Import ablehnen; Originalstand unverändert. | OFFEN | OFFEN |
| VoiceOver | Hauptnavigation, Übersetzungs-/Buch-/Kapitelauswahl, Versnummern, Auswahlzustand, Antwort/Feedback, Reflexion/Formular, Dialoge und Kapitelzähler. Sinnvolle Reihenfolge, keine Fokusfalle, Rückkehr zum passenden Element. | OFFEN | OFFEN |
| Touch/Bewegung | Einhändig antippen, keine unbeabsichtigten Versaktionen. „Bewegung reduzieren“ aktivieren, keine zwingenden Animationen. | OFFEN | OFFEN |

## Tatsächliches Update auf derselben Test-Origin

1. Den bekannten UIUX1-Build (`FP4-20261016-G-STABLE1-UIUX1`, Build-Hash `7f7ec73b955f7a8ca603ec78937a898633784d9cd229b9192ea4845bd88d3b0b`) auf **dieser isolierten Test-Origin** bereitstellen. Offline-Vorbereitung vollständig abwarten; als PWA installieren.
2. Synthetischen Weg, Journal-/Reflexionseintrag, Markierung, Kapitelquizabschluss, erkundetes Kapitel sowie ungespeicherten Entwurf anlegen. Backup und Screenshots sichern. App offen lassen.
3. UIUX2 auf genau derselben Test-Origin bereitstellen. Safari und installierte PWA getrennt testen. Die alte App muss bis zur bewussten Aktualisierung weiter funktionieren; nicht Browserdaten/Cache löschen.
4. „Jetzt aktualisieren“ ausführen. Neue Build-ID prüfen. Sämtliche zuvor dokumentierten Daten und Entwurf müssen erhalten bleiben. Entwurf offline fortsetzen und speichern. Quizfortschritt und erkundetes Kapitel nicht doppelt zählen.
5. Flugmodus, Kaltstart, beide Übersetzungen, neue Reader-/Geschichten-/Schwertansichten prüfen. Keine Mischung alter und neuer Assets, keine leere Oberfläche. Erneut exportieren und mit Ausgangsbackup vergleichen (nur bewusst erzeugte Änderungen zulässig).
6. Fehler, Speicherdruck oder Updateabbruch nachvollziehbar dokumentieren; keine Datenlöschung als Reparatur verwenden. Bei reproduzierbarem Datenverlust **NO-GO**.

## Freigabe

GO für Produktion erst, wenn beide Spalten ohne kritischen Fehler abgenommen, offene UIUX1-Fälle geschlossen, Export/Import und echtes PWA-Update auf dem Gerät bestanden sind. Name/Datum und verbleibende nichtkritische Abweichungen dokumentieren. Dieser Bericht erteilt keine automatische Produktionsfreigabe.
