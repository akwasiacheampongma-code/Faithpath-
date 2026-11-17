from pathlib import Path
import json,runpy,shutil,hashlib,subprocess
c=runpy.run_path('/tmp/single-spirit-sword-v018-common.py');summary=c['guard']();r=c['ROOT'];e=c['EVIDENCE'];old=Path('/workspace/sites/oliva-v04-preview');stage=Path('/workspace/oliva-single-spirit-sword-v018-host-stage')
assert not stage.exists();assert json.loads((old/'.openai/hosting.json').read_text())['project_id']==c['PRIVATE_PROJECT']
version=c['VERSION'];core=c['CORE'];namespace='preview-v0-18-0-'+core[-10:]+'-r1';stage.mkdir();shutil.copytree(r/'dist',stage/'dist');shutil.copytree(old/'.openai',stage/'.openai');shutil.copyfile(r/'app.json',stage/'app.json');shutil.copyfile(old/'.gitignore',stage/'.gitignore');(stage/'scripts').mkdir();dist=stage/'dist'
(dist/namespace).mkdir();(dist/'_expo').rename(dist/namespace/'_expo')
if (dist/'assets/node_modules').exists():(dist/'assets/node_modules').rename(dist/'assets/vendor')
baseline=[]
for source in sorted((r/'dist').rglob('*')):
 if not source.is_file():continue
 name=source.relative_to(r/'dist').as_posix()
 if name in ['index.html','sw.js']:continue
 target=namespace+'/'+name if name.startswith('_expo/') else name;target=target.replace('assets/node_modules/','assets/vendor/',1);raw=source.read_bytes();adjusted=raw.replace(b'/_expo/',('/'+namespace+'/_expo/').encode()).replace(b'/assets/node_modules/',b'/assets/vendor/') if name.endswith(('.js','.css')) else raw
 (dist/target).write_bytes(adjusted);baseline.append({'path':target,'original_path':name,'bytes':len(adjusted),'sha256':hashlib.sha256(adjusted).hexdigest(),'source_sha256':hashlib.sha256(raw).hexdigest(),'rewritten_asset_urls':raw!=adjusted})
(dist/'index.html').write_text((dist/'index.html').read_text().replace('/_expo/','/'+namespace+'/_expo/'))
shutil.copytree(old/'dist/review',dist/'review')
for name in ['_headers','robots.txt']:shutil.copyfile(old/'dist'/name,dist/name)
routes=['/bibel','/einstellungen','/einladungen','/garten','/importieren','/quellen','/sammlung','/start','/vorhaben','/wege','/verstehen','/lesen/*','/buch/*','/weg/*','/vorhaben/*','/importarchiv/*','/verstehen/*','/geschichten','/geschichte/*','/themen']
(dist/'_redirects').write_text(''.join(route+' /index.html 200\n' for route in routes))
delivered=json.loads((old/'dist/preview-package.json').read_text());delivered.update({'version':version,'source_build':core,'asset_namespace':namespace,'private_only':True,'spiritual_sword_symbols':1,'spiritual_sword_runtime_images':1,'spiritual_sword_has_progress':False,'book_sword_collection':False})
(dist/'preview-package.json').write_text(json.dumps(delivered,indent=2)+'\n')
worker=(r/'scripts/offline.mjs').read_text();needle='.filter((p) => !p.endsWith("sw.js"))';assert worker.count(needle)==1;worker=worker.replace(needle,'.filter((p) => !p.endsWith("sw.js") && !p.startsWith("dist/review/") && !["_headers", "_redirects"].includes(path.basename(p)))');(stage/'scripts/offline.mjs').write_text(worker)
checker=(old/'scripts/check-preview.mjs').read_text().replace('"0.17.0"','"0.18.0"');checker+='\nassert.equal(delivered.spiritual_sword_symbols,1); assert.equal(delivered.spiritual_sword_runtime_images,1); assert.equal(delivered.spiritual_sword_has_progress,false); assert.equal(delivered.book_sword_collection,false);\n';(stage/'scripts/check-preview.mjs').write_text(checker)
(stage/'baseline-runtime.json').write_text(json.dumps({'version':version,'source_build':core,'namespace':namespace,'source_export':str(r/'dist'),'files':baseline,'validation':summary},indent=2)+'\n')
(stage/'README.md').write_text('''# OLIVA0.18 · eigentümerprivate Vorschau

Ein einzelnes statisches Schwert im Bibel-Hub erinnert an Gottes Wort. Galerie, Buchschwertauswahl und Licht-/Sammelmechanik sind entfernt. Alle66Bücher und bestehenden persönlichen Daten bleiben erhalten. Der quellentreue Auszug aus Epheser6,17 öffnet den Reader;6,10–18 ist als Zusammenhang zugänglich. Keine neue Illustration erzeugt; ein vorhandenes Original ist unverändert wiederverwendet.

343Fachtests, ein vollständiger146/146-Browserlauf, alle Inhaltsprüfungen, tatsächlicher0.17→0.18-PWA-Wechsel mit vier exakt erhaltenen Rohdatensätzen und beide statischen nativen Exporte bestanden. Keine physische Geräte-/Simulator-/gehostete Browserabnahme behauptet. Unabhängige neue GitHub-CI besitzt einen getrennten Nachweis.

Diese Vorschau bleibt ausschließlich dem Eigentümer zugänglich. Keine öffentliche Website-/Storefreigabe, kein GitHub-main-Merge, keine FaithPathänderung. Originalbilder, Provenienz, Rechteunterlagen und historische Releases bleiben bewahrt. Gesamter Master bleibt offen; die frühere66er-Sammlung ist durch Nutzerauftrag abgelöst.
''')
review=dist/'review/spiritual-word';review.mkdir(exist_ok=False);shots=[]
for name in ['hub-top-320-light.png','hub-top-1440-dark.png','word-320-light.png','word-1440-dark.png']:
 source=r/'docs/evidence/single-spirit-sword/full-r2/spiritual-word/screens'/name;assert source.is_file();shutil.copyfile(source,review/name);shots.append({'file':name,'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
(review/'source.json').write_text(json.dumps({'version':version,'core':core,'syntheticData':True,'actualLocalChromiumScreenshots':True,'physicalDeviceTest':False,'hostedBrowserQA':False,'files':shots},indent=2)+'\n')
for args in [['node','scripts/offline.mjs'],['node','scripts/check-preview.mjs']]:
 q=subprocess.run(args,cwd=stage,env=c['SAFE_ENV'],capture_output=True,text=True);assert q.returncode==0,q.stderr[-1200:]
assert c['verify_inputs']()==summary['runtimeSourceDigest'];checked=json.loads((stage/'preview-validation.json').read_text());assert checked['version']==version and checked['source_build']==core and checked['all_runtime_hashes_match']
(e/'private-package-check.json').write_text(json.dumps(checked,indent=2)+'\n');(e/'validation-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps({'stage':str(stage),'version':version,'core':core,'hostBuild':checked['build_id'],'runtimeFiles':len(baseline),'cacheFiles':checked['cache_files_verified'],'privateOnly':True}))
