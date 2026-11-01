"""Lossless technical plate split; no repaint, geometry fitting or color correction."""
from pathlib import Path
from PIL import Image
import hashlib,json
R=Path(__file__).resolve().parent
src=R/'assets/masters/lichtkrone-a4.png';im=Image.open(src).convert('RGBA');assert im.size==(1254,1254)
SPLIT=900
for name,start,end in [('K-continuous-crown-and-upper-wood.png',0,SPLIT),('B-roots-and-lower-trunk.png',SPLIT,1254)]:
 out=Image.new('RGBA',im.size);out.paste(im.crop((0,start,1254,end)),(0,start));out.save(R/'assets/layers'/name,optimize=True)
a=Image.open(R/'assets/layers/B-roots-and-lower-trunk.png');b=Image.open(R/'assets/layers/K-continuous-crown-and-upper-wood.png');composed=Image.alpha_composite(a,b)
for original,result in zip(im.get_flattened_data(),composed.get_flattened_data()):
 assert original[3]==result[3]
 if original[3]:assert original==result
manifest={'study':'FP-DESIGN-20261031-OLIVE-V2-A4','baseCommit':'18e9f1f1f644045fa76240bc12a342412bab99df','stage':7,'artApproval':'PENDING_USER_DECISION','artRecommendation':'READY_FOR_MASTER_DESIGN_DECISION','productionReady':False,'phaseBStarted':False,'size':1254,'master':'assets/masters/lichtkrone-a4.png','splitY':SPLIT,'layers':[{'id':'B','file':'assets/layers/B-roots-and-lower-trunk.png','content':'roots, ground and lower trunk, y>=900','motion':'static'},{'id':'K','file':'assets/layers/K-continuous-crown-and-upper-wood.png','content':'one unified crown, fruit and upper structural wood, y<900','motion':'continuous local leaf-tip field; structural wood weights are zero'}],'fruits':'painted in their actual twigs in K; no independent fruit stamp or sprite','growthRulesChanged':False,'otherStagesModified':False,'rawSourceSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'restRecomposition':'exact visible RGBA, original canvas, no global fitting','generation':'one ImageGen retouch of supplied A.2 master; no independently generated crown parts','limitations':['1254px raster, not a vector illustration','not an individually articulated leaf or skeletal rig','design decision open; no app integration authorized']}
for v in manifest['layers']:v['sha256']=hashlib.sha256((R/v['file']).read_bytes()).hexdigest()
(R/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'status':'PASS','canvas':im.size,'splitY':SPLIT,'visibleRestRecomposition':'exact','layers':2}))
