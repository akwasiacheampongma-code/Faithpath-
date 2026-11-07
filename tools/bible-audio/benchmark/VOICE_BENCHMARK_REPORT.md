# FaithPath – Ergebnis des Stimmen-Benchmarks

**7. November 2026 · Teilbenchmark mit echtem Audio; keine abschließende Stimmenauswahl.**

Die drei gewünschten neuen Modelle konnten in dieser Umgebung nicht ausgeführt werden. Der verwaltete Proxy verweigert Hugging-Face-Verbindungen mit HTTP 403; Modellgewichte sind hier nicht vorhanden. Deshalb gibt es **keinen nachgewiesenen Klanggewinner zwischen CosyVoice3, Qwen3-TTS, Chatterbox und Coqui**. Dokumentationsversprechen oder fremde Modell-Benchmarks werden nicht als eigene Hörresultate ausgegeben.

Tatsächlich geliefert werden vier vollständige Passagen-MP3s: die unveränderte Coqui-C-Stimme für Lukas 15,20–24 und 29–32 sowie dieselben Passagen mit einer **neu lokal erzeugten** Rhythmusvariante. Das ist **eine Stimme mit zwei Einstellungen**, nicht vier Stimmen. Die neue Fassung ersetzt C nicht.

## 1. Git- und Funktionsschutz

- Branch `feature/tts-voice-model-benchmark-20261107`.
- Ausgangscommit `012d0836eb7ebef347ed91b923dc0fbb148350a8`, vorherige Lukas-15-Arbeit.
- Werkzeugcommit `c768493c91521312b227581e4537b0c0ece36dca`; abschließender Dokumentationscommit im mitgelieferten `VERSION.json`.
- Neue Dateien ausschließlich unter `tools/bible-audio/benchmark/`. Kein App-Router, Speichermodell, Bibeltext, Quizinhalt, bestehendes Profil oder altes Audio überschrieben.
- Keine Veröffentlichung, kein Push/PR, kein Merge, keine kostenpflichtige API und keine Cloud-GPU.

Die bereits vorhandene Coqui-C-Kapitel-MP3 wird im Paket zusätzlich bytegleich als Referenz mitgeliefert: SHA-256 `3912e8d6f0ca64a822590f6b9838c71d0a12f4f23ccad404a5cb040a3050c636`. Ihr vollständiges Kapitel dauert rund 4:15 Minuten; daraus folgt kein Nachweis für 20–30 Minuten angenehmes Zuhören.

## 2. Umgebung und konkreter Blocker

Linux x86-64, Python 3.12.14, **3 CPU-Kerne, rund 9,7 GiB RAM, keine verfügbare GPU**, rund 24 GiB freier Plattenplatz beim Erstcheck. Vorhanden: Torch 2.8.0+cpu, Coqui-TTS 0.28.0, Transformers 5.22.2, Sherpa-ONNX 1.13.8, FFmpeg 7.1.5. Exakte tatsächlich gelesene Paketversionen stehen in `qa/environment.json`.

Die erste eingeschränkte Terminalabfrage scheiterte bereits an der Proxyverbindung. Eine anschließend zugelassene öffentliche HEAD-Abfrage mit unveränderten Proxy-Einstellungen lieferte am **7.11.2026 um 18:22:32 UTC** `CONNECT tunnel failed, response 403` / `HTTP/1.1 403 Forbidden`. Die Beobachtung ist in `qa/huggingface-head-observation.json` als Übertragung der tatsächlichen Toolausgabe dokumentiert; sie wird nicht als originale Netzwerk-Byteaufzeichnung bezeichnet. Die wirksam erzwungene Domain-Allowlist enthält Hugging Face und ModelScope nicht. Keine Sperre umgangen, keine Ersatzspiegel benutzt.

**Kleinster nächster Schritt:** In den Einstellungen dieser Arbeitsumgebung Downloads von `huggingface.co`, `*.huggingface.co` und den benötigten offiziellen Datei-/Xet-Hosts unter `*.hf.co` erlauben. Falls die später beobachteten Weiterleitungen zusätzliche Domains benötigen, diese konkret prüfen. Das ist eine Umgebungsfreigabe, keine Produktionsfreigabe. Auf dieser CPU-Maschine wären danach Speicherverbrauch und Laufzeit zunächst praktisch zu messen; eine GPU wird nicht als bereits nachgewiesen zwingend behauptet.

