#!/usr/bin/env python3
"""Read-only verification of one authorized OLIVA 0.15.0 GitHub push/run.

No workflow dispatch, rerun, ref mutation, source edit, or deployment occurs.
The exact pushed branch/head must be supplied by the parent before execution.
"""
from pathlib import Path
import argparse, base64, collections, datetime, hashlib, json, os, re, subprocess, urllib.parse, zipfile

REPO = 'akwasiacheampongma-code/Faithpath-'
OUT = Path('/workspace/faithpath-next/docs/evidence/github/ci-v015')
PINS = {
    'checkout': '3d3c42e5aac5ba805825da76410c181273ba90b1',
    'setup-node': '949feb2413d6458794dcd2491c4babbbce0c15c1',
    'setup-python': '6d4fd22b20465ccc0f7354476588e8df7c9ca0e0',
    'upload-artifact': 'cf430e030ddbb5b0abf93d22962f4752f3646cd9',
}
ENV = {k:v for k,v in os.environ.items() if not k.startswith('GIT_TRACE') and k not in ('GIT_CURL_VERBOSE', 'GH_DEBUG')}

def now(): return datetime.datetime.now(datetime.timezone.utc).isoformat()
def stamp(value): return datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))
def digest(value): return hashlib.sha256(value).hexdigest()
def safe_bytes(value):
    # Refuse to publish any accidentally captured credential or signed redirect.
    if re.search(rb'(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|(?i:authorization:\s*(?:bearer|token)\s+)[A-Za-z0-9_./+\-=]{20,}|X-Amz-Signature=|[?&]sig=[A-Za-z0-9%/+]{25,})', value):
        raise RuntimeError('Refusing evidence containing a possible credential or signed URL')
    return value
def save(name, value):
    payload = json.dumps(value, indent=2, ensure_ascii=False).encode() + b'\n'
    (OUT/name).write_bytes(safe_bytes(payload))
def raw_save(name, value): (OUT/name).write_bytes(safe_bytes(value))
def api(path, binary=False):
    result = subprocess.run(['gh', 'api', path], capture_output=True, env=ENV)
    if result.returncode:
        # Never print stderr, which may contain temporary signed redirect URLs.
        raise RuntimeError('GitHub API request failed: ' + path.split('?')[0])
    return result.stdout if binary else json.loads(result.stdout)
def repo_api(path, binary=False): return api('repos/' + REPO + '/' + path, binary)
def content(repository, path, ref):
    item = api('repos/' + repository + '/contents/' + path + '?ref=' + urllib.parse.quote(ref, safe=''))
    assert item['encoding'] == 'base64' and item['type'] == 'file'
    payload = base64.b64decode(item['content'])
    return payload, {'repository':repository, 'path':path, 'ref':ref, 'blobSha':item['sha'], 'bytes':len(payload), 'sha256':digest(payload)}

parser = argparse.ArgumentParser()
parser.add_argument('stage', choices=['discover', 'observe', 'verify'])
parser.add_argument('--head', required=True)
parser.add_argument('--branch', required=True)
parser.add_argument('--run', type=int)
parser.add_argument('--archive', type=Path)
parser.add_argument('--job-log', type=Path)
args = parser.parse_args()
assert re.fullmatch('[0-9a-f]{40}', args.head)
assert args.branch == 'feature/oliva-v015-life-topics-20261117'
OUT.mkdir(parents=True, exist_ok=True)

if args.stage == 'discover':
    query = urllib.parse.urlencode({'head_sha':args.head, 'branch':args.branch, 'event':'push', 'per_page':100})
    discovery = repo_api('actions/workflows/oliva-quality.yml/runs?' + query)
    save('runs-discovery.json', discovery)
    runs = [r for r in discovery['workflow_runs'] if r['head_sha'] == args.head and r['head_branch'] == args.branch and r['event'] == 'push']
    print(json.dumps({'checkedAt':now(), 'exactRuns':[{'id':r['id'], 'head':r['head_sha'], 'branch':r['head_branch'], 'status':r['status'], 'conclusion':r['conclusion'], 'attempt':r['run_attempt'], 'createdAt':r['created_at']} for r in runs]}))
    raise SystemExit(0)

