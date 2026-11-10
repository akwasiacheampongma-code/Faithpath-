# NT-Verständnisfragen · Integration und Fortschrittsvertrag

## Umfang und Status

Seit **0.12.0** ist der fertige FaithPath-Katalog aktiv integriert: 27 Bücher, 260 Kapitel, 1.300 Fragen mit je vier Optionen und 1.304 Bibelstellenbereichen. Fragen, Reihenfolge, Lösungsschlüssel und Erklärungen bleiben wortgleich. Die neun OLIVA-Wege bleiben eigenständig. Der andere FaithPath-Pool mit 436 Geschichten ist damit nicht übernommen.

**225/225 Fachtests und ein einzelner vollständiger 108/108-Browserlauf bestanden**, ohne Skips, instabile Fälle oder Wiederholungen. Die private Vorschau liefert seit **10.11.2026, 03:51:05 UTC** die Version **0.12.0**. [NT-Fragen öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/verstehen). Beide nativen JS-/Assetexports und der reale 0.11→0.12-Wechsel bestehen. Der eigenständige 0.12-Quellcheckpoint mit Tag, ZIP und SHA-256 sowie die beauftragte GitHub-Sicherung folgen nach diesem Dokumentcheckpoint. Deren noch nicht bestätigte Kennungen werden nicht vorweggenommen; die tatsächliche neue Remote-CI wird separat geprüft.

## Bedienung

**Bibel → Fragen zum Neuen Testament** öffnet `/verstehen`: alle Bücher,
Kapitelauswahl, Suche und Wiederaufnahme; Markus 4 bietet einen direkten Einstieg.
Im NT-Reader liegt der Zugang nach dem Bibeltext und bleibt im Lesefokus
ausgeblendet. Beispielroute: `/verstehen/MRK?chapter=4`.

Eine Auswahl bleibt zunächst im RAM. Erst **Antwort prüfen** speichert sie
und zeigt Quellenantwort, Erklärung und genaue Bibelstellenlinks. Redaktion
bleibt ausdrücklich vom Bibeltext getrennt. Bewusstes Ändern erhält den
ursprünglichen Zeitpunkt; `updatedAt` entsteht nur bei echter Änderung.

Fragen dürfen ausgelassen und später fortgesetzt werden. Ein Abschluss benötigt
fünf gespeicherte Antworten derselben Fragenfassung; falsche Antworten sind
zulässig. Er bedeutet **fünf Fragen angesehen**, keinen Glaubensscore. Antworten,
Abschlüsse, Position und Archivaktivierung verändern weder Lesen noch Baum.

## Quellen und Rechte

`content/faithpath-nt/source/` bewahrt verlustfrei komprimierte Originale;
`provenance.json` enthält Snapshot, Pfade und SHA-256-Werte.
`npm run content:nt` prüft Originalbytes, Finalmaster, Referenzen und
deterministische Laufzeitdateien auch ohne Git oder Ursprungsrepository.

Übernommene Texte und abgeleitete Kataloge sind von OLIVAs MIT-Lizenz
ausgenommen: [Inhaltsrechte](../content/faithpath-nt/RIGHTS.md). Die ursprüngliche
redaktionelle Freigabe ersetzt keine unabhängige neue theologische Prüfung
oder allgemeine öffentliche Weiterverwendungslizenz.

## Architektur und Migration

- `quiz/index.ts` lädt nur Metadaten. Die Kapitelroute und ausdrückliche
  Speicheraktionen laden die große Textbank; das Offlinepaket enthält sie.
- `schema.ts` validiert Quellsnapshots und kanonische Hashes. `state-schema.ts`
  trennt Antworten, Abschlüsse, Legacy-Fakten und Position.
- Antwortschlüssel enthalten Original-ID und Quellenhash. Spätere Textfassungen
  überschreiben die Herkunft nicht. Abschlüsse bewahren fünf ID-/Hashpaare in
  Originalreihenfolge.
- Domänenfunktionen prüfen Stempel, Optionen, Daten, Reihenfolge und Grenzen
  vor Änderungen. Der Store prüft den ausgelieferten Quellenstand. Aktionen
  nutzen die bestehende Transaktionsqueue mit Wachstum ausgeschaltet.
- Aufrufereigene Positionen werden vor dem Warten validiert und kopiert;
  unveränderte validierte Metadaten erzeugen keinen Schreibzugriff.
- Web nutzt echte Radioinputs mit Tastatursteuerung; Native verwendet
  entsprechende Rollen. VoiceOver/TalkBack bleiben Geräteprüfungen.

