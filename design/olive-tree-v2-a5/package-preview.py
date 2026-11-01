"""Deterministic local handoff archive. Does not build/publish the real app."""
from pathlib import Path
import hashlib,json,shutil,subprocess,zipfile
R=Path(__file__).resolve().parent
REPO=R.parent.parent
OUT=Path('/workspace/artifacts/faithpath-olive-living-seven-20261101');OUT.mkdir(parents=True,exist_ok=True)
branch=subprocess.check_output(['git','branch','--show-current'],cwd=REPO,text=True).strip()
commit=subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip()
assert branch=='feature/olive-tree-continuous-seven-stages-20261101'
assert not subprocess.check_output(['git','status','--porcelain'],cwd=REPO,text=True).strip(),'Commit the finished preview before packaging.'
info={'repository':'akwasiacheampongma-code/Faithpath-','branch':branch,'deliveryCommit':commit,'implementationCommit':'1e53a1292ba7d1cea135ac56e59e2803b3782ceb','baseCommit':'c66edb0ff2fdd7a81c96713e5cd25488790f6636','study':'FP-DESIGN-20261101-OLIVE-LIVING-SEVEN','productionBuild':False,'deployed':False,'appIntegrationApproved':False,'physicalIPhoneGate':'OPEN'}
payload={str(p.relative_to(R)):p.read_bytes() for p in sorted(R.rglob('*')) if p.is_file() and '__pycache__' not in p.parts}
payload['BUILD_INFO.json']=(json.dumps(info,indent=2)+'\n').encode()
hashes={name:hashlib.sha256(data).hexdigest() for name,data in sorted(payload.items())}
payload['CONTENTS_SHA256.json']=(json.dumps({'algorithm':'SHA-256','scope':'Every archived file except this manifest itself; outer ZIP SHA covers the manifest.','files':hashes},indent=2)+'\n').encode()
archive=OUT/'FaithPath_Lichtkrone_Daueranimation_7_Stufen.zip'
def write(target):
 with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for name,data in sorted(payload.items()):
   i=zipfile.ZipInfo('FaithPath_Lichtkrone_Daueranimation/'+name,date_time=(2026,11,1,0,0,0));i.create_system=3;i.external_attr=0o100644<<16;i.compress_type=zipfile.ZIP_DEFLATED;z.writestr(i,data,compresslevel=9)
write(archive);verification=OUT/'_repro_check.zip';write(verification)
assert archive.read_bytes()==verification.read_bytes();verification.unlink()
with zipfile.ZipFile(archive) as z:
 assert z.testzip() is None
 assert len(z.infolist())==len(payload)
 for name,data in payload.items():assert z.read('FaithPath_Lichtkrone_Daueranimation/'+name)==data
sha=hashlib.sha256(archive.read_bytes()).hexdigest();(OUT/(archive.name+'.sha256')).write_text(sha+'  '+archive.name+'\n')
for source,name in [('DESIGNABNAHME.pdf','FaithPath_Lichtkrone_Designabnahme.pdf'),('evidence/VERGLEICH_BEWEGUNG.mp4','FaithPath_Bewegung_Alt_Neu.mp4'),('evidence/MOBIL_LEBENDIG.mp4','FaithPath_Mobile_Dauerbewegung.mp4'),('evidence/screenshots/SIEBEN_STUFEN_200.png','FaithPath_Sieben_Stufen.png'),('evidence/screenshots/LETZTE_DREI_200.png','FaithPath_Stufen_5_6_7.png')]:
 shutil.copyfile(R/source,OUT/name);assert (OUT/name).read_bytes()==(R/source).read_bytes()
info.update({'zip':archive.name,'zipBytes':archive.stat().st_size,'zipSHA256':sha,'archiveEntries':len(payload),'reproducedByteIdentically':True,'crcAndAllPayloadBytesVerified':True})
(OUT/'DELIVERY.json').write_text(json.dumps(info,indent=2)+'\n')
(OUT/'DELIVERY.md').write_text(f'''# FaithPath · Lichtkrone · Designvorschau\n\nBranch: `{branch}`\n\nLiefercommit: `{commit}`\n\nGeprüfter Implementierungscommit: `1e53a1292ba7d1cea135ac56e59e2803b3782ceb`\n\nZIP-SHA-256: `{sha}`\n\nZwei bytegleiche ZIP-Erstellungen; CRC und jeder enthaltene Dateiinhalt geprüft. `{len(payload)}` Dateien. Nach dem Entpacken `START_HIER.html` öffnen. Die interaktive WebGL-Galerie benötigt den im README beschriebenen lokalen HTTP-Server. Videos, PNGs und PDF sind direkt aufrufbar.\n\nDies ist kein FaithPath-Produktionsbuild. Kein Deployment, kein Merge, keine App-Integration. Echte iPhone-/Safari-/VoiceOver- und Akkutests bleiben offen. STOP zur ausdrücklichen Freigabe.\n''')
print(json.dumps(info))
