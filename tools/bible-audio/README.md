# FaithPath – lokale Kapitelvorlesung

Dieses Werkzeug erzeugt **ein ausdrücklich ausgewähltes Kapitel** aus dem vorhandenen Luther-1912-Bestand. Es startet keine Massengenerierung. Modelle, Audiojobs und Vorschau sind vom App-Router und sämtlichen persönlichen Daten getrennt.

## Lukas-15-Vergleich und wiederverwendbare Rhythmusprofile

Die bisherige Matthäus-Konfiguration bleibt in `settings.json` unverändert und zusätzlich unter `profiles/matthaeus1-reference.json` erhalten. Die neuen Profile sind ausdrückliche Hörkandidaten, keine Freigabe für eine vollständige Bibel. Sie funktionieren mit derselben Einzelkapitel-CLI auch bei anderen Büchern:

```sh
.venv-audio/bin/python tools/bible-audio/generate.py --book LUK --chapter 15 --settings tools/bible-audio/profiles/A-natuerlich.json
.venv-audio/bin/python tools/bible-audio/generate.py --book LUK --chapter 15 --settings tools/bible-audio/profiles/B-lebendig.json
.venv-audio/bin/python tools/bible-audio/generate.py --book LUK --chapter 15 --settings tools/bible-audio/profiles/C-hoerbuch.json
```

`rhythm.py` bewahrt vollständige Satzgruppen und bevorzugt bei langen Sätzen Klauselgrenzen. Ein Doppelpunkt erhält eine erkennbare Pause; ein ohne Satzende fortgeführter Vers bekommt eine kürzere Pause. Der kurze Dauerfaktor nach einem Doppelpunkt ist keine garantierte Sprechererkennung oder Emotions-/Tonhöhensteuerung. Bekannte Absatzanfänge können explizit im Profil hinterlegt werden; für Lukas 15 stehen dort Verse 8 und 11, außerhalb des Bibeltexts. Ohne solche Metadaten wird keine Absatzstruktur erfunden.

Die neuen Profile behalten **90 ms** Schutzrand und verwenden eine vorsichtigere Erkennungsschwelle; die unten beschriebene historische Konfiguration behält **60 ms**. Das ASR-Werkzeug verarbeitet jetzt standardmäßig das gesamte gewählte Kapitel, statt nach 25 Versen aufzuhören. `compare_quality.py` normalisiert für den reinen Erkennungsvergleich Ziffern und ß/ss; das verändert weder die Stimme noch den sichtbaren Bibeltext. WER ist kein Hörqualitätswert.

Eine Vergleichsseite mit identischem Originaltext und mehreren vollständigen Aufnahmen lässt sich so bauen:

```sh
.venv-audio/bin/python tools/bible-audio/build_comparison.py --jobs PFAD_A PFAD_B PFAD_C PFAD_REFERENZ --out /tmp/faithpath-vergleich
```

Die HTML-Datei bettet die MP3s zur lokalen Hörprüfung ein. Das braucht mehr Speicher als die später vorgesehene gezielte Einzelkapitel-Auslieferung in der App. Es ist eine isolierte Vorschau und kein PWA-Audio-Release. Aktuelle Befunde: `LUKAS15_REPORT.md` und die QA-Dateien im Hörpaket.

Die MP3 ist ein Hörprüfkandidat. Erfolgreiche Synthese, Bytegleichheit und Spracherkennung beweisen weder eine angenehme Stimme noch die vollständige korrekte Aussprache. Siehe `LICENSE_REVIEW.md` und den mitgelieferten Prüfbericht.

## Aufbau

- `generate.py`: Einzelkapitel-CLI, lokales VITS-Modell, deterministische Seeds und Orchestrierung.
- `pronunciation.py` / `pronunciations.json`: Gruut-kompatible Aussprachekorrekturen auf vollständigen Wörtern. Originaltext bleibt unverändert. Das angepasste Formatter-Modul steht unter MPL-2.0.
- `audio_processing.py`: wortgetreue Segmentierung, konservative Randtrimmung, definierte Pausen und Messwertparser.
- `jobs.py`: validierte Quellen, SHA-256, POSIX-Dateisperre, atomare Dateien und überprüfbarer Segmentcache.
- `settings.json`: geprüfte Modellfassung und alle Synthese-/Audioparameter.
- `verify_audio.py`: Text-, Hash-, Sample-, Timeline-, Decoder- und Pegelprüfung.
- `check_speech.py`: optionale lokale Whisper-Prüfung. Erkennungsabweichungen sind **Prüfhinweise**, keine bestätigten Audiofehler.
- `reader-player.js`: vorbereiteter, separat getesteter HTMLAudioElement-Lebenszyklus; keine automatische Integration und keine Fortschritts- oder Speicherschreibzugriffe.
- `build_player.py` / `player.html`: eigenständige Hör-/Textvorschau. Die neue MP3 ist eingebettet; nächstes Kapitel wird ausdrücklich nur als Originaltext gezeigt, sofern noch kein Audio vorhanden ist.

## Einrichtung

Getestet: Linux x86-64, Python 3.12.14, CPU, FFmpeg 7.1.5. Keine kostenpflichtige API, keine API-Schlüssel. Für die Generierung werden ungefähr 300 MB Modellgewichte und mehrere GB Python-Abhängigkeiten benötigt. Netzwerk ist nur für die **bewusste Einrichtung** nötig. Die nachfolgende Inferenz läuft offline.

