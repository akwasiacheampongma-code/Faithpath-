"""Assemble a readable review from real screenshots; never retouch tree artwork."""
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
ROOT=Path(__file__).resolve().parent
CSS='''body{background:var(--v-canvas);color:var(--v-ink);font:17px/1.65 var(--v-sans);max-width:960px;margin:auto;padding:32px 24px}h1,h2{font-family:var(--v-display);font-weight:450;line-height:1.12}h1{font-size:2.7rem}h2{font-size:2rem;margin-top:40px}a{color:inherit}nav{display:flex;gap:24px;flex-wrap:wrap}code{font-size:.85em;overflow-wrap:anywhere}.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:24px}figure{margin:0}img{max-width:100%;max-height:600px;object-fit:contain}figcaption{font-size:.75rem;overflow-wrap:anywhere}.table-wrap{overflow:auto}table{font-size:.8rem;border-collapse:collapse}td,th{border-bottom:1px solid var(--v-line);padding:12px;text-align:left;vertical-align:top}'''
def inline(t):
    t=html.escape(t);t=re.sub(r'`([^`]+)`',r'<code>\1</code>',t)
    return re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',t)
def md(text):
    out=[]
    for p in text.split('\n\n'):
        if not p.strip():continue
        if p.startswith('#'):
            n=len(p)-len(p.lstrip('#'));out.append(f'<h{n}>'+inline(p[n:].strip())+f'</h{n}>')
        elif p.startswith('- '):out.append('<ul>'+''.join('<li>'+inline(x[2:])+'</li>' for x in p.splitlines() if x.startswith('- '))+'</ul>')
        elif p.startswith('|'):
            rows=p.splitlines();out.append('<div class="table-wrap"><table>')
            for i,row in enumerate(rows):
                if re.fullmatch(r'[| :\-]+',row):continue
                tag='th' if i==0 else 'td';out.append('<tr>'+''.join(f'<{tag}>'+inline(c.strip())+f'</{tag}>' for c in row.strip('|').split('|'))+'</tr>')
            out.append('</table></div>')
        else:out.append('<p>'+inline(p.replace('\n',' '))+'</p>')
    return '\n'.join(out)
def doc(title,body):return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+html.escape(title)+'</title><link rel="stylesheet" href="tokens.css"><style>'+CSS+'</style></head><body><nav><a href="index.html">Galerie</a><a href="DESIGNENTSCHEIDUNG.pdf">Visuelle PDF</a><a href="SCREENSHOTS.html">Screenshots</a></nav><main>'+body+'</main></body></html>'
for stem in ['BERICHT','ASSET_UND_EBENENPLAN']:(ROOT/(stem+'.html')).write_text(doc(stem,md((ROOT/(stem+'.md')).read_text())))
qa=json.loads((ROOT/'evidence/qa-results.json').read_text());files=qa['screenshots']
body='<h1>Echte Browseransichten.</h1><p>Isolierte Designstudie, Chromium, synthetische Texte. Keine echten iPhone-/Safari-Aufnahmen. Die 180/200/220-Proben nur in der laufenden Galerie bei 100 % Browserzoom als exakte CSS-Größen interpretieren.</p><div class="shots">'
for name in files:
    rel='evidence/'+name;body+=f'<figure><a href="{rel}"><img src="{rel}" loading="lazy" alt="{html.escape(Path(name).stem)}"></a><figcaption>{html.escape(name)}</figcaption></figure>'
(ROOT/'SCREENSHOTS.html').write_text(doc('FaithPath A.2 · Nachweise',body+'</div>'))
pdfmetrics.registerFont(TTFont('DM',str(ROOT/'assets/fonts/DMSans.ttf')))
pdfmetrics.registerFont(TTFont('Newsreader',str(ROOT/'assets/fonts/Newsreader.ttf')))
W,H=landscape(A4);pdf=canvas.Canvas(str(ROOT/'DESIGNENTSCHEIDUNG.pdf'),pagesize=(W,H),invariant=1)
pdf.setTitle('FaithPath Olivenbaum V2 – Phase A.2 – Designentscheidung')
pdf.setAuthor('FaithPath Designstudie')
style=ParagraphStyle('copy',fontName='DM',fontSize=11,leading=17,textColor=HexColor('#20382f'))
def page(title,sub=''):
    pdf.setFillColor(HexColor('#f7f7f2'));pdf.rect(0,0,W,H,fill=1,stroke=0)
    pdf.setFillColor(HexColor('#20382f'));pdf.setFont('Newsreader',29);pdf.drawString(32,H-43,title)
    pdf.setFillColor(HexColor('#56635a'));pdf.setFont('DM',8.5)
    if sub:pdf.drawString(34,H-65,sub)
    pdf.drawString(34,18,'FaithPath · Phase A.2 · KI-generierte Illustrationen · Designentscheidung offen')
    pdf.drawRightString(W-34,18,str(pdf.getPageNumber()))
