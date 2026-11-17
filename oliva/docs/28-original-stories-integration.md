# Originalgeschichten in OLIVA · Integrationsvertrag 0.14.0

Die Gestaltung der drei Smartphone-Vorschauen ist vom Nutzer am 16.11.2026 mit „Gestaltung Vorschau akzeptiert und sieht gut aus“ freigegeben. Diese Lieferung überträgt den vollständigen geprüften Bestand in die echte Expo-/React-Native-App. Die separate Gestaltungsstudie bleibt als Referenz erhalten. Der ursprüngliche Master-Prompt bleibt offen; Original-FaithPath und GitHub-main werden nicht verändert.

## Originaldaten und Übertragung

Referenz ist der unveränderte Commit `a519ce898fa33907b07d5ac7a585595127556183` des FaithPath-Branches `feature/simplified-step-experience-20261104`. Vier Originaldateien sind unter `content/faithpath-stories/source/` deterministisch komprimiert archiviert: `faithpath-nachlese-story-flow.json`, `nachlese-stories.json`, `nachlese-questions.json`, `stories.json`. Provenienz, Originalhashes und Importbericht liegen daneben. `npm run content:stories` prüft die vollständigen generierten Dateien aus diesen Archiven, ohne Netzwerk oder Veränderung des Originals.

**436 Einheiten, 2.479 primäre Frageelemente, 436 Reflexionsimpulse und 95 zusätzliche Quellenvarianten** bleiben erhalten. Der Katalog umfasst alle 66 Bücher, darunter Psalmen und Briefabschnitte. Er enthält keine 436 ausgeschriebenen Nacherzählungen; solche Texte werden nicht vorgetäuscht oder neu erfunden. 174 Fragen besitzen einen originalen Zusatzhinweis; bei den übrigen 2.305 wird keiner ergänzt.

Die 95 Aliaspaare werden als zwei nachvollziehbare Originalfassungen bewahrt. Ihre Reihenfolge der Antwortoptionen unterscheidet sich; bei vier Paaren unterscheiden sich auch Formulierungen. Die tatsächlichen Antworten werden ausschließlich gegen die angezeigte primäre Fassung gespeichert. Keine pauschale Übertragung von Antwortindizes. Historisches FaithPath-`quiz.done` wird nicht als neue Geschichtenantwort oder als Abschluss ausgegeben. Der separate bereits integrierte NT-Finalmaster mit 1.300 Fragen bleibt eigenständig.

Die zusätzlichen 165 FP-Fragen haben textuelle Apostelgeschichte-/Johannes-/Matthäusstellen. Der Import löst ihre tatsächlichen einfachen Kapitel-/Versangaben strikt auf und prüft jeden Vers im lokalen Luther-1912-Korpus. Quellenbeschriftung und Frageinhalt bleiben unverändert. Die Einheit `FP-STORY-0391` bleibt mit ihrer ursprünglichen Quellenposition erhalten und erscheint in der Bibliothek bei Apostelgeschichte 11. Judas `NS-0420` besitzt **zwei getrennte Referenzen: 1,1–4 und 1,17–25**. Die Lücke wird weder angezeigt noch als gelesen bestätigt.

## Oberfläche und Bedienung

`/geschichten` bietet eine virtualisierte Bibliothek in Bibelreihenfolge. Die Suche findet Titel und Stellen auch mit zusätzlichen Leerzeichen. Standard ist „Gesamte Bibel“; NT/AT, Bilder, Psalmen/Briefe und ein optionaler Buchfilter sind verfügbar. Eine echte gespeicherte Position bietet „Abschnitt fortsetzen“. Das reine Öffnen oder Suchen schreibt keinen persönlichen Datensatz.

