# Entdecken und Open Translation Bible

Der Entwurf übernimmt aus den Claude-Referenzen die gemeinsame Übersicht für Wege, Themen und Geschichten, eine vollständig antippbare Karte zum Weiterlesen, Buchgruppen und die Wahl von Buch und Kapitel direkt im Reader. Das OLIVA-Designsystem und vorhandene Illustrationen bilden die Grundlage. Die App behält fünf Hauptbereiche und den direkten Schreibzugang in der Sammlung.

- Heute zeigt beim ersten Besuch das Galiläa-Motiv mit dem Einstieg zu Markus 4,35–41. Bei einem vorhandenen Lesestand führt eine kompakte Karte zum tatsächlichen Abschnitt und gegebenenfalls zum letzten Vers. Der persönliche A51-Baum folgt direkt.
- Entdecken bündelt die neun Wege, 18 Themen und 436 Geschichten. Eine ausgewählte Karte eröffnet die mobilen Weg- und Themenlisten. Die Suche, Filter, Quellen und bestehenden Direktlinks bleiben erreichbar.
- Die Buchliste ordnet die 66 Bücher nach Gruppen und verwendet weiterhin den Gesamt-, AT- und NT-Filter. Beim Lesen öffnet der Kapiteltitel die Kapitelwahl mit suchbarer Buchauswahl. Fließtext und Einzelverse, Buchschrift und serifenlose Schrift sind einstellbar. Schriftgröße und Zeilenabstand verwenden die bisherigen Einstellungen. Das Schriftbild wird als separates lokales Gerätefeld gespeichert.
- Die Einführung verwendet ein vorhandenes Galiläa-Motiv. Die mobile Samenansicht im Garten nimmt weniger Höhe ein. Der leere Sammlungszustand beschriftet die vorhandene Schreibaktion.

## Open Translation Bible

Die zweite Ausgabe ist der vollständige offizielle deutsche OTB-Text mit 66 Büchern, 1.189 Kapiteln und 31.103 nummerierten Versen. Bibelsuche, Kapitelwechsel, beide Textdarstellungen und das Kopieren mit Namensnennung gehören zur Ausgabe. 141 Quellanmerkungen bleiben separat lesbar. Die OTB verwendet ihre Quellnummerierung. Die Zahlenprüfung beider integrierten Editionen fand identische Kapitelnummern. 3. Johannes 1,15 ist in der OTB als eigener Vers enthalten.

Luther 1912 bleibt der Standard. Bestehende Stellenlinks, Studienfragen, Reflexionen, Versmarkierungen, Lesezeichen und Lesepositionen behalten ihren Bezug zu Luther 1912. Die OTB-Leseansicht speichert diese Daten nicht unter Luther-Referenzen. Der Wechsel der Ausgabe erfolgt über die Bibelübersicht. Die OTB verwendet keine zusätzliche Datenübermittlung. Der OTB-Text wird im Web aus einem separaten Bundle geladen und gehört zum Offline-Paket.

Quelle, Bedingungen und Rechtehinweise sind in der App unter Quellen erreichbar. Der Import liefert die OTB-Daten unter CC BY-SA 4.0 als eigene Edition aus. Die Quelle bleibt ohne OLIVA-Konto zugänglich. [Lizenz- und Importinformationen](../content/open-bible-de/README.md)

## Prüfung

Die reproduzierbare Inhaltsprüfung erfordert den offiziellen Upstream-Stand aus der Lizenzdatei. Benötigt werden `lang/de-DE` und `LICENCE.md` aus dem gepinnten Commit.

```sh
npm run typecheck
npm test
npm run build
python3 scripts/import-open-bible.py /pfad/zur/upstream-quelle --check
```

Die getrennte Testseite besitzt ihren eigenen Browser-Speicher. Die bestehende Beta und die bestehende private Vorschau haben eigene Bereitstellungen und lokale Speicherbereiche.
