# Echte PWA-Upgradeprüfung 0.12.1 → 0.13.0

**Bestanden am 16.11.2026, 09:26:26–09:27:05 UTC, Exitcode 0.** Der maßgebliche zweite Lauf liegt unter [oliva-71cf17993d0bc7fd-r2](oliva-71cf17993d0bc7fd-r2/verification.json). Ausgangspunkt ist der unveränderliche 0.12.1-Kern `oliva-75717978bae05979`; Ziel ist der tatsächlich gebaute 0.13.0-Kern `oliva-71cf17993d0bc7fd`.

Derselbe Origin und dasselbe dauerhafte Chromium-Profil bleiben beim echten Wechsel von aktivem Worker und Controller erhalten. Die Testdaten entstehen ausschließlich durch die Vorgängeroberfläche; alle IndexedDB-Beobachtungen lesen nur. Vier rohe V8-Werte bleiben bis zur ersten neuen ausdrücklichen Datenaktion exakt serialisiert erhalten. Die neue Bereichsnotiz und ihre Entwürfe schreiben V9 ausschließlich über die sichtbare App. Originalarchiv, Rückkehrsicherung und Rückkehrindex bleiben während aller Aktionen exakt; alte Journal-/Einzelversentwürfe, Originalnotizen, NT-Antworten, Lesefortschritt und Baumstand bleiben inhaltlich unverändert.

Tatsächlich geprüft:

- 71 kanonische Johannesverse um den logischen Fokus 35–37, ohne automatische Kapitelbestätigung.
- Lückenschutz ohne Schreibvorgang; exaktes schreibgeschütztes Kopierfeld ohne falsche Erfolgsmeldung, wenn die Clipboard-API ausdrücklich für diesen Fehlerfall abgelehnt wird. Dies ist keine Prüfung einer echten Betriebssystemberechtigung.
- Getrennte Entwürfe für 35–36 und 35–37; Wiederaufnahme und Speicherung einer Notiz mit exakt demselben Quellbereich.
- Kontextanker 60 außerhalb des Fokus nach Offline-Neustart und Reflow bei 390, 1440 und 320 Pixeln; Abschnittssprung fokussiert tatsächlich Vers 35.
- Vorhandene NT-Antwort und alter Journalentwurf sowie alle sieben A51-Stadien offline.
- Tatsächlicher V9-Sicherungsdownload und validierte Wiederherstellungsvorschau. Es wurde keine Wiederherstellung angewendet.

Alle 327 eingefrorenen Quelldateien und beide HTML-/Workerdateien sind vor und nach dem Lauf unverändert. Der Ergebnisprüfer [verify-upgrade-r2.py](verify-upgrade-r2.py) prüft Berichte, Hashes, gespeicherte Herkunftsbereiche und sämtliche drei Nicht-main-Rohwertzusammenfassungen erneut. Sechs echte Browserbilder sind zusammen mit ihren SHA-256-Werten im [Prüfbericht](oliva-71cf17993d0bc7fd-r2/verification.json) erfasst.

## Erster Fehler und begründete Harnesskorrektur

Der erste echte Lauf endete bei der Prüfung des Kontextankers mit Exitcode 1. [Sein Bericht](oliva-71cf17993d0bc7fd/offline-upgrade.json), Runner und Ausführungslog bleiben erhalten. Erwartete und gelesene logische Daten waren strikt inhaltsgleich; allein die Einfügereihenfolge der Schlüssel einer gerade neu gespeicherten Notiz änderte sich durch das kanonische Schema (`ref` vor den Zeitstempeln). Die [unabhängige Prüfung](logical-comparison-review.json) bestätigt null geänderte Schlüssel oder Werte und unveränderte Arrayreihenfolgen.

Nur der Vergleich logischer Inhalte nach ausdrücklichen Schreibaktionen wurde von JSON-Zeichenkettenvergleich auf `toStrictEqual` geändert. Die exakten serialisierten Rohwertvergleiche vor neuen Aktionen und für die drei Nicht-main-Datensätze bleiben unverändert. Keine App-, Datenmodell-, Paket-, Versions- oder Builddatei wurde dafür angepasst. Der alte Lauf wird nicht als bestanden bezeichnet.

## Wiederholen und Grenzen

Aus `/workspace/faithpath-next` mit erhaltenem Kontrollbuild, installierten Abhängigkeiten und Chromium starten. Ein neues Ergebnisverzeichnis wählen; vorhandene Berichte werden ausdrücklich nicht überschrieben:

```sh
OLIVA_EVIDENCE_DIR=/tmp/oliva-reader-upgrade-repeat-01 node docs/evidence/reader-parity/upgrade/offline-upgrade-reader-v9.mjs /workspace/oliva-v0121-book-search-control-dist /workspace/faithpath-next/dist 0.13.0 oliva-71cf17993d0bc7fd
python3 docs/evidence/reader-parity/upgrade/verify-upgrade-r2.py
```

Der zweite Befehl verifiziert den archivierten erfolgreichen Lauf; er ersetzt keinen neuen Browserlauf. Der Runner sperrt auf die tatsächlichen Versions-, Build- und Quellkennungen. Bei einem anderen Checkout sind die Projekt-/Kontrollpfade bewusst anzupassen; bei einem anderen Kandidaten ist eine neue dokumentierte Abnahme nötig.

Dies ist lokale automatisierte Chromiumprüfung unter Linux. Keine gehostete Sites-Browserprüfung, physische Handy-, Simulator-, native Screenreader-, Energie- oder Speicherprüfung. Die erfolgreiche lokale Upgradeprüfung ist kein Beleg für ein Deployment und erklärt die gesamte Master-Definition-of-Done nicht für abgeschlossen.
