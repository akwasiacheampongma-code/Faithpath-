# A5.1 – Wartungs- und Integrationsvertrag

Diese Studie erweitert den vorhandenen A4/A5-WebGL-Ansatz. Sie ist **keine zweite FaithPath-App** und greift weder auf Store noch Router oder persönliche Daten zu. Eine spätere App-Integration braucht die ausdrückliche gemeinsame Designfreigabe.

## Verantwortlichkeiten

| Datei | Verantwortung |
|---|---|
| `art-direction.json`, `stage-meanings.json` | Quellen, unveränderte Bedeutungen, Platzierung und Bildgrößen |
| `export-assets.py` | Geprüfte, atomare WebP-Ausgabe; inhaltsadressierte Dateinamen; Manifest und Allowlist |
| `stage-data.js` | Generierte Metadaten; nicht manuell parallel bearbeiten |
| `config.js` | Gemeinsame Qualitäts-, Zeit- und Größenverträge |
| `geometry.js` | Anatomische Holzachsen, bewegliche Felder, Wurzelanker und gemeinsames Netz |
| `motion-model.js` | Reines, deterministisches Windmodell; keine Uhr, kein DOM, kein Speicherzugriff |
| `leaf-renderer.js` | Ein vollständiges Bild, ein WebGL-Kontext, gemeinsame Netzpunkte, begrenzte Neuzeichnung |
| `performance-policy.js` | Gemessene Framerate → Auflösung/Netzdichte/Bildrate; verändert **keine Auslenkung** |
| `wind-player.js` | Einziger Eigentümer von `requestAnimationFrame`; aktive Zeit, weiches Wiederanlaufen |
| `asset-loader.js` | Genau eine passende Variante, Decode, Timeout, Abbruch, gleiche Stufe als Ersatz |
| `stage-transition.js` | Kurze native Überblendung einer alten statischen Momentaufnahme; kein zweiter Windloop |
| `tree-scene.js` | Laden, Sichtbarkeit, Vordergrund, Reduced Motion, Fehler, Lebenszyklus und öffentliche API |
| `tree.css` | Nur das Baum-Bildelement und sein Bewegungssaum |
| `gallery.*`, `tokens.css` | Ausdrücklich synthetische Vorschau, Theme- und Bedienvergleich |
| `reference/a5/` | Unverändertes altes Bewegungsmodell für den fairen Vergleich, keine produktive Runtime-Abhängigkeit |

## Szenenvertrag

```js
import { createTreeScene } from './tree-scene.js';
const tree = createTreeScene(element, { stage: 6 }); // Index 0–6
// Erst aufrufen/abwarten, wenn das Element sichtbar sein kann:
await tree.ready;
await tree.setStage(5);
tree.pause();
tree.play();
tree.setEnabled(false);
await tree.retry();
tree.dispose(); // beim Abbau zwingend
```

`ready` ist ein Getter auf das Promise der **aktuellen** Anforderung. Unsichtbare Szenen laden absichtlich nichts; dieses Promise kann bis zum Sichtbarwerden offen bleiben. Daher keine Seiteninitialisierung an das Laden unsichtbarer Bereiche koppeln. Ein neuer Auftrag löst das vorherige Promise mit `false` auf. Fehler oder Abbau liefern ebenfalls `false`.

`setStage` ist ausschließlich eine Darstellungsanforderung. Sie bestätigt keine persönliche Entwicklung und erhöht keinen Fortschritt. In einer zukünftigen Integration muss die **bestehende** App-Logik den Index liefern. Schwellen und gespeicherte Ereignisse dürfen nicht aus Galerie-Auswahlen hergeleitet werden.

`inspect(ms)` ist eine pausierende Diagnosefunktion für reproduzierbare Bildprüfungen. Sie ist **kein** Nachweis echter Laufzeit. Die 10-/30-/120-Sekunden-Nachweise stammen getrennt aus `tests/measure-live.mjs`, das diese Funktion nicht aufruft.

## Wind und Geometrie

Sechs überlappende Felder erzeugen unterschiedliche Phasen, langsame Unregelmäßigkeiten und sanfte Böen. Die Auslenkungen sind CSS-Pixel, unabhängig vom Geräte-Pixelverhältnis. Amplituden und junge Stufenreaktionen stehen zentral im Modell bzw. der Art-Direction. Holzachsen sperren die tragende Struktur, breite Übergänge verhindern harte Knicke. Das gemeinsam indizierte Netz hat keine unabhängig auseinanderlaufenden Kronenteile. Oliven bleiben Bestandteil desselben Bildes und derselben lokalen Verformung wie ihre Zweige.

