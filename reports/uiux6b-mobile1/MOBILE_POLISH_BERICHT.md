# FaithPath Phase6B – Mobile Polish MOBILE2

## Ergebnis und Grenzen

„Verbunden“ bleibt die bestehende App. Geändert wurden ausschließlich die Markenstruktur im Header, die Journal-Präsentation, die mobile Überschriftenhierarchie, Reader-/Fragenabstände und die Build-ID. Es gibt kein neues Speichermodell, keine Migration, keine Inhaltskorrekturen und keine Veröffentlichung.

Die vom Nutzer gezeigten iPhone-Probleme wurden als ernsthafte Layoutbefunde untersucht. Abstände und Größenhierarchie sind im Originalbuild reproduzierbar. Ein Markenbruch wurde zusätzlich mit individuell vergrößertem Markentext reproduziert. **Der genaue Auslöser auf dem betreffenden iPhone ist nicht nachgewiesen.** In den normalen Chromium-Läufen bei 100/150/200% Roottext brach die ursprüngliche Marke noch nicht um. Weder Safari-Seitenzoom noch iOS-Text-Autosizing dürfen deshalb als erwiesene Ursache bezeichnet werden.

Die echte iPhone-/Safari-/VoiceOver-Abnahme bleibt **OFFEN**, ebenso die Gerätegates der Phasen 1–5 und des ursprünglichen 6B-Builds. Für einen Produktionsrelease gibt es keine Freigabe. Der neue Build ist für die erneute isolierte Geräteprüfung vorgesehen; die abschließenden automatisierten Ergebnisse stehen in [QA_SUMMARY.json](QA_SUMMARY.json) und [QA_MATRIX.md](QA_MATRIX.md).

Automatisiert bestanden: **191 Unit-Tests, 41 ursprüngliche Browserprogramme, 14 ergänzende Programme, 1.104 Layoutfälle, 84 zusätzliche Zustände und neun gezielte Layoutregressionen**. Der echte lokale HTTPS-Worker-Übergang umfasst elf Prüfungen. Beide Buildläufe liefern dieselben 366 Dateien.

## Tatsächlich geprüfter Stand

| Nachweis | Stand |
|---|---|
| Arbeitsbranch | `feature/uiux-phase6b-verbunden-20261017` |
| Unveränderter Ausgangs-HEAD | `49ec83cbef95f16c6d1e3fa795964d22d59ac65a` |
| Ausgangs-Appquellstand | `f89eccf923ae186ad132b779a99b829e0cf9e155` |
| Ausgangs-Build | `FP4-20261017-G-STABLE1-UIUX6B-CANDIDATE` |
| Ausgangs-Buildhash | `911c3f4a66eccc6d07f1e2f34f35256fd09f228b606af77f522ac5973e7a5852` |
| MOBILE2-Appcommit | `637af1190912fed4b8d06c854d399b4077667514` |
| Neue Build-ID | `FP4-20261017-G-STABLE1-UIUX6B-MOBILE2` |
| Preview-ZIP SHA-256 | `e2146116a83949398e53a17ffb2dadf76b2103292962d7dd0919785cafd7ee9f` |
| Neuer Buildhash | `d1fd4804aaaeefc19b018776714b9607d92d404ab733b0e1a0619a6f083c6db0` |
| Unveränderter Content-Hash | `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309` |

Der gewünschte Livehost `faithpath-stable1-qa-20261015.netlify.app` ist in dieser Umgebung nicht netzwerkfreigegeben: CONNECT403. Ein ergänzender ausschließlich lesender Netlify-Metadatenabruf wurde mit 401 abgewiesen. Deshalb ist die Gleichheit des **jetzt** ausgelieferten Livehosts mit dem eingefrorenen Ausgangsbuild nicht unabhängig bestätigt. Die lokale Prüfung verwendet dessen vollständigen, gehashten 366-Dateien-Build. Es wurden keine Netzwerksperren umgangen und keine Site-Einstellungen geändert.

Die vom Nutzer beschriebenen TinyFish-Ergebnisse sind ein externer Ausgangshinweis für Desktopbreite. Sie wurden hier am gesperrten Livehost nicht wiederholt und gelten nicht als mobile Safari-Abnahme. Die nachfolgenden eigenen Prüfungen betreffen die exakt benannten lokalen Builds.

## Bestätigte Befunde und Ursachen

### M1 – Markenname kann auseinanderbrechen: P2

**Code:** `src/app.js`, Shell; `src/verbunden/foundation.css`, `.wordmark`, allgemeine `a`-Umbruchregel und `.topbar`.

