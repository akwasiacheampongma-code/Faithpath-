# UIUX5 – Integrationsvertrag und Konfliktmatrix

## Tatsächliche Basis und getrennte Verantwortung

Phase 5: feature/uiux-phase5-journal-reviews-backup-20261016. Ausgangspunkt 07656b73068d4c63048df508bc199e817440a688, ausschließlich Auftrag auf UIUX3@192675a6a7f602b7abf70d1df5e27b988066c980. Keine Ableitung von UIUX4. UIUX5-Anwendungscode und finaler QA-HEAD werden im Lieferbeleg und Implementierungsbericht exakt gebunden.

Die ursprüngliche Spezifikation bezeichnet UIUX4 noch als unimplementiert. Tatsächlich wurde UIUX4 separat fertiggestellt: bbae3b256fea717b1b5ce35d9d8e27e941128b4f, Anwendungscode 3e3ebc8. Diese Feststellung erlaubt keinen Merge. Der Phase-4-Branch wurde während Phase 5 nicht verändert; seine Navigation, Suche und Einführung sind nicht Bestandteil des eigenständigen UIUX5-Builds.

UIUX5 bleibt auf der abgeschlossenen Phase-3-Oberfläche. Vier Themes, vier Tabs, alte Navigation und drei Onboarding-Slides aus dieser Basis bleiben hier erhalten. Kein gemeinsamer Release- oder Produktionsstand wird behauptet.

## Gezielte Änderungen

- A: journal-model.js / journal-view.js, schreibfreie Projektion und Darstellung; app.js bindet vorhandene Schreib-, Such-, Filter-, Lösch- und Entwurfsaktionen an.
- B: reviews-model.js / reviews-view.js; genaue Originalauflösung bleibt in path-review-context.js und continuity.js.
- C: reminders-view.js, bestehende gaps-/Snooze-/Dismiss-Daten; keine neue Berechnung oder Preference.
- D: backup-model.js / backup-view.js, nicht-destruktive Dateiprüfung, zweistufige Bestätigung und Sessionbesitz. Store erhält ausschließlich nachgewiesene Frische-/Quota-Fehlerkorrekturen.
- journal-reviews-backup.css ist ein eigener, versionierter, eng gescopter Stylesheet. Keine globale Theme-Änderung.
- protected-runtime.mjs erlaubt den exakt geprüften Store-Nachfolger in zwei alten Inhaltsvalidatoren. Historische Manifeste, Bibeln und Inhaltsdaten bleiben unverändert.

## Konfliktmatrix zu UIUX4

