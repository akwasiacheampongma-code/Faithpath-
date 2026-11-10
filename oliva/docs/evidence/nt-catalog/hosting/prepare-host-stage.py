from pathlib import Path
import hashlib, json, re, shutil, subprocess

root = Path('/workspace/faithpath-next')
old = Path('/workspace/sites/oliva-v04-preview')
stage = Path('/workspace/oliva-v012-host-stage')
assert not stage.exists(), 'Keep any existing stage intact'
summary = json.loads((root / 'docs/evidence/nt-catalog/validation-summary.json').read_text())
assert summary['allCoreChecksPassed'] and summary['version'] == '0.12.0'
core = summary['coreBuild']
namespace = 'preview-v0-12-0-' + core[-10:] + '-r2'
stage.mkdir()
shutil.copytree(root / 'dist', stage / 'dist')
shutil.copytree(old / '.openai', stage / '.openai')
shutil.copyfile(root / 'app.json', stage / 'app.json')
shutil.copyfile(old / '.gitignore', stage / '.gitignore')
(stage / 'scripts').mkdir()
dist = stage / 'dist'
(dist / namespace).mkdir()
(dist / '_expo').rename(dist / namespace / '_expo')
if (dist / 'assets/node_modules').exists():
    (dist / 'assets/node_modules').rename(dist / 'assets/vendor')
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
html = (dist / 'index.html').read_text().replace('/_expo/', '/' + namespace + '/_expo/')
(dist / 'index.html').write_text(html)
shutil.copytree(old / 'dist/review', dist / 'review')
for name in ['_headers', 'robots.txt']:
    shutil.copyfile(old / 'dist' / name, dist / name)
routes = ['/bibel', '/einstellungen', '/einladungen', '/garten', '/importieren', '/quellen', '/sammlung', '/start', '/vorhaben', '/wege', '/verstehen', '/lesen/*', '/buch/*', '/weg/*', '/vorhaben/*', '/importarchiv/*', '/verstehen/*']
(dist / '_redirects').write_text(''.join(route + ' /index.html 200\n' for route in routes))
(dist / 'preview-package.json').write_text(json.dumps({'version': '0.12.0', 'source_build': core, 'asset_namespace': namespace, 'private_only': True, 'a51': True, 'nt_questions': 1300}, indent=2) + '\n')
worker = (root / 'scripts/offline.mjs').read_text()
needle = '.filter((p) => !p.endsWith("sw.js"))'
assert worker.count(needle) == 1
worker = worker.replace(needle, '.filter((p) => !p.endsWith("sw.js") && !p.startsWith("dist/review/") && !["_headers", "_redirects"].includes(path.basename(p)))')
(stage / 'scripts/offline.mjs').write_text(worker)
checker = (old / 'scripts/check-preview.mjs').read_text()
checker = checker.replace('"/importarchiv/*"]', '"/importarchiv/*","/verstehen","/verstehen/*"]')
assert '"/verstehen/*"' in checker
(stage / 'scripts/check-preview.mjs').write_text(checker)
(stage / 'baseline-runtime.json').write_text(json.dumps({'version': '0.12.0', 'source_build': core, 'source_export': str(root / 'dist'), 'namespace': namespace, 'files': baseline, 'validation': summary}, indent=2) + '\n')
(stage / 'README.md').write_text('''# OLIVA 0.12 · eigentümerprivate Web-Vorschau

Statisches Hostpaket des unabhängigen Expo-Projekts: alle 1.300 Originalfragen des NT-Katalogs, konservative historische Übernahme und neutrale V8-Migration. 225 Fachtests und ein einzelner vollständiger 108/108-Browserlauf bestanden. Echter 0.11→0.12-Workerwechsel sowie beide nativen JS-/Assetexports sind separat belegt; keine Geräteabnahme.

URL: https://oliva-v04-private-preview.purplebean128.chatgpt.site

Neu: Bibel → Fragen zum Neuen Testament. Alle 27 Bücher und 260 Kapitel sind enthalten. Erst „Antwort prüfen“ speichert. Vorhandene Archive erlauben ausdrücklich die Übernahme belegter früherer Abschlüsse; keine erfundenen Antworten oder Glaubensbewertung. Reader, A51, Buchbilder und persönliche Funktionen bleiben erhalten.

Eigentümerzugriff unverändert. Kein öffentlicher Web-/Storedeploy, keine Änderung an FaithPath/main. AppData V8, privates Dokument V1, SQLite3 und IndexedDB1. Daten bleiben lokal, kein aktiver Cloud-Sync oder Live-KI. Kein gehosteter CUA-, Simulator- oder Handytest behauptet. Vollständige Source und Evidenz liegen im unabhängigen OLIVA-Projekt.
''')
for command in [['node', 'scripts/offline.mjs'], ['node', 'scripts/check-preview.mjs']]:
    result = subprocess.run(command, cwd=stage, capture_output=True, text=True)
    assert result.returncode == 0, result.stderr[-2000:]
checked = json.loads((stage / 'preview-validation.json').read_text())
assert checked['source_build'] == core and checked['version'] == '0.12.0'
print(json.dumps({'stage': str(stage), 'version': checked['version'], 'core': core, 'hostBuild': checked['build_id'], 'runtimeFiles': len(baseline), 'cacheFiles': checked['cache_files_verified'], 'rewrittenJsFiles': checked['rewritten_uri_files'], 'privateOnly': True}))
