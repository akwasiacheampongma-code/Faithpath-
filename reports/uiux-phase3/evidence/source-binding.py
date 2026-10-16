import subprocess,pathlib,hashlib,json
r=pathlib.Path('/workspace/Faithpath-uiux-phase3');commit='f6f857d8c88affcd20872cac0c8e8c3a8a3910f0';rows={}
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',commit],cwd=r,text=True).splitlines():
 if name.startswith(('src/','data/','trees/','icons/','scripts/'))or name in ['index.html','styles.css','manifest.webmanifest','_headers','_redirects','404.html']:
  old=subprocess.check_output(['git','show',commit+':'+name],cwd=r);now=(r/name).read_bytes();assert old==now,name;rows[name]=hashlib.sha256(now).hexdigest()
(r/'qa-output/uiux-phase3/source-binding.json').write_text(json.dumps(dict(status='PASS',implementation_commit=commit,inputs_match_git_blobs=True,files=rows),indent=2));print('Bound',len(rows),'build input files to',commit)
