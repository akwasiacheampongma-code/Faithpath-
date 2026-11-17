from pathlib import Path
import os,subprocess,json,datetime
root=Path('/workspace/faithpath-next');bare=Path('/workspace/faithpath-publish.git')
env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']}
env.update({'GIT_AUTHOR_NAME':'Codex','GIT_AUTHOR_EMAIL':'codex@localhost','GIT_COMMITTER_NAME':'Codex','GIT_COMMITTER_EMAIL':'codex@localhost','GIT_TERMINAL_PROMPT':'0'})
meta=json.loads(Path('/workspace/oliva-v017-docs-checkpoint.json').read_text());source=meta['standaloneDocsCommit'];parent=meta['releaseGithubCommit'];branch=meta['sourceBranch']
assert len(source)==40 and meta['committedRuntimeInputsExact'] and parent=='30a34393cf19b508d80ba8bc6abf84388f026fd8'
ci=json.loads((root/'docs/evidence/github/ci-v017/verification.json').read_text());assert ci['qualityVerified'] and all(ci['checks'].values()) and len(ci['checks'])==31 and ci['headSha']==parent
assert ci['unit']['passed']==347 and ci['browser']['passed']==154
plan=json.loads(Path('/workspace/oliva-github-backups.json').read_text());assert plan['published'] and plan['verified_version_refs']==30
base=['git','-c','credential.helper=','-c','credential.helper=!gh auth git-credential','--git-dir='+str(bare)]
def run(args,input=None):
 r=subprocess.run(base+args,input=input,capture_output=True,env=env)
 if r.returncode:raise RuntimeError('Git operation failed: '+args[0]+'; exit '+str(r.returncode))
 return r.stdout
def out(args,input=None):return run(args,input).decode().strip()
run(['fetch','--no-tags',str(root),source+':refs/source/oliva-docs/v017-delivery'])
sourceTree=out(['rev-parse',source+'^{tree}']);entries=[]
for row in run(['ls-tree','-z',parent]).split(b'\0'):
 if not row:continue
 metadata,name=row.split(b'\t',1)
 if name==b'oliva':row=b'040000 tree '+sourceTree.encode()+b'\toliva'
 entries.append(row)
tree=out(['mktree','-z'],b'\0'.join(entries)+b'\0')
commit=out(['commit-tree',tree,'-p',parent],('Record independently verified OLIVA 0.17 delivery and CI\n\nStandalone documentation snapshot: '+source+'\nApp/runtime inputs and all release tags remain exact. No main merge or website deployment.\n').encode())
changed=[p.decode() for p in run(['diff','--name-only','--no-renames','-z',parent,commit]).split(b'\0') if p]
assert changed and all(p.startswith('oliva/docs/') or p in ['oliva/README.md','oliva/RESUME.md'] for p in changed)
beforeRoot=[x for x in run(['ls-tree','-z',parent]).split(b'\0') if x and not x.endswith(b'\toliva')]
afterRoot=[x for x in run(['ls-tree','-z',commit]).split(b'\0') if x and not x.endswith(b'\toliva')];assert beforeRoot==afterRoot and len(beforeRoot)==47
expected={}
for v in plan['versions']:
 expected['refs/heads/'+v['branch']]=v['commit'];expected['refs/tags/'+v['tag']]=v['tag_object']
assert len(expected)==30
protected=['refs/heads/main','refs/heads/feature/oliva-next-v02-20261106','refs/heads/feature/oliva-v011-ci-geometry-20261109','refs/heads/docs/oliva-reader-phase-closeout-20261116','refs/heads/docs/oliva-v014-delivery-20261117','refs/heads/docs/oliva-v015-delivery-20261117','refs/heads/docs/oliva-v016-delivery-20261117','refs/heads/feature/oliva-personal-tree-20261117']
ref='refs/heads/'+branch
raw=run(['ls-remote','--refs','origin',*protected,*expected,ref]).decode();before={l.split('\t')[1]:l.split('\t')[0] for l in raw.splitlines()}
assert all(before.get(k)==v for k,v in expected.items()) and all(k in before for k in protected)
assert before['refs/heads/main']=='d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3'
assert before['refs/heads/docs/oliva-v016-delivery-20261117']=='18d55c0a9155c8da251bbccf8c095a46049b574f'
assert before['refs/heads/docs/oliva-v015-delivery-20261117']=='a8e9e5ea31b4a004ff31c851eb2eb7e6582a5647'
assert before['refs/heads/feature/oliva-personal-tree-20261117']=='c0ae726a1a2cef430c37b89a8fe94d55a78287f8'
assert ref not in before or before[ref]==commit
local='refs/publish/oliva-docs/v017-delivery';run(['update-ref',local,commit])
if ref not in before:run(['push','--porcelain','origin',local+':'+ref])
raw=run(['ls-remote','--refs','origin',*protected,*expected,ref]).decode();after={l.split('\t')[1]:l.split('\t')[0] for l in raw.splitlines()}
assert after[ref]==commit and all(after[k]==v for k,v in before.items())
record={**meta,'githubPublished':True,'githubDocsCommit':commit,'githubDocsBranch':branch,'githubDocsUrl':'https://github.com/akwasiacheampongma-code/Faithpath-/tree/'+branch+'/oliva','sourceTree':sourceTree,'runtimeAndReleaseTagsUnchanged':True,'protectedRefsUnchanged':True,'versionRefsVerified':len(expected),'originalRootEntriesExact':len(beforeRoot),'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'websiteRedeployed':False,'mainMerged':False}
Path('/workspace/oliva-v017-docs-backup.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
