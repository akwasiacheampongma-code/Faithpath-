# FaithPath-Quellen und Rechte

Die Dateien in `source/` sind unveränderte, verlustfrei mit gzip archivierte
Quellen aus FaithPath, Snapshot
`a519ce898fa33907b07d5ac7a585595127556183`. Dateipfade, Originalhashes und
Archivhashes stehen in [provenance.json](provenance.json).

Der Nutzer hat die Wiederverwendung des fertigen NT-Katalogs für diese
Integration beauftragt. Die redaktionelle Freigabe steht im eingefrorenen
Original-Abschlussbericht und im normalisierten Finalmaster. Das ist keine
allgemeine Lizenz oder unabhängige neue theologische Prüfung.

Die MIT-Lizenz des OLIVA-Programmcodes erstreckt sich **nicht** auf diese
übernommenen FaithPath-Quellen und ihre daraus abgeleiteten Katalogtexte in
`src/data/nt-catalog.json` und Kapiteltitel in `src/data/nt-index.json`.
Eine allgemeine öffentliche Weitergabeerlaubnis oder Rechte Dritter werden
aus dem Integrationsauftrag nicht abgeleitet. Die ursprünglichen Rechte
bleiben vorbehalten; hier wird keine zusätzliche Inhaltslizenz erteilt.

`python3 scripts/import-nt-catalog.py --check` prüft die eingefrorenen
Originalbytes, die Gleichheit mit dem Finalmaster, alle Referenzverse und die
deterministischen Laufzeitdateien ohne Zugriff auf das ursprüngliche Git-Repo.
