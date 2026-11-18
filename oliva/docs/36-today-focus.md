# Heute · eine kleine, gezielte Verbesserung

Auftrag vom 18.11.2026 nach dem Ruhe-UX-Audit: zuerst den 0.18-Abschluss prüfen, danach ausschließlich Heute verbessern. Diese Freigabe gilt nicht als Freigabe einer Neugestaltung der anderen vier Hauptbereiche.

## Releaseprüfung vor der Änderung

0.18.0 ist unverändert unter dem bestehenden Tag gesichert und privat ausgeliefert. Der historische CI-Lauf 44124684188 bleibt erfolgreich. Alle 344 Runtime-Dateien und 34 geschützten Remote-Referenzen wurden vor der Änderung erneut gegen den gespeicherten Stand geprüft. Es fehlen keine Quell-/Versions-/Bereitstellungsnachweise dieses Releases.

Der neuere Audit-Lauf 44252369532 bleibt wegen GHSA-fc5q-39xc-vjpf für picomatch rot. Die Registry meldet weiterhin 4.0.7 als neueste Version. Die technische Prüfung ändert weder historische Tags noch die Sicherheitsbewertung zu „behoben“. Rechte-/Gerätefreigaben und der bekannte Hosting-Fallback bleiben getrennte Einschränkungen; keine Gesamtabnahme wird erfunden.

Ausgangscommit: `0d997e2b0905e40a56eb9b796b900215cd175175`. Wiederherstellungspunkt: `oliva-pre-today-focus-20261118`. Eigener Branch: `feature/oliva-today-focus-20261118`. Nachweise: `docs/evidence/today-focus/release-status.json` und `baseline-checkpoint.json`.

## Kurze UX-Analyse vor der Umsetzung

Die ursprüngliche Startseite wiederholt den Einstieg als kleine Begrüßung, abstrakten Seitentitel, Untertitel, Hero-Label, große zweite Überschrift und weitere Einführung. Auf Smartphones folgt eine starre 354px-Bildfläche. Die eigentliche Aktion steht damit relativ spät, während die Landschaft viel Raum beansprucht. Die feste Höhe ist bei vergrößertem Text außerdem problematisch. Ein aktiver Weg erhält zusätzlich eine gleich stark gestaltete Schaltfläche.

Die kleine Änderung konzentriert sich auf den oberen Lesebereich: eine lesbare persönliche Begrüßung, die tatsächliche zuletzt gelesene Stelle bzw. der bestehende Anfängerzugang, eine Hauptaktion und eine flexibel hohe vorhandene Landschaft. Wiederholte Einleitungen entfallen. Weitere Angebote und ihre Ziele bleiben vorhanden; die aktive Wegaktion wird optisch nachgeordnet. Kein neuer Bibel-/Andachtstext und keine neue Wachstums- oder Speicherlogik.

Vorher-/Nachher-Aufnahmen werden aus dem tatsächlichen Produktions-Webbuild erzeugt, mit derselben festen Prüfuhrzeit, denselben synthetischen Profilen, Bilddateien, Themen und Viewportmaßen:320 × 568, 375 × 812 und 390 × 844 CSS-Pixel. Es sind lokale Chromium-Aufnahmen, keine echten Telefon- oder Simulatorprüfungen. Ein Nachher-Bild wird erst nach realer Umsetzung erzeugt.

## Tatsächlich umgesetzt

Nur `app/index.tsx` wurde im Anwendungscode verändert. Die Begrüßung ist jetzt die erste lesbare Überschrift. Wiederkehrende Personen sehen im vorhandenen Landschaftsbereich die tatsächliche Lesestelle und gegebenenfalls den gespeicherten Vers. Für den ersten Einstieg bleibt die vorhandene Geschichte aus Markus 4 erhalten. Die Hauptaktion und alle Navigation-/Speicherhandler sind unverändert.

Die Bildfläche besitzt eine Mindesthöhe und wächst mit dem Text, statt ihn in eine starre Höhe zu pressen. Die Herkunftsbeschriftung fließt mit. Der aktive Weg verwendet einen zurückhaltenderen Button. Die Wege-Überschrift und die Tagesvers-Zeile brechen bei großer Schrift um. Diese Anpassungen betreffen ausschließlich Heute; gemeinsame Komponenten und die anderen vier Hauptbereiche wurden nicht verändert. Alle bisherigen Heute-Aktionen sind in den zwölf Vergleichszuständen weiterhin vorhanden.

