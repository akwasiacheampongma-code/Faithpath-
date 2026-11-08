# GitHub-Versionssicherungen

Am 08.11.2026 wurde ausdrücklich beauftragt, OLIVA 0.5, 0.6 und 0.7 wie zuvor 0.4 auf GitHub zu sichern und dies für folgende Versionen fortzuführen. Ziel ist das bestehende **öffentliche** Repository [`akwasiacheampongma-code/Faithpath-`](https://github.com/akwasiacheampongma-code/Faithpath-). Diese Quellenablage ändert nicht den eigentümerprivaten Zugriff auf die Web-Vorschau und ist keine öffentliche Web-/Storeveröffentlichung.

## Bestätigte Sicherungen vom 08.11.2026

| Version | Unveränderter eigenständiger Quelltag | GitHub-Branch | GitHub-Tag |
| --- | --- | --- | --- |
| 0.5.0 | `oliva-v0.5-a51-private` | `feature/oliva-v05-a51-20261108` | [`oliva-v0.5.0`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.5.0/oliva) |
| 0.6.0 | `oliva-v0.6-book-identities-private` | `feature/oliva-v06-book-identities-20261108` | [`oliva-v0.6.0`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.6.0/oliva) |
| 0.7.0 | `oliva-v0.7-review-continuity-private` | `feature/oliva-v07-review-history-20261108` | [`oliva-v0.7.0`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.7.0/oliva) |
| 0.8.0 | `oliva-v0.8-stories-offline-private` | `feature/oliva-v08-stories-offline-20261108` | [`oliva-v0.8.0`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.8.0/oliva) |

Die vier Branches und vier Tags sind tatsächlich hochgeladen und anschließend per Remote-Ref geprüft. Der `oliva/`-Teilbaum ist jeweils exakt der vollständige eigenständige Quellbaum, einschließlich Assets und Belegen. Der [aktuelle Sicherungsbeleg einschließlich 0.8](evidence/session-09/checkpoints/oliva-github-backups.json) bestätigt alle acht Versionsrefs am 08.11.2026 um 13:56:15 UTC; das äußere Arbeitsmanifest liegt zusätzlich unter `/workspace/oliva-github-backups.json`. Der frühere [Beleg nur für 0.5–0.7](evidence/github/backups-2026-11-08.json) bleibt unverändert erhalten.

| Version | Eigenständiger Quellcommit | Kombinierter GitHub-Commit |
| --- | --- | --- |
| 0.5.0 | `8266d8dfa8b080603248e232787cc8853eacbf7a` | `76ae5ec49a03cd670925a75893c67cbb228bf9d1` |
| 0.6.0 | `9b28f586574a380ef40419b02fccb68301c8287c` | `b1c3cb608047f67856e24ec7bb1f4935e27f0f5f` |
| 0.7.0 | `f0e8db6b2847d5bfc8361e8f617b8caf0c860787` | `a4c266ddc33e2b8041e2f8608cfdf84292c98cb2` |
| 0.8.0 | `e6aa7f5ab552bb983264c1b4cc253c72728d5740` | `dc4477b01dcd78f278e5dbf82408b26c83837ec1` |

Die Stände liegen im Repository jeweils unter **`oliva/`**. Nach einem Checkout dort zuerst `cd oliva` ausführen, anschließend `npm ci`, `npm run build` und `npm run preview`. Der 0.8-Upload ist bestätigt. Der zusätzliche Remote-CI-Lauf wird getrennt geprüft; lokale Abnahme und erfolgreicher Upload sind kein vorweggenommener grüner CI-Nachweis. Die laufende 0.9-Entwicklung besitzt noch keinen abgenommenen Versions-Tag oder bestätigten GitHub-Quellcheckpoint.

Die Bezeichnung `private` der ursprünglichen lokalen Quelltags bezeichnet den damaligen privaten PWA-Arbeitsschritt. Ein Branch oder Tag im öffentlichen GitHub-Repository ist dadurch nicht privat. Historische 0.5-/0.6-Dokumente behalten ihren damaligen Wortlaut; die nachträgliche GitHub-Sicherung wurde erst am 08.11. beauftragt.

## Schutz der bestehenden FaithPath-App

Die eigenständigen OLIVA-Commits werden **nicht direkt** als Wurzel des FaithPath-Repositories veröffentlicht. Stattdessen wird pro Version der vorhandene Top-Level-Baum `oliva` durch den vollständigen Baum des eigenständigen Quellcommits ersetzt. Der erste Elterncommit ist der erhaltene 0.4-Sicherungsstand `df6d2f96c2116a817ca2f63bf6bd00c97925b674`; weitere Versionen bilden eine nachvollziehbare Kette.

Alle ursprünglichen FaithPath-Pfade bleiben bytegleich. Einzige erlaubte Änderung außerhalb `oliva/` ist der bereits für OLIVA ergänzte eigene Workflow `.github/workflows/oliva-quality.yml`: Er darf die neuen OLIVA-Versionsbranches für Tests auswählen. Ab 0.8 verwendet dieser eigene Aufrufworkflow außerdem den verifizierten Node-24-Checkout-Pin; die zugehörigen Action-Pins und der Audit-Schritt liegen im eigenen `oliva/`-Teilbaum. Die ursprünglichen FaithPath-Workflows und Anwendungsdateien werden nicht geändert. Es erfolgen kein Merge nach `main`, kein Push auf `main` und keine Änderung des bisherigen 0.4-Sicherungsbranches.

Vor dem Push werden der vollständige Root-Diff und die Identität des `oliva/`-Teilbaums mit dem eigenständigen Quellbaum geprüft. GitHub und lokale Standalone-Historie haben deshalb unterschiedliche Commit-IDs, aber exakt denselben OLIVA-Dateibaum. Neue Versionstags zeigen auf die kombinierten GitHub-Commits.

Der tatsächliche Remotevergleich bestätigt `main` unverändert bei `d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3` und den alten 0.4-Branch `feature/oliva-next-v02-20261106` unverändert bei `df6d2f96c2116a817ca2f63bf6bd00c97925b674`. Alle ursprünglichen FaithPath-Anwendungspfade sind unverändert; die private Web-Vorschau behält ihren Eigentümerzugriff.

## Tatsächliche GitHub-CI-Ergebnisse

Die heruntergeladenen Laufartefakte und SHA-256-Digests von 0.5 bis 0.7 wurden gegen den jeweiligen hochgeladenen Commit geprüft. Für 0.8 ist die gesonderte Artefaktprüfung noch ausstehend. Upload und erfolgreiche Tests werden getrennt bewertet:

| Version | GitHub-Lauf | Fach-/Persistenztests | Browserfälle | Ergebnis |
| --- | --- | --- | --- | --- |
| 0.5.0 | [42461436132](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42461436132) | 72/72 | 43/45 | Zwei Browserfehler; Quellsicherung vorhanden |
| 0.6.0 | [42461438369](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42461438369) | 75/75 | 52/52 | Grün |
| 0.7.0 | [42461122842](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42461122842) | 116/116 | 59/59 | Grün |
| 0.8.0 | [42487317354](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42487317354) | Noch nicht aus Remote-Artefakt bestätigt | Noch nicht aus Remote-Artefakt bestätigt | Separate Verifikation ausstehend |

Im historischen 0.5-Lauf blieb die Offline-Bereitschaftsmeldung nach 15 Sekunden aus; ein weiterer Fall maß das fortgesetzte Verseingabefeld bei y=6379 statt unter y=200. Die genaue Ursache beider CI-Fehler ist nicht bewiesen. Der 0.5-Stand und seine roten Ergebnisse bleiben erhalten; es gab keine übersprungenen oder als flaky klassifizierten Browserfälle. Der [CI-Bericht](evidence/github/CI-REPORT-2026-11-08.md) und die [versionierte Prüfdatei](evidence/github/ci-verification-2026-11-08.json) enthalten die Abgrenzung und Artefaktnachweise.

0.5 und 0.6 wurden über den vorhandenen `workflow_dispatch` des reinen OLIVA-Testworkflows gestartet; 0.7 wurde durch den Push ausgelöst. Diese Läufe hatten ausschließlich `contents: read` und führten kein Deployment aus. Die fünf moderaten npm-Befunde und die alte Node-20-Actionlaufzeit des 0.7-Logs sind im Entwicklungsstand 0.8 behandelt; Einzelheiten und Kompatibilitätsgrenzen stehen in [Abhängigkeiten und CI-Laufzeit](14-dependency-security.md). Historische Snapshots werden dafür nicht nachträglich verändert.

## Bestätigter 0.8-Quellcheckpoint und private Vorschau

Der tatsächliche lokale 0.8-Stand besteht **117/117 Fach-/Persistenztests und einen einzelnen vollständigen Browserlauf mit 67/67 Fällen**, ohne Überspringen oder Flaky-Ergebnis. `npm audit` meldet 0 Funde. Die finalen Android-/iOS-JavaScript-/Assetexporte und der echte Offline-Updateversuch von 0.7 auf 0.8 sind erfolgreich; diese Exporte sind keine Simulator- oder Geräteabnahme. Die Quellen-/Sicherungsnachweise dieses Abschnitts ersetzen keinen Remote-CI-Lauf.

Die vorhandene [eigentümerprivate Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site) liefert seit **08.11.2026, 13:50:48.918899 UTC** tatsächlich 0.8 aus. Der HTTP-Nachweis bestätigt 16 App-Routen, 101 App-Dateien und 42 Review-Dateien bytegenau; eine anonyme Anfrage erhält 401. Der Zugriff bleibt eigentümerprivat. Eine erfolgreiche private Bereitstellung ist kein GitHub-Upload.

Nach dieser Abnahme wurde der getrennte Quellcheckpoint tatsächlich erzeugt und am 08.11.2026 um 13:56 UTC auf GitHub gesichert:

| Zweck | Bestätigte Kennung |
| --- | --- |
| Eigenständiger lokaler Quellcommit | `e6aa7f5ab552bb983264c1b4cc253c72728d5740` |
| Eigenständiger Quellbaum | `421aca57649651fad606c2825565bea767146971` |
| Eigenständiger lokaler Quelltag | `oliva-v0.8-stories-offline-private` |
| Quell-ZIP außerhalb des Gitbaums | `/workspace/oliva-next-v0.8-stories-offline-source.zip` |
| ZIP-Größe / CRC | 120.935.687 Byte; alle ZIP-Einträge auf CRC geprüft |
| ZIP-SHA-256 | `82c564902e453b638a84c6487098abe769fb828094c8bdb1c4b772b81cde40ca` |
| Äußeres Commit-/SHA-256-Manifest | `/workspace/oliva-v08-local-checkpoint.json` |
| Kombinierter GitHub-Commit | `dc4477b01dcd78f278e5dbf82408b26c83837ec1` |
| GitHub-Versionsbranch | `feature/oliva-v08-stories-offline-20261108` |
| GitHub-Versionstag | `oliva-v0.8.0` |

Der [lokale Checkpointbeleg](evidence/session-09/checkpoints/oliva-v08-local-checkpoint.json) und der [Remotevergleich](evidence/session-09/checkpoints/oliva-github-backups.json) sind im nachfolgenden Entwicklungsstand dauerhaft abgelegt. Der exakte `oliva/`-Teilbaum, alle acht Versionsrefs sowie unverändertes `main` und der unveränderte 0.4-Branch sind bestätigt. Historische 0.8-Dokumente beschreiben ihren damaligen Stand vor diesem nachgelagerten Push und werden nicht rückwirkend umgeschrieben.

Der zusätzliche [GitHub-Lauf 42487317354](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42487317354) wurde durch den Push für Head `dc4477b01dcd78f278e5dbf82408b26c83837ec1` gestartet. Sein Abschluss, die tatsächlichen Testzahlen und der Artefaktdigest werden separat verifiziert; dieser Dokumentstand behauptet dafür noch kein grünes Ergebnis. 0.9 bleibt laufende Entwicklung ohne abgenommenen Release oder bestätigten Versionsupload.

## Ablauf für folgende Versionen

1. Funktion und passende Tests abschließen; tatsächliche Belege und Einschränkungen dokumentieren.
2. Den eigenständigen Quellstand lokal committen und mit eigenem unveränderlichem Tag sichern. ZIP und SHA-256 bleiben außerhalb des Quellbaums.
3. Den vollständigen Quellbaum unter `oliva/` übernehmen; alle anderen ursprünglichen FaithPath-Pfade anhand ihrer Git-Objekte vergleichen. Größtes neues Blob prüfen; keine Quell-ZIPs oder Zugangsdaten einchecken.
4. Eigenen OLIVA-Versionsbranch und Versions-Tag anlegen. Ausschließlich diese ausdrücklich benannten Refs pushen; kein Force-Push und kein pauschales `--tags`.
5. Remote-Refs und den `oliva/`-Teilbaum zurücklesen, `main` und den 0.4-Branch gegen den vorher gelesenen Stand vergleichen. Erst danach den Upload als abgeschlossen melden.
6. GitHub-Actions-Ergebnisse separat prüfen. Ein lokaler Testlauf oder ein erfolgreicher Push ist kein erfolgreicher CI-Lauf. Danach am nächsten Teilziel des Master-Prompts weiterarbeiten.

Die Git-Authentifizierung verwendet den vorhandenen Standardzugang von `gh`; Tokens werden nicht ausgegeben, in Dateien geschrieben oder als Kommandozeilenargument übergeben. Die bestätigten Quellstände werden vollständig mit Assets und Belegen gesichert; große ZIP-Artefakte gehören nicht als zusätzliche Binärkopien in Git.

Die Nutzungs- und MIT-Ausnahmen aus [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) bleiben bestehen. Die GitHub-Anweisung ersetzt keine unabhängige historische/theologische Prüfung oder allgemeine Weiterveröffentlichungslizenz für übernommene Inhalte.

## Tatsächliche Remote-Abnahme 0.8

Lauf [42487317354](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42487317354) endete am 08.11.2026 um 14:04:09 UTC erfolgreich am exakten Versionshead `dc4477b01dcd78f278e5dbf82408b26c83837ec1`: **117/117 Fachtests und 67/67 Browserfälle**, ohne Skip oder Flaky-Ergebnis. Artefakt `13620585577`, 8.179.373 Byte, SHA-256 `a5739f6dde394f463fa179c19480e3d83053fa1024b12100d430fa670ff28248`, entspricht GitHub. Expliziter npm-Audit mit 0 Funden; alle vier eigenen Node-24-Pins im Log bestätigt. [Prüfdatei und Rohbelege](evidence/github/ci-v08/verification.json). Frühere Angaben zum laufenden Abgleich beschreiben dessen damaligen Zeitpunkt.

## Tatsächlich bestätigte Sicherung und Remote-Abnahme 0.9

Quellcommit `0f4cf3df79dee8d572427cd17db70d98101980ec`, Quelltag `oliva-v0.9-book-gallery-private`, ZIP 133.979.517 Byte, SHA-256 `2f01f3af16c189ee58fa5bdfd4fe08aebd2accb5c691ee7df2094ffa6ce4a1fb`. [Manifest](evidence/invitations/checkpoints/oliva-v09-local-checkpoint.json).

[GitHub-Tag `oliva-v0.9.0`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.9.0/oliva) und Branch `feature/oliva-v09-book-gallery-20261108` zeigen auf `29e082d0254ccc6754bacebfcc65a6fd09639c17`; der `oliva/`-Teilbaum ist exakt. Alle zehn Versionsrefs sowie unverändertes `main`, alter 0.4-Branch und ursprüngliche FaithPath-Pfade sind im [Remotevergleich](evidence/invitations/checkpoints/oliva-github-backups.json) bestätigt.

[Lauf 42517524350](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42517524350), erster Versuch, endete 08.11.2026 um 20:05:09 UTC erfolgreich: **120/120 Fachtests und 76/76 Browserfälle**, keine Skips, Flaky-Fälle oder Wiederholungen. Artefakt `13631949152`, 8.872.878 Byte, SHA-256 `4b45627dff92d01e5e12d0fa9f6638ddaffc136a82f40ed8c789dbe2763eada4`, entspricht GitHub. Audit 0 und vier eigene Node-24-Pins beobachtet. [Prüfung und Rohbelege](evidence/github/ci-v09/verification.json). Kein Deployment durch CI; kein Merge oder Eingriff in historische Tags.

Der neue 0.10-Kandidat wird erst nach eigener vollständiger Abnahme separat gesichert. Sein Erfolg wird aus 0.9 nicht abgeleitet.
