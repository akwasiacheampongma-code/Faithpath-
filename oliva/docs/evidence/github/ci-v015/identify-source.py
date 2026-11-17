#!/usr/bin/env python3
"""Read exact source/tag identity only after the parent confirms push."""
from pathlib import Path
import argparse,datetime,json,os,re,subprocess,urllib.parse
P=argparse.ArgumentParser();P.add_argument('--head',required=True);P.add_argument('--standalone',required=True);a=P.parse_args()
assert re.fullmatch('[0-9a-f]{40}',a.head) and re.fullmatch('[0-9a-f]{40}',a.standalone)
repo='akwasiacheampongma-code/Faithpath-';out=Path('/workspace/faithpath-next/docs/evidence/github/ci-v015')
env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ('GIT_CURL_VERBOSE','GH_DEBUG')}
def git(*args):return subprocess.check_output(['git',*args],cwd='/workspace/faithpath-next',env=env).decode().strip()
def api(p):
 r=subprocess.run(['gh','api','repos/'+repo+'/'+p],capture_output=True,env=env)
 if r.returncode:raise RuntimeError('Source identity API failed: '+p)
 return json.loads(r.stdout)
expected=git('rev-parse',a.standalone+'^{tree}')
assert git('rev-parse','oliva-v0.15.0-life-topics-private^{commit}')==a.standalone
commit=api('git/commits/'+a.head);tree=api('git/trees/'+commit['tree']['sha']);assert not tree['truncated']
subtree=next(x['sha'] for x in tree['tree'] if x['path']=='oliva' and x['type']=='tree');assert subtree==expected
branch=api('git/ref/heads/feature/oliva-v015-life-topics-20261117');assert branch['object']['sha']==a.head
ref=api('git/ref/tags/oliva-v0.15.0');tag=api('git/tags/'+ref['object']['sha']) if ref['object']['type']=='tag' else None
assert (tag['object']['sha'] if tag else ref['object']['sha'])==a.head
v={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'repository':repo,'githubHead':a.head,'sourceSubtreeSha':subtree,'expectedSourceSubtreeSha':expected,'sourceSubtreeMatchesAuthorizedSnapshot':True,'standaloneCommitProvidedByRoot':a.standalone,'tag':'oliva-v0.15.0','tagTargetsExactHead':True,'branchRef':branch,'tagRef':ref,'tagObject':tag,'commit':commit,'rootTree':tree}
out.mkdir(exist_ok=True,parents=True);(out/'source-identities.json').write_text(json.dumps(v,indent=2)+'\n')
print(json.dumps({k:v[k] for k in ['githubHead','sourceSubtreeSha','sourceSubtreeMatchesAuthorizedSnapshot','tagTargetsExactHead']}))
