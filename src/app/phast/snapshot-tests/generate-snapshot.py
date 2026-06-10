"""
Parses SNAPSHOT: log lines from Karma output and writes a snapshot JSON file.

Usage (pipe from ng test):
  ng test ... 2>&1 | python3 generate-snapshot.py > snapshots/foo.snap.json

The script accepts the full Karma output and matches lines containing
"SNAPSHOT:<key>:<json>" regardless of the exact LOG prefix format, which
can vary between Karma versions and headless browser environments.
"""
import json, re, sys

# Match any line that contains a SNAPSHOT: marker, tolerating variation in
# Karma's log prefix (e.g. "LOG: '...'", "INFO: '...'", bare lines, etc.)
# Greedy (.+) is intentional — the trailing rstrip("'") handles any
# single-quote wrapping that Karma adds around the logged string.
SNAPSHOT_RE = re.compile(r"SNAPSHOT:([^:]+):(.+)$")
ANSI_RE = re.compile(r"\x1b\[[0-9;]*[A-Za-z]")

snapshot: dict = {}
errors: list[str] = []

for lineno, line in enumerate(sys.stdin, start=1):
    stripped = ANSI_RE.sub("", line).strip()
    m = SNAPSHOT_RE.search(stripped)
    if not m:
        continue
    key = m.group(1)
    raw_json = m.group(2).rstrip("'")
    try:
        snapshot[key] = json.loads(raw_json)
    except json.JSONDecodeError as exc:
        errors.append(f"Line {lineno}: failed to parse JSON for key '{key}': {exc} — raw: {raw_json!r}")

if errors:
    for err in errors:
        print(f"WARNING: {err}", file=sys.stderr)

if not snapshot:
    print(
        "ERROR: No SNAPSHOT entries found in input. "
        "Ensure GENERATE=true in the spec and that the test output is being piped correctly.",
        file=sys.stderr,
    )
    sys.exit(1)

print(json.dumps(snapshot, indent=2, sort_keys=True))
