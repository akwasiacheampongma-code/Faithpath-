# OLIVA 0.13.0: CI-Prüfung vorbereitet

Diese Dateien dokumentieren ausschließlich die Vorbereitung für den tatsächlich vorhandenen Reader-Kandidaten 0.13.0. Es wurde für diesen Auftrag kein GitHub-Lauf gesucht, abgefragt, gestartet oder wiederholt. Erst nach Roots Bestätigung des neuen, tatsächlich gepushten Combined-SHA und des eigenständigen Quellcheckpoints darf die Prüfung beginnen.

Erwartete Quelle: `/workspace/faithpath-next`, GitHub-Branch `feature/oliva-v013-reader-parity-20261116`, GitHub-Tag `oliva-v0.13.0`, lokaler Quelltag `oliva-v0.13-reader-parity-private`. Die autorisierten Kennungen stammen aus dem tatsächlichen Release-Kandidaten und dem vorbereiteten Release-Vertrag; eigene neue Commit- oder Run-IDs werden nicht vorweggenommen.

Die drei Haupthelfer prüfen Quellenidentität, tatsächlichen Lauf und Ergebnisdokumentation. Sie erwarten 290 Fachtests und 126 Browserfälle, jeweils ohne Skips, Flaky-Ergebnisse oder Wiederholungen. Berichtzeitstempel werden gegen reale geloggte Schrittfenster geprüft; ZIP-Größe, GitHub-Digest, alle CRCs und rohe Berichtsbytes werden abgeglichen. Vier tatsächlich geladene Node-24-Actions, Audit null und unveränderte historische 0.11-Fehlläufe gehören zu den Gates. Der tatsächlich beobachtete Remote-Build wird getrennt vom lokalen Kern `oliva-71cf17993d0bc7fd` dokumentiert. Abschließend ist eine zweite unabhängige Prüfung vorgesehen.

`preparation.json` nennt die fünf syntaktisch geprüften Helfer und ihre SHA-256-Werte. Downloadfähigkeiten und vollständige Connector-Rückgaben bleiben im Sitzungsspeicher. Der Downloadhelfer nimmt die URI ausschließlich über verborgenes stdin entgegen und erwartet exakte API-Größe sowie API-SHA-256; er schreibt nur die ZIP nach `/tmp/oliva-ci-v013-artifact.zip`. Der Loghelfer speichert exakt den dekodierten Terminal-Logtext nach einer Geheimnisprüfung und gibt nur Kennungen, Bytezahl und Hash aus. Niemals URI-Werte oder rohe verschachtelte Downloadmetadaten zur Inspektion ausgeben.

Vorhandene Nachweise für 0.12.1 bleiben unverändert. Diese Vorbereitung verändert weder Produktquellcode noch Versionen, Git-Refs, Workflows, Zugriffsrechte oder Deployments.
