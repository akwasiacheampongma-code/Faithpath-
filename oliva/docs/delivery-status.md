# Lieferstand · OLIVA 0.6.0 · Buchidentitäten privat bereitgestellt

07.11.2026. **OLIVA 0.6 mit A51, 66 Buchansichten und großem Johannes-Schwertbild ist seit 12:59:18 UTC privat bereitgestellt. Die gesamte im Master-Prompt definierte Produktfreigabe ist noch nicht abgeschlossen.** Vollständige Bestandsparität, Cloudbetrieb, inhaltliche Fachfreigabe und native Geräteabnahme bleiben offen.

[Private Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site) · [Privater A51-Screenshotvergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg). Die unveränderte URL enthält weiterhin `v04`, ausgeliefert wird 0.6.0. Zugriff ist auf das Eigentümerkonto begrenzt; kein öffentlicher Deploy. Johannes öffnen: **Bibel → Johannes → Buchschwert ansehen**.

## Tatsächlich vorhanden

| Ergebnis | Konkrete Lieferung | Grenze |
|---|---|---|
| FaithPath-Analyse | Neuester verfügbarer Branch per Commit-Zeit ermittelt; Snapshot `a519ce8`; Funktionsmatrix, Architektur, zwei Screenshot-Artefakte geprüft | Keine vollständige neue Geräteprüfung der Bestands-App |
| Schutz des Bestands | Separate Referenzkopie; alle 390 materialisierten Dateien erneut per Git-Blob-Hash verglichen; eigenständiges lokales Projekt ohne Remote | FaithPath und `main` unverändert. Öffentlicher OLIVA-Sicherungsbranch bleibt bei 0.4; keine weiteren öffentlichen Pushes oder Merges |
| Markt / USP | Aktuelle offizielle Quellen, Konkurrenzvergleich, verworfene unbelegte „erste App“-Behauptung, prüfbare Positionierung | Reale Nutzerstudie steht aus |
| Design / IA | Eigenes OLIVA-System, Tokens, Light/Dark, gemeinsame Komponenten, Hauptscreens, mobile/große Browseraufnahmen | Markenfreigabe und physische OS-Schrift-/Screenreader-Prüfung offen |
| App-Quellcode | React Native / Expo / TypeScript, Expo Router, Zustand, Zod, SQLite-/IndexedDB-Adapter | Web und native Bundles sind keine Storeveröffentlichung |
| Bibel | 66 Bücher, 1.189 Kapitel, 31.102 Verse; Originalarchiv, reproduzierbarer Parser, gemeinfreie Quellangabe | Historisches Deutsch; zusätzliche moderne Übersetzung benötigt Lizenz |
| Reader | Buch-/Kapitelwahl, Suchtreffer, zwei Modi, Notizen, Lesezeichen, Markierungen, Schrift/Abstand, bewusster Abschluss; fortlaufender Versanker mit Reflow-/Offline-Fortsetzung in 0.5 geprüft | Kein Audio; nicht jedes Kapitel hat eine Einordnung; physische native Lesefortsetzung offen |
| Wege | 9 Wege mit je 3 Schritten, Lernzielen, Textbezug, Einordnung, freiwilliger Reflexion und Gebet; 9 freiwillige belegte Textfragen | 9 eigenständige Pilot-Einordnungen werden thematisch wiederverwendet; keine 27 unabhängigen Kapitelredaktionen |
| Hub | Zeitabhängige Begrüßung, optionaler Name, rotierender lokaler Tagesvers, Kontextaktion, Fortsetzung, Baum, Buchschwert, aktueller Weg, Tagesreflexion | Kein kontobasiertes Empfehlungsmodell; Empfehlungen bleiben nachvollziehbar kuratiert |
| Olivenbaum | 7 A51-Originalillustrationen (7 PNG-Master, 21 WebPs), adaptierte WebGL-Windengine, nativer PNG-Ebenenadapter, Galerie, Offline-/Reduced-Motion-Fallback und echte OLIVA-Aktionsprojektion | Keine Fortschrittsänderung durch Vorschau. Native Bewegung und Energie noch nicht auf Geräten abgenommen; [Bericht](09-a51-integration.md) |
| Buchschwerter | 66 Buchansichten mit Themenidentität, Erklärung, genauer Lesespur und Kapitelwahl; großer Johannes-Bildpilot mit Lichtspur und drei Quellenlinks integriert; alle kompakten Vektoren erhalten | Erst ein neuer gemalter Pilot. Keine 66 separat generierten oder unabhängig künstlerisch freigegebenen Masterbilder |
| Sammlung | Gedanken/Reflexionen/Erfahrungen, Bearbeiten, bestätigtes Löschen und lokales Undo; Verse/Markierungen wiederfinden | Dauerhafte Entwürfe auch für Hub, Garten, Vers und geführten Schritt; Übersicht und Quelle bleiben erhalten. RAM-Rettung bei Speicherfehlern überlebt keinen Prozessabbruch |
| Persönliche Vorhaben | Anliegen, eigene Schritte, Bibelbezug aus dem Reader, Archiv/Wiederaufnahme, unveränderte Rückblick-Snapshots | Kein vollständiges Historien-/Bearbeitungs-/Löschmodell aller Rückblicke |
| Datenhoheit | V1/V2/V3/V4→V5-Migration, Export, bestätigter Restore; additiver V5-Import mit Vorschau, Dublettenschutz, historischen Quellen, Originalarchiv, atomarer Rückkehrsicherung und Fensterkonfliktschutz | Lokale Daten/Exporte unverschlüsselt. V5-Quelle max. 10 MiB; Gesamtbackup 64 MiB. Nicht zuordenbare Inhalte bleiben im Originalarchiv. Kein echter Personenexport abgenommen. |
| Bildwelt | 7 generierte und visuell geprüfte Pilotmotive, 18 WebP-Varianten, Originale, SHA-256, Provenienz und Freigabestatus; 4 neue Erzählpiloten im Reader | Weitere angefragte Geschichten fehlen; historische/theologische und öffentliche Rechtefreigabe offen |
| Datenbank | SQLite physisch V3, IndexedDB V1, private Archiv-Blobs mit atomarer Sicherung/Bereinigung, Rohdatenrettung; optionale Supabase-DDL/RLS | Cloudmigration nicht gegen Live-Supabase ausgeführt; kein aktiver Sync |
| Tests / Build | 75 Fachtests; vollständiger Browserlauf 51/52, danach 11/11 nach reiner Testsynchronisierung; echter 0.5→0.6-Updatewechsel ohne Datenänderung; beide nativen Debugexports mit je 98 A51-/3 Johannes-PNGs | Kein neuer einzelner grüner 52/52-Gesamtlauf, kein APK/AAB/IPA, kein Simulator-/Gerätetest, keine vollständige WCAG-Freigabe |
| Private PWA | Manifest, Icons, Offlineworker; 0.6-Deployment erfolgreich; 15 App-Routen, 98 App-/42 Review-Dateien per HTTP geprüft; anonym 401, Eigentümerzugriff unverändert | Keine zusätzliche gehostete CUA-Browserprüfung und keine physische PWA-Installation |
| Dokumentation | Audit, Markt, UX, Architektur, A51-/Schwertpilot-Berichte, 66 Buchidentitäten, Rechte, Start-/Build-/Deploymentanleitung und Rohberichte | Historischer GitHub-Lauf 42240609694: 64 Fachtests/35 Browserfälle ausschließlich für 0.4; 0.5-/0.6-Nachweise getrennt unter `session-05/` und `session-06/` |

