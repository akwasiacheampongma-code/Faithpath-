# FaithPath – echten KI-Stimmenvergleich fortsetzen

## Verbindlicher Einstieg

Repository: `akwasiacheampongma-code/Faithpath-`

Arbeitsbranch: `feature/tts-voice-model-benchmark-20261107`

Repository-URL: https://github.com/akwasiacheampongma-code/Faithpath-

Bekannter geprüfter Implementierungsstand: `717b7ecbbdc9f7515f3f22406fa357f71aa8eb02`. Der Branch enthält zusätzlich dieses Fortsetzungsdokument. Ermittle und protokolliere den tatsächlichen aktuellen GitHub-HEAD. Nicht auf main oder einem älteren App-Branch arbeiten.

Falls noch kein Checkout vorhanden ist:

```sh
git clone --branch feature/tts-voice-model-benchmark-20261107 --single-branch https://github.com/akwasiacheampongma-code/Faithpath-.git Faithpath-tts
cd Faithpath-tts
git status --short --branch
git log -3 --oneline
```

Bei vorhandenem Checkout zuerst lokale Änderungen prüfen und schützen. Keine ungesicherten Änderungen übernehmen oder überschreiben. Nur reguläre Fast-Forward-Aktualisierung; keine erzwungenen Ref-Änderungen.

## Ziel

Finde eine natürliche, warme, verständliche und kommerziell nachvollziehbar nutzbare deutsche KI-Bibelstimme für FaithPath. Die spätere Generierung soll lokal, ohne laufende API-Gebühren, kapitelweise für alle 66 Bücher funktionieren.

Arbeite eigenständig bis zu tatsächlich erzeugten und abspielbaren Hörproben, soweit die verfügbaren Ressourcen und Zugriffsrechte dies ermöglichen. Keine kostenpflichtigen APIs, Cloud-GPUs, Abonnements oder Käufe. Keine vollständige Bibel generieren.

## 1. Den vorhandenen Stand vollständig prüfen

Lies zuerst:

- `tools/bible-audio/README.md`
- `tools/bible-audio/benchmark/README.md`
- `tools/bible-audio/benchmark/VOICE_BENCHMARK_REPORT.md`
- `tools/bible-audio/benchmark/VOICE_LICENSE_REVIEW.md`
- `tools/bible-audio/benchmark/CSS10_FOLLOWUP.md`
- `tools/bible-audio/benchmark/candidate-status.json`
- `tools/bible-audio/profiles/C-hoerbuch.json`

Bisher tatsächlich erzeugt wurden Coqui Thorsten VITS (vollständiges Lukas 15, insbesondere Hörbuchprofil C), CSS10/Neon für Lukas 15,20–24 und 29–32 sowie eine langsamere CSS10-Testfassung. Zwei Rhythmusprofile derselben Stimme sind kein Vergleich verschiedener Stimmen. CSS10 ist nicht als kommerziell vollständig geklärt freigegeben. Ein subjektiver Klanggewinner wurde nicht festgestellt. Echte iPhone-/Safari- und längere Hörtests sind offen.

Die drei Wunschmodelle unten wurden bisher **nicht ausgeführt**, weil der verwaltete Proxy ihre Downloads mit HTTP 403 blockierte.

**GitHub enthält Quellcode, Profile, Lizenzberichte und ausgewählte Prüfdaten. Modellgewichte, MP3-/WAV-Dateien, virtuelle Python-Umgebungen und die bisherigen Hör-ZIPs sind nicht Bestandteil dieses Branches.** Behaupte nicht, diese Dateien nach dem Klonen automatisch vorzufinden.

Suche gegebenenfalls in der aktuellen Arbeitsumgebung oder bereitgestellten Anhängen nach:

- `FaithPath_Stimmenvergleich_20261107.zip`
- `FaithPath_Zweite_Stimme_CSS10_20261107.zip`

