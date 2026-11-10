# Fortsetzen · OLIVA / FaithPath Next Generation

Stand: 10.11.2026. **OLIVA 0.12.0 mit vollständigem Original-NT-Katalog ist seit 10.11.2026, 03:51:05 UTC eigentümerprivat bereitgestellt.** **225/225 Fachtests und ein einzelner vollständiger 108/108-Browserlauf bestanden**, ohne Skips, instabile Fälle oder Wiederholungen. Beide nativen JS-/Assetexporte und der reale 0.11→0.12-PWA-Wechsel bestehen. AppData/Backup ist V8; V1–V7 bleiben strikt lesbar und bis zur ausdrücklichen Aktion als Rohdaten unverändert. Privates Dokument V1, SQLite 3 und IndexedDB 1 bleiben erhalten. Der persönliche Lesefortschritt und Baum werden durch NT-Verwaltung nicht verändert. Die Gesamt-Definition-of-Done bleibt offen.

Der eigenständige 0.12-Quellcheckpoint mit Tag, ZIP und SHA-256 sowie die beauftragte GitHub-Sicherung folgen nach diesem Dokumentcheckpoint. Deren noch nicht bestätigte Kennungen werden nicht vorweggenommen; die tatsächliche neue Remote-CI wird separat geprüft. Die Quellenstände bis 0.11 sind tatsächlich gesichert. Die historischen roten 0.11-CI-Läufe bleiben unverändert; lokale 0.12-Erfolge ersetzen keinen neuen Remote-CI-Nachweis.

## Sofort ausprobieren

- Private App: https://oliva-v04-private-preview.purplebean128.chatgpt.site
- Mit dem berechtigten ChatGPT-Eigentümerkonto anmelden. Die URL enthält weiterhin `v04`; seit **10.11.2026, 03:51:05 UTC** wird dort **0.12.0** ausgeliefert.
- **Neu: Bibel → Fragen zum Neuen Testament** oder direkt `/verstehen`. Alle 27 Bücher und 260 Kapitel sind enthalten; `/verstehen/MRK?chapter=4` startet mit Markus 4. Erst **Antwort prüfen** speichert. In bestehenden Importarchiven können belegte frühere Abschlüsse ausdrücklich aktiviert werden.
- **Bibel → Buch/Kapitel:** Fließtext ist voreingestellt. **Lesefokus starten** blendet Begleitinformationen aus; der Ausstieg bleibt erreichbar. **Leseeinstellungen → Einzelverse** bewahrt die alte Darstellung. Versaktionen/Notizen bleiben erhalten; kein neuer Fortschritt durch die Darstellung.
- **Einstellungen → Gedanken wiederbegegnen → Einladungen in der App erlauben** oder direkt `/einladungen`: zunächst aus; ältere Vorhaben/Gedanken freiwillig ansehen, zurückstellen, ausblenden oder wieder zulassen. Keine Benachrichtigungsberechtigung, kein Wachstum durch Steuerung.
- **Bibel → Eine Geschichte entdecken → Davids Vorbereitung lesen:** neue Illustration und exakter Abschnitt 1. Samuel 17,38–45 mit getrennter Einordnung.
- **Wege → Persönliche Vorhaben → eigener Rückblick:** Text bearbeiten, den gesicherten Entwurf über Sammlung fortsetzen, bestätigt löschen und innerhalb derselben geöffneten Ansicht einmal zurückholen. Identität, damalige Quelle und Erfahrungsbestätigung bleiben beim Edit erhalten; daraus entsteht kein neues Wachstum.
- Der A51-Baum steht auf **Heute** und **Mein Garten**; **„Alle sieben Lebensbilder ansehen“** öffnet die Galerie. Privater Vergleich: https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg
- **Bibel → Römer → „Buchschwert ansehen“** öffnet das Schwert der Gnade. Nach bewusstem Öffnen eines Römer-Leseabschnitts zeigt auch die Startseite das aktuelle Buchbild; daraus entsteht kein bestätigtes Lesen. Direkt: https://oliva-v04-private-preview.purplebean128.chatgpt.site/buch/ROM
- **Bibel → Johannes → „Buchschwert ansehen“** oder **Sammlung → Buchschwerter** öffnet Illustration, Kapitellichtspur und Quellen. Alle 66 kompakten Vektoren bleiben erhalten.
- Eigentümerzugriff unverändert: keine Änderung des Publikums, keine öffentliche Web-Veröffentlichung. Anonyme HTTP-Anfrage: 401, kein App-HTML.

