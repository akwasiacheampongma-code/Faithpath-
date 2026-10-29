"""Technical resampling only, no retouching, warping or independent stage fitting.

Stages 3–7 retain the entire common source canvas and the same 4% padding.
Thus half-opacity overlays expose actual geometric drift rather than hide it.
"""
from pathlib import Path
from PIL import Image
import json,hashlib
ROOT=Path(__file__).resolve().parent
slugs=['01-samen','02-keimling','03-junger-baum','04-wachsender-baum','05-starker-baum','06-erste-fruechte','07-fruchttragender-baum']
names=['Samen','Keimling','Junger Olivenbaum','Wachsender Olivenbaum','Starker Olivenbaum','Erste Früchte','Fruchttragender Olivenbaum']
meanings=json.loads((ROOT/'stage-meanings.json').read_text())
def export(slug, source_slug=None):
    source=ROOT/'assets/masters'/f'{source_slug or slug}.png'; im=Image.open(source).convert('RGBA')
    out={}
    for size in [512,1024]:
        # One identical transform for every complete source canvas. No crop.
        canvas=Image.new('RGBA',(size,size)); extent=round(size*.92)
        scaled=im.resize((extent,extent),Image.Resampling.LANCZOS)
        canvas.alpha_composite(scaled,((size-extent)//2,(size-extent)//2))
        dest=ROOT/'assets/web'/f'{slug}-{size}.webp';dest.parent.mkdir(exist_ok=True,parents=True)
        canvas.save(dest,'WEBP',quality=90,method=6,exact=True)
        out[str(size)]={'path':dest.relative_to(ROOT).as_posix(),'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}
    return {'source':source.relative_to(ROOT).as_posix(),'sourceSize':list(im.size),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'exports':out}
stages=[{'index':i,'name':names[i],'meaning':meanings[i],'opticalCloseUp':i<2,**export(slug,'master-lichtkrone' if i==6 else None)} for i,slug in enumerate(slugs)]
masters={'windform':export('master-windform'),'lichtkrone':{k:stages[6][k] for k in ['source','sourceSize','sourceSha256','exports']}}
manifest={'study':'FP-DESIGN-20261029-OLIVE-V2-A2','approval':'PENDING','workingDirection':'lichtkrone','selectedBy':'Art-direction working choice only; NOT user approval.','registration':'Same complete source canvas, 0.92 uniform scale plus 4% padding for EVERY image. No nonuniform warps, no per-stage fitting. Residual geometric differences remain visible.','stages':stages,'masters':masters}
(ROOT/'asset-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(ROOT/'stage-data.js').write_text('window.OLIVE_STUDY = '+json.dumps(manifest,ensure_ascii=False,indent=2)+';\n')
print(json.dumps({'stages':len(stages),'masters':len(masters)}))
