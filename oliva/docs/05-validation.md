# Qualität und Abnahme

Prüfumgebung: 06.11.2026, Linux, Node 24.22.1, npm 11.9.0, systemweiter Headless-Chromium über Playwright. Browsergrößen sind simulierte CSS-Viewports. Nicht auf physischen Smartphones getestet.

## Tatsächlich ausgeführte Prüfungen

| Prüfung | Ergebnis / Umfang | Nachweis |
|---|---|---|
| Bibelimport und Reproduzierbarkeit des Korpus | 66 Bücher, 1.189 Kapitel, 31.102 Verse; Bundle erneut aus Originalarchiv ableitbar | `npm run content:check`, Import-SHA unten |
| TypeScript | Fehlerfreie strikte Typprüfung | `npm run typecheck` |
| Fach-/Persistenzsuite | 64 Tests bestanden, einschließlich V5-Import, Migration und echter SQLite-Transaktionen | `tests/*.test.ts`, `docs/evidence/unit-results.json` |
| Browser-Hauptabläufe | 35 Szenarien; erster stabiler Lauf 35/35, späterer paralleler Lastlauf 34/35 mit Zeitlimit; gezielte Wiederholung und Remote-Gesamtlauf separat belegt | `docs/evidence/e2e-results.json` |
| Erster Weg | Gast → Geschichte → Versaktion/Notiz → drei Schritte → freiwillige Reflexion → Abschluss → Neustart; Abschnitt zählt kein Kapitel | Browser-Szenario 1 |
| Reader | Buch-/Kapitelwahl, Volltextsuche, Schrift/Abstand/Dunkel, bestätigter Kapitelabschluss und Reload | Browser-Szenario 2 |
| Journal | Anlegen, Bearbeiten, explizites Löschen, Undo und Neustart | Browser-Szenario 3 |
| Sicherungen | Echter Browserdownload; kaputte Sicherung abgewiesen; gültige Sicherung erst nach expliziter Ersetzung angewendet | Browser-Szenario 4 |
| Baum und Motion-Präferenz | Vorschau verändert keinen Fortschritt; App-Reduktionspräferenz bleibt gespeichert | Browser-Szenario 5; OS-/native visuelle Prüfung offen |
| Offline | Echter Service Worker, Netz im Browser ausgeschaltet, zuvor unbesuchtes Offenbarung-22-Kapitel geöffnet, gespeichert und erneut geladen | Browser-Szenario 6 |
| Fensterkonflikt | Zweites Fenster kann ersten Commit nicht überschreiben; eigene Eingabe bleibt erhalten | Browser-Szenario 7 |
| Speicherfehler | Tatsächlicher IndexedDB-Schreibpfad mit simulierter Quota-Ausnahme: keine falsche Bestätigung, Text bleibt im Editor | Browser-Szenario 8 |
| Reflow | Sechs Kernrouten × 320 / 390 / 768 / 1.440 px ohne horizontale Dokumentüberbreite | Browser-Szenario 9; keine vollständige OS-Schriftvergrößerungsabnahme |
| Accessibility automatisch | Elf Axe-Scans: vier Kernrouten je in Hell/Dunkel plus neue Vorhaben-Editoren bei drei Größen; zusätzlicher gemessener Hero-Button-Kontrast | Browser-Szenario 9; kein Ersatz für manuelle WCAG-Abnahme |
| SQLite-Schema | SQL tatsächlich mit Python SQLite ausgeführt; Create/Insert/Read sowie Singleton-/Revisionsconstraints geprüft | `docs/evidence/sqlite-schema.json`; kein nativer Runtime-Test |
| Paketkompatibilität | Expo-Paketprüfung meldet „Dependencies are up to date“ | `node scripts/expo.mjs install --check` |
| Web | Export mit Offline-Manifest erzeugt | `dist/`, `docs/evidence/builds.json` |
| Android | JavaScript-/Asset-/Hermes-Bundle exportiert | `dist-android/`; kein installiertes APK |
| iOS | JavaScript-/Asset-/Hermes-Bundle exportiert | `dist-ios/`; kein signiertes IPA |
| Bestandsintegrität | 390 materialisierte Referenzdateien stimmen mit Original-Git-Blobs überein | `docs/evidence/reference-integrity.json` |
| Visuelle Prüfung | Hauptansichten mobil/groß, Dark Mode, Reader und Baumvorschau angesehen | `docs/evidence/screens/` |

