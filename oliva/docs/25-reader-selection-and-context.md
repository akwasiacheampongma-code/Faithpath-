# Reader-Auswahl, Kapitelkontext und Entwürfe · OLIVA 0.13

Seit **16.11.2026, 14:37:15 UTC** unter der bestehenden [eigentümerprivaten Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site) bereitgestellt. Der Lieferumfang erweitert den vorhandenen Fließtext; er ersetzt keine fertigen OLIVA-Funktionen. Die gemeinfreie Lutherbibel 1912 und der vollständige Original-NT-Katalog bleiben unverändert. Die gesamte Master-Definition-of-Done ist offen.

## Lesen und Handeln verständlich trennen

Ein Teilabschnitt wie **Johannes 6,35–37** bleibt der logische Lesebereich. Der Reader zeigt zusätzlich das vollständige Kapitel mit allen 71 kanonischen Versen und kennzeichnet den Fokus. Damit ist der Zusammenhang lesbar, ohne dass das ganze Kapitel automatisch als gelesen gilt.

| Handlung | Tatsächliches Ergebnis |
|---|---|
| Teilabschnitt öffnen | Vollständiger Kapiteltext, Fokus nur auf dem Quellbereich; kein Kapitelabschluss |
| „Abschnitt als gelesen bestätigen“ | Bestätigt nur den logischen Teilabschnitt |
| „Ganzes Kapitel als Lesebereich öffnen“ | Ändert den logischen Scope ausdrücklich; eine spätere Kapitelbestätigung bleibt ein eigener Klick |
| „Zum Abschnittsanfang“ | Springt zum ersten Fokusvers und setzt den tatsächlichen Versfokus |
| „Zum Kapitelanfang“ im Vollkapitel | Löscht den bisherigen Versanker und zeigt wieder den Kapitelkopf |
| Kontextvers 60 bei Fokus 35–37 öffnen | Speichert den kanonischen Kapitelanker 60, bewahrt jedoch den logischen Fokus 35–37 |

[Beispiel öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/lesen/JHN?chapter=6&from=35&to=37). **Mehrere Verse auswählen** aktiviert die additive Auswahl. Jeder erneute Versklick schaltet diesen Vers ein oder aus. **Auswahl verwenden** öffnet die Werkzeuge. Die Auswahl darf während des Zusammenstellens Lücken haben; vor Kopieren, Markieren, Merken oder einer Bereichsnotiz wird eine zusammenhängende Folge verlangt. Die App ergänzt keine Verse automatisch.

Markierungen und Lesezeichen gelten genau für die gewählten kanonischen Versschlüssel. Sie sind Verwaltungsaktionen und erzeugen keinen Leseabschluss oder zusätzliches Baumwachstum. Bei unveränderter Auswahl oder bereits erreichtem Zustand wird kein unnötiger Persistenzvorgang erzeugt.

## Genau kopieren und eigene Worte bewahren

Der Kopiertext enthält Referenz, jede ausgewählte Versnummer mit unverändertem Bibeltext, echte Zeilenumbrüche und die Übersetzungsangabe **Lutherbibel 1912**. Die Webfassung wartet auf die echte Clipboard-API; der native Adapter nutzt Expo Clipboard. Nur ein tatsächlicher Erfolg zeigt „Bibeltext kopiert.“. Bei einer Ablehnung erscheint ein schreibgeschütztes Feld zum manuellen Kopieren. Ein Kopierfehler wird nicht als Erfolg ausgegeben.

Ein Einzelvers und Bereiche mit verschiedenen Enden bleiben unabhängig: Vers 35, Bereich 35–36 und Bereich 35–37 erhalten getrennte Quellidentitäten und Entwurfsschlüssel. Eine gespeicherte Bereichsnotiz bewahrt beide Grenzen sowie die vollständige Herkunft. **Sammlung → Entwürfe** öffnet wieder genau diesen Entwurf; ein Link mit fremder ID oder unpassender Quelle öffnet keinen Notizeditor, auch nicht vorübergehend vor einer späteren Fehlermeldung.

