# FaithPath · Lichtkrone · Sieben Stufen und Dauerbewegung

Prüfstand 01.11.2026 · Isolierte Designabnahmevorlage · `FP-DESIGN-20261101-OLIVE-LIVING-SEVEN`

## Ergebnis und Freigabegrenze

**GO zur Designentscheidung über die neue Reihe und Dauerbewegung. CONDITIONAL GO für die spätere technische Integration; keine Produktionsfreigabe.** Der ausgewachsene A.4-Master ist bytegleich erhalten. Sechs jüngere Motive wurden davon abgeleitet. Der neue Wind läuft ohne Achtsekundenende, solange die Szene sichtbar, aktiv, im Vordergrund und ausreichend flüssig ist und keine reduzierte Bewegung eingestellt wurde.

Die Vorschau ist fertig prüfbar. Die menschliche Beurteilung von Natürlichkeit und wahrnehmbarer Bewegung sowie physische iPhone-/Safari-/VoiceOver-, Wärme- und Akkutests bleiben offen. Nach dieser Lieferung STOP zur ausdrücklichen Freigabe der App-Integration.

## Tatsächlicher Stand

- Repository: `akwasiacheampongma-code/Faithpath-`.
- Ausgangsbranch: `feature/olive-tree-v2-a4-master-recovery`, Basiscommit `c66edb0ff2fdd7a81c96713e5cd25488790f6636`.
- Neuer isolierter Branch: `feature/olive-tree-continuous-seven-stages-20261101`.
- Geprüfter Implementierungsstand: `1e53a1292ba7d1cea135ac56e59e2803b3782ceb`. Der spätere Liefercommit ergänzt Nachweise und Dokumentation; sein exakter SHA steht in der Lieferdatei des ZIPs.
- Ausschließlich neue Dateien unter `design/olive-tree-v2-a5/`. Alle 4,639 zuvor versionierten Dateien sind bytegleich, einschließlich App, A.1–A.4, Content und Datenverträgen.
- Kein Produktbuild, keine App-Integration, kein Service-Worker-Austausch, kein Merge und kein Deployment.

## Künstlerische Umsetzung

Die freigegebene A.4-Lichtkrone mit ihrer zusammenhängenden Krone, dem hohen linken Leitast, dem tiefen rechten Astbogen, der Stammhöhlung und den verdrehten Wurzeln wurde nicht neu generiert oder ersetzt. Ihr SHA-256 lautet `eb1294571c0b57c0ae17e7b8064d4b6e428729ea79ddbbae46fcf46578987e3d`.

Die sechs neuen Altersdarstellungen wurden mit dem verfügbaren Bildwerkzeug anhand tatsächlich eingebundener lokaler Referenzen abgeleitet. Alle sechs tatsächlichen Prompts stehen in `prompts.json`. Samen und Keimling sind bewusst botanische Nahansichten. Ab dem jungen Baum verbinden S-Stamm, linke Hauptgabel und tiefer rechter Astbogen die Reihe. Stufe 5 trägt keine Oliven, Stufe 6 wenige erste Fruchtgruppen, Stufe 7 die deutlich reichere Fruchtzeichnung des unveränderten Originals.

Für den tief im Quellcanvas gezeichneten Samen wird nur der weitgehend transparente obere Leerraum in der Vorschau ausgespart; die Illustration und ihre Quellkoordinaten bleiben unverändert.

Die sieben Namen, Bedeutungen und Schwellen bleiben erhalten: 0, 1, 2, 3–4, 5–6, 7–9 und ab 10 ausdrücklich bestätigte Entwicklungen. Die Galerieauswahl demonstriert einen Bildzustand, erzeugt aber keinerlei Fortschrittsereignisse. Lesen, Quiz, Animationen oder erledigte Schritte führen zu keinem Aufstieg.

**Kritische Bewertung:** Die reife Dreiergruppe ist vor allem durch Früchte und etwas unterschiedliche Kronendichte unterscheidbar; die Namen bleiben deshalb sichtbar. Die jungen Bilder enthalten noch relativ charaktervolle, teilweise schon alt wirkende Rindenmotive. Kleine Ast-/Wurzelpositionen sind zwischen den Altersdarstellungen nicht pixelidentisch. Es ist eine kohärente illustrierte Familie, kein mathematisch registriertes 3D-Altersmodell und keine sofort morphbare Skelettanimation. Wiederkehrende Blattfächer und polierte Holzpartien des freigegebenen Masters bleiben bestehen. Dafür werden keine künstlichen Qualitätsnoten vergeben.

## Was sich an der Bewegung ändert

