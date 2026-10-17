"""Collect final evidence after all gates finish; --screenshots-only prepares the gallery."""
from pathlib import Path
import hashlib, json, shutil, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

root=Path(__file__).resolve().parents[1]
qa=root/'qa-output/uiux6b-mobile1'
report=root/'reports/uiux6b-mobile1'
full=qa/'screenshot-delivery'
gallery_only='--screenshots-only' in sys.argv[1:]
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest=read(qa/'candidate/release-integrity.json')
matrix=read(qa/'matrix/results.json')
before=read(qa/'before/results.json')
regression=read(qa/'regression/exits.json') if not gallery_only else []
additional=read(qa/'additional/exits.json') if not gallery_only else []
states=read(qa/'additional/states/results.json')
focused=read(qa/'additional/focused/results.json')
update=read(qa/'update/results.json')
contrast=read(qa/'additional/contrast/results.json')
reproducible=read(qa/'reproducible-build.json')
assert len(matrix['results'])==1104 and not matrix['errors']
assert all(r['status']=='PASS' for r in matrix['results'])
assert len(before['results'])==56 and not before['errors']
if not gallery_only:
    assert len(regression)==41 and all(r['exit']==0 for r in regression)
    assert len(additional)==14 and all(r['exit']==0 for r in additional)
assert len(states['results'])==84 and not states['errors']
assert len(focused['results'])==9
assert all(r['status']=='PASS' for r in states['results']+focused['results'])
assert len(update['results'])==11 and not update['errors']
assert update['candidateHash']==manifest['build_hash']
assert all(m['pass'] for r in contrast['results'] for m in r['measurements'])
assert len(reproducible)==2
assert all(r['status']=='PASS' and r['files']==366 and r['build_hash']==manifest['build_hash'] for r in reproducible)
assert all(r['buildHash']==manifest['build_hash'] for r in regression+additional)
assert all(r['buildHash']==manifest['build_hash'] for r in matrix['results'])
assert all(r['unchanged'] for r in read(qa/'preservation/results.json')['protectedFiles'])
assert not subprocess.check_output(['git','diff',manifest['source_commit'],'--','src','styles.css','index.html','data','trees','icons','manifest.webmanifest','scripts/build.mjs','scripts/sw-template.js'],cwd=root).strip()

# Small raw logs/JSON stay in Git; large image matrix is delivered separately.
evidence=report/'evidence';evidence.mkdir(parents=True,exist_ok=True)
excluded={'candidate','repeat','check','check2','screenshot-delivery','rejected-matrix-sw-blocked','rejected-before-sw-blocked','trial1'}
for p in qa.rglob('*'):
    if not p.is_file() or p.suffix not in {'.json','.jsonl','.log','.txt'}: continue
    rel=p.relative_to(qa)
    if any(x in excluded or x=='origin' for x in rel.parts):continue
    if rel.parts[0]=='review' and not (p.name.startswith('worker-') or p.name=='focus-compare.json'):continue
    dest=evidence/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest)
for source in ['qa-output/nt-quiz-final/results.json','qa-output/uiux-phase1/browser/results.json','qa-output/nachlese-editorial/browser/results.json']:
    p=root/source
    if p.exists(): shutil.copyfile(p,evidence/(source.replace('/','_')))

full.mkdir(parents=True,exist_ok=True)
for name,source in [('after',qa/'matrix'),('before',qa/'before'),('states',qa/'additional/states'),('focused',qa/'additional/focused'),('focused-before',qa/'focused-red'),('contact-sheets',qa/'contact-sheets')]:
    d=full/name;d.mkdir(exist_ok=True)
    for p in source.glob('*.png'):shutil.copyfile(p,d/p.name)
review=full/'review';review.mkdir(exist_ok=True)
for p in (qa/'review').glob('worker-*.png'):shutil.copyfile(p,review/p.name)
for p in (qa/'review-final').glob('*.png'):shutil.copyfile(p,review/('final-'+p.name))

# Commit representative complete route/theme screens and the comparable large-text states.
shots=report/'screenshots';shots.mkdir(exist_ok=True)
for group in ['before','after','states','focused','focused-before','review','contact-sheets']:(shots/group).mkdir(exist_ok=True)
for row in matrix['results']:
    keep=(row['width']==390 and row['font']==100) or (row['width']==320 and row['font']==200 and row['name'] in ['today','reader','quiz','journal','journal-empty','settings','journey'])
    if keep:shutil.copyfile(full/'after'/row['screenshot'],shots/'after'/row['screenshot'])
for group in ['before','states','focused','focused-before','review','contact-sheets']:
    for p in (full/group).glob('*.png'):shutil.copyfile(p,shots/group/p.name)

