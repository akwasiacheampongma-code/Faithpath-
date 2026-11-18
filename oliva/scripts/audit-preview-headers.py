"""Check the existing private preview with an existing read credential, when available."""

import datetime
import gzip
import hashlib
import json
from pathlib import Path
import sys
import termios
import urllib.error
import urllib.request


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def existing_credential():
    fd = sys.stdin.fileno()
    previous = termios.tcgetattr(fd)
    hidden = termios.tcgetattr(fd)
    hidden[3] &= ~(termios.ECHO | termios.ICANON)
    try:
        termios.tcsetattr(fd, termios.TCSANOW, hidden)
        print("Ready for existing credential on stdin (input is hidden).", flush=True)
        return sys.stdin.readline().strip()
    finally:
        termios.tcsetattr(fd, termios.TCSANOW, previous)


def inspect_response(opener, origin, route, credential=""):
    headers = {"Accept-Encoding": "gzip, br"}
    if credential:
        headers["OAI-Sites-Authorization"] = "Bearer " + credential
    request = urllib.request.Request(origin + route, headers=headers)
    try:
        response = opener.open(request, timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    with response:
        body = response.read()
        encoding = response.headers.get("Content-Encoding")
        decoded = gzip.decompress(body) if encoding == "gzip" else body if not encoding else None
        shown = (
            "content-type", "content-encoding", "cache-control", "vary",
            "content-security-policy", "content-security-policy-report-only",
            "strict-transport-security", "x-content-type-options", "referrer-policy",
            "x-frame-options", "permissions-policy", "cross-origin-opener-policy",
            "cross-origin-resource-policy",
        )
        return {
            "route": route,
            "authorizedRead": bool(credential),
            "status": response.getcode(),
            "responseBytes": len(body),
            "responseSha256": hashlib.sha256(body).hexdigest(),
            "decodedSha256": hashlib.sha256(decoded).hexdigest() if decoded is not None else None,
            "headers": {key: response.headers.get(key) for key in shown},
            "setCookiePresent": "Set-Cookie" in response.headers,
        }


if __name__ == "__main__":
    site = Path(sys.argv[1])
    output = Path(sys.argv[2])
    manifest = json.loads((site / "baseline-runtime.json").read_text())
    origin = "https://oliva-v04-private-preview.purplebean128.chatgpt.site"
    asset = next(entry["path"] for entry in manifest["files"] if entry["path"].endswith(".webp"))
    script = next(entry["path"] for entry in manifest["files"] if "/__common-" in entry["path"])
    font = next(entry["path"] for entry in manifest["files"] if "/CormorantGaramond." in entry["path"])
    routes = ["/", "/bibel", "/sw.js", "/manifest.webmanifest", "/" + asset, "/" + script, "/" + font]
    opener = urllib.request.build_opener(NoRedirect())
    credential = existing_credential() if "--authorized" in sys.argv[3:] else ""
    results = []
    for route in routes:
        results.append(inspect_response(opener, origin, route))
        if credential:
            results.append(inspect_response(opener, origin, route, credential))
    report = {
        "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "origin": origin,
        "redirectsFollowed": False,
        "credentialPersisted": False,
        "requests": results,
    }
    output.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps([{"route": row["route"], "authorized": row["authorizedRead"],
                      "status": row["status"], "type": row["headers"]["content-type"]}
                      for row in results]), flush=True)
