"""Standalone, file://-capable screenshot comparison. No private data or requests."""
from pathlib import Path
import json,shutil
root=Path(__file__).resolve().parents[1]
out=root/'reports/uiux6b/screenshots';after=out/'after';after.mkdir(parents=True,exist_ok=True)
source=root/'qa-output/uiux6b/final-visual'
result=json.loads((source/'results.json').read_text())
assert len(result['results'])==236 and not result['errors']
assert all(r['status']=='PASS' for r in result['results'])
for f in source.glob('*.png'):shutil.copy2(f,after/f.name)
shutil.copy2(source/'results.json',after/'results.json')
extras=root/'qa-output/uiux6b/final-states'
extra_result=json.loads((extras/'results.json').read_text())
assert len(extra_result['results'])==84 and not extra_result['errors']
assert all(r['status']=='PASS' for r in extra_result['results'])
for row in extra_result['results']:
    name=row['name']+'-'+row['theme']+'.png'
    shutil.copy2(extras/name,after/('state-'+name))
shutil.copy2(extras/'results.json',after/'states-results.json')

study=Path('/workspace/Faithpath-uiux6a2/prototypes/uiux6-premium/screenshots')
mapping={'today':'today-light','reader':'reader-light','journal':'journal-light','path':'path-light','discover':'discover-light','quiz':'new-quiz-390','editor':'new-editor-390','tree':'tree-stage-4','journey':'sword-1-seal'}
for name in mapping.values():shutil.copy2(study/(name+'.png'),out/'study'/(name+'.png'))
labels={'today':'Heute','reader':'Bibelreader','journal':'Journal','paths':'Mein Weg','path':'Wegdetail','tree':'Olivenbaum','journey':'Bibelreise','entry':'Gedanke','review':'Damals und heute','reviews':'Rückblicke','history':'Geschichte','bible':'Bibelübersicht','discover':'Entdecken','story':'Geschichte lesen','question':'Nachlese-Frage','quiz':'Kapitelübung','collection':'Fragensammlung','topic':'Thema','guided':'Geführter Weg','more':'Mehr','settings':'Einstellungen','backup':'Backup','marks':'Markierungen','licenses':'Lizenzen','status':'Inhaltsstatus','error':'Fehlerzustand'}
options=''.join(f'<option value="{k}">{v}</option>' for k,v in labels.items())
receipt=json.loads((root/'reports/uiux6b/BUILD_RECEIPT.json').read_text())
html='''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FaithPath · Verbunden · Bildvergleich</title>
<style>*{box-sizing:border-box}body{margin:0;background:#f7f7f2;color:#20382f;font:16px/1.65 system-ui}header,main{max-width:1480px;margin:auto;padding:24px}h1{font:400 clamp(32px,5vw,56px)/1.1 Georgia;margin:12px 0}p{max-width:850px}small{display:block;color:#526257}label{display:inline-grid;gap:4px;margin:0 16px 12px 0}select{font:inherit;padding:10px;border:1px solid #9aa79d;background:#fffefa;color:inherit;border-radius:8px;min-height:44px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}figure{margin:0;background:#fffefa;padding:16px;border:1px solid #d8ded4;border-radius:16px}figcaption{min-height:60px}img{display:block;max-width:100%;height:auto;margin:16px auto 0;box-shadow:0 4px 18px #20382f12}a{color:#315e45;min-height:44px;display:inline-flex;align-items:center}button:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #28694b;outline-offset:3px}#all{columns:3}#all a{display:block;overflow-wrap:anywhere;padding:4px 0}@media(max-width:800px){.grid{grid-template-columns:1fr}#all{columns:1}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}</style>
<header><small>ECHTE BROWSER-SCREENSHOTS · SYNTHETISCHE DATEN</small><h1>FaithPath. Verbunden.</h1><p>Der bisherige UIUX4+5-Stand, die ausgewählte Premium-Studie und die integrierte echte App im direkten Vergleich. Die Studie nutzt andere Beispieldaten; ihre Inhalte sind keine Produktionsdaten. Diese Galerie zeigt Aufnahmen, keine zweite App.</p><small id="receipt"></small><p>Echte iPhone-/Safari-/VoiceOver-Abnahme: <strong>OFFEN</strong>. Keine Produktionsveröffentlichung.</p></header>
<main><label>Ansicht<select id="screen">OPTIONS</select></label><label>Neues Theme<select id="theme"><option value="light">Hell</option><option value="atmospheric">Atmosphärisch</option><option value="paper">Papier</option><option value="night">Nacht</option></select></label><label>Neuer Viewport<select id="width"><option>390</option><option>320</option><option>430</option><option>1440</option></select></label><label>Textgröße<select id="font"><option>100</option><option>200</option></select></label>
<div class="grid"><figure><figcaption><strong>Vorher · echte UIUX4+5-App</strong><small>390×844 · Hell · identische synthetische Grundfixture</small></figcaption><img id="before" alt="Bisherige echte App"><a id="before-link">Original-PNG öffnen</a></figure><figure><figcaption><strong>Designreferenz · Studie6A.2</strong><small>Unveränderte Referenz · eigenes Demomodell</small></figcaption><img id="study" alt="Ausgewählte Premium-Studie"><p id="study-note"></p></figure><figure><figcaption><strong>Nachher · echte6B-App</strong><small id="new-note"></small></figcaption><img id="after" alt="Integrierte echte FaithPath-App"><a id="after-link">Original-PNG öffnen</a></figure></div>
<p>Die Altansicht und die Studie bleiben als feste Referenzen sichtbar. Zusätzliche Größen und große Schrift sind für acht kritische echte Ansichten vorhanden. Bei anderen Kombinationen zeigt die Galerie ausdrücklich die vorhandene390-Pixel-Aufnahme.</p><details><summary>Alle neuen Originalaufnahmen</summary><div id="all"></div></details></main>
<script>const mapping=MAPPING,receipt=RECEIPT,files=FILES;document.querySelector('#receipt').textContent=receipt.build+' · Code '+receipt.source_commit+' · Buildhash '+receipt.build_hash;
function show(){const s=document.querySelector('#screen').value,t=document.querySelector('#theme').value,w=document.querySelector('#width').value,f=document.querySelector('#font').value;let name=s+'-'+t+'-'+w+'-'+f+'.png',fallback=false;if(!files.includes(name)){name=s+'-'+t+'-390-100.png';fallback=true}const before=document.querySelector('#before');before.src='before/'+s+'.png';document.querySelector('#before-link').href=before.src;const study=document.querySelector('#study'),ref=mapping[s];study.hidden=!ref;study.src=ref?'study/'+ref+'.png':'';document.querySelector('#study-note').textContent=ref?'':'Kein gleichartiger Referenzscreen in diesem Vergleichsauszug.';const after=document.querySelector('#after');after.src='after/'+name;document.querySelector('#after-link').href=after.src;document.querySelector('#new-note').textContent=fallback?'Vorhandene390-Pixel-Aufnahme ·100%':w+' Pixel ·'+f+'% Text';}document.querySelectorAll('select').forEach(e=>e.addEventListener('change',show));document.querySelector('#all').innerHTML=files.map(f=>'<a href="after/'+f+'">'+f+'</a>').join('');show();</script></html>'''
html=html.replace('OPTIONS',options).replace('MAPPING',json.dumps(mapping)).replace('RECEIPT',json.dumps(receipt)).replace('FILES',json.dumps(sorted(p.name for p in after.glob('*.png'))))
(out/'index.html').write_text(html)
print(json.dumps({'newScreenshots':len(list(after.glob('*.png'))),'comparison':'reports/uiux6b/screenshots/index.html'}))