## Arbeitsbereiche und Quellschutz

Unabhängige OLIVA-Quelle: `/workspace/faithpath-next`. Aktiver lokaler Gitbranch: `feature/oliva-v012-nt-study-20261109`, ohne Remote. Der unabhängige 0.7-Checkpoint ist bereits abgeschlossen: Commit `f0e8db6b2847d5bfc8361e8f617b8caf0c860787`, Tag `oliva-v0.7-review-continuity-private`, Quell-ZIP `/workspace/oliva-next-v0.7-review-continuity-source.zip`, 107.691.030 Byte, SHA-256 `6f2e71667fec1f02abe3d4fc1cdae5799faf0f915ca5ff408a8f8bd1831f4821`; äußeres Manifest `/workspace/oliva-v07-local-checkpoint.json`. FaithPath-Referenz: `/workspace/faithpath-reference`; alle 390 materialisierten Referenzdateien stimmen mit ihren ursprünglichen Git-Blobs überein. Vorhandene 0.7-Web-/native Kontrollausgaben und historische Belege bleiben erhalten.

Der unabhängige Vorgänger 0.6 bleibt gesichert: Commit `9b28f586574a380ef40419b02fccb68301c8287c`, Tag `oliva-v0.6-book-identities-private`, Quell-ZIP `/workspace/oliva-next-v0.6-book-identities-source.zip`; äußeres Manifest `/workspace/oliva-v06-local-checkpoint.json`. Die 0.6-Quellen und Belege unter `docs/evidence/session-06/` bleiben erhalten.

Der unabhängige Vorgänger 0.5 ist gesichert: Commit `8266d8dfa8b080603248e232787cc8853eacbf7a`, Tag `oliva-v0.5-a51-private`, ZIP `/workspace/oliva-next-v0.5-a51-source.zip`, 95.615.317 Byte, SHA-256 `efc998f8ad74d5c22165bb05ef11d2f099d804916ceea3d37b3ee3db1e67e045`. Kontroll-Webexport: `/workspace/oliva-v05-a51-control-dist`. Frühere Belege unter `docs/evidence/session-05/` bleiben unverändert erhalten.

Am **08.11.2026** wurde ausdrücklich beauftragt, **0.5,0.6,0.7 und alle folgenden Versionen wie0.4 auf GitHub zu sichern**. Ziel ist das bestätigte öffentliche Repository `akwasiacheampongma-code/Faithpath-`, jeweils im Unterordner `oliva/` auf eigenem Versionsbranch mit Versions-Tag. Diese aktuelle Anweisung ersetzt die frühere GitHub-Pushpause. Die Sicherungen **0.5, 0.6 und 0.7 sind tatsächlich hochgeladen und per Remote-Ref/Teilbaum bestätigt**; Beleg: `docs/evidence/github/backups-2026-11-08.json`. Die GitHub-Commits lauten `76ae5ec49a03cd670925a75893c67cbb228bf9d1`, `b1c3cb608047f67856e24ec7bb1f4935e27f0f5f` und `a4c266ddc33e2b8041e2f8608cfdf84292c98cb2`, Tags `oliva-v0.5.0`, `oliva-v0.6.0`, `oliva-v0.7.0`. Ablauf und vollständige Zielrefs: [docs/13-github-version-backups.md](docs/13-github-version-backups.md). `main`, der 0.4-Branch `feature/oliva-next-v02-20261106` (Quellcheckpoint `df6d2f96c2116a817ca2f63bf6bd00c97925b674`) und alle ursprünglichen FaithPath-Anwendungsdateien bleiben unverändert. Nur der eigene OLIVA-Workflow darf auf den neuen Branches Tests auswählen. Kein Merge und kein öffentliches Web-/Storedeployment; die PWA bleibt eigentümerprivat.

FaithPath-Analysebasis: `a519ce898fa33907b07d5ac7a585595127556183`, Branch `feature/simplified-step-experience-20261104`. Die A51-Baumvorarbeit wird ausdrücklich übernommen, weitere Bestandsfunktionen werden anhand der Paritätsmatrix angepasst; OLIVAs Navigation, Datenspeicherung und Fortschrittsregeln bleiben eigenständig.

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

