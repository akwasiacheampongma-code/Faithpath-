# Genesis · drittes individuelles Buchbild

Die laufende Master-Iteration erweitert die gemeinsame Buchbildregistrierung um Genesis. Package0.17.0 bezeichnet die Entwicklungsbasis; die private Vorschau liefert weiterhin den separat geprüften 0.17-Stand ohne dieses neue Bild. Noch keine neue Produktversionsnummer zugewiesen.

## Abnahmevertrag

- Das unveränderte 1024×1536-RGBA-Master und drei vollständige skalierte Dateien sind mit Hash, exaktem Prompt, Quellen und Herkunft dokumentiert. Johannes/Römer und alle66Vektorschwerter bleiben erhalten.
- Startseite und `/buch/GEN` verwenden dieselbe Bildkomponente samt echten Lade-/Fallback-/Retryzuständen. Die Motivstellen öffnen den gemeinsamen Reader.
- Die separate Lesespur verwendet50Kapitel und51Grenzmarken. Nur bestätigte Kapitel zählen; Bildanzeige, Vorschau, Offline-Neustart und erneutes Laden schreiben keine Nutzerdaten.
- Kleine/große Displays, Hell/Dunkel, reduzierte Bewegung, hochauflösende Browseransicht, Offline-Neustart und echte Bildfehler werden am integrierten Build geprüft. Rohdatenvergleich und tatsächliche Screenshots dienen als Beleg.
- Native JavaScript-/Assetexports müssen die drei neuen Varianten und die richtige plattformspezifische Baumdarstellung enthalten. Statische Prüfung ist keine native App-, Decoder-, Simulator- oder Geräteprüfung.

## Architektur und Inhalt

`src/features/swords/illustrations.ts` enthält reine Buchdaten, belegte Motivstellen und die Lichtgeometrie im gemeinsamen100×150-Raum. `pilot-assets.ts` registriert die drei Dateien. Bestehende Komponenten steuern Anzeige, Rückfall auf das Buchsymbol, Qualitätswahl, Kapitellicht und reduzierte Bewegung. Keine zusätzlichen Komponenten, Runtimeabhängigkeiten, globalen Zustände oder Datenmigrationen nötig.

`art/swords/genesis-beginnings/` bewahrt Original und Vorbereitung; `art/swords/genesis-runtime.json` dokumentiert die tatsächliche Entwicklungsübernahme. `runtime-index.json` verbindet alle drei illustrierten Bücher. `npm run content:swords` prüft alle Original-/Variantenhashes und die exakten zitierten Luther1912-Verse.

Der Keimling und Holzgriff sind freie Buchsymbolik für Schöpfung, Samen und Bewahren, verankert in1. Mose1,1 /1,11–12 /2,15. Das ist keine historische Waffenrekonstruktion oder Behauptung, Genesis beschreibe dieses Schwert. Allgemeine Inspiration Epheser6,17 bleibt gesondert. Persönlicher Wert und Gottes Liebe sind kein Leseergebnis.

## Tatsächlicher Prüfstand

Maßgeblich sind die tatsächlichen Dateien unter `evidence/genesis-sword/`; der erste rote Fachtestlauf bleibt erhalten. Ein alter Registrierungstest erwartete genau zwei illustrierte Bücher; sein exakter Erwartungsbestand wurde auf drei erweitert, ohne die bestehenden Buch-/Quellenprüfungen zu streichen. Der erste Fingerprinthelfer beschrieb seine Sortierreihenfolge ungenau; beide Dateibestände sind nachweislich bytegleich, R2 verwendet die dokumentierte Python-Path-Sortierung.

Interne Original-/CSS-Bildprüfung bei1100/390Pixeln bestanden; kein unabhängiger Fachentscheid behauptet. Weitere integrierte Ergebnisse werden erst nach tatsächlicher Ausführung ergänzt. Die gesamte Master-Definition-of-Done bleibt offen.
