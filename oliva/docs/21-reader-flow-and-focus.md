# Fließtext und Lesefokus · OLIVA 0.11-Kandidat

Stand: 09.11.2026. Der lokale 0.11.0-Kandidat enthält zusammenhängende
Fließtextabsätze, die Alternative „Einzelverse“, gemeinsame Versaktionen und
einen vorübergehenden Lesefokus. Der Web-/PWA-Kern ist
`oliva-01c4b9f640bc0931`. 168 Fachtests, Typecheck, Webbuild und beide nativen
JS-/Assetexporte bestehen. Der vollständige Kandidaten-Browserlauf und der
echte PWA-Wechsel 0.10→0.11 sind bei diesem Dokumentstand noch in Arbeit.
Gezielte frühere Readerläufe werden unten mit ihrem eigenen Quellenstand
ausgewiesen; sie ersetzen diese beiden offenen Abnahmen nicht.

Die eigentümerprivate Vorschau liefert weiterhin den eingefrorenen
0.10-Stand. Eine private Bereitstellung oder GitHub-Sicherung von 0.11 ist hier
noch nicht belegt. Der [0.10-Checkpoint](evidence/reader-flow/checkpoints/oliva-v010-local-checkpoint.json)
und die [vorhandenen GitHub-Sicherungen](evidence/reader-flow/checkpoints/oliva-github-backups.json)
bleiben eigene historische Nachweise. Diese Iteration erklärt die gesamte
Master-Anforderung nicht für abgeschlossen.

## Herkunft und übernommener Umfang

Die [Vorbereitung in Dokument 19](19-reader-flow-preparation.md) untersucht den
unveränderten FaithPath-Snapshot
[`a519ce898fa33907b07d5ac7a585595127556183`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/a519ce898fa33907b07d5ac7a585595127556183).
Von dessen `src/verbunden/reader-flow.js`, `reader.css` und Readerintegration
stammen die vorhandene Darstellungsregel von bis zu fünf Inlineversen je
Absatz und das Verhalten eines ausblendenden Lesefokus mit sichtbarem
Ausstieg, Escape und Rückkehr des Tastaturfokus. Das sind Quellenbelege des
Originals; für diesen Bericht wurde die Original-App nicht erneut ausgeführt.
Dokument 19 bleibt als historische Vorbereitung bestehen, während dieser
Bericht die anschließende Umsetzung und ihre Grenzen festhält.

Die Fünfergruppen behaupten keine literarische Absatzgliederung der
Übersetzung. OLIVA verwendet weiterhin dieselbe gemeinfreie Lutherbibel 1912
aus seinem bestehenden Repository mit Quellenhinweis auf eBible.org. Der
Renderer erzeugt keine zweite Bibelkopie und ändert weder Wortlaut noch
Versnummern. Teilabschnitte bleiben auf `getPassage(ref)` begrenzt; der
vollständige Kapitelumfang wird erst durch „Das ganze Kapitel lesen“ geöffnet.
Die ursprüngliche Kapitelendenerkennung wird nicht als zusätzliche
Fortschrittsquelle übernommen.

## Konkrete Architektur

