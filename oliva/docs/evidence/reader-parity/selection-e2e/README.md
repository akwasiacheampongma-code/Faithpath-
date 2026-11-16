# Vorbereitete Browserabnahme der Reader-Auswahl

Stand: 15.11.2026. Diese Agenteniteration hat **keinen Webbuild und keinen Browserlauf ausgeführt**; die Hauptkoordination prüft gerade separat den Buchsuchpatch. Die Reader-Arbeit bleibt im Hauptcheckout erhalten und ist noch nicht bereitgestellt.

`tests/e2e/reader-selection.spec.ts` registriert sechs Fälle gegen echten DOM, Tastaturereignisse und IndexedDB. Der Test liest die lizenzierte Bibeldatei unabhängig vom App-Renderer und Auswahlmodell.

- Alle 71 Johannes-6-Verse um den logischen Fokus 35–37; ausdrückliche Abschnittsbestätigung ohne Kapitelabschluss; Kapitelabschluss erst nach ausdrücklichem Scopewechsel.
- Additive Auswahl 35/37 mit erhaltener Lücke und ohne dauerhafte Inhaltsänderung; erst nach Ergänzen von 36 gemeinsame Terrakottamarkierung, versweise Lesezeichen und eine echte Bereichsnotiz ohne Fortschrittsänderung.
- Getrennte Entwurfs-IDs und Schlüssel für 35–36 und 35–37; Abweisung eines nicht zur echten Entwurfsquelle passenden Routenendes; dauerhafte Wiederaufnahme über die Sammlung und vollständiger Bereichsbezug auch beim Öffnen der fertigen Notiz.
- Kanonischer Versanker 60 außerhalb des Fokus 35–37 nach echter Verslinköffnung, Reflow und Neustart; der logische Lesebereich bleibt erhalten.
- Enter/Leertaste und zweifaches Escape mit Fokus auf den zuletzt hinzugefügten Vers 36 für Fließtext und Einzelverse, ohne dauerhafte Inhaltsänderung.

Nach tatsächlicher Ausführung erzeugen die Fälle JSON-Belege und Screenshots unter `$OLIVA_EVIDENCE_DIR/reader-selection` (Standard `docs/evidence/latest/reader-selection`). Keiner dieser zukünftigen Belege wird hier als vorhanden oder bestanden behauptet. Es gibt keine Geräte- oder Simulatorprüfung.

`typecheck.txt`: vollständiger `npm run typecheck`, Exit 0. `registered-tests.txt`: `playwright test tests/e2e/reader-selection.spec.ts --list`, Exit 0, sechs registrierte Fälle; `--list` startet keinen Browser.

Der vorhandene `LegacyVerseText` besaß bereits einen `forwardRef<FlowTextHandle>`, reale Pressable-Fokusreferenzen und einen ehrlichen `measure: async () => null`-Fallback. Ergänzt wurde ausschließlich die fehlende Verbindung `ref={flowText}` an dessen Verwendung in `app/lesen/[book].tsx`. Die Legacy-Geometrie bleibt im bestehenden Positionshook.

## Anschließende integrierte Prüfung

Der Hauptkoordinator hat anschließend den lokalen Readerbuild und die gezielten Browserfälle freigegeben. `development-build.txt` im übergeordneten Evidenceordner belegt den tatsächlichen erfolgreichen Webexport `oliva-f250e48b9227a101` mit 104 Offline-Dateien. Paketversion 0.12.0 ist hier nur die noch nicht angehobene Entwicklungskennung; dieser V9-Arbeitsbuild ist kein nachträglich veränderter 0.12-Release und keine Bereitstellung.

Der Anfangssprung verbindet nun `position.restore(target)` mit `flowText.current?.focusVerse(target)`, solange die Route aktiv ist. Die Restore-API ist synchron und startet die bestehende echte Geometriemessung; keine künstliche Wartezeit oder geschätzte Versposition wurde eingeführt. Der neue Scopefall prüft zusätzlich den tatsächlichen Fokus und dauerhaften Anker auf Vers 35. `typecheck-after-integration.txt` enthält den erneuten Typecheck.

Die gezielte Abnahme umfasst Reader-Auswahl, echtes Kopieren einschließlich abgelehnter API und die bestehenden Fließtextfälle. Endgültige Fallzahlen, eventuelle Fehler und noch nötige Korrekturen werden erst nach dem tatsächlichen Lauf hier ergänzt.

