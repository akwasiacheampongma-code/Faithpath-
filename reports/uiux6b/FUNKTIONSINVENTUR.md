# Zuordnung der 22 Designbereiche zur echten App

Die Studie ist eine visuelle Referenz. Kein Demo-Modell und kein Demo-Backupadapter wurde integriert.

| Bereich | Bestehende Route | Weiterhin maßgeblich | Erhaltener Vertrag |
|---|---|---|---|
| Heute | today | today-view.js / selectToday | Echter aktueller Weg, letzter Lesekontext, Gedanke und vorhandener Entwurf |
| Bibelreader | read/:book/:chapter/:translation | app.reader / verbunden/reader-flow.js | Alle Verse, beide Übersetzungen, vorhandene Auswahlaktionen |
| Journal | journal | journal-model.js / journal-view.js | Bestehende IDs, Suche, Filter, stabile Pagination |
| Editor | compose / existing dialogs | openForm / drafts.js / writingDialog | Originalformular, Entwurfsbesitz und Transaktionen |
| Wege & Archiv | paths | paths-model.js / paths-view.js | Aktiv/Archiv, vorhandene Wege und nächste Schritte |
| Wegdetail | path/:id | paths-model.js / paths-view.js | Originalschritte und verknüpfte Momente |
| Damals und heute | review/:id / reviews | path-review-context.js / reviews-view.js | Originalsnapshot, Datum und spätere Worte |
| Olivenbaum | tree | tree-view.js / tree-branches.js / domain.js | Sieben Originalbilder, Schwellen und bestätigte Entwicklung |
| Schwert | bible-journey[/book] | journey-view.js / journey-sword.js / bible-journey.js | Ein zentrales Buch-Schwert-Siegel; unveränderte echte Zählung |
| Quiz | question/:N-ID / quiz/:legacy-ID | sourceQuestion / quiz / runtime-model.js | Originalantworten, Erklärungen und Fortschrittsschlüssel |
| Entdecken | discover | discover-model.js / discover-view.js | 696 Einheiten, Filter, 20 Treffer und Weiterladen |
| Geschichte | merged-story/:NS-ID / story/:id | mergedStory / story-flow-view.js | Originalzuordnung, Fragenfolge und freiwillige Reflexion |
| Kapitelübungen | chapter-quizzes[/book] | chapter-questions.js / chapterCollection | 260 vorhandene NT-Einheiten, 1300 unveränderte Fragen |
| Themen | guidance / topic/:id | guidance / topic / content.js | 18 vorhandene Themen und zugehörige Bibelstellen |
| Geführte Wege | plans / plan/:id / guide/:id | plans / plan / content.js | Bestehende Abschnitte, Reflexion und gespeicherter Stand |
| Onboarding | more -> introduction / first launch | onboarding-view.js / onboarding | Orientierung oder direkt zur Bibel; keine Registrierung |
| Mehr | more / drawer | navigation-view.js | Alle ursprünglichen Ziele und vier Hauptbereiche |
| Einstellungen | more?section=settings | themes.js / themePicker / more | Alle vier echten Theme-IDs und alte Einstellungen |
| Erinnerungen | reviews / more?section=settings | reminders-view.js / reviews-view.js | Freiwillige, App-öffnungsbasierte Hinweise; kein Push-Versprechen |
| Backup | more?section=data | backup-model.js / backup-view.js / store.js | Originalexport, Dateiprüfung, Vergleich, Größenlimit |
| Wiederherstellen | original two-stage dialogs | importFile / store.js / journal-storage.js | Zwei explizite Stufen, Locks, Quota und Frischeprüfung |
| Sonderzustände | marks / mark/:id / licenses / content-status / invalid route | existing app renderers / verbunden/system.css | Leer, Fehler, Laden, gelöscht, Archiv, Undo und Lizenzen |

Zusätzlich prüft der Quellvergleich alle 34 bisherigen `kind`-Zweige und 79 bestehenden Action-Namen. Das ist eine Bestandskontrolle, kein Beweis für jeden denkbaren Laufzeitpfad. Laufzeitnachweise stehen in der QA-Matrix.