Der Markenname war ein anonymer Text-Flexeintrag neben Icon und getrenntem Punkt. Auf Links galt `overflow-wrap:anywhere`; eine atomare Markenregel fehlte. Der Header kombinierte dies mit einer geerbten festen Höhe. Bei320px Breite und separat auf 64px vergrößertem Markentext entstanden im unveränderten Build zwei Textzeilen. Dies ist ein gezielt synthetischer Robustheitstest, kein nachgebildeter Safari-Zoomwert.

**Korrektur:** Explizites `.brand-name`-Element einschließlich Punkt; `white-space:nowrap`, normaler Wortumbruch und nicht schrumpfende Marke. Der Header erhält automatische Höhe und kann das Menü in eine weitere Zeile nehmen. Ziel und zugänglicher Linkname bleiben gleich. Keine Ellipse, kein Abschneiden und keine Schriftverkleinerung.

**Nachweis:** `evidence/focused-red/results.json` und `evidence/additional/focused/results.json`; zusätzliche Fallback-/Tastaturprüfung im unabhängigen Review. Roottext 200% mit Systemfont-Fallback und simuliertem 44px-Safe-Inset funktioniert. **Grenze:** Ein zusätzlicher 64px-Zwang auf die breitere Ersatzschrift überschreitet bei 320px den verfügbaren Platz; dies liegt außerhalb der geprüften 200%-Roottextbedingung und wird nicht als gelöst ausgegeben.

### M2 – Journalüberschrift und Abstände verdrängen die Schreibaktion: P2

**Code:** `src/verbunden/personal.css`; Altregeln `.depth-page .page-heading` und Journal-Überschriften in `styles.css`.

Die später geladene Journalregel setzte 2.7rem und überstimmte die schmale Überschrift: Bei den gleich spezifischen `.page .page-heading h1`- und `.journal-page .page-heading h1`-Selektoren entscheidet die Kaskadenreihenfolge. Bei200% entsprach dies 86.4px. Zusätzlich blieb 20px Padding der spezifischeren alten Unterseitenüberschrift aktiv. Zusammen mit Vorspann, großer Schreibkarte und erneut großem Leertext begann die Schreibaktion bei 320px/200% erst bei etwa 542px; die Navigation begann bereits bei 432px.

**Korrektur:** Journalüberschrift mobil 1.9rem, weiterhin vollständig mit Textvergrößerung skalierend. Explizit verantwortetes Padding und kürzere Abstände. Im leeren Journal entfallen der zusätzliche Vorspann und die wiederholte große Frage; eine eindeutige Aktion „Gedanken festhalten“ und eine einzige kurze Hilfszeile bleiben. Gefüllte Journale behalten Suche, Filter, Zeitachse und Verknüpfungen. Der Counter und sein Statusbereich bleiben vorhanden.

**Nachweis:** Bei320×568/200% liegt die gesamte Schreibaktion im gezielten Test bei 217–380px, oberhalb der Navigation bei 432px. Der bestehende Editor, Entwürfe und Datenzugriffe werden nicht ersetzt.

### M3 – Reader reserviert unnötig viel Raum vor dem Bibeltext: P2

**Code:** `src/verbunden/reader.css`; geerbte generische `details`-/`summary`-Regeln aus `styles.css`.

Der Aa-Disclosure erbte eine zusätzliche Trennlinie und Padding. Kapitelkopf, weitere Zierlinie, Außenabstände und Seitenpadding addierten sich. Im Beispiel Psalm 119 bei 390×844 erschien der erste Vers erst bei etwa 384px.

**Korrektur:** Der Aa-Disclosure verantwortet Border/Padding selbst und behält 44px Mindestziel. Mobil werden Kapitelkopf und Außenabstände kompakter; die redundante Zierlinie entfällt. Der erste Vers erscheint jetzt bei etwa 315px. Die Lesegröße bleibt 1.25rem und die volle Aa-Steuerung bleibt erhalten. Buch, Kapitel, Übersetzung, Gedankenaktion und Fokusmodus bleiben erreichbar.

### M4 – Lange Quizfrage verwendet zu dominante Display-Typografie: P2

**Code:** `src/verbunden/discover.css`, `.quiz-title` und Überschrift vorhandener Nachlesefragen.

2.35rem bei einer längeren Wissensfrage verdrängten die Antworten. Im reproduzierten Johannes15-Beispiel nahm die Frage allein etwa 210px ein.

