from pathlib import Path
import os,subprocess,json,datetime,runpy
root=Path('/workspace/faithpath-next');env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']}
def git(*args):return subprocess.check_output(['git',*args],cwd=root,env=env).decode().strip()
c=runpy.run_path('/tmp/original-history-v017-release-common.py');c['guard']();digest=c['verify_inputs']()
assert git('rev-parse','HEAD')=='f7419ae7c7165ce77d300050459bcc29b12e736f'
scan=json.loads((root/'docs/evidence/original-history-release17/secret-scan.json').read_text());assert scan['passed'] and not scan['matchingFiles'] and scan['actualSessionTokensChecked']==2
ci=json.loads((root/'docs/evidence/github/ci-v017/verification.json').read_text());assert ci['qualityVerified'] and all(ci['checks'].values()) and len(ci['checks'])==31
changed=set(git('diff','--name-only').splitlines())|set(git('ls-files','--others','--exclude-standard').splitlines())
assert changed and all(p.startswith('docs/') or p in ['README.md','RESUME.md'] for p in changed),changed
branch='docs/oliva-v017-delivery-20261117';assert not git('branch','--list',branch)
subprocess.run(['git','switch','-c',branch],cwd=root,env=env,capture_output=True,check=True)
subprocess.run(['git','add','--all'],cwd=root,env=env,check=True)
subprocess.run(['git','diff','--cached','--check'],cwd=root,env=env,check=True)
subprocess.run(['git','commit','--quiet','-m','docs: record OLIVA 0.17 delivery and independently verified CI'],cwd=root,env=env,check=True)
assert not git('status','--porcelain');commit=git('rev-parse','HEAD')
for f in json.loads((root/'docs/evidence/original-history-release17/runtime-inputs.json').read_text())['files']:
 old=subprocess.check_output(['git','show','f7419ae7c7165ce77d300050459bcc29b12e736f:'+f['path']],cwd=root,env=env)
 now=subprocess.check_output(['git','show',commit+':'+f['path']],cwd=root,env=env);assert old==now,(f['path'])
assert git('rev-parse','oliva-v0.17.0-original-history-private^{commit}')=='f7419ae7c7165ce77d300050459bcc29b12e736f'
record={'version':'0.17.0','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'standaloneDocsCommit':commit,'releaseSourceCommit':'f7419ae7c7165ce77d300050459bcc29b12e736f','releaseGithubCommit':'30a34393cf19b508d80ba8bc6abf84388f026fd8','sourceBranch':branch,'committedRuntimeInputsExact':True,'runtimeSourceDigest':digest,'independentCiRun':44107370439,'independentCiChecks':31,'changedDocumentationFiles':len(changed),'websiteRedeployed':False,'releaseTagChanged':False}
Path('/workspace/oliva-v017-docs-checkpoint.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