Prüfungen: `npm run content:check`, `npm run content:nt`, `npm run content:art`, `npm run content:tree`, `npm run content:swords`, `npm run typecheck`, `npm test`, `npm run test:e2e`. Aktueller Updateversuch: `node scripts/offline-upgrade-nt.mjs /absoluter/pfad/zum/0.11/dist dist`. Ältere Update-Skripte bleiben ihren historischen Exporten zugeordnet. Neue Playwright-Ergebnisse liegen seit 0.8 standardmäßig unter `docs/evidence/latest/`; abgeschlossene Sessions gezielt separat sichern, damit historische Belege erhalten bleiben.

## Abgenommene NT-Integration und nächster überprüfbarer Schritt

1. **0.11 ist gesichert:** Standalone `d419ae7c0fa84ce49d600a0c2db7e9a0f2630279`, Tag `oliva-v0.11-reader-flow-private`; GitHub `5e093ee3d35560e5d902ac6d743341ab16126fe2`, Branch `feature/oliva-v011-reader-flow-20261109`, Tag `oliva-v0.11.0`. Alle 14 Versionsrefs und ursprünglichen FaithPath-Pfade geprüft, `main`/0.4 unverändert. Checkpoints: `docs/evidence/nt-catalog/checkpoints/`.
2. **Remote-CI ehrlich getrennt:** ursprünglicher Lauf `42586789188` endet rot: 168/168 Fachtests, 91/92 Browserfälle. Der David-Test las einen nicht verfügbaren Geometrierahmen aus. Seine genaue CI-Rennbedingung wurde nicht reproduziert. Ein echter Netzwerkgate-Test belegt Ziel-URL vor Reader-Bereitschaft. Test-only-Commit `8869314` wartet auf Readerroute, Tiefenmodus, Bilddekodierung und positive Geometrie; 2/2 gezielte lokale Fälle bestanden. Der unveränderte 0.11-Runtimeinput-Digest ist bestätigt. Separater GitHub-Prüfzweig `feature/oliva-v011-ci-geometry-20261109`, Commit `20493b077d827c6875f276d0e36bf7fb0e9fce41`, tatsächlicher Lauf `42629068592` ist ebenfalls rot: 168/168 Fachtests und 92/93 Browserfälle, beide Davidfälle grün. Der neue A51-Fehler zeigt fehlenden Controller trotz passender aktiver Registrierung und vollständigem Cache. Eine unabhängige echte Force-Reload-Probe reproduziert die Produktlücke bei ausstehender `register()`-Rückgabe; der konkrete CI-Trigger ist nicht bewiesen. Rohbelege: `docs/evidence/github/ci-v011-geometry/` und `docs/evidence/nt-catalog/offline-ci-diagnosis/`. Kein Tag, kein Deployment und keine historische Umfärbung.
3. **Der Original-NT-Katalog ist seit 0.12 aktiv und privat bereitgestellt:** alle 27 Bücher, 260 Kapitel, 1.300 Fragen und 1.304 Referenzbereiche wurden unverändert übernommen. V8 trennt neue Antworten, Position und belegte historische Abschlüsse. Der Originalvertrag bleibt in `docs/22-original-nt-progress-contract.md` dokumentiert.
4. 225/225 Fachtests und ein einzelner vollständiger 108/108-Browserlauf bestehen. Beide nativen JS-/Assetexporte enthalten den vollständigen Katalog statisch feldgleich. Der reale 0.11→0.12-Wechsel bewahrt alle vier Rohrecords bis zur ausdrücklichen Aktion; nach NT-Commits bleiben alle drei Nicht-main-Records erhalten. Private Bereitstellung, HTTP- und Zugangsnachweise liegen unter `docs/evidence/nt-catalog/`.
5. Den separaten 0.12-Quellcheckpoint mit Tag/ZIP/Hash erstellen, danach die beauftragte GitHub-Versionssicherung und tatsächliche Remote-CI prüfen. Anschließend verbleibende Readerparität anhand der Quellvorbereitung umsetzen: Mehrversauswahl, Kopieren, Vollkapitelkontext. Weitere Bilder, Bestandsinhalte und Fachredaktion sowie reale Dienste bleiben Masteraufgaben; keine Termine oder Folgeversionen erfinden.

