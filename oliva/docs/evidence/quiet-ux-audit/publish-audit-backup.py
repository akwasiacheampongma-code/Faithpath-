from pathlib import Path
import os, subprocess, json, datetime
r=Path('/workspace/faithpath-next');bare=Path('/workspace/faithpath-publish.git');m=json.loads(Path('/workspace/oliva-quiet-ux-audit-checkpoint.json').read_text())
env={k:v for k,v in os.environ.items() if not(k.startswith('GIT_TRACE') or k in ['GIT_CURL_VERBOSE','GH_DEBUG'])};env.update({'GIT_TERMINAL_PROMPT':'0','GIT_AUTHOR_NAME':'Codex','GIT_AUTHOR_EMAIL':'codex@localhost','GIT_COMMITTER_NAME':'Codex','GIT_COMMITTER_EMAIL':'codex@localhost'})
base=['git','-c','credential.helper=','-c','credential.helper=!gh auth git-credential','--git-dir='+str(bare)]
def run(args,data=None):
    p=subprocess.run(base+args,input=data,env=env,capture_output=True)
    if p.returncode:raise RuntimeError('Git operation failed: '+args[0]+'; exit '+str(p.returncode))
    return p.stdout
def out(args,data=None):return run(args,data).decode().strip()
assert m['runtime344Exact'] and m['newAppReleaseCreated'] is False
plan=json.loads(Path('/workspace/oliva-github-backups.json').read_text());expected={}
for v in plan['versions']:expected['refs/heads/'+v['branch']]=v['commit'];expected['refs/tags/'+v['tag']]=v['tag_object']
assert len(expected)==32
protected=['refs/heads/main','refs/heads/feature/oliva-next-v02-20261106','refs/heads/feature/oliva-v011-ci-geometry-20261109','refs/heads/docs/oliva-reader-phase-closeout-20261116','refs/heads/docs/oliva-v014-delivery-20261117','refs/heads/docs/oliva-v015-delivery-20261117','refs/heads/docs/oliva-v016-delivery-20261117','refs/heads/docs/oliva-v017-delivery-20261117','refs/heads/docs/oliva-v018-delivery-20261117','refs/heads/feature/oliva-personal-tree-20261117']
ref='refs/heads/'+m['branch']
def refs():return {line.split('\t')[1]:line.split('\t')[0] for line in run(['ls-remote','--refs','origin',*expected,*protected,ref]).decode().splitlines()}
before=refs();assert all(before.get(k)==v for k,v in expected.items()) and all(k in before for k in protected)
assert before['refs/heads/main']=='d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3' and before['refs/heads/docs/oliva-v018-delivery-20261117']==m['githubParent']
source=m['ownAuditCommit'];parent=m['githubParent'];run(['fetch','--no-tags',str(r),source+':refs/source/oliva-audit/quiet-ux-20261118'])
assert out(['rev-parse',parent+':oliva'])==out(['rev-parse',m['ownBaselineCommit']+'^{tree}'])
if ref in before:
    head=before[ref];run(['fetch','--no-tags','origin',ref]);assert out(['rev-parse',head+':oliva'])==m['ownSourceTree'],'Preserve unknown remote work'
else:
    rows=[]
    for row in run(['ls-tree','-z',parent]).split(b'\0'):
        if not row:continue
        if row.endswith(b'\toliva'):row=b'040000 tree '+m['ownSourceTree'].encode()+b'\toliva'
        rows.append(row)
    tree=out(['mktree','-z'],b'\0'.join(rows)+b'\0');head=out(['commit-tree',tree,'-p',parent],b'Audit quiet OLIVA UX and publish separate private design review; application0.18 unchanged\n\nNo new release, main merge, public website or data-model change. Current picomatch advisory remains explicitly open.\n')
    changed=[p.decode() for p in run(['diff','--name-only','--no-renames','-z',parent,head]).split(b'\0') if p]
    assert changed and all(p.startswith(('oliva/docs/','oliva/design-previews/quiet-ux/','oliva/scripts/audit-')) or p in ['oliva/README.md','oliva/RESUME.md','oliva/scripts/create-quiet-review.py','oliva/scripts/check-quiet-review-http.py'] for p in changed)
    local='refs/publish/oliva-audit/quiet-ux-20261118';run(['update-ref',local,head]);run(['push','--porcelain','origin',local+':'+ref])
roots=lambda sha:[x for x in run(['ls-tree','-z',sha]).split(b'\0') if x and not x.endswith(b'\toliva')]
assert roots(parent)==roots(head) and len(roots(head))==47
after=refs();assert after[ref]==head and all(after[k]==v for k,v in before.items())
record={**m,'githubAuditCommit':head,'githubBranch':m['branch'],'githubUrl':'https://github.com/akwasiacheampongma-code/Faithpath-/tree/'+m['branch']+'/oliva','all32VersionRefsUnchanged':True,'allProtectedBranchesUnchanged':True,'original47RootEntriesExact':True,'githubMainChanged':False,'newReleaseTagCreated':False,'publishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
Path('/workspace/oliva-quiet-ux-audit-github-backup.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record))
