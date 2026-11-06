# Fortsetzen · OLIVA / FaithPath Next Generation

Checkpoint: 06.11.2026 · OLIVA 0.2.0 · Nutzdatenformat 2.

## Repository und Arbeitsbereich

- Repository: https://github.com/akwasiacheampongma-code/Faithpath-
- Sicherungsbranch: `feature/oliva-next-v02-20261106`
- Verzeichnis im Branch: `oliva/` (eigenständiges Projekt).
- Unveränderte FaithPath-Basis: `a519ce898fa33907b07d5ac7a585595127556183`, ursprünglicher Branch `feature/simplified-step-experience-20261104`.
- Lokales neues Projekt dieser Sitzung: `/workspace/faithpath-next`.
- Lokale Referenzkopie: `/workspace/faithpath-reference`. Nicht für Änderungen am neuen Produkt verwenden.
- Die Dateien der bisherigen FaithPath-Anwendung und bestehende Branches bleiben unverändert. Kein Merge und kein Deployment sind Teil dieses Checkpoints.

## Ziel und verbindliche Vorgaben

Eine eigenständige deutschsprachige Bibel- und Glaubens-App entwickeln. Lesen → Verstehen → freiwillige Reflexion → Anwendung im Alltag. Keine kopierten Designs/Quelltexte, keine Glaubensränge oder manipulativen Streaks. Bibeltext, KI-unterstützte redaktionelle Entwürfe und künstlerische Interpretation klar unterscheiden. Persönliche Daten lokal, bis eine Person einem späteren Sync bewusst zustimmt. Keine Behauptung, dass die Gesamtfreigabe bereits abgeschlossen sei.

Die Funktionsanalyse und Feature-Matrix stehen in `docs/00-faithpath-audit.md`. Roadmap und Einschränkungen: `docs/delivery-status.md`. Aktuelle Iteration: `docs/06-personal-and-drafts.md`.

## Tatsächlich umgesetzt

- Expo / React Native / TypeScript, Expo Router, Zustand, Zod; SQLite nativ, IndexedDB in der Webvorschau.
- Vollständige gemeinfreie Lutherbibel 1912: 66 Bücher, 1.189 Kapitel, 31.102 Verse. Original-USFM und reproduzierbarer Import enthalten.
- Reader mit Buch-/Kapitelwahl, Suche, zwei Modi, Schrift-/Abstandseinstellungen, Notizen, Lesezeichen, Markierungen und bestätigtem Fortschritt.
- Neun geführte Wege mit je drei Schritten; neun eigene Pilot-Einordnungen werden thematisch wiederverwendet. Theologische Fachfreigabe steht aus.
- Persönlicher Hub, sieben Olivenbaumstadien und 66 Buchschwert-Identitäten als parametrisierte Vektorfamilie.
- Journal mit Bearbeiten/Löschen/Undo; JSON-Export und geprüfter, ausdrücklich bestätigter Restore.
- Seit 0.2: persönliche Vorhaben, eigene Schritte, Bibelbezug aus einer Versaktion, Archiv/Wiederaufnahme und Rückblicke mit unveränderten Quell-Snapshots.
- Dauerhafte Entwürfe für Journal, Vorhaben, eigene Schritte und Rückblicke. Geordnete Commit-Warteschlange, Entwurfs-ID-/Revisionsprüfung, Schutz gegen veraltete Quellen, atomarer Abschluss mit Entwurfsentfernung.
- Verlustfreie Prüfung/Migration bestehender OLIVA-V1-Daten auf V2; alte OLIVA-Sicherungen bleiben importierbar.
- Drei generierte Pilotbilder mit Provenienz. Weitere Bildszenen und unabhängige historische/theologische Freigaben sind offen.

## Nachgewiesener Prüfstand vor diesem GitHub-Checkpoint

- 30 Fach-/Persistenztests bestanden: `docs/evidence/unit-results.json`.
- 16 Browser-Szenarien bestanden, 0 Fehler/übersprungen: `docs/evidence/e2e-results.json`.
- Strikte TypeScript-Prüfung bestanden: `docs/evidence/typecheck.log`.
- Web-, Android- und iOS-JavaScript-/Asset-Bundles erfolgreich exportiert: `docs/evidence/builds.json`. Keine signierten APK-/IPA-Dateien oder physischen Gerätetests behauptet.
- Web-Offline-Neustart, Speicherfehler, zwei Fenster, Export/Restore, echte V1-Datenbankmigration, Entwurfswiederherstellung und Snapshot-Erhalt geprüft.
- Zwölf neue Bildschirmaufnahmen der Vorhaben-/Entwurfsansichten: `docs/evidence/personal-screens/`.
- Frühere Hauptansichten: `docs/evidence/screens/`.
- 390 materialisierte Referenzdateien wurden mit den unveränderten Git-Blobs des FaithPath-Snapshots verglichen: `docs/evidence/reference-integrity.json`.

