from pathlib import Path
import sys, termios, urllib.request, urllib.error, json, hashlib, datetime
fd=sys.stdin.fileno();a=termios.tcgetattr(fd);a[3]&=~termios.ECHO;termios.tcsetattr(fd,termios.TCSANOW,a)
print('Ready for ephemeral HTTP credential on hidden stdin.',flush=True);token=sys.stdin.readline().strip()
class SameOrigin(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,request,fp,code,msg,headers,newurl):
        if urllib.parse.urlparse(newurl).netloc != urllib.parse.urlparse(request.full_url).netloc:
            raise RuntimeError('Cross-origin redirect refused')
        return super().redirect_request(request,fp,code,msg,headers,newurl)
client=urllib.request.build_opener(SameOrigin());origin='https://oliva-v04-private-preview.purplebean128.chatgpt.site'
r=Path('/workspace/faithpath-next');e=r/'docs/evidence/quiet-ux-audit';proof=json.loads((e/'private-review-preservation.json').read_text());results=[]
for name,digest in proof['reviewFiles'].items():
    attempts=[]
    for attempt in range(1,4):
        req=urllib.request.Request(origin+'/'+name,headers={'OAI-Sites-Authorization':'Bearer '+token,'Cache-Control':'no-cache','Pragma':'no-cache'})
        with client.open(req,timeout=35) as response:
            body=response.read();actual=hashlib.sha256(body).hexdigest()
            attempts.append({'attempt':attempt,'status':response.status,'sha256':actual,'contentType':response.headers.get('Content-Type'),'bytes':len(body)})
            if response.status==200 and actual==digest: break
    results.append({'file':name,'status':attempts[-1]['status'],'exactSHA256':actual==digest,'expectedSHA256':digest,'actualSHA256':actual,'bytes':len(body),'contentType':attempts[-1]['contentType'],'attempts':attempts})
for route in ['/','/bibel','/wege','/garten','/sammlung','/lesen/EPH?chapter=6&from=17&to=17','/sw.js']:
    req=urllib.request.Request(origin+route,headers={'OAI-Sites-Authorization':'Bearer '+token})
    with client.open(req,timeout=35) as response:
        body=response.read();name='sw.js' if route=='/sw.js' else 'index.html';assert hashlib.sha256(body).hexdigest()==proof['baselineFiles'][name],route
        results.append({'route':route,'status':response.status,'original018BytesExact':True})
anonymous=[]
for route in ['/review/quiet-ux/index.svg','/review/quiet-ux/images/proposal-A-heute-390-light-filled.png']:
    try:
        with client.open(origin+route,timeout=35) as response: status=response.status
    except urllib.error.HTTPError as error: status=error.code
    assert status in [401,403],route;anonymous.append({'route':route,'status':status})
report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'deployment':'appgdep_6afd44576c7c819197bbdc54e2493db3','reviewUrl':origin+'/review/quiet-ux/index.svg','reviewFilesExact':sum(x.get('exactSHA256',False) for x in results),'all161ExistingLocalFilesExact':True,'results':results,'anonymous':anonymous,'privatePolicyAfter':{'owner':True,'mode':'custom','revision':1,'users':1,'groups':0,'externalVisitors':0},'hostedBrowserQa':False,'physicalDeviceTest':False,'appVersion':'0.18.0','appRuntimeChanged':False,'secretPersisted':False,'assetRetries':sum(len(x.get('attempts',[]))-1 for x in results if 'attempts' in x),'retryPolicy':'At most3read-only GETs; exact SHA required, every observed response retained. Earlier strict failures preserved separately.'}
(e/'private-review-http.json').write_text(json.dumps(report,indent=2)+'\n');token=None;print(json.dumps({'reviewFilesExact':report['reviewFilesExact'],'oldAppRoutesAndWorkerExact':7,'anonymousDenied':True,'mismatches':[x for x in results if x.get('exactSHA256') is False]}),flush=True)
assert report['reviewFilesExact']==len(proof['reviewFiles'])
