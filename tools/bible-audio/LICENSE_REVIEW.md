# Rechteprüfung – Coqui-Thorsten-Kapitelvorlesung

Stand: 7. November 2026. Beurteilt wird ausschließlich `tts_models/de/thorsten/vits`, GitHub-Release `v0.7.0_models`, mit den unten bezeichneten Gewichten. Nicht auf andere Thorsten-, Piper-, XTTS- oder Coqui-Modelle übertragbar.

## Ergebnis und Nachweisgrenze

Die veröffentlichte Rechtekette ist **kommerziell kompatibel**: konkrete Apache-2.0-Modellfreigabe durch den offiziellen Coqui-Katalog; Thorstens eigene Aufnahmen unter CC0; gemeinfreier Luther-1912-Text; kommerziell verwendbare freie Synthesesoftware. Es wurde keine entgegenstehende Beschränkung der damit erzeugten Audiodateien gefunden. Piper wird nicht für diese Veröffentlichung verwendet.

Das ist eine quellenbasierte Bewertung, keine individuelle Rechtsgarantie. Insbesondere liegt kein signiertes Trainingsprotokoll mit Hashes sämtlicher Trainingsdateien oder aller möglichen Ausgangscheckpoints vor. Diese unabhängige forensische Rekonstruktion darf nicht mit der tatsächlich nachvollziehbaren veröffentlichten Modellfreigabe gleichgesetzt werden. Für einen strengeren unternehmensinternen Herkunftsnachweis wäre eine Bestätigung der Modellautoren der kleinste zusätzliche Schritt; es wurde niemand kontaktiert.

## Konkrete Quellen

