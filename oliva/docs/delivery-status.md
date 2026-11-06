# Lieferstand · OLIVA 0.3.0

06.11.2026. **Lokaler, ausführbarer Kern und dokumentierte Phase 0. Die gesamte im Master-Prompt definierte Produktfreigabe ist noch nicht abgeschlossen.** Insbesondere werden vollständige Bestandsparität, Cloudbetrieb, inhaltliche Fachfreigabe und native Geräteabnahme nicht behauptet.

## Tatsächlich vorhanden

| Ergebnis | Konkrete Lieferung | Grenze |
|---|---|---|
| FaithPath-Analyse | Neuester verfügbarer Branch per Commit-Zeit ermittelt; Snapshot `a519ce8`; Funktionsmatrix, Architektur, zwei Screenshot-Artefakte geprüft | Keine vollständige neue Geräteprüfung der Bestands-App |
| Schutz des Bestands | Separate Referenzkopie; 390 materialisierte Dateien per Git-Blob-Hash mit Original verglichen; unabhängiges Projekt im GitHub-Branch unter `oliva/` | Bestehende FaithPath-Dateien und `main` unverändert; kein Merge/Deploy |
| Markt / USP | Aktuelle offizielle Quellen, Konkurrenzvergleich, verworfene unbelegte „erste App“-Behauptung, prüfbare Positionierung | Reale Nutzerstudie steht aus |
| Design / IA | Eigenes OLIVA-System, Tokens, Light/Dark, gemeinsame Komponenten, Hauptscreens, mobile/große Browseraufnahmen | Markenfreigabe und physische OS-Schrift-/Screenreader-Prüfung offen |
| App-Quellcode | React Native / Expo / TypeScript, Expo Router, Zustand, Zod, SQLite-/IndexedDB-Adapter | Web und native Bundles sind keine Storeveröffentlichung |
| Bibel | 66 Bücher, 1.189 Kapitel, 31.102 Verse; Originalarchiv, reproduzierbarer Parser, gemeinfreie Quellangabe | Historisches Deutsch; zusätzliche moderne Übersetzung benötigt Lizenz |
| Reader | Buch-/Kapitelwahl, Suchtreffer, zwei Modi, Notizen, Lesezeichen, zwei Markierungsfarben, Schrift/Abstand, zuletzt gewähltes Kapitel, bewusster Abschluss | Kein Audio; kein Scrollpositions-Resume; nicht jedes Kapitel hat eine Einordnung |
| Wege | 9 Wege mit je 3 Schritten, Lernzielen, Textbezug, Einordnung, freiwilliger Reflexion und Gebet | 9 eigenständige Pilot-Einordnungen werden thematisch wiederverwendet; keine 27 unabhängigen Kapitelredaktionen |
| Hub | Zeitabhängige Begrüßung, optionaler Name, rotierender lokaler Tagesvers, Kontextaktion, Fortsetzung, Baum, Buchschwert, aktueller Weg, Tagesreflexion | Kein kontobasiertes Empfehlungsmodell; Empfehlungen bleiben nachvollziehbar kuratiert |
| Olivenbaum | 7 eigene Vektorstadien, echte Aktionsprojektion, Vorschau ohne Fortschrittsänderung, finite Animation, App-/OS-Reduktionspräferenz | Kein Glaubensscore; fachlich nicht als Messinstrument zu verstehen |
| Buchschwerter | 66 Themenidentitäten, Erklärungen und parametrische individuelle Vektorvarianten mit realer Kapitellichtlinie | Eine Illustrationsfamilie; keine 66 separat generierten oder unabhängig künstlerisch freigegebenen Masterbilder |
| Sammlung | Gedanken/Reflexionen/Erfahrungen, Bearbeiten, bestätigtes Löschen und lokales Undo; Verse/Markierungen wiederfinden | Journalentwürfe werden dauerhaft gesichert; kleine Hub-/Reader-/Garten-Eingaben sind noch nicht umgestellt |
| Persönliche Vorhaben | Anliegen, eigene Schritte, Bibelbezug aus dem Reader, Archiv/Wiederaufnahme, unveränderte Rückblick-Snapshots | Kein vollständiges Historien-/Bearbeitungs-/Löschmodell aller Rückblicke |
| Datenhoheit | V1/V2→V3-Migration, Export, bestätigter Restore; additiver V5-Import mit Vorschau, Dublettenschutz, historischen Quellen, Originalarchiv, atomarer Rückkehrsicherung und Fensterkonfliktschutz | Lokale Daten/Exporte unverschlüsselt. V5-Quelle max. 10 MiB; Gesamtbackup 64 MiB. Nicht zuordenbare Inhalte bleiben im Originalarchiv. Kein echter Personenexport abgenommen. |
| Bildwelt | 3 generierte und visuell geprüfte Pilotmotive, Originale, WebP-Varianten, SHA-256 und Freigabestatus | Weitere angefragte Geschichten fehlen; historische/theologische und öffentliche Rechtefreigabe offen |
| Datenbank | Native SQLite-Migration im Code, Web-DB-Schema, optionale Supabase-DDL/RLS und Katalogmigration | Cloudmigration nicht gegen Live-Supabase ausgeführt; kein aktiver Sync |
| Tests / Build | Fach-/Persistenztests, Browserabläufe, Offline, Konflikte, Speicherfehler, Reflow und Axe; Web-/Android-/iOS-Bundleexport | Kein signiertes APK/IPA, kein physischer Test, keine vollständige WCAG-Freigabe |
| Dokumentation | Audit, Markt, UX, Architektur, Bild-/Rechtekonzept, lokale Start-/Build-/Deploymentanleitung, CI-Workflow | CI-Datei vorhanden; ein GitHub-Actions-Lauf wurde nicht ausgelöst |