## Vergleich und tatsächliche Tests

| Breite / Höhe | Leseaktion vorher, Abstand zum Inhaltsanfang | Leseaktion nachher | Nachher vollständig im ersten sichtbaren Bereich |
|---|---:|---:|---|
| 320 × 568 | 421px | 209px | ja |
| 375 × 812 | 388px | 209px | ja |
| 390 × 844 | 388px | 209px | ja |

Die Maße beziehen sich auf das fiktive Profil Mara mit Lesestelle Markus 4,35–41 / Vers 38 und derselben festen Prüfuhrzeit. Die vollständigen zwölf Vorher-/Nachher-Zustände enthalten außerdem leere Profile und Dunkelmodus. Alle Bilder warten auf dieselben geladenen Schriften, das Originalbild und denselben Offline-Bereitschaftszustand. Sechs zusätzliche CSS-200%-Textzustände zeigen nachher keinen horizontalen Inhaltsüberlauf. Das ist keine echte Systemschriftprüfung.

343/343 Fachtests, Typecheck, sieben Inhaltsprüfungen, Produktions-Webbuild und der Ein-Schwert-Runtimecheck sind bestanden. 33 bestehende Browserfälle und die sechs neuen Heute-Fälle sind qualifiziert. Die ersten 39 Fälle endeten 38/39, weil der Testhelfer im zweiten Thema denselben Namen noch einmal speichern wollte; die App deaktiviert diesen unnötigen Speichervorgang korrekt. Zusätzlich beanstandete TypeScript die nicht als Tupel deklarierte Viewportliste. Die Korrektur betrifft ausschließlich den Testhelfer. Die sechs neuen Fälle bestehen anschließend vollständig; die 33 übrigen Fälle wurden auf exakt demselben Runtimebuild bereits bestanden. Es wird kein einzelner grüner 39/39-Lauf behauptet. Ursprüngliche Fehlerberichte bleiben unter `first-checks/` erhalten.

Die Browserfälle prüfen Gastzugang, echtes Weiterlesen zu Vers 38, vorhandene Angebote, Rohdatenerhalt, sechs Axe-Ansichten bei den drei gewünschten Breiten, reduzierte Bewegung, Offline-Neustart und einen echten Bildladefehler. Keine iPhone-/Android-/Simulator-/VoiceOver-/TalkBack-Prüfung wird als bestanden ausgegeben.

Der echte lokale PWA-Wechsel vom bisherigen privaten 0.18-Host `oliva-5d647075614ace83` zum Heute-Core `oliva-d3cab1587b25292b` besteht. Alle vier Rohdatensätze bleiben durchgehend exakt, einschließlich Originalquellen, Entwürfen, Historie und Studienantworten. Backupdownload und Restorevorschau ohne Anwendung sowie sieben A51-Stadien bleiben geprüft. AppData V11, Dokument1, SQLite3 und IndexedDB1 bleiben unverändert. Details: `upgrade/offline-upgrade.json`.

## Grenzen und Lieferstatus

Der bekannte npm-Audit bleibt rot: eine picomatch-Advisory, 33 abgeleitete Produktions- bzw. 35 Meldungen mit Entwicklungsabhängigkeiten. Der alte Release-Tag und seine erfolgreiche historische CI werden nicht überschrieben. Kein neuer formaler Release oder erfundene Versionsnummer. Die Änderung ist ein eigener Heute-Arbeitsstand auf 0.18-Basis.

Die private Bereitstellung und die endgültigen GitHub-Kennungen werden erst nach tatsächlicher Ausführung dokumentiert. Es gibt keine öffentliche Website-/Storeveröffentlichung. Original-FaithPath, GitHub-main, andere Hauptbereiche, Quelldateien der Bilder und bestehende persönliche Daten bleiben geschützt. Die Zustimmung „A“ bestätigt die Richtung; der aktuelle Auftrag bleibt ausdrücklich auf Heute begrenzt.
