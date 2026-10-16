# FaithPath – Phase 5: Journal, Rückblicke, Erinnerungen und sichere Datenmitnahme

Stand: 16.10.2026. **Verbindlicher Implementierungsauftrag. Noch keine Phase-5-Codeumsetzung und keine Release-Freigabe.**

## 0. Ausgangspunkt: Phase 5 läuft parallel zu Phase 4

- Repository `akwasiacheampongma-code/Faithpath-`.
- Arbeitsbranch `feature/uiux-phase5-journal-reviews-backup-20261016`, Basis der abgeschlossenen Phase 3 `192675a6a7f602b7abf70d1df5e27b988066c980`.
- **Phase 4 ist ausdrücklich noch nicht implementiert**: `feature/uiux-phase4-navigation-discover-onboarding-20261016` enthält zu diesem Zeitpunkt nur den UIUX4-Auftrag. Daher Phase 5 NICHT von dessen Dokumentations-HEAD ableiten und nicht annehmen, dessen Navigationskonzept sei bereits Code.
- UIUX1–3 sind funktional implementiert; reale iPhone-/Safari-/installierte PWA-/VoiceOver-Gates weiterhin nicht unabhängig bestanden.
- Beide parallelen Phasen werden **erst nach beiden geprüften Implementierungen** in einem separaten Integrationsbranch konfliktbewusst zusammengeführt; nach dem Merge Tests für **beide** Phasen auf dem tatsächlichen Integrationscommit erneut ausführen. Nicht automatisch cherry-picken, mergen, deployen, `main` verändern oder Produktion berühren.
- Bei Konflikten v. a. `src/app.js`, `src/menu.js`, `src/version.js`, `index.html`, `scripts/build.mjs` und globale Styles: keinen Branch „gewinnen“ lassen; zusammengeführte IA und Datenpfade manuell prüfen. Pro Phase eigenständige Build-ID; gemeinsamer Integrationsbuild erhält **neue** ID, nicht `UIUX4`/`UIUX5` vortäuschen.

## 1. Was bereits existiert und unangetastet bleibt

- `src/app.js`: `journal()`, `journalResults()`, `entry()`, `history()`, `reviews()`, `openGap()`, `more?section=data` mit Export/Import/Restore und bestehender Bestätigungsmaske.
- `src/journal-management.js`: Journal löschen und Rückgängig mit konfliktsicheren **Record-Deltas**, Spiegelverknüpfungen, richtige Ablösung von Beziehungen und Bestands-IDs.
- `src/journal-storage.js`: wiederherstellbarer Journal-Speichervorgang über bestehenden Haupt-/Entwurfsschlüssel, Schutz vor Quota/Abbruch.
- `src/drafts.js`: eigener offener Entwurf, konfliktbasierte Wiederaufnahme. Kein stilles Verwerfen.
- `src/continuity.js`: `thoughts()`, `previousThought()`, `reviewPairs()`, `allReviews()`, `reviewsFor()` als verifizierbare zeitliche Beziehungen.
- `src/path-review-context.js`: neue Weg-Rückblicke mit `sourceSnapshot`, sonst ehrliche Legacy-Fallbacks, kein automatisches Umdeuten früherer Texte.
- `src/domain.js`: `gaps()`, Zeitlinien, selbst bestätigte Olivenbaum-Entwicklung. **Schrittabschluss ≠ Entwicklung.**
- `src/store.js`: V5, `KEYS.main`, `KEYS.draft`, `backup()`, `prepareImport()`, `restore()`; der derzeitige lokale `localStorage` ist **unverschlüsselt und nicht automatisch synchronisiert**.
- In-App-Rückblickseinladungen werden beim Öffnen berechnet; keine verlässliche Push-/Hintergrundbenachrichtigung ohne explizite plattformgerechte Infrastruktur. Keine stillen Push-Versprechen.
- Bestehende 2.314 Nachlese-MC, 1.300 NT-Fragen, FP-Storys, zwei lokale Bibeln, Schwert/Olivenbaum und alle persönlichen Datenfelder/IDs bleiben geschützt.

