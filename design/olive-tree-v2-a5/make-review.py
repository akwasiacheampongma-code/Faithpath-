"""Readable review artifacts; never repaint or grade screenshots/video frames."""
from pathlib import Path
import json,html,re
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4,landscape
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
R=Path(__file__).resolve().parent
CODE='1e53a1292ba7d1cea135ac56e59e2803b3782ceb'
qa=json.loads((R/'evidence/browser-qa.json').read_text());assert qa['summary']=={'pass':18,'fail':0}
perf=json.loads((R/'evidence/performance.json').read_text());assert len(perf['results'])==2
integrity=json.loads((R/'evidence/integrity.json').read_text());assert integrity['allPriorTrackedFilesUnchanged']
repro=json.loads((R/'evidence/reproducibility.json').read_text());assert repro['reproducible']
geometry=json.loads((R/'evidence/geometry.json').read_text())
shots=sorted(p.name for p in (R/'evidence/screenshots').glob('*.png'))
assert 'pass 245' in (R/'evidence/regression-unit.log').read_text()
assert 'pass 6' in (R/'evidence/motion-unit.log').read_text()
p200,p300=perf['results']
peak=geometry['stages'][6]['maxVectorExcursionCSSPixelsAt200'];old=geometry['referenceA4MaxCSSAt200']
perf_rows='\n'.join('| '+str(p['sizeCss'])+' px | '+f"{p['deliveredFPS']:.2f}"+' | '+f"{p['frameIntervalMs']['p95']:.1f}"+' ms | '+f"{p['jsSubmissionMs']['p95']:.2f}"+' ms | '+str(p['resolution'])+'² | '+str(p['disabled']['framesAdded'])+' |' for p in perf['results'])
report=f'''# FaithPath · Lichtkrone · Sieben Stufen und Dauerbewegung

Prüfstand 01.11.2026 · Isolierte Designabnahmevorlage · `FP-DESIGN-20261101-OLIVE-LIVING-SEVEN`

## Ergebnis und Freigabegrenze

**GO zur Designentscheidung über die neue Reihe und Dauerbewegung. CONDITIONAL GO für die spätere technische Integration; keine Produktionsfreigabe.** Der ausgewachsene A.4-Master ist bytegleich erhalten. Sechs jüngere Motive wurden davon abgeleitet. Der neue Wind läuft ohne Achtsekundenende, solange die Szene sichtbar, aktiv, im Vordergrund und ausreichend flüssig ist und keine reduzierte Bewegung eingestellt wurde.

Die Vorschau ist fertig prüfbar. Die menschliche Beurteilung von Natürlichkeit und wahrnehmbarer Bewegung sowie physische iPhone-/Safari-/VoiceOver-, Wärme- und Akkutests bleiben offen. Nach dieser Lieferung STOP zur ausdrücklichen Freigabe der App-Integration.

## Tatsächlicher Stand

- Repository: `akwasiacheampongma-code/Faithpath-`.
- Ausgangsbranch: `feature/olive-tree-v2-a4-master-recovery`, Basiscommit `c66edb0ff2fdd7a81c96713e5cd25488790f6636`.
- Neuer isolierter Branch: `feature/olive-tree-continuous-seven-stages-20261101`.
- Geprüfter Implementierungsstand: `{CODE}`. Der spätere Liefercommit ergänzt Nachweise und Dokumentation; sein exakter SHA steht in der Lieferdatei des ZIPs.
- Ausschließlich neue Dateien unter `design/olive-tree-v2-a5/`. Alle {integrity['priorTrackedFileCount']:,} zuvor versionierten Dateien sind bytegleich, einschließlich App, A.1–A.4, Content und Datenverträgen.
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
- Der ausgewachsene Baum erreicht in den Modellproben maximal etwa {peak:.2f} CSS-Pixel Auslenkung aus der Ruheposition bei 200 und 300 CSS-Pixeln Darstellungsbreite. A.4 erreicht bei 200 Pixeln etwa {old:.2f} Pixel. Das sind lokale Modellauslenkungen, keine gemessene iPhone-Bildrate und keine hin-und-zurück-Gesamtstrecke.
- Der Keimling verwendet weniger Verstärkung, die jungen Kronen steigern sich zurückhaltend. Der Samen verschiebt sich nicht, sondern erhält nur eine schwache symbolische Lichtveränderung. Die Lichtvariation der Krone liegt ungefähr in der Größenordnung von zwei Prozent, ohne Leuchteffekt.
- Tragholz und Wurzeln bleiben über Nullgewichte und die ruhende Basis geschützt. Feine Zweige und angebundene Oliven bewegen sich gemeinsam in derselben Zeichnung.
- Die Technik bleibt das weiterentwickelte A.4-WebGL-Netz. Der Vergleich verwendet zwei Szenen desselben Renderers mit unterschiedlichen Bewegungsprofilen; keine konkurrierende zweite Engine.

## Laufzeit, Pause und Fehlerfälle

Nur mindestens ein Prozent sichtbare Bildfläche darf laufen. `IntersectionObserver`, `visibilitychange`, `pagehide`, `pageshow`, dynamisches Reduced Motion und Bereichsdeaktivierung steuern denselben Lebenszyklus. Ein aktiver Frame prüft die Medienpräferenz und Hintergrundlage zusätzlich vor dem Zeichnen. Unsichtbarkeit, Hintergrund, Pausieren oder Abbau brechen RAF ab. Während der Pause läuft kein Render-Timer weiter. Die Diagnosehistorie ist auf 180 Fenster begrenzt; ein synthetischer Test mit 60.000 Bildern sichert dauerhaft begrenzten Speicher ab. 850 ms mischen bei Rückkehr weich vom letzten Zustand in den Wind.

Ein Generationszähler verhindert, dass ein langsames altes Bild eine neuere Stufenauswahl überschreibt. `dispose()` entfernt Listener/Observer und gibt Grafikressourcen frei. Fehlendes WebGL, eine fehlende obere Bildplatte oder tatsächlicher Grafikverlust zeigen das vollständige ruhende Bild. Nach Grafikverlust wird neu geladen; „Qualität neu prüfen“ ist für den FPS-Regler gedacht und stellt keinen verlorenen Grafik-Kontext wieder her.

Im unabhängigen Review wurden zwei echte Randfälle gefunden, vor der Korrektur reproduziert und danach gezielt grün geprüft: Grafikverlust während des noch laufenden `base.decode()` versteckte den Fallback wieder; Neustart des bereits laufenden A.4-Vergleichs behielt seine alte Uhr. Beide sind behoben. Die Review-Nachprüfung meldet keine weiteren materiellen Befunde.

## Tatsächlich gemessene Performance

Linux, Chromium {qa['browser']}, ANGLE/SwiftShader-Softwaredarstellung, 390 × 844 CSS-Pixel, DPR 2. Je 30 Sekunden allein gemessen, nach Einlaufphase, ohne parallele Videoaufnahme. Die tatsächlichen Bildraten sind bewusst auf höchstens 30 begrenzt.

| Baumgröße | Renderframes/s | Frameabstand p95 | JS-Aufrufzeit p95 | Framebuffer | Frames deaktiviert |
|---|---:|---:|---:|---:|---:|
{perf_rows}

Die Bildrate zählt tatsächlich an WebGL übermittelte Renderframes pro Messfenster. Hardwareseitige Präsentationsrate, Scan-out und GPU-Frametime wurden nicht gemessen. Die WebGL-Aufrufzeit misst nur die JavaScript-Übermittlung, nicht die asynchrone GPU-Fertigstellung. Der konservative Kronen-Scissor aktualisiert etwa 70,5 % des Framebuffers. Daraus wird keine pauschale Gesamtersparnis von 30 % abgeleitet.

Die Messdatei enthält echte Chromium-Prozess-CPU-Zeitdifferenzen sowie Main-Thread-Taskdauer, Scriptdauer und JS-Heap. Bei 200 Pixeln beanspruchte der Software-GPU-Prozess {next(x['cpuSeconds'] for x in p200['processCPU'] if x['type']=='GPU'):.2f} CPU-Sekunden in rund 30 Sekunden, bei 300 Pixeln {next(x['cpuSeconds'] for x in p300['processCPU'] if x['type']=='GPU'):.2f}. Das ist eine erhebliche Software-Renderlast, **kein Beleg für niedrigen Akkuverbrauch auf einem iPhone**. Die Taskdauer ist keine separate Betriebssystem-CPU-Messung und darf nicht dazu addiert werden. Im jeweiligen viersekündigen deaktivierten Fenster wurden null Bilder und kein ausstehender RAF beobachtet.

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

{len(shots)} echte neue Browser-PNGs und zwei echte Browser-Videos werden geliefert. Die Video-Kodierung mit 25 fps ist kein Geräte-FPS-Nachweis. Die Originale wurden nicht nachkoloriert oder zeichnerisch retuschiert; lediglich die falsche Full-/Limited-Range-Metadatenkennzeichnung des System-FFmpeg-Pfads wird korrigiert.

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
'''
(R/'BERICHT.md').write_text(report)
CSS='body{background:var(--v-canvas);color:var(--v-ink);font:17px/1.65 var(--v-sans);max-width:1100px;margin:auto;padding:28px}h1,h2{font-family:var(--v-display);line-height:1.15}h1{font-size:2.5rem}h2{font-size:1.8rem;margin-top:36px}a{color:inherit}nav{display:flex;flex-wrap:wrap;gap:18px}code{font-size:.85em;overflow-wrap:anywhere}.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,270px),1fr));gap:20px}figure{margin:0}img{max-width:100%;max-height:850px;object-fit:contain}figcaption{font-size:.8rem;overflow-wrap:anywhere}table{border-collapse:collapse;font-size:.8rem}td,th{padding:10px;border-bottom:1px solid var(--v-line);text-align:left;vertical-align:top}.table{overflow:auto}video{width:100%;max-width:800px}p,li{hyphens:auto}pre{white-space:pre-wrap;overflow-wrap:anywhere}'
def inline(text):
 text=html.escape(text);text=re.sub(r'`([^`]+)`',r'<code>\1</code>',text);return re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',text)
