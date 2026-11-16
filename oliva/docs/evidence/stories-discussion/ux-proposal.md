# Gestaltungsvorschlag: der FaithPath-Geschichtenbestand in OLIVA

Stand: 16.11.2026. **Besprechungsgrundlage, keine Implementierung oder Freigabe.** Reader-Abnahme und laufende Bereitstellung bleiben vorrangig. Für diese Untersuchung wurden Quelltext, Metadaten, tatsächliche Dateigrößen und vorhandene Screenshots gelesen. Keine neuen Bilder, Designscreens, Builds oder Browserläufe wurden erstellt. Die hier genannten Erweiterungen sind Vorschläge.

Die überprüften OLIVA-Fakten und Dateihashes stehen in [current-oliva-facts.json](current-oliva-facts.json). Der separate Originalaudit liefert die Katalog- und Quellenfakten; seine Originalbezeichnungen werden unten bewusst von neuen OLIVA-Vorschlägen getrennt.

## Ausgangslage

Bereits vorhanden sind fünf illustrierte OLIVA-Erzählpiloten: Noah (Genesis 8,6–12), Abram (Genesis 15,1–6), Davids Vorbereitung (1. Samuel 17,38–45), Geburt Jesu (Lukas 2,1–20) und Ostermorgen (Markus 16,1–8). Sie öffnen denselben Bibelreader. Bibelwort, KI-unterstützte redaktionelle Einordnung und künstlerische Illustration sind sichtbar getrennt. Die aktuelle Bibliothek rendert alle fünf großen Karten direkt; das ist noch keine Bibliotheksarchitektur für 436 Einträge.

Das aktuelle Bildmanifest enthält acht Master und 21 WebP-Varianten. Galiläa, Sturm und Garten kommen zu den fünf Bildszenen hinzu. Die Originalmaster gehören nicht in das Laufzeitpaket. Alle acht Einträge haben eine technische bzw. interne visuelle Prüfung; unabhängige historische/theologische Prüfung und öffentliche Produktfreigabe sind weiterhin offen. Ältere Dokumentabsätze mit sieben Mastern/18 Varianten beschreiben frühere Stände; maßgeblich sind Manifest und spätere Integrationsberichte.

Eine zentrale Originaldatenkorrektur ist wichtig: Die 436 Einträge sind **kuratierte Bibelabschnitte mit Titel, Stellen, Reflexionsimpuls und Fragen**. Sie enthalten keine 436 fertigen Nacherzählungen, Zusammenfassungen, Bilder oder Lesedauerangaben. Psalmen, Briefe und Lehrtexte sind ebenfalls enthalten. Der Bestand hat 2.479 primäre Multiple-Choice-Elemente mit vier Optionen sowie 436 separate Reflexionsimpulse. Nur 174 primäre Frageelemente besitzen eine Erklärung; 2.305 enthalten keine vollständige Erklärung. Das bedeutet einen vollständigen Fragenimport, aber keinen automatischen Import von 2.479 fertigen Erklärkarten. Diese Fakten stammen aus dem parallelen Katalogaudit, nicht aus dem fünfteiligen OLIVA-Piloten.

## 1. Übersicht, Einzelansicht und Navigation

Mein Vorschlag ist ein eigener Bereich **„Bibel entdecken“**, erreichbar über den vorhandenen Bibelbereich. Eine Unterzeile kann „Geschichten, Gleichnisse und weitere Abschnitte“ erklären. Die fünf Hauptziele Heute, Bibel, Wege, Mein Garten und Sammlung bleiben erhalten. Buchsuche und ihre neue Voreinstellung „Gesamte Bibel“ bleiben unangetastet.

Die Übersicht besitzt vier Ebenen:

