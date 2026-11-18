from pathlib import Path
import hashlib, json, os

ROOT = Path('/workspace/faithpath-next')
EVIDENCE = ROOT / 'docs/evidence/bible-paths-focus'
VERSION = '0.18.0'
CORE = 'oliva-d5c8bc2a00df2334'
PRIVATE_PROJECT = 'appgprj_6aedf77e5ce0819180c10eb799447018'
SAFE_ENV = {k: v for k, v in os.environ.items() if not (k.startswith('GIT_TRACE') or k in ['GIT_CURL_VERBOSE', 'GH_DEBUG'])}

def read(name):
    return json.loads((EVIDENCE / name).read_text())

def verify_inputs():
    manifest = read('runtime-inputs.json')
    digest = hashlib.sha256()
    for row in manifest['files']:
        raw = (ROOT / row['path']).read_bytes()
        assert len(raw) == row['bytes'] and hashlib.sha256(raw).hexdigest() == row['sha256']
        digest.update(row['path'].encode()); digest.update(b'\0'); digest.update(raw); digest.update(b'\0')
    assert digest.hexdigest() == manifest['sha256'] and len(manifest['files']) == 347
    return {k: v for k, v in manifest.items() if k != 'files'}

def guard():
    runtime = verify_inputs()
    unit = read('unit-summary.json')
    assert unit['passed'] == unit['total'] == 343 and unit['actualExitCode'] == 0
    browser = read('e2e-results.json')['stats']
    assert browser['expected'] == 33 and browser['unexpected'] == browser['flaky'] == browser['skipped'] == 0
    quality = read('quality-steps.json')
    assert quality['allContentAndRuntimeChecksPassed'] and all(s['exitCode'] == 0 for s in quality['steps'])
    assert 'error TS' not in (EVIDENCE / 'typecheck.log').read_text()
    assessment = read('comparison-assessment.json')
    for name in ['all32CatalogAndProgressComparisonsExact', 'all32MainRecordsExact', 'all16LargeTextCasesWithoutHorizontalOverflow', 'allOtherRuntimeSourcesExact']:
        assert assessment[name]
    different = [s for s in assessment['protectedScreens'] if not s['bytesExact']]
    assert len(different) <= 1
    for scene in different:
        assert scene['area'] == 'garten' and scene['theme'] == 'dark' and scene['differingPixels'] == 22
    assert not assessment['rawCaptureFailure']
    upgrade = read('upgrade/offline-upgrade.json')
    assert upgrade['passed'] and upgrade['allFourRawV11RecordsExactThroughout'] and upgrade['sourceUnchangedDuringUpgrade']
    assert upgrade['targetBuild'] == CORE and upgrade['baselineBuild'] == 'oliva-827cac01214b7955'
    for name, key in [('package.json', 'version'), ('app.json', 'expo')]:
        value = json.loads((ROOT / name).read_text())[key]
        assert (value['version'] if key == 'expo' else value) == VERSION
    control = ROOT / 'dist' if (ROOT / 'dist').exists() else Path('/workspace/oliva-bible-paths-focus-control-dist')
    assert CORE in (control / 'index.html').read_text()
    for row in read('export-inputs.json')['files']:
        raw = (control / row['path']).read_bytes()
        assert len(raw) == row['bytes'] and hashlib.sha256(raw).hexdigest() == row['sha256']
    return {'versionBasis': VERSION, 'formalNewRelease': False, 'coreBuild': CORE, 'runtimeSourceDigest': runtime,
            'unitPassed': 343, 'browserPassed': 33, 'browserSingleFullRun': True, 'typecheckPassed': True,
            'contentChecksPassed': True, 'screensBefore': 32, 'screensAfter': 32, 'largeTextCases': 16,
            'allOtherRuntimeSourcesExact': True, 'protectedScreensByteExact': 6 - len(different), 'protectedScreensTotal': 6,
            'gardenCanvasEdgeDifferentPixels': sum(s['differingPixels'] for s in different), 'pwaUpdateAllFourRawRecordsExact': True,
            'appDataVersion': 11, 'securityAuditPassed': False, 'knownAdvisory': 'GHSA-fc5q-39xc-vjpf',
            'physicalDeviceTest': False, 'simulatorTest': False, 'hostedBrowserQa': False,
            'newDependencies': False, 'newContent': False, 'scopedLocalAcceptancePassed': True, 'allCoreChecksPassed': False}

if __name__ == '__main__':
    print(json.dumps(guard(), indent=2))