def md(text):
 out=[]
 for block in text.split('\n\n'):
  if not block.strip():continue
  if block.startswith('#'):
   n=len(block)-len(block.lstrip('#'));out.append(f'<h{n}>'+inline(block[n:].strip())+f'</h{n}>')
  elif block.startswith('- '):out.append('<ul>'+''.join('<li>'+inline(row[2:])+'</li>'for row in block.splitlines()if row.startswith('- '))+'</ul>')
  elif block.startswith('|'):
   rows=[]
   for n,row in enumerate(block.splitlines()):
    if re.fullmatch(r'[| :\-]+',row):continue
    tag='th'if n==0 else'td';rows.append('<tr>'+''.join(f'<{tag}>'+inline(cell.strip())+f'</{tag}>'for cell in row.strip('|').split('|'))+'</tr>')
   out.append('<div class="table"><table>'+''.join(rows)+'</table></div>')
  else:out.append('<p>'+inline(block.replace('\n',' '))+'</p>')
 return'\n'.join(out)
def doc(title,body):return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(title)+'</title><link rel="stylesheet" href="tokens.css"><style>'+CSS+'</style></head><body><nav><a href="START_HIER.html">Start</a><a href="index.html">Interaktive Galerie (HTTP)</a><a href="DESIGNABNAHME.pdf">PDF</a><a href="PRUEFUNG.html">Alle Nachweise</a></nav><main>'+body+'</main></body></html>'
for stem in ['BERICHT','ARCHITEKTUR','IPHONE_PRUEFLISTE']:(R/(stem+'.html')).write_text(doc(stem,md((R/(stem+'.md')).read_text())))
start='<p>FaithPath · Lichtkrone · Freigabevorschau</p><h1>Eine lebendige Baumfamilie.</h1><p>Der freigegebene A.4-Master bleibt erhalten. Sechs abgeleitete Motive und stärkerer Dauerwind liegen zur Designentscheidung vor. Keine App-Integration und kein Deployment.</p><h2>Neue Bewegung gegen bisherige Animation</h2><video controls playsinline preload="metadata" poster="evidence/screenshots/VERGLEICH_BEWEGUNG-poster.png"><source src="evidence/VERGLEICH_BEWEGUNG.mp4" type="video/mp4"></video><p>Links: A.4 endet nach acht Sekunden. Rechts: Wind läuft während der tatsächlichen Aufnahme weiter. Echte Browseraufnahme; keine Geräteabnahme.</p><h2>Alle sieben Stufen</h2><a href="evidence/screenshots/SIEBEN_STUFEN_200.png"><img src="evidence/screenshots/SIEBEN_STUFEN_200.png" alt="Alle sieben Baumstufen mit jeweils200 CSS-Pixeln"></a><p><a href="evidence/screenshots/LETZTE_DREI_200.png">Stufen 5, 6 und 7 bei 200 CSS-Pixeln vergleichen</a></p><h2>Mobile Aufnahme</h2><video controls playsinline preload="metadata" style="max-width:390px" poster="evidence/screenshots/MOBIL_LEBENDIG-poster.png"><source src="evidence/MOBIL_LEBENDIG.mp4" type="video/mp4"></video><h2>Selbst ausprobieren</h2><p>Diese statische Startseite ist für Dateiöffnung vorbereitet; die verwaltete Testumgebung blockiert file:// allerdings per Browserrichtlinie. Verifiziert ist der folgende lokale HTTP-Aufruf. PDF, Bilder und MP4s liegen zusätzlich separat vor. Für die interaktive WebGL-Galerie bitte im Ordner einen lokalen Server starten:</p><pre>python3 -m http.server 4735 --bind 127.0.0.1</pre><p>Danach <a href="http://127.0.0.1:4735/">http://127.0.0.1:4735/</a> öffnen. Keine Internetverbindung notwendig. Die Sicherheitsregeln des Browsers für file:// nicht abschalten.</p><p><a href="BERICHT.html">Vollständiger Bericht</a> · <a href="IPHONE_PRUEFLISTE.html">Offenes iPhone-Gate</a></p>'
(R/'START_HIER.html').write_text(doc('FaithPath Lichtkrone · Hier starten',start))
body=f'<h1>Ausgeführte Prüfungen und echte Bilder.</h1><p>{qa["summary"]["pass"]} Browser-Prüfgruppen bestanden. {len(shots)} neue Browser-PNGs. Technische Ergebnisse sind kein Ersatz für die menschliche Designentscheidung oder ein echtes iPhone.</p><p><a href="evidence/browser-qa.json">Browser-JSON</a> · <a href="evidence/performance.json">Messwerte</a> · <a href="evidence/integrity.json">Integrität</a> · <a href="evidence/reproducibility.json">Reproduzierbarkeit</a> · <a href="evidence/geometry.json">Geometrie</a> · <a href="evidence/review.json">Review</a> · <a href="evidence/axe.json">Axe</a></p><div class="shots">'
for name in shots:body+=f'<figure><a href="evidence/screenshots/{name}"><img loading="lazy" src="evidence/screenshots/{name}" alt="{html.escape(Path(name).stem)}"></a><figcaption>{html.escape(name)}</figcaption></figure>'
(R/'PRUEFUNG.html').write_text(doc('FaithPath Lichtkrone · Prüfungen',body+'</div>'))
pdfmetrics.registerFont(TTFont('DM',str(R/'assets/fonts/DMSans.ttf')));pdfmetrics.registerFont(TTFont('Newsreader',str(R/'assets/fonts/Newsreader.ttf')))
W,H=landscape(A4);pdf=canvas.Canvas(str(R/'DESIGNABNAHME.pdf'),pagesize=(W,H),invariant=1);pdf.setTitle('FaithPath Lichtkrone · Sieben lebendige Stufen');pdf.setAuthor('FaithPath Designstudie')
style=ParagraphStyle('copy',fontName='DM',fontSize=11,leading=17,textColor=HexColor('#20382f'))
def page(title,subtitle=''):
 pdf.setFillColor(HexColor('#f7f7f2'));pdf.rect(0,0,W,H,fill=1,stroke=0);pdf.setFillColor(HexColor('#20382f'));pdf.setFont('Newsreader',28);pdf.drawString(30,H-42,title);pdf.setFont('DM',8);pdf.setFillColor(HexColor('#56635a'));pdf.drawString(32,H-63,subtitle);pdf.drawString(32,17,'FaithPath · Lichtkrone · Designentscheidung vor App-Integration');pdf.drawRightString(W-32,17,str(pdf.getPageNumber()))
