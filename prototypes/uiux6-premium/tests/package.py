"""Deterministic offline gallery package; never deploys or writes app files.

Run from any directory: python3 path/to/tests/package.py /absolute/output-directory
The original reference is copied byte-for-byte. ZIP timestamps/permissions/order
are fixed. BUILD.json identifies the code commit, not its own later QA commit.
"""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import zipfile

root = Path(__file__).resolve().parents[1]
reference = root.parent / 'uiux6'
output = Path(sys.argv[1]).resolve()
output.mkdir(parents=True, exist_ok=True)
sha = lambda data: hashlib.sha256(data).hexdigest()
runtime = sorted(p for p in root.rglob('*') if p.is_file()
                 and (len(p.relative_to(root).parts) == 1 and p.suffix in ('.js', '.css', '.html')
                      or p.relative_to(root).parts[0] == 'assets'))
files = {str(p.relative_to(root)): sha(p.read_bytes()) for p in runtime}
runtime_hash = sha(''.join(f'{p}\0{h}\n' for p, h in files.items()).encode())
build_path = root / 'BUILD.json'
build = json.loads(build_path.read_text())
build.update(runtimeHash=runtime_hash, contentHash=files['content.js'],
             hashAlgorithm='SHA256 of sorted UTF-8 path + NUL + file SHA256 + LF',
             runtimeFiles=files)
build_path.write_text(json.dumps(build, indent=2) + '\n')

prefix = 'FaithPath_UIUX6A2/'
items = {}
for folder in (root, reference):
    for p in sorted(folder.rglob('*')):
        if p.is_file() and '__pycache__' not in p.parts:
            items[prefix + folder.name + '/' + str(p.relative_to(folder))] = p.read_bytes()
items[prefix + 'index.html'] = b'''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FaithPath Designstudie</title><link rel="stylesheet" href="uiux6-premium/report.css"><main><p>FaithPath / Phase 6A.2</p><h1>Verbunden.</h1><p>Vollstaendig entpacken. Dann die interaktive Galerie oeffnen.</p><p><a href="uiux6-premium/index.html">Premium-Galerie starten</a></p><p><a href="uiux6-premium/comparison.html">Echter Vorher-Nachher-Vergleich</a></p><p><a href="uiux6-premium/report.html">Bericht und QA</a></p><p><a href="uiux6/index.html">Unveraenderte alte 6A-Galerie</a></p><p>Nur synthetische Sitzungsdaten. Neuladen setzt die Demo zurueck. Keine PWA und keine Produktionsversion.</p><p>Falls lokale HTML-Dateien blockiert sind: in diesem Ordner <code>python3 -m http.server 8080</code> starten und <code>http://localhost:8080</code> oeffnen. Unter Windows alternativ <code>py -m http.server 8080</code>.</p></main></html>'''
items[prefix + 'START_HIER.txt'] = ('FaithPath UIUX6A.2\n\nZIP vollstaendig entpacken, index.html oeffnen.\n'
    'Keine Produktionsversion. Keine echten privaten Daten eingeben.\n'
    'Falls file:// blockiert wird: python3 -m http.server 8080\n'
    'Windows: py -m http.server 8080\nhttp://localhost:8080\n'
    'QA/Code und offene Geraetegates: uiux6-premium/report.html\n').encode()
items[prefix + 'SHA256SUMS'] = ''.join(f'{sha(data)}  {p.removeprefix(prefix)}\n'
                                      for p, data in sorted(items.items())).encode()

def write_zip(target, entries):
    with zipfile.ZipFile(target, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for path, data in sorted(entries.items()):
            info = zipfile.ZipInfo(path, (2026, 10, 17, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            z.writestr(info, data)

target = output / 'FaithPath_UIUX6A2_Verbunden.zip'
repeat = output / '.FaithPath_UIUX6A2_repeat.zip'
write_zip(target, items)
write_zip(repeat, items)
assert target.read_bytes() == repeat.read_bytes(), 'ZIP bytes not reproducible'
repeat.unlink()
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    assert len(z.namelist()) == len(items)
    for path, expected in items.items():
        assert z.read(path) == expected, path
qa_items = {p: data for p, data in items.items() if '/uiux6-premium/' in p
            and any('/' + x + '/' in p for x in ('qa', 'docs', 'screenshots', 'tests'))}
qa_target = output / 'FaithPath_UIUX6A2_QA.zip'
write_zip(qa_target, qa_items)
receipt = {'study': build['study'], 'baseCommit': build['baseCommit'],
           'codeCommit': build['codeCommit'],
           'deliveryCommit': subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD'], text=True).strip(),
           'runtimeHash': runtime_hash, 'contentHash': files['content.js'],
           'zipSha256': sha(target.read_bytes()), 'zipBytes': target.stat().st_size,
           'qaZipSha256': sha(qa_target.read_bytes()), 'packageFiles': len(items),
           'deterministicZipSecondRunIdentical': True, 'allExtractedBytesVerified': True,
           'deployment': None, 'phase6B': 'NOT_AUTHORIZED'}
(output / 'FaithPath_UIUX6A2_LIEFERNACHWEIS.json').write_text(json.dumps(receipt, indent=2) + '\n')
(output / 'SHA256SUMS.txt').write_text(f"{receipt['zipSha256']}  {target.name}\n{receipt['qaZipSha256']}  {qa_target.name}\n")
print(json.dumps(receipt, indent=2))
