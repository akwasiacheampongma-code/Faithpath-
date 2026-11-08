# Fortsetzen · OLIVA / FaithPath Next Generation

Stand: 07.11.2026. **OLIVA 0.6.0 mit A51, 66 Buchansichten und großem Johannes-Schwertbild ist privat bereitgestellt.** Der ursprüngliche Master-Prompt bleibt offen und maßgeblich. Nutzdatenformat weiterhin V5; privates Speicherdokument V1; SQLite physisch V3; IndexedDB physisch V1. Für 0.6 war keine Nutzdatenmigration nötig.

## Sofort ausprobieren

- Private App: https://oliva-v04-private-preview.purplebean128.chatgpt.site
- Privater Vorher-/Nachher-Vergleich: https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg
- Mit dem berechtigten ChatGPT-Eigentümerkonto anmelden. Der Baum ist auf **Heute** und **Mein Garten** sichtbar; dort **„Alle sieben Lebensbilder ansehen“** öffnen.
- Neu: **Bibel → Johannes → „Buchschwert ansehen“** oder **Sammlung → Buchschwerter**. Große Illustration, exakter Kapitelzähler, Lichtspur und drei Quellenlinks sind integriert; alle 66 kompakten Vektoren bleiben erhalten.
- Die URL enthält aus ihrer Entstehung noch `v04`; ausgeliefert wird seit **07.11.2026, 12:59:18 UTC** Version **0.6.0**.
- Eigentümerzugriff unverändert: keine Änderung des Publikums, keine öffentliche Veröffentlichung. Anonyme HTTP-Anfrage: 401, kein App-HTML.

## Arbeitsbereiche und Quellschutz

Unabhängige OLIVA-Quelle: `/workspace/faithpath-next`. Lokaler Gitbranch: `feature/oliva-v06-book-identities-20261107`, ohne Remote. Der vollständige lokale Quellstand ist über den Tag `oliva-v0.6-book-identities-private` gesichert. Quell-ZIP: `/workspace/oliva-next-v0.6-book-identities-source.zip`; Commit und SHA-256 werden außerhalb des Archivs in `/workspace/oliva-v06-local-checkpoint.json` protokolliert. FaithPath-Referenz: `/workspace/faithpath-reference`. Alle 390 materialisierten Referenzdateien stimmen mit ihren ursprünglichen Git-Blobs überein.

Der unabhängige Vorgänger 0.5 ist gesichert: Commit `8266d8dfa8b080603248e232787cc8853eacbf7a`, Tag `oliva-v0.5-a51-private`, ZIP `/workspace/oliva-next-v0.5-a51-source.zip`, 95.615.317 Byte, SHA-256 `efc998f8ad74d5c22165bb05ef11d2f099d804916ceea3d37b3ee3db1e67e045`. Kontroll-Webexport: `/workspace/oliva-v05-a51-control-dist`. Frühere Belege unter `docs/evidence/session-05/` bleiben unverändert erhalten.

Das öffentliche Repository `akwasiacheampongma-code/Faithpath-` bleibt auf dem bisherigen OLIVA-0.4-Sicherungsstand: Branch `feature/oliva-next-v02-20261106`, OLIVA im Unterordner `oliva/`, letzter Quellcheckpoint `df6d2f96c2116a817ca2f63bf6bd00c97925b674`. Geprüfter 0.4-Runtime-Commit: `dbde76fcc7ab155cc5acabfd7f2a1ba996ab121c`. Seit der privaten Vorschauvorgabe erfolgen **keine weiteren öffentlichen Pushes, kein Merge nach `main` und keine Änderungen an der ursprünglichen FaithPath-App**.

FaithPath-Analysebasis: `a519ce898fa33907b07d5ac7a585595127556183`, Branch `feature/simplified-step-experience-20261104`. Nur die ausdrücklich beauftragte A51-Baumvorarbeit wird übernommen; OLIVAs Navigation, Datenspeicherung und Fortschrittsregeln bleiben eigenständig.

## Tatsächlich bereitgestellter 0.6-Checkpoint

Die getrennte private Sites-Quelle liegt unter `/workspace/sites/oliva-v04-preview`. Die dortige Gitquelle enthält das Hostpaket und ist kein öffentlicher FaithPath-Push.

| Kennung | Wert |
| --- | --- |
| Sites-Projekt | `appgprj_6aedf77e5ce0819180c10eb799447018` |
| Private Quelle | `f7705ee5955cb4bb984301363cd6641c7fa591c0` |
| Deployment | `appgdep_6aef2097fb108191981ddd7bfacf5e02` · erfolgreich |
| Version | `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_eca6aafe77648191b711797ac26500c0` |
| Geprüfter Kernbuild | `oliva-a542b7009551a2a2` |
| Hostpaket-Build | `oliva-524e381f7222abe8` |