def picture(file,x,y,w,h,folder='evidence/screenshots'):
 im=ImageReader(str(R/folder/file));iw,ih=im.getSize();scale=min(w/iw,h/ih);pdf.drawImage(im,x+(w-iw*scale)/2,y+(h-ih*scale)/2,width=iw*scale,height=ih*scale,mask='auto')
def para(text,x,y,w):
 p=Paragraph(text,style);_,height=p.wrap(w,600);p.drawOn(pdf,x,y-height);return y-height-15
page('Lichtkrone. Jetzt mit ruhigem Dauerwind.','A.4-Master bytegleich bewahrt · sechs abgeleitete Altersbilder · neue Bewegung zur Freigabe')
picture('stage-7.png',20,45,475,470,'assets/masters');y=H-120
for text in ['<b>Die freigegebene Zeichnung bleibt.</b> Kein neuer ausgewachsener Baum, keine Collage aus Laubbüscheln.','<b>Die Bewegung wird sichtbar.</b> Unterschiedliche Windphasen bewegen nur die Blattfelder. Stamm und Wurzeln bleiben ruhig.','<b>Etwa 2,4 CSS-Pixel statt 0,5</b> in den Modellproben bei 200 Pixeln. Der neue Wind endet nicht nach acht Sekunden.','<b>STOP zur Entscheidung.</b> Keine App-Integration, kein Merge und kein Deployment. Physisches iPhone und Akku sind noch offen.']:y=para(text,520,y,W-550)
pdf.showPage()
page('Sieben Bilder derselben persönlichen Geschichte.','Echte Browseransicht · jedes Motiv wurde hier mit 200 CSS-Pixeln gerendert')
picture('SIEBEN_STUFEN_200.png',20,210,W-40,240);y=195
for text in ['Samen und Keimling sind Nahansichten. Ab dem jungen Baum verbinden die S-förmige Stammbewegung, die hohe linke Gabel und der tiefe rechte Astbogen die Familie.','Unverändert: 0, 1, 2, 3–4, 5–6, 7–9, ab 10 ausdrücklich bestätigte Entwicklungen. Animation, Bibellesen und Quiz erhöhen keine Stufe.','Die Reihe ist illustrierte Entwicklung, kein pixelidentisches 3D-Altersmodell. Kleine geometrische Unterschiede und schon relativ alte Rindenmotive bei jungen Bäumen bleiben sichtbar.']:y=para(text,32,y,W-64)
pdf.showPage()
page('Wenige erste Früchte. Dann eine reichere Krone.','Stufen 5, 6 und 7 · gleiche tatsächliche Darstellung mit 200 CSS-Pixeln')
picture('LETZTE_DREI_200.png',20,180,W-40,320);y=165
for text in ['Stufe 5 trägt keine Früchte, Stufe 6 wenige angebundene Fruchtgruppen. Stufe 7 bleibt der freigegebene fruchttragende Master. Die Namen stehen immer dabei.','Kritisch: Die letzten drei Kronen sind ähnlich dicht. Auf kleinen Displays bleibt die Fruchtzeichnung entscheidend. Die menschliche Unterscheidbarkeitsprüfung ist noch nicht erledigt.']:y=para(text,32,y,W-64)
pdf.showPage()
page('Ein zusammenhängendes Bild, drei Blattfelder.','Zweidimensionale WebGL-Verformung aus der A.4-Technik · keine einzeln modellierten Blätter')
for i,(file,label)in enumerate([('ruhe.png','Ruhe'),('wind-3s.png','3 Sekunden'),('wind-maximum.png','Starke Prüfposition'),('wind-22s.png','22 Sekunden')]):
 x=28+i*198;picture(file,x,205,186,260);pdf.setFillColor(HexColor('#20382f'));pdf.setFont('DM',9);pdf.drawString(x,190,label)
