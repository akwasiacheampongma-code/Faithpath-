# QA Report — FaithPath V4 FP4-20260916-E

## Automatisiert / statisch geprüft
- JavaScript-Syntax: bestanden (`node --check`).
- 312 Einheiten / 1.560 Fragen geladen; keine doppelten Story-IDs.
- Alle 1.560 Fragen besitzen gültige Antwortlisten und Correct-Answer-Indizes.
- Beide Bibeln: 66 Bücher / 1.189 Kapitel; OTB 31.103, Luther 31.102 Verse.
- Alle 312 Story-Bereiche existieren in beiden lokalen Bibelsets; `to=999` wird nur als Kapitelende interpretiert.
- 150 Service-Worker-Assets geprüft; keine referenzierte Offline-Datei fehlt.
- Manifest-/HTML-Referenzen geprüft; Root-Deployment bleibt flach und ohne Build-Schritt.
- Hauptschema: Version 4; bestehende Storage-Keys bleiben kompatibel.

## Build-E-Regressionen
- Manipulierte Backup-ID kann keinen Inline-JavaScript-Code mehr ausführen.
- Doppelte importierte Weg-IDs werden eindeutig normalisiert; Löschen eines Weges löscht nicht versehentlich weitere Wege.
- Verschachtelte Defekte wie `steps: [null]` werden vor dem Restore abgefangen; ein fehlgeschlagener Import verändert den bisherigen Zustand nicht.
- Alte unvollständige optionale Bibelreferenzen werden sicher zu `null` migriert, ohne den ganzen Legacy-Import zu verwerfen.
- Unbekannte Bücher/Kapitel in Backups werden gegen den geladenen 66-Bücher-Index geprüft und abgelehnt.
- Topic → Bibel → Zurück, Guided Plan → Bibel → Zurück, Anfänger-Guide → Bibel → Zurück und Story → Bibel → Zurück funktionieren im Browserlauf.
- Gespeicherte Luther-Markierung öffnet in Luther, während eine bestehende globale OTB-Präferenz unverändert bleibt.
- Kontextuelles Öffnen einer Bibelstelle überschreibt den zuvor gespeicherten „Weiterlesen“-Stand nicht.
- Neuer Weg zeigt „gestartet …“ statt eines nicht vorhandenen letzten Rückblicks.
- Ein Rückblick mit bestätigter Entwicklung erscheint in der Glaubensgeschichte nur einmal als Entwicklung.
- Erinnerungsabgleich unterscheidet OTB/Luther und bei explizit verknüpften Reflexionen auch identische Doppel-Markierungen per Highlight-ID.
- Doppelte Markierung derselben Stelle/Übersetzung wird blockiert.
- XSS-Test mit HTML/Script-Payloads in Titel, Motivation, Schritt und Journaltext: kein Code ausgeführt; Inhalte werden escaped.
- Responsive Overflow-Check bei 320, 375, 390 und 768 px für Start, Bibel, Entdecken, Story, Orientierung, Thema, Wege und Sheet: kein horizontaler Overflow.
- Browser-Regressionslauf erzeugt keine Page-/Console-JavaScript-Fehler.

## Weiterhin aus B/C/D geprüft
- Baum wächst ausschließlich durch bestätigte Entwicklungen.
- 14-Tage-Snooze wird tatsächlich nach 14 Tagen fällig.
- Direkteinstieg „Zur Bibel“ öffnet „Lesen“.
- Bottom-Sheets stapeln sich nicht.
- Guided-Plan-Fortschritt wird im Backup gesichert/wiederhergestellt.
- Nicht zusammenhängende Verse werden nicht als falscher Gesamtbereich gespeichert.
- Kapitelende-Markierungen verwenden nur tatsächlich vorhandene Verse.
- Story-Reflexion → bestehender/neuer Weg funktioniert.
- Glaubensgeschichte lädt mehr als 120 Einträge in weiteren Blöcken nach.
- Quiz-Fortschritt erreicht nach der letzten beantworteten Frage 100 %.

## Noch nicht als vollständig abgeschlossen behauptet
Physische Multi-Device-Tests auf mehreren realen iPhones/iPads/Android-Geräten und ein vollständiger VoiceOver-Test stehen für einen breiten Store-Launch weiterhin aus. LocalStorage bleibt bewusst gerätegebunden; Cross-Device-Sync ist nicht Bestandteil dieses Builds.
