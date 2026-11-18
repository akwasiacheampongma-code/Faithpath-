from pathlib import Path
import os, subprocess, json, hashlib, datetime
r=Path('/workspace/faithpath-next');e=r/'docs/evidence/quiet-ux-audit'
env={k:v for k,v in os.environ.items() if not(k.startswith('GIT_TRACE') or k in ['GIT_CURL_VERBOSE','GH_DEBUG'])}
def git(*a): return subprocess.check_output(['git',*a],cwd=r,env=env).decode().strip()
base='e5750309786fc70dad4d3944206d55550d1c0699';branch='feature/oliva-quiet-ux-audit-20261118'
assert git('rev-parse','HEAD')==base and git('branch','--show-current')==branch
assert git('rev-parse','oliva-pre-quiet-ux-audit-20261118^{}')==base
manifest=json.loads((r/'docs/evidence/single-spirit-sword/candidate18/runtime-inputs.json').read_text())
for row in manifest['files']:
    p=r/row['path'];assert p.stat().st_size==row['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],row['path']
scan=json.loads((e/'actual-session-secret-scan.json').read_text());assert scan['passed'] and scan['actualSessionTokensChecked']==2
report=json.loads((e/'audit-summary.json').read_text());assert report['unit']['passed']==343 and not report['productionAuditPassed'] and report['runtimeFilesVerified']==344
http=json.loads((e/'private-review-http.json').read_text());assert http['reviewFilesExact']==32 and not http['appRuntimeChanged']
def paths(*a):return {p.decode() for p in subprocess.check_output(['git',*a,'-z'],cwd=r,env=env).split(b'\0') if p}
changed=paths('diff','--name-only')|paths('diff','--cached','--name-only')|paths('ls-files','--others','--exclude-standard')
def allowed(p):
    return p in ['README.md','RESUME.md'] or p.startswith(('docs/','design-previews/quiet-ux/','scripts/audit-')) or p in ['scripts/create-quiet-review.py','scripts/check-quiet-review-http.py']
assert changed and all(allowed(p) for p in changed),[p for p in changed if not allowed(p)]
git('add','--all');git('diff','--cached','--check');git('commit','-q','-m','Audit OLIVA quiet UX with two private design studies, image inventory and current security findings')
head=git('rev-parse','HEAD');assert not git('status','--porcelain');assert not paths('diff','--name-only',base,head,'--','app','src','assets','app.json','package.json','package-lock.json')
record={'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownAuditCommit':head,'ownSourceTree':git('rev-parse','HEAD^{tree}'),'ownBaselineCommit':base,'githubParent':'84d2232c2a771cf73a2cfd51a4f2e959159b194b','branch':branch,'runtime344Exact':True,'runtimeDigest':manifest['sha256'],'newAppReleaseCreated':False,'largerDesignApprovalPending':True,'privateReviewDeployed':True,'productionSecurityAuditPassed':False,'changedAuditFiles':len(changed)}
Path('/workspace/oliva-quiet-ux-audit-checkpoint.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
