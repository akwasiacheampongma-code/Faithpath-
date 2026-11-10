"""Frozen OLIVA 0.12 native export runner. No work occurs without an explicit flag.

Preserves actual 0.11 outputs by rename, checks every pre/post preservation
file hash, then exports Android and iOS sequentially without minification or
bytecode. Runtime inputs use exactly the existing 0.11 digest algorithm.
"""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import time

ROOT = Path('/workspace/faithpath-next')
EVIDENCE = ROOT / 'docs/evidence/nt-catalog/native'
BACKUP = Path('/workspace/oliva-native-v011-before-v012')
PRIOR_REPORT = ROOT / 'docs/evidence/reader-flow/native/native-export-check.json'
NT_CHECKER = Path('/tmp/check-native-nt-catalog-v012.mjs')
ALGORITHM = 'SHA256(sorted path + NUL + bytes + NUL); app/src/assets plus app/package/lock and A51/sword runtime manifests, including the Romans manifest and index'
EXTRA = ['app.json', 'package.json', 'package-lock.json', 'art/a51/native-derivatives.json', 'art/swords/runtime.json', 'art/swords/romans-runtime.json', 'art/swords/runtime-index.json']


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write_json(name, value):
    with (EVIDENCE / name).open('x', encoding='utf-8') as stream:
        json.dump(value, stream, indent=2, ensure_ascii=False)
        stream.write('\n')


def inputs():
    paths = list(EXTRA)
    for folder in ['app', 'src', 'assets']:
        for base, directories, files in os.walk(ROOT / folder):
            for name in directories + files:
                assert not (Path(base) / name).is_symlink(), f'Symlink in runtime inputs: {base}/{name}'
            paths.extend((Path(base) / name).relative_to(ROOT).as_posix() for name in files)
    assert len(set(paths)) == len(paths)
    digest = hashlib.sha256()
    entries = []
    for name in sorted(paths):
        data = (ROOT / name).read_bytes()
        digest.update(name.encode('utf-8') + b'\0' + data + b'\0')
        entries.append({'path': name, 'bytes': len(data), 'sha256': sha(data)})
    return {'runtimeSourceDigest': {'algorithm': ALGORITHM, 'fileCount': len(entries), 'sha256': digest.hexdigest()}, 'files': entries}


def inventory(folder):
    assert folder.is_dir() and not folder.is_symlink(), f'Not a real directory: {folder}'
    entries = []
    for base, directories, files in os.walk(folder):
        for name in directories + files:
            assert not (Path(base) / name).is_symlink(), f'Symlink in native output: {base}/{name}'
        for name in files:
            file = Path(base) / name
            data = file.read_bytes()
            entries.append({'path': file.relative_to(folder).as_posix(), 'bytes': len(data), 'sha256': sha(data)})
    return sorted(entries, key=lambda item: item['path'])


def prior_outputs():
    frozen = json.loads(PRIOR_REPORT.read_text())
    assert frozen['ok'] and frozen['completeNativePair'] and frozen['appVersion'] == '0.11.0'
    preserved, snapshots = [], {}
    for platform in ['android', 'ios']:
        expected = next(item for item in frozen['exports'] if item['platform'] == platform)
        folder = ROOT / ('dist-' + platform)
        snapshot = inventory(folder)
        by_path = {item['path']: item for item in snapshot}
        metadata = (folder / 'metadata.json').read_bytes()
        bundle = json.loads(metadata)['fileMetadata'][platform]['bundle']
        assert sha(metadata) == expected['metadataSha256'], f'Prior {platform} metadata mismatch'
        assert bundle == expected['bundle'], f'Prior {platform} bundle path mismatch'
        assert by_path[bundle]['sha256'] == expected['bundleSha256'], f'Prior {platform} bundle mismatch'
        assert by_path[bundle]['bytes'] == expected['bundleBytes']
        assert len(snapshot) == expected['exportFileCount'], f'Prior {platform} file count mismatch'
        assert sum(item['bytes'] for item in snapshot) == expected['exportBytes'], f'Prior {platform} output bytes mismatch'
        verified_assets = 0
        for sources in expected['required'].values():
            for source in sources:
                for name in source['exportedPaths']:
                    assert by_path[name]['sha256'] == source['sha256'], f'Prior required asset mismatch: {platform}/{name}'
                    assert by_path[name]['bytes'] == source['bytes']
                    verified_assets += 1
        snapshots[platform] = snapshot
        preserved.append({'platform': platform, 'metadataSha256': sha(metadata), 'bundle': bundle,
                          'bundleSha256': by_path[bundle]['sha256'], 'matchesFrozen011Report': True,
                          'requiredAssetHashesVerifiedAgainstFrozenReport': verified_assets,
                          'fileCount': len(snapshot), 'bytes': sum(item['bytes'] for item in snapshot),
                          'files': snapshot})
    return preserved, snapshots