**Phase 5 erfindet die Funktionen nicht neu.** Ziel ist die übersichtliche, sichere und ehrliche Nutzung des Bestehenden.

## 2. Produktziel

Eine Person kann **einen Gedanken schnell festhalten**, ihn mit einem Weg / Bibeltext verknüpfen, ihn **später wiederfinden**, einen **freiwilligen Rückblick** auf den richtigen damaligen Wortlaut durchführen und ihre ganze Geschichte über eine **nachprüfbare Datensicherung** langfristig bewahren.

Warm, zurückhaltend, nicht wertend. Kein Tracking, kein KI-Lesen privater Journaltexte, keine Werbung, Streaks, Scores, Erfolgszwang oder „Glaubensstärke“.

## 3. Arbeitspaket A – Journal als ruhiger, verlässlicher Bereich

1. Originalzustand bei 320×568, 390×844, 430×932 und Desktop mit **echten** Chromium-Screenshots erfassen: leer, 1/30/300 Einträge, lange Texte, Mehrfach-Verknüpfungen, unterschiedliche Kategorien, ungültige Legacy-Referenzen, Suche/kein Treffer, Entwurf, Hell/Nacht.
2. Verständliche Eintragskarten: kurzer Originaltextauszug, belegtes Datum, Art/Status, referenzierte echte Bibelstelle und verknüpfter Weg. Nicht nach künstlichem Datum sortieren, Legacy `date` sauber behandeln.
3. Vorhandene Suche und Filter erhalten; klare, nicht redundante Bedienung, kombinierbare Suche/Typ/Weg/Bibelstelle **nur wenn** die existierenden Indizes/Filter es zuverlässig tragen. Keine neue ungesicherte Volltextsuche in externen Diensten.
4. Große Bestände inkrementell laden (vorhandene `ui.journalLimit`/„Weitere Einträge“ fortführen). Fokus, Scroll-Kontext, Anzahl und aktive Filter bei Wiederkehr stabil; keine unsichtbaren/verlorenen Einträge.
5. Bestehenden Schreib-/Lösch-/Undo-/Verknüpfungsfluss korrekt nutzen. Reflections und gespiegelte Journalobjekte nicht doppelt anzeigen und nicht separat inkonsistent bearbeiten. Kategorien nicht ohne Datenbeleg umdeuten.
6. Freiwilliges „Gedanken festhalten“ ist im leeren und gefüllten Zustand sichtbar und erreichbar. Einträge nie automatisch auf einem Weg anlegen; nach dem Speichern echten Zustand statt erfundener Synchronisation anzeigen.
7. UI in gut benannte schreibfreie Projektionen (z. B. `journal-model.js`/`journal-view.js`) auslagern, wenn sicher; kein zweites State-/Eventsystem.

## 4. Arbeitspaket B – Rückblicke „Damals und heute“, ohne zu fabulieren

1. Reale Originalverknüpfungen `reviewPairs`, `reviewSourceContext`, `sourceSnapshot`, `sourceAt` respektieren; alte Gedanken/Schritte und damaliges Datum nur bei **nachweisbarem** Original anzeigen.
2. Rückblickseite ordnet klar: **„Was mich damals beschäftigt hat“ → „Was ich heute festhalte“**, mit sichtbarem Zeitbezug und direktem Weg-/Original-Link, wenn diese Quellen existieren. Nicht bei fehlenden Quellen fiktiv reparieren.
3. Bestehende Optionen (Gedanke; geändert; unterwegs; unverändert; jetzt nicht) erhalten. Nur „verändert“ + aktive **ausdrückliche Bestätigung** erzeugt Entwicklungsnachweis für Olivenbaum. Weder Zeitablauf noch abgeschlossener Schritt, gelesene Kapitel oder Quiz-Antworten erzeugen Wachstum.
4. Erinnerungen nicht als unerledigte To-dos inszenieren. Wenn 0, 1 oder mehrere fällige Rückblicke existieren: lesbare Priorisierung und einfacher Weg zur Übersicht, ohne lose hängende „Nächster Schritt“-Prompts.
5. Entwurf beim Abbruch, Browser-Reload, Offline, Speicherfehler und paralleler Bearbeitung schützen. Bestehende exakte Original-Zuordnung auch dann halten, wenn ein Schritt zwischenzeitlich geändert/gelöscht wird.
6. Review-Historie und persönliche Timeline bleiben getrennt von den aufgeräumten Journal-Einträgen; keine Duplikate durch Spiegel/Legacy. Fehlende historische Quelle ehrlich markieren.
7. Rückblick-Löschen/Bearbeiten nicht als neue Funktion einführen, wenn es bestehende Beweis-/Meilenstein-Referenzen gefährdet; stattdessen Einschränkung ehrlich dokumentieren und nur nach sauberer Transaktion/Tests umsetzen.

