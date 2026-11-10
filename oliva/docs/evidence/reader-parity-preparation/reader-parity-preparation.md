# Nächster Readerumfang: Mehrversauswahl, Kopieren und Kapitelkontext

Dies ist eine **Quellprüfung und Umsetzungsvorbereitung**, keine neue Readerimplementierung oder Abnahme. Ausgangspunkt ist der eingefrorene 0.12-Kandidat `oliva-80005b3c1d2e2eef`; seine laufende Gesamtabnahme bleibt getrennt. Die Umsetzung beginnt erst, nachdem dieser Stand fertig abgenommen, gesichert und eigentümerprivat bereitgestellt ist. Dieser Bericht vergibt weder eine neue Produktversion noch einen Termin. App, Tests, Pakete, Git und Bereitstellung wurden für diese Vorbereitung nicht geändert.

Die gelesenen Quellen und ihre SHA-256-Werte stehen in [provenance.json](provenance.json). Das FaithPath-Original wurde ausschließlich im vorgegebenen Snapshot `a519ce898fa33907b07d5ac7a585595127556183` untersucht. Die Aussagen belegen Quellverhalten; weder Original-App noch Simulator oder Gerät wurden dafür ausgeführt.

## Belegter Originalvertrag

| Verhalten | Tatsächlicher Quellbeleg im FaithPath-Snapshot |
| --- | --- |
| Jeder Tap beziehungsweise Enter/Leertaste schaltet genau einen Vers in einer additiven Auswahl an/aus. Es gibt keinen belegten Shift-Bereich, Ziehgriff oder automatischen Lückenschluss. | `src/app.js:1334`; `src/verbunden/interaction.js:36` |
| Vor einer Bereichsaktion wird die Auswahl aufsteigend sortiert. Eine Lücke erzeugt „Bitte wähle zusammenhängende Verse aus.“. Die Quellreferenz erhält exakt erstes/letztes ausgewähltes Versende. | `src/app.js:567` |
| Die Leiste nennt die Anzahl und bietet Markieren, Notiz, Mit Weg verbinden, Kopieren und Auswahl aufheben. Aufheben setzt den Fokus auf den zuletzt zur Auswahl hinzugefügten, noch ausgewählten Vers zurück. | `src/app.js:574`, `:1340` |
| Notiz und Wegbezug verwenden `currentRef()`: die gültige Auswahl, andernfalls die Readerreferenz. Bereichsmarkierung nutzt `paintRange`; die Auswahl bleibt nach Markierung erhalten. | `src/app.js:585`, `:1353`, `:1380`, `:1407` |
| Kopieren erzeugt Referenzlabel, LF, je Vers `Versnummer + Leerzeichen + unveränderter Text` mit LF dazwischen, LF, vollständiger Übersetzungsname. Erfolg meldet „Bibeltext kopiert.“; Ablehnung öffnet ein Textfeld mit demselben Text zum manuellen Kopieren. Die Auswahl wird dabei nicht gelöscht. | `src/app.js:1433`; Übersetzungsname „Lutherbibel 1912“ in `src/content.js:1214` |
| `vs` ist stets das vollständige Kapitel. `from`/`to` markieren einen Fokus innerhalb dieses Texts; „Zum Abschnitt“ scrollt zum Anfangsvers und setzt dessen Fokus. | `src/app.js:474`, `:513`, `:1323`; `src/verbunden/reader.css:154` |
| Fünf Inlineverse je Absatz sind eine Darstellungsregel. Markierung, Auswahl und Abschnittsfokus besitzen getrennte Zustände. | `src/verbunden/reader-flow.js:3`; `src/verbunden/reader.css:135–155` |

OLIVAs bestehende ausdrückliche Bestätigung bleibt maßgeblich. Die ursprüngliche automatische Kapitelendenerkennung wird durch dieses Arbeitspaket nicht übernommen.

## Empfohlener konkret abgegrenzter Umfang

