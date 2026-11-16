# Native Exportprüfung · Reader 0.13.0

Der tatsächlich implementierte Releasekandidat wurde unter Linux als unminimiertes JavaScript mit Assets für Android und iOS exportiert. Beide Befehle verwenden `--no-minify --no-bytecode`. Die Exporte sind keine signierten Installationsdateien.

Alle 327 eingefrorenen Runtime-Dateien stimmen vor, zwischen und nach den Exporten exakt mit `../runtime-inputs.json` überein. SHA-256: `0b097eb24fc4fded654aef9f1a68ffb76301ed48e3d941ca146046efe3e15611`.

- Android: Export erfolgreich in 10,0 Sekunden.
- iOS: Export erfolgreich in 6,647 Sekunden.
- JavaScript-Syntax, Expo-Metadaten und je 107 erforderliche A51-/Schwert-/David-Bildreferenzen samt Assetbytes geprüft.
- Alle 27 NT-Bücher, 260 Kapitel und 1.300 Fragen in beiden Bundles statisch vollständig mit dem aktuellen Quellkatalog verglichen. Strings, Optionen, Lösungsschlüssel, Erklärungen und Referenzarrays stimmen in ihrer Reihenfolge überein.

Die bisherigen 0.12-Exporte wurden vor dem Verschieben gegen ihre eingefrorenen Bundle-/Metadaten-/Bildhashes geprüft und vollständig unter `/workspace/oliva-native-v012-before-v013` erhalten. `preserved-v012-native.json` dokumentiert die vollständigen Dateiinventare.

Die zusätzliche Acorn-Prüfung der tatsächlichen nativen Metro-Module besteht auf Android und iOS. Sie findet den auf `setStringAsync` wartenden Clipboard-Adapter mit bestätigtem `true`-Rückgabewert und die ExpoClipboard-Plattformbrücke. Auswahl-Modal samt Dismiss-/Zurück-Props, native `FlowText`-Auswahl und getrennte Fokusbereiche, Vollkapitelinitialisierung über `getChapter` sowie getrennte Schema-Literale V8 und V9 sind im Bundle nachgewiesen. Diese syntaktischen Nachweise beweisen kein natives Laufzeitverhalten. [Zusatzbericht](native-reader-check.json).

## Prüfumfang und Grenzen

Dies sind statische JavaScript-/Assetprüfungen. Kein exportierter App-Code wird ausgeführt. Es wurden keine nativen Geräte, Simulatoren, Bilddecoder, Screenreader, Installationen, Speicher- oder Energiemessungen geprüft. Tastatur-, Fokus-, Modal- und Clipboardverhalten im Web gehören zur separaten Chromium-Abnahme. Die nativen Plattformbrücken und native Textmessung benötigen weiterhin tatsächliche Geräte-/Simulatorprüfungen.

`native-builds.json` enthält Befehle, Exitcodes, Zeitfenster, Loghashes und vollständige Exportinventare. `native-export-check.json` dokumentiert den portablen Prüfbericht; `nt-native-catalog-check.json` den statischen vollständigen NT-Vergleich. Die tatsächlich verwendeten Prüfer liegen in diesem Verzeichnis.
