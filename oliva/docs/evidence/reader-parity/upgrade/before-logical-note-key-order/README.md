# PWA-Upgradeprüfung für den Reader-Kandidaten 0.13

Status: **vorbereitet, noch nicht ausgeführt**. Der tatsächliche Lauf beginnt erst nach Bestätigung des unveränderlichen 0.12.1-Kontrollbuilds durch Root. Keine Geräte-, Simulator- oder gehostete Browserprüfung.

Der archivierte Runner `offline-upgrade-reader-v9.mjs` wurde mit `node --check` geprüft. Er erwartet die echten Kennungen des Vorgängers (`0.12.1`, `oliva-75717978bae05979`) und des tatsächlich gebauten Kandidaten (`0.13.0`, `oliva-71cf17993d0bc7fd`). Vor und nach dem Browserlauf prüft er sämtliche 327 eingefrorenen Laufzeitdateien gegen den bekannten SHA-256-Digest.

Die Testdaten entstehen ausschließlich durch die Vorgängeroberfläche: Name, Originalimport mit Rückkehrsicherung, eine tatsächliche NT-Antwort, Lesezeichen, alter Journal- und Einzelversentwurf sowie ein kanonischer Versanker. IndexedDB wird nur lesend beobachtet. Ein gemeinsamer Origin und ein dauerhaftes Chromium-Profil bleiben beim echten Service-Worker-Wechsel erhalten.

Geprüft werden sollen: vier unveränderte rohe V8-Datensätze bis zu neuen ausdrücklichen Aktionen; 71 kanonische Kapitelverse um den logischen Fokus 35–37; Lückenschutz ohne Schreibvorgang; manuelles Kopierfeld bei ausdrücklich simulierter Browser-API-Ablehnung, ohne falsche Erfolgsmeldung; zwei unabhängige Bereichsentwürfe; exakte Bereichsnotiz mit neutralem Fortschritt; Kontextanker 60 außerhalb des Fokus über Reflow und Neustart; alte NT-Antwort, Journalentwurf und sieben A51-Stadien offline; tatsächlicher V9-Download und reine Wiederherstellungsvorschau.

Die Simulation der Clipboard-Ablehnung betrifft nur den Fehlerpfad dieser Browser-API. Sie ist keine reale Betriebssystem-Berechtigungsprüfung. Alle Datenaktionen verwenden die sichtbare App; es gibt keine direkten Storeaufrufe oder IndexedDB-Schreibinjektionen.

Aus `/workspace/faithpath-next` nach ausdrücklicher Bestätigung des Kontrollbuilds starten:

```sh
node docs/evidence/reader-parity/upgrade/offline-upgrade-reader-v9.mjs /workspace/oliva-v0121-book-search-control-dist /workspace/faithpath-next/dist 0.13.0 oliva-71cf17993d0bc7fd
```

Der Runner verweigert das Überschreiben eines vorhandenen Ergebnisberichts. Ein weiterer begründeter Versuch benötigt ein eigenes `OLIVA_EVIDENCE_DIR`; erste Fehlerberichte bleiben erhalten. Absolute Pfade und die eingebauten tatsächlichen Kennungen sind beim Übertragen in eine andere Arbeitsumgebung bewusst anzupassen.

Eine unabhängige Quellprüfung korrigierte vor dem ersten Lauf einen Harnessfehler: Der explizite Verslink des Vorgängers öffnet bereits die Einzelversaktionen. Ein zusätzlicher Klick hätte sie geschlossen; stattdessen wartet der Runner nun auf das tatsächlich geöffnete Panel. Keine Runtime-Datei wurde dafür geändert.