- Das achtsekündige Ende wurde für den neuen Wind entfernt. Das alte A.4-Profil bleibt nur im ausdrücklich beschrifteten Vergleich bestehen.
- Drei überlappende Laubfelder verwenden unterschiedliche Phasen, mehrere ruhige Frequenzen, geglättete deterministische Variation und gelegentliche sanfte Windimpulse. Es gibt keinen kurzen festen Achtsekunden-Loop.
- Der ausgewachsene Baum erreicht in den Modellproben maximal etwa 2.38 CSS-Pixel Auslenkung aus der Ruheposition bei 200 und 300 CSS-Pixeln Darstellungsbreite. A.4 erreicht bei 200 Pixeln etwa 0.50 Pixel. Das sind lokale Modellauslenkungen, keine gemessene iPhone-Bildrate und keine hin-und-zurück-Gesamtstrecke.
- Der Keimling verwendet weniger Verstärkung, die jungen Kronen steigern sich zurückhaltend. Der Samen verschiebt sich nicht, sondern erhält nur eine schwache symbolische Lichtveränderung. Die Lichtvariation der Krone liegt ungefähr in der Größenordnung von zwei Prozent, ohne Leuchteffekt.
- Tragholz und Wurzeln bleiben über Nullgewichte und die ruhende Basis geschützt. Feine Zweige und angebundene Oliven bewegen sich gemeinsam in derselben Zeichnung.
- Die Technik bleibt das weiterentwickelte A.4-WebGL-Netz. Der Vergleich verwendet zwei Szenen desselben Renderers mit unterschiedlichen Bewegungsprofilen; keine konkurrierende zweite Engine.

## Laufzeit, Pause und Fehlerfälle

Nur mindestens ein Prozent sichtbare Bildfläche darf laufen. `IntersectionObserver`, `visibilitychange`, `pagehide`, `pageshow`, dynamisches Reduced Motion und Bereichsdeaktivierung steuern denselben Lebenszyklus. Ein aktiver Frame prüft die Medienpräferenz und Hintergrundlage zusätzlich vor dem Zeichnen. Unsichtbarkeit, Hintergrund, Pausieren oder Abbau brechen RAF ab. Während der Pause läuft kein Render-Timer weiter. Die Diagnosehistorie ist auf 180 Fenster begrenzt; ein synthetischer Test mit 60.000 Bildern sichert dauerhaft begrenzten Speicher ab. 850 ms mischen bei Rückkehr weich vom letzten Zustand in den Wind.

Ein Generationszähler verhindert, dass ein langsames altes Bild eine neuere Stufenauswahl überschreibt. `dispose()` entfernt Listener/Observer und gibt Grafikressourcen frei. Fehlendes WebGL, eine fehlende obere Bildplatte oder tatsächlicher Grafikverlust zeigen das vollständige ruhende Bild. Nach Grafikverlust wird neu geladen; „Qualität neu prüfen“ ist für den FPS-Regler gedacht und stellt keinen verlorenen Grafik-Kontext wieder her.

Im unabhängigen Review wurden zwei echte Randfälle gefunden, vor der Korrektur reproduziert und danach gezielt grün geprüft: Grafikverlust während des noch laufenden `base.decode()` versteckte den Fallback wieder; Neustart des bereits laufenden A.4-Vergleichs behielt seine alte Uhr. Beide sind behoben. Die Review-Nachprüfung meldet keine weiteren materiellen Befunde.

## Tatsächlich gemessene Performance

Linux, Chromium 151.0.7922.173, ANGLE/SwiftShader-Softwaredarstellung, 390 × 844 CSS-Pixel, DPR 2. Je 30 Sekunden allein gemessen, nach Einlaufphase, ohne parallele Videoaufnahme. Die tatsächlichen Bildraten sind bewusst auf höchstens 30 begrenzt.

| Baumgröße | Renderframes/s | Frameabstand p95 | JS-Aufrufzeit p95 | Framebuffer | Frames deaktiviert |
|---|---:|---:|---:|---:|---:|
| 200 px | 30.00 | 33.4 ms | 0.10 ms | 350² | 0 |
| 300 px | 30.00 | 33.4 ms | 0.10 ms | 525² | 0 |

Die Bildrate zählt tatsächlich an WebGL übermittelte Renderframes pro Messfenster. Hardwareseitige Präsentationsrate, Scan-out und GPU-Frametime wurden nicht gemessen. Die WebGL-Aufrufzeit misst nur die JavaScript-Übermittlung, nicht die asynchrone GPU-Fertigstellung. Der konservative Kronen-Scissor aktualisiert etwa 70,5 % des Framebuffers. Daraus wird keine pauschale Gesamtersparnis von 30 % abgeleitet.

