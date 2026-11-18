# OLIVA · Geräteabnahme

Der vorhandene Link öffnet die private OLIVA-Vorschau auf Basis von 0.18.0. Für den Vergleich gilt auf dem Handy derselbe Anmeldezugang wie im Browser. Der schnellere Stabilisierungskandidat liegt als lokales Paket im Arbeitsbranch. Für dessen PWA-Abnahme ist eine vertrauenswürdige HTTPS-Adresse im Testnetz oder ein separater privater Host erforderlich. Der bisherige Link zeigt den Vergleichsstand. [Private Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site/) · [Stabilisierungsbericht](43-stabilization.md)

## Eigener Kurztest auf dem Handy

1. Vorschau online öffnen. Warten, bis die Meldung „Für den Offline-Neustart bereit“ angezeigt wird. In Safari über das Teilen-Menü zum Home-Bildschirm hinzufügen oder in Chrome die angebotene Installation wählen.
2. Von „Heute“ in die Bibel wechseln. Ein Buch suchen, ein Kapitel öffnen und zwei Verse direkt auswählen. Einen Vers merken und eine kleine Testnotiz schreiben. In „Sammlung“ die Notiz und das Lesezeichen wiederfinden.
3. Flugmodus einschalten. OLIVA vollständig schließen und über das Symbol erneut öffnen. Die gleiche Bibelstelle, die Testnotiz, eine Geschichte mit Bild und den Garten öffnen. Danach Flugmodus beenden.
4. Größere Systemschrift und Dunkelmodus ausprobieren. Mit VoiceOver oder TalkBack einmal von der Buchsuche bis in den Reader navigieren. Notieren, was unverständlich war oder wohin der Fokus gesprungen ist.
5. Für ein Ergebnis Gerät, Betriebssystem, Browser, sichtbare Appfassung und den ersten auffälligen Schritt notieren. Für Import, Wiederherstellung und Update ein separates Testprofil mit erfundenen Daten verwenden.

## Konkrete Matrix

| Bereich | iPhone mit Safari und Home-Bildschirm-Web-App | Android mit Chrome und installierter PWA | Erwartung |
|---|---|---|---|
| Kleine und größere Anzeige | Kleines iPhone möglichst bei 320–375 CSS-px, zusätzlich ein aktuelles Gerät. | Kleines Gerät bei etwa 360 CSS-px, zusätzlich ein Gerät mit größerer Anzeige. | Begrüßung, Buchsuche, Kapitelwahl, vier Sammlungsregister und Reader gut nutzbar. |
| Start und Übergänge | Erster Aufruf über Mobilnetz, neu aus Safari und über das Symbol. | Erster Aufruf über Mobilnetz, Neustart über Launcher und Android-Zurück. | Zeit bis zur Leseaktion und bis zur Offline-Meldung getrennt notieren. Schriften und Bilder ohne überraschenden Wechsel. |
| Große Schrift und Orientierung | Systemschrift größer, Safari-Vergrößerung, Querformat, beide Themen. | Systemschrift und Anzeigegröße erhöhen, Drehung und beide Themen. | Titel, Bedienelemente und Dialoge bleiben lesbar und erreichbar. |
| Hilfstechnologien | VoiceOver mit Überschriften, Navigation, Versauswahl, Dialog und Zurückfokus. | TalkBack mit denselben Aufgaben sowie Android-Zurück. | Sinnvolle Namen und Reihenfolge, keine Fokusfalle, Aktion und Speicherstatus verständlich. |
| Offline aus kaltem Appzustand | Nach vollständiger Vorbereitung in Flugmodus wechseln und über das Symbol starten. | Vorbereitung, App beenden und im Flugmodus über den Launcher neu öffnen. | Bibel, Geschichte, Bild, Garten und persönliche Daten erreichbar. Verhalten bei Speicherbereinigung dokumentiert. |
| Update | Synthetisches Profil auf dem Ausgangspaket, danach Kandidat am gleichen isolierten Ursprung. | Entsprechender Wechsel mit zwei geöffneten Fenstern und einem bereits installierten Startsymbol. | Altes Fenster bleibt nutzbar. Kandidat aktiviert sich. Lesestand, Gedanken, Entwürfe, Markierungen, Lesezeichen und Archive bleiben erhalten. |
| Export und Import | Dateiauswahl, Download, Abbruch, Vorschau und bestätigter Restore mit künstlichen Daten. | Gewählter Download-/Teilen-Dialog und Restore mit eigener Testdatei. | Unpassende Datei und Abbruch schonen den Bestand. Reguläre Sicherung und Originalexport lassen sich öffnen. |
| Native App | Installierbarer iOS-Testbuild mit System-Picker, Teilen, SQLite und VoiceOver. | Installierbarer Android-Testbuild mit System-Picker, Teilen, SQLite und TalkBack. | Sieben A51-Stadien, reduzierte Bewegung, Speicher, große Sicherungen und Neustart prüfen. |

Chromium-Automation und statische Exporte werden im Stabilisierungsbericht belegt. Die hier aufgeführten physischen Tests einschließlich VoiceOver und TalkBack sind offen. Für ein reproduzierbares Protokoll zu jedem Fall Gerät, Versionen, Netzwerk, Testprofil, erwartetes und beobachtetes Ergebnis sowie bei Bedarf ein Bildschirmfoto festhalten.
