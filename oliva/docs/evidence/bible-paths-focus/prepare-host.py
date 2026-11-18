from pathlib import Path
import json, runpy, shutil, hashlib, subprocess, xml.etree.ElementTree as ET

common = runpy.run_path('/workspace/faithpath-next/docs/evidence/bible-paths-focus/checks.py')
summary = common['guard']()
root, evidence = common['ROOT'], common['EVIDENCE']
old = Path('/workspace/sites/oliva-v04-preview')
stage = Path('/workspace/oliva-bible-paths-focus-host-stage')
assert not stage.exists()
assert json.loads((old / '.openai/hosting.json').read_text())['project_id'] == common['PRIVATE_PROJECT']
core = common['CORE']; namespace = 'preview-bible-paths-' + core[-10:] + '-r1'
stage.mkdir(); shutil.copytree(root / 'dist', stage / 'dist'); shutil.copytree(old / '.openai', stage / '.openai')
shutil.copyfile(root / 'app.json', stage / 'app.json'); shutil.copyfile(old / '.gitignore', stage / '.gitignore'); (stage / 'scripts').mkdir()
dist = stage / 'dist'; (dist / namespace).mkdir(); (dist / '_expo').rename(dist / namespace / '_expo')
if (dist / 'assets/node_modules').exists(): (dist / 'assets/node_modules').rename(dist / 'assets/vendor')
baseline = []
for source in sorted((root / 'dist').rglob('*')):
    if not source.is_file(): continue
    name = source.relative_to(root / 'dist').as_posix()
    if name in ['index.html', 'sw.js']: continue
    target = (namespace + '/' + name if name.startswith('_expo/') else name).replace('assets/node_modules/', 'assets/vendor/', 1)
    raw = source.read_bytes()
    adjusted = raw.replace(b'/_expo/', ('/' + namespace + '/_expo/').encode()).replace(b'/assets/node_modules/', b'/assets/vendor/') if name.endswith(('.js', '.css')) else raw
    (dist / target).write_bytes(adjusted)
    baseline.append({'path': target, 'original_path': name, 'bytes': len(adjusted), 'sha256': hashlib.sha256(adjusted).hexdigest(), 'source_sha256': hashlib.sha256(raw).hexdigest(), 'rewritten_asset_urls': raw != adjusted})
