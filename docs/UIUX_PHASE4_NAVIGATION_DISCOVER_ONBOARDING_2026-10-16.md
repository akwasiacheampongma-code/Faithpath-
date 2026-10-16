# FaithPath – UI/UX Phase 4: Navigation, Entdecken und Onboarding

Stand: 16.10.2026. **Verbindlicher Implementierungsauftrag, noch keine UIUX4-Codeumsetzung, Geräteabnahme oder Release-Freigabe.**

## 0. Verifizierte Entwicklungsgrundlage

- Repository: `akwasiacheampongma-code/Faithpath-`.
- Entwicklungsbranch: `feature/uiux-phase4-navigation-discover-onboarding-20261016`, ausgezweigt vom Phase-3-HEAD `192675a6a7f602b7abf70d1df5e27b988066c980`.
- Phase 3: `FP4-20261016-G-STABLE1-UIUX3`, UIUX1–3 im Code; die unabhängige **physische iPhone-/Safari-/installierte PWA-/VoiceOver-Abnahme ist für alle drei Phasen noch offen**. Phase 4 darf in einem isolierten Branch entwickelt und im Browser überprüft werden, nicht in Produktion.
- Kein Merge in `main`; `main` ist divergent. Keine Produktion ändern, kein automatischer Netlify-Deploy, kein falscher Live-Preview-Link.
- Inhaltenutzung: 436 gemergte Geschichten mit 2.314 Nachlese-MC-Fragen plus bestehende FP-Stories, 260 separate NT-Kapitelquiz-Einheiten/1.300 Fragen, beide lokalen Bibeln. Persönliche V5-Daten, Import/Export, alle IDs/Links/Entwürfe, Schwert und Olivenbaum bleiben geschützt.

### Aktuell tatsächlich im Code

- `src/app.js::shell()`: vier feste Hauptnavigationseinträge **Heute / Bibel / Mein Weg / Journal**.
- `src/menu.js`: Drawer mit **12** Destinations in vier Gruppen (`today, bible, discover, quizzes, paths, journal, reviews, plans, guidance, history, marks, more`); Tastatur-/Fokus-/Inert-Logik.
- `src/app.js::more()`: separate Kacheln für persönliche Bereiche, Entdecken, Einstellungen/Daten; mehrere dieser Ziele sind bereits im Drawer oder den Hauptbereichen verlinkt. Settings und Daten sind mit `more?section=settings` und `more?section=data` getrennt.
- `src/app.js::discover()` und `storyResults()`: drei redaktionelle Story-Einstiege, Lebens-Themen, Suche, Buch- und Inhaltsfilter; Ergebnisse werden derzeit ohne Pagination komplett als HTML ausgegeben (bis zu 436 Storys + 260 Kapitel-Einheiten). Die sichtbaren Labels „Entdecken“/„Kapitelübungen“/„Quiz“ sind teilweise über mehrere Wege erreichbar.
- `src/app.js::guidance(), plans(), plan()`: Themen/Orientierung und geführte Wege, bereits vorhanden.
- `src/app.js::onboarding()`: drei Slides, zwei Abschlussaktionen, lokale Onboarding-Kennung `faithpath.onboarding.v4`. `onboard-next` führt bisher am Ende zu `guidance`, `onboard-skip` zur Bibel; selbst neue App-Nutzer müssen nicht neu im Glauben sein.
- `src/today-view.js`: für Erstnutzer schon zwei neutrale Einstiege **„Ich brauche Orientierung“** und **„Direkt zur Bibel“**. Keine widersprüchlichen Einstiege neu erfinden.

## 1. Produktziel

Ein Mensch soll in wenigen Sekunden wissen **wohin** und **warum**:
- **Heute:** persönlicher nächster Schritt oder neutraler Ersteinstieg.
- **Bibel:** lesen, Buch/Kapitel wählen, Markierungen, Bibelreise/Schwert.
- **Entdecken:** passende Geschichte, Verständnisfrage, Kapitelübung, Situation, geführter Weg – ohne redundante verwirrende Portale.
- **Mein Weg:** eigene Wege, Olivenbaum, Geschichte, Rückblicke.
- **Journal:** Gedanken, Notizen, Zuordnungen.
- **Mehr:** nur sekundäre Ziele und Einstellungen/Daten, nicht ein zweites vollständiges Hauptmenü.

