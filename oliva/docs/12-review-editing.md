# Iteration 0.7 · Rückblicke bearbeiten, löschen und zurückholen

Stand: 07.11.2026, **0.7.0 seit 20:10:37 UTC privat bereitgestellt**, entwickelt auf `feature/oliva-v07-review-history-20261107`.
Die private Website liefert Kernbuild `oliva-f5f1df50305ec1e5` als Hostpaket `oliva-7173147c3f6d4bca` aus; der Eigentümerzugriff bleibt unverändert.
Der geschützte Vorgänger ist Tag `oliva-v0.6-book-identities-private`, Commit `9b28f586574a380ef40419b02fccb68301c8287c`.
Aktueller Quellschutz, private Sites-Quelle und Deploymentkennungen stehen im [Fortsetzungsstand](../RESUME.md); die historischen 0.6-Belege bleiben erhalten.

## Produktvertrag

Ein eigener gespeicherter Vorhaben-Rückblick lässt sich textlich korrigieren. Seine `id`, `createdAt`, `applied` und der vollständige damalige `source`-Snapshot bleiben erhalten; der Editor bietet keine nachträgliche Erfahrungsbestätigung an.
Nur ein tatsächlich anderer, getrimmter Text setzt das optionale `updatedAt` und erhöht die Vorhabenrevision. Ein unveränderter Text schließt den Entwurf ohne erfundenes Bearbeitungsdatum oder neue Vorhabenrevision ab.
Neue Rückblicke erhalten weiterhin nur ihren ursprünglichen Erstellzeitpunkt. Eine Textkorrektur erzeugt weder einen zweiten Rückblick noch neuen Fortschritt.

Löschen erfordert eine gesonderte Bestätigung. Danach fehlen Rückblick **und Snapshot im aktuellen Vorhabenbestand**; sie werden daraus auch nicht mehr als aktiver Rückblick exportiert.
Die Bestätigung erklärt die Grenze: Schon vorhandene Exporte, unveränderte Import-Originalblobs und Rückkehrsicherungen können weiterhin Kopien enthalten. Diese werden durch eine Rückblicklöschung nicht nachträglich bereinigt.
Ein offener Bearbeitungsentwurf desselben Rückblicks muss zuerst abgeschlossen oder ausdrücklich verworfen werden. Archivierte Vorhaben erlauben keine Rückblickänderung oder -löschung.

## Nutzdaten V6 bei bestehenden Speicherorten

0.7 führt erstmals **AppData V6** ein. `decodeData()` prüft V1–V5 jeweils mit ihrem bisherigen strikten Vertrag, bevor es die Daten nach V6 überführt.
Die alten persönlichen Schemas sind in `schema-v5.ts` eingefroren; dessen SHA-256 entspricht bytegenau dem persönlichen Schema des gesicherten 0.6-Checkpoints (`8d06b7927a97da24988f88ac72a42483169b390ed124f7f6b3043db9f252063e`).
V2–V5 akzeptieren dadurch weder das neue `review-edit` noch ein Rückblick-`updatedAt`. Unbekannte Versionen und beschädigte Datensätze werden abgelehnt, ohne den Bestand still zurückzusetzen.
Die Migration erhält bestehende Rückblicke, Entwurfsworte, IDs, Revisionen, Leseposition und Importquellen; sie erfindet kein Bearbeitungsdatum.
Sie ergänzt lediglich `version: 6` und `retainedReviewGrowth: { reflections: 0, actions: 0 }` zu den bereits vorgesehenen früheren Migrationsergänzungen.

`retainedReviewGrowth` enthält genau **zwei anonyme Zähler**: `reflections` und `actions`. Beide sind sichere, nicht negative Ganzzahlen; `actions ≤ reflections`.
Es enthält keine gelöschten Texte, IDs, Zeitpunkte, Quellen oder Snapshots. Löschen ersetzt den bisherigen Beitrag durch `+1` Reflexion und, bei damals bestätigtem `applied`, `+1` Erfahrung.
So bleiben auch spätere Wachstumsschwellen erhalten, ohne persönliche Löschinhalte als Historie aufzubewahren. Undo nimmt genau diese Zählerbeiträge zurück.
Autosave, Verwerfen, Textkorrektur, Löschen und Undo führen keine Wachstumsberechnung aus. Ein wirklich neuer, ausdrücklich gespeicherter Rückblick bleibt eine eigene Aktion.

