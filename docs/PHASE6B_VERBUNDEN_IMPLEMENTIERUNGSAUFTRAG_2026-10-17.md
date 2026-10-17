# FaithPath – Phase 6B · „Verbunden“ in die echte App integrieren
Stand: 17.10.2026. **Designrichtung vom Nutzer ausdrücklich freigegeben**. Dieses Dokument ist der verbindliche Arbeitsvertrag für Codex. Keine Produktionsfreigabe.

## Verifizierte Ausgangspunkte
- Funktionsfähige App-Basis UIUX4+5: `integration/uiux4-uiux5-20261017`, SHA `0ec849255fe3f06d80da77ab89d5b66f92f47560`.
- Verbindliche Premium-Designreferenz: `feature/uiux-phase6-visual-directions-20261017`, SHA `f268fc7fab9c608c83514a88f01884abb356bd65`, Ordner `prototypes/uiux6-premium/` (Studie `FP-DESIGN-20261017-6A2-VERBUNDEN`), inkl. `docs/PHASE6B_INTEGRATIONSPLAN.md`, `docs/DESIGNSYSTEM.md`, `docs/QA.md`, `screenshots/`.
- Implementierungsbranch **aus der App-Basis**: `feature/uiux-phase6b-verbunden-20261017`. Er beginnt exakt auf `0ec849255fe3f06d80da77ab89d5b66f92f47560`, nicht auf dem Designstudienbranch. **Nicht** ganze Premium-Demo in die App mergen oder kopieren; nur geeignete Präsentationsbausteine und Tokens adaptieren.
- Alte App-Baseline Build `FP4-20261017-G-STABLE1-UIUX45-CANDIDATE`. Geschützter Inhalts-Hash: `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309`. Original-Buildhash `bd6866522aec7b35854bc7c7871d8ce9afb2f1eb4013fd74496423f63753b882` nur für die **alte** Baseline, nicht neuer Release.
- `main`, ältere Featurebranches, echte Netlify-Produktion: nicht verändern. Keine autonome Veröffentlichung.

## Produktentscheidung und kreative Freiheit
- **„Verbunden“ ist gewählt.** Nicht wieder drei neue Stilrichtungen erfinden, keine erneute 6A-Studie. Starke autonome Freiheit bei Ausarbeitung und UX-Detailentscheidungen; alle vorhandenen Funktionen und Regeln behalten.
- Designziel: hochwertige, eigenständige, ruhige, warme und menschliche Oberfläche über **sämtliche** Bestandteile, inklusive Nebenrouten, Dialogen, Archiv, leeren/Fehlerzuständen, Suche, Einstellungen, Datenverwaltung, Onboarding. Nicht nur Screenshots schöner machen.
- Architektur: bestehende modulare Vanilla-JS-PWA; kein Frameworkrewrite und kein zweites globales Demo-Speichermodell. `prototypes/uiux6-premium/model.js` und `backup-adapter.js` **niemals** als Ersatz für `src/store.js`, ursprüngliche Transaktionen, Migrationen und Backups übernehmen.
- Olivenbaum: die sieben vorhandenen Stufennamen/Schwellen/Regeln und die bestätigten Entwicklungen bleiben verbindlich. Das visuelle Spezialpolishing des Baumes erfolgt **nach Phase 6B**. Aktuell Einbindung ins Design, keine große neue Illustratorproduktionsrunde. Die Originalassets dürfen bei unklarer Rechtslage nicht stillschweigend als kommerziell geklärt gelten. Buch-Schwert-Siegel als bevorzugte visuelle Richtung, keine Belohnung/Glaubenswertung.
- Leitloop: Bibel/Lebenssituation → verstehen → reflektieren → persönlicher Weg/Schritt → Erinnerung → Rückblick → eigene Entwicklung. Wichtigster kontextübergreifender UX-Gate.

## Vorgehen und überprüfbare Gates
**0. Audit:** Worktree sauber; Baseline-HEAD und Design-HEAD abgleichen. Inventar aller echten Routen/Dialoge/Zustände und bestehender Tests erstellen, vor jedem Eingriff. Datum/Commit der beiden Referenzen im Bericht fixieren. Backup P3 aus `reports/uiux45/CODE_REVIEW.md` **vor weitreichender Umgestaltung** separat reproduzieren: verspätetes `File.text()` nach Navigieren zur identischen Hashroute. RED-Test, Korrektur von Requestgeneration und Ansichtsinvaliderung, GREEN-Test. Sicherungsgates erhalten.

**1. Fundament:** Schrift (lokal und Lizenzhinweise), semantische Tokens, vier Themes (Hell/Atmosphärisch/Papier/Nacht), Fokus, Kontraste, Abstände, 320–1440 px, 200%-Textgröße, Reduced Motion, Safe Areas. Bestehende Theme-Präferenzen respektieren. Nur für bestehende App erforderliche Assets übernehmen; keine fremden Screenshots/Demo-Inhalte als Live-Daten.

**2. App-Shell, Heute, Onboarding:** vier Hauptziele mit sämtlichen bisherigen Sekundärzielen, Deep Links, Browserverlauf, Restore-Position, beide Onboarding-Einstiege. Nächster persönlicher Schritt früh und klar sichtbar; Olivenbaum sinnvoll ohne Handlung zu verdrängen; letzter Lesekontext und Gedanke nur wenn aus echten Bestandsdaten vorhanden. Kein irreführendes Datum oder erfundene personenbezogene Beispiele in der Produkt-App.

