"""Read-only inventory of images in the qualified 0.18 source and exports.

This records evidence, never confers rights or changes image bytes.
"""
from pathlib import Path
from collections import defaultdict
import hashlib, json, re
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/evidence/quiet-ux-audit'
EXPORTS = {
    'web': Path('/workspace/oliva-v018-single-spirit-sword-control-dist'),
    'android': Path('/workspace/oliva-v018-preserved-dist-android'),
    'ios': Path('/workspace/oliva-v018-preserved-dist-ios'),
}
EXTENSIONS = {'.png', '.webp', '.jpg', '.jpeg', '.svg', '.gif', '.avif'}
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return json.loads((ROOT / p).read_text())

usage = defaultdict(list)
for folder in ['app', 'src']:
    for source in sorted((ROOT / folder).rglob('*')):
        if source.suffix not in {'.ts', '.tsx', '.js', '.mjs'}: continue
        for number, line in enumerate(source.read_text().splitlines(), 1):
            for match in re.finditer(r'(?:require\(|from\s+)["\']([^"\']+)["\']', line):
                target = (source.parent / match[1]).resolve()
                if target.is_file() and target.suffix in EXTENSIONS:
                    usage[str(target.relative_to(ROOT))].append({'file': str(source.relative_to(ROOT)), 'line': number})
for p in (ROOT / 'assets/pwa').rglob('*'):
    if p.suffix in EXTENSIONS: usage[str(p.relative_to(ROOT))].append({'file': 'scripts/pwa.mjs', 'line': 2})

metadata = {}
for entry in read('art/manifest.json')['assets']:
    for variant in entry['variants']:
        metadata[variant['file']] = {
            'content': entry['scene'], 'book': entry.get('book'), 'chapter': entry.get('chapter'),
            'origin': entry['generator'], 'provenance': 'art/manifest.json',
            'master': entry['master'], 'license': entry['license_status'], 'approval': entry['approval'],
            'expectedSHA256': variant['sha256'],
            'qualityReview': 'Künstlerische Interpretation; unabhängige historische/theologische Freigabe steht aus. Kontext und Bildausschnitt getrennt prüfen.',
        }
tree = read('art/a51/reference/manifest.json')
tree_rights = read('art/a51/provenance.json')
for stage in tree['stages']:
    base = {
        'content': 'A51 Stadium ' + str(stage['index'] + 1) + ': ' + stage['name'],
        'origin': 'FaithPath A51; ' + tree_rights['source_branch'] + ' @ ' + tree_rights['snapshot_commit'],
        'provenance': 'art/a51/provenance.json; art/a51/reference/manifest.json',
        'license': tree_rights['third_party_asset_license'],
        'approval': {'integration': tree_rights['authorization'], 'publicRelease': 'nicht geklärt'},
        'qualityReview': 'Originalstadium erhalten; Web-Winddarstellung und native Compositor-Layer sind getrennte Renderer. Echte Geräte-/Energieprüfung offen.',
    }
    for variant in stage['variants']:
        name = 'assets/a51/' + Path(variant['src']).name
        metadata[name] = {**base, 'expectedSHA256': variant['sha256']}
    for group in read('art/a51/native-derivatives.json')['groups']:
        if group['stage'] != stage['index']: continue
        for variant in [group['full'], *group['layers']]:
            metadata[variant['file']] = {**base, 'expectedSHA256': variant['sha256'],
                'qualityReview': base['qualityReview'] + ' Einzelne Layer sind absichtlich keine vollständigen Bäume.'}
sword = read('art/spiritual-sword/runtime.json')
metadata[sword['activeAsset']['path']] = {
    'content': 'Ein statisches geistliches Schwert; Epheser 6,17, Kontext 6,10–18',
    'origin': 'Vorhandener OLIVA-Genesis-Pilot; unveränderte 512-PNG-Variante',
    'provenance': 'art/spiritual-sword/runtime.json; ' + sword['sourceGenerationMetadata'],
    'master': sword['master'], 'license': sword['license'], 'approval': sword['status'],
    'expectedSHA256': sword['activeAsset']['sha256'],
    'qualityReview': 'Vollständige, friedliche Abbildung beibehalten. Mobile Platzierung vor der Liste ist ein UX-Problem, keine neue Bildproduktion nötig.',
}
exports = defaultdict(lambda: defaultdict(list))
for platform, folder in EXPORTS.items():
    assert folder.is_dir(), str(folder)
    for p in sorted(folder.rglob('*')):
        if p.is_file() and p.suffix in EXTENSIONS:
            exports[sha(p)][platform].append(str(p.relative_to(folder)))
