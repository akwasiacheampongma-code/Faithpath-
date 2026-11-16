# AppData V9: Bereichsnotizen und Kapitelanker

Geprüft am 15. November 2026 im gemeinsamen Arbeitsstand unter `/workspace/faithpath-next`. Dies dokumentiert den Nutzdatenvertrag und seine Node-Vertragstests; daraus folgt keine Produktfreigabe oder Geräteabnahme. Die Produktversion bleibt `0.12.0`.

## Historische Verträge

`legacyDataSchema` und `v2DataSchema` bis `v8DataSchema` behalten ihre jeweiligen Versionsliterale und historischen verschachtelten Prüfer. Der frühere Notizgraph ist als `historicalNoteSchema` gebunden; alle historischen Versionen verwenden weiterhin das alte `capture-schema.ts`. V5 und V6 behalten ihre vorhandenen persönlichen Schemata. V7 und V8 verwenden die neue eingefrorene Datei `schema-v8.ts`, eine bytegleiche Kopie des ausgelieferten persönlichen Schemas einschließlich seines alten Captureimports. V5 bis V8 verwenden unverändert den Abschnittsprüfer aus `position.ts`.

Die vier unveränderten historischen Dateien stimmen mit den SHA-256-Werten aus der Vorbereitung überein. `schema-v8.ts` stimmt mit dem dort verzeichneten ursprünglichen `personal/schema.ts` überein. Das heutige `personal/schema.ts` unterscheidet sich von dieser Kopie ausschließlich durch den Import von `capture-schema-current.ts`. Einzelwerte und aktuelle Quellhashes stehen in [source-checks.json](source-checks.json).

Die Tests prüfen gültige V1–V8-Dokumentformen sowie die Ablehnung neuer Bereichsquellen in alten Notizen und Entwürfen. Zusätzlich lehnen alte V5–V8-Prüfer einen Kapitelanker außerhalb ihres logischen Teilabschnitts ab. Der V8-Test prüft auch unerlaubte verschachtelte Capture-, Antwortsnapshot- und Einladungsfelder. Eine neue Quelle wird damit unter keinem alten Versionslabel akzeptiert.

## Aktueller Vertrag

`dataSchema` verlangt `version: 9`. `AppDataV9` ist der daraus abgeleitete Typ, `AppData` sein aktueller Alias; `initialData()` beginnt mit V9. Dies ist eine implementierte Datenform, keine Ankündigung einer neuen Produktversionsnummer.

`capture-schema-current.ts` exportiert weiterhin `captureSourceSchema`, `captureValuesSchema`, `CaptureSource` und `captureKey`. Es übernimmt sämtliche alten Quellen und deren Schlüssel unverändert. Die neue Quelle `{ type: "passage", ref }` verlangt explizite kanonische Grenzen mit `from < to` und vollständig vorhandenen Versen. Ihr Schlüssel enthält beide Enden: `capture:passage:JHN:6:35:36`. Vers 35 bleibt `capture:verse:JHN:6:35`; 35–36 und 35–37 besitzen unabhängige Entwürfe. Die Bereichsquelle enthält ausschließlich Typ und Referenz; zusätzliche generierte Texte werden abgelehnt.

`currentNoteSchema` erlaubt eine gespeicherte Bereichsquelle ausschließlich mit `kind: "note"`, exakt gleicher `note.ref` und ohne historische Importherkunft. Bestehende Notizquellen behalten ihre vorherige Bedeutung. Die Bereichsnotiz erzeugt damit keine Reflexions- oder Handlungsevidenz. Die Store-Wachstumswache und der Saveablauf werden im Integrationsbereich separat geprüft.

`position-current.ts` exportiert den aktuellen `readingPositionSchema` sowie die bisherigen Hilfsfunktionen und Typen. Sein kanonischer Versanker darf im gesamten Kapitel liegen; `position.ref` bleibt der vollständige logische Scope einschließlich seiner Abschnittsgrenzen. Der aktuelle Datenprüfer verlangt weiterhin Übereinstimmung mit `reading`. Pixel, unbekannte Felder, fremde Kapitel und nicht vorhandene Verse bleiben ungültig.

## Migration und Originalarchive

`decodeData()` prüft V1–V8 zuerst gegen deren eingefrorenen Vertrag und erzeugt anschließend V9 im RAM. Für V8 ändert sich ausschließlich das Versionsliteral. Für ältere Versionen werden nur die bereits vorgesehenen fehlenden Vorgängerfelder ergänzt. Die Migration ruft keinen Speicheradapter und keine Aktivitätsfunktion auf; sie erhöht keine Revision und erfindet keinen Lese-, Lern- oder Wachstumsstand.

Der reichhaltige synthetische V8-Vertragstest enthält importierte Originalobjekte mit Beleg und exaktem Quelltext, einen belegten historischen NT-Abschluss, sechs gespeicherte Antworten aus zwei gehashten Fragenfassungen, zwei echte Kapitelabschlüsse, eine NT-Rückkehrposition, beide Reader-Modi, Einladungsentscheidungen, zwei alte Captureentwürfe sowie bestehenden Lese- und Wachstumsstand. Die Migration erhält sämtliche Felder und Archivbytes. Veränderte historische NT-Zeitpunkte werden weiterhin gegen den Originalbeleg zurückgewiesen.

`services/documents.ts` besitzt jetzt zusätzlich zum aktuellen V9-Zweig einen ausdrücklichen eingefrorenen V8-Metadatenzweig. Private V8-Dokumente mit ausgelagertem Originalarchiv werden unverändert validiert und mit denselben Archivbytes zu V9 zusammengesetzt. Neue Bereichsquellen unter einem privaten V8-Label scheitern vor dem ersten Archivzugriff. Die private Hülle bleibt `storageVersion: 1`, SQLite bleibt Schema 3 und IndexedDB bleibt `oliva-local-v1` mit Version 1.

## Tatsächliche Prüfung

Der Lauf mit `reader-v9-migration`, `domain`, `imports`, `nt-study` und `nt-import` bestand am 15. November um 21:06 UTC mit **5 Dateien und 70 Tests**, darunter **13 neue V9-Vertragstests**. Laufzeit: 28,01 Sekunden. Die Zusammenfassung steht in [targeted-tests.txt](targeted-tests.txt).

Der tatsächliche anschließende globale Typecheck endete mit Exitcode 2. Er meldete ausschließlich drei bereits offene Integrationsstellen: das noch fehlende `clipboard/CopyPassage` in `SelectionTools.tsx` und `VerseActions.tsx` sowie das alte Versionsliteral 8 in `tests/e2e/invitations.spec.ts`. Keine Meldung betraf die hier verantworteten Migrationsdateien. Der genaue Befund steht in [typecheck.txt](typecheck.txt). Dieser Stand behauptet deshalb keinen grünen globalen Typecheck.

Diese Prüfung umfasst Quellvergleiche und Node-Vertragstests. Browser-Workerwechsel, echte SQLite-/IndexedDB-Schreibfehler und Geräteverhalten sind durch diesen Beleg nicht abgenommen.
