"""Validated single-chapter sources, atomic files, verified resumable segments.

No app store, journal, backups, user IDs or migrations are read or written.
POSIX flock is intentional: generation is an offline Linux/macOS tool.
"""
import contextlib
import fcntl
import hashlib
import json
import os
import re
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf


def sha256(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as file:
        for block in iter(lambda:file.read(1024*1024), b''):
            h.update(block)
    return h.hexdigest()


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def atomic_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(prefix=path.name+'.', suffix='.tmp', dir=path.parent)
    try:
        with os.fdopen(fd, 'w') as file:
            json.dump(value, file, ensure_ascii=False, indent=2)
            file.write('\n'); file.flush(); os.fsync(file.fileno())
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


@contextlib.contextmanager
def job_lock(path):
    path = Path(path); path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('a') as file:
        fcntl.flock(file, fcntl.LOCK_EX | fcntl.LOCK_NB)
        try:
            yield
        finally:
            fcntl.flock(file, fcntl.LOCK_UN)


def chapter_source(bible_dir: Path, book: str, chapter: int):
    if not re.fullmatch(r'[1-3]?[A-Z]{2,3}', book) or type(chapter) is not int or chapter < 1:
        raise ValueError('Invalid book/chapter identifier')
    path = Path(bible_dir)/'l1912'/f'{book}.json'
    data = json.loads(path.read_text())
    if data.get('code') != book or chapter > len(data.get('chapters', [])):
        raise ValueError('Book/chapter does not match source')
    verses = data['chapters'][chapter-1]
    # Some historical chapters in the canon have different verse counts. Never
    # impose a universal expected count, but reject gaps/duplicates within a chapter.
    if not verses or any(not isinstance(v, list) or len(v) != 2 or type(v[0]) is not int or v[0] != i+1 or not isinstance(v[1], str) or not v[1].strip() for i,v in enumerate(verses)):
        raise ValueError('Malformed/non-contiguous verse source; editorial review required')
    return {'book':book, 'name':data['name'], 'chapter':chapter, 'translation':'l1912',
            'verses':verses, 'book_sha256':sha256(path), 'text_sha256':digest(verses),
            'chapter_count':len(data['chapters'])}


def verified_report(folder: Path, identity: str, expected_files: list[str]):
    """An interrupted/corrupted report is a cache miss, never a completed job."""
    try:
        value = json.loads((folder/'generation-report.json').read_text())
        if not isinstance(value, dict) or value.get('identity_sha256') != identity:
            return None
        outputs = value['outputs']
        if not isinstance(outputs, dict) or set(outputs) != set(expected_files):
            return None
        for name, info in outputs.items():
            if Path(name).name != name or sha256(folder/name) != info['sha256']:
                return None
        return value
    except (OSError, ValueError, KeyError, TypeError):
        return None


class SegmentCache:
    def __init__(self, folder: Path):
        self.folder = Path(folder); self.folder.mkdir(parents=True, exist_ok=True)

    def get(self, key):
        wav, meta = self.folder/(key+'.wav'), self.folder/(key+'.json')
        try:
            info = json.loads(meta.read_text())
            if sha256(wav) != info['sha256']:
                return None
            samples, sr = sf.read(wav, dtype='float32')
            if samples.ndim != 1 or not np.isfinite(samples).all() or len(samples) != info['samples'] or sr != info['sample_rate']:
                return None
            return samples, sr, info
        except (OSError, ValueError, KeyError, TypeError, RuntimeError):
            return None

    def save(self, key, samples, sr, metadata):
        samples = np.asarray(samples, dtype=np.float32)
        if samples.ndim != 1 or not len(samples) or not np.isfinite(samples).all():
            raise ValueError('Invalid cache audio')
        target = self.folder/(key+'.wav')
        fd, temp = tempfile.mkstemp(prefix=key, suffix='.tmp', dir=self.folder)
        os.close(fd)
        try:
            sf.write(temp, samples, sr, format='WAV', subtype='FLOAT')
            with open(temp, 'rb') as file:
                os.fsync(file.fileno())
            os.replace(temp, target)
            atomic_json(target.with_suffix('.json'), {**metadata, 'sha256':sha256(target),
                        'samples':len(samples), 'sample_rate':sr})
        finally:
            if os.path.exists(temp):
                os.unlink(temp)
