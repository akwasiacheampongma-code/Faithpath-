from pathlib import Path
import datetime
import json
import os
import subprocess
import sys
import time

probe = Path('/workspace/oliva-dependency-probe')
out = Path('/workspace/oliva-security-audit/reports/dependencies-0.8/probe')
name, *command = sys.argv[1:]
assert probe.is_dir() and json.loads((probe / 'package.json').read_text())['overrides']['@expo/cli']['glob'] == '14.0.4'
started = datetime.datetime.now(datetime.timezone.utc).isoformat()
clock = time.monotonic()
temporary = Path('/tmp/oliva-dependency-probe-tmp')
temporary.mkdir(exist_ok=True)
environment = os.environ.copy()
environment['TMPDIR'] = str(temporary)
with (out / (name + '.log')).open('w') as log:
    result = subprocess.run(command, cwd=probe, env=environment, stdout=log, stderr=subprocess.STDOUT)
record = {'name': name, 'command': command, 'cwd': str(probe), 'startedAtUtc': started, 'durationSeconds': round(time.monotonic() - clock, 3), 'exitCode': result.returncode, 'log': str(out / (name + '.log'))}
(out / (name + '-status.json')).write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps(record, indent=2), flush=True)
print((out / (name + '.log')).read_text()[-18000:], flush=True)
sys.exit(result.returncode)
