# Fortsetzen · OLIVA / FaithPath Next Generation

Stand: 08.11.2026. **OLIVA 0.9.0 mit Römer-Bild, gemeinsamer Buchbildregistrierung und neuer Startseitenansicht ist geprüft und privat bereitgestellt.** 120/120 Fachtests, ein einzelner vollständiger 76/76-Browserlauf, native JS-/Assetexporte und echter 0.8→0.9-Updateversuch sind erfolgreich. Die separate lokale Quellensicherung und anschließende GitHub-Sicherung folgen nach diesem Dokumentcheckpoint; keine unbekannten Commit- oder Archivhashes vorwegnehmen. Der ursprüngliche Master-Prompt bleibt offen. Nutzdaten V6, privates Dokument V1, SQLite physisch V3 und IndexedDB V1 bleiben unverändert.

## Sofort ausprobieren

- Private App: https://oliva-v04-private-preview.purplebean128.chatgpt.site
- Mit dem berechtigten ChatGPT-Eigentümerkonto anmelden. Die URL enthält weiterhin `v04`; seit **08.11.2026, 19:49:19 UTC** wird dort **0.9.0** ausgeliefert.
- **Bibel → Eine Geschichte entdecken → Davids Vorbereitung lesen:** neue Illustration und exakter Abschnitt 1. Samuel 17,38–45 mit getrennter Einordnung.
- **Wege → Persönliche Vorhaben → eigener Rückblick:** Text bearbeiten, den gesicherten Entwurf über Sammlung fortsetzen, bestätigt löschen und innerhalb derselben geöffneten Ansicht einmal zurückholen. Identität, damalige Quelle und Erfahrungsbestätigung bleiben beim Edit erhalten; daraus entsteht kein neues Wachstum.
- Der A51-Baum steht auf **Heute** und **Mein Garten**; **„Alle sieben Lebensbilder ansehen“** öffnet die Galerie. Privater Vergleich: https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg
- **Bibel → Römer → „Buchschwert ansehen“** öffnet das Schwert der Gnade. Nach bewusstem Öffnen eines Römer-Leseabschnitts zeigt auch die Startseite das aktuelle Buchbild; daraus entsteht kein bestätigtes Lesen. Direkt: https://oliva-v04-private-preview.purplebean128.chatgpt.site/buch/ROM
- **Bibel → Johannes → „Buchschwert ansehen“** oder **Sammlung → Buchschwerter** öffnet Illustration, Kapitellichtspur und Quellen. Alle 66 kompakten Vektoren bleiben erhalten.
- Eigentümerzugriff unverändert: keine Änderung des Publikums, keine öffentliche Web-Veröffentlichung. Anonyme HTTP-Anfrage: 401, kein App-HTML.

## Arbeitsbereiche und Quellschutz

Unabhängige OLIVA-Quelle: `/workspace/faithpath-next`. Aktiver lokaler Gitbranch: `feature/oliva-v09-book-gallery-20261108`, ohne Remote. Der unabhängige 0.7-Checkpoint ist bereits abgeschlossen: Commit `f0e8db6b2847d5bfc8361e8f617b8caf0c860787`, Tag `oliva-v0.7-review-continuity-private`, Quell-ZIP `/workspace/oliva-next-v0.7-review-continuity-source.zip`, 107.691.030 Byte, SHA-256 `6f2e71667fec1f02abe3d4fc1cdae5799faf0f915ca5ff408a8f8bd1831f4821`; äußeres Manifest `/workspace/oliva-v07-local-checkpoint.json`. FaithPath-Referenz: `/workspace/faithpath-reference`; alle 390 materialisierten Referenzdateien stimmen mit ihren ursprünglichen Git-Blobs überein. Vorhandene 0.7-Web-/native Kontrollausgaben und historische Belege bleiben erhalten.

