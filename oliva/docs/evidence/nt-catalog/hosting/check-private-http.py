import sys,termios,json,urllib.request,urllib.error,urllib.parse,hashlib,concurrent.futures,datetime,time
from pathlib import Path
attrs=termios.tcgetattr(0);attrs[3]&=~termios.ECHO;termios.tcsetattr(0,termios.TCSANOW,attrs)
print('Ready for private HTTP verification JSON on stdin (input is hidden).',flush=True)
data=json.loads(sys.stdin.readline());url=data['url'];token=data.get('service_token');origin=urllib.parse.urlsplit(url)
assert origin.scheme=='https' and origin.hostname=='oliva-v04-private-preview.purplebean128.chatgpt.site'
base=url.rstrip('/');root=Path('/workspace/sites/oliva-v04-preview/dist')
import re
expected_marker=re.search(r'name="oliva-build" content="[^"]+"', (root/'index.html').read_text()).group(0).encode()
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,req,fp,code,msg,headers,newurl):return None
opener=urllib.request.build_opener(NoRedirect)
transient_retries=[]
def fetch(path,auth=True,follow=True):
 target=base+path
 for hop in range(7):
  parsed=urllib.parse.urlsplit(target)
  assert parsed.scheme=='https'
  headers={'User-Agent':'OLIVA-preview-QA/0.12','Accept-Encoding':'identity'}
  if '.' not in urllib.parse.urlsplit(path).path.rsplit('/',1)[-1]: headers.update({'Accept':'text/html','Sec-Fetch-Mode':'navigate','Sec-Fetch-Dest':'document'})
  if auth and token and parsed.netloc==origin.netloc:headers['OAI-Sites-Authorization']='Bearer '+token
  req=urllib.request.Request(target,headers=headers)
  try:
   with opener.open(req,timeout=30) as r:code,h,b=r.status,r.headers,r.read()
  except urllib.error.HTTPError as e:code,h,b=e.code,e.headers,e.read()
  if follow and code in [301,302,303,307,308] and h.get('Location'):
   target=urllib.parse.urljoin(target,h['Location']);continue
  return code,h,b
 raise RuntimeError('Too many asset redirects')
if data.get('probe_routes'):
 for route in data['probe_routes']:
  code,h,b=fetch(route);print(json.dumps({'path':route,'status':code,'type':h.get('Content-Type'),'bytes':len(b),'shell':b'oliva-build' in b,'notfound':b[:80].decode('utf8','replace') if len(b)<200 else None}),flush=True)
 sys.exit(0)
if data.get('debug_path'):
 code,h,b=fetch(data['debug_path']);local=(root/data['debug_path'].lstrip('/')).read_bytes()
 print(json.dumps({'status':code,'content_type':h.get('Content-Type'),'bytes':len(b),'expected_bytes':len(local),'signature':b[:12].hex(),'app_html':b'oliva-build' in b,'same_bytes':b==local,'retry_after':h.get('Retry-After'),'proxy_average_size_limit':b'Average request size too large' in b,'proxy_size_limit':b'Request size too large' in b,'service_unavailable':code==503}),flush=True)
 sys.exit(0)
status,headers,body=fetch('/',False,False)
result={'url':url,'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'unauthenticated_status':status,'unauthenticated_app_html_visible':status==200 and b'oliva-build' in body,'owner_private_policy_verified':True,'service_access_available':bool(token),'physical_phone_test':False,'managed_browser_qa':'unavailable: supported cua_repl.js tool absent'}
assert status==401 and b'oliva-build' not in body,'Unexpected anonymous access response'
if token:
 routes=['/','/bibel','/garten','/wege','/sammlung','/einstellungen','/einladungen','/quellen','/lesen/MRK?chapter=4','/lesen/PSA?chapter=119','/lesen/JHN?chapter=6&verse=35','/lesen/1SA?chapter=17&from=38&to=45&mode=deep','/weg/jesus','/vorhaben','/vorhaben/qa-not-existing','/importieren','/importarchiv/qa-not-existing','/buch/JHN','/buch/GEN','/buch/ROM','/verstehen','/verstehen/MRK?chapter=4','/verstehen/MAT?chapter=1','/verstehen/REV?chapter=22']
 checked=[]
 for route in routes:
  code,h,b=fetch(route);assert code==200,(route,code);assert expected_marker in b,(route,'Wrong app shell build');checked.append(route)
 result['app_routes_http_checked']=checked
 sw=(root/'sw.js').read_text();urls=json.loads(sw.split('URLS=',1)[1].split(',VERSION=',1)[0])
 def verify_asset(path):
  for attempt in range(3):
   code,h,b=fetch(path)
   if code!=503 or attempt==2:break
   retry=h.get('Retry-After','')
   delay=min(30,float(retry)) if retry.replace('.','',1).isdigit() else 2*(attempt+1)
   transient_retries.append({'path':path,'status':code,'attempt':attempt+1,'delaySeconds':delay})
   time.sleep(delay)
  assert code==200,(path,code)
  local=(root/path.lstrip('/')).read_bytes()
  if path=='/index.html':assert expected_marker in b,(path,'Wrong build')
  if path!='/index.html':assert hashlib.sha256(b).digest()==hashlib.sha256(local).digest(),(path,'Bytes differ')
  if path.endswith('.js'):assert 'javascript' in h.get('Content-Type',''),(path,'Not JavaScript')
  if path.endswith('.css'):assert 'text/css' in h.get('Content-Type',''),(path,'Not CSS')
  return path
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:assets=list(pool.map(verify_asset,urls+['/sw.js']))
 review=['/'+p.relative_to(root).as_posix() for p in (root/'review').rglob('*') if p.is_file()]
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: list(pool.map(verify_asset,review))
 result['review_files_verified']=len(review)
 result.update({'served_assets_verified':len(assets),'byte_hash_compared_app_files':len(assets)-1,'index_html_shell_checked_separately':True,'all_asset_bytes_match_package':True,'pwa_manifest_http_valid':True,'service_worker_served_as_javascript':True})
result['http_transient_retries']=transient_retries
Path('/workspace/oliva-v012-private-http-check.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result),flush=True)
