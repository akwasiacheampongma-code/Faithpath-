from pathlib import Path
import os,subprocess,json,hashlib,re
ROOT=Path('/workspace/faithpath-next');EVIDENCE=ROOT/'docs/evidence/life-topics-integration'
VERSION='0.15.0';BASE='c573b3021436789d8dc3780da63a176a33f7caad'
RELEASE_BRANCH='feature/oliva-life-topics-20261117';PUBLISH_BRANCH='feature/oliva-v015-life-topics-20261117';SOURCE_TAG='oliva-v0.15.0-life-topics-private'
PRIVATE_PROJECT='appgprj_6aedf77e5ce0819180c10eb799447018';PRIVATE_URL='https://oliva-v04-private-preview.purplebean128.chatgpt.site'
GITHUB_PARENT='b5476721825d54c4e86e42965e5d0658dcfaf5d8'
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
 assert len(paths)==len(set(paths))==351 and set(paths)==expected
 h=hashlib.sha256()
 for item in d['files']:
  p=ROOT/item['path'];assert not p.is_symlink() and p.resolve().is_relative_to(ROOT)
  raw=p.read_bytes();assert len(raw)==item['bytes'] and hashlib.sha256(raw).hexdigest()==item['sha256'],item['path']
  h.update(item['path'].encode()+b'\0'+raw+b'\0')
 assert h.hexdigest()==d['runtimeSourceDigest']['sha256']=='c2e8a15dc1ec16010b463389d379396947f53a0f71accfa3da463326edd2b485'
 return d['runtimeSourceDigest']
