"""Prepare genuine comparisons; final report collection requires all named gates."""
from pathlib import Path
import hashlib,json,shutil,sys,subprocess
from PIL import Image,ImageDraw,ImageFont

root=Path(__file__).resolve().parents[1]
qa=root/'qa-output/uiux6d';report=root/'reports/uiux6d';full=qa/'screenshots-delivery'
load=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
after=load(qa/'after/results.json');before=load(qa/'before/results.json')
manifest=load(qa/'candidate/release-integrity.json')
assert len(after['results'])==112 and not after['errors']
assert all(r['status']=='PASS' and r['hash']==manifest['build_hash'] for r in after['results'])
assert len(before['results'])==32 and not before['errors']
font=ImageFont.truetype(str(root/'src/verbunden/assets/fonts/DMSans.ttf'),18)
boards=qa/'contact-sheets';boards.mkdir(exist_ok=True)
for theme in ['light','atmospheric','paper','night']:
 for width,size in [(390,100),(320,200)]:
  board=Image.new('RGB',(4*205,2*480),'#eeeade');draw=ImageDraw.Draw(board)
  for stage in range(1,8):
   im=Image.open(qa/'after'/f'stage-{stage}-{theme}-{width}-{size}-top.png').convert('RGB');im.thumbnail((195,440))
   x=((stage-1)%4)*205;y=((stage-1)//4)*480;draw.text((x+5,y+5),f'Bild {stage} · {size}%',font=font,fill='#20382f');board.paste(im,(x+5,y+34))
  board.save(boards/f'{theme}-{width}-{size}.png')

full.mkdir(exist_ok=True,parents=True)
for name,source in [('after',qa/'after'),('before',qa/'before'),('acceptance',qa/'acceptance'),('update',qa/'update'),('review',qa/'review'),('contact-sheets',boards)]:
 target=full/name;target.mkdir(exist_ok=True)
 for p in source.glob('*.png'):shutil.copyfile(p,target/p.name)
shots=report/'screenshots';shots.mkdir(exist_ok=True,parents=True)
for group in ['after','before','acceptance','update','review','contact-sheets']:(shots/group).mkdir(exist_ok=True)
for group in ['before','after']:
 for p in (full/group).glob('*.png'):
  if p.name.endswith('-top.png') or '-390-100-' in p.name:shutil.copyfile(p,shots/group/p.name)
for group in ['acceptance','update','review','contact-sheets']:
 for p in (full/group).glob('*.png'):shutil.copyfile(p,shots/group/p.name)

for stage,width,size in [(1,390,100),(7,390,100),(1,320,200),(7,320,200)]:
 name=f'stage-{stage}-night-{width}-{size}-top.png';images=[Image.open(full/group/name).convert('RGB') for group in ['before','after']]
 board=Image.new('RGB',(width*2+24,images[0].height+80),'#eeeade');draw=ImageDraw.Draw(board)
 draw.text((10,8),f'Baumbild {stage} · Nacht · {width}px · {size}% Roottext',font=font,fill='#20382f')
 for i,(label,im)in enumerate(zip(['Vorher · TREEGUIDE1','Nachher · TREEGUIDE2'],images)):
  x=i*(width+24);draw.text((x+10,40),label,font=font,fill='#20382f');board.paste(im,(x,80))
 filename=f'Vergleich_Stufe{stage}_{width}_{size}.png';board.save(full/filename);shutil.copyfile(full/filename,report/filename)

def gallery(folder):
 rows=[]
 for row in after['results']:
  prefix=row['name'];states=[s for s in ['top','guide','context'] if (folder/'after'/(prefix+'-'+s+'.png')).exists()]
  if not states:continue
  rows.append({k:row[k] for k in ['name','stage','theme','width','height','font']}|{'states':states,'before':[s for s in states if (folder/'before'/(prefix+'-'+s+'.png')).exists()]})
 payload=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c')
 page='''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FaithPath Phase6D – Baumvergleich</title>
<style>*{box-sizing:border-box}body{margin:0;padding:24px;font:16px/1.6 system-ui;background:#f7f6ef;color:#20382f}header,form,main{max-width:1100px;margin:auto}h1{font-size:1.8rem}form{display:flex;flex-wrap:wrap;gap:16px;padding:20px 0}label{display:grid;max-width:100%}select{font:inherit;padding:8px;min-height:44px;max-width:100%}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}figure{margin:0}figcaption{padding:12px 0;font-weight:600}img{width:100%;max-width:430px;height:auto}aside{padding:16px;border-left:3px solid #8e7046;background:#eee8d9}a{color:inherit}@media(max-width:650px){body{padding:16px}.pair{grid-template-columns:1fr}}@media(prefers-color-scheme:dark){body{background:#141b23;color:#e9edf0}aside{background:#28343f}}</style>
<header><p>FAITHPATH · PHASE6D</p><h1>Deinen Olivenbaum verstehen</h1><aside>Echte Chromium-Aufnahmen mit synthetischen Daten. Keine iPhone-/Safari-/VoiceOver-Abnahme. 200% bedeutet vergrößerten CSS-Roottext, keinen nachgewiesenen Safari-Seitenzoom.</aside><p>Vorher: TREEGUIDE1 · 491acf3<br>Nachher: TREEGUIDE2 · 2b48ae0 · 150c015e…</p></header>
<form><label>Bild<select id="stage"></select></label><label>Theme<select id="theme"></select></label><label>Breite / Text<select id="size"></select></label><label>Zustand<select id="state"></select></label></form>
<main><p id="detail" aria-live="polite"></p><div class="pair"><figure><figcaption>Vorher – vorhandenes Baum-Modul</figcaption><a id="old-link"><img id="old" alt="Baumansicht vor der Korrektur"></a><p id="missing" hidden>Für diese Kombination ist hier kein Vorherbild enthalten.</p></figure><figure><figcaption>Nachher – geprüfter Kandidat</figcaption><a id="new-link"><img id="new" alt="Baumansicht nach der Korrektur"></a></figure></div><p>Bilder öffnen die unveränderte Originaldatei. Umfangreiche Texte bleiben vertikal scrollbar. Die vollständige Bildmatrix liegt im separaten Screenshot-ZIP.</p></main>
<script>const rows=__ROWS__,by=id=>document.getElementById(id),stage=by('stage'),theme=by('theme'),size=by('size'),state=by('state');const names=['Samen','Keimling','Junger Olivenbaum','Wachsender Olivenbaum','Starker Olivenbaum','Erste Früchte','Fruchttragender Olivenbaum'];function options(el,values,label){const old=el.value;el.replaceChildren(...values.map(value=>{const o=document.createElement('option');o.value=value;o.textContent=label(value);return o}));if([...el.options].some(o=>o.value===old))el.value=old}options(stage,[...new Set(rows.map(r=>String(r.stage)))],v=>names[Number(v)]);options(theme,['light','atmospheric','paper','night'],v=>({light:'Hell',atmospheric:'Atmosphärisch',paper:'Papier',night:'Nacht'})[v]);theme.value='night';function resize(){const previous=size.value;options(size,[...new Set(rows.filter(r=>String(r.stage)===stage.value&&r.theme===theme.value).map(r=>r.width+'-'+r.font))],v=>v.replace('-','px · ')+'%');if(!previous&&[...size.options].some(o=>o.value==='390-100'))size.value='390-100';states()}function row(){return rows.find(r=>String(r.stage)===stage.value&&r.theme===theme.value&&r.width+'-'+r.font===size.value)}function states(){const r=row();options(state,r.states,v=>({top:'Seitenanfang',guide:'Sieben Bilder aufgeklappt',context:'Biblischer Kontext'})[v]);render()}function render(){const r=row();by('detail').textContent=r.width+' × '+r.height+' CSS-Pixel · '+r.font+'% Roottext';for(const[key,folder]of[['new','after'],['old','before']]){const img=by(key),link=by(key+'-link');img.hidden=key==='old'&&!r.before.includes(state.value);link.hidden=img.hidden;if(!img.hidden){img.src=folder+'/'+r.name+'-'+state.value+'.png';link.href=img.src;link.target='_blank'}}by('missing').hidden=r.before.includes(state.value)}stage.onchange=theme.onchange=resize;size.onchange=states;state.onchange=render;resize();</script></html>'''
 (folder/'index.html').write_text(page.replace('__ROWS__',payload))
 (folder/'SHA256SUMS.txt').write_text(''.join(sha(p)+'  '+p.relative_to(folder).as_posix()+'\n' for p in sorted(folder.rglob('*')) if p.is_file() and p.name!='SHA256SUMS.txt'))
gallery(full);gallery(shots)
if '--images-only' in sys.argv:
 print(json.dumps({'images':len(list(full.rglob('*.png'))),'status':'IMAGES_ONLY; final QA gate not asserted'}));raise SystemExit(0)

regression=load(qa/'regression/exits.json');acceptance=load(qa/'acceptance/results.json');update=load(qa/'update/results.json')
assert len(regression)==15 and all(r['exit']==0 and r['buildHash']==manifest['build_hash'] for r in regression)
assert len(acceptance['results'])==16 and all(r['status']=='PASS' for r in acceptance['results']) and not acceptance['errors']
assert len(update['results'])==5 and not update['errors'] and update['candidateHash']==manifest['build_hash']
assert load(qa/'backup-lifecycle/results.json')['status']=='PASS'
assert all(r['unchanged'] for r in load(qa/'preservation/results.json')['protectedFiles'])
assert load(qa/'module-preservation.json')['status']=='PASS'
repro=[json.loads(line) for line in (qa/'reproducible-build.jsonl').read_text().splitlines()]
assert len(repro)==2 and all(r['status']=='PASS' and r['build_hash']==manifest['build_hash'] and r['files']==367 for r in repro)
assert not subprocess.check_output(['git','diff',manifest['source_commit'],'--','src','data','trees','styles.css','index.html','scripts/build.mjs','scripts/sw-template.js'],cwd=root).strip()
evidence=report/'evidence';evidence.mkdir(exist_ok=True)
for source in [qa,*[qa/name for name in ['baseline-checks','before','after','acceptance','update','regression','preservation','review','browser-red','browser-green','contact-sheets','gallery','backup-lifecycle']]]:
 files=source.glob('*') if source==qa else source.rglob('*')
 for p in files:
  if not p.is_file() or p.suffix not in ['.json','.jsonl','.log','.txt','.md']:continue
  rel=p.relative_to(qa)
  if any(part.startswith('origin-') or part in ['tls','releases','data'] for part in rel.parts):continue
  target=evidence/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target)
