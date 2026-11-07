# FaithPath – Rechteprüfung deutscher TTS-Stimmen

Stand: **7. November 2026**. Quellenbasierte technische Prüfung, keine verbindliche juristische Begutachtung. Geprüft werden die bezeichneten Veröffentlichungen, nicht beliebige gleichnamige Modelle. Keine Veröffentlichung freigegeben.

## Entscheidungsmatrix

| Kandidat | Veröffentlichte Modell-/Softwarelizenz | Einstufung für diesen Auftrag |
| --- | --- | --- |
| Coqui Thorsten VITS, Release `v0.7.0_models`, Engine `coqui-tts 0.28.0` | Gewichte Apache-2.0; Engine MPL-2.0; Thorstens eigene Aufnahmen CC0 | **Kommerzielle Nutzung nachvollziehbar erlaubt** auf Grundlage der veröffentlichten Lizenzkette. Keine Garantie sämtlicher Trainingsdateien; zusätzliche Transparenz-/Produktfreigabe offen. |
| Thorsten-Voice/CosyVoice3; Kartenstand `5a34fb1` (Kurzrevision) | Fine-Tune und Basismodell Apache-2.0; Thorsten-Datensatz CC0 | **Noch offene Fragen:** konkrete Basiskomponenten, vollständige Revisionen/Dateihashes und Zusatzmodelle nicht installiert/geprüft. Kein festgestelltes kommerzielles Verbot. |
| Qwen3-TTS-12Hz-1.7B-VoiceDesign, Karten-/Dateibaumstand `5ecdb67`; `qwen-tts 0.1.1` | Gewichte, Software und 12-Hz-Tokenizer Apache-2.0 | **Noch offene Fragen:** keine vollständige Aufnahme-/Einwilligungskette im eingesehenen Bericht; konkrete lokale Modellfassung/Abhängigkeiten und spätere Stimmenfixierung ungeprüft. |
| Chatterbox Multilingual, Modellbaum `5bb1f6e`; PyPI `0.1.7` | Modellkarte und Software MIT | **Noch offene Fragen:** Rechte der konkreten Referenzstimme, Datenherkunft und benötigter Komponenten; V2/V3-Abweichung zwischen Paket und aktuellem Quelltext. |
| Frühere Piper-Fassung | Vorherige offene Modellabstammung wird hier nicht geklärt | **Nicht geeignet für die aktuelle Veröffentlichungsauswahl**, solange die bereits dokumentierte Rechtefrage offen ist. Kein pauschales Urteil über sämtliche Piper-Stimmen. |

Die Kurzrevisionen sind öffentlich angezeigte Metadaten, **keine vollständigen, lokal verifizierten Gewichts-Pins**. Keine der drei neuen Stimmen ist hier rechtlich oder klanglich als veröffentlichungsreif freigegeben. Eine Apache-/MIT-Freigabe ist ein relevanter Nutzungsgrant; fehlende Einzelnachweise beweisen umgekehrt keine Rechtsverletzung.

## 1. Coqui Thorsten VITS – tatsächlich benutzte Referenz