Der unabhängige Vorgänger 0.6 bleibt gesichert: Commit `9b28f586574a380ef40419b02fccb68301c8287c`, Tag `oliva-v0.6-book-identities-private`, Quell-ZIP `/workspace/oliva-next-v0.6-book-identities-source.zip`; äußeres Manifest `/workspace/oliva-v06-local-checkpoint.json`. Die 0.6-Quellen und Belege unter `docs/evidence/session-06/` bleiben erhalten.

Der unabhängige Vorgänger 0.5 ist gesichert: Commit `8266d8dfa8b080603248e232787cc8853eacbf7a`, Tag `oliva-v0.5-a51-private`, ZIP `/workspace/oliva-next-v0.5-a51-source.zip`, 95.615.317 Byte, SHA-256 `efc998f8ad74d5c22165bb05ef11d2f099d804916ceea3d37b3ee3db1e67e045`. Kontroll-Webexport: `/workspace/oliva-v05-a51-control-dist`. Frühere Belege unter `docs/evidence/session-05/` bleiben unverändert erhalten.

Am **08.11.2026** wurde ausdrücklich beauftragt, **0.5,0.6,0.7 und alle folgenden Versionen wie0.4 auf GitHub zu sichern**. Ziel ist das bestätigte öffentliche Repository `akwasiacheampongma-code/Faithpath-`, jeweils im Unterordner `oliva/` auf eigenem Versionsbranch mit Versions-Tag. Diese aktuelle Anweisung ersetzt die frühere GitHub-Pushpause. Die Sicherungen **0.5, 0.6 und 0.7 sind tatsächlich hochgeladen und per Remote-Ref/Teilbaum bestätigt**; Beleg: `docs/evidence/github/backups-2026-11-08.json`. Die GitHub-Commits lauten `76ae5ec49a03cd670925a75893c67cbb228bf9d1`, `b1c3cb608047f67856e24ec7bb1f4935e27f0f5f` und `a4c266ddc33e2b8041e2f8608cfdf84292c98cb2`, Tags `oliva-v0.5.0`, `oliva-v0.6.0`, `oliva-v0.7.0`. Ablauf und vollständige Zielrefs: [docs/13-github-version-backups.md](docs/13-github-version-backups.md). `main`, der 0.4-Branch `feature/oliva-next-v02-20261106` (Quellcheckpoint `df6d2f96c2116a817ca2f63bf6bd00c97925b674`) und alle ursprünglichen FaithPath-Anwendungsdateien bleiben unverändert. Nur der eigene OLIVA-Workflow darf auf den neuen Branches Tests auswählen. Kein Merge und kein öffentliches Web-/Storedeployment; die PWA bleibt eigentümerprivat.

FaithPath-Analysebasis: `a519ce898fa33907b07d5ac7a585595127556183`, Branch `feature/simplified-step-experience-20261104`. Nur die ausdrücklich beauftragte A51-Baumvorarbeit wird übernommen; OLIVAs Navigation, Datenspeicherung und Fortschrittsregeln bleiben eigenständig.

## Tatsächlich bereitgestellter 0.8-Checkpoint

Die getrennte private Sites-Quelle liegt unter `/workspace/sites/oliva-v04-preview`. Quelle `5b3a1afcc6800b18f8f81adc54c57c883f9f6b6b`, erfolgreiches Deployment `appgdep_6af07e2c546c81919bc69b551a74e979` vom **08.11.2026, 13:50:48.918899 UTC**, Version `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_d0f98ac24a1481918c540595014685ee`. Geprüfter Kernbuild `oliva-618ddeeb77388032`, angepasstes Hostpaket `oliva-6baa9eda299dea7a`, Runtime-Digest `60ab4ab517a1bfe768b62ad76bc6ca359099f56cfaf5d09a7c1e326f0f2cbe58` über 277 Inputs.

Die tatsächliche HTTP-Prüfung bestätigt **16 App-Routen sowie 101 App- und 42 Review-Dateien bytegenau**, Manifest und Service Worker korrekt, anonym HTTP 401 ohne App-HTML. Publikum unverändert: ein Eigentümer, keine Gruppen, Editoren oder externen Betrachter. Belege: `docs/evidence/session-08/private-deployment.json`, `private-source-checkpoint.json`, `private-package-check.json`, `private-http-check.json`. Keine zusätzliche gehostete CUA-Prüfung oder physische Handyinstallation behaupten; lokale Chromium-Kerntests sind getrennt belegt.