Die physische SQLite-Schemaversion bleibt **3**, IndexedDB `oliva-local-v1` bleibt **1**, das private Speicherdokument bleibt **1**. Es entsteht keine Ersatzdatenbank.
Originalarchive und ihre Hashes bleiben unverändert. Alte OLIVA-Sicherungen bleiben lesbar; neue V6-Sicherungen benötigen einen V6-fähigen Build. FaithPath-V5 ist weiterhin ein eigenes Importformat.

## Dauerhafter Bearbeitungsentwurf und Konflikte

Ein `review-edit` speichert Zielvorhaben, Zielrückblick, erwartete Vorhabenrevision, vollständigen Review-Hash, eigene Worte und den ursprünglichen Quell-Snapshot.
Der SHA-256 basiert auf dem kanonischen tatsächlich gespeicherten JSON des **gesamten** Rückblicks: auch ID, Erfahrung, Quelle und beide Zeitfelder zählen. JSON-Schlüsselreihenfolge und nicht gespeichertes `undefined` ändern ihn nicht.
Die bestehende Entwurfssicherung erhält Leerzeichen und Zeilenumbrüche; erst der endgültige Rückblicktext wird getrimmt. Entwurfs-ID und -Revision sichern jede Änderung gegen veraltete Editorstände ab.
Endgültiges Speichern prüft zusätzlich aktive Zielvorhabenrevision, Review-Hash und identische Quelle. Rückblickänderung und Entfernen des Entwurfs erfolgen gemeinsam im bestätigten Datenbankcommit.
Bei Schreibfehlern bleiben gespeicherter Rückblick und gesicherter Entwurf erhalten. Der sichtbare Speicherstatus bleibt maßgeblich für noch ausstehende Eingaben.

Ist nur das Vorhaben inzwischen geändert, lässt sich der Entwurf nach Prüfung ausdrücklich mit dessen aktueller Revision verbinden, **solange der gesamte Zielrückblick unverändert ist**.
Bei einem echten Review-Konflikt zeigt der Editor aktuelle und eigene Worte, blockiert das Überschreiben und bietet Entwurfsexport oder bestätigtes Verwerfen an.
Fehlende Rückblicke oder Vorhaben sowie archivierte Ziele lassen eigene Entwurfsworte weiterhin lesbar, exportierbar und verwerfbar.
Ein solcher Entwurf legt aus einem gelöschten Ziel niemals einen neuen Rückblick an und erzeugt kein Wachstum. Die Sammlung führt auch zu dieser Rückblickbearbeitung zurück.

## Schreibreihenfolge und einmaliges Undo

Autosave und explizite Aktionen teilen dieselbe Commit-Warteschlange. Globale Datenbankrevision, Entwurfsstempel und Vorhabenrevision bilden getrennte Vergleichsprüfungen gegen überholte Stände (CAS).
Erst ein erfolgreich abgeschlossener Schreibvorgang bestätigt Edit, Delete oder Undo. Doppeltippen auf eine laufende Aktion wird gesperrt; Export wartet auf angestoßene Schreibvorgänge.

Es gibt genau **ein RAM-Undo** für die zuletzt angebotene Löschung in der geöffneten Vorhabenansicht. Weder Token noch gelöschter Rückblick werden dafür in Datenbank oder Sicherung geschrieben.
Undo setzt nur den unveränderten gelöschten Rückblick an seine frühere Position zurück und korrigiert die beiden Zähler. Es stellt keinen kompletten alten Datenstand wieder her; neuere Änderungen anderer Bereiche bleiben erhalten.
Erwartete Zielrevision, vollständiger Review-Hash, freie ID, gültige Position, passende Zähler und Sitzungs-Epoche müssen weiterhin passen.
Neuladen, Hydrierung, Aktualisieren, Restore, Import oder Import-Rückkehr entwerten alte Undo-Tokens. Verlassen der Ansicht verwirft ihr Angebot; eine weitere Löschung ersetzt das vorherige Angebot.
Eine Navigationsgeneration verhindert auch dann ein neues Undo-Angebot, wenn ein zuvor gestartetes Delete erst nach dem Verlassen beziehungsweise erneuten Öffnen fertig wird.

