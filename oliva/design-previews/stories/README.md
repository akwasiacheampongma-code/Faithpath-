# OLIVA · Drei Geschichten-Vorschauen

Eigenständige Gestaltungsstudie zur ausdrücklich beauftragten Vorabprüfung. Sie ist getrennt vom App-Laufzeitpaket und vom persönlichen OLIVA-Datenbestand. Die vollständige Sammlung wird **erst nach der Gestaltungsfreigabe** integriert.

Die sieben Beispielabschnitte enthalten 36 echte Originalfragen und sieben Originalreflexionen. Der Zielbestand bleibt 436 Einheiten, 2.479 Fragen und 436 Reflexionsimpulse. Hier werden weder diese Vollintegration noch eine vollständige Story-Persistenz vorgetäuscht.

Die drei Hauptansichten:

1. Bibliothek mit einem ruhigen Bildeinstieg, Titel-/Stellensuche, Gesamte-Bibel-/NT-/AT-Dropdown und kompakten Bild-/Textkarten.
2. „In der Krippe“, Lukas 2,1–20 (NS-0241): vorhandene Illustration, Zugang zum gemeinsamen echten Reader, sechs Originalfragen und Originalreflexion.
3. Psalm 23 (NS-0073): bewusst bildlose typografische Gestaltung, fünf Originalfragen und Originalreflexion.

Weitere echte Beispiele: Noah, Abram, David vor Goliath, die Stillung des Sturms und der Ostermorgen. Bilder zeigen teilweise einen engeren Moment als die gesamte Originaleinheit; die Bildbeschriftung nennt dies.

Die temporären Antworten und Gedanken liegen ausschließlich im Arbeitsspeicher der geöffneten Vorschauseite. Neuladen verwirft sie. Keine AppData-Migration, Sammlungseinträge, Baumaktion, Leseabschluss, Rangliste oder neue Bildgenerierung. Der gemeinsame Reader wird als bestehende private App in einem neuen Tab geöffnet; nach der Vollintegration würde der Rückweg innerhalb derselben App erfolgen. Diese Abweichung ist in der Vorschau sichtbar erklärt.

build.mjs übernimmt die aktuelle Palette aus src/design-system/theme.ts, die beiden Originalschriftdateien und ausschließlich unveränderte vorhandene WebPs. Keine neuen Framework-/Laufzeitabhängigkeiten. Der zugehörige Sites-Checkout ist ein eigenes privates Vorschauprojekt; keine weitere HTML-Datei wird in das einseitige OLIVA-PWA-Hosting eingeschleust.

Prüfen:

    node --test design-previews/stories/model.test.mjs
    python design-previews/stories/verify-original.py --faithpath-git /workspace/faithpath-reference
    node design-previews/stories/build.mjs /workspace/sites/oliva-stories-design-preview

Der Builder verweigert das Überschreiben eines vorhandenen dist; zunächst den bisherigen Kandidaten außerhalb des Checkouts sichern. check-preview.mjs prüft Dateihashes, Assetpfade, Quellengrenzen und den wahrheitsgemäßen Vorschauumfang.

dom-unit-test.mjs führt die tatsächlichen Handler mit einem separat bereitgestellten **linkedom** aus. Der Pfad ist über OLIVA_DOM_PACKAGE einstellbar. Das ist eine Node-DOM-Einheitsprüfung mit ausdrücklich dokumentierten Dialog-/Fokus-/Select-Shims; kein Browser, keine visuelle Layoutprüfung und kein Screenreader-/Gerätetest. Das Testwerkzeug gehört nicht zum ausgelieferten Paket.

In dieser verwalteten Sites-Umgebung fehlt cua_repl.js. Deshalb wird kein alternativer Browser-Steuerungsweg für das neue Site-Hosting verwendet. Die Ansicht auf dem echten Smartphone und die Gestaltungsabnahme durch den Nutzer bleiben maßgeblich. Private Veröffentlichung, Paket-/HTTP-Prüfung und Zugriffsschutz werden separat im Liefernachweis dokumentiert.
