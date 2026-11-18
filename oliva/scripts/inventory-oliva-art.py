"""Inventory illustrator assets from actual runtime references and the tested export."""
from collections import defaultdict
from contextlib import nullcontext
from hashlib import sha256
from pathlib import Path
import json
import re
import sys

from PIL import Image

root = Path(__file__).resolve().parents[1]
web = Path(sys.argv[1] if len(sys.argv) > 1 else root / 'dist').resolve()
out = root / 'docs/evidence/illustration-review'
out.mkdir(parents=True, exist_ok=True)

def read(path):
    return json.loads((root / path).read_text())

def digest(path):
    return sha256(path.read_bytes()).hexdigest()

image_extensions = {'.png', '.webp', '.svg', '.jpg', '.jpeg', '.avif', '.gif'}
source_references = defaultdict(list)
for folder in ['app', 'src']:
    for source in sorted((root / folder).rglob('*')):
        if source.suffix not in {'.ts', '.tsx', '.js', '.mjs'}:
            continue
        for line, text in enumerate(source.read_text().splitlines(), 1):
            for match in re.finditer(r'''(?:require\(|from\s+)["']([^"']+)["']''', text):
                path = (source.parent / match[1]).resolve()
                if path.suffix in image_extensions and path.is_file() and path.is_relative_to(root / 'assets'):
                    source_references[path.relative_to(root).as_posix()].append({'source': source.relative_to(root).as_posix(), 'line': line})
for path in sorted((root / 'assets/pwa').iterdir()):
    if path.suffix in image_extensions:
        source_references[path.relative_to(root).as_posix()].append({'source': 'scripts/pwa.mjs'})

previous = read('docs/evidence/quiet-ux-audit/image-inventory.json')
previous_by_path = {row['file']: row for row in previous['images']}
by_hash = defaultdict(list)
for path in sorted(web.rglob('*')):
    if path.is_file() and path.suffix in image_extensions:
        by_hash[digest(path)].append(path.relative_to(web).as_posix())
worker = (web / 'sw.js').read_text()
build = re.search(r'<meta name="oliva-build" content="([^"]+)"', (web / 'index.html').read_text()).group(1)
image_rows = []
for name, refs in sorted(source_references.items()):
    path = root / name
    old = previous_by_path.get(name, {})
    checksum = digest(path)
    same = old.get('sha256') == checksum
    variants = by_hash.get(checksum, [])
    with Image.open(path) if path.suffix != '.svg' else nullcontext() as image:
        dimensions = list(image.size) if image else None
    image_rows.append({
        'file': name, 'bytes': path.stat().st_size, 'sha256': checksum, 'dimensions': dimensions,
        'actualRuntimeReferences': refs, 'currentWebFiles': variants,
        'currentWebPrecached': bool(variants) and all(json.dumps('/' + item) in worker for item in variants),
        'previousNativeExportUse': old.get('nativeOffline') if same else None,
        'previousNativeExportBuildSource': previous['sourceRelease'] if same else None,
        'provenance': old.get('provenance') if same else None,
        'origin': old.get('origin') if same else 'Ungeklärt',
        'content': old.get('content') if same else 'Ungeklärt',
        'documentedRightsStatus': old.get('license') if same else 'Prüfbedürftig',
        'documentedApproval': old.get('approval') if same else None,
        'previousQualityReview': old.get('qualityReview') if same else None,
    })

catalog = read('src/data/story-index.json')
manifest = read('art/manifest.json')
rows_by_file = {row['file']: row for row in image_rows}
assignments = []
for unit in catalog['units']:
    if unit.get('image'):
        assets = [r for r in image_rows if r['file'].startswith('assets/images/' + unit['image'] + '-')]
        assert assets, unit['id']
        assignments.append({key: unit[key] for key in ('id', 'title', 'references', 'image')} | {'assets': [r['file'] for r in assets]})
motifs = []
for item in manifest['assets']:
    variants = [rows_by_file[v['file']] for v in item['variants'] if v['file'] in rows_by_file]
    assert variants, item['id']
    for row in variants:
        assert row['sha256'] == next(v['sha256'] for v in item['variants'] if v['file'] == row['file'])
    motifs.append({
        'id': item['id'], 'scene': item['scene'], 'book': item.get('book'), 'chapter': item.get('chapter'),
        'rightStatus': item['license_status'], 'approval': item['approval'], 'manifest': 'art/manifest.json',
        'runtimeVariants': [r['file'] for r in variants], 'runtimeBytes': sum(r['bytes'] for r in variants),
        'master': item['master'], 'assignments': [a['id'] for a in assignments if a['image'] == item['id']],
    })

runtime_hashes = {row['sha256'] for row in image_rows}
extra = [
    {'sha256': checksum, 'files': files, 'bytes': (web / files[0]).stat().st_size,
     'offline': all(json.dumps('/' + item) in worker for item in files),
     'type': 'Expo-/Navigationstechnik' if all(f.startswith('assets/node_modules/') for f in files) else 'Weitere technische Dateien'}
    for checksum, files in sorted(by_hash.items()) if checksum not in runtime_hashes
]
report = {
    'build': build, 'currentWebExport': str(web), 'sourceCatalog': catalog['sourceCommit'],
    'storyCount': len(catalog['units']), 'storyAssignments': assignments,
    'typographicStoryCount': len(catalog['units']) - len(assignments),
    'motifs': motifs, 'referencedFileCount': len(image_rows), 'referencedSourceBytes': sum(row['bytes'] for row in image_rows),
    'webImageFileCount': sum(len(files) for files in by_hash.values()),
    'webImageBytes': sum((web / file).stat().st_size for files in by_hash.values() for file in files),
    'webIllustrationBytes': sum(row['bytes'] for row in image_rows if row['currentWebFiles'] and row['file'].startswith('assets/images/')),
    'images': image_rows, 'additionalRuntimeImages': extra,
    'unreferencedSourceImages': sorted(p.relative_to(root).as_posix() for p in (root / 'assets').rglob('*') if p.is_file() and p.suffix in image_extensions and p.relative_to(root).as_posix() not in source_references),
    'currentNativeDeviceChecks': False,
    'notes': ['Referenzierte Dateien umfassen Bearbeitungsvarianten, A51-Ebenen und Installationssymbole.',
              'Paketierung und Cacheliste werden am aktuellen Webexport geprüft. Native Angaben stammen aus dem ausdrücklich bezeichneten früheren Export.',
              'Die Rechteangaben beschreiben dokumentierte Nachweise und Freigaben der Quelle. Sie stellen keine neue Lizenz dar.'],
}
(out / 'inventory.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({key: report[key] for key in ['build', 'storyCount', 'typographicStoryCount', 'referencedFileCount', 'referencedSourceBytes', 'webImageFileCount', 'webImageBytes', 'webIllustrationBytes']}))
