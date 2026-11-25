# Drei Bibelausgaben in OLIVA

Luther 1912, die Open Translation Bible und Schlachter 1951 nutzen einen gemeinsamen Reader. Kapitelwahl, Lesefokus, Schrift und Zeilenabstand, Fließtext und Einzelverse, Volltextsuche, Kapitelbestätigung, Notizen, Entwürfe, Lesezeichen und Markierungen sind pro Ausgabe nutzbar. Bibelstellen in Sammlung, Heute und Vorhaben führen zur zugehörigen Ausgabe. Der Wechsel bleibt im selben Kapitel. Beim Weiterlesen greift OLIVA auf den gespeicherten Versanker der gewählten Ausgabe zurück.

Die drei Texte werden in ihrer jeweiligen Verszählung verwendet. Die vorhandenen FaithPath-Fragen und geführten Wege behalten ihren geprüften Bezug zu Luther 1912. Hinweise im Reader nennen diesen Bezug, wenn der Text in einer anderen Ausgabe geöffnet ist.

## Quelle und Offline-Paket

Schlachter 1951 basiert auf dem USFM-Archiv von eBible.org unter CC BY 4.0. OLIVA zeigt die Quellenangabe im Reader, auf der Quellenseite, beim Kopieren und in den Offline-Lizenzdateien. Die App enthält 66 Bücher, 1.189 Kapitel und 31.101 Verse mit Text. Matthäus 21,44 hat im Archiv eine leere Zeile. Der Import belässt die Lücke. [Herkunft und Import](../content/schlachter-1951/README.md)

Die zusätzlichen Texte liegen in eigenen, bei Bedarf geladenen Web-Bundles. Der Service Worker nimmt sie mitsamt den Quellenhinweisen ins Offline-Paket auf. `npm run content:editions` prüft den Schlachter-Import und die lokale Versnummernübersicht gegen die gebündelten Daten.

## Persönliche Daten

Bestehende V11- und V12-Sicherungen bleiben importierbar. Luther-Referenzen und vorhandene Schlüssel behalten ihr Format. Bei der ersten Speicherung einer weiteren Ausgabe verwendet OLIVA Profildokument V13. Es ergänzt Ausgabekennungen für persönliche Bibelverknüpfungen und hält den letzten Abschnitt samt Versanker je Ausgabe fest. Die Einträge bleiben im bestehenden lokalen Speicher und in Klartext- und verschlüsselten Backups enthalten. V13-Sicherungen benötigen einen OLIVA-Build mit Unterstützung für mehrere Bibelausgaben.
