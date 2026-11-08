# Qualität und Abnahme

Dokumentationsstand: 07.11.2026. Lokale Prüfungen unter Linux, Node 24.22.1, npm 11.9.0 und systemweitem Headless-Chromium über Playwright. Browsergrößen sind simulierte CSS-Viewports. Nicht auf physischen Smartphones getestet.

## Aktueller Nachweis 0.7 · Rückblickkontinuität privat bereitgestellt

Private Bereitstellung seit **07.11.2026, 20:10:37 UTC**. Kernbuild **`oliva-f5f1df50305ec1e5`**, Hostpaket **`oliva-7173147c3f6d4bca`**. Eigentümerzugriff unverändert; keine öffentliche Veröffentlichung. [Deployment](evidence/session-07/private-deployment.json), [Paketprüfung](evidence/session-07/private-package-check.json) und [privater Quellcheckpoint](evidence/session-07/private-source-checkpoint.json) sind gespeichert.

| Prüfung | Tatsächliches Ergebnis | Beleg |
| --- | --- | --- |
| Fach-/Persistenzsuite | **116/116 bestanden**, keine Fehler | [unit-results.json](evidence/session-07/unit-results.json) |
| Vollständiger finaler Browserlauf | **59/59 in einem einzelnen Lauf bestanden**, 0 übersprungen, 0 flaky | [e2e-results.json](evidence/session-07/e2e-results.json) |
| TypeScript / Webbuild | Strikte Typprüfung und finaler Produktions-Webexport erfolgreich | [typecheck.txt](evidence/session-07/typecheck.txt), [web-build.txt](evidence/session-07/web-build.txt) |
| Rückblickverträge | Textkorrektur erhält Identität, Quelle, Erstellzeit und Erfahrung; No-op ohne Fake-Edit; Konflikte/fehlende Ziele bewahren Entwurfsworte; Delete/Undo ohne Wachstum | Fach-/Storetests und sieben Browserfälle; [Vertrag](12-review-editing.md) |
| Nebenläufigkeit | Hydrierung hinter Autosave und mit Aktionslock; verspäteter Delete-Abschluss nach Ansichtswechsel bietet kein Undo an | Store-Regressionen und Browserfall mit tatsächlich angehaltener IndexedDB-`oncomplete`-Bestätigung |
| Webzugänglichkeit | Shell-Landmarks und Profilname korrigiert; Editor bei 320/390/1.440 CSS-Pixeln, Hell/Dunkel und Axe erfolgreich | [review-a11y-fixed.json](evidence/session-07/review-a11y-fixed.json), finaler Gesamtlauf und [Screens](evidence/session-07/screens/) |
| Android-/iOS-Debugexports | Beide erfolgreich; je alle 98 A51- und drei Johannes-PNGs bytegenau; geprüfter finaler Runtime-Quellstand | [native-builds.json](evidence/session-07/native-builds.json) |
| Echter lokaler 0.6→0.7-Workerwechsel | V5→V6 im RAM; gespeichertes V5 bis explizitem Edit exakt; Originalblobs/Rückkehrsicherung, Fortschritt und alter Entwurf erhalten; neuer Build offline nutzbar | [offline-upgrade.json](evidence/session-07/offline-upgrade.json), [Log](evidence/session-07/offline-upgrade.log) |
| Private Hostingausgabe | 15 App-Routen mit Shell, 98 App- und 42 Review-Dateien bytegenau; Manifest/Worker korrekt, anonym HTTP 401 | [private-http-check.json](evidence/session-07/private-http-check.json) |

[validation-summary.json](evidence/session-07/validation-summary.json) enthält die finalen Ergebnisse und Rohberichtshashes. Sein Runtime-SHA-256 `0a45b1d952c55cfa530d14a10c684dcd45c4379e14e7620f6e50e0f3d05a2c3a` stimmt mit dem nativen Exportbeleg überein. Dies bindet die Bundles an den geprüften Quellenstand, ohne eine native Geräteausführung zu behaupten.

### Gefundene Fehler und erhaltene Rotbelege

