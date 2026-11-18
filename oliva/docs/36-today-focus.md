# Heute · eine kleine, gezielte Verbesserung

Auftrag vom 18.11.2026 nach dem Ruhe-UX-Audit: zuerst den 0.18-Abschluss prüfen, danach ausschließlich Heute verbessern. Diese Freigabe gilt nicht als Freigabe einer Neugestaltung der anderen vier Hauptbereiche.

## Releaseprüfung vor der Änderung

0.18.0 ist unverändert unter dem bestehenden Tag gesichert und privat ausgeliefert. Der historische CI-Lauf 44124684188 bleibt erfolgreich. Alle 344 Runtime-Dateien und 34 geschützten Remote-Referenzen wurden vor der Änderung erneut gegen den gespeicherten Stand geprüft. Es fehlen keine Quell-/Versions-/Bereitstellungsnachweise dieses Releases.

Der neuere Audit-Lauf 44252369532 bleibt wegen GHSA-fc5q-39xc-vjpf für picomatch rot. Die Registry meldet weiterhin 4.0.7 als neueste Version. Die technische Prüfung ändert weder historische Tags noch die Sicherheitsbewertung zu „behoben“. Rechte-/Gerätefreigaben und der bekannte Hosting-Fallback bleiben getrennte Einschränkungen; keine Gesamtabnahme wird erfunden.

Ausgangscommit: `0d997e2b0905e40a56eb9b796b900215cd175175`. Wiederherstellungspunkt: `oliva-pre-today-focus-20261118`. Eigener Branch: `feature/oliva-today-focus-20261118`. Nachweise: `docs/evidence/today-focus/release-status.json` und `baseline-checkpoint.json`.

## Kurze UX-Analyse vor der Umsetzung

Die ursprüngliche Startseite wiederholt den Einstieg als kleine Begrüßung, abstrakten Seitentitel, Untertitel, Hero-Label, große zweite Überschrift und weitere Einführung. Auf Smartphones folgt eine starre 354 px-Bildfläche. Die eigentliche Aktion steht damit relativ spät, während die Landschaft viel Raum beansprucht. Die feste Höhe ist bei vergrößertem Text außerdem problematisch. Ein aktiver Weg erhält zusätzlich eine gleich stark gestaltete Schaltfläche.

Die kleine Änderung konzentriert sich auf den oberen Lesebereich: eine lesbare persönliche Begrüßung, die tatsächliche zuletzt gelesene Stelle bzw. der bestehende Anfängerzugang, eine Hauptaktion und eine flexibel hohe vorhandene Landschaft. Wiederholte Einleitungen entfallen. Weitere Angebote und ihre Ziele bleiben vorhanden; die aktive Wegaktion wird optisch nachgeordnet. Kein neuer Bibel-/Andachtstext und keine neue Wachstums- oder Speicherlogik.

Vorher-/Nachher-Aufnahmen werden aus dem tatsächlichen Produktions-Webbuild erzeugt, mit derselben festen Prüfuhrzeit, denselben synthetischen Profilen, Bilddateien, Themen und Viewportmaßen:320 × 568, 375 × 812 und 390 × 844 CSS-Pixel. Es sind lokale Chromium-Aufnahmen, keine echten Telefon- oder Simulatorprüfungen. Ein Nachher-Bild wird erst nach realer Umsetzung erzeugt.

## Tatsächlich umgesetzt

Nur `app/index.tsx` wurde im Anwendungscode verändert. Die Begrüßung ist jetzt die erste lesbare Überschrift. Wiederkehrende Personen sehen im vorhandenen Landschaftsbereich die tatsächliche Lesestelle und gegebenenfalls den gespeicherten Vers. Für den ersten Einstieg bleibt die vorhandene Geschichte aus Markus 4 erhalten. Die Hauptaktion und alle Navigation-/Speicherhandler sind unverändert.

Die Bildfläche besitzt eine Mindesthöhe und wächst mit dem Text, statt ihn in eine starre Höhe zu pressen. Die Herkunftsbeschriftung fließt mit. Der aktive Weg verwendet einen zurückhaltenderen Button. Die Wege-Überschrift und die Tagesvers-Zeile brechen bei großer Schrift um. Diese Anpassungen betreffen ausschließlich Heute; gemeinsame Komponenten und die anderen vier Hauptbereiche wurden nicht verändert. Alle bisherigen Heute-Aktionen sind in den zwölf Vergleichszuständen weiterhin vorhanden.

## Vergleich und tatsächliche Tests

| Breite / Höhe | Leseaktion vorher, Abstand zum Inhaltsanfang | Leseaktion nachher | Nachher vollständig im ersten sichtbaren Bereich |
|---|---:|---:|---|
| 320 × 568 | 421 px | 209 px | ja |
| 375 × 812 | 388 px | 209 px | ja |
| 390 × 844 | 388 px | 209 px | ja |

