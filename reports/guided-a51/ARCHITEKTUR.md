# Guided Steps und A5.1 – Integrationsarchitektur

App-Basis: `ef8d96d7126fb79661467feaaa17044874471d4d` (First Seed). Baumquelle: `0e02d5329a87cdcdfc52694d74c610da2975b357` (A5.1). Kein pauschaler Merge. AT-Branch nur als Referenz geprüft, keine Inhalte übernommen.

## Eingaben und Vorschläge

`src/step-suggestions.js` ist der zentrale lokale Katalog. Die 18 Themen-IDs und ihre 17 vorhandenen Kategorien werden aus `content.js` verwendet. Kategorien ohne eigenes Lebensthema haben eigene kuratierte Einträge. Es gibt keine Textanalyse. Alle Themen bieten klein / konkret / reflektierend; bereits wortgleich verwendete Anregungen werden durch kuratierte Alternativen ersetzt, soweit vorhanden. Danach stehen weitere Themen und freie Eingabe offen. Keine automatischen Aufgaben.

`src/step-help.js` rendert dieselbe Hilfe in First Seed, neuen Wegen und bestehender Schrittverwaltung. Auswahl erzeugt nur eine bearbeitbare Anregung. Übernahme in ein gefülltes Eingabefeld braucht eine zusätzliche ausdrückliche Bestätigung; Anhängen und Verwerfen sind getrennt. „Kleiner machen“ verwendet einen passenden kuratierten Text, analysiert keine privaten Worte und ersetzt sie nicht.

Der bestehende einzelne Entwurf enthält optional `values.stepCandidate` und in Formularen `values.guidedTopic`. Das ist **keine Änderung von Schema V5**, kein neuer Speicher-Key und keine Migration. Alte Entwürfe ohne diese Felder bleiben gültig. Die Anregung wird im Entwurf zwischengesichert, aber nicht als persönlicher Schritt in V5 übernommen. Nur der bewusst übernommene und beim Speichern bestätigte Schritt wird gespeichert. Bestehende Draft-CAS- und Journaltransaktionen bleiben verantwortlich. Der First-Seed-Ablauf behält seine sechs bisherigen Szenen und deren Nummerierung: Die Auswahl, Bearbeitung und bewusste Übernahme erfolgen zusammen in Szene „Ein kleiner Schritt“, die Gesamtprüfung danach. So behalten vorhandene pausierte Entwürfe ihre richtige Szene; die Ankommensszene und der direkte Bibelzugang bleiben erhalten.

Rückblicke verwenden dieselben Statuswerte `thought`, `changed`, `working`, `unchanged`, `notnow`, denselben Text und dieselbe Rückblickhistorie. „Noch nicht sicher“ ist ein bewusst gespeicherter `thought`; ohne Freitext wird die gewählte Unsicherheit als Text festgehalten. Nur `changed` **und** die gesetzte Entwicklungsbestätigung erzeugen einen Meilenstein. Die vier Reflexionsfragen werden nicht als künstliche Antworten gespeichert. „Deinen bisherigen Weg wiederfinden“ zeigt ausschließlich vorhandenen Anlass, ersten gespeicherten Schritt und letzten gespeicherten Rückblick; die bisherigen Journalverbindungen und die Geschichte bleiben maßgeblich.

## Ein Baumadapter

`olive-tree.js` rendert einen lokal benannten Platzhalter mit statischem Bild. `olive-adapter.js` verwaltet je tatsächlichem Kontext genau eine A5.1-Szene. Gleiche Kontexte werden beim App-Neurendern wiederverwendet; `setStage` ermöglicht die originale 680-ms-Überblendung. Nicht mehr vorhandene Kontexte werden entsorgt. Dialoge deaktivieren dahinterliegende Szenen. Der bisherige CSS-Lebenszyklus findet nur noch die kurze symbolische Pflanzsequenz; er animiert den A5.1-Baum nicht.

`src/olive-a51/` übernimmt die geprüfte Runtime: sechs örtliche Windfelder, 30/24/18-fps-Qualitätsregelung, Sichtbarkeit, Vordergrund, Reduced Motion, ruhender Fallback, kontrollierter Bildladeabbruch und Ressourcenabbau. Die 21 originalen responsiven WebPs werden per Hash geprüft. Historische A5-Mathematik ist wegen der Originalmodul-Verträge mit enthalten, wird im App-Adapter aber nie als Profil gewählt; es existiert nur ein Renderer und eine aktive Winduhr je sichtbarem Kontext. Quellillustrationen, Galerie, Videos und PDF werden nicht in den App-Cache übernommen. Bei vollständigem Bildausfall gibt es eine sichtbare Meldung und „Baumbild erneut laden“.

Domain-Funktionen bestimmen weiter die sieben Stufen mit Schwellen 0, 1, 2, 3–4, 5–6, 7–9, ab 10 bestätigten Entwicklungen. Vorschläge, Quiz, Lesen und Schrittabschluss schreiben keine Entwicklung.

## Build und Daten

Der vorhandene Build kopiert `src` in eine eindeutige Release-URL; die neuen Runtimebilder werden dadurch vollständig offline mitgeliefert. Der gesamte Runtime-Bildsatz umfasst 4.795.470 Bytes. Die vorhandene atomare Service-Worker-Installation und ausdrückliche Aktivierung bleiben unverändert. Daten-, Bibel- und NT-Dateien bleiben bytegleich. Die historische getrackte `dist/`-Lieferung bleibt im Git-Commit unberührt; der neue QA-Build wird separat erzeugt.

## Wartung und bekannte Grenzen

Katalogänderungen brauchen redaktionelle Prüfung für alle betroffenen Themen, insbesondere Grenzen, Sicherheit und Freiheit bei Trauer, Gewalt, Schuld und Vergebung. Keine neuen Bibelzitate in Vorschlagsdaten erfinden. Vorhandene Kontexttexte bleiben als redaktionelle Einordnung beschriftet.

Bei Änderungen an der Baumruntime: Hashes, alle Stufen, Bildfehler, Sichtbarkeit, Dialogpause, Reduced Motion, Wiederaufnahme und Ressourcenfreigabe prüfen. Bei Draftänderungen: alte Entwürfe, Quota, Tabkonflikte, Pause/Resume und bewusste Übernahme testen. Bei Releases: neue BUILD-ID, atomare Offlineinstallation, fehlgeschlagenes Update, tatsächliche Aktivierung und Backup-Restore prüfen.

Lokale Daten sind weiterhin **unverschlüsselt** im Browser gespeichert. Zugriff auf das Browserprofil kann persönliche Texte offenlegen; Löschen von Website-Daten oder privates Browsen kann sie verlieren lassen. Es gibt keine Cloud-Sicherung, keine Synchronisierung und keine Wiederherstellungsgarantie ohne eigene Exportdatei. Diese Integration fügt keine Tracker oder Übertragung persönlicher Texte hinzu.

Echte Safari-/iPhone-/VoiceOver-, installierte PWA-, Temperatur- und Akkutests sowie der Zehn-Personen-Test bleiben offen. Chromium-Laborwerte sind kein Nachweis dafür.
