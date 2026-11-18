from pathlib import Path
import json, runpy, shutil, hashlib, subprocess, xml.etree.ElementTree as ET

common = runpy.run_path('/workspace/faithpath-next/docs/evidence/today-focus/checks.py')
summary = common['guard']()
root, evidence = common['ROOT'], common['EVIDENCE']
old = Path('/workspace/sites/oliva-v04-preview')
stage = Path('/workspace/oliva-today-focus-host-stage')
assert not stage.exists()
assert json.loads((old/'.openai/hosting.json').read_text())['project_id'] == common['PRIVATE_PROJECT']
core = common['CORE']
namespace = 'preview-today-' + core[-10:] + '-r1'
stage.mkdir()
shutil.copytree(root/'dist', stage/'dist')
shutil.copytree(old/'.openai', stage/'.openai')
shutil.copyfile(root/'app.json', stage/'app.json')
shutil.copyfile(old/'.gitignore', stage/'.gitignore')
(stage/'scripts').mkdir()
dist = stage/'dist'
(dist/namespace).mkdir()
(dist/'_expo').rename(dist/namespace/'_expo')
if (dist/'assets/node_modules').exists():
    (dist/'assets/node_modules').rename(dist/'assets/vendor')
baseline = []
for source in sorted((root/'dist').rglob('*')):
    if not source.is_file():
        continue
    name = source.relative_to(root/'dist').as_posix()
    if name in ['index.html', 'sw.js']:
        continue
    target = namespace+'/'+name if name.startswith('_expo/') else name
    target = target.replace('assets/node_modules/', 'assets/vendor/', 1)
    raw = source.read_bytes()
    adjusted = raw.replace(b'/_expo/', ('/'+namespace+'/_expo/').encode()).replace(b'/assets/node_modules/', b'/assets/vendor/') if name.endswith(('.js', '.css')) else raw
    (dist/target).write_bytes(adjusted)
    baseline.append({'path':target, 'original_path':name, 'bytes':len(adjusted), 'sha256':hashlib.sha256(adjusted).hexdigest(), 'source_sha256':hashlib.sha256(raw).hexdigest(), 'rewritten_asset_urls':raw != adjusted})
(dist/'index.html').write_text((dist/'index.html').read_text().replace('/_expo/', '/'+namespace+'/_expo/'))
shutil.copytree(old/'dist/review', dist/'review')
for name in ['_headers', 'robots.txt', '_redirects']:
    shutil.copyfile(old/'dist'/name, dist/name)
delivered = json.loads((old/'dist/preview-package.json').read_text())
delivered.update({'version':'0.18.0', 'source_build':core, 'asset_namespace':namespace, 'private_only':True, 'today_focus_working_candidate':True, 'formal_new_release':False, 'only_changed_application_file':'app/index.tsx', 'scoped_browser_checks':39, 'browser_single_full_run':False, 'security_audit_passed':False})
(dist/'preview-package.json').write_text(json.dumps(delivered, indent=2)+'\n')
worker = (root/'scripts/offline.mjs').read_text()
needle = '.filter((p) => !p.endsWith("sw.js"))'
assert worker.count(needle) == 1
worker = worker.replace(needle, '.filter((p) => !p.endsWith("sw.js") && !p.startsWith("dist/review/") && !["_headers", "_redirects"].includes(path.basename(p)))')
(stage/'scripts/offline.mjs').write_text(worker)
shutil.copyfile(old/'scripts/check-preview.mjs', stage/'scripts/check-preview.mjs')
(stage/'baseline-runtime.json').write_text(json.dumps({'version':'0.18.0', 'source_build':core, 'namespace':namespace, 'source_export':str(root/'dist'), 'files':baseline, 'validation':summary}, indent=2)+'\n')
(stage/'README.md').write_text('''# OLIVA · privater Heute-Arbeitsstand auf 0.18-Basis

Ausschließlich die Startseite wurde kompakter und verständlicher gestaltet. Eine klare Leseaktion, vorhandene Landschaft und alle bisherigen Angebote bleiben. Datenmodelle, persönliche Daten, Original-FaithPath und GitHub-main bleiben unverändert. Kein neuer formaler Release und kein Retagging von0.18.

Lokale Abnahme:343 Fachtests, Typecheck, sieben Inhaltsprüfungen, Produktionsbuild,33 bestehende Browserfälle und sechs korrigierte Heute-Fälle.39 bezeichnet qualifizierte Fälle aus zwei Läufen, keinen einzelnen vollständigen39/39-Lauf. Beide ursprünglichen Testhelferfehler bleiben dokumentiert. Echter lokaler Wechsel vom bisherigen privaten0.18-PWA-Host zum Heute-Kandidaten erhält alle vier Rohdatensätze exakt. Keine gehostete Browser-, Simulator- oder physische Geräteprüfung behauptet. Die bekannte picomatch-Advisory blockiert weiterhin den unabhängigen CI-Audit.

Vergleiche für320/375/390Pixel: `/review/today-focus/index.svg`. Alle alten Reviewdateien bleiben erhalten. Vorschau ausschließlich für den Eigentümer. Keine öffentliche Website-/Storeveröffentlichung, keine neuen Inhalte oder Bilder, keine Cloud-/KI-/Audiofunktion.
''')
review = dist/'review/today-focus'
assert not review.exists()
(review/'images').mkdir(parents=True)
ET.parse(root/'design-previews/today-focus/index.svg')
shutil.copyfile(root/'design-previews/today-focus/index.svg', review/'index.svg')
shots = []
for source in sorted((evidence/'screens').glob('*.png')):
    shutil.copyfile(source, review/'images'/source.name)
    shots.append({'file':'images/'+source.name, 'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
assert len(shots) == 30
(review/'source.json').write_text(json.dumps({'appVersionBasis':'0.18.0', 'coreBuild':core, 'workingCandidate':True, 'actualLocalChromiumScreenshots':True, 'sameSyntheticProfilesAndFixedTime':True, 'widths':[320,375,390], 'physicalDeviceTest':False, 'hostedBrowserQa':False, 'newIllustrations':False, 'files':shots}, indent=2)+'\n')
for args in [['node','scripts/offline.mjs'], ['node','scripts/check-preview.mjs']]:
    completed = subprocess.run(args, cwd=stage, env=common['SAFE_ENV'], capture_output=True, text=True)
    assert completed.returncode == 0, completed.stderr[-1600:]
assert common['verify_inputs']() == summary['runtimeSourceDigest']
checked = json.loads((stage/'preview-validation.json').read_text())
assert checked['version'] == '0.18.0' and checked['source_build'] == core and checked['all_runtime_hashes_match']
for source in (old/'dist/review').rglob('*'):
    if source.is_file():
        assert (dist/'review'/source.relative_to(old/'dist/review')).read_bytes() == source.read_bytes()
(evidence/'private-package-check.json').write_text(json.dumps(checked, indent=2)+'\n')
(evidence/'validation-summary.json').write_text(json.dumps(summary, indent=2)+'\n')
print(json.dumps({'stage':str(stage), 'core':core, 'privateHostBuild':checked['build_id'], 'runtimeFiles':len(baseline), 'cacheFiles':checked['cache_files_verified'], 'oldReviewsPreserved':True, 'newReviewFiles':32, 'privateOnly':True, 'newFormalRelease':False}))
