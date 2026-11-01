"""Technical only: split complete source images and encode lossless local WebP."""
from pathlib import Path
from PIL import Image,ImageChops
import json,hashlib
R=Path(__file__).resolve().parent
names=['Samen','Keimling','Junger Olivenbaum','Wachsender Olivenbaum','Starker Olivenbaum','Erste Früchte','Fruchttragender Olivenbaum']
meanings=json.loads((R/'stage-meanings.json').read_text());stages=[]
for index in range(7):
 f=R/f'assets/masters/stage-{index+1}.png';im=Image.open(f).convert('RGBA');assert im.size==(1254,1254)
 split=1180 if index==0 else 900
 paths={}
 for key,start,end in [('upper',0,split),('base',split,1254),('full',0,1254)]:
  out=Image.new('RGBA',im.size);out.paste(im.crop((0,start,1254,end)),(0,start));relative=f'assets/runtime/stage-{index+1}-{key}.webp';out.save(R/relative,lossless=True,quality=100,method=6,exact=True)
  decoded=Image.open(R/relative).convert('RGBA');assert decoded.getchannel('A').tobytes()==out.getchannel('A').tobytes()
  assert decoded.tobytes()==out.tobytes(),'lossless RGBA mismatch'
  paths[key]=relative
 stages.append({'index':index,'name':names[index],'meaning':meanings[index],'master':str(f.relative_to(R)),'runtime':paths,'splitY':split,'sourceSha256':hashlib.sha256(f.read_bytes()).hexdigest(),'sourceBytes':f.stat().st_size,'runtimeBytes':sum((R/x).stat().st_size for x in paths.values()),'opticalCloseUp':index<2})
assert stages[6]['sourceSha256']=='eb1294571c0b57c0ae17e7b8064d4b6e428729ea79ddbbae46fcf46578987e3d'
manifest={'study':'FP-DESIGN-20261101-OLIVE-LIVING-SEVEN','baseCommit':'c66edb0ff2fdd7a81c96713e5cd25488790f6636','master7Approved':True,'seriesAndMotionApproval':'PENDING','appIntegrationApproved':False,'size':1254,'stages':stages,'growthThresholdsUnchanged':[0,1,2,'3–4','5–6','7–9','10+ explicitly confirmed developments'],'productDataModified':False}
(R/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');(R/'stage-data.js').write_text('export const STUDY = '+json.dumps(manifest,ensure_ascii=False,indent=2)+';\n')
print(json.dumps({'stages':len(stages),'master7ByteIdentical':True,'originalPNGBytes':sum(s['sourceBytes']for s in stages),'losslessRuntimeBytesIncludingFallbacks':sum(s['runtimeBytes']for s in stages)}))