**Korrektur:** Nur mobil 1.65rem mit 1.3 Zeilenhöhe, kürzere Kopfabstände; Antwortgrößen, vier Optionen, Referenzen, richtige Antwort, Erklärung und Speicherschlüssel bleiben unverändert. Dasselbe Beispiel benötigt nun etwa 103px. Große Texte dürfen natürlich vertikal weiterlaufen.

### M5 – Gemeinsame mobile Titelgröße bricht normale Wörter: P2

**Code:** `src/verbunden/foundation.css`, `.page .page-heading h1`; eigene feste Überschriftenwerte in `personal.css` und `discover.css`.

Die echte Bildkontrolle des ersten internen Kandidaten zeigte einen Fehler, den reine Überlaufmessungen nicht erkannten: Bei320px/200% waren die normalen Titelwörter „Einstellungen“ und „Bibelreise“ mitten im Wort getrennt.70.4px Titelgröße ergaben für „Einstellungen“ etwa 410px intrinsische Breite bei 284px Inhaltsspalte. Auch der bereits verkleinerte Readerkopf ließ bei diesem Zustand noch keinen Bibeltext vor der Navigation erscheinen.

**Korrektur:** Ein gemeinsamer, nur mobil definierter Titel-Token `--v-page-title` mit 1.75rem und unter 351px1.5rem. Pfad-/Geschichtenüberschriften verwenden ihn statt eigener fester Übergrößen. Heute und Journal behalten ihre eigene redaktionelle Hierarchie. Desktopwerte bleiben erhalten. Bei320px/200% benötigt „Einstellungen“ nun etwa 268px und bleibt ein Wort. Die erste Readerzeile liegt bei 381–421px vor der Navigation bei 432px; die Leseschrift bleibt unverändert 40px.

**Nachweis:** Drei zusätzliche gezielte Tests wurden vor der Korrektur rot und danach grün. Die neue Matrix prüft die beiden Titelwörter sowie die erste Readerzeile ausdrücklich. Der erste interne MOBILE1-Kandidat mit Hash 50dfd0fa… ist deshalb kein finaler Releasebeleg. Seine unvollständigen Läufe bleiben unter `qa-output/uiux6b-mobile1/trial1` erhalten. Der finale MOBILE2-Kandidat erhält eine vollständige neue Regression.

## Weitere untersuchte Ursachen

| Prüfpunkt | Ergebnis / Grenze |
|---|---|
| Viewport | `width=device-width, initial-scale=1, viewport-fit=cover`; kein `maximum-scale` und kein deaktivierter Benutzerzoom. Gemessene CSS-Breiten entsprechen den Testbreiten. |
| iPhone-Bildgröße | Aus 591×1280 Rasterpixeln lässt sich weder CSS-Breite noch Safari-Zoom sicher ableiten. |
| iOS Text Autosizing | `text-size-adjust:auto` im Ausgangsstand. Keine unabhängige Safari-Reproduktion; nicht als erwiesener Bug gewertet. Keine pauschale Autosizing-Sperre eingeführt. |
| Seitenzoom / dynamische Schrift | Benutzereinstellungen des betroffenen Geräts nicht maschinell messbar. Tests vergrößern den Roottext auf 100/150/200%; keine Gleichsetzung mit realem Safari-Zoom. |
| Fonts | Drei unveränderte lokale Fonts; vollständiges Laden im Bildlauf geprüft. Ersatzschrift separat geprüft. Kein neuer externer Fontdienst. |
| Safe Areas | Header mit44px synthetischem Top-Inset geprüft. Keine physische Aussage zu Safari-Browserleisten, Home-Indikator oder Tastatur. |
| Fixierte Navigation | Originaler ResizeObserver misst gewrappte Navigation; Scrollreserve bleibt. Nativer Tab-Test am Kapitelende bei 320×568/200%: Link vollständig oberhalb der Navigation, wie im Ausgangsbuild. |
| Dunkles Markenicon | Chromium rendert es ohne den im Nutzerfoto sichtbaren schwarzen Träger. Ein Safari-spezifisches Filter-/Compositingproblem ist nicht bestätigt; Originalicon nicht ersetzt. |
| Leer / gefüllt | Beide Journalzustände sowie viele Wege und sehr langer Journaltext gesondert geprüft; keine Demo-Datenmodelle. |

Ein vorübergehender Fokusmesswert nach einem programmatischen Modus-/Skalierungswechsel wurde überprüft und als nicht reproduzierbarer Defekt verworfen. Beim normalen Tab-Ablauf lagen im Kandidaten und im Ausgangsbuild die Linkgrenzen bei 179–330px, die Navigation begann bei 432px. Daraus wurde keine zusätzliche Codeänderung abgeleitet.

