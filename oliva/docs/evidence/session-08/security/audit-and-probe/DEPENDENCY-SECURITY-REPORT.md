# OLIVA 0.8 – Dependency Security Audit

**Nachtrag 08:36 UTC:** Ein anschließend ausdrücklich autorisierter isolierter Vollfix-Probelauf ist erfolgreich abgeschlossen. Audit 0, Typecheck, 116 Unit-Tests, Web-/Android-/iOS-JS-Exporte und 7 echte API-/Fingerprint-Prüfgruppen bestehen. Die ursprünglichen Source-Root-Manifeste bleiben bytegleich. Ergebnis und Grenzen: [OVERRIDE-PROBE-REPORT.md](probe/OVERRIDE-PROBE-REPORT.md). Die nachstehenden Aussagen zu fehlender Implementierung/Validierung beschreiben die ursprüngliche Read-only-Auditphase.

Stand: 2026-11-08 UTC. Read-only geprüft: `/workspace/faithpath-next`, Branch `feature/oliva-v08-biblical-stories-20261108`, HEAD `f0e8db6b2847d5bfc8361e8f617b8caf0c860787`, uncommittierter Arbeitsstand 0.8.0. Node `24.22.1`, npm `11.9.0`. Die exakten Manifest-/Lock-Digests und Befehlsstatus stehen in `audit-metadata.json`.

## Ergebnis und Entscheidung

Der echte aktuelle `npm audit --json` meldet **5 moderate, 0 high, 0 critical**. `npm audit --omit=dev --json` meldet dasselbe. Beide Befehle enden mit Status 1 wegen vorhandener Funde. Es sind **zwei eigenständige Advisories**, die npm zusätzlich auf die drei übergeordneten Expo-Pakete hochrechnet.

Für den vorgesehenen privaten statischen PWA-Export ergibt sich aus diesen zwei Funden **kein nachgewiesener Browser-Runtime-Blocker und kein Grund, die bereits beauftragte öffentliche GitHub-Quellcodesicherung zu blockieren**. Die betroffenen Funktionen gehören zu Node-Dateisystem-/Buildwerkzeugen; für lokale Nutzerimporte oder PWA-HTTP-Anfragen wurde kein Weg zu diesen Funktionen gefunden. Ein npm-`prod`-Label allein beweist keine Browser-Erreichbarkeit.

Die Toolchain enthält trotzdem echte verwundbare Versionen. Statische Ausgabe senkt die Auslieferungsoberfläche, **patcht die Entwickler-/CI-Abhängigkeiten aber nicht**. Es gibt aktuell keinen vollständig behobenen, ausschließlich in Expo58s vorhandenen semver-Ranges bleibenden Updatepfad. Alle Aussagen beziehen sich auf diese beiden Dependency-Advisories; dies ist keine allgemeine Sicherheitsfreigabe des gesamten Produkts.

## Konkrete Funde

| Paket im Lock | Advisory / CVE | Ursache / Bedingung | Fixlage |
| --- | --- | --- | --- |
| `glob@13.0.6` | [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), CVE-2026-118773; CVSS4 6.3 | Abgebrochener Glob-Walk arbeitet nach `AbortSignal`-/Timeout-Rejection weiter. Verfügbarkeit betroffen; kein beobachteter Vertraulichkeits-/Integritätseffekt. Relevant bei angreiferbeeinflussten Patterns/Verzeichnisbäumen und signalbasierter Begrenzung. | Advisory nennt `14.0.2` als ersten Fix. **Zusätzlich verifizierter `13.0.7`-Backport**, mit bestehenden `^13.0.0`-Ranges kompatibel. Aktuelle Advisory-Range `>=9.0.0 <=14.0.1` schließt den Backport noch nicht aus; Audit kann weiter anschlagen. |
| `minimatch@10.2.6` | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), CVE-2026-118764; CVSS4 6.9 | Angreiferkontrolliertes Glob-Pattern mit `optimizationLevel >= 2` kann `globParts` verstärken und quadratische Verarbeitung auslösen: CPU-/Speicher-DoS. | Erster deklarierter Fix `11.0.1`; aktuell `11.0.5`. Kein veröffentlichter Fix im 10er-Zweig. |

Die npm-Summary zählt `expo`, `@expo/cli`, `@expo/fingerprint`, `glob`, `minimatch`. Die drei Expo-Pakete haben hier keine zusätzlichen unabhängigen Advisory-IDs.

