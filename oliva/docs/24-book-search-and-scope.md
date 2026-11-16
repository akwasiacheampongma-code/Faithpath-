# Buchsuche und Bibelbereich · 0.12.1

Der Nutzerauftrag vom 15.11.2026 ergänzt den Master: Buchnamen sollen trotz Leertaste gefunden werden; die normale Auswahl umfasst die ganze Bibel, danach grenzt ein Dropdown auf NT oder AT ein. Die Änderung ist ein eigenständiger Patch auf dem geprüften 0.12-Stand. Unfertige V9-Readerarbeit bleibt in einer separaten Arbeitskopie erhalten.

## Verhalten und Abnahme

| Fall | Erwartetes Ergebnis |
|---|---|
| Bibel neu öffnen | „Gesamte Bibel“, alle 66 Bücher |
| Neues Testament wählen | 27 Bücher, vollständige deutsche Beschriftung mit NT |
| Altes Testament wählen | 39 Bücher, vollständige deutsche Beschriftung mit AT |
| `Markus `, ` M a r k u s `, Unicode-Abstände | Markus wird gefunden |
| `1 Mose`, `1.Mose`, `1. Mose`, vollbreite Zeichen | 1. Mose wird gefunden |
| Nur Leerzeichen | Alle Bücher des gewählten Bereichs |
| Tastatur im Web | Nativer HTML-Select, Fokus sichtbar, Auswahl mit Pfeilen/Home/End |
| NT-Fragenübersicht | Dieselbe tolerante Buchsuche, weiterhin nur die tatsächlich vorhandenen 27 NT-Bücher |
| Suche/Bereich wechseln | Keine persönliche Speicherung, kein Lesefortschritt und kein Baumwachstum |
| Aus Buchansicht zurück | Vorherige Suchanfrage und Bereich bleiben in der gehaltenen Ansicht erhalten |
| Neue Ansicht/Neustart | Standard wieder gesamte Bibel; Filter wird nicht als persönliche Einstellung gespeichert |

## Architektur

`book-search.ts` normalisiert nur Buchnamen: Unicode-NFKC, deutsche Kleinschreibung, Entfernen von Unicode-Abständen und Punkten. Die Eingabe bleibt sichtbar unverändert. Der eigentliche Bibeltext und die Volltextsuche werden nicht normalisiert oder umgeschrieben. Kein zusätzliches Paket.

`BibleScopeSelect.web.tsx` verwendet einen echten, beschrifteten HTML-Select mit den vorhandenen OLIVA-Farbtokens und sichtbarem Fokusring. Der native Renderer verwendet React-Native-Modal/Radio-Schaltflächen mit ausgewähltem Zustand und statischer Öffnung. Beide Renderer verwenden dieselbe geprüfte Optionsliste und denselben lokalen Bereichsstate.

AppData bleibt **V8**, privates Dokument V1, SQLite3 und IndexedDB1. Es gibt für diesen Patch keine Datenmigration. Die laufende Reader-Parität mit V9, Mehrversauswahl, Bereichsnotizen und Kopieren wird separat weiterentwickelt. Code-only-Funktionscommit: `6b8fa1a`.

## Prüfbelege und Grenzen

[Validierungsübersicht](evidence/book-search/validation-summary.json), [sechs Such-Browserfälle](../tests/e2e/book-search.spec.ts), [PWA-Wechsel](evidence/book-search/upgrade/README.md), [native Exporte](evidence/book-search/native/README.md). Der finale Gesamtbericht unterscheidet lokale Chromium-Prüfungen, echte Workerwechsel, statische native JS-/Assetprüfung und private HTTP-Prüfung. Native Exporte sind keine Geräte- oder Simulatorprüfung.

Ein erster lokaler Export mit einem `node_modules`-Symlink löste fremde Kontrollpfade auf. Dieser ungültige QA-Aufbau wurde verworfen und dokumentiert; ein unabhängiger Dependency-Verzeichnisbaum und neuer Metro-Cache beseitigten die Ursache. Keine Abnahme wird aus dem abgebrochenen Lauf abgeleitet.

FaithPath bleibt unverändert, kein Merge nach GitHub-main, kein öffentliches Web-/Storedeployment. Die bestehende eigentümerprivate Vorschau behält ihre Zugriffsregeln. Die gesamte Master-Definition-of-Done bleibt offen; insbesondere native Geräteabnahme, unabhängige Inhalts-/Rechtefreigaben und die dokumentierten übrigen Masterfunktionen.
