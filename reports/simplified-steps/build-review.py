"""Compose unchanged browser screenshots and human QA documentation only."""
from pathlib import Path
from html import escape
import hashlib
import json
import re
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]
FONT = REPO / 'src/verbunden/assets/fonts/DMSans.ttf'

def inline(text):
    text = escape(text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)
    return re.sub(r'`([^`]+)`', r'<code>\1</code>', text)

def sections(markdown):
    paragraph, table, code = [], [], []
    coding = False
    def flush():
        if paragraph:
            result = ('p', ' '.join(paragraph)); paragraph.clear(); return result
        if table:
            result = ('table', table.copy()); table.clear(); return result
        return None
    for line in markdown.splitlines() + ['']:
        if line.startswith('```'):
            if coding:
                yield 'code', '\n'.join(code); code.clear()
            else:
                item = flush()
                if item: yield item
            coding = not coding
        elif coding: code.append(line)
        elif line.startswith('|'):
            if not re.fullmatch(r'[| :\-]+', line): table.append(line.strip('|').split('|'))
        elif line.startswith('#'):
            item = flush()
            if item: yield item
            yield 'h1' if line.startswith('# ') else 'h2', line.lstrip('# ')
        elif not line.strip():
            item = flush()
            if item: yield item
        else: paragraph.append(line)

comparisons = ROOT / 'screenshots/comparisons'
comparisons.mkdir(exist_ok=True)
for width in [375, 390]:
    for flow, title in [('seed', 'Erster persönlicher Weg'), ('step', 'Späterer Schritt')]:
        before = Image.open(ROOT / f'screenshots/before/{flow}-{width}-selected.png').convert('RGB')
        after = Image.open(ROOT / f'evidence/browser/{flow}-{width}-paper-selected.png').convert('RGB')
        assert before.size == after.size == (width * 2, (667 if width == 375 else 844) * 2)
        w, h = before.size
        sheet = Image.new('RGB', (2*w+72, h+150), '#f3eddf')
        draw = ImageDraw.Draw(sheet)
        draw.text((24,20), title + f' · {width} CSS-Pixel · nach einem Tipp', font=ImageFont.truetype(str(FONT),30), fill='#3d3b2e')
        draw.text((24,75), 'Vorher · zwei getrennte Felder', font=ImageFont.truetype(str(FONT),24), fill='#655d4e')
        draw.text((w+48,75), 'Jetzt · direkt bearbeiten und speichern', font=ImageFont.truetype(str(FONT),24), fill='#655d4e')
        sheet.paste(before,(24,125)); sheet.paste(after,(w+48,125))
        sheet.save(comparisons / f'{flow}-{width}-comparison.png')

markdown = (ROOT/'BERICHT.md').read_text()
html = []
for kind, value in sections(markdown):
    if kind == 'table':
        rows = ['<tr>'+''.join('<td>'+inline(c.strip())+'</td>' for c in row)+'</tr>' for row in value]
        html.append('<div class="table"><table>'+''.join(rows)+'</table></div>')
    elif kind == 'code': html.append('<pre><code>'+escape(value)+'</code></pre>')
    else: html.append(f'<{kind}>'+inline(value)+f'</{kind}>')
visuals = '<h2>Vorher und nachher – echte Browserbilder</h2><p>Papier-Theme, gleiche Viewportgröße und DPR 2. Die Aufnahmen wurden nicht retuschiert.</p>'
for flow, title in [('seed','Erster persönlicher Weg'),('step','Späterer Schritt')]:
    file=f'screenshots/comparisons/{flow}-390-comparison.png'
    visuals+=f'<figure><a href="{file}"><img src="{file}" alt="{title}: vorher und vereinfacht" loading="lazy"></a><figcaption>{title} · 390 × 844 CSS-Pixel · Bilder zum Vergrößern öffnen</figcaption></figure>'
visuals += '<h2>Weitere Ansichten</h2><ul>'
for width in [375,390]:
    for theme in ['light','paper','atmospheric','night']:
        for flow in ['seed','step']:
            file=f'evidence/browser/{flow}-{width}-{theme}-initial.png'
            visuals+=f'<li><a href="{file}">{flow} · {width} · {theme} · vor Auswahl</a></li>'