| Bereich | UIUX4 | UIUX5 | Sichere Integrationsentscheidung |
|---|---|---|---|
| src/app.js Imports und ui | Navigation/Discover/Onboarding-Module und transiente Filter | Journal/Reviews/Reminder/Backup-Module, reviewsLimit, importRequest, Journal-Rückkehr | Beide kleinen Modulsätze erhalten; keine komplette Dateiversion übernehmen |
| more() | Neuer sekundärer Mehr-Hub | Nur section=data delegiert neue Backup-View | UIUX4-Hub und Einstellungen beibehalten, UIUX5-Datenadapter gezielt einsetzen |
| journal()/journalResults() | Unveränderte Phase-3-Journalansicht | Neue Projektion, Karten, 40er-Fortsetzung und Wiederkehr | UIUX5 übernehmen; im integrierten Router Fokus/Back erneut prüfen |
| reviews()/entry(review) | Unverändert | Original/Heute-Gegenüberstellung und vollständige Historie | UIUX5 übernehmen; genaue Originalresolver unverändert lassen |
| Aktionen und DOM-Handler | Neue Discovery-Pagination, Onboarding-Abschluss und Fokus | Journal-Pagination, Erinnerungssteuerung, Backup-Session und File-Races | Aktionen einzeln kombinieren; besonders click/input/change/hashchange/close/cancel |
| closeModal()/Dialog-Lifecycle | Neutrales Onboarding gilt auch bei Abbruch als beendet | Importgeneration/Session bei Schließen ungültig | Beide Besitzer korrekt beenden; neu geöffnete Dialoge nicht durch alte close-Events löschen |
| src/menu.js | Vereinfachter Drawer, aktive Deep-Link-Hubs, Modifikatorfokus | Bytegleich zur Phase 3 | UIUX4 wählen, alle UIUX5-Ziele über bestehende Routen belassen |
| src/store.js | Bytegleich zum ursprünglichen Store | Frischer Export, Schutz der älteren Wiederherstellungskopie bei fehlgeschlagenem Main-Write | Geprüfte UIUX5-Fixes beibehalten; keine Datenmigration |
| src/version.js | UIUX4-ID | UIUX5-ID | Neue gemeinsame Build-ID, z. B. FP4-20261016-G-STABLE1-UIUX45; keine der Einzel-IDs wiederverwenden |
| index.html | navigation-discovery.css | journal-reviews-backup.css | Beide zusätzlichen Links behalten |
| scripts/build.mjs | Versioniert Navigation-CSS | Versioniert Journal/Reviews/Backup-CSS | Beide URL-Umschreibungen erhalten; alle veröffentlichten Dateien neu hashen |
| styles.css/Themes | Unverändert | Unverändert | Bestehende Basis behalten; zusätzliche CSS-Dateien auf Überschneidungen testen |
| Service Worker | Bestehendes Protokoll, generierter Asset-Katalog | Bestehendes Protokoll, generierter Asset-Katalog | sw-template unverändert; Worker/Cache mit neuer gemeinsamer ID frisch erzeugen, niemals fertige sw.js mergen |
| Nachlese-Validatoren | Unverändert | Enge Store-Digest-Ausnahme, keine Datenausnahme | UIUX5-Prüfung erhalten; unerwartete Store-Änderungen weiterhin ablehnen |
| tests/browser.mjs | Zwei direkte Onboarding-Einstiege, neue Mehr-Semantik | Zwei Backup-Bestätigungen, direkte Journalsuche | Beide neuen Erwartungen kombinieren, keine fachlichen Assertions entfernen |
| tests/continuity-browser.mjs | Direkte Einstellungsroute statt altem Accessible Name | Zweistufiger Restore | Beide selektiven Anpassungen verbinden |
| Daten/IDs/Schlüssel | Unverändert | Unverändert | Byteidentischer Inhaltsbestand; kein Neuimport, keine Schemaanpassung |

## Vorgeschlagene spätere Integration – hier nicht durchgeführt

Erst nach gesonderter Freigabe und Prüfung beider tatsächlicher Branch-HEADs einen neuen Branch vorschlagen: integration/uiux4-uiux5-20261016. Dieser Name ist nur dokumentiert; der Branch wurde nicht erstellt.

1. Geschützte Branch-Refs und beide Release-Manifeste sichern. Gemeinsamen UIUX3-Vorfahren verifizieren, aktuelle uncommittete Änderungen ausschließen.
2. Im neuen isolierten Integrationsworktree UIUX4 als Navigationsbasis verwenden und die UIUX5-Deltas anhand obiger Matrix prüfen. Keine pauschale ours/theirs-Auflösung, kein automatisches Cherry-pick über gemeinsame app.js-Bereiche.
3. Architektur- und Datenvertrag prüfen; neue gemeinsame Build-ID vergeben. Keinerlei zusätzliche Datenmigration, Import oder neue Produktfunktion in diesem Schritt.
4. Pflicht auf demselben tatsächlichen Integrationscommit: UIUX4 Navigation/12 Ziele/43 Routenfamilien/Discover alle 696 Ziele/Onboarding; UIUX5 Journal/alle Originalfälle/Erinnerungen/Dateiprüfung/zweistufiger Restore/Abbruch während Sperre/Datei gegen Undo; vollständige UIUX1–3-Regressionen, 1.300 NT- und 2.314 N-MC-Validatoren, Drafts, sichere Löschung/Undo, Import/Export, beide Bibeln, sieben Baumstufen, Schwert.
5. Vorher-/Nachher-Browserbilder in allen vier Themes, mobile/desktop, Tastatur/axe/200 %/Safe Areas. Reale Same-Origin-Updates von den ausdrücklich unterstützten Einzelkandidaten auf den gemeinsamen Build, bytegleiche persönliche Daten und offener Entwurf, offline Kaltstart.
6. Zwei Builds plus frischer git-archive-Build bytegleich, Inhalts-Hash unverändert, neue Dateihashes und neue ZIPs. Gerätegates UIUX1–5 bleiben offen bis echte iPhone/Safari/Home-Screen-PWA/VoiceOver-Protokolle vorliegen.

GO höchstens für getrennte isolierte Geräteprüfung. Kein Main-Merge, kein Deploy und keine Produktionsfreigabe durch diesen Integrationsvorschlag.
