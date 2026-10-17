# Phase6B · sicherer Integrationsplan

Verbindliche Spezifikation vollständig gelesen: PHASE6B_VERBUNDEN_IMPLEMENTIERUNGSAUFTRAG_2026-10-17.md. Der Nutzer hat Design und tatsächliche Integration ausdrücklich freigegeben; keine wiederholte Designgenehmigung. Ausführungsmodus: eigenständige paketweise Umsetzung. Kein Deploy und kein Merge.

App-Basis: fc9e5b95e5c4bcd7e74c584874f6bc3ff6fe4539, funktionaler Vorgänger0ec849255fe3f06d80da77ab89d5b66f92f47560. Design: f268fc7fab9c608c83514a88f01884abb356bd65. Eigener Worktree auf ausschließlich feature/uiux-phase6b-verbunden-20261017. Die Studie bleibt separat.

## Geschützte Verträge

store.js, domain.js, ursprüngliche Migrationen, journal-storage.js, drafts.js, import-validation.js, Runtime-/Kapitel-/Story-IDs und komplette data/ unverändert erhalten. Keine synthetischen Modelldateien übernehmen. Lokale OFL-Schriften und eigene Siegelgrafik sind zulässige Präsentationsassets. Originalbaum und bestehende Zweigkoordinaten bleiben bis zum gesonderten Artpolish erhalten; Rechteklärung ist kein gelöster Nebeneffekt dieses Designs.

## Pakete und Dateien

0. Baseline: npm test, ursprünglichen Build mit ursprünglichen Branchmetadaten einfrieren, echte Vorherbilder, Routen-/Dialog-/Aktionsinventar. Bestehende38+ Browserprogramme erneut am Kandidaten ausführen, Testaufbaufehler getrennt behandeln.
1. Backup P3: tests/uiux6b/backup-lifecycle.mjs gegen eingefrorenen Build RED. In app.js jede Hashnavigation zur Invalidierung ausstehender File-Reads nutzen, bestehende Restorelocks und Frischegates unverändert. GREEN plus bestehende Backupraces/Dialogtests. Eigener Commit.
2. Fundament: src/verbunden/ mit semantischen Tokens, allgemeinen Komponenten und fokussierten Bereichsstyles; lokale Fonts/Lizenzen und originales Buch-Schwert-Siegel. Build/Serviceworker müssen alle Assets aufnehmen. Keine neue Laufzeitabhängigkeit. Navigation vier Hauptziele und alle alten Ziele.
3. Heute/Onboarding: echte selectToday-Projektion, kompakter Baum und früher nächster Schritt. Zwei freiwillige Einstiege. Pure Renderer statt neuer Datenlogik.
4. Reader/Journey: fortlaufender semantischer Satz, kompakte erreichbare native Selektoren, Vers-/Markierungs-/Notizadapter unverändert, Fokusmodus transient. Neues Siegel; keine Veränderung des Erkunden-Ereignisses oder historischer Fortschritte.
5. Journal/Wege/Rückblicke: vorhandene Viewmodule und Transaktionen. Persönliche Zeitachse, ruhiger ganzer Schreibraum im vorhandenen sicheren Dialog, eindeutige damalige/heutige Darstellung. Suche und alle Formfelder/Funktionen erhalten.
6. Entdecken/Fragen/Guides: bestehender vollständiger aktiver Index und begrenzte Ergebnisse, differenzierte Einstiege, hochwertige Antwort-/Erklärungsdarstellung. Keine Inhaltskorrekturen, keine zusätzlichen Fragenbestände.
7. Mehr/Settings/Backup/Sonderzustände: alle vorhandenen Routen, Fehler, Bestätigungen und Erinnerungen konsistent gestalten; ursprüngliches Sicherungsformat bleibt verbindlich.
8. Gesamttests: bestehende Units, gemeinsame UIUX45-Browsersammlung, neues22-Ansichten-Mapping,390/320/430/Desktop, vier Themes,200% Schrift, Reduce Motion, Kontextloop, sehr lange/leere/viele Daten, beide vollständigen Bibeln, tatsächlicher Update-/Offlineablauf mit synthetischen Daten.22 alte Kontrast-Incompletefälle neu messen und beurteilen.
9. Kandidat: eindeutige UIUX6B-CANDIDATE-ID, zwei identische Builds, Root-index.html-ZIP, Quellen-/Inhaltshashes, geänderte Dateien, Vorher/Studie/Nachher, Tests, Datenprüfung, Risiken und Rollback. Physische iPhone/Safari/VoiceOver-Gates bleiben OFFEN.

Jedes inhaltliche Paket endet mit passenden Tests und einem Commit mit skip-netlify/skip-ci-Markierung. Main und Produktion werden nicht angefasst. Datengefährdende Grundlagenänderungen werden nicht improvisiert; betroffenen Teil dokumentieren und stoppen.
