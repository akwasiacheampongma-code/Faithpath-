# FaithPath – AT-Quellbestand zurückgewonnen (18.10.2026)

**Ziel:** Die frühere Arbeit am Alten Testament wirklich auffinden und sicher weiterbearbeitbar machen – keine Neugenerierung oder Überschreibung der Airtable-Daten.

## Lieferumfang

- `books/*.json`: **39 Original-Bücher**, **1.289 Einheiten** (824–2112), **7.009 ursprüngliche Fragen**, vier Antwortoptionen, ursprüngliche richtige Position, Versbeleg, Erklärung, Einordnung, Reflexion und Airtable-Record-ID.
- `manifest.json`: nach Büchern aufgeschlüsselte Prüfzahlen und **Git-Blob-SHAs aller 39 Quelldateien**.
- `reference-mapping.json`: explizite Sonderzuordnungen für Luther-1912-Versnummerierung bei Joel und Maleachi, ohne Originaldaten zu verändern.
- `chapter-candidate-map.json`: **929 Kapitel und jeweils fünf vorläufig ausgewählte Quiz-IDs** (**4.645 Slots**). Alle übrigen Originalfragen bleiben als Abschnittsfragen erhalten; die Auswahl ist **noch nicht redaktionell freigegeben**.
- `editorial-proposals/MAL-3-4.json`: fünf neue, anhand des vorhandenen Luthertextes formulierte Fragen für die fehlende Kapitelabdeckung. **NEU_QA_OFFEN**, nicht Teil der 7.009 Originale.
- `scripts/audit-at-source.mjs`: unabhängige technische Prüfung der 39 JSON-Dateien, SHA1-Git-Blob-Identität, 7.009 IDs, 929 Kapitel und fünf Entwürfe.
- `.github/workflows/at-source-qa.yml`: lesender CI-Test ohne Merge, Push, Veröffentlichungsrecht oder Deployment.

## Warum noch keine Integration?

Die originalen Airtable-Statuswerte lauten `Gegen LU1912 geprüft`. Sie dokumentieren den früheren Arbeitsstand, ersetzen aber keine neue unabhängige theologische/redaktionelle Freigabe.

Die Antwortpositionen sind massiv unausgewogen: A 3.066 / B 2.702 / C 1.103 / D 138. Die Originalantworten wurden **nicht verändert**. Die spätere Anzeige sollte eine nachvollziehbare, getestete Permutation statt stiller Datenänderungen verwenden.

Die Kapitelbezüge zu Joel und Maleachi benötigen eine gesonderte Zuordnung, da die App-Kapiteleinteilung von den ursprünglichen Luther-1912-Stellenbezeichnungen abweicht. Für Maleachi 3 und 4 werden fünf Entwürfe zur Zweitprüfung benötigt.

## Sicher weiterarbeiten

```bash
node scripts/audit-at-source.mjs
```

Nächste Aufgabe: redaktionelle Zweitprüfung der fünf Maleachi-Entwürfe, vollständige automatische Referenz- und Versvalidierung gegen **beide** App-Bibelübersetzungen, stichprobenartige bis gezielte vertiefte Inhaltsprüfung, bewusste Freigabe der Kapitelzuordnung und risikoarme Integration auf eigenem Branch. Die bestehenden 7.009 IDs und Kapitel-Fortschrittsschlüssel dürfen nicht überschrieben werden.

**Keine Produktionsfreigabe, kein Merge und keine Änderung der installierten FaithPath-App.** Der Branch ist zuerst eine komplette, wiederherstellbare AT-Quellensicherung samt Plan für die Weiterbearbeitung.
