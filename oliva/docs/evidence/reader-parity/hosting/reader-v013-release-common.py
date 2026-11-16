"""Read-only validation gates for the implemented OLIVA 0.13 Reader candidate.
No credentials, source changes, build, network calls, or publication occur here.
"""
from pathlib import Path
import hashlib, json, re, subprocess, os
ROOT = Path('/workspace/faithpath-next')
EVIDENCE = ROOT / 'docs/evidence/reader-parity'
VERSION = '0.13.0'
BASE = 'a6f82509a2b2b72436e23aa417844f26067589fe'
FEATURE_CHECKPOINT = '45cbccc1e7293eb77e476dd11c72585eeb130e88'
PRIVATE_PROJECT = 'appgprj_6aedf77e5ce0819180c10eb799447018'
PRIVATE_URL = 'https://oliva-v04-private-preview.purplebean128.chatgpt.site'
RELEASE_BRANCH = 'feature/oliva-v013-reader-parity-20261116'
SOURCE_TAG = 'oliva-v0.13-reader-parity-private'
GITHUB_PARENT = '8d0e663150da1860c371aeeba2c4f2ddf16daf8a'
SAFE_ENV = {k: v for k, v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE', 'GH_DEBUG']}
SAFE_ENV['GIT_TERMINAL_PROMPT'] = '0'
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, env=SAFE_ENV).decode().strip()
def evidence_path(name):
    p = Path(name)
    assert not p.is_absolute() and '..' not in p.parts, 'Evidence must be local to the Reader proof directory'
    result = EVIDENCE / p
    assert result.resolve().is_relative_to(EVIDENCE.resolve())
    return result

