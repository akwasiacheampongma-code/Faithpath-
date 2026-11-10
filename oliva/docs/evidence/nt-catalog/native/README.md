# Native 0.12.0: Export- und Inhaltsnachweis

Android und iOS wurden nach dem Runtime-Freeze nacheinander mit
`--no-minify --no-bytecode` exportiert. Beide Befehle und beide statischen
Prüfungen sind mit Exitcode 0 abgeschlossen. Der vollständige Nachweis steht
in [native-builds.json](native-builds.json), die Originalausgaben in
[native-android.txt](native-android.txt) und [native-ios.txt](native-ios.txt).

Die 313 Runtime-Eingabedateien sind vor und nach allen Exporten bytegleich:
`00acc78da7d6268326b68fce0906ffa67d32c337240efbd8f59490e8d839590a`.
[Vorher](runtime-inputs-before.json) und [nachher](runtime-inputs.json)
enthalten jeden Pfad, jede Dateigröße und jeden SHA-256. Die Digestregel ist
unverändert zur Version 0.11: sortierter Pfad, NUL, Originalbytes, NUL; alle
Dateien unter `app`, `src`, `assets` sowie App-/Paket-/Lockdatei und die
ausdrücklich gelisteten A51-/Schwertmanifeste. Dadurch ist der neue
NT-Katalog einschließlich des kleinen Index bereits erfasst. Die externe
Web-Rechtedatei erweitert diese unveränderte Digestregel nicht.

| Plattform | JavaScript-Bytes | Exportdateien | Exportbytes |
| --- | ---: | ---: | ---: |
| Android | 11.822.548 | 154 | 51.955.992 |
| iOS | 11.838.989 | 151 | 51.972.622 |

Die tatsächlichen 0.11-Ausgaben wurden vor dem Export gegen den
[eingefrorenen Reader-Bericht](../../reader-flow/native/native-export-check.json)
geprüft und nach `/workspace/oliva-native-v011-before-v012` verschoben.
Metadaten, Bundle und sämtliche 107 im Bericht verlangten Bilddateien je
Plattform stimmen mit dessen Hashes überein; Gesamtdateizahlen und Bytes
ebenfalls. Alle 305 tatsächlichen Dateien wurden zusätzlich vor und nach
dem Verschieben vollständig gehasht und sind unverändert erhalten.
[prior-output-preservation.json](prior-output-preservation.json) enthält die
Inventare. Der historische Bericht enthält keine Einzelhashes jedes
Framework-Assets; dafür wird keine rückwirkende Vollprüfung behauptet.

[native-export-check.json](native-export-check.json) belegt die vorhandene
portable Prüfung: JavaScript-Syntax, Expo-Metadatenverweise und exakte
Assets. Sie prüft außerdem 66 bekannte vollständige Quell-/Masterhashes,
sieben vollständige interne Bildprompts und die benannten A51-Webmarker
auf Abwesenheit. Ihr begrenzter Ausschlussumfang steht ausdrücklich im
Bericht; er ist kein Beweis gegen jede denkbare transformierte Teilkopie.

[nt-native-catalog-check.json](nt-native-catalog-check.json) belegt zusätzlich
für **jedes** Bundle die vollständige strukturelle Gleichheit des
eingebetteten JSON-Katalogs mit `src/data/nt-catalog.json`: 27 Bücher,
260 Kapitel, 1.300 eindeutige Fragen mit je vier Originaloptionen,
Erklärungen und 1.304 Referenzbereichen. Acorn liest das JavaScript als AST;
der Prüfer extrahiert ausschließlich statische JSON-Literale und vergleicht
alle Felder sowie die Reihenfolge sämtlicher Arrays. Bundlecode wird dabei
nicht ausgeführt. Diese Metro-Ausgaben enthalten keine Quellmodulnamen;
die Identifikation erfolgt anhand der JSON-Struktur und der vollständigen
Gleichheit. Modul-IDs, Bundle- und Literalhashes sind im Bericht enthalten.
Dieser Beleg dupliziert keine Fragen, Optionen oder Erklärungen.

Die eingesetzten Hilfsskripte sind als
[native-export-runner.py](native-export-runner.py) und
[check-native-nt-catalog.mjs](check-native-nt-catalog.mjs) erhalten.
[verification-tools.json](verification-tools.json) dokumentiert die vor der
Ausführung gehashten Originalskripte. Die Katalogprüfung kann vom
Repositoryverzeichnis erneut ausgeführt werden:

```sh
node docs/evidence/nt-catalog/native/check-native-nt-catalog.mjs --report /tmp/oliva-native-v012-recheck.json dist-android dist-ios
```

Das Ergebnis sind unminifizierte JavaScript-/Asset-Exportartefakte und
statische Prüfungen. Es wurden damit weder APK/AAB/IPA, Signierung,
Hermes-Ausführung, Installation, Simulator, physisches Gerät, nativer
Bilddecoder noch Leistung, Speicher oder Energieverbrauch geprüft.
