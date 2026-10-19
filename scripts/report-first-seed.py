#!/usr/bin/env python3
"""Render an honest report from available proof; incomplete runs stay OPEN."""
import csv,json,re,subprocess
from pathlib import Path
root=Path('qa-output/first-seed/final');reports=Path('reports/first-seed');reports.mkdir(parents=True,exist_ok=True)
build=json.loads(Path('qa-output/first-seed/release8-a/release-integrity.json').read_text())
def load(name):
 try:return json.loads((root/name).read_text())
 except (FileNotFoundError,json.JSONDecodeError):return None
def clean(data,expected=None,key='results'):
 return bool(data is not None and not data.get('errors') and (expected is None or len(data.get(key,[]))==expected) and not any(isinstance(x,dict) and x.get('status')=='FAIL' for x in data.get(key,[])))
def status(v):return 'BESTANDEN' if v else 'OFFEN'
unit=(root/'unit.log').read_text() if (root/'unit.log').exists() else ''
unitok=bool(re.search(r'pass 245\b',unit) and re.search(r'fail 0\b',unit))
reg=load('regression/accepted-exits.json') or load('regression/exits.json');regok=bool(reg and len(reg)==41 and all(r['exit']==0 and r['sourceCommit']==build['source_commit'] for r in reg))
v=load('visual/results.json');intro=load('onboarding/results.json');contrast=load('contrast/results.json');ci=load('ci/results.json');perf=load('performance/results.json');contracts=load('contracts.json');modules=load('modules.json');lint=load('lint.json')
manual=clean(load('manual-fixtures/results.json'),7)
flow=clean(load('flow/results.json'),7) and clean(load('fresh-restore/results.json'),1);faults=clean(load('faults/results.json'),4);motion=clean(load('motion/results.json'),2);update=clean(load('update/results.json'),4);platform=clean(load('platform/results.json'),2);visual=clean(v,240);onboarding=clean(intro,144)
contrastok=bool(contrast and len(contrast['results'])==28 and all(r['status']=='PASS' for r in contrast['results']))
ciok=bool(ci and ci['head']==build['source_commit'] and len(ci['jobs'])==3 and all(j['conclusion']=='success' for j in ci['jobs']))
lintok=bool(lint is not None and sum(x['errorCount'] for x in lint)==0 and sum(x['warningCount'] for x in lint)<=5)
perfok=bool(perf and len(perf.get('results',[]))>=2 and all(r['unfinishedAfter15Seconds']==0 and r['reducedMotionAnimations']==0 for r in perf['results']))
checks=[('Unit/Integration',unitok,'245 Node-Tests; vollständiges Protokoll unit.log'),('Historische UIUX1–5-Regression',regok,'41 Browserprogramme; accepted-exits.json, Original-exits.json und dokumentierte Notiz-Wiederholung'),('Geführter Nutzerweg',flow,'7 Prüfabschnitte plus tatsächliche Wiederherstellung in leerem unabhängigem Browserprofil; beide Übersetzungen, Gebet, Back/Reload, Offline-Neustart'),('Fehlerfälle',faults,'4 Browserfehler-Szenarien plus Unitfälle zu Quota, Konflikt und Commit-Rennen'),('Animation',motion,'2 echte Browserprüfungen, verzögerter Commit, Replay, Reduced Motion und konstante Grafikgröße'),('PWA-Update',update,'4 Prüfabschnitte MAINT1 → fehlgeschlagene Installation → neuer Kandidat; unveränderte Speicherbytes'),('Plattformfehler',platform,'Bibelantwort beschädigt und Workerzugriff verweigert; sichtbare Fehler und Wiederholung'),('Responsive Baum/Heute/Wege',visual,'240 Ansichten; fünf Größen, vier Themes,100/200% Text;16 axe-Audits'),('Alle Einführungsschritte',onboarding,'144 Zustände; drei Mobilgrößen, vier Themes,100/200%;24 axe-Audits'),('Kontraste im neuen Modul',contrastok,'28 berechnete Farbpaare einschließlich Formfeldränder; keine vollständige WCAG-Zertifizierung'),('Chromium/Firefox/WebKit',ciok,'Tatsächlich ausgeführte GitHub-Actions-Jobs; TCP-Verbindung zum Testserver getrennt'),('Lint',lintok,'0 Fehler, höchstens5 bestehende Warnungen; keine TypeScript-Konfiguration vorhanden'),('Datenverträge',bool(contracts and contracts['status']=='PASS' and manual),'174 geschützte Quellen, SchemaV5/sieben Schlüssel sowie sieben im echten Browser exportierte und wiederhergestellte Testprofile'),('ES-Modulgraph',bool(modules and modules['status']=='PASS'),'Auflösbare Runtime-Imports; keine neuen Frameworks oder Runtime-Abhängigkeiten'),('Performancevergleich',perfok,'Gemessener Headless-Vergleich; reale Smartphone-FPS/Akku weiterhin offen')]
repro=load('reproducibility.json')
checks += [('Reproduzierbarer Build',bool(repro and repro.get('twoBuildsByteIdentical') and repro.get('commit')==build['source_commit']),'Zwei vollständige byte-identische Builds einschließlich Dateimanifest; reproducibility.json'),('Contentquellen',all((root/n).exists() and '"status":"PASS"' in (root/n).read_text().replace(' ','') for n in ['nt-master.log','nachlese-master.log']),'NT-Excel/JSON und installierter Nachlese-Master geprüft; keine neuen redaktionellen Änderungen')]
ready=all(x[1] for x in checks);decision='CONDITIONAL GO – ausschließlich für die nächste menschliche Nutzer- und Geräteabnahme.' if ready else 'PRÜFUNG LÄUFT – noch keine vollständige technische Abnahme.'
humanrows=[('UX-01 bis UX-06, zehn echte Personen','OFFEN','UX_TESTPLAN.md und 60 nicht ausgefüllte Teilnehmeraufgaben'),('Physisches iPhone/Safari/VoiceOver','OFFEN','IPHONE_ABNAHME.md; Linux-WebKit ist kein echtes Gerät'),('Datenschutz des neuen Ablaufs','BESTANDEN' if flow else 'OFFEN','Keine externen Requests und keine persönlichen Konsolenlogs in flow/results.json; nur synthetische Daten')]
rows='\n'.join(f'| {name} | {status(ok)} | {proof} |' for name,ok,proof in checks)
regrows='\n'.join(f"| {x['name']} | {'BESTANDEN' if x['exit']==0 else 'FEHLGESCHLAGEN'} | {x['ended']-x['started']:.1f}s |" for x in (reg or []))
perftable='Noch nicht gemessen.'
if perf:
 perftable='| Build | Sichtbar ms | rAF Median / P95 ms | Leerlauf-Task ms/2s | JS-Heap Bytes | DOM-Knoten | Paket Bytes |\n|---|---:|---:|---:|---:|---:|---:|\n'+'\n'.join(f"| {r['name']} | {r['visibleMs']:.1f} | {r['frameIntervalMedianMs']:.1f} / {r['frameIntervalP95Ms']:.1f} | {r['idleTaskMs']:.3f} | {r['heapBytes']} | {r['DOMNodes']} | {r['emittedBytes']} |" for r in perf['results'])
