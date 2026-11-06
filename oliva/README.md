# OLIVA · Raum für deinen Glauben

Eigenständige lokale Bibel- und Glaubens-App auf Expo / React Native / TypeScript. Entwickelt in einem separaten Projekt; die bestehende FaithPath-App wurde nicht verändert.

**Stand: ausführbarer lokaler Kern 0.4.0, keine abgeschlossene Gesamtfreigabe.** 66 Bibelbücher, Reader, neun geführte Wege, sieben Baumstadien, 66 Buchschwert-Identitäten, Sammlung und Sicherungen sind implementiert. Persönliche Vorhaben haben eigene Schritte, Archiv, bewahrte Rückblicke und dauerhafte Entwürfe. Der bestätigte FaithPath-V5-Import bietet Vorschau, Originalarchiv und atomare Rückkehrsicherung. Version 0.4 bewahrt zusätzlich die kleinen Eingaben im Hub, Garten, Reader und Lernweg, trennt große Originalarchive vom Speicherdokument und ergänzt freiwillige Textfragen sowie vier illustrierte Erzählpiloten. Cloud-Sync, KI-Begleiter, Audio, vollständige FaithPath-Parität und fachlich freigegebene Kapitelredaktion bleiben offen. Maßgeblich ist [docs/delivery-status.md](docs/delivery-status.md).

## Version 0.4 ausprobieren

Eine Tagesreflexion, Gartenerfahrung, Versnotiz oder Weg-Reflexion beginnen und den Bereich wechseln: **Sammlung → Entwürfe** führt zur richtigen Quelle zurück. Erst die ausdrückliche Aktion erzeugt einen fertigen Eintrag. Bei Speicherfehlern bleiben letzte Worte innerhalb der Sitzung erreichbar und gesondert exportierbar; dieser RAM-Puffer überlebt keinen Prozessabbruch. Details: [Iteration 0.4](docs/08-continuity-and-offline.md).

Unter **Tiefer verstehen** gibt es freiwillige Textfragen mit Originalversen als Beleg, ohne Punkte oder Einfluss auf den Fortschritt. **Bibel → Eine Geschichte entdecken** öffnet vier neue Erzählpiloten. Illustration, Einordnung und Bibeltext bleiben unterscheidbar.

**Einstellungen → FaithPath-Daten mitnehmen:** V5-Datei auswählen, Ergänzungen und Konflikte prüfen, ausdrücklich übernehmen. Die Originalquelle bleibt einsehbar und exportierbar. Historische Quellen erscheinen am importierten Vorhaben. Die Rückkehr zum Stand vor dem letzten Import wird separat bestätigt. OTB-Stellen werden nicht als Lutherbibel ausgegeben. Limits: 10 MiB Quelle, 64 MiB gesamte OLIVA-Sicherung. Details: [Importvertrag und Grenzen](docs/07-faithpath-import.md).

Im Bereich **Wege → Deine persönlichen Vorhaben** kannst du ein eigenes Anliegen anlegen, kleine Schritte ergänzen und später darauf zurückblicken. In der **Sammlung** bleiben Journalentwürfe auch nach einem Neustart erreichbar. Der [Iterationsbericht](docs/06-personal-and-drafts.md) erklärt Umfang, Datenmigration und Grenzen.

Im lokalen Arbeitsbereich liegt ein fertiger Webexport. Nach einem GitHub-Checkout zuerst wie unten bauen:

```sh
cd oliva
node scripts/serve.mjs dist
```

Danach http://localhost:4173 öffnen.

## Lokal starten

Nach Checkout liegt die App im Unterordner `oliva/`; im Arbeitsbereich dieser Sitzung unter `/workspace/faithpath-next`. Getestete Umgebung: Node 24.22.1, npm 11.9.0, Python 3 für die optionale Korpusprüfung. Kein Konto und keine API-Schlüssel nötig.

```sh
cd oliva
npm ci
npm run build
npm run preview
```

Öffnen: http://localhost:4173. Der Web-Build wird für Offline-Nutzung vollständig vorgeladen; der erste Aufruf braucht den lokalen Server. Sobald „Für den Offline-Neustart bereit.“ erscheint, ist das vollständige Paket für genau diesen Build installiert und der Kern funktioniert bei abgeschaltetem Netz. Ein Web-Service-Worker benötigt HTTPS oder localhost, nicht `file://`.

Entwicklungsmodus:

```sh
npm run web
```

Web-Entwicklung unter http://localhost:8081. Der Service Worker wird nur im Produktionsbuild registriert. Ein echter Update-Test mit getrenntem 0.3-Kontrollbuild ist über `npm run test:upgrade -- /absoluter/pfad/zum/v0.3/dist` reproduzierbar. Für isolierte technische Experimente einen frischen Browserkontext verwenden. Niemals echte persönliche Daten für technische Experimente löschen.

Für dieses eingeschränkte Arbeitsumfeld kann npm einen Cache unter `/tmp` verwenden:

```sh
npm --cache /tmp/faithpath-npm ci
```

## Prüfen

```sh
npm run content:check
npm run content:art
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
8. [FaithPath-V5-Import, Quellen und Rückkehr](docs/07-faithpath-import.md)
9. [Entwürfe, Archiv-Blobs und Offline-Updates](docs/08-continuity-and-offline.md)
10. [Lieferstand und nächste Schritte](docs/delivery-status.md)

Screenshots: `docs/evidence/screens/`. Art-Provenienz: `art/manifest.json`. Schriften und Bibelrechte: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Persönliche Texte bleiben lokal und sind nicht zusätzlich verschlüsselt. Ein OLIVA-Restore ersetzt den lokalen Bestand erst nach ausdrücklicher Bestätigung. Der gesonderte FaithPath-V5-Import ergänzt ihn und bewahrt die Originalquelle. **Repository-Checkpoint:** Branch `feature/oliva-next-v02-20261106`, eigenständige Anwendung in `oliva/`. Dort `npm ci`, `npm run build`, `npm run preview` ausführen. Der Fortsetzungsstand steht in [RESUME.md](RESUME.md). Der zusätzliche Root-Workflow `.github/workflows/oliva-quality.yml` ruft die gemeinsame OLIVA-Qualitätsaction auf dem Sicherungsbranch auf. Bestehende FaithPath-Workflows bleiben unverändert. Der enthaltene Standalone-Workflow funktioniert in einem eigenen Repository. Ein tatsächlicher GitHub-Lauf wird gesondert im Prüfbericht belegt; kein automatisches Deployment.