Eine gemeinsame Fachlogik soll beide Readerdarstellungen bedienen: bestehender Fließtext einschließlich nativer Rückfalllogik und Einzelversalternative. Sie übernimmt die belegte additive Auswahl, zusammenhängende Bereichsaktionen, Bereichsnotizen, explizites Kopieren mit Rückfall sowie das vollständige Kapitel um einen weiterhin eindeutig benannten Teilabschnitt. Alle bestehenden Einzelversaktionen bleiben erreichbar.

### Auswahl und Aktionsoberfläche

- Ein reines `selection`-Modell hält kanonische Versnummern plus zuletzt betätigten Vers. Es prüft Mitgliedschaft im aktuellen Kapitel, sortiert und liefert entweder eine exakte zusammenhängende Referenz oder einen erklärten Lückenzustand. Auswahl lebt nur im Screen und wird bei logischem Scopewechsel geleert; kein Wachstum und keine gespeicherte Auswahl.
- Inline-Taps, Enter/Leertaste und die große zugängliche Verswahl schalten dieselben Nummern. Die Verswahl erlaubt mehrere Zahlen und besitzt einen ausdrücklichen Abschluss. Keine neue Gestenbehauptung.
- Genau **ein** Aktionspanel für die gesamte Auswahl, außerhalb der Textabsätze. `FlowText` und `LegacyVerseText` rendern keine Kopie je betroffenem Absatz. `selectedVerses` steuert ausschließlich die Zustandsdarstellung; Panel und Textmessung bleiben getrennt. Ein fester Zugang beziehungsweise kurze Auswahlleiste hält Aktionen auch nach Auswahl über mehrere Absätze erreichbar.
- Die Leiste nennt Anzahl und genaue Referenz. Bei Lücken bleibt die Auswahl sichtbar und erklärt „Bitte wähle zusammenhängende Verse aus.“; Bereichsaktionen sind gesperrt. Es werden keine nicht ausgewählten Zwischenverse markiert, kopiert, notiert oder verknüpft.
- Markieren/Entfernen schreibt die vorhandenen versweisen Schlüssel in **einer** Storetransaktion. Bestehende fünf Farbwerte, importierte Farben und Markierungen außerhalb der Auswahl bleiben erhalten. Merken bleibt die vorhandene Einzelversfunktion; eine neue Bereichs-Lesezeichenform wird nicht eingeführt. Vorhabenbezug übernimmt exakt die Bereichsreferenz in den bestehenden Vorhabenablauf.
- Auswahlaufhebung/Escape/Android-Zurück schließen das Panel und führen den Fokus zum letzten betätigten noch vorhandenen Vers zurück. Einstellungen und Verswahl behalten ihre bestehende höhere Dismisspriorität. Lesefokusstart sichert offene Entwürfe und leert die Auswahl wie bisher. Paneländerungen bewahren den kanonischen Leseanker.

### Bereichsnotizen brauchen einen ausdrücklichen Datenvertrag

`capture-schema.ts:19–23` bindet `type: "verse"` an genau einen Vers; `captureKey` enthält absichtlich nur dessen `from`. Diese Bedeutung und alle bestehenden Einzelversschlüssel bleiben unverändert.

Empfehlung: eine neue eindeutig benannte Bereichsquelle, etwa `type: "passage"`, mit kanonischen expliziten Grenzen `from < to`. Ihr Schlüssel enthält beide Grenzen, beispielsweise `capture:passage:JHN:6:35:36`. Ein einzelner Vers verwendet weiterhin die alte Quelle und den alten Schlüssel. `35–36`, `35–37` und Vers `35` erhalten getrennte Entwürfe. Das ist eine vorgeschlagene neue Quelle, keine bereits vorhandene Funktion.

