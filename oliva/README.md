# OLIVA · Raum für deinen Glauben

Eigenständige Bibel- und Glaubens-App mit Expo, React Native und TypeScript. **Version 0.8.0 ist getestet und privat bereitgestellt.** David vor Goliath, robustes Laden der Geschichtenbilder und eine begrenzte Offline-Prüfung sind integriert. Die separate GitHub-Sicherung dieses neuen Quellstands folgt nach dem lokalen Abschlusscheckpoint; sie ist hier noch nicht als hochgeladen bestätigt. A51-Olivenbaum, 66 Buchansichten und großes Johannes-Schwertbild bleiben enthalten. FaithPath und `main` bleiben unverändert; der vollständige Master-Prompt ist noch nicht abgeschlossen.

## Auf dem Handy ansehen

[Private OLIVA-Vorschau öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site) und mit dem berechtigten ChatGPT-Eigentümerkonto anmelden. Die URL enthält weiterhin `v04`; seit **08.11.2026, 13:50:48 UTC** wird dort **0.8.0** ausgeliefert. Der Eigentümerzugriff bleibt unverändert; es gibt keine öffentliche Freigabe.

Der A51-Baum steht auf **Heute** und groß unter **Mein Garten**. **„Alle sieben Lebensbilder ansehen“** öffnet die vollständige Reihe, ohne den persönlichen Fortschritt zu ändern. Der [private Vorher-/Nachher-Vergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg) zeigt echte Browseraufnahmen aller sieben Stadien. Manifest, Icons und Offlinepaket sind enthalten; eine Installation auf einem echten Smartphone wurde noch nicht geprüft.

Unter **Bibel → Johannes → „Buchschwert ansehen“** findest du das große **Schwert des Lebens**, die eigene Lesespur und unmittelbar lesbare Motivquellen. Auch **Sammlung → Buchschwerter** führt zu allen 66 Buchansichten. [Johannes direkt öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/buch/JHN) · [privater Bild-/Fortschrittsvergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/swords/comparison.svg). Alle kompakten Vektorschwerter bleiben erhalten. Reines Betrachten oder das Öffnen einer Quelle bestätigt keine Lesung.

Nach **„Für den Offline-Neustart bereit.“** ist das Paket für den geladenen Build im Browsercache vollständig. Persönliche Einträge bleiben im jeweiligen Browser/Gerät; eine Cloud-Synchronisierung ist nicht aktiviert. Der Hosting-Zugang erfordert das berechtigte Konto, der lokal gestartete App-Kern keine Registrierung.

## Vorhandene Bereiche

- **Bibel:** gemeinfreie Lutherbibel 1912 mit 66 Büchern, 1.189 Kapiteln und 31.102 Versen; Navigation, Volltextsuche, zwei Lesemodi, Lesezeichen, Markierungen, Notizen, Schrift-/Abstandseinstellungen und präzise Versfortsetzung.
- **Geschichten:** fünf illustrierte Erzählpiloten einschließlich **David vor Goliath, 1. Samuel 17,38–45** im Entwicklungsstand 0.8. Unter **Bibel → Eine Geschichte entdecken** öffnen die Karten exakte Textabschnitte mit getrennter Einordnung. Acht biblische Bildmaster und 21 WebP-Varianten besitzen Herkunfts- und Freigabemetadaten; unabhängige Fach-/Vertriebsfreigaben bleiben offen.
- **Wege:** neun geführte Reisen mit je drei Schritten, verständlichen Einordnungen, freiwilliger Reflexion und optionalem Gebet. Neun Textfragen nennen tatsächliche Verse als Beleg. Die Pilotredaktion wird thematisch wiederverwendet; eine unabhängige Fachfreigabe steht aus.
- **Garten:** sieben unveränderte A51-Originalillustrationen, lebendige Webdarstellung, separater nativer PNG-Ebenenadapter, statische Fallbacks, reduzierte Bewegung und eine Galerie. Der Baum bewertet keinen Glauben und verliert in Pausen keine Blätter.
- **Buchschwerter:** 66 Buchansichten mit Themenidentität, Erklärung, Kapitelzähler und direktem Leseanfang. Der tatsächlich generierte Johannes-Pilot ist als große Illustration mit separater Kapitellichtspur integriert; drei Quellenlinks erläutern Leben, Quelle und Weinstock. Die 66 kompakten Vektorschwerter bleiben verfügbar. Ein kurzer Lichtimpuls folgt ausschließlich einer erfolgreich gespeicherten ausdrücklichen Kapitelbestätigung; reduzierte Bewegung bleibt statisch.
- **Sammlung und Vorhaben:** Gedanken, Entwürfe, Versnotizen und Erfahrungen; eigene Anliegen mit kleinen Schritten, Archiv und bewahrten Rückblick-Snapshots. Rückblicktexte lassen sich mit dauerhaften, konfliktgeschützten Entwürfen bearbeiten, bestätigt löschen und einmal innerhalb der geöffneten Ansicht zurückholen. Identität, damalige Quelle und Erfahrungsbestätigung bleiben beim Edit erhalten; Verwaltungsaktionen erzeugen kein Wachstum. **Sammlung → Entwürfe** führt nach Bereichswechsel oder Neustart zurück zur Quelle.
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

