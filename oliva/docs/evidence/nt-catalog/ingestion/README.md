# Nachweis des NT-Katalogtransfers

Der Transfer übernimmt den fertigen FaithPath-Finalmaster am Snapshot
`a519ce898fa33907b07d5ac7a585595127556183`. Er erstellt keine neuen Fragen.
Die unveränderten Quellen liegen ausschließlich im
[Quellarchiv](../../../../content/faithpath-nt/provenance.json), die getrennten
Inhaltsrechte in [RIGHTS.md](../../../../content/faithpath-nt/RIGHTS.md).
Dieser Beleg enthält keine Kopie von Fragen, Optionen oder Erklärungen.

- [catalog-check.json](catalog-check.json): deterministische Importprüfung;
  exakt 27 Bücher, 260 Kapitel, 1.300 Fragen und 1.304 Referenzbereiche.
- [offline-check.json](offline-check.json): `--check` in einer isolierten
  Dateikopie ohne Git-Repository, Originalcheckout oder ausführbare Fremdtools.
- [integrity-probes.json](integrity-probes.json): veränderte Laufzeitbytes und
  beschädigte Archivbytes werden in einer temporären Kopie abgewiesen;
  Wiederherstellung besteht erneut.
- [unit-tests.log](unit-tests.log): acht bestandene Vitest-Prüfungen,
  einschließlich aller Original-/Masterfelder, Optionsreihenfolgen,
  JavaScript-/Python-/Node-Hashes, Original-Referenzparser, Schemas und
  defensiven Kopien.
- [typecheck.log](typecheck.log): bestandene TypeScript-Prüfung.

Reproduzierbare Befehle vom Repositoryverzeichnis:

```sh
python3 scripts/import-nt-catalog.py --check
npx vitest run tests/nt-catalog.test.ts
npm run typecheck
```

Zum erneuten Erzeugen der beiden Laufzeitdateien und `catalog-check.json`
`python3 scripts/import-nt-catalog.py` ausführen. Grundlage bleiben die
eingefrorenen Originalbytes; ein Zugriff auf FaithPaths Git-Repository ist
dabei nicht erforderlich. Die originale JavaScript-Referenzauflösung wird
zusätzlich im Test direkt aus ihrem Archiv geladen und mit allen
1.300 Referenztexten verglichen.

Die Prüfungen belegen technische Inhaltserhaltung und Referenzgültigkeit.
Die historische redaktionelle Nutzerfreigabe stammt aus dem eingefrorenen
Finalmaster und Abschlussbericht. Hier erfolgten weder eine erneute
theologische Fachprüfung noch eine Excel-Neuberechnung oder neue
Original-App-/Geräteabnahme.