`commitCapture`, `CaptureInput`, `CaptureContext`, `DraftLinks`, Reader-Entwurfszugänge und die Sammlung behandeln beide Bibelquellen ausdrücklich. Ein gespeicherter Bereich ist `kind: "note"`, besitzt exakt dieselbe `note.ref` und unverändert bewahrte `captureSource.ref`. Die Entwurfsquelle wird beim Öffnen eingefroren; spätere Auswahländerung hängt eingegebene Worte niemals an eine andere Stelle. Vorhandene Draft-ID, Revision, Speicherfehler- und Unmountsicherung bleiben maßgeblich. Aus der Sammlung führt ein Entwurfslink über seine validierte Draft-ID zurück, stellt dessen exakte Bereichsauswahl wieder her und springt zum ersten Quellvers; `verse=from` allein stellt keinen Bereich wieder her.

Die Wachstumswache ist ebenfalls anzupassen: `store.finishEditorDraft` (`state/store.ts:254`) ruft heute für jede Capturequelle außer `verse` `grow(d)` auf. Eine neue `passage`-Quelle wäre damit ohne ausdrücklichen Ausschluss fälschlich eine Wachstumsberechnung. Beide Bibelnotizquellen bleiben neutral; vorzugsweise benennt eine gemeinsame Fachfunktion die wenigen tatsächlich wachstumsfähigen Quellen positiv. Dieser Vertrag gehört in einen eigenen Negativfall beim Speichern einer Bereichsnotiz, auch mit noch nicht nachgezogenen Wachstumsschwellen im Ausgangsdatensatz.

Das vorhandene allgemeine Journal akzeptiert zwar Bereichsreferenzen, besitzt aber nur den gemeinsamen Schlüssel `journal` (`personal/model.ts:252`). Es ersetzt deshalb nicht den benötigten unabhängigen, quellengebundenen Bereichsentwurf.

**Historische Verträge zuerst einfrieren:** `schema-v5.ts:4` und `schema-v6.ts:4` importieren derzeit das lebende `captureValuesSchema`; zusätzlich wird `noteSchema.captureSource` aus `state/model.ts:89` über ältere Datenschemata vererbt. Eine Erweiterung des heutigen Unions würde alte Dokumente rückwirkend erweitern. Vor Umsetzung sind die bisherigen Capture-, Draft-, Notiz- und Positionsschemata als unveränderliche Vorgängerverträge zu binden, einschließlich des tatsächlich ausgelieferten V8-Standes. Die neue aktuelle Nutzdatenform bekommt einen ausdrücklichen Migrationspfad; diese Vorbereitung bestimmt keine Produktversionsnummer. Alte V5–V8-Prüfer müssen neue Bereichsquellen weiterhin ablehnen.

### Kopieren

Eine reine Formatfunktion erhält die geprüfte Auswahlreferenz und liest Verse ausschließlich aus dem vorhandenen Bibelrepository. Sie erzeugt den Originalaufbau mit `referenceLabel(ref)`, LF, nummerierten Originalversen, LF und `Lutherbibel 1912`; kein HTML, keine UI-Beschriftungen, keine zusätzlichen Absatzabstände und keine Textnormalisierung. Beispiel aus dem tatsächlich vorhandenen OLIVA-Text:

```text
Johannes 6,35–36
35 Jesus aber sprach zu ihnen: Ich bin das Brot des Lebens. Wer zu mir kommt, den wird nicht hungern; und wer an mich glaubt, den wird nimmermehr dürsten.
36 Aber ich habe es euch gesagt, daß ihr mich gesehen habt, und glaubet doch nicht.
Lutherbibel 1912
```

Ein schmaler Clipboarddienst kapselt Plattformaufruf und Fehler. Expo 58 nennt in seinem tatsächlich installierten `bundledNativeModules.json:38` `expo-clipboard ~58.0.4`; das Paket fehlt derzeit in `package.json` und Lockfile. Erst in der späteren Implementierung gezielt über die Expo-kompatible Installation aufnehmen und Lockfile prüfen. Kein Installations- oder Paketänderungsschritt gehörte zu dieser Vorbereitung.

