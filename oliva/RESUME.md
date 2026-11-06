# Fortsetzen · OLIVA / FaithPath Next Generation

Checkpoint: 06.11.2026 · OLIVA 0.3.0 · Nutzdatenformat 3.

## Repository und Arbeitsbereich

- Repository: https://github.com/akwasiacheampongma-code/Faithpath-
- Sicherungsbranch: `feature/oliva-next-v02-20261106` (enthält inzwischen 0.3).
- Eigenständiges Projekt im Branch: `oliva/`.
- Vorheriger Quellcheckpoint: `d05ba5cd98036f3c2fb639c9026ffb86b2a899bd`.
- Unveränderte FaithPath-Basis: `a519ce898fa33907b07d5ac7a585595127556183`, ursprünglicher Branch `feature/simplified-step-experience-20261104`.
- Lokales neues Projekt: `/workspace/faithpath-next`; lokale Referenz: `/workspace/faithpath-reference`.
- Bestehende FaithPath-Dateien bleiben unverändert. Kein Merge, Deployment oder Schreiben persönlicher Daten in fremde Dienste.

## Ziel und verbindliche Vorgaben

Eigenständige deutschsprachige Bibel- und Glaubens-App: Lesen → Verstehen → freiwillige Reflexion → Anwendung im Alltag. Keine kopierten Designs oder Quelltexte, keine Glaubensränge und manipulativen Streaks. Bibeltext, KI-unterstützte redaktionelle Entwürfe und künstlerische Interpretation unterscheiden. Persönliche Daten bleiben lokal, bis späterem Sync bewusst zugestimmt wird. Keine abgeschlossene Gesamtfreigabe behaupten.

Audit und Feature-Matrix: `docs/00-faithpath-audit.md`. Roadmap und Einschränkungen: `docs/delivery-status.md`. Aktuelle Iteration: `docs/07-faithpath-import.md`.

## Tatsächlich umgesetzt

- Expo 58 / React Native / TypeScript, Expo Router, Zustand, Zod; SQLite nativ, IndexedDB im Web.
- Vollständige gemeinfreie Lutherbibel 1912: 66 Bücher, 1.189 Kapitel, 31.102 Verse. Original-USFM und reproduzierbarer Import enthalten.
- Reader mit Buch-/Kapitelwahl, Suche, zwei Modi, Schrift-/Abstandseinstellungen, Notizen, Lesezeichen, fünf darstellbaren Markierungsfarben und bestätigtem Fortschritt. Im Editor werden Olive und Gold angeboten; die drei weiteren Farben bewahren FaithPath-Importe.
- Neun geführte Wege mit je drei Schritten, neun thematisch wiederverwendeten redaktionellen Pilot-Einordnungen und freiwilliger Reflexion/Gebet. Fachliche Freigabe offen.
- Persönlicher Hub, sieben Olivenbaumstadien, 66 Themenidentitäten der Buchschwerter als parametrisierte Vektorfamilie.
- Journal, bestätigtes Löschen/Undo, JSON-Export und geprüfter ausdrücklich bestätigter OLIVA-Restore.
- Persönliche Vorhaben, eigene Schritte, Bibelbezug, Archiv/Wiederaufnahme und Rückblicke mit unveränderten Snapshots.
- Dauerhafte Entwürfe für Journal, Vorhaben, eigene Schritte und Rückblicke. Commit-Warteschlange, Entwurfsstempel, Quellrevision und atomarer Abschluss schützen den Bestand.
- Seit 0.3: additiver FaithPath-V5-Import über Datei oder JSON, lesende Vorschau, stabile IDs/Spiegelaliase, Konflikt-/Löschschutz, Originalarchiv mit unverändertem Export, historische Rückblicke und Quellen am Vorhaben, lokale atomare Rückkehrsicherung mit separater Bestätigung.
- OTB-Bezüge werden gekennzeichnet und nicht dem Luther-Reader untergeschoben. Importierte Vergangenheit erzeugt keine neue Baumstufe oder freiwillige Anwendung.
- Nutzdaten V1/V2→V3. Native physische DB 1→2 (`local_recovery`); Web-DB bleibt physisch 1, zusätzlicher Sicherungsschlüssel im vorhandenen Store.
- Drei generierte Pilotbilder mit Provenienz; weitere Motive und externe Fachfreigaben offen.

## Belegter Prüfstand für 0.3