Der Host benötigt angepasste Asset-URLs; die Produktlogik bleibt dieselbe. Zwei HTML-Dateien hatten im beobachteten Dienst den SPA-Fallback deaktiviert. Die Hostingausgabe enthält deshalb nur eine `index.html`; Screenshotvergleiche werden als SVG ausgeliefert. Die aktuelle HTTP-Prüfung bestätigt **15 App-Routen mit Shell sowie 98 App- und 42 Review-Dateien bytegenau**, Manifest und Service Worker korrekt, anonym 401. Dauerhafte Belege: `docs/evidence/session-06/private-deployment.json`, `private-http-check.json`, `private-source-checkpoint.json` und `private-package-check.json`.

Die private Website wurde nicht zusätzlich mit dem vom Sites-Workflow vorgeschriebenen CUA-Browser geprüft, weil dieses Werkzeug nicht verfügbar war. Die lokalen Chromium-/Playwright-Prüfungen der tatsächlichen Expo-Kern-App sind davon getrennt und wurden ausgeführt. Keine Handyinstallation oder physische PWA-Prüfung behaupten.

## Implementierter Kern

- Expo 58, React Native 0.88, React 19, TypeScript, Expo Router, Zustand und Zod; SQLite nativ, IndexedDB im Web.
- Gemeinfreie Lutherbibel 1912: 66 Bücher, 1.189 Kapitel, 31.102 Verse; Original-USFM und deterministischer Import erhalten.
- Reader mit Navigation, Suche, zwei Modi, Versnotizen, Lesezeichen, Markierungen, Schrift-/Abstandseinstellungen und ausdrücklich bestätigtem Kapitel-/Abschnittsfortschritt. Seit 0.5 wird der tatsächliche Versanker bei Neustart, Offline-Nutzung, Reflow und Schriftänderung wiederhergestellt; daraus entsteht kein Lesefortschritt.
- Neun geführte Wege mit je drei Schritten, neun thematisch wiederverwendeten Pilot-Einordnungen und neun freiwilligen Textfragen mit echten Versbelegen. Unabhängige Fachfreigabe offen.
- Hub, 66 Buchansichten mit Themenbeschreibung/Lesespur/Kapitelwahl, großer Johannes-Bildpilot mit Quellenlinks und separater Lichtspur, alle 66 kompakten Vektorschwerter; Sammlung, Journal und Vorhaben mit eigenen Schritten, Archiv/Wiederaufnahme und bewahrten Rückblick-Snapshots.
- Dauerhafte Entwürfe für Hub, Garten, Reader und geführten Schritt; Sammlung führt zur Quelle zurück. RAM-Rettung nach Schreibfehlern schützt nur innerhalb der laufenden Sitzung.
- Additiver FaithPath-V5-Import mit Vorschau, Konfliktschutz, Originalarchiv, Quellensnapshots und atomarer Rückkehrsicherung. Importierte Vergangenheit erzeugt keinen neuen Fortschritt. OTB bleibt als fremde Übersetzung gekennzeichnet.
- Private Archiv-Blobs, atomare Revision-/Sicherungs-/Bereinigungsoperationen, bestätigter Restore und unveränderter Rohdatenexport bei beschädigtem Bestand.
- Sieben generierte biblische Bildmaster, 18 WebP-Varianten und vier illustrierte Erzählpiloten. Bild, redaktionelle Einordnung und Bibeltext sind getrennt; fachliche Freigaben offen.
- PWA-Manifest, eigene Icons, vollständiges Offlinepaket, Build-ID und Vorgängercache; tatsächlicher 0.5→0.6-Updatewechsel mit unveränderten Zustandsdatensätzen, neuer Buchroute/PNG und sieben A51-Stadien nach Offline-Neustart geprüft. Historischer 0.4→0.5-Versuch bleibt erhalten.

## A51-Baum

Sieben unveränderte PNG-Master wurden im historischen Designcommit `0e02d5329a87cdcdfc52694d74c610da2975b357` gefunden. Alle Master und die 21 WebPs stimmen mit den Hashes der A51-Stadienbeschreibung überein. Originale, Prompts und Runtime-Referenz bleiben unter `art/a51/` erhalten. Herkunft: `art/a51/provenance.json`; Bericht: `docs/09-a51-integration.md`.

Web verwendet den geprüften A51-Kern hinter einem typisierten React-Adapter. Native Plattformen verwenden 98 aus den Originalmastern erzeugte PNGs in 640/1.024 Pixeln und einen separaten, nativ animierten Ebenenadapter. Gemeinsame Metadaten und der bestehende OLIVA-Index bleiben maßgeblich. Vorschau, Laden und Animation schreiben keine Nutzerdaten. Native Bewegung ist eine Annäherung an die kontinuierliche WebGL-Verformung; ihre tatsächliche Qualität, Energie und Speichergrenzen sind auf Geräten offen.