Bei API-Fehler oder nicht verfügbarem Clipboard öffnet ein zugänglicher Dialog ein auswählbares, schreibgeschütztes Textfeld mit exakt demselben String und einem verständlichen manuellen Kopierhinweis. Erfolg wird erst nach erfülltem Schreibversprechen gemeldet. Auswahl, Notizen und Fortschritt bleiben bei Erfolg und Fehler erhalten; Schließen stellt den Fokus wieder her. Betriebssystem-Textauswahl bleibt zusätzlich nutzbar, ersetzt den Button aber nicht.

### Vollständiges Kapitel mit unverändertem logischen Teilabschnitt

Vier Begriffe werden ausdrücklich getrennt:

| Begriff | Zuständigkeit |
| --- | --- |
| Logische Referenz | Unveränderte Route `book/chapter/from/to`, gespeichertes `reading`, Scopevergleich, Wegschritt und ausdrückliche Bestätigung. |
| Anzeigereferenz | `{book, chapter}`; vollständiges `getChapter`, Absatzprojektion, Verswahl, Messvollständigkeit und zulässige Sprungziele. |
| Fokusreferenz | Der logische Teilabschnitt als eigene Textbetonung und „Im Fokus: …“. Nicht mit Auswahl oder Markierungsfarbe gleichsetzen. |
| Aktionsreferenz | Ausschließlich die aktuell ausgewählten zusammenhängenden Verse; darf beim Lesen des Kapitelkontexts außerhalb des Fokus liegen. |

`flowParagraphs` darf seine Prüfung fremder Abschnittsverse behalten: ihm wird die **Anzeigereferenz** übergeben, statt seine Schranken global zu lockern. Beide Textadapter bekommen die Fokusreferenz separat. Markierung, Auswahl, Merkzeichen und Fokus müssen gleichzeitig erkennbar und zugänglich benannt sein.

Der Positionshook hält den **logischen** Scope einschließlich Grenzen als Generation/Speicherwache. Seine zulässigen Verse und seine erwartete Messmenge stammen dagegen aus der Anzeigereferenz. Alle aktuellen `getPassage`-Grenzen sind gemeinsam umzustellen: Messvollständigkeit (`useReaderPosition.ts:239`), `restore` (`:296`), explizite Verslinks (`:315`) und aktuelle Persistenzvalidierung (`position.ts:13`). Ein Versanker außerhalb des Fokus, aber innerhalb desselben Kapitels ist im neuen Vertrag gültig; `readingPosition.ref` bleibt die logische Referenz. Kapitel- und Abschnittsscopes werden nicht über `sameReadingScope` zusammengelegt. Gemeinsame Inlinezeilen, geschützte ausdrückliche Sprünge, Reflowstempel und native Rückfalllogik bleiben erhalten.

Für die erste Teilabschnittsöffnung gilt: ausdrücklicher gültiger Verslink vor passender gespeicherter Position vor erstem Fokusvers. Ein späterer Offline-Neustart darf eine gespeicherte Kontextposition außerhalb der Fokusgrenzen wiederherstellen. „Zum Abschnitt“ ruft die kanonische Wiederherstellung seines ersten Verses auf und setzt den Versfokus. Das heutige `position.beginning()` (`:436`) löscht den Anker und scrollt `y=0`; es ist dafür nach der Erweiterung ungeeignet. Ein Sprung zum Kapitelanfang bleibt eine gesonderte Handlung und adressiert ebenfalls den ersten kanonischen Kapitelvers; ein Sprung vor die Einleitung muss entsprechend anders benannt sein.

Eine Teilabschnittsbestätigung bleibt `markRead(logicalRef, stepKey)` und ändert weder `readChapters` noch NT-Status. Der bisherige explizite Link „Das ganze Kapitel lesen“ wird im neuen Kontext sinnvoll als „Ganzes Kapitel als Lesebereich öffnen“ benannt: er entfernt `from`/`to` und `path`/`step`, behält `mode` und öffnet die normale Kapitelroute. Deren `openReading` speichert die neue vollständige logische Referenz; Auswahl und fremder Abschnittsanker werden wie bei jedem Scopewechsel zurückgesetzt. Erst dort steht die Kapitelbestätigung; der Klick selbst bestätigt nichts. Das sichtbare Vollkapitel selbst erweitert den Bestätigungsscope nicht. Eine weiterhin sichtbare Herkunftsreferenz ist nur ein beschrifteter Kontextlink und darf nicht zugleich versteckter Bestätigungsscope sein. Abschnittsbestätigung und Rückkehr zum Weg bleiben gut erreichbar und benennen ihre genaue Quelle.

