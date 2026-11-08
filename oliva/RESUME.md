# Fortsetzen · OLIVA / FaithPath Next Generation

Stand: 08.11.2026. **OLIVA 0.7.0 mit geschützter Rückblickbearbeitung, bestätigtem Löschen und sitzungsgebundenem Undo ist privat bereitgestellt.** Der ursprüngliche Master-Prompt bleibt offen und maßgeblich. Nutzdatenformat V6 mit strikter Migration aus V1–V5; privates Speicherdokument V1; SQLite physisch V3; IndexedDB physisch V1. A51, 66 Buchansichten und großes Johannes-Schwertbild bleiben enthalten.

## Sofort ausprobieren

- Private App: https://oliva-v04-private-preview.purplebean128.chatgpt.site
- Mit dem berechtigten ChatGPT-Eigentümerkonto anmelden. Die URL enthält weiterhin `v04`; seit **07.11.2026, 20:10:37 UTC** wird dort **0.7.0** ausgeliefert.
- **Wege → Persönliche Vorhaben → eigener Rückblick:** Text bearbeiten, den gesicherten Entwurf über Sammlung fortsetzen, bestätigt löschen und innerhalb derselben geöffneten Ansicht einmal zurückholen. Identität, damalige Quelle und Erfahrungsbestätigung bleiben beim Edit erhalten; daraus entsteht kein neues Wachstum.
- Der A51-Baum steht auf **Heute** und **Mein Garten**; **„Alle sieben Lebensbilder ansehen“** öffnet die Galerie. Privater Vergleich: https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg
- **Bibel → Johannes → „Buchschwert ansehen“** oder **Sammlung → Buchschwerter** öffnet Illustration, Kapitellichtspur und Quellen. Alle 66 kompakten Vektoren bleiben erhalten.
- Eigentümerzugriff unverändert: keine Änderung des Publikums, keine öffentliche Web-Veröffentlichung. Anonyme HTTP-Anfrage: 401, kein App-HTML.

## Arbeitsbereiche und Quellschutz

Unabhängige OLIVA-Quelle: `/workspace/faithpath-next`. Lokaler Gitbranch: `feature/oliva-v07-review-history-20261107`, ohne Remote. Für die Abschlusssicherung sind Tag `oliva-v0.7-review-continuity-private`, Quell-ZIP `/workspace/oliva-next-v0.7-review-continuity-source.zip` und das äußere Commit-/SHA-256-Manifest `/workspace/oliva-v07-local-checkpoint.json` festgelegt. Keine unbekannte Commit- oder Archivprüfsumme wird vorweggenommen. FaithPath-Referenz: `/workspace/faithpath-reference`; alle 390 materialisierten Referenzdateien stimmen mit ihren ursprünglichen Git-Blobs überein.

Der unabhängige Vorgänger 0.6 bleibt gesichert: Commit `9b28f586574a380ef40419b02fccb68301c8287c`, Tag `oliva-v0.6-book-identities-private`, Quell-ZIP `/workspace/oliva-next-v0.6-book-identities-source.zip`; äußeres Manifest `/workspace/oliva-v06-local-checkpoint.json`. Die 0.6-Quellen und Belege unter `docs/evidence/session-06/` bleiben erhalten.

Der unabhängige Vorgänger 0.5 ist gesichert: Commit `8266d8dfa8b080603248e232787cc8853eacbf7a`, Tag `oliva-v0.5-a51-private`, ZIP `/workspace/oliva-next-v0.5-a51-source.zip`, 95.615.317 Byte, SHA-256 `efc998f8ad74d5c22165bb05ef11d2f099d804916ceea3d37b3ee3db1e67e045`. Kontroll-Webexport: `/workspace/oliva-v05-a51-control-dist`. Frühere Belege unter `docs/evidence/session-05/` bleiben unverändert erhalten.

