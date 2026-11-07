# FaithPath – Lukas15, Coqui-Thorsten-Hörvergleich

Stand:7.November2026. Basis `bae426854c00be46645bd1a2805ec865c1a1fd06`; lokaler Arbeitsbranch `feature/tts-lukas15-quality-20261107`. Der exakte Liefercommit steht in `BUILD.json` des Hörpakets. Kein Push, Merge, Deployment oder App-Redesign.

## Ergebnis und Empfehlung

**Drei vollständige MP3-Kandidaten von Lukas15, Verse1–32, liegen vor.** Zusätzlich wurden eine unveränderte Lukas-Referenz mit den bisherigen Matthäus-Einstellungen und eine erste C-Fassung zum Iterationsvergleich erzeugt. Alle32Originalverse werden in jeder Fassung exakt in der richtigen Reihenfolge an das Modell übergeben; jeder Vers besitzt Audio. Damit ist noch nicht jedes tatsächlich gesprochene Wort menschlich bestätigt.

**Empfehlung für die nächste Hörabnahme: C – Hörbuch.** Ihr berechnetes Tempo liegt bei rund165Wörtern/Minute und passt damit besser zum Ziel längerer Hörzeiten als die schnelleren Varianten. B bleibt die Kontrollfassung mit den wenigsten ASR-Abweichungen. Der Unterschied zwischen beiden ist klein und kein Beweis einer besseren menschlichen Verständlichkeit. Eine bestätigte natürliche oder angenehmere Stimme wird nicht behauptet.

**Für die komplette FaithPath-Bibel ist Coqui Thorsten derzeit nicht ausreichend abgesichert: NO-GO für Massengenerierung und Veröffentlichung.** Es bleiben Aussprache-Verdachtsstellen, keine eigene menschliche Hörabnahme und kein20–30Minuten-Langzeittest. Die Pipeline ist zur weiteren Hörprüfung nutzbar; sie ist keine Freigabe aller66Bücher.

## Quelle und Schutz der bestehenden Arbeit

Quelle: vorhandene `data/bibles/l1912/LUK.json`, Kapitel15, **32Verse und701 durch Leerzeichen getrennte Wörter**. Buchdatei SHA256: `97ff3222e6b211e3dbf6a8c11493ba41cfab7e3e3810484e69140b3214ae7f7d`.