def picture(name,x,y,w,h):
    im=ImageReader(str(ROOT/'evidence/screenshots'/name));iw,ih=im.getSize();scale=min(w/iw,h/ih);dw,dh=iw*scale,ih*scale
    pdf.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,width=dw,height=dh,mask='auto')
def para(text,x,y,w):
    p=Paragraph(text,style);_,h=p.wrap(w,600);p.drawOn(pdf,x,y-h);return y-h-16
page('Zwei Master zur Auswahl','Links Windform · rechts Lichtkrone. Die Siebenerreihe verwendet Lichtkrone als Arbeitswahl, nicht als Nutzerfreigabe.')
picture('masters-light.png',20,33,W-40,H-110);pdf.showPage()
page('Sieben zusammenhängende Darstellungen','Gleiche vollständige Bildfläche ab Stufe 3. Samen und Keimling sind optische Nahansichten.')
picture('stages-light.png',20,140,W-40,H-225)
para('Die späten Stufen unterscheiden sich jetzt auch durch die Silhouette: offene untere Äste, zusätzliche Blattsprays und vollere Außenkrone. Die ursprünglichen Bedeutungen und Wachstumsschwellen bleiben unverändert.',34,110,W-68);pdf.showPage()
page('Die Probe bei 200 CSS-Pixeln','Die PDF skaliert den Screenshot. Die unverkleinerte PNG und die laufende Galerie liefern die exakte Größenprobe.')
picture('small-200-light.png',25,100,W-50,H-190)
para('Stufe 5 wirkt offener und stärker beschnitten. Stufe 6 erhält unteres Blattvolumen und erste Früchte. Stufe 7 hat eine vollere Außenkrone. Die Nutzererkennung wurde nicht mit Testpersonen gemessen.',34,90,W-68);pdf.showPage()
page('Überlagerungen: Geometrie bleibt überprüfbar','Je 50 % der jüngeren Stufe und des Masters, gleiche Canvas, keine nachträgliche Verformung.')
picture('overlays-light.png',20,34,W-40,H-115);pdf.showPage()
page('Vorher: A.1 · neuer Entwurf: A.2','Die früheren Bilder bleiben unverändert. Neue Stamm-/Astführung und matte silbergrüne Blattwirkung.')
picture('comparison-light.png',20,34,W-40,H-115);pdf.showPage()
page('Mobile Bildwirkung in vier Themes','Echte Chromium-Aufnahmen der isolierten Layoutstudie. Keine App-/PWA- oder physische iPhone-Freigabe.')
for i,(f,label) in enumerate([('today-light-390.png','Hell · Heute · 390'),('today-paper-390.png','Papier · Heute · 390'),('today-atmospheric-390.png','Atmosphärisch · Heute · 390'),('today-night-320.png','Nacht · Heute · 320')]):
    x=30+i*198;picture(f,x,65,186,420);pdf.setFont('DM',8);pdf.setFillColor(HexColor('#20382f'));pdf.drawString(x,45,label)
pdf.showPage()
page('Geplanter Ebenenaufbau','Stamm, Krone und Früchte sind noch nicht als deckungsgleiche Produktionsassets geliefert.')
picture('layers-light.png',20,34,W-40,H-115);pdf.showPage()
page('Meine Empfehlung und die offenen Entscheidungen','Keine Qualitätsnoten. Die Wahl bleibt beim Auftraggeber.')
y=H-100
for t in ['<b>Lichtkrone weiter ausarbeiten.</b> Die höhere linke Krone und der tiefe rechte Ast funktionieren ruhiger auf schmalen Flächen. Windform hat die kräftigere seitliche Geste, benötigt aber mehr Breite.','<b>Formkritik:</b> einzelne Blattfächer bleiben repetitiv. Der offene starke Baum kann beschnitten wirken; die mittleren Stufen zeigen früh altes Holz. Das sind sichtbare Abwägungen, keine erledigten Punkte einer Checkliste.','<b>Geometrie:</b> Stufen 5–7 liegen eng beieinander. Beim jungen Stamm bleibt Drift sichtbar. Für nahtloses Wachstum braucht es eine verbindliche zeichnerische Registrierung.','<b>Animation:</b> geplant sind statisches Holz, drei getrennte Kronenbereiche und Fruchtgruppen. Die flachen PNGs enthalten noch keine natürlich beweglichen Äste.','<b>Geschützt:</b> Die echte App und A.1 bleiben unverändert. Keine geänderten Daten, Schwellen oder Inhalte. Kein Merge und kein Deployment.','<b>Nächster Schritt:</b> Master und Siebenerreihe auswählen oder konkrete gestalterische Korrekturen benennen. Phase B bleibt ausdrücklich nicht freigegeben.']:
    y=para(t,34,y,W-68)
pdf.showPage();pdf.save()
print(json.dumps({'screenshots':len(files),'pdf':'DESIGNENTSCHEIDUNG.pdf','pages':8}))
