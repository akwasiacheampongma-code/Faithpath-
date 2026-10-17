"""Deterministic archives, no deployment. Paths are explicit and never read user data."""
from pathlib import Path
import hashlib,json,zipfile,sys

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def package(root,destination):
    root=Path(root);destination=Path(destination)
    destination.parent.mkdir(parents=True,exist_ok=True)
    files=sorted(p for p in root.rglob('*') if p.is_file())
    with zipfile.ZipFile(destination,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for p in files:
            info=zipfile.ZipInfo(p.relative_to(root).as_posix(),date_time=(2026,10,17,0,0,0))
            info.external_attr=0o100644<<16;info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,p.read_bytes(),compress_type=zipfile.ZIP_DEFLATED,compresslevel=9)
    with zipfile.ZipFile(destination) as z:
        assert z.testzip() is None
        assert set(z.namelist())=={p.relative_to(root).as_posix() for p in files}
        for p in files:assert z.read(p.relative_to(root).as_posix())==p.read_bytes()
    return dict(file=destination.name,sha256=sha(destination),files=len(files),bytes=destination.stat().st_size)
if __name__=='__main__':
    if len(sys.argv)!=3:raise SystemExit('Usage: python3 scripts/package-uiux6b.py ROOT ZIP')
    result=package(sys.argv[1],sys.argv[2]);repeat=Path(sys.argv[2]+'.repeat')
    assert result['sha256']==package(sys.argv[1],repeat)['sha256'],'Non-reproducible ZIP'
    repeat.unlink();print(json.dumps({**result,'twoArchivesIdentical':True,'allExtractedBytesVerified':True}))