Am **08.11.2026** wurde ausdrücklich beauftragt, **0.5,0.6,0.7 und alle folgenden Versionen wie0.4 auf GitHub zu sichern**. Ziel ist das bestätigte öffentliche Repository `akwasiacheampongma-code/Faithpath-`, jeweils im Unterordner `oliva/` auf eigenem Versionsbranch mit Versions-Tag. Diese aktuelle Anweisung ersetzt die frühere GitHub-Pushpause. Die Nachsicherung ist beim Quellcheckpoint in Vorbereitung und vor einer Fertigmeldung per Remote-Ref/Teilbaum zu bestätigen; Ablauf und Zielrefs: [docs/13-github-version-backups.md](docs/13-github-version-backups.md). `main`, der 0.4-Branch `feature/oliva-next-v02-20261106` (Quellcheckpoint `df6d2f96c2116a817ca2f63bf6bd00c97925b674`) und alle ursprünglichen FaithPath-Anwendungsdateien bleiben unverändert. Nur der eigene OLIVA-Workflow darf auf den neuen Branches Tests auswählen. Kein Merge und kein öffentliches Web-/Storedeployment; die PWA bleibt eigentümerprivat.

FaithPath-Analysebasis: `a519ce898fa33907b07d5ac7a585595127556183`, Branch `feature/simplified-step-experience-20261104`. Nur die ausdrücklich beauftragte A51-Baumvorarbeit wird übernommen; OLIVAs Navigation, Datenspeicherung und Fortschrittsregeln bleiben eigenständig.

## Tatsächlich bereitgestellter 0.7-Checkpoint

Die getrennte private Sites-Quelle liegt unter `/workspace/sites/oliva-v04-preview`. Ihre Gitquelle enthält das Hostpaket und ist kein öffentlicher FaithPath-Push.

| Kennung | Wert |
| --- | --- |
| Sites-Projekt | `appgprj_6aedf77e5ce0819180c10eb799447018` |
| Private Quelle | `aa0f227a1e001de31ced169113a3f2f764948110` |
| Deployment | `appgdep_6aef85b06b1c8191b4a6a60fb3141064` · erfolgreich, 07.11.2026 um 20:10:37 UTC |
| Version | `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_a3c4eed520c08191a466392ed947e021` |
| Geprüfter Kernbuild | `oliva-f5f1df50305ec1e5` |
| Hostpaket-Build | `oliva-7173147c3f6d4bca` |
| Runtime-Quelldigest | `0a45b1d952c55cfa530d14a10c684dcd45c4379e14e7620f6e50e0f3d05a2c3a` |

Der Host benötigt angepasste Asset-URLs; die Produktlogik bleibt dieselbe. Die Hostingausgabe enthält eine `index.html`, damit der SPA-Fallback funktioniert; Screenshotvergleiche werden als SVG ausgeliefert. Die finale HTTP-Prüfung bestätigt **15 App-Routen mit Shell sowie 98 App- und 42 Review-Dateien bytegenau**, Manifest und Service Worker korrekt, anonym 401, Eigentümerzugriff unverändert. Dauerhafte Belege: `docs/evidence/session-07/private-deployment.json`, `private-http-check.json`, `private-source-checkpoint.json` und `private-package-check.json`.

Eine zusätzliche gehostete CUA-Browserprüfung war mangels des vorgesehenen Werkzeugs nicht möglich. Die lokalen Chromium-/Playwright-Prüfungen der Expo-Kern-App sind getrennte Nachweise. Keine Handyinstallation, Simulator- oder physische PWA-Prüfung behaupten.

## Implementierter Kern

