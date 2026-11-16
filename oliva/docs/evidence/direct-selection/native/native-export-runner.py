"""Run only after the explicit OLIVA Reader 0.13.1 input freeze.

Exports and statically inspects JavaScript/assets; does not run a native app.
No existing export or evidence report is overwritten.
"""
from pathlib import Path
import argparse
import datetime
import hashlib
import json
import os
import subprocess
import time

ROOT = Path('/workspace/faithpath-next')
EVIDENCE = ROOT / 'docs/evidence/direct-selection/native'
EXTRA = ['app.json', 'package.json', 'package-lock.json',
         'art/a51/native-derivatives.json', 'art/swords/runtime.json',
         'art/swords/romans-runtime.json', 'art/swords/runtime-index.json']


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write(name, value):
    with (EVIDENCE / name).open('x', encoding='utf-8') as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write('\n')


def inputs():
    paths = list(EXTRA)
    for folder in ['app', 'src', 'assets']:
        for base, directories, files in os.walk(ROOT / folder):
            for name in directories + files:
                assert not (Path(base) / name).is_symlink(), 'Symlink in runtime inputs'
            paths.extend((Path(base) / name).relative_to(ROOT).as_posix() for name in files)
    assert len(paths) == len(set(paths))
    digest = hashlib.sha256()
    entries = []
    for name in sorted(paths, key=Path):
        raw = (ROOT / name).read_bytes()
        digest.update(name.encode() + b'\0' + raw + b'\0')
        entries.append({'path': name, 'bytes': len(raw), 'sha256': sha(raw)})
    return {'runtimeSourceDigest': {'algorithm': 'SHA256(Python Path sorted path + NUL + bytes + NUL); all app/src/assets plus app/package/lock and four runtime art manifests',
                                   'fileCount': len(entries), 'sha256': digest.hexdigest()}, 'files': entries}


def checked(command, log):
    started, clock = now(), time.monotonic()
    with (EVIDENCE / log).open('xb') as stream:
        result = subprocess.run(command, cwd=ROOT, stdout=stream, stderr=subprocess.STDOUT)
    record = {'command': command, 'exitCode': result.returncode, 'startedAt': started,
              'finishedAt': now(), 'durationSeconds': round(time.monotonic()-clock, 3),
              'rawLog': (EVIDENCE / log).relative_to(ROOT).as_posix(),
              'rawLogSHA256': sha((EVIDENCE / log).read_bytes())}
    print(json.dumps(record), flush=True)
    return record


def inventory(folder):
    result = []
    for file in sorted(folder.rglob('*')):
        assert not file.is_symlink()
        if file.is_file():
            raw = file.read_bytes()
            result.append({'path': file.relative_to(folder).as_posix(), 'bytes': len(raw), 'sha256': sha(raw)})
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--execute-after-freeze', action='store_true', required=True)
    parser.add_argument('--expected-runtime-digest', required=True)
    args = parser.parse_args()
    before = inputs()
    assert before['runtimeSourceDigest']['sha256'] == args.expected_runtime_digest, 'Input freeze differs'
    package = json.loads((ROOT / 'package.json').read_text())
    lock = json.loads((ROOT / 'package-lock.json').read_text())
    app = json.loads((ROOT / 'app.json').read_text())
    assert package['version'] == lock['version'] == lock['packages']['']['version'] == app['expo']['version'] == '0.13.1'
    for platform in ['android', 'ios']:
        assert not (ROOT / ('dist-' + platform)).exists(), 'Existing native export must be preserved'
    for name in ['runtime-inputs-before.json', 'runtime-inputs.json', 'native-builds.json',
                 'native-android.txt', 'native-ios.txt', 'native-export-check.json', 'nt-native-catalog-check.json']:
        assert not (EVIDENCE / name).exists(), 'Refusing to overwrite evidence: ' + name
    write('runtime-inputs-before.json', before)
    exports = []
    for platform in ['android', 'ios']:
        assert inputs() == before, 'Runtime input changed before ' + platform
        record = checked(['node', 'scripts/expo.mjs', 'export', '--platform', platform,
                          '--output-dir', 'dist-' + platform, '--no-minify', '--no-bytecode'],
                         'native-' + platform + '.txt')
        record['platform'] = platform
        exports.append(record)
        assert record['exitCode'] == 0, 'Native export failed: ' + platform
    assets = checked(['node', 'scripts/check-native-export.mjs', '--report',
                      'docs/evidence/direct-selection/native/native-export-check.json', 'dist-android', 'dist-ios'],
                     'native-export-check.txt')
    catalog = checked(['node', 'docs/evidence/direct-selection/native/check-native-nt-catalog.mjs', '--report',
                       'docs/evidence/direct-selection/native/nt-native-catalog-check.json', 'dist-android', 'dist-ios'],
                      'nt-native-catalog-check.txt')
    after = inputs()
    write('runtime-inputs.json', after)
    unchanged = before == after
    passed = unchanged and assets['exitCode'] == catalog['exitCode'] == 0
    write('native-builds.json', {'version': '0.13.1', 'checkedAt': now(),
          'runtimeSourceDigest': after['runtimeSourceDigest'], 'sourceUnchangedDuringExports': unchanged,
          'exports': exports, 'assetCheck': assets, 'ntCatalogCheck': catalog,
          'outputInventories': {p: inventory(ROOT / ('dist-' + p)) for p in ['android', 'ios']},
          'allPassed': passed,
          'kind': 'Unminified native JavaScript/asset exports and static NT catalog comparison. No native app execution, simulator, device, decoder, screenreader, signed installer, memory or energy testing.'})
    assert passed, 'Native static check or input preservation failed'
    print('Both native JS/asset exports and full static NT catalog comparison passed.', flush=True)


if __name__ == '__main__':
    main()
