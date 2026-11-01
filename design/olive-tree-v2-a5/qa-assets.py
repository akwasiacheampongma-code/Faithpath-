"""Art bytes and protected repository contracts, not an aesthetic score."""
import hashlib,json,subprocess
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parent.parent
BASE='c66edb0ff2fdd7a81c96713e5cd25488790f6636'
manifest=json.loads((ROOT/'manifest.json').read_text())
rows=[]
for stage in manifest['stages']:
    source=ROOT/stage['master'];original=Image.open(source).convert('RGBA')
    assert original.size==(1254,1254)
    assert hashlib.sha256(source.read_bytes()).hexdigest()==stage['sourceSha256']
    full=Image.open(ROOT/stage['runtime']['full']).convert('RGBA')
    upper=Image.open(ROOT/stage['runtime']['upper']).convert('RGBA')
    base=Image.open(ROOT/stage['runtime']['base']).convert('RGBA')
    assert full.tobytes()==original.tobytes()
    # Plates use the exact same coordinates, no resampling or alpha repaint.
    composite=upper.copy();composite.paste(base.crop((0,stage['splitY'],1254,1254)),(0,stage['splitY']))
    assert composite.tobytes()==original.tobytes()
    alpha=original.getchannel('A')
    borders=[alpha.crop(box) for box in [(0,0,1,1254),(1253,0,1254,1254),(0,0,1254,1),(0,1253,1254,1254)]]
    opaque=[sum(v>=128 for v in border.getdata()) for border in borders]
    assert opaque==[0,0,0,0]
    rows.append({'stage':stage['index'],'sha256':stage['sourceSha256'],'fullRGBAIdentical':True,'platesRGBAIdentical':True,'opaqueBorderPixels':opaque,'sourceBytes':source.stat().st_size,'runtimeBytes':stage['runtimeBytes']})
assert rows[6]['sha256']=='eb1294571c0b57c0ae17e7b8064d4b6e428729ea79ddbbae46fcf46578987e3d'
assert (ROOT/'stage-meanings.json').read_bytes()==(REPO/'design/olive-tree-v2-a3/stage-meanings.json').read_bytes()
unchanged=0;changed=[]
tree=subprocess.check_output(['git','ls-tree','-r','-z',BASE],cwd=REPO).split(b'\0')
for entry in tree:
    if not entry:continue
    meta,name=entry.split(b'\t',1);mode,kind,oid=meta.decode().split();file=REPO/name.decode()
    data=str(file.readlink()).encode() if mode=='120000' else file.read_bytes()
    current=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
    if current!=oid:changed.append(name.decode())
    else:unchanged+=1
assert not changed,changed
report={'baseCommit':BASE,'approvedMaster7ByteIdentical':True,'allPriorTrackedFilesUnchanged':True,'priorTrackedFileCount':unchanged,'changedPriorFiles':changed,'meaningsByteIdentical':True,'schemaV5Changed':False,'thresholdsChanged':False,'thresholds':[0,1,2,'3–4','5–6','7–9','10+ explicitly confirmed'],'stages':rows}
(ROOT/'evidence/integrity.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'priorFilesUnchanged':unchanged,'stages':len(rows),'master7Unchanged':True}))
