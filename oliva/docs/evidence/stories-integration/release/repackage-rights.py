from pathlib import Path
import runpy,shutil,hashlib,json,re,subprocess,datetime
common=runpy.run_path('/tmp/stories-v014-release-common.py');r=common['ROOT'];e=common['EVIDENCE']
# First require the complete unfiltered local app regression and existing update proof.
pre=common['guard'](False)
(e/'pre-rights-validation-summary.json').write_text(json.dumps(pre,indent=2)+'\n')
old=Path('/workspace/oliva-v014-before-rights-web');assert not old.exists();shutil.copytree(r/'dist',old)
def inventory(root):return {p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}
before=inventory(old)
with (e/'rights-packaging.txt').open('x') as log:
 for cmd in [['node','scripts/pwa.mjs'],['node','scripts/offline.mjs']]:subprocess.run(cmd,cwd=r,stdout=log,stderr=subprocess.STDOUT,check=True)
after=inventory(r/'dist');assert before.keys()==after.keys()
changed=[p for p in before if before[p]!=after[p]]
allowed={'index.html','sw.js','THIRD_PARTY_NOTICES.txt','licenses/MIT.txt','licenses/THIRD_PARTY_NOTICES.txt'}
assert set(changed)==allowed,changed
oldcore=pre['coreBuild'];newcore=re.search(r'name="oliva-build" content="([^"]+)"',(r/'dist/index.html').read_text()).group(1);assert newcore!=oldcore
assert (old/'sw.js').read_bytes().replace(oldcore.encode(),newcore.encode())==(r/'dist/sw.js').read_bytes()
assert (old/'index.html').read_bytes().replace(oldcore.encode(),newcore.encode())==(r/'dist/index.html').read_bytes()
for p in ['THIRD_PARTY_NOTICES.txt','licenses/THIRD_PARTY_NOTICES.txt']:assert (r/'dist'/p).read_bytes()==(r/'THIRD_PARTY_NOTICES.md').read_bytes()
assert (r/'dist/licenses/MIT.txt').read_bytes()==(r/'LICENSE').read_bytes()
assert b'436 original units' in (r/'dist/THIRD_PARTY_NOTICES.txt').read_bytes()
proof={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'fullRegressionBuild':oldcore,'finalPackagingBuild':newcore,'baselineDirectory':str(old),'finalDirectory':str(r/'dist'),'files':len(before),'unchangedFiles':len(before)-len(changed),'changedFiles':changed,'everyJavaScriptPathAndByteUnchanged':True,'everyBinaryAssetPathAndByteUnchanged':True,'workerAlgorithmAndUrlsUnchanged':True,'htmlChangesOnlyBuildIdentifier':True,'finalNoticesExactlyMatchSource':True,'reason':'Add explicit inherited-story content rights and MIT exclusion. Only notices and derived PWA cache identifier change; final PWA/update/HTTP checks run separately.','runtimeSourceDigest':common['verify_inputs']()}
(e/'rights-packaging-parity.json').write_text(json.dumps(proof,indent=2)+'\n')
paths=['LICENSE','THIRD_PARTY_NOTICES.md','scripts/pwa.mjs','scripts/offline.mjs','content/faithpath-stories/RIGHTS.md'];h=hashlib.sha256();items=[]
for p in sorted(paths):
 raw=(r/p).read_bytes();h.update(p.encode()+b'\0'+raw+b'\0');items.append({'path':p,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
(e/'packaging-inputs.json').write_text(json.dumps({'sha256':h.hexdigest(),'files':items},indent=2)+'\n')
t=e/'type-only-emission-comparison.json';d=json.loads(t.read_text());d['finalTypedWebExport']=str(old);t.write_text(json.dumps(d,indent=2)+'\n')
print(json.dumps({'oldCore':oldcore,'newCore':newcore,'changedFiles':changed,'allExecutableBytesUnchanged':True,'packagingDigest':h.hexdigest()}))
