# Vorbereitung: drei Anregungen für einen kleinen Alltagsschritt

Dies ist eine **statische Bestandsanalyse und ein Vorschlag**, keine implementierte OLIVA-Funktion oder neue Versionszusage. Die aktuelle Reader-Abnahme und Bereitstellung bleiben unverändert vorrangig. Der erhaltene FaithPath-Snapshot ist `a519ce898fa33907b07d5ac7a585595127556183`; Dateihashes, Original-Git-Blobs und der genaue Lesestand stehen in [provenance.json](provenance.json). Neun Originaldateien stimmen mit dem erhaltenen Referenzmanifest überein. Kein Original und keine OLIVA-Runtime-Datei wurden verändert; keine App, Tests oder Builds wurden ausgeführt.

## Belegte ursprüngliche Funktion

Die drei Anregungen gehören in FaithPath zum **Editor für persönliche Alltagsschritte**, nicht zu einer Rangliste oder Empfehlung auf der Startseite. Sie sollen Menschen beim Formulieren eines freiwilligen, machbaren Versuchs helfen. Sie erzeugen keinen Glaubensscore.

| Einstieg | Tatsächliches Originalverhalten | Beleg im Snapshot |
|---|---|---|
| Neuer persönlicher Weg | `openForm("path")` zeigt den Helfer für den ersten optionalen Schritt; beim Bearbeiten eines bestehenden Wegs wird stattdessen dessen offener Schritt als Textfeld angeboten. | `src/app.js:861`, `:871` |
| Neuer oder bearbeiteter offener Schritt | `openForm("step")` verwendet die Wegkategorie, einen gegebenenfalls eindeutigen Themenbezug und die Texte sämtlicher vorhandener Schritte. Abgeschlossene Schritte werden über diesen Originalablauf nicht bearbeitet. | `src/app.js:885` |
| Erster-Samen-Assistent | Szene 4 zeigt denselben Helfer; eine Anregung wählt noch nicht die nächste Szene. Weitergehen und abschließendes Speichern sind eigene Aktionen. | `src/first-seed/view.js:20`, `src/first-seed/controller.js` |

### Eingaben, Auswahl und Reihenfolge

`stepSuggestions({ topic, category, used })` in `src/step-suggestions.js:252` verarbeitet drei Arten von Metadaten:

- Ein ausdrücklich ausgewähltes, gültiges Thema aus den **18 Lebensthemen** hat Vorrang.
- Andernfalls bestimmt eine feste Kategoriezuordnung den Katalogschlüssel. Zum Beispiel führt `vertrauen` zu `angst`, `beziehungen` zu `streit` und `berufung` zu `arbeit`. Unbekannte Schlüssel erhalten die Texte von `sonstiges`.
- `used` enthält die vollständigen Texte aller bereits gespeicherten Wegschritte, unabhängig von deren Abschlussstatus. Im Original-Schritteditor wird `p.steps.map(x => x.text)` übergeben; der neue Weg und der Assistent haben zunächst keine benutzten Schritte.

Der redaktionelle Katalog umfasst **25 Zeilen mit je vier Texten**, die Alternativen **18 Zeilen mit je drei Texten**. Für die Indizes 0, 1 und 2 wird in fester Reihenfolge zuerst der noch nicht benutzte Haupttext, sonst die Alternative desselben Index ausgewählt. Sind beide exakt in `used` vorhanden, entfällt diese Art. Es erscheinen daher **höchstens drei**, nicht garantiert immer drei Vorschläge. Es gibt weder Scoring noch Zufall, Netzabfrage oder KI-Auswertung.

Der Vergleich ist `used.includes(value)` auf dem vollständigen Text mit Präfix `Mein kleiner Versuch: `. Er erkennt weder sinngleiche Formulierungen noch andere Großschreibung, zusätzliche Leerzeichen oder eine manuell entfernte Vorsilbe. Eine solche semantische Duplikaterkennung darf nicht als vorhandene Funktion behauptet werden.