### Tatsächlicher Erstlauf und korrigierter Modalvertrag

Der erste Lauf bestand 10/16 Fälle: alle drei Clipboard- und sieben bestehenden Fließtextfälle. Drei neue Fälle scheiterten an einer zu engen Testerwartung des Helpers `ready()`: Der Reader bewahrt korrekt die logischen `from`-/`to`-Grenzen in `reading`; der Helper erwartete nur Buch/Kapitel mit exakter Gleichheit. Er verwendet nun eine Teilobjektprüfung. Der Worker hatte bereits die alte Testfassung geladen; die Fehlerbelege bleiben erhalten.

Die anderen drei Fälle deckten einen wirklichen Fokusfehler auf: React Native Webs `ModalFocusTrap` stellt beim tatsächlichen Unmount den Auslöser wieder her. Die vorherige einzelne RAF-Fokusrückgabe konnte davor laufen und wurde anschließend überschrieben. `SelectionTools` reicht nun `Modal.onDismiss` weiter; der Reader hält die beabsichtigte Rückgabe bis zu diesem tatsächlichen Abschluss bereit. Die aktive Route und der geschlossene Modalzustand werden geprüft. Der vorhandene RAF bleibt für Android erhalten, da dessen native Modal-API kein `onDismiss` implementiert. Keine künstliche Wartezeit wurde ergänzt. Androids Verhalten ist damit aus Quellen angepasst, nicht auf einem Gerät nachgewiesen.

Erstbuild, JSON-Report, Log, Screenshots und Fehlerkontext sind vollständig unter `../before-modal-focus-fix/` erhalten. Nach der Runtimekorrektur wurde erfolgreich neu gebaut: `oliva-10d91616b310caa1`, weiterhin 104 Offline-Dateien. Der erneute Typecheck steht in `typecheck-after-modal-fix.txt`. Der gezielte Gesamtlauf und ein einzelner, isoliert abgelegter Fokus-Regressionsfall laufen anschließend gegen diesen tatsächlichen lokalen Kern.

### Bestätigter gezielter Lauf

Der korrigierte Kern bestand **16/16 Fälle in einem vollständigen gezielten Lauf** (15.11.2026, Start 21:27:12 UTC, Dauer 181,727 Sekunden), ohne Skips, instabile Ergebnisse oder Wiederholungen. JSON-Rohreport und Log: `../targeted-e2e-results.json` und `../targeted-e2e.txt`. Alle sechs neuen Auswahlfälle, die drei Clipboardfälle und die sieben bestehenden Fließtextfälle sind darin enthalten. Der unabhängig abgelegte einzelne Fokus-Regressionsfall bestand zusätzlich 1/1 (`../modal-regression-results.json`). Der fehlgeschlagene Erstlauf bleibt separat erhalten und wird nicht rückwirkend als erfolgreich dargestellt.

Die neuen Auswahlfälle bestätigen den echten Anfangsfokus, die Modalrückgabe auch im Legacy-Renderer, getrennte Bereichsentwürfe, einen abgewiesenen nicht passenden Entwurfslink, vollständigen Quellenbezug der gespeicherten Notiz, Abschnittsbestätigung ohne Kapitelabschluss und den Versanker außerhalb des Fokus. Die bestehende Offlineprüfung bestätigt erstmals offline die vollständigen David-Kapitelverse um die acht Fokusverse, weiterhin nur deren ausdrücklichen Abschnittsabschluss. Zwei tatsächliche Screenshots wurden zusätzlich visuell angesehen: Die Mehrversauswahl bleibt ruhig in den bestehenden Fließtext eingebettet; nach Tastaturaufhebung ist die goldene Kontur am korrekten Vers 36 sichtbar.

Die anschließende vollständige Browserregression wurde nach Freigabe des Hauptkoordinators gestartet. Die Testregistrierung zählt tatsächlich **123 Fälle in 23 Dateien** (`../development-full-list.txt`). Bis zum Vorliegen des tatsächlichen Endreports wird die vollständige Regression hier nicht als bestanden behauptet. Es wurden weiterhin keine Geräte-, Simulator- oder Hostingbrowserprüfungen durchgeführt.
