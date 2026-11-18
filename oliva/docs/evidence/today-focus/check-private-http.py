from pathlib import Path
import sys,termios,json,hashlib,urllib.request,urllib.error,urllib.parse,datetime
from concurrent.futures import ThreadPoolExecutor

root=Path('/workspace/sites/oliva-v04-preview/dist')
evidence=Path('/workspace/faithpath-next/docs/evidence/today-focus')
origin='https://oliva-v04-private-preview.purplebean128.chatgpt.site'
attributes=termios.tcgetattr(0);attributes[3]&=~termios.ECHO;termios.tcsetattr(0,termios.TCSANOW,attributes)
print('Ready for private Today HTTP capability on hidden stdin.',flush=True)
token=sys.stdin.readline().strip();assert len(token)>20
class SameOrigin(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,request,fp,code,msg,headers,newurl):
        if urllib.parse.urlparse(newurl).netloc!=urllib.parse.urlparse(request.full_url).netloc:
            raise RuntimeError('Refused cross-origin credential forwarding')
        return super().redirect_request(request,fp,code,msg,headers,newurl)
files={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest()for p in root.rglob('*')if p.is_file()}
def checked(item):
    name,expected=item;client=urllib.request.build_opener(SameOrigin());attempts=[]
    for n in range(1,4):
        req=urllib.request.Request(origin+'/'+name,headers={'OAI-Sites-Authorization':'Bearer '+token,'Cache-Control':'no-cache','Pragma':'no-cache','Accept-Encoding':'identity'})
        try:
            with client.open(req,timeout=35)as response:
                body=response.read();status=response.status;mime=response.headers.get('Content-Type')
        except urllib.error.HTTPError as error:
            body=error.read();status=error.code;mime=error.headers.get('Content-Type')
        digest=hashlib.sha256(body).hexdigest();attempts.append({'attempt':n,'status':status,'mime':mime,'sha256':digest,'bytes':len(body)})
        if status==200 and digest==expected:break
    return {'file':name,'expectedSha256':expected,'exact':status==200 and digest==expected,'attempts':attempts}
with ThreadPoolExecutor(max_workers=4)as pool:results=list(pool.map(checked,sorted(files.items())))
routes=[]
for route in ['/','/bibel','/wege','/garten','/sammlung','/einstellungen','/start','/importieren','/geschichten','/geschichte/NS-0006','/themen','/verstehen','/lesen/MRK?chapter=4&from=35&to=41','/buch/REV']:
    client=urllib.request.build_opener(SameOrigin());request=urllib.request.Request(origin+route,headers={'OAI-Sites-Authorization':'Bearer '+token,'Accept-Encoding':'identity'})
    with client.open(request,timeout=35)as response:
        body=response.read();routes.append({'route':route,'status':response.status,'newHtmlExact':hashlib.sha256(body).hexdigest()==files['index.html'],'correctPrivateBuild':b'oliva-827cac01214b7955'in body})
anonymous=[]
for route in ['/','/bibel','/review/today-focus/index.svg','/review/today-focus/images/after-320-light-returning.png','/sw.js']:
    try:
        with urllib.request.urlopen(origin+route,timeout=35)as response:status=response.status
    except urllib.error.HTTPError as error:status=error.code
    anonymous.append({'route':route,'status':status,'denied':status in[401,403]})
report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'deployment':'appgdep_6afd536ac8e08191a1f5ab72e2ac50e4','sourceCommit':'7aede5585eae66a994a8cf606c996d13a98be8b0','coreBuild':'oliva-d3cab1587b25292b','privateHostBuild':'oliva-827cac01214b7955','filesChecked':len(files),'filesExact':sum(x['exact']for x in results),'assetRetries':sum(len(x['attempts'])-1 for x in results),'results':results,'routes':routes,'anonymous':anonymous,'accessPolicyAfter':{'owner':True,'mode':'custom','revision':1,'users':1,'groups':0,'externalVisitors':0},'hostedBrowserQa':False,'actualDeviceTest':False,'newFormalRelease':False,'credentialPersisted':False}
(evidence/'private-http.json').write_text(json.dumps(report,indent=2)+'\n');token=None
print(json.dumps({'filesChecked':len(files),'filesExact':report['filesExact'],'assetRetries':report['assetRetries'],'routes':len(routes),'anonymousDenied':all(x['denied']for x in anonymous)}),flush=True)
assert all(x['exact']for x in results)and all(x['newHtmlExact']and x['correctPrivateBuild']for x in routes)and all(x['denied']for x in anonymous)