Die Messdatei enthält echte Chromium-Prozess-CPU-Zeitdifferenzen sowie Main-Thread-Taskdauer, Scriptdauer und JS-Heap. Bei 200 Pixeln beanspruchte der Software-GPU-Prozess 11.15 CPU-Sekunden in rund 30 Sekunden, bei 300 Pixeln 14.26. Das ist eine erhebliche Software-Renderlast, **kein Beleg für niedrigen Akkuverbrauch auf einem iPhone**. Die Taskdauer ist keine separate Betriebssystem-CPU-Messung und darf nicht dazu addiert werden. Im jeweiligen viersekündigen deaktivierten Fenster wurden null Bilder und kein ausstehender RAF beobachtet.

Der Leistungsregler reduziert nach tatsächlich zu niedriger Bildrate Auflösung, Netz und Zielbilder/s: 30 / 24 / 18, danach bei wiederholt unzureichender niedriger Qualität statisch. Die CSS-Auslenkung bleibt dabei gleich. Pausenzeit geht nicht in langsame Messfenster ein. Der Samen läuft nur mit 8 / 6 / 4 Bildern/s. Das Verhalten bei schwacher Leistung ist synthetisch getestet; im gemessenen Laborlauf war keine Reduktion nötig. Ein flüssiges Gerät mit trotzdem hoher Akkulast wird durch die reine FPS-Regel nicht erkannt; dafür bleibt das Geräte-Gate erforderlich.

## Mobile Gestaltung und Barrierefreiheit

Heute, Mein Weg, Baumdetail und erster persönlicher Weg sind als synthetische Kompositionen vorhanden. Das Motiv ist groß, der Bibelzugang bleibt davor erreichbar. Die ausführliche Stufenbedeutung ist aufklappbar, damit sie den nächsten persönlichen Schritt nicht verdrängt. Bei 320 Pixeln und großer Schrift wird selbstverständlich vertikal gescrollt; Texte und Aktionen werden dafür weder verkleinert noch abgeschnitten.

Die Vorschau wurde bei 320 × 568 und 390 × 844 in vier Themes mit normaler und 200-%-Schrift geprüft: 112 Stufen-/Theme-/Größenfälle. Zusätzlich wurden alle drei vollständigen Galerieansichten in beiden Breiten und vier Themes mit 200 % Schrift geprüft: 24 Fälle. 430-Pixel- und Desktopbilder liegen ebenfalls vor. Native Auswahlfelder erhielten passende Mindestbreiten; Navigation und Karten dürfen umbrechen. Deutsche weiche Trennstellen betreffen ausschließlich die Darstellung, nicht die gespeicherten Namen/Bedeutungen. Clippen ist kein Mittel zur Verdeckung von Textüberlauf.

Zwölf Axe-A/AA-Scans melden keine automatisiert erkannten Verstöße. Tastaturbedienung der Stufenauswahl, der Bedeutungsübersicht und des erklärten Bibelzugangs wurde ausgeführt. Das ist kein vollständiges WCAG-Zertifikat und keine VoiceOver-Abnahme. Physische Safe-Area-, Safari-Zoom-, Touch- und Hintergrundprüfungen bleiben offen.

## Prüfnachweise

| Prüfung | Ergebnis | Nachweis |
|---|---|---|
| Bestehende App-Unit-/Regressionstests | 246 bestanden | `evidence/regression-unit.log` |
| Bewegungs-/Geometrie-/Leistungspolitik | 6 bestanden | `motion.test.mjs`, `evidence/motion-unit.log` |
| Browser-Verhalten, Fehlerfälle und Layout | 18 Gruppen bestanden | `evidence/browser-qa.json` |
| Accessibility automatisiert | 12 Scans, keine gemeldeten A/AA-Verstöße | `evidence/axe.json` |
| Teil-Neuzeichnen gegen vollständiges Zeichnen | 7 Stufen × 5 Posen, exakt gleiche Pixel | Browserbericht |
| Gerendertes Tragholz | Geprüfte Quellflächen unverändert | Browserbericht |
| Bildfidelität | Alpha im Ruhezustand gleich; höchstens rund 2/255 Premultiplied-RGB-Quantisierung im Browservergleich | Browserbericht |
| Original- und Runtimebilder | Vollständiges RGBA und zusammengesetzte Platten bytegleich | `evidence/integrity.json` |
| Zweiter Laufzeitbildexport | 23 Dateien bytegleich | `evidence/reproducibility.json` |
| Lint der bestehenden App | 0 Fehler, 5 unveränderte Warnungen | `evidence/lint.log` |
| Sichtbarkeit / Deaktivierung / Abbau | Keine weiteren Frames im geprüften Fenster | Browserbericht |
| Hintergrundhandler | Synthetische Dokument-/Lifecycle-Ereignisse bestanden | Browserbericht; echtes iPhone offen |
| Unabhängiger Review | Zwei Befunde korrigiert und nachgeprüft | `evidence/review.json` und Rot-/Grün-Logs |
| Echte iPhone-/Safari-/VoiceOver-/Akkutests | OFFEN | `IPHONE_PRUEFLISTE.md` |
| App-PWA-Update / produktive Offline-Abnahme | Hier nicht ausgeführt | Noch keine App-Integration |