## Historischer privater 0.7-Checkpoint

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
- Acht generierte biblische Bildmaster, 21 WebP-Varianten und fünf illustrierte Erzählpiloten im aktuellen 0.8-Quellstand, einschließlich David vor Goliath zu 1. Samuel 17,38–45. Bild, redaktionelle Einordnung und Bibeltext sind getrennt; fachliche Freigaben offen.
- PWA-Manifest, eigene Icons, vollständiges Offlinepaket, Build-ID und Vorgängercache; tatsächlicher 0.6→0.7-Updatewechsel mit RAM-Migration V5→V6 geprüft. Gespeichertes V5 bleibt bis zum expliziten Edit unverändert; danach bleiben Rückblickidentität, Entwürfe, Fortschritt, Originalblob und Rückkehrsicherung erhalten. Sieben A51-Stadien, Johannesroute/PNG und ein exklusiver Vorgängerchunk sind nach Offline-Neustart geprüft. Frühere Updatebelege bleiben erhalten.

## A51-Baum

Sieben unveränderte PNG-Master wurden im historischen Designcommit `0e02d5329a87cdcdfc52694d74c610da2975b357` gefunden. Alle Master und die 21 WebPs stimmen mit den Hashes der A51-Stadienbeschreibung überein. Originale, Prompts und Runtime-Referenz bleiben unter `art/a51/` erhalten. Herkunft: `art/a51/provenance.json`; Bericht: `docs/09-a51-integration.md`.

Web verwendet den geprüften A51-Kern hinter einem typisierten React-Adapter. Native Plattformen verwenden 98 aus den Originalmastern erzeugte PNGs in 640/1.024 Pixeln und einen separaten, nativ animierten Ebenenadapter. Gemeinsame Metadaten und der bestehende OLIVA-Index bleiben maßgeblich. Vorschau, Laden und Animation schreiben keine Nutzerdaten. Native Bewegung ist eine Annäherung an die kontinuierliche WebGL-Verformung; ihre tatsächliche Qualität, Energie und Speichergrenzen sind auf Geräten offen.

Ein echter ursprünglicher Webfehler wurde reproduziert und im OLIVA-Adapterkern behoben: Der IntersectionObserver lieferte für dieselbe Wurzel in einem Callback zuerst `false`, dann `true`. `entries[0]` hielt die Szene fälschlich unsichtbar. Jetzt zählt die letzte passende Meldung. Ein deterministischer Replay prüft beide Reihenfolgen. Die unveränderte Originalreferenz bleibt erhalten. Eine frühere Hintergrundtab-Vermutung war keine bestätigte Ursache dieses Produktfehlers.

## Tatsächliche 0.9-Abnahme

