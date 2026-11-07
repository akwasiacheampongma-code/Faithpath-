# FaithPath – Matthäus 1, optimierte Coqui-Hörfassung

7. November 2026 · Kandidat `FP-AUDIO-20261107-THORSTEN-MAT1-R1`

## Ergebnis

Eine neue vollständige MP3 und WAV sowie eine funktionierende lokale Hörvorschau liegen vor. Alle **25 Verse** wurden wortgetreu aus dem bestehenden Luther-1912-Bestand verarbeitet. Die Pipeline arbeitet lokal, ohne kostenpflichtige Cloud-API. Die bestehenden Aufnahmen und die echte App bleiben erhalten.

**NO-GO für Veröffentlichung und Massengenerierung. Zur gezielten Hörprüfung lieferbar.** Die technischen Verbesserungen sind nachgewiesen; eine natürliche, vollständig fehlerfreie Aussprache und ein überzeugender Hörvergleich sind ausdrücklich noch nicht nachgewiesen. Der Agent hat keine eigene menschliche Hörabnahme durchgeführt. Die automatische Spracherkennung meldet weiterhin zahlreiche Verdachtsstellen.

Der Code liegt auf dem neuen lokalen Branch `feature/tts-thorsten-bible-20261107`, Basis `a519ce898fa33907b07d5ac7a585595127556183`. Der exakte Liefercommit steht in `BUILD.json` des Pakets. Kein Push, Merge oder Deployment; keine Änderung an `src/`, Bibel-/Fragedaten, V5-Schema oder persönlichen Daten. Die Reader-Funktion wurde **vorbereitet**, nicht ungefragt in die laufende App freigeschaltet.

## Was tatsächlich vorlag

Die vorherige Piper- und Coqui-Aufnahme, ihre Quellen, Modelle, Konfigurationen und Berichte waren vorhanden. Beide Referenzen wurden als Dateien geprüft. Es wird kein eigener akustischer Vergleich behauptet. Die alte Coqui-MP3 ist im Hörpaket zum direkten Vergleich enthalten; Piper wird wegen der offenen Lizenzkette nicht als Veröffentlichungskandidat verteilt oder als Stimmreferenz genutzt.

Der vorhandene Bibeltext stammte laut Repository von eBible.org/deu1912. Alle 25 Verse stimmen exakt mit der am Prüftag über das Webwerkzeug gelesenen eBible-Fassung überein, einschließlich Wortlaut und Versreihenfolge. Ein direkter Terminaldownload wurde vom Proxy abgelehnt; deshalb wird keine originale HTML-Bytekopie behauptet. Der historische Text und der öffentliche eBible-Hinweis sind gemeinfrei. Keine neuere Lutherrevision oder fremde Übersetzung wurde eingemischt.

## Änderungen und Messwerte

| Merkmal | Vorherige Coqui-Fassung | Neuer Kandidat |
| --- | --- | --- |
| Länge der WAV | 222,0807 s / 3:42 | 154,1090 s / 2:34 |
| Abgetastete Zeit unter RMS 0,003 bei 10-ms-Fenstern | 90,27 s | 32,07 s |
| Verarbeitete Verse | 25 | 25 |
| Lautstärkeanpassung | globaler Peak-Gain | ein globaler, LUFS-orientierter und peakbegrenzter Gain |
| Aussprache | automatische Gruut-Aufbereitung | geprüftes Wortlexikon als vorgeschaltete Lautschriftkorrektur |
| Wiederaufnahme | bloßes Wiederzusammensetzen gespeicherter Verse | identitäts- und hashgeprüfte Sprechabschnitte; Dateisperre; atomare Metadaten |

Die Dauer ist um rund **68 Sekunden / 30,6 %** kürzer. Der RMS-Vergleich hängt auch vom Pegel ab und ist **keine Qualitätsnote**. Im neuen Lauf wurden an den Rändern der 57 Sprechabschnitte zusammen 45,99 Sekunden Stille entfernt. Pausen innerhalb einer Phrase wurden nicht automatisch zusammengeschnitten.