y=165
for text in ['Die Posen stammen aus dem tatsächlichen Renderer. Den Zeitverlauf zeigen die separaten MP4-Browseraufnahmen. Links im Vergleich endet A.4 nach acht Sekunden, rechts läuft der neue Wind weiter.','Statisches Tragholz, gemeinsame Textur für angebundene Früchte, keine Bildinseln aus neu montierten Büscheln. Geprüfte Netzproben falten sich nicht; Teil- und Voll-Neuzeichnen liefern identische Pixel.']:y=para(text,32,y,W-64)
pdf.showPage()
page('Heute. Großes Motiv und erreichbarer Bibelzugang.','Echte synthetische Gestaltungsvorschau · noch keine geänderte FaithPath-App')
for i,(file,label)in enumerate([('today-320-light.png','Hell · 320'),('today-390-paper.png','Papier · 390'),('today-390-atmospheric.png','Atmosphärisch · 390'),('today-390-night.png','Nacht · 390')]):
 x=25+i*200;picture(file,x,55,188,440);pdf.setFillColor(HexColor('#20382f'));pdf.setFont('DM',8);pdf.drawString(x,37,label)
pdf.showPage()
page('Mein Weg, Baumdetail und erster Anfang.','Synthetische Beispiele · keine gespeicherten persönlichen Daten und keine neue Wachstumsregel')
for i,(file,label)in enumerate([('context-journey.png','Mein Weg'),('context-detail.png','Baumdetail'),('context-seed.png','Erster persönlicher Weg')]):
 x=28+i*265;picture(file,x,65,244,430);pdf.setFillColor(HexColor('#20382f'));pdf.setFont('DM',9);pdf.drawString(x,42,label)