- Buchbilder für Johannes und Römer, 21 beziehungsweise 16 Kapitel, eigene Motivquellen und getrennte Lichtspur; alle 66 kompakten Vektoren bleiben erhalten. Kein neuer persönlicher Fortschritt durch Bildladen oder Navigation.
- Neue Startseitenbilder (100 × 150) für die beiden illustrierten Bücher; alle 66 Bücher erhalten einen direkten Buchschwertzugang. Der Lesezugang bleibt erhalten; schmaler Fehlerzustand besitzt echten Retry.
- Tatsächlicher erster Webbuild `oliva-6428cb5965119e02`, 101 Cachedateien. 120/120 Fachtests und 16/16 gezielte Römer-/Johannesfälle bestanden; vollständiger einzelner 76/76-Lauf ohne Skip oder Flaky erfolgreich. Belege `docs/evidence/session-09/`.
- Android-/iOS-JS-/Assetdebugexports bestanden: je 98 A51-PNGs, sechs Buch-PNGs und drei David-WebPs; portable Prüfung über `node scripts/check-native-export.mjs`. Runtime-Digest `6ec21d74a393b3ece34e1b4fe40ea441e4c8fd347543b89c16b8569e9b00b110` über 284 Inputs, nun einschließlich Römermanifest und Runtimeindex. Keine Geräte-/Simulator-/Decoder-/Energieprüfung.
- Originale Generation und technische Römer-Vorbereitung bleiben unter `art/swords/romans-grace/`; aktive Herkunft unter `romans-runtime.json` und `runtime-index.json`. Keine öffentliche Produktfreigabe.
- Paritätsabgleich aus der Planungsfrage: [aktueller Plan](docs/16-current-plan-and-parity.md). Fertiger Original-NT-Katalog (1.300 Fragen/260 Kapitel/27 Bücher) und Original-Fließtext fehlen als aktive OLIVA-Funktionen. Keine zugeordnete Version oder Termin; keine Prioritätsänderung aus der Planungsfrage ableiten. OTB hat im Bestand CC BY-SA 4.0, Erinnerungen dort sind In-App-Einladungen.

## Bestätigte Sicherung und Remote-CI 0.8

0.8 ist tatsächlich gesichert: lokaler Commit `e6aa7f5ab552bb983264c1b4cc253c72728d5740`, Tag `oliva-v0.8-stories-offline-private`; ZIP `/workspace/oliva-next-v0.8-stories-offline-source.zip`, 120.935.687 Byte, SHA-256 `82c564902e453b638a84c6487098abe769fb828094c8bdb1c4b772b81cde40ca`. Äußeres Manifest `/workspace/oliva-v08-local-checkpoint.json`, Kontrollbuild `/workspace/oliva-v08-stories-control-dist`.

GitHub-Commit `dc4477b01dcd78f278e5dbf82408b26c83837ec1`, Branch `feature/oliva-v08-stories-offline-20261108`, Tag `oliva-v0.8.0`; alle acht Versionsrefs sowie ursprüngliche FaithPath-Pfade, `main` und alter 0.4-Branch unverändert bestätigt. Dauerhafter Checkpoint unter `docs/evidence/session-09/checkpoints/`.

Der tatsächliche GitHub-Lauf **42487317354** ist erfolgreich: 117/117 Fachtests und 67/67 Browserfälle, keine Skips/Flaky-Fälle. Artefakt 13620585577 mit 8.179.373 Byte, SHA-256 `a5739f6dde394f463fa179c19480e3d83053fa1024b12100d430fa670ff28248`, stimmt mit GitHub überein. Audit 0; die vier eigenen Node-24-Actionpins sind im Log bestätigt. Rohbelege: `docs/evidence/github/ci-v08/verification.json` und zugehörige Reports. Diese Ergebnisse gelten für 0.8, nicht für die laufende 0.9-Quelle.

## Historische 0.8-Abnahme und anschließende Quellensicherung

