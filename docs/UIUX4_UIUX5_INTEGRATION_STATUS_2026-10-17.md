# FaithPath – UIUX4 + UIUX5 Integration: eindeutiger Stand und Arbeitsauftrag

Stand: 17.10.2026. **Dieser Branch ist eine isolierte Integrationsbasis, kein fertiger UIUX4+UIUX5-Release.**

## Verifizierte Git-Historie und Umfang

- Phase 4 implementiert: `feature/uiux-phase4-navigation-discover-onboarding-20261016`, HEAD vor Integration `bbae3b256fea717b1b5ce35d9d8e27e941128b4f`; Anwendungscode-Commit `3e3ebc8f44686bd903b4065329dcf284e4d1fb91`.
- Phase 5 **nur geplant**, ohne Implementierungscode: `feature/uiux-phase5-journal-reviews-backup-20261016`, HEAD `07656b73068d4c63048df508bc199e817440a688`.
- Isolierter Integrationsbranch: `integration/uiux4-uiux5-20261017`, erstellt exakt von Phase-4-HEAD.
- GitHub PR #1 `https://github.com/akwasiacheampongma-code/Faithpath-/pull/1` merge commit `cc95b9e895a0e71e03d71110a1e54cb7b60a5674`, bringt die originale Phase-5-Spezifikation als **einzige neue Datei**:
  `docs/UIUX_PHASE5_JOURNAL_REVIEWS_BACKUP_2026-10-16.md`.
- **Keine Umsetzung von UIUX5** im PR. Keine Geschäftslogik-, Speicher-, UI-, Service-Worker- oder Build-Datei wurde dadurch verändert. Der jetzige ausführbare Build ist weiterhin UIUX4 (`FP4-20261016-G-STABLE1-UIUX4`), solange weitere Änderungen fehlen.
- In UIUX4-Bericht: 174 Unit-Tests, 984 Chromium-Browserfälle und acht SW-Update-Prüfpunkte PASS **laut vorhandenen QA-Artefakten auf seinem eigenen Implementierungscommit**; diese Ergebnisse können für zukünftigen UIUX5-Code nicht als neue Tests ausgegeben werden.
- `main`, Produktion und Phase-4-/Phase-5-Quellbranches nicht verändern; kein Deployment aus dem Integrationsbranch ohne explizite Nutzerentscheidung.

## Vorrangregel für widersprechende Anweisungen

Die Phase-5-Spezifikation wurde erstellt, als Phase 4 noch nicht umgesetzt war. Ihre veralteten Branch-/Merge-/Reihenfolgeanweisungen („Phase 5 parallel auf Phase 3 entwickeln“ und „nicht mit Phase 4 verbinden“) sind **hiermit ausdrücklich durch den Wunsch des Nutzers nach einer gemeinsamen Phase-4+5-Basis ersetzt**.

- Die **fachlichen Phase-5-Anforderungen A–D** (Journal, historische Rückblicke, freiwillige In-App-Erinnerungen, echte und sichere Backups), alle Datenschutz-, Datenintegritäts- und QA-Kriterien der Originaldatei bleiben vollständig gültig.
- Der verbindliche **neue Implementierungsstartpunkt** ist `integration/uiux4-uiux5-20261017` beim bestätigten Integrations-HEAD, **nicht** der isolierte Phase-5-Branch.
- Der Phase-4-Implementierungsstand ist die verbindliche Navigation und UIUX4-Such-/Onboarding-Architektur. Keine Rückkehr zu UIUX3-Menüs/Onboarding durch versehentliches Überschreiben.
- Neu notwendige Arbeiten an `src/app.js::more()` müssen UIUX4s `renderMore()` und `navigation-view.js` berücksichtigen und den bestehenden Pfad `more?section=data` für Backup-Funktionen nutzen.
- Keine neue Datenautorität. Bestehende Store-, Journal- und Entwurfstransaktionen verwenden.

## Arbeitsauftrag für Codex: tatsächlich UIUX5 auf der gemeinsamen Basis bauen

