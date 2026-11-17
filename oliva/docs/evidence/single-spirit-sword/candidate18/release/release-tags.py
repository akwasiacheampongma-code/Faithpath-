from pathlib import Path
import os,json,subprocess,datetime,time,runpy,hashlib,shutil
c=runpy.run_path('/tmp/single-spirit-sword-v018-common.py');summary=c['guard']();r=c['ROOT'];e=c['EVIDENCE'];bare=Path('/workspace/faithpath-publish.git')
meta=json.loads(Path('/workspace/oliva-v018-github-candidate.json').read_text());source=meta['standaloneCandidateCommit'];head=meta['githubHead'];assert source=='bc2c199921ba0a20e4d9436248db8f46d256e3ff' and head=='84527ef0b7e3c970b3c7e33bd758cd2fd28d06a0'
ci=json.loads((r/'docs/evidence/github/ci-v018/verification.json').read_text());assert ci['qualityVerified'] and all(ci['checks'].values()) and ci['headSha']==head
http=json.loads(Path('/workspace/oliva-single-spirit-sword-v018-private-http-check.json').read_text());assert http['unauthenticated_status']==401 and http['anonymous_app_routes_verified']==40 and http['all_app_routes_owner_protected'] and http['all_asset_bytes_match_package']
policy=json.loads((e/'private-access-policy.json').read_text());assert policy['ownerOnly'] and policy['exactPolicyUnchanged']
deployment=json.loads((e/'private-deployment.json').read_text());assert deployment['status']=='succeeded' and deployment['host_build']=='oliva-5d647075614ace83'
env={**c['SAFE_ENV'],'GIT_AUTHOR_NAME':'Codex','GIT_AUTHOR_EMAIL':'codex@localhost','GIT_COMMITTER_NAME':'Codex','GIT_COMMITTER_EMAIL':'codex@localhost'}
base=['git','-c','credential.helper=','-c','credential.helper=!gh auth git-credential','--git-dir='+str(bare)]
def run(args,data=None):
 p=subprocess.run(base+args,input=data,capture_output=True,env=env)
 if p.returncode:raise RuntimeError('Git operation failed: '+args[0]+'; exit '+str(p.returncode))
 return p.stdout
def out(args,data=None):return run(args,data).decode().strip()
planPath=Path('/workspace/oliva-github-backup-plan.json');backupPath=Path('/workspace/oliva-github-backups.json');plan=json.loads(planPath.read_text());backup=json.loads(backupPath.read_text())
assert backup['published'] and backup['verified_version_refs'] in [30,32]
expected={}
for v in backup['versions']:
 expected['refs/heads/'+v['branch']]=v['commit'];expected['refs/tags/'+v['tag']]=v['tag_object']
protected=['refs/heads/main','refs/heads/feature/oliva-next-v02-20261106','refs/heads/feature/oliva-v011-ci-geometry-20261109','refs/heads/docs/oliva-reader-phase-closeout-20261116','refs/heads/docs/oliva-v014-delivery-20261117','refs/heads/docs/oliva-v015-delivery-20261117','refs/heads/docs/oliva-v016-delivery-20261117','refs/heads/docs/oliva-v017-delivery-20261117','refs/heads/feature/oliva-personal-tree-20261117']
branchRef='refs/heads/'+meta['githubBranch'];tag='oliva-v0.18.0';tagRef='refs/tags/'+tag
raw=run(['ls-remote','--refs','origin',*expected,*protected,branchRef,tagRef]).decode();before={x.split('\t')[1]:x.split('\t')[0] for x in raw.splitlines()}
assert all(before.get(k)==v for k,v in expected.items()) and all(k in before for k in protected) and before[branchRef]==head
assert before['refs/heads/main']=='d3f0c01adc8f1a67da79e4f0b4cbe5d99ca895b3' and before['refs/heads/docs/oliva-v017-delivery-20261117']=='b374b962e97879a23c5bbb5937baf194d914a07d'
if tagRef in before:
 tagObject=before[tagRef];peeled=out(['ls-remote','origin',tagRef+'^{}']).split()[0];assert peeled==head
else:
 tagObject=out(['mktag'],f'object {head}\ntype commit\ntag {tag}\ntagger Codex <codex@localhost> {int(time.time())} +0000\n\nOLIVA0.18: one peaceful static spiritual sword; all66Biblebooks and V11data preserved;343unit/146browser and independent CI; actual17to18PWA update, static native exports; owner-private web, no GitHub-main merge.\n'.encode())
 local='refs/publish/oliva-tags/v0.18.0';run(['update-ref',local,tagObject]);run(['push','--porcelain','origin',local+':'+tagRef])
