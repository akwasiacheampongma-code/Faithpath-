# Versanker beim Reader-Reflow

Lokale Chromium-Diagnose am eingefrorenen Kern `oliva-6dc58fa90ed710f9`; synthetisches neues Browserprofil. Keine gehostete, native oder physische Geräteprüfung.

Explizite Verswahl120 wird zunächst bei y24 angezeigt und als kanonischer Anker120 gespeichert. Beim Resize beziehungsweise darauffolgenden Öffnen der Einstellungen treten Zwischenoffsets auf, bevor React die neue Geometrie vollständig verarbeitet. Der bisherige Hook übernimmt daraus Vers68; nach Schrift-/Zeilenabstandsänderung landet Vers120 bei y3748,5 statt innerhalb der bestehenden120-Pixel-Grenze. Rohbeleg: `settings-scroll-api-baseline.json`.

Der isolierte CSS-Kontrollversuch `overflow-anchor:none` behebt den Fehler allein nicht. Der Browser klemmt den alten Scrolloffset während des Reflows; der Hook übernimmt Vers98 und springt anschließend per tatsächlichem JS-Scrollbefehl auf diesen falschen Zwischenanker. Vers120 bleibt bei y1203,9. Der Kontrollversuch wird ausdrücklich nicht als erfolgreiche Produktabnahme gewertet.

Der Quellenfix friert den letzten kanonischen Anker bereits beim plattformweiten `Dimensions.change`-Ereignis ein. Außerdem vergleicht `onScroll` den aktuellen Viewport mit demjenigen der letzten vollständigen Messung. Daten aus einem zwischenzeitlichen Viewport ersetzen den Anker nicht. Bei aktivem Notizinput wird kein neues Restoreziel gesetzt oder angesprungen; ein tatsächlich wartendes Ziel wird erst nach Blur erneut gemessen.

Die Neubau-/Browserprüfung dieses Quellenfixes steht noch aus. Der bisherige Build wurde während der Diagnose nicht verändert.

Reproduzieren im App-Projekt nach Start des geprüften lokalen Exports:

```sh
node docs/evidence/reader-flow/diagnostics/reproduce-settings.mjs /tmp/reader-settings-observation.json
node docs/evidence/reader-flow/diagnostics/reproduce-settings.mjs /tmp/reader-settings-no-anchor.json --disable-scroll-anchoring
```

Der Helfer beobachtet DOM-Rechtecke, Scroll-API-Aufrufe, Ereignisse und tatsächliche IndexedDB-Daten. Die JSON-Datei enthält Beobachtungen, keine pauschale Erfolgsbehauptung. Ein erster fehlerhafter Helferlauf, der vor der App eine leere IndexedDB anlegte, bleibt separat unter `settings-harness-initialization-notfound.json`; die korrigierte Version bricht jeden eigenen Upgradeversuch ab.
