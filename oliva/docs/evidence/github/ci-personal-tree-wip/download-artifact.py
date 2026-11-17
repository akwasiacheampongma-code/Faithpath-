#!/usr/bin/env python3
"""Download only after Root's actual-push signal. Capability stays in hidden stdin."""
import sys,termios,json,urllib.request,urllib.parse,hashlib,re,datetime
from pathlib import Path
cfg=termios.tcgetattr(0);cfg[3]&=~termios.ECHO;termios.tcsetattr(0,termios.TCSANOW,cfg)
print('Ready for artifact download JSON on stdin (input is hidden).',flush=True)
a=json.loads(sys.stdin.readline());u=urllib.parse.urlsplit(a['url'])
assert u.scheme=='https' and u.hostname and u.hostname.endswith('.oaiusercontent.com')
size_expected=a['expected_bytes'];sha_expected=a['expected_sha256'];artifact_id=a['artifact_id']
assert isinstance(size_expected,int) and 0<size_expected<=256*1024*1024
assert isinstance(artifact_id,int) and artifact_id>0 and re.fullmatch('[0-9a-f]{64}',sha_expected)
p=Path('/tmp/oliva-ci-personal-tree-wip-artifact.zip');part=p.with_suffix('.zip.part')
if p.exists():
 b=p.read_bytes();assert len(b)==size_expected and hashlib.sha256(b).hexdigest()==sha_expected,'Preserve differing existing artifact'
 print(json.dumps({'archive':str(p),'artifactId':artifact_id,'bytes':len(b),'sha256':sha_expected,'alreadyPresent':True}),flush=True);raise SystemExit(0)
h=hashlib.sha256();size=0
try:
 with urllib.request.urlopen(a['url'],timeout=30) as response,part.open('wb') as out:
  while True:
   b=response.read(1024*1024)
   if not b:break
   size+=len(b);assert size<=size_expected;h.update(b);out.write(b)
 assert size==size_expected and h.hexdigest()==sha_expected
 part.replace(p)
 print(json.dumps({'archive':str(p),'artifactId':artifact_id,'bytes':size,'sha256':h.hexdigest(),'signedUrlPersisted':False}),flush=True)
except Exception as e:
 part.unlink(missing_ok=True)
 print(json.dumps({'errorType':type(e).__name__,'httpStatus':getattr(e,'code',None),'urlOmitted':True}),flush=True);raise SystemExit(1)
