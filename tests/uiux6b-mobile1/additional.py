"""Sequential additional gates; preserve original QA folders and log every exit."""
import json, os, pathlib, subprocess, time
root=pathlib.Path(__file__).resolve().parents[2]
dest=root/'qa-output/uiux6b-mobile1/additional'; dest.mkdir(parents=True,exist_ok=True)
manifest=json.loads((root/'qa-output/uiux6b-mobile1/candidate/release-integrity.json').read_text())
cases=[('unit',['npm','test']),('nt-source',['npm','run','validate:nt-quiz']),('nachlese-source',['npm','run','validate:nachlese-editorial'])]
cases += [(name,['node','tests/uiux6b/'+name+'.mjs']) for name in ['backup-lifecycle','focus','reader-smoke','editorial','reading-focus','fullscreen','contrast']]
cases += [('editorial-browser',['node','tests/nachlese-editorial-browser.mjs']),('states',['node','tests/uiux6b/states-capture.mjs']),('focused',['node','tests/uiux6b-mobile1/focused.mjs']),('update',['node','tests/uiux6b-mobile1/update.mjs'])]
if os.environ.get('QA_CASES'): cases=[c for c in cases if c[0] in os.environ['QA_CASES'].split(',')]
results=[]
for name,cmd in cases:
    start=time.time()
    env={**os.environ,'QA_URL':'http://127.0.0.1:4516','QA_OUT':str(dest.relative_to(root)/name)}
    with (dest/(name+'.log')).open('w') as log:
        try: code=subprocess.run(cmd,cwd=root,env=env,stdout=log,stderr=subprocess.STDOUT,timeout=1800).returncode
        except subprocess.TimeoutExpired: code=124
    result={'name':name,'command':cmd,'exit':code,'seconds':time.time()-start,'build':manifest['build'],'buildHash':manifest['build_hash'],'sourceCommit':manifest['source_commit']}
    results.append(result);print(json.dumps(result),flush=True)
    (dest/(name+'-exit.json')).write_text(json.dumps(result,indent=2))
(dest/'exits.json').write_text(json.dumps(results,indent=2))
raise SystemExit(any(r['exit'] for r in results))
