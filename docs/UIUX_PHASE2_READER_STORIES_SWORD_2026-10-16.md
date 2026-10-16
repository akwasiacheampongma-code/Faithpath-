# FaithPath – UI/UX Phase 2: Bibelreader, Geschichten und Bibelreise-Schwert

Stand: 16.10.2026. **Spezifikation und Abnahmekriterien, noch keine neue UIUX2-Implementierung.** Phase-1-Geräteabnahme und Produktionsfreigabe nicht als erledigt behaupten.

## Verifizierte Ausgangslage

- Repo: `akwasiacheampongma-code/Faithpath-`.
- Entwicklungsbasis: `feature/uiux-phase1-today-20261016` @ `bdc9dc53cc5e379b8a07845683654bab14e91ab7` (UIUX1; technische Browser-QA PASS, echter iPhone-Test/Produktion offen).
- Phase-2-Branch: `feature/uiux-phase2-reader-stories-20261016`; in diesem Branch arbeiten, nie direkt auf `main`/Produktion.
- Die 1.300 finalen NT-Kapitelquizfragen, 2.314 Nachlese-Multiple-Choice-Fragen, FP-Geschichteninhalte, lokalen OTB-/Luther-1912-Texte und STABLE1-Persistenzregeln bleiben erhalten.
- `src/app.js` enthält derzeit `reader()`, `readerChapterQuestions()`, `mergedStory()`, `sourceQuestion()`, `quiz()`; Prüfe deren tatsächliche Flows und Links, bevor du sie umbaust.
- `src/bible-journey.js` verwaltet ausschließlich tatsächliche `chapter-explored`-Ereignisse, `src/journey-sword.js` erzeugt `progressiveSword()` aus `journeySummary()`, `src/experience-view.js` zeigt Schwert-Hub, Buchfortschritt und `journeyAcknowledgement()` am Kapitelende. Das **Schwert existiert bereits**; nichts neu erfinden und Fortschrittslogik nicht unbemerkt ändern.
- Die vier Themes Hell/Atmosphärisch/Papier/Nacht existieren. UIUX1 Heute unverändert halten.

## Zielbild

Der Nutzer soll ohne Navigationsbruch dem Weg folgen können:

**Bibelstelle lesen → verstehen (freiwillige Fragen) → persönlich reflektieren (freiwillig) → eigenen Weg fortsetzen**.

Daneben zeigt **„Deine Bibelreise“** mit einem **einzigen symbolischen Schwert**, welche Kapitel wirklich erkundet wurden. Biblische Grundlage: Epheser 6,17 („Schwert des Geistes“ / Wort Gottes). Es ist ein Lesesymbol, **kein geistlicher Rang, keine Waffen-/Kampfmechanik und keine Glaubensbewertung**. Der Olivenbaum bleibt die andere, persönliche Symbolik.

## A – Bibelreader: lesen und handeln

1. Aktuellen Reader zuerst visuell auditieren (echte Chromium-Screenshots mit denselben Daten vor Änderungen). Prüfe die 320×568-, 390×844-, 430×932-Ansichten in Hell und Nacht.
2. Lesetext über Buch-/Kapitelwahl und sekundäre Bedienelemente stellen. Buch, Kapitel, Übersetzung erreichbar lassen, auch wenn man zurückkommt. Keine unnötigen zusätzlichen Toolbar-Zeilen.
3. Typografische Ruhe: Versnummern, Zeilenhöhe, lange Namen/Verse, Lesebreite, Kontrast, Leserfokus und Dark Mode. Vorhandene Markierungsfarben/Notizen/Wegverknüpfung nicht verändern; Bedienbarkeit der Auswahl/Leiste gezielt verbessern.
4. Am echten Ende eines **NT-Kapitels** sinnvoll „5 Fragen zum Kapitel“ anbieten; zusätzlich „Weiterlesen“, „Gedanken festhalten“ und ggf. „Deine Bibelreise“ ermöglichen, ohne Quizpflicht und ohne ein überladenes Aktions-Dashboard.
5. **AT-Kapitel ohne freigegebenen Kapitelquizbestand** dürfen keine Phantomfragen oder leeren Quiz-Panels zeigen. Keine neuen AT-Fragen generieren.
6. Keine automatische „Belohnung“ beim bloßen Öffnen eines Kapitels. Fortschrittsereignisse nur nach den dokumentierten, bestehenden Regeln. Öffnen ≠ Durchlesen; Durchlesen ≠ Verstehen oder geistlicher Fortschritt.
7. Vorhandene Buch-, Kapitel-, Übersetzungs-, Ursprung-, Versauswahl- und Deep-Link-Routen unverändert bzw. nachweislich kompatibel halten.