## 5. Arbeitspaket C – In-App-Erinnerungen verstehen und kontrollieren

1. Aktuell `gaps()`, `reminderSnoozes`, `dismissedGaps`, `ui.reviewInvite` auditieren und die bereits implementierten Optionen „In zwei Wochen erinnern“, „Im Moment nicht“, und pro Rückblick 0/14/42 Tage nachvollziehbar darstellen.
2. **Keine automatischen Push-/E-Mail-/Hintergrundmeldungen behaupten.** FaithPath bietet bei der aktuellen Architektur nur Einladungen beim Öffnen/Nutzen der App. Solche Hinweise müssen freiwillig und leicht wegzuklicken sein.
3. Bestehende Fälligkeitsberechnung behalten, es sei denn ein belegter Bug wird durch RED-Test reproduziert. Explizite Ablehnung/Zurückstellung darf nicht vergessen werden. Archivierte/gelöschte Quelle nicht zu einer falschen Erinnerung führen.
4. Nutzer kann erklären lassen, **warum** diese Erinnerung erscheint und auf welchen Originaltext sie sich stützt; ohne vorausgesetztes persönliches Wachstum.
5. Falls UI für Erinnerungseinstellungen sinnvoll: bestehenden `reviews`-Bereich nutzen; nicht `more()`-/Settings-Nav verändern, weil Phase 4 parallel daran arbeitet. Keine neue dauerhafte Preference-/Speicherstruktur ohne belegte Notwendigkeit.

## 6. Arbeitspaket D – Datensicherung und Wiederherstellung als Release-relevanter Teil

**Schutz vor Datenverlust hat Vorrang vor grafischem Feinschliff.**

