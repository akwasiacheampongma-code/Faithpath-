# MOBILE2 – Dateien öffnen und prüfen

Der Build wurde nicht veröffentlicht. Die bestehende Live- und QA-Seite liefert deshalb durch diese Arbeit noch keinen neuen Stand.

## Preview-Build

`FaithPath_UIUX6B_MobilePolish_Netlify.zip` enthält den vollständigen statischen Build mit 366 Dateien, einschließlich beider Offline-Bibeln, Fragen, Fonts und Service Worker. Das ZIP ist Netlify-kompatibel. Eine Veröffentlichung bedarf einer separaten Freigabe.

Für eine lokale Prüfung das ZIP in einen eigenen Ordner entpacken und diesen Ordner über einen lokalen HTTP-Server bereitstellen, zum Beispiel:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Danach `http://127.0.0.1:8080/` öffnen. Die App direkt über `file://` zu starten ist keine PWA-Prüfung. Browserprofile ausschließlich mit synthetischen Daten verwenden; eine neue Origin besitzt keinen Zugriff auf die Einträge der bisherigen Live-Origin.

Die erwartete Build-ID lautet `FP4-20261017-G-STABLE1-UIUX6B-MOBILE2`. Quellcommit und Hashverfahren stehen im Hauptbericht und in `BUILD_RECEIPT.json`. Der SHA-256 des ZIPs steht in der separaten Lieferquittung; er unterscheidet sich vom Hash der geordneten Build-Dateimap.

## Bericht und Bilder

`FaithPath_UIUX6B_MobilePolish_Bericht_QA.zip` enthält den technischen Bericht, die manuelle iPhone-Anleitung, maschinenlesbare Ergebnisse, Rohprotokolle und eine repräsentative Vergleichsgalerie. Nach dem Entpacken `screenshots/index.html` öffnen. Alle Bilddateien liegen lokal daneben; die Galerie lädt keine externen Dienste.

`FaithPath_UIUX6B_MobilePolish_Screenshots.zip` enthält zusätzlich die vollständige automatisierte Bildmatrix. Dort `index.html` öffnen. Über Ansicht, Theme und Breite/Textgröße lassen sich echte Browseraufnahmen vergleichen. Nur für die ausdrücklich aufgenommenen 56 Ausgangszustände gibt es ein Vorherbild; andere Kombinationen sind entsprechend gekennzeichnet.

Die vier Dateien `Journal_Vergleich.png`, `Journal_200_Vergleich.png`, `Reader_Vergleich.png` und `Quiz_Vergleich.png` zeigen die wichtigsten Änderungen unmittelbar nebeneinander. Die Bilder verwenden identische synthetische Daten. Das Nutzerfoto wird nicht als identischer lokaler Ausgangsscreenshot ausgegeben.

## Abnahme

GO für die isolierte physische Geräteprüfung. Keine Produktionsfreigabe. iPhone, echtes Safari, installierte iPhone-PWA und VoiceOver bleiben bis zur dokumentierten Abnahme OFFEN. Es gab weder einen Merge in main noch einen automatischen Deploy.
