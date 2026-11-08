# Freiwillige Einladungen · OLIVA 0.10

Stand: 08.11.2026. **0.10 ist geprüft und seit 20:31:27 UTC eigentümerprivat bereitgestellt.** Die zunächst ausgeschaltete Funktion erschließt ältere Vorhaben und Gedanken innerhalb der App. Sie misst keinen Glauben, erzeugt keinen Nachholbedarf und löst kein Baumwachstum aus. [Direkt öffnen](https://oliva-v04-private-preview.purplebean128.chatgpt.site/einladungen).

## Bestandsgrundlage und eigenständige Umsetzung

Verglichen wurde ausschließlich der unveränderte FaithPath-Snapshot [`a519ce898fa33907b07d5ac7a585595127556183`](https://github.com/akwasiacheampongma-code/Faithpath-/tree/a519ce898fa33907b07d5ac7a585595127556183), Branch `feature/simplified-step-experience-20261104`:

- [`src/domain.js`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/domain.js): `gaps()` wählt belegte Quellen mit 21 beziehungsweise 35 Tagen Abstand aus.
- [`src/reminders-view.js`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/reminders-view.js): Erklärung, zurückgestellte Quellen und Wiederzulassen. Das Original bezeichnet die Funktion ausdrücklich als Einladungen beim Öffnen oder Nutzen der App.
- [`src/app.js`](https://github.com/akwasiacheampongma-code/Faithpath-/blob/a519ce898fa33907b07d5ac7a585595127556183/src/app.js): Aktionen `snooze`, `dismiss-gap` und `resume-reminder`, einschließlich 14 Tagen Zurückstellung.

OLIVA verwendet dafür eine eigene TypeScript-/React-Implementierung und das bestehende lokale Datenmodell. Die fachlichen Regeln werden angepasst, der alte Renderer und seine globale Datenhaltung werden nicht übernommen. Die beauftragte Wiederverwendung begründet keine zusätzlich behauptete allgemeine Weiterveröffentlichungslizenz für ursprüngliches FaithPath-Material. Originaldateien, `main` und historische Tags werden nicht verändert; eine öffentliche Web-/Storeveröffentlichung ist nicht freigegeben.

## Verhalten

**Einstellungen → „Gedanken wiederbegegnen.“ → „Einladungen in der App erlauben“** aktiviert die Funktion freiwillig. „Deine Einladungen ansehen“ öffnet `/einladungen`. Bei eingeschalteter Funktion und fälligen Quellen ergänzt die Startseite einen ruhigen Zugang. Es gibt keine Push-, E-Mail- oder Hintergrundbenachrichtigungen und keine Benachrichtigungsberechtigung.

| Quelle oder Entscheidung | Regel |
| --- | --- |
| Aktives Vorhaben | Frühestens 21 Tage nach der letzten belegten Aktivität. Maßgeblich sind Anlage, angelegte/abgeschlossene Schritte, angelegte Rückblicke sowie angelegte/bearbeitete verknüpfte Gedanken. |
| Eigenständiger Gedanke | Frühestens 35 Tage nach Anlage oder letzter gespeicherter Bearbeitung. Mit einem Vorhaben verknüpfte Gedanken erzeugen keine zusätzliche eigenständige Einladung. |
| Reine Vorhaben- oder Rückblickkorrektur | `goal.updatedAt` und `review.updatedAt` beginnen keinen neuen Erfahrungszeitraum. Entwurfsautosaves zählen ebenfalls nicht. |
| Für 14 Tage zurückstellen | Erscheint frühestens nach 14 Tagen wieder, wenn die App genutzt wird. Ein vorhandenes Ausblenden wird für diese Quelle aufgehoben. |
| Einladung ausblenden | Bleibt für diesen belegten Quellenstand ausgeblendet. Spätere belegte Aktivität kann nach dem passenden Zeitraum eine neue Einladung ermöglichen. Der ursprüngliche Eintrag wird nicht gelöscht. |
| Wieder zulassen | Entfernt die gespeicherte Zurückstellung beziehungsweise Ausblendung. Die globale Einstellung und der Quellenzeitraum bleiben maßgeblich. |
| Insgesamt ausschalten | Unterdrückt fällige Einladungen und bewahrt bisherige Entscheidungen. Zurückgestellte/ausgeblendete vorhandene Quellen bleiben verwaltbar. |
| Archiviertes oder fehlendes Vorhaben, gelöschter Gedanke | Erscheint nicht als Einladung. Kontrollmetadaten rekonstruieren keinen gelöschten Inhalt. |

Die Liste nennt Quelle und Datum. „Zum Vorhaben“ öffnet den vorhandenen Vorhabenbereich. „Gedanken öffnen“ führt mit `view=read` zur betreffenden Karte in der Sammlung; es startet keinen Journalentwurf und ersetzt keinen vorhandenen Entwurf. Bearbeiten bleibt eine separate Aktion. Längere Listen werden in Gruppen zu fünf Karten erschlossen.

Zeit wird beim Fokus und bei Rückkehr in die aktive App neu geprüft; während ein entsprechender Bildschirm aktiv ist, höchstens einmal pro Minute. Beim Verlassen oder im Hintergrund wird der Intervalltimer entfernt. Das Verstreichen von Zeit schreibt keine Daten und bestätigt keine Erfahrung.

## Architektur, Speicherung und Konflikte

- `src/features/invitations/model.ts`: reine Auswahl, Datumsregeln und Kontrollaktionen; keine UI-, Netzwerk-, Benachrichtigungs- oder Speichereffekte. Zugeordnete Notizaktivität wird einmal gesammelt. Der ausgeschaltete Zustand ohne vorhandene Entscheidungen benötigt keine Quellenprojektion; Text-Hashes werden nur für tatsächlich angezeigte fällige oder zurückgestellte Quellen berechnet.
- `schema.ts`: strikte Validierung der Kontrollen; Schlüssel `goal:<id>` beziehungsweise `note:<id>`, gültige ISO-Datumswerte, maximal 10.000 Einträge je Kontrollsammlung. Die ID-Grenzen bewahren auch bereits zulässige IDs mit Zeilentrennern.
- `useInvitations.ts`, `InvitationSettings.tsx` und `app/einladungen.tsx`: fokussierte Zeitprojektion, freiwillige Einstellung und echte Aktionen. Bestehende fünf Hauptnavigationsbereiche bleiben bestehen.
- `src/state/store.ts`: Einstellung und Entscheidungen nutzen dieselbe geordnete Schreibwarteschlange und atomare Revisionsprüfung wie andere Daten. Zusätzlich bindet ein Quellen-/Kontrollstempel die Aktion an den angezeigten Stand. Veraltete Aktionen oder fehlgeschlagene Schreibvorgänge überschreiben keine neueren Entscheidungen. `updateGrowth=false` bewahrt Fortschritt und Baumstadium.

Die **Nutzdatenversion steigt von V6 auf V7**. Neu ist ausschließlich das oberste Feld:

```json
{
  "invitations": {
    "enabled": false,
    "snoozed": {},
    "dismissed": {}
  }
}
```

`decodeData()` akzeptiert weiterhin V1 bis V6, ergänzt die ausgeschalteten Kontrollen im Arbeitsspeicher und erhält bestehende Inhalte, Rückblicke, Entwürfe, Leseposition, Revision und Wachstum. `v6DataSchema` bleibt strikt; V7-Felder werden nicht still in alte Versionen aufgenommen. Hydrierung und reine Einladungsansichten schreiben den Vorgängerbestand nicht automatisch um. Erst der nächste tatsächlich gespeicherte Vorgang schreibt V7.

Das **private Speicherdokument bleibt V1**, die physische **SQLite-Datenbank V3** und **IndexedDB V1**. Archivblobs und Rückkehrsicherungen bleiben gesondert erhalten. OLIVA-Backups exportieren die gespeicherten Entscheidungen und akzeptieren beim Einlesen weiterhin ältere Formate. Die Kontrollen enthalten IDs und Zeitpunkte, keine Kopien persönlicher Texte.

## Prüfkriterien und derzeitiger Nachweis

| Abnahmekriterium | Nachweis beziehungsweise Stand |
| --- | --- |
| Opt-in, exakte 21-/35-/14-Tage-Grenzen, neue belegte Aktivität und Wiederzulassen | **154/154 Fachtests** im finalen Kandidaten, einschließlich 14 Modell-, neun Migrations- und elf Storetests; `unit-results.json`. |
| Keine Daten- oder Wachstumsänderung durch Projektion; atomare Aktionen und Fehler-/Konfliktschutz | Modell-/Storetests und **6/6 integrierte Browserfälle** erfolgreich, einschließlich echtem IndexedDB-Konflikt; `e2e-targeted.json`. |
| V6 unverändert lesbar, striktes V7, Archiv und Backup-Roundtrip | Migrationssuite einschließlich drei Zeilentrenner-Regressionsfälle im vollständigen 154er-Lauf erfolgreich. |
| Kleine/große Displays, Hell/Dunkel, erreichbare Aktionen und keine unnötigen Entwürfe beim Quellenöffnen | 320 Pixel Hell/Dunkel, 1440 Pixel und Axe erfolgreich; echter vorhandener fremder Entwurf bleibt beim schreibfreien Quellenlink erhalten. Screens unter `screens/`. |
| Offline-Erstbesuch und Reload, echter 0.9→0.10-Workerwechsel ohne unbeabsichtigtes Umschreiben des Vorgängerbestands | **Erster echter Lauf erfolgreich**. Gleicher Origin und persistentes Profil, alte V6-Rohdaten vor Opt-in exakt; nach Opt-in alle 18 anderen V6-Felder und drei weitere Datensätze exakt. `upgrade/offline-upgrade.json`. |
| Android-/iOS-JavaScript-/Assetexporte enthalten die integrierte Funktion | Beide Exporte und portable Syntax-/Assetprüfung erfolgreich; unveränderter Runtime-Digest über 291 Inputs. Je 98 A51-/sechs Buch-PNGs und drei David-WebPs bytegenau. `native/native-builds.json`. Kein Simulator-/Gerätebeleg. |
| Vollständige Regression des integrierten Kandidaten | **Ein einzelner vollständiger 82/82-Browserlauf erfolgreich**, keine Skips/Flaky/Wiederholungen; `e2e-results.json`. |

Rohbelege unter `docs/evidence/invitations/`. Frühere Zwischenstände bleiben unverändert: `unit-ui.json` enthält 151 Fälle vor den drei zusätzlichen Zeilentrennerfällen; `unit-results.json` enthält den tatsächlichen erweiterten Gesamtlauf mit **154/154**. Die private Bereitstellung und tatsächliche HTTP-/Publikumsprüfung sind erfolgreich: 18 Routen, 105 App-Dateien (104 Hashvergleiche und HTML-Shell), 42 Review-Dateien bytegenau; anonym 401, unverändert eigentümerprivat. Quellensicherung und tatsächliche Remote-CI folgen separat. Fehlende Ergebnisse werden nicht aus Vorgängerprüfungen abgeleitet.

## Bewusste Grenzen und offene Master-Aufgaben

Markierungen aus dem bisherigen OLIVA-Modell besitzen kein belegtes Anlage-/Aktivitätsdatum. Für sie wird kein Alter erfunden; entsprechende Einladungen sind noch nicht unterstützt. Diese Umsetzung behauptet deshalb keine vollständige Erinnerungsparität. Alte FaithPath-`reminderSnoozes` und `dismissedGaps` werden nicht still auf die neuen aktiven Kontrollschlüssel umgebogen; der unveränderte Originalimport bleibt im Archiv erhalten.

Die Zeitprojektion hängt von der lokalen Geräteuhr ab. Physische Geräte, Screenreader, Speicher-/Energieverhalten und echte Anfänger-Usability müssen weiter geprüft werden. Weder die Einladung noch die Dauer einer Pause ist ein Maß für persönlichen Wert oder Glaubensstärke.

Der ursprüngliche Fließtext-Lesemodus und der fertige vollständige NT-Verständnisfragenkatalog bleiben aktive Paritätslücken. Weitere Buchbilder, Kapitelredaktion, unabhängige Inhaltsprüfung, Auth/Sync, Live-KI, Audio und die übrige Gesamt-Definition-of-Done bleiben offen; siehe [Plan und Bestandsparität](16-current-plan-and-parity.md). Der geprüfte Abschluss dieser Iteration würde den ursprünglichen Master-Prompt nicht abschließen.