Fehlgeschlagene Schreibvorgänge behalten eingegebene Worte im Sitzungsspeicher. Die Rückkehr über die Sammlung berücksichtigt diese gehaltenen Entwürfe mit genauer ID, Schlüssel, Quelle und Konfliktprüfung. Bei widersprüchlichen gesicherten und gehaltenen Identitäten wird kein anderer Text stillschweigend eingesetzt. Dieser RAM-Schutz ist keine Festplattensicherung: Ein Prozessabbruch kann noch nicht erfolgreich gespeicherte Worte verlieren.

Tastatur und Modal-Schließen führen zum zuletzt hinzugefügten noch gewählten Vers zurück. Fließtext und Einzelversdarstellung verwenden dieselbe Quell- und Auswahllogik. Reduzierte Bewegung bleibt unterstützt; die neuen Funktionen verändern die sieben A51-Originalbilder nicht.

## Verträge und Architektur

- `src/features/bible/selection.ts` prüft kanonische Auswahl, Lücken und exaktes Kopierformat. `SelectionTools.tsx` und `clipboard/` trennen Darstellung sowie Web-/Native-Adapter von der Domäne.
- `capture-schema-current.ts`, `capture-presentation.ts` und `resolve-bible-draft.ts` unterscheiden Einzelvers und Bereich, Quellroute und tatsächliche Entwurfsidentität. `useDraft` und der vorhandene RAM-Puffer bewahren die Konflikt- und Fehlersemantik.
- `position-current.ts` erlaubt kanonische Anker im umgebenden Kapitel, ohne die logische Referenz zu verbreitern. Die alten Positions-/Captureverträge bleiben eingefroren.
- AppData V9 übernimmt V1–V8 zunächst nur im RAM. Der eingefrorene V8-Personaldatengraph wird nicht durch einen bloßen Versionsfeldwechsel erweitert. Privates Dokument V1, SQLite 3 und IndexedDB 1 bleiben erhalten.
- Die Reader- und Entwurfsmethoden übernehmen validierte Referenzen, Positionen, Texte und erwartete Revisionen vor dem Warten in eigene Snapshots. Ein später verändertes Aufruferobjekt darf weder eine andere Quelle speichern noch den Schutz gegen veraltete Bearbeitungen umgehen. Serialisierung, Konfliktprüfung und No-op-Verhalten bleiben erhalten.

## Tatsächliche Abnahme

**290/290 Fachtests und ein einzelner vollständiger 126/126-Browserlauf bestanden**, im finalen Lauf ohne Skip, Flaky-Ergebnis oder Retry. Typecheck und Audit sind erfolgreich. Kern `oliva-71cf17993d0bc7fd`, Hostpaket `oliva-4ef23c75148a9974`; 327 eingefrorene Laufzeitdateien mit SHA-256 `0b097eb24fc4fded654aef9f1a68ffb76301ed48e3d941ca146046efe3e15611`.

Der tatsächliche 0.12.1→0.13-Wechsel nutzt denselben Origin und dasselbe dauerhafte Chromium-Profil mit echtem neuem Worker/Controller. Vier rohe V8-Werte bleiben bis zu neuen ausdrücklichen Datenaktionen exakt. Neue Bereichsentwürfe schreiben V9 über die sichtbare App. Alte Vers-/Journalentwürfe, ursprüngliche Notizen, NT-Antworten und Lese-/Baumstand bleiben erhalten; Archiv und Rückkehrdaten bleiben auch nach V9-Aktionen exakt. Kontextanker 60, zwei unterschiedliche Bereichsentwürfe, sieben A51-Stadien sowie der V9-Export und die reine Wiederherstellungsvorschau sind offline geprüft. Keine Wiederherstellung wurde angewendet.

Beide nativen JavaScript-/Assetexports bestehen. Je 107 Bildreferenzen und alle 1.300 NT-Fragen wurden statisch geprüft; auch Clipboard-, Auswahl-, Kapitel- und V8/V9-Module sind im Bundle nachgewiesen. Das ist keine Ausführung der App auf einem Gerät oder Simulator und kein Nachweis des nativen Clipboard-Verhaltens durch echte Betriebssysteminteraktion.