## Was für die Gesamt-Definition-of-Done noch fehlt

1. **Bestandsparität:** weitergehende historische Bearbeitungsfunktionen, zusätzliche Abnahme des V5-Imports an einem anonymisierten echten Export, ein breiterer eigener Verständnisfragenkatalog und freiwillige Erinnerungen. Die kleinen Eingabefelder und neun Pilotfragen sind seit 0.4 integriert. Kein stiller Transfer aus der unklar lizenzierten Bestandsredaktion.
2. **Inhaltsqualität:** unabhängige theologische Prüfung der Pilottexte, nachvollziehbare Quellenredaktion für weitere Kapitel, historische Bildprüfung und mindestens die weiteren angefragten Erzählmotive nach Freigabe des Piloten. Moderne leicht verständliche Übersetzung verhandeln oder bewusst bei gemeinfreier Ausgabe bleiben.
3. **Native Abnahme:** auf echten iPhones/Androids installieren; SQLite-Transaktionen und Backups, Zurück-Taste, Bildschirmtastatur, große Systemschrift, VoiceOver/TalkBack und reduzierte Bewegung prüfen. Store-Icons, Metadaten, Signing und Zielversionen finalisieren.
4. **Optionaler Betrieb:** Supabase-Projekt/Region und Authverfahren konfigurieren, Owner-RLS mit echten getrennten Konten prüfen, Outbox/Notizkonflikte implementieren, Kontolöschung und Export testen. Kein angeblicher Sync ohne diesen Dienst.
5. **Optionaler KI-Begleiter:** echter serverseitiger Provider, zitatsicheres Retrieval, Referenzvalidierung, fairer Traditionenvergleich, Unsicherheitsanzeige, Opt-in/Off-Schalter, Rate-Limits, Kosten- und Löschregeln. Kein Chatfeld, das eine nicht existente KI simuliert.
6. **Release:** Nutzertest mit absoluten Anfängern, Datenschutz-/Rechteprüfung für den konkreten Vertrieb, Betriebsmonitoring ohne persönliche Inhalte, Update-/Rollbackprüfung und reproduzierbare signierte Store-Builds.