```text
oliva-faith-companion@0.8.0
└─ expo@58.0.23
   ├─ @expo/cli@58.1.19                 [glob: ^13.0.0]
   │  └─ glob@13.0.6
   │     └─ minimatch@10.2.6            [^10.2.2]
   └─ @expo/fingerprint@0.21.9          [glob: ^13.0.0; minimatch: ^10.2.2]
      ├─ glob@13.0.6                   [dedupliziert]
      └─ minimatch@10.2.6               [dedupliziert]
```

Expo führt CLI und Fingerprint in seinen regulären `dependencies`. Deshalb verschwinden die Funde bei `--omit=dev` nicht. Die tatsächliche Dependency-Auflösung wurde mit `npm ls ... --all --json` und den Lock-Einträgen gegengeprüft.

## Erreichbarkeit im aktuellen Produkt und in den Werkzeugen

- `app.json` nutzt `web.output: "single"`; der Build exportiert Web-Dateien und erzeugt danach PWA-/Offline-Artefakte. Keine Expo-Serverausgabe oder React-Server-Funktionen sind aktiviert.
- In App-/Produktcode wurde kein Import von `glob`, `minimatch`, `@expo/fingerprint` oder `@expo/cli` gefunden. Der lokale Preview-Server verwendet nur Node-Bordmittel. Die Nutzerimporte der App rufen diese Buildwerkzeuge nicht auf.
- Expo-Router-Dateisuche verwendet `glob.sync()` mit konstanten Mustern wie `**/*.@(ts|tsx|js|jsx)` und Quellverzeichnissen. Dies ist eine lokale Build-/Dev-Surface, kein Nutzer-Endpunkt für frei gewählte Glob-Patterns.
- Die Expo-TypeScript-Prüfung enthält einen echten `glob()`-Aufruf mit `AbortSignal.timeout(5000)`. **Beim aktuellen vorhandenen `tsconfig.json` wird diese Dateisuche übersprungen.** Der verwundbare Fallback bleibt in der installierten CLI enthalten. Ein weiterer `globStream()`-Helper mit AbortController wurde deklariert, aber im installierten CLI-Code nicht aufgerufen gefunden.
- `glob@13` setzt für Patterns und Ignore-Muster explizit `optimizationLevel: 2`. Das erfüllt die technische Minimatch-Voraussetzung; für die beobachteten konstanten Muster wurde aber keine Quelle angreiferkontrollierter Patterns gefunden. Ein bösartiger Quellbaum oder eine künftig hinzugefügte freie Pattern-API verändert die Bewertung.
- Fingerprint liest lokale `.fingerprintignore`-/Options-Muster. Sein direkter `new Minimatch(..., {dot:true})`-Aufruf verwendet den Default `optimizationLevel: 1` und erfüllt damit diese spezielle DoS-Voraussetzung nicht. Fingerprints können bei nativen Build-Caches berechnet werden; der aktuelle Web-Build fordert dies nicht direkt an.

Diese Bewertung beruht auf installierten Quellcodepfaden und Projektkonfiguration. Es wurde kein Exploit-/Lasttest ausgeführt und kein vollständiger dynamischer Funktionsaufruf-Trace behauptet. Belege mit Zeilenangaben: `reachability-evidence.md`.

## Kleinste Fix-Scope-Empfehlung

1. **Kleinster risikoarmer Teilfix:** gezielt nur `glob` von `13.0.6` auf `13.0.7` neu auflösen. Das liegt in den vorhandenen Expo58-Ranges, enthält den offiziellen Abort-Fix-Backport und benötigt keinen Override. Kein `--force`, keine React-/RN-/Expo-Majoränderung. Minimatch bleibt offen; ein weiterhin roter npm-Audit bedeutet hier außerdem nicht automatisch, dass der Abort-Backport wirkungslos ist.
2. **Vollfix-Kandidat für separate Implementierung/Prüfung:** gekoppelte, auf die tatsächlichen Eltern begrenzte Overrides `@expo/cli -> glob@14.0.4` und `@expo/fingerprint -> glob@14.0.4 + minimatch@11.0.5`. Node24.22.1 erfüllt die Engines; React19.3/RN0.88.1/Expo58 bleiben unverändert. Diese transitiven Majorwechsel liegen aber außerhalb Expo58s deklarierten Ranges. **SDK58-Kompatibilität wurde damit noch nicht bewiesen.**
3. **Kein minimatch11-Override unter glob13.** Die APIs passen nicht: Glob13 erwartet in `Minimatch.set` Regex-Einträge (`instanceof RegExp`), Minimatch11 liefert `Matcher`. Erst Glob14 wurde darauf umgestellt. Eine solche Einzeländerung kann Dateisuche leise verfälschen.
4. **Kein `npm audit fix --force`.** npm schlägt derzeit `expo@53.0.11` als semver-major Änderung vor. Das ist ein ungeeigneter SDK-Downgrade für diese Expo58/RN0.88.1-App.

