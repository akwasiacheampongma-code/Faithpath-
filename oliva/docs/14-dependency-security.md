# Abhängigkeiten und CI-Laufzeit · OLIVA 0.8

Stand: 08.11.2026. OLIVA 0.8 verwendet gezielte, gekoppelte Overrides für zwei transitive Expo-Buildwerkzeuge. `npm ci` ist im aktuellen Projekt erfolgreich gelaufen; der anschließende tatsächliche `npm audit --json` meldet **0 Funde**. Der [Audit](evidence/session-08/dependency-audit-after.json) und der [Übernahmestand mit Manifest-/Lock-Hashes](evidence/session-08/security/adoption-snapshot.json) grenzen diesen Nachweis ab. Ein Audit ohne Funde ist keine allgemeine Sicherheitsfreigabe.

## Problem und Entscheidung

Der vorherige Lock enthielt `glob@13.0.6` und `minimatch@10.2.6`. npm meldete fünf moderate Pakete, aber nur zwei eigenständige Advisories: [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) betrifft fortgesetzte Dateisystemsuche nach einem Abbruch; [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) betrifft aufwendige Verarbeitung bestimmter angreiferkontrollierter Glob-Muster. Die weiteren drei npm-Einträge waren betroffene Elternpakete. Es gab keine High-/Critical-Funde.

Die betroffenen Aufrufer gehören zur lokalen Node-Buildtoolchain. Im statischen PWA-Produkt wurde kein Nutzerpfad zu diesen Funktionen gefunden. Weil Expo diese Werkzeuge als reguläre Abhängigkeiten führt, meldete auch `npm audit --omit=dev` die alten Funde. Die statische Auslieferung ersetzt keine Reparatur der Entwicklungs- und CI-Werkzeuge.

Expo 58.0.23, CLI 58.1.19 und Fingerprint 0.21.9 waren beim Registry-Abgleich aktuell. Ihre deklarierten Ranges verlangen weiterhin Glob 13 beziehungsweise Minimatch 10. Ein normales Expo-Patchupdate behob deshalb nicht beide Advisories. OLIVA setzt vorläufig diese auf die tatsächlichen Eltern beschränkten Overrides ein:

```json
{
  "overrides": {
    "@expo/cli": { "glob": "14.0.4" },
    "@expo/fingerprint": { "glob": "14.0.4", "minimatch": "11.0.5" }
  }
}
```

Die Paketversionen von Expo, React und React Native bleiben gleich. Der vollständige Lock-Unterschied umfasst Glob 13.0.6 → 14.0.4, Minimatch 10.2.6 → 11.0.5, Path Scurry 2.0.2 → 3.0.0 und das neue `@isaacs/nonrecursive-glob-match@1.1.0`.

**Die Overrides liegen außerhalb der von Expo 58 deklarierten Ranges.** Der eigene begrenzte Funktionsnachweis rechtfertigt ihre vorläufige Verwendung für die geprüften Linux-/Node-24-Pfade; er ist keine offizielle Expo-Kompatibilitätszusage. Sobald Expo passende korrigierte Ranges veröffentlicht, sollen die Overrides durch unterstützte Auflösungen ersetzt und dieselben Verträge erneut geprüft werden.

Glob und Minimatch werden gemeinsam aktualisiert: Glob 13 erwartet Regex-Einträge in `Minimatch.set`, während Minimatch 11 dort Matcher verwendet. Ein einzelner erzwungener Minimatch-11-Override unter Glob 13 kann Dateisuche verfälschen. `npm audit fix --force` wurde nicht verwendet; der von npm vorgeschlagene Expo-53-Downgrade passt nicht zur vorhandenen App.

## Tatsächlich ausgeführte isolierte Probe

Vor der Übernahme wurde aus dem unveränderten 0.7-Commit `f0e8db6b2847d5bfc8361e8f617b8caf0c860787` ein separates Probeprojekt erzeugt. Alle 727 archivierten Dateien wurden anschließend verglichen: Nur `package.json` und `package-lock.json` waren verändert, alle 169 Assetdateien blieben bytegleich. Node 24.22.1, npm 11.9.0, Linux.

| Prüfung an diesem eingefrorenen Input | Tatsächliches Ergebnis |
| --- | --- |
| Lock erzeugen und `npm ci` | erfolgreich |
| Audit mit und ohne Dev-Abhängigkeiten | jeweils 0 Funde |
| Typecheck und Fach-/Persistenztests | erfolgreich, 116/116 Tests |
| Web-/PWA-Export | erfolgreich |
| Android-/iOS-JS- und Assetexport, ohne Bytecode | erfolgreich; alle Referenzen vorhanden, je 98 A51-PNGs; Bundle-Syntax geprüft |
| Echte API-/Fingerprint-Prüfgruppen | 7/7 bestanden |

