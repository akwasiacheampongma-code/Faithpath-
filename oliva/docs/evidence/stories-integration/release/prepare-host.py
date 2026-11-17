from pathlib import Path
import hashlib, json, shutil, subprocess, runpy
common = runpy.run_path('/tmp/stories-v014-release-common.py')
root = common['ROOT']; summary = common['guard'](); version = common['VERSION']
old = Path('/workspace/sites/oliva-v04-preview')
stage = Path('/workspace/oliva-stories-v014-host-stage')
assert not stage.exists(), 'Preserve existing stage; investigate it before repeating'
core = summary['coreBuild']; namespace = 'preview-v0-14-0-' + core[-10:] + '-r1'
assert json.loads((old / '.openai/hosting.json').read_text())['project_id'] == common['PRIVATE_PROJECT']
stage.mkdir()
shutil.copytree(root / 'dist', stage / 'dist')
shutil.copytree(old / '.openai', stage / '.openai')
shutil.copyfile(root / 'app.json', stage / 'app.json')
shutil.copyfile(old / '.gitignore', stage / '.gitignore')
(stage / 'scripts').mkdir(); dist = stage / 'dist'
(dist / namespace).mkdir(); (dist / '_expo').rename(dist / namespace / '_expo')
if (dist / 'assets/node_modules').exists(): (dist / 'assets/node_modules').rename(dist / 'assets/vendor')
baseline = []
for source in sorted((root / 'dist').rglob('*')):
    if not source.is_file(): continue
    relative = source.relative_to(root / 'dist').as_posix()
    if relative in ['index.html', 'sw.js']: continue
    mapped = namespace + '/' + relative if relative.startswith('_expo/') else relative
    mapped = mapped.replace('assets/node_modules/', 'assets/vendor/', 1)
    raw = source.read_bytes()
    adjusted = raw.replace(b'/_expo/', ('/' + namespace + '/_expo/').encode()).replace(b'/assets/node_modules/', b'/assets/vendor/') if relative.endswith(('.js', '.css')) else raw
    (dist / mapped).write_bytes(adjusted)
    baseline.append({'path': mapped, 'original_path': relative, 'bytes': len(adjusted), 'sha256': hashlib.sha256(adjusted).hexdigest(), 'source_sha256': hashlib.sha256(raw).hexdigest(), 'rewritten_asset_urls': raw != adjusted})
(dist / 'index.html').write_text((dist / 'index.html').read_text().replace('/_expo/', '/' + namespace + '/_expo/'))
shutil.copytree(old / 'dist/review', dist / 'review')
for name in ['_headers', 'robots.txt']: shutil.copyfile(old / 'dist' / name, dist / name)
routes = ['/bibel', '/einstellungen', '/einladungen', '/garten', '/importieren', '/quellen', '/sammlung', '/start', '/vorhaben', '/wege', '/verstehen', '/lesen/*', '/buch/*', '/weg/*', '/vorhaben/*', '/importarchiv/*', '/verstehen/*', '/geschichten', '/geschichte/*']
(dist / '_redirects').write_text(''.join(route + ' /index.html 200\n' for route in routes))
(dist / 'preview-package.json').write_text(json.dumps({'version': version, 'source_build': core, 'asset_namespace': namespace, 'private_only': True, 'a51': True, 'nt_questions': 1300, 'book_scope_default': 'Alle', 'reader_data_version': 10, 'range_notes': True, 'story_units': 436, 'story_questions': 2479, 'story_reflections': 436, 'story_alias_pairs': 95}, indent=2) + '\n')
worker = (root / 'scripts/offline.mjs').read_text(); needle = '.filter((p) => !p.endsWith("sw.js"))'
assert worker.count(needle) == 1
worker = worker.replace(needle, '.filter((p) => !p.endsWith("sw.js") && !p.startsWith("dist/review/") && !["_headers", "_redirects"].includes(path.basename(p)))')
(stage / 'scripts/offline.mjs').write_text(worker)
checker = (old / 'scripts/check-preview.mjs').read_text().replace('\"/verstehen/*\"', '\"/verstehen/*\",\"/geschichten\",\"/geschichte/*\"')
assert '"/verstehen/*"' in checker
checker += '''
const delivered = JSON.parse(await readFile("dist/preview-package.json", "utf8"));
assert.equal(delivered.version, "0.14.0");
assert.equal(delivered.story_units, 436); assert.equal(delivered.story_questions, 2479);
assert.equal(delivered.story_reflections, 436); assert.equal(delivered.story_alias_pairs, 95);
assert.equal(delivered.reader_data_version, 10); assert.equal(delivered.private_only, true);
'''
(stage / 'scripts/check-preview.mjs').write_text(checker)
(stage / 'baseline-runtime.json').write_text(json.dumps({'version': version, 'source_build': core, 'source_export': str(root / 'dist'), 'namespace': namespace, 'files': baseline, 'validation': summary}, indent=2) + '\n')
(stage / 'README.md').write_text(f"""# OLIVA {version} · eigentümerprivate Web-Vorschau

Die vollständige freigegebene Geschichtenbibliothek enthält 436 Originaleinheiten, 2.479 Fragen und 436 freiwillige Reflexionsimpulse. Sechs vorhandene Motive und typografische Karten folgen der bestätigten Gestaltung. Gemeinsamer interner Reader, dauerhafte Antworten mit Konfliktschutz, getrenntes Überspringen, genaue Wiederaufnahme und echte Reflexionen in der Sammlung sind integriert. Baum, Buchschwerter, alle 1.300 separaten NT-Fragen und der abgeschlossene Reader bleiben erhalten.

{summary['unit']['passed']} Fachtests und ein vollständiger {summary['browser']['passed']}/{summary['browser']['total']}-Browserlauf bestanden. Der reale 0.13.1→0.14.0-PWA-Wechsel erhält vier V9-Rohrecords vor ausdrücklicher Aktion und ergänzt V10 erst beim Speichern. Native JS-/Assetexports und vollständige native Katalogvergleiche sind statisch belegt; keine Geräte- oder Simulatorprüfung. Gehostete Browser-QA mangels unterstütztem CUA-Werkzeug nicht erfolgt.

URL: {common['PRIVATE_URL']}/geschichten

Eigentümerzugriff unverändert, keine öffentliche Website-/Storeveröffentlichung. Original-FaithPath, GitHub main und historische Tags bleiben erhalten. Die gesamte Master-Definition-of-Done bleibt offen. Unabhängige theologische/historische Prüfung und allgemeine Inhalts-/Bildrechtefreigabe stehen aus. Keine neuen Bilder generiert.
""")
for command in [['node', 'scripts/offline.mjs'], ['node', 'scripts/check-preview.mjs']]:
    result = subprocess.run(command, cwd=stage, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr[-2000:]
assert common['guard']()['runtimeSourceDigest'] == summary['runtimeSourceDigest'], 'Source changed during stage preparation'
checked = json.loads((stage / 'preview-validation.json').read_text())
assert checked['source_build'] == core and checked['version'] == version
print(json.dumps({'stage': str(stage), 'version': checked['version'], 'core': core, 'hostBuild': checked['build_id'], 'runtimeFiles': len(baseline), 'cacheFiles': checked['cache_files_verified'], 'rewrittenJsFiles': checked['rewritten_uri_files'], 'privateOnly': True}))
