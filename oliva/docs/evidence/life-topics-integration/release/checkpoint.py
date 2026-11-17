from pathlib import Path
import runpy,json,hashlib,datetime,subprocess,shutil,zipfile
c=runpy.run_path('/tmp/topics-v015-release-common.py');r=c['ROOT'];e=c['EVIDENCE'];summary=c['guard']();git=c['git'];env=c['SAFE_ENV']
assert summary['privateDeployment']['status']=='succeeded'
http=c['read']('private-http-check.json');policy=c['read']('private-access-policy.json');deployment=c['read']('private-deployment.json');package=c['read']('private-package-check.json');source=c['read']('private-source-checkpoint.json')
assert http['unauthenticated_status']==401 and not http['unauthenticated_app_html_visible'] and http['all_asset_bytes_match_package']
assert len(http['app_routes_http_checked'])>=32 and http['review_files_verified']>=42
assert policy['ownerOnly'] and policy['exactPolicyUnchanged'] and deployment['status']=='succeeded' and deployment['project_id']==c['PRIVATE_PROJECT']
assert source['source_pushed'] and source['private_only'] and source['project_id']==c['PRIVATE_PROJECT'] and package['version']==c['VERSION'] and package['all_runtime_hashes_match']
assert package['source_build']==summary['coreBuild'] and hashlib.sha256(Path(source['archive']).read_bytes()).hexdigest()==source['archive_sha256']
assert c['read']('secret-scan.json')['passed']
tag=c['SOURCE_TAG'];archive=Path('/workspace/oliva-next-v0.15.0-life-topics-source.zip');control=Path('/workspace/oliva-v015-life-topics-control-dist')
assert not git('tag','--list',tag) and not archive.exists() and not control.exists()
feature=json.loads(Path('/workspace/oliva-v015-code-checkpoint.json').read_text())['featureOnlyCommit']
assert git('rev-parse','HEAD')==feature
subprocess.run(['git','add','--all'],cwd=r,env=env,check=True);subprocess.run(['git','diff','--cached','--check'],cwd=r,env=env,check=True)
subprocess.run(['git','commit','-m','release: verify and deliver OLIVA 0.15 original life topics privately'],cwd=r,env=env,check=True)
commit=git('rev-parse','HEAD');tree=git('rev-parse','HEAD^{tree}');assert not git('status','--porcelain')
subprocess.run(['git','tag','-a',tag,'-m','OLIVA 0.15: all 18 original life topics, 45 Bible ranges, contexts and reflections; existing nine paths, 436 stories, 2479 questions, 1300 NT questions, A51 tree and 66 swords retained. Verified private PWA, V10 data kept exact until explicit V11 action. Master remains open.'],cwd=r,env=env,check=True)
shutil.copytree(r/'dist',control);subprocess.run(['git','archive','--format=zip','--output='+str(archive),tag],cwd=r,env=env,check=True)
with zipfile.ZipFile(archive) as z:assert z.testzip() is None;entries=len(z.infolist())
result={'version':c['VERSION'],'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'standaloneCommit':commit,'standaloneTree':tree,'localTag':tag,'sourceBranch':c['RELEASE_BRANCH'],'featureOnlyCommit':feature,'archive':str(archive),'archiveBytes':archive.stat().st_size,'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'archiveEntries':entries,'archiveCrcVerified':True,'webCore':summary['coreBuild'],'fullBrowserExecutableBuild':summary.get('fullBrowserExecutableBuild',summary['coreBuild']),'runtimeSourceDigest':summary['runtimeSourceDigest'],'privateHostBuild':summary['privateDeployment']['hostBuild'],'unitTests':321,'browserTests':144,'dataVersion':11,'privatePreview':c['PRIVATE_URL'],'githubBackupAuthorized':True,'githubBackupProof':'/workspace/oliva-github-backups.json','faithpathMainMerged':False,'masterDefinitionOfDoneComplete':False}
Path('/workspace/oliva-v015-local-checkpoint.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
