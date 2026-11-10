# Belegte NT-Abschlüsse aus FaithPath-Originalarchiven

## Implementiert

- `prepareImport` liest ausschließlich bekannte NT-Einheits-IDs und deren kanonischen vollständigen UTC-Wert `quiz[id].done`. Der Plan enthält `ntCompletions` und separate `ntIgnored`-Zähler; das historische `receipt.counts`-Schema bleibt unverändert.
- `applyImport` leitet diese Fakten vor jeder Änderung erneut aus den exakten Originalbytes ab und prüft Fingerprint, Quellenhash, Fakten und Vorschauzähler. Abweichungen brechen ohne Teiländerung ab. Das Anhängen erhält aktive Antworten, Fragefassungen, Kapitelabschlüsse und Rückkehrposition.
- Die Importvorschau nennt die tatsächliche Zahl historischer NT-Abschlüsse und erklärt ihre Bedeutung: fünf Fragen angesehen, keine überlieferten einzelnen Antworten oder Erfolgsquote. Unbekannte oder unvollständig datierte Quizfelder bleiben im vollständigen Originalarchiv.
- Bereits früher importierte Originalarchive werden beim Öffnen **nicht automatisch aktiviert**. Die Archivkarte zeigt belegte, bereits aktive und noch übernehmbare Fakten sowie Kapitel, Originaleinheit und Datum. Nur die ausdrückliche Aktion `activateArchivedNtProgress(id, sourceHash, expectedRevision)` ergänzt die belegten Fakten; Quelle und Rückkehrsicherung werden dabei nicht ersetzt. Die Storeaktion gehört zum Root-Integrationsbereich.
- Eine veraltete Vorschau sperrt die Übernahme. Erneutes Prüfen liest den aktuellen dauerhaften Stand über `refresh()`, ohne zu schreiben; Speicherfehler bleiben sichtbar.

## Tatsächliche Prüfungen

- `import-final.json` / `import-final.txt`: **17/17 Fachtests erfolgreich**; davon sechs neue NT-Importfälle und elf bestehende Importfälle. Kein Überspringen.
- Neue Fälle prüfen alle 260 Originaleinheiten einschließlich Matthäus 1 und Offenbarung 22; ungültige Datumsformen, Überlaufdatum, fremde/abweichend geschriebene IDs, zusätzliche Felder und unveränderte Originalbytes; wiederholte/neu datierte Quellen; Erhalt aktiver Antworten und Abschlüsse; manipulierte Vorschauen ohne Teiländerung; fehlende/leere Quizbereiche.
- `typecheck-with-archive-ui.txt`: Typprüfung erfolgreich. Diese Runde enthält die Archivkomponente; die spätere kleine Verbesserung von „erneut prüfen“ ruft die bereits typisierte Storefunktion `refresh()` auf und wird zusätzlich von der abschließenden Root-Typprüfung abgedeckt.
- `tests.json`: früherer gezielter Stand mit fünf erfolgreichen Fällen. `import-regression.json`: früherer gemeinsamer Stand mit fünf neuen und elf bestehenden Fällen. Diese Belege wurden nicht überschrieben.
- `typecheck.txt` bewahrt einen frühen TypeScriptfehler im neuen synthetischen Quizfixture sowie den während der parallelen V8-Umstellung noch unveränderten V7-Browserfixturetyp. Der Quizfixture verwendet jetzt `Object.assign`. `typecheck-final.txt` bewahrt nur noch den damaligen V7-Typfehler; Root hat diesen historischen Fixture später korrigiert.

## Browserprüfung

`tests/e2e/nt-archive.spec.ts` enthält drei echte UI-/Persistenzfälle: neue Importvorschau bis zur Übernahme und ein synthetisches historisches V7-Originalarchiv bis zur ausdrücklichen Aktivierung und zum Neustart sowie eine echte Zwei-Fenster-Kollision mit erneuter Vorschauprüfung. Geprüft werden insbesondere unveränderte Rohdaten bis zur Bestätigung, alle sonstigen V7-Felder, Originalblob, Rückkehrsicherung und ausbleibende erneute Archivschreibvorgänge.

**Tatsächlich ausgeführt am 09.11.2026:** `archive-browser-first.json` und `.txt` bestätigen **3/3 Browserfälle in einem grünen Lauf**, 31,0 Sekunden, ohne Skips, Flaky-Fälle oder Wiederholungen. Geprüfter lokaler Entwicklungskern: `oliva-90d58a6a170aa170`, AppData V8; die Paketversion ist dabei noch die unversionierte Arbeitsbasis 0.11.0, keine neue Releasebehauptung. `archive-served-build.json` bestätigt sechs per HTTP bytegenau mit `dist` abgeglichene Dateien einschließlich Worker, Archiv- und Importchunk. Keine Bereitstellung vorgenommen; keine Aussage über native Simulatoren oder echte Geräte.

## Unabhängiger Review

Read-only-Prüfung durch einen separaten Agenten: kein konkreter Datenverlust-, Herkunfts-, Atomizitäts- oder Falschfortschrittsfehler festgestellt. Die empfohlene zusätzliche Abdeckung eines veralteten Archivstands ist im dritten erfolgreichen Browserfall enthalten: Eine echte zweite Browserseite speichert einen anderen Namen; die erste Aktion wird durch den dauerhaften Revisionsvergleich ohne Teiländerung abgelehnt. Erneutes Prüfen liest den aktuellen Stand, und die anschließende NT-Aktivierung erhält den fremden Namen ebenso wie Quelle und Rückkehrsicherung.
