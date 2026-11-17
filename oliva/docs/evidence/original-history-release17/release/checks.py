from pathlib import Path
import datetime
import hashlib
import json
import os
import re
import subprocess

ROOT = Path('/workspace/faithpath-next')
EVIDENCE = ROOT / 'docs/evidence/original-history-release17'
VERSION = '0.17.0'
BASE = '71a68b25bf280c215a0cea81d0e9258e13e42aa3'
RELEASE_BRANCH = PUBLISH_BRANCH = 'feature/oliva-v017-original-history-20261117'
SOURCE_TAG = 'oliva-v0.17.0-original-history-private'
PRIVATE_PROJECT = 'appgprj_6aedf77e5ce0819180c10eb799447018'
PRIVATE_URL = 'https://oliva-v04-private-preview.purplebean128.chatgpt.site'
GITHUB_PARENT = 'b2952b682b306f5f4db02d7cef63819f73fcb301'
RUNTIME_SHA = '1fe3082dd01129d18dd278adfd366351cbb895226a74ce4c3d0a387a3070cb17'
CORE = 'oliva-727bb651e0a924f0'
SAFE_ENV = {k: v for k, v in os.environ.items()
            if not k.startswith('GIT_TRACE') and k not in ('GIT_CURL_VERBOSE', 'GH_DEBUG')}
SAFE_ENV['GIT_TERMINAL_PROMPT'] = '0'


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, env=SAFE_ENV).decode().strip()


def read(name):
    path = Path(name)
    assert not path.is_absolute() and '..' not in path.parts
    return json.loads((EVIDENCE / path).read_text())


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def verify_inputs():
    data = read('runtime-inputs.json')
    paths = [item['path'] for item in data['files']]
    expected = {p.relative_to(ROOT).as_posix() for folder in ('app', 'src', 'assets')
                for p in (ROOT / folder).rglob('*') if p.is_file()}
    expected |= {'app.json', 'package.json', 'package-lock.json', 'art/a51/native-derivatives.json',
                 'art/swords/runtime.json', 'art/swords/romans-runtime.json', 'art/swords/runtime-index.json'}
    assert len(paths) == len(set(paths)) == 358 and set(paths) == expected
    digest = hashlib.sha256()
    for item in data['files']:
        path = ROOT / item['path']
        assert not path.is_symlink() and path.resolve().is_relative_to(ROOT)
        raw = path.read_bytes()
        assert len(raw) == item['bytes'] and hashlib.sha256(raw).hexdigest() == item['sha256'], item['path']
        digest.update(item['path'].encode() + b'\0' + raw + b'\0')
    assert digest.hexdigest() == data['runtimeSourceDigest']['sha256'] == RUNTIME_SHA
    return data['runtimeSourceDigest']


