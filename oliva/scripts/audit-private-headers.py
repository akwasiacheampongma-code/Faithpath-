"""Read-only HTTP checks of the existing owner-private preview.
The ephemeral capability is read through a non-echoing terminal, never persisted.
"""
from pathlib import Path
import json, sys, termios, urllib.request, urllib.error, hashlib, datetime

fd = sys.stdin.fileno()
previous = termios.tcgetattr(fd)
quiet = termios.tcgetattr(fd)
quiet[3] &= ~(termios.ECHO | termios.ICANON)
termios.tcsetattr(fd, termios.TCSANOW, quiet)
print('Credential input ready; terminal echo disabled.', flush=True)
token = sys.stdin.readline().strip()
termios.tcsetattr(fd, termios.TCSANOW, previous)
assert token and '\n' not in token
base = 'https://oliva-v04-private-preview.purplebean128.chatgpt.site'
headers = ['content-security-policy', 'content-security-policy-report-only', 'strict-transport-security',
    'x-content-type-options', 'referrer-policy', 'x-frame-options', 'permissions-policy',
    'cross-origin-opener-policy', 'cross-origin-resource-policy', 'cache-control', 'content-type']
results = []
for route in ['/', '/bibel', '/wege', '/garten', '/sammlung', '/sw.js', '/manifest.webmanifest']:
    for authenticated in [False, True]:
        req = urllib.request.Request(base + route, headers={'OAI-Sites-Authorization': 'Bearer ' + token} if authenticated else {})
        try:
            with urllib.request.urlopen(req, timeout=35) as response:
                status = response.status; body = response.read(); h = response.headers
        except urllib.error.HTTPError as error:
            status = error.code; body = error.read(); h = error.headers
        result = {'route': route, 'authenticated': authenticated, 'status': status,
            'bytes': len(body), 'sha256': hashlib.sha256(body).hexdigest(),
            'headers': {name: h.get(name) for name in headers}, 'setCookiePresent': bool(h.get('Set-Cookie'))}
        if authenticated and route not in ['/sw.js', '/manifest.webmanifest']:
            result['expectedDeployed018Marker'] = b'oliva-5d647075614ace83' in body
        results.append(result)
report = {'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'scope': 'Read-only HTTP headers/content markers, not a hosted browser or OS-device test',
    'existingDeployment': 'appgdep_6afc85fb56b8819195ae3d2b7859d32f',
    'accessPolicy': {'role': 'owner', 'accessMode': 'custom', 'revision': 1, 'users': 1, 'groups': 0, 'externalVisitors': 0},
    'liveCi': {'run': 44124684188, 'job': 134185116862, 'status': 'completed', 'conclusion': 'success'},
    'tokenPersisted': False, 'accessChanged': False, 'deployed': False, 'results': results}
out = Path(__file__).resolve().parents[1] / 'docs/evidence/quiet-ux-audit/live-preview-http.json'
report['expectedAccessPassed'] = all(x['status'] == 200 if x['authenticated'] else x['status'] in [401, 403] for x in results)
report['expected018Passed'] = all(x.get('expectedDeployed018Marker', True) for x in results)
out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'accessPassed': report['expectedAccessPassed'], 'markerPassed': report['expected018Passed'], 'statusCodes': [x['status'] for x in results]}), flush=True)
assert report['expectedAccessPassed'] and report['expected018Passed']
token = None
print(json.dumps({'requests': len(results), 'allExpectedAccessResults': True, 'existing018Confirmed': True, 'credentialsPersisted': False}), flush=True)