assert args.run is not None
run = repo_api(f'actions/runs/{args.run}')
assert run['head_sha'] == args.head and run['head_branch'] == args.branch and run['event'] == 'push'
assert run['repository']['full_name'] == REPO
assert run['path'].split('@')[0] == '.github/workflows/oliva-quality.yml'
save('run.json', run)
jobs = repo_api(f'actions/runs/{args.run}/jobs?filter=all&per_page=100')
assert jobs['total_count'] == len(jobs['jobs'])
save('jobs.json', jobs)
observation = {'checkedAt':now(), 'headSha':run['head_sha'], 'headBranch':run['head_branch'], 'runAttempt':run['run_attempt'], 'status':run['status'], 'conclusion':run['conclusion'], 'jobs':[{'id':j['id'], 'runAttempt':j.get('run_attempt'), 'status':j['status'], 'conclusion':j['conclusion'], 'steps':[{'name':s['name'], 'status':s['status'], 'conclusion':s['conclusion']} for s in j['steps']]} for j in jobs['jobs']]}
observations = json.loads((OUT/'observations.json').read_text()) if (OUT/'observations.json').exists() else []
observations.append(observation)
save('observations.json', observations)
if args.stage == 'observe' or run['status'] != 'completed':
    print(json.dumps(observation))
    raise SystemExit(0)

save('verification.json', {'purpose':'Independent verification of the actual OLIVA 0.15.0 GitHub Actions source-backup run', 'checkedAt':now(), 'repository':REPO, 'runId':args.run, 'runUrl':run['html_url'], 'headSha':args.head, 'headBranch':args.branch, 'runConclusion':run['conclusion'], 'runAttempt':run['run_attempt'], 'verificationComplete':False, 'qualityVerified':False, 'note':'Artifact and reports have not yet passed independent verification.'})

artifacts = repo_api(f'actions/runs/{args.run}/artifacts?per_page=100')
assert artifacts['total_count'] == len(artifacts['artifacts'])
save('artifacts.json', artifacts)
matching = [a for a in artifacts['artifacts'] if a['name'] == 'oliva-quality-' + args.head]
assert len(matching) == 1
artifact = matching[0]
assert artifact['workflow_run']['id'] == args.run and artifact['workflow_run']['head_sha'] == args.head
assert artifact['workflow_run']['head_branch'] == args.branch and not artifact['expired']

snapshots = []
for filename, gitpath in [('remote-workflow.yml', '.github/workflows/oliva-quality.yml'), ('remote-quality-action.yml', 'oliva/.github/actions/quality/action.yml'), ('remote-vitest.config.ts', 'oliva/vitest.config.ts'), ('remote-playwright.config.ts', 'oliva/playwright.config.ts'), ('remote-package.json', 'oliva/package.json')]:
    payload, record = content(REPO, gitpath, args.head)
    raw_save(filename, payload); snapshots.append(record | {'evidenceFile':filename})
action_pins = []
for action, pin in PINS.items():
    payload, record = content('actions/' + action, 'action.yml', pin)
    filename = 'action-' + action + '.yml'
    raw_save(filename, payload)
    node24 = bool(re.search(rb'^\s+using:\s*[\x27\"]?node24[\x27\"]?\s*$', payload, re.M))
    action_pins.append(record | {'action':action, 'pin':pin, 'nativeNode24':node24, 'evidenceFile':filename})
save('remote-source-integrity.json', {'checkedAt':now(), 'headSha':args.head, 'snapshots':snapshots, 'ownActionManifests':action_pins})

if args.job_log is not None:
    provenance = json.loads((OUT/'job-log-source.json').read_text())
    log_bytes = args.job_log.read_bytes()
    assert provenance['jobId'] in [j['id'] for j in jobs['jobs']] and provenance['runId'] == args.run and provenance['headSha'] == args.head
    assert provenance['bytes'] == len(log_bytes) and provenance['sha256'] == digest(log_bytes)
    assert len(jobs['jobs']) == 1, 'One connector job log was supplied for multiple jobs'
else:
    logs = []
    for job in jobs['jobs']:
        logs.append(repo_api(f"actions/jobs/{job['id']}/logs", True))
    log_bytes = b'\n'.join(logs)
raw_save('job.log', log_bytes)
log = log_bytes.decode('utf8', 'replace')
if args.archive is None or not args.archive.is_file():
    print(json.dumps({'needsArtifactDownload':True, 'artifactId':artifact['id'], 'artifactName':artifact['name'], 'bytes':artifact['size_in_bytes'], 'digest':artifact['digest']}))
    raise SystemExit(0)

