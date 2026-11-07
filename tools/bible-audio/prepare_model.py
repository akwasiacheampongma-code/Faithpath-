#!/usr/bin/env python3
"""Fetch the exact Apache-2.0 Coqui model from its official GitHub release.

Respects the supplied proxy and TLS configuration. Refuses changed archives.
"""
import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
settings = json.loads((ROOT / 'settings.json').read_text())
archive = ROOT / settings['model_archive']
archive.parent.mkdir(parents=True, exist_ok=True)
if not archive.exists():
    temporary = archive.with_suffix(archive.suffix+'.part')
    subprocess.run(['curl', '--fail', '--location', '--retry', '2', '--output',
                    str(temporary), settings['model_download_url']], check=True)
    if hashlib.sha256(temporary.read_bytes()).hexdigest() != settings['model_archive_sha256']:
        raise RuntimeError('Downloaded model archive changed; review the source instead of silently accepting it.')
    temporary.replace(archive)
if hashlib.sha256(archive.read_bytes()).hexdigest() != settings['model_archive_sha256']:
    raise RuntimeError('Existing model archive does not match the recorded checksum.')
target = ROOT / 'models/coqui-thorsten-vits'
target.mkdir(exist_ok=True)
with zipfile.ZipFile(archive) as package:
    for entry in package.infolist():
        destination = (target / entry.filename).resolve()
        if not destination.is_relative_to(target.resolve()):
            raise RuntimeError('Unsafe archive path')
    package.extractall(target)
model = ROOT / settings['model_directory'] / settings['model_file']
assert hashlib.sha256(model.read_bytes()).hexdigest() == settings['model_sha256']
print(f'Verified model: {model}')
