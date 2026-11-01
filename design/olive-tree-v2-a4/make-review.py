"""Review layout only. Screenshots and actual render poses are never retouched."""
from pathlib import Path
import html,re,json
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4,landscape
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
R=Path(__file__).resolve().parent
qa=json.loads((R/'evidence/browser-qa.json').read_text());assert qa['summary']['fail']==0
structure=json.loads((R/'evidence/structure.json').read_text());assert structure['maxRestPremultipliedError']==0 and structure['maxRestAlphaError']==0
CSS='body{background:var(--v-canvas);color:var(--v-ink);font:17px/1.65 var(--v-sans);max-width:1100px;margin:auto;padding:28px}h1,h2{font-family:var(--v-display);line-height:1.15}h1{font-size:2.5rem}h2{font-size:1.8rem;margin-top:40px}a{color:inherit}nav{display:flex;gap:20px;flex-wrap:wrap}code{font-size:.85em;overflow-wrap:anywhere}.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:24px}figure{margin:0}img{width:100%;max-height:720px;object-fit:contain}figcaption{font-size:.8rem;overflow-wrap:anywhere}p,li{overflow-wrap:break-word}table{border-collapse:collapse;font-size:.8rem}td,th{border-bottom:1px solid var(--v-line);padding:12px;text-align:left;vertical-align:top}.table{overflow:auto}video{max-width:100%;width:500px}'
def inline(t):
 t=html.escape(t);t=re.sub(r'`([^`]+)`',r'<code>\1</code>',t);return re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',t)
def md(text):
 out=[]
 for p in text.split('\n\n'):
  if not p.strip():continue
  if p.startswith('#'):
   n=len(p)-len(p.lstrip('#'));out.append(f'<h{n}>'+inline(p[n:].strip())+f'</h{n}>')
  elif p.startswith('- '):out.append('<ul>'+''.join('<li>'+inline(x[2:])+'</li>'for x in p.splitlines()if x.startswith('- '))+'</ul>')
  elif p.startswith('|'):
   rows=[]
   for i,row in enumerate(p.splitlines()):
    if re.fullmatch(r'[| :\-]+',row):continue
    tag='th'if i==0 else'td';rows.append('<tr>'+''.join(f'<{tag}>'+inline(c.strip())+f'</{tag}>'for c in row.strip('|').split('|'))+'</tr>')
   out.append('<div class="table"><table>'+''.join(rows)+'</table></div>')
  else:out.append('<p>'+inline(p.replace('\n',' '))+'</p>')
 return'\n'.join(out)
def doc(title,body):return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(title)+'</title><link rel="stylesheet" href="tokens.css"><style>'+CSS+'</style></head><body><nav><a href="index.html">Galerie</a><a href="demo.html">Bewegungsdemo</a><a href="DESIGNENTSCHEIDUNG.pdf">PDF</a><a href="PRUEFUNG.html">Nachweise</a></nav><main>'+body+'</main></body></html>'
for stem in['BERICHT','EBENEN_UND_ANIMATION','IPHONE_PRUEFLISTE']:(R/(stem+'.html')).write_text(doc(stem,md((R/(stem+'.md')).read_text())))
shots=sorted(f.name for f in(R/'evidence/screenshots').glob('*.png'))
body=f'<h1>Prüfbare Bilder und Ergebnisse.</h1><p>{qa["summary"]["pass"]} technische Browser-Prüfgruppen bestanden, keine fehlgeschlagen. Diese Ergebnisse belegen Verhalten und Darstellung im ausgeführten Umfang, keine künstlerische Freigabe.</p><p>Chromium mit SwiftShader, synthetische Inhalte. Echte iPhone-/Safari-/VoiceOver-Prüfungen sind offen.</p><video controls preload="none" poster="evidence/screenshots/motion-poster.png"><source src="evidence/MOTION_BROWSER.mp4" type="video/mp4"></video><p>Die Aufnahme ist ein echter Browsermitschnitt mit protokolliertem Ablauf und Endzustand, kein Smartphone-FPS-Benchmark.</p><p><a href="evidence/browser-qa.json">Browserdaten</a> · <a href="evidence/structure.json">Raster- und Strukturnachweis</a> · <a href="evidence/independent-review.md">Unabhängige KI-Prüfung und Grenzen</a></p><div class="shots">'
for name in shots:body+=f'<figure><a href="evidence/screenshots/{name}"><img loading="lazy" src="evidence/screenshots/{name}" alt="{html.escape(Path(name).stem)}"></a><figcaption>{html.escape(name)}</figcaption></figure>'
body+='</div><h2>Native tatsächliche Browser-Prüfpositionen.</h2><p>Deterministisch angewählte Kontrollpositionen aus dem echten Renderer. Die laufende Bewegung zeigt das separate Video.</p><div class="shots">'
for name in['rest','middle','maximum','end']:body+=f'<figure><a href="evidence/poses/{name}.png"><img loading="lazy" src="evidence/poses/{name}.png" alt="Native Prüfposition {name}"></a><figcaption>{name} · 1254 × 1254 RGBA</figcaption></figure>'
(R/'PRUEFUNG.html').write_text(doc('FaithPath A.4 · Prüfbelege',body+'</div>'))
pdfmetrics.registerFont(TTFont('DM',str(R/'assets/fonts/DMSans.ttf')));pdfmetrics.registerFont(TTFont('Newsreader',str(R/'assets/fonts/Newsreader.ttf')))
W,H=landscape(A4);pdf=canvas.Canvas(str(R/'DESIGNENTSCHEIDUNG.pdf'),pagesize=(W,H),invariant=1);pdf.setTitle('FaithPath Lichtkrone A.4 · Masterstufe 7 zur Designentscheidung');pdf.setAuthor('FaithPath Designstudie')
style=ParagraphStyle('copy',fontName='DM',fontSize=11,leading=17,textColor=HexColor('#20382f'))
def page(title,sub=''):
 pdf.setFillColor(HexColor('#f7f7f2'));pdf.rect(0,0,W,H,fill=1,stroke=0);pdf.setFillColor(HexColor('#20382f'));pdf.setFont('Newsreader',28);pdf.drawString(30,H-42,title);pdf.setFont('DM',8);pdf.setFillColor(HexColor('#56635a'));pdf.drawString(32,H-63,sub);pdf.drawString(32,17,'FaithPath · A.4 · nur Masterstufe 7 · ausdrückliche Designfreigabe steht aus');pdf.drawRightString(W-32,17,str(pdf.getPageNumber()))
