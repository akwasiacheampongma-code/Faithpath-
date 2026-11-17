from pathlib import Path
import os,json,hashlib,re,subprocess
ROOT=Path('/workspace/faithpath-next')
EVIDENCE=ROOT/'docs/evidence/single-spirit-sword/candidate18'
VERSION='0.18.0';CORE='oliva-6e2b52bb8e634041'
PRIVATE_PROJECT='appgprj_6aedf77e5ce0819180c10eb799447018'
PRIVATE_URL='https://oliva-v04-private-preview.purplebean128.chatgpt.site'
SOURCE_TAG='oliva-v0.18.0-single-spirit-sword-private'
RELEASE_BRANCH=PUBLISH_BRANCH='feature/oliva-single-spirit-sword-20261117'
SAFE_ENV={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']}
SAFE_ENV['GIT_TERMINAL_PROMPT']='0'
def read(name):return json.loads((EVIDENCE/name).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,env=SAFE_ENV).decode().strip()
def verify_inputs():
 proof=read('runtime-inputs.json');names={f['path'] for f in proof['files']}
 actual={p.relative_to(ROOT).as_posix() for folder in ['app','src','assets'] for p in (ROOT/folder).rglob('*') if p.is_file()}
 actual|={'app.json','package.json','package-lock.json','art/a51/native-derivatives.json','art/spiritual-sword/runtime.json'}
 assert names==actual and len(names)==344
 h=hashlib.sha256()
 for f in proof['files']:
  p=ROOT/f['path'];assert not p.is_symlink();b=p.read_bytes();assert len(b)==f['bytes'] and hashlib.sha256(b).hexdigest()==f['sha256'];h.update(f['path'].encode()+b'\0'+b+b'\0')
 assert h.hexdigest()==proof['sha256']=='29b2c6c4292c38e943108a4afd5de003e150d9ed47cf9f4269a53b565e46f0ab'
 return {k:proof[k] for k in ['algorithm','fileCount','sha256']}
def guard():
 digest=verify_inputs();package=json.loads((ROOT/'package.json').read_text());lock=json.loads((ROOT/'package-lock.json').read_text());app=json.loads((ROOT/'app.json').read_text())
 assert package['version']==lock['version']==lock['packages']['']['version']==app['expo']['version']==VERSION
 assert re.search('name="oliva-build" content="([^"]+)"',(ROOT/'dist/index.html').read_text()).group(1)==CORE
 assert ',VERSION='+json.dumps(VERSION)+';' in (ROOT/'dist/sw.js').read_text()
 steps=read('execution.json');assert len(steps)==10 and all(s['exitCode']==0 and sha(ROOT/s['log'])==s['sha256'] for s in steps)
 unit=read('unit-results.json');assert unit['success'] and unit['numPassedTests']==unit['numTotalTests']==343 and unit['numFailedTests']==unit['numPendingTests']==unit['numTodoTests']==0
 full=ROOT/'docs/evidence/single-spirit-sword/full-r2';run=json.loads((full/'execution.json').read_text());browser=json.loads((full/'e2e-results.json').read_text())
 assert run['exitCode']==0 and run['workers']==1 and run['retries']==0 and not run['filtered'] and run['runtimeSourceSHA256']==digest['sha256']
 assert sha(ROOT/run['log'])==run['logSHA256'] and run['startedAt']>steps[-1]['finishedAt']
 assert browser['stats']['expected']==146 and all(browser['stats'][k]==0 for k in ['unexpected','flaky','skipped']) and not browser['errors']
 cases=[]
 def walk(suites):
  for s in suites:
   for p in s.get('specs',[]):cases.extend(p['tests'])
   walk(s.get('suites',[]))
 walk(browser['suites']);assert len(cases)==146 and all(t['status']=='expected' and len(t['results'])==1 and t['results'][0]['status']=='passed' and t['results'][0].get('retry',0)==0 and not t['results'][0].get('errors') for t in cases)
 assert {s['file'] for s in browser['suites']}=={p.name for p in (ROOT/'tests/e2e').glob('*.spec.ts')}
 native=read('native/summary.json');assert native['allPassed'] and native['sourceUnchanged'] and native['runtimeSourceSHA256']==digest['sha256'] and not native['nativeExecution']
 assert all(x['exitCode']==0 for x in read('native/execution.json'))
 corruption=read('native/checker-corruption/corruption-checks.json');assert corruption['allPassed'] and corruption['cases']==14 and corruption['temporaryCopyRemovedAfterChecks']
 upgrade=read('upgrade/r1/offline-upgrade.json');assert upgrade['passed'] and upgrade['baselineVersion']=='0.17.0' and upgrade['baselineBuild']=='oliva-c4e0bc1e9484a00e' and upgrade['targetVersion']==VERSION and upgrade['targetBuild']==CORE
 assert all(upgrade[k] for k in ['allFourRawV11RecordsExactThroughout','singleStaticSwordAvailableOffline','bookSwordGalleryRemoved','all66BooksAvailable','actualV11DownloadAndRestorePreview','restoreWasNotApplied','sourceUnchangedDuringUpgrade','realWorkerActivation'])
 assert upgrade['offlineA51Stages']==7 and upgrade['runtimeInputsAfter']['sha256']==digest['sha256']
 packaging=read('packaging-inputs.json');h=hashlib.sha256()
 for f in packaging['files']:
  b=(ROOT/f['path']).read_bytes();assert len(b)==f['bytes'] and hashlib.sha256(b).hexdigest()==f['sha256'];h.update(f['path'].encode()+b'\0'+b+b'\0')
 assert h.hexdigest()==packaging['sha256']==upgrade['packagingInputsAfter']['sha256']
 art=json.loads(subprocess.check_output(['node','scripts/check-sword-art.mjs'],cwd=ROOT,env=SAFE_ENV));assert art['activeRuntimeImages']==1 and art['originalsUnmodified'] and art['historicalOriginalFilesUnchanged']==45
 web=read('web-runtime-check.json');assert web['activeImageCount']==1 and web['retiredAssetHashesExcluded']==8 and web['noRetiredBookSwordUi']
 audit=json.loads((ROOT/'docs/evidence/single-spirit-sword/production-audit.json').read_text());assert audit['metadata']['vulnerabilities']['total']==0
 return {'version':VERSION,'coreBuild':CORE,'runtimeSourceDigest':digest,'unit':{'passed':343,'total':343},'browser':{'passed':146,'total':146,'singleFullGreenRun':True,'singleAttempt':True},'appDataVersion':11,'nativeExecution':False,'allCoreChecksPassed':True,'singleSpiritualSword':True,'bookSwordCollection':False,'activeSwordImages':1,'originalArtFilesPreserved':45,'retiredVariantsArchived':9,'all66BooksPreserved':True,'pwaUpgradeAllFourRawRecordsExact':True,'masterDefinitionOfDoneComplete':False}