- Expo 58, React Native 0.88, React 19, TypeScript, Expo Router, Zustand und Zod; SQLite nativ, IndexedDB im Web.
- Gemeinfreie Lutherbibel 1912: 66 Bücher, 1.189 Kapitel, 31.102 Verse; Original-USFM und deterministischer Import erhalten.
- Reader mit Navigation, Suche, zwei Modi, Versnotizen, Lesezeichen, Markierungen, Schrift-/Abstandseinstellungen und ausdrücklich bestätigtem Kapitel-/Abschnittsfortschritt. Seit 0.5 wird der tatsächliche Versanker bei Neustart, Offline-Nutzung, Reflow und Schriftänderung wiederhergestellt; daraus entsteht kein Lesefortschritt.
- Neun geführte Wege mit je drei Schritten, neun thematisch wiederverwendeten Pilot-Einordnungen und neun freiwilligen Textfragen mit echten Versbelegen. Unabhängige Fachfreigabe offen.
- Hub, 66 Buchansichten mit Themenbeschreibung/Lesespur/Kapitelwahl, großer Johannes-Bildpilot mit Quellenlinks und separater Lichtspur, alle 66 kompakten Vektorschwerter; Sammlung, Journal und Vorhaben mit eigenen Schritten, Archiv/Wiederaufnahme und bewahrten Rückblick-Snapshots.
- Dauerhafte Entwürfe für Hub, Garten, Reader, geführten Schritt und Rückblickbearbeitung; Sammlung führt zur Quelle zurück. Review-Edit prüft Entwurfsstempel, Vorhabenrevision und vollständigen Review-Hash. Konflikte und fehlende Ziele bleiben lesbar, exportierbar und verwerfbar; aus gelöschten Zielen entsteht kein neuer Rückblick. RAM-Rettung nach Schreibfehlern schützt nur innerhalb der laufenden Sitzung.
- Textkorrektur erhält Review-ID, `createdAt`, `applied` und historischen Snapshot; optionales `updatedAt` nur bei echter Änderung, kein Fake-Edit bei No-op. Delete entfernt Text und Snapshot im aktuellen Vorhabenbestand. Zwei anonyme Zähler `retainedReviewGrowth` erhalten bisherige Wachstumsschwellen. Ein RAM-Undo stellt nur den entfernten Rückblick zurück, keinen kompletten Datenstand. Alte Exporte, Importblobs und Rückkehrsicherungen können Kopien enthalten. Details: `docs/12-review-editing.md`.
- Additiver FaithPath-V5-Import mit Vorschau, Konfliktschutz, Originalarchiv, Quellensnapshots und atomarer Rückkehrsicherung. Importierte Vergangenheit erzeugt keinen neuen Fortschritt. OTB bleibt als fremde Übersetzung gekennzeichnet.
- Private Archiv-Blobs, atomare Revision-/Sicherungs-/Bereinigungsoperationen, bestätigter Restore und unveränderter Rohdatenexport bei beschädigtem Bestand.
- Sieben generierte biblische Bildmaster, 18 WebP-Varianten und vier illustrierte Erzählpiloten. Bild, redaktionelle Einordnung und Bibeltext sind getrennt; fachliche Freigaben offen.
- PWA-Manifest, eigene Icons, vollständiges Offlinepaket, Build-ID und Vorgängercache; tatsächlicher 0.6→0.7-Updatewechsel mit RAM-Migration V5→V6 geprüft. Gespeichertes V5 bleibt bis zum expliziten Edit unverändert; danach bleiben Rückblickidentität, Entwürfe, Fortschritt, Originalblob und Rückkehrsicherung erhalten. Sieben A51-Stadien, Johannesroute/PNG und ein exklusiver Vorgängerchunk sind nach Offline-Neustart geprüft. Frühere Updatebelege bleiben erhalten.

## A51-Baum

Sieben unveränderte PNG-Master wurden im historischen Designcommit `0e02d5329a87cdcdfc52694d74c610da2975b357` gefunden. Alle Master und die 21 WebPs stimmen mit den Hashes der A51-Stadienbeschreibung überein. Originale, Prompts und Runtime-Referenz bleiben unter `art/a51/` erhalten. Herkunft: `art/a51/provenance.json`; Bericht: `docs/09-a51-integration.md`.

Web verwendet den geprüften A51-Kern hinter einem typisierten React-Adapter. Native Plattformen verwenden 98 aus den Originalmastern erzeugte PNGs in 640/1.024 Pixeln und einen separaten, nativ animierten Ebenenadapter. Gemeinsame Metadaten und der bestehende OLIVA-Index bleiben maßgeblich. Vorschau, Laden und Animation schreiben keine Nutzerdaten. Native Bewegung ist eine Annäherung an die kontinuierliche WebGL-Verformung; ihre tatsächliche Qualität, Energie und Speichergrenzen sind auf Geräten offen.

Ein echter ursprünglicher Webfehler wurde reproduziert und im OLIVA-Adapterkern behoben: Der IntersectionObserver lieferte für dieselbe Wurzel in einem Callback zuerst `false`, dann `true`. `entries[0]` hielt die Szene fälschlich unsichtbar. Jetzt zählt die letzte passende Meldung. Ein deterministischer Replay prüft beide Reihenfolgen. Die unveränderte Originalreferenz bleibt erhalten. Eine frühere Hintergrundtab-Vermutung war keine bestätigte Ursache dieses Produktfehlers.

## Tatsächliche Abnahme 0.7

