# GitHub-Versionssicherungen

Am 08.11.2026 wurde ausdrücklich beauftragt, OLIVA 0.5, 0.6 und 0.7 wie zuvor 0.4 auf GitHub zu sichern und dies für folgende Versionen fortzuführen. Ziel ist das bestehende **öffentliche** Repository [`akwasiacheampongma-code/Faithpath-`](https://github.com/akwasiacheampongma-code/Faithpath-). Diese Quellenablage ändert nicht den eigentümerprivaten Zugriff auf die Web-Vorschau und ist keine öffentliche Web-/Storeveröffentlichung.

## Bestätigte Sicherungen vom 08.11.2026

| Version | Unveränderter eigenständiger Quelltag | GitHub-Branch | GitHub-Tag |
| --- | --- | --- | --- |
| 0.5.0 | `oliva-v0.5-a51-private` | `feature/oliva-v05-a51-20261108` | [`oliva-v0.5.0`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.5.0/oliva) |
| 0.6.0 | `oliva-v0.6-book-identities-private` | `feature/oliva-v06-book-identities-20261108` | [`oliva-v0.6.0`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.6.0/oliva) |
| 0.7.0 | `oliva-v0.7-review-continuity-private` | `feature/oliva-v07-review-history-20261108` | [`oliva-v0.7.0`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.7.0/oliva) |

Die drei Branches und drei Tags sind tatsächlich hochgeladen und anschließend per Remote-Ref geprüft. Der `oliva/`-Teilbaum ist jeweils exakt der vollständige eigenständige Quellbaum, einschließlich Assets und Belegen. Der [dauerhafte Sicherungsbeleg](evidence/github/backups-2026-11-08.json) enthält die vollständigen Git-Objektkennungen und den Refvergleich; das äußere Arbeitsmanifest liegt zusätzlich unter `/workspace/oliva-github-backups.json`.

| Version | Eigenständiger Quellcommit | Kombinierter GitHub-Commit |
| --- | --- | --- |
| 0.5.0 | `8266d8dfa8b080603248e232787cc8853eacbf7a` | `76ae5ec49a03cd670925a75893c67cbb228bf9d1` |
| 0.6.0 | `9b28f586574a380ef40419b02fccb68301c8287c` | `b1c3cb608047f67856e24ec7bb1f4935e27f0f5f` |
| 0.7.0 | `f0e8db6b2847d5bfc8361e8f617b8caf0c860787` | `a4c266ddc33e2b8041e2f8608cfdf84292c98cb2` |

Die Stände liegen im Repository jeweils unter **`oliva/`**. Nach einem Checkout dort zuerst `cd oliva` ausführen, anschließend `npm ci`, `npm run build` und `npm run preview`. Die abgeschlossene lokale 0.8-Abnahme und ihre private Vorschau sind vom nächsten GitHub-Sicherungsschritt getrennt; dessen Upload und Remote-CI-Lauf sind noch nicht bestätigt.

Die Bezeichnung `private` der ursprünglichen lokalen Quelltags bezeichnet den damaligen privaten PWA-Arbeitsschritt. Ein Branch oder Tag im öffentlichen GitHub-Repository ist dadurch nicht privat. Historische 0.5-/0.6-Dokumente behalten ihren damaligen Wortlaut; die nachträgliche GitHub-Sicherung wurde erst am 08.11. beauftragt.

## Schutz der bestehenden FaithPath-App

Die eigenständigen OLIVA-Commits werden **nicht direkt** als Wurzel des FaithPath-Repositories veröffentlicht. Stattdessen wird pro Version der vorhandene Top-Level-Baum `oliva` durch den vollständigen Baum des eigenständigen Quellcommits ersetzt. Der erste Elterncommit ist der erhaltene 0.4-Sicherungsstand `df6d2f96c2116a817ca2f63bf6bd00c97925b674`; weitere Versionen bilden eine nachvollziehbare Kette.

Alle ursprünglichen FaithPath-Pfade bleiben bytegleich. Einzige erlaubte Änderung außerhalb `oliva/` ist der bereits für OLIVA ergänzte eigene Workflow `.github/workflows/oliva-quality.yml`: Er darf die neuen OLIVA-Versionsbranches für Tests auswählen. Die ursprünglichen FaithPath-Workflows und Anwendungsdateien werden nicht geändert. Es erfolgen kein Merge nach `main`, kein Push auf `main` und keine Änderung des bisherigen 0.4-Sicherungsbranches.

Vor dem Push werden der vollständige Root-Diff und die Identität des `oliva/`-Teilbaums mit dem eigenständigen Quellbaum geprüft. GitHub und lokale Standalone-Historie haben deshalb unterschiedliche Commit-IDs, aber exakt denselben OLIVA-Dateibaum. Neue Versionstags zeigen auf die kombinierten GitHub-Commits.

Der tatsächliche Remotevergleich bestätigt `main` unverändert bei `d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3` und den alten 0.4-Branch `feature/oliva-next-v02-20261106` unverändert bei `df6d2f96c2116a817ca2f63bf6bd00c97925b674`. Alle ursprünglichen FaithPath-Anwendungspfade sind unverändert; die private Web-Vorschau behält ihren Eigentümerzugriff.

## Tatsächliche GitHub-CI-Ergebnisse

Die frisch heruntergeladenen Laufartefakte und ihre SHA-256-Digests wurden gegen den jeweiligen hochgeladenen Commit geprüft. Upload und erfolgreiche Tests werden getrennt bewertet:

| Version | GitHub-Lauf | Fach-/Persistenztests | Browserfälle | Ergebnis |
| --- | --- | --- | --- | --- |
| 0.5.0 | [42461436132](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42461436132) | 72/72 | 43/45 | Zwei Browserfehler; Quellsicherung vorhanden |
| 0.6.0 | [42461438369](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42461438369) | 75/75 | 52/52 | Grün |
| 0.7.0 | [42461122842](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42461122842) | 116/116 | 59/59 | Grün |

Im historischen 0.5-Lauf blieb die Offline-Bereitschaftsmeldung nach 15 Sekunden aus; ein weiterer Fall maß das fortgesetzte Verseingabefeld bei y=6379 statt unter y=200. Die genaue Ursache beider CI-Fehler ist nicht bewiesen. Der 0.5-Stand und seine roten Ergebnisse bleiben erhalten; es gab keine übersprungenen oder als flaky klassifizierten Browserfälle. Der [CI-Bericht](evidence/github/CI-REPORT-2026-11-08.md) und die [versionierte Prüfdatei](evidence/github/ci-verification-2026-11-08.json) enthalten die Abgrenzung und Artefaktnachweise.

0.5 und 0.6 wurden über den vorhandenen `workflow_dispatch` des reinen OLIVA-Testworkflows gestartet; 0.7 wurde durch den Push ausgelöst. Diese Läufe hatten ausschließlich `contents: read` und führten kein Deployment aus. Die fünf moderaten npm-Befunde und die alte Node-20-Actionlaufzeit des 0.7-Logs sind im Entwicklungsstand 0.8 behandelt; Einzelheiten und Kompatibilitätsgrenzen stehen in [Abhängigkeiten und CI-Laufzeit](14-dependency-security.md). Historische Snapshots werden dafür nicht nachträglich verändert.

## 0.8: Abnahme und privater Vorschauwechsel vor der GitHub-Sicherung

Der tatsächliche lokale 0.8-Stand besteht **117/117 Fach-/Persistenztests und einen einzelnen vollständigen Browserlauf mit 67/67 Fällen**, ohne Überspringen oder Flaky-Ergebnis. `npm audit` meldet 0 Funde. Die finalen Android-/iOS-JavaScript-/Assetexporte und der echte Offline-Updateversuch von 0.7 auf 0.8 sind erfolgreich; diese Exporte sind keine Simulator- oder Geräteabnahme. Die Quellen-/Sicherungsnachweise dieses Abschnitts ersetzen keinen Remote-CI-Lauf.

Die vorhandene [eigentümerprivate Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site) liefert seit **08.11.2026, 13:50:48.918899 UTC** tatsächlich 0.8 aus. Der HTTP-Nachweis bestätigt 16 App-Routen, 101 App-Dateien und 42 Review-Dateien bytegenau; eine anonyme Anfrage erhält 401. Der Zugriff bleibt eigentümerprivat. Eine erfolgreiche private Bereitstellung ist kein GitHub-Upload.

Nach dieser Abnahme sind für den getrennten Quellcheckpoint folgende Kennungen vorgesehen:

| Zweck | Geplante Kennung |
| --- | --- |
| Eigenständiger lokaler Quelltag | `oliva-v0.8-stories-offline-private` |
| Quell-ZIP außerhalb des Gitbaums | `/workspace/oliva-next-v0.8-stories-offline-source.zip` |
| Äußeres Commit-/SHA-256-Manifest | `/workspace/oliva-v08-local-checkpoint.json` |
| GitHub-Versionsbranch | `feature/oliva-v08-stories-offline-20261108` |
| GitHub-Versionstag | `oliva-v0.8.0` |

Beim Schreiben dieses Quellstands ist der GitHub-Push für 0.8 **noch nicht durchgeführt**. Commit- und ZIP-Prüfsummen entstehen erst beim abschließenden lokalen Checkpoint; sie werden nicht vorweggenommen. Der anschließende Push muss den exakten `oliva/`-Teilbaum und die geschützten Remote-Refs erneut prüfen. Sein Ergebnis gehört in das äußere Sicherungsmanifest und in die nächste Fortsetzungsdokumentation. 0.8 wird erst danach als auf GitHub gesichert bezeichnet; ein grüner GitHub-CI-Lauf benötigt zusätzlich seinen eigenen tatsächlichen Laufnachweis.

## Ablauf für folgende Versionen

1. Funktion und passende Tests abschließen; tatsächliche Belege und Einschränkungen dokumentieren.
2. Den eigenständigen Quellstand lokal committen und mit eigenem unveränderlichem Tag sichern. ZIP und SHA-256 bleiben außerhalb des Quellbaums.
3. Den vollständigen Quellbaum unter `oliva/` übernehmen; alle anderen ursprünglichen FaithPath-Pfade anhand ihrer Git-Objekte vergleichen. Größtes neues Blob prüfen; keine Quell-ZIPs oder Zugangsdaten einchecken.
4. Eigenen OLIVA-Versionsbranch und Versions-Tag anlegen. Ausschließlich diese ausdrücklich benannten Refs pushen; kein Force-Push und kein pauschales `--tags`.
5. Remote-Refs und den `oliva/`-Teilbaum zurücklesen, `main` und den 0.4-Branch gegen den vorher gelesenen Stand vergleichen. Erst danach den Upload als abgeschlossen melden.
6. GitHub-Actions-Ergebnisse separat prüfen. Ein lokaler Testlauf oder ein erfolgreicher Push ist kein erfolgreicher CI-Lauf. Danach am nächsten Teilziel des Master-Prompts weiterarbeiten.

Die Git-Authentifizierung verwendet den vorhandenen Standardzugang von `gh`; Tokens werden nicht ausgegeben, in Dateien geschrieben oder als Kommandozeilenargument übergeben. Die drei historischen Quellstände werden vollständig mit Assets und Belegen gesichert; große ZIP-Artefakte gehören nicht als zusätzliche Binärkopien in Git.

Die Nutzungs- und MIT-Ausnahmen aus [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) bleiben bestehen. Die GitHub-Anweisung ersetzt keine unabhängige historische/theologische Prüfung oder allgemeine Weiterveröffentlichungslizenz für übernommene Inhalte.