def guard(require_summary=True):
    assert git('branch', '--show-current') == RELEASE_BRANCH
    subprocess.run(['git', 'merge-base', '--is-ancestor', BASE, 'HEAD'], cwd=ROOT, env=SAFE_ENV, check=True)
    package = json.loads((ROOT / 'package.json').read_text())
    lock = json.loads((ROOT / 'package-lock.json').read_text())
    assert package['version'] == lock['version'] == lock['packages']['']['version'] == \
        json.loads((ROOT / 'app.json').read_text())['expo']['version'] == VERSION
    digest = verify_inputs()
    core = re.search(r'name="oliva-build" content="([^"]+)"', (ROOT / 'dist/index.html').read_text()).group(1)
    assert core == CORE
    packaging = read('packaging-inputs.json')
    assert {item['path'] for item in packaging['files']} == {
        'LICENSE', 'THIRD_PARTY_NOTICES.md', 'scripts/pwa.mjs', 'scripts/offline.mjs',
        'content/faithpath-stories/RIGHTS.md', 'content/faithpath-topics/RIGHTS.md'}
    aggregate = hashlib.sha256()
    for item in packaging['files']:
        raw = (ROOT / item['path']).read_bytes()
        assert len(raw) == item['bytes'] and hashlib.sha256(raw).hexdigest() == item['sha256']
        aggregate.update(item['path'].encode() + b'\0' + raw + b'\0')
    assert aggregate.hexdigest() == packaging['sha256'] == \
        '5d4e0b00a8e15fed651709989ed6af9824b9db1c16aad51368d8222e95e2a7a6'
    for name in ('THIRD_PARTY_NOTICES.txt', 'licenses/THIRD_PARTY_NOTICES.txt'):
        assert (ROOT / 'dist' / name).read_bytes() == (ROOT / 'THIRD_PARTY_NOTICES.md').read_bytes()
    assert (ROOT / 'dist/licenses/MIT.txt').read_bytes() == (ROOT / 'LICENSE').read_bytes()
    worker = (ROOT / 'dist/sw.js').read_text()
    assert worker.startswith('const ID=' + json.dumps(core) + ',URLS=') and ',VERSION=' + json.dumps(VERSION) + ';' in worker

    build = read('build-execution.json')
    assert [item['name'] for item in build] == ['typecheck', 'unit', 'web-build']
    for item in build:
        assert item['exitCode'] == 0 and sha(ROOT / item['log']) == item['sha256']
    for before, after in zip(build, build[1:]):
        assert before['finishedAt'] <= after['startedAt']
    unit = read('unit-results.json')
    assert unit['success'] and unit['numTotalTests'] == unit['numPassedTests'] == 347
    assert unit['numFailedTests'] == unit['numPendingTests'] == 0
    execution = read('browser-execution-final-r1.json')
    assert execution['exitCode'] == 0 and execution['startedAt'] > build[-1]['finishedAt']
    assert execution['filtered'] is False and execution['workers'] == 1 and execution['retries'] == 0
    assert sha(ROOT / execution['log']) == execution['logSha256']
    browser = read('e2e-results-final-r1.json')
    stats = browser['stats']
    assert stats['expected'] == 154 and all(stats[k] == 0 for k in ('unexpected', 'flaky', 'skipped'))
    assert not browser.get('errors') and browser['config']['workers'] == 1
    assert browser['config']['argv'][2] == 'test'
    assert all(arg.startswith('--output=') for arg in browser['config']['argv'][3:])
    assert set(suite['file'] for suite in browser['suites']) == set(p.name for p in (ROOT / 'tests/e2e').glob('*.spec.ts'))
    found = []

    def walk(suite):
        for spec in suite.get('specs', []):
            for case in spec.get('tests', []):
                assert case['status'] == 'expected' and len(case['results']) == 1
                assert case['results'][0]['status'] == 'passed' and case['results'][0].get('retry', 0) == 0
                found.append(spec['title'])
        for child in suite.get('suites', []):
            walk(child)

    for suite in browser['suites']:
        walk(suite)
    assert len(found) == 154
    checks = read('content-checks.json')
    assert len(checks) == 7
    for item in checks:
        assert item['exitCode'] == 0 and sha(ROOT / item['log']) == item['sha256']
    assert read('npm-audit.json')['metadata']['vulnerabilities']['total'] == 0
    original = read('original-reference-integrity.json')
    assert original['materializedFiles'] == 390 and original['allOriginalGitBlobHashesMatch']
    native = read('native/native-builds.json')
    assert native['version'] == VERSION and native['allPassed'] and native['sourceUnchangedDuringExports']
    assert native['runtimeSourceDigest'] == digest
    assert {item['platform'] for item in native['exports']} == {'android', 'ios'}
    assert all(item['exitCode'] == 0 for item in native['exports'])
    assert read('native/native-export-check.json')['ok'] and read('native/nt-native-catalog-check.json')['status'] == 'PASS'
    story = read('native/story-native-catalog-check.json')
    assert story['status'] == 'PASS' and story['counts'] == {
        'units': 436, 'questions': 2479, 'reflectionPrompts': 436, 'aliasPairs': 95, 'books': 66}
    topics = read('native/topic-native-catalog-check.json')
    assert topics['status'] == 'PASS' and topics['topics'] == 18 and topics['references'] == 45
    assert {item['platform'] for item in topics['exports']} == {'android', 'ios'}
    selection = read('native/native-platform-selection.json')
    assert selection['nativeExecution'] is False and len(selection['checks']) == 2
    assert all(item['nativeRendererAndNewPersonalTreeModulesPresent'] and item['domWebglRendererAbsent']
               for item in selection['checks'])
    assert all(item['originalHistoryModulesPresent'] for item in selection['checks'])

    upgrade = read('upgrade/r1/offline-upgrade.json')
    assert upgrade['passed'] and upgrade['baselineVersion'] == '0.16.0' and upgrade['targetVersion'] == VERSION
    assert upgrade['targetBuild'] == core
    for flag in ('realWorkerActivation', 'sameOriginPersistentProfile', 'personalGoalAndReviewRestoredExactly',
                 'thoughtOpenedReadonlyWithUnrelatedDraftsExact', 'oldStudyAnswersUnchanged',
                 'actualV11DownloadAndRestorePreview', 'restoreWasNotApplied', 'allFourRawV11RecordsExactThroughout',
                 'builtHtmlAndWorkersUnchanged', 'sourceUnchangedDuringUpgrade',
                 'originalReviewsAndMilestonesAccessibleReadonly', 'unassignedReviewOriginalSourceExact'):
        assert upgrade[flag] is True, flag
    assert upgrade['packagingInputsBefore'] == upgrade['packagingInputsAfter']
    assert upgrade['packagingInputsAfter']['sha256'] == packaging['sha256']
    assert upgrade['offlineA51Stages'] == 7 and upgrade['runtimeInputsBefore'] == upgrade['runtimeInputsAfter']
    assert upgrade['runtimeInputsAfter']['sha256'] == digest['sha256']
    assert upgrade['targetHtmlSha256'] == sha(ROOT / 'dist/index.html')
    assert upgrade['targetWorkerSha256'] == sha(ROOT / 'dist/sw.js')
    upgrade_run = read('upgrade/execution-r1.json')
    assert upgrade_run['exitCode'] == 0 and upgrade_run['runnerSha256'] == sha(ROOT / upgrade_run['runner'])
    assert upgrade_run['logSha256'] == sha(ROOT / upgrade_run['log'])
    result = {'version': VERSION, 'allCoreChecksPassed': True, 'dataVersion': 11, 'coreBuild': core,
              'fullBrowserExecutableBuild': core, 'packagingSourceDigest': packaging['sha256'],
              'runtimeSourceDigest': digest, 'unit': {'passed': 347, 'total': 347, 'failed': 0, 'pending': 0},
              'browser': {'passed': 154, 'total': 154, 'unexpected': 0, 'flaky': 0, 'skipped': 0,
                          'singleFullGreenRun': True, 'allResultsSingleAttempt': True},
              'originalLifeTopics': {'topics': 18, 'references': 45, 'contexts': 45, 'reflectionPrompts': 45},
              'originalStories': {'units': 436, 'questions': 2479, 'reflectionPrompts': 436, 'aliasPairs': 95},
              'existingGuidedPaths': 9, 'personalTreeReadOnly': True, 'originalHistoryReadOnly': True, 'nativeExecution': False,
              'masterDefinitionOfDoneComplete': False}
    if require_summary:
        summary = read('validation-summary.json')
        for key, value in result.items():
            assert summary[key] == value, key
        return summary
    return result
