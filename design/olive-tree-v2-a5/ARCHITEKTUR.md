# Architektur der isolierten Lichtkrone-Vorschau

## Zuständigkeiten

| Datei | Verantwortung |
|---|---|
| `manifest.json`, `stage-data.js` | Zentrale Bild-/Stufen-/Bedeutungszuordnung. Aus festen Masterdateien erzeugt. |
| `motion-model.js` | Reine Geometrie, geschützte Holzachsen, drei Blattfelder, Wind/Gust/Licht und CSS-Auslenkung. |
| `reference/a4-motion-model.js` | Bytegleiche alte A.4-Geometrie und Pose zum Vergleich; keine eigene Renderengine. |
| `leaf-renderer.js` | Ein gemeinsames WebGL-Netz, eine obere Textur, shaderbasierte Bewegung, Teil-Neuzeichnen, Ressourcenabbau. |
| `performance-policy.js` | Ausschließlich tatsächlich gelieferte Bilder während aktiver Sichtbarkeit auswerten; Qualität reduzieren, gegebenenfalls statisch. |
| `tree-scene.js` | Bildladen, Fallback, Sichtbarkeit, Vordergrund, Reduced Motion, Wiederaufnahme, ein RAF und vollständiger Abbau. |
| `gallery.js` | Steuerelemente und synthetische Gestaltungskontexte. Kein App-Store und kein persistenter Zustand. |
| `export-assets.py` | Verlustfreies WebP und zwei registrierte Platten aus unveränderten PNG-Eingaben. |

## Bildtechnik

Die freigegebene Stufe 7 bleibt **bytegleich**. Jede Stufe ist eine zusammenhängende Illustration. Die Runtime trennt lediglich den ruhenden unteren Bereich und die obere Gesamtzeichnung. Das sind keine unabhängig generierten Laubbüschel. Die obere Textur enthält auch Tragholz; dessen Netzknoten haben Bewegungseinfluss null. Feinere Zweige dürfen sich zusammen mit den Blättern verformen. Oliven bleiben an dieselbe Textur gebunden.

Beim Samen rahmt ein dokumentierter oberer Anzeigeausschnitt von 480 Quellpixeln das tief im Canvas liegende Motiv. Die Quelldatei, Bodenposition und Bewegungskoordinaten werden nicht verändert; beschnitten wird der weitgehend transparente Leerraum, keine Textfläche. Alle übrigen Motive verwenden die vollständige Canvas.

Die drei überlappenden Blattfelder bewegen sich mit verschiedenen Phasen, nicht gleichförmiger Zeitfunktion und gelegentlichen sanften Windimpulsen. Das ist eine zweidimensionale Verformung, keine 3D-Zweigphysik und keine einzeln animierte Blattgeometrie. Der Samen verschiebt sich nicht; nur sehr schwaches Licht ist vorgesehen.

Ein gemeinsames Netz ohne Schnittkanten verhindert die A.3-Collagewirkung. Bei niedriger Qualität hat es 40×40, sonst 56×56 beziehungsweise 72×72 Zellen. Gerundete registrierte Quellkoordinaten vermeiden Drift in der Ruheposition. Das Neuzeichnen ist auf einen konservativ erweiterten Kronenbereich begrenzt. Ein Pixeldifferenztest vergleicht das Ergebnis mit vollständigem Neuzeichnen.

## Lebenszyklus

`createTreeScene(root, options)` liefert `ready`, `setStage(index)`, `play()`, `pause()`, `setEnabled(bool)`, `retry()`, `dispose()` und ausschließlich lesende Diagnosewerte. `inspect(ms)` ist eine pausierende Prüfpositionsschnittstelle der Studie, kein Produktfortschritt.

Laufen darf eine Szene nur bei mindestens einem Prozent sichtbarer Bildfläche, verbundenem DOM-Knoten, aktiviertem Bereich, Vordergrund, fertigen Ressourcen, ausreichend hoher Leistung und ohne Reduced Motion. Die erste Beobachtung durch IntersectionObserver geht dem automatischen Start voraus. Beim Pausieren wird RAF abgebrochen. Während der Pause laufen weder Zeit- noch Render-Timer. Aktive Zeit bleibt stehen. Beim Fortsetzen mischen 850 ms weich vom zuletzt gezeichneten Zustand in den Wind.

