# OLIVA · Raum für deinen Glauben

Eigenständige Bibel- und Glaubens-App mit Expo, React Native und TypeScript. **OLIVA 0.12.0 ist geprüft und seit 10.11.2026, 03:51:05 UTC eigentümerprivat bereitgestellt.** Neu sind alle 1.300 Originalfragen für die 260 Kapitel und 27 Bücher des Neuen Testaments, gespeicherte Antworten und belegte historische Abschlüsse. Fließtext, Lesefokus, A51-Baum, Buchbilder und persönliche Funktionen bleiben erhalten. **225/225 Fachtests und ein einzelner vollständiger 108/108-Browserlauf bestanden**, ohne Skips, instabile Fälle oder Wiederholungen. Die Gesamt-Definition-of-Done bleibt offen. FaithPath und `main` bleiben unverändert. [NT-Integration und Nachweise](docs/23-nt-study-and-progress.md).

Der echte 0.11→0.12-PWA-Wechsel und beide nativen JS-/Assetexporte bestehen. V1–V7 werden strikt nach V8 im RAM gelesen; erst eine ausdrückliche Aktion schreibt den ergänzten Stand. Private Dokumentversion 1, SQLite 3 und IndexedDB 1 bleiben unverändert. Der eigenständige 0.12-Quellcheckpoint mit Tag, ZIP und SHA-256 sowie die beauftragte GitHub-Sicherung folgen nach diesem Dokumentcheckpoint. Deren noch nicht bestätigte Kennungen werden nicht vorweggenommen; die tatsächliche neue Remote-CI wird separat geprüft.

## Auf dem Handy ansehen

[Private OLIVA-Vorschau öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site) und mit dem berechtigten ChatGPT-Eigentümerkonto anmelden. Die URL enthält weiterhin `v04`; seit **10.11.2026, 03:51:05 UTC** wird dort **0.12.0** ausgeliefert. Der Eigentümerzugriff bleibt unverändert; es gibt keine öffentliche Webfreigabe.

**Neu:** [Fragen zum Neuen Testament öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/verstehen), auch unter **Bibel → Fragen zum Neuen Testament**. [Mit Markus 4 beginnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/verstehen/MRK?chapter=4). Erst **Antwort prüfen** speichert. Frühere Abschlüsse lassen sich aus bestehenden Archiven ausdrücklich übernehmen; daraus entstehen keine erfundenen Antworten oder Glaubensbewertungen.

