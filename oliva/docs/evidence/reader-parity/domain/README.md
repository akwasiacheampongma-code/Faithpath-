# Reine Auswahl- und Kopierfachlogik

Ausgangspunkt ist der unveränderte OLIVA-0.12-Stand `a6f8250`. Die neue Fachlogik liegt ausschließlich in `src/features/bible/selection.ts`; Textquelle bleiben das vorhandene Repository und dessen Luthertext. Das FaithPath-Original wurde nur im Snapshot `a519ce898fa33907b07d5ac7a585595127556183` gelesen.

## Vertrag für die Integration

| Funktion | Ergebnis und Grenze |
| --- | --- |
| `toggleVerseSelection(logicalReference, selected, verse)` | Neues numerisch sortiertes Array. Genau ein kanonischer Vers wird hinzugefügt oder entfernt. Eine vorläufige Lücke bleibt erhalten. |
| `selectionReference(logicalReference, selected)` | Neue exakte Referenz mit `from` und `to` für eine nichtleere zusammenhängende Auswahl. Bei leerer Auswahl eine neue Kopie der logischen Referenz, entsprechend dem ursprünglichen `currentRef()`. Auswahlaktionen müssen vor Aufruf eine nichtleere Auswahl verlangen. |
| `displayReference(logicalReference)` | Neue `{ book, chapter }`-Referenz nach Prüfung des logischen Scopes. |
| `formatBibleCopy(reference)` | Referenzlabel, LF, je kanonischem Vers Nummer + Leerzeichen + unveränderter Text, LF, `Lutherbibel 1912`. Keine zusätzliche Abschlusszeile. |

Die Mitgliedschaft ausgewählter Verse wird gegen das **vollständige enthaltene Kapitel** geprüft. Ein gültiger Kontextvers außerhalb der logischen Fokusgrenzen ist erlaubt. Buch, Kapitel und Fokusgrenzen müssen selbst gültig sein. Ungültige Versnummern und doppelte Einträge werden vor einem Ergebnis abgewiesen; Eingaben werden nie verändert. Eine Bereichsreferenz schließt keine Lücken. Sie wirft `SelectionError` mit `code: "non-contiguous"` und exakt `Bitte wähle zusammenhängende Verse aus.`. Weitere Fehlercodes sind `invalid-reference`, `invalid-verse` und `duplicate-verse`.

Unbegrenzte Kopierreferenzen behalten ein Vollkapitellabel. Für vom Repository bereits erlaubte einseitige Grenzen benennt das Label ausdrücklich den tatsächlich kopierten ersten und letzten Vers; zum Beispiel wird `{ book: "JHN", chapter: 6, to: 2 }` als `Johannes 6,1–2` beschriftet. Die Formatfunktion fügt keine Übersetzungsangabe zum Referenzlabel hinzu. `Lutherbibel 1912` erscheint genau einmal als Fußzeile.

Das Modul hält keinen Sitzungs- oder Appzustand und importiert weder Store noch Fortschritts-, Lern- oder Wachstumslogik. Es implementiert keine Zwischenablage und begründet keine Web-, Geräte- oder Screenreaderbehauptung. Auswahllebensdauer, zuletzt betätigter Vers, Fokusführung und Plattformaufrufe liegen bei der Integration.

## Gelesene Originalstellen

- `src/app.js:567–572`: sortierte Auswahl, genaue Grenzen, unveränderte Lückenmeldung.
- `src/app.js:585–587`: gültige Auswahl vor logischer Readerreferenz.
- `src/app.js:1433–1443`: Referenzlabel, nummerierte unveränderte Verse mit LF, vollständiger Übersetzungsname.
- Der vorbereitende Bericht `docs/evidence/reader-parity-preparation/reader-parity-preparation.md` bindet vollständigen Kapitelkontext und die vorhandene kanonische Textquelle.

## Ausgeführte Prüfung

`npx vitest run tests/reader-selection.test.ts tests/reader-flow.test.ts` bestand: **2 Dateien, 22 Tests**. Davon sind 11 neue Auswahl-/Kopierfälle und 11 bestehende Fließtextfälle. Die neuen Fälle prüfen:

- Hinzufügen in beiden Reihenfolgen, einzelnes Entfernen, leere Auswahl und unabhängige Referenzobjekte.
- Sichtbare Lücken ohne automatisches Auffüllen sowie spätere ausdrückliche Ergänzung.
- Kapitelkontext vor/hinter `1SA 17,38–45`, unbekannte Bücher/Kapitel/Verse, doppelte und nichtganzzahlige Nummern und Versnummern fremder Kapitel.
- Psalm 119 mit allen 176 Versen und seinen beiden Kapitelgrenzen.
- Einen fest ausgeschriebenen JHN-6,35–36-Kopierstring mit Umlauten, `daß`, En-Dash und LF; Einzelvers-, Vollkapitel- und einseitige Bereichsgrenzen.
- Strikte String- und UTF-16-Längengleichheit des Kopiertexts gegen alle **31.102** unveränderten Repositoryverse in **1.189** Kapiteln; keine Textnormalisierung oder Quellmutation.

Der begrenzte TypeScriptlauf bestand ebenfalls:

```sh
./node_modules/.bin/tsc --noEmit --ignoreConfig --strict --noUncheckedIndexedAccess --resolveJsonModule --esModuleInterop --moduleResolution bundler --module esnext --target es2022 --skipLibCheck src/features/bible/selection.ts tests/reader-selection.test.ts
```

`npm run typecheck` wurde während der parallelen Integration ausgeführt und endete mit Status 2. Die damaligen Fehler betrafen die neue `passage`-Union in `app/sammlung.tsx`, `CaptureInput.tsx`, `capture-model.ts`, `personal/model.ts` und einen noch auf 8 festgelegten Versionswert in `tests/e2e/invitations.spec.ts`. Auswahlmodul und Auswahltest hatten dabei keine Fehler. Dieser Zwischenstand ist kein Beleg für einen bestandenen Gesamt-Typecheck; die endgültige Integrationsprüfung gehört zum Gesamtumfang.

## SHA-256 der fachlichen Quellen und Ergebnisse

| Datei | SHA-256 |
| --- | --- |
| Original `src/app.js` | `56e494f2e84c18d74e970578217467feecc5670443c558a905af537f0be17771` |
| Vorbereitungsbericht | `582a2d86827c8960b364813375693f6a9d2cc03c70e5e8a28c180e0b2efef918` |
| `src/features/bible/repository.ts` | `b3e5c8ebeb0cf6d99343266e53e63175b4d8f4602a76c81c55569df5fbe921da` |
| `src/features/bible/schema.ts` | `8d6d633e025e28b54402c06567ea3a7045d765325f9fe181f7a981d7c8de2c97` |
| `src/data/bible.json` | `6dd74b74fa67033976536939521df6417ab9c41579fee8c6cbeffd94016e6ce8` |
| `src/data/catalog.json` | `fd6e31bf3d111286f4f818d0f0f35f87139089af098d1f01d40a827e4bb1b599` |
| `src/features/bible/selection.ts` | `7c09e3433534487c44dfbf941a4c8dfee2b352246aa2b0929509c99943fbbfd0` |
| `tests/reader-selection.test.ts` | `9fc1d15d428e94300ff550cfdbac6d8f202db9ed4b4daa08c22d0db996f0e074` |
