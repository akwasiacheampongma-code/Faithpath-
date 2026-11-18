"""Offline scan. Reports pattern names and paths only, never matching values."""
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path
import argparse
import json
import os
import re
import subprocess


PATTERNS = {
    "GitHub token": rb"\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b",
    "OpenAI key": rb"(?<![\w-])sk-(?:proj-|svcacct-|admin-)?[A-Za-z0-9_-]{32,}\b",
    "AWS access key ID": rb"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b",
    "Google API key": rb"\bAIza[\w-]{35}\b",
    "Slack token": rb"\bxox[baprs]-[\w-]{20,}\b",
    "Private key block": rb"-----BEGIN (?:ENCRYPTED |RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----",
    "JWT-like value": rb"\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{14,}\.[A-Za-z0-9_-]{18,}\b",
    "Signed URL parameter": rb"[?&](?:X-Amz-Signature=[a-fA-F0-9]{32,}|sig=[\w%/+\-=]{25,})",
    "Literal authentication header": rb"(?i)\b(?:authorization|oai-sites-authorization):[ \t]*(?:bearer|basic|token)[ \t]+[A-Za-z0-9_./+\-=]{20,}",
    "Credential embedded in URL": rb"\bhttps?://[^/\s:<>\"']{1,70}:[^/\s@<>\"']{8,}@[^/\s<>\"']+",
    "Literal secret assignment": rb"(?im)\b(?:client_secret|api_key|access_token|auth_token|aws_secret_access_key)\b[\"']?[ \t]*[:=][ \t]*[\"'][A-Za-z0-9_/.+=-]{24,}[\"']",
}
rules = {name: re.compile(pattern) for name, pattern in PATTERNS.items()}
maximum = 12 * 1024 * 1024


def evidence(raw):
    return [name for name, rule in rules.items() if rule.search(raw)]


def scan(root):
    # Avoid tracing configuration or sending matches to any provider.
    env = {key: value for key, value in os.environ.items()
           if not (key.startswith("GIT_TRACE") or key in {"GIT_CURL_VERBOSE", "GH_DEBUG"})}

    def git(*args, data=None):
        return subprocess.run(["git", *args], input=data, cwd=root, env=env, check=True,
                              capture_output=True).stdout

    def safe_path(value):
        raw = value.encode("utf-8", "replace")
        return "[Pfad enthält ein Treffer-Muster]" if evidence(raw) else value

    tracked = {os.fsdecode(name) for name in git("ls-files", "--cached", "-z").split(b"\0") if name}
    current = Counter()
    current_hits = []
    for name in sorted(tracked):
        path = root / name
        if path.is_symlink() or not path.is_file():
            current["symlinkOrMissing"] += 1
        elif path.stat().st_size > maximum:
            current["aboveSizeLimit"] += 1
        else:
            raw = path.read_bytes()
            if b"\0" in raw[:8192]:
                current["binarySkipped"] += 1
                continue
            current["textScanned"] += 1
            hit = evidence(raw)
            if hit:
                current_hits.append({"path": safe_path(name), "patterns": hit})

    objects = {}
    for row in git("rev-list", "--objects", "--all").splitlines():
        oid, _, filename = row.partition(b" ")
        objects[oid] = os.fsdecode(filename)
    request = b"\n".join(objects) + b"\n"
    metadata = git("cat-file", "--batch-check", data=request).splitlines()
    targets = []
    history = Counter()
    for row in metadata:
        oid, kind, size = row.split()
        if kind != b"blob":
            continue
        history["reachableBlobs"] += 1
        if int(size) > maximum:
            history["aboveSizeLimit"] += 1
        else:
            targets.append(oid)

    history_hits = []
    with subprocess.Popen(["git", "cat-file", "--batch"], cwd=root, env=env,
                          stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL) as process:
        for oid in targets:
            process.stdin.write(oid + b"\n")
            process.stdin.flush()
            actual, kind, size = process.stdout.readline().split()
            assert actual == oid and kind == b"blob"
            raw = process.stdout.read(int(size))
            assert len(raw) == int(size) and process.stdout.read(1) == b"\n"
            if b"\0" in raw[:8192]:
                history["binarySkipped"] += 1
                continue
            history["textScanned"] += 1
            hit = evidence(raw)
            if hit:
                history_hits.append({"path": safe_path(objects[oid]), "blob": oid.decode(), "patterns": hit})
        process.stdin.close()
        assert process.wait() == 0

    return {
        "checkedAt": datetime.now(UTC).isoformat(),
        "head": git("rev-parse", "HEAD").decode().strip(),
        "trackedFiles": len(tracked), "worktree": dict(current), "history": dict(history),
        "patterns": sorted(rules), "currentCandidates": current_hits, "historicCandidates": history_hits,
        "limitations": [
            "Nur verfolgte Dateien und erreichbare Blobs aus lokalen Git-Refs, keine gelöschten oder nicht geholten Remote-Refs.",
            "Binärdateien, Archive und Dateien über 12 MiB sind ausgenommen. Keine rotierenden Werte, Hashlisten oder Zugangsdaten durch Onlineversuche geprüft.",
            "Ignorierte Dateien, Git-Konfiguration, Provider-Secrets, Shell-Historie und Nutzerprofile wurden nicht durchsucht.",
            "Patterntreffer sind Prüfkandidaten. Ein Nullbefund schließt unbekannte oder anders formatierte Zugangsdaten nicht aus.",
        ],
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("repository", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    result = scan(args.repository.resolve())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"tracked": result["trackedFiles"], "reachable": result["history"],
                      "currentCandidates": len(result["currentCandidates"]), "historicCandidates": len(result["historicCandidates"])}))
