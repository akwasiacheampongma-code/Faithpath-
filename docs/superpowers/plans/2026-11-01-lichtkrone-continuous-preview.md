# Lichtkrone A.4 – kontinuierliche Vorschau: Auftrag, Audit und Arbeitsplan

Stand: 2026-11-01. **BLOCKED_ENVIRONMENT – noch keine neue Animation oder neue Stufen geliefert.**

## Verifizierte Grundlage und Freigabe

- Repository: `akwasiacheampongma-code/Faithpath-`.
- Ausgangsbranch: `feature/olive-tree-v2-a4-master-recovery`.
- Ausgangscommit: `c66edb0ff2fdd7a81c96713e5cd25488790f6636`.
- Isolierter Arbeitsbranch: `feature/olive-tree-a4-continuous-preview`.
- Der Auftraggeber hat die A.4-Masterillustration „Lichtkrone“ ausdrücklich als künstlerische Grundlage freigegeben.
- Diese neue Entscheidung hebt den bisherigen Freigabestatus im historischen A.4-Bericht auf. Historische Dateien bleiben als Vergleich unverändert.
- Beauftragt: sechs abgeleitete Stufen und kontinuierliche Animation als isolierte prüfbare Vorschau.
- Nicht freigegeben: App-Integration, Merge nach main, Produktionsdeployment.
- Keine Änderungen an persönlichen Daten, Schema V5, Wachstumsschwellen, Bibel- oder Quizdaten.
- Neue Stufen werden in der Vorschau manuell ausgewählt; Animation, Bibellesen und Quiz lösen keinen Aufstieg aus.

## Tatsächlich durchgeführtes Audit

Über GitHub wurden Branch, Commit, package.json, A.4-Mastermanifest, Bewegungsmodell, WebGL-Renderer, Player, Demo, vorhandene Browsertests und Stufenbedeutungen gelesen.

FaithPath ist eine JavaScript-Web-App mit eigenen Node-Buildskripten, Node-Tests und Playwright. Keine neue Engine nötig.

### Belegte Ursachen

1. `design/olive-tree-v2-a4/motion-player.js` stoppt ausdrücklich bei `elapsed >= CONFIG.duration`; `duration` ist 8000 ms.
2. `motion-model.js` liefert ab 8000 ms wieder Phase [0,0,0] und Licht 0. Nur die Stop-Bedingung zu entfernen reicht daher nicht.
3. Analytische Stichprobe des tatsächlichen Modells: Raster 25 Quellpixel, Zeitraster 100 ms. Maximal gefundene Auslenkung 3,118 Quellpixel bei [1075,525], t=3700 ms. Bei 200 CSS-px Bildbreite: 0,497 px; bei 300 px: 0,746 px. **Berechnung, keine Browser- oder Gerätemessung; kein Beweis eines globalen Maximums.**
4. Sichtbarkeit und Hintergrund stoppen den Player, aber starten ihn bei Rückkehr nicht automatisch neu.
5. `stop()` zeichnet sofort die Ruhepose; für weiches Wiederanlaufen muss die Phase erhalten oder weich eingeführt werden.
6. Der Player fordert bei laufender Bewegung jeden rAF an und begrenzt nur Draws auf 30 Hz. Der Renderer nutzt `preserveDrawingBuffer:true`. Beide Entscheidungen müssen für Dauerbetrieb gemessen werden.
7. Der Demo-Abbau stoppt bislang den Player bei pagehide, entsorgt dort aber weder ResizeObserver noch alle Renderer-Ressourcen. Der neue Szenenbesitzer braucht einen vollständigen Abbau.

### Vorhandene brauchbare Grundlage

- Ein zusammenhängendes texturiertes Netz; keine getrennt wackelnden Kronenausschnitte.
- Holzschutzbereiche und statische Prüfstellen.
- Statischer unterer Stamm-/Wurzel-Layer und vollständiger Master als Fallback.
- Reduced-Motion-Abfrage, IntersectionObserver und WebGL-Context-Loss-Handler.
- Vier lokale Themes: light, paper, atmospheric, night.
- Vorhandene Node-Tests gegen Holzbewegung und gefaltete Dreiecke; Browserprüfungen für Sichtbarkeit, Fallback und schmale Ansichten.