def guard(require_summary=True):
 assert git('branch','--show-current')==RELEASE_BRANCH
 subprocess.run(['git','merge-base','--is-ancestor',BASE,'HEAD'],cwd=ROOT,env=SAFE_ENV,check=True)
 pkg=json.loads((ROOT/'package.json').read_text());lock=json.loads((ROOT/'package-lock.json').read_text())
 assert pkg['version']==lock['version']==lock['packages']['']['version']==json.loads((ROOT/'app.json').read_text())['expo']['version']==VERSION
 digest=verify_inputs();core=re.search(r'name="oliva-build" content="([^"]+)"',(ROOT/'dist/index.html').read_text()).group(1)
 assert core=='oliva-2a5dee07245f877a'
 packaging=read('packaging-inputs.json');h=hashlib.sha256()
 assert {f['path'] for f in packaging['files']}=={'LICENSE','THIRD_PARTY_NOTICES.md','scripts/pwa.mjs','scripts/offline.mjs','content/faithpath-stories/RIGHTS.md','content/faithpath-topics/RIGHTS.md'}
 for item in packaging['files']:
  raw=(ROOT/item['path']).read_bytes();assert len(raw)==item['bytes'] and hashlib.sha256(raw).hexdigest()==item['sha256'];h.update(item['path'].encode()+b'\0'+raw+b'\0')
 assert h.hexdigest()==packaging['sha256']=='5d4e0b00a8e15fed651709989ed6af9824b9db1c16aad51368d8222e95e2a7a6'
 for name in ['THIRD_PARTY_NOTICES.txt','licenses/THIRD_PARTY_NOTICES.txt']:assert (ROOT/'dist'/name).read_bytes()==(ROOT/'THIRD_PARTY_NOTICES.md').read_bytes()
 assert (ROOT/'dist/licenses/MIT.txt').read_bytes()==(ROOT/'LICENSE').read_bytes()
 sw=(ROOT/'dist/sw.js').read_text();assert sw.startswith('const ID='+json.dumps(core)+',URLS=') and ',VERSION='+json.dumps(VERSION)+';' in sw
 unit=read('unit-results.json');assert unit['success'] and unit['numTotalTests']==unit['numPassedTests']==321 and unit['numFailedTests']==unit['numPendingTests']==0
 browser=read('e2e-results-final.json');stats=browser['stats'];assert stats['expected']==144 and all(stats[k]==0 for k in ['unexpected','flaky','skipped']) and not browser.get('errors')
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
 assert len(found)==144
 assert len(read('content-checks.json'))==7
 for item in read('content-checks.json'):assert item['exitCode']==0 and sha(ROOT/item['log'])==item['sha256']
 assert read('npm-audit.json')['metadata']['vulnerabilities']['total']==0
 assert 'error TS' not in (EVIDENCE/'typecheck.txt').read_text()
 original=read('original-reference-integrity.json');assert original['materializedFiles']==390 and original['allOriginalGitBlobHashesMatch']
 native=read('native/native-builds.json');assert native['version']==VERSION and native['allPassed'] and native['sourceUnchangedDuringExports'] and native['runtimeSourceDigest']==digest
 assert {e['platform'] for e in native['exports']}=={'android','ios'} and all(e['exitCode']==0 for e in native['exports'])
 assert read('native/native-export-check.json')['ok'] and read('native/nt-native-catalog-check.json')['status']=='PASS'
 story=read('native/story-native-catalog-check.json');assert story['status']=='PASS' and story['counts']=={'units':436,'questions':2479,'reflectionPrompts':436,'aliasPairs':95,'books':66}
 topics=read('native/topic-native-catalog-check.json');assert topics['status']=='PASS' and topics['topics']==18 and topics['references']==45 and {x['platform'] for x in topics['exports']}=={'android','ios'}
 upgrade=read('upgrade/final-r1/offline-upgrade.json');assert upgrade['passed'] and upgrade['baselineVersion']=='0.14.0' and upgrade['targetVersion']==VERSION and upgrade['targetBuild']==core
 for flag in ['realWorkerActivation','sameOriginPersistentProfile','allFourRawV10RecordsExactBeforeNewActions','firstExplicitTopicOpeningOnlyMigratesVersionAndNavigation','newTopicReflectionKeepsAllOldDomainsAndDrafts','oldStoryDraftKeepsBothOriginalRanges','oldNtAnswerUnchanged','actualV11DownloadAndRestorePreview','restoreWasNotApplied','builtHtmlAndWorkersUnchanged','sourceUnchangedDuringUpgrade']:assert upgrade[flag] is True,flag
 assert upgrade['packagingInputsBefore']==upgrade['packagingInputsAfter'] and upgrade['packagingInputsAfter']['sha256']==packaging['sha256']
 assert upgrade['offlineA51Stages']==7 and upgrade['runtimeInputsBefore']==upgrade['runtimeInputsAfter'] and upgrade['runtimeInputsAfter']['sha256']==digest['sha256']
 assert upgrade['targetHtmlSha256']==sha(ROOT/'dist/index.html') and upgrade['targetWorkerSha256']==sha(ROOT/'dist/sw.js')
 execution=read('upgrade/execution-r1.json');assert execution['exitCode']==0 and execution['runnerSha256']==sha(ROOT/execution['runner']) and execution['logSha256']==sha(ROOT/execution['log'])
 result={'version':VERSION,'allCoreChecksPassed':True,'dataVersion':11,'coreBuild':core,'fullBrowserExecutableBuild':core,'packagingSourceDigest':packaging['sha256'],'runtimeSourceDigest':digest,'unit':{'passed':321,'total':321,'failed':0,'pending':0},'browser':{'passed':144,'total':144,'unexpected':0,'flaky':0,'skipped':0,'singleFullGreenRun':True,'allResultsSingleAttempt':True},'originalLifeTopics':{'topics':18,'references':45,'contexts':45,'reflectionPrompts':45},'originalStories':{'units':436,'questions':2479,'reflectionPrompts':436,'aliasPairs':95},'existingGuidedPaths':9,'nativeExecution':False,'masterDefinitionOfDoneComplete':False}
 if require_summary:
  summary=read('validation-summary.json')
  for k,v in result.items():assert summary[k]==v,k
  return summary
 return result