- David ist tatsächlich in der Runtime integriert: **Bibel → Eine Geschichte entdecken → Davids Vorbereitung lesen**. Exakter Abschnitt 1. Samuel 17,38–45; KI-unterstützte Einordnung, Worterklärung und künstlerische Interpretation bleiben vom Originalbibeltext getrennt. Keine Sieg- oder Selbstoptimierungszusage aus dem abgeschnittenen Erzählverlauf.
- Gemeinsamer Storyrenderer mit gemessenem Bildrahmen, passenden 640/1024/1280-WebPs, echter Decode-Bestätigung, drei endlichen Fallbackvarianten, erreichbarem Retry und unverändertem Leselink. Bibliotheksbilder verwenden 8:5 statt fester 180-Pixel-Höhe; Readerkontext 3:2. Keine Fortschritts-/Nutzdatenänderung durch Bilder.
- Offline-Prüfung wiederholt ausgebliebene Workerantworten begrenzt, räumt Ports/Timer/Listener auf und endet ehrlich bei unvollständiger Bestätigung. Verzögerte Antworten dürfen neuere Prüfungen nicht überschreiben. **Tatsächlicher 0.8-Produktfehler gefunden und korrigiert:** Ein ausstehendes `navigator.serviceWorker.register()` blockierte jede Prüfung eines bereits verfügbaren Controllers. Jetzt beginnt die echte Controllerprüfung vor dem Warten auf Registrierung; fehlender Controller führt weiter nur zu endlichen Versuchen, Registrierungsfehler entwertet keinen nachweislich passenden Controller. Diagnose `docs/evidence/session-08/diagnostics/register-gate-diagnosis.json`/`.md`: sichtbares fokussiertes Dokument, frühere Aktivierungsmeldung vor dem Effekt, Registerpromise über 38,8 Sekunden ausstehend; zwei unabhängige Proben bestätigen später aktivierten Controller/Worker und alle 98 Cachedateien. Der Browsergrund für den Registrierungsstillstand ist ungeklärt. Keine Behauptung derselben Ursache für 0.5-CI oder gehostete/physische Geräte.
- **117/117 Fach-/Persistenztests, Typecheck, Webbuild und ein einzelner vollständiger 67/67-Browserlauf erfolgreich**, ohne übersprungene oder Flaky-Fälle. Aktueller Kernbuild `oliva-618ddeeb77388032`; Runtime-Digest `60ab4ab517a1bfe768b62ad76bc6ca359099f56cfaf5d09a7c1e326f0f2cbe58` über 277 Inputs.
- Beide nativen JavaScript-/Assetdebugexports erfolgreich: je alle 98 A51-PNGs, drei Johannes-PNGs und drei David-WebPs bytegenau. Keine Master-/Prompt-/WebGL-Auslieferung. Keine Simulator-, Geräte-, Decoder-, Installations- oder Akkutests. Beleg `docs/evidence/session-08/native-builds.json`.
- **Echter 0.7→0.8-Workerwechsel bestanden:** V6 und privates Dokument V1 bleiben unverändert, keine Migration. Alle rohen IndexedDB-Datensätze einschließlich Originalarchiv und Rückkehrsicherung bleiben exakt. Fünf Storybilder einschließlich David beim ersten Offlinebesuch und nach Reload, sieben A51-Stadien, Johannesroute/PNG und exklusiver Vorgängerchunk funktionieren offline. Beleg `docs/evidence/session-08/offline-upgrade.json`.
- Gezielte gekoppelte Buildtool-Overrides `glob@14.0.4` und `minimatch@11.0.5` sind übernommen; aktuelles `npm ci` und Audit mit **0 Funden** erfolgreich. Außerhalb offizieller Expo-58-Ranges; isolierte Probe am eingefrorenen 0.7-Input separat dokumentiert, keine 0.8-Abnahme daraus ableiten. [Entscheidung](docs/14-dependency-security.md).
- **9/9 gezielte A51-/Offline-Browserfälle am finalen Kandidaten bestanden**, Bericht `docs/evidence/session-08/registration-fixed-targeted.json`; danach **ein einzelner vollständiger 67/67-Lauf** in `e2e-results.json`. Frühere Berichte bleiben erhalten: `e2e-before-navigation-sync.json` (**65/66**) betrifft eine zu frühe URL-Messung im David-Test, `e2e-before-visibility-diagnosis.json` (**65/66**) den tatsächlichen Registrierungs-Gatefehler, `e2e-before-transient-state-sync.json` (**66/67**) eine unnötig geforderte flüchtige Zwischenanzeige, obwohl eine zweite echte Prüfung bereits Bereitschaft bestätigte. Der letzte Test wartet jetzt auf tatsächlich zugestellte verzögerte Antwort und prüft weiter korrekte Bereitschaft; kein Produktcode wurde dafür geändert. Rohberichte und Diagnose bleiben erhalten; Zusammenfassung `docs/evidence/session-08/validation-summary.json`.
- Frühere native-/Updatebelege zu `oliva-56f6fe3a12f05a5c` stehen getrennt unter `before-registration-fix/`; aktuelle Berichte gehören zu `oliva-618ddeeb77388032`. Alle Werte müssen zum tatsächlich geprüften Build passen.
- **Private 0.8-Bereitstellung samt HTTP-Abgleich abgeschlossen.** Der unabhängige Quellcheckpoint wird nach dieser Abnahme separat gesichert: Tag `oliva-v0.8-stories-offline-private`, ZIP `/workspace/oliva-next-v0.8-stories-offline-source.zip`, äußeres Commit-/SHA-256-Manifest `/workspace/oliva-v08-local-checkpoint.json`. Geplant sind GitHub-Branch `feature/oliva-v08-stories-offline-20261108` und Tag `oliva-v0.8.0`. **Upload, Remote-Ref-/Teilbaumabgleich und tatsächlicher CI-Lauf sind bei diesem Dokumentstand noch nicht bestätigt**; Ergebnis im äußeren `/workspace/oliva-github-backups.json` und im nächsten Lieferstand aufnehmen, keine Commit-/ZIP-SHA vorwegnehmen. [0.8-Vertrag](docs/15-stories-and-offline-v08.md).

