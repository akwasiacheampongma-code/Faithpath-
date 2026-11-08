"""Decode actual shipped PNGs and verify rest-pose fidelity, not metadata alone."""
import hashlib,json
from pathlib import Path
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1]
metadata=json.loads((root/'art/a51/native-derivatives.json').read_text())
results=[]
for group in metadata['groups']:
    n=group['resolution']
    source=Image.open(root/f'art/a51/masters/stage-{group["stage"]+1}.png').convert('RGBA').resize((n,n),Image.Resampling.LANCZOS)
    expected=np.asarray(source).astype(np.float32)/255
    output=np.zeros((n,n,4),np.float32)
    for part in group['layers'] or [group['full']]:
        raw=(root/part['file']).read_bytes()
        assert hashlib.sha256(raw).hexdigest()==part['sha256']
        image=np.asarray(Image.open(root/part['file']).convert('RGBA')).astype(np.float32)/255
        y,x=part['y'],part['x'];target=output[y:y+part['height'],x:x+part['width']]
        alpha=image[:,:,3:4]
        target[:,:,:3]=image[:,:,:3]*alpha+target[:,:,:3]*(1-alpha)
        target[:,:,3:4]=alpha+target[:,:,3:4]*(1-alpha)
    alpha_error=float(np.abs(output[:,:,3]-expected[:,:,3]).max()*255)
    rgb_error=float(np.abs(output[:,:,:3]-expected[:,:,:3]*expected[:,:,3:4]).max()*255)
    assert alpha_error<=1 and rgb_error<=1.01,(group['stage'],alpha_error,rgb_error)
    results.append({'stage':group['stage'],'resolution':n,'alphaMaxError8Bit':round(alpha_error,6),'premultipliedRgbMaxError8Bit':round(rgb_error,6)})
report={'method':'Actual PNG decode and source-over composition against resized original PNG masters; no native simulator/device rendering.','groups':results,'passed':len(results),'deviceTest':False,'simulatorTest':False}
out=root/'docs/evidence/a51/native-rest-fidelity.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'groupsPassed':len(results),'maximumAlphaError8Bit':max(r['alphaMaxError8Bit'] for r in results),'maximumRgbError8Bit':max(r['premultipliedRgbMaxError8Bit'] for r in results),'nativeDeviceTest':False}))