Ein echter ursprünglicher Webfehler wurde reproduziert und im OLIVA-Adapterkern behoben: Der IntersectionObserver lieferte für dieselbe Wurzel in einem Callback zuerst `false`, dann `true`. `entries[0]` hielt die Szene fälschlich unsichtbar. Jetzt zählt die letzte passende Meldung. Ein deterministischer Replay prüft beide Reihenfolgen. Die unveränderte Originalreferenz bleibt erhalten. Eine frühere Hintergrundtab-Vermutung war keine bestätigte Ursache dieses Produktfehlers.

## Tatsächliche Abnahme 0.6

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

http://localhost:4173 öffnen. In einem separat ausgecheckten Standalone-Projekt dieselben npm-Befehle direkt in dessen Wurzel ausführen. Nur im historischen öffentlichen 0.4-Checkout ist zuvor `cd oliva` nötig.

Prüfungen: `npm run content:check`, `npm run content:art`, `npm run content:tree`, `npm run content:swords`, `npm run typecheck`, `npm test`, `npm run test:e2e`. Der aktuelle Updateversuch lautet `node scripts/offline-upgrade-v06.mjs /absoluter/pfad/zum/0.5/dist dist`. Die älteren Update-Skripte bleiben für ihre jeweils passenden historischen Exporte erhalten.

## Nächste überprüfbare Arbeit am ursprünglichen Master

1. Den gesicherten 0.6-Tag und Quell-ZIP bewahren; die nächste Iteration erhält einen eigenen lokalen Branch. Weiterhin keinen öffentlichen Push oder Merge ausführen.
2. **0.7 vorbereiten, noch nicht implementiert:** eigene Vorhaben-Rückblicke textlich bearbeiten, bestätigt löschen und sitzungsgebunden rückgängig machen. Analyse liegt vor: bestehende Draft-/Goal-CAS-Verträge nutzen, ursprüngliche Quellen und Importarchive bewahren, neue Editziel-/Hashfelder bei Bedarf über AppData V6 migrieren, physische DB V3/privates Dokument V1 beibehalten. Edit/Autosave/Delete/Undo dürfen kein neues Wachstum auslösen oder fremde neuere Änderungen überschreiben. Erst nach dem gesicherten 0.6-Checkpoint Code ändern.
3. Weitere hochwertige Buchillustrationen nach Prüfung des integrierten Johannes-Piloten sowie freiwillige Erinnerungen ergänzen. Der Johannes-Master, drei Varianten und die echte Kapitellichtlinie sind jetzt integriert; alle 66 kompakten Vektorschwerter bleiben erhalten. Berichte: `docs/10-sword-art-pilot.md`, `docs/11-book-identities.md`.
4. Weitere eigenständige Kapitelredaktion und Bildmotive nach Pilotprüfung; echte Anfänger-Usability und unabhängige theologische/historische Prüfung organisieren. Neun Pilottexte sind keine 27 eigenen Kapitelredaktionen.
5. Native Geräteabnahme einschließlich Baumbewegung, Speicher/Energie, SQLite, Dateidialogen, Abbruch/Low-Disk, Zurück-Taste, Tastatur, VoiceOver/TalkBack und großer Schrift.
6. V5-Import zusätzlich an einem anonymisierten echten Export prüfen, falls verfügbar. Keine persönlichen Exporte im Repository oder in Logs.
7. Auth/Sync und KI erst mit realem Dienst, sicheren Datenverträgen und tatsächlich prüfbaren Quellen anbinden. Vorbereitete Supabase-DDL ist kein aktiver Sync.

## Bleibende Grenzen und Vorgaben

FaithPath-Quelle bis 10 MiB UTF-8, vollständiges Backup bis 64 MiB. Erste Archivladung/Export sind speicherintensiv und nicht auf schwachen Geräten vermessen. Eine Rückkehrsicherung; nächster Import ersetzt sie, erfolgreiche Rückkehr verbraucht sie. Daten und Exporte sind unverschlüsselt. Auth/Sync, Live-KI und Audio sind nicht angeschlossen. Öffentliche Inhalts-/Rechtefreigaben, Store-Signing und echte Geräteprüfungen bleiben offen.

A51-Wiederverwendung ist ausdrücklich vom Projektauftrag autorisiert; eine allgemeine Weiterveröffentlichungslizenz wurde nicht festgestellt. Übernommener A51-Code und A51-Bilder sind von der OLIVA-MIT-Lizenz ausgenommen. Keine öffentliche Bereitstellung ohne ausdrückliche Freigabe.

Diese Datei ist der dauerhafte Fortsetzungsstand. Nach Wiederaufnahme Lieferstand und Tests lesen, erreichte Arbeit bewahren und am nächsten Teilziel weiterarbeiten. Kein ausgeführtes UI-`/resume` und keine selbstständig im Hintergrund laufende Entwicklung behaupten. Die Gesamt-Definition-of-Done bleibt offen.
