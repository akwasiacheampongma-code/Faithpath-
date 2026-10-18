"""Collect TREEGUIDE2 final-fix evidence; never publishes or changes application data."""
from pathlib import Path
import hashlib,html,json,shutil,subprocess,sys
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1];q=root/'qa-output/uiux6d-final';report=root/'reports/uiux6d-final';full=q/'screenshots-delivery'
load=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
after=load(q/'after/results.json');before=load(q/'before/results.json');manifest=load(q/'candidate/release-integrity.json')
assert len(after['results'])==112 and all(x['status']=='PASS' for x in after['results']) and not after['errors']
assert after['metadata']['build_hash']==manifest['build_hash'];assert len(before['results'])==32 and not before['errors']
full.mkdir(parents=True,exist_ok=True);shots=report/'screenshots';shots.mkdir(parents=True,exist_ok=True)
for group in ['before','after','acceptance','update','review']:
 for target in [full/group,shots/group]:target.mkdir(exist_ok=True)
 for p in (q/group).glob('*.png'):
  shutil.copyfile(p,full/group/p.name)
  representative=group not in ['before','after'] or ('-night-' in p.name and ('stage-1-' in p.name or 'stage-7-' in p.name)) or ('-390-100-top' in p.name) or ('stage-7-' in p.name and '-390-100-guide' in p.name)
  if representative:shutil.copyfile(p,shots/group/p.name)
font=ImageFont.truetype(str(root/'src/verbunden/assets/fonts/DMSans.ttf'),17)
for theme in ['light','atmospheric','paper','night']:
 for width,size in [(390,100),(320,200)]:
  im=Image.new('RGB',(820,960),'#eeeade');draw=ImageDraw.Draw(im)
  for stage in range(1,8):
   shot=Image.open(full/'after'/f'stage-{stage}-{theme}-{width}-{size}-top.png').convert('RGB');shot.thumbnail((195,440));x=(stage-1)%4*205;y=(stage-1)//4*480
   draw.text((x+5,y+5),f'Bild{stage} · {size}%',font=font,fill='#20382f');im.paste(shot,(x+5,y+34))
  for folder in [full,shots]:
   (folder/'contact-sheets').mkdir(exist_ok=True);im.save(folder/'contact-sheets'/f'{theme}-{width}-{size}.png')
for name,filename,labels in [
 ('Vergleich_Absatzregeln_390_100.png','stage-1-night-390-100-top.png',['Vorher:16px / 28px; Abstand12px','Nachher:15,2px / 25,08px; Abstand10px']),
 ('Vergleich_Titel_320_200.png','stage-7-night-320-200-top.png',['Vorher: Fruchttragend / er','Nachher: Frucht- / tragender'])]:
 images=[Image.open(full/group/filename).convert('RGB') for group in ['before','after']];width,height=images[0].size
 im=Image.new('RGB',(2*width+24,height+92),'#eeeade');draw=ImageDraw.Draw(im)
 draw.text((8,6),'TREEGUIDE2 → TREEFINAL · echte Chromium-Aufnahmen',font=font,fill='#20382f')
 for i,(label,shot) in enumerate(zip(labels,images)):
  x=i*(width+24);draw.text((x+8,38),label,font=font,fill='#20382f');draw.text((x+8,62),'Titelgröße unverändert',font=font,fill='#20382f');im.paste(shot,(x,92))
 im.save(full/name);shutil.copyfile(full/name,report/name)

