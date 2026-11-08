# Tatsächlicher Offline-Upgrade-Test 0.9 → 0.10

Der erste Lauf von `scripts/offline-upgrade-v010.mjs` war am 8. November 2026 erfolgreich. Er verwendet einen isolierten lokalen HTTP-Port, ein dauerhaftes Chromium-Profil und denselben Origin über den Austausch des ausgelieferten Build-Verzeichnisses hinweg. Es wurden weder Service Worker simuliert noch IndexedDB-Daten durch Testcode geschrieben oder nachträglich zurückgesetzt.

Die unveränderte 0.9-Kontrollfassung (`/workspace/oliva-v09-book-gallery-control-dist`, Core `oliva-6428cb5965119e02`) erzeugte alle synthetischen Ausgangsdaten über ihre echte Oberfläche: Namen, einen FaithPath-Import mit unbekannten Originalfeldern und Wiederherstellungskopie, bestätigtes Lesen, einen eigenen Rückblick mit bestätigter Alltagserfahrung sowie zwei automatisch gesicherte Entwürfe für Journal und Rückblickbearbeitung. Die Entwürfe enthalten bewusst Zeilenumbrüche und umgebende Leerzeichen.

Danach aktivierte derselbe Browser den tatsächlichen 0.10-Service-Worker (`oliva-12c38c9b1a132bff`). Das reine Anzeigen und Neuladen von Einstellungen, Rückblick und der neuen Einladungsseite ließen sämtliche vier rohen IndexedDB-Datensätze unverändert. Die V6→V7-Aufbereitung mit ausgeschalteten Einladungen erfolgte ausschließlich im Arbeitsspeicher; die gespeicherte Hauptfassung blieb V6.

Erst ein ausdrücklicher Klick auf „Einladungen in der App erlauben“ schrieb V7. Der Test prüft vollständig:

- Genau `version`, `revision` und das neue Feld `invitations` ändern sich: Version 6→7, Revision +1 und `{enabled:true,snoozed:{},dismissed:{}}`.
- Alle 18 weiteren V6-Felder bleiben einzeln in ihrer UTF-8-JSON-Darstellung bytegleich. Die Liste samt SHA256 und Größe steht im Ergebnisbericht.
- Alle anderen Rohdatensätze, die ursprünglichen Importbytes, unbekannten FaithPath-Felder, Wiederherstellungskopie und der Wiederherstellungsindex bleiben exakt erhalten. Es entstehen keine zusätzlichen Datensätze.
- Der Olivenbaum-Fortschritt bleibt unverändert.
- Nach tatsächlichem Abschalten des Netzwerks funktionieren Neuladen und Erstaufruf der neuen Einladungsroute; der eingeschaltete Zustand bleibt erhalten. Originalrückblick und beide Entwürfe werden offline aus ihrer echten Oberfläche unverändert gelesen bzw. fortgesetzt.
- Der neue Worker bedient einen ausschließlich im Vorgänger-Cache vorhandenen JavaScript-Chunk offline mit dem ursprünglichen SHA256. Beide tatsächlichen Cache-IDs und der aktive Worker sind dokumentiert.

`offline-upgrade.json` enthält den vollständigen strukturierten Nachweis; `attempt-01.txt` die unveränderte Prozessausgabe. Die fünf Screenshots zeigen die ausgeschaltete und ausdrücklich eingeschaltete Einladungsseite, den Offline-Neustart sowie beide erhaltenen Entwürfe. `SHA256SUMS` erfasst alle Dateien dieses Nachweisordners außer sich selbst.

Dies ist ein automatisierter lokaler Chromium-155-Test bei 390×844 Pixeln und reduzierter Bewegung. Er belegt keine Prüfung auf einem echten Handy, keinem Android-/iOS-Simulator und auch keine Browserprüfung der authentifizierten gehosteten Vorschau. Eine fällige Einladung und Zurückstellen/Ausblenden sind nicht Gegenstand dieses Migrationstests; er prüft den ausdrücklichen Opt-in und Datenerhalt. Historische Upgrade-Skripte und deren Belege bleiben unverändert.

Erneuter Aufruf für einen anderen Build mit eigenem Nachweisordner: `OLIVA_EVIDENCE_DIR=docs/evidence/invitations/upgrade-next node scripts/offline-upgrade-v010.mjs`.
