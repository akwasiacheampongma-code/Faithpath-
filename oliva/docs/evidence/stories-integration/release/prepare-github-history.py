from pathlib import Path
import subprocess, os, json, time, runpy
common = runpy.run_path('/tmp/stories-v014-release-common.py'); common['guard']()
bare = Path('/workspace/faithpath-publish.git'); source = common['ROOT']
planPath = Path('/workspace/oliva-github-backup-plan.json')
original = 'a519ce898fa33907b07d5ac7a585595127556183'
env = dict(common['SAFE_ENV'],GIT_AUTHOR_NAME='Codex',GIT_AUTHOR_EMAIL='codex@localhost',GIT_COMMITTER_NAME='Codex',GIT_COMMITTER_EMAIL='codex@localhost')
def git(args,data=None):
    r=subprocess.run(['git','--git-dir='+str(bare),*args],input=data,capture_output=True,env=env)
    if r.returncode: raise RuntimeError(r.stderr.decode('utf8','replace')[-1800:])
    return r.stdout
def out(args,data=None): return git(args,data).decode().strip()
def replace_tree(ref,key,mode,kind,sha):
    entries=git(['ls-tree','-z',ref]).split(b'\0'); result=[]; found=False
    for line in entries:
        if not line: continue
        meta,name=line.split(b'\t',1)
        if name.decode()==key: line=f'{mode} {kind} {sha}\t{key}'.encode();found=True
        result.append(line)
    assert found
    return out(['mktree','-z'],b'\0'.join(result)+b'\0')
p=json.loads(planPath.read_text()); assert p['repository']=='akwasiacheampongma-code/Faithpath-'
version=common['VERSION']; sourceRef=common['SOURCE_TAG']; branch=common['PUBLISH_BRANCH']; parent=common['GITHUB_PARENT']
sourceCommit=common['git']('rev-parse',sourceRef+'^{commit}')
existing=next((v for v in p['versions'] if v['version']==version),None)
if existing:
    assert existing['source_commit']==sourceCommit and existing['parent_commit']==parent and existing['branch']==branch
    assert out(['rev-parse',existing['commit']+':oliva'])==existing['source_tree']
    print(json.dumps({'already_prepared':version,'github_commit':existing['commit']}));raise SystemExit(0)
assert p['versions'][-1]['version']=='0.13.1' and p['versions'][-1]['commit']==parent
assert len(p['versions'])==11 and p['published'] is True
assert json.loads(git(['show',parent+':oliva/package.json']))['version']=='0.13.1'
git(['fetch','--no-tags',str(source),sourceCommit+':refs/source/oliva/v'+version])
sourceTree=out(['rev-parse',sourceCommit+'^{tree}'])
assert json.loads(git(['show',sourceCommit+':app.json']))['expo']['version']==version
assert json.loads(git(['show',sourceCommit+':package.json']))['version']==version
combinedTree=replace_tree(parent,'oliva','040000','tree',sourceTree)
message=f'Back up OLIVA {version} the complete original story catalog, durable questions and reflections without changing FaithPath\n\nStandalone source commit: {sourceCommit}\nStandalone source tag: {sourceRef}\nGitHub source backups explicitly authorized for every following version.\nOnly oliva/ changes. Existing OLIVA quality workflow is preserved.\nWeb preview remains owner-private; GitHub main is not merged or updated.\n'
commit=out(['commit-tree',combinedTree,'-p',parent],message.encode())
changed=[v.decode() for v in git(['diff','--name-only','--no-renames','-z',parent,commit]).split(b'\0') if v]
assert changed and all(v.startswith('oliva/') for v in changed)
all_changed=[v.decode() for v in git(['diff','--name-only','--no-renames','-z',original,commit]).split(b'\0') if v]
assert all(v.startswith('oliva/') or v=='.github/workflows/oliva-quality.yml' for v in all_changed)
assert out(['rev-parse',commit+':oliva'])==sourceTree
workflowSHA=out(['rev-parse',parent+':.github/workflows/oliva-quality.yml'])
assert out(['rev-parse',commit+':.github/workflows/oliva-quality.yml'])==workflowSHA
workflow=git(['show',parent+':.github/workflows/oliva-quality.yml'])
assert b'branches: ["feature/oliva-*"]' in workflow
assert b'actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1' in workflow
tag='oliva-v'+version
tagObject=out(['mktag'],f'object {commit}\ntype commit\ntag {tag}\ntagger Codex <codex@localhost> {int(time.time())} +0000\n\nOLIVA {version}; exact standalone source {sourceCommit}; authorized GitHub source backup, web remains owner-private.\n'.encode())
publishRef='refs/publish/oliva/v'+version; tagRef='refs/publish/oliva-tags/v'+version
for ref,sha in [(publishRef,commit),(tagRef,tagObject)]: git(['update-ref',ref,sha,'0'*40])
record={'version':version,'source_ref':sourceRef,'source_commit':sourceCommit,'source_tree':sourceTree,'parent_commit':parent,'commit':commit,'tree':combinedTree,'branch':branch,'tag':tag,'tag_object':tagObject,'local_commit_ref':publishRef,'local_tag_ref':tagRef,'workflow_blob':workflowSHA,'oliva_subtree_exact':True,'original_faithpath_paths_unchanged':True,'url':'https://github.com/akwasiacheampongma-code/Faithpath-/tree/'+tag+'/oliva'}
p['versions'].append(record);p['all_three_prepared']=True;p['all_prepared']=True;p['expected_versions']=len(p['versions']);p['published']=False
planPath.write_text(json.dumps(p,indent=2)+'\n')
print(json.dumps({'prepared':version,'github_commit':commit,'branch':branch,'tag':tag,'remote_writes':False,'plan':str(planPath)}))
