#!/usr/bin/env python3
"""Collect actual browser captures and make a self-contained evidence gallery/PDF."""
import html,json,re,shutil,subprocess
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,Image,Table,TableStyle,PageBreak,KeepTogether

proof=Path('qa-output/first-seed/final');out=Path('reports/first-seed');screens=out/'screenshots';screens.mkdir(parents=True,exist_ok=True)
receipt=json.loads(Path('qa-output/first-seed/release8-a/release-integrity.json').read_text())
for group in ['flow','onboarding','visual','art','motion','update']:
 src=proof/group
 assert (src/'results.json').is_file(),f'Unfinished capture group: {group}'
 dest=screens/group;dest.mkdir(exist_ok=True)
 for p in sorted(src.glob('*.png')):shutil.copy2(p,dest/p.name)
video=out/'video';video.mkdir(exist_ok=True)
for i,p in enumerate(sorted((proof/'motion/video').glob('*.webm'))):
 target=video/f'Pflanzen-Browseraufnahme-{i+1}.webm';shutil.copy2(p,target)
 # Same recorded frames, no synthetic animation: H.264 companion for iPhone playback.
 subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(target),'-c:v','libx264','-crf','24','-pix_fmt','yuv420p','-an','-movflags','+faststart',str(target.with_suffix('.mp4'))],check=True)
def fig(path,label):
 return f'<figure><a href="screenshots/{path}"><img src="screenshots/{path}" loading="lazy" alt="{html.escape(label)}"></a><figcaption>{html.escape(label)}</figcaption></figure>'
sections=[]
flowtitles=['Erster freiwilliger Einstieg','Die eigene Geschichte verstehen','Anliegen auswählen oder selbst formulieren','Unveränderter vorhandener Bibeltext','Eigene Worte als Gebet','Ein kleiner konkreter Schritt','Den wirklichen Weg prüfen','Symbolisch pflanzen','Keimen ohne automatische Baumstufe','Im tatsächlich gespeicherten Weg fortsetzen']
sections.append(('Ablauf',''.join(fig('flow/'+p.name,t) for p,t in zip(sorted((screens/'flow').glob('*.png')),flowtitles))))
compare=''
for width in [320,390]:
 for route,label in [('today','Heute'),('paths','Mein Weg'),('tree','Olivenbaum')]:
  compare+=fig(f'art/{route}-night-{width}-before.png',f'VORHER · MAINT1 · {label} · {width}px · gleiche synthetische Daten')
  compare+=fig(f'art/{route}-night-{width}-after.png',f'NACHHER · FIRSTSEED1 · {label} · {width}px · gleiche synthetische Daten')
