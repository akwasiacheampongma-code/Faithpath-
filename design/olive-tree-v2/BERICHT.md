# FaithPath Olivenbaum V2 – Phase A

**Entscheidungsvorlage vom 29.10.2026. Phase B ist nicht freigegeben und wurde nicht begonnen.**

Studie: `FP-DESIGN-20261029-OLIVE-V2-A`
Branch: `feature/olive-tree-v2-premium-20261028`
Issue: https://github.com/akwasiacheampongma-code/Faithpath-/issues/2

## Ergebnis und Empfehlung

Ein neuer botanischer Master und sechs daraus abgeleitete Entwicklungsbilder sind als isolierte, lokal ausgelieferte Designgalerie vorhanden. Die neue Richtung liefert gegenüber dem aktuellen prozeduralen SVG einen sichtbaren Zugewinn bei Holzstruktur, räumlicher Tiefe und individueller Silhouette. Die bestehenden Bedeutungen und vier Themes bleiben die gestalterische Grundlage.

**Empfehlung: zur visuellen Entscheidung vorlegen; keine Integrations- oder Produktionsfreigabe ableiten.** Die Illustrationsfamilie ist überzeugender als der bisherige Baum. Sie ist noch kein fertig aufbereitetes, gemessenes Animationssystem. Besonders die Registrierung der Stamm-/Kronengeometrie und separate bewegliche Ebenen fehlen für Phase B. Echte iPhone-, Safari- und VoiceOver-Prüfungen sind offen.

## 1. Tatsächliche technische Ausgangsbasis

Die vorhandenen Remote-Heads wurden abgefragt und die Branches nach Git-Abstammung und Runtime-Änderungen verglichen. Nicht einfach der jüngste Datumsname wurde gewählt.

| Branch | Verifizierter HEAD | Verhältnis zur gewählten Basis |
|---|---|---|
| develop/v4 | f02106e9a15877ec8acb92f444bf62fcbc51c36e | Vorfahr, 105 Commits zurück |
| maintenance/stability-phase7-20261018 | 7d4441caf5112c04b8b6af7ddec8c4ee49d0c63a | Vorfahr, 17 Commits zurück |
| feature/tree-seven-stages-meaning-20261017 | 31c96d50a5fb19e76cdb09d7a3b96ae5cb6ad70a | Vorfahr, 28 Commits zurück |
| feature/tree-branch-visual-refinement | e38644e3d5b1311f1abf0dc08a7ecb881f3c110b | Vorfahr, 103 Commits zurück |
| feature/uiux-phase6b-verbunden-20261017 | caeed3b8d39738e2d5ca4833f965c63d5c3cf92a | Vorfahr, 35 Commits zurück |
| **feature/ux-first-seed-living-tree-20261019** | **ef8d96d7126fb79661467feaaa17044874471d4d** | **Gewählte vollständige UI-/UX-Basis** |
| content/at-nt-qa-20261023 | 7d20a62a3f016ea4218ff9d34c2486992e92cfdf | Separater Quellen-/Redaktionszweig, keine neuere UI-Runtime |

Die spätere Content-Arbeit fügt Quellenrekonstruktion, Prüfdokumente und Validatoren hinzu; sie ersetzt nicht die integrierte erster-Samen-Oberfläche. Sie wurde nicht pauschal zusammengeführt. Die gewählte Basis enthält bereits die Phase-7-Stabilisierung, „Verbunden“, sieben Stufen samt Bedeutungen und den ersten-Samen-Ablauf.

Der letzte produktrelevante Runtime-Commit ist `22ac39e993983d2ce154dfb02d584b2da7b2d192`; der spätere Basis-HEAD enthält QA-/Lieferartefakte. Ein eigener Worktree isoliert die Designarbeit. Der ursprüngliche Checkout, main, Produktion und vorhandene Testdeployments werden nicht verändert. Dieser Bericht behauptet **keine erneute Zuordnung des aktuellen Netlify-Livedeployments**; geprüft wurde die genannte Repository-Basis.

### Nachgebauter bisheriger Appstand