**Keine fünfte dauerhaft sichtbare Tab-Leiste nur für „Entdecken“ einführen.** Die vier bestehende Tabs zunächst beibehalten. „Entdecken“ bleibt leicht erreichbar aus Bibel, Orientierung und Drawer. Eine IA-Änderung an den Tabs benötigt zuvor belegten Nutzwert und ausdrücklich dokumentierte Auswirkungen auf die vorhandenen Wege.

Die App ist weder ein Bibelquiz-Spiel noch ein Pflichtprogramm. Keine Streaks, keine Glaubensbewertungen, keine neuen Paywalls, KI-Chats oder sozialen Funktionen.

## 2. Arbeitspaket A – Navigationsaudit und vereinfachtes Menü

1. Vor jeder Änderung die **komplette Navigationskarte** auf Basis aller bestehenden Routen/Deep Links erstellen. Dazu die reale mobile Menü-Darstellung, Scrollbarkeit und Tab-/Escape-/Fokus-Reihenfolge prüfen.
2. Vorher-Screenshots: kleines iPhone `320×568`, `390×844`, `430×932`, Desktop `1440×900`, Hell/Nacht. Drawer auf, Mehr, Seiten-Hubs, tiefer Story-/Reader-/Weg-Link; leere/gefüllte persönliche Daten.
3. Klare Zuständigkeiten pro Bereich definieren; Drawer und Mehr nicht als zwei gleichwertige 12-Ziele-Menüs parallel präsentieren. Menü **nach Aufgaben clustern** (z. B. „Schnellzugriff“ / „Bibel & Entdecken“ / „Dein Weg“ / „Einstellungen“) mit ruhiger Hierarchie, nicht mehr Menüpunkte als vorher. Für Nebenziele bestehende Hubs nutzen.
4. **Kein Ziel verstecken oder löschen:** Für jede der zwölf vorhandenen Drawer-Destinations nachweisen: mindestens ein klar auffindbarer Einstieg, korrekte Route, Deep-Link-Kompatibilität, Tastaturzugang. Besonders `quizzes` muss trotz eventueller redaktioneller Eingliederung weiterhin als alte Route funktionieren; `history`, `reviews`, `marks`, `plans`, `guidance`, `more` sind nicht verwaist.
5. Bestehenden Fokus-/Inert-Schutz von `src/menu.js` verbessern, nicht zerbrechen. Öffnen fokussiert sinnvolles erstes Menüelement, Escape/Overlay/Navigation schließen korrekt; Fokus springt nicht nach Linknavigation in ein nicht mehr vorhandenes Menü. Kein verdeckter Fokus hinter der fixen Bottom Nav; Scrolllock und Safe Areas.
6. UI-Sprache konsistent: „Mein Weg“ vs „Meine Wege“, „Entdecken“/„Geschichten“ vs „Quiz“, „Rückblicke“/„Meine Geschichte“ sachlich unterscheidbar. Keine fachlichen Inhalte umbenennen und Links nicht in die falsche Ansicht routen.
7. Bei Drawer-/Mehr-Änderung eindeutige aktive Zustände für tiefe Routen (`read`, `merged-story`, `question`, `path`, `review`) prüfen und die bisherige Navigation/Back-Logik behalten. Untere Leiste auf schmalen Geräten vollständig erreichbar, auch bei Textzoom.

## 3. Arbeitspaket B – Entdecken ohne Überladung