- **116/116 Fach-/Persistenztests**, strikter Typecheck und ein **einzelner vollständiger grüner Browserlauf mit 59/59 Szenarien** bestanden, ohne Überspringen oder Flaky-Ergebnis.
- Der vorherige vollständige Lauf hatte **57/59**: ein echter falscher Speicherhinweis nach Verwerfen, obwohl kein Eintrag entstand, sowie ein historisches V1-Testfixture mit versehentlichem V6-Feld. Beide sind korrigiert und im finalen Gesamtlauf enthalten; rote Berichte bleiben erhalten.
- Frühere gezielte Prüfungen fanden fehlende Weblandmarks und eine sichtbare Profilinitiale außerhalb des zugänglichen Namens; korrigiert und mit Axe geprüft. Hydrierung nutzt Aktionslock und Commitqueue; Fokus-/Navigationsgeneration verhindert Undo nach verspätetem Delete-Abschluss. Zwei Store-Regressionen und ein Browserfall mit tatsächlich angehaltener IndexedDB-Abschlussbestätigung belegen diese Grenzen.
- Finale Android-/iOS-Debugexports mit `--no-minify --no-bytecode` erfolgreich, Runtime-Quelldigest wie oben; je 98 A51- und drei Johannes-PNGs bytegenau. Keine Hermes-, Simulator-, Geräte-, Installations-, Bilddecoder- oder Akkutests.
- Echter 0.6→finaler 0.7-Workerwechsel erfolgreich: V5→V6 im RAM, gespeicherter V5-Stand bis zum expliziten Review-Edit exakt, erster Editentwurf schreibt V6 im Dokument V1. Review-ID/Quelle/Erstellzeit/Erfahrungsbestätigung, alte Entwürfe, Wachstum und Lesefortschritte erhalten; alle drei Nicht-`main`-Datensätze inklusive Originalblob und Rückkehrsicherung unverändert. Offline-Neustart, sieben A51-Stadien, Johannesbild und exklusiver Altchunk bestanden.
- Belege: `docs/evidence/session-07/validation-summary.json`, `unit-results.json`, `e2e-results.json`, `e2e-before-discard-fix.json`, `native-builds.json`, `offline-upgrade.json` und private Hostingberichte. Frühere Outputs vor dem letzten UI-Fix sind separat archiviert.

## Historische Abnahme 0.6

- **75/75 Fach-/Persistenztests bestanden**. Sieben gezielte Buchschwertfälle bestanden und waren im späteren vollständigen Lauf erneut erfolgreich.
- Vollständiger Browserlauf nach Layoutkorrektur: **51/52 bestanden**. Ein Test maß eine Versposition vor dem Abschluss der asynchronen Wiederherstellung. Nur Testsynchronisierung/Diagnose wurde ergänzt, kein Produktcode geändert: reales nicht leeres Versrechteck, weiterhin `0 ≤ y < 200`, kein Testscroll. Danach **11/11** Capture-/Readerfälle ohne Überspringen oder Flaky-Ergebnis bestanden. Die Vereinigung deckt alle **52** verschiedenen Szenarien ab; **kein neuer einzelner grüner 52/52-Gesamtlauf**.
- Johannes: drei technische PNG-Varianten mit zusammen 388.515 Byte, unveränderter Master. 0/1/11/21 Kapitel, Hell/Dunkel, kleine/große Ansichten, Quellen, Datenunverändertheit, Offline, drei Ladefehler/Retry und verspätete Antwort geprüft. Kurzer 720-ms-Impuls ausschließlich nach erfolgreich gespeicherter ausdrücklicher Kapitelbestätigung; App-/System-Reduced-Motion statisch.
- Android- und iOS-Debugexports mit `--no-minify --no-bytecode` erfolgreich: je alle 98 A51-PNGs und drei Johannes-PNGs bytegenau; A51-Webrenderer, großer Schwertmaster und Promptmaterial ausgeschlossen. Keine nativen Bilddecoder-/Animations-, Geräte-, Simulator-, APK/AAB/IPA- oder Akkutests.
- Echter 0.5→0.6-Offlinewechsel: alle Zustandsdatensätze unverändert, keine Migration oder zusätzliche Nutzerdatencommits; neue Buchroute/PNG, sieben A51-Stadien und ausschließlich im alten Cache vorhandener JS-Chunk geprüft.
- Berichte: `docs/evidence/session-06/validation-summary.json`, `unit-results.json`, `e2e-first-full.json`, `reader-regression.json`, `reader-anchor-synchronization.json`, `swords-e2e.json`, `native-builds.json`, `offline-upgrade.json` und die privaten Hostingnachweise.

