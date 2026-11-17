from pathlib import Path
import os,json,subprocess,hashlib,datetime
r=Path('/workspace/faithpath-next');env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']}
def git(*args):return subprocess.check_output(['git',*args],cwd=r,env=env).decode().strip()
first=json.loads(Path('/workspace/oliva-v018-first-candidate-checkpoint.json').read_text());assert git('rev-parse','HEAD')==first['standaloneCandidateCommit']
assert git('branch','--show-current')=='feature/oliva-single-spirit-sword-20261117'
assert not git('diff','--name-only','--','app','src','assets','app.json','package.json','package-lock.json','art/spiritual-sword/runtime.json')
scan=json.loads((r/'docs/evidence/single-spirit-sword/actual-session-secret-scan.json').read_text());assert scan['passed'] and scan['actualSessionTokensChecked']>=1
nav=json.loads((r/'docs/evidence/single-spirit-sword/navigation-r2/execution.json').read_text());assert nav['exitCode']==0
freeze=json.loads((r/'docs/evidence/single-spirit-sword/candidate18/runtime-inputs.json').read_text());h=hashlib.sha256()
for x in freeze['files']:
 b=(r/x['path']).read_bytes();assert hashlib.sha256(b).hexdigest()==x['sha256'];h.update(x['path'].encode()+b'\0'+b+b'\0')
assert h.hexdigest()==freeze['sha256']==first['runtimeSourceSHA256']
subprocess.run(['git','add','--all','--','.',':(exclude)docs/evidence/single-spirit-sword/full-r2'],cwd=r,env=env,check=True)
subprocess.run(['git','diff','--cached','--check'],cwd=r,env=env,check=True)
subprocess.run(['git','commit','--quiet','-m','test: await actual reader navigation before checking the Ephesians target'],cwd=r,env=env,check=True)
head=git('rev-parse','HEAD');tree=git('rev-parse','HEAD^{tree}');record={**first,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'standaloneCandidateCommit':head,'standaloneTree':tree,'previousStandaloneCandidate':first['standaloneCandidateCommit'],'testHarnessCorrection':'Await actual ExpoRouter navigation before strict existing URL/focus/data assertions. Runtime files unchanged.','productionRuntimeUnchangedFromFirstCandidate':True}
Path('/workspace/oliva-v018-candidate-checkpoint.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