## Bleibende Grenzen und Vorgaben

FaithPath-Quelle bis 10 MiB UTF-8, vollständiges Backup bis 64 MiB. Erste Archivladung/Export sind speicherintensiv und nicht auf schwachen Geräten vermessen. Eine Rückkehrsicherung; nächster Import ersetzt sie, erfolgreiche Rückkehr verbraucht sie. Daten und Exporte sind unverschlüsselt. Auth/Sync, Live-KI und Audio sind nicht angeschlossen. Öffentliche Inhalts-/Rechtefreigaben, Store-Signing und echte Geräteprüfungen bleiben offen.

A51-Wiederverwendung ist ausdrücklich vom Projektauftrag autorisiert; eine allgemeine Weiterveröffentlichungslizenz wurde nicht festgestellt. Übernommener A51-Code und A51-Bilder sind von der OLIVA-MIT-Lizenz ausgenommen. Die GitHub-Quellensicherung ist seit 08.11 ausdrücklich beauftragt; eine öffentliche Web-/Storebereitstellung bleibt ohne gesonderte Freigabe untersagt. Die Lizenz-/Fachprüfungen werden dadurch nicht ersetzt.

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

Die 0.9-Quellensicherung ist tatsächlich abgeschlossen: lokaler Commit `0f4cf3df79dee8d572427cd17db70d98101980ec`, Tag `oliva-v0.9-book-gallery-private`, ZIP `/workspace/oliva-next-v0.9-book-gallery-source.zip` (133.979.517 Byte, SHA-256 `2f01f3af16c189ee58fa5bdfd4fe08aebd2accb5c691ee7df2094ffa6ce4a1fb`). Manifest und GitHub-Nachweis unter `docs/evidence/invitations/checkpoints/`.

GitHub-Commit `29e082d0254ccc6754bacebfcc65a6fd09639c17`, Branch `feature/oliva-v09-book-gallery-20261108`, Tag `oliva-v0.9.0`. Alle zehn Versionsrefs sowie `main`, 0.4-Branch und ursprüngliche FaithPath-Pfade sind bestätigt. Tatsächlicher GitHub-Lauf **42517524350** endete am 08.11. um **20:05:09 UTC** erfolgreich: **120/120 Fachtests, 76/76 Browserfälle**, keine Skips/Flaky/Wiederholungen. Artefakt `13631949152`, 8.872.878 Byte, SHA-256 `4b45627dff92d01e5e12d0fa9f6638ddaffc136a82f40ed8c789dbe2763eada4`; Digest stimmt mit GitHub überein. Audit 0, vier eigene Node-24-Pins bestätigt. Rohbelege `docs/evidence/github/ci-v09/`. Historische Tags und Berichte bleiben unverändert.

## Tatsächliche 0.10-Abnahme und private Bereitstellung

- Kern `oliva-12c38c9b1a132bff`, Hostpaket `oliva-51c1fd6137de7f0c`; Runtime-Digest `8e5cb71045313213335428f7ab356b0abbfd03b489bd97c773ce3746f73cefd6` über 291 Inputs. 154 Fachtests und 82 Browserfälle in einem vollständigen grünen Lauf, keine Skip-/Flaky-/Wiederholungsfälle. Rohbelege `docs/evidence/invitations/`.
- Echter 0.9→0.10-Workerwechsel: V6-Rohdaten vor Opt-in exakt; erster Opt-in-Commit ändert nur Version/Revision/Kontrollen. Alle 18 weiteren V6-Felder, Originalarchiv und Rückkehrsicherung bleiben erhalten; offene Journal-/Revieweditentwürfe funktionieren offline.
- Android/iOS jeweils erfolgreich als unminimierte JS-/Assetexports, je 98 A51-PNGs, sechs Buch-PNGs und drei David-WebPs bytegenau. Vorherige 0.9-Exporte unter `/workspace/oliva-native-v09-before-v010/` bewahrt. Keine native Geräte-/Simulator-/Decoder-/Energieprüfung.
- Private Sites-Quelle `b691ba4cf5ef285b97714e0b8b738996e69672e1`; Deployment `appgdep_6af0dc11b9ec8191a2432f5503c5d811`, Version `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_385d0d6650a08191ab9269d246ab5e80`, erfolgreich 08.11.2026, 20:31:27.880821 UTC. 18 Routen, 105 App-Dateien geprüft (104 Hashvergleiche, HTML-Shell separat), 42 Review-Dateien bytegenau. Anonym 401, Zugriffspolitik exakt unverändert: ein Eigentümer, keine weiteren Betrachter.
- Anschließende 0.10-Sicherung und Remote-CI sind vollständig abgeschlossen; exakte Kennungen stehen im folgenden bestätigten Abschnitt. Historische Tags bleiben unverändert.