worker = (EXPORTS['web'] / 'sw.js').read_text()
rows = []
for name, places in sorted(usage.items()):
    p = ROOT / name; digest = sha(p); information = metadata.get(name)
    if information is None and name.startswith('assets/pwa/'):
        information = {'content': 'OLIVA-Appsymbol', 'origin': 'Lokales PWA-Symbol; Originaldatei im Repository',
            'provenance': name + '; scripts/pwa.mjs', 'license': 'Eigenständige Herkunft/öffentliche Markenfreigabe zusätzlich prüfen',
            'approval': {'publicRelease': 'nicht bestätigt'}, 'qualityReview': 'Installationssymbol; keine Erzählillustration.'}
    if information is None:
        information = {'content': 'nicht zugeordnet', 'origin': 'nicht nachgewiesen', 'provenance': None,
            'license': 'prüfbedürftig', 'approval': {'publicRelease': 'nicht bestätigt'}, 'qualityReview': 'Manuelle Herkunfts- und Qualitätsprüfung erforderlich.'}
    assert 'expectedSHA256' not in information or digest == information['expectedSHA256'], name
    dimensions = None
    if p.suffix != '.svg':
        with Image.open(p) as im: dimensions = [im.width, im.height]
    platforms = dict(exports[digest])
    web_urls = ['/' + x for x in platforms.get('web', [])]
    rows.append({'file': name, 'bytes': p.stat().st_size, 'sha256': digest, 'dimensions': dimensions,
        'uses': places, 'packagedIn': platforms,
        'webPrecached': bool(web_urls) and all(json.dumps(url) in worker for url in web_urls),
        'nativeOffline': {'android': bool(platforms.get('android')), 'ios': bool(platforms.get('ios'))},
        **information})
known = {x['sha256'] for x in rows}
third_party = []
for digest, platforms in exports.items():
    if digest not in known:
        platform, names = next(iter(platforms.items()))
        actual = EXPORTS[platform] / names[0]
        dimensions = None
        if actual.suffix != '.svg':
            with Image.open(actual) as im: dimensions = [im.width, im.height]
        package_name = 'expo-router' if '/expo-router/' in names[0] else None
        package = read('node_modules/' + package_name + '/package.json') if package_name else {}
        license_path = ROOT / 'node_modules' / package_name / 'LICENSE' if package_name else None
        third_party.append({'sha256': digest, 'packagedIn': dict(platforms),
            'bytes': actual.stat().st_size, 'dimensions': dimensions,
            'content': 'Technisches Router-/Navigationssymbol; keine Bibelillustration',
            'origin': 'Exportierter Paketpfad: ' + (package_name or 'nicht zugeordnet'),
            'packageVersion': package.get('version'), 'packageDeclaredLicense': package.get('license'),
            'provenance': str(license_path.relative_to(ROOT)) if license_path and license_path.exists() else None,
            'license': 'Paketmetadaten/Originallizenz erfasst; notwendige Distributionshinweise abschließend prüfen',
            'qualityReview': 'Mitgeliefertes technisches Symbol; keine individuelle erzählerische Gestaltung erforderlich.',
            'webPrecached': all(json.dumps('/' + x) in worker for x in platforms.get('web', [])) if platforms.get('web') else None})
unused = [str(p.relative_to(ROOT)) for p in (ROOT / 'assets').rglob('*') if p.suffix in EXTENSIONS and str(p.relative_to(ROOT)) not in usage]
report = {'scope': 'Tatsächliche statische require-Referenzen in app/src, PWA-Symbole und alle Bildbytes der qualifizierten 0.18 Web-/Android-/iOS-Exporte; nicht nur aktuell sichtbare Motive.',
    'sourceRelease': 'bc2c199921ba0a20e4d9436248db8f46d256e3ff', 'newImagesGenerated': False,
    'count': len(rows), 'totalSourceBytes': sum(x['bytes'] for x in rows), 'images': rows,
    'exportOnlyImages': third_party, 'unreferencedSourceImages': sorted(unused),
    'inlineVectors': ['src/components/Icon.tsx: generische UI-Vektoren', 'src/components/Choice.web.tsx: keine erzählerischen Bilder'],
    'limitations': ['Statische Paketierung belegt keine Geräteanzeige.', 'Dateihashes und vorhandene Metadaten belegen keine öffentliche Nutzungsfreigabe.', 'Vektor-Icons/Canvas-Kompositionen werden getrennt von Rasterdateien behandelt.']}
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'image-inventory.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
table = ['# Tatsächlich verwendete Bilder · OLIVA 0.18', '', report['scope'], '',
    '| Datei | Byte | Einsatzstellen | Offline Web / Android / iOS | Herkunft und offene Rechte |',
    '|---|---:|---|---|---|']
for x in rows:
    table.append('| ' + ' | '.join([x['file'], str(x['bytes']), ', '.join(p['file'] + ':' + str(p['line']) for p in x['uses']),
        ' / '.join(str(v) for v in [x['webPrecached'], x['nativeOffline']['android'], x['nativeOffline']['ios']]),
        x['origin'] + '; ' + x['license']]) + ' |')
table += ['', 'Vollständige Hashes, Maße, inhaltliche Zuordnung, Freigabestatus, exportierte Paketbilder und unreferenzierte Dateien: `image-inventory.json`.',
    'Kein Bild und kein historischer Herkunftsnachweis wurde verändert. Rechtefreigaben werden nicht aus dem technischen Export abgeleitet.']
(OUT / 'image-inventory.md').write_text('\n'.join(table) + '\n')
print(json.dumps({'images': len(rows), 'sourceBytes': report['totalSourceBytes'], 'exportOnly': len(third_party), 'unreferenced': len(unused), 'missingMetadata': [x['file'] for x in rows if x['provenance'] is None]}))