Private Auslieferung: 26 Routen, 107 App-Dateien und 42 Review-Dateien geprüft; Index-HTML als App-Shell, alle übrigen App-Dateien per Hash. Anonym HTTP 401, kein App-HTML und exakt unveränderte Eigentümerpolitik. Aufgezeichnete transiente HTTP-Wiederholungen: 0. Keine gehostete CUA-/Browserprüfung und keine reale Handy-, Simulator-, native Screenreader-, Speicher- oder Energieprüfung behauptet.

[Gesamtnachweis](evidence/reader-parity/validation-summary.json) · [Browserbericht](evidence/reader-parity/e2e-results.json) · [native Prüfung](evidence/reader-parity/native/README.md) · [echter PWA-Wechsel](evidence/reader-parity/upgrade/README.md) · [private HTTP-Prüfung](evidence/reader-parity/private-http-check.json).

## Erhaltene frühere Fehlerberichte

Der erste vollständige Reader-Kandidatenlauf mit 125/126 bleibt unverändert erhalten. Die direkte DOM-Scrollanweisung im Fokus-Test konnte mit der noch laufenden Ankerrestaurierung konkurrieren. Nur der Testhelfer wurde auf tatsächliche Tastaturbedienung mit Tab/End umgestellt; Endposition und erreichbarer Ausstieg werden weiterhin vollständig geprüft. Dies ist keine behauptete Runtime-Korrektur. Der erste PWA-Upgradeversuch scheiterte nur am Vergleich der Einfügereihenfolge von Schlüsseln einer bereits ausdrücklich gespeicherten Notiz. Für logische Inhalte wird jetzt strikt nach Schlüsseln/Werten und Arrayreihenfolge verglichen. Die exakten Rohwertvergleiche vor neuen Aktionen und für Archiv/Rückkehrdaten bleiben unverändert. Kein früherer roter Lauf wird nachträglich als bestanden bezeichnet.

Die produktiven Readerkorrekturen dieser Iteration sind gesondert geprüft: vollständiger Kapitelanfang bewahrt wieder das bisherige Kopf-/Ankerverhalten; Modal-Schließen gibt den Versfokus nach tatsächlichem Dialogabbau zurück; fehlgeschlagene gehaltene Entwürfe werden mit exakter Identität wiederaufgenommen und vor der Linkprüfung wird kein Editor montiert. Die genannten späteren Harnesskorrekturen werden nicht als zusätzliche Produktfehlerbehebung verkauft.

Die Vorgänger-CI [43794926581](evidence/github/ci-v0121/README.md) bestätigt exakt den 0.12.1-GitHub-Stand `8d0e663150da1860c371aeeba2c4f2ddf16daf8a`, 225/225 Fachtests und 114/114 Browserfälle. Sie ersetzt keinen noch ausstehenden Remote-Nachweis dieser 0.13.

## Quellsicherung und nächste Masterarbeit

Der eigene 0.13-Quellcheckpoint mit Tag/ZIP und die beauftragte GitHub-Sicherung folgen nach diesem Dokumentcheckpoint. Die tatsächlichen eigenen Kennungen stehen anschließend in `/workspace/oliva-v013-local-checkpoint.json` und `/workspace/oliva-github-backups.json`. Hier werden keine noch unbekannten Commit- oder ZIP-Hashes behauptet. Auch die neue tatsächliche Remote-CI muss separat geprüft werden; die erfolgreiche Vorgänger-CI ersetzt sie nicht.

Die bereits beauftragte öffentliche GitHub-Quellsicherung ist von der eigentümerprivaten Website getrennt. Kein Merge nach GitHub main, keine Änderung der ursprünglichen FaithPath-App oder historischer Versionstags und kein öffentliches Web-/Storedeployment.

Offen bleiben der vollständige ursprüngliche Geschichten-/Themenbestand und weitere Bestandsparität, die persönliche Astzuordnung, zusätzliche hochwertige Buch- und Bibelbilder, unabhängige Inhalts- und Rechtefreigaben, Tests mit Menschen ohne Bibelwissen, echte Geräteabnahme und native Installationspakete. Authentifizierung/Cloud-Sync, Live-KI und Audio sind noch nicht angeschlossen. Anbieter- und Betriebsentscheidungen bleiben offen. Für diese Arbeit werden keine neuen Versionsnummern oder Termine zugesagt.
