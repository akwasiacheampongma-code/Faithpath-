# Direkte Versauswahl · OLIVA 0.13.1

Die Rückmeldung zum umständlichen Auswahlmodus und die ausdrücklich gewünschte Bedienung „Verse direkt antippen und weitere Verse dazuwählen“ sind maßgeblich. Der Reader benötigt keinen separaten Auswahlmodus und keine Bestätigung „Auswahl verwenden“ mehr.

## Tatsächliche Bedienung

Ein Antippen wählt den Vers. Weitere Antipper wählen weitere Verse hinzu; erneutes Antippen entfernt genau diesen Vers. Eine kleine feste Leiste am unteren Rand bietet **Markieren, Kopieren, Notiz und Mehr**. Das Kreuz hebt die gesamte Auswahl auf. Die Leiste fügt keine Karte in den Bibeltext ein und verschiebt seine Zeilen nicht.

Markieren öffnet fünf Farben und eine echte Entfernen-Aktion. Kopieren verwendet den kanonischen Luther-1912-Text, die exakte Stellenangabe und LF-Zeilenumbrüche. Getrennte Verse lassen sich kopieren, markieren und merken, ohne die dazwischenliegenden Verse einzubeziehen. „Mehr“ enthält Merken, vorhandene Notizen und den Zugang zu einem eigenen Vorhaben. „Notiz“ öffnet ausschließlich den benötigten Editor und fokussiert das Textfeld.

Eine gemeinsame Notiz oder ein gemeinsames Vorhaben benötigt weiterhin benachbarte Verse: Die gespeicherte Quellenstruktur beschreibt einen zusammenhängenden Bereich. Bei einer Lücke erklärt die Leiste dies knapp; Kopieren und Markieren bleiben verwendbar. Es wird kein Zwischenvers stillschweigend hinzugefügt. Eine künftige Quelle mit mehreren getrennten Bereichen wäre eine eigene Datenmodellerweiterung und gehört nicht zu dieser Bedienkorrektur.

Der Zahlenwähler heißt jetzt **„Zu Vers springen“** und dient nur der Navigation. Ganze Kapitel, logische Teilabschnitte, Lesefokus, Fließtext/Einzelverse und ihre bestehenden Abschlüsse bleiben getrennt. Escape schließt zuerst das offene Fenster, dann die Auswahl; der Tastaturfokus kehrt zum zuletzt hinzugewählten Vers zurück.

## Daten und Architektur

`ReaderSelectionBar` ist die kompakte Oberfläche; `SelectionTools` rendert erst nach ausdrücklichem Aufruf den Notiz-, Mehr- oder manuellen Kopierdialog. Die Bibelrenderer erhalten dieselbe additive Auswahl. Schrift, Absätze und kanonischer Text werden nicht umgebaut.

Die Auswahlfunktionen prüfen vorhandene Versnummern, Duplikate und Referenzen. Neue Store-Aktionen schreiben eine komplette Markierungs- oder Merkliste atomar, nur für die ausdrücklich gewählten Verse und ohne zusätzliche Wachstumserfahrung. AppData bleibt **V9**, Privatdokument V1, IndexedDB V1 und SQLite-Schema V3. Keine neue Migration, keine automatische Fortschrittsaktion. Bestehende gesicherte und in der Sitzung gehaltene Entwürfe werden weiterhin über ihre exakte Quellenidentität aufgelöst.

## Nachweise und Grenzen

Die tatsächlichen Rohberichte stehen in `docs/evidence/direct-selection/`. Der erste Entwurf der neuen Oberflächenprüfung verwendete für jeden wieder geöffneten Bildschirm unzutreffend den festen Anker 35. Der Helfer prüft jetzt den kanonischen Buch-/Kapitelkontext; die separaten exakten Ankertests bleiben erhalten. Der erste vollständige Browserlauf enthielt zwei nicht erneut reproduzierte Darstellungs-Zeitüberschreitungen (Baum und hochauflösendes Römerbild) sowie einen alten Vorhaben-Testzugang. Ein separater Diagnose-Lauf bestand für die beiden unveränderten Bildprüfungen. Der Vorhaben-Test öffnet jetzt „Mehr“ und sucht die Zielreferenz ausschließlich im tatsächlich sichtbaren Hauptbereich; alle gespeicherten Referenzkriterien bleiben erhalten. Der ursprüngliche 127/130-Lauf und der Diagnosebericht bleiben erhalten. Der native Zusatzprüfer war zunächst nicht an den neuen Nachweisort kopiert; beide Exporte selbst waren erfolgreich. Dieser fehlgeschlagene Prüfaufruf bleibt erhalten. Ein anfänglich fest eingetragener Versionsname im statischen Prüfer wurde durch das tatsächliche Package-Versionfeld ersetzt; der frühere Bericht bleibt ebenfalls erhalten.

Fachtests, Browserfälle, echter Vorgänger-PWA-Wechsel und statische native Prüfungen sind getrennte Nachweise. Native JavaScript-/Assetexports beweisen keine Geräte-, Simulator-, VoiceOver-/TalkBack-, Decoder-, Speicher- oder Energieprüfung. Für das private Hosting ist mangels unterstütztem CUA-Werkzeug keine gehostete Browserprüfung möglich; lokale App-Prüfungen, Paket-/HTTP-Kontrollen und der Benutzerzugriff bleiben davon getrennt.

Die Original-FaithPath-Dateien und GitHub-main bleiben unverändert. Öffentliches Website-/Storedeployment ist nicht freigegeben. Die gesamte Master-Definition-of-Done bleibt offen.

## Nachfolgende Gestaltungsvorschauen

Der Nutzer hat das Geschichtenkonzept grundsätzlich freigegeben, verlangt aber vor der vollständigen Integration drei konkrete Smartphone-Ansichten: Bibliothek, illustrierte Originaleinheit mit Fragen/Reflexion und bildloser Psalm oder Brief. Vorhandene Bilder und OLIVA-Tokens sind maßgeblich; keine neuen Bilder. Alle 436 Originaleinheiten, 2.479 Frageelemente und 436 Reflexionsimpulse bleiben der freigegebene Zielbestand. Die vollständige Sammlung wird **erst nach einer weiteren ausdrücklichen Gestaltungsfreigabe** integriert. Die Freigabe dieser Vorschauen ist keine bereits erteilte Vollintegrationsfreigabe.

## Reader-Phase abgeschlossen

Die unabhängige Endabnahme für die ausgelieferte 0.13.1 ist erfolgreich: CI 43949849283 bestätigt 293/293 Fachtests und 130/130 Browserfälle im ersten Versuch. Alle vorhandenen App-Einstiege nutzen denselben Reader; keine zusätzliche eigenständige Readerintegration bleibt offen. [Endabnahme, Einstiege und Grenzen](27-reader-phase-closeout.md). Die native Geräteabnahme und andere Master-Aufgaben bleiben getrennt offen.