Danach http://localhost:4173 öffnen. In einem eigenen Checkout dieselben npm-Befehle direkt im Projektverzeichnis ausführen. Die bestätigten GitHub-Versionsstände 0.4 bis 0.7 liegen unter `oliva/` im FaithPath-Repository. In diesen Checkouts zuerst `cd oliva` ausführen; das separate Standalone-Projekt und seine Quell-ZIPs starten direkt in ihrer Wurzel.

Geprüfte Umgebung: Node 24.22.1, npm 11.9.0, Expo 58.0.23, React Native 0.88.1 und TypeScript 6.0.3. Der Kern benötigt keine API-Schlüssel. Für dieses eingeschränkte Arbeitsumfeld kann npm mit `npm --cache /tmp/faithpath-npm ci` einen beschreibbaren Cache verwenden.

Entwicklung: `npm run web` startet Expo unter http://localhost:8081. Der Service Worker wird nur im Produktionsbuild registriert. Er benötigt HTTPS oder localhost; ein direkter Aufruf über `file://` genügt nicht.

## Prüfen

```sh
npm run content:check
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

**GitHub 0.5, 0.6 und 0.7 sind vollständig hochgeladen und per Remote-Refs/Teilbaum bestätigt.** [0.5](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.5.0/oliva) · [0.6](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.6.0/oliva) · [0.7](https://github.com/akwasiacheampongma-code/Faithpath-/tree/oliva-v0.7.0/oliva). Die tatsächlichen Remote-CI-Ergebnisse sind **0.5: 72/72 Fachtests, 43/45 Browserfälle, zwei Fehler; 0.6: 75/75 und 52/52 grün; 0.7: 116/116 und 59/59 grün**. Der [gesicherte CI-Bericht](docs/evidence/github/CI-REPORT-2026-11-08.md) nennt Heads, Läufe und Grenzen. Der frühere Lauf 42240609694 mit 64/35 Fällen bleibt ausschließlich 0.4 zugeordnet. Gemäß Auftrag vom 08.11 werden folgende Versionen nach eigener Abnahme auf separaten Branches/Tags gesichert; [Ablauf und Schutzregeln](docs/13-github-version-backups.md).

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

In beiden aktuellen 0.8-Exporten sind alle 98 nativen A51-PNGs, drei Johannes-PNGs und drei David-WebPs bytegenau enthalten. A51-Webrenderer sowie große Schwertmaster und Promptmaterial sind ausgeschlossen. Das beweist Metro-Auflösung und Assetauslieferung, keine native Installation, Bilddecoderqualität, flüssige Animation oder Akkuleistung. Es wurden weder Simulatoren noch physische Geräte oder signierte APK/AAB/IPA geprüft. Frühere Hermes-Exporte sind separat historisch dokumentiert.

Für Installationspakete Xcode bzw. Android SDK/JDK konfigurieren, App-IDs prüfen, `npx expo prebuild` in einer Arbeitskopie ausführen und die nativen Projekte bauen. Alternativ ein eigenes EAS-Projekt mit den eigenen Konten konfigurieren. Signing, Geräteprüfung, Vertriebsrechte und öffentliche Freigabe bleiben erforderlich; dieses Projekt hat keinen automatischen Produktions-Deploy.

## Private Web-Paketierung

`npm run build` erzeugt `dist/` mit Manifest, Icons, Quellenhinweisen und Offlinepaket. `node scripts/package-private-preview.mjs /absoluter/site-projektpfad` verpackt diesen geprüften Export für einen bereits separat gebundenen privaten Sites-Quellordner. Das Skript veröffentlicht nichts und ändert keine Zugriffsrechte.

Das private Hostpaket benennt Assetpfade für den Dienst um. Es enthält nur eine `index.html`, da zwei HTML-Dateien im beobachteten Hosting den SPA-Fallback deaktivierten. Reviewvergleiche werden deshalb als SVG ausgeliefert. Die aktuelle [HTTP-Prüfung](docs/evidence/session-08/private-http-check.json) bestätigt **16 App-Routen sowie 101 App- und 42 Review-Dateien bytegenau**; anonym wird HTTP 401 geliefert. Der [Bereitstellungsnachweis](docs/evidence/session-08/private-deployment.json) vom **08.11.2026, 13:50:48 UTC** verbindet Kernbuild `oliva-618ddeeb77388032` mit Hostpaket `oliva-6baa9eda299dea7a`. Der Zugriff bleibt eigentümerprivat. Diese HTTP-Prüfung ist keine zusätzliche CUA-Browser- oder Handyabnahme des gehosteten Links; das vorgesehene CUA-Werkzeug war nicht verfügbar. Historische 0.7-Hostingbelege bleiben unter ihrer eigenen Session erhalten.

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
18. [Dauerhafter Fortsetzungsstand](RESUME.md)

Die A51-Originale, die eigene biblische Bildwelt und der Johannes-Pilot besitzen getrennte Herkunftsnachweise unter `art/a51/provenance.json`, `art/manifest.json` und `art/swords/pilot.json`. Übernommener FaithPath-A51-Code und A51-Bilder sind von OLIVAs MIT-Lizenz ausgenommen; die ausdrückliche Integrationserlaubnis ist keine allgemeine öffentliche Weiterveröffentlichungslizenz. Die öffentliche Bildfreigabe des Johannes-Piloten bleibt offen. Details: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Der aktuelle lokale Entwicklungsbranch heißt `feature/oliva-v08-biblical-stories-20261108` und hat keinen Remote. Der unabhängige 0.7-Checkpoint ist gesichert: Commit `f0e8db6b2847d5bfc8361e8f617b8caf0c860787`, Tag `oliva-v0.7-review-continuity-private`, Quell-ZIP `/workspace/oliva-next-v0.7-review-continuity-source.zip`; Commit und ZIP-SHA-256 stehen im äußeren Manifest `/workspace/oliva-v07-local-checkpoint.json`. Die GitHub-Kopie unter `oliva/` besitzt eine andere Commit-ID, aber denselben OLIVA-Dateibaum.

**Nächster Schritt ist die separate Quellensicherung von 0.8 und danach die 0.9-Integration.** Nach dieser Abnahme werden lokaler Tag `oliva-v0.8-stories-offline-private`, ZIP `/workspace/oliva-next-v0.8-stories-offline-source.zip` und äußeres Manifest `/workspace/oliva-v08-local-checkpoint.json` erzeugt. Geplant sind GitHub-Branch `feature/oliva-v08-stories-offline-20261108` und Tag `oliva-v0.8.0`. Upload, exakte Remote-Refs und CI werden erst nach tatsächlichem Abgleich im äußeren Arbeitsmanifest und dem nächsten Lieferstand bestätigt; dieser Quellcheckpoint behauptet sie nicht vorweg.

David und seine drei WebPs (640/1024/1280, zusammen 448.938 Byte) sind tatsächlich integriert. Der erhaltene Generationseintrag unter `art/biblical-next/` dokumentiert den früheren Vorbereitungsstand; aktuelle Runtime-Metadaten stehen in `art/manifest.json`. Als nächste Master-Iteration werden die außerhalb des aktuellen Quellstands vorbereiteten Römer-Pilotbilder und eine erweiterbare Pilotregistrierung geprüft und integriert. Weitere Buchillustrationen, Kapitelredaktion und die verbleibenden Master-Anforderungen folgen autonom nach überprüfbaren Teilzielen.

Die vorbereiteten Supabase-Migrationen sind kein aktiver Cloudbetrieb. Persönliche Daten und Exporte sind lokal und unverschlüsselt. Native Geräteabnahme, unabhängige Inhalts-/Bildprüfung, Anfänger-Usability, weitere Buchschwertillustrationen, optionale Dienste und die Gesamtfreigabe bleiben offen.

Die Anweisung vom08.11 erlaubt die Quellenablage im bestehenden öffentlichen GitHub-Repository für0.5/0.6/0.7 und folgende Versionen. Die Web-Vorschau bleibt eigentümerprivat. GitHub-Checkout: zuerst `cd oliva`, dann die üblichen npm-Befehle. Keine Änderung an FaithPaths Anwendungsdateien oder `main`, kein öffentlicher Web-/Storedeploy. Details: [Versionssicherungen](docs/13-github-version-backups.md).