Fehlende Referenzen ausdrücklich dokumentieren. Ohne vorhandenes Audio keinen Hörvergleich behaupten. Falls nötig, die Coqui-C-Referenz mit der vorhandenen geprüften Pipeline, dem fixierten Modell und `profiles/C-hoerbuch.json` separat neu erzeugen. Eine Neuerzeugung als solche kennzeichnen; keine plattformübergreifende Bytegleichheit versprechen. Keine vorhandenen Aufnahmen überschreiben.

## 2. Netzwerk und Hardware als Erstes tatsächlich prüfen

Prüfe aktuelle angewendete Netzwerkfreigaben, CPU, RAM, GPU, freien Speicher, Python und vorhandene Abhängigkeiten. Die alte Umgebung hatte drei CPU-Kerne, rund 10 GB RAM und keine GPU; das ist kein Nachweis über die neue Umgebung.

Benötigte offizielle Downloadziele sind insbesondere `huggingface.co`, `*.huggingface.co` und die tatsächlich verwendeten Download-/Xet-Hosts unter `*.hf.co`. Prüfe Weiterleitungen konkret. Eine gespeicherte oder gewünschte Freigabe ist nicht automatisch auf die laufende Instanz angewendet.

Prüfe den tatsächlichen Zugriff auf die offiziellen Modelladressen mit frischen Verbindungen. Verwende die vorgegebenen Proxy- und TLS-Einstellungen. Keine Sperren umgehen. Nutze Umgebungsänderung oder Neustart nur über tatsächlich vorhandene vorgesehene Werkzeuge und behaupte keinen nicht erfolgten Neustart.

Falls die drei Adressen weiterhin vom Proxy abgelehnt werden: genau eine aktuelle Prüfung dokumentieren, Status/fehlende Freigabe benennen und die Downloadversuche stoppen. Keine wiederholten aussichtslosen Versuche, keine weiteren Coqui-Parameterproben als Ersatz für den fehlenden Modellvergleich ausgeben. Ein GitHub-Branch allein ändert die Netzwerkfreigaben nicht.

## 3. Diese Modelle wirklich ausführen

1. **Thorsten CosyVoice3:** https://huggingface.co/Thorsten-Voice/CosyVoice3
2. **Qwen3-TTS VoiceDesign:** https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
3. **Chatterbox Multilingual:** https://huggingface.co/ResembleAI/chatterbox

Beginne möglichst mit CosyVoice3. Nutze getrennte Python-Umgebungen; erhalte die funktionierende Coqui-Installation. Weitere Modelle nur bei nachvollziehbarem Mehrwert ergänzen.

Bekannte Fallen:

- CosyVoice benötigt passende Basiskomponenten zusätzlich zum Thorsten-Fine-Tune.
- Qwen VoiceDesign ist nicht CustomVoice.
- Chatterbox Multilingual ist nicht die englische Standardklasse.
- Chatterbox-PyPI und aktueller GitHub-Code können unterschiedliche V2-/V3-Schnittstellen haben.
- Trainings-GPU-Anforderungen sind nicht automatisch Inferenzanforderungen.
- Das Thorsten-Gruut-IPA-Lexikon nicht ungeprüft an andere Modellfrontends übertragen.

Verwende ausschließlich tatsächlich unterstützte Parameter. Keine erfundenen SSML-/Emotionsregler, keine ungeprüften Modellskripte oder unnötigen Abhängigkeiten.

## 4. Gleiche Originaltexte und konkrete Optimierung

Verwende den unveränderten Luther-1912-Text aus `data/bibles/l1912/LUK.json`:

- Lukas 15,20–24, vollständig mit allen fünf Versen.
- Lukas 15,29–32, vollständig mit allen vier Versen.

Prüfe alle neun Verse und ihre Reihenfolge. Erzeuge pro erfolgreich ausführbarer Stimme beide Passagen als MP3. Ziel ist ein ruhiger, warmer deutscher Erzähler mit verständlichen Dialogübergängen und angenehmem Hörbuchrhythmus.

