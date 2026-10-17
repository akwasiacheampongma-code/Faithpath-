"""Original combined UIUX1–5 acceptance suite against an immutable 6B build.
Presentation selectors follow renamed headings and the compact tree. Business, content and storage assertions remain. Axe contexts alone permit diagnostic styles; the separate uninstrumented route audit retains CSP.
"""
import concurrent.futures,json,os,pathlib,subprocess,time
root=pathlib.Path(__file__).resolve().parents[2]
dest=root/os.environ.get('QA_DEST','qa-output/uiux6b/regression');dest.mkdir(parents=True,exist_ok=True)
build_root=os.environ.get('FAITHPATH_TEST_ROOT','qa-output/uiux6b/release-final')
url=os.environ.get('QA_URL','http://127.0.0.1:4506')
common=dict(QA_URL=url,FAITHPATH_QA_URL=url,FAITHPATH_CHROMIUM='/usr/bin/chromium',FAITHPATH_TEST_ROOT=build_root,FAITHPATH_CONTINUITY_BASELINE_URL='http://127.0.0.1:4450',QA_RESTORE_URL=os.environ.get('QA_RESTORE_URL','http://127.0.0.1:4507'),FAITHPATH_CORE_URL=url,PHASE='C')
cases=[('core','browser',dict(FAITHPATH_PORT='4468')),('stabilization','stabilization-browser',{}),('chapter','chapter-questions-browser',{}),('nt','nt-quiz-browser',{}),('nachlese','nachlese-mc-corpus-browser',{}),('mc-fixtures','nachlese-mc-browser',{}),('worker','service-worker',{}),('today','today-phase1-browser',{}),('today-zoom','today-phase1-zoom',{}),('phase2','phase2-browser',{}),('phase2-stress','phase2-stress',{}),('phase2-short','phase2-short-chapter-browser',{}),('experience','final-experience-browser',{}),('core-depth','core-depth-browser',{}),('core-axe','core-depth-accessibility',{}),('continuity','continuity-browser',{}),('branches','tree-branch-visual-browser',{}),('overview','phase3-overview-browser',{}),('detail','phase3-detail-browser',{}),('tree','phase3-tree-browser',{}),('reviews-original','phase3-review-browser',{}),('phase3-stress','phase3-stress',{}),('journey','phase3-journey-browser',{}),('short-navigation','phase3-short-navigation',{}),('premium-journal','premium-journal-browser',{}),('final-notes','final-note-browser',{}),('product','final-product-browser',{}),('navigation','phase4-navigation-browser',{}),('discover','phase4-discover-browser',{}),('onboarding','phase4-onboarding-browser',{}),('routes','phase4-routes-browser',{}),('menu-focus','phase4-menu-focus-browser',{}),('phase4-stress','phase4-stress-browser',{}),('journal','phase5-journal-browser',{}),('reviews','phase5-reviews-browser',{}),('reminders','phase5-reminders-browser',{}),('backup','phase5-backup-browser',{}),('backup-races','phase5-backup-races-browser',{}),('backup-dialogs','phase5-backup-dialogs-browser',{}),('phase5-stress','phase5-stress-browser',{}),('integration','uiux45-integration-browser',{})]
if os.environ.get('QA_CASES'):
    selected=set(os.environ['QA_CASES'].split(','));cases=[x for x in cases if x[0] in selected]
manifest=json.loads((root/build_root/'release-integrity.json').read_text())
def run(case):
    name,script,extra=case;start=time.time();output=str(dest.relative_to(root)/name)
    with (dest/(name+'.log')).open('w') as log:
        try:
            p=subprocess.run(['node',f'tests/{script}.mjs'],cwd=root,env={**os.environ,**common,'QA_OUT':output,'FAITHPATH_QA_OUT':output,'FAITHPATH_CORE_OUT':output,**extra},stdout=log,stderr=subprocess.STDOUT,timeout=1800)
            code=p.returncode
        except subprocess.TimeoutExpired:code=124
    result=dict(name=name,script=script,exit=code,started=start,ended=time.time(),build=manifest['build'],buildHash=manifest['build_hash'],sourceCommit=manifest['source_commit'])
    (dest/(name+'-exit.json')).write_text(json.dumps(result,indent=2));print(json.dumps(result),flush=True);return result
with concurrent.futures.ThreadPoolExecutor(max_workers=int(os.environ.get('QA_CONCURRENCY','3'))) as pool:results=list(pool.map(run,cases))
(dest/'exits.json').write_text(json.dumps(results,indent=2))
raise SystemExit(any(x['exit'] for x in results))
