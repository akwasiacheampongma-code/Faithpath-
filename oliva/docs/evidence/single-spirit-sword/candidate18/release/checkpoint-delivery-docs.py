from pathlib import Path
import os,json,subprocess,datetime,runpy
r=Path('/workspace/faithpath-next');c=runpy.run_path('/tmp/single-spirit-sword-v018-common.py');summary=c['guard']();env=c['SAFE_ENV'];source='bc2c199921ba0a20e4d9436248db8f46d256e3ff'
def git(*args):return subprocess.check_output(['git',*args],cwd=r,env=env).decode().strip()
assert git('rev-parse','HEAD')==source and git('rev-parse',c['SOURCE_TAG']+'^{commit}')==source
ci=json.loads((r/'docs/evidence/github/ci-v018/verification.json').read_text());assert ci['qualityVerified'] and all(ci['checks'].values())
scan=json.loads((r/'docs/evidence/single-spirit-sword/actual-session-secret-scan.json').read_text());assert scan['passed'] and scan['completedFullRegressionIncluded'] and scan['actualSessionTokensChecked']>=1
def paths(*args):return {p.decode() for p in subprocess.check_output(['git',*args,'-z'],cwd=r,env=env).split(b'\0') if p}
changed=paths('diff','--name-only')|paths('ls-files','--others','--exclude-standard');assert changed and all(p.startswith('docs/') or p in ['README.md','RESUME.md'] for p in changed)
branch='docs/oliva-v018-delivery-20261117';assert not git('branch','--list',branch)
subprocess.run(['git','switch','-c',branch],cwd=r,env=env,capture_output=True,check=True)
subprocess.run(['git','add','--all'],cwd=r,env=env,check=True);subprocess.run(['git','diff','--cached','--check'],cwd=r,env=env,check=True)
subprocess.run(['git','commit','--quiet','-m','docs: record verified OLIVA0.18 single-sword delivery and preserved data'],cwd=r,env=env,check=True)
head=git('rev-parse','HEAD');assert not git('status','--porcelain')
assert not git('diff','--name-only',source,head,'--','app','src','assets','app.json','package.json','package-lock.json','art/spiritual-sword/runtime.json')
assert c['verify_inputs']()==summary['runtimeSourceDigest']
record={'version':'0.18.0','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'standaloneDocsCommit':head,'releaseSourceCommit':source,'releaseGithubCommit':'84527ef0b7e3c970b3c7e33bd758cd2fd28d06a0','sourceBranch':branch,'committedRuntimeInputsExact':True,'runtimeSourceDigest':summary['runtimeSourceDigest'],'independentCiRun':44124684188,'independentCiChecks':31,'changedDocumentationFiles':len(changed),'websiteRedeployed':False,'releaseTagChanged':False}
Path('/workspace/oliva-v018-docs-checkpoint.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