Medienwechsel, `visibilitychange`, `pagehide`, `pageshow`, Bereichswechsel und Komponentenabbau haben eigene Abbruchpfade. Zusätzlich prüft der aktive Frame die Medienpräferenz und `document.hidden`, bevor er zeichnet. Die Diagnosewerte lesen eine zwischengespeicherte Medienpräferenz; ihre Abfrage löst keine neue MediaQuery-Auswertung aus.

Asynchrone Bildwechsel sind mit einer Generationsnummer abgesichert. Nach jedem relevanten `await` werden Abbau und neuere Anforderung geprüft. Ein Grafikverlust während `base.decode()` darf den zuvor eingeblendeten vollständigen Fallback nicht wieder verstecken. Der entsprechende Fehler wurde im Review reproduziert und durch einen Rot-/Grün-Test abgesichert.

`dispose()` beendet RAF, entfernt alle Listener und Observer und gibt Texture, Buffer, Shader und Programm frei. Eine spätere Bildauflösung startet die Szene nicht erneut. In der App muss jeder spätere Router-/Komponentenbesitzer `dispose()` verlässlich aufrufen; die App-Integration ist noch nicht erfolgt.

## Qualität und Verbrauch

| Qualität | Zielbilder/s | maximales DPR | Netz |
|---|---:|---:|---:|
| Hoch | 30 | 1,75 | 72×72 |
| Mittel | 24 | 1,25 | 56×56 |
| Niedrig | 18 | 1 | 40×40 |
| Statisch | 0 | 1 | ruhend |

Der Samen verwendet 8/6/4 Bilder/s und höchstens DPR 1,25. Nach einer Sekunde Einlaufzeit werden Dreisekundenfenster gemessen. Unter 65 % der Sollbildrate wird eine Stufe gesenkt. Zweimal unzureichende niedrigste Qualität ergibt statischen Betrieb. Verborgene Zeit zählt nicht als langsames Messfenster. Die Diagnosehistorie ist auf 180 Dreisekundenfenster begrenzt und wächst im Dauerbetrieb nicht unbegrenzt. Der Test simuliert dafür 60.000 gelieferte Bilder; das ist kein echter 33-Minuten-Gerätelauf. Kein automatisches ständiges Hoch-/Herunterschalten; eine ausdrückliche Wiederholung ist möglich.

Die Bewegungsverstärkung hängt von CSS-Breite und Stufe ab, **nicht von Qualitätsstufe oder Framebufferauflösung**. Weniger Auflösung macht die Bewegung deshalb nicht wieder unsichtbar. Begrenztes DPR und Kronen-Scissor sparen Arbeit. `preserveDrawingBuffer` ist für diesen konservativen Teil-Neuzeichenansatz nötig; seine tatsächlichen Energiekosten auf iPhone müssen gemessen werden. Die reine FPS-Regel erkennt keine hohe Akkulast bei dennoch flüssiger Darstellung.

## Spätere App-Integration – noch nicht freigegeben

1. Zunächst die dann aktuelle echte App-Basis verifizieren; später nur Assets/Runtime gezielt übertragen, keinen ganzen historischen Designbranch in die App mergen. Künstlerische Entscheidung zur Sechser-Ableitung und Dauerbewegung einholen.
2. Runtimeformat und pro Stufe tatsächlich benötigte Bildgrößen für App-Cachebudget bestimmen. Quell-PNGs und Videonachweise gehören nicht in den Produktcache.
3. Bestehende zentrale Stufenlogik ausschließlich als Eingabe verwenden. Keine Zähl- oder Datenlogik aus der Studie übernehmen.
4. Vorhandene Ansichten mit einem geteilten Scene-Adapter verbinden; parallel unsichtbare Szenen deaktivieren und beim Abbau entsorgen.
5. Eigene App-Regressions-, Service-Worker-, Offline-Update- und Backupprüfungen nach der Integration durchführen.
6. Physische iPhone-/Safari-/VoiceOver- und Wärme-/Akkutests vor einer Veröffentlichung abschließen.

Keine Migration, neue Engine, Framework- oder Speichersystemänderung ist dafür vorgesehen.
