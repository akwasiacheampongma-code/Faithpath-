from pathlib import Path
import hashlib, json, shutil, subprocess, runpy
common = runpy.run_path('/tmp/personal-tree-v016-release-common.py')
root = common['ROOT']; summary = common['guard'](); version = common['VERSION']
old = Path('/workspace/sites/oliva-v04-preview')
stage = Path('/workspace/oliva-personal-tree-v016-host-stage')
assert not stage.exists(), 'Preserve existing stage; investigate it before repeating'
core = summary['coreBuild']; namespace = 'preview-v0-16-0-' + core[-10:] + '-r1'
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
(dist / 'preview-package.json').write_text(json.dumps({'version': version, 'source_build': core, 'asset_namespace': namespace, 'private_only': True, 'a51': True, 'nt_questions': 1300, 'book_scope_default': 'Alle', 'reader_data_version': 11, 'life_topics': 18, 'life_topic_references': 45, 'existing_guided_paths': 9, 'personal_tree_links': True, 'tree_history_readonly': True, 'tree_data_writes': False, 'range_notes': True, 'story_units': 436, 'story_questions': 2479, 'story_reflections': 436, 'story_alias_pairs': 95}, indent=2) + '\n')
worker = (root / 'scripts/offline.mjs').read_text(); needle = '.filter((p) => !p.endsWith("sw.js"))'
assert worker.count(needle) == 1
worker = worker.replace(needle, '.filter((p) => !p.endsWith("sw.js") && !p.startsWith("dist/review/") && !["_headers", "_redirects"].includes(path.basename(p)))')
(stage / 'scripts/offline.mjs').write_text(worker)
checker = (old / 'scripts/check-preview.mjs').read_text().replace('"0.15.0"', '"0.16.0"')
checker += '\nassert.equal(delivered.personal_tree_links, true); assert.equal(delivered.tree_history_readonly, true); assert.equal(delivered.tree_data_writes, false);\n'
(stage / 'scripts/check-preview.mjs').write_text(checker)
(stage / 'baseline-runtime.json').write_text(json.dumps({'version': version, 'source_build': core, 'source_export': str(root / 'dist'), 'namespace': namespace, 'files': baseline, 'validation': summary}, indent=2) + '\n')
(stage / 'README.md').write_text(f"""# OLIVA {version} · eigentümerprivate Web-Vorschau

Der persönliche Garten verbindet tatsächliche Vorhaben mit dem unveränderten A51-Originalbaum. Wenige zugängliche Bildziele und eine immer verfügbare Liste öffnen vorhandene Vorhaben, Gedanken, eigene Schritte und Rückblicke. Gemeinsame Gedanken erscheinen einmal. Alte Titel, offene Schritte und unklare Importdaten bleiben erhalten. Stadienvorschauen zeigen keine fiktiven persönlichen Zweige. Reines Betrachten schreibt keine Daten und erzeugt keinen Fortschritt.

{summary['unit']['passed']} Fachtests und ein einzelner vollständiger {summary['browser']['passed']}/{summary['browser']['total']}-Browserlauf bestehen. Echter 0.15→0.16-PWA-Wechsel: alle vier vorhandenen V11-Rohdatensätze durchgehend exakt, auch nach Offline-Neustart, neuen Ansichten sowie tatsächlichem Export/Restorepreview. AppDataV11 bleibt unverändert. Native JS-/Assetexports und vollständige Katalogvergleiche sind statisch belegt; keine Geräte- oder Simulatorprüfung. Gehostete Browser-QA mangels unterstütztem CUA-Werkzeug nicht erfolgt.

Alle 18 originalen Lebensthemen /45 Stellen, neun bisherigen Wege, 436 Geschichten /2479 Fragen /436 Impulse, 1300 separate NT-Fragen, sieben A51-Stadien und 66 Buchschwerter bleiben erhalten. Keine neuen Bilder oder Laufzeitabhängigkeiten.

URL: {common['PRIVATE_URL']}/garten

Eigentümerzugriff unverändert. Keine öffentliche Website-/Storeveröffentlichung, kein GitHub-main-Merge, keine Änderung an Original-FaithPath. Historische Originalrückblicke/Meilensteine sind noch nicht vollständig in die persönliche Historie erschlossen. Fach-/Rechtefreigaben, echte Geräte, weitere Bildarbeit und Cloud-/KI-/Audioarbeit bleiben offen. Die gesamte Master-Definition-of-Done ist nicht abgeschlossen.
""")
personal_review = dist / 'review/personal-tree'
personal_review.mkdir(exist_ok=False)
personal_shots = []
for name in ['garden-320.png', 'garden-1440.png']:
    source = root / 'docs/evidence/personal-tree-release16/browser-final-r1/personal-tree' / name
    assert source.is_file(), 'Actual final version screenshot required: ' + name
    shutil.copyfile(source, personal_review / name)
    personal_shots.append({'file': name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()})
(personal_review / 'source.json').write_text(json.dumps({'version': version, 'build': core, 'syntheticData': True, 'localChromiumScreenshots': True, 'physicalDeviceTest': False, 'files': personal_shots}, indent=2) + '\n')
for command in [['node', 'scripts/offline.mjs'], ['node', 'scripts/check-preview.mjs']]:
    result = subprocess.run(command, cwd=stage, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr[-2000:]
assert common['guard']()['runtimeSourceDigest'] == summary['runtimeSourceDigest'], 'Source changed during stage preparation'
checked = json.loads((stage / 'preview-validation.json').read_text())
assert checked['source_build'] == core and checked['version'] == version
print(json.dumps({'stage': str(stage), 'version': checked['version'], 'core': core, 'hostBuild': checked['build_id'], 'runtimeFiles': len(baseline), 'cacheFiles': checked['cache_files_verified'], 'rewrittenJsFiles': checked['rewritten_uri_files'], 'privateOnly': True}))