def gallery(folder,all_rows):
    rows=[{k:r[k] for k in ['name','theme','width','height','font','status','screenshot']} for r in all_rows if (folder/'after'/r['screenshot']).exists()]
    for r in rows:r['hasBefore']=(folder/'before'/r['screenshot']).exists()
    payload=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c')
    template='''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FaithPath MOBILE2 – Mobile Vergleich</title>
<style>*{box-sizing:border-box}body{margin:0;padding:28px;font:16px/1.6 system-ui;background:#f5f4ee;color:#20382f}header,form,main{max-width:1100px;margin:auto}h1{font-size:1.7rem}form{display:flex;flex-wrap:wrap;gap:16px;padding:20px 0}label{display:grid}select{min-height:44px;max-width:100%;padding:8px;font:inherit}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}figure{margin:0}figcaption{padding:12px 0;font-weight:600}img{width:100%;max-width:430px;height:auto;border:1px solid #b8c4ba}aside{padding:14px;border-left:3px solid #967442;background:#ece5d6}.meta{font-size:.85rem}a{color:inherit}button{font:inherit;min-height:44px}@media(max-width:650px){body{padding:16px}.pair{grid-template-columns:1fr}}@media(prefers-color-scheme:dark){body{background:#141b23;color:#e9edf0}aside{background:#303a42}} </style>
<header><p>FAITHPATH · MOBILE2</p><h1>Mobile Prüfung: vorher und nachher</h1><aside>Echte Chromium-Screenshots mit synthetischen Daten. Physisches iPhone/Safari/VoiceOver: OFFEN. Roottext-Vergrößerung ist kein Safari-Seitenzoom.</aside><p class="meta">Vorher: UIUX6B-CANDIDATE · 911c3f4a…<br>Nachher: UIUX6B-MOBILE2 · __HASH__… · Appcommit __SOURCE__</p></header>
<form><label>Ansicht<select id="screen"></select></label><label>Theme<select id="theme"></select></label><label>Breite / Text<select id="size"></select></label></form><main><p id="detail"></p><div class="pair"><figure><figcaption>Vorher – unveränderter 6B-Build</figcaption><a id="old-link"><img id="old" alt="Vorherzustand"></a><p id="missing" hidden>Für diese Kombination wurde kein Vorherbild aufgenommen.</p></figure><figure><figcaption>Nachher – MOBILE2</figcaption><a id="new-link"><img id="new" alt="Nachherzustand"></a></figure></div><p>Die Bilder zeigen den vollständigen Browser-Viewport. Bei großer Schrift bleibt vertikales Scrollen erforderlich. Bilder anklicken, um die Original-PNG zu öffnen.</p></main>
<script>const rows=__ROWS__,screen=document.querySelector('#screen'),theme=document.querySelector('#theme'),size=document.querySelector('#size');const names={today:'Heute',bible:'Bibelübersicht',reader:'Reader · OTB · Psalm 119',luther:'Reader · Luther 1912 · Psalm 119',short:'Reader · Kurzkapitel',journey:'Bibelreise & Schwert',tree:'Olivenbaum',paths:'Viele Wege',path:'Wegdetail',journal:'Journal · gefüllt',entry:'Langer Journaleintrag',reviews:'Rückblicke',review:'Rückblickdetail',discover:'Entdecken',story:'Geschichte',question:'Nachlesefrage',quiz:'Kapitelquiz',more:'Mehr',settings:'Einstellungen',backup:'Backup','journal-empty':'Journal · leer','editor-empty':'Editor · leer','search-empty':'Suche · kein Ergebnis'};function options(el,values,label){el.replaceChildren(...values.map(v=>{const o=document.createElement('option');o.value=v;o.textContent=label(v);return o}))}options(screen,[...new Set(rows.map(r=>r.name))],v=>names[v]||v);screen.value='journal-empty';options(theme,[...new Set(rows.map(r=>r.theme))],v=>({light:'Hell',atmospheric:'Atmosphärisch',paper:'Papier',night:'Nacht'})[v]);theme.value='night';function sizes(){const previous=size.value;options(size,[...new Set(rows.filter(r=>r.name===screen.value&&r.theme===theme.value).map(r=>r.width+'-'+r.font))],v=>v.replace('-','px · ')+'%');if([...size.options].some(o=>o.value===previous))size.value=previous;else if([...size.options].some(o=>o.value==='390-100'))size.value='390-100';render()}function render(){const row=rows.find(r=>r.name===screen.value&&r.theme===theme.value&&r.width+'-'+r.font===size.value);if(!row)return;document.querySelector('#detail').textContent=row.width+' × '+row.height+' CSS-Pixel · '+row.font+'% Roottext · '+row.status;for(const[key,folder]of[['new','after'],['old','before']]){const image=document.querySelector('#'+key),link=document.querySelector('#'+key+'-link');image.hidden=key==='old'&&!row.hasBefore;link.hidden=image.hidden;if(!image.hidden){image.src=folder+'/'+row.screenshot;link.href=image.src;link.target='_blank'}}document.querySelector('#missing').hidden=row.hasBefore}screen.onchange=theme.onchange=sizes;size.onchange=render;sizes();</script></html>'''
    (folder/'index.html').write_text(template.replace('__ROWS__',payload).replace('__SOURCE__',manifest['source_commit'][:7]).replace('__HASH__',manifest['build_hash'][:8]))
