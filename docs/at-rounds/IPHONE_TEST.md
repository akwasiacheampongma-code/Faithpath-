# Physische Geräteprüfung – OFFEN

Keine der folgenden Prüfungen wurde als echter iPhone-/Safari-/VoiceOver-Test ausgeführt. Ausschließlich synthetische Daten auf einer gesondert genehmigten Test-Origin verwenden. Dieses Paket erteilt keine Veröffentlichungserlaubnis.

| Fall | Vorgehen | Erwartung | Ergebnis / Gerät / Safari-Version |
|---|---|---|---|
| Reader-Einstieg | 1. Könige 8, Luther1912 öffnen, ans Kapitelende scrollen | Fünf Fragen, freiwilliger Einstieg, Rückweg bleibt vorhanden | OFFEN |
| A-Abschluss | Alle fünf Fragen ansehen und ausdrücklich abschließen | B-Angebot erst danach, kein Autostart | OFFEN |
| Zweite Runde | Angebot wählen, alle fünf Fragen beantworten | 1273-Q3 erreichbar, Erklärungen und vier Optionen lesbar | OFFEN |
| Zweites Buch | Sammlung → 2. Könige → Kapitel15 → A und B | 1356-Q3 in B erreichbar; Buchstände getrennt | OFFEN |
| Deep Link | In frischem Testtab direkt B öffnen | Rückleitung zu A | OFFEN |
| Unterbrechung | Antwort wählen, Reload; nach nächster Frage erneut laden | Antwort/Cursor im selben Tab erhalten | OFFEN |
| Neustart | A neu starten, Dialog abbrechen, dann bestätigen | Abbruch ändert nichts; Bestätigung löscht nur A, B bleibt gespeichert/gesperrt | OFFEN |
| Vorhandene Nutzung | Normales NT-Quiz beginnen, Testkapitel öffnen, zur ursprünglichen Quizadresse zurück | NT-Frage/Antwort im laufenden Dokument erhalten | OFFEN |
| Reader-Rückweg | Von Versbereich in Luther1912 starten, zurückgehen | Richtiges Buch/Kapitel/Übersetzung/Versbereich | OFFEN |
| Mobile Schrift | 320/390 CSS-Pixel und Safari-Textvergrößerung 200 % | Kein horizontaler Überlauf; alle Aktionen durch Scrollen erreichbar | OFFEN |
| VoiceOver | Frage, vier Antworten, Ergebnis, Erklärung und B-Angebot durchlaufen | Eindeutige Namen, richtige Antwort zusätzlich als Text, sinnvoller Fokus | OFFEN |
| Offline | Vollständige SW-Vorbereitung online abwarten; offline laden | Beide Bibeln und Fixture im selben Tab verfügbar | OFFEN |
| PWA-Update | Auf derselben getrennten Origin TEST1→TEST2; Entwurf/Antwort behalten | Bewusstes Update; Daten und Antworten erhalten | OFFEN |

Installation einer PWA kann einen anderen SessionStorage-Kontext erzeugen. Die absichtlich tabgebundene Fixture-Persistenz ist kein dauerhaftes Nutzerkonto und kein produktiver Quizfortschritt. Ein Schließen des Tabs darf nicht als Datenverlust der eigentlichen FaithPath-Daten bewertet werden; deren Backups separat unverändert prüfen.

Dokumentieren: Datum, Modell, iOS/Safari-Version, installierte/Browseransicht, Build-ID, Screenshots, genaue Schritte, Soll/Ist. Redaktionelle Prüfung gesondert bestätigen; keine Freigabeflags im Code ändern.
