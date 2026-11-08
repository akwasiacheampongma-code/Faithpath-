# OLIVA · Raum für deinen Glauben

Eigenständige Bibel- und Glaubens-App mit Expo, React Native und TypeScript. **Version 0.5.0 mit dem originalen A51-Olivenbaum ist privat verfügbar.** FaithPath und `main` bleiben unverändert; der vollständige Master-Prompt ist noch nicht abgeschlossen.

## Auf dem Handy ansehen

[Private OLIVA-Vorschau öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site) und mit dem berechtigten ChatGPT-Eigentümerkonto anmelden. Die URL enthält weiterhin `v04`; seit dem 6. November 2026 wird dort **0.5.0** ausgeliefert. Es gibt keine öffentliche Freigabe.

Der A51-Baum steht auf **Heute** und groß unter **Mein Garten**. **„Alle sieben Lebensbilder ansehen“** öffnet die vollständige Reihe, ohne den persönlichen Fortschritt zu ändern. Der [private Vorher-/Nachher-Vergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg) zeigt echte Browseraufnahmen aller sieben Stadien. Manifest, Icons und Offlinepaket sind enthalten; eine Installation auf einem echten Smartphone wurde noch nicht geprüft.

Nach **„Für den Offline-Neustart bereit.“** ist das Paket für den geladenen Build im Browsercache vollständig. Persönliche Einträge bleiben im jeweiligen Browser/Gerät; eine Cloud-Synchronisierung ist nicht aktiviert. Der Hosting-Zugang erfordert das berechtigte Konto, der lokal gestartete App-Kern keine Registrierung.

## Vorhandene Bereiche

- **Bibel:** gemeinfreie Lutherbibel 1912 mit 66 Büchern, 1.189 Kapiteln und 31.102 Versen; Navigation, Volltextsuche, zwei Lesemodi, Lesezeichen, Markierungen, Notizen, Schrift-/Abstandseinstellungen und präzise Versfortsetzung.
- **Wege:** neun geführte Reisen mit je drei Schritten, verständlichen Einordnungen, freiwilliger Reflexion und optionalem Gebet. Neun Textfragen nennen tatsächliche Verse als Beleg. Die Pilotredaktion wird thematisch wiederverwendet; eine unabhängige Fachfreigabe steht aus.
- **Garten:** sieben unveränderte A51-Originalillustrationen, lebendige Webdarstellung, separater nativer PNG-Ebenenadapter, statische Fallbacks, reduzierte Bewegung und eine Galerie. Der Baum bewertet keinen Glauben und verliert in Pausen keine Blätter.
- **Buchschwerter:** 66 bestehende Themenidentitäten und individuelle parametrische Vektoren mit realem Kapitelverlauf. Ein neuer, tatsächlich generierter Johannes-Bildpilot ist unter `art/swords/` dokumentiert, aber noch nicht in die App integriert.
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
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright nutzt `/usr/bin/chromium`, wenn vorhanden, oder seinen installierten Browser. `CHROMIUM_PATH` kann einen anderen lokalen Pfad angeben. Der Testserver startet auf Port 4173, sofern dort noch kein Vorschauprozess läuft. Während der Tests den gebauten `dist/`-Stand unverändert lassen.

**Tatsächliche 0.5-Nachweise:** 72 Fach-/Persistenztests bestanden. Der vollständige Browserlauf vor einer isolierten Webkorrektur bestand 44/45 Fälle; danach bestanden alle fünf betroffenen A51-Fälle. Die Vereinigung dieser Belege deckt 45 verschiedene Szenarien ab. Es gab **keinen** neuen einzelnen grünen 45/45-Gesamtlauf nach dem Fix. Details und Rohberichte: [Qualität und Abnahme](docs/05-validation.md), [Zusammenfassung 0.5](docs/evidence/session-05/validation-summary.json).

Der erfolgreiche [GitHub-CI-Lauf 42240609694](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/42240609694) mit 64 Fachtests und 35 Browserfällen gehört ausschließlich zum historischen **0.4-Checkpoint**. 0.5 wurde lokal geprüft und nicht öffentlich gepusht.

Der tatsächliche 0.4→0.5-Workerwechsel mit Datenerhalt und sieben Offline-Baumstadien ist reproduzierbar mit einem separat erhaltenen 0.4-Export:

```sh
node scripts/offline-upgrade-v05.mjs /absoluter/pfad/zum/0.4/dist dist
```

`npm run test:upgrade` bleibt der ältere 0.3→0.4-Prüfablauf. Keine echten persönlichen Browserdaten für technische Experimente löschen.

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

In beiden sind alle 98 nativen A51-PNGs bytegenau enthalten und der Webrenderer ausgeschlossen. Das beweist Metro-Auflösung und Assetauslieferung, keine native Installation, Bilddecoderqualität, flüssige Animation oder Akkuleistung. Es wurden weder Simulatoren noch physische Geräte oder signierte APK/AAB/IPA geprüft. Frühere Hermes-Exporte sind separat historisch dokumentiert.

Für Installationspakete Xcode bzw. Android SDK/JDK konfigurieren, App-IDs prüfen, `npx expo prebuild` in einer Arbeitskopie ausführen und die nativen Projekte bauen. Alternativ ein eigenes EAS-Projekt mit den eigenen Konten konfigurieren. Signing, Geräteprüfung, Vertriebsrechte und öffentliche Freigabe bleiben erforderlich; dieses Projekt hat keinen automatischen Produktions-Deploy.

## Private Web-Paketierung

`npm run build` erzeugt `dist/` mit Manifest, Icons, Quellenhinweisen und Offlinepaket. `node scripts/package-private-preview.mjs /absoluter/site-projektpfad` verpackt diesen geprüften Export für einen bereits separat gebundenen privaten Sites-Quellordner. Das Skript veröffentlicht nichts und ändert keine Zugriffsrechte.

Das private Hostpaket benennt Assetpfade für den Dienst um. Es enthält nur eine `index.html`, da zwei HTML-Dateien im beobachteten Hosting den SPA-Fallback deaktivierten. Der Reviewvergleich wird deshalb als SVG ausgeliefert. Die bestehende private Version besteht authentifizierte HTTP-Prüfungen für 13 Routen, 94 App-Dateien und 33 Review-Dateien; anonym wird HTTP 401 geliefert. Diese HTTP-Prüfung ist keine zusätzliche Browser- oder Handyabnahme des gehosteten Links.

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
11. [Lieferstand und nächste Schritte](docs/delivery-status.md)
12. [Dauerhafter Fortsetzungsstand](RESUME.md)

Die A51-Originale und die eigene Bildwelt besitzen getrennte Herkunftsnachweise unter `art/a51/provenance.json` und `art/manifest.json`. Übernommener FaithPath-A51-Code und A51-Bilder sind von OLIVAs MIT-Lizenz ausgenommen; die ausdrückliche Integrationserlaubnis ist keine allgemeine öffentliche Weiterveröffentlichungslizenz. Details: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Der aktuelle lokale Entwicklungsbranch heißt `feature/oliva-v05-a51-private-20261106` und hat keinen Remote. Der öffentliche Sicherungsbranch bleibt bei 0.4. Die vorbereiteten Supabase-Migrationen sind kein aktiver Cloudbetrieb. Persönliche Daten und Exporte sind lokal und unverschlüsselt. Native Geräteabnahme, unabhängige Inhalts-/Bildprüfung, Anfänger-Usability, weitere Buchschwertillustrationen, optionale Dienste und die Gesamtfreigabe bleiben offen.