sections.append(('Vorher und nachher',compare))
sections.append(('Letzte visuelle Korrektur',fig('diagnostics/halo-before-source7-night-390.png','Vor letzter Korrektur · source7 · rechteckig beschnittener Lichthof')+fig('visual/today-empty-night-390-100.png','Finaler Kandidat · Lichthof innerhalb der Nahansicht vollständig ausgeblendet')))
names=['Samen','Keimling','Junger Baum','Wachsender Baum','Starker Baum','Erste Früchte','Fruchttragender Baum']
sections.append(('Sieben Stufen', ''.join(fig(f'art/stage-{stage}-{theme}.png',f'{names[stage]} · {theme} · isolierte Grafik') for theme in ['light','paper','atmospheric','night'] for stage in range(7))))
sections.append(('Mobile und große Schrift',''.join(fig('onboarding/'+p.name,p.stem) for p in sorted((screens/'onboarding').glob('*.png')))))
sections.append(('Alle Baumansichten',''.join(fig('visual/'+p.name,p.stem) for p in sorted((screens/'visual').glob('*.png')))))
buttons=''.join(f'<a href="#section-{i}">{name}</a>' for i,(name,_) in enumerate(sections))
body=''.join(f'<section id="section-{i}"><h2>{name}</h2><div class="grid">{content}</div></section>' for i,(name,content) in enumerate(sections))
videos=''.join(f'<video controls playsinline preload="metadata" aria-label="Echte Browseraufnahme der Pflanzsequenz"><source src="video/{p.with_suffix(".mp4").name}" type="video/mp4"><source src="video/{p.name}" type="video/webm"></video>' for p in sorted(video.glob('*.webm')))
(out/'Vergleich.html').write_text('''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FaithPath · Erster Samen · echte Browsernachweise</title><style>
:root{color-scheme:light;font-family:system-ui,sans-serif;color:#233c33;background:#f7f7f0}body{margin:0;padding:clamp(16px,4vw,56px)}h1{font:clamp(2rem,5vw,3.5rem)/1.1 Georgia,serif;max-width:22ch}p{max-width:80ch;line-height:1.65}a{color:#254d3b}nav{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0}nav a{padding:12px;border:1px solid #7e8c7d;border-radius:6px}section{scroll-margin-top:16px;margin:48px 0}h2{font:2rem Georgia,serif}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:24px}figure{margin:0;background:white;border:1px solid #bdc5b7;border-radius:8px;padding:12px}figure img{display:block;max-width:100%;width:100%;height:600px;object-fit:contain;object-position:top}figcaption{line-height:1.5;margin-top:12px;overflow-wrap:anywhere}a:focus-visible,video:focus-visible{outline:3px solid #6b5010;outline-offset:4px}video{max-width:390px;width:100%;border:1px solid #7e8c7d}code{overflow-wrap:anywhere}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
</style><header><p>FAITHPATH · NUTZERFÜHRUNG UND LEBENDIGER OLIVENBAUM</p><h1>Eine persönliche Geschichte beginnt.</h1><p>Echte Browser-Screenshots mit ausschließlich synthetischen Daten. Dies ist eine Beleggalerie, keine zweite App. Ein Bild anklicken, um die vollständige PNG-Datei zu öffnen.</p><p><strong>CONDITIONAL GO für Nutzer- und Geräteabnahme.</strong> Die Zielwerte des Zehn-Personen-Tests und physische iPhone-/Safari-/VoiceOver-Tests sind OFFEN. CSS-Textskalierung ist keine echte Dynamic-Type-Prüfung.</p><p>Appcommit <code>'''+receipt['source_commit']+'</code><br>Build <code>'+receipt['build']+'</code></p><p><a href="Bericht.pdf">Vollständiger Bericht als PDF</a> · <a href="UX_TESTPLAN.md">UX-Testplan</a> · <a href="UX_Testbogen_10_Personen.xlsx">Zehn Teilnehmerbögen</a></p></header><nav aria-label="Nachweise">'+buttons+'</nav><section><h2>Animation in der tatsächlichen App</h2><p>Aufgezeichnete Browserbedienung mit synthetischen Daten. Kein automatischer Videostart. Wiederholen ist freiwillig; Reduced Motion wurde getrennt geprüft.</p>'+videos+'</section>'+body+'</html>',encoding='utf8')

fontroot=Path('/usr/share/fonts/truetype/dejavu')
pdfmetrics.registerFont(TTFont('FP',str(fontroot/'DejaVuSans.ttf')));pdfmetrics.registerFont(TTFont('FP-Bold',str(fontroot/'DejaVuSans-Bold.ttf')))
pdfmetrics.registerFontFamily('FP',normal='FP',bold='FP-Bold',italic='FP',boldItalic='FP-Bold')
styles=getSampleStyleSheet()
for n in ['Normal','BodyText','Heading1','Heading2','Heading3','Title']:
 styles[n].fontName='FP';styles[n].textColor=colors.HexColor('#233c33')
styles['Normal'].fontSize=9;styles['Normal'].leading=14;styles['Normal'].spaceAfter=7
styles['Heading1'].fontSize=20;styles['Heading1'].leading=26
styles['Heading2'].fontSize=15;styles['Heading2'].leading=20
styles['Heading3'].fontSize=11;styles['Heading3'].leading=16
small=ParagraphStyle('Small',parent=styles['Normal'],fontSize=7,leading=10,wordWrap='CJK')
story=[];lines=(out/'IMPLEMENTIERUNG.md').read_text().splitlines();buffer=[];table=[]
def para(s,style='Normal'):return Paragraph(html.escape(s).replace('**',''),styles[style] if isinstance(style,str) else style)
def flush():
 if buffer:story.append(para(' '.join(buffer)));buffer.clear()