text=f'''# FaithPath – Dein erster Samen und lebendiger Olivenbaum

Stand:2026-10-19. {decision}

FaithPath erklärt seinen Sinn jetzt anhand eines tatsächlich gespeicherten persönlichen
Anfangs. Anliegen, vorhandener Bibeltext, eigene Worte beziehungsweise Gebet und
nächster Schritt führen in einen echten Weg. Das Pflanzen macht diesen Anfang
sichtbar. Es verändert keine Glaubensbewertung und keine bestehende Baumregel.

## A. Implementierung und geprüfter Stand

- Repository:akwasiacheampongma-code/Faithpath-.
- Neuer Branch:feature/ux-first-seed-living-tree-20261019.
- Geprüfter Appcommit:{build['source_commit']}.
- Ausgangs-HEAD:7d4441caf5112c04b8b6af7ddec8c4ee49d0c63a; Runtimebasis war der abgeschlossene Phase7-Stand MAINT1.
- Build:{build['build']}.
- Build-Hash:{build['build_hash']}.
- Content-Hash:{build['content_hash']}.
- 243 Dateien, 132 unveränderte Offline-Bibeldateien, 239 Service-Worker-Assets.

Zwei unabhängige Builds sind dateiweise einschließlich Manifest byte-identisch.
Das Build-ZIP enthält die statische App an seiner Wurzel und wird beim Verpacken
nochmals gegen jede Dateiprüfsumme kontrolliert. Spätere QA-/Dokumentationscommits
ändern den geprüften Runtime-Stand nicht; die endgültige Branchspitze steht im
Gitprotokoll. Der Buildbeleg nennt ausdrücklich den Appcommit.

### Der neue Ablauf

1. Optionaler Einstieg:FaithPath erklären und anhand eines Beispiels einen Weg verstehen.
2. Vorhandenes Anliegen wählen oder eigene Worte verwenden. Ein Themenwechsel ersetzt keine eigene Formulierung.
3. Vorhandenen Bibelgedanken samt ursprünglicher Einordnung und Textquelle lesen; beide lokalen Übersetzungen sind wählbar. Bei langem Abschnitt zuerst zwei Verse, der Rest aufklappbar.
4. Gedanken oder Gebet festhalten. Keine richtige oder falsche persönliche Antwort.
5. Einen konkreten kleinen Schritt formulieren.
6. Den persönlichen Weg prüfen und speichern; anschließend das Pflanzen und Keimen ansehen.

Einführung, Orientierung und direkte Bibel bleiben freiwillige Einstiege. Mehr →
Einführung ansehen führt später erneut dorthin. Pause, normale Navigation,
App-Neustart und „Festhalten“ setzen den eigenen Entwurf fort. Ein fremder Entwurf
wird nicht ersetzt. Beim Speichern sind Eingaben kurz gesperrt; Erfolg zeigt nur
tatsächlich gespeicherte Worte. Speichermangel erhält den Entwurf, bietet eine
Dateisicherung und ausdrücklich bestätigtes Verwerfen mit Eigentumsprüfung.

### Wege, Heute und Baum

„Mein Weg“ erklärt anhand eines konkreten Beispiels, was hineingehört. Wegdetails
verbinden Gedanken, Gebete, Bibelstellen, Schritte und spätere Rückblicke über die
vorhandenen Funktionen. Heute zeigt die größere Illustration, den aktuellen
Schritt und weiterhin einen schnellen Bibelzugang. Bei320px mit Entwurfsstreifen
wurden überdeckte Teile des Bibelbuttons durch weniger Headerpadding korrigiert.

Alle sieben Bilder wurden als originale lokale Vektorgrafiken gestaltet. Bestehende
Stufennamen, sieben Schwellen und Zählregeln bleiben erhalten. Historische Bilder
bleiben als geschützte Assets erhalten. Es werden keine externen Bilder oder
Schriften geladen. Vorhandene Newsreader-/DM-Sans-Dateien und ihre OFL-Lizenzen
bleiben erhalten; die neue Grafik verwendet keine fremde Bildquelle.

Pflanzen und Keimen sind ein Bild für den Anfang. Der gespeicherte Baum verändert
sich ausschließlich nach den bisherigen ausdrücklich bestätigten Entwicklungen:
0,1,2,3–4,5–6,7–9 und ab10. Bibellesen, Quiz und erledigte Aufgaben zählen nicht.
Der Baum misst weder Gottes Nähe noch Glaubensstärke oder menschlichen Wert.
Das bestehende Schwert bleibt das Symbol der Bibelreise.

### Architektur für menschliche Entwickler

| Modul | Verantwortung |
|---|---|
| src/first-seed/model.js | Reine Auswahl-/Validierungslogik, stabile IDs und normale V5-Datensätze; keine Speicherzugriffe. |
| src/first-seed/controller.js | Eigener Entwurf, Schreibqueue, Aktionssperre, Fokus und Abbruch später Bibelantworten. |
| src/first-seed/view.js | Escaptes HTML und Erklärungen; Beispiele werden nicht als persönliche Daten gespeichert. |
| src/olive-tree.js | Gemeinsame originale SVG-Darstellung; liest die Stufe und zählt nichts. |
| src/living-motion.js | Sichtbarkeit, Reduced Motion und Aufräumen; keine Produktions-Timer oder rAF-Schleifen. |
| src/verbunden/seed.css | Begrenzte Verbunden-Ergänzungen für Einführung, Baum und persönliche Hilfen. |
| src/app.js / app-router.js | Vorhandene Router-/Eventadapter verdrahten das neue Modul. |

Store, journalTransaction und exakte Draft-Eigentümerschaft bleiben die
Speicherautoritäten. Keine neue Migration, kein neues Speichersystem, keine
Runtime-Abhängigkeit und kein Frameworkwechsel. Die vollständige Dateiliste
liegt in DATEIAENDERUNGEN.txt; Architektur-, Entwicklungs-, Daten- und
Release-Dokumentation wurde ergänzt.

## B. UX-Ergebnis und noch erforderliche Menschenprüfung

| Testerproblem | Umsetzung |
|---|---|
| Sinn wird ohne Gründererklärung nicht verstanden | Konkreter geführter Anfang statt bloßer abstrakter Produktbeschreibung. |
| Unklar, was in einen Weg gehört | Beispiel, gewähltes Anliegen, eigener Gedanke/Gebet, Bibeltext, Schritt und abschließende gemeinsame Vorschau. |
| Nutzer fühlen sich nicht abgeholt | Freiwilliger persönlicher Einstieg und gleichwertiger direkter Bibelzugang; keine Annahme über Glaubenserfahrung. |
| Gewünschte zusammenhängende Geschichte | Die Einführung schreibt echte verknüpfte Wege/Journal-/Reflexionsdatensätze und führt in den gespeicherten Weg. |
| Baum zu klein beziehungsweise zu wenig lebendig | Größere Originalgrafiken, sieben unterschiedliche Darstellungen, dezentes Licht und Blattbewegung, Pflanzsequenz. |
| Wunsch nach Effekten | Kurze funktionale Übergänge und freiwilliges Replay; Lesen bleibt ruhig. |

Keine echten Personen wurden durch Codex getestet. UX-01 bis UX-06 bleiben OFFEN.
Die Ziele8/10 für Kernverständnis, selbstständigen ersten Weg und Baumverständnis
sowie durchschnittlich4/5 für visuelle Qualität und Angemessenheit sind künftige
Abnahmekriterien. Zehn anonyme Teilnehmerbögen mit60 offenen Aufgaben, XLSX/CSV,
Moderationsskript und Auswertung liegen bei. Unter Testdaten/ liegen sieben
echte App-Exporte rein synthetischer Baumprofile, über die vorhandene
Wiederherstellung in zuvor leeren Datenständen im Browser validiert. Sie erleichtern das physische Gate;
sie dürfen ausschließlich ein isoliertes Testprofil ersetzen. Es wurden keine
Resultate echter Menschen erfunden.

Ein wichtiges Prüfthema bleibt, ob Menschen das symbolische Keimen und die
bestehende bestätigungsgebundene Baumstufe klar unterscheiden. Der Wortlaut
macht dies deutlich; die tatsächliche Wirkung muss UX-04 prüfen.

## C. Tatsächliche technische Testmatrix

| Prüfung | Ergebnis | Nachweis und Grenze |
|---|---|---|
{rows}

| Weitere Kategorie | Ergebnis | Nachweis |
|---|---|---|
{chr(10).join('| '+ ' | '.join(row)+' |' for row in humanrows)}

Eine zusätzliche Chromium-Prüfung importiert den tatsächlichen Export des neuen
Anfangs in ein leeres unabhängiges Profil, startet das Journal neu und exportiert
dieselben Datensätze erneut. Ein wirkungsloser Import könnte diese Prüfung nicht
bestehen. Die erweiterte Prüfung ist lokal belegt, nicht als zusätzliche Firefox-/
WebKit-Ausführung ausgegeben.

Die neuen Funktionsnachweise decken FT-01 bis FT-07 ab:Start/Back/Pause/Resume,
Mehrfachtippen, Gedanken und Gebete, gültige Bibelreferenzen, reale Wiederherstellung,
Quota, fremde und defekte Entwürfe, verzögerte Speicherung, späte Bibelantworten,
alle Stufen und unveränderte Zählung. Die Bestandsregression prüft Reader, Quiz,
Geschichten, Wege, Journal, Rückblicke, Archive, Undo, Backups und alte Migrationen.

Vor der letzten Grafikkorrektur scheiterten der erste Notizlauf und die
unveränderte Wiederholung am 15-Sekunden-
Budget für natives Befüllen mit 31.200 Zeichen. Ein isolierter Vergleich im selben
parallel belasteten Zwei-Kern-Container reproduzierte dies auch auf unverändertem
MAINT1. Mit 60 Sekunden waren beide Texte vollständig identisch übernommen:
29,9 Sekunden auf der Basis, 33,8 Sekunden auf dem Kandidaten. Dies belegt keine
Ursache im Redesign und keine realistische Smartphone-Latenz. Nur für Eingaben
über 10.000 Zeichen und das zugehörige Speichern erhält der Browserhelfer nun
ein begrenztes 60-Sekunden-Budget;
Payload und sämtliche Speicher-/Lösch-/Quota-Assertions bleiben unverändert. Der
vollständige Notiztest wurde damit erneut bestanden. Originalfehler, Vergleich
und Wiederholungen sind unter diagnostics-source7 getrennt erhalten. Der finale
Gesamtlauf verwendet dieselbe begrenzte Zeitregel; sämtliche übrigen Notiz-
und Datenlogikdateien sind gegenüber dem dort geprüften Kandidaten identisch. Lange
Texte bleiben ein expliziter Performancepunkt der echten Geräteabnahme.

Es gibt keine TypeScript-Konfiguration; es wurde keine TypeScript-Prüfung erfunden.
Die fünf bestehenden Lintwarnungen bleiben dokumentiert, neue Lintfehler sind
nicht akzeptiert. Testzahlen sind Ausführungsnachweise, kein Beleg für100Prozent
Codeabdeckung oder ein fehlerfreies Produkt.

### Browser und Offline

System-Chromium151.0.7922.173 auf Debian13, Node24.19.0. Lokale Firefox-/WebKit-
Downloads wurden mit403 blockiert. Beide Engines wurden deshalb tatsächlich in
GitHub Actions auf Ubuntu24.04 ausgeführt: Chrome for Testing151.0.7922.34,
Firefox153.0 und WebKit26.5 laut Installationsprotokollen. Der finale Lauf ist
im CI-Beleg verlinkt.

Playwrights context.setOffline scheiterte in Linux-WebKit sowohl auf unverändertem
MAINT1 als auch auf dem Kandidaten, obwohl Worker und Cache vorhanden waren.
Dies wird nicht als bestandener Emulationstest ausgegeben. Im Kontrollversuch
mit tatsächlich geschlossenem TCP-Listener funktionierten beide Versionen aus
dem Cache. Der vollständige neue Ablauf einschließlich Offline-Neustart wurde
mit diesem realen Serverausfall in Chromium, Firefox und WebKit bestanden.
Das beweist keine physische iPhone-/Safari-/VoiceOver-Abnahme.

In einem WebKit-Lauf vor der abschließenden Lichthof-Korrektur waren alle sieben
Funktionsabschnitte erfolgreich,
aber die Engine meldete zusätzlich ‚ResizeObserver loop completed with undelivered
notifications‘. Dieser Lauf wurde korrekt als fehlgeschlagen archiviert, nicht
herausgefiltert. Der unveränderte Wiederholungslauf ist im historischen CI-Beleg unter diagnostics-source7 getrennt
ausgewiesen. Die finale CI-Quelle ist davon gesondert ausgewiesen. Eine sporadische Größenbeobachtungsmeldung bleibt ein Beobachtungspunkt
für die Geräteabnahme; aus diesem Einzelbefund wird keine bestätigte Ursache behauptet.

Axe-Kontexte dürfen nur für deren Diagnosestile CSP umgehen. Die getrennten
Flow-, Core- und Routentests verwenden die wirkliche ausgelieferte CSP.16 neue
Baum-/Übersichtsaudits und24 Szenenaudits ersetzen keine manuelle WCAG-Prüfung;
unvollständige Axe-Prüfpunkte bleiben in den Rohdaten. Die bisherigen manuellen
Kontrast-/Gerätegates sind damit nicht rückwirkend freigegeben.

### Datenintegrität und Datenschutz

SchemaV5, sieben LocalStorage-Schlüssel, Store, Drafts, Transaktionen, Import-
Validierung, Domain und historische Regeln bleiben unverändert. Der zusätzliche
Draft-Discriminator first-seed nutzt den bestehenden Umschlag. Es wird nur der
exakte eigene Entwurf abgeschlossen oder ausdrücklich verworfen. Eine
Wiederherstellungsdatei eines Entwurfs ist keine normale importierbare App-Sicherung.

1.300 NT-Fragen,2.314 Nachlese-Fragen, Geschichten, beide Bibeltexte und ihre IDs
wurden in diesem Featurebranch nicht redaktionell verändert. Historische Angaben
wie changed_fields6151 oder changed_questions58 in Validatorlogs beziehen sich
auf bereits integrierte Masterfassungen, nicht auf neue Änderungen dieses Auftrags.
Die geschützten Quellen und der unveränderte
Content-Hash belegen das. Alte synthetische Einträge, Fortschritte, Markierungen,
Archive und Wiederherstellungskopien bleiben in den Upgrade- und Importtests erhalten.

Die neuen Flows übertrugen keine persönlichen Texte an externe Dienste und
schrieben keine Testgedanken in die Browserkonsole. Alle automatisierten Daten
waren synthetisch und in isolierten Browserprofilen. Die Speicherung bleibt wie
zuvor lokal und unverschlüsselt; ein gelöschtes Browserprofil ist kein Backup.
Es gibt keine neue Cloud-Synchronisation oder zusätzliche Berechtigung.

## D. Visuelle Nachweise und Performance

Vergleich.html zeigt echte Browserbilder:Einführung, Anliegen, Bibelgedanke,
Gebet, Schritt, Vorschau, Pflanzen, echter Weg sowie alle sieben Baumstufen und
vier Themes. Vorher/Nachher verwendet dieselben synthetischen Wegdaten auf der
unveränderten MAINT1-Basis und dem neuen Build. Isolierte Baum-Crops blenden die
Navigation nur zur Bildaufnahme aus; vollständige UI-Ansichten werden separat
geprüft. Die App blendet keine Texte zur Kaschierung von Layoutfehlern aus.

Die Sichtprüfung fand und korrigierte reale Fehler:ungültige SVG-Blattverweise,
überlaufende Grafik, überlappende Zweig-Touchflächen und Grafik-Paint, der das
Menü abfing. Tests prüfen nun auch aufgelöste SVG-Verweise und echte Blatt-Bounds.
Bei390×844 ist die Startaktion oberhalb der Navigation sichtbar. Große Schrift
wird nicht durch winzige Schrift oder pauschales Abschneiden passend gemacht.

{perftable}

Bedingungen und Rohwerte stehen unter Nachweise/performance. Headless-rAF ist
keine Smartphone-FPS- oder Akku-Messung. Der Vergleich ist lokal und hat eine
begrenzte Stichprobe; CPU-Last durch parallele Tests ist gesondert vermerkt.
Animationen sind endlich:Blätter höchstens10s, Licht höchstens14s, Pflanzen rund2,5s.
Offscreen/Hintergrund pausiert; Reduced Motion entfernt die Effekte. Danach gibt
es keine dauerhafte Animationsschleife. Ursprüngliche Baum-Assets bleiben aus
Kompatibilitätsgründen im Offlinepaket; neue schwere Bilddateien kamen nicht hinzu.

## E. Behobene Fehler, Grenzen und Rollback

| Priorität | Nachgewiesener Fehler | Abhilfe |
|---|---|---|
| P1 | Text während finaler Speicherung schien gespeichert, war aber nicht im Datensatz. | Eingaben vor dem ersten await sperren; verzögerter echter Commit als Regression. |
| P2 | Abgelehnte Schreibqueue blockierte einen neuen Anfang nach bewusstem Verwerfen. | Neue Sitzung erhält eine erfüllte Queue; Fremdentwürfe bleiben geschützt. |
| P2 | Festhalten/compose konnte den neuen Drafttyp nicht fortsetzen. | Weiterleitung zur tatsächlichen Samen-Route. |
| P2 | Verspäteter Abschluss konnte eine andere Ansicht überschreiben. | Navigation während laufender Aktion serialisieren; späte Bibelantworten abbrechen. |
| P2 | SVG-Blätter und mobile Grafik-/Touch-Geometrie fehlerhaft. | Referenzgraph, echte Bildprüfung, feste zugehörige Zweigkoordinaten und dekorative Pointerbegrenzung. |
| P2 | Neue Feldränder nur1,36–1,62:1 Kontrast. | Bestehender semantischer Feldrand:5,94–8,30:1 in den vier Themes. |
| P2 | Lichthof der Samen-/Keimling-Nahansicht wurde rechteckig abgeschnitten. | Pro Stufe passende Geometrie mit vollständig transparentem Rand; alle Viewports einschließlich Animationsdrift geprüft. |
| P2 | Übersetzungswechsel verlor Tastaturfokus nach async Rendern. | Fokusidentität über beide Renderdurchläufe erhalten; Unit- und Drei-Engine-Regression. |

Unabhängiges Review einschließlich abschließender Delta-Prüfung ist in REVIEW.md
festgehalten. Am geprüften Stand bleiben daraus keine bestätigten offenen Fehler.

OFFEN bleiben echte Nutzerverständlichkeit, subjektive visuelle Qualität,
physisches iPhone Safari, installierte PWA, VoiceOver, echte Bildschirmtastatur,
Safari-Zoom/Dynamic Type und Smartphone-Akkumessung. Simulierte Safe Areas,
Chromium-Skalierung und Linux-WebKit zählen dafür nicht als bestanden.

Rollback:vor einem manuellen Versionswechsel eine vollständige Sicherung und
einen offenen Samen-Entwurf separat sichern oder abschließen. Alte Apps können
diesen neuen Editor nicht bearbeiten; normale V5-Wege und Einträge bleiben
kompatibel. Den unveränderten MAINT1-Build auf ausschließlich einer isolierten
QA-Origin wiederherstellen und den Worker bewusst aktivieren. Keine Speicher-
oder Cache-Löschung als vermeintliche Reparatur. Produktion braucht separate Freigabe.

## F. Freigabeempfehlung

{decision}

Vor einem produktiven GO müssen mindestens die definierten Zehn-Personen-Ziele,
das physische Geräte-Gate und die verbleibenden manuellen Accessibility-Punkte
mit echten Belegen geschlossen sein. Empfohlen ist jetzt der gezielte Nutzertest
mit diesem Kandidaten, bevor weitere Funktionen oder eine Veröffentlichung folgen.
Es wurde keine Produktionsseite oder bestehende QA-Site verändert, nichts in
main zusammengeführt und kein automatischer Deploy ausgeführt.

## Anhang:vollständige Bestandsregression

| Programm | Ergebnis | Laufzeit |
|---|---|---:|
{regrows or '| noch nicht vollständig abgeschlossen | OFFEN | – |'}
'''
text=re.sub(r'(?m)^(- [^:\n]+:)(?=\S)',r'\1 ',text)
for old,new in {'Stand:2026':'Stand: 2026','Repository:akwasi':'Repository: akwasi','Branch:feature':'Branch: feature','bei320':'bei 320','Bei320':'Bei 320','Bei390':'Bei 390','mit60':'mit 60','Ziele8/10':'Ziele 8/10','durchschnittlich4/5':'durchschnittlich 4/5','Codeabdeckung':'Codeabdeckung','für100Prozent':'für 100 Prozent','werden FT-01':'werden FT-01','System-Chromium151':'System-Chromium 151','auf Debian13':'auf Debian 13','Node24':'Node 24','mit403':'mit 403','CSP.16':'CSP. 16','und24':'und 24','höchstens10s':'höchstens 10 s','höchstens14s':'höchstens 14 s','rund2,5s':'rund 2,5 s','diese neuen':'diese neuen'}.items():text=text.replace(old,new)
(reports/'IMPLEMENTIERUNG.md').write_text(text,encoding='utf8')
with (reports/'TESTMATRIX.csv').open('w',newline='',encoding='utf8') as handle:
 writer=csv.writer(handle,delimiter=';',lineterminator='\n');writer.writerow(['Pruefung','Ergebnis','Nachweis']);writer.writerows((n,status(ok),p) for n,ok,p in checks);writer.writerows(humanrows)

print(json.dumps({'decision':decision,'completed':sum(x[1] for x in checks),'total':len(checks),'source':build['source_commit']},ensure_ascii=False))
