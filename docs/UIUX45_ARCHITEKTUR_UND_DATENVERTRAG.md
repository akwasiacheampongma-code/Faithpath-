# UIUX4+5 – Architektur und Datenvertrag

## Ausgangspunkt und tatsächliche Übernahme

Integrationsbasis b06f90e: vollständige UIUX4-Oberfläche und Phase5-Spezifikation. Der historische Statusbericht beschrieb Phase5 bei 07656b7 als nur geplant. Inzwischen vorhandene Implementierung af9d53f wurde zusätzlich geprüft und gezielt paketweise wiederverwendet. Kein pauschaler Branch-Merge, kein erneuter Contentimport.

A 0884dce: Journal. B ba0a2a3: Rückblicke. C edb2235: Erinnerungen. D 9706f1e: Backups und gemeinsamer Dialogadapter. Der Auslieferungsbericht bindet den endgültigen QA-HEAD separat an den Anwendungscode.

## Module

| Modul | Verantwortung | Autorität |
|---|---|---|
| journal-model / journal-view | Originaleinträge, belegte Datumswerte, Suche/Filter, echte Verknüpfungen, 40er-Seiten | Bestehendes Journal und journalMatches |
| reviews-model / reviews-view | Alle Rückblicke, 40er-Fortsetzung, Original/Heute und Legacyhinweise | allReviews und unveränderter reviewSourceContext |
| reminders-view | Fällige und freiwillig pausierte Einladungen erklären und anzeigen | Unverändertes gaps und vorhandene Snooze/Dismiss-Schlüssel |
| backup-model | Größe vor Lesen, JSON/Import/Referenzen prüfen, Wiederherstellungssitzung binden | Bestehendes prepareImport und importRefs |
| backup-view | Ehrlicher Datenschutz, Bestandsvergleich, zwei bewusste Bestätigungen | Keine Speicheränderung |
| journal-reviews-backup.css | Eng begrenzte Journal-/Rückblick-/Backupgestaltung | Bestehende vier Themes |
| app.js | Bestehende Events/Router/Transaktionen verbinden | Kein zweites State-/Eventsystem |

Phase4s navigation-model/view, discover-model/view, onboarding-view und menu.js bleiben bytegleich. more() behält renderMore(), nur more?section=data delegiert die neue Backupansicht. Beide zusätzlichen CSS-Dateien werden versioniert. Onboardingabschluss und Backup-Sitzungsende werden in denselben vorhandenen Dialog-Lifecycle eingebunden.

## Datenvertrag

Keine neue Migration, kein neues Schema, keine neuen persistenten Schlüssel. IDs, Quizschlüssel, Texte, Story-/Kapitelzuordnungen und Bibeln unverändert. Journalbearbeitung, Löschung/Record-Delta-Undo und Entwurfsschutz bleiben in den vorhandenen Transaktionen. Keine automatische Entwicklung aus Schritten, Erinnerungen, Zeit oder Bibelkapiteln; die bestehenden ausdrücklichen Baumregeln bleiben maßgeblich.

Storeänderungen ausschließlich: Export aus veraltetem Tab verweigern; beim fehlgeschlagenen Main-Write die vorherige Wiederherstellungskopie nach Möglichkeit zurücksetzen. Die aktive localStorage-Schreiboperation bleibt atomar; mehrere Schlüssel sind keine vollständige Datenbanktransaktion. Bei zusätzlichem Speicherfehler oder Prozessabbruch kann die Wiederherstellungskopie nicht garantiert werden. Externe Backups bleiben erforderlich.

Die historischen Inhaltsvalidatoren erlauben ausschließlich den exakt geprüften Store-Digest 6ab0de7812b78a25f50f05f55963a19a5991843e56889e73e7fb67dc6c4b76db. Keine Inhaltsdatei und kein beliebiger späterer Store werden ausgenommen.

## Wiederherstellung und Nebenläufigkeit

