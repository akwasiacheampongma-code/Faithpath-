# FaithPath – Redaktionelle Nachlese-MC-Nachprüfung

Stand: 16. Oktober 2026 · Quelle: `FaithPath_Nachlese_MC_2026-10-16.zip`, Branch `content/nachlese-multiple-choice-20261016`.

## Ergebnis

- 2.314 aktive Nachlese-Wissens- und Verständnisfragen sind im Ausgangspaket vorhanden; 2.258 besitzen bereits eine Viererauswahl.
- **56 Fälle** haben bisher keine MC-Auswahl. Dafür liegen in `56_redaktionsvorschlaege.json` und der Excel-Liste **56 einzeln formulierte Vorschläge** mit vier unterschiedlichen Antwortmöglichkeiten, markierter Lösung, altem Original und zugrunde liegender Bibelstelle vor.
- Kein Originaldatensatz und keine N-ID wurde in der laufenden App geändert; das Paket enthält **Vorschläge zur fachlichen Freigabe**, keinen eingespielten Patch und keine Behauptung menschlicher Bibelredaktionsabnahme.
- Eine unabhängige, strukturelle Prüfung der ausgelieferten `nachlese-questions.json` ergab: 2.314 unveränderte IDs und Originalfelder; ausschließlich `a`/`c` für 2.258 Datensätze hinzugefügt, 56 unverändert. Für alle 2.258 liegt genau eine originalgetreue richtige Antwort unter `a[c]` vor.

## Warum die 56 nicht nur technische Lücken sind

Manche Originalfragen sind binär (Ja/Nein), einige sind zu weit gestellt, einige nennen mehr als eine wahre Möglichkeit. Bei mehreren Fällen ist die semantische Zuordnung fehlerhaft. Die Vorschläge präzisieren daher die Frage und machen vier eindeutig unterscheidbare Aussagen prüfbar, statt drei erfundene Varianten derselben falschen Antwort zu erzeugen.

### Quellfehler, die fachlich besonders kontrolliert werden müssen

- **N-0388 – Psalm 121,4:** In der bestehenden Originalantwort fehlt die Verneinung am Satzende; sachlich korrekt ist, dass Israels Hüter nicht schläft und nicht schlummert.
- **N-1524 – Johannes 8,40:** Die bisherige Frage verlangt eine Tat Abrahams, während die Antwort eine Tat seiner Gegner beschreibt. Der Vorschlag fragt nach deren Tötungsabsicht.
- **N-1798 – Apostelgeschichte 17,28:** Das ausdrücklich als Dichterwort gekennzeichnete Zitat ist „Wir sind seines Geschlechts“, nicht „In ihm leben, weben und sind wir“. Der neue Fragetext unterscheidet ausdrücklich beide Aussagen.
- **N-1913 – Römer 7,24:** Die alte Frage fragt „Wen“, obwohl der Antworttext die Frage „Wer wird mich erlösen ...?“ enthält.
- **N-2218 – 1. Johannes 3,17:** Die alte Frage nennt nicht die entscheidende Voraussetzung des verschlossenen Herzens.
- **N-2240 – Offenbarung 1,1:** Der Empfänger der von Gott gegebenen Offenbarung ist Jesus Christus; gezeigt werden soll sie seinen Knechten. Die neue Frage unterscheidet Gabe und Adressaten.

### Weitere Querverweisprüfung

**N-1535 – Johannes 10:** Die vorgegebene Antwort über Leben in Fülle steht im beigefügten OTB-Text in Johannes 10,10, in der lokal mitgelieferten Luther-Datei jedoch unter Versnummer 11 (Verssegmentierung). Dieser Unterschied muss von Sol anhand der offiziellen Verszählung und der konkreten lokalen Bibeldateien technisch/inhaltlich behoben werden. **Nicht einfach die Referenz ändern, ohne den Vers-Split in der Luther-Datei separat zu prüfen.**

## Zusatzprüfung der 2.258 existierenden MC-Fragen

Ein unabhängiger heuristischer Vergleich der richtigen Antwort mit allen falschen Optionen meldete **227 potenziell ähnliche Antwortpaare in 150 unterschiedlichen Fragen**. Das sind **keine 150 bestätigten Inhaltsfehler**: Textähnlichkeit kann bei Zahlen- und Verneinungsvarianten pädagogisch sinnvoll sein. Die Treffer sind nur eine priorisierte Sichtungsliste in `mc_optionen_auffaellig.csv`.

Die Heuristik ist kein theologischer Beweis. Eine vollständige menschliche Einzelprüfung sämtlicher 2.258 Antwortsätze wurde hier nicht durchgeführt. Die bestehende modellgestützte Prüfung im Sol-Paket ersetzt diese auch nicht vollständig.

## Freigaberegel

1. Die 56 redaktionellen Vorschläge einzeln gegen den Bibeltext und Sinnzusammenhang prüfen. Antworten und drei Ablenker dürfen keine zweite wahre Option erzeugen.
2. Konfliktfälle und Referenzbesonderheiten priorisieren; Korrekturen nur über freigegebene Änderungsliste übernehmen.
3. Danach die 150 heuristisch auffälligen MC-Fragen sichten und reale Probleme gezielt korrigieren.
4. Auf einem neuen Branch nur genehmigte Datensatzfelder übernehmen, N-IDs, `source_story_id`, Story-Reihenfolge, Reflexionen und den NT-Kapitelquizbestand unverändert lassen.
5. Tests: Differenz der Ausgangsdaten, 4 unterschiedliche Optionen/1 Lösung je aktive Quizfrage, Bibelreferenz + sinnvolle Erklärung, gespeicherte Nutzerfortschritte, Reader, Stories, Offline, PWA-Update. Neue Build-ID erst nach erfolgreichem Build.
6. Keine Änderungen auf `main`, Netlify-Produktion oder bestehender QA-Origin, bevor eine getrennte Preview freigegeben ist.

**Status:** Editorial Draft, nicht zur automatischen Produktionseinspielung freigegeben.
