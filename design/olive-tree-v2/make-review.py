"""Assemble readable local documentation and a PDF from genuine screenshots.

No generated image is retouched. This script only lays out existing evidence.
"""
from pathlib import Path
import html, re, json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT=Path(__file__).resolve().parent
def inline(s):
    s=html.escape(s)
    s=re.sub(r'`([^`]+)`',r'<code>\1</code>',s)
    s=re.sub(r'\*\*([^*]+)\*\*',r'<strong>\1</strong>',s)
    return s

def render_md(text):
    out=[]; paragraph=[]; table=[]
    def flush():
        if paragraph:out.append('<p>'+inline(' '.join(paragraph))+'</p>');paragraph.clear()
    def flush_table():
        if table:
            out.append('<div class="table-wrap"><table>')
            for i,line in enumerate(table):
                if re.fullmatch(r'[| :\-]+',line):continue
                tag='th' if i==0 else 'td'
                out.append('<tr>'+''.join(f'<{tag}>'+inline(c.strip())+f'</{tag}>' for c in line.strip('|').split('|'))+'</tr>')
            out.append('</table></div>');table.clear()
    for line in text.splitlines():
        if line.startswith('|'):flush();table.append(line);continue
        flush_table()
        if not line.strip():flush();continue
        if line.startswith('#'):
            flush();n=len(line)-len(line.lstrip('#'));out.append(f'<h{n}>'+inline(line[n:].strip())+f'</h{n}>')
        elif line.startswith('- ') or re.match(r'^\d+\. ',line):
            flush();out.append('<p class="list-item">'+inline(line)+'</p>')
        else:paragraph.append(line)
    flush();flush_table();return '\n'.join(out)

doc_css='''body{max-width:940px;margin:auto;padding:32px 24px;background:var(--v-canvas);color:var(--v-ink);font:17px/1.65 var(--v-sans)}h1,h2,h3{font-family:var(--v-display);line-height:1.15;font-weight:450}h1{font-size:2.7rem}h2{font-size:2rem;margin-top:48px}a{color:inherit}code{font-size:.85em;overflow-wrap:anywhere}.table-wrap{overflow:auto}table{border-collapse:collapse;width:100%;font-size:.8rem}td,th{text-align:left;padding:12px;vertical-align:top;border-bottom:1px solid var(--v-line);overflow-wrap:anywhere}.list-item{padding-left:18px}img{max-width:100%}nav{display:flex;gap:24px;flex-wrap:wrap}figure{margin:0}figcaption{font-size:.75rem;overflow-wrap:anywhere}.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:28px}.shots img{max-height:500px;object-fit:contain;background:var(--v-faint)}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}'''
def doc(title,body):
    return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+html.escape(title)+'</title><link rel="stylesheet" href="tokens.css"><style>'+doc_css+'</style></head><body><nav><a href="index.html">Designgalerie</a><a href="SCREENSHOTS.html">Screenshots</a><a href="DESIGN_ENTSCHEIDUNG.pdf">Visuelle PDF</a></nav><main>'+body+'</main></body></html>'
for name in ['BERICHT','ANIMATION_UND_INTEGRATION','ASSET_PROVENIENZ']:
    (ROOT/(name+'.html')).write_text(doc(name.replace('_',' '),render_md((ROOT/(name+'.md')).read_text())))
shots=sorted((ROOT/'evidence/screenshots').glob('*.png'))
body='<h1>Gesehene Ansichten, echte Aufnahmen.</h1><p>Neue Bilder: isolierte Designstudie. Baseline: unveränderte echte App. Alle persönlichen Texte sind synthetisch. Chromium ist keine echte iPhone-/Safari-Abnahme.</p><h2>Neue Designstudie</h2><div class="shots">'
for p in shots:
    rel=p.relative_to(ROOT).as_posix();body+=f'<figure><a href="{rel}"><img src="{rel}" loading="lazy" alt="{html.escape(p.stem)}"></a><figcaption>{html.escape(p.name)}</figcaption></figure>'
body+='</div><h2>Vorher: tatsächliche App-Baseline</h2><div class="shots">'
for p in sorted((ROOT/'evidence/baseline').glob('*.png')):
    rel=p.relative_to(ROOT).as_posix();body+=f'<figure><a href="{rel}"><img src="{rel}" loading="lazy" alt="Baseline {html.escape(p.stem)}"></a><figcaption>Baseline · {html.escape(p.name)}</figcaption></figure>'
body+='</div>'
(ROOT/'SCREENSHOTS.html').write_text(doc('FaithPath · Browsernachweise',body))

pdfmetrics.registerFont(TTFont('DM',str(ROOT/'assets/fonts/DMSans.ttf')))
pdfmetrics.registerFont(TTFont('Newsreader',str(ROOT/'assets/fonts/Newsreader.ttf')))
W,H=landscape(A4); pdf=canvas.Canvas(str(ROOT/'DESIGN_ENTSCHEIDUNG.pdf'),pagesize=(W,H),invariant=1)
pdf.setTitle('FaithPath Olivenbaum V2 – Designentscheidung Phase A')
pdf.setAuthor('FaithPath Designstudie')
ink=HexColor('#20382f'); muted=HexColor('#56635a')
style=ParagraphStyle('copy',fontName='DM',fontSize=11,leading=17,textColor=ink)
def page(title,subtitle=''):
    pdf.setFillColor(HexColor('#f7f7f2'));pdf.rect(0,0,W,H,fill=1,stroke=0)
    pdf.setFillColor(ink);pdf.setFont('Newsreader',30);pdf.drawString(34,H-48,title)
    if subtitle:pdf.setFont('DM',9);pdf.setFillColor(muted);pdf.drawString(36,H-70,subtitle)
    pdf.setFont('DM',8);pdf.setFillColor(muted);pdf.drawString(36,20,'FP-DESIGN-20261029-OLIVE-V2-A · Phase A · keine App-Integration')
    pdf.drawRightString(W-36,20,str(pdf.getPageNumber()))
