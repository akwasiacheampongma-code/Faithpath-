# FaithPath Phase7 – Maintainability & Stability

Basis: `7d24aea30bec5b0b8d43e199f3cadfc6305c1e3e` auf
`fix/treeguide2-mobile-final-20261018`. Arbeitsbranch:
`maintenance/stability-phase7-20261018`. Ausschließlich synthetische QA-Daten.
Dieser Bericht wird nach der eingefrorenen Gesamtprüfung um die exakten
Kandidaten- und Testergebnisse ergänzt. Bis dahin besteht keine Freigabe.

## Audit und umgesetzte Grenzen

Die bestehende Vanilla-PWA bleibt die richtige Grundlage. Kein Rewrite,
Frameworkwechsel, neues Speichersystem oder UI-Redesign ist begründet.
Store, Datenmigrationen, Journaltransaktionen, Entwürfe, Inhalte, Baumregeln,
Styles und Service-Worker-Cacheprotokoll bleiben unverändert.

`app.js` hatte 2.076 Zeilen, 121.363 Bytes und 100 Funktionsdeklarationen.
Vier eng begrenzte Zuständigkeiten liegen jetzt in expliziten ES-Modulen:
Routing/Fokus, Import-Lebenszyklus, PWA-Lebenszyklus und Bibelressourcen.
Die verbleibende App-Komposition hat 1.823 Zeilen. Das Ziel war klare
Verantwortung; die Gesamtzeilenzahl allein ist kein Qualitätsmaß.

## Priorisierte Risiken

| Prio / Eintritt | Konkreter Befund und Auswirkung | Ergebnis / Grenze |
| --- | --- | --- |
| P1 / manuell auslösbar | Alter einmaliger GitHub-Importer hatte `contents: write`, rekursive Root-Löschung und `git push`. Für normale Wartung ungeeignet. | Auf diesem Branch entfernt, historisch dokumentiert; neue CI nur lesend. Andere Branches unverändert. |
| P2 / mittel | `app.js` bündelte Dispatch, Fokus, Dateiprüfung, Worker und Reader-Ressourcen; versteckte UI-Sitzungsabhängigkeiten erschwerten isolierte Tests. | Vier kleine Controller mit expliziten Abhängigkeiten; bestehende Feature-Aktionen bleiben bewusst erhalten. |
| P2 / bei defekter Ressource | Baseline akzeptierte `{chapters:null}` als erfolgreiches Promise und hielt es im Cache. Erneutes Öffnen konnte ohne Reload nicht helfen. | Struktur bis zu geordneten Versnummern/Texten prüfen, fehlgeschlagenes Promise entfernen; tatsächlicher Browser-Retry und 132 Originalbücher geprüft. |
| P2 / bei Plattformfehler | Alte Worker-Statusabfrage ließ beide Nachrichtenports offen; abgelehntes `getRegistration` konnte ein unbehandeltes Promise erzeugen. | Abschluss auf Antwort/Timeout/Fehler, Ports schließen, optionalen Plattformzugriff abfangen, nur jüngster Status aktualisiert UI. |
| P2 / bei konkurrierenden Tabs | LocalStorage bietet keine prozessübergreifende CAS-Transaktion; reine Store-Schreibvorgänge sind nicht universell serialisierbar. | Bestehende Byteprüfung, Web Locks und Journal-Recovery unverändert; keine unehrliche Garantie oder neue Migration. Restschuld. |
| P2 / bei Geräteverlust | Persönliche Daten sind lokal und unverschlüsselt; Eviction/Browserdatenlöschung ohne externes Backup nicht wiederherstellbar. | Vorhandener transparenter Backup-/Rohdatenweg bleibt; keine neue Cloudpflicht. Physische Sicherungsabnahme offen. |
| P3 / sicher bei jedem alten Build | 132 Bibeldateien lagen root und versioniert bytegleich im Build: 8.759.230 redundante Nutzdatenbytes und132 zusätzliche Offline-Downloads. | Nur ungenutzte generierte Kopie entfernt, kanonische Offline-Dateien erhalten und vollständig gehasht. Keine unbelegte Geschwindigkeitsbehauptung. |
| P3 / bei künftiger UI-Arbeit | Mehrere historische CSS-Schichten und großer verbleibender Action-/Editorbereich. | Keine spekulative CSS-Säuberung. Nächste tatsächlich geänderte Funktion mit Verhaltensvertrag herauslösen. |
| P3 / bestehend | Fünf ungenutzte Bindungen in geschütztem Store, altem Validator und alten Tests. | Sichtbare Lint-Warnungen; neue Controller streng ohne ungenutzte Bindungen. Kein Umformatieren geschützter Module. |

Es wurde kein P0-Datenverlustbefund nachgewiesen. Ein grüner Build beweist
weder vollständige Gerätekompatibilität noch die Beseitigung aller Restschulden.

## Unabhängiges Review

Ein separater Reviewer verglich die komplette Änderung mit der exakten Basis.
Er bestätigte die unveränderten Store-/Content-/CSS-Autoritäten und fand:
unvollständige Prüfung verschachtelter Bibelverse, einen systemabhängigen
Chromiumpfad und fehlende Isolation der Core-QA-Ausgabe. Alle drei Befunde
wurden korrigiert. Die neuen Fehlerszenarien prüfen ihre eigentliche Ursache
mit ansonsten gültigen Testdaten. Der abschließende Reviewnachweis wird mit
den QA-Dateien geliefert.

## Weiterführende Wartung

1. Den nächsten fachlich betroffenen Action-/Editorabschnitt separat kapseln;
   vorab den tatsächlichen Ablauf testen, keine pauschale Dateizerlegung.
2. CSS nur an nachgewiesenen Konflikten bereinigen; alle vier Themes und
   tatsächliche berechnete Eigenschaften vergleichen.
3. Eine stärkere allgemeine Mehrtab-Schreibkoordination nur separat entwerfen:
   gleiche Speicher-/Exportverträge, nachvollziehbare Fallbacks und Fehlertests.
4. Abhängigkeiten und Action-SHAs kontrolliert aktualisieren; den exakten
   Tooling-Hashvertrag nicht durch eine pauschale Ausnahme ersetzen.

Die aktuelle Entwicklerdokumentation ist [ARCHITECTURE.md](ARCHITECTURE.md),
[DEVELOPMENT.md](DEVELOPMENT.md), [DATA_CONTRACTS.md](DATA_CONTRACTS.md) und
[RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md). Historische Phasenberichte bleiben
als historische Belege erhalten.