Das Verfahren animiert **Bildbereiche**, keine einzeln freigestellten Blätter und kein botanisches 3D-Skelett. Neue PNGs enthalten daher keine behaupteten animierbaren Einzeläste. Die Illustration bleibt zusammenhängend; die Technik kann keine reale Blattphysik oder räumliche Wachstumsverformung liefern.

Unter 200 CSS-Pixeln wird die Auslenkung zur Netzsicherheit proportional kleiner. Ab 200 Pixeln bleiben die Bewegungswerte erhalten, auch wenn die Qualitätsregelung Auflösung, Netzdichte oder Framerate reduziert. Der Samen hat keine räumliche Bewegung, nur eine leichte Helligkeitsänderung.

## Stufenwechsel

680 ms native Opazitätsüberblendung mit einer eingefrorenen alten Zeichnung. Unterstützt der Browser `plus-lighter`, bleiben die vormultiplizierten Bildanteile additiv; andernfalls erfolgt eine ruhige Aus-/Einblendung. Keine erzwungene Stammverformung, keine Animation von Fortschrittsdaten. Eine kurze Höheninterpolation berücksichtigt die kompakte Darstellung früher Stufen. Abbruch, Reduced Motion, Unsichtbarkeit und Abbau entfernen die Momentaufnahme und alle zugehörigen Browseranimationen.

## Fehler und Ressourcen

- Erst bei Sichtbarkeit, aktiviertem Bereich und Vordergrund laden; neueste Anforderung gewinnt.
- Bestehendes vollständiges Bild und richtiger Stufenname bleiben bei einem fehlgeschlagenen Wechsel erhalten.
- Dekodiertes vollständiges Bild ist zugleich statischer Fallback; keine zweite Fallback-Datei nötig.
- Ohne WebGL, nach Kontextverlust, bei Reduced Motion oder unzureichender Bildrate: vollständige ruhende Illustration.
- Eine sichtbare pausierte Szene wird **vor** der Pausenentscheidung auf die echte Größe gebracht; damit entfällt der A5-2×2-Fehler.
- `dispose()` bricht Ladevorgänge und Animationen ab, entfernt Observer/Listener und gibt Shader, Programm, Textur und Buffer frei. Ein verspätetes Decode darf die Szene nicht wieder aufbauen.
- Diagnosepuffer sind begrenzt; es werden keine persönlichen Texte geloggt.

## Auslieferung und späterer PWA-Cache

`runtime-allowlist.json` enthält nur 21 optimierte Bildvarianten. Sichtbare Stufe und CSS-Größe bestimmen die eine benötigte Datei. Ersatzdateien werden nur nach einem Ladefehler versucht. PNG-Master, Quellenvergleiche, Videos, Screenshots und Berichte sind **keine Runtime-Ressourcen**.

Der bestehende App-Build kopiert ausdrücklich `src`, `data`, `trees`, `icons` und ausgewählte Root-Dateien; `design/` gehört nicht dazu. In dieser Studie wird dieser Build und sein Service Worker nicht geändert. Bei späterer Integration nur geprüfte Runtime-Dateien gezielt übernehmen; niemals den gesamten Designordner precachen. Die Galerie hat absichtlich keinen neuen Service Worker und überschreibt keine bestehende PWA-Origin.

## Reproduzierbare lokale Prüfung

Vom Repository-Root:

```sh
python3 design/olive-tree-a5-1/export-assets.py
node --test design/olive-tree-a5-1/tests/*.test.mjs
python3 -m http.server 4751 --bind 127.0.0.1 --directory design/olive-tree-a5-1
# In einer zweiten Shell:
node design/olive-tree-a5-1/tests/browser.mjs
```

Galerie: `http://127.0.0.1:4751/`. ES-Module benötigen einen lokalen HTTP-Server; `file://` ist kein verlässlicher Browserbetrieb. Für die serielle Performanceprüfung muss zusätzlich der unveränderte A5-Ordner auf Port 4750 bereitstehen. Währenddessen keine Browser-QA oder Videoaufnahme parallel starten. Die mitgelieferten PNG/MP4/PDF-Dateien lassen sich auch ohne Server öffnen.