| Verantwortung | Umsetzung und Vertrag |
| --- | --- |
| Absatzmodell | [flow/model.ts](../src/features/bible/flow/model.ts) bildet höchstens fünf aufeinanderfolgende Verse, mit kanonischem Schlüssel, Scope und exakten UTF-16-Zeichenbereichen. Lücken beenden eine Gruppe. Ungültige Reihenfolge, Duplikate und fremde Abschnittsverse werden verworfen. |
| Webtext | [FlowText.web.tsx](../src/features/bible/flow/FlowText.web.tsx) rendert echte `p`-Absätze und Inline-`span`-Verse mit Buttonrolle, Enter/Leertaste, Verslabel und Auswahlzustand. `getClientRects()` liefert sämtliche tatsächlichen Versfragmente; ein umfassendes Versrechteck ersetzt diese Messung nicht. |
| Nativer Textadapter | [FlowText.tsx](../src/features/bible/flow/FlowText.tsx) ist die native Standarddatei: äußerer RN-`Text` je Absatz, innere `Text`-Verse und tatsächliche `onTextLayout`-Zeilentexte. Die `.web.tsx`-Datei ersetzt ihn im Webbuild. |
| Versaktionen | [VerseActions.tsx](../src/features/bible/VerseActions.tsx) enthält Merken, vorhandene Markierungsaktionen, Vorhabenbezug, versgebundenen Notizentwurf und gespeicherte Worte. Das Panel folgt dem Absatz als Geschwisterelement; Eingabefelder und Karten stehen außerhalb des Textbaums. Die Quelle bleibt beispielsweise `JHN:6:35`. |
| Leseeinstellungen | [ReaderPreferences.tsx](../src/features/bible/ReaderPreferences.tsx) trennt Schrift-/Zeilenpräferenzen von Text und Aktionen. Gespeicherte Schriftgröße 18–30, Darstellung mit `fontSize + 3`, angebotene Zeilenfaktoren 1,5/1,8/2,1 und vorhandene Themes bleiben maßgeblich. Fließtext-/Einzelverswahl ist lokaler UI-Zustand. |
| Auswahl und Lesefokus | [Readerroute](../app/lesen/%5Bbook%5D.tsx) hält Auswahl, Werkzeugzustände und Lesefokus lokal. Ein Fokusstart schließt Einstellungen, Verswahl und Versaktionen; vorhandene Editorentwürfe werden beim Unmount über den bestehenden Entwurfsvertrag gesichert. Der gespeicherte Modus `read`/`deep` wird nicht umgedeutet. |
| Erreichbarer Ausstieg | [Shell.tsx](../src/components/Shell.tsx) setzt die Reader-Toolbar außerhalb des Scrollcontainers. „Lesefokus beenden“ bleibt damit auch am Kapitelende erreichbar. Nach dem Beenden kehrt der Tastaturfokus ohne erzwungenen Scrollsprung zu „Lesefokus starten“ zurück. |
| Kontext zuerst schließen | [useReaderDismiss.ts](../src/features/bible/flow/useReaderDismiss.ts) priorisiert Einstellungen, Verswahl, Versaktionen und anschließend Lesefokus. Web-Escape und der native Android-BackHandler nutzen dieselbe lokale Dismiss-Funktion; nur das Webverhalten ist tatsächlich im Browser geprüft. |

Der Lesefokus blendet Titel-/Werkzeugkontext, `read`-/`deep`-Umschaltung,
Einordnungen und Bilder, Entwurfszugänge sowie Abschluss-/Kapitelnavigation
aus. Bibeltext, Quellenhinweis und die feste Ausstiegsleiste bleiben erhalten.
Ein Fokuszustand überlebt keinen Reload. Ein Vers lässt sich weiterhin direkt
auswählen; dies beendet den Fokus und öffnet seine Aktionen.

Die native Zeilenzuordnung arbeitet strikt gegen den tatsächlich gerenderten
Text. Nur bekannte Quell-Leerzeichen an Umbruchgrenzen dürfen ausgelassen
werden. Fehlende Wörter, veränderte Ligaturen, NBSP-Normalisierung,
zerschnittene Surrogatpaare oder unvollständige/ungültige Zeilenmetriken
führen zu keiner geschätzten Versposition. Absatzmessungen sind auf 350 ms
begrenzt. Fehlen nach einer tatsächlichen Messanforderung bei vorhandenen
Absatz-Views die anfänglichen Zeilenereignisse, löst ein 500-ms-Limit den
Rückfall auf den bestehenden gemessenen Einzelversreader aus. Eine
Layoutgeneration verhindert die Übernahme alter Zeilen; ausstehende
Messungen und Fristen werden bei Hintergrundwechsel, Layoutwechsel und
Unmount abgeräumt. Das ist implementierter Schutzcode und kein Nachweis
über tatsächliche native Textereignisse auf einem Gerät.

## Kanonischer Anker und belegte Reflowkorrektur