Die öffentliche API `createFingerprintAsync()` sammelte 33 aktive Sources einschließlich ExpoConfig, ConfigPlugins, React Native und Android-/iOS-Autolinking. Zwei Wiederholungen und ein Lauf mit den alten Abhängigkeiten auf **demselben** Projektinput ergaben denselben Hash `2fcfdb0604c9404081d557045f9426ceafb46cc5`, dieselben Sources und **0 Source-Diffs**. Die Probe würde einen leeren Fingerprint nicht als Erfolg akzeptieren.

Zusätzlich wurden echte Ignore-/Dot-/Negations-/Extglob-Verträge sowie `glob()`, `sync()` und `globStream()` geprüft. Geänderte ignorierte Dateien ließen den Fingerprint gleich; eine inkludierte Datei änderte genau eine Source. Beim begrenzten Abbruchtest entstanden nach der Rejection **0 zusätzliche Verzeichnislesevorgänge innerhalb von 100 ms**. Die dokumentierten geänderten Windows-Root- und leeren Extglob-Segment-Semantiken sind als Unterschiede im Bericht erhalten.

Diese Probe ist vom abschließenden 0.8-Gesamtlauf getrennt. Ihre 116 Tests und Exporte dürfen nicht als Testergebnis des späteren 0.8-Produktstands ausgegeben werden. Die zugehörigen [Berichte](evidence/session-08/security/audit-and-probe/probe/OVERRIDE-PROBE-REPORT.md), [API-Resultate](evidence/session-08/security/audit-and-probe/probe/fingerprint-api-probe-results.json) und [Integritätsprüfung](evidence/session-08/security/audit-and-probe/probe/probe-integrity.json) bleiben erhalten.

Keine APK-/IPA-Kompilierung, kein Windows-Build, kein Simulator und kein physisches Gerät wurden in dieser Probe geprüft. `platform: "win32"` auf Linux prüft Zeichenketten-Matching, kein Windows-Dateisystem. Native Bilddecoder, Bewegung und Energieverbrauch brauchen eigene Geräteabnahmen.

## Eigene GitHub-Actions

Der eigene Composite unter `.github/actions/quality/action.yml` verwendet jetzt offiziell verifizierte Node-24-Action-Pins:

| Action | Release | Gepinnter Commit |
| --- | --- | --- |
| setup-node | v7.1.0 | `949feb2413d6458794dcd2491c4babbbce0c15c1` |
| setup-python | v7.1.0 | `6d4fd22b20465ccc0f7354476588e8df7c9ca0e0` |
| upload-artifact | v7.0.2 | `cf430e030ddbb5b0abf93d22962f4752f3646cd9` |

Die verwendeten Inputs für Node-/Python-Version, npm-Lockcache und Artefaktpfade bleiben in den neuen Actiondefinitionen vorhanden. `node-version: "24"` allein ändert nur die Projektlaufzeit; erst die neuen Pins ändern auch die eigene Actionlaufzeit von Node 20 auf Node 24. Der Checkout-Pin wird im jeweiligen eigenen OLIVA-Aufrufworkflow separat gepflegt. Ursprüngliche FaithPath-Workflows und historische Tags werden dadurch nicht verändert.

Öffentliche Release → Tag → Commit → `action.yml` wurden vorab verifiziert. [Primärbeleg](evidence/session-08/security/audit-and-probe/github-actions-runtime-verification.json). Die Pinänderung allein beweist noch keinen erfolgreichen neuen Remote-CI-Lauf; dessen tatsächliches Ergebnis gehört in den Versionslieferstand.

## Belege und Wiederholung

Der eigene Qualitätsworkflow prüft nach `npm ci` zusätzlich `npm audit --audit-level=moderate`. Neue moderate oder schwerere Befunde werden damit im tatsächlichen CI-Lauf sichtbar und stoppen dessen erfolgreiche Abnahme.

Das [Belegverzeichnis](evidence/session-08/security/README.md) enthält unveränderte Audit-/Probeberichte, offizielle Advisory-/Registry-/Actiondefinitionen, Logs und den vollständigen API-Harness. Die [Hashliste](evidence/session-08/security/archive-integrity.json) prüft die übernommenen Originaldateien. Die historischen Berichte beschreiben ihre ursprüngliche Read-only- beziehungsweise Probephase; der aktuelle Übernahmestand steht am Anfang dieses Dokuments.

Für einen neuen Produktstand `npm ci`, `npm audit --json`, Typecheck, Fachtests, Webbuild, Browser-/Offline-Abnahme und native JS-/Assetexporte ausführen. Für einen erneuten Alt-/Neubaum-Fingerprintvergleich zwei isolierte Installationen auf demselben eingefrorenen Input verwenden. Der archivierte Harness enthält die ursprünglichen Arbeitsbereichspfade und darf erst nach Anpassung dieser Pfade auf Kopien erneut laufen. Er schreibt Fixture- und Ergebnisdateien; historische Rohbelege bleiben unverändert.
