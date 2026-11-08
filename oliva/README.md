# OLIVA · Raum für deinen Glauben

Eigenständige Bibel- und Glaubens-App mit Expo, React Native und TypeScript. **Version 0.6.0 mit A51-Olivenbaum, 66 Buchansichten und dem großen Johannes-Schwertbild ist privat verfügbar.** FaithPath und `main` bleiben unverändert; der vollständige Master-Prompt ist noch nicht abgeschlossen.

## Auf dem Handy ansehen

[Private OLIVA-Vorschau öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site) und mit dem berechtigten ChatGPT-Eigentümerkonto anmelden. Die URL enthält weiterhin `v04`; seit **07.11.2026, 12:59:18 UTC** wird dort **0.6.0** ausgeliefert. Es gibt keine öffentliche Freigabe.

Der A51-Baum steht auf **Heute** und groß unter **Mein Garten**. **„Alle sieben Lebensbilder ansehen“** öffnet die vollständige Reihe, ohne den persönlichen Fortschritt zu ändern. Der [private Vorher-/Nachher-Vergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg) zeigt echte Browseraufnahmen aller sieben Stadien. Manifest, Icons und Offlinepaket sind enthalten; eine Installation auf einem echten Smartphone wurde noch nicht geprüft.

Unter **Bibel → Johannes → „Buchschwert ansehen“** findest du das große **Schwert des Lebens**, die eigene Lesespur und unmittelbar lesbare Motivquellen. Auch **Sammlung → Buchschwerter** führt zu allen 66 Buchansichten. [Johannes direkt öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/buch/JHN) · [privater Bild-/Fortschrittsvergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/swords/comparison.svg). Alle kompakten Vektorschwerter bleiben erhalten. Reines Betrachten oder das Öffnen einer Quelle bestätigt keine Lesung.

Nach **„Für den Offline-Neustart bereit.“** ist das Paket für den geladenen Build im Browsercache vollständig. Persönliche Einträge bleiben im jeweiligen Browser/Gerät; eine Cloud-Synchronisierung ist nicht aktiviert. Der Hosting-Zugang erfordert das berechtigte Konto, der lokal gestartete App-Kern keine Registrierung.

## Vorhandene Bereiche

- **Bibel:** gemeinfreie Lutherbibel 1912 mit 66 Büchern, 1.189 Kapiteln und 31.102 Versen; Navigation, Volltextsuche, zwei Lesemodi, Lesezeichen, Markierungen, Notizen, Schrift-/Abstandseinstellungen und präzise Versfortsetzung.
- **Wege:** neun geführte Reisen mit je drei Schritten, verständlichen Einordnungen, freiwilliger Reflexion und optionalem Gebet. Neun Textfragen nennen tatsächliche Verse als Beleg. Die Pilotredaktion wird thematisch wiederverwendet; eine unabhängige Fachfreigabe steht aus.
- **Garten:** sieben unveränderte A51-Originalillustrationen, lebendige Webdarstellung, separater nativer PNG-Ebenenadapter, statische Fallbacks, reduzierte Bewegung und eine Galerie. Der Baum bewertet keinen Glauben und verliert in Pausen keine Blätter.
- **Buchschwerter:** 66 Buchansichten mit Themenidentität, Erklärung, Kapitelzähler und direktem Leseanfang. Der tatsächlich generierte Johannes-Pilot ist als große Illustration mit separater Kapitellichtspur integriert; drei Quellenlinks erläutern Leben, Quelle und Weinstock. Die 66 kompakten Vektorschwerter bleiben verfügbar. Ein kurzer Lichtimpuls folgt ausschließlich einer erfolgreich gespeicherten ausdrücklichen Kapitelbestätigung; reduzierte Bewegung bleibt statisch.
- **Sammlung und Vorhaben:** Gedanken, Entwürfe, Versnotizen und Erfahrungen; eigene Anliegen mit kleinen Schritten, Archiv und bewahrten Rückblick-Snapshots. **Sammlung → Entwürfe** führt nach Bereichswechsel oder Neustart zurück zur Quelle.
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

Danach http://localhost:4173 öffnen. In einem eigenen Checkout dieselben npm-Befehle direkt im Projektverzeichnis ausführen. Nur der ältere öffentliche 0.4-Checkpoint liegt unter `oliva/` im FaithPath-Repository; dessen `cd oliva` ist für dieses Standalone-Projekt nicht erforderlich.

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

**Tatsächliche 0.6-Nachweise:** 75 Fach-/Persistenztests bestanden. Der vollständige Browserlauf bestand 51/52 Fälle; nach ausschließlicher Testsynchronisierung bestanden 11/11 betroffene Capture-/Readerfälle am unveränderten Produktbuild. Die Vereinigung deckt alle 52 unterschiedlichen Szenarien ab. Es gab **keinen** neuen einzelnen grünen 52/52-Gesamtlauf. Die sieben Buchschwertfälle bestanden sowohl gezielt als auch im späteren vollständigen Lauf. Details: [Qualität und Abnahme](docs/05-validation.md), [Zusammenfassung 0.6](docs/evidence/session-06/validation-summary.json). Frühere 0.5-Belege bleiben unverändert unter `docs/evidence/session-05/` erhalten.