Die bisherige Verarbeitung addierte Modellstille und eigene Satz-/Verspausen. Jetzt werden die Ränder mit 60 ms Sicherheitsabstand gekürzt; die zusätzlich eingefügte Stille berücksichtigt diesen bereits vorhandenen Abstand. Satzgrenzen zielen auf 280 ms, Versgrenzen auf 340 ms und Klauselgrenzen auf 200 ms. Eine 2-ms-Randblende verhindert Klicks, ohne gesprochenen Text zu überblenden.

Der finale Pegel beträgt gemessen rund **−19,97 LUFS**, WAV-Peak rund −1 dBFS. Das Ziel −18 LUFS wurde zugunsten der Peakbegrenzung bewusst nicht erzwungen. Kein Kompressor und keine unterschiedliche Verstärkung pro Vers. In den FFmpeg-Messprotokollen sind `input_i` und `input_tp` die tatsächlichen Messwerte; die `output_*`-Felder beschreiben nur den verworfenen Analysefilter-Ausgang.

## Aussprache und iterative Arbeit

Die tatsächliche Gruut-Aufbereitung enthielt unter anderem ein zusätzliches L in „Isaak“, fehlende Laute in „Abraham“ und „Rehabeam“ sowie eine verschmolzene Endung in „Sealthiel“. Zusätzlich waren die Lautfolgen für „zeugte“ und „heißen“ auffällig. Diese Fälle wurden erst als fehlgeschlagene Tests reproduziert und dann auf Ebene der Lautschrift korrigiert.

Das wiederverwendbare Lexikon enthält **12 Namensformen und zwei häufige Wörter**. Zu den Namen gehören Abraham/Abrahams, Isaak, Perez, Nahesson, Rahab, Jesse, Rehabeam, Sealthiel, Serubabel, Eliud und Immanuel. Ganze Wörter werden abgeglichen; Genitive sind ausdrücklich getrennt erfasst. Der ausgegebene und sichtbare Bibeltext wird dabei nicht umgeschrieben. Für **53 vorkommende Namensformen** liegt ein Audit der Standard- und Kandidaten-Lautschrift vor.

Die Zielaussprache orientiert sich an deutscher kirchlicher Lesung, Loccumer Richtlinien und dokumentierten Aussprachehilfen. Bei historischen Schreibweisen und unterschiedlichen Lesetraditionen bleibt die konkrete Hörentscheidung offen. Ein bestandener Lautschrift-Test besagt, dass das gewünschte Phonem dem Modell übergeben wird; er beweist nicht dessen perfekte akustische Umsetzung.

Drei kurze Profile wurden tatsächlich erzeugt und mit derselben lokalen Spracherkennung geprüft. Die schnelle Variante (`length_scale 0.96`, Duration-Noise 0.3) verschlechterte die Erkennungsresultate und wurde verworfen. Gewählt wurde das ruhigere Profil **1.04 / 0.55 / 0.65**. Die Wahl ist eine nachvollziehbare technische Vorauswahl, keine behauptete Nutzerpräferenz oder Hörabnahme.

Verwendet werden nur echte Attribute des installierten `Vits.inference()`: `length_scale`, `inference_noise_scale`, `inference_noise_scale_dp`. Die historische Coqui-0.7.1-Gruut-Implementierung wurde gegengeprüft: auch sie verwendet standardmäßig keine Stresszeichen. Keine erfundenen SSML-, Emotions- oder Prosodiefunktionen und kein neues Training.

## Vollständigkeit und ASR-Grenzen

Die Originalquelle, die 25 Versnummern, alle Eingabesegmente und die Reihenfolge stimmen exakt überein. Alle Verse besitzen Audio, Zeitmarken und verifizierte Dateien. Das ist **kein alleiniger Beweis jedes tatsächlich hörbaren Wortes**.

Whisper base multilingual int8 wurde lokal über Sherpa-ONNX auf allen 25 Versen ausgeführt. Vorher und nachher ergeben sich jeweils **79 Abweichungsgruppen**. Diese Gruppenzahl beweist weder gleich gute noch verbesserte Klangqualität. Seltene Namen, historische Formen und als Ziffern erkannte Zahlen verursachen Fehlalarme; andere Abweichungen können echte Aussprache- oder Vollständigkeitsprobleme sein.