1. Ein einzelner Fortsetzen-Eintrag, wenn wirklich eine Geschichte begonnen wurde. Kein großes Fortschrittsdashboard.
2. Ein kurzer, redaktionell ausgewählter Einstieg mit wenigen besonderen Bildkarten, etwa „Jesus begegnen“ oder „Die große Geschichte kennenlernen“. Diese Sammlungen wären neue Redaktion, keine bereits vorhandenen Katalogtags.
3. Suche über Titel und tatsächlich zugeordnete Bibelstellen; standardmäßig der ganze Bestand, danach das vertraute NT-/AT-Dropdown und ein Buchfilter. Themen erscheinen erst als zusätzliche, kuratierte Hilfe.
4. Alle Einträge als kompakte, virtualisierte Liste mit gutem Titel, ausgeschriebener Bibelstelle und unaufdringlichem tatsächlichem Lernstand. Ein Bild ist optional. Auf großen Displays sind zwei Spalten möglich; das Handy bleibt einspaltig.

Die normale Sortierung wäre **Bibelreihenfolge**, nicht behauptete historische Chronologie. Das Original hängt einen Apostelgeschichte-11-Eintrag nach dem Offenbarungsende an; eine neue Sortierung muss deshalb abgeleitet werden, während Original-ID und ursprüngliche Reihenfolge erhalten bleiben. Eine kuratierte heilsgeschichtliche Reise ist davon getrennt.

Die einzelne Ansicht ist ein ruhiger Einstieg: Titel, Bibelstelle, gegebenenfalls Bild, eine verständliche Einleitung nur soweit redaktionell vorhanden, dann **„Im Bibeltext lesen“**. Geschätzte Lesedauer wäre künftig aus tatsächlichem Textumfang abgeleitet und als Schätzung gekennzeichnet. Die Leseansicht nutzt OLIVAs vorhandenen Reader, Schriftwahl, Lesefokus und Notizfunktionen. Ein sichtbarer Rückweg führt wieder zur genau geöffneten Geschichte mit ihrer Auswahlposition; ein Quellenlink und Kapitelkontext bleiben erreichbar.

„Vorheriger/Nächster Abschnitt“ darf sich auf die gewählte Liste beziehen und muss diese Beziehung erklären. Es darf nicht versehentlich die Reihenfolge der 66 Bibelbücher durch eine unsichtbare Themenliste ersetzen.

## 2. Rolle und Umfang der Illustrationen

Ich empfehle eine **gemischte Bildstrategie**:

- Bedeutende Einstiegsgeschichten erhalten individuelle, sorgfältig geprüfte Illustrationen.
- Ein wirklich passendes Bild darf dieselbe belegte Szene in mehreren Zugängen begleiten: Bibliothek, Reader und Lernweg. Dasselbe Asset muss dafür nicht dreimal gespeichert werden.
- Atmosphärische Landschaften dürfen als erkennbar allgemeine Einstimmung dienen. Sie werden nicht als konkrete historische Szene ausgegeben.
- Briefabschnitte, Gebete und poetische Texte erhalten zunächst eine ebenso hochwertige typografische Darstellung mit ruhigem Buchmotiv. Ein Bildplatzhalter oder Spinner wird bei absichtlich bildlosen Einträgen nicht gezeigt.

436 individuelle Bildaufträge zu Beginn wären gestalterisch und redaktionell unverhältnismäßig. Die Qualität würde durch widersprüchliche Figuren, Kleidung und Szenenkompositionen schwanken. Eine kleinere ausgezeichnete Bildstrecke und eine vollständige elegante Textbibliothek sind überzeugender als hunderte austauschbare Bilder.

Wiederverwendung ist durch den Inhalt begrenzt. Die vorhandene Markusszene mit drei Frauen am Grab passt nicht unverändert zu Matthäus 28 mit anderer Erzählanordnung. Geburtsszenen dürfen Lukas und Matthäus nicht zu einer vermeintlichen gemeinsamen Momentaufnahme vermischen. Bei wiederkehrenden Figuren wird vor einer größeren Serie ein Figuren-/Kleidungsblatt benötigt; gleiche Prompts gewährleisten noch keine Figurenkontinuität.

## 3. Konkrete erste Bildstrecke aus dem tatsächlichen Katalog