def flush_table():
 if not table:return
 rows=[[para(c,small) for c in row] for row in table];cols=max(map(len,table));width=(174*mm)/cols
 tab=Table(rows,colWidths=[width]*cols,repeatRows=1,hAlign='LEFT');tab.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e6ebdf')),('VALIGN',(0,0),(-1,-1),'TOP'),('BOX',(0,0),(-1,-1),.5,colors.HexColor('#a4b29f')),('INNERGRID',(0,0),(-1,-1),.25,colors.HexColor('#c4cbbd')),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]));story.extend([tab,Spacer(1,12)]);table.clear()
for line in lines+['']:
 if line.startswith('|'):
  flush()
  if not re.match(r'^\|[\s|:\-]+$',line):table.append([x.strip() for x in line.strip('|').split('|')])
  continue
 flush_table()
 if line.startswith('#'):
  flush();level=len(line)-len(line.lstrip('#'));story.append(para(line.lstrip('# ').strip(),f'Heading{min(level,3)}'))
 elif not line.strip():flush()
 elif re.match(r'^(\d+\. |\- )',line):flush();story.append(para(line))
 else:buffer.append(line)
story.append(PageBreak());story.append(para('Ausgewählte echte Browserbilder','Heading1'));story.append(para('Alle Originale und vier Themes sind in Vergleich.html enthalten. Die Bilder hier sind verkleinerte Dokumentationsansichten.'))
chosen=[('flow/01-welcome.png','Freiwilliger Einstieg'),('flow/02-own-story.png','Die Geschichte verstehen'),('flow/04-scripture.png','Vorhandene Bibelgedanken'),('flow/07-review.png','Zusammenhängender echter Weg'),('art/today-night-390-before.png','Heute vorher · MAINT1'),('art/today-night-390-after.png','Heute nachher · FIRSTSEED1')]
for i in range(0,len(chosen),2):
 cells=[]
 for file,label in chosen[i:i+2]:
  img=Image(str(screens/file));factor=min(78*mm/img.imageWidth,168*mm/img.imageHeight);img.drawWidth=img.imageWidth*factor;img.drawHeight=img.imageHeight*factor;cells.append([para(label,'Heading3'),img])
 story.append(Table([cells],colWidths=[87*mm]*len(cells),style=[('VALIGN',(0,0),(-1,-1),'TOP')]));story.append(PageBreak())
story.append(para('Sieben originale Darstellungen · unveränderte Regeln','Heading1'))
for stage,name in enumerate(names):
 img=Image(str(screens/f'art/stage-{stage}-light.png'));factor=min(65*mm/img.imageWidth,60*mm/img.imageHeight);img.drawWidth=img.imageWidth*factor;img.drawHeight=img.imageHeight*factor
 story.append(KeepTogether([para(name,'Heading3'),img,Spacer(1,10)]))
def footer(canvas,doc):
 canvas.setFont('FP',7);canvas.setFillColor(colors.HexColor('#536653'));canvas.drawString(18*mm,12*mm,'FaithPath FIRSTSEED1 · synthetische QA · keine Produktionsfreigabe');canvas.drawRightString(192*mm,12*mm,str(doc.page))
SimpleDocTemplate(str(out/'Bericht.pdf'),pagesize=(210*mm,297*mm),rightMargin=18*mm,leftMargin=18*mm,topMargin=18*mm,bottomMargin=20*mm,title='FaithPath – Erster Samen – Implementierung und QA',author='FaithPath QA').build(story,onFirstPage=footer,onLaterPages=footer)
print(json.dumps({'screenshots':len(list(screens.rglob('*.png'))),'videos':len(list(video.glob('*.webm'))),'pdfBytes':(out/'Bericht.pdf').stat().st_size}))