| Bestandteil | Tatsächlich geprüfte Quelle | Aussage / Grenze |
| --- | --- | --- |
| Gewichte | [Offizieller Coqui-Modellkatalog](https://github.com/coqui-ai/TTS/blob/dev/TTS/.models.json), Eintrag `tts_models.de.thorsten.vits` | Autor `@thorstenMueller`, ausdrücklich `apache 2.0`, Release `v0.7.0_models`. Katalogfeld `commit` ist `unknown`; deshalb Dateien zusätzlich selbst gehasht. |
| Download | [Offizielles Release](https://github.com/coqui-ai/TTS/releases/tag/v0.7.0_models) und [konkretes ZIP](https://github.com/coqui-ai/TTS/releases/download/v0.7.0_models/tts_models--de--thorsten--vits.zip) | Verwendet wurde genau dieses archivierte ZIP. Seine Modelllizenz ist im Katalog dokumentiert; das Archiv selbst enthält Modell und Konfiguration, keinen zusätzlichen individuellen Audiovertrag. |
| Bestätigung Modellfamilie | [Thorsten-VITS-Karte](https://huggingface.co/Thorsten-Voice/VITS), [Veröffentlichung des Stimmprojekts](https://www.thorsten-voice.de/neuigkeiten/2022-06-23-neue-version-thorsten-tts-stimme-2022/) | Ebenfalls Apache 2.0; Coqui-VITS auf eigenen Aufnahmen. Die Hugging-Face-Dateien wurden nicht heruntergeladen oder als bytegleich ausgegeben. |
| Sprachaufnahmen | [CC0-Lizenz des Stimmprojekts](https://github.com/thorstenMueller/Thorsten-Voice/blob/master/LICENSE), [Erklärung zu allen eigenen Aufnahmen](https://thorsten-voice.de/ueber-das-projekt/aufnahmen/) | CC0, kommerziell kompatibel. Die lokale Konfiguration bezeichnet `Thorsten-neutral-Dec2021`, der Autorenbeitrag `Thorsten-22.05-neutral`. Der genaue Datensatz-Snapshot ist aus dem Checkpoint nicht beweisbar. Beide Hinweise gehören zum selben unter CC0 veröffentlichten Stimmprojekt. Kein unbekannter fremder Datensatz wird deshalb automatisch als geklärt behandelt. |
| Engine | [coqui-tts 0.28.0](https://pypi.org/project/coqui-tts/0.28.0/) und installierte Lizenzdateien | MPL-2.0. Kein Modelltraining, Voice-Cloning oder Piper-Audio als Referenz. |
| Laufzeit | PyTorch/Torchaudio 2.8.0+cpu; Gruut 2.4.0; gruut-lang-de 2.0.1; NumPy 2.5.4; SoundFile 0.14.0 | Installierte Metadaten und Lizenzdateipfade werden in `dependency-licenses.json` inventarisiert. BSD/MIT und bei weiteren Paketen auch LGPL; keine Pflicht, fertige MP3-Dateien deshalb unter diese Softwarelizenzen zu stellen. Inventar ersetzt keine Prüfung einer späteren Binärdistribution. |
| FFmpeg | Tatsächlich eingesetzte lokale Version 7.1.5; `ffmpeg -version` | Diese Systemfassung enthält GPL-Komponenten. Benutzung als lokales Werkzeug ist erlaubt; das FFmpeg-Programm wird nicht mit dem Hörpaket verteilt. Eine spätere Weitergabe der Binärprogramme benötigt gesonderte Erfüllung ihrer Bedingungen. |
| Bibel | [eBible Luther 1912](https://ebible.org/deu1912/copyright.htm), [Matthäus 1](https://ebible.org/deu1912/MAT01.htm), vorhandener FaithPath-Herkunftshinweis | Public Domain. Alle 25 Verse wurden gegen den über das Webwerkzeug ausgelesenen Text verglichen: identisch. Keine neuere Lutherrevision verwendet. Direkter Terminaldownload wurde vom Proxy mit 403 verweigert; keine behauptete originale HTML-Bytekopie. |
| Aussprache | Loccumer Richtlinien, Bibelwerk-Aussprachehilfe und benannte Wörterbuchartikel in `pronunciations.json` | Eigenes kleines Faktenlexikon. Keine fremden Audioaufnahmen, keine Übernahme eines vollständigen geschützten Wörterbuchs. Deutsche kirchliche Lesekonvention; Varianten und Hörabnahme bleiben dokumentiert. |

## Identifizierte Dateien

- Archiv SHA-256: `665f718c558693f5bd0747db19f4b5b4ce81b8903e48b7a51dd5f634475d7d6b`.
- Gewichte SHA-256: `ebb3792e89e261c92857ad1977f726bbaadfdf00d1b857dce4c44c393043de66`.
- Modellkonfiguration SHA-256: `f24e159768a8fc460764ccb163e37a08cd3c3d424bdb4f5a9e196636e58c0832`.
- FaithPath-Quelldatei `data/bibles/l1912/MAT.json`: `db29962beafc09050420b75e88242fc8c5951d7b3e6caa88ee75efb44d37c02b`.
- Katalogkopien, Lizenztexte und Abhängigkeitsinventar liegen im Lieferpaket. Die URLs auf `dev`/`master` sind bewegliche Quellen; die tatsächlich gesicherten Kopien werden zusätzlich im Paket gehasht.

## Pflichten nach Lieferart

**Nur fertiges Audio in FaithPath:** Die kommerziell kompatible Modellfreigabe und der gemeinfreie Text bilden die Grundlage. Keine gefundene Pflicht zur Offenlegung der FaithPath-App aus der Nutzung der Engine. Apache 2.0 beschreibt Software-/Modellweitergabe und ist keine allgemeine Aussage über urheberrechtliche Exklusivität rein synthetischer Audios. Keine erfundene exklusive Sprecheraufnahme behaupten. Verständliche Kennzeichnung „KI-Stimme, lokal erzeugt mit Coqui Thorsten VITS“ und Quellenhinweis mitführen.

**Modelle/Engine weitergeben:** Apache-Lizenz und vorhandene Urheber-/NOTICE-Hinweise mitführen; Änderungen kennzeichnen. MPL-Dateien einschließlich des angepassten Gruut-Formatters bleiben unter MPL-2.0 mit zugänglichem Quelltext. Das hier gelieferte Python-Modul trägt einen entsprechenden SPDX-Hinweis. Für tatsächlich mitverteilte LGPL/GPL-Binärteile gelten deren zusätzliche Bedingungen. Dieses Paket verteilt weder Modellgewichte noch Python-/FFmpeg-Binärprogramme.

**Piper:** Die bisherige Aufnahme bleibt als lokale Referenz erhalten, wird weder als Veröffentlichungskandidat verteilt noch als Trainingsmaterial verwendet. Die offene Lessac-Abstammung und Reichweite der Freigabe des konkreten früheren Piper-Modells werden durch die Coqui-Freigabe nicht gelöst.

## Noch nicht freigegeben

Eine positive Kompatibilitätsbewertung der veröffentlichten Lizenzen ist keine Hörabnahme. Die Aufnahme bleibt ein Prüf-Kandidat, bis seltene Namen, historische Formulierungen und mögliche Auslassungen vollständig gegengehört wurden. Kein automatischer Produktionsrelease und keine Massengenerierung.