## Nächste überprüfbare Iterationen

1. Pilot fachlich prüfen und fünf bis zehn echte Anfänger den ersten Weg beobachten lassen. Ziel: Nutzen/Begriff „Weg“ in ungefähr 60 Sekunden erklären können; Bibeltext und Einordnung unterscheiden.
2. Geräteabnahme des vorhandenen Kerns. Fehler in Storage, Tastatur oder Hilfstechnologien zuerst beheben, bevor zusätzliche Funktionen die Prüffläche vergrößern.
3. Iteration 0.7 vorbereiten: eigene Vorhaben-Rückblicke mit geschützten Entwürfen bearbeiten/löschen und ein sitzungsgebundenes Undo ergänzen. CAS-, Snapshot-, Wachstums- und Archivgrenzen sind analysiert; **noch nicht implementiert**.
4. Weitere Buchillustrationen nach Prüfung des integrierten Johannes-Piloten, freiwillige Erinnerungen und unabhängige Kapitelredaktion ergänzen. Die 66 funktionierenden kompakten Schwerter bewahren. Den V5-Import zusätzlich mit einem anonymisierten echten Export und auf nativen Geräten prüfen.
5. Erst danach optionalen Sync und KI anschließen und deren tatsächliche Dienst-/Kontenprüfungen dokumentieren.

Die ausstehenden Punkte sind ausdrücklich dokumentierte Arbeit. Die privat bereitgestellte Umsetzung wird nicht als vollständiger Ersatz aller FaithPath-Funktionen oder als öffentlich veröffentlichungsreifes Endprodukt ausgegeben.

## Aktueller Bereitstellungs- und Testnachweis 0.6

