# FaithPath – isolierter Stimmenvergleich

**Fortsetzung nach dem ersten Paket:** `CSS10_FOLLOWUP.md` dokumentiert die zusätzlich tatsächlich erzeugte CSS10/Neon-Stimme. Die folgenden Angaben zu C/Balanced beschreiben den unveränderten ersten Paketstand; die drei gewünschten Hugging-Face-Modelle sind weiterhin blockiert.

**Teilweise ausgeführt, Auswahlentscheidung offen.** Coqui C und die neue Balanced-Probe sind dieselbe VITS-Stimme mit unterschiedlichen Rhythmuseinstellungen. Für CosyVoice3, Qwen3-TTS und Chatterbox liegen **keine** hier generierten Audios vor: Der verwaltete Downloadproxy verweigert Hugging Face mit HTTP 403. Keine Ersatzstimme wird als eines dieser Modelle ausgegeben.

Ergebnisse: `VOICE_BENCHMARK_REPORT.md`, `VOICE_LICENSE_REVIEW.md`, `qa/audio-results.json` im Hörpaket. Die App und ihre Inhalte bleiben unverändert.

## Tatsächlich ausführbarer Weg: Coqui und identische Ausschnitte

Einrichtung und Modellprüfung wie in `../README.md`; getestete Paketfassung `../requirements-lock.txt`. Linux/WSL/macOS mit FFmpeg und POSIX-Dateisperren. Die vorbereitete Coqui-Installation wird wiederverwendet, nicht mit inkompatiblen Paketen überschrieben.

```sh
python3.12 -m venv .venv-audio
.venv-audio/bin/pip install -r tools/bible-audio/requirements-lock.txt --extra-index-url https://download.pytorch.org/whl/cpu
.venv-audio/bin/python tools/bible-audio/prepare_model.py
```

Die folgenden Beispiele nehmen die vorhandenen geprüften Modelle im Standardmodellordner an. Bei anderen Pfaden `--models /pfad/models` ergänzen. Für die frühere C-Referenz den vorhandenen vollständigen Job verwenden; dessen erneute Synthese ist nicht nötig.

```sh
.venv-audio/bin/python tools/bible-audio/generate.py --book LUK --chapter 15 --verses 20,21,22,23,24,29,30,31,32 --settings tools/bible-audio/benchmark/coqui-balanced.json --out /tmp/faithpath-benchmark-jobs
.venv-audio/bin/python tools/bible-audio/benchmark/benchmark.py --job PFAD_ZUM_C_JOB --id coqui-c --out /tmp/faithpath-hoeren
.venv-audio/bin/python tools/bible-audio/benchmark/benchmark.py --job PFAD_ZUM_BALANCED_JOB --id coqui-balanced --out /tmp/faithpath-hoeren
.venv-audio/bin/python tools/bible-audio/benchmark/benchmark.py --gallery --out /tmp/faithpath-hoeren
.venv-audio/bin/python tools/bible-audio/benchmark/analyze_samples.py --root /tmp/faithpath-hoeren --output /tmp/faithpath-hoeren/audio-results.json --asr-models tools/bible-audio/models
```

Der Generator erstellt ausdrücklich nur die neun gewählten Verse; sein zusammengefügter Probejob ist **kein vollständiges Kapitel**. Der Extraktor erzeugt daraus zwei vollständige **Passagen** (5 bzw. 4 Verse). Er überprüft Originalquelle, komplette Job-Dateihashes, Reihenfolge und Samplegrenzen und kopiert vorhandene PCM-Samples unverändert. Er erzeugt keine neue Stimme. Nur stille Ränder und MP3-Kodierung kommen hinzu. Wiederholungen sind deterministisch innerhalb derselben geprüften Werkzeugumgebung; Extraktionsordner enthalten den Code-/Quelle-/Werkzeugfingerprint. POSIX-Sperren und atomare Dateien stammen aus der bestehenden Pipeline.

Nach Unterbrechung denselben Generierungsbefehl ausführen: verifizierte Teilstücke werden wiederverwendet. Keine parallele Instanz desselben Jobs starten. Vorhandene C-Aufnahmen und globale Aussprache-/Rhythmusprofile werden nicht überschrieben.