## Bestätigte GitHub-Abnahme 0.5 bis 0.7

Die tatsächlichen Remote-Läufe wurden mit den Versionscommits und Artefaktdigests abgeglichen: **0.5: 72/72 Fachtests, 43/45 Browserfälle, zwei Fehler; 0.6: 75/75 und 52/52 grün; 0.7: 116/116 und 59/59 grün**. Läufe `42461436132`, `42461438369`, `42461122842`. Die Ursache der beiden 0.5-Fehler ist durch den Remote-Lauf nicht vollständig bestimmt; unveränderte historische Tags nicht nachträglich als grün ausgeben. Berichte: `docs/evidence/github/CI-REPORT-2026-11-08.md`, `ci-verification-2026-11-08.json`.

## Historische lokale Abnahme 0.7

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

Prüfungen: `npm run content:check`, `npm run content:art`, `npm run content:tree`, `npm run content:swords`, `npm run typecheck`, `npm test`, `npm run test:e2e`. Aktueller Updateversuch: `node scripts/offline-upgrade-v08.mjs /absoluter/pfad/zum/0.7/dist dist`. Ältere Update-Skripte bleiben ihren historischen Exporten zugeordnet. Neue Playwright-Ergebnisse liegen seit 0.8 standardmäßig unter `docs/evidence/latest/`; abgeschlossene Sessions gezielt separat sichern, damit historische Belege erhalten bleiben.

## Nächste überprüfbare Arbeit am ursprünglichen Master

1. Abgenommenen 0.9-Quellstand separat committen/taggen, ZIP samt SHA-256 und äußerem Manifest erzeugen. Danach eigener GitHub-Versionsbranch/Tag unter `oliva/`, exakten Teilbaum und geschützte Ursprungsrefs zurücklesen; tatsächlichen CI-Lauf separat abnehmen. Keine erneute Abnahme des bereits bestandenen lokalen 120/76-Standes ohne neue Änderung/Fehler.
2. Anschließend bestehende Master-Aufgaben weiterbearbeiten: Bestandsparität, weitere Buchbilder, freiwillige Erinnerungen und Kapitelredaktion. Bestätigte Fließtext-/NT-Lücken bleiben offen und werden nicht durch bloßes Benennen als fertig behandelt. Der Planungsabgleich hat keine neue Folgeversion und keinen Termin erfunden: `docs/16-current-plan-and-parity.md`.
3. Echte Anfänger-/Geräteabnahme, unabhängige Inhaltsprüfung und reale Dienste fehlen weiter. Auth/Sync, Live-KI und Audio sind nicht aktiv. Keine Personenexporte im Repository/Logs. Unabhängige FaithPath-Referenz, historische Quellstände und Kontrollbuilds bewahren.

## Bleibende Grenzen und Vorgaben

