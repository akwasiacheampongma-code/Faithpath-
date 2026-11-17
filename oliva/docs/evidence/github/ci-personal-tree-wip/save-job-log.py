#!/usr/bin/env python3
"""Save the connector's exact decoded terminal job log without printing its contents."""
import sys,termios,json,re,hashlib,datetime
from pathlib import Path
cfg=termios.tcgetattr(0);cfg[3]&=~(termios.ECHO|termios.ICANON);termios.tcsetattr(0,termios.TCSANOW,cfg)
print('Ready for terminal job log JSON on stdin (input is hidden).',flush=True)
a=json.loads(sys.stdin.readline());assert re.fullmatch('[0-9a-f]{40}',a['head_sha'])
assert isinstance(a['run_id'],int) and isinstance(a['job_id'],int) and a['run_id']>0 and a['job_id']>0
b=a['content'].encode('utf8');assert b
pattern=rb'(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|(?i:authorization:\s*(?:bearer|token)\s+)[A-Za-z0-9_./+\-=]{20,}|X-Amz-Signature=[0-9a-fA-F]{16,}|[?&]sig=[A-Za-z0-9%/+]{25,})'
assert not re.search(pattern,b),'Refusing possible credential or signed capability'
p=Path('/workspace/faithpath-next/docs/evidence/github/ci-personal-tree-wip');p.mkdir(parents=True,exist_ok=True)
f=p/'job.log'
if f.exists():assert f.read_bytes()==b,'Preserve differing existing job log'
else:f.write_bytes(b)
v={'retrievedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'method':'GitHub connector fetch_workflow_job_logs decoded terminal content; protected stdin','runId':a['run_id'],'jobId':a['job_id'],'headSha':a['head_sha'],'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'credentialOrSignedUrlPersisted':False}
(p/'job-log-source.json').write_text(json.dumps(v,indent=2)+'\n')
print(json.dumps({k:v[k] for k in ['runId','jobId','bytes','sha256','credentialOrSignedUrlPersisted']}),flush=True)