Der [offizielle Coqui-Katalog](https://github.com/coqui-ai/TTS/blob/dev/TTS/.models.json) ordnet `tts_models.de.thorsten.vits` Apache 2.0 und dem [Release v0.7.0_models](https://github.com/coqui-ai/TTS/releases/tag/v0.7.0_models) zu. Das [Stimmprojekt](https://thorsten-voice.de/ueber-das-projekt/aufnahmen/) erklärt seine eigenen Aufnahmen als CC0; [dessen Lizenzdatei](https://github.com/thorstenMueller/Thorsten-Voice/blob/master/LICENSE) wurde gesichert. Die Modellkonfiguration verweist auf Thorsten-neutral-Dec2021. Ein `ljspeech`-Formatter ist **kein** Nachweis, dass das fremde LJSpeech-Stimmkorpus verwendet wurde.

Gewichte SHA-256 `ebb3792e89e261c92857ad1977f726bbaadfdf00d1b857dce4c44c393043de66`; Konfiguration `f24e159768a8fc460764ccb163e37a08cd3c3d424bdb4f5a9e196636e58c0832`; Archiv `665f718c558693f5bd0747db19f4b5b4ce81b8903e48b7a51dd5f634475d7d6b`.

Diese veröffentlichte Kette trägt eine kommerziell kompatible Bewertung. Ein signiertes Trainingsprotokoll aller Ausgangsdateien liegt weiterhin nicht vor. Engine/MPL, Gruut/MIT, Torch/BSD, NumPy/BSD und weitere Pakete sind im vorhandenen Abhängigkeitsinventar dokumentiert. Der angepasste Gruut-Formatter behält MPL-2.0 und seinen Quelltext. Die frühere ausführliche Prüfung liegt unverändert in `../LICENSE_REVIEW.md`.

## 2. Thorsten CosyVoice3

[Autorenkarte](https://huggingface.co/Thorsten-Voice/CosyVoice3), [Basismodell](https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512), [Softwarelizenz am empfohlenen Code-Commit](https://github.com/FunAudioLLM/CosyVoice/blob/ace7c47/LICENSE), [Datensatz 2022.10](https://zenodo.org/records/7265581).

Die Fine-Tune-Karte benennt Apache 2.0, Thorsten 2022.10 und ein übernommenes HiFi-GAN-Modul. Der Zenodo-Datensatz wird in seiner Beschreibung ausdrücklich CC0 genannt. Für Thorstens eigene Stimme ist die Herkunft damit deutlich nachvollziehbarer als bei einer beliebigen Internet-Referenzstimme. **Der Fine-Tune allein ersetzt aber nicht die Prüfung seiner Basis.**

Zusätzlich nötig sind unter anderem Basiskonfiguration, Tokenizer, Vocoder und Sprecherinformationen. Das vollständige Dateiinventar und dessen Rechte wurden wegen des Downloadblockers nicht lokal überprüft. Die Software enthält Drittkomponenten, darunter Matcha-TTS. Ihre konkrete Weitergabekette darf nicht durch die Apache-Überschrift des Hauptprojekts ersetzt werden. Keine fremde Stimme wurde geklont. Keine kommerzielle Ausgabebeschränkung in den eingesehenen Autorenangaben gefunden; keine umfassende Gewähr für sämtliche Basis-Trainingsaufnahmen.

## 3. Qwen3-TTS VoiceDesign

[Modellkarte](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign), [Softwarelizenz](https://github.com/QwenLM/Qwen3-TTS/blob/main/LICENSE), [12-Hz-Tokenizer](https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz), [offizieller technischer Bericht](https://arxiv.org/html/2601.15621v1).

Die veröffentlichten Lizenzen sind kommerziell kompatibel. Der Bericht beschreibt mehr als fünf Millionen Stunden mehrsprachiges Training, enthält in den eingesehenen Abschnitten aber kein prüfbares Rechteverzeichnis jeder Aufnahme. Eine individuelle Sprecher-Einwilligung darf daraus nicht erfunden werden.

VoiceDesign ermöglicht einen eigenen fiktiven Sprecher anhand einer Beschreibung; vorgesehen ist ausdrücklich keine Imitation einer bekannten Person. Für eine dauerhaft identische Stimme beschreibt die [offizielle Anleitung](https://github.com/QwenLM/Qwen3-TTS) zusätzlich den Weg über eine einmal erzeugte synthetische Referenz und das Base-Modell. Das wäre ein **weiterer** Gewichts-/Tokenizer-/Provenienzprüfschritt. Derselbe Prompt allein garantiert keine unveränderte Sprecheridentität über 1.189 Kapitel. Ein eigener künstlicher Sprecher vermindert Referenzpersonenrisiken, löst aber nicht sämtliche Basis- oder Transparenzfragen.

## 4. Chatterbox Multilingual

[Modellkarte](https://huggingface.co/ResembleAI/chatterbox), [Software/MIT-Lizenz](https://github.com/resemble-ai/chatterbox/blob/master/LICENSE), [Multilingual-Quelltext](https://github.com/resemble-ai/chatterbox/blob/master/src/chatterbox/mtl_tts.py).

Die MIT-Freigabe erlaubt kommerzielle Softwarenutzung; die Modellkarte bezeichnet auch die Gewichte als MIT. Ihre Aussage über im Internet verfügbare Prompts ist **kein** Aufnahme- oder Einwilligungsnachweis. Die Herkunft der eingebauten Sprecherkonditionierung ist für unsere konkrete Nutzung nicht ausreichend dokumentiert. Eine eigene Referenzaufnahme braucht nachweisliche TTS-/Weiterverwendungsrechte und die entsprechende Erlaubnis der Person. Es wurde keine solche Stimme benutzt oder ohne Zustimmung nachgeahmt.

Das Paket benötigt unter anderem S3Tokenizer und PerTh. S3Tokenizer 0.3.0 nennt Apache 2.0 in den gelesenen PyPI-Metadaten, bestätigt durch die [offizielle Lizenzdatei](https://github.com/xingchensong/S3Tokenizer/blob/main/LICENSE). PerTh 1.0.1 hatte dort kein ausgefülltes Lizenzfeld; die zusätzlich gelesene [offizielle PerTh-Lizenz](https://github.com/resemble-ai/Perth/blob/master/LICENSE) nennt MIT. Damit ist diese konkrete Metadatenlücke eingeordnet; die komplette aufgelöste Abhängigkeitenkette wurde nicht installiert. Genannte Architektur-Vorbilder wie Llama sind nicht automatisch ein Nachweis übernommener Llama-Gewichte.

Die Modellkarte beschreibt eine eingebaute PerTh-Kennzeichnung. Sie wird bei einem späteren Test erhalten und nach MP3-Umwandlung auf Erkennbarkeit geprüft. Die dort beworbene Robustheit wurde hier nicht gemessen. Sie ersetzt keine Prüfung der eigenen gesetzlichen Rolle.

## 5. Pflichten bei Audio, Modellen und Software unterscheiden

- **Fertige MP3s:** Kein gefundenes Non-Commercial-Verbot bei den vier untersuchten Modellfreigaben. Softwarelizenzen machen Audios nicht automatisch zu GPL/MPL-Werken. Ebenso entsteht aus synthetischer Generierung nicht automatisch exklusives Urheberrecht am gesamten Klang. Keine Garantie über nicht belegte Drittansprüche.
- **Gewichte/Software weitergeben:** Apache-Lizenz, vorhandene NOTICE-/Urheberhinweise und Änderungsvermerke erhalten; bei MIT den Lizenz-/Copyrighttext beilegen. MPL-Regeln gelten für entsprechende bearbeitete Dateien. Konkrete LGPL/GPL-Binärweitergaben benötigen zusätzliche Erfüllung ihrer Bedingungen.
- **Nur lokal betreiben:** Keine laufenden API-Lizenzgebühren aus den gelesenen Freigaben. Hardware, Strom, Speicher und Prüfung bleiben reale Kosten. Die verwendete FFmpeg-Systemfassung enthält GPL-Komponenten; sie wird nicht als Binärprogramm im Paket verteilt.
- **Stimmrechte:** CC0/Apache/MIT sind keine pauschale Aufhebung von Persönlichkeits-, Datenschutz- oder Leistungsschutzrechten. Keine Werbeempfehlung durch den Sprecher suggerieren. Keine personenbezogenen Referenzaufnahmen ohne einschlägige Rechte verwenden.

## 6. Deutschland/EU im November 2026

Geprüft: [Art. 50 im offiziellen AI-Act-Service-Desk](https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50), [Kommissionsübersicht](https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems) und [Bundesnetzagentur-Leitfaden](https://www.bundesnetzagentur.de/EN/Areas/Digitalisation/AI/04_Transparency/guidelines/start.html). Der Service-Desk verweist auf den konsolidierten Stand vom 27. Juli 2026 und kennzeichnet Omnibus-Änderungen.

Art. 50 Abs. 2 betrifft Anbieter generierender KI-Systeme: synthetische Ausgaben müssen im technisch vorgesehenen Umfang maschinenlesbar markiert und als künstlich erzeugt erkennbar sein. Abs. 4 betrifft unter anderem Betreiber beim Einsatz von Deepfakes. **Nicht jede als künstlich ausgewiesene fiktive Erzählerstimme ist automatisch ein Deepfake.** Die genaue Rolle von FaithPath als MP3-Herausgeber, Betreiber oder Anbieter eines eigenen Generierungssystems muss vor Veröffentlichung anhand der tatsächlichen Architektur beurteilt werden.

Die Transparenzpflichten gelten grundsätzlich seit 2. August 2026. Der BNetzA-Leitfaden nennt für die Markierung/Erkennung bereits vor diesem Datum eingeführter generativer Systeme eine Übergangsfrist bis **2. Dezember 2026**. Daraus folgt keine pauschale Schonfrist für unser neues Produkt. Erkennbare und barrierefreie Hinweise sind vom technischen Herkunftsnachweis zu unterscheiden.

Für FaithPath vorgesehen: vor dem Abspielen sichtbarer Hinweis **„KI-generierte Vorlesung“**, Modell-/Quellenangaben, nachvollziehbare Generierungsmetadaten und Prüfung einer geeigneten maschinenlesbaren Markierung. ID3-Kommentare im vorliegenden Prüf-MP3 sind bereits gesetzt; sie allein wurden **nicht als rechtssicherer Robustheitsnachweis** zertifiziert. Coqui-Markierung, Rollenbewertung und spätere Bereitstellungsform bleiben ein Release-Gate. Für Chatterbox würde ein vorhandenes Wasserzeichen nicht entfernt.

## 7. Bibeltext und Nachweise

[eBible weist Luther 1912 als Public Domain aus](https://ebible.org/deu1912/copyright.htm). Verwendet wird ausschließlich der vorhandene FaithPath-Luther-1912-Text. Seine Lukas-Datei hat SHA-256 `97ff3222e6b211e3dbf6a8c11493ba41cfab7e3e3810484e69140b3214ae7f7d`. Keine Übertragung dieser Freigabe auf neuere Lutherrevisionen. Die neun Probeverse werden unverändert gegen die zuvor gesicherte offizielle Lukas-15-Textextraktion verglichen.

Das Hörpaket enthält die tatsächlich heruntergeladenen Lizenztexte, Metadaten und SHA-256-Inventare. Modellkarten wurden als Webquellen gelesen; eine vollständige originale Hugging-Face-Dateikopie oder ein installierter Snapshot wird nicht behauptet. Bevor ein neuer Kandidat veröffentlicht wird: vollständige Revisionen und Dateihashes sichern, Zusatzkomponenten/Referenzrechte abschließen, Transparenzkonzept prüfen, Hörabnahme durchführen. Niemand wurde ohne Auftrag kontaktiert.
