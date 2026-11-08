# Native JavaScript-/Assetexporte · OLIVA 0.10.0-Kandidat

Geprüft am 08.11.2026 um 20:18:39 UTC. Beide Expo-Exporte mit
`--no-minify --no-bytecode` und die portable Prüfung über
`scripts/check-native-export.mjs` waren erfolgreich.

| Prüfung | Android | iOS |
| --- | ---: | ---: |
| Metadatenreferenzen einschließlich JS-Bundle | 153 | 150 |
| Eindeutige Metadatenassets | 152 | 149 |
| Exportdateien | 154 | 151 |
| Gesamte Exportbytes | 50.811.262 | 50.827.892 |
| A51-PNGs bytegenau | 98 | 98 |
| Buchschwert-PNGs bytegenau | 6 | 6 |
| David-WebPs bytegenau | 3 | 3 |

Beide Ausgaben enthalten sämtliche sieben A51-Stadien in 14 Auflösungsgruppen.
Die Bundle-Syntax wurde ausschließlich geparst, nicht ausgeführt. Die Prüfung
fand weder Hermes-Bytecode noch die bekannten A51-Webrenderermarker, die 66
bekannten ausgeschlossenen Dateihashes oder die sieben geprüften vollständigen
Promptstrings. Dies beweist nicht die Abwesenheit beliebiger transformierter
Textausschnitte.

Runtime-Digest über 291 Inputs:
`8e5cb71045313213335428f7ab356b0abbfd03b489bd97c773ce3746f73cefd6`.
Die Inputs und ihre Einzelhashes stehen in `runtime-inputs.json`. Vor und nach
beiden Exporten waren Digest und Einzeldateien unverändert. Spätere Änderungen
an diesen Inputs erfordern eine neue zugeordnete Abnahme.

Die vorherigen 0.9-Ausgaben wurden vor dem Export mit den eingefrorenen
Metadaten- und Bundlehashes aus `session-09/native-export-check.json` verglichen
und unter `/workspace/oliva-native-v09-before-v010/` vollständig bewahrt.
Es wurden keine bestehenden Dateien dort überschrieben.

Rohbefehle, Laufzeiten und Loghashes: `native-builds.json`. Vollständige
Asset-/Syntaxprüfung: `native-export-check.json`. Die beiden `.txt`-Dateien sind
die unveränderten Expo-Logs. `SHA256SUMS` schützt die zugehörigen Belegdateien.

Dies sind statische JS-/Assetdebugexporte. Keine APK/AAB/IPA, kein Signing,
kein Hermes-Lauf, kein Simulator, kein physisches Gerät und keine native
Bilddecoder-, Speicher-, Leistungs- oder Energieprüfung wurden durchgeführt.