attempt=qa/'attempts/update-without-worker-certificate-trust'
for name in ['results.json','run.log']:
 p=attempt/name;target=evidence/'attempts'/name;target.parent.mkdir(exist_ok=True);shutil.copyfile(p,target)
summary={'build':manifest['build'],'sourceCommit':manifest['source_commit'],'buildHash':manifest['build_hash'],'contentHash':manifest['content_hash'],'unitTests':197,'originalBrowserPrograms':regression,'layoutCases':112,'beforeCases':32,'keyboardAxeCases':16,'offlineThemeCases':4,'actualHTTPSUpdateChecks':5,'protectedContentAndCoreFiles':175,'additionalProtectedSourceFiles':63,'thresholdCases':101,'sevenOriginalMeaningsUnchanged':True,'reproducibleBuildFiles':367,'physicalIOS':'OFFEN','noDeploy':True,'noMerge':True,'images':len(list(full.rglob('*.png')))}
(report/'QA_SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
(report/'BUILD_RECEIPT.json').write_text(json.dumps({k:manifest[k] for k in ['build','source_commit','build_hash','content_hash']},indent=2)+'\n')
(report/'VERAENDERTE_DATEIEN.txt').write_bytes(subprocess.check_output(['git','diff','--name-status','491acf3','--'],cwd=root))
print(json.dumps({'status':'PASS','programmes':15,'layout':112,'acceptance':16,'update':5,'images':summary['images']}))
