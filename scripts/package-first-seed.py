#!/usr/bin/env python3
"""Package only a proved candidate. No network, deploy, Git mutation or user data."""
import argparse, hashlib, json, re, shutil, subprocess, zipfile
from pathlib import Path

parser=argparse.ArgumentParser();parser.add_argument('--build',default='qa-output/first-seed/release8-a');parser.add_argument('--proof',default='qa-output/first-seed/final');parser.add_argument('--output',default='deliveries/first-seed');args=parser.parse_args()
root=Path.cwd();build=Path(args.build);proof=Path(args.proof);dest=Path(args.output);dest.mkdir(parents=True,exist_ok=True)
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def read(path):return json.loads(Path(path).read_text())
receipt=read(build/'release-integrity.json');files={p.relative_to(build).as_posix():p for p in build.rglob('*') if p.is_file()};assert set(files)-{'release-integrity.json'}==set(receipt['files'])
for name,digest in receipt['files'].items():assert sha(files[name])==digest,name
reg=read(proof/'regression/accepted-exits.json');assert len(reg)==41 and all(row['exit']==0 and row['sourceCommit']==receipt['source_commit'] and row['buildHash']==receipt['build_hash'] for row in reg),'All41 regression programs must pass'
visual=read(proof/'visual/results.json');intro=read(proof/'onboarding/results.json');assert len(visual['results'])==240 and not visual['errors'];assert len(intro['results'])==144 and not intro['errors']
for name,count in [('flow',7),('faults',4),('motion',2),('update',4),('platform',2)]:
 data=read(proof/name/'results.json');assert len(data.get('results',[]))==count,name;assert not data.get('errors'),name;assert not any(isinstance(r,dict) and r.get('status')=='FAIL' for r in data.get('results',[])),name
contrast=read(proof/'contrast/results.json');assert len(contrast['results'])==28 and all(r['status']=='PASS' for r in contrast['results'])
unit=(proof/'unit.log').read_text();assert re.search(r'pass 245\b',unit) and re.search(r'fail 0\b',unit)
ci=read(proof/'ci/results.json');assert ci['head']==receipt['source_commit'] and len(ci['jobs'])==3 and all(j['conclusion']=='success' for j in ci['jobs'])
repro=read(proof/'reproducibility.json');assert repro['twoBuildsByteIdentical'] and repro['commit']==receipt['source_commit']
assert read(proof/'contracts.json')['status']=='PASS' and read(proof/'modules.json')['status']=='PASS'
lint=read(proof/'lint.json');assert sum(x['errorCount'] for x in lint)==0 and sum(x['warningCount'] for x in lint)<=5
perf=read(proof/'performance/results.json');assert len(perf['results'])==2 and all(x['unfinishedAfter15Seconds']==0 and x['reducedMotionAnimations']==0 for x in perf['results'])
manual=read(proof/'manual-fixtures/results.json');assert len(manual['results'])==7 and not manual['errors'] and all(x['status']=='PASS' for x in manual['results'])
assert all(x.get('restoreIntoEmptyState') for x in manual['results'])
fresh=read(proof/'fresh-restore/results.json');assert len(fresh['results'])==1 and not fresh['errors'] and fresh['results'][0]['status']=='PASS'
reportdir=Path('reports/first-seed');assert (reportdir/'IMPLEMENTIERUNG.md').is_file()
def zip_tree(directory,target):
 with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
  for path in sorted(directory.rglob('*')):
   if path.is_file():
    info=zipfile.ZipInfo(path.relative_to(directory).as_posix(),date_time=(2026,10,19,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,path.read_bytes(),compresslevel=9)
appzip=dest/'FaithPath_FIRSTSEED1_Netlify_QA.zip';zip_tree(build,appzip)
with zipfile.ZipFile(appzip) as z:
 assert not z.testzip();assert set(z.namelist())==set(files)
 for name,path in files.items():assert hashlib.sha256(z.read(name)).hexdigest()==sha(path)
staging=Path('qa-output/first-seed/delivery');shutil.rmtree(staging,ignore_errors=True);staging.mkdir(parents=True)
shutil.copytree(reportdir,staging/'Bericht');shutil.copytree(proof,staging/'Nachweise',ignore=shutil.ignore_patterns('*.png','*.webm','finish.log','delivery.log'))
(staging/'START_HIER.txt').write_text('FaithPath FIRSTSEED1 – keine Produktionsfreigabe\n\n1. Bericht/Bericht.pdf oder Bericht/IMPLEMENTIERUNG.md lesen.\n2. Bericht/Vergleich.html zeigt echte Screenshots.\n3. Separates FaithPath_FIRSTSEED1_Netlify_QA.zip enthält die vollständige App.\n4. App-ZIP entpacken; localhost-Server verwenden (ES-Module/PWA benötigen HTTP):\n   python3 -m http.server 8080 --directory <entpackter-App-Ordner>\n   http://localhost:8080 öffnen. file:// ist keine PWA-Umgebung.\n5. Nur synthetische Daten; keinesfalls vorhandene Produktion/QA-Site überschreiben.\n6. UX-Testplan und iPhone-Abnahme sind OFFEN. Kein automatischer Deploy/Merge.\n',encoding='utf8')
qazip=dest/'FaithPath_FIRSTSEED1_Bericht_QA.zip';zip_tree(staging,qazip)
with zipfile.ZipFile(qazip) as z:assert not z.testzip() and 'Bericht/Bericht.pdf' in z.namelist() and 'Bericht/Vergleich.html' in z.namelist()
assert appzip.stat().st_size<95*1024*1024 and qazip.stat().st_size<95*1024*1024
manifest={'build':receipt['build'],'sourceCommit':receipt['source_commit'],'buildHash':receipt['build_hash'],'contentHash':receipt['content_hash'],'branch':subprocess.check_output(['git','branch','--show-current'],text=True).strip(),'artifacts':{p.name:{'sha256':sha(p),'bytes':p.stat().st_size} for p in [appzip,qazip]},'noDeployment':True,'humanUX':'OPEN','physicalIOS':'OPEN','decision':'CONDITIONAL GO – internal human/device gate only'}
(dest/'SHA256.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));(dest/'SHA256SUMS.txt').write_text(''.join(sha(p)+'  '+p.name+'\n' for p in [appzip,qazip]))
print(json.dumps(manifest,ensure_ascii=False,indent=2))