1. `discover()` bleibt die Quelle für vorhandene Geschichten. **Nichts neu importieren, redaktionell schreiben, zusammenführen oder umnummerieren.** `discoveryItems()`/Runtime-Mapping ist maßgeblich.
2. Klare Einstiegswege anbieten: **Geschichten**, **Kapitelübungen** und **Themen / geführte Wege** als sofort erkennbare, logisch zusammenhängende Wahl, ohne an anderer Stelle die unveränderten Bereiche abzuschaffen.
3. Such- und Filterlogik beibehalten, aber die Ergebnisse **begrenzt/inkrementell anzeigen** (z. B. 20/40 pro Schritt), damit nicht bei jedem Tastendruck bis zu 696 Einträge neu als vollständige HTML-Liste aufgebaut werden. Deterministische Reihenfolge, stabile Zielroute, vollständige Zahl gefundener Ergebnisse; „Mehr anzeigen“ und Reset führen nie zu verlorenen Inhalten. Kein neuer Serverindex notwendig.
4. Exakte Suchbereiche bei Stories vs Kapitelquiz transparent machen. Filterwechsel setzt den Ergebnis-Offset nachvollziehbar zurück; Tastaturfokus und `aria-live` bleiben sinnvoll. Abbruch/Zurück kann vorherige Filter nach Möglichkeit erhalten, aber nie Daten persistieren, die bisher transient sind, ohne begründete Entscheidung.
5. Redaktions-Einstieg „Geschichte zum Anfang“ muss reale Storys zeigen, nicht künstlich „beliebte“ oder „für dich passende“ Inhalte ausgeben. Bei zero results eine hilfreiche Rückkehr ermöglichen. Keine unbestätigten individuellen Empfehlungen aus privaten Tagebuchinhalten ableiten.
6. Kapitelübungen bleiben bei 260 geprüften NT-Einheiten; AT-Kapitel nicht mit Phantomfragen ergänzen.
7. `Was beschäftigt dich?` und `Geführte Wege` bleiben eigenständig erreichbar. Möglichst konsistente visuelle Titel, kompakte Teaser und Kontext-Verlinkungen; keine neue Themen-Taxonomie und kein inhaltlich ungenaues Zuordnen der Bibelverse.

## 4. Arbeitspaket C – Onboarding als leichte Auswahl

1. **Neue App-Nutzer sind nicht automatisch neue Christen.** Unterschiedliche Einstiege ohne Schubladen:
   - „Ich brauche Orientierung“ → bestehende Themen-/Hilfeseite `guidance`
   - „Direkt zur Bibel“ → `bible`
   - „Mein persönlicher Weg“ als kurze **optionale** Einführung, nicht Pflicht / kein unmittelbarer Wegzwang
2. Aus den vorhandenen drei Slides einen kurzen, nachvollziehbaren Ablauf machen. Maximal eine knappe Produkt-Erklärung und zwei wirklich funktionierende primäre Wege im Erstkontakt. Eine zusätzliche Orientierung zu Journal/Olivenbaum kann optional sein.
3. **Nicht den Onboarding-Speicherschlüssel `faithpath.onboarding.v4` ändern**, keine neue verpflichtende Anmeldung oder externe Profile, keine automatische Wiederholung für Bestandsnutzer. Falls Abschlusslogik vereinfacht wird, weiterhin einen transparenten Skip- und Reopen-Pfad aus Einstellungen erhalten.
4. Nutzerwahl soll zum richtigen Ziel führen, der Dialog schließen und Fokus auf der neuen Hauptüberschrift landen. Über Browser-Back, Reload, Import/Export, installierte PWA und offline dürfen keine Onboarding-Loops entstehen.
5. Einstieg ohne persönliche Daten/Speicherung muss auch bei abgebrochener Einführung und bei Nutzer:innen mit nur Bibel-Leseverlauf funktionieren. Der zweite Pfad muss sofort verfügbar sein; keine „Glaubensprüfung“, Dateneingabe, Registrierung oder Monetarisierung im Onboarding.
6. Baum und Schwert nach kurzer sinngetreuer Erklärung als optionale Symbole, nicht als Rankings/Belohnungen. Die Kernloop-Philosophie bewahren: Bibel → verstehen → reflektieren → Handlung → Rückblick.
7. Thema VoiceOver: Fokuszustände/Semantik/Labels überprüfbar gestalten; echte iOS-VoiceOver-Abnahme bleibt eine separate offene Prüfung.