(dist / 'index.html').write_text((dist / 'index.html').read_text().replace('/_expo/', '/' + namespace + '/_expo/'))
shutil.copytree(old / 'dist/review', dist / 'review')
for name in ['_headers', 'robots.txt', '_redirects']: shutil.copyfile(old / 'dist' / name, dist / name)
delivered = json.loads((old / 'dist/preview-package.json').read_text())
for name in ['today_focus_working_candidate', 'only_changed_application_file']: delivered.pop(name, None)
delivered.update({'version': '0.18.0', 'source_build': core, 'asset_namespace': namespace, 'private_only': True, 'bible_paths_focus_working_candidate': True, 'formal_new_release': False, 'changed_application_files': summary['runtimeSourceDigest']['changedFromQualifiedToday'], 'scoped_browser_checks': 33, 'browser_single_full_run': True, 'security_audit_passed': False})
(dist / 'preview-package.json').write_text(json.dumps(delivered, indent=2) + '\n')
worker = (root / 'scripts/offline.mjs').read_text(); needle = '.filter((p) => !p.endsWith("sw.js"))'
assert worker.count(needle) == 1
worker = worker.replace(needle, '.filter((p) => !p.endsWith("sw.js") && !p.startsWith("dist/review/") && !["_headers", "_redirects"].includes(path.basename(p)))')
(stage / 'scripts/offline.mjs').write_text(worker); shutil.copyfile(old / 'scripts/check-preview.mjs', stage / 'scripts/check-preview.mjs')
(stage / 'baseline-runtime.json').write_text(json.dumps({'version': '0.18.0', 'source_build': core, 'namespace': namespace, 'source_export': str(root / 'dist'), 'files': baseline, 'validation': summary}, indent=2) + '\n')
(stage / 'README.md').write_text('''# OLIVA · Bibel/Wege · privater Arbeitsstand auf 0.18-Basis

Ausschließlich die mobilen Übersichten Bibel und Wege sind kompakter gestaltet. 66 Bücher,1189Kapitel, neun Wege,18Lebensthemen und alle Geschichten/Fragen bleiben erhalten. Das einzelne friedliche Schwert folgt mobil der Buchliste. Heute, Garten und Sammlung sowie Datenmodelle sind unverändert. Keine neuen Inhalte, Illustrationen, Abhängigkeiten oder Funktionen. Historischer0.18-Tag, Original-FaithPath und GitHub-main bleiben unberührt.

Lokale Abnahme:343Fachtests,33Browserfälle in einem vollständigen Lauf, Typecheck, sieben Inhaltsprüfungen und Produktionsbuild. Vier Breiten, Hell/Dunkel und200%CSS-Text geprüft. Tatsächlicher lokaler PWA-Wechsel erhält alle vier Rohdatensätze exakt. Keine physische Geräte-, Simulator-, VoiceOver-/TalkBack- oder gehostete Browserprüfung. Die unabhängige picomatch-Advisory bleibt offen.

Echte Aufnahmen: `/review/bible-paths-focus/index.svg`. Alle alten Reviews erhalten und vom App-Offlinepaket ausgeschlossen. Fünf Kontrollbilder der anderen Bereiche bytegleich;22Antialiasing-Randpixel am dunklen Baum abweichend, Quellcode und Layout unverändert. Vorschau ausschließlich für den Eigentümer. Kein neuer formaler Release und keine öffentliche Veröffentlichung.
''')
review = dist / 'review/bible-paths-focus'; assert not review.exists(); (review / 'images').mkdir(parents=True)
for source in (root / 'design-previews/bible-paths-focus').glob('*.svg'):
    ET.parse(source); shutil.copyfile(source, review / source.name)
shots = []
for source in sorted((evidence / 'screens').glob('*.png')):
    if not source.name.startswith(('before-bibel-', 'after-bibel-', 'before-wege-', 'after-wege-')): continue
    if not (source.name.endswith('-returning.png') or (source.name.startswith('after-') and source.name.endswith('-text200.png'))): continue
    shutil.copyfile(source, review / 'images' / source.name); shots.append({'file': 'images/' + source.name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()})
assert len(shots) == 48
(review / 'source.json').write_text(json.dumps({'appVersionBasis': '0.18.0', 'coreBuild': core, 'workingCandidate': True, 'actualLocalChromiumScreenshots': True, 'widths': [320, 375, 390, 430], 'physicalDeviceTest': False, 'hostedBrowserQa': False, 'newIllustrations': False, 'files': shots}, indent=2) + '\n')
for args in [['node', 'scripts/offline.mjs'], ['node', 'scripts/check-preview.mjs']]:
    result = subprocess.run(args, cwd=stage, env=common['SAFE_ENV'], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr[-1600:]
checked = json.loads((stage / 'preview-validation.json').read_text())
assert checked['version'] == '0.18.0' and checked['source_build'] == core and checked['all_runtime_hashes_match']
for source in (old / 'dist/review').rglob('*'):
    if source.is_file(): assert (dist / 'review' / source.relative_to(old / 'dist/review')).read_bytes() == source.read_bytes()
assert common['verify_inputs']() == summary['runtimeSourceDigest']
(evidence / 'private-package-check.json').write_text(json.dumps(checked, indent=2) + '\n')
(evidence / 'validation-summary.json').write_text(json.dumps(summary, indent=2) + '\n')
print(json.dumps({'stage': str(stage), 'core': core, 'privateHostBuild': checked['build_id'], 'runtimeFiles': len(baseline), 'oldReviewsPreserved': True, 'newReviewFiles': 54, 'privateOnly': True}))
