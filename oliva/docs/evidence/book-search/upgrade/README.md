# Reale 0.12→0.12.1-PWA-Prüfung

Der erste tatsächliche Lauf am **15.11.2026** bestand mit **Exitcode 0**: eingefrorener 0.12-Kern `oliva-80005b3c1d2e2eef` → finaler 0.12.1-Kern `oliva-75717978bae05979`. Rohbericht, unabhängiger Ergebnis-/Hashabgleich und drei echte Browserbilder liegen unter `oliva-75717978bae05979/`; das vollständige Ausführungslog steht in `execution.txt`.

Der echte Service-Worker-Wechsel wurde anhand von Controller, aktivem Worker, Version und beiden Cachekennungen bestätigt. Derselbe Origin und dasselbe dauerhafte Chromium-Profil blieben während des gesamten Versuchs erhalten. **Alle vier rohen IndexedDB-Werte bleiben exakt gleich**: `main`, das Originalarchiv, die Rückkehrsicherung und der Rückkehrindex. Der Vergleich betrifft die exakte JSON-Serialisierung sämtlicher Werte, keine physischen Datenbankdateibytes. Name, bestehendes Lesezeichen, gespeicherte NT-Antwort, offener Textentwurf, importierte Inhalte und Entwicklungsstand bleiben dadurch ebenfalls unverändert.

Die neue Bibelübersicht zeigt nach dem Update und nach dem Offline-Neustart standardmäßig 66 Bücher. Das Dropdown grenzt auf 27 NT- bzw. 39 AT-Bücher ein. Zusätzliche Leertasten, Unicode-Abstände, Großschreibung, Punkte und vollbreite Zeichen im Zahlpräfix wurden praktisch bedient. Auch die NT-Fragenübersicht nutzt dieselbe tolerante Buchsuche. Beim ersten Offlinebesuch funktionieren das bereits gespeicherte Antwortergebnis, der alte Textentwurf und alle sieben A51-Stadien. Sämtliche anschließenden Such-, Filter- und Vorschauinteraktionen bewahren alle vier Rohwerte.

Dies ist **lokale automatisierte Chromiumprüfung** (155.0.8059.79). Der Quellkatalog wurde als 260 Kapitel/1.300 Fragen geprüft; eine einzelne Frage wurde im Browser beantwortet. Keine Prüfung aller 1.300 Fragen durch Einzelinteraktionen, keine gehostete Sites-Prüfung und keine Simulator- oder reale Handyprüfung werden behauptet. Der erfolgreiche lokale PWA-Test ist kein Nachweis einer privaten Bereitstellung.

## Historischer Vorbereitungsstand und reproduzierbarer Ablauf

Die folgenden Absätze und `preparation.json` dokumentieren ausdrücklich die Vorbereitung **vor** dem oben bestätigten Lauf. Ihre damalige Aussage „noch nicht ausgeführt“ bleibt als historischer Nachweis erhalten.

`offline-upgrade-book-search.mjs` ist vorbereitet; `node --check` besteht. **Die eigentliche Browserprüfung ist noch nicht ausgeführt.** Das Skript verweigert einen weiterhin als 0.12.0 bezeichneten Entwicklungsbuild. Es darf erst nach dem finalen Build gestartet werden.

Die Prüfung verwendet einen freien eigenen Localhost-Port und dasselbe dauerhafte Chromium-Profil über den atomaren Serverpfadwechsel. Persönliche Testdaten entstehen ausschließlich über die eingefrorene 0.12-Oberfläche. IndexedDB wird nur lesend beobachtet; sämtliche vier Rohwerte werden über den echten Workerwechsel und die anschließenden Such-/Offlineabläufe exakt verglichen. Es gibt keine künstlichen Storeaufrufe, keine erzeugten Fortschritte nach der Ausgangssicherung und keine beliebigen Wartepausen.

Geplant sind das neue 66/27/39-Dropdown, Leerzeichen-/Unicode-Suche, Offline-Neustart, bestehende NT-Antwort und Textentwurf sowie alle sieben A51-Stadien. Der gesamte NT-Katalog wird aus der Quelldatei gezählt; eine einzelne Frage wird im Browser bedient. Keine Prüfung aller 1.300 Fragen durch Einzelinteraktionen wird behauptet.

Start nach Freigabe des tatsächlichen lokalen Zielbuilds:

```sh
node docs/evidence/book-search/upgrade/offline-upgrade-book-search.mjs
```

Der Ausführungsbericht liegt in einem Unterordner der tatsächlichen Ziel-Kernkennung. Vorhandene Berichte werden nicht überschrieben. `OLIVA_EVIDENCE_DIR` erlaubt einen separaten Ordner für einen ausdrücklich neuen Versuch. Ein Ergebnis belegt lokale Browserautomation, keine gehostete Sites-, Simulator- oder reale Handyprüfung.

Der archivierte Runner ist die unveränderte tatsächlich ausgeführte Fassung. Für die Wiederholung in dieser Arbeitsumgebung aus `/workspace/oliva-book-search` starten; er benötigt den erhaltenen Kontrollbuild unter `/workspace/oliva-v012-nt-study-control-dist`, Node24, installierte Abhängigkeiten und Chromium. Bei einem anderen Checkout sind die drei absoluten Projekt-/Importpfade und der Kontrollpfad bewusst anzupassen; die alte Ausführungs-SHA belegt die ursprüngliche Fassung.
