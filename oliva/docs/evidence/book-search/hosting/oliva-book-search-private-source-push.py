import sys,os,json,subprocess,termios,base64,tarfile,hashlib
from pathlib import Path
import runpy
common=runpy.run_path('/tmp/book-search-release-common.py');summary=common['guard']()
root=Path('/workspace/sites/oliva-v04-preview')
assert json.loads((root/'.openai/hosting.json').read_text())['project_id']==common['PRIVATE_PROJECT']
verify=subprocess.run(['node','scripts/check-preview.mjs'],cwd=root,env=common['SAFE_ENV'],capture_output=True,text=True)
assert verify.returncode==0,verify.stderr[-1800:]
validation=json.loads((root/'preview-validation.json').read_text())
assert validation['version']==common['VERSION'] and validation['source_build']==summary['coreBuild']
assert validation['all_runtime_hashes_match'] is True
a=termios.tcgetattr(sys.stdin.fileno());a[3]&=~termios.ECHO;termios.tcsetattr(sys.stdin.fileno(),termios.TCSANOW,a)
print('Ready for private source credential JSON on stdin (input is hidden).',flush=True)
request=json.loads(sys.stdin.readline());assert request['project_id']==common['PRIVATE_PROJECT'];assert request.get('owner_private_policy_verified') is True;credential=request['credential'];token=credential.get('token');remote=credential['remote_url'];branch=credential['branch'];assert remote.startswith('https://git.chatgpt-team.site/') and branch=='main'
baseenv={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']}
baseenv['GIT_TERMINAL_PROMPT']='0'
secrets=[token,'Bearer '+token,'Basic '+base64.b64encode(('x-access-token:'+token).encode()).decode()] if token else []
def run(args,env=None,check=True):
 r=subprocess.run(args,cwd=root,env=env or baseenv,capture_output=True,text=True)
 if check and r.returncode:
  out=r.stderr
  for s in secrets:out=out.replace(s,'[redacted]')
  raise RuntimeError(out[-1800:])
 return r
if not(root/'.git').exists():run(['git','init','-b',branch])
run(['git','config','user.name','Codex']);run(['git','config','user.email','codex@localhost'])
urls=run(['git','remote','get-url','origin'],check=False)
if urls.returncode:run(['git','remote','add','origin',remote])
else:assert urls.stdout.strip()==remote
chosen=None
assert not credential.get('publish_on_push') and not credential.get('publish_on_push_accepted'), 'Reconcile automatic publication before explicit deploy'
schemes=[None] if credential.get('auth_mode')=='work_proxy' else ['Bearer '+token,'Basic '+base64.b64encode(('x-access-token:'+token).encode()).decode()]
for scheme in schemes:
 env=dict(baseenv,GIT_CONFIG_COUNT='2',GIT_CONFIG_KEY_0='http.https://git.chatgpt-team.site/.extraHeader',GIT_CONFIG_VALUE_0='Authorization: '+str(scheme),GIT_CONFIG_KEY_1='http.followRedirects',GIT_CONFIG_VALUE_1='false')
 if scheme is None: env=baseenv
 probe=run(['git','ls-remote','--heads','origin',branch],env,False)
 if probe.returncode==0:chosen=env;break
if chosen is None:
 error=probe.stderr
 for secret in secrets:error=error.replace(secret,'[redacted]')
 raise RuntimeError('Source authentication failed: '+error[-1500:])
if probe.stdout.strip():
 run(['git','fetch','--depth=1','origin',branch],chosen)
 if not run(['git','rev-parse','--verify','HEAD'],check=False).returncode:
  assert run(['git','rev-parse','HEAD']).stdout.strip()==run(['git','rev-parse','FETCH_HEAD']).stdout.strip(),'Concurrent source change; preserve it before updating.'
 else:run(['git','reset','--mixed','FETCH_HEAD'])
run(['git','add','--all'])
tracked=set(run(['git','ls-files','-z']).stdout.split('\0'))
assert all(p.relative_to(root).as_posix() in tracked for p in (root/'dist').rglob('*') if p.is_file()), 'Static assets must all belong to the pushed source commit'
if run(['git','diff','--cached','--quiet'],check=False).returncode:run(['git','commit','-m','Publish private OLIVA 0.12.1 whitespace-tolerant book search'])
commit=run(['git','rev-parse','HEAD']).stdout.strip();run(['git','push','origin','HEAD:refs/heads/'+branch],chosen)
assert not run(['git','status','--porcelain']).stdout.strip()
archive=Path('/workspace/oliva-book-search-private-preview-deploy.tar.gz')
with tarfile.open(archive,'w:gz') as tar:
 tar.add(root/'.openai/hosting.json',arcname='.openai/hosting.json')
 tar.add(root/'dist',arcname='dist')
result={'project_id':request['project_id'],'commit_sha':commit,'archive':str(archive),'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'source_remote':remote,'source_branch':branch,'source_pushed':True,'private_only':True,'automatic_publish_on_push':bool(credential.get('publish_on_push_accepted'))}
Path('/workspace/oliva-book-search-private-source-checkpoint.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result),flush=True)
