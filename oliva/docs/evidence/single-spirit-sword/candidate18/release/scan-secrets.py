from pathlib import Path
import sys,termios,json,os,subprocess,re,datetime
r=Path('/workspace/faithpath-next');cfg=termios.tcgetattr(0);cfg[3]&=~(termios.ECHO|termios.ICANON);termios.tcsetattr(0,termios.TCSANOW,cfg)
print('Ready for actual single-sword session-token scan JSON (hidden stdin).',flush=True)
x=json.loads(sys.stdin.readline());tokens=list(set(x['tokens']));assert tokens and all(isinstance(t,str) and len(t)>20 for t in tokens)
env={k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE','GH_DEBUG']}
paths=set(p.decode() for p in subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=r,env=env).split(b'\0') if p)
pattern=rb'(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|(?i:authorization:\s*(?:bearer|token)\s+)[A-Za-z0-9_./+\-=]{20,}|X-Amz-Signature=[0-9a-fA-F]{16,}|[?&]sig=[A-Za-z0-9%/+]{25,})'
hits=[];count=0
for name in sorted(paths):
 p=r/name
 if not p.is_file() or (not x.get('include_completed_full') and name.startswith('docs/evidence/single-spirit-sword/full-r2/')):continue
 b=p.read_bytes();count+=1
 if any(t.encode() in b for t in tokens):hits.append({'path':name,'reason':'actual session credential bytes'})
 if re.search(pattern,b):hits.append({'path':name,'reason':'credential or signed-capability pattern'})
record={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'filesScanned':count,'actualSessionTokensChecked':len(tokens),'actualTokensPersistedInReport':False,'matchingFiles':hits,'passed':not hits,'completedFullRegressionIncluded':bool(x.get('include_completed_full')),'scope':'All tracked/nonignored source and completed proof; dependencies and git metadata excluded.' if x.get('include_completed_full') else 'All tracked/nonignored source; dependencies, git metadata and actively running full-r2 output excluded.'}
(r/'docs/evidence/single-spirit-sword/actual-session-secret-scan.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record),flush=True);assert not hits
