# Native JavaScript-/Assetexporte · OLIVA 0.11.0-Kandidat

Geprüft am 09.11.2026 um 07:59:18 UTC. Beide Expo-Exporte mit
`--no-minify --no-bytecode` und die portable Prüfung über
`scripts/check-native-export.mjs` waren erfolgreich.

| Prüfung | Android | iOS |
| --- | ---: | ---: |
| Metadatenreferenzen einschließlich JS-Bundle | 153 | 150 |
| Eindeutige Metadatenassets | 152 | 149 |
| Exportdateien | 154 | 151 |
| JS-Bundlebytes | 10.716.033 | 10.732.474 |
| Gesamte Exportbytes | 50.849.477 | 50.866.107 |
| A51-PNGs bytegenau | 98 | 98 |
| Buchschwert-PNGs bytegenau | 6 | 6 |
| David-WebPs bytegenau | 3 | 3 |

Beide Ausgaben enthalten sämtliche sieben A51-Stadien in 14 Auflösungsgruppen.
Die Bundle-Syntax wurde ausschließlich geparst, nicht ausgeführt. Die Prüfung
fand weder Hermes-Bytecode noch die bekannten A51-Webrenderermarker, die 66
bekannten ausgeschlossenen Dateihashes oder die sieben geprüften vollständigen
Promptstrings. Dies beweist nicht die Abwesenheit beliebiger transformierter
Textausschnitte.

Runtime-Digest über 300 Inputs:
`5f0789aef525e68db2b4b841c2fa4bf1f9f74283fae6a3ed055d5eea2e2eb134`.
`runtime-inputs-before.json` und `runtime-inputs.json` enthalten die vollständigen
Inputlisten und Einzelhashes. Sie waren vor und nach beiden Exporten byteinhaltlich
identisch. Der Scope entspricht dem Vorbericht: alle regulären Dateien unter
`app/`, `src/` und `assets/` sowie `app.json`, `package.json`, `package-lock.json`,
`art/a51/native-derivatives.json`, `art/swords/runtime.json`,
`art/swords/romans-runtime.json` und `art/swords/runtime-index.json`.
Die Sortierung entspricht Python `sorted(pathlib.Path(...))`, wie im vorherigen
Native-Digest; die SHA-256-Eingabe ist je relativem POSIX-Pfad
`UTF8(path) + NUL + raw_file_bytes + NUL`. Globaler Stringsort wäre eine andere
Reihenfolge. Spätere Änderungen an diesen Inputs erfordern eine neue zugeordnete
Abnahme.

Die vorherigen 0.10-Ausgaben wurden zuerst mit den eingefrorenen Metadaten- und
Bundlehashes aus `docs/evidence/invitations/native/native-export-check.json`
verglichen. Beide Plattformen stimmten überein. Anschließend wurden sie vollständig
unter `/workspace/oliva-native-v010-before-v011/` bewahrt; dort wurden keine
bestehenden Dateien überschrieben. Die Dateilisten, Größen und Einzelhashes wurden
vor und nach dem Verschieben vollständig verglichen.
`prior-output-preservation.json` hält das Ergebnis fest.

Rohbefehle, tatsächliche UTC-Zeiten, Laufzeiten und Loghashes:
`native-builds.json`. Vollständige Asset-/Syntaxprüfung:
`native-export-check.json`; deren Konsolenausgabe steht in
`native-export-check.txt`. `native-android.txt` und `native-ios.txt` sind die
unveränderten Expo-Logs. Beide enthalten den erwarteten Expo-Hinweis, dass das
Abschalten von Bytecode ausschließlich zum Debuggen gedacht ist. Alle Befehle
endeten mit Exitcode 0. `SHA256SUMS` schützt die zugehörigen Belegdateien.

Dies sind statische JS-/Assetdebugexporte. Keine APK/AAB/IPA, kein Signing,
kein Hermes-Lauf, kein Simulator, kein physisches Gerät und keine native
Bilddecoder-, Speicher-, Leistungs- oder Energieprüfung wurden durchgeführt.