[useReaderPosition.ts](../src/features/bible/useReaderPosition.ts) speichert
weiterhin Referenz, Vers und Modus, keine Pixel. Gemeinsame Inlinezeilen
verwenden ihren ersten sichtbaren kanonischen Vers; ein ausdrücklicher
Verssprung bleibt bis zu einer neuen bewussten Scrollbewegung maßgeblich.
Scope, Layoutgeneration, Viewport, Screenfokus und Appzustand begrenzen die
Gültigkeit einer Messung. Ein aktiver Notizinput pausiert das Merken und
erhält kein neues automatisches Restoreziel. Beim Schließen wartet ein schon
vorhandenes Ziel auf die neue vollständige Messung. Timer und ausstehende
Messungen werden bei Verlassen des Screens beziehungsweise Hintergrund oder
Unmount bereinigt.

Zwei frühere Positionsläufe bestanden jeweils nur 3/4. Diese Ergebnisse
bleiben sichtbar und werden nicht nachträglich als erfolgreiche Abnahme
bezeichnet:

1. Im [ersten Lauf](evidence/reader-flow/reader-baseline-first.json) erwartete
   ein durch Scrollen angenäherter Test fälschlich Vers 120. Tatsächlich teilt
   der fortlaufende Text von 119 die erste sichtbare Zeile mit 120. Der
   [DOM-Rohbeleg](evidence/reader-flow/flow-shared-line-119-120.json) samt
   [Aufnahme](evidence/reader-flow/flow-shared-line-119-120.png) zeigt korrekt
   den kanonischen Scrollanker 119. Der Positionsfall wählt 120 seither über
   die echte öffentliche Verswahl; ein eigener Fließtextfall bewahrt die
   gemeinsame Zeile und erwartet weiterhin 119.
2. Der [zweite Lauf](evidence/reader-flow/reader-baseline-picker.json) mit
   ausdrücklicher Verswahl zeigte einen echten Produktfehler. Beim Resize
   beziehungsweise anschließenden Einstellungsöffnen konnten Zwischenoffsets
   vor Reacts vollständigem Reflow einen falschen kanonischen Anker ersetzen.
   Die [beobachtete Scroll-API und IndexedDB](evidence/reader-flow/diagnostics/settings-scroll-api-baseline.json)
   belegen Vers 68 und den anschließend bei `y = 3748,5` liegenden Vers 120.
   Der isolierte [CSS-Kontrollversuch `overflow-anchor: none`](evidence/reader-flow/diagnostics/settings-overflow-anchor-control.json)
   behob das Problem nicht: Er übernahm Vers 98, Vers 120 blieb bei
   `y = 1203,90625`. Die [Diagnose](evidence/reader-flow/diagnostics/settings-diagnosis.json)
   unterscheidet diese negative Kontrolle vom späteren Quellenfix.

Der tatsächliche Fix friert den letzten kanonischen Anker bereits bei
`Dimensions.change` ein. `onScroll` erkennt einen von der letzten vollständigen
Messung abweichenden Viewport und verwirft dessen Zwischenkoordinaten. Der
[neu gebaute und erneut gemessene Stand `oliva-ac7ced6075cbbc76`](evidence/reader-flow/diagnostics/settings-after-dimensions-fix.json)
behält Vers 120 während Schrift- und Zeilenabstandswechseln und zeigt ihn nach
dem Schließen tatsächlich bei `y = 23,5`. Die
[Positionsregression besteht anschließend 4/4](evidence/reader-flow/reader-baseline-dimensions.json).
Der ältere Diagnose-Markdowntext hält seinen damaligen offenen Neubauzustand
fest; maßgeblich für die erfolgreiche Nachprüfung sind diese späteren
Rohdaten und der neue Testlauf.

## Abnahmekriterien und tatsächliche Evidenz

Die gezielten Browserläufe unten entstanden noch mit Paketversion `0.10.0`
auf unversionierten Reader-Arbeitsständen. Der erste 7/7-Fließtextlauf ist
über den gemeinsamen-Zeilen-Rohbeleg dem Kern `oliva-6dc58fa90ed710f9`
zugeordnet; seine gehärteten Fälle 4 und 7 wurden zusätzlich 2/2 geprüft.
Die Dimensions-Nachprüfung und die drei Fokusfälle nennen den späteren Kern
`oliva-ac7ced6075cbbc76`. Sie sind Entwicklungsnachweise für die Readerarbeit,
keine Behauptung einer Veröffentlichung dieser Arbeitsstände oder eines
abgeschlossenen 0.11-Gesamtlaufs.