## B – Zusammengeführte Geschichten und Nachlese-Fragen

1. Die aktive Geschichte in `mergedStory()` und ihre `flow_items` ist die einzige Quelle. **Keine erneute Zusammenführung** und kein Legacy-Datenimport.
2. Übergang „Geschichte/Abschnitt lesen → Fragen zur Geschichte“ klarer gestalten. Die tatsächliche Lesereferenz muss zum richtigen Text führen und zurück zur richtigen Geschichte.
3. Vorhandene primäre FP-/N-IDs, Reihenfolge, Aliasse, Quellen, Fragen, vier Antwortoptionen, richtige Indizes und Erklärungen **bytegleich** erhalten.
4. Jede Wissensfrage hat klaren Kontext, eindeutige Antwortinteraktion und nach Auswahl eine verständliche Erklärung. Nächste/vorherige Frage aus der bestehenden `flow_items`-Reihenfolge ohne Verlust des richtigen Geschichtenkontextes. Nicht ungewollt Antwortzustand zwischen IDs wiederverwenden.
5. Nach der letzten Frage eine natürliche **freiwillige** Einladung zur bereits vorhandenen Reflexion anbieten. Die Reflexion ist kein Multiple Choice und wird nicht bewertet; sie muss in den bestehenden Journal-/Wegfluss gehen, nicht in ein neues Speicherungssystem.
6. Rückwärtsnavigation, direkte Links auf einzelne Fragen, Reload, offline sowie Abbruch/Wiederaufnahme sauber halten. **Keine irreführende Behauptung**, dass alle Fragen dauerhaft als abgeschlossen gespeichert würden, wenn es das aktuelle Datenmodell nicht unterstützt.
7. Die bisherige FP-Kapitelquiz- und `quiz()`-Laufzeit darf nicht mit dem Story-/Nachlese-Fragenlauf versehentlich vermischt werden.

## C – Das Bibelreise-Schwert sichtbar integrieren

Das Schwert ist **Teil dieser Phase, kein späteres Add-on**. Es ist aber auf `bible-journey` und den Kapitelabschluss begrenzt, nicht auf der Heute-Seite als neues großes Widget.

1. Zuerst vorhandenes `progressiveSword()` und den tatsächlichen Schwert-Hub im Browser prüfen. Vorher/Nachher-Screenshots für 0, 1, mehrere, viele und alle erkundeten Kapitel; nicht nur SVG-Code lesen.
2. Schwert als gestalterisches Markensymbol hochwertig, klar, vollständig, responsiv und im Nachtmodus kontrastreich zeigen. Ein ruhiger Olivenzweig-/Bibelbezug ist zulässig; kein animiertes Kampfschwert, keine Rang-/Power-Level, keine konfessionell überzeichneten Versprechen.
3. **Ein zentrales Schwert** für die gesamte Bibelreise. Die bereits existierenden Buchzeilen und Kapitelübersichten zeigen Fortschritt pro Buch. **Nicht 66 einzelne Schwerter** hinzufügen; nur bei echter nachweisbarer UX-Verbesserung eine kleine Buchfortschrittsdarstellung statt weiterer Schwerter.
4. Leser sieht nach bestehendem `chapter-explored`-Ereignis einen **dezenten Hinweis „Kapitel erkundet“** mit Link zum Schwert. Keine konfettiartigen Belohnungen, keine Quizpflicht, keine vergüteten Punkte.
5. `journeySummary()`, Events, alte Einträge, Zählregeln und Sword-Proportionen nur dann ändern, wenn ein reproduzierbarer fachlicher Fehler belegt ist; sonst nur Darstellung und Zugänglichkeit verbessern.
6. Screenreader nennt z. B. „X von 1.189 Kapiteln erkundet“; visuell ist der Fortschritt nicht nur durch Farbe erkennbar. Keine Gleichsetzung von Anzahl und Glaubensstärke.
7. Die Verlinkung zu Epheser 6,17 funktioniert in der vorhandenen lokalen Bibel und hat passenden Kontext.

## Architektur für menschliche Wartung