1. Ausgehend von bestehenden `store.backup()`, `prepareImport()`, `restore()` und Export-Button: Erstelle einen verständlichen Datensicherungsablauf. Erkläre, dass Journal, persönliche Wege, Schritte, Notizen, Rückblicke und Fortschritt **nur auf diesem Gerät** liegen und **nicht automatisch synchronisiert** werden.
2. Ein exportiertes Backup ist derzeit **eine unverschlüsselte JSON-Datei** mit möglicherweise hochprivaten Gedanken. Ehrliche Warnung vor Weitergabe und vor Speicherung an unsicheren Orten; keine falsche Aussage „Ende-zu-Ende-verschlüsselt“, „automatisch sicher“, „für immer gespeichert“.
3. Bestehende JSON-Backups und V3→V5-/V5-Kompatibilität erhalten. Eine optionale **nicht-destruktive „Datei prüfen“ / „Backup prüfen“**-Funktion soll dieselbe Importvalidierung wie `prepareImport()`/Referenzprüfung nutzen und eine kurze Zusammenfassung erzeugen, **ohne** den vorhandenen Datensatz zu ersetzen. Keine privaten Inhalte in Logs/Telemetry ausgeben.
4. Beim echten Import klare, zweistufige Bestätigung mit Vergleich „aktueller Bestand“ vs „Datei“, Warnung, dass Import **ersetzt statt zusammenführt**, und eine bereits existierende vorherige Sicherheitskopie. Bei fehlerhafter/unterbrochener Datei keine Teilimporte oder stillen Überschreibungen.
5. **Niemals behaupten, der Download sei tatsächlich vom Gerät gesichert worden**, wenn die Webplattform keinen verlässlichen Dateischreibnachweis liefert. Keine erfundene „Letztes Backup“-Zeit als Garant. Hilfestellung zum sicheren lokalen Wiederfinden der heruntergeladenen Datei anbieten.
6. Tests: leere und volle Backups, 20-MB-Importgrenze, ungültiges Schema/Referenz/ID, manipulierte Datei, no-space/quota, vorzeitiges Schließen, Browser-Reload, parallele Tabs, Export aus altem Zustand, Import/Undo nach neuer Bearbeitung, echte Restore-Prüfung auf **separater isolierter Origin** zur Datenerhaltung.
7. Optional verschlüsselte **manuelle Exportdateien** nur nach separatem Sicherheitsentwurf und umfassender Kompatibilitätsprüfung; nicht unfertig neben bestehendem Klartext-JSON anbieten und nicht im Hauptumfang erzwingen. Keine neue Cloud, Anmeldung oder Passwortdatenbank.
8. Platzierung des Sicherungs-UX so konfliktarm wie möglich: eigenständige View und bestehende Daten-Route `more?section=data` nur minimal andocken. Phase-4-Veränderungen an `more()` müssen beim späteren Merge explizit vereinigt werden; nicht beide Varianten unkontrolliert überschreiben.
9. Datenschutztexte sachlich: „Auf diesem Gerät lokal und unverschlüsselt gespeichert, keine automatische geräteübergreifende Synchronisation“. Lizenz- und Hosting-Verarbeitung nur korrekt beschreiben. Keine medizinisch oder geistlich aufgeladene Ansprache beim Backup.

## 7. Parallel-Integrationsvertrag mit UIUX4

**Phase 5 selbst NICHT in Phase 4 mergen.** Erzeuge am Ende:

- exakten Base-/Implementierungs-Commit, ÄNDERUNGSLISTE, separate `UIUX5`-Build-ID, Hashes und betroffene Dateien;
- `UIUX5_MERGE_MANIFEST.md` mit Bereichsverantwortlichkeiten, Konfliktmatrix zu `app.js`, `more()`, `journal()`, `reviews()`, `menu.js`, `version.js`, Stylesheets, Build-Skript und PWA-Assets;
- vorgeschlagenen Integrationsbranch **nach** tatsächlichem Abschluss von UIUX4 und UIUX5 (erst dann erstellen);
- Pflicht-Tests nach Merge: **Navigation/Onboarding/Entdecken aus UIUX4** plus Journal/Rückblicke/Backups aus UIUX5 und **UIUX1–3** auf demselben zusammengeführten Commit;
- vor Merge echte Geräte-Gates weiterhin OFFEN; kein Produktionsbuild/Live-Link behaupten.

## 8. Wartbarkeit und technische Grenzen

- Nutze denselben modularen Vanilla-JS-PWA-Stack. Neue Render-/Selector-Module nur bei echtem Abbau von Komplexität; persönliche Daten über existierende Store-/Journal-Transaktionen ändern. Keine neue Runtime-Abhängigkeit, kein Framework-Rewrite, keine neuen Remote-Services.
- Domainregeln, Weg-/Baum-/Schwertstände, `KEYS`, `localStorage`, Persistenzschema, Service-Worker-Updateprotokoll **nicht ohne zwingenden belegten Bug** ändern.
- UIUX5-spezifisches CSS möglichst unter `.journal-page`, `.reviews-page`, `.history-page`, `.settings-page` scopen. Styles für spätere UIUX4-Integrierbarkeit prüfen.
- Stabile Routen: `journal`, `entry/:id`, `reflection/:id`, `review/:id`, `reviews`, `history`, `more?section=data`, `path/:id`, `read/:book/:chapter/:translation`; keine kaputten alten URLs/Links.
- Datenschutz: keine persönlichen Texte an Testberichte, Drittanbieter oder verbundene Dienste senden. Automatisierte Tests ausschließlich mit synthetischen Daten.

