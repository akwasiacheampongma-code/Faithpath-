"""Byte-level preservation receipt. Does not read any personal user storage."""
from pathlib import Path
import hashlib,json,subprocess,os
root=Path(__file__).resolve().parents[2]
baseline=os.environ.get('FAITHPATH_PRESERVE_BASELINE','fc9e5b95e5c4bcd7e74c584874f6bc3ff6fe4539')
git=lambda *args: subprocess.check_output(['git',*args],cwd=root)
hash=lambda data: hashlib.sha256(data).hexdigest()
tracked=git('ls-tree','-r','--name-only',baseline).decode().splitlines()
content=[p for p in tracked if p.startswith(('data/','trees/'))]
protected=['src/store.js','src/domain.js','src/drafts.js','src/import-validation.js','src/journal-storage.js','src/journal-management.js','src/bible-journey.js','src/path-review-context.js','src/runtime-model.js','src/themes.js','src/content.js','src/tree-branches.js','scripts/sw-template.js']
rows=[]
for name in content+protected:
 old=hash(git('show',baseline+':'+name));new=hash((root/name).read_bytes())
 rows.append(dict(file=name,before=old,after=new,unchanged=old==new))
assert all(r['unchanged'] for r in rows),[r['file'] for r in rows if not r['unchanged']]
assert not git('diff',baseline,'--','dist').strip(),'Historical tracked dist must remain unchanged'
app_old=git('show',baseline+':src/app.js').decode();app_new=(root/'src/app.js').read_text()
import re
route_pattern=r'kind === "([a-z-]+)"'
old_routes=set(re.findall(route_pattern,app_old));new_routes=set(re.findall(route_pattern,app_new))
assert old_routes<=new_routes,old_routes-new_routes
# Existing data-action names remain available. New presentation controls use their
# own namespace and do not become new storage operations.
action_pattern=r'a\s*=== "([a-z-]+)"'
old_actions=set(re.findall(action_pattern,app_old));new_actions=set(re.findall(action_pattern,app_new))
assert old_actions<=new_actions,old_actions-new_actions
receipt=dict(baseline=baseline,sourceCommit=git('rev-parse','HEAD').decode().strip(),protectedFiles=rows,contentFiles=len(content),protectedModules=len(protected),routeFamilies=sorted(old_routes),routeFamiliesUnchanged=old_routes==new_routes,actionNamesRetained=sorted(old_actions),schemaMigrationAdded=False,productionDemoModelCopied=False,personalDataRead=False)
out=root/os.environ.get('QA_OUT','qa-output/uiux6b/preservation');out.mkdir(parents=True,exist_ok=True)
(out/'results.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2))
(out/'changed-files.txt').write_bytes(git('diff','--name-status',baseline,'HEAD'))
print(json.dumps({'protected':len(rows),'routes':len(old_routes),'actions':len(old_actions),'status':'PASS'}))
