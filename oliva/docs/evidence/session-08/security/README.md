# Sicherheitsbelege · 08.11.2026

`audit-and-probe/` ist eine bytegenaue Kopie der vorhandenen Audit- und isolierten Probeberichte aus `/workspace/oliva-security-audit/reports/dependencies-0.8/`. Alle regulären Dateien wurden übernommen. Der lokale `fingerprint-fixture/node_modules`-Symlink wurde ausgelassen; weder installierte Pakete noch Buildverzeichnisse wurden kopiert. [archive-integrity.json](archive-integrity.json) enthält relative Pfade, Größe und SHA-256 jeder kopierten Datei.

Die Dokumente beschreiben unterschiedliche tatsächliche Zeitpunkte:

- [DEPENDENCY-SECURITY-REPORT.md](audit-and-probe/DEPENDENCY-SECURITY-REPORT.md): ursprünglicher Read-only-Audit mit fünf moderaten Funden und späterem Hinweis auf die abgeschlossene isolierte Probe.
- [OVERRIDE-PROBE-REPORT.md](audit-and-probe/probe/OVERRIDE-PROBE-REPORT.md): begrenzter Linux-/Node-24-Nachweis mit eingefrorenem 0.7-Projektinput; 116 Tests, Exporte und sieben echte API-Prüfgruppen. Kein Beleg für einen abschließenden aktuellen 0.8-Browserlauf.
- [FINGERPRINT-PROBE-REPORT.md](audit-and-probe/probe/FINGERPRINT-PROBE-REPORT.md), [Resultate](audit-and-probe/probe/fingerprint-api-probe-results.json), [Harness](audit-and-probe/probe/fingerprint-api-probe.mjs): echte API-/Altbaum-/Ignore-/Abbruchprüfung mit dokumentierten Major-Semantikänderungen. Der Harness enthält historische lokale Pfade; für Wiederholung auf isolierte Kopien anpassen und neue Ausgabepfade wählen.
- [github-actions-runtime-verification.json](audit-and-probe/github-actions-runtime-verification.json): offizielle Releases, Tagziele und Node-24-Actiondefinitionen. Ein Pin ist kein ausgeführter Remote-CI-Nachweis.
- [adoption-snapshot.json](adoption-snapshot.json): aktuelles 0.8-Manifest/Lock und Verweis auf den nach Übernahme tatsächlich gelaufenen [Audit ohne Funde](../dependency-audit-after.json). Andere 0.8-Abnahmen werden getrennt geführt.

Die Rohberichte und Logs wurden inhaltlich nicht umgeschrieben. Angaben wie „noch nicht übernommen“ gelten deshalb für die jeweilige frühere Phase. Die aktuelle technische Entscheidung und ihre Grenzen stehen in [docs/14-dependency-security.md](../../../14-dependency-security.md).
