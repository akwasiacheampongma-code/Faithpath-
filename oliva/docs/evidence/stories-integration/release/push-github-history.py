from pathlib import Path
import subprocess, os, json, datetime, runpy
common=runpy.run_path('/tmp/stories-v014-release-common.py');common['guard']()
planPath=Path('/workspace/oliva-github-backup-plan.json');p=json.loads(planPath.read_text())
assert p['repository']=='akwasiacheampongma-code/Faithpath-' and p['all_prepared'] and len(p['versions'])==p['expected_versions']==12
v=p['versions'][-1];assert v['version']==common['VERSION'] and v['parent_commit']==common['GITHUB_PARENT'] and v['branch']==common['PUBLISH_BRANCH'] and v['source_ref']==common['SOURCE_TAG']
assert v['source_commit']==common['git']('rev-parse',common['SOURCE_TAG']+'^{commit}')
bare='/workspace/faithpath-publish.git';origin='https://github.com/akwasiacheampongma-code/Faithpath-.git'
base=['git','-c','credential.helper=','-c','credential.helper=!gh auth git-credential','--git-dir='+bare]
def git(args,check=True):
    r=subprocess.run(base+args,capture_output=True,env=common['SAFE_ENV'])
    if check and r.returncode:raise RuntimeError(r.stderr.decode('utf8','replace')[-2500:])
    return r
assert git(['remote','get-url','origin']).stdout.decode().strip()==origin
protected=['refs/heads/main','refs/heads/feature/oliva-next-v02-20261106','refs/heads/feature/oliva-v011-ci-geometry-20261109','refs/heads/docs/oliva-reader-phase-closeout-20261116']
expected={}
for item in p['versions']:
    assert item['oliva_subtree_exact'] and item['original_faithpath_paths_unchanged']
    assert git(['rev-parse',item['commit']+':oliva']).stdout.decode().strip()==item['source_tree']
    expected['refs/heads/'+item['branch']]=item['commit'];expected['refs/tags/'+item['tag']]=item['tag_object']
def refs():
    raw=git(['ls-remote','--refs','origin',*protected,*expected]).stdout.decode()
    return {line.split('\t')[1]:line.split('\t')[0] for line in raw.splitlines()}
before=refs();assert all(k in before for k in protected)
for item in p['versions'][:-1]:
    assert before['refs/heads/'+item['branch']]==item['commit'] and before['refs/tags/'+item['tag']]==item['tag_object']
branch='refs/heads/'+v['branch'];tag='refs/tags/'+v['tag']
assert branch.startswith('refs/heads/feature/oliva-v') and tag.startswith('refs/tags/oliva-v0.')
for key in [branch,tag]: assert key not in before or before[key]==expected[key], 'Existing destination differs: '+key
p['remote_refs_before']=before;planPath.write_text(json.dumps(p,indent=2)+'\n')
if before.get(branch)!=v['commit'] or before.get(tag)!=v['tag_object']:
    result=git(['push','--atomic','--porcelain','origin',v['local_commit_ref']+':'+branch,v['local_tag_ref']+':'+tag],False)
    print(result.stdout.decode('utf8','replace'),flush=True)
    if result.returncode:raise RuntimeError('Atomic source backup push failed: '+result.stderr.decode('utf8','replace')[-2500:])
after=refs()
assert all(after.get(k)==sha for k,sha in expected.items())
assert all(after[k]==before[k] for k in before if k not in [branch,tag]), 'Existing immutable remote ref changed'
result={**p,'published':True,'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'remote_refs_after':after,'all_version_remote_refs_match':True,'verified_version_refs':len(expected),'main_unchanged':True,'v04_branch_unchanged':True,'original_faithpath_paths_unchanged':True,'public_github_source_authorized':True,'public_web_deployment':False}
Path('/workspace/oliva-github-backups.json').write_text(json.dumps(result,indent=2)+'\n')
p['published']=True;planPath.write_text(json.dumps(p,indent=2)+'\n')
print(json.dumps({'version':v['version'],'commit':v['commit'],'branch':v['branch'],'tag':v['tag'],'url':v['url'],'verified_version_refs':len(expected),'new_refs_pushed':2,'main_unchanged':True,'v04_branch_unchanged':True,'proof':'/workspace/oliva-github-backups.json'}),flush=True)
