from pathlib import Path
import hashlib, json, shutil, subprocess, runpy
common = runpy.run_path('/tmp/topics-v015-release-common.py')
root = common['ROOT']; summary = common['guard'](); version = common['VERSION']
old = Path('/workspace/sites/oliva-v04-preview')
stage = Path('/workspace/oliva-topics-v015-host-stage')
assert not stage.exists(), 'Preserve existing stage; investigate it before repeating'
core = summary['coreBuild']; namespace = 'preview-v0-15-0-' + core[-10:] + '-r1'
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
routes = ['/bibel', '/einstellungen', '/einladungen', '/garten', '/importieren', '/quellen', '/sammlung', '/start', '/vorhaben', '/wege', '/verstehen', '/lesen/*', '/buch/*', '/weg/*', '/vorhaben/*', '/importarchiv/*', '/verstehen/*', '/geschichten', '/geschichte/*', '/themen']
(dist / '_redirects').write_text(''.join(route + ' /index.html 200\n' for route in routes))
(dist / 'preview-package.json').write_text(json.dumps({'version': version, 'source_build': core, 'asset_namespace': namespace, 'private_only': True, 'a51': True, 'nt_questions': 1300, 'book_scope_default': 'Alle', 'reader_data_version': 11, 'life_topics': 18, 'life_topic_references': 45, 'existing_guided_paths': 9, 'range_notes': True, 'story_units': 436, 'story_questions': 2479, 'story_reflections': 436, 'story_alias_pairs': 95}, indent=2) + '\n')
worker = (root / 'scripts/offline.mjs').read_text(); needle = '.filter((p) => !p.endsWith("sw.js"))'
assert worker.count(needle) == 1
worker = worker.replace(needle, '.filter((p) => !p.endsWith("sw.js") && !p.startsWith("dist/review/") && !["_headers", "_redirects"].includes(path.basename(p)))')
(stage / 'scripts/offline.mjs').write_text(worker)
checker = (old / 'scripts/check-preview.mjs').read_text().replace('"0.14.0"', '"0.15.0"').replace('delivered.reader_data_version, 10', 'delivered.reader_data_version, 11')
checker = checker.replace('"/verstehen/*"', '"/verstehen/*","/themen"')
checker += '\nassert.equal(delivered.life_topics, 18); assert.equal(delivered.life_topic_references, 45); assert.equal(delivered.existing_guided_paths, 9);\n'
(stage / 'scripts/check-preview.mjs').write_text(checker)
(stage / 'baseline-runtime.json').write_text(json.dumps({'version': version, 'source_build': core, 'source_export': str(root / 'dist'), 'namespace': namespace, 'files': baseline, 'validation': summary}, indent=2) + '\n')
(stage / 'README.md').write_text(f"""# OLIVA {version} · eigentümerprivate Web-Vorschau

18 originale Lebensthemen mit 45 Bibelstellen, Einordnungen und Reflexionsfragen sind über Wege → Lebensthemen erreichbar. Alle neun bisherigen Wege bleiben bestehen. Die Themen verwenden den gemeinsamen Reader, freiwillige Reflexionen, dauerhafte Entwürfe, Sammlung und Hub. Originaltexte und zusätzliche OLIVA-Kontexthinweise sind gekennzeichnet. Alle 436 Originalgeschichten / 2479 Fragen / 436 Reflexionsimpulse, 1300 separate NT-Fragen, sieben A51-Stadien und 66 Buchschwerter bleiben erhalten.

{summary['unit']['passed']} Fachtests und ein einzelner vollständiger {summary['browser']['passed']}/{summary['browser']['total']}-Browserlauf bestehen. Echter 0.14→0.15-PWA-Wechsel: vier alte V10-Rohdatensätze vor ausdrücklicher Aktion exakt; V11 schreibt erst nach bewusster Aktion. Bestehende Gedanken, Originalarchive, NT-/Geschichtenantworten und Entwürfe bleiben erhalten. Native JS-/Assetexports und vollständige Katalogvergleiche sind statisch belegt; keine Geräte- oder Simulatorprüfung. Gehostete Browser-QA mangels unterstütztem CUA-Werkzeug nicht erfolgt.

URL: {common['PRIVATE_URL']}/themen

Eigentümerzugriff unverändert. Keine öffentliche Website-/Storeveröffentlichung, kein GitHub-main-Merge und keine Änderung an Original-FaithPath. Keine neuen Bilder oder Laufzeitabhängigkeiten. Unabhängige Fach-/Rechteabnahme und die gesamte Master-Definition-of-Done bleiben offen.
""")
for command in [['node', 'scripts/offline.mjs'], ['node', 'scripts/check-preview.mjs']]:
    result = subprocess.run(command, cwd=stage, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr[-2000:]
assert common['guard']()['runtimeSourceDigest'] == summary['runtimeSourceDigest'], 'Source changed during stage preparation'
checked = json.loads((stage / 'preview-validation.json').read_text())
assert checked['source_build'] == core and checked['version'] == version
print(json.dumps({'stage': str(stage), 'version': checked['version'], 'core': core, 'hostBuild': checked['build_id'], 'runtimeFiles': len(baseline), 'cacheFiles': checked['cache_files_verified'], 'rewrittenJsFiles': checked['rewritten_uri_files'], 'privateOnly': True}))