def paragraph(text,x,y,width):
    p=Paragraph(text,style);_,h=p.wrap(width,500);p.drawOn(pdf,x,y-h);return y-h-16
def picture(file,x,y,w,h):
    im=ImageReader(str(ROOT/file));iw,ih=im.getSize();scale=min(w/iw,h/ih);dw,dh=iw*scale,ih*scale
    pdf.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,width=dw,height=dh,mask='auto')
page('Olivenbaum V2','Eine botanische Identität für „Verbunden“. Zur visuellen Entscheidung, nicht zur Veröffentlichung.')
y=H-130
for t in ['Ein charaktervoller Stamm, feine silbergrüne Blätter und warmes, ruhiges Licht.','Sieben zusammenhängende Bilder für die vom Nutzer selbst dokumentierte Geschichte. Keine Bewertung des Glaubens.','Empfehlung: diese Richtung weiterführen. Bildregistrierung und bewegliche Kronenebenen sind vor Phase B noch aufzubereiten.','Phase B wartet auf die ausdrückliche Designfreigabe.']:
    y=paragraph(t,36,y,290)
picture('assets/masters/07-fruchttragender-baum.png',350,50,455,455);pdf.showPage()
page('Ein Baum. Sieben Bilder.','Echte Chromium-Aufnahme. Samen und Keimling sind ausdrücklich optische Nahansichten.')
picture('evidence/screenshots/seven-stages-light.png',26,75,W-52,405)
paragraph('Die späten Stufen unterscheiden sich vor allem durch den Fruchtbesatz. Stufenname und Bedeutung bleiben wichtig; die Illustration allein ist keine Fortschrittsmessung.',36,70,W-72);pdf.showPage()
page('Vorher und neuer Entwurf','Links: unveränderte SVG-Geometrie der aktuellen App. Rechts: neue botanische Illustration. Gleicher Bildbereich.')
picture('evidence/screenshots/comparison-light.png',30,45,W-60,H-135);pdf.showPage()
page('Mobile Komposition','Synthetische, isolierte Layoutstudien. Keine echten Datenfunktionen. CSS-Pixel, keine physische iPhone-Abnahme.')
for file,x,label in [('today-night-320-100.png',54,'Heute · 320 × 568'),('today-night-390-100.png',314,'Heute · 390 × 844'),('tree-light-390-100-stage7.png',574,'Baumdetail · 390 × 844')]:
    picture('evidence/screenshots/'+file,x,64,210,410)
    pdf.setFont('DM',9);pdf.setFillColor(ink);pdf.drawString(x,47,label)
pdf.showPage()
page('Vier Themes. Eine Illustration.','Hell · Papier · Atmosphärisch · Nacht. Unveränderte Themefarben, neue transparente lokale Assets.')
for theme,x,y in [('light',36,290),('paper',435,290),('atmospheric',36,88),('night',435,88)]:
    picture('evidence/screenshots/seven-stages-'+theme+'.png',x,y,370,165)
pdf.showPage()
page('Was vor der Integration noch nötig ist','Ehrliche Grenze: gute statische Bilder sind noch keine hochwertige Wachstumsanimation.')
y=H-110
for t in ['<b>Animation:</b> Stamm und Wurzeln bleiben statisch. Für wenige sanfte Kronenbewegungen werden sauber freigestellte, deckungsgleiche Ebenen benötigt. Diese sind noch nicht geliefert.','<b>Wachstum:</b> eine kurze registrierte Überblendung nur beim tatsächlichen Stufenwechsel. Die Pflanzsequenz nach erfolgreichem Speichern vergibt keine Entwicklung.','<b>Technik:</b> vorhandenen Visibility-/Reduced-Motion-Lifecycle weiterverwenden. Keine permanenten Timer. Keine Änderung an Schwellwerten, IDs, Schema V5 oder Backups.','<b>Nachweise:</b> 245 App-Tests und 471 Galerieprüfungen bestanden; zwei identische historische App-Builds. Diese Ergebnisse bescheinigen keine noch nicht implementierte Phase B.','<b>Offen:</b> reale Geräte, Safari, VoiceOver, Animation-/Akkumessung, integriertes Offline-Update und der im verwalteten Browser gesperrte Datei-Doppelklick.','<b>Freigabe:</b> zuerst die botanische Richtung und sieben Bilder auswählen. Danach Phase B ausdrücklich beauftragen. main, Produktion und Testdeployments bleiben unverändert.']:
    y=paragraph(t,36,y,W-72)
pdf.showPage();pdf.save()
print(json.dumps({'htmlReports':3,'screenshotIndex':len(shots),'pdf':'DESIGN_ENTSCHEIDUNG.pdf'}))