**Reader:** Im Reader **Lesefokus starten** wählen oder unter **Leseeinstellungen → Fließtext / Einzelverse** wechseln. [Einen kurzen Abschnitt ausprobieren](https://oliva-v04-private-preview.purplebean128.chatgpt.site/lesen/MRK?chapter=4&from=35&to=41). Die kleinen Zahlen bleiben auswählbar; **Versaktionen** bietet zusätzlich eine große Verswahl.

[Freiwillige Einladungen öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/einladungen). Der Schalter ist zunächst aus. Auch unter **Einstellungen → Gedanken wiederbegegnen** erreichbar. Keine Push-Nachrichten und kein Nachholbedarf.

[Römer – Schwert der Gnade](https://oliva-v04-private-preview.purplebean128.chatgpt.site/buch/ROM). Die Startseite zeigt das Bild des aktuellen illustrierten Buches und öffnet alle 66 Buchschwertansichten direkt. Johannes und alle kompakten Vektoren bleiben erhalten.

Der A51-Baum steht auf **Heute** und groß unter **Mein Garten**. **„Alle sieben Lebensbilder ansehen“** öffnet die vollständige Reihe, ohne den persönlichen Fortschritt zu ändern. Der [private Vorher-/Nachher-Vergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg) zeigt echte Browseraufnahmen aller sieben Stadien. Manifest, Icons und Offlinepaket sind enthalten; eine Installation auf einem echten Smartphone wurde noch nicht geprüft.

Unter **Bibel → Johannes → „Buchschwert ansehen“** findest du das große **Schwert des Lebens**, die eigene Lesespur und unmittelbar lesbare Motivquellen. Auch **Sammlung → Buchschwerter** führt zu allen 66 Buchansichten. [Johannes direkt öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/buch/JHN) · [privater Bild-/Fortschrittsvergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/swords/comparison.svg). Alle kompakten Vektorschwerter bleiben erhalten. Reines Betrachten oder das Öffnen einer Quelle bestätigt keine Lesung.

Nach **„Für den Offline-Neustart bereit.“** ist das Paket für den geladenen Build im Browsercache vollständig. Persönliche Einträge bleiben im jeweiligen Browser/Gerät; eine Cloud-Synchronisierung ist nicht aktiviert. Der Hosting-Zugang erfordert das berechtigte Konto, der lokal gestartete App-Kern keine Registrierung.

## Vorhandene Bereiche im abgenommenen 0.12-Stand

- **Bibel:** gemeinfreie Lutherbibel 1912 mit 66 Büchern, 1.189 Kapiteln und 31.102 Versen; Navigation, Volltextsuche, zwei Lesemodi, Lesezeichen, Markierungen, Notizen, Schrift-/Abstandseinstellungen und präzise Versfortsetzung, Fließtext-/Einzelverswahl und temporärer Lesefokus.
- **NT-Fragen:** alle 1.300 Originalfragen mit vier Optionen, unverändertem Lösungsschlüssel, Erklärung und Bibelstellen; Wiederaufnahme, bewusste Antwortänderung, Quellenfassungen und getrennte historische Herkunft. Ein Abschluss bedeutet fünf Fragen angesehen; falsche Antworten sind zulässig. Keine Veränderung von Lesen oder Baum.
- **Geschichten:** fünf illustrierte Erzählpiloten einschließlich **David vor Goliath, 1. Samuel 17,38–45** im Entwicklungsstand 0.8. Unter **Bibel → Eine Geschichte entdecken** öffnen die Karten exakte Textabschnitte mit getrennter Einordnung. Acht biblische Bildmaster und 21 WebP-Varianten besitzen Herkunfts- und Freigabemetadaten; unabhängige Fach-/Vertriebsfreigaben bleiben offen.
- **Wege:** neun geführte Reisen mit je drei Schritten, verständlichen Einordnungen, freiwilliger Reflexion und optionalem Gebet. Neun Textfragen nennen tatsächliche Verse als Beleg. Die Pilotredaktion wird thematisch wiederverwendet; eine unabhängige Fachfreigabe steht aus.
- **Garten:** sieben unveränderte A51-Originalillustrationen, lebendige Webdarstellung, separater nativer PNG-Ebenenadapter, statische Fallbacks, reduzierte Bewegung und eine Galerie. Der Baum bewertet keinen Glauben und verliert in Pausen keine Blätter.
- **Buchschwerter:** 66 Buchansichten mit Themenidentität, Erklärung, Kapitelzähler und direktem Leseanfang. Johannes und Römer besitzen tatsächlich generierte große Illustrationen mit separaten, buchgenauen Kapitellichtspuren. Ihre Quellen erläutern Leben, Verbundenheit, Gnade und Frieden. Die 66 kompakten Vektorschwerter bleiben verfügbar. Ein kurzer Lichtimpuls folgt ausschließlich einer erfolgreich gespeicherten ausdrücklichen Kapitelbestätigung; reduzierte Bewegung bleibt statisch.
- **Sammlung und Vorhaben:** Gedanken, Entwürfe, Versnotizen und Erfahrungen; eigene Anliegen mit kleinen Schritten, Archiv und bewahrten Rückblick-Snapshots. Rückblicktexte lassen sich mit dauerhaften, konfliktgeschützten Entwürfen bearbeiten, bestätigt löschen und einmal innerhalb der geöffneten Ansicht zurückholen. Identität, damalige Quelle und Erfahrungsbestätigung bleiben beim Edit erhalten; Verwaltungsaktionen erzeugen kein Wachstum. **Sammlung → Entwürfe** führt nach Bereichswechsel oder Neustart zurück zur Quelle.
- **Einladungen:** freiwillige Wiederbegegnung mit aktiven Vorhaben nach 21 und eigenständigen Gedanken nach 35 Tagen; 14 Tage zurückstellen, ausblenden, wieder zulassen. Opt-out bewahrt Entscheidungen, schreibfreie Quellenlinks bewahren vorhandene Entwürfe. Steuerung erzeugt kein Wachstum.
- **Sicherungen und Import:** bestätigter Export/Restore sowie additiver FaithPath-V5-Import mit Vorschau, Quellarchiv, Konfliktschutz und atomarer Rückkehrsicherung. OTB wird nicht als Lutherbibel ausgegeben. Grenzen: 10 MiB Importquelle, 64 MiB vollständige Sicherung.

Tippen erzeugt keinen Lernabschluss oder bestätigte Alltagserfahrung. Bei einem Schreibfehler schützt ein gesonderter RAM-Puffer Worte innerhalb der laufenden Sitzung; er überlebt keinen Prozessabbruch. Die Bildwelt, redaktionelle Einordnung und der eigentliche Bibeltext bleiben getrennt. Cloud-Sync, KI-Begleiter und Audio sind nicht angeschlossen. Maßgeblich für Umfang und Grenzen ist [der Lieferstand](docs/delivery-status.md).

## Lokal starten

Die aktuelle Quelle ist ein eigenständiges Projekt. Im Arbeitsbereich dieser Sitzung:

```sh
cd /workspace/faithpath-next
npm ci
npm run build
npm run preview
```

Danach http://localhost:4173 öffnen. In einem eigenen Checkout dieselben npm-Befehle direkt im Projektverzeichnis ausführen. Die bestätigten GitHub-Versionsstände 0.4 bis 0.11 liegen unter `oliva/` im FaithPath-Repository. In diesen Checkouts zuerst `cd oliva` ausführen; das separate Standalone-Projekt und seine Quell-ZIPs starten direkt in ihrer Wurzel.

Geprüfte Umgebung: Node 24.22.1, npm 11.9.0, Expo 58.0.23, React Native 0.88.1 und TypeScript 6.0.3. Der Kern benötigt keine API-Schlüssel. Für dieses eingeschränkte Arbeitsumfeld kann npm mit `npm --cache /tmp/faithpath-npm ci` einen beschreibbaren Cache verwenden.

Entwicklung: `npm run web` startet Expo unter http://localhost:8081. Der Service Worker wird nur im Produktionsbuild registriert. Er benötigt HTTPS oder localhost; ein direkter Aufruf über `file://` genügt nicht.

## Prüfen

```sh
npm run content:check
npm run content:nt
npm run content:art
npm run content:tree
npm run content:swords
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright nutzt `/usr/bin/chromium`, wenn vorhanden, oder seinen installierten Browser. `CHROMIUM_PATH` kann einen anderen lokalen Pfad angeben. Der Testserver startet auf Port 4173, sofern dort noch kein Vorschauprozess läuft. Während der Tests den gebauten `dist/`-Stand unverändert lassen.

**Tatsächliche 0.7-Nachweise:** **116/116 Fach-/Persistenztests** und ein einzelner vollständiger Browserlauf mit **59/59 Fällen**, ohne Überspringen oder Flaky-Ergebnis, bestanden. Ein vorheriger 57/59-Lauf fand einen echten falschen Speicherhinweis nach Verwerfen sowie ein V1-Testfixture mit versehentlichem V6-Feld; beide sind korrigiert und im finalen Lauf enthalten. Frühere rote Berichte bleiben erhalten. Details: [Qualität und Abnahme](docs/05-validation.md), [Zusammenfassung 0.7](docs/evidence/session-07/validation-summary.json) und [Rückblickvertrag](docs/12-review-editing.md). Historische 0.5-/0.6-Belege bleiben unter ihren eigenen Sessionverzeichnissen erhalten.

**GitHub 0.5 bis 0.8 sind vollständig hochgeladen und per Remote-Refs/Teilbaum bestätigt.** [0.5](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.5.0/oliva) · [0.6](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.6.0/oliva) · [0.7](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.7.0/oliva) · [0.8](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.8.0/oliva). Der [neue Sicherungsbeleg](docs/evidence/session-09/checkpoints/oliva-github-backups.json) bestätigt alle acht Versionsrefs sowie unveränderte `main`-/0.4-Refs und ursprüngliche FaithPath-Pfade. Der tatsächliche 0.8-CI-Lauf [42487317354](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42487317354) wird separat geprüft; hier noch kein behauptetes grünes Remote-Ergebnis. Die tatsächlichen Remote-CI-Ergebnisse sind **0.5: 72/72 Fachtests, 43/45 Browserfälle, zwei Fehler; 0.6: 75/75 und 52/52 grün; 0.7: 116/116 und 59/59 grün**. Der [gesicherte CI-Bericht](docs/evidence/github/CI-REPORT-2026-11-08.md) nennt Heads, Läufe und Grenzen. Der frühere Lauf 42240609694 mit 64/35 Fällen bleibt ausschließlich 0.4 zugeordnet. Gemäß Auftrag vom 08.11 werden folgende Versionen nach eigener Abnahme auf separaten Branches/Tags gesichert; [Ablauf und Schutzregeln](docs/13-github-version-backups.md).

Der tatsächliche **0.6→0.7-Workerwechsel** ist mit einem separat erhaltenen 0.6-Export reproduzierbar. V1–V5 werden strikt nach Nutzdaten-V6 migriert; privates Dokument V1, SQLite V3 und IndexedDB V1 bleiben erhalten. Beim geprüften Wechsel bleibt gespeichertes V5 bis zur ausdrücklichen Rückblickbearbeitung exakt bestehen. Danach sind Identität/Quelle des Rückblicks, alte Entwürfe, Fortschritt, Originalblob und Rückkehrsicherung erhalten; sieben A51-Stadien, Johannesbild und exklusiver Vorgängerchunk funktionieren offline:

```sh
node scripts/offline-upgrade-v07.mjs /absoluter/pfad/zum/0.6/dist dist
```

`scripts/offline-upgrade-v06.mjs` bleibt der historische 0.5→0.6-Versuch, `scripts/offline-upgrade-v05.mjs` der 0.4→0.5-Versuch; `npm run test:upgrade` der ältere 0.3→0.4-Prüfablauf. Diese alten Skripte benötigen ihre passenden Kontroll-/Zielexporte. Keine echten persönlichen Browserdaten für technische Experimente löschen. Seit 0.8 verwenden neue Playwright-Berichte standardmäßig `docs/evidence/latest/`; abgeschlossene Abnahmen werden in eigenen Sessionverzeichnissen erhalten.

**Tatsächliche 0.8-Nachweise:** **117/117 Fach-/Persistenztests und ein einzelner vollständiger Browserlauf mit 67/67 Fällen** ohne Überspringen oder Flaky-Ergebnis bestanden. Typecheck, Webbuild, aktuelles npm-Audit mit **0 Funden** sowie native JavaScript-/Assetexporte sind erfolgreich. Der [echte 0.7→0.8-Offlinewechsel](docs/evidence/session-08/offline-upgrade.json) bewahrt alle rohen V6-Datensätze, Originalarchive und Rückkehrsicherung unverändert; fünf Geschichten, sieben A51-Stadien, Johannesbild und exklusiver Vorgängerchunk laden offline. Keine neue Datenmigration. Drei frühere rote Gesamtläufe bleiben erhalten: eine zu frühe URL-Testmessung (65/66), ein realer Registrierungs-Gatefehler (65/66) und eine zu streng verlangte flüchtige Zwischenanzeige im Test (66/67). Produktfix und Testsynchronisierung sind getrennt dokumentiert. [Abnahme mit Rohberichten](docs/evidence/session-08/validation-summary.json) · [Story-/Offlinevertrag](docs/15-stories-and-offline-v08.md). Diese lokalen Ergebnisse sind kein 0.8-Remote-CI-Nachweis.

```sh
node scripts/offline-upgrade-v08.mjs /absoluter/pfad/zum/0.7/dist dist
```

Der Bibelimport ist mit `npm run content:import` und `npm run content:check` deterministisch aus dem enthaltenen Original-USFM-Archiv wiederholbar; es werden keine Bibeltexte generiert. `npm run content:tree` prüft die A51-Original-/Derivatehashes. Die zusätzliche tatsächliche PNG-Ruheprüfung `python scripts/check-a51-native.py` benötigt Pillow und NumPy; normale Builds verwenden die gespeicherten Dateien und benötigen diese Python-Bildbibliotheken nicht.

## iOS und Android

```sh
npm start
npm run android
# auf einem Mac mit Xcode:
npm run ios
```

Gerät bzw. Emulator und Expo-SDK-Version müssen zusammenpassen. Bei inkompatiblem Expo Go ist ein passender Development Build nötig. Die beiden tatsächlich geprüften nativen Exporte sind unsignierte Debug-JavaScript-/Asset-Bundles:

```sh
node scripts/expo.mjs export --platform android --output-dir dist-android --no-minify --no-bytecode
node scripts/expo.mjs export --platform ios --output-dir dist-ios --no-minify --no-bytecode
```

In beiden historischen 0.8-Exporten sind alle 98 nativen A51-PNGs, drei Johannes-PNGs und drei David-WebPs bytegenau enthalten. A51-Webrenderer sowie große Schwertmaster und Promptmaterial sind ausgeschlossen. Das beweist Metro-Auflösung und Assetauslieferung, keine native Installation, Bilddecoderqualität, flüssige Animation oder Akkuleistung. Es wurden weder Simulatoren noch physische Geräte oder signierte APK/AAB/IPA geprüft. Frühere Hermes-Exporte sind separat historisch dokumentiert. Die beiden aktuellen 0.12-Exporte enthalten je 98 A51-PNGs, sechs Buch-PNGs und drei David-WebPs bytegenau. Zusätzlich wurde der gesamte Katalog mit 1.300 Fragen in beiden JavaScript-Bundles statisch feldgleich geprüft. [Aktuelle native Nachweise](docs/evidence/nt-catalog/native/README.md).

Für Installationspakete Xcode bzw. Android SDK/JDK konfigurieren, App-IDs prüfen, `npx expo prebuild` in einer Arbeitskopie ausführen und die nativen Projekte bauen. Alternativ ein eigenes EAS-Projekt mit den eigenen Konten konfigurieren. Signing, Geräteprüfung, Vertriebsrechte und öffentliche Freigabe bleiben erforderlich; dieses Projekt hat keinen automatischen Produktions-Deploy.

## Private Web-Paketierung

`npm run build` erzeugt `dist/` mit Manifest, Icons, Quellenhinweisen und Offlinepaket. `node scripts/package-private-preview.mjs /absoluter/site-projektpfad` verpackt diesen geprüften Export für einen bereits separat gebundenen privaten Sites-Quellordner. Das Skript veröffentlicht nichts und ändert keine Zugriffsrechte.

Das private Hostpaket benennt Assetpfade für den Dienst um. Es enthält nur eine `index.html`, da zwei HTML-Dateien im beobachteten Hosting den SPA-Fallback deaktivierten. Reviewvergleiche werden deshalb als SVG ausgeliefert. Die historische 0.8-[HTTP-Prüfung](docs/evidence/session-08/private-http-check.json) bestätigt **16 App-Routen sowie 101 App- und 42 Review-Dateien bytegenau**; anonym wird HTTP 401 geliefert. Der [Bereitstellungsnachweis](docs/evidence/session-08/private-deployment.json) vom **08.11.2026, 13:50:48 UTC** verbindet Kernbuild `oliva-618ddeeb77388032` mit Hostpaket `oliva-6baa9eda299dea7a`. Der Zugriff bleibt eigentümerprivat. Diese HTTP-Prüfung ist keine zusätzliche CUA-Browser- oder Handyabnahme des gehosteten Links; das vorgesehene CUA-Werkzeug war nicht verfügbar. Historische 0.7-Hostingbelege bleiben unter ihrer eigenen Session erhalten.

Ein eigener HTTPS-Static-Host benötigt SPA-Fallback auf `index.html`, richtige Assettypen und echte 404-Antworten für unbekannte Assetpfade. `index.html` und `sw.js` dürfen nicht unveränderlich gecacht werden. Der lokale Vorschau-Server ist kein vollständig gehärteter Produktionsserver. Ohne ausdrückliche Freigabe keine öffentliche Bereitstellung vornehmen.

## Dokumentation und Fortsetzung

1. [FaithPath-Analyse und Feature-Matrix](docs/00-faithpath-audit.md)
2. [Konkurrenz, USP und Roadmap](docs/01-product-and-competition.md)
3. [Informationsarchitektur und Designsystem](docs/02-ux-and-design.md)
4. [Architektur und Entscheidungen](docs/03-architecture.md)
5. [Bildwelt und Rechte](docs/04-art-direction-and-rights.md)
6. [Prüfungen und offene Abnahmen](docs/05-validation.md)
7. [Persönliche Vorhaben und gesicherte Entwürfe](docs/06-personal-and-drafts.md)
8. [FaithPath-V5-Import, Quellen und Rückkehr](docs/07-faithpath-import.md)
9. [Entwürfe, Archiv-Blobs und Offline-Updates](docs/08-continuity-and-offline.md)
10. [A51-Integration und Screenshotvergleich](docs/09-a51-integration.md)
11. [Johannes-Bildpilot, Lichtspur und Rechte](docs/10-sword-art-pilot.md)
12. [66 Buchansichten und Lesespuren](docs/11-book-identities.md)
13. [Rückblicke bearbeiten, löschen und zurückholen](docs/12-review-editing.md)
14. [Lieferstand und nächste Schritte](docs/delivery-status.md)
15. [GitHub-Versionssicherungen](docs/13-github-version-backups.md)
16. [Build-Abhängigkeiten und CI-Laufzeit](docs/14-dependency-security.md)
17. [Geschichten und Offline-Abnahme 0.8](docs/15-stories-and-offline-v08.md)
18. [Aktueller Plan und bestätigte Paritätslücken](docs/16-current-plan-and-parity.md)
19. [Freiwillige In-App-Einladungen](docs/18-in-app-invitations.md)
20. [Vorbereitung des ursprünglichen Fließtextreaders](docs/19-reader-flow-preparation.md)
21. [Fertigen NT-Katalog übernehmen: Datenprüfung und Vorbereitung](docs/20-nt-catalog-preparation.md)
22. [Reader, Lesefokus und Reflow-Abnahme](docs/21-reader-flow-and-focus.md)
23. [Originaler NT-Fortschrittsvertrag](docs/22-original-nt-progress-contract.md)
24. [Aktive NT-Integration und Abnahmestand](docs/23-nt-study-and-progress.md)
25. [Dauerhafter Fortsetzungsstand](RESUME.md)

Die A51-Originale, die eigene biblische Bildwelt und beide Buchbildpiloten besitzen getrennte Herkunftsnachweise unter `art/a51/provenance.json`, `art/manifest.json` und `art/swords/runtime-index.json`. Übernommener FaithPath-A51-Code und A51-Bilder sind von OLIVAs MIT-Lizenz ausgenommen; die ausdrückliche Integrationserlaubnis ist keine allgemeine öffentliche Weiterveröffentlichungslizenz. Die öffentliche Produktfreigabe beider Buchbildpiloten bleibt offen. Details: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Der aktuelle lokale Entwicklungsbranch heißt `feature/oliva-v012-nt-study-20261109` und hat keinen Remote. Der abgeschlossene unabhängige 0.8-Checkpoint ist Commit `e6aa7f5ab552bb983264c1b4cc253c72728d5740`, Tag `oliva-v0.8-stories-offline-private`, ZIP `/workspace/oliva-next-v0.8-stories-offline-source.zip` (120.935.687 Byte, SHA-256 `82c564902e453b638a84c6487098abe769fb828094c8bdb1c4b772b81cde40ca`). [Manifestkopie](docs/evidence/session-09/checkpoints/oliva-v08-local-checkpoint.json). Die GitHub-Kopie unter `oliva/` besitzt Commit `dc4477b01dcd78f278e5dbf82408b26c83837ec1` und exakt denselben OLIVA-Dateibaum. Ältere Checkpoints bleiben erhalten.

**0.9 ist lokal und privat abgenommen.** Römer-Bilder, gemeinsame Registrierung, buchgenaue Lichtspuren und Startseitenzugang sind integriert und mit 120 Fachtests, 76 Browserfällen, beiden nativen JS-/Assetexporten sowie echtem Offline-Update geprüft. Die 0.9-Quellen sind lokal und auf [GitHub unter `oliva/`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.9.0/oliva) gesichert. Auch der tatsächliche GitHub-Lauf 42517524350 besteht 120/120 Fach- und 76/76 Browserfälle, ohne Skip/Flaky/Wiederholung; [Belege](docs/evidence/github/ci-v09/verification.json). Der Kontrollbuild bleibt erhalten.

Fließtext und Lesefokus sind seit 0.11 integriert; Mehrversauswahl, eigene Kopieraktion und der ursprüngliche Vollkapitelkontext bei Teilabschnitten fehlen weiter. Seit 0.12 sind die **1.300 Original-NT-Fragen für 260 Kapitel und 27 Bücher** aktiv und privat verfügbar. Die neun eigenen Pilotfragen bleiben ein eigener Bestand. Weitere Lücken und offene Entscheidungen: [aktueller Plan](docs/16-current-plan-and-parity.md).

Die vorbereiteten Supabase-Migrationen sind kein aktiver Cloudbetrieb. Persönliche Daten und Exporte sind lokal und unverschlüsselt. Native Geräteabnahme, unabhängige Inhalts-/Bildprüfung, Anfänger-Usability, weitere Buchschwertillustrationen, optionale Dienste und die Gesamtfreigabe bleiben offen.

Die Anweisung vom 08.11. erlaubt die Quellenablage im bestehenden öffentlichen GitHub-Repository für 0.5/0.6/0.7 und folgende Versionen. Die Web-Vorschau bleibt eigentümerprivat. GitHub-Checkout: zuerst `cd oliva`, dann die üblichen npm-Befehle. Keine Änderung an FaithPaths Anwendungsdateien oder `main`, kein öffentlicher Web-/Storedeploy. Details: [Versionssicherungen](docs/13-github-version-backups.md).

## Tatsächliche Abnahme 0.9

**120/120 Fachtests, strikter Typecheck und ein einzelner vollständiger Browserlauf mit 76/76 Fällen**, ohne Skip oder Flaky-Ergebnis. Auch die 16 gezielten Buchbildfälle, der echte Offline-Wechsel 0.8→0.9 und beide nativen JavaScript-/Assetexporte sind erfolgreich. Je Plattform sind 98 A51-PNGs, sechs Buch-PNGs und drei David-WebPs bytegenau vorhanden. Der portable Exportprüfer bestand 13 absichtliche Beschädigungsfälle an Kopien. Das ist keine Geräte-, Simulator-, Decoder-, Installations- oder Energieprüfung.

[Abnahme mit Rohbelegen](docs/evidence/session-09/validation-summary.json) · [Buchbilder und Hub](docs/17-book-gallery-v09.md) · [Plan und offene Bestandsparität](docs/16-current-plan-and-parity.md).

Das private Deployment vom 08.11.2026 um 19:49:19 UTC ist erfolgreich. Die HTTP-Prüfung bestätigt 17 Routen sowie 104 App- und 42 Review-Dateien bytegenau; anonym HTTP 401. Der eigene Quelltag, ZIP mit SHA-256 und GitHub-Versionsrefs werden nach diesem Abnahmecheckpoint gesichert und anschließend zurückgelesen. Die noch unbekannte Commitkennung wird nicht vorweggenommen. Historische Quelltags bleiben unverändert.

## Tatsächliche Abnahme 0.10

**154/154 Fachtests und ein einzelner vollständiger 82/82-Browserlauf bestanden**, ohne Skip, Flaky-Fälle oder Wiederholung; sechs neue Browserfälle auch separat grün. Typecheck, Bibel-/Bild-/A51-/Buchnachweise und Audit (0 Funde) erfolgreich. Echter 0.9→0.10-PWA-Wechsel erhält zunächst alle V6-Rohdaten; der ausdrückliche Opt-in schreibt ausschließlich V7, Revision und Einladungskontrollen. Native JS-/Assetexporte beider Plattformen sind geprüft, ohne Geräte-/Simulatorbehauptung. [Gesamtnachweis](docs/evidence/invitations/validation-summary.json).

Private Bereitstellung am 08.11.2026 um 20:31:27 UTC: 18 App-Routen und 105 App-Dateien geprüft (104 Hashvergleiche, Index-HTML separat als App-Shell); 42 Review-Dateien bytegenau. Anonym HTTP 401, weiterhin nur ein Eigentümer. Gehosteter CUA-Browser und physische Handyinstallation nicht geprüft. Der nachfolgende separate Quellen-/GitHub-Checkpoint wird außerhalb seines eigenen Gitbaums protokolliert; keine unbekannten Commit- oder ZIP-Hashes vorwegnehmen.

## Tatsächliche Abnahme 0.11

**168/168 Fachtests und ein einzelner vollständiger 92/92-Browserlauf bestanden**, ohne Skip, Flaky-Fälle oder Wiederholung. Typecheck, Bibel-/Bild-/A51-/Buchnachweise und Audit (0 Funde) erfolgreich. Echter 0.10→0.11-PWA-Wechsel erhält alle vier rohen IndexedDB-Datensätze, beide Entwürfe, Originalarchiv und Rückkehrsicherung; ein alter Psalm-Leseanker wird erstmals offline im neuen Fließtext wiederhergestellt. AppData V7, privates Dokument V1, SQLite3 und IndexedDB1 bleiben unverändert. [Gesamtnachweis](docs/evidence/reader-flow/validation-summary.json).

Private Bereitstellung am **09.11.2026 um 08:20:19 UTC**: 20 App-Routen und 105 App-Dateien geprüft (104 Hashvergleiche, Index-HTML separat als App-Shell); 42 Review-Dateien bytegenau. Anonym HTTP 401, Zugriffspolitik unverändert eigentümerprivat. Beide nativen JS-/Assetexporte sind erfolgreich; tatsächliche native Zeilenereignisse, Geräte, Simulatoren, Decoder und Energie sind nicht geprüft. Der nachgelagerte 0.11-Quellcheckpoint samt ZIP und GitHub-Sicherung ist inzwischen abgeschlossen; die Nachweise liegen unter `docs/evidence/nt-catalog/checkpoints/`.

Die aktive NT-Integration: [Originalvertrag](docs/22-original-nt-progress-contract.md), [Umsetzung und Abnahme](docs/23-nt-study-and-progress.md). `npm run content:nt` prüft den eingefrorenen Originalkatalog offline reproduzierbar. Der Kern heißt `oliva-80005b3c1d2e2eef`; seine 313 Runtime-Eingaben blieben bei beiden nativen Exporten identisch, SHA-256 `00acc78da7d6268326b68fce0906ffa67d32c337240efbd8f59490e8d839590a`. [Native Katalogprüfung](docs/evidence/nt-catalog/native/README.md) und [echter Updateversuch](docs/evidence/nt-catalog/upgrade/README.md) sind getrennt belegt.

Die Quellenstände bis 0.11 sind tatsächlich auf GitHub gesichert. Die ursprüngliche 0.11-Remote-CI bleibt rot: 168/168 Fachtests und 91/92 Browserfälle. Auch der separate Testzweig bleibt mit 168/168 und 92/93 rot; beide Davidfälle bestehen, die A51-Offline-Erkennungslücke ist separat untersucht. Historische Berichte und Tags bleiben unverändert.

## Tatsächliche Abnahme und private Bereitstellung 0.12

**225/225 Fachtests und ein einzelner vollständiger 108/108-Browserlauf bestanden**, ohne Skips, instabile Fälle oder Wiederholungen. Typecheck, Inhaltshashes, Audit mit 0 Funden, beide nativen Exporte und der reale 0.11→0.12-Workerwechsel sind erfolgreich. Der erste vollständige Lauf mit 107/108 bleibt als Diagnose erhalten; nach Anpassung ausschließlich der veralteten Import-Testerwartung besteht der vollständige Lauf am unveränderten Produktbuild. [Gesamtnachweis](docs/evidence/nt-catalog/validation-summary.json).

Seit **10.11.2026, 03:51:05 UTC** privat bereitgestellt: 24 App-Routen und 107 App-Dateien geprüft (106 Hashvergleiche, Index-HTML separat als App-Shell); 42 Review-Dateien bytegenau. Anonym HTTP 401, Zugriff unverändert auf einen Eigentümer begrenzt. Privater Hosting-Quellcommit `597abd802820fece4bac4601ed5fa0a57134c983`, Deployment `appgdep_6af2949d0910819196b799ea5b20de94`, gespeicherte Version `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_a32bfb3b4bfc819189fb1bd1696f6866`, Kern `oliva-80005b3c1d2e2eef`, Hostpaket `oliva-168499f23f74e16c`. [HTTP-Nachweis](docs/evidence/nt-catalog/private-http-check.json). Der erste Hostingversuch lieferte für einen Expo-Router-PNG-Pfad eine HTML-Shell statt des Bildes. Dieser HTTP-Fehler und das erste Paket bleiben unter `before-vendor-host-fix/` erhalten. Ausschließlich das Hostingpaket wurde auf den vorhandenen Vendor-Alias samt URI-Umschreibung angepasst; der Produktkern blieb unverändert. Der anschließende vollständige HTTP-Abgleich ist der hier genannte Erfolgsnachweis. Native Nachweise betreffen JavaScript und Assetbytes einschließlich des vollständigen statischen Katalogabgleichs. Geräte-, Simulator-, Decoder-, Screenreader-, Energie-, Speicher- und signierte Installationstests sind damit nicht durchgeführt.

Der eigenständige 0.12-Quellcheckpoint mit Tag, ZIP und SHA-256 sowie die beauftragte GitHub-Sicherung folgen nach diesem Dokumentcheckpoint. Deren noch nicht bestätigte Kennungen werden nicht vorweggenommen; die tatsächliche neue Remote-CI wird separat geprüft. Danach wird der Master mit Mehrversauswahl, Kopieraktion und vollständigem Kapitelkontext fortgesetzt; [Vorbereitung der nächsten Readerarbeit](docs/evidence/reader-parity-preparation/reader-parity-preparation.md). Kein neuer Versions- oder Terminplan wird vorweggenommen.
