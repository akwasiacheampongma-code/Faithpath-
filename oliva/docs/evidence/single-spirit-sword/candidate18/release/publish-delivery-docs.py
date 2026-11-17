from pathlib import Path
import os,subprocess,json,datetime
r=Path('/workspace/faithpath-next');bare=Path('/workspace/faithpath-publish.git');meta=json.loads(Path('/workspace/oliva-v018-docs-checkpoint.json').read_text());source=meta['standaloneDocsCommit'];parent=meta['releaseGithubCommit'];branch=meta['sourceBranch']
assert meta['committedRuntimeInputsExact'] and parent=='84527ef0b7e3c970b3c7e33bd758cd2fd28d06a0' and branch=='docs/oliva-v018-delivery-20261117'
ci=json.loads((r/'docs/evidence/github/ci-v018/verification.json').read_text());assert ci['qualityVerified'] and ci['headSha']==parent and ci['unit']['passed']==343 and ci['browser']['passed']==146
env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']};env.update({'GIT_AUTHOR_NAME':'Codex','GIT_AUTHOR_EMAIL':'codex@localhost','GIT_COMMITTER_NAME':'Codex','GIT_COMMITTER_EMAIL':'codex@localhost','GIT_TERMINAL_PROMPT':'0'})
base=['git','-c','credential.helper=','-c','credential.helper=!gh auth git-credential','--git-dir='+str(bare)]
def run(args,data=None):
 q=subprocess.run(base+args,input=data,capture_output=True,env=env)
 if q.returncode:raise RuntimeError('Git operation failed: '+args[0]+'; exit '+str(q.returncode))
 return q.stdout
def out(args,data=None):return run(args,data).decode().strip()
plan=json.loads(Path('/workspace/oliva-github-backups.json').read_text());assert plan['published'] and plan['verified_version_refs']==32
expected={}
for v in plan['versions']:expected['refs/heads/'+v['branch']]=v['commit'];expected['refs/tags/'+v['tag']]=v['tag_object']
assert len(expected)==32
protected=['refs/heads/main','refs/heads/feature/oliva-next-v02-20261106','refs/heads/feature/oliva-v011-ci-geometry-20261109','refs/heads/docs/oliva-reader-phase-closeout-20261116','refs/heads/docs/oliva-v014-delivery-20261117','refs/heads/docs/oliva-v015-delivery-20261117','refs/heads/docs/oliva-v016-delivery-20261117','refs/heads/docs/oliva-v017-delivery-20261117','refs/heads/feature/oliva-personal-tree-20261117'];ref='refs/heads/'+branch
raw=run(['ls-remote','--refs','origin',*expected,*protected,ref]).decode();before={x.split('\t')[1]:x.split('\t')[0] for x in raw.splitlines()};assert all(before.get(k)==v for k,v in expected.items()) and all(k in before for k in protected)
assert before['refs/heads/main']=='d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3' and before['refs/heads/docs/oliva-v017-delivery-20261117']=='b374b962e97879a23c5bbb5937baf194d914a07d'
run(['fetch','--no-tags',str(r),source+':refs/source/oliva-docs/v018-delivery']);sourceTree=out(['rev-parse',source+'^{tree}'])
if ref in before:
 head=before[ref];run(['fetch','--no-tags','origin',ref]);assert out(['rev-parse',head+':oliva'])==sourceTree,'Preserve unknown remote documentation work'
else:
 rows=[]
 for row in run(['ls-tree','-z',parent]).split(b'\0'):
  if not row:continue
  if row.endswith(b'\toliva'):row=b'040000 tree '+sourceTree.encode()+b'\toliva'
  rows.append(row)
 tree=out(['mktree','-z'],b'\0'.join(rows)+b'\0');head=out(['commit-tree',tree,'-p',parent],('Record OLIVA0.18 private delivery, exact source-tag identity and independent CI\n\nStandalone documentation snapshot: '+source+'\nRuntime files and32versionrefs remain unchanged. No website redeployment or main merge.\n').encode())
 changed=[x.decode() for x in run(['diff','--name-only','--no-renames','-z',parent,head]).split(b'\0') if x];assert changed and all(p.startswith('oliva/docs/') or p in ['oliva/README.md','oliva/RESUME.md'] for p in changed)
 local='refs/publish/oliva-docs/v018-delivery';run(['update-ref',local,head]);run(['push','--porcelain','origin',local+':'+ref])
roots=lambda sha:[x for x in run(['ls-tree','-z',sha]).split(b'\0') if x and not x.endswith(b'\toliva')]
assert roots(parent)==roots(head) and len(roots(head))==47
raw=run(['ls-remote','--refs','origin',*expected,*protected,ref]).decode();after={x.split('\t')[1]:x.split('\t')[0] for x in raw.splitlines()};assert after[ref]==head and all(after[k]==v for k,v in before.items())
record={**meta,'githubPublished':True,'githubDocsCommit':head,'githubDocsBranch':branch,'githubDocsUrl':'https://github.com/akwasiacheampongma-code/Faithpath-/tree/'+branch+'/oliva','sourceTree':sourceTree,'runtimeAndReleaseTagsUnchanged':True,'protectedRefsUnchanged':True,'versionRefsVerified':32,'originalRootEntriesExact':47,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'websiteRedeployed':False,'mainMerged':False}
Path('/workspace/oliva-v018-docs-backup.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
