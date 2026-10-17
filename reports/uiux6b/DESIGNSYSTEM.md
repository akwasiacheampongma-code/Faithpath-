# Verbunden · integriertes Designsystem

Die Quelle ist `src/verbunden/tokens.css`, der Einstieg `src/verbunden.css`. Die sieben getrennten Stylesheets werden beim Build zu einer lokalen Datei gebündelt. Kein CDN und keine externe Schriftanfrage. Die folgenden Werte sind tatsächlicher Anwendungscode, keine zweite Demo-Konfiguration.

## Semantische Rollen und Themes

| Rolle | Verwendung |
|---|---|
| `--v-canvas`, `--v-surface` | Seitenhintergrund und erhöhte Oberfläche |
| `--v-ink`, `--v-muted` | Haupttext und sekundäre Informationen |
| `--v-accent`, `--v-on-accent` | Hauptaktion und ihre lesbare Beschriftung |
| `--v-faint`, `--v-line` | zurückhaltende Auswahlfläche und Trennung |
| `--v-focus` | sichtbare Tastaturfokussierung |
| `--v-warm`, `--v-warm-ink` | warmer inhaltlicher Akzent |
| `--v-danger` | Löschen und tatsächliche Fehler |
| `--v-selected`, `--v-highlight-*` | Versauswahl und vorhandene Markierungen |

Die Brücke auf bestehende `--fp-*`-Variablen hält alte Komponenten kompatibel. Die bisherigen Theme-IDs `light`, `atmospheric`, `paper`, `night` bleiben in Einstellungen und Exporten unverändert.

## Schrift und Rhythmus

Newsreader, normal und kursiv, trägt Lesen, Kapitelüberschriften und persönliche Worte. DM Sans trägt Bedienung, Auswahl und Metadaten. Die lokalen Original-TTFs und SIL-OFL-Dateien sind unter `src/verbunden/assets/` belegt. `ASSET_PROVENANCE.json` enthält Quellpfade und Hashes.

Grundrollen: Seitenüberschrift 2,5rem, Abschnitt 1,75rem, Lesen 1,25rem mit Zeilenhöhe 1,78. Der Reader besitzt eine eigene responsive Kapitelskala, damit „Johannes“ auch bei 320 Pixeln und großer Schrift nicht mitten im Wort bricht. Persönlicher Schreibtext nutzt 1,4rem/1,75. Keine Schrift wird zur Lösung von Überlauf künstlich verkleinert. Aa verändert nur die transiente Readerdarstellung; die Systemeinstellung großer Schrift bleibt wirksam.

Das Raster verwendet überwiegend 8-, 12-, 16-, 24- und 32-Pixel-Abstände, 24 Pixel Seitenrand, auf sehr schmalen Screens 18 Pixel. Der Lesesatz ist auf 650 Pixel begrenzt, der Reader auf 780 Pixel. Radien: 8, 16 und 24 Pixel. Trennlinien und Weißraum strukturieren sekundäre Bereiche; eine gleichförmige Kartenfolge ist nicht der Standard.

## Komponenten und Interaktion

- Header, vier Hauptziele und Drawer verwenden die bestehenden Navigationsverträge. Ab 1100 Pixeln wird der größere Bildschirm mit seitlicher Navigation genutzt. Darunter misst der vorhandene Observer die tatsächliche untere Navigationshöhe. Bei großer Schrift dürfen Beschriftungen umbrechen und Inhalte erhalten die passende Scrollreserve.
- Primäre Buttons verwenden Akzentfläche und semantischen Gegentext, Nebenaktionen eine ruhige Text-/Linienvariante. Wesentliche Ziele und Schließen besitzen mindestens 44 Pixel. Fokus ist eigenständig sichtbar und wird nach Aktionen an ein vorhandenes sichtbares Element zurückgegeben.
- Editor, Importprüfung und Bestätigungen bleiben native `dialog`-Elemente mit ursprünglichen Formularen. Der Schreibheader besitzt auf mobilen Screens eine volle Titelzeile und separat rechtsbündige Aktionen. Safe Areas werden genau einmal reserviert. Die Textfläche wächst bis zum verfügbaren Fenster, maximal 600 Pixel; lange Texte behalten die native Caret-/Innenscrollsteuerung.
- Versinteraktion: Inline-Text mit originaler Referenz, tastaturbedienbarer Auswahl und bestehenden Markierungs-/Notizaktionen. Konzentrationsmodus reduziert Bedienung. Escape kehrt zum sichtbaren Aa-Bedienelement zurück.
- Quiz: redaktioneller Fragetext, vier echte Antworten, ursprüngliche Rückmeldung und Erklärung; keine Punktedekoration. Freiwillige Reflexion bleibt persönlich und wird nicht bewertet.
- Baum und Siegel bleiben unterschiedliche Symbole. Sieben Originalstufen und bestätigte Entwicklung gehören zur persönlichen Geschichte; das Buch-Schwert-Siegel zeigt dokumentierte Bibelreise, keinen geistlichen Wert.