Zwei gefundene Nebenläufigkeitslücken sind geschlossen: Hydrierung respektiert den Aktionslock und wird hinter wartenden Autosaves eingeordnet; ein verspäteter Delete-Abschluss prüft Fokus und Navigationsgeneration.
Die Store-Regressionen halten Schreib-/Leseversprechen gezielt an. Der Browserfall hält die echte IndexedDB-`oncomplete`-Bestätigung zurück, verlässt die behaltene Detailansicht über Profil und gibt den Abschluss erst danach frei.
Der erste Browser-Harness nutzte Navigation mit Ersetzung und scheiterte an seiner Back-Erwartung; das war kein ausgeführter Nachweis des Produktrennens. Die korrigierte Variante und die Diagnose bleiben erhalten.

## Webzugänglichkeit

Die Web-Shell kennzeichnet Kopfbereich, Hauptinhalt und Hauptnavigation als `banner`, `main` und `navigation`.
Der zugängliche Profilname enthält die sichtbare Initiale beziehungsweise „Du“ sowie „Profil und Einstellungen“.
Die Editorprüfung umfasst 320, 390 und 1.440 CSS-Pixel, Hell/Dunkel, unveränderte Eingaben und fehlenden horizontalen Überlauf. Screenshots liegen unter `docs/evidence/session-07/screens/`.

## Vorliegende Prüfung und Abnahmekriterien

Session 07 trennt lokale Kernprüfungen, native JavaScript-/Assetexports und den privaten HTTP-Bereitstellungsnachweis.

| Prüfung | Tatsächlich vorliegender Beleg |
| --- | --- |
| Fach-/Persistenztests | **116/116 bestanden**, einschließlich Schemafreeze, V6-Migration, Text-/Quellenschutz, Wachstum, Fehler, CAS und Undo; `unit-results.json` |
| TypeScript | `typecheck.txt` ohne Typfehler |
| Finaler vollständiger Browserlauf | **59/59 bestanden**, einzelner Gesamtlauf ohne Fehler, Überspringen oder Flaky-Ergebnis; `e2e-results.json` |
| Erster fokussierter Browserlauf | **5/6 bestanden**, ein Axe-Fehler für fehlende Landmarks und Profilnamen; `reviews-first-red.json` |
| Nebenläufigkeitsregression | **1/1 bestanden** im gezielten Zweierlauf; der dortige Axe-Fall war noch rot; `review-fixes-e2e.json` |
| Axe nach beiden Korrekturen | **1/1 bestanden**, keine Axe-Verletzung in diesem Editorfall; `review-a11y-fixed.json` |
| Native Debugexports | Android/iOS mit `--no-minify --no-bytecode` erfolgreich; `native-builds.json` bestätigt Bundles und erforderliche Assets, keine Geräteausführung |
| Lokaler 0.6→0.7-Offlinewechsel | Erfolgreich in demselben Chromium-Profil und Origin, synthetischer Bestand; `offline-upgrade.json` und fünf `offline*.png` |
| Private Bereitstellung | Deployment erfolgreich; HTTP: 15 App-Routen, 98 App-/42 Review-Dateien bytegenau, anonym 401; `private-deployment.json` und `private-http-check.json` |

Die Dateien stehen unter [`docs/evidence/session-07/`](evidence/session-07/). Der finale vollständige Browserlauf hat **59/59 Szenarien ohne Fehler, Überspringen oder Flaky-Ergebnis** bestanden. Es ist ein einzelner grüner Gesamtlauf gegen den finalen Build `oliva-f5f1df50305ec1e5`. Frühere Fehlerberichte bleiben erhalten.

