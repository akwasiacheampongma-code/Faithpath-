from pathlib import Path
import os,json,subprocess,datetime
r=Path('/workspace/faithpath-next');bare=Path('/workspace/faithpath-publish.git');meta=json.loads(Path('/workspace/oliva-v018-candidate-checkpoint.json').read_text())
env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']};env.update({'GIT_AUTHOR_NAME':'Codex','GIT_AUTHOR_EMAIL':'codex@localhost','GIT_COMMITTER_NAME':'Codex','GIT_COMMITTER_EMAIL':'codex@localhost','GIT_TERMINAL_PROMPT':'0'})
base=['git','-c','credential.helper=','-c','credential.helper=!gh auth git-credential','--git-dir='+str(bare)]
def run(args,data=None):
 q=subprocess.run(base+args,input=data,capture_output=True,env=env)
 if q.returncode:raise RuntimeError('Git operation failed: '+args[0]+'; exit '+str(q.returncode))
 return q.stdout
def out(args,data=None):return run(args,data).decode().strip()
plan=json.loads(Path('/workspace/oliva-github-backups.json').read_text());assert plan['published'] and plan['verified_version_refs']==30
first=json.loads(Path('/workspace/oliva-v018-first-github-candidate.json').read_text());parent=first['githubHead'];assert plan['versions'][-1]['version']=='0.17.0' and plan['versions'][-1]['commit']==first['githubParent']
source=meta['standaloneCandidateCommit'];branch=meta['sourceBranch'];assert branch=='feature/oliva-single-spirit-sword-20261117'
expected={}
for v in plan['versions']:expected['refs/heads/'+v['branch']]=v['commit'];expected['refs/tags/'+v['tag']]=v['tag_object']
protected=['refs/heads/main','refs/heads/feature/oliva-next-v02-20261106','refs/heads/feature/oliva-v011-ci-geometry-20261109','refs/heads/docs/oliva-reader-phase-closeout-20261116','refs/heads/docs/oliva-v014-delivery-20261117','refs/heads/docs/oliva-v015-delivery-20261117','refs/heads/docs/oliva-v016-delivery-20261117','refs/heads/docs/oliva-v017-delivery-20261117','refs/heads/feature/oliva-personal-tree-20261117']
ref='refs/heads/'+branch;raw=run(['ls-remote','--refs','origin',*expected,*protected,ref]).decode();before={x.split('\t')[1]:x.split('\t')[0] for x in raw.splitlines()}
assert len(expected)==30 and all(before.get(k)==v for k,v in expected.items()) and all(p in before for p in protected)
assert before['refs/heads/main']=='d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3'
assert before['refs/heads/docs/oliva-v017-delivery-20261117']=='b374b962e97879a23c5bbb5937baf194d914a07d'
assert before.get(ref)==parent,'Only fast-forward our exact first candidate; preserve unknown remote work'
run(['fetch','--no-tags',str(r),source+':refs/source/oliva/v018-single-sword-candidate'])
sourceTree=out(['rev-parse',source+'^{tree}']);assert sourceTree==meta['standaloneTree'];rows=[]
for row in run(['ls-tree','-z',parent]).split(b'\0'):
 if not row:continue
 if row.endswith(b'\toliva'):row=b'040000 tree '+sourceTree.encode()+b'\toliva'
 rows.append(row)
tree=out(['mktree','-z'],b'\0'.join(rows)+b'\0')
head=out(['commit-tree',tree,'-p',parent],('Implement one peaceful Bible-hub sword; retire the66-book collection\n\nExact standalone candidate: '+source+'\n343 local domain tests and static native exports passed. Full local regression, PWA upgrade, CI and private delivery remain separate pending gates. No release tag yet, main unchanged, web stays owner-private.\n').encode())
changed=[x.decode() for x in run(['diff','--name-only','--no-renames','-z',parent,head]).split(b'\0') if x];assert changed and all(x.startswith('oliva/') for x in changed)
roots=lambda sha:[x for x in run(['ls-tree','-z',sha]).split(b'\0') if x and not x.endswith(b'\toliva')]
assert roots(parent)==roots(head) and len(roots(head))==47
assert out(['rev-parse',parent+':.github/workflows/oliva-quality.yml'])==out(['rev-parse',head+':.github/workflows/oliva-quality.yml'])
local='refs/publish/oliva/v018-single-sword-candidate';run(['update-ref',local,head]);run(['push','--porcelain','origin',local+':'+ref])
raw=run(['ls-remote','--refs','origin',*expected,*protected,ref]).decode();after={x.split('\t')[1]:x.split('\t')[0] for x in raw.splitlines()};assert after[ref]==head and all(after[k]==v for k,v in before.items() if k!=ref)
record={**meta,'githubHead':head,'githubParent':parent,'baseReleaseGithubCommit':first['githubParent'],'supersedesTestHarnessCandidate':first['githubHead'],'githubTree':tree,'sourceSubtree':sourceTree,'githubBranch':branch,'githubUrl':'https://github.com/akwasiacheampongma-code/Faithpath-/tree/'+branch+'/oliva','githubSourcePushed':True,'versionRefsVerified':30,'protectedRefsUnchanged':True,'nonOlivaRootEntriesExact':47,'releaseTagCreated':False,'websiteDeployed':False,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
Path('/workspace/oliva-v018-github-candidate.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
