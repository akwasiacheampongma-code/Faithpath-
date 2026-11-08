# Lieferstand · OLIVA 0.5.0 · A51 privat bereitgestellt

07.11.2026. **Das A51-Arbeitspaket ist implementiert und seit 06.11., 18:10:52 UTC privat bereitgestellt. Die gesamte im Master-Prompt definierte Produktfreigabe ist noch nicht abgeschlossen.** Vollständige Bestandsparität, Cloudbetrieb, inhaltliche Fachfreigabe und native Geräteabnahme bleiben offen.

[Private Vorschau](https://oliva-v04-private-preview.purplebean128.chatgpt.site) · [Privater Screenshotvergleich](https://oliva-v04-private-preview.purplebean128.chatgpt.site/review/a51/comparison.svg). Die unveränderte URL enthält weiterhin `v04`, ausgeliefert wird 0.5.0. Zugriff ist auf das Eigentümerkonto begrenzt; kein öffentlicher Deploy.

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
| Buchschwerter | 66 Themenidentitäten, Erklärungen und parametrische individuelle Vektorvarianten mit realer Kapitellichtlinie; neuer Johannes-Bildpilot tatsächlich generiert und separat dokumentiert | Johannes-Pilot noch nicht integriert. Keine 66 separat generierten oder unabhängig künstlerisch freigegebenen Masterbilder |
| Sammlung | Gedanken/Reflexionen/Erfahrungen, Bearbeiten, bestätigtes Löschen und lokales Undo; Verse/Markierungen wiederfinden | Dauerhafte Entwürfe auch für Hub, Garten, Vers und geführten Schritt; Übersicht und Quelle bleiben erhalten. RAM-Rettung bei Speicherfehlern überlebt keinen Prozessabbruch |
| Persönliche Vorhaben | Anliegen, eigene Schritte, Bibelbezug aus dem Reader, Archiv/Wiederaufnahme, unveränderte Rückblick-Snapshots | Kein vollständiges Historien-/Bearbeitungs-/Löschmodell aller Rückblicke |
| Datenhoheit | V1/V2/V3/V4→V5-Migration, Export, bestätigter Restore; additiver V5-Import mit Vorschau, Dublettenschutz, historischen Quellen, Originalarchiv, atomarer Rückkehrsicherung und Fensterkonfliktschutz | Lokale Daten/Exporte unverschlüsselt. V5-Quelle max. 10 MiB; Gesamtbackup 64 MiB. Nicht zuordenbare Inhalte bleiben im Originalarchiv. Kein echter Personenexport abgenommen. |
| Bildwelt | 7 generierte und visuell geprüfte Pilotmotive, 18 WebP-Varianten, Originale, SHA-256, Provenienz und Freigabestatus; 4 neue Erzählpiloten im Reader | Weitere angefragte Geschichten fehlen; historische/theologische und öffentliche Rechtefreigabe offen |
| Datenbank | SQLite physisch V3, IndexedDB V1, private Archiv-Blobs mit atomarer Sicherung/Bereinigung, Rohdatenrettung; optionale Supabase-DDL/RLS | Cloudmigration nicht gegen Live-Supabase ausgeführt; kein aktiver Sync |
| Tests / Build | 72 Fachtests; vor Webfix 44/45 Browserfälle, danach 5/5 betroffene A51-Fälle; echter 0.4→0.5-Updatewechsel mit Daten-/Blobschutz und sieben Offline-Stadien; beide nativen Debugexports mit allen 98 A51-PNGs | Kein neuer einzelner grüner 45/45-Gesamtlauf nach Fix, kein APK/AAB/IPA, kein Simulator-/Gerätetest, keine vollständige WCAG-Freigabe |
| Private PWA | Manifest, Icons, Offlineworker; 13 Routen sowie 94 App-/33 Review-Dateien per HTTP geprüft; anonym 401 | Keine zusätzliche gehostete CUA-Browserprüfung und keine physische PWA-Installation |
| Dokumentation | Audit, Markt, UX, Architektur, A51-Bericht/Vergleich, Rechte, Start-/Build-/Deploymentanleitung und Rohberichte | Historischer GitHub-Lauf 42240609694: 64 Fachtests/35 Browserfälle ausschließlich für 0.4; 0.5-Nachweise lokal unter `session-05/` |

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
3. Johannes-Schwertpilot in kleinen Bildformaten und mit echter Kapitellichtlinie prüfen; die 66 vorhandenen Schwerter bewahren. Danach weitere Buchidentitäten gestalterisch entwickeln. Der Master-Bildpilot ist unter `art/swords/pilot.json` dokumentiert und noch nicht in der Laufzeit.
4. Freiwillige Erinnerungen, Rückblickbearbeitung und weitere unabhängige Kapitelredaktion ergänzen. Bildwelt erst nach Pilotprüfung skalieren. Den V5-Import zusätzlich mit einem anonymisierten echten Export und auf nativen Geräten prüfen.
5. Erst danach optionalen Sync und KI anschließen und deren tatsächliche Dienst-/Kontenprüfungen dokumentieren.

Die ausstehenden Punkte sind ausdrücklich dokumentierte Arbeit. Die privat bereitgestellte Umsetzung wird nicht als vollständiger Ersatz aller FaithPath-Funktionen oder als öffentlich veröffentlichungsreifes Endprodukt ausgegeben.

## Bereitstellungs- und Testnachweis 0.5

Private Quelle `672947b4853bf5e6ee326233c56209666391ff3c`, Deployment `appgdep_6aee18220f288191920427af95d581f8` erfolgreich. Kernbuild `oliva-f9aa29af9f863cf9`; Hostpaket `oliva-e0fde474fcc06f7c`. [Deployment](evidence/session-05/private-deployment.json), [HTTP-Prüfung](evidence/session-05/private-http-check.json), [Quellcheckpoint](evidence/session-05/private-source-checkpoint.json) und [Paketprüfung](evidence/session-05/private-package-check.json) sind dauerhaft gespeichert.

Der vollständige lokale Browserlauf bestand vor der letzten isolierten Webkorrektur 44/45 Fälle. Ein tatsächlicher A51-Fehler beim Verarbeiten mehrerer IntersectionObserver-Meldungen desselben Baums wurde diagnostiziert und behoben. Alle fünf betroffenen A51-Fälle einschließlich beidseitigem Batch-Replay bestanden danach. Die vereinigten Berichte decken alle 45 unterschiedlichen Szenarien ab; sie werden nicht als neuer einzelner grüner Gesamtlauf ausgegeben. Belege: [Zusammenfassung](evidence/session-05/validation-summary.json), [Diagnose](evidence/session-05/IO-batch-diagnosis.json), [Nachtests](evidence/session-05/a51-io-fixed-e2e.json).

Die native Bundleprüfung belegt Metro-Plattformtrennung und exakte PNG-Auslieferung. Der spätere Fix betrifft allein den nachweislich nicht in diesen Bundles enthaltenen Webrenderer; [native-builds.json](evidence/session-05/native-builds.json) nennt diesen zeitlichen Unterschied. Die [Updateprüfung](evidence/session-05/offline-upgrade.json) wurde gegen den finalen Kernbuild ausgeführt. Keine dieser Prüfungen ersetzt echte Geräte.
