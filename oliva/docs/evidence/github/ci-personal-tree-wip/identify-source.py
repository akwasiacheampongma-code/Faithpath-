from pathlib import Path
import argparse,os,subprocess,json,datetime,re
p=argparse.ArgumentParser();p.add_argument('--head',required=True);p.add_argument('--standalone',required=True);a=p.parse_args()
assert all(re.fullmatch('[a-f0-9]{40}',x) for x in [a.head,a.standalone])
root=Path('/workspace/faithpath-next');out=root/'docs/evidence/github/ci-personal-tree-wip';repo='akwasiacheampongma-code/Faithpath-';branch='feature/oliva-personal-tree-20261117'
env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']}
def api(path):
 r=subprocess.run(['gh','api','repos/'+repo+'/'+path],capture_output=True,env=env);assert r.returncode==0,'Read-only source identity request failed';return json.loads(r.stdout)
expected=subprocess.check_output(['git','rev-parse',a.standalone+'^{tree}'],cwd=root,env=env,text=True).strip()
commit=api('git/commits/'+a.head);tree=api('git/trees/'+commit['tree']['sha']);assert not tree['truncated']
subtree=next(v['sha'] for v in tree['tree'] if v['path']=='oliva');assert subtree==expected
ref=api('git/ref/heads/'+branch);assert ref['object']['sha']==a.head
v={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'repository':repo,'githubHead':a.head,'standaloneCommitProvidedByRoot':a.standalone,'sourceSubtreeSha':subtree,'expectedSourceSubtreeSha':expected,'sourceSubtreeMatchesAuthorizedSnapshot':True,'branchTargetsExactHead':True,'branchRef':ref,'commit':commit,'rootTree':tree,'releaseTagCreated':False,'unreleasedDevelopmentSource':True}
(out/'source-identities.json').write_text(json.dumps(v,indent=2)+'\n');print({k:v[k] for k in ['githubHead','sourceSubtreeSha','branchTargetsExactHead','releaseTagCreated']})