## Was für die Gesamt-Definition-of-Done noch fehlt

1. **Bestandsparität:** weitergehende historische Bearbeitungsfunktionen, Draft-Recovery auch für die kleinen Hub-/Reader-/Garten-Eingaben, zusätzliche Abnahme des V5-Imports an einem anonymisierten echten Export, kuratierte Verständnisfragen und freiwillige Erinnerungen. Kein stiller Transfer aus der unklar lizenzierten Bestandsredaktion.
2. **Inhaltsqualität:** unabhängige theologische Prüfung der Pilottexte, nachvollziehbare Quellenredaktion für weitere Kapitel, historische Bildprüfung und mindestens die weiteren angefragten Erzählmotive nach Freigabe des Piloten. Moderne leicht verständliche Übersetzung verhandeln oder bewusst bei gemeinfreier Ausgabe bleiben.
3. **Native Abnahme:** auf echten iPhones/Androids installieren; SQLite-Transaktionen und Backups, Zurück-Taste, Bildschirmtastatur, große Systemschrift, VoiceOver/TalkBack und reduzierte Bewegung prüfen. Store-Icons, Metadaten, Signing und Zielversionen finalisieren.
4. **Optionaler Betrieb:** Supabase-Projekt/Region und Authverfahren konfigurieren, Owner-RLS mit echten getrennten Konten prüfen, Outbox/Notizkonflikte implementieren, Kontolöschung und Export testen. Kein angeblicher Sync ohne diesen Dienst.
5. **Optionaler KI-Begleiter:** echter serverseitiger Provider, zitatsicheres Retrieval, Referenzvalidierung, fairer Traditionenvergleich, Unsicherheitsanzeige, Opt-in/Off-Schalter, Rate-Limits, Kosten- und Löschregeln. Kein Chatfeld, das eine nicht existente KI simuliert.
6. **Release:** Nutzertest mit absoluten Anfängern, Datenschutz-/Rechteprüfung für den konkreten Vertrieb, Betriebsmonitoring ohne persönliche Inhalte, Update-/Rollbackprüfung und reproduzierbare signierte Store-Builds.

## Nächste überprüfbare Iterationen

1. Pilot fachlich prüfen und fünf bis zehn echte Anfänger den ersten Weg beobachten lassen. Ziel: Nutzen/Begriff „Weg“ in ungefähr 60 Sekunden erklären können; Bibeltext und Einordnung unterscheiden.
2. Geräteabnahme des vorhandenen Kerns. Fehler in Storage, Tastatur oder Hilfstechnologien zuerst beheben, bevor zusätzliche Funktionen die Prüffläche vergrößern.
3. Das vorhandene Vorhaben-/Entwurfssystem auf die verbleibenden Eingabefelder erweitern. Den implementierten V5-Import zusätzlich mit einem anonymisierten echten Export und auf nativen Geräten prüfen.
4. Nach Inhaltsfreigabe Bildwelt und Kontextkatalog skalieren; jedes Asset mit Metadaten und jedes Kapitel mit prüfbarer Quelle.
5. Erst danach optionalen Sync und KI anschließen und deren tatsächliche Dienst-/Kontenprüfungen dokumentieren.

Die ausstehenden Punkte sind ausdrücklich dokumentierte Arbeit. Die lokal funktionierende Umsetzung wird nicht als vollständiger Ersatz aller FaithPath-Funktionen oder als bereits veröffentlichungsreifes Endprodukt ausgegeben.
