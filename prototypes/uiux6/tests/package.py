"""Deterministic static-gallery packaging; no production build or deployment."""
from pathlib import Path
import hashlib,json,zipfile,sys
root=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
files=sorted(p for p in root.rglob('*') if p.is_file() and p.name not in {'MANIFEST.json','SHA256SUMS.txt'} and '__pycache__' not in p.parts)
manifest={'build_id':json.loads((root/'BUILD.json').read_text())['build_id'],'files':{p.relative_to(root).as_posix():sha(p) for p in files},'excludes':['MANIFEST.json','SHA256SUMS.txt'],'reason':'avoid circular self-hashes; SHA256SUMS also authenticates MANIFEST.json'}
(root/'MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
all_files=sorted(files+[root/'MANIFEST.json'])
(root/'SHA256SUMS.txt').write_text(''.join(f'{sha(p)}  {p.relative_to(root).as_posix()}\n' for p in all_files))
all_files=sorted(all_files+[root/'SHA256SUMS.txt'])
out=Path(sys.argv[1]);out.parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in all_files:
  info=zipfile.ZipInfo(p.relative_to(root).as_posix(),date_time=(2026,10,17,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
with zipfile.ZipFile(out) as z:assert z.testzip() is None;assert 'index.html' in z.namelist()
print(json.dumps({'zip':str(out),'sha256':sha(out),'bytes':out.stat().st_size,'files':len(all_files),'crc':'PASS'}))