- Build-ID: `FP4-20261019-G-STABLE1-FIRSTSEED1`
- Content-Hash: `8630cf25034cbd8ee28060b2318addc25d26611317439d08ac2fa5cae938e309`
- Build-Hash: `aabb3d500f9530620389d4ed78c590480dcc24d22bb8a1c118a1012e3bdf0bb5`
- Der Build wurde mit explizitem historischem Branch-/Commit-Metadatum ausgeführt, nicht als neue integrierte Version etikettiert.
- `npm test`: **245/245 bestanden**. Rohprotokoll und Buildprotokoll liegen in `evidence/`.

Ein zusätzlicher Testaufruf ohne die benötigte Prozessfreigabe der verwalteten Umgebung scheiterte an `spawnSync git EPERM` beziehungsweise betroffenen Unterprozessen. Die unveränderten Tests wurden anschließend mit der verfügbaren Ausführungsberechtigung erneut ausgeführt; das erfolgreiche finale Rohprotokoll liegt separat bei. Es wurde kein Test entfernt oder abgeschwächt.

Beim ersten `npm ci` scheiterte der Schreibzugriff auf den vorgegebenen npm-Cache außerhalb des Workspaces. Der erneute Aufruf mit einem eigenen Cache unter `/tmp` funktionierte; keine Änderung an Abhängigkeiten oder Lockdatei war erforderlich.

## 2. Was am bisherigen Baum unzureichend war

Der aktuelle Code in `src/olive-tree.js` bietet eigene, lizenzseitig nachvollziehbare Vektoren und eine klare Trennung von Darstellung und Datenlogik. Das ist erhaltenswert. Die Grenzen sind gestalterisch:

- Wiederholte, ähnlich aufgebaute Blattgruppen wirken wie ein Muster statt wie eine individuelle Krone.
- Der Stamm besitzt wenige glatte Verläufe und kaum unterschiedliche Rindenebenen; Wurzelansätze bleiben schematisch.
- Viele Äste sind ähnlich stark und regelmäßig angeordnet. Silhouette und Tiefe wirken eher wie ein Symbol als wie ein charaktervoller mediterraner Baum.
- Die technische Vergrößerung allein behebt diese Material- und Formprobleme nicht.

Die Screenshots unter `evidence/baseline/` wurden tatsächlich in Chromium aufgenommen, mit synthetischen Daten und vollständig vorbereiteter Offline-Basis. Die Warnung einer zunächst künstlich blockierten Service-Worker-Umgebung wurde erkannt; diese verworfenen Aufnahmen werden nicht als Appfehler präsentiert.

## 3. Neue visuelle Identität

Der ausgewachsene Baum wurde zuerst mit dem verfügbaren Bildgenerierungswerkzeug entwickelt. Danach wurden die jüngeren Zustände aus derselben Referenzfamilie abgeleitet.

- **Holz:** verdrehte S-Bewegung, dunklere innere Stammfuge, sichtbare Rindenfurchen, unterschiedlich starke Hauptäste und ein kräftiger Wurzelansatz.
- **Krone:** asymmetrische, nach links ausladende Verzweigung mit höherem rechten Ast; feinere silbergrüne Blätter mit wechselnden Unterseiten und Lichtkanten.
- **Boden und Licht:** kleiner unregelmäßiger Erdsockel, zurückhaltende Steine/Gräser und warmes Licht von rechts oben. Keine gemalte Landschaft hinter der App.
- **Freistellung:** transparente lokale RGBA-Bilder, auf den vier unveränderten Themefarben geprüft. Keine hellen Bildrechtecke im Nachtmodus.
- **Komposition:** größerer Baum in Heute, eigenständige Detailansicht, kleinere Darstellung neben dem persönlichen Weg und eine aufklappbare Übersicht. Die Hauptnavigation bleibt im Entwurf dieselbe; keine neuen Haupttabs.

Die Galerie zeigt ihre synthetischen Wegtexte offen als Beispiele. Sie kopiert kein Demo-Speichermodell in die echte App.

## 4. Die sieben Bilder

