from pathlib import Path
import hashlib,json,os
ROOT=Path('/workspace/faithpath-next');EVIDENCE=ROOT/'docs/evidence/today-focus'
VERSION='0.18.0';CORE='oliva-d3cab1587b25292b';PRIVATE_PROJECT='appgprj_6aedf77e5ce0819180c10eb799447018'
SAFE_ENV={k:v for k,v in os.environ.items() if not(k.startswith('GIT_TRACE') or k in ['GIT_CURL_VERBOSE','GH_DEBUG'])}
def read(p):return json.loads((ROOT/p).read_text())
def verify_inputs():
 m=read('docs/evidence/today-focus/runtime-inputs.json');h=hashlib.sha256()
 for row in m['files']:
  b=(ROOT/row['path']).read_bytes();assert len(b)==row['bytes']and hashlib.sha256(b).hexdigest()==row['sha256'];h.update(row['path'].encode());h.update(b'\0');h.update(b);h.update(b'\0')
 assert h.hexdigest()==m['sha256']and len(m['files'])==344
 return {k:v for k,v in m.items()if k!='files'}
def guard():
 runtime=verify_inputs();unit=read('docs/evidence/today-focus/unit-results.json');assert unit['success']and unit['numPassedTests']==343 and unit['numFailedTests']==0
 first=read('docs/evidence/today-focus/first-checks/e2e-results.json');second=read('docs/evidence/today-focus/e2e-r2-results.json');assert first['stats']['expected']==38 and first['stats']['unexpected']==1
 assert second['stats']['expected']==6 and second['stats']['unexpected']==second['stats']['flaky']==second['stats']['skipped']==0
 existing=[]
 def visit(s):
  for spec in s.get('specs',[]):
   if not spec['file'].endswith('today.spec.ts'):
    for t in spec['tests']:
     assert len(t['results'])==1 and t['results'][0]['status']=='passed';existing.append(spec['title'])
  for child in s.get('suites',[]):visit(child)
 for suite in first['suites']:visit(suite)
 assert len(existing)==33
 quality=read('docs/evidence/today-focus/quality-steps.json');assert quality['allContentAndRuntimeChecksPassed']
 after=read('docs/evidence/today-focus/after.json');before=read('docs/evidence/today-focus/before.json');assert len(after['scenes'])==len(before['scenes'])==12 and not after.get('failure')and not before.get('failure')
 assert all(s['rawRecordsExact']and s['allExistingActionsPreserved']and not s['mainOverflow']and s['action']['fullyInFirstViewport']for s in after['scenes'])
 assert all(not s['text200']['mainOverflow']for s in after['scenes']if'text200'in s)
 upgrade=read('docs/evidence/today-focus/upgrade/offline-upgrade.json');assert upgrade['passed']and upgrade['allFourRawV11RecordsExactThroughout']and upgrade['sourceUnchangedDuringUpgrade']and upgrade['targetBuild']==CORE
 assert read('package.json')['version']==read('app.json')['expo']['version']==VERSION
 assert not any('error TS'in p for p in (EVIDENCE/'typecheck-final.log').read_text().splitlines())
 control = ROOT/'dist' if (ROOT/'dist').exists() else Path('/workspace/oliva-today-focus-control-dist')
 assert CORE in (control/'index.html').read_text()
 exported=read('docs/evidence/today-focus/export-inputs.json')
 for row in exported['files']:
  raw=(control/row['path']).read_bytes();assert len(raw)==row['bytes'] and hashlib.sha256(raw).hexdigest()==row['sha256']
 return {'version':VERSION,'workStatus':'Today-only working candidate on0.18basis; no new formal release','coreBuild':CORE,'runtimeSourceDigest':runtime,'onlyChangedApplicationFile':'app/index.tsx','unit':{'passed':343,'total':343},'browser':{'passed':39,'total':39,'existingCasesFromFirstRun':33,'todayCasesFromCorrectedRun':6,'singleFullRun':False},'screenshots':{'beforeStates':12,'afterStates':12,'widths':[320,375,390],'dataRecordsExact':True,'allExistingActionsPreserved':True},'typecheckPassed':True,'contentChecksPassed':True,'productionSecurityAuditPassed':quality['securityAuditPassed'],'knownSecurityAdvisory':'GHSA-fc5q-39xc-vjpf','pwaUpdateAllFourRawRecordsExact':True,'appDataVersion':11,'nativeExecution':False,'physicalDeviceTest':False,'simulatorTest':False,'newReleaseTag':False,'otherMainAreasChanged':False,'allCoreChecksPassed':False,'scopedLocalAcceptancePassed':True}
if __name__=='__main__':print(json.dumps(guard()))
