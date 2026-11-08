# OLIVA – isolierter Vollfix-Probelauf

Prüfungen abgeschlossen 2026-11-08 um 08:36 UTC, Bericht finalisiert um 08:37 UTC. Gesamtumfang ungefähr sieben Minuten. **Der gekoppelte Override-Kandidat besteht den begrenzten Linux-/Node24-Funktionsnachweis.** npm Audit ist mit und ohne Dev-Abhängigkeiten bei 0, Typecheck und 116 Unit-Tests bestehen, Web-/PWA-/Android-/iOS-JS- und Assetexporte gelingen. Echte Fingerprint-Aufrufe sind deterministisch und gegenüber dem Altbaum auf demselben Hauptinput identisch.

Das ist eine belastbare Grundlage für die Entscheidung zur Übernahme und anschließende vollständige 0.8-Browser-/Offline-Abnahme. Es ist keine offizielle Expo58-Unterstützungszusage und keine native Geräte-/Windows-Freigabe.

## Isolierung und geprüfte Konfiguration

- Probe: `/workspace/oliva-dependency-probe`, neu erzeugt per `git archive f0e8db6b2847d5bfc8361e8f617b8caf0c860787` aus `/workspace/faithpath-next`.
- Immutable Quelle: Version 0.7.0 mit Expo58.0.23, CLI58.1.19, Fingerprint0.21.9, React19.3.0, RN0.88.1, TypeScript6.0.3. Laufzeit Node24.22.1/npm11.9.0.
- Alle 727 archivierten Dateien wurden am Ende gegen den Commitinhalt verglichen. Genau `package.json` und `package-lock.json` unterscheiden sich; alle 169 archivierten Assetdateien sind bytegleich. Zusätzliche Builds und `.expo`-Dateien liegen nur im Probeprojekt.
- Registry `https://registry.npmjs.org`; Cache `/tmp/oliva-npm-probe-cache`; Proxy-/CA-Einstellungen geerbt, TLS-Prüfung aktiv. Package-Installationsreferenz vor Installation gelesen.
- Nach der Installation nutzen die Prüfbefehle ein eigenes `TMPDIR=/tmp/oliva-dependency-probe-tmp`. Keine GitHub-/Sites-/Store-Mutationen, kein `--force`, kein SDK-Downgrade.

Einziger Manifestzusatz:

```json
{
  "overrides": {
    "@expo/cli": { "glob": "14.0.4" },
    "@expo/fingerprint": { "glob": "14.0.4", "minimatch": "11.0.5" }
  }
}
```

Glob14 zieht selbst einen passenden Minimatch11-Zweig. Es wurde **kein Minimatch11 unter Glob13 erzwungen**. `npm ls --all --json` endet mit 0 und zeigt die gewünschte Overrideauflösung.

Versionsdelta des gesamten Locks:

| Paket | Vorher | Probe |
| --- | --- | --- |
| glob | 13.0.6 | 14.0.4 |
| minimatch | 10.2.6 | 11.0.5 |
| path-scurry | 2.0.2 | 3.0.0 |
| @isaacs/nonrecursive-glob-match | nicht vorhanden | 1.1.0 |

Keine andere Paketversion wurde verändert; insbesondere Expo/React/RN bleiben gleich. Der Probe-Lock behält die Projektversion 0.7.0. Bei Übernahme in 0.8 sollen nur die Overrides und deren Dependency-Auflösung übertragen werden, nicht unbesehen das gesamte 0.7-Manifest.

## Tatsächliche Prüfergebnisse

| Prüfung | Ergebnis | Dauer / Umfang |
| --- | --- | --- |
| Lock erzeugen, danach `npm ci` | Exit 0 | 586 installierte Pakete, 23 s |
| `npm audit --json` | Exit 0, alle Severity-Zähler 0 | offizielles Registry-Audit |
| `npm audit --omit=dev --json` | Exit 0, alle Severity-Zähler 0 | nach den Exporten |
| `npm run typecheck` | Exit 0 | 9,7 s |
| Unit-Tests | Exit 0, **116/116 bestanden** | 15,7 s |
| Projekt-Web-/PWA-/Offlinebuild | Exit 0 | 46,5 s; Web 1069 Module, Offlinepaket 95 Dateien |
| Android-JS-/Assetexport | Exit 0 | 31,4 s; 1630 Module, 146 Assetreferenzen |
| iOS-JS-/Assetexport | Exit 0 | 39,5 s; 1635 Module, 143 Assetreferenzen |
| Native Exportintegrität | bestanden | alle Assetreferenzen vorhanden; beide JS-Bundles bestehen `node --check`; je Plattform 98 A51-Native-Dateien im Assetmap |
| API-/Fingerprint-Harness | Exit 0, **7/7 Prüfgruppen bestanden** | echte Fingerprint-Sources, Altbaumvergleich, Matcher-/Abbruchprüfungen |

Native Exporte liefen nacheinander als:

```text
node scripts/expo.mjs export --platform android --output-dir /workspace/oliva-dependency-probe/dist-android --no-minify --no-bytecode --max-workers 2 --dump-assetmap
node scripts/expo.mjs export --platform ios --output-dir /workspace/oliva-dependency-probe/dist-ios --no-minify --no-bytecode --max-workers 2 --dump-assetmap
```

