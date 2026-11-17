from pathlib import Path
import os,subprocess,json,hashlib,re
ROOT=Path('/workspace/faithpath-next');EVIDENCE=ROOT/'docs/evidence/stories-integration'
VERSION='0.14.0';BASE='b1bd8be6a9fb43be79b163ad71d0a6be3ab48aa7'
RELEASE_BRANCH='feature/oliva-stories-integration-20261116';PUBLISH_BRANCH='feature/oliva-v014-original-stories-20261117';SOURCE_TAG='oliva-v0.14.0-stories-private'
PRIVATE_PROJECT='appgprj_6aedf77e5ce0819180c10eb799447018';PRIVATE_URL='https://oliva-v04-private-preview.purplebean128.chatgpt.site'
GITHUB_PARENT='f4528e4dc8f4fcfaaa26059f00eb8128cf2747cf'
SAFE_ENV={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']};SAFE_ENV['GIT_TERMINAL_PROMPT']='0'
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,env=SAFE_ENV).decode().strip()
def read(name):
 p=Path(name);assert not p.is_absolute() and '..' not in p.parts
 return json.loads((EVIDENCE/p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def verify_inputs():
 d=read('runtime-inputs.json');paths=[r['path'] for r in d['files']]
 expected={p.relative_to(ROOT).as_posix() for folder in ['app','src','assets'] for p in (ROOT/folder).rglob('*') if p.is_file()}
 expected|={'app.json','package.json','package-lock.json','art/a51/native-derivatives.json','art/swords/runtime.json','art/swords/romans-runtime.json','art/swords/runtime-index.json'}
 assert len(paths)==len(set(paths))==344 and set(paths)==expected
 h=hashlib.sha256()
 for f in d['files']:
  p=ROOT/f['path'];assert not p.is_symlink() and p.resolve().is_relative_to(ROOT)
  raw=p.read_bytes();assert len(raw)==f['bytes'] and hashlib.sha256(raw).hexdigest()==f['sha256'],f['path']
  h.update(f['path'].encode()+b'\0'+raw+b'\0')
 assert h.hexdigest()==d['runtimeSourceDigest']['sha256']=='63e540c438f6c002429e22b0df45c51c4b370bcb344ae51f8a7855c9080e0976'
 return d['runtimeSourceDigest']
def guard(require_summary=True):
 assert git('branch','--show-current')==RELEASE_BRANCH
 subprocess.run(['git','merge-base','--is-ancestor',BASE,'HEAD'],cwd=ROOT,env=SAFE_ENV,check=True)
 pkg=json.loads((ROOT/'package.json').read_text());lock=json.loads((ROOT/'package-lock.json').read_text())
 assert pkg['version']==lock['version']==lock['packages']['']['version']==json.loads((ROOT/'app.json').read_text())['expo']['version']==VERSION
 digest=verify_inputs();core=re.search(r'name="oliva-build" content="([^"]+)"',(ROOT/'dist/index.html').read_text()).group(1)
 assert core=='oliva-2077ca680180fb6b'
 parity=read('rights-packaging-parity.json');assert parity['fullRegressionBuild']=='oliva-fb1fc932602d5898' and parity['finalPackagingBuild']==core
 old=Path(parity['baselineDirectory']);assert old==Path('/workspace/oliva-v014-before-rights-web')
 expected_changes={'index.html','sw.js','THIRD_PARTY_NOTICES.txt','licenses/MIT.txt','licenses/THIRD_PARTY_NOTICES.txt'}
 before={p.relative_to(old).as_posix():sha(p) for p in old.rglob('*') if p.is_file()};after={p.relative_to(ROOT/'dist').as_posix():sha(p) for p in (ROOT/'dist').rglob('*') if p.is_file()}
 assert before.keys()==after.keys() and {p for p in before if before[p]!=after[p]}==expected_changes
 for p in ['index.html','sw.js']:assert (old/p).read_bytes().replace(parity['fullRegressionBuild'].encode(),core.encode())==(ROOT/'dist'/p).read_bytes()
 packaging=read('packaging-inputs.json');h=hashlib.sha256()
 assert {f['path'] for f in packaging['files']}=={'LICENSE','THIRD_PARTY_NOTICES.md','scripts/pwa.mjs','scripts/offline.mjs','content/faithpath-stories/RIGHTS.md'}
 for item in packaging['files']:
  raw=(ROOT/item['path']).read_bytes();assert len(raw)==item['bytes'] and hashlib.sha256(raw).hexdigest()==item['sha256'];h.update(item['path'].encode()+b'\0'+raw+b'\0')
 assert h.hexdigest()==packaging['sha256']=='e8ee6fc9873f22eddc22f715a4ed6a0cfcc94118d929453ec5acb2218730583f'
 assert (ROOT/'dist/THIRD_PARTY_NOTICES.txt').read_bytes()==(ROOT/'THIRD_PARTY_NOTICES.md').read_bytes()
 assert (ROOT/'dist/licenses/THIRD_PARTY_NOTICES.txt').read_bytes()==(ROOT/'THIRD_PARTY_NOTICES.md').read_bytes()
 assert (ROOT/'dist/licenses/MIT.txt').read_bytes()==(ROOT/'LICENSE').read_bytes()

 sw=(ROOT/'dist/sw.js').read_text();assert sw.startswith('const ID='+json.dumps(core)+',URLS=') and ',VERSION='+json.dumps(VERSION)+';' in sw
 unit=read('unit-results.json');assert unit['success'] and unit['numTotalTests']==unit['numPassedTests']==312 and unit['numFailedTests']==unit['numPendingTests']==0
 browser=read('e2e-results-final-r4.json');stats=browser['stats'];assert stats['expected']==138 and all(stats[k]==0 for k in ['unexpected','flaky','skipped']) and not browser.get('errors')
 assert browser['config']['workers']==1 and browser['config']['argv'][2]=='test' and all(a.startswith('--output=') for a in browser['config']['argv'][3:])
 assert set(s['file'] for s in browser['suites'])==set(p.name for p in (ROOT/'tests/e2e').glob('*.spec.ts'))
 found=[]
 def walk(s):
  for spec in s.get('specs',[]):
   for t in spec.get('tests',[]):
    assert t['status']=='expected' and len(t['results'])==1 and t['results'][0]['status']=='passed' and t['results'][0].get('retry',0)==0
    found.append(spec['title'])
  for child in s.get('suites',[]):walk(child)
 for s in browser['suites']:walk(s)
 assert len(found)==138
 assert len(read('content-checks.json'))==6
 for item in read('content-checks.json'):assert item['exitCode']==0 and sha(ROOT/item['log'])==item['sha256']
 assert read('npm-audit.json')['metadata']['vulnerabilities']['total']==0
 assert 'error TS' not in (EVIDENCE/'typecheck-final-r2.txt').read_text()
 assert read('original-reference-integrity.json')['materializedFiles']==390 and read('original-reference-integrity.json')['allOriginalGitBlobHashesMatch']
 assert read('type-only-emission-comparison.json')['allExportPathsAndSHA256Equal']
 native=read('native/native-builds.json');assert native['version']==VERSION and native['allPassed'] and native['sourceUnchangedDuringExports'] and native['runtimeSourceDigest']==digest
 assert {e['platform'] for e in native['exports']}=={'android','ios'} and all(e['exitCode']==0 for e in native['exports'])
 assert read('native/native-export-check.json')['ok']
 assert read('native/nt-native-catalog-check.json')['status']=='PASS'
 story=read('native/story-native-catalog-check.json');assert story['status']=='PASS' and story['counts']=={'units':436,'questions':2479,'reflectionPrompts':436,'aliasPairs':95,'books':66}
 upgrade=read('upgrade/final-'+core+'/offline-upgrade.json');assert upgrade['passed'] and upgrade['baselineVersion']=='0.13.1' and upgrade['targetVersion']==VERSION and upgrade['targetBuild']==core
 for flag in ['realWorkerActivation','sameOriginPersistentProfile','allFourRawV9RecordsExactBeforeNewActions','firstExplicitWriteMigratedOnlyVersionRevisionStoryStudy','storyDraftResumedWithBothOriginalRanges','oldNtAnswerUnchanged','actualV10DownloadAndRestorePreview','restoreWasNotApplied','allOriginalDomainsAndNonMainRecordsPreserved','builtHtmlAndWorkersUnchanged','sourceUnchangedDuringUpgrade']:assert upgrade[flag] is True,flag
 assert upgrade['packagingInputsBefore']==upgrade['packagingInputsAfter'] and upgrade['packagingInputsAfter']['sha256']==packaging['sha256']
 assert upgrade['offlineA51Stages']==7 and upgrade['runtimeInputsBefore']==upgrade['runtimeInputsAfter'] and upgrade['runtimeInputsAfter']['sha256']==digest['sha256']
 assert upgrade['targetHtmlSha256']==sha(ROOT/'dist/index.html') and upgrade['targetWorkerSha256']==sha(ROOT/'dist/sw.js')
 execution=read('upgrade/execution-rights.json');assert execution['exitCode']==0 and execution['runnerSha256']==sha(ROOT/execution['command'][1]) and execution['logSha256']==sha(EVIDENCE/execution['log'])
 result={'version':VERSION,'allCoreChecksPassed':True,'dataVersion':10,'coreBuild':core,'fullBrowserExecutableBuild':parity['fullRegressionBuild'],'rightsOnlyRepackVerified':True,'packagingSourceDigest':packaging['sha256'],'runtimeSourceDigest':digest,'unit':{'passed':312,'total':312,'failed':0,'pending':0},'browser':{'passed':138,'total':138,'unexpected':0,'flaky':0,'skipped':0,'singleFullGreenRun':True,'allResultsSingleAttempt':True},'originalStories':{'units':436,'questions':2479,'reflectionPrompts':436,'aliasPairs':95},'nativeExecution':False,'masterDefinitionOfDoneComplete':False}
 if require_summary:
  summary=read('validation-summary.json')
  for k,v in result.items():assert summary[k]==v,k
  return summary
 return result
