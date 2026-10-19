# Nutzertest: Dein erster Samen

Status: **OFFEN – keine Person wurde durch Codex getestet.** Alle Zahlen unten
sind künftige Abnahmekriterien. Automatisierte Bedienprüfungen ersetzen kein
Verständnisurteil. Zehn Personen getrennt testen, ohne Vorführung oder Erklärung.

## Vorbereitung und Durchführung

- Frisches synthetisches Profil; keine privaten Anliegen erfragen. Teilnehmer
  können ein erfundenes Anliegen verwenden. Getrennte Geräte/Profile, keine Cloud.
- Personen mit und ohne Bibelerfahrung berücksichtigen; Bibelerfahrung und
  Erfahrung mit Apps getrennt freiwillig notieren, niemals Glaubensstärke bewerten.
- Moderation: „Bitte denke laut. Ich prüfe die App, nicht dich. Du darfst jederzeit
  aufhören. Sage mir, wenn du Hilfe brauchst.“ Erst nach dem Versuch helfen.
- Keine Bildschirm- oder Tonaufnahme ohne separate Einwilligung. Kommentare
  anonym erfassen; keine Gebete/Anliegen wortwörtlich protokollieren.
- Zeit vom Vorlesen der Aufgabe bis Ende messen. Hilfe mit Anlass notieren.
  Abbruch/überspringen zählt als erlaubte Nutzerentscheidung, aber nicht als
  erfolgreicher Abschluss einer konkret verlangten Erstellungsaufgabe.

| Test | Neutrale Aufgabe und Nachfragen | Kriterium |
|---|---|---|
| UX-01 | App öffnen. „Wofür ist FaithPath? Was ist ein persönlicher Weg? Was unterscheidet sie von einer gewöhnlichen Bibel-App?“ Keine Begriffe vorab erklären. | ≥8/10 erklären: Bibel+eigene Worte+kleiner Schritt+späterer Rückblick bleiben verbunden. Reines „Quiz/Bibel lesen“ reicht nicht. |
| UX-02 | „Lege für ein eigenes oder erfundenes Anliegen einen ersten Weg an.“ Anliegen, Bibelgedanke, eigene Worte, Schritt und gespeicherten Weg beobachten. | ≥8/10 vollständig ohne Unterstützung. |
| UX-03 | In einer Eingabe unterbrechen, zurückgehen, Pause machen, Bibel öffnen und später fortsetzen. „Wo bist du? Was geht als Nächstes? Was bleibt gespeichert?“ | Keine Sackgasse oder verlorene Eingabe; Hilfebedarf pro Teilaufgabe erfassen. |
| UX-04 | Baum ohne Erklärung zeigen. „Was stellt er dar? Warum verändert er sich? Was bedeuten die sieben Bilder?“ | ≥8/10 erkennen dokumentierte persönliche Geschichte; keine Glaubensbewertung, kein Aufgabenlevel. |
| UX-05 | Pflanzen und Baum normal, danach mit reduzierter Bewegung zeigen. „Wie angenehm, verständlich und hochwertig wirkt es? Stört es beim Lesen? Ist das Bild groß genug?“ | Visuelle Qualität und Angemessenheit jeweils Mittelwert ≥4/5. Dauerbewegung, Irritation und Größenwunsch offen notieren. |
| UX-06 | Synthetisches gefülltes Profil: Bibel direkt öffnen, vorhandenen Weg finden, Einführung freiwillig erneut starten und wieder verlassen. | Direkte Bibel erreichbar, kein ungefragtes Onboarding, keine Datenverluste. Hilfebedarf dokumentieren. |

## Bewertung

1 sehr schwach / störend, 2 eher schwach, 3 mittel, 4 gut, 5 sehr gut.
Nach jeder Aufgabe Erfolg, Hilfe, Zeit, Verständnisproblem, anonymen Kommentar
und Bewertung in `UX_TEILNEHMER.csv` eintragen. Zwölf Bewertungsfragen nicht aus
technischen Tests ableiten. `UX_ZUSAMMENFASSUNG.csv` bleibt bis zur Studie leer.

Scheitert ein Verständnisziel oder meldet jemand glaubensbewertende Wirkung,
Ursache am konkreten Bildschirm prüfen und den betroffenen Ablauf nachbessern.
Kein Release-GO allein aus einem grünen Browserlauf. Freigabe braucht mindestens
die Zielwerte UX-01/02/04/05, keine Datenverlustfälle und das physische Geräte-Gate.