| Bestehender Index | Darstellung | Visuelle Unterscheidung |
|---|---|---|
| 0 | Samen | Ein einzelner gerillter Olivenkern auf warmer Erde, optische Nahansicht |
| 1 | Keimling | Schmaler leicht gebogener Stängel mit silbergrünen gegenständigen Blättern, optische Nahansicht |
| 2 | Junger Olivenbaum | Schlankere S-Bewegung, offene junge Verzweigung, wenig Laub |
| 3 | Wachsender Olivenbaum | Kräftigeres Holz, breitere verzweigte Krone, noch ohne Früchte |
| 4 | Starker Olivenbaum | Ausgeprägter Wurzel-/Stammkörper und volle Krone ohne Fruchtbesatz |
| 5 | Erste Früchte | Gleiche späte Baumidentität, wenige erste Fruchtgruppen |
| 6 | Fruchttragender Olivenbaum | Wiedererkennbare Hauptäste und mehr verstreute Oliven |

Die Reihe ist kein wissenschaftlicher Wachstumszeitraffer. Die letzten drei Stufen liegen absichtlich nahe beieinander; ihre Unterschiede sind auf kleinen Bildschirmen subtil. Die aktuelle Stufenbezeichnung und ihre vorhandene Bedeutung müssen deshalb weiterhin unmittelbar lesbar bleiben. Ein größerer Fruchtglanz wäre keine sinnvolle Lösung.

### Unveränderte Regeln

`src/domain.js` bleibt zuständig: Weg-Meilensteine plus ausdrücklich bestätigte, nicht einem Weg zugeordnete Entwicklungen aus Rückblicken. Die bisherigen Grenzwerte bleiben **0 / 1 / 2 / 3–4 / 5–6 / 7–9 / ab 10**. Lesen, Quizantworten, erledigte Schritte und die erste Pflanzsequenz erzeugen keine zusätzliche Entwicklung. Es gibt keine neue Datenmigration und keine Änderungen an Schema V5, IDs oder Beziehungen.

Die vorhandenen sieben Bedeutungstexte wurden unverändert für die Galerie übernommen. Keine neuen biblischen Zitate wurden formuliert. Psalm 52, Jeremia 17 und Galater 5 werden nicht in eine angeblich biblisch vorgeschriebene siebenstufige Reifeleiter umgedeutet.

## 5. Kritische Designbewertung

Subjektive fachliche Einschätzung, keine Nutzerstudie:

| Kriterium | Einschätzung | Grenze |
|---|---|---|
| Natürlichkeit / Materialwirkung | 8/10 | Generierte Blattschichten sind stellenweise noch dichter und wärmer als eine echte silbrige Olive |
| Eigenständigkeit / Premiumwirkung | 8/10 | Der individuelle Stamm ist stärker als der bisherige generische Symbolbaum; Schutzfähigkeit ist keine geprüfte Rechtsbehauptung |
| Zusammengehörigkeit der sieben Bilder | 7/10 | Stammbewegung und Licht passen; frühe Astgeometrie ist keine exakte registrierte Vorstufe |
| Mobile Lesbarkeit | 8/10 | Holz bleibt erkennbar; einzelne Früchte sind bei 320 px kein zuverlässiger alleiniger Stufenindikator |
| Integration in Verbunden | 8/10 | Lokale Farben und Schriften passen; echte Ast-Hotspots, Daten und Geräte sind erst in Phase B abzunehmen |

**Übernommen:** botanische Materialien, transparente Einzelillustrationen, asymmetrischer Stamm, ruhige Farbwirkung, vorhandene Stufentexte.
**Verworfen:** weitere kosmetische SVG-Variation, beliebige sieben verschiedene Bäume, künstliche Lichtbelohnung, Tageszähler aus den Referenzbildern, Dauerwackeln des ganzen Baums und eine vorgetäuschte fertige Wachstumsanimation.

## 6. Browserprüfung und Nachweise

**Endstand:** 471/471 Galerieprüfungen bestanden, 55 neue Browser-Screenshots plus 14 Baseline-Screenshots. Fünf zusätzliche Asset-/Datenvertragsprüfungen, die Alpha-/Größenprüfung und die statische Korrektheitsprüfung der sieben Studienskripte bestanden. Beide historischen App-Builds haben identische Integritätsmanifeste (242 Dateihashes). Die erneut ausgeführten App-Tests bestehen mit 245/245. Der direkte Datei-Aufruf und reale Geräte bleiben ausdrücklich offen.

