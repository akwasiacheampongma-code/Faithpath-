# Lokale Bibelvorlesung – Implementierungsplan

Goal: Matthäus 1 vollständig mit der vorhandenen Coqui-Thorsten-VITS-Fassung neu erzeugen, Aussprachefehler und gestapelte Pausen gezielt korrigieren; keine Veröffentlichung.

Architecture: Isoliertes Python-Werkzeug unter tools/bible-audio; unveränderte data/bibles/l1912 als Quelle. Getrennte Module für Aussprache, Audioverarbeitung und persistente Kapiteljobs. Reader-Adapter nur als getestete Vorbereitung und Vorschau, ohne App-Router oder Nutzerspeicher anzufassen.

Tech Stack: Python 3.12, coqui-tts 0.28.0, Torch 2.8 CPU, Gruut, NumPy/SoundFile, FFmpeg; ES-Module und natives HTMLAudioElement.

Constraints: Kein Piper-Export; kein Training, Cloud-TTS, Massengenerieren, Deploy oder Merge. Vorhandene Audiodateien erhalten. Nur tatsächlich ausgeführte Prüfungen melden. Keine Behauptung akustischer Abnahme ohne Hörprüfung.

Review Focus: Cachekorruption; Unterbrechung während Schreiben; falsche Kapitel-/Übersetzungszuordnung; Wortgrenzen und Genitive im Lexikon; asynchroner Kapitelwechsel während Audio lädt.

## 1. Baseline und Rechte
- [ ] App-Baseline ausführen, Quellen und Referenzdateien erfassen.
- [ ] Modell/Engine/Datensatz/Text mit konkreten Hashes und offiziellen Quellen dokumentieren; Unbekanntes offen halten.

## 2. Lokale Synthese
- [ ] Nachgewiesene Namensfehler erst als fehlschlagende Tests sichern, dann Gruut-kompatibles Wortlexikon implementieren.
- [ ] Pausentrimmung, Übersteuerungsschutz und identische Textabdeckung mit synthetischen Signalen prüfen.
- [ ] Einzelkapitel-CLI, verifizierten Segmentcache, Dateisperre und atomare Ausgaben implementieren; Unterbrechung/Korruption testen.
- [ ] Mehrere Profile an echten kurzen Abschnitten vergleichen, anschließend alle 25 Verse erzeugen und Originaltext/ASR/Messwerte prüfen.

## 3. Reader-Vorbereitung und Lieferung
- [ ] Lebenszyklusfesten Audio-Adapter mit Geschwindigkeit, Fortsetzen und Kapitelwechsel testen; keine automatische Wiedergabe oder Fortschrittsänderung.
- [ ] Player mit vollständigem Text, Originalvergleich und Download im Browser prüfen.
- [ ] Bestehende Tests, Lint und Build; Inhaltsintegrität vergleichen.
- [ ] Abschlussprüfung, Lizenzbericht, QA-Ergebnisse, MP3 und reproduzierbares ZIP liefern; Hör- und Gerätegates offen ausweisen.
