# FaithPath – Produktionssicherung und Stabilisierung

Stand: 15. Oktober 2026. Grundlage: die beigefügte Datei
`FaithPath_Master_Audit_2026-10-15.zip`. Bericht und alle enthaltenen Belege wurden
ausgewertet; die 38 gelisteten Dateiprüfsummen und die ZIP-Integrität stimmen.

## Ergebnis und Entscheidung

**GO für die nächste Entwicklungsphase auf der gesicherten Grundlage.**
**NO-GO für eine kommerzielle Produktionsfreigabe vor dem Echtgeräte-Gate.**

Der vollständige ausgelieferte POLISH1-Stand ist rekonstruierbar und gesichert.
Die drei beauftragten Fehlerbereiche sind korrigiert und mit Regressionstests
abgedeckt. Der Stabilisierungskandidat wurde ausschließlich lokal geprüft.
Es gab keinen Merge nach main, keine Datenmigration auf Benutzergeräten und
keinen Netlify-Deploy. Der Produktionszeiger wurde abschließend erneut gelesen:
weiterhin `6ac4c83bfdb6fe46924d3b81` / `FP4-20261006-G-POLISH1`.

## Branches und Commits

| Zweck | Branch | Commit |
|---|---|---|
| Unveränderte rekonstruierte Produktionsbasis | backup/production-polish1-20261015 | aabfc725653bbb93dc02aba6d1da46c9dca1eb6c |
| Geprüfte Implementierung der Stabilisierung | fix/production-stabilization-20261015 | ded1c39a25242a859082b90caf23402ebb25625e |

Ein anschließender Dokumentationscommit enthält diesen Bericht und die
Prüfbelege. Er verändert keine Laufzeitdateien. Den aktuellen Branch-HEAD zeigt
`git log -1 fix/production-stabilization-20261015`.

## Phase 1: Rekonstruktion

Alle fünf zuvor vorhandenen GitHub-Branches wurden erneut gefetcht und gegen die
tatsächlich ausgelieferten Dateien verglichen. Die Branchstände entsprechen dem
Audit. `main` ist weiterhin der Transferstand `d3f0c01…`; `develop/v4` steht auf
`f02106e…`, Final Experience auf `54cf86f…`, der Baum-Branch auf `e38644e…` und
der separate Content-Branch auf `3a2eb18…`.

Die beiden UI-Featurebranches stimmen jeweils bei 307 Einträgen mit dem
Produktionsmanifest überein. Der sequenziell jüngere Baum-Branch dient als Basis.
`main` enthält keine entsprechende flache Anwendung. Der Content-Branch enthält
andere Fragentexte und nicht die späteren Produktions-UI-Erweiterungen.

Die Produktion wurde neu geladen und mit dem Auditmanifest verglichen:
316 öffentlich abrufbare Dateien stimmen vollständig. `_headers` und `_redirects`
sind aus Git vorhanden und stimmen ebenfalls mit den Produktionsprüfsummen.
Das Release-Manifest selbst bildet die 319. Artefaktdatei.

Wiederhergestellt wurden die ausgelieferten Originale von app.js,
experience-view.js, journey-sword.js, version.js und styles.css sowie die beiden
generierten Inhaltsindizes. Indexvorlage, Service-Worker-Vorlage, Validatoren,
Paketdateien, Bilder, Bibeln, Daten und Netlify-Buildkonfiguration stammen aus
dem passenden Git-Stand und sind durch das exakte Buildergebnis abgesichert.

Der ursprüngliche, im Deployment-Titel genannte Commit `ae619f53` und dessen
Entwicklungsverlauf bleiben unbekannt. Der neue Sicherungscommit wird ausdrücklich
als Rekonstruktion ausgewiesen. Fehlende historische Entwicklungslogs oder Tests
wurden nicht erfunden. Es fehlen keine Dateien der ausgelieferten Anwendung.

### Reproduzierbarer Produktionsbuild

Zwei voneinander getrennte Builds erzeugen **alle 319 Artefaktdateien bytegleich**
zum aktuellen Produktionsstand. Das schließt BUILD.txt, Service Worker, Hosting-
Konfiguration und beide Integritätsmanifeste ein.

- Build: `FP4-20261006-G-POLISH1`
- Build-Hash: `9ab0a7812559790506f4457f2c16adea6f23594d2569140f5eb5a8407e386573`
- Content-Hash: `812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9`

Reproduktion auf dem Sicherungsbranch:

```sh
git switch backup/production-polish1-20261015
node scripts/reproduce-production.mjs
npm test
```