1. Zuerst lesend aktuelle Integrationscommit-SHA, gespeicherte QA-Grenzen und `docs/UIUX_PHASE5_JOURNAL_REVIEWS_BACKUP_2026-10-16.md` prüfen. Baseline und die 4er Navigation/Deep Links bei 320/390/430/Desktop mit echten Browser-Screenshots sichern.
2. **A Journal:** große/kleine/alte Einträge, intelligente aber datentreue Suche/Filter, sichere edit/delete/undo, lesbare Weg-/Bibel-Verknüpfungen, keine Mirror-Duplikate; bei Bedarf entkoppelte Model-/View-Module.
3. **B Rückblicke:** tatsächliche frühere Quellen und neuen Gedanken nebeneinander, unveränderte `sourceSnapshot`-/`sourceAt`-Semantik, ehrliche Legacy-Fallbacks, nur ausdrücklich bestätigte Entwicklung beeinflusst Olivenbaum.
4. **C Erinnerungen:** freiwillige Einladungen ausschließlich beim Öffnen/Nutzen, kein behaupteter Hintergrund-Push, transparente Originalquelle, snooze/dismiss/kein Pflichtgefühl.
5. **D Backups:** nicht-destruktives Prüfen einer JSON-Datei, klare Import-Zusammenfassung und Warnung vor Ersetzen, robuste Wiederherstellung, Fehler-/Quota-/Legacy-Schutz; Dateiexport als unverschlüsselt und als manuelles Backup kennzeichnen; keine erfolgte externe Dateisicherung vortäuschen.
6. Nach jedem Paket RED→GREEN Unit + Chromium, Codecommit, persönliche Daten nur synthetisch.
7. **Gemeinsame E2E-Gates** auf exakt demselben Integrationscommit: Phase-4-Onboarding (zwei Wege), Phase-4-Navigation (alle alten 12 Ziele erreichbar), Phase-4-Entdecken (alle 436 Storys und 260 NT-Kapiteleinheiten sowie Pagination/Filter), Phase-5-Journal/Rückblick/Backup, UIUX1–3, offline beide Bibeln, 2.314 Nachlese-MC / 1.300 NT-Fragen, Saved-Draft, v3→v5 Migration, safe delete/undo, Imports, Service Worker **UIUX4→UIUX4+5** Update auf derselben lokalen Origin.
8. Prüfe **Content-Hash identisch** zu `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309` und alle geschützten Daten-/Bibeldateien bytegleich.
9. Erstelle eine **neue Integrations-Build-ID** (z. B. `FP4-20261017-G-STABLE1-UIUX45-CANDIDATE`, tatsächliche Datum/Build-ID ermitteln) – nicht die alten UIUX4-Testergebnisse als UIUX5-Erfolg ausgeben. Drei bytegleiche Builds inkl. frischem Git-Archiv, alle SHA-256-Dateihashes, ZIP mit `index.html` an der Wurzel, QA-Bericht, echte Vorher-Nachher-Screenshots.
10. Die physischen Gerätegates UIUX1–5 (echtes iPhone Safari, Home-Screen-PWA, Offline, update, VoiceOver) bleiben bis zur dokumentierten Nutzerprüfung **OFFEN**. Höchstens GO für isolierte HTTPS-Geräteabnahme, NO-GO für Produktion.

## Geschützte Bereiche

- `main` und öffentliche Produktion; keine Live-/Netlify-Veröffentlichung.
- Keine neuen Stories/Fragen, veränderten IDs, geänderten Bibeltextdateien, Datenverluste oder silent migrations.
- Kein Frameworkrewrite, Cloudaccount, Drittanbieter-KI oder Tracker.
- Phase-4-Pfade `src/navigation-model.js`, `src/navigation-view.js`, `src/discover-model.js`, `src/discover-view.js`, `src/onboarding-view.js` nicht durch alte UIUX3-Version ersetzen.

## Abnahmeregel

**Heute ist nur die Kombination des implementierten Phase-4-Codes mit der Phase-5-Spezifikation erfolgt.** Als technisch abgeschlossene UIUX4+5-Integration gilt der Branch erst, wenn die Phase-5-Funktionalität tatsächlich im Code vorliegt und die oben genannten gemeinsamen QA-Gates ausgeführt und dokumentiert sind.