Keine Imitation realer Personen ohne entsprechende Erlaubnis. Bei Referenzstimmen die einschlägigen Rechte nachvollziehbar prüfen. Qwen darf eine eigenständige fiktive Stimme gestalten. Stimme und Modellfassung für spätere Wiederverwendung dokumentieren.

Erzeuge zunächst eine dokumentierte Ausgangsfassung. Prüfe fehlende/doppelte/vertauschte Wörter, Ausspracheauffälligkeiten, unnatürliche Pausen, abgeschnittene Silben, Artefakte, Dynamik und Stimmkonsistenz. Nutze lokale ASR ergänzend; ihre Abweichungen sind Prüfhinweise, keine automatisch bestätigten Sprachfehler.

Verbessere gezielt nachweisbare Probleme, generiere erneut und vergleiche. Keine endlosen Versuche ohne belastbaren Fortschritt. Für Hörvergleiche möglichst gleiche Lautheit verwenden; Originalaufnahmen erhalten und Pegelabgleichskopien gesondert kennzeichnen.

## 5. Rechteprüfung und ehrliche Bewertung

Aktualisiere `VOICE_LICENSE_REVIEW.md` anhand offizieller Quellen und konkreter Versionen. Prüfe Modellgewichte, Software, Zusatzmodelle, Abhängigkeiten, Herkunft/Rechte der Aufnahmen, Referenzstimmen, generierte Ausgaben, Namensnennung, Lizenz-/NOTICE-Pflichten und Deutschland-/EU-Transparenzpflichten 2026.

Eine Apache-/MIT-Überschrift allein beweist keine vollständige Stimmrechtekette. Einstufung je Kandidat: **Kommerzielle Nutzung nachvollziehbar erlaubt / Noch offene Fragen / Nicht geeignet**. Keine verbindliche juristische Prüfung oder Produktionsfreigabe behaupten.

Bewertungskriterien: Natürlichkeit 30 %, Aussprache/Verständlichkeit 25 %, angenehmes längeres Zuhören 20 %, Betonung/Dialoge 15 %, technische Audioqualität 10 %.

Keine erfundenen Hörnoten, MOS oder Gesamtnoten. Ohne echte Hörprüfung bleiben subjektive Kriterien offen. Kurze Passagen beweisen keine Eignung für 20–30 Minuten Zuhören. Eigene Messungen, Autorenangaben, Prognosen und nicht geprüfte Punkte klar trennen.

## 6. Architektur, Lieferung und Grenzen

Bewahre kapitelweise Generierung, Modellrevisionen/SHA-256, reproduzierbare Sprecherprofile, modellgerecht unterstützte Aussprachehilfen, Segmentcache, Wiederaufnahme, unveränderte Bibeltexte, Metadaten und Zeitmarken. Keine Massengenerierung.

Liefere echte MP3s aller erfolgreich getesteten Stimmen, lokale HTML-Hörgalerie mit korrekten Namen, Vergleich mit tatsächlich vorhandener oder klar neu erzeugter Coqui-C-Referenz, Qualitäts-/Lizenzbericht, Skripte, Installationsanleitung, gemessene Laufzeiten/Ressourcen, Tests/Hashes, lokales ZIP und begründete Empfehlung samt offenen Risiken.

Nicht ausgeführte Modelle sichtbar markieren; keine Platzhalter oder fremden Aufnahmen unter deren Namen. Geräte-/Hörabnahmen ausdrücklich offenlassen, wenn nicht ausgeführt.

Arbeite mit nachvollziehbaren Commits ausschließlich auf dem genannten Feature-Branch. Erhalte die App und sämtliche persönlichen Daten. Keine Änderungen an Design, Speicherschema, Bibel-/Quizbestand oder Fortschrittsregeln. **Kein Merge nach main, kein Produktionsdeployment, keine Veröffentlichung oder endgültige Stimmenentscheidung ohne ausdrückliche Freigabe.**

Beginne jetzt mit der aktuellen Zustands-/Netzwerkprüfung und führe anschließend die tatsächlich möglichen Modelltests aus.