## Prüfumfang und Belege

Die finale Bildmatrix umfasst 23 Zustände × vier Themes × vier Viewports × drei Textgrößen (320×568, 390×844, 430×932, 1.440×900; 100/150/200% Roottext). Sie prüft geometrische Überläufe, CSS-Viewport, angewandte Textgröße, lokale Fonts, Bilder,44px-Hauptnavigationsziele sowie vollständige Verse/Antwortoptionen in den relevanten Ansichten. Sie umfasst Heute, Bibelübersicht, Psalm 119 beider Übersetzungen, Kurzkapitel, Reise/Schwert, Baum, viele Wege und Wegdetail, gefülltes und leeres Journal, langen Eintrag, Editor, Rückblicke, Entdecken einschließlich leerer Suche, Geschichte, beide Quizarten, Mehr, Einstellungen und Backup.

Zusätzlich wurden alle 41 aktuellen Browserprogramme der ursprünglichen Regression, 191 Unit-Tests mit Content-Pretest, die NT-/Nachlese-Quellvalidatoren, die bestehenden 6B-Editor-/Reader-/Fokus-/Kontrasttests und sekundäre Zustände erneut ausgeführt. Alle 41 ursprünglichen und alle 14 ergänzenden Programme endeten mit Exit 0. Die tatsächlichen Ausgänge und eventuelle Wiederholungen sind in der maschinenlesbaren Matrix aufgeführt; daraus folgt keine Behauptung, sämtliche historischen Hilfsskripte des Repositories direkt ausgeführt zu haben.

Der Update-Treiber installiert den exakt gehashten alten6B-Build auf einer lokalen, isolierten HTTPS-Origin, aktiviert danach MOBILE2 ausdrücklich und prüft Offline-Neuladen, beide Bibeln, Fragen, gespeicherte Markierungen, historische Fortschritte, Migration und Entwürfe. Dies ist ein realer Service-Worker-Übergang in Chromium, **kein Netlify-Deploy und kein iPhone-PWA-Test**.

**Bildqualität:** Ein erster Matrixlauf blockierte den Service Worker und erzeugte dadurch eine echte, aber vom Testaufbau verursachte Offline-Fehlermeldung. Seine Aufnahmen wurden verworfen. Finale Vergleichsaufnahmen verwenden den aktiven echten Worker und die originale CSP. Frühe Reviewaufnahmen ohne `worker-`-Präfix und transiente Diagnostikbilder sind ebenfalls keine Freigabebelege. Die finalen Bilder wurden erneut aufgenommen; Fehlversuche werden in der QA-Dokumentation offengelegt.

Die [Vergleichsgalerie](screenshots/index.html) zeigt echte Browser-PNGs. Beide Liefergalerien wurden zusätzlich bei 390 und 1.440 Pixeln im Browser geprüft: 24 Filter-/Bildvergleiche, funktionierende lokale Bildlinks und Tastaturreihenfolge, keine Browser- oder HTTP-Fehler. Vollständige Matrixbilder sind zusätzlich im separaten Screenshot-ZIP enthalten. Die Vergleichszustände verwenden identische synthetische Daten, Themes, CSS-Breiten und Roottextgrößen. Das Nutzerfoto ist ein unabhängiger Gerätebefund und wird nicht als pixelgleicher lokaler Vorherzustand ausgegeben.

Die visuelle Sichtprüfung umfasst zusätzlich acht Übersichtstafeln mit den23 Ansichten bei 390px/100% und 320px/200% in allen vier Themes sowie ausgewählte Original-PNGs und 21 unabhängige Reviewaufnahmen sowie die Tafel der 21 zusätzlichen Nacht-Zustände. Die 1.104 automatisierten Fälle bedeuten nicht 1.104 einzeln durchgeführte menschliche Lesbarkeits- oder Screenreaderprüfungen. Details und verbleibende enge Zustände sind in [VISUELLE_PRUEFUNG.md](VISUELLE_PRUEFUNG.md) festgehalten.

Die ergänzende Kontrastprüfung ordnet die 22 früheren manuellen Referenzbefunde echten App-Elementen zu: 28 Gruppen, 140 berechnete Messungen, keine Unterschreitung der jeweils angesetzten Schwelle. Dies ersetzt weder die vollständige WCAG-Prüfung noch native Safari-Auswahllisten oder VoiceOver.

## Daten, Inhalte und Wartbarkeit