- 46 Fach-/Persistenztests bestanden: `docs/evidence/unit-results.json`.
- 22 Browser-Szenarien bestanden, 0 Fehler/übersprungen: `docs/evidence/e2e-results.json`.
- Strikte TypeScript-Prüfung erfolgreich; Expo-Paketkompatibilität geprüft.
- Web-, Android- und iOS-JavaScript-/Asset-Exporte erfolgreich: `docs/evidence/builds.json`. Keine APK/IPA oder echten Geräte getestet.
- Neue V5-Fälle: tatsächlicher Dateidialog, Abbruch ohne Mutation, eindeutige Spiegel, OTB-Grenze, exakter Originaldownload, historischer Snapshot, Offline-Neustart, Wiederholung, zwei Fenster, Speicherfehler und Rückkehr nach späteren Änderungen.
- Native Adapterlogik gegen Nodes echte SQLite-Engine geprüft: physische Migration, Revision/Token und Rollback bei Fehler nach dem Sicherungsschreibvorgang. Kein Expo-Gerätenachweis.
- Zehn neue Import-Screens mobil/groß: `docs/evidence/import-screens/`; frühere Screens bleiben erhalten.
- 390 materialisierte Referenzdateien erneut mit unveränderten Original-Git-Blobs verglichen: `docs/evidence/reference-integrity.json`.
- Erster 0.3-Browserlauf: 21/22. Veraltete Testannahme zum identischen Zweitimport korrigiert. Abschließender Lauf: 22/22.

## Starten nach Checkout

```sh
git switch feature/oliva-next-v02-20261106
cd oliva
npm ci
npm run build
npm run preview
```

http://localhost:4173 öffnen. Lokaler Arbeitsbereich dieser Sitzung: `/workspace/faithpath-next`; fertiger Webexport unter `dist/`. Tests: `npm test`, `npm run typecheck`, `npm run test:e2e`. Native Bundleexports: `node scripts/expo.mjs export --platform android --output-dir dist-android`, entsprechend `ios`.

Exportdateien, `node_modules`, ZIP-Pakete und lokale Umgebungsdateien werden nicht im GitHub-Quellcheckpoint gespeichert. Der CI-Workflow in `oliva/.github/` ist eine Vorlage für ein eigenständiges Repository und wird unter diesem Unterverzeichnis nicht automatisch ausgeführt. Bestehende Root-Workflows bleiben unverändert.

## Nächste sinnvolle Iteration

1. Dauerhafte Entwürfe und Speicherfehler-Verhalten auf die kleinen Eingabefelder im Hub, Garten, Reader und geführten Weg erweitern. Bestehende Entwurfsstempel/Quellschutz wiederverwenden, getippte Worte bei Navigation/Neustart bewahren, keine ungefragte Bestätigung von Anwendung.
2. V5-Import zusätzlich an einem anonymisierten echten Export prüfen, falls verfügbar. Die bestehende Implementierung benötigt ihn nicht zum Weiterarbeiten. Kein persönlicher Export ins Repository oder in Logs.
3. Native Geräteabnahme: Dateiauswahl, externe Dateifreigabe, Expo-SQLite-Transaktionen, Prozessabbruch, Low-Disk, Hardware-Zurück, Tastatur, VoiceOver/TalkBack und große Schrift.
4. Vor großen realen Datenbeständen unveränderliche Archiv-Blobs vom Gesamtpayload trennen und inkrementelles Speichern messen. Heute wird bei kleinen Entwurfs-Commits auch die archivierte Quelle kopiert/serialisiert; 64 MiB ist eine Sicherheitsgrenze, kein Leistungsnachweis.

## Verbleibende Grenzen

FaithPath-Quelle bis 10 MiB UTF-8 (altes System bis 20 MiB), Gesamtbackup bis 64 MiB. Nicht zuordenbare Inhalte bleiben einsehbar im Originalarchiv. Nur eine lokale Rückkehrsicherung; der nächste Import ersetzt sie, eine erfolgreiche Rückkehr verbraucht sie. Rückkehr ersetzt auch spätere Texte und verlangt eine eindeutige Bestätigung. Daten/Exporte sind nicht zusätzlich verschlüsselt.

Cloud-Sync/Auth, Live-KI und Audio sind nicht angeschlossen. Optionales Supabase-DDL ist nicht live abgenommen und benötigt für spätere neue Funktionen weitere Migrationen. Reale Anfänger-Usability, fachliche Inhalts-/Bildfreigaben, Store-Signing und öffentliche Veröffentlichung bleiben offen. Die Gesamt-Definition-of-Done des Master-Prompts ist nicht erreicht.

## Umgang mit `/resume`

Diese Datei ist der dauerhafte Fortsetzungsstand. Ein Tool zum Auslösen des Codex-Oberflächenbefehls `/resume` ist hier nicht verfügbar. Nach Wiederaufnahme zuerst diese Datei und den Lieferstand lesen und am nächsten Teilziel weiterarbeiten. Keinen erfolgten UI-Resume oder eigenständig im Hintergrund weiterlaufende Arbeit behaupten.