Der Fokuslauf war nicht bereits im ersten Versuch vollständig grün: Zunächst
bestanden 2/3 Fälle, weil der Test `main.scrollTo({ top })` verwendete. RN Web
ersetzt diese Methode durch seine `scrollTo({ y })`-Schnittstelle; der Aufruf
setzte die tatsächliche Scrollposition daher auf 0. Der Test verwendet seit
dieser beobachteten Harnesskorrektur den echten letzten Vers mit nativem
`scrollIntoView({ block: "start" })`. Die harte Prüfung der tatsächlichen
untersten Scrollposition blieb bestehen; dafür wurde kein Produktcode
geändert. Der erste JSON-/Textbericht wurde beim erneuten Lauf überschrieben
und wird hier nicht nachträglich rekonstruiert. Der finale einzelne
[3/3-Lauf](evidence/reader-flow/focus-targeted.json) ist separat als endgültiges
Ergebnis belegt.

| Kriterium | Tatsächliches Ergebnis | Beleg |
| --- | --- | --- |
| Alle kanonischen Texte und Zeichenbereiche erhalten | Reines Absatzmodell prüft 31.102 Verse in 1.189 Kapiteln; zusätzlich 0/1/5/6 Verse, Lücken, ungültige Reihenfolge und unveränderte Quellobjekte. Bestandteil der 168/168 Fachtests des 0.11-Kandidaten. | [Tests](../tests/reader-flow.test.ts), [Fachtestbericht](evidence/reader-flow/unit-results.json) |
| Echte Inlineabsätze und nachvollziehbare gemeinsame Zeilen | 7/7 gezielte Webfälle: vollständiges Johannes 6, echte über Versgrenzen geteilte Zeilen, Psalm 119/120 und vollständige Absatz-/Versreihenfolge. | [7/7](evidence/reader-flow/first-targeted.json), [Log](evidence/reader-flow/first-targeted.txt), [reale Fragmente](evidence/reader-flow/flow-shared-line-119-120.json) |
| Bestehende Einversaktionen, Entwürfe und Quelle | JHN 6,35 per Tastatur, Merken, tatsächliche Oliv-/Goldfüllung nach Deselektion und Entwurf nach Neustart; zusätzlich Darstellungstausch mit unverändertem Anker/Quelltext. Gehärtete Fälle 4 und 7 bestehen erneut 2/2. | [Nachprüfung](evidence/reader-flow/second-cases4-7.json), [Log](evidence/reader-flow/second-cases4-7.txt) |
| Präzise sichtbare Fortsetzung nach Reflow und Neustart | Nach dem Dimensionsfix 4/4: Offline-Fortsetzung, langer Psalm bei Breiten-/Schriftwechsel, explizite Abschnittslinks und Kapitelwechsel, bestehende V4-Daten beim Lesen. Der Test scrollt die Restoreposition nicht nachträglich zurecht. | [4/4](evidence/reader-flow/reader-baseline-dimensions.json), [Positionsrohbeleg](evidence/reader-flow/diagnostics/settings-after-dimensions-fix.json) |
| Lesefokus, erreichbarer Ausstieg und Rückfokus | 3/3: 320 × 844 CSS-Pixel in Hell/Dunkel, Toolbar außerhalb von `main`, realer Scroll bis unten, unveränderte Toolbarposition und Hit-Test; Toolbar-/Escape-Ausstieg mit Rückfokus. Kein persistenter Fokus nach Reload. | [3/3](evidence/reader-flow/focus-targeted.json), [Geometrie](evidence/reader-flow/focus/focus-toolbar-and-accessibility.json), [hell](evidence/reader-flow/focus/screens/focus-320-light-bottom.png), [dunkel](evidence/reader-flow/focus/screens/focus-320-dark-bottom.png) |
| Gerade eingegebener Entwurf beim Fokusstart geschützt | Ohne Warten auf den Entwurfs-Debounce gestartet; Text einschließlich Leerraum/Zeilenumbruch, dieselbe Entwurfs-ID und Quelle `JHN 6,35` nach Fokusende und Reload fortsetzbar. Kein gespeicherter Notizeintrag oder Leseabschluss entsteht dabei. | [Entwurfsbeleg](evidence/reader-flow/focus/focus-draft-unmount.json) |
| Escape priorisiert offenen Kontext | Einstellungen beziehungsweise Verswahl schließen vor den noch offenen Versaktionen; Fokus kehrt zum jeweiligen Zugang zurück, Route bleibt erhalten. Die anschließende ausdrücklich ausgelöste Zurücknavigation führt zur Bibel. | [Dismiss-Beleg](evidence/reader-flow/focus/escape-dismiss-priority.json), [Test](../tests/e2e/reader-focus.spec.ts) |
| Text bei großer Schrift und beide Themes | Gezielter Fließtextfall bei Schriftpräferenz 30 und Zeilenfaktor 2,1 auf 320 Pixeln hell/dunkel sowie 1.440 Pixeln hell; keine horizontalen Überläufe. Axe mit WCAG-2-A/AA- und 2.1-AA-Regeln ohne Verstoß; Fokusfall ebenfalls in beiden Themes ohne Axe-Verstoß. | [Fließtextscreens](evidence/reader-flow/screens/flow-320-light-font30.png), [dunkel](evidence/reader-flow/screens/flow-320-dark-font30.png), [groß](evidence/reader-flow/screens/flow-1440-light-font30.png), [Fokus-Axe](evidence/reader-flow/focus/focus-toolbar-and-accessibility.json) |
| Abschnitt und ausdrücklicher Fortschritt | Erste Offlineöffnung und Reload enthalten exakt die acht Davidverse 1. Samuel 17,38–45; 37/46 fehlen. Bestätigung schreibt ausschließlich diesen Abschnitt, erst „Das ganze Kapitel lesen“ erweitert den Scope. Scrollen, Auswahl, Einstellungen und Fokus ändern keine Lese-/Wachstumsfelder. | [Fließtextfälle](evidence/reader-flow/first-targeted.json), [gehärtete Offlineprüfung](evidence/reader-flow/second-cases4-7.json), [Fokus-Fortschrittsvergleich](evidence/reader-flow/focus/focus-toolbar-and-accessibility.json) |
| Kandidatenquelle baut und bleibt exportierbar | 168/168 Fachtests, Typecheck, Web-/PWA-Build und beide nativen JS-/Assetexporte erfolgreich. | [Fachtests](evidence/reader-flow/unit-results.txt), [Typecheck](evidence/reader-flow/typecheck-candidate.txt), [Webbuild](evidence/reader-flow/build-candidate.txt), [Native](evidence/reader-flow/native/native-builds.json) |
| Vollständige Kandidatenregression und echter Vorgängerwechsel | Ein einzelner vollständiger 92/92-Browserlauf und echter PWA-Wechsel 0.10→0.11 erfolgreich. Keine Gesamtabnahme aus Teilmengen zusammengesetzt. | [Gesamtlauf](evidence/reader-flow/e2e-results.json), [Update](evidence/reader-flow/upgrade/offline-upgrade.json). |