## Bestätigte Quellensicherung und Remote-CI 0.10

Lokaler Commit `643a066179d80d578c6eb46e5e40e456e8c17e91`, Baum `4293fe817ed95cae3486d1f5400cb732345545d4`, Tag `oliva-v0.10-invitations-private`. ZIP `/workspace/oliva-next-v0.10-invitations-source.zip`, 143.566.498 Byte, 1.507 CRC-geprüfte Einträge, SHA-256 `43bc7e37140ee83dbfed3521c1a794e06cf179d03932ed5ea38ad9f216b6dd53`. Kontroll-Webexport `/workspace/oliva-v010-invitations-control-dist`. Manifest-/Remotekopien unter `docs/evidence/reader-flow/checkpoints/`.

GitHub-Commit `adcb582842fb31252b844d2949c7fb67fbf4668d`, Branch `feature/oliva-v010-invitations-20261108`, Tag `oliva-v0.10.0`. Alle zwölf Versionsrefs und exakter `oliva/`-Teilbaum bestätigt; `main`, 0.4-Branch und ursprüngliche FaithPath-Pfade unverändert.

Tatsächlicher Push-CI-Lauf **42520979658**, Versuch 1, endete **08.11.2026 um 20:45:13 UTC** erfolgreich: **154/154 Fachtests und 82/82 Browserfälle**, keine Skips/Flaky/Wiederholungen. Artefakt `13634195056`, 9.046.438 Byte, SHA-256 `6f00138548c2fed8f2573ee4bad1f28e6f8144edd7f4b048e6aaf5594437e74b`, entspricht GitHub. Audit 0, vier Node-24-Pins tatsächlich beobachtet. Rohbelege `docs/evidence/github/ci-v010/`. Der dortige Webbuild ist ein eigener GitHub-Export; keine Bytegleichheit mit lokalem PWA-Kern behaupten.

## Tatsächliche 0.11-Abnahme und private Bereitstellung

- Kern `oliva-01c4b9f640bc0931`, Hostpaket `oliva-6fe6a58c87610ef5`; Runtime-Digest `5f0789aef525e68db2b4b841c2fa4bf1f9f74283fae6a3ed055d5eea2e2eb134` über 300 Inputs. 168 Fachtests und 92 Browserfälle in einem einzelnen grünen Lauf. Quellen im finalen Inputscope bytegleich zu beiden nativen Exporten.
- Echter 0.10→0.11-PWA-Wechsel: alle vier V7-Rohrecords einschließlich Archiv/Recovery exakt. Der alte Block-Leseanker PSA119/Vers120 wird erstmals offline ohne Versparameter zum Fließtext restauriert; Fokus und Neustart bewahren Daten und beide Entwürfe. Sieben A51-Stadien, John/Römer, fünf Storybilder und exklusiver Altcachechunk erfolgreich offline geprüft.
- Android/iOS als unminimierte JS-/Assetexports erfolgreich; je 98 A51-/sechs Buch-PNGs und drei David-WebPs bytegenau. Keine native Textlayout-, Geräte-/Simulator-/Decoder-/Energieprüfung. Vorgängerexports unter `/workspace/oliva-native-v010-before-v011/` erhalten.
- Private Sites-Quelle `505da81aa36216c080158a617fc963ebf7d7dd5c`; Deployment `appgdep_6af1823698f08191b7fd4d34012c9ca4`, Version `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_e4e4314cb4608191b4c29e8347e5abec`, erfolgreich **09.11.2026, 08:20:19.090692 UTC**. HTTP: 20 Routen, 105 App-Dateien (104 Hashvergleiche und HTML-Shell), 42 Review-Dateien bytegenau; anonym 401, Zugriffspolitik exakt unverändert.
- 0.11-Quelltag, ZIP und GitHub-Sicherung wurden anschließend abgeschlossen; die Kennungen stehen im Abschnitt zur laufenden NT-Integration. Prüfnachweise: `docs/evidence/reader-flow/`, fachlicher Bericht: `docs/21-reader-flow-and-focus.md`. Die dortigen älteren gezielten Arbeitsbuilds mit Paketversion 0.10 sind nicht der unveränderliche 0.10-Release; der finale 0.11-Gesamtlauf ist separat belegt.

