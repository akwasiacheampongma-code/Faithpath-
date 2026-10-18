# FaithPath Phase7 – Maintainability & Stability

Basis: `7d24aea30bec5b0b8d43e199f3cadfc6305c1e3e` auf
`fix/treeguide2-mobile-final-20261018`. Arbeitsbranch:
`maintenance/stability-phase7-20261018`. Ausschließlich synthetische QA-Daten.
Die automatisierten Abnahmekriterien sind bestanden. **GO für die nachfolgende
physische Geräteabnahme; keine Produktionsfreigabe.** Echte iPhone-, Safari-,
installierte PWA- und VoiceOver-Tests bleiben ausdrücklich OFFEN.

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
mit ansonsten gültigen Testdaten. Der abschließende Reviewnachweis liegt unter
[reports/phase7/evidence/independent-review.md](reports/phase7/evidence/independent-review.md).

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


## Exakter Kandidat und Integrität

| Nachweis | Wert |
| --- | --- |
| Quellcommit | `398f22f4809bfa7647181b17ba5b2fc5d780c44a` |
| Build-ID | `FP4-20261018-G-STABLE1-PHASE7-MAINT1` |
| Build-SHA-256 | `600683f69c4ecb0350a3d3e8bae2e51a1136169c5d6847f5b3422970f2211441` |
| Unveränderter Content-SHA-256 | `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309` |
| Netlify-QA-ZIP SHA-256 | `450f6dbd376e4b9251fb5b2d381d81967c30953ddfa33aa64f458027bdf3a1ed` |
| ZIP-Dateien / Größe |237 Dateien /8.072.756 Bytes |
| Hosted CI | [Run39115772257 – success](https://github.com/akwasiacheampongma-code/Faithpath-/actions/runs/39115772257) |

Der anschließende Liefercommit ergänzt ausschließlich QA/Dokumentation und den
Normalaufnahme-Test ohne Worker-Blockade. Er ist nicht als neuer App-Quellstand
im bestehenden Build ausgegeben. Der tatsächliche App-/Build-/Paketquellstand
ist der oben genannte eingefrorene Commit. Das ZIP ist separat, ohne Deploy.
Die vollständige Dateiliste und Commitfolge liegen in `reports/phase7/evidence/`.

## Tatsächlich ausgeführte Abnahme

| Prüfung | Ergebnis / Nachweis |
| --- | --- |
| Baseline |198 bestehende Unit-Tests und ursprünglicher Core-Browser gegen exakten TREEFINAL-Build bestanden |
| Alle aktuellen Units |220/220, null Fehler;22 neue Verhaltens-/Toolingverträge zusätzlich zur unveränderten Basis |
| Freigegebene Inhalte | Beide Excel-/Redaktions-Validatoren, kompletter NT-/Nachlese-Abgleich und geschützte Daten bestanden; keine IDs/Texte geändert |
| Architektur / statische Analyse |51 ESM-Module,114 Kanten, keine Zyklen/fehlenden Imports; null Lintfehler, fünf dokumentierte Alt-Warnungen |
| Speicherverträge |198 geschützte Dateien bytegleich; SchemaV5, Schlüssel, Store, Journaltransaktionen, Entwürfe, Migrationen und Baumautorität unverändert |
| Reproduzierbare Builds | Zwei vollständige Builds dateiweise/SHA-256 identisch; beide Bibles samt zwei Lizenzdateien bytegleich zur Quelle |
| Core-Browser / Accessibility |12 ursprüngliche Nutzerabläufe inklusive Reader, Journal, Pfaden, Quiz, Restore, Offline und Fehlern; Axe in den geprüften Ansichten ohne Verstöße |
| Routen |43 Varianten × vier Viewports × Hell/Nacht =344 Fälle; Menü, Deep Links, Fokus, keine Überläufe; zusätzliche Onboarding-Fehlerfälle bestanden |
| Ursprüngliche Fachprogramme |24/24 exit0; siehe exakte Programmliste/Einzelergebnisse im QA-Nachweis |
| Fehlereinspeisung | Malformed-Bibel mit anschließendem Browser-Retry; blockierter Worker-Zugriff ohne ungefangenes Promise; Units für Timeout/Sendfehler/Ports und Lock-/Importabbruch |
| Echtes Worker-Update | Exakter alter TREEFINAL aus Git rekonstruiert; fehlende Pflichtressource verwirft Update, alte App bleibt offline; danach bewusstes vollständiges Update auf derselben isolierten Origin |
| Persönliche Daten beim Update | Hauptbestand, Entwurf, Sicherheitskopie und weitere Vertragsschlüssel bytegleich vor/nach Aktivierung; später nur absichtliche Reader-Historie verändert |
| Visuelle Regression |56 echte normale PNGs/28 Paare über sieben Ansichten,320/390 und Hell/Nacht; alle Vergleichspaare bytegleich |
| Unabhängiges Review | Vollständiger Basis-Diff geprüft, gefundene Punkte korrigiert; keine offenen Codeblocker gemeldet |
| Physische Geräte | iPhone/Safari/installierte iPhone-PWA/VoiceOver OFFEN, einschließlich ausstehender vorheriger Phasengates |

Die24 Fachprogramme sind: Stabilisierung, Kapitelübungen, finale NT-Fragen,
Nachlese-Korpus, Phase2-Reader/Stories/Schwert, Kurzkapitel, Core-Depth,
Kontinuität, Wegeübersicht/-detail, Baum, ursprüngliche Rückblicke, persönlicher
Gesamtweg, Premium-Journal, Navigation, Entdecken, Onboarding, Journal,
Rückblicke, Erinnerungen, Backup, Backup-Rennen, Backup-Dialoge und UIUX45-
Integration. Es wird nicht behauptet, jedes historische Testskript erneut
unverändert ausgeführt zu haben. Die ursprünglichen Programme behalten ihre
fachlichen Assertions; der neue portable Gate bündelt die aktuellen Pflichtwege.

Die gezielten Speicherfehler umfassen unter anderem Quota/denied, beschädigte
und zukünftige Daten, verweigerte Migrationssicherung, veraltete Tabs/Exporte,
unterbrochene Haupt-/Entwurfsschreibvorgänge, spätere fremde Entwürfe und
abgebrochene Wiederherstellung. Das sind kontrollierte synthetische Fehler,
keine Behauptung über einen realen iPhone-Speicherfehler.

Die erste visuelle Diagnose blockierte Worker absichtlich und zeigte deshalb
beidseitig die bestehende Offline-Warnung. Die gelieferten Normalaufnahmen
wurden mit vollständig vorbereitetem echtem Worker neu erfasst. Beide Läufe
zeigten gleiche Kompositionen; die Normalpaare sind die Abnahmebilder.

## Grenzen, technische Schulden und Empfehlung

Der neue Build hat237 statt367 Dateien. Entfernt wurden132 redundante
Bibel-JSONs plus zwei redundante Lizenzkopien; alle134 kanonischen Dateien
bleiben bytegleich erhalten. Vier Controller kamen hinzu. Das gemessene
Nutzdatenvolumen sinkt von29.288.144 auf20.522.718 Bytes, jeweils ohne die
abschließende Integritätsdatei. Daraus wird keine gemessene iPhone-Ladezeit
abgeleitet.

App-Aktionen/Editor bleiben mit1.823 Zeilen ein weiterer sinnvoller,
fachlich aufzuteilender Bereich. CSS-Schichten und die dokumentierte
Mehrtab-Atomicitätsgrenze bleiben. Der erste Hosted-CI-Artefakt enthält auch
Rekonstruktionsquellen und Buildkopien (389.862.052 komprimierte Bytes,
14 Tage Aufbewahrung). Das ist funktional korrekt, aber ein zukünftiger
Uploadfilter nur für Logs/Rezepte/Screenshots spart CI-Speicher; die gelieferte
QA-Datei enthält bereits eine kuratierte Auswahl ohne redundante Builds.

**Empfehlung: GO für die physische Geräteabnahme dieses exakten Kandidaten.**
Erst deren dokumentierter Erfolg erlaubt eine separate Veröffentlichungsentscheidung.
Kein main-Merge, keine Änderung bestehender QA-Sites oder geschützter Branches,
kein Netlify-/Produktionsdeploy wurde angestoßen. Alle21 bisherigen Remote-Heads
blieben unverändert; nur der neue Wartungsbranch wurde gepusht.

[Maschinenlesbare Zusammenfassung](reports/phase7/QA-RESULTS.json) ·
[Vorher/Nachher-Galerie](reports/phase7/screenshots/index.html) ·
[Funktionsinventar](reports/phase7/FUNCTION_INVENTORY.md) ·
[Gerätegate und Rollback](RELEASE_CHECKLIST.md).
