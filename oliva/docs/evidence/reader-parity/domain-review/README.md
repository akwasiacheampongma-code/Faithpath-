# Reader: übergebene Eingaben vor der Warteschlange besitzen

Am 15.11.2026 zeigten fünf gezielte, tatsächlich ausgeführte Regressionen fünf Fehler: Methoden der Leser-/Entwurfsverwaltung verwendeten übergebene Referenzen, Wörter oder erwartete Revisionen erst nach einem wartenden Vorgängerschreibvorgang. Eine spätere Mutation desselben Aufruferobjekts konnte dadurch den angeforderten Bereich verändern oder einen veralteten Editor unerlaubt an eine neuere Revision anpassen. Die alten roten Berichte bleiben unverändert unter `reproduction.json` (vier Fälle) und `reproduction-with-finish.json` (fünf Fälle) erhalten.

Die bereits vor der Sitzungsunterbrechung umgesetzte Korrektur validiert und kopiert `openReading`-Referenzen, die optionale Position samt Referenz sowie `saveEditorDraft`-Entwurf/Wörter/Quelle/Schlüssel vor dem ersten Warten. `saveEditorDraft` und `finishEditorDraft` besitzen außerdem einen abgetrennten Erwartungsstand aus ID und Revision. Ein als Erwartung übergebener vollständiger gespeicherter Entwurf bleibt zulässig; nur seine beiden Vertragsfelder werden übernommen. `finishEditorDraft` erfasst den Stand synchron im sofort aufgerufenen `action`-Arbeitsblock vor dem Einreihen von `persist`.

Die Schreibreihenfolge, CAS gegen `current.revision`, No-op- und Bereichsguards, Aktionssperre und vorhandene `false`-/`null`-Fehlerantworten bleiben bestehen. Lesen, Positionsänderungen und Bereichsnotizen lösen weiterhin kein zusätzliches Wachstum aus. Der vollständige kleine Quelldiff zu dem tatsächlich gesicherten Vorherstand steht in `store-snapshot-fix.diff`.

## Frische Prüfung am 16.11.2026

- **277/277 globale Fachtests in 32 Dateien bestanden**, Exitcode 0, keine Fehler oder ausstehenden Tests. Darin bestehen alle fünf konkreten Warteschlangenregressionen.
- **Globaler Typecheck bestanden**, Exitcode 0.
- Die fünf eingefrorenen historischen Quellen einschließlich der exakten V8-Kopie stimmen bytegenau mit dem geprüften 0.12-Commit `a6f82509a2b2b72436e23aa417844f26067589fe` überein.
- Eine unabhängige, ausschließlich lesende Quellprüfung bestätigt die Snapshot-Zeitpunkte und unveränderten Persistenzverträge.

Rohberichte: [globale Fachtests](unit-results-final.json), [Typecheck](typecheck-final.txt), [Verifikation](verification-final.json), [historische Hashes](source-comparison-final.json). Der frühere gezielte 35/35-Lauf in `targeted-results.json` ist ein zusätzlicher historischer Nachweis und wird nicht als dieser neue Gesamtlauf ausgegeben.

Die frische Prüfung änderte keine Runtime-Dateien, Pakete, Versionsnummern oder Deployments. Sie betrifft den laufenden Reader-Arbeitsstand; die Paketkennung 0.12 dieses Entwicklungscheckouts ist kein neu abgenommener 0.12-Release. Die Buchsuche 0.12.1 liegt in einer separaten Arbeitskopie. Die Speichertests verwenden einen kontrolliert zurückgehaltenen Vorgängerschreibvorgang und Storage-Mocks. Browser-, native Export-, Simulator- oder Gerätetests werden hier nicht behauptet.
