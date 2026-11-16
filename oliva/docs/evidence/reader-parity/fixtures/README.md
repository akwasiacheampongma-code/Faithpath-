# Reader-V9-Fixtures · 15. November 2026

Die laufende Reader-Arbeitskopie verwendet AppData V9. Bestehende Tests erwarten deshalb nach einer tatsächlichen Migration oder ausdrücklichen Speicherung V9. Ihre alten Eingaben behalten Version 1–7 und ihre bisherigen Felder. `nt-migration.test.ts` prüft zusätzlich ausdrücklich den eingefrorenen `v8DataSchema`: NT-Feld erforderlich, alte Version akzeptiert, aktueller V9-Prüfer lehnt das V8-Label ab. Unbekannte Zukunftsversion bleibt 999. Der bisherige Abschnittsprüfer aus `position.ts` wird unverändert als historischer Vertrag getestet.

Die bestehenden Browserfälle für Johannes-/Römer-Quellen und David erwarten jetzt den ganzen Kapiteltext um einen hervorgehobenen logischen Abschnitt. Sie prüfen die Fokusgrenzen und bewahren die Aussage, dass nur die ausdrückliche Bestätigung den Abschnitt zählt. Der Offline-Fließtextfall vergleicht den vollständigen kanonischen Kapiteltext und acht David-Fokusverse; erst der gesonderte ganze-Lesebereich-Button ändert den logischen Scope. Der Großschriftfall scrollt zum tatsächlichen Vers35 statt zu einem nur im alten Teilausschnitt existierenden Absatzstart35.

Tatsächlich ausgeführt:

- `npm run typecheck`: Exitcode0, keine TypeScriptfehler. [Rohlog](typecheck.txt).
- Vollständiger Unitlauf: **272/272 Tests** in **31 Testdateien** erfolgreich, keine fehlgeschlagenen oder ausstehenden Tests; 21:17:18–21:18:08 UTC. [JSON-Rohbericht](unit-results.json), [Log](unit.txt).
- `git diff --check -- tests`: erfolgreich.

Ein früher diagnostischer Unitlauf wurde bereits während der Fixtureanpassung begonnen. Er enthielt drei noch geladene veraltete V8-Erwartungen und bleibt als `unit-initial.*` erhalten; er ist kein stabiler Vorher-Baselinevergleich. Der erste Typecheck mit dem damals noch alten Einladungsfixture bleibt als `typecheck-before.txt` erhalten.

Die Browserfälle sind vorbereitet, **noch nicht ausgeführt**. Es erfolgten hier kein Build, kein Deployment und keine Simulator- oder echte Geräteprüfung. Der veröffentlichte0.12-Stand und die separate Buchsuche-Arbeitskopie wurden nicht verändert. Einzelkennungen und Quellhashes stehen in [verification.json](verification.json).

Nach dem Unitlauf wurde ausschließlich die bestehende Buchbereich-Browseraktion in `swords.spec.ts` an den separat geprüften Buchsuche-Funktionscommit `6b8fa1a` angepasst: natives `Bibelbereich`-Dropdown mit `selectOption("Alle")`. Dieser Browserfall bleibt bis zur Übernahme des Funktionscommits und der späteren Browserprüfung ungetestet. Unitquellen wurden dadurch nicht verändert.