## 3. Modellinventur: geprüft, vorbereitet, tatsächlich ausgeführt

| Modell | Dokumentierter Stand | Eigene Ausführung | Befund |
| --- | --- | --- | --- |
| Thorsten CosyVoice3 | Fine-Tune auf Fun-CosyVoice3-0.5B-2512; Autoren-Codebasis `ace7c47`; Modellkarten-Kurzrevision `5a34fb1` | **BLOCKIERT** | `llm.pt` + `flow.pt` allein genügen nicht. Basismodell/Vocoder/Tokenizer/Sprecherinformationen fehlen lokal. Der offizielle Container lädt beim ersten Start ebenfalls von Hugging Face. |
| Qwen3-TTS VoiceDesign 1.7B | `qwen-tts 0.1.1`; Modellbaum `5ecdb67`, dort ca. 4,52 GB | **BLOCKIERT** | Offizielle VoiceDesign-Schnittstelle und echtes Paket statisch geprüft. Deutscher, eigenständiger Sprecher grundsätzlich dokumentiert; Stimme, Tempo, CPU-RAM und lange Texte hier ungeprüft. |
| Chatterbox Multilingual | Paket `0.1.7`; aktueller Modellbaum `5bb1f6e` | **BLOCKIERT** | Aktuelle Karte/GitHub unterstützen V3; PyPI-Wheel lädt V2 und hat eine andere Lade-Signatur. Referenzstimmrechte vor Nutzung klären. Kein Test der englischen Klasse als angeblicher deutscher Vergleich. |
| Coqui Thorsten VITS C | Exakt gehashter Release `v0.7.0_models`, bestehende Aufnahme | **AUSGEFÜHRT / erneut technisch geprüft** | Zwei vollständige Passagen aus vorhandenem C-Kapitel extrahiert, kein neues Modell behauptet. |
| Coqui Thorsten VITS Balanced | Derselbe Checkpoint, neues separates Profil | **NEU GENERIERT** | Neun ausgewählte Verse, zwei vollständige Passagen; technische und ASR-Prüfung tatsächlich ausgeführt. |

Die beiden offiziellen PyPI-Wheels wurden mit ihren veröffentlichten SHA-256 heruntergeladen und **nur statisch** untersucht. Qwen verlangt Transformers 4.57.3; Chatterbox 5.2.0 und Torch/Torchaudio 2.6.0. Beides passt nicht als ungeprüfte Zusatzinstallation in die funktionierende Coqui-Umgebung. Isolierte Installationsrezepte sind dokumentiert; keine erfolgreiche Installation oder Inferenz wird behauptet. CosyVoice-Rohrequirements enthalten zusätzlich GPU-Pakete und empfehlen Python 3.10/3.11. Der geprüfte Docker-Startcode bestätigt den verbleibenden HF-Downloadbedarf. Vollständige Dateihashes stehen im Forschungsinventar des Pakets; vollständige neue Gewichts-Pins fehlen ausdrücklich.