Der erste vollständige Lauf bestand **57/59**. Ein echter Produktfehler meldete nach dem Verwerfen eines Capture-Entwurfs fälschlich eine gespeicherte Erfahrung, weil der gemeinsame Abschluss einen leeren Erfolgswert weitergab. Verwerfen reicht jetzt `undefined` an den bestehenden Rückruf weiter. Der zweite Fehler lag in der historischen V1-Testfixture: Sie enthielt versehentlich das neue V6-Feld `retainedReviewGrowth`; dieses Feld ist aus der alten Fixture entfernt. Beide Fälle bestehen im neuen vollständigen 59/59-Lauf. Der ursprüngliche [57/59-Bericht](evidence/session-07/e2e-before-discard-fix.json) bleibt erhalten.

Der erste fokussierte Rückblicklauf bestand 5/6 und fand fehlende Web-Landmarks sowie einen Profilnamen ohne die sichtbare Initiale. Nach den beiden Korrekturen bestand der Axe-Fall; die roten [Erstbelege](evidence/session-07/reviews-first-red.json) und der [Zwischenlauf](evidence/session-07/review-fixes-e2e.json) bleiben erhalten. Ein erster Delete-/Blur-Harness scheiterte an seiner Back-Navigation; er war kein ausgeführter Nachweis des Produktrennens. Die korrigierte Regression hält die echte IndexedDB-Abschlussbestätigung zurück und besteht ebenfalls im finalen Gesamtlauf.

### Migration, Offline und Prüfgrenzen

AppData/Backup ist erstmals **V6**, nach strikter Prüfung der eingefrorenen V1–V5-Verträge. Privates Dokument V1, SQLite physisch V3 und IndexedDB physisch V1 bleiben bestehen. Im tatsächlich ausgeführten Update bleibt `main` nach Hydrierung als V5 bytegleich in seiner UTF-8-JSON-Darstellung; erst der ausdrücklich angelegte Bearbeitungsentwurf schreibt V6. Beim Textabschluss bleiben Review-ID, Quelle, `createdAt` und `applied` erhalten, die Vorhabenrevision steigt einmal. Alle drei Nicht-`main`-Datensätze bleiben exakt erhalten. Nach Offline-Neustart sind Bearbeitung, sieben A51-Stadien, Johannesroute/PNG und ein ausschließlich im Vorgängercache vorhandener Chunk verfügbar. Das ist lokale Chromium-Evidenz mit synthetischen Daten.

Native Exporte verwenden `--no-minify --no-bytecode`: unsignierte JS-/Asset-Debugbundles, keine Hermes-Bytecodes, APK/AAB/IPA, Simulatoren oder physischen Geräte. Die private Website wurde per HTTP geprüft; eine zusätzliche gehostete CUA-Browserprüfung war mangels des unterstützten Werkzeugs nicht möglich. Lokale Chromium-Interaktionen sind davon getrennt. Automatisierte Axe-Prüfungen ersetzen keine manuelle Screenreader-/WCAG-Gesamtfreigabe.

Historische Berichte und Quellstände bis 0.6 bleiben erhalten. Der erfolgreiche GitHub-CI-Lauf gilt ausschließlich für 0.4; 0.7 ist lokal geprüft und privat bereitgestellt. Als Schutzaufgabe für 0.8 soll der Standardpfad neuer Playwright-Berichte nach `docs/evidence/latest/` wechseln, damit die historischen 0.4-Rohberichte nicht überschrieben werden; dies ist noch keine durchgeführte Konfigurationsänderung.

## Historischer Nachweis 0.6 · Buchidentitäten und Johannes-Bildpilot

Private Bereitstellung seit 07.11.2026, 12:59:18 UTC. Kernbuild **`oliva-a542b7009551a2a2`**, Hostpaket **`oliva-524e381f7222abe8`**. Eigentümerzugriff unverändert; keine öffentliche Veröffentlichung. [Deployment](evidence/session-06/private-deployment.json), [Paketprüfung](evidence/session-06/private-package-check.json) und [Quellcheckpoint](evidence/session-06/private-source-checkpoint.json) sind gespeichert.