Die Maße beziehen sich auf das fiktive Profil Mara mit Lesestelle Markus 4,35–41 / Vers 38 und derselben festen Prüfuhrzeit. Die vollständigen zwölf Vorher-/Nachher-Zustände enthalten außerdem leere Profile und Dunkelmodus. Alle Bilder warten auf dieselben geladenen Schriften, das Originalbild und denselben Offline-Bereitschaftszustand. Sechs zusätzliche CSS-200%-Textzustände zeigen nachher keinen horizontalen Inhaltsüberlauf. Das ist keine echte Systemschriftprüfung.

343/343 Fachtests, Typecheck, sieben Inhaltsprüfungen, Produktions-Webbuild und der Ein-Schwert-Runtimecheck sind bestanden. 33 bestehende Browserfälle und die sechs neuen Heute-Fälle sind qualifiziert. Die ersten 39 Fälle endeten 38/39, weil der Testhelfer im zweiten Thema denselben Namen noch einmal speichern wollte; die App deaktiviert diesen unnötigen Speichervorgang korrekt. Zusätzlich beanstandete TypeScript die nicht als Tupel deklarierte Viewportliste. Die Korrektur betrifft ausschließlich den Testhelfer. Die sechs neuen Fälle bestehen anschließend vollständig; die 33 übrigen Fälle wurden auf exakt demselben Runtimebuild bereits bestanden. Es wird kein einzelner grüner 39/39-Lauf behauptet. Ursprüngliche Fehlerberichte bleiben unter `first-checks/` erhalten.

Die Browserfälle prüfen Gastzugang, echtes Weiterlesen zu Vers 38, vorhandene Angebote, Rohdatenerhalt, sechs Axe-Ansichten bei den drei gewünschten Breiten, reduzierte Bewegung, Offline-Neustart und einen echten Bildladefehler. Keine iPhone-/Android-/Simulator-/VoiceOver-/TalkBack-Prüfung wird als bestanden ausgegeben.

Der echte lokale PWA-Wechsel vom bisherigen privaten 0.18-Host `oliva-5d647075614ace83` zum Heute-Core `oliva-d3cab1587b25292b` besteht. Alle vier Rohdatensätze bleiben durchgehend exakt, einschließlich Originalquellen, Entwürfen, Historie und Studienantworten. Backupdownload und Restorevorschau ohne Anwendung sowie sieben A 51-Stadien bleiben geprüft. AppData V11, Dokument 1, SQLite 3 und IndexedDB 1 bleiben unverändert. Details: `upgrade/offline-upgrade.json`.

## Grenzen und Lieferstatus

Der bekannte npm-Audit bleibt rot: eine picomatch-Advisory, 33 abgeleitete Produktions- bzw. 35 Meldungen mit Entwicklungsabhängigkeiten. Der alte Release-Tag und seine erfolgreiche historische CI werden nicht überschrieben. Kein neuer formaler Release oder erfundene Versionsnummer. Die Änderung ist ein eigener Heute-Arbeitsstand auf 0.18-Basis.

Die private Bereitstellung und die endgültigen GitHub-Kennungen werden erst nach tatsächlicher Ausführung dokumentiert. Es gibt keine öffentliche Website-/Storeveröffentlichung. Original-FaithPath, GitHub-main, andere Hauptbereiche, Quelldateien der Bilder und bestehende persönliche Daten bleiben geschützt. Die Zustimmung „A“ bestätigt die Richtung; der aktuelle Auftrag bleibt ausdrücklich auf Heute begrenzt.

## Heute ist privat bereitgestellt · 18.11.2026

Die kleine Heute-Verbesserung ist umgesetzt, lokal geprüft und seit 18.11.2026, 07:27:56 UTC eigentümerprivat bereitgestellt. [Heute öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/) · [Echte Vorher-/Nachher-Vergleiche](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/today-focus/index.svg).

Der aktuelle Auftrag ist damit für Heute umgesetzt. Die Antwort „A“ bestätigt die Richtung; andere Hauptbereiche wurden in diesem Auftrag nicht verändert. Der Gesamt-Master bleibt offen. Keine öffentliche Website-/Storefreigabe und kein neuer formaler Release: Arbeitsstand auf 0.18-Basis, historischer Tag `oliva-v0.18.0` unverändert.

Genau eine Anwendungsdatei geändert: `app/index.tsx`. Klarer Gruß, konkrete Lesestelle, flexibler vorhandener Landschaftsbereich, gleiche Hauptaktion, nachgeordnete Wegaktion und lokaler Textumbruch. Keine neuen geistlichen Inhalte, Bilder, Abhängigkeiten, gespeicherten Felder oder Migrationen. Alle bisherigen Heute-Aktionen bleiben zugänglich. Auf 320 px liegt die Leseaktion im fiktiven Rückkehrprofil 212 px früher und vollständig im ersten sichtbaren Inhaltsbereich.