raw=run(['ls-remote','--refs','origin',*expected,*protected,branchRef,tagRef]).decode();after={x.split('\t')[1]:x.split('\t')[0] for x in raw.splitlines()};assert all(after[k]==v for k,v in before.items()) and after[tagRef]==tagObject
assert out(['ls-remote','origin',tagRef+'^{}']).split()[0]==head
localTag=c['SOURCE_TAG'];existing=c['git']('tag','--list',localTag)
if existing:assert c['git']('rev-parse',localTag+'^{commit}')==source
else:subprocess.run(['git','tag','-a',localTag,source,'-m','OLIVA0.18 private release: one static spiritual sword, no book-sword collection,343unit/146browser, V11data preserved, actual private deployment. Master remains open.'],cwd=r,env=env,check=True)
sourceTree=out(['rev-parse',head+':oliva']);assert sourceTree==meta['sourceSubtree']==meta['standaloneTree']
if not any(v['version']=='0.18.0' for v in plan['versions']):
 assert plan['versions'][-1]['version']=='0.17.0' and len(plan['versions'])==15
 record={'version':'0.18.0','source_ref':localTag,'source_commit':source,'source_tree':sourceTree,'parent_commit':meta['githubParent'],'base_release_commit':meta['baseReleaseGithubCommit'],'commit':head,'tree':meta['githubTree'],'branch':meta['githubBranch'],'tag':tag,'tag_object':tagObject,'local_commit_ref':'refs/publish/oliva/v018-single-sword-candidate','local_tag_ref':'refs/publish/oliva-tags/v0.18.0','workflow_blob':out(['rev-parse',head+':.github/workflows/oliva-quality.yml']),'oliva_subtree_exact':True,'original_faithpath_paths_unchanged':True,'url':'https://github.com/akwasiacheampongma-code/Faithpath-/tree/'+tag+'/oliva'}
 plan['versions'].append(record)
assert len(plan['versions'])==16
for target in [planPath,backupPath]:
 current=json.loads(target.read_text());current.update(plan);current.update({'published':True,'all_prepared':True,'expected_versions':16,'verified_version_refs':32,'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat()});target.write_text(json.dumps(current,indent=2)+'\n')
control=Path('/workspace/oliva-v018-single-spirit-sword-control-dist')
def inventory(folder):return {p.relative_to(folder).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in folder.rglob('*') if p.is_file()}
if not control.exists():shutil.copytree(r/'dist',control)
assert inventory(control)==inventory(r/'dist')
proof={'version':'0.18.0','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'standaloneCommit':source,'standaloneTree':sourceTree,'localTag':localTag,'githubCommit':head,'githubBranch':meta['githubBranch'],'githubTag':tag,'githubTagObject':tagObject,'versionRefsVerified':32,'protectedRefsUnchanged':True,'originalNonOlivaRootEntriesExact':47,'coreBuild':c['CORE'],'privateHostBuild':'oliva-5d647075614ace83','privateDeploymentId':deployment['deployment_id'],'privateDeployedAt':deployment['updated_at'],'privateUrl':deployment['url'],'independentCiRun':ci['runId'],'unitTests':343,'browserTests':146,'runtimeSourceDigest':summary['runtimeSourceDigest'],'webControl':str(control),'localFullSourceZipCreated':False,'sourceArchiveMethod':'Complete immutable standalone/GitHub tags; reproducible git archive. Existing historical ZIPs retained; no duplicate large local ZIP created.','masterDefinitionOfDoneComplete':False}
Path('/workspace/oliva-v018-local-checkpoint.json').write_text(json.dumps(proof,indent=2)+'\n');(e/'release-checkpoint.json').write_text(json.dumps(proof,indent=2)+'\n')
(r/'docs/evidence/github/ci-v018/release-tag-identity.json').write_text(json.dumps({'checkedAt':proof['createdAt'],'tag':tag,'tagObject':tagObject,'targetsExactAuthorizedCiHead':True,'headSha':head,'sourceSubtree':sourceTree,'standaloneTag':localTag,'standaloneCommit':source,'all32VersionRefsExact':True,'mainUnchanged':True},indent=2)+'\n')
print(json.dumps(proof))