AppData/Backup wird **V8**. V1–V7 bleiben strikt lesbar. Migration ergänzt
einen leeren NT-Bereich nur im RAM; Öffnen schreibt keine alten Bytes um.
Private Dokumentversion 1, SQLite 3 und IndexedDB 1 bleiben unverändert. Erst
ausdrückliches Speichern schreibt V8. Es gelten 64 MiB Backupgrenze und separate
Mengenbegrenzungen.

## Historischer Status

Der [Originalvertrag](22-original-nt-progress-contract.md) speichert keine
Einzelantworten. `quiz[Originaleinheit].done` bezeichnet vollständiges Ansehen;
Wiederholung ersetzt dort nur den Zeitpunkt.

Neue Importe zeigen übertragbare Abschlüsse in der Vorschau. Vorhandene Archive
bleiben bis **NT-Abschlüsse aus diesem Archiv übernehmen** unverändert. Nur
bekannte exakte Einheits-IDs mit kanonischem vollständigen UTC-Zeitpunkt werden
aktiviert. Uneindeutige Daten bleiben im Originalarchiv, ohne erfundene Antworten.

Herkunftshinweise bewahren Importbeleg, Quellhash, Einheit und Datum. Der Decoder
prüft sie gegen die unveränderte Archivquelle. Aktivierung ist additiv,
revisionsgeschützt und verändert weder Originalblob noch Rückkehrsicherung.

## Bisher tatsächlich geprüft

| Prüfung | Nachweis / Grenze |
| --- | --- |
| Katalog | 8/8 Tests und Offline-Importer; vollständiger Originalabgleich und zusätzliche Schemahärtung. [Belege](evidence/nt-catalog/ingestion/README.md) |
| Domäne | 26/26 Tests einschließlich Quellenversionen, CAS und Grenzen. [Beleg](evidence/nt-catalog/domain/unit-results.json) |
| Migration | 8/8 Tests; V1–V7, private Dokumente, Archive und Entwürfe. [Belege](evidence/nt-catalog/migration/README.md) |
| Import | 6 neue und 11 bestehende Tests erfolgreich. [Belege](evidence/nt-catalog/import/README.md) |
| Store | 9 gezielte Fälle einschließlich Eingangskopie und Fehler/Retry; der spätere Positionstest ist im Gesamtbeleg enthalten. |
| Vollständiger Browserlauf | **108/108 in einem einzelnen Lauf bestanden**, ohne Skip, Flaky oder Wiederholung. [Aktueller Bericht](evidence/nt-catalog/e2e-results.json) |
| Vollständige Fachprüfung | **225/225 bestanden**. [Aktueller Rohbericht](evidence/nt-catalog/unit-results.json) |
| Frühere NT-/Archivbrowserprüfung | 7/7 NT-Fälle und 3/3 Archivfälle am Entwicklungsbuild `oliva-90d58a6a170aa170`: Zweifensterkonflikt, erster Offlinebesuch/Reload, Tastatur, Axe, 320 px Hell/1440 px Dunkel; Originalblob und Rückkehrsicherung erhalten. |
| Aktuelle NT-/Rückkehrprüfung | **10/10 bestanden**, ohne Skips, Wiederholungen oder instabile Ergebnisse, am Kandidaten `oliva-80005b3c1d2e2eef`. Enthält die drei Rückkehrfälle während ausstehender eigener Commits. [Geprüfter Bericht](evidence/nt-catalog/pending-return-verification.json) |
| Aktuelle Offline-Erkennung | **2/2 bestanden** am selben Kandidaten: vorhandenen aktiven Worker bei unkontrolliertem Dokument entdecken und bei offenen API-Rückgaben endlich abbrechen. [Ergebnis](evidence/nt-catalog/offline-ci-diagnosis/candidate-targeted-summary.json) |
| Native Exporte | Android und iOS erfolgreich; alle 1.300 Fragen einschließlich Originalfeldern, Optionen und Referenzreihenfolge statisch exakt zur Laufzeitdatei. [Vollständiger Katalogabgleich](evidence/nt-catalog/native/nt-native-catalog-check.json) |
| Realer 0.11→0.12-Workerwechsel | **Bestanden**, lokales Chromium mit demselben dauerhaften Profil und Ursprung. Alle V7-Rohwerte bleiben bis zur ausdrücklichen Aktion exakt; erster Commit ändert nur Version, Revision und `ntStudy`. [Unabhängiger Ergebnisabgleich](evidence/nt-catalog/upgrade/oliva-80005b3c1d2e2eef/verification.json) |

Die [313 erfassten Laufzeiteingaben](evidence/nt-catalog/native/runtime-inputs.json)
haben den gemeinsamen SHA-256-Wert
`00acc78da7d6268326b68fce0906ffa67d32c337240efbd8f59490e8d839590a`.
Dieser Stand blieb während beider nativer Exporte unverändert. Der geprüfte
Webkandidat trägt die Kernkennung `oliva-80005b3c1d2e2eef`.