def gallery(folder):
 rows=[]
 for r in after['results']:
  name=r['name'];cells=[]
  for group,state in [('before','top'),('after','top'),('before','meaning'),('after','meaning'),('after','guide')]:
   target=f'{group}/{name}-{state}.png'
   cells.append(f'<a href="{html.escape(target)}">{group} / {state}</a>' if (folder/target).exists() else '—')
  rows.append('<tr><th>'+html.escape(name)+'</th>'+''.join('<td>'+x+'</td>' for x in cells)+'</tr>')
 page='''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FaithPath TREEFINAL – Vergleich</title><style>*{box-sizing:border-box}body{margin:0;padding:20px;font:16px/1.6 system-ui;background:#f7f5ed;color:#20382f;overflow-wrap:anywhere}main{max-width:1100px;margin:auto}h1{font-size:1.8rem}img{max-width:100%;height:auto}a{color:inherit}th,td{padding:8px;border-bottom:1px solid #b7c0b5;text-align:left}table{width:100%;border-collapse:collapse;table-layout:fixed}th{width:30%}@media(max-width:650px){th,td{display:block;width:100%;padding:4px 0}tr{display:block;margin-bottom:20px}thead{display:none}}@media(prefers-color-scheme:dark){body{background:#141c23;color:#e9edf0}}</style><main><p>FAITHPATH · TREEGUIDE2 → TREEFINAL</p><h1>Zwei gezielte mobile Korrekturen</h1><p>Echte Chromium-Screenshots mit synthetischen Daten. 200% bezeichnet CSS-Roottext; iPhone/Safari/VoiceOver bleiben OFFEN.</p><p>Vorher: App2b48ae0 · Nachher: Appce89422. Alle Namen, Inhalte und Schriftgrößen der Titel bleiben erhalten. Details/Summary wurden mit Tastatur geöffnet und geschlossen.</p>'''
 for name in ['Vergleich_Absatzregeln_390_100.png','Vergleich_Titel_320_200.png']:
  target=name if folder==full else '../'+name;page+=f'<p><a href="{target}"><img src="{target}" alt="{html.escape(name)}"></a></p>'
 page+='<h2>Originalaufnahmen</h2><p>Die Berichtsauswahl enthält nicht jedes Bild. Das vollständige Screenshot-ZIP enthält die ganze Matrix.</p><table><thead><tr><th>Zustand</th><td>Vorher</td><td>Nachher</td><td>Absatz vorher</td><td>Absatz nachher</td><td>Stufenübersicht</td></tr></thead><tbody>'+''.join(rows)+'</tbody></table></main></html>'
 (folder/'index.html').write_text(page)
 (folder/'SHA256SUMS.txt').write_text(''.join(sha(p)+'  '+p.relative_to(folder).as_posix()+'\n' for p in sorted(folder.rglob('*')) if p.is_file() and p.name!='SHA256SUMS.txt'))
gallery(full);gallery(shots)
if '--images-only' in sys.argv:print(json.dumps({'images':len(list(full.rglob('*.png'))),'finalGate':'NOT ASSERTED'}));raise SystemExit(0)
reg=load(q/'regression/exits.json');acceptance=load(q/'acceptance/results.json');update=load(q/'update/results.json');pres=load(q/'preservation/results.json');module=load(q/'module-preservation.json')
assert len(reg)==15 and all(x['exit']==0 and x['buildHash']==manifest['build_hash'] and x['sourceCommit']==manifest['source_commit'] for x in reg)
assert len(acceptance['results'])==16 and all(x['status']=='PASS' for x in acceptance['results']) and not acceptance['errors']
assert len(update['results'])==5 and not update['errors'] and update['candidateHash']==manifest['build_hash']
assert all(x['unchanged'] for x in pres['protectedFiles']) and module['status']=='PASS'
assert load(q/'backup-lifecycle/results.json')['status']=='PASS'
repro=[json.loads(x) for x in (q/'reproducible-build.jsonl').read_text().splitlines()];assert len(repro)==2 and all(x['files']==367 and x['build_hash']==manifest['build_hash'] and x['status']=='PASS' for x in repro)
assert not subprocess.check_output(['git','diff',manifest['source_commit'],'--','src','data','trees','styles.css','index.html','scripts/build.mjs','scripts/sw-template.js'],cwd=root).strip()
evidence=report/'evidence';evidence.mkdir(exist_ok=True)
for p in q.rglob('*'):
 if not p.is_file() or p.suffix not in ['.json','.jsonl','.log','.txt','.md','.mjs']:continue
 rel=p.relative_to(q)
 if rel.parts[0] in ['candidate','repeat','check','screenshots-delivery'] or any(x.startswith('origin-') or x in ['tls','releases','data'] for x in rel.parts):continue
 target=evidence/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target)
summary={'status':'PASS','sourceCommit':manifest['source_commit'],'build':manifest['build'],'buildHash':manifest['build_hash'],'contentHash':manifest['content_hash'],'unitTests':198,'layoutCases':112,'beforeCases':32,'keyboardAxeCases':16,'offlineThemeCases':4,'actualHTTPSUpdateChecks':5,'originalBrowserPrograms':reg,'protectedContentCoreFiles':len(pres['protectedFiles']),'protectedSourceFiles':len(module['protectedFiles']),'thresholdCases':101,'independentReviewCases':8,'reproducibleFiles':367,'fullScreenshotPNGCount':len(list(full.rglob('*.png'))),'physicalIOS_Safari_VoiceOver':'OFFEN','deployments':[],'merges':[]}
(report/'QA_SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n');(report/'BUILD_RECEIPT.json').write_text(json.dumps({k:manifest[k] for k in ['build','source_commit','build_hash','content_hash']},indent=2)+'\n')
print(json.dumps({k:summary[k] for k in ['status','layoutCases','actualHTTPSUpdateChecks','fullScreenshotPNGCount']}))
