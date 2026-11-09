# Tatsächliche GitHub-CI-Abnahme 0.10

[Run 42520979658](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42520979658) lief per Push auf dem exakten Versionscommit `adcb582842fb31252b844d2949c7fb67fbf4668d`, Branch `feature/oliva-v010-invitations-20261108`, im ersten Versuch erfolgreich. Beginn: 08.11.2026, 20:36:19 UTC; abgeschlossen: 20:45:13 UTC.

**154/154 Fachtests und 82/82 Browserfälle bestanden.** Kein Fall schlug fehl, wurde übersprungen oder als flaky eingeordnet. Jeder Browserfall besitzt genau einen Ergebnisversuch mit Retry 0. Die Erstellzeiten beider Berichte liegen innerhalb dieses tatsächlichen CI-Laufs; es wurden keine lokalen Vorgängerberichte als Remote-Ergebnis übernommen.

Artifact `13634195056` wurde über den GitHub-Connector heruntergeladen. Seine **9.046.438 Byte** haben SHA-256 `6f00138548c2fed8f2573ee4bad1f28e6f8144edd7f4b048e6aaf5594437e74b`; der Wert entspricht GitHubs Digest. Alle **92 ZIP-Einträge** wurden per CRC geprüft und gegen Pfadüberschreitungen kontrolliert. ZIP und entpackte Dateien bleiben außerhalb des Quellbaums unter `/workspace/oliva-github-ci/v010/`.

Typprüfung, Korpus-/Bildnachweise, Web-/PWA-Build und ausdrücklicher `npm audit --audit-level=moderate` sind erfolgreich; der Audit meldet null Schwachstellen. Alle vier dokumentierten Node-24-Actionpins erscheinen im Joblog. Der Remote-Webbuild hat Kennung `oliva-630e6e09f183d522`: ein Build aus dem exakten GitHub-Head, dessen Ausgabebytes von lokalen und privaten Hostartefakten getrennt zu betrachten sind.

`run.json` und `runs-discovery.json` sind vollständige GitHub-REST-Antworten. `jobs.json` und `artifacts.json` bewahren die strukturierten Connector-Antworten. `job.log` ist dessen unveränderter dekodierter Text. Die vier Ergebnis-/Integritätsberichte sind bytegenau aus dem geprüften ZIP kopiert. `verification.json` enthält die maschinenlesbare Abnahme, `SHA256SUMS` die Dateihashes.

Der Nachweis betrifft Linux-Web-, Fachlogik- und Persistenztests auf GitHub Actions. Er ist kein nativer Geräte-/Simulatortest und keine authentifizierte Browserprüfung der privaten Website. Es wurde kein neuer Lauf gestartet, kein historischer Tag geändert und weder Deployment, Merge noch Kommentar ausgeführt.