assert Path('/workspace/faithpath-next') not in args.archive.resolve().parents, 'ZIP must remain outside source'
archive_bytes = args.archive.read_bytes()
archive_sha = digest(archive_bytes)
assert len(archive_bytes) == artifact['size_in_bytes'] and 'sha256:' + archive_sha == artifact['digest']
copied, entries = [], []
with zipfile.ZipFile(args.archive) as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    assert len(names) == len(set(names))
    for name in names:
        assert not name.startswith('/') and '..' not in Path(name).parts and '\\' not in name
        payload = archive.read(name)
        entries.append({'path':name, 'bytes':len(payload), 'sha256':digest(payload)})
    for report in ('unit-results.json', 'e2e-results.json', 'a51-asset-integrity.json', 'reader-anchor-synchronization.json'):
        matches = [name for name in names if name == report or name.endswith('/' + report)]
        assert len(matches) == 1, (report, matches)
        payload = archive.read(matches[0])
        raw_save(report, payload)
        copied.append({'report':report, 'archivePath':matches[0], 'bytes':len(payload), 'sha256':digest(payload)})
    # Preserve only generated failure diagnostics, never user export/backup files.
    for index, name in enumerate(name for name in names if name.startswith('test-results/') and name.endswith('error-context.md')):
        raw_save(f'failure-{index + 1}-error-context.md', archive.read(name))
save('artifact-integrity.json', {'artifactId':artifact['id'], 'bytes':len(archive_bytes), 'sha256':archive_sha, 'githubDigest':artifact['digest'], 'matchesGithubDigest':True, 'crcVerified':True, 'entries':len(entries), 'files':entries})

unit = json.loads((OUT/'unit-results.json').read_bytes())
browser = json.loads((OUT/'e2e-results.json').read_bytes())
all_tests = []
def walk(suites):
    for suite in suites:
        for spec in suite.get('specs', []):
            for test in spec.get('tests', []):
                all_tests.append({'id':spec.get('id'), 'title':spec['title'], 'file':spec.get('file', suite.get('file')), 'line':spec.get('line'), 'specOk':spec.get('ok'), 'projectId':test.get('projectId'), 'expectedStatus':test.get('expectedStatus'), 'status':test['status'], 'results':test.get('results', [])})
        walk(suite.get('suites', []))
walk(browser['suites'])
result_status = collections.Counter(r['status'] for t in all_tests for r in t['results'])
attempt_counts = collections.Counter(len(t['results']) for t in all_tests)
retry_values = collections.Counter(r.get('retry', 0) for t in all_tests for r in t['results'])
assertions = [a for suite in unit['testResults'] for a in suite.get('assertionResults', [])]
assertion_status = collections.Counter(a['status'] for a in assertions)
started, ended = stamp(run['created_at']), stamp(run['updated_at'])
unit_started = datetime.datetime.fromtimestamp(unit['startTime']/1000, datetime.timezone.utc)
unit_times = [datetime.datetime.fromtimestamp(suite[key]/1000, datetime.timezone.utc) for suite in unit['testResults'] for key in ('startTime', 'endTime')]
browser_times = [stamp(browser['stats']['startTime'])] + [stamp(r['startTime']) for t in all_tests for r in t['results']]
browser_ends = [stamp(r['startTime']) + datetime.timedelta(milliseconds=r['duration']) for t in all_tests for r in t['results']]
def action_window(display):
    pattern = re.compile(r'^(\S+) ##\[start-action display=' + re.escape(display) + r';id=([^\]]+)\]$', re.M)
    start_match = pattern.search(log)
    if not start_match: return None
    finish_match = re.search(r'^(\S+) ##\[end-action id=' + re.escape(start_match[2]) + r';[^\]]+\]$', log[start_match.end():], re.M)
    return (stamp(start_match[1]), stamp(finish_match[1])) if finish_match else None