`/geschichte/[id]` verwendet Lesen → Verstehen → Gedanken mit einem freiwilligen ruhigen Abschluss. „Im Bibeltext lesen“ öffnet den gemeinsamen Reader innerhalb der App; Zurück führt zum Abschnitt. Getrennte Referenzen besitzen getrennte Leseaktionen. Die bereits abgenommene direkte Versauswahl samt Notizen, Kopieren und Markierungen bleibt im Reader unverändert aktiv.

Fragen werden erst bei Bedarf geladen. Alle tatsächlichen Fragen einer Einheit sind erreichbar, einschließlich der längsten Einheit mit 31 Fragen. Eine Auswahl wird erst mit „Antwort ansehen“ dauerhaft gespeichert. Falsche Antworten dürfen bleiben oder geändert werden. Überspringen ist erlaubt und zählt als angesehene Frage, nicht als Antwort. Fragen, Rückmeldung, originaler Zusatzhinweis und der zitierte Luther-Bibeltext sind sichtbar getrennt. Tastaturfokus und native Ankündigung führen zur neuen Frage.

Gedanken verwenden den bestehenden privaten Capture-Editor, seine automatische Entwurfssicherung, Sammlung, Bearbeitung und vorhandene Konflikt-/Lösch-/Rückholregeln. Die ursprüngliche Frage, Titel, Quellkennung, Inhaltsfingerabdruck und sämtliche Referenzen bleiben im Eintrag erhalten. Bei zwei Referenzen wird kein künstlicher zusammenhängender Einzelbereich erfunden. Ein Entwurfslink wird anhand Identität, Quelle und erwartetem Stand geprüft, bevor ein Editor erscheint. Ein fremder oder gefälschter Link zeigt keine fremden Worte.

## Bildstrategie und OLIVA-Identität

Sechs vorhandene Motive werden passend eingesetzt: Noahs Taube, Abrahams Verheißung, Davids Vorbereitung, Jesu Geburt, der Sturm und der Ostermorgen. Engere Bildmomente innerhalb einer größeren Einheit werden benannt. Andere Abschnitte erhalten typografische Karten mit einem echten ersten Vers, Buch und Quellenangabe. Keine neuen Bilder oder Nacherzählungen wurden hierfür generiert. Originalbilder, ruhige Creme-/Oliv-/Goldpalette und lokale Cormorant-/DM-Sans-Schriften bleiben erhalten. Alle Bilder kennzeichnen künstlerische Interpretation und offene Fachfreigabe.

Baum und Buchschwerter bleiben gemeinsame persönliche Elemente. Antworten, Überspringen, Navigation und Bildvorschau verändern weder bestätigtes Lesen noch den Baum. Ein freiwillig gespeicherter eigener Gedanke folgt den bestehenden Reflexionsregeln. Keine Rangliste, Streak oder Aussage über den Wert des Glaubens.

## Datenvertrag und Offline-Betrieb

AppData **V10** ergänzt ausschließlich `storyStudy` und die eigene Story-Capturequelle. Der ausgelieferte V9-Vertrag einschließlich Capture-/Draft-Graph ist eingefroren; V1–V8 bleiben ebenfalls strikt. V9 wird beim Lesen nur im Arbeitsspeicher erweitert. Erst eine ausdrückliche erfolgreiche Schreibaktion speichert den neuen Stand. SQLite-Schema 3, IndexedDB 1 und privates Dokumentformat 1 bleiben erhalten; alte Dokumente werden über ihren eigenen Vertrag gelesen.

Antworten bewahren die vollständige angezeigte Originalfassung mit Hash, Auswahl, Originaldatum und Revision. Veränderungen verwenden einen erwarteten Antwortstand und den bestehenden atomaren Speicherschutz. Bei einem Zwei-Fenster-Konflikt bleibt die lokale Auswahl sichtbar, bis der Nutzer den aktuellen gespeicherten Stand ausdrücklich übernimmt. Speicherfehler ersetzen keinen zuvor gespeicherten Stand. Die Position wird vor dem Einreihen einer Schreibaktion kopiert.