Die Dateiprüfung verändert keinen Bestand. Ein Import ersetzt, statt zusammenzuführen. Sitzung enthält Main-/Draft-Bytes und Bestätigungsstufe nur im Arbeitsspeicher. Noch innerhalb der Journal-Sperre werden Sitzungseigentum, Dialogzustand, Stufe und aktuelle Bytes erneut geprüft. Abbrechen/Escape/neue Vorschau verhindern einen wartenden Schreibauftrag. Offene Entwürfe werden nicht vom Importabschluss gelöscht. Eine neuere Bearbeitung erfordert erneute Dateiprüfung. Auch die lokale Sicherheitskopie wird mit demselben zweistufigen Ablauf zurückgespielt.

Bekannte kleine UX-Grenze: Eine verzögerte Dateiprüfung kann nach Navigation weg und zurück dieselbe alte Vorschau erneut öffnen, solange kein Dialog offen war. Zwei neue Bestätigungen und alle Frischeprüfungen bleiben erforderlich; kein nachgewiesener Datenverlust. Separater P3-Nachtrag im QA-Bericht, kein versteckter Fix.

## Weiterpflege

Keine neue Runtime-Abhängigkeit. Fachregeln bleiben in den bestehenden Modulen; Views lesen nur. Änderungen an gemeinsamen app.js-Events gegen Onboarding, Discover-Rückkehr, Entwürfe und Backup-Races testen. scripts/qa-uiux45.py orchestriert die gemeinsame Browserregression. tests/uiux45-update.mjs prüft ein echtes Update auf derselben Origin von der exakt gebundenen Integrationsbaseline. Historische Einzelphasenberichte sind ausschließlich Herkunftsnachweise, keine neuen PASS-Ergebnisse.

## Öffentliche Modulverträge

- `selectJournal(data, {query='', filter='Alle', limit=40, books=[]})` liefert total/totalEntries, verfügbare Filter, den aktiven Zustand und `items: [{entry, date, paths}]`. entry ist das vorhandene Original, date ein Zeitwert oder null, paths enthält nur tatsächlich vorhandene Wege. Die Projektion schreibt nichts und Views dürfen ihre Referenzen nicht verändern.
- `selectReviews(data, {limit=40, now=Date.now()})` liefert pending aus gaps und completed aus allReviews als `{review, source}`. source wird ausschließlich durch reviewSourceContext aufgelöst. Keine zweite Implementierung historischer Wahrheit.
- `selectReminderControls(data, now)` liefert pending und paused. Die Kandidatensuche ohne Zurückstellung dient ausschließlich der Anzeige; sie erzeugt weder Erinnerungsereignisse noch einen neuen Zeitplan.
- `inspectBackupFile(file, {store, validateRefs})` ist asynchron und liefert `{next, summary, exported}`. Fehler werden vor jeglichem Restore geworfen. MAX_BACKUP_BYTES beträgt20×1024×1024. validateRefs muss der existierende vollständige Bibelreferenzprüfer bleiben.
- `createRestoreSession(next, storage)` bindet normalisierten Zielzustand und aktuelle Main-/Draft-Bytes. `assertRestoreSession(session, storage)` prüft Frische und offenen Journal-Schreibvorgang. Erst app.js führt nach zweiter Bestätigung und erneutem Besitzcheck innerhalb der bestehenden Sperre `store.restore` aus.
- Viewfunktionen erhalten die vorhandenen heading/button/link/date-Renderer explizit; Texte aus Daten werden escaped. Kein DOM-/Storage-Zugriff in den neuen Views, kein neues globales Eventsystem.

Transient in ui bleiben journalLimit/reviewsLimit, Such-/Filterzustand, Journal-Rückkehr und Importsitzung/-generation. Sie sind von Phase4s storySearch/storyKind/storyLimit und Onboardingzustand getrennt. Persistenz bleibt vollständig im bestehenden Store und den geschützten Journal-/Draft-Transaktionen.