def picture(file,x,y,w,h,folder='evidence/screenshots'):
 im=ImageReader(str(R/folder/file));iw,ih=im.getSize();s=min(w/iw,h/ih);pdf.drawImage(im,x+(w-iw*s)/2,y+(h-ih*s)/2,width=iw*s,height=ih*s,mask='auto')
def para(t,x,y,w):
 p=Paragraph(t,style);_,h=p.wrap(w,600);p.drawOn(pdf,x,y-h);return y-h-16
page('Wieder eine zusammenhängende Lichtkrone.','A.4 · ein gemeinsam retuschierter ausgewachsener Baum · keine neue Siebenerreihe')
picture('lichtkrone-a4.png',20,40,490,470,'assets/masters');y=H-120
for t in['<b>Empfehlung:</b> bereit für die Designentscheidung über Stufe 7. Die dichte A.2-Gesamtform und die individuelle Stammbewegung sind wiederhergestellt.','<b>Technik folgt dem Bild.</b> Eine kontinuierliche Kronenzeichnung ersetzt die getrennten A.3-Büschel. Kleine lokale Blattbewegungen erhalten das Tragholz.','<b>Noch offen:</b> Die verbindliche Freigabe des Auftraggebers. Einige ähnliche Blattfächer, polierte Holzpartien und kleine Astnarben bleiben sichtbar.','<b>Geschützt:</b> Die echte App und alle bisherigen Designstände bleiben unverändert. Keine übrigen Stufen, kein Phase-B-Start.']:y=para(t,535,y,W-565)
pdf.showPage()
page('A.2 / A.3 / A.4 · gleicher Maßstab.','Echte Originaldateien; vollständige Canvas, gleiche Skalierung und derselbe Hintergrund.')
picture('comparison.png',16,55,W-32,H-135);pdf.showPage()
page('Natürlich verbundene Hauptäste.','Linker Astansatz und rechter gebogener Hauptast: dieselben echten Ausschnitte der drei Dateien.')
picture('detail-2.png',20,280,W-40,220);picture('detail-3.png',20,40,W-40,220);pdf.showPage()
page('Zusammenhängendes Laub und echte Fruchtzweige.','Die Krone bleibt eine gemeinsame Zeichnung. Blattfächer und gedrängte Fruchtgruppen sind als Restpunkte sichtbar.')
picture('detail-4.png',20,280,W-40,220);picture('detail-5.png',20,40,W-40,220);pdf.showPage()
page('Zwei transparente Bildplatten.','K enthält bewusst auch oberes Holz. Nullgewichte schützen das Tragholz; keine künstlich getrennten Büschel.')
picture('layers.png',20,60,W-40,H-145);pdf.showPage()
page('Ruhe, Mitte, Maximum und Ende.','Tatsächliche Browser-Kontrollpositionen. Die laufende Bewegung ist im separaten MP4 und in demo.html prüfbar.')
picture('motion-phases.png',20,185,W-40,H-265);y=175
for t in['Ein manueller achtsekündiger Durchlauf. Maximal etwa 3,12 Quellpixel lokale Auslenkung, bei 200 CSS-px etwa ein halber CSS-Pixel.','Stamm-/Wurzel-Prüfflächen und Schnittlinie unverändert. Kein neues Loch in 434.148 zuvor deckenden Innenpixeln mit Randreserve, vier Posen geprüft.','Reduced Motion bleibt statisch. Fehlendes WebGL oder Kontextverlust zeigt den vollständigen ruhenden Master. Keine behauptete Einzelblatt-Artikulation.']:y=para(t,32,y,W-64)
pdf.showPage()
page('Heute · vier Themes, ein persönliches Hauptmotiv.','Echte Chromium-Vorschauen mit synthetischen Texten. Keine Änderung der echten FaithPath-App.')
for i,(f,t)in enumerate([('mobile-320-light-today.png','Hell · 320 × 568'),('mobile-390-paper-today.png','Papier · 390 × 844'),('mobile-390-atmospheric-today.png','Atmosphärisch · 390 × 844'),('mobile-390-night-today.png','Nacht · 390 × 844')]):
 x=25+i*200;picture(f,x,65,188,420);pdf.setFont('DM',8);pdf.setFillColor(HexColor('#20382f'));pdf.drawString(x,45,t)