## 9. TDD / QA / Geräteabnahme

- Vorher echte Browser-Aufnahmen, reproduzierbare Fixtures, Source/Build-Hash. Tests zunächst als RED für belegbare Probleme, dann GREEN. Nach jedem Arbeitspaket eigenständiger Commit.
- Journal: 0/1/30/300 Einträge, Umlaute, Suche/Filter, Nulltreffer, lange Texte, offline, Pagination, sichere Bearbeitung/Entwürfe, Zuordnungen, Löschung + Undo, Legacy-Spiegel, invalide/archivierte Wege.
- Rückblick: alle Statuswerte, bestätigte und unbestätigte Veränderungen, alte/edierte/gelöschte/mehrdeutige Quellen, Quota-Fehler, später geänderter Schritt, keine erfundene Entwicklung, korrektes Zurückspringen.
- Erinnerungen: 0/1/10 fällig, Snooze/dismiss, Archiv/Deletion, Reload, lokale Zeitzonen-/Datumsgrenzen, kein ungewollter Push-/Hintergrundtrigger.
- Backup: Export und nicht-destruktives Prüfen, wirkliches Importieren mit bewusster Freigabe, Rollback, Kompatibilität alte Formate, Korrumpierung und keine falsche Speicherung, realer Browser-Download; alle Backupdaten nur synthetisch.
- Visual QA: 320×568, 390×844, 430×932, Desktop; Hell/Nacht und Samples Atmosphärisch/Papier; 200%-Text, Zoom, kleine Touchflächen, Fokus/Tastatur, axe-Regelstichprobe, Reduced Motion, Safe Areas, echtes PWA-Offline-/Update auf derselben lokalen Origin.
- Fachliche Regressionen: UIUX1 Heute, UIUX2 Reader/Geschichten/Schwert, UIUX3 Wege/Baum/Originale, 1.300 NT-Fragen und 2.314 Nachlese-MC (Hash), Service Worker, Migrationen, Draft-/Journal-Schutz. **Alle erhaltenen Daten/IDs unverändert**.
- Alle Ergebnisse zählen; nicht „PASS“ behaupten, wenn nur ein Report ohne ausgeführte Logdatei vorliegt. Das Modell führt nicht eigenständig einen echten iPhone-Test aus; iPhone/Safari/Home-Screen/VoiceOver bleiben klar als noch offen ausgewiesen.
- Bei gefundenem sicherheits- oder datenkritischem Fehler: NO-GO für isolierte Geräteabnahme bis Fix und Tests.

## 10. Lieferumfang

- Umsetzung A–D mit nachvollziehbaren Commits auf Phase-5-Branch.
- Ein klarer Änderungs-/Datenvertragsbericht für menschliche Entwickler; `UIUX5_MERGE_MANIFEST.md`.
- Tatsächliche Browser-Screenshots Vorher/Nachher, realistische Testlogdateien, genaue QA-Lücken.
- Vollständiger isolierter `UIUX5`-Preview-Build inklusive Build-ID, Commit-SHA, Content-Hash, Hash pro Builddatei und reproduzierbarem Netlify-ZIP (index.html in ZIP-Wurzel), separates Review-ZIP.
- **Kein** automatischer Deploy, keine Änderungen an `main`, kein Merge mit Phase 4, keine Produktionsfreigabe.
- GO höchstens für isolierte Browser-/iPhone-Geräteabnahme bei grünen Tests. Gesamtrelease erst nach getrennt geprüfter Zusammenführung beider Phasen und physischen UIUX1–5-Gates.

## Übergeordnetes Qualitätsziel

„Meine Gedanken und Rückblicke bleiben meine Geschichte – ohne Wertung und ohne erfundene Erkenntnisse. Ich kann sie jederzeit wiederfinden, sicher übertragen und bewusst schützen.“