- Bestehender Stack: modularer JavaScript-Code, bestehende PWA-/Service-Worker-Architektur. **Kein React-/Vue-/Svelte-Neuschreiben in Phase 2**. Falls große `app.js`-Bereiche sinnvoll und sicher herauslösbar sind, in kleine reine Model-/View-Module mit dokumentierten Adaptern aufteilen.
- Bevorzugt getrennte Commits und eigene Tests für A, B und C; keine Phase ohne grünen Build. Reihenfolge: A → B → C. Vor dem C-Commit soll klar sein, wie Schwert/Leser wirklich zusammenhängen.
- CSS präzise scopen; vorhandene vier Themes verwenden. Keine Änderung an globaler Navigationsstruktur ohne reproduzierbare Notwendigkeit.
- Datenschutz/offline: keine Cloud-, Analytics-, Tracking- oder KI-Abhängigkeit, keine externe Font-/Icon-CDN-Pflicht.
- Daten- und Schema-Schutz: alle Bibeln, FP-/N-Fragen, Kapitel-IDs, Story-Mappings, Fortschrittsschlüssel, Store, Migration, Import/Export, Entwürfe, Notizen, Marker, persönliche Wege unverändert halten. Keine neue Migration.
- Source-Hash/Content-Hash, geänderte Dateien, Diffstatistik, identische geschützte Pfade in überprüfbarem Artefakt festhalten.

## Test- und Freigabegates

1. Vorher/Nachher mit denselben synthetischen Zuständen, **echte** Browser-Screenshots 320×568, 390×844 und 430×932 in Hell, Nacht sowie Stichproben der übrigen Themes; Reader, Geschichte, MC+Erklärung, Reflexion, Schwert.
2. Reader: Kapitel wechseln, Buch und Übersetzung wechseln, Absatz/Verse lesen, Versauswahl (Einzel-/Mehrfachauswahl), markieren, Notiz, Weg verknüpfen, Auswahl leeren, zurücknavigieren; Tastaturfokus und 200% Textgröße.
3. NT-Kapitelquiz: Starten, richtig/falsch, Erklärung, Quiz beenden, Kapitel weiter; AT ohne Quiz bleibt frei von Phantomaktionen.
4. Geschichten: mindestens FP-only, N-only und gemischte/aliasierte real vorhandene Flows; erste, mittlere und letzte Frage; Abbruch, Reload, Offline, direkte Deep Links, Fortschritt/Journal; Reflexion nicht automatisch bewerten. Beispiele nur tatsächlich vorhandene Quellen, keine erfundenen Testfälle als Produktdaten.
5. Schwert: initial 0, 1, viele, sämtliche 1.189 erkundeten Kapitel; Buchfortschritt und Wiederholung desselben Kapitels ohne doppelte Zählung; Event-Invarianz beim Update; Epheser-Referenz.
6. Regressionen: Node, Browser, STABLE1, NT-Excelmaster, Nachlese 2.314, Reader/Quiz/Story, Service-Worker-Update, Export/Import, Offline-Reload, PWA-Caching. Vorheriger NMC2→UIUX1-Stand bleibt reproduzierbar.
7. Keine ungesicherten claims von 100% semantischer Inhaltsprüfung durch visuelle Browser-Tests. Für echte iPhone/Safari/Home-Screen/VoiceOver offen lassen, bis physisch geprüft.
8. **Phase 1 echtes Gerät weiterhin offen**: Phase 2 darf isoliert entwickelt und browsergetestet werden; keine Produktionsfreigabe oder Rollout ohne beide Gerätegates.
9. Für jedes Subsystem eigene Vorher/Nachher-Videos oder Screenshots, kompakte QA-Matrix, dokumentierte Bugs/Fixes und GO/NO-GO.

## Umfangsgrenze / fertig wenn

**Fertig** ist ein stabiler `UIUX2`-Preview-Kandidat, bei dem Nutzer Lesen → Verständnis → Reflexion → Weg verständlich durchlaufen können und die vorhandene Schwert-Bibelreise als ruhige, sinnvolle Fortsetzung sehen. Das Schwert darf die Hauptaktionen nicht überlagern. Kein Umbau der Heute-Seite und keine neue Content-Autorenschaft.

Abschlusslieferung: isolierter GitHub-Branch mit testbaren Commits, `CHANGELOG`/Entscheidungsbericht, Screenshots, Testnachweisen, Build-ID/SHA-256/Content-Hash, vollständiges Netlify-Deploy-ZIP (**nicht** automatisch deployen), Prüf-ZIP und Anleitung für manuelle Geräteabnahme. `main` und Produktions-Netlify bleiben unverändert.
