"""Run combined browser regression against one frozen build; synthetic data only."""
import concurrent.futures,json,os,pathlib,subprocess,time
root=pathlib.Path(__file__).resolve().parents[1]
out=root/'qa-output/uiux45';logs=out/'logs';logs.mkdir(parents=True,exist_ok=True)
url=os.environ.get('QA_URL','http://127.0.0.1:4453')
common=dict(QA_URL=url,FAITHPATH_QA_URL=url,FAITHPATH_CHROMIUM='/usr/bin/chromium',FAITHPATH_TEST_ROOT='qa-output/uiux45/final-a',FAITHPATH_CONTINUITY_BASELINE_URL='http://127.0.0.1:4450',QA_RESTORE_URL='http://127.0.0.1:4454')
# name, script, overrides; scripts retain their existing assertions and synthetic fixtures.
cases=[('core','browser',dict(FAITHPATH_PORT='4468')),('stabilization','stabilization-browser',{}),('chapter','chapter-questions-browser',{}),('nt','nt-quiz-browser',{}),('nachlese','nachlese-mc-corpus-browser',{}),('mc-fixtures','nachlese-mc-browser',{}),('worker','service-worker',{}),('today','today-phase1-browser',{}),('today-zoom','today-phase1-zoom',{}),('phase2','phase2-browser',dict(PHASE='C')),('phase2-stress','phase2-stress',{}),('phase2-short','phase2-short-chapter-browser',{}),('experience','final-experience-browser',{}),('core-depth','core-depth-browser',dict(FAITHPATH_CORE_URL=url)),('core-axe','core-depth-accessibility',{}),('continuity','continuity-browser',{}),('branches','tree-branch-visual-browser',{}),('overview','phase3-overview-browser',{}),('detail','phase3-detail-browser',{}),('tree','phase3-tree-browser',{}),('reviews-original','phase3-review-browser',{}),('phase3-stress','phase3-stress',{}),('journey','phase3-journey-browser',{}),('short-navigation','phase3-short-navigation',{}),('premium-journal','premium-journal-browser',{}),('final-notes','final-note-browser',{}),('product','final-product-browser',{}),('navigation','phase4-navigation-browser',{}),('discover','phase4-discover-browser',{}),('onboarding','phase4-onboarding-browser',{}),('routes','phase4-routes-browser',{}),('menu-focus','phase4-menu-focus-browser',{}),('phase4-stress','phase4-stress-browser',{}),('journal','phase5-journal-browser',{}),('reviews','phase5-reviews-browser',{}),('reminders','phase5-reminders-browser',{}),('backup','phase5-backup-browser',{}),('backup-races','phase5-backup-races-browser',{}),('backup-dialogs','phase5-backup-dialogs-browser',{}),('phase5-stress','phase5-stress-browser',{}),('integration','uiux45-integration-browser',{})]
if os.environ.get('QA_CASES'):
 selected=set(os.environ['QA_CASES'].split(','));cases=[c for c in cases if c[0] in selected]
def run(case):
 name,script,extra=case;start=time.time();dest=f'qa-output/uiux45/{name}'
 with(logs/(name+'.log')).open('w')as f:
  p=subprocess.run(['node',f'tests/{script}.mjs'],cwd=root,env={**os.environ,**common,'QA_OUT':dest,'FAITHPATH_QA_OUT':dest,'FAITHPATH_CORE_OUT':dest,**extra},stdout=f,stderr=subprocess.STDOUT)
 result=dict(name=name,script=script,exit=p.returncode,started=start,ended=time.time());(logs/(name+'-exit.json')).write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True);return result
with concurrent.futures.ThreadPoolExecutor(max_workers=int(os.environ.get('QA_CONCURRENCY','3')))as pool:results=list(pool.map(run,cases))
(logs/('exits-'+str(int(time.time()))+'.json')).write_text(json.dumps(results,indent=2))
raise SystemExit(any(x['exit']for x in results))
