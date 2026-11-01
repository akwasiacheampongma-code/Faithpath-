"""Technical responsive export only. Frozen artwork is never repainted.

Hash-addressed files are verified before atomic publication. A browser can never
read a half-written replacement of a previously published runtime image.
"""
from pathlib import Path
from PIL import Image,ImageChops,ImageStat
import hashlib,json,math,os,tempfile

ROOT=Path(__file__).resolve().parent
direction=json.loads((ROOT/'art-direction.json').read_text())
meanings=json.loads((ROOT/'stage-meanings.json').read_text())
names=['Samen','Keimling','Junger Olivenbaum','Wachsender Olivenbaum','Starker Olivenbaum','Erste Früchte','Fruchttragender Olivenbaum']
SIZE=1254
def sha(data):return hashlib.sha256(data).hexdigest()
def atomic(path,data):
    handle,tmp=tempfile.mkstemp(prefix='.publishing-',dir=path.parent)
    try:
        with os.fdopen(handle,'wb')as f:f.write(data)
        os.replace(tmp,path)
    finally:
        if Path(tmp).exists():Path(tmp).unlink()
stages=[];checks=[]
for art in direction['stages']:
    index=art['index'];source=ROOT/f'assets/masters/stage-{index+1}.png'
    master=Image.open(source).convert('RGBA');assert master.size==(SIZE,SIZE)
    original_sha=sha(source.read_bytes())
    if index==6:assert original_sha=='eb1294571c0b57c0ae17e7b8064d4b6e428729ea79ddbbae46fcf46578987e3d'
    variants=[]
    for width in direction['runtimeWidths']:
        # Premultiplied resize avoids bright/dark halos on translucent leaves.
        resized=master.convert('RGBa').resize((width,width),Image.Resampling.LANCZOS).convert('RGBA')
        handle,tmp=tempfile.mkstemp(suffix='.webp',dir=ROOT/'assets/runtime');os.close(handle)
        try:
            resized.save(tmp,format='WEBP',quality=direction['runtimeQuality'],alpha_quality=100,method=6,exact=True)
            data=Path(tmp).read_bytes();decoded=Image.open(tmp).convert('RGBA')
            assert decoded.size==resized.size
            assert decoded.getchannel('A').tobytes()==resized.getchannel('A').tobytes()
            # Visible premultiplied RGB, not meaningless RGB under alpha zero.
            diff=ImageChops.difference(resized.convert('RGBa'),decoded.convert('RGBa'))
            stats=ImageStat.Stat(diff);mse=sum(stats.rms[i]**2 for i in range(3))/3
            psnr=99 if mse==0 else 10*math.log10(255**2/mse)
            assert psnr>37,(index,width,psnr)
            name=f'stage-{index+1}-{width}-{sha(data)[:12]}.webp';target=ROOT/'assets/runtime'/name
            if target.exists():assert target.read_bytes()==data
            else:os.replace(tmp,target)
            variants.append({'width':width,'src':str(target.relative_to(ROOT)),'bytes':len(data),'sha256':sha(data)})
            checks.append({'stage':index,'width':width,'premultipliedRGBPSNR':psnr,'alphaExact':True})
        finally:
            if Path(tmp).exists():Path(tmp).unlink()
    stages.append({'index':index,'name':names[index],'meaning':meanings[index],'art':art,'source':str(source.relative_to(ROOT)),'sourceSHA256':original_sha,'variants':variants})
manifest={'study':direction['study'],'baseCommit':direction['baseCommit'],'size':SIZE,'anchor':direction['anchor'],'stages':stages,'growthThresholdsUnchanged':[0,1,2,'3–4','5–6','7–9','10+ explicitly confirmed'],'art7Unchanged':True,'appIntegrationApproved':False,'runtimeOnly':[v['src']for s in stages for v in s['variants']]}
atomic(ROOT/'manifest.json',(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n').encode())
atomic(ROOT/'stage-data.js',('export const STUDY = '+json.dumps(manifest,ensure_ascii=False,indent=2)+';\n').encode())
atomic(ROOT/'runtime-allowlist.json',(json.dumps(manifest['runtimeOnly'],indent=2)+'\n').encode())
atomic(ROOT/'evidence/asset-quality.json',(json.dumps({'lossyRGB':'WebP quality94; source PNG unchanged','alphaLossless':True,'atomicImmutablePublication':True,'checks':checks,'allRuntimeBytes':sum(v['bytes']for s in stages for v in s['variants'])},indent=2)+'\n').encode())
print(json.dumps({'stages':7,'variants':len(checks),'runtimeBytes':sum(v['bytes']for s in stages for v in s['variants']),'minimumPSNR':min(x['premultipliedRGBPSNR']for x in checks)}))