Besonders gegenhören: Verse 2, 6–9, 12–16, 18, 20, 22–24. Bei Vers 23 ließ die Ganzvers-Erkennung „Gott mit uns“ weg; die isolierte Prüfung desselben Sprechabschnitts erkannte hingegen „Körtt mit uns“. Das ist ein konkretes Beispiel, warum eine ASR-Auslassung nicht automatisch eine TTS-Auslassung bestätigt. Auch diese Stelle bleibt hörprüfpflichtig. Das Modellfrontend gibt weiterhin Warnungen zu nicht im Vokabular enthaltenen IPA-Diakritika und Anführungszeichen aus; daraus wurden keine unbewiesenen fehlenden Bibelwörter abgeleitet.

Der Hörprüfbogen enthält alle 25 Originalverse, Zeitmarken und Erkennungstexte. Jede menschliche Prüfung steht auf **OFFEN**.

## Technische Nachweise

| Prüfung | Ergebnis | Beleg im Paket |
| --- | --- | --- |
| Bestehende App-Unit-/Regressionstests | **264/264 bestanden** | `evidence/logs/app-final.log` |
| Neue Python-Tests | **25 bestanden** | `evidence/logs/python-final.log` |
| Reader-Adapter-Tests | **7 bestanden** | `evidence/logs/reader-final.log` |
| Audio-Prüfgruppen | **12 bestanden** | `job/qa/technical-results.json` |
| Player-Browserprüfgruppen | **12 bestanden** | `qa/browser-results.json` |
| Bestehende App-Browserregression | **12 Gruppen bestanden**, keine unbehandelten JS-Fehler | `evidence/app-browser/browser-results.json` |
| App-Lint | bestanden, **5 bereits bestehende Warnungen**, 0 Fehler | `evidence/logs/app-lint.log` |
| TTS-JavaScript-Lint / Python-Syntax | bestanden | `evidence/logs/tool-lint.log`, ausgeführtes `py_compile` |
| App-Build und Datenverträge | bestanden | `evidence/logs/app-build-final.log`, `app-contracts-final.log` |
| Reproduzierbarkeit finaler Pipeline | **zwei getrennte Läufe, jeweils 0 Cachetreffer; WAV und MP3 byteidentisch** | `evidence/final-reproduction.json` |
| Echte Unterbrechung | SIGTERM, danach Wiederaufnahme mit geprüften Teilstücken | `evidence/interrupted-job.json`, `interrupted-final-job.json` |
| Cachekorruption / fehlende QA-Datei | beschädigte Metadaten und gelöschte Versdatei repariert; **56 Cachetreffer, Audio unverändert** | `evidence/recovery-result.json` |
| Unvollständige Probe im Player | wird abgelehnt; keine irreführende HTML-Datei erzeugt | `evidence/probe-rejection.json` |
| Mobile Player-Vorschau | 320/375/390/430/768/1280 px, 100 % und 200 % Text, kein horizontaler Überlauf | Browserprotokoll und PNGs unter `qa/` |
| Automatisierte Accessibility | axe: keine Verletzung in der geprüften Playeransicht | `qa/axe-results.json` |
| Standalone-Audio offline | nach Laden der HTML-Datei mit abgeschaltetem Netzwerk abspielbar | Player-Browserprotokoll |
| Vorhandene App offline / Backups / Reader / Quiz | bestehende Browserregression bestanden, beide Offline-Bibeln erhalten | App-Browserprotokoll |
| Menschliche Hörabnahme | **OFFEN** | `evidence/listening-review.csv` |
| Echtes iPhone / Safari / VoiceOver | **OFFEN** | keine behauptete Gerätesimulation als Abnahme |

Die anfänglichen App-Test- und Buildfehler innerhalb der eingeschränkten Sandbox wurden auf gesperrte Unterprozesse eingegrenzt; derselbe unveränderte Nachlese-Test und der volle App-Lauf bestanden außerhalb dieser Einschränkung. Kein App-Test wurde dafür abgeschwächt.

Die unabhängige Codeprüfung fand drei wichtige Fehler: veraltete `play()`-Rejektion nach Kapitelwechsel, unvollständige Cache-Abhängigkeitsprüfung und eine irreführende Vorschau für Teilproben. Alle wurden mit zunächst fehlgeschlagenen Regressionen korrigiert. Der Job prüft jetzt **143 zugehörige Ausgabedateien**, einschließlich Vers- und Segmentdaten. Ein eigener Browserbefund bei 320 px / 200 % Text wurde durch geeignete Innenabstände und umbrechenden Text behoben, ohne Inhalte zu verstecken oder Schrift zu verkleinern.

