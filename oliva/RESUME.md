# Fortsetzen · OLIVA / FaithPath Next Generation

Checkpoint: 06.11.2026 · OLIVA 0.4.0 · Nutzdatenformat 4 · SQLite physisch 3 · IndexedDB physisch 1.

## Repository und Arbeitsbereich

- Repository: https://github.com/akwasiacheampongma-code/Faithpath-
- Sicherungsbranch: `feature/oliva-next-v02-20261106` (enthält inzwischen 0.4).
- Eigenständiges Projekt im Branch: `oliva/`.
- Geprüfter Runtime-Commit: `dbde76fcc7ab155cc5acabfd7f2a1ba996ab121c`.
- Erfolgreicher CI-Lauf: https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42240609694 (64 Fachtests, 35 Browserfälle, keine Fehler/übersprungen).
- Vorheriger Quellcheckpoint: `f90fcfb8176b5f793c4c51b7360fdc1e67112e13` (0.3).
- Unveränderte FaithPath-Basis: `a519ce898fa33907b07d5ac7a585595127556183`, ursprünglicher Branch `feature/simplified-step-experience-20261104`.
- Lokales neues Projekt: `/workspace/faithpath-next`; lokale Referenz: `/workspace/faithpath-reference`.
- Bestehende FaithPath-Dateien bleiben unverändert. Neu hinzu kommt ausschließlich ein OLIVA-Root-Workflow; kein Merge oder Deployment.

## Ziel und Vorgaben

Den ursprünglichen Master-Prompt weiter ausführen: Lesen → Verstehen → freiwillige Reflexion → Anwendung im Alltag. Keine kopierten Designs/Quelltexte, keine Glaubensränge oder manipulativen Streaks. Bibeltext, KI-unterstützte redaktionelle Entwürfe und künstlerische Interpretation unterscheiden. Persönliche Daten bleiben lokal. Innerhalb einer Sitzung selbstständig weiterarbeiten; nicht nach jeder Phase eine Bestätigung verlangen oder das Gesamtziel als abgeschlossen ausgeben.

Audit: `docs/00-faithpath-audit.md`. Lieferstand: `docs/delivery-status.md`. Aktuelle Iteration: `docs/08-continuity-and-offline.md`. GitHub-/CI-Nachweis: `docs/evidence/ci-run.json`; Berichte unverändert aus dem erfolgreichen Artefakt übernommen.

## Tatsächlich implementiert

- Expo 58 / React Native / TypeScript, Expo Router, Zustand, Zod; SQLite nativ, IndexedDB im Web.
- Vollständige gemeinfreie Lutherbibel 1912: 66 Bücher, 1.189 Kapitel, 31.102 Verse; Original-USFM und reproduzierbarer Import.
- Reader mit Navigation/Suche, zwei Modi, Schrift/Abstand, Versnotizen, Lesezeichen, fünf darstellbaren Markierungsfarben (Editor: Olive/Gold), explizitem Kapitel-/Abschnittsfortschritt und gezieltem Verssprung.
- Neun geführte Wege mit je drei Schritten; neun thematisch wiederverwendete Einordnungen und neun eigene freiwillige Textfragen mit tatsächlichen Versen als Beleg. Fachfreigabe offen.
- Hub, sieben Olivenbaumstadien und 66 parametrisierte Buchschwert-Identitäten ohne spirituelle Rangliste.
- Journal, bestätigtes Löschen/Undo, normale Sicherung/Restore; persönliche Vorhaben, eigene Schritte, Archiv/Wiederaufnahme und Rückblicke mit bewahrten Snapshots.
- Dauerhafte Entwürfe auch für Hub, Garten, Vers und geführten Schritt. Sammlung → Entwürfe führt zur Quelle zurück. Tippen erzeugt keinen Lernabschluss oder bestätigte Alltagserfahrung.
- RAM-Puffer schützt noch ungesicherte Worte nach Speicherfehlern innerhalb der Sitzung; Besitzer-/Abschlusskennung verhindert alte Editorüberschreibungen und Geisterentwürfe. Separater Export ungesicherter Worte. Kein Schutz gegen Prozessabbruch ohne dauerhafte Speicherung.
- Additiver FaithPath-V5-Import mit Dateiauswahl/JSON, Vorschau, stabilen IDs/Spiegelaliasen, Schutz lokaler Änderungen, Originalarchiv und atomarer Rückkehrsicherung. OTB bleibt als fremde Übersetzung gekennzeichnet. Importierte Vergangenheit erzeugt keinen neuen Fortschritt.
- Private Archiv-Blobs entkoppeln große Quelltexte vom kleinen Speicherdokument; Originalquellen bleiben Bestandteil vollständiger Backups. Schreibvorgang, Revision, Sicherung und Blobbereinigung sind atomar.
- Beschädigte Daten blockieren normale Routen statt leeren Bestand zu erzeugen. Unveränderter Rohdatenexport zur technischen Reparatur; native Dateifreigabe noch nicht auf einem Expo-Gerät geprüft.
- Sieben generierte/angesehene Bildmaster, 18 WebP-Varianten, Provenienz und getrennte Freigabestände. Neue Erzählpiloten Noah, Abraham, Geburt und Ostermorgen im optionalen Geschichtenbereich und vertieften Reader.
- Vollständiges Offline-Paket mit genauer Build-ID, sichtbarer Bereitschaft und Vorgänger-Assetcache. Tatsächlicher 0.3→0.4-Offlinewechsel geprüft, kein erzwungener Reload.