## Designentscheidung innerhalb des Auftrags

**Ansatz:** dieselbe WebGL-Netztechnik in einer isolierten Weiterentwicklung unter `design/olive-tree-v2-continuous/`. Keine zweite parallel konkurrierende Animationsengine im selben Baum. Historische A.4-Dateien nur für den ausdrücklich gewünschten Alt/Neu-Vergleich laden.

Alternativen:
- Ganzen Baum per CSS bewegen: verworfen, weil Stamm/Wurzeln statisch bleiben müssen.
- Video/GIF dauerhaft abspielen: verworfen, weil Sichtbarkeit, reduzierte Bewegung, Themen und lokale Bewegung schlechter kontrollierbar sind.
- Vorhandenes WebGL weiterentwickeln: gewählt entsprechend Auftrag; lokale Gewichte und gemeinsamer Bildzusammenhang bleiben nutzbar.

**Bewegung:** Mehrere nicht synchronisierte langsame Phasen, begrenzte sanfte Windimpulse, weiches Einsetzen; keine feste Acht-Sekunden-Rücksetzung. Ziel 1–3 sichtbare CSS-px in geeigneten Blattbereichen bei 200–300 px Darstellung. Stärke erst nach tatsächlicher Sichtprüfung abnehmen. Stamm, Wurzeln und tragende Äste geschützt; feinere Zweige reagieren lokal. Licht nur dezent im Laub.

**Betrieb:** nur sichtbar + Szene aktiv + Dokument sichtbar + keine reduzierte Bewegung + ausreichende Leistung. Ein Besitzer pro Schleife. Verstecken, Hintergrund, pagehide und dispose beenden die geplanten Frames. Wiederkehr erhält eine kontinuierliche Phase ohne großen Zeitsprung. Laufende Änderung von prefers-reduced-motion wird sofort berücksichtigt.

**Mobile Budget:** zunächst höchstens 30 Draws/s; Pixelratio begrenzen. Auf gemessene Überlast stufenweise geringere Auflösung/Rate, zuletzt statischer Master. Keine automatische Verringerung der Bewegungsamplitude bis zur Unsichtbarkeit. Rasterkosten, JS-Zeit, Frameintervalle und verfügbare Speicherindikatoren getrennt berichten. Keine Behauptung von Akku-, GPU- oder iPhone-Messungen ohne Messgerät.

**Stufen:** sechs eigene abgeleitete Illustrationen mit der freigegebenen A.4-Lichtkrone als Bildreferenz; Stufe 7 unverändert. Kein bloßes Verkleinern desselben erwachsenen Baums. Wiederkehrende Stammneigung, Rindencharakter, Blattfarben und Lichtlogik. Bedeutung aus `src/tree-stage-guide.js` und Bezeichnungen aus `src/content.js` übernehmen, ohne diese Produktdateien zu ändern.

## Umsetzung und Prüfreihenfolge

### 1. Umgebung und Ausgangspunkt
- [x] Remote-Branch und exakten Commit prüfen.
- [x] Separaten Branch vom geprüften SHA erstellen.
- [ ] Lokalen isolierten Checkout/Worktree dieses Branchs einrichten.
- [ ] Lokale AGENTS.md, Nutzeränderungen und Netzwerkkonfiguration prüfen.
- [ ] Abhängigkeiten installieren; Baseline `npm test`, `npm run lint`, A.4-Modelltests ausführen.
- [ ] Tatsächliche Masterbilder ansehen; A.4-Bewegung im Browser bei gleichen Aufnahmeeinstellungen sichern.

