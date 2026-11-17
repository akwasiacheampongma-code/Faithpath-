from pathlib import Path
import sys,os,json,subprocess,termios,base64,datetime
root=Path('/workspace/sites/oliva-v04-preview');pid='appgprj_6aedf77e5ce0819180c10eb799447018'
assert json.loads((root/'.openai/hosting.json').read_text())['project_id']==pid
attrs=termios.tcgetattr(0);attrs[3]&=~termios.ECHO;termios.tcsetattr(0,termios.TCSANOW,attrs)
print('Ready for Site source opening JSON on stdin (input is hidden).',flush=True)
x=json.loads(sys.stdin.readline());assert x['project_id']==pid and x['owner_private_policy_verified'] is True
c=x['credential'];assert c['branch']=='main' and c['remote_url'].startswith('https://git.chatgpt-team.site/') and not c.get('publish_on_push_accepted')
env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']};env['GIT_TERMINAL_PROMPT']='0'
secret=c.get('token');schemes=[None] if c.get('auth_mode')=='work_proxy' else ['Bearer '+secret,'Basic '+base64.b64encode(('x-access-token:'+secret).encode()).decode()]
def run(args,auth=None):
 e=env if auth is None else dict(env,GIT_CONFIG_COUNT='2',GIT_CONFIG_KEY_0='http.https://git.chatgpt-team.site/.extraHeader',GIT_CONFIG_VALUE_0='Authorization: '+auth,GIT_CONFIG_KEY_1='http.followRedirects',GIT_CONFIG_VALUE_1='false')
 return subprocess.run(['git',*args],cwd=root,env=e,capture_output=True,text=True)
assert run(['remote','get-url','origin']).stdout.strip()==c['remote_url']
assert not run(['status','--porcelain']).stdout.strip(),'Preserve local source edits before opening'
head=run(['rev-parse','HEAD']).stdout.strip();auth=None;chosen=False
for scheme in schemes:
 p=run(['ls-remote','--heads','origin','main'],scheme)
 if p.returncode==0:auth=scheme;chosen=True;break
assert chosen,'Source authentication failed; no credentials logged'
assert p.stdout.split()[0]==head,'Remote source advanced; preserve before updating'
assert run(['fetch','--depth=1','origin','main'],auth).returncode==0
assert run(['rev-parse','FETCH_HEAD']).stdout.strip()==head
r={'project_id':pid,'checkout_path':str(root),'commit_sha':head,'source_branch':'main','source_opened':True,'source_unchanged':True,'manual_helper_reason':'Sites source helper is absent from the selected environment; ordinary Git uses the returned repository access, with credentials in stdin/session memory only.','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
Path('/workspace/oliva-v016-private-source-opening.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r),flush=True)
