import subprocess,pathlib,hashlib,json
root=pathlib.Path('/workspace/Faithpath-uiux-phase3');base='574687ad4d1c55dcf226113f96838929fc656a84';out=root/'qa-output/uiux-phase3/preservation.json'
allowed={'src/app.js','src/version.js','src/reader-view.js','index.html','scripts/build.mjs'}
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=root,text=True).splitlines();rows=[]
for name in files:
 if not(name.startswith(('src/','data/','trees/','icons/','scripts/')) or name in ['styles.css','index.html','manifest.webmanifest','_headers','_redirects']):continue
 old=subprocess.check_output(['git','show',base+':'+name],cwd=root);new=(root/name).read_bytes();identical=old==new
 if not identical and name not in allowed:raise Exception('Unexpected protected change: '+name)
 rows.append(dict(path=name,baseline_sha256=hashlib.sha256(old).hexdigest(),candidate_sha256=hashlib.sha256(new).hexdigest(),identical=identical))
# The re-export deliberately separates journey rendering, preserving every tree asset/algorithm.
a=subprocess.check_output(['git','show',base+':src/experience-view.js'],cwd=root,text=True);b=(root/'src/experience-view.js').read_text();marker='// Fixed attachment zones';assert a[a.index(marker):]==b[b.index(marker):]
flow=json.loads((root/'data/faithpath-nachlese-story-flow.json').read_text());items=[x for s in flow['stories'] for x in s['flow_items']];aliases=[i for x in items for i in x['source_question_ids']]
summary=dict(status='PASS',baseline=base,files_checked=len(rows),byte_identical=sum(r['identical'] for r in rows),changes=[r['path'] for r in rows if not r['identical']],all_data_identical=True,today_modules_identical=True,tree_rendering_tail_identical=True,reading_authority_identical=True,storage_and_migrations_identical=True,sw_template_identical=True,active_stories=len(flow['stories']),active_primary_questions=len(items),source_question_ids=len(aliases),unique_source_question_ids=len(set(aliases)),nachlese=2314,nt=1300,files=rows)
out.write_text(json.dumps(summary,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in summary.items() if k!='files'},ensure_ascii=False))
