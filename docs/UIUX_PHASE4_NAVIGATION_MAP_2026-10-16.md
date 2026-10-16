# UIUX4 – Navigationskarte und Schutz der alten Routen

Basis `19ce343`/UIUX3. Vor Produktänderung aus Router und Drawer erstellt. Alle Routen bleiben Hash-Routen, keine parallele Navigation. Vier Tabs unverändert: Heute, Bibel, Mein Weg, Journal.

## Zwölf bisherige Drawer-Ziele

| Alte Route | Bisher | Neuer klarer Einstieg | Interaktionen ab geöffnetem Drawer |
|---|---|---|---:|
| today | Drawer / Tab | Drawer / Tab Heute |1|
| bible | Drawer / Tab | Drawer / Tab Bibel |1|
| paths | Drawer / Tab | Drawer / Tab Mein Weg |1|
| journal | Drawer / Tab | Drawer / Tab Journal |1|
| discover | Drawer / Mehr / Bibel | Drawer Entdecken / Bibel Entdecken |1|
| quizzes | Drawer Quiz | Entdecken → Fragensammlung, alte URL unverändert |2|
| plans | Drawer / Mehr | Entdecken → Geführte Wege |2|
| guidance | Drawer / Mehr | Entdecken → Was beschäftigt dich?; neutraler Ersteinstieg Heute/Onboarding |2|
| marks | Drawer / Mehr / Bibel | Drawer Markierungen / Bibel Markierungen |1|
| reviews | Drawer / Mehr | Drawer Rückblicke / Mehr Rückblicke / Wegkontext |1|
| history | Drawer / Mehr | Drawer Meine Geschichte / Mehr Meine Geschichte / Mein Weg |1|
| more | Drawer / Hauptmenü | Drawer Mehr / direkte Einstellungen, Backup, Einführung |1|

Drawer von 12 auf 9 Links, mit Aufgaben-Gruppen. Mehr führt sekundäre persönliche Geschichte sowie Einstellungen/Daten/Einführung, kein vollständiges zweites Hauptmenü. Bestehende Inhalte werden nicht umbenannt oder neu zugeordnet.

## Vollständige Router-Familien

| Route | Zweck / gültiges synthetisches Beispiel | Zuständiger Menübereich |
|---|---|---|
| today | Heute |Heute|
| guidance; topic/:id | Orientierung; topic/angst |Entdecken|
| bible; chapters/:book | Bücher; chapters/JHN |Bibel|
| read/:book/:chapter/:translation | read/JHN/3/otb, ?from=1&to=3&origin=path%2 Fpersonal-path |Bibel|
| bible-journey; bible-journey/:book | Schwert und Buchübersicht |Bibel|
| marks; mark/:id | Markierungen; mark/highlight-existing |Markierungen|
| discover | Geschichten-/Inhaltssuche |Entdecken|
| chapter-quizzes; chapter-quizzes/:book | NT-Sammlung; chapter-quizzes/JHN |Entdecken|
| quizzes; quiz/:id | Bestehender Fragenindex; quiz/10070, ?return=read%2 FJHN%2 F 3%2 Fotb, ?complete=1 |Entdecken|
| story/:id | Legacy-Geschichte/ Kapitel-Einstieg, story/10070 |Entdecken|
| merged-story/:id | merged-story/NS-0001; ?reflection=1 |Entdecken|
| question/:id | question/N-0001 oder FP-0001 |Entdecken|
| paths; path/:id | Wege; path/personal-path, ?section=story, ?step=step-0 |Mein Weg|
| tree | Originaler Olivenbaum |Mein Weg|
| plans; plan/:id; guide/:id | Geführte Wege und Einheiten |Entdecken|
| journal; compose | Journal / bestehender Editor |Journal|
| entry/:id; reflection/:id | Originalgedanken |Journal|
| reviews; review/:id | Rückblicke und richtige Originale |Rückblicke|
| history | Ganze persönliche Geschichte |Meine Geschichte|
| more; more?section=settings; more?section=data | Sekundärziele / Einstellungen / Backup |Mehr|
| licenses; content-status | Textquellen / Inhaltsprüfstatus |Mehr|

Bestehende Zurück-Verknüpfungen, Frage-/Reader-/Weg-Origins, historische Quiz-Routen und sichere IDs bleiben. Die reale Browser-Coverage ergänzt PASS/FAIL und getestete Beispiele im Abschlussbericht. Nicht vorhandene persönliche IDs werden nicht erfunden; dafür ausschließlich synthetische Fixtures verwenden.
