"""Build static human-readable evidence and reproducible ZIPs; never app assets.
No artwork editing: report sheets use unchanged original PNGs and browser shots.
"""
from pathlib import Path
from html import escape
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]

def inline(text):
    text = escape(text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    return text

def html_markdown(text):
    result, paragraph, table = [], [], []
    def flush():
        if paragraph:
            result.append('<p>' + inline(' '.join(paragraph)) + '</p>')
            paragraph.clear()
        if table:
            rows = ['<tr>' + ''.join('<th>' + inline(c.strip()) + '</th>' for c in table[0]) + '</tr>']
            rows += ['<tr>' + ''.join('<td>' + inline(c.strip()) + '</td>' for c in row) + '</tr>' for row in table[1:]]
            result.append('<div class="table-wrap"><table>' + ''.join(rows) + '</table></div>')
            table.clear()
    for line in text.splitlines() + ['']:
        if line.startswith('|'):
            if not re.fullmatch(r'[| :\-]+', line): table.append(line.strip('|').split('|'))
        elif line.startswith('#'):
            flush(); level = len(line) - len(line.lstrip('#'))
            result.append(f'<h{level}>' + inline(line.lstrip('# ')) + f'</h{level}>')
        elif not line.strip(): flush()
        else: paragraph.append(line)
    return ''.join(result)

STYLE = '''body{margin:0;background:#f3eddf;color:#3d3b2e;font:1.0625rem/1.65 system-ui,sans-serif;overflow-wrap:break-word;hyphens:auto}main{max-width:1040px;margin:auto;padding:36px 22px}h1,h2{font-family:Georgia,serif;line-height:1.2}h1{font-size:clamp(2rem,6vw,3.4rem)}h2{margin-top:2.5em}a{color:inherit;text-underline-offset:4px}a:focus-visible{outline:3px solid #2f6049;outline-offset:4px}nav{display:flex;gap:20px;flex-wrap:wrap}img,video{max-width:100%;height:auto;border-radius:16px}video{display:block;width:100%;background:#171e20;margin:20px 0}figure{margin:24px 0}figcaption{color:#655d4e;font-size:.9rem}code{font-size:.85em;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere}nav a{max-width:100%;overflow-wrap:anywhere}.table-wrap{overflow:auto}table{border-collapse:collapse;font-size:.88rem;min-width:620px}td,th{padding:12px;border-bottom:1px solid #cfc7b3;text-align:left;vertical-align:top}.images{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:20px}.images img{width:100%}.callout{border-left:4px solid #586344;background:#fbf6e9;padding:18px 22px}button{font:inherit}'''

def page(title, body):
    return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escape(title) + '</title><style>' + STYLE + '</style></head><body><main>' + body.replace('Olivenbaum','Oliven\u00adbaum') + '</main></body></html>'

def render():
    evidence = ROOT / 'evidence'
    summary = json.loads((evidence / 'qa-summary.json').read_text())
    summary['sourceIntegrity'] = json.loads((evidence / 'integrity.json').read_text())
    for filename, key in [('unit.log','candidateUnit'), ('app-regression.log','appRegression')]:
        log=(evidence/filename).read_text()
        summary[key]={name:int(re.search(r'ℹ '+name+r' (\d+)',log).group(1)) for name in ['tests','pass','fail','skipped']}
    summary['browser']=json.loads((evidence/'browser.json').read_text())['summary']
    assert summary['browser']['fail']==0 and summary['candidateUnit']['fail']==0 and summary['appRegression']['fail']==0
    (evidence / 'qa-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
    markdown = (ROOT / 'BERICHT.md').read_text()
    visuals = '''<h2>Die visuellen Ergebnisse</h2>
<figure><a href="evidence/boards/SIEBEN_STUFEN_200px.png"><img src="evidence/boards/SIEBEN_STUFEN_200px.png" loading="lazy" alt="Alle sieben finalen Wachstumsbilder in gleichen 200-CSS-Pixel-Rahmen"></a><figcaption>Technisches Vergleichsblatt aus unveränderten Originalillustrationen; kein Browser-Screenshot.</figcaption></figure>
<figure><a href="evidence/boards/A5_A51_QUELLSTRUKTUR.png"><img src="evidence/boards/A5_A51_QUELLSTRUKTUR.png" loading="lazy" alt="A5 oben und A5.1 unten: Originalstrukturen der letzten drei Stufen"></a><figcaption>Quellstrukturvergleich ohne registrierte Größenanpassung.</figcaption></figure>
<h2>35 Sekunden echter Bewegungsvergleich</h2><p>A5-Windmodell links, A5.1 rechts. Gleicher korrigierter Renderer, gleicher A4-Master, Papier-Theme und 280-CSS-Pixel-Rahmen. Keine nachgestellte Bildfolge.</p>
<video controls playsinline preload="none" poster="evidence/screenshots/A5_A51_VERGLEICH_35s-poster.png"><source src="evidence/A5_A51_VERGLEICH_35s.mp4" type="video/mp4"></video>
<p><a href="evidence/A5_A51_VERGLEICH_35s.mp4">Video separat öffnen</a> · <a href="evidence/SIEBEN_STUFEN_UND_UEBERGAENGE.mp4">Alle sieben Stufen und Übergänge – echte mobile Browseraufnahme</a></p>
<h2>Mobile Kontexte – echte Browseraufnahmen</h2><div class="images">'''
    for context,label in [('today','Heute'),('journey','Mein Weg'),('detail','Baumdetail'),('seed','Erster persönlicher Weg')]:
        file=f'evidence/screenshots/context-{context}-390-paper.png'
        visuals+=f'<figure><a href="{file}"><img src="{file}" loading="lazy" alt="{label} bei 390 Pixeln im Papier-Theme"></a><figcaption>{label} · 390 × 844 · Papier</figcaption></figure>'
    visuals+='</div><h2>Renderfehler nachvollziehen</h2><div class="images">'
    for file,label in [('evidence/diagnosis/A5-hidden-paused-reproduced.png','A5: tatsächlich reproduzierter 2×2-Fehler'),('evidence/screenshots/context-today-390-paper.png','A5.1: vollständige neue Darstellung')]:
        visuals+=f'<figure><a href="{file}"><img loading="lazy" src="{file}" alt="{label}"></a><figcaption>{label}</figcaption></figure>'
    visuals+='</div><p>Die Diagnoseaufnahme „A51-intentional-2px-test.png“ ist eine absichtlich fehlerhafte Testmutation und keine finale Vorschau.</p>'
    nav='<nav><a href="START_HIER.html">Übersicht</a><a href="index.html">Interaktive Galerie (HTTP)</a><a href="BERICHT.pdf">PDF</a><a href="evidence/qa-summary.json">Maschinenlesbare Zusammenfassung</a></nav>'
    (ROOT / 'BERICHT.html').write_text(page('FaithPath A5.1 – Bericht und Nachweise',nav+html_markdown(markdown)+visuals))
    start='''<p>FaithPath · A5.1 FINAL</p><h1>Der lebendige Olivenbaum</h1><p>Sieben zusammenhängende Lebensbilder. Sichtbarer lokaler Wind. Die freigegebene Lichtkrone bleibt erhalten.</p>
<p class="callout">Isolierte Designstudie zur gemeinsamen Abnahme. Keine App-Integration und kein Deployment. Echte iPhone-/Safari-/VoiceOver- und Akkutests sind offen.</p>
<nav><a href="BERICHT.html">Bericht mit Bildern und Videos</a><a href="BERICHT.pdf">PDF öffnen</a><a href="index.html">Interaktive Galerie</a><a href="evidence/boards/SIEBEN_STUFEN_200px.png">Sieben Stufen als PNG</a></nav>
<h2>Zuerst die Bewegung ansehen</h2><video controls playsinline preload="none"><source src="evidence/A5_A51_VERGLEICH_35s.mp4" type="video/mp4"></video><p><a href="evidence/A5_A51_VERGLEICH_35s.mp4">Video separat öffnen</a> · <a href="evidence/SIEBEN_STUFEN_UND_UEBERGAENGE.mp4">Mobile Stufenwechsel</a></p>
<img src="evidence/boards/SIEBEN_STUFEN_200px.png" alt="Alle sieben finalen Olivenbaumstufen" loading="lazy">
<h2>Interaktive Galerie lokal starten</h2><p>PDF, PNG und MP4 können direkt geöffnet werden. Die interaktive ES-Modul-Galerie benötigt HTTP. Im entpackten Ordner:</p><pre><code>python3 -m http.server 4751 --bind 127.0.0.1</code></pre><p>Dann <a href="http://127.0.0.1:4751/">http://127.0.0.1:4751/</a> öffnen. Keine Internetdienste oder Benutzerkonten nötig. Auf dem iPhone benötigt die isolierte Vorschau eine separat freigegebene Hosting-/Testverbindung; es wurde keine veröffentlicht.</p>
<h2>Nachweise</h2><p>245 bestehende App-Tests, 10 neue Unit-Tests, 22 Browser-Prüfgruppen, 352 mobile Layoutfälle, 12 Axe-Scans. Keine physische Geräteabnahme.</p><p>Quellcode und technische Verträge: ARCHITEKTUR.md. Geräteprüfbogen: IPHONE_ABNAHME.md. Alle bisherigen App-Dateien und Wachstumsregeln sind unverändert.</p>'''
    (ROOT / 'START_HIER.html').write_text(page('FaithPath A5.1 – Hier beginnen',start))
    render_pdf(markdown)

def render_pdf(markdown):
    from reportlab import rl_config
    rl_config.invariant = 1
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as PdfImage, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from PIL import Image
    pdfmetrics.registerFont(TTFont('Review','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
    pdfmetrics.registerFont(TTFont('ReviewBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
    pdfmetrics.registerFontFamily('Review',normal='Review',bold='ReviewBold',italic='Review',boldItalic='ReviewBold')
    styles=getSampleStyleSheet()
    styles.add(ParagraphStyle('Small',fontName='Review'))
    for style in styles.byName.values():style.fontName='Review'
    styles['BodyText'].fontSize=9;styles['BodyText'].leading=14
    styles['Heading1'].fontSize=21;styles['Heading1'].leading=27
    styles['Heading2'].fontSize=14;styles['Heading2'].leading=20
    styles['Small'].fontSize=7;styles['Small'].leading=10
    story=[];paragraph=[];table=[]
    def text(value):return inline(value).replace('<code>','<font size="7">').replace('</code>','</font>').replace('<strong>','<b>').replace('</strong>','</b>')
    def flush():
        if paragraph:story.extend([Paragraph(text(' '.join(paragraph)),styles['BodyText']),Spacer(1,7)]);paragraph.clear()
        if table:
            columns=len(table[0]);widths=[505/columns]*columns
            if columns==3:widths=[137,130,238]
            if columns==2:widths=[120,385]
            data=[[Paragraph(text(c.strip()),styles['Small'])for c in row]for row in table]
            t=Table(data,colWidths=widths,repeatRows=1,hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e4e2d2')),('VALIGN',(0,0),(-1,-1),'TOP'),('BOTTOMPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),('LINEBELOW',(0,0),(-1,-1),.3,colors.HexColor('#c5c1ac'))]));story.extend([t,Spacer(1,10)]);table.clear()
    for line in markdown.splitlines()+['']:
        if line.startswith('|'):
            if not re.fullmatch(r'[| :\-]+',line):table.append(line.strip('|').split('|'))
        elif line.startswith('#'):
            flush();level=len(line)-len(line.lstrip('#'));story.append(Paragraph(text(line.lstrip('# ')),styles['Heading1' if level==1 else 'Heading2']))
        elif not line.strip():flush()
        else:paragraph.append(line)
    for filename,title in [('boards/SIEBEN_STUFEN_200px.png','Die sieben finalen Lebensbilder'),('boards/A5_A51_QUELLSTRUKTUR.png','A5/A5.1 – tatsächliche neue Strukturen')]:
        file=ROOT/'evidence'/filename;w,h=Image.open(file).size;story.extend([PageBreak(),Paragraph(title,styles['Heading1']),Spacer(1,20),PdfImage(str(file),width=505,height=505*h/w),Spacer(1,15),Paragraph('Technisches Vergleichsblatt aus unveränderten Originalillustrationen. Die vollständigen PNGs und bewegten Browseraufnahmen liegen separat im Paket.',styles['BodyText'])])
    story.append(PageBreak());story.append(Paragraph('Mobile Browsernachweise',styles['Heading1']))
    files=['context-today-390-paper','context-seed-390-paper','context-today-320-night','large-320-night']
    cells=[]
    for name in files:
        file=ROOT/'evidence/screenshots'/f'{name}.png';w,h=Image.open(file).size;scale=min(230/w,500/h)
        cells.append([Paragraph(name,styles['Small']),PdfImage(str(file),width=w*scale,height=h*scale)])
    for i in range(0,4,2):
        if i:story.append(PageBreak())
        story.append(Table([[cells[i],cells[i+1]]],colWidths=[252,252],style=[('VALIGN',(0,0),(-1,-1),'TOP')]))
    def footer(canvas,doc):
        canvas.setFont('Review',7);canvas.drawString(44,24,'FaithPath A5.1 · isolierte Studie · keine Geräte-/Produktionsfreigabe');canvas.drawRightString(550,24,str(doc.page))
    SimpleDocTemplate(str(ROOT/'BERICHT.pdf'),pagesize=(595.28,841.89),leftMargin=44,rightMargin=44,topMargin=40,bottomMargin=40,title='FaithPath A5.1 FINAL – Der lebendige Olivenbaum').build(story,onFirstPage=footer,onLaterPages=footer)

def archive(destination):
    destination.mkdir(parents=True,exist_ok=True)
    commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip()
    branch=subprocess.check_output(['git','branch','--show-current'],cwd=REPO,text=True).strip()
    assert branch=='feature/olive-tree-a5-1-final-living-tree'
    metadata=f'Study: FP-DESIGN-20261101-A51-FINAL-LIVING-TREE\nBranch: {branch}\nDelivery commit: {commit}\nImplementation commit: 52d9e759095982ec125bf7dbcf9cc2e60c1a3f7c\nNo app integration / no deployment.\n'
    files=sorted(p for p in ROOT.rglob('*') if p.is_file() and '__pycache__' not in str(p) and not p.name.startswith('.publishing-'))
    sha=lambda content:hashlib.sha256(content).hexdigest()
    content_map={str(file.relative_to(ROOT)):sha(file.read_bytes()) for file in files}
    content_map['GIT_COMMIT.txt']=sha(metadata.encode())
    extra={'GIT_COMMIT.txt':metadata.encode(),'PACKAGE_INTEGRITY.json':(json.dumps({'sourceCommit':commit,'files':content_map},indent=2)+'\n').encode()}
    def write_zip(filename):
        with zipfile.ZipFile(filename,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
            for name,data in sorted([(str(p.relative_to(ROOT)),p.read_bytes())for p in files]+list(extra.items())):
                info=zipfile.ZipInfo('FaithPath_Olive_A51_Final/'+name,date_time=(2026,11,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,data)
        with zipfile.ZipFile(filename)as z:assert z.testzip() is None
    a=destination/'FaithPath_Olive_A51_Final_Preview.zip';b=destination/'repeat.zip';write_zip(a);write_zip(b)
    assert a.read_bytes()==b.read_bytes();b.unlink()
    for source,name in [('BERICHT.pdf','FaithPath_A51_Abschlussbericht.pdf'),('evidence/boards/SIEBEN_STUFEN_200px.png','FaithPath_A51_Sieben_Stufen.png'),('evidence/A5_A51_VERGLEICH_35s.mp4','FaithPath_A5_A51_Vergleich_35s.mp4'),('evidence/SIEBEN_STUFEN_UND_UEBERGAENGE.mp4','FaithPath_A51_Stufenwechsel_Mobil.mp4')]:shutil.copyfile(ROOT/source,destination/name)
    (destination/'GIT_COMMIT.txt').write_text(metadata)
    report={'status':'PASS','deliveryCommit':commit,'zipSHA256':sha(a.read_bytes()),'twoArchivesByteIdentical':True,'crcVerified':True,'zipBytes':a.stat().st_size,'studyFileCount':len(content_map),'fileHashCount':len(content_map)}
    (destination/'DELIVERY_VERIFICATION.json').write_text(json.dumps(report,indent=2)+'\n')
    sums=''.join(sha(p.read_bytes())+'  '+p.name+'\n' for p in sorted(destination.iterdir())if p.is_file() and p.name!='SHA256SUMS.txt')
    (destination/'SHA256SUMS.txt').write_text(sums)
    print(json.dumps(report))

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--archive',type=Path);args=parser.parse_args()
    if args.archive:archive(args.archive)
    else:render()