36 echte neue Browser-PNGs und zwei echte Browser-Videos werden geliefert. Die Video-Kodierung mit 25 fps ist kein Geräte-FPS-Nachweis. Die Originale wurden nicht nachkoloriert oder zeichnerisch retuschiert; lediglich die falsche Full-/Limited-Range-Metadatenkennzeichnung des System-FFmpeg-Pfads wird korrigiert.

## Datenschutz, Assets und Offlinegrenze

Keine persönlichen Texte, keine Cloud, keine Tracker, keine externen Laufzeitfonts und keine privaten Testdaten. Die Galerie greift weder auf FaithPaths Store noch auf LocalStorage/IndexedDB zu. Die Browserprüfung verwendet einen frischen synthetischen Kontext und meldet null persistente Einträge und keine externen Anfragen.

Alle Bilder liegen lokal, neue Illustrationen wurden aus den tatsächlich verwendeten Referenzen generiert; keine neu hinzugekauften Stockbilder. Die lokalen Newsreader-/DM-Sans-Fonts samt OFL-Lizenzen sind enthalten. Das Paket enthält bewusst hochauflösende Quellen und Nachweise. Die 21 verlustfreien Runtime-WebPs einschließlich vollständiger Fallbackbilder umfassen zusammen rund 20,77 MB; die sieben PNG-Quellen 15,76 MB. Es werden nicht alle bewegten Stufen gleichzeitig gestartet. Pro ausgewählter reifer Szene sind obere Platte, untere Platte und vollständiger Fallback zusammen rund 3,6 MB Bildtransfer möglich. **Das ist noch kein optimiertes finales PWA-Cachebudget.** Eine spätere Integration braucht gezielte responsive Assetgrößen und Cacheplanung.

Der entpackte Ordner lässt sich über einen lokalen HTTP-Server ohne Internet betreiben. `START_HIER.html` ist als statische Einstiegsseite vorbereitet. Die direkte HTML-Dateiöffnung wurde in der verwalteten Chromium-Umgebung durch `ERR_BLOCKED_BY_ADMINISTRATOR` blockiert und nicht umgangen; sie bleibt dort ungeprüft. Verifiziert ist der lokale HTTP-Aufruf einschließlich Videos und Bilder bei blockierten externen Anfragen. PDF, PNGs und MP4s liegen zusätzlich separat vor. Die interaktive ES-Modul-/WebGL-Galerie benötigt HTTP; ein direktes `file://index.html` wird nicht als funktionierende Live-Demo versprochen. Kein neuer Service Worker wird installiert. Bestehende PWA-Offlinefähigkeit wird nicht verändert; ein echtes App-Update ist erst im nächsten freigegebenen Schritt prüfbar.

## Bekannte Grenzen und nächste Entscheidung

- Die Auslenkung und reine Laufzeittechnik sind nachgewiesen; die menschliche Sichtprüfung von Ruhe, Eleganz und Wahrnehmbarkeit bleibt Aufgabe der Designabnahme.
- Es gibt drei gemeinsame Blattfelder, keine einzeln modellierten Blätter und keine 3D-Physik.
- Die sieben Altersbilder haben leichte Geometrievarianten. Ein echter wachsender Skelett-Morph würde weitere Illustration und Registrierung benötigen. Die Galerieauswahl selbst ist kein versprochener organischer Wachstumsübergang.
- Sofortiger statischer Fallback bei Grafikverlust; Wiederherstellung per Neuladen. Schwache FPS werden geregelt, aber Akkulast bei flüssiger Darstellung nicht automatisch gemessen.
- Physische Geräte- und App-Integrationsprüfungen fehlen ausdrücklich. Firefox/WebKit wurden für diese Studie nicht ausgeführt.
- Quellbilder und Prüfmedien dürfen nicht pauschal in den späteren App-Cache übernommen werden.

**Empfehlung:** Die neue Reihe und das stärkere Dauerprofil visuell entscheiden. Bei Zustimmung ausschließlich diese zentrale Runtime-/Assetzuordnung gezielt in die bestehende App übernehmen, die bestehenden Stufenregeln als unveränderte Eingabe verwenden und danach App-Offline-, Update-, Daten- und Geräte-Gates durchführen. Kein automatischer Beginn dieser Integration.