Die tatsächlich sichtbaren Kategorien heißen **„Ganz klein anfangen“**, **„Etwas ausprobieren“**, **„Erst nachdenken“** (`src/step-help.js:11`). Das zusätzlich exportierte `STEP_KINDS` verwendet teilweise andere Beschriftungen: „Ein konkreter nächster Schritt“ und „Erst einmal reflektieren“. Für die Beschreibung der bestehenden Oberfläche sind die sichtbaren Texte maßgeblich. Das Präfix wird in den Vorschlagsbuttons ausgeblendet, bleibt aber im übernommenen Editor-/Schritttext enthalten.

### Kontext ohne Auswertung persönlicher Worte

`topicForStep(path, preferred)` in `src/step-help.js:18` akzeptiert zuerst ein gültiges, ausdrücklich bevorzugtes Thema. Ohne dieses berücksichtigt es ausschließlich:

1. die Wegkategorie;
2. die **erste** verknüpfte Bibelstelle mit `kind === "verse"`;
3. die jeweils **erste** Referenz der redaktionellen Themen;
4. einen eindeutigen Treffer über `sameRef`.

`sameRef` normalisiert Buchalias, Kapitel-/Verszahlen und die Übersetzung. Beim Themenvergleich wird die Übersetzung der Wegreferenz auch auf die Themenreferenz angewendet. Mehrdeutige oder fehlende Treffer ergeben kein Thema. Titel, Anliegen, Gebet und Journalprosa werden nicht analysiert. Die Logik durchsucht nicht alle Wegverknüpfungen oder sämtliche Themenreferenzen.

### Ein gemeinsamer Editor schützt eigene Formulierungen

`renderStepHelp` verwendet ein einziges beschriftetes Textfeld. Die reinen Übergänge stehen in `src/step-selection.js`:

| Zustand/Aktion | Tatsächlicher Übergang |
|---|---|
| Leeres Feld oder noch unveränderter Vorschlag | Eine andere Anregung darf direkt in dasselbe Feld übernommen werden. |
| Bereits vorhandene eigene Worte | Eine abweichende Übernahme zeigt „Eigene Worte schützen“ mit **„Meine Worte behalten“** und **„Vorschlag verwenden“**. Ohne ausdrückliche Bestätigung bleibt der Text unverändert. |
| Derselbe Text erneut gewählt | Der Übergang ist ein No-op; ein manuell geschriebener Text wird dadurch nicht nachträglich als Vorschlag markiert. |
| Ersetzende Übernahme bestätigt | Bisherige eigene Worte werden in einem eigenen Hilfsfeld behalten und unter „Weitere Hilfe“ wiederverwendbar. Es gibt **einen Backupplatz**, keine vollständige Versionshistorie. |
| Selbst tippen | `writeOwnStep` markiert den Text als eigene Formulierung, entfernt die Vorschlagsmarkierung und hebt eine offene Bestätigungsabsicht auf. |
| Kategorie ändern | Nur die Optionen werden erneuert und der bevorzugte Themenkontext bzw. eine ausstehende Bestätigungsabsicht verworfen. Das Live-Textfeld und der Wortbackup bleiben erhalten. |

Die ausstehende Bestätigungsabsicht liegt flüchtig im DOM. Sie wird nach Wiederaufnahme nicht automatisch ausgeführt. Die drei Hilfsstrings `stepSuggestion`, `stepOwnText` und `stepCandidate` gehören dagegen zum vorhandenen Entwurfsumschlag. `stepCandidate` bewahrt eine frühere Anregung; bei Wiederverwendung wird sie als eigener Text behandelt. Die Originalfunktion legt dafür keinen neuen persistenten Hauptdatenbereich an.

Nach einer übernommenen Anregung löst der Helfer denselben `input`-Pfad zur bestehenden Entwurfssicherung aus und führt den Fokus zum Editor. Der Schutz bleibt auch beim First-Seed-Controller im vorhandenen Entwurf erhalten. Das bestätigt lediglich eine Entwurfsänderung, keinen abgeschlossenen Schritt.

„Weitere Hilfe“ enthält außerdem vier Satzanfänge sowie „Schritt kleiner machen“. Letzteres verwendet den vierten Text der ausgewählten Katalogzeile mit Präfix `Ich möchte Folgendes ausprobieren: `; es analysiert oder verkürzt nicht die eigenen Worte algorithmisch.