| Prüfung | Tatsächliches Ergebnis | Beleg |
| --- | --- | --- |
| Fach-/Persistenzsuite | 75 bestanden, keine Fehler | [unit-results.json](evidence/session-06/unit-results.json) |
| Fokussierte Buchschwertfälle | 7/7 bestanden; dieselben sieben Fälle später im Gesamtlauf ebenfalls erfolgreich | [swords-e2e.json](evidence/session-06/swords-e2e.json) |
| Vollständiger Browserlauf nach Layoutkorrektur | 51/52 bestanden; ein zu früh gemessener Versanker, keine übersprungenen oder flaky Fälle | [e2e-first-full.json](evidence/session-06/e2e-first-full.json) |
| Betroffene Capture-/Readerfälle nach Testsynchronisierung | 11/11 bestanden; Produktbuild unverändert, kein Überspringen oder Flaky-Ergebnis | [reader-regression.json](evidence/session-06/reader-regression.json) |
| SVG-/PNG-Fortschritt und Navigation | 0/1/11/21 Kapitel, Hell/Dunkel, 320/390/1.440 CSS-Pixel; genauer Zähler/ARIA-Wert, Quellen, unveränderte Daten, endlicher Impuls und Reduktionsvorgaben | Buchschwertfälle und [Screens](evidence/session-06/screens/) |
| Johannes-Bildassets | Master unverändert; drei PNGs in 256/512/768 Pixeln, zusammen 388.515 Byte; Fallback, drei Ladefehler, Retry und verspätete Antwort geprüft | [sword-assets.json](evidence/session-06/sword-assets.json), Browserberichte |
| Android-/iOS-Debugexports | Je alle 98 A51- und drei Johannes-PNGs bytegenau; Webrenderer, großer Schwertmaster und Promptmaterial ausgeschlossen | [native-builds.json](evidence/session-06/native-builds.json) |
| Echter 0.5→0.6-Updatewechsel | Alle Zustandsdatensätze unverändert; V5 ohne Migration; neue Buchroute/PNG und sieben A51-Stadien offline; alter exklusiver Chunk verfügbar | [offline-upgrade.json](evidence/session-06/offline-upgrade.json) |
| Private Hostingausgabe | 15 App-Routen mit Shell, 98 App- und 42 Review-Dateien bytegenau geprüft; Manifest/Worker korrekt, anonym HTTP 401 | [private-http-check.json](evidence/session-06/private-http-check.json) |

**Die vereinigten erfolgreichen Berichte decken alle 52 unterschiedlichen Szenarien ab. Es gab keinen neuen einzelnen grünen 52/52-Gesamtlauf.** [validation-summary.json](evidence/session-06/validation-summary.json) enthält ausdrücklich `isSingleGreenFullRun=false` und die Rohberichtshashes.

Der eine Fehler des vollständigen Laufs betraf eine Momentaufnahme vor dem Ende der asynchronen Reader-Wiederherstellung. Am unveränderten Build wurde zuerst `y=6379`, danach ohne Testscroll `y=24` gemessen. Die Prüfung wartet nun im bisherigen Zeitlimit auf ein tatsächlich vorhandenes Rechteck mit unveränderter Anforderung `0 ≤ y < 200`. Es wurden ausschließlich Testsynchronisierung und Diagnose ergänzt, weder Produktscrollen noch Schwellenwert verändert. [reader-anchor-synchronization.json](evidence/session-06/reader-anchor-synchronization.json) belegt die Messung.

Der frühere ARIA-Rotlauf bleibt als [Fehlernachweis](evidence/session-06/swords-e2e-red-aria.json) erhalten. Explizite Webattribute ergänzen die auf React Native Web 0.21 nicht zuverlässig übergebenen nativen Zustandsobjekte; die nativen Angaben bleiben bestehen. Ein automatisierter Axe-Scan ist keine manuelle Screenreader-/WCAG-Gesamtfreigabe.