pdf.showPage()
page('Große Schrift darf Platz beanspruchen.','200 % Text · nichts wird durch winzige Schrift oder abgeschnittene Wörter passend gemacht')
picture('large-320-night.png',25,50,240,440);picture('large-390-night.png',280,50,260,440);y=H-110
for text in ['Bei großer Schrift wächst die Seite vertikal. Der Bibelzugang bleibt vor dem Motiv, Bedeutungen sind aufklappbar.','112 Stufen-/Theme-/Viewportfälle sowie 24 zusätzliche komplette Galerieansichten mit 200 % Text geprüft.','Native Auswahlfelder, Karten und Navigation dürfen neu umbrechen. Das ersetzt keine physische Safari-/VoiceOver-Prüfung.']:y=para(text,570,y,235)
pdf.showPage()
page('Sichtbar laufen. Unsichtbar wirklich pausieren.','Messung nur bei aktiver Sichtbarkeit · weiche Rückkehr · kein Hintergrund-Render-Timer')
y=H-100
for text in ['<b>Lebenszyklus:</b> IntersectionObserver, Vordergrundstatus, aktivierter Bereich und Medienpräferenz steuern einen RAF. Pause beendet ihn. Rückkehr blendet vom letzten Zustand in 850 ms weich in den Wind.','<b>Reduced Motion:</b> dynamisch ruhende Zeichnung; keine erzwungene Animation. Kontextverlust oder fehlende Platte zeigen den vollständigen statischen Fallback.','<b>Qualitätsregler:</b> 30 / 24 / 18 Bilder/s und kleinerer Framebuffer. Die CSS-Auslenkung bleibt gleich. Wiederholt schlechte niedrigste Qualität wird statisch; der Nutzer kann neu prüfen.','<b>Review:</b> Verlust während base.decode und Neustart der laufenden A.4-Uhr wurden vor der Korrektur reproduziert und danach grün getestet. Keine weiteren materiellen Reviewbefunde.','<b>Grenzen:</b> Die Hintergrundhandler wurden mit synthetischen Ereignissen getestet. Echtes iOS-Backgrounding, VoiceOver, Wärme und Akku sind offen.']:y=para(text,32,y,W-64)
pdf.showPage()
page('Messwerte mit klarer Geräte-Grenze.','Chromium / SwiftShader-Software · 390 × 844 / DPR 2 · je 30 Sekunden · keine parallele Aufnahme')
y=H-100
for text in [f'<b>200-Pixel-Baum:</b> {p200["deliveredFPS"]:.2f} übermittelte Renderframes/s, Frameabstand p95 {p200["frameIntervalMs"]["p95"]:.1f} ms, Framebuffer {p200["resolution"]}².',f'<b>300-Pixel-Baum:</b> {p300["deliveredFPS"]:.2f} übermittelte Renderframes/s, Frameabstand p95 {p300["frameIntervalMs"]["p95"]:.1f} ms, Framebuffer {p300["resolution"]}².','<b>Deaktiviert:</b> null weitere Bilder und kein ausstehender RAF in beiden viersekündigen Fenstern. Etwa 70,5 % des Framebuffers werden konservativ neu gezeichnet.','<b>Keine Akkubehauptung:</b> Software-GPU-Prozesszeit und Main-Thread-Dauer sind im JSON enthalten. Die sichtbare Software-Renderlast ist erheblich; sie beweist keine sparsame iPhone-Hardwaredarstellung.','<b>Assets:</b> alle Runtimevarianten samt Fallbacks 20,77 MB; Quellen zusätzlich 15,76 MB. Das Designpaket ist kein optimierter Produktcache. Responsive Größen und Cachebudget gehören zur späteren Integration.']:y=para(text,32,y,W-64)
pdf.showPage()
page('Prüfbar geliefert. Integration bleibt gesperrt.','Die menschliche Designentscheidung folgt auf diese Studie, nicht auf eine automatische Veröffentlichung.')
y=H-100
for text in [f'<b>Ausgeführt:</b> 245 bestehende App-Tests, sechs neue Modelltests, 18 Browsergruppen. Zwölf Axe-Scans ohne gemeldete A/AA-Verstöße. {len(shots)} echte Browser-PNGs und zwei echte Browser-Videos.',f'<b>Geschützt:</b> {integrity["priorTrackedFileCount"]} vorher versionierte Dateien bytegleich. Freigegebener Master-SHA, sieben Bedeutungen, Schema V5, Wachstumsschwellen und Datenformate unverändert.','<b>Reproduzierbar:</b> zweiter Runtimeexport, 23 Dateien per SHA-256 identisch. Generative Illustration selbst wird nicht als deterministisch behauptet.','<b>Noch offen:</b> menschliche Reihe-/Bewegungsabnahme, physisches iPhone/Safari/VoiceOver, Wärme/Akku und spätere App-PWA-Updateprüfung.',f'<b>Code:</b> {CODE}. Vollständiger Liefercommit im ZIP. Branch: feature/olive-tree-continuous-seven-stages-20261101.','<b>Empfehlung:</b> GO zur Designentscheidung; CONDITIONAL GO zur späteren Integration nach ausdrücklicher Freigabe. Keine Produktionsfreigabe, kein automatischer Start.']:y=para(text,32,y,W-64)
pdf.showPage();pdf.save()
print(json.dumps({'screenshots':len(shots),'pdfPages':10,'browserGroupsPassed':qa['summary']['pass'],'codeCommit':CODE}))