```sh
.venv-audio/bin/python -m unittest discover -s tools/bible-audio/benchmark -p 'test_*.py'
.venv-audio/bin/python -m unittest discover -s tools/bible-audio/tests -p 'test_*.py'
node tools/bible-audio/tests/reader-player.test.mjs
node tools/bible-audio/benchmark/check_gallery.cjs /tmp/faithpath-hoeren /tmp/faithpath-hoeren-qa
```

Das Galerie-Prüfskript benötigt die vorhandenen Projektpakete Playwright/axe sowie Chromium unter `/usr/bin/chromium`. Es prüft Audio-Dekodierung und laufende Abspielzeit, **kein menschliches Hören**. Es startet ausschließlich einen temporären Loopback-HTTP-Server. Der verwaltete Chromium sperrt `file://`; deshalb ist der Browsernachweis auf HTTP bezogen. Die Galerie selbst enthält eingebettete MP3s und keine externen Anfragen.

## Neue Modelle: Installation vorbereitet, Inferenz nicht ausgeführt

Es wurden die offiziellen Wheels **qwen-tts 0.1.1** und **chatterbox-tts 0.1.7** heruntergeladen, ihre PyPI-SHA-256 geprüft und Quelltexte/Metadaten statisch gelesen. Keine Installation in die Coqui-Umgebung. Die in den Metadaten tatsächlich beobachteten Konflikte:

| Umgebung | Paketvorgaben / Problem |
| --- | --- |
| Vorhandenes Coqui | Torch 2.8.0+cpu, Transformers 5.22.2 |
| Qwen 0.1.1 | Transformers **4.57.3**, Accelerate **1.12.0**; eigener virtueller Interpreter erforderlich |
| Chatterbox 0.1.7 | Torch/Torchaudio **2.6.0**, Transformers **5.2.0**, NumPy <2 bei Python 3.12; eigener Interpreter erforderlich |
| Thorsten CosyVoice3 | Autor empfiehlt Python 3.10/3.11 und CosyVoice-Code `ace7c47`; dessen Roh-Requirements enthalten CUDA-/TensorRT-/DeepSpeed-Pakete. Nicht unverändert auf diese CPU-Maschine installieren. Der offizielle CPU-Container filtert entsprechende Einträge. |

**Noch nicht ausgeführte Installationsrezepte**, erst nach erlaubter Modelldownload-Verbindung und bestätigten Modell-/Zusatzkomponenten-Rechten:

```sh
python3.12 -m venv .venv-qwen-benchmark
.venv-qwen-benchmark/bin/pip install qwen-tts==0.1.1
python3.12 -m venv .venv-chatterbox-benchmark
.venv-chatterbox-benchmark/bin/pip install chatterbox-tts==0.1.7
```

Diese knappen Rezepte sind **kein getesteter vollständiger Lock**. Vor späterer Reproduktion Torch-Ausgabe (CPU/CUDA), vollständige aufgelöste Versionen, Radprüfsummen und Modellrevisionen fixieren. Es wird keine automatisch funktionierende GPU-Installation auf dem aktuellen Host behauptet. Nicht alle 13,9 GB des Chatterbox-Repositorys laden: nach Prüfung ausschließlich die zur gewählten Fassung gehörenden Dateien beziehen.

### Verifizierte Schnittstellen und wichtige Fallen

- **Qwen:** `Qwen3TTSModel.generate_voice_design(text=..., language="German", instruct=...)`; tatsächlich dokumentiert sind u.a. `temperature`, `top_p`, `top_k`, `repetition_penalty`, `max_new_tokens`. Keine erfundenen SSML-/Emotionsregler. VoiceDesign ist nicht CustomVoice. CPU/eager/float32 erscheint über weitergereichte Transformers-Parameter möglich, wurde hier aber **nicht** mit Gewichten ausgeführt. Fiktiver Sprecherentwurf: ruhige warme deutsche Erzählerstimme, deutliche Artikulation, natürliche Dialogpausen, keine Imitation einer realen Person. Das ist eine Testanweisung, kein nachgewiesener Klang.
- **Chatterbox:** Deutscher Zugang über `ChatterboxMultilingualTTS.generate(text, language_id="de", ..., exaggeration=..., cfg_weight=..., temperature=...)`. Wheel 0.1.7 lädt `t3_mtl23ls_v2.safetensors`; es akzeptiert in `from_local` **kein** `t3_model`-Argument. Der aktuelle GitHub-Quelltext unterstützt V3 und dieses Argument. Beide dürfen nicht vermischt werden. Standard-Referenzstimme erst nach Herkunftsklärung verwenden; sonst nur belegbar erlaubte Referenz. Kein fremder Stimmenklon wurde erstellt.
- **CosyVoice3:** Der Autorenpfad verwendet Base-Download, Fine-Tune-Gewichte und `infer_thorsten.py`. Noch keine hier geprüfte lokale Adapterimplementierung. Der offizielle Container lädt die Gewichte beim ersten Start ebenfalls von Hugging Face; er beseitigt den bestehenden Netzwerkblocker nicht. Keine automatische Übernahme seiner beliebigen Startskripte.

