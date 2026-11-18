from pathlib import Path
import os, subprocess, json, runpy, datetime

root=Path('/workspace/faithpath-next')
common=runpy.run_path(str(root/'docs/evidence/today-focus/checks.py'))
summary=common['guard']()
env=common['SAFE_ENV']
def git(*args):
    return subprocess.check_output(['git',*args],cwd=root,env=env).decode().strip()
base='0d997e2b0905e40a56eb9b796b900215cd175175'
branch='feature/oliva-today-focus-20261118'
assert git('rev-parse','HEAD')==base and git('branch','--show-current')==branch
assert git('rev-parse','oliva-pre-today-focus-20261118^{}')==base
scan=json.loads((root/'docs/evidence/today-focus/actual-session-secret-scan.json').read_text())
assert scan['passed'] and scan['actualSessionTokensChecked']>=1
def paths(*args):
    return {p.decode()for p in subprocess.check_output(['git',args[0],'-z',*args[1:]],cwd=root,env=env).split(b'\0')if p}
changed=paths('diff','--name-only')|paths('diff','--cached','--name-only')|paths('ls-files','--others','--exclude-standard')
allowed_exact={'app/index.tsx','tests/e2e/core.spec.ts','tests/e2e/invitations.spec.ts','tests/e2e/today.spec.ts','scripts/capture-today.mjs','scripts/create-today-review.py','README.md','RESUME.md'}
assert changed and all(p in allowed_exact or p.startswith(('docs/','design-previews/today-focus/'))for p in changed)
assert paths('diff','--name-only',base,'--','app','src','assets','app.json','package.json','package-lock.json')=={'app/index.tsx'}
git('add','--all')
git('diff','--cached','--check','--','.',':!docs/evidence/today-focus/*.log',':!docs/evidence/today-focus/first-checks/**')
git('commit','-q','-m','Simplify Today with a clear reading entry, flexible landscape and preserved personal data')
head=git('rev-parse','HEAD');assert not git('status','--porcelain')
record={'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownSourceCommit':head,'ownSourceTree':git('rev-parse','HEAD^{tree}'),'ownBaselineCommit':base,'githubParent':'5cce743af97d2ff68fa871a0ab4879c696012ccd','branch':branch,'appVersionBasis':'0.18.0','newFormalRelease':False,'onlyChangedApplicationFile':'app/index.tsx','runtimeDigest':summary['runtimeSourceDigest']['sha256'],'coreBuild':summary['coreBuild'],'unitTests':343,'qualifiedBrowserCases':39,'singleFullBrowserRun':False,'securityAuditPassed':False,'privateDeploymentPending':True,'changedFiles':len(changed)}
Path('/workspace/oliva-today-focus-checkpoint.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record))
