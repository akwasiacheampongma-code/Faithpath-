# FaithPath – technischer Release-Verifikationsbericht

Stand: 01.10.2026. Build: **FP4-20261001-G**. Branch: **develop/v4**.

**Ergebnis: RELEASE-DATENMODELL BESTANDEN.** Der geprüfte lokale Build erfüllt die technischen Release-Gates. Es verbleiben keine kritischen Blocker. Ein Produktions-Release ist weiterhin nicht autorisiert.

## Bestand und Integrität

| Bestand / Prüfung | Ergebnis |
|---|---|
| FaithPath | 1.560 eindeutige IDs; FP-0001 bis FP-1560 vollständig |
| Nachlese | 2.314 eindeutige IDs; N-0001 bis N-2314 vollständig |
| Kapitelquiz | 1.300 Fragen separat erhalten |
| Kombinierte Storys | 436 |
| Verifizierte FP-Storyzuordnungen | 260 |
| Fehlende, doppelte oder umnummerierte IDs | 0 |
| REVIEW_REQUIRED / content_conflicts | 0 / 0 |
| qa_evidence_gaps / unmaterialized_corrections | 0 / 0 |

Alle 139 eingefrorenen Content-JSON-Dateien behalten ihre SHA-256-Hashes. Dieser Lauf verändert keine Fragen, Antworten, Optionen, Referenzen, Erklärungen, Reflexionen, IDs, Storyzuordnungen oder Nachlese-Mappings. Die paketierten Candidate-Dateien stimmen bytegenau mit diesen Quellen überein.

## Reader-Integration

**PASS.** Der Einstieg des neuen Builds lädt `releases/FP4-20261001-G/src/app.js`. Die Runtime konsumiert die versionierten FP- und Nachlese-Daten sowie den kanonischen Storyfluss unter `releases/FP4-20261001-G/data/`. Die Quellpools bleiben getrennt. Nachlese-Verständnisfragen werden ohne erfundene MC-Optionen dargestellt.

FP-0120, FP-0151 und FP-0239 bleiben eigenständige FaithPath-Fragen in ihrem belegten Storykontext. Ihr verifiziertes N-Match bleibt ausdrücklich null. FP-0147 bleibt SINNGLEICH zu N-1536; beide Originalformulierungen und Referenzen bleiben unverändert. Der Browser-Smoke-Test vergleicht die vollständigen geladenen Quellobjekte und den Storyfluss mit den eingefrorenen Dateien.

Es wurden keine historischen F-Release-Dateien als aktive Runtime-Quelle nachgeladen. Der Service Worker verwendet die neue Build-ID; Offline-Reload und beide Bibelübersetzungen wurden tatsächlich im Browser geprüft.

## Build und Reproduzierbarkeit

**PASS.** `npm run build` erzeugt 302 Dateien in `dist/`, einschließlich `release-integrity.json` und `candidate-integrity.json`. Zwei getrennte Build-Läufe liefern identische Datei-, Content- und Build-Hashes. Zeitangaben stehen in den Audit-Berichten und verändern die reproduzierbaren Build-Artefakte nicht.

Git-HEAD / Arbeitsbaum-Basis: `dc1e6782ef142de528c4c1b023ce96a70fc6753f`. Die neuen technischen Änderungen befinden sich im lokalen Arbeitsbaum und wurden in diesem Lauf nicht committed. Der Commit allein repräsentiert daher nicht den neuen Build; dessen exakter Runtime-Code ist durch das Integritätsmanifest gebunden.

Content-Hash (SHA-256):

`04d8bdf8a7e2c4377cbe2eb812744fb1fc7cfd9a837817b61ae9e31a647d0d1b`

Build-Hash (SHA-256):

`7fee1990f1939ac05cf470861f2add48173eaa7364c503abdc143434e150ae6e`

Die genaue Hashdefinition und sämtliche Dateinamen stehen in `versioned-build-report.json`. Der Content-Hash schließt Audit-Ausgaben aus; der Build-Hash schließt das Integritätsmanifest selbst aus, um Selbstreferenzen zu vermeiden.

## Tests am neuen Build

| Prüfung | Ergebnis |
|---|---|
| Reader-Integration | PASS |
| Materialisierungsvalidator | PASS |
| Runtime-Schema und Referenzen | PASS |
| Runtime-Smoke-Test | 27 / 27 PASS |
| Kerntests | 22 / 22 PASS |
| Migrationstest | PASS |
| Referential Integrity | PASS |
| Datenverlusttest | PASS |
| Browser-Akzeptanzgruppen | 12 / 12 PASS |
| Service-Worker-Updateszenarien | 3 / 3 PASS |

Die Prüfungen verwenden den neuen Build, keine übernommenen historischen Testergebnisse. Im regulären Smoke-Ablauf wurden keine fatalen Console Errors, produktiven JSON-404 oder alten Release-Anfragen festgestellt. Ein absichtlich fehlender Datenpfad wurde separat geprüft: kontrollierte Fehlermeldung, synthetische Nutzerdaten erhalten.

Der überholte Kerntest mit pauschaler Build-E-Inhaltsgleichheit wurde nachvollziehbar ersetzt: Jede Differenz zwischen Original-Master und Candidate muss exakt in den 3.301 dokumentierten Änderungen enthalten sein. Die historischen Hashvorgaben für Bibel- und Baum-/Icon-Assets bleiben unverändert. Die übrigen 21 Kerntests bleiben unverändert. Ein anfänglicher Browserlauf war unvollständig beziehungsweise fehlgeschlagen; der abschließende vollständige Lauf auf separatem Testport besteht mit 12/12 Gruppen.

## Entscheidung und Umfang

**RELEASE-DATENMODELL BESTANDEN**, kritische Blocker: **0**.

Die Freigabe gilt für den geprüften lokalen Build mit den genannten Hashes. Sie ist keine neue redaktionelle Gesamtfreigabe, keine WCAG-Zertifizierung und kein Nachweis eines realen iPhone-/Safari-Gerätetests. Produktions-Deploy, Release-Tag und Merge nach main wurden nicht durchgeführt. Release-Status: **NOT_AUTHORIZED**.

Maschinenlesbare Nachweise:

- `FaithPath_RELEASE_APPROVAL.json`
- `reader-integration-report.json`
- `versioned-build-report.json`
- `runtime-smoke-report.json`
- `final-regression-report.json`
- `core-tests-results.xml`
- `browser-acceptance-results.json`
- `service-worker-results.json`

Der vorherige Blocker-Bericht ist als historischer Stand unter `history/FaithPath_RELEASE_BLOCKERS.pre-G.json` erhalten.