## Historische Abnahme 0.5

- **72/72 Fach-/Persistenztests bestanden**, strikter Typecheck erfolgreich.
- Vollständiger Browserlauf vor dem isolierten Webfix: **44/45 bestanden**, ein belegter A51-Sichtbarkeitsfehler. Danach **5/5 betroffene A51-Fälle bestanden**, ohne Überspringen oder Flaky-Ergebnis. Die vereinigten Belege decken alle 45 unterschiedlichen Szenarien ab. **Es gab keinen neuen einzelnen grünen 45/45-Gesamtlauf nach dem Fix.**
- A51: alle sieben Stadien, Hell/Dunkel, 320/390/1.440 CSS-Pixel, Galerie, unveränderte Daten, reduzierte Bewegung, Sichtbarkeitspause, fehlendes WebGL, Grafikverlust, Bildfehler/Retry und alle Stadien nach Offline-Neustart geprüft. Echte Vorher-/Nachher-Screenshots sind erhalten.
- 14 native PNG-Gruppen tatsächlich dekodiert und in Ruhe rekonstruiert: maximale Alpha-Abweichung 0,498032 und vormultiplizierte RGB-Abweichung 0,461478 von 255. Dies ist kein nativer Bildschirmtest.
- Android- und iOS-Debugexports mit `--no-minify --no-bytecode` erfolgreich. Jeweils alle 98 A51-PNGs bytegenau enthalten; der A51-Webrenderer ist nicht enthalten. Die spätere IO-Korrektur betrifft ausschließlich den nachweislich ausgeschlossenen Webrenderer; der native Beleg ist entsprechend annotiert. Keine APK/AAB/IPA, kein Simulator und kein physisches Gerät.
- Tatsächlicher 0.4→finaler 0.5-Workerwechsel: Profil, Notizen, Vorhaben, offener Entwurf, alle Fortschrittsfelder und exakter Originalarchiv-Blob erhalten; sieben Stadien offline nutzbar. Ein ausschließlich im Vorgängercache vorhandener JS-Chunk bleibt verfügbar.
- Dauerhafte Belege: `docs/evidence/session-05/validation-summary.json`, `unit-results.json`, `e2e-full-before-io-fix.json`, `a51-io-fixed-e2e.json`, `IO-batch-diagnosis.json`, `offline-upgrade.json`, `native-builds.json` und `original-reference-integrity.json`.

Der tatsächliche GitHub-CI-Lauf **42240609694** mit **64/64 Fachtests und 35/35 Browserfällen** bleibt ausdrücklich der historische Nachweis für **0.4**, nicht für 0.5: https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42240609694. Rohartefakte unter `docs/evidence/ci-run.json` bleiben unverändert erhalten.

## Lokal starten und prüfen

Im aktuellen eigenständigen Projektverzeichnis:

```sh
cd /workspace/faithpath-next
npm ci
npm run build
npm run preview
```

http://localhost:4173 öffnen. In einem separat ausgecheckten Standalone-Projekt dieselben npm-Befehle direkt in dessen Wurzel ausführen. In allen GitHub-Versionsbranches liegt die App unter `oliva/`; dort zuerst `cd oliva` ausführen. Das separate Quell-ZIP ist dagegen direkt ein Standalone-Projekt.

Prüfungen: `npm run content:check`, `npm run content:art`, `npm run content:tree`, `npm run content:swords`, `npm run typecheck`, `npm test`, `npm run test:e2e`. Aktueller Updateversuch: `node scripts/offline-upgrade-v07.mjs /absoluter/pfad/zum/0.6/dist dist`. Ältere Update-Skripte bleiben ihren historischen Exporten zugeordnet. Neue Playwright-Ergebnisse ab 0.8 sollen standardmäßig unter `docs/evidence/latest/` liegen; zuerst diese Konfiguration umstellen, damit historische 0.4-Berichte nicht überschrieben werden.

## Nächste überprüfbare Arbeit am ursprünglichen Master