### Speicherung und Navigation bleiben getrennt

Die Helferbuttons wechseln keine Route, schließen kein Formular ab und setzen keinen Schritt auf erledigt. Erst die separate Formularabgabe in `src/app.js:1041` beziehungsweise `:1088` legt den Weg oder Schritt an und navigiert anschließend zu `path/<id>`. Neue Schritte beginnen ausdrücklich mit `done: false`. Die Hilfsstrings werden nicht als geistliche Bewertung in den gespeicherten Schritt übernommen.

## Tatsächlicher OLIVA-Anschlusspunkt

[GoalEditor und StepEditor](../../../src/features/personal/Editors.tsx) bieten bereits freie Texteingabe, Entwurfsstatus und getrenntes Speichern. [useDraft](../../../src/features/personal/useDraft.ts) und die bestehende Store-/CAS-Logik besitzen Autosave, Fehlererhalt und Schutz vor veralteten Entwürfen. [Das Modell](../../../src/features/personal/model.ts) legt neue Schritte unvollständig mit `completedAt: null` an.

Die aktuellen strikten [Verträge](../../../src/features/personal/schema.ts) enthalten **keine Wegkategorie, Themen-ID oder Vorschlags-/Wortbackup-Metadaten**. Ein Goal hat optional `ref`; der `step`-Entwurf enthält `goalId`, `stepId`, `editing`, `baseRevision` und `text`. Eine bestehende OLIVA-Referenz allein genügt deshalb nicht, um die ursprüngliche Kombination aus Kategorie und erster Themenreferenz zu rekonstruieren. Die 18 Originalthemen sind außerdem nicht identisch mit OLIVAs neun geführten Lernwegen.

Der eingefrorene V9-Kandidat darf für diese Vorbereitung nicht erweitert werden. Unbekannte Helferfelder einfach in seine strikten Entwürfe zu schreiben wäre keine saubere Migration.

## Vorgeschlagener kleiner erster Umsetzungsumfang

Dieser Abschnitt ist **OLIVA-Konzeption**, kein Originalbefund und keine bereits getroffene Releaseentscheidung.

1. Zunächst nur den **StepEditor** ergänzen. Ein gemeinsamer reiner Auswahl-/Textschutzbaustein bereitet die spätere Wiederverwendung im ersten Vorhabenschritt vor; Onboarding und Hub bleiben davon unabhängig.
2. Einen freiwilligen, klar beschrifteten **lokalen Kategorie-/Themenwähler** mit neutralem Standard „Allgemeine Anregungen“ anbieten. Ein kleiner erster Umfang kann nur die Kategorien verwenden; eine ausdrückliche Themenauswahl lässt sich später ergänzen. Diese Auswahl kann im geöffneten Editor bleiben. Sie muss den gespeicherten Goal-Vertrag nicht allein für UI-Hilfe erweitern.
3. Maximal drei nachvollziehbare redaktionelle Anregungen in fester Reihenfolge anzeigen. Den expliziten Wähler und die bestehenden Schritttexte als einzige Kontextquellen verwenden. Keine Ableitung aus Titel, Anliegen oder Notizen; keine Behauptung einer individuellen KI-Beratung. Fehlender Kontext führt zu allgemeinen Ideen.
4. Einen einzigen Editor und den vorhandenen Entwurfs-/CAS-Pfad verwenden. Die Auswahl erstellt weder ein zweites Textfeld noch automatisch einen Schritt. Erst „Schritt speichern“ übernimmt einen gewöhnlichen, noch nicht abgeschlossenen Schritt; dessen Abschluss bleibt eine weitere ausdrückliche Aktion.
5. **Eigene Worte dürfen nicht durch eine bloße Anregungswahl verloren gehen.** Eine bestätigte Ersetzung mit wiederverwendbarem Backup benötigt einen dauerhaften, validierten Entwurfsschutz. Eine reine `useState`-Sicherung genügt nach Autosave, Bereichswechsel oder Neustart nicht. Das ist von der flüchtigen Kategorieauswahl getrennt zu entscheiden.

