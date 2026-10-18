# TREEFINAL – Dateien öffnen

Alle ZIPs vollständig entpacken. Es wurde kein Build veröffentlicht.

- **Netlify_QA.zip:** vollständige echte App mit `index.html` im ZIP-Wurzelverzeichnis. Für eine lokale Vorschau im entpackten Ordner `python3 -m http.server 8080` starten und `http://localhost:8080` öffnen. Nicht per `file://` starten: Appmodule und Service Worker brauchen einen passenden Origin. Veröffentlichung auf einer isolierten HTTPS-Testadresse erst nach gesonderter Freigabe.
- **Bericht_QA.zip:** `PRUEFBERICHT.md`, `IPHONE_ABNAHME.md`, vollständige Rohbelege und repräsentative Aufnahmen. `screenshots/index.html` lässt sich lokal öffnen. Bei Nutzung eines lokalen Servers den vollständigen entpackten Berichtordner bedienen, nicht nur dessen Unterordner `screenshots`. Gedanken und Einträge der Bilder sind ausschließlich synthetisch.
- **Screenshots.zip:** `index.html` lokal öffnen. Enthält die gesamte Bildmatrix und direkte Vorher-Nachher-Vergleiche. 112 Nachherzustände und32 Vorherzustände erzeugen je drei Aufnahmen; die PNG-Anzahl ist keine Anzahl unabhängiger Tests.

Die App verwendet unverändert die Speicherung des jeweiligen Origins. Für den manuellen Test einen isolierten Kontext und synthetische Daten verwenden. Die bestehende QA-Site und Produktion nicht mit diesem Paket überschreiben.

Separate Lieferquittung und SHA-256-Liste nennen die endgültigen Archivhashes und den QA-Liefercommit. Der tatsächliche Appquellstand ist `ce89422411ec3382c62ba7683167cf1b6db4a457`.

**GO für die isolierte Geräteabnahme.** Physisches iPhone, Safari, installierte iPhone-PWA und VoiceOver bleiben OFFEN; keine Produktionsfreigabe.
