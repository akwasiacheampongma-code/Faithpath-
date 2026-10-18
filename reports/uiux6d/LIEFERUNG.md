# FaithPath TREEGUIDE2 – Dateien öffnen

Die drei ZIPs sind getrennte Lieferungen. Es wurde nichts veröffentlicht.

1. **Bericht_QA.zip:** vollständig entpacken, `PRUEFBERICHT.md` lesen. `screenshots/index.html` öffnet eine lokale, interaktive Vorher-Nachher-Galerie. Alle benötigten Bilder liegen im Paket. Die Geräteanleitung heißt `IPHONE_ABNAHME.md`.
2. **Screenshots.zip:** vollständig entpacken und die enthaltene `index.html` öffnen. Hier liegen alle 473 Original-PNGs einschließlich der Vergleichsbilder. 112 geprüfte Nachherzustände erzeugen je drei Aufnahmen; die Bildanzahl ist keine Anzahl eigenständiger Testfälle.
3. **Netlify_QA.zip:** enthält den vollständigen App-Build mit `index.html` im Wurzelverzeichnis. Für eine lokale Vorschau entpacken und den Ordner zum Beispiel mit `python3 -m http.server 8080` bedienen. Dann `http://localhost:8080` öffnen. Nicht per `file://` starten: Module und Service Worker benötigen einen passenden Web-Origin.

Der Build verwendet die vorhandene Speicherung für den jeweiligen Origin. Für die Abnahme einen isolierten Browserkontext und ausschließlich synthetische Daten verwenden. Das Paket nicht ohne gesonderte Freigabe auf die bestehende Produktions- oder QA-Site laden.

Der Appquellstand ist `2b48ae037deeb05100d550522623ecf75ff07224`. Ein zusätzlicher Liefercommit enthält ausschließlich QA und Dokumentation. Seine SHA und die endgültigen Archivprüfsummen stehen in der separaten Lieferquittung; die Quittung liegt bewusst außerhalb der ZIPs, um zirkuläre Archivhashes zu vermeiden.

**GO für Geräteabnahme, keine Produktionsfreigabe.** Echtes iPhone/Safari/VoiceOver bleiben OFFEN. Ein alter P3-Wortumbruch bei 320px/200% ist im Bericht sichtbar dokumentiert.