Native Exporte sind unsignierte JS-/Asset-Debugbundles ohne Bytecode; es wurden keine APK/AAB/IPA, Simulatoren oder Geräte geprüft. Die lokale App wurde tatsächlich mit Playwright geprüft. Eine zusätzliche Browser-/Handyprüfung des gehosteten Links wird nicht behauptet. Der erfolgreiche Remote-CI-Lauf von 0.4 bleibt historisch und ist kein 0.6-CI-Nachweis. Öffentliche Rechte- und unabhängige Inhalts-/Designfreigaben bleiben offen.

## Historischer Nachweis 0.5 · A51 und Versfortsetzung

Die private 0.5-Vorschau ist seit 06.11., 18:10:52 UTC bereitgestellt. Kernbuild: `oliva-f9aa29af9f863cf9`; Hostpaket: `oliva-e0fde474fcc06f7c`. Die folgenden Ergebnisse wurden tatsächlich ausgeführt. Historische Ergebnisse für 0.4 stehen getrennt weiter unten.

| Prüfung | Ergebnis | Nachweis |
| --- | --- | --- |
| Fach-/Persistenzsuite | 72 bestanden, 0 fehlgeschlagen | [unit-results.json](evidence/session-05/unit-results.json) |
| TypeScript nach Webkorrektur | Strikte Prüfung erfolgreich | [a51-io-fixed-typecheck.txt](evidence/session-05/a51-io-fixed-typecheck.txt) |
| Vollständiger Browserlauf vor IO-Fix | 44/45 bestanden, ein tatsächlicher A51-Sichtbarkeitsfehler; nichts übersprungen/flaky | [e2e-full-before-io-fix.json](evidence/session-05/e2e-full-before-io-fix.json) |
| Betroffene Browserfälle nach IO-Fix | 5/5 A51-Fälle bestanden, nichts übersprungen/flaky | [a51-io-fixed-e2e.json](evidence/session-05/a51-io-fixed-e2e.json) |
| Reader-Versanker | Vier gezielte Fälle erfolgreich: Verslink, Reflow/Schriftänderung, Bereichs-/Kapitelwechsel und V4-Migration; ebenfalls im späteren Gesamtlauf bestanden | [reader-position-results.json](evidence/session-05/reader-position-results.json) |
| A51-Dateien | Sieben Master, 21 originale WebPs und 98 native PNGs mit erwarteten Hashes | [asset-integrity.json](evidence/a51/asset-integrity.json) |
| A51-Browserdarstellung | Sieben Stadien, Galerie, Hell/Dunkel, 320/390/1.440 CSS-Pixel; Vorschau schreibt keine persönlichen Daten; reduzierte Bewegung, Sichtbarkeit, Bildfehler/Retry und Grafikfallbacks | Fünf A51-Nachtests und [Screenshotvergleich](evidence/a51/comparison.html) |
| Native PNG-Ruhepose | 14 Gruppen tatsächlich dekodiert und zusammengesetzt; maximale Alphaabweichung 0,498032, vormultiplizierte RGB-Abweichung 0,461478 von 255 | [native-rest-fidelity.json](evidence/a51/native-rest-fidelity.json) |
| Android-/iOS-Debugexport | Beide erfolgreich; je alle 98 A51-PNGs bytegenau enthalten, A51-Webrenderer ausgeschlossen | [native-builds.json](evidence/session-05/native-builds.json) |
| Echter 0.4→0.5-Workerwechsel | Profil, Notizen, Vorhaben, Entwurf, Fortschritt und Originalarchiv-Blobs erhalten; Neustart und alle sieben Stadien offline; ausschließlich alter JS-Chunk weiterhin aus Vorgängercache verfügbar | [offline-upgrade.json](evidence/session-05/offline-upgrade.json) |
| FaithPath-Referenz | Alle 390 materialisierten Dateien unverändert | [original-reference-integrity.json](evidence/session-05/original-reference-integrity.json) |
| Private Hostingausgabe | 13 App-Routen mit Shell, 94 App-Dateien und 33 Review-Dateien bytegenau geprüft; Manifest/Worker korrekt; anonym HTTP 401 | [private-http-check.json](evidence/session-05/private-http-check.json) |

