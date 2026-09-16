# Changelog — FaithPath V4

## FP4-20260916-B
- Kernfehler im Reflexionsfluss behoben: „Mit Weg verbinden“ funktioniert jetzt auch nach einer Reflexion aus „Bibel entdecken“.
- Story-Reflexionen speichern nun eine vollständige Bibelreferenz; der Journal-Link führt wieder korrekt zum zugehörigen Abschnitt.
- Wird aus einer ausstehenden Bibelstelle oder Reflexion direkt ein neuer Weg erstellt, wird die Verbindung automatisch übernommen.
- Journal rendert Bibellinks nur noch, wenn eine vollständige Referenz vorhanden ist; ältere unvollständige Einträge bleiben dadurch stabil.
- Regressionstest für Story-Reflexion → bestehender Weg sowie Story-Reflexion → neuer Weg ergänzt und bestanden.
- Kapitel-Einheiten mit internem „bis Kapitelende“-Marker wählen jetzt nur tatsächlich vorhandene Verse aus; falsche Bereiche wie 1–999 sind ausgeschlossen.
- Service-Worker-Cache auf Build B angehoben.

## FP4-20260916-A
- Informationsarchitektur von Heute, Bibel/Entdecken, Mein Weg, Journal und Mehr neu aufgebaut.
- Startseite auf „Was bewegt dich gerade?“ und zwei Einstiege fokussiert: Orientierung oder direkt zur Bibel.
- Erinnerungslücken als echte lokale Logik ergänzt: alte Wege und ältere Markierungen ohne spätere Reflexion werden ruhig wieder sichtbar.
- Rückblick unterstützt: Veränderung, weiter daran arbeiten, im Moment nicht, Gedanke, später erinnern. Nur explizit bestätigte Entwicklung beeinflusst den Baum.
- Persönliche Glaubensgeschichte aggregiert Bibelmarkierungen, Journal, Wege, Rückblicke und Entwicklungen chronologisch.
- Situationsführung auf 18 Themen erweitert.
- Bibel-Referenzen durch Buchcode-Normalisierung gehärtet; geführte/situative Referenzen gegen lokale Luther-Daten validiert.
- Journal als chronologische Linie statt Kartenraster gestaltet.
- Onboarding V4 auf Kernloop reduziert und überspringbar gemacht.
- Datenmigration ergänzt, bestehende Storage Keys bleiben erhalten.
- Import validiert Grundschema und lehnt beschädigte Backups ab.
- Service Worker auf neue Cache-ID umgestellt; kritische App-Dateien network-first/no-store.
- Netlify-Header und Redirects gehärtet.
