# QA Report — FaithPath V4 FP4-20260916-D

## Automatisiert / statisch geprüft
- JavaScript-Syntax: bestanden (`node --check`).
- 312 Einheiten / 1.560 Fragen geladen.
- 312/312 Einheiten besitzen eine Reflexionsfrage; 312 unterschiedliche Reflexionsfragen.
- Beide Bibeln: 66 Bücher / 1.189 Kapitel; OTB 31.103, Luther 31.102 Verse.
- Alle Story-Bereiche existieren in beiden lokalen Bibelsets; `to=999` wird nur als Kapitelende interpretiert.
- Alle 1.560 Fragen besitzen gültige Antwortlisten und gültige Correct-Answer-Indizes.
- 150 Service-Worker-Assets geprüft; keine referenzierte Offline-Datei fehlt.
- Netlify Publish-Root ist flach; `index.html`, `_redirects`, `_headers`, `netlify.toml`, `sw.js` und Manifest vorhanden.
- Storage-Key-Kompatibilität beibehalten; Hauptschema in Build D auf Version 3 normalisiert.

## Build-D-Regressionen
- Baum bleibt ohne bestätigte Entwicklung auf „Samen“.
- Erste bestätigte Entwicklung führt zur ersten Wachstumsstufe.
- Abgelaufener 14-Tage-Snooze wird auch bei einem jüngeren Weg fällig.
- Noch nicht abgelaufener Snooze bleibt verborgen.
- Fehlende `steps`, `reviews` und `milestones` alter Wege werden sicher zu leeren Arrays normalisiert.
- Alte Buchcodes in Markierungen werden migriert (`jak` → `JAS`).
- Alte Buchcodes in Journal-Referenzen werden migriert (`mar` → `MRK`).
- Alte Weg-Verbindungen im Legacy-Format werden in das kanonische Referenzformat migriert (`joh` → `JHN`).
- Falsch typisierte verschachtelte Wegdaten werden beim Import abgelehnt.
- `openPath()` setzt den aktiven Navigationstab auf `paths`.
- Die Glaubensgeschichte zeigt bei mehr als 120 Einträgen einen sichtbaren „Weitere anzeigen“-Kontrollpunkt.
- Nach dem Nachladen werden die restlichen Einträge angezeigt.

## Bereits aus Build B/C weiter geprüft
- Story-Reflexion speichert vollständige Bibelreferenz und lässt sich mit bestehendem oder neuem Weg verbinden.
- Kapitelbereiche wählen nur tatsächlich vorhandene Verse.
- Direkteinstieg „Zur Bibel“ öffnet „Lesen“.
- Es existiert höchstens ein Bottom-Sheet gleichzeitig.
- Guided-Plan-Fortschritt wird im Backup wiederhergestellt.
- Nicht zusammenhängende Verse erzeugen keinen falschen durchgehenden Speicherbereich.
- Markierungen bleiben an die gespeicherte Bibelübersetzung gebunden.
- Quiz-Fortschritt erreicht 100 %.

## Noch nicht als vollständig abgeschlossen behauptet
Ein echter manueller Test auf mehreren physischen iPhones/iPads/Android-Geräten und ein vollständiger VoiceOver-Test sind vor einem breiten Store-Launch weiterhin nötig. LocalStorage bleibt bewusst gerätegebunden; Cross-Device-Sync ist nicht Bestandteil dieses Builds.
