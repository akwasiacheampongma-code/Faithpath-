from pathlib import Path
import sys,termios,json,subprocess,os,re,hashlib,datetime
root=Path('/workspace/faithpath-next');cfg=termios.tcgetattr(0);cfg[3]&=~(termios.ECHO|termios.ICANON);termios.tcsetattr(0,termios.TCSANOW,cfg)
print('Ready for secret scan JSON on stdin (input is hidden).',flush=True)
x=json.loads(sys.stdin.readline());tokens=x['tokens'];assert all(isinstance(t,str) and len(t)>20 for t in tokens)
env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']}
names=set(p.decode() for p in subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=root,env=env).split(b'\0') if p)
pattern=rb'(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|(?i:authorization:\s*(?:bearer|token)\s+)[A-Za-z0-9_./+\-=]{20,}|X-Amz-Signature=[0-9a-fA-F]{16,}|[?&]sig=[A-Za-z0-9%/+]{25,})'
hits=[];count=0
for name in sorted(names):
 p=root/name
 if not p.is_file():continue
 data=p.read_bytes();count+=1
 if any(t.encode() in data for t in tokens):hits.append({'path':name,'reason':'session credential bytes'})
 if re.search(pattern,data):hits.append({'path':name,'reason':'credential or signed capability pattern'})
r={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'filesScanned':count,'actualSessionTokensChecked':len(set(tokens)),'actualTokensPersistedInReport':False,'matchingFiles':hits,'passed':not hits,'scope':'Every tracked and non-ignored candidate source file; git metadata and ignored build/dependency folders excluded.'}
(root/'docs/evidence/personal-tree-release16/secret-scan.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r),flush=True)
assert not hits,'Resolve captured credential evidence before publishing source'