unit_window = action_window('Types and domain/persistence tests')
browser_window = action_window('Test real browser flows')
unit_fresh = bool(unit_window) and started <= unit_window[0] <= unit_started <= unit_window[1] <= ended and bool(unit_times) and all(unit_window[0] <= value <= unit_window[1] for value in unit_times)
browser_fresh = bool(browser_window) and started <= browser_window[0] <= browser_window[1] <= ended and bool(browser_times) and all(browser_window[0] <= value <= browser_window[1] for value in browser_times + browser_ends)
observed_pins = {key:pin for key,pin in PINS.items() if f"Download action repository 'actions/{key}@{pin}'" in log}
declared = (OUT/'remote-workflow.yml').read_text() + (OUT/'remote-quality-action.yml').read_text()
all_pins_declared = all('actions/' + key + '@' + pin in declared for key,pin in PINS.items())
build_records = [{'buildId':match[1], 'runtimeFiles':int(match[2])} for match in re.finditer(r'Offline bundle: (oliva-[0-9a-f]{16}), (\d+) files', log)]
build_ids = sorted(set(record['buildId'] for record in build_records))
audit_group = re.search(r'##\[group\]Run npm audit --audit-level=moderate\b(?P<body>.*?)(?:##\[end-action|##\[group\])', log, re.S)
audit_zero = bool(audit_group and re.search(r'found 0 vulnerabilities', audit_group.group('body')))
checks = {
    'headAndBranchMatch':True, 'completedSuccessfully':run['status'] == 'completed' and run['conclusion'] == 'success',
    'singleRunAttempt':run['run_attempt'] == 1,
    'singleJobAttempt':all(j.get('run_attempt') == 1 for j in jobs['jobs']),
    'allJobsSuccessful':bool(jobs['jobs']) and all(j['conclusion'] == 'success' for j in jobs['jobs']),
    'allJobStepsSuccessful':all(s['conclusion'] == 'success' for j in jobs['jobs'] for s in j['steps']),
    'archiveIntegrityVerified':True, 'freshUnitReport':unit_fresh, 'freshBrowserReport':browser_fresh,
    'freshArtifact':started <= stamp(artifact['created_at']) <= stamp(artifact['updated_at']) <= ended,
    'allUnitAssertionsPresent':len(assertions) == unit['numTotalTests'],
    '321UnitPassed':unit['success'] and unit['numTotalTests'] == 321 and unit['numPassedTests'] == 321 and unit['numFailedTests'] == 0 and unit['numPendingTests'] == 0 and unit['numTodoTests'] == 0 and unit['numFailedTestSuites'] == 0 and unit['numPendingTestSuites'] == 0 and unit['numPassedTestSuites'] == unit['numTotalTestSuites'] and not unit['snapshot']['failure'] and all(s['status'] == 'passed' for s in unit['testResults']) and dict(assertion_status) == {'passed':321},
    '144BrowserPassed':len(all_tests) == 144 and len({(t['id'], t['projectId']) for t in all_tests}) == 144 and browser['stats']['expected'] == 144 and browser['stats']['unexpected'] == 0 and browser['stats']['skipped'] == 0 and browser['stats']['flaky'] == 0 and not browser['errors'] and all(t['status'] == 'expected' and t['expectedStatus'] == 'passed' and t['specOk'] for t in all_tests),
    'noBrowserRetries':dict(attempt_counts) == {1:144} and dict(retry_values) == {0:144} and dict(result_status) == {'passed':144},
    'noBrowserResultErrors':all(not r.get('error') and not r.get('errors') for t in all_tests for r in t['results']),
    'allFourPinsObservedAndDeclared':len(observed_pins) == 4 and all_pins_declared,
    'allFourOwnActionsUseNode24':all(a['nativeNode24'] for a in action_pins),
    'explicitAuditZero':audit_zero,
    'realRemoteBuildIdObserved':bool(build_ids),
    'typecheckCommandObserved':'##[group]Run npm run typecheck' in log,
    'webPwaBuildCommandObserved':'##[group]Run npm run build' in log,
    'allContentValidationCommandsObserved':all(re.search(r'> [^\n]* ' + re.escape(command) + r'\s*$', log, re.M) for command in ('content:check', 'content:nt', 'content:stories', 'content:topics', 'content:art', 'content:tree', 'content:swords')),
}
ci_metadata = browser['config'].get('metadata', {}).get('ci', {})
git_metadata = browser['config'].get('metadata', {}).get('gitCommit', {})
checks['browserMetadataMatchesRun'] = ci_metadata.get('commitHash') == args.head and ci_metadata.get('buildHref') == run['html_url'] and git_metadata.get('hash') == args.head and git_metadata.get('branch') == args.branch
checks['unfilteredBrowserConfiguration'] = browser['config'].get('shard') is None and not browser['config'].get('grepInvert') and not browser['config'].get('grep') and all(p.get('repeatEach') == 1 and p.get('retries') == 0 for p in browser['config']['projects']) and browser['config']['argv'][-1] == 'test'
vitest_config = (OUT/'remote-vitest.config.ts').read_text()
package = json.loads((OUT/'remote-package.json').read_text())
checks['unitRunnerRetriesNotConfigured'] = not re.search(r'\bretry\b|\brepeats\b', vitest_config) and package['scripts']['test'] == 'vitest run' and '--retry' not in declared and '--repeats' not in declared
checks['unfilteredBrowserCommand'] = package['scripts']['test:e2e'] == 'playwright test'
checks['exactVersion'] = package['version'] == '0.15.0'
asset_report = json.loads((OUT/'a51-asset-integrity.json').read_bytes())
anchor_report = json.loads((OUT/'reader-anchor-synchronization.json').read_bytes())
checks['freshAssetIntegrityReport'] = started <= stamp(asset_report['checkedAt']) <= ended and asset_report['allFileHashesMatch'] and asset_report['originalsUnmodified']
checks['readerAnchorReportMatchesRemoteBuild'] = anchor_report.get('source_build_id') in build_ids
source_identities = json.loads((OUT/'source-identities.json').read_text())
checks['sourceSubtreeAndTagMatchAuthorizedHead'] = source_identities['githubHead'] == args.head and source_identities['sourceSubtreeMatchesAuthorizedSnapshot'] and source_identities['tagTargetsExactHead']
historical = []
for historical_id, historical_head in [(42586789188, '5e093ee3d35560e5d902ac6d743341ab16126fe2'), (42629068592, '20493b077d827c6875f276d0e36bf7fb0e9fce41')]:
    prior = repo_api(f'actions/runs/{historical_id}')
    save(f'historical-run-{historical_id}.json', prior)
    historical.append({'id':historical_id, 'headSha':prior['head_sha'], 'conclusion':prior['conclusion'], 'attempt':prior['run_attempt'], 'unchanged':prior['head_sha'] == historical_head and prior['conclusion'] == 'failure' and prior['run_attempt'] == 1})