visuals+='</ul>'
style='body{margin:0;background:#f3eddf;color:#3d3b2e;font:1rem/1.65 system-ui,sans-serif;overflow-wrap:break-word;hyphens:auto}main{max-width:1100px;margin:auto;padding:32px 22px}h1,h2{font-family:Georgia,serif;line-height:1.25}h1{font-size:2.1rem}h2{margin-top:2em}img{max-width:100%;height:auto}figure{margin:24px 0}a{color:inherit;text-underline-offset:4px}a:focus-visible{outline:3px solid #355e49;outline-offset:4px}code{font-size:.9em;overflow-wrap:anywhere}pre{white-space:pre-wrap}table{border-collapse:collapse;min-width:650px;font-size:.88rem}td{padding:12px;border-bottom:1px solid #cec6b2;vertical-align:top}.table{overflow:auto}figcaption{font-size:.9rem}'
(ROOT/'QA_INDEX.html').write_text('<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FaithPath – Vereinfachte Schritt-Hilfe</title><style>'+style+'</style><main><p><a href="BERICHT.pdf">Bericht als PDF</a> · <a href="evidence/qa-summary.json">Maschinenresultate</a></p>'+visuals+''.join(html)+'</main></html>')

from reportlab import rl_config
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, PageBreak, Image as PdfImage, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
rl_config.invariant = 1
pdfmetrics.registerFont(TTFont('Review','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('ReviewBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('Review',normal='Review',bold='ReviewBold',italic='Review',boldItalic='ReviewBold')
styles=getSampleStyleSheet()
for s in styles.byName.values(): s.fontName='Review'
styles['BodyText'].fontSize=9; styles['BodyText'].leading=14
styles.add(ParagraphStyle('Small',fontName='Review',fontSize=7,leading=10))
story=[]
fmt=lambda text:inline(text).replace('<code>','<font size="7">').replace('</code>','</font>')
for kind,value in sections(markdown):
    if kind=='table':
        table=Table([[Paragraph(fmt(c.strip()),styles['Small'])for c in row]for row in value],colWidths=[130,223,152],repeatRows=1)
        table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e4e2d2')),('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,-1),.3,colors.HexColor('#c5c1ac'))]))
        story.extend([table,Spacer(1,10)])
    elif kind=='code':story.append(Preformatted(value,styles['Small']))
    else:story.extend([Paragraph(fmt(value),styles[{'p':'BodyText','h1':'Heading1','h2':'Heading2'}[kind]]),Spacer(1,7)])
for flow,title in [('seed','Erster persönlicher Weg'),('step','Späterer Schritt')]:
    file=comparisons/f'{flow}-390-comparison.png'; w,h=Image.open(file).size
    story.extend([PageBreak(),Paragraph(title+' – vorher/nachher',styles['Heading1']),Spacer(1,16),PdfImage(str(file),width=505,height=505*h/w),Spacer(1,12),Paragraph('Die vollständigen PNGs liegen separat vor. Chromium-Aufnahme, kein physischer iPhone-Test.',styles['BodyText'])])
def footer(canvas,doc):
    canvas.setFont('Review',7);canvas.drawString(44,23,'FaithPath · vereinfachte Schritt-Hilfe · isolierte QA, keine Produktionsfreigabe');canvas.drawRightString(550,23,str(doc.page))
SimpleDocTemplate(str(ROOT/'BERICHT.pdf'),pagesize=(595.28,841.89),leftMargin=44,rightMargin=44,topMargin=40,bottomMargin=40,title='FaithPath – Vereinfachte Schritt-Hilfe').build(story,onFirstPage=footer,onLaterPages=footer)
receipt={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [ROOT/'QA_INDEX.html',ROOT/'BERICHT.pdf',*sorted(comparisons.glob('*.png'))]}
(ROOT/'evidence/report-files.json').write_text(json.dumps(receipt,indent=2)+'\n')
print('Report, PDF and four comparison sheets created.')