## 5. Arbeitspaket D – Konsistenz zwischen Einstiegen

- „Heute“ (UIUX1), Reader/Geschichten/Schwert (UIUX2), „Mein Weg“/Baum (UIUX3) und Journal in der Darstellung *nicht* grundlos umbauen. Änderungen an `src/today-view.js`, `src/paths-view.js`, `src/reader-view.js`, `src/journey-view.js` müssen begründet und möglichst vermieden werden.
- Keine Veränderungen der 4 Theme-Definitionen oder globalen Layoutsysteme ohne konkretes UX-Problem; für neue UI eigene eng gescopte CSS-Klassen, visuell konsistent mit dem vorhandenen Design.
- Bestehende `menuMarkup`, Dialog-Actions, Router/Hash-Routen und Verknüpfungen explizit dokumentieren; kein paralleles Navigations- oder State-System.
- Technisch: bestehendes Vanilla-JS + PWA/Service Worker, kein Frameworkwechsel. Reine UI-Selektoren (z. B. `discover-model.js`, `navigation-model.js`) und Views nur auslagern, wenn sie Code nachvollziehbar vereinfachen und testbar machen. Entwickler müssen Änderungen am Menü/Onboarding künftig anhand weniger klar benannter Module vornehmen können.
- Offline-first: kein Webservice für Filter, keine neuen Tracker, Cloud oder Font-CDNs. Lokal gespeicherte Nutzerdaten unangetastet, alle Texte escapen, HTML-Attribute/Dynamic Routes sicher kodieren.

## 6. Verbindliche Abnahme-/QA-Matrix

### Navigationsaufgaben

- Erstnutzer → Orientierung → Text lesen → zurück; Erstnutzer → Bibel → Kapitel lesen → zurück.
- Rückkehrer → persönlicher aktueller Schritt aus Heute → korrekt verknüpfter Weg, zurück zum Ausgangskontext.
- Nutzer → Entdecken → gefilterte Story → lesen → Frage → Reflexion → eigener Weg.
- Nutzer → Bibel → NT-Kapitelübung mit fünf Fragen → weiter zum Reader, ohne Pflicht.
- Nutzer → Menü → Geführte Wege/Markierungen/Rückblicke/Archiv/Daten & Backup und zurück.
- Nutzer → Direkt-URL/Deep-Link zu jeder bestehenden Route inklusive `quizzes`, `more?section=data`, `more?section=settings`; keinerlei 404/Fehlroute.
- Menü mehrfach auf/zu, Escape, Overlay, Touch, Tab-Reihenfolge, Dialogwechsel; Fokus und Rücksprung nicht verloren.

### Daten-/Stressfälle

- Leeres Onboarding / Skip / Reopen / mit nur Bibelverlauf / Bestandsnutzer (kein Re-Onboarding); kein persönlicher Datenverlust, kein zusätzlicher Persistenzschlüssel.
- Entdecken: alle 436 Storys und alle 260 Kapitelübungseinheiten über Suche/Filter/„Mehr anzeigen“ erreichbar; Abbruch, keine Treffer, Groß-/Kleinschreibung/Umlaute, lange Titel, schnelle Filterwechsel, keine Dopplungen oder Fehlzuordnungen.
- Verifizierte Inhaltsbasen inkl. 2.314 Nachlese-MC + 1.300 NT-Kapitelfragen, bestehende FP-IDs, Bibeltexte unverändert. Content-Hash muss bei reiner UIUX4-Arbeit exakt identisch bleiben.
- Geführter Fortschritt, Notizen, persönliche Wege, Erinnerungen, Schwert, Olivenbaum, Entwürfe, V3→V5-Migration, Export/Import, sichere Löschung/Rückgängig unberührt.
- Offline: erster kompletter Cache, reale Reloads, Content-Fallback, Service-Worker-Update **UIUX3→UIUX4 auf derselben lokalen Origin**, bewusstes Aktivieren, bytegleiche persönliche Speicherstände vor/nach Update und danach funktionierende Routen.
- Vorher/Nachher **echte** Chromium-Screenshots zu Drawer, Mehr, Entdecken (leer/gefüllt/gefiltert/no-results), Onboarding (Erstnutzer/Skip) jeweils 320×568, 390×844, 430×932 und desktop; Hell/Nacht plus Atmosphärisch/Papier-Samples.
- 200%-Textgröße, 44px Touchflächen, 320px horizontal overflow=0, Safe-Area-Simulation, Reduced Motion, axe/WCAG 2.1 AA Regelstichprobe, Screenreader-Landmarks/Titel, Tastatur-Fokus.
- Legacy Regressionen UIUX1/2/3, Node, Browser, Kapitelquiz, MC-/Story-Runtime, Import/Backup/Offline. Alte tests nicht bloß umbenennen/ausklammern. Geänderte erwartete UI-Beschriftungen mit echter voriger/neuer Semantik belegen.

