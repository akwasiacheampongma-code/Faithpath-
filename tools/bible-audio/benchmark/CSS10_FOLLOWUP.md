# Tatsächlich zusätzliche Stimme – CSS10/Neon

Fortsetzung vom 7. November 2026. Der ursprüngliche Benchmarkbericht und sein ZIP bleiben als unveränderter erster Stand erhalten.

## Was jetzt wirklich funktioniert

`tts_models/de/css10/vits-neon` wurde aus dem **offiziellen Coqui-GitHub-Release v0.8.0_models** heruntergeladen und lokal mit Coqui-TTS 0.28.0 auf CPU ausgeführt. Dies ist ein anderer veröffentlichter Sprecher-Checkpoint auf dem CSS10-Datensatz, **kein weiteres Thorsten-Rhythmusprofil**. Es wurde keine Referenzaufnahme hochgeladen, kein Stimmenklon erzeugt und keine benannte reale Person als Ziel angefordert. Verwendet wird ausschließlich die eingebaute Standardstimme.

Die tatsächliche Modellkonfiguration nennt CSS10 Deutsch, Graphem-Eingaben ohne Phonemizer, genau einen Sprecher und eine Sprache. Das Thorsten-IPA-Lexikon wird deshalb nicht ungeprüft übertragen. Der alte absolute Autorenpfad zu `speaker_ids.json` wurde ausschließlich in einer separaten Laufzeitkonfiguration auf die vorhandenen lokalen IDs umgebogen. Die Originalkonfiguration und Gewichte sind unverändert. Die Coqui-Einzelsprache-/Einzelsprecher-API wählt ihre einzige Stimme intern; explizite `speaker`-/`language`-Argumente wurden nach einem reproduzierten API-Fehler entfernt und durch Tests abgesichert.

Es entstanden die vollständigen Passagen Lukas 15,20–24 und 29–32 aus unverändertem Luther-1912-Text. Segmentcache, atomare Metadaten und Dateisperren verwenden die vorhandenen lokalen Hilfsmodule. Die produktive App, Bibel-, Quiz- und Nutzerdaten werden nicht gelesen oder verändert; lediglich der vorhandene öffentliche Bibeltext dient als Synthesequelle.

## Konkrete Modellidentität