## Belegter lokaler Prüfstand

- 64/64 Fach-/Persistenztests und 35/35 Browserfälle im tatsächlichen GitHub-Lauf erfolgreich, keine Browserfehler/übersprungen/flaky. Fünf gezielte lokale Regressionen bestanden. Früherer Lastlauf (34/35) und erster CI-Lauf (33/35) sind als historische Fehlernachweise erhalten. Die zwei CI-Testabläufe warten vor Neustart nun auf den tatsächlichen Speicherabschluss.
- Strikte TypeScript-Prüfung, Korpusreproduzierbarkeit und Bildhashes erfolgreich.
- Regulärer Produktions-Webexport und finale native Debug-JS-/Asset-Exporte mit `--no-minify --no-bytecode`. Frühere Hermes-Exporte sind gesondert belegt; keine APK/IPA und keine physischen Geräte getestet.
- Native Adapterlogik gegen Nodes echte SQLite-Engine geprüft; kein Expo-Gerätenachweis.
- Getrennt gebauter 0.3-Kontrollstand → 0.4 → Netz aus → Neustart: Profil, Notizen, Vorhaben, offener Journalentwurf und genaue Originalquelle bewahrt (`offline-upgrade.json`).
- Neue Hauptzustände werden mobil/groß unter `docs/evidence/session-04-screens/` dokumentiert; frühere Screens erhalten.
- Referenzintegrität und Quellhashes werden vor dem finalen Sicherungscheckpoint erneut geprüft. Der tatsächliche CI-Lauf ist erfolgreich; der abschließende Folgecommit enthält nur Dokumentation und Evidenz.

## Starten nach Checkout

```sh
git switch feature/oliva-next-v02-20261106
cd oliva
npm ci
npm run build
npm run preview
```

http://localhost:4173 öffnen. Lokale Projektkopie: `/workspace/faithpath-next`. Tests: `npm run typecheck`, `npm test`, `npm run test:e2e`. Inhaltsprüfungen: `npm run content:check`, `npm run content:art`. Native Bundleexports: `node scripts/expo.mjs export --platform android --output-dir dist-android`, entsprechend `ios`.

Der neue Root-Workflow `.github/workflows/oliva-quality.yml` ruft die gemeinsame Qualitätsaction in `oliva/.github/actions/quality/` auf. Der Standalone-Workflow unter `oliva/.github/workflows/` funktioniert in einem eigenen Repository. Bestehende FaithPath-Workflows bleiben unverändert. Keine Deployment-Schritte.

## Nächste überprüfbare Arbeit

1. Präzise Lesefortsetzung ausbauen: sichtbaren Vers als Anker bewahren und nach Neustart bzw. Schriftgrößenwechsel sinnvoll fortsetzen; daraus keine zusätzliche Lesebestätigung erzeugen.
2. Freiwillige Erinnerungen und Rückblickbearbeitung ergänzen; die vorhandenen Entwurfs-/Quellschutzverträge weiterverwenden.
3. Weitere eigenständige Kapitelredaktion und Anfänger-Usability prüfen. Die neun Pilottexte sind keine 27 unabhängigen Kapitelredaktionen. Bildwelt erst nach unabhängiger Fachprüfung breit skalieren.
4. Native Geräteabnahme: Dateidialoge, SQLite, Prozessabbruch/Low-Disk, Hardware-Zurück, Tastatur, VoiceOver/TalkBack, große Schrift und reduzierte Bewegung.
5. V5-Import zusätzlich an einem anonymisierten echten Export prüfen, falls verfügbar. Kein persönlicher Export ins Repository oder in Logs.
6. Optionalen Sync/KI erst mit tatsächlichem Dienst und vollständigen Daten-/Quellenverträgen anschließen. Supabase-DDL ist Vorbereitung und benötigt weitere Migrationen.

## Grenzen

FaithPath-Quelle bis 10 MiB UTF-8, vollständiges Backup bis 64 MiB. Kleine Commits schreiben bestehende Quell-Blobs nicht erneut; erstes Laden/Export bleibt speicherintensiv und ist nicht auf schwachen Geräten vermessen. Eine Rückkehrsicherung; nächster Import ersetzt sie, erfolgreiche Rückkehr verbraucht sie. Daten/Exporte unverschlüsselt. Rohdatenrettung und ungesicherte Sitzungskopie sind keine normalen automatisch wiederherstellbaren Backups.

Auth/Sync, Live-KI und Audio nicht angeschlossen. Reale Anfänger-Studie, unabhängige Inhalts-/Bildfreigaben, Store-Signing und öffentliche Veröffentlichung offen. Die Gesamt-Definition-of-Done ist nicht erreicht.

## Umgang mit `/resume`

Diese Datei ist der dauerhafte Fortsetzungsstand. Ein Tool zum Auslösen des Codex-Oberflächenbefehls `/resume` ist hier nicht verfügbar. Nach Wiederaufnahme zuerst diese Datei und den Lieferstand lesen und am nächsten Teilziel weiterarbeiten. Keinen erfolgten UI-Resume oder eigenständig im Hintergrund weiterlaufende Arbeit behaupten.