Dies erzeugt JS und Assets ohne native SDK-Kompilierung. Die erwartete Expo-Meldung zum deaktivierten Bytecode und Farbvariablen-Warnungen sind protokolliert; beide Exporte enden erfolgreich. Der Weblauf nutzte den normalen Projekt-Build. Sein zusätzlich angehängtes `--max-workers 2` erreicht aufgrund der npm-Scriptverkettung nur den letzten Offline-Schritt, begrenzt also nicht Metro; das Web-Ergebnis war dennoch erfolgreich. Es wurde deswegen kein unnötiger zweiter Build ausgeführt.

## Funktionsnachweis an den tatsächlichen API-Grenzen

Die echte öffentliche `@expo/fingerprint.createFingerprintAsync()`-API lief zweimal auf dem unveränderten Probe-Appinhalt mit normalen Default-Sources. Beide Aufrufe liefern `2fcfdb0604c9404081d557045f9426ceafb46cc5`, **33 aktive Sources**, darunter ExpoConfig, ConfigPlugins, Android-/iOS-Expo-Autolinking, Android-/iOS-RNCore-Autolinking, React Native und Package-Scripts.

Ein zusätzlicher Prozess verwendet die ursprünglichen Glob13-/Minimatch10-Module aus dem vorhandenen Altbaum, aber denselben immutable 0.7-Projektinput. Ergebnis: derselbe Hash, dieselben 33 Sources, **0 Source-Diffs**. Dafür wurde im ursprünglichen Projekt nichts installiert oder umgeschrieben.

Weitere tatsächliche Prüfungen:

1. Eigene Fixture: ignorierte Dateiinhalte verändern den Fingerprint nicht; eine inkludierte Datei ändert ihn und erzeugt genau eine geänderte Source. Dot-Dateien werden eingeschlossen, soweit der konkrete Ignorevertrag dies vorsieht.
2. Die Fingerprint-Helfer bestehen konkrete Dot-, Ignore-, Negation- und Extglobfälle mit ihren tatsächlichen Optionen.
3. `glob()`, `sync()` und `globStream()` liefern dieselben erwarteten Ergebnisse für ein Muster im Stil des Expo-TypeScript-/Router-Callers.
4. Begrenzter Abbruchtest mit einem kleinen eigenen Verzeichnisbaum: bei `glob()` und `globStream()` jeweils ein Read bis zur Rejection und **0 weitere Reads innerhalb der folgenden 100 ms**. Damit ist die hier relevante Abort-Fixwirkung funktional nachgewiesen.
5. Bekannte Major-Semantikänderungen werden nicht übergangen: Windows-Parent-Root- und leere optionale Extglobsegmente verhalten sich in bestätigten Beispielen unterschiedlich (`alt=true`, `neu=false`). Das ist ein verbleibender Kompatibilitätsaspekt, kein unterdrückter Testfehler.

Details und offizielle API-/Quellverweise: [FINGERPRINT-PROBE-REPORT.md](FINGERPRINT-PROBE-REPORT.md), Harness `fingerprint-api-probe.mjs`, Rohresultate `fingerprint-api-probe-results.json`.

## Verbleibende Grenzen und Übernahmeentscheidung

Die Override-Versionen überschreiten weiterhin Expo58s deklarierte Glob13-/Minimatch10-Ranges. Die geprüften echten Callerverträge unter Linux/Node24 funktionieren, einschließlich Web-/Android-/iOS-Bundling und Fingerprinting. Eine allgemeine oder zukünftige Expo58-Kompatibilität folgt daraus nicht.

Es wurden keine APK/IPA-Dateien kompiliert, keine native App auf einem Gerät ausgeführt und kein Windows-Dateisystem getestet. `platform: "win32"`-Matcherprüfungen auf Linux sind keine Windows-Buildfreigabe. Die vollständigen 0.8-E2E-/Browser-/Offline-Prüfungen bleiben nach Übernahme im aktuellen Arbeitsstand erforderlich; die Probe verwendet bewusst den eingefrorenen 0.7-Input.

**Empfehlung:** Der Root kann den gekoppelten scoped Kandidaten jetzt in 0.8 übernehmen und dort die bereits geplante volle Abnahme ausführen. Für die geprüften Pfade wurde kein Funktionsblocker gefunden. Ungepaarte/global erzwungene Minimatch11-Overrides bleiben ausgeschlossen.

## Source-Root-Integrität und Befehlsabweichung

Ein erster `npm install --package-lock-only --ignore-scripts` wurde versehentlich mit dem ursprünglichen Root als CWD ausgeführt. Sofort danach und erneut am Abschluss stimmen die SHA256-Digests von Root-`package.json`, `package-lock.json` und `app.json` exakt mit den Werten vor Beginn überein. Es wurden keine Rücksetz-/Korrekturschreibvorgänge am Root ausgeführt. Der Vorgang ist in `probe-metadata.json` dokumentiert; die anschließende Lockgenerierung und Installation liefen im korrekten Probe-CWD. Alle weiteren Befehle verwenden einen Runner mit fest gesetztem und geprüftem Probe-CWD.

Die Probe wurde nicht bereinigt und bleibt zur Review erhalten. Artefakte und Logs liegen unter diesem Auditordner, Exporte unter dem eigenen Probeprojekt. `probe-integrity.json` belegt Assetvollständigkeit, den genau abgegrenzten Source-/Lock-Unterschied und die unveränderten drei Root-Digests.
