# FaithPath – zwei AT-Kapitelquizrunden (TEST_ONLY)

**Stand 09.11.2026.** Ein isolierter, bereits lokal geprüfter Prototyp liegt als `index.html` bereit. **Er ist NICHT in die App integriert** und enthält keine Produktionsfreigabe.

## Was tatsächlich funktioniert

- 1. Könige, Kapitel 8: ursprüngliche Hauptauswahl A und freiwillige B, zusammen 10 einzigartige Originalfragen, sechs redaktionelle Einheiten.
- 2. Könige, Kapitel 15: dasselbe.
- Runde B erscheint erst nach vollständigem Abschluss aller fünf A-Fragen und wird niemals automatisch gestartet.
- Richtige Antworten, Begründungen, Einzelergebnisse, Fortschritt, Neustart und Buchwechsel funktionieren.
- Mobile und Desktop-Tests via Python/Playwright bestanden; Fragenoptionen und neue Lösungsschlüssel stammen aus dem geprüften TEST_ONLY-Importpaket.
- Prototyp benutzt ausschließlich den isolierten SessionStorage-Schlüssel `faithpath.at.preview.quiz-rounds.v1` und berührt `faithpath.v1.rebuild` nicht.

## Wichtige Architekturerkenntnis

Die bislang untersuchte App liegt auf GitHub `akwasiacheampongma-code/Faithpath-`, Branch `develop/v4`. Dort sind `src/app.js`, `src/chapter-questions.js`, `src/store.js`, `src/runtime-model.js` und `tests/chapter-questions.test.mjs` relevant. Das Verzeichnis `data/stories.json` enthält dort die **260 NT-Kapitelquiz-Einheiten**; 1KI/2KI-AT-Quizdaten sind auf diesem Branch noch nicht verfügbar. Die geprüften AT-Quellen befinden sich auf `content/at-nt-qa-20261023`. **Nicht blind AT-Daten in die produktive App kopieren oder die Main-IDs ersetzen.**

## Verbindlicher Codex-Auftrag für eine echte App-Integration

1. Prüfe zuerst den tatsächlich aktuellen App-/Design-Branch und die Datenversorgung der AT-Kapitelquizfragen; der untersuchte `develop/v4` ist möglicherweise nicht der aktuellste App-Stand.
2. Implementiere `chapter quiz variants` als separate, testweise aktivierbare Funktion; nur für `1KI` Kapitel 8 und `2KI` Kapitel 15. Nicht global alle Kapitelquiz verändern.
3. Nutze das vorhandene Kapitelquiz-Schema und den bereits bestehenden Reader-/Quiz-Navigationsfluss; keine zweite parallele Produkt-Datenhaltung oder neue ID-Konvention. Runde A muss dieselben fünf ID-Referenzen wie das bestehende AT-TEST_ONLY-Paket behalten. Runde B ist eine freiwillige zweite Auswahl, keine Änderung der Hauptquiz-Länge.
4. Benutze die IDs, Versreferenzen, Optionen und korrekten Indizes aus `preview-data.json`. Prüfe die Hashes oder den GitHub-Quellstand erneut, bevor du irgendeinen Import planst. Falls AT-Kapitelquiz im App-Branch fehlen, führe nur einen Fixture-basierten Test durch, kein unfreigegebenes AT-Massenimport.
5. Schließe Fortschritts-/Persistenz-Kollisionen aus: separate Ergebnisse je `book:chapter:round`, keine Überschreibung der existierenden Ergebnisse des Hauptquiz (`unit.id`). Eine bereits laufende Session darf nicht verloren gehen.
6. Mobile UX: Runde B ist **nach Abschluss von A** sichtbar und freiwillig, mit klarem Zurück, ohne automatischen Sprung. Bei Aufruf von B ohne abgeschlossenes A sichere Rückleitung zu A. Deep Links, Reader-Rückweg und Wiederaufnahme testen.
7. Implementiere Tests: zwei Bücher, 20 eindeutige Quellfragen, 6/6 Abdeckung je Kapitel über beide Runden, korrekte Buch-/Kapitel-Zuordnung, A/B-Lösungsschlüssel, B-Gating, Wiederaufnahme, Back/Forward, Neustart, Reader-Link, mobile Auflösung, und nachgewiesene QA bei deaktivierter Funktion.
8. Erstelle eine **separate Test-Branch-/Preview-Version**, keinen Merge auf `main`, keine Änderungen an produktiven Daten, keine automatische Netlify-Produktion. Ein isolierter Review-PR ist möglich, aber **nicht mergen**.
9. Rapportiere die echten Testergebnisse mit exakten Kommandos, Screenshots, Branch/SHA sowie verbleibenden fachlichen Freigabeblockern. Vermerke eindeutig `human_approved=false` und `production_import_allowed=false`.
10. Den bestehenden Gesamt-Preflight nicht kosmetisch auf `PASS` setzen. Die Kapitelabdeckung darf erst als erledigt gelten, wenn die zweite Runde im echten App-Fluss **erreichbar** und durch einen aktualisierten Validator geprüft ist. Die beiden neuen NUM17-ED-Fragen bleiben bis unabhängiger redaktioneller Abnahme gesperrt.

## Prototyp testen

Direkt `index.html` in einem Browser öffnen. Wenn lokal keine HTML-Dateien ausgeführt werden, eine **neue, von FaithPath-Produktion getrennte** Netlify-Testsite anlegen und nur `Netlify_TEST_SITE.zip` hochladen; das bestehende FaithPath-Netlify-Projekt nicht verwenden.

Für den automatisierten Test (Chromium + Python Playwright erforderlich):

```bash
python test_preview.py
```

**Erwartetes Ergebnis:** `PASS: 20 question fixtures, mobile+desktop A/B flows, gating, answer evaluation, reset, chapter separation, no JS exception`.

## Freigabe

`TEST_ONLY=true` · `human_approved=false` · `production_import_allowed=false` · `deploy_production=false`
