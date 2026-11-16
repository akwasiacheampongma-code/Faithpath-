"""Read-only guards shared by the isolated OLIVA book-search delivery helpers."""
from pathlib import Path
import hashlib, json, re, subprocess, os
ROOT = Path('/workspace/oliva-book-search')
EVIDENCE = ROOT / 'docs/evidence/book-search'
VERSION = '0.12.1'
BASE = 'a6f82509a2b2b72436e23aa417844f26067589fe'
PRIVATE_PROJECT = 'appgprj_6aedf77e5ce0819180c10eb799447018'
PRIVATE_URL = 'https://oliva-v04-private-preview.purplebean128.chatgpt.site'
RELEASE_BRANCH = 'feature/oliva-v0121-book-search-20261115'
SOURCE_TAG = 'oliva-v0.12.1-book-search-private'
GITHUB_PARENT = '869b1f750d4b0ff96dcfe6d247280840be5e2c4f'
SAFE_ENV = {k: v for k, v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ['GIT_CURL_VERBOSE', 'GH_DEBUG']}
SAFE_ENV['GIT_TERMINAL_PROMPT'] = '0'
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, env=SAFE_ENV).decode().strip()
def read(name):
    return json.loads((EVIDENCE / name).read_text())
def guard():
    assert ROOT.resolve() == Path('/workspace/oliva-book-search'), 'Never package the unfinished Reader working tree'
    assert git('branch', '--show-current') in ['feature/oliva-book-search-20261115', RELEASE_BRANCH]
    subprocess.run(['git', 'merge-base', '--is-ancestor', BASE, 'HEAD'], cwd=ROOT, env=SAFE_ENV, check=True)
    assert json.loads((ROOT / 'package.json').read_text())['version'] == VERSION
    assert json.loads((ROOT / 'app.json').read_text())['expo']['version'] == VERSION
    allowed = {'app/bibel.tsx', 'app/verstehen/index.tsx', 'src/features/bible/book-search.ts', 'src/features/bible/BibleScopeSelect.tsx', 'src/features/bible/BibleScopeSelect.web.tsx'}
    changed = set(git('diff', '--name-only', BASE, '--', 'app', 'src').splitlines())
    untracked = set(git('ls-files', '--others', '--exclude-standard', '--', 'app', 'src').splitlines())
    assert changed | untracked <= allowed, 'Reader/runtime scope unexpectedly changed: ' + str((changed | untracked) - allowed)
    summary = read('validation-summary.json')
    assert summary['version'] == VERSION and summary['allCoreChecksPassed'] is True
    core = re.search(r'name="oliva-build" content="([^"]+)"', (ROOT / 'dist/index.html').read_text()).group(1)
    assert core == summary['coreBuild'] and re.match(r'^oliva-[a-f0-9]{16}$', core)
    unit = read('unit-results.json')
    assert unit['success'] and unit['numTotalTests'] == unit['numPassedTests'] > 0
    assert unit['numFailedTests'] == unit['numPendingTests'] == 0
    assert summary['unit']['passed'] == unit['numPassedTests'] and summary['unit']['total'] == unit['numTotalTests']
    assert summary['unit']['failed'] == summary['unit']['pending'] == 0
    browser = read('e2e-results.json'); stats = browser['stats']
    assert stats['expected'] > 0 and all(stats[k] == 0 for k in ['unexpected', 'flaky', 'skipped'])
    assert not browser.get('errors')
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
    assert set(paths) == expected, 'Runtime snapshot must cover all inputs, including new source files'
    h = hashlib.sha256()
    for f in inputs['files']:
        assert not Path(f['path']).is_absolute() and '..' not in Path(f['path']).parts
        raw = (ROOT / f['path']).read_bytes()
        assert len(raw) == f['bytes'] and hashlib.sha256(raw).hexdigest() == f['sha256'], f['path']
        h.update(f['path'].encode() + b'\0' + raw + b'\0')
    digest = summary['runtimeSourceDigest']
    assert h.hexdigest() == inputs['runtimeSourceDigest']['sha256'] == digest['sha256']
    assert len(paths) == digest['fileCount'] == inputs['runtimeSourceDigest']['fileCount']
    return summary
