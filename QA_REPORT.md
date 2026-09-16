# QA Report — FaithPath V4 FP4-20260916-C

## Automatisiert / statisch geprüft
- JavaScript-Syntax: bestanden (`node --check`).
- 312 Einheiten / 1.560 Fragen geladen.
- 312/312 Einheiten besitzen eine Reflexionsfrage; 312 unterschiedliche Reflexionsfragen.
- Beide Bibeln: 66 Bücher / 1.189 Kapitel; OTB 31.103, Luther 31.102 Verse.
- 84 im App-Code gefundene situative/geführte Referenzvorkommen geprüft; alle referenzierten Bücher, Kapitel und Endverse existieren in Luther 1912.
- Netlify Publish-Root ist flach; `index.html`, `_redirects`, `_headers`, `netlify.toml`, `sw.js`, Manifest vorhanden.
- Storage-Key-Kompatibilität beibehalten.
- Regressionstest bestanden: Story-Reflexion speichert vollständige Bibelreferenz.
- Regressionstest bestanden: Story-Reflexion lässt sich mit einem bestehenden Weg verbinden.
- Regressionstest bestanden: Neuer Weg aus einer ausstehenden Reflexion übernimmt die Verbindung automatisch.
- Regressionstest bestanden: Kapitelbereiche mit `to=999` werden auf die real vorhandenen Verse begrenzt.
- Regressionstest bestanden: Direkteinstieg öffnet „Lesen“.
- Regressionstest bestanden: 14-Tage-Snooze verändert `lastReview` nicht.
- Regressionstest bestanden: Es existiert höchstens ein Bottom-Sheet gleichzeitig.
- Regressionstest bestanden: Guided-Plan-Fortschritt wird im Backup wiederhergestellt.
- Regressionstest bestanden: Nicht zusammenhängende Verse erzeugen keinen speicherbaren Bereich.
- Regressionstest bestanden: Markierungen sind an ihre Bibelübersetzung gebunden.
- Regressionstest bestanden: Quiz-Fortschritt erreicht 100 %.

## Funktionale Risikofälle berücksichtigt
- Leere Wege, leeres Journal und leere Markierungen besitzen Empty States.
- Ungültige/fehlende Bibeldatei erzeugt einen Ladefehler statt still falsche Daten.
- Beschädigter Backup-Import wird abgelehnt.
- Lange Texte umbrechen; responsive Regeln für kleine Mobilbreiten, Tablet und Desktop vorhanden.
- Reduced Motion wird respektiert.
- Touch-Ziele der primären Controls sind auf ca. 44–48 px ausgelegt.
- Service Worker hat eindeutige V4-Cache-ID und löscht alte FaithPath-Caches bei Aktivierung.

## Noch nicht als vollständig abgeschlossen behauptet
Ein echter manueller Test auf mehreren physischen iPhones/iPads/Android-Geräten und ein vollständiger VoiceOver-Test sind vor einem breiten Store-Launch weiterhin nötig. Der Build ist für einen kleinen kontrollierten Web-Bezahltest gedacht, nicht als abschließend zertifizierter App-Store-Release.
