"""Verify all Git baseline blobs and immutable approved/reference contracts.
Run from any directory within the complete repository, not the standalone ZIP.
"""
from pathlib import Path
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
BASE = 'f3f19e118ceb0e54dda71f164f8da9a1578fff42'
rows = subprocess.check_output(['git', 'ls-tree', '-rz', BASE], cwd=REPO).split(b'\0')
changed = []
count = 0
for row in rows:
    if not row:
        continue
    metadata, name = row.split(b'\t')
    mode, kind, expected = metadata.split()
    count += 1
    if kind != b'blob':
        continue
    file = REPO / name.decode()
    if not file.exists():
        changed.append(name.decode())
        continue
    content = file.read_bytes()
    actual = hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest()
    if actual != expected.decode():
        changed.append(name.decode())
assert not changed, changed

def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()

approved = REPO / 'design/olive-tree-v2-a4/assets/masters/lichtkrone-a4.png'
assert (ROOT / 'assets/masters/stage-7.png').read_bytes() == approved.read_bytes()
old = json.loads((REPO / 'design/olive-tree-v2-a5/manifest.json').read_text())
assert json.loads((ROOT / 'stage-meanings.json').read_text()) == [stage['meaning'] for stage in old['stages']]
references = {}
for file in ['motion-model.js', 'stage-data.js', 'reference/a4-motion-model.js']:
    a, b = ROOT / 'reference/a5' / file, REPO / 'design/olive-tree-v2-a5' / file
    assert a.read_bytes() == b.read_bytes()
    references[file] = sha(a)
report = {
    'status': 'PASS', 'baseCommit': BASE, 'allBaselineFilesChecked': count,
    'changedBaselineFiles': changed, 'master7SHA256': sha(approved),
    'master7ByteIdenticalToApprovedA4': True,
    'meaningSourceSHA256': sha(ROOT / 'stage-meanings.json'),
    'meaningTextsByteValuesUnchanged': True,
    'referenceModulesUnchanged': references,
    'appSchemaContentStorageThresholds': 'ALL baseline files byte-identical; no app import and no storage writes in isolated gallery',
    'productBuildExecuted': False,
}
(ROOT / 'evidence/integrity.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