Die erste Browseriteration fand einen unnötig wachsenden Navigationsstapel bei Reader → Weg und schwache Kontraste der Gold-/Sekundärtexte. Der Rückweg verwendet nun `dismissTo`; Farbtokens wurden korrigiert. Die visuelle Dark-Mode-Prüfung fand außerdem einen hellen Text auf dem hellen Hero-Button. Dessen Vordergrund ist jetzt unabhängig vom Theme festgelegt und wird zusätzlich direkt auf mindestens 4,5:1 geprüft. Frühere Kontrastfunde sind als `axe-initial-failures.json` erhalten und beschreiben nicht den finalen Scanstand.

Zwei anfängliche Browserfehler betrafen die Eindeutigkeit von Testselektoren während Navigation/Editorwechsel. Der Editor-Test wartet auf den tatsächlichen Abschluss der Speicherung; fachliche Prüfungen wurden nicht entfernt. Ein Browserlauf während sich ändernder Exportdateien lief in ein Timeout. Maßgeblich ist der erneute Lauf gegen den stabilen fertigen Export.

## Integrität

- Original-USFM-ZIP SHA-256: `76fb83f108dd9029e2ec63c582b5a7e2acc46736d7b1659f802dff27f5563af7`
- Importiertes Bibelbundle SHA-256: `6dd74b74fa67033976536939521df6417ab9c41579fee8c6cbeffd94016e6ce8`
- Plattformexports: exakte Dateianzahl, Größe und aggregierter Hash in `builds.json`.
- Bildoriginale und Varianten: einzelne SHA-256 und Größen in `art/manifest.json`.

## Offene Abnahmebereiche

- Physische iOS-/Android-Installation und native SQLite-Laufzeit einschließlich voller Disk, Abbruch und Upgrade.
- VoiceOver, TalkBack, Hardwaretastatur und Screenreader-Fokus beim Navigieren.
- 200-%-Systemschrift, Display-Zoom, sehr lange persönliche Namen und sämtliche Kapitel unter allen Textgrößen. Die vorhandene Reflowprüfung misst Dokumentüberbreite und beweist nicht, dass jedes intern begrenzte Element in jedem Schriftmodus vollständig sichtbar ist.
- Langsame Erstnetzwerke, Cache-Speichergrenzen, beschädigte Service-Worker-Installation und weitere Update-/Rollbackfolgen. Ein echter Wechsel vom separat gebauten 0.3-Export zu 0.4 mit anschließendem Offline-Neustart ist geprüft.
- Live-Supabase-Auth, Owner-RLS mit zwei Konten, Geräte-Sync und Konfliktauflösung. Keine aktive Cloud vorhanden.
- KI-Zitatgenauigkeit und Traditionsfairness. Kein aktiver KI-Dienst vorhanden.
- Redaktionelle/theologische Prüfung, reale Anfänger-Usability und historische Bildfreigabe.
- Rechtliche Freigabe eines konkret betriebenen öffentlichen Diensts sowie Store-Signing und Vertriebsrechte.

Keine dieser offenen Prüfungen wird durch einen grünen TypeScript-, Node- oder Chromium-Lauf als erledigt erklärt.


## Ergänzung 0.2 · Vorhaben und Entwürfe

Die sieben zusätzlichen Browser-Szenarien prüfen Export nach einem Bereichswechsel, Journalentwürfe nach Neustart und Bearbeitung, Vorhaben mit Schritten/Rückblick/Archiv, ausdrückliches Verwerfen, eine bestehende V1-Datenbank, Bibelbezug aus dem Reader und Reflow/Axe für neue Editoren. Die elf zusätzlichen fachlichen Prüfungen ergänzen Migration, Quellschutz, Entwurfsstempel, Warteschlange und Snapshots. Screens liegen unter `docs/evidence/personal-screens/`; die synthetischen Beispieltexte sind als solche im Manifest gekennzeichnet. Details in [Iteration 0.2](06-personal-and-drafts.md).

## Ergänzung 0.3 · V5-Import und atomare Rückkehr

16 zusätzliche Fach-/Persistenztests und sechs zusätzliche Browser-Szenarien sind erfolgreich. Native Adapterlogik wird mit Nodes echter SQLite-Engine geprüft: physische Migration 1→2, Nutzdatenmigration 2→3, Fehler nach dem Sicherungsschreibvorgang, Revisionsschutz und Token-Verbrauch. Das frühere Python-Schemaergebnis bleibt als historischer Nachweis erhalten; es ersetzt nicht diese neuen Adaptertests oder einen Expo-Gerätetest. Im Browser wurden Dateidialog, Abbruch, Originaldownload, Offline-Neustart, Quellen-Snapshot, wiederholter Import, zwei Fenster, Quota-Fehler und Rückkehr nach späteren Änderungen geprüft. Zwei zusätzliche Axe-Scans prüfen Vorschau und Originalarchiv im Dark Mode. Zehn neue Screens zeigen die Importansichten mobil und groß. Details und anfängliche Testkorrektur: [Iteration 0.3](07-faithpath-import.md).