Expo58.0.23, CLI58.1.19 und Fingerprint0.21.9 sind nach Registry-Abgleich bereits aktuell. Ein gewöhnliches Expo58-Patchupdate behebt daher momentan nicht beide Funde. Bis zu einem unterstützten Upstream-Fix ist der dokumentierte Betrieb mit vertrauenswürdigem Build-Eingang und ausschließlich statischer PWA-Ausgabe eine sachlich begründbare Minderung; eine neue Server-/Pattern-API braucht eine erneute Bewertung.

Bei Übernahme des vollständigen Kandidaten sind aufgelöster Dependency-Baum und Audit, Typecheck/Unit, PWA-Build/Browser-/Offline-Prüfung sowie ein gezielter Fingerprint-Test mit tatsächlichen Ignore-Patterns nötig. Vorhandene grüne 0.7-CI beweist keine 0.8-Override-Kompatibilität. Es wurde hier weder installiert noch ein Fix umgesetzt.

Details, Primärbelege und reviewbarer Override-Vorschlag: `OFFICIAL-ADVISORIES-AND-FIX-SCOPES.md`.

## Separater GitHub-Actions-Node24-Hinweis

Die vier bestehenden OLIVA-Action-Pins deklarieren in ihren eigenen `action.yml` Dateien noch `node20`. `setup-node` mit `node-version: "24"` setzt die Projektlaufzeit; es ändert die Laufzeit der Action selbst nicht. Der CI-Hinweis ist daher plausibel und getrennt vom npm-Baum zu beheben.

Offizielle aktuelle Releases, jeweils öffentlich per GitHub-Release -> Tag -> Commit -> `action.yml` (`using: node24`) read-only verifiziert:

| Action | Aktuelle offizielle Release | Verifizierter Commit |
| --- | --- | --- |
| `actions/checkout` | [v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node` | [v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0) | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| `actions/setup-python` | [v7.1.0](https://github.com/actions/setup-python/releases/tag/v7.1.0) | `6d4fd22b20465ccc0f7354476588e8df7c9ca0e0` |
| `actions/upload-artifact` | [v7.0.2](https://github.com/actions/upload-artifact/releases/tag/v7.0.2) | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |

Diese Tabelle ist ein Pin-Upgrade-Vorschlag für eigene OLIVA-Actions, kein durchgeführter CI-Lauf. Major-Actionänderungen müssen anhand Releasehinweisen/Inputs und einem frischen OLIVA-Lauf geprüft werden. Keine ursprünglichen FaithPath-Workflows wurden verändert. Rohbelege: `github-actions-runtime-verification.json` und gespeicherte aktuelle/neue Actiondefinitionen.

## Belegumfang und Unverändertheit

Die Arbeit verwendete npm-Audit/Dependency-Lesebefehle und öffentliche GET-Abfragen gegen npm/GitHub über die vorhandenen Proxy-/CA-Einstellungen. Cloud-Runtime-Skill sowie Package-/Networking-Referenzen wurden berücksichtigt; aktueller Netzwerkstatus war enforced, observations_current true. Keine Packageinstallation, kein Produkt-/Lock-/Config-Fix, kein Zugriff auf Tokenwerte oder Credential-Konfigurationen und keine GitHub-Ref-/Deployment-Mutation. Berichtsdaten liegen ausschließlich außerhalb des Source-Repos unter `/workspace/oliva-security-audit/reports/dependencies-0.8/`; npm-Caches unter `/tmp`.

Die App wird parallel weiterentwickelt. Die Versionen/Digests in `audit-metadata.json` grenzen den geprüften Dependency-Stand ab; spätere Manifest-/Lockänderungen erfordern einen neuen Audit.