## Wiederverwendung, Performance und Reader

Die CLI wählt ein Buch und ein Kapitel. Alle 66 vorhandenen Bücher wurden als Quellen erfolgreich an ihrem ersten und letzten Kapitel geprüft; keine Massengenerierung. SHA-256-Fingerprints umfassen Text, Modell, Konfiguration, Lexikon, Pakete und Pipelinecode. Dateisperren verhindern konkurrierende Schreiber desselben Jobs. Metadaten werden atomar ersetzt, beschädigte Teilstücke nicht blind weiterverwendet.

Getestete Umgebung: Linux x86-64, Python 3.12.14, drei verfügbare CPU-Kerne, kein GPU-Einsatz; Torch mit zwei Rechenthreads und einem Interop-Thread. Zwei frische finale Syntheseläufe benötigten rund **107,65 s und 106,66 s** für 154,11 s Audio. Keine Aussage über iPhone-Syntheseleistung, Akkubelastung oder universelle Bitgleichheit auf anderer Hardware. Die App soll fertige Audiodateien abspielen; das Modell läuft nicht im Browser.

Der vorbereitete Reader-Adapter bietet Abspielen, Pausieren, Fortsetzen, Geschwindigkeit, Quellenwechsel, Schutz vor verspäteten Antworten und vollständiges Aufräumen. Die Vorschau zeigt den echten Matthäus-2-Text bei „Nächstes Kapitel“, meldet aber korrekt, dass dort keine Aufnahme existiert. Keine fremde Übersetzung und kein altes Audio werden unter falschem Kapitelnamen weitergespielt.

Die echte App-Navigation, ihr Design, Speichermodell und Fortschrittsregeln wurden nicht verändert. Der konkrete spätere Anschluss, Quellenmanifest und Offline-Strategie sind in `tools/bible-audio/READER_INTEGRATION.md` dokumentiert. Keine automatische Aufnahme aller Audio- oder Modellmedien in den PWA-Cache.

## Lizenzen und offene Risiken

Die veröffentlichte Rechtekette des konkreten Coqui-Modells ist kommerziell kompatibel: Apache 2.0 für den bezeichneten Modellcheckpoint, CC0 für Thorstens eigene Aufnahmen, gemeinfreier Luther-1912-Text und freie kommerziell nutzbare Softwarelizenzen. Die vollständige Belegkette, Hashes, Weitergabepflichten und Grenzen stehen in `LICENSE_REVIEW.md`. Der genaue Trainingsdatensatz-Snapshot und jede mögliche historische Checkpoint-Abstammung sind nicht forensisch attestiert; die veröffentlichte Modellfreigabe wird damit nicht als unwiderlegbare Rechtsgarantie ausgegeben.

Das Paket enthält keine Modellgewichte, Python-/FFmpeg-Binärprogramme oder Piper-Veröffentlichungsfassung. Wer später solche Komponenten verteilt, muss deren jeweilige Apache-/MPL-/LGPL-/GPL-Bedingungen zusätzlich erfüllen. Die fertige MP3 wird durch bloßes Erzeugen nicht automatisch GPL-Software. Die synthetische Stimme darf nicht als persönliche Aufnahme oder Empfehlung des Stimmgebers dargestellt werden.

## Empfehlung und nächster Schritt

**Jetzt die neue MP3 gezielt gegenhören, noch nicht veröffentlichen.** Den Hörprüfbogen für alle Verse ausfüllen; besonders Namen und ASR-Verdachtsstellen mehrfach anhören. Tempo/Pausen und Natürlichkeit getrennt beurteilen. Die Quellen- und Lizenzunterlagen für den Release aufbewahren. Erst nach bestätigter Hörqualität und anschließendem Geräte-/Reader-Gate ist ein Veröffentlichungs-GO sinnvoll.

Die messbar kürzere Verarbeitung und die robustere Architektur sind fertig geliefert. Das nicht vollständig belegte Aussprache-/Hörergebnis wird ausdrücklich nicht als fertige Premium-Bibelvorlesung ausgegeben.
