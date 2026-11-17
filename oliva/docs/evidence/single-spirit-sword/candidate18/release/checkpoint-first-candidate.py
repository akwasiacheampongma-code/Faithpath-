from pathlib import Path
import os,subprocess,json,hashlib,datetime,re
r=Path('/workspace/faithpath-next');env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']}
def git(*args):return subprocess.check_output(['git',*args],cwd=r,env=env).decode().strip()
assert git('branch','--show-current')=='feature/oliva-single-spirit-sword-20261117'
assert git('rev-parse','HEAD')=='008d575a0e8b92551dc8113dfd18d66756a348d5'
e=r/'docs/evidence/single-spirit-sword';freeze=json.loads((e/'candidate18/runtime-inputs.json').read_text());h=hashlib.sha256()
for f in freeze['files']:
 b=(r/f['path']).read_bytes();assert hashlib.sha256(b).hexdigest()==f['sha256'];h.update(f['path'].encode()+b'\0'+b+b'\0')
assert h.hexdigest()==freeze['sha256']=='29b2c6c4292c38e943108a4afd5de003e150d9ed47cf9f4269a53b565e46f0ab'
unit=json.loads((e/'candidate18/unit-results.json').read_text());assert unit['success'] and unit['numPassedTests']==unit['numTotalTests']==343
assert json.loads((e/'candidate18/native/summary.json').read_text())['allPassed']
assert json.loads((e/'candidate18/native/checker-corruption/corruption-checks.json').read_text())['allPassed']
names=set(git('ls-files','--cached','--others','--exclude-standard').splitlines());pattern=rb'(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|(?i:authorization:\s*(?:bearer|token)\s+)[A-Za-z0-9_./+\-=]{20,}|X-Amz-Signature=[0-9a-fA-F]{16,}|[?&]sig=[A-Za-z0-9%/+]{25,})'
hits=[];count=0
for name in sorted(names):
 p=r/name
 if not p.is_file() or name.startswith('docs/evidence/single-spirit-sword/full/'):continue
 count+=1
 if re.search(pattern,p.read_bytes()):hits.append(name)
assert not hits,hits
(e/'candidate18/source-pattern-scan.json').write_text(json.dumps({'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'filesScanned':count,'matchingFiles':hits,'passed':True,'actualNewServiceCredentialsAvailable':False,'scope':'Candidate tracked/nonignored source, excluding actively running full-regression outputs. Earlier actual17tokens were scanned and removed; no new service credential requested yet. Final delivery requires another concrete scan.'},indent=2)+'\n')
subprocess.run(['git','add','--all','--','.',':(exclude)docs/evidence/single-spirit-sword/full'],cwd=r,env=env,check=True)
subprocess.run(['git','diff','--cached','--check'],cwd=r,env=env,check=True)
subprocess.run(['git','commit','--quiet','-m','feat: replace book-sword collection with one peaceful Bible-hub symbol'],cwd=r,env=env,check=True)
head=git('rev-parse','HEAD');tree=git('rev-parse','HEAD^{tree}');assert head!='008d575a0e8b92551dc8113dfd18d66756a348d5'
record={'version':'0.18.0','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'standaloneCandidateCommit':head,'standaloneTree':tree,'sourceBranch':git('branch','--show-current'),'runtimeSourceSHA256':freeze['sha256'],'runtimeFiles':freeze['fileCount'],'localUnitPassed':343,'localFullRegressionPendingAtCheckpoint':True,'privateDeploymentPerformed':False,'releaseTagCreated':False,'masterComplete':False}
Path('/workspace/oliva-v018-candidate-checkpoint.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
