# OLIVA · Raum für deinen Glauben

Eigenständige lokale Bibel- und Glaubens-App auf Expo / React Native / TypeScript. Entwickelt in einem separaten Projekt; die bestehende FaithPath-App wurde nicht verändert.

**Stand: ausführbarer lokaler Kern, keine abgeschlossene Gesamtfreigabe.** 66 Bibelbücher, Reader, neun geführte Wege, sieben Baumstadien, 66 Buchschwert-Identitäten, Sammlung und Sicherungen sind implementiert. Version 0.2 ergänzt persönliche Vorhaben mit eigenen Schritten, Archiv und bewahrten Rückblicken sowie gesicherte Entwürfe für Journal und Vorhaben. Cloud-Sync, KI-Begleiter, Audio, vollständige FaithPath-V5-Parität und fachlich freigegebene Kapitelredaktion sind noch offen. Der maßgebliche Lieferstand steht in [docs/delivery-status.md](docs/delivery-status.md).

## Version 0.2 ausprobieren

Im Bereich **Wege → Deine persönlichen Vorhaben** kannst du ein eigenes Anliegen anlegen, kleine Schritte ergänzen und später darauf zurückblicken. In der **Sammlung** bleiben Journalentwürfe auch nach einem Neustart erreichbar. Der [Iterationsbericht](docs/06-personal-and-drafts.md) erklärt Umfang, Datenmigration und Grenzen.

Für die bereits enthaltene Webvorschau genügt Node; eine Installation der Entwicklungsabhängigkeiten ist zum bloßen Ansehen nicht nötig:

```sh
cd faithpath-next
node scripts/serve.mjs dist
```

Danach http://localhost:4173 öffnen.

## Lokal starten

Getestete Umgebung: Node 24.22.1, npm 11.9.0, Python 3 für die optionale Korpusprüfung. Kein Konto und keine API-Schlüssel nötig.

```sh
cd faithpath-next
npm ci
npm run build
npm run preview
```

Öffnen: http://localhost:4173. Der Web-Build wird für Offline-Nutzung vollständig vorgeladen; der erste Aufruf braucht den lokalen Server. Nach abgeschlossener Service-Worker-Installation funktioniert der Kern auch bei abgeschaltetem Netz. Ein Web-Service-Worker benötigt HTTPS oder localhost, nicht `file://`.

Entwicklungsmodus:

```sh
npm run web
```

Web-Entwicklung unter http://localhost:8081. Der Service Worker wird nur im Produktionsbuild registriert. Bei Wechseln zwischen alten lokalen Builds ggf. einen frischen Browserkontext verwenden. Niemals echte persönliche Daten für technische Experimente löschen.

Für dieses eingeschränkte Arbeitsumfeld kann npm einen Cache unter `/tmp` verwenden:

```sh
npm --cache /tmp/faithpath-npm ci
```

## Prüfen

```sh
npm run content:check
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright verwendet einen vorhandenen Chromium unter `/usr/bin/chromium` oder seinen installierten Browser. `CHROMIUM_PATH` kann einen anderen lokalen Browserpfad angeben. Der Testserver startet automatisch, wenn Port 4173 nicht bereits durch die Vorschau belegt ist. Aktuelle Messergebnisse stehen in [docs/05-validation.md](docs/05-validation.md).

Der Bibelimport ist deterministisch und ohne Netz wiederholbar:

```sh
npm run content:import
npm run content:check
```

Die enthaltene Original-USFM-Datei wird dabei geparst; es werden keine Bibeltexte generiert. Abnahme: 66 Bücher, 1.189 Kapitel, 31.102 Verse, keine doppelten Versschlüssel und keine verbliebenen Strong-Markierungen.

## iOS und Android

```sh
npm start
npm run android
# auf einem Mac mit Xcode:
npm run ios
```

Ein Gerät/Emulator muss zur installierten Expo-SDK-Version passen. Ist die installierte Expo-Go-App nicht kompatibel, einen Development Build mit passender nativer Toolchain erzeugen. In dieser Umgebung wurden keine physischen Geräte, signierten IPA/APK-Dateien oder Store-Uploads vorgetäuscht.

Native JavaScript-/Asset-Bundles ohne Signierung:

```sh
node scripts/expo.mjs export --platform android --output-dir dist-android
node scripts/expo.mjs export --platform ios --output-dir dist-ios
```

Für tatsächliche Installationspakete: Xcode bzw. Android SDK/JDK konfigurieren, App-IDs prüfen, `npx expo prebuild` in einer Arbeitskopie ausführen und anschließend die nativen Projekte lokal bauen. Alternativ EAS-Projekt mit eigenen Konten konfigurieren (`eas build:configure`, `eas build --platform ...`). Signing, Store-Metadaten, Datenschutzangaben, Rechtefreigaben und Geräteabnahme müssen vor Veröffentlichung abgeschlossen sein. Es gibt in diesem Projekt keinen automatischen Produktions-Deploy.

## Web bereitstellen

`npm run build` erzeugt `dist/`. Diesen Ordner auf einem HTTPS-Static-Host mit SPA-Fallback auf `index.html` bereitstellen. Hash-Dateien mit Kompression ausliefern; `sw.js` und `index.html` dürfen nicht unveränderlich gecacht werden. Unbekannte Asset-Pfade müssen echte 404-Antworten erhalten. Quellen, Fonts, Bibel und Bildvarianten sind lokal enthalten. Der Vorschau-Server ist kein vollständig gehärteter Produktionsserver.

Die Cloud-Migrationen unter `database/migrations/` sind **Vorbereitung für einen optionalen Dienst**. Sie werden nicht vom App-Start ausgeführt. Kein Supabase-Projekt oder KI-Key wird für den lokalen Kern benötigt. Das Cloud-Schema wurde nicht gegen eine Live-Instanz abgenommen.

## Dokumentation

1. [FaithPath-Analyse und Feature-Matrix](docs/00-faithpath-audit.md)
2. [Konkurrenz, USP und Roadmap](docs/01-product-and-competition.md)
3. [Informationsarchitektur und Designsystem](docs/02-ux-and-design.md)
4. [Architektur und Entscheidungen](docs/03-architecture.md)
5. [Bildwelt und Rechte](docs/04-art-direction-and-rights.md)
6. [Prüfungen und offene Abnahmen](docs/05-validation.md)
7. [Persönliche Vorhaben und gesicherte Entwürfe](docs/06-personal-and-drafts.md)
8. [Lieferstand und nächste Schritte](docs/delivery-status.md)

Screenshots: `docs/evidence/screens/`. Art-Provenienz: `art/manifest.json`. Schriften und Bibelrechte: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Persönliche Texte bleiben lokal und sind nicht zusätzlich verschlüsselt. Die App bietet Export und geprüfte Wiederherstellung; ein Restore ersetzt den lokalen Bestand erst nach einer ausdrücklichen Aktion. Der neue Sicherungstyp ist nicht automatisch kompatibel mit FaithPath V5.