### 2. Kontinuierliches Modell und Lebenszyklus
Dateien: neue `motion-model.js`, `motion-player.js`, `leaf-renderer.js` und zugehörige Tests ausschließlich im Vorschauverzeichnis.
- [ ] Zuerst fehlschlagende Tests: Bewegung nach 8/30/120 Sekunden, statische Holzpunkte, keine Netzfaltungen.
- [ ] Sichtbarkeit, dynamisches Reduced Motion, Hintergrund, explizite Deaktivierung, mehrfacher Start, dispose und Context Loss mit kontrolliertem Scheduler testen.
- [ ] Modell und Player implementieren; vorhandene Renderer-Technik erweitern.
- [ ] Browsernachweis: keine weiteren Draws/Callbacks im pausierten Zustand; weiches Wiederanlaufen.
- [ ] Ressourcenabbau auch bei abgebrochenem Bildladen und Navigation prüfen.
- [ ] Überlast-Fallback mit provozierter Last separat vom ungestörten Performance-Test prüfen.

### 3. Sechs abgeleitete Wachstumsbilder
Dateien: `assets/stages/`, `stage-manifest.json`, dokumentierte Bildquellen/Prompts.
- [ ] Master tatsächlich ansehen und als Bildreferenz einsetzen.
- [ ] Samen, Keimling, junger, wachsender und starker Baum sowie erste Früchte erstellen und auf zusammenhängende Identität prüfen.
- [ ] Stufe 7 byte-identisch aus A.4 übernehmen, Hash nachweisen.
- [ ] Schutzbereiche pro neuem Bild anhand tatsächlicher Stamm-/Astpositionen festlegen.
- [ ] Samen symbolisch sehr dezent, junge Blätter sanft, entwickelte Kronen differenziert bewegen.
- [ ] Früchte mit ihren Zweigen verbunden halten.

### 4. Prüfbare Vorschau
Dateien: `index.html`, `preview.js`, `preview.css`, `README.md`.
- [ ] Sieben Stufen manuell auswählbar; keine App-Daten lesen/schreiben.
- [ ] A.4/Neu mit gleicher Größe, gleichem Theme und gleicher Zeitbasis nebeneinander.
- [ ] 320/390 px Viewports und 200/250/300 px Baumgröße prüfen.
- [ ] Alle vier FaithPath-Themes, große Schrift und 44-px-Bedienelemente.
- [ ] Nur sichtbare Vergleichsbäume animieren; statische Stufenkontaktübersicht statt sieben unnötig laufender WebGL-Kontexte.

### 5. QA, Aufnahmen und Lieferung
Dateien: `qa-browser.mjs`, `evidence/`, `PERFORMANCE.md`, `REPORT.md`.
- [ ] Tatsächliche bewegte Browseraufnahmen: A.4/Neu, sieben Stufen, mobile Ansichten.
- [ ] Stamm-/Wurzelvergleich, sichtbare Blattbewegung und Schleifen-/Übergangsqualität visuell prüfen.
- [ ] Reduced Motion, realer Browser-Lifecycle soweit verfügbar und synthetische Hintergrundtests getrennt kennzeichnen.
- [ ] Frameintervalle, Drawrate und verfügbare Ressourcenmessungen vor/nach protokollieren.
- [ ] Produktregressionstests erneut ausführen; Diff auf ausschließlich Vorschau/Plan begrenzen.
- [ ] Paket mit exakt geprüftem Commit, Startanleitung, Video, Bericht und bekannten Einschränkungen liefern.
- [ ] STOP vor App-Integration zur Freigabe.

## Aktuelle Blockade und ehrlicher Prüfstatus

Die ausgewählte Cloud-Umgebung meldet `observed_phase:pending`, `connectivity:offline`. Ein lokaler Shellversuch scheitert mit `No usable execution environment is available`. Das Warten auf den Start läuft, hat bisher aber keine ausführbare Umgebung bereitgestellt.

Daher bisher **nicht durchgeführt**: lokaler Checkout, Bildansicht/Neuerstellung, Codeänderungen, automatisierte Projekt- oder Browsertests, Videos, Geräte-/Performanceprüfung.

Die Quellcodeauswertung über den verfügbaren GitHub-Zugriff und die obige analytische Stichprobe sind tatsächlich durchgeführt. Sie ersetzen weder die Sichtprüfung noch eine Laufzeitmessung.

Keine App-Integration, kein Merge und kein Produktionsdeployment vorgenommen. Die neue Animation und die sechs neuen Stufen sind noch nicht abnahmefähig, weil sie noch nicht implementiert und geprüft wurden.