**3. Reader & Bibelreise:** bestehende beiden Übersetzungen alle 66 Bücher/1.189 Kapitel, Reader-IDs und Anker, Bookmark/Markierung/Notiz/Weg, Versauswahl, Kapitelnavigation, Volltextansichten, Textgröße, lange Kapitel Psalm 119, Kapitelende, Fragen und freiwillige Reflexion. Neuer fließender Satz nur wenn eindeutig anklickbare Verse, Textintegrität und Screenreader-Semantik erhalten. Leserereignis allein ist kein dokumentierter Fortschritt. Keine Doppelzählung/Kurzkapitel-Fehlzählung; Buch-Schwert-Siegel rein visuell.

**4. Mein Weg, Journal, Rückblick:** alle Bestandswege, neue/archivierte/gelöschte/reaktivierte Wege, Schritte editieren/abschließen, Verknüpfungen zu Bibelreferenzen, Journal-Editor, Textentwürfe (inkl. Escape/Rücknavigation/Tastatur), Suche/Filter, Delete/Undo, Originalsnapshots mit Quelle/Datum, spätere eigene Reflexion; keine erfundenen Entwicklungen. Transaktions- und Datenwiederherstellungsverhalten unverändert. Echte Nutzerworte statt Beispieltexte.

**5. Entdecken, Geschichten, Quiz:** aktiver Story-Index (436), Kapitelübungen (260 Einheiten, 1.300 NT-Fragen), 2.314 Nachlese-Fragen und weitere bestandsmäßig zugehörige FP-Inhalte, alle 18 Themen und geführten Wege wo vorhanden; richtige Antworten/IDs/Erklärungen unverändert, Fortsetzen/Zustand und Such-/Filtergrenzen. Fragekarten mit vier Antworten und Erklärung, auch bei viel Text/Zoom und Offline. Keine neuen Fragen oder theologischen Umschreibungen.

**6. Mehr, Einstellungsdialoge, Erinnerung, Daten:** alle alten Funktionen per Route erreichbar. Bestehende freiwillige App-öffnungsbasierte Erinnerungen, keine falschen Systempush-Versprechen. Original-Export/-Import mit Validators, Dry-Run/Vorschau und zweistufiger expliziter Bestätigung; atomare Wiederherstellung, stale tabs, Quota, corrupt/legacy/import races; keine Demo-JSON als Produktionsformat, kein destruktiver stiller Ersatz.

**7. QA nach jedem Paket und gesamtes Endgate:** präzise Unit-/Integration-/Browser-Tests, echte Screenshots der veränderten Seiten bei 320×568, 390×844, 430×932, Desktop, vier Themes, 200% Schrift, leere/volle und lange Bestände, Kontrast und Tastatur. Alle 22 Premium-Referenzansichten auf echte Datenadapter/Routen zuordnen, vor/nachher-Bilder Vergleich gegen Premium-Prototyp **und** ursprüngliche App. Keine verwechselten Demo-/Produkt-Behauptungen. Alte Testfälle erneut auf exakt dem neuen Produktcode ausführen; mit Origin-/Cache-Update v4+5→6B und Offline-/PWA-Migration auf isolierter gleicher HTTPS-QA-Origin testen, soweit Infrastruktur ermöglicht. Persönliche Testdaten immer synthetisch, niemals echte Benutzerimporte auf Testsystemen.

**8. Release-Kandidat – keine Produktion:** saubere Build-ID `UIUX6B-CANDIDATE` mit tatsächlichem Datum und Commit, reproduzierbares ZIP mit Root-`index.html`, Integritätsliste/Hashes, Build-/Changebericht, Testmatrix mit klar getrennten PASS/FAIL/OFFEN, Liste veränderter Dateien und alte/neue Branchdiffs, bekannte Abweichungen und Rollbackplan. Keine automatische Branchzusammenführung mit `main` und kein Netlify-Deploy ohne Nutzerfreigabe. **Echte** physische iPhone/Safari/Home-Screen-PWA/VoiceOver-/Tastaturtests sind weiterhin offenes manuelles Gerätetor, bis tatsächlich durchgeführt.

## Blocker vor einer Freigabe
- Echte persönliche Daten/Entwürfe/Originalsnapshots dürfen nicht verloren gehen oder unbemerkt überschrieben werden.
- Kein verringertes Erreichen von Inhalten oder Funktionen, keine veränderten Bibel-/Fragen-/Antwort-IDs und keine unlizenzierte Assetnutzung.
- Keine Änderung an produktivem Speicherschema ohne separat notwendige, getestete und ausdrücklich freigegebene Migration; normale Phase6B-Zielsetzung ist keine Schemaänderung.
- Offene 22 Axe-`incomplete`-Kontraststellen der Designstudie manuell beurteilen und im integrierten Theme-Kontext nachmessen; keine fiktive pauschale WCAG-Freigabe.
- Jeder umfangreiche Schritt mit commit + Tests + Screenshot; kritische Probleme selbstständig beheben. Falls außerhalb dieser Grenzen neue Geschäftslogik nötig würde: STOP und dokumentieren.

## Abnahmeentscheidung
GO zum isolierten Phase6B-Entwicklungsauftrag. **NO-GO** für automatischen Produktionsdeploy und für Releasebehauptung ohne App-Regressions-, Daten-, Offline-, Geräte- und Sichtabnahme. Alle echten Funktionen bewahren. Baum-Detailillustrationen nach 6B.