Die vollständigen tatsächlich ausgeführten Galerieprüfungen stehen in `evidence/qa-results.json`; maßgeblich sind der dortige Endstatus und die einzelnen Parameter, nicht eine pauschale Behauptung „alles getestet“.

- Alle sieben Stufen: 320 × 568 und 390 × 844, vier Themes, Root-Textgröße 100/200 % in Chromium.
- Zusätzliche Layoutzustände: Heute, Mein Weg, erster Samen, aufklappbare Stufenübersicht; Galerie und Desktopvergleich.
- Bildladung, Wortumbrüche, horizontaler Überlauf, Markenname, Erreichbarkeit unter der festen Navigation, Öffnen/Schließen, fokussierbare Navigation und transparente Demo-Dialoge.
- Axe-Prüfung von Baumdetail in vier Themes und Galerie; automatische Prüfung ersetzt keine manuelle Screenreader-Abnahme. `incomplete`-Einträge stehen im Rohbericht.
- Keine lokalen persönlichen Schreiboperationen und keine Service-Worker-Registrierung durch die Studie.

Der erste Prüflauf fand echte Entwurfsfehler: zu lange Titel bei 200 %, Flex-/Grid-Mindestbreiten und eine auf 320 px teilweise überlagerte erste Aktion. Diese wurden anhand von DOM-Maßen korrigiert. Der zunächst ungültig als Einzeldatei exportierte alte SVG-Vergleich erhielt eine XML-konforme Attributserialisierung. Außerdem wurde der Test für den letzten Inhalt auf das tatsächlich bis zum Seitenende mögliche Scrollen korrigiert; `scrollIntoViewIfNeeded` berücksichtigt eine darüberliegende feste Navigation nicht automatisch.

Der verwaltete Chromium-Browser sperrt `file://` mit `ERR_BLOCKED_BY_ADMINISTRATOR`. Deshalb bleibt das Öffnen per Doppelklick **manuell offen**. Die Galerie verwendet klassische relative Skripte und lokale Dateien ohne Fetch/ES-Modul-Import; der regulär geprüfte lokale HTTP-Start ist in README beschrieben. Diese Einschränkung wird nicht als bestandener Offline-PWA-Test ausgegeben.

## 7. Was noch fehlt

1. **Ausdrückliche Designfreigabe.** Diese Lieferung soll die Auswahl ermöglichen.
2. Präzise Bildregistrierung und getrennte Kronen-/Fruchtebenen für hochwertige Bewegung.
3. Echte Integration mit den vorhandenen Astverknüpfungen und Datenfunktionen. Die Studie zeigt deren Anordnung, keine funktionierende neue Datenansicht.
4. Leistungs-/Akkuvergleich mit den später tatsächlich animierten Assets; hier keine erfundenen FPS oder CPU-Werte.
5. Vollständiger Offline-/Service-Worker-Updatetest des späteren integrierten Kandidaten mit bestehenden synthetischen V5-Daten und Backups.
6. Reales iPhone Safari, installierte PWA und VoiceOver; bisherige offene Geräte-Gates bleiben offen.
7. Bestätigung der Rechte an Nutzerreferenzen und gegebenenfalls rechtliche Prüfung der späteren kommerziellen Bildnutzung. Vorhandene OFL-Fontlizenzen liegen bei.

Der konkrete Plan steht in `ANIMATION_UND_INTEGRATION.md`. Ein Produktionsbuild mit dem neuen Baum wäre vor der Freigabe verfrüht. Geliefert wird ein **Design-/Vorschau-ZIP**, kein als fertige App ausgegebenes Netlify-Release.

## 8. Liefer- und Integritätsnachweis

Der exakte Designcommit steht nach Erstellung im `DELIVERY.json` des ZIPs und in der Übergabe. Basiscommit, unveränderte Runtime-Dateihashes, Toolversionen, ursprüngliche Branch-Heads, Bilddigests, echte PNG-Screenshots und Testprotokolle liegen separat bei. `SHA256SUMS.txt` deckt die Dateien der Designstudie ab; die ZIP-Datei erhält zusätzlich einen eigenen SHA-256.

**Stop nach Phase A. Keine App-Integration, kein Merge und kein Deployment.**