Der reale Updateversuch bewahrt außerdem Originalarchiv und Rückkehrsicherung
über zwei ausdrückliche NT-Commits. Ein echter V8-Sicherungsdownload und seine
Wiederherstellungsvorschau wurden geprüft; eine Wiederherstellung wurde dabei
nicht angewendet. Der Browser bediente Matthäus 1 und Offenbarung 22. Die
vollständige Quellbank ist geprüft, aber keine 1.300 einzelnen
Browserinteraktionen werden behauptet. [Ablauf und Prüfgrenzen](evidence/nt-catalog/upgrade/README.md)

Frühere rote Berichte bleiben erhalten. Der erste Browserstart führte wegen
Nodes JSON-Loader keine Tests aus. Ein früher Gesamtfachlauf fand 17 historische
Fixtures mit neuen Feldern bzw. alten Versionserwartungen; alte Schemas wurden
nicht aufgeweicht. Unabhängige Prüfung reproduzierte außerdem den mutierbaren
Positionseingang und ausstehende eigene Schreibvorgänge beim Verlassen/Rückkehren.
Die Korrekturen und ihre Regressionen sind separat belegt.

Auch die historischen 0.11-CI-Ergebnisse bleiben unverändert rot: der
[ursprüngliche Releaselauf](evidence/github/ci-v011/verification.json) mit
168/168 Fachtests und 91/92 Browserfällen sowie der
[separate Validierungslauf](evidence/github/ci-v011-geometry/README.md) mit
168/168 Fachtests und 92/93 Browserfällen. Die im Kandidaten korrigierte
Offline-Erkennung schreibt diese Ergebnisse nicht rückwirkend um.

## Abgeschlossene Abnahme und verbleibende Bestandslücken

Der erste vollständige Kandidatenlauf bestand 107/108 Fälle. Ausschließlich eine veraltete exakte Erwartung für die ergänzte Importzusammenfassung schlug fehl. [Roter Bericht](evidence/nt-catalog/before-import-expectation-e2e-results.json) und [Fehlerkontext](evidence/nt-catalog/diagnostics/import-summary-before-fix-error-context.md) bleiben erhalten. Nach der reinen Testkorrektur besteht ein einzelner vollständiger **108/108-Lauf** am unveränderten Produktbuild.

Die eigentümerprivate Bereitstellung ist seit **10.11.2026, 03:51:05 UTC** bestätigt: 24 App-Routen und 107 App-Dateien geprüft (106 Hashvergleiche, Index-HTML separat als App-Shell); 42 Review-Dateien bytegenau, anonym HTTP 401 und unveränderte Zugriffspolitik. Hosting-Quellcommit `597abd802820fece4bac4601ed5fa0a57134c983`, Deployment `appgdep_6af2949d0910819196b799ea5b20de94`, gespeicherte Version `appgprj_6aedf77e5ce0819180c10eb799447018~appgver_a32bfb3b4bfc819189fb1bd1696f6866`, Hostbuild `oliva-168499f23f74e16c`. [HTTP-Beleg](evidence/nt-catalog/private-http-check.json). Der erste Hostingversuch lieferte für einen Expo-Router-PNG-Pfad eine HTML-Shell statt des Bildes. Dieser HTTP-Fehler und das erste Paket bleiben unter `before-vendor-host-fix/` erhalten. Ausschließlich das Hostingpaket wurde auf den vorhandenen Vendor-Alias samt URI-Umschreibung angepasst; der Produktkern blieb unverändert. Der anschließende vollständige HTTP-Abgleich ist der hier genannte Erfolgsnachweis. Native Nachweise betreffen JavaScript und Assetbytes einschließlich des vollständigen statischen Katalogabgleichs. Geräte-, Simulator-, Decoder-, Screenreader-, Energie-, Speicher- und signierte Installationstests sind damit nicht durchgeführt.

Der eigenständige 0.12-Quellcheckpoint mit Tag, ZIP und SHA-256 sowie die beauftragte GitHub-Sicherung folgen nach diesem Dokumentcheckpoint. Deren noch nicht bestätigte Kennungen werden nicht vorweggenommen; die tatsächliche neue Remote-CI wird separat geprüft.

Das NT-Arbeitspaket schließt die übrigen Lücken des Masterbestands und die
Gesamt-Definition-of-Done nicht ab. Dazu gehören der vollständige
Story-/Themenbestand, die persönliche Astzuordnung, weitere Buchbilder,
Mehrversauswahl und Kopieraktion, zusätzliche Themes und Übersetzungen sowie
die noch ausstehenden Cloud-/KI-/Audiofunktionen und native Betriebsabnahme.
Der [Paritätsabgleich](16-current-plan-and-parity.md) hält diese offenen
Punkte getrennt fest.