Index, Originalfragen, Lutherkorpus, lokale Schriften und ausgelieferte Bildderivate werden im PWA-Paket offline verfügbar. Virtualisierung begrenzt gerenderte Karten; die vollständige Fragenbank wird erst bei einem Fragenaufruf in die Oberfläche geladen. Kein Nachladen von externen Inhaltsdiensten erforderlich. Komprimierte Originalarchive und interne Bildmaster gehören zum Quellarchiv, nicht als eigene Laufzeitassets in das PWA-Paket.

## Überprüfbare Abnahme

| Kriterium | Nachweis |
|---|---|
| Alle Originaleinheiten, Fragen, Impulse und Varianten stimmen vollständig | `content:stories`, Importbericht, Domänentests; native vollständige JSON-AST-Vergleiche |
| Bibliothek findet 436 / NT329 / AT107, zusätzliche Leerzeichen und Filter | echter Chromium-Fall, weniger als 80 gleichzeitig gerenderte Karten |
| Antworten, Überspringen, 31 Fragen und genaue Wiederaufnahme | Domänen-/Storetests und Chromium mit Neustart |
| Echte Reflexion samt Entwurfslink und unveränderter Quelle | Domänen-/Migrationstests und Chromium: Entwurf → Sammlung → Fortsetzen → Speichern → Bearbeiten |
| Zweifache Judasreferenz und Schutz fremder Entwürfe | kanonische Modelltests und echter interner Reader-/Rückweg |
| Konflikt ohne Verlust der lokalen Auswahl | atomare Storetests und zwei tatsächliche Browserfenster |
| Offline-Erstaufruf und Neustart | Service-Worker-Browsertest und realer 0.13.1→0.14.0-Wechsel im persistenten Profil |
| Hell/Dunkel, 320/390/1440 Pixel, Tastatur und WCAG-Automatik | echte Chromium-Ansichten; vor dem Navigieren persistierten Theme-Wechsel abwarten |
| Bestandsdaten bleiben erhalten | Updateprüfung: vier rohe V9-Records vor neuer Aktion exakt, alle alten Datenbereiche und drei Nicht-main-Records danach unverändert |

312 Fachtests, gezielte Geschichtenfälle, Typecheck, sechs Inhalts-/Provenienzprüfungen, Audit ohne Funde, native statische Exporte und der echte Updateversuch sind getrennt dokumentiert. Der vollständige 138/138-Fälle-Regressionstest ist erfolgreich. Das anschließend um die ausdrücklichen Inhaltsrechte ergänzte Paket ändert nur drei Hinweisdateien und die abgeleitete HTML-/Workerkennung; JavaScript, Bilder und Worker-Algorithmus bleiben bytegleich. Ein eigener PWA-Paketfall und der reale Updateversuch prüfen den endgültigen Paketbuild. Maßgeblich ist `evidence/stories-integration/validation-summary.json`; keine Zusammenzählung isolierter Erfolge.

## Grenzen und nächste Aufgaben

Native Exporte sind JavaScript-/Assetprüfungen, keine installierte App, kein Simulator und kein Gerätetest. VoiceOver/TalkBack, native Darstellung, Decoder, Energie-/Speichermessungen sowie signierte Builds bleiben offen. Die gehostete Sites-Fassung wird separat über Paket-/HTTP-/Zugriffskontrollen geprüft; das unterstützte CUA-Werkzeug ist dort nicht verfügbar. Lokale Expo-Chromiumtests ersetzen diese gehostete Browserprüfung nicht.

Rechteketten, allgemeiner öffentlicher Vertrieb und unabhängige theologische/historische Fachabnahme bleiben offen. Die private Projektübernahme und die beauftragte GitHub-Quellensicherung sind keine allgemeine Inhaltslizenz. Audio, Live-KI, Cloud-Konten/-Sync sowie weitere Themen-/Ast-/Historienparität bleiben Master-Aufgaben. Für Folgearbeiten werden hier keine neuen Versionsnummern oder Termine zugesagt.