FaithPath-Quelle bis 10 MiB UTF-8, vollständiges Backup bis 64 MiB. Erste Archivladung/Export sind speicherintensiv und nicht auf schwachen Geräten vermessen. Eine Rückkehrsicherung; nächster Import ersetzt sie, erfolgreiche Rückkehr verbraucht sie. Daten und Exporte sind unverschlüsselt. Auth/Sync, Live-KI und Audio sind nicht angeschlossen. Öffentliche Inhalts-/Rechtefreigaben, Store-Signing und echte Geräteprüfungen bleiben offen.

A51-Wiederverwendung ist ausdrücklich vom Projektauftrag autorisiert; eine allgemeine Weiterveröffentlichungslizenz wurde nicht festgestellt. Übernommener A51-Code und A51-Bilder sind von der OLIVA-MIT-Lizenz ausgenommen. Die GitHub-Quellensicherung ist seit08.11 ausdrücklich beauftragt; eine öffentliche Web-/Storebereitstellung bleibt ohne gesonderte Freigabe untersagt. Die Lizenz-/Fachprüfungen werden dadurch nicht ersetzt.

Diese Datei ist der dauerhafte Fortsetzungsstand. Nach Wiederaufnahme Lieferstand und Tests lesen, erreichte Arbeit bewahren und am nächsten Teilziel weiterarbeiten. Kein ausgeführtes UI-`/resume` und keine selbstständig im Hintergrund laufende Entwicklung behaupten. Die Gesamt-Definition-of-Done bleibt offen.

GitHub-Nachsicherung **0.5/0.6/0.7 abgeschlossen**: Ergebnis-/Remoteprüfung unter `/workspace/oliva-github-backups.json`, dauerhaft kopiert nach `docs/evidence/github/backups-2026-11-08.json`. Vorbereitungsplan `/workspace/oliva-github-backup-plan.json`; lokaler Helper `/tmp/prepare-oliva-history.py`. Für folgende Versionen diesen Ablauf erweitern, historische Workflowblobs/Refs nicht rückwirkend verändern und stets den exakten `oliva/`-Teilbaum sowie alle ursprünglichen FaithPath-Pfade prüfen. Ausschließlich explizite Versionsrefs pushen; keine Standalone-Tags direkt ins FaithPath-Repo und kein pauschales `--tags`.

## Bestätigte private Bereitstellung 0.9 und nächster Quellcheckpoint

Erfolgreich am **08.11.2026, 19:49:19.769698 UTC**:

| Kennung | Wert |
| --- | --- |
| Private Quelle | `ccf9bbee496b64779583fd39101a59f2f30761b9` |
| Deployment | `appgdep_6af0d232484c8191a6bc975b8d3ac093` |
| Version | `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_f013bcf30d348191b11c9dda4ff0ac20` |
| Kernbuild | `oliva-6428cb5965119e02` |
| Hostpaket | `oliva-d355762061b4fbe6` |
| Runtime-Digest | `6ec21d74a393b3ece34e1b4fe40ea441e4c8fd347543b89c16b8569e9b00b110` · 284 Inputs |

HTTP: **17 Routen, 104 App- und 42 Review-Dateien bytegenau**, anonym 401, weiterhin nur Eigentümerzugriff. Belege unter `docs/evidence/session-09/`. Keine zusätzliche gehostete CUA- oder Handyprüfung.

Unmittelbar folgender Sicherungsschritt: lokaler Tag `oliva-v0.9-book-gallery-private`, ZIP `/workspace/oliva-next-v0.9-book-gallery-source.zip`, äußeres Manifest `/workspace/oliva-v09-local-checkpoint.json`; GitHub-Branch `feature/oliva-v09-book-gallery-20261108`, Tag `oliva-v0.9.0`. Erst nach tatsächlichem Push und Remote-Abgleich als gesichert melden und im nächsten Arbeitsstand festhalten. Der 0.9-Remote-CI-Lauf ist noch nicht ausgeführt; die lokalen 120/76 sind dafür kein Nachweis.