Alle32Versstrings wurden unabhängig gegen [eBible.org/deu1912/LUK15.htm](https://ebible.org/deu1912/LUK15.htm) abgeglichen: wortgetreu identisch, einschließlich historischer Schreibweisen. Es handelt sich um eine Textauslesung über das Webwerkzeug, keine behauptete originale HTML-Bytekopie. Der Luther-1912-Bestand bleibt gemeinfrei; keine neue Übersetzung oder redaktionelle Umschreibung.

Die bisherige optimierte Matthäus1-MP3 mit SHA256 `128a7c856dfc3d0c5c25833fafc8f777189811d16ec51a09482cf078e25a174e` bleibt erhalten und liegt als Vergleich bei. Bibeltexte, Inhalts-IDs, Fragen, Fortschritte, persönlicher Speicher, SchemaV5 und echte App-Oberflächen wurden nicht verändert.

## Messbarer Vergleich

| Fassung | Dauer | Wörter/Minute¹ | Gemessene Lautheit | ASR-Wortoperationen² |
|---|---:|---:|---:|---:|
| Lukas-Referenz, bisherige Parameter |3:27|203,5|−19,70LUFS|140/705 (19,9%)|
| A – Natürlich |3:42|189,8|−20,00LUFS|142/705 (20,1%)|
| B – Lebendig |3:41|190,0|−20,00LUFS|131/705 (18,6%)|
| C – Hörbuch, final |4:15|164,9|−20,00LUFS|135/705 (19,1%)|
| C, erste Runde |3:49|183,8|−20,00LUFS|136/705 (19,3%)|

¹ Gesamtdauer einschließlich Pausen; keine isoliert gemessene Artikulationsrate. ² Levenshtein-Wortoperationen gegen die automatische Transkription nach Normalisierung von Ziffern und ß/ss. Dabei entstehen705Vergleichstokens statt701Leerzeichenwörtern. Diese Werte sind **keine bestätigten Audiofehlerquoten, MOS-Werte oder Natürlichkeitsbewertungen**. ASR kann Wörter falsch hören, Schreibweisen anders wählen und Wörter auslassen. Ein kleiner Unterschied in einem einzigen Kapitel ist keine statistisch abgesicherte Überlegenheit.

Die frühere Matthäus1-Aufnahme dauert2:34 bei rund157Wörtern/Minute und−19,97LUFS. Ihr Stammbaum enthält viele seltene Namen. Ihre schlechtere automatische Erkennung darf deshalb nicht als direkter Nachweis einer Klangverbesserung bei Lukas ausgegeben werden: Es sind andere Texte. Der saubere Kontrollvergleich ist Lukas-Referenz gegen Lukas-A/B/C.

## Tatsächlich übernommene Pipelineverbesserungen

1. **Zusammenhängende Satzgruppen.** Kurze Sätze mit Semikolon bleiben zusammen. Lange Sätze werden bevorzugt an Klausel-/Kommagrenzen aufgeteilt. Die exakte Verkettung aller Originalstrings wird geprüft. Bei Lukas sank die Zahl erzeugter Sprechabschnitte von62auf50; keine Wörter wurden entfernt.
2. **Kontextbezogene Pausen.** Ein Doppelpunkt erhält eine erkennbare Redeeinleitungspause. Ein ohne Satzende fortgeführter Vers erhält eine kürzere Pause, besonders18→19 und22→23. Das ist kein garantiertes Erkennen bestimmter Sprecher oder des Endes direkter Rede.
3. **Absatzmetadaten außerhalb der Bibel.** Die bekannten neuen Gleichnisabschnitte bei Vers8und11 sind explizite Profilhinweise. Der Bibeltext und die Versnummern werden nicht geändert. Bei anderen Kapiteln ohne solche Metadaten wird keine Absatzstruktur erfunden.
4. **Vorsichtigere Randtrimmung.** Neue Profile behalten90ms Schutzrand statt60ms; die RMS-Schwelle sinkt von0,0025auf0,0015. Nur Ränder einzelner Sprechabschnitte werden gekürzt. Die2-ms-Randblende bleibt im Schutzbereich, keine überblendeten Silben. Das reduziert ein technisches Abschneiderisiko; eine Hörprüfung bleibt erforderlich.
5. **Konstante Lautheit.** Die neuen Kapitel erhalten genau einen globalen Gain mit Ziel−20LUFS und Peakbegrenzung. Keine Gain-Sprünge pro Vers und keine Emotionskompression. Bei diesen drei Kandidaten wurde das Ziel tatsächlich erreicht.
6. **Kapitelvollständige ASR.** Die bisherige Standardbegrenzung auf25Verse wurde entfernt. Lukas wurde bei allen Fassungen auf sämtlichen32Versen geprüft. Ein explizites `--limit` bleibt für gekennzeichnete Proben möglich.
7. **Samplegenaue Zeitprüfung.** Aneinandergrenzende Zeitmarken werden auf ganze Audiosamples abgebildet. Die neue Fortsetzungspause deckte einen falschen Testalarm durch Fließkomma-Rundung auf; eine echte Überlappung von zwei Samples wird weiterhin abgewiesen.

Die generische CLI, Modell-/Text-/Code-Fingerprints, geprüften Teilstücke, Dateisperren, atomaren Schreibvorgänge und Wiederaufnahme bleiben erhalten. Die alten Einstellungen sind weiterhin Standard und zusätzlich als `profiles/matthaeus1-reference.json` gesichert. Neue Profile werden ausdrücklich mit `--settings` gewählt. Keine automatische Bibel-Massengenerierung.

## Parameter und ihre belegten Grenzen

| Parameter | Referenz | A | B | C final |
|---|---:|---:|---:|---:|
| VITS `length_scale` |1,04|1,22|1,12|1,50|
| Latent Noise |0,55|0,55|0,62|0,45|
| Duration Noise |0,65|0,50|0,75|0,30|
| Satzpause |280ms|320ms|280ms|340ms|
| Pause nach Doppelpunkt |200ms|400ms|480ms|420ms|
| Fortgeführter Vers |340ms|180ms|180ms|180ms|
| Expliziter neuer Abschnitt |340ms|650ms|600ms|800ms|
| Dauerfaktor unmittelbar nach Doppelpunkt |1,0|1,015|1,04|1,005|

`length_scale`, `inference_noise_scale` und `inference_noise_scale_dp` werden tatsächlich von der installierten `Vits.inference()`-Implementierung verwendet. Die Änderung nach Doppelpunkt setzt nur denselben unterstützten Dauerparameter vor dem folgenden Abschnitt. **Es gibt keine verwendete SSML-, Schauspiel-, Emotions- oder gezielte Tonhöhensteuerung.** „Lebendig“ ist der Name einer Rhythmusvariante, keine garantierte stärkere Satzbetonung.

## Ausgeführte Iterationen und verworfene Ansätze

- Unveränderte32Vers-Referenz zuerst mit dem bisherigen Code erzeugt; Code und Einstellungen separat gesichert.
- Zwei vorhandene Gruut-Phonemlexika an denselben drei Vater-Sohn-Textstellen mit festen Seeds verglichen. Das alternative Lexikon verschlechterte die Erkennung deutlich; es wurde verworfen. Die Stimme blieb in beiden Fällen Coqui Thorsten VITS, kein anderer Synthesizer.
- Acht mögliche Wortkorrekturen in vier identischen Verskontexten getestet. Manche Teile wurden besser erkannt, andere schlechter: Die Änderung für „Buße“ führte beispielsweise zu auffälligem „Positut“ in der ASR. „Tagelöhner“ und „Trebern“ zeigten günstigere Hinweise, aber keine belastbare pauschale Hörabnahme. **Die globale Aussprachedatei wurde deshalb nicht mit diesen experimentellen Einträgen überschrieben.** Die bisherigen biblischen Namenskorrekturen bleiben erhalten.
- Drei komplette Erstfassungen A/B/C erzeugt. C war rechnerisch noch zu nah am schnellen Erzähltempo; als gezielte letzte Runde wurde nur ihre Basis-Dauerskala von1,32auf1,50 erhöht. Ergebnis:228,89→255,02Sekunden,183,8→164,9Wörter/Minute. Die erste C-Fassung bleibt als Prüfstand erhalten. Keine endlose Suche nach zufällig günstigen Seeds.
- Originalprofil mit dem neuen Code für Verse12,21und32 neu berechnet: **neun erzeugte Sprechabschnitte haben exakt identische Float32-Audiosamples** zur ursprünglichen Referenz. Unterschiede im FLOAT-WAV-Container betreffen den PEAK-Zeitstempel; sie wurden nicht fälschlich als Klangregression bezeichnet.

## Prüfstatus

| Bereich | Ergebnis / Grenze |
|---|---|
| Originaltext und Reihenfolge |32/32 in Referenz,A,B,C und erster C-Runde exakt erhalten|
| Technische Audioprüfung |je12Prüfgruppen bestanden: Decoder, Quellen/Hashes, Samples, Timeline, nichtleere Verse, Pegel|
| ASR |je32Verse geprüft; Auffälligkeiten ausdrücklich keine alleinige Fehlerbestätigung|
| Pausen |kein gemessener stiller Abschnitt über1,5s; längster beim finalenC rund0,82s bei RMS<0,003|
| Versübergänge |keine abrupten Sample-Sprünge an den geprüften Versgrenzen; kein Ausschluss jedes möglichen Modellartefakts innerhalb der Sprache|
| Pegel |keine PCM-Übersteuerung; kodierte MP3-True-Peaks unter0dBTP|
| Python-Regressionen |36Tests bestanden, einschließlich exakter Segmentierung aller vorhandenen31.102Luther-Verse|
| Bestehende Reader-Adaptertests |7bestanden|
| Bestehende App-Regression |264bestanden|
| Lint / Syntax / App-Build |bestanden; App-Lint weiterhin5bestehende Warnungen,0Fehler; isolierter App-Build außerhalb der produktiven Dateien|
| Vergleichsplayer |8Browser-Prüfgruppen bestanden: alle4Aufnahmen abspielbar, Downloads gehasht, Dialogsprünge, Tempo, Tastatur, fünfBreiten100/200%Text, axe, Offline nach Laden, keine unbehandelten JS-Fehler|
| Unabhängiges Code-Review |keine kritischen oder wichtigen Befunde; Hinweise zu generischen Viewerbeschriftungen, Messfensterdauer und Dokumentation behoben|
| Menschliches Gegenhören / Natürlichkeit |**OFFEN**|
| 20–30Minuten-Hörkomfort |**OFFEN**; aus einem gut4Minuten langen Kapitel nicht ableitbar|
| Echtes iPhone/Safari/VoiceOver |**OFFEN**, keine Chromium-Prüfung als Geräteabnahme ausgegeben|

Messwerte wurden unter Linux/CPU mit den vorhandenen lokalen Modellen ermittelt. Keine neue Hardware- oder Smartphone-Leistungsbehauptung. Die eingebettete Vergleichsseite ist bewusst ein größeres Offline-Hörpaket; sie ist keine Vorlage, alle Audios oder Modellgewichte in den PWA-Cache zu laden.

## Konkrete verbleibende Probleme

Die ASR markiert weiterhin historische oder schwierige Wörter wie „Buße“, „Pharisäer“, „Schriftgelehrten“, „Tagelöhner“, „Fingerreif“ und „fröhlich“ sowie kleinere Wortendungen. Einige davon können Erkennungsfehler sein, andere echte Ausspracheprobleme. Besonders die Verse2,7,16–19,21–23und29–32 sind vollständig gegenzuhören. Das Modell liefert keine beliebig steuerbare professionelle Dialogregie; durch Tempo und Pausen allein wird daraus keine garantierte Hörbuchsprecherleistung.

Die Quelle ist vollständig an das Modell übergeben und alle32Audioabschnitte sind vorhanden. **Fehlende oder doppelt gesprochene Wörter können trotzdem erst durch vollständiges Gegenhören sicher ausgeschlossen werden.** Keine automatische Kennzahl wird als Ersatz dafür ausgegeben.

## Lizenz und Integration

Unverändert derselbe geprüfte Checkpoint `tts_models/de/thorsten/vits`, Release `v0.7.0_models`, Gewichte SHA256 `ebb3792e89e261c92857ad1977f726bbaadfdf00d1b857dce4c44c393043de66`. Die veröffentlichte Apache2-Modellfreigabe, CC0-Aufnahmen, gemeinfreier Bibeltext und Softwarepflichten gelten unverändert; siehe `LICENSE_REVIEW.md`. Keine Piper-Veröffentlichung, kein Voice-Cloning, keine kostenpflichtige Cloud-TTS-API und keine neuen Modell-Downloads.

Die gemeinsame Pipeline unterstützt weiterhin explizit gewählte Einzelkapitel aller66vorhandenen Bücher. Keine erfolgreiche Luke-Hörprobe würde automatisch deren Aussprache freigeben. Die vorbereitete Reader-Steuerung und das FaithPath-Design wurden nicht verändert. Für eine spätere Audiofreigabe sind Quellenzuordnung, Geräteverhalten, Offline-Auslieferung und menschliche Hörabnahme weiterhin nötig.

## Nächste Abnahme

Zuerst C bei Originaltempo vollständig mit dem Bibeltext gegenhören; danach dieselben Dialogstellen in B vergleichen. Den mitgelieferten32Vers-Hörbogen ausfüllen. Bei bestätigten Wortfehlern nur diese gezielt korrigieren und erneut gegenhören. Anschließend wären mehrere ausdrücklich ausgewählte, freigegebene Kapitel unterschiedlicher Textgattungen für einen echten20–30Minuten-Test nötig. Eine Wiederholung dieses Kapitels oder grüne Tests allein beweisen keine vollständige Bibel-Eignung.

**Fazit: technisch brauchbare Hörkandidaten und robustere, wiederverwendbare Rhythmussteuerung; derzeit keine Veröffentlichungsempfehlung für die komplette FaithPath-Bibel.**