## Zugänglichkeit und Bewegung

Themefarben werden semantisch gewechselt; kein universeller Invertierungsfilter. Markierungen behalten ihre bestehenden gespeicherten Farbschlüssel. Die Auswahlunterstreichung hat auch auf vorhandener Markierung einen nachgemessenen Kontrast. Native Auswahlfelder erhalten Beschriftung und passende `color-scheme`-Darstellung.

`prefers-reduced-motion` entfernt nicht notwendige Bewegung und weiches Scrollen. Es gibt keine neue Dauerschleifenanimation, keine Belohnungseffekte und keine blinkende Anzeige. `safe-area-inset-*` beziehungsweise die vorhandenen Testvariablen bleiben wirksam. 200% Schrift, kleine Viewports, lange Texte und Fokusfälle werden separat geprüft.

Die 28 konkreten Kontrastgruppen bestehen; dies ersetzt keine vollständige WCAG-Prüfung. Insbesondere native Safari-Picker, Bildschirmtastatur und VoiceOver bleiben ein physisches Gate. Bei 320 Pixeln und 200% Schrift verlangt der vollständige Readerkopf zunächst Scrollen; der Konzentrationsmodus bietet weniger Bedienungsfläche. Die Schrift wird dafür nicht unlesbar verkleinert.

## Pflege für menschliche Entwickler

Fachliche Wahrheit bleibt in den bisherigen Modellen. In den neuen Präsentationsmodulen keine persönlichen Speicherzugriffe, Inhalts-ID-Erfindung oder Datenmigration ergänzen. Views verwenden die ursprünglichen Adapter und escape-Funktionen. Gemeinsame Darstellungshilfen bleiben klein und rein beziehungsweise explizit auf transienten UI-Zustand beschränkt.

Neue Komponenten verwenden semantische Tokens und einen klaren Seiten-/Komponentenbereich. Die alte CSS-Basis ist bewusst noch vorhanden; vor einer neuen Ausnahme zuerst berechnete Styles prüfen. Nur die nachgewiesenen Dialogkonflikte benötigen die gezielt spezifischen `#dialog.writing-dialog`-Regeln. Eine pauschale Bereinigung der alten Styles ist getrennte Arbeit mit eigener Regression.

Vor Änderung des Readers: Versreferenzen, Tastaturfokus, Kurzkapitel und tatsächliche Fortschrittsereignisse prüfen. Vor Änderung des Editors: Langtext, Safe Areas, 200%, Entwürfe und echten Submitpfad prüfen. Vor Änderung von Backupansichten: ursprüngliche Validatoren, zwei Bestätigungen, Locks, Quota und Request-Frische prüfen. Die finale Regression und Reproduktionsanleitung liegen separat bei.

## Tatsächliche Kernpalette

| Theme | Canvas | Oberfläche | Text | Sekundärtext | Akzent |
|---|---|---|---|---|---|
| light | `#f7f7f2` | `#fffefa` | `#20382f` | `#56635a` | `#355e49` |
| atmospheric | `#142c27` | `#1b352f` | `#f0f0e4` | `#b9c9bd` | `#b9d0ab` |
| paper | `#f3eddf` | `#fbf5e9` | `#3d3b2e` | `#645e4f` | `#596342` |
| night | `#141b23` | `#1d2731` | `#e9edf0` | `#b7c1cb` | `#bfd3d7` |

Alle zusätzlichen Rollen und Maße stehen maschinenlesbar in `DESIGN_TOKENS.json`.