checks['historical011FailuresUnchanged'] = all(r['unchanged'] for r in historical)
verification = {
    'purpose':'Independent verification of the actual OLIVA 0.15.0 GitHub Actions source-backup run',
    'checkedAt':now(), 'repository':REPO, 'runId':args.run, 'runUrl':run['html_url'], 'headSha':run['head_sha'], 'headBranch':run['head_branch'],
    'runStatus':run['status'], 'runConclusion':run['conclusion'], 'runAttempt':run['run_attempt'], 'createdAt':run['created_at'], 'completedAt':run['updated_at'],
    'jobIds':[j['id'] for j in jobs['jobs']], 'checks':checks, 'verificationComplete':True, 'qualityVerified':all(checks.values()),
    'artifact':{'id':artifact['id'], 'name':artifact['name'], 'bytes':len(archive_bytes), 'githubDigest':artifact['digest'], 'downloadSha256':archive_sha, 'digestMatches':True, 'archiveCrcVerified':True, 'archiveEntries':len(entries), 'headMatches':True, 'zipStoredOutsideSource':True},
    'unit':{'total':unit['numTotalTests'], 'passed':unit['numPassedTests'], 'failed':unit['numFailedTests'], 'pending':unit['numPendingTests'], 'todo':unit['numTodoTests'], 'assertionStatuses':dict(assertion_status), 'testResultFiles':len(unit['testResults']), 'freshForRun':unit_fresh, 'startTime':unit_started.isoformat(), 'actualStepWindow':[v.isoformat() for v in unit_window] if unit_window else None},
    'browser':{'total':len(all_tests), 'passed':browser['stats']['expected'], 'failed':browser['stats']['unexpected'], 'skipped':browser['stats']['skipped'], 'flaky':browser['stats']['flaky'], 'freshForRun':browser_fresh, 'startTime':browser['stats']['startTime'], 'durationMs':browser['stats']['duration'], 'resultStatuses':dict(result_status), 'attemptCounts':dict(attempt_counts), 'retryValues':dict(retry_values), 'errors':browser['errors'], 'failures':[t for t in all_tests if t['status'] != 'expected']},
    'buildAndValidation':{'remoteWebBuildIds':build_ids, 'actualBuildOutput':build_records, 'actionPinsObserved':observed_pins, 'ownActionManifests':action_pins, 'explicitDependencyAuditZero':audit_zero, 'typecheckCommandObserved':'Run npm run typecheck' in log, 'webPwaBuildCommandObserved':'Run npm run build' in log, 'publicDomainCorpusCommandObserved':'Run npm run content:check' in log, 'nativeDeviceTesting':False},
    'copiedReports':copied, 'historical011Runs':historical, 'noAppDeployment':True,
}
save('verification.json', verification)
summary = {'runId':args.run, 'conclusion':run['conclusion'], 'headSha':args.head, 'branch':args.branch, 'unit':verification['unit'], 'browser':{k:v for k,v in verification['browser'].items() if k not in ('errors', 'failures')}, 'remoteWebBuildIds':build_ids, 'artifact':verification['artifact'], 'qualityVerified':verification['qualityVerified'], 'failedChecks':[k for k,v in checks.items() if not v]}
print(json.dumps(summary, ensure_ascii=False))