Diese Zuordnungen und Prioritäten sind Vorschläge; die Titel/IDs/Stellen sind geprüfte Originaldaten:

| Originaleintrag | Umgang mit vorhandenen Bildern bzw. erste neue Arbeit | Grund |
|---|---|---|
| NS-0001 „Am Anfang“, Genesis 1,1–31 | Vorhandenes Garten-/Lichtmotiv zunächst als freie Einstimmung prüfen | Verständlicher Anfang des Gesamtbogens; keine geografische Eden-Behauptung und kein Bildversprechen für jede Schöpfungsszene. |
| NS-0006 „Da gedachte Gott an Noah“, Genesis 8,1–22 | Vorhandene Tauben-/Olivenblattszene verwenden, genauer Bildbezug 8,6–12 | Ruhige Hoffnung, Wiedererkennung; der Bildausschnitt ist enger als die gesamte Leseeinheit. |
| NS-0010 „Abram glaubte dem HERRN“, Genesis 15,1–6 | Bestehende Abram-Illustration passt zum exakten Abschnitt | Bewahrt vorhandene gute Arbeit; Vertrauen und offene Fragen werden anschaulich. |
| NS-0025 „Der HERR wird für euch streiten“, Exodus 14,13–31 | **Eine der ersten neuen Illustrationen** | Schließt eine große Lücke im biblischen Gesamtbogen: Befreiung und Aufbruch. Respektvoller Bildmoment statt Sieges-/Gewaltspektakel. |
| NS-0052 „Der Streit ist des HERRN“, 1. Samuel 17,32–50 | Bestehendes Davidbild als Vorbereitungsmoment 17,38–45 nutzen | Vertraute Geschichte, bildlich zugänglich; das vorhandene Bild zeigt nicht den späteren Ausgang des Kampfes. |
| NS-0241 „In der Krippe“, Lukas 2,1–20 | Bestehendes Geburtsbild passt zum exakten Abschnitt | Zentraler, niedrigschwelliger Einstieg; Matthäusmotive nicht hinzufügen. |
| NS-0203 „Schweig und verstumme“, Markus 4,35–41 | Bestehendes Sturm-Motiv und vorhandene OLIVA-Einordnung verbinden | OLIVAs bereits verwendeter Ersteinstieg wird in den vollständigen Katalog eingebunden. |
| NS-0249 „Der barmherzige Samariter“, Lukas 10,25–37 | **Eine der ersten neuen Illustrationen** | Mitgefühl und konkrete Hilfe sind unmittelbar verständlich. Verletzung sensibel darstellen. |
| NS-0255 „Der verlorene Sohn“, Lukas 15,11–32 | **Eine der ersten neuen Illustrationen** | Vergebung und empfangene Zuwendung tragen die OLIVA-Vision; die Deutung bleibt eine Einordnung zum Gleichnis. |
| NS-0235 „Sie fürchteten sich“, Markus 16,1–8 | Bestehendes Ostermorgenbild passt zum exakten Abschnitt | Grundlegend für christlichen Glauben und bereits als Pilot vorhanden. |
| NS-0264 „Der Weg nach Emmaus“, Lukas 24,13–35 | **Eine der ersten neuen Illustrationen** | Verbindet Fragen, gemeinsames Lesen und Verstehen besonders gut mit OLIVAs Produktidee. |

Meine ersten **neuen** Bildaufträge wären Samariter, Exodus, verlorener Sohn und Emmaus, während vorhandene Bilder korrekt eingebunden werden. Die Tabelle ist eine erste Bildstrecke und keine neue feste Versions- oder Terminplanung. Vor einer breiten Serie werden diese Motive im realen Karten-/Readerausschnitt sowie auf Hell/Dunkel und kleinen Displays geprüft.

## 4. Ablauf von Bibeltext, Fragen und persönlichen Gedanken

Die Empfehlung lautet **Lesen → Verstehen → eigener Gedanke**, mit dauerhaft erreichbarem Bibeltext und freiwilligen Übergängen:

- Das Lesen beginnt mit dem tatsächlichen Bibelabschnitt. Eine gegebenenfalls vorhandene verständliche Einleitung ist als redaktioneller Text getrennt. 436 neue Nacherzählungen werden nicht stillschweigend erzeugt.
- Anschließend bietet „Zum Text nachdenken“ die Originalfragen an. Eine Frage pro überschaubarer Ansicht, Originaloptionen in belegter Reihenfolge, klare Bestätigung der Antwort, tatsächliche Bibelstelle direkt einblendbar und danach vorhandene Erklärung. Fehlt eine Erklärung, zeigen richtige Antwort und der echte Belegtext genug Orientierung; eine erfundene Erklärung wird nicht als Original ausgegeben.
- Falsche Antworten führen freundlich zur Textstelle. Es gibt keinen Glaubensscore und keine Pflicht, alles sofort richtig zu lösen. Eine Pause und spätere Wiederaufnahme erhalten genaue Frageposition und bereits gegebene Antworten.
- Lange Einheiten müssen pausierbar sein: NS-0324/Apostelgeschichte 10 hat 31 Frageelemente. Die Oberfläche darf sie in kleine Etappen zeigen, ohne Originalfragen zu entfernen, umzuschreiben oder unbemerkt neu zu ordnen.
- Der vorhandene originale Reflexionsimpuls wird danach als freiwillige Einladung angeboten. Persönliche Worte landen als eigener, sauber zugeordneter Gedanke in der Sammlung. Die 436 Reflexionsimpulse sind zusätzliche Inhalte und nicht die 2.479 Multiple-Choice-Elemente.
- Optional kann daraus ein eigener Alltagsschritt entstehen. Ein kleines Abschlussbild empfiehlt einen passenden nächsten Abschnitt; es erzeugt keinen Zeitdruck.

Drei Zustände bleiben getrennt: **Abschnitt als gelesen bestätigt**, **Fragen angesehen/beantwortet**, **eigener Gedanke gespeichert**. Bilder betrachten, Antworten korrigieren oder dieselbe Geschichte erneut öffnen erzeugen keine zusätzlichen Glaubenspunkte. Ein voller Buchkapitelabschluss wird nicht aus einem kürzeren Storyabschnitt abgeleitet. Die Baumlogik muss vor Freigabe ausdrücklich gegen doppelte Fortschrittszählung geprüft werden.

## 5. Einbettung in OLIVA

Die bestehende OLIVA-Identität bleibt maßgeblich: Creme/Oliv im hellen Modus, dunkles warmes Grün, dezentes Gold, Cormorant-Titel, DM-Sans-Bedienung, großzügige Abstände und ruhige Bilder. Die jetzigen 8:5-Karten und 3:2-Readerbilder sind eine nutzbare Ausgangsbasis. Die große Storyübersicht verwendet diese aufwendigen Bildkarten gezielt und kompakte Typografie für den ganzen Katalog.

Die drei Motive haben verschiedene Aufgaben: **Die Geschichte zeigt eine Begegnung oder einen Textinhalt; das Buchschwert gibt Orientierung im zugehörigen Buch; der Olivenbaum bewahrt persönliche Entwicklung.** Darum kein Schwert über jedem Storybild, kein Kampfauftrag, keine Mini-Baum-Belohnung nach jeder Quizfrage. Am Abschluss genügt ein kleiner Bezug zum Buch und gegebenenfalls ein sanfter Hinweis auf eine tatsächlich gespeicherte Reflexion. Der Baum verliert durch Pausen keine Blätter; Gottes Liebe wird nicht an Antworten geknüpft.

## 6. Aufwand, schwierige Stellen und Offline-Nutzung

Der eigentliche Datentransfer ist ein überschaubares technisches Arbeitspaket; die vollständige lernbare Erfahrung ist ein **mittlerer bis großer Ausbau**. Dafür fehlen noch eine Katalogprojektion, Suche/Filter, eigene Story-Lernstände, robuste Migration alter Fakten, eine skalierende Bibliothek und Inhaltsredaktion. Die fortlaufende Bild-/Fachredaktion ist der größere langfristige Aufwand. Eine belastbare Personenwochenzahl wäre vor einem repräsentativen vertikalen Pilot und der genauen Datenvertragsentscheidung unzuverlässig; daraus jetzt einen Termin abzuleiten wäre nicht seriös.

