# Changelog — FaithPath V4

## FP4-20260916-E
- Backup-Import gegen manipulierte IDs/XSS gehärtet: importierte IDs werden auf ein sicheres Format normalisiert, doppelte IDs werden eindeutig gemacht und unbekannte Bibelreferenzen werden vor dem Ersetzen lokaler Daten abgelehnt.
- Verschachtelte Backup-Daten werden tief normalisiert/validiert (`steps`, `reviews`, `milestones`, Links, Journal, Markierungen, Reflexionen, Events und Guided-Plan-Fortschritt); fehlerhafte Importe bleiben atomar und verändern den bestehenden Stand nicht.
- Legacy-Backups mit unvollständigen optionalen Bibelreferenzen bleiben importierbar; die defekte Referenz wird sicher verworfen statt den ganzen Import zu blockieren.
- Reader merkt sich seinen Ursprung (Thema, Anfänger-Guide, Guided Plan, Story, Weg, Journal oder Markierung) und führt mit „Zurück“ wieder dorthin.
- Gespeicherte Luther-/OTB-Referenzen öffnen in ihrer gespeicherten Übersetzung, ohne die globale Bibelpräferenz still zu verändern.
- Kontextuell geöffnete Referenzen überschreiben den echten „Weiterlesen“-Stand nicht mehr.
- Bestätigte Entwicklungen werden in der Glaubensgeschichte nicht mehr zusätzlich als identischer Rückblick doppelt angezeigt.
- Erinnerungen an Markierungen werden jetzt über konkrete Bibelreferenz, Übersetzung und – sofern vorhanden – Highlight-ID abgeglichen statt nur über den sichtbaren Labeltext.
- Neue Wege starten ohne fingierten „letzten Rückblick“; die Startseite zeigt bis zum ersten echten Rückblick stattdessen „gestartet …“.
- Doppelte Markierungen derselben Stelle in derselben Übersetzung werden verhindert; nach dem Markieren wird die Auswahl geschlossen.
- Reader-Fehler (z. B. ungültiger/fehlender Bibeltext) werden abgefangen statt als unhandled JavaScript-Fehler durchzulaufen.
- Backup-Dateien sind auf 10 MB begrenzt, derselbe Import kann nach Erfolg/Fehler erneut ausgewählt werden, Export-Blob-URLs werden iOS-freundlicher verzögert freigegeben und transienter UI-Zustand wird nach Restore zurückgesetzt.
- Weg-Löschung räumt zugehörige Reminder-/Dismiss-Zustände mit auf; Step-/Review-Mutationen sind gegen fehlende Ziele abgesichert.
- Service-Worker-Cache auf Build E angehoben.

## FP4-20260916-D
- Baumstufe hängt jetzt ausschließlich von ausdrücklich bestätigten Entwicklungen ab; ein bloß angelegter Weg verändert den Baum nicht mehr.
- Ein expliziter 14-Tage-Snooze wird nach genau diesem Termin fällig und nicht mehr von der normalen 21-Tage-Schwelle blockiert.
- Hauptdaten auf Schema-Version 3 normalisiert: alte Buchcodes in Markierungen, Journal-Referenzen und Weg-Verbindungen werden beim Laden/Import auf die aktuellen Codes migriert.
- Backup-Import normalisiert fehlende verschachtelte Arrays und lehnt falsch typisierte Weg-Daten ab, bevor sie später die UI beschädigen können.
- Öffnen eines Weges setzt den aktiven Bereich zuverlässig auf „Mein Weg“.
- Verbundene Bibelstellen sind aus dem Weg wieder direkt öffnbar; verbundene Reflexionen öffnen ihren gespeicherten Text und optional den zugehörigen Bibelabschnitt.
- Glaubensgeschichte blendet Einträge ab 121 nicht mehr still aus; weitere Einträge lassen sich in 120er-Schritten nachladen.
- Geführte Themenwege speichern neue Bibel-Verbindungen im gleichen kanonischen Linkformat wie manuell verbundene Stellen.
- 12 gezielte Build-D-Regressionstests sowie kompletter Content-/Offline-Asset-Check bestanden.
- Service-Worker-Cache auf Build D angehoben.

## FP4-20260916-C
- Direkteinstieg „Zur Bibel“ öffnet jetzt zuverlässig den Tab „Lesen“ statt „Entdecken“.
- „In 2 Wochen erinnern“ setzt nur noch einen 14-Tage-Snooze und verschiebt nicht zusätzlich den letzten Rückblick um 21 Tage.
- Bottom-Sheets ersetzen vorhandene Dialoge statt sich übereinander zu stapeln.
- Backups enthalten jetzt auch den Fortschritt der geführten Wege (`faithpath.guidedPlans.v1`); ältere Backups bleiben importierbar.
- Nicht zusammenhängende Versauswahlen können nicht mehr versehentlich als durchgehender Bereich gespeichert werden.
- Markierungen und Journal-Bibellinks respektieren die beim Speichern verwendete Bibelübersetzung; ältere Markierungen ohne Feld gelten als OTB.
- Quiz-Fortschritt erreicht nach Beantwortung der letzten Frage 100 %.
- Sieben gezielte Regressionstests für diese Fehler bestanden.
- Service-Worker-Cache auf Build C angehoben.

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
