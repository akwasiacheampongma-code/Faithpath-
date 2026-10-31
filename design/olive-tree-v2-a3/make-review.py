"""Review layout only: uses actual browser screenshots without retouching artwork."""
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
CSS='body{background:var(--v-canvas);color:var(--v-ink);font:17px/1.65 var(--v-sans);max-width:1050px;margin:auto;padding:28px}h1,h2{font-family:var(--v-display);line-height:1.15}h1{font-size:2.5rem}h2{font-size:1.8rem;margin-top:40px}a{color:inherit}nav{display:flex;gap:20px;flex-wrap:wrap}code{font-size:.85em;overflow-wrap:anywhere}.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:24px}figure{margin:0}img{width:100%;max-height:650px;object-fit:contain}figcaption{font-size:.8rem;overflow-wrap:anywhere}p,li{overflow-wrap:break-word}table{border-collapse:collapse;font-size:.8rem}td,th{border-bottom:1px solid var(--v-line);padding:12px;text-align:left;vertical-align:top}.table{overflow:auto}video{max-width:100%;width:500px}'
def inline(t):
 t=html.escape(t);t=re.sub(r'`([^`]+)`',r'<code>\1</code>',t);return re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',t)
def md(t):
 out=[]
 for p in t.split('\n\n'):
  if not p.strip():continue
  if p.startswith('#'):
   n=len(p)-len(p.lstrip('#'));out.append(f'<h{n}>'+inline(p[n:].strip())+f'</h{n}>')
  elif p.startswith('- '):out.append('<ul>'+''.join('<li>'+inline(x[2:])+'</li>'for x in p.splitlines()if x.startswith('- '))+'</ul>')
  elif p.startswith('|'):
   rows=[]
   for i,r in enumerate(p.splitlines()):
    if re.fullmatch(r'[| :\-]+',r):continue
    tag='th'if i==0 else'td';rows.append('<tr>'+''.join(f'<{tag}>'+inline(c.strip())+f'</{tag}>'for c in r.strip('|').split('|'))+'</tr>')
   out.append('<div class="table"><table>'+''.join(rows)+'</table></div>')
  else:out.append('<p>'+inline(p.replace('\n',' '))+'</p>')
 return'\n'.join(out)
def doc(title,body):return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(title)+'</title><link rel="stylesheet" href="tokens.css"><style>'+CSS+'</style></head><body><nav><a href="index.html">Galerie</a><a href="DESIGNENTSCHEIDUNG.pdf">PDF</a><a href="SCREENSHOTS.html">Screenshots</a><a href="demo.html">Bewegungsdemo</a></nav><main>'+body+'</main></body></html>'
for stem in['BERICHT','LAYER_CONTRACT']:(R/(stem+'.html')).write_text(doc(stem,md((R/(stem+'.md')).read_text())))
qa=json.loads((R/'evidence/qa.json').read_text());shots=sorted(x.name for x in (R/'evidence/screenshots').glob('*.png'))
body='<h1>Echte Browsernachweise.</h1><p>Chromium, synthetische Inhalte, lokale Studie. Keine echte iPhone-/Safari-Abnahme. Diese Aufnahmen belegen Darstellung und untersuchte Bedienung, keine künstlerische Freigabe.</p><p><strong>Gestalterisches NO-GO:</strong> Krone, Astanschlüsse, Altersdarstellung und Fruchtmaßstab benötigen weitere zeichnerische Arbeit.</p><video controls preload="none"><source src="evidence/MOTION_BROWSER.mp4" type="video/mp4"></video><p>Aufnahmezeitpunkte: evidence/motion-capture.json. Kein Geräte-FPS-Benchmark.</p><div class="shots">'
for name in shots:body+=f'<figure><a href="evidence/screenshots/{name}"><img loading="lazy" src="evidence/screenshots/{name}" alt="{html.escape(Path(name).stem)}"></a><figcaption>{html.escape(name)}</figcaption></figure>'
(R/'SCREENSHOTS.html').write_text(doc('FaithPath A.3 · Browsernachweise',body+'</div>'))
pdfmetrics.registerFont(TTFont('DM',str(R/'assets/fonts/DMSans.ttf')));pdfmetrics.registerFont(TTFont('Newsreader',str(R/'assets/fonts/Newsreader.ttf')))
W,H=landscape(A4);pdf=canvas.Canvas(str(R/'DESIGNENTSCHEIDUNG.pdf'),pagesize=(W,H),invariant=1);pdf.setTitle('FaithPath Lichtkrone A.3 – Designprüfung: noch kein Premium-Final');pdf.setAuthor('FaithPath Designstudie')
style=ParagraphStyle('copy',fontName='DM',fontSize=11,leading=17,textColor=HexColor('#20382f'))
def page(title,sub=''):
 pdf.setFillColor(HexColor('#f7f7f2'));pdf.rect(0,0,W,H,fill=1,stroke=0);pdf.setFillColor(HexColor('#20382f'));pdf.setFont('Newsreader',27);pdf.drawString(30,H-42,title);pdf.setFont('DM',8);pdf.setFillColor(HexColor('#56635a'));pdf.drawString(32,H-63,sub);pdf.drawString(32,17,'FaithPath · A.3 · technische Studie · künstlerischer Finalstand NICHT erreicht');pdf.drawRightString(W-32,17,str(pdf.getPageNumber()))