def checked_command(command, log_name):
    started, start_clock = now(), time.monotonic()
    log = EVIDENCE / log_name
    with log.open('xb') as stream:
        result = subprocess.run(command, cwd=ROOT, stdout=stream, stderr=subprocess.STDOUT, check=False)
    record = {'command': command, 'exitCode': result.returncode, 'startedAt': started, 'finishedAt': now(),
              'durationSeconds': round(time.monotonic() - start_clock, 3), 'rawLog': log.relative_to(ROOT).as_posix(),
              'rawLogSHA256': sha(log.read_bytes())}
    print(json.dumps(record), flush=True)
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--inspect', action='store_true', help='Read-only digest and prior-output verification; no writes or exports')
    parser.add_argument('--execute-after-freeze', action='store_true')
    parser.add_argument('--expected-runtime-digest')
    args = parser.parse_args()
    assert args.inspect != args.execute_after_freeze, 'Choose read-only --inspect or explicit --execute-after-freeze'
    before = inputs()
    preserved, snapshots = prior_outputs()
    if args.inspect:
        print(json.dumps({'runtimeSourceDigest': before['runtimeSourceDigest'], 'prior011Verified': True,
                          'exports': [{k: v for k, v in item.items() if k != 'files'} for item in preserved]}))
        return
    assert args.expected_runtime_digest and re.fullmatch('[a-f0-9]{64}', args.expected_runtime_digest), 'Freeze digest required'
    assert before['runtimeSourceDigest']['sha256'] == args.expected_runtime_digest, 'Runtime differs from the supplied freeze digest'
    version = json.loads((ROOT / 'app.json').read_text())['expo']['version']
    package = json.loads((ROOT / 'package.json').read_text())
    lock = json.loads((ROOT / 'package-lock.json').read_text())
    assert version == package['version'] == lock['version'] == lock['packages']['']['version'] == '0.12.0'
    assert NT_CHECKER.is_file(), 'Static NT literal checker is required before exports'
    assert not EVIDENCE.exists(), f'Evidence already exists; refusing overwrite: {EVIDENCE}'
    assert not BACKUP.exists(), f'Backup already exists; refusing overwrite: {BACKUP}'
    EVIDENCE.mkdir(parents=True, exist_ok=False)
    write_json('runtime-inputs-before.json', before)
    write_json('verification-tools.json', {'checkedAt': now(), 'files': [
        {'path': str(file), 'sha256': sha(file.read_bytes())} for file in [Path(__file__), NT_CHECKER, ROOT / 'scripts/check-native-export.mjs', PRIOR_REPORT]]})
    BACKUP.mkdir()
    for platform in ['android', 'ios']:
        destination = BACKUP / ('dist-' + platform)
        assert not destination.exists()
        (ROOT / ('dist-' + platform)).rename(destination)
        assert inventory(destination) == snapshots[platform], f'Backup inventory changed: {platform}'
    write_json('prior-output-preservation.json', {'checkedAt': now(), 'frozenReport': PRIOR_REPORT.relative_to(ROOT).as_posix(),
        'priorNativeOutputsPreservedAt': str(BACKUP), 'overwroteExistingFiles': False,
        'completeFileInventoriesMatch': True,
        'frozenReportScope': 'Matches original metadata, bundle, all declared required asset SHA-256 values, total file counts and bytes. Every actual file is hashed before/after rename; the historical report does not declare hashes for every framework asset.',
        'exports': preserved})
    print('Verified and preserved prior 0.11 outputs; runtime digest ' + before['runtimeSourceDigest']['sha256'], flush=True)
    exports = []
    for platform in ['android', 'ios']:
        assert inputs() == before, 'Runtime inputs changed before ' + platform + ' export'
        record = checked_command(['node', 'scripts/expo.mjs', 'export', '--platform', platform, '--output-dir', 'dist-' + platform,
                                  '--no-minify', '--no-bytecode'], 'native-' + platform + '.txt')
        record['platform'] = platform
        exports.append(record)
        if record['exitCode']:
            break
    check = checked_command(['node', 'scripts/check-native-export.mjs', '--report', 'docs/evidence/nt-catalog/native/native-export-check.json'], 'native-export-check.txt')
    catalog_check = checked_command(['node', str(NT_CHECKER), '--report', 'docs/evidence/nt-catalog/native/nt-native-catalog-check.json',
                                     'dist-android', 'dist-ios'], 'nt-native-catalog-check.txt')
    after = inputs()
    write_json('runtime-inputs.json', after)
    unchanged = before == after
    all_passed = len(exports) == 2 and all(item['exitCode'] == 0 for item in exports) and check['exitCode'] == 0 and catalog_check['exitCode'] == 0 and unchanged
    output_inventories = {platform: inventory(ROOT / ('dist-' + platform)) for platform in ['android', 'ios'] if (ROOT / ('dist-' + platform)).is_dir()}
    write_json('native-builds.json', {'version': version, 'checkedAt': now(), 'runtimeSourceDigest': after['runtimeSourceDigest'],
        'initialRuntimeSourceDigest': before['runtimeSourceDigest'], 'sourceUnchangedDuringExports': unchanged,
        'priorNativeOutputsPreservedAt': str(BACKUP), 'preserved011': [{k: v for k, v in item.items() if k != 'files'} for item in preserved],
        'exports': exports, 'assetCheck': check, 'ntCatalogCheck': catalog_check, 'outputInventories': output_inventories,
        'allPassed': all_passed,
        'kind': 'Unminified native JavaScript/asset debug exports and static full NT catalog literal comparison; no Hermes bytecode execution, APK/AAB/IPA, signing, simulator, device, native image decoder, performance, memory or energy test.'})
    assert unchanged, 'Runtime inputs changed during native exports'
    assert all_passed, 'At least one native export or static validation failed'
    print('Native 0.12 exports, full NT catalog literal equality and portable static checks passed; runtime inputs unchanged.', flush=True)


if __name__ == '__main__':
    main()