```sh
python3.12 -m venv .venv-audio
.venv-audio/bin/pip install -r tools/bible-audio/requirements-lock.txt --extra-index-url https://download.pytorch.org/whl/cpu
.venv-audio/bin/python tools/bible-audio/prepare_model.py
```

FFmpeg und die SoundFile-Systemvoraussetzungen müssen vorhanden sein. Die Einrichtung darf keine Netzwerkbeschränkungen umgehen. `prepare_model.py` prüft den konkreten offiziellen GitHub-Download per SHA-256; veränderte Dateien werden abgelehnt. Bereits vorhandene geprüfte Modelle können über `--models /anderer/model-ordner` genutzt werden.

## Ein Kapitel erzeugen

```sh
.venv-audio/bin/python tools/bible-audio/generate.py --book MAT --chapter 1 --out /tmp/faithpath-audio
```

Andere Beispiele: `--book GEN --chapter 1`, `--book PSA --chapter 23`, `--book REV --chapter 22`. Alle 66 vorhandenen Bücher sind als Quellen wählbar; automatisiert wurden ihre ersten und letzten Kapitel nur eingelesen und validiert. **Nicht alle 1.189 Kapitel wurden vertont oder sprachlich geprüft.** Andere Übersetzungen werden nicht stillschweigend vorgelesen.

Ein Jobordner enthält unter anderem MP3, WAV, unveränderten Kapiteltext, Zeitmarken, Bericht und geprüfte Sprechabschnitte. Sein Name enthält einen Fingerprint aus Quelle, Modell, Konfiguration, Lexikon, verwendeten Paketen und ausführbarem Pipelinecode. Änderungen erzeugen einen neuen Kandidaten; frühere Aufnahmen werden nicht überschrieben.

Nach Unterbrechung denselben Befehl erneut starten. Nur Teilstücke mit passender Identität und korrektem Dateihash werden übernommen. Beschädigte Metadaten und WAVs sind Cache-Misses. Eine zweite Instanz desselben Jobs wird durch die Dateisperre abgewiesen. Erst der vollständige Abschlussbericht kennzeichnet einen fertigen Job. Ein erneuter Aufruf eines vollständig verifizierten Jobs synthetisiert nicht erneut.

`--verses 2,7,12,23` ist ausschließlich eine eindeutig als unvollständig bezeichnete Hörprobe. Es werden keine Versnummern gesprochen oder Bibelwörter redaktionell ersetzt.

## Prüfen und Vorschau bauen

```sh
.venv-audio/bin/python -m unittest discover -s tools/bible-audio/tests -p 'test_*.py'
node --test tools/bible-audio/tests/reader-player.test.mjs
.venv-audio/bin/python tools/bible-audio/verify_audio.py --job /tmp/faithpath-audio/JOB --bibles data/bibles
.venv-audio/bin/python tools/bible-audio/build_player.py --job /tmp/faithpath-audio/JOB --bibles data/bibles --output /tmp/faithpath-player/index.html
```

Für die optionale ASR ist zusätzlich die vorhandene Sherpa-ONNX-Whisper-base-Installation mit `base-encoder.int8.onnx`, `base-decoder.int8.onnx` und `base-tokens.txt` erforderlich:

```sh
.venv-audio/bin/python tools/bible-audio/check_speech.py --job /tmp/faithpath-audio/JOB --models /pfad/zum/model-ordner
```

Die Hörprüfung braucht diesen ASR-Download nicht. Die ausgelieferte HTML-Datei spielt das neue Audio nach dem Entpacken auch ohne Server; wenn eine verwaltete Browserumgebung lokale Dateien sperrt, einen erlaubten lokalen HTTP-Server nutzen. WAV und alte Vergleichsaufnahme bleiben relative Dateien im Gesamtpaket.

## Unterstützte Steuerung und Grenzen

Verwendet werden nur reale Attribute des installierten `Vits.inference()`: `length_scale`, `inference_noise_scale`, `inference_noise_scale_dp`. Keine erfundenen SSML-Tags, keine frei behauptete Emotions- oder Betonungssteuerung. Stresszeichen wurden nicht in ein dafür nicht nachgewiesen trainiertes Frontend gezwungen.

Stille wird nur an den Rändern erzeugter Sprechabschnitte mit 60 ms Schutzrand gekürzt. Pausen innerhalb einer Phrase bleiben erhalten. Zwei Millisekunden Randfade verhindern Klicks; Sprachanteile werden nicht überblendet. Die Gesamtlautstärke wird mit genau einem Gain-Faktor angeglichen und bei zu hohen Peaks begrenzt; das LUFS-Ziel darf deshalb verfehlt werden. Kein Lautheitspumpen pro Vers.

Bytegleiche Audio-Reproduktion wurde auf derselben installierten CPU-/Softwareumgebung nachgewiesen. Andere Hardware, Torch-Versionen, FFmpeg-Builds und Threadverfahren können andere Bytes erzeugen. Paket-Lock, Modelle und Fingerprints machen diese Abweichungen sichtbar; sie garantieren keine universelle plattformübergreifende Bitgleichheit.

Die Dateisperre nutzt POSIX `flock`: Linux/macOS oder WSL; nativer Windows-Betrieb wurde nicht geprüft. Es werden keine Modelle, Cloud-Konten, personenbezogenen Texte, Tracker oder Nutzerdaten in der FaithPath-App angelegt.