def picture(name,x,y,w,h):
 im=ImageReader(str(R/'evidence/screenshots'/name));iw,ih=im.getSize();s=min(w/iw,h/ih);pdf.drawImage(im,x+(w-iw*s)/2,y+(h-ih*s)/2,width=iw*s,height=ih*s,mask='auto')
def para(t,x,y,w):
 p=Paragraph(t,style);_,h=p.wrap(w,600);p.drawOn(pdf,x,y-h);return y-h-16
page('A.2 gegen A.3: ehrlicher Vergleich','Links unveränderte A.2-Referenz. Rechts die aus echten getrennten Ebenen montierte Arbeitsfassung.')
picture('master.png',20,75,W-40,H-160);para('<b>Kein Integrations-GO.</b> Die neue Montage ist geometrisch prüfbar, ihre Krone wirkt jedoch zu stark in Büschel geteilt. A.2 bleibt in der Gesamtkomposition überzeugender.',32,73,W-64);pdf.showPage()
page('Sieben Stufen, ein registriertes Rig','Samen und Keimling unverändert aus A.2. Jüngeres Holz in 3–4; identisches Holz in 5–7.')
picture('stages.png',20,60,W-40,H-140);pdf.showPage()
page('Alle benachbarten Übergänge','Je 50 % Ebenendeckkraft, gemeinsame Canvas. Ab 3 mit Ankerpunkten; Nahansichten 1–2 gesondert betrachten.')
picture('overlays.png',20,40,W-40,H-120);pdf.showPage()
page('Stufen 5–7 bei 200 CSS-Pixeln','Unverkleinerte PNG und die laufende Galerie liefern die exakte Größenprobe; die PDF skaliert den Screenshot.')
picture('small-200.png',20,130,W-40,H-210);y=125
for t in['Ohne Früchte / eine vordere Gruppe / zwei hintere und drei vordere Gruppen. Der Kronenumfang verändert sich lokal. Namen bleiben sichtbar.','Die Unterschiede sind bei 180 px subtil. Fruchtgruppen wiederholen sich sichtbar und sind für die kleine Darstellung vergrößert. Eine echte Nutzer-Erkennungsprüfung fehlt.']:y=para(t,32,y,W-64)
pdf.showPage()
page('Tatsächlich gelieferte transparente Ebenen','G / W / F1 / C1 / C2 / C3 / F2. Kein behauptetes Rig in einem flachen Gesamtbild.')
picture('layers.png',20,40,W-40,H-120);pdf.showPage()
page('Mobile Wirkung in vier Themes','Echte Chromium-Layoutstudien. Keine Integration in die echte App, ausschließlich synthetische Texte.')
for i,(f,t)in enumerate([('viewport-320-light-tree.png','Hell · Detail · 320'),('viewport-390-paper-tree.png','Papier · Detail · 390'),('viewport-390-atmospheric-tree.png','Atmosphärisch · Detail · 390'),('viewport-390-night-tree.png','Nacht · Detail · 390')]):
 x=25+i*200;picture(f,x,65,188,420);pdf.setFont('DM',8);pdf.setFillColor(HexColor('#20382f'));pdf.drawString(x,46,t)