Alle Gewichte zunächst als Daten behandeln: offizielle Herkunft, vollständige Revision, SHA-256, Lizenz-/NOTICE-Dateien und benötigte Zusatzkomponenten erfassen. Kein `trust_remote_code=True`, keine ungeprüften heruntergeladenen Python-Skripte ausführen. Pickle-Checkpoints benötigen zusätzliche Vorsicht; der gelesene Chatterbox-Code verwendet `weights_only=True`, was keine vollständige Lieferkettenprüfung ersetzt. Keine Proxys oder Allowlisten umgehen.

## Spätere Kapitelarchitektur

Die bestehende Coqui-Pipeline stellt bereits Quellen für alle 66 Bücher, zentrale Aussprachehilfen, Segmentcache, Wiederaufnahme, Sperren, Hashmanifest, MP3 und Verszeitmarken bereit. Der Reader-Player bleibt unverändert separat getestet.

Für ein **später tatsächlich ausgewähltes** neues Modell sind getrennte Adapter erforderlich: `synthesize(original_text, voice_profile) -> PCM + sample_rate`. Die bewährte Job-/Dateischicht bleibt. Eine Stimmenidentität umfasst vollständige Modell-/Tokenizerrevisionen und Hashes, Softwarelock, Sprecherbeschreibung bzw. rechtlich geprüfte Referenzdatei, Seedverfahren, echte Modellparameter, Frontend-/Lexikonfassung und Quellhash. Ein identischer Seed garantiert keine universelle Bitgleichheit auf beliebiger Hardware.

Die Aussprachehilfen bleiben vom sichtbaren Luthertext getrennt. Das aktuelle Gruut-IPA-Lexikon lässt sich **nicht ungeprüft** an Qwen oder Chatterbox weiterreichen. Pro Adapter muss erst eine belegbar unterstützte Aussprachekorrektur untersucht werden. Kapitel-/Vers-IDs und vorhandene Bibel-/Quiz-/Nutzerdaten werden dafür nicht geändert. Neue Adapter, neue Sprecheridentitätsfixierung und deren Langkapiteltests sind noch nicht implementiert oder abgenommen. Keine Massengenerierung starten.

## Lokal und auf dem iPhone hören

ZIP entpacken, `index.html` öffnen; alternativ im entpackten Verzeichnis `python3 -m http.server 8765 --bind 127.0.0.1` und `http://127.0.0.1:8765` verwenden. Die einzelnen MP3s lassen sich unmittelbar in Dateien/Audio-Apps öffnen. Auf iOS ist die direkte MP3-Datei zuverlässiger als eine lokale HTML-Vorschau in einer Dateiverwaltungs-App. Der Loopback-Server auf einem PC ist nicht automatisch vom iPhone erreichbar; für Zugriff über das lokale Netz wäre eine eigene, bewusst gewählte Freigabe nötig. Es wurde nichts öffentlich bereitgestellt.

Physischer iPhone-/Safari-Test bleibt offen: beide Passagen hören, unterbrechen/fortsetzen, Kopfhörer, Sperrbildschirm, Download und Versionsvergleich bei gleicher Wiedergabelautstärke prüfen. C und Balanced haben gemessene Pegelunterschiede; keine ungeprüfte Blindstudie oder Aussage über 20–30 Minuten aus diesen Kurzproben ableiten.