175 geschützte Dateien sind bytegleich:162 Inhalts-/Baumdateien und13 Kernmodule einschließlich Store, Domain, Entwürfen, Importvalidierung, Journaltransaktionen, Bibelreise, Themes und Worker-Vorlage. Die statische Inventur bestätigt alle 34 alten Routenfamilien und 79 Aktionsnamen; Laufzeitnachweise stehen zusätzlich in der Testmatrix. Die Inhaltsvalidierung umfasst 1.300 NT-Fragen und 2.314 Nachlesefragen. Automatisierte Browserprofile enthalten ausschließlich synthetische Einträge; persönliche Bestandsdaten wurden nicht gelesen oder verändert.

Es gibt keine neue Abhängigkeit und keinen Frameworkwechsel. Layoutregeln bleiben in den vorhandenen verantwortlichen CSS-Modulen. Explizite, lokal kommentierte Selektoren überschreiben die nachgewiesenen Altregeln. Die weiterhin vorhandene große historische CSS-Datei wird im Rahmen dieses begrenzten Patches nicht umgebaut.

## Verbleibende Risiken und Entscheidung

- **OFFEN:** Physisches iPhone, Safari-Seitenzoom, dynamische iOS-Schrift, Browserleisten, installierte PWA, echte Bildschirmtastatur und VoiceOver. Siehe [Geräteanleitung](IPHONE_ABNAHME.md).
- **OFFEN:** Unabhängiger aktueller Livehash-Abgleich wegen 403/401. Der neue Build ist nicht veröffentlicht.
- Bei200% bleibt umfangreicher Inhalt vertikal länger; alle Inhalte auf einen Bildschirm zu zwingen wäre kein zulässiges Ziel.
- Bestehende Aa-Beschriftungen umbrechen bei 200% teilweise wenig elegant innerhalb des Popups; die Bedienung ist erreichbar. Keine neue Funktion oder umfassende Menüumgestaltung deshalb.
- Die künstliche 64px-Ersatzschriftprobe überschreitet die verfügbare Breite; normale bis200% vergrößerte Rootschrift einschließlich Fallback wurde gesondert geprüft. Keine unbegrenzte Textgrößengarantie.

**Empfehlung:** Den gehashten MOBILE2-Kandidaten zur erneuten isolierten iPhone-Abnahme verwenden. **Keine Produktionsfreigabe**, solange das reale Gerätegate offen ist. Weder main noch Live-Netlify wurden geändert.

## Reproduktion

Im isolierten Checkout des Appcommits 637af11 mit vorhandener Node24-Umgebung:

```sh
npm test
FAITHPATH_OUT=qa-output/uiux6b-mobile1/candidate npm run build
FAITHPATH_OUT=qa-output/uiux6b-mobile1/repeat npm run build
node scripts/verify-preview-build.mjs qa-output/uiux6b-mobile1/candidate qa-output/uiux6b-mobile1/repeat
PORT=4516 node scripts/serve.mjs qa-output/uiux6b-mobile1/candidate
```

Aus einem späteren reinen QA-/Dokumentationscommit kann `FAITHPATH_BUILD_COMMIT=637af1190912fed4b8d06c854d399b4077667514` gesetzt werden, sofern die sieben App-Dateien gegenüber637af11 unverändert sind. Die Prüfsumme des ZIPs und die geordnete SHA256-Dateimap sind getrennte Hashverfahren; der Buildhash ist `SHA256(JSON.stringify(sorted path-to-SHA256 map))`, wie im vorhandenen Buildskript.

Die neuen Treiber liegen unter `tests/uiux6b-mobile1/`; die ursprüngliche vollständige Browser-Regression läuft mit `FAITHPATH_TEST_ROOT=qa-output/uiux6b-mobile1/candidate`, `QA_URL=http://127.0.0.1:4516` und `QA_RESTORE_URL=http://127.0.0.1:4517`. Der alte, vollständige 6B-Build muss für Vorheraufnahme und Updateversuch separat vorhanden sein: das zuvor gelieferte `FaithPath_UIUX6B_Netlify_Deploy.zip`, ZIP-SHA256 `1b6c28045969ee7d6f2af8d6831da6835d0f3efbe46f18eb744ccd78a823bf34`, entpackt unter `qa-output/uiux6b/release-final`.

Rücknahme des lokalen UI-Patches: auf den gesicherten Ausgangscommit49ec83c zurückwechseln oder den reinen Apppatch in einem neuen Prüfbranch revertieren; niemals Store oder persönliche Daten zurücksetzen. Ein veröffentlichter Rollback ist nicht Teil dieses Auftrags.