1. Den lokalen 0.7-Checkpoint mit Tag `oliva-v0.7-review-continuity-private`, ZIP `/workspace/oliva-next-v0.7-review-continuity-source.zip` und äußerem Manifest `/workspace/oliva-v07-local-checkpoint.json` abschließen; bestehende 0.6-/0.5-Quellen bewahren. Danach eigener lokaler 0.8-Branch; weiterhin kein öffentlicher Push oder Merge.
2. **Nächstes autonomes Teilziel 0.8: David vor Goliath integrieren.** Unter `art/biblical-next/` liegen ein tatsächlich generierter unveränderter 1536×1024-Master, Quellen/Prompt/Rechtegrenzen, drei geprüfte WebPs (640/1024/1280, zusammen 448.938 Byte) und `david-story-draft.json` zu **1. Samuel 17,38–45**. Master und 640er sind intern angesehen. **Noch keine Runtimeintegration.** Nach dem 0.7-Checkpoint als nächste Story einbinden; Bildausschnitte bei 320/390 Pixeln, exakte Reader-Verweise, Offlinepaket und unveränderte Nutzdaten prüfen. Bei Bedarf Bild-Fallback der Storykarte verbessern; öffentliche und unabhängige Fachfreigaben bleiben offen.
3. Vor neuen Browserläufen den Standardreportpfad auf `docs/evidence/latest/` umstellen; dauerhafte Sessions weiter separat ablegen. Weitere hochwertige Buchillustrationen nach Prüfung des Johannes-Piloten sowie freiwillige Erinnerungen ergänzen; 66 kompakte Vektorschwerter erhalten.
4. Weitere eigenständige Kapitelredaktion, echte Anfänger-Usability und unabhängige theologische/historische Prüfung organisieren. Neun Pilottexte sind keine 27 eigenen Kapitelredaktionen.
5. Native Geräteabnahme einschließlich Baumbewegung, Speicher/Energie, SQLite, Dateidialogen, Abbruch/Low-Disk, Zurück-Taste, Tastatur, VoiceOver/TalkBack und großer Schrift.
6. FaithPath-V5-Import zusätzlich an einem anonymisierten echten Export prüfen, falls verfügbar. Keine persönlichen Exporte im Repository oder in Logs.
7. Auth/Sync und KI erst mit realem Dienst, sicheren Datenverträgen und tatsächlich prüfbaren Quellen anbinden. Vorbereitete Supabase-DDL ist kein aktiver Sync.

## Bleibende Grenzen und Vorgaben

FaithPath-Quelle bis 10 MiB UTF-8, vollständiges Backup bis 64 MiB. Erste Archivladung/Export sind speicherintensiv und nicht auf schwachen Geräten vermessen. Eine Rückkehrsicherung; nächster Import ersetzt sie, erfolgreiche Rückkehr verbraucht sie. Daten und Exporte sind unverschlüsselt. Auth/Sync, Live-KI und Audio sind nicht angeschlossen. Öffentliche Inhalts-/Rechtefreigaben, Store-Signing und echte Geräteprüfungen bleiben offen.

A51-Wiederverwendung ist ausdrücklich vom Projektauftrag autorisiert; eine allgemeine Weiterveröffentlichungslizenz wurde nicht festgestellt. Übernommener A51-Code und A51-Bilder sind von der OLIVA-MIT-Lizenz ausgenommen. Die GitHub-Quellensicherung ist seit08.11 ausdrücklich beauftragt; eine öffentliche Web-/Storebereitstellung bleibt ohne gesonderte Freigabe untersagt. Die Lizenz-/Fachprüfungen werden dadurch nicht ersetzt.

Diese Datei ist der dauerhafte Fortsetzungsstand. Nach Wiederaufnahme Lieferstand und Tests lesen, erreichte Arbeit bewahren und am nächsten Teilziel weiterarbeiten. Kein ausgeführtes UI-`/resume` und keine selbstständig im Hintergrund laufende Entwicklung behaupten. Die Gesamt-Definition-of-Done bleibt offen.

GitHub-Nachsicherung: Bereits vorbereitete Mirror-Commits0.5/0.6 stehen in `/workspace/oliva-github-backup-plan.json`;0.7 folgt nach dessen lokalem Quelltag. Ergebnis-/Remoteprüfung danach unter `/workspace/oliva-github-backups.json`. Lokaler Helper `/tmp/prepare-oliva-history.py`; dessen Gitbaumvergleich prüft exakt `oliva/` und alle ursprünglichen FaithPath-Pfade. Ausschließlich explizite Versionsrefs pushen, keine Standalone-Tags direkt ins FaithPath-Repo und kein pauschales `--tags`.