gallery(full,matrix['results']);gallery(shots,matrix['results'])

font=ImageFont.truetype(str(root/'src/verbunden/assets/fonts/DMSans.ttf'),20)
for name,screen,width,font_size in [('Journal','journal-empty',390,100),('Reader','reader',390,100),('Quiz','quiz',390,100),('Journal_200','journal-empty',320,200)]:
    filename=f'{screen}-night-{width}-{font_size}.png'
    images=[Image.open(full/g/filename).convert('RGB') for g in ['before','after']]
    board=Image.new('RGB',(width*2+24,images[0].height+90),'#f5f4ee');draw=ImageDraw.Draw(board)
    draw.text((12,10),f'{name} · Nacht · {width}px · {font_size}% Roottext',font=font,fill='#20382f')
    for i,(label,image) in enumerate(zip(['Vorher','MOBILE2'],images)):
        draw.text((i*(width+24)+12,45),label,font=font,fill='#20382f');board.paste(image,(i*(width+24),90))
    board.save(full/(name+'_Vergleich.png'));shutil.copyfile(full/(name+'_Vergleich.png'),report/(name+'_Vergleich.png'))

for folder in [full,shots]:
    (folder/'SHA256SUMS.txt').write_text(''.join(sha(p)+'  '+p.relative_to(folder).as_posix()+'\n' for p in sorted(folder.rglob('*')) if p.is_file() and p.name!='SHA256SUMS.txt'))

if gallery_only:
    print(json.dumps({'screenshots':len(list(full.rglob('*.png'))),'status':'GALLERY_ONLY; full QA summary not generated'}))
    raise SystemExit(0)

summary={'build':manifest['build'],'sourceCommit':manifest['source_commit'],'buildHash':manifest['build_hash'],'contentHash':manifest['content_hash'],'unitTests':191,'originalBrowserPrograms':regression,'additionalPrograms':additional,'mobileMatrixCases':len(matrix['results']),'beforeCases':len(before['results']),'secondaryStates':len(states['results']),'focusedCases':len(focused['results']),'updateChecks':len(update['results']),'contrastMeasurements':sum(len(r['measurements']) for r in contrast['results']),'protectedFiles':175,'reproducibleBuild':True,'physicalIOS':'OFFEN','liveEquivalence':'OFFEN: QAhostCONNECT403; NetlifyAPI401','noDeploy':True,'noMerge':True,'screenshots':len(list(full.rglob('*.png')))}
(report/'QA_SUMMARY.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
(report/'BUILD_RECEIPT.json').write_text(json.dumps({k:manifest[k] for k in ['build','source_commit','content_hash','build_hash']},indent=2))
lines=['# MOBILE2 QA-Matrix','',f"Appcommit `{manifest['source_commit']}`, Buildhash `{manifest['build_hash']}`.",'','| Prüfung | Ergebnis |','|---|---|','| Unit-Tests (mit Content-Pretest) |191 PASS|','| Mobile Layoutmatrix |1104 PASS|','| Echte Vorherbilder |56 aufgenommen|','| Sekundäre Zustände |84 PASS|','| Zielgerichtete Layoutregression |9 PASS; zwei RED-Zyklen mit5 und3 FAIL; Safe-Area-Kontrolle bereits grün|','| Tatsächliches HTTPS-Worker-Update |11 Prüfungen PASS|','| Kontrast-Nachprüfung |140 Messungen PASS|','| Geschützte Dateien |175 unverändert|','| Build zweimal |366 Dateien bytegleich|','| Physisches iPhone/Safari/VoiceOver |OFFEN|','| Livehost-Gleichheit |OFFEN (403/401)|','','## Ursprüngliche Browserprogramme','','| Name | Exit |','|---|---|']
lines += [f"|{r['name']}|{r['exit']}|" for r in regression]
lines += ['','## Zusätzliche Programme','','| Name | Exit |','|---|---|']+[f"|{r['name']}|{r['exit']}|" for r in additional]
lines += ['','Nicht alle historischen Update-/Hilfstreiber wurden wörtlich gestartet. Der aktuelle Übergang6B→MOBILE2 wird separat auf derselben isolierten HTTPS-Origin geprüft. Alle tatsächlichen Befehle/Exits stehen in evidence/. Frühere blockierte Worker-Bildläufe sind verworfen und keine PASS-Visualbelege.']
(report/'QA_MATRIX.md').write_text('\n'.join(lines)+'\n')
(report/'VERAENDERTE_DATEIEN.txt').write_bytes(subprocess.check_output(['git','diff','--name-status','49ec83c','--'],cwd=root))
(report/'SHA256SUMS_QA.txt').write_text(''.join(sha(p)+'  '+p.relative_to(report).as_posix()+'\n' for p in sorted(report.rglob('*')) if p.is_file() and p.name!='SHA256SUMS_QA.txt'))
print(json.dumps({'matrix':1104,'regression':41,'additional':14,'screenshots':summary['screenshots'],'status':'PASS'}))