Lokal bestanden:343 Fachtests, finaler Typecheck, sieben Inhaltsprüfungen, Web-/PWA-Produktionsbuild, Runtimecheck,33 bestehende Browserfälle und sechs neue Heute-Fälle. Es handelt sich um zwei qualifizierte Läufe, keinen einzelnen vollen 39/39-Lauf. Erster Testlauf 38/39 und erster Test-Typecheck bleiben erhalten; nur der Testhelfer wurde korrigiert. Zwölf Vorher- und zwölf Nachher-Zustände sowie sechs zusätzliche CSS-200%-Textzustände sind dokumentiert. PWA-Wechsel vom bisherigen privaten 0.18 Host zum Heute-Core erhält alle vier V11-Rohdatensätze durchgehend exakt. Kein physischer Geräte-/Simulator-/VoiceOver-/TalkBack-Erfolg behauptet.

Die unabhängige neue GitHub-CI 44258694702/Job 134646487223 bleibt **rot**: dieselbe bekannte picomatch-Advisory stoppt `npm audit --audit-level=moderate` vor den weiteren CI-Prüfungen.35 Gesamtpaketmeldungen,33 Produktionsmeldungen, eine unabhängige Advisory GHSA-fc5q-39xc-vjpf. Registrylatest weiterhin 4.0.7; kein Force-Fix/Downgrade und keine angebliche Sicherheitsfreigabe. Historische 0.18-CI weiterhin gesondert erfolgreich.

Quellcheckpoint `caabaa52ea44f32967334f6d10cdc7c7e4928027`, GitHub `7ec52117522e70baae71cf8ef0e98be47d28984b`, Featurebranch `feature/oliva-today-focus-20261118`. Alle 32 Versionsrefs, geschützten Bestandsbranches und 47 Nicht-OLIVA-Root-Einträge unverändert bestätigt. Runtime 344 Dateien/SHA-256 `787e5140f59b60fe20467cacee284f03edcb0301cafa3b9c5b07231e2c530e81`; davon nurHeute geändert. Kern `oliva-d3cab1587b25292b`, privater Host `oliva-827cac01214b7955`; unterschiedliche Exporte mit geprüfter URI-Umsetzung, keine Byteidentität behauptet.

Private Plattformquelle `7aede5585eae66a994a8cf606c996d13a98be8b0`, Deployment `appgdep_6afd536ac8e08191a1f5ab72e2ac50e4`, Siteversion `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_e7b3d6043d4c819187efa309818320a9`. Owner/custom/Revision 1, ein Nutzer, keine Gruppen oder externen Besucher. HTTP bestätigt 225 Dateien bytegenau und 14 Routen; anonyme Zugriffe auf App, Review und Worker gesperrt. Drei Assetabrufe benötigten je eine Wiederholung, weil zunächst die 2381 Byte-App-HTML statt des JS/PNG zurückkam. Jeder Versuch protokolliert; Hostingursache bleibt offen. Keine gehostete Browser-QA mangels unterstütztem CUA.

Alle 193 Dateien des vorherigen privaten Hosts bytegenau unter `/workspace/oliva-v018-private-host-before-today` erhalten. Qualifizierter neuer Core mit 104 Dateien durch Umbenennung nach `/workspace/oliva-today-focus-control-dist` unverändert eingefroren. Zum lokalen Start entweder `npm run build` und `npm run preview` oder den eingefrorenen Export mit `PORT=4173 node scripts/serve.mjs /workspace/oliva-today-focus-control-dist` aus dem Appcheckout bedienen. Keine Originale oder Quellarchive gelöscht; nur regenerierbare Caches bereinigt.

Bericht `docs/36-today-focus.md`, vollständige Belege `docs/evidence/today-focus/`. Abschließende Lieferung auf eigenem Docsbranch `docs/oliva-today-focus-delivery-20261118` sichern; tatsächliche Abschlusskennungen aus `/workspace/oliva-today-focus-delivery.json` übernehmen, sobald vorhanden. Keine erneute Websitebereitstellung für Dokumentation, kein Retagging. Nach Abschluss keine anderen Hauptbereiche automatisch ändern, solange der aktuelle Heute-only-Auftrag gilt. Keine subagents; Git/GH-Traces entfernen; keine Credentials in Dateien/Logs. Vor finaler Sicherung tatsächliche verfügbare Token scannen und anschließend aus Sitzungsspeicher entfernen.

### Direkte Vergleichsbilder

| Breite | Vorher | Nachher |
|---|---|---|
| 320 px | [Öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/today-focus/images/before-320-light-returning.png) | [Öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/today-focus/images/after-320-light-returning.png) |
| 375 px | [Öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/today-focus/images/before-375-light-returning.png) | [Öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/today-focus/images/after-375-light-returning.png) |
| 390 px | [Öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/today-focus/images/before-390-light-returning.png) | [Öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/today-focus/images/after-390-light-returning.png) |

Nächster kleiner Schritt: die neue Heute-Seite mit dem eigenen Profil auf einem echten Smartphone ansehen und den Einstieg beurteilen. Tatsächliche Geräte-, Systemschrift- und Hilfstechnologietests bleiben offen. Die übrigen Bereiche sind nicht Teil dieser Umsetzung.