## Datenvertrag und native Nachweisgrenze

Nutzdaten bleiben **V7**, privates Speicherdokument **V1**, physisches SQLite
**V3** und IndexedDB **V1**. Dieser Renderer benötigt keine Migration und
erzeugt keine neuen persönlichen IDs aus Textkoordinaten. Die bestehenden
[Datenmodelle](../src/state/model.ts), [Speicherdokumente](../src/services/documents.ts)
und Speicheradapter bleiben maßgeblich. „Als gelesen bestätigen“ verwendet
weiterhin `markRead`; Darstellung, Reflow, Lesefokus und UI-Vorschau sind keine
Wachstumsereignisse. Der inzwischen erfolgreiche echte Vorgängerwechsel kann
zusätzlich die tatsächlichen Rohdatensätze, Archive und Rückkehrsicherung
über den Workerwechsel hinweg prüfen.

Die [nativen Exporte](evidence/reader-flow/native/README.md) des
0.11.0-Kandidaten sind an **300 Runtime-Inputs** mit SHA-256
`5f0789aef525e68db2b4b841c2fa4bf1f9f74283fae6a3ed055d5eea2e2eb134`
gebunden. [Vorher-/Nachherlisten](evidence/reader-flow/native/runtime-inputs.json)
und [Laufprotokoll](evidence/reader-flow/native/native-builds.json) bestätigen
unveränderte Inputs während beider Exporte. Android und iOS wurden mit
`--no-minify --no-bytecode` exportiert. Die
[portable Prüfung](evidence/reader-flow/native/native-export-check.json)
parst die Bundle-Syntax und verifiziert Metadaten-/Assetbytes, darunter je
98 A51-PNGs, sechs Buchschwert-PNGs und drei David-WebPs. Die bisherigen
0.10-Ausgaben wurden [separat erhalten und byteweise abgeglichen](evidence/reader-flow/native/prior-output-preservation.json).