pdf.showPage()
page('Kritische Entscheidung, keine Qualitätsnoten.','Künstlerische Bewertung und technische Belege bleiben getrennt.')
y=H-100
for t in['<b>Wiedergewonnen:</b> Die dichte Krone liest sich als ein Baum. Hoher linker Leitast, rechter Ellenbogen, Höhlung und verwundene Wurzeln erhalten die Lichtkrone-Identität.','<b>Mindestens auf A.2-Niveau im Gesamtbild.</b> Die unabhängige KI-Sichtprüfung bestätigt die zurückgewonnene Kohärenz. Das ist keine menschliche Design- oder Nutzerfreigabe.','<b>Restpunkte:</b> Ähnliche Blattfächer, einige gedrängte Olivengruppen und kleine Astnarben. Die A.4-Rinde ist schärfer und polierter als A.2. Diese Details sind nicht pauschal verbessert.','<b>Gezielte weitere Retusche:</b> rechte und innere Blattstellungen variieren, gedrängte Früchte vereinzeln und kleine Astnarben mit den umgebenden Rindenkanten abgleichen.','<b>Grenze:</b> 1254-px-Raster, kein beliebig skalierbarer Druck-/Vektormaster. Größere Bewegungen oder Einzelblattanimation bräuchten eine eigene zeichnerische Vorbereitung.']:y=para(t,32,y,W-64)
pdf.showPage()
page('Nachweise und offene Prüfungen.','Prüfstand 01.11.2026 · alle Details und maschinenlesbaren Ergebnisse liegen bei.')
y=H-100
for t in[f'<b>Ausgeführt:</b> {qa["summary"]["pass"]} Browser-Prüfgruppen ohne Fehler; 24 mobile Layoutfälle, 16 Fälle mit 200 % Text und acht zusätzliche Galerie-Fälle mit großer Schrift. Zwölf Axe-Prüfungen ohne gemeldete A/AA-Verstöße.','<b>Technik:</b> drei Modelltests bestanden. Ruhe-RGBA im geprüften Renderer exakt; neun Holz-/Wurzelflächen und Plattenschnittlinie pixelgleich. Kein Renderframe im gemessenen 600-ms-Leerlauf.','<b>Schutz:</b> 245 bestehende App-Tests in der Baseline bestanden. Alle 4.514 vorher versionierten Dateien bytegleich, einschließlich A.2/A.3, App, Daten, Wachstumsschwellen und Backups.','<b>Offen:</b> echte iPhone-, Safari-, VoiceOver-, Touch- und Geräte-Performance-Prüfung. SwiftShader-Video und CSS-Textvergrößerung sind dafür kein Ersatz.','<b>STOP:</b> Nur Masterstufe 7 ist vorbereitet. Keine übrigen sechs Stufen, keine App-Integration, kein Produktbuild, kein Merge und kein Deployment. Es wird auf die ausdrückliche Designentscheidung gewartet.']:y=para(t,32,y,W-64)
pdf.showPage();pdf.save();print(json.dumps({'browserScreenshots':len(shots),'nativePoses':4,'pdfPages':9,'recommendation':'ready for user master decision; no integration approval'}))
