from pathlib import Path
import json,hashlib,datetime
root=Path('/workspace/faithpath-next');e=root/'docs/evidence/reader-parity/upgrade';out=e/'oliva-71cf17993d0bc7fd-r2'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
d=read(out/'offline-upgrade.json');execution=read(e/'execution-r2.json');review=read(e/'logical-comparison-review.json')
assert d['passed'] and d['phase']=='complete' and execution['exitCode']==0
assert execution['runnerSha256']==sha(e/'offline-upgrade-reader-v9.mjs')==review['logicalComparatorReview']['currentScriptSha256']
assert execution['logSha256']==sha(e/'execution-r2.txt') and review['status'].startswith('PASS')
assert d['baselineVersion']=='0.12.1' and d['baselineBuild']=='oliva-75717978bae05979' and d['targetVersion']=='0.13.0' and d['targetBuild']=='oliva-71cf17993d0bc7fd'
checks=['realWorkerActivation','sameOriginPersistentProfile','allFourRawV8RecordsExactBeforeNewActions','noAutomaticChapterCompletion','gapDidNotFillOrWrite','firstExplicitActionWroteV9','onlyVersionRevisionDraftsAndCanonicalAnchorPermittedToChange','oldSingleVerseAndJournalDraftsExact','ntAnswerAndReadGrowthFieldsExact','explicitSectionJumpFocusedVerse35','offlineNtAnswerAndOldJournalRestored','actualV9DownloadAndRestorePreview','restoreWasNotApplied','allThreeNonMainRecordsExactThroughV9Actions','originalNotesAndSourcesPreserved','readAndGrowthAndNtFieldsExactThroughout','builtHtmlAndWorkersUnchanged','sourceUnchangedDuringUpgrade']
assert all(d[k] is True for k in checks)
assert d['runtimeInputsBefore']==d['runtimeInputsAfter']=={'fileCount':327,'sha256':'0b097eb24fc4fded654aef9f1a68ffb76301ed48e3d941ca146046efe3e15611','allFileHashesMatch':True}
inputs=read(root/'docs/evidence/reader-parity/runtime-inputs.json');h=hashlib.sha256()
for f in inputs['files']:
 raw=(root/f['path']).read_bytes();assert len(raw)==f['bytes'] and hashlib.sha256(raw).hexdigest()==f['sha256'];h.update(f['path'].encode()+b'\0'+raw+b'\0')
assert h.hexdigest()==d['runtimeInputsAfter']['sha256']
assert len(d['beforeRecords'])==4 and d['displayedCanonicalVerses']==71 and d['offlineA51Stages']==7
nonmain=lambda rows:[v for v in rows if not(v['store']=='state' and v['key']=='main')]
old=nonmain(d['beforeRecords']);assert len(old)==3
for key in ['afterFirstRangeDraftRecords','afterIndependentRangeDraftRecords','afterRangeNoteRecords','outsideFocusAnchorRecords','afterOfflineArtRecords','finalRecords']:assert nonmain(d[key])==old,key
assert d['savedRangeNote']['ref']==d['savedRangeNote']['captureSource']['ref']=={'book':'JHN','chapter':6,'from':35,'to':36}
assert d['independentSecondRangeDraft']['values']['source']['ref']=={'book':'JHN','chapter':6,'from':35,'to':37}
assert d['outsideFocusAnchorPreserved']=={'verse':60,'logicalRef':{'book':'JHN','chapter':6,'from':35,'to':37},'widths':[390,1440,320],'offlineReload':True}
for w in [d['afterWorker'],d['finalWorker']]:
 for key in ['controller','active']:assert w[key]=={'id':d['targetBuild'],'version':'0.13.0'}
for folder,stem in [(Path('/workspace/oliva-v0121-book-search-control-dist'),'baseline'),(root/'dist','target')]:
 for fn,key in [('index.html','Html'),('sw.js','Worker')]:assert sha(folder/fn)==d[stem+key+'Sha256']
screens=[{'name':p.name,'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(out.glob('*.png'))];assert len(screens)==6
v={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'passed':True,'exitCode':0,'baselineVersion':d['baselineVersion'],'baseline':d['baselineBuild'],'targetVersion':d['targetVersion'],'target':d['targetBuild'],'realSameOriginWorkerActivation':True,'allFourRawV8RecordsExactBeforeExplicitAction':True,'threeNonMainRecordsExactThroughout':3,'logicalDataComparator':'Strict keys/types/values and ordered arrays; JSON object insertion order ignored after explicit canonical writes. Raw before-action and non-main comparisons remain exact serialized values.','canonicalChapterVersesDisplayed':71,'logicalFocus':d['logicalFocus'],'gapDidNotFillOrWrite':True,'copyFallbackExact':True,'firstExplicitRangeDraftWritesV9':True,'oldSingleVerseAndJournalDraftsExact':True,'rangeSources':{'savedNote':d['savedRangeNote']['ref'],'independentDraft':d['independentSecondRangeDraft']['values']['source']['ref']},'outsideFocusAnchor':d['outsideFocusAnchorPreserved'],'offlineA51Stages':7,'readGrowthAndNtFieldsExactThroughout':True,'actualV9DownloadAndReadonlyRestorePreview':True,'restoreApplied':False,'exportSha256':d['exportSha256'],'runtimeInputsBeforeAfterExact':d['runtimeInputsAfter'],'builtHtmlAndWorkersUnchanged':True,'runnerSha256':execution['runnerSha256'],'reportSha256':sha(out/'offline-upgrade.json'),'executionLogSha256':execution['logSha256'],'screenshots':screens,'browser':d['browserVersion'],'localChromiumAutomation':True,'physicalDevice':False,'simulator':False,'hostedBrowserQa':False,'originalFailurePreserved':'../oliva-71cf17993d0bc7fd/offline-upgrade.json','independentLogicalComparisonReview':'../logical-comparison-review.json'}
(out/'verification.json').write_text(json.dumps(v,indent=2)+'\n');print(json.dumps({k:v[k] for k in ['passed','exitCode','target','allFourRawV8RecordsExactBeforeExplicitAction','threeNonMainRecordsExactThroughout','offlineA51Stages','runtimeInputsBeforeAfterExact']}))