Private Quelle `f7705ee5955cb4bb984301363cd6641c7fa591c0`, erfolgreiches Deployment `appgdep_6aef2097fb108191981ddd7bfacf5e02` am 07.11. um 12:59:18 UTC. Kernbuild `oliva-a542b7009551a2a2`; Hostpaket `oliva-524e381f7222abe8`. [Deployment](evidence/session-06/private-deployment.json), [Quellcheckpoint](evidence/session-06/private-source-checkpoint.json) und [Paketprüfung](evidence/session-06/private-package-check.json) belegen die getrennte private Bereitstellung ohne Änderung des Publikums.

Die [abgeschlossene HTTP-Prüfung](evidence/session-06/private-http-check.json) bestätigt 15 Routen mit Shell, 98 App-Dateien und 42 Review-Dateien bytegenau; Manifest/Worker korrekt, anonym 401. Sie ist keine zusätzliche gehostete Browser- oder Handyprüfung.

75 Fachtests und sieben fokussierte Buchschwertfälle bestanden. Der spätere vollständige Lauf nach Layoutkorrektur bestand 51/52; eine zu frühe einmalige Verspositionsmessung wurde ausschließlich im Test synchronisiert. Danach bestanden alle elf betroffenen Capture-/Readerfälle am unveränderten Produktbuild. Die erfolgreiche Vereinigung enthält 52 verschiedene Szenarien; es gab keinen neuen einzelnen grünen Gesamtlauf. [Zusammenfassung](evidence/session-06/validation-summary.json), [Gesamtlauf](evidence/session-06/e2e-first-full.json) und [Nachtests](evidence/session-06/reader-regression.json) bewahren diese Grenze.

Die [nativen Debugexports](evidence/session-06/native-builds.json) belegen je alle 98 A51- und drei Johannes-PNGs ohne A51-Webrenderer oder große Bildmaster. Der [echte 0.5→0.6-Offlinewechsel](evidence/session-06/offline-upgrade.json) bewahrt alle Zustandsdatensätze unverändert und prüft Buchroute/PNG, sieben Baumstadien sowie den exklusiven Vorgängerchunk. Keine dieser Prüfungen ist ein Geräte- oder öffentlicher Freigabenachweis.

## Historischer Bereitstellungs- und Testnachweis 0.5

Private Quelle `672947b4853bf5e6ee326233c56209666391ff3c`, Deployment `appgdep_6aee18220f288191920427af95d581f8` erfolgreich. Kernbuild `oliva-f9aa29af9f863cf9`; Hostpaket `oliva-e0fde474fcc06f7c`. [Deployment](evidence/session-05/private-deployment.json), [HTTP-Prüfung](evidence/session-05/private-http-check.json), [Quellcheckpoint](evidence/session-05/private-source-checkpoint.json) und [Paketprüfung](evidence/session-05/private-package-check.json) sind dauerhaft gespeichert.

Der vollständige lokale Browserlauf bestand vor der letzten isolierten Webkorrektur 44/45 Fälle. Ein tatsächlicher A51-Fehler beim Verarbeiten mehrerer IntersectionObserver-Meldungen desselben Baums wurde diagnostiziert und behoben. Alle fünf betroffenen A51-Fälle einschließlich beidseitigem Batch-Replay bestanden danach. Die vereinigten Berichte decken alle 45 unterschiedlichen Szenarien ab; sie werden nicht als neuer einzelner grüner Gesamtlauf ausgegeben. Belege: [Zusammenfassung](evidence/session-05/validation-summary.json), [Diagnose](evidence/session-05/IO-batch-diagnosis.json), [Nachtests](evidence/session-05/a51-io-fixed-e2e.json).

Die native Bundleprüfung belegt Metro-Plattformtrennung und exakte PNG-Auslieferung. Der spätere Fix betrifft allein den nachweislich nicht in diesen Bundles enthaltenen Webrenderer; [native-builds.json](evidence/session-05/native-builds.json) nennt diesen zeitlichen Unterschied. Die [Updateprüfung](evidence/session-05/offline-upgrade.json) wurde gegen den finalen Kernbuild ausgeführt. Keine dieser Prüfungen ersetzt echte Geräte.