Home/Bibel-Fortsetzung nennen bei Bedarf sowohl „Im Fokus: …“ als auch „Zuletzt im Kapitel bei Vers …“. Ein Scopewechsel A→B im selben Kapitel verwirft alte Messungen und ausstehende Positionsschreibvorgänge, obwohl der sichtbare Text gleich bleibt.

Beim neuen Nutzdatenvertrag muss `services/documents.ts:24–37` zusätzlich einen **expliziten eingefrorenen V8-Zweig** behalten: aktuell stehen dort V4–V7 plus die aktuelle Form. Nur die aktuelle Form zu ersetzen würde bestehende private V8-Speicherdokumente unlesbar machen. Private Speicherhülle und physische SQLite-/IndexedDB-Version werden nur geändert, wenn der tatsächliche Speicheraufbau es erfordert. Originalarchive, Rückkehrsicherung, NT-Antwortsnapshots und historische NT-Belege bleiben erhalten; Migration erfindet keine Lese-, Lern- oder Wachstumserfahrung.

## Dateibesitz und Reihenfolge für die spätere Umsetzung

| Verantwortlicher Bereich | Dateien / Integrationsgrenze |
| --- | --- |
| Datenverantwortung zuerst | `personal/capture-schema.ts`, `schema-v5.ts`, `schema-v6.ts`, aktuelle/festgeschriebene Draftschemata; `state/model.ts`, `state/store.ts`, `services/documents.ts`, `bible/position.ts`. Eine Person besitzt das historische Schema- und Migrationsnetz einschließlich V8 und die explizite Wachstumsneutralität. |
| Reine Readerfachlogik | Neue kleine Module für Auswahl/Referenzbildung und Kopierformat unter `features/bible`; vorhandenes Repository bleibt einzige Textquelle. Keine Rendererabhängigkeit. |
| Plattform und Darstellung | `flow/types.ts`, `FlowText.web.tsx`, `FlowText.tsx`, `LegacyVerseText.tsx`; gemeinsame Auswahl- und Fokuszustände, unveränderte Fragmentmessung. Clipboardadapter unter `services`, gezielte Paket-/Lockfileänderung in diesem Teil. |
| Aktionen und Entwürfe | Ein gemeinsames Auswahlpanel; `VerseActions.tsx` als erhaltene Einzelversfunktion oder schmale Spezialisierung, `CaptureInput`, `CaptureContext`, `DraftLinks`, `capture-model`. Keine zweite Save-Implementierung. |
| Ein Integrationsbesitzer | `app/lesen/[book].tsx`, `useReaderPosition.ts`, nötige Resume-Beschriftungen in `app/index.tsx`/`app/bibel.tsx`. Erst nach vereinbarten Fachtypen und Datenverträgen integrieren; konkurrierende Änderungen an diesen Dateien vermeiden. |
| Unabhängige Abnahme | Bestehende Fach-/Browserfälle bewahren und unten genannte Vertragstests ergänzen. Dokumentation und Belege nennen jeweils den tatsächlich geprüften Kern. |

## Aussagekräftige Abnahme