Für Punkt 5 ist noch eine konkrete Vertragsentscheidung offen: Entweder werden passende **entwurfsbezogene** Schutzmetadaten mit eingefrorenen Vorgängerverträgen und neutraler Migration eingeführt, ohne die gespeicherte Goal-Struktur zu verbreitern; oder der erste sichtbare Umfang ersetzt eigene Worte überhaupt nicht automatisch. In dieser kleineren Variante bleibt eine Übernahme nur bei leerem beziehungsweise unverändertem Vorschlagstext möglich, bis dauerhafter Ersatzschutz vorhanden ist. Das wäre bewusst noch **keine vollständige ursprüngliche Ersetzungsparität**. Persönliche Worte dürfen nicht heimlich als neuer Journal-/Erfahrungsdatensatz ausgelagert werden, um eine Vertragsentscheidung zu umgehen.

Quelltexte und redaktionelle Anregungen behalten ihre bestehende Herkunft. Die Vorbereitung erklärt sie nicht für gemeinfrei oder für einen öffentlichen Produktvertrieb freigegeben. Vor einer tatsächlichen Inhaltsübernahme ist der vorhandene Projekt-Rechtestatus mitzuführen.

## Überprüfbare Abnahme für die spätere Umsetzung

| Bereich | Erforderlicher Nachweis |
|---|---|
| Deterministische Auswahl | Expliziter gültiger Kontext erhält die vorgesehenen Texte. Neutraler/ungültiger Kontext fällt verständlich zurück. Pro Art gewinnt unbenutzter Haupttext vor Alternative; erschöpfte Arten werden ausgelassen. Keine zufälligen oder zusätzlichen vierten Vorschläge. |
| Keine Prosa-Inferenz | Änderungen ausschließlich an Titel, Anliegen oder Journaltext ändern keine Anregung. Expliziter Wählerwechsel ändert nur Vorschläge, niemals das aktive Textfeld. |
| Wortschutz | Eigene Worte bleiben vor Bestätigung exakt erhalten. „Meine Worte behalten“ ist schreibneutral. Bei unterstützter Ersetzung müssen Wortbackup und ausgewählter Text auch nach Autosave, Neustart und Fehlerwiederaufnahme vorhanden sein; ein Konflikt überschreibt keine fremde Revision. |
| Entwurfsidentität | Auswahl, eigene Überarbeitung und spätere Wiederaufnahme behalten dieselbe Entwurfs-/Schrittidentität. Kontextwechsel startet keinen versteckten neuen Entwurf und führt keine ausstehende Bestätigung automatisch aus. |
| Normales Speichern | Nur der bestehende explizite Speicherknopf legt einen gewöhnlichen Schritt an. Er beginnt unvollständig; Lesen, Quizstatus, Erfahrungsbestätigung und Baum ändern sich durch Vorschau oder Auswahl nicht. |
| Zugänglichkeit | Vollständig beschrifteter Wähler und Vorschlagsbuttons, ausgewählter Zustand für Screenreader, erreichbare Bestätigungs-/Behalten-Aktionen, nachvollziehbare Fokusrückgabe. Texte bleiben bei 320 Pixeln, großer Schrift und beiden Farbschemata lesbar. Reduzierte Bewegung benötigt keine Sonderanimation. |
| Offline/Fehler | Ideen funktionieren ohne Netz oder KI-Schlüssel. Speicherfehler zeigen den echten Zustand und erhalten eigene Worte sowie Backup. Kein Erfolgstext vor tatsächlich erfolgreicher Speicherung. |
| Migration, falls nötig | Jeder bisherige Vertrag bleibt strikt unverändert lesbar; Migration erfolgt zunächst im RAM. Bestehende Vorhaben, offene/abgeschlossene Schritte und alte Entwürfe bleiben ohne zusätzliche Aktion unverändert. |

Die nötigen späteren Tests sind ein kleiner reiner Auswahlsatz, Transitions-/Speicherregressionen für den Wortschutz und echte Browserabläufe über Auswahl, Bestätigung, Neustart und Schreibfehler. Eine native Exportprüfung wäre weiterhin keine Geräteprüfung. **In dieser Vorbereitung wurden solche Tests nicht geschrieben oder ausgeführt.**