pdf.showPage()
page('Bewegung ohne wackelnden Stamm','Browservideo und interaktive Demo liegen bei. Die Überblendung ist ausdrücklich kein Wachstumsmorph.')
picture('demo-stage-7.png',24,75,340,H-155);y=H-100
for t in['Drei unabhängig bewegte Kronenbereiche, Früchte jeweils am selben Elternteil. Statisches Holz und statischer Wurzelkontakt.','Manueller Start, zwei Zyklen, Ende spätestens nach 16 Sekunden. Reduced Motion sowie fehlende Sichtbarkeit stoppen dekorative Bewegung.','6 → 7: einsekündige Kronenüberblendung. Kein plötzliches neues Wackeln des ganzen Baums, kein erzwungenes Morphen.','Der Mitschnitt enthält reale Aufnahmezeitpunkte. 60 FPS, Akkuverbrauch und Verhalten eines schwachen Smartphones wurden nicht gemessen.']:y=para(t,395,y,W-427)
pdf.showPage()
page('Was vor einer Freigabe noch fehlt','Künstlerische Befunde haben Vorrang vor grünen Tests.')
y=H-100
for t in['<b>Krone:</b> Die sichtbare Teilung in einzelne Büschel schwächt die Natürlichkeit. Die volle A.2-Komposition darf nicht zugunsten leichter Animation geopfert werden.','<b>Anatomie:</b> Manche Anschlüsse wirken gepfropft. Frühe Stufen enthalten zu früh altes Holz. Blattgrößen und Beleuchtung der Teilzeichnungen sind noch nicht einheitlich.','<b>Früchte:</b> Echter Stiel statt schwebender Dekoration, aber wiederholte Gruppen und übergroßer Maßstab. Kleine Ansicht und natürlicher Maßstab benötigen eine gemeinsame Retusche.','<b>Empfehlung:</b> Zusammenhängende botanische Retusche auf dem registrierten Gerüst. Keine weitere unkontrollierte Serie unabhängiger Gesamtbäume.','<b>Entscheidung:</b> Technisches Muster geliefert; Premium-Final nicht erreicht. NO-GO für Phase B. Bestehende App, A.2 und Windform unverändert.']:y=para(t,32,y,W-64)
pdf.showPage()
page('Nachweise und ausdrückliche Prüfgrenzen','Alle Details stehen in BERICHT.html, evidence/qa.json und den unveränderten Testprotokollen.')
y=H-100
for t in[f'<b>Browser:</b> {qa["summary"]["pass"]} bestandene isolierte Prüfgruppen, {qa["summary"]["fail"]} fehlgeschlagen. 32 mobile Layoutfälle; 16 Fälle mit 200 % Schrift; acht Axe-Prüfungen ohne gemeldete A/AA-Verstöße.','<b>Bestehende App:</b> 245 Tests bestanden. 4.335 bereits versionierte Dateien bytegleich zum Ausgangscommit. Daten, Regeln, Backups, Bibel- und Frageinhalte unverändert.','<b>Assetexport:</b> Zwei Durchläufe, 31 Ausgabedateien bytegleich per SHA-256. Exakte Ruhe-Rekomposition aus dekodierten PNG-Ebenen. Keine behauptete Reproduzierbarkeit der Bildgeneration.','<b>Offen:</b> echte iPhone-, Safari-, VoiceOver-, Geräte-Performance- und Nutzerprüfungen. Direktes file:// im verwalteten Browser administrativ gesperrt; lokaler HTTP-Aufruf geprüft.','<b>Grenze:</b> Kein Produktionsbuild, kein App-PWA-Update, kein Merge, kein Deployment. Der Auftrag endet hier bei der Designentscheidung.']:y=para(t,32,y,W-64)
pdf.showPage();pdf.save();print(json.dumps({'screenshots':len(shots),'pdfPages':9,'artRecommendation':'NO_GO'}))
