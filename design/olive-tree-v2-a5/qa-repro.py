"""Re-encode the frozen art inputs once and compare to the first export."""
import hashlib,json,subprocess,sys,platform
from pathlib import Path
from PIL import __version__ as pillow_version,features
root=Path(__file__).resolve().parent
files=[*sorted((root/'assets/runtime').glob('*.webp')),root/'manifest.json',root/'stage-data.js']
digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
before={str(p.relative_to(root)):digest(p) for p in files}
result=subprocess.run([sys.executable,str(root/'export-assets.py')],capture_output=True,text=True,check=True)
after={str(p.relative_to(root)):digest(p) for p in files}
assert before==after
report={'reproducible':True,'comparedFiles':len(files),'method':'Second lossless runtime export from fixed PNG masters compared byte-for-byte by SHA-256 with first export. Image generation itself is not claimed deterministic.','python':platform.python_version(),'pillow':pillow_version,'libwebp':features.version('webp'),'sha256':after,'exportSummary':json.loads(result.stdout)}
(root/'evidence/reproducibility.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'reproducible':True,'files':len(files)}))