Weitere betrachtete Alternative: [MeloTTS](https://github.com/myshell-ai/MeloTTS). Die offizielle Sprachliste enthält keine deutsche Stimme; daher kein erfundener deutscher Vergleich. Piper bleibt wegen der bereits offenen konkreten Lizenzkette außerhalb der Veröffentlichungsauswahl.

## 4. Gleiche Texte und echte Optimierungsrunde

Die Originalquelle ist `data/bibles/l1912/LUK.json`, SHA-256 `97ff3222e6b211e3dbf6a8c11493ba41cfab7e3e3810484e69140b3214ae7f7d`. Das Kapitel enthält 32 fortlaufende Verse. Alle 32 wurden erneut gegen die **zuvor** gesicherte offizielle eBible-Textextraktion verglichen: identisch. Das ist kein behaupteter neuer HTML-Download. Die ausgelieferten Passagen enthalten genau Verse **20,21,22,23,24** bzw. **29,30,31,32**. Keine Versnummern gesprochen, keine Bibelwörter ersetzt, keine Sätze umgestellt.

| Tatsächliche VITS-Einstellung | C – Referenz | Balanced – neuer Versuch |
| --- | --- | --- |
| `length_scale` | 1,50 | 1,42 |
| Satzpause | 0,34 s | 0,30 s |
| Doppelpunkt-/Dialogpause | 0,42 s | 0,38 s |
| Verspause | 0,32 s | 0,28 s |
| Fortsetzungspause | 0,18 s | 0,16 s |

Noise-Skalen, Lexikon, Seedverfahren, 90-ms-Schutzränder und Modell bleiben gleich. Es werden nur reale VITS-Attribute und die bestehende Audio-Pausenschicht verwendet. Kein erfundener Emotions- oder SSML-Regler. Balanced prüft die konkrete Hypothese „weniger gedehnter Rhythmus ohne Verständlichkeitsverlust“.

**Messung am neu erzeugten Job:** 9 Verse / 15 Sprachsegmente, **79,824 s Audio in 61,171 s Gesamtjobzeit**, RTF rund 0,77 auf dieser CPU-Umgebung. Darin sind Modellinitialisierung und Verarbeitung enthalten. Beim erneuten Aufruf wurde der vollständige verifizierte Cache erkannt; keine neue Synthese und keine Änderung alter Dateien. Peak-RAM, Hardwareenergie und echte Smartphone-Synthese wurden nicht gemessen.

C enthält 32 Verse / 255,025 s Audio; die dort gespeicherten 176,46 s Generierungszeit stammen aus dem **früheren vollständigen Job**. Sie sind kein zeitgleich gemessener 9-Vers-Gegentest. Aus dem Unterschied darf keine dreifache Beschleunigung konstruiert werden. Für die drei neuen Modelle gibt es keine eigenen RTF- oder RAM-Werte. Die Autoren veröffentlichen CPU-/GPU-Beispiele; diese werden hier nicht als unsere Messergebnisse übernommen.

## 5. Tatsächliche Audio- und ASR-Ergebnisse

Gemessen an den **gelieferten MP3s**, nicht nur an Synthetisierungseingaben. Lokale Whisper-base-int8-ASR, Deutsch, ein Thread, alle neun Verse je Fassung. Orthografische ß/ss- und Ziffernnormalisierung nur für den Erkennungsvergleich.

| Fassung / Passage | Dauer | Integrierte Lautheit | True Peak | ASR-Abweichungen |
| --- | ---: | ---: | ---: | ---: |
| C · 20–24 | 47,676 s | −20,43 LUFS | −2,81 dBTP | 18 / 133 Wörter (13,53 %) |
| C · 29–32 | 36,702 s | −20,57 LUFS | −2,46 dBTP | 17 / 103 Wörter (16,50 %) |
| Balanced · 20–24 | 45,194 s | −21,74 LUFS | −1,43 dBTP | 22 / 133 Wörter (16,54 %) |
| Balanced · 29–32 | 35,040 s | −21,67 LUFS | −3,74 dBTP | 19 / 103 Wörter (18,45 %) |

Zusammen: C **35/236 = 14,83 %**, Balanced **41/236 = 17,37 %** normalisierte ASR-Wortabweichungen. Balanced ist insgesamt etwa **4,9 % kürzer**, hat aber keinen nachgewiesenen Verständlichkeitsgewinn. Daher **nicht als neuen Standard übernommen**. Die zusätzlichen Hinweise rechtfertigen keine endlose Coqui-Parametersuche, bevor die aussichtsreichen neuen Modelle überhaupt getestet werden können.

Die längste automatisch erkannte Ruhephase unter RMS 0,003 beträgt in diesen Proben rund 0,44–0,45 s. Das beweist keine natürliche Phrasierung. Kein dekodiertes Sample-Clipping festgestellt; True Peaks bleiben unter 0 dBTP. Balanced überschreitet in der ersten Passage den beabsichtigten −1,5-dB-Sicherheitswert um 0,07 dB nach MP3-Kodierung; das ist offen dokumentiert, kein als perfekt erreichter Zielwert. Das −20-LUFS-Ziel wird bei Balanced wegen der bestehenden Peakbegrenzung verfehlt.

**Wichtig für die Hörentscheidung:** Balanced ist rund 1,1–1,3 LU leiser als C. Das ist keine vollständig pegelabgeglichene Blindstudie. Die Dateien bleiben als nachvollziehbare Originalausschnitte erhalten; für eine spätere Blindstudie separate, transparent bezeichnete Pegelabgleichskopien erzeugen. Der Lautheitsunterschied darf nicht als Qualitätsgewinn verkauft werden.

Erkennungsauffälligkeiten betreffen u.a. historische Formen wie „jammerte“, „küßte“, „Fingerreif“, „gemästet“ und „Gebot“. Die vollständigen Referenz-/ASR-Zeilen liegen in `qa/audio-results.json`. **Eine ASR-Abweichung bestätigt weder ein fehlendes Wort noch einen Aussprachefehler.** Die Pipeline beweist die vollständige Eingabe/Verszuordnung; die tatsächliche vollständige korrekte Aussprache bleibt gegenzuhören. Das Modell meldete beim neuen Lauf zudem zwei nicht vorhandene IPA-Kombinationszeichen; der protokollierte Warnhinweis wird nicht als gelöst ausgegeben. Kein ungeprüfter Lexikonumbau.

## 6. Gewichtete Hörbewertung

| Kriterium | Gewicht | Status |
| --- | ---: | --- |
| Natürlichkeit | 30 % | **OFFEN**, keine eigene echte Hörprüfung |
| Aussprache / Verständlichkeit | 25 % | **OFFEN**, ASR nur ergänzend |
| Angenehmes längeres Zuhören | 20 % | **OFFEN**, keine 20–30-Minuten-Studie |
| Betonung / Dialoge | 15 % | **OFFEN**, keine aus Pausenmaßen erfundene Wertung |
| Technische Audioqualität | 10 % | Messwerte vorhanden, subjektiver Hörbogen bleibt leer |

Keine Gesamtnote, kein künstliches MOS und kein behaupteter bester Klang. Der Rechner verweigert eine Gesamtwertung, wenn irgendeine bewertete Kategorie fehlt. `LISTENING_SHEET.csv` enthält leere Felder für zehn Prüfer, getrennte Passagen und Kommentare. Nicht ausgeführte Modelle haben keine Audioplayer oder erfundenen Scores. Kriterien und Verfahren stehen in `LISTENING_PROTOCOL.md`.

## 7. Testmatrix und Grenzen

| Prüfung | Ergebnis | Nachweis im Paket |
| --- | --- | --- |
| Bestehende App-Regression | **264 bestanden** | `logs/app-tests-unrestricted.log` |
| Bestehende Audio-Python-Tests | **36 bestanden** | `logs/audio-unit-tests.log` |
| Bestehender Reader-Player | **7 bestanden** | `logs/reader-direct-tests.log` |
| Neue Benchmark-Tests | **9 bestanden** | `logs/benchmark-unit-tests.log` |
| Original-PCM-/Quell-/Dateihashes | **Bestanden** | Manifeste, Tests, unabhängige Review-Zusammenfassung |
| Lokale MP3-Dekodierung / Abspielzeit / nur ein Player | **Bestanden** | `qa/browser-results.json` |
| Offline-Wiedergabe eingebetteter MP3s | **Bestanden, Chromium/Linux** | gleicher Browserbericht |
| 320/375/390/430 px, 100 % und 200 % Text | **Bestanden nach Korrektur** | Browserbericht / Screenshots |
| Axe WCAG-A/AA-Regeln | **0 gemeldete Verstöße** | `qa/accessibility.json`; keine komplette manuelle WCAG-Zertifizierung |
| Bestehendes Linting | **0 Fehler, 5 bestehende Warnungen** | `logs/lint.log`; neue Python-Tools werden nicht vom App-ESLint erfasst |
| Unveränderter App-Build | **Bestanden, 282 Dateien** | `logs/app-build-unrestricted.log` |
| Legacy-Vollkapitelprüfer am neuen 9-Vers-Probejob | **9 PASS / 2 FAIL, erwartete Umfangsabweichung** | `logs/new-job-verification.log`: fordert 32 Verse/`complete=true`; die Probe wird korrekt als unvollständig ausgewiesen. Kein als bestanden ausgegebener Vollkapiteltest. |
| Neue drei Modelle / deren Installation / deren Audio | **BLOCKIERT / NICHT AUSGEFÜHRT** | Downloadbeobachtung, Paket-/Quellinventar |
| Physisches iPhone, Safari, VoiceOver, Kopfhörer, 20–30 Minuten | **OFFEN** | manuelle Höranleitung |

Der erste App-Testlauf im Sandbox-Prozessmonitor meldete `spawnSync python3 EPERM`, obwohl der Validator in dessen Ausgabe bestand. Der Build meldete entsprechend `spawnSync git EPERM`. Dieselben unveränderten Prüfungen mit erlaubten Unterprozessen bestanden. Die ursprünglichen Fehlerlogs bleiben erhalten. Chromium verweigert lokale `file://`-Navigation administrativ; die abschließende Browserprüfung erfolgte über den eigenen temporären Loopback-HTTP-Server. Das ist kein iPhone-Nachweis.

Die neue Galerie hatte bei 320 px/200 % Text einen reproduzierten Überlauf durch lange Text-/Überschriftenstücke. Korrigiert wurden Umbruch, Silbentrennung, Boxmodell und Player-Mindestbreite **nur in der isolierten Galerie**. Vorher-Screenshot und endgültige Screenshots liegen bei. Keine App-Neugestaltung.

Der erfolgreiche App-Build behält absichtlich die vorhandene Build-ID `FP4-20261104-G-SIMPLE-STEPS-QA1`. Content-Hash `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309`. Das Hörpaket wird nicht in die PWA eingebaut oder automatisch gecacht. Ein neuer App-Service-Worker-Update-/Safari-Lauf wurde in diesem isolierten Audiowerkzeugauftrag nicht behauptet.

## 8. Rechtebewertung und Empfehlung

Details und offizielle Quellen: **`VOICE_LICENSE_REVIEW.md`**. Die veröffentlichte Coqui/Thorsten-Kette ist unter den tatsächlich benutzten Fassungen am besten konkret dokumentiert: Gewichte/Archiv identifiziert, eigene Thorsten-Aufnahmen CC0, freie kommerziell kompatible Engine, gemeinfreier Bibeltext. Das ist weder eine pauschale Rechtsgarantie noch eine vollständige KI-Transparenz-/Hörfreigabe.

Für die neuen Modelle sind Apache/MIT-Freigaben dokumentiert, aber konkrete Komponenten, Referenzrechte und/oder vollständige Fassungsnachweise bleiben offen. Die 2026 geltenden europäischen Transparenzpflichten werden getrennt von Modell- und Stimmrechten behandelt. Ein MP3-Kommentar allein ist keine behauptete vollständige Erfüllung von Art. 50.

**Praktische Empfehlung:** Coqui C vorerst als unveränderte technische Referenz behalten. Nach Freigabe der notwendigen Downloadziele zuerst **Thorsten CosyVoice3** mit identischen Passagen testen: dokumentierte Thorsten-Stimmherkunft und dieselbe Sprecherfamilie machen ihn zu einem sachlich guten nächsten Versuch. Danach Qwen VoiceDesign für eine eigenständige FaithPath-Stimme prüfen; anschließend Chatterbox mit geklärter Referenz und konsistenten V2-/V3-Fassungen. Diese Reihenfolge ist eine **Testpriorität, kein Klangranking**.

| Abschlussfrage | Nachweisbare Antwort |
| --- | --- |
| Welche Stimme klingt am besten? | **Noch nicht bestimmbar.** Neue drei Modelle nicht ausgeführt; subjektive Hörkriterien offen. |
| Welche ist kommerziell am zuverlässigsten dokumentiert? | Im vorhandenen konkret identifizierten Bestand **Coqui Thorsten VITS**; neue Freigaben noch nicht vollständig für unsere Artefakte nachvollzogen. |
| Welche läuft dauerhaft ohne API-Gebühren? | Coqui lokal **nachgewiesen**. Neue drei Modelle sehen lokalen Betrieb mit kompatiblen veröffentlichten Lizenzen vor; hier nicht praktisch belegt. Kein Modell benötigt zwangsläufig einen kostenpflichtigen Cloud-Vertrag. |
| Welche eignet sich für 1.189 Kapitel? | Die vorhandene Kapitel-/Cachearchitektur unterstützt diese Quellen. **Keine Stimme für alle Kapitel freigegeben**; Stimmstabilität, Namen, lange Kapitel und redaktionelle Audioabnahme fehlen. |
| Risiken? | Downloadblocker, ungeprüfte CPU-Ressourcen neuer Modelle, unvollständige konkrete Lizenz-/Referenzkette, ASR-Hinweise, Pegelunterschiede, subjektive Qualität und Geräteprüfung. |

**Entscheidung: NO-GO für endgültige Stimmenwahl, Massengenerierung und Veröffentlichung. GO ausschließlich für die lokale manuelle Prüfung des klar bezeichneten Teilpakets.** Die Freigabe der Domainverbindungen ermöglicht den fehlenden eigentlichen Modellvergleich; es wird keine endgültige Produktionsentscheidung vorweggenommen.
