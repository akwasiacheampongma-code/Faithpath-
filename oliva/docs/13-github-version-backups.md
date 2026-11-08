# GitHub-Versionssicherungen

Am 08.11.2026 wurde ausdrücklich beauftragt, OLIVA 0.5, 0.6 und 0.7 wie zuvor 0.4 auf GitHub zu sichern und dies für folgende Versionen fortzuführen. Ziel ist das bestehende **öffentliche** Repository [`akwasiacheampongma-code/Faithpath-`](https://github.com/akwasiacheampongma-code/Faithpath-). Diese Quellenablage ändert nicht den eigentümerprivaten Zugriff auf die Web-Vorschau und ist keine öffentliche Web-/Storeveröffentlichung.

## Sicherungsplan

| Version | Unveränderter eigenständiger Quelltag | GitHub-Branch | GitHub-Tag |
| --- | --- | --- | --- |
| 0.5.0 | `oliva-v0.5-a51-private` | `feature/oliva-v05-a51-20261108` | `oliva-v0.5.0` |
| 0.6.0 | `oliva-v0.6-book-identities-private` | `feature/oliva-v06-book-identities-20261108` | `oliva-v0.6.0` |
| 0.7.0 | `oliva-v0.7-review-continuity-private` | `feature/oliva-v07-review-history-20261108` | `oliva-v0.7.0` |

Die Stände liegen im Repository jeweils unter **`oliva/`**. Nach einem Checkout dort zuerst `cd oliva` ausführen, anschließend `npm ci`, `npm run build` und `npm run preview`. Die Tabelle legt die Zielrefs fest; sie behauptet vor dem tatsächlichen Push noch keinen abgeschlossenen Upload. Der bestätigte Abgleich wird im äußeren Arbeitsmanifest `/workspace/oliva-github-backups.json` aufgezeichnet und im nächsten Lieferstand übernommen.

Die Bezeichnung `private` der ursprünglichen lokalen Quelltags bezeichnet den damaligen privaten PWA-Arbeitsschritt. Ein Branch oder Tag im öffentlichen GitHub-Repository ist dadurch nicht privat. Historische 0.5-/0.6-Dokumente behalten ihren damaligen Wortlaut; die nachträgliche GitHub-Sicherung wurde erst am 08.11. beauftragt.

## Schutz der bestehenden FaithPath-App

Die eigenständigen OLIVA-Commits werden **nicht direkt** als Wurzel des FaithPath-Repositories veröffentlicht. Stattdessen wird pro Version der vorhandene Top-Level-Baum `oliva` durch den vollständigen Baum des eigenständigen Quellcommits ersetzt. Der erste Elterncommit ist der erhaltene 0.4-Sicherungsstand `df6d2f96c2116a817ca2f63bf6bd00c97925b674`; weitere Versionen bilden eine nachvollziehbare Kette.

Alle ursprünglichen FaithPath-Pfade bleiben bytegleich. Einzige erlaubte Änderung außerhalb `oliva/` ist der bereits für OLIVA ergänzte eigene Workflow `.github/workflows/oliva-quality.yml`: Er darf die neuen OLIVA-Versionsbranches für Tests auswählen. Die ursprünglichen FaithPath-Workflows und Anwendungsdateien werden nicht geändert. Es erfolgen kein Merge nach `main`, kein Push auf `main` und keine Änderung des bisherigen 0.4-Sicherungsbranches.

Vor dem Push werden der vollständige Root-Diff und die Identität des `oliva/`-Teilbaums mit dem eigenständigen Quellbaum geprüft. GitHub und lokale Standalone-Historie haben deshalb unterschiedliche Commit-IDs, aber exakt denselben OLIVA-Dateibaum. Neue Versionstags zeigen auf die kombinierten GitHub-Commits.

## Ablauf für folgende Versionen

1. Funktion und passende Tests abschließen; tatsächliche Belege und Einschränkungen dokumentieren.
2. Den eigenständigen Quellstand lokal committen und mit eigenem unveränderlichem Tag sichern. ZIP und SHA-256 bleiben außerhalb des Quellbaums.
3. Den vollständigen Quellbaum unter `oliva/` übernehmen; alle anderen ursprünglichen FaithPath-Pfade anhand ihrer Git-Objekte vergleichen. Größtes neues Blob prüfen; keine Quell-ZIPs oder Zugangsdaten einchecken.
4. Eigenen OLIVA-Versionsbranch und Versions-Tag anlegen. Ausschließlich diese ausdrücklich benannten Refs pushen; kein Force-Push und kein pauschales `--tags`.
5. Remote-Refs und den `oliva/`-Teilbaum zurücklesen, `main` und den 0.4-Branch gegen den vorher gelesenen Stand vergleichen. Erst danach den Upload als abgeschlossen melden.
6. GitHub-Actions-Ergebnisse separat prüfen. Ein lokaler Testlauf oder ein erfolgreicher Push ist kein erfolgreicher CI-Lauf. Danach am nächsten Teilziel des Master-Prompts weiterarbeiten.

Die Git-Authentifizierung verwendet den vorhandenen Standardzugang von `gh`; Tokens werden nicht ausgegeben, in Dateien geschrieben oder als Kommandozeilenargument übergeben. Die drei historischen Quellstände werden vollständig mit Assets und Belegen gesichert; große ZIP-Artefakte gehören nicht als zusätzliche Binärkopien in Git.

Die Nutzungs- und MIT-Ausnahmen aus [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) bleiben bestehen. Die GitHub-Anweisung ersetzt keine unabhängige historische/theologische Prüfung oder allgemeine Weiterveröffentlichungslizenz für übernommene Inhalte.
