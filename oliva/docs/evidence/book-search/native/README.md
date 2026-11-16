# OLIVA0.12.1 · native JavaScript- und Assetprüfung

Android und iOS wurden aus der eingefrorenen Arbeitskopie `/workspace/oliva-book-search` erfolgreich als unminimiertes JavaScript mit Assets exportiert. Alle316 Laufzeitdateien stimmen vor, zwischen und nach den Exporten mit `../runtime-inputs.json` überein; SHA-256 `abc9c992cf4606a9a525570097826da35b5e4b67c97d0d8c67f234ffaf8a5fc0`.

- Portable Prüfung: JavaScript-Syntax, Metadaten und je107 erforderliche Bildreferenzen/A51-, Schwert- und David-Assetbytes erfolgreich.
- Vollständiger statischer Vergleich der27 NT-Bücher,260 Kapitel und1.300 Fragen in beiden Bundles erfolgreich; sämtliche Felder und Reihenfolgen identisch.
- Acorn-Prüfung der tatsächlichen nativen Metro-Module: Modal mit Radioauswahl und nativer Zurückbehandlung, kein HTML-Select im nativen Auswahlmodul, drei korrekte Filteroptionen, Startwert `Alle` und gemeinsame Normalisierung mit NFKC/de/Leerraum/Punkten nachgewiesen.

Die Bundleprüfung führt keinen App-Code aus. Keine Simulator-, Geräte-, Screenreader-, Bilddecoder-, Installations-, Speicher-, Energie- oder native Bedienungsprüfung wurde durchgeführt. Die Browserprüfung der Weboberfläche ist ein separater Nachweis.

`native-builds.json` dokumentiert Befehle, tatsächliche Exitcodes, Zeitfenster, Loghashes und vollständige Exportinventare. Die Prüfer liegen nachvollziehbar hier; `verification-tools.json` nennt ihre Hashes.

Der erste Freeze-Guard brach vor jedem Export ab, weil der historische Helfer Strings statt Python-Path-Komponenten sortierte. Sämtliche316 einzelnen Dateihashes waren bereits identisch. Der Runner wurde an den ausdrücklich dokumentierten neuen Manifest-Algorithmus angepasst; `initial-order-guard.txt` bewahrt den ursprünglichen Abbruch. Die anschließend tatsächlich durchgeführten Exporte und Prüfungen waren erfolgreich.