def read(name): return json.loads(evidence_path(name).read_text())
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def guard():
    assert ROOT.resolve() == Path('/workspace/faithpath-next')
    assert git('branch', '--show-current') == RELEASE_BRANCH
    for ancestor in [BASE, FEATURE_CHECKPOINT]:
        subprocess.run(['git', 'merge-base', '--is-ancestor', ancestor, 'HEAD'], cwd=ROOT, env=SAFE_ENV, check=True)
    package = json.loads((ROOT / 'package.json').read_text())
    lock = json.loads((ROOT / 'package-lock.json').read_text())
    assert package['version'] == lock['version'] == lock['packages']['']['version'] == VERSION
    assert json.loads((ROOT / 'app.json').read_text())['expo']['version'] == VERSION
    summary = read('validation-summary.json')
    assert summary['version'] == VERSION and summary['allCoreChecksPassed'] is True and summary['dataVersion'] == 9
    html = (ROOT / 'dist/index.html').read_text()
    core = re.search(r'name="oliva-build" content="([^"]+)"', html).group(1)
    assert core == summary['coreBuild'] and re.fullmatch(r'oliva-[a-f0-9]{16}', core)
    worker = (ROOT / 'dist/sw.js').read_text()
    assert worker.startswith('const ID=' + json.dumps(core) + ',URLS=')
    assert ',VERSION=' + json.dumps(VERSION) + ';' in worker

    unit = read('unit-results.json')
    assert unit['success'] and unit['numTotalTests'] == unit['numPassedTests'] >= 290
    assert unit['numFailedTests'] == unit['numPendingTests'] == 0
    assert summary['unit']['passed'] == unit['numPassedTests'] and summary['unit']['total'] == unit['numTotalTests']
    assert summary['unit']['failed'] == summary['unit']['pending'] == 0
    browser = read('e2e-results.json'); stats = browser['stats']
    assert stats['expected'] >= 126 and all(stats[k] == 0 for k in ['unexpected', 'flaky', 'skipped'])
    assert not browser.get('errors') and browser['config']['workers'] == 1
    assert browser['config']['argv'][-1] == 'test', 'Use the unfiltered complete browser suite'
    assert set(s['file'] for s in browser['suites']) == set(p.name for p in (ROOT / 'tests/e2e').glob('*.spec.ts'))
    seen = []
    def walk(suite):
        for spec in suite.get('specs', []):
            for test in spec.get('tests', []):
                assert test['status'] == 'expected' and len(test['results']) == 1
                result = test['results'][0]
                assert result['status'] == 'passed' and result.get('retry', 0) == 0
                seen.append(spec['title'])
        for child in suite.get('suites', []): walk(child)
    for suite in browser['suites']: walk(suite)
    assert len(seen) == stats['expected'] == summary['browser']['passed'] == summary['browser']['total']
    assert all(summary['browser'][k] == 0 for k in ['unexpected', 'flaky', 'skipped'])
    assert summary['browser']['singleFullGreenRun'] is True and summary['browser']['allResultsSingleAttempt'] is True

    inputs = read(summary.get('runtimeInputsPath', 'runtime-inputs.json'))
    paths = [f['path'] for f in inputs['files']]
    assert len(paths) == len(set(paths))
    expected = {p.relative_to(ROOT).as_posix() for folder in ['app', 'src', 'assets'] for p in (ROOT / folder).rglob('*') if p.is_file()}
    expected |= {'app.json', 'package.json', 'package-lock.json', 'art/a51/native-derivatives.json', 'art/swords/romans-runtime.json', 'art/swords/runtime-index.json', 'art/swords/runtime.json'}
    assert set(paths) == expected, 'Manifest must cover every current source/asset input'
    h = hashlib.sha256()
    for f in inputs['files']:
        p = Path(f['path']); assert not p.is_absolute() and '..' not in p.parts
        actual = ROOT / p
        assert actual.resolve().is_relative_to(ROOT.resolve()) and not actual.is_symlink()
        raw = actual.read_bytes()
        assert len(raw) == f['bytes'] and hashlib.sha256(raw).hexdigest() == f['sha256'], f['path']
        h.update(f['path'].encode() + b'\0' + raw + b'\0')
    digest = summary['runtimeSourceDigest']
    assert h.hexdigest() == inputs['runtimeSourceDigest']['sha256'] == digest['sha256']
    assert len(paths) == digest['fileCount'] == inputs['runtimeSourceDigest']['fileCount']

    native = read('native/native-builds.json')
    assert native['version'] == VERSION and native['allPassed'] and native['sourceUnchangedDuringExports']
    assert native['sourceStillMatchesFreezeAfterReaderCheck'] and native['preservedPreviousInventoriesStillMatch']
    assert native['runtimeSourceDigest'] == digest
    assert {x['platform'] for x in native['exports']} == {'android', 'ios'}
    assert all(x['exitCode'] == 0 for x in native['exports'])
    assert read('native/native-export-check.json')['ok']
    nt = read('native/nt-native-catalog-check.json')
    assert nt['status'] == 'PASS' and nt['source']['counts']['questions'] == 1300
    assert read('native/native-reader-check.json')['status'] == 'PASS'

    upgrade_name = summary.get('upgradeReportPath', 'upgrade/' + core + '/offline-upgrade.json')
    upgrade = read(upgrade_name)
    assert upgrade['passed'] is True and upgrade['baselineVersion'] == '0.12.1'
    assert upgrade['targetVersion'] == VERSION and upgrade['targetBuild'] == core
    for flag in ['realWorkerActivation', 'sameOriginPersistentProfile', 'allFourRawV8RecordsExactBeforeNewActions',
                 'noAutomaticChapterCompletion', 'gapDidNotFillOrWrite', 'firstExplicitActionWroteV9',
                 'onlyVersionRevisionDraftsAndCanonicalAnchorPermittedToChange', 'oldSingleVerseAndJournalDraftsExact',
                 'ntAnswerAndReadGrowthFieldsExact', 'allThreeNonMainRecordsExactThroughV9Actions',
                 'originalNotesAndSourcesPreserved', 'readAndGrowthAndNtFieldsExactThroughout',
                 'actualV9DownloadAndRestorePreview', 'restoreWasNotApplied', 'builtHtmlAndWorkersUnchanged',
                 'sourceUnchangedDuringUpgrade']:
        assert upgrade[flag] is True, 'Upgrade proof missing: ' + flag
    assert upgrade['offlineA51Stages'] == 7 and upgrade['displayedCanonicalVerses'] == 71
    assert upgrade['outsideFocusAnchorPreserved']['verse'] == 60 and upgrade['outsideFocusAnchorPreserved']['offlineReload'] is True
    assert upgrade['runtimeInputsBefore'] == upgrade['runtimeInputsAfter']
    assert upgrade['runtimeInputsAfter']['sha256'] == digest['sha256'] and upgrade['runtimeInputsAfter']['allFileHashesMatch']
    assert upgrade['targetHtmlSha256'] == sha(ROOT / 'dist/index.html') and upgrade['targetWorkerSha256'] == sha(ROOT / 'dist/sw.js')
    execution = read(summary.get('upgradeExecutionPath', 'upgrade/execution.json'))
    assert execution['exitCode'] == 0
    runner = Path(execution['command'][1]); assert runner.resolve().is_relative_to(EVIDENCE.resolve())
    assert execution['runnerSha256'] == sha(runner)
    assert execution['logSha256'] == sha(evidence_path(summary.get('upgradeLogPath', 'upgrade/execution.txt')))
    assert read('npm-audit.json')['metadata']['vulnerabilities']['total'] == 0
    return summary