## Bestätigte lokale Abnahme und private Bereitstellung 0.12

**225/225 Fachtests und ein einzelner vollständiger 108/108-Browserlauf bestanden**, ohne Skips, instabile Fälle oder Wiederholungen. Kern `oliva-80005b3c1d2e2eef`, Hostpaket `oliva-168499f23f74e16c`; Runtime-Digest `00acc78da7d6268326b68fce0906ffa67d32c337240efbd8f59490e8d839590a` über 313 Inputs. Zehn gezielte NT-/Rückkehrfälle und zwei gezielte Offlinefälle bestehen zusätzlich. Der alte 107/108-Gesamtlauf bleibt mit Fehlerkontext erhalten; nur die veraltete Import-Testerwartung wurde angepasst, die Runtime blieb unverändert.

Der echte 0.11→0.12-PWA-Wechsel ist bestanden. Vier V7-Rohwerte bleiben bis zur ausdrücklichen NT-Antwort exakt; der erste Commit ändert nur Version, Revision und `ntStudy`. Originalarchiv, Rückkehrdaten, Einladungen, zwei Entwürfe und alter Versanker bleiben erhalten. Ein V8-Export und seine Wiederherstellungsvorschau wurden geprüft, keine Wiederherstellung angewendet. Beide nativen Exporte enthalten alle 1.300 Fragen statisch feldgleich. Native Nachweise betreffen JavaScript und Assetbytes einschließlich des vollständigen statischen Katalogabgleichs. Geräte-, Simulator-, Decoder-, Screenreader-, Energie-, Speicher- und signierte Installationstests sind damit nicht durchgeführt.

Der erste Hostingversuch lieferte für einen Expo-Router-PNG-Pfad eine HTML-Shell statt des Bildes. Dieser HTTP-Fehler und das erste Paket bleiben unter `before-vendor-host-fix/` erhalten. Ausschließlich das Hostingpaket wurde auf den vorhandenen Vendor-Alias samt URI-Umschreibung angepasst; der Produktkern blieb unverändert. Der anschließende vollständige HTTP-Abgleich ist der hier genannte Erfolgsnachweis.

Private Sites-Quelle `597abd802820fece4bac4601ed5fa0a57134c983`, Deployment `appgdep_6af2949d0910819196b799ea5b20de94`, gespeicherte Version `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_a32bfb3b4bfc819189fb1bd1696f6866`, erfolgreich **10.11.2026, 03:51:05 UTC**. HTTP: 24 App-Routen und 107 App-Dateien geprüft (106 Hashvergleiche, Index-HTML separat als App-Shell); 42 Review-Dateien bytegenau; anonym 401, exakt unveränderte Eigentümerpolitik. Nachweise: `docs/evidence/nt-catalog/private-deployment.json`, `private-http-check.json`, `private-access-policy.json` und `validation-summary.json`.

Der eigenständige 0.12-Quellcheckpoint mit Tag, ZIP und SHA-256 sowie die beauftragte GitHub-Sicherung folgen nach diesem Dokumentcheckpoint. Deren noch nicht bestätigte Kennungen werden nicht vorweggenommen; die tatsächliche neue Remote-CI wird separat geprüft. Danach die nächste konkrete Masterarbeit beginnen: [Vorbereitung der nächsten Readerarbeit](docs/evidence/reader-parity-preparation/reader-parity-preparation.md). Der übrige Master bleibt offen.

Am 09.11.2026 war zwischen 14 und 19 UTC die Agentquote erschöpft; die Arbeit wurde erst nach der Aufforderung zum Fortsetzen wieder aufgenommen. Eine Hintergrundentwicklung während der Unterbrechung wird nicht behauptet.