Die vorhandenen Nachweise wurden für diesen Dokumentations-/GitHub-Checkpoint nicht als neu durchgeführte Tests ausgegeben. Neue funktionale Änderungen müssen passend geprüft werden.

## Starten nach Checkout

```sh
git switch feature/oliva-next-v02-20261106
cd oliva
npm ci
npm run build
npm run preview
```

Danach http://localhost:4173 öffnen. Auf kleinen Displays werden fünf beschriftete Navigationsziele gezeigt. Einstieg: „Deine erste Geschichte“. Persönliche Vorhaben: Wege → Deine persönlichen Vorhaben. Keine API-Schlüssel für den lokalen Kern nötig.

Im bisherigen lokalen Arbeitsbereich liegt zusätzlich ein fertiger Webexport unter `/workspace/faithpath-next/dist`; dort genügt `node scripts/serve.mjs dist`. Generierte Exporte, `node_modules`, lokale Umgebungsdateien und ZIP-Pakete gehören nicht in den GitHub-Quellcheckpoint. Der komplette Quellstand enthält Assets, Originalkorpus, Lockfile, Tests und Dokumentation zum erneuten Bauen.

## Nächster vereinbarter Entwicklungsschritt: FaithPath-V5-Import

Der Nutzer hat dem sicheren Import als nächstem Schritt zugestimmt. Noch kein V5-Importer implementiert.

1. Den tatsächlichen alten Exportvertrag lesen: `src/store.js`, `src/import-validation.js`, `DATA_CONTRACTS.md` und die zugehörigen Backup-/Journalmodelle im unveränderten FaithPath-Basissnapshot. Nicht das OLIVA-V1-Schema mit FaithPath-V5 verwechseln.
2. Bestehende Wege auf persönliche Vorhaben abbilden; geführte Lesekurse bleiben eine andere Entität. Notizen, Reflexionsspiegel, Bibelreferenzen, Markierungen und historische Quellenbezüge ohne doppelte oder verlorene Texte zuordnen.
3. Zunächst nur eine lokale Vorschau erzeugen: Anzahl und Art der Inhalte, nicht abbildbare Felder, Konflikte und erhaltene Originaldaten nennen. Keine schreibende Mutation beim bloßen Öffnen/Prüfen.
4. Vor endgültiger Übernahme OLIVA-Bestand sichern. Erst eine ausdrücklich beschriftete Bestätigung führt einen atomaren Import aus. IDs stabil halten und wiederholten Import idempotent behandeln; keine fremden persönlichen Texte überschreiben.
5. Mit synthetischen Fixtures aus dem belegten alten Vertrag testen. Ein anonymisierter echter V5-Export ist für eine zusätzliche reale Abnahme hilfreich, aber die Implementierung muss nicht darauf warten.
6. Beschädigte/zu große/unbekannte Sicherungen, doppelte IDs, fehlende Referenzen, wiederholten Import, Speicherfehler und bestehende OLIVA-Daten prüfen. Neustart, Offline und Quellen-Snapshots im Browser nachweisen.
7. Dokumentation, Lieferstand und Testnachweise aktualisieren. Keine Änderungen an bestehenden FaithPath-Dateien und kein Merge/Deploy ohne entsprechenden Auftrag.

## Weitere offene Bereiche

Cloud-Sync/Auth und KI-Begleiter sind nicht angeschlossen. Optionales Supabase-DDL ist nur vorbereitet und nicht gegen eine Live-Instanz abgenommen. Die kleinen Eingabefelder im Hub, Garten, Reader und geführten Lernweg sind noch nicht vollständig auf das neue Entwurfssystem umgestellt. Native Geräte, VoiceOver/TalkBack, große Systemschrift, echtes Release-Update/Rollback, Inhalts-/Rechtefreigaben und Store-Veröffentlichung bleiben offen.

## Umgang mit `/resume`

Diese Datei ist der dauerhafte, repositorygebundene Fortsetzungsstand. Es gibt hier kein Tool, das den Codex-Oberflächenbefehl `/resume` auslösen kann. In einer fortgesetzten Sitzung zuerst diese Datei und den aktuellen Lieferstand lesen und anschließend am V5-Import weiterarbeiten. Keinen erfolgten UI-Resume oder eine im Hintergrund weiterlaufende Arbeit behaupten.