### Akzeptanzkriterien

- Ein Erstnutzer kann ohne Anmeldung/Fragenzwang entweder Orientierung oder die Bibel **im ersten sinnvollen Bildschirmbereich** wählen (390×844).
- Alle bestehenden Ziele bleiben über maximal wenige verständliche Interaktionen auffindbar; der Audit enthält eine **Vollständigkeitsmatrix über alle zwölf Menüziele** mit alten und neuen Wegen.
- Bei 320×568 sind Menü schließen, Kernaktionen, Filter und Bottom Nav ohne Überdeckung erreichbar. Die Seite darf natürlich vertikal scrollen.
- Entdecken rendert nicht mehr ungebremst alle Einheiten; Suche/Sortierung/Filter geben jede reale Geschichte bzw. Kapitelübung ohne Duplikate wieder.
- Mehr führt sekundäre Dinge statt eines unstrukturierten Doppelmenüs; Daten/Backup und Einführung sind direkt auffindbar.
- Keine inhaltliche Veränderung, keine Migration, keine Produktionsänderung, keine neuen Pflichtschritte.

## 7. Vorgehensweise / Auslieferung

1. Nur lesend alle Ist-Zustände, Routen und Baselines analysieren; Navigation Map und Screenshots vor Änderungen erstellen.
2. A Navigation/Mehr: kleine Tests zuerst (RED), Implementierung, Browser-Screenshots, Commit.
3. B Entdecken: Modell/Filter/Pagination-Regressionen zuerst (RED), Implementierung, Browser-Screenshots, Commit.
4. C Onboarding: neutrale Zweige/Bestandsnutzer/Skip/Reopen/Focus zuerst (RED), Implementierung, Browser-Screenshots, Commit.
5. D komplette Regression über alle Bereiche/Locales, responsive, Offline, Update, Back/Deep Links, Schutzdateien, UIUX1–3, Accessibility.
6. Buildkandidat nur mit nachgewiesener Build-ID `FP4-20261016-G-STABLE1-UIUX4` (oder tatsächliche eindeutige neue Build-ID), Hashes und lokal gegen frischen git-archive Build bytegenau reproduzieren.
7. Ausgabe: Commits auf dem Phase-4-Branch; technische Design-/Architekturentscheidung; Navigation Route Coverage; komplette QA-Matrix/Logs, Vorher/Nachher-Screenshots, reproducible Netlify-Deploy-ZIP mit `index.html` in Wurzel, separates Review-/Screenshot-ZIP, SHA-256, Build-ID und Content-Hash, manuelle iPhone-Gates der UIUX1–4.
8. **Keine eigenständige Preview-Veröffentlichung/Prod-Merge.** GO nur für isolierte Browser-/Geräteprüfung bei grünen Gates; echte iPhone/Safari/Home-Screen-PWA/VoiceOver-Freigabe durch Nutzer bleibt erforderlich. Keine Behauptung, dass automatisierte Browsertests eine Produktionsfreigabe bedeuten.