Die einzige ergänzte Buildoption ist `FAITHPATH_BUILD_BRANCH`. Sie erlaubt,
den belegten historischen Branchtext in BUILD.txt auf dem anders benannten
Sicherungsbranch zu reproduzieren. Ohne diese Option wird wie zuvor der aktuelle
Branch ausgegeben. Es wurde keine fehlende Produktfunktion ergänzt.

Pfadweiser Branchvergleich, HTTP-Prüfung und Wiederholungsbuilds sind unter
`qa/production-recovery/` archiviert. Weitere Details: `docs/PRODUCTION_RECOVERY.md`.
Damit war das verbindliche Gate für Phase 2 erfüllt.

## Phase 2: Fehlerkorrekturen

### Importvalidierung

Eine zusätzliche, explizite Importgrenze prüft bekannte Feldtypen, untergeordnete
ID-Duplikate, Wegzuordnungen, lebende Journal-/Reflexionslinks, Bibelreferenzformen,
Quizstatus und die Standardübersetzung. Auch explizites `translation: null`
wird abgewiesen. Die Prüfung erfolgt vor dem Austausch und vor dem Anlegen einer
Import-Rücksicherung; ungültige Daten verändern den aktuellen Stand nicht.

Die bestehende Migration bleibt zuständig für alte/missing IDs. Unbekannte
Erweiterungsfelder bleiben erhalten. Historische sourceKey-/highlightId-Verweise
werden nicht fälschlich wie zwingend lebende Fremdschlüssel behandelt: Gelöschte
Wege oder Markierungen dürfen ihre persönliche Geschichte behalten.

Bestehende lokale V5-Daten werden durch diese strengere Importprüfung beim Start
nicht umgeschrieben. Beschädigte oder verwaiste externe Backups werden abgewiesen,
nicht stillschweigend bereinigt. Für solche Dateien bleibt gegebenenfalls eine
gesonderte, nachvollziehbare Datenreparatur nötig.

### Ungespeicherte Gedanken und Reflexionen

Der bestehende einzelne Entwurf wird anhand seiner exakten vorherigen Bytes
zugeordnet. Ein anderes Formular bietet Fortsetzen, Dateisicherung oder bewusstes
Verwerfen an. Fremde oder neuere Entwürfe werden weder überschrieben noch beim
Abschluss eines anderen Formulars gelöscht. Das vorhandene Entwurfsformat bleibt
unverändert.

Journal-/Reflexionsspeicherung nutzt die vorhandene dauerhafte Transaktionslogik
auch für die zugehörige Entwurfsbereinigung. Speicherfehler lassen die bisherige
Aufzeichnung und den Entwurf erhalten. Während des asynchronen Speicherns sind
Eingaben und erneutes Absenden gesperrt.

Beim Abbrechen eines Notiz-Löschdialogs wird die ursprüngliche Entwurfszuordnung
beibehalten. Ist inzwischen ein anderer Entwurf gespeichert, bleiben beide
Textstände geschützt; die noch im Editor befindlichen Worte können exportiert
werden. Das Entfernen allein der Bibelnotizrolle verwirft keinen persönlichen
Entwurf. Seine Worte lassen sich anschließend speichern, ohne die entfernte
Notizrolle wiederherzustellen.

### Wegzuordnung

Der Journaleditor verwendet bei einer geänderten Auswahl die bereits vorhandene
Ersetzungslogik. A → B ergibt B; A → keine Zuordnung ergibt keine Zuordnung.
Der exakte Reflexionsspiegel und die Weglinks werden mitgeführt. Eigenständige
Bibelstellenlinks bleiben erhalten. Eine reine Textbearbeitung reduziert keine
unveränderte historische Mehrfachzuordnung. Archivierte Auswahlen bleiben auch
beim Wiederaufnehmen eines Entwurfs erhalten.

## Tests und Nachweise

| Prüfung | Ergebnis |
|---|---|
| Rekonstruierter Produktionsbuild | Zwei Builds, 319/319 Dateien bytegleich |
| Stabilisierungskandidat | Zwei Builds, 321/321 Artefakte identisch |
| Inhaltsbestand | Alle 141 geschützten Inhaltsdateien unverändert |
| Node-Regressionsfälle | 107 PASS, zusätzlich eine bestandene Assertionsuite |
| Unveränderter npm-test-Aufruf | 14 Testdateien PASS |
| Bestehende Chromium-Kernabläufe | 12/12 PASS |
| Neue gezielte Chromium-Szenarien | 12/12 PASS |
| Lokales POLISH1→STABLE1-PWA-Update | Drei Prüfschritte PASS |
| Runtime-/Inhaltsvalidator | PASS: 1.560 FP-, 2.314 Nachlese-, 1.300 Kapitelquizfragen, 436 Geschichten |
| Unabhängiger Code-Review | Gefundene relevante Randfälle behoben; keine verbleibenden Blocker im geprüften Umfang |
| Diff-Whitespace-Prüfung | PASS |

