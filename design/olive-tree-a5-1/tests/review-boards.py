"""Technical review sheets only: original art resized/composited, never repainted."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'evidence' / 'boards'
OUT.mkdir(exist_ok=True)
DATA = json.loads((ROOT / 'manifest.json').read_text())
FONT = ROOT / 'assets/fonts/DMSans.ttf'
def font(size): return ImageFont.truetype(str(FONT), size)
BG = '#f3eddf'

def picture(stage, pixels=400, registered=True, old=False):
    base = ROOT.parent / 'olive-tree-v2-a5' if old else ROOT
    art = Image.open(base / f'assets/masters/stage-{stage+1}.png').convert('RGBA')
    scaled = art.resize((pixels, pixels), Image.Resampling.LANCZOS)
    if registered:
        scale = DATA['stages'][stage]['art']['scale']
        # Registered root anchor; uniform placement only. No anatomical warping.
        anchor = DATA['anchor']
        side = round(pixels * scale)
        scaled = scaled.resize((side, side), Image.Resampling.LANCZOS)
        result = Image.new('RGBA', (pixels, pixels))
        result.alpha_composite(scaled, (round((1-scale)*anchor[0]*pixels/DATA['size']), round((1-scale)*anchor[1]*pixels/DATA['size'])))
        return result
    return scaled

board = Image.new('RGB', (1880, 1220), BG)
draw = ImageDraw.Draw(board)
draw.text((50,30), 'FaithPath · Sieben Lebensbilder · A5.1', fill='#3d3b2e', font=font(44))
draw.text((50,95), 'Je Motiv: 200 CSS-Pixel bei 2× Ausgabe · registrierte Darstellung · keine Glaubensbewertung', fill='#655d4e', font=font(24))
for i in range(7):
    x, y = 50+(i%4)*450, 150+(i//4)*510
    board.paste(picture(i), (x,y), picture(i))
    label = f'{i+1} · '+['Samen','Keimling','Junger Baum','Wachsender Baum','Starker Baum','Erste Früchte','Fruchttragender Baum'][i]
    draw.text((x,y+415), label, fill='#3d3b2e', font=font(24))
draw.text((1400,1040), 'Stufe 7 bleibt der', fill='#655d4e', font=font(24))
draw.text((1400,1075), 'freigegebene A4-Master.', fill='#655d4e', font=font(24))
board.save(OUT/'SIEBEN_STUFEN_200px.png')

for source in [False, True]:
    board=Image.new('RGB',(1440,1170),BG);draw=ImageDraw.Draw(board)
    draw.text((40,25),'A5 → A5.1 · neue Form und Struktur',fill='#3d3b2e',font=font(40))
    draw.text((40,85),'Quellbilder ohne registrierte Größenanpassung' if source else 'Gleiche 200-CSS-Pixel-Rahmen · 5 / 6 / 7',fill='#655d4e',font=font(25))
    for row,old in enumerate([True,False]):
        draw.text((40,145+row*500),'A5 – bisher' if old else 'A5.1 – neu',fill='#3d3b2e',font=font(28))
        for col,i in enumerate([4,5,6]):
            art=picture(i,400,registered=not source,old=old);x=70+col*455;y=190+row*500
            board.paste(art,(x,y),art)
            draw.text((x,y+410),f'Stufe {i+1}'+(' · unverändert' if i==6 else ''),fill='#3d3b2e',font=font(24))
    board.save(OUT/('A5_A51_QUELLSTRUKTUR.png' if source else 'A5_A51_STUFEN_5_6_7.png'))