## Ergänzung 0.4 · Wortschutz, Archiv-Blobs und Erzählpiloten

18 zusätzliche Fach-/Persistenztests bestehen (64/64 insgesamt); 13 zusätzliche Browserfälle erweitern die Suite auf 35. Der erste stabile Gesamtlauf bestand 35/35. Ein späterer Lauf parallel zu nativer Hermes-Kompilierung bestand 34/35; der RAM-Exportfall erreichte sein Zeitlimit beim Betätigen des Exportbuttons. Die isolierte Wiederholung bestätigt den RAM-Export; eine erste Lesezustandsprüfung erreichte danach das fünfsekündige Erstlade-Limit. Die Suite verwendet jetzt 15 Sekunden je Erwartung und 120 Sekunden je Ablauf, ohne Wiederholungsautomatik oder gelockerte fachliche Aussagen. Die gezielte Wiederholung nach abgeschlossener Kompilierung wird gesondert unter `final-regression-results.json` belegt. Der Lastlauf bleibt unverändert unter `e2e-load-run.json` erhalten. Keine Browserfälle wurden übersprungen. Sie prüfen Capture-Quellen und Snapshots, V3→V4, private Dokumente, SQLite-V3-Transaktionen, große Quellen ohne wiederholtes Blobschreiben, Bereinigung mit geschützter Rückkehrsicherung, Fehler beim ersten Blob, Rohdatenrettung, Entwurfsfortsetzung in vier Bereichen, getrennte Versnotizen, gezieltes Scrollen und Worte nach einem fehlgeschlagenen Commit und Bereichswechsel. Neun eigene Textfragen werden auf gültige Belege geprüft; die Browserrückmeldung verändert keinen Fortschritt und hat keine Axe-Verstöße. Die Erzählpiloten haben validierte Versbereiche; der Osterabschnitt funktioniert mit Bild und Kontext nach Offline-Neustart.

Der Zwischenlauf fand einen veralteten, noch montierten Editor, der nach einem erfolgreichen Abschluss eine Schließwarnung beibehielt. Eine gemeinsame Abschlusskennung löst das Problem; der Regressionstest bleibt enthalten. Axe fand fehlenden Web-Auswahlzustand in der ersten Radio-Implementierung; echte HTML-Radiobuttons beheben dies. Ein Test-Helfer erzeugte beim zu frühen Öffnen eine leere Datenbank ohne Store; er bricht einen solchen Erstzugriff jetzt ab und wartet auf die App-Hydrierung.

`docs/evidence/offline-upgrade.json` belegt den tatsächlichen Versionswechsel: Profil, Journalentwurf, Einträge, Vorhaben und exakte Originalquelle bleiben erhalten; nach Netzabschaltung gelingt ein Neustart mit Payload V4 und privatem Dokument V1. Der Update-Prüfablauf wartet bis zu 30 Sekunden auf die tatsächliche Bereitschaft. Eine Wiederholung fand einen neuen Worker, dessen Cache bereits vollständig war, der aber im Wartezustand blieb. Die App prüft jetzt zusätzlich die Build-ID dieses wartenden Workers und fordert nur den zum geladenen HTML passenden Worker ausdrücklich zur Aktivierung auf. Der nachfolgende tatsächliche Offlinewechsel besteht. Das ersetzt keine Messung auf einem schwachen physischen Gerät.

Sieben Bildmaster und 18 Varianten bestehen die Hash-/Metadatenprüfung (`npm run content:art`). Neue Aufnahmen: `docs/evidence/session-04-screens/`. Native Exporte sind weiterhin JS-/Hermes-/Asset-Bundles, keine installierten Apps. Detaillierter Vertrag: [Iteration 0.4](08-continuity-and-offline.md).

GitHub Actions: Die zusätzliche Root-Workflowdatei führt die gemeinsame OLIVA-Qualitätsaction aus. Ein echter Remote-Lauf wird im gesonderten CI-Nachweis aufgeführt; eine vorhandene YAML-Datei allein zählt nicht als erfolgreicher Lauf.