Der erfolgreiche [GitHub-CI-Lauf 42240609694](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42240609694) mit 64 Fachtests und 35 Browserfällen gehört ausschließlich zum historischen **0.4-Checkpoint**. 0.5 und 0.6 wurden lokal geprüft und nicht öffentlich gepusht.

Der tatsächliche 0.5→0.6-Workerwechsel ist mit einem separat erhaltenen 0.5-Export reproduzierbar. Er bewahrt sämtliche Zustandsdatensätze ohne Nutzdatenmigration und prüft die neue Buchroute samt PNG sowie alle sieben A51-Stadien offline:

```sh
node scripts/offline-upgrade-v06.mjs /absoluter/pfad/zum/0.5/dist dist
```

`scripts/offline-upgrade-v05.mjs` bleibt der historische 0.4→0.5-Versuch; `npm run test:upgrade` der ältere 0.3→0.4-Prüfablauf. Diese alten Skripte benötigen ihre passenden Kontroll-/Zielexporte. Keine echten persönlichen Browserdaten für technische Experimente löschen.

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

In beiden sind alle 98 nativen A51-PNGs und drei Johannes-PNGs bytegenau enthalten. A51-Webrenderer sowie große Schwertmaster und Promptmaterial sind ausgeschlossen. Das beweist Metro-Auflösung und Assetauslieferung, keine native Installation, Bilddecoderqualität, flüssige Animation oder Akkuleistung. Es wurden weder Simulatoren noch physische Geräte oder signierte APK/AAB/IPA geprüft. Frühere Hermes-Exporte sind separat historisch dokumentiert.

Für Installationspakete Xcode bzw. Android SDK/JDK konfigurieren, App-IDs prüfen, `npx expo prebuild` in einer Arbeitskopie ausführen und die nativen Projekte bauen. Alternativ ein eigenes EAS-Projekt mit den eigenen Konten konfigurieren. Signing, Geräteprüfung, Vertriebsrechte und öffentliche Freigabe bleiben erforderlich; dieses Projekt hat keinen automatischen Produktions-Deploy.

## Private Web-Paketierung

`npm run build` erzeugt `dist/` mit Manifest, Icons, Quellenhinweisen und Offlinepaket. `node scripts/package-private-preview.mjs /absoluter/site-projektpfad` verpackt diesen geprüften Export für einen bereits separat gebundenen privaten Sites-Quellordner. Das Skript veröffentlicht nichts und ändert keine Zugriffsrechte.

Das private Hostpaket benennt Assetpfade für den Dienst um. Es enthält nur eine `index.html`, da zwei HTML-Dateien im beobachteten Hosting den SPA-Fallback deaktivierten. Reviewvergleiche werden deshalb als SVG ausgeliefert. Die aktuelle [HTTP-Prüfung](docs/evidence/session-06/private-http-check.json) bestätigt **15 App-Routen sowie 98 App- und 42 Review-Dateien bytegenau**; anonym wird HTTP 401 geliefert. Der Bereitstellungsnachweis steht ebenfalls unter `docs/evidence/session-06/`. Diese HTTP-Prüfung ist keine zusätzliche Browser- oder Handyabnahme des gehosteten Links.

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
13. [Lieferstand und nächste Schritte](docs/delivery-status.md)
14. [Dauerhafter Fortsetzungsstand](RESUME.md)

Die A51-Originale, die eigene biblische Bildwelt und der Johannes-Pilot besitzen getrennte Herkunftsnachweise unter `art/a51/provenance.json`, `art/manifest.json` und `art/swords/pilot.json`. Übernommener FaithPath-A51-Code und A51-Bilder sind von OLIVAs MIT-Lizenz ausgenommen; die ausdrückliche Integrationserlaubnis ist keine allgemeine öffentliche Weiterveröffentlichungslizenz. Die öffentliche Bildfreigabe des Johannes-Piloten bleibt offen. Details: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Der aktuelle lokale Entwicklungsbranch heißt `feature/oliva-v06-book-identities-20261107` und hat keinen Remote. Der öffentliche Sicherungsbranch bleibt bei 0.4. Die nächste Iteration 0.7 zur Bearbeitung/Löschung eigener Vorhaben-Rückblicke mit sicherem sitzungsgebundenem Undo ist analysiert, **noch nicht implementiert**. Die vorbereiteten Supabase-Migrationen sind kein aktiver Cloudbetrieb. Persönliche Daten und Exporte sind lokal und unverschlüsselt. Native Geräteabnahme, unabhängige Inhalts-/Bildprüfung, Anfänger-Usability, weitere Buchschwertillustrationen, optionale Dienste und die Gesamtfreigabe bleiben offen.
