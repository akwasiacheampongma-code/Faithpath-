"""Deterministic technical export only: resize/encode; no painted retouching.

Original generated PNGs stay untouched. Common soil baseline is a presentation
alignment, not a claim that silhouettes are registered for a growth morph.
Run from the repository root: python design/olive-tree-v2/export-assets.py
"""
from pathlib import Path
from PIL import Image
import hashlib, json

ROOT = Path(__file__).resolve().parent
slugs = ['01-samen', '02-keimling', '03-junger-baum', '04-wachsender-baum',
         '05-starker-baum', '06-erste-fruechte', '07-fruchttragender-baum']
names = ['Samen', 'Keimling', 'Junger Olivenbaum', 'Wachsender Olivenbaum',
         'Starker Olivenbaum', 'Erste Früchte', 'Fruchttragender Olivenbaum']
heights = [0.40, 0.59, 0.70, 0.81, 0.88, 0.88, 0.88]
meanings = json.loads((ROOT/'stage-meanings.json').read_text())
stages = []
for i, slug in enumerate(slugs):
    source = ROOT/'assets/masters'/f'{slug}.png'
    im = Image.open(source).convert('RGBA')
    # Ignore only near-invisible alpha dust when determining the export box.
    box = im.getchannel('A').point(lambda x: 255 if x >= 16 else 0).getbbox()
    cropped = im.crop(box)
    exports = {}
    for size in [512, 1024]:
        ratio = min(size*0.90/cropped.width, size*heights[i]/cropped.height)
        scaled = cropped.resize((round(cropped.width*ratio), round(cropped.height*ratio)), Image.Resampling.LANCZOS)
        canvas = Image.new('RGBA', (size,size))
        canvas.alpha_composite(scaled, ((size-scaled.width)//2, round(size*0.94)-scaled.height))
        dest = ROOT/'assets/web'/f'{slug}-{size}.webp'
        dest.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(dest, 'WEBP', quality=88, method=6, exact=True)
        exports[str(size)] = {'path': str(dest.relative_to(ROOT)), 'bytes': dest.stat().st_size,
            'sha256': hashlib.sha256(dest.read_bytes()).hexdigest()}
    stages.append({'index':i, 'name':names[i], 'meaning':meanings[i],
        'opticalCloseUp':i < 2, 'heightRatio':heights[i], 'soilBaseline':0.94,
        'source':str(source.relative_to(ROOT)), 'sourceSize':list(im.size),
        'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
        'exports':exports})
manifest = {'study':'FP-DESIGN-20261029-OLIVE-V2-A', 'integrationApproved':False,
    'alpha':'RGBA, generated backgrounds transparent',
    'registration':'Common soil baseline only; NOT ready for a silhouette morph.',
    'stages':stages}
(ROOT/'asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(ROOT/'stage-data.js').write_text('window.OLIVE_STUDY = '+json.dumps(manifest,ensure_ascii=False,indent=2)+';\n')
print(json.dumps({'stages':len(stages),'webBytes':sum(x['bytes'] for s in stages for x in s['exports'].values())}))