Die neuen Fälle wurden zunächst gegen den fehlerhaften Stand ausgeführt und
anschließend korrigiert. Vorher-/Nachher-Belege liegen unter `qa/stabilization/`.
Die Browsertests prüfen den tatsächlich gebauten Kandidaten mit synthetischen
Daten und isolierten Browserkontexten. Die neuen Dialoge wurden bei 320×568,
375×667, 390×844 und 430×932 aufgenommen; die 320-/430-Aufnahmen wurden betrachtet.

Der Update-Test installiert tatsächlich den rekonstruierten POLISH1-Service-Worker
an einer lokalen Origin, migriert V3-Testdaten nach V5 und hält einen alten
Entwurf vor. Das Update wartet auf die bewusste Aktivierung. Hauptdaten, Entwurf
und Migrationssicherung bleiben bytegleich; anschließend funktionieren Offline-
Reload und Wiederaufnahme/Speicherung des Entwurfs. Markierungen und Quizstatus
bleiben erhalten. Dies ist ein lokaler Chromium-Nachweis, kein iPhone-OS-Neustart.

Kandidat: `FP4-20261015-G-STABLE1`

Build-Hash: `8fefcc9b187b66c12b19444844b9f1e7c4671a5d5c4f8816ff36f6984fd9c4d0`

Content-Hash unverändert:
`812f002add339a256d807530d3509297678e41f9e27e381938e50036234c36b9`

## Phase 3: Wartbarkeit

`docs/MAINTENANCE.md` dokumentiert Modulverantwortungen, Datenregeln, Build- und
Testbefehle sowie sichere Erweiterungsschritte. Die veraltete README-Aussage
„kein Build-Schritt“ wurde korrigiert; sie benennt jetzt Node, dist, Schema V5,
Produktionssicherung und Kandidat korrekt.

Die bestehende modulare ES-Anwendung ist als Grundlage geeignet. Der wichtigste
spätere Schnitt liegt in app.js: Editororchestrierung, Import-/Export-UI und
Reader-Ansichten können bei tatsächlichem Änderungsbedarf einzeln extrahiert
werden. Ein gemeinsamer Store und zentrale Beziehungsregeln bleiben maßgeblich.
Ein Frameworkwechsel oder umfassender Rewrite ist technisch nicht begründet.

Es wurden zwei begrenzte Fachmodule ergänzt: Importvalidierung und Entwurfsbesitz.
Beide besitzen direkte Tests und dokumentierte Verträge. Andere Produktbereiche,
Design, Baum/Schwert, Cachealgorithmus und redaktioneller Fragenbestand wurden
nicht umgebaut. Der separate überarbeitete NT-Fragenbestand wurde nicht integriert.

## Verbleibende Risiken und nächstes Gate

- Echte iPhone-/Safari-, installierte PWA-, iOS-Tastatur- und VoiceOver-Tests fehlen.
- Persönliche Daten bleiben lokal und unverschlüsselt; regelmäßige externe Backups
  sind weiterhin wichtig. Eine zusätzliche Cloud wurde nicht eingeführt.
- Web Locks serialisieren unterstützte Journal-/Entwurfsschreibvorgänge. Ohne
  Web Locks bleibt der Vergleich vorheriger Bytes ein Schutz, aber keine absolute
  Garantie gegen wirklich gleichzeitige Schreibvorgänge mehrerer Prozesse.
- Nicht zur Laufzeit gehörende historische Quellcommits/Entwicklungsbelege des
  ursprünglichen Polish-Branches bleiben nicht rekonstruierbar.
- Doppelte Bibel-Caches, lange CSS-Kaskade und Heute-Priorisierung sind bekannte
  spätere Aufgaben. Sie sind nicht Bestandteil dieser Stabilisierung.
- Der Kandidat wurde nicht auf einem gehosteten Preview oder in Produktion geprüft.

**Empfehlung:** Den gesicherten Branch als unveränderliche Referenz behalten,
den Stabilisierungskandidaten als nächsten Geräte-/Preview-Prüfstand verwenden
und weitere Entwicklung in kleinen, getrennten Änderungen fortsetzen. Eine
Produktionsveröffentlichung benötigt eine eigene Entscheidung nach dem Geräte-Gate.