**Die vereinigten Berichte belegen 45 unterschiedliche erfolgreiche Szenarien. Sie sind kein neuer einzelner grüner 45/45-Gesamtlauf nach dem Fix.** Der vollständige Lauf endet mit 44/45; anschließend wurden nur die fünf betroffenen A51-Fälle wiederholt. [validation-summary.json](evidence/session-05/validation-summary.json) hält diese Grenze ausdrücklich fest. Der tatsächlich erfolgreiche GitHub-CI-Lauf 42240609694 gilt ausschließlich für 0.4, nicht für diesen lokalen 0.5-Stand.

### Bestätigte Ursache und Korrektur

Bei 320 × 568 CSS-Pixeln lieferte der Browser in einem IntersectionObserver-Callback zwei Meldungen für dieselbe Baumwurzel: zuerst unsichtbar, danach sichtbar. Der unveränderte A51-Code las nur `entries[0]`. Dadurch blieb `visible=false`, obwohl der Baum auf dem Bildschirm lag, und das gewünschte Stadium wurde nicht geladen. Die OLIVA-Webengine verarbeitet jetzt die letzte zum Root passende Meldung. Der Nachtest spielt beide Reihenfolgen deterministisch nach und prüft das jeweilige Ergebnis. [IO-batch-diagnosis.json](evidence/session-05/IO-batch-diagnosis.json) enthält echte Browsermeldungen, sichtbare Grenzen, Vorher-/Nachher-Hashes und den gezielten Testnachweis. Die Originalreferenz ist unverändert.

Eine frühere Hintergrundtab-Vermutung erklärte diesen Produktfehler nicht und wird nicht als Diagnose ausgegeben. Der erste 42/45-Zwischenlauf und seine damaligen Harness-/Fixtureprobleme bleiben als historische Rohberichte erhalten. Maßgeblich sind der spätere vollständige 44/45-Bericht und die fünf erfolgreichen Nachtests.

Der Readerfehler hatte eine andere Ursache: RN-Web-`onLayout` erfasste reine Positionsverschiebungen nach Reflow nicht zuverlässig. Die Versfortsetzung misst zusammenhängend relativ zum Textcontainer und schützt den bisherigen Anker während Schrift-, Modus- und Notizänderungen. Die Tests prüfen tatsächliche Versposition und dauerhafte Speicherung; fachliche Aussagen wurden nicht abgeschwächt.

### Grenzen der aktuellen Nachweise

Native Exporte entstanden vor dem anschließenden reinen Web-IO-Fix. Der korrigierte Webrenderer war nachweislich in keinem der beiden nativen Exporte enthalten; native Quellen und Assets wurden dadurch nicht verändert. Dieser Unterschied ist im Exportbeleg annotiert. `--no-minify --no-bytecode` erzeugt Debug-JavaScript-/Asset-Bundles, keine Hermes-Bytecodes oder signierten APK/AAB/IPA. Keine Simulatoren und keine physischen Geräte wurden verwendet.

Die lokale Kern-App wurde tatsächlich mit Playwright geprüft. Eine zusätzliche Browserprüfung der gehosteten privaten Sites-Version wurde mangels des vorgesehenen CUA-Werkzeugs nicht durchgeführt. Die authentifizierte HTTP-Prüfung kontrolliert Zugriff, Routing, Assetbytes und PWA-Dateien, jedoch weder Interaktion noch Installation auf einem Handy. Zwei HTML-Dateien hatten im beobachteten Hosting den SPA-Fallback deaktiviert; die finale Ausgabe enthält eine `index.html` und den Reviewvergleich als SVG. Nach dieser Änderung lieferten alle 13 geprüften App-URLs wieder die Shell.

## Historischer Prüfstand bis 0.4

Die folgenden Tabellen und Iterationsberichte betreffen die vorangegangenen Versionen. Sie werden als Entwicklungs- und CI-Historie bewahrt und sind keine zusätzliche aktuelle 0.7-Abnahme.

### Tatsächlich ausgeführte Prüfungen bis 0.4