- [Offizieller Download](https://github.com/coqui-ai/TTS/releases/download/v0.8.0_models/tts_models--de--css10--vits.zip), **100.932.296 Bytes** laut lokaler Datei.
- Archiv SHA-256: `b6da8a18dd122fab0783ed4ef343e29a8f09d39311b99b8eab80b0ea8dffe316`.
- Gewichte SHA-256: `5b4fcb17da97ebfda929ccd503344bbe5f351dcfd97c8637c804fc7ffc72e8cd`.
- Originalkonfiguration SHA-256: `34662716770cff1dac3f45029e345f90c6e66102a0a2e1bd259ebfc6ffb0ae9d`.
- Sprecher-/Sprach-IDs jeweils SHA-256: `ce025097310366ad9be582651509012dc2399413ae54fb22fefd211070c97239`.

## Lizenzgrenze

Der [offizielle Coqui-Katalog](https://github.com/coqui-ai/TTS/blob/dev/TTS/.models.json) und die [Neon-Modellseite](https://huggingface.co/neongeckocom/tts-vits-css10-de) bezeichnen die Modellfreigabe als **BSD-3-Clause**. Der [CSS10-Datensatz](https://github.com/Kyubyong/css10) steht im veröffentlichten Repository unter [Apache 2.0](https://github.com/Kyubyong/css10/blob/master/LICENSE) und benennt für Deutsch drei LibriVox-Bücher sowie den Leser Hokuspokus. Das ist eine konkretere Herkunftsangabe, aber **keine von uns beschaffte umfassende Sprecher-Einwilligung** für kommerzielle Stimmnutzung in Deutschland.

[LibriVox](https://librivox.org/pages/public-domain/) erklärt seine Aufnahmen als in den USA gemeinfrei und erlaubt dort auch Verkauf, weist aber ausdrücklich auf mögliche Unterschiede außerhalb der USA hin. Insbesondere wird daraus hier keine pauschal geklärte deutsche Leistungsschutz-/Persönlichkeitsrechtslage abgeleitet. Die Freigaben sind kommerziell kompatibel formuliert; die vollständige regionale Stimmrechtekette bleibt **„Noch offene Fragen“**. Diese isolierten Beispiele sind Hörprüfkandidaten, **keine kommerzielle Veröffentlichungsfreigabe** und keine Zusage exklusiver Rechte. Die allgemeinen Transparenz-/Kennzeichnungshinweise aus `VOICE_LICENSE_REVIEW.md` gelten weiter.

Die drei ursprünglich gewünschten Modelle CosyVoice3, Qwen3-TTS und Chatterbox bleiben wegen der erzwungenen Hugging-Face-Downloadgrenze **nicht ausgeführt**. Diese zusätzliche Stimme ersetzt deren Prüfung nicht. Es wurde keine Netzwerksperre umgangen: GitHub war regulär freigegeben und bietet diesen unabhängigen offiziellen Release an.

## Reproduzieren

Nach Prüfung der Modellquelle die oben benannten vier Archivdateien im separaten Modellordner bereitstellen. Der Generator lädt nichts automatisch herunter und akzeptiert ausschließlich die festgehaltenen Hashes.

```sh
.venv-audio/bin/python tools/bible-audio/benchmark/generate_css10.py --models /pfad/css10-model --out /tmp/css10-test
.venv-audio/bin/python tools/bible-audio/benchmark/analyze_samples.py --root /tmp/css10-test --output /tmp/css10-test/quality.json --asr-models /pfad/models
.venv-audio/bin/python -m unittest discover -s tools/bible-audio/benchmark -p 'test_*.py'
```

Die zusätzlichen Modellgewichte werden nicht in das Hör-ZIP oder den PWA-Cache kopiert. Keine neuen Python-Abhängigkeiten nötig. Keine API-Gebühren, kein Push, kein Deployment. Echte Hörprüfung, iPhone/Safari und die kommerzielle Freigabe bleiben offen; keine subjektive Natürlichkeitsnote aus ASR abgeleitet.

## Tatsächlich ausgeführte Qualitätsprüfung

Die Hauptaufnahme verwendet unveränderte Modell-Standardwerte: Dauerfaktor1,0, Noise0,3/0,3. 9Verse /21Sprechabschnitte wurden in18,491s Jobzeit erzeugt. Die beiden Passagen dauern48,208s und39,578s. FFmpeg dekodiert beide vollständig, gemessene Lautheit−20,85/−20,45LUFS, TruePeak−2,34/−2,51dBTP. Frische lokale ASR prüfte alle9Verse:24/133 und13/103 Wortabweichungen, zusammen37/236=15,68%. Das ist keine bestätigte Aussprachefehlerquote.

Eine zweite, tatsächlich erzeugte Einstellung mit Dauerfaktor1,08 dauert50,263s/41,417s; ASR24/133 und12/103, zusammen36/236=15,25%. Ein einzelner abweichender ASR-Treffer belegt keine relevante Verbesserung. Daher bleibt der unveränderte Modellstandard die Haupt-Hörprobe; die langsamere Variante liegt optional bei. Kein subjektiver Natürlichkeitssieger behauptet.

Thorsten C hatte bei denselben Texten35/236 ASR-Abweichungen(14,83%). Damit ist CSS10 technisch eine echte zweite Stimme, aber kein belegter Qualitätsgewinner. Hauptzweck dieses Pakets ist der tatsächliche Hörvergleich. Der vorhandene Standard wird nicht ausgetauscht.

Tests:12 Benchmark-/Adaptertests bestanden, darunter3 neue CSS10-Vertragstests. Die bestehende App bleibt gegenüber5990b43 unverändert. Physisches iPhone/Safari, eigene echte Hörprüfung und20–30-Minuten-Abnahme sind OFFEN. Lokale Chromium-Abspiel-/Offline-/Layout-/Axe-Ergebnisse liegen separat bei; kein Hörurteil daraus abgeleitet.