Der finale tatsächliche Workerwechsel führt von 0.6-Build `oliva-a542b7009551a2a2` zu 0.7-Build `oliva-f5f1df50305ec1e5`. Der frühere Versuch gegen `oliva-256ab3e20eff2850` ist separat archiviert.
Hydrierung migriert V5→V6 im RAM mit Zählern `0/0`; bis zur ausdrücklichen Rückblickbearbeitung bleibt der gespeicherte V5-`main`-Datensatz exakt erhalten (JSON-SHA-256 `977c660c951107fa7afba964e822cce1437a8220552c4a6d5de0527ab0135637`).
Erst das Anlegen des Bearbeitungsentwurfs schreibt V6 im privaten Dokument V1. Der anschließende Textabschluss erhält Review-ID, Quelle, Erstellzeit und Erfahrungsbestätigung; die Vorhabenrevision steigt einmal von 2 auf 3.
Profil, Wachstum, sämtliche Lesefortschritte, alter Journalentwurf und alle drei anderen Datensätze einschließlich Originalblob und Rückkehrsicherung bleiben unverändert. Verglichen sind die exakten UTF-8-JSON-Werte, keine Datenbankdateibytes.
Offline-Neustart, gespeicherte Bearbeitung, sieben A51-Stadien, Johannesroute samt dekodiertem PNG und Reload sowie ein ausschließlich im Vorgängercache vorhandener JS-Chunk sind bestanden. Dies ist lokale Chromium-Evidenz, keine gehostete oder physische Geräteprüfung.

Die fachliche Abnahme verlangt: nur Textänderung, unveränderte historische Identität/Quelle/Erfahrung, kein Fake-Edit bei No-op, kein Wachstum durch Verwaltungsaktionen, erhaltene Konfliktworte, keine Wiederanlage gelöschter Ziele und keine Überschreibung neuerer Daten durch Undo.
Die Browserabnahme ergänzt echten Neustart/offline, Export ohne den aktiven gelöschten Rückblick, Verlust des Undo beim Verlassen sowie den angehaltenen IndexedDB-Abschluss. Der einzelne finale 59er-Gesamtlauf und der separate Updateversuch sind beide bestanden.

Der erste komplette 0.7-Lauf bestand 57/59. Ein echter UI-Fehler übergab bei Verwerfen eine leere Zeichenfolge als Erfolg und zeigte dadurch eine gespeicherte Erfahrung an, obwohl kein Eintrag entstand. Die getrennte Discard-Rückgabe behebt das. Der zweite rote Fall war ein V1-Testfixture mit versehentlichem V6-Feld; das Fixture wurde korrigiert. Finale 59/59 enthalten beide Fälle; frühere Berichte sind nicht überschrieben.

## Offene Grenzen

Die private gehostete Vorschau ist auf 0.7 aktualisiert, mit unverändertem Eigentümerzugriff. Mangels des vorgesehenen CUA-Werkzeugs gibt es keine zusätzliche gehostete Browserprüfung; HTTP-Prüfung und lokale Chromiumfälle bleiben getrennt. Es gibt keine öffentliche Freigabe oder neuen öffentlichen Push aus dieser Arbeit.
Native Debugexports ersetzen keine SQLite-/Crash-/Low-Disk-, Dateidialog-, Zurück-/Tastatur-, VoiceOver-/TalkBack-, große-Schrift- oder physischen Gerätetests; auch Installation, Speicher, Energie und native Animation bleiben offen.
Auth/Sync, Live-KI und Audio sind weiterhin nicht angebunden. Fachliche Inhaltsprüfung, Anfänger-Usability, öffentliche Inhalts-/Bildrechte und Store-Signing bleiben offen; A51 ist weiterhin von der allgemeinen OLIVA-MIT-Lizenz ausgenommen.
Die Daten und Exporte bleiben unverschlüsselt. Diese Iteration ist kein vollständiges persönliches Historienmodell und keine Gesamtprojektabnahme.