| Prüfung | Ergebnis / Umfang | Nachweis |
|---|---|---|
| Bibelimport und Reproduzierbarkeit des Korpus | 66 Bücher, 1.189 Kapitel, 31.102 Verse; Bundle erneut aus Originalarchiv ableitbar | `npm run content:check`, Import-SHA unten |
| TypeScript | Fehlerfreie strikte Typprüfung | `npm run typecheck` |
| Fach-/Persistenzsuite | 64 Tests bestanden, einschließlich V5-Import, Migration und echter SQLite-Transaktionen | `tests/*.test.ts`, `docs/evidence/unit-results.json` |
| Browser-Hauptabläufe | 35/35 im vollständigen GitHub-Lauf bestanden, 0 Fehler/übersprungen/flaky; früherer Lastlauf und erster CI-Fehlerbericht bleiben separat erhalten | `docs/evidence/e2e-results.json` |
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
| Android | Aktueller JS-/Asset-Debugexport; frühere Hermes-Exporte gesondert belegt | `dist-android/`; kein installiertes APK |
| iOS | Aktueller JS-/Asset-Debugexport; frühere Hermes-Exporte gesondert belegt | `dist-ios/`; kein signiertes IPA |
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

Der erste tatsächliche GitHub-Lauf (`e7f7a49`, Run 42237726593) bestand die Typ-/Korpus-/Bildprüfung und 64 Fachtests. 33 von 35 Browserfällen bestanden. Zwei Fälle lösten unmittelbar nach Undo bzw. Entwurfsverwerfen einen Neustart aus, bevor der bestätigte Speicherabschluss erreicht war. Die Tests warten nun auf den tatsächlich gespeicherten Rückkehrzustand bzw. entfernten Entwurf, bevor sie neu laden. Alle fachlichen Aussagen bleiben bestehen. Fünf betroffene Szenarien bestehen in der gezielten lokalen Wiederholung. Der unveränderte erste CI-Bericht bleibt unter `ci-initial-e2e.json` erhalten; der vollständige neue Remote-Lauf wird separat dokumentiert.

Die Kontextillustration verwendet einen Container im ursprünglichen 3:2-Verhältnis mit vollständig füllendem Image. So überschreibt eine intrinsische Web-Assethöhe nicht die beabsichtigte responsive Darstellung. Der Browserfall prüft das tatsächlich gerenderte Verhältnis.

Die finalen nativen Resolver-/Assetprüfungen des Runtime-Commits `dbde76f` verwenden ausdrücklich `--no-minify --no-bytecode`. Sie sind Debugexports und kein Performance- oder Release-Nachweis. Frühere tatsächliche Hermes-Exporte dieser Iteration bleiben unter `builds-prior-hermes.json` dokumentiert; sie entstanden vor der letzten Bildlayoutkorrektur. Ein signierter nativer Releasebuild und physische Geräteprüfung bleiben offen. Der Produktions-Webexport ist regulär optimiert.

## Abschließender Remote-Nachweis 0.4

[GitHub Actions, Run 42240609694](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42240609694) ist erfolgreich. Geprüfter Runtime-Commit: `dbde76fcc7ab155cc5acabfd7f2a1ba996ab121c`. Das unveränderte heruntergeladene Artefakt belegt **64/64 Fach-/Persistenztests und 35/35 Browserfälle**, jeweils ohne Fehler; Browserfälle ohne Wiederholungsautomatik, Flaky-Ergebnis oder Überspringen. Korpus-/Bildprüfung, TypeScript und Produktions-Webbuild sind ebenfalls erfolgreiche Schritte dieses Laufs.

`ci-run.json` enthält Run-/Job-/Artefakt-ID, ZIP-SHA-256 und die Hashes der unverändert übernommenen JSON-Berichte. `e2e-results.json` und `unit-results.json` stammen aus diesem tatsächlichen GitHub-Artefakt. Die früheren Fehlerberichte werden nicht als finales Ergebnis ausgegeben. Der folgende Quellencheckpoint ändert ausschließlich Dokumentation und Evidenz; der geprüfte Runtime-Stand bleibt gleich. Keine Aussage über physische Geräte oder öffentliche Inhaltsfreigabe wird daraus abgeleitet.