Wiederverwendbar sind Reader, Schrift-/Darstellungseinstellungen, Auswahl/Kopieren/Notizen, Choice-Komponenten, Offlinegrundlage, Sicherungen, Konfliktschutz und das Prinzip versionierter Antwortquellen. Der vorhandene NT-Fragenvertrag ist jedoch hart auf fünf Fragen pro bekanntem Kapitel ausgelegt. Die Storyfragen dürfen nicht in diesen Vertrag gezwungen werden; sie brauchen eine eigene Domäne mit stabiler Story-ID, Frage-ID, Quellenfassung und nachvollziehbarem Lernstand. Fragen-/Antwortoptionen aus unterschiedlichen Quellvarianten dürfen bei historischen Antwortindizes nicht vermischt werden. Alte belegte Abschlüsse bleiben gegebenenfalls als historische Abschlüsse erhalten; fehlende alte Einzelantworten werden nicht erfunden.

Eine konkrete Sonderstelle ist NS-0420/Judas: 1,1–4 **und** 1,17–25. Der aktuelle Reader unterstützt einen zusammenhängenden Fokusbereich. Eine Storyansicht muss beide Originalabschnitte einzeln erreichbar machen; die ausgelassenen Verse dürfen nicht automatisch zum Storybereich werden. Alle 436 neuen Zusammenfassungen, Zeitangaben und Themenzuordnungen wären zusätzliche Redaktion bzw. Ableitung, kein vorhandener Import.

Aktuell werden sämtliche `dist`-Dateien in den PWA-Cache geladen und ein Vorgängercache bleibt für offene alte Ansichten erhalten. Diese Strategie ist für 436 dreifach aufgelöste Einzelbilder ungeeignet. Gemessene heutige Ausgangswerte:

| Tatsächliche Dateien | Umfang |
|---|---:|
| 8 Bildmaster, außerhalb des Runtimepakets | 23.503.350 Byte |
| 21 Runtime-WebPs für 8 Motive | 2.821.948 Byte |
| 15 WebPs der 5 eigentlichen Storypiloten | 1.920.840 Byte |
| Aktueller lokaler Webexport, alle Dateien | 17.423.016 Byte |

Reine Hochrechnung der fünf Storypiloten: alle drei Größen für 436 Geschichten wären etwa **167,5 MB**, nur die 640er Varianten etwa **24,7 MB**, nur die 1280er etwa **84,3 MB**. Das sind keine gemessenen 436 Assets und keine zugesagten Budgets. Komplexität, Bildinhalt und Encoding verändern sie; Kern, persönliche Daten, alte Caches und Browseroverhead kommen hinzu.

Meine Empfehlung: Texte, Fragen, Index und eine kleine Einstiegsbildstrecke offline bereitstellen; weitere Bilder beim Bedarf laden und für bewusst gewählte Bücher/Sammlungen als sichtbares Paket herunterladbar machen. Größe vor Download zeigen, Offline-Verfügbarkeit ehrlich anzeigen und Bildpakete entfernbar halten. Lesetext und Lernstand funktionieren ohne das Bild. Native SQLite und Web-IndexedDB/Cache benötigen eine gemeinsame Zustandslogik mit plattformgerechten Dateien; Browserquoten und mögliche Cacheverdrängung dürfen nicht verschwiegen oder als garantierte Gerätespeicherung dargestellt werden.

Vor breiter Freigabe müssen außerdem Suchindex-/Listenleistung, Antwortpersistenz mit vielen gespeicherten Fragen und Sicherungsgrößen auf schwächeren Geräten gemessen werden. Der gegenwärtige persönliche Zustand wird als Gesamtdokument validiert/gespeichert. Mehrere tausend Antwortsnapshots können Schreibkosten vergrößern; zuerst benchmarken, dann entscheiden, ob normalisierte Inhalts-/Antworttabellen nötig sind. Eine komplette Datenbankneuschreibung ist kein vorsorglicher Selbstzweck.

