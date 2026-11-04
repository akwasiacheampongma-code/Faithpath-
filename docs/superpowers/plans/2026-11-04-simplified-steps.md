# Einfacher Schritt – Implementierungsplan

> Umsetzung direkt im bestehenden isolierten Worktree, mit executing-plans und TDD. Ein unabhängiger Gesamt-Review am Ende.

**Ziel:** Nutzer wählen unter „Was möchtest du ausprobieren?“ einen von maximal drei vorhandenen Vorschlägen und bearbeiten/speichern ihn unmittelbar im einzigen Schritt-Feld.

**Architektur:** Gemeinsame Schritt-Komponente für First Seed, neue Wege und spätere Schritte. Vorhandener Vorschlagskatalog, Store und Draft-Transaktionen bleiben erhalten. Zwei optionale Textwerte im bestehenden Draft-values-Umschlag kennzeichnen einen unveränderten Vorschlag und sichern die letzten eigenen Worte. Keine neuen Storage-Schlüssel oder Schema-Migration.

**Technik:** Bestehende Vanilla-ES-Module, Node-Tests, Playwright/Chromium, Axe; keine neuen Abhängigkeiten.

**Verbindliche Spezifikation:** Nutzerauftrag vom 4. November 2026. Dessen konkrete Bedienfolge wird umgesetzt, keine weitere Konzept- oder Designfreigabe vor der autorisierten Implementierung nötig.

## Grenzen und Entscheidungen

- Basis 501f24909ed984c2edf5a8b05e5ffb8d0dc5b990; neuer Branch feature/simplified-step-experience-20261104.
- Alle 18 Lebensthemen und geprüften Texte, Bibel/Quiz, A5.1, Baumregeln, V5-Daten und Backupformat unverändert.
- Vorschlag bei leerem Feld oder unverändertem vorherigen Vorschlag sofort einsetzen. Persönliche Eingabe erfordert ausdrückliche Bestätigung; Abbruch behält sie. Eigene Worte bleiben bei Vorschlagswechseln über optionale Hilfe wiederverwendbar.
- Zwei optionale Strings innerhalb vorhandener Entwürfe sind notwendig, damit man auch nach Neustart zwischen selbst geschriebenem Text und eingesetztem Vorschlag unterscheiden kann. Keine Analyse persönlicher Texte.
- Altes stepCandidate bleibt als optional zugänglicher früherer Entwurf erhalten, ohne zweites Eingabefeld.
- Beim späteren Schritt: bereits gespeichertes Thema bevorzugen. Da historische Wege keinen Thema-ID-Vertrag haben, eindeutige vorhandene Bibelzuordnung plus Kategorie nutzen, sonst vorhandenen Kategorie-Fallback. Keine Themenabfrage und keine freie Textanalyse.
- Kein Merge, kein Deployment. Echte iPhone-/Safari-/VoiceOver-Abnahme bleibt offen.

## Review-Fokus

1. Manuell getippter Text, der zufällig einem Vorschlag entspricht, darf nicht als automatisch eingesetzter Vorschlag gelten.
2. Eigene Worte und Bestätigungsabbruch müssen nach Vorschlagswechsel und App-Neustart erhalten bleiben.
3. Bestehende Drafts mit getrenntem stepCandidate dürfen weder verlorengehen noch ungefragt übernommen werden.
4. Kategorie-/Themenwechsel darf das einzige Feld und seine Sicherung nicht neu initialisieren.
5. Mehrfaches Tippen, Speicherausfall und bestehende Wege dürfen keine doppelten Datensätze oder Baumfortschritte erzeugen.

## Aufgaben

### 1. Baseline und gemeinsame Auswahl
- [x] Saubere Basis und Baseline-Tests/Build prüfen; echte Vorher-Bilder aufnehmen.
- [x] Browser-Regressionen zuerst rot: direkter Eintrag statt Vorschau; Wechsel, eigener Text und Entwurf.
- [x] src/step-help.js: ein Editor, höchstens drei Vorschläge mit kurzen Kategorien, optionale Hilfen, expliziter Ersetzungsschutz, Draft-Metadaten.
- [x] src/first-seed/view.js, controller.js und src/app.js: bestehenden Feld-/Speichervertrag anbinden; alte Preview-Aktionen entfernen.
- [x] src/verbunden/seed.css: kompakte, erreichbare Auswahl und Textfeld; alle Themes.

### 2. Regression und Lieferung
- [x] Alte Tests nur dort anpassen, wo sie absichtlich die entfernte Zweifeld-Bedienung festschreiben; fachliche Schutzprüfungen erhalten.
- [x] Unit-/Browserprüfungen: Vorschlag → eigene Worte → Wechsel/Abbruch/Bestätigung → Pause/Neustart → Speichern; First Seed und späterer Schritt; alte Drafts und Themen.
- [x] 375/390 Pixel, vier Themes, große Schrift, Keyboard/Axe, Offline/Update und bestehende Regressionen prüfen.
- [x] Geschützte Inhalte und Baumdateien per Hashvergleich nachweisen; reproduzierbarer Preview-Build; echte Nachher-Bilder und Vergleich.
- [x] Gesamt-Review, Bericht, Commits und Vorschaupaket. Anhalten vor Merge/Veröffentlichung.