Das sind statische Debugexporte. Es gibt hier keinen nativen
`onTextLayout`-Ereignis-, Layout-, Eingabe-, Systemskalierungs- oder
Screenreaderlauf auf Simulator oder physischem Gerät, keine APK/AAB/IPA und
keine native Laufzeit-/Leistungsabnahme. Synthetische Zeilenereignisse der
reinen Modelltests beweisen den Mappervertrag, nicht das tatsächliche
Plattformereignis. Chromium-Axe und Tastaturtests ersetzen VoiceOver/TalkBack
ebenfalls nicht.

## Verbleibende Original- und Produktlücken

Mehrversauswahl, die ursprüngliche eigene Kopieraktion und das Anzeigen des
ganzen Originalkapitels innerhalb eines Teilabschnittscopes fehlen weiterhin.
Der bestehende Einvers-Entwurfsvertrag mit `from === to` wird nicht als
Bereichsnotiz ausgegeben. Eine spätere Erweiterung benötigt einen eigenen
Auswahl-/Quellenvertrag und passende Abnahme; dieser Stand beansprucht keine
vollständige Readerparität.

Die übrige [Master-Parität](16-current-plan-and-parity.md), darunter die
Übernahme des vorbereiteten NT-Fragenkatalogs, breitere Inhalte und persönliche
Zuordnungen, bleibt offen. Optionale KI, Sync und Audio werden durch diesen
Reader weder aktiviert noch abgenommen. Es werden daraus keine weiteren
Versions- oder Terminversprechen abgeleitet.

## Abgeschlossene finale Abnahme und private Bereitstellung

Der aktuelle Kern `oliva-01c4b9f640bc0931` besteht **168/168 Fachtests und einen einzelnen vollständigen 92/92-Browserlauf**, ohne Skip, Flaky-Fälle oder Wiederholung. Der echte 0.10→0.11-PWA-Wechsel ist erfolgreich: alle vier Rohrecords einschließlich Originalblob, Recovery und beider Entwürfe exakt; PSA119/Vers120 wird erstmals offline ohne Sprungparameter im Fließtext angezeigt und bleibt nach Fokus/Reload erhalten. Sämtliche sieben A51-Stadien, beide großen Buchbilder, fünf Storybilder und ein exklusiver Vorgängerchunk wurden offline geprüft. [Finale Zusammenfassung](evidence/reader-flow/validation-summary.json), [Gesamtlauf](evidence/reader-flow/e2e-results.json), [Update](evidence/reader-flow/upgrade/offline-upgrade.json).

**Seit 09.11.2026, 08:20:19 UTC eigentümerprivat bereitgestellt.** Quelle `505da81aa36216c080158a617fc963ebf7d7dd5c`, Deployment `appgdep_6af1823698f08191b7fd4d34012c9ca4`, Hostkern `oliva-6fe6a58c87610ef5`. Tatsächlich 20 Routen und 105 App-Dateien geprüft: 104 Hashvergleiche, HTML-Shell separat; dazu 42 Review-Dateien bytegenau. Anonym HTTP401, Publikum unverändert. [HTTP-Nachweis](evidence/reader-flow/private-http-check.json). Kein gehosteter CUA-/Phone-/Simulatorbeleg. GitHub-Sicherung und eigener Quellcheckpoint folgen separat; zuvor offene Tabellenzeilen beschreiben ihren damaligen Zwischenstand.