## 7. Empfohlene Reihenfolge

1. Unveränderlichen Originalbestand samt IDs, Alias-/Versionsfällen, Stellen, Reflexionsimpulsen und Ausnahmen fachlich und technisch erfassen. Das ist die jetzige Besprechungsvorbereitung; noch keine Importentscheidung.
2. Einen kleinen repräsentativen vollständigen Ablauf mit echten Katalogeinträgen entwerfen und nach späterer Beauftragung prüfen: erzählender Text, Gleichnis, Psalm/Brief, längere Frageeinheit und der geteilte Judasabschnitt. Vorhandene Bilder nutzen.
3. Daraufhin alle 436 Einträge und 2.479 primären Fragen funktional vollständig übernehmen, mit gleichwertig sorgfältiger typografischer Darstellung auch ohne Einzelbild. Damit wird OLIVA als persönlicher FaithPath-Nachfolger schnell vollständig benutzbar.
4. Parallel zur funktionalen Abnahme die kleine hochwertige Bildstrecke verfeinern. Die hier vorgeschlagenen vier neuen Motive stehen zuerst zur Diskussion. Inhalte, Figurenkontinuität und mobile Darstellung prüfen, dann in weiteren kuratierten Paketen ausbauen.
5. Anfänger mit echten Menschen beobachten, noch unklare Texte redigieren und die konkrete öffentliche Rechte-/Inhalts-/Gerätefreigabe abschließen, bevor daraus ein allgemein veröffentlichtes Produkt wird.

Damit entstehen weder ein ungeprüfter Daten-Großimport noch eine Wartezeit bis zum 436. Bild. Das funktional vollständige persönliche Werkzeug und die spätere Premium-App wachsen aus derselben sauberen Inhaltsbasis.

## 8. Lösungen, die ich nicht empfehlen würde

- 436 große Bildkarten gleichzeitig rendern oder alle Bildmaster im Erstdownload mitliefern.
- Jede Bibelstelle als historische Szene bebildern, auch wenn sie ein Gedicht oder Brief ist.
- Dasselbe konkrete Jesus-/Grab-/Geburtsbild beliebig für unpassende Texte wiederverwenden.
- 436 automatisch erzeugte Nacherzählungen oder 2.305 fehlende Erklärungen ungeprüft als fertige Redaktion ausgeben.
- Originale Frage-IDs, Optionen oder alte Antwortindizes beim Import stillschweigend normalisieren und damit historische Lernstände verändern.
- Aus richtigen Antworten geistliche Leistung, Ranglisten, Sperren oder eine Voraussetzung für Gottes Liebe machen.
- Für Geschichten einen zweiten isolierten Reader, eine sechste Hauptnavigation oder einen unabhängigen Fortschrittskosmos aufbauen.
- Cloudkonto, Online-KI, Audio oder 436 individuelle Bilder zur Voraussetzung der lokalen Katalogintegration machen.

## Klare Empfehlung

Ich würde OLIVA als **vollständige, ruhig kuratierte Bibelentdeckungsbibliothek** entwickeln: alle originalen Leseeinheiten, Fragen und Reflexionsimpulse zuverlässig zugänglich; ein gemeinsamer hervorragender Reader; persönliche Antworten sauber bewahrt; ausgewählte außergewöhnliche Illustrationen statt einer beliebigen Bildermasse. Für den persönlichen Nachfolger bleiben Originalidentität, Wiederaufnahme und Offline-Nutzung entscheidend. Für andere Menschen kommen klarer Einstieg, verständliche Einordnung, barrierearme Bedienung und konsequente Bild-/Inhaltsqualität hinzu. Das ist ein gemeinsames Produkt mit einer tragfähigen Inhaltsbasis, keine getrennte private und öffentliche App.