1. **Auswahl:** 35/36 in beiden Reihenfolgen und über Absatzgrenze hinzufügen, einzeln entfernen, komplette Auswahl löschen; 35/37 bleibt sichtbar, jede Bereichsaktion verweigert ohne Daten-/Clipboardeffekt. Vollständiger Tastaturweg und große Verswahl stimmen mit Inline-Taps überein. Unmount/Fokusstart direkt nach Texteingabe schützt den alten Entwurf.
2. **Bestehende und neue Aktionen:** Einzelvers `JHN:6:35` weiter merken, Oliv/Gold setzen/entfernen und alte/importierte Farben anzeigen. Bereichsmarkierung betrifft nur ausgewählte Schlüssel und scheitert bei Speicherfehler atomar. Vorhaben bekommt exakt 35–36. Notizentwürfe 35, 35–36 und 35–37 bleiben nach Reload unabhängig; Sammlung stellt denselben Bereich, dieselbe Draft-ID und dieselben Worte wieder her. Bestehende Notizen, Bearbeitungskonflikte, Verwerfen und echte Speicherfehler bleiben abgesichert.
3. **Kopierbeweis:** Stringgleichheit gegen kanonische Repoverse, inklusive Umlauten, `daß`, Nummern, En-Dash im Referenzlabel, LF und Übersetzungsname. Echter Browser-Clipboard-Erfolg sowie erzwungene Ablehnung mit bytegleichem Rückfalltext und Fokusführung; keine Erfolgsmeldung bei Ablehnung. Nativer APIaufruf, auswählbarer Rückfall und Rücknavigation brauchen getrennte tatsächliche Plattformprüfung.
4. **Kapitelkontext:** David 1. Samuel 17,38–45 zeigt nun auch 37/46 und das vollständige Kapitel; nur 38–45 tragen Fokuszustand. MRK 4,35–41 entsprechend. Vor und hinter den Fokus scrollen, Kontextvers auswählen und beim echten Offline-Neustart sowie Home/Bibel-Fortsetzen genau dort wiederherstellen. „Zum Abschnitt“ landet tatsächlich beim ersten Fokusvers, ohne einen Testscroll zur Korrektur.
5. **Positionskonflikte:** Teilabschnitt A→B im gleichen Kapitel mit verzögerten Messungen und eigenen ausstehenden Schreibvorgängen; ausdrücklicher Verslink vor gespeicherter Position; Kapitelwechsel; geteilte Inlinezeile und mehrzeiliger Vers; 320↔1440, maximale Schrift/Zeilenhöhe, Editor-/Lesefokuswechsel. Kanonischer Vers und logischer Scope bleiben korrekt, kein Pixel wird gespeichert.
6. **Fortschrittsgrenze:** Auswahl, Kopieren, Textfehler, Scrollen, Reflow und Fokuswechsel ändern keine Lese-/Wachstums-/NT-Felder. Teilabschnitts-/Wegbestätigung bleibt exakt; erst bewusster Scopewechsel ermöglicht Kapitelbestätigung. Bestehende NT-Antworten, Roharchive, Rückkehrsicherung und persönliche Quellen bleiben durch Migration und echten Vorgänger-Workerwechsel erhalten.
7. **Historische Strenge:** Unveränderte echte V5–V8-Backups und private V8-Dokumente lesen; neue Bereichsquelle und Kontextanker unter altem Versionslabel ablehnen; dieselben alten Inhalte neutral in die neue aktuelle Form übernehmen. Export/Restore sowie echte Speicherfehler prüfen. Die 1.300 vorhandenen NT-Fragen werden nicht neu erzeugt oder verändert.
8. **Darstellung/Zugang:** 320/390/768/1440, Hell/Dunkel, große Schrift und alle vorhandenen Zeilenabstände; kein horizontaler Überlauf, verdecktes Versende oder unzugängliche Aktionsleiste. Eindeutige Auswahl-/Fokus-/Markierungslabels und sichere Rückfokusführung. Bestehende native Fragment-Rückfallgrenzen erhalten. Web/Axe, native JS-/Assetexports und tatsächliche iOS-/Android-Läufe bleiben getrennte Belegarten; ohne letztere keine Geräte-/Screenreaderbehauptung.

Diese Abnahmen sind vorgeschlagen und wurden in dieser Vorbereitung nicht ausgeführt. Der laufende 0.12-Gesamtlauf wird dadurch weder verändert noch vorweggenommen.
